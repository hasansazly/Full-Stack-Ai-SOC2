'use client'

import { useEffect, useMemo, useState } from "react";

type TerminalLine = {
  text: string;
  tone: "green" | "muted" | "yellow" | "red" | "white" | "indigo";
};

const toneMap: Record<TerminalLine["tone"], string> = {
  green: "var(--green)",
  muted: "var(--text-secondary)",
  yellow: "var(--yellow)",
  red: "var(--red)",
  white: "var(--text-primary)",
  indigo: "var(--indigo)",
};

type ScanTerminalProps = {
  lines: TerminalLine[];
  title?: string;
  compact?: boolean;
};

export function ScanTerminal({ lines, title = "talosly — scan", compact = false }: ScanTerminalProps) {
  const [visibleCount, setVisibleCount] = useState(1);
  const timing = useMemo(() => lines.length * 200 + 3000, [lines.length]);

  useEffect(() => {
    const step = window.setInterval(() => {
      setVisibleCount((current) => {
        if (current >= lines.length) {
          window.clearInterval(step);
          return current;
        }
        return current + 1;
      });
    }, 200);

    const reset = window.setInterval(() => {
      setVisibleCount(1);
    }, timing);

    return () => {
      window.clearInterval(step);
      window.clearInterval(reset);
    };
  }, [lines.length, timing]);

  const renderedLines = lines.slice(0, visibleCount);

  return (
    <div
      className="overflow-hidden rounded-[12px] border border-[var(--border-bright)] bg-[#0a0a0a] shadow-[0_0_0_1px_var(--border),0_20px_60px_rgba(0,0,0,0.5)]"
    >
      <div className="flex h-9 items-center justify-between bg-[#111] px-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="inline-block h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="inline-block h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <p className="text-xs text-[var(--text-muted)]">{title}</p>
        <div className="w-12" />
      </div>
      <div className={compact ? "p-4" : "p-5"}>
        <div className="space-y-2 font-mono text-xs sm:text-[13px]">
          {renderedLines.map((line, index) => (
            <p key={`${line.text}-${index}`} style={{ color: toneMap[line.tone] }}>
              {line.text}
              {index === renderedLines.length - 1 && renderedLines.length < lines.length ? (
                <span className="blink-cursor ml-1 text-[var(--text-primary)]">|</span>
              ) : null}
            </p>
          ))}
          {renderedLines.length === lines.length ? (
            <p className="text-[var(--text-primary)]">
              <span className="blink-cursor">|</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
