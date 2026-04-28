"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EvmMachine, CANDIDATES } from "./EvmMachine";
import { VvpatSlip } from "./VvpatSlip";

export function EvmStep({
  votedFor,
  onVote,
  onConfirm,
  title,
  bodyPre,
  bodyPost,
  slipLabel,
  visibleFor,
  slipGone,
  confirmLabel,
}: {
  votedFor: number | null;
  onVote: (id: number) => void;
  onConfirm: () => void;
  title: string;
  bodyPre: string;
  bodyPost: string;
  slipLabel: string;
  visibleFor: string;
  slipGone: string;
  confirmLabel: string;
}) {
  const voted = CANDIDATES.find((c) => c.id === votedFor);

  return (
    <div
      className="rounded-xl p-6 sm:p-8 flex flex-col gap-5"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div>
        <p
          className="text-[10px] uppercase tracking-wider font-medium mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Step 5 of 6
        </p>
        <h2 className="text-lg mb-1" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {votedFor ? bodyPost : bodyPre}
        </p>
      </div>

      <EvmMachine votedFor={votedFor} onVote={onVote} />

      <AnimatePresence>
        {voted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VvpatSlip
              candidate={voted}
              slipLabel={slipLabel}
              visibleFor={visibleFor}
              slipGone={slipGone}
              confirmLabel={confirmLabel}
              onConfirm={onConfirm}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
