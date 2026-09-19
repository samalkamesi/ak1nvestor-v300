#!/usr/bin/env node
/**
 * PRESTANDA o82 — KLUMPKARTAREN (s7-u1, 2026-09-19)
 * Körredskap för o82-prestanda-palett-modulkarta-s7.md §5: kartlägger den
 * delade palettklumpens VERKLIGA modulinnehåll ur ett färskt prod-bygge
 * (chunks hämtas via https — .next på disk läses ALDRIG, o64/o76-precedensen
 * "aldrig mäta/sondera i byggfönster").
 *
 * Dom-logik (o82 §4:s stängningsdom är falsifierbar):
 *   - "yttor" (property-namn, överlever minifiering; källa: meny-register.ts
 *     + sokindex.ts) I klumpen  => MENY-REGISTER BINDER => stängningen STÅR
 *     (Turbopacks delade chunk, okrossbar utan arkitekturomdesign).
 *   - "yttor" EJ i klumpen men navminne+badges-kännetecken kvar => dom FALSI-
 *     FIERAD => snitt A (sektion-vidarebefodran inline-mark) + snitt B
 *     (huvudmenyns besok-import dynamisk i effect) blir meningsfulla —
 *     öppna o82-posten igen (worklog + nytt protokollstillägg).
 *   - Ingen klump alls => klumpen upplöst av framtida kur — ny karta krävs.
 *
 * Körning:  node verktyg/prestanda-o82-klumpkarta.mjs [--bas=https://…]
 * Exit:     0 = karta skriven · 2 = preflight vägrar (prod ej 200 — vänta
 *           deploy, o54-precedensen) · 3 = fetch-fel på chunk.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const BAS = (args.find((a) => a.startsWith("--bas=")) || "--bas=https://lab.ak1nvestor.com").split("=")[1];
const UT = "data/forskning/OPTIMERING/lighthouse/o82-klumpkarta.json";
const TID = new Date().toISOString();

/** Markör → modul (källunika strängar verifierade 2026-09-19, o82 §3). */
const MARKORER = {
  "meny-register(yttor)": "yttor",
  "navigationsminne": "ak1a:navigationsminne",
  "badges(streak-3)": "streak-3",
  "badges(Veckoelden)": "Veckoelden",
  "member-local": "ak1a-klara-kurser",
  "oppna-sok-familj": "ak1a:oppna-sok",
  "sokindex": "sok-index.json",
  "logo-eller-inlinemark": "skulptur-mark.jpg",
};
/** Krav för klump-identifiering: båda starka känneteckna (u2:s o76-mönster). */
const KLUMP_KRAV = ["ak1a:navigationsminne", "streak-3"];

const log = (m) => console.log(`[o82 ${new Date().toISOString().slice(11, 19)}] ${m}`);

async function henta(url) {
  const r = await fetch(url, { redirect: "follow" });
  return r;
}

// ── Fas 0: preflight — vägrar mäta fel/dött bygge ────────────────────────────
log(`Fas 0: preflight mot ${BAS}`);
for (const sida of ["/", "/kurser", "/blogg"]) {
  const r = await henta(BAS + sida).catch(() => null);
  if (!r || r.status !== 200) {
    log(`FÖRHINDRAD: ${sida} svarade ${r ? r.status : "fetch-fel"} — prod ej frisk/deployad (o54-precedensen: vänta, mät ej).`);
    process.exit(2);
  }
}
log("prod 200 ×3 ✓");

// ── Fas 1: chunklista ur /kurser-HTML ───────────────────────────────────────
const html = await (await henta(BAS + "/kurser")).text();
const chunkUrl = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)].map((m) => m[0]))];
log(`Fas 1: ${chunkUrl.length} chunks i /kurser-HTML`);

// ── Fas 2: hämta + markör_analys ─────────────────────────────────────────────
const kartor = [];
for (const url of chunkUrl) {
  const r = await henta(BAS + url).catch(() => null);
  if (!r || r.status !== 200) {
    log(`  VARNING: ${url.split("/").pop()} svarade ${r ? r.status : "fetch-fel"} — chunken saknas (halvbyggt .next? se protokoll §0)`);
    continue;
  }
  const body = await r.text();
  const traf = Number(r.headers.get("content-length") || body.length);
  const traff = Object.entries(MARKORER).filter(([, m]) => body.includes(m));
  if (traff.length) {
    kartor.push({
      chunk: url.split("/").pop(),
      byte: body.length,
      transfer: traf,
      moduler: traff.map(([namn]) => namn),
      markor: traff.map(([, m]) => m),
    });
  }
}

// ── Fas 3: klump-identifiering + dom ───────────────────────────────────────
if (!kartor.length) {
  log("FÖRHINDRAD: ingen chunk kunde analyseras (chunk-svar 500 = halvbyggt .next, se protokoll §0) — vänta prod-synkens gröna deploy, kör igen.");
  process.exit(2);
}
const klump = kartor.find((k) => KLUMP_KRAV.every((m) => k.markor.includes(m)));
let dom = "INGEN KLUMP — palettklumpen upplöst (framtida kur ätit den); ny lägeskarta krävs innan nya domar.";
if (klump) {
  dom = klump.moduler.includes("meny-register(yttor)")
    ? "BINDNING BEVISAD: meny-register ('yttor') bor i klumpen — huvudmenyns initiala registrebehov håller delade chunken emitterad på alla SeoPageShell-sidor. STÄNGNINGEN STÅR (Turbopack-ramverksgräns; se protokoll §4)."
    : "DOM FALSIMIFIERAD: meny-register ('yttor') EJ i klumpen — snitt A (sektion-vidarebefodran → inline-mark) + snitt B (huvudmenyns besok-import dynamisk) blir MENINGSFULLA. ÖPPNA o82-posten igen (protokollstillägg + worklog).";
}

// ── Fas 4: rapport ─────────────────────────────────────────────────────────
log("Fas 4: modulkarta per chunk (endast chunkar med träffar):");
for (const k of kartor.sort((a, b) => b.moduler.length - a.moduler.length)) {
  log(`  ${k.chunk} — ${k.byte} B rå · ${k.transfer} B transfer · ${k.moduler.join(", ")}`);
}
log(`DOM: ${dom}`);

const rapport = {
  protokoll: "o82-prestanda-palett-modulkarta-s7.md",
  tid: TID,
  bas: BAS,
  antalChunksIHtml: chunkUrl.length,
  klump: klump ? { chunk: klump.chunk, byte: klump.byte, transfer: klump.transfer, moduler: klump.moduler } : null,
  dom,
  chunkarMedTräffar: kartor,
};
mkdirSync(dirname(UT), { recursive: true });
writeFileSync(UT, JSON.stringify(rapport, null, 2) + "\n");
log(`Karta skriven: ${UT}`);
process.exit(0);
