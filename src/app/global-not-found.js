import "./globals.css";
import { typografiKlasser } from "@/lib/typografi";
import { KursForslag } from "@/components/ak1a/kurs-forslag";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
// VÅG 86: sökindexet på app-roten (två nivåer upp — grupp-not-found:arna
// ligger en nivå djupare och kör "../../../public/…").
import sokindex from "../../public/sok-index.json";

/**
 * GLOBAL NOT-FOUND (VÅG 86 — KARTA §5, flytt-agentens avvikelse #2).
 *
 * Next 16-konvention (verifierad mot installerad 16.3.2 + officiella docs
 * 16.3.x): filen på APP-ROTEN (src/app/global-not-found.js) renderas för
 * HELT omatchade URL:er när experimental.globalNotFound = true i
 * next.config.ts. Den BYPASSAR alla route-group-layouter ((huvud)/(en)/(ar))
 * och måste därför rendera ett EGET komplett dokument (<html>+<head>+<body>)
 * samt importera globala stilar/typografi själv — panelen är en egen kopia
 * av (huvud)/not-found.tsx (den får INTE importera från grupperna).
 *
 * noindex: Next 16-dokumenten tillåter numera metadata-export här, men för
 * versionsrobusthet sätts robots/title som vanliga <meta>/<title>-taggar i
 * JSX-<head> (dokumentet ägs helt av denna fil) — och Next injicerar dess
 *utom robots-noindex automatiskt på 404-svar.
 */

// Slug + titel per kurs (samma urval som grupp-not-found:arna, men utan
// TS-casts — detta är en .js-fil och ska vara ren JavaScript).
const KURSER = (Array.isArray(sokindex) ? sokindex : sokindex.kurser ?? [])
  .filter((k) => typeof k.slug === "string" && k.slug.length > 0)
  .map((k) => ({ slug: k.slug, titel: k.title ?? k.slug }));

const NAV_KORT = [
  {
    href: "/",
    rubrik: "Till startsidan",
    beskrivning: "Tillbaka till trygga vatten",
  },
  {
    href: "/kurser",
    rubrik: "Öppna kurserna",
    beskrivning: "300+ moduler i 27 kategorier",
  },
  {
    href: "/blogg",
    rubrik: "Läs bloggen",
    beskrivning: "Analyser och forskningsanteckningar",
  },
];

export default function GlobalNotFound() {
  return (
    <html lang="sv" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sidan hittades inte (404) | AK1A Research Lab</title>
        <meta
          name="description"
          content="Sidan du letade efter finns inte — gå tillbaka till AK1A Research Lab."
        />
        <meta name="robots" content="noindex" />
      </head>
      <body
        className={`${typografiKlasser} antialiased bg-background text-foreground paper-texture`}
      >
        <div className="flex min-h-screen flex-col">
          {/* Topp — varumärkes-logotypen (samma standard som alla sidor) */}
          <header className="flex justify-center px-4 pt-8 sm:pt-10">
            <VarumarkesLogo storlek="md" medText href="/" />
          </header>

          {/* Mitten — marin certifikat-panel med gravör-ram */}
          <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
            <section className="marin-panel gravor-ram w-full max-w-2xl rounded-2xl px-6 py-10 text-center sm:px-10 sm:py-12">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8C766]/85">
                AK1A Research Lab · Navigeringsfel
              </p>

              <p
                aria-hidden
                className="mt-5 font-serif text-7xl font-bold leading-none text-[#E8C766] tabular sm:text-8xl"
              >
                404
              </p>

              <h1 className="mt-4 font-serif text-2xl font-bold text-[#EDE6D6] sm:text-3xl">
                Sidan hittades inte
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#EDE6D6]/80">
                Även analytiker hamnar fel ibland — sidan du söker har flyttats
                eller har aldrig funnits. Låt oss guida dig tillbaka.
              </p>

              {/* Smarta kursförslag — fuzzy-matchar en gammal/ändrad kurslänk */}
              <KursForslag kurser={KURSER} />

              {/* Guld-hårlinje med mittornament */}
              <div aria-hidden className="mx-auto mt-7 flex max-w-xs items-center gap-3">
                <span className="hjarlinje flex-1" />
                <span className="font-serif text-xs text-[#E8C766]">◈</span>
                <span className="hjarlinje flex-1" />
              </div>

              {/* Tre länkkort — vanliga <a>-ankare (medvetet, ej next/link):
                  sidan äger sitt dokument utanför routerns layoutträd, och
                  hel-navigering är det robusta valet när beteendet ej kan
                  runtime-testas mot routerträdets kantfall. */}
              <nav aria-label="Vidare navigation" className="mt-7 grid gap-3 sm:grid-cols-3">
                {NAV_KORT.map((kort) => (
                  <a
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
                  </a>
                ))}
              </nav>
            </section>
          </main>

          {/* Botten — enkel guld-linje (sidfootskänsla, inga bilder) */}
          <footer className="px-4 pb-8 pt-2 sm:pb-10">
            <div className="mx-auto max-w-xl text-center">
              <div aria-hidden className="hjarlinje" />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                AK1A Research Lab · Pedagogisk finansanalys — inte investeringsråd
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
