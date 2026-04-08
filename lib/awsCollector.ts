import {
  GenerateCredentialReportCommand,
  GetCredentialReportCommand,
  GetGroupPolicyCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  GetUserPolicyCommand,
  IAMClient,
  ListAttachedGroupPoliciesCommand,
  ListAttachedUserPoliciesCommand,
  ListGroupPoliciesCommand,
  ListGroupsForUserCommand,
  ListMFADevicesCommand,
  ListUserPoliciesCommand,
  ListUsersCommand
} from "@aws-sdk/client-iam";

import type { AwsScanSummary } from "@/lib/gapEngine";

type AwsScanInput = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

type CredentialReportRow = Record<string, string>;

function parseCsv(csv: string) {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0]?.split(",") ?? [];
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    return headers.reduce<CredentialReportRow>((acc, header, index) => {
      acc[header] = cells[index] ?? "";
      return acc;
    }, {});
  });
}

function normalizeStatements(document: unknown): Array<Record<string, unknown>> {
  const statements = (document as { Statement?: unknown })?.Statement;
  if (!statements) return [];
  return Array.isArray(statements) ? (statements as Array<Record<string, unknown>>) : [statements as Record<string, unknown>];
}

function statementAllowsWildcard(statement: Record<string, unknown>) {
  const effect = statement.Effect;
  const action = statement.Action;

  if (effect !== "Allow") {
    return false;
  }

  if (action === "*" || action === "iam:*") {
    return true;
  }

  if (Array.isArray(action)) {
    return action.includes("*") || action.includes("iam:*");
  }

  return false;
}

async function attachedPolicyIsAdmin(client: IAMClient, policyArn: string) {
  if (policyArn.includes("AdministratorAccess")) {
    return true;
  }

  const policy = await client.send(new GetPolicyCommand({ PolicyArn: policyArn }));
  const versionId = policy.Policy?.DefaultVersionId;
  if (!versionId) {
    return false;
  }

  const version = await client.send(
    new GetPolicyVersionCommand({
      PolicyArn: policyArn,
      VersionId: versionId
    })
  );

  const document = version.PolicyVersion?.Document;
  return normalizeStatements(document).some(statementAllowsWildcard);
}

async function inlineUserPolicyIsAdmin(client: IAMClient, userName: string, policyName: string) {
  const response = await client.send(
    new GetUserPolicyCommand({
      UserName: userName,
      PolicyName: policyName
    })
  );

  return normalizeStatements(response.PolicyDocument).some(statementAllowsWildcard);
}

async function inlineGroupPolicyIsAdmin(client: IAMClient, groupName: string, policyName: string) {
  const response = await client.send(
    new GetGroupPolicyCommand({
      GroupName: groupName,
      PolicyName: policyName
    })
  );

  return normalizeStatements(response.PolicyDocument).some(statementAllowsWildcard);
}

async function getCredentialReport(client: IAMClient) {
  await client.send(new GenerateCredentialReportCommand({}));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const report = await client.send(new GetCredentialReportCommand({}));
    if (report.Content) {
      return Buffer.from(report.Content).toString("utf-8");
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  throw new Error("Credential report was not ready after multiple attempts.");
}

export async function collectAwsIamEvidence(input: AwsScanInput): Promise<AwsScanSummary> {
  const client = new IAMClient({
    region: input.region,
    credentials: {
      accessKeyId: input.accessKeyId,
      secretAccessKey: input.secretAccessKey
    }
  });

  const usersResponse = await client.send(new ListUsersCommand({}));
  const credentialRows = parseCsv(await getCredentialReport(client));
  const credentialMap = new Map(credentialRows.map((row) => [row.user, row]));

  const users = await Promise.all(
    (usersResponse.Users ?? []).map(async (user) => {
      const userName = user.UserName ?? "unknown";
      const [attachedPolicies, groups, mfaDevices, userInlinePolicies] = await Promise.all([
        client.send(new ListAttachedUserPoliciesCommand({ UserName: userName })),
        client.send(new ListGroupsForUserCommand({ UserName: userName })),
        client.send(new ListMFADevicesCommand({ UserName: userName })),
        client.send(new ListUserPoliciesCommand({ UserName: userName }))
      ]);

      const groupPolicyDetails = await Promise.all(
        (groups.Groups ?? []).map(async (group) => {
          const groupName = group.GroupName ?? "";
          const [attachedGroupPolicies, inlineGroupPolicies] = await Promise.all([
            client.send(new ListAttachedGroupPoliciesCommand({ GroupName: groupName })),
            client.send(new ListGroupPoliciesCommand({ GroupName: groupName }))
          ]);

          return {
            groupName,
            attached: attachedGroupPolicies.AttachedPolicies ?? [],
            inline: inlineGroupPolicies.PolicyNames ?? []
          };
        })
      );

      const adminChecks = await Promise.all([
        ...((attachedPolicies.AttachedPolicies ?? []).map((policy) =>
          attachedPolicyIsAdmin(client, policy.PolicyArn ?? "")
        )),
        ...((userInlinePolicies.PolicyNames ?? []).map((policyName) =>
          inlineUserPolicyIsAdmin(client, userName, policyName)
        )),
        ...groupPolicyDetails.flatMap((group) => [
          ...group.attached.map((policy) => attachedPolicyIsAdmin(client, policy.PolicyArn ?? "")),
          ...group.inline.map((policyName) => inlineGroupPolicyIsAdmin(client, group.groupName, policyName))
        ])
      ]);

      const credentialRow = credentialMap.get(userName);
      const lastActivity =
        credentialRow?.password_last_used && credentialRow.password_last_used !== "N/A"
          ? credentialRow.password_last_used
          : null;

      return {
        userName,
        isAdmin: adminChecks.some(Boolean),
        hasMFA: (mfaDevices.MFADevices?.length ?? 0) > 0,
        lastActivity,
        groups: (groups.Groups ?? []).map((group) => group.GroupName ?? "").filter(Boolean),
        attachedPolicies: (attachedPolicies.AttachedPolicies ?? [])
          .map((policy) => policy.PolicyName ?? "")
          .filter(Boolean)
      };
    })
  );

  const adminUsers = users.filter((user) => user.isAdmin).length;
  const usersWithoutMFA = users.filter((user) => !user.hasMFA).length;
  const adminUsersWithoutMFA = users.filter((user) => user.isAdmin && !user.hasMFA).length;

  return {
    totalUsers: users.length,
    adminUsers,
    usersWithoutMFA,
    adminUsersWithoutMFA,
    users
  };
}
