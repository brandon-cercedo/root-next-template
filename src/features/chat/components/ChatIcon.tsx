"use client";

import { useChat } from "@ai-sdk/react";
import {
  LucideArchive,
  LucideCircleDashed,
  LucideMessageCircle,
  LucideMessageCircleCheck,
  LucideMessageCircleOff,
  LucideMessageCirclePlus,
  LucideMessageCircleX,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";

import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import { useChatSessions } from "@/features/chat/hooks/use-chat-sessions";
import { ChatIconStatus, getChatIconStatus } from "@/features/chat/utils";
import { useChatInstances } from "@/hooks/use-chat-instances";
import { isChatWorking } from "@/lib/utils/db/chat";
import { mergeClsx } from "@/lib/utils/styles";
import { ChatSession } from "@/prisma/types/generated/browser";

import type { ChatUIMessage } from "@/types/chat";
import type { Chat } from "@ai-sdk/react";

const ICONS: Record<
  ChatIconStatus,
  { icon: LucideIcon; label: string; className?: string }
> = {
  new: {
    icon: LucideMessageCirclePlus,
    label: "New chat",
    className: "text-gray-800 dark:text-neutral-200",
  },
  ready: {
    icon: LucideMessageCircle,
    label: "Ready",
    className: "text-gray-800 dark:text-neutral-200",
  },
  unread: {
    icon: LucideMessageCircleCheck,
    label: "New reply",
    className: "text-blue-600 dark:text-blue-500",
  },
  working: {
    icon: LucideCircleDashed,
    label: "Replying",
    className: "animate-spin text-indigo-600 dark:text-indigo-500",
  },
  error: {
    icon: LucideMessageCircleX,
    label: "Error",
    className: "text-red-600 dark:text-red-400",
  },
  aborted: {
    icon: LucideMessageCircleOff,
    label: "Stopped",
    className: "text-yellow-500 dark:text-yellow-500",
  },
  archived: {
    icon: LucideArchive,
    label: "Archived",
    className: "text-gray-500 dark:text-neutral-400",
  },
};

type StatusIconProps = {
  status: ChatIconStatus;
  className?: string;
};

function StatusIcon({ status, className }: StatusIconProps) {
  const { icon: Icon, label, className: iconClassName } = ICONS[status];
  return (
    <Icon
      role="img"
      aria-label={label}
      data-status={status}
      className={mergeClsx("size-4 flex-none", iconClassName, className)}
    />
  );
}

type ActiveChatIconProps = {
  chat: ChatSession;
  instance: Chat<ChatUIMessage>;
  className?: string;
};

function ActiveChatIcon({ chat, instance, className }: ActiveChatIconProps) {
  const { status: liveStatus } = useChat({ chat: instance });
  const { isOpen: isChatOpen } = useChatSession();
  const { isRead: isChatRead, setIsRead } = useChatSessions();

  const isOpen = isChatOpen(chat.id);
  const isWorking = isChatWorking(liveStatus);
  const isRead = isChatRead(chat.id);

  useEffect(() => {
    if (isOpen) {
      setIsRead(chat.id, true);
      return;
    }
    if (isWorking) {
      setIsRead(chat.id, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id, isOpen, isWorking]);

  const status = getChatIconStatus({ chat, liveStatus, isRead });

  return <StatusIcon status={status} className={className} />;
}

type ChatIconProps = {
  chat?: ChatSession;
  className?: string;
};

export default function ChatIcon({ chat, className }: ChatIconProps) {
  const { instances } = useChatInstances();
  const instance = chat ? instances.get(chat.id) : undefined;

  if (!chat || !instance || chat.isArchived) {
    const status = getChatIconStatus({ chat });
    return <StatusIcon status={status} className={className} />;
  }

  return (
    <ActiveChatIcon chat={chat} instance={instance} className={className} />
  );
}
