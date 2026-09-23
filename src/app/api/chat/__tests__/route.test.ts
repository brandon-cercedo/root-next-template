import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUserId = vi.fn();
const mockServerDebugFlag = vi.fn();
const mockStreamText = vi.fn();
const mockConvertToModelMessages = vi.fn();
const mockToUIMessageStream = vi.fn();
const mockCreateUIMessageStreamResponse = vi.fn();
const mockOpenai = vi.fn((model: string) => ({ modelId: model }));
const mockGetChatSession = vi.fn();
const mockUpdateChatSession = vi.fn();
const mockRevalidatePath = vi.fn();
const mockCreateChatTools = vi.fn();
const mockCreateRepairToolCall = vi.fn(() => vi.fn());
const mockStepCountIs = vi.fn((count: number) => ({ type: "step", count }));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));
vi.mock("@/actions/db/user", () => ({
  getUserId: () => mockGetUserId(),
}));
vi.mock("@/services/chat-session", () => ({
  getChatSession: (...args: unknown[]) => mockGetChatSession(...args),
  updateChatSession: (...args: unknown[]) => mockUpdateChatSession(...args),
}));
vi.mock("@/lib/flags", () => ({
  serverDebugFlag: () => mockServerDebugFlag(),
}));
vi.mock("@/features/chat/services/tools/create-chat-tools", () => ({
  createChatTools: (...args: unknown[]) => mockCreateChatTools(...args),
}));
vi.mock("@/features/chat/services/tools/create-repair-tool-call", () => ({
  createRepairToolCall: () => mockCreateRepairToolCall(),
}));
vi.mock("@ai-sdk/openai", () => ({
  openai: (model: string) => mockOpenai(model),
}));
vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    streamText: (...args: unknown[]) => mockStreamText(...args),
    convertToModelMessages: (...args: unknown[]) =>
      mockConvertToModelMessages(...args),
    stepCountIs: (count: number) => mockStepCountIs(count),
    toUIMessageStream: (...args: unknown[]) => mockToUIMessageStream(...args),
    createUIMessageStreamResponse: (...args: unknown[]) =>
      mockCreateUIMessageStreamResponse(...args),
  };
});

const validBody = {
  messages: [
    {
      id: "msg-1",
      role: "user",
      parts: [{ type: "text", text: "What is Next.js?" }],
      metadata: { timestamp: "2026-09-16T12:00:00.000Z" },
    },
  ],
  chatId: "01a0cacd-a092-706e-b0e8-63e89f857148",
  keyboardCommandIds: ["theme-dark", "go-home"],
};
const chatPath = `/dashboard/chats/${validBody.chatId}`;

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGetUserId.mockResolvedValue("user-1");
    mockGetChatSession.mockResolvedValue({
      id: validBody.chatId,
      userId: "user-1",
    });
    mockServerDebugFlag.mockResolvedValue(false);
    mockConvertToModelMessages.mockResolvedValue([]);
    mockUpdateChatSession.mockResolvedValue(undefined);
    mockCreateChatTools.mockReturnValue({ toolsFor: "user-1" });
    mockCreateRepairToolCall.mockReturnValue(vi.fn());
    mockStepCountIs.mockImplementation((count: number) => ({
      type: "step",
      count,
    }));
    mockStreamText.mockReturnValue({ stream: "mock-stream" });
    mockToUIMessageStream.mockReturnValue("mock-ui-stream");
    mockCreateUIMessageStreamResponse.mockReturnValue(new Response("ok"));
  });

  async function post(body: unknown = validBody) {
    const { POST } = await import("@/app/api/chat/route");
    return POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );
  }

  it("should return 401 without a session", async () => {
    mockGetUserId.mockResolvedValue(null);
    const response = await post();
    expect(response.status).toBe(401);
    expect(mockStreamText).not.toHaveBeenCalled();
  });

  it("should return 400 for an invalid body", async () => {
    const response = await post({ messages: "nope" });
    expect(response.status).toBe(400);
    expect(mockStreamText).not.toHaveBeenCalled();
  });

  it("should return 400 when chatId is missing", async () => {
    const response = await post({
      messages: validBody.messages,
      keyboardCommandIds: validBody.keyboardCommandIds,
    });
    expect(response.status).toBe(400);
    expect(mockStreamText).not.toHaveBeenCalled();
  });

  it("should return 404 when chat is missing or not owned", async () => {
    mockGetChatSession.mockResolvedValue(null);
    const response = await post();
    expect(response.status).toBe(404);
    expect(mockGetChatSession).toHaveBeenCalledWith({
      id: validBody.chatId,
      userId: "user-1",
    });
    expect(mockStreamText).not.toHaveBeenCalled();
  });

  it("should stream with server metadata and persist onEnd", async () => {
    mockCreateChatTools.mockReturnValue({
      getCurrentUser: {},
      runKeyboardCommand: {},
    } as never);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-16T12:00:00.000Z"));

    try {
      const response = await post();
      const streamOptions = mockToUIMessageStream.mock.calls[0]![0];

      expect(response.status).toBe(200);
      expect(await response.text()).toBe("ok");
      expect(mockGetChatSession).toHaveBeenCalledWith({
        id: validBody.chatId,
        userId: "user-1",
      });
      expect(mockCreateChatTools).toHaveBeenCalledWith({
        userId: "user-1",
        keyboardCommandIds: ["theme-dark", "go-home"],
      });
      expect(mockStreamText).toHaveBeenCalledWith(
        expect.objectContaining({ abortSignal: expect.any(AbortSignal) })
      );
      expect(mockCreateUIMessageStreamResponse).toHaveBeenCalledWith({
        stream: "mock-ui-stream",
        consumeSseStream: expect.any(Function),
      });
      expect(streamOptions.originalMessages[0]?.metadata?.timestamp).toBe(
        "2026-09-16T12:00:00.000Z"
      );
      expect(
        streamOptions.messageMetadata({ part: { type: "start" } })
      ).toBeUndefined();

      vi.setSystemTime(new Date("2026-09-16T12:00:02.000Z"));
      expect(
        streamOptions.messageMetadata({ part: { type: "finish" } })
      ).toEqual({
        timestamp: "2026-09-16T12:00:02.000Z",
        durationMs: 2000,
      });

      const persistedMessages = [
        { id: "msg-1", role: "user" },
        { id: "msg-2", role: "assistant" },
      ];
      await streamOptions.onEnd({
        messages: persistedMessages,
        isAborted: false,
        finishReason: "stop",
      });

      expect(mockUpdateChatSession).toHaveBeenCalledWith({
        id: validBody.chatId,
        userId: "user-1",
        data: {
          messages: persistedMessages,
          status: "ready",
          error: null,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(chatPath);
    } finally {
      vi.useRealTimers();
    }
  });

  it("should mark session streaming onStart", async () => {
    await post();
    await mockStreamText.mock.calls[0]![0].onStart();

    expect(mockUpdateChatSession).toHaveBeenCalledWith({
      id: validBody.chatId,
      userId: "user-1",
      data: { status: "streaming" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith(chatPath);
  });

  it("should persist aborted status onEnd when stream is aborted", async () => {
    await post();
    const messages = [{ id: "msg-1", role: "user" }];
    await mockToUIMessageStream.mock.calls[0]![0].onEnd({
      messages,
      isAborted: true,
      finishReason: "stop",
    });

    expect(mockUpdateChatSession).toHaveBeenCalledWith({
      id: validBody.chatId,
      userId: "user-1",
      data: { messages, status: "aborted", error: null },
    });
  });

  it("should persist error when streamText onError fires", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      await post();
      mockStreamText.mock.calls[0]![0].onError({
        error: new Error("Incorrect API key"),
      });
      const messages = [{ id: "msg-1", role: "user" }];
      await mockToUIMessageStream.mock.calls[0]![0].onEnd({
        messages,
        isAborted: false,
        finishReason: undefined,
      });

      expect(mockUpdateChatSession).toHaveBeenCalledWith({
        id: validBody.chatId,
        userId: "user-1",
        data: {
          messages,
          status: "error",
          error:
            "Something went wrong while generating a reply. Please try again.",
        },
      });
      expect(errorSpy).toHaveBeenCalledWith(
        `[POST /api/chat] stream error for chatId: ${validBody.chatId}`,
        expect.any(Error)
      );
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("should log when onEnd persist fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockUpdateChatSession.mockRejectedValue(new Error("db down"));

    try {
      await post();
      await mockToUIMessageStream.mock.calls[0]![0].onEnd({
        messages: [],
        isAborted: false,
        finishReason: "stop",
      });
      expect(errorSpy).toHaveBeenCalledWith(
        `[POST /api/chat] failed to update chatId: ${validBody.chatId}`,
        expect.any(Error)
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
