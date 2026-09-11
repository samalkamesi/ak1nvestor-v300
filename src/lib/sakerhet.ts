/**
 * SÄKERHETSLIB (edge + node) — trafikvaktens "DNA-blockering" och sanering.
 *
 * Delas av src/middleware.ts (edge-runtime) och /api/trafik +
 * /api/sakerhet/handelser (node-runtime) — därför ENDAST webbstandard:
 * Web Crypto (crypto.subtle), fetch, URL. Inga node-API:er, inga fs.
 *
 * KUNDENS DIREKTIV: "fullständig säkerhet och dna-blockeringar och
 * intelligenta system". Detta är det deterministiska lagret:
 *   1. HOT-KLASS   — kända scanner-mönster i sökvägen (.env, wp-admin,
 *                    phpmyadmin, .git …) → blockeras 403 i middleware.
 *   2. MISSTÄNKT   — tom/felaktig UA i kombination med hög frekvens
 *                    (sekvens-fönster i middleware, per instans) → 429.
 *   3. OK          — normal trafik, passeras med klass-header.
 *
 * GDPR (se /transparens): ALDRIG rå IP i databasen — endast SHA-256-hash
 * med salt från SESSION_SECRET (eller fast fallback-konfiguration),
 * trunkerad till 16 hexadecimaler. Sökvägar trunkeras till 120 tecken,
 * UA till 120, query-strängar avlägsnas ALLTID (aldrig mätvärden från
 * URL-parametrar). Skrivningar går via getSupabaseRest (endast https
 * *.supabase.co — samma SSRF-värdvalidering som övriga stackar) till
 * system_events med type=sakerhet / type=trafik.
 */

import { getSupabaseRest } from "@/lib/supabase-rest";

// ── Sanering ─────────────────────────────────────────────────────────────────

export const MAX_PATH_LANGD = 120;
export const MAX_UA_LANGD = 120;

/** Sökväg utan query, kontrolltecken rensade, trunkerad 120 — alltid "/"-prefix. */
export function sannyaPath(rap: string | null | undefined): string {
  if (typeof rap !== "string") return "/";
  let p = rap.split("?")[0].split("#")[0];
  // Kontrolltecken och vita tecken runt vägen
  p = p.replace(/[\x00-\x1f\x7f]/g, "").trim();
  if (!p.startsWith("/")) p = "/" + p;
  return p.slice(0, MAX_PATH_LANGD);
}

/** UA rensad för radbrytningar (header-injektion), trunkerad 120. */
export function sannyaUa(ua: string | null | undefined): string {
  if (typeof ua !== "string") return "";
  return ua.replace(/[\r\n\x00-\x1f\x7f]/g, " ").trim().slice(0, MAX_UA_LANGD);
}

/** Värdnamn ur en referrer-URL — eller "direkt" vid saknad/ogiltig. */
export function sannyaRefHost(ref: string | null | undefined): string {
  if (typeof ref !== "string" || !ref) return "direkt";
  try {
    const host = new URL(ref).hostname.toLowerCase();
    return host.slice(0, 100) || "direkt";
  } catch {
    return "ovrigt";
  }
}

// ── IP + hash ────────────────────────────────────────────────────────────────

/** IP ur proxiedheaders (x-forwarded-for först) — lämnar ALDRIG processen rå. */
export function utvinnIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const forsta = xff.split(",")[0].trim();
    if (forsta) return forsta.slice(0, 64);
  }
  return (req.headers.get("x-real-ip") || "okand").slice(0, 64);
}

function salt(): string {
  // Env i första hand; fast fallback-konfig så dev/nya instanser hashing-stabilt.
  return process.env.SESSION_SECRET || "ak1a-sakerhet-salt-v1";
}

const hex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

/** SHA-256(salt + ip), trunkerad 16 hex — rå IP sparas ALDIG i databasen. */
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(salt() + "|" + ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return hex(digest).slice(0, 16);
}

/** Kort visningsform av en hash (adminpanelen visar aldrig hela). */
export function kortHash(hash: string | null | undefined): string {
  return typeof hash === "string" ? hash.slice(0, 8) : "—";
}

// ── Klassificering ───────────────────────────────────────────────────────────

/** Scanner-mönster i SÖKVÄGEN → hot-klass. Äkta AK1A-sökvägar matchar aldrig. */
const HOT_MONSTER: ReadonlyArray<{ re: RegExp; namn: string }> = [
  { re: /\.env($|[./])/i, namn: "dotenv" },
  { re: /wp-admin|wp-login|wp-content|wp-includes|wordpress/i, namn: "wordpress" },
  { re: /phpmyadmin|pma\b|myadmin/i, namn: "phpmyadmin" },
  { re: /\.git($|[\/])/i, namn: "git" },
  { re: /\.svn|\.hg($|[\/])/i, namn: "vcs" },
  { re: /\.aws|\.ssh($|[\/])/i, namn: "moln-nycklar" },
  { re: /xmlrpc\.php/i, namn: "xmlrpc" },
  { re: /cgi-bin/i, namn: "cgi" },
  { re: /vendor\/phpunit|eval-stdin/i, namn: "phpunit" },
  { re: /\/\.ds_store|\.bak$|\.old$|~$/i, namn: "backup-fil" },
  { re: /\/((telespy|hafen|kraljevic)\.php|alfadata\.php)/i, namn: "sårbarhetsskanner" },
  { re: /(shell|c99|r57|webshell|cmd=)/i, namn: "shell" },
  { re: /\/(actuator|jmx-console|manager\/html)/i, namn: "java-sond" },
  { re: /\.aws\/credentials|id_rsa|\.pgpass/i, namn: "hemligheter" },
];

export type UaKlass = "bot" | "mobil" | "dator" | "okand";

/** UA-fingeravtryck → enhets-/robotklass (mobil först: mest specifik). */
export function klassificeraUa(ua: string): UaKlass {
  const u = (ua || "").toLowerCase();
  if (!u || u.length < 8) return "okand";
  if (/bot|crawler|spider|slurp|curl|wget|python-requests|python-urllib|scrapy|httpclient|java\/|go-http-client|libwww|micromessenger|headlesschrome|phantomjs|puppeteer|playwright|semrush|ahrefs|mj12|dotbot|bytespider|petalbot|dataforseo|gptbot|claudebot|ccbot/.test(u)) {
    return "bot";
  }
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|opera mobi/.test(u)) return "mobil";
  if (/mozilla\/5|chrome\/|safari\/|firefox\/|edg\/|opera\/|samsungbrowser/.test(u)) return "dator";
  return "okand";
}

export type HotKlass = "hot" | "misstankt" | "ok";

/** Sökväg + UA → hot-klass (deterministiskt, inga nätanrop). */
export function klassificeraRequest(path: string, ua: string): { klass: HotKlass; monster?: string } {
  for (const m of HOT_MONSTER) {
    if (m.re.test(path)) return { klass: "hot", monster: m.namn };
  }
  // Tom/felaktig UA på en vanlig sida är inte hot i sig — det kombineras
  // med frekvens i middleware (sekvens > tröskel) till "misstankt".
  return { klass: "ok" };
}

// ── Skrivningar till system_events ───────────────────────────────────────────

export type SakerhetEvent = {
  klass: "hot" | "misstankt" | "flod";
  http: 403 | 429;
  path: string;
  ipHash: string;
  ua: string;
  monster?: string;
};

/**
 * Loggar EN blockering till system_events (type=sakerhet).
 * Fire-and-forget-vänlig: returnerar alltid (false vid fel/utan konfig).
 * Anropas från middleware via event.waitUntil — FÅR ALDRIG kasta.
 */
export async function loggaSakerhetEvent(e: SakerhetEvent): Promise<boolean> {
  const rest = getSupabaseRest();
  if (!rest) return false;
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: "sakerhet",
        severity: e.klass === "hot" ? "warning" : "info",
        message: `[sakerhet] ${e.http} ${e.klass}${e.monster ? ` (${e.monster})` : ""} → ${e.path} [${kortHash(e.ipHash)}]`,
        details: {
          schema: "ak1a-sakerhet/1",
          klass: e.klass,
          http: e.http,
          path: e.path,
          ip_hash: e.ipHash,
          ua: e.ua,
          monster: e.monster ?? null,
        },
        source: "middleware/sakerhet",
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type TrafikEvent = {
  dag: string; // YYYY-MM-DD (serverlokal vid läsning)
  path: string;
  refHost: string;
  uaKlass: UaKlass;
  sprak: string | null;
  land: string | null;
  /** Sessionshash (hashad av servern FÖRE skrivning) — null i minimal läge. */
  sessionHash: string | null;
  /** true = sidvisning, false = keepalive-puls för "besökare just nu". */
  puls: boolean;
  /** "forsta" | "stickprov" | "bot" | "minimal" | "felgrans" — hur raden blev vald. */
  urval: string;
  /**
   * Felgräns-telemetri (VÅG 101): "chunk" (modul-laddningsfel → självläkning)
   * eller "ovrigt" (riktigt app-fel) — null för vanliga sidvisningar/pulsar.
   * PII-fritt: raden bär endast kategori + sökväg (utan query).
   */
  fel?: "chunk" | "ovrigt" | null;
};

/** Bygger en system_events-rad (type=trafik) — HEL payload i details. */
export function trafikRad(t: TrafikEvent) {
  return {
    type: "trafik",
    severity: "info",
    message: `[trafik] ${
      t.puls ? "puls" : t.fel ? `felgräns (${t.fel})` : "sidvisning"
    } → ${t.path} (${t.uaKlass}${t.urval ? `, ${t.urval}` : ""})`,
    details: {
      schema: "ak1a-trafik/1",
      dag: t.dag,
      path: t.path,
      ref: t.refHost,
      ua: t.uaKlass,
      sprak: t.sprak,
      land: t.land,
      s: t.sessionHash,
      puls: t.puls,
      urval: t.urval,
      fel: t.fel ?? null,
    },
    source: "trafik",
  };
}

/** Skriver ett batch (≤10) trafikrader — en POST, return=minimal. */
export async function skrivTrafikBatch(rader: ReturnType<typeof trafikRad>[]): Promise<boolean> {
  const rest = getSupabaseRest();
  if (!rest || rader.length === 0) return false;
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(rader),
    });
    return res.ok;
  } catch {
    return false;
  }
}
