"use client";

import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import type { KonfluensRad } from "@/lib/konfluens-motor";
import { VagkonGraf } from "@/components/ak1a/vagkon-graf";

// ═══════════════════════════════════════════════════════════
// KONFLUENSRADARN — ytan där värde möter vågor. Radarn väger
// fem oberoende signaler per bolag: värdegolv, kvalitet, fundamental
// vågstart, prisvågläge och divergens. Ordningen är själva tesen:
// värdegolvet garanteras FÖRE vågorna — först måste bolaget vara
// påstått billigt mot sina egna siffror, SEDAN letar vi vågor som
// vänder (fundamental först, pris sist).
//
// Dataväg: fetch → /api/konfluens (route — inte server action;
// server actions levererade inte Yahoo-data, se /api/netnet).
//
// P8 SEKRETESS: exakta vikter och trösklar stannar i motorn —
// i UI:t syns bara koncept, poängband och klass-namn. KonfluensRad
// importeras ur src/lib/konfluens-motor.ts; notera att datakallor
// är ANTAL underliggande källor som levererade data (0–3).
// ═══════════════════════════════════════════════════════════

/** Klass-namnen som union — samma strängar som motorn klassar med. */
type Klass = NonNullable<KonfluensRad["klass"]>;

/** Färgband för KONFLUENS-poängen (0–100): grå → guld → marin med guldtext. */
const BAND = {
  grå: { bg: "rgba(90,80,69,0.12)", text: "#5a5045" },
  guld: { bg: "rgba(168,134,42,0.16)", text: "#a8862a" },
  marin: { bg: "linear-gradient(160deg, #0E1B2E, #081120)", text: "#E8C766" },
} as const;

/** Band med flagga för om KONFLUENS-badgen ska synas (marin-bandet). */
type Band = { bg: string; text: string; marin: boolean };

function poangBand(poang: number): Band {
  if (poang >= 70) return { ...BAND.marin, marin: true };
  if (poang >= 40) return { ...BAND.guld, marin: false };
  return { ...BAND.grå, marin: false };
}

/** Kortetikett + stil per klass — fulla klass-namn står i kortet/tooltip. */
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

/** Divergens-symbol: ▲ positiv (priset släpar efter fundamentet), ▼ negativ. */
function Divergens({ d }: { d: KonfluensRad["divergens"] }) {
  if (d === "positiv")
    return (
      <span className="font-bold text-bull" title="Positiv divergens">
        ▲
      </span>
    );
  if (d === "negativ")
    return (
      <span className="font-bold text-bear" title="Negativ divergens">
        ▼
      </span>
    );
  return <span className="text-muted-foreground">—</span>;
}

/** En stapel — 0–100 med guld-fyllnad och tabular siffra. */
function Stapel({
  etikett,
  varde,
  vagolikvid = false,
}: {
  etikett: string;
  varde: number | null;
  vagolikvid?: boolean;
}) {
  const pct = varde !== null ? Math.max(0, Math.min(100, varde)) : 0;
  return (
    <div className={vagolikvid ? "w-full" : "w-[108px]"}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{etikett}</span>
        <span className="tabular font-mono text-xs font-bold">
          {varde !== null ? Math.round(varde) : "—"}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gold/15">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** KONFLUENS-poängen som stor tabular siffra med färgband (+ badge vid topp). */
function PoangChip({ konfluens, stor }: { konfluens: number | null; stor: boolean }) {
  if (konfluens === null) {
    return <span className="font-mono text-xl font-bold text-muted-foreground">—</span>;
  }
  const band = poangBand(Math.round(konfluens));
  return (
    <span className="flex flex-col items-end">
      <span
        className={`tabular inline-block rounded-lg px-3 py-1 font-mono font-bold leading-none ${
          stor ? "text-3xl" : "text-2xl"
        }`}
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

/** Datakällor-chip — antal av motorns underliggande källor som levererade. */
function KallaChip({ antal, max = 3 }: { antal: number; max?: number }) {
  return (
    <span
      className="inline-block rounded-full border border-gold/30 bg-gold/5 px-2 py-0.5 text-[10px] text-muted-foreground"
      title="Antal av motorns underliggande datakällor som levererade data"
    >
      {antal}/{max} källor
    </span>
  );
}

// ── Vågkon-demo-serie — deterministiskt ur ticker-hash (Fas C) ────────────────
// Ingen Math.random: ticker → FNV-1a-hash → 32-bit seed → linjär kongruens-
// generator (Park–Miller/minstd). Samma ticker ger alltid bitidentisk serie.

/** FNV-1a-stränghash → 32-bit seed. */
function hashTicker(ticker: string): number {
  let h = 2166136261;
  for (let i = 0; i < ticker.length; i++) {
    h ^= ticker.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Linjär kongruens-generator (minstd): slumptal i [0, 1) ur ett fast seed. */
function lcg(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** 25punkts DEMO-historik per ticker — slumpad men fullt reproducerbar. */
function demoHistorik(ticker: string): number[] {
  const slump = lcg(hashTicker(ticker));
  const serie: number[] = [];
  let v = 120 + slump() * 180; // startnivå 120–300 SEK
  for (let i = 0; i < 25; i++) {
    v *= 1 + (slump() - 0.5) * 0.08; // ±4 % per steg — månadslik volatilitet
    serie.push(Math.round(v * 10) / 10);
  }
  return serie;
}

/** Expanderbar Vågkon-rad — details/summary utan JavaScript-krav. */
function VagkonRad({ ticker }: { ticker: string }) {
  return (
    <details>
      <summary className="marin-unscope cursor-pointer select-none text-[11px] font-bold uppercase tracking-widest gold-text">
        Vågkon ▾
      </summary>
      <div className="mt-2">
        <VagkonGraf historik={demoHistorik(ticker)} titel={`Scenario: ${ticker}`} enhet="SEK" />
      </div>
    </details>
  );
}

export function KonfluensTabell() {
  const [rader, setRader] = useState<KonfluensRad[]>([]);
  const [kör, setKör] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const igångRef = useRef(false);

  // ── Kör skanningen: GET /api/konfluens (utan parametrar = fast universum) ──
  const korSkanning = useCallback(async () => {
    if (igångRef.current) return;
    igångRef.current = true;
    setKör(true);
    setFel(null);
    setRader([]);
    try {
      const r = await fetch("/api/konfluens", { cache: "no-store" });
      if (!r.ok) throw new Error(`Skanningen misslyckades (${r.status})`);
      const d = (await r.json()) as { rader?: KonfluensRad[] };
      const mottagna = Array.isArray(d.rader)
        ? d.rader.filter(
            (rad): rad is KonfluensRad =>
              typeof rad === "object" && rad !== null && typeof rad.ticker === "string",
          )
        : [];
      if (mottagna.length === 0) throw new Error("Tomt svar från radarn");
      setRader(mottagna);
    } catch {
      setFel("Skanningen misslyckades (nätverk eller datakälla) — försök igen om en stund.");
    } finally {
      setKör(false);
      igångRef.current = false;
    }
  }, []);

  // ── Sortering: högst konfluens först; utan poäng sist ────────────────────
  const sorterade = useMemo(() => {
    return [...rader].sort((a, b) => {
      const aTal = somTal(a.konfluens) !== null ? 0 : 1;
      const bTal = somTal(b.konfluens) !== null ? 0 : 1;
      if (aTal !== bTal) return aTal - bTal;
      if (aTal === 0 && bTal === 0) return (b.konfluens as number) - (a.konfluens as number);
      return a.ticker.localeCompare(b.ticker);
    });
  }, [rader]);

  // ── Klass-räkning för sammanställningen ──────────────────────────────────
  const rakna = useMemo(() => {
    const n: Record<Klass, number> = {
      "Konfluens — värde möter vändande vågor": 0,
      "Värde men vågor sover": 0,
      "Vågor utan värdegolv": 0,
      "Ingen bild": 0,
    };
    for (const r of rader) {
      if (r.klass) n[r.klass]++;
    }
    return n;
  }, [rader]);

  const harResultat = rader.length > 0;

  // ── Rendera ──────────────────────────────────────────────────────────────
  return (
    <section className="marin-panel overflow-hidden rounded-2xl border border-gold/40">
      {/* Rubrikrad — radarns signatur */}
      <header className="border-b border-gold/30 px-4 py-3 sm:px-6 sm:py-4">
        <p className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-[#E8C766] sm:text-base">
          KONFLUENSRADARN
          <span className="ml-2 font-normal normal-case italic tracking-normal text-[#EDE6D6]/85">
            — där värde möter vågor
          </span>
        </p>
      </header>

      <div className="bg-card p-4 sm:p-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Tio välkända svenska bolag scannas mot fem oberoende signaler: värdegolv, kvalitet,
          fundamental vågstart, prisvågläge och divergens. Ordningen är tesen — värdet först,
          vågorna sedan. Hög poäng betyder att signalerna talar samman, inte att något är köpläget.
        </p>

        <div className="hjarlinje mt-4" />

        {/* Kör-knapp + status (44px tryckyta) */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={korSkanning}
            disabled={kör}
            className="btn-marin min-h-[44px] max-md:min-h-[52px] px-5 py-2.5 text-xs"
          >
            {kör ? "Skannar universum…" : harResultat ? "Skanna universum igen" : "Skanna universum"}
          </button>
          {harResultat && !kör && (
            <span className="text-[11px] italic text-muted-foreground">
              Färsk skanning — fem signaler per bolag, sorterat på konfluenspoängen.
            </span>
          )}
        </div>

        {/* Progress-känsla medan motorn arbetar */}
        {kör && (
          <div className="mt-3">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gold/15">
              <div className="h-full w-full animate-pulse rounded-full bg-gold" />
            </div>
            <p className="mt-1 text-[11px] italic text-muted-foreground">
              Garanterar värdegolvet före vågorna — fundamental först, pris sist.
            </p>
          </div>
        )}

        {fel && (
          <p className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700">
            ⚠ {fel}
          </p>
        )}

        {/* Sammanställnings-chips per klass */}
        {harResultat && !kör && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            {(Object.keys(KLASS_STIL) as Klass[]).map((k) => (
              <div key={k} className="rounded-lg p-2" style={{ background: KLASS_STIL[k].bg }}>
                <p className="tabular font-mono text-lg font-bold" style={{ color: KLASS_STIL[k].text }}>
                  {rakna[k]}
                </p>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  {KLASS_STIL[k].etikett.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Resultat — mobil: kort-lista; ≥sm: full tabell */}
        {harResultat ? (
          <>
            {/* Mobil (412px): varje bolag som kort — ingen sidled scroll */}
            <div className="mt-4 space-y-2 sm:hidden">
              {sorterade.map((r) => (
                <div key={r.ticker} className="rounded-xl border border-gold/30 bg-paper p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.ticker}</span>
                      {r.namn && (
                        <span className="block truncate text-xs text-muted-foreground">{r.namn}</span>
                      )}
                    </span>
                    <PoangChip konfluens={somTal(r.konfluens)} stor={false} />
                  </div>
                  <div className="mt-3 space-y-2 border-t border-gold/15 pt-2">
                    <Stapel etikett="Värdegolv" varde={somTal(r.vardgolv)} vagolikvid />
                    <Stapel etikett="Kvalitet" varde={somTal(r.kvalitet)} vagolikvid />
                    <Stapel
                      etikett="Fundamental vågstart"
                      varde={somTal(r.fundamentalVagstart)}
                      vagolikvid
                    />
                    <Stapel etikett="Prisvågläge" varde={somTal(r.prisVaglage)} vagolikvid />
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-gold/15 pt-2 text-xs">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Divergens
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Divergens d={r.divergens} />
                      <span className="text-muted-foreground">
                        {r.divergens === "positiv"
                          ? "positiv"
                          : r.divergens === "negativ"
                            ? "negativ"
                            : "osatt"}
                      </span>
                    </span>
                  </div>
                  {r.klass && (
                    <p className="mt-2 border-t border-gold/15 pt-2 text-xs italic text-muted-foreground">
                      {r.klass}
                    </p>
                  )}
                  <div className="mt-2">
                    <KallaChip antal={typeof r.datakallor === "number" ? r.datakallor : 0} />
                  </div>
                  <div className="mt-2 border-t border-gold/15 pt-2">
                    <VagkonRad ticker={r.ticker} />
                  </div>
                </div>
              ))}
            </div>

            {/* ≥sm: resultattabell med horisontell scroll-wrapper */}
            <div className="mt-4 hidden overflow-x-auto rounded-xl border border-gold/30 bg-paper sm:block">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Bolag</th>
                    <th className="px-3 py-2 text-right font-semibold">Konfluens</th>
                    <th className="px-3 py-2 font-semibold">Värdegolv</th>
                    <th className="px-3 py-2 font-semibold">Kvalitet</th>
                    <th className="px-3 py-2 font-semibold">Fund. vågstart</th>
                    <th className="px-3 py-2 font-semibold">Prisvågläge</th>
                    <th className="px-3 py-2 font-semibold">Klass</th>
                    <th className="px-3 py-2 font-semibold">Källor</th>
                  </tr>
                </thead>
                <tbody>
                  {sorterade.map((r) => {
                    const stil = r.klass ? KLASS_STIL[r.klass] : null;
                    return (
                      <Fragment key={r.ticker}>
                        <tr className="border-b border-gold/15">
                        <td className="px-3 py-2.5">
                          <span className="font-semibold">{r.ticker}</span>
                          {r.namn && (
                            <span className="ml-2 hidden text-xs text-muted-foreground lg:inline">
                              {r.namn}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <PoangChip konfluens={somTal(r.konfluens)} stor />
                        </td>
                        <td className="px-3 py-2.5">
                          <Stapel etikett="Värdegolv" varde={somTal(r.vardgolv)} />
                        </td>
                        <td className="px-3 py-2.5">
                          <Stapel etikett="Kvalitet" varde={somTal(r.kvalitet)} />
                        </td>
                        <td className="px-3 py-2.5">
                          <Stapel etikett="Fund. vågstart" varde={somTal(r.fundamentalVagstart)} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div>
                            <Stapel etikett="Prisvågläge" varde={somTal(r.prisVaglage)} />
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                divergens
                              </span>
                              <Divergens d={r.divergens} />
                            </div>
                          </div>
                        </td>
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
                        <td className="px-3 py-2.5">
                          <KallaChip antal={typeof r.datakallor === "number" ? r.datakallor : 0} />
                        </td>
                        </tr>
                        {/* Vågkon — expanderbar scenariorad per bolag (Fas C) */}
                        <tr className="border-b border-gold/15 last:border-0">
                          <td colSpan={8} className="px-3 py-2">
                            <VagkonRad ticker={r.ticker} />
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="hjarlinje mt-4" />

            {/* Gemensam förklaring — koncept, aldrig vikter (P8) */}
            <p className="mt-3 text-[11px] italic leading-relaxed text-muted-foreground">
              Fem oberoende signaler per rad: värdegolv och kvalitet (är bolaget påstått billigt
              mot sina egna siffror?), fundamental vågstart och prisvågläge (vänder något —
              fundamental först, pris sist?) samt divergensen (▲ priset släpar efter fundamentet,
              ▼ tvärtom). Grå poäng = ingen samverkan, guld = på väg, marin med guldtext =
              signalerna talar samman. Chippet &quot;källor&quot; visar hur många av motorns
              underliggande datakällor som levererade underlag. Klass-namnen är radarns egna ord
              — studieunderlag, inte signaler.
            </p>
          </>
        ) : (
          !kör && (
            <p className="mt-4 rounded-xl border border-dashed border-gold/30 bg-paper p-4 text-center text-xs italic text-muted-foreground">
              Ingen skanning ännu. Tryck på knappen ovan — tio tickers läses mot fem oberoende
              signaler och sorteras på konfluenspoängen.
            </p>
          )
        )}

        {/* Disclaimer — marin-unscope: bg-card-ytan är ljus, guld-löptext hämtar
            rotens WCAG-brons (#7A5E14, 5.4:1) i stället för marin-flippens
            #c9a84c (2.25:1 på cream — våg 105-fynd). */}
        <p className="marin-unscope mt-6 rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-xs italic gold-text">
          Pedagogisk analys — inte investeringsråd. Poängen är ett studieunderlag, aldrig en köp-
          eller säljsignal.
        </p>
      </div>
    </section>
  );
}
