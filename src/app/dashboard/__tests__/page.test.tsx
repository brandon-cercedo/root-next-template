import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/dashboard/page";

describe("Home", () => {
  it("should render home view content", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeDefined();
    expect(screen.getByText(/Placeholder dashboard content/)).toBeDefined();
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
  });
});
