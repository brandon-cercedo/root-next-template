import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useOverlay } from "@/hooks/use-overlay";

const mockOpen = vi.fn();
const mockClose = vi.fn();
const mockGetInstance = vi.hoisted(() => vi.fn());

const overlayElement = {
  open: mockOpen,
  close: mockClose,
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
    mockGetInstance.mockReset();
    mockGetInstance.mockReturnValue({ element: overlayElement });
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
