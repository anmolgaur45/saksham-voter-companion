"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { translateContent } from "@/app/chat/actions";

// In-memory cache: "lang:text1\x00text2" → translated[]
const _cache = new Map<string, string[]>();

export function useI18n<T extends Record<string, string>>(source: T): T {
  const { language } = useLanguage();
  const [result, setResult] = useState<T>(source);

  useEffect(() => {
    if (language === "en") return;

    const keys = Object.keys(source) as (keyof T)[];
    const texts = keys.map((k) => source[k]);
    const cacheKey = language + ":" + texts.join("\x00");

    if (_cache.has(cacheKey)) {
      const cached = _cache.get(cacheKey)!;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(Object.fromEntries(keys.map((k, i) => [k, cached[i] ?? source[k]])) as T);
      return;
    }

    translateContent(texts, language)
      .then((translated) => {
        _cache.set(cacheKey, translated);
        setResult(Object.fromEntries(keys.map((k, i) => [k, translated[i] ?? source[k]])) as T);
      })
      .catch(() => {
        // keep English on error
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return language === "en" ? source : result;
}
