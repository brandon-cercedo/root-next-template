"use client";

import { LucideChevronLeft } from "lucide-react";
import Link from "next/link";

import BaseNavbar from "@/components/layout/navbar/BaseNavbar";
import PageContainer from "@/components/layout/PageContainer";
import { paths } from "@/lib/config/paths";

type PageErrors = {
  [key: string]: {
    status: number;
    title: string;
    message: string;
  };
};

const PAGE_ERRORS: PageErrors = {
  AccessDenied: {
    status: 403,
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
  },
  NotFound: {
    status: 404,
    title: "Not Found",
    message: "This page could not be found.",
  },
  FailedToSignIn: {
    status: 500,
    title: "Failed to Sign In",
    message:
      "We're having trouble completing your sign-in. Please try again in a moment.",
  },
  Default: {
    status: 500,
    title: "Oops, something went wrong",
    message:
      "Please try again later or contact support if the problem continues.",
  },
} as const;

type ErrorCode = keyof typeof PAGE_ERRORS;

function getErrorCode(code?: string): ErrorCode {
  if (!code || !(code in PAGE_ERRORS)) {
    return "Default";
  }
  return code;
}

export default function PageErrorView({ error }: { error?: string }) {
  const code = getErrorCode(error);
  const info = PAGE_ERRORS[code];

  return (
    <PageContainer>
      <BaseNavbar>
        <Link
          href={paths.home()}
          className="font-medium text-gray-600 hover:text-gray-400 focus:text-gray-400 focus:outline-hidden dark:text-neutral-400 dark:hover:text-neutral-500 dark:focus:text-neutral-500"
        >
          Home
        </Link>
      </BaseNavbar>
      <main id="content">
        <div className="px-4 py-10 text-center sm:px-6 lg:px-8">
          <h1 className="block text-7xl font-bold text-gray-800 sm:text-9xl dark:text-neutral-200">
            {info.status}
          </h1>
          <h2 className="mt-3 block text-2xl font-semibold text-gray-800 dark:text-neutral-200">
            {info.title}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-neutral-400">
            {info.message}
          </p>

          <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <button
              onClick={() => window.history.back()}
              className="inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-2xs transition-colors hover:bg-blue-700 focus:bg-blue-700 focus:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
            >
              <LucideChevronLeft className="size-4 shrink-0" />
              Go Back
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-5 text-center">
        <div className="mx-auto max-w-340 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            © All Rights Reserved. {new Date().getFullYear()}.
          </p>
        </div>
      </footer>
    </PageContainer>
  );
}
