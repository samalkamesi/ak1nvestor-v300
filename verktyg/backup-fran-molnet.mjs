/**
 * BACKUP FRÅN MOLNET v2 — drar levande data från Supabase till lokala
 * backupfiler på DATORN (hybridarkitekturen: molnet driver, datorn backupar).
 *
 * Skriver data/backups/<typ>-<datum>.json (ren snapshot, lokalt only —
 * data/backups/ är gitignorad). Läser .env (ENDAST env — Mimosa-kontraktet:
 * aldrig literaler, aldrig loggade nycklar). Kastar ALDRIG — varje typ
 * backas upp oberoende, felet loggas i svaret.
 *
 * v2 (FULLSTÄNDIG nivå):
 *   - FULL system_events-dump: ALLA rader oavsett type, Range-paginering
 *     5000/sida, tak 40 sidor (200k rader) → system-events-full-<datum>.json
 *     (gzip:ad som .json.gz via zlib om den oväxlade dumpen > 20 MB).
 *   - medlemmar (type=medlem) + medlem_progress som egna typer (framtidssäkra).
 *   - --max-sidor=N: begränsa antal sidor i full-dumpen vid behov (1..40).
 *   - Summeringsrad med totalt antal MB skrivet.
 *   - v2.1 (2026-09-16, DR-KEDJA4): per-typ-filerna bär truncerad-markör —
 *     limit=5000 var OMARKERAT, en avklippt snapshot skilde sig inte från en
 *     komplett (kontraktet kontrolleras av verktyg/dr-kedja4.mjs).
 *
 * Användning: node verktyg/backup-fran-molnet.mjs [typ] [--max-sidor=N]
 *   (körs utan argument av hybrid-sync — bakåtkompatibelt med v1-anropet)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

try { process.loadEnvFile(".env"); } catch {}
try { process.loadEnvFile(".env.local"); } catch {}

const BAS = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NYCKEL = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const FLAGGA_MAX_SIDOR = process.argv.find(a => a.startsWith("--max-sidor="));
const MAX_SIDOR = (() => {
  const n = FLAGGA_MAX_SIDOR ? Number(FLAGGA_MAX_SIDOR.slice(12)) : 40;
  return Number.isInteger(n) && n >= 1 ? Math.min(n, 40) : 40; // hårt tak: 40 sidor
})();
const TYP = process.argv.slice(2).find(a => !a.startsWith("--")); // valfritt: en typ

const STJARN_DATUM = new Date().toISOString().slice(0, 10);
const SIDSTORLEK = 5000; // rader per sida i full-dumpen
const PERTYP_TAK = 5000; // per-typ-snapshots: limit i REST-anropet — vid taket
// bär filen truncerad=true sedan 2026-09-16 (DR-KEDJA4-fynd: taket var
// OMARKERAT — en avklippt snapshot gick inte att skilja från en komplett)
const GRANS_GZIP = 20 * 1024 * 1024; // 20 MB — över detta gzip:as full-dumpen
const HEADERS = { apikey: NYCKEL, Authorization: "Bearer " + NYCKEL };

// (Mimosa-kontraktet: fast https-literal-validerad bas, råa %-kodade filter-
// värden, inga URL:ar ur variabler i sökväg)
if (!BAS || !NYCKEL) {
  console.log("backup-fran-molnet: env saknas — hoppar (molnbackup ej konfigurerad)");
  process.exit(0);
}
if (!/^https:\/\/[a-z0-9][a-z0-9-]*\.supabase\.co$/.test(BAS)) {
  console.log("backup-fran-molnet: ogiltig bas-URL — hoppar");
  process.exit(0);
}

const TILLFALLEN = [
  { fil: "variabler", event: "variabel" },
  { fil: "variabel-andringar", event: "variabel-andring" },
  { fil: "kurs-metadata", event: "kurs_metadata" },
  { fil: "kurs-metadata-andringar", event: "kurs_metadata-andring" },
  { fil: "termbank-tillagg", event: "termbank_tillagg" },
  { fil: "blogg-utkast", event: "blogg_utkast" },
  { fil: "blogg-publicerade", event: "blogg_publicerad" },
  { fil: "media-filer", event: "media_fil" },
  { fil: "medlemmar", event: "medlem" }, // v2: framtidssäkrad (medlem-auth)
  { fil: "medlem-progress", event: "medlem_progress" }, // v2: framtidssäkrad
];

const resultat = [];
let totaltByte = 0;

function skriv(fil, str) {
  writeFileSync(fil, str);
  const n = Buffer.byteLength(str);
  totaltByte += n;
  return n;
}

const mapa = TYP && TYP !== "system-events-full" ? TILLFALLEN.filter(t => t.fil === TYP) : TILLFALLEN;

// (1) per-typ-snapshots (senaste 5000 per event-typ, som v1 + de två nya)
for (const t of mapa) {
  try {
    const url = BAS + "/rest/v1/system_events?type=eq." + encodeURIComponent(t.event) +
      "&select=created_at,details&order=created_at.desc&limit=" + PERTYP_TAK;
    const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
    if (!r.ok) {
      resultat.push(t.fil + ": HTTP " + r.status);
      continue;
    }
    const rader = await r.json();
    mkdirSync("data/backups", { recursive: true });
    const fil = path.join("data/backups", t.fil + "-" + STJARN_DATUM + ".json");
    skriv(fil, JSON.stringify({ typ: t.event, datum: new Date().toISOString(), antal: rader.length, truncerad: rader.length >= PERTYP_TAK, rader }, null, 2));
    resultat.push(t.fil + ": " + rader.length + " rader → " + fil);
  } catch (e) {
    resultat.push(t.fil + ": FEL " + (e?.message ?? String(e)).slice(0, 60));
  }
}

// (2) FULL system_events-dump — ALLA rader, Range-paginering 5000/sida.
// Sortering på created_at.desc,id.desc (id är PK) ger stabil sidindelning.
if (!TYP || TYP === "system-events-full") {
  try {
    const alla = [];
    let sidor = 0;
    let truncerad = false;
    for (let sida = 0; sida < MAX_SIDOR; sida++) {
      const fran = sida * SIDSTORLEK;
      const url = BAS + "/rest/v1/system_events?select=*&order=created_at.desc,id.desc";
      const r = await fetch(url, {
        headers: { ...HEADERS, Range: fran + "-" + (fran + SIDSTORLEK - 1), "Range-Unit": "items" },
        signal: AbortSignal.timeout(60000),
      });
      if (r.status === 416) break; // offset utanför tabellen — klar
      if (!r.ok) throw new Error("HTTP " + r.status + " på sida " + (sida + 1));
      const bit = await r.json();
      sidor++;
      alla.push(...bit);
      if (!Array.isArray(bit) || bit.length < SIDSTORLEK) break; // sista sidan
    }
    truncerad = alla.length >= MAX_SIDOR * SIDSTORLEK;
    mkdirSync("data/backups", { recursive: true });
    const json = JSON.stringify(
      { typ: "system_events_full", datum: new Date().toISOString(), antal: alla.length, sidor, truncerad, rader: alla },
      null, 2
    );
    const namn = truncerad ? " (TAK " + MAX_SIDOR + " sidor nått — dumpen kan vara ofullständig)" : "";
    if (Buffer.byteLength(json) > GRANS_GZIP) {
      const fil = path.join("data/backups", "system-events-full-" + STJARN_DATUM + ".json.gz");
      const gz = gzipSync(json, { level: 6 });
      writeFileSync(fil, gz);
      totaltByte += gz.length;
      resultat.push("system-events-full: " + alla.length + " rader (" + sidor + " sidor) → " + fil +
        " [gzip " + (gz.length / 1048576).toFixed(1) + " MB]" + namn);
    } else {
      const fil = path.join("data/backups", "system-events-full-" + STJARN_DATUM + ".json");
      const n = skriv(fil, json);
      resultat.push("system-events-full: " + alla.length + " rader (" + sidor + " sidor) → " + fil +
        " [" + (n / 1048576).toFixed(1) + " MB]" + namn);
    }
  } catch (e) {
    resultat.push("system-events-full: FEL " + (e?.message ?? String(e)).slice(0, 80));
  }
}

// (3) summering — totalt MB skrivet denna körning
const mb = totaltByte / 1048576;
console.log("backup-fran-molnet " + STJARN_DATUM + ":\n  " + resultat.join("\n  ") +
  "\n  TOTALT: " + (resultat.filter(r => r.includes("→")).length) + " filer, " + mb.toFixed(2) + " MB skrivet");
