import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OVERLAY_IDS } from "@/components/constants";
import {
  ConfirmationModalProvider,
  useConfirmationModal,
} from "@/hooks/use-confirmation-modal";

const mockOpenOverlay = vi.hoisted(() => vi.fn());
const mockCloseOverlay = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-overlay", () => ({
  useOverlay: () => ({
    open: mockOpenOverlay,
    close: mockCloseOverlay,
  }),
}));

function renderConfirmation() {
  return renderHook(() => useConfirmationModal(), {
    wrapper: ConfirmationModalProvider,
  });
}

describe("useConfirmationModal", () => {
  beforeEach(() => {
    mockOpenOverlay.mockReset();
    mockCloseOverlay.mockReset();
    mockOpenOverlay.mockResolvedValue(undefined);
    mockCloseOverlay.mockResolvedValue(undefined);
  });

  it("should throw when used outside ConfirmationModalProvider", () => {
    expect(() => renderHook(() => useConfirmationModal())).toThrow(
      "useConfirmationModal must be used within a ConfirmationModalProvider"
    );
  });

  it("should store options and open the overlay", async () => {
    const { result } = renderConfirmation();
    const options = { title: "Delete?", message: "Are you sure?" };

    await act(async () => {
      await result.current.openConfirmation(options);
    });

    expect(result.current.options).toEqual(options);
    expect(mockOpenOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CONFIRMATION);
  });

  it("should await the async confirm handler before closing", async () => {
    const calls: string[] = [];
    const handler = vi.fn(async () => {
      calls.push("handler");
    });
    mockCloseOverlay.mockImplementation(async () => {
      calls.push("close");
    });
    const { result } = renderConfirmation();

    await act(async () => {
      await result.current.openConfirmation({
        title: "Delete?",
        message: "Are you sure?",
        confirmButton: { handler },
      });
    });
    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(calls).toEqual(["handler", "close"]);
    expect(mockCloseOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CONFIRMATION);
  });

  it("should call the sync cancel handler and close", async () => {
    const handler = vi.fn();
    const { result } = renderConfirmation();

    await act(async () => {
      await result.current.openConfirmation({
        title: "Delete?",
        message: "Are you sure?",
        closeButton: { handler },
      });
    });
    await act(async () => {
      await result.current.handleCancel();
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(mockCloseOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CONFIRMATION);
  });

  it("should close without handlers", async () => {
    const { result } = renderConfirmation();

    await act(async () => {
      await result.current.handleConfirm();
      await result.current.handleCancel();
    });

    expect(mockCloseOverlay).toHaveBeenCalledTimes(2);
  });
});
