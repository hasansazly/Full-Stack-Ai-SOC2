"use client";

import { useState } from "react";

import { captureEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const toolOptions = ["AWS", "GitHub", "Google Workspace", "Slack"];

export function PolicyGeneratorForm() {
  const [companyName, setCompanyName] = useState("ClearAudit Demo Co.");
  const [employeeCount, setEmployeeCount] = useState("28");
  const [policyType, setPolicyType] = useState("Access Control");
  const [tools, setTools] = useState<string[]>(["AWS", "GitHub"]);
  const [document, setDocument] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/generate/policy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        employeeCount: Number(employeeCount),
        policyType,
        tools
      })
    });
    const payload = await response.json();
    setDocument(payload.document);
    captureEvent("policy_generated", { policy_type: policyType, tools });
    setLoading(false);
  }

  function toggleTool(tool: string) {
    setTools((current) => (current.includes(tool) ? current.filter((value) => value !== tool) : [...current, tool]));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form className="space-y-5 rounded-3xl border border-border bg-white p-6 shadow-soft" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company name</label>
          <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Employee count</label>
          <Input
            type="number"
            min="1"
            value={employeeCount}
            onChange={(event) => setEmployeeCount(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Policy type</label>
          <select
            className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm"
            value={policyType}
            onChange={(event) => setPolicyType(event.target.value)}
          >
            <option>Access Control</option>
            <option>Change Management</option>
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Tools used</p>
          <div className="grid gap-3">
            {toolOptions.map((tool) => (
              <label key={tool} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                <input
                  type="checkbox"
                  checked={tools.includes(tool)}
                  onChange={() => toggleTool(tool)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">{tool}</span>
              </label>
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full">
          {loading ? "Generating..." : "Generate Policy"}
        </Button>
      </form>
      <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
        <h2 className="font-semibold">Policy document</h2>
        <pre className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
          {document || "Your generated policy will appear here."}
        </pre>
      </div>
    </div>
  );
}
