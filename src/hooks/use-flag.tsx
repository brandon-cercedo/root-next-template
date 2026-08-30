"use client";

import { createContext, useContext, ReactNode } from "react";

import {
  type FlagOverrides,
  type PartialFlagOverrides,
} from "@/lib/flags/config";

type FlagContextType = {
  values: FlagOverrides | undefined;
  overrides: PartialFlagOverrides | undefined;
};

const FlagContext = createContext<FlagContextType | undefined>(undefined);

export function FlagProvider({
  values,
  overrides,
  children,
}: {
  values?: FlagOverrides;
  overrides?: PartialFlagOverrides;
  children: ReactNode;
}) {
  return (
    <FlagContext.Provider value={{ values, overrides }}>
      {children}
    </FlagContext.Provider>
  );
}

export function useFlag() {
  const context = useContext(FlagContext);
  if (!context) {
    throw new Error("useFlag must be used within a FlagProvider");
  }
  return context;
}
