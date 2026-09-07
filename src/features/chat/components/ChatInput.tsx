import { type ChatStatus } from "ai";
import { LucideArrowUp, LucideSquare } from "lucide-react";
import { useState } from "react";

import TextareaAutoHeight from "@/components/ui/forms/TextareaAutoHeight";

type ChatInputProps = {
  status: ChatStatus;
  onSend: (text: string) => undefined;
  onStop: () => void;
};

export default function ChatInput({ status, onSend, onStop }: ChatInputProps) {
  const [input, setInput] = useState("");
  const isWorking = status === "submitted" || status === "streaming";
  const shouldSend = input.trim().length > 0 && !isWorking;

  const handleSend = () => {
    if (!shouldSend) {
      return;
    }

    const text = input.trim();
    onSend(text);
    setInput("");
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSend();
      }}
      className="sticky bottom-4 flex w-full flex-col gap-2 rounded-2xl border border-gray-300 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-neutral-700"
    >
      <TextareaAutoHeight
        value={input}
        rows={1}
        placeholder="Ask root…"
        onChange={(event) => {
          setInput(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) {
            return;
          }

          event.preventDefault();
          handleSend();
        }}
        className="max-h-106 min-h-10 w-full resize-none border-0 p-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-hidden dark:text-neutral-200 dark:placeholder:text-neutral-500"
      />

      <div className="flex items-center gap-2">
        <div className="ms-auto flex items-center gap-2">
          {isWorking ? (
            <button
              type="button"
              aria-label="Stop response"
              onClick={onStop}
              className="inline-flex size-8 flex-none items-center justify-center rounded-lg border border-transparent bg-gray-900 text-white dark:bg-white dark:text-neutral-800"
            >
              <LucideSquare className="size-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send message"
              disabled={!shouldSend}
              className="inline-flex size-8 flex-none items-center justify-center rounded-lg border border-transparent bg-gray-900 text-white disabled:pointer-events-none disabled:border-gray-200 disabled:bg-white disabled:text-gray-800 disabled:opacity-50 dark:bg-white dark:text-neutral-800 dark:disabled:border-neutral-700 dark:disabled:bg-neutral-800 dark:disabled:text-white"
            >
              <LucideArrowUp className="size-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
