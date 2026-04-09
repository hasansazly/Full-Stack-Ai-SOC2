import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Talosly — SOC 2 compliance that fixes gaps, not just flags them",
  description:
    "Talosly connects to your AWS and GitHub, finds the SOC 2 gaps blocking your enterprise deal, and generates the exact CLI commands and API calls to fix them. Used by B2B SaaS founders closing deals faster.",
  openGraph: {
    title: "Talosly — Close your enterprise deal. SOC 2 in 6 weeks.",
    description: "The only compliance platform that fixes your gaps automatically. Not just flags them.",
    url: "https://www.talosly.com",
    siteName: "Talosly",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Talosly — SOC 2 that fixes gaps, not flags them",
    description: "Connect AWS + GitHub. Get exact fixes. Close the deal."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] font-sans text-white">{children}</body>
    </html>
  );
}
