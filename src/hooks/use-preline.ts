"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type PrelineModule = typeof import("preline/non-auto");

const PRELINE_CLASS_PREFIX = "hs-";
const PRELINE_INTERNAL_SELECTORS = [
  ".hs-overlay-backdrop",
  "[data-hs-overlay-backdrop-template]",
];

function hasPrelineSelector(element: Element) {
  const isInternal = PRELINE_INTERNAL_SELECTORS.some((selector) => {
    return element.matches(selector);
  });
  if (isInternal) {
    return false;
  }

  return Array.from(element.classList).some((token) => {
    return token.startsWith(PRELINE_CLASS_PREFIX);
  });
}

function hasPrelineElement(node: Node) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  // Check self
  const element = node as Element;
  if (hasPrelineSelector(element)) {
    return true;
  }

  // Check children
  return Array.from(element.querySelectorAll("[class]")).some(
    hasPrelineSelector
  );
}

function shouldInit(mutations: MutationRecord[]) {
  return mutations.some((mutation) => {
    if (mutation.type !== "childList") {
      return false;
    }
    return Array.from(mutation.addedNodes).some(hasPrelineElement);
  });
}

/**
 * Manage Preline initialization and re-initialization.
 *
 * @note Loads Preline once, then re-initializes on pathname changes
 * and when new plugin roots are added to the DOM.
 * @see {@link https://preline.co/docs/guides/nextjs.html | Using Preline UI with Next.js}
 */
export function usePreline() {
  const path = usePathname();
  const preline = useRef<PrelineModule>(undefined);

  const init = useCallback(
    (collections?: string | string[], delay: number = 100) => {
      return setTimeout(() => {
        try {
          preline.current?.HSStaticMethods.autoInit(collections);
        } catch (error) {
          console.error(error);
        }
      }, delay);
    },
    []
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleInit = () => {
      clearTimeout(timeoutId);
      timeoutId = init();
    };

    const observer = new MutationObserver((mutations) => {
      if (shouldInit(mutations)) {
        handleInit();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [init]);

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      if (!preline.current) {
        preline.current = await import("preline/non-auto");
      }

      if (isCancelled) {
        return;
      }

      timeoutId = init();
    };
    void load();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { init };
}
