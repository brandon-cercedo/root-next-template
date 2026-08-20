import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDropdown } from "@/hooks/use-dropdown";

const mockOpen = vi.fn();
const mockClose = vi.fn();
const mockIsOpened = vi.fn();
const mockGetInstance = vi.hoisted(() => vi.fn());

const dropdownElement = {
  open: mockOpen,
  close: mockClose,
  isOpened: mockIsOpened,
};

vi.mock("preline/non-auto", () => ({
  HSDropdown: {
    getInstance: mockGetInstance,
  },
}));

describe("useDropdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockOpen.mockReset();
    mockClose.mockReset();
    mockIsOpened.mockReset();
    mockGetInstance.mockReset();
    mockGetInstance.mockReturnValue({ element: dropdownElement });
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

  it("should return the dropdown element from getInstance", async () => {
    const { result } = renderHook(() => useDropdown());
    const promise = result.current.getInstance("menu");
    await flushDelay();
    const instance = await promise;

    expect(mockGetInstance).toHaveBeenCalledWith("#menu", true);
    expect(instance).toBe(dropdownElement);
  });

  it("should open the dropdown when it is closed", async () => {
    mockIsOpened.mockReturnValue(false);

    const { result } = renderHook(() => useDropdown());
    const promise = result.current.open("menu");
    await flushDelay();
    await promise;

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it("should not open the dropdown when it is already open", async () => {
    mockIsOpened.mockReturnValue(true);

    const { result } = renderHook(() => useDropdown());
    const promise = result.current.open("menu");
    await flushDelay();
    await promise;

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it("should close the dropdown when it is open", async () => {
    mockIsOpened.mockReturnValue(true);

    const { result } = renderHook(() => useDropdown());
    const promise = result.current.close("menu");
    await flushDelay();
    await promise;

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should not close the dropdown when it is already closed", async () => {
    mockIsOpened.mockReturnValue(false);

    const { result } = renderHook(() => useDropdown());
    const promise = result.current.close("menu");
    await flushDelay();
    await promise;

    expect(mockClose).not.toHaveBeenCalled();
  });

  it("should retry until the dropdown instance is available", async () => {
    mockGetInstance
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ element: dropdownElement });

    const { result } = renderHook(() => useDropdown());
    const promise = result.current.getInstance("menu");
    await flushDelay(200);
    const instance = await promise;

    expect(mockGetInstance).toHaveBeenCalledTimes(2);
    expect(instance).toBe(dropdownElement);
  });

  it("should skip open and close when the selector is invalid", async () => {
    const { result } = renderHook(() => useDropdown());
    await result.current.open("");
    await result.current.close("");

    expect(mockGetInstance).not.toHaveBeenCalled();
    expect(mockOpen).not.toHaveBeenCalled();
    expect(mockClose).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("should log an error when the dropdown instance never appears", async () => {
    mockGetInstance.mockReturnValue(null);

    const { result } = renderHook(() => useDropdown());
    const promise = result.current.getInstance("menu");
    await flushDelay(2000);
    await promise;

    expect(console.error).toHaveBeenCalledWith(
      "Failed to get dropdown instance",
      expect.any(Error)
    );
  });
});
