"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

import { completeLoginConfetti, FullUser } from "@/actions/db/user";

export default function LoginConfetti({ user }: { user: FullUser }) {
  const hasSeen = !!user.setting?.preferences.loginConfettiSeenAt;

  useEffect(() => {
    if (hasSeen) {
      return;
    }

    const run = () => {
      // Left bottom
      void confetti({
        particleCount: 250,
        spread: 80,
        startVelocity: 90,
        angle: 45,
        gravity: 1.5,
        scalar: 1.2,
        origin: { y: 1, x: 0 },
        shapes: ["square", "square", "circle"],
      });
      // Right bottom
      void confetti({
        particleCount: 250,
        spread: 80,
        startVelocity: 90,
        angle: 135,
        gravity: 1.5,
        scalar: 1.2,
        origin: { y: 1, x: 1 },
        shapes: ["square", "square", "circle"],
      });
      void completeLoginConfetti();
    };

    const timeoutId = setTimeout(() => {
      void run();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [hasSeen]);

  return null;
}
