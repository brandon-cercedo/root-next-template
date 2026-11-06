"use client";

import { Command } from "cmdk";
import { LucideSearchX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { OVERLAY_IDS } from "@/components/constants";
import { getShortcutKeys, Shortcut } from "@/components/keyboard/config";
import { useKeyboard } from "@/hooks/use-keyboard";
import { useModal } from "@/hooks/use-modal";
import { useOverlay } from "@/hooks/use-overlay";

import MessageWithImage from "../ui/MessageWithImage";
import Modal from "../ui/modal/Modal";

import KbdList from "./Kbd";

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
        className="gap-2 px-2 py-6"
        titleClassName="text-[13px] leading-5 font-medium text-gray-500 dark:text-gray-400"
      />
    </Command.Empty>
  );
}

export type CommandPaletteItem = {
  id: string;
  value: string; // Must be unique: cmdk uses it to identify the row. Used for filtering.
  label: string;
  keywords?: string[]; // Used for filtering.
  shortcut?: Shortcut;
  icon?: React.ReactNode;
  run: () => void;
  renderSuffixes?: () => React.ReactNode[];
};

function CommandItem({ item }: { item: CommandPaletteItem }) {
  const { close } = useOverlay();
  const suffixes = [
    ...(item.renderSuffixes?.() ?? []),
    item.shortcut && (
      <KbdList key="shortcut" keys={getShortcutKeys(item.shortcut)} />
    ),
  ];

  return (
    <Command.Item
      value={item.value}
      keywords={item.keywords}
      onSelect={() => {
        item.run();
        void close(OVERLAY_IDS.COMMAND_PALETTE);
      }}
      className="flex cursor-pointer items-center gap-x-3 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 select-none hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden data-[selected=true]:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:data-[selected=true]:bg-neutral-700 dark:data-[selected=true]:text-neutral-300"
    >
      {item.icon}
      <span className="w-full truncate">{item.label}</span>
      {suffixes}
    </Command.Item>
  );
}

type CommandGroupProps = {
  group: CommandPaletteGroup;
};

function CommandGroup({ group }: CommandGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const total = group.items.length;
  const limit = group.limit ?? 0;
  const hasMore = !isExpanded && limit > 0 && total > limit;
  let items = [...group.items];

  if (hasMore) {
    items = items.slice(0, limit);
  }
  if (items.length === 0) {
    return null;
  }

  return (
    <Command.Group
      key={group.id}
      heading={group.heading}
      className="flex flex-col **:[[cmdk-group-heading]]:p-2 **:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:leading-5 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-gray-500 **:[[cmdk-group-heading]]:uppercase dark:**:[[cmdk-group-heading]]:text-neutral-500 **:[[cmdk-group-items]]:space-y-0.5"
    >
      {items.map((item) => (
        <CommandItem key={item.id} item={item} />
      ))}
      {hasMore && (
        <Command.Item
          value={`${group.id}-show-more`}
          onSelect={() => setIsExpanded(true)}
          className="flex cursor-pointer items-center gap-x-3 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 select-none hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden data-[selected=true]:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:data-[selected=true]:bg-neutral-700 dark:data-[selected=true]:text-neutral-300"
        >
          <span className="w-full truncate ps-7 text-xs text-gray-500 dark:text-neutral-400">
            Show {total - limit} more
            <span className="text-gray-400 dark:text-neutral-500">
              {` · ${total} total`}
            </span>
          </span>
        </Command.Item>
      )}
    </Command.Group>
  );
}

function Content({
  groups,
  searchText,
  shouldFilter,
  loop,
  onSearch,
}: CommandPaletteProps) {
  const { isMounted } = useModal();
  const inputRef = useRef<HTMLInputElement>(null);
  const { shortcutsById } = useKeyboard();
  const paletteToggle = shortcutsById.get("toggle-palette");

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
      shouldFilter={shouldFilter}
      loop={loop}
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
            value={searchText}
            onValueChange={onSearch}
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
        {groups.map((group) => (
          <CommandGroup
            key={`${group.id}-${searchText}`} // Hack to force re-render of CommandGroup when searchText changes.
            group={group}
          />
        ))}
      </Command.List>
    </Command>
  );
}

export type CommandPaletteGroup = {
  id: string;
  heading: string;
  limit?: number;
  items: CommandPaletteItem[];
};

type CommandPaletteProps = {
  groups: CommandPaletteGroup[];
  searchText?: string;
  shouldFilter?: boolean;
  loop?: boolean;
  onSearch?: (searchText: string) => void;
};

export default function CommandPalette({
  groups,
  searchText,
  shouldFilter = true,
  loop = true,
  onSearch,
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
      <Content
        groups={groups}
        searchText={searchText}
        shouldFilter={shouldFilter}
        loop={loop}
        onSearch={onSearch}
      />
    </Modal>
  );
}
