import { describe, expect, it } from "vitest";

import { fixHTMLSelector } from "@/lib/utils/html";

describe("fixHTMLSelector", () => {
  it("should return undefined for an empty value", () => {
    expect(fixHTMLSelector("")).toBeUndefined();
  });

  it("should keep a selector that already starts with #", () => {
    expect(fixHTMLSelector("#modal")).toBe("#modal");
  });

  it("should prefix a selector that is missing #", () => {
    expect(fixHTMLSelector("modal")).toBe("#modal");
  });
});
