import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAutoInit = vi.fn();
const usePathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

vi.mock("preline", () => ({}));

describe("usePreline", () => {
  beforeEach(() => {
    mockAutoInit.mockClear();
    usePathname.mockReturnValue("/");
    window.HSStaticMethods = {
      autoInit: mockAutoInit,
    };
  });

  it("should load Preline and call autoInit after mount", async () => {
    const { usePreline } = await import("@/hooks/use-preline");
    renderHook(() => usePreline());

    await waitFor(() => {
      expect(mockAutoInit).toHaveBeenCalledTimes(1);
    });
  });

  it("should re-initialize Preline when the pathname changes", async () => {
    const { usePreline } = await import("@/hooks/use-preline");
    const { rerender } = renderHook(() => usePreline());

    await waitFor(() => {
      expect(mockAutoInit).toHaveBeenCalledTimes(1);
    });

    usePathname.mockReturnValue("/dashboard");
    await act(async () => {
      rerender();
    });

    await waitFor(() => {
      expect(mockAutoInit).toHaveBeenCalledTimes(2);
    });
  });
});
