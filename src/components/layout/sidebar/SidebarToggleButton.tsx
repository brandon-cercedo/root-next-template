"use client";

import { LucideSidebarClose, LucideSidebarOpen } from "lucide-react";

import { OVERLAY_IDS } from "@/components/constants";
import ShortcutTooltip from "@/components/keyboard/ShortcutTooltip";

export default function SidebarToggleButton() {
  return (
    <ShortcutTooltip commandId="toggle-sidebar" placement="bottom-left">
      <button
        type="button"
        className="inline-flex size-6 flex-none items-center justify-center gap-x-1 rounded-lg text-[13px] leading-4 text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:bg-gray-200 focus:text-gray-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:text-neutral-400"
        aria-haspopup="dialog"
        aria-expanded={false}
        aria-controls={OVERLAY_IDS.SIDEBAR}
        data-hs-overlay={`#${OVERLAY_IDS.SIDEBAR}`}
      >
        <LucideSidebarClose className="hidden size-3.5 flex-none hs-overlay-layout-open:block" />
        <LucideSidebarOpen className="block size-3.5 flex-none hs-overlay-layout-open:hidden" />
        <span className="sr-only">Sidebar Toggle</span>
      </button>
    </ShortcutTooltip>
  );
}
