import { describe, expect, it } from "vitest";

import { isChatWorking } from "@/lib/utils/db/chat";

import type { ChatSessionStatus } from "@/prisma/types/generated/browser";

describe("isChatWorking", () => {
  it.each<ChatSessionStatus>(["submitted", "streaming"])(
    "should return true when the status is %s",
    (status) => {
      expect(isChatWorking(status)).toBe(true);
    }
  );

  it.each<ChatSessionStatus>(["ready", "error", "aborted"])(
    "should return false when the status is %s",
    (status) => {
      expect(isChatWorking(status)).toBe(false);
    }
  );
});
