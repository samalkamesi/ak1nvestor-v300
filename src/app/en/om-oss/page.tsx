import type { Metadata } from "next";
import Link from "next/link";
import { getCourseList } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

/** English thousand grouping (en-US: 8,211). */
const num = (n: number) => n.toLocaleString("en-US");

/**
 * ENGLISH MIRROR of /om-oss (Våg 51 agent S2).
 *
 * Full translation of the Swedish about page — the three model cards, the
 * founder, the principles, the education path and the contact section.
 * Standalone English copy; no shared strings with the Swedish page.
 * Figures are counted live from the content layer, like the Swedish page.
 */
export const metadata: Metadata = {
  title: "About us — AK1A Research Lab | Ak1 Apex Nexus",
  description:
    "AK1A Research Lab is Sweden's only institutional analysis methodology built for private individuals. Behind the platform stand Ak1 Apex Nexus and the founder Sam Alkamesi.",
  keywords: [
    "about AK1A",
    "AK1A Research Lab",
    "Ak1 Apex Nexus",
    "Sam Alkamesi",
    "stock analysis education",
  ],
  alternates: {
    canonical: `${SITE_URL}/en/om-oss`,
    languages: {
      "sv-SE": `${SITE_URL}/om-oss`,
      en: `${SITE_URL}/en/om-oss`,
      ar: `${SITE_URL}/ar/om-oss`,
      "x-default": `${SITE_URL}/om-oss`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "About us — AK1A Research Lab | Ak1 Apex Nexus",
    description:
      "An education platform with one simple conviction: institutional analysis methodology is a right.",
    url: `${SITE_URL}/en/om-oss`,
    siteName: "AK1A Research Lab",
    type: "website",
    locale: "en_US",
    alternateLocale: ["sv_SE", "ar_AR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About AK1A Research Lab",
    description:
      "Sweden's only institutional analysis methodology, built for private individuals.",
  },
};

export default function EnOmOssPage() {
  // Live figures — counted from the content layer at build
  const kurserLista = getCourseList();
  const antalKurser = kurserLista.length;
  const antalBokmaster = kurserLista.filter((c) => c.category === "BOKMASTER").length;

  return (
    <SeoPageShell wide breadcrumb={[{ name: "Start", href: "/en" }, { name: "About us" }]}>
      <h1 className="font-serif text-4xl font-bold">
        About AK1<span className="text-gold">A</span> Research Lab
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        AK1A Research Lab is an education platform with one simple
        conviction: institutional analysis methodology is a right — not a
        service reserved for the analysts of banks and fund managers.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gold/30 bg-card p-5">
          <div className="text-2xl">📊</div>
          <h2 className="mt-2 font-serif text-lg font-bold">AKM1</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            20 fundamental variables (V01–V20) in 7 categories: growth,
            valuation, profitability, stability, moat, catalyst and risk. 0–5
            points per variable, max 100.
          </p>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-card p-5">
          <div className="text-2xl">🌊</div>
          <h2 className="mt-2 font-serif text-lg font-bold">AK1TS</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Technical wave analysis: 5 theories (Elliott, Fibonacci, GANN,
            Lucas, volume) × 5 time horizons × 4 dimensions (wave, price,
            time, breakout) = 100 data points per holding.
          </p>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-card p-5">
          <div className="text-2xl">🎓</div>
          <h2 className="mt-2 font-serif text-lg font-bold">Education first</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {num(antalKurser)} courses, {num(antalBokmaster)} complete
            BOKMASTER books, calculator, portfolio system, AI mentor and
            spaced repetition — all woven together in one ecosystem.
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl font-bold">The founder</h2>
          <p className="mt-2 text-muted-foreground">
            Behind AK1nvestor.com and AK1A Research Lab stand the founder Sam
            Alkamesi and the company Ak1 Apex Nexus. The vision is
            straightforward: build Sweden's — perhaps the world's — most
            comprehensive education in independent stock analysis, and make
            it available to everyone. Phase 1 is always free, always open.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold">The principles</h2>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Educational analysis — not investment advice.</strong>{" "}
              Everything on the platform is teaching. We give no tips on what
              you should buy.
            </li>
            <li>
              <strong className="text-foreground">Deeper than a blog. Clearer than a bank. Faster than a degree.</strong>{" "}
              Institutional methodology, explained for private individuals —
              without hiding the limitations of the theories.
            </li>
            <li>
              <strong className="text-foreground">Keep the know-how — publish generously.</strong>{" "}
              The knowledge of the methodology is shared openly; courses
              built on a complete book cite the book openly (BOKMASTER).
            </li>
            <li>
              <strong className="text-foreground">Reproducibility.</strong>{" "}
              Our analyses follow clear rules and disclosed data sources — so
              that you can redo them yourself.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold">The education path</h2>
          <p className="mt-2 text-muted-foreground">
            The path to independence follows the{" "}
            <Link href="/laroplan" className="font-semibold text-gold underline">
              curriculum
            </Link>{" "}
            in five levels: the foundations (V01–V20), deepening, Bokmaster
            ({num(antalBokmaster)} books chapter by chapter), practice on
            real companies and your own portfolio — to the final goal:
            independent stock analyst. Along the way you earn XP, stars and
            finally{" "}
            <Link href="/certifikat" className="font-semibold text-gold underline">
              certificates
            </Link>
            . Membership is free in Phase 1, forever.
          </p>
        </section>

        <section className="rounded-xl border border-gold/30 bg-card p-5">
          <h2 className="font-serif text-xl font-bold">Contact</h2>
          <p className="mt-2 text-muted-foreground">
            Ak1 Apex Nexus · info@ak1nvestor.com
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link
              href="/en/medlemskap"
              className="rounded-lg bg-gold px-3 py-1.5 font-bold text-primary-foreground"
            >
              Membership
            </Link>
            <Link
              href="/kurser"
              className="rounded-lg border border-gold/40 px-3 py-1.5 font-bold text-gold"
            >
              All courses
            </Link>
            <Link
              href="/bibliotek"
              className="rounded-lg border border-gold/40 px-3 py-1.5 font-bold text-gold"
            >
              The Library
            </Link>
          </div>
        </section>
      </div>
    </SeoPageShell>
  );
}
