"use client";

import { LucideBug, LucideChevronRight } from "lucide-react";
import pluralize from "pluralize";

import Tooltip from "@/components/ui/Tooltip";
import { useFlag } from "@/hooks/use-flag";

function FlagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-normal text-indigo-700 dark:text-indigo-800">
      {children}
    </span>
  );
}

function FlagBadgeMore({ keys }: { keys: string[] }) {
  if (keys.length === 0) {
    return null;
  }

  return (
    <Tooltip
      content={
        <ul className="list-disc space-y-0.5 pl-3 text-left">
          {keys.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      }
      className="-mt-2"
      placement="top-right"
    >
      <FlagBadge>{`+${keys.length} more`}</FlagBadge>
    </Tooltip>
  );
}

export default function FlagsBadge() {
  const { values } = useFlag();
  const activeKeys = Object.entries(values ?? {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  if (activeKeys.length === 0) {
    return null;
  }

  const [key, ...moreKeys] = activeKeys;
  const title = pluralize("Flag", activeKeys.length);

  return (
    <div
      className="absolute bottom-4 left-4 z-1000000000 select-none"
      data-testid="flag-badge"
      role="status"
      aria-label={`${title} active`}
    >
      <span className="inline-flex items-center gap-x-1.5 rounded-full bg-indigo-600 px-2 py-1.5 text-xs font-medium text-white shadow-md dark:bg-indigo-500">
        <LucideBug aria-hidden="true" className="size-3 animate-bounce" />
        <span>{title}</span>
        <LucideChevronRight aria-hidden="true" className="size-3" />
        <FlagBadge>{key}</FlagBadge>
        {moreKeys.length > 0 && (
          <span className="text-[10px] font-normal">•</span>
        )}
        <FlagBadgeMore keys={moreKeys} />
      </span>
    </div>
  );
}
