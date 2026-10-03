import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OVERLAY_IDS } from "@/components/constants";
import { KeyboardProvider, useKeyboard } from "@/hooks/use-keyboard";

const mockOpenOverlay = vi.hoisted(() => vi.fn());
const mockToggleOverlay = vi.hoisted(() => vi.fn());
const mockIsOverlayOpen = vi.hoisted(() => vi.fn());
const mockOpenDropdown = vi.hoisted(() => vi.fn());
const mockSetTheme = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());
const mockTinykeys = vi.hoisted(() =>
  vi.fn<(...args: unknown[]) => () => void>(() => vi.fn())
);
const mockDefaultIgnore = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-overlay", () => ({
  useOverlay: () => ({
    open: mockOpenOverlay,
    toggle: mockToggleOverlay,
    isOpen: mockIsOverlayOpen,
  }),
}));

vi.mock("@/hooks/use-dropdown", () => ({
  useDropdown: () => ({
    open: mockOpenDropdown,
  }),
}));

vi.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
    color: "light",
  }),
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: () => ({
    user: { email: "user@example.com" },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/lib/utils/db/user", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/db/user")>();
  return {
    ...actual,
    isAdmin: () => false,
  };
});

vi.mock("tinykeys", () => ({
  defaultKeybindingsHandlerIgnore: mockDefaultIgnore,
  tinykeys: mockTinykeys,
  parseKeybinding: (chord: string) => [chord],
  matchKeybindingPress: (event: KeyboardEvent, press: string) =>
    event.key === press,
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <KeyboardProvider>{children}</KeyboardProvider>;
}

function getTinykeysIgnore() {
  const options = mockTinykeys.mock.lastCall?.[2] as {
    ignore: (event: KeyboardEvent) => boolean;
  };
  return options.ignore;
}

describe("useKeyboard", () => {
  beforeEach(() => {
    mockOpenOverlay.mockReset();
    mockToggleOverlay.mockReset();
    mockIsOverlayOpen.mockReset();
    mockOpenDropdown.mockReset();
    mockSetTheme.mockReset();
    mockPush.mockReset();
    mockTinykeys.mockClear();
    mockDefaultIgnore.mockReset();
    mockOpenOverlay.mockResolvedValue(undefined);
    mockToggleOverlay.mockResolvedValue(undefined);
    mockIsOverlayOpen.mockResolvedValue(false);
  });

  it("should throw when used outside KeyboardProvider", () => {
    expect(() => renderHook(() => useKeyboard())).toThrow(
      "useKeyboard must be used within a KeyboardProvider"
    );
  });

  it("should return commands, commandsById, commandsByIdRef, shortcuts, and openHelp", () => {
    const { result } = renderHook(() => useKeyboard(), {
      wrapper: Wrapper,
    });

    expect(result.current.commands.length).toBeGreaterThan(0);
    expect(result.current.commandsById.size).toBe(
      result.current.commands.length
    );
    expect(result.current.commandsByIdRef.current).toBe(
      result.current.commandsById
    );
    expect(result.current.shortcuts.length).toBeGreaterThan(0);
    expect(typeof result.current.openHelp).toBe("function");
  });

  it("should toggle the chat offcanvas with the toggle-chat-offcanvas command", () => {
    const { result } = renderHook(() => useKeyboard(), {
      wrapper: Wrapper,
    });

    const command = result.current.shortcutsById.get("toggle-chat-offcanvas");
    expect(command?.shortcut.chord).toBe("$mod+j");

    command?.run();

    expect(mockToggleOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CHAT_OFFCANVAS);
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
