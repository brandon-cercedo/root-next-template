"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v7 as uuidv7 } from "uuid";

import Alert from "@/components/ui/Alert";
import ScrollableContainer from "@/components/ui/ScrollableContainer";
import { createChatSession } from "@/features/chat/actions";
import { useAgent } from "@/features/chat/hooks/use-agent";
import { getChatTitle } from "@/features/chat/utils";
import GreetingMessage from "@/features/home/components/GreetingMessage";
import { useFlag } from "@/hooks/use-flag";
import { paths } from "@/lib/config/paths";
import { mergeClsx } from "@/lib/utils/styles";
import { ChatSession, User } from "@/prisma/types/generated/browser";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

type ChatSectionProps = {
  user: User;
  chat?: ChatSession;
  className?: string;
};

export default function ChatSection({
  user,
  chat,
  className,
}: ChatSectionProps) {
  const chatId = chat?.id;

  const router = useRouter();
  const { values } = useFlag();
  const [id, setId] = useState(() => chatId ?? uuidv7());
  const [isCreated, setIsCreated] = useState(() => Boolean(chatId));
  const [createError, setCreateError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(chatId);
    setIsCreated(true);
  }, [chatId]);

  const isClientDebug = Boolean(values?.["client-debug"]);

  const {
    messages,
    sendMessage,
    status,
    stop,
    error: agentError,
  } = useAgent({
    id: id,
    initialMessages: chat?.messages,
  });
  const isNew = !isCreated;
  const error = createError ?? agentError?.message;

  if (isClientDebug) {
    console.log("🌵 [ChatSection]", {
      id,
      isCreated,
      messages,
      status,
      error,
    });
  }

  async function handleSend(text: string) {
    setCreateError(null);

    if (isCreated) {
      void sendMessage({ text });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createChatSession({
        id: id,
        title: getChatTitle(text),
        text,
      });
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error) {
      if (isClientDebug) {
        console.error("🌵 [ChatSection] createChatSession error", error);
      }
      setCreateError("Failed to save chat. Please try again.");
      throw new Error("Failed to create chat session");
    } finally {
      setIsLoading(false);
    }

    setIsCreated(true);
    await sendMessage({ text });
    router.push(paths.dashboard.chat(id));
  }

  return (
    <ScrollableContainer.section
      containerClassName="[&::-webkit-scrollbar]:w-0"
      className="items-center"
      buttonClassName="bottom-32.5"
    >
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

          {error && <Alert type="danger" variant="soft" message={error} />}
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
            disabled={isLoading}
            onSend={handleSend}
            onStop={stop}
          />
        </motion.div>
      </div>
    </ScrollableContainer.section>
  );
}
