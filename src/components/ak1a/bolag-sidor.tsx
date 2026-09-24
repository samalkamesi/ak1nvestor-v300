import Link from "next/link";
import type { CSSProperties } from "react";

import { branschNamn } from "@/lib/dataset-medianer";
import type { DatasetMedianRad } from "@/lib/dataset-medianer";
import type { BolagSida } from "@/lib/bolags-sidor";
import { lasBolagsSidor } from "@/lib/bolags-sidor";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

/**
 * BOLAGSSIDORNA (VÅG 149 — B1 i SOKORDSINVENTERING-2026): vyerna för /bolag
 * (index över bolagsuniversumet — antalet växer med dataleveranserna, o148:
 * alla tal i vyerna är datadrivna, aldrig hårdkodade) och /bolag/[slug]
 * (nyckeltal + avvikelse mot branschmedian + länkar). Svenska först —
 * speglar följer när texterna mognat (samma ordning som dataset-ytans våg 97→98).
 *
 * JURIDIKGRINDEN: vyerna formulerar ALLT som utbildning — "så står bolaget
 * mot branschens median", aldrig "billigt/dyrt/köp/sälj". Avvikelser visas
 * utan värderingsfärg: ett lågt P/E är inte "bättre", det är en observation
 * att tolka (lagen 2007:528 — rådgivning kräver tillstånd).
 *
 * STOPPREGEL B: rekommendations- och kursmålsfält existerar inte i datat
 * (se bolags-sidor.ts) — ingen vy kan rendera dem.
 */

// ── Formaterare (svenska tal: decimalkomma) ─────────────────────────────────

/** o159: platshållarhöjd (rem) för .cv-bolagsektion — kalibrerad mot
 *  geometri-o159-bolag-mobil-desktop.json (mobil 390): sektionshöjd ≈
 *  68,6·rader − 300 px (median 1 392 px ⇒ 87rem). Residualer ±250 px
 *  från namn-wrapning täcks av 'auto'-ledet i contain-intrinsic-size,
 *  som låser verklig höjd vid första renderingen (o78/o92-disciplinen
 *  "reservation ≈ mätt höjd ⇒ inga stavhopp"). */
function cvReservationRem(rader: number): string {
  const px = Math.max(320, 68.6 * rader - 300);
  return `${Math.round((px / 16) * 4) / 4}rem`; // 0,25rem-rutnät
}


function tal(x: number | null | undefined, dec = 1): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "—";
  return x.toFixed(dec).replace(".", ",");
}

/** Andel 0,3262 → "32,6 %". */
function procent(andel: number | null | undefined, dec = 1): string {
  if (andel === null || andel === undefined || !Number.isFinite(andel)) return "—";
  return (andel * 100).toFixed(dec).replace(".", ",") + " %";
}

/** Procenttal som redan är i procentenheter (medianerna): 32.6 → "32,6 %". */
function procentTal(x: number | null | undefined): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "—";
  return x.toFixed(1).replace(".", ",") + " %";
}

/** Multipel 22.474 → "22,5x". */
function multipl(x: number | null | undefined): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "—";
  return x.toFixed(1).replace(".", ",") + "x";
}

/** Differens i multiplarenheter: −4,4x; null ⇒ "—". */
function diffMultipl(v: number | null, m: number | null): string | null {
  if (v === null || m === null) return null;
  const d = v - m;
  return (d >= 0 ? "+" : "−") + Math.abs(d).toFixed(1).replace(".", ",") + "x";
}

/** Differens i procentenheter (marginaler/tillväxt): +3,1 pp; null ⇒ "—". */
function diffProcent(andel: number | null, medianProcent: number | null): string | null {
  if (andel === null || medianProcent === null) return null;
  const d = andel * 100 - medianProcent;
  return (d >= 0 ? "+" : "−") + Math.abs(d).toFixed(1).replace(".", ",") + " pp";
}

// ── Nyckeltalstabellen (detaljsidan) ────────────────────────────────────────

type NyckeltalsRad = {
  namn: string;
  varde: string;
  median: string | null;
  avvikelse: string | null;
};

function nyckeltalsRader(s: BolagSida, m: DatasetMedianRad | null): NyckeltalsRad[] {
  return [
    {
      namn: "P/E (pris per vinst)",
      varde: multipl(s.pe),
      median: m && m.medianPe !== null ? multipl(m.medianPe) : null,
      avvikelse: m ? diffMultipl(s.pe, m.medianPe) : null,
    },
    {
      namn: "P/B (pris per eget kapital)",
      varde: multipl(s.pb),
      median: m && m.medianPb !== null ? multipl(m.medianPb) : null,
      avvikelse: m ? diffMultipl(s.pb, m.medianPb) : null,
    },
    { namn: "EV/EBIT", varde: multipl(s.evEbit), median: null, avvikelse: null },
    { namn: "PEG (P/E delat med tillväxt)", varde: tal(s.peg), median: null, avvikelse: null },
    {
      namn: "Bruttomarginal",
      varde: procent(s.bruttoMarginal),
      median: null,
      avvikelse: null,
    },
    {
      namn: "EBIT-marginal (rörelsemarginal)",
      varde: procent(s.ebitMarginal),
      median: m && m.medianEbitMarginal !== null ? procentTal(m.medianEbitMarginal) : null,
      avvikelse: m ? diffProcent(s.ebitMarginal, m.medianEbitMarginal) : null,
    },
    {
      namn: "Nettomarginal",
      varde: procent(s.nettoMarginal),
      median: null,
      avvikelse: null,
    },
    {
      namn: "FCF-marginal (fritt kassaflöde/omsättning)",
      varde: procent(s.fcfMarginal),
      median: m && m.medianFcfMarginal !== null ? procentTal(m.medianFcfMarginal) : null,
      avvikelse: m ? diffProcent(s.fcfMarginal, m.medianFcfMarginal) : null,
    },
    {
      namn: "FCF-avkastning (fritt kassaflöde/marknadsvärde)",
      varde: procent(s.fcfYield),
      median: null,
      avvikelse: null,
    },
    { namn: "ROE (avkastning på eget kapital)", varde: procent(s.roe), median: null, avvikelse: null },
    {
      namn: "ROIC (avkastning på investerat kapital)",
      varde: procent(s.roic),
      median: null,
      avvikelse: null,
    },
    {
      namn: "Omsättningstillväxt TTM (senaste 12 månader)",
      varde: procent(s.omsattningTillvaxtTTM),
      median: m && m.medianTillvaxt !== null ? procentTal(m.medianTillvaxt) : null,
      avvikelse: m ? diffProcent(s.omsattningTillvaxtTTM, m.medianTillvaxt) : null,
    },
    {
      namn: "Omsättningstillväxt, 5-årssnitt (CAGR)",
      varde: procent(s.omsattningCAGR5ar),
      median: null,
      avvikelse: null,
    },
    {
      namn: "Resultattillväxt, 5-årssnitt (CAGR)",
      varde: procent(s.resultatCAGR5ar),
      median: null,
      avvikelse: null,
    },
    {
      namn: "Prognostiserad tillväxt (konsensus +1 år)",
      varde: procent(s.prognosTillvaxt),
      median: null,
      avvikelse: null,
    },
    {
      namn: "Skuld/eget kapital",
      varde: multipl(s.skuldEgenkapital),
      median: null,
      avvikelse: null,
    },
  ];
}

// ── Metod + disclaimer (identisk sektion på index och detaljer) ─────────────

export function BolagMetodDisclaimer() {
  return (
    <>
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Så läser du tabellen</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Nyckeltalen kommer från bolagsuniversumets publika datainsamling och
          visar hur ett bolag ser ut i absoluta tal. Kolumnen &quot;branschmedian&quot;
          är mittpunkten för bolagets bransch i samma universum (10 bolag per
          bransch) och avvikelsen är skillnaden mot den medianen — i multiplar
          (x) för värderingsnyckeltal och procentenheter (pp) för marginaler
          och tillväxt. En avvikelse är en observation att tolka, inte ett
          omdöme: hög eller låg nivå kan ha många förklaringar som tabellen
          inte räknar fram. Saknat mått redovisas som &quot;—&quot; — aldrig som noll.
        </p>
      </section>
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">Detta är utbildning — inte råd</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          AK1A Research Lab är en finansiell utbildningsplattform. Innehållet
          på denna sida är pedagogisk genomgång av hur nyckeltal läses och
          jämförs enligt AKM-metodiken — det är inte investeringsråd och
          ingen uppmaning att köpa eller sälja något värdepapper (lagen
          2007:528 om värdepappersrörelser). Beslut om placeringshandlingar
          fattar du alltid själv.
        </p>
      </section>
    </>
  );
}

// ── Index-vyn: /bolag ───────────────────────────────────────────────────────

export function BolagIndexVy({
  sidor,
  hamtat,
}: {
  sidor: BolagSida[];
  hamtat: string | null;
}) {
  const branscher = [...new Set(sidor.map((s) => s.bransch))].sort((a, b) =>
    a.localeCompare(b, "sv"),
  );
  return (
    <SeoPageShell
      breadcrumb={[{ name: "Bolag", href: "/bolag" }]}
    >
      <header className="border-b border-gold/30 pb-6">
        <p className="text-xs uppercase tracking-widest text-gold">
          Nyckeltalsregister{hamtat ? ` · data hämtad ${hamtat}` : ""}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold">
          Alla {sidor.length} bolag i universumet
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          Ett nyckeltalsregister över de {sidor.length} bolag som ingår i
          AK1A:s forskningsuniversum — tio branscher med tio bolag
          vardera, från Stockholm till New York. Varje bolagssida visar bolagets
          nyckeltal sida vid sida med branschens median, med källor och
          hämtdatum. Utbildningsgenomgångar — inte investeringsråd.
        </p>
      </header>

      {branscher.map((b) => {
        const bolag = sidor.filter((s) => s.bransch === b);
        return (
          <section
            key={b}
            className="mt-10 cv-bolagsektion"
            style={{ "--cv-h": cvReservationRem(bolag.length) } as CSSProperties}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-2xl font-bold">
                {branschNamn("sv", b)}
              </h2>
              <Link
                href={`/dataset/${b}`}
                className="text-sm font-medium text-gold underline underline-offset-2"
              >
                Branschens medianer →
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">Bolag</th>
                    <th className="py-2 pr-4">Ticker</th>
                    <th className="py-2 pr-4">Land</th>
                    <th className="py-2 pr-4">P/E</th>
                    <th className="py-2 pr-4">EBIT-marginal</th>
                  </tr>
                </thead>
                <tbody>
                  {bolag.map((s) => (
                    <tr key={s.slug} className="border-b border-border/50">
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/bolag/${s.slug}`}
                          className="font-medium text-gold underline-offset-2 hover:underline"
                        >
                          {s.namn}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs">{s.ticker}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{s.land}</td>
                      <td className="py-2.5 pr-4">{multipl(s.pe)}</td>
                      <td className="py-2.5 pr-4">{procent(s.ebitMarginal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <BolagMetodDisclaimer />
    </SeoPageShell>
  );
}

// ── Detalj-vyn: /bolag/[slug] ───────────────────────────────────────────────

export function BolagDetaljVy({
  sida,
  medianRad,
  syskon,
  harDjupanalys,
  harForskningsanalys,
}: {
  sida: BolagSida;
  medianRad: DatasetMedianRad | null;
  syskon: BolagSida[];
  harDjupanalys: boolean;
  harForskningsanalys: boolean;
}) {
  const rader = nyckeltalsRader(sida, medianRad);
  const tickerKod = sida.ticker.split(".")[0];
  return (
    <SeoPageShell
      breadcrumb={[
        { name: "Bolag", href: "/bolag" },
        { name: sida.namn, href: `/bolag/${sida.slug}` },
      ]}
    >
      <header className="border-b border-gold/30 pb-6">
        <p className="text-xs uppercase tracking-widest text-gold">
          Nyckeltal{sida.hamtat ? ` · data hämtad ${sida.hamtat}` : ""}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold">
          {sida.namn} <span className="text-muted-foreground">({tickerKod})</span>{" "}
          — nyckeltal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[sida.ticker, branschNamn("sv", sida.bransch), sida.land, sida.valuta]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {sida.kallor.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Källor: {sida.kallor.join(", ")}
          </p>
        )}
      </header>

      <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">
        Så står {sida.namn} mot branschens median i AK1A:s
        {" "}
        {medianRad ? `${medianRad.antalBolag}-bolagsuniversum` : `${lasBolagsSidor().length}-bolagsuniversum`}
        : varje mätt nyckeltal nedan, med skillnaden mot mittpunkten av
        branschens bolag. Tabellen är ett utbildningsunderlag i att läsa
        nyckeltal — ingen rekommendation.
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          Nyckeltal mot branschmedian
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Nyckeltal</th>
                <th className="py-2 pr-4">{sida.namn}</th>
                <th className="py-2 pr-4">Branschmedian</th>
                <th className="py-2 pr-4">Avvikelse</th>
              </tr>
            </thead>
            <tbody>
              {rader.map((r) => (
                <tr key={r.namn} className="border-b border-border/50">
                  <td className="py-2.5 pr-4">{r.namn}</td>
                  <td className="py-2.5 pr-4 font-medium">{r.varde}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">
                    {r.median ?? "—"}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">
                    {r.avvikelse ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {sida.pris !== null && `Kurs ${tal(sida.pris, 2)} ${sida.valuta} · `}
          {sida.marknadsKapitalMdr !== null &&
            `marknadsvärde ${tal(sida.marknadsKapitalMdr, 1)} mdr ${sida.valuta} · `}
          branschmedianer visas för de fem publika nyckeltalen (P/E, P/B,
          EBIT-marginal, FCF-marginal, omsättningstillväxt); övriga rader är
          bolagets mått utan medianjämförelse.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Från nyckeltal till analys — AKM-metodiken</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          Nyckeltalen på denna sida är råmaterialet. I AK1A:s analysmetodik
          vägs de samman strukturerat: AKM1:s tjugo variabler beskriver
          underlaget per dimension, och AKM2 omviktas enligt viktprofilen
          akm2-2026. Modellen gissar aldrig — variabler utan underlag ger 0
          poäng och deras vikt omfördelas till de mätta. Hur metodiken väger
          samman just denna typ av nyckeltal genomgås i portföljforskningen
          och kurserna; bolagens egna modelldjup lever där, inte här.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/portfolj-forskning"
            className="font-medium text-gold underline underline-offset-2 hover:underline"
          >
            Portföljforskningen — metodiken bakom universumet
          </Link>
          {" · "}
          <Link
            href="/kurser"
            className="font-medium text-gold underline underline-offset-2 hover:underline"
          >
            Kurser i fundamental analys
          </Link>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Läs vidare</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li className="rounded-lg border border-border bg-card p-4">
            <Link
              href={`/dataset/${sida.bransch}`}
              className="font-medium text-gold underline-offset-2 hover:underline"
            >
              {branschNamn("sv", sida.bransch)} — branschens medianer och kvartiler
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              Hela branschens fem publika nyckeltal med spridning.
            </p>
          </li>
          {harDjupanalys && (
            <li className="rounded-lg border border-border bg-card p-4">
              <Link
                href={`/analyser/${encodeURIComponent(sida.ticker)}`}
                className="font-medium text-gold underline-offset-2 hover:underline"
              >
                Djupanalys {sida.ticker}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                AK1A:s fullständiga analys av bolaget med alla dimensioner.
              </p>
            </li>
          )}
          {harForskningsanalys && (
            <li className="rounded-lg border border-border bg-card p-4">
              <Link
                href={`/forskningsbiblioteket/${encodeURIComponent(sida.ticker)}`}
                className="font-medium text-gold underline-offset-2 hover:underline"
              >
                Forskningsöversikt {sida.ticker}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                Analysfabrikens automatiserade AKM1/AKM2-översikt.
              </p>
            </li>
          )}
          <li className="rounded-lg border border-border bg-card p-4">
            <Link
              href="/kurser"
              className="font-medium text-gold underline-offset-2 hover:underline"
            >
              Kurser i fundamental analys
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              Lär dig räkna och tolka nyckeltalen själv — steg för steg.
            </p>
          </li>
        </ul>
      </section>

      {syskon.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">
            Fler bolag i {branschNamn("sv", sida.bransch).toLowerCase()}
          </h2>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {syskon.map((s) => (
              <Link
                key={s.slug}
                href={`/bolag/${s.slug}`}
                className="text-sm text-gold underline-offset-2 hover:underline"
              >
                {s.namn}
              </Link>
            ))}
          </p>
        </section>
      )}

      <BolagMetodDisclaimer />
    </SeoPageShell>
  );
}
