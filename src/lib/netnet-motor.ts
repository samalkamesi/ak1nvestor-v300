/**
 * AK1A Net-net-motor — pedagogisk screening av Grahams "cigar-butts"
 * (MEGA PLAN A5). Ett net-net-bolag handlas under sin Net Current Asset
 * Value: NCAV = omsättningstillgångar − totala skulder. Grahams kriterium
 * från The Intelligent Investor: köp när kurs < 2/3 × NCAV per aktie —
 * då betalar marknaden mindre än rörelsekapitalet och resten av bolaget
 * är gratis. Formeln är offentlig (Graham 1949) och får visas i UI.
 *
 * Datahämtning: Yahoos quoteSummary med cookie+crumb-flödet som i
 * src/lib/analys-motor.ts (fc.yahoo.com → getcrumb → quoteSummary) —
 * mönstret är HITKOPIERAT, modulen är fristående och importerar inget
 * från analys-motorn. Allow-list: query1/query2.finance.yahoo.com.
 * Allt är graceful: varje rad som inte fick data får fel-text och null,
 * skanningen kastar aldrig.
 *
 * Server-side only ("dns" för SSRF-kontroll) — anropas via server action.
 */
import { promises as dns } from "dns";

/** En screeningsrad — kurs mot NCAV per aktie, plus bonusnyckeltal. */
export type NetnetRad = {
  ticker: string;
  namn?: string;
  fel?: string;
  kurs: number | null;
  ncavPerAktie: number | null;
  forhallande: number | null; // kurs ÷ NCAV per aktie (< 0.667 = net-net)
  klass: "net-net" | "nära" | "ej" | null;
  pe?: number | null;
  pb?: number | null;
};

/** Allow-list — endast dessa Yahoovärdar får anropas (fast konstant, aldrig indata). */
const YAHOO_HOSTAR = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"] as const;

/** Grahams köptröskel: kurs < 2/3 × NCAV per aktie (0.667, ej intern hemlighet). */
export const GRAHAM_TROSKEL = 0.667;

/** Max antal tickers per skannaNetnet-anrop (komponenten batchar 25 → 15+10). */
export const MAX_TICKER_PER_ANROP = 15;

/** Antal parallella hämtningar (samma tak som analys-motorns trådpool). */
const PARALLELLA = 4;

/** Ticker-format som Yahoo accepterar (samma regex som analys-motorn). */
const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

// ── SSRF-skydd (kopia av analys-motorns mönster) ────────────────────────────

/** Privat/loopback-IP? Samma prefix och 172.16–31-regel som analys-motorn. */
function privatIp(ip: string): boolean {
  if (["127.", "10.", "192.168.", "169.254.", "::1", "fe80:", "0."].some((p) => ip.startsWith(p))) {
    return true;
  }
  if (ip.startsWith("172.")) {
    const andra = Number(ip.split(".")[1]);
    if (!Number.isInteger(andra)) throw new Error("ogiltig IP");
    return 16 <= andra && andra <= 31;
  }
  return false;
}

/** Kontrollerar FAST värdkonstant mot allow-list + privat-IP (DNS precis före anrop). */
async function kontrolleraHost(vardkonstant: string): Promise<void> {
  if (!(YAHOO_HOSTAR as readonly string[]).includes(vardkonstant)) {
    throw new Error("blockerad värd");
  }
  const { address } = await dns.lookup(vardkonstant, { family: 4 });
  if (privatIp(address)) throw new Error("blockerad privat IP");
}

/** urllib.parse.quote()-motsvarighet — används för crumb (tickers matchar redan TICKER_RE). */
function urlKoda(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/** Första Set-Cookie-headerns första par (fc.yahoo.com sätter consent-cookien). */
function forstaCookie(r: Response): string {
  const lista =
    typeof (r.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie === "function"
      ? (r.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
      : [];
  const rå = lista.length > 0 ? lista[0] : r.headers.get("set-cookie") ?? "";
  return rå.split(";")[0] ?? "";
}

/** Avrunda mot 4 decimaler (motor-konvention; -0 normaliseras till 0). */
function r4(x: number): number {
  const y = Math.round(x * 10000) / 10000;
  return y === 0 ? 0 : y;
}

// ── Cookie+crumb-flödet (fc.yahoo.com → getcrumb, cachat per process) ───────

const CRUMB_CACHE: { host: string | null; crumb: string | null; cookie: string | null } = {
  host: null,
  crumb: null,
  cookie: null,
};

/** Hämta [host, cookie, crumb] för quoteSummary. Returnerar null vid fel. */
async function yahooCrumb(): Promise<[string, string, string] | null> {
  if (CRUMB_CACHE.host && CRUMB_CACHE.crumb && CRUMB_CACHE.cookie) {
    return [CRUMB_CACHE.host, CRUMB_CACHE.cookie, CRUMB_CACHE.crumb];
  }
  for (const host of YAHOO_HOSTAR) {
    try {
      await kontrolleraHost(host);
      // fc.yahoo.com svarar 404 men sätter cookie — fetch kastar inte på 4xx
      const r = await fetch("https://fc.yahoo.com", {
        headers: { "User-Agent": "Mozilla/5.0 (AK1A)" },
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      const cookie = forstaCookie(r);
      if (!cookie) continue;
      const r2 = await fetch(`https://${host}/v1/test/getcrumb`, {
        headers: { "User-Agent": "Mozilla/5.0 (AK1A)", Cookie: cookie },
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      const crumb = (await r2.text()).trim();
      if (!crumb) continue;
      CRUMB_CACHE.host = host;
      CRUMB_CACHE.crumb = crumb;
      CRUMB_CACHE.cookie = cookie;
      return [host, cookie, crumb];
    } catch {
      continue; // nästa värd i allow-listan
    }
  }
  return null;
}

// ── Per-ticker-hämtning: quoteSummary → NCAV-matematik ─────────────────────

/** Plocka {raw}-talet ur ett quoteSummary-objekt — null om fältet saknas. */
function tal(d: Record<string, unknown> | undefined, nyckel: string): number | null {
  try {
    const v = ((d?.[nyckel] ?? {}) as { raw?: number })["raw"] ?? null;
    return v !== null && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Klassificera kurs/NCAV-förhållandet enligt Graham. NCAV ≤ 0 kan aldrig bli net-net. */
function klassificera(forhallande: number | null, ncavPerAktie: number | null): NetnetRad["klass"] {
  if (forhallande === null || ncavPerAktie === null || ncavPerAktie <= 0) {
    return ncavPerAktie !== null && ncavPerAktie <= 0 ? "ej" : null;
  }
  if (forhallande < GRAHAM_TROSKEL) return "net-net";
  if (forhallande < 1.0) return "nära";
  return "ej";
}

/** Hämta balansräkning + pris + nyckeltal för EN ticker och räkna NCAV. Kastar aldrig.
 *
 * Balansdata: fundamentals-timeseries på query2 (Yahoo pensionerade både
 * balanceSheetData och balanceSheetHistory i quoteSummary). Totala skulder
 * approximeras som rörelseskulder + långfristig skuld — pensioner/leasing
 * utanför dessa debiteras ej (dokumenterad approximation, konservativ är den
 * inte — men Graham-skolans 2/3-marginal absorberar det).
 */
async function hamtaNetnet(ticker: string): Promise<NetnetRad> {
  const tom: NetnetRad = { ticker, kurs: null, ncavPerAktie: null, forhallande: null, klass: null };
  try {
    if (!TICKER_RE.test(ticker)) {
      return { ...tom, fel: "ogiltig ticker" };
    }

    // ── 1) Balansposter via fundamentals-timeseries (ingen crumb krävs) ──
    const tsTyper = [
      "annualCurrentAssets",
      "annualCurrentLiabilities",
      "annualLongTermDebt",
      "annualShareIssued",
    ].join(",");
    const nu = Math.floor(Date.now() / 1000);
    // OBS: Yahoo timeseries returnerar tomma serier om period1 fönstras —
    // hela historik (period1=0) är det enda mönster som levererar data.
    const tsUrl =
      `https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/` +
      `${urlKoda(ticker)}?type=${tsTyper}&period1=0&period2=${nu}&merge=false`;
    const tsRes = await fetch(tsUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (AK1A)" },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const tsJson: any = await tsRes.json();
    const tsResultat: Array<Record<string, any>> = tsJson?.timeseries?.result ?? [];
    const sistaVardet = (typ: string): number | null => {
      // OBS: meta.type levereras som ARRAY (["annualX"]) — läs första elementet
      const serie = tsResultat.find((x) => String(x?.meta?.type?.[0] ?? x?.meta?.type ?? "") === typ);
      const punkter = serie?.[typ];
      if (!Array.isArray(punkter)) return null;
      for (let i = punkter.length - 1; i >= 0; i--) {
        const rå = punkter[i]?.reportedValue?.raw;
        if (typeof rå === "number" && Number.isFinite(rå)) return rå;
      }
      return null;
    };
    const omsattningstillgangar = sistaVardet("annualCurrentAssets");
    const rorelseskulder = sistaVardet("annualCurrentLiabilities");
    const langfristigSkuld = sistaVardet("annualLongTermDebt");
    const aktierUrSerie = sistaVardet("annualShareIssued");
    const totalaSkulder =
      rorelseskulder !== null ? rorelseskulder + (langfristigSkuld ?? 0) : null;

    // ── 2) Kurs + namn + bonusnyckeltal via quoteSummary (crumb) ──
    const par = await yahooCrumb();
    if (!par) {
      return { ...tom, fel: "ingen data (cookie/crumb)" };
    }
    const [host, cookie, crumb] = par;
    await kontrolleraHost(host);
    const url =
      `https://${host}/v10/finance/quoteSummary/${urlKoda(ticker)}` +
      `?modules=defaultKeyStatistics,financialData,price&crumb=${urlKoda(crumb)}`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (AK1A)", Cookie: cookie },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const resultat = ((JSON.parse(await r.text())["quoteSummary"] ?? {})["result"] ?? []) as Array<{
      defaultKeyStatistics?: Record<string, unknown>;
      financialData?: Record<string, unknown>;
      price?: Record<string, unknown>;
    }>;
    if (resultat.length === 0) {
      return { ...tom, fel: "ingen data (Yahoo)" };
    }
    const k = resultat[0].defaultKeyStatistics ?? {};
    const f = resultat[0].financialData ?? {};
    const p = resultat[0].price ?? {};

    // Balansräkningens två hörnstenar
    // Kurs: price-modulens regularMarketPrice, fallback financialData.currentPrice
    const kurs = tal(p, "regularMarketPrice") ?? tal(f, "currentPrice");

    // Aktieantal: balansseriens annualShareIssued, fallback sharesOutstanding/marketCap
    let aktier = aktierUrSerie;
    if (aktier === null || aktier <= 0) aktier = tal(k, "sharesOutstanding");
    if (aktier === null || aktier <= 0) {
      const marketCap = tal(p, "marketCap");
      if (marketCap !== null && kurs !== null && kurs > 0) {
        aktier = marketCap / kurs;
      }
    }

    // Bonusnyckeltal (visas som extra kolumner, aldrig krav)
    const pb = tal(k, "priceToBook");
    const eps = tal(k, "trailingEps");
    const pe = eps !== null && eps > 0 && kurs !== null && kurs > 0 ? kurs / eps : null;

    const namnRå = p["longName"] ?? p["shortName"] ?? "";
    const namn = typeof namnRå === "string" && namnRå.trim() !== "" ? namnRå : undefined;

    // NCAV-matematik: NCAV = omsättningstillgångar − totala skulder
    if (
      omsattningstillgangar === null ||
      totalaSkulder === null ||
      aktier === null ||
      aktier <= 0 ||
      kurs === null ||
      kurs <= 0
    ) {
      return {
        ...tom,
        namn,
        pe: pe !== null ? r4(pe) : null,
        pb: pb !== null ? r4(pb) : null,
        fel: "ofullständig balansdata",
      };
    }

    const ncav = omsattningstillgangar - totalaSkulder;
    const ncavPerAktie = ncav / aktier;
    const forhallande = ncavPerAktie > 0 ? kurs / ncavPerAktie : null;

    return {
      ticker,
      namn,
      kurs: r4(kurs),
      ncavPerAktie: r4(ncavPerAktie),
      forhallande: forhallande !== null ? r4(forhallande) : null,
      klass: klassificera(forhallande, ncavPerAktie),
      pe: pe !== null ? r4(pe) : null,
      pb: pb !== null ? r4(pb) : null,
    };
  } catch {
    return { ...tom, fel: "ingen data (Yahoo)" };
  }
}

/**
 * Skanna upp till MAX_TICKER_PER_ANROP tickers — 4 parallella hämtningar,
 * resultat i indataordning (samma arbetar-pool-mönster som analys-motorn).
 * Enskilda fel blir fel-rader, aldrig kast.
 */
export async function skannaNetnet(tickers: string[]): Promise<NetnetRad[]> {
  const lista = (tickers ?? []).slice(0, MAX_TICKER_PER_ANROP);
  const resultat: NetnetRad[] = new Array(lista.length);
  let nast = 0;
  const arbetare = Array.from({ length: Math.min(PARALLELLA, lista.length) }, async () => {
    for (;;) {
      const i = nast++;
      if (i >= lista.length) break;
      resultat[i] = await hamtaNetnet(lista[i]);
    }
  });
  await Promise.all(arbetare);
  return resultat;
}
