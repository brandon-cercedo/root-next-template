"use client";

import { Chat, useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type ChatOnToolCallCallback,
} from "ai";

import { useChatInstances } from "@/hooks/use-chat-instances";
import { useKeyboard } from "@/hooks/use-keyboard";
import { paths } from "@/lib/config/paths";

import { KeyboardCommandInput } from "../schema/tools";

import type { ChatUIMessage } from "@/types/chat";

type SendMessageInput = Parameters<
  ReturnType<typeof useChat<ChatUIMessage>>["sendMessage"]
>[0];

function composeUserMessage(message?: SendMessageInput) {
  const timestamp = new Date().toISOString();

  const newMessage = message
    ? {
        ...message,
        metadata: {
          ...message.metadata,
          timestamp,
        },
      }
    : undefined;

  return newMessage;
}

type AgentChat = Chat<ChatUIMessage>;

type AgentToolCall = Parameters<
  ChatOnToolCallCallback<ChatUIMessage>
>[0]["toolCall"];

type UseAgentOptions = {
  id: string;
  initialMessages?: ChatUIMessage[];
};

export function useAgent({ id, initialMessages }: UseAgentOptions) {
  const { getOrCreateInstance } = useChatInstances();
  const { commandsByIdRef } = useKeyboard();

  const runKeyboardCommand = (toolCall: AgentToolCall, chat: AgentChat) => {
    const commandId = (toolCall.input as KeyboardCommandInput).commandId;
    if (!commandId) {
      chat.addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        state: "output-error",
        errorText: "Missing commandId for tool call.",
      });
      return;
    }

    const command = commandsByIdRef.current.get(commandId);
    if (!command) {
      chat.addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        state: "output-error",
        errorText: `Command "${commandId}" is not available (missing from registry or not permitted).`,
      });
      return;
    }

    try {
      command.run();
      chat.addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: { success: true, commandId },
      });
    } catch {
      chat.addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        state: "output-error",
        errorText: `Failed to run command "${commandId}".`,
      });
    }
  };

  const createInstance = () => {
    const chat: AgentChat = new Chat({
      id,
      messages: initialMessages,
      transport: new DefaultChatTransport({
        api: paths.api.chat(),
        body: () => ({
          keyboardCommandIds: Array.from(commandsByIdRef.current.keys()),
          chatId: id,
        }),
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      onToolCall: async ({ toolCall }) => {
        if (toolCall.dynamic) {
          return;
        }

        if (toolCall.toolName === "runKeyboardCommand") {
          runKeyboardCommand(toolCall, chat);
        }
      },
    });
    return chat;
  };

  // eslint-disable-next-line react-hooks/refs -- create only stores deferred readers; .current is not read during this render call.
  const instance = getOrCreateInstance({ id, create: createInstance });

  const chat = useChat({ chat: instance });

  const sendMessage: typeof chat.sendMessage = (message, options) => {
    const newMessage = composeUserMessage(message);
    return chat.sendMessage(newMessage, options);
  };

  return {
    messages: chat.messages,
    sendMessage,
    status: chat.status,
    stop: chat.stop,
    error: chat.error,
    addToolOutput: chat.addToolOutput,
  };
}
