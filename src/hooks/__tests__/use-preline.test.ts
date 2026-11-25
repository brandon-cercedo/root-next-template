import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePreline } from "@/hooks/use-preline";

const mockAutoInit = vi.hoisted(() => vi.fn());
const usePathname = vi.hoisted(() => vi.fn(() => "/"));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

vi.mock("preline/non-auto", () => ({
  HSStaticMethods: {
    autoInit: mockAutoInit,
  },
}));

const INIT_DELAY = 100;

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

async function renderPreline() {
  const hook = renderHook(() => usePreline());
  await advance(INIT_DELAY);
  return hook;
}

async function appendAndSettle(node: Node) {
  await act(async () => {
    document.body.appendChild(node);
  });
  await advance(INIT_DELAY);
}

function createElement(className: string) {
  const element = document.createElement("div");
  element.className = className;
  return element;
}

describe("usePreline", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockAutoInit.mockClear();
    usePathname.mockReturnValue("/");
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it("should load Preline and call autoInit after mount", async () => {
    await renderPreline();

    expect(mockAutoInit).toHaveBeenCalledOnce();
  });

  it("should re-initialize Preline when the pathname changes", async () => {
    const { rerender } = await renderPreline();

    usePathname.mockReturnValue("/dashboard");
    await act(async () => {
      rerender();
    });
    await advance(INIT_DELAY);

    expect(mockAutoInit).toHaveBeenCalledTimes(2);
  });

  it("should autoInit when a plugin root is added after mount", async () => {
    document.body.appendChild(createElement("hs-overlay"));
    await renderPreline();

    await appendAndSettle(createElement("hs-overlay"));

    expect(mockAutoInit).toHaveBeenCalledTimes(2);
  });

  it("should ignore Preline backdrop nodes", async () => {
    await renderPreline();

    await appendAndSettle(createElement("hs-overlay-backdrop"));

    expect(mockAutoInit).toHaveBeenCalledOnce();
  });

  it("should autoInit when a nested plugin root is added", async () => {
    await renderPreline();

    const wrapper = document.createElement("div");
    wrapper.appendChild(createElement("hs-tooltip"));
    await appendAndSettle(wrapper);

    expect(mockAutoInit).toHaveBeenCalledTimes(2);
  });

  it("should autoInit when a nested data-hs-select is added", async () => {
    await renderPreline();

    const wrapper = document.createElement("div");
    const select = document.createElement("select");
    select.setAttribute("data-hs-select", "{}");
    wrapper.appendChild(select);
    await appendAndSettle(wrapper);

    expect(mockAutoInit).toHaveBeenCalledTimes(2);
  });

  it("should debounce autoInit when plugin roots are added quickly", async () => {
    await renderPreline();

    await act(async () => {
      document.body.appendChild(createElement("hs-tooltip"));
    });
    await advance(INIT_DELAY / 2);
    await appendAndSettle(createElement("hs-dropdown"));

    expect(mockAutoInit).toHaveBeenCalledTimes(2);
  });

  it("should ignore overlay backdrop templates", async () => {
    await renderPreline();

    const template = createElement("hs-overlay");
    template.setAttribute("data-hs-overlay-backdrop-template", "");
    await appendAndSettle(template);

    expect(mockAutoInit).toHaveBeenCalledOnce();
  });

  it("should not call autoInit after unmount", async () => {
    const { unmount } = renderHook(() => usePreline());

    unmount();
    await advance(INIT_DELAY);

    expect(mockAutoInit).not.toHaveBeenCalled();
  });
});
