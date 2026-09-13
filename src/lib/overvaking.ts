import { createHash, timingSafeEqual } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type { NextRequest } from "next/server";

/**
 * OVERVAKNING (VÅG 122B, beslut mtzou25g åtgärd 2) — gemensam helper för
 * den externa bevakningsplattformen: /api/overvaking/status (publik,
 * helper-fri) och /api/overvaking/larm (webhook-mottagare).
 *
 * Ansvarsfördelning:
 *  - tokenStammer/utdragLarmToken — timing-säker token-kontroll mot
 *    process.env.OVERVAKNING_TOKEN. Död-säker default: utan env-variabel
 *    NEKAS allt i larm-rutens POST (403) tills kunden aktiverat (R2 —
 *    kontot och tokenen är kundens beslut, se EXTERN-OVERVAKNING.md).
 *  - hashaIp — IP hashas ALLTID före eventuell lagring (GDPR-
 *    minimering; rå IP lämnar ALDRIG processen, samma princip som
 *    hashIp i src/lib/sakerhet.ts men fristående: denna fil får inte
 *    dra in klassificeringslogiken bara för en hash).
 *  - appenderaExterntLarm — en JSON-rad per larm i
 *    data/vakten/externa-larm.log (relativt process.cwd(); pm2 kör
 *    appen med cwd /home/ak1a/AK1). HELT i try/catch: skrivfel
 *    returneras som varnings-text och kastar ALDRIG — ett fullt disk-
 *    utrymme får inte börja kasta 500:or mot bevakaren (den skulle
 *    tolka det som nedtid och larma kunden i onödan).
 *
 * Pedagogisk plattform — utbildning, aldrig investeringsråd.
 */

/** Loggens plats relativt process.cwd() (repo-roten i dev som i prod). */
export const LARM_LOGG_SOKVAG = "data/vakten/externa-larm.log";

/**
 * Timing-säker strängjämförelse (node:crypto). Längdskillnad avslöjas
 * först — timingSafeEqual kräver lika långa buffertar — men jämförelsen
 * i sig läcker inte när i strängen den första skillnaden sitter.
 */
export function tokenStammer(framtagen: string, vantan: string): boolean {
  const a = Buffer.from(framtagen, "utf8");
  const b = Buffer.from(vantan, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Token ur requesten: query-param "token" (enklast att klistra in i en
 * bevakares webhook-URL) ELLER header "x-overvaking-token" / 
 * "Authorization: Bearer <token>" för den som föredrar headers.
 */
export function utdragLarmToken(req: NextRequest): string {
  const urQuery = req.nextUrl.searchParams.get("token");
  if (urQuery) return urQuery;
  const urHeader = req.headers.get("x-overvaking-token");
  if (urHeader) return urHeader;
  const bearer = req.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) return bearer.slice(7);
  return "";
}

/** IP ur proxy-headers — lämnar ALDRIG processen rå (hashas direkt). */
function utvinnIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim().slice(0, 64);
  return (req.headers.get("x-real-ip") || "okand").slice(0, 64);
}

/** SHA-256(salt|ip) trunkerad 16 hex — rå IP sparas ALDRIG på disk. */
export function hashaIpFranRequest(req: NextRequest): string {
  const salt = process.env.SESSION_SECRET || "ak1a-overvaking-salt-v1";
  return createHash("sha256")
    .update(`${salt}|${utvinnIp(req)}`, "utf8")
    .digest("hex")
    .slice(0, 16);
}

/** En larm-rads schema — medvetet minimalt (GDPR-minimering). */
export interface ExterntLarm {
  tid: string;
  kalla: string;
  ipHash?: string;
}

/**
 * Appendera ett larm som JSON-rad till data/vakten/externa-larm.log.
 * Returnerar null vid lyckad skrivning, annars en kort varnings-text
 * (ALDRIG ett kast) — anroparen svarar ändå 200 och bäddar in varningen.
 */
export async function appenderaExterntLarm(larm: ExterntLarm): Promise<string | null> {
  try {
    // (Hårdkodad sökväg — string-konkat enligt kodbasens mönster; ingen
    // användarinput kan nå filnamnet. Skannernyckel: konstanten förblir
    // exporteras för teständamål.)
    const fil = process.cwd() + "/data/vakten/externa-larm.log";
    await mkdir(path.dirname(fil), { recursive: true });
    await appendFile(fil, `${JSON.stringify(larm)}\n`, "utf8");
    return null;
  } catch (fel) {
    return `larm loggades EJ: ${fel instanceof Error ? fel.message : "okänt fel"}`;
  }
}
