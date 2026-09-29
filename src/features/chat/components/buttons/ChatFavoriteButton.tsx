"use client";

import clsx from "clsx";
import { LucideStar } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import SpinnerIcon from "@/components/ui/spinners/SpinnerIcon";
import { toggleFavoriteChatSession } from "@/features/chat/actions";
import { mergeClsx } from "@/lib/utils/styles";
import { ChatSession } from "@/prisma/types/generated/browser";

type ChatFavoriteButtonProps = {
  chat: ChatSession;
  label?: string;
  className?: string;
};

export default function ChatFavoriteButton({
  chat,
  label,
  className,
}: ChatFavoriteButtonProps) {
  const [isLoading, startTransition] = useTransition();

  const handleToggleFavorite = () => {
    const nextValue = !chat.isFavourite;
    startTransition(async () => {
      const result = await toggleFavoriteChatSession({
        id: chat.id,
        isFavourite: nextValue,
      });
      if (!result.success) {
        toast.error("Failed to update favorite", {
          description: "Please refresh the page and try again.",
        });
      }
    });
  };

  return (
    <button
      type="button"
      className={mergeClsx(
        "inline-flex size-6 flex-none items-center justify-center gap-1 rounded-lg text-[13px] leading-4 text-gray-500 hover:bg-gray-200 focus:bg-gray-200 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus:bg-neutral-800",
        className
      )}
      onClick={handleToggleFavorite}
      disabled={isLoading}
    >
      {isLoading ? (
        <SpinnerIcon size="sm" />
      ) : (
        <LucideStar
          className={clsx("size-4 flex-none", {
            "fill-current text-yellow-400": chat.isFavourite,
          })}
        />
      )}
      {label}
    </button>
  );
}
