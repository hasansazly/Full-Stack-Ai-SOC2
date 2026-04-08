import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Criterion = {
  code: string;
  name: string;
};

const criteria: Criterion[] = [
  { code: "CC1", name: "Control Environment" },
  { code: "CC2", name: "Communication & Information" },
  { code: "CC3", name: "Risk Assessment" },
  { code: "CC4", name: "Monitoring Activities" },
  { code: "CC5", name: "Control Activities" },
  { code: "CC6", name: "Logical Access" },
  { code: "CC7", name: "System Operations" },
  { code: "CC8", name: "Change Management" },
  { code: "CC9", name: "Risk Mitigation" }
];

function statusBadge(status: string) {
  switch (status) {
    case "Passing":
      return <Badge variant="low">Passing</Badge>;
    case "Critical gap":
      return <Badge variant="critical">Critical gap</Badge>;
    case "Gap found":
      return <Badge variant="high">Gap found</Badge>;
    case "Remediated":
      return <Badge variant="medium">Remediated</Badge>;
    default:
      return <Badge variant="neutral">Not collected</Badge>;
  }
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user?.id || "")
    .maybeSingle();

  const clientId = client?.id;

  const [{ data: gaps }, { data: evidence }, { data: remediations }] = await Promise.all([
    clientId
      ? supabase.from("gap_findings").select("*").eq("client_id", clientId)
      : Promise.resolve({ data: [] as any[] }),
    clientId
      ? supabase.from("evidence_artifacts").select("*").eq("client_id", clientId)
      : Promise.resolve({ data: [] as any[] }),
    clientId
      ? supabase
          .from("remediation_log")
          .select("*, gap_findings!inner(client_id)")
          .eq("gap_findings.client_id", clientId)
      : Promise.resolve({ data: [] as any[] })
  ]);

  const gapList = gaps || [];
  const evidenceList = evidence || [];
  const remediationList = remediations || [];

  const passing = gapList.filter((gap) => gap.status === "closed").length;
  const open = gapList.filter((gap) => gap.status === "open").length;

  const rows = criteria.map((criterion) => {
    const evidenceForControl = evidenceList.filter((item) => item.control === criterion.code);
    const gapsForControl = gapList.filter((item) => item.control === criterion.code);
    const openGaps = gapsForControl.filter((item) => item.status === "open");
    const remediated = gapsForControl.length > 0 && gapsForControl.every((item) => item.status !== "open");

    let status = "Not collected";
    if (evidenceForControl.length > 0 && openGaps.length === 0 && !remediated) status = "Passing";
    if (openGaps.some((item) => item.severity === "critical")) status = "Critical gap";
    else if (openGaps.length > 0) status = "Gap found";
    else if (remediated) status = "Remediated";

    return {
      ...criterion,
      status,
      lastEvidence: evidenceForControl[0]?.collected_at || "—",
      gaps: openGaps.length
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-white">Control Matrix</h1>
        <p className="mt-2 text-sm text-[#888888]">SOC 2 Common Criteria — real-time compliance status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Passing", value: passing, color: "text-[#22c55e]" },
          { label: "Gaps Found", value: open, color: "text-[#ef4444]" },
          { label: "Remediated", value: remediationList.length, color: "text-[#6366f1]" },
          { label: "Evidence Items", value: evidenceList.length, color: "text-[#d1d5db]" }
        ].map((stat) => (
          <Card key={stat.label} className="rounded-xl border border-[#2a2a2a] bg-[#141414]">
            <CardContent className="p-6">
              <p className="text-sm text-[#888888]">{stat.label}</p>
              <p className={`mt-3 text-3xl font-medium ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl border border-[#2a2a2a] bg-[#141414]">
        <CardHeader>
          <CardTitle className="text-white">Control Matrix</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto p-0">
          <table className="min-w-full divide-y divide-[#2a2a2a] text-sm">
            <thead className="bg-[#141414] text-left text-[#888888]">
              <tr>
                <th className="px-4 py-3 font-medium">Criteria</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Evidence</th>
                <th className="px-4 py-3 font-medium">Gaps</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {rows.map((row, index) => (
                <tr key={row.code} className={`${index % 2 === 0 ? "bg-[#141414]" : "bg-[#161616]"} hover:bg-[#1a1a1a]`}>
                  <td className="px-4 py-4 text-white">{row.code}</td>
                  <td className="px-4 py-4 text-[#d4d4d8]">{row.name}</td>
                  <td className="px-4 py-4">{statusBadge(row.status)}</td>
                  <td className="px-4 py-4 text-[#888888]">{row.lastEvidence === "—" ? row.lastEvidence : new Date(row.lastEvidence).toLocaleString()}</td>
                  <td className="px-4 py-4 text-[#d4d4d8]">{row.gaps}</td>
                  <td className="px-4 py-4">
                    {row.status === "Not collected" ? (
                      <Link href="/dashboard/evidence">
                        <Button className="bg-[#6366f1] hover:bg-[#5558e6]">Collect evidence</Button>
                      </Link>
                    ) : row.gaps > 0 ? (
                      <Link href={`/dashboard/gaps?control=${row.code}`}>
                        <Button variant="outline" className="border-[#2a2a2a] bg-transparent text-[#d4d4d8] hover:bg-[#1a1a1a]">
                          View gaps
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/dashboard/evidence">
                        <Button variant="outline" className="border-[#2a2a2a] bg-transparent text-[#d4d4d8] hover:bg-[#1a1a1a]">
                          View evidence
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
