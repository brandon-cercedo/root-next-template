"use client";

import { LucideBug, LucideChevronRight } from "lucide-react";

import { useFlag } from "@/hooks/use-flag";

export default function DebugModeBadge() {
  const { values } = useFlag();
  const isClientDebug = Boolean(values?.["client-debug"]);
  const isServerDebug = Boolean(values?.["server-debug"]);

  if (!isClientDebug && !isServerDebug) {
    return null;
  }

  return (
    <div
      className="absolute bottom-4 left-4 z-1000000000 select-none"
      data-testid="debug-mode-badge"
      role="status"
      aria-label="Debug mode is on"
    >
      <span className="inline-flex items-center gap-x-1.5 rounded-full bg-indigo-600 px-2 py-1.5 text-xs font-medium text-white shadow-md dark:bg-indigo-500">
        <LucideBug aria-hidden="true" className="size-3 animate-bounce" />
        <span>Debug</span>
        <LucideChevronRight aria-hidden="true" className="size-3" />
        {isClientDebug && (
          <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-normal text-indigo-700 dark:text-indigo-800">
            Client
          </span>
        )}
        {isClientDebug && isServerDebug && (
          <span className="text-[10px] font-normal">•</span>
        )}
        {isServerDebug && (
          <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-normal text-indigo-700 dark:text-indigo-800">
            Server
          </span>
        )}
      </span>
    </div>
  );
}
