"use client";

import { useEffect } from "react";
import { tinykeys } from "tinykeys";

import { KEYBOARD_CHORDS } from "@/lib/keyboard/commands";
import { isEditableTarget } from "@/lib/keyboard/is-editable-target";

type KeyboardShortcutHandlers = {
  togglePalette: () => void;
  openPalette: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  burstConfetti: () => void;
};

type UseKeyboardShortcutsOptions = {
  enabled?: boolean;
  isPaletteOpen: boolean;
  handlers: KeyboardShortcutHandlers;
};

export function useKeyboardShortcuts({
  enabled = true,
  isPaletteOpen,
  handlers,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const bindings: Record<string, (event: KeyboardEvent) => void> = {
      [KEYBOARD_CHORDS.TOGGLE_PALETTE]: (event) => {
        event.preventDefault();
        handlers.togglePalette();
      },
    };

    if (!isPaletteOpen) {
      bindings[KEYBOARD_CHORDS.OPEN_PALETTE] = (event) => {
        if (isEditableTarget(event.target)) {
          return;
        }

        event.preventDefault();
        handlers.openPalette();
      };
      bindings[KEYBOARD_CHORDS.TOGGLE_THEME] = (event) => {
        event.preventDefault();
        handlers.toggleTheme();
      };
      bindings[KEYBOARD_CHORDS.TOGGLE_SIDEBAR] = (event) => {
        event.preventDefault();
        handlers.toggleSidebar();
      };
      bindings[KEYBOARD_CHORDS.CONFETTI] = (event) => {
        event.preventDefault();
        handlers.burstConfetti();
      };
    }

    return tinykeys(window, bindings);
  }, [enabled, handlers, isPaletteOpen]);
}
