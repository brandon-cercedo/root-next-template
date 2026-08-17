"use client";

import { useEffect, useRef } from "react";

const DEFAULT_PARTICLE_COUNT = 100;
const DEFAULT_SPREAD = 70;

type Origin = { x?: number; y?: number };

const DEFAULT_ORIGIN: Origin = { y: 0.6 };

export type UseConfettiOptions = {
  fire: boolean;
  onFired?: () => void;
  particleCount?: number;
  spread?: number;
  origin?: Origin;
  disableForReducedMotion?: boolean;
};

export function useConfetti(options: UseConfettiOptions) {
  const {
    fire,
    onFired,
    particleCount = DEFAULT_PARTICLE_COUNT,
    spread = DEFAULT_SPREAD,
    origin = DEFAULT_ORIGIN,
    disableForReducedMotion = true,
  } = options;

  const onFiredRef = useRef(onFired);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    onFiredRef.current = onFired;
  }, [onFired]);

  useEffect(() => {
    if (!fire || hasFiredRef.current) {
      return;
    }

    // Lock before awaiting so Strict Mode cannot double-start.
    hasFiredRef.current = true;

    void (async () => {
      const { default: confetti } = await import("canvas-confetti");
      const animation = confetti({
        particleCount,
        spread,
        origin,
        disableForReducedMotion,
      });
      if (animation) {
        await animation;
      }
      onFiredRef.current?.();
    })();
  }, [fire, particleCount, spread, origin, disableForReducedMotion]);
}
