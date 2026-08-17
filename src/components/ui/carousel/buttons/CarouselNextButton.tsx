import { LucideChevronRight } from "lucide-react";

import { mergeClsx } from "@/lib/utils/styles";

interface CarouselNextButtonProps {
  className?: string;
  icon?: React.ReactNode;
}

export default function CarouselNextButton({
  className,
  icon = <LucideChevronRight className="size-5 flex-none rtl:rotate-180" />,
}: CarouselNextButtonProps) {
  return (
    <div className="hs-carousel-next pointer-events-none absolute -end-5 top-1/2 flex h-full -translate-y-1/2 items-center justify-center bg-linear-to-r from-transparent to-white to-50% dark:to-neutral-900 hs-carousel-disabled:opacity-0">
      <button
        type="button"
        className={mergeClsx(
          "pointer-events-auto inline-flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 opacity-0 shadow-2xs transition-opacity duration-200 group-hover:opacity-100 hover:bg-gray-100 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 hs-carousel-disabled:pointer-events-none",
          className
        )}
      >
        {icon}
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
}
