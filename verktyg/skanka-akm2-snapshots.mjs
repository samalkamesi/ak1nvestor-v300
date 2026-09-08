#!/usr/bin/env node
/**
 * AK1A — SKÄNKA AKM2-SNAPSHOTS: data/cache/akm2-*.json → system_events (våg 86,
 * kö-artikeln från våg 57: berikningscacherna är LOKALA filer — på servern är
 * fs read-only utöver git och filerna delas inte mellan enheter).
 *
 * KONTRAKTET (src/lib/akm2-snapshot-lagring.ts — läsvägen dit är källan):
 *   type="akm2_snapshot" severity="info" source="akm2"
 *   message="[akm2-snapshot] <ticker> komposit <N> (<datum>, berikat)"
 *   details={ticker, resultat, schema, berikat, datum}
 *     ticker   = ÄKTA ticker ur resultat.ticker ("ABB.ST" — aldrig filnamnet)
 *     resultat = HELA AKM2Resultat (formguardat — verktyget hittar aldrig på)
 *     schema   = "akm2-resultat-v1" (filens schema-kontrakt, krävs)
 *     berikat  = true (alla dagens filer speglar kor-akm2-berika våg 57 D2)
 *     datum    = resultat.datum (kärnans deterministiska k.hamtat — aldrig klocka)
 * Senaste-vinner per ticker (order=created_at.desc,id.desc), inget ålderstak —
 * organ.ts håller typen vid eget tak 2 000 rader (100 × 20 generationer).
 *
 * IDEMPOTENT: gällande rad jämförs med KANONISK JSON (jsonb bevarar inte
 * nyckelordning — rå stringify ljuger) — oförändrad resultat ⇒ hoppas över,
 * NOLL ny rad. Omkörning utan nya berika-generationer skriver alltså inget.
 *
 * ÅTERLÄSNING: efter skrivningarna läses HELA typen om (samma senaste-vinner-
 * fråga) och VARJE fil verifieras kanoniskt mot sin vinnare — verktyget
 * rapporterar skrivna/hoppade/verifierade och slutar med kod 1 vid minsta
 * avvikelse. STÄDA INGET: detta är äkta data som SKA finnas (inga DELETE).
 *
 * ENV: process.loadEnvFile('.env') först, därefter best-effort .env.local
 * (synka-variabler-precedensen; loadEnvFile överskriver aldrig redan satta
 * värden). Nycklar: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (eller
 * NEXT_PUBLIC_SUPABASE_ANON_KEY). Värden loggas ALDRIG — endast namn + satt/ej
 * satt. Host-vakt: https + *.supabase.co (getSupabaseRest-mönstret).
 *
 * ARGUMENT:  --torr   torr körning: visa planen, skriv INGET
 *            --kalla  verbose: per-ticker-rad i återläsningen
 *
 * Avslutskod: 0 = alla filer skrivna/hoppade + återlästa utan avvikelse,
 *             1 = fel (env saknas, Supabase svarar ej, ogiltig fil, verifierings-
 *                 fel — ÄRLIGT, tystas aldrig).
 *
 * Användning:  node verktyg/skanka-akm2-snapshots.mjs [--torr] [--kalla]
 *
 * Pedagogisk forskning — ALDRIG investeringsråd.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(REPO, "data", "cache");
const EVENT_TYP = "akm2_snapshot";
const SCHEMA = "akm2-resultat-v1";
const SENASTE = "order=created_at.desc,id.desc";
const SIDSTORLEK = 250; // ~10–15 kB per rad (hela resultatet i details)
const MAX_Sidor = 8; // 2 000 rader = organ.ts:s tak för typen ⇒ alltid komplett

// ── Argument ─────────────────────────────────────────────────────────────────

function lasFlaggor(args) {
  const f = { torr: false, kalla: false, fel: [] };
  for (const a of args) {
    if (a === "--torr") f.torr = true;
    else if (a === "--kalla") f.kalla = true;
    else f.fel.push("okänt argument: " + a);
  }
  return f;
}

// ── Env: värden loggas ALDRIG ────────────────────────────────────────────────

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

// ── Supabase-validering (getSupabaseRest-mönstret: https *.supabase.co) ─────

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
  if (/^(localhost|.*\.localhost|.*\.local|.*\.internal|0\.0\.0\.0|\[::1\]|127\..*|10\..*|192\.168\..*|169\.254\..*|172\.(1[6-9]|2\d|3[01])\.)/i.test(u.hostname)) return null;
  if (!/^([a-z0-9-]+)\.supabase\.co$/i.test(u.hostname)) return null;
  return { origin: u.origin, headers: { apikey: key, Authorization: "Bearer " + key } };
}

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v) {
  return encodeURIComponent(v);
}

// ── Formguards (JS-port av akm2-snapshot-lagring.ts — verktyget är fristående) ─

const TICKER_INTYG_RE = /^[A-Za-z0-9._-]{1,16}$/;

/** Formguard: ser ut som ett AKM2Resultat (lager 1/2/4 + komposit)? */
function arAkm2Resultat(x) {
  if (!x || typeof x !== "object") return false;
  return (
    typeof x.ticker === "string" &&
    typeof x.komposit === "number" &&
    Number.isFinite(x.komposit) &&
    !!x.lager1 &&
    typeof x.lager1 === "object" &&
    !!x.lager1.poang &&
    !!x.lager2 &&
    typeof x.lager2 === "object" &&
    !!x.lager4 &&
    typeof x.lager4 === "object" &&
    !!x.lager4.viktPerVariabel
  );
}

/** Kanonisk JSON (rekursivt sorterade nycklar) — idempotensens likhet: jsonb
 *  bevarar inte nyckelordning, så fil-objekt och återläst rad kan ALDRIG
 *  jämföras med rå stringify. */
function kanoniskJson(x) {
  if (x === null || typeof x !== "object") return JSON.stringify(x) ?? "null";
  if (Array.isArray(x)) return "[" + x.map(kanoniskJson).join(",") + "]";
  const n = Object.keys(x).sort();
  return "{" + n.map((k) => JSON.stringify(k) + ":" + kanoniskJson(x[k])).join(",") + "}";
}

// ── 1) Skanna data/cache/akm2-*.json (riktiga filer — STÄDA INGET) ───────────

function skannaCacher() {
  const filer = readdirSync(CACHE_DIR)
    .filter((f) => f.startsWith("akm2-") && f.endsWith(".json"))
    .sort();
  const cacher = [];
  const fel = [];
  for (const fil of filer) {
    const sok = path.join(CACHE_DIR, fil);
    try {
      const j = JSON.parse(readFileSync(sok, "utf8"));
      if (j.schema !== SCHEMA) {
        fel.push(fil + ": okänt schema " + JSON.stringify(j.schema));
        continue;
      }
      if (!arAkm2Resultat(j.resultat)) {
        fel.push(fil + ": resultat bär inte AKM2Resultat-formen");
        continue;
      }
      if (!TICKER_INTYG_RE.test(j.resultat.ticker)) {
        fel.push(fil + ": ticker utanför intyget (" + JSON.stringify(j.resultat.ticker) + ")");
        continue;
      }
      cacher.push({
        fil: fil,
        ticker: j.resultat.ticker,
        resultat: j.resultat,
        datum: typeof j.resultat.datum === "string" ? j.resultat.datum : "",
        kanon: kanoniskJson(j.resultat),
        bytes: statSync(sok).size,
      });
    } catch (e) {
      fel.push(fil + ": " + (e instanceof Error ? e.message : String(e)));
    }
  }
  return { cacher, fel };
}

// ── 2) Dra gällande snapshots (samma senaste-vinner-fråga som läsvägen) ─────

/** Tolka en rå läses-rad → {ticker, resultat} eller null (ogiltig kan inte vinna). */
function tolkaRad(r) {
  if (!r || typeof r.ticker !== "string" || !TICKER_INTYG_RE.test(r.ticker)) return null;
  if (typeof r.resultat !== "string" || r.resultat.trim() === "") return null;
  let res;
  try {
    res = JSON.parse(r.resultat);
  } catch {
    return null;
  }
  if (!arAkm2Resultat(res)) return null;
  return { ticker: r.ticker, resultat: res, sparad: typeof r.created_at === "string" ? r.created_at : "" };
}

async function draGallande(rest) {
  const vinnare = new Map();
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    const res = await fetch(
      rest.origin + "/rest/v1/system_events?type=eq." + fv(EVENT_TYP) +
        "&select=created_at,details->>ticker,details->>resultat&" + SENASTE,
      {
        headers: { ...rest.headers, Range: fran + "-" + String(fran + SIDSTORLEK - 1) },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) throw new Error("Supabase svarade HTTP " + String(res.status) + " (gällande-läsning, sida " + String(sida) + ")");
    const batch = await res.json();
    if (!Array.isArray(batch)) break;
    for (const r of batch) {
      const t = tolkaRad(r);
      if (t && !vinnare.has(t.ticker)) vinnare.set(t.ticker, t);
    }
    if (batch.length < SIDSTORLEK) break; // sista sidan
  }
  return vinnare;
}

// ── Huvudflöde ───────────────────────────────────────────────────────────────

const flaggor = lasFlaggor(process.argv.slice(2));
if (flaggor.fel.length > 0) {
  console.error("[skanka-akm2] " + flaggor.fel.join("; "));
  process.exit(1);
}

const env = laddaEnv();
console.log(
  "[skanka-akm2] env: url=" + (env.supabaseUrlSatt ? "satt" : "SAKNAS") +
  " service-role=" + (env.serviceNyckelSatt ? "satt" : "ej") +
  " anon=" + (env.anonNyckelSatt ? "satt" : "ej") +
  (flaggor.torr ? " | TORR KÖRNING" : ""),
);

const rest = supabaseRest();
if (!rest) {
  console.error("[skanka-akm2] Supabase ej konfigurerat/validerat (https *.supabase.co krävs) — avbryter.");
  process.exit(1);
}

const { cacher, fel: skanFel } = skannaCacher();
if (skanFel.length > 0) {
  for (const f of skanFel) console.error("[skanka-akm2] ogiltig cache: " + f);
}
if (cacher.length === 0) {
  console.error("[skanka-akm2] inga giltiga akm2-cacher i data/cache — avbryter.");
  process.exit(1);
}
const totKB = Math.round(cacher.reduce((s, c) => s + c.bytes, 0) / 1024);
console.log("[skanka-akm2] " + String(cacher.length) + " giltiga cacher (" + String(totKB) + " kB)" + (skanFel.length > 0 ? ", " + String(skanFel.length) + " ogiltiga" : "") + ".");

// Gällande före — idempotensens jämförelsebas.
let forr = new Map();
try {
  forr = await draGallande(rest);
  console.log("[skanka-akm2] gällande i lagret: " + String(forr.size) + " tickers.");
} catch (e) {
  console.error("[skanka-akm2] " + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
}

// Skriv (eller hoppa över) — sekventiellt, ett ärligt svar per ticker.
let skrivna = 0;
let hoppade = 0;
let skrivFel = 0;
if (flaggor.torr) {
  const attSkriva = cacher.filter((c) => !(forr.has(c.ticker) && kanoniskJson(forr.get(c.ticker).resultat) === c.kanon));
  hoppade = cacher.length - attSkriva.length;
  console.log("[skanka-akm2] TORR: skulle skriva " + String(attSkriva.length) + " och hoppa över " + String(hoppade) + " (oförändrade).");
  for (const c of attSkriva.slice(0, 10)) console.log("  torr: " + c.ticker + " komposit " + String(c.resultat.komposit));
  if (attSkriva.length > 10) console.log("  … samt " + String(attSkriva.length - 10) + " till");
} else {
  for (const c of cacher) {
    const g = forr.get(c.ticker);
    if (g && kanoniskJson(g.resultat) === c.kanon) {
      hoppade += 1;
      continue; // idempotent — gällande rad är kanoniskt identisk
    }
    try {
      const res = await fetch(rest.origin + "/rest/v1/system_events", {
        method: "POST",
        headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          type: EVENT_TYP,
          severity: "info",
          message:
            "[akm2-snapshot] " + c.ticker + " komposit " +
            String(Math.round(c.resultat.komposit * 10) / 10) + " (" +
            (c.datum || "datum saknas") + ", berikat)",
          details: { ticker: c.ticker, resultat: c.resultat, schema: SCHEMA, berikat: true, datum: c.datum },
          source: "akm2",
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        skrivFel += 1;
        console.error("[skanka-akm2] " + c.ticker + ": lagret svarade HTTP " + String(res.status));
      } else {
        skrivna += 1;
      }
    } catch (e) {
      skrivFel += 1;
      console.error("[skanka-akm2] " + c.ticker + ": " + (e instanceof Error ? e.name : "nätverksfel"));
    }
  }
  console.log("[skanka-akm2] skrev " + String(skrivna) + " | hoppade över " + String(hoppade) + " (idempotenta) | fel " + String(skrivFel) + ".");
}

if (flaggor.torr) {
  console.log("[skanka-akm2] torr körning klar — inget skrivet, ingen återläsning.");
  process.exit(skanFel.length > 0 ? 1 : 0);
}
if (skrivFel > 0) {
  console.error("[skanka-akm2] " + String(skrivFel) + " skrivfel — återläsning sker ändå (ärlig redovisning).");
}

// ── Återläsning: HELA typen om + kanonisk verifiering per fil ────────────────

let efter = new Map();
try {
  efter = await draGallande(rest);
} catch (e) {
  console.error("[skanka-akm2] återläsning misslyckades: " + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
}

let verifierade = 0;
const avvikelser = [];
for (const c of cacher) {
  const v = efter.get(c.ticker);
  if (!v) {
    avvikelser.push(c.ticker + ": ingen vinnare i återläsningen");
    continue;
  }
  if (kanoniskJson(v.resultat) !== c.kanon) {
    avvikelser.push(c.ticker + ": återläst resultat skiljer från cachefilen");
    continue;
  }
  verifierade += 1;
  if (flaggor.kalla) {
    console.log("  OK " + c.ticker + " komposit " + String(v.resultat.komposit) + " sparad " + v.sparad);
  }
}

console.log(
  "[skanka-akm2] återläsning: " + String(verifierade) + "/" + String(cacher.length) +
  " kanoniskt verifierade | gällande tickers i lagret: " + String(efter.size) +
  " | avvikelser: " + String(avvikelser.length) + ".",
);
if (avvikelser.length > 0) {
  for (const a of avvikelser.slice(0, 20)) console.error("  avvikelse: " + a);
  if (avvikelser.length > 20) console.error("  … samt " + String(avvikelser.length - 20) + " till");
}

const ok = skrivFel === 0 && avvikelser.length === 0 && verifierade === cacher.length && skanFel.length === 0;
console.log("[skanka-akm2] " + (ok ? "KLART" : "FEL — se ovan") + ". Pedagogisk forskning — ALDRIG investeringsråd.");
process.exit(ok ? 0 : 1);
