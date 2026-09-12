"use client";

import { motion } from "motion/react";

import chatSession from "@/../scripts/seed/data/chat-session.js";
import Alert from "@/components/ui/Alert";
import GreetingMessage from "@/features/home/components/GreetingMessage";
import { useChatbot, type ChatUIMessage } from "@/hooks/use-chatbot";
import { useFlag } from "@/hooks/use-flag";
import { mergeClsx } from "@/lib/utils/styles";
import { User } from "@/prisma/types/generated/browser";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

type ChatSectionProps = {
  user: User;
  className?: string;
};

export default function ChatSection({ user, className }: ChatSectionProps) {
  const { values } = useFlag();
  const isClientDebug = Boolean(values?.["client-debug"]);

  const { messages, sendMessage, status, stop, error } = useChatbot({
    initialMessages: isClientDebug
      ? (chatSession.messages as ChatUIMessage[])
      : undefined,
  });
  const isNew = !messages.length;

  if (isClientDebug) {
    console.log("🌵 [ChatSection]", {
      messages,
      status,
      error,
    });
  }

  return (
    <section className="flex flex-1 flex-col items-center overflow-y-auto [&::-webkit-scrollbar]:w-0">
      <div
        className={mergeClsx(
          "relative flex w-full flex-1 flex-col gap-4",
          { "justify-center": isNew },
          className
        )}
      >
        <div
          className={mergeClsx("flex flex-col gap-4", {
            "flex-1 pt-4 pb-10 sm:pb-20": !isNew,
          })}
        >
          {isNew && <GreetingMessage user={user} />}

          <ChatMessages messages={messages} status={status} />

          {error && (
            <Alert type="danger" variant="soft" message={error.message} />
          )}
        </div>

        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 32,
          }}
          className="sticky bottom-4 z-10 w-full"
        >
          <ChatInput
            status={status}
            onSend={(text) => {
              void sendMessage({ text });
            }}
            onStop={stop}
          />
        </motion.div>
      </div>
    </section>
  );
}
