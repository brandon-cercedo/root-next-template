"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { OVERLAY_IDS } from "@/components/constants";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useOverlay } from "@/hooks/use-overlay";
import { useCommandPaletteOverlay } from "@/hooks/use-overlay-open-state";
import { useTheme } from "@/hooks/use-theme";
import { burstConfetti } from "@/lib/confetti";
import { paths } from "@/lib/config/paths";
import { CommandId } from "@/lib/keyboard/commands";

import CommandPalette from "./CommandPalette";

type KeyboardProviderProps = {
  children: React.ReactNode;
};

export default function KeyboardProvider({ children }: KeyboardProviderProps) {
  const router = useRouter();
  const overlay = useOverlay();
  const { theme, setTheme, color } = useTheme();
  const isPaletteOpen = useCommandPaletteOverlay();

  const closePalette = useCallback(() => {
    void overlay.close(OVERLAY_IDS.COMMAND_PALETTE);
  }, [overlay]);

  const openPalette = useCallback(() => {
    void overlay.open(OVERLAY_IDS.COMMAND_PALETTE);
  }, [overlay]);

  const togglePalette = useCallback(() => {
    void overlay.toggle(OVERLAY_IDS.COMMAND_PALETTE);
  }, [overlay]);

  const toggleSidebar = useCallback(() => {
    void overlay.toggle(OVERLAY_IDS.SIDEBAR);
  }, [overlay]);

  const toggleTheme = useCallback(() => {
    if (!color) {
      return;
    }

    setTheme(color === "dark" ? "light" : "dark");
  }, [color, setTheme]);

  const runCommand = useCallback(
    (id: CommandId) => {
      switch (id) {
        case "theme-light":
          setTheme("light");
          break;
        case "theme-dark":
          setTheme("dark");
          break;
        case "theme-system":
          setTheme("system");
          break;
        case "toggle-sidebar":
          toggleSidebar();
          break;
        case "go-home":
          router.push(paths.dashboard.home());
          break;
        case "log-out":
          router.push(paths.auth.signOut());
          break;
        case "confetti":
          burstConfetti();
          break;
      }

      closePalette();
    },
    [closePalette, router, setTheme, toggleSidebar]
  );

  const shortcutHandlers = useMemo(
    () => ({
      togglePalette,
      openPalette,
      toggleTheme,
      toggleSidebar,
      burstConfetti,
    }),
    [openPalette, togglePalette, toggleSidebar, toggleTheme]
  );

  useKeyboardShortcuts({
    isPaletteOpen,
    handlers: shortcutHandlers,
  });

  return (
    <>
      {children}
      <CommandPalette
        isOpen={isPaletteOpen}
        theme={theme}
        onSelect={runCommand}
      />
    </>
  );
}
