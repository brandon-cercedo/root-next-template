import ChatDeleteButton from "@/features/chat/components/buttons/ChatDeleteButton";
import ChatRestoreButton from "@/features/chat/components/buttons/ChatRestoreButton";
import { humanizeDate } from "@/lib/utils/date";
import { composeUserDisplayName } from "@/lib/utils/db/user";
import { mergeClsx } from "@/lib/utils/styles";
import { ChatSession, User } from "@/prisma/types/generated/browser";

type VariantSettings = {
  restoreLabel?: string;
  restoreClassName?: string;
  deleteLabel?: string;
  deleteClassName?: string;
};

const VARIANT_SETTINGS: Record<ChatArchivedBannerVariant, VariantSettings> = {
  page: {
    restoreLabel: "Unarchive",
    restoreClassName: "size-auto px-2 py-1 text-[13px] leading-5 text-nowrap",
    deleteLabel: "Delete permanently",
    deleteClassName: "size-auto px-2 py-1 text-[13px] leading-5 text-nowrap",
  },
  sidebar: {},
};

type ChatArchivedBannerVariant = "page" | "sidebar";

type ChatArchivedBannerProps = {
  chat: ChatSession;
  user: User;
  variant?: ChatArchivedBannerVariant;
};

export default function ChatArchivedBanner({
  chat,
  user,
  variant = "page",
}: ChatArchivedBannerProps) {
  if (!chat.isArchived) {
    return null;
  }

  const ownerName = composeUserDisplayName(user);
  const archivedAtText = chat.archivedAt
    ? humanizeDate(chat.archivedAt)
    : "recently";
  const archivedText = `${ownerName} archived this chat ${archivedAtText}.`;
  const settings = VARIANT_SETTINGS[variant];

  return (
    <div
      className="w-full border-0 bg-red-500 p-2 text-sm text-white"
      role="alert"
      tabIndex={-1}
      aria-labelledby="chat-archived-banner"
    >
      <div className="flex items-center justify-center gap-4">
        <div>{archivedText}</div>
        <div className="flex items-center gap-2">
          <ChatRestoreButton
            chat={chat}
            label={settings.restoreLabel}
            className={mergeClsx(
              "border border-white text-white hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white dark:border-white dark:text-white dark:hover:bg-red-600 dark:hover:text-white dark:focus:bg-red-600 dark:focus:text-white",
              settings.restoreClassName
            )}
          />
          <ChatDeleteButton
            chat={chat}
            label={settings.deleteLabel}
            className={mergeClsx(
              "border border-white text-white hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white dark:border-white dark:text-white dark:hover:bg-red-600 dark:hover:text-white dark:focus:bg-red-600 dark:focus:text-white",
              settings.deleteClassName
            )}
          />
        </div>
      </div>
    </div>
  );
}
