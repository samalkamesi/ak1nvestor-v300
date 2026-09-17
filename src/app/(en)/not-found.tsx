import type { Metadata } from "next";
import Link from "next/link";
import { KursForslag } from "@/components/ak1a/kurs-forslag";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
// VÅG 85: samma sökindex-källa som (huvud)/not-found.tsx (ett steg djupare).
import sokindex from "../../../public/sok-index.json";

export const metadata: Metadata = {
  title: "Page not found (404) | AK1A Research Lab",
  description: "The page you're looking for doesn't exist — return to AK1A Research Lab.",
  robots: { index: false },
};

/**
 * (en)-gruppens not-found (VÅG 85 — KARTA §5.2): samma marin certifikat-panel
 * som (huvud)/not-found.tsx, översatt till engelska (handskrivna strängar,
 * mönster som spegel-sidorna). Ingen canonical (404 ⇒ Next injicerar robots
 * noindex automatiskt). dir="ltr" ärvs av (en)-rot-layoutens <html lang="en">.
 * KursForslag fuzzy-matchar /en/kurser/…-slugar via våg-85-regexen.
 */
/**
 * Slugs per kurs — matchningen behöver bara slugs; titlarna hämtas löst
 * via /api/kurs-titlar (SPÅR 7 s7-u3 flight-kur, se (huvud)/not-found.tsx).
 */
const SLUGGAR = (
  (Array.isArray(sokindex) ? sokindex : sokindex.kurser ?? []) as Array<{
    slug?: string;
    title?: string;
  }>
)
  .filter((k): k is { slug: string; title?: string } => typeof k.slug === "string" && k.slug.length > 0)
  .map((k) => k.slug);

const NAV_KORT = [
  {
    href: "/en",
    rubrik: "To the start page",
    beskrivning: "Back to safe waters",
  },
  {
    href: "/en/kurser",
    rubrik: "Open the courses",
    beskrivning: "300+ modules in 27 categories",
  },
  {
    href: "/en/logga-in",
    rubrik: "Log in",
    beskrivning: "Access your account and progress",
  },
] as const;

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Topp — varumärkes-logotypen (samma standard som alla sidor) */}
      <header className="flex justify-center px-4 pt-8 sm:pt-10">
        <VarumarkesLogo storlek="md" medText href="/en" />
      </header>

      {/* Mitten — marin certifikat-panel med gravör-ram */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <section className="marin-panel gravor-ram w-full max-w-2xl rounded-2xl px-6 py-10 text-center sm:px-10 sm:py-12">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8C766]/85">
            AK1A Research Lab · Navigation error
          </p>

          <p
            aria-hidden
            className="mt-5 font-serif text-7xl font-bold leading-none text-[#E8C766] tabular sm:text-8xl"
          >
            404
          </p>

          <h1 className="mt-4 font-serif text-2xl font-bold text-[#EDE6D6] sm:text-3xl">
            Page not found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#EDE6D6]/80">
            Even analysts take a wrong turn sometimes — the page you're looking
            for has moved or never existed. Let us guide you back.
          </p>

          {/* Smarta kursförslag — fuzzy-matchar en gammal/ändrad kurslänk */}
          <KursForslag sluggar={SLUGGAR} />

          {/* Guld-hårlinje med mittornament */}
          <div aria-hidden className="mx-auto mt-7 flex max-w-xs items-center gap-3">
            <span className="hjarlinje flex-1" />
            <span className="font-serif text-xs text-[#E8C766]">◈</span>
            <span className="hjarlinje flex-1" />
          </div>

          {/* Tre länkkort */}
          <nav aria-label="Further navigation" className="mt-7 grid gap-3 sm:grid-cols-3">
            {NAV_KORT.map((kort) => (
              <Link
                key={kort.href}
                href={kort.href}
                className="btn-marin group block px-5 py-4 text-left"
              >
                <span className="flex items-center justify-between gap-2 font-serif text-base font-bold">
                  {kort.rubrik}
                  <span
                    aria-hidden
                    className="transition-transform duration-150 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
                <span className="mt-1 block text-xs text-[#EDE6D6]/70">{kort.beskrivning}</span>
              </Link>
            ))}
          </nav>
        </section>
      </main>

      {/* Botten — enkel guld-linje (sidfootskänsla, inga bilder) */}
      <footer className="px-4 pb-8 pt-2 sm:pb-10">
        <div className="mx-auto max-w-xl text-center">
          <div aria-hidden className="hjarlinje" />
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            AK1A Research Lab · Educational financial analysis — never investment advice
          </p>
        </div>
      </footer>
    </div>
  );
}
