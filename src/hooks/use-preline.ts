"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/**
 * Manage Preline initialization and re-initialization.
 *
 * @note Loads Preline once, then re-initializes on pathname changes.
 * @see {@link https://preline.co/docs/frameworks-nextjs.html | Install Preline UI with Next.js using Tailwind CSS}
 */
export function usePreline() {
  const path = usePathname();
  const isLoaded = useRef(false);

  const init = useCallback(
    (collections?: string | string[], delay: number = 100) => {
      return setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          window.HSStaticMethods &&
          typeof window.HSStaticMethods.autoInit === "function"
        ) {
          try {
            window.HSStaticMethods.autoInit(collections);
          } catch (error) {
            console.error(error);
          }
        }
      }, delay);
    },
    []
  );

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      if (!isLoaded.current) {
        await import("preline");
        isLoaded.current = true;
      }

      if (isCancelled) {
        return;
      }

      timeoutId = init();
    };

    void run();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { init };
}
