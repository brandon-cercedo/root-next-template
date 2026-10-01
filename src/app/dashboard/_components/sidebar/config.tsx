import {
  LucideHome,
  LucideMessageCircle,
  LucideMessageCirclePlus,
  LucideSettings,
} from "lucide-react";

import { FullUser } from "@/actions/db/user";
import ShortcutKbdList from "@/components/keyboard/ShortcutKbdList";
import { SidebarSectionType } from "@/components/layout/sidebar/SidebarContent";
import { SidebarItemType } from "@/components/layout/sidebar/SidebarItem";
import ChatArchivedDropdown from "@/features/chat/components/ChatArchivedDropdown";
import ChatConfigDropdown from "@/features/chat/components/ChatConfigDropdown";
import { filterArchivedChatSessions } from "@/features/chat/utils";
import { paths } from "@/lib/config/paths";
import { ChatSession } from "@/prisma/types/client";

import ChatCreateButton from "./ChatCreateButton";

function getTopSection(chats: ChatSession[]): SidebarSectionType {
  const hasArchivedChats = chats.some((chat) => chat.isArchived);

  const section: SidebarSectionType = {
    actions: [],
    items: [
      {
        id: "home",
        label: "Home",
        icon: <LucideHome className="size-4 flex-none" />,
        href: paths.dashboard.home(),
        renderActions: () => [],
        children: [],
      },
      {
        id: "new-chat",
        label: "New chat",
        icon: <LucideMessageCirclePlus className="size-4 flex-none" />,
        href: paths.dashboard.chats(),
        renderActions: () => [
          <ShortcutKbdList key="shortcut" commandId="new-chat" />,
        ],
        children: [],
      },
    ],
  };

  if (hasArchivedChats) {
    section.items.push({
      id: "archived",
      renderLink: () => <ChatArchivedDropdown chats={chats} />,
      renderActions: () => [],
      children: [],
    });
  }

  return section;
}

function getBottomSection(): SidebarSectionType {
  const section: SidebarSectionType = {
    label: "System",
    actions: [],
    items: [],
  };

  section.items.push({
    id: "settings",
    label: "Settings",
    icon: <LucideSettings className="size-4 flex-none" />,
    renderActions: () => [],
    children: [],
  });

  return section;
}

function getFavoritesSection(chats: ChatSession[]): SidebarSectionType {
  const favoriteChats = chats.filter((chat) => chat.isFavourite);

  const section: SidebarSectionType = {
    label: "Favorites",
    actions: [],
    items: favoriteChats.map((chat) =>
      composeSidebarItemFromChat({ chat, prefix: "favorite-" })
    ),
  };

  return section;
}

function composeSidebarItemFromChat({
  chat,
  prefix,
}: {
  chat: ChatSession;
  prefix?: string;
}): SidebarItemType {
  const id = `${prefix}${chat.id}`;

  return {
    id,
    label: chat.title,
    icon: <LucideMessageCircle className="size-4 flex-none" />,
    href: paths.dashboard.chat(chat.id),
    renderActions: (isHovered: boolean) => [
      <ChatConfigDropdown
        key={`config-chat-${id}`}
        chat={chat}
        isHovered={isHovered}
      />,
    ],
    children: [],
  };
}

function getChatsSection(chats: ChatSession[]) {
  const section: SidebarSectionType = {
    label: "Chats",
    actions: [<ChatCreateButton key="chat-create" />],
    items: chats.map((chat) => composeSidebarItemFromChat({ chat })),
  };
  return section;
}

export function getSidebarSections({
  user,
}: {
  user: FullUser;
}): SidebarSectionType[] {
  const sections = [];
  const activeChats = filterArchivedChatSessions(user.chatSessions);

  const topSection = getTopSection(user.chatSessions);
  const bottomSection = getBottomSection();
  const favoritesSection = getFavoritesSection(activeChats);
  const chatsSection = getChatsSection(activeChats);

  sections.push(topSection);
  sections.push(favoritesSection);
  sections.push(chatsSection);
  sections.push(bottomSection);

  return sections;
}
