import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OVERLAY_IDS } from "@/components/constants";
import { ThemeProvider } from "@/hooks/use-theme";
import { paths } from "@/lib/config/paths";
import { fakeUserComplete } from "@/prisma/utils/fake-data";

const getFullUser = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("@/actions/db/user", () => ({
  getFullUser: () => getFullUser(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirect(url),
}));

vi.mock("@/components/theme/ThemeSelector", () => ({
  ThemeSelectorDynamic: () => <div data-testid="theme-selector" />,
}));

vi.mock("@/features/home/components/LoginConfetti", () => ({
  default: () => <div data-testid="login-confetti" />,
}));

afterEach(() => {
  cleanup();
  getFullUser.mockReset();
  redirect.mockClear();
});

describe("DashboardLayout", () => {
  const mockUser = fakeUserComplete();

  it("should export dashboard metadata", async () => {
    const { metadata } = await import("@/app/dashboard/layout");
    expect(metadata.title).toBe("Dashboard");
  });

  it("should redirect to sign-in when no user is found", async () => {
    getFullUser.mockResolvedValue(null);
    const { default: DashboardLayout } =
      await import("@/app/dashboard/layout");

    await expect(
      DashboardLayout({ children: <p>Home child content</p> })
    ).rejects.toThrow(`NEXT_REDIRECT:${paths.auth.signIn()}`);
  });

  it("should render sidebar overlay with brand link and user menu", async () => {
    const user = { ...mockUser, name: "John Doe", email: "john@example.com" };
    getFullUser.mockResolvedValue(user);

    const { default: DashboardLayout } =
      await import("@/app/dashboard/layout");

    const ui = await DashboardLayout({
      children: <p>Home child content</p>,
    });

    render(<ThemeProvider>{ui}</ThemeProvider>);

    const sidebar = screen.getByLabelText("Sidebar");
    expect(sidebar.getAttribute("id")).toBe(OVERLAY_IDS.SIDEBAR);
    expect(sidebar.getAttribute("role")).toBe("dialog");
    expect(sidebar.className).toContain("hs-overlay");
    expect(sidebar.className).toContain("w-60");

    const brandLink = within(sidebar).getByRole("link", {
      name: /Root/i,
    });
    expect(brandLink.getAttribute("href")).toBe(paths.dashboard.home());

    const footer = within(sidebar).getByRole("contentinfo");
    expect(within(footer).getByText("john@example.com")).toBeDefined();
  });

  it("should render children inside the framed main panel", async () => {
    getFullUser.mockResolvedValue(mockUser);
    const { default: DashboardLayout } =
      await import("@/app/dashboard/layout");

    const ui = await DashboardLayout({
      children: <p>Home child content</p>,
    });

    const { container } = render(<ThemeProvider>{ui}</ThemeProvider>);

    const outerFrame = container.querySelector(
      ".bg-gray-100.p-3.lg\\:fixed.lg\\:inset-0"
    );
    expect(outerFrame).not.toBeNull();
    expect(outerFrame?.className).toContain("lg:hs-overlay-layout-open:ps-60");

    const innerPanel = outerFrame?.querySelector(
      ".rounded-lg.border.overflow-hidden"
    );
    expect(innerPanel).not.toBeNull();
    expect(innerPanel?.className).toContain("h-[calc(100dvh-62px)]");
    expect(innerPanel?.className).toContain("lg:h-full");

    expect(
      within(innerPanel as HTMLElement).getByText("Home child content")
    ).toBeDefined();
    expect(screen.getByTestId("login-confetti")).toBeDefined();
  });
});
