"use client";

import { ArrowRight } from "lucide-react";

export function InstructionCard({
  num,
  Icon,
  title,
  body,
  tip,
  tipLabel,
  cta,
  onContinue,
}: {
  num: number;
  Icon: React.ElementType;
  title: string;
  body: string;
  tip: string;
  tipLabel: string;
  cta: string;
  onContinue: () => void;
}) {
  return (
    <div
      className="rounded-xl p-6 sm:p-8 flex flex-col gap-5"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--accent-soft-bg)" }}
        >
          <Icon size={22} style={{ color: "var(--accent-primary)" }} />
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-wider font-medium mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Step {num} of 6
          </p>
          <h2 className="text-lg" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {body}
      </p>

      <div
        className="rounded-lg px-4 py-3"
        style={{
          backgroundColor: "var(--bg-surface-2)",
          borderLeft: "2px solid var(--info)",
        }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--info)" }}
        >
          {tipLabel}{" "}
        </span>
        <span className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {tip}
        </span>
      </div>

      <button
        onClick={onContinue}
        className="btn-cta flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium self-start"
      >
        {cta}
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
