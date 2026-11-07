"use client";

import { defaultFilter } from "cmdk";
import { Check, LucideArchive, LucideMessageCircle } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";

import {
  CommandPaletteGroup,
  CommandPaletteItem,
} from "@/components/keyboard/CommandPalette";
import { COMMAND_GROUPS, KeyboardCommand } from "@/components/keyboard/config";
import { useKeyboard } from "@/hooks/use-keyboard";
import { Theme, useTheme } from "@/hooks/use-theme";
import { useUser } from "@/hooks/use-user";
import { paths } from "@/lib/config/paths";
import { ChatSession, Prisma } from "@/prisma/types/client";

const MAX_CHATS = 7;
const MAX_RECENT_CHATS_DAYS = 7;
const CHATS_GROUP = "Chats";

type ChatSessionOrderBy = {
  isArchived?: Prisma.SortOrder;
  lastMessageAt?: Prisma.SortOrder;
};

/**
 * Sort chats like Prisma `orderBy`.
 *
 * @note `isArchived` sorts first, then `lastMessageAt` breaks ties.
 */
function sortChatSessions(
  chats: ChatSession[],
  orderBy: ChatSessionOrderBy = {}
) {
  return [...chats].sort((a, b) => {
    if (orderBy.isArchived && a.isArchived !== b.isArchived) {
      const result = Number(a.isArchived) - Number(b.isArchived);
      return orderBy.isArchived === "asc" ? result : -result;
    }

    if (orderBy.lastMessageAt) {
      const result = moment(a.lastMessageAt).diff(b.lastMessageAt);
      return orderBy.lastMessageAt === "asc" ? result : -result;
    }

    return 0;
  });
}

/**
 * @note About search:
 * - It uses a simple case-insensitive substring match.
 * - It will search in `title` field and the `Chats` group name.
 * @note About sort: matches are sorted by `isArchived` first, then `lastMessageAt`.
 */
export function searchChatSessions({
  chats,
  searchText,
}: {
  chats: ChatSession[];
  searchText: string;
}) {
  const query = searchText.trim().toLowerCase();

  if (!query) {
    const minDate = moment().subtract(MAX_RECENT_CHATS_DAYS, "days");
    const matches = chats.filter(
      (chat) =>
        !chat.isArchived && moment(chat.lastMessageAt).isSameOrAfter(minDate)
    );
    return sortChatSessions(matches, { lastMessageAt: "desc" });
  }

  const matches = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(query) ||
      CHATS_GROUP.toLowerCase().includes(query)
  );

  return sortChatSessions(matches, {
    isArchived: "asc",
    lastMessageAt: "desc",
  });
}

function isActiveThemeCommand(
  command: KeyboardCommand,
  theme: Theme | undefined
) {
  switch (command.id) {
    case "theme-light":
      return theme === "light";
    case "theme-dark":
      return theme === "dark";
    case "theme-system":
      return theme === "system";
  }
  return false;
}

/**
 * Search `KeyboardCommand` using cmdk's `defaultFilter`.
 *
 * @note About search:
 * - It uses a fuzzy match algorithm that scores the match.
 * - It will search in `label`, `keywords` and `group` fields.
 * @note About sort: matches are sorted by score, best match first.
 */
function searchKeyboardCommands({
  commands,
  searchText,
}: {
  commands: KeyboardCommand[];
  searchText: string;
}) {
  const query = searchText.trim().toLowerCase();
  if (!query) {
    return commands;
  }

  return commands
    .map((command) => {
      const value = command.label;
      const keywords = [...(command.keywords ?? []), command.group];
      return {
        command,
        score: defaultFilter(value, query, keywords),
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.command);
}

export function useCommandPaletteSearch({
  searchText,
}: {
  searchText: string;
}) {
  const { commands } = useKeyboard();
  const { theme } = useTheme();
  const { user } = useUser();
  const router = useRouter();

  const getChatsGroup = ({
    chats,
    searchText,
  }: {
    chats: ChatSession[];
    searchText: string;
  }): CommandPaletteGroup => {
    const filteredChats = searchChatSessions({ chats, searchText });

    const group: CommandPaletteGroup = {
      id: "chats",
      heading: CHATS_GROUP,
      limit: MAX_CHATS,
      items: filteredChats.map((chat) => {
        const data: CommandPaletteItem = {
          id: chat.id,
          value: chat.id,
          label: chat.title,
          icon: chat.isArchived ? (
            <LucideArchive className="size-4 flex-none text-gray-500 dark:text-neutral-400" />
          ) : (
            <LucideMessageCircle className="size-4 flex-none text-gray-500 dark:text-neutral-400" />
          ),
          run: () => router.push(paths.dashboard.chat(chat.id)),
        };
        return data;
      }),
    };

    return group;
  };

  const getKeyboardCommandGroups = ({
    commands,
    searchText,
    theme,
  }: {
    commands: KeyboardCommand[];
    searchText: string;
    theme?: Theme;
  }): CommandPaletteGroup[] => {
    const paletteCommands = commands.filter(
      (command) => command.inPalette !== false
    );
    const filteredCommands = searchKeyboardCommands({
      commands: paletteCommands,
      searchText,
    });

    return COMMAND_GROUPS.map((group) => ({
      id: group,
      heading: group,
      items: filteredCommands
        .filter((command) => command.group === group)
        .map((command) => {
          const isActiveTheme = isActiveThemeCommand(command, theme);

          const data: CommandPaletteItem = {
            ...command,
            value: command.id,
            ...(isActiveTheme && {
              renderSuffixes: () => [
                <Check
                  key="active-theme"
                  className="size-3.5 flex-none text-gray-500 dark:text-neutral-400"
                />,
              ],
            }),
          };

          return data;
        }),
    }));
  };

  const keyboardCommandGroups = getKeyboardCommandGroups({
    commands,
    searchText,
    theme,
  });
  const chatsGroup = getChatsGroup({
    chats: user.chatSessions,
    searchText,
  });

  return { groups: [chatsGroup, ...keyboardCommandGroups] };
}
