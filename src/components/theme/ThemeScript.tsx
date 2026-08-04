import { memo } from "react";

import { Theme, THEME_KEY, ThemeColor } from "@/hooks/use-theme";

import type { ScriptHTMLAttributes } from "react";

/**
 * Apply the stored theme before paint.
 *
 * @note Keep in sync with helper functions in `use-theme.tsx`.
 * @note Pattern mirrors injectable `script` function in `next-themes` package.
 */
function initTheme(storageKey: string) {
  const getValidTheme = (value: string | null) => {
    let theme: Theme = "system";
    if (value && ["light", "dark", "system"].includes(value)) {
      theme = value as Theme;
    }
    return theme;
  };

  const getThemeColor = (theme: Theme | undefined): ThemeColor | undefined => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  };

  const toggleThemeColor = (color: ThemeColor | undefined) => {
    const root = document.documentElement;
    if (color === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  try {
    const storedTheme = localStorage.getItem(storageKey);

    const theme = getValidTheme(storedTheme);
    const color = getThemeColor(theme);
    toggleThemeColor(color);
  } catch {}
}

export interface ThemeScriptProps extends Omit<
  ScriptHTMLAttributes<HTMLScriptElement>,
  "children" | "dangerouslySetInnerHTML"
> {
  storageKey?: string;
  nonce?: string;
}

/**
 * Blocking inline script that applies the theme before paint (FOUC guard)
 * to avoid flashing the wrong theme.
 */
const ThemeScript = memo(function ThemeScript({
  storageKey = THEME_KEY,
  nonce,
  ...props
}: ThemeScriptProps) {
  const args = JSON.stringify([storageKey]).slice(1, -1);

  return (
    <script
      {...props}
      suppressHydrationWarning={true}
      nonce={typeof window === "undefined" ? nonce : ""}
      dangerouslySetInnerHTML={{
        __html: `(${initTheme.toString()})(${args})`,
      }}
    />
  );
});

export default ThemeScript;
