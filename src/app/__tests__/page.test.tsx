import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Marketing from "@/app/page";
import { ThemeProvider } from "@/hooks/use-theme";

describe("Landing", () => {
  it("should render marketing landing page", () => {
    render(
      <ThemeProvider>
        <Marketing />
      </ThemeProvider>
    );

    expect(screen.getByAltText("Logo light")).toBeDefined();
    expect(screen.getByAltText("Logo dark")).toBeDefined();
    expect(screen.getByRole("heading", { name: /Welcome to/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Get started/i })).toBeDefined();
    expect(screen.getByText(/© \d{4} Root\./)).toBeDefined();
  });
});
