import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Landing from "@/app/page";
import { ThemeProvider } from "@/hooks/use-theme";
import { paths } from "@/lib/config/paths";

vi.mock("@/actions/db/user", () => ({
  getUser: vi.fn().mockResolvedValue(null),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Landing", () => {
  it("should render marketing landing page when logged out", async () => {
    const ui = await Landing();
    render(<ThemeProvider>{ui}</ThemeProvider>);

    expect(screen.getByAltText("Logo light")).toBeDefined();
    expect(screen.getByAltText("Logo dark")).toBeDefined();
    expect(screen.getByRole("heading", { name: /Welcome to/i })).toBeDefined();

    const logIn = screen.getByRole("link", { name: /Log in/i });
    expect(logIn.getAttribute("href")).toBe(paths.auth.signIn());

    const getStarted = screen.getByRole("link", { name: /Get started/i });
    expect(getStarted.getAttribute("href")).toBe(paths.auth.signIn());

    expect(screen.getByText(/© \d{4} Root\./)).toBeDefined();
  });
});
