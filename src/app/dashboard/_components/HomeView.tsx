"use client";

import { LucideHome } from "lucide-react";
import { Fragment } from "react";

import DashboardPageContainer from "@/components/layout/DashboardPageContainer";
import Navbar from "@/components/layout/Navbar";
import ChatSection from "@/features/chat/components/ChatSection";
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
      <DashboardPageContainer className="py-0">
        <ChatSection
          user={user}
          className="sm:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl"
        />
      </DashboardPageContainer>
    </Fragment>
  );
}
