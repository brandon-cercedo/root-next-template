"use client";

import { HSSelect, type ICollectionItem } from "preline/non-auto";
import { useCallback } from "react";

import { fixHTMLSelector } from "@/lib/utils/html";

const SELECT_MAX_ATTEMPTS = 20;
const SELECT_DELAY = 100;

async function getSelectInstance(id: string) {
  if (typeof window === "undefined") {
    console.error("window is not available");
    return;
  }

  const selector = fixHTMLSelector(id);
  if (!selector) {
    console.error("Invalid select selector");
    return;
  }

  for (let attempt = 0; attempt < SELECT_MAX_ATTEMPTS; attempt++) {
    const isLastAttempt = attempt === SELECT_MAX_ATTEMPTS - 1;

    try {
      const item = HSSelect.getInstance(
        selector,
        true
      ) as ICollectionItem<HSSelect> | null;
      if (item?.element) {
        return item.element;
      }
    } catch (error) {
      if (isLastAttempt) {
        console.error("Failed to get select instance", error);
        return;
      }
    }

    if (isLastAttempt) {
      console.error("Select instance was not found");
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, SELECT_DELAY);
    });
  }
}

export function useSelect() {
  const getInstance = useCallback(
    async (id: string) => await getSelectInstance(id),
    []
  );

  const open = useCallback(
    async (id: string) => {
      const instance = await getInstance(id);
      if (!instance) {
        return;
      }

      if (!instance.isOpened()) {
        instance.open();
      }
    },
    [getInstance]
  );

  const close = useCallback(
    async (id: string) => {
      const instance = await getInstance(id);
      if (!instance) {
        return;
      }

      if (instance.isOpened()) {
        instance.close();
      }
    },
    [getInstance]
  );

  const setValue = useCallback(
    async (id: string, value: string | string[]) => {
      const instance = await getInstance(id);
      if (!instance) {
        return;
      }

      instance.setValue(value);
    },
    [getInstance]
  );

  return { getInstance, open, close, setValue };
}
