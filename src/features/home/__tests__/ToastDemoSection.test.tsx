import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import ToastDemoSection from "@/features/home/components/ToastDemoSection";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ToastDemoSection", () => {
  it("should render toast demo controls", () => {
    render(<ToastDemoSection />);

    expect(screen.getByText("Toast demos")).toBeDefined();
    expect(screen.getByRole("button", { name: "Default" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Success" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Error" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Warning" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Info" })).toBeDefined();
  });

  it("should trigger toast variants when buttons are clicked", async () => {
    const user = userEvent.setup();
    render(<ToastDemoSection />);

    await user.click(screen.getByRole("button", { name: "Default" }));
    await user.click(screen.getByRole("button", { name: "Success" }));
    await user.click(screen.getByRole("button", { name: "Error" }));
    await user.click(screen.getByRole("button", { name: "Warning" }));
    await user.click(screen.getByRole("button", { name: "Info" }));

    expect(toast).toHaveBeenCalledWith("This is a default toast");
    expect(toast.success).toHaveBeenCalledWith("This is a success toast");
    expect(toast.error).toHaveBeenCalledWith("This is an error toast");
    expect(toast.warning).toHaveBeenCalledWith("This is a warning toast");
    expect(toast.info).toHaveBeenCalledWith("This is an info toast");
  });
});
