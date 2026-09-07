#!/usr/bin/env node
/**
 * AK1A — SYNKA TERMBANK: Supabase → data/termbank-tillagg.json (våg 79,
 * STYRELSE-ADMIN-MEGA steg 1 "TERMBANK-PROD-FIX").
 *
 * PROBLEMET: admin-tillägg till MÖS-termbanken skrivs (sedan våg 79) som
 * system_events-rader med type="termbank_tillagg" i Supabase — SANNINGEN som
 * fungerar på Vercel — medan den LOKALA pipelinen (tsx-verktygen + termbank.ts:
 * tilläggs-overlay) läser filen data/termbank-tillagg.json. Detta skript är
 * bron: det drar Supabase-raderna och merge:ar dem in i filen, IDEMPOTENT,
 * med BEFINTLIGA FILRADER BEVARADE, och är avsett att köras FÖRE LOKALA
 * PIPELINE-RUNS (kor-oversatt-batch, importör, cron-rond i dev).
 *
 * SENASTE-VINNER (samma kontrakt som lager.ts:s MÖS-event): alla rader av
 * typen läses nyast-först (order=created_at.desc,id.desc — id.desc ger total
 * ordning bland ties eftersom created_at är transaktionstid) och FÖRSTA raden
 * per details.sv vinner. En vinnarrad med raderad=true är en taBort-tombstone
 * → termen BORTTAGEN ur filen. Supabase vinner alltså över filen per sv-nyckel
 * (filen är dev-spegling; skiljer de sig är Supabase sanningen).
 *
 * FILFORMAT (identiskt med src/lib/oversattning-admin.ts sparaTermbankTillagg):
 *   { uppdaterad: ISO, notering: sträng, poster: [{sv,en,ar,kat,notering?,
 *     uppdaterad: ISO}] } — uppdaterad för Supabase-rader = eventets created_at.
 *
 * ARGUMENT:
 *   --torr              torr körning: visa merge-resultatet, skriv INGET
 *   --skriv-till <sökväg>  skriv till alternativ fil (test-läge) i stället för
 *                      data/termbank-tillagg.json — verkliga filen rörs ej
 *   --kalla            läsning: råa Supabase-rader + vinnare redovisas per rad
 *
 * ENV (kor-oversatt-batch.mjs-mönstret — värden loggas ALDRIG, endast namn +
 * satt/ej satt): .env.local vinner över .env, redan satta processenv-värden
 * vinner över båda. Nycklar: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * (eller NEXT_PUBLIC_SUPABASE_ANON_KEY).
 *
 * Avslutskod: 0 = ok (även "inga rader i Supabase" — då bevaras/skrivs filen
 *             oförändrad i innehåll), 1 = fel (env saknas, Supabase svarar
 *             ej, filen oläslig). Skrivfel efter lyckad läsning = 1 (ärligt).
 *
 * Användning:
 *   node verktyg/synka-termbank.mjs            # synka → data/termbank-tillagg.json
 *   node verktyg/synka-termbank.mjs --torr     # se vad som skulle hända
 *   node verktyg/synka-termbank.mjs --skriv-till tool-results/termbank-test.json
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVENT_TYP = "termbank_tillagg";
const DEFAULT_SOKVAG = path.join(REPO, "data", "termbank-tillagg.json");
const MAX_Sidor = 20; // 20 × 1 000 rader — typen är liten (organet deduplicerar dagligen)

// ── 1) Argument ──────────────────────────────────────────────────────────────
function lasFlaggor(args) {
  const f = { torr: false, skrivTill: null, kalla: false, fel: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--torr") f.torr = true;
    else if (a === "--kalla") f.kalla = true;
    else if (a === "--skriv-till") {
      const v = args[i + 1];
      if (!v || v.startsWith("--")) f.fel.push("--skriv-till kräver en sökväg");
      else { f.skrivTill = v; i += 1; }
    } else {
      f.fel.push("okänt argument: " + a);
    }
  }
  return f;
}

// ── 2) Env: enkel KEY=VALUE-parse av .env.local + .env — värden loggas ALDRIG ─
function lasEnvFil(sokvag) {
  const karta = new Map();
  if (!existsSync(sokvag)) return karta;
  for (const rad of readFileSync(sokvag, "utf8").split(/\r?\n/)) {
    if (rad.trim().startsWith("#")) continue;
    const m = rad.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"') && v.length >= 2) || (v.startsWith("'") && v.endsWith("'") && v.length >= 2)) {
      v = v.slice(1, -1);
    }
    if (v.length > 0) karta.set(m[1], v);
  }
  return karta;
}

function laddaEnv() {
  const bas = lasEnvFil(path.join(REPO, ".env"));
  const lokal = lasEnvFil(path.join(REPO, ".env.local"));
  for (const [k, v] of [...bas, ...lokal]) {
    if (process.env[k] === undefined) process.env[k] = v; // redan satt processenv vinner
  }
  return {
    supabaseUrlSatt: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceNyckelSatt: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    anonNyckelSatt: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

// ── 3) Supabase-läsning (getSupabaseRest-mönstret: endast https *.supabase.co) ─
function supabaseRest() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!raw || !key) return null;
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  if (!/^([a-z0-9-]+)\.supabase\.co$/i.test(u.hostname)) return null;
  return { origin: u.origin, headers: { apikey: key, Authorization: "Bearer " + key } };
}

/** Dra HELA typen nyast-först → SENASTE-VINNER per details.sv. */
async function draTermbankEventer(rest) {
  const rader = [];
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * 1000;
    const res = await fetch(
      rest.origin + "/rest/v1/system_events?type=eq." + EVENT_TYP +
        "&select=created_at,id,details&order=created_at.desc,id.desc",
      {
        headers: { ...rest.headers, Range: fran + "-" + String(fran + 999) },
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!res.ok) throw new Error("Supabase svarade HTTP " + String(res.status));
    const batch = await res.json();
    if (!Array.isArray(batch)) break;
    rader.push(...batch);
    if (batch.length < 1000) break; // sista sidan
  }
  return rader;
}

// ── 4) Merge: befintliga filrader BEVARAS, Supabase-vinnare appliceras ───────
function lasFil(sokvag) {
  if (!existsSync(sokvag)) return { uppdaterad: null, poster: [] };
  const parsad = JSON.parse(readFileSync(sokvag, "utf8"));
  const poster = Array.isArray(parsad?.poster) ? parsad.poster : [];
  return { uppdaterad: typeof parsad?.uppdaterad === "string" ? parsad.uppdaterad : null, poster };
}

function arGiltigPost(p) {
  return (
    p && typeof p === "object" &&
    typeof p.sv === "string" && p.sv.trim() &&
    typeof p.en === "string" && typeof p.ar === "string" && typeof p.kat === "string"
  );
}

/**
 * Merge-kärnan (ren funktion, lätt att läsa i tool-results):
 *   starts från filens poster (ordning bevaras) → Supabase-vinnare per sv
 *   UPCERTAR (ersätter/uppdaterad=created_at) → tombstones (raderadeSv)
 *   RADERAR → nya Supabase-termer APPENDAS. Förlustfri för filrader som
 *   Supabase inte har en åsikt om.
 */
function mergeTillFil(filPoster, vinnare, raderadeSv) {
  const perSv = new Map();
  for (const p of filPoster) {
    if (!arGiltigPost(p)) continue; // korrupta filrader hoppas — ärligt redovisat
    perSv.set(p.sv, { sv: p.sv, en: p.en, ar: p.ar, kat: p.kat, notering: p.notering, uppdaterad: p.uppdaterad });
  }
  for (const v of vinnare) {
    perSv.set(v.sv, { sv: v.sv, en: v.en, ar: v.ar, kat: v.kat, notering: v.notering, uppdaterad: v.uppdaterad });
  }
  for (const sv of raderadeSv) {
    perSv.delete(sv);
  }
  return [...perSv.values()];
}

// ── 5) Huvud ─────────────────────────────────────────────────────────────────
async function main() {
  const f = lasFlaggor(process.argv.slice(2));
  if (f.fel.length > 0) {
    for (const fel of f.fel) console.log("[FEL] " + fel);
    console.log("Användning: node verktyg/synka-termbank.mjs [--torr] [--skriv-till <sökväg>] [--kalla]");
    return 1;
  }

  console.log("═══ SYNKA TERMBANK — Supabase → data/termbank-tillagg.json (våg 79) ═══");
  const env = laddaEnv();
  console.log(
    "Env: NEXT_PUBLIC_SUPABASE_URL " + (env.supabaseUrlSatt ? "satt" : "EJ SATT") +
    ", SUPABASE_SERVICE_ROLE_KEY " + (env.serviceNyckelSatt ? "satt" : "ej satt") +
    ", NEXT_PUBLIC_SUPABASE_ANON_KEY " + (env.anonNyckelSatt ? "satt" : "ej satt") +
    " (läst ur .env.local/.env — värden loggas aldrig)",
  );
  const rest = supabaseRest();
  if (!rest) {
    console.log("[FEL] Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas) — synka avbryts, filen lämnas orörd.");
    return 1;
  }

  const sokvag = f.skrivTill ? path.resolve(REPO, f.skrivTill) : process.env.TERMBANK_TILLAGG_SOKVAG || DEFAULT_SOKVAG;

  // Läs Supabase
  let rader;
  try {
    rader = await draTermbankEventer(rest);
  } catch (e) {
    console.log("[FEL] " + (e instanceof Error ? e.message : String(e)) + " — filen lämnas orörd.");
    return 1;
  }

  // Senaste-vinner per sv
  const sedda = new Set();
  const vinnare = [];
  const raderadeSv = [];
  for (const r of rader) {
    const d = r?.details;
    if (!d || typeof d !== "object" || Array.isArray(d)) continue;
    if (typeof d.sv !== "string" || !d.sv.trim() || sedda.has(d.sv)) continue;
    sedda.add(d.sv);
    if (d.raderad === true) {
      raderadeSv.push(d.sv);
      continue;
    }
    if (typeof d.en !== "string" || typeof d.ar !== "string" || !d.en.trim() || !d.ar.trim()) continue;
    vinnare.push({
      sv: d.sv,
      en: d.en,
      ar: d.ar,
      kat: typeof d.kat === "string" && d.kat ? d.kat : "pedagogik",
      notering: typeof d.notering === "string" && d.notering ? d.notering : undefined,
      uppdaterad: typeof r.created_at === "string" && r.created_at ? r.created_at : new Date(0).toISOString(),
    });
  }

  // Läs + merge:a filen
  let fil;
  try {
    fil = lasFil(sokvag);
  } catch (e) {
    console.log("[FEL] Filen " + sokvag + " är oläslig (" + (e instanceof Error ? e.name : String(e)) + ") — synka avbryts INNAN någon skrivning.");
    return 1;
  }

  if (f.kalla) {
    console.log("");
    console.log("── Råa Supabase-rader (type=" + EVENT_TYP + ", " + rader.length + " st) ──");
    for (const r of rader) {
      const d = r?.details ?? {};
      console.log("  " + String(r?.created_at ?? "?") + " · sv=" + JSON.stringify(d.sv) + " · " + (d.raderad === true ? "RADERAD" : "en/ar satta") + (f.torr ? "" : ""));
    }
  }

  const nyaPoster = mergeTillFil(fil.poster, vinnare, raderadeSv);
  const bevarade = nyaPoster.filter((p) => fil.poster.some((g) => g.sv === p.sv && g.uppdaterad === p.uppdaterad)).length;

  console.log("");
  console.log("── Merge (" + (f.skrivTill ? "TEST-sökväg: " + sokvag : sokvag) + ") ──");
  console.log("  Supabase: " + rader.length + " råa rader → " + vinnare.length + " aktiva vinnare + " + raderadeSv.length + " tombstone(s)");
  console.log("  Filen före: " + fil.poster.length + " poster (befintliga rader bevaras)");
  console.log("  Filen efter: " + nyaPoster.length + " poster · " + bevarade + " oförändrade · " + vinnare.length + " från Supabase applicerade");
  if (raderadeSv.length > 0) console.log("  Tombstones (raderas ur filen): " + raderadeSv.join(", "));

  if (f.torr) {
    console.log("");
    console.log("--torr: INGET skrevs.");
    return 0;
  }

  const ut = {
    uppdaterad: new Date().toISOString(),
    notering:
      "Admin-tillägg till MÖS-termbanken (Supabase type=termbank_tillagg är sanningen; denna fil är den " +
      "lokala spegling termbank.ts:s overlay läser — synkad av verktyg/synka-termbank.mjs, idempotent). " +
      "Kontrollgarantin (termKonsistens) gäller termen via overlay och fullt när raden slagits samman in i " +
      "TERMBANK i src/lib/oversattning/termbank.ts.",
    poster: nyaPoster,
  };
  try {
    writeFileSync(sokvag, JSON.stringify(ut, null, 2) + "\n", "utf8");
  } catch (e) {
    console.log("[FEL] Kunde inte skriva " + sokvag + " (" + (e instanceof Error ? e.name : String(e)) + ").");
    return 1;
  }
  console.log("");
  console.log("Skrev " + nyaPoster.length + " poster → " + sokvag);
  console.log("Klart. Pipelinen (termbank.ts overlay) ser tilläggen vid nästa start.");
  return 0;
}

main().then((kod) => process.exit(kod)).catch((e) => {
  console.error("[synka-termbank] FEL: " + (e instanceof Error ? e.stack : String(e)));
  process.exit(1);
});
