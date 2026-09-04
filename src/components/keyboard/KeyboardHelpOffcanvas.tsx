"use client";

import { LucideSearch, LucideSearchX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";

import { OVERLAY_IDS } from "@/components/constants";
import {
  COMMAND_GROUPS,
  CommandGroup,
  getShortcutKeys,
  ShortcutCommand,
} from "@/components/keyboard/config";
import MessageWithImage from "@/components/ui/MessageWithImage";
import Offcanvas from "@/components/ui/modal/Offcanvas";
import { useKeyboard } from "@/hooks/use-keyboard";
import { useModal } from "@/hooks/use-modal";

import KbdList from "./Kbd";

function getCommandsByGroup(commands: ShortcutCommand[], group: CommandGroup) {
  return commands.filter((command) => command.group === group);
}

function ShortcutItem({ command }: { command: ShortcutCommand }) {
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
      <span className="text-[13px] leading-5 text-gray-800 dark:text-neutral-200">
        {command.label}
      </span>
      <KbdList keys={getShortcutKeys(command.shortcut)} />
    </div>
  );
}

type ContentProps = {
  commands: ShortcutCommand[];
};

function Content({ commands }: ContentProps) {
  const { isMounted } = useModal();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");

  const filteredCommands = useMemo(() => {
    const validSearchText = searchText.trim().toLowerCase();
    if (!validSearchText) {
      return commands;
    }

    return commands.filter((command) => {
      const keywords = command.keywords?.join(" ") ?? "";
      const targetText = `${command.label} ${command.group} ${keywords}`;
      return targetText.toLowerCase().includes(validSearchText);
    });
  }, [commands, searchText]);

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
    <Fragment>
      <div className="space-y-0.5 px-3 py-2">
        <span className="text-sm leading-5 font-medium text-gray-800 dark:text-gray-200">
          Keyboard Shortcuts
        </span>
      </div>
      <div className="flex flex-col space-y-0.5 p-1">
        <div className="px-2 py-1">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              className="block w-full rounded-lg border-gray-200 px-3 py-1.5 ps-9.5 text-[13px] leading-5 focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              placeholder="Search shortcuts..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 inset-s-0 z-20 flex items-center ps-3">
              <LucideSearch className="size-3.5 flex-none text-gray-400 dark:text-neutral-600" />
            </div>
          </div>
        </div>
        <div className="size-full scrollbar-thin overflow-y-auto overscroll-contain">
          {filteredCommands.length === 0 && searchText.trim() && (
            <MessageWithImage
              title="No matching shortcuts"
              image={
                <LucideSearchX
                  className="size-10 flex-none text-gray-500 dark:text-neutral-400"
                  strokeWidth={1}
                />
              }
              className="gap-2 px-2 py-6"
              titleClassName="text-[13px] leading-5 font-medium text-gray-500 dark:text-gray-400"
            />
          )}
          {COMMAND_GROUPS.map((group) => {
            const groupCommands = getCommandsByGroup(filteredCommands, group);
            if (groupCommands.length === 0) {
              return null;
            }

            return (
              <div key={group}>
                <div className="p-2 text-[10px] leading-5 font-medium text-gray-500 uppercase dark:text-neutral-500">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {groupCommands.map((command) => (
                    <ShortcutItem key={command.id} command={command} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Fragment>
  );
}

export default function KeyboardHelpOffcanvas() {
  const { shortcuts: commands } = useKeyboard();

  if (commands.length === 0) {
    return null;
  }

  return (
    <Offcanvas
      id={OVERLAY_IDS.KEYBOARD_HELP}
      className="divide-y divide-gray-200 dark:divide-neutral-700"
    >
      <Content commands={commands} />
    </Offcanvas>
  );
}
