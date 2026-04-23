"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LanguageContext } from "@/components/LanguageContext";
import { useI18n } from "@/lib/useI18n";

const NAV_HREFS = ["/timeline", "/chat", "/booth", "/constituency", "/verify"] as const;

// Rendered inside LanguageContext.Provider so useI18n reads the correct language
function NavLinks() {
  const pathname = usePathname();
  const nav = useI18n({
    timeline: "Timeline",
    ask: "Ask",
    booth: "Booth Finder",
    constituency: "Constituency",
    verify: "Verify",
  });
  const links = [
    { href: NAV_HREFS[0], label: nav.timeline },
    { href: NAV_HREFS[1], label: nav.ask },
    { href: NAV_HREFS[2], label: nav.booth },
    { href: NAV_HREFS[3], label: nav.constituency },
    { href: NAV_HREFS[4], label: nav.verify },
  ];
  return (
    <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            pathname?.startsWith(item.href)
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div className="grid h-dvh" style={{ gridTemplateRows: "auto 1fr auto" }}>
        <header className="sticky top-0 z-50 border-b bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="font-semibold text-sm tracking-tight text-foreground"
                aria-label="Saksham home"
              >
                Saksham
              </Link>
              <NavLinks />
            </div>
            <LanguageToggle onChange={setLanguage} />
          </div>
        </header>

        <main className="overflow-y-auto overflow-x-hidden min-h-0">{children}</main>

        <footer className="border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 text-xs text-muted-foreground">
            <span>
              Built for Indian voters. Content sourced from the Election Commission of India.
            </span>
          </div>
        </footer>
      </div>
    </LanguageContext.Provider>
  );
}
