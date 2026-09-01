import type { Metadata } from "next";
import Link from "next/link";
import { Ak1aLogo } from "@/components/ak1a/primitives";

export const metadata: Metadata = {
  title: "Sidan hittades inte (404) | AK1A Research Lab",
  description: "Sidan du letade efter finns inte — gå tillbaka till AK1A Research Lab.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="paper-texture flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" aria-label="Till startsidan">
        <Ak1aLogo size="lg" />
      </Link>
      <p className="mt-8 font-serif text-6xl font-bold text-gold">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold">Sidan hittades inte</h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Sidan du letar efter finns inte. Den kan ha flyttats eller aldrig funnits.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-gold px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
        >
          🏠 Till startsidan
        </Link>
        <Link
          href="/kurser"
          className="rounded-lg border border-gold/40 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/10"
        >
          📚 Alla kurser
        </Link>
        <Link
          href="/laroplan"
          className="rounded-lg border border-gold/40 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/10"
        >
          🗺️ Läroplanen
        </Link>
      </div>
    </div>
  );
}
