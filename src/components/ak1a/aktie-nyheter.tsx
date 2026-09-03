"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { lasMedlem, type Medlem } from "@/lib/member-local";
import { besok } from "@/lib/navigationsminne";

/**
 * AKTIE-NYHETER — nyheter om medlemmens EGNA aktier, direkt i Min Sida.
 *
 * Användarens direktiv: "nyheter om samma aktier ska kopplas". Komponenten
 * hämtar medlemmens tickers ur portföljen (/api/member/portfolio — fallback:
 * senast besökta aktieanalyser i navigationsminnet) och hämtar senaste
 * nyheterna per ticker via Yahoos search-news-API
 * (v1/finance/search?q=TICKER&newsCount=3 — allow-list query1/query2, 6 s
 * timeout, User-Agent "Mozilla/5.0 (AK1A)"), max 6 nyheter visas.
 *
 * Hydration-säkert: localStorage + nät händer ENDAST i useEffect — första
 * passt är ett deterministiskt skelett. Alltid graceful: utan nyheter visar
 * kortet sitt lugna viloläge ("marknaden andas") — aldrig ett felmeddelande
 * i eleven ansiktet. Pedagogisk koppling: nyheter läses tillsammans med
 * Vågkartan. Information — inte investeringsråd.
 */

// ── Nyhets-API: allow-listade värdar + gränser ──────────────────────────────

const NEWS_VARDAR = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"] as const;
const TIMEOUT_MS = 6000;
const MAX_NYHETER = 6;
const MAX_TICKERS = 6;

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

type Nyhet = {
  ticker: string;
  rubrik: string;
  kalla: string | null;
  lank: string | null;
  tidSec: number | null;
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

/**
 * Hämta senaste nyheterna för EN ticker — query1 först, query2 som reserv,
 * 6 s timeout per försök. Ogiltigt/saknat svar → tom lista (tyst, graceful).
 * Obs: User-Agent sätts för proxade/server-side-anrop; webbläsare ignorerar
 * rubriken av säkerhetsskäl (fetchen fungerar ändå där CORS tillåter).
 */
async function hamtaNyheter(ticker: string): Promise<Nyhet[]> {
  for (const vard of NEWS_VARDAR) {
    try {
      const kontroll = new AbortController();
      const tidtagning = setTimeout(() => kontroll.abort(), TIMEOUT_MS);
      const res = await fetch(
        `https://${vard}/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=3`,
        {
          signal: kontroll.signal,
          headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (AK1A)" },
        }
      );
      clearTimeout(tidtagning);
      if (!res.ok) continue;
      const json = (await res.json()) as { news?: Array<Record<string, unknown>> };
      const lista = Array.isArray(json?.news) ? json.news : [];
      const ut: Nyhet[] = [];
      for (const n of lista) {
        if (typeof n?.title !== "string" || !n.title) continue;
        ut.push({
          ticker,
          rubrik: n.title,
          kalla: typeof n.publisher === "string" && n.publisher ? n.publisher : null,
          lank: typeof n.link === "string" && /^https:\/\//.test(n.link) ? n.link : null,
          tidSec: arTal(n.providerPublishTime) ? n.providerPublishTime : null,
        });
        if (ut.length >= 3) break;
      }
      if (ut.length > 0) return ut;
    } catch {
      /* nästa värd — och till sist ett tyst viloläge */
    }
  }
  return [];
}

/** Kort, vänlig svensk tidsangivelse — körs klient-side efter hydrering. */
function tidText(tidSec: number | null): string {
  if (tidSec === null) return "";
  const millis = tidSec * 1000;
  if (Number.isNaN(millis)) return "";
  const deltaMin = Math.round((Date.now() - millis) / 60000);
  if (deltaMin < 1) return "just nu";
  if (deltaMin < 60) return `för ${deltaMin} min sedan`;
  const deltaTim = Math.round(deltaMin / 60);
  if (deltaTim < 24) return `för ${deltaTim} tim sedan`;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" }).format(new Date(millis));
}

// ── Komponenten ─────────────────────────────────────────────────────────────

export function AktieNyheter() {
  const [hydrerad, setHydrerad] = useState(false);
  const [medlem, setMedlem] = useState<Medlem | null>(null);
  const [nyheter, setNyheter] = useState<Nyhet[]>([]);
  const [hamtar, setHamtar] = useState(true);

  useEffect(() => {
    const m = lasMedlem();
    setMedlem(m);
    setHydrerad(true);

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

      // 2) Nyheter per ticker — i omgångar om 3, tyst vid motstånd
      const alla: Nyhet[] = [];
      for (let i = 0; i < tickers.length; i += 3) {
        const grupp = await Promise.all(tickers.slice(i, i + 3).map((t) => hamtaNyheter(t)));
        for (const lista of grupp) alla.push(...lista);
      }
      alla.sort((a, b) => (b.tidSec ?? 0) - (a.tidSec ?? 0));
      if (aktiv) {
        setNyheter(alla.slice(0, MAX_NYHETER));
        setHamtar(false);
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
        <div className="h-40 animate-pulse rounded-2xl border border-gold/20 bg-card" />
      </div>
    );
  }

  return (
    <section className="marin-panel relative overflow-hidden rounded-2xl border border-gold/30 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">Nyheter om dina aktier</p>
        <h2 className="mt-2 font-serif text-xl font-bold tracking-tight text-gold-soft sm:text-2xl">
          Vad marknaden Just skriver — om just dina bolag
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-[#EDE6D6]/70">
          {medlem
            ? "Senaste nyheterna hämtas för varje aktie i din portfölj — samma bolag, samma verklighet, ett steg."
            : "Logga in gratis så kopplas nyheterna till aktierna i din portfölj — tills dess visar vi viloläget."}
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
            {nyheter.map((n) => (
              <li key={`${n.ticker}-${n.rubrik}`}>
                <a
                  href={n.lank ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[44px] items-center gap-3 py-3"
                  {...(n.lank ? {} : { "aria-disabled": "true" })}
                >
                  <span className="inline-flex min-h-[28px] shrink-0 items-center rounded-full border border-gold/40 bg-gold/10 px-3 text-[10px] font-bold tracking-wider text-gold">
                    {n.ticker}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold leading-snug text-[#EDE6D6] group-hover:text-gold-soft group-hover:underline">
                      {n.rubrik}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#EDE6D6]/60">
                      {[n.kalla, tidText(n.tidSec)].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Pedagogisk notering + disclaimer */}
        <div className="mt-5 border-t border-gold/10 pt-4">
          <p className="text-xs italic leading-relaxed text-[#EDE6D6]/80">
            Nyheter förändrar vågor — läs dem tillsammans med din{" "}
            <Link href="/vagfundament" className="font-semibold text-gold-soft hover:underline">
              Vågkarta
            </Link>
            .
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-[#EDE6D6]/50">
            Källa: Yahoo Finance (via det publika search-news-API:et).
            Fördröjda och ofullständiga nyhetsflöden kan förekomma — information,
            inte investeringsråd.
          </p>
        </div>
      </div>
    </section>
  );
}
