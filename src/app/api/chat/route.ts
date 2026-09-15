import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText } from "ai";

import { getUser } from "@/actions/db/user";
import { CommandId } from "@/components/keyboard/config";
import { CHAT_MODEL, CHAT_SYSTEM_PROMPT } from "@/features/chat/config";
import { ChatRequestSchema } from "@/features/chat/schema/chat";
import { createChatTools } from "@/features/chat/services/tools/create-chat-tools";
import { createRepairToolCall } from "@/features/chat/services/tools/create-repair-tool-call";
import { ChatUIMessage } from "@/hooks/use-chatbot";
import { serverDebugFlag } from "@/lib/flags";

export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 });
  }

  const { messages, keyboardCommandIds } = parsed.data as {
    messages: ChatUIMessage[];
    keyboardCommandIds: Partial<CommandId[]>;
  };
  const tools = createChatTools({
    userId: user.id,
    keyboardCommandIds,
  });
  const modelMessages = await convertToModelMessages(messages, {
    tools,
  });

  const isDebug = await serverDebugFlag();
  if (isDebug) {
    console.log("🌵 [POST /api/chat] > input:", JSON.stringify(parsed.data));
  }

  const result = streamText({
    model: openai(CHAT_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
    maxRetries: 2,
    temperature: 0.2,
    repairToolCall: createRepairToolCall(),
    onError: (event) => {
      console.error("[POST /api/chat] stream error", event.error);
    },
    onEnd: (event) => {
      if (!isDebug) {
        return;
      }
      console.log("🌵 [POST /api/chat] > output:", JSON.stringify(event));
    },
  });

  return result.toUIMessageStreamResponse();
}
