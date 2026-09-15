import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockServerDebugFlag = vi.fn();
const mockStreamText = vi.fn();
const mockConvertToModelMessages = vi.fn();
const mockOpenai = vi.fn((model: string) => ({ modelId: model }));
const mockCreateChatTools = vi.fn(
  ({
    userId,
    keyboardCommandIds,
  }: {
    userId: string;
    keyboardCommandIds: string[];
  }) => ({
    toolsFor: userId,
    keyboardCommandIds,
  })
);
const mockCreateRepairToolCall = vi.fn(() => vi.fn());
const mockStepCountIs = vi.fn((count: number) => ({ type: "step", count }));

vi.mock("@/actions/db/user", () => ({
  getUser: () => mockGetUser(),
}));

vi.mock("@/lib/flags", () => ({
  serverDebugFlag: () => mockServerDebugFlag(),
}));

vi.mock("@/features/chat/services/tools/create-chat-tools", () => ({
  createChatTools: (options: {
    userId: string;
    keyboardCommandIds: string[];
  }) => mockCreateChatTools(options),
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
  };
});

const validBody = {
  messages: [
    {
      id: "msg-1",
      role: "user",
      parts: [{ type: "text", text: "What is Next.js?" }],
    },
  ],
  keyboardCommandIds: ["theme-dark", "go-home"],
};

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGetUser.mockResolvedValue({ id: "user-1" });
    mockServerDebugFlag.mockResolvedValue(false);
    mockConvertToModelMessages.mockResolvedValue([]);
    mockCreateChatTools.mockImplementation(
      ({
        userId,
        keyboardCommandIds,
      }: {
        userId: string;
        keyboardCommandIds: string[];
      }) => ({
        toolsFor: userId,
        keyboardCommandIds,
      })
    );
    mockCreateRepairToolCall.mockReturnValue(vi.fn());
    mockStepCountIs.mockImplementation((count: number) => ({
      type: "step",
      count,
    }));
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response("ok"),
    });
  });

  it("should return 401 without a session", async () => {
    mockGetUser.mockResolvedValue(null);

    const { POST } = await import("@/app/api/chat/route");
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      })
    );

    expect(response.status).toBe(401);
    expect(mockStreamText).not.toHaveBeenCalled();
  });

  it("should return 400 for an invalid body", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: "nope" }),
      })
    );

    expect(response.status).toBe(400);
    expect(mockStreamText).not.toHaveBeenCalled();
  });

  it("should stream a response for a valid authenticated request", async () => {
    const repair = vi.fn();
    mockCreateRepairToolCall.mockReturnValue(repair);
    const tools = {
      getCurrentUser: {},
      runKeyboardCommand: {},
    };
    mockCreateChatTools.mockReturnValue(tools as never);

    const { POST } = await import("@/app/api/chat/route");
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      })
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
    expect(mockCreateChatTools).toHaveBeenCalledWith({
      userId: "user-1",
      keyboardCommandIds: ["theme-dark", "go-home"],
    });
    expect(mockConvertToModelMessages).toHaveBeenCalledWith(
      validBody.messages,
      { tools }
    );
    expect(mockOpenai).toHaveBeenCalledWith("gpt-4o-mini");
    expect(mockStepCountIs).toHaveBeenCalledWith(5);
    expect(mockStreamText).toHaveBeenCalledOnce();

    const streamArgs = mockStreamText.mock.calls[0]?.[0] as {
      tools: unknown;
      stopWhen: unknown;
      maxRetries: number;
      temperature: number;
      repairToolCall: unknown;
      onError: unknown;
    };
    expect(streamArgs.tools).toBe(tools);
    expect(streamArgs.stopWhen).toEqual({
      type: "step",
      count: 5,
    });
    expect(streamArgs.maxRetries).toBe(2);
    expect(streamArgs.temperature).toBe(0.2);
    expect(streamArgs.repairToolCall).toBe(repair);
    expect(typeof streamArgs.onError).toBe("function");
  });
});
