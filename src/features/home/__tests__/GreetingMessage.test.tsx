import { cleanup, render, screen } from "@testing-library/react";
import { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import GreetingMessage from "@/features/home/components/GreetingMessage";
import { fakeUserComplete } from "@/prisma/utils/fake-data";

let typedHtml = "";

vi.mock("@/components/ui/TypingText", () => ({
  default: ({
    onInit,
  }: ComponentProps<typeof import("@/components/ui/TypingText").default>) => {
    typedHtml = "";
    const typewriter = {
      typeString(value: string) {
        typedHtml = value;
        return typewriter;
      },
      start() {
        return typewriter;
      },
    };
    onInit?.(typewriter as never);
    return <div data-testid="typing-html">{typedHtml}</div>;
  },
}));

vi.mock("@/lib/utils/date", () => ({
  getTimeOfDay: () => "morning",
}));

describe("GreetingMessage", () => {
  afterEach(() => {
    cleanup();
  });

  const mockUser = fakeUserComplete();

  it("should render greeting for the current user", () => {
    const user = { ...mockUser, name: "John D'oe" };

    render(<GreetingMessage user={user} />);

    expect(screen.getByText(/Good morning/)).toBeDefined();
    expect(typedHtml).toContain(">John<");
  });

  it.each([
    { name: "D'oe", escaped: "D&#39;oe" },
    { name: "A&B", escaped: "A&amp;B" },
    { name: 'Ann"e', escaped: "Ann&quot;e" },
  ])(
    "should escape special characters in display name ($name)",
    ({ name, escaped }) => {
      const user = { ...mockUser, name };

      render(<GreetingMessage user={user} />);

      expect(typedHtml).toContain(escaped);
    }
  );
});
