"use client";

import { LucideHome } from "lucide-react";
import { Fragment } from "react";

import DashboardPageContainer from "@/components/layout/DashboardPageContainer";
import Navbar from "@/components/layout/Navbar";
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
      <DashboardPageContainer className="py-0">{null}</DashboardPageContainer>
    </Fragment>
  );
}
