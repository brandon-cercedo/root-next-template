"use client";

import Link from "next/link";

import { FullUser } from "@/actions/db/user";
import AppLogo from "@/components/brand/AppLogo";
import { OVERLAY_IDS } from "@/components/constants";
import { paths } from "@/lib/config/paths";

import { getSidebarSections } from "./config";
import SidebarContent from "./SidebarContent";
import UserMenu from "./UserMenu";

function SidebarHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-2">
      <Link href={paths.dashboard.home()}>
        <AppLogo />
      </Link>
    </header>
  );
}

function SidebarFooter({ user }: { user: FullUser }) {
  return (
    <footer className="flex flex-col gap-1 px-2">
      <UserMenu user={user} />
    </footer>
  );
}

export default function Sidebar({ user }: { user: FullUser }) {
  const sections = getSidebarSections();
  return (
    <aside
      id={OVERLAY_IDS.SIDEBAR}
      className="hs-overlay fixed inset-y-0 inset-s-0 z-60 hidden w-60 -translate-x-full transform bg-gray-100 transition-all duration-300 [--auto-close:lg] [--body-scroll:true] [--is-layout-affect:true] [--opened:lg] lg:inset-e-auto lg:bottom-0 lg:block lg:-translate-x-full lg:[--overlay-backdrop:false] dark:bg-neutral-950 hs-overlay-open:translate-x-0 lg:hs-overlay-layout-open:translate-x-0"
      role="dialog"
      tabIndex={-1}
      aria-label="Sidebar"
    >
      <div className="relative flex h-full max-h-full flex-col justify-between gap-3 py-3">
        <div className="flex size-full flex-col overflow-y-auto">
          <SidebarHeader />
          <SidebarContent sections={sections} />
        </div>
        <SidebarFooter user={user} />
      </div>
    </aside>
  );
}
