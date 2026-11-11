import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BASE_KEYBOARD_COMMANDS,
  KeyboardCommand,
} from "@/components/keyboard/config";
import { KeyboardProvider, useKeyboard } from "@/hooks/use-keyboard";

const mockIsOverlayOpen = vi.hoisted(() => vi.fn());
const mockTinykeys = vi.hoisted(() =>
  vi.fn<(...args: unknown[]) => () => void>(() => vi.fn())
);
const mockDefaultIgnore = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-overlay", () => ({
  useOverlay: () => ({
    isOpen: mockIsOverlayOpen,
  }),
}));

vi.mock("tinykeys", () => ({
  defaultKeybindingsHandlerIgnore: mockDefaultIgnore,
  tinykeys: mockTinykeys,
  parseKeybinding: (chord: string) => [chord],
  matchKeybindingPress: (event: KeyboardEvent, press: string) =>
    event.key === press,
}));

const commands: KeyboardCommand[] = BASE_KEYBOARD_COMMANDS.map((command) => ({
  ...command,
  run: vi.fn(),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <KeyboardProvider commands={commands}>{children}</KeyboardProvider>;
}

function getTinykeysIgnore() {
  const options = mockTinykeys.mock.lastCall?.[2] as {
    ignore: (event: KeyboardEvent) => boolean;
  };
  return options.ignore;
}

function getKeybinding(chord: string) {
  const keybindings = mockTinykeys.mock.lastCall?.[1] as Record<
    string,
    (event: KeyboardEvent) => Promise<void>
  >;
  return keybindings[chord];
}

describe("useKeyboard", () => {
  beforeEach(() => {
    mockIsOverlayOpen.mockReset();
    mockTinykeys.mockClear();
    mockDefaultIgnore.mockReset();
    mockIsOverlayOpen.mockResolvedValue(false);
    commands.forEach((command) => vi.mocked(command.run).mockReset());
  });

  it("should throw when used outside KeyboardProvider", () => {
    expect(() => renderHook(() => useKeyboard())).toThrow(
      "useKeyboard must be used within a KeyboardProvider"
    );
  });

  it("should return the given commands, maps and shortcuts", () => {
    const { result } = renderHook(() => useKeyboard(), {
      wrapper: Wrapper,
    });

    expect(result.current.commands).toBe(commands);
    expect(result.current.commandsById.size).toBe(commands.length);
    expect(result.current.commandsByIdRef.current).toBe(
      result.current.commandsById
    );
    expect(result.current.shortcuts.length).toBeGreaterThan(0);
    expect(result.current.shortcuts.every((command) => command.shortcut)).toBe(
      true
    );
  });

  it("should run a shortcut command when the palette is closed", async () => {
    renderHook(() => useKeyboard(), { wrapper: Wrapper });
    const event = { preventDefault: vi.fn() } as unknown as KeyboardEvent;

    await getKeybinding("$mod+j")(event);

    const command = commands.find(
      (item) => item.id === "toggle-chat-offcanvas"
    );
    expect(command?.run).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("should skip other shortcuts while the palette is open", async () => {
    mockIsOverlayOpen.mockResolvedValue(true);
    renderHook(() => useKeyboard(), { wrapper: Wrapper });
    const event = { preventDefault: vi.fn() } as unknown as KeyboardEvent;

    await getKeybinding("$mod+j")(event);

    const command = commands.find(
      (item) => item.id === "toggle-chat-offcanvas"
    );
    expect(command?.run).not.toHaveBeenCalled();
  });

  it.each(["$mod+k", "$mod+Shift+o", "$mod+j"])(
    "should run %s shortcut with inEditable inside editable targets",
    (chord) => {
      renderHook(() => useKeyboard(), { wrapper: Wrapper });

      const ignore = getTinykeysIgnore();

      expect(ignore({ key: chord } as KeyboardEvent)).toBe(false);
      expect(mockDefaultIgnore).not.toHaveBeenCalled();
    }
  );

  it("should defer other shortcuts to the default tinykeys ignore", () => {
    mockDefaultIgnore.mockReturnValue(true);
    renderHook(() => useKeyboard(), { wrapper: Wrapper });

    const ignore = getTinykeysIgnore();
    const event = { key: "$mod+b" } as KeyboardEvent;

    expect(ignore(event)).toBe(true);
    expect(mockDefaultIgnore).toHaveBeenCalledWith(event);
  });
});
