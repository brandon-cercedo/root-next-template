import { LucideChevronsUpDown, LucideLogOut } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import { FullUser } from "@/actions/db/user";
import AppLogoIcon from "@/components/brand/AppLogoIcon";
import { ThemeSelectorDynamic } from "@/components/theme/ThemeSelector";
import Dropdown from "@/components/ui/Dropdown";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import TruncatedText from "@/components/ui/TruncatedText";
import { paths } from "@/lib/config/paths";
import { composeUserDisplayName } from "@/lib/utils/db/user";

function Content({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  return (
    <Fragment>
      <div className="space-y-0.5 px-3 py-2 break-all dark:border-gray-700">
        <span className="text-[13px] leading-5 font-medium text-gray-800 dark:text-gray-200">
          {displayName}
        </span>
        <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
      </div>
      <div className="space-y-0.5 p-1">
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 text-[13px] leading-5 text-gray-800 dark:text-neutral-200">
          <span className="flex-1 cursor-default">Theme</span>
          <ThemeSelectorDynamic />
        </div>
      </div>
      <div className="space-y-0.5 p-1">
        <Link
          href={paths.auth.signOut()}
          className="flex items-center gap-x-3 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700"
        >
          <LucideLogOut className="size-4 flex-none" />
          <span>Log out</span>
        </Link>
      </div>
    </Fragment>
  );
}

export default function UserMenu({ user }: { user: FullUser }) {
  const displayName = composeUserDisplayName(user);
  return (
    <Dropdown
      content={<Content displayName={displayName} email={user.email} />}
      autoClose="inside"
      containerClassName="w-full"
      className="z-60 w-56"
    >
      <button
        type="button"
        className="inline-flex w-full items-center justify-between gap-2 rounded-lg p-2 text-[13px] leading-5 font-medium hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
      >
        <div className="flex items-center gap-1">
          <ImageWithFallback
            src={user.image}
            alt={displayName}
            className="size-5 flex-none rounded-lg"
            width={20}
            height={20}
            fallback={
              <AppLogoIcon className="size-5 flex-none rounded-lg border border-gray-200 p-0.5 dark:border-neutral-700" />
            }
          />
          <TruncatedText text={displayName} chars={20} />
        </div>
        <LucideChevronsUpDown className="mx-0.5 size-3.5 flex-none" />
      </button>
    </Dropdown>
  );
}
