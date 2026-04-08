"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, LayoutDashboard, Settings, Shield, Wrench } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/evidence", label: "Evidence", icon: Shield },
  { href: "/dashboard/gaps", label: "Gaps", icon: AlertTriangle },
  { href: "/dashboard/remediation", label: "Remediation", icon: Wrench },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("Loading...");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || "Signed in");
    });
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white md:flex">
      <aside className="hidden w-[220px] flex-col justify-between border-r border-[#2a2a2a] bg-[#0f0f0f] p-4 md:flex">
        <div>
          <div className="mb-8 flex items-center gap-2 text-xl font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />
            <span>Talosly</span>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active ? "bg-[#6366f1] text-white" : "text-[#888888] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="space-y-3 border-t border-[#2a2a2a] pt-4">
          <p className="truncate text-sm text-[#888888]">{email}</p>
          <Button variant="outline" className="w-full border-[#2a2a2a] bg-transparent text-[#888888] hover:bg-[#1a1a1a] hover:text-white" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1">
        <div className="border-b border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 md:hidden">
          <div className="mb-3 flex items-center gap-2 text-lg font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />
            <span>Talosly</span>
          </div>
          <div className="flex gap-2 overflow-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                    active ? "bg-[#6366f1] text-white" : "bg-[#141414] text-[#888888]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <main className="min-h-screen bg-[#0a0a0a] p-8">{children}</main>
      </div>
    </div>
  );
}
