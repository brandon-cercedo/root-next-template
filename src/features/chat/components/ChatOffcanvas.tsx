"use client";

import { LucideX } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

import { OVERLAY_IDS } from "@/components/constants";
import ModalCloseButton from "@/components/ui/modal/ModalCloseButton";
import Offcanvas from "@/components/ui/modal/Offcanvas";
import TruncatedText from "@/components/ui/TruncatedText";
import ChatFullScreenButton from "@/features/chat/components/buttons/ChatFullScreenButton";
import ChatConfigDropdown from "@/features/chat/components/ChatConfigDropdown";
import ChatSection from "@/features/chat/components/ChatSection";
import ChatStatsTooltip from "@/features/chat/components/ChatStatsTooltip";
import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import { useUser } from "@/hooks/use-user";
import { ChatSession } from "@/prisma/types/generated/browser";

import ChatArchivedBanner from "./ChatArchivedBanner";

function Header({ chat }: { chat?: ChatSession }) {
  return (
    <div className="space-y-0.5 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <TruncatedText
          text={chat?.title ?? "New chat"}
          chars={34}
          className="text-sm leading-5 font-medium text-gray-800 dark:text-gray-200"
          placement="bottom-left"
        />
        <div className="flex items-center gap-1.5">
          {chat && (
            <Fragment>
              <ChatStatsTooltip chat={chat} />
              <ChatConfigDropdown
                chat={chat}
                className="size-6 rounded-lg leading-4 text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:bg-gray-200 focus:text-gray-800 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:text-neutral-400"
                placement="bottom-right"
              />
            </Fragment>
          )}
          <ChatFullScreenButton chat={chat} />
          <ModalCloseButton
            modalId={OVERLAY_IDS.CHAT_OFFCANVAS}
            className={
              "size-6 rounded-lg bg-transparent leading-4 text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:bg-gray-200 focus:text-gray-800 dark:bg-transparent dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:text-neutral-400"
            }
          >
            <LucideX className="size-4 flex-none" />
          </ModalCloseButton>
        </div>
      </div>
    </div>
  );
}

function Content() {
  const { user } = useUser();
  const { key, getChat, setChatId } = useChatSession();
  const chat = getChat();

  return (
    <Fragment>
      <Header chat={chat} />
      {chat && (
        <ChatArchivedBanner chat={chat} user={user} variant="sidebar" />
      )}
      <div className="flex min-h-0 flex-1 flex-col space-y-0.5 px-3 py-2">
        <ChatSection
          key={key}
          user={user}
          chat={chat}
          variant="sidebar"
          onCreate={setChatId}
        />
      </div>
    </Fragment>
  );
}

export default function ChatOffcanvas() {
  return (
    <Offcanvas
      id={OVERLAY_IDS.CHAT_OFFCANVAS}
      className="max-w-100 divide-y divide-gray-200 border border-gray-200 text-black shadow-md dark:divide-neutral-700 dark:border-neutral-700 dark:text-white"
      containerClassName="max-w-100"
      rootClassName="[--body-scroll:true] [--tab-accessibility-limited:false]"
      overlayBackdrop="false"
      overlayOptions={{ isClosePrev: false }}
      isEscapeCloseEnabled={false}
    >
      <Content />
    </Offcanvas>
  );
}
