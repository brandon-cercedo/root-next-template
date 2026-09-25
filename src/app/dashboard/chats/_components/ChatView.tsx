"use client";

import { LucideMessageCircle, LucideMessageCirclePlus } from "lucide-react";
import { Fragment } from "react";

import { BreadcrumbItemType } from "@/components/layout/breadcrumb/BreadcrumbItems";
import DashboardPageContainer from "@/components/layout/DashboardPageContainer";
import Navbar from "@/components/layout/Navbar";
import ChatSection from "@/features/chat/components/ChatSection";
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
      <Navbar breadcrumbItems={getChatBreadcrumbItems(chat)} />
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
