"use client";

import { LucideTrash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react/jsx-runtime";
import { toast } from "sonner";

import { handleDeleteChatSession } from "@/features/chat/actions";
import { useConfirmationModal } from "@/hooks/use-confirmation-modal";
import { paths } from "@/lib/config/paths";
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
  const router = useRouter();
  const pathname = usePathname();
  const { openConfirmation } = useConfirmationModal();

  const handleDelete = async () => {
    const result = await handleDeleteChatSession({ id: chat.id });
    if (!result.success) {
      toast.error("Failed to delete chat", {
        description: "Please refresh the page and try again.",
      });
      return;
    }

    toast("Chat deleted permanently");
    if (pathname === paths.dashboard.chat(chat.id)) {
      router.push(paths.dashboard.chats());
    }
  };

  const handleClick = () => {
    void openConfirmation({
      title: "Delete this chat?",
      message: (
        <Fragment>
          This will permanently delete <strong>{chat.title}</strong>. You
          can&apos;t undo this.
        </Fragment>
      ),
      confirmButton: { label: "Delete chat", handler: handleDelete },
    });
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
