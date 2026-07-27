import { LucideMenu, LucideX } from "lucide-react";

import AppLogo from "@/components/brand/AppLogo";

export default function BaseNavbar({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <header className="z-50 mb-auto flex w-full flex-wrap py-4 text-sm sm:flex-nowrap sm:justify-start">
      <nav className="w-full px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <AppLogo />
          <div className="sm:hidden">
            <button
              type="button"
              className="hs-collapse-toggle relative flex size-9 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
              id="hs-navbar-cover-page-collapse"
              aria-expanded="false"
              aria-controls="hs-navbar-cover-page"
              aria-label="Toggle navigation"
              data-hs-collapse="#hs-navbar-cover-page"
            >
              <LucideMenu className="size-4 shrink-0 hs-collapse-open:hidden" />
              <LucideX className="hidden size-4 shrink-0 hs-collapse-open:block" />
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
        </div>

        <div
          id="hs-navbar-cover-page"
          className="hs-collapse hidden grow basis-full overflow-hidden transition-all duration-300 sm:block"
          aria-labelledby="hs-navbar-cover-page-collapse"
        >
          <div className="mt-5 flex flex-col gap-5 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:ps-5">
            {children}
          </div>
        </div>
      </nav>
    </header>
  );
}
