"use client";

import { signIn } from "next-auth/react";
import { useState, SubmitEvent } from "react";

import FormError from "@/components/ui/FormError";
import { ChromeIcon } from "@/components/ui/icons/ChromeIcon";
import SpinnerIcon from "@/components/ui/spinners/SpinnerIcon";
import { paths } from "@/lib/config/paths";

function CredentialsSignIn() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        window.location.href = paths.dashboard.home();
      }
    } catch {
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm dark:text-white"
          >
            Email address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              className="block w-full rounded-lg border-gray-200 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 sm:py-3 sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              required
              disabled={isLoading}
              placeholder="you@example.com"
              aria-describedby="email-error"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm dark:text-white"
          >
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              className="block w-full rounded-lg border-gray-200 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 sm:py-3 sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              required
              disabled={isLoading}
              placeholder="••••••••"
              aria-describedby="password-error"
            />
          </div>
        </div>
        {error && <FormError errors={[error]} className="mt-0" />}
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        >
          <span>Sign in</span>
          {isLoading && (
            <SpinnerIcon size="sm" className="text-white dark:text-white" />
          )}
        </button>
      </div>
    </form>
  );
}

function GoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: paths.dashboard.home() });
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-2xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
    >
      <ChromeIcon className="size-4 flex-none" />
      <span>Sign in with Google</span>
      {isLoading && (
        <SpinnerIcon size="sm" className="text-blue-600 dark:text-blue-500" />
      )}
    </button>
  );
}

export default function SignInCard() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-gray-200 bg-white p-4 shadow-2xs sm:p-7 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="text-center">
        <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
          Sign in
        </h1>
      </div>
      <div className="flex w-full flex-col gap-4">
        <GoogleSignIn />
        <div className="flex items-center text-xs text-gray-400 uppercase before:me-6 before:flex-1 before:border-t before:border-gray-200 after:ms-6 after:flex-1 after:border-t after:border-gray-200 dark:text-neutral-500 dark:before:border-neutral-600 dark:after:border-neutral-600">
          Or
        </div>
        <CredentialsSignIn />
      </div>
    </div>
  );
}
