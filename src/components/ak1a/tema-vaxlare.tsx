"use client";

import { useTheme } from "next-themes";

/**
 * TEMAVÄXLARE — mörkt läge med ett klick, på alla sidor.
 * Ikonen väljs via CSS (dark:variant) så SSR-markup är identisk med klienten —
 * ingen hydration-mismatch, knappen syns direkt även utan JS.
 */
export function TemaVaxlare() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Växla mellan ljust och mörkt läge"
      title="Mörkt/ljust läge"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 text-sm transition-colors hover:bg-gold/10 max-md:h-[52px] max-md:w-[52px]"
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline">☀️</span>
    </button>
  );
}
