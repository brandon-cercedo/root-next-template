"use client";

import { HSOverlay, type ICollectionItem } from "preline/non-auto";
import { useCallback } from "react";

import { fixHTMLSelector } from "@/lib/utils/html";

const OVERLAY_MAX_ATTEMPTS = 20;
const OVERLAY_DELAY = 100;

async function getOverlayInstance(id: string) {
  if (typeof window === "undefined") {
    console.error("window is not available");
    return;
  }

  const selector = fixHTMLSelector(id);
  if (!selector) {
    console.error("Invalid overlay selector");
    return;
  }

  for (let attempt = 0; attempt < OVERLAY_MAX_ATTEMPTS; attempt++) {
    const isLastAttempt = attempt === OVERLAY_MAX_ATTEMPTS - 1;

    try {
      const item = HSOverlay.getInstance(
        selector,
        true
      ) as ICollectionItem<HSOverlay> | null;
      if (item?.element) {
        return item.element;
      }
    } catch (error) {
      if (isLastAttempt) {
        console.error("Failed to get overlay instance", error);
        return;
      }
    }

    if (isLastAttempt) {
      console.error("Overlay instance was not found");
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, OVERLAY_DELAY);
    });
  }
}

export function useOverlay() {
  const getInstance = useCallback(
    async (id: string) => await getOverlayInstance(id),
    []
  );

  const open = useCallback(
    async (id: string) => {
      const instance = await getInstance(id);
      if (!instance) {
        return;
      }

      instance.open();
    },
    [getInstance]
  );

  const close = useCallback(
    async (id: string) => {
      const instance = await getInstance(id);
      if (!instance) {
        return;
      }

      instance.close();
    },
    [getInstance]
  );

  return { getInstance, open, close };
}
