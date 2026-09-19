#!/usr/bin/env node
/**
 * AK1A — EFTER-KÖRNING för o75+o76+o77 (spår 7, 2026-09-19).
 *
 * Förutsättning: prod-synken har deployat ett bygge vars träd innehåller
 * kurerna 6f7482da (o75 /ar+/en prefetch) + 295ce77c (o76 palett-chunk)
 * + dea2d366 (o77 hydrat-CLS). Verktyget verifierar det FÖRST (fas 0)
 * och vägrar mäta på gamla bygget — FÖRE-talen är tagna mot
 * BUILD 5AotUdlvjeJdi4jmPz1qL och jämförelse mot fel bygge är spökmät.
 *
 * Faser (allt i sekvens — SEQ-grinden, aldrig parallell Lighthouse):
 *   0. Preflight: prod 200 ×3 https · BUILD_ID · git-förfaderskap för
 *      de tre kur-commits · arbetsytan ren (prod-synkens ff-only).
 *   1. Strukturbevis (lastokänsliga, curl mot https):
 *      o76: ingen initial-chunk på /kurser /blogg /om-oss bär
 *           palett-kännetecknen (navigationsminne/streak/oppna-sok).
 *      o77: SSR lang="sv" + svenskt hero-citat på /.
 *   2. Lighthouse mobil (localhost:3000 = prod-trädet): / /kurser /blogg
 *      /ar /en — namnrymd s7u2-o75o76o77-efter.
 *   3. Viewportsond /ar + /en (o75: _rsc-flighter 6→0).
 *   4. Skiftsond / 15 s (o77: CLS 0, noll skev).
 * Utdata: lighthouse/efter-s7u2-o75o76o77-kriterier.json (maskinellt
 * pass/fail per protokoll) + verktygens egna loggrader på stdout.
 *
 * Användning: node verktyg/prestanda-o75o76o77-efter.mjs
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROTT = process.cwd();
const HTTPS = "https://lab.ak1nvestor.com";
const KUR_COMMITS = ["6f7482da", "295ce77c", "dea2d366"];
const PALETT_KANTECKEN = ["navigationsminne", "oppna-sok", "streak"];
const UT = join(ROTT, "data/forskning/OPTIMERING/lighthouse/efter-s7u2-o75o76o77-kriterier.json");
const log = (m) => console.log(`[efter] ${m}`);
const resultat = { startad: new Date().toISOString(), faser: {}, kriterier: {} };

/** git-förfaderskap: är <commit> förfader till (eller samma som) HEAD? */
function arFarfader(sha) {
  const r = spawnSync("git", ["merge-base", "--is-ancestor", sha, "HEAD"], { cwd: ROTT });
  return r.status === 0;
}

function curlText(url, timeoutS = 20) {
  try {
    return execFileSync("curl", ["-s", "--max-time", String(timeoutS), url], {
      encoding: "utf8", maxBuffer: 20 * 1024 * 1024,
    });
  } catch { return null; }
}

function curlKod(url) {
  try {
    return execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  } catch { return "000"; }
}

// ── Fas 0: preflight ────────────────────────────────────────────────
log("Fas 0: preflight");
const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROTT, encoding: "utf8" }).trim();
// BUILD_ID-guard (2026-09-19, s7-u3): halvbyggt .next (OOM-dödat synkbygge)
// saknar BUILD_ID — rå readFileSync kraschade då; tydlig exit 2 i stället.
if (!existsSync(join(ROTT, ".next/BUILD_ID"))) {
  resultat.fel = ".next/BUILD_ID saknas — .next är halvbyggt (synkbygge OOM-dödat eller pågående); vägrar mäta";
  writeFileSync(UT, JSON.stringify(resultat, null, 2));
  console.error(`[efter] VÄGRAR MÄTA: ${resultat.fel}`);
  process.exit(2);
}
const buildId = readFileSync(join(ROTT, ".next/BUILD_ID"), "utf8").trim();
const prodKoder = {};
// Spegelrytterna /ar + /en med i prod-grinden (2026-09-19, s7-u3): de bär
// o75-kuren och var 500 under halvbyggs-incidenten — mätning på trasiga
// speglar är spökmät även när / /kurser /blogg svarar 200.
for (const s of ["/", "/kurser", "/blogg", "/ar", "/en"]) prodKoder[s] = curlKod(`${HTTPS}${s}`);
const farfader = Object.fromEntries(KUR_COMMITS.map((c) => [c, arFarfader(c)]));
resultat.faser.preflight = { head, buildId, prodKoder, farfader };
log(`HEAD=${head} BUILD_ID=${buildId} prod=${JSON.stringify(prodKoder)} kur-förfäder=${JSON.stringify(farfader)}`);

const prodOk = Object.values(prodKoder).every((k) => k === "200");
const kurIgång = KUR_COMMITS.every((c) => farfader[c]);
if (!prodOk || !kurIgång) {
  resultat.fel = !prodOk ? `prod ej 200 ×3: ${JSON.stringify(prodKoder)}` : `kur-commits ej förfäder till HEAD: ${JSON.stringify(farfader)}`;
  writeFileSync(UT, JSON.stringify(resultat, null, 2));
  console.error(`[efter] VÄGRAR MÄTA: ${resultat.fel}`);
  console.error("[efter] Deploy ej landad eller träd ej kurat — körs igen vid nästa deploy-fönster.");
  process.exit(2);
}
if (buildId === "5AotUdlvjeJdi4jmPz1qL") {
  resultat.fel = `BUILD_ID är fortfarande FÖRE-bygget (${buildId})`;
  writeFileSync(UT, JSON.stringify(resultat, null, 2));
  console.error(`[efter] VÄGRAR MÄTA: ${resultat.fel} — synken har inte byggt om ännu.`);
  process.exit(2);
}

// ── Fas 1: strukturbevis (curl, lastokänsligt) ─────────────────────
log("Fas 1: strukturbevis — o76 chunk-grepp + o77 SSR-svenska");
const chunkurForSida = {};
for (const sida of ["/kurser", "/blogg", "/om-oss"]) {
  const html = curlText(`${HTTPS}${sida}`);
  if (!html) { chunkurForSida[sida] = { fel: "curl misslyckades" }; continue; }
  // Alla chunk-script-src ur HTMLn (statiska + flight-emitterade syns båda som src=)
  const srcs = [...html.matchAll(/(?:src|href)="([^"]*_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => m[1]);
  const unika = [...new Set(srcs.map((u) => u.replace(/^\//, "")))];
  const fynd = [];
  for (const u of unika) {
    const js = curlText(`${HTTPS}/${u}`, 30);
    if (js && PALETT_KANTECKEN.some((k) => js.includes(k))) fynd.push({ chunk: u.split("/").pop(), kantecken: PALETT_KANTECKEN.filter((k) => js.includes(k)) });
  }
  chunkurForSida[sida] = { antalChunks: unika.length, palettChunks: fynd };
  log(`${sida}: ${unika.length} chunks i HTML, palett-kännetecken i ${fynd.length} av dem`);
}
resultat.faser.struktur = chunkurForSida;
resultat.kriterier["o76a-palett-chunk-borta"] = Object.values(chunkurForSida).every((s) => Array.isArray(s.palettChunks) && s.palettChunks.length === 0);

const startHtml = curlText(`${HTTPS}/`) ?? "";
resultat.kriterier["o77-ssr-lang-sv"] = startHtml.includes('lang="sv"');
resultat.kriterier["o77-ssr-svenskt-citat"] = startHtml.includes("Lär dig läsa bolag");
log(`o77 SSR: lang=sv ${resultat.kriterier["o77-ssr-lang-sv"] ? "✓" : "✗"} · svenskt citat ${resultat.kriterier["o77-ssr-svenskt-citat"] ? "✓" : "✗"}`);

// ── Fas 2: Lighthouse i sekvens (localhost = prod-trädet) ───────────
log("Fas 2: Lighthouse / /kurser /blogg /ar /en (sekventiellt)");
const lh = spawnSync("node", ["verktyg/prestanda-lighthouse.mjs", "s7u2-o75o76o77-efter", "/", "/kurser", "/blogg", "/ar", "/en"], {
  cwd: ROTT, stdio: "inherit", timeout: 10 * 60 * 1000,
});
resultat.faser.lighthouse = { exit: lh.status };
const lasSamman = () => {
  const p = join(ROTT, "data/forskning/OPTIMERING/lighthouse/s7u2-o75o76o77-efter-sammanfattning.json");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
};
const sammanfattning = lasSamman();
const startSida = sammanfattning?.sidor?.find?.((s) => s.sokvag === "/");
if (startSida) resultat.kriterier["o77-cls-start-noll"] = Number(startSida.karnmattMs?.CLS ?? 1) === 0;

// ── Fas 3: viewportsond /ar + /en (o75 _rsc) ────────────────────────
log("Fas 3: viewportsond /ar + /en");
for (const [namn, sida] of [["ar", "/ar"], ["en", "/en"]]) {
  const r = spawnSync("node", ["verktyg/prestanda-viewportsond.mjs", `s7u2-o75o76o77-efter-${namn}`, sida], {
    cwd: ROTT, stdio: "inherit", timeout: 4 * 60 * 1000,
  });
  const p = join(ROTT, `data/forskning/OPTIMERING/lighthouse/viewportsond-s7u2-o75o76o77-efter-${namn}.json`);
  if (existsSync(p)) {
    try {
      const d = JSON.parse(readFileSync(p, "utf8"));
      // sondens rsc-lista = prefetch-flighterna (o75 §1: 6 st FÖRE på vardera spegeln)
      const rsc = Array.isArray(d.rsc) ? d.rsc : null;
      resultat.kriterier[`o75-rsc-noll-${namn}`] = rsc === null ? undefined : rsc.length === 0;
      log(`${sida}: ${rsc === null ? "rsc-fält saknas" : `${rsc.length} _rsc-flighter (FÖRE 6)`}`);
    } catch { log(`${sida}: viewportsond-rådata osparsbar — läs manuellt`); }
  }
  if (r.status !== 0) log(`${sida}: viewportsond exit ${r.status}`);
}

// ── Fas 4: skiftsond / (o77 CLS) ────────────────────────────────────
log("Fas 4: skiftsond / 15 s");
const sk = spawnSync("node", ["verktyg/prestanda-skiftspar.mjs", "http://localhost:3000/", "15000"], {
  cwd: ROTT, stdio: "inherit", timeout: 90 * 1000,
});
resultat.faser.skiftsond = { exit: sk.status };
log("Skiftsondens utdata ovan — bokför skev-antal + score i protokollet manuellt.");

resultat.slutad = new Date().toISOString();
writeFileSync(UT, JSON.stringify(resultat, null, 2));
log(`Kriterie-JSON: ${UT}`);
log(`Sammanfattning: ${JSON.stringify(resultat.kriterier)}`);
