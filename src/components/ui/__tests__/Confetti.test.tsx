import { cleanup, render, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Confetti from "@/components/ui/Confetti";

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

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  confetti.mockReset();
  confetti.mockImplementation(() => Promise.resolve());
});

describe("Confetti", () => {
  it("should render nothing", () => {
    const { container } = render(<Confetti fire={false} />);

    expect(container.firstChild).toBeNull();
  });

  it("should not burst when fire is false", () => {
    const onFired = vi.fn();

    render(<Confetti fire={false} onFired={onFired} />);

    expect(confetti).not.toHaveBeenCalled();
    expect(onFired).not.toHaveBeenCalled();
  });

  it("should burst once with the Preline defaults", async () => {
    const onFired = vi.fn();

    render(<Confetti fire onFired={onFired} />);

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledTimes(1);
      expect(confetti).toHaveBeenCalledWith(DEFAULT_BURST);
      expect(onFired).toHaveBeenCalledTimes(1);
    });
  });

  it("should apply option overrides", async () => {
    render(<Confetti fire particleCount={20} spread={40} />);

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledWith({
        ...DEFAULT_BURST,
        particleCount: 20,
        spread: 40,
      });
    });
  });

  it("should burst after fire becomes true", async () => {
    const { rerender } = render(<Confetti fire={false} />);

    expect(confetti).not.toHaveBeenCalled();

    rerender(<Confetti fire />);

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledTimes(1);
    });
  });

  it("should not burst twice under Strict Mode", async () => {
    const onFired = vi.fn();

    render(
      <StrictMode>
        <Confetti fire onFired={onFired} />
      </StrictMode>
    );

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledTimes(1);
      expect(onFired).toHaveBeenCalledTimes(1);
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

    render(<Confetti fire onFired={onFired} />);

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledTimes(1);
    });
    expect(onFired).not.toHaveBeenCalled();

    finishBurst?.();

    await waitFor(() => {
      expect(onFired).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onFired when confetti returns undefined", async () => {
    confetti.mockReturnValue(undefined);
    const onFired = vi.fn();

    render(<Confetti fire onFired={onFired} />);

    await waitFor(() => {
      expect(onFired).toHaveBeenCalledTimes(1);
    });
  });
});
