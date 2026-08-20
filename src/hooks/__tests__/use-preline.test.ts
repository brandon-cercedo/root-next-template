import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockAutoInit = vi.hoisted(() => vi.fn());
const usePathname = vi.hoisted(() => vi.fn(() => "/"));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

vi.mock("preline/non-auto", () => ({
  HSStaticMethods: {
    autoInit: mockAutoInit,
  },
}));

async function waitForAutoInit() {
  await waitFor(() => {
    expect(mockAutoInit).toHaveBeenCalled();
  });
}

async function settleAutoInit() {
  await waitForAutoInit();
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
  });
  return mockAutoInit.mock.calls.length;
}

describe("usePreline", () => {
  beforeEach(() => {
    mockAutoInit.mockClear();
    usePathname.mockReturnValue("/");
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it("should load Preline and call autoInit after mount", async () => {
    const { usePreline } = await import("@/hooks/use-preline");
    renderHook(() => usePreline());

    await waitForAutoInit();
  });

  it("should re-initialize Preline when the pathname changes", async () => {
    const { usePreline } = await import("@/hooks/use-preline");
    const { rerender } = renderHook(() => usePreline());

    const callsAfterMount = await settleAutoInit();

    usePathname.mockReturnValue("/dashboard");
    await act(async () => {
      rerender();
    });

    await waitFor(() => {
      expect(mockAutoInit.mock.calls.length).toBeGreaterThan(callsAfterMount);
    });
  });

  it("should autoInit when a plugin root is added after mount", async () => {
    const existing = document.createElement("div");
    existing.className = "hs-overlay";
    document.body.appendChild(existing);

    const { usePreline } = await import("@/hooks/use-preline");
    renderHook(() => usePreline());

    const callsAfterMount = await settleAutoInit();

    const overlay = document.createElement("div");
    overlay.className = "hs-overlay";
    await act(async () => {
      document.body.appendChild(overlay);
    });

    await waitFor(() => {
      expect(mockAutoInit.mock.calls.length).toBeGreaterThan(callsAfterMount);
    });
  });

  it("should ignore Preline backdrop nodes", async () => {
    const { usePreline } = await import("@/hooks/use-preline");
    renderHook(() => usePreline());

    const callsAfterMount = await settleAutoInit();

    const backdrop = document.createElement("div");
    backdrop.className = "hs-overlay-backdrop";
    await act(async () => {
      document.body.appendChild(backdrop);
    });

    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
    });

    expect(mockAutoInit).toHaveBeenCalledTimes(callsAfterMount);
  });
});
