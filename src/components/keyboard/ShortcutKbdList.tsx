"use client";

import { CommandId } from "@/components/keyboard/config";
import { useKeyboard } from "@/hooks/use-keyboard";
import { getShortcutKeys } from "@/lib/keyboard";

import KbdList from "./Kbd";

type ShortcutKbdListProps = {
  commandId: CommandId;
  containerClassName?: string;
  className?: string;
};

export default function ShortcutKbdList({
  commandId,
  containerClassName,
  className,
}: ShortcutKbdListProps) {
  const { shortcutsById } = useKeyboard();
  const command = shortcutsById.get(commandId);
  if (!command) {
    return null;
  }

  return (
    <KbdList
      keys={getShortcutKeys(command.shortcut)}
      size="xs"
      containerClassName={containerClassName}
      className={className}
    />
  );
}
