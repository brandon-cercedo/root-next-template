"use client";

import { LucideChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { mergeClsx } from "@/lib/utils/styles";

const THRESHOLD_PX = 8;

function isNearBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= THRESHOLD_PX;
}

type ScrollableContainerProps = {
  children: ReactNode;
  rootClassName?: string;
  containerClassName?: string;
  className?: string;
  buttonClassName?: string;
};

type RootTag = "div" | "section" | "main";

type ScrollableContainerRootProps = ScrollableContainerProps & {
  tag?: RootTag;
};

function ScrollableContainerRoot({
  tag: Root = "div",
  children,
  rootClassName,
  containerClassName,
  className,
  buttonClassName,
}: ScrollableContainerRootProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const scroll = scrollRef.current;
    const content = contentRef.current;
    if (!scroll || !content) {
      return;
    }

    const update = () => {
      setIsAtBottom(isNearBottom(scroll));
    };

    update();
    scroll.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    observer.observe(content);

    return () => {
      scroll.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function scrollToBottom() {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  return (
    <Root
      className={mergeClsx(
        "group relative flex min-h-0 flex-1",
        rootClassName
      )}
    >
      <div
        ref={scrollRef}
        className={mergeClsx(
          "min-h-0 w-full overflow-y-auto overscroll-contain",
          containerClassName
        )}
      >
        <div
          ref={contentRef}
          className={mergeClsx("flex min-h-full w-full flex-col", className)}
        >
          {children}
        </div>
      </div>
      {!isAtBottom && (
        <button
          type="button"
          aria-label="Scroll to bottom"
          onClick={scrollToBottom}
          className={mergeClsx(
            "absolute bottom-4 left-1/2 z-10 inline-flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-gray-100 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800",
            buttonClassName
          )}
        >
          <LucideChevronDown
            className="size-5 flex-none text-blue-600 dark:text-blue-500"
            strokeWidth={1.5}
          />
        </button>
      )}
    </Root>
  );
}

function createComponent(tag: RootTag) {
  return function Component(props: ScrollableContainerProps) {
    return <ScrollableContainerRoot tag={tag} {...props} />;
  };
}

const ScrollableContainer = Object.assign(createComponent("div"), {
  div: createComponent("div"),
  section: createComponent("section"),
  main: createComponent("main"),
});

export default ScrollableContainer;
