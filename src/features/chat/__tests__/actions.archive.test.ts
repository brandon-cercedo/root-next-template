import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fakeChatSessionComplete,
  fakeUserComplete,
} from "@/prisma/utils/fake-data";

const mockGetUser = vi.fn();
const mockUpdateChatSession = vi.fn();
const mockDeleteAllChatSessions = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/actions/db/user", () => ({
  getUser: () => mockGetUser(),
  getUserId: vi.fn(),
}));

vi.mock("@/services/chat-session", () => ({
  createChatSession: vi.fn(),
  deleteChatSession: vi.fn(),
  deleteAllChatSessions: (...args: unknown[]) =>
    mockDeleteAllChatSessions(...args),
  updateChatSession: (...args: unknown[]) => mockUpdateChatSession(...args),
}));

const mockRevalidatePath = vi.mocked(revalidatePath);

describe("toggleArchivedChatSession", () => {
  const chatId = "01a0cacd-a092-706e-b0e8-63e89f857148";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should archive with a timestamp and return success", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockUpdateChatSession.mockResolvedValue(fakeChatSessionComplete());

    const { toggleArchivedChatSession } =
      await import("@/features/chat/actions");
    const result = await toggleArchivedChatSession({
      id: chatId,
      isArchived: true,
    });

    expect(result).toEqual({ success: true });
    expect(mockUpdateChatSession).toHaveBeenCalledWith({
      id: chatId,
      userId: user.id,
      data: { isArchived: true, archivedAt: expect.any(Date) },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("should unarchive and clear the timestamp", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockUpdateChatSession.mockResolvedValue(fakeChatSessionComplete());

    const { toggleArchivedChatSession } =
      await import("@/features/chat/actions");
    const result = await toggleArchivedChatSession({
      id: chatId,
      isArchived: false,
    });

    expect(result).toEqual({ success: true });
    expect(mockUpdateChatSession).toHaveBeenCalledWith({
      id: chatId,
      userId: user.id,
      data: { isArchived: false, archivedAt: null },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("should return failure when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);

    const { toggleArchivedChatSession } =
      await import("@/features/chat/actions");
    const result = await toggleArchivedChatSession({
      id: chatId,
      isArchived: true,
    });

    expect(result).toEqual({
      success: false,
      message: "Unauthorized",
    });
    expect(mockUpdateChatSession).not.toHaveBeenCalled();
  });

  it("should return failure when update throws", async () => {
    mockGetUser.mockResolvedValue(fakeUserComplete());
    mockUpdateChatSession.mockRejectedValue(new Error("not found"));

    const { toggleArchivedChatSession } =
      await import("@/features/chat/actions");
    const result = await toggleArchivedChatSession({
      id: chatId,
      isArchived: true,
    });

    expect(result).toEqual({
      success: false,
      message: "Failed to update archive",
    });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});

describe("handleDeleteAllChatSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should delete archived chats and return success", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockDeleteAllChatSessions.mockResolvedValue({ count: 3 });

    const { handleDeleteAllChatSessions } =
      await import("@/features/chat/actions");
    const result = await handleDeleteAllChatSessions();

    expect(result).toEqual({ success: true });
    expect(mockDeleteAllChatSessions).toHaveBeenCalledWith(user.id);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("should return failure when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);

    const { handleDeleteAllChatSessions } =
      await import("@/features/chat/actions");
    const result = await handleDeleteAllChatSessions();

    expect(result).toEqual({ success: false, message: "Unauthorized" });
    expect(mockDeleteAllChatSessions).not.toHaveBeenCalled();
  });

  it("should return failure when delete throws", async () => {
    mockGetUser.mockResolvedValue(fakeUserComplete());
    mockDeleteAllChatSessions.mockRejectedValue(new Error("db down"));

    const { handleDeleteAllChatSessions } =
      await import("@/features/chat/actions");
    const result = await handleDeleteAllChatSessions();

    expect(result).toEqual({
      success: false,
      message: "Failed to delete archived chats",
    });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
