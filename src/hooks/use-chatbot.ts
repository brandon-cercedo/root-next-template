"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect } from "react";

import { paths } from "@/lib/config/paths";

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

function composeAssistantMessage(
  message: ChatUIMessage,
  messages: ChatUIMessage[]
) {
  const outputAt = new Date();

  const index = messages.findIndex((current) => current.id === message.id);
  const userMessage = messages
    .slice(0, index)
    .reverse()
    .find((current) => current.role === "user");
  const inputAt = userMessage?.metadata?.timestamp
    ? new Date(userMessage.metadata.timestamp)
    : undefined;

  const timestamp = outputAt.toISOString();
  const durationMs = inputAt
    ? outputAt.getTime() - inputAt.getTime()
    : undefined;

  return {
    ...message,
    metadata: { timestamp, durationMs },
  };
}

export type ChatMessageMetadata = {
  timestamp: string; // When the message was sent (user) or finished (assistant) in ISO format.
  durationMs?: number; // Assistant only: ms from user send to stream finish.
};

export type ChatUIMessage = UIMessage<ChatMessageMetadata>;

type UseChatbotOptions = {
  initialMessages?: ChatUIMessage[];
};

export function useChatbot({ initialMessages }: UseChatbotOptions = {}) {
  const chat = useChat<ChatUIMessage>({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: paths.api.chat() }),
    onFinish: ({ message, messages }) => {
      if (message.role !== "assistant") {
        return;
      }

      const newMessage = composeAssistantMessage(message, messages);
      chat.setMessages((values) =>
        values.map((value) => (value.id === message.id ? newMessage : value))
      );
    },
  });

  useEffect(() => {
    const newMessages = initialMessages ?? [];
    chat.setMessages(newMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages]);

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
  };
}
