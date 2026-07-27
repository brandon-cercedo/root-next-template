import { LucideChevronRight } from "lucide-react";
import Link from "next/link";

import BaseNavbar from "@/components/layout/navbar/BaseNavbar";
import { paths } from "@/lib/config/paths";

function Header() {
  return (
    <BaseNavbar>
      <Link
        href={paths.dashboard.home()}
        className="font-medium text-gray-600 hover:text-gray-400 focus:text-gray-400 focus:outline-hidden dark:text-neutral-400 dark:hover:text-neutral-500 dark:focus:text-neutral-500"
      >
        Dashboard
      </Link>
    </BaseNavbar>
  );
}

function Content() {
  return (
    <main id="content">
      <div className="px-4 py-10 text-center sm:px-6 lg:px-8">
        <h1 className="block text-2xl font-bold text-gray-900 sm:text-4xl dark:text-white">
          Welcome to{" "}
          <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Root
          </span>
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          A Next.js template with marketing and dashboard layout chrome ready
          to customize.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <Link
            href={paths.dashboard.home()}
            className="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            target="parent"
          >
            Get started
            <LucideChevronRight className="size-4 shrink-0" />
          </Link>
        </div>
      </div>
    </main>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto py-5 text-center">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {year} Root. Made with ❤️ by{" "}
          <a
            href="https://github.com/brandon-cercedo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-x-1 text-sm text-gray-600 hover:text-blue-600 focus:text-blue-600 focus:outline-hidden dark:text-gray-400 dark:hover:text-blue-500 dark:focus:text-blue-500"
          >
            brandon-cercedo
          </a>
        </p>
      </div>
    </footer>
  );
}

export default function LandingView() {
  return (
    <div className="mx-auto flex h-full min-h-screen max-w-3xl flex-col">
      <Header />
      <Content />
      <Footer />
    </div>
  );
}
