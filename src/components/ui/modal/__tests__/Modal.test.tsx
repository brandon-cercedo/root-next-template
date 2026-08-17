"use client";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Modal from "@/components/ui/modal/Modal";

import ModalTrigger from "../ModalTrigger";

afterEach(() => {
  cleanup();
});

describe("Modal", () => {
  it("should render the provided trigger and portal content", async () => {
    const modalId = "modal-basic";

    render(
      <Modal
        id={modalId}
        trigger={
          <ModalTrigger modalId={modalId} type="button">
            Launch modal
          </ModalTrigger>
        }
      >
        <p>Modal content 🔥</p>
      </Modal>
    );

    const button = screen.getByRole("button", { name: "Launch modal" });
    const overlay = (await waitFor(() => document.getElementById(modalId), {
      timeout: 500,
    })) as HTMLElement;

    expect(button).toBeDefined();
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.getAttribute("aria-controls")).toBe(modalId);
    expect(button.getAttribute("data-hs-overlay")).toBe(`#${modalId}`);
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain("Modal content 🔥");
  });

  it("should apply layout props such as size, backdrop, scroll scope, and vertical alignment", async () => {
    const modalId = "modal-props";

    render(
      <Modal
        id={modalId}
        size="lg"
        overlayBackdrop="static"
        scrollScope="parent"
        isVerticallyCentered={true}
      >
        <div>Content</div>
      </Modal>
    );

    const overlay = (await waitFor(() => document.getElementById(modalId), {
      timeout: 500,
    })) as HTMLElement;

    const wrapper = overlay.firstElementChild as HTMLElement;
    const panel = wrapper.firstElementChild as HTMLElement;

    expect(overlay.className).toContain("[--overlay-backdrop:static]");
    expect(wrapper.className).toContain("lg:mx-auto lg:w-full lg:max-w-4xl");
    expect(wrapper.className).toContain(
      "flex min-h-[calc(100%-56px)] items-center"
    );
    expect(wrapper.className).toContain("h-[calc(100%-56px)]");
    expect(panel.className).toContain("max-h-full overflow-hidden");
  });

  it("should stop propagation when key actions are disabled", async () => {
    const modalId = "modal-no-keys";

    render(
      <Modal id={modalId} isKeyActionsEnabled={false}>
        <div>Body</div>
      </Modal>
    );

    const overlay = (await waitFor(() => document.getElementById(modalId), {
      timeout: 500,
    })) as HTMLElement;

    const event = new KeyboardEvent("keydown", { bubbles: true });
    const stopPropagation = vi.fn();
    Object.defineProperty(event, "stopPropagation", {
      value: stopPropagation,
      configurable: true,
    });

    overlay.dispatchEvent(event);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("should allow propagation when key actions are enabled", async () => {
    const modalId = "modal-keys";

    render(
      <Modal id={modalId} isKeyActionsEnabled={true}>
        <div>Body</div>
      </Modal>
    );

    const overlay = (await waitFor(() => document.getElementById(modalId), {
      timeout: 500,
    })) as HTMLElement;

    const event = new KeyboardEvent("keydown", { bubbles: true });
    const stopPropagation = vi.fn();
    Object.defineProperty(event, "stopPropagation", {
      value: stopPropagation,
      configurable: true,
    });

    overlay.dispatchEvent(event);
    expect(stopPropagation).not.toHaveBeenCalled();
  });
});
