"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import type { HSOverlay, ICollectionItem } from "preline/non-auto";

type PrelineModule = typeof import("preline/non-auto");
type OverlayClass = PrelineModule["HSOverlay"];
type OverlayItem = ICollectionItem<HSOverlay>;

const PRELINE_CLASS_PREFIX = "hs-";
const PRELINE_DATA_ATTRIBUTES = ["data-hs-select"];
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

  const hasClass = Array.from(element.classList).some((token) => {
    return token.startsWith(PRELINE_CLASS_PREFIX);
  });
  if (hasClass) {
    return true;
  }

  return PRELINE_DATA_ATTRIBUTES.some((attribute) => {
    return element.hasAttribute(attribute);
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
  const selector = [
    "[class]",
    ...PRELINE_DATA_ATTRIBUTES.map((attribute) => `[${attribute}]`),
  ].join(", ");
  return Array.from(element.querySelectorAll(selector)).some(
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

function applyOpenedBreakpoint(overlayClass: OverlayClass, item: OverlayItem) {
  const { el, openedBreakpoint } = item.element;
  if (!openedBreakpoint) {
    return;
  }

  const isOpened = el.classList.contains("opened");
  const isAboveBreakpoint = document.body.clientWidth >= openedBreakpoint;
  if (isAboveBreakpoint && !isOpened) {
    overlayClass.setOpened(openedBreakpoint, item);
    return;
  }

  if (!isAboveBreakpoint && isOpened) {
    item.element.close(true);
  }
}

function shouldAutoClose(instance: HSOverlay) {
  const width = document.body.clientWidth;
  const breakpoint = instance.autoClose ?? 0;
  if (instance.autoCloseEqualityType === "less-than") {
    return width <= breakpoint;
  }

  return width >= breakpoint;
}

function applyAutoClose(instance: HSOverlay) {
  if (!instance.autoClose) {
    return;
  }

  const isOpened = instance.el.classList.contains("opened");
  if (shouldAutoClose(instance) && isOpened) {
    instance.close(true);
    return;
  }

  if (instance.isLayoutAffect && isOpened) {
    document.body.classList.add("hs-overlay-body-open");
  }
}

function getOverlayItems(overlayClass: OverlayClass) {
  const elements = document.querySelectorAll<HTMLElement>(".hs-overlay");
  return Array.from(elements)
    .map((element) => overlayClass.getInstance(element, true))
    .filter((item): item is OverlayItem => Boolean(item));
}

function syncOverlays(overlayClass: OverlayClass) {
  const items = getOverlayItems(overlayClass);
  items.forEach((item) => applyAutoClose(item.element));
  items.forEach((item) => applyOpenedBreakpoint(overlayClass, item));
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
    let resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleInit = () => {
      clearTimeout(timeoutId);
      timeoutId = init();
    };

    const handleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        const overlayClass = preline.current?.HSOverlay;
        if (!overlayClass) {
          return;
        }
        syncOverlays(overlayClass);
      }, 150);
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

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeoutId);
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
