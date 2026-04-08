import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/70 bg-white/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div>
          <p className="font-semibold">Talosly</p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Helping startups close enterprise deals faster by finding and fixing the security gaps buyers care about first.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium">Product</p>
          <Link href="/pricing" className="block text-muted-foreground hover:text-primary">
            Pricing
          </Link>
          <Link href="/trust" className="block text-muted-foreground hover:text-primary">
            Trust
          </Link>
          <Link href="/security" className="block text-muted-foreground hover:text-primary">
            Security
          </Link>
          <Link href="/dashboard?mode=sample" className="block text-muted-foreground hover:text-primary">
            Sample Workspace
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium">Company</p>
          <Link href="/about" className="block text-muted-foreground hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="block text-muted-foreground hover:text-primary">
            Contact
          </Link>
          <Link href="/book" className="block text-muted-foreground hover:text-primary">
            Book a readiness review
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium">Workflow</p>
          <Link href="/dashboard" className="block text-muted-foreground hover:text-primary">
            Dashboard
          </Link>
          <Link href="/findings" className="block text-muted-foreground hover:text-primary">
            Findings
          </Link>
          <Link href="/policies" className="block text-muted-foreground hover:text-primary">
            Policies
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4 text-sm text-muted-foreground">
        <p>Talosly is building the trust readiness layer for startup-to-enterprise sales.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
