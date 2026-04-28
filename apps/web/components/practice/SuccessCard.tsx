"use client";

import Link from "next/link";
import { CheckCircle2, RotateCcw, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function SuccessCard({
  title,
  body,
  againLabel,
  moreLabel,
  onReset,
}: {
  title: string;
  body: string;
  againLabel: string;
  moreLabel: string;
  onReset: () => void;
}) {
  return (
    <div
      className="rounded-xl p-8 flex flex-col items-center gap-6 text-center"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 22 }}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: "var(--success-bg)",
          border: "2px solid var(--success)",
        }}
      >
        <CheckCircle2 size={40} style={{ color: "var(--success)" }} />
      </motion.div>

      <div>
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <p
          className="text-sm leading-relaxed max-w-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {body}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={onReset}
          className="btn-secondary flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-medium"
        >
          <RotateCcw size={14} />
          {againLabel}
        </button>
        <Link
          href="/chat"
          className="btn-cta flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-medium"
        >
          <MessageSquare size={14} />
          {moreLabel}
        </Link>
      </div>
    </div>
  );
}
