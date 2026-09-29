"use client";

import { LucideLink, LucideMoreHorizontal } from "lucide-react";
import { Fragment, useEffect, useId } from "react";
import { toast } from "sonner";

import Dropdown, { DropdownPlacement } from "@/components/ui/Dropdown";
import ChatDeleteButton from "@/features/chat/components/buttons/ChatDeleteButton";
import ChatFavoriteButton from "@/features/chat/components/buttons/ChatFavoriteButton";
import { useDropdown } from "@/hooks/use-dropdown";
import { paths } from "@/lib/config/paths";
import { mergeClsx } from "@/lib/utils/styles";
import { getFullUrl } from "@/lib/utils/url";
import { ChatSession } from "@/prisma/types/generated/browser";

function Content({ chat }: { chat: ChatSession }) {
  const handleCopyLink = () => {
    const url = getFullUrl(paths.dashboard.chat(chat.id));
    void navigator.clipboard.writeText(url);
    toast("Copied link to clipboard");
  };

  return (
    <Fragment>
      <div className="w-full space-y-0.5 p-1">
        <span className="block px-2 py-1.5 text-[10px] font-medium text-gray-400 uppercase dark:text-neutral-500">
          Chat
        </span>
        <ChatFavoriteButton
          chat={chat}
          label={
            chat.isFavourite ? "Remove from favorites" : "Add to favorites"
          }
          className="flex size-auto w-full items-center justify-normal gap-x-3 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700"
        />
      </div>
      <div className="w-full space-y-0.5 p-1">
        <button
          type="button"
          className="flex w-full items-center gap-x-3 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 hover:bg-gray-100 focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700"
          onClick={handleCopyLink}
        >
          <LucideLink className="size-4 flex-none" />
          Copy link
        </button>
      </div>
      <div className="w-full space-y-0.5 p-1">
        <ChatDeleteButton
          chat={chat}
          label="Delete"
          className="flex size-auto w-full items-center justify-normal gap-x-3 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/20 dark:focus:bg-red-500/20"
        />
      </div>
    </Fragment>
  );
}

type ChatConfigDropdownProps = {
  chat: ChatSession;
  className?: string;
  placement?: DropdownPlacement;
  isHovered?: boolean;
};

export default function ChatConfigDropdown({
  chat,
  className,
  placement = "right-start",
  isHovered,
}: ChatConfigDropdownProps) {
  const dropdownId = useId();
  const { close } = useDropdown();

  useEffect(() => {
    const run = async () => {
      if (isHovered === false) {
        await close(dropdownId);
      }
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered]);

  return (
    <Dropdown
      id={dropdownId}
      content={<Content chat={chat} />}
      className="z-60 w-60 max-w-60"
      placement={placement}
      autoClose="inside"
    >
      <button
        type="button"
        className={mergeClsx(
          "inline-flex size-5 flex-none items-center justify-center gap-1 rounded-md text-[13px] leading-5 text-gray-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:bg-neutral-700",
          className
        )}
        aria-label="Chat settings"
      >
        <LucideMoreHorizontal className="size-4 flex-none" />
      </button>
    </Dropdown>
  );
}
