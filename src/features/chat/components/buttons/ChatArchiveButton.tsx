"use client";

import { LucideArchive } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import SpinnerIcon from "@/components/ui/spinners/SpinnerIcon";
import { toggleArchivedChatSession } from "@/features/chat/actions";
import { mergeClsx } from "@/lib/utils/styles";
import { ChatSession } from "@/prisma/types/generated/browser";

type ChatArchiveButtonProps = {
  chat: ChatSession;
  className?: string;
  label?: string;
};

export default function ChatArchiveButton({
  chat,
  className,
  label,
}: ChatArchiveButtonProps) {
  const [isLoading, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleArchivedChatSession({
        id: chat.id,
        isArchived: true,
      });
      if (!result.success) {
        toast.error("Failed to archive chat", {
          description: "Please refresh the page and try again.",
        });
        return;
      }

      toast("Chat archived", {
        action: {
          label: "Undo",
          onClick: async () => {
            await toggleArchivedChatSession({
              id: chat.id,
              isArchived: false,
            });
          },
        },
      });
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
      aria-label={label ? undefined : "Archive chat"}
    >
      {isLoading ? (
        <SpinnerIcon size="sm" />
      ) : (
        <LucideArchive className="size-4 flex-none" />
      )}
      {label}
    </button>
  );
}
