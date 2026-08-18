"use client";

import { Command } from "cmdk";
import { Check, LucideSearch } from "lucide-react";
import { useEffect, useRef } from "react";

import { OVERLAY_IDS } from "@/components/constants";
import Modal from "@/components/ui/modal/Modal";
import { Theme } from "@/hooks/use-theme";
import {
  COMMAND_GROUPS,
  CommandId,
  KEYBOARD_COMMANDS,
} from "@/lib/keyboard/commands";
import { mergeClsx } from "@/lib/utils/styles";

import Kbd from "./Kbd";
import "./command-palette.css";

type CommandPaletteProps = {
  isOpen: boolean;
  theme: Theme | undefined;
  onSelect: (id: CommandId) => void;
};

function getCommandsByGroup(group: (typeof COMMAND_GROUPS)[number]) {
  return KEYBOARD_COMMANDS.filter((command) => command.group === group);
}

export default function CommandPalette({
  isOpen,
  theme,
  onSelect,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  return (
    <Modal
      id={OVERLAY_IDS.COMMAND_PALETTE}
      trigger={null}
      size="md"
      overlayOptions={{ isClosePrev: false }}
      overlayClassName="[--has-autofocus:false]"
      className="command-palette overflow-hidden border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
    >
      <Command
        label="Command palette"
        className="flex flex-col text-[13px] leading-5"
      >
        <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 dark:border-neutral-700">
          <LucideSearch
            className="size-4 flex-none text-gray-400 dark:text-neutral-500"
            aria-hidden="true"
          />
          <Command.Input
            ref={inputRef}
            placeholder="Search actions..."
            className={mergeClsx(
              "text-[13px] leading-5 text-gray-800",
              "placeholder:text-gray-500 dark:text-neutral-200",
              "dark:placeholder:text-neutral-500"
            )}
          />
          <Kbd mac="⌘K" windows="Ctrl+K" />
        </div>
        <Command.List className="px-1 py-1">
          <Command.Empty>No results found.</Command.Empty>
          {COMMAND_GROUPS.map((group) => (
            <Command.Group key={group} heading={group}>
              {getCommandsByGroup(group).map((command) => {
                const isThemeCommand = command.id.startsWith("theme-");
                const themeValue = command.id.replace("theme-", "") as Theme;
                const isActiveTheme = isThemeCommand && theme === themeValue;

                return (
                  <Command.Item
                    key={command.id}
                    value={[command.label, ...(command.keywords ?? [])].join(
                      " "
                    )}
                    aria-checked={isActiveTheme ? true : undefined}
                    onSelect={() => onSelect(command.id)}
                    className={mergeClsx(
                      "flex items-center justify-between gap-3",
                      "rounded-lg px-2 py-1.5 text-gray-800",
                      "dark:text-neutral-200"
                    )}
                  >
                    <span className="truncate">{command.label}</span>
                    <span className="flex items-center gap-2">
                      {isActiveTheme ? (
                        <Check
                          className="size-3.5 flex-none text-gray-500 dark:text-neutral-400"
                          aria-hidden="true"
                        />
                      ) : null}
                      {command.kbdMac && command.kbdWindows ? (
                        <Kbd
                          mac={command.kbdMac}
                          windows={command.kbdWindows}
                        />
                      ) : null}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </Modal>
  );
}
