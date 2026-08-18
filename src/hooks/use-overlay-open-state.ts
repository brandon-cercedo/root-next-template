"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { OVERLAY_IDS } from "@/components/constants";

export function useOverlayOpenState(id: string) {
  const [isOpen, setIsOpen] = useState(false);
  const listenersRef = useRef<{
    sync: () => void;
    element: HTMLElement;
  } | null>(null);

  const detachListeners = useCallback(() => {
    const current = listenersRef.current;
    if (!current) {
      return;
    }

    current.element.removeEventListener("open.hs.overlay", current.sync);
    current.element.removeEventListener("close.hs.overlay", current.sync);
    listenersRef.current = null;
  }, []);

  const attachListeners = useCallback(
    (element: HTMLElement) => {
      detachListeners();

      const sync = () => {
        setIsOpen(element.classList.contains("opened"));
      };

      element.addEventListener("open.hs.overlay", sync);
      element.addEventListener("close.hs.overlay", sync);
      listenersRef.current = { element, sync };
      sync();
    },
    [detachListeners]
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const existing = document.getElementById(id);
    if (existing) {
      attachListeners(existing);
    }

    const observer = new MutationObserver(() => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }

      if (listenersRef.current?.element === element) {
        return;
      }

      attachListeners(element);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      detachListeners();
    };
  }, [attachListeners, detachListeners, id]);

  return isOpen;
}

export function useCommandPaletteOverlay() {
  return useOverlayOpenState(OVERLAY_IDS.COMMAND_PALETTE);
}
