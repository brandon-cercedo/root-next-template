import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ModalProvider, useModal } from "@/hooks/use-modal";

const mockOpenOverlay = vi.hoisted(() => vi.fn());
const mockCloseOverlay = vi.hoisted(() => vi.fn());
const mockToggleOverlay = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-overlay", () => ({
  useOverlay: () => ({
    open: mockOpenOverlay,
    close: mockCloseOverlay,
    toggle: mockToggleOverlay,
  }),
}));

function createWrapper({
  id = "test-modal",
  isMounted = true,
}: {
  id?: string;
  isMounted?: boolean;
} = {}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ModalProvider id={id} isMounted={isMounted}>
        {children}
      </ModalProvider>
    );
  };
}

describe("useModal", () => {
  beforeEach(() => {
    mockOpenOverlay.mockReset();
    mockCloseOverlay.mockReset();
    mockToggleOverlay.mockReset();
    mockOpenOverlay.mockResolvedValue(undefined);
    mockCloseOverlay.mockResolvedValue(undefined);
    mockToggleOverlay.mockResolvedValue(undefined);
  });

  it("should throw when used outside ModalProvider", () => {
    expect(() => renderHook(() => useModal())).toThrow(
      "useModal must be used within a ModalProvider"
    );
  });

  it("should expose id and isMounted from provider props", () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: createWrapper({ id: "my-modal", isMounted: true }),
    });

    expect(result.current.id).toBe("my-modal");
    expect(result.current.isMounted).toBe(true);
  });

  it("should call overlay open and close helpers", async () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: createWrapper({ id: "my-modal" }),
    });

    await act(async () => {
      await result.current.open();
    });

    expect(mockOpenOverlay).toHaveBeenCalledWith("my-modal");

    await act(async () => {
      await result.current.close();
    });

    expect(mockCloseOverlay).toHaveBeenCalledWith("my-modal");
  });

  it("should call overlay toggle helper", async () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggle();
    });

    expect(mockToggleOverlay).toHaveBeenCalledWith("test-modal");
  });
});
