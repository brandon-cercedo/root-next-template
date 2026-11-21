"use client";

import { useEffect, useEffectEvent, useRef } from "react";

/**
 * Runs `callback` once for each new `params` object.
 *
 * @note It is a safeguard to avoid Strict mode re-reruns the `callback` from
 * the effect.
 * @note Use it for one-time side effects driven by a prop or state object,
 * like sending a message or creating a record.
 * @note Pass a new object to run it again; equal values in a new object still run.
 */
export function useRun<T>(
  params: T | undefined,
  callback: (params: T) => void
) {
  const paramsRef = useRef<T>(undefined);
  const handleRun = useEffectEvent(callback);

  useEffect(() => {
    if (!params || paramsRef.current === params) {
      return;
    }

    paramsRef.current = params;
    handleRun(params);
  }, [params]);
}
