import { describe, expect, it, vi } from "vitest";

import {
  getKeyboardCommands,
  getShortcutCommands,
  getShortcutKeys,
} from "@/lib/keyboard";

const mockIsMac = vi.hoisted(() => vi.fn());

vi.mock("@/lib/utils/html", () => ({
  isMac: mockIsMac,
}));

const shortcut = {
  chord: "$mod+k",
  labels: { mac: ["⌘", "K"], windows: ["Ctrl", "K"] },
};

describe("getShortcutKeys", () => {
  it("should return the mac labels on mac", () => {
    mockIsMac.mockReturnValue(true);
    expect(getShortcutKeys(shortcut)).toEqual(["⌘", "K"]);
  });

  it("should return the windows labels elsewhere", () => {
    mockIsMac.mockReturnValue(false);
    expect(getShortcutKeys(shortcut)).toEqual(["Ctrl", "K"]);
  });
});

describe("getKeyboardCommands", () => {
  it("should keep only commands with an action, in list order", () => {
    const goHome = vi.fn();
    const newChat = vi.fn();

    const commands = getKeyboardCommands({
      "new-chat": newChat,
      "go-home": goHome,
    });

    expect(commands.map((command) => command.id)).toEqual([
      "go-home",
      "new-chat",
    ]);
    expect(commands[0].run).toBe(goHome);
  });
});

describe("getShortcutCommands", () => {
  it("should keep only commands with a shortcut", () => {
    const commands = getKeyboardCommands({
      "toggle-palette": vi.fn(),
      "go-home": vi.fn(),
    });

    const shortcuts = getShortcutCommands(commands);

    expect(shortcuts.map((command) => command.id)).toEqual(["toggle-palette"]);
  });
});
