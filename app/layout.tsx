import type { Metadata } from "next";
import { Suspense } from "react";

import "@/app/globals.css";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Talosly",
  description: "Compliance gap detection for startup security reviews."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </AnalyticsProvider>
        </Suspense>
      </body>
    </html>
  );
}
