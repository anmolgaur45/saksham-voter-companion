"use client";

import { useState } from "react";
import { useI18n } from "@/lib/useI18n";
import {
  Users, Megaphone, Shield, FileText, FilePlus, ClipboardCheck,
  UserMinus, Mic, MicOff, CheckSquare, BarChart2, Award, ShieldOff,
  Circle, CheckCircle2, XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TimelinePhase } from "@/lib/api";

const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Users, Megaphone, Shield, FileText, FilePlus, ClipboardCheck,
  UserMinus, Mic, MicOff, CheckSquare, BarChart2, Award, ShieldOff,
};

function PhaseIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Circle;
  return <Icon className={className} size={16} />;
}

export function TimelineClient({ phases }: { phases: TimelinePhase[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = phases[selectedIndex] ?? null;
  const t = useI18n({
    heading: "Election Timeline",
    subheading: "The 13 phases of an Indian General Election, from voter roll revision to the declaration of results.",
    what_happens: "What happens",
    what_you_can_do: "What you can do",
    what_is_restricted: "What is restricted",
  });

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold">{t.heading}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t.subheading}</p>
      </div>

      {/* Timeline strip */}
      <div className="relative">
        {/* Connecting line — desktop only */}
        <div className="absolute top-9 left-0 right-0 h-px bg-border hidden md:block" />

        <div className="flex flex-col md:flex-row md:overflow-x-auto gap-2 md:gap-0 pb-1">
          {phases.map((phase, i) => {
            const isSelected = i === selectedIndex;
            return (
              <div
                key={phase.id}
                className="relative md:flex-shrink-0 md:w-36 flex md:flex-col md:items-center"
              >
                {/* Node dot — desktop */}
                <div
                  className={`hidden md:flex absolute top-7 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 items-center justify-center z-10 transition-colors ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                  }`}
                />

                {/* Card */}
                <button
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  className={`w-full md:mt-9 md:flex-1 md:flex md:flex-col text-left rounded border p-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                  }`}
                  aria-pressed={isSelected}
                  aria-label={phase.title}
                >
                  <div className="flex md:flex-col items-center md:items-start gap-2 md:w-full">
                    <div
                      className={`shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <PhaseIcon name={phase.icon_name} />
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-tight">{phase.title}</p>
                      {phase.duration && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {phase.duration}
                        </p>
                      )}
                    </div>
                    <span className="ml-auto md:hidden text-xs text-muted-foreground">
                      {i + 1}/{phases.length}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <Card key={selected.id} className="animate-in fade-in duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-primary shrink-0">
                <PhaseIcon name={selected.icon_name} />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base">{selected.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selected.short_description}
                </p>
              </div>
              {selected.duration && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {selected.duration}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                {t.what_happens}
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {selected.what_happens}
              </p>
            </div>

            {selected.what_citizens_can_do.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                    {t.what_you_can_do}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {selected.what_citizens_can_do.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2
                          className="mt-0.5 shrink-0 text-green-600"
                          size={14}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {selected.what_is_restricted.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                    {t.what_is_restricted}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {selected.what_is_restricted.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <XCircle
                          className="mt-0.5 shrink-0 text-destructive"
                          size={14}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {selected.source_citation && (
              <>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Source: {selected.source_citation}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
