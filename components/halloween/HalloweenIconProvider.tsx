"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Provides the build-time result of "does the official Halloween icon exist?".
 *
 * `HalloweenIcon` reads this instead of probing for the file from the browser, so
 * a missing asset never produces a network request, a broken image, or an error
 * in the console.
 */

const HalloweenIconContext = createContext<boolean>(false);

export function HalloweenIconProvider({
  available,
  children,
}: {
  available: boolean;
  children: ReactNode;
}) {
  return (
    <HalloweenIconContext.Provider value={available}>
      {children}
    </HalloweenIconContext.Provider>
  );
}

export function useHalloweenIconAvailable(): boolean {
  return useContext(HalloweenIconContext);
}

export default HalloweenIconProvider;