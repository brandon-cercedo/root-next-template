import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import MessageWithImage from "@/components/ui/MessageWithImage";

afterEach(() => {
  cleanup();
});

describe("MessageWithImage", () => {
  it("should render the title", () => {
    render(<MessageWithImage title="Nothing here" />);

    expect(
      screen.getByRole("heading", { name: "Nothing here" })
    ).toBeDefined();
  });

  it("should render the message when provided", () => {
    render(
      <MessageWithImage title="Empty" message="Try creating something." />
    );

    expect(screen.getByText("Try creating something.")).toBeDefined();
  });

  it("should omit the message when it is not provided", () => {
    const { container } = render(<MessageWithImage title="Empty" />);

    expect(container.querySelector("p")).toBeNull();
  });

  it("should render a custom image", () => {
    render(
      <MessageWithImage
        title="Empty"
        image={<span data-testid="custom-image">Custom</span>}
      />
    );

    expect(screen.getByTestId("custom-image")).toBeDefined();
  });

  it("should apply custom class names", () => {
    const { container } = render(
      <MessageWithImage
        title="Empty"
        className="custom-root"
        titleClassName="custom-title"
      />
    );

    expect((container.firstChild as HTMLElement).className).toContain(
      "custom-root"
    );
    expect(screen.getByRole("heading", { name: "Empty" }).className).toContain(
      "custom-title"
    );
  });
});
