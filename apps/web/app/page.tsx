"use client";

import Link from "next/link";
import { CalendarDays, MessageCircle, MapPin, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/useI18n";

export default function Home() {
  const t = useI18n({
    tagline: "Understand Indian elections in your language, step by step.",
    card1_title: "Explore the Election Timeline",
    card1_desc:
      "The 13 phases of a General Election, from voter roll revision to the declaration of results.",
    card2_title: "Ask a Question",
    card2_desc:
      "Get answers about voter registration, EVMs, the Model Code of Conduct, and your rights.",
    card3_title: "Find Your Polling Booth",
    card3_desc: "Search for polling stations by constituency or city and see them on a map.",
    card4_title: "Check a Claim",
    card4_desc: "Verify procedural claims against ECI sources.",
  });

  const PRIMARY_CARDS = [
    { href: "/timeline", icon: CalendarDays, title: t.card1_title, description: t.card1_desc },
    { href: "/chat",     icon: MessageCircle, title: t.card2_title, description: t.card2_desc },
    { href: "/booth",    icon: MapPin,        title: t.card3_title, description: t.card3_desc },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="max-w-2xl mb-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Saksham</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">{t.tagline}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        {PRIMARY_CARDS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group block h-full">
            <div className="flex flex-col gap-3 h-full border rounded-lg p-5 transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="max-w-xs">
        <Link href="/verify" className="group block">
          <div className="flex items-center gap-3 border rounded-lg px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ShieldCheck
              className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium">{t.card4_title}</p>
              <p className="text-xs text-muted-foreground">{t.card4_desc}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
