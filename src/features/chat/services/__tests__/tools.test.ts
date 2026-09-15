import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma-client", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("createChatTools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should query getCurrentUser with the session userId only", async () => {
    const prisma = (await import("@/lib/prisma-client")).default;
    const mockFindUnique = vi.mocked(prisma.user.findUnique);

    const profile = {
      name: "Ada",
      email: "ada@example.com",
      image: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
      accounts: [{ type: "oauth", provider: "google" }],
    };
    mockFindUnique.mockResolvedValue(profile as never);

    const { createChatTools } =
      await import("@/features/chat/services/tools/create-chat-tools");
    const tools = createChatTools({
      userId: "session-user-1",
      keyboardCommandIds: ["theme-dark"],
    });

    expect(tools.getCurrentUser.execute).toBeTypeOf("function");
    const result = await tools.getCurrentUser.execute?.(
      {},
      {
        toolCallId: "call-1",
        messages: [],
        context: {},
      }
    );

    expect(mockFindUnique).toHaveBeenCalledExactlyOnceWith({
      where: { id: "session-user-1" },
      select: {
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            type: true,
            provider: true,
          },
        },
      },
    });
    expect(result).toEqual({
      ...profile,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  });

  it("should not expose execute on runKeyboardCommand", async () => {
    const { createChatTools } =
      await import("@/features/chat/services/tools/create-chat-tools");
    const tools = createChatTools({
      userId: "session-user-1",
      keyboardCommandIds: ["theme-dark", "go-home"],
    });

    expect(tools.runKeyboardCommand?.execute).toBeUndefined();
  });

  it("should omit runKeyboardCommand when no runnable ids remain", async () => {
    const { createChatTools } =
      await import("@/features/chat/services/tools/create-chat-tools");
    const tools = createChatTools({
      userId: "session-user-1",
      keyboardCommandIds: ["not-a-real-command"],
    });

    expect(tools).not.toHaveProperty("runKeyboardCommand");
  });

  it("should register runKeyboardCommand for allowlisted ids", async () => {
    const { createChatTools } =
      await import("@/features/chat/services/tools/create-chat-tools");
    const tools = createChatTools({
      userId: "session-user-1",
      keyboardCommandIds: ["theme-dark", "spoofed", "theme-dark", "go-home"],
    });

    expect(tools.runKeyboardCommand).toBeDefined();
    expect(tools.runKeyboardCommand?.execute).toBeUndefined();
  });

  it("should embed command catalog json in the tool description", async () => {
    const { createChatTools } =
      await import("@/features/chat/services/tools/create-chat-tools");
    const tools = createChatTools({
      userId: "session-user-1",
      keyboardCommandIds: ["toggle-sidebar", "theme-dark"],
    });

    const description = tools.runKeyboardCommand?.description ?? "";
    const catalog = [
      {
        id: "theme-dark",
        label: "Theme: Dark",
        group: "Theme",
      },
      {
        id: "toggle-sidebar",
        label: "Toggle sidebar",
        group: "Navigation",
        shortcut: {
          labels: {
            mac: ["⌘", "B"],
            windows: ["Ctrl", "B"],
          },
        },
      },
    ];

    expect(description).toContain("```json");
    expect(description).toContain(JSON.stringify(catalog));
    expect(description).not.toContain("spoofed");
  });
});
