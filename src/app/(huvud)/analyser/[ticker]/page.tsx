import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnalyses, getAnalysis } from "@/lib/content";
import { analysisMetadata, analysisJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { BevakaKnapp } from "@/components/ak1a/bevaka-knapp";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAnalyses().map((a) => ({ ticker: encodeURIComponent(a.ticker) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}): Promise<Metadata> {
  const { ticker } = await params;
  const a = getAnalysis(ticker);
  if (!a) return {};
  return analysisMetadata(a);
}

type WaveSummary = {
  impulse?: string[];
  correction?: string[];
  base?: string[];
  overallBias?: string;
};
type Scenarios = {
  title?: string;
  bull?: { probability?: string; target?: string; description?: string };
  base?: { probability?: string; target?: string; description?: string };
  bear?: { probability?: string; target?: string; description?: string };
};
type PriceLevels = { title?: string; levels?: Array<{ label?: string; value?: string }> };
type Akm1 = {
  score?: number;
  maxScore?: number;
  tier?: string;
  recommendation?: string;
  indicators?: Record<string, { name?: string; score?: number; signal?: string; note?: string }>;
};
type Recommendation = {
  title?: string;
  main?: string;
  mainSub?: string;
  period?: string;
  bullets?: string[];
  priceTarget?: { value?: string; currency?: string; span12m?: string; risk?: string };
};

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const a = getAnalysis(ticker);
  if (!a) notFound();

  const akm1 = (a.akm1 ?? {}) as Akm1;
  const scenarios = (a.scenarios ?? {}) as Scenarios;
  const priceLevels = (a.priceLevels ?? {}) as PriceLevels;
  const wave = (a.waveSummary ?? {}) as WaveSummary;
  const rec = (a.recommendation ?? {}) as Recommendation;

  return (
    <SeoPageShell
      wide
      breadcrumb={[{ name: "Analyser", href: "/analyser" }, { name: a.ticker }]}
    >
      <JsonLd data={analysisJsonLd(a)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Analyser", path: "/analyser" },
          { name: a.ticker, path: `/analyser/${encodeURIComponent(a.ticker)}` },
        ])}
      />

      <header className="border-b border-gold/30 pb-6">
        <p className="text-xs uppercase tracking-widest text-gold">
          Institutionell aktieanalys {a.analysisDate || a.verified || ""}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold">
          {a.company} <span className="text-muted-foreground">({a.ticker})</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[a.exchange, a.sector, a.isin && `ISIN ${a.isin}`].filter(Boolean).join(" · ")}
        </p>
        {rec.main && (
          <div className="mt-4 inline-flex flex-col rounded-lg border border-gold/40 bg-card px-5 py-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Rekommendation {rec.period ? `· ${rec.period}` : ""}
            </span>
            <span className="font-serif text-2xl font-bold text-gold">{rec.main}</span>
            {rec.mainSub && <span className="text-xs text-muted-foreground">{rec.mainSub}</span>}
          </div>
        )}
        {/* VÅG 104: bevakningsdörren — "Din bevakning" på Min Sida */}
        <BevakaKnapp ticker={a.ticker} company={a.company} />
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {akm1.score != null && (
          <div className="rounded-lg border border-gold/20 bg-card p-4">
            <h2 className="font-serif font-semibold">AKM1-poäng</h2>
            <p className="mt-2 font-serif text-3xl font-bold text-gold">
              {akm1.score}
              <span className="text-base text-muted-foreground"> / {akm1.maxScore ?? 100}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nivå: {akm1.tier || "—"} {akm1.recommendation ? `· ${akm1.recommendation}` : ""}
            </p>
          </div>
        )}
        {rec.priceTarget?.value && (
          <div className="rounded-lg border border-gold/20 bg-card p-4">
            <h2 className="font-serif font-semibold">Prismål</h2>
            <p className="mt-2 font-serif text-3xl font-bold text-gold">
              {rec.priceTarget.value} {rec.priceTarget.currency || a.currency || "SEK"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              12 mån span: {rec.priceTarget.span12m || "—"} · Risk:{" "}
              {rec.priceTarget.risk || "—"}
            </p>
          </div>
        )}
        {wave.overallBias && (
          <div className="rounded-lg border border-gold/20 bg-card p-4">
            <h2 className="font-serif font-semibold">Våganalys</h2>
            <p className="mt-2 font-serif text-2xl font-bold text-gold">{wave.overallBias}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Impuls: {(wave.impulse || []).length} · Korrigering: {(wave.correction || []).length}{" "}
              · Bas: {(wave.base || []).length} variabler
            </p>
          </div>
        )}
      </section>

      {akm1.indicators && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">AKM1 — 20 variabler</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-gold/20">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-left">
                <tr>
                  <th className="p-3">Variabel</th>
                  <th className="p-3">Poäng</th>
                  <th className="p-3">Signal</th>
                  <th className="p-3">Kommentar</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(akm1.indicators).map(([key, ind]) => (
                  <tr key={key} className="border-t border-gold/10">
                    <td className="p-3 font-medium">
                      {key} — {ind.name}
                    </td>
                    <td className="p-3">{ind.score ?? "—"}</td>
                    <td className="p-3 capitalize">{ind.signal || "—"}</td>
                    <td className="p-3 text-muted-foreground">{ind.note || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {scenarios.bull && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">{scenarios.title || "Scenarier"}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(["bull", "base", "bear"] as const).map((k) => {
              const s = scenarios[k];
              if (!s) return null;
              return (
                <div key={k} className="rounded-lg border border-gold/20 bg-card p-4">
                  <h3 className="font-serif font-semibold uppercase">{k}</h3>
                  <p className="mt-1 text-lg font-bold text-gold">{s.target}</p>
                  <p className="text-xs text-muted-foreground">Sannolikhet {s.probability}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {priceLevels.levels?.length ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">{priceLevels.title || "Prisnivåer"}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {priceLevels.levels.map((l, i) => (
              <li
                key={i}
                className="flex justify-between rounded-lg border border-gold/20 bg-card px-4 py-2 text-sm"
              >
                <span className="text-muted-foreground">{l.label}</span>
                <span className="font-semibold">{l.value}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 rounded-lg border border-gold/40 bg-paper p-6">
        <h2 className="font-serif text-2xl font-bold">Läs hela analysen i labbet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Fullständig 99-sidorsanalys med vågmatris, fusion, intäktmix och nyckelhändelser —
          interaktivt i AK1A Research Lab.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Öppna labbet
          </Link>
          <Link
            href="/analyser"
            className="rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold hover:bg-gold/10"
          >
            Alla analyser
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Källa: {a.source || "AK1A Research Lab"} · Detta är pedagogisk finansanalys, inte
          investeringsråd.
        </p>
      </section>
    </SeoPageShell>
  );
}
