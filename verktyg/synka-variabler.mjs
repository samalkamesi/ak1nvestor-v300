#!/usr/bin/env node
/**
 * AK1A — SYNKA VARIABLER: Supabase → data/portfolj-system/priser.json (våg 84,
 * STYRELSE-VAG84-PLAN sektion b ALT 1 "COMMIT-BACK-SPEGLING" + ALT 3-kontraktet).
 *
 * PROBLEMET: pris-variabler skrivs (sedan våg 79) som system_events-rader med
 * type="variabel" i Supabase — SANNINGEN LIVE som panelen ändrar — medan
 * data/portfolj-system/priser.json är SEED + dev-fallback som src/lib/
 * variabler.ts interpolerar PRISER ur vid build. Vercel-fs är read-only och
 * GitHub-token i Vercel-env är avvisat (ADMIN-MEGA §4.1) ⇒ speglingen går den
 * omvägen här: agenten (sedermera Hetzner-cron) drar Supabase-sanningen och
 * committar filen ENDAST vid diff — repo och panel hålls jämna, ingen token
 * någonsin. ALT 3 (KONTRAKTET, dokumenterat här eftersom verktyg/synka-
 * variabler.mjs är speglingens enda köpare): Supabase = sanning live, filen =
 * seed; agenter MÅSTE lasGallande() (src/lib/variabler-lagring.ts) FÖRE
 * pris-copy-skrivningar; git anses ALDRIG sanning.
 *
 * LÄSNINGEN = EXAKT REPLIK av variabler-lagring.ts lasRader + senasteVinner
 * (importbro förkastad: modulen drar in @/-alias + priser.json-import som ej
 * löses utanför Next): alla värde-rader nyast-först (order=created_at.desc,
 * id.desc — id.desc ger total ordning bland ties), RÅA %-kodade filtervärden,
 * Range-paginering 1 000 rader/sida, tak 10 sidor, varde-tolkning heltal ≥ 0
 * (ogiltig rad KAN INTE VINNA — äldre giltig rad för samma nyckel vinner då,
 * exakt som senasteVinner).
 *
 * ÄRLIG TOMBSTONE-HANTERING: detta systems rollback = kundens radering av
 * nyckelns värde-rader i Supabase ⇒ nyckeln saknar vinnare ⇒ FILVÄRDET
 * BESTÅR (fil-defaults gäller igen — kontraktet). Verktyget raderar ALDRIG
 * nycklar ur filen och skapar ALDRIG nya — ENDAST värden på kontraktets 13
 * vitlistade nycklar uppdateras (samma mappning som NYCKEL_TILL_PRIS_FALT).
 *
 * IDEMPOTENT: körningen skriver filen OM och ENDAST OM stringify-resultatet
 * skiljer sig från dagens innehåll (identisk ⇒ "aktuell, ingen ändring",
 * noll Write). "uppdaterad" flyttas ENDAST vid verklig värde-diff — till den
 * ändrade vinnarradens created_at-datum (deterministiskt ⇒ omkörning efter
 * synk är stabil). Siffror skrivs som TAL, aldrig strängar.
 *
 * ARGUMENT:
 *   --torr   torr körning: visa diffen, skriv INGET
 *   --kalla  läsning: råa Supabase-rader + vinnare redovisas per rad
 *
 * ENV: process.loadEnvFile('.env') först (uppdragets kontrakt), därefter
 * best-effort .env.local (synka-termbank-precedens; loadEnvFile överskrider
 * ALDRIG redan satta processenv-värden). Nycklar: NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY (eller NEXT_PUBLIC_SUPABASE_ANON_KEY). Värden
 * loggas ALDRIG — endast namn + satt/ej satt.
 *
 * Avslutskod: 0 = ok (även "inga overrides i Supabase" — filen lämnas orörd),
 *             1 = fel (env saknas, Supabase svarar ej — ÄRLIGT, tystas aldrig
 *             till "saknar overrides", filen oläslig, skrivfel).
 *
 * Användning:
 *   node verktyg/synka-variabler.mjs          # synka → data/portfolj-system/priser.json
 *   node verktyg/synka-variabler.mjs --torr   # se vad som skulle hända
 *   node verktyg/synka-variabler.mjs --kalla  # rådata-redovisning
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EVENT_TYP = "variabel";
const DEFAULT_SOKVAG = path.join(REPO, "data", "portfolj-system", "priser.json");

// Läskontraktet (variabler-lagring.ts): senaste-vinner-ordning, sida, tak.
const SENASTE = "order=created_at.desc,id.desc";
const SIDSTORLEK = 1000;
const MAX_Sidor = 10;

// ── Kontraktets 13 nycklar → plats i priser.json (samma mappning som
//    NYCKEL_TILL_PRIS_FALT i variabler-lagring.ts, i samma ordning) ──────────
//    sektion: "privat" = nivaer[id], "b2b" = b2b.nivaer[id],
//             "b2bRot" = b2b, "fas" = fas
const NYCKELKARTA = [
  { nyckel: "pris.forskning.manad",       sektion: "privat", id: "forskning",     falt: "prisManad", plats: "nivaer[forskning].prisManad" },
  { nyckel: "pris.forskning.ar",          sektion: "privat", id: "forskning",     falt: "prisAr",    plats: "nivaer[forskning].prisAr" },
  { nyckel: "pris.forskning-plus.manad",  sektion: "privat", id: "forskning-plus", falt: "prisManad", plats: "nivaer[forskning-plus].prisManad" },
  { nyckel: "pris.forskning-plus.ar",     sektion: "privat", id: "forskning-plus", falt: "prisAr",    plats: "nivaer[forskning-plus].prisAr" },
  { nyckel: "pris.portfolj-hyra.manad",   sektion: "privat", id: "portfolj-hyra",  falt: "prisManad", plats: "nivaer[portfolj-hyra].prisManad" },
  { nyckel: "pris.portfolj-hyra.ar",      sektion: "privat", id: "portfolj-hyra",  falt: "prisAr",    plats: "nivaer[portfolj-hyra].prisAr" },
  { nyckel: "pris.pro-analytiker.manad",  sektion: "b2b",    id: "pro-analytiker",  falt: "prisManad", plats: "b2b.nivaer[pro-analytiker].prisManad" },
  { nyckel: "pris.pro-studio.manad",      sektion: "b2b",    id: "pro-studio",      falt: "prisManad", plats: "b2b.nivaer[pro-studio].prisManad" },
  { nyckel: "pris.pro-institution.manad", sektion: "b2b",    id: "pro-institution", falt: "prisManad", plats: "b2b.nivaer[pro-institution].prisManad" },
  { nyckel: "pris.b2b-onboarding.engang", sektion: "b2bRot", falt: "onboardingEnGang", plats: "b2b.onboardingEnGang" },
  { nyckel: "pris.fas2.engang",           sektion: "fas",    falt: "fas2EnGang",     plats: "fas.fas2EnGang" },
  { nyckel: "pris.fas3.engang",           sektion: "fas",    falt: "fas3EnGang",     plats: "fas.fas3EnGang" },
  { nyckel: "pris.fas3-intro.manad",      sektion: "fas",    falt: "fas3IntroManad", plats: "fas.fas3IntroManad" },
];

// ── 1) Argument ──────────────────────────────────────────────────────────────
function lasFlaggor(args) {
  const f = { torr: false, kalla: false, fel: [] };
  for (const a of args) {
    if (a === "--torr") f.torr = true;
    else if (a === "--kalla") f.kalla = true;
    else f.fel.push("okänt argument: " + a);
  }
  return f;
}

// ── 2) Env: loadEnvFile('.env') först — värden loggas ALDRIG ─────────────────
function laddaEnv() {
  try {
    process.loadEnvFile(path.join(REPO, ".env"));
  } catch {
    /* saknas .env → fortsätt med processenv/.env.local */
  }
  try {
    process.loadEnvFile(path.join(REPO, ".env.local"));
  } catch {
    /* saknas .env.local → endast .env/processenv gäller */
  }
  return {
    supabaseUrlSatt: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceNyckelSatt: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    anonNyckelSatt: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

// ── 3) Supabase-validering (getSupabaseRest-mönstret: https *.supabase.co) ──
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

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v) {
  return encodeURIComponent(v);
}

/** Dra HELA typen nyest-först — exakt lasRader-frågan (variabler-lagring.ts),
 *  men ÄRLIGT fel (synkverktyget får inte tystas till "saknar overrides"). */
async function draVariabelRader(rest) {
  const rader = [];
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    const res = await fetch(
      rest.origin + "/rest/v1/system_events?type=eq." + fv(EVENT_TYP) +
        "&select=created_at,details->>nyckel,details->>varde,details->>kalla&" + SENASTE,
      {
        headers: { ...rest.headers, Range: fran + "-" + String(fran + SIDSTORLEK - 1) },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) throw new Error("Supabase svarade HTTP " + String(res.status));
    const batch = await res.json();
    if (!Array.isArray(batch)) break;
    rader.push(...batch);
    if (batch.length < SIDSTORLEK) break; // sista sidan
  }
  return rader;
}

// ── 4) Senaste-vinner (exakt port av variabler-lagring.ts senasteVinner) ────

/** Tolka varde-fältet: heltal ≥ 0 accepteras, annat ⇒ null (ogiltig rad kan
 *  inte vinna — äldre giltig rad för samma nyckel vinner då). */
function tolkaVarde(v) {
  if (typeof v === "number") return Number.isInteger(v) && v >= 0 ? v : null;
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v.trim());
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/** Rader (nyast först) → karta nyckel → {varde, andrad, kalla}. FÖREKOMST först
 *  vinner eftersom indata är sorterad nyast-först. */
function senasteVinner(rader) {
  const karta = new Map();
  const ogyldiga = [];
  for (const r of rader) {
    if (typeof r.nyckel !== "string" || !r.nyckel) continue;
    if (karta.has(r.nyckel)) continue; // senaste raden har redan vunnit
    const varde = tolkaVarde(r.varde);
    if (varde === null) {
      ogyldiga.push({ nyckel: r.nyckel, varde: r.varde, andrad: typeof r.created_at === "string" ? r.created_at : "?" });
      continue; // ogiltig rad kan inte vinna — nästa (äldre) rad för nyckeln får chansen
    }
    karta.set(r.nyckel, {
      varde,
      andrad: typeof r.created_at === "string" ? r.created_at : "",
      kalla: typeof r.kalla === "string" && r.kalla ? r.kalla : "okand",
    });
  }
  return { karta, ogyldiga };
}

// ── 5) Filstruktur: hitta målobjektet för en kartpost (ändra ALDRIG strukturen) ──
function hittaMal(rot, post) {
  if (post.sektion === "privat") {
    return Array.isArray(rot?.nivaer) ? (rot.nivaer.find((n) => n && typeof n === "object" && n.id === post.id) ?? null) : null;
  }
  if (post.sektion === "b2b") {
    const b = rot?.b2b;
    return Array.isArray(b?.nivaer) ? (b.nivaer.find((n) => n && typeof n === "object" && n.id === post.id) ?? null) : null;
  }
  if (post.sektion === "b2bRot") return rot?.b2b ?? null;
  if (post.sektion === "fas") return rot?.fas ?? null;
  return null;
}

// ── 6) Huvud ─────────────────────────────────────────────────────────────────
async function main() {
  const f = lasFlaggor(process.argv.slice(2));
  if (f.fel.length > 0) {
    for (const fel of f.fel) console.log("[FEL] " + fel);
    console.log("Användning: node verktyg/synka-variabler.mjs [--torr] [--kalla]");
    return 1;
  }

  console.log("═══ SYNKA VARIABLER — Supabase → data/portfolj-system/priser.json (våg 84) ═══");
  const env = laddaEnv();
  console.log(
    "Env: NEXT_PUBLIC_SUPABASE_URL " + (env.supabaseUrlSatt ? "satt" : "EJ SATT") +
    ", SUPABASE_SERVICE_ROLE_KEY " + (env.serviceNyckelSatt ? "satt" : "ej satt") +
    ", NEXT_PUBLIC_SUPABASE_ANON_KEY " + (env.anonNyckelSatt ? "satt" : "ej satt") +
    " (loadEnvFile .env + .env.local — värden loggas aldrig)",
  );
  const rest = supabaseRest();
  if (!rest) {
    console.log("[FEL] Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas) — synka avbryts, filen lämnas orörd.");
    return 1;
  }

  // Läs Supabase (ärligt fel — aldrig tyst "saknar overrides")
  let rader;
  try {
    rader = await draVariabelRader(rest);
  } catch (e) {
    console.log("[FEL] " + (e instanceof Error ? e.message : String(e)) + " — filen lämnas orörd.");
    return 1;
  }

  // Senaste-vinner
  const { karta: vinnare, ogyldiga } = senasteVinner(rader);
  const okandaNycklar = [...vinnare.keys()].filter((n) => !NYCKELKARTA.some((p) => p.nyckel === n));

  if (f.kalla) {
    console.log("");
    console.log("── Råa Supabase-rader (type=" + EVENT_TYP + ", " + rader.length + " st) ──");
    for (const r of rader) {
      const v = tolkaVarde(r.varde);
      console.log(
        "  " + String(r?.created_at ?? "?") + " · nyckel=" + JSON.stringify(r?.nyckel) +
        " · varde=" + JSON.stringify(r?.varde) + " · " + (v === null ? "OGILTIGT" : "giltigt") +
        " · kalla=" + JSON.stringify(r?.kalla ?? null),
      );
    }
  }

  // Läs filen (ENDAST läsning felar här — ingen skrivning skett)
  let filInnehall;
  let rot;
  try {
    filInnehall = readFileSync(DEFAULT_SOKVAG, "utf8");
    rot = JSON.parse(filInnehall);
  } catch (e) {
    console.log("[FEL] Filen " + DEFAULT_SOKVAG + " är oläslig (" + (e instanceof Error ? e.name : String(e)) + ") — synka avbryts INNAN någon skrivning.");
    return 1;
  }

  // Diff per kontraktsnyckel: filvärde vs Supabase-vinnare
  const diffar = [];
  const strukturellaFel = [];
  for (const post of NYCKELKARTA) {
    const v = vinnare.get(post.nyckel);
    if (v === undefined) continue; // ingen override — filvärdet består (rollback-kontraktet)
    const mal = hittaMal(rot, post);
    if (mal === null || typeof mal !== "object") {
      strukturellaFel.push(post.nyckel + " → " + post.plats + " (platsen saknas i filen — ALDRIG nyckelskapande)");
      continue;
    }
    const före = mal[post.falt];
    if (typeof före !== "number" || !Number.isFinite(före) || före !== v.varde) {
      diffar.push({ post, före, efter: v.varde, andrad: v.andrad, kalla: v.kalla });
    }
  }

  console.log("");
  console.log("── Läge ──");
  console.log("  Supabase: " + rader.length + " råa värde-rader → " + vinnare.size + " giltiga vinnare (" + NYCKELKARTA.length + " kontraktsnycklar)");
  if (ogyldiga.length > 0) {
    console.log("  Ogiltiga värde-rader (kan inte vinna — äldre giltig rad eller fil-default gäller):");
    for (const o of ogyldiga) console.log("    " + o.nyckel + " · varde=" + JSON.stringify(o.varde) + " · " + o.andrad);
  }
  if (okandaNycklar.length > 0) {
    console.log("  Override-nycklar utanför vitlistan (ignorerade — panelen kan endast ändra kontraktets nycklar): " + okandaNycklar.join(", "));
  }
  if (strukturellaFel.length > 0) {
    console.log("  [VARNING] Nycklar utan plats i filstrukturen lämnas orörda:");
    for (const s of strukturellaFel) console.log("    " + s);
  }

  if (diffar.length === 0) {
    console.log("");
    console.log("aktuell, ingen ändring — filen överensstämmer med Supabase (" + DEFAULT_SOKVAG + " orörd).");
    return 0;
  }

  // Applicera på DJUP KOPIA — idempotens via stringify-jämförelse
  const nyRot = JSON.parse(filInnehall);
  for (const d of diffar) {
    const mal = hittaMal(nyRot, d.post);
    if (mal !== null) mal[d.post.falt] = d.efter; // TAL, aldrig sträng
  }
  // "uppdaterad" flyttas ENDAST vid värde-diff — till senaste ändrade vinnarradens
  // datum (deterministiskt: omkörning ger samma värde ⇒ fortfarande idempotent).
  const nyasteAndrad = diffar.map((d) => d.andrad).filter((s) => typeof s === "string" && s.length >= 10).sort().pop();
  if (nyasteAndrad !== undefined && typeof nyRot.uppdaterad === "string") nyRot.uppdaterad = nyasteAndrad.slice(0, 10);

  console.log("");
  console.log("── Diff (före → efter per nyckel) ──");
  for (const d of diffar) {
    console.log("  " + d.post.nyckel + " (" + d.post.plats + "): " + String(d.före) + " → " + String(d.efter) + " · Supabase-rad " + (d.andrad || "?") + " · kalla=" + JSON.stringify(d.kalla));
  }

  if (f.torr) {
    console.log("");
    console.log("--torr: INGET skrevs (" + diffar.length + " diff(er) funna).");
    return 0;
  }

  const nyttInnehall = JSON.stringify(nyRot, null, 2) + "\n";
  if (nyttInnehall === filInnehall) {
    // Teoretiskt oåtkomligt (diffar ≠ 0 ⇒ skilt innehåll) — säkerhetsgolv.
    console.log("");
    console.log("aktuell, ingen ändring — stringify-identisk med befintlig fil.");
    return 0;
  }
  try {
    writeFileSync(DEFAULT_SOKVAG, nyttInnehall, "utf8");
  } catch (e) {
    console.log("[FEL] Kunde inte skriva " + DEFAULT_SOKVAG + " (" + (e instanceof Error ? e.name : String(e)) + ").");
    return 1;
  }
  console.log("");
  console.log("Skrev " + diffar.length + " värde(n) → " + DEFAULT_SOKVAG + " (struktur, nycklar och noteringar orörda — ENDAST värden).");
  console.log("Klart. Committa filen (git-spegling: Supabase-sanning → seed).");
  return 0;
}

main().then((kod) => process.exit(kod)).catch((e) => {
  console.error("[synka-variabler] FEL: " + (e instanceof Error ? e.stack : String(e)));
  process.exit(1);
});
