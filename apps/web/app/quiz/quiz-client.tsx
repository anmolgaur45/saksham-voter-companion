"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, XCircle, RotateCcw, BookOpen, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/useI18n";
import questions from "@/data/quiz-questions.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

type AnswerState = "idle" | "correct" | "wrong";

// ─── Animation ────────────────────────────────────────────────────────────────

const slide = {
  enter: { x: 32, opacity: 0 },
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { x: -32, opacity: 0, transition: { duration: 0.18 } },
};

// ─── Confetti (lazy-loaded to avoid SSR issues) ───────────────────────────────

async function fireConfetti() {
  const { default: confetti } = await import("canvas-confetti");
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.55 },
    colors: ["#FF6B00", "#FFB347", "#4ADE80", "#60A5FA", "#F472B6"],
  });
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="space-y-1 mb-8">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Question {current + 1} of {total}
        </span>
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          {pct}%
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--accent-primary)" }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Option button ────────────────────────────────────────────────────────────

function OptionButton({
  text,
  index,
  selected,
  correct,
  answered,
  onClick,
}: {
  text: string;
  index: number;
  selected: boolean;
  correct: boolean;
  answered: boolean;
  onClick: () => void;
}) {
  let bg = "var(--bg-surface-2)";
  let border = "var(--border-default)";
  let color = "var(--text-secondary)";

  if (answered) {
    if (correct) {
      bg = "var(--success-bg)";
      border = "var(--success)";
      color = "var(--success)";
    } else if (selected && !correct) {
      bg = "rgba(239,68,68,0.1)";
      border = "#ef4444";
      color = "#ef4444";
    }
  } else if (selected) {
    bg = "var(--accent-soft-bg)";
    border = "var(--accent-primary)";
    color = "var(--accent-primary)";
  }

  const label = String.fromCharCode(65 + index); // A, B, C, D

  return (
    <button
      onClick={onClick}
      disabled={answered}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left transition-all duration-150"
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        cursor: answered ? "default" : "pointer",
      }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 transition-colors duration-150"
        style={{
          backgroundColor: answered && correct ? "var(--success)" : answered && selected ? "#ef4444" : "var(--border-strong)",
          color: answered ? "#fff" : "var(--text-muted)",
        }}
      >
        {answered && correct ? "✓" : answered && selected && !correct ? "✗" : label}
      </span>
      <span className="text-sm leading-snug transition-colors duration-150" style={{ color }}>
        {text}
      </span>
    </button>
  );
}

// ─── Explanation panel ────────────────────────────────────────────────────────

function ExplanationPanel({ text, isCorrect }: { text: string; isCorrect: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg px-4 py-3 flex gap-3 items-start"
      style={{
        backgroundColor: isCorrect ? "var(--success-bg)" : "rgba(239,68,68,0.08)",
        border: `1px solid ${isCorrect ? "var(--success)" : "#ef4444"}`,
      }}
    >
      {isCorrect ? (
        <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
      ) : (
        <XCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
      )}
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {text}
      </p>
    </motion.div>
  );
}

// ─── Score screen ─────────────────────────────────────────────────────────────

function ScoreScreen({
  score,
  total,
  t,
  onRetry,
}: {
  score: number;
  total: number;
  t: Record<string, string>;
  onRetry: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const tier = pct >= 80 ? "expert" : pct >= 60 ? "good" : "learning";

  const tierLabel = tier === "expert" ? t.tierExpert : tier === "good" ? t.tierGood : t.tierLearning;
  const tierColor = tier === "expert" ? "var(--success)" : tier === "good" ? "var(--warning)" : "var(--accent-primary)";
  const tierBg    = tier === "expert" ? "var(--success-bg)" : tier === "good" ? "rgba(234,179,8,0.1)" : "var(--accent-soft-bg)";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-8 flex flex-col items-center gap-6 text-center"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
    >
      {/* Score ring */}
      <div
        className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
        style={{ backgroundColor: tierBg, border: `2px solid ${tierColor}` }}
      >
        <span className="text-3xl font-semibold tabular-nums" style={{ color: tierColor }}>
          {score}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          / {total}
        </span>
      </div>

      {/* Tier badge */}
      <div>
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ backgroundColor: tierBg, color: tierColor, border: `1px solid ${tierColor}` }}
        >
          {tierLabel}
        </span>
        <h2 className="text-xl font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
          {t.scoreTitle}
        </h2>
        <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
          {pct >= 80
            ? t.scoreBodyExpert
            : pct >= 60
            ? t.scoreBodyGood
            : t.scoreBodyLearning}
        </p>
      </div>

      {/* Category breakdown */}
      <div
        className="w-full rounded-lg px-4 py-3"
        style={{ backgroundColor: "var(--bg-surface-2)", border: "1px solid var(--border-default)" }}
      >
        <p className="text-[11px] uppercase tracking-wider font-medium mb-2" style={{ color: "var(--text-muted)" }}>
          {t.yourScore}
        </p>
        <p className="text-2xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
          {pct}%
          <span className="text-sm font-normal ml-1.5" style={{ color: "var(--text-tertiary)" }}>
            ({score}/{total} {t.correct})
          </span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={onRetry}
          className="btn-secondary flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-medium flex-1"
        >
          <RotateCcw size={14} />
          {t.tryAgain}
        </button>
        <Link
          href="/chat"
          className="btn-cta flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-medium flex-1"
        >
          <BookOpen size={14} />
          {t.learnMore}
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuizClient() {
  const [index, setIndex]     = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [score, setScore]     = useState(0);
  const [done, setDone]       = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);

  const q = (questions as Question[])[index]!;
  const total = (questions as Question[]).length;

  const t = useI18n({
    heading:       "Election Process Quiz",
    subheading:    "Test your knowledge of the Indian voting process.",
    checkAnswer:   "Check answer",
    next:          "Next question",
    finish:        "See results",
    tierExpert:    "Expert voter",
    tierGood:      "Good knowledge",
    tierLearning:  "Keep learning",
    scoreTitle:    "Quiz complete",
    scoreBodyExpert:  "Excellent. You know the Indian election process well.",
    scoreBodyGood:    "Solid knowledge. A few areas to brush up on.",
    scoreBodyLearning: "Keep exploring. The chat can answer any question you have.",
    yourScore:     "Your score",
    correct:       "correct",
    tryAgain:      "Try again",
    learnMore:     "Ask AI",
  });

  // Fire confetti once when done with high score
  useEffect(() => {
    if (done && !confettiFired && score / total >= 0.8) {
      setConfettiFired(true);
      fireConfetti().catch(() => {});
    }
  }, [done, confettiFired, score, total]);

  function handleSelect(optionIndex: number) {
    if (answerState !== "idle") return;
    setSelected(optionIndex);
  }

  function handleCheck() {
    if (selected === null || answerState !== "idle") return;
    const isCorrect = selected === q.correct;
    setAnswerState(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore((s) => s + 1);
  }

  const handleNext = useCallback(() => {
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswerState("idle");
    }
  }, [index, total]);

  function handleRetry() {
    setIndex(0);
    setSelected(null);
    setAnswerState("idle");
    setScore(0);
    setDone(false);
    setConfettiFired(false);
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-lg font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
            {t.heading}
          </h1>
        </div>
        <ScoreScreen score={score} total={total} t={t} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
          {t.heading}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {t.subheading}
        </p>
      </div>

      <ProgressBar current={index} total={total} />

      <AnimatePresence mode="wait">
        <motion.div key={index} variants={slide} initial="enter" animate="center" exit="exit">
          <div
            className="rounded-xl p-6 sm:p-8 flex flex-col gap-5"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            {/* Category tag */}
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--accent-soft-bg)", color: "var(--accent-primary)" }}
              >
                {q.category.replace("_", " ")}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-base sm:text-[17px] font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
              {q.question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {q.options.map((opt, i) => (
                <OptionButton
                  key={i}
                  text={opt}
                  index={i}
                  selected={selected === i}
                  correct={i === q.correct}
                  answered={answerState !== "idle"}
                  onClick={() => handleSelect(i)}
                />
              ))}
            </div>

            {/* Explanation */}
            {answerState !== "idle" && (
              <ExplanationPanel text={q.explanation} isCorrect={answerState === "correct"} />
            )}

            {/* Action button */}
            <div className="flex justify-end">
              {answerState === "idle" ? (
                <button
                  onClick={handleCheck}
                  disabled={selected === null}
                  className="btn-cta flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.checkAnswer}
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="btn-cta flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium"
                >
                  {index + 1 >= total ? t.finish : t.next}
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
