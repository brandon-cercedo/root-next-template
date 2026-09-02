"use client";

import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  defaultKeybindingsHandlerIgnore,
  KeybindingsMap,
  matchKeybindingPress,
  parseKeybinding,
  tinykeys,
} from "tinykeys";

import { DROPDOWN_IDS, OVERLAY_IDS } from "@/components/constants";
import {
  CommandActions,
  CommandId,
  getKeyboardCommands,
  getShortcutCommands,
  KeyboardCommand,
  ShortcutCommand,
} from "@/components/keyboard/config";
import { useDropdown } from "@/hooks/use-dropdown";
import { useOverlay } from "@/hooks/use-overlay";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/hooks/use-user";
import { confettiSchoolPride } from "@/lib/confetti";
import { paths } from "@/lib/config/paths";
import { isAdmin } from "@/lib/utils/db/user";
import { isEditableTarget } from "@/lib/utils/html";

type KeyboardContextType = {
  commands: KeyboardCommand[];
  shortcuts: ShortcutCommand[];
  shortcutsById: Map<CommandId, ShortcutCommand>;
  openHelp: () => void;
};

const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined
);

function isTogglePaletteEvent(
  event: KeyboardEvent,
  shortcut: ShortcutCommand
) {
  const chord = shortcut.shortcut.chord;
  const press = parseKeybinding(chord)[0];
  return press && matchKeybindingPress(event, press);
}

/**
 * @note By default, tinykeys ignores keyboard events from [contenteditable],
 * input, textarea, and select unless they are the event.currentTarget.
 */
export function KeyboardProvider({ children }: { children: ReactNode }) {
  const { open, toggle, isOpen } = useOverlay();
  const { open: openDropdown } = useDropdown();
  const { setTheme, color } = useTheme();
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

  const openHelp = () => {
    void open(OVERLAY_IDS.KEYBOARD_HELP);
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
    "open-keyboard-help": openHelp,
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
  const shortcutsById = new Map(
    shortcuts.map((command) => [command.id, command])
  );
  const togglePaletteShortcut = shortcutsById.get("toggle-palette");

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

    const unsubscribe = tinykeys(window, keybindings, {
      ignore: (event) => {
        if (
          togglePaletteShortcut &&
          isTogglePaletteEvent(event, togglePaletteShortcut)
        ) {
          return false;
        }
        return defaultKeybindingsHandlerIgnore(event);
      },
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcuts]);

  return (
    <KeyboardContext.Provider
      value={{ commands, shortcuts, shortcutsById, openHelp }}
    >
      {children}
    </KeyboardContext.Provider>
  );
}

export function useKeyboard() {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error("useKeyboard must be used within a KeyboardProvider");
  }
  return context;
}
