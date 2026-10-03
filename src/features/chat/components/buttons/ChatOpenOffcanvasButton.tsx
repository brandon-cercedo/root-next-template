"use client";

import { LucidePanelRight } from "lucide-react";

import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import { mergeClsx } from "@/lib/utils/styles";
import { ChatSession } from "@/prisma/types/generated/browser";

type ChatOpenOffcanvasButtonProps = {
  chat?: ChatSession;
  label?: string;
  className?: string;
};

export default function ChatOpenOffcanvasButton({
  chat,
  label,
  className,
}: ChatOpenOffcanvasButtonProps) {
  const { openChat } = useChatSession();

  return (
    <button
      type="button"
      className={mergeClsx(
        "inline-flex size-6 flex-none items-center justify-center gap-1 rounded-lg text-[13px] leading-4 text-gray-500 hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus:bg-neutral-800",
        className
      )}
      aria-label={label ? undefined : "Move to sidebar"}
      onClick={() => openChat(chat?.id)}
    >
      <LucidePanelRight className="size-3.5 flex-none" />
      {label}
    </button>
  );
}
