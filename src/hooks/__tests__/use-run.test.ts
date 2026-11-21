import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRun } from "@/hooks/use-run";

type Params = { text: string };

function renderRun(params?: Params) {
  const callback = vi.fn();
  const rendered = renderHook(
    ({ params }: { params?: Params }) => useRun(params, callback),
    { initialProps: { params }, reactStrictMode: true }
  );
  return { callback, ...rendered };
}

describe("useRun", () => {
  it("should not run without params", () => {
    const { callback } = renderRun();

    expect(callback).not.toHaveBeenCalled();
  });

  it("should run once in Strict Mode", () => {
    const params = { text: "hi" };
    const { callback } = renderRun(params);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(params);
  });

  it("should skip a rerender with the same params", () => {
    const params = { text: "hi" };
    const { callback, rerender } = renderRun(params);

    rerender({ params });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should run again for new params with the same values", () => {
    const { callback, rerender } = renderRun({ text: "hi" });

    rerender({ params: { text: "hi" } });

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
