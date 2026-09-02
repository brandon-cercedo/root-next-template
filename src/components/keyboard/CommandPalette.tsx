"use client";

import { Command } from "cmdk";
import { Check, LucideSearchX } from "lucide-react";
import { useEffect, useRef } from "react";

import { OVERLAY_IDS } from "@/components/constants";
import {
  COMMAND_GROUPS,
  CommandGroup,
  getShortcutKeys,
  KeyboardCommand,
} from "@/components/keyboard/config";
import { useKeyboard } from "@/hooks/use-keyboard";
import { useModal } from "@/hooks/use-modal";
import { useOverlay } from "@/hooks/use-overlay";
import { Theme, useTheme } from "@/hooks/use-theme";

import MessageWithImage from "../ui/MessageWithImage";
import Modal from "../ui/modal/modal";

import KbdList from "./Kbd";

function isActiveThemeCommand(
  command: KeyboardCommand,
  theme: Theme | undefined
) {
  switch (command.id) {
    case "theme-light":
      return theme === "light";
    case "theme-dark":
      return theme === "dark";
    case "theme-system":
      return theme === "system";
  }
  return false;
}

type CommandItemProps = {
  command: KeyboardCommand;
  theme: Theme | undefined;
};

function CommandEmpty() {
  return (
    <Command.Empty className="px-3 py-6 text-center text-[13px] text-gray-500 dark:text-neutral-400">
      <MessageWithImage
        title="No matching commands"
        image={
          <LucideSearchX
            className="size-10 flex-none text-gray-500 dark:text-neutral-400"
            strokeWidth={1}
          />
        }
        className="gap-2 px-2 py-3"
        titleClassName="text-[13px] leading-5 font-medium text-gray-500 dark:text-gray-400"
      />
    </Command.Empty>
  );
}

function CommandItem({ command, theme }: CommandItemProps) {
  const { close } = useOverlay();
  const isActiveTheme = isActiveThemeCommand(command, theme);

  return (
    <Command.Item
      key={command.id}
      value={command.label}
      keywords={[...(command.keywords ?? []), command.group]}
      onSelect={() => {
        command.run();
        void close(OVERLAY_IDS.COMMAND_PALETTE);
      }}
      className="flex cursor-pointer items-center gap-x-3 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 select-none hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden data-[selected=true]:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:data-[selected=true]:bg-neutral-700 dark:data-[selected=true]:text-neutral-300"
    >
      {command.icon}
      <span className="w-full truncate">{command.label}</span>
      {isActiveTheme && (
        <Check className="size-3.5 flex-none text-gray-500 dark:text-neutral-400" />
      )}
      {command.shortcut && (
        <KbdList keys={getShortcutKeys(command.shortcut)} />
      )}
    </Command.Item>
  );
}

function getCommandsByGroup(commands: KeyboardCommand[], group: CommandGroup) {
  return commands.filter((command) => {
    if (command.inPalette === false) {
      return false;
    }
    return command.group === group;
  });
}

type ContentProps = {
  theme: Theme | undefined;
  commands: KeyboardCommand[];
};

function Content({ theme, commands }: ContentProps) {
  const { isMounted } = useModal();
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteToggle = commands.find((command) => {
    return command.id === "toggle-palette";
  });

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const input = inputRef.current;
    if (!input) {
      return;
    }

    // Preline HSOverlay.focusElement() uses querySelector('[autofocus]').
    input.setAttribute("autofocus", "");
  }, [isMounted]);

  return (
    <Command
      label="Command menu"
      className="flex flex-col gap-2 overflow-hidden p-1"
      onKeyDown={(event) => {
        if (event.key !== "Enter") {
          return;
        }
        // Preline HSOverlay onEnter reopens the modal when Enter
        event.stopPropagation();
      }}
    >
      <div className="space-y-0.5 px-2 py-1">
        <div className="flex items-center gap-2">
          <Command.Input
            ref={inputRef}
            placeholder="Type a command or search…"
            className="block w-full rounded-lg border-0 bg-transparent px-0 py-1.5 text-[13px] leading-5 shadow-none ring-0 outline-none focus:border-0 focus:ring-0 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-400 dark:placeholder-neutral-500"
          />
          {paletteToggle?.shortcut && (
            <KbdList keys={getShortcutKeys(paletteToggle.shortcut)} />
          )}
        </div>
      </div>
      <Command.List className="max-h-96 scrollbar-thin overflow-y-auto overscroll-contain">
        <CommandEmpty />
        {COMMAND_GROUPS.map((group) => {
          const groupCommands = getCommandsByGroup(commands, group);
          if (groupCommands.length === 0) {
            return null;
          }

          return (
            <Command.Group
              key={group}
              heading={group}
              className="flex flex-col **:[[cmdk-group-heading]]:p-2 **:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:leading-5 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-gray-500 **:[[cmdk-group-heading]]:uppercase dark:**:[[cmdk-group-heading]]:text-neutral-500 **:[[cmdk-group-items]]:space-y-0.5"
            >
              {groupCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  command={command}
                  theme={theme}
                />
              ))}
            </Command.Group>
          );
        })}
      </Command.List>
    </Command>
  );
}

export default function CommandPalette() {
  const { commands } = useKeyboard();
  const { theme } = useTheme();

  if (commands.length === 0) {
    return null;
  }

  return (
    <Modal
      id={OVERLAY_IDS.COMMAND_PALETTE}
      className="shadow-xl"
      rootClassName="top-32"
      size="md"
      overlayOptions={{
        isClosePrev: false,
        backdropExtraClasses: "bg-transparent dark:bg-transparent",
      }}
      transition="scale"
    >
      <Content theme={theme} commands={commands} />
    </Modal>
  );
}
