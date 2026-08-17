import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import TextareaAutoHeight from "@/components/ui/forms/TextareaAutoHeight";

const originalDescriptor = Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype,
  "scrollHeight"
);

let mockScrollHeight = 48;

beforeEach(() => {
  mockScrollHeight = 48;
  Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      return mockScrollHeight;
    },
  });
});

afterEach(() => {
  cleanup();
  if (originalDescriptor) {
    Object.defineProperty(
      HTMLTextAreaElement.prototype,
      "scrollHeight",
      originalDescriptor
    );
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (HTMLTextAreaElement.prototype as any).scrollHeight;
  }
});

describe("TextareaAutoHeight", () => {
  it("should adjust height on mount", async () => {
    render(<TextareaAutoHeight defaultValue="Hello" />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.style.height).toBe(`${mockScrollHeight}px`);
    });
  });

  it("should resize when input changes", async () => {
    render(<TextareaAutoHeight defaultValue="Hello" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    await waitFor(() => {
      expect(textarea.style.height).toBe(`${mockScrollHeight}px`);
    });

    mockScrollHeight = 120;
    fireEvent.input(textarea, {
      target: { value: "Hello\nWorld" },
    });

    expect(textarea.style.height).toBe(`${mockScrollHeight}px`);
  });

  it("should forward ref to textarea element", () => {
    const ref = createRef<HTMLTextAreaElement>();

    render(<TextareaAutoHeight ref={ref} defaultValue="Ref test" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
