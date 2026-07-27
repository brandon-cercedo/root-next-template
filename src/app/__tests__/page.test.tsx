import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Marketing from "@/app/page";

describe("Home", () => {
  it("should render marketing landing page", () => {
    render(<Marketing />);

    expect(screen.getByAltText("Logo light")).toBeDefined();
    expect(screen.getByAltText("Logo dark")).toBeDefined();
    expect(screen.getByRole("heading", { name: /Welcome to/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Get started/i })).toBeDefined();
    expect(screen.getByText(/© \d{4} Root\./)).toBeDefined();
  });
});
