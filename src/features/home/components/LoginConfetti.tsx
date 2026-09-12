"use client";

import { useEffect } from "react";

import { FullUser } from "@/actions/db/user";
import { completeLoginConfetti } from "@/actions/db/user-setting";
import { confettiSchoolPride } from "@/lib/confetti";

export default function LoginConfetti({ user }: { user: FullUser }) {
  const hasSeen = !!user.setting?.preferences.loginConfettiSeenAt;

  useEffect(() => {
    if (hasSeen) {
      return;
    }

    const run = () => {
      confettiSchoolPride();
      void completeLoginConfetti();
    };

    const timeoutId = setTimeout(() => {
      void run();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [hasSeen]);

  return null;
}
