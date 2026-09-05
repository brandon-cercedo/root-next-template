"use client";

import { CommandId, getShortcutKeys } from "@/components/keyboard/config";
import Tooltip, { TooltipPlacement } from "@/components/ui/Tooltip";
import { useKeyboard } from "@/hooks/use-keyboard";

import KbdList from "./Kbd";

type ShortcutTooltipProps = {
  commandId: CommandId;
  children: React.ReactNode;
  placement?: TooltipPlacement;
};

export default function ShortcutTooltip({
  commandId,
  children,
  placement,
}: ShortcutTooltipProps) {
  const { shortcutsById } = useKeyboard();
  const command = shortcutsById.get(commandId);
  if (!command) {
    return children;
  }

  return (
    <Tooltip
      placement={placement}
      content={
        <span className="inline-flex items-center gap-2">
          {command.label}
          <KbdList keys={getShortcutKeys(command.shortcut)} size="xs" />
        </span>
      }
    >
      {children}
    </Tooltip>
  );
}
