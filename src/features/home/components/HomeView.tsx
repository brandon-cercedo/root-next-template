"use client";

import { LucideHome } from "lucide-react";
import { Fragment } from "react";

import { FullUser } from "@/actions/db/user";
import Navbar from "@/components/layout/Navbar";
import PageContainer from "@/components/layout/PageContainer";
import { paths } from "@/lib/config/paths";

import GreetingMessage from "./GreetingMessage";

interface HomeViewProps {
  user: FullUser;
}

export default function HomeView({ user }: HomeViewProps) {
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
            <GreetingMessage user={user} />
          </div>
        </div>
      </PageContainer>
    </Fragment>
  );
}
