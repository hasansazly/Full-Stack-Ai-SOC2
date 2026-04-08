type PolicyType = "Access Control" | "Change Management";

type PolicyInput = {
  policyType: PolicyType;
  companyName: string;
  employeeCount: number;
  tools: string[];
};

export function generatePolicyDocument(input: PolicyInput) {
  const toolText = input.tools.length > 0 ? input.tools.join(", ") : "cloud and collaboration systems";

  if (input.policyType === "Access Control") {
    return `${input.companyName} Access Control Policy

Purpose
This policy defines how ${input.companyName} grants, reviews, and removes access to company systems in order to protect customer data, infrastructure, and business operations.

Scope
This policy applies to all employees, contractors, service accounts, and third parties with access to ${toolText}. It covers approximately ${input.employeeCount} personnel.

Policy Statements
1. Access must be approved by an authorized manager or system owner before it is provisioned.
2. Access is granted using the principle of least privilege and must align to job responsibilities.
3. Multi-factor authentication is required for administrative, remote, and production-impacting access.
4. Shared accounts are prohibited except for formally approved break-glass scenarios.
5. Access reviews must be completed at least quarterly for privileged roles and semi-annually for other business systems.
6. Access must be removed or adjusted within one business day of a role change or termination.

Roles and Responsibilities
- System owners approve access and validate least-privilege assignments.
- Managers confirm role-based need before access is granted or renewed.
- Security or IT administrators provision access, enforce MFA, and maintain review evidence.
- Personnel must protect credentials and report suspected compromise immediately.

Enforcement
Violations of this policy may result in suspension of access, disciplinary action, or termination of contracts as appropriate.

Review Cadence
This policy is reviewed at least annually and after significant changes to the system environment or organizational structure.`;
  }

  return `${input.companyName} Change Management Policy

Purpose
This policy defines how ${input.companyName} plans, reviews, approves, tests, and deploys changes to production systems and code.

Scope
This policy applies to application code, infrastructure, configurations, and operational procedures affecting ${toolText}. It covers approximately ${input.employeeCount} personnel.

Policy Statements
1. All production-impacting changes must be tracked in a version-controlled or ticketed workflow.
2. Changes must be reviewed by at least one qualified peer before deployment, except for approved emergency changes.
3. Automated testing and relevant validation checks must be completed before production release.
4. Direct changes to protected production branches or environments are prohibited unless documented under an emergency process.
5. Emergency changes must be reviewed retrospectively within one business day.
6. Change records must retain evidence of approvers, test results, deployment timing, and rollback considerations.

Roles and Responsibilities
- Engineering owners define technical implementation and testing requirements.
- Reviewers validate code quality, security impact, and deployment readiness.
- Release approvers confirm that high-risk changes have sufficient evidence and approvals.
- Security supports review of changes affecting authentication, authorization, infrastructure, or sensitive data.

Enforcement
Non-compliant changes may be blocked from deployment, reverted, or escalated to leadership depending on impact.

Review Cadence
This policy is reviewed at least annually and after material changes to deployment tooling, engineering structure, or customer commitments.`;
}
