"use client";

import { useState, useEffect, useCallback } from "react";
import HeroState from "@/components/HeroState";
import OnboardingModal from "@/components/OnboardingModal";
import Dashboard from "@/components/Dashboard";

export interface Profile {
  name: string;
  firstTimeVoter: boolean;
  constituency: string;
  language: string;
}

const STORAGE_KEY = "saksham_profile";

export function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(stored ? (JSON.parse(stored) as Profile) : null);
  }, []);

  const handleOnboarded = useCallback((p: Profile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setProfile(p);
    setShowModal(false);
  }, []);

  if (profile === undefined) return null;

  if (profile === null) {
    return (
      <>
        <HeroState onStart={() => setShowModal(true)} />
        {showModal && (
          <OnboardingModal
            onComplete={handleOnboarded}
            onDismiss={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  return <Dashboard profile={profile} />;
}
