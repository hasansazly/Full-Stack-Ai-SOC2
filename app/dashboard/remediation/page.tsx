import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type RemediationRow = {
  id: string;
  approved_at: string | null;
  executed_at: string | null;
  execution_result: Record<string, unknown> | null;
  gap_findings: {
    control: string;
    finding: string;
    severity: string;
    status: string;
  } | null;
};

type SupabaseRemediationRow = {
  id: string;
  approved_at: string | null;
  executed_at: string | null;
  execution_result: Record<string, unknown> | null;
  gap_findings: Array<{
    control: string;
    finding: string;
    severity: string;
    status: string;
  }> | null;
};

function formatTimestamp(value: string | null) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function RemediationPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!client) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-white">Remediation Log</h1>
          <p className="mt-2 text-sm text-[#888888]">
            Your approved and executed fixes will appear here once you start remediating gaps.
          </p>
        </div>
      </div>
    );
  }

  const { data: logs, error } = await supabase
    .from("remediation_log")
    .select(
      `
        id,
        approved_at,
        executed_at,
        execution_result,
        gap_findings (
          control,
          finding,
          severity,
          status
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 text-sm text-[#ef4444]">
        Unable to load remediation history right now. Please try again shortly.
      </div>
    );
  }

  const remediationLogs: RemediationRow[] = ((logs ?? []) as SupabaseRemediationRow[]).map((log) => ({
    id: log.id,
    approved_at: log.approved_at,
    executed_at: log.executed_at,
    execution_result: log.execution_result,
    gap_findings: log.gap_findings?.[0] ?? null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-white">Remediation Log</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#888888]">
          Review every approved fix, its audit timestamp, and the execution result captured as evidence.
        </p>
      </div>

      {remediationLogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#111111] p-8 text-sm text-[#888888]">
          No remediation approvals yet. Open a gap with an auto-fix to approve your first remediation.
        </div>
      ) : (
        <div className="space-y-4">
          {remediationLogs.map((log) => (
            <article
              key={log.id}
              className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.01)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#2f325f] bg-[#17192c] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#a5b4fc]">
                      {log.gap_findings?.control ?? "Unknown control"}
                    </span>
                    <span className="rounded-full border border-[#2a2a2a] bg-[#111111] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#888888]">
                      {log.gap_findings?.severity ?? "unknown"}
                    </span>
                  </div>
                  <h2 className="text-base font-medium text-white">
                    {log.gap_findings?.finding ?? "Remediation entry"}
                  </h2>
                  <p className="text-sm text-[#888888]">
                    Approved {formatTimestamp(log.approved_at)}. Executed {formatTimestamp(log.executed_at)}.
                  </p>
                </div>

                <div className="rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-right text-xs text-[#888888]">
                  <div>Status</div>
                  <div className="mt-1 text-sm font-medium text-white">
                    {log.gap_findings?.status ?? "approved"}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#2a2a2a] bg-[#101010] p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#888888]">
                  Execution Result
                </div>
                <pre className="overflow-x-auto text-xs leading-6 text-[#cfcfcf]">
                  {JSON.stringify(
                    log.execution_result ?? { status: "Approval logged. Execution pending." },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
