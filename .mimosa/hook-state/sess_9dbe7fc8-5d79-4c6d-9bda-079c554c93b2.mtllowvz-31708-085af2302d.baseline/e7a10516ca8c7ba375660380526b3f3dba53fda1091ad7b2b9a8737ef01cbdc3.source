"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { lasMedlem, type Medlem } from "@/lib/member-local";
import { besok } from "@/lib/navigationsminne";

/**
 * MIN PORTFÖLJ-KORT — medlemmens innehav, direkt i Min Sida.
 *
 * Användarens direktiv: "kunder ska kunna se sina portföljer i hemsidan
 * efter inloggning". Kortet hämtar portföljen via befintliga API:er
 * (/api/member/portfolio + /api/member/portfolio/djupanalys) och visar en
 * tabell med ticker, bolag, antal, SENASTE kurs (ur analys-motorns senaste
 * mätning — data.pris), totalvärde och utveckling mot snittkostnad.
 *
 * Vågprofil: per innehav visas analys-motorns vågklass per tidshorisont
 * (▲ impulsvåg · ◼ basbygge · ▼ korrigering · · osatt) — samma ikon-språk
 * som Portföljbyggaren. "Portföljen som helhet" visar 5 horisont-chips med
 * medel-vågklass (viktat argmax ur djupanalysens portföljaggregering), när
 * sådan vågdata finns. Som fallback (medlem utan sparad portfölj) läses
 * senast besökta aktieanalyser ur navigationsminnet och vågklasserna hämtas
 * via /api/vagfundament?ticker= (fundamentalvågorna, klassgränser ±0,5).
 *
 * Hydration-säkert: localStorage + fetch sker ENDAST i useEffect — första
 * passt är ett deterministiskt skelett (samme på server och klient).
 * Pedagogiken: aldrig dömande, alltid inbjudande. Ej investeringsråd.
 */

// ── AK1TS-vokabulär (analys-motorn) ─────────────────────────────────────────

const HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"] as const;
type Horisont = (typeof HORIZONTER)[number];

const HZ_ETIKETT: Record<Horisont, string> = {
  mikro: "Mikro",
  kort: "Kort",
  medellang: "Medellång",
  lang: "Lång",
  mega: "Mega",
};

type VagKlass = "impulsvåg" | "korrigering" | "basbygge" | "osatt";

/** Samma ikon-/färgspråk som Portföljbyggaren (▲ ◼ ▼). */
const VAGINFO: Record<VagKlass, { ikon: string; etikett: string; farg: string }> = {
  "impulsvåg": { ikon: "▲", etikett: "Impulsvåg", farg: "#047857" },
  korrigering: { ikon: "▼", etikett: "Korrigering", farg: "#b91c1c" },
  basbygge: { ikon: "◼", etikett: "Basbygge", farg: "#a8862a" },
  osatt: { ikon: "·", etikett: "Osatt", farg: "#78716c" },
};

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

// ── Typer för API-svaren (defensivt tolkade) ────────────────────────────────

/** client_holdings-rad ur GET /api/member/portfolio. */
type RåInnehav = {
  ticker?: unknown;
  company?: unknown;
  shares?: unknown;
  avg_cost?: unknown;
  current_price?: unknown;
};

/** En matad tabellrad — allt saniterat, null-säkert. */
type Rad = {
  ticker: string;
  bolag: string;
  antal: number | null;
  pris: number | null;
  valuta: string | null;
  snittKostnad: number | null;
  varde: number | null;
  utvecklingProcent: number | null;
  vager: Partial<Record<Horisont, VagKlass>>;
  vagKalla: "analys-motorn" | "vagfundamentet" | "ingen";
};

/** GET /api/vagfundament?ticker= — fundamentalvågornas sammanfattning. */
type VagfundamentSvar = {
  tickers?: Array<{
    ticker?: unknown;
    fel?: unknown;
    total?: Record<string, unknown>;
  }>;
};

/** Analys-motorns rad per aktie (fel-varianten passar löst: den saknar bara fälten). */
type DjupAnalysRad = {
  fel?: unknown;
  namn?: unknown;
  valuta?: unknown;
  data?: { pris?: unknown };
  vager?: Record<string, unknown>;
};

/** GET /api/member/portfolio/djupanalys — analys-motorn per aktie + portfölj. */
type DjupSvar = {
  innehav?: Array<{ ticker?: unknown; analys?: DjupAnalysRad }>;
  portfolj?: {
    vagProfil?: Record<string, Record<string, unknown> | undefined>;
  };
};

// ── Hjälpfunktioner ─────────────────────────────────────────────────────────

function arTal(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function somKlass(v: unknown): VagKlass | null {
  return v === "impulsvåg" || v === "korrigering" || v === "basbygge" || v === "osatt" ? v : null;
}

/** Fundamentalvågens celltal (−1…+1) → vågklass — klassgränser ±0,5 som motorn. */
function klassFranTal(tal: unknown): VagKlass | null {
  if (!arTal(tal)) return null;
  if (tal >= 0.5) return "impulsvåg";
  if (tal <= -0.5) return "korrigering";
  return "basbygge";
}

/** Argmax av andelarna {impulsvåg, korrigering, basbygge, osatt} → medel-klass. */
function medelKlass(andelar: Record<string, unknown> | undefined): VagKlass | null {
  if (!andelar) return null;
  let basta: VagKlass | null = null;
  let mest = -1;
  for (const k of ["impulsvåg", "korrigering", "basbygge", "osatt"] as const) {
    const v = arTal(andelar[k]) ? (andelar[k] as number) : 0;
    if (v > mest) {
      mest = v;
      basta = k;
    }
  }
  return basta;
}

const VALUTA_TEXT: Record<string, string> = { SEK: "kr", USD: "$", EUR: "€", NOK: "kr", DKK: "kr", GBP: "£" };

function talText(v: number | null, decimaler = 2): string {
  if (v === null) return "—";
  return v.toLocaleString("sv-SE", { maximumFractionDigits: decimaler });
}

function prosentText(v: number | null): string {
  if (v === null) return "—";
  const tecken = v > 0 ? "+" : "";
  return `${tecken}${v.toLocaleString("sv-SE", { maximumFractionDigits: 1 })} %`;
}

/**
 * Fallback-urval: senast besökta aktieanalyser ur navigationsminnet (och
 * äldre "ak1a-senaste") → giltiga tickers, senaste först, unika, max 6.
 */
function lasLokalaTickers(): string[] {
  const ur: string[] = [];
  try {
    for (const b of besok()) if (typeof b?.sida === "string") ur.push(b.sida);
    const gammal = localStorage.getItem("ak1a-senaste");
    if (gammal) for (const p of JSON.parse(gammal) as Array<{ path?: unknown }>) if (typeof p?.path === "string") ur.push(p.path);
  } catch {
    /* privat läge etc. */
  }
  const sett = new Set<string>();
  const ut: string[] = [];
  for (const sida of ur) {
    const delar = sida.split("/").filter(Boolean);
    if (delar[0] !== "analyser" || delar.length < 2) continue;
    const ticker = delar[1].toUpperCase();
    if (!TICKER_RE.test(ticker) || sett.has(ticker)) continue;
    sett.add(ticker);
    ut.push(ticker);
    if (ut.length >= 6) break;
  }
  return ut;
}

/** Läs vågklasserna ur ett vagfundament-svar (total per horisont). */
function vagUrFundament(svar: VagfundamentSvar | null): Partial<Record<Horisont, VagKlass>> {
  const rad = svar?.tickers?.find((t) => !t.fel);
  if (!rad?.total) return {};
  const vager: Partial<Record<Horisont, VagKlass>> = {};
  for (const hz of HORIZONTER) {
    const k = klassFranTal(rad.total[hz]);
    if (k) vager[hz] = k;
  }
  return vager;
}

/** Läs vågklasserna ur analys-motorns vager-fält (djupanalys). */
function vagUrMotor(vager: Record<string, unknown> | undefined): Partial<Record<Horisont, VagKlass>> {
  if (!vager) return {};
  const ut: Partial<Record<Horisont, VagKlass>> = {};
  for (const hz of HORIZONTER) {
    const k = somKlass(vager[hz]);
    if (k) ut[hz] = k;
  }
  return ut;
}

/** Ikon-rad: ▲▼◼ per horisont, med tooltip. Komponentens minsta vågenhet. */
function VagIkoner({ vager, storlek = "text-xs" }: { vager: Partial<Record<Horisont, VagKlass>>; storlek?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${storlek}`} aria-hidden="true">
      {HORIZONTER.map((hz) => {
        const info = VAGINFO[vager[hz] ?? "osatt"];
        return (
          <span
            key={hz}
            className="font-bold"
            style={{ color: info.farg }}
            title={`${HZ_ETIKETT[hz]}: ${info.etikett}`}
          >
            {info.ikon}
          </span>
        );
      })}
    </span>
  );
}

// ── Komponenten ─────────────────────────────────────────────────────────────

export function MinPortfoljKort() {
  const [hydrerad, setHydrerad] = useState(false);
  const [medlem, setMedlem] = useState<Medlem | null>(null);
  const [laddar, setLaddar] = useState(true);
  const [rader, setRader] = useState<Rad[]>([]);
  const [totalVarde, setTotalVarde] = useState<number | null>(null);
  const [totalUtveckling, setTotalUtveckling] = useState<number | null>(null);
  const [vagProfil, setVagProfil] = useState<Partial<Record<Horisont, VagKlass>> | null>(null);
  const [lokaltLage, setLokaltLage] = useState(false);
  const [störning, setStörning] = useState("");

  useEffect(() => {
    const m = lasMedlem();
    setMedlem(m);
    setHydrerad(true);
    if (!m) return;

    let aktiv = true;
    const av = (sätt: () => void) => {
      if (aktiv) sätt();
    };

    (async () => {
      try {
        // 1) Portföljen via befintligt member-API
        const res = await fetch(`/api/member/portfolio?memberId=${encodeURIComponent(m.id)}`);
        const data = (await res.json()) as { portfolios?: Array<{ id?: unknown; holdings?: unknown }> };
        const listan = Array.isArray(data?.portfolios) ? data.portfolios : [];
        const vald = listan.find((p) => Array.isArray(p?.holdings) && (p.holdings as RåInnehav[]).length > 0);
        const holdings = (vald?.holdings as RåInnehav[] | undefined) ?? [];

        if (vald && holdings.length > 0) {
          // 2) Djupanalysen: SENASTE kurs (analys-motorn) + vågklass per horisont
          let djup: DjupSvar | null = null;
          try {
            const r2 = await fetch(`/api/member/portfolio/djupanalys?portfolioId=${encodeURIComponent(String(vald.id))}`);
            if (r2.ok) djup = (await r2.json()) as DjupSvar;
          } catch {
            /* fel nedan hanteras via fallback-priser */
          }
          const perTicker = new Map<string, { ticker?: unknown; analys?: DjupAnalysRad }>();
          for (const r of djup?.innehav ?? []) {
            const t = typeof r?.ticker === "string" ? r.ticker.toUpperCase() : "";
            if (t) perTicker.set(t, r);
          }

          const byggda: Rad[] = holdings
            .filter((h) => typeof h?.ticker === "string" && TICKER_RE.test(h.ticker))
            .map((h) => {
              const ticker = (h.ticker as string).toUpperCase();
              const a = perTicker.get(ticker)?.analys;
              const frisk = a && !a.fel ? a : null;
              const motorVager = vagUrMotor(frisk?.vager);
              const motorPris =
                frisk?.data && arTal(frisk.data.pris) ? frisk.data.pris : null;
              const pris =
                motorPris !== null
                  ? motorPris
                  : arTal(h.current_price)
                    ? (h.current_price as number)
                    : arTal(h.avg_cost)
                      ? (h.avg_cost as number)
                      : null;
              const antal = arTal(h.shares) ? (h.shares as number) : null;
              const snitt = arTal(h.avg_cost) ? (h.avg_cost as number) : null;
              const valuta = typeof frisk?.valuta === "string" ? frisk.valuta : null;
              return {
                ticker,
                bolag: typeof h.company === "string" && h.company ? h.company : ticker,
                antal,
                pris,
                valuta,
                snittKostnad: snitt,
                varde: antal !== null && pris !== null ? antal * pris : null,
                utvecklingProcent:
                  snitt !== null && snitt > 0 && pris !== null ? ((pris - snitt) / snitt) * 100 : null,
                vager: motorVager,
                vagKalla: Object.keys(motorVager).length > 0 ? "analys-motorn" : "ingen",
              };
            });

          // 3) Saknad vågdata? Fundamentalvågorna (/api/vagfundament) fyller i —
          //    max 4 extra anrop, mergeas INNAN raderna sätts (inget race).
          const saknade = byggda.filter((r) => r.vagKalla === "ingen").slice(0, 4);
          if (saknade.length > 0) {
            const fyll = await Promise.all(
              saknade.map(async (r): Promise<{ ticker: string; vager: Partial<Record<Horisont, VagKlass>> } | null> => {
                try {
                  const res = await fetch(`/api/vagfundament?ticker=${encodeURIComponent(r.ticker)}`);
                  if (!res.ok) return null;
                  const vager = vagUrFundament((await res.json()) as VagfundamentSvar);
                  return Object.keys(vager).length > 0 ? { ticker: r.ticker, vager } : null;
                } catch {
                  return null; /* vågprofilen får vara osatt — ärligt */
                }
              })
            );
            for (const f of fyll) {
              if (!f) continue;
              const rad = byggda.find((b) => b.ticker === f.ticker && b.vagKalla === "ingen");
              if (rad) {
                rad.vager = f.vager;
                rad.vagKalla = "vagfundamentet";
              }
            }
          }

          // 4) Portföljens medel-vågklass per horisont (viktat argmax ur motorn)
          const profil: Partial<Record<Horisont, VagKlass>> = {};
          for (const hz of HORIZONTER) {
            const k = medelKlass(djup?.portfolj?.vagProfil?.[hz]);
            if (k) profil[hz] = k;
          }

          const medVarden = byggda.filter((r) => r.varde !== null);
          const summaVarde = medVarden.reduce((s, r) => s + (r.varde ?? 0), 0);
          const medSnitt = byggda.filter((r) => r.antal !== null && r.snittKostnad !== null);
          const summaKostnad = medSnitt.reduce((s, r) => s + (r.antal ?? 0) * (r.snittKostnad ?? 0), 0);

          av(() => {
            setRader(byggda);
            setTotalVarde(summaVarde > 0 ? summaVarde : null);
            setTotalUtveckling(
              summaKostnad > 0 && summaVarde > 0 && medVarden.length === medSnitt.length
                ? ((summaVarde - summaKostnad) / summaKostnad) * 100
                : null
            );
            setVagProfil(Object.keys(profil).length > 0 ? profil : null);
            setLaddar(false);
          });
        } else {
          // 5) Ingen sparad portfölj → lokala tickers (senaste besökta analyser)
          const tickers = lasLokalaTickers();
          if (tickers.length === 0) {
            av(() => setLaddar(false));
            return;
          }
          const lokala: Rad[] = tickers.map((t) => ({
            ticker: t,
            bolag: t,
            antal: null,
            pris: null,
            valuta: null,
            snittKostnad: null,
            varde: null,
            utvecklingProcent: null,
            vager: {},
            vagKalla: "ingen",
          }));
          av(() => {
            setRader(lokala);
            setLokaltLage(true);
            setLaddar(false);
          });
          await Promise.all(
            tickers.map(async (t) => {
              try {
                const res = await fetch(`/api/vagfundament?ticker=${encodeURIComponent(t)}`);
                if (!res.ok) return;
                const vager = vagUrFundament((await res.json()) as VagfundamentSvar);
                if (Object.keys(vager).length === 0) return;
                av(() => {
                  setRader((föregående) =>
                    föregående.map((rad) => (rad.ticker === t ? { ...rad, vager, vagKalla: "vagfundamentet" } : rad))
                  );
                });
              } catch {
                /* tyst — vågprofilen får vara osatt */
              }
            })
          );
        }
      } catch {
        av(() => {
          setStörning("Portföljen kunde inte hämtas just nu — dina innehav väntar tryggt, prova igen om en stund.");
          setLaddar(false);
        });
      }
    })();

    return () => {
      aktiv = false;
    };
  }, []);

  // ── Skelett under hydrering (deterministiskt på server + klient) ──
  if (!hydrerad) {
    return (
      <div className="space-y-3" aria-hidden="true">
        <div className="h-10 animate-pulse rounded-xl border border-gold/20 bg-card" />
        <div className="h-48 animate-pulse rounded-2xl border border-gold/20 bg-card" />
      </div>
    );
  }

  // ── UTAN INLOGGNING: portföljen väntar ──
  if (!medlem) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Din portfölj</p>
            <h2 className="mt-2 font-serif text-xl font-bold tracking-tight sm:text-2xl">
              Din portfölj väntar
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Din portfölj väntar — logga in gratis för att spara dina innehav.
              Kurser, värde, utveckling och varje akties vågprofil samlas här,
              pedagogiskt genomlyst — inte investeringsråd.
            </p>
          </div>
          <Link
            href="/logga-in"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-gold px-6 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
          >
            Logga in gratis
          </Link>
        </div>
      </section>
    );
  }

  // ── INLOGGAD ──
  const valutaSuffix = (() => {
    const med = rader.map((r) => r.valuta).filter((v): v is string => !!v);
    return med.length > 0 && med.every((v) => v === med[0]) ? ` ${VALUTA_TEXT[med[0]] ?? med[0]}` : "";
  })();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />

      <div className="relative">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Din portfölj</p>
          <Link
            href="/min-portfolj"
            className="inline-flex min-h-[44px] items-center text-xs font-semibold text-gold hover:underline"
          >
            Öppna Portföljen →
          </Link>
        </div>
        <h2 className="mt-2 font-serif text-xl font-bold tracking-tight sm:text-2xl">
          {lokaltLage ? "Aktier du senast studerade" : "Dina innehav — på ett steg"}
        </h2>
        {lokaltLage && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Din sparade portfölj hittades inte på servern — här visas de aktieanalyser
            du senast besökte (sparat lokalt hos dig). Lägg till innehav i Portföljen
            så visas kurser, värden och vågprofiler här.
          </p>
        )}

        {störning && <p className="mt-3 text-xs italic text-muted-foreground">{störning}</p>}

        {laddar ? (
          <div className="mt-6 space-y-2" aria-busy="true" aria-live="polite">
            <p className="text-xs text-muted-foreground">Hämtar din portfölj…</p>
            <div className="h-9 animate-pulse rounded-lg border border-gold/20 bg-muted" />
            <div className="h-9 animate-pulse rounded-lg border border-gold/20 bg-muted" />
            <div className="h-9 animate-pulse rounded-lg border border-gold/20 bg-muted" />
          </div>
        ) : rader.length === 0 ? (
          /* UTAN PORTFÖLJ */
          <div className="mt-6 rounded-xl border border-gold/25 bg-paper/60 p-6 text-center">
            <p className="text-2xl" aria-hidden="true">
              📈
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Din portfölj är ännu tom — varje stor analysresa börjar med ett
              första innehav, och vi går bredvid dig hela vägen.
            </p>
            <Link
              href="/min-portfolj"
              className="btn-marin mt-4 inline-flex min-h-[44px] items-center px-5 text-sm"
            >
              Lägg till innehav i Portföljen →
            </Link>
          </div>
        ) : (
          <>
            {/* Tabellen: ticker, bolag, antal, senaste kurs, värde, utveckling, vågprofil */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/20 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <th scope="col" className="py-2 pr-3 font-semibold">Innehav</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Antal</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Senaste kurs</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Värde</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Utveckling</th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Vågprofil
                      <span className="ml-1 normal-case tracking-normal text-muted-foreground/70">
                        (mikro → mega)
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rader.map((r) => {
                    const utvFarg = r.utvecklingProcent === null ? "text-muted-foreground" : r.utvecklingProcent >= 0 ? "text-bull" : "text-bear";
                    return (
                      <tr key={r.ticker} className="border-b border-gold/10 last:border-0">
                        <td className="py-3 pr-3">
                          <p className="font-bold text-foreground">{r.ticker}</p>
                          <p className="max-w-[220px] truncate text-[11px] text-muted-foreground">{r.bolag}</p>
                        </td>
                        <td className="py-3 pr-3 text-right tabular-nums text-muted-foreground">
                          {talText(r.antal, 0)}
                        </td>
                        <td className="py-3 pr-3 text-right tabular-nums text-foreground">
                          {talText(r.pris)}
                        </td>
                        <td className="py-3 pr-3 text-right tabular-nums text-foreground">
                          {r.varde === null ? "—" : `${talText(r.varde, 0)}${valutaSuffix}`}
                        </td>
                        <td className={`py-3 pr-3 text-right font-semibold tabular-nums ${utvFarg}`}>
                          {prosentText(r.utvecklingProcent)}
                        </td>
                        <td className="py-3 text-right">
                          <VagIkoner vager={r.vager} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totalvärde + utveckling */}
            {totalVarde !== null && (
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 border-t border-gold/20 pt-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Portföljens totalvärde — senaste kurs
                </p>
                <p className="font-serif text-2xl font-black tracking-tight text-gold">
                  {talText(totalVarde, 0)}
                  {valutaSuffix}
                  {totalUtveckling !== null && (
                    <span
                      className={`ml-3 align-middle text-sm font-bold tabular-nums ${totalUtveckling >= 0 ? "text-bull" : "text-bear"}`}
                    >
                      {prosentText(totalUtveckling)}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Portföljen som helhet — 5 horisont-chips med medel-vågklass */}
            {vagProfil && (
              <div className="mt-4 rounded-xl border border-gold/25 bg-paper/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Portföljen som helhet — medel-vågklass per horisont
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {HORIZONTER.map((hz) => {
                    const info = VAGINFO[vagProfil[hz] ?? "osatt"];
                    return (
                      <span
                        key={hz}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-gold/30 bg-card px-4 text-xs font-semibold text-foreground"
                        title={`${HZ_ETIKETT[hz]}: ${info.etikett}`}
                      >
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {HZ_ETIKETT[hz]}
                        </span>
                        <span className="text-sm font-bold" style={{ color: info.farg }} aria-hidden="true">
                          {info.ikon}
                        </span>
                        <span style={{ color: info.farg }}>{info.etikett}</span>
                      </span>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
                  ▲ impulsvåg · ◼ basbygge · ▼ korrigering · · osatt — viktat
                  genomsnitt ur analys-motorn (AK1TS: 5 teorier × 5 horisonter ×
                  4 dimensioner). En-guide, inte en uppmaning.
                </p>
              </div>
            )}

            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
              Kurser och vågklasser är analys-motorns senaste mätning ur
              pris/volymdata (Yahoo Finance primärt) — fördröjningar kan förekomma.
              Pedagogiskt verktyg — inte investeringsråd.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
