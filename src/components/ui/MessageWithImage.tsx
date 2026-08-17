import { LucideGhost } from "lucide-react";

import { mergeClsx } from "@/lib/utils/styles";

interface NotFoundEntityProps {
  title: string;
  message?: string;
  image?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export default function MessageWithImage({
  title,
  message,
  image = (
    <LucideGhost
      className="size-16 flex-none text-gray-800 sm:size-28 dark:text-neutral-200"
      strokeWidth={1.5}
    />
  ),
  className,
  titleClassName,
}: NotFoundEntityProps) {
  return (
    <div
      className={mergeClsx(
        "flex size-full flex-col items-center justify-center gap-4 p-4 text-center",
        className
      )}
    >
      {image}
      <div className="flex w-full flex-col items-center gap-2">
        <h2
          className={mergeClsx(
            "text-2xl font-semibold text-gray-800 dark:text-white",
            titleClassName
          )}
        >
          {title}
        </h2>
        {message && (
          <p className="text-gray-500 dark:text-neutral-500">{message}</p>
        )}
      </div>
    </div>
  );
}
