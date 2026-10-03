"use client";

import { LucideMessageCircle, LucideMessageCirclePlus } from "lucide-react";
import { Fragment } from "react";

import { BreadcrumbItemType } from "@/components/layout/breadcrumb/BreadcrumbItems";
import DashboardPageContainer from "@/components/layout/DashboardPageContainer";
import Navbar from "@/components/layout/Navbar";
import ChatFavoriteButton from "@/features/chat/components/buttons/ChatFavoriteButton";
import ChatOpenOffcanvasButton from "@/features/chat/components/buttons/ChatOpenOffcanvasButton";
import ChatArchivedBanner from "@/features/chat/components/ChatArchivedBanner";
import ChatConfigDropdown from "@/features/chat/components/ChatConfigDropdown";
import ChatSection from "@/features/chat/components/ChatSection";
import ChatStatsTooltip from "@/features/chat/components/ChatStatsTooltip";
import { useUser } from "@/hooks/use-user";
import { ChatSession } from "@/prisma/types/generated/browser";

function getChatBreadcrumbItems(chat?: ChatSession) {
  const items: BreadcrumbItemType[] = [];

  if (chat) {
    items.push({
      id: chat.id,
      label: chat.title,
      icon: <LucideMessageCircle className="size-3.5 flex-none" />,
    });
  } else {
    items.push({
      id: "chats",
      label: "New chat",
      icon: <LucideMessageCirclePlus className="size-3.5 flex-none" />,
    });
  }

  return items;
}

type ChatViewProps = {
  chat?: ChatSession;
};

export default function ChatView({ chat }: ChatViewProps) {
  const { user } = useUser();

  return (
    <Fragment>
      <Navbar breadcrumbItems={getChatBreadcrumbItems(chat)}>
        <ul className="flex items-center gap-x-3">
          <li className="relative flex items-center gap-1.5 text-gray-500 dark:text-neutral-200">
            {chat && (
              <Fragment>
                <ChatStatsTooltip chat={chat} />
                <ChatFavoriteButton
                  chat={chat}
                  className="size-6 rounded-lg leading-4 text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:bg-gray-200 focus:text-gray-800 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:text-neutral-400"
                />
              </Fragment>
            )}
            <ChatOpenOffcanvasButton
              chat={chat}
              className="size-6 rounded-lg leading-4 text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:bg-gray-200 focus:text-gray-800 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:text-neutral-400"
            />
            {chat && (
              <ChatConfigDropdown
                chat={chat}
                className="size-6 rounded-lg leading-4 text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:bg-gray-200 focus:text-gray-800 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:text-neutral-400"
                placement="bottom-right"
              />
            )}
          </li>
        </ul>
      </Navbar>
      {chat && <ChatArchivedBanner chat={chat} user={user} />}
      <DashboardPageContainer className="py-0">
        <ChatSection
          user={user}
          chat={chat}
          className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl 2xl:max-w-206"
        />
      </DashboardPageContainer>
    </Fragment>
  );
}
