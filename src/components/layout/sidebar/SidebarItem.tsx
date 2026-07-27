"use client";

import clsx from "clsx";
import { Fragment, useState } from "react";

import AccordionToggleIcon from "@/components/ui/icons/AccordionToggleIcon";
import NullableLink from "@/components/ui/links/NullableLink";
import TruncatedText from "@/components/ui/TruncatedText";

function ItemIcon({
  icon,
  collapseId,
  isHovered,
  hasChildren,
}: {
  icon: React.ReactNode;
  collapseId: string;
  isHovered: boolean;
  hasChildren: boolean;
}) {
  return (
    <Fragment>
      <div
        className={clsx("flex flex-none items-center justify-center", {
          hidden: hasChildren && isHovered,
        })}
      >
        {icon}
      </div>
      {hasChildren && (
        <button
          type="button"
          className={clsx(
            "hs-accordion-toggle flex size-4 flex-none items-center justify-center gap-1 rounded-md text-[13px] leading-5 text-gray-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:bg-neutral-700 dark:focus:text-neutral-200",
            {
              hidden: !isHovered,
            }
          )}
          aria-expanded={false}
          aria-controls={collapseId}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <AccordionToggleIcon />
        </button>
      )}
    </Fragment>
  );
}

function getItemIds(items: SidebarItemType[]): string[] {
  return items.flatMap((item) => [item.id, ...getItemIds(item.children)]);
}

type SidebarDefaultItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  renderActions: (isHovered: boolean) => React.ReactNode[];
  children: SidebarItemType[];
};

type SidebarCustomItem = {
  id: string;
  renderLink: (props: {
    isHovered: boolean;
    hasChildren: boolean;
    collapseId: string;
  }) => React.ReactNode;
  renderActions: (isHovered: boolean) => React.ReactNode[];
  children: SidebarItemType[];
};

export type SidebarItemType = SidebarDefaultItem | SidebarCustomItem;

interface SidebarItemProps {
  item: SidebarItemType;
  level?: number;
}

export default function SidebarItem({ item, level = 0 }: SidebarItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const actions = item.renderActions(isHovered);
  const hasChildren = item.children.length > 0;
  const hasActions = actions.length > 0;
  const accordionId = `hs-accordion-${item.id}`;
  const collapseId = `hs-accordion-content-${item.id}`;
  const key = getItemIds([item]).join(",");

  return (
    <li
      key={key} // Hack to force re-render the item and hydrate the accordion
      id={accordionId}
      className={clsx({
        "hs-accordion": hasChildren,
      })}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
          "group flex w-full items-center justify-between gap-x-2 rounded-lg p-2 text-start text-[13px] leading-5 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800",
          {
            "hs-accordion-heading": hasChildren,
          }
        )}
        style={{
          paddingLeft: `${(level + 1) * 2 * 4}px`,
        }}
      >
        {"renderLink" in item ? (
          item.renderLink({ isHovered, hasChildren, collapseId })
        ) : (
          <NullableLink
            href={item.href}
            className={clsx("flex w-full items-center gap-x-2", {
              "select-none": !item.href,
            })}
          >
            <ItemIcon
              icon={item.icon}
              collapseId={collapseId}
              isHovered={isHovered}
              hasChildren={hasChildren}
            />
            <TruncatedText text={item.label} chars={isHovered ? 20 : 30} />
          </NullableLink>
        )}
        {hasActions && (
          <div
            className={clsx("items-center gap-1", {
              flex: isHovered,
              hidden: !isHovered,
            })}
          >
            {actions}
          </div>
        )}
      </div>

      {hasChildren && (
        <div
          id={collapseId}
          className="hs-accordion-content hidden w-full overflow-hidden transition-[height] duration-300"
          role="region"
          aria-labelledby={accordionId}
        >
          <ul
            className="hs-accordion-group space-y-1 pt-1"
            data-hs-accordion-always-open
          >
            {item.children.map((child) => (
              <SidebarItem key={child.id} item={child} level={level + 1} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
