import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { KeyboardProvider, useKeyboard } from "@/hooks/use-keyboard";

const mockOpenOverlay = vi.hoisted(() => vi.fn());
const mockToggleOverlay = vi.hoisted(() => vi.fn());
const mockIsOverlayOpen = vi.hoisted(() => vi.fn());
const mockOpenDropdown = vi.hoisted(() => vi.fn());
const mockSetTheme = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());

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
  defaultKeybindingsHandlerIgnore: vi.fn(),
  tinykeys: () => vi.fn(),
  parseKeybinding: vi.fn(),
  matchKeybindingPress: vi.fn(),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <KeyboardProvider>{children}</KeyboardProvider>;
}

describe("useKeyboard", () => {
  beforeEach(() => {
    mockOpenOverlay.mockReset();
    mockToggleOverlay.mockReset();
    mockIsOverlayOpen.mockReset();
    mockOpenDropdown.mockReset();
    mockSetTheme.mockReset();
    mockPush.mockReset();
    mockOpenOverlay.mockResolvedValue(undefined);
    mockToggleOverlay.mockResolvedValue(undefined);
    mockIsOverlayOpen.mockResolvedValue(false);
  });

  it("should throw when used outside KeyboardProvider", () => {
    expect(() => renderHook(() => useKeyboard())).toThrow(
      "useKeyboard must be used within a KeyboardProvider"
    );
  });

  it("should return commands, shortcuts, and openHelp from KeyboardProvider", () => {
    const { result } = renderHook(() => useKeyboard(), {
      wrapper: Wrapper,
    });

    expect(result.current.commands.length).toBeGreaterThan(0);
    expect(result.current.shortcuts.length).toBeGreaterThan(0);
    expect(typeof result.current.openHelp).toBe("function");
  });
});
