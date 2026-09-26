import {
  LucideHome,
  LucideMessageCircle,
  LucideMessageCirclePlus,
  LucideSettings,
  LucideStar,
} from "lucide-react";

import { FullUser } from "@/actions/db/user";
import ShortcutKbdList from "@/components/keyboard/ShortcutKbdList";
import { paths } from "@/lib/config/paths";
import { ChatSession } from "@/prisma/types/client";

import ChatCreateButton from "./ChatCreateButton";
import { SidebarSectionType } from "./SidebarContent";
import { SidebarItemType } from "./SidebarItem";

function getTopSection(): SidebarSectionType {
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

function getFavoritesSection(): SidebarSectionType {
  const section: SidebarSectionType = {
    label: "Favorites",
    actions: [],
    items: [
      {
        id: "favorites",
        label: "Favorites",
        icon: <LucideStar className="size-4 flex-none" />,
        renderActions: () => [],
        children: [],
      },
    ],
  };

  return section;
}

function composeSidebarItemFromChat(session: ChatSession): SidebarItemType {
  return {
    id: session.id,
    label: session.title,
    icon: <LucideMessageCircle className="size-4 flex-none" />,
    href: paths.dashboard.chat(session.id),
    renderActions: () => [],
    children: [],
  };
}

function getChatsSection(chatSessions: ChatSession[]) {
  const section: SidebarSectionType = {
    label: "Chats",
    actions: [<ChatCreateButton key="chat-create" />],
    items: chatSessions.map(composeSidebarItemFromChat),
  };
  return section;
}

export function getSidebarSections({
  user,
}: {
  user: FullUser;
}): SidebarSectionType[] {
  const sections = [];

  const topSection = getTopSection();
  const bottomSection = getBottomSection();
  const favoritesSection = getFavoritesSection();
  const chatsSection = getChatsSection(user.chatSessions);

  sections.push(topSection);
  sections.push(favoritesSection);
  sections.push(chatsSection);
  sections.push(bottomSection);

  return sections;
}
