"use client";

import { motion } from "framer-motion";

export const CANDIDATES = [
  { id: 1, symbol: "🌺", name: "Arjun Kumar",  party: "Lotus Alliance"    },
  { id: 2, symbol: "⚡", name: "Priya Sharma", party: "Progress Front"    },
  { id: 3, symbol: "🌿", name: "Rajan Mehta",  party: "People's Union"    },
  { id: 4, symbol: "✗",  name: "NOTA",          party: "None of the Above" },
] as const;

export type Candidate = (typeof CANDIDATES)[number];

export function EvmMachine({
  votedFor,
  onVote,
}: {
  votedFor: number | null;
  onVote: (id: number) => void;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden w-full max-w-sm mx-auto"
      style={{
        backgroundColor: "#1A2035",
        border: "2px solid #2E3B56",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="px-4 py-3 text-center"
        style={{ backgroundColor: "#141828", borderBottom: "1px solid #2E3B56" }}
      >
        <p
          className="text-[9px] font-medium tracking-[0.2em] uppercase"
          style={{ color: "#6B7489" }}
        >
          Election Commission of India
        </p>
        <p
          className="text-[11px] font-semibold tracking-widest uppercase mt-0.5"
          style={{ color: "#A8B1C2" }}
        >
          Electronic Voting Machine
        </p>
      </div>

      {CANDIDATES.map((c, i) => {
        const voted    = votedFor === c.id;
        const disabled = votedFor !== null && !voted;
        return (
          <div
            key={c.id}
            className="flex items-center gap-3 px-4 py-3 transition-colors duration-150"
            style={{
              backgroundColor: voted
                ? "rgba(30, 86, 255, 0.1)"
                : i % 2 === 0
                ? "#0F1625"
                : "#141828",
              borderBottom:
                i < CANDIDATES.length - 1 ? "1px solid #1F2A45" : "none",
            }}
          >
            <span className="text-base w-6 text-center flex-shrink-0" aria-hidden>
              {c.symbol}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{
                  color: voted ? "#F5F7FA" : disabled ? "#3A4666" : "#A8B1C2",
                }}
              >
                {c.name}
              </p>
              <p
                className="text-[11px] truncate"
                style={{ color: voted ? "#6B8AC8" : "#3A4666" }}
              >
                {c.party}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: voted ? "#4ADE80" : "#1F2A45",
                  boxShadow: voted ? "0 0 6px #4ADE80" : "none",
                }}
              />
              <motion.button
                onClick={() => !votedFor && onVote(c.id)}
                disabled={!!votedFor}
                whileTap={!votedFor ? { scale: 0.78 } : undefined}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200"
                style={{
                  backgroundColor: voted
                    ? "#3E76FF"
                    : disabled
                    ? "#1A2035"
                    : "#1E56FF",
                  color: voted || (!disabled && !votedFor) ? "#FFFFFF" : "#2A3656",
                  boxShadow: voted ? "0 0 12px rgba(62,118,255,0.55)" : "none",
                  cursor: votedFor ? "default" : "pointer",
                  border: `1px solid ${
                    voted
                      ? "#5A8FFF"
                      : disabled
                      ? "#2A3656"
                      : "#3368EF"
                  }`,
                }}
                aria-label={`Vote for ${c.name}`}
                aria-pressed={voted}
              >
                {voted ? "✓" : ""}
              </motion.button>
            </div>
          </div>
        );
      })}

      <div
        className="px-4 py-2 text-center"
        style={{ backgroundColor: "#0B111E", borderTop: "1px solid #2E3B56" }}
      >
        <p
          className="text-[9px] tracking-[0.15em] uppercase transition-colors duration-300"
          style={{ color: votedFor ? "#4ADE80" : "#4A5168" }}
        >
          {votedFor ? "● VOTE RECORDED" : "○ READY TO VOTE"}
        </p>
      </div>
    </div>
  );
}
