"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import dynamic from "next/dynamic";

import { Theme, useTheme } from "@/hooks/use-theme";
import { mergeClsx } from "@/lib/utils/styles";

import { ThemeSelectorLoading } from "./loading";

const THEME_OPTIONS: {
  value: Theme;
  icon: React.ElementType;
  label: string;
}[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export const ThemeSelectorDynamic = dynamic(() => import("./ThemeSelector"), {
  ssr: false,
  loading: () => <ThemeSelectorLoading />,
});

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  if (!theme) {
    return null;
  }
  return (
    <div className="inline-flex cursor-pointer items-center rounded-full bg-gray-50 p-0.5 dark:bg-neutral-700">
      {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={mergeClsx(
            "flex size-7 items-center justify-center rounded-full text-gray-800 dark:text-gray-200",
            {
              "bg-white shadow-sm dark:text-gray-800": theme === value,
            }
          )}
          title={`Switch to ${value} theme`}
        >
          <Icon className="size-3.5 flex-none" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
