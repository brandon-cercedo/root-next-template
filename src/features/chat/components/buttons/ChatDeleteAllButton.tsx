"use client";

import { usePathname, useRouter } from "next/navigation";
import pluralize from "pluralize";
import { Fragment } from "react/jsx-runtime";
import { toast } from "sonner";

import { handleDeleteAllChatSessions } from "@/features/chat/actions";
import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import { useConfirmationModal } from "@/hooks/use-confirmation-modal";
import { paths } from "@/lib/config/paths";
import { mergeClsx } from "@/lib/utils/styles";
import { ChatSession } from "@/prisma/types/generated/browser";

type ChatDeleteAllButtonProps = {
  chats: ChatSession[];
  className?: string;
};

export default function ChatDeleteAllButton({
  chats,
  className,
}: ChatDeleteAllButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { openConfirmation } = useConfirmationModal();
  const { chatId, closeChat } = useChatSession();

  const label = pluralize("chat", chats.length);

  const handleDeleteAll = async () => {
    const result = await handleDeleteAllChatSessions();
    if (!result.success) {
      toast.error("Failed to delete all archived chats", {
        description: "Please refresh the page and try again.",
      });
      return;
    }

    toast("All archived chats deleted permanently");

    const offcanvasChat = chats.find((chat) => chat.id === chatId);
    if (offcanvasChat) {
      closeChat(offcanvasChat.id);
    }

    const isChatPage = chats.some(
      (chat) => pathname === paths.dashboard.chat(chat.id)
    );
    if (isChatPage) {
      router.push(paths.dashboard.chats());
    }
  };

  const handleClick = () => {
    void openConfirmation({
      title: "Delete all archived chats?",
      message: (
        <Fragment>
          This will permanently delete{" "}
          <strong>
            {chats.length} archived {label}
          </strong>
          . You can&apos;t undo this.
        </Fragment>
      ),
      confirmButton: { label: "Delete all", handler: handleDeleteAll },
    });
  };

  return (
    <button
      type="button"
      className={mergeClsx(
        "flex items-center gap-x-2 rounded-lg bg-red-500 px-2 py-1.5 text-[13px] leading-5 text-white hover:bg-red-600 focus:bg-red-600 focus:text-white focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-red-600 dark:hover:text-white dark:focus:bg-red-600 dark:focus:text-white",
        className
      )}
      onClick={handleClick}
      disabled={chats.length === 0}
    >
      Delete all
    </button>
  );
}
