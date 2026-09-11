"use client";

import * as React from "react";
import { raknaEnighetsscore } from "@/lib/vagvalidering";

// ═════════════════════════════════════════════════════════════════════════════
// VAGKURVA-GRAF — Elliott-vågläget per tidshorisont (VÅG 48, agent B).
//
// Kunddirektivets kärna: "jag vill att grafen att följa Elliott waves på mikro
// kort medellångsikt långsikt och Mega". Denna komponent ritar ETT bolags
// vågläge som fem små SVG:er — en per horisont — där FORMEN är en pedagogisk
// Elliott-struktur som motsvarar vågmotorns klass:
//   ▲ impulsvåg  → klassisk 5-vågssekvens upp (1-2-3-4-5, våg 3 längst,
//                  motgång 2/4 inom Elliotts egna retracementsband)
//   ▼ korrigering→ A-B-C-zickzack (B återhämtar 50–62 % av A, C ny extrempunkt)
//   ◼ basbygge   → platt sidledes kanal med små svängningar kring medel
//   · osatt      → streckad nästan-platt linje (motorn gissar aldrig)
//
// ALLT drivs av det VERIFIERADE API-svaret från /api/vagfundament (vågmotorn,
// bitidentisk TS-port): klass ur helhetstalet per horisont (samma trösklar
// ±0,50 som motorn), styrka = |helhetstal| 0–1, och kurvans stighastighet
// moduleras av variablernas genomsnittliga momentum. Ingen slump, ingen
// påhittad data — osatt förblir osatt.
//
// VÅG 56: varje horisont visar även ENIGHETSSCORE 0–100 (rådets formel ur
// STYRELSE-vag-exakthet: 40 % medel-bekräftelse + 30 % tröskelmarginal +
// 30 % celltäckning, ren funktion i src/lib/vagvalidering.ts) — motorns
// encells-mätning ska synas som den är, tunn eller tjock.
//
// Ren SVG (viewBox), inga bibliotek; form + vågetiketter (1–5 / A–C) bär
// informationen även utan färgseende. Marin panel med guldaccent i projektets
// design-DNA. Pedagogisk forskning — ALDRIG investeringsråd.
// ═════════════════════════════════════════════════════════════════════════════

/** Källärligheten — exakt formulering, alltid synlig under graferna.
 * VÅG 56 (STYRELSE-vag-exakthet rek 2 — ärlighetsrättningen): förra texten
 * hävdade "fundamental trippelröstning", men denna vy läser /api/vagfundament
 * (encells-motorn) där trippelröstningen INTE körs. Texten anger nu exakt
 * den Klass motorn gav — och hur den stärks: styrka + enighetsscore. */
export const VAGKURVA_KALLA_TEXT =
  "Kurvan visar vågKLASS från vagfundamentmotorn (encells-momentum per variabel mot ±6 %-tröskeln; klass per horisont ur helhetstalets gränser ±0,50) med styrkan |helhetstal| och enighetsscore 0–100 — ingen trippelröstning körs i denna vy (VÅG 56 ärlighetsrättning). Formen är pedagogisk Elliott-visualisering, inte en kursprognos.";

/** De tolv standard-tickrarna (samma rotation som dagens-pass-API:t). */
export const VAGKURVA_STANDARD_TICKERS: readonly string[] = [
  "VOLV-B.ST",
  "SAAB-B.ST",
  "ATCO-A.ST",
  "SAND.ST",
  "SHB-B.ST",
  "SWED-A.ST",
  "ESSITY-B.ST",
  "ERIC-B.ST",
  "AZN.ST",
  "NDA-SE.ST",
  "SKF-B.ST",
  "ALFA.ST",
];

// ── Horisonter (kunddirektivets fem fönster) ────────────────────────────────

const HORIZONTER = [
  { id: "mikro", namn: "Mikro", span: "1 kvartal" },
  { id: "kort", namn: "Kort", span: "1 år" },
  { id: "medellang", namn: "Medellång", span: "3 år" },
  { id: "lang", namn: "Lång", span: "5 år" },
  { id: "mega", namn: "Mega", span: "10 år" },
] as const;

type HorisontId = (typeof HORIZONTER)[number]["id"];

/** Vågklass med å — samma värden som vågmotorn redovisar i vager/total. */
type VagKlass = "impulsvåg" | "korrigering" | "basbygge" | "osatt";

// ── API-typer (minimalt urval ur /api/vagfundament-svaret) ──────────────────

type Indikator = {
  namn?: string;
  vager?: Record<string, string>;
  momentum?: Record<string, number | null>;
  medelBekraftad?: Record<string, boolean | null>;
};

type Analys = {
  ticker: string;
  fel?: string;
  valuta?: string | null;
  dataPer?: string | null;
  indikatorer?: Record<string, Indikator>;
  total?: Record<string, number | null>;
};

// ── Klass → ikon, färg och chip-stil (design-DNA: ▲▼◼·) ────────────────────

const KLASS_IKON: Record<VagKlass, string> = {
  "impulsvåg": "▲",
  korrigering: "▼",
  basbygge: "◼",
  osatt: "·",
};

const KLASS_STIL: Record<VagKlass, string> = {
  "impulsvåg": "border-bull/30 bg-bull/15 text-bull",
  korrigering: "border-bear/30 bg-bear/15 text-bear",
  basbygge: "border-gold/40 bg-gold/15 text-gold",
  osatt: "border-[#EDE6D6]/15 bg-[#0E1B2E]/60 text-[#EDE6D6]/70",
};

/** Streckfärg i SVG:n per klass (CSS-variabler som resten av ekosystemet). */
const KLASS_STREAK: Record<VagKlass, string> = {
  "impulsvåg": "var(--bull)",
  korrigering: "var(--bear)",
  basbygge: "var(--gold)",
  osatt: "var(--muted-foreground)",
};

// ── Ren matematik: klass ur helhetstalet (spegling av motorns egna
//    trösklar — identiska med _klassFranTal i vagfundament-motor.ts) ────────

function klassFranTal(tal: number | null | undefined): VagKlass {
  if (tal === null || tal === undefined || !Number.isFinite(tal)) return "osatt";
  if (tal >= 0.5) return "impulsvåg";
  if (tal <= -0.5) return "korrigering";
  return "basbygge";
}

function lasTal(v: number | null | undefined): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** Per-horisons vy: klass + styrka + enighet + momentum-underlag för modulationen. */
type HorisontVy = {
  id: HorisontId;
  namn: string;
  span: string;
  klass: VagKlass;
  /** |helhetstal| 0–1 — motorns samstämmighet bland variablerna. */
  styrka: number | null;
  /** Helhetstalets tecken (+1/-1/0) — bestämmer korrigeringens riktning. */
  tecken: number;
  /** Medel |momentum| i procent över variabler med data — stighastigheten. */
  momMedel: number | null;
  /** Enighetsscore 0–100 (rådets formel 40/30/30 ur VÅG 56) — null = osatt. */
  enighet: number | null;
};

function byggVyer(data: Analys): HorisontVy[] {
  const ind = data.indikatorer ?? {};
  const variabelAntal = Object.keys(ind).length;
  return HORIZONTER.map((h) => {
    const totalTal = lasTal(data.total?.[h.id]);
    const moms = Object.values(ind)
      .map((i) => lasTal(i?.momentum?.[h.id]))
      .filter((m): m is number => m !== null);
    const momMedel = moms.length > 0 ? moms.reduce((a, b) => a + Math.abs(b), 0) / moms.length : null;
    // Enighet per horisont (VÅG 56): 40 % medel-bekräftelse + 30 % tröskel-
    // marginal + 30 % celltäckning — ren funktion ur src/lib/vagvalidering.
    const enighet = raknaEnighetsscore(
      Object.values(ind).map((i) => ({
        medelBekraftad: i?.medelBekraftad?.[h.id] ?? null,
        momentum: lasTal(i?.momentum?.[h.id]),
      })),
      variabelAntal,
    );
    return {
      id: h.id,
      namn: h.namn,
      span: h.span,
      klass: klassFranTal(totalTal),
      styrka: totalTal === null ? null : Math.min(1, Math.abs(totalTal)),
      tecken: totalTal === null || totalTal === 0 ? 0 : totalTal > 0 ? 1 : -1,
      momMedel,
      enighet,
    };
  });
}

/**
 * Modulationsfaktor 0–1: blanda motorns samstämmighet (|helhetstal|) med
 * variablernas genomsnittliga momentum (25 % momentumsnitt = full effekt).
 * Högre mod → rakare, självsäkrare vågform (grundare motgångar, brantare våg 3
 * och C). Låg mod → djupare retracements och vagare form. Deterministiskt.
 */
function modulationsfaktor(vy: HorisontVy): number {
  const styrka = vy.styrka ?? 0;
  const mom = vy.momMedel === null ? styrka : Math.min(1, vy.momMedel / 25);
  return Math.max(0, Math.min(1, 0.5 * styrka + 0.5 * mom));
}

// ── Elliott-formerna (rena funktioner → pivots i normaliserade koordinater) ─

type Etikett = { i: number; text: string; over: boolean };

type KurvForm = {
  /** x-positioner 0–1 (vänster → höger). */
  xs: number[];
  /** Värden (högre = högre upp i rutan); normaliseras vid ritningen. */
  vs: number[];
  etiketter: Etikett[];
  /** Kanalplan (basbygge): över-/undergräns i samma värdeskala. */
  kanal?: { topp: number; botten: number };
};

/**
 * IMPULSVÅG — klassisk 5-vågssekvens uppåt. Elliott-regler hålls matematiskt:
 * våg 3 är längst (1,55 × våg 1), våg 2 återgår 50–61,8 % av våg 1 (aldrig
 * under våg 1:s start), våg 4 återgår 30–38,2 % av våg 3 (aldrig in i våg 1:s
 * territorium) och våg 5 förbi våg 3:s topp. mod = bekräftelsestyrka.
 */
function impulsForm(mod: number): KurvForm {
  const retr2 = 0.618 - 0.118 * mod; // 0,50–0,618 av våg 1
  const retr4 = 0.382 - 0.082 * mod; // 0,30–0,382 av våg 3
  const r1 = 1.0;
  const r3 = 1.55; // våg 3 längst (typiskt 1,618 × våg 1)
  const r5 = 1.05 + 0.25 * mod; // våg 5 ≈ våg 1, längre vid stark bekräftelse
  const v1 = r1;
  const v2 = v1 - r1 * retr2;
  const v3 = v2 + r3;
  const v4 = v3 - r3 * retr4;
  const v5 = v4 + r5;
  return {
    xs: [0.03, 0.21, 0.35 - 0.04 * mod, 0.68 - 0.1 * mod, 0.79, 0.97],
    vs: [0, v1, v2, v3, v4, v5],
    etiketter: [
      { i: 1, text: "1", over: true },
      { i: 2, text: "2", over: false },
      { i: 3, text: "3", over: true },
      { i: 4, text: "4", over: false },
      { i: 5, text: "5", over: true },
    ],
  };
}

/**
 * KORRIGERING — A-B-C-zickzack. B återhämtar 50–62 % av A (djupare vid svag
 * bekräftelse); C är 1,0–1,3 × A och bryter alltid ny extrempunkt. Riktning
 * följer helhetstalets tecken: negativt tal → nedåtkorrigering.
 */
function korrigeringForm(mod: number, ned: boolean): KurvForm {
  const retrB = 0.5 + 0.12 * (1 - mod); // 0,50–0,62 av A
  const fA = 1.0;
  const fC = 1.0 + 0.3 * mod; // C = 1,0–1,3 × A
  const vA = -fA;
  const vB = vA + fA * retrB;
  const vC = vB - fC;
  return {
    xs: [0.04, 0.36 - 0.04 * mod, 0.58, 0.96 - 0.06 * mod],
    vs: ned ? [0, vA, vB, vC] : [0, -vA, -vB, -vC],
    etiketter: ned
      ? [
          { i: 1, text: "A", over: false },
          { i: 2, text: "B", over: true },
          { i: 3, text: "C", over: false },
        ]
      : [
          { i: 1, text: "A", over: true },
          { i: 2, text: "B", over: false },
          { i: 3, text: "C", over: true },
        ],
  };
}

/**
 * BASBYGGE — platt sidledes kanal: små, jämna svängningar kring medel.
 * Amplituden växer med |helhetstal| (som alltid < 0,50 här) men förblir låg —
 * en lågvolatilitetsbild, markerad med prickade kanalgränser.
 */
function basbyggeForm(normAmp: number): KurvForm {
  const amp = 0.1 + 0.16 * Math.max(0, Math.min(1, normAmp)); // 0,10–0,26
  const monster = [0.9, -0.55, 0.75, -0.85, 0.6, -0.7, 0.8, -0.5];
  return {
    xs: monster.map((_, i) => 0.03 + (i / (monster.length - 1)) * 0.94),
    vs: monster.map((m) => m * amp),
    etiketter: [],
    kanal: { topp: 1.05 * amp, botten: -1.05 * amp },
  };
}

// ── Ett mini-diagram (ren SVG) ──────────────────────────────────────────────

const SVG_W = 230;
const SVG_H = 136;
const PLOT_X0 = 10;
const PLOT_X1 = 220;
const KURVA_Y_TOPP = 34; // högsta kurvpunkt (etiketter ovanför)
const KURVA_Y_BOTTEN = 108; // lägsta kurvpunkt (etiketter under)

function KurvaKort({ vy }: { vy: HorisontVy }) {
  const mod = modulationsfaktor(vy);
  const farg = KLASS_STREAK[vy.klass];
  const styrkaProcent = vy.styrka === null ? null : Math.round(vy.styrka * 100);

  // Kurvformen väljs ENDAST av motorns klass — aldrig av åsikt.
  const form: KurvForm =
    vy.klass === "impulsvåg"
      ? impulsForm(mod)
      : vy.klass === "korrigering"
        ? korrigeringForm(mod, vy.tecken < 0)
        : vy.klass === "basbygge"
          ? basbyggeForm((vy.styrka ?? 0) / 0.5)
          : { xs: [], vs: [], etiketter: [] };

  // Normalisering: värden → pixelkoordinater (deterministisk linjär avbildning).
  const skala = (() => {
    if (vy.klass === "osatt" || form.vs.length === 0) return null;
    const alla = [...form.vs, ...(form.kanal ? [form.kanal.topp, form.kanal.botten] : [])];
    const min = Math.min(...alla);
    const max = Math.max(...alla);
    const span = max - min || 1;
    return {
      x: (fx: number) => PLOT_X0 + fx * (PLOT_X1 - PLOT_X0),
      y: (v: number) => KURVA_Y_BOTTEN - ((v - min) / span) * (KURVA_Y_BOTTEN - KURVA_Y_TOPP),
    };
  })();

  const path = skala ? form.vs.map((v, i) => `${i === 0 ? "M" : "L"}${skala.x(form.xs[i]).toFixed(1)},${skala.y(v).toFixed(1)}`).join(" ") : "";

  const aria =
    `${vy.namn} (${vy.span}): ${vy.klass}` +
    (styrkaProcent !== null ? `, styrka ${String(styrkaProcent).replace(".", ",")} procent` : "") +
    (vy.enighet !== null ? `, enighet ${vy.enighet} av 100` : ", enighet osatt") +
    ". Kurvformen är en pedagogisk Elliott-visualisering av vågklassen.";

  return (
    <figure className="rounded-xl border border-[#EDE6D6]/15 bg-[#081120]/40 p-2.5">
      <figcaption className="font-serif text-xs font-bold">
        {vy.namn} <span className="font-normal text-muted-foreground">· {vy.span}</span>
      </figcaption>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="mt-1 w-full" role="img" aria-label={aria}>
        {/* Ljus vågrät referens — formen ska vara läsbar utan färgseende */}
        <line x1={PLOT_X0} x2={PLOT_X1} y1={(KURVA_Y_TOPP + KURVA_Y_BOTTEN) / 2} y2={(KURVA_Y_TOPP + KURVA_Y_BOTTEN) / 2} stroke="var(--muted-foreground)" strokeWidth="0.5" strokeDasharray="2 5" opacity="0.25" />

        {vy.klass === "osatt" ? (
          /* OSATT — streckad nästan-platt linje; motorn gissar aldrig en form */
          <g>
            <line x1={PLOT_X0 + 4} x2={PLOT_X1 - 4} y1={(KURVA_Y_TOPP + KURVA_Y_BOTTEN) / 2} y2={(KURVA_Y_TOPP + KURVA_Y_BOTTEN) / 2 - 1} stroke={farg} strokeWidth="1.75" strokeDasharray="5 4" />
            <text x={(PLOT_X0 + PLOT_X1) / 2} y={(KURVA_Y_TOPP + KURVA_Y_BOTTEN) / 2 - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--muted-foreground)">
              osatt
            </text>
          </g>
        ) : (
          <g>
            {/* Basbyggets kanalgränser (prickade) — sidledesbandet syns tydligt */}
            {form.kanal && skala ? (
              <>
                <line x1={PLOT_X0} x2={PLOT_X1} y1={skala.y(form.kanal.topp)} y2={skala.y(form.kanal.topp)} stroke={farg} strokeWidth="0.75" strokeDasharray="3 4" opacity="0.55" />
                <line x1={PLOT_X0} x2={PLOT_X1} y1={skala.y(form.kanal.botten)} y2={skala.y(form.kanal.botten)} stroke={farg} strokeWidth="0.75" strokeDasharray="3 4" opacity="0.55" />
              </>
            ) : null}

            {/* Själva vågbanan */}
            <path d={path} stroke={farg} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />

            {/* Start- och slutpunkt — var vågen börjar och står just nu */}
            {skala ? <circle cx={skala.x(form.xs[0])} cy={skala.y(form.vs[0])} r="2" fill={farg} /> : null}
            {skala ? <circle cx={skala.x(form.xs[form.vs.length - 1])} cy={skala.y(form.vs[form.vs.length - 1])} r="2.5" fill={farg} /> : null}

            {/* Vågetiketter 1–5 / A–C vid pivots (8 px, färgblind-bärande) */}
            {skala
              ? form.etiketter.map((e) => (
                  <text
                    key={e.text}
                    x={skala.x(form.xs[e.i])}
                    y={e.over ? skala.y(form.vs[e.i]) - 5 : skala.y(form.vs[e.i]) + 10}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill="var(--foreground)"
                    opacity="0.85"
                  >
                    {e.text}
                  </text>
                ))
              : null}
          </g>
        )}
      </svg>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className={"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold " + KLASS_STIL[vy.klass]}>
          <span aria-hidden>{KLASS_IKON[vy.klass]}</span> {vy.klass}
        </span>
        <span className="tabular text-[10px] text-muted-foreground">
          styrka {styrkaProcent === null ? "—" : `${styrkaProcent} %`}
        </span>
        {/* Enighetsscore 0–100 (VÅG 56): 40 % medel-bekräftelse + 30 % tröskel-
            marginal + 30 % celltäckning — en tunn mätning ser tunn ut. */}
        <span
          className="tabular text-[10px] text-muted-foreground"
          title="Enighet 0–100 = 40 % medel-bekräftelse + 30 % tröskelmarginal (tak vid 6 %) + 30 % celltäckning bland variablerna"
        >
          enighet {vy.enighet === null ? "—" : `${vy.enighet}/100`}
        </span>
      </div>
    </figure>
  );
}

// ── Huvudkomponenten ────────────────────────────────────────────────────────

export function VagkurvaGraf({
  ticker,
  alternativ,
}: {
  /** Tickers att välja mellan (den första/rådande markeras först). */
  ticker: string;
  /** Valfri lista — ritar en ticker-väljare när mer än en ticker erbjuds. */
  alternativ?: readonly string[];
}) {
  const [vald, setVald] = React.useState(ticker);
  const [data, setData] = React.useState<Analys | null>(null);
  const [fel, setFel] = React.useState<string | null>(null);
  const [laddar, setLaddar] = React.useState(true);
  const [korning, setKorning] = React.useState(0);

  // Yttre ticker-byte (t.ex. ny portfölj) återställer valet.
  React.useEffect(() => {
    setVald(ticker);
  }, [ticker]);

  const valdaAlternativ = React.useMemo(() => {
    const lista = (alternativ ?? []).filter((t) => typeof t === "string" && t.trim() !== "");
    return lista.includes(vald) || lista.length === 0 ? lista : [vald, ...lista];
  }, [alternativ, vald]);

  React.useEffect(() => {
    let aktiv = true;
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 8000); // 8 s — motorn ska inte hänga gränssnittet
    setLaddar(true);
    setFel(null);
    setData(null);

    fetch("/api/vagfundament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers: [vald] }),
      signal: abort.signal,
    })
      .then((r) => r.json())
      .then((j: { tickers?: Analys[]; error?: string }) => {
        if (!aktiv) return;
        const a = j?.tickers?.[0];
        if (!a || a.fel) {
          setFel(a?.fel || j?.error || "Vågmotorn svarade inte");
        } else {
          setData(a);
        }
      })
      .catch(() => {
        if (aktiv) setFel("Vågmotorn sover — försök igen");
      })
      .finally(() => {
        clearTimeout(timer);
        if (aktiv) setLaddar(false);
      });

    return () => {
      aktiv = false;
      clearTimeout(timer);
      abort.abort();
    };
  }, [vald, korning]);

  const vyer = React.useMemo(() => (data ? byggVyer(data) : []), [data]);

  return (
    <section className="marin-panel overflow-hidden rounded-2xl border border-gold/40">
      <header className="flex min-h-[44px] flex-wrap items-center justify-between gap-2 border-b border-gold/30 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-[#E8C766] sm:text-base">
          ELLIOTT-VÅGKURVOR
          <span className="ml-2 font-normal normal-case italic tracking-normal text-[#EDE6D6]/85">
            — vågläget på fem tidshorisonter
          </span>
        </h3>
        {vald ? (
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold text-gold">
            {vald}
          </span>
        ) : null}
      </header>
      <div className="hjarlinje" aria-hidden />

      {/* VÅG 105: marin-familjens mörka kort — temavariabeln bg-card blev LJUS
          i ljust läge under marin-panelens cream-text = osynlig text (1.2:1). */}
      <div className="bg-[#101b2b] p-4 sm:p-6">
        {/* Ticker-väljare — tryckytor minst 44 px */}
        {valdaAlternativ.length > 1 ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {valdaAlternativ.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setVald(t)}
                aria-pressed={vald === t}
                className={
                  "min-h-[44px] rounded-lg border px-3 text-xs font-bold transition-colors " +
                  (vald === t
                    ? "border-gold/60 bg-gold/15 text-gold"
                    : "border-[#EDE6D6]/15 bg-[#0E1B2E]/60 text-[#EDE6D6]/70 hover:border-gold/40")
                }
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}

        {laddar ? (
          /* Loader — puls i projektets anda */
          <div className="space-y-3" aria-busy="true">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
              {HORIZONTER.map((h) => (
                <div key={h.id} className="h-[168px] animate-pulse rounded-xl bg-[#0E1B2E]/50" />
              ))}
            </div>
            <p className="text-sm italic text-muted-foreground">
              Läser vågmotorens läge för {vald} på fem tidshorisonter …
            </p>
          </div>
        ) : fel || !data ? (
          /* Fel/viloläge — motorn sover, aldrig dömande */
          <div className="rounded-lg border border-bear/30 bg-bear/5 p-5">
            <p className="font-serif text-sm font-bold text-bear">Vågmotorn sover — försök igen</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {fel || "Inget underlag kunde hämtas"} — utan data finns ingen våg att rita, och
              motorn gissar aldrig.
            </p>
            <button
              type="button"
              onClick={() => setKorning((n) => n + 1)}
              className="btn-marin mt-3 inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-xs"
            >
              Försök igen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.dataPer ? (
              <p className="text-[11px] text-muted-foreground">
                Senaste rapport i underlaget: {data.dataPer}
              </p>
            ) : null}

            {/* Fem vågkurvor — 2 kol mobil, 5 på bred skärm */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
              {vyer.map((vy) => (
                <KurvaKort key={vy.id} vy={vy} />
              ))}
            </div>

            {/* Källärlighet — exakt formulering, alltid synlig */}
            <p className="border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
              {VAGKURVA_KALLA_TEXT}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
