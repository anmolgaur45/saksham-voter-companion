"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "ta", label: "தமி" },
  { code: "bn", label: "বাং" },
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
    const saved = getLangFromCookie();
    setActive(saved);
    onChange(saved);
  }, []);

  function select(code: string) {
    setActive(code);
    setLangCookie(code);
    onChange(code);
  }

  return (
    <div className="flex gap-1">
      {LANGUAGES.map((l) => (
        <Button
          key={l.code}
          size="sm"
          variant={active === l.code ? "default" : "outline"}
          className="text-xs px-2 h-7"
          onClick={() => select(l.code)}
        >
          {l.label}
        </Button>
      ))}
    </div>
  );
}
