import {
  GenerateCredentialReportCommand,
  GetAccountPasswordPolicyCommand,
  GetCredentialReportCommand,
  IAMClient,
  ListAttachedGroupPoliciesCommand,
  ListAttachedUserPoliciesCommand,
  ListGroupsCommand,
  ListMFADevicesCommand,
  ListUsersCommand,
} from "@aws-sdk/client-iam";

export type CollectedEvidence = {
  control: "CC6" | "CC8";
  source: string;
  raw_content: string;
};

export type AwsCollectionResult = {
  evidenceItems: CollectedEvidence[];
};

export const INVALID_AWS_CREDENTIAL_ERRORS = new Set(["InvalidClientTokenId", "AuthFailure"]);

type CredentialRow = Record<string, string>;

function parseCsv(csv: string) {
  const lines = csv.split("\n").filter((line) => line.trim());
  const headers = lines[0]?.split(",") ?? [];

  return lines.slice(1).map<CredentialRow>((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCredentialReportRows(iam: IAMClient) {
  await iam.send(new GenerateCredentialReportCommand({}));
  await wait(2000);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const report = await iam.send(new GetCredentialReportCommand({}));
      if (report.Content) {
        const csv = new TextDecoder().decode(report.Content);
        return parseCsv(csv);
      }
    } catch (error) {
      if (attempt === 5) {
        throw error;
      }
    }

    await wait(attempt >= 4 ? 2000 : 1500);
  }

  throw new Error("Credential report was not ready after retrying.");
}

export async function collectAwsEvidence(params: {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
}): Promise<AwsCollectionResult> {
  const iam = new IAMClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: params.awsAccessKeyId,
      secretAccessKey: params.awsSecretAccessKey,
    },
  });

  const evidenceItems: CollectedEvidence[] = [];

  const credentialRows = await getCredentialReportRows(iam);
  evidenceItems.push({
    control: "CC6",
    source: "AWS_CREDENTIAL_REPORT",
    raw_content: JSON.stringify(credentialRows),
  });

  const usersResponse = await iam.send(new ListUsersCommand({}));
  const users = usersResponse.Users ?? [];

  const userDetails = await Promise.all(
    users.map(async (user) => {
      const userName = user.UserName ?? "";
      const [attachedPoliciesResponse, mfaDevicesResponse] = await Promise.all([
        iam.send(new ListAttachedUserPoliciesCommand({ UserName: userName })),
        iam.send(new ListMFADevicesCommand({ UserName: userName })),
      ]);

      return {
        username: userName,
        arn: user.Arn ?? "",
        attached_policies: (attachedPoliciesResponse.AttachedPolicies ?? []).map((policy) => policy.PolicyName ?? ""),
        mfa_device_count: mfaDevicesResponse.MFADevices?.length ?? 0,
      };
    }),
  );

  evidenceItems.push({
    control: "CC6",
    source: "AWS_IAM_USERS",
    raw_content: JSON.stringify(userDetails),
  });

  let passwordPolicy: Record<string, unknown> | { exists: false } = { exists: false };
  try {
    const passwordPolicyResponse = await iam.send(new GetAccountPasswordPolicyCommand({}));
    passwordPolicy = passwordPolicyResponse.PasswordPolicy
      ? JSON.parse(JSON.stringify(passwordPolicyResponse.PasswordPolicy)) as Record<string, unknown>
      : { exists: false };
  } catch (error) {
    const errorName =
      typeof error === "object" && error !== null && "name" in error ? String((error as { name?: string }).name) : "";
    if (errorName !== "NoSuchEntity") {
      throw error;
    }
  }

  evidenceItems.push({
    control: "CC6",
    source: "AWS_PASSWORD_POLICY",
    raw_content: JSON.stringify(passwordPolicy),
  });

  const rootRow = credentialRows.find((row) => row.user === "<root_account>");
  const rootAccount = {
    root_mfa_active: rootRow?.mfa_active === "true",
    root_last_used: rootRow?.password_last_used ?? "",
    root_access_key_active: rootRow?.access_key_1_active === "true" || rootRow?.access_key_2_active === "true",
  };

  evidenceItems.push({
    control: "CC6",
    source: "AWS_ROOT_ACCOUNT",
    raw_content: JSON.stringify(rootAccount),
  });

  const groupsResponse = await iam.send(new ListGroupsCommand({}));
  const groupDetails = await Promise.all(
    (groupsResponse.Groups ?? []).map(async (group) => {
      const groupName = group.GroupName ?? "";
      const attachedPolicies = await iam.send(
        new ListAttachedGroupPoliciesCommand({
          GroupName: groupName,
        }),
      );

      return {
        group_name: groupName,
        arn: group.Arn ?? "",
        attached_policies: (attachedPolicies.AttachedPolicies ?? []).map((policy) => policy.PolicyName ?? ""),
      };
    }),
  );

  evidenceItems.push({
    control: "CC6",
    source: "AWS_IAM_GROUPS",
    raw_content: JSON.stringify(groupDetails),
  });

  return { evidenceItems };
}
