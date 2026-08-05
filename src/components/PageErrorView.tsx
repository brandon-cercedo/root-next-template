"use client";

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
    <div className="mx-auto flex size-full min-h-screen max-w-3xl flex-col">
      <main id="content" className="flex flex-1 flex-col justify-center">
        <div className="px-4 py-10 text-center sm:px-6 lg:px-8">
          <h1 className="block text-7xl font-bold text-zinc-800 sm:text-9xl">
            {info.status}
          </h1>
          <h2 className="mt-3 block text-2xl font-semibold text-zinc-800">
            {info.title}
          </h2>
          <p className="mt-3 text-zinc-600">{info.message}</p>
          <div className="mt-5 flex justify-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
