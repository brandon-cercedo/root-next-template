import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockServerDebugFlag = vi.fn();
const mockStreamText = vi.fn();
const mockConvertToModelMessages = vi.fn();
const mockOpenai = vi.fn((model: string) => ({ modelId: model }));

vi.mock("@/actions/db/user", () => ({
  getUser: () => mockGetUser(),
}));

vi.mock("@/lib/flags", () => ({
  serverDebugFlag: () => mockServerDebugFlag(),
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
};

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGetUser.mockResolvedValue({ id: "user-1" });
    mockServerDebugFlag.mockResolvedValue(false);
    mockConvertToModelMessages.mockResolvedValue([]);
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
    expect(mockConvertToModelMessages).toHaveBeenCalledWith(
      validBody.messages
    );
    expect(mockOpenai).toHaveBeenCalledWith("gpt-4.1-mini");
    expect(mockStreamText).toHaveBeenCalledOnce();
  });
});
