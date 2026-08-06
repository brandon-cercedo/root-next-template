import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SignInView from "@/features/auth/components/SignInView";

const mockSignIn = vi.fn();

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe("SignInView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should call signIn with credentials on submit", async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null });
    const user = userEvent.setup();

    render(<SignInView />);

    await user.type(
      screen.getByLabelText("Email address"),
      "john.doe@example.com"
    );
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "john.doe@example.com",
      password: "password123",
      redirect: false,
    });
  });

  it("should call signIn with google when Google button is clicked", async () => {
    const user = userEvent.setup();

    render(<SignInView />);

    await user.click(
      screen.getByRole("button", { name: "Sign in with Google" })
    );

    expect(mockSignIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/dashboard",
    });
  });
});
