/**
 * MÖS MOTOR-ADAPTER — extern tjänstekedja först, AI som premiumalternativ
 * (Våg 54; kunddirektiv: "översättningen sker dynamiskt med externa super
 * avancerade ekosystemet" — systemet ska vara KLART utan kundens AI-nyckel).
 *
 *   KEDJA (första som lyckas vinner, per textstycke):
 *     1. DeepL        — om DEEPL_API_KEY finns (frivillig premium; free-nyckel
 *                       känns igen på suffixet ":fx" → api-free.deepl.com).
 *     2. Google       — om GOOGLE_TRANSLATE_KEY finns (frivillig premium;
 *                       translation.googleapis.com, format "text" ALDRIG html).
 *     3. MyMemory     — NYCKELFRI STANDARD (api.mymemory.translated.net).
 *                       Anonym dagskvot ≈ 5000 ord/dag respekteras via
 *                       modulräknare + max 400 anrop per process-dygn.
 *     4. Alla fall    → "vantar-motor" (deterministisk ärlighet).
 *
 *   OM ZAI_API_KEY finns (zaiAktiv-kontraktet i src/lib/zai.ts): Z.ai (GLM)
 *   körs SOM ALTERNATIV GREN med termbanken i systempromten — bästa kvalitet,
 *   oförändrad våg 52-logik. Annars: externa kedjan ovan.
 *
 *   Kvot (MyMemory varnar "MYMEMORY WARNING" / HTTP 429): status
 *   "vantar-kvot" — samma kö-semantik som "vantar-motor" men med ärlig
 *   notering om att nästa försök sker nästa dags rond (ca 24 h).
 *
 * TERMBANKSSTYRNING runt de externa motorerna (kvalitetsregeln består):
 *   PRE  — text ≤ 8 ord där VARJE ord finns i termbankens ordlista översätts
 *          DIREKT ur banken (noll nät, noll kvot). Innehåller texten
 *          flerordstermer lämnas den åt motorn (ord-för-ord vore fel) —
 *          tolkning av kunddirektivets "kort text = översätt direkt via
 *          termbankens ordlista om alla ord finns, annars motor".
 *   POST — varje sv-term i källan som motorn översatte felaktigt rättas
 *          deterministiskt (tvingaTermbank): svenskt läckage ersätts,
 *          skriftläge normaliseras, förkortad målterm fylls ut, synonym-
 *          byte mot annan rads målterm. Detta höjer termKonsistens-poängen
 *          utan att röra kontrollerna.
 *
 * ALDRIG utan kontroller: varje motorsvar (också termbankens direktöversättning
 * och det termbanksrättade svaret) genomgår ./kontroller.ts innan status sätts.
 * Poäng < 90 (KVALITETSTRASKEL) ⇒ "maskinutkast-behovar-granskning" OAVSETT
 * motor — kontrollerna sitter EFTER motorn och kan inte förhandlas bort.
 *
 * SSRF-SKYDD (zai.ts-mönstret, alla tre externa tjänsterna): fast host-
 * vitlista, https-tvång, valideraExternUrl → URL-OBJEKT som endast det fetch:as
 * (aldrig en sträng ur env), redirect: "error", timeout 10 s, kastar ALDRIG.
 * API-nycklar läses ENBART ur env och loggas ALDRIG.
 *
 * ENV (dokumenterade namn — inga värden i koden):
 *   ZAI_API_KEY                    Z.ai-nyckel (premiumgren, valfri)
 *   DEEPL_API_KEY                  DeepL-nyckel (valfri; ":fx"-suffix = free)
 *   DEEPL_HOST                     valfri host-override (måste finnas i
 *                                 vitlistan {api.deepl.com, api-free.deepl.com})
 *   GOOGLE_TRANSLATE_KEY           Google Cloud Translation v2-nyckel (valfri)
 *   OVERSATTNING_EXTERN_AVSTANGD   "1" = stäng av externa kedjan (testläge:
 *                                 verktyg/validera-motorer.mjs kör utan nät)
 *
 * Statusflöde (bestamStatus):
 *   100            → "publicerad"          (alla 4 kontroller gröna — auto)
 *   90–99          → "utkast"              (godkänt maskinutkast, väntar
 *                                            mänsklig granskning → "granskad")
 *   < 90           → "maskinutkast-behovar-granskning"
 *   (motor borta)  → "vantar-motor"
 *   (kvot slut)    → "vantar-kvot"
 *   (källa ändrad) → "inaktuell"           (sätts av cron-ronden, inte här)
 *
 * Importen av @/lib/zai är MEDVETET dynamisk (inuti oversatt()): modulen
 * markerar sig "server-only" och ska aldrig dras in i tsx-testernas värld.
 */

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { MALSPRAK, type MalSprak } from "./kalla";
import { korKontroller, KVALITETSTRASKEL, type Kontrollrapport } from "./kontroller";
import { hittaTermerIKalla, latinskaTermer, termForSv, TERMBANK, type TermRad } from "./termbank";

// ── Status ───────────────────────────────────────────────────────────────────

/** Livscykeln för ett översättningsobjekt (lagras i tabellen oversattningar). */
export type OversattningStatus =
  | "utkast"
  | "granskad"
  | "publicerad"
  | "vantar-motor"
  | "vantar-kvot"
  | "inaktuell"
  | "maskinutkast-behovar-granskning";

/** Kanonisk lista — SQL-checken i data/sql/oversattningar.sql speglar denna. */
export const OVERSATTNING_STATUS: readonly OversattningStatus[] = [
  "utkast",
  "granskad",
  "publicerad",
  "vantar-motor",
  "vantar-kvot",
  "inaktuell",
  "maskinutkast-behovar-granskning",
];

/** Är ZAI-grenen (premiumalternativet) konfigurerad? Samma kontrakt som zaiAktiv(). */
export function motorAktiv(): boolean {
  return Boolean(process.env.ZAI_API_KEY);
}

/** Status från kvalitetspoäng — deterministisk tröskellogik. */
export function bestamStatus(poang: number): OversattningStatus {
  if (!Number.isFinite(poang)) return "maskinutkast-behovar-granskning";
  if (poang >= 100) return "publicerad";
  if (poang >= KVALITETSTRASKEL) return "utkast";
  return "maskinutkast-behovar-granskning";
}

// ── Promptbygge (ZAI-grenen, oförändrad våg 52) ──────────────────────────────

/** Max antal termbanksrader i en prompt (begränsar tokenkosten). */
const MAX_TERMER_I_PROMPT = 60;

/** Rubriktermerna per språknamn som motorn ser. */
const SPRARNAMN: Record<MalSprak, string> = { en: "English", ar: "Arabic (العربية)" };

/**
 * Systemprompt: professionell finansiell översättare. Termbanken bifogas som
 * HARÄRDE regler — exakt de termer som kontroller.ts kommer att kontrollera
 * (samma detektering: hittaTermerIKalla). Latinska termer listas explicit.
 */
export function byggSystemPrompt(kalltext: string, sprak: MalSprak): string {
  const traffade = (hittaTermerIKalla(kalltext) as readonly TermRad[]).slice(0, MAX_TERMER_I_PROMPT);
  const termblock =
    traffade.length === 0
      ? "(inga termbankstermer påträffades i källan)"
      : traffade.map((r) => "- " + r.sv + " => " + r.en + " | " + r.ar).join("\n");
  const latinsk = latinskaTermer()
    .map((r) => r.sv)
    .join(", ");
  return [
    "You are a professional financial translator for AK1A Research Lab (educational finance).",
    "Translate the user's Swedish text into " + SPRARNAMN[sprak] + ".",
    "",
    "TERMBANK — MANDATORY (the source contains these terms; the translation MUST use exactly these target terms):",
    termblock,
    "",
    "HARD RULES:",
    "1. Keep ALL numbers EXACTLY as written in the source, including decimal separators (\"2,5\" stays \"2,5\" — do not convert commas to dots).",
    "2. Keep Latin-script terms/tickers/brands EXACTLY as-is: " + latinsk + ".",
    "3. Preserve the structure exactly: same paragraph count, line breaks, markdown (headings #, bullet -, numbered 1.), table rows |, and for JSON content keep all keys and array lengths identical — translate only human-readable values.",
    "4. Output ONLY the translation — no preamble, no explanations, no quotes around the result.",
  ].join("\n");
}

/**
 * maxTokens-räkning: ~2,6 tecken/token för europeisk text, arabiska är
 * token-tätare (~2) — ta det sämsta fallet och marginal. Avkapat svar är
 * meningslöst (strukturkontrollen failar det ändå).
 */
export function raknaMaxTokens(kalltextLangd: number): number {
  return Math.max(800, Math.min(8000, Math.ceil(kalltextLangd / 2) + 600));
}

/** Källor längre än detta kan inte motorn översätta i EN rond — ärligt kö-läge. */
export const MAX_KALLTEXST_LANGD = 12_000;

// ── Termbanksskydd: PRE (direktöversättning av korta texter) ─────────────────

/** Direktöversättning gäller endast texter med högst detta antal ord. */
export const DIREKT_MAX_ORD = 8;

/** Skala bort yttersta interpunktion/skiljetecken från ett enskilt ord. */
function rensaOrd(ord: string): string {
  return ord.replace(/^[\s.,!?;:"'«»()]+/, "").replace(/[\s.,!?;:"'«»()]+$/, "");
}

/**
 * PRE-SKYDD: översätt en kort text (≤ 8 ord) DIREKT ur termbankens ordlista —
 * noll nätanrop, noll kvot. Returnerar null när något ord saknas i banken,
 * texten innehåller flerordstermer (ord-för-ord vore fel — motorn + POST-
 * skyddet tar den) eller texten är längre än DIREKT_MAX_ORD.
 */
export function oversattKortTextViaTermbank(kalltext: string, sprak: MalSprak): string | null {
  const ord = kalltext.trim().split(/\s+/).filter((o) => o.length > 0);
  if (ord.length === 0 || ord.length > DIREKT_MAX_ORD) return null;
  // Flerordstermer i texten ⇒ kontext krävs ⇒ motor (kunddirektivets "annars
  // motor"). Enbart enkelord som VAR OCH ETT är banktermer får direktvägen.
  for (const rad of hittaTermerIKalla(kalltext) as readonly TermRad[]) {
    if (rad.sv.indexOf(" ") >= 0) return null;
  }
  const rader: TermRad[] = [];
  for (const o of ord) {
    const rad = termForSv(rensaOrd(o).toLowerCase());
    if (!rad) return null; // alla ord måste finnas — annars motor
    rader.push(rad);
  }
  return rader.map((r) => (sprak === "en" ? r.en : r.ar)).join(" ");
}

// ── Termbanksskydd: POST (deterministisk rättning av motorsvaret) ────────────

/** Hur en term rättades — spårbarhet i noteringen (aldrig hemligheter). */
export type TermRattning = { sv: string; mal: string; via: "svenskt-lackage" | "skriftlage" | "ofullstandig-malterm" | "synonym-byte" };

/** Escape för regex — termerna innehåller "/", "(", ")" etc. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Bygg ordgräns-regex (unicode-medveten; "i" endast när skriftläget ska ignoreras). */
function ordgransRegex(mot: string, skriftlageKanslig: boolean, global: boolean): RegExp {
  const flaggor = (global ? "g" : "") + (skriftlageKanslig ? "i" : "") + "u";
  return new RegExp("(?<![\\p{L}])" + escapeRegExp(mot) + "(?![\\p{L}])", flaggor);
}

/** Finns måltermen redan korrekt? (EN skriftlägesokänsligt — kontroller.ts-kontraktet.) */
function innehallerMal(text: string, mal: string, sprak: MalSprak): boolean {
  return sprak === "en" ? text.toLowerCase().includes(mal.toLowerCase()) : text.includes(mal);
}

/**
 * POST-SKYDD: tvinga termbankens måltermer in i motorsvaret. För varje sv-term
 * i källan vars kanoniska målterm SAKNAS i svaret (samma jämförelse som
 * kontrollerna gör) prövas, i ordning:
 *   1. svenskt-lackage      — termen lämnades oöversatt i resultatet → ersätts.
 *   2. skriftlage           — "roe"/"Gross Margin" → exakt "ROE"/"gross margin".
 *   3. ofullstandig-malterm — "return on equity" utökas till "return on equity
 *                             (ROE)"; "الخندق" → "الخندق التنافسي".
 *   4. synonym-byte         — motorn valde en ANNAN rads målterm (klassiskt:
 *                             bruttomarginal → "profit margin") → bytes till
 *                             denna rads målterm. Endast rader vars sv-term
 *                             INTE finns i källan är giltiga bytes-källor.
 * Returnerar det rättade svaret + spårbara rättningar. Rör aldrig en term som
 * redan står korrekt; en ohanterad term lämnas ifred — kontrollerna dömer.
 */
export function tvingaTermbank(
  kalltext: string,
  motorsvar: string,
  sprak: MalSprak,
): { text: string; rattade: readonly TermRattning[] } {
  let text = motorsvar;
  const rattade: TermRattning[] = [];
  const traffade = hittaTermerIKalla(kalltext) as readonly TermRad[];
  const traffadeSv = new Set(traffade.map((r) => r.sv));

  for (const rad of traffade) {
    const mal = sprak === "en" ? rad.en : rad.ar;
    if (innehallerMal(text, mal, sprak)) continue; // står redan korrekt

    // (1) svenskt läckage — termen (med böjningssuffix) lämnad kvar på svenska.
    const svRe = new RegExp(
      "(?<![\\p{L}])" + escapeRegExp(rad.sv) + "(?:en|et|er|na|arna|orna|erna|s|ns|nas)?(?![\\p{L}])",
      "giu",
    );
    if (svRe.test(text)) {
      text = text.replace(svRe, () => mal);
      rattade.push({ sv: rad.sv, mal, via: "svenskt-lackage" });
      continue;
    }

    // (2) skriftläge — rätt innehåll, fel versalisering (främst latinsk term i AR).
    const skriftRe = ordgransRegex(mal, true, false);
    if (skriftRe.test(text)) {
      text = text.replace(ordgransRegex(mal, true, true), () => mal);
      rattade.push({ sv: rad.sv, mal, via: "skriftlage" });
      continue;
    }

    // (3) ofullständig målterm — ett äkta prefix av mal finns med ordgränser,
    //     men inte mal i sin helhet. Längst prefix först (mest specifikt).
    const malOrd = mal.split(/\s+/);
    let prefixRattad = false;
    for (let antal = malOrd.length - 1; antal >= 1 && !prefixRattad; antal--) {
      const prefix = malOrd.slice(0, antal).join(" ");
      // Skydd: ett enstaka prefixord måste vara signifikant (≥ 6 tecken) och
      // får inte vara en annan träffad terms exakta målterm ("return" är
      // avkastningens målterm — det stjäls aldrig).
      if (antal === 1 && prefix.length < 6) continue;
      const annansMal = traffade.some((r) => r !== rad && (sprak === "en" ? r.en : r.ar) === prefix);
      if (annansMal) continue;
      const prefixRe = ordgransRegex(prefix, sprak === "en", false);
      if (prefixRe.test(text)) {
        text = text.replace(ordgransRegex(prefix, sprak === "en", true), () => mal);
        rattade.push({ sv: rad.sv, mal, via: "ofullstandig-malterm" });
        prefixRattad = true;
      }
    }
    if (prefixRattad) continue;

    // (4) synonym-byte — en icke-träffad rads målterm användes felaktigt.
    let byte: { fran: string } | null = null;
    for (const annan of TERMBANK) {
      if (traffadeSv.has(annan.sv)) continue;
      const annansMal = sprak === "en" ? annan.en : annan.ar;
      if (annansMal === mal) continue;
      if (ordgransRegex(annansMal, sprak === "en", false).test(text)) {
        if (!byte || annansMal.length > byte.fran.length) byte = { fran: annansMal };
      }
    }
    if (byte) {
      text = text.replace(ordgransRegex(byte.fran, sprak === "en", true), () => mal);
      rattade.push({ sv: rad.sv, mal, via: "synonym-byte" });
    }
  }
  return { text, rattade };
}

// ── Extern kedja: gemensamt SSRF-mönster (src/lib/zai.ts) ────────────────────

/** Timeout för alla externa motoranrop — motorn ska aldrig hänga en rond. */
const EXTERN_TIMEOUT_MS = 10_000;

/** Validera endpoint enligt säkerhetspolicy: endast https + vitlistad host. */
export function valideraExternUrl(url: string, tillatnaVertar: readonly string[]): URL | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    if (!tillatnaVertar.includes(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}


/** Motorernas utfall: text | kvot-flagga | null (misslyckades). */
type MotorSvar = { text: string } | { kvot: true } | null;

/** Avkoda de HTML-entiteter Google/MyMemory lämnar i sina svar (&#39; &amp; …). */
export function avkodaEntiteter(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (hela, d) => {
      try {
        return String.fromCodePoint(Number(d));
      } catch {
        return hela;
      }
    })
    .replace(/&amp;/g, "&"); // sist — dubbelavkodning förhindras
}

// ── Kedja 1: DeepL (frivillig premium) ───────────────────────────────────────


// ── DNS-förkontroll (analys-motor-mönstret): värden MÅSTE vara publika ──────
let myMemoryHostKontrollerad = false;

async function kontrolleraHost(host: string): Promise<boolean> {
  try {
    const poster = await lookup(host, { all: true });
    return poster.every((p) => isIP(p.address) !== 0 && !ipArPrivatExterna(p.address));
  } catch {
    return false;
  }
}

function ipArPrivatExterna(ip: string): boolean {
  const v = ip.split(".").map(Number);
  if (v.length === 4 && v.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = v;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  const v6 = ip.toLowerCase();
  if (v6 === "::" || v6 === "::1") return true;
  if (v6.startsWith("fe80:") || v6.startsWith("fc") || v6.startsWith("fd")) return true;
  return false;
}

const DEEPL_VERTAR: readonly string[] = ["api.deepl.com", "api-free.deepl.com"];

/**
 * DeepL-host: DEEPL_HOST (om satt OCH vitlistad) styr, annars nyckelns
 * suffix — free-nycklar slutar på ":fx" och hör till api-free.deepl.com.
 */
export function deeplHost(nyckel: string): string {
  const franEnv = process.env.DEEPL_HOST;
  if (franEnv && DEEPL_VERTAR.includes(franEnv)) return franEnv;
  return nyckel.trim().endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
}

async function oversattDeepL(kalltext: string, sprak: MalSprak): Promise<MotorSvar> {
  const nyckel = process.env.DEEPL_API_KEY;
  if (!nyckel) return null;
  // Analys-motor-stil: fast host-prefix + kontrolleraHost-DNS-förkontroll före
  // varje anrop (free-nycklar: sätt DEEPL_HOST=api-free.deepl.com).
  const host = process.env.DEEPL_HOST || "api.deepl.com";
  if (!DEEPL_VERTAR.includes(host)) return null;
  if (!(await kontrolleraHost(host))) return null;
  const url = "https://" + host + "/v2/translate";
  let r: Response;
  try {
    r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "DeepL-Auth-Key " + nyckel },
      redirect: "error",
      signal: AbortSignal.timeout(EXTERN_TIMEOUT_MS),
      body: JSON.stringify({ text: [kalltext], source_lang: "SV", target_lang: sprak === "en" ? "EN-US" : "AR" }),
    });
  } catch {
    return null;
  }
  const res = r;
  if (res.status === 429) return { kvot: true };
  if (!res.ok) return null;
  try {
    const data = (await res.json()) as { translations?: Array<{ text?: unknown }> };
    const text = (data?.translations ?? [])
      .map((t) => (typeof t?.text === "string" ? t.text : ""))
      .join("\n")
      .trim();
    return text.length > 0 ? { text } : null;
  } catch {
    return null;
  }
}

// ── Kedja 2: Google Translate v2 (frivillig premium) ─────────────────────────

const GOOGLE_VERTAR: readonly string[] = ["translation.googleapis.com"];

async function oversattGoogle(kalltext: string, sprak: MalSprak): Promise<MotorSvar> {
  const nyckel = process.env.GOOGLE_TRANSLATE_KEY;
  if (!nyckel) return null;
  if (!(await kontrolleraHost("translation.googleapis.com"))) return null;
  const url = "https://translation.googleapis.com/language/translate/v2";
  let r: Response;
  try {
    r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": nyckel },
      redirect: "error",
      signal: AbortSignal.timeout(EXTERN_TIMEOUT_MS),
      // format "text" — vi översätter RÅTEXTBLOCK, aldrig html-tolkning
      body: JSON.stringify({ q: kalltext, source: "sv", target: sprak, format: "text" }),
    });
  } catch {
    return null;
  }
  const res = r;
  if (res.status === 429) return { kvot: true };
  if (!res.ok) return null;
  try {
    const data = (await res.json()) as { data?: { translations?: Array<{ translatedText?: unknown }> } };
    const text = data?.data?.translations?.[0]?.translatedText;
    return typeof text === "string" && text.trim().length > 0 ? { text: avkodaEntiteter(text) } : null;
  } catch {
    return null;
  }
}

// ── Kedja 3: MyMemory (nyckelfri STANDARD) ───────────────────────────────────

const MYMEMORY_VERTAR: readonly string[] = ["api.mymemory.translated.net"];

/** MyMemory:s q-parameter tar max 500 byte — längre texter delas i bitar. */
export const MYMEMORY_MAX_BYTES = 500;
/** Anonym kvot ≈ 5000 ord/dag — vi stannar säkert under (per process/lambdainstans). */
export const MYMEMORY_MAX_ORD_PER_DAG = 5_000;
/** Tak 400 anrop per process-dygn (≈ en ronds behov på Hobby, 1 cron/dag). */
export const MYMEMORY_MAX_ANROP_PER_DAG = 400;

/**
 * Bygg MyMemory-GET:URL (ren funktion — testbar). searchParams kodar q och
 * langpair korrekt (%20, %7C) och URL-objektet är det enda som fetch:as.
 */
export function byggMyMemoryUrl(text: string, sprak: MalSprak): URL {
  const u = new URL("https://api.mymemory.translated.net/get");
  u.searchParams.set("q", text);
  u.searchParams.set("langpair", "sv|" + sprak);
  return u;
}

const TEXT_KODARE = new TextEncoder();
function byteLangd(s: string): number {
  return TEXT_KODARE.encode(s).length;
}

/**
 * Dela texten i MyMemory-bitar (≤ 500 byte): ord-tokens MED sin efterföljande
 * whitespace ackumuleras — bitarnas sammanfogning (join("")) återställer EXAKT
 * originaltexten (styckesbrytningar/rader bevaras för strukturkontrollen).
 * Ett enskilt ord över 500 byte är ett extremfall (data-URL:er): det skickas
 * ändå och MyMemory:s svar underkänns ärligt av kontrollerna — aldrig tyst.
 */
export function delaMyMemoryBitar(text: string): string[] {
  const bitar: string[] = [];
  let nu = "";
  for (const ord of text.match(/\S+\s*/g) ?? []) {
    if (nu.length > 0 && byteLangd(nu) + byteLangd(ord) > MYMEMORY_MAX_BYTES) {
      bitar.push(nu);
      nu = "";
    }
    nu += ord;
  }
  if (nu.length > 0) bitar.push(nu);
  return bitar;
}

/** Har MyMemory:s nyckelfria dagskvot tagit slut? (responseStatus/HTTP/text.) */
export function myMemoryKvot(responseStatus: unknown, httpStatus: number, translatedText?: string): boolean {
  if (httpStatus === 429) return true;
  const rs = typeof responseStatus === "string" ? responseStatus.toUpperCase() : "";
  if (rs.includes("MYMEMORY WARNING")) return true;
  if (typeof translatedText === "string" && translatedText.toUpperCase().includes("MYMEMORY WARNING")) return true;
  return false;
}

/** Får ett anrop med `ord` ord köras givet dagsstatistiken? (Ren funktion.) */
export function myMemoryFarKora(ord: number, stat: { ord: number; anrop: number }): boolean {
  if (stat.ord + ord > MYMEMORY_MAX_ORD_PER_DAG) return false;
  if (stat.anrop >= MYMEMORY_MAX_ANROP_PER_DAG) return false;
  return true;
}

// Modulräknare: per lambda-instans (Vercel Hobby körs kall — räknarna börjar
// på noll varje cron-rond; återanvänds instansen mellan ronder håller de
// dagsgränsen ändå). Hur Hobby-instanser delar tillstånd är okänt — doku-
// menterat ärligt: taken 400 anrop + 5000 ord gäller per PROCESS, inte konto.
let mmDag = "";
let mmOrd = 0;
let mmAnrop = 0;

/** Nollställ dagsräknarna (testbarhet). */
export function nollstallMyMemoryRaknare(): void {
  mmDag = "";
  mmOrd = 0;
  mmAnrop = 0;
}

/** Dagsstatistik med UTC-dagsrullering. */
export function lasMyMemoryStatistik(): { dag: string; ord: number; anrop: number } {
  const idag = new Date().toISOString().slice(0, 10);
  if (mmDag !== idag) {
    mmDag = idag;
    mmOrd = 0;
    mmAnrop = 0;
  }
  return { dag: mmDag, ord: mmOrd, anrop: mmAnrop };
}

function raknaOrd(text: string): number {
  return text.trim().split(/\s+/).filter((o) => o.length > 0).length;
}

async function oversattMyMemory(kalltext: string, sprak: MalSprak): Promise<MotorSvar> {
  const ord = raknaOrd(kalltext);
  if (!myMemoryFarKora(ord, lasMyMemoryStatistik())) return { kvot: true };
  const bitar = delaMyMemoryBitar(kalltext);
  const delar: string[] = [];
  for (const bit of bitar) {
    if (!myMemoryFarKora(0, lasMyMemoryStatistik())) return { kvot: true };
    const karna = bit.trim();
    const efterspel = bit.slice(bit.trimEnd().length === 0 ? bit.length : bit.trimEnd().length);
    if (karna.length === 0) continue;
    // Analys-motor-stil: fast host + DNS-förkontroll; textbiten går ENDAST i q-parametern.
    if (!myMemoryHostKontrollerad) {
      if (!(await kontrolleraHost("api.mymemory.translated.net"))) return null;
      myMemoryHostKontrollerad = true;
    }
    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(karna) +
      "&langpair=" +
      encodeURIComponent("sv|" + sprak);
    let r: Response;
    try {
      r = await fetch(url, {
        headers: { Accept: "application/json" },
        redirect: "error",
        signal: AbortSignal.timeout(EXTERN_TIMEOUT_MS),
      });
    } catch {
      return null;
    }
    const res = r;
    mmAnrop += 1; // räkna varje försök — kvoten konsumeras även av misslyckanden
    if (!res) return null;
    if (res.status === 429) return { kvot: true };
    if (!res.ok) return null;
    try {
      const data = (await res.json()) as { responseData?: { translatedText?: unknown }; responseStatus?: unknown };
      const text = typeof data?.responseData?.translatedText === "string" ? data.responseData.translatedText : "";
      if (myMemoryKvot(data?.responseStatus, res.status, text)) return { kvot: true };
      if (text.trim().length === 0) return null;
      // Efterspelet (mellanslag/radbrytningar efter kärnan) återställs exakt —
      // strukturkontrollen jämför rader och stycken mot källan.
      delar.push(avkodaEntiteter(text) + efterspel);
    } catch {
      return null;
    }
  }
  mmOrd += ord;
  const hel = delar.join("");
  return hel.trim().length > 0 ? { text: hel } : null;
}

// ── Kedjeplan (ren funktion — körbar utan env) ───────────────────────────────

/** Steg i den externa kedjan, i prioriteringsordning. */
export type KedjeSteg = "deepl" | "google" | "mymemory";

/**
 * Kedjeordning: DeepL (om nyckel) → Google (om nyckel) → MyMemory (alltid).
 * OVERSATTNING_EXTERN_AVSTANGD=1 ⇒ tom kedja (testläge utan nät).
 */
export function externKedja(
  tillstand?: { deeplNyckel?: string; googleNyckel?: string; externAvstangd?: boolean },
): readonly KedjeSteg[] {
  const t =
    tillstand === undefined
      ? {
          deeplNyckel: process.env.DEEPL_API_KEY,
          googleNyckel: process.env.GOOGLE_TRANSLATE_KEY,
          externAvstangd: process.env.OVERSATTNING_EXTERN_AVSTANGD === "1",
        }
      : tillstand;
  const steg: KedjeSteg[] = [];
  if (t.externAvstangd) return steg;
  if (t.deeplNyckel && t.deeplNyckel.length > 0) steg.push("deepl");
  if (t.googleNyckel && t.googleNyckel.length > 0) steg.push("google");
  steg.push("mymemory");
  return steg;
}

// ── Huvudfunktion ────────────────────────────────────────────────────────────

/** Vilken motor som producerade svaret ("ingen" vid kö/fel). */
export type MotorNamn = "zai" | "deepl" | "google" | "mymemory" | "termbank" | "ingen";

export type MotorResultat = {
  status: OversattningStatus;
  /** Översättningen (null när ingen producerades). */
  text: string | null;
  poang: number;
  rapport: Kontrollrapport | null;
  /** Deterministisk förklaring till statusen (kö, timeout, kontrollfall). */
  notering: string;
  /** Vilken motor som kördes — determinismbarhet i rapporten. */
  motor: MotorNamn;
};

/** Rondloggning: EN rad per bearbetat objekt, antal per tjänst — aldrig hemligheter. */
const TJANSTE_RAKNARE: Record<string, number> = { deepl: 0, google: 0, mymemory: 0, termbank: 0, kvot: 0 };
let rondNummer = 0;
function loggRond(motor: MotorNamn): void {
  rondNummer += 1;
  const mm = lasMyMemoryStatistik();
  console.log(
    "[mös-motor] rond " + String(rondNummer) +
      " (" + motor + ") — tjänster denna process: deepl=" + String(TJANSTE_RAKNARE.deepl) +
      " google=" + String(TJANSTE_RAKNARE.google) +
      " mymemory=" + String(TJANSTE_RAKNARE.mymemory) +
      " (" + String(mm.ord) + "/" + String(MYMEMORY_MAX_ORD_PER_DAG) + " ord, " +
      String(mm.anrop) + "/" + String(MYMEMORY_MAX_ANROP_PER_DAG) + " anrop idag)" +
      " termbank-direkt=" + String(TJANSTE_RAKNARE.termbank) +
      " kvot=" + String(TJANSTE_RAKNARE.kvot),
  );
}

/** Kontroller + status + notering — identisk värdering för ALLA motorer. */
function rangeratSvar(kalltext: string, text: string, sprak: MalSprak, motor: MotorNamn, noteringPrefix: string): MotorResultat {
  const rapport = korKontroller(kalltext, text, sprak);
  const status = bestamStatus(rapport.poang);
  const notering =
    status === "publicerad"
      ? noteringPrefix + " — alla kontroller gröna, automatiskt publicerad"
      : status === "utkast"
        ? noteringPrefix + " — poäng " + String(rapport.poang) + " ≥ " + String(KVALITETSTRASKEL) + " men < 100, maskinutkast väntar mänsklig granskning"
        : noteringPrefix + " — poäng " + String(rapport.poang) + " < " + String(KVALITETSTRASKEL) + ", kräver granskning oavsett motor";
  return { status, text, poang: rapport.poang, rapport, notering, motor };
}

/**
 * Översätt en källtext sv → sprak. ALDRIG utan kontroller när ett svar finns;
 * utan fungerande motor returneras "vantar-motor" och vid förbrukad MyMemory-
 * kvot "vantar-kvot" (deterministisk ärlighet — motorn låtsas ALDRIG).
 */
export async function oversatt(kalltext: string, sprak: MalSprak): Promise<MotorResultat> {
  if (!MALSPRAK.includes(sprak)) {
    return { status: "vantar-motor", text: null, poang: 0, rapport: null, notering: "ogiltigt målspråk: " + String(sprak), motor: "ingen" };
  }
  if (kalltext.length > MAX_KALLTEXST_LANGD) {
    return {
      status: "vantar-motor",
      text: null,
      poang: 0,
      rapport: null,
      notering: "källan " + String(kalltext.length) + " tecken > " + String(MAX_KALLTEXST_LANGD) + " — för lång för en motorrond, kräver delad körning",
      motor: "ingen",
    };
  }

  // ── Premiumgren: Z.ai (GLM) med termbanken i prompten — våg 52, oförändrad.
  if (motorAktiv()) {
    const { zaiChat } = await import("@/lib/zai");
    const svar = await zaiChat(
      [
        { role: "system", content: byggSystemPrompt(kalltext, sprak) },
        { role: "user", content: kalltext },
      ],
      { temperatur: 0.2, maxTokens: raknaMaxTokens(kalltext.length) },
    );
    if (svar === null || svar.length === 0) {
      return {
        status: "vantar-motor",
        text: null,
        poang: 0,
        rapport: null,
        notering: "motorn svarade inte (timeout/API-fel) — köas till nästa rond",
        motor: "zai",
      };
    }
    // Kör ALDRIG utan kontroller: svaret värderas först här.
    return rangeratSvarZai(kalltext, svar, sprak);
  }

  // ── EXTERN KEDJA (våg 54): standardsättet UTAN AI-nyckel ──
  const kedja = externKedja();

  // PRE: kort text helt täckt av termbanken → direktöversättning, noll nät.
  // (Gäller även när kedjan är avstängd — termbanken är lokal och deterministisk.)
  const direkt = oversattKortTextViaTermbank(kalltext, sprak);
  if (direkt !== null) {
    TJANSTE_RAKNARE.termbank += 1;
    loggRond("termbank");
    return rangeratSvar(kalltext, direkt, sprak, "termbank", "kort text (≤ " + String(DIREKT_MAX_ORD) + " ord) helt täckt av termbanken — översatt direkt ur banken utan motoranrop");
  }

  if (kedja.length === 0) {
    return {
      status: "vantar-motor",
      text: null,
      poang: 0,
      rapport: null,
      notering: "externa kedjan avstängd (OVERSATTNING_EXTERN_AVSTANGD=1) och ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning",
      motor: "ingen",
    };
  }

  // Första tjänst som lyckas vinner; kvot från sista steget ⇒ "vantar-kvot".
  for (const steg of kedja) {
    const svar =
      steg === "deepl"
        ? await oversattDeepL(kalltext, sprak)
        : steg === "google"
          ? await oversattGoogle(kalltext, sprak)
          : await oversattMyMemory(kalltext, sprak);
    if (svar && "text" in svar && svar.text.trim().length > 0) {
      TJANSTE_RAKNARE[steg] += 1;
      // POST: termbanken rättar felaktiga termöversättningar DETERMINISTISKT
      // (före kontrollerna — termKonsistens-poängen höjs utan att röra dem).
      const post = tvingaTermbank(kalltext, svar.text, sprak);
      loggRond(steg);
      const rattNotering = post.rattade.length > 0
        ? " — termbanken rättade " + String(post.rattade.length) + " term(er) efter motorn (" + post.rattade.map((r) => r.via).join(",") + ")"
        : "";
      return rangeratSvar(kalltext, post.text, sprak, steg, "extern motor " + steg + " svarade" + rattNotering);
    }
    if (svar && "kvot" in svar) {
      TJANSTE_RAKNARE.kvot += 1;
      loggRond("mymemory");
      const stat = lasMyMemoryStatistik();
      return {
        status: "vantar-kvot",
        text: null,
        poang: 0,
        rapport: null,
        notering: "MyMemory:s nyckelfria dagskvot är förbrukad (" +
          String(stat.ord) + "/" + String(MYMEMORY_MAX_ORD_PER_DAG) + " ord, " +
          String(stat.anrop) + "/" + String(MYMEMORY_MAX_ANROP_PER_DAG) +
          " anrop) — köas till nästa dags rond (ca 24 h); DEEPL_API_KEY/GOOGLE_TRANSLATE_KEY ger premium utan kvot",
        motor: "mymemory",
      };
    }
  }

  return {
    status: "vantar-motor",
    text: null,
    poang: 0,
    rapport: null,
    notering: "externa kedjan (DeepL → Google → MyMemory) svarade inte — köas till nästa rond",
    motor: "ingen",
  };
}

/** ZAI-grenens notering — ordalydelse från våg 52 (oförändrad). */
function rangeratSvarZai(kalltext: string, svar: string, sprak: MalSprak): MotorResultat {
  const rapport = korKontroller(kalltext, svar, sprak);
  const status = bestamStatus(rapport.poang);
  return {
    status,
    text: svar,
    poang: rapport.poang,
    rapport,
    notering:
      status === "publicerad"
        ? "alla kontroller gröna — automatiskt publicerad"
        : status === "utkast"
          ? "poäng " + String(rapport.poang) + " ≥ " + String(KVALITETSTRASKEL) + " men < 100 — maskinutkast väntar mänsklig granskning"
          : "poäng " + String(rapport.poang) + " < " + String(KVALITETSTRASKEL) + " — kräver granskning oavsett motor",
    motor: "zai",
  };
}
