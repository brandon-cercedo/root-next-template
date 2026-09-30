import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fakeChatSessionComplete,
  fakeUserComplete,
} from "@/prisma/utils/fake-data";

import type { ChatUIMessage } from "@/types/chat";

const mockGetUser = vi.fn();
const mockCreateChatSession = vi.fn();
const mockUpdateChatSession = vi.fn();
const mockDeleteChatSession = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/actions/db/user", () => ({
  getUser: () => mockGetUser(),
  getUserId: vi.fn(),
}));

vi.mock("@/services/chat-session", () => ({
  createChatSession: (...args: unknown[]) => mockCreateChatSession(...args),
  updateChatSession: (...args: unknown[]) => mockUpdateChatSession(...args),
  deleteChatSession: (...args: unknown[]) => mockDeleteChatSession(...args),
}));

const mockRevalidatePath = vi.mocked(revalidatePath);

describe("handleCreateChatSession", () => {
  const chatId = "01a0cacd-a092-706e-b0e8-63e89f857148";
  const message: ChatUIMessage = {
    id: "msg-1",
    role: "user",
    parts: [{ type: "text", text: "Hello" }],
    metadata: { timestamp: "2026-09-16T12:00:00.000Z" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should create as submitted with the message", async () => {
    const user = fakeUserComplete();
    const session = {
      ...fakeChatSessionComplete(),
      id: chatId,
      userId: user.id,
    };
    mockGetUser.mockResolvedValue(user);
    mockCreateChatSession.mockResolvedValue(session);

    const { handleCreateChatSession } =
      await import("@/features/chat/actions");
    const result = await handleCreateChatSession({
      id: chatId,
      title: "Hello",
      message,
    });

    expect(result).toEqual({ success: true, id: chatId });
    expect(mockCreateChatSession).toHaveBeenCalledWith({
      id: chatId,
      title: "Hello",
      userId: user.id,
      status: "submitted",
      messages: [message],
      lastMessageAt: new Date("2026-09-16T12:00:00.000Z"),
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("should return failure when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);

    const { handleCreateChatSession } =
      await import("@/features/chat/actions");
    const result = await handleCreateChatSession({
      id: chatId,
      title: "Hello",
      message,
    });

    expect(result).toEqual({
      success: false,
      message: "Unauthorized",
    });
    expect(mockCreateChatSession).not.toHaveBeenCalled();
  });

  it("should return failure when create throws", async () => {
    mockGetUser.mockResolvedValue(fakeUserComplete());
    mockCreateChatSession.mockRejectedValue(new Error("duplicate id"));

    const { handleCreateChatSession } =
      await import("@/features/chat/actions");
    const result = await handleCreateChatSession({
      id: chatId,
      title: "Hello",
      message,
    });

    expect(result).toEqual({
      success: false,
      message: "Failed to create chat",
    });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});

describe("handleDeleteChatSession", () => {
  const chatId = "01a0cacd-a092-706e-b0e8-63e89f857148";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should delete and return success", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockDeleteChatSession.mockResolvedValue(fakeChatSessionComplete());

    const { handleDeleteChatSession } =
      await import("@/features/chat/actions");
    const result = await handleDeleteChatSession({ id: chatId });

    expect(result).toEqual({ success: true });
    expect(mockDeleteChatSession).toHaveBeenCalledWith({
      id: chatId,
      userId: user.id,
    });
    expect(mockRevalidatePath).toHaveBeenCalled();
  });

  it("should return failure when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);

    const { handleDeleteChatSession } =
      await import("@/features/chat/actions");
    const result = await handleDeleteChatSession({ id: chatId });

    expect(result).toEqual({
      success: false,
      message: "Unauthorized",
    });
    expect(mockDeleteChatSession).not.toHaveBeenCalled();
  });

  it("should return failure when delete throws", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockDeleteChatSession.mockRejectedValue(new Error("not found"));

    const { handleDeleteChatSession } =
      await import("@/features/chat/actions");
    const result = await handleDeleteChatSession({ id: chatId });

    expect(result).toEqual({
      success: false,
      message: "Failed to delete chat",
    });
  });
});

describe("toggleFavoriteChatSession", () => {
  const chatId = "01a0cacd-a092-706e-b0e8-63e89f857148";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should toggle favorite and return success", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockUpdateChatSession.mockResolvedValue(fakeChatSessionComplete());

    const { toggleFavoriteChatSession } =
      await import("@/features/chat/actions");
    const result = await toggleFavoriteChatSession({
      id: chatId,
      isFavourite: true,
    });

    expect(result).toEqual({ success: true });
    expect(mockUpdateChatSession).toHaveBeenCalledWith({
      id: chatId,
      userId: user.id,
      data: { isFavourite: true },
    });
    expect(mockRevalidatePath).toHaveBeenCalled();
  });

  it("should return failure when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);

    const { toggleFavoriteChatSession } =
      await import("@/features/chat/actions");
    const result = await toggleFavoriteChatSession({
      id: chatId,
      isFavourite: true,
    });

    expect(result).toEqual({
      success: false,
      message: "Unauthorized",
    });
    expect(mockUpdateChatSession).not.toHaveBeenCalled();
  });

  it("should return failure when update throws", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockUpdateChatSession.mockRejectedValue(new Error("not found"));

    const { toggleFavoriteChatSession } =
      await import("@/features/chat/actions");
    const result = await toggleFavoriteChatSession({
      id: chatId,
      isFavourite: true,
    });

    expect(result).toEqual({
      success: false,
      message: "Failed to update favorite",
    });
  });
});
