import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePreline } from "@/hooks/use-preline";

const mockAutoInit = vi.hoisted(() => vi.fn());
const mockGetInstance = vi.hoisted(() => vi.fn());
const mockSetOpened = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("preline/non-auto", () => ({
  HSStaticMethods: { autoInit: mockAutoInit },
  HSOverlay: {
    getInstance: mockGetInstance,
    setOpened: mockSetOpened,
  },
}));

const LG = 1024;
const BODY_OPEN_CLASS = "hs-overlay-body-open";

type OverlayOptions = {
  autoClose?: number | null;
  autoCloseEqualityType?: "less-than" | null;
  openedBreakpoint?: number | null;
  isLayoutAffect?: boolean;
  isOpened?: boolean;
};

function setBodyWidth(width: number) {
  Object.defineProperty(document.body, "clientWidth", {
    configurable: true,
    value: width,
  });
}

function createOverlay({ isOpened = false, ...options }: OverlayOptions) {
  const el = document.createElement("div");
  el.className = "hs-overlay";
  if (isOpened) {
    el.classList.add("opened");
  }
  document.body.appendChild(el);

  const item = {
    id: "overlay",
    element: {
      el,
      close: vi.fn(),
      autoClose: null,
      autoCloseEqualityType: null,
      openedBreakpoint: null,
      isLayoutAffect: false,
      ...options,
    },
  };
  mockGetInstance.mockImplementation((target: HTMLElement) => {
    return target === el ? item : null;
  });
  return item;
}

async function renderPreline() {
  const hook = renderHook(() => usePreline());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(100);
  });
  return hook;
}

async function resize(width: number) {
  setBodyWidth(width);
  await act(async () => {
    window.dispatchEvent(new Event("resize"));
    await vi.advanceTimersByTimeAsync(150);
  });
}

describe("useOverlay", () => {
  describe("overlay", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.clearAllMocks();
    });

    afterEach(() => {
      cleanup();
      vi.useRealTimers();
      document.body.replaceChildren();
      document.body.classList.remove(BODY_OPEN_CLASS);
    });

    it("should close an opened overlay below its opened breakpoint", async () => {
      const item = createOverlay({ openedBreakpoint: LG, isOpened: true });
      await renderPreline();

      await resize(LG - 1);

      expect(item.element.close).toHaveBeenCalledWith(true);
      expect(mockSetOpened).not.toHaveBeenCalled();
    });

    it("should open a closed overlay at its opened breakpoint", async () => {
      const item = createOverlay({ openedBreakpoint: LG });
      await renderPreline();

      await resize(LG);

      expect(mockSetOpened).toHaveBeenCalledWith(LG, item);
      expect(item.element.close).not.toHaveBeenCalled();
    });

    it("should auto-close at or above the breakpoint by default", async () => {
      const item = createOverlay({ autoClose: LG, isOpened: true });
      await renderPreline();

      await resize(LG - 1);
      expect(item.element.close).not.toHaveBeenCalled();

      await resize(LG);
      expect(item.element.close).toHaveBeenCalledWith(true);
    });

    it("should add the body class to an opened layout overlay", async () => {
      createOverlay({
        autoClose: LG,
        autoCloseEqualityType: "less-than",
        isLayoutAffect: true,
        isOpened: true,
      });
      await renderPreline();

      await resize(LG + 1);

      expect(document.body.classList.contains(BODY_OPEN_CLASS)).toBe(true);
    });

    it("should skip the body class when the overlay is closed", async () => {
      createOverlay({
        autoClose: LG,
        autoCloseEqualityType: "less-than",
        isLayoutAffect: true,
      });
      await renderPreline();

      await resize(LG + 1);

      expect(document.body.classList.contains(BODY_OPEN_CLASS)).toBe(false);
    });

    it("should ignore overlays without resize options", async () => {
      const item = createOverlay({ isLayoutAffect: true, isOpened: true });
      await renderPreline();

      await resize(LG - 1);
      await resize(LG);

      expect(item.element.close).not.toHaveBeenCalled();
      expect(mockSetOpened).not.toHaveBeenCalled();
      expect(document.body.classList.contains(BODY_OPEN_CLASS)).toBe(false);
    });
  });
});
