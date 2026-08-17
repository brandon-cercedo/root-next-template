import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import BaseEmojiPicker from "@/components/emoji-picker/BaseEmojiPicker";

vi.mock("frimousse", () => ({
  EmojiPicker: {
    Root: ({
      children,
      columns,
      onEmojiSelect,
    }: {
      children: React.ReactNode;
      columns?: number;
      onEmojiSelect?: (emoji: { emoji: string; label: string }) => void;
    }) => (
      <div data-testid="emoji-picker-root" data-columns={columns}>
        <button
          type="button"
          onClick={() => onEmojiSelect?.({ emoji: "😀", label: "grinning" })}
        >
          Select grinning
        </button>
        {children}
      </div>
    ),
    Search: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
      <input aria-label="Search emoji" {...props} />
    ),
    Viewport: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
    Loading: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Empty: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    List: ({
      components,
    }: {
      components?: {
        CategoryHeader?: React.ComponentType<{
          category: { label: string };
        }>;
        Row?: React.ComponentType<{ children: React.ReactNode }>;
        Emoji?: React.ComponentType<{
          emoji: { emoji: string; label: string; isActive: boolean };
        }>;
      };
    }) => {
      const CategoryHeader = components?.CategoryHeader;
      const Row = components?.Row;
      const EmojiButton = components?.Emoji;

      return (
        <div>
          {CategoryHeader ? (
            <CategoryHeader category={{ label: "Smileys" }} />
          ) : null}
          {Row ? (
            <Row>
              {EmojiButton ? (
                <EmojiButton
                  emoji={{
                    emoji: "😀",
                    label: "grinning",
                    isActive: false,
                  }}
                />
              ) : null}
            </Row>
          ) : null}
        </div>
      );
    },
    ActiveEmoji: ({
      children,
    }: {
      children: (state: {
        emoji: { emoji: string; label: string } | null;
      }) => React.ReactNode;
    }) => children({ emoji: null }),
    SkinToneSelector: (
      props: React.ButtonHTMLAttributes<HTMLButtonElement>
    ) => (
      <button type="button" aria-label="Skin tone" {...props}>
        Tone
      </button>
    ),
  },
}));

afterEach(() => {
  cleanup();
});

describe("BaseEmojiPicker", () => {
  it("should render search, loading, empty, and skin tone controls", () => {
    render(<BaseEmojiPicker />);

    expect(screen.getByLabelText("Search emoji")).toBeDefined();
    expect(screen.getByText("Loading…")).toBeDefined();
    expect(screen.getByText("No emoji found.")).toBeDefined();
    expect(screen.getByText("Select an emoji…")).toBeDefined();
    expect(screen.getByLabelText("Skin tone")).toBeDefined();
  });

  it("should pass columns and render custom list components", () => {
    render(<BaseEmojiPicker columns={6} />);

    expect(
      screen.getByTestId("emoji-picker-root").getAttribute("data-columns")
    ).toBe("6");
    expect(screen.getByText("Smileys")).toBeDefined();
    expect(screen.getByRole("button", { name: "😀" })).toBeDefined();
  });

  it("should render actions and call onSelect", () => {
    const onSelect = vi.fn();

    render(
      <BaseEmojiPicker
        onSelect={onSelect}
        actions={<button type="button">Clear</button>}
      />
    );

    expect(screen.getByRole("button", { name: "Clear" })).toBeDefined();
    screen.getByRole("button", { name: "Select grinning" }).click();
    expect(onSelect).toHaveBeenCalledWith({
      emoji: "😀",
      label: "grinning",
    });
  });
});
