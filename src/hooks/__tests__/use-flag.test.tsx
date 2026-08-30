import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FlagProvider, useFlag } from "@/hooks/use-flag";
import {
  type FlagOverrides,
  type PartialFlagOverrides,
} from "@/lib/flags/config";

function Wrapper({
  children,
  values,
  overrides,
}: {
  children: React.ReactNode;
  values?: FlagOverrides;
  overrides?: PartialFlagOverrides;
}) {
  return (
    <FlagProvider values={values} overrides={overrides}>
      {children}
    </FlagProvider>
  );
}

describe("useFlag", () => {
  it("should throw when used outside FlagProvider", () => {
    expect(() => renderHook(() => useFlag())).toThrow(
      "useFlag must be used within a FlagProvider"
    );
  });

  it("should return values and overrides from FlagProvider", () => {
    const values: FlagOverrides = {
      "client-debug": true,
      "server-debug": false,
    };
    const overrides: PartialFlagOverrides = { "client-debug": true };

    const { result } = renderHook(() => useFlag(), {
      wrapper: ({ children }) => (
        <Wrapper values={values} overrides={overrides}>
          {children}
        </Wrapper>
      ),
    });

    expect(result.current.values).toEqual(values);
    expect(result.current.overrides).toEqual(overrides);
  });

  it("should allow undefined values and overrides", () => {
    const { result } = renderHook(() => useFlag(), {
      wrapper: Wrapper,
    });

    expect(result.current.values).toBeUndefined();
    expect(result.current.overrides).toBeUndefined();
  });
});
