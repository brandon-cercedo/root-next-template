"use client";

import { Command } from "cmdk";
import {
  Check,
  Home,
  LogOut,
  LucideIcon,
  LucideSearchX,
  Monitor,
  Moon,
  PanelLeft,
  PartyPopper,
  Sun,
  ToggleLeft,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { OVERLAY_IDS } from "@/components/constants";
import { useModal } from "@/hooks/use-modal";
import { useOverlay } from "@/hooks/use-overlay";
import { Theme } from "@/hooks/use-theme";
import {
  COMMAND_GROUPS,
  CommandGroup,
  CommandId,
  getShortcutKeys,
  KeyboardCommand,
} from "@/lib/keyboard/commands";
import { mergeClsx } from "@/lib/utils/styles";

import MessageWithImage from "../ui/MessageWithImage";
import Modal from "../ui/modal/modal";

import KbdList from "./Kbd";

const COMMAND_ICONS: Partial<Record<CommandId, LucideIcon>> = {
  "theme-light": Sun,
  "theme-dark": Moon,
  "theme-system": Monitor,
  "toggle-sidebar": PanelLeft,
  "go-home": Home,
  "log-out": LogOut,
  confetti: PartyPopper,
  "open-flag-toolbar": ToggleLeft,
};

function getCommandsByGroup(commands: KeyboardCommand[], group: CommandGroup) {
  return commands.filter((command) => {
    if (command.inPalette === false) {
      return false;
    }
    return command.group === group;
  });
}

function Content({
  theme,
  commands,
}: {
  theme: Theme | undefined;
  commands: KeyboardCommand[];
}) {
  const { close } = useOverlay();
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
            autoFocus={false}
            placeholder="Type a command or search…"
            className="block w-full rounded-lg border-0 bg-transparent px-0 py-1.5 text-[13px] leading-5 shadow-none ring-0 outline-none focus:border-0 focus:ring-0 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-400 dark:placeholder-neutral-500"
          />
          {paletteToggle?.shortcut ? (
            <KbdList keys={getShortcutKeys(paletteToggle.shortcut)} />
          ) : null}
        </div>
      </div>
      <Command.List className="max-h-96 scrollbar-thin overflow-y-auto overscroll-contain">
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
              {groupCommands.map((command) => {
                const isThemeCommand = command.id.startsWith("theme-");
                const themeValue = command.id.replace("theme-", "") as Theme;
                const isActiveTheme = isThemeCommand && theme === themeValue;
                const Icon = COMMAND_ICONS[command.id];

                return (
                  <Command.Item
                    key={command.id}
                    value={[command.label, ...(command.keywords ?? [])].join(
                      " "
                    )}
                    onSelect={() => {
                      command.run();
                      void close(OVERLAY_IDS.COMMAND_PALETTE);
                    }}
                    className="flex cursor-pointer items-center gap-x-3 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 select-none hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden data-[selected=true]:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:data-[selected=true]:bg-neutral-700 dark:data-[selected=true]:text-neutral-300"
                  >
                    {Icon ? (
                      <Icon
                        className={mergeClsx(
                          "size-4 flex-none",
                          group === "Admin"
                            ? "text-indigo-600 dark:text-indigo-500"
                            : "text-gray-500 dark:text-neutral-400"
                        )}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="w-full truncate">{command.label}</span>
                    {isActiveTheme ? (
                      <Check className="size-3.5 flex-none text-gray-500 dark:text-neutral-400" />
                    ) : null}
                    {command.shortcut ? (
                      <KbdList keys={getShortcutKeys(command.shortcut)} />
                    ) : null}
                  </Command.Item>
                );
              })}
            </Command.Group>
          );
        })}
      </Command.List>
    </Command>
  );
}

type CommandPaletteProps = {
  theme: Theme | undefined;
  commands: KeyboardCommand[];
};

export default function CommandPalette({
  theme,
  commands,
}: CommandPaletteProps) {
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
