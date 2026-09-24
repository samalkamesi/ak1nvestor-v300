#!/usr/bin/env node
/**
 * AK1A — s7-o121 EFTER-STRUKTUR (o119 §5 EFTER-kriterier 1–3, vakarövertag-bar).
 *
 * Läge 1 (vänta):  node verktyg/_s7u4o121-efter-struktur.mjs vanta [maxSek]
 *   Pollar .next/BUILD_ID var 30:e s tills den lämnar FÖRE-bygget (prod-synken
 *   deployar automatiskt när RAM-grinden öppnar) — avslutar direkt vid nytt ID.
 * Läge 2 (mät):    node verktyg/_s7u4o121-efter-struktur.mjs mat
 *   1. BUILD_ID ≠ FÖRE + 568a93a2 förfader i git (krav §5.1)
 *   2. prod 200 ×5 https (§5.2)
 *   3. Struktur (§5.3): widgetens 5 strängar → vilka chunkar; initial-HTML
 *      på /en/blogg /ar/blogg /blogg /kurser refererar dem; SSR-HTML-diff
 *      mot FÖRE-arkivet (normaliserad: /_next/… → NEXTPATH; skillnader
 *      tillåtna ENDAST i chunk-sökvägar)
 * Utdata: data/forskning/OPTIMERING/lighthouse/s7u4o121-efter-struktur.json
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";

const BAS = process.env.LH_BAS || "http://localhost:3000";
const PROD = "https://lab.ak1nvestor.com";
const FORE_BUILD = "IxcwwO_QWK5g7r0rfK5_M";
const KUR_COMMIT = "568a93a2"; // o119-kuren
const SIDOR = ["/en/blogg", "/ar/blogg", "/blogg", "/kurser"];
const PROD_SIDOR = ["/", "/blogg", "/en/blogg", "/ar/blogg", "/en"];
const ARKIVFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse/s7u4o121-fore-html-arkiv.json");
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse/s7u4o121-efter-struktur.json");
const WIDGET_STRANGAR = [
  "Håll streaken levande", "Fortsätt läroplanen", "Testa hela analysflödet",
  "Räkna på ett nytt case", "Djupdyk i dina innehav",
];
const WIDGET_CHUNK_FORE = "10f47l5mmeoxy.js";

const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const normalisera = (html) => html.replace(/\/_next\/[^"'\s)]+/g, "NEXTPATH");
const lasBuildId = () => readFileSync(join(process.cwd(), ".next/BUILD_ID"), "utf8").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const mode = process.argv[2] || "vanta";

if (mode === "vanta") {
  const maxSek = Number(process.argv[3] || 900);
  const start = Date.now();
  while (Date.now() - start < maxSek * 1000) {
    const id = lasBuildId();
    if (id !== FORE_BUILD) { console.log(`NYTT BUILD_ID: ${id} (efter ${Math.round((Date.now() - start) / 1000)} s)`); process.exit(0); }
    await sleep(30_000);
  }
  console.log(`TIMEOUT: fortfarande ${lasBuildId()} efter ${maxSek} s — deployen landade ej (RAM-grind).`);
  process.exit(2);
}

if (mode !== "mat") { console.error("Användning: vanta [maxSek] | mat"); process.exit(1); }

// ——— Läge MAT ———
const arkiv = JSON.parse(readFileSync(ARKIVFIL, "utf8"));
const buildId = lasBuildId();
const ut = { datum: new Date().toISOString(), bas: BAS, buildId, kriterier: {} };

// §5.1 BUILD_ID lämnat IxcwwO + kuren förfader
ut.kriterier.s1_buildId = { godkant: buildId !== FORE_BUILD, fore: FORE_BUILD, efter: buildId };
try {
  execFileSync("git", ["merge-base", "--is-ancestor", KUR_COMMIT, "HEAD"], { stdio: "ignore" });
  ut.kriterier.s1_forfader = { godkant: true, commit: KUR_COMMIT };
} catch {
  ut.kriterier.s1_forfader = { godkant: false, commit: KUR_COMMIT };
}

// §5.2 prod 200 ×5
ut.kriterier.s2_prod = [];
for (const s of PROD_SIDOR) {
  const r = await fetch(new URL(s, PROD).href, { redirect: "manual" });
  ut.kriterier.s2_prod.push({ sida: s, status: r.status });
  console.log(`prod ${s}: ${r.status}`);
}

// §5.3 struktur
const statisk = join(process.cwd(), ".next/static/chunks");
const widgetChunks = [];
for (const f of readdirSync(statisk)) {
  if (!f.endsWith(".js")) continue;
  const innehall = readFileSync(join(statisk, f), "utf8");
  const traffar = WIDGET_STRANGAR.filter((str) => innehall.includes(str));
  if (traffar.length) widgetChunks.push({ chunk: f, strangar: traffar.length });
}
ut.kriterier.s3_widgetChunks = widgetChunks;
console.log("Widget-strängar i chunkar:", JSON.stringify(widgetChunks));

ut.kriterier.s3_sidor = {};
for (const s of SIDOR) {
  const r = await fetch(new URL(s, BAS).href);
  const html = await r.text();
  const initiala = [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map((m) => m[1]).filter((u) => u.includes("/_next/"));
  const widgetRefInitial = initiala.filter((u) => widgetChunks.some((w) => u.includes(w.chunk)));
  const fore = arkiv.sidor[s];
  const nSha = sha(normalisera(html));
  const sammaNormaliserad = nSha === fore.sha256Normaliserad;
  let diffKontext = null;
  if (!sammaNormaliserad) {
    const a = normalisera(fore.html), b = normalisera(html);
    let i = 0; while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
    diffKontext = { position: i, fore: a.slice(Math.max(0, i - 60), i + 120), efter: b.slice(Math.max(0, i - 60), i + 120) };
  }
  ut.kriterier.s3_sidor[s] = {
    status: r.status, langd: html.length, langdFore: fore.langd,
    sha256Normaliserad: nSha, sha256NormaliseradFore: fore.sha256Normaliserad,
    htmlBitjamforbar: sammaNormaliserad,
    widgetChunkRefInitial: widgetRefInitial.length,
    foreWidgetChunkTraffar: fore.widgetChunkTraffar,
    gammalChunkKvar: html.includes(WIDGET_CHUNK_FORE),
    diffKontext,
  };
  console.log(`${s}: widgetRef initial ${widgetRefInitial.length} (FÖRE ${fore.widgetChunkTraffar}) · bitjamforbar ${sammaNormaliserad}`);
}

writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
console.log(`Skriven: ${UTFIL}`);
const s1 = ut.kriterier.s1_buildId.godkant && ut.kriterier.s1_forfader.godkant;
const s2 = ut.kriterier.s2_prod.every((x) => x.status === 200);
const s3 = Object.values(ut.kriterier.s3_sidor).every((x) => x.widgetChunkRefInitial === 0 && x.htmlBitjamforbar);
console.log(`KOMPLETT: §5.1 ${s1} · §5.2 ${s2} · §5.3 ${s3} → ${s1 && s2 && s3 ? "EFTER-STRUKTUR GRÖN" : "granska manuellt"}`);
