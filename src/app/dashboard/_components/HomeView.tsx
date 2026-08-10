"use client";

import { LucideHome } from "lucide-react";
import { Fragment } from "react";

import DashboardPageContainer from "@/components/layout/DashboardPageContainer";
import Navbar from "@/components/layout/Navbar";
import GreetingMessage from "@/features/home/components/GreetingMessage";
import { useUser } from "@/hooks/use-user";
import { paths } from "@/lib/config/paths";

export default function HomeView() {
  const { user } = useUser();

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
      <DashboardPageContainer className="pb-40">
        <div className="flex w-full min-w-0 flex-col items-center">
          <div className="flex h-full w-full flex-col items-center justify-center gap-5 sm:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            <GreetingMessage user={user} />
          </div>
        </div>
      </DashboardPageContainer>
    </Fragment>
  );
}
