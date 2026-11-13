import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useOverlayEvents } from "@/hooks/use-overlay-events";

const mockGetInstance = vi.hoisted(() => vi.fn());
const mockIsOverlayOpen = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-overlay", () => ({
  useOverlay: () => ({
    getInstance: mockGetInstance,
    isOpen: mockIsOverlayOpen,
  }),
}));

function createMockInstance() {
  const callbacks: Record<string, () => void> = {};
  const instance = {
    on: vi.fn((event: string, callback: () => void) => {
      callbacks[event] = callback;
    }),
  };

  return { instance, callbacks };
}

async function waitForBinding() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("useOverlayEvents", () => {
  beforeEach(() => {
    mockGetInstance.mockReset();
    mockIsOverlayOpen.mockReset();
    mockIsOverlayOpen.mockResolvedValue(false);
  });

  it("should skip instance binding when isMounted is false", () => {
    renderHook(() => useOverlayEvents({ id: "overlay", isMounted: false }));

    expect(mockGetInstance).not.toHaveBeenCalled();
  });

  it("should register open and close listeners on bind", async () => {
    const { instance } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);

    renderHook(() => useOverlayEvents({ id: "overlay", isMounted: true }));
    await waitForBinding();

    expect(mockGetInstance).toHaveBeenCalledWith("overlay");
    expect(instance.on).toHaveBeenCalledWith("open", expect.any(Function));
    expect(instance.on).toHaveBeenCalledWith("close", expect.any(Function));
  });

  it("should run onOpen and onClose when overlay events fire", async () => {
    const { instance, callbacks } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);
    const onOpen = vi.fn();
    const onClose = vi.fn();

    renderHook(() =>
      useOverlayEvents({ id: "overlay", isMounted: true, onOpen, onClose })
    );
    await waitForBinding();
    onClose.mockClear();

    act(() => callbacks.open());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    act(() => callbacks.close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should run onOpen on bind when overlay is already open", async () => {
    const { instance } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);
    mockIsOverlayOpen.mockResolvedValue(true);
    const onOpen = vi.fn();
    const onClose = vi.fn();

    renderHook(() =>
      useOverlayEvents({ id: "overlay", isMounted: true, onOpen, onClose })
    );
    await waitForBinding();

    expect(mockIsOverlayOpen).toHaveBeenCalledWith(instance);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should run onClose on bind when overlay starts closed", async () => {
    const { instance } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);
    const onOpen = vi.fn();
    const onClose = vi.fn();

    renderHook(() =>
      useOverlayEvents({ id: "overlay", isMounted: true, onOpen, onClose })
    );
    await waitForBinding();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("should call the latest callback without rebinding", async () => {
    const { instance, callbacks } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);
    const firstOnOpen = vi.fn();
    const latestOnOpen = vi.fn();

    const { rerender } = renderHook(
      ({ onOpen }) =>
        useOverlayEvents({ id: "overlay", isMounted: true, onOpen }),
      { initialProps: { onOpen: firstOnOpen } }
    );
    await waitForBinding();
    rerender({ onOpen: latestOnOpen });

    act(() => callbacks.open());

    expect(mockGetInstance).toHaveBeenCalledTimes(1);
    expect(firstOnOpen).not.toHaveBeenCalled();
    expect(latestOnOpen).toHaveBeenCalledTimes(1);
  });

  it("should ignore overlay events after unmount", async () => {
    const { instance, callbacks } = createMockInstance();
    mockGetInstance.mockResolvedValue(instance);
    const onOpen = vi.fn();

    const { unmount } = renderHook(() =>
      useOverlayEvents({ id: "overlay", isMounted: true, onOpen })
    );
    await waitForBinding();
    unmount();

    callbacks.open();

    expect(onOpen).not.toHaveBeenCalled();
  });
});
