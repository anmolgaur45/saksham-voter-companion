"use client";

import { createContext, useContext } from "react";

export interface LanguageCtx {
  language: string;
  setLanguage: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageCtx>({
  language: "en",
  setLanguage: () => {},
});

export function useLanguage(): LanguageCtx {
  return useContext(LanguageContext);
}
