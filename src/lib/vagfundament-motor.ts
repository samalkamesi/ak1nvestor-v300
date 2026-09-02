/**
 * AK1A Vagfundament — fundamentalvagornas ekosystem (VAGFUNDAMENT-SPEC P1-P8).
 *
 * TypeScript-port av scripts/vagfundament.py (deterministisk spec: samma
 * indata -> EXAKT samma utdata; engine-user-avrundning replikerar python).
 * Per (aktie, AKM1-variabel V01-V20, horisont) beraknas en deterministisk
 * vagklass for variabelns EGN tidsserie: impulsvag / korrigering / basbygge /
 * osatt (P2: samma data -> samma svar). Horisonter enligt P3 (kvartal/ar).
 * Kalla: Yahoo fundamentals-timeseries pa query2 (ar + kvartal, ~4 ar / 5
 * kvartal tjock historik) — lang horisont (5 ar) blir darfor ofta "osatt".
 * Arighet (P8): saknad data => "osatt", ALDRIG gissa.
 *
 * SERVER-SIDA ONLY: importeras av API-routen — ALDRIG av klientkomponenter.
 * Ren Node TypeScript (global fetch, Node 18+), inga npm-beroenden.
 */

import { promises as dnsloften } from "dns";

// P3 — horisonter for fundamentaldata (kvartal/ar, inte dagar)
const HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"];
const HZ_NAMN: Record<string, string> = {
  mikro: "mikro", kort: "kort", medellang: "medellång",
  lang: "lång", mega: "mega",
};

// P6 — kategorier med AKM1:s kategorivikter (superanalys.ts)
const KATEGORIER: [string, string, number][] = [
  ["tillvaxt", "Tillväxt", 0.15],
  ["vardering", "Värdering", 0.20],
  ["lonsamhet", "Lönsamhet", 0.20],
  ["stabilitet", "Stabilitet", 0.15],
  ["moat", "Moat", 0.15],
  ["katalysator", "Katalysator", 0.05],
  ["risk", "Risk", 0.10],
];

// V01-V20 med ekosystemets betydelser
const VARIABLER: [string, string, string][] = [
  ["V01", "Försäljningstillväxt", "tillvaxt"],
  ["V02", "ARR-tillväxt", "tillvaxt"],
  ["V03", "Intäktsdiversifiering", "tillvaxt"],
  ["V04", "P/S", "vardering"],
  ["V05", "P/B", "vardering"],
  ["V06", "EV/EBITDA", "vardering"],
  ["V07", "Bruttomarginal", "lonsamhet"],
  ["V08", "EBITDA-marginal", "lonsamhet"],
  ["V09", "ROE", "lonsamhet"],
  ["V10", "Skuldsättningsgrad", "stabilitet"],
  ["V11", "Likviditet", "stabilitet"],
  ["V12", "Intäktsstabilitet", "stabilitet"],
  ["V13", "Patent & IP", "moat"],
  ["V14", "Varumärke & Kundlojalitet", "moat"],
  ["V15", "Nätverkseffekter", "moat"],
  ["V16", "Produktlanseringar", "katalysator"],
  ["V17", "Avtal & Partnerskap", "katalysator"],
  ["V18", "Regulatoriska katalysatorer", "katalysator"],
  ["V19", "Kapitalförbrukning & Emission-risk", "risk"],
  ["V20", "Återköp", "risk"],
];
const V_NAMN: Record<string, string> = Object.fromEntries(VARIABLER.map((v) => [v[0], v[1]]));
const V_KAT: Record<string, string> = Object.fromEntries(VARIABLER.map((v) => [v[0], v[2]]));

const VAG_TAL: Record<string, number> = { "impulsvåg": 1, korrigering: -1, basbygge: 0 };

// Variabler som inte kan harledas ur Yahoo-serier (P5: nuvarde-baserade -> osatt)
const OSATTA_VARIABLER = new Set(["V02", "V03", "V06", "V13", "V14", "V15", "V16", "V17", "V18"]);

const ALLOWED_HOSTS = new Set(["query2.finance.yahoo.com"]);

const TS_TYPER = [
  "annualTotalRevenue", "quarterlyTotalRevenue",
  "annualGrossProfit", "quarterlyGrossProfit",
  "annualOperatingIncome", "quarterlyOperatingIncome",
  "annualEbitda", "quarterlyEbitda",
  "annualNetIncome", "quarterlyNetIncome",
  "annualStockholdersEquity", "quarterlyStockholdersEquity",
  "annualTotalDebt", "quarterlyTotalDebt",
  "annualCurrentAssets", "quarterlyCurrentAssets",
  "annualCurrentLiabilities", "quarterlyCurrentLiabilities",
  "annualLongTermDebt",
  "annualCashFlowFromOperating", "quarterlyCashFlowFromOperating",
  "annualCapitalExpenditure", "quarterlyCapitalExpenditure",
  "annualFreeCashFlow", "quarterlyFreeCashFlow",
  "annualShareIssued", "quarterlyShareIssued",
  "annualMarketCap", "quarterlyMarketCap",
  "annualCashAndCashEquivalents", "quarterlyCashAndCashEquivalents",
];

// ── Typer (matchar MotorSvar i src/app/api/vagfundament/route.ts) ────────────

export type Indikator = {
  namn: string;
  kategori: string;
  niva: number | null;
  nivaKalla: "beraknad" | "osatt";
  nuvarde: number | null;
  enhet?: string | null;
  vager: Record<string, string>;
  momentum: Record<string, number | null>;
  medelBekraftad: Record<string, boolean | null>;
};

export type VagfundamentAnalys = {
  ticker: string;
  fel?: string;
  valuta?: string | null;
  dataPer?: string | null;
  indikatorer?: Record<string, Indikator>;
  matris?: Record<string, Record<string, number | null>>;
  kategorier?: Record<string, Record<string, number | null>>;
  total?: Record<string, number | null>;
  sammanfattning?: { impulsvag: number; korrigering: number; basbygge: number; osatt: number };
  notering?: string;
  disclaimer?: string;
};

export type VagfundamentPortfolj = {
  matris: Record<string, Record<string, number | null>>;
  kategorier: Record<string, Record<string, number | null>>;
  total: Record<string, number | null>;
  radTexter: string[];
  totalText: string;
  tackningProcent: number;
  notering?: string;
};

export type MotorSvar = { tickers: VagfundamentAnalys[]; portfolj?: VagfundamentPortfolj };

type VagKlass = "impulsvåg" | "korrigering" | "basbygge" | "osatt";
type Serie = [string, number][]; // [(datum, varde), ...] sorterat stigande
type Serier = Record<string, Serie>;
type Cell = { vag: VagKlass; momentum: number | null; medelBekraftad: boolean | null };

// ── Avrundning: python round() exakt (halv-jamnt pa det binara vardet) ───────

/**
 * Python round(x, n): korrekt avrundning till n decimaler pa det binara
 * vardets EXAKTA decimala expansion, halv-jamnt (banker's rounding), foljt av
 * korrekt konvertering tillbaka till nastan dubbel.nod Raknar med BigInt pa
 * mantissan * 2^exponent * 10^n sa att resultaten ar byte-identiska med
 * python (Math.round + 10^n-skalning ger avvikande halvfall).
 * Obs: inga BigInt-literals (target ar ES2017) — endast BigInt(...)-anrop.
 */
function pyRound(x: number, n = 0): number {
  if (!Number.isFinite(x)) return x;
  const vy = new DataView(new ArrayBuffer(8));
  vy.setFloat64(0, x);
  const bitar = vy.getBigUint64(0);
  const negativ = (bitar >> BigInt(63)) === BigInt(1);
  const expFalt = Number((bitar >> BigInt(52)) & BigInt(0x7ff));
  let t = bitar & BigInt(0xfffffffffffff);
  let e: number;
  if (expFalt === 0) {
    e = -1074; // subnormalt
  } else {
    t |= BigInt(1) << BigInt(52);
    e = expFalt - 1075;
  }
  if (t === BigInt(0)) return x; // +-"0" oforandrad (som python)
  // Skalat vardet |x| * 10^n = (t * 10^n * 2^e) som brak > 0
  let num = t * BigInt(10) ** BigInt(n);
  let den = BigInt(1);
  if (e >= 0) num <<= BigInt(e);
  else den <<= BigInt(-e);
  let q = num / den;
  const r = num % den;
  if (r * BigInt(2) > den || (r * BigInt(2) === den && q % BigInt(2) === BigInt(1))) q += BigInt(1);
  // Rekonstruera decimalstrang och las tillbaka som dubbel (korrekt nastan, som strtod)
  const s = q.toString();
  let str: string;
  if (n <= 0) {
    str = s; // n anvands bara med >= 0 har i motorn; noll-decimalsfallet rakar hit
  } else if (s.length <= n) {
    str = "0." + "0".repeat(n - s.length) + s;
  } else {
    str = s.slice(0, s.length - n) + "." + s.slice(s.length - n);
  }
  return Number((negativ ? "-" : "") + str);
}

// ── Natverk: allowlist + privat-IP-kontroll + fetch (som python) ─────────────

function _privatIp(ip: string): boolean {
  return ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.") ||
    ip.startsWith("169.254.") || ip.startsWith("::1") || ip.startsWith("fe80:") || ip.startsWith("0.") || (
      ip.startsWith("172.") && (() => {
        const del = ip.split(".");
        return del.length > 1 && Number(del[1]) >= 16 && Number(del[1]) <= 31;
      })());
}

/** Kontrollerar FAST vardkonstant mot allowlist + privat-IP (DNS fore anrop). */
async function _kontrolleraHost(hostKonst: string): Promise<void> {
  if (!ALLOWED_HOSTS.has(hostKonst)) throw new Error("blockerad värd");
  const { address } = await dnsloften.lookup(hostKonst, { family: 4 });
  if (_privatIp(address)) throw new Error("blockerad privat IP");
}

/** urllib.request.quote-motsvarighet (safe="/" som python, UTF-8-bytes). */
function _quote(s: string): string {
  const aldrig = /[A-Za-z0-9_.\-~/]/;
  const bytes = new TextEncoder().encode(s);
  let ut = "";
  for (const b of bytes) {
    const ch = String.fromCharCode(b);
    ut += aldrig.test(ch) ? ch : "%" + b.toString(16).toUpperCase().padStart(2, "0");
  }
  return ut;
}

/** HTTP-fel med statuskod (motsvarar python urllib.error.HTTPError). */
class _HttpFel extends Error {
  status: number;
  constructor(status: number) {
    super("HTTP " + status);
    this.status = status;
  }
}

const _OMDIRIGERINGAR = [301, 302, 303, 307, 308]; // HTTPRedirectHandler-uppsattningen

/** GET som text: UA-rubrik, inga omdirigeringar (blockerade som python), kort timeout. */
async function _hamtaText(url: string, cookie?: string | null, timeoutMs = 15000): Promise<string> {
  await _kontrolleraHost("query2.finance.yahoo.com");
  const rubriker: Record<string, string> = { "User-Agent": "Mozilla/5.0 (AK1A)" };
  if (cookie) rubriker["Cookie"] = cookie;
  const res = await fetch(url, { headers: rubriker, redirect: "manual", signal: AbortSignal.timeout(timeoutMs) });
  if (_OMDIRIGERINGAR.includes(res.status)) throw new Error("redirect blockerad");
  if (res.status < 200 || res.status >= 300) throw new _HttpFel(res.status);
  return await res.text();
}

const _CRUMB_CACHE: { crumb: string | null; cookie: string | null } = { crumb: null, cookie: null };

function _forstaSetCookie(res: Response): string {
  // Node >= 19.7 expose getSetCookie(); anvand forsta cookien som pythons headers.get("Set-Cookie")
  const h = res.headers as unknown as { getSetCookie?: () => string[] };
  if (typeof h.getSetCookie === "function") {
    const alla = h.getSetCookie();
    return alla && alla.length ? alla[0] : "";
  }
  return res.headers.get("set-cookie") || "";
}

/** Cookie + crumb enligt analysis_engine._yahoo_crumb-monstret.
 * Anvands ENDAST som reservande nar fundamentals-endpointen kraver crumb
 * (primarflowen under query2 behover ingen crumb). Returnerar null vid fel. */
async function _yahooCrumb(): Promise<[string, string] | null> {
  if (_CRUMB_CACHE.crumb && _CRUMB_CACHE.cookie) return [_CRUMB_CACHE.cookie, _CRUMB_CACHE.crumb];
  try {
    await _kontrolleraHost("query2.finance.yahoo.com");
    // fc.yahoo.com svarar 404 men satter cookie (samma knapp som forlagen)
    let cookie = "";
    try {
      const res = await fetch("https://fc.yahoo.com", {
        headers: { "User-Agent": "Mozilla/5.0 (AK1A)" },
        redirect: "manual",
        signal: AbortSignal.timeout(6000),
      });
      if (!_OMDIRIGERINGAR.includes(res.status)) cookie = _forstaSetCookie(res);
    } catch {
      cookie = ""; // HTTPError/timeout -> tom cookie (python laser felrubriker; fetch kastar inte pa 404)
    }
    cookie = cookie.split(";")[0];
    if (!cookie) return null;
    const res2 = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": "Mozilla/5.0 (AK1A)", Cookie: cookie },
      redirect: "manual",
      signal: AbortSignal.timeout(6000),
    });
    if (res2.status < 200 || res2.status >= 300) return null;
    const crumb = (await res2.text()).trim();
    if (!crumb) return null;
    _CRUMB_CACHE.crumb = crumb;
    _CRUMB_CACHE.cookie = cookie;
    return [cookie, crumb];
  } catch {
    return null;
  }
}

/** {'typnamn': [(datum, varde), ...]} sorterat stigande; Null-rader kastas. */
function _parsaTimeseries(raw: string): [Serier, string | null] {
  const ut: Serier = {};
  let valuta: string | null = null;
  try {
    const d = JSON.parse(raw) as {
      timeseries?: { result?: Record<string, unknown>[] } | null;
    };
    for (const blk of d?.timeseries?.result || []) {
      if (!blk || typeof blk !== "object") continue;
      for (const [namn, rader] of Object.entries(blk)) {
        if (namn === "meta" || namn === "timestamp" || !Array.isArray(rader)) continue;
        const serie: Serie = [];
        for (const rad of rader) {
          if (!rad || typeof rad !== "object") continue;
          const r = rad as { currencyCode?: string; reportedValue?: { raw?: number } | null; asOfDate?: string | number };
          if (valuta === null && r.currencyCode) valuta = r.currencyCode;
          const varde = r.reportedValue ? r.reportedValue.raw : undefined;
          const datum = r.asOfDate;
          if (varde === null || varde === undefined || !datum) continue;
          const f = typeof varde === "number" ? varde : Number(varde); // python float()
          if (Number.isNaN(f)) throw new Error("ogiltigt varde"); // float()-fel forfaller hela parsningen (som python)
          serie.push([String(datum).slice(0, 10), f]);
        }
        if (serie.length) {
          serie.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)); // stabil, som python
          ut[namn] = serie;
        }
      }
    }
  } catch {
    return [{}, null];
  }
  return [ut, valuta];
}

/** Yahoo fundamentals-timeseries (ar + kvartal) via query2.
 * Primart utan crumb; vid 401/403 forsoks crumb+cookie (reservflode).
 * Returnerar (serier, valuta) eller (null, null). */
async function hamtaFundament(ticker: string): Promise<[Serier | null, string | null]> {
  if (!/^[A-Za-z0-9.\-]{1,12}$/.test(ticker)) return [null, null];
  const p2 = Math.floor(Date.now() / 1000);
  const url = ("https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/"
    + _quote(ticker)
    + "?type=" + TS_TYPER.join(",")
    + "&period1=0&period2=" + p2 + "&merge=false");
  let raw: string;
  try {
    raw = await _hamtaText(url);
  } catch (e: unknown) {
    if (!(e instanceof _HttpFel) || (e.status !== 401 && e.status !== 403)) return [null, null];
    const par = await _yahooCrumb();
    if (!par) return [null, null];
    const [cookie, crumb] = par;
    try {
      raw = await _hamtaText(url + "&crumb=" + _quote(crumb), cookie);
    } catch {
      return [null, null];
    }
  }
  const [serier, valuta] = _parsaTimeseries(raw);
  return serier && Object.keys(serier).length > 0 ? [serier, valuta] : [null, null];
}

// ── Seriehjalpmedel ──────────────────────────────────────────────────────────

/** Kvartalsserie som varden (stigande). */
function _kv(data: Serier, namn: string): number[] {
  const ut: number[] = [];
  for (const [, v] of data["quarterly" + namn] || []) ut.push(v);
  return ut;
}

function _ar(data: Serier, namn: string): number[] {
  const ut: number[] = [];
  for (const [, v] of data["annual" + namn] || []) ut.push(v);
  return ut;
}

/** Kvotserie pa matchade datum (P5 enhetlighetsregel: kvartalsvis fore arsvis). */
function _kvot(data: Serier, talTyp: string, namnareTyp: string): number[] {
  const nam = new Map<string, number>();
  for (const [d, v] of data[namnareTyp] || []) nam.set(d, v);
  const ut: number[] = [];
  for (const [d, v] of data[talTyp] || []) {
    const n = nam.has(d) ? nam.get(d) as number : null;
    if (n === null || n === 0 || v === null) continue;
    ut.push(v / n);
  }
  return ut;
}

/** FCF = kassaflode lonande verksamhet minus capex (teckenrobust). */
function _fcfSerie(data: Serier, prefix: string): number[] {
  const capex = new Map<string, number>();
  for (const [d, v] of data[prefix + "CapitalExpenditure"] || []) capex.set(d, v);
  const ut: number[] = [];
  for (const [d, cfo] of data[prefix + "CashFlowFromOperating"] || []) {
    const cx = capex.has(d) ? capex.get(d) as number : null;
    if (cfo === null || cx === null) continue;
    ut.push(cx < 0 ? cfo + cx : cfo - cx);
  }
  return ut;
}

function summa(varden: number[]): number {
  let s = 0;
  for (const v of varden) s += v; // vanster-till-hoger som python sum()
  return s;
}

/** Summa av de 4 senaste kvartalen (null om historiken ar for kort). */
function _rull12(serie: number[]): number | null {
  if (serie.length < 4) return null;
  return summa(serie.slice(-4));
}

/** round() utan -0.0 i utdata (deterministisk normalisering). */
function _r0(x: number | null, n = 2): number | null {
  if (x === null) return null;
  const v = pyRound(x, n);
  return v === 0 ? 0 : v;
}

function _medel(varden: number[]): number | null {
  const v = varden.filter((x) => x !== null);
  return v.length > 0 ? summa(v) / v.length : null;
}

// ── P2: deterministisk klassificering ────────────────────────────────────────

/** Relativ forandring av variabelns eget varde. Guard: bara positiva par —
 * serier som vaxlar tecken (t.ex. ROE genom noll) ger meningslos momentum. */
function _momentum(nu: number | null, forr: number | null): number | null {
  if (nu === null || forr === null) return null;
  if (nu <= 0 || forr <= 0) return null;
  return nu / forr - 1.0;
}

/** P2 exakt — pris-motorns granser for konsekvent ekosystem:
 * impulsvag: momentum > +6% OCH senaste >= horisontens medel
 * korrigering: momentum < -6% OCH senaste <= medel
 * basbygge: |momentum| <= 6%
 * momentum utan medel-bekraftelse -> momentumriktningen galler (dokumenterat).
 * Returnerar [klass, medel_bekraftad]; bekraftad=null nar orelevant. */
function vagKlassificering(mom: number | null, senaste: number, medel: number | null): [VagKlass, boolean | null] {
  if (mom === null) return ["osatt", null];
  if (Math.abs(mom) <= 0.06) return ["basbygge", null];
  if (mom > 0.06) {
    if (medel === null) return ["impulsvåg", null];
    return ["impulsvåg", senaste >= medel];
  }
  if (medel === null) return ["korrigering", null];
  return ["korrigering", senaste <= medel];
}

/** (V, H)-cell enligt P3.
 * mikro: qoq, jamforelse-medel = 4k-rull · kort: yoy, medel = 4 kvartal
 * medellang: arstakt 3 ar, medel = 3 ars · lang: 5 ar · mega: hela serien.
 * invertera=true (V20): minskat aktieantal = positivt momentum (aterekop). */
function _cell(kv: number[], ar: number[], hz: string, invertera = false): Cell {
  let mom: number | null = null;
  let senaste: number | null = null;
  let medel: number | null = null;
  if (hz === "mikro") {
    if (kv.length >= 2) {
      mom = _momentum(kv[kv.length - 1], kv[kv.length - 2]);
      senaste = kv[kv.length - 1];
      medel = _medel(kv.slice(-4));
    }
  } else if (hz === "kort") {
    if (kv.length >= 5) {
      mom = _momentum(kv[kv.length - 1], kv[kv.length - 5]);
      senaste = kv[kv.length - 1];
      medel = _medel(kv.slice(-4));
    }
  } else if (hz === "medellang") {
    if (ar.length >= 4) {
      mom = _momentum(ar[ar.length - 1], ar[ar.length - 4]);
      senaste = ar[ar.length - 1];
      medel = _medel(ar.slice(-3));
    }
  } else if (hz === "lang") {
    if (ar.length >= 6) {
      mom = _momentum(ar[ar.length - 1], ar[ar.length - 6]);
      senaste = ar[ar.length - 1];
      medel = _medel(ar.slice(-5));
    }
  } else if (hz === "mega") {
    if (ar.length >= 4) {
      mom = _momentum(ar[ar.length - 1], ar[0]);
      senaste = ar[ar.length - 1];
      medel = _medel(ar.slice());
    }
  }
  if (mom === null) return { vag: "osatt", momentum: null, medelBekraftad: null };
  if (invertera) {
    mom = -mom;
    senaste = -(senaste as number);
    if (medel !== null) medel = -medel;
  }
  const [klass, bek] = vagKlassificering(mom, senaste as number, medel);
  return { vag: klass, momentum: _r0(mom * 100, 1), medelBekraftad: bek };
}

/** V12 Intaktsstabilitet (P5): ned/upp-antal i intaktsrorelserna ->
 * vag via trend. momentum = (antal upp - antal ned) / antal rorelser.
 * Fonster KRAVS fulla: mikro 3 kv · kort 5 kv (8-kvartsfonstret upp till
 * tillgangligt) · medellang 4 ar · lang 6 ar · mega hela arsserien (>= 4).
 * Ofullstandigt fonster -> osatt (P3: saknas data, gissa aldrig). */
function _v12Celler(data: Serier): Record<string, Cell> {
  const kv = _kv(data, "TotalRevenue");
  const ar = _ar(data, "TotalRevenue");
  const fonster: [string, number[] | null, number | null][] = [
    ["mikro", kv, 3], ["kort", kv, 5],
    ["medellang", ar, 4], ["lang", ar, 6], ["mega", ar, null],
  ];
  const ut: Record<string, Cell> = {};
  for (const [hz, serie, n] of fonster) {
    const minAntal = n !== null ? n : 4;
    if (serie === null || serie.length < minAntal) {
      ut[hz] = { vag: "osatt", momentum: null, medelBekraftad: null };
      continue;
    }
    const f = n !== null && n > 0 ? serie.slice(-n) : serie.slice();
    const rorelser: number[] = [];
    for (let i = 1; i < f.length; i++) rorelser.push(f[i] - f[i - 1]);
    if (rorelser.length === 0) {
      ut[hz] = { vag: "osatt", momentum: null, medelBekraftad: null };
      continue;
    }
    let upp = 0;
    let ned = 0;
    for (const r of rorelser) {
      if (r > 0) upp += 1;
      if (r < 0) ned += 1;
    }
    const mom = (upp - ned) / rorelser.length;
    const [klass, bek] = vagKlassificering(mom, f[f.length - 1], _medel(f));
    ut[hz] = { vag: klass, momentum: _r0(mom * 100, 1), medelBekraftad: bek };
  }
  return ut;
}

// ── Niva-mappning (AKM1-trosklar 0-5, deterministisk) ────────────────────────

/** Avrundning halv upp + clamp 0-5 (deterministisk, inga bankers rounding). */
function _r5(x: number): number {
  return Math.max(0, Math.min(5, Math.trunc(x + 0.5)));
}

/** Linjar interpolering mellan AKM1-trosklarna (0 vid negativ, 3 vid p3,
 * 5 vid p5 och ovanfor) — for variabler dar hogre ar battre. */
function _nivaTrappa(varde: number | null, p3: number, p5: number): number | null {
  if (varde === null) return null;
  if (varde < 0) return 0;
  if (varde >= p5) return 5;
  if (varde >= p3) return _r5(3 + (2 * (varde - p3)) / (p5 - p3));
  return _r5((3 * varde) / p3);
}

/** V10 (lagre ar battre): <=0.5x -> 5 · ~1.5x -> 3 · >=3x -> 0. */
function _nivaSkuld(d: number | null): number | null {
  if (d === null) return null;
  const dd = Math.max(d, 0.0);
  if (dd <= 0.5) return 5;
  if (dd <= 1.5) return _r5(5 - 2 * (dd - 0.5));
  if (dd < 3.0) return _r5((3 * (3.0 - dd)) / 1.5);
  return 0;
}

/** V11 kvickkvot-proxy: <1 -> 0 · ~1.5 -> 3 · >=2 -> 5. */
function _nivaLikviditet(c: number | null): number | null {
  if (c === null) return null;
  if (c < 1) return 0;
  if (c >= 2) return 5;
  if (c >= 1.5) return _r5(3 + (2 * (c - 1.5)) / 0.5);
  return _r5((3 * (c - 1)) / 0.5);
}

/** V04/V05: position i egen historik (sektor finns inte i kalldata).
 * Kraver minst 3 historikpunkter — annars osatt. */
function _nivaPositionHist(nu: number | null, hist: number[]): number | null {
  if (nu === null || !hist || hist.length < 3) return null;
  const lo = Math.min(...hist);
  const hi = Math.max(...hist);
  if (hi <= lo) return 3;
  if (nu > hi) return 0;
  const pos = (nu - lo) / (hi - lo);
  if (pos <= 0.2) return 5;
  if (pos <= 0.4) return 4;
  if (pos <= 0.6) return 3;
  if (pos <= 0.8) return 2;
  return 1;
}

// ── Indikator-bygge ──────────────────────────────────────────────────────────

function _tomCell(): Cell {
  return { vag: "osatt", momentum: null, medelBekraftad: null };
}

function _indFranCeller(
  vid: string,
  celler: Record<string, Cell>,
  nuvarde: number | null,
  niva: number | null,
  enhet: string | null,
): Indikator {
  const vager: Record<string, string> = {};
  const momentum: Record<string, number | null> = {};
  const medelBekraftad: Record<string, boolean | null> = {};
  for (const hz of HORIZONTER) {
    vager[hz] = celler[hz].vag;
    momentum[hz] = celler[hz].momentum;
    medelBekraftad[hz] = celler[hz].medelBekraftad;
  }
  return {
    namn: V_NAMN[vid],
    kategori: V_KAT[vid],
    niva,
    nivaKalla: niva !== null && niva !== undefined ? "beraknad" : "osatt",
    nuvarde,
    enhet,
    vager,
    momentum,
    medelBekraftad,
  };
}

function _indSerie(
  vid: string,
  kv: number[],
  ar: number[],
  nuvarde: number | null,
  niva: number | null,
  enhet: string | null,
  invertera = false,
): Indikator {
  const celler: Record<string, Cell> = {};
  for (const hz of HORIZONTER) celler[hz] = _cell(kv, ar, hz, invertera);
  return _indFranCeller(vid, celler, nuvarde, niva, enhet);
}

function _indOsatt(vid: string): Indikator {
  const celler: Record<string, Cell> = {};
  for (const hz of HORIZONTER) celler[hz] = _tomCell();
  return _indFranCeller(vid, celler, null, null, null);
}

/** P5: standardiserad faltmappning -> variabelserier -> (niva, vag)-par. */
function byggIndikatorer(data: Serier): Record<string, Indikator> {
  const ind: Record<string, Indikator> = {};

  const revKv = _kv(data, "TotalRevenue");
  const revAr = _ar(data, "TotalRevenue");
  const rev12 = _rull12(revKv);

  // V01 — omsattningens yoy-takt som grundvara; vagen = intaktsseriens momentum
  let v01: number | null = null;
  if (revKv.length >= 5 && summa(revKv.slice(-5, -1)) > 0) {
    v01 = summa(revKv.slice(-4)) / summa(revKv.slice(-5, -1)) - 1.0;
  } else if (revAr.length >= 2 && revAr[revAr.length - 2] > 0) {
    v01 = revAr[revAr.length - 1] / revAr[revAr.length - 2] - 1.0;
  }
  ind["V01"] = _indSerie("V01", revKv, revAr,
    v01 !== null ? pyRound(v01, 4) : null,
    _nivaTrappa(v01, 0.10, 0.20), "procent");

  // V04 — P/S: arsserie (bor svardemang / omsattning); historik enligt P5
  const psAr = _kvot(data, "annualMarketCap", "annualTotalRevenue");
  const mcapKv = _kv(data, "MarketCap");
  let psNu: number | null = null;
  if (mcapKv.length > 0 && rev12 !== null && rev12 > 0) {
    psNu = mcapKv[mcapKv.length - 1] / rev12;
  } else if (psAr.length > 0) {
    psNu = psAr[psAr.length - 1];
  }
  ind["V04"] = _indSerie("V04", [], psAr,
    psNu !== null ? pyRound(psNu, 3) : null,
    _nivaPositionHist(psNu, psAr), "kvot");

  // V05 — P/B: kvartalsserie (mcap/ekvitet) + arsserie for langre horisonter
  const pbKv = _kvot(data, "quarterlyMarketCap", "quarterlyStockholdersEquity");
  const pbAr = _kvot(data, "annualMarketCap", "annualStockholdersEquity");
  const pbNu = pbKv.length > 0 ? pbKv[pbKv.length - 1] : (pbAr.length > 0 ? pbAr[pbAr.length - 1] : null);
  const pbHist = pbAr.length >= 3 ? pbAr : pbKv;
  ind["V05"] = _indSerie("V05", pbKv, pbAr,
    pbNu !== null ? pyRound(pbNu, 3) : null,
    _nivaPositionHist(pbNu, pbHist), "kvot");

  // V07 — bruttomarginal (rull-12 for niva)
  const gpKv = _kvot(data, "quarterlyGrossProfit", "quarterlyTotalRevenue");
  const gpAr = _kvot(data, "annualGrossProfit", "annualTotalRevenue");
  let gpRull: number | null = null;
  const gpKvR = _kv(data, "GrossProfit");
  if (gpKvR.length >= 4 && rev12 !== null && rev12 > 0) {
    gpRull = summa(gpKvR.slice(-4)) / rev12;
  } else if (gpAr.length > 0) {
    gpRull = gpAr[gpAr.length - 1];
  }
  ind["V07"] = _indSerie("V07", gpKv, gpAr,
    gpRull !== null ? pyRound(gpRull, 4) : null,
    _nivaTrappa(gpRull, 0.25, 0.40), "procent");

  // V08 — EBITDA-marginal (om ebitda saknas: rorelseresultat enligt P5)
  const ebKvA = _kvot(data, "quarterlyEbitda", "quarterlyTotalRevenue");
  const ebKv = ebKvA.length > 0 ? ebKvA : _kvot(data, "quarterlyOperatingIncome", "quarterlyTotalRevenue");
  const ebArA = _kvot(data, "annualEbitda", "annualTotalRevenue");
  const ebAr = ebArA.length > 0 ? ebArA : _kvot(data, "annualOperatingIncome", "annualTotalRevenue");
  const ebKvRA = _kv(data, "Ebitda");
  const ebKvR = ebKvRA.length > 0 ? ebKvRA : _kv(data, "OperatingIncome");
  let ebRull: number | null = null;
  if (ebKvR.length >= 4 && rev12 !== null && rev12 > 0) {
    ebRull = summa(ebKvR.slice(-4)) / rev12;
  } else if (ebAr.length > 0) {
    ebRull = ebAr[ebAr.length - 1];
  }
  ind["V08"] = _indSerie("V08", ebKv, ebAr,
    ebRull !== null ? pyRound(ebRull, 4) : null,
    _nivaTrappa(ebRull, 0.10, 0.20), "procent");

  // V09 — ROE (rull-12 pa snittekvitet enligt AKM1:s formel)
  const roeKv = _kvot(data, "quarterlyNetIncome", "quarterlyStockholdersEquity");
  const roeAr = _kvot(data, "annualNetIncome", "annualStockholdersEquity");
  const niKv = _kv(data, "NetIncome");
  const eqKv = _kv(data, "StockholdersEquity");
  let roeNu: number | null = null;
  if (niKv.length >= 4 && eqKv.length >= 5 && eqKv[eqKv.length - 5] + eqKv[eqKv.length - 1] !== 0) {
    roeNu = summa(niKv.slice(-4)) / ((eqKv[eqKv.length - 5] + eqKv[eqKv.length - 1]) / 2);
  } else if (roeAr.length > 0) {
    roeNu = roeAr[roeAr.length - 1];
  }
  ind["V09"] = _indSerie("V09", roeKv, roeAr,
    roeNu !== null ? pyRound(roeNu, 4) : null,
    _nivaTrappa(roeNu, 0.10, 0.20), "procent");

  // V10 — skuldsattningsgrad (total skuld / ekvitet)
  const deKv = _kvot(data, "quarterlyTotalDebt", "quarterlyStockholdersEquity");
  const deAr = _kvot(data, "annualTotalDebt", "annualStockholdersEquity");
  const deNu = deKv.length > 0 ? deKv[deKv.length - 1] : (deAr.length > 0 ? deAr[deAr.length - 1] : null);
  ind["V10"] = _indSerie("V10", deKv, deAr,
    deNu !== null ? pyRound(deNu, 3) : null,
    _nivaSkuld(deNu), "kvot");

  // V11 — likviditet (omsattningstillgangar / kortfristiga skulder)
  const liKv = _kvot(data, "quarterlyCurrentAssets", "quarterlyCurrentLiabilities");
  const liAr = _kvot(data, "annualCurrentAssets", "annualCurrentLiabilities");
  const liNu = liKv.length > 0 ? liKv[liKv.length - 1] : (liAr.length > 0 ? liAr[liAr.length - 1] : null);
  ind["V11"] = _indSerie("V11", liKv, liAr,
    liNu !== null ? pyRound(liNu, 3) : null,
    _nivaLikviditet(liNu), "kvot");

  // V12 — intaktsstabilitet via ned/upp-antal (egen celllogik)
  ind["V12"] = _indFranCeller("V12", _v12Celler(data), null, null, null);

  // V19 — FCF som serie; niva via runway (kassa / forbranning).
  // FCF = CFO - capex enligt P5; om nagon komponent saknas i kallean faller
  // motorn tillbaka pa Yahoo:s egna FreeCashFlow-serie (samma endpoint).
  let fcfKv = _fcfSerie(data, "quarterly");
  let fcfAr = _fcfSerie(data, "annual");
  if (fcfKv.length === 0) fcfKv = _kv(data, "FreeCashFlow");
  if (fcfAr.length === 0) fcfAr = _ar(data, "FreeCashFlow");
  let fcf12 = _rull12(fcfKv);
  if (fcf12 === null && fcfAr.length > 0) fcf12 = fcfAr[fcfAr.length - 1];
  const kassaKv = _kv(data, "CashAndCashEquivalents");
  const kassaAr = _ar(data, "CashAndCashEquivalents");
  const kassaNu = kassaKv.length > 0 ? kassaKv[kassaKv.length - 1] : (kassaAr.length > 0 ? kassaAr[kassaAr.length - 1] : null);
  let v19Niva: number | null = null;
  if (fcf12 !== null) {
    if (fcf12 > 0) {
      v19Niva = 5;
    } else if (kassaNu !== null && fcf12 < 0) {
      v19Niva = kassaNu / Math.abs(fcf12) >= 3 ? 3 : 0;
    } else if (fcf12 === 0) {
      v19Niva = 3;
    }
  }
  ind["V19"] = _indSerie("V19", fcfKv, fcfAr,
    fcf12 !== null ? pyRound(fcf12 / 1e6, 1) : null,
    v19Niva, "miljoner (valuta)");

  // V20 — aktieantal som serie; INVERTERAD momentum (aterekop = minskning)
  const scKv = _kv(data, "ShareIssued");
  const scAr = _ar(data, "ShareIssued");
  let v20Delta: number | null = null;
  if (scKv.length >= 5 && scKv[scKv.length - 5] > 0) {
    v20Delta = scKv[scKv.length - 1] / scKv[scKv.length - 5] - 1.0;
  } else if (scAr.length >= 2 && scAr[scAr.length - 2] > 0) {
    v20Delta = scAr[scAr.length - 1] / scAr[scAr.length - 2] - 1.0;
  }
  let v20Niva: number | null = null;
  if (v20Delta !== null) {
    if (v20Delta > 0.005) {
      v20Niva = 0; // utspadande emissioner
    } else if (v20Delta >= -0.005) {
      v20Niva = 3; // neutral aktivitet
    } else {
      v20Niva = (fcf12 ?? 0) > 0 ? 5 : 1; // aterekop: FCF-finansierat?
    }
  }
  ind["V20"] = _indSerie("V20", scKv, scAr,
    v20Delta !== null ? _r0(v20Delta * 100, 2) : null,
    v20Niva, "procent", true);

  // V02/V03/V06/V13-V18 — nuvarde-baserade i AKM1, ingen serie i kallan -> osatt
  for (const vid of [...OSATTA_VARIABLER].sort()) {
    ind[vid] = _indOsatt(vid);
  }
  const ut: Record<string, Indikator> = {};
  for (const [vid] of VARIABLER) ut[vid] = ind[vid];
  return ut;
}

// ── Analys per ticker ────────────────────────────────────────────────────────

/** P6: aggregerat celltal (-1..+1) -> klasstext for rapportrader. */
function _klassFranTal(tal: number | null | undefined): string {
  if (tal === null || tal === undefined) return "osatt";
  if (tal >= 0.5) return "impulsvåg";
  if (tal <= -0.5) return "korrigering";
  return "basbygge";
}

async function analyseraTicker(ticker: string): Promise<VagfundamentAnalys> {
  const [serier, valuta] = await hamtaFundament(ticker);
  if (!serier) {
    return { ticker, fel: "ingen fundamentaldata (Yahoo fundamentals-timeseries)" };
  }

  const indikatorer = byggIndikatorer(serier);
  const matris: Record<string, Record<string, number | null>> = {};
  for (const [vid] of VARIABLER) {
    matris[vid] = {};
    for (const hz of HORIZONTER) {
      const k = indikatorer[vid].vager[hz];
      matris[vid][hz] = k in VAG_TAL ? VAG_TAL[k] : null;
    }
  }

  // Kategori-bild (7x5): enkel viktad okvot per kategori
  const kategorier: Record<string, Record<string, number | null>> = {};
  for (const [kid] of KATEGORIER) {
    kategorier[kid] = {};
    for (const hz of HORIZONTER) {
      const celler = VARIABLER
        .filter(([v, , kat]) => kat === kid && matris[v][hz] !== null && matris[v][hz] !== undefined)
        .map(([v]) => matris[v][hz] as number);
      kategorier[kid][hz] = celler.length > 0 ? pyRound(summa(celler) / celler.length, 3) : null;
    }
  }

  // AKM1-helhet: kategorierna viktade med AKM1:s kategorivikter
  const total: Record<string, number | null> = {};
  for (const hz of HORIZONTER) {
    let tal = 0.0;
    let vik = 0.0;
    for (const [kid, , vikt] of KATEGORIER) {
      const t = kategorier[kid][hz];
      if (t !== null && t !== undefined) {
        tal += t * vikt;
        vik += vikt;
      }
    }
    total[hz] = vik > 0 ? pyRound(tal / vik, 3) : null;
  }

  let impulsvag = 0;
  let korrigering = 0;
  let basbygge = 0;
  let osatt = 0;
  for (const [vid] of VARIABLER) {
    for (const hz of HORIZONTER) {
      const x = matris[vid][hz];
      if (x === null || x === undefined) osatt += 1;
      else if (x > 0) impulsvag += 1;
      else if (x < 0) korrigering += 1;
      else basbygge += 1;
    }
  }
  const sammanfattning = { impulsvag, korrigering, basbygge, osatt };

  // Senaste rapportdatum for kontext
  const datum = new Set<string>();
  for (const namn of ["quarterlyTotalRevenue", "quarterlyStockholdersEquity", "quarterlyShareIssued"]) {
    const serie = serier[namn];
    if (serie && serie.length > 0) datum.add(serie[serie.length - 1][0]);
  }
  let dataPer: string | null = null;
  for (const d of datum) if (dataPer === null || d > dataPer) dataPer = d;

  return {
    ticker,
    valuta,
    dataPer,
    indikatorer,
    matris,
    kategorier,
    total,
    sammanfattning,
    notering: (
      "Fundamentalserier från Yahoo (query2): cirka 4 år årsdata och 5 kvartal — "
      + "lång horisont (5 år) och delar av historiken är därför ofta osatta. "
      + "Momentumklassificering enligt ekosystemets gemensamma gränser; celler utan "
      + "medel-bekräftelse redovisas med momentumriktningen. Återköp (V20) läses inverted: "
      + "minskat aktieantal = positiv våg."
    ),
    disclaimer: (
      "AK1A Vågfundament är ett pedagogiskt analysverktyg — inte investeringsråd. "
      + "Klassificeringar är deterministiska hjälpmätare på fundamentaldata från Yahoo Finance."
    ),
  };
}

// ── P6: portfoljsaggregering (forst varje aktie, sedan helheten) ──────────────

/** Saknad vikt => medel av angivna vikter (eller 1.0 om inga angivna). */
function _normaliseraVikter(resultat: VagfundamentAnalys[], vikter: Record<string, number>): Record<string, number> {
  const angivna = Object.values(vikter).filter((v) => typeof v === "number" && v > 0);
  const standard = angivna.length > 0 ? summa(angivna) / angivna.length : 1.0;
  const ut: Record<string, number> = {};
  for (const r of resultat) {
    const v = vikter[r.ticker];
    ut[r.ticker] = typeof v === "number" && v > 0 ? v : standard;
  }
  return ut;
}

function portfoljaggregera(resultat: VagfundamentAnalys[], vikterObj: Record<string, number>): VagfundamentPortfolj {
  const viktTab = _normaliseraVikter(resultat, vikterObj);

  // Cellvis viktat genomsnitt (null-hopp) over de 20x5 cellerna
  const matris: Record<string, Record<string, number | null>> = {};
  for (const [vid] of VARIABLER) {
    matris[vid] = {};
    for (const hz of HORIZONTER) {
      let tal = 0.0;
      let vik = 0.0;
      for (const r of resultat) {
        if (r.fel || !r.matris) continue;
        const cell = (r.matris[vid] || {})[hz];
        if (cell === null || cell === undefined) continue;
        tal += cell * viktTab[r.ticker];
        vik += viktTab[r.ticker];
      }
      matris[vid][hz] = vik > 0 ? pyRound(tal / vik, 3) : null;
    }
  }

  const kategorier: Record<string, Record<string, number | null>> = {};
  for (const [kid] of KATEGORIER) {
    kategorier[kid] = {};
    for (const hz of HORIZONTER) {
      const celler = VARIABLER
        .filter(([v, , kat]) => kat === kid && matris[v][hz] !== null && matris[v][hz] !== undefined)
        .map(([v]) => matris[v][hz] as number);
      kategorier[kid][hz] = celler.length > 0 ? pyRound(summa(celler) / celler.length, 3) : null;
    }
  }

  const total: Record<string, number | null> = {};
  for (const hz of HORIZONTER) {
    let tal = 0.0;
    let vik = 0.0;
    for (const [kid, , vikt] of KATEGORIER) {
      const t = kategorier[kid][hz];
      if (t !== null && t !== undefined) {
        tal += t * vikt;
        vik += vikt;
      }
    }
    total[hz] = vik > 0 ? pyRound(tal / vik, 3) : null;
  }

  // "Var ligger portfoljen i genomsnitt": starkaste horisont per kategori
  const radTexter: string[] = [];
  for (const [kid, knamn] of KATEGORIER) {
    let basta: string | null = null;
    let belopp = 0.0;
    for (const hz of HORIZONTER) {
      const t = kategorier[kid][hz];
      if (t !== null && t !== undefined && Math.abs(t) >= belopp) {
        belopp = Math.abs(t);
        basta = hz;
      }
    }
    radTexter.push(knamn + ": " + (basta ? _klassFranTal(kategorier[kid][basta]) : "osatt")
      + (basta ? " på " + HZ_NAMN[basta] : ""));
  }

  let totalHz: string | null = null;
  let totalBelopp = 0.0;
  for (const hz of HORIZONTER) {
    const t = total[hz];
    if (t !== null && t !== undefined && Math.abs(t) >= totalBelopp) {
      totalBelopp = Math.abs(t);
      totalHz = hz;
    }
  }

  let okVikt = 0.0;
  for (const r of resultat) if (!r.fel) okVikt += viktTab[r.ticker];
  const allVikt = summa(Object.values(viktTab));

  return {
    matris,
    kategorier,
    total,
    radTexter,
    totalText: totalHz
      ? ("Portföljen i genomsnitt: " + _klassFranTal(total[totalHz])
        + (totalHz ? " på " + HZ_NAMN[totalHz] : ""))
      : "Portföljen i genomsnitt: osatt",
    tackningProcent: allVikt > 0 ? pyRound((100 * okVikt) / allVikt) : 0,
    notering: (
      "Cellvis viktat genomsnitt per (variabel, horisont) utan null-hopp; "
      + "kategori- och totalrader enligt AKM1:s kategorivikter. Aggregerade tal mellan "
      + "−1 och +1; klassgränser vid ±0,5. Pedagogiskt verktyg — inte investeringsråd."
    ),
  };
}

// ── Ingang: kor motorn (motsvarar python-main, max 4 samtidiga) ──────────────

async function _kartlangdMedGrans<T, R>(objekt: T[], grans: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const resultat: R[] = new Array(objekt.length);
  let index = 0;
  const arbetare = Array.from({ length: Math.min(grans, objekt.length) }, async () => {
    while (index < objekt.length) {
      const i = index++;
      resultat[i] = await fn(objekt[i]);
    }
  });
  await Promise.all(arbetare);
  return resultat;
}

/**
 * Kor vagfundamentmotorn: per ticker en VagfundamentAnalys (20x5-matris +
 * indikatorer + sammanfattning) och — om vikter anges — en P6-portfolj-
 * aggregering (viktat cellvis + kategorirader + totalrad + radTexter + tackning).
 * Max 12 tickers per anrop (som python). Deterministisk: samma indata ->
 * samma utdata (givet samma kalldata).
 */
export async function körVagfundament(payload: { tickers: string[]; vikter?: Record<string, number> }): Promise<MotorSvar> {
  const tickers = (payload?.tickers || []).slice(0, 12);
  const vikter = payload?.vikter || {};
  const resultat = await _kartlangdMedGrans(tickers, 4, analyseraTicker);
  const ut: MotorSvar = { tickers: resultat };
  if (Object.keys(vikter).length > 0 && tickers.length > 0) {
    ut.portfolj = portfoljaggregera(resultat, vikter);
  }
  return ut;
}

/**
 * Balansposter för externa verktyg (t.ex. netnet-skannern): senaste ÅRS-
 * värdet per post via samma timeseries-flöde som motorn — en gemensam
 * Yahoo-väg (query2, 30+ typer i ett anrop, crumb-reserv vid 401/403).
 */
export async function hamtaBalansPoster(
  ticker: string
): Promise<{
  currentAssets: number | null;
  currentLiabilities: number | null;
  longTermDebt: number | null;
  shareIssued: number | null;
  valuta: string | null;
} | null> {
  const [data, valuta] = await hamtaFundament(ticker);
  if (!data) return null;
  const sista = (namn: string): number | null => {
    const arr = _ar(data, namn);
    return arr.length > 0 ? arr[arr.length - 1] : null;
  };
  return {
    currentAssets: sista("CurrentAssets"),
    currentLiabilities: sista("CurrentLiabilities"),
    longTermDebt: sista("LongTermDebt"),
    shareIssued: sista("ShareIssued"),
    valuta,
  };
}
