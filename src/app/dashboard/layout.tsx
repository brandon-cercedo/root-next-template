import { Metadata } from "next";
import { redirect } from "next/navigation";

import { FullUser, getFullUser } from "@/actions/db/user";
import DashboardCommandPalette from "@/app/dashboard/_components/command-palette/DashboardCommandPalette";
import { DashboardKeyboardProvider } from "@/app/dashboard/_components/keyboard/hooks/use-dashboard-keyboard";
import DashboardSidebar from "@/app/dashboard/_components/sidebar/DashboardSidebar";
import FlagsBadge from "@/components/flags/FlagsBadge";
import FlagToolbar from "@/components/flags/FlagToolbar";
import KeyboardHelpOffcanvas from "@/components/keyboard/KeyboardHelpOffcanvas";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import ChatOffcanvas from "@/features/chat/components/ChatOffcanvas";
import { ChatSessionProvider } from "@/features/chat/hooks/use-chat-session";
import { ChatSessionsProvider } from "@/features/chat/hooks/use-chat-sessions";
import LoginConfetti from "@/features/home/components/LoginConfetti";
import { ChatInstancesProvider } from "@/hooks/use-chat-instances";
import { ConfirmationModalProvider } from "@/hooks/use-confirmation-modal";
import { FlagProvider } from "@/hooks/use-flag";
import { UserProvider } from "@/hooks/use-user";
import { paths } from "@/lib/config/paths";
import { isAdmin } from "@/lib/utils/db/user";
import { getFlagOverrides, getFlagValues } from "@/services/flags";

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
    <ConfirmationModalProvider>
      <UserProvider user={user}>
        <FlagProvider values={values} overrides={overrides}>
          <ChatSessionsProvider>
            <ChatSessionProvider>
              <DashboardKeyboardProvider>
                <ChatInstancesProvider>
                  {children}
                  <DashboardCommandPalette />
                  <KeyboardHelpOffcanvas />
                  <ConfirmationModal />
                  <ChatOffcanvas />
                </ChatInstancesProvider>
              </DashboardKeyboardProvider>
            </ChatSessionProvider>
          </ChatSessionsProvider>
        </FlagProvider>
      </UserProvider>
    </ConfirmationModalProvider>
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
      <DashboardSidebar user={user} />
      <div className="bg-gray-100 p-3 transition-all duration-300 lg:fixed lg:inset-0 dark:bg-neutral-950 lg:hs-overlay-layout-open:ps-60">
        <div className="relative flex h-[calc(100dvh-62px)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-black shadow-xs lg:h-full dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
          <div className="flex size-full flex-1 flex-col">{children}</div>
          <FlagsBadge />
          <FlagToolbar user={user} />
        </div>
      </div>
      <LoginConfetti user={user} />
    </DashboardProviders>
  );
}
