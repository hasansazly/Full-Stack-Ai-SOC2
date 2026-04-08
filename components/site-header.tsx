import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TrackedLinkButton } from "@/components/tracked-link-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span>ClearAudit</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/pricing" className="hover:text-primary">
            Pricing
          </Link>
          <Link href="/trust" className="hover:text-primary">
            Trust
          </Link>
          <Link href="/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <Link href="/findings" className="hover:text-primary">
            Findings
          </Link>
          <Link href="/evidence" className="hover:text-primary">
            Evidence
          </Link>
          <Link href="/policies" className="hover:text-primary">
            Policies
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
          <TrackedLinkButton href="/book" event="book_call_clicked" size="sm">
            Book Review
          </TrackedLinkButton>
        </div>
      </div>
    </header>
  );
}
