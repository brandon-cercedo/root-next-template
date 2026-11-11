import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DashboardKeyboardProvider,
  useDashboardKeyboard,
} from "@/app/dashboard/_components/keyboard/hooks/use-dashboard-keyboard";
import { DROPDOWN_IDS, OVERLAY_IDS } from "@/components/constants";
import { CommandId } from "@/components/keyboard/config";
import { fakeChatSessionComplete } from "@/prisma/utils/fake-data";

import type { ChatSession } from "@/prisma/types/generated/browser";

const mockPageChat = vi.hoisted(() => vi.fn());
const mockOpenChat = vi.hoisted(() => vi.fn());
const mockCloseChat = vi.hoisted(() => vi.fn());
const mockOpenConfirmation = vi.hoisted(() => vi.fn());
const mockToggleOverlay = vi.hoisted(() => vi.fn());
const mockOpenDropdown = vi.hoisted(() => vi.fn());
const mockIsAdmin = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn() }));

vi.mock("@/features/chat/hooks/use-chat-session", () => ({
  useChatSession: () => ({
    pageChat: mockPageChat(),
    openChat: mockOpenChat,
    closeChat: mockCloseChat,
  }),
}));

vi.mock("@/hooks/use-confirmation-modal", () => ({
  useConfirmationModal: () => ({ openConfirmation: mockOpenConfirmation }),
}));

vi.mock("@/features/chat/actions", () => ({
  handleDeleteChatSession: mockDelete,
  toggleArchivedChatSession: vi.fn(),
  toggleFavoriteChatSession: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: mockToast }));

vi.mock("@/hooks/use-overlay", () => ({
  useOverlay: () => ({
    open: vi.fn(),
    toggle: mockToggleOverlay,
    isOpen: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-dropdown", () => ({
  useDropdown: () => ({ open: mockOpenDropdown }),
}));

vi.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({ setTheme: vi.fn(), color: "light" }),
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: () => ({ user: { email: "user@example.com" } }),
}));

vi.mock("@/lib/utils/db/user", () => ({
  isAdmin: mockIsAdmin,
}));

vi.mock("@/lib/confetti", () => ({
  confettiSchoolPride: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const CHAT_COMMAND_IDS: CommandId[] = [
  "move-chat-to-sidebar",
  "favorite-chat",
  "unfavorite-chat",
  "archive-chat",
  "restore-chat",
  "delete-chat",
];

const activeChat: ChatSession = {
  ...fakeChatSessionComplete(),
  isArchived: false,
  isFavourite: false,
};
const favouriteChat: ChatSession = { ...activeChat, isFavourite: true };
const archivedChat: ChatSession = { ...activeChat, isArchived: true };

function getCommands(chat?: ChatSession) {
  mockPageChat.mockReturnValue(chat);
  const { result } = renderHook(() => useDashboardKeyboard(), {
    wrapper: DashboardKeyboardProvider,
  });
  return result.current.commands;
}

function getChatCommands(chat?: ChatSession) {
  return getCommands(chat).filter((command) =>
    CHAT_COMMAND_IDS.includes(command.id)
  );
}

describe("useDashboardKeyboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAdmin.mockReturnValue(false);
  });

  it("should throw when used outside DashboardKeyboardProvider", () => {
    expect(() => renderHook(() => useDashboardKeyboard())).toThrow(
      "useKeyboard must be used within a KeyboardProvider"
    );
  });

  it("should register the dashboard actions", () => {
    const command = getCommands().find(
      (item) => item.id === "toggle-chat-offcanvas"
    );

    command?.run();

    expect(mockToggleOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CHAT_OFFCANVAS);
  });

  it("should register the flag toolbar for admins", () => {
    mockIsAdmin.mockReturnValue(true);
    const command = getCommands().find(
      (item) => item.id === "open-flag-toolbar"
    );

    command?.run();

    expect(mockOpenDropdown).toHaveBeenCalledWith(DROPDOWN_IDS.FLAG_TOOLBAR);
  });

  it("should leave the flag toolbar out for other users", () => {
    const ids = getCommands().map((command) => command.id);

    expect(ids).not.toContain("open-flag-toolbar");
  });

  it.each([
    { name: "no chat page", chat: undefined, ids: [] },
    {
      name: "active chat",
      chat: activeChat,
      ids: ["move-chat-to-sidebar", "favorite-chat", "archive-chat"],
    },
    {
      name: "favourite chat",
      chat: favouriteChat,
      ids: ["move-chat-to-sidebar", "unfavorite-chat", "archive-chat"],
    },
    {
      name: "archived chat",
      chat: archivedChat,
      ids: ["move-chat-to-sidebar", "restore-chat", "delete-chat"],
    },
  ])("should register the $name commands", ({ chat, ids }) => {
    const commands = getChatCommands(chat);

    expect(commands.map((command) => command.id)).toEqual(ids);
  });

  it("should list the chat commands before New chat", () => {
    const ids = getCommands(activeChat).map((command) => command.id);

    expect(ids.indexOf("archive-chat")).toBeLessThan(ids.indexOf("new-chat"));
  });
});
