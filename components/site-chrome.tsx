'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = new Set([
  "/",
  "/demo",
  "/pricing",
  "/about",
  "/contact",
  "/book",
  "/trust",
  "/privacy",
  "/terms",
  "/security",
]);

const navLinks = [
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChrome = PUBLIC_ROUTES.has(pathname);

  if (!showChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(8,8,8,0.8)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--indigo)]" />
            Talosly
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 text-sm text-[var(--text-secondary)] transition duration-150 hover:text-[var(--text-primary)]"
              >
                {index === 0 && (
                  <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                    <span className="pulse-ring" />
                    <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                  </span>
                )}
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/book"
            className="rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-black transition hover:bg-[#e0e0e0]"
          >
            Book a call
          </Link>
        </div>
      </header>
      {children}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-7xl px-5 text-[13px] text-[var(--text-muted)] sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p>Talosly</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
            <a href="mailto:founders@talosly.com">founders@talosly.com</a>
          </div>
          <p className="mt-6 text-center">© 2026 Talosly. Built for founders closing enterprise deals.</p>
        </div>
      </footer>
    </>
  );
}

