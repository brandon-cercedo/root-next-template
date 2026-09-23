import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ChatInstancesProvider,
  useChatInstances,
} from "@/hooks/use-chat-instances";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ChatInstancesProvider>{children}</ChatInstancesProvider>;
}

describe("useChatInstances", () => {
  it("should throw when used outside ChatInstancesProvider", () => {
    expect(() => renderHook(() => useChatInstances())).toThrow(
      "useChatInstances must be used within a ChatInstancesProvider"
    );
  });

  it("should reuse the same instance for the same id", () => {
    const { result } = renderHook(() => useChatInstances(), {
      wrapper: Wrapper,
    });

    const first = result.current.getOrCreateInstance({
      id: "a",
      create: () => ({ label: "one" }),
    });
    const second = result.current.getOrCreateInstance({
      id: "a",
      create: () => ({ label: "two" }),
    });

    expect(second).toBe(first);
    expect(second).toEqual({ label: "one" });
  });

  it("should delete an instance by id", () => {
    const { result } = renderHook(() => useChatInstances(), {
      wrapper: Wrapper,
    });

    result.current.getOrCreateInstance({
      id: "a",
      create: () => ({ label: "one" }),
    });
    result.current.deleteInstance("a");

    const recreated = result.current.getOrCreateInstance({
      id: "a",
      create: () => ({ label: "two" }),
    });

    expect(recreated).toEqual({ label: "two" });
  });
});
