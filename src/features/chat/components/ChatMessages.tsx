"use client";

import clsx from "clsx";

import { getMessageText } from "@/features/chat/utils";
import { useFlag } from "@/hooks/use-flag";

import MessageActions from "./MessageActions";

import type { ChatUIMessage } from "@/hooks/use-chatbot";

function MessageSteps({ message }: { message: ChatUIMessage }) {
  const nonTextParts = message.parts.filter((part) => part.type !== "text");
  if (nonTextParts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="text-xs font-medium text-gray-500 dark:text-neutral-500">
        Steps
      </div>
      <pre className="overflow-x-auto text-xs text-gray-700 dark:text-neutral-300">
        {JSON.stringify(nonTextParts, null, 2)}
      </pre>
    </div>
  );
}

type ChatMessageProps = {
  message: ChatUIMessage;
  isDebug: boolean;
};

function ChatMessage({ message, isDebug }: ChatMessageProps) {
  const text = getMessageText(message);
  const isUser = message.role === "user";
  const metadata = message.metadata;

  return (
    <div
      key={message.id}
      className={clsx("group flex w-full flex-col gap-1", {
        "max-w-lg items-end self-end": isUser,
      })}
    >
      {isUser && (
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm whitespace-pre-wrap text-gray-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {text}
        </div>
      )}

      {!isUser && (
        <div className="space-y-3 text-sm whitespace-pre-wrap text-gray-800 dark:text-neutral-200">
          {text}
        </div>
      )}

      {isDebug && message.role === "assistant" && (
        <MessageSteps message={message} />
      )}

      <MessageActions role={message.role} text={text} metadata={metadata} />
    </div>
  );
}

type ChatMessagesProps = {
  messages: ChatUIMessage[];
};

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const { values } = useFlag();
  const isDebug = Boolean(values?.["client-debug"]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} isDebug={isDebug} />
      ))}
    </div>
  );
}
