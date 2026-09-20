#!/usr/bin/env node
/**
 * S7-U3 O120 — EFTER-MÄTARE för o119 (NastaSteg-deferns vakarövertag).
 * =====================================================================
 * o119 (s7-u1, commit 568a93a2) lämnade EFTER-kriterier "vakarövertag-
 * barra": deployen var RAM-gated (prod-synken väntar minne). Detta
 * verktyg ÄR vakarövertaget: det pollar BUILD_ID tills prod-synken
 * landat o119-trädet (BYT från IxcwwO), och kör sedan HELA
 * EFTER-paketet från o119 §5:
 *
 *   1. BUILD_ID lämnar IxcwwO_QWK5g7r0rfK5_M (förfader 568a93a2+)
 *   2. prod 200 ×5 (https: / · /blogg · /en/blogg · /ar/blogg · /en)
 *   3. Struktur: widgetens 5 kännetecken får NY egen chunk som EJ
 *      refereras i initial SSR-HTML (FÖRE: 10f47l5mmeoxy.js med 12–17
 *      refs/sida); SSR-kontraktet kvarstår (widget-strängarna EJ i
 *      server-HTML = SSR=null bibehållen)
 *   4. Lighthouse mobil (kanoniska prestanda-lighthouse.mjs):
 *      /en/blogg n=2 + /ar/blogg + /blogg, jämförd mot o119 §2:s
 *      FÖRE-tabell (en P67/4059/876 · ar P66/4561/737 · sv P75/4232/348)
 *
 * Avslutar med sammanfattning-JSON + tydlig dom-rad per kriterium.
 * Om fönstret aldrig öppnas: skriver vakläge-JSON (senaste synkloggen)
 * och avslutar kod 0 — ALDRIG krascha, ALDRIG röra prod (läs+curl läst).
 *
 * Körning: node verktyg/_s7u3o120-eftermatare.mjs [--max-sek 900]
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROT = process.cwd();
const BUILD_ID_SOKVAG = join(ROT, ".next", "BUILD_ID");
const FORE_BUILD_ID = "IxcwwO_QWK5g7r0rfK5_M"; // o119 §2:s FÖRE-träd
const SYNKLOGG = join(ROT, "data", "vakten", "prod-synk.log");
const LH_KAT = join(ROT, "data", "forskning", "OPTIMERING", "lighthouse");
const WIDGET_STRANGAR = [
  "Håll streaken levande",
  "Fortsätt läroplanen",
  "Testa hela analysflödet",
  "Räkna på ett nytt case",
  "Djupdyk i dina innehav",
];
const FORE_FORELDER = "568a93a2"; // o119-kurens commit — måste finnas i trädet
const PROD_SIDOR = ["/", "/blogg", "/en/blogg", "/ar/blogg", "/en"];
const PROD_BAS = "https://lab.ak1nvestor.com";
const LOKAL_BAS = "http://localhost:3000";
// o119 §2 FÖRE-tabell (BUILD_ID IxcwwO, mobil, 2026-09-20 16:53 lokal)
const FORE_TABELL = {
  "/en/blogg": { poang: 67, LCP: 4059, TBT: 876, CLS: 0 },
  "/ar/blogg": { poang: 66, LCP: 4561, TBT: 737, CLS: 0 },
  "/blogg": { poang: 75, LCP: 4232, TBT: 348, CLS: 0 },
};

const maxSek = Number(
  (process.argv.find((a) => a.startsWith("--max-sek=")) || "").split("=")[1] || 900,
);
const startTs = Date.now();
const logga = (m) =>
  console.log(`${new Date().toISOString().slice(11, 19)}Z ${m}`);
const sov = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function lasBuildId() {
  try {
    return readFileSync(BUILD_ID_SOKVAG, "utf8").trim();
  } catch {
    return null;
  }
}

function httpsStatus(sokvag) {
  try {
    const ut = execFileSync(
      "curl",
      ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "15", PROD_BAS + sokvag],
      { encoding: "utf8", timeout: 20_000 },
    );
    return Number(ut);
  } catch {
    return 0;
  }
}

function hamtaHtml(sokvag) {
  return execFileSync(
    "curl",
    ["-s", "--max-time", "20", "-H", "Cache-Control: no-cache", LOKAL_BAS + sokvag],
    { encoding: "utf8", timeout: 25_000, maxBuffer: 32 * 1024 * 1024 },
  );
}

/** Hitta vilka chunks som bär widgetens kännetecken (grep-ersättning i ren node). */
function sokChunkMedStrang(strang) {
  const katalog = join(ROT, ".next", "static", "chunks");
  if (!existsSync(katalog)) return [];
  const traffar = [];
  const ga = (dir) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) ga(p);
      else if (f.name.endsWith(".js")) {
        try {
          if (readFileSync(p, "utf8").includes(strang)) traffar.push(p);
        } catch { /* binär/oläsbar — vidare */ }
      }
    }
  };
  ga(katalog);
  return traffar;
}

const resultat = { startad: new Date().toISOString(), faser: {} };

// ── Fas 0: vänta på deploy ─────────────────────────────────────────────
logga(`Väntar på BUILD_ID-byte från ${FORE_BUILD_ID} (max ${maxSek} s)…`);
let buildId = lasBuildId();
while (buildId === FORE_BUILD_ID && Date.now() - startTs < maxSek * 1000) {
  sov(15_000);
  buildId = lasBuildId();
}
resultat.faser.deploy = { buildIdFore: FORE_BUILD_ID, buildIdEfter: buildId };

if (buildId === FORE_BUILD_ID || !buildId) {
  // Fönstret öppnades aldrig — vakläge, ALDRIG fel: verktyget är kvitto redo
  const loggsvans = readFileSync(SYNKLOGG, "utf8").trim().split("\n").slice(-6);
  resultat.status = "VAKLAGE";
  resultat.synklogSvans = loggsvans;
  writeFileSync(
    join(LH_KAT, "s7u3o120-vaklage.json"),
    JSON.stringify(resultat, null, 2),
  );
  logga(`VAKLÄGE: bygg landade ej inom ${maxSek} s. Sista synkrader:`);
  for (const r of loggsvans) logga(`  ${r}`);
  logga("Återkör: node verktyg/_s7u3o120-eftermatare.mjs");
  process.exit(0);
}

logga(`DEPLOY SEDD: ${FORE_BUILD_ID} → ${buildId} — väntar 20 s på pm2-upp…`);
sov(20_000);

// ── Fas 1: förfaderskontroll (HEAD ska innehålla 568a93a2) ────────────
try {
  const ancestry = execFileSync(
    "git",
    ["merge-base", "--is-ancestor", FORE_FORELDER, "HEAD"],
    { cwd: ROT, encoding: "utf8", stdio: "ignore" },
  );
  resultat.faser.forfader = { ok: true };
} catch {
  resultat.faser.forfader = { ok: false, not: `${FORE_FORELDER} EJ förfader till HEAD` };
}
logga(`Förfader ${FORE_FORELDER}: ${resultat.faser.forfader.ok ? "OK" : "SAKNAS (bokför!"}`);

// ── Fas 2: prod 200 ×5 ────────────────────────────────────────────────
const prodStatus = {};
for (const s of PROD_SIDOR) {
  prodStatus[s] = httpsStatus(s);
  logga(`prod ${s} → ${prodStatus[s]}`);
}
resultat.faser.prod200 = {
  status: prodStatus,
  dom: Object.values(prodStatus).every((k) => k === 200) ? "GRÖN" : "RÖD",
};

// ── Fas 3: strukturkontroll (widget ur initial-graf) ──────────────────
const struktur = { sidor: {}, widgetChunks: [], foreChunkRefser: 0 };
for (const sid of ["/en/blogg", "/ar/blogg", "/blogg"]) {
  const html = hamtaHtml(sid);
  // FÖRE-chunkens id får inte finnas kvar som initial-referens
  const foreRefs = (html.match(/10f47l5mmeoxy/g) || []).length;
  // Widgetens kännetecken ska vara EJ i server-HTML (SSR=null-kontraktet)
  const iHtml = WIDGET_STRANGAR.filter((w) => html.includes(w));
  // Vilken chunk bär widgeten EFTER?
  struktur.sidor[sid] = { foreChunkRefs: foreRefs, widgetStrangarSSR: iHtml };
  struktur.foreChunkRefser += foreRefs;
}
const widgetChunks = sokChunkMedStrang(WIDGET_STRANGAR[0])
  .map((p) => p.replace(join(ROT, ".next", "static", "chunks") + "/", ""));
struktur.widgetChunks = widgetChunks;
// Refereras widget-chunken i initial HTML?
for (const [sid, d] of Object.entries(struktur.sidor)) {
  const html = hamtaHtml(sid);
  d.widgetChunkInitialRefs = widgetChunks.reduce(
    (n, c) => n + (html.includes(c) ? 1 : 0),
    0,
  );
}
resultat.faser.struktur = struktur;
const strukturDom =
  struktur.foreChunkRefser === 0 &&
  Object.values(struktur.sidor).every(
    (d) => d.widgetStrangarSSR.length === 0 && d.widgetChunkInitialRefs === 0,
  ) && widgetChunks.length >= 1
    ? "GRÖN (widget-koden i egen chunk, EJ i initial-HTML; SSR=null kvar)"
    : "AVVIKELSE — bokför och undersök";
logga(`Struktur: ${strukturDom}`);

// ── Fas 4: Lighthouse (kanoniska verktyget) n=2 en + n=1 ar/sv ────────
const lhKorningar = [
  ["s7u3o120-efter", ["/en/blogg"]],
  ["s7u3o120-efter2", ["/en/blogg"]],
  ["s7u3o120-efter", ["/ar/blogg", "/blogg"]],
];
for (const [namn, sidor] of lhKorningar) {
  try {
    logga(`Lighthouse ${namn}: ${sidor.join(" ")}`);
    execFileSync(
      "node",
      ["verktyg/prestanda-lighthouse.mjs", namn, ...sidor],
      { cwd: ROT, encoding: "utf8", timeout: 240_000, stdio: "inherit" },
    );
  } catch (e) {
    logga(`Lighthouse-fel (${namn}): ${String(e).slice(0, 200)}`);
  }
}

// ── Dom: jämför mot FÖRE-tabellen ────────────────────────────────────
const jamforelse = {};
for (const [sid, fore] of Object.entries(FORE_TABELL)) {
  const fil = join(
    LH_KAT,
    `${sid.replace(/^\//, "").replace(/\//g, "_")}-s7u3o120-efter.json`,
  );
  try {
    const r = JSON.parse(readFileSync(fil, "utf8"));
    const kat = r.categories ?? {};
    const aud = r.audits ?? {};
    const ms = (k) => (aud[k]?.numericValue != null ? Math.round(aud[k].numericValue) : null);
    const efter = {
      poang: kat.performance?.score != null ? Math.round(kat.performance.score * 100) : null,
      LCP: ms("largest-contentful-paint"),
      TBT: ms("total-blocking-time"),
      CLS: aud["cumulative-layout-shift"]?.numericValue ?? null,
    };
    jamforelse[sid] = {
      fore,
      efter,
      TBTdelta: efter.TBT != null ? efter.TBT - fore.TBT : null,
      TBTmalHT500: efter.TBT != null ? efter.TBT <= 500 : null,
      LCPprocent: efter.LCP != null && fore.LCP ? Math.round(((efter.LCP - fore.LCP) / fore.LCP) * 100) : null,
    };
  } catch {
    jamforelse[sid] = { fore, efter: "SAKNAS" };
  }
}
resultat.faser.lighthouse = jamforelse;
resultat.status = "EFTER-MÄTT";

const utfil = join(LH_KAT, "s7u3o120-efter-sammanfattning.json");
writeFileSync(utfil, JSON.stringify(resultat, null, 2));
logga(`Sammanfattning → ${utfil}`);
for (const [sid, j] of Object.entries(jamforelse)) {
  if (j.efter === "SAKNAS") { logga(`${sid}: LH saknas`); continue; }
  logga(
    `${sid}: P ${j.fore.poang}→${j.efter.poang} · LCP ${j.fore.LCP}→${j.efter.LCP} (${j.LCPprocent} %) · TBT ${j.fore.TBT}→${j.efter.TBT} (Δ${j.TBTdelta}${j.TBTmalHT500 ? " ≤500 ✓" : ""}) · CLS ${j.efter.CLS}`,
  );
}
logga("KLAR.");
