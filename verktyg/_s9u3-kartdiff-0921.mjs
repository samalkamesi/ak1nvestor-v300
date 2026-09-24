#!/usr/bin/env node
// _s9u3-kartdiff-0921.mjs — dokvåg s9-u3 (manifest auto-s9-1790009126349)
// Read-only mätare: B7 (AKM2-analysmotorn) + B9 (Vågsystemet AK1TS) +
// E32 (Guldkällorna) mot SYSTEMKARTAN 2026-09-19-stämplarna.
// GET/HEAD endast mot loopback + filläsningar + git-log + LÄSANDE
// Supabase-REST (Mimosa: nycklar via loadEnvFile, ALDRIG loggade; inga
// skrivningar). src/ orörd, inga nycklar ut, inget bygge.
import { execFileSync } from "node:child_process";
import { loadEnvFile } from "node:process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const utf = (s) => readFileSync(path.join(ROT, s), "utf8");
const log = (...a) => console.log(...a);
const BAR = "=".repeat(72);

async function sond(url, { metod = "GET", väntaPå = null } = {}) {
  const start = Date.now();
  try {
    const r = await fetch(url, { method: metod, redirect: "manual" });
    const ms = Date.now() - start;
    let kropp = "";
    if (metod === "GET") {
      const t = await r.text();
      kropp = väntaPå ? (t.includes(väntaPå) ? " ✓ " + JSON.stringify(väntaPå) : " ✗ SAKNAR " + JSON.stringify(väntaPå)) : ` (${t.length} B)`;
    }
    return { status: r.status, ms, txt: async () => (await r.text()) };
  } catch (e) {
    return { status: 0, ms, fel: String(e.cause?.code || e.message) };
  }
}

const git = (args) => { try { return execFileSync("git", args, { cwd: ROT, encoding: "utf8" }).trim(); } catch { return "(git-fel)"; } };

// — Supabase read-only (Mimosa) —
let sbUrl = "", sbKey = "";
try {
  loadEnvFile(path.join(ROT, ".env"));
  sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
} catch (e) { log("env-läsning misslyckades (sonden hoppar):", e.code || e.message); }

async function sbGet(query) {
  const r = await fetch(`${sbUrl}/rest/v1/${query}`, {
    headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}`, Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!r.ok) return { fel: r.status };
  return { rader: await r.json() };
}

log(BAR, "\nB9 — VÅGSYSTEMET AK1TS (stämpel 09-19)");
{
  // 1) Senaste skans-rad live
  const s = await sond("http://localhost:3000/api/vagscan/senaste");
  log("/api/vagscan/senaste:", s.status, s.ms + " ms");
  if (s.status === 200) { const t = await (await fetch("http://localhost:3000/api/vagscan/senaste")).text(); log("  senaste-rad (första 300 B):", t.slice(0, 300)); }
  // 2) Historiekontraktet: rader per dag, read-only
  if (sbUrl && sbKey) {
    for (const typ of ["vagscan", "signal", "organ"]) {
      const q = await sbGet(`system_events?type=eq.${typ}&select=type,created_at&order=created_at.desc&limit=1000`);
      if (q.fel) { log(`  ${typ}: REST ${q.fel}`); continue; }
      const perDag = {};
      let äldst = "";
      for (const r of q.rader) { const d = String(r.created_at).slice(0, 10); perDag[d] = (perDag[d] || 0) + 1; if (!äldst || r.created_at < äldst) äldst = r.created_at; }
      log(`  ${typ}: ${q.rader} rader (tak 1000) · äldsta ${äldst || "—"} · per dag:`, JSON.stringify(perDag));
    }
  } else log("  (Supabase-sond avstängd: saknar url/nyckel i env)");
  // 3) Valideringsrapporten
  const st = statSync(path.join(ROT, "data/rapporter/vagvalidering-SENASTE.json"));
  const vv = JSON.parse(utf("data/rapporter/vagvalidering-SENASTE.json"));
  const domDoman = vv.domd || vv.domar_datum || vv.datum || JSON.stringify(vv).slice(0, 120);
  log("vagvalidering-SENASTE: mtime", st.mtime.toISOString().slice(0, 16), "· domdatum-fält:", domDoman);
  // 4) Live-ytor
  log(" sond /api/data/vagstatistik:", (await sond("http://localhost:3000/api/data/vagstatistik")).status);
  log(" sond /vagfundament:", (await sond("http://localhost:3000/vagfundament")).status);
  // 5) Universum i kod
  const route = utf("src/app/api/cron/vagscan/route.ts");
  const uni = route.match(/TICKERS?\s*[:=][^\]]*\]/s) || route.match(/\[\s*"[A-Z0-9.\-"]+"\s*\]/);
  const antal = (route.match(/"[A-Z]{2,6}(?:[-.][A-Z]{1,3})?"/g) || []).length;
  log("vagscan route: universumtecken (ticker-citat):", antal, "· radtal", route.split("\n").length);
  log(" senaste git vagfundament-motor.ts:", git(["log", "-1", "--format=%h %ad", "--date=short", "--", "src/lib/vagfundament-motor.ts"]));
}

log(BAR, "\nB7 — AKM2-ANALYSMOTORN (stämpel 09-19)");
{
  // 1) Cache-bilden
  const cacheRot = path.join(ROT, "data/cache");
  const bild = {};
  let färskast = "";
  for (const kat of readdirSync(cacheRot)) {
    const p = path.join(cacheRot, kat);
    const st = statSync(p);
    if (!st.isDirectory()) continue;
    const filer = readdirSync(p).filter((f) => f.endsWith(".json"));
    bild[kat] = filer.length;
    const mt = st.mtime.toISOString();
    if (mt > färskast) färskast = mt;
    for (const f of filer) { const fs2 = statSync(path.join(p, f)); if (fs2.mtime.toISOString() > färskast) färskast = fs2.mtime.toISOString(); }
  }
  log("data/cache (katalog: antal JSON):", JSON.stringify(bild), "· färskast", färskast);
  // 2) Berika-pipelinen
  log(" kor-akm2-berika senaste git:", git(["log", "-1", "--format=%h %ad %s", "--date=short", "--", "verktyg/kor-akm2-berika.mjs"]).slice(0, 100));
  const akm2Cacher = bild.akm2 ?? 0;
  log(" akm2-cacher på disk:", akm2Cacher, "(kartan: 0 sedan våg 122:s rensning)");
  // 3) Fixture-raden: ABB.ST gällande snapshot, read-only
  if (sbUrl && sbKey) {
    const q = await sbGet("system_events?type=eq.akm2_snapshot&details->>ticker=eq.ABB.ST&select=type,created_at,details&order=created_at.desc&limit=3");
    if (q.fel) log(" akm2_snapshot ABB.ST: REST", q.fel);
    else {
      log(` akm2_snapshot ABB.ST: ${q.rader.length} rad(er) hämtade (senaste först):`);
      for (const r of q.rader.slice(0, 2)) {
        const str = JSON.stringify(r.details || {});
        log(`   ${r.created_at} · Fixtur AB i payload: ${str.includes("Fixtur")} · schema: ${(r.details || {}).schema || "?"} · ${str.length} B`);
      }
    }
  }
  // 4) Livlinan 22/22 + premium 11/11 (loopback, transform: sista _ → .)
  const bib = readdirSync(path.join(ROT, "data/forskningsbiblioteket")).filter((f) => f.endsWith(".json"));
  let ok = 0;
  for (const f of bib) {
    const namn = f.replace(/\.json$/, "");
    const slug = namn.replace(/_([^_]*)$/, "$1").replace(/_(?=[^.]*$)/, ".");
    const r = await fetch("http://localhost:3000/forskningsbiblioteket/" + slug, { redirect: "manual" }).catch(() => ({ status: 0 }));
    const spår = r.status === 200 ? ((await r.text()).includes("AKM2") ? "AKM2✓" : "AKM2✗") : "";
    if (r.status === 200) ok++;
    if (r.status !== 200 || spår === "AKM2✗") log(`   livlina ${slug}: ${r.status} ${spår}`);
  }
  log(` livlina forskningsbiblioteket: ${ok}/${bib.length} kod 200 (transform sista _→.)`);
  const pre = readdirSync(path.join(ROT, "data/analyses")).filter((f) => f.endsWith(".json"));
  let pok = 0;
  for (const f of pre) {
    const slug = f.replace(/\.json$/, "");
    const r = await fetch("http://localhost:3000/analyser/" + encodeURIComponent(slug), { redirect: "manual" }).catch(() => ({ status: 0 }));
    if (r.status === 200) pok++; else log(`   premium ${slug}: ${r.status}`);
  }
  log(` premium analyser: ${pok}/${pre.length} kod 200`);
  // 5) Kodstämpel
  for (const f of ["src/lib/akm2/karna.ts", "src/lib/analys-motor.ts", "src/lib/akm2-onsdemand.ts"]) {
    log(`  ${path.basename(f)}: ${utf(f).split("\n").length} r · git`, git(["log", "-1", "--format=%h %ad", "--date=short", "--", f]));
  }
}

log(BAR, "\nE32 — GULDKÄLLORNA (stämpel 09-19)");
{
  const s = JSON.parse(utf("data/siffror.json"));
  log(`siffror.json (uppdaterad ${s.uppdaterad}): kurser ${s.kurser} · quiz ${s.quiz} · quizXp ${s.quizXp} · kanonSomKurs ${s.kanonSomKurs ?? "?"}`);
  log(" (kartan 09-19: 432 kurser · 8 223 quiz · 82 230 XP)");
  const dc = JSON.parse(utf("public/deep-courses.json"));
  const antal = Array.isArray(dc) ? dc.length : (dc.kurser || []).length;
  log("public/deep-courses.json:", antal, "objekt (kartan 09-19: 432)");
  log(" senaste siffror-commit:", git(["log", "-1", "--format=%h %ad %s", "--date=format:'%m-%d %H:%M'", "--", "data/siffror.json"]).slice(0, 90));
  const priser = JSON.parse(utf("data/portfolj-system/priser.json"));
  log("priser.json: fas1", priser.fas1 ?? priser?.priser?.fas1 ?? "?", "· senaste innehållscommit:", git(["log", "-1", "--format=%h %ad", "--date=short", "--", "data/portfolj-system/priser.json"]), "· mtime", statSync(path.join(ROT, "data/portfolj-system/priser.json")).mtime.toISOString().slice(0, 10));
  for (const f of ["src/lib/variabler.ts", "src/lib/variabler-lagring.ts", "src/lib/siffror.ts", "src/lib/siffror-live.ts"]) {
    log(`  ${path.basename(f)}: ${utf(f).split("\n").length} r · git`, git(["log", "-1", "--format=%h %ad", "--date=short", "--", f]));
  }
  const v = await fetch("http://localhost:3000/api/variabler", { redirect: "manual" }).catch(() => ({ status: 0 }));
  let fält = "?";
  if (v.status === 200) { const j = await v.json(); fält = Object.keys(j.variabler || j).length + " fält"; }
  log(" sond /api/variabler:", v.status, fält);
  // startsidans levererade tal (live-HTML)
  const hem = await fetch("http://localhost:3000/", { redirect: "manual" }).catch(() => ({ status: 0 }));
  if (hem.status === 200) {
    const t = await hem.text();
    const m = t.match(/(\d+) kurser, ([\d ]+) kanonböcker, ([\d ]+) quiz/) || t.match(/(\d+)\s*kurser/);
    log(" startsidan levererar:", m ? m[0] : "(mönster ej hittat)");
  }
}
log(BAR);
