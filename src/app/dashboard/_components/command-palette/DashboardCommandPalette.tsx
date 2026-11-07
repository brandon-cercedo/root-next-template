"use client";

import { useState } from "react";

import CommandPalette from "@/components/keyboard/CommandPalette";

import { useCommandPaletteSearch } from "./hooks/use-command-palette-search";

export default function DashboardCommandPalette() {
  const [searchText, setSearchText] = useState("");
  const { groups } = useCommandPaletteSearch({ searchText });
  return (
    <CommandPalette
      groups={groups}
      searchText={searchText}
      shouldFilter={false}
      onSearch={setSearchText}
    />
  );
}
