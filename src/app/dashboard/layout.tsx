import { Metadata } from "next";
import { redirect } from "next/navigation";

import { FullUser, getFullUser } from "@/actions/db/user";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import FirstLoginConfetti from "@/features/home/components/FirstLoginConfetti";
import { UserProvider } from "@/hooks/use-user";
import { paths } from "@/lib/config/paths";

export const metadata: Metadata = {
  title: "Dashboard",
};

function DashboardProviders({
  user,
  children,
}: {
  user: FullUser;
  children: React.ReactNode;
}) {
  return (
    <UserProvider user={user}>
      <FirstLoginConfetti />
      {children}
    </UserProvider>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getFullUser();
  if (!user) {
    redirect(paths.auth.signIn());
  }

  return (
    <DashboardProviders user={user}>
      <Sidebar user={user} />
      <div className="bg-gray-100 p-3 transition-all duration-300 lg:fixed lg:inset-0 dark:bg-neutral-950 lg:hs-overlay-layout-open:ps-60">
        <div className="flex h-[calc(100dvh-62px)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-black shadow-xs lg:h-full dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
          <div className="flex flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar]:size-0">
            {children}
          </div>
        </div>
      </div>
    </DashboardProviders>
  );
}
