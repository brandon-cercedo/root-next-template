import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Dropdown from "@/components/ui/Dropdown";

afterEach(() => {
  cleanup();
});

describe("Dropdown", () => {
  it("should render trigger and menu content", () => {
    render(
      <Dropdown content={<div>Menu item</div>}>
        <button type="button">Open</button>
      </Dropdown>
    );

    expect(screen.getByRole("button", { name: "Open" })).toBeDefined();
    expect(screen.getByRole("menu").textContent).toBe("Menu item");
  });

  it("should apply placement, trigger, scope, autoClose, offset, and custom class", () => {
    const { container } = render(
      <Dropdown
        content={<div>Menu</div>}
        placement="top-right"
        trigger="hover"
        scope="window"
        autoClose="outside"
        offset={24}
        className="custom-dropdown"
      >
        <span>Toggle</span>
      </Dropdown>
    );

    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("[--placement:top-right]");
    expect(root.className).toContain("[--trigger:hover]");
    expect(root.className).toContain("[--scope:window]");
    expect(root.className).toContain("[--auto-close:outside]");
    expect(root.className).toContain("[--offset:24]");

    const menu = screen.getByRole("menu");
    expect(menu.classList.contains("custom-dropdown")).toBe(true);
  });

  it("should stop propagation when default key actions are disabled", () => {
    render(
      <Dropdown content={<div>Menu</div>} isKeyActionsEnabled={false}>
        <span>Toggle</span>
      </Dropdown>
    );

    const menu = screen.getByRole("menu");
    const event = new KeyboardEvent("keydown", { bubbles: true });
    const stopPropagation = vi.fn();
    Object.defineProperty(event, "stopPropagation", {
      value: stopPropagation,
      configurable: true,
    });

    const dispatched = menu.dispatchEvent(event);
    expect(dispatched).toBe(true);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("should keep propagation when default key actions are enabled", () => {
    render(
      <Dropdown content={<div>Menu</div>} isKeyActionsEnabled={true}>
        <span>Toggle</span>
      </Dropdown>
    );

    const menu = screen.getByRole("menu");
    const event = new KeyboardEvent("keydown", { bubbles: true });
    const stopPropagation = vi.fn();
    Object.defineProperty(event, "stopPropagation", {
      value: stopPropagation,
      configurable: true,
    });

    const dispatched = menu.dispatchEvent(event);
    expect(dispatched).toBe(true);
    expect(stopPropagation).not.toHaveBeenCalled();
  });
});
