"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { toast } from "sonner";

import { DROPDOWN_IDS, OVERLAY_IDS } from "@/components/constants";
import { CommandActions } from "@/components/keyboard/config";
import {
  handleDeleteChatSession,
  toggleArchivedChatSession,
  toggleFavoriteChatSession,
} from "@/features/chat/actions";
import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import { useConfirmationModal } from "@/hooks/use-confirmation-modal";
import { useDropdown } from "@/hooks/use-dropdown";
import { KeyboardProvider, useKeyboard } from "@/hooks/use-keyboard";
import { useOverlay } from "@/hooks/use-overlay";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/hooks/use-user";
import { confettiSchoolPride } from "@/lib/confetti";
import { paths } from "@/lib/config/paths";
import { getKeyboardCommands } from "@/lib/keyboard";
import { isAdmin } from "@/lib/utils/db/user";

export function DashboardKeyboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { open, toggle } = useOverlay();
  const { open: openDropdown } = useDropdown();
  const { setTheme, color } = useTheme();
  const { user } = useUser();
  const { pageChat, openChat, closeChat } = useChatSession();
  const { openConfirmation } = useConfirmationModal();

  const getPageChatActions = () => {
    if (!pageChat) {
      return {};
    }

    const toggleFavorite = async () => {
      const result = await toggleFavoriteChatSession({
        id: pageChat.id,
        isFavourite: !pageChat.isFavourite,
      });
      if (!result.success) {
        toast.error("Failed to update favorite", {
          description: "Please refresh the page and try again.",
        });
      }
    };

    const archive = async () => {
      const result = await toggleArchivedChatSession({
        id: pageChat.id,
        isArchived: true,
      });
      if (!result.success) {
        toast.error("Failed to archive chat", {
          description: "Please refresh the page and try again.",
        });
        return;
      }

      toast("Chat archived", {
        action: {
          label: "Undo",
          onClick: async () => {
            await toggleArchivedChatSession({
              id: pageChat.id,
              isArchived: false,
            });
          },
        },
      });
    };

    const restore = async () => {
      const result = await toggleArchivedChatSession({
        id: pageChat.id,
        isArchived: false,
      });
      if (!result.success) {
        toast.error("Failed to unarchive chat", {
          description: "Please refresh the page and try again.",
        });
        return;
      }

      toast("Chat unarchived");
    };

    const deleteChat = async () => {
      const result = await handleDeleteChatSession({ id: pageChat.id });
      if (!result.success) {
        toast.error("Failed to delete chat", {
          description: "Please refresh the page and try again.",
        });
        return;
      }

      toast("Chat deleted permanently");
      closeChat(pageChat.id);
      router.push(paths.dashboard.chats());
    };

    const confirmDelete = () => {
      void openConfirmation({
        title: "Delete this chat?",
        message: (
          <Fragment>
            This will permanently delete <strong>{pageChat.title}</strong>. You
            can&apos;t undo this.
          </Fragment>
        ),
        confirmButton: { label: "Delete chat", handler: deleteChat },
      });
    };

    let actions: CommandActions = {
      "move-chat-to-sidebar": () => openChat(pageChat.id),
    };
    if (pageChat.isArchived) {
      actions = {
        ...actions,
        "restore-chat": () => void restore(),
        "delete-chat": confirmDelete,
      };
    } else {
      actions = {
        ...actions,
        "archive-chat": () => void archive(),
        ...(pageChat.isFavourite && {
          "unfavorite-chat": () => void toggleFavorite(),
        }),
        ...(!pageChat.isFavourite && {
          "favorite-chat": () => void toggleFavorite(),
        }),
      };
    }
    return actions;
  };

  const getAdminActions = () => {
    if (!isAdmin(user)) {
      return {};
    }

    const openFlagToolbar = () => {
      void openDropdown(DROPDOWN_IDS.FLAG_TOOLBAR);
    };

    const actions: CommandActions = {
      "open-flag-toolbar": openFlagToolbar,
    };
    return actions;
  };

  const openPalette = () => {
    void open(OVERLAY_IDS.COMMAND_PALETTE);
  };

  const togglePalette = () => {
    void toggle(OVERLAY_IDS.COMMAND_PALETTE);
  };

  const toggleSidebar = () => {
    void toggle(OVERLAY_IDS.SIDEBAR);
  };

  const toggleChatOffcanvas = () => {
    void toggle(OVERLAY_IDS.CHAT_OFFCANVAS);
  };

  const openHelp = () => {
    void open(OVERLAY_IDS.KEYBOARD_HELP);
  };

  const toggleTheme = () => {
    if (!color) {
      return;
    }
    setTheme(color === "dark" ? "light" : "dark");
  };

  const chatActions = getPageChatActions();
  const adminActions = getAdminActions();
  const actions: CommandActions = {
    "toggle-palette": togglePalette,
    "open-palette": openPalette,
    "toggle-theme": toggleTheme,
    "theme-light": () => setTheme("light"),
    "theme-dark": () => setTheme("dark"),
    "theme-system": () => setTheme("system"),
    "toggle-sidebar": toggleSidebar,
    "toggle-chat-offcanvas": toggleChatOffcanvas,
    "open-keyboard-help": openHelp,
    "go-home": () => router.push(paths.dashboard.home()),
    "new-chat": () => router.push(paths.dashboard.chats()),
    "log-out": () => router.push(paths.auth.signOut()),
    confetti: confettiSchoolPride,
    ...adminActions,
    ...chatActions,
  };
  const commands = getKeyboardCommands(actions);

  return <KeyboardProvider commands={commands}>{children}</KeyboardProvider>;
}

export function useDashboardKeyboard() {
  return useKeyboard();
}
