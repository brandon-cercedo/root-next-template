import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSelect } from "@/hooks/use-select";

const mockOpen = vi.fn();
const mockClose = vi.fn();
const mockIsOpened = vi.fn();
const mockSetValue = vi.fn();
const mockGetInstance = vi.hoisted(() => vi.fn());

const selectElement = {
  open: mockOpen,
  close: mockClose,
  isOpened: mockIsOpened,
  setValue: mockSetValue,
};

vi.mock("preline/non-auto", () => ({
  HSSelect: {
    getInstance: mockGetInstance,
  },
}));

describe("useSelect", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockOpen.mockReset();
    mockClose.mockReset();
    mockIsOpened.mockReset();
    mockSetValue.mockReset();
    mockGetInstance.mockReset();
    mockGetInstance.mockReturnValue({ element: selectElement });
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

  it("should return the select element from getInstance", async () => {
    const { result } = renderHook(() => useSelect());
    const promise = result.current.getInstance("picker");
    await flushDelay();
    const instance = await promise;

    expect(mockGetInstance).toHaveBeenCalledWith("#picker", true);
    expect(instance).toBe(selectElement);
  });

  it("should open the select when it is closed", async () => {
    mockIsOpened.mockReturnValue(false);

    const { result } = renderHook(() => useSelect());
    const promise = result.current.open("picker");
    await flushDelay();
    await promise;

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it("should not open the select when it is already open", async () => {
    mockIsOpened.mockReturnValue(true);

    const { result } = renderHook(() => useSelect());
    const promise = result.current.open("picker");
    await flushDelay();
    await promise;

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it("should close the select when it is open", async () => {
    mockIsOpened.mockReturnValue(true);

    const { result } = renderHook(() => useSelect());
    const promise = result.current.close("picker");
    await flushDelay();
    await promise;

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should not close the select when it is already closed", async () => {
    mockIsOpened.mockReturnValue(false);

    const { result } = renderHook(() => useSelect());
    const promise = result.current.close("picker");
    await flushDelay();
    await promise;

    expect(mockClose).not.toHaveBeenCalled();
  });

  it("should set the select value", async () => {
    const { result } = renderHook(() => useSelect());
    const promise = result.current.setValue("picker", "markdown");
    await flushDelay();
    await promise;

    expect(mockSetValue).toHaveBeenCalledWith("markdown");
  });

  it("should retry until the select instance is available", async () => {
    mockGetInstance
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ element: selectElement });

    const { result } = renderHook(() => useSelect());
    const promise = result.current.getInstance("picker");
    await flushDelay(200);
    const instance = await promise;

    expect(mockGetInstance).toHaveBeenCalledTimes(2);
    expect(instance).toBe(selectElement);
  });

  it("should skip actions when the selector is invalid", async () => {
    const { result } = renderHook(() => useSelect());
    await result.current.open("");
    await result.current.close("");
    await result.current.setValue("", "markdown");

    expect(mockGetInstance).not.toHaveBeenCalled();
    expect(mockOpen).not.toHaveBeenCalled();
    expect(mockClose).not.toHaveBeenCalled();
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("should log an error when the select instance never appears", async () => {
    mockGetInstance.mockReturnValue(null);

    const { result } = renderHook(() => useSelect());
    const promise = result.current.getInstance("picker");
    await flushDelay(2000);
    await promise;

    expect(console.error).toHaveBeenCalledWith(
      "Select instance was not found"
    );
  });
});
