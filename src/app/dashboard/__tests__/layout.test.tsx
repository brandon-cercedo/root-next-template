import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import DashboardLayout, { metadata } from "@/app/dashboard/layout";
import { OVERLAY_IDS } from "@/components/constants";
import { paths } from "@/lib/config/paths";

afterEach(() => {
  cleanup();
});

describe("DashboardLayout", () => {
  it("should export dashboard metadata", () => {
    expect(metadata.title).toBe("Dashboard");
  });

  it("should render sidebar overlay with brand link", () => {
    render(
      <DashboardLayout>
        <p>Home child content</p>
      </DashboardLayout>
    );

    const sidebar = screen.getByLabelText("Sidebar");
    expect(sidebar.getAttribute("id")).toBe(OVERLAY_IDS.SIDEBAR);
    expect(sidebar.getAttribute("role")).toBe("dialog");
    expect(sidebar.className).toContain("hs-overlay");
    expect(sidebar.className).toContain("w-60");

    const brandLink = within(sidebar).getByRole("link", {
      name: /Root/i,
    });
    expect(brandLink.getAttribute("href")).toBe(paths.dashboard.home());
  });

  it("should render children inside the framed main panel", () => {
    const { container } = render(
      <DashboardLayout>
        <p>Home child content</p>
      </DashboardLayout>
    );

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
  });
});
