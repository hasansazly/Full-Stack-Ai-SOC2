"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ClientRecord = {
  id: string;
  company_name: string;
  tier: string;
};

export default function SettingsPage() {
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [awsOpen, setAwsOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      const { data } = await supabase.from("clients").select("*").eq("user_id", auth.user?.id || "").maybeSingle();
      setClient(data as ClientRecord | null);
      setCompanyName((data as ClientRecord | null)?.company_name || "");
    }
    load();
  }, []);

  async function save() {
    if (!client) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("clients").update({ company_name: companyName }).eq("id", client.id);
    setMessage(error ? error.message : "Company settings saved.");
    setSaving(false);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-medium text-white">Settings</h1>

      <Card className="rounded-xl border border-[#2a2a2a] bg-[#141414]">
        <CardHeader>
          <CardTitle className="text-white">Company</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#888888]">Tier</span>
            <Badge variant="medium">{client?.tier || "Readiness"}</Badge>
          </div>
          <Button className="bg-[#6366f1] hover:bg-[#5558e6]" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          {message ? <p className="text-sm text-[#888888]">{message}</p> : null}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-[#2a2a2a] bg-[#141414]">
        <CardHeader>
          <CardTitle className="text-white">Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-[#2a2a2a] p-4">
            <div>
              <p className="font-medium text-white">AWS</p>
              <p className="text-sm text-[#888888]">Not connected</p>
            </div>
            <Button variant="outline" className="border-[#2a2a2a] bg-transparent text-[#d4d4d8] hover:bg-[#1a1a1a]" onClick={() => setAwsOpen(true)}>
              Connect AWS
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#2a2a2a] p-4">
            <div>
              <p className="font-medium text-white">GitHub</p>
              <p className="text-sm text-[#888888]">Not connected</p>
            </div>
            <Button variant="outline" className="border-[#2a2a2a] bg-transparent text-[#d4d4d8] hover:bg-[#1a1a1a]" onClick={() => setGithubOpen(true)}>
              Connect GitHub
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={awsOpen} onOpenChange={setAwsOpen}>
        <DialogContent className="border-[#2a2a2a] bg-[#141414] text-white">
          <DialogTitle>Connect AWS</DialogTitle>
          <DialogDescription className="text-[#888888]">
            Create a read-only IAM role with SecurityAudit and ReadOnlyAccess. You&apos;ll enter credentials each time you collect evidence - Talosly never stores AWS keys.
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <Dialog open={githubOpen} onOpenChange={setGithubOpen}>
        <DialogContent className="border-[#2a2a2a] bg-[#141414] text-white">
          <DialogTitle>Connect GitHub</DialogTitle>
          <DialogDescription className="text-[#888888]">
            Create a Personal Access Token with repo:read and admin:org:read permissions. You&apos;ll provide it only when collecting evidence.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
