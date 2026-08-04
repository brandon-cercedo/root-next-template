"use client";

import { Moon, Sun } from "lucide-react";
import dynamic from "next/dynamic";

import { useTheme } from "@/hooks/use-theme";

import { ThemeToggleLoading } from "./loading";

export const ThemeToggleDynamic = dynamic(() => import("./ThemeToggle"), {
  ssr: false,
  loading: () => <ThemeToggleLoading />,
});

export default function ThemeToggle() {
  const { setTheme, color } = useTheme();
  if (!color) {
    return null;
  }
  const nextColor = color === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(nextColor)}
      className="flex flex-none items-center justify-center rounded-full p-2 text-gray-800 transition-colors hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
      title={`Switch to ${nextColor} theme`}
    >
      {color === "dark" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}
