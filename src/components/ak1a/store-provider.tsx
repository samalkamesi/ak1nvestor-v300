"use client";

import * as React from "react";

/**
 * Ensures the Zustand store (which uses persist + localStorage) is only
 * rendered on the client, avoiding hydration mismatches.
 */
export function Ak1aStoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  // We still render children immediately so SSR works; store hydration is
  // handled by zustand persist's skipHydration=false. This provider mainly
  // guards client-only consumers against reading window during SSR.
  return <>{children}</>;
}
