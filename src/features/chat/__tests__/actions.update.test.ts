import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fakeChatSessionComplete } from "@/prisma/utils/fake-data";

import type { ChatUIMessage } from "@/types/chat";

const mockGetUserId = vi.fn();
const mockUpdateChatSession = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/actions/db/user", () => ({
  getUser: vi.fn(),
  getUserId: () => mockGetUserId(),
}));

vi.mock("@/services/chat-session", () => ({
  createChatSession: vi.fn(),
  deleteChatSession: vi.fn(),
  updateChatSession: (...args: unknown[]) => mockUpdateChatSession(...args),
}));

const mockRevalidatePath = vi.mocked(revalidatePath);

describe("handleUpdateChatMessage", () => {
  const chatId = "01a0cacd-a092-706e-b0e8-63e89f857148";
  const messages: ChatUIMessage[] = [
    {
      id: "msg-1",
      role: "user",
      parts: [{ type: "text", text: "Hi" }],
      metadata: { timestamp: "2026-09-16T11:59:00.000Z" },
    },
    {
      id: "msg-2",
      role: "assistant",
      parts: [{ type: "text", text: "Hello!" }],
      metadata: { timestamp: "2026-09-16T11:59:02.000Z", durationMs: 2000 },
    },
    {
      id: "msg-3",
      role: "user",
      parts: [{ type: "text", text: "What is Next.js?" }],
      metadata: { timestamp: "2026-09-16T12:00:00.000Z" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGetUserId.mockResolvedValue("user-1");
  });

  async function update(input: { status: string; messages: unknown[] }) {
    const { handleUpdateChatMessage } =
      await import("@/features/chat/actions");
    return handleUpdateChatMessage({
      id: chatId,
      ...input,
    } as Parameters<typeof handleUpdateChatMessage>[0]);
  }

  it("should save status, messages and last message time", async () => {
    mockUpdateChatSession.mockResolvedValue(fakeChatSessionComplete());

    const result = await update({ status: "submitted", messages });

    expect(result).toEqual({ success: true });
    expect(mockUpdateChatSession).toHaveBeenCalledWith({
      id: chatId,
      userId: "user-1",
      data: {
        status: "submitted",
        messages,
        lastMessageAt: new Date("2026-09-16T12:00:00.000Z"),
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("should return failure when unauthenticated", async () => {
    mockGetUserId.mockResolvedValue(null);

    const result = await update({ status: "submitted", messages });

    expect(result).toEqual({ success: false, message: "Unauthorized" });
    expect(mockUpdateChatSession).not.toHaveBeenCalled();
  });

  it("should reject an unknown status", async () => {
    const result = await update({ status: "unknown", messages });

    expect(result).toEqual({
      success: false,
      message: "Invalid chat message data",
    });
    expect(mockUpdateChatSession).not.toHaveBeenCalled();
  });

  it("should reject an invalid chat message", async () => {
    const result = await update({
      status: "submitted",
      messages: [{ id: "msg-1", role: "user" }],
    });

    expect(result).toEqual({
      success: false,
      message: "Invalid chat message data",
    });
    expect(mockUpdateChatSession).not.toHaveBeenCalled();
  });

  it("should return failure when update throws", async () => {
    mockUpdateChatSession.mockRejectedValue(new Error("not found"));

    const result = await update({ status: "submitted", messages });

    expect(result).toEqual({
      success: false,
      message: "Failed to save message",
    });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
