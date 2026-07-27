"use client";

import { LucideHome } from "lucide-react";
import { Fragment } from "react";

import Navbar from "@/components/layout/Navbar";
import PageContainer from "@/components/layout/PageContainer";
import { paths } from "@/lib/config/paths";

export default function HomeView() {
  return (
    <Fragment>
      <Navbar
        breadcrumbItems={[
          {
            id: "home",
            label: "Home",
            icon: <LucideHome className="size-3.5 flex-none" />,
            href: paths.dashboard.home(),
          },
        ]}
      />
      <PageContainer className="pb-40">
        <div className="flex w-full min-w-0 flex-col items-center">
          <div className="flex h-full w-full flex-col items-center justify-center gap-5 sm:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Placeholder dashboard content. Replace this with your app.
            </p>
          </div>
        </div>
      </PageContainer>
    </Fragment>
  );
}
