"use client";

import { LucideMessageCircleQuestionMark } from "lucide-react";
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
    <header className="flex items-center justify-between px-2 py-2">
      <Link href={paths.dashboard.home()}>
        <AppLogo />
      </Link>
    </header>
  );
}

function SidebarFooter() {
  return (
    <footer className="flex flex-col px-2">
      <ul className="flex flex-col gap-y-1">
        <li>
          <a
            href="https://github.com/brandon-cercedo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-x-2 rounded-lg p-2 text-[13px] leading-5 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
          >
            <LucideMessageCircleQuestionMark className="size-4 flex-none" />
          </a>
        </li>
      </ul>
    </footer>
  );
}

export default function Sidebar({ user }: { user: FullUser }) {
  const sections = getSidebarSections();
  return (
    <aside
      id={OVERLAY_IDS.SIDEBAR}
      className="hs-overlay fixed inset-y-0 inset-s-0 z-60 hidden w-60 -translate-x-full transform bg-zinc-100 transition-all duration-300 [--auto-close:lg] [--body-scroll:true] [--is-layout-affect:true] [--opened:lg] lg:inset-e-auto lg:bottom-0 lg:block lg:-translate-x-full lg:[--overlay-backdrop:false] dark:bg-neutral-950 hs-overlay-open:translate-x-0 lg:hs-overlay-layout-open:translate-x-0"
      role="dialog"
      tabIndex={-1}
      aria-label="Sidebar"
    >
      <div className="relative flex h-full max-h-full flex-col justify-between gap-3 py-3">
        <div className="flex size-full flex-col overflow-y-auto">
          <SidebarHeader />
          <div className="flex w-full border-y border-gray-200 px-2 py-2 duration-300 dark:border-neutral-700">
            <UserMenu user={user} />
          </div>
          <SidebarContent sections={sections} />
        </div>
        <SidebarFooter />
      </div>
    </aside>
  );
}
