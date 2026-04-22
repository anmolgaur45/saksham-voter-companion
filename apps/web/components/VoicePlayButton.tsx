"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { synthesizeSpeech } from "@/app/chat/actions";

interface Props {
  text: string;
  language: string;
}

export function VoicePlayButton({ text, language }: Props) {
  const [loading, setLoading] = useState(false);

  if (language === "en") return null;

  async function play() {
    setLoading(true);
    try {
      const audioB64 = await synthesizeSpeech(text, language);
      const binary = atob(audioB64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      // silently fail — TTS is a non-critical enhancement
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-6 w-6 p-0 mt-1"
      onClick={play}
      disabled={loading}
      aria-label="Play audio"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
    </Button>
  );
}
