import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ConsoleBrand, { logBrand } from "@/components/brand/ConsoleBrand";
import { envs } from "@/lib/config/envs";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("logBrand", () => {
  it("should log a styled banner with title, tagline, author, and version", () => {
    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    logBrand();

    expect(logSpy).toHaveBeenCalledTimes(1);
    const [message, brandStyle, descriptionStyle] = logSpy.mock.calls[0] ?? [];

    expect(typeof message).toBe("string");
    expect(message).toContain("%c");
    expect(message).toContain("🎲 Root Next Template");
    expect(message).toContain("Base template to build Next.js applications.");
    expect(message).toContain("Author:");
    expect(message).toContain("https://github.com/brandon-cercedo");
    expect(message).toContain(`Version: v${envs.NEXT_PUBLIC_APP_VERSION}`);

    expect(typeof brandStyle).toBe("string");
    expect(brandStyle).toContain(
      "linear-gradient(to right, #2563eb, #7c3aed)"
    );
    expect(brandStyle).toContain("color: transparent");
    expect(brandStyle).not.toContain("transform:");
    expect(message).toContain("/_/ \\_\\\\____/\\____/ /_/");
    expect(message).not.toContain("|");

    expect(typeof descriptionStyle).toBe("string");
    expect(descriptionStyle).toContain("color: #171717");
  });

  it("should use dark-theme description color", () => {
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
    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    logBrand();

    const descriptionStyle = logSpy.mock.calls[0]?.[2];
    expect(descriptionStyle).toContain("color: #F7F8F8");
  });

  it("should no-op when console is unavailable", () => {
    const originalConsole = globalThis.console;
    // @ts-expect-error intentional for guard coverage
    delete globalThis.console;

    expect(() => logBrand()).not.toThrow();

    globalThis.console = originalConsole;
  });
});

describe("ConsoleBrand", () => {
  it("should call logBrand once on mount", () => {
    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    const { container } = render(<ConsoleBrand />);

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(container.firstChild).toBeNull();
  });
});
