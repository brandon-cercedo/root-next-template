"use client";

import BreadcrumbItems, {
  BreadcrumbItemType,
} from "./breadcrumb/BreadcrumbItems";
import SidebarToggleButton from "./sidebar/SidebarToggleButton";

interface NavbarProps {
  children?: React.ReactNode;
  breadcrumbItems?: BreadcrumbItemType[];
}

export default function Navbar({
  children,
  breadcrumbItems = [],
}: NavbarProps) {
  return (
    <header className="sticky inset-x-0 top-0 z-50 flex w-full flex-wrap bg-zinc-100 text-[13px] md:flex-nowrap md:justify-start dark:bg-neutral-950">
      <nav className="flex w-full flex-col items-center gap-x-2 sm:flex-row">
        <div className="flex w-full items-center gap-x-1.5 px-4 py-2">
          <SidebarToggleButton />
          <BreadcrumbItems items={breadcrumbItems} />
        </div>
        {children && (
          <div className="flex w-full items-center gap-1.5 border-t border-gray-200 px-4 py-2 sm:justify-end sm:border-0 dark:border-neutral-700">
            {children}
          </div>
        )}
      </nav>
    </header>
  );
}
