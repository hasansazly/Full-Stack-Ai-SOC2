import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import "@/app/globals.css";
import { SiteChrome } from "@/components/site-chrome";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talosly — SOC 2 that fixes gaps, not just flags them",
  description:
    "Connect AWS and GitHub. Get the exact CLI commands and API calls to fix your SOC 2 gaps. The only compliance platform that goes from evidence to remediation in one workflow. Used by B2B SaaS founders closing enterprise deals.",
  openGraph: {
    title: "Talosly — SOC 2 that fixes gaps, not just flags them",
    description: "Auto-remediation for SOC 2. Connect AWS + GitHub, get exact fixes, close the enterprise deal.",
    url: "https://www.talosly.com",
    siteName: "Talosly",
    type: "website",
    images: [
      {
        url: "https://www.talosly.com/og.png",
        width: 1200,
        height: 630
      }
    ]
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
      <body className={inter.className}>
        <SiteChrome>{children}</SiteChrome>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              border: "1px solid var(--border-bright)",
              color: "var(--text-primary)"
            }
          }}
        />
      </body>
    </html>
  );
}
