"use client";

import { useState, useEffect } from "react";
import { TimelineClient } from "./timeline-client";
import { useLanguage } from "@/components/LanguageContext";
import { getTimeline } from "@/app/chat/actions";
import type { TimelinePhase } from "@/lib/api";

export function TimelineWithLanguage({
  initialPhases,
}: {
  initialPhases: TimelinePhase[];
}) {
  const { language } = useLanguage();
  const [phases, setPhases] = useState(initialPhases);

  useEffect(() => {
    if (language === "en") {
      setPhases(initialPhases);
      return;
    }
    getTimeline(language)
      .then(setPhases)
      .catch(() => {
        // keep current phases on error
      });
  }, [language]);

  return <TimelineClient phases={phases} />;
}
