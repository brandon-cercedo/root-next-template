import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useConfetti, type UseConfettiOptions } from "@/hooks/use-confetti";

const confetti = vi.hoisted(() =>
  vi.fn((): Promise<void> | undefined => Promise.resolve())
);

vi.mock("canvas-confetti", () => ({
  default: confetti,
}));

const DEFAULT_BURST = {
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  disableForReducedMotion: true,
};

describe("useConfetti", () => {
  beforeEach(() => {
    confetti.mockReset();
    confetti.mockImplementation(() => Promise.resolve());
  });

  it("should not burst when fire is false", () => {
    renderHook(() => useConfetti({ fire: false }));

    expect(confetti).not.toHaveBeenCalled();
  });

  it("should burst with Preline defaults when fire is true", async () => {
    const onFired = vi.fn();

    renderHook(() => useConfetti({ fire: true, onFired }));

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledTimes(1);
      expect(confetti).toHaveBeenCalledWith(DEFAULT_BURST);
      expect(onFired).toHaveBeenCalledTimes(1);
    });
  });

  it("should spread caller options over the defaults", async () => {
    renderHook(() =>
      useConfetti({ fire: true, particleCount: 20, spread: 40 })
    );

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledWith({
        ...DEFAULT_BURST,
        particleCount: 20,
        spread: 40,
      });
    });
  });

  it("should call onFired after the burst promise resolves", async () => {
    let finishBurst: (() => void) | undefined;
    confetti.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishBurst = resolve;
        })
    );
    const onFired = vi.fn();

    renderHook(() => useConfetti({ fire: true, onFired }));

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledTimes(1);
    });
    expect(onFired).not.toHaveBeenCalled();

    finishBurst?.();

    await waitFor(() => {
      expect(onFired).toHaveBeenCalledTimes(1);
    });
  });

  it("should not retrigger when onFired identity changes", async () => {
    const firstOnFired = vi.fn();
    const { rerender } = renderHook(
      (props: UseConfettiOptions) => useConfetti(props),
      { initialProps: { fire: true, onFired: firstOnFired } }
    );

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledTimes(1);
      expect(firstOnFired).toHaveBeenCalledTimes(1);
    });

    rerender({ fire: true, onFired: vi.fn() });

    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it("should burst after fire becomes true", async () => {
    const { rerender } = renderHook(
      (props: UseConfettiOptions) => useConfetti(props),
      { initialProps: { fire: false } }
    );

    expect(confetti).not.toHaveBeenCalled();

    await act(async () => {
      rerender({ fire: true });
    });

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledTimes(1);
    });
  });
});
