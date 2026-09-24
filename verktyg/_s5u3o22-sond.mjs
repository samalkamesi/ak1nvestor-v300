#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789888503136, omgång 22) — SOND mot 458-registret:
 * kandidat-ämnen mot ALLA textfält (titel+summary+why+learn+slug+chapters+
 * chapters_list+sektioner+history). Kurser räknas separat från bokmaster.
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
rapport("BF-16 MÖNSTER-I-BRUS", ["mönster i brus", "apofeni", "klusterillusion", "gambler's fallacy", "gambler", "tärningen", "myntkast", "serier av slump", "hot hand", "lagen om små tal", "small numbers"]);
rapport("OD-08 PRISÄTTNINGEN", ["binomial", "binomialträdet", "put-call", "paritet", "black-scholes", "black scholes", "replikeringsportfölj", "riskneutral värdering", "optionsprissättning", "prissättning av option", "arbitragegräns", "övre och nedre gräns"]);
rapport("RP-05 FRIA VINKLAR", ["stresstest", "stress test", "svansrisk", "tail risk", "expected shortfall", "cvar", "katastrofbuffert", "maxdrawdown", "max drawdown", "förlustbudget", "riskbudget"]);
rapport("SE-21 KANDIDATER", ["läkemedelssekto", "läkemedelsindustri", "biotek", "pharma", "pipeline", "telekomsekto", "telekom", "försvarsindustri", "försvarssekto", "livsmedelssekto", "livsmedelsindustri", "energisekto", "elproduktion", "vattenkraft", "vindkraft", "bolagsstyrning"]);
rapport("EK-07 (reserv)", ["walk-forward", "gångjärn", "känslighetsanalys", "sensitivitet", "parameterstudie", "robusthet i motorn"]);
rapport("ROIC-05 (reserv)", ["kapitaliseringsgrad", "reinvesterings", "cash conversion", "kontantkonvertering", "kapitalintensitet"]);
