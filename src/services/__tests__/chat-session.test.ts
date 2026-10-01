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
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

const mockCreate = vi.mocked(prisma.chatSession.create);
const mockFindUnique = vi.mocked(prisma.chatSession.findUnique);
const mockFindMany = vi.mocked(prisma.chatSession.findMany);
const mockUpdate = vi.mocked(prisma.chatSession.update);
const mockDelete = vi.mocked(prisma.chatSession.delete);
const mockDeleteMany = vi.mocked(prisma.chatSession.deleteMany);

describe("createChatSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create with the given data", async () => {
    const { createChatSession } = await import("@/services/chat-session");
    const session = fakeChatSessionComplete();
    mockCreate.mockResolvedValue(session);
    const data = {
      id: session.id,
      title: session.title,
      userId: session.userId,
    };

    const result = await createChatSession(data);

    expect(result).toEqual(session);
    expect(mockCreate).toHaveBeenCalledWith({ data });
  });
});

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

  it("should order by lastMessageAt desc for the user", async () => {
    const { listChatSessions } = await import("@/services/chat-session");
    const user = fakeUserComplete();
    const sessions = [fakeChatSessionComplete()];
    mockFindMany.mockResolvedValue(sessions);

    const result = await listChatSessions(user.id);

    expect(result).toEqual(sessions);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: user.id },
      orderBy: { lastMessageAt: "desc" },
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
    mockUpdate.mockResolvedValue(session);

    const result = await updateChatSession({
      id: session.id,
      userId: session.userId,
      data: { status: "ready" },
    });

    expect(result).toEqual(session);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: session.id, userId: session.userId },
      data: { status: "ready" },
    });
  });
});

describe("deleteChatSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete by id for the owning user", async () => {
    const { deleteChatSession } = await import("@/services/chat-session");
    const session = fakeChatSessionComplete();
    mockDelete.mockResolvedValue(session);

    const result = await deleteChatSession({
      id: session.id,
      userId: session.userId,
    });

    expect(result).toEqual(session);
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: session.id, userId: session.userId },
    });
  });
});

describe("deleteAllChatSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete only archived chats for the user", async () => {
    const { deleteAllChatSessions } = await import("@/services/chat-session");
    const user = fakeUserComplete();
    mockDeleteMany.mockResolvedValue({ count: 2 });

    const result = await deleteAllChatSessions(user.id);

    expect(result).toEqual({ count: 2 });
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { userId: user.id, isArchived: true },
    });
  });
});
