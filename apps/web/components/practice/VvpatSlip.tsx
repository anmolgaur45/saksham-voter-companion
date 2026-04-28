"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import type { Candidate } from "./EvmMachine";

export function VvpatSlip({
  candidate,
  slipLabel,
  visibleFor,
  slipGone,
  confirmLabel,
  onConfirm,
}: {
  candidate: Candidate;
  slipLabel: string;
  visibleFor: string;
  slipGone: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const [secs, setSecs] = useState(7);

  useEffect(() => {
    if (secs <= 0) return;
    const id = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secs]);

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <div
        className="w-full max-w-xs rounded-lg overflow-hidden mx-auto"
        style={{
          border: "1px solid var(--border-default)",
          backgroundColor: "var(--bg-surface-2)",
        }}
      >
        <p
          className="text-[9px] text-center tracking-widest uppercase py-2"
          style={{
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          {slipLabel}
        </p>
        <div
          className="my-3 mx-3 rounded p-4 text-center"
          style={{ backgroundColor: "#FFFDE7", border: "1px solid #F9A825" }}
        >
          <div className="text-3xl mb-1.5">{candidate.symbol}</div>
          <p className="text-sm font-semibold" style={{ color: "#212121" }}>
            {candidate.name}
          </p>
          <p className="text-xs" style={{ color: "#616161" }}>
            {candidate.party}
          </p>
        </div>
        <p
          className="text-[10px] text-center pb-2 transition-colors duration-500"
          style={{ color: secs > 0 ? "var(--warning)" : "var(--text-muted)" }}
        >
          {secs > 0 ? `${visibleFor} ${secs}s` : slipGone}
        </p>
      </div>

      <button
        onClick={onConfirm}
        className="btn-cta flex items-center gap-2 h-10 px-6 rounded-lg text-sm font-medium"
      >
        {confirmLabel}
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
