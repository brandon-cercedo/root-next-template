import { describe, expect, it } from "vitest";

import { composeUserDisplayName } from "@/lib/utils/db/user";

import { fakeUserComplete } from "../../../../../prisma/utils/fake-data";

describe("composeUserDisplayName", () => {
  it("should return the first name when name is present", () => {
    const mockUser = fakeUserComplete();
    const user = { ...mockUser, name: "John Doe" };

    expect(composeUserDisplayName(user)).toBe("John");
  });

  it("should return @email when name is missing", () => {
    const mockUser = fakeUserComplete();
    const user = { ...mockUser, name: null, email: "john@example.com" };

    expect(composeUserDisplayName(user)).toBe("@john");
  });
});
