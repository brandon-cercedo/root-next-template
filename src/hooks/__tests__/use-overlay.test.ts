import { act, renderHook } from "@testing-library/react";
import { HSOverlay } from "preline/non-auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useOverlay } from "@/hooks/use-overlay";

const mockOpen = vi.fn();
const mockClose = vi.fn();
const mockGetInstance = vi.hoisted(() => vi.fn());
const mockClassListContains = vi.hoisted(() => vi.fn());

const overlayElement = {
  open: mockOpen,
  close: mockClose,
  el: {
    classList: {
      contains: mockClassListContains,
    },
  },
};

vi.mock("preline/non-auto", () => ({
  HSOverlay: {
    getInstance: mockGetInstance,
  },
}));

describe("useOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockOpen.mockReset();
    mockClose.mockReset();
    mockClassListContains.mockReset();
    mockGetInstance.mockReset();
    mockGetInstance.mockReturnValue({ element: overlayElement });
    mockClassListContains.mockReturnValue(false);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function flushDelay(ms = 100) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  }

  it("should return the overlay element from getInstance", async () => {
    const { result } = renderHook(() => useOverlay());
    const promise = result.current.getInstance("modal");
    await flushDelay();
    const instance = await promise;

    expect(mockGetInstance).toHaveBeenCalledWith("#modal", true);
    expect(instance).toBe(overlayElement);
  });

  it("should open the overlay instance", async () => {
    const { result } = renderHook(() => useOverlay());
    const promise = result.current.open("modal");
    await flushDelay();
    await promise;

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it("should close the overlay instance", async () => {
    const { result } = renderHook(() => useOverlay());
    const promise = result.current.close("modal");
    await flushDelay();
    await promise;

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should toggle open overlay to close", async () => {
    mockClassListContains.mockImplementation(
      (token: string) => token === "open"
    );

    const { result } = renderHook(() => useOverlay());
    const promise = result.current.toggle("modal");
    await flushDelay();
    await promise;

    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockOpen).not.toHaveBeenCalled();
  });

  it("should toggle closed overlay to open", async () => {
    mockClassListContains.mockReturnValue(false);

    const { result } = renderHook(() => useOverlay());
    const promise = result.current.toggle("modal");
    await flushDelay();
    await promise;

    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(mockClose).not.toHaveBeenCalled();
  });

  it("should return open state from isOpen", async () => {
    mockClassListContains.mockImplementation(
      (token: string) => token === "open"
    );

    const { result } = renderHook(() => useOverlay());
    const promise = result.current.isOpen("modal");
    await flushDelay();
    const opened = await promise;

    expect(opened).toBe(true);
  });

  it("should return open state from isOpen when passed an instance", async () => {
    mockClassListContains.mockImplementation(
      (token: string) => token === "open"
    );

    const { result } = renderHook(() => useOverlay());
    const opened = await result.current.isOpen(
      overlayElement as unknown as HSOverlay
    );

    expect(mockGetInstance).not.toHaveBeenCalled();
    expect(opened).toBe(true);
  });

  it("should return false from isOpen when instance is missing", async () => {
    mockGetInstance.mockReturnValue(null);

    const { result } = renderHook(() => useOverlay());
    const promise = result.current.isOpen("modal");
    await flushDelay(2000);
    const opened = await promise;

    expect(opened).toBe(false);
  });

  it("should skip open and close when the selector is invalid", async () => {
    const { result } = renderHook(() => useOverlay());
    await result.current.open("");
    await result.current.close("");

    expect(mockGetInstance).not.toHaveBeenCalled();
    expect(mockOpen).not.toHaveBeenCalled();
    expect(mockClose).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("should retry until the overlay instance is available", async () => {
    mockGetInstance
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ element: overlayElement });

    const { result } = renderHook(() => useOverlay());
    const promise = result.current.getInstance("modal");
    await flushDelay(200);
    const instance = await promise;

    expect(mockGetInstance).toHaveBeenCalledTimes(2);
    expect(instance).toBe(overlayElement);
  });

  it("should log an error when the overlay instance never appears", async () => {
    mockGetInstance.mockReturnValue(null);

    const { result } = renderHook(() => useOverlay());
    const promise = result.current.getInstance("modal");
    await flushDelay(2000);
    await promise;

    expect(console.error).toHaveBeenCalledWith(
      "Overlay instance was not found"
    );
  });
});
