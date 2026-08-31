import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ModalProvider, useModal } from "@/hooks/use-modal";

const mockGetInstance = vi.hoisted(() => vi.fn());
const mockOpenOverlay = vi.hoisted(() => vi.fn());
const mockCloseOverlay = vi.hoisted(() => vi.fn());
const mockToggleOverlay = vi.hoisted(() => vi.fn());
const mockIsOverlayOpen = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-overlay", () => ({
  useOverlay: () => ({
    getInstance: mockGetInstance,
    open: mockOpenOverlay,
    close: mockCloseOverlay,
    toggle: mockToggleOverlay,
    isOpen: mockIsOverlayOpen,
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

function createMockInstance() {
  const openCallbacks: Array<() => void> = [];
  const closeCallbacks: Array<() => void> = [];

  const instance = {
    open: vi.fn(),
    close: vi.fn(),
    on: vi.fn((event: string, callback: () => void) => {
      if (event === "open") {
        openCallbacks.push(callback);
      }
      if (event === "close") {
        closeCallbacks.push(callback);
      }
    }),
  };

  return { instance, openCallbacks, closeCallbacks };
}

async function waitForBinding() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("useModal", () => {
  beforeEach(() => {
    mockGetInstance.mockReset();
    mockOpenOverlay.mockReset();
    mockCloseOverlay.mockReset();
    mockToggleOverlay.mockReset();
    mockIsOverlayOpen.mockReset();
    mockOpenOverlay.mockResolvedValue(undefined);
    mockCloseOverlay.mockResolvedValue(undefined);
    mockToggleOverlay.mockResolvedValue(undefined);
    mockIsOverlayOpen.mockResolvedValue(false);
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
    const { instance } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);

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
    const { instance } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);

    const { result } = renderHook(() => useModal(), {
      wrapper: createWrapper(),
    });

    await waitForBinding();

    await act(async () => {
      await result.current.toggle();
    });

    expect(mockToggleOverlay).toHaveBeenCalledWith("test-modal");
  });

  it("should register open and close listeners on bind", async () => {
    const { instance } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);

    renderHook(() => useModal(), {
      wrapper: createWrapper(),
    });

    await waitForBinding();

    expect(instance.on).toHaveBeenCalledWith("open", expect.any(Function));
    expect(instance.on).toHaveBeenCalledWith("close", expect.any(Function));
  });

  it("should sync isOpen when overlay open and close events fire", async () => {
    const { instance, openCallbacks, closeCallbacks } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);

    const { result } = renderHook(() => useModal(), {
      wrapper: createWrapper(),
    });

    await waitForBinding();

    expect(result.current.isOpen).toBe(false);

    act(() => {
      openCallbacks.forEach((callback) => callback());
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      closeCallbacks.forEach((callback) => callback());
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("should seed isOpen from overlay isOpen helper", async () => {
    const { instance } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);
    mockIsOverlayOpen.mockResolvedValue(true);

    const { result } = renderHook(() => useModal(), {
      wrapper: createWrapper(),
    });

    await waitForBinding();

    expect(mockIsOverlayOpen).toHaveBeenCalledWith(instance);
    expect(result.current.isOpen).toBe(true);
  });

  it("should skip instance binding when isMounted is false", () => {
    renderHook(() => useModal(), {
      wrapper: createWrapper({ isMounted: false }),
    });

    expect(mockGetInstance).not.toHaveBeenCalled();
  });
});
