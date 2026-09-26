"use client";

import { CommandId, getShortcutKeys } from "@/components/keyboard/config";
import Tooltip, { TooltipPlacement } from "@/components/ui/Tooltip";
import { useKeyboard } from "@/hooks/use-keyboard";

import KbdList from "./Kbd";

type ShortcutTooltipOptions = {
  placement?: TooltipPlacement;
  className?: string;
};

type ShortcutTooltipProps = {
  commandId: CommandId;
  children: React.ReactNode;
  tooltipOptions?: ShortcutTooltipOptions;
};

export default function ShortcutTooltip({
  commandId,
  children,
  tooltipOptions,
}: ShortcutTooltipProps) {
  const { shortcutsById } = useKeyboard();
  const command = shortcutsById.get(commandId);
  if (!command) {
    return children;
  }

  return (
    <Tooltip
      placement={tooltipOptions?.placement}
      className={tooltipOptions?.className}
      content={
        <span className="inline-flex items-center gap-2 text-nowrap">
          {command.label}
          <KbdList keys={getShortcutKeys(command.shortcut)} size="xs" />
        </span>
      }
    >
      {children}
    </Tooltip>
  );
}
