import ChatDeleteButton from "@/features/chat/components/buttons/ChatDeleteButton";
import ChatRestoreButton from "@/features/chat/components/buttons/ChatRestoreButton";
import { humanizeDate } from "@/lib/utils/date";
import { composeUserDisplayName } from "@/lib/utils/db/user";
import { ChatSession, User } from "@/prisma/types/generated/browser";

type ChatArchivedBannerProps = {
  chat: ChatSession;
  user: User;
};

export default function ChatArchivedBanner({
  chat,
  user,
}: ChatArchivedBannerProps) {
  if (!chat.isArchived) {
    return null;
  }

  const ownerName = composeUserDisplayName(user);
  const archivedAtText = chat.archivedAt
    ? humanizeDate(chat.archivedAt)
    : "recently";
  const archivedText = `${ownerName} archived this chat ${archivedAtText}.`;

  return (
    <div
      className="w-full bg-red-500 p-2 text-sm text-white"
      role="alert"
      tabIndex={-1}
      aria-labelledby="chat-archived-banner"
    >
      <div className="flex items-center justify-center gap-4">
        <div>{archivedText}</div>
        <div className="flex items-center gap-2">
          <ChatRestoreButton
            chat={chat}
            label="Unarchive"
            className="size-auto border border-white px-2 py-1 text-[13px] leading-5 text-nowrap text-white hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white dark:border-white dark:text-white dark:hover:bg-red-600 dark:hover:text-white dark:focus:bg-red-600 dark:focus:text-white"
          />
          <ChatDeleteButton
            chat={chat}
            label="Delete permanently"
            className="size-auto border border-white px-2 py-1 text-[13px] leading-5 text-nowrap text-white hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white dark:border-white dark:text-white dark:hover:bg-red-600 dark:hover:text-white dark:focus:bg-red-600 dark:focus:text-white"
          />
        </div>
      </div>
    </div>
  );
}
