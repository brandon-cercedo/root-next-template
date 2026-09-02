"use client";

import { LucideToggleLeft } from "lucide-react";

import { DROPDOWN_IDS } from "@/components/constants";
import FlagToolbarContent from "@/components/flags/FlagToolbarContent";
import ShortcutTooltip from "@/components/keyboard/ShortcutTooltip";
import Dropdown from "@/components/ui/Dropdown";
import { useFlag } from "@/hooks/use-flag";
import { isAdmin } from "@/lib/utils/db/user";
import { User } from "@/prisma/types/client";

export default function FlagToolbar({ user }: { user: User }) {
  const { values, overrides } = useFlag();

  if (!isAdmin(user) || !values) {
    return null;
  }

  return (
    <div className="absolute right-3 bottom-1/2" data-testid="flag-toolbar">
      <Dropdown
        id={DROPDOWN_IDS.FLAG_TOOLBAR}
        content={<FlagToolbarContent values={values} overrides={overrides} />}
        containerClassName="w-full"
        className="z-1000000000 w-sm max-w-sm"
        placement="right"
        autoClose="inside"
        isKeyActionsEnabled={false}
      >
        <ShortcutTooltip commandId="open-flag-toolbar" placement="left">
          <button
            type="button"
            className="inline-flex size-9.5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 focus:bg-indigo-700 focus:outline-hidden dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:bg-indigo-600"
          >
            <LucideToggleLeft
              aria-hidden="true"
              className="size-4 flex-none"
            />
          </button>
        </ShortcutTooltip>
      </Dropdown>
    </div>
  );
}
