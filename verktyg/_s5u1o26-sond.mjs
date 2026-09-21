#!/usr/bin/env node
/**
 * s5-u1 omgång 26 (manifest auto-s5-1789989925484) — SOND: hitta kurs-yta
 * med 0 kursägare i registret. Söker title/summary/why/learn + kapiteltext
 * i public/deep-courses.json per nyckelordsfamilj.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const slugs = Object.keys(reg);
console.log("Register: " + slugs.length + " kurser");

const textAv = (k) =>
  [
    k.title, k.summary, k.why, k.learn,
    ...(k.chapters?.map((c) => c.title + " " + (c.intro || "") + " " + (c.blocks || []).map((b) => b.content || "").join(" ")) || []),
  ].join(" \n ").toLowerCase();

// Kandidatfamiljer: [namn, nyckelord, familjeprefix-nästa]
const KANDIDATER = [
  ["BANKSEKTORN (se-24?)", ["banksektorn", "kreditförlust", "utlåningsgrad", "nätlån", "kapitaltäckning", "inlåningsmarginal", "ki-tal"], "se-"],
  ["NÄTVERKSEFFEKT (mt-09?)", ["nätverkseffekt", "nätverkseffekter", "plattformsfördel"], "mt-"],
  ["VOLATILITETSYTA (od-10?)", ["volatilitetsyta", "volatility smile", "skew", "volatilitetssmile"], "od-"],
  ["SPIN-OFF (kt-10?)", ["avknoppning", "spin-off", "spin off"], "kt-"],
  ["OLJEPRIS (mk-13?)", ["oljepris", "råolja", "oljeexport"], "mk-"],
  ["LEASING (st-07?)", ["leasing", "leasad", "off-balance"], "st-"],
  ["3:12 (sj-08?)", ["3:12", "ägandelön", "fåmansbolag"], "sj-"],
  ["MÖRKA POOLER (am-10?)", ["mörk pool", "mörka pooler", "orderdjup"], "am-"],
  ["BANK — bred sond", ["bank", "bankernas", "bankräkning"], "se-"],
  ["TELEKOM (se-24 alt)", ["telekom", "teleoperatör", "mobilnät"], "se-"],
  ["LIVSMEDEL (se-24 alt)", ["livsmedelssektorn", "livsmedelsindustri", "dagligvaruhandel"], "se-"],
  ["LÄKEMEDEL (se-24 alt)", ["läkemedelssektorn", "läkemedelsbolag", "pipeline-substans"], "se-"],
  ["GOODWILL (bk-09?)", ["goodwill", "immateriell", "impairment"], "bk-"],
  ["REBALANSERING (pf-16?)", ["rebalansering", "återbalansering"], "pf-"],
  ["PENSIONSSKULD (st-07 alt)", ["pensionsskuld", "pensionsåtagande", "pensionskostnad"], "st-"],
];

for (const [namn, ord, fam] of KANDIDATER) {
  console.log("\n═══ " + namn);
  for (const ord1 of ord) {
    const aggare = slugs.filter((s) => textAv(reg[s]).includes(ord1));
    const iTitel = aggare.filter((s) => (reg[s].title || "").toLowerCase().includes(ord1));
    console.log(
      "  «" + ord1 + "»: " + aggare.length + " kurser" +
      (aggare.length ? " → " + aggare.slice(0, 6).join(", ") + (aggare.length > 6 ? " …" : "") : " — 0 ÄGARE") +
      (iTitel.length ? " [titel: " + iTitel.slice(0, 3).join(", ") + "]" : "")
    );
  }
  // Familjens nuvarande läge i registret
  const famSlugs = slugs.filter((s) => s.startsWith(fam));
  console.log("  familj " + fam + ": " + famSlugs.length + " kurser, sista: " + famSlugs.slice(-4).join(", "));
}
