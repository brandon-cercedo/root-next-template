import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import prisma from "@/lib/prisma-client";
import {
  fakeChatSessionComplete,
  fakeUserComplete,
} from "@/prisma/utils/fake-data";

const mockGetUser = vi.fn();
const mockListChatSessionsRecord = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/actions/db/user", () => ({
  getUser: () => mockGetUser(),
}));

vi.mock("@/lib/prisma-client", () => ({
  default: {
    chatSession: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/services/chat-session", () => ({
  listChatSessions: (...args: unknown[]) =>
    mockListChatSessionsRecord(...args),
}));

const mockCreate = vi.mocked(prisma.chatSession.create);
const mockRevalidatePath = vi.mocked(revalidatePath);

describe("createChatSession", () => {
  const chatId = "01a0cacd-a092-706e-b0e8-63e89f857148";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should create and return success", async () => {
    const user = fakeUserComplete();
    const session = {
      ...fakeChatSessionComplete(),
      id: chatId,
      userId: user.id,
    };
    mockGetUser.mockResolvedValue(user);
    mockCreate.mockResolvedValue(session);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-16T12:00:00.000Z"));

    try {
      const { createChatSession } = await import("@/features/chat/actions");
      const result = await createChatSession({
        id: chatId,
        title: "Hello",
        text: "Hello",
      });

      expect(result).toEqual({ success: true, id: chatId });
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          id: chatId,
          title: "Hello",
          userId: user.id,
          status: "ready",
          messages: [
            {
              id: expect.any(String),
              role: "user",
              parts: [{ type: "text", text: "Hello" }],
              metadata: { timestamp: "2026-09-16T12:00:00.000Z" },
            },
          ],
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("should return failure when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);

    const { createChatSession } = await import("@/features/chat/actions");
    const result = await createChatSession({
      id: chatId,
      title: "Hello",
      text: "Hello",
    });

    expect(result).toEqual({
      success: false,
      message: "Unauthorized",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
