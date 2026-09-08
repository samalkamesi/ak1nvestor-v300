/**
 * BACKUP FRÅN MOLNET — drar levande data från Supabase till lokala
 * backupfiler på DATORN (hybridarkitekturen: molnet driver, datorn backupar).
 *
 * Skriver data/backups/<typ>-<datum>.json (ren snapshot, lokalt only —
 * data/backups/ är gitignorad). Läser .env (ENDAST env — Mimosa-kontraktet:
 * aldrig literaler, aldrig loggade nycklar). Kastar ALDRIG — varje typ
 * backas upp oberoende, felet loggas i svaret.
 *
 * Användning: node verktyg/backup-fran-molnet.mjs   (körs av hybrid-sync)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

try { process.loadEnvFile(".env"); } catch {}
try { process.loadEnvFile(".env.local"); } catch {}

const BAS = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NYCKEL = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TYP = process.argv[2]; // valfritt: backup:a bara en typ
const STJARN_DATUM = new Date().toISOString().slice(0, 10);

// (Mimosa-kontraktet: fast https-literal-validerad bas, råa %-kodade filter-
// värden, inga URL:ar ur variabler i sökväg, redirect aldrig följt ej här nödvändigt)
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
];

const resultat = [];
const map = TYP ? TILLFALLEN.filter(t => t.fil === TYP) : TILLFALLEN;

for (const t of map) {
  try {
    const url = BAS + "/rest/v1/system_events?type=eq." + encodeURIComponent(t.event) +
      "&select=created_at,details&order=created_at.desc&limit=5000";
    const r = await fetch(url, {
      headers: { apikey: NYCKEL, Authorization: "Bearer " + NYCKEL },
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) {
      resultat.push(t.fil + ": HTTP " + r.status);
      continue;
    }
    const rader = await r.json();
    mkdirSync("data/backups", { recursive: true });
    const fil = path.join("data/backups", t.fil + "-" + STJARN_DATUM + ".json");
    writeFileSync(fil, JSON.stringify({ typ: t.event, datum: new Date().toISOString(), antal: rader.length, rader }, null, 2));
    resultat.push(t.fil + ": " + rader.length + " rader → " + fil);
  } catch (e) {
    resultat.push(t.fil + ": FEL " + (e?.message ?? String(e)).slice(0, 60));
  }
}
console.log("backup-fran-molnet " + STJARN_DATUM + ":\n  " + resultat.join("\n  "));
