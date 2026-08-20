"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type StaticMethods = {
  autoInit: (collection?: string | string[]) => void;
};

const PRELINE_CLASS_PREFIX = "hs-";
const PRELINE_INTERNAL_SELECTORS = [
  ".hs-overlay-backdrop",
  "[data-hs-overlay-backdrop-template]",
];

function isPluginRoot(element: Element) {
  return Array.from(element.classList).some((token) => {
    return token.startsWith(PRELINE_CLASS_PREFIX);
  });
}

function isPrelineInternal(element: Element) {
  return PRELINE_INTERNAL_SELECTORS.some((selector) => {
    return element.closest(selector) !== null;
  });
}

function hasPluginRoot(node: Node) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const element = node as Element;
  if (isPrelineInternal(element)) {
    return false;
  }

  if (isPluginRoot(element)) {
    return true;
  }

  return Array.from(element.querySelectorAll("[class]")).some((child) => {
    return isPluginRoot(child) && !isPrelineInternal(child);
  });
}

function shouldInit(mutations: MutationRecord[]) {
  return mutations.some((mutation) => {
    if (mutation.type !== "childList") {
      return false;
    }

    return Array.from(mutation.addedNodes).some(hasPluginRoot);
  });
}

/**
 * Manage Preline initialization and re-initialization.
 *
 * @note Loads Preline once, then re-initializes on pathname changes
 * and when new plugin roots are added to the DOM.
 * @see {@link https://preline.co/docs/guides/nextjs.html}
 */
export function usePreline() {
  const path = usePathname();
  const previousPath = useRef(path);
  const isLoaded = useRef(false);
  const staticMethods = useRef<StaticMethods | null>(null);
  const debounceId = useRef<ReturnType<typeof setTimeout>>(undefined);

  const init = useCallback(
    (collections?: string | string[], delay: number = 100) => {
      return setTimeout(() => {
        const autoInit = staticMethods.current?.autoInit;
        if (typeof autoInit !== "function") {
          return;
        }

        try {
          autoInit(collections);
        } catch (error) {
          console.error(error);
        }
      }, delay);
    },
    []
  );

  const scheduleInit = useCallback(() => {
    if (debounceId.current) {
      clearTimeout(debounceId.current);
    }
    debounceId.current = init();
  }, [init]);

  useEffect(() => {
    let isCancelled = false;
    let observer: MutationObserver | null = null;
    let firstInitId: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      if (!isLoaded.current) {
        const preline = await import("preline/non-auto");
        if (isCancelled) {
          return;
        }

        staticMethods.current = preline.HSStaticMethods;
        isLoaded.current = true;
      }

      if (isCancelled) {
        return;
      }

      observer = new MutationObserver((mutations) => {
        if (shouldInit(mutations)) {
          scheduleInit();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      firstInitId = init();
    };

    void load();

    return () => {
      isCancelled = true;
      observer?.disconnect();
      if (debounceId.current) {
        clearTimeout(debounceId.current);
      }
      if (firstInitId) {
        clearTimeout(firstInitId);
      }
    };
  }, [init, scheduleInit]);

  useEffect(() => {
    if (previousPath.current === path) {
      return;
    }

    previousPath.current = path;
    const timeoutId = init();
    return () => clearTimeout(timeoutId);
  }, [path, init]);

  return { init };
}
