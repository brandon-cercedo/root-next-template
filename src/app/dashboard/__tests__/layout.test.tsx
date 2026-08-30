import { cleanup, render, screen, within } from "@testing-library/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
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

vi.mock("@/components/flags/FlagToolbar", async () => {
  const { isAdmin } = await import("@/lib/utils/db/user");

  return {
    default: ({ user }: { user: { email: string } }) => {
      if (!isAdmin(user)) {
        return null;
      }

      return <div data-testid="flag-toolbar" />;
    },
  };
});

const defaultFlagValues = {
  "client-debug": false,
  "server-debug": false,
};

const getFlagValues = vi.fn().mockResolvedValue(defaultFlagValues);
const getFlagOverrides = vi.fn().mockResolvedValue({});

vi.mock("@/actions/flags/utils", () => ({
  getFlagValues: () => getFlagValues(),
  getFlagOverrides: () => getFlagOverrides(),
}));

const isAdmin = vi.fn().mockReturnValue(true);

vi.mock("@/lib/utils/db/user", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/db/user")>();
  return {
    ...actual,
    isAdmin: (user: { email: string }) => isAdmin(user),
  };
});

async function resolveAsyncTree(node: ReactNode): Promise<ReactNode> {
  if (node == null || typeof node === "boolean") {
    return node;
  }

  if (Array.isArray(node)) {
    return Promise.all(node.map((child) => resolveAsyncTree(child)));
  }

  if (!isValidElement(node)) {
    return node;
  }

  const { type, props: elementProps } = node;
  const props = elementProps as Record<string, unknown>;

  if (
    typeof type === "function" &&
    type.constructor.name === "AsyncFunction"
  ) {
    const resolved = await (
      type as (props: Record<string, unknown>) => Promise<ReactNode>
    )(props);

    return resolveAsyncTree(resolved);
  }

  const nextProps = { ...props };

  if ("children" in props && props.children !== undefined) {
    nextProps.children = await resolveAsyncTree(props.children as ReactNode);
  }

  if (nextProps.children === props.children) {
    return node;
  }

  return {
    ...node,
    props: nextProps,
  } as ReactElement;
}

async function renderLayout(children: ReactNode) {
  const { default: DashboardLayout } = await import("@/app/dashboard/layout");
  const ui = await DashboardLayout({ children });
  const resolved = await resolveAsyncTree(ui);

  return render(<ThemeProvider>{resolved}</ThemeProvider>);
}

afterEach(() => {
  cleanup();
  getFullUser.mockReset();
  redirect.mockClear();
  getFlagValues.mockReset();
  getFlagOverrides.mockReset();
  isAdmin.mockReset();
  getFlagValues.mockResolvedValue(defaultFlagValues);
  getFlagOverrides.mockResolvedValue({});
  isAdmin.mockReturnValue(true);
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

    await renderLayout(<p>Home child content</p>);

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

    const { container } = await renderLayout(<p>Home child content</p>);

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

  it("should fetch flag values and overrides when user is admin", async () => {
    getFullUser.mockResolvedValue(mockUser);
    isAdmin.mockReturnValue(true);
    const { default: DashboardLayout } =
      await import("@/app/dashboard/layout");

    const ui = await DashboardLayout({
      children: <p>Home child content</p>,
    });
    await resolveAsyncTree(ui);

    expect(getFlagValues).toHaveBeenCalledOnce();
    expect(getFlagOverrides).toHaveBeenCalledOnce();
  });

  it("should skip flag fetches when user is not admin", async () => {
    getFullUser.mockResolvedValue(mockUser);
    isAdmin.mockReturnValue(false);

    await renderLayout(<p>Home child content</p>);

    expect(getFlagValues).not.toHaveBeenCalled();
    expect(getFlagOverrides).not.toHaveBeenCalled();
    expect(screen.queryByTestId("flag-toolbar")).toBeNull();
    expect(screen.queryByTestId("debug-mode-badge")).toBeNull();
  });

  it("should hide the debug badge when both debug flags are off", async () => {
    getFullUser.mockResolvedValue(mockUser);
    getFlagValues.mockResolvedValue({
      "client-debug": false,
      "server-debug": false,
    });

    await renderLayout(<p>Home child content</p>);

    expect(screen.queryByTestId("debug-mode-badge")).toBeNull();
    expect(screen.getByTestId("flag-toolbar")).toBeDefined();
  });

  it("should show Client chip when client-debug is on", async () => {
    getFullUser.mockResolvedValue(mockUser);
    getFlagValues.mockResolvedValue({
      "client-debug": true,
      "server-debug": false,
    });

    const { container } = await renderLayout(<p>Home child content</p>);

    const innerPanel = container.querySelector(
      ".rounded-lg.border.overflow-hidden"
    );
    expect(innerPanel).not.toBeNull();
    expect(
      within(innerPanel as HTMLElement).getByTestId("debug-mode-badge")
    ).toBeDefined();
    expect(screen.getByText("Debug")).toBeDefined();
    expect(screen.getByText("Client")).toBeDefined();
    expect(screen.queryByText("Server")).toBeNull();
  });

  it("should show Server chip when server-debug is on", async () => {
    getFullUser.mockResolvedValue(mockUser);
    getFlagValues.mockResolvedValue({
      "client-debug": false,
      "server-debug": true,
    });

    await renderLayout(<p>Home child content</p>);

    expect(screen.getByTestId("debug-mode-badge")).toBeDefined();
    expect(screen.getByText("Server")).toBeDefined();
    expect(screen.queryByText("Client")).toBeNull();
  });

  it("should hide FlagToolbar when isAdmin is false", async () => {
    getFullUser.mockResolvedValue(mockUser);
    isAdmin.mockReturnValue(false);

    await renderLayout(<p>Home child content</p>);

    expect(screen.queryByTestId("flag-toolbar")).toBeNull();
  });
});
