"use client";

/**
 * RAPPORTVERKSTAN — /pro/rapporter (VÅG 61 bygg-4, B2B-BESLUT §4d).
 *
 * Rapportbyggare-motorn ÅTERANVÄND (window.print + @media print, P5) med
 * PRO:s tre egna krav ovanpå:
 *   1. MALL-VÄLJARE — Mötespaket | Analys | Portföljöversikt. Djuplänk via
 *      ?mall=motespaket läses KLIENTSIDIGT (window.location.search i
 *      useEffect) så sidan förblir force-static (BESLUT §3: ingen cookie,
 *      ingen dynamisk route — URL:n är läget).
 *   2. WHITE-LABEL-BLOCKET I DOKUMENTET — TenantHeader ("[firmnamn] ×
 *      AK1A-metodik") ur pro-admin-kontraktet (se pro-utskrift.tsx).
 *   3. MAL-LÅST METOD-/RISK-SIDA — MalLastSida (tre lager, K5) i varje
 *      dokument, osuddbar.
 *
 * Analys- och Portföljöversikt-mallarna renderas ur /api/pro/analys-svaret
 * (POST { tickers, vikter } — samma route CsvImport använder): konfluens-
 * rader + vågfundamentets 20×5-värmematris med portföljaggregat. Motorerna
 * körs på knytttryck (demoklientens tickers + vikter) — ALDRIG i render-
 * vägen (P1: dokumentet är en ren funktion av svaret).
 *
 * Rapportkvot-räknaren lever i localStorage (BESLUT §4d) — K7-ärlig copy:
 * utskriftsklassat dokument, PDF-export på väg (server-PDF = fas 3).
 *
 * Pedagogisk forskning — ALDRIG investeringsrådgivning (2007:528).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { KonfluensRad } from "@/lib/konfluens-motor";
import { VARIABEL_META } from "@/lib/akm2/karna";
import { Motespaket } from "@/components/ak1a/pro/motespaket";
import { MalLastSida } from "@/components/ak1a/pro/mal-last-sida";
import { TenantHeader, useTenant } from "@/components/ak1a/pro/tenant-header";
import {
  PRO_PRINT_CSS,
  ProRapportDok,
  ProVerktygsrad,
} from "@/components/ak1a/pro/pro-utskrift";
import { datumText, poangText } from "@/components/ak1a/portfolj-forskning/vag-stil";
import type { Demoklient } from "@/components/ak1a/pro/demoklient-data";

// ── Mallar + API-utsnitt ─────────────────────────────────────────────────────

export type ProMall = "motespaket" | "analys" | "portfoljoversikt";

const MALLAR: Array<{ id: ProMall; namn: string; beskrivning: string }> = [
  {
    id: "motespaket",
    namn: "Mötespaket",
    beskrivning: "Regim + forskningsläge + vågprofil + då-vs-nu + topp-3 nyheter + peer — ett A4 inför klientmötet.",
  },
  {
    id: "analys",
    namn: "Analys",
    beskrivning: "Djupanalys-kort per innehav ur /api/pro/analys: konfluensens fem dimensioner, klass och divergens.",
  },
  {
    id: "portfoljoversikt",
    namn: "Portföljöversikt",
    beskrivning: "Vågfundamentets 20×5-värmematris (V01–V20 × fem horisonter) med portföljens viktade aggregat.",
  },
];

/** Minimala utsnitt ur /api/pro/analys-svaret (städas defensivt). */
type VagfundamentPortfoljUtsnitt = {
  matris: Record<string, Record<string, number | null>>;
  total: Record<string, number | null>;
  radTexter: string[];
  totalText: string;
  tackningProcent: number;
};

type ProAnalysSvar = {
  rader: KonfluensRad[];
  vagfundament: { tickers?: unknown[]; portfolj?: VagfundamentPortfoljUtsnitt };
  sammanfattning: {
    antal: number;
    klassFordelning: Record<string, number>;
    snittKonfluens: number | null;
    viktadKonfluens: number | null;
    divergensPositiv: number;
    divergensNegativ: number;
  };
  genererad?: string;
};

function renSvar(rå: unknown): ProAnalysSvar | null {
  if (!rå || typeof rå !== "object") return null;
  const s = rå as Record<string, unknown>;
  if (!Array.isArray(s.rader)) return null;
  const vf = (s.vagfundament ?? {}) as Record<string, unknown>;
  const p = (vf.portfolj ?? null) as Record<string, unknown> | null;
  const summ = (s.sammanfattning ?? {}) as Record<string, unknown>;
  return {
    rader: s.rader as KonfluensRad[],
    vagfundament: {
      tickers: Array.isArray(vf.tickers) ? vf.tickers : [],
      portfolj:
        p && typeof p === "object" && typeof (p as { matris?: unknown }).matris === "object"
          ? (p as unknown as VagfundamentPortfoljUtsnitt)
          : undefined,
    },
    sammanfattning: {
      antal: typeof summ.antal === "number" ? summ.antal : 0,
      klassFordelning:
        summ.klassFordelning && typeof summ.klassFordelning === "object"
          ? (summ.klassFordelning as Record<string, number>)
          : {},
      snittKonfluens: typeof summ.snittKonfluens === "number" ? summ.snittKonfluens : null,
      viktadKonfluens: typeof summ.viktadKonfluens === "number" ? summ.viktadKonfluens : null,
      divergensPositiv: typeof summ.divergensPositiv === "number" ? summ.divergensPositiv : 0,
      divergensNegativ: typeof summ.divergensNegativ === "number" ? summ.divergensNegativ : 0,
    },
    genererad: typeof s.genererad === "string" ? s.genererad : undefined,
  };
}

// ── Värmematris-cellen (Portföljöversikt-mallen) ─────────────────────────────

const HZ = ["mikro", "kort", "medellang", "lang", "mega"] as const;
const HZ_NAMN: Record<string, string> = {
  mikro: "Mikro",
  kort: "Kort",
  medellang: "Medellång",
  lang: "Lång",
  mega: "Mega",
};

/** Tal → ikon (texten bär informationen — färgblint-vänligt). */
function cellIkon(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "·";
  if (v >= 0.5) return "▲";
  if (v <= -0.5) return "▼";
  return "→";
}

/** Färgton efter tecken — ALDRIG ensam bärare av betydelsen (ikonen bär den). */
function cellStil(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) {
    return "bg-muted/40 text-muted-foreground";
  }
  if (v > 0.05) return "text-bull";
  if (v < -0.05) return "text-bear";
  return "text-neutral-signal";
}

function VarmeCell({ v, titel }: { v: number | null | undefined; titel: string }) {
  const giltigt = v !== null && v !== undefined && Number.isFinite(v);
  const alfa = giltigt ? Math.min(1, Math.abs(v as number)) * 0.45 + 0.08 : 0.06;
  const bakgrund = !giltigt
    ? undefined
    : (v as number) > 0.05
      ? `rgba(37,99,64,${alfa})` // bull-grön
      : (v as number) < -0.05
        ? `rgba(153,27,27,${alfa})` // bear-röd
        : `rgba(100,116,139,${alfa})`; // neutral
  return (
    <span
      title={titel}
      className={`inline-flex h-6 w-7 items-center justify-center rounded border border-border/50 text-[11px] font-bold ${cellStil(v)}`}
      style={bakgrund ? { backgroundColor: bakgrund } : undefined}
    >
      {cellIkon(v)}
    </span>
  );
}

// ── Komponenten ──────────────────────────────────────────────────────────────

export function Rapportverkstan({ demoklient }: { demoklient: Demoklient | null }) {
  const [mall, setMall] = useState<ProMall>("motespaket");
  const [svar, setSvar] = useState<ProAnalysSvar | null>(null);
  const [laddar, setLaddar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  // Djuplänk ?mall=… — KLIENTSIDIG läsning håller sidan force-static
  // (URL:n är läget; ingen cookie — BESLUT §3(1)/FORBUD 4).
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mall");
    if (m === "motespaket" || m === "analys" || m === "portfoljoversikt") setMall(m);
  }, []);

  /** Kör motorerna på demoklientens tickers + vikter (POST /api/pro/analys). */
  async function korMotorer() {
    if (!demoklient) return;
    setLaddar(true);
    setFel(null);
    try {
      const tickers = demoklient.innehav.map((i) => i.ticker);
      const vikter: Record<string, number> = {};
      for (const i of demoklient.innehav) vikter[i.ticker] = i.vikt;
      const r = await fetch("/api/pro/analys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers, vikter }),
      });
      const j = await r.json();
      if (!r.ok || typeof j?.error === "string") {
        setFel(j?.error ?? "Motorerna svarade inte — försök igen om en stund.");
        setSvar(null);
      } else {
        const rent = renSvar(j);
        if (!rent || rent.rader.length === 0) {
          setFel("Motorerna kunde inte köras (datakällorna svarade inte) — försök igen om en stund.");
          setSvar(null);
        } else {
          setSvar(rent);
        }
      }
    } catch {
      setFel("Analysen misslyckades (nätverket) — försök igen.");
    } finally {
      setLaddar(false);
    }
  }

  const dokumentDatum = useMemo(
    () => demoklient?.underlagsdatum ?? svar?.genererad?.slice(0, 10) ?? null,
    [demoklient?.underlagsdatum, svar?.genererad],
  );

  // ── Dokument-vyerna (utskriftbara) ──
  if (demoklient && mall === "motespaket") {
    return (
      <VerkstanSkal mall={mall} setMall={setMall} demoklient={demoklient}>
        <Motespaket demoklient={demoklient} />
      </VerkstanSkal>
    );
  }

  if (demoklient && (mall === "analys" || mall === "portfoljoversikt") && svar) {
    return (
      <VerkstanSkal mall={mall} setMall={setMall} demoklient={demoklient}>
        <Analysdokument
          mall={mall}
          demoklient={demoklient}
          svar={svar}
          dokumentDatum={dokumentDatum}
          onTillbaka={() => {
            setSvar(null);
            setFel(null);
          }}
        />
      </VerkstanSkal>
    );
  }

  // ── Verkstan: mallval + motorstart ──
  return (
    <div className="space-y-6">
      <VerkstanSkal mall={mall} setMall={setMall} demoklient={demoklient}>
        {mall !== "motespaket" && (
          <section className="gravor-ram rounded-xl bg-card p-6">
            <h3 className="font-serif text-xl font-bold">
              {mall === "analys" ? "Analys-mallen" : "Portföljöversikt-mallen"}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {MALLAR.find((m) => m.id === mall)?.beskrivning} Mallarna renderas ur
              /api/pro/analys-svaret: konfluensmotorn och vågfundamentmotorn körs på
              demoklientens {demoklient?.innehav.length ?? 0} innehav med dess vikter —
              instrument och vikter, aldrig personuppgifter (BESLUT P3).
            </p>
            {fel && (
              <p className="mt-3 rounded-sm border border-bear/30 bg-bear/10 p-3 text-sm text-bear">
                {fel}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={korMotorer}
                disabled={laddar || !demoklient}
                className="btn-guld-signatur inline-flex min-h-[44px] items-center gap-2 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {laddar ? "Kör motorerna…" : "Kör motorerna på demoklienten"}
              </button>
              {svar === null && !laddar && !fel && (
                <p className="text-xs text-muted-foreground">
                  Motorerna har inte körts ännu — dokumentet är en ren funktion av svaret.
                </p>
              )}
            </div>
          </section>
        )}
      </VerkstanSkal>
    </div>
  );
}

// ── Skalet: rubrik + mallväljare (allt utom dokumentens egen verktygsrad) ────

function VerkstanSkal({
  mall,
  setMall,
  demoklient,
  children,
}: {
  mall: ProMall;
  setMall: (m: ProMall) => void;
  demoklient: Demoklient | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6" data-rapportverkstan="">
      <section className="gravor-ram rounded-xl bg-card p-6 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-guld-djup">
              Rapportverkstan · print-först
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold">Bygg rapporten — skriv ut eller spara som PDF</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Tre mallar, alla window.print-vägen: utskriftsklassat dokument direkt från
              webbläsaren (PDF-export på väg — server-PDF är fas 3, K7). White-label sätter
              avsändaren i omslagsbandet; metod- och risk-sidan är mal-låst och kan aldrig
              suddas ut — inte ens av Institution.
            </p>
          </div>
          {demoklient && (
            <p className="shrink-0 text-right text-xs text-muted-foreground">
              Underlag: {demoklient.alias}
              <br />
              {demoklient.innehav.length} innehav
              {demoklient.underlagsdatum ? ` · ${datumText(demoklient.underlagsdatum)}` : ""}
            </p>
          )}
        </div>

        {/* Mall-väljaren */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-gold/15 pt-4">
          {MALLAR.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMall(m.id)}
              aria-current={mall === m.id ? "true" : undefined}
              title={m.beskrivning}
              className={`min-h-[44px] rounded-full border px-4 py-2 text-sm transition-colors ${
                mall === m.id
                  ? "border-gold/60 bg-gold/15 font-semibold text-foreground"
                  : "border-gold/25 text-muted-foreground hover:border-gold/50 hover:text-foreground"
              }`}
            >
              {m.namn}
            </button>
          ))}
        </div>
      </section>

      {children}

      <p className="border-t border-gold/20 pt-3 text-center text-[11px] italic text-muted-foreground print:hidden">
        Pedagogisk forskning — inte investeringsrådgivning (2007:528). Rapportkvoten räknas i
        localStorage i MVP:n — äkta kvoter kommer i fas 2 bakom DPA-grinden.
      </p>
    </div>
  );
}

// ── Analys- och Portföljöversikt-dokumenten ─────────────────────────────────

function Analysdokument({
  mall,
  demoklient,
  svar,
  dokumentDatum,
  onTillbaka,
}: {
  mall: "analys" | "portfoljoversikt";
  demoklient: Demoklient;
  svar: ProAnalysSvar;
  dokumentDatum: string | null;
  onTillbaka: () => void;
}) {
  const { tenant } = useTenant();
  const vikter = useMemo(() => {
    const v: Record<string, number> = {};
    for (const i of demoklient.innehav) v[i.ticker] = i.vikt;
    return v;
  }, [demoklient.innehav]);

  const osattText =
    "Värmematrisens celler är viktade medel över innehaven (null-hopp: cell utan underlag lämnas osatt). " +
    `Portföljaggregatets täckning: ${svar.vagfundament.portfolj ? Math.round(svar.vagfundament.portfolj.tackningProcent) : 0} %.`;

  const forskningsText = `Universum-sammanfattning: ${svar.sammanfattning.antal} analyserade, snittkonfluens ${
    svar.sammanfattning.snittKonfluens ?? "—"
  }, viktad ${svar.sammanfattning.viktadKonfluens ?? "—"}, divergens ${svar.sammanfattning.divergensPositiv} positiv / ${svar.sammanfattning.divergensNegativ} negativ.`;

  return (
    <section aria-label={mall === "analys" ? "Analysrapport" : "Portföljöversiktsrapport"}>
      <style dangerouslySetInnerHTML={{ __html: PRO_PRINT_CSS }} />
      <ProVerktygsrad
        onTillbaka={onTillbaka}
        tillbakaText="Tillbaka till motorstart"
        datumForKvot={dokumentDatum ?? "1970-01-01"}
        notis={`${demoklient.alias} · ${svar.rader.length} konfluensrader`}
      />

      <ProRapportDok>
        {/* White-label-avsändarbandet (bygg-2:s tenant-lager) — I dokumentet. */}
        {tenant && <TenantHeader tenant={tenant} />}

        <header className="marin-panel relative overflow-hidden rounded-sm px-6 py-8 text-center print:px-8 sm:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E8C766]">AK1A PRO</p>
          <h2 className="mt-4 font-serif text-2xl font-bold text-[#EDE6D6] sm:text-3xl">
            {mall === "analys" ? "Analys — Djupanalys-kort" : "Portföljöversikt"}
          </h2>
          <div className="hjarlinje mx-auto mt-4 w-44" />
          <p className="mt-4 text-sm text-[#E8C766]">
            {demoklient.alias} — AKM1 · AK1TS · Konfluens ur /api/pro/analys
          </p>
          <p className="mt-1 text-xs text-[#EDE6D6]/70">
            {dokumentDatum ? `Underlag t.o.m. ${datumText(dokumentDatum)}` : "Odaterat underlag"}
          </p>
          <p className="mt-2 text-[10px] italic text-[#EDE6D6]/50">
            White-label ändrar avsändaren — aldrig innehållet. Metod- och risk-sidan är mal-låst.
          </p>
        </header>

        {mall === "analys" ? (
          /* ── DJUPANALYS-KORT per innehav (konfluensradens fem dimensioner) ── */
          <section className="mt-6 space-y-4">
            {svar.rader.map((r, idx) => {
              const vikt = vikter[r.ticker];
              return (
                <article key={r.ticker} className="break-inside-avoid rounded-sm border border-border/70 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-serif text-base font-bold">
                      <span className="font-mono text-[10px] font-bold text-gold">{idx + 1}.</span>{" "}
                      {r.ticker}
                      {r.namn ? <span className="ml-2 text-xs font-normal text-muted-foreground">{r.namn}</span> : null}
                    </h3>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      vikt {vikt !== undefined ? `${Math.round(vikt * 1000) / 10} %` : "—"} · {r.datakallor}/3 källor
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold">{r.klass ?? "Ingen bild"}</p>
                  <table className="mt-2 w-full text-xs">
                    <tbody>
                      {(
                        [
                          ["Värdgolv", r.vardgolv],
                          ["Kvalitet", r.kvalitet],
                          ["Fundamental vågstart", r.fundamentalVagstart],
                          ["Pris-vågläge", r.prisVaglage],
                          ["Konfluens (total)", r.konfluens],
                        ] as Array<[string, number | null]>
                      ).map(([namn, varde]) => (
                        <tr key={namn} className="border-b border-border/40">
                          <th scope="row" className="py-1 pr-4 text-left font-normal text-muted-foreground">
                            {namn}
                          </th>
                          <td className="tabular py-1 text-right font-semibold">
                            {varde === null ? "—" : poangText(varde)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {r.divergens && (
                    <p className="mt-1.5 text-[10px] italic text-muted-foreground">
                      Divergens: {r.divergens} — fundament och prisvåg pekar olika håll.
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        ) : (
          /* ── PORTFÖLJÖVERSIKT: 20×5-värmematrisen med portföljaggregatet ── */
          <section className="mt-6">
            <h3 className="font-serif text-lg font-bold">Vågfundament — portföljens 20×5-matris</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              V01–V20 × fem horisonter, cellvis viktat genomsnitt över innehaven (▲ impulsvåg ·
              → basbygge · ▼ korrigering · · osatt). Intensiteten speglar |värdet|; ikonen och
              tooltipen bär betydelsen.
            </p>
            {svar.vagfundament.portfolj ? (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-[560px] text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th scope="col" className="py-1 pr-3 text-left">Variabel</th>
                      {HZ.map((hz) => (
                        <th key={hz} scope="col" className="px-1 py-1 text-center">
                          {HZ_NAMN[hz]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 20 }, (_, i) => `V${String(i + 1).padStart(2, "0")}`).map((vid) => {
                      const rad = svar.vagfundament.portfolj!.matris[vid] ?? {};
                      const namn = VARIABEL_META[vid]?.namn ?? vid;
                      return (
                        <tr key={vid} className="border-b border-border/30">
                          <th scope="row" className="py-1 pr-3 text-left font-normal">
                            <span className="font-mono text-[10px] font-bold text-muted-foreground">{vid}</span>{" "}
                            <span className="text-muted-foreground">{namn}</span>
                          </th>
                          {HZ.map((hz) => (
                            <td key={hz} className="px-1 py-1 text-center">
                              <VarmeCell
                                v={rad[hz] ?? null}
                                titel={`${vid} ${namn} · ${HZ_NAMN[hz]}: ${(rad[hz] ?? 0).toFixed(2).replace(".", ",")} (viktat medel; ▲ ≥ 0,5 · ▼ ≤ −0,5 · annars basbygge)`}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-xs italic text-muted-foreground">
                Vågfundamentmotorn levererade inget portföljaggregat — matrisen påhittas aldrig.
              </p>
            )}

            {/* Horisont-totaler + sammanfattning */}
            {svar.vagfundament.portfolj && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {HZ.map((hz) => (
                  <span
                    key={hz}
                    className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 font-mono text-[10px] font-bold"
                    title={`Vågfundament-totalen för ${HZ_NAMN[hz]} — helhetstal där ▲ ≥ 0,5 · ▼ ≤ −0,5 · annars basbygge`}
                  >
                    {HZ_NAMN[hz]}:{" "}
                    {svar.vagfundament.portfolj!.total?.[hz] !== null &&
                    svar.vagfundament.portfolj!.total?.[hz] !== undefined
                      ? cellIkon(svar.vagfundament.portfolj!.total[hz]) +
                        " " +
                        (svar.vagfundament.portfolj!.total[hz] as number).toFixed(2).replace(".", ",")
                      : "· osatt"}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 rounded-sm border border-gold/20 bg-paper p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Universum-sammanfattning
              </p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                <li>
                  Analyserade: <span className="font-mono font-bold">{svar.sammanfattning.antal}</span> ·
                  snittkonfluens <span className="font-mono font-bold">{svar.sammanfattning.snittKonfluens ?? "—"}</span> ·
                  viktad <span className="font-mono font-bold">{svar.sammanfattning.viktadKonfluens ?? "—"}</span>
                </li>
                <li>
                  Klassfördelning:{" "}
                  {Object.entries(svar.sammanfattning.klassFordelning)
                    .map(([k, n]) => `${k} ${n}`)
                    .join(" · ") || "—"}
                </li>
                <li>
                  Divergens: {svar.sammanfattning.divergensPositiv} positiv /{" "}
                  {svar.sammanfattning.divergensNegativ} negativ
                </li>
                {svar.vagfundament.portfolj?.totalText && (
                  <li className="italic">{svar.vagfundament.portfolj.totalText}</li>
                )}
              </ul>
              {(svar.vagfundament.portfolj?.radTexter ?? []).slice(0, 4).map((t, i) => (
                <p key={i} className="mt-1 text-[10px] leading-snug text-muted-foreground">
                  · {t}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Mal-låst metod-/risk-sida (K5 — ur bygg-2:s tenant-lager) */}
        <MalLastSida
          tenant={tenant}
          underlagsdatum={dokumentDatum}
          osattText={osattText}
          forskningsText={forskningsText}
        />

        <footer className="mt-6 border-t border-gold/25 pt-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold">
            AK1A PRO · Rapportverkstan · {mall === "analys" ? "analys-mall" : "portföljöversikt-mall"}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            Ur /api/pro/analys (konfluensmotorn + vågfundamentmotorn) på demoklientens tickers
            och vikter. Pedagogisk analys — inte investeringsråd; poäng och klasser är
            metodik-utdata, aldrig köp- eller säljsignaler.
          </p>
        </footer>
      </ProRapportDok>
    </section>
  );
}

/** Tom-läge — ärligt, inget påhittat underlag. */
export function RapportverkstanTom() {
  return (
    <div className="gravor-ram rounded-xl bg-card p-8 text-center">
      <p className="font-serif text-2xl font-bold">Verkstan väntar på underlag</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Mallarna renderas ur korstabellen och /api/pro/analys — utan forskningsunderlag finns
        inget att bygga på, och verkstan gissar aldrig.
      </p>
      <Link href="/pro/klienter" prefetch={false} className="btn-marin mt-6 inline-flex min-h-[44px] items-center px-5 text-sm">
        Till klientvyn
      </Link>
      <p className="mt-6 text-[11px] italic text-muted-foreground">
        Pedagogisk forskning — inte investeringsrådgivning (2007:528).
      </p>
    </div>
  );
}
