import { type ChatStatus } from "ai";
import { LucideArrowUp, LucideSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import TextareaAutoHeight from "@/components/ui/forms/TextareaAutoHeight";
import { mergeClsx } from "@/lib/utils/styles";

/**
 * @param textarea - The textarea element to check.
 * @param isExpanded - The current expanded state.
 * - It keeps the input expanded until it is cleared.
 * - Re-measuring alone would flip between row and column on every change.
 */
function getIsExpanded(textarea: HTMLTextAreaElement, isExpanded: boolean) {
  if (textarea.value.length === 0) {
    return false;
  }

  if (isExpanded) {
    return true;
  }

  const style = getComputedStyle(textarea);
  const height =
    parseFloat(style.lineHeight) +
    parseFloat(style.paddingTop) +
    parseFloat(style.paddingBottom);
  const minHeight = parseFloat(style.minHeight);
  const singleLineHeight = Math.max(minHeight, height);

  return textarea.scrollHeight > singleLineHeight;
}

type ChatInputProps = {
  status: ChatStatus;
  disabled?: boolean;
  onSend: (text: string) => void | Promise<void>;
  onStop: () => void;
};

export default function ChatInput({
  status,
  disabled = false,
  onSend,
  onStop,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isWorking = status === "submitted" || status === "streaming";
  const shouldSend = input.trim().length > 0 && !isWorking && !disabled;

  // Watch wraps caused by the input narrowing rather than by typing.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const update = () => {
      setIsExpanded((prev) => getIsExpanded(textarea, prev));
    };

    const observer = new ResizeObserver(update);
    observer.observe(textarea);

    return () => observer.disconnect();
  }, []);

  const handleSend = async () => {
    if (!shouldSend) {
      return;
    }

    const text = input.trim();
    const prevIsExpanded = isExpanded;

    setInput("");
    setIsExpanded(false);
    try {
      await onSend(text);
    } catch {
      setInput(text);
      setIsExpanded(prevIsExpanded);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    setInput(textarea.value);
    setIsExpanded((prev) => getIsExpanded(textarea, prev));
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSend();
      }}
      className={mergeClsx(
        "flex w-full gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg transition-all focus-within:border-gray-300 focus-within:shadow-xl dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-none dark:focus-within:border-neutral-600",
        {
          "flex-col": isExpanded,
          "flex-row items-center": !isExpanded,
        }
      )}
    >
      <TextareaAutoHeight
        ref={textareaRef}
        value={input}
        rows={1}
        disabled={disabled}
        placeholder="Ask about code, your profile, or a UI action…"
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) {
            return;
          }

          event.preventDefault();
          handleSend();
        }}
        className={mergeClsx(
          "max-h-106 min-h-8 w-full min-w-0 resize-none border-0 bg-transparent p-2 py-1.25 text-sm text-gray-800 caret-gray-800 placeholder:text-gray-400 focus:border-transparent focus:ring-0 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:bg-transparent dark:text-neutral-200 dark:caret-neutral-200 dark:placeholder:text-neutral-500",
          {
            "flex-1": !isExpanded,
          }
        )}
      />

      <div className="flex items-center gap-2">
        <div className="ms-auto flex items-center gap-2">
          {isWorking ? (
            <button
              type="button"
              aria-label="Stop response"
              disabled={disabled}
              onClick={onStop}
              className="inline-flex size-8 flex-none items-center justify-center rounded-lg border border-transparent bg-gray-900 text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100 dark:focus-visible:outline-white"
            >
              <LucideSquare className="size-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send message"
              disabled={!shouldSend}
              className="inline-flex size-8 flex-none items-center justify-center rounded-lg border border-transparent bg-gray-900 text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:pointer-events-none disabled:border-gray-200 disabled:bg-white disabled:text-gray-800 disabled:opacity-50 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100 dark:focus-visible:outline-white dark:disabled:border-neutral-700 dark:disabled:bg-neutral-800 dark:disabled:text-white"
            >
              <LucideArrowUp className="size-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
