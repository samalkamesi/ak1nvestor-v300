import type { Metadata } from "next";
import Link from "next/link";

import { lasKorstabellGrund } from "@/lib/portfolj-forskning/korstabell-data";
import { ProScreening } from "@/components/ak1a/pro/pro-screening";
import { CsvImport } from "@/components/ak1a/pro/csv-import";
import { b2bAktiv } from "@/lib/b2b-status";

export const dynamic = "force-static";

// V86 P1 (audit 5.3-förebyggande) + B2B-residual 2+3: ingen egen robots —
// layoutens b2bAktiv()-grind (noindex i AV-läge) gäller hela /pro-trädet.
// Metadata endast när B2B är PÅ; AV-läge ärar layoutens neutrala titel.
export const metadata: Metadata = b2bAktiv()
  ? {
      title: "Analys — screening av 100 bolag | AK1A PRO",
      description:
        "Screena korstabellens 100 mätta bolag på status, bransch, AKM2, täckning och peer — namngivna screeningar, sortering, CSV-export med svenska decimaler och portfölj-CSV-import (instrument och vikter — aldrig personuppgifter). Pedagogisk analys — inte investeringsråd.",
      keywords: [
        "AK1A PRO",
        "screening",
        "aktiescreener",
        "AKM2",
        "peer-percentil",
        "datatäckning",
        "CSV-export",
        "portfölj CSV-import",
      ],
    }
  : {};

/**
 * /pro/analys — SCREENINGEN (B2B-BESLUT §4b + §7 steg 3, våg 61 bygg-3).
 *
 * Rådgivarens verktygssida: korstabellmönstret (de privata komponenterna i
 * portfolj-forskning/ är orörda — pro-screening.tsx är B2B-varianten som
 * ÅTERANVÄNDER vag-stil-chips) med filter på befintliga fält (status, bransch,
 * AKM2-min, täckning-min, peer-min + sök), sortering AKM1/AKM2/peer/täckning/
 * golv, NAMNGIVNA SCREENINGAR (fyra fördefinierade + egna i localStorage
 * pro-screeningar-v1 — G1: ingen serverpersistens) och CSV-export client-side
 * (svenska decimaler, semikolon, BOM).
 *
 * CsvImport-komponenten är MONTERAD här (BESLUT §4b): instrument + vikter,
 * max 10 tickers, ingen persistens (P3/P8 — dataminimeringen är teknisk spärr).
 *
 * Data LÄSES server-side via lasKorstabellGrund (normaliserad + peer-berikad)
 * och passeras som props — klienten hämtar aldrig 100 rader på egen hand
 * (M3-principen). force-static: underlaget är manuellt levererat och daterat.
 *
 * Giltar (B2B-BESLUT): 0 nya tabeller · 0 nya beroenden · låsrad 2007:528 på
 * vyn · AKM2/AKM3-lib läses av komponenterna men RÖRS ALDRIG. Skalet ägs av
 * ../layout.tsx (bygg-1).
 */
export default function ProAnalysPage() {
  // V86 B2B-residual 4: sidan renderas för RSC-flight-payloaden även när
  // layoutens grind inte renderar {children} — early-return i AV-läge före
  // lasKorstabellGrund() håller cockpit-markupen ur payloaden.
  if (!b2bAktiv()) return null;

  const { finns, rader, skapad } = lasKorstabellGrund();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* ── Sidhuvud ── */}
      <header>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-guld-djup">
          AK1A PRO · Screeningen
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold">Analys</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Rådgivarens screeningbänk: hela universum ({rader.length > 0 ? rader.length : "100"}{" "}
          mätta bolag) på dina villkor — sortera på AKM1, AKM2 eller peer, filtrera på
          status, bransch, täckning och minimivärden, spara dina egna namngivna vyer och
          exportera urvalet som CSV. Eller kör en egen portfölj genom motorerna direkt
          på sidan.
        </p>
        <p className="mt-2 text-xs">
          <Link href="/pro" prefetch={false} className="text-gold hover:underline">
            ← Tillbaka till morgonronden
          </Link>
        </p>
      </header>

      {/* ── Screening-tabellen (korstabell-mönstret, B2B-varianten) ── */}
      <div className="mt-8">
        <ProScreening rader={rader} skapad={skapad} />
      </div>

      {!finns && (
        <p className="mt-3 text-[11px] italic text-muted-foreground">
          Notera: korstabellens underlag har ännu inte levererats — screeningen vilar tills
          mätningarna finns (motorn gissar aldrig).
        </p>
      )}

      {/* ── CSV-importen — BESLUT §4b: monteras på analys-sidan ── */}
      <section className="mt-12" aria-labelledby="pro-analys-import-rubrik">
        <h2 id="pro-analys-import-rubrik" className="font-serif text-2xl font-bold">
          Egen portfölj — kör motorerna direkt
        </h2>
        <p className="mt-2 max-w-3xl text-sm italic leading-relaxed text-muted-foreground">
          Samma import som på översikten: klistra en depå-export (ticker, antal, pris) —
          normalisering, vikter och dubbla motorlöp sker på stället. Instrument och
          vikter, ALDRIG personuppgifter; max 10 tickers per analys; ingen analys sparas.
        </p>
        <div className="mt-5">
          <CsvImport />
        </div>
      </section>

      <p className="mt-10 text-xs italic text-muted-foreground">
        Pedagogisk forskning — inte investeringsrådgivning (2007:528).
      </p>
    </div>
  );
}
