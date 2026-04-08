import Link from "next/link";
import { ArrowRight, Github, Shield, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Scan AWS",
    description: "Audit IAM users, MFA coverage, privileged access, and credential activity in one pass.",
    icon: UserCog
  },
  {
    title: "Scan GitHub",
    description: "Inspect branch protection, peer review, CI gates, and ownership gaps across repos.",
    icon: Github
  },
  {
    title: "Generate Fixes",
    description: "Turn findings into remediation guidance, questionnaire answers, and policy drafts.",
    icon: Shield
  }
];

export default function LandingPage() {
  return (
    <main>
      <section className="grain relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:flex lg:items-end lg:justify-between lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Security Review Readiness
            </p>
            <h1 className="max-w-4xl font-display text-5xl leading-tight text-foreground md:text-7xl">
              Find your security review blockers in minutes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              ClearAudit connects to AWS and GitHub, flags the controls most likely to stall enterprise deals, and gives your team an immediate remediation path.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">View Product Tour</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft lg:mt-0">
            <div className="space-y-4">
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-secondary-foreground">Latest scan summary</p>
                <p className="mt-2 text-3xl font-semibold text-secondary-foreground">7 blockers</p>
                <p className="mt-2 text-sm text-secondary-foreground/80">2 critical change-management issues and 1 privileged-access blocker need attention first.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">AWS users without MFA</p>
                  <p className="mt-1 text-2xl font-semibold">4</p>
                </div>
                <div className="rounded-3xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Repos at risk</p>
                  <p className="mt-1 text-2xl font-semibold">3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Features</p>
            <h2 className="mt-2 font-display text-4xl">Built for the first serious buyer review.</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="grain">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="pt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
