import { FindingsList } from "@/components/findings-list";
import { getGapFindings } from "@/lib/data";

export default async function FindingsPage() {
  const findings = await getGapFindings();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Gap Findings</p>
        <h1 className="mt-2 font-display text-5xl">Prioritized gaps mapped to buyer-ready controls.</h1>
      </div>
      <FindingsList findings={findings} />
    </main>
  );
}
