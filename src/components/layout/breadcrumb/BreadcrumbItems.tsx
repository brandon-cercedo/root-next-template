import clsx from "clsx";
import { LucideChevronRight } from "lucide-react";

import NullableLink from "@/components/ui/links/NullableLink";
import TruncatedText from "@/components/ui/TruncatedText";

export interface BreadcrumbItemType {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  href?: string;
  children?: React.ReactNode;
}

function BreadcrumbItem({
  item,
  isActive,
}: {
  item: BreadcrumbItemType;
  isActive: boolean;
}) {
  return (
    <li
      className="inline-flex cursor-default items-center"
      aria-current={isActive ? "page" : undefined}
    >
      {item.children ? (
        item.children
      ) : (
        <NullableLink
          href={item.href}
          className={clsx(
            "flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] leading-4 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800",
            {
              "font-medium": isActive,
            }
          )}
        >
          {item.icon}
          <TruncatedText text={item.label} chars={24} />
        </NullableLink>
      )}
      {!isActive && (
        <LucideChevronRight className="size-3.5 shrink-0 text-gray-400 dark:text-neutral-600" />
      )}
    </li>
  );
}

export default function BreadcrumbItems({
  items,
}: {
  items: BreadcrumbItemType[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ol className="flex items-center whitespace-nowrap">
      {items.map((item, index) => (
        <BreadcrumbItem
          key={item.id}
          item={item}
          isActive={index === items.length - 1}
        />
      ))}
    </ol>
  );
}
