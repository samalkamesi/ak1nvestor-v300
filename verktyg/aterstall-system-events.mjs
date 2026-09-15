#!/usr/bin/env node
/**
 * ÅTERSTÄLL system_events UR MOLN-JSON-BACKUP — DR-kedja 2 (händelseloggen)
 *
 * Bakgrund (DR-PROV 2026-09-15 + S10-U2): SQL-nattdumpen bär INTE
 * händelseloggen (tabellen tom i dumpen) — system_events enda DR-väg är
 * moln-JSON-arkivet system-events-full-<datum>.json.gz (verktyg/backup-
 * fran-molnet.mjs). Detta verktyg gör kedjan återställningsbar:
 *
 *   1. VERIFIERA arkivet: gzip-ström + header-kontrakt (typ/datum/antal/
 *      truncerad) + radantals-eftal + per-rad giltighet — strömmande med
 *      KONSTANT minne (arkivet är ~350 MB okomprimerat; full JSON.parse
 *      äger aldrig rum på en RAM-snål server).
 *   2. REPETERA återställning i lokal PG (psql COPY FROM STDIN) med mätta
 *      tider — DR-övningarnas lokala spår.
 *   3. --jsonl-ut: konvertera till JSONL med PROD-kolumnnamn (type →
 *      event_type; schemadrift 2026-09-09↔09-15 bevisad i DR-PROV-2026-09-
 *      15-JSON-KEDJAN.md) — katastroftidens Supabase-REST-inmatningsfil.
 *   4. --plan-supabase: batch-plan för REST-återinläsning. Verktyget läser
 *      ALDRIG .env/nycklar — planen redogör för vad katastrofoperatören
 *      (huvudagenten) tillför.
 *
 * Användning:
 *   node verktyg/aterstall-system-events.mjs --fil data/backups/system-events-full-DATUM.json.gz
 *   node verktyg/aterstall-system-events.mjs --fil … --db ak1a_dr_json
 *   node verktyg/aterstall-system-events.mjs --fil … --jsonl-ut /tmp/batch.jsonl --begransa 500
 *   node verktyg/aterstall-system-events.mjs --fil … --plan-supabase
 *
 * Exit: 0 = alla domar GRÖNA · 1 = RÖD dom · 2 = användningsfel.
 */
import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { StringDecoder } from "node:string_decoder";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { hrtime } from "node:process";

const args = process.argv.slice(2);
function arg(namn) {
  const i = args.indexOf("--" + namn);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}
const FIL = arg("fil");
const DB = arg("db");
const TABELL = arg("tabell") || "system_events";
const JSONL_UT = arg("jsonl-ut");
const BEGRANSA = Number(arg("begransa") || 0);
const PLAN_SUPABASE = args.includes("--plan-supabase");

if (!FIL) {
  console.error("Användning: node verktyg/aterstall-system-events.mjs --fil <system-events-full-*.json.gz> [--db DB] [--jsonl-ut FIL] [--begransa N] [--plan-supabase]");
  process.exit(2);
}

// ── Strömläsare: header-kontrakt + rad-splitter, konstant minne ──────────
// Tillstånd: H = sök "rader"-nyckeln (header) · S = sök '[' · M = mellan
// rader · R = inne i en rad-{} (djup- och strängmedveten) · E = efter array.
function skapaLasare(fil) {
  const lasare = {
    header: null, klar: false, fel: null,
    rader: [], vantar: [],
  };
  let buf = "", state = "H", rad = "", djup = 0, iStr = false, esc = false;
  let stoppad = false; // avsiktligt avbruten ström (t.ex. --begransa) är inget fel
  const dec = new StringDecoder("utf8");
  const gz = createGunzip();
  const src = createReadStream(fil);
  src.on("error", (e) => { if (!stoppad) gz.destroy(e); });
  src.pipe(gz);
  lasare.stoppa = () => { stoppad = true; try { src.destroy(); gz.destroy(); } catch {} };

  function pumpa() {
    while (lasare.vantar.length && (lasare.rader.length || lasare.klar)) {
      lasare.vantar.shift()();
    }
  }
  gz.on("data", (c) => { buf += dec.write(c); bearbeta(); pumpa(); });
  gz.on("end", () => {
    buf += dec.end();
    bearbeta();
    if (!lasare.fel && state !== "E") {
      lasare.fel = new Error("ARKIV OFULLSTÄNDIGT — strömmen slut före arkivets slut (state=" + state + ")");
    }
    lasare.klar = true; pumpa();
  });
  gz.on("error", (e) => {
    if (stoppad) { lasare.klar = true; pumpa(); return; }
    lasare.fel = e; lasare.klar = true; pumpa();
  });

  function bearbeta() {
    if (state === "H") {
      const idx = buf.indexOf('"rader":');
      if (idx < 0) {
        if (buf.length > 65536) lasare.fel = new Error("HEADER FEL — \"rader\"-nyckeln finns inte i arkivets början");
        return;
      }
      const headerText = buf.slice(0, idx).replace(/[\s,]+$/, "") + "}";
      try {
        lasare.header = JSON.parse(headerText);
      } catch (e) {
        lasare.fel = new Error("HEADER FEL — kunde inte tolka arkivhuvudet: " + e.message);
        return;
      }
      buf = buf.slice(idx + 8);
      state = "S";
    }
    let i = 0;
    while (i < buf.length) {
      const c = buf[i];
      if (state === "S") {
        if (c === "[") { state = "M"; }
        else if (!/\s/.test(c)) { lasare.fel = new Error("FORMAT FEL — väntade [ efter \"rader\":, fann '" + c + "'"); return; }
      } else if (state === "M") {
        if (c === "{") { rad = "{"; djup = 1; iStr = false; esc = false; state = "R"; }
        else if (c === "]") { state = "E"; }
        else if (!/[\s,]/.test(c)) { lasare.fel = new Error("FORMAT FEL — oväntat tecken mellan rader: '" + c + "'"); return; }
      } else if (state === "R") {
        rad += c;
        if (iStr) {
          if (esc) esc = false;
          else if (c === "\\") esc = true;
          else if (c === '"') iStr = false;
        } else if (c === '"') iStr = true;
        else if (c === "{" || c === "[") djup++;
        else if (c === "}" || c === "]") {
          djup--;
          if (djup === 0) {
            lasare.rader.push(rad);
            rad = "";
            state = "M";
          }
        }
      } else if (state === "E") {
        if (!/[\s}]/.test(c)) { lasare.fel = new Error("FORMAT FEL — skräp efter rader-arrayen: '" + c + "'"); return; }
      }
      i++;
      if (lasare.fel) return;
    }
    buf = buf.slice(i);
  }

  lasare.nasta = async function nasta() {
    while (!lasare.rader.length && !lasare.klar) {
      await new Promise((r) => { lasare.vantar.push(r); });
    }
    if (lasare.rader.length) return lasare.rader.shift();
    if (lasare.fel) throw lasare.fel;
    return null; // klart
  };
  return lasare;
}

// ── Radtolkning: validering + kolumnmappning (type → event_type) ─────────
function tolkaRad(r, felExempel) {
  let o;
  try { o = JSON.parse(r); } catch (e) { felExempel.push("JSON-parse: " + e.message); return null; }
  const typ = (v) => (typeof v === "string" && v.length ? v : null);
  const event_type = typ(o.event_type) || typ(o.type); // schemadrift: äldre arkiv bär "type"
  const id = typ(o.id), message = typ(o.message), created_at = typ(o.created_at);
  if (!id || !event_type || !message || !created_at) {
    felExempel.push("obligatoriskt fält saknar/tomt: " + JSON.stringify({ id: !!id, event_type: !!event_type, message: !!message, created_at: !!created_at }));
    return null;
  }
  const details = o.details === null || o.details === undefined ? null : o.details;
  return {
    id, event_type, message, created_at,
    severity: o.severity === undefined ? null : o.severity,
    source: o.source === undefined ? null : o.source,
    details,
  };
}

// ── COPY-textformat: \N = NULL, backslash/radfytt/tab escapeas ───────────
function copyFalt(v) {
  if (v === null || v === undefined) return "\\N";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}
function copyRad(r) {
  return [r.id, r.event_type, r.severity, r.message, r.details === null ? null : JSON.stringify(r.details), r.source, r.created_at]
    .map(copyFalt).join("\t");
}
function jsonlRad(r) {
  return JSON.stringify({ id: r.id, event_type: r.event_type, severity: r.severity, message: r.message, details: r.details, source: r.source, created_at: r.created_at });
}

// ── Plan för katastroftidens Supabase-REST-återinläsning (läser ALDRIG nycklar) ──
function planSupabase(h) {
  const batch = Number(arg("batch-storlek") || 500);
  const anrop = Math.ceil(h.antal / batch);
  console.log("PLAN — Supabase REST-återinläsning av system_events (katastroftid, huvudagenten):");
  console.log("  0) FÖRST verifiera arkivet utan --db (GRÖN) samt skapa batchfiler:");
  console.log("       node verktyg/aterstall-system-events.mjs --fil <arkiv> --jsonl-ut /tmp/se-full.jsonl");
  console.log("       split -l " + batch + " /tmp/se-full.jsonl /tmp/se-batch-");
  console.log("     (verktyget mappar type→event_type — namnbyte bevisat: arkiv 2026-09-09");
  console.log("     bär \"type\", SQL-dump 2026-09-15 bär \"event_type\")");
  console.log("  1) POST {NEXT_PUBLIC_SUPABASE_URL}/rest/v1/system_events per batchfil:");
  console.log("       curl -s -X POST \"$URL/rest/v1/system_events\" \\");
  console.log("         -H \"apikey: $SUPABASE_SERVICE_ROLE_KEY\" -H \"Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY\" \\");
  console.log("         -H \"Content-Type: application/json\" -H \"Prefer: return=minimal\" \\");
  console.log("         --data @/tmp/se-batch-N.jsonl");
  console.log("     OBS 1: tabellen saknar primärnyckel (CREATE TABLE i dumpen 2026-09-15;");
  console.log("     6 dubblett-id mätta i arkivet 2026-09-09 vid DR-provet 2026-09-15) — ALDRIG");
  console.log("     \"resolution=ignore-duplicates\" (ON CONFLICT kräver unik nyckel → fel). Trogen");
  console.log("     återställning behåller dubbletter som arkivet bär.");
  console.log("     (nycklarna äger huvudagenten/.env — detta verktyg läser dem ALDRIG)");
  console.log("  2) EFTERKOLL: räkna rader i Supabase === " + h.antal + " (header.antal) innan arkivet får raderas.");
  console.log("  Omfattning: " + h.antal.toLocaleString("sv-SE") + " rader ÷ " + batch + "/batch = " + anrop + " anrop.");
}

// ── Huvudflöde ───────────────────────────────────────────────────────────
const t0 = hrtime.bigint();
const lasare = skapaLasare(FIL);

if (PLAN_SUPABASE) {
  // Planen bygger på headern — läs den, stäng strömmen, skriv planen.
  await new Promise((r) => setTimeout(r, 0));
  process.nextTick(() => {});
  const vantaHeader = setInterval(() => {
    if (lasare.header || lasare.fel || lasare.klar) clearInterval(vantaHeader);
  }, 10);
  await new Promise((r) => {
    const kolla = () => (lasare.header || lasare.fel ? r() : setTimeout(kolla, 20));
    kolla();
  });
  if (!lasare.header) {
    console.error("DOM: RÖD — " + (lasare.fel ? lasare.fel.message : "header kunde inte läsas"));
    process.exit(1);
  }
  planSupabase(lasare.header);
  process.exit(0);
}

const felExempel = [];
const fordeling = new Map();
const idSet = new Set(); // ~146k id ≈ ca 10 MB — dubblettmätning utan KONSTANT-minnesbrott
let dubblettAntal = 0;
let radAntal = 0, felAntal = 0, detailsNull = 0;
let createdMin = null, createdMax = null;

let psql = null, psqlUt = "", psqlFel = "", psqlExit = null;
if (DB) {
  psql = spawn("psql", ["-X", "-v", "ON_ERROR_STOP=1", "-d", DB,
    "-c", "COPY public." + TABELL + " (id,event_type,severity,message,details,source,created_at) FROM STDIN"]);
  // OBS: ej -q — quiet-läget tystar "COPY n"-tagen som domen tolkar
  psql.stdout.on("data", (d) => { psqlUt += d; });
  psql.stderr.on("data", (d) => { psqlFel += d; });
  psql.on("error", (e) => { psqlExit = -1; psqlFel += e.message; });
  psql.on("close", (k) => { psqlExit = k; });
  psql.stdin.on("error", () => {}); // död psql fångas av exit-koden i domen
}
let jsonlUt = null;
if (JSONL_UT) jsonlUt = createWriteStream(JSONL_UT);

const tCopy0 = hrtime.bigint();
let stromFel = null;
try {
  for (;;) {
    const rader = await lasare.nasta();
    if (rader === null) break;
    if (BEGRANSA && radAntal >= BEGRANSA) { lasare.stoppa(); break; }
    const r = tolkaRad(rader, felExempel);
    if (!r) { felAntal++; continue; }
    radAntal++;
    if (idSet.has(r.id)) dubblettAntal++; else idSet.add(r.id);
    if (r.details === null) detailsNull++;
    fordeling.set(r.event_type, (fordeling.get(r.event_type) || 0) + 1);
    if (createdMin === null || r.created_at < createdMin) createdMin = r.created_at;
    if (createdMax === null || r.created_at > createdMax) createdMax = r.created_at;
    if (psql) {
      if (!psql.stdin.write(copyRad(r) + "\n")) {
        await new Promise((res) => psql.stdin.once("drain", res));
      }
    }
    if (jsonlUt) {
      if (!jsonlUt.write(jsonlRad(r) + "\n")) {
        await new Promise((res) => jsonlUt.once("drain", res));
      }
    }
  }
} catch (e) {
  stromFel = e; // t.ex. Z_BUF_ERROR vid trunkerad gzip — domas nedan, aldrig krasch
}
const tCopy1 = hrtime.bigint();
if (psql) {
  try { psql.stdin.end("\\.\n"); } catch {}
  await new Promise((r) => { if (psqlExit !== null) r(); else psql.on("close", r); });
}
if (jsonlUt) await new Promise((r) => jsonlUt.end(r));
const t1 = hrtime.bigint();

// ── Domar ────────────────────────────────────────────────────────────────
const h = lasare.header || {};
const stromFelText = (stromFel || lasare.fel);
const domer = [];
domer.push(["gzip-ström läst utan fel", !stromFelText, stromFelText ? stromFelText.message : null]);
domer.push(["header-kontrakt (typ=system_events_full, truncerad=false, antal>0)",
  h.typ === "system_events_full" && h.truncerad === false && Number.isInteger(h.antal) && h.antal > 0,
  "typ=" + h.typ + " truncerad=" + h.truncerad + " antal=" + h.antal]);
const vantatAntal = BEGRANSA ? Math.min(BEGRANSA, h.antal || BEGRANSA) : h.antal;
domer.push(["radantal === väntat antal" + (BEGRANSA ? " (begränsat läge: " + BEGRANSA + " av " + h.antal + ")" : " (header.antal)"),
  radAntal === vantatAntal && radAntal > 0,
  radAntal + " lästa mot " + vantatAntal + " väntade"]);
domer.push(["samtliga rader giltiga (id/event_type|type/message/created_at)", felAntal === 0,
  felAntal ? felExempel.slice(0, 3).join(" | ") : null]);
let copyN = null;
if (psql) {
  const m = psqlUt.match(/COPY\s+(\d+)/);
  copyN = m ? Number(m[1]) : null;
  domer.push(["psql COPY lyckades (exit 0) och räknade " + radAntal + " rader",
    psqlExit === 0 && copyN === radAntal,
    "psqlExit=" + psqlExit + " COPY-n=" + copyN + (psqlFel ? " stderr: " + psqlFel.slice(0, 300) : "")]);
}
const ms = (a, b) => Number((BigInt(b) - BigInt(a)) / 1000000n);
const gron = domer.every(([, ok]) => ok);
console.log("=== ÅTERSTÄLLNINGSPROV system_events (DR-kedja 2) ===");
console.log("Arkiv:  " + FIL);
console.log("Header: datum=" + h.datum + " · antal=" + h.antal + " · sidor=" + h.sidor + " · truncerad=" + h.truncerad);
console.log("Läst:   " + radAntal + " rader · " + felAntal + " felaktiga · details=null i " + detailsNull + " · dubblett-id " + dubblettAntal + " (tabellen saknar PK — se DR-protokollet)");
console.log("Tid:    totalt " + ms(t0, t1) + " ms" + (psql ? " · COPY-fas " + ms(tCopy0, tCopy1) + " ms (" + Math.round(radAntal / Math.max(1, ms(tCopy0, tCopy1) / 1000)) + " rader/s)" : ""));
console.log("Tidsfönster: " + createdMin + " … " + createdMax);
const topp = [...fordeling.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log("Fördelning (topp 8): " + topp.map(([t, n]) => t + "=" + n).join(", "));
if (psql) console.log("psql:   exit=" + psqlExit + " · COPY-n=" + copyN + " · db=" + DB);
for (const [namn, ok, ev] of domer) {
  console.log((ok ? "  [GRÖN] " : "  [RÖD]  ") + namn + (ok || !ev ? "" : " — " + ev));
}
console.log("DOM: " + (gron ? "GRÖN" : "RÖD"));
process.exit(gron ? 0 : 1);
