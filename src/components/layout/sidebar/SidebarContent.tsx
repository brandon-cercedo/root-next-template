"use client";

import clsx from "clsx";
import { useState } from "react";

import ScrollableContainer from "@/components/ui/ScrollableContainer";
import TruncatedText from "@/components/ui/TruncatedText";

import SidebarItem, { SidebarItemType } from "./SidebarItem";

function SidebarLabel({
  label,
  actions,
}: {
  label: string;
  actions: React.ReactNode[];
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li className="mt-6">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
          "group flex w-full items-center justify-between gap-x-2 p-2 py-1 text-start text-[10px] leading-5 font-medium text-gray-500 uppercase dark:text-neutral-500",
          {
            "rounded-lg hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden dark:hover:bg-neutral-800 dark:focus:bg-neutral-800":
              actions.length > 0,
          }
        )}
      >
        <TruncatedText
          text={label}
          chars={isHovered ? 20 : 30}
          className="select-none"
        />
        <div
          className={clsx("items-center gap-1", {
            flex: isHovered,
            hidden: !isHovered,
          })}
        >
          {actions}
        </div>
      </div>
    </li>
  );
}

export interface SidebarSectionType {
  // Section
  label?: string;
  actions: React.ReactNode[];
  // Items
  items: SidebarItemType[];
}

export default function SidebarContent({
  sections,
}: {
  sections: SidebarSectionType[];
}) {
  const validSections = sections.filter((section) => section.items.length > 0);
  if (validSections.length === 0) {
    return null;
  }

  return (
    <ScrollableContainer.nav
      rootClassName="h-full"
      containerClassName="scrollbar-none overscroll-none px-2 py-2 pb-16"
    >
      {validSections.map((section, index) => (
        <div
          key={index}
          className="hs-accordion-group flex w-full flex-col flex-wrap"
          data-hs-accordion-always-open
        >
          <ul className="space-y-0.5">
            {section.label && (
              <SidebarLabel label={section.label} actions={section.actions} />
            )}
            {section.items.map((item) => (
              <SidebarItem key={item.id} item={item} />
            ))}
          </ul>
        </div>
      ))}
    </ScrollableContainer.nav>
  );
}
