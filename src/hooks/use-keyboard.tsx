"use client";

import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  defaultKeybindingsHandlerIgnore,
  KeybindingsMap,
  matchKeybindingPress,
  parseKeybinding,
  tinykeys,
} from "tinykeys";

import { OVERLAY_IDS } from "@/components/constants";
import {
  CommandId,
  KeyboardCommand,
  ShortcutCommand,
} from "@/components/keyboard/config";
import { useOverlay } from "@/hooks/use-overlay";
import { getShortcutCommands } from "@/lib/keyboard";
import { isEditableTarget } from "@/lib/utils/html";

type KeyboardContextType = {
  commands: KeyboardCommand[];
  commandsById: Map<CommandId, KeyboardCommand>;
  commandsByIdRef: RefObject<Map<CommandId, KeyboardCommand>>;
  shortcuts: ShortcutCommand[];
  shortcutsById: Map<CommandId, ShortcutCommand>;
};

const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined
);

function isShortcutEvent(event: KeyboardEvent, shortcut: ShortcutCommand) {
  const chord = shortcut.shortcut.chord;
  const press = parseKeybinding(chord)[0];
  return press && matchKeybindingPress(event, press);
}

type KeyboardProviderProps = {
  commands: KeyboardCommand[];
  children: ReactNode;
};

/**
 * @note By default, tinykeys ignores keyboard events from [contenteditable],
 * input, textarea, and select unless they are the event.currentTarget.
 */
export function KeyboardProvider({
  commands,
  children,
}: KeyboardProviderProps) {
  const { isOpen } = useOverlay();

  const commandsById = useMemo(
    () => new Map(commands.map((command) => [command.id, command])),
    [commands]
  );
  const shortcuts = getShortcutCommands(commands);
  const shortcutsById = useMemo(
    () => new Map(shortcuts.map((command) => [command.id, command])),
    [shortcuts]
  );
  const shortcutsInEditable = shortcuts.filter(
    (shortcut) => shortcut.inEditable
  );

  // Keep the latest commandsById for long-lived Chat callbacks.
  const commandsByIdRef = useRef(commandsById);
  useEffect(() => {
    commandsByIdRef.current = commandsById;
  }, [commandsById]);

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
        const isAllowedEvent = shortcutsInEditable.some((shortcut) =>
          isShortcutEvent(event, shortcut)
        );
        if (isAllowedEvent) {
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
      value={{
        commands,
        commandsById,
        commandsByIdRef,
        shortcuts,
        shortcutsById,
      }}
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
