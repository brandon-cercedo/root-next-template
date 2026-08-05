import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import UserMenu from "@/components/layout/sidebar/UserMenu";
import { ThemeProvider } from "@/hooks/use-theme";
import { paths } from "@/lib/config/paths";

import { fakeUserComplete } from "../../../../../prisma/utils/fake-data";

vi.mock("@/components/theme/ThemeSelector", () => ({
  ThemeSelectorDynamic: () => <div data-testid="theme-selector" />,
}));

afterEach(() => {
  cleanup();
});

describe("UserMenu", () => {
  it("should show display name, email, theme control, and logout link", () => {
    const mockUser = fakeUserComplete();
    const user = { ...mockUser, name: "John Doe", email: "john@example.com" };

    render(
      <ThemeProvider>
        <UserMenu user={user} />
      </ThemeProvider>
    );

    expect(screen.getAllByText("John").length).toBeGreaterThan(0);
    expect(screen.getByText("john@example.com")).toBeDefined();
    expect(screen.getByTestId("theme-selector")).toBeDefined();

    const logout = screen.getByRole("link", { name: /Log out/i });
    expect(logout.getAttribute("href")).toBe(paths.auth.signOut());
  });
});
