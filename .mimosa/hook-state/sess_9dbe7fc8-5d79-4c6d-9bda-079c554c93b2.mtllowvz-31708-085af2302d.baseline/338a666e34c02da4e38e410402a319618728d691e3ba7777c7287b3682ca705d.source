"use client";

import { useEffect } from "react";

/**
 * Registrerar service workern (PWA) i produktion — aldrig i dev,
 * där SW bara ställer till med caching av hot-reload.
 */
export function PwaRegistrerare() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* installation misslyckades — sajten fungerar ändå */
    });
  }, []);
  return null;
}
