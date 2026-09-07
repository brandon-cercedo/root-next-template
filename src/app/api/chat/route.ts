import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { getUser } from "@/actions/db/user";
import { CHAT_MODEL, CHAT_SYSTEM_PROMPT } from "@/features/chat/config";
import { ChatRequestSchema } from "@/features/chat/schema/chat";
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

  const { messages } = parsed.data as { messages: UIMessage[] };
  const modelMessages = await convertToModelMessages(messages);

  const isDebug = await serverDebugFlag();
  if (isDebug) {
    console.log("🌵 [POST /api/chat] > input:", JSON.stringify(parsed.data));
  }

  const result = streamText({
    model: openai(CHAT_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages: modelMessages,
    onEnd: (event) => {
      if (!isDebug) {
        return;
      }
      console.log("🌵 [POST /api/chat] > output:", JSON.stringify(event));
    },
  });

  return result.toUIMessageStreamResponse();
}
