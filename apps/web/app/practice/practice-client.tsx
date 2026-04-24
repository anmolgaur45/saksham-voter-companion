"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  UserCheck,
  Droplets,
  DoorOpen,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import { useI18n } from "@/lib/useI18n";

// ─── Static data ─────────────────────────────────────────────────────────────

const CANDIDATES = [
  { id: 1, symbol: "🌺", name: "Arjun Kumar",  party: "Lotus Alliance"    },
  { id: 2, symbol: "⚡", name: "Priya Sharma", party: "Progress Front"    },
  { id: 3, symbol: "🌿", name: "Rajan Mehta",  party: "People's Union"    },
  { id: 4, symbol: "✗",  name: "NOTA",          party: "None of the Above" },
] as const;

type Candidate = (typeof CANDIDATES)[number];

const STEP_ICONS = [MapPin, UserCheck, Droplets, DoorOpen] as const;

// ─── Animation ───────────────────────────────────────────────────────────────

const slide = {
  enter: { x: 28, opacity: 0 },
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { x: -28, opacity: 0, transition: { duration: 0.18 } },
};

// ─── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <div
      className="flex items-center justify-center mb-10"
      role="list"
      aria-label="Voting steps"
    >
      {Array.from({ length: 6 }, (_, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center" role="listitem">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all duration-200"
              style={{
                backgroundColor: done
                  ? "var(--success-bg)"
                  : active
                  ? "var(--accent-primary)"
                  : "var(--bg-surface-2)",
                color: done
                  ? "var(--success)"
                  : active
                  ? "var(--bg-canvas)"
                  : "var(--text-muted)",
                border: `1px solid ${
                  done
                    ? "var(--success)"
                    : active
                    ? "var(--accent-primary)"
                    : "var(--border-default)"
                }`,
              }}
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : i + 1}
            </div>
            {i < 5 && (
              <div
                className="w-6 sm:w-10 h-px flex-shrink-0"
                style={{
                  backgroundColor: done ? "var(--success)" : "var(--border-default)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Instruction card ────────────────────────────────────────────────────────

function InstructionCard({
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

// ─── EVM machine ─────────────────────────────────────────────────────────────

function EvmMachine({
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

// ─── VVPAT slip ──────────────────────────────────────────────────────────────

function VvpatSlip({
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

// ─── EVM step wrapper ─────────────────────────────────────────────────────────

function EvmStep({
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

// ─── Success card ─────────────────────────────────────────────────────────────

function SuccessCard({
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function PracticeClient() {
  const [step, setStep]       = useState(0);
  const [votedFor, setVotedFor] = useState<number | null>(null);

  const t = useI18n({
    heading:    "Practice Voting",
    subheading: "Walk through each step of the Indian voting process.",
    tipLabel:   "Did you know?",
    // Step 1
    s1title: "Arrive at Polling Booth",
    s1body:
      "On election day, go to the polling booth printed on your voter slip or found via the Voter Helpline app. Carry your EPIC card (voter ID) or one of the 12 ECI-approved photo IDs. Booths open at 7 AM and close at 6 PM in most constituencies.",
    s1tip:
      "Voters still in queue at 6 PM are entitled to vote. The booth cannot close until the last person in line has cast their ballot.",
    s1cta: "Enter Polling Station",
    // Step 2
    s2title: "Identity Verification",
    s2body:
      "A Booth Level Officer locates your name in the electoral roll register and verifies your photo ID. Once confirmed, your name is marked and you receive a voter slip with your serial number.",
    s2tip:
      "If your name is not in the register, check with the Presiding Officer. You cannot vote at a different booth, even if it is in the same constituency.",
    s2cta: "Proceed to Ink Marking",
    // Step 3
    s3title: "Indelible Ink Marking",
    s3body:
      "An indelible ink mark is applied to the nail and skin of your left index finger. This ink stays visible for 4–6 weeks and prevents double voting. It cannot be removed with soap or water.",
    s3tip:
      "India introduced indelible ink in 1962 and now manufactures and exports it to elections in over 25 countries worldwide.",
    s3cta: "Walk to Voting Compartment",
    // Step 4
    s4title: "Enter the Voting Compartment",
    s4body:
      "You step behind a screened partition for privacy. Inside is an Electronic Voting Machine (EVM). No phones, cameras, or companions are permitted. Take your time. There is no rush.",
    s4tip:
      "The secrecy of your vote is guaranteed by Section 128 of the Representation of the People Act, 1951.",
    s4cta: "Face the EVM",
    // EVM step (5)
    evmTitle:   "Cast Your Vote",
    evmBodyPre: "Press the blue button next to the candidate of your choice. A long beep confirms your vote.",
    evmBodyPost: "Your vote is recorded. The VVPAT slip is visible through the window below.",
    // VVPAT
    slipLabel:    "VVPAT · Voter Verified Paper Audit Trail",
    visibleFor:   "Visible for",
    slipGone:     "Slip destroyed automatically",
    exitBooth:    "Exit Booth",
    // Success (6)
    successTitle: "Vote Counted!",
    successBody:
      "Your vote is now securely recorded in the EVM. Exit the polling station and show your inked finger if asked. Your participation is the foundation of Indian democracy.",
    practiceAgain: "Practice again",
    askMore:       "Ask more questions",
  });

  function advance() {
    setStep((s) => Math.min(s + 1, 5));
  }

  function reset() {
    setStep(0);
    setVotedFor(null);
  }

  const instrData = [
    { num: 1, Icon: STEP_ICONS[0], title: t.s1title, body: t.s1body, tip: t.s1tip, cta: t.s1cta },
    { num: 2, Icon: STEP_ICONS[1], title: t.s2title, body: t.s2body, tip: t.s2tip, cta: t.s2cta },
    { num: 3, Icon: STEP_ICONS[2], title: t.s3title, body: t.s3body, tip: t.s3tip, cta: t.s3cta },
    { num: 4, Icon: STEP_ICONS[3], title: t.s4title, body: t.s4body, tip: t.s4tip, cta: t.s4cta },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-lg font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
          {t.heading}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {t.subheading}
        </p>
      </div>

      <Stepper current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {step < 4 && (
            <InstructionCard
              {...instrData[step]!}
              tipLabel={t.tipLabel}
              onContinue={advance}
            />
          )}
          {step === 4 && (
            <EvmStep
              votedFor={votedFor}
              onVote={setVotedFor}
              onConfirm={advance}
              title={t.evmTitle}
              bodyPre={t.evmBodyPre}
              bodyPost={t.evmBodyPost}
              slipLabel={t.slipLabel}
              visibleFor={t.visibleFor}
              slipGone={t.slipGone}
              confirmLabel={t.exitBooth}
            />
          )}
          {step === 5 && (
            <SuccessCard
              title={t.successTitle}
              body={t.successBody}
              againLabel={t.practiceAgain}
              moreLabel={t.askMore}
              onReset={reset}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
