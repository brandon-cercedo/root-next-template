"use client";

import { HSDropdown, type ICollectionItem } from "preline/non-auto";
import { useCallback } from "react";

import { fixHTMLSelector } from "@/lib/utils/html";

const DROPDOWN_MAX_ATTEMPTS = 20;
const DROPDOWN_DELAY = 100;

async function getDropdownInstance(id: string) {
  if (typeof window === "undefined") {
    console.error("window is not available");
    return;
  }

  const selector = fixHTMLSelector(id);
  if (!selector) {
    console.error("Invalid dropdown selector");
    return;
  }

  for (let attempt = 0; attempt < DROPDOWN_MAX_ATTEMPTS; attempt++) {
    const isLastAttempt = attempt === DROPDOWN_MAX_ATTEMPTS - 1;

    try {
      const item = HSDropdown.getInstance(
        selector,
        true
      ) as ICollectionItem<HSDropdown> | null;
      if (item?.element) {
        return item.element;
      }

      if (isLastAttempt) {
        throw new Error("Dropdown instance was not found");
      }
    } catch (error) {
      if (isLastAttempt) {
        console.error("Failed to get dropdown instance", error);
      }
    } finally {
      if (!isLastAttempt) {
        await new Promise((resolve) => {
          setTimeout(resolve, DROPDOWN_DELAY);
        });
      }
    }
  }
}

export function useDropdown() {
  const getInstance = useCallback(
    async (id: string) => await getDropdownInstance(id),
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

  return { getInstance, open, close };
}
