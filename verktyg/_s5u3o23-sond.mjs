#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789910709805, omgång 23) — SOND mot registret:
 * kandidat-ämnen mot ALLA textfält (titel+summary+why+slug+chapters+
 * chapters_list+sektioner+history). Kurser räknas separat från bokmaster.
 * Källval: o22-kvar-listan (rp-06/pe-07/ib-06/kt-08/vr-09/ks-09/am-09,
 * ek-07, roic-05, bf-17+, se-22+, od-09+).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));

function textAv(p) {
  const c = p.chapters_list ?? [];
  const ch = p.chapters ?? [];
  return [
    p.slug, p.title ?? p.titel, p.summary, p.why, p.learn,
    ...(Array.isArray(c) ? c.map((x) => x && x.title) : []),
    ...(Array.isArray(ch) ? ch.map((x) => x && (x.title + " " + x.intro + " " + (x.blocks ?? []).map((b) => b.content).join(" "))) : []),
    p.lynchSection, p.grahamSection, p.ak1Section,
    p.history ? [p.history.origin, p.history.evolution, p.history.modern].join(" ") : "",
  ].filter(Boolean).join(" \n ").toLowerCase();
}

const TEXTER = Object.fromEntries(Object.entries(reg).map(([slug, p]) => [slug, textAv(p)]));
const arKurs = (slug) => /^(v\d{2}|km-|ts-|pc-|rk-|pf-|se-|sj-|bf-|mk-|vm-|ud-|bk-|ln-|st-|tx-|ks-|rs-|mt-|kt-|am-|vr-|ib-|pe-|roic-|ma-|od-|ek-|rp-)/.test(slug);

function sond(fras) {
  const traf = [];
  for (const [slug, t] of Object.entries(TEXTER)) if (t.includes(fras.toLowerCase())) traf.push(slug);
  return traf;
}
function rapport(namn, fraser) {
  console.log("═══ " + namn);
  for (const f of fraser) {
    const t = sond(f);
    const kurser = t.filter(arKurs);
    const bokor = t.length - kurser.length;
    console.log("  »" + f + "«: " + t.length + " träffar (" + kurser.length + " kurser, " + bokor + " övrig/bok) " + (kurser.length ? "→ " + kurser.slice(0, 6).join(", ") + (kurser.length > 6 ? " …" : "") : ""));
  }
}

console.log("Register: " + Object.keys(reg).length + " poster");

// ── Serieinventering: nästa lediga nummer per kvar-listans familj ────────────
const FAMILJER = ["am-", "kt-", "vr-", "ks-", "rp-", "pe-", "ib-", "ek-", "roic-", "bf-", "se-", "od-"];
for (const pre of FAMILJER) {
  const led = Object.keys(reg).filter((s) => s.startsWith(pre)).sort();
  console.log("SERIE " + pre + ": " + led.length + " st → " + led.join(", "));
}

// ── AM-09-kandidater (AKTIEMARKNADEN I PRAKTIKEN — u1-notis: marginalhandel fri) ─
rapport("AM-09 MARGINAL/BLANKNING", ["marginalhandel", "handel på marginal", "blankning", "blankare", "kort ränta", "covered call", "utlåning av aktier", "aktieutlåning", "lånekostnad", "squeeze", "kortränta"]);
rapport("AM-09 HANDELSPLATSER", ["mörk likviditet", "dark pool", "handelssystem", "kopplad handel", "MTF", "reglerad marknad", "auktionsmodell", "kontinuerlig handel", "öppningsauktion", "stängningsauktion"]);
rapport("AM-09 RÖRELSE-MEKANIK", ["högfrekvens", "algoritmisk handel", "latens", " mikrostruktur", "orderflöde", "published depth", "djup i orderboken", "nivå 2"]);

// ── KT-08-kandidater (KATALYSATOR) ────────────────────────────────────────────
rapport("KT-08 REAKTIONER", ["efterrabatt", "drift", "reaktionströghet", "tillfälles-", "post-earnings", "efterföljande rörelse", "undereaktion", "överreaktion", "kalender-, månadsskifte", "januarieffekt"]);
rapport("KT-08 TIDSBUNDNA", ["optionsförfall", "förfallodag", "triple witching", "gammaexponering", "vix-förfall", "utdelningsdag", "ex-dag", "stämdag"]);
rapport("KT-08 MAKRO-UTSLIPP", ["penningpolitiksmöte", "räntebeslut", "inflationsrapport", "arbetsmarknadsdata", "syskonkatalysator", "katalysatorkalender"]);

// ── VR-09-kandidater (VÄRDERING) ─────────────────────────────────────────────
rapport("VR-09 SUMMA-DELAR", ["summan av delarna", "sum-of-the-parts", "sotp", "delvärdering", "konglomeratrabatt", "holdingrabatt", "conglomerate"]);
rapport("VR-09 AVKASTNING-KRAV", ["avkastningskrav", "kapitalkostnad", "wacc", "riskjusterad diskonteringsränta", "beta justerad", "bygga diskonteringsränta"]);
rapport("VR-09 MULTIPLÅTERGÅNG", ["mean reversion", "medelvärdesåtergång", "multipelåtergång", "normaliserad multipel", "multipelkompression", "re-rating", "rerating"]);

// ── Reserver: ek-07 / roic-05 / ks-09 / bf-17 ────────────────────────────────
rapport("EK-07 WALK-FORWARD", ["walk-forward", "gångjärn", "out-of-sample", "urvals_accept", "överanpassning", "overfitting"]);
rapport("ROIC-05", ["kapitalintensitet", "kapitaliseringsgrad", "reinvesteringsgrad", "kassakonvertering", "cash conversion", "inkrementellt kapital"]);
rapport("KS-09", ["ränteswap", "räntesäkring", "räntebindningstid", "löptid på skuld", "skuldförfallo", "finansiell flexibilitet"]);
rapport("BF-17", ["ankare", "ankartänkande", "anchoring", "tillgänglighets", "representativitet", "bekräftelsebias", "ägobias", "Dispositionseffekt"]);
