"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { lasMedlem, type Medlem } from "@/lib/member-local";
import { besok } from "@/lib/navigationsminne";

/**
 * SENASTE NYTT — "Senaste nytt — för dig"-kortet i Min Sida.
 * (Filnamn + export-namn "AktieNyheter" behålls för backwards-compat.)
 *
 * Användarens direktiv: "nyheter om samma aktier ska kopplas" + "info för
 * klienter". Komponenten hämtar medlemmens tickers ur portföljen
 * (/api/member/portfolio — fallback: senast besökta aktieanalyser i
 * navigationsminnet) och gör ETT anrop till /api/nyheter med tickers + 1–2
 * ämnen. Servern cachar källor, filtrerar ämnen och rangordnar påverkan —
 * här slipper vi CORS/allow-list-logiken helt.
 *
 * Visar 5 nyheter: rubrik, källa + relativ tid, påverkans-badge (≥ 70 =
 * "Hög påverkan" i guld), ticker-chips och AK1A:ts fundering (1 rad —
 * expanderas vid klick). "NYTT"-märket jämförs mot localStorage-nyckeln
 * "ak1a-nyheter-senaste" (senaste besökets tid) och stämpeln flyttas fram
 * först EFTER det att flödet renderats.
 *
 * Vid hämtning sparas dagens tyngsta nyhet (högst paverkan, senaste dygnet)
 * i "ak1a-nyheter-top" — notiser.ts bygger därifrån auto-notis-typ "nyhet".
 *
 * Hydration-säkert: localStorage + nät händer ENDAST i useEffect — första
 * passt är ett deterministiskt skelett. Alltid graceful: utan nyheter visar
 * kortet sitt lugna viloläge ("marknaden andas") — aldrig ett felmeddelande
 * i eleven ansiktet. Pedagogisk koppling: nyheter läses tillsammans med
 * Vågkartan. Information — inte investeringsråd.
 */

// ── Gränser + nycklar ───────────────────────────────────────────────────────

const TIMEOUT_MS = 8000;
const MAX_NYHETER = 5;
const MAX_TICKERS = 6;
const HOG_PAVERKAN = 70;

/**
 * Ämneskanaler till /api/nyheter — id:n ur nyhets-motorns STANDARD_AMNESKANALER
 * (verifierade RSS-flöden; "rapporter"/"analys" var ogiltiga id:n som motorn
 * tyställde — nu bär vi svenska ekonomikanaler som påfyllnad när portföljen
 * är tyst). Servern cachar + rankar per kanal.
 */
const AMNEN = ["di", "svt-ekonomi"];
/** Reservkälla: om det personliga flödet faller hämtas motorns allmänna
 *  kanaler — ALDRIG tyst: UI:t märker flödet "Reservkälla". */
const RESERV_AMNEN = ["svt-ekonomi"];

/** localStorage: senaste besök (epoch ms) — nyheter nyare än detta → "NYTT". */
const NYCKEL_SENASTE = "ak1a-nyheter-senaste";
/** localStorage: dagens högsta påverkannyhet — läs av notiser.ts (typ "nyhet"). */
const NYCKEL_TOPP = "ak1a-nyheter-top";

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

// ── Typer ───────────────────────────────────────────────────────────────────

/** Rå nyhet från /api/nyheter — allt unknown, städas i renNyhet(). */
type ApiNyhet = {
  id?: unknown;
  rubrik?: unknown;
  kalla?: unknown;
  lank?: unknown;
  tid?: unknown;
  tickers?: unknown;
  kanal?: unknown;
  paverkan?: unknown;
  ak1aNot?: unknown;
};

/** Rensad nyhet för visning. */
type RenNyhet = {
  id: string;
  rubrik: string;
  kalla: string | null;
  lank: string | null;
  tidMs: number | null;
  tickers: string[];
  paverkan: number;
  tanke: string | null;
  vVariabler: string[];
};

/** client_holdings-rad ur GET /api/member/portfolio. */
type RåInnehav = {
  ticker?: unknown;
  shares?: unknown;
  avg_cost?: unknown;
  current_price?: unknown;
};

function arTal(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

// ── Städning av serverns svar ───────────────────────────────────────────────

/** Tid från API:et → epoch ms. Tal = sekunder (eller ms om redan stort),
 *  sträng = ISO-8601. Ogiltigt → null (tiden visas helt enkelt inte). */
function tidTillMs(t: unknown): number | null {
  if (arTal(t)) return t > 1e12 ? t : t * 1000;
  if (typeof t === "string" && t) {
    const ms = Date.parse(t);
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}

/** Okänd JSON → RenNyhet (eller null när rubriken saknas — tyst, graceful). */
function renNyhet(rå: unknown): RenNyhet | null {
  if (!rå || typeof rå !== "object") return null;
  const n = rå as ApiNyhet;
  if (typeof n.rubrik !== "string" || !n.rubrik.trim()) return null;

  const tickers = Array.isArray(n.tickers)
    ? n.tickers
        .filter((t): t is string => typeof t === "string" && TICKER_RE.test(t))
        .slice(0, MAX_TICKERS)
    : [];

  const ak1aNot =
    n.ak1aNot && typeof n.ak1aNot === "object"
      ? (n.ak1aNot as { vVariables?: unknown; tanke?: unknown })
      : null;
  const tanke =
    typeof ak1aNot?.tanke === "string" && ak1aNot.tanke.trim() ? ak1aNot.tanke.trim() : null;
  const vVariabler = Array.isArray(ak1aNot?.vVariables)
    ? ak1aNot.vVariables
        .filter((v): v is string => typeof v === "string" && !!v.trim())
        .map((v) => v.trim())
        .slice(0, 4)
    : [];

  return {
    id: typeof n.id === "string" && n.id ? n.id : `${n.rubrik}-${tickers[0] ?? ""}`,
    rubrik: n.rubrik.trim(),
    kalla: typeof n.kalla === "string" && n.kalla ? n.kalla : null,
    lank: typeof n.lank === "string" && /^https:\/\//.test(n.lank) ? n.lank : null,
    tidMs: tidTillMs(n.tid),
    tickers,
    paverkan: arTal(n.paverkan) ? Math.min(100, Math.max(0, Math.round(n.paverkan))) : 0,
    tanke,
    vVariabler,
  };
}

/** Resultat av flödishämtningen — reservkalla=true när det personliga
 *  flödet föll och motorns allmänna kanaler fick bära (märt i UI:t). */
type FlodeResultat = { nyheter: RenNyhet[]; reservkalla: boolean };

/** ETT anrop till /api/nyheter med given query — returnerar råa rader. */
async function anropaNyhetsApi(query: string): Promise<unknown[]> {
  const kontroll = new AbortController();
  const tidtagning = setTimeout(() => kontroll.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`/api/nyheter${query}`, {
      signal: kontroll.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { nyheter?: unknown };
    return Array.isArray(data?.nyheter) ? data.nyheter : [];
  } finally {
    clearTimeout(tidtagning);
  }
}

/** Hämta flödet via NYHETS-MOTORN (/api/nyheter): först med elevens tickers +
 *  ämneskanaler (servern cachar och rangordnar), och ENDAST om det anropet
 *  misslyckas (nät/timeout/!ok) motorns allmänna kanaler som märkt reserv-
 *  källa — aldrig en tyst ersättare. Tyst vid totalt motstånd (viloläge). */
async function hamtaFlode(tickers: string[]): Promise<FlodeResultat> {
  const rensa = (rader: unknown[]): RenNyhet[] => {
    const ut: RenNyhet[] = [];
    for (const rå of rader) {
      const n = renNyhet(rå);
      if (n) ut.push(n);
    }
    return ut;
  };

  try {
    const query =
      `?tickers=${tickers.map(encodeURIComponent).join(",")}` +
      `&amnen=${AMNEN.map(encodeURIComponent).join(",")}`;
    const rader = await anropaNyhetsApi(query);
    return { nyheter: rensa(rader), reservkalla: false };
  } catch {
    /* det personliga flödet nådde inte fram — reservkällan får bära, märkt */
  }

  try {
    const rader = await anropaNyhetsApi(
      `?amnen=${RESERV_AMNEN.map(encodeURIComponent).join(",")}`,
    );
    return { nyheter: rensa(rader), reservkalla: true };
  } catch {
    return { nyheter: [], reservkalla: false }; // motor + reserv tysta — viloläge
  }
}

/** Senast besökta aktieanalyser → tickers (fallback när portföljen är tom). */
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
    if (ut.length >= MAX_TICKERS) break;
  }
  return ut;
}

/** Kort, vänlig svensk tidsangivelse — körs klient-side efter hydrering. */
function tidText(tidMs: number | null): string {
  if (tidMs === null) return "";
  const deltaMin = Math.round((Date.now() - tidMs) / 60000);
  if (deltaMin < 1) return "just nu";
  if (deltaMin < 60) return `för ${deltaMin} min sedan`;
  const deltaTim = Math.round(deltaMin / 60);
  if (deltaTim < 24) return `för ${deltaTim} tim sedan`;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" }).format(new Date(tidMs));
}

// ── Komponenten ─────────────────────────────────────────────────────────────

export function AktieNyheter() {
  const [hydrerad, setHydrerad] = useState(false);
  const [medlem, setMedlem] = useState<Medlem | null>(null);
  const [nyheter, setNyheter] = useState<RenNyhet[]>([]);
  const [hamtar, setHamtar] = useState(true);
  const [reserv, setReserv] = useState(false);
  const [senasteBesok, setSenasteBesok] = useState(0); // 0 = aldrig sett → inga NYTT-märken
  const [oppnadeTankar, setOppnadeTankar] = useState<string[]>([]);

  useEffect(() => {
    const m = lasMedlem();
    setMedlem(m);
    setHydrerad(true);

    // Senaste besöks-stämpeln → "NYTT"-jämförelsen (finns ej = lugnt första gången)
    try {
      const rå = localStorage.getItem(NYCKEL_SENASTE);
      const tal = rå ? Number(rå) : NaN;
      if (Number.isFinite(tal) && tal > 0) setSenasteBesok(tal);
    } catch {
      /* privat läge etc. */
    }

    let aktiv = true;

    (async () => {
      // 1) Tickers ur portföljen (eller senast besökta analyser som fallback)
      let tickers: string[] = [];
      try {
        if (m) {
          const res = await fetch(`/api/member/portfolio?memberId=${encodeURIComponent(m.id)}`);
          const data = (await res.json()) as { portfolios?: Array<{ holdings?: unknown }> };
          const listan = Array.isArray(data?.portfolios) ? data.portfolios : [];
          const vald = listan.find((p) => Array.isArray(p?.holdings) && (p.holdings as RåInnehav[]).length > 0);
          const holdings = (vald?.holdings as RåInnehav[] | undefined) ?? [];
          // Tyngsta innehaven först — nyheterna följer pengarna
          const medVikt = holdings
            .filter((h) => typeof h?.ticker === "string" && TICKER_RE.test(h.ticker))
            .map((h) => {
              const antal = arTal(h.shares) ? (h.shares as number) : 0;
              const pris = arTal(h.current_price) ? (h.current_price as number) : arTal(h.avg_cost) ? (h.avg_cost as number) : 0;
              return { ticker: (h.ticker as string).toUpperCase(), vikt: antal * pris };
            })
            .sort((a, b) => b.vikt - a.vikt);
          const sett = new Set<string>();
          for (const r of medVikt) {
            if (sett.has(r.ticker)) continue;
            sett.add(r.ticker);
            tickers.push(r.ticker);
            if (tickers.length >= MAX_TICKERS) break;
          }
        }
      } catch {
        /* portföljen nådde inte fram — lokala tickers får räcka */
      }
      if (tickers.length === 0) tickers = lasLokalaTickers().slice(0, MAX_TICKERS);

      if (tickers.length === 0) {
        if (aktiv) setHamtar(false);
        return;
      }

      // 2) ETT anrop till Nyhetscentralen — servern cachar + rankar; faller
      //    det hämtas motorns allmänna kanaler som MÄRKT reservkälla.
      const flode = await hamtaFlode(tickers);
      if (!aktiv) return;
      setNyheter(flode.nyheter.slice(0, MAX_NYHETER));
      setReserv(flode.reservkalla && flode.nyheter.length > 0);
      setHamtar(false);

      // 3) Spara dagens tyngsta nyhet (senaste dygnet) åt notiserna (typ "nyhet")
      const nu = Date.now();
      let topp: RenNyhet | null = null;
      for (const n of flode.nyheter) {
        if (n.tidMs === null || nu - n.tidMs > 86_400_000) continue;
        if (!topp || n.paverkan > topp.paverkan) topp = n;
      }
      if (topp) {
        try {
          localStorage.setItem(
            NYCKEL_TOPP,
            JSON.stringify({
              dag: new Date().toISOString().slice(0, 10), // samma UTC-konvention som notiser.ts
              rubrik: topp.rubrik.slice(0, 200),
              paverkan: topp.paverkan,
            })
          );
        } catch {
          /* privat läge — notisen får vänta */
        }
      }
    })();

    return () => {
      aktiv = false;
    };
  }, []);

  // Först NÄR flödet renderats: flytta fram "sedan senast"-stämpeln, så märks
  // nästa besök enbart av det som kommit efter detta.
  useEffect(() => {
    if (!hydrerad || hamtar) return;
    try {
      localStorage.setItem(NYCKEL_SENASTE, String(Date.now()));
    } catch {
      /* privat läge etc. */
    }
  }, [hydrerad, hamtar]);

  const vaxlaTanke = (id: string) =>
    setOppnadeTankar((nu) => (nu.includes(id) ? nu.filter((x) => x !== id) : [...nu, id]));

  // ── Skelett under hydrering (deterministiskt på server + klient) ──
  if (!hydrerad) {
    return (
      <div className="space-y-3" aria-hidden="true">
        <div className="h-10 animate-pulse rounded-xl border border-gold/20 bg-card" />
        <div className="h-40 animate-pulse rounded-2xl border border-gold/20 bg-card" />
      </div>
    );
  }

  return (
    <section className="marin-panel relative overflow-hidden rounded-2xl border border-gold/30 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">Ditt nyhetsflöde</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="font-serif text-xl font-bold tracking-tight text-gold-soft sm:text-2xl">
            Senaste nytt — för dig
          </h2>
          {/* Reservkälla — ALDRIG tyst degradering: märks synligt när det
              personliga flödet föll och motorns allmänna kanaler bär */}
          {reserv && (
            <span
              className="inline-flex items-center rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-gold"
              title="Ditt personliga flöde nådde inte fram just nu — nyhetsmotorn serverar sitt allmänna rankade flöde i stället."
            >
              Reservkälla — allmänt flöde
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#EDE6D6]/70">
          {medlem
            ? "Flödet följer aktierna i din portfölj — rangordnat efter påverkan, färdigt att läsas tillsammans med din Vågkarta."
            : "Logga in gratis så följer flödet aktierna i din portfölj — tills dess visar vi viloläget."}
        </p>

        {hamtar ? (
          <div className="mt-5 space-y-2" aria-busy="true" aria-live="polite">
            <p className="text-xs text-[#EDE6D6]/70">Lyssnar efter nyhetsflödet…</p>
            <div className="h-11 animate-pulse rounded-lg border border-gold/20 bg-white/5" />
            <div className="h-11 animate-pulse rounded-lg border border-gold/20 bg-white/5" />
            <div className="h-11 animate-pulse rounded-lg border border-gold/20 bg-white/5" />
          </div>
        ) : nyheter.length === 0 ? (
          /* UTAN NYHETER — viloläget */
          <div className="mt-5 rounded-xl border border-gold/25 bg-card/60 p-6 text-center">
            <p className="text-2xl" aria-hidden="true">
              🌊
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              Inga aktuella nyheter — marknaden andas.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Ibland är tystnaden själva nyheten. Vila i den — din Vågkarta
              mäter vidare under ytan.
            </p>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-gold/10">
            {nyheter.map((n) => {
              const arNy = senasteBesok > 0 && n.tidMs !== null && n.tidMs > senasteBesok;
              const hogPaverkan = n.paverkan >= HOG_PAVERKAN;
              const oppnad = oppnadeTankar.includes(n.id);
              return (
                <li key={n.id} className="py-3">
                  <div className="flex items-start gap-3">
                    {n.tickers.length > 0 && (
                      <span className="flex shrink-0 flex-col items-start gap-1 pt-0.5">
                        {n.tickers.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-gold"
                          >
                            {t}
                          </span>
                        ))}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <a
                        href={n.lank ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                        {...(n.lank ? {} : { "aria-disabled": "true" })}
                      >
                        <span className="block truncate text-sm font-semibold leading-snug text-[#EDE6D6] group-hover:text-gold-soft group-hover:underline">
                          {n.rubrik}
                        </span>
                      </a>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[11px] text-[#EDE6D6]/60">
                          {[n.kalla, tidText(n.tidMs)].filter(Boolean).join(" · ") || "Nyhetscentralen"}
                        </span>
                        {hogPaverkan ? (
                          <span className="inline-flex items-center rounded-full border border-gold/60 bg-gold/20 px-2 py-0.5 text-[10px] font-bold tracking-wide text-gold">
                            Hög påverkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-gold/20 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-[#EDE6D6]/60">
                            Påverkan {n.paverkan}
                          </span>
                        )}
                        {arNy && (
                          <span className="inline-flex items-center rounded-full bg-gold px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0E1B2E]">
                            Nytt
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AK1A:ts fundering — en rad, vecklas ut vid klick */}
                  {n.tanke && (
                    <button
                      type="button"
                      onClick={() => vaxlaTanke(n.id)}
                      aria-expanded={oppnad}
                      className="mt-2 block w-full rounded-lg border border-gold/15 bg-gold/5 px-3 py-1.5 text-left transition-colors hover:border-gold/40"
                    >
                      <span className="flex w-full items-start gap-2">
                        <span className="mt-px shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-soft">
                          AK1A
                        </span>
                        <span
                          className={`min-w-0 flex-1 text-xs leading-relaxed text-[#EDE6D6]/75 ${oppnad ? "" : "truncate"}`}
                        >
                          {n.tanke}
                        </span>
                        <span aria-hidden="true" className="shrink-0 self-center text-[10px] text-gold-soft">
                          {oppnad ? "▲" : "▼"}
                        </span>
                      </span>
                      {oppnad && n.vVariabler.length > 0 && (
                        <span className="mt-1.5 flex flex-wrap gap-1 border-t border-gold/10 pt-1.5">
                          {n.vVariabler.map((v) => (
                            <span
                              key={v}
                              className="rounded border border-gold/25 px-1.5 py-0.5 text-[10px] font-semibold text-gold-soft/90"
                            >
                              {v}
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Footer: hela Nyhetscentralen + kanalhantering */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gold/10 pt-4">
          <Link href="/nyheter" className="text-xs font-semibold text-gold-soft hover:underline">
            Visa alla i Nyhetscentralen →
          </Link>
          <Link href="/nyheter#kanaler" className="text-xs font-semibold text-gold-soft/80 hover:underline">
            Hantera kanaler →
          </Link>
        </div>

        {/* Pedagogisk notering + disclaimer */}
        <div className="mt-4">
          <p className="text-xs italic leading-relaxed text-[#EDE6D6]/80">
            Nyheter förändrar vågor — läs dem tillsammans med din{" "}
            <Link href="/vagfundament" className="font-semibold text-gold-soft hover:underline">
              Vågkarta
            </Link>
            .
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-[#EDE6D6]/50">
            Källa: Nyhetscentralen (server-side hämtning — cachad och rangordnad).
            Fördröjda och ofullständiga nyhetsflöden kan förekomma — information,
            inte investeringsråd.
          </p>
        </div>
      </div>
    </section>
  );
}
