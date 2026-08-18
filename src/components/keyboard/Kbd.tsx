"use client";

import { mergeClsx } from "@/lib/utils/styles";

type KbdProps = {
  mac: string;
  windows: string;
  className?: string;
};

function getIsMac() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
}

export default function Kbd({ mac, windows, className }: KbdProps) {
  const isMac = getIsMac();

  return (
    <kbd
      className={mergeClsx(
        "inline-flex min-h-5 min-w-5 items-center justify-center",
        "rounded border border-gray-200 bg-gray-50 px-1",
        "font-sans text-[11px] leading-none font-medium",
        "text-gray-500 dark:border-neutral-600 dark:bg-neutral-800",
        "dark:text-neutral-400",
        className
      )}
    >
      {isMac ? mac : windows}
    </kbd>
  );
}
