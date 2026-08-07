import { render, screen } from "@testing-library/react";
import { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import Home from "@/app/dashboard/page";
import { fakeUserComplete } from "@/prisma/utils/fake-data";

const mockUser = {
  ...fakeUserComplete(),
  name: "John Doe",
  email: "john@example.com",
};

vi.mock("@/features/auth/components/UserProvider", () => ({
  useUser: () => ({ user: mockUser }),
}));

vi.mock("@/components/ui/TypingText", () => ({
  default: ({
    onInit,
  }: ComponentProps<typeof import("@/components/ui/TypingText").default>) => {
    let html = "";
    const typewriter = {
      typeString(value: string) {
        html = value;
        return typewriter;
      },
      start() {
        return typewriter;
      },
    };
    onInit?.(typewriter as never);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  },
}));

vi.mock("@/lib/utils/date", () => ({
  getTimeOfDay: () => "morning",
}));

describe("Home", () => {
  it("should render greeting message for the current user", () => {
    render(<Home />);

    expect(screen.getByText(/Good morning/)).toBeDefined();
    expect(screen.getByText("John")).toBeDefined();
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
  });
});
