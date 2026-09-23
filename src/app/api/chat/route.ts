import { openai } from "@ai-sdk/openai";
import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
} from "ai";
import { revalidatePath } from "next/cache";

import { getUser } from "@/actions/db/user";
import { CommandId } from "@/components/keyboard/config";
import { CHAT_MODEL, CHAT_SYSTEM_PROMPT } from "@/features/chat/config";
import { ChatRequestSchema } from "@/features/chat/schema/chat";
import { createChatTools } from "@/features/chat/services/tools/create-chat-tools";
import { createRepairToolCall } from "@/features/chat/services/tools/create-repair-tool-call";
import { paths } from "@/lib/config/paths";
import { serverDebugFlag } from "@/lib/flags";
import { Prisma } from "@/prisma/types/generated/browser";
import { updateChatSession } from "@/services/chat-session";

import type { ChatUIMessage } from "@/types/chat";

export const maxDuration = 30;

function getUpdateData({
  messages,
  isAborted,
  finishReason,
  hasError,
}: {
  messages: ChatUIMessage[];
  isAborted: boolean;
  finishReason?: string;
  hasError: boolean;
}) {
  const data: Prisma.ChatSessionUpdateInput = {
    messages,
    status: "ready",
    error: null,
  };

  if (isAborted) {
    data.status = "aborted";
  } else if (finishReason === "error" || hasError) {
    data.status = "error";
    data.error =
      "Something went wrong while generating a reply. Please try again.";
  }

  return data;
}

function getInputAt(messages: ChatUIMessage[]) {
  const userMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const timestamp = userMessage?.metadata?.timestamp;
  return timestamp ? new Date(timestamp) : undefined;
}

function getOutputMetadata(messages: ChatUIMessage[]) {
  const outputAt = new Date();

  const inputAt = getInputAt(messages);
  const timestamp = outputAt.toISOString();
  const durationMs = inputAt
    ? outputAt.getTime() - inputAt.getTime()
    : undefined;

  return { timestamp, durationMs };
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    console.error("[POST /api/chat] Unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    console.error("[POST /api/chat] Invalid request body", parsed.error);
    return new Response("Invalid request body", { status: 400 });
  }

  const { messages, keyboardCommandIds, chatId } = parsed.data as {
    messages: ChatUIMessage[];
    keyboardCommandIds: Partial<CommandId[]>;
    chatId: string;
  };
  const isDebug = await serverDebugFlag();
  if (isDebug) {
    console.log(
      `🌵 [POST /api/chat] > input for chatId: ${chatId}`,
      JSON.stringify(parsed.data)
    );
  }

  const tools = createChatTools({
    userId: user.id,
    keyboardCommandIds,
  });
  const modelMessages = await convertToModelMessages(messages, {
    tools,
  });

  let hasError = false;
  const result = streamText({
    model: openai(CHAT_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    abortSignal: req.signal,
    stopWhen: stepCountIs(5),
    maxRetries: 2,
    temperature: 0.2,
    repairToolCall: createRepairToolCall(),
    onStart: async () => {
      try {
        await updateChatSession({
          id: chatId,
          userId: user.id,
          data: { status: "streaming" },
        });
        revalidatePath(paths.dashboard.chat(chatId));
      } catch (error) {
        console.error(
          `[POST /api/chat] failed to mark streaming for chatId: ${chatId}`,
          error
        );
      }
    },
    onError: (event) => {
      hasError = true;
      console.error(
        `[POST /api/chat] stream error for chatId: ${chatId}`,
        event.error
      );
    },
    onEnd: (event) => {
      if (!isDebug) {
        return;
      }
      console.log(
        `🌵 [POST /api/chat] > output for chatId: ${chatId}`,
        JSON.stringify(event)
      );
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      messageMetadata: ({ part }) => {
        if (part.type === "finish") {
          return getOutputMetadata(messages);
        }
      },
      onEnd: async ({ messages, isAborted, finishReason }) => {
        try {
          const data = getUpdateData({
            messages,
            isAborted,
            finishReason,
            hasError,
          });

          await updateChatSession({ id: chatId, userId: user.id, data });
          revalidatePath(paths.dashboard.chat(chatId));
        } catch (error) {
          console.error(
            `[POST /api/chat] failed to update chatId: ${chatId}`,
            error
          );
        }
      },
    }),
    consumeSseStream: consumeStream,
  });
}
