import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import PageErrorView from "@/components/PageErrorView";

vi.mock("@/components/layout/navbar/BaseNavbar", () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <nav data-testid="base-navbar">{children}</nav>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("PageErrorView", () => {
  it("should render the default error when no code is provided", () => {
    render(<PageErrorView />);

    expect(screen.getByTestId("base-navbar")).toBeDefined();
    expect(screen.getByRole("link", { name: "Home" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("500");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Oops, something went wrong",
      })
    ).toBeDefined();
    expect(
      screen.getByText(
        "Please try again later or contact support if the problem continues."
      )
    ).toBeDefined();
  });

  it("should render AccessDenied details", () => {
    render(<PageErrorView error="AccessDenied" />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("403");
    expect(
      screen.getByRole("heading", { level: 2, name: "Access Denied" })
    ).toBeDefined();
    expect(
      screen.getByText("You don't have permission to access this resource.")
    ).toBeDefined();
  });

  it("should render NotFound details", () => {
    render(<PageErrorView error="NotFound" />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("404");
    expect(
      screen.getByRole("heading", { level: 2, name: "Not Found" })
    ).toBeDefined();
    expect(screen.getByText("This page could not be found.")).toBeDefined();
  });

  it("should render FailedToSignIn details", () => {
    render(<PageErrorView error="FailedToSignIn" />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("500");
    expect(
      screen.getByRole("heading", { level: 2, name: "Failed to Sign In" })
    ).toBeDefined();
    expect(
      screen.getByText(
        "We're having trouble completing your sign-in. Please try again in a moment."
      )
    ).toBeDefined();
  });

  it("should fall back to the default error for unknown codes", () => {
    render(<PageErrorView error="Configuration" />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Oops, something went wrong",
      })
    ).toBeDefined();
  });

  it("should go back in history when the back button is clicked", async () => {
    const user = userEvent.setup();
    const back = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);

    render(<PageErrorView />);

    await user.click(screen.getByRole("button", { name: /Go Back/i }));

    expect(back).toHaveBeenCalledOnce();
    back.mockRestore();
  });
});
