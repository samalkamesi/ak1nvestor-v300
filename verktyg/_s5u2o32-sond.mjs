#!/usr/bin/env node
/**
 * SOND för s5-u2 (omgång 32, manifest auto-s5-1790811909094) — vitfläckskarta
 * mot 501-registret (public/deep-courses.json, ALLA textfält) inför val av
 * +2 kurser med varför-rader. Disk-först-doktrinen: resultatet pekar ut ytan;
 * anspråksfilen klaimar den FÖRE byggstart.
 *
 * Kör: node verktyg/_s5u2o32-sond.mjs
 */
import { readFileSync } from "node:fs";

const dc = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
const slugs = Object.keys(dc);
console.log("registerläge:", slugs.length);

/** Serialisera ALL text i en kurs (titel → kapitel). */
const blob = {};
for (const s of slugs) blob[s] = JSON.stringify(dc[s]).toLowerCase();

function agare(term) {
  const t = term.toLowerCase();
  return slugs.filter((s) => blob[s].includes(t));
}

// ── 1. Kandidat-probe: term → ägare ─────────────────────────────────────────
const kandidater = [
  // konkurs / kredit / obligationer
  "konkurs", "rekonstruktion", "företagsrekonstruktion", "konkursordning",
  "företrädde", "obligation", "företagsobligation", "high yield",
  "obligationsmarknad", "kreditspread", "stigande ränta",
  // emission / aktieägande
  "emission", "nyemission", "riktad emission", "teckningsrätt",
  "utspädning", "ägarandel", "klottering",
  // ränta / makro
  "avkastningskurva", "inverted yield", "kvantitativ lättnad",
  "styrränta", "repos", "penningpolitisk", "kreditväxt",
  // värdering
  "reverserad dcf", "magisk formel", "kapitalisering", "benjamin",
  "yttersta granne", "sannolikhetsviktad", "förväntat värde",
  // beteende
  " överconfidence", "självöverskattning", "bekräftelsebias", "bakslag",
  "fomo", "spärrfälta", "mentalt stopp", "förlustaversion",
  // praktisk handel
  "courtage", "depå", "ISK", "KF", "mörk pool", "handelsplats",
  "likviditetsgarant", "best bindningstid", "orderdjup",
  // läsvanor / information
  "finansiell kalender", "rapportkalender", "intervju", "investor relations",
  "analysmöte", "telefonkonferens", "presentation", "webcast",
  // miljö / hållbarhet / räknandet
  "hållbarhetsredovisning", "csrd", "värdekedja", "kretslopp",
  // svensk skatt ytterligare
  "skattefritt", "utdelningsskatt", "kapitalvinstskatt", "deposition",
  "schablonintäkt", "insamlingskrav",
  // portfölj
  "rebalansering", "återbalansering", "taksättning", "drawdown",
  "maxdra", "sänka", "riskbudget",
];

console.log("\n═ PROBE: kandidatterm → ägande (0 = vit fläck) ═");
for (const k of kandidater) {
  const a = agare(k);
  const mark = a.length === 0 ? "  ← VIT FLÄCK" : a.length <= 2 ? "  ← TUNNT" : "";
  console.log(`«${k}»: ${a.length}${mark} ${a.length > 0 && a.length <= 6 ? "→ " + a.join(", ") : ""}`);
}

// ── 2. Tunnaste kategorierna (lärvägsdjup per profil) ───────────────────────
const kat = {};
for (const s of slugs) kat[dc[s].category] = (kat[dc[s].category] || 0) + 1;
console.log("\n═ KATEGORIER (tunnaste först) ═");
for (const [k, v] of Object.entries(kat).sort((a, b) => a[1] - b[1])) console.log(`${v}\t${k}`);

// ── 3. Serieändar: familj → högsta nummer (nästa steg-lediga) ───────────────
console.log("\n═ SERIEÄNDAR (prefix → högsta nummer) ═");
const serier = ["ln", "st", "ib", "roic", "tx", "ma", "od", "vm", "sj", "ek", "rp", "kt", "am", "bk", "rs", "mt", "ks", "ud", "pe", "bf", "se", "vr"];
for (const p of serier) {
  const n = slugs.filter((s) => new RegExp("^" + p + "-[0-9]{2}").test(s))
    .map((s) => parseInt(s.slice(p.length + 1, p.length + 3), 10));
  if (n.length) console.log(`${p}: ${n.length} st, högsta ${p}-${String(Math.max(...n)).padStart(2, "0")}`);
}
