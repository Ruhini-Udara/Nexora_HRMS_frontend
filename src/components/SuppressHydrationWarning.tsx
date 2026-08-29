"use client";

import { useEffect } from "react";

export function SuppressHydrationWarning() {
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("A tree hydrated but some attributes of the server rendered HTML didn't match") ||
         args[0].includes("bis_skin_checked") ||
         args[0].includes("Hydration failed because the initial UI does not match what was rendered on the server") ||
         args[0].includes("Warning: Expected server HTML to contain a matching"))
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
  }, []);

  return null;
}
