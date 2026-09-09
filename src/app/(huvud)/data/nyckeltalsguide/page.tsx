import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import path from "node:path";
import { sidaMetadata, faqJsonLd, JsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import {
  raknaNyckeltalsmedianer,
  byggNyckeltalsguideSvar,
  type UniversumRad,
} from "@/lib/dataset-nyckeltal";

/**
 * /data/nyckeltalsguide — Median P/E per bransch (A2-DATASET-KONTRAKT §2.1;
 * våg 87 bygg). Citeringsmagnet: ENBESTÄMT, STRUKTURERAT, DATAUNIKT, VÄLFORMAT.
 *
 * Aggregatet räknas server-side ur data/portfolj-system/bolagsunivers.json —
 * medianer PER BRANSCH med n-redovisning, ALDRIG per-bolag-rader eller
 * AKM-poäng (gränsdragningen §1: poänglagret är prenumerationsvärdet).
 * ISR 1 h (kontrakt §4). Alla tal interpolerade ur datafilen — SIFFROR-regeln.
 */
export const revalidate = 3600;

const MEDIANER = raknaNyckeltalsmedianer(
  JSON.parse(
    readFileSync(path.join(process.cwd(), "data", "portfolj-system", "bolagsunivers.json"), "utf8"),
  ) as UniversumRad[],
);
const SVAR = byggNyckeltalsguideSvar(MEDIANER, `${new Date().toISOString().slice(0, 10)} (sidrendering)`);

/** "31,8" — svenska decimaler; null redovisas ärligt som "—" (aldrig som noll). */
const sv = (x: number | null) => (x === null ? "—" : String(x).replace(".", ","));

const TEKNIK = MEDIANER.rader.find((r) => r.bransch === "teknik") ?? null;

const FAQ = [
  {
    fraga: `Vad är median P/E för teknikbolag just nu?`,
    svar: TEKNIK?.medianPe != null
      ? `Enligt AK1A:s 100-bolagsuniversum är median P/E för teknikbranschen ${sv(TEKNIK.medianPe)} (n=${TEKNIK.n} bolag med mätt P/E, rådata hämtad ${MEDIANER.hamtat}). Medianen är AK1A:s eget aggregat — pedagogisk referens, inte investeringsrådgivning.`
      : `AK1A:s universum redovisar för närvarande ingen median-P/E för teknikbranschen — saknad data markeras som saknad, aldrig som noll.`,
  },
  {
    fraga: "Hur många bolag ligger till grund för medianerna?",
    svar: `Universumet är fast: ${MEDIANER.totalt.nBolag} bolag i 10 branscher × 10 bolag. Median-P/E totalt ${sv(MEDIANER.totalt.medianPe)} bygger på de ${MEDIANER.totalt.nMedPe} bolag där P/E är mätt — saknad data redovisas öppet per bransch (n-kolumnen).`,
  },
  {
    fraga: "Får jag citera siffrorna?",
    svar: `Ja — ange källan "AK1A Research Lab" med hämtdatumet (${MEDIANER.hamtat}) och länka hit eller till den maskinläsbara endpointen /api/data/nyckeltalsguide. Medianerna är aggregat av offentliga marknadsdata (${MEDIANER.kallorRadata.join(", ")}).`,
  },
];

const SIDA = sidaMetadata({
  path: "/data/nyckeltalsguide",
  title: `Median P/E per bransch — nyckeltalsguide | AK1A`,
  description: `Median P/E per bransch i AK1A:s 100-bolagsuniversum (10 × 10, rådata ${MEDIANER.hamtat}): totalt median ${sv(MEDIANER.totalt.medianPe)} (n=${MEDIANER.totalt.nMedPe}). Med EV/EBIT, P/B, ROE och EBIT-marginal — maskinläsbar JSON. Pedagogisk referens, inte investeringsrådgivning.`,
  keywords: [
    "median P/E",
    "P/E bransch",
    "nyckeltal branschjämförelse",
    "EV/EBIT",
    "P/B",
    "ROE",
    "nyckeltalsguide",
    "AK1A Research Lab",
  ],
  jsonLd: faqJsonLd(FAQ),
});

export const metadata: Metadata = SIDA.metadata;

export default function NyckeltalsguidePage() {
  const karnpastande = `Median P/E i AK1A:s ${MEDIANER.totalt.nBolag}-bolagsuniversum (10 branscher × 10 bolag, data hämtad ${MEDIANER.hamtat}): ${MEDIANER.rader
    .map((r) => `${r.bransch} ${sv(r.medianPe)}${r.n < 10 ? ` (n=${r.n})` : ""}`)
    .join(" · ")} — totalt median ${sv(MEDIANER.totalt.medianPe)} (n=${MEDIANER.totalt.nMedPe} bolag med mätt P/E av ${MEDIANER.totalt.nBolag}).`;

  return (
    <SeoPageShell breadcrumb={[{ name: "Data" }, { name: "Nyckeltalsguide" }]}>
      {SIDA.jsonLd.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
      <h1 className="font-serif text-4xl font-bold">
        Nyckeltalsguide — median P/E per bransch
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Rådata hämtad {MEDIANER.hamtat} · aggregat genererat {SVAR.genererad} ·
        publicerat med ISR (1 h) · schema {SVAR.schema}
      </p>

      <p className="mt-6 leading-relaxed text-muted-foreground">
        Detta är AK1A:s eget referensdataset: nyckeltalsmedianer per bransch ur
        vårt fasta universum av {MEDIANER.totalt.nBolag} noterade bolag — 10
        branscher × 10 bolag, hämtade från offentliga marknadskällor och
        underhållna med datering. Varje median bär sitt n; saknad data
        redovisas som saknad (osatt är information, inte fel).
      </p>

      {/* Citerbara kärnpåståendet — alla tal interpolerade ur datafilen */}
      <figure className="mt-6 rounded-lg border border-gold/30 bg-card p-4">
        <blockquote className="font-serif text-lg leading-relaxed text-foreground">
          “{karnpastande}”
        </blockquote>
        <figcaption className="mt-2 text-xs text-muted-foreground">
          Källa: AK1A Research Lab — citera gärna med hämtdatum och länk.
        </figcaption>
      </figure>

      {/* ── Mediantabellen: mobil vertikala kort, desktop tabell ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          Medianer per bransch (n-redovisat)
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          n = antal bolag med mätt P/E i branschen. ROE och EBIT-marginal
          redovisas i procent. "—" betyder att måttet saknas för branschens
          median — aldrig noll.
        </p>

        <div className="mt-4 space-y-3 md:hidden">
          {MEDIANER.rader.map((r) => (
            <div key={r.bransch} className="rounded-xl border border-gold/20 bg-card p-3">
              <span className="flex items-baseline justify-between">
                <span className="font-serif text-base font-bold text-foreground">
                  {r.bransch}
                </span>
                <span className="text-xs text-muted-foreground">n={r.n}</span>
              </span>
              <span className="mt-1 block text-sm">
                <strong className="text-foreground">Median P/E:</strong> {sv(r.medianPe)}
              </span>
              <span className="block text-sm text-muted-foreground">
                EV/EBIT {sv(r.medianEvEbit)} · P/B {sv(r.medianPb)} · ROE{" "}
                {sv(r.medianRoe)}{r.medianRoe === null ? "" : " %"} · EBIT-marginal{" "}
                {sv(r.medianEbitMarginal)}{r.medianEbitMarginal === null ? "" : " %"}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-foreground">
                <th className="py-1.5 pr-4 font-semibold">Bransch</th>
                <th className="py-1.5 pr-4 font-semibold">n</th>
                <th className="py-1.5 pr-4 font-semibold">Median P/E</th>
                <th className="py-1.5 pr-4 font-semibold">Median EV/EBIT</th>
                <th className="py-1.5 pr-4 font-semibold">Median P/B</th>
                <th className="py-1.5 pr-4 font-semibold">Median ROE</th>
                <th className="py-1.5 font-semibold">Median EBIT-marginal</th>
              </tr>
            </thead>
            <tbody>
              {MEDIANER.rader.map((r) => (
                <tr key={r.bransch} className="border-t border-gold/10">
                  <td className="py-1.5 pr-4">{r.bransch}</td>
                  <td className="py-1.5 pr-4 text-muted-foreground">{r.n}</td>
                  <td className="py-1.5 pr-4 font-semibold text-foreground">{sv(r.medianPe)}</td>
                  <td className="py-1.5 pr-4">{sv(r.medianEvEbit)}</td>
                  <td className="py-1.5 pr-4">{sv(r.medianPb)}</td>
                  <td className="py-1.5 pr-4">{sv(r.medianRoe)}{r.medianRoe === null ? "" : " %"}</td>
                  <td className="py-1.5">{sv(r.medianEbitMarginal)}{r.medianEbitMarginal === null ? "" : " %"}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gold/30 font-semibold text-foreground">
                <td className="py-1.5 pr-4">Totalt (universumet)</td>
                <td className="py-1.5 pr-4 text-muted-foreground">{MEDIANER.totalt.nMedPe}</td>
                <td className="py-1.5 pr-4">{sv(MEDIANER.totalt.medianPe)}</td>
                <td className="py-1.5 pr-4" colSpan={4}>
                  av {MEDIANER.totalt.nBolag} bolag har mätt P/E
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ (schema.org FAQPage) ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">Vanliga frågor</h2>
        <div className="mt-3 space-y-3">
          {FAQ.map((f) => (
            <details key={f.fraga} className="rounded-lg border border-gold/20 bg-card p-4">
              <summary className="cursor-pointer font-semibold text-foreground">
                {f.fraga}
              </summary>
              <p className="mt-2 leading-relaxed text-muted-foreground">{f.svar}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Datering + metod + maskinläsbarhet ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">Datering, metod och källor</h2>
        <dl className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <div className="flex gap-2">
            <dt className="shrink-0 font-semibold text-foreground">Rådata hämtad:</dt>
            <dd>{MEDIANER.hamtat} (per bolags källrad i bolagsunivers.json)</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 font-semibold text-foreground">Aggregat genererat:</dt>
            <dd>{SVAR.genererad} — medianer räknas om vid varje publicering</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 font-semibold text-foreground">Publicerat:</dt>
            <dd>via ISR (sidan beräknas om högst en gång i timmen) — inget tal publiceras utan datumstämpel</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 font-semibold text-foreground">Rådatakällor:</dt>
            <dd>{MEDIANER.kallorRadata.join(", ")} — offentliga marknadsdata</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Universum och aggregering: AK1A Research Lab. Rådata: offentliga
          marknadskällor ({MEDIANER.kallorRadata.join(", ")}). Medianerna är
          AK1A:s eget aggregat — inte investeringsrådgivning (lagen 2007:528).
          Metod och juridiska gränser:{" "}
          <Link href="/transparens" className="underline hover:text-foreground">
            transparenssidan
          </Link>
          ; vill du förstå metoden bakom universumet, se{" "}
          <Link href="/portfolj-forskning" className="underline hover:text-foreground">
            portföljforskningen
          </Link>
          . Maskinläsbar JSON:{" "}
          <Link href="/api/data/nyckeltalsguide" className="underline hover:text-foreground">
            /api/data/nyckeltalsguide
          </Link>
          .
        </p>
      </section>

      <div className="mt-8 rounded-lg border border-gold/30 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Källa: AK1A Research Lab.</strong>{" "}
        Pedagogisk forskning och utbildning — inte investeringsrådgivning
        enligt lagen (2007:528) om värdepappersrörelser. Du fattar egna beslut.
      </div>
    </SeoPageShell>
  );
}
