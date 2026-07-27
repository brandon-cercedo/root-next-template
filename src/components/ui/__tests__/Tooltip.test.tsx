import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Tooltip from "@/components/ui/Tooltip";

afterEach(() => {
  cleanup();
});

describe("Tooltip", () => {
  it("should render tooltip content and children", () => {
    render(
      <Tooltip content="Tooltip content">
        <button type="button">Trigger</button>
      </Tooltip>
    );

    expect(screen.getByRole("tooltip").textContent).toBe("Tooltip content");
    expect(screen.getByRole("button", { name: "Trigger" })).toBeDefined();
  });

  it("should respect placement, trigger, and custom classes", () => {
    const { container } = render(
      <Tooltip
        content="Tooltip content"
        placement="right-bottom"
        trigger="click"
        className="custom-tooltip"
      >
        <span>Click me</span>
      </Tooltip>
    );

    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("[--placement:right-bottom]");
    expect(root.className).toContain("[--trigger:click]");

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.classList.contains("custom-tooltip")).toBe(true);
    expect(tooltip.classList.contains("hs-tooltip-content")).toBe(true);
  });
});
