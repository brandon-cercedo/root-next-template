"use client";

import { LucideRotateCcw } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import SpinnerIcon from "@/components/ui/spinners/SpinnerIcon";
import { toggleArchivedChatSession } from "@/features/chat/actions";
import { mergeClsx } from "@/lib/utils/styles";
import { ChatSession } from "@/prisma/types/generated/browser";

type ChatRestoreButtonProps = {
  chat: ChatSession;
  className?: string;
  label?: string;
};

export default function ChatRestoreButton({
  chat,
  className,
  label,
}: ChatRestoreButtonProps) {
  const [isLoading, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleArchivedChatSession({
        id: chat.id,
        isArchived: false,
      });
      if (!result.success) {
        toast.error("Failed to unarchive chat", {
          description: "Please refresh the page and try again.",
        });
        return;
      }

      toast("Chat unarchived");
    });
  };

  return (
    <button
      type="button"
      className={mergeClsx(
        "inline-flex size-6 flex-none items-center justify-center gap-x-1 rounded-lg text-[13px] leading-4 text-gray-500 hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={label ? undefined : "Unarchive chat"}
    >
      {isLoading ? (
        <SpinnerIcon size="sm" />
      ) : (
        <LucideRotateCcw className="size-4 flex-none" />
      )}
      {label}
    </button>
  );
}
