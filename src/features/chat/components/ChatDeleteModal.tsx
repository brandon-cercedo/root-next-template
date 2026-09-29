"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { OVERLAY_IDS } from "@/components/constants";
import Modal from "@/components/ui/modal/Modal";
import ModalCloseButton from "@/components/ui/modal/ModalCloseButton";
import SpinnerIcon from "@/components/ui/spinners/SpinnerIcon";
import { handleDeleteChatSession } from "@/features/chat/actions";
import { useChatSession } from "@/features/chat/components/ChatSessionProvider";
import { useOverlay } from "@/hooks/use-overlay";
import { paths } from "@/lib/config/paths";

export default function ChatDeleteModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { chat } = useChatSession();
  const { close } = useOverlay();
  const [isLoading, startTransition] = useTransition();

  if (!chat) {
    return null;
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await handleDeleteChatSession({ id: chat.id });
      if (!result.success) {
        toast.error("Failed to delete chat", {
          description: "Please refresh the page and try again.",
        });
        return;
      }

      await close(OVERLAY_IDS.CHAT_DELETE);
      toast("Chat deleted permanently");
      if (pathname === paths.dashboard.chat(chat.id)) {
        router.push(paths.dashboard.chats());
      }
    });
  };

  return (
    <Modal
      id={OVERLAY_IDS.CHAT_DELETE}
      className="gap-4 p-4"
      isVerticallyCentered={true}
      showCloseButton={true}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-neutral-200">
          Delete this chat?
        </h3>
      </div>
      <div className="text-sm text-gray-600 dark:text-neutral-400">
        This will permanently delete <strong>{chat.title}</strong>. You
        can&apos;t undo this.
      </div>
      <div className="flex items-center justify-end gap-2">
        <ModalCloseButton
          modalId={OVERLAY_IDS.CHAT_DELETE}
          className="inline-flex size-auto items-center gap-2 rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs leading-5 font-medium text-gray-800 hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-transparent dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
        >
          Close
        </ModalCloseButton>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-red-500 px-2 py-1 text-xs leading-5 font-medium text-white hover:bg-red-600 focus:bg-red-600 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading && (
            <SpinnerIcon
              size="xs"
              className="size-3.5 flex-none text-white dark:text-white"
            />
          )}
          <span>Delete chat</span>
        </button>
      </div>
    </Modal>
  );
}
