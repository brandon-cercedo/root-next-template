"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { KeybindingsMap, tinykeys } from "tinykeys";

import { DROPDOWN_IDS, OVERLAY_IDS } from "@/components/constants";
import { useDropdown } from "@/hooks/use-dropdown";
import { useOverlay } from "@/hooks/use-overlay";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/hooks/use-user";
import { confettiSchoolPride } from "@/lib/confetti";
import { paths } from "@/lib/config/paths";
import {
  CommandActions,
  getKeyboardCommands,
  getShortcutCommands,
} from "@/lib/keyboard/commands";
import { isAdmin } from "@/lib/utils/db/user";
import { isEditableTarget } from "@/lib/utils/html";

import CommandPalette from "./CommandPalette";

export default function KeyboardCommands() {
  const { open, toggle, isOpen } = useOverlay();
  const { open: openDropdown } = useDropdown();
  const { theme, setTheme, color } = useTheme();
  const { user } = useUser();
  const router = useRouter();

  const openPalette = () => {
    void open(OVERLAY_IDS.COMMAND_PALETTE);
  };

  const togglePalette = () => {
    void toggle(OVERLAY_IDS.COMMAND_PALETTE);
  };

  const toggleSidebar = () => {
    void toggle(OVERLAY_IDS.SIDEBAR);
  };

  const toggleTheme = () => {
    if (!color) {
      return;
    }
    setTheme(color === "dark" ? "light" : "dark");
  };

  const actions: CommandActions = {
    "toggle-palette": togglePalette,
    "open-palette": openPalette,
    "toggle-theme": toggleTheme,
    "theme-light": () => setTheme("light"),
    "theme-dark": () => setTheme("dark"),
    "theme-system": () => setTheme("system"),
    "toggle-sidebar": toggleSidebar,
    "go-home": () => router.push(paths.dashboard.home()),
    "log-out": () => router.push(paths.auth.signOut()),
    confetti: confettiSchoolPride,
    ...(isAdmin(user)
      ? {
          "open-flag-toolbar": () => {
            void openDropdown(DROPDOWN_IDS.FLAG_TOOLBAR);
          },
        }
      : {}),
  };
  const commands = getKeyboardCommands(actions);
  const shortcuts = getShortcutCommands(commands);

  useEffect(() => {
    const keybindings = shortcuts.reduce<KeybindingsMap>((acc, command) => {
      const { id, shortcut, run } = command;

      acc[shortcut.chord] = async (event) => {
        switch (id) {
          // Allow "toggle-palette" even if palette is open
          case "toggle-palette":
            break;
          // Allow "open-palette" if target is not editable and palette is closed
          case "open-palette":
            if (isEditableTarget(event.target)) {
              return;
            }
            if (await isOpen(OVERLAY_IDS.COMMAND_PALETTE)) {
              return;
            }
            break;
          // Allow other commands if palette is closed
          default:
            if (await isOpen(OVERLAY_IDS.COMMAND_PALETTE)) {
              return;
            }
            break;
        }

        event.preventDefault();
        run();
      };

      return acc;
    }, {});

    if (Object.keys(keybindings).length === 0) {
      return;
    }
    const unsubscribe = tinykeys(window, keybindings);

    return () => {
      unsubscribe();
    };
  }, [shortcuts, isOpen]);

  return <CommandPalette theme={theme} commands={commands} />;
}
