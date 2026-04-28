"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", label: "EN",  ariaLabel: "English" },
  { code: "hi", label: "हिं", ariaLabel: "Hindi"   },
  { code: "ta", label: "தமி", ariaLabel: "Tamil"   },
  { code: "bn", label: "বাং", ariaLabel: "Bengali" },
];

const COOKIE_KEY = "saksham_lang";

function getLangFromCookie(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1] ?? "") : "en";
}

function setLangCookie(lang: string): void {
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(lang)}; path=/; max-age=31536000; SameSite=Lax`;
}

interface Props {
  onChange: (lang: string) => void;
}

export function LanguageToggle({ onChange }: Props) {
  const [active, setActive] = useState("en");

  useEffect(() => {
    const lang = getLangFromCookie();
    if (lang !== "en") {
      setActive(lang);
      onChange(lang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(code: string) {
    setActive(code);
    setLangCookie(code);
    document.documentElement.lang = code;
    onChange(code);
  }

  return (
    <div className="flex gap-1" role="group" aria-label="Select language">
      {LANGUAGES.map((l) => (
        <Button
          key={l.code}
          size="sm"
          variant={active === l.code ? "default" : "outline"}
          className="text-xs px-2 h-9 min-w-[44px]"
          onClick={() => select(l.code)}
          aria-pressed={active === l.code}
          aria-label={l.ariaLabel}
        >
          {l.label}
        </Button>
      ))}
    </div>
  );
}
