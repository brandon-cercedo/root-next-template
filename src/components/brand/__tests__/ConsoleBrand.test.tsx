import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ConsoleBrand from "@/components/brand/ConsoleBrand";
import { logConsoleBrand } from "@/lib/console-brand";

vi.mock("@/lib/console-brand", () => ({
  logConsoleBrand: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ConsoleBrand", () => {
  it("should call logConsoleBrand once on mount", () => {
    const { container } = render(<ConsoleBrand />);

    expect(logConsoleBrand).toHaveBeenCalledTimes(1);
    expect(container.firstChild).toBeNull();
  });
});
