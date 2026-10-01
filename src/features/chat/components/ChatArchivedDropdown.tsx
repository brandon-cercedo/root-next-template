"use client";

import { LucideArchive, LucideSearchX } from "lucide-react";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";

import Dropdown from "@/components/ui/Dropdown";
import SearchInput from "@/components/ui/forms/SearchInput";
import MessageWithImage from "@/components/ui/MessageWithImage";
import TruncatedText from "@/components/ui/TruncatedText";
import ChatDeleteAllButton from "@/features/chat/components/buttons/ChatDeleteAllButton";
import ChatDeleteButton from "@/features/chat/components/buttons/ChatDeleteButton";
import ChatRestoreButton from "@/features/chat/components/buttons/ChatRestoreButton";
import { paths } from "@/lib/config/paths";
import { humanizeDate } from "@/lib/utils/date";
import { ChatSession } from "@/prisma/types/generated/browser";

function ChatArchivedItem({ chat }: { chat: ChatSession }) {
  return (
    <div
      key={chat.id}
      className="flex justify-between rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700"
    >
      <Link
        href={paths.dashboard.chat(chat.id)}
        className="flex w-full gap-x-3"
      >
        <LucideArchive className="mt-1 size-4 flex-none" />
        <div className="flex flex-col">
          <TruncatedText text={chat.title} chars={44} />
          {chat.archivedAt && (
            <div className="text-xs text-gray-500 dark:text-neutral-400">
              {humanizeDate(chat.archivedAt, "sm")}
            </div>
          )}
        </div>
      </Link>
      <div className="flex items-start gap-1.5">
        <ChatRestoreButton
          chat={chat}
          className="hover:text-gray-800 focus:text-gray-800 dark:hover:text-neutral-400 dark:focus:text-neutral-400"
        />
        <ChatDeleteButton chat={chat} />
      </div>
    </div>
  );
}

function Content({ chats }: { chats: ChatSession[] }) {
  const [searchText, setSearchText] = useState("");

  const archivedChats = chats.filter((chat) => chat.isArchived);

  const filteredChats = useMemo(() => {
    const validSearchText = searchText.trim().toLowerCase();
    if (!validSearchText) {
      return archivedChats;
    }
    return archivedChats.filter((chat) =>
      chat.title.toLowerCase().includes(validSearchText)
    );
  }, [archivedChats, searchText]);

  return (
    <Fragment>
      <div className="space-y-0.5 px-3 py-2">
        <span className="text-sm leading-5 font-medium text-gray-800 dark:text-gray-200">
          Archived Chats
        </span>
      </div>
      <div className="flex max-h-100 flex-col space-y-0.5 p-1 sm:max-h-150">
        {archivedChats.length >= 7 && (
          <div className="px-2 py-1">
            <SearchInput
              placeholder="Search chats..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-1 overflow-y-auto">
          {filteredChats.length === 0 && !searchText.trim() && (
            <MessageWithImage
              title="No archived chats"
              image={
                <LucideArchive
                  className="size-10 flex-none text-gray-500 dark:text-neutral-400"
                  strokeWidth={1}
                />
              }
              className="gap-2 px-2 py-6"
              titleClassName="text-[13px] leading-5 font-medium text-gray-500 dark:text-gray-400"
            />
          )}
          {filteredChats.length === 0 && searchText.trim() && (
            <MessageWithImage
              title="No matching chats"
              image={
                <LucideSearchX
                  className="size-10 flex-none text-gray-500 dark:text-neutral-400"
                  strokeWidth={1}
                />
              }
              className="gap-2 px-2 py-6"
              titleClassName="text-[13px] leading-5 font-medium text-gray-500 dark:text-gray-400"
            />
          )}
          {filteredChats.map((chat) => (
            <ChatArchivedItem key={chat.id} chat={chat} />
          ))}
        </div>
      </div>
      <div className="space-y-0.5 p-1">
        <div className="flex w-full items-center justify-between gap-3 px-2 py-1.5">
          <ChatDeleteAllButton chats={archivedChats} className="ms-auto" />
        </div>
      </div>
    </Fragment>
  );
}

type ChatArchivedDropdownProps = {
  chats: ChatSession[];
};

export default function ChatArchivedDropdown({
  chats,
}: ChatArchivedDropdownProps) {
  return (
    <Dropdown
      content={<Content chats={chats} />}
      containerClassName="w-full"
      className="z-60 w-xs max-w-xs sm:w-sm sm:max-w-sm"
      placement="right-start"
      autoClose="inside"
      isKeyActionsEnabled={false}
    >
      <div className="flex w-full cursor-pointer items-center gap-x-2 select-none">
        <LucideArchive className="size-4 flex-none" />
        <span>Archived</span>
      </div>
    </Dropdown>
  );
}
