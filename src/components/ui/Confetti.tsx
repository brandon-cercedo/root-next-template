"use client";

import { useEffect, useRef } from "react";

const PRELINE_BURST = {
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  disableForReducedMotion: true,
};

type BurstOptions = {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  disableForReducedMotion?: boolean;
};

type ConfettiProps = {
  fire: boolean;
  onFired?: () => void;
} & BurstOptions;

export default function Confetti({
  fire,
  onFired,
  ...burstOverrides
}: ConfettiProps) {
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!fire || hasFiredRef.current) {
      return;
    }

    hasFiredRef.current = true;

    void import("canvas-confetti").then((mod) => {
      const confetti = mod.default;
      confetti({
        ...PRELINE_BURST,
        ...burstOverrides,
      });
      onFired?.();
    });
  }, [burstOverrides, fire, onFired]);

  return null;
}
