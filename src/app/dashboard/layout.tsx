import { Metadata } from "next";
import { redirect } from "next/navigation";

import { FullUser, getFullUser } from "@/actions/db/user";
import { getFlagOverrides, getFlagValues } from "@/actions/flags/utils";
import DebugModeBadge from "@/components/flags/DebugModeBadge";
import FlagToolbar from "@/components/flags/FlagToolbar";
import KeyboardProvider from "@/components/keyboard/KeyboardProvider";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import LoginConfetti from "@/features/home/components/LoginConfetti";
import { FlagProvider } from "@/hooks/use-flag";
import { UserProvider } from "@/hooks/use-user";
import { paths } from "@/lib/config/paths";
import { isAdmin } from "@/lib/utils/db/user";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function DashboardProviders({
  user,
  children,
}: {
  user: FullUser;
  children: React.ReactNode;
}) {
  const [values, overrides] = isAdmin(user)
    ? await Promise.all([getFlagValues(), getFlagOverrides()])
    : [undefined, undefined];

  return (
    <UserProvider user={user}>
      <FlagProvider values={values} overrides={overrides}>
        <KeyboardProvider>
          {children}
        </KeyboardProvider>
      </FlagProvider>
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
        <div className="relative flex h-[calc(100dvh-62px)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-black shadow-xs lg:h-full dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
          <div className="flex flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar]:size-0">
            {children}
          </div>
          <DebugModeBadge />
          <FlagToolbar user={user} />
        </div>
      </div>
      <LoginConfetti user={user} />
    </DashboardProviders>
  );
}
