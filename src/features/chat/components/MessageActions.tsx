"use client";

import { UIMessage } from "ai";
import moment from "moment";

import Clipboard from "@/components/ui/Clipboard";
import Tooltip from "@/components/ui/Tooltip";
import { ChatMessageMetadata } from "@/hooks/use-chatbot";
import { humanizeDate } from "@/lib/utils/date";

function getDurationSeconds(durationMs: number) {
  return Math.round(durationMs / 1000);
}

function TimestampTooltip({
  metadata,
  role,
}: {
  metadata: ChatMessageMetadata;
  role: UIMessage["role"];
}) {
  const { timestamp, durationMs } = metadata;
  const fullTimestamp = moment(timestamp).format("MMM D, YYYY h:mm A");
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <span>{fullTimestamp}</span>
          {role === "assistant" && durationMs != null && (
            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
              {`Worked for ${getDurationSeconds(durationMs)}s`}
            </span>
          )}
        </div>
      }
    >
      <span>{humanizeDate(timestamp, "xs")}</span>
    </Tooltip>
  );
}

type MessageActionsProps = {
  role: UIMessage["role"];
  text: string;
  metadata?: ChatMessageMetadata;
};

export default function MessageActions({
  role,
  text,
  metadata,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-400">
      <Clipboard
        text={text}
        size="sm"
        className="border-0 text-gray-500 shadow-none dark:text-neutral-400"
      />
      {metadata && <TimestampTooltip metadata={metadata} role={role} />}
    </div>
  );
}
