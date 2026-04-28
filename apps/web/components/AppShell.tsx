"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LanguageContext } from "@/components/LanguageContext";
import { useI18n } from "@/lib/useI18n";
import { CredibilityStrip } from "@/components/CredibilityStrip";

const NAV_I18N = {
  timeline:     "Timeline",
  ask:          "Ask",
  booth:        "Booth Finder",
  constituency: "Constituency",
  verify:       "Verify",
  practice:     "Practice",
  quiz:         "Quiz",
} as const;

function useNavLinks() {
  const pathname = usePathname();
  const nav = useI18n(NAV_I18N);
  return [
    { href: "/timeline",      label: nav.timeline },
    { href: "/chat",          label: nav.ask },
    { href: "/booth",         label: nav.booth },
    { href: "/constituency",  label: nav.constituency },
    { href: "/verify",        label: nav.verify },
    { href: "/practice",      label: nav.practice },
    { href: "/quiz",          label: nav.quiz },
  ].map((item) => ({ ...item, active: !!pathname?.startsWith(item.href) }));
}

function BrandMark() {
  return (
    <Link href="/" aria-label="Saksham">
      <span
        className="text-[20px] font-semibold leading-tight"
        style={{ color: "var(--accent-primary)", letterSpacing: "-0.01em" }}
      >
        Saksham
      </span>
    </Link>
  );
}

function NavLinks() {
  const links = useNavLinks();
  return (
    <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            item.active
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

function MobileMenu({ onClose }: { onClose: () => void }) {
  const links = useNavLinks();
  return (
    <nav className="md:hidden border-t px-2 py-3 space-y-0.5" aria-label="Mobile navigation">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className={`block px-3 py-2.5 rounded text-sm transition-colors ${
            item.active
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div className="relative grid h-dvh" style={{ gridTemplateRows: "auto 1fr auto" }}>
        <a href="#main-content" className="skip-to-main">Skip to main content</a>
        <header className="sticky top-0 z-50 border-b bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <BrandMark />
              <NavLinks />
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle onChange={setLanguage} />
              <button
                className="md:hidden flex items-center justify-center w-8 h-8 rounded transition-colors text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
          {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
        </header>

        <main id="main-content" className="overflow-y-auto overflow-x-hidden min-h-0">
          <CredibilityStrip />
          {children}
        </main>

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
