"use client";

import clsx from "clsx";
import { useState } from "react";

import CommandPalette from "@/components/keyboard/CommandPalette";
import KbdList from "@/components/keyboard/Kbd";
import { useChatSession } from "@/features/chat/hooks/use-chat-session";

import { useCommandPaletteSearch } from "./hooks/use-command-palette-search";

function TabKbd({ disabled }: { disabled: boolean }) {
  return (
    <div
      className={clsx("flex items-center gap-1", {
        "opacity-50": disabled,
      })}
    >
      <span className="p-0.5 text-[11px] text-nowrap text-gray-800 select-none dark:text-white">
        Ask chat
      </span>
      <KbdList keys={["Tab"]} size="xs" />
    </div>
  );
}

export default function DashboardCommandPalette() {
  const [searchText, setSearchText] = useState("");
  const { groups } = useCommandPaletteSearch({ searchText });
  const { openChat } = useChatSession();
  const isValidText = Boolean(searchText.trim());

  const handleTab = (text: string) => {
    openChat({ mode: "send", text });
  };

  return (
    <CommandPalette
      groups={groups}
      searchText={searchText}
      shouldFilter={false}
      searchSuffixes={[<TabKbd key="tab" disabled={!isValidText} />]}
      onSearch={setSearchText}
      onTab={handleTab}
    />
  );
}
