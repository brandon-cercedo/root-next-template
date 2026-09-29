"use client";

import { LucideTrash2 } from "lucide-react";

import { OverlayAction } from "@/components/constants";
import { useChatSession } from "@/features/chat/components/ChatSessionProvider";
import { mergeClsx } from "@/lib/utils/styles";
import { ChatSession } from "@/prisma/types/generated/browser";

type ChatDeleteButtonProps = {
  chat: ChatSession;
  className?: string;
  label?: string;
};

export default function ChatDeleteButton({
  chat,
  className,
  label,
}: ChatDeleteButtonProps) {
  const { setChat } = useChatSession();

  const handleClick = () => {
    setChat(chat, OverlayAction.DELETE);
  };

  return (
    <button
      type="button"
      className={mergeClsx(
        "inline-flex size-6 flex-none items-center justify-center gap-x-1 rounded-lg text-[13px] leading-4 text-red-600 hover:bg-red-100 focus:bg-red-100 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-800/30 dark:focus:bg-red-800/30",
        className
      )}
      onClick={handleClick}
    >
      <LucideTrash2 className="size-4 flex-none" />
      {label}
    </button>
  );
}
