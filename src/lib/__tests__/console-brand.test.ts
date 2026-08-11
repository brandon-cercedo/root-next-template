import { afterEach, describe, expect, it, vi } from "vitest";

import { logConsoleBrand } from "@/lib/console-brand";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logConsoleBrand", () => {
  it("should log a styled banner with tagline and credits", () => {
    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    logConsoleBrand();

    expect(logSpy).toHaveBeenCalledTimes(1);
    const [message, style] = logSpy.mock.calls[0] ?? [];
    expect(typeof message).toBe("string");
    expect(message).toContain("%c");
    expect(message).toContain("Base template to build Next.js applications.");
    expect(message).toContain("https://github.com/brandon-cercedo");
    expect(typeof style).toBe("string");
    expect(style).toContain("font-family: monospace");
  });

  it("should no-op when console is unavailable", () => {
    const originalConsole = globalThis.console;
    // @ts-expect-error intentional for guard coverage
    delete globalThis.console;

    expect(() => logConsoleBrand()).not.toThrow();

    globalThis.console = originalConsole;
  });
});
