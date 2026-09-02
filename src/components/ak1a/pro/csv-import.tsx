"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { KonfluensRad } from "@/lib/konfluens-motor";

// ═══════════════════════════════════════════════════════════
// AK1A PRO — PORTFÖLJ-CSV-IMPORT (Fas D-MVP, forskning-b2b 3.2)
//
// Koyfins import-mönster, svensk variant: klistra en CSV (ELLER
// välj fil — FileReader) med rader "ticker,antal,pris" → normal-
// isering → tabellförhandsvisning med vikter → "Analysera" →
// POST /api/pro/analys (route, aldrig server action) → konfluens-
// tabell per ticker + universum-sammanfattning.
//
// Designregeln från forskning-b2b 4.2 är hård: CSV:n innehåller
// INSTRUMENT OCH VIKTER — aldrig personuppgifter. Slutklientens
// ekonomi frågar vi aldrig efter.
//
// P8: UI:t visar koncept, poängband och klass-namn — exakta
// vikter och trösklar stannar i motorerna på servern.
// ═══════════════════════════════════════════════════════════

/** Max tickers per analys (konfluensmotorns rutschkana). */
const MAX_TICKERS = 10;

/** Ticker-format som motorerna accepterar (samma regex som API:t). */
const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/** Exempelportfölj — svensk Large Cap, tre kolumner, semikolon + decimal Komma. */
const EXEMPEL_CSV = `ticker;antal;pris
VOLV-B.ST;120;185,50
SAAB-B.ST;300;221,30
ATCO-A.ST;150;69,80
SAND.ST;85;235,00
SHB-B.ST;400;124,25
ESSITY-B.ST;250;152,40`;

// ── Typer (strukturella — speglar API-svaret utan serverimporter) ──────────

type VagfundamentTicker = {
  ticker: string;
  fel?: string;
  dataPer?: string | null;
  total?: Record<string, number | null>;
  sammanfattning?: { impulsvag: number; korrigering: number; basbygge: number; osatt: number };
};

type VagfundamentPortfolj = {
  total: Record<string, number | null>;
  totalText: string;
  tackningProcent: number;
  radTexter: string[];
};

type AnalysSvar = {
  genererad?: string;
  analysensOmfattning?: { begarda?: number; analyserade?: number; maxTickers?: number };
  rader?: KonfluensRad[];
  vagfundament?: { tickers?: VagfundamentTicker[]; portfolj?: VagfundamentPortfolj };
  sammanfattning?: {
    antal?: number;
    antalKonfluens?: number;
    klassFordelning?: Record<string, number>;
    snittKonfluens?: number | null;
    viktadKonfluens?: number | null;
    divergensPositiv?: number;
    divergensNegativ?: number;
  };
  disclaimer?: string;
  error?: string;
};

/** En parse:ad portföljrad — dubbletter slogs ihop, vikter förberäknade. */
type PortfoljRad = {
  ticker: string;
  antal: number;
  pris: number | null;
  varde: number | null;
  viktProcent: number;
};

/** Parse:ad CSV — antingen rader eller ett läsbart fel. */
type ParseResultat = { rader: PortfoljRad[]; fel: string | null; varnader: string[] };

// ── CSV-parsning (deterministisk, förlåtande men ärlig) ────────────────────

/** Ta bort citattecken och blanksteg runt ett fält. */
function rensaFalt(f: string): string {
  return f.trim().replace(/^"(.*)"$/, "$1").trim();
}

/** Svensk talläsning: "1 234,50" → 1234.5; ogiltigt → null. */
function lasTal(s: string | undefined): number | null {
  if (s === undefined) return null;
  const stadad = rensaFalt(s)
    .replace(/[\s\u00a0\u202f]/g, "") // tusentalsblanksteg
    .replace(",", "."); // svensk decimalKomma
  if (stadad === "" || !/^-?\d*\.?\d+$/.test(stadad)) return null;
  const n = Number(stadad);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parsa portfölj-CSV: rader om "ticker,antal,pris" ( även ";" och tab;
 * valfri rubrikrad; antal/pris valfria — värde/vikt räknas på det som finns).
 * Dubbletter slås ihop; överblivna tickers efter 10 markeras som varning.
 */
function parsaCsv(text: string): ParseResultat {
  const varnader: string[] = [];
  const raderText = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (raderText.length === 0) return { rader: [], fel: "CSV:n är tom — klistra in eller välj en fil.", varnader };

  // Detektera avgränsare: första icke-tomma radens vanligaste av , ; \t
  const provRad = raderText[0];
  const kandidater = [",", ";", "\t"] as const;
  let avgränsare: string = ",";
  let maxFalt = 0;
  for (const k of kandidater) {
    const n = provRad.split(k).length;
    if (n > maxFalt) {
      maxFalt = n;
      avgränsare = k;
    }
  }

  // Hoppa över rubrikrad om första fältet ser ut att vara "ticker"
  const start = /^ticker\b/i.test(rensaFalt(provRad.split(avgränsare)[0] ?? "")) ? 1 : 0;

  const samman = new Map<string, { antal: number; pris: number | null; felPris: boolean }>();
  let antalFelaktiga = 0;

  for (let i = start; i < raderText.length; i++) {
    const falt = raderText[i].split(avgränsare).map(rensaFalt);
    if (falt.length === 0 || falt[0] === "") continue;
    const ticker = falt[0].toUpperCase();
    if (!TICKER_RE.test(ticker)) {
      antalFelaktiga += 1;
      continue;
    }
    const antal = lasTal(falt[1]) ?? 1;
    let pris = lasTal(falt[2]);
    const felPris = falt.length >= 3 && pris === null;
    if (pris !== null && pris < 0) pris = null;
    const befintlig = samman.get(ticker);
    if (befintlig) {
      samman.set(ticker, {
        antal: befintlig.antal + antal,
        pris: pris ?? befintlig.pris, // senaste pris vinner vid dubbletter
        felPris: befintlig.felPris || felPris,
      });
    } else {
      samman.set(ticker, { antal, pris, felPris });
    }
  }

  if (samman.size === 0) {
    return {
      rader: [],
      fel: "Inga giltiga rader hittades — förväntat format per rad: ticker,antal,pris (t.ex. VOLV-B.ST;120;185,50).",
      varnader,
    };
  }
  if (antalFelaktiga > 0) {
    varnader.push(`${antalFelaktiga} rad(er) hoppades över — tickern kunde inte läsas.`);
  }

  // Max 10 unika tickers — de första i filordning vinner
  const urval = [...samman.entries()].slice(0, MAX_TICKERS);
  if (samman.size > MAX_TICKERS) {
    varnader.push(`${samman.size - MAX_TICKERS} ticker(s) efter de ${MAX_TICKERS} första ignorerades — analysen tar max ${MAX_TICKERS} per anrop.`);
  }
  if ([...samman.values()].some((v) => v.felPris)) {
    varnader.push("Minst ett pris kunde inte läsas — viktningen faller tillbaka på antal.");
  }

  // Värde = antal × pris om pris finns; annars viktar antalet
  const harPris = urval.some(([, v]) => v.pris !== null);
  const totVikt = urval.reduce(
    (s, [, v]) => s + (harPris ? (v.pris !== null ? v.antal * v.pris : v.antal) : v.antal),
    0,
  );
  const rader: PortfoljRad[] = urval.map(([ticker, v]) => {
    const varde = harPris && v.pris !== null ? v.antal * v.pris : null;
    const ravarde = harPris ? (v.pris !== null ? v.antal * v.pris : v.antal) : v.antal;
    return {
      ticker,
      antal: v.antal,
      pris: v.pris,
      varde,
      viktProcent: totVikt > 0 ? (100 * ravarde) / totVikt : 0,
    };
  });

  return { rader, fel: null, varnader };
}

// ── Visuella hjälpdelar (AK1A-DNA: marin, guld, tabular, serif) ─────────────

/** Klass-namnen som union — samma strängar som motorn klassar med. */
type Klass = NonNullable<KonfluensRad["klass"]>;

const KLASS_STIL: Record<Klass, { etikett: string; bg: string; text: string }> = {
  "Konfluens — värde möter vändande vågor": {
    etikett: "KONFLUENS",
    bg: "linear-gradient(160deg, #0E1B2E, #081120)",
    text: "#E8C766",
  },
  "Värde men vågor sover": { etikett: "VÅGOR SOVER", bg: "rgba(168,134,42,0.14)", text: "#a8862a" },
  "Vågor utan värdegolv": { etikett: "VÅGOR UTAN VÄRDE", bg: "rgba(4,120,87,0.12)", text: "#047857" },
  "Ingen bild": { etikett: "INGEN BILD", bg: "rgba(90,80,69,0.12)", text: "#5a5045" },
};

/** Säkrad tal-läsning — motorn lämnar null när en källa teg. */
function somTal(x: number | null | undefined): number | null {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

/** Svenskt talformat utan onödiga decimaler. */
function svTal(x: number, decimaler = 0): string {
  return x.toLocaleString("sv-SE", { maximumFractionDigits: decimaler });
}

/** Divergens-symbol: ▲ positiv (priset släpar efter fundamentet), ▼ negativ. */
function Divergens({ d }: { d: KonfluensRad["divergens"] }) {
  if (d === "positiv") return <span className="font-bold text-bull" title="Positiv divergens">▲</span>;
  if (d === "negativ") return <span className="font-bold text-bear" title="Negativ divergens">▼</span>;
  return <span className="text-muted-foreground">—</span>;
}

/** En stapel — 0–100 med guld-fyllnad och tabular siffra. */
function Stapel({ etikett, varde, vagolikvid = false }: { etikett: string; varde: number | null; vagolikvid?: boolean }) {
  const pct = varde !== null ? Math.max(0, Math.min(100, varde)) : 0;
  return (
    <div className={vagolikvid ? "w-full" : "w-[104px]"}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{etikett}</span>
        <span className="tabular font-mono text-xs font-bold">
          {varde !== null ? Math.round(varde) : "—"}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gold/15">
        <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Konfluens-poäng som chip med färgband (grå → guld → marin med guldtext). */
function PoangChip({ konfluens, stor }: { konfluens: number | null; stor: boolean }) {
  if (konfluens === null) {
    return <span className="font-mono text-xl font-bold text-muted-foreground">—</span>;
  }
  const band =
    konfluens >= 70
      ? { bg: "linear-gradient(160deg, #0E1B2E, #081120)", text: "#E8C766", marin: true }
      : konfluens >= 40
        ? { bg: "rgba(168,134,42,0.16)", text: "#a8862a", marin: false }
        : { bg: "rgba(90,80,69,0.12)", text: "#5a5045", marin: false };
  return (
    <span className="flex flex-col items-end">
      <span
        className={`tabular inline-block rounded-lg px-3 py-1 font-mono font-bold leading-none ${stor ? "text-3xl" : "text-2xl"}`}
        style={{ background: band.bg, color: band.text }}
      >
        {Math.round(konfluens)}
      </span>
      {band.marin && (
        <span className="mt-1 rounded border border-gold/40 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-gold">
          KONFLUENS
        </span>
      )}
    </span>
  );
}

/** Vågfundament-total per horisont som färgad mini-rad (−1 … +1). */
function VagfundamentMini({ total }: { total?: Record<string, number | null> }) {
  const hz = ["mikro", "kort", "medellang", "lang", "mega"] as const;
  const namn: Record<string, string> = { mikro: "mikro", kort: "kort", medellang: "medellång", lang: "lång", mega: "mega" };
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {hz.map((h) => {
        const v = somTal(total?.[h] ?? null);
        const farg = v === null ? "text-muted-foreground" : v > 0.15 ? "text-bull" : v < -0.15 ? "text-bear" : "text-muted-foreground";
        return (
          <span key={h} className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {namn[h]}{" "}
            <span className={`tabular font-mono font-bold ${farg}`}>{v === null ? "—" : v.toFixed(2)}</span>
          </span>
        );
      })}
    </div>
  );
}

// ── Huvudkomponenten ────────────────────────────────────────────────────────

export function CsvImport() {
  const [csvText, setCsvText] = useState("");
  const [filNamn, setFilNamn] = useState<string | null>(null);
  const [parse, setParse] = useState<ParseResultat | null>(null);
  const [kör, setKör] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [svar, setSvar] = useState<AnalysSvar | null>(null);
  const igångRef = useRef(false);
  const filRef = useRef<HTMLInputElement>(null);

  // ── Klistra/skriv i textarean → nollställ ev. gammal förhandsvisning ──
  const onTextChange = useCallback((text: string) => {
    setCsvText(text);
    setFilNamn(null);
    setSvar(null);
    setFel(null);
    setParse(text.trim() === "" ? null : parsaCsv(text));
  }, []);

  // ── Fil-input → FileReader → samma väg som klistrad text ──
  const onFil = useCallback(
    (fil: File | null) => {
      if (!fil) return;
      const lasare = new FileReader();
      lasare.onload = () => {
        const text = typeof lasare.result === "string" ? lasare.result : "";
        setFilNamn(fil.name);
        setCsvText(text);
        setSvar(null);
        setFel(null);
        setParse(parsaCsv(text));
      };
      lasare.onerror = () => {
        setFel(`Filen "${fil.name}" kunde inte läsas — försök igen eller klistra in innehållet.`);
      };
      lasare.readAsText(fil, "utf-8");
    },
    [],
  );

  // ── Exempel-portföljen ──
  const laddaExempel = useCallback(() => {
    if (filRef.current) filRef.current.value = ""; // rensa ev. vald fil
    onTextChange(EXEMPEL_CSV);
  }, [onTextChange]);

  // ── Analysera → POST /api/pro/analys ──
  const analysera = useCallback(async () => {
    if (igångRef.current) return;
    const resultat = parse ?? (csvText.trim() === "" ? null : parsaCsv(csvText));
    if (!resultat || resultat.fel || resultat.rader.length === 0) {
      setFel(resultat?.fel ?? "Inget att analysera — importera en portfölj först.");
      return;
    }
    igångRef.current = true;
    setKör(true);
    setFel(null);
    setSvar(null);
    try {
      const tickers = resultat.rader.map((r) => r.ticker);
      const vikter: Record<string, number> = {};
      for (const r of resultat.rader) {
        const v =
          r.varde !== null ? r.varde : r.antal; // pris-baserad vikt om pris finns, annars antal
        if (v > 0) vikter[r.ticker] = v;
      }
      const r = await fetch("/api/pro/analys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers, vikter }),
        cache: "no-store",
      });
      const d = (await r.json()) as AnalysSvar;
      if (!r.ok || d.error) {
        throw new Error(d.error ?? `Analysen misslyckades (${r.status})`);
      }
      setSvar(d);
    } catch (e: unknown) {
      setFel(e instanceof Error ? e.message : "Analysen misslyckades (nätverk eller datakälla) — försök igen om en stund.");
    } finally {
      setKör(false);
      igångRef.current = false;
    }
  }, [parse, csvText]);

  // ── Resultatförberedelse: konfluensrader sorterade (högst först) + vikt-tabell ──
  const viktTabell = useMemo(() => {
    const m = new Map<string, PortfoljRad>();
    (parse?.rader ?? []).forEach((r) => m.set(r.ticker, r));
    return m;
  }, [parse]);

  const sorteradeRader = useMemo(() => {
    const rader = svar?.rader ?? [];
    return [...rader].sort((a, b) => {
      const aTal = somTal(a.konfluens) !== null ? 0 : 1;
      const bTal = somTal(b.konfluens) !== null ? 0 : 1;
      if (aTal !== bTal) return aTal - bTal;
      if (aTal === 0) return (b.konfluens as number) - (a.konfluens as number);
      return a.ticker.localeCompare(b.ticker);
    });
  }, [svar]);

  const vagTabell = useMemo(() => {
    const m = new Map<string, VagfundamentTicker>();
    (svar?.vagfundament?.tickers ?? []).forEach((v) => m.set(v.ticker.toUpperCase(), v));
    return m;
  }, [svar]);

  const sammanfattning = svar?.sammanfattning;
  const portfolj = svar?.vagfundament?.portfolj;
  const harForhandsvisning = (parse?.rader?.length ?? 0) > 0;

  // ── Rendera ──────────────────────────────────────────────────────────────
  return (
    <section className="marin-panel overflow-hidden rounded-2xl border border-gold/40">
      {/* Rubrikrad — B2B-signaturen */}
      <header className="border-b border-gold/30 px-4 py-3 sm:px-6 sm:py-4">
        <p className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-[#E8C766] sm:text-base">
          PORTFÖLJ-IMPORT
          <span className="ml-2 font-normal normal-case italic tracking-normal text-[#EDE6D6]/85">
            — dra in portföljen, motorerna gör resten
          </span>
        </p>
      </header>

      <div className="bg-card p-4 sm:p-6">
        {/* Import-yta: textarea + fil-input sida vid sida (stackat på mobil) */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="pro-csv-text" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Klistra in CSV — ticker,antal,pris
            </label>
            <textarea
              id="pro-csv-text"
              value={csvText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={"VOLV-B.ST;120;185,50\nSAAB-B.ST;300;221,30\nSAND.ST,85,235.00"}
              rows={7}
              spellCheck={false}
              className="mt-1.5 w-full rounded-xl border border-gold/30 bg-paper p-3 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
            />
            <button type="button" onClick={laddaExempel} className="mt-1.5 text-[11px] italic text-gold underline hover:opacity-80">
              Ladda exempel-portfölj (5 svenska bolag)
            </button>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              …eller välj en CSV-fil
            </span>
            <label
              htmlFor="pro-csv-fil"
              className="mt-1.5 flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/40 bg-paper p-6 text-center transition-colors hover:border-gold/70"
            >
              <span className="text-2xl" aria-hidden>🗂</span>
              <span className="text-xs font-semibold">{filNamn ?? "Välj .csv-fil från datorn"}</span>
              <span className="text-[10px] italic text-muted-foreground">
                Läses lokalt i webbläsaren (FileReader) — inga personuppgifter, endast instrument och vikter.
              </span>
              <input
                ref={filRef}
                id="pro-csv-fil"
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="sr-only"
                onChange={(e) => onFil(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        {/* Fel och varningar ur parsningen */}
        {parse?.fel && (
          <p className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700">
            ⚠ {parse.fel}
          </p>
        )}
        {parse && !parse.fel && parse.varnader.length > 0 && (
          <div className="mt-3 rounded-xl border border-gold/30 bg-gold/5 p-3">
            {parse.varnader.map((v) => (
              <p key={v} className="text-[11px] italic text-guld-djup">ℹ {v}</p>
            ))}
          </div>
        )}
        {fel && (
          <p className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700">
            ⚠ {fel}
          </p>
        )}

        {/* ── Förhandsvisning: normaliserad portfölj med vikter ── */}
        {harForhandsvisning && (
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Förhandsvisning — {parse?.rader.length ?? 0} innehav normaliserade
              {filNamn ? ` ur ${filNamn}` : ""}
            </p>
            <div className="mt-2 overflow-x-auto rounded-xl border border-gold/30 bg-paper">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Ticker</th>
                    <th className="px-3 py-2 text-right font-semibold">Antal</th>
                    <th className="px-3 py-2 text-right font-semibold">Pris</th>
                    <th className="px-3 py-2 text-right font-semibold">Värde</th>
                    <th className="px-3 py-2 text-right font-semibold">Vikt</th>
                  </tr>
                </thead>
                <tbody>
                  {(parse?.rader ?? []).map((r) => (
                    <tr key={r.ticker} className="border-b border-gold/15 last:border-0">
                      <td className="px-3 py-2 font-semibold">{r.ticker}</td>
                      <td className="tabular px-3 py-2 text-right font-mono">{svTal(r.antal, 4)}</td>
                      <td className="tabular px-3 py-2 text-right font-mono">{r.pris !== null ? svTal(r.pris, 2) : "—"}</td>
                      <td className="tabular px-3 py-2 text-right font-mono">{r.varde !== null ? svTal(r.varde, 0) : "—"}</td>
                      <td className="tabular px-3 py-2 text-right font-mono font-bold">{svTal(r.viktProcent, 1)} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Kör-knappen — startskottet ── */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={analysera} disabled={kör || !harForhandsvisning} className="btn-marin min-h-[44px] px-5 py-2.5 text-xs disabled:opacity-50">
            {kör ? "Motorerna arbetar…" : "Analysera portföljen"}
          </button>
          {harForhandsvisning && !kör && (
            <span className="text-[11px] italic text-muted-foreground">
              Konfluens + vågfundament körs parallellt — max {MAX_TICKERS} tickers per analys.
            </span>
          )}
        </div>

        {kör && (
          <div className="mt-3">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gold/15">
              <div className="h-full w-full animate-pulse rounded-full bg-gold" />
            </div>
            <p className="mt-1 text-[11px] italic text-muted-foreground">
              AKM1 · AK1TS · Konfluens — värdegolvet garanteras före vågorna, fundamentet läses före priset.
            </p>
          </div>
        )}

        {/* ── Universum-sammanfattningen ── */}
        {svar && !kör && sammanfattning && (
          <div className="mt-5">
            <div className="hjarlinje" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Universum-sammanfattning — {sammanfattning.antal ?? 0} innehav genom båda motorerna
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              <div className="rounded-lg p-2" style={{ background: "linear-gradient(160deg, #0E1B2E, #081120)" }}>
                <p className="tabular font-mono text-lg font-bold text-[#E8C766]">
                  {sammanfattning.viktadKonfluens ?? sammanfattning.snittKonfluens ?? "—"}
                </p>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  {sammanfattning.viktadKonfluens !== null && sammanfattning.viktadKonfluens !== undefined
                    ? "viktad konfluens"
                    : "snitt-konfluens"}
                </p>
              </div>
              <div className="rounded-lg bg-gold/10 p-2">
                <p className="tabular font-mono text-lg font-bold text-guld-djup">{sammanfattning.antalKonfluens ?? 0}</p>
                <p className="text-[10px] leading-tight text-muted-foreground">rad(er) i konfluens</p>
              </div>
              <div className="rounded-lg bg-bull/10 p-2">
                <p className="tabular font-mono text-lg font-bold text-bull">
                  ▲ {sammanfattning.divergensPositiv ?? 0}
                </p>
                <p className="text-[10px] leading-tight text-muted-foreground">positiv divergens</p>
              </div>
              <div className="rounded-lg bg-bear/10 p-2">
                <p className="tabular font-mono text-lg font-bold text-bear">
                  ▼ {sammanfattning.divergensNegativ ?? 0}
                </p>
                <p className="text-[10px] leading-tight text-muted-foreground">negativ divergens</p>
              </div>
            </div>
            {portfolj && (
              <div className="mt-3 rounded-xl border border-gold/30 bg-paper p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Vågfundament — portföljaggregerad (P6, viktad)
                </p>
                <div className="mt-1.5">
                  <VagfundamentMini total={portfolj.total} />
                </div>
                {portfolj.totalText && (
                  <p className="mt-1.5 text-xs italic leading-relaxed text-muted-foreground">{portfolj.totalText}</p>
                )}
                <p className="mt-1 text-[10px] italic text-muted-foreground">
                  Täckning: {svTal(portfolj.tackningProcent ?? 0, 0)} % av portföljvikten kunde bedömas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Konfluens-tabellen per ticker ── */}
        {svar && !kör && sorteradeRader.length > 0 && (
          <>
            {/* Mobil: kort-lista — ingen sidled scroll */}
            <div className="mt-4 space-y-2 sm:hidden">
              {sorteradeRader.map((r) => {
                const stil = r.klass ? KLASS_STIL[r.klass as Klass] : null;
                const vag = vagTabell.get(r.ticker.toUpperCase());
                return (
                  <div key={r.ticker} className="rounded-xl border border-gold/30 bg-paper p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{r.ticker}</span>
                        {r.namn && <span className="block truncate text-xs text-muted-foreground">{r.namn}</span>}
                        <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-muted-foreground">
                          vikt {svTal(viktTabell.get(r.ticker)?.viktProcent ?? 0, 1)} %
                        </span>
                      </span>
                      <PoangChip konfluens={somTal(r.konfluens)} stor={false} />
                    </div>
                    <div className="mt-3 space-y-2 border-t border-gold/15 pt-2">
                      <Stapel etikett="Värdegolv" varde={somTal(r.vardgolv)} vagolikvid />
                      <Stapel etikett="Fund. vågstart" varde={somTal(r.fundamentalVagstart)} vagolikvid />
                      <Stapel etikett="Prisvågläge" varde={somTal(r.prisVaglage)} vagolikvid />
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-gold/15 pt-2 text-xs">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Divergens</span>
                      <Divergens d={r.divergens} />
                    </div>
                    {stil && (
                      <p className="mt-2 border-t border-gold/15 pt-2">
                        <span
                          className="inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
                          style={{ background: stil.bg, color: stil.text }}
                        >
                          {stil.etikett}
                        </span>
                      </p>
                    )}
                    <div className="mt-2 border-t border-gold/15 pt-2">
                      <VagfundamentMini total={vag?.total} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ≥sm: full resultattabell */}
            <div className="mt-4 hidden overflow-x-auto rounded-xl border border-gold/30 bg-paper sm:block">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Innehav</th>
                    <th className="px-3 py-2 text-right font-semibold">Vikt</th>
                    <th className="px-3 py-2 text-right font-semibold">Konfluens</th>
                    <th className="px-3 py-2 font-semibold">Värdegolv</th>
                    <th className="px-3 py-2 font-semibold">Fund. vågstart</th>
                    <th className="px-3 py-2 font-semibold">Prisvågläge</th>
                    <th className="px-3 py-2 font-semibold">Vågfundament</th>
                    <th className="px-3 py-2 font-semibold">Klass</th>
                  </tr>
                </thead>
                <tbody>
                  {sorteradeRader.map((r) => {
                    const stil = r.klass ? KLASS_STIL[r.klass as Klass] : null;
                    const vag = vagTabell.get(r.ticker.toUpperCase());
                    return (
                      <tr key={r.ticker} className="border-b border-gold/15 last:border-0">
                        <td className="px-3 py-2.5">
                          <span className="font-semibold">{r.ticker}</span>
                          {r.namn && <span className="ml-2 hidden text-xs text-muted-foreground lg:inline">{r.namn}</span>}
                        </td>
                        <td className="tabular px-3 py-2.5 text-right font-mono">{svTal(viktTabell.get(r.ticker)?.viktProcent ?? 0, 1)} %</td>
                        <td className="px-3 py-2.5 text-right">
                          <PoangChip konfluens={somTal(r.konfluens)} stor />
                        </td>
                        <td className="px-3 py-2.5"><Stapel etikett="Värdegolv" varde={somTal(r.vardgolv)} /></td>
                        <td className="px-3 py-2.5"><Stapel etikett="Vågstart" varde={somTal(r.fundamentalVagstart)} /></td>
                        <td className="px-3 py-2.5">
                          <div>
                            <Stapel etikett="Prisvågläge" varde={somTal(r.prisVaglage)} />
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">divergens</span>
                              <Divergens d={r.divergens} />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5"><VagfundamentMini total={vag?.total} /></td>
                        <td className="px-3 py-2.5">
                          {stil ? (
                            <span
                              className="inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
                              style={{ background: stil.bg, color: stil.text }}
                              title={r.klass ?? undefined}
                            >
                              {stil.etikett}
                            </span>
                          ) : (
                            <span className="text-xs italic text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="hjarlinje mt-4" />

            <p className="mt-3 text-[11px] italic leading-relaxed text-muted-foreground">
              Fem oberoende signaler per innehav — värdegolv och kvalitet (är bolaget påstått billigt mot sina egna
              siffror?), fundamental vågstart och prisvågläge (vänder något — fundamentet först, priset sist) samt
              divergensen. Vågfundament-kolumnen visar den fundamentala vågsumman (−1 … +1) per horisont. Poängen är
              metodik-utdata: samma data ger samma svar, varje gång. Studieunderlag — aldrig signaler.
            </p>

            {/* B2B-disclaimer — mal-låst ton från forskning-b2b 4.2 */}
            <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-xs italic text-gold">
              {svar.disclaimer ?? "Pedagogisk analys — inte investeringsråd."}
            </p>
          </>
        )}

        {/* Tom-start-läge */}
        {!svar && !kör && !parse?.fel && !harForhandsvisning && (
          <p className="mt-4 rounded-xl border border-dashed border-gold/30 bg-paper p-4 text-center text-xs italic text-muted-foreground">
            Importera en portfölj ovan — klistra CSV rakt ur depå-exporten eller välj en fil. Dubbletter slås ihop,
            vikter räknas på antal × pris. Ingen analys sparas; inga personuppgifter begärs in.
          </p>
        )}
      </div>
    </section>
  );
}
