import { Metadata } from "next";
import { Fragment } from "react";

import Sidebar from "@/components/layout/sidebar/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Fragment>
      <Sidebar />
      <div className="bg-gray-100 p-3 transition-all duration-300 lg:fixed lg:inset-0 dark:bg-neutral-950 lg:hs-overlay-layout-open:ps-60">
        <div className="flex h-[calc(100dvh-62px)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-black shadow-xs lg:h-full dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
          <div className="flex flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar]:size-0">
            {children}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
