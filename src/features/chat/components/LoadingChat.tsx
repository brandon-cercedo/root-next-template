import { LucideBot } from "lucide-react";

export default function LoadingChat() {
  return (
    <div
      role="status"
      className="flex size-full flex-col items-center justify-center gap-4 p-4 text-center"
    >
      <LucideBot
        className="size-10 flex-none text-gray-800 dark:text-neutral-200"
        strokeWidth={1.5}
      />
      <div className="relative">
        <span className="text-sm text-gray-500 dark:text-neutral-500">
          Loading chat
        </span>
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-full ms-2 inline-flex gap-x-1"
        >
          <span className="size-1 animate-[typing-wave_0.9s_ease-in-out_infinite] rounded-full bg-blue-600 dark:bg-blue-500" />
          <span className="size-1 animate-[typing-wave_0.9s_ease-in-out_infinite_0.1s] rounded-full bg-blue-600 dark:bg-blue-500" />
          <span className="size-1 animate-[typing-wave_0.9s_ease-in-out_infinite_0.2s] rounded-full bg-blue-600 dark:bg-blue-500" />
        </span>
      </div>
    </div>
  );
}
