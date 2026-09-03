/**
 * AK1A Analysis Engine — 5×5×4-ekosystem per aktie (TypeScript-port av
 * scripts/analysis_engine.py — deterministisk: samma indata → identisk utdata).
 * 5 horisonter (Mikro/Kort/Medellång/Lång/Mega) × 5 teorier (Elliott/Fibonacci/
 * GANN/Lucas/Volym) × signal -1/0/+1, plus riskmått. Ärlighet: signalerna är
 * heuristiska proxy-mätare beräknade ur pris/volymdata (Yahoo Finance primärt,
 * MarketStack/Stooq som sekundära källor) — inte fulla Elliott-räkningar.
 * Teorierna är struktureringsverktyg utan vetenskapligt belagd prediktiv förmåga.
 *
 * Portnoteringar (Python → Node/TypeScript):
 *  - round() här är Pythons bankes avrundning (pyRound) så vol20/pris/etc. blir identiska.
 *  - _IngenRedirect ≡ fetch(..., { redirect: "error" }) — redirect => anropet misslyckas (null).
 *  - urllib.request.quote ≡ pyQuote — "!" "*" "'" "(" ")" ska kodas och "/" ska lämnas okodat.
 *  - Set-Cookie plockas som pythons headers.get: första cookien, första paret.
 *  - Server-side only: SSRF-skyddet (kontrolleraHost) kör DNS-uppslag precis före varje anrop.
 */
import { promises as dns } from "dns";

export const HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"] as const;
export const TEORIER = ["elliott", "fibonacci", "gann", "lucas", "volym"] as const;

export type Horisont = (typeof HORIZONTER)[number];
export type Teori = (typeof TEORIER)[number];
export type VagKlass = "impulsvåg" | "korrigering" | "basbygge" | "osatt";

/** Grundlagda nyckeltal (AKM1-proxy) via Yahoos quoteSummary — null om inget tal kom igenom. */
export type Fundament = {
  pe: number | null;
  peFwd: number | null;
  pb: number | null;
  utdelning: number | null;
  vinstmarginal: number | null;
  roe: number | null;
  tillvaxt: number | null;
  skuldEk: number | null;
} | null;

/** Risk- och nivådata — identisk fältuppsättning och ordning som python-motorn. */
export type MotorData = {
  pris: number;
  hojd52: number;
  lag52: number;
  pos52: number;
  sigma_ar: number | null;
  atr14: number | null;
  ma50: number | null;
  ma200: number | null;
  vol20: number | null;
  voltrend: number | null;
  fib38: number;
  fib62: number;
};

/** Ett tickersvar — fält för fält kompatibelt med dagens-pass- och djupanalys-routerna. */
export type TickerAnalys = {
  ticker: string;
  fel?: string;
  kallor?: number;
  namn?: string;
  bors?: string | null;
  valuta?: string | null;
  fundament?: Fundament;
  data?: MotorData;
  momentum?: Record<Horisont, number | null>;
  vager?: Record<Horisont, VagKlass>;
  matris25?: Record<string, number>;
  sammanfattning?: { bull: number; bear: number; neutral: number };
  notering?: string;
};

/** Hela motorsvaret — motsvarar python-main():s {"tickers": [...]} på stdout. */
export type MotorSvar = { tickers: TickerAnalys[] };

/** Fråga till motorn — motsvarar stdin-JSON:en ({"tickers":[...]}, max 12 analyseras). */
export type MotorFraga = { tickers?: string[] };

/** Metainfo ur Yahoos chart-svar (fiftyTwoWeek*-fälten plockas som i python men används ej). */
type YahooMeta = Record<
  "longName" | "shortName" | "currency" | "fullExchangeName" | "fiftyTwoWeekHigh" | "fiftyTwoWeekLow",
  string | number | null
>;

/** Pris/volym-serie från valfri källa (Yahoo eller MarketStack). */
type Serie = {
  close: number[];
  high: number[];
  low: number[];
  vol: number[];
  meta?: YahooMeta;
  kalla?: "marketstack";
};

/** Pythons round(): korrekt avrundning med bankes regel ( Jenna .5 → jämnt ) på exakta .5-lägen. */
function pyRound(x: number, n = 0): number {
  if (!Number.isFinite(x)) return x;
  const f = 10 ** n;
  const y = x * f;
  if (Math.abs(y) >= 2 ** 52) return x;
  if (Number.isInteger(y - 0.5)) {
    const ned = Math.floor(y);
    return (ned % 2 === 0 ? ned : ned + 1) / f;
  }
  const r = Math.round(y) / f;
  return r === 0 ? 0 : r; // normalisera -0 → 0
}

/** float() med pythons semantik — null/undefined kastar (fångas av anroparens try → null). */
function pyFloat(v: unknown): number {
  if (v == null) throw new Error("float(None)");
  return Number(v);
}

/** urllib.parse.quote(): alfanum + _.-~/ okodat, övriga UTF-8-bytepar som %XX. */
function pyQuote(s: string): string {
  return encodeURIComponent(s)
    .replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%2F/g, "/");
}

/** Lokal kalenderdag som YYYY-MM-DD (som Pythons date.today()). */
function lokalDagIso(d = new Date()): string {
  return (
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
  );
}

/** Kalenderdagsskillnad a − b (som Pythons (date_a - date_b).days). */
function dagarMellan(isoA: string, isoB: string): number {
  return Math.round((Date.parse(isoA + "T00:00:00Z") - Date.parse(isoB + "T00:00:00Z")) / 86400000);
}

/** Privat/loopback-IP? Samma prefix och 172.16–31-regel som python-filens _privat_ip. */
function _privatIp(ip: string): boolean {
  if (["127.", "10.", "192.168.", "169.254.", "::1", "fe80:", "0."].some((p) => ip.startsWith(p))) {
    return true;
  }
  if (ip.startsWith("172.")) {
    const andra = Number(ip.split(".")[1]);
    if (!Number.isInteger(andra)) throw new Error("ogiltig IP"); // int() kastar i python → anropet misslyckas
    return 16 <= andra && andra <= 31;
  }
  return false;
}

/** Kontrollerar FAST värdkonstant mot allowlist + privat-IP (DNS om direkt före anrop). */
async function kontrolleraHost(vardkonstant: string): Promise<void> {
  if (vardkonstant !== "query1.finance.yahoo.com" && vardkonstant !== "stooq.com" && vardkonstant !== "api.marketstack.com") {
    throw new Error("blockerad värd");
  }
  const { address } = await dns.lookup(vardkonstant, { family: 4 });
  if (_privatIp(address)) throw new Error("blockerad privat IP");
}

/** Första Set-Cookie-headerns första par (som pythons headers.get("Set-Cookie").split(";")[0]). */
function forstaCookie(r: Response): string {
  const lista = typeof (r.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie === "function"
    ? (r.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
    : [];
  const rå = lista.length > 0 ? lista[0] : r.headers.get("set-cookie") ?? "";
  return rå.split(";")[0] ?? "";
}

/** Yahoos publika chart-API — global fetch, inga npm-beroenden (fungerar på Vercel serverless). */
async function fetchYahoo(ticker: string, period = "1y", interval = "1d"): Promise<Serie | null> {
  try {
    await kontrolleraHost("query1.finance.yahoo.com");
    const tickerKod = pyQuote(ticker);
    if (!/^[A-Za-z0-9.\-]{1,12}$/.test(ticker)) {
      return null;
    }
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/" + tickerKod + "?range=" + period + "&interval=" + interval;
    const r = await fetch(url, {
      headers: { "User-Agent": "AK1A-Analysis/1.0" },
      redirect: "error", // _IngenRedirect: redirect blockerad → null
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const res = JSON.parse(await r.text())["chart"]["result"][0];
    const meta = (res.meta ?? {}) as Partial<YahooMeta>;
    const q = res["indicators"]["quote"][0];
    const dagar = res["timestamp"];
    const close: number[] = [];
    const high: number[] = [];
    const low: number[] = [];
    const vol: number[] = [];
    for (let i = 0; i < dagar.length; i++) {
      const c = q["close"][i];
      if (c == null) {
        continue; // python: `if c is None: continue` — 0 är giltigt och behålls
      }
      close.push(pyRound(Number(c), 6));
      high.push(pyRound(pyFloat(q["high"][i] || c), 6));
      low.push(pyRound(pyFloat(q["low"][i] || c), 6));
      vol.push(Number(q["volume"][i] || 0));
    }
    if (close.length < 30) {
      return null;
    }
    return {
      close,
      high,
      low,
      vol,
      meta: {
        longName: meta.longName ?? null,
        shortName: meta.shortName ?? null,
        currency: meta.currency ?? null,
        fullExchangeName: meta.fullExchangeName ?? null,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
      },
    };
  } catch {
    return null;
  }
}

/** MarketStack (Business API) — färskhetsvaliderad: data äldre än 7 dagar avvisas. */
async function fetchMarketstack(ticker: string): Promise<Serie | null> {
  const key = process.env.MARKETSTACK_KEY ?? "";
  if (!key) {
    return null;
  }
  const symbol = ticker.replace(".ST", ".XSTO").replace(".st", ".XSTO");
  const franDag = new Date();
  franDag.setDate(franDag.getDate() - 740); // kalenderaritmetik som date.today() - timedelta(days=740)
  const fran = lokalDagIso(franDag);
  try {
    await kontrolleraHost("api.marketstack.com");
    const url =
      "https://api.marketstack.com/v1/eod?access_key=" +
      key +
      "&symbols=" +
      pyQuote(symbol) +
      "&date_from=" +
      fran +
      "&limit=1000";
    const r = await fetch(url, {
      headers: { "User-Agent": "AK1A-Analysis/1.0" },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const rader = ((JSON.parse(await r.text())["data"] ?? []) as Array<{
      date: string;
      close?: number | null;
      high?: number | null;
      low?: number | null;
      volume?: number | null;
    }>);
    if (rader.length < 30) {
      return null;
    }
    // Sortera stigande på datum; avvisa om senaste är för gammal (XSTO kan vara inaktuell)
    rader.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const senast = rader[rader.length - 1].date.slice(0, 10);
    if (dagarMellan(senast, lokalDagIso()) < -7) {
      return null;
    }
    const close = rader.filter((rad) => rad.close).map((rad) => pyRound(Number(rad.close), 6));
    const high = rader.map((rad) => pyRound(pyFloat(rad.high || rad.close), 6));
    const low = rader.map((rad) => pyRound(pyFloat(rad.low || rad.close), 6));
    const vol = rader.map((rad) => Number(rad.volume || 0));
    return { close, high, low, vol, kalla: "marketstack" };
  } catch {
    return null;
  }
}

/** Cookie+crumb-cache per process (samma livslängd som python-motorn). */
const CRUMB_CACHE: { crumb: string | null; cookie: string | null } = { crumb: null, cookie: null };

/** Hämta cookie + crumb för quoteSummary (fc.yahoo.com -> getcrumb). Returnerar [cookie, crumb] eller null. */
async function yahooCrumb(): Promise<[string, string] | null> {
  if (CRUMB_CACHE.crumb && CRUMB_CACHE.cookie) {
    return [CRUMB_CACHE.cookie, CRUMB_CACHE.crumb];
  }
  try {
    await kontrolleraHost("query1.finance.yahoo.com");
    // fc.yahoo.com svarar 404 men sätter cookie — fetch kastar inte på 4xx, så headern går att läsa
    const r = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": "Mozilla/5.0 (AK1A)" },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const cookie = forstaCookie(r);
    if (!cookie) {
      return null;
    }
    const r2 = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": "Mozilla/5.0 (AK1A)", Cookie: cookie },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const crumb = (await r2.text()).trim();
    if (!crumb) {
      return null;
    }
    CRUMB_CACHE.crumb = crumb;
    CRUMB_CACHE.cookie = cookie;
    return [cookie, crumb];
  } catch {
    return null;
  }
}

/** Grundlagda nyckeltal (AKM1-proxy) via Yahoos quoteSummary med crumb.
 * Returnerar null vid allt fel — portfoljen fungerar ändå (graceful). */
async function fetchYahooFundament(ticker: string): Promise<Fundament> {
  try {
    if (!/^[A-Za-z0-9.\-]{1,12}$/.test(ticker)) {
      return null;
    }
    const par = await yahooCrumb();
    if (!par) {
      return null;
    }
    const [cookie, crumb] = par;
    await kontrolleraHost("query1.finance.yahoo.com");
    const tk = pyQuote(ticker);
    const url =
      "https://query1.finance.yahoo.com/v10/finance/quoteSummary/" +
      tk +
      "?modules=summaryDetail,defaultKeyStatistics,financialData&crumb=" +
      pyQuote(crumb);
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (AK1A)", Cookie: cookie },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const res = ((JSON.parse(await r.text())["quoteSummary"] ?? {})["result"] ?? []) as Array<{
      summaryDetail?: Record<string, unknown>;
      defaultKeyStatistics?: Record<string, unknown>;
      financialData?: Record<string, unknown>;
    }>;
    if (res.length === 0) {
      return null;
    }
    const s = res[0].summaryDetail ?? {};
    const k = res[0].defaultKeyStatistics ?? {};
    const f = res[0].financialData ?? {};

    const tal = (d: Record<string, unknown>, nyckel: string): number | null => {
      try {
        const v = ((d[nyckel] ?? {}) as { raw?: number })["raw"] ?? null;
        return v !== null ? pyRound(Number(v), 4) : null;
      } catch {
        return null;
      }
    };

    const ut = {
      pe: tal(s, "trailingPE") || tal(k, "trailingPE"),
      peFwd: tal(s, "forwardPE"),
      pb: tal(k, "priceToBook"),
      utdelning: tal(s, "trailingAnnualDividendYield"),
      vinstmarginal: tal(f, "profitMargins"),
      roe: tal(f, "returnOnEquity"),
      tillvaxt: tal(f, "revenueGrowth"),
      skuldEk: tal(f, "debtToEquity"),
    };
    // endast om minst ett tal kommit igenom
    return Object.values(ut).some((v) => v !== null) ? ut : null;
  } catch {
    return null;
  }
}

/** Stooq (sista utväg) — CSV med dagliga close; används endast för kallor/notering. */
async function fetchStooq(ticker: string): Promise<Serie | null> {
  const sym = ticker.toLowerCase().replace(".st", "").replace("-", "");
  try {
    await kontrolleraHost("stooq.com");
    const url = "https://stooq.com/q/d/l/?s=" + sym + "se&i=d";
    const r = await fetch(url, {
      headers: { "User-Agent": "AK1A-Analysis/1.0" },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const raw = (await r.text()).trim();
    const lines = raw
      .split(/\r?\n/)
      .filter((l) => l.includes(","))
      .map((l) => l.split(","));
    if (lines.length < 40 || !lines[0].includes("Close")) {
      return null;
    }
    const ci = lines[0].indexOf("Close");
    const closes: number[] = [];
    for (const rad of lines.slice(1)) {
      if (rad[ci] === undefined) throw new Error("index utanför"); // som pythons IndexError → null
      if (rad[ci] !== "" && rad[ci] !== "N/D") closes.push(Number(rad[ci]));
    }
    return { close: closes, high: [], low: [], vol: [] };
  } catch {
    return null;
  }
}

/** n-dagars momentum: sista / close[-(n+1)] - 1 (null om serien är för kort). */
function momentum(closes: number[], n: number): number | null {
  if (closes.length <= n || closes[closes.length - n - 1] === 0) {
    return null;
  }
  return closes[closes.length - 1] / closes[closes.length - n - 1] - 1;
}

/** True Range-medelvärde över de sista n dagarna (default 14). */
function atr(highs: number[], lows: number[], closes: number[], n = 14): number | null {
  if (closes.length < n + 1 || highs.length === 0) {
    return null;
  }
  const trs: number[] = [];
  for (let i = -n; i < 0; i++) {
    const h = highs[highs.length + i];
    const l = lows[lows.length + i];
    const cFörra = closes[closes.length + i - 1];
    trs.push(Math.max(h - l, Math.abs(h - cFörra), Math.abs(l - cFörra)));
  }
  return trs.reduce((a, b) => a + b, 0) / trs.length;
}

/** Årlig volatilitet ur log-avkastningar (σ · √252). */
function sigmaYear(closes: number[]): number | null {
  if (closes.length < 30) {
    return null;
  }
  const rets: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0) rets.push(Math.log(closes[i] / closes[i - 1]));
  }
  const m = rets.reduce((a, b) => a + b, 0) / rets.length;
  const varians = rets.reduce((a, r) => a + (r - m) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(varians) * Math.sqrt(252);
}

/** Glidande medelvärde över de sista n stängningarna. */
function ma(closes: number[], n: number): number | null {
  if (closes.length < n) {
    return null;
  }
  return closes.slice(-n).reduce((a, b) => a + b, 0) / n;
}

/** Heuristisk vågklass: impulsvåg / korrigering / basbygge / osatt. */
function vagKlassificering(mom: number | null, pris: number, maRef: number | null): VagKlass {
  if (mom === null) {
    return "osatt";
  }
  if (mom > 0.06 && (maRef === null || pris >= maRef)) {
    return "impulsvåg";
  }
  if (mom < -0.06 && (maRef === null || pris < maRef)) {
    return "korrigering";
  }
  if (Math.abs(mom) <= 0.06) {
    return "basbygge";
  }
  return mom > 0 ? "impulsvåg" : "korrigering";
}

/** Signalkvantisering med tröskel (default 0.03). */
function sign(x: number, t = 0.03): number {
  return x > t ? 1 : x < -t ? -1 : 0;
}

/** Full analys av en ticker: hämtar dag/vecka (Yahoo), Stooq + MarketStack, fundament —
 * sekventiellt i python-motorns exakta ordning — och bygger 25-cellers 5×5-matrisen. */
export async function analyseraTicker(ticker: string): Promise<TickerAnalys> {
  const dagRå = await fetchYahoo(ticker, "2y", "1d");
  const vecka = await fetchYahoo(ticker, "5y", "1wk");
  const stooq = await fetchStooq(ticker);
  const ms = await fetchMarketstack(ticker); // färskhetsvaliderad; null om data >7 dagar gammal
  const kallor = 1 + (stooq ? 1 : 0) + (ms ? 1 : 0);

  let dag: Serie | null = dagRå;
  if (!dag && ms) {
    dag = ms; // MarketStack som fallback när Yahoo fallerar (endast färska data)
  }
  if (!dag) {
    return { ticker, fel: "ingen data (Yahoo/MarketStack)" };
  }

  const c = dag.close;
  const pris = c[c.length - 1];
  const hojd52 = Math.max(...(dag.high.length > 0 ? dag.high : c));
  const lag52 = Math.min(...(dag.low.length > 0 ? dag.low : c));
  const span = Math.max(1e-12, hojd52 - lag52);
  const pos52 = (pris - lag52) / span;

  const moms: Record<Horisont, number | null> = {} as Record<Horisont, number | null>;
  moms.mikro = momentum(c, 5);
  moms.kort = momentum(c, 63);
  moms.medellang = momentum(c, c.length > 252 ? 252 : c.length - 1);
  if (vecka && vecka.close.length > 150) {
    moms.lang = vecka.close[vecka.close.length - 1] / vecka.close[vecka.close.length - 150] - 1;
    moms.mega = vecka.close[vecka.close.length - 1] / vecka.close[0] - 1;
  } else {
    moms.lang = momentum(c, Math.min(400, c.length - 1));
    moms.mega = momentum(c, c.length - 1);
  }

  const ma50 = ma(c, 50);
  const ma200 = ma(c, Math.min(200, c.length));
  const vol20 = dag.vol.length >= 20 ? dag.vol.slice(-20).reduce((a, b) => a + b, 0) / 20 : null;
  const vol90 = dag.vol.length >= 90 ? dag.vol.slice(-90).reduce((a, b) => a + b, 0) / 90 : vol20;
  const voltrend = vol20 && vol90 ? vol20 / vol90 - 1 : null;
  const fib38 = hojd52 - 0.382 * span;
  const fib62 = hojd52 - 0.618 * span;
  const driftAr = sigmaYear(c);
  const a14 = atr(dag.high, dag.low, c);

  const matris: Record<string, number> = {};
  const vager: Record<Horisont, VagKlass> = {} as Record<Horisont, VagKlass>;
  for (const hz of HORIZONTER) {
    const m = moms[hz];
    vager[hz] = vagKlassificering(m, pris, hz === "mikro" || hz === "kort" ? ma50 : ma200);
    matris[`elliott.${hz}`] = m !== null ? sign(m, 0.04) : 0;
    matris[`fibonacci.${hz}`] = pos52 > 0.62 ? 1 : pos52 < 0.38 ? -1 : 0;
    matris[`gann.${hz}`] = m !== null ? sign((driftAr ?? 0) * 0.1 + (m ?? 0) * 0.3, 0.05) : 0;
    const lucasN: Record<Horisont, number> = {
      mikro: 11,
      kort: 29,
      medellang: 76,
      lang: 199,
      mega: Math.min(500, c.length - 1),
    };
    const lm = momentum(c, Math.min(lucasN[hz], c.length - 1));
    matris[`lucas.${hz}`] = lm !== null ? sign(lm, 0.05) : 0;
    if (voltrend !== null && m !== null) {
      matris[`volym.${hz}`] = sign(voltrend * (m > 0 ? 1 : -1), 0.05);
    } else {
      matris[`volym.${hz}`] = 0;
    }
  }

  const celler = TEORIER.flatMap((t) => HORIZONTER.map((h) => matris[`${t}.${h}`]));
  const bull = celler.filter((x) => x > 0).length;
  const bear = celler.filter((x) => x < 0).length;

  const fundament = await fetchYahooFundament(ticker);

  const momentumUt: Record<Horisont, number | null> = {} as Record<Horisont, number | null>;
  for (const hz of HORIZONTER) {
    momentumUt[hz] = moms[hz] !== null ? pyRound(moms[hz] as number, 4) : null;
  }

  return {
    ticker,
    kallor,
    namn: (dag.meta?.longName || dag.meta?.shortName || ticker) as string,
    bors: (dag.meta?.fullExchangeName ?? null) as string | null,
    valuta: (dag.meta?.currency ?? null) as string | null,
    fundament,
    data: {
      pris: pyRound(pris, 4),
      hojd52: pyRound(hojd52, 4),
      lag52: pyRound(lag52, 4),
      pos52: pyRound(pos52, 3),
      sigma_ar: driftAr ? pyRound(driftAr, 4) : null, // python: truthy-kontroll (0 → null)
      atr14: a14 ? pyRound(a14, 4) : null,
      ma50: ma50 ? pyRound(ma50, 4) : null,
      ma200: ma200 ? pyRound(ma200, 4) : null,
      vol20: vol20 ? pyRound(vol20) : null,
      voltrend: voltrend !== null ? pyRound(voltrend, 4) : null, // python: is not None (0 behålls)
      fib38: pyRound(fib38, 4),
      fib62: pyRound(fib62, 4),
    },
    momentum: momentumUt,
    vager,
    matris25: matris,
    sammanfattning: { bull, bear, neutral: 25 - bull - bear },
    notering:
      "Heuristiska proxy-signaler från pris/volym (Yahoo" +
      (stooq ? "+Stooq" : "") +
      ") — pedagogiskt verktyg, inte investeringsråd.",
  };
}

/** Motor-ingång — motsvarar python-main(): stdin {"tickers":[...]} → stdout {"tickers":[...]}.
 * Max 12 tickers, max 4 parallella analyser (ThreadPoolExecutor(4)), resultat i indataordning. */
export async function körAnalysMotor(payload: MotorFraga): Promise<MotorSvar> {
  const tickers = (payload?.tickers ?? []).slice(0, 12);
  const resultat: TickerAnalys[] = new Array(tickers.length);
  let nast = 0;
  const arbetare = Array.from({ length: Math.min(4, tickers.length) }, async () => {
    for (;;) {
      const i = nast++;
      if (i >= tickers.length) break;
      resultat[i] = await analyseraTicker(tickers[i]);
    }
  });
  await Promise.all(arbetare);
  return { tickers: resultat };
}
