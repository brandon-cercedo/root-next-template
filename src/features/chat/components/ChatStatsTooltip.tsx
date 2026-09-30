"use client";

import {
  LucideActivity,
  LucideCalendarPlus,
  LucideHistory,
  LucideIcon,
  LucideMessageCircle,
  LucideRabbit,
  LucideSnail,
  LucideTimer,
} from "lucide-react";
import moment from "moment";

import Tooltip from "@/components/ui/Tooltip";
import { getChatStats } from "@/features/chat/utils";
import { humanizeMs } from "@/lib/utils/date";
import { ChatSession } from "@/prisma/types/generated/browser";

type StatTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
};

function StatTile({ icon: Icon, label, value, description }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-gray-100 px-2 py-1.5 dark:bg-neutral-700">
      <dt className="flex items-center gap-1 leading-5 font-medium text-gray-800 dark:text-gray-200">
        <Icon className="size-3.5 flex-none text-blue-600 dark:text-blue-500" />
        {label}
      </dt>
      <dd className="flex flex-col gap-0.5">
        <div className="text-sm leading-5 font-semibold tabular-nums">
          {value}
        </div>
        {description && (
          <div className="text-xs text-gray-500 tabular-nums dark:text-neutral-400">
            {description}
          </div>
        )}
      </dd>
    </div>
  );
}

type DateRowProps = {
  icon: LucideIcon;
  label: string;
  date: Date;
};

function DateRow({ icon: Icon, label, date }: DateRowProps) {
  return (
    <div className="flex items-center gap-x-2">
      <Icon className="size-3.5 flex-none text-gray-400 dark:text-neutral-500" />
      <dt className="flex-1 text-gray-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-end tabular-nums">
        {moment(date).format("MMM D [at] h:mm A")}
      </dd>
    </div>
  );
}

function Content({ chat }: { chat: ChatSession }) {
  const {
    userCount,
    assistantCount,
    totalDurationMs,
    averageDurationMs,
    fastestDurationMs,
    slowestDurationMs,
  } = getChatStats(chat);

  return (
    <div className="divide-y divide-gray-200 dark:divide-neutral-700">
      <div className="w-full space-y-0.5 p-2">
        <dl className="grid grid-cols-2 gap-2">
          <StatTile
            icon={LucideMessageCircle}
            label="Messages"
            value={String(userCount + assistantCount)}
            description={`${userCount} you · ${assistantCount} AI`}
          />
          <StatTile
            icon={LucideTimer}
            label="Work time"
            value={humanizeMs(totalDurationMs)}
            description={
              averageDurationMs > 0
                ? `avg ${humanizeMs(averageDurationMs)}`
                : undefined
            }
          />
          <StatTile
            icon={LucideRabbit}
            label="Fastest"
            value={humanizeMs(fastestDurationMs)}
          />
          <StatTile
            icon={LucideSnail}
            label="Slowest"
            value={humanizeMs(slowestDurationMs)}
          />
        </dl>
      </div>
      <div className="w-full space-y-0.5 p-2">
        <dl className="flex flex-col gap-1">
          <DateRow
            icon={LucideCalendarPlus}
            label="Created"
            date={chat.createdAt}
          />
          <DateRow
            icon={LucideHistory}
            label="Updated"
            date={chat.lastMessageAt}
          />
        </dl>
      </div>
    </div>
  );
}

function Trigger() {
  return (
    <button
      type="button"
      className="inline-flex size-6 flex-none items-center justify-center gap-x-1 rounded-lg text-[13px] leading-4 text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:bg-gray-200 focus:text-gray-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:text-neutral-400"
    >
      <LucideActivity className="size-3.5 flex-none" />
      <span className="sr-only">Chat stats</span>
    </button>
  );
}

type ChatStatsTooltipProps = {
  chat: ChatSession;
};

export default function ChatStatsTooltip({ chat }: ChatStatsTooltipProps) {
  return (
    <Tooltip
      content={<Content chat={chat} />}
      placement="bottom-right"
      className="w-60 rounded-lg p-0"
    >
      <Trigger />
    </Tooltip>
  );
}
