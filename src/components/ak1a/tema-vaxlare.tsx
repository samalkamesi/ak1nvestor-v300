"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * TEMAVÄXLARE — mörkt läge med ett klick, på alla sidor.
 * Reader-vänligt nattläge: varm mörk bas + samma guldaccent.
 */
export function TemaVaxlare() {
  const { theme, setTheme } = useTheme();
  const [fardig, setFardig] = useState(false);

  useEffect(() => setFardig(true), []);

  // Placeholder tills klienten hydrerats (undvik SSR/HTML-mismatch)
  if (!fardig) {
    return <span className="inline-block h-8 w-8" aria-hidden />;
  }

  const morkt = theme === "dark";
  return (
    <button
      onClick={() => setTheme(morkt ? "light" : "dark")}
      aria-label={morkt ? "Växla till ljust läge" : "Växla till mörkt läge"}
      title={morkt ? "Ljust läge" : "Mörkt läge"}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 text-sm transition-colors hover:bg-gold/10"
    >
      {morkt ? "☀️" : "🌙"}
    </button>
  );
}
