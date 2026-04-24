"use client";

import { useLanguage } from "@/components/LanguageContext";

const STRIP_TEXT: Record<string, string> = {
  en: "Saksham is a non-partisan civic project. All answers are sourced from the Election Commission of India.",
  hi: "सक्षम एक गैर-पक्षपाती नागरिक परियोजना है। सभी उत्तर भारत के चुनाव आयोग के स्रोतों से लिए गए हैं।",
  ta: "சக்ஷம் ஒரு கட்சி சாராத குடிமை திட்டம். அனைத்து பதில்களும் இந்தியத் தேர்தல் ஆணையத்தின் ஆதாரங்களில் இருந்து எடுக்கப்பட்டவை.",
  bn: "সক্ষম একটি নিরপেক্ষ নাগরিক প্রকল্প। সমস্ত উত্তর ভারতের নির্বাচন কমিশনের উৎস থেকে নেওয়া হয়েছে।",
};

export function CredibilityStrip() {
  const { language } = useLanguage();
  const text = STRIP_TEXT[language] ?? STRIP_TEXT.en;

  return (
    <div
      className="min-h-8 flex items-center py-2"
      style={{
        backgroundColor: "var(--bg-surface-2)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <p
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 text-[12px] sm:text-[13px] leading-snug"
        style={{ color: "var(--text-secondary)", fontWeight: 400 }}
      >
        {text}
      </p>
    </div>
  );
}
