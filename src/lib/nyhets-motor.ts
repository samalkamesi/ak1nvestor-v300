/**
 * AK1A NYHETSMOTOR — intelligent nyhetshämtning + ranking + pedagogisk AK1A-not.
 *
 * Rollen: EN server-side ingång (hamtaNyhetsFlode) som samlar elevens hela
 * nyhetsvärld — portföljens bolag (Yahoo RSS med search-fallback), bevaknings-
 * listan, utvalda ämneskanaler och egna RSS-flöden — och levererar EN rankad,
 * deduplicerad lista med intelligent påverkanspoäng (0–100) och en pedagogisk
 * AK1A-koppling (V-variabler + en reflekterande fråga — ALDRIG köp/sälj).
 *
 * Bygger vidare på husets mönster:
 *   - aktie-nyheter.tsx : Yahoo allow-list (query1/query2), 6 s timeout,
 *     User-Agent "Mozilla/5.0 (AK1A)" — här på serversidan.
 *   - datacache.ts      : lasEllerHamta-cachen (30 min) — "med tiden söka via
 *     vår egen databas".
 *   - konfluens-motor.ts: motorfilosofin — determinism, allSettled, graceful.
 *   - ekosystem.ts      : AKM1 (V01–V20) som auktoritativ källa för noten.
 *
 * SÄKERHET (SSRF): hamtaAllmantRss hämtar BARA validerade https-URL:er —
 * valideraRssUrl blockerar localhost, privata IP-intervall (127/10/0/
 * 172.16–31/192.168/169.254/100.64 CGNAT), IPv6 loopback/link-local/ULA,
 * *.local/*.internal, numeriska värdar, inloggningsuppgifter i URL samt svar
 * över 512 KB. Även den SLUTLIGA URL:en efter omdirigeringar granskas om igen.
 * (DNS-rebinding ligger bortom den här motorns hotmodell — dokumenterat.)
 *
 * FELFILOSOFI (P8-graceful): motorn kastar ALDRIG — varje hämtare tolererar
 * parse-fel och nätverksfel och returnerar en tom array; flödet levererar
 * alltid en array (tom vid totalt motstånd).
 *
 * DETERMINISM (P2): id är en deterministisk hash av länk+rubrik; rankingen
 * beror bara av rubrik/tickers/kontext — samma indata ger samma flöde (givet
 * samma nyhetsunderlag).
 *
 * CACHE-NYCKEL: lasEllerHamta i datacache.ts kräver ticker ≤ 12 tecken och en
 * av de fyra cache-typerna, så nyhetsflödets nyckel blir "nyh-{8 tecken hash}"
 * (12 tecken, godkänt mönster) med typ "analys" — filerna döps
 * analys-nyh_<hash>.json och kolliderar aldrig med riktiga tickers (inget
 * bolag heter "nyh-…").
 *
 * SERVER-SIDE ONLY — inget "use client", inga klientimporter.
 * Pedagogiskt verktyg — information, inte investeringsråd.
 */
import { lasEllerHamta } from "./datacache";

// ── Publika typer ────────────────────────────────────────────────────────────

/** En nyhet i flödet — allt UI:t behöver, med pedagogisk AK1A-koppling. */
export type Nyhet = {
  /** Deterministisk hash av länk+rubrik (stabil mellan anrop/sessioner). */
  id: string;
  rubrik: string;
  /** Källnamn, t.ex. "Yahoo · VOLV-B" eller "SVT Ekonomi". */
  kalla: string;
  lank: string | null;
  /** Epoch-milliseconds eller null när flödet saknar datum. */
  tid: number | null;
  /** Matchade tickers (portfölj/bevakning) ur hämtningen eller rubriken. */
  tickers: string[];
  /** "mina-aktier" | "bevakning" | "amne:..." | "rss:...". */
  kanal: string;
  /** 0–100 intelligent påverkanspoäng (raknaPaverkan). */
  paverkan: number;
  /** Pedagogisk analys — ALDRIG köp/sälj, aldrig prognos. */
  ak1aNot: {
    /** Max 2 st, t.ex. ["V01","V07"], ur AKM1 V01–V20. */
    vVariables: string[];
    /** 1–2 meningar reflekterande FRÅGA till eleven. */
    tanke: string;
  } | null;
};

/** En rå flödespost ur RSS/Atom/search innan ranking (internt + i hämtare). */
export type FlodeItem = {
  rubrik: string;
  lank: string | null;
  tid: number | null;
  /** Utgivare ur Yahoo search-news ("Reuters") — valfri. */
  utgivare?: string;
};

/** Kontext för ranking: elevens portfölj och bevakningslista. */
export type PaverkanKontext = {
  portfolj?: string[];
  bevakning?: string[];
};

/** Konfiguration till hamtaNyhetsFlode — alla fält valfria. */
export type NyhetsFlodeKonfig = {
  /** Portföljens tickers (max 15, Yahoo-syntax t.ex. "VOLV-B.ST"). */
  tickers?: string[];
  /** Bevakningslistans tickers (max 15). */
  bevakning?: string[];
  /** Ämneskanaler via id i STANDARD_AMNESKANALER (max 6). */
  amnen?: string[];
  /** Egna RSS/Atom-URL:er (max 5, https + SSRF-validerade). */
  rssUrls?: string[];
};

/** En förvald ämneskanal (alla URL:er verifierade med riktig hämtning). */
export type Amneskanal = {
  id: string;
  namn: string;
  url: string;
  beskrivning: string;
};

// ── Konstanter och gränser ───────────────────────────────────────────────────

const TIMEOUT_MS = 6000;
const MAX_SVAR_TECKEN = 512 * 1024; // 512 KB — större svar avvisas helhjärtat
const MAX_TICKERS = 15;
const MAX_BEVAKNING = 15;
const MAX_AMNEN = 6;
const MAX_RSS_URLS = 5;
const MAX_FLODE = 40;
const PER_TICKER = 10; // RSS-item per ticker
const PER_SOK = 5; // search-news per ticker (fallback)
const PER_KANAL = 12; // item per ämneskanal/egen RSS
const OMGNING_STORLEK = 4; // tickers i omgång — Yahoo-vänligt (aktie-nyheter kör 3)

/** Samma ticker-format som övriga motorer (Yahoos syntax). */
const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/** Allow-list: Yahoo RSS-värden (query1/query2 gäller search-fallbacken). */
const YAHOO_RSS_VARD = "feeds.finance.yahoo.com";
const YAHOO_SEARCH_VARDAR: readonly string[] = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

const ANVANDAR_AGENT = "Mozilla/5.0 (AK1A)";
const ACCEPT_RSS = "application/rss+xml, application/atom+xml, application/xml, text/xml, application/json;q=0.9, */*;q=0.8";

/**
 * STANDARD_AMNESKANALER — verifierade 2026-09 med riktig node-fetch (RSS-XML
 * med items inom 512 KB). Ej godkända kandidater vid samma test: Efn.se
 * (1,2 MB > taket), MFN (531 KB > taket), Finansliv (staled 2024), Breakit /
 * Placera / Aktiespararna / Realtid / Ny Teknik / Computer Sweden (404),
 * Yahoo ^OMXSPI-region SE (0 items).
 */
export const STANDARD_AMNESKANALER: readonly Amneskanal[] = [
  {
    id: "svt-ekonomi",
    namn: "SVT Ekonomi",
    url: "https://www.svt.se/nyheter/ekonomi/rss.xml",
    beskrivning: "Svenska ekonominyheter från SVT (cirka 100 poster, 57 KB).",
  },
  {
    id: "di",
    namn: "Dagens industri",
    url: "https://www.di.se/rss",
    beskrivning: "Börs och näringsliv (cirka 20 poster, 24 KB — vissa artiklar bakom betalvägg).",
  },
  {
    id: "privata-affarer",
    namn: "Privata Affärer",
    url: "https://www.privataaffarer.se/rss.xml",
    beskrivning: "Börs, aktier och privatekonomi (cirka 100 poster, 105 KB).",
  },
  {
    id: "yahoo-varlden",
    namn: "Yahoo Finance — världsmarknaden",
    url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC&region=US&lang=en-US",
    beskrivning: "Världens börser via Yahoo Finance (engelska, cirka 20 poster, 14 KB).",
  },
];

// ── Deterministisk hash + id ─────────────────────────────────────────────────

/** FNV-1a i två strömmar → 16 hex-tecken. Deterministisk, inga beroenden. */
function hashNx(text: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x83d63f73;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ ((c + i * 31) & 0xffff), 0x85ebca6b) >>> 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

/** Deterministiskt nyhets-id av länk+rubrik (samma nyhet → samma id). */
function nyhetsId(lank: string | null, rubrik: string): string {
  return hashNx(`${lank ?? ""}|${rubrik}`);
}

// ── RSS/Atom-parsning (regex, inga externa libs) ────────────────────────────

/** Kodpunkt → tecken; ogiltiga koder ger tom sträng (aldrig kast). */
function kodpunkt(n: number): string {
  try {
    return String.fromCodePoint(n);
  } catch {
    return "";
  }
}

/** CDATA avklippt, vanligaste entiteterna avkodade, vit-yta normaliserad. */
function renXmlText(rå: string): string {
  return rå
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_m, h: string) => kodpunkt(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d: string) => kodpunkt(parseInt(d, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&") // sist — ampersanden är roten till andra entiteter
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

/** Endast https-länkar (samma regel som aktie-nyheter.tsx), max 500 tecken. */
function renLank(v: string | undefined): string | null {
  if (typeof v !== "string") return null;
  const s = renXmlText(v);
  return /^https:\/\//.test(s) ? s.slice(0, 500) : null;
}

/** Atom-länk: föredj rel="alternate" (eller utan rel) bland href-attributen. */
function lasAtomLank(block: string): string | null {
  for (const tagg of block.match(/<link\b[^>]*>/gi) ?? []) {
    const href = tagg.match(/href=["']([^"']+)["']/i)?.[1];
    if (href === undefined) continue;
    const rel = tagg.match(/rel=["']([^"']+)["']/i)?.[1] ?? "";
    if (rel === "" || /alternate/i.test(rel)) return renLank(href);
  }
  return null;
}

/**
 * Parsa RSS 2.0 (<item>) eller Atom (<entry>) ur XML-text med enkla regexar.
 * Datumsyntaxer: pubDate (RFC 822) samt published/updated/dc:date (ISO 8601).
 * Varje item parsas i try/catch — ett trasigt item hopphas, resten levereras.
 */
export function parsRssXml(xml: string, maxAntal = 12): FlodeItem[] {
  const ut: FlodeItem[] = [];
  for (const block of xml.match(/<(item|entry)(\s[^>]*)?>[\s\S]*?<\/\1>/gi) ?? []) {
    try {
      const rubrik = renXmlText(block.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i)?.[1] ?? "");
      if (!rubrik) continue;
      const rssLank = block.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i)?.[1];
      const lank = rssLank !== undefined ? renLank(rssLank) : lasAtomLank(block);
      const tidText =
        block.match(/<pubDate(?:\s[^>]*)?>([\s\S]*?)<\/pubDate>/i)?.[1] ??
        block.match(/<published(?:\s[^>]*)?>([\s\S]*?)<\/published>/i)?.[1] ??
        block.match(/<updated(?:\s[^>]*)?>([\s\S]*?)<\/updated>/i)?.[1] ??
        block.match(/<dc:date(?:\s[^>]*)?>([\s\S]*?)<\/dc:date>/i)?.[1];
      const parsad = tidText !== undefined ? Date.parse(renXmlText(tidText)) : NaN;
      ut.push({ rubrik, lank, tid: Number.isFinite(parsad) ? parsad : null });
      if (ut.length >= maxAntal) break;
    } catch {
      // tolerera parse-fel — nästa item
    }
  }
  return ut;
}

// ── SSRF-skydd (kritiskt) ────────────────────────────────────────────────────

/**
 * Värdkontroll för en URL — returnerar felmeddelande eller null (= ok).
 * Blockerar: privata/reserverade IPv4-intervall, IPv6 loopback/link-local/ULA,
 * *.local/*.internal/localhost, numeriska värdar ("2130706433", "0x7f.0.0.1").
 */
function valideraVard(u: URL): string | null {
  const host = u.hostname.toLowerCase().replace(/\.+$/, "");
  const ren = host.replace(/^\[|\]$/g, ""); // IPv6 utan hakparenteser

  if (ren.includes(":")) {
    const h = ren.toLowerCase();
    if (
      h === "::" ||
      h === "::1" ||
      h.startsWith("::ffff:") ||
      h.startsWith("fe8") ||
      h.startsWith("fe9") ||
      h.startsWith("fea") ||
      h.startsWith("feb") ||
      h.startsWith("fc") ||
      h.startsWith("fd") ||
      h.startsWith("64:ff9b:")
    ) {
      return "IPv6-adressen är blockerad (loopback/link-local/internt)";
    }
    return null;
  }

  // Rena siffer-/hex-värdar: dotted-quad granskas mot intervallen, övriga nekas
  // ("2130706433" = 127.0.0.1 och "0x7f.0.0.1" bärs annars förbi filtret).
  const delar = host.split(".");
  if (delar.every((d) => /^\d+$/.test(d)) || /^0x[0-9a-f]+(\.[0-9a-fx]+)*$/i.test(host)) {
    if (delar.length === 4 && delar.every((d) => /^\d+$/.test(d) && Number(d) >= 0 && Number(d) <= 255)) {
      const [a, b] = delar.map(Number);
      if (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 100 && b >= 64 && b <= 127) || // CGNAT — djupledsförsvar
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168)
      ) {
        return "Privat eller reserverad IP-adress är blockerad";
      }
      return null; // publik IPv4
    }
    return "Numerisk värdadress är blockerad";
  }

  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return "Intern värd är blockerad";
  }
  return null;
}

/**
 * Validera en användarlevererad RSS/Atom-URL. Samma regler som hämtningen +
 * https-krav + nej till inloggningsuppgifter i URL:en. Ren funktion — kan
 * anropas från API-routes för snabb avvisning före någon hämtning alls.
 */
export function valideraRssUrl(url: string): { ok: boolean; fel?: string } {
  if (typeof url !== "string" || url.length === 0 || url.length > 2000) {
    return { ok: false, fel: "Ogiltig URL" };
  }
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { ok: false, fel: "Ogiltig URL" };
  }
  if (u.protocol !== "https:") return { ok: false, fel: "Endast https:// tillåts" };
  if (u.username !== "" || u.password !== "") return { ok: false, fel: "URL med inloggningsuppgifter tillåts inte" };
  const fel = valideraVard(u);
  return fel === null ? { ok: true } : { ok: false, fel };
}

// ── Sker hämtning (timeout 6 s, User-Agent, 512 KB-tak, om-granskad redirect) ─

/**
 * Hämta text SÄKERT: https + värdkontroll, 6 s timeout, tak 512 KB. Slutlig
 * URL efter omdirigeringar granskas med samma regler. ALLT fel → null — den
 * anropande hämtaren översätter till tom array (P8-graceful).
 */
async function hamtaTextSaker(url: string): Promise<string | null> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || valideraVard(u) !== null) return null;
  try {
    const kontroll = new AbortController();
    const tidtagning = setTimeout(() => kontroll.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: kontroll.signal,
        redirect: "follow",
        headers: { Accept: ACCEPT_RSS, "User-Agent": ANVANDAR_AGENT },
      });
      if (!res.ok) return null;
      // Omdirigeringar kan bära till en intern adress — granska slutdestinationen
      if (typeof res.url === "string" && res.url !== "") {
        try {
          const slut = new URL(res.url);
          if (slut.protocol !== "https:" || valideraVard(slut) !== null) return null;
        } catch {
          return null;
        }
      }
      const text = await res.text();
      return text.length > MAX_SVAR_TECKEN ? null : text;
    } finally {
      clearTimeout(tidtagning);
    }
  } catch {
    return null; // timeout/nätverksfel/avbruten — tyst, aldrig kast
  }
}

// ── Publika hämtare ──────────────────────────────────────────────────────────

/**
 * 1. Yahoo RSS för EN ticker (feeds.finance.yahoo.com — allow-listat värd,
 * URL:en byggs internt från en validerad ticker så den kan inte peka utåt).
 * Region SE / språk sv-SE enligt spec. Parse-fel → tom array.
 */
export async function hamtaRssTicker(ticker: string, maxAntal = PER_TICKER): Promise<FlodeItem[]> {
  if (typeof ticker !== "string" || !TICKER_RE.test(ticker)) return [];
  const url =
    `https://${YAHOO_RSS_VARD}/rss/2.0/headline` +
    `?s=${encodeURIComponent(ticker)}&region=SE&lang=sv-SE`;
  const xml = await hamtaTextSaker(url);
  if (xml === null) return [];
  return parsRssXml(xml, maxAntal);
}

/**
 * 2. Fallback: Yahoos search-news (query1 först, query2 som reserv — samma
 * mönster som aktie-nyheter.tsx). Levererar även utgivare när Yahoo har den.
 */
export async function hamtaYahooNews(ticker: string, maxAntal = PER_SOK): Promise<FlodeItem[]> {
  if (typeof ticker !== "string" || !TICKER_RE.test(ticker)) return [];
  for (const vard of YAHOO_SEARCH_VARDAR) {
    const text = await hamtaTextSaker(
      `https://${vard}/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=${Math.min(Math.max(maxAntal, 1), 8)}`,
    );
    if (text === null) continue;
    try {
      const json = JSON.parse(text) as { news?: Array<Record<string, unknown>> };
      const lista = Array.isArray(json?.news) ? json.news : [];
      const ut: FlodeItem[] = [];
      for (const n of lista) {
        const rubrik =
          typeof n?.title === "string" ? n.title.replace(/\s+/g, " ").trim().slice(0, 300) : "";
        if (!rubrik) continue;
        const lank = typeof n.link === "string" && /^https:\/\//.test(n.link) ? n.link.slice(0, 500) : null;
        const tidSek =
          typeof n.providerPublishTime === "number" && Number.isFinite(n.providerPublishTime)
            ? n.providerPublishTime
            : null;
        const utgivare =
          typeof n.publisher === "string" && n.publisher ? n.publisher.slice(0, 60) : undefined;
        ut.push({ rubrik, lank, tid: tidSek !== null ? tidSek * 1000 : null, ...(utgivare !== undefined ? { utgivare } : {}) });
        if (ut.length >= maxAntal) break;
      }
      if (ut.length > 0) return ut;
    } catch {
      // nästa värd — och till sist tom array
    }
  }
  return [];
}

/**
 * 3. Generisk RSS/Atom-läsare för ämneskanaler och elevens egna flöden.
 * SSRF-skyddat via valideraRssUrl (https, inga interna värdar, tak 512 KB).
 * Ogiltig URL, för stort svar eller parse-fel → tom array. ALDRIG kast.
 */
export async function hamtaAllmantRss(url: string, maxAntal = PER_KANAL): Promise<FlodeItem[]> {
  if (!valideraRssUrl(url).ok) return [];
  const xml = await hamtaTextSaker(url);
  if (xml === null) return [];
  return parsRssXml(xml, maxAntal);
}

// ── 4. Ranking — intelligent påverkanspoäng ─────────────────────────────────

/**
 * Nyckelordsvikter på rubriken (svenska + engelska), enligt nyhetsmotor-
 * specifikationen. Flera grupper kan träffa samtidigt (bud+rättighetsteckning
 * i samma rubrik väger tungt). "bud"-mönstret skyddas mot "budget"/"budbärare".
 */
const NYCKELORD_VIKTER: ReadonlyArray<readonly [RegExp, number]> = [
  [/konkurs|rekonstruktion|bankruptcy|insolven(t|cy)/, 50],
  [/uppköp|förvärv|bud(?!g|bär)|\bbid\b|acquisition|takeover|\bmerger\b|buyout/, 40],
  [/emission|nyemission|riktningsändring|rättighetsteckning|rights issue|share issue/, 35],
  [/rapport|kvartal|resultat|\breport|quarter|results?\b|earnings/, 30],
  [/nedskrivning|impairment|write-?down/, 30],
  [/\bvd\b|chef|avg(år|ick)|tillträder|\bceo\b|chief executive|resign/, 25],
  [/utdelning|dividend/, 20],
  [/vänta|prognos|forecast|outlook|expect|guidance/, 15],
];

/** Baspoäng för varje nyhet — även en tyst rubrik är en signal värd. */
const BAS_POANG = 10;
const BONUS_PORTFOLJ = 20;
const BONUS_BEVAKNING = 10;

/**
 * Räkna påverkanspoäng 0–100: bas 10 + nyckelordsvikter på rubriken + kontext-
 * bonus (+20 om nyckel-tickern står i portföljen, +10 om i bevakningen).
 * Deterministisk och ren — bara rubrik, tickers och kontext spelar in.
 */
export function raknaPaverkan(
  nyhet: { rubrik: string; tickers?: string[] },
  kontext?: PaverkanKontext,
): number {
  const rubrik = typeof nyhet?.rubrik === "string" ? nyhet.rubrik.toLowerCase() : "";
  let poang = BAS_POANG;
  for (const [re, vikt] of NYCKELORD_VIKTER) {
    if (re.test(rubrik)) poang += vikt;
  }
  const tickerLista = Array.isArray(nyhet?.tickers) ? nyhet.tickers : [];
  if (tickerLista.length > 0) {
    const portfolj = new Set((kontext?.portfolj ?? []).map((t) => t.toUpperCase()));
    const bevakning = new Set((kontext?.bevakning ?? []).map((t) => t.toUpperCase()));
    if (tickerLista.some((t) => portfolj.has(t.toUpperCase()))) poang += BONUS_PORTFOLJ;
    if (tickerLista.some((t) => bevakning.has(t.toUpperCase()))) poang += BONUS_BEVAKNING;
  }
  return Math.max(0, Math.min(100, Math.round(poang)));
}

// ── 5. AK1A-not — pedagogisk V-koppling (ALDRIG köp/sälj) ───────────────────

/**
 * Nyckelord → AKM1-variabel (ekosystem.ts / vagfundament-motor.ts är
 * auktoritativ källa): tillväxt/omsättning→V01, ARR→V02, P/S→V04, P/B och
 * generell värdering→V05, EV/EBITDA→V06, bruttomarginal/generell marginal→V07,
 * EBITDA→V08, skuld→V10, patent→V13, varumärke/uppköp/moat→V14 (uppköp läses
 * som vallgravsfråga), nätverkseffekter→V15, lansering→V16, emission→V19,
 * återköp→V20. Mönstren ligger i specificitetsordning — "ev/ebitda" träffas
 * före "ebitda", "bruttomarginal" före "marginal".
 */
const AK1A_MALLAR: ReadonlyArray<{ re: RegExp; v: string; tanke: string }> = [
  {
    re: /återköp|inlösen|buy-?back|repurchas/i,
    v: "V20",
    tanke: "Vad betyder återköpet (V20) för antalet aktier — och vad händer med ditt ägande per aktie?",
  },
  {
    re: /emission|nyemission|utspädning|dilution|rättighet/i,
    v: "V19",
    tanke: "Hur förändrar emissionen kapitalförbrukningen (V19) — och vad kostar utspädningen den gamla aktieägaren?",
  },
  {
    re: /lansera|lansering|launch|ny produkt|produktnyhet/i,
    v: "V16",
    tanke: "Hur stor kan den nya produkten (V16) bli i dagens intäkter — och vad krävs för att den ska synas i V01?",
  },
  {
    re: /patent|ip-rätt|licens/i,
    v: "V13",
    tanke: "Vad gör nyheten med patent- och IP-portföljen (V13) — bredare eller smalare vallgrav?",
  },
  {
    re: /nätverkseffekt|network effect/i,
    v: "V15",
    tanke: "Vad händer med nätverkseffekterna (V15) — växer värdet för varje ny användare eller kund?",
  },
  {
    re: /uppköp|förvärv|bud(?!g|bär)|acquisition|takeover|moat|konkurrensfördel|competitive advantage|varumärke|\bbrand\b/i,
    v: "V14",
    tanke: "Stärker eller urholkar nyheten varumärket och kundlojaliteten (V14) — och därmed bolagets vallgrav?",
  },
  {
    re: /skuld|lån|debt|leverage|räntebörd/i,
    v: "V10",
    tanke: "Hur påverkar nyheten skuldsättningsgraden (V10) — och hur känsligt blir bolaget för högre räntor?",
  },
  {
    re: /bruttomarginal|gross margin/i,
    v: "V07",
    tanke: "Vad händer med bruttomarginalen (V07) om nyheten slår igenom — högre intäkt eller högre kostnad per såld krona?",
  },
  {
    re: /ev\/ebitda/i,
    v: "V06",
    tanke: "Vad händer med EV/EBITDA-multipeln (V06) om nyheten syns i resultaträkningen?",
  },
  {
    re: /p\/s\b/i,
    v: "V04",
    tanke: "Vad säger nyheten om P/S-multipeln (V04) — förändras omsättningen som multipeln bygger på?",
  },
  {
    re: /värdering|multipel|valuation|p\/e\b|p\/b\b/i,
    v: "V05",
    tanke: "Hur förhåller sig nyheten till värderingen (V05) — ändras spelet mellan kurs och bokfört värde?",
  },
  {
    re: /marginal|margin/i,
    v: "V07",
    tanke: "Vad händer med bruttomarginalen (V07) om nyheten slår igenom — höjer pris eller kostnad sin sida av kalkylen?",
  },
  {
    re: /(?<!ev\/)ebitda/i,
    v: "V08",
    tanke: "Hur rör sig EBITDA-marginalen (V08) av nyheten — och vad säger det om bolagets prissättningsmakt?",
  },
  {
    re: /\barr\b|årlig.{0,20}återkommande|recurring revenue|prenumeration/i,
    v: "V02",
    tanke: "Hur påverkar nyheten de återkommande intäkterna (V02) — blir omsättningen mer förutsägbar?",
  },
  {
    re: /tillväxt|omsättning|intäk(t|ter)|försäljning|revenue|\bgrowth\b|\bsales\b/i,
    v: "V01",
    tanke: "Vad händer med försäljningstillväxten (V01) om nyheten blir en trend — och vilken våg ritar det i Vågkartan?",
  },
];

/**
 * Bygg den pedagogiska AK1A-noten ur en rubrik: max 2 V-variabler + EN
 * reflekterande fråga (alltid frågeform — aldrig råd, aldrig prognos).
 * Returnerar null när rubriken inte röner någon V-koppling.
 */
export function raknaAk1aNot(rubrik: string): Nyhet["ak1aNot"] {
  const text = typeof rubrik === "string" ? rubrik : "";
  if (!text) return null;
  const vSet = new Set<string>();
  const vVariables: string[] = [];
  let tanke: string | null = null;
  for (const mall of AK1A_MALLAR) {
    if (vVariables.length >= 2) break;
    if (!mall.re.test(text)) continue;
    if (vSet.has(mall.v)) continue;
    vSet.add(mall.v);
    vVariables.push(mall.v);
    if (tanke === null) tanke = mall.tanke; // första träffen ger tanken
  }
  if (vVariables.length === 0) return null;
  return { vVariables, tanke: tanke ?? "" };
}

// ── Flödesbygge (internt) ────────────────────────────────────────────────────

/** Bygg en komplett Nyhet med deterministiskt id, ranking och AK1A-not. */
function byggNyhet(falt: {
  rubrik: string;
  kalla: string;
  lank: string | null;
  tid: number | null;
  tickers: string[];
  kanal: string;
  kontext: PaverkanKontext;
}): Nyhet {
  return {
    id: nyhetsId(falt.lank, falt.rubrik),
    rubrik: falt.rubrik,
    kalla: falt.kalla,
    lank: falt.lank,
    tid: falt.tid,
    tickers: falt.tickers,
    kanal: falt.kanal,
    paverkan: raknaPaverkan({ rubrik: falt.rubrik, tickers: falt.tickers }, falt.kontext),
    ak1aNot: raknaAk1aNot(falt.rubrik),
  };
}

/**
 * Matcha kända tickers mot en rubrik (för ämneskanaler/egna flöden). Grund-
 * symbolen ("VOLV-B.ST" → "volv", "ERIC-B.ST" → "eric") söks som ordstart —
 * "volv" träffar "Volvo", "eric" träffar "Ericsson". Max 3 träffar/rubrik.
 */
function matchaTickers(rubrik: string, kanda: readonly string[]): string[] {
  const ut: string[] = [];
  for (const t of kanda) {
    const bas = t.split(".")[0].split("-")[0].toLowerCase();
    if (bas.length < 2) continue;
    try {
      const re = new RegExp(
        `(^|[^a-z0-9])${bas.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "i",
      );
      if (re.test(rubrik)) ut.push(t);
    } catch {
      // ogiltig grundsymbol — hoppa över
    }
    if (ut.length >= 3) break;
  }
  return ut;
}

/** Värdnamn för källnamn/kanal ("https://x.y/z" → "x.y") — aldrig kast. */
function lasVard(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().slice(0, 60);
  } catch {
    return "rss";
  }
}

/** Nyheter för EN ticker: Yahoo RSS först, search-news som fallback. */
async function tickerNyheter(
  ticker: string,
  kanal: "mina-aktier" | "bevakning",
  kontext: PaverkanKontext,
): Promise<Nyhet[]> {
  let items = await hamtaRssTicker(ticker);
  if (items.length === 0) items = await hamtaYahooNews(ticker);
  return items.map((i) =>
    byggNyhet({
      rubrik: i.rubrik,
      kalla: i.utgivare ? `${i.utgivare} · ${ticker}` : `Yahoo · ${ticker}`,
      lank: i.lank,
      tid: i.tid,
      tickers: [ticker],
      kanal,
      kontext,
    }),
  );
}

/** Kör jobb i omgångar (Yahoo-vänligt tryck — se aktie-nyheter.tsx omgång 3). */
async function körIOmgangar<T>(jobb: Array<() => Promise<T>>, storlek: number): Promise<T[]> {
  const ut: T[] = [];
  for (let i = 0; i < jobb.length; i += Math.max(1, storlek)) {
    const grupp = await Promise.all(jobb.slice(i, i + Math.max(1, storlek)).map((j) => j()));
    ut.push(...grupp);
  }
  return ut;
}

/** Normalisera + cappa en tickerlista (unika, versaler, giltig Yahoo-syntax). */
function renTickerLista(lista: unknown, max: number): string[] {
  if (!Array.isArray(lista)) return [];
  const sett = new Set<string>();
  const ut: string[] = [];
  for (const t of lista) {
    if (typeof t !== "string") continue;
    const ticker = t.trim().toUpperCase();
    if (!TICKER_RE.test(ticker) || sett.has(ticker)) continue;
    sett.add(ticker);
    ut.push(ticker);
    if (ut.length >= max) break;
  }
  return ut;
}

/**
 * Hämta ALLA källor och blanda till ett rankat flöde. Anropas via lasEller-
 * Hamta — kastar ALDRIG (alla nätverksfel sugs upp i hämtarna; Promise.all-
 * settled skyddar även mot oväntade fel i själva mappningen).
 */
async function hamtaAllt(
  portfolj: string[],
  bevakning: string[],
  amneskanaler: readonly Amneskanal[],
  rssUrls: string[],
  kontext: PaverkanKontext,
): Promise<Nyhet[]> {
  const kanda = [...portfolj, ...bevakning];

  // Portfölj + bevakning i omgångar om 4 (Yahoo-vänligt); kanaler parallellt
  const kallor: Array<Promise<Nyhet[]>> = [
    körIOmgangar(
      [
        ...portfolj.map((t) => () => tickerNyheter(t, "mina-aktier", kontext)),
        ...bevakning.map((t) => () => tickerNyheter(t, "bevakning", kontext)),
      ],
      OMGNING_STORLEK,
    ).then((grupper) => grupper.flat()),
    ...amneskanaler.map((kanal) =>
      hamtaAllmantRss(kanal.url).then((items) =>
        items.map((i) =>
          byggNyhet({
            rubrik: i.rubrik,
            kalla: kanal.namn,
            lank: i.lank,
            tid: i.tid,
            tickers: matchaTickers(i.rubrik, kanda),
            kanal: `amne:${kanal.id}`,
            kontext,
          }),
        ),
      ),
    ),
    ...rssUrls.map((url) => {
      const vard = lasVard(url);
      return hamtaAllmantRss(url).then((items) =>
        items.map((i) =>
          byggNyhet({
            rubrik: i.rubrik,
            kalla: vard,
            lank: i.lank,
            tid: i.tid,
            tickers: matchaTickers(i.rubrik, kanda),
            kanal: `rss:${vard}`,
            kontext,
          }),
        ),
      );
    }),
  ];

  const resultat = await Promise.allSettled(kallor);

  // Deduplicera på id (först-se-vinner) → sortera påverkanspoäng × tid → max 40
  const unika = new Map<string, Nyhet>();
  for (const r of resultat) {
    if (r.status !== "fulfilled" || !Array.isArray(r.value)) continue;
    for (const n of r.value) {
      if (!n || typeof n.id !== "string" || unika.has(n.id)) continue;
      unika.set(n.id, n);
    }
  }
  return [...unika.values()]
    .sort(
      (a, b) =>
        b.paverkan - a.paverkan ||
        (b.tid ?? 0) - (a.tid ?? 0) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, MAX_FLODE);
}

// ── 6. Ingången — hämta hela flödet (cacheat 30 min) ─────────────────────────

/** Cache-nyckel: "nyh-" + 8 hex = exakt 12 tecken (datacachens ticker-max). */
function konfigNyckel(k: { t: string[]; b: string[]; a: string[]; r: string[] }): string {
  return `nyh-${hashNx(JSON.stringify(k)).slice(0, 8)}`;
}

/**
 * Hämta elevens hela nyhetsflöde — EN server-side ingång.
 *
 *  1. Normaliserar konfigen: tickers/bevakning max 15 st (Yahoo-syntax),
 *     ämnen max 6 (id:n i STANDARD_AMNESKANALER), rssUrls max 5 (SSRF-
 *     validerade via valideraRssUrl FÖRE hämtning).
 *  2. Cachar 30 minuter via lasEllerHamta (typ "analys", nyckel "nyh-{hash}")
 *     — nätverksbrott serverar hellre gårdagens flöde än inget alls.
 *  3. Alla källor hämtas parallellt (tickers i omgångar om 4), dedupliceras
 *     på id, sorteras på påverkanspoäng × tid och kapas till 40 nyheter.
 *
 * Kastar ALDRIG — vid totalt motstånd returneras en tom array (P8-graceful).
 */
export async function hamtaNyhetsFlode(konfig: NyhetsFlodeKonfig = {}): Promise<Nyhet[]> {
  try {
    const portfolj = renTickerLista(konfig?.tickers, MAX_TICKERS);
    const bevakning = renTickerLista(konfig?.bevakning, MAX_BEVAKNING);

    const amnesIdn = (Array.isArray(konfig?.amnen) ? konfig.amnen : [])
      .filter((a): a is string => typeof a === "string")
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, MAX_AMNEN);
    const amneskanaler = STANDARD_AMNESKANALER.filter((k) => amnesIdn.includes(k.id));

    const rssUrls = (Array.isArray(konfig?.rssUrls) ? konfig.rssUrls : [])
      .filter((u): u is string => typeof u === "string")
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, MAX_RSS_URLS)
      .filter((u) => valideraRssUrl(u).ok);

    const nyckel = konfigNyckel({
      t: portfolj,
      b: bevakning,
      a: amneskanaler.map((k) => k.id),
      r: rssUrls,
    });
    const kontext: PaverkanKontext = { portfolj, bevakning };

    const { data } = await lasEllerHamta(
      nyckel,
      "analys",
      () => hamtaAllt(portfolj, bevakning, amneskanaler, rssUrls, kontext),
      30,
    );
    return Array.isArray(data) ? (data as Nyhet[]) : [];
  } catch {
    return []; // P8-graceful — motorn kastar ALDRIG uppåt
  }
}
