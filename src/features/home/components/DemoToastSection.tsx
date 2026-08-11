"use client";

import { LucideBell } from "lucide-react";
import { toast } from "sonner";

const DEMO_TOASTS = [
  {
    id: "default",
    label: "Default",
    onClick: () => toast("This is a default toast"),
  },
  {
    id: "success",
    label: "Success",
    onClick: () => toast.success("This is a success toast"),
  },
  {
    id: "error",
    label: "Error",
    onClick: () => toast.error("This is an error toast"),
  },
  {
    id: "warning",
    label: "Warning",
    onClick: () => toast.warning("This is a warning toast"),
  },
  {
    id: "info",
    label: "Info",
    onClick: () => toast.info("This is an info toast"),
  },
] as const;

export default function DemoToastSection() {
  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <LucideBell className="size-3.5 text-gray-500 dark:text-neutral-500" />
        <div className="text-xs font-medium text-gray-500 dark:text-neutral-500">
          Toast demos
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEMO_TOASTS.map((demoToast) => (
          <button
            key={demoToast.id}
            type="button"
            onClick={demoToast.onClick}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-2xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
          >
            {demoToast.label}
          </button>
        ))}
      </div>
    </section>
  );
}
