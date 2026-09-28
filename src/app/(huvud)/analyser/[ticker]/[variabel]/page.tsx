import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnalyses, getCourses } from "@/lib/content";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { StrukturData } from "@/components/seo/StrukturData";

export const dynamic = "force-static";

/** Okända parametrar → RIKTIG 404 (annars soft-404 med HTTP 200 i produktion). */
export const dynamicParams = false;

/** Variabel-slug → tal-format för sökord (t.ex. "v09-roe" → "ROE"). */
function variabelNamn(slug: string, courses: Record<string, { title: string }>) {
  return courses[slug]?.title || slug.toUpperCase();
}

export function generateStaticParams() {
  const analyser = getAnalyses();
  const kurser = getCourses();
  const vslugs = Object.keys(kurser).filter((s) => /^v\d{2}-/.test(s));
  const ut: Array<{ ticker: string; variabel: string }> = [];
  for (const a of analyser) {
    for (const v of vslugs) {
      ut.push({ ticker: a.ticker.toLowerCase().replace(/\.st$/, "-st"), variabel: v });
    }
  }
  return ut;
}

function hittaAnalyser(tickerParam: string) {
  const norm = decodeURIComponent(tickerParam).toUpperCase();
  return getAnalyses().find(
    (a) =>
      a.ticker.toUpperCase() === norm ||
      a.ticker.toUpperCase().replace(".ST", "-ST") === norm
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string; variabel: string }>;
}): Promise<Metadata> {
  const { ticker, variabel } = await params;
  const a = hittaAnalyser(ticker);
  const courses = getCourses();
  const namn = variabelNamn(variabel, courses);
  if (!a) return {};
  const vnum = variabel.slice(0, 3).toUpperCase();
  return pageMetadata({
    path: `/analyser/${ticker}/${variabel}`,
    title: `${a.company} — ${namn} (${vnum}) analys | AK1A`,
    description: `Så står ${a.company} (${a.ticker}) i variabeln ${namn} (${vnum}): poäng, signal och analytikerns kommentar från den institutionella AKM1-analysen.`,
    keywords: [
      `${a.company} ${namn}`,
      `${a.ticker} ${namn}`,
      `${a.company} fundamental analys`,
      `${namn} analys`,
      "AKM1",
    ],
  });
}

type Indicator = { name?: string; score?: number; signal?: string; note?: string };

export default async function VariabelSida({
  params,
}: {
  params: Promise<{ ticker: string; variabel: string }>;
}) {
  const { ticker, variabel } = await params;
  const a = hittaAnalyser(ticker);
  if (!a) notFound();

  const courses = getCourses();
  const kurs = courses[variabel];
  if (!kurs) notFound();

  const vnum = variabel.slice(0, 3).toUpperCase();
  const indicators = ((a.akm1 as { indicators?: Record<string, Indicator> })?.indicators ?? {});
  const ind = indicators[vnum];
  const namn = kurs.title;
  const akm1 = a.akm1 as { score?: number; tier?: string; recommendation?: string } | undefined;
  const total = akm1?.score;

  return (
    <SeoPageShell
      breadcrumb={[
        { name: "Analyser", href: "/analyser" },
        { name: a.ticker, href: `/analyser/${encodeURIComponent(a.ticker)}` },
        { name: `${vnum} ${namn}` },
      ]}
    >
      {/* VÅG 122F: StrukturData — variabelsidan bär ETT BreadcrumbList-block
          (ingen Article här: huvudartikeln på /analyser/[ticker] äger den). */}
      <StrukturData
        data={breadcrumbJsonLd([
          { name: "Analyser", path: "/analyser" },
          { name: a.ticker, path: `/analyser/${encodeURIComponent(a.ticker)}` },
          { name: `${vnum} ${namn}`, path: `/analyser/${ticker}/${variabel}` },
        ])}
        id="jsonld-brodsmula"
      />

      <header className="border-b border-gold/30 pb-6">
        <p className="text-xs uppercase tracking-widest text-gold">
          AKM1-variabel {vnum} · {a.company} ({a.ticker})
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold">
          {a.company} — {namn}-analys
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{a.sector || a.exchange}</p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gold/20 bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Poäng i {vnum}</p>
          <p className="font-serif text-3xl font-bold text-gold">
            {ind?.score ?? "—"}
            <span className="text-base text-muted-foreground"> / 5</span>
          </p>
          {ind?.signal && (
            <p className="mt-1 text-xs capitalize text-muted-foreground">
              Signal: {ind.signal}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-gold/20 bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Total AKM1</p>
          <p className="font-serif text-3xl font-bold text-gold">
            {total ?? "—"}
            <span className="text-base text-muted-foreground"> / 100</span>
          </p>
          {akm1?.tier && <p className="mt-1 text-xs text-muted-foreground">Nivå: {akm1.tier}</p>}
        </div>
        <div className="rounded-lg border border-gold/20 bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Variabelns vikt</p>
          <p className="font-serif text-xl font-bold">{kurs.weight || "6%"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{kurs.category}</p>
        </div>
      </section>

      {ind?.note && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold">Analytikerns kommentar</h2>
          <p className="mt-3 leading-relaxed text-foreground/90">{ind.note}</p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">Vad är {vnum} — {namn}?</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{kurs.learn}</p>
        <p className="mt-3 leading-relaxed text-muted-foreground">{kurs.why}</p>
      </section>

      <section className="mt-10 rounded-lg border border-gold/40 bg-paper p-6">
        <h2 className="font-serif text-xl font-bold">Fördjupa dig</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            →{" "}
            <Link href={`/analyser/${encodeURIComponent(a.ticker)}`} className="underline hover:text-gold">
              Komplett analys av {a.company} (99 sidor)
            </Link>
          </li>
          <li>
            →{" "}
            <Link href={`/kurser/${variabel}`} className="underline hover:text-gold">
              Kursen {vnum}: {namn} — {kurs.chapters.length} kapitel
            </Link>
          </li>
          <li>
            →{" "}
            <Link href="/kalkylator" prefetch={false} className="underline hover:text-gold">
              Testa {vnum} själv i AKM1-kalkylatorn
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Pedagogisk finansanalys — inte investeringsråd. Källa: AK1A Research Lab.
        </p>
      </section>
    </SeoPageShell>
  );
}
