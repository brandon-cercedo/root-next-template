import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("should render the text `To get started, edit the page.tsx file.`", () => {
    render(<Home />);
    expect(
      screen.getByText(/^To get started, edit the page.tsx file./)
    ).toBeDefined();
  });
});
