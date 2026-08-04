import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import ThemeScript from "@/components/theme/ThemeScript";
import { THEME_KEY } from "@/hooks/use-theme";

function getScriptHtml(container: HTMLElement) {
  return container.querySelector("script")?.innerHTML ?? "";
}

function runInjectedScript(html: string) {
  // Injected FOUC script is plain IIFE source; run it like the browser would.
  new Function(html)();
}

describe("ThemeScript", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("should render an inline script that invokes initTheme", () => {
    const { container } = render(<ThemeScript />);
    const html = getScriptHtml(container);

    expect(container.querySelector("script")).not.toBeNull();
    expect(html).toContain("getValidTheme");
    expect(html).toContain("getThemeColor");
    expect(html).toContain("toggleThemeColor");
    expect(html).toContain("localStorage");
    expect(html).toContain(`"${THEME_KEY}"`);
  });

  it("should accept a custom storage key", () => {
    const { container } = render(<ThemeScript storageKey="custom-theme" />);
    const html = getScriptHtml(container);

    expect(html).toContain('"custom-theme"');
  });

  it("should not set nonce when running in the browser", () => {
    const { container } = render(<ThemeScript nonce="test-nonce" />);
    const script = container.querySelector("script");

    expect(script?.getAttribute("nonce") ?? "").toBe("");
  });

  it("should apply dark class for a stored dark theme", () => {
    localStorage.setItem(THEME_KEY, "dark");
    const { container } = render(<ThemeScript />);

    runInjectedScript(getScriptHtml(container));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should remove dark class for a stored light theme", () => {
    localStorage.setItem(THEME_KEY, "light");
    document.documentElement.classList.add("dark");
    const { container } = render(<ThemeScript />);

    runInjectedScript(getScriptHtml(container));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should resolve system theme from prefers-color-scheme", () => {
    localStorage.setItem(THEME_KEY, "system");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    const { container } = render(<ThemeScript />);

    runInjectedScript(getScriptHtml(container));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should default to system when storage is not set", () => {
    localStorage.removeItem(THEME_KEY);
    const { container } = render(<ThemeScript />);

    runInjectedScript(getScriptHtml(container));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
