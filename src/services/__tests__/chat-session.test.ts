import { beforeEach, describe, expect, it, vi } from "vitest";

import prisma from "@/lib/prisma-client";
import {
  fakeChatSessionComplete,
  fakeUserComplete,
} from "@/prisma/utils/fake-data";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma-client", () => ({
  default: {
    chatSession: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockFindUnique = vi.mocked(prisma.chatSession.findUnique);
const mockFindMany = vi.mocked(prisma.chatSession.findMany);
const mockUpdate = vi.mocked(prisma.chatSession.update);

describe("getChatSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should look up by id and userId", async () => {
    const { getChatSession } = await import("@/services/chat-session");
    const session = fakeChatSessionComplete();
    mockFindUnique.mockResolvedValue(session);

    const result = await getChatSession({
      id: session.id,
      userId: session.userId,
    });

    expect(result).toEqual(session);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: session.id, userId: session.userId },
    });
  });

  it("should return null when not found for the user", async () => {
    const { getChatSession } = await import("@/services/chat-session");
    mockFindUnique.mockResolvedValue(null);

    const result = await getChatSession({
      id: "missing",
      userId: "user-1",
    });

    expect(result).toBeNull();
  });
});

describe("listChatSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should order by updatedAt desc for the user", async () => {
    const { listChatSessions } = await import("@/services/chat-session");
    const user = fakeUserComplete();
    const sessions = [fakeChatSessionComplete()];
    mockFindMany.mockResolvedValue(sessions);

    const result = await listChatSessions(user.id);

    expect(result).toEqual(sessions);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
  });

  it("should return an empty list when the user has none", async () => {
    const { listChatSessions } = await import("@/services/chat-session");
    const user = fakeUserComplete();
    mockFindMany.mockResolvedValue([]);

    const result = await listChatSessions(user.id);

    expect(result).toEqual([]);
  });
});

describe("updateChatSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update by id for the owning user", async () => {
    const { updateChatSession } = await import("@/services/chat-session");
    const session = {
      ...fakeChatSessionComplete(),
      status: "ready" as const,
    };
    mockFindUnique.mockResolvedValue({ id: session.id } as never);
    mockUpdate.mockResolvedValue(session);

    const result = await updateChatSession({
      id: session.id,
      userId: session.userId,
      data: { status: "ready" },
    });

    expect(result).toEqual(session);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: session.id, userId: session.userId },
      select: { id: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: session.id },
      data: { status: "ready" },
    });
  });

  it("should throw when not found for the user", async () => {
    const { updateChatSession } = await import("@/services/chat-session");
    mockFindUnique.mockResolvedValue(null);

    await expect(
      updateChatSession({
        id: "missing",
        userId: "user-1",
        data: { status: "ready" },
      })
    ).rejects.toThrow("[updateChatSession] Chat session not found: missing");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
