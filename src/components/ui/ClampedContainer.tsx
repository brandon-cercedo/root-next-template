"use client";

import { LucideFoldVertical, LucideUnfoldVertical } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { mergeClsx } from "@/lib/utils/styles";

type ClampedContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function ClampedContainer({
  children,
  className,
}: ClampedContainerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) {
      return;
    }

    const measure = () => {
      setIsClamped(isExpanded || el.scrollHeight > el.clientHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => observer.disconnect();
  }, [isExpanded]);

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        ref={contentRef}
        className={mergeClsx("max-h-25", className, {
          "h-auto max-h-none": isExpanded,
          "overflow-hidden": !isExpanded,
          "mask-b-from-50%": isClamped && !isExpanded,
        })}
      >
        {children}
      </div>
      {isClamped && (
        <button
          type="button"
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-1 text-[13px] leading-5 text-blue-600 dark:text-blue-500"
          onClick={() => setIsExpanded((open) => !open)}
        >
          {isExpanded ? (
            <LucideFoldVertical className="size-3.5 flex-none" />
          ) : (
            <LucideUnfoldVertical className="size-3.5 flex-none" />
          )}
          <span>{isExpanded ? "Show less" : "Show more"}</span>
        </button>
      )}
    </div>
  );
}
