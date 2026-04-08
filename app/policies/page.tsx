import { PolicyGeneratorForm } from "@/components/policy-generator-form";

export default function PoliciesPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Policy Generator</p>
        <h1 className="mt-2 font-display text-5xl">Draft a policy your team can refine today.</h1>
        <p className="mt-4 text-muted-foreground">
          Start with rule-based templates for access control and change management, then tailor the language to your environment and review cadence.
        </p>
      </div>
      <PolicyGeneratorForm />
    </main>
  );
}
