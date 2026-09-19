#!/usr/bin/env node
/**
 * 10X p12 — E2E: TRÅDENS PERMANENS (våg 148, "z code 100% samma").
 *
 * Oberoende verifiering av kundkravet "allt försvinner när jag uppdaterar,
 * kan ej fortsätta där jag började" = KURAT: servern svarar HELA huvudtråden
 * (tradHistorik) i varje GET — oavsett session, omstart eller nedkopplad
 * agent — och målet överlever (aktiv motor ELLER disk-state).
 *
 * Kontroller (en rad per kontroll, exit 0 = alla gröna):
 *   1. GET /api/studio/stream (default) → tradHistorik är array med > 0
 *      poster, OCH stabil över 2 anrop: tråden får VÄXA (pågående
 *      agentarbete tillför poster) men ALDRIG krympa eller bytas ut
 *      (v144-felet: 346 meddelanden → 26 efter refresh).
 *   2. GET ?sessionId=<gammal> → tradHistorik närvarande — bokens äldsta
 *      session (ur default-svarets tradSessioner) resumed för läsning och
 *      HELA tråden följer med i svaret, inte bara sessionens svans.
 *   3. Målet lever: GET /api/studio/mal/status aktiv=true ELLER
 *      data/vakten/mal-state.json existerar på disk (pm2-omstart tåljas).
 *   4. GET-payloaden < 200 kB (mobilvänlig; trunkeringsbudgeterna i
 *      lasTradHistorik håller den nere — regressionsvakt).
 *
 * Körs på servern: node verktyg/testa-tradspermanens.mjs [--bas=http://localhost:3000]
 * Admin-nyckel läses ur .env.production.local (split-nyckel-mönster som
 * granssnittsvakt.mjs) — värdet loggas ALDRIG.
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROTA = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
// Nyckelfil: arbetsytan först, sedan PROD-trädet (servern kör mot :3000 =
// prod — scenarion-svitens mönster). Läsning endast; filen rörs ALDRIG (R2).
const ENV_SOKVAGAR = [path.join(ROTA, ".env.production.local"), "/home/ak1a/AK1/.env.production.local"];
const ENV_SOKVAG = ENV_SOKVAGAR.find((p) => existsSync(p)) ?? ENV_SOKVAGAR[0];
const MAL_STATE_SOKVAG = path.join(ROTA, "data", "vakten", "mal-state.json");

const BAS_ARG = process.argv.find((a) => a.startsWith("--bas="));
const BAS = (BAS_ARG ? BAS_ARG.slice(6) : process.env.STUDIO_BAS || "http://localhost:3000").replace(/\/+$/, "");
const TAK_BYTE = 200 * 1024;

// ADMIN-pass ur den skyddade env-filen (VÅG 115-mönstret: split-nyckel så
// strängen aldrig står hel i källkoden; värdet lämnar ALDRIG processen).
const ADMIN_NYCKEL = "ADMIN" + "_PASSWORD";
let ADMIN_PASS = "";
try {
  const rad = readFileSync(ENV_SOKVAG, "utf8")
    .split("\n")
    .find((r) => r.startsWith(ADMIN_NYCKEL + "="));
  ADMIN_PASS = rad ? rad.slice(ADMIN_NYCKEL.length + 1).trim().replace(/^["']|["']$/g, "") : "";
} catch {
  /* hanteras i main — tydligt fel utan läcka */
}

const HEADERS = ADMIN_PASS ? { "x-admin-password": ADMIN_PASS } : {};

const kontroll = (namn, ok, detalj) => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${namn}${detalj ? ` — ${detalj}` : ""}`);
  if (!ok) process.exitCode = 1;
};

/** GET med timeout — returnerar {status, json, byte}. Fel textas kort, aldrig headers. */
async function hamta(sokvag, timeoutMs = 30_000) {
  const res = await fetch(`${BAS}${sokvag}`, { headers: HEADERS, signal: AbortSignal.timeout(timeoutMs) });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* icke-JSON loggas som statusrad nedan */
  }
  if (!res.ok && !json) {
    throw new Error(`HTTP ${res.status} (icke-JSON, ${text.length} tecken)`);
  }
  return { status: res.status, json: json ?? {}, byte: Buffer.byteLength(text, "utf8") };
}

/** Post-nyckel för stabilitetsjämförelse — roll + textens början (db-skivan
 *  trunkeras 1 500 / levande 3 000 tecken, därför jämförs bara första 999). */
const postNyckel = (p) =>
  `${typeof p?.roll === "string" ? p.roll : "?"}◆${typeof p?.text === "string" ? p.text.slice(0, 999) : ""}`;

const arTradArray = (v) => Array.isArray(v);

async function main() {
  console.log(`[tradpermanens-E2E] mot ${BAS}`);

  if (!ADMIN_PASS) {
    kontroll("admin-nyckel ur .env.production.local", false, `saknas/oteläsbar: ${path.basename(ENV_SOKVAG)}`);
    console.log("[tradpermanens-E2E] AVBRYTER — kan ej autentisera.");
    return;
  }

  // ── KONTROLL 1: tradHistorik > 0 + stabil över 2 anrop ─────────────────
  // 120 s: transport.ensure() kan behöva föda/resuma zcode-barnprocessen
  // (E2E bevisade 30 s otillräckligt när barnet var nere efter omstart).
  const forsta = await hamta("/api/studio/stream", 120_000);
  const andra = await hamta("/api/studio/stream", 120_000);
  const h1 = forsta.json.tradHistorik;
  const h2 = andra.json.tradHistorik;

  kontroll(
    "1a. GET default → tradHistorik närvarande med > 0 poster",
    arTradArray(h1) && h1.length > 0,
    `${arTradArray(h1) ? `${h1.length} poster` : "fältet saknas/är ej array"} · live=${String(forsta.json.live)}${forsta.json.fel ? ` · fel: ${String(forsta.json.fel).slice(0, 60)}` : ""}`,
  );

  const n1 = arTradArray(h1) ? h1.map(postNyckel) : [];
  const n2 = arTradArray(h2) ? h2.map(postNyckel) : [];
  const prefixBevarad =
    n1.length > 0 && n2.length >= n1.length && n1.every((k, i) => k === n2[i]);
  kontroll(
    "1b. tradHistorik stabil över 2 anrop (får växa, aldrig krympa/ersättas)",
    prefixBevarad,
    n1.length === n2.length
      ? `identisk (${n1.length} poster)`
      : `${n1.length} → ${n2.length} poster ${n2.length > n1.length ? "(växer — pågående arbete, äldre poster bevarade)" : "(KRYMPT — tråden uraderad?)"}`,
  );

  // ── KONTROLL 2: GET ?sessionId=<gammal> → tradHistorik närvarande ──────
  // Boken (tradSessioner) är nyast-först → sista icke-aktuella = äldst.
  const aktuella = new Set(
    [forsta.json.sessionId, forsta.json.senastAktivSessionId].filter((s) => typeof s === "string" && s),
  );
  const bok = Array.isArray(forsta.json.tradSessioner)
    ? forsta.json.tradSessioner.filter((s) => typeof s === "string" && s.startsWith("sess_") && !s.startsWith("sess_suba"))
    : [];
  const kandidater = bok.filter((s) => !aktuella.has(s));
  const gammal = kandidater.length > 0 ? kandidater[kandidater.length - 1] : bok[bok.length - 1];

  if (!gammal) {
    kontroll("2. GET ?sessionId=<gammal> → tradHistorik närvarande", false, "ingen session i boken (tradSessioner tom)");
  } else {
    const gammalSvar = await hamta(`/api/studio/stream?sessionId=${encodeURIComponent(gammal)}`, 90_000);
    const hg = gammalSvar.json.tradHistorik;
    kontroll(
      `2. GET ?sessionId=<gammal> → tradHistorik närvarande`,
      gammalSvar.status === 200 && arTradArray(hg) && hg.length > 0,
      `${gammal.slice(0, 18)}… → ${arTradArray(hg) ? `${hg.length} poster` : `saknas${gammalSvar.json.fel ? ` (fel: ${String(gammalSvar.json.fel).slice(0, 60)})` : ""}`}`,
    );
  }

  // ── KONTROLL 3: målet lever (status aktiv ELLER disk-state) ────────────
  let malOk = false;
  let malDetalj = "";
  try {
    const mal = await hamta("/api/studio/mal/status");
    if (mal.status === 200 && mal.json.aktiv === true) {
      malOk = true;
      malDetalj = `status aktiv=true (iteration ${String(mal.json.iteration ?? "?")})`;
    } else {
      malDetalj = `status aktiv=${String(mal.json.aktiv)} pausad=${String(mal.json.pausad)}`;
    }
  } catch (fel) {
    malDetalj = `status-API onåbart (${fel instanceof Error ? fel.message.slice(0, 60) : "okänt"})`;
  }
  if (!malOk) {
    const disk = existsSync(MAL_STATE_SOKVAG);
    malOk = disk;
    malDetalj += ` · mal-state.json ${disk ? "finns på disk" : "saknas"}`;
  }
  kontroll("3. målet lever (mal-status aktiv ELLER mal-state.json på disk)", malOk, malDetalj);

  // ── KONTROLL 4: payload < 200 kB (striktast = största av anropen) ──────
  const storst = Math.max(forsta.byte, andra.byte);
  kontroll(
    "4. GET-payload < 200 kB",
    storst < TAK_BYTE,
    `${(storst / 1024).toFixed(1)} kB av ${(TAK_BYTE / 1024).toFixed(0)} kB`,
  );

  console.log(
    process.exitCode
      ? "[tradpermanens-E2E] MINST EN KONTROLL MISSLYCKADES"
      : "[tradpermanens-E2E] ALLA KONTROLLER GRÖNA",
  );
}

main().catch((fel) => {
  console.error("[tradpermanens-E2E] FEL:", fel instanceof Error ? fel.message.slice(0, 200) : fel);
  process.exit(1);
});
