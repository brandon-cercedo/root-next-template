import { cleanup, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it } from "vitest";

import Toasts from "@/components/ui/toasts/Toasts";
import { ThemeProvider } from "@/hooks/use-theme";

afterEach(() => {
  cleanup();
});

describe("Toasts", () => {
  it("should render the toaster", () => {
    render(
      <ThemeProvider>
        <Toasts />
      </ThemeProvider>
    );

    expect(screen.getByLabelText(/Notifications/i)).toBeDefined();
  });

  it("should show a toast message", async () => {
    render(
      <ThemeProvider>
        <Toasts />
        <button type="button" onClick={() => toast.success("Saved")}>
          Show toast
        </button>
      </ThemeProvider>
    );

    screen.getByRole("button", { name: "Show toast" }).click();

    expect(await screen.findByText("Saved")).toBeDefined();
  });
});
