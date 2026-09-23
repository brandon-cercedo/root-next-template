import { describe, expect, it } from "vitest";

import { sanitizeFlagOverrides } from "@/lib/flags/utils";

import { PartialFlagOverrides } from "../config";

describe("sanitizeFlagOverrides", () => {
  it("should keep only known boolean flag keys", () => {
    expect(
      sanitizeFlagOverrides({
        "client-debug": true,
        "server-debug": false,
        "user-message-markdown": true,
        unknown: true,
      } as PartialFlagOverrides)
    ).toEqual({
      "client-debug": true,
      "server-debug": false,
      "user-message-markdown": true,
    });
  });

  it("should omit keys that were not provided", () => {
    expect(sanitizeFlagOverrides({ "client-debug": true })).toEqual({
      "client-debug": true,
    });
  });
});
