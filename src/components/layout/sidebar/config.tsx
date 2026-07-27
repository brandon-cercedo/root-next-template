import { LucideHome, LucideSettings, LucideStar } from "lucide-react";

import { paths } from "@/lib/config/paths";

import { SidebarSectionType } from "./SidebarContent";

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

export function getSidebarSections(): SidebarSectionType[] {
  const sections = [];

  const topSection = getTopSection();
  const bottomSection = getBottomSection();
  const favoritesSection = getFavoritesSection();

  sections.push(topSection);
  sections.push(favoritesSection);
  sections.push(bottomSection);

  return sections;
}
