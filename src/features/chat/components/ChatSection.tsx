"use client";

import chatSession from "@/../scripts/seed/data/chat-session.js";
import Alert from "@/components/ui/Alert";
import { useChatbot, type ChatUIMessage } from "@/hooks/use-chatbot";
import { useFlag } from "@/hooks/use-flag";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

export default function ChatSection() {
  const { values } = useFlag();
  const isClientDebug = Boolean(values?.["client-debug"]);

  const { messages, sendMessage, status, stop, error } = useChatbot({
    initialMessages: isClientDebug
      ? (chatSession.messages as ChatUIMessage[])
      : undefined,
  });

  if (isClientDebug) {
    console.log("🌵 [ChatSection]", {
      messages,
      status,
      error,
    });
  }

  return (
    <section className="relative flex w-full flex-col gap-4">
      <ChatMessages messages={messages} status={status} />

      {error && <Alert type="danger" variant="soft" message={error.message} />}

      <ChatInput
        status={status}
        onSend={(text) => {
          void sendMessage({ text });
        }}
        onStop={stop}
      />
    </section>
  );
}
