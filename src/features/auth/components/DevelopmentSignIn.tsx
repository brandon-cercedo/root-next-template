"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import FormError from "@/components/ui/FormError";
import SpinnerIcon from "@/components/ui/spinners/SpinnerIcon";
import { DEVELOPMENT_PROVIDER_ID } from "@/lib/auth/constants";
import { paths } from "@/lib/config/paths";

export default function DevelopmentSignIn() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setError(undefined);
    setIsLoading(true);

    const result = await signIn(DEVELOPMENT_PROVIDER_ID, {
      redirect: false,
    });
    if (!result?.ok) {
      setError("Invalid development user");
      setIsLoading(false);
      return;
    }

    window.location.href = paths.dashboard.home();
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-dashed border-indigo-600 bg-indigo-100 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:bg-indigo-200 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30 dark:focus:bg-indigo-500/30"
      >
        <span className="inline-flex items-center rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white shadow-md dark:bg-indigo-500">
          DEV
        </span>
        <span>Continue as development user</span>
        {isLoading && <SpinnerIcon size="sm" />}
      </button>
      {error && <FormError errors={[error]} className="mt-0" />}
    </div>
  );
}
