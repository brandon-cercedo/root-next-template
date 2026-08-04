"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import ThemeScript from "@/components/theme/ThemeScript";

export const THEME_KEY = "theme";

export type Theme = "light" | "dark" | "system";
export type ThemeColor = "light" | "dark";

interface ThemeContextType {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  color: ThemeColor | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function toggleThemeColor(color: ThemeColor | undefined) {
  const root = document.documentElement;
  if (color === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function getValidTheme(value: string | null) {
  let theme: Theme = "system";
  if (value && ["light", "dark", "system"].includes(value)) {
    theme = value as Theme;
  }
  return theme;
}

function getThemeColor(theme: Theme | undefined): ThemeColor | undefined {
  if (typeof window === "undefined" || !theme) {
    return;
  }
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

function getStoredTheme() {
  if (typeof window === "undefined") {
    return;
  }
  const storedTheme = localStorage.getItem(THEME_KEY);
  return getValidTheme(storedTheme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | undefined>(() =>
    getStoredTheme()
  );
  const [color, setColor] = useState<ThemeColor | undefined>(() =>
    getThemeColor(theme)
  );

  useEffect(() => {
    if (!theme) {
      return;
    }

    const updateTheme = () => {
      // Update color
      const color = getThemeColor(theme);
      setColor(color);

      // Apply color to document
      toggleThemeColor(color);

      // Save theme to localStorage
      localStorage.setItem(THEME_KEY, theme);
    };

    updateTheme();

    // Listen for system theme changes when theme is "system"
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    }
  }, [theme]);

  // Listen for theme changes in other tabs so the UI stays in sync
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) {
        return;
      }
      const theme = getValidTheme(event.newValue);
      setTheme(theme);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, color }}>
      <ThemeScript />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
