"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { lasMedlem, type Medlem } from "@/lib/member-local";
import { besok } from "@/lib/navigationsminne";
import {
  AMNESKANALER,
  lasKanaler,
  lagTillBevakning,
  lagTillRss,
  taBortBevakning,
  taBortRss,
  togglAamne,
  sattPortfoljTickers,
  type KanalResultat,
  type NyhetsKanaler,
} from "@/lib/nyhetskanaler";

/**
 * NYHETSCENTRALEN — kundens nyhetsrum med utvidgbara kanaler.
 *
 * Dataflöde (hydration-säkert — allt lokalt/nät sker i useEffect; första
 * passt är ett deterministiskt skelett):
 *   1. lasMedlem + portfölj-tickers (/api/member/portfolio, fallback:
 *      senast besökta aktieanalyser i navigationsminnet — samma mönster
 *      som aktie-nyheter.tsx)
 *   2. lasKanaler() — elevens bevakning, ämneskanaler och egna RSS-flöden
 *   3. fetch /api/nyheter?tickers=…&bevakning=…&amnen=…&rss=… (motorn
 *      rangerar intelligent — listordningen från API:t respekteras)
 *
 * ALDRIG köp/sälj: påverkanspoängen och AK1A-noteringen är pedagogiskt
 * underlag — information, inte rådgivning.
 */

// ── Typer + konstanter ──────────────────────────────────────────────────────

/** Nyhet från /api/nyheter — sanitizad i klienten, tid normaliserad till millis. */
type Nyhet = {
  id: string;
  rubrik: string;
  kalla: string | null;
  lank: string | null;
  tid: number | null; // epoch-millis
  tickers: string[];
  kanal: string;
  paverkan: number; // 0–100
  ak1aNot: { vVariables: string[]; tanke: string } | null;
};

type Filter = "aktier" | "bevakning" | "amnen" | "allt";

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;
const MAX_PORTFOLJ_TICKERS = 6;
const NYTT_NYCKEL = "ak1a-nyheter-senaste";
const FETCH_TIMEOUT_MS = 15000;

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

// ── Hjälpfunktioner ─────────────────────────────────────────────────────────

/** Normalisera `tid` (epoch-sec, epoch-millis eller ISO-sträng) till millis. */
function tidTillMillis(tid: unknown): number | null {
  if (typeof tid === "number" && Number.isFinite(tid)) return tid > 1e12 ? tid : tid * 1000;
  if (typeof tid === "string" && tid) {
    const d = Date.parse(tid);
    return Number.isNaN(d) ? null : d;
  }
  return null;
}

/** Sanitiza en rad ur API-svaret — ogiltiga rader sorteras bort (tyst). */
function rensaNyhet(rå: unknown, index: number): Nyhet | null {
  if (typeof rå !== "object" || rå === null) return null;
  const r = rå as Record<string, unknown>;
  if (typeof r.rubrik !== "string" || !r.rubrik) return null;
  const tickers = Array.isArray(r.tickers)
    ? r.tickers.filter((t): t is string => typeof t === "string" && TICKER_RE.test(t)).map((t) => t.toUpperCase())
    : [];
  const notRå = r.ak1aNot;
  let ak1aNot: Nyhet["ak1aNot"] = null;
  if (typeof notRå === "object" && notRå !== null) {
    const n = notRå as Record<string, unknown>;
    const vVariables = Array.isArray(n.vVariables)
      ? n.vVariables.filter((v): v is string => typeof v === "string" && v.length > 0).map((v) => v.toUpperCase().slice(0, 6))
      : [];
    const tanke = typeof n.tanke === "string" ? n.tanke : "";
    if (vVariables.length > 0 || tanke) ak1aNot = { vVariables, tanke };
  }
  return {
    id: typeof r.id === "string" && r.id ? r.id : `nyhet-${index}`,
    rubrik: r.rubrik,
    kalla: typeof r.kalla === "string" && r.kalla ? r.kalla : null,
    lank: typeof r.lank === "string" && /^https:\/\//.test(r.lank) ? r.lank : null,
    tid: tidTillMillis(r.tid),
    tickers,
    kanal: typeof r.kanal === "string" ? r.kanal : "",
    paverkan: arTal(r.paverkan) ? Math.max(0, Math.min(100, r.paverkan as number)) : 0,
    ak1aNot,
  };
}

/** Senast besökta aktieanalyser → tickers (samma fallback som aktie-nyheter). */
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
    if (ut.length >= MAX_PORTFOLJ_TICKERS) break;
  }
  return ut;
}

/** Portfölj-tickers, tyngsta innehaven först (samma hämtning som aktie-nyheter). */
async function hamtaPortfoljTickers(medlem: Medlem | null): Promise<string[]> {
  let tickers: string[] = [];
  try {
    if (medlem) {
      const res = await fetch(`/api/member/portfolio?memberId=${encodeURIComponent(medlem.id)}`);
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
        if (tickers.length >= MAX_PORTFOLJ_TICKERS) break;
      }
    }
  } catch {
    /* portföljen nådde inte fram — lokala tickers får räcka */
  }
  if (tickers.length === 0) tickers = lasLokalaTickers().slice(0, MAX_PORTFOLJ_TICKERS);
  return tickers;
}

/** Vänlig relativ tid — "för 2 h sedan" (klient-side efter hydrering). */
function tidText(millis: number | null): string {
  if (millis === null) return "";
  const deltaMin = Math.round((Date.now() - millis) / 60000);
  if (deltaMin < 1) return "just nu";
  if (deltaMin < 60) return `för ${deltaMin} min sedan`;
  const deltaTim = Math.round(deltaMin / 60);
  if (deltaTim < 24) return `för ${deltaTim} h sedan`;
  if (deltaTim < 24 * 7) return `för ${Math.round(deltaTim / 24)} d sedan`;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" }).format(new Date(millis));
}

/**
 * Filtermatchning mot kanal-fältet — motorn taggar varje nyhet med
 * "mina-aktier" | "bevakning" | "amne:<id>" | "rss:…". Ticker-semantiken
 * kompletterar: en ämnesnyhet som rör en portfölj-ticker räknas också som
 * "Mina aktier", en bevakad ticker som "Bevakning".
 */
function matcharFilter(n: Nyhet, f: Filter, portfolio: Set<string>, bevakning: Set<string>): boolean {
  if (f === "allt") return true;
  const k = n.kanal.toLowerCase();
  const iPort = n.tickers.some((t) => portfolio.has(t));
  const iBev = n.tickers.some((t) => bevakning.has(t));
  if (f === "aktier") return k === "mina-aktier" || iPort;
  if (f === "bevakning") return k === "bevakning" || (iBev && !iPort);
  return k.startsWith("amne:") || k.startsWith("rss:") || (!iPort && !iBev); // "Ämnen"
}

// ── Påverkans-badge (färgskala 0–100) ───────────────────────────────────────

function PaverkanBadge({ paverkan }: { paverkan: number }) {
  const tal = Math.round(paverkan);
  if (paverkan >= 70) {
    return (
      <span
        title="Påverkanspoäng 0–100"
        className="inline-flex items-center rounded-full border border-gold/60 bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-gold"
      >
        Hög påverkan · {tal}
      </span>
    );
  }
  if (paverkan >= 40) {
    return (
      <span
        title="Påverkanspoäng 0–100"
        className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-foreground/80"
      >
        Påverkan {tal}
      </span>
    );
  }
  return (
    <span
      title="Påverkanspoäng 0–100"
      className="inline-flex items-center rounded-full border border-[#EDE6D6]/15 bg-[#0E1B2E]/60 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#EDE6D6]/70"
    >
      {tal}
    </span>
  );
}

// ── Komponenten ─────────────────────────────────────────────────────────────

export function NyhetsCentral() {
  const [hydrerad, setHydrerad] = useState(false);
  const [kanaler, setKanaler] = useState<NyhetsKanaler | null>(null);
  const [nyheter, setNyheter] = useState<Nyhet[]>([]);
  const [franCache, setFranCache] = useState(false);
  const [hamtar, setHamtar] = useState(true);
  const [filter, setFilter] = useState<Filter>("allt");
  const [oppnaKanaler, setOppnaKanaler] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [senasteSedd, setSenasteSedd] = useState<number | null>(null);
  const [uppdateraSignal, setUppdateraSignal] = useState(0);

  // Kanal-formulär (lokala input-värden + fel-texter)
  const [nyaBevakning, setNyaBevakning] = useState("");
  const [bevakFel, setBevakFel] = useState<string | null>(null);
  const [nyaRssUrl, setNyaRssUrl] = useState("");
  const [nyaRssNamn, setNyaRssNamn] = useState("");
  const [rssFelText, setRssFelText] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // ── 1) Mount: medlem + kanaler + NYTT-gräns (las → visa → skriv nu) ──
  useEffect(() => {
    setHydrerad(true);
    setKanaler(lasKanaler());

    // NYTT-markerare: nyheter nyare än senaste sedda besök märks — därefter
    // flyttas gränsen till nu, så nästa besök bara märker det allra färska.
    try {
      const rå = localStorage.getItem(NYTT_NYCKEL);
      const tal = rå ? Number(rå) : NaN;
      if (Number.isFinite(tal)) setSenasteSedd(tal);
      localStorage.setItem(NYTT_NYCKEL, String(Date.now()));
    } catch {
      /* privat läge — inga NYTT-märken, inget krasch */
    }

    let aktiv = true;
    (async () => {
      const tickers = await hamtaPortfoljTickers(lasMedlem());
      if (!aktiv) return;
      setKanaler(sattPortfoljTickers(tickers));
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  // ── 2) Data: fetcha när kanal-parametrarna (eller uppdatera-knappen) ändras ──
  const sokvag = useMemo(() => {
    if (!kanaler) return null;
    const params = new URLSearchParams();
    if (kanaler.tickers.length > 0) params.set("tickers", kanaler.tickers.join(","));
    if (kanaler.bevakning.length > 0) params.set("bevakning", kanaler.bevakning.join(","));
    if (kanaler.amnen.length > 0) params.set("amnen", kanaler.amnen.join(","));
    if (kanaler.rss.length > 0) params.set("rss", kanaler.rss.map((e) => e.url).join(","));
    const q = params.toString();
    return q === "" ? null : `/api/nyheter?${q}`;
  }, [kanaler]);

  useEffect(() => {
    if (sokvag === null) {
      setNyheter([]);
      setHamtar(false);
      return;
    }
    let aktiv = true;
    const kontroll = new AbortController();
    setHamtar(true);
    (async () => {
      try {
        const tidtagning = setTimeout(() => kontroll.abort(), FETCH_TIMEOUT_MS);
        const res = await fetch(sokvag, { signal: kontroll.signal });
        clearTimeout(tidtagning);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { nyheter?: unknown; franCache?: unknown };
        if (!aktiv) return;
        setFranCache(data?.franCache === true);
        const listan = Array.isArray(data?.nyheter) ? data.nyheter : [];
        setNyheter(listan.map(rensaNyhet).filter((n): n is Nyhet => n !== null));
      } catch {
        if (aktiv) setNyheter([]); // tyst, graceful — viloläget tar över
      } finally {
        if (aktiv) setHamtar(false);
      }
    })();
    return () => {
      aktiv = false;
      kontroll.abort();
    };
  }, [sokvag, uppdateraSignal]);

  // ── Kanal-mutationer: lib-funktionen sparar; toast vid lyckad ändring ──
  function visaToast(text: string) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  function anvand(resultat: KanalResultat, vidLyckat: string) {
    setKanaler(resultat.kanaler);
    if (resultat.fel) return resultat.fel;
    visaToast(vidLyckat);
    return null;
  }

  function lagTillBevakningKlick() {
    const fel = anvand(lagTillBevakning(nyaBevakning), "Bevakning sparad ✓");
    setBevakFel(fel);
    if (!fel) setNyaBevakning("");
  }

  function lagTillRssKlick() {
    const fel = anvand(lagTillRss(nyaRssUrl, nyaRssNamn), "Flöde anslutet ✓");
    setRssFelText(fel);
    if (!fel) {
      setNyaRssUrl("");
      setNyaRssNamn("");
    }
  }

  // ── Filter + antal (memo: undvik omräkning per render i listan) ──
  const portfolioSet = useMemo(() => new Set(kanaler?.tickers ?? []), [kanaler]);
  const bevakningSet = useMemo(() => new Set(kanaler?.bevakning ?? []), [kanaler]);
  const filtrerade = useMemo(
    () => (nyheter ?? []).filter((n) => matcharFilter(n, filter, portfolioSet, bevakningSet)),
    [nyheter, filter, portfolioSet, bevakningSet]
  );
  const antalPerFilter = useMemo(() => {
    const rakna = (f: Filter) => nyheter.filter((n) => matcharFilter(n, f, portfolioSet, bevakningSet)).length;
    return { aktier: rakna("aktier"), bevakning: rakna("bevakning"), amnen: rakna("amnen"), allt: nyheter.length };
  }, [nyheter, portfolioSet, bevakningSet]);

  const FILTER_RUBRIKER: Array<{ id: Filter; text: string }> = [
    { id: "aktier", text: "Mina aktier" },
    { id: "bevakning", text: "Bevakning" },
    { id: "amnen", text: "Ämnen" },
    { id: "allt", text: "Allt" },
  ];

  // ── Skelett under hydrering (deterministiskt på server + klient) ──
  if (!hydrerad || !kanaler) {
    return (
      <section className="marin-panel relative overflow-hidden rounded-2xl border border-gold/30 p-6 sm:p-8" aria-hidden="true">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-white/5" />
        <div className="mt-6 space-y-3">
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        </div>
      </section>
    );
  }

  const totalaKanaler = kanaler.tickers.length + kanaler.bevakning.length + kanaler.amnen.length + kanaler.rss.length;

  return (
    <section className="marin-panel relative overflow-hidden rounded-2xl border border-gold/30 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
      <div className="relative">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">Kundens nyhetsrum</p>
            <h2 className="mt-2 font-serif text-xl font-bold tracking-tight text-gold-soft sm:text-2xl">
              Nyhetscentralen
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[#EDE6D6]/70">
              Senaste nytt — intelligent rangerat för din utbildning
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-gold/25 px-3 py-1 text-[11px] font-semibold text-[#EDE6D6]/80" aria-live="polite">
              {hamtar ? "hämtar…" : `${nyheter.length} nyheter${franCache ? " · cache" : ""}`}
            </span>
            <button
              type="button"
              onClick={() => setUppdateraSignal((n) => n + 1)}
              disabled={hamtar || sokvag === null}
              className="btn-marin rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50"
              title="Hämta färska nyheter"
            >
              {hamtar ? "⟳ …" : "⟳ Uppdatera"}
            </button>
          </div>
        </div>

        {/* ── Filterrad ── */}
        <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrera nyheter">
          {FILTER_RUBRIKER.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                filter === f.id
                  ? "border-gold bg-gold/20 text-[#E8C766]"
                  : "border-gold/25 text-[#EDE6D6]/70 hover:border-gold/50 hover:text-[#EDE6D6]"
              }`}
            >
              {f.text} <span className="tabular opacity-70">{antalPerFilter[f.id]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOppnaKanaler((o) => !o)}
            aria-expanded={oppnaKanaler}
            className="ml-auto rounded-full border border-gold/40 px-3.5 py-1.5 text-xs font-bold text-[#E8C766] transition-colors hover:bg-gold/15"
          >
            Kanaler ⚙ <span className="opacity-70">({totalaKanaler})</span>
          </button>
        </div>

        {/* ── Kanalhanteraren (expanderbar) ── */}
        {oppnaKanaler && (
          <div className="mt-4 rounded-xl border border-gold/25 bg-black/20 p-4 sm:p-5">
            {/* (a) Bevaknings-tickers */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gold-soft">
                Bevaknings-tickers
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#EDE6D6]/60">
                Bevakade bolag utanför portföljen — max 15 kanaler totalt med portföljen.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <label htmlFor="bevakning-input" className="sr-only">
                  Ny bevaknings-ticker
                </label>
                <input
                  id="bevakning-input"
                  value={nyaBevakning}
                  onChange={(e) => setNyaBevakning(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && lagTillBevakningKlick()}
                  placeholder="t.ex. VOLV-B"
                  maxLength={12}
                  className="w-36 rounded-lg border border-gold/30 bg-black/30 px-3 py-1.5 font-mono text-xs text-[#EDE6D6] placeholder:text-[#EDE6D6]/35 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={lagTillBevakningKlick}
                  className="rounded-lg border border-gold/50 bg-gold/15 px-3 py-1.5 text-xs font-bold text-[#E8C766] hover:bg-gold/25"
                >
                  + Lägg till
                </button>
              </div>
              {bevakFel && <p className="mt-1.5 text-[11px] text-red-300">{bevakFel}</p>}
              {kanaler.bevakning.length > 0 && (
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {kanaler.bevakning.map((t) => (
                    <li key={t}>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-gold">
                        {t}
                        <button
                          type="button"
                          onClick={() => anvand(taBortBevakning(t), "Kanal borttagen ✓")}
                          aria-label={`Ta bort ${t} ur bevakningen`}
                          className="text-[#EDE6D6]/60 hover:text-[#EDE6D6]"
                        >
                          ✕
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* (b) Ämneskanaler */}
            <div className="mt-5 border-t border-gold/15 pt-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gold-soft">Ämneskanaler</h3>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {AMNESKANALER.map((amne) => (
                  <li key={amne.id}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={kanaler.amnen.includes(amne.id)}
                        onChange={() => anvand(togglAamne(amne.id), "Kanaler sparade ✓")}
                        className="mt-0.5 size-3.5 accent-[#E8C766]"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-[#EDE6D6]">{amne.namn}</span>
                        {amne.beskrivning && (
                          <span className="block text-[10px] leading-tight text-[#EDE6D6]/55">{amne.beskrivning}</span>
                        )}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* (c) Egna RSS-flöden */}
            <div className="mt-5 border-t border-gold/15 pt-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gold-soft">
                Egna RSS-flöden <span className="opacity-70">({kanaler.rss.length}/5)</span>
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#EDE6D6]/60">
                Anslut publika https-flöden — din lokala tidning, en branschblogg, en bevakad källa.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <label htmlFor="rss-url" className="sr-only">
                  RSS-adress
                </label>
                <input
                  id="rss-url"
                  value={nyaRssUrl}
                  onChange={(e) => setNyaRssUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && lagTillRssKlick()}
                  placeholder="https://exempel.se/rss"
                  inputMode="url"
                  className="min-w-[220px] flex-1 rounded-lg border border-gold/30 bg-black/30 px-3 py-1.5 text-xs text-[#EDE6D6] placeholder:text-[#EDE6D6]/35 focus:border-gold focus:outline-none"
                />
                <label htmlFor="rss-namn" className="sr-only">
                  Namn på flödet
                </label>
                <input
                  id="rss-namn"
                  value={nyaRssNamn}
                  onChange={(e) => setNyaRssNamn(e.target.value)}
                  placeholder="Namn (valfritt)"
                  maxLength={40}
                  className="w-40 rounded-lg border border-gold/30 bg-black/30 px-3 py-1.5 text-xs text-[#EDE6D6] placeholder:text-[#EDE6D6]/35 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={lagTillRssKlick}
                  className="rounded-lg border border-gold/50 bg-gold/15 px-3 py-1.5 text-xs font-bold text-[#E8C766] hover:bg-gold/25"
                >
                  + Anslut
                </button>
              </div>
              {rssFelText && <p className="mt-1.5 text-[11px] text-red-300">{rssFelText}</p>}
              {kanaler.rss.length > 0 && (
                <ul className="mt-2.5 space-y-1.5">
                  {kanaler.rss.map((e) => (
                    <li key={e.url} className="flex items-center justify-between gap-3 rounded-lg border border-gold/20 px-3 py-1.5">
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-[#EDE6D6]">{e.namn}</span>
                        <span className="block truncate font-mono text-[10px] text-[#EDE6D6]/50">{e.url}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => anvand(taBortRss(e.url), "Flöde borttaget ✓")}
                        aria-label={`Ta bort flödet ${e.namn}`}
                        className="shrink-0 text-xs text-[#EDE6D6]/60 hover:text-[#EDE6D6]"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* (d) Auto-spara-notis */}
            <p className="mt-4 border-t border-gold/15 pt-3 text-[10px] leading-relaxed text-[#EDE6D6]/50">
              Ändringar sparas automatiskt i din webbläsare och flödet anpassas direkt — inget Spara-steg behövs.
            </p>
          </div>
        )}

        {/* ── Nyhetslistan ── */}
        {hamtar ? (
          <div className="mt-6 space-y-3" aria-busy="true" aria-live="polite">
            <p className="text-xs text-[#EDE6D6]/70">Lyssnar efter nyhetsflödet…</p>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-gold/15 bg-white/5" />
            ))}
          </div>
        ) : filtrerade.length === 0 ? (
          /* UTAN NYHETER — viloläget (våg 105: marin-familjens mörka kort —
             bg-card blev LJUS under marin-panelens cream-text i ljust läge) */
          <div className="mt-6 rounded-xl border border-gold/25 bg-[#101b2b]/60 p-6 text-center">
            <p className="text-2xl" aria-hidden="true">
              🌊
            </p>
            <p className="mt-2 text-sm font-semibold text-[#EDE6D6]">
              {nyheter.length === 0 ? "Inga nyheter just nu — marknaden andas." : "Inga nyheter i detta filtret."}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#EDE6D6]/60">
              Ibland är tystnaden själva nyheten. Vila i den — eller{" "}
              <Link href="/kurser" className="font-semibold text-gold hover:underline">
                fördjupa dig i en kurs
              </Link>{" "}
              medan världen samlar sig.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtrerade.map((n) => {
              const arNytt = senasteSedd !== null && n.tid !== null && n.tid > senasteSedd;
              return (
                <li key={n.id} className="relative">
                  {arNytt && (
                    <span className="absolute -top-2 right-3 z-10 rounded-full bg-[#0E1B2E] px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#E8C766] ring-1 ring-[#E8C766]/50">
                      NYTT
                    </span>
                  )}
                  {/* VÅG 105: marin-mörkt kort (bg-card/80 = ljus ruta med
                      mörk text inuti marin-panelen i ljust läge = kundens
                      "grå utsolkning") */}
                  <article className="rounded-xl border border-gold/25 bg-[#101b2b]/80 p-4 transition-colors hover:border-gold/45 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#EDE6D6]/60">
                      <PaverkanBadge paverkan={n.paverkan} />
                      {n.kalla && <span className="font-semibold">{n.kalla}</span>}
                      <span>{tidText(n.tid)}</span>
                      {n.kanal && <span className="opacity-70">· {n.kanal}</span>}
                    </div>
                    <h3 className="mt-2 text-sm font-semibold leading-snug text-[#EDE6D6] sm:text-base">
                      {n.lank ? (
                        <a
                          href={n.lank}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-gold hover:underline"
                        >
                          {n.rubrik}
                        </a>
                      ) : (
                        n.rubrik
                      )}
                    </h3>
                    {n.tickers.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Berörda tickers">
                        {n.tickers.map((t) => (
                          <li
                            key={t}
                            className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-gold"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                    {n.ak1aNot && (
                      <div className="mt-3 rounded-lg border border-gold/50 bg-gold/5 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gold">AK1A-notering</p>
                        {n.ak1aNot.vVariables.length > 0 && (
                          <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Berörda variabler">
                            {n.ak1aNot.vVariables.map((v) => (
                              <li
                                key={v}
                                className="inline-flex items-center rounded border border-gold/40 bg-gold/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gold"
                              >
                                ◇ {v}
                              </li>
                            ))}
                          </ul>
                        )}
                        {n.ak1aNot.tanke && (
                          <p className="mt-1.5 text-xs italic leading-relaxed text-foreground/85">{n.ak1aNot.tanke}</p>
                        )}
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        {/* Pedagogisk notering + disclaimer */}
        <div className="mt-5 border-t border-gold/10 pt-4">
          <p className="text-xs italic leading-relaxed text-[#EDE6D6]/80">
            Rangeringen och AK1A-noteringarna är studieunderlag — läs dem tillsammans med din{" "}
            <Link href="/vagfundament" prefetch={false} className="font-semibold text-gold-soft hover:underline">
              Vågkarta
            </Link>{" "}
            och{" "}
            <Link href="/konfluens" prefetch={false} className="font-semibold text-gold-soft hover:underline">
              Konfluensradarn
            </Link>
            .
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-[#EDE6D6]/50">
            Källor: offentliga nyhetsflöden via nyhetsmotorn. Fördröjda och ofullständiga flöden kan
            förekomma — information, inte investeringsråd.
          </p>
        </div>
      </div>

      {/* Toast — toast-lik bekräftelse på auto-sparade kanaländringar */}
      {toast && (
        <p
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-full bg-[#0E1B2E] px-4 py-2 text-xs font-bold text-[#E8C766] shadow-lg ring-1 ring-[#E8C766]/40"
        >
          {toast}
        </p>
      )}
    </section>
  );
}
