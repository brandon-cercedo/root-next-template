"use client";

import { type ChatStatus } from "ai";
import clsx from "clsx";

import ClampedContainer from "@/components/ui/ClampedContainer";
import { getMessageText } from "@/features/chat/utils";
import { useFlag } from "@/hooks/use-flag";

import LoadingMessage from "./LoadingMessage";
import MessageMarkdown from "./markdown/MessageMarkdown";
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
  isAnimating: boolean;
  isDebug: boolean;
  isUserMarkdown: boolean;
};

function ChatMessage({
  message,
  isAnimating,
  isDebug,
  isUserMarkdown,
}: ChatMessageProps) {
  const text = getMessageText(message);
  const isUser = message.role === "user";
  const metadata = message.metadata;

  return (
    <div
      key={message.id}
      className={clsx("group flex w-full flex-col gap-1", {
        "max-w-4/5 items-end self-end": isUser,
      })}
    >
      {isUser && (
        <div className="w-full space-y-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          <ClampedContainer className="max-h-24.5">
            {isUserMarkdown ? (
              <MessageMarkdown isAnimating={false}>{text}</MessageMarkdown>
            ) : (
              <div className="whitespace-pre-wrap">{text}</div>
            )}
          </ClampedContainer>
        </div>
      )}

      {!isUser && (
        <div className="w-full space-y-3 text-sm text-gray-800 dark:text-neutral-200">
          <MessageMarkdown isAnimating={isAnimating}>{text}</MessageMarkdown>
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
  status: ChatStatus;
};

export default function ChatMessages({ messages, status }: ChatMessagesProps) {
  const { values } = useFlag();
  const isDebug = Boolean(values?.["client-debug"]);
  const isUserMarkdown = Boolean(values?.["user-message-markdown"]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      {messages.map((message, index) => {
        const isAnimating =
          index === messages.length - 1 &&
          status === "streaming" &&
          message.role === "assistant";

        return (
          <ChatMessage
            key={message.id}
            message={message}
            isAnimating={isAnimating}
            isDebug={isDebug}
            isUserMarkdown={isUserMarkdown}
          />
        );
      })}
      <LoadingMessage status={status} />
    </div>
  );
}
