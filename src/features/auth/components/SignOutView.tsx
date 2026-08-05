"use client";

import { signOut } from "next-auth/react";

import SpinnerIcon from "@/components/ui/spinners/SpinnerIcon";
import { paths } from "@/lib/config/paths";

export default function SignOutView() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-10 rounded-xl border border-gray-200 bg-white p-4 shadow-2xs sm:p-7 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
              Sign out
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Please wait while we sign you out...
            </p>
          </div>
          <SpinnerIcon
            size="lg"
            className="text-blue-600 dark:text-blue-500"
          />
          <button
            type="button"
            onClick={() => {
              signOut({ callbackUrl: paths.auth.signIn() });
            }}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
          >
            Click here if you&apos;re not redirected automatically
          </button>
        </div>
      </div>
    </div>
  );
}
