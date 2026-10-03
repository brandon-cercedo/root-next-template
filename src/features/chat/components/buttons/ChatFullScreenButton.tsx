"use client";

import { LucideMaximize2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { OVERLAY_IDS } from "@/components/constants";
import { useOverlay } from "@/hooks/use-overlay";
import { paths } from "@/lib/config/paths";
import { ChatSession } from "@/prisma/types/generated/browser";

type ChatFullScreenButtonProps = {
  chat?: ChatSession;
};

export default function ChatFullScreenButton({
  chat,
}: ChatFullScreenButtonProps) {
  const router = useRouter();
  const { close } = useOverlay();

  const handleClick = () => {
    const path = chat
      ? paths.dashboard.chat(chat.id)
      : paths.dashboard.chats();
    router.push(path);
    void close(OVERLAY_IDS.CHAT_OFFCANVAS);
  };

  return (
    <button
      type="button"
      className="inline-flex size-6 flex-none items-center justify-center gap-x-1 rounded-lg text-[13px] leading-4 text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:bg-gray-200 focus:text-gray-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:text-neutral-400"
      onClick={handleClick}
    >
      <LucideMaximize2 className="size-3.5 flex-none" />
      <span className="sr-only">Open full screen</span>
    </button>
  );
}
