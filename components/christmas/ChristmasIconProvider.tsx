"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Provides the build-time result of "does the official Christmas icon exist?".
 *
 * `ChristmasIcon` reads this instead of probing for the file from the browser, so
 * a missing asset never produces a network request, a broken image, or an error
 * in the console.
 */

const ChristmasIconContext = createContext<boolean>(false);

export function ChristmasIconProvider({
  available,
  children,
}: {
  available: boolean;
  children: ReactNode;
}) {
  return (
    <ChristmasIconContext.Provider value={available}>
      {children}
    </ChristmasIconContext.Provider>
  );
}

export function useChristmasIconAvailable(): boolean {
  return useContext(ChristmasIconContext);
}

export default ChristmasIconProvider;
