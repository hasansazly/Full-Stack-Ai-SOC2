import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Talosly",
  description: "SOC 2 compliance, automated."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] font-sans text-white">{children}</body>
    </html>
  );
}
