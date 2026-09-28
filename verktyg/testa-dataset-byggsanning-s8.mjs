#!/usr/bin/env node
/**
 * TESTA-DATASET-BYGGSANNING (spår 8, o559) — dataset-ytornas löftesvakt.
 * =====================================================================
 * Rotorsakan o559 kurade (o146 §7:s öppna spegelpost, prod-bevisad av
 * s4-u1:s fynd "/dataset/teknik/peg 404 medan /dataset/material/peg 200"):
 * /dataset/[bransch] och /[bransch]/[aspekt] är force-static +
 * dynamicParams=false (sidorna finns bara där generateStaticParams såg
 * dem vid senaste gröna bygge) medan index-vyerna (sv/en/ar, ISR),
 * aspektsidornas syskonlänkar (ISR-render) och llms.txt (force-dynamic)
 * lovar ur LIVE-data. Efter en omstart utan rebuild (OOM ⇒ läkebackup,
 * o146:s bevisade fönster) länkade dessa ytor branscher som tjänsten
 * svarar 404 på — kundklickbart på tre språk + maskinläsbart i llms.txt.
 *
 * KUR (denna svit bevakar den): samtliga lovan-de ytor bär
 * byggdSidaFinns-filtret (src/lib/sitemap-byggsanning.ts, o147) — fail-open
 * utan .next, endast konstaterat saknad .html håller löftet tillbaka.
 *
 * Kontrakt (deterministiskt, offline-grönt):
 *   K1 dataset-sidor.tsx: byggdBranschFinns + filter i index-tabellen och
 *      detaljsidans syskonlista ("andra branscher")
 *   K2 [aspekt]/page.tsx: syskonlänkarna filtrerade mot
 *      dataset/<bransch>/<aspekt>
 *   K3 seo.tsx: llms.txt:s bransch-loop håller tillbaka ej byggda
 *   K4 fail-open-kärnan i sitemap-byggsanning.ts orörd (o146/o147)
 *   K5 mekanikeldprov: filterregeln mot ett låtsat .next-träd i tmp —
 *      allt byggd ⇒ allt synligt; en saknad ⇒ gallras; ingen .next ⇒
 *      allt synligt (fail-open), precis som lib-källan
 * Villkorad HTTP-sond (ALDRIG fail på deploy-läge — inga förljugna
 * EFTER-tal, o131/o139-doktrinen): sidornas+llms:s löften checkas mot
 * localhost; döda löften rapporteras som GAP-ÖPPET/VÄNTAR-DEPLOY (info),
 * grönt läge som LEVERANS-GRÖN (info).
 * Körs: node verktyg/testa-dataset-byggsanning-s8.mjs
 * Exit: 0 = kontraktet håller · 1 = brott (K1–K5).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VY = path.join(ROT, "src", "components", "ak1a", "dataset-sidor.tsx");
const ASPEKT = path.join(ROT, "src", "app", "(huvud)", "dataset", "[bransch]", "[aspekt]", "page.tsx");
const SEO = path.join(ROT, "src", "lib", "seo.tsx");
const BYGG = path.join(ROT, "src", "lib", "sitemap-byggsanning.ts");

let pass = 0, fail = 0;
const ok = (namn, villkor, detalj = "") => {
  if (villkor) { pass++; console.log(`  PASS ${namn}`); }
  else { fail++; console.log(`  FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
};

const vy = fs.readFileSync(VY, "utf8");
const aspekt = fs.readFileSync(ASPEKT, "utf8");
const seo = fs.readFileSync(SEO, "utf8");
const bygg = fs.readFileSync(BYGG, "utf8");

// ── K1: dataset-sidor.tsx — vylagret ────────────────────────────────────────
ok("K1a vyn importerar byggdSidaFinns", /import \{ byggdSidaFinns \} from "@\/lib\/sitemap-byggsanning";/.test(vy));
ok(
  "K1b byggdBranschFinns existerar (språkmedveten byggsökväg)",
  /export function byggdBranschFinns\(lang: SprakId, bransch: string\): boolean/.test(vy),
);
ok(
  "K1c index-tabellen filtrerar byggda branscher",
  /const sorterbara = medianer\.rader\s*\n\s*\.filter\(\(r\) => byggdBranschFinns\(lang, r\.bransch\)\)/.test(vy),
);
ok(
  "K1d detaljsidans 'andra branscher' filtrerar",
  /\.filter\(\(r\) => r\.bransch !== rad\.bransch && byggdBranschFinns\(lang, r\.bransch\)\)/.test(vy),
);

// ── K2: aspektsidornas syskonlänkar ─────────────────────────────────────────
ok("K2a aspektrutten importerar byggdSidaFinns", /import \{ byggdSidaFinns \} from "@\/lib\/sitemap-byggsanning";/.test(aspekt));
ok(
  "K2b syskonlänkarna filtrerade mot dataset/<bransch>/<aspekt>",
  /\.filter\(\(p\) => byggdSidaFinns\(`dataset\/\$\{p\.bransch\}\/\$\{p\.aspekt\}`\)\)/.test(aspekt),
);

// ── K3: llms.txt-generatorn ─────────────────────────────────────────────────
ok("K3a seo.tsx importerar byggdSidaFinns", /import \{ byggdSidaFinns \} from "\.\/sitemap-byggsanning";/.test(seo));
ok(
  "K3b llms-branschloopen håller tillbaka ej byggda",
  /for \(const r of medianer\.rader\) \{\s*\n\s*if \(!byggdSidaFinns\(`dataset\/\$\{r\.bransch\}`\)\) continue;/.test(seo),
);

// ── K4: fail-open-kärnan orörd (o146/o147) ──────────────────────────────────
ok("K4a byggdSidaFinns exporterad oförändrad", /export function byggdSidaFinns\(relSokvag: string\): boolean/.test(bygg));
ok("K4b fail-open vid saknad bygginformation", /if \(!bygginfoFinns\(\)\) return true;/.test(bygg));
ok("K4c fail-open vid sondfel", /catch \{\s*\n\s*return true;/.test(bygg));

// ── K5: mekanikeldprov mot låtsat .next-träd (spegling av lib-logiken) ──────
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "o559-"));
  // Spegeln verifieras mot källan: existsSync(BUILD_ID)+app ⇒ info; annars fail-open.
  const spegel = (rot, rel) => {
    try {
      if (!fs.existsSync(path.join(rot, ".next", "BUILD_ID")) || !fs.existsSync(path.join(rot, ".next", "server", "app"))) return true;
      return fs.existsSync(path.join(rot, ".next", "server", "app", `${rel}.html`));
    } catch { return true; }
  };
  const rader = ["energi", "finans", "teknik"].map((bransch) => ({ bransch }));

  // (a) allt byggd ⇒ allt synligt (normalfallet: friskt deploy-bygge ser ingen ändring)
  fs.mkdirSync(path.join(tmp, "a", ".next", "server", "app", "dataset"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "a", ".next", "BUILD_ID"), "x");
  for (const r of rader) fs.writeFileSync(path.join(tmp, "a", ".next", "server", "app", `dataset/${r.bransch}.html`), "x");
  ok("K5a allt byggd ⇒ 3/3 synliga (beteendet oförändrat i friskt läge)",
     rader.filter((r) => spegel(path.join(tmp, "a"), `dataset/${r.bransch}`)).length === 3);

  // (b) teknik saknas ⇒ gallras, syskonen levereras (o146:s fönster)
  fs.mkdirSync(path.join(tmp, "b", ".next", "server", "app", "dataset"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "b", ".next", "BUILD_ID"), "x");
  for (const r of rader.slice(0, 2)) fs.writeFileSync(path.join(tmp, "b", ".next", "server", "app", `dataset/${r.bransch}.html`), "x");
  const synligaB = rader.filter((r) => spegel(path.join(tmp, "b"), `dataset/${r.bransch}`));
  ok("K5b en saknad ⇒ gallras exakt (energi+finans synliga, teknik tillbaka)",
     synligaB.length === 2 && synligaB.every((r) => r.bransch !== "teknik"));

  // (c) ingen .next ⇒ fail-open (dev/ren klon: allt synligt som förut)
  ok("K5c ingen .next ⇒ 3/3 synliga (fail-open)",
     rader.filter((r) => spegel(path.join(tmp, "c"), `dataset/${r.bransch}`)).length === 3);

  fs.rmSync(tmp, { recursive: true, force: true });
}

// ── Villkorad HTTP-sond (info — aldrig fejkat grönt, aldrig exit på drift) ──
console.log("");
try {
  const bas = "http://localhost:3000";
  const sidor = ["/dataset", "/en/dataset", "/ar/dataset"];
  let allaLankar = [];
  for (const s of sidor) {
    const html = await (await fetch(bas + s, { signal: AbortSignal.timeout(8000) })).text();
    for (const m of html.matchAll(/href="((?:\/(?:en|ar)?)?\/dataset\/[a-z0-9-]+)"/g)) allaLankar.push([s, m[1]]);
  }
  const llms = await (await fetch(bas + "/llms.txt", { signal: AbortSignal.timeout(8000) })).text();
  for (const m of llms.matchAll(/\]\(https:\/\/[^)]*\/(dataset\/[a-z0-9-]+)\)/g)) allaLankar.push(["/llms.txt", "/" + m[1]]);
  const unika = [...new Map(allaLankar.map(([k, u]) => [u, k]))];
  let doda = [];
  for (const [url] of unika) {
    const kod = (await fetch(bas + url, { signal: AbortSignal.timeout(8000) })).status;
    if (kod !== 200) doda.push(`${url} → ${kod}`);
  }
  console.log(`HTTP-SOND: ${unika.length} dataset-löften på index×3+llms · ${doda.length} döda`);
  if (doda.length === 0) console.log("HTTP-SOND: LEVERANS-GRÖN — varje lovat mål svarar 200 (filtret vakar från nästa deploy)");
  else {
    console.log("HTTP-SOND: GAP-ÖPPET — döda löften lever i prod (o146:s fönster pågår!):");
    for (const d of doda) console.log("  " + d);
    console.log("HTTP-SOND: kuren är committad i källan — VÄNTAR-DEPLOY (prod-synken bygger, ALDRIG denna svit)");
  }
} catch (e) {
  console.log(`HTTP-SOND: OINSTÄNGD (server ej mätbar från denna körning: ${e.name}) — sviten är offline-körbar`);
}

console.log(`\nSVIT: ${pass} PASS · ${fail} FAIL`);
process.exit(fail ? 1 : 0);
