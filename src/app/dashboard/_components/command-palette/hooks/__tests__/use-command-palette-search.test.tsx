import { renderHook } from "@testing-library/react";
import { Check, LucideArchive, LucideMessageCircle } from "lucide-react";
import { isValidElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { useCommandPaletteSearch } from "@/app/dashboard/_components/command-palette/hooks/use-command-palette-search";
import { paths } from "@/lib/config/paths";
import { fakeChatSessionComplete } from "@/prisma/utils/fake-data";

import type { KeyboardCommand } from "@/components/keyboard/config";

const commands: KeyboardCommand[] = [
  {
    id: "toggle-palette",
    label: "Toggle command palette",
    group: "Navigation",
    inPalette: false,
    run: vi.fn(),
  },
  { id: "theme-light", label: "Theme: Light", group: "Theme", run: vi.fn() },
  { id: "theme-dark", label: "Theme: Dark", group: "Theme", run: vi.fn() },
  {
    id: "new-chat",
    label: "New chat",
    group: "Agent",
    keywords: ["conversation"],
    run: vi.fn(),
  },
  { id: "log-out", label: "Log out", group: "Actions", run: vi.fn() },
];

const activeChat = {
  ...fakeChatSessionComplete(),
  title: "React hooks",
  isArchived: false,
  lastMessageAt: new Date(),
};
const archivedChat = {
  ...fakeChatSessionComplete(),
  title: "React archived",
  isArchived: true,
  lastMessageAt: new Date(),
};

const mockPush = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-keyboard", () => ({
  useKeyboard: () => ({ commands }),
}));

vi.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({ theme: "light" }),
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: () => ({ user: { chatSessions: [activeChat, archivedChat] } }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function getGroups({ searchText = "" } = {}) {
  const { result } = renderHook(() => useCommandPaletteSearch({ searchText }));
  return result.current;
}

function getGroup({
  searchText = "",
  id,
}: {
  searchText?: string;
  id: string;
}) {
  return getGroups({ searchText }).groups.find((group) => group.id === id);
}

function getIconType(icon: unknown) {
  return isValidElement(icon) ? icon.type : undefined;
}

describe("useCommandPaletteSearch", () => {
  it("should list Chats first, then the command groups in order", () => {
    const { groups } = getGroups();

    expect(groups.map((group) => group.heading)).toEqual([
      "Chats",
      "Agent",
      "Theme",
      "Navigation",
      "Actions",
      "Admin",
    ]);
  });

  it("should show recent active chats on an empty search", () => {
    const chats = getGroup({ id: "chats" });

    expect(chats?.items.map((item) => item.label)).toEqual(["React hooks"]);
    expect(getIconType(chats?.items[0]?.icon)).toBe(LucideMessageCircle);
  });

  it("should list archived title matches after active ones", () => {
    const chats = getGroup({ searchText: "react", id: "chats" });

    expect(chats?.items.map((item) => item.label)).toEqual([
      "React hooks",
      "React archived",
    ]);
    expect(getIconType(chats?.items[1]?.icon)).toBe(LucideArchive);
  });

  it("should use each item id as its value", () => {
    const { groups } = getGroups({ searchText: "react" });
    const items = groups.flatMap((group) => group.items);

    expect(items.map((item) => item.value)).toEqual(
      items.map((item) => item.id)
    );
  });

  it("should limit the Chats group to 7 rows", () => {
    expect(getGroup({ id: "chats" })?.limit).toBe(7);
  });

  it("should open the chat when a chat row runs", () => {
    const { groups } = getGroups();

    groups[0]?.items[0]?.run();

    expect(mockPush).toHaveBeenCalledWith(paths.dashboard.chat(activeChat.id));
  });

  it("should leave out commands hidden from the palette", () => {
    const navigation = getGroup({ id: "Navigation" });

    expect(navigation?.items).toEqual([]);
  });

  it("should fuzzy-match commands by label, keywords and group", () => {
    expect(
      getGroup({ searchText: "conver", id: "Agent" })?.items
    ).toHaveLength(1);
    expect(
      getGroup({ searchText: "actions", id: "Actions" })?.items
    ).toHaveLength(1);
    expect(getGroup({ searchText: "zzqq", id: "Theme" })?.items).toEqual([]);
  });

  it("should put the best match first", () => {
    const theme = getGroup({ searchText: "dark", id: "Theme" });

    expect(theme?.items[0]?.label).toBe("Theme: Dark");
  });

  it("should render a check mark only on the active theme", () => {
    const theme = getGroup({ id: "Theme" });
    const [light, dark] = theme?.items ?? [];

    expect(light?.renderSuffixes?.().map(getIconType)).toEqual([Check]);
    expect(dark?.renderSuffixes).toBeUndefined();
  });
});
