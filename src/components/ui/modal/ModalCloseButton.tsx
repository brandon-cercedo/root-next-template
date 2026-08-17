import { LucideX } from "lucide-react";

import { fixHTMLSelector } from "@/lib/utils/html";
import { mergeClsx } from "@/lib/utils/styles";

type ModalCloseButtonProps = {
  modalId: string;
  className?: string;
  children?: React.ReactNode;
};

export default function ModalCloseButton({
  modalId,
  className,
  children = <LucideX className="size-4 shrink-0" />,
}: ModalCloseButtonProps) {
  const modalSelector = fixHTMLSelector(modalId);

  return (
    <button
      type="button"
      className={mergeClsx(
        "inline-flex size-8 items-center justify-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600 dark:focus:bg-neutral-600",
        className
      )}
      aria-label="Close"
      data-hs-overlay={modalSelector}
    >
      <span className="sr-only">Close</span>
      {children}
    </button>
  );
}
