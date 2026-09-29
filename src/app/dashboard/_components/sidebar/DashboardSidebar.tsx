"use client";

import { FullUser } from "@/actions/db/user";
import Sidebar from "@/components/layout/sidebar/Sidebar";

import { getSidebarSections } from "./config";

export default function DashboardSidebar({ user }: { user: FullUser }) {
  const sections = getSidebarSections({ user });
  return <Sidebar user={user} sections={sections} />;
}
