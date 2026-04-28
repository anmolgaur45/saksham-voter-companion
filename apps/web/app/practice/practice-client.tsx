"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, UserCheck, Droplets, DoorOpen } from "lucide-react";
import { useI18n } from "@/lib/useI18n";
import { Stepper } from "@/components/practice/Stepper";
import { InstructionCard } from "@/components/practice/InstructionCard";
import { EvmStep } from "@/components/practice/EvmStep";
import { SuccessCard } from "@/components/practice/SuccessCard";

const STEP_ICONS = [MapPin, UserCheck, Droplets, DoorOpen] as const;

const slide = {
  enter: { x: 28, opacity: 0 },
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { x: -28, opacity: 0, transition: { duration: 0.18 } },
};

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
