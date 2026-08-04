import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_KEY, ThemeProvider, useTheme } from "@/hooks/use-theme";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function mockPrefersColorScheme(isDark: boolean) {
  const listeners = new Set<() => void>();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: isDark,
      addEventListener: (_type: string, listener: () => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        listeners.delete(listener);
      },
    })),
  });

  return {
    setIsDark: (nextIsDark: boolean) => {
      isDark = nextIsDark;
      listeners.forEach((listener) => listener());
    },
  };
}

describe("useTheme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("should throw when used outside ThemeProvider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
  });

  it("should default to system and apply dark class when preferred", () => {
    mockPrefersColorScheme(true);

    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    expect(result.current.theme).toBe("system");
    expect(result.current.color).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe("system");
  });

  it("should default to system and light color when system prefers light", () => {
    mockPrefersColorScheme(false);

    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    expect(result.current.theme).toBe("system");
    expect(result.current.color).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should toggle dark class when theme is set to light or dark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.color).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(THEME_KEY)).toBe("light");

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.color).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
  });

  it("should restore a stored theme from localStorage", () => {
    localStorage.setItem(THEME_KEY, "light");

    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    expect(result.current.theme).toBe("light");
    expect(result.current.color).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should treat invalid stored values as system", () => {
    localStorage.setItem(THEME_KEY, "");

    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    expect(result.current.theme).toBe("system");
    expect(result.current.color).toBe("light");
  });

  it("should update when system preference changes while theme is system", () => {
    const media = mockPrefersColorScheme(false);
    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    expect(result.current.theme).toBe("system");
    expect(result.current.color).toBe("light");

    act(() => {
      media.setIsDark(true);
    });

    expect(result.current.color).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should sync theme from another tab via storage event", () => {
    localStorage.setItem(THEME_KEY, "dark");

    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    expect(result.current.theme).toBe("dark");

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: THEME_KEY,
          newValue: "light",
        })
      );
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.color).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: THEME_KEY,
          newValue: "system",
        })
      );
    });

    expect(result.current.theme).toBe("system");
  });

  it("should fall back to system when storage theme is cleared", () => {
    localStorage.setItem(THEME_KEY, "dark");

    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: THEME_KEY,
          newValue: null,
        })
      );
    });

    expect(result.current.theme).toBe("system");
  });

  it("should ignore storage events for unrelated keys", () => {
    localStorage.setItem(THEME_KEY, "dark");

    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "other-key",
          newValue: "light",
        })
      );
    });

    expect(result.current.theme).toBe("dark");
  });
});
