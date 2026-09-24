#!/usr/bin/env node
// Sond s1-u2 instans 2, 2026-09-20 — oberoende kontroll av m9-kandidaten
// branschmedianer-akm2 v2 (GRANSKNINGSKLAR i TORR-läget, md5 0431dd6c…).
// Läser ENDAST: m9-fabrikens --visa-utdata (read-only), korstabell-grund.json,
// varumarke.json, vagvalidering-SENASTE.md, disk-v2 i m9-ko/, publik fil i
// data/blogg/ (ENDAST LÄS), live-sajten via localhost.
// Skriver ENDAST till stdout. Stryr ALDRIG data/blogg/, rör ALDRIG status/kö.
//
// Ärlighetsbokföring: förstakörningen hade två sondbuggar (trailing-newline i
// --visa-parsningen samt mall-md5-radiens backtick-form) som falskt fälldes
// D6/D9/D10 — rättade + omkörda; D3/D5 omformades till FYND-kontroller när
// rotorsaken (våg-95-kommafixen) var bevisad.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const md5 = (s) => createHash("md5").update(s).digest("hex");
const R = [];
const K = (id, ok, evidens) => R.push([id, ok, evidens]);

// ---------- 0. hämta kandidaten (read-only via --visa, två körningar) ----------
function hamtaKandidat() {
  const ut = execFileSync("node", ["verktyg/m9-fabrik.mjs", "--visa", "branschmedianer-akm2"], {
    encoding: "utf8", maxBuffer: 16 * 1024 * 1024,
  });
  const tIx = ut.indexOf("═══ branschmedianer-akm2 — TITEL ═══");
  const iIx = ut.indexOf("═══ INGRESS ═══");
  const bIx = ut.indexOf("═══ BODY");
  if (tIx < 0 || iIx < 0 || bIx < 0) throw new Error("kandidatutdata kunde ej paras");
  const titel = ut.slice(tIx + "═══ branschmedianer-akm2 — TITEL ═══".length, iIx).trim();
  const ingress = ut.slice(iIx + "═══ INGRESS ═══".length, bIx).trim();
  const nlIx = ut.indexOf("\n", bIx);
  const bodyRaw = ut.slice(nlIx + 1).replace(/\n+$/, ""); // fabrikens body bär ingen trailing newline (disk-v2-paritet)
  const kandMd5Rad = ut.match(/kandidat-md5 ([0-9a-f]{32})/);
  const mallMd5Rad = ut.match(/mall-md5 `([0-9a-f]{32})`/);
  const seedRad = ut.match(/seed `([0-9a-f]{32})`/);
  return { titel, ingress, body: bodyRaw, kandMd5: kandMd5Rad?.[1], mallMd5: mallMd5Rad?.[1], seed: seedRad?.[1], raw: ut };
}
const k1 = hamtaKandidat();
const k2 = hamtaKandidat();

K("A0 determinism: --visa två körningar byte-identiska", k1.body === k2.body && k1.titel === k2.titel && k1.ingress === k2.ingress, `bodyMd5 ${md5(k1.body)} == ${md5(k2.body)}`);
K("A1 kandidatens self-declared kandidat-md5 närvarande", k1.kandMd5 === "0431dd6c885861fa3b03fc1c70f6eb8a", k1.kandMd5 ?? "SAKNAS");
K("A2 TORR-status GRANSKNINGSKLAR (inte OFÖRÄNDRAT)", /branschmedianer-akm2 — GRANSKNINGSKLAR/.test(k1.raw) && !/branschmedianer-akm2 — OFÖRÄNDRAT/.test(k1.raw), "");

// ---------- B. källintegritet ----------
const korstRaw = readFileSync("data/portfolj-system/korstabell-grund.json", "utf8");
const korst = JSON.parse(korstRaw);
const vmRaw = readFileSync("data/varumarke.json", "utf8");
const vvRaw = readFileSync("data/rapporter/vagvalidering-SENASTE.md", "utf8");
const kvittoKallor = [...k1.body.matchAll(/([\w/.-]+\.json|[\w/.-]+\.md) \(md5 ([0-9a-f]{32})/g)].map((m) => [m[1], m[2]]);
const kvitto = Object.fromEntries(kvittoKallor);

K("B1 källa korstabell-grund.json md5 == kvitto", kvitto["data/portfolj-system/korstabell-grund.json"] === md5(korstRaw), `${md5(korstRaw)} vs kvitto ${kvitto["data/portfolj-system/korstabell-grund.json"]}`);
K("B2 källa varumarke.json md5 == kvitto", kvitto["data/varumarke.json"] === md5(vmRaw), `${md5(vmRaw)} vs kvitto ${kvitto["data/varumarke.json"]}`);
K("B3 källa vagvalidering-SENASTE.md md5 == kvitto", kvitto["data/rapporter/vagvalidering-SENASTE.md"] === md5(vvRaw), `${md5(vvRaw)} vs kvitto ${kvitto["data/rapporter/vagvalidering-SENASTE.md"]}`);
K("B4 korstabellen skapad 2026-09-03 (referens-datum)", korst.skapad === "2026-09-03" && k1.body.includes("underlag skapat 2026-09-03"), korst.skapad);

// ---------- C. statistik-spegel: oberoende omräkning ur korstabellen ----------
function egenKortNamn(namn) {
  let n = String(namn).replace(/\s*\(publ\)\s*$/i, "").replace(/^\s*AB\s+/i, "").replace(/\s+AB$/i, "").trim();
  const suffix = /\s*,?\s+(Inc\.|Corporation|A\/S|Abp|Oyj|ASA|NV|S\.A\.|PLC|LLC|Aktiengesellschaft|SE & Co\. KGaA)$/i;
  while (suffix.test(n)) n = n.replace(suffix, "").trim();
  return n;
}
function egenMedian(tal) {
  const s = [...tal].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
const grupper = new Map();
for (const rad of korst.rader) {
  if (!grupper.has(rad.bransch)) grupper.set(rad.bransch, []);
  grupper.get(rad.bransch).push(rad);
}
const perBransch = {};
for (const [b, g] of grupper) {
  const matta = g.filter((r) => typeof r.akm2 === "number" && Number.isFinite(r.akm2));
  perBransch[b] = {
    median: egenMedian(matta.map((r) => r.akm2)),
    matta: matta.length, iGruppen: g.length,
    min: Math.min(...matta.map((r) => r.akm2)), max: Math.max(...matta.map((r) => r.akm2)),
    minBolag: egenKortNamn(matta.reduce((lo, r) => (r.akm2 < lo.akm2 ? r : lo), matta[0]).namn),
    maxBolag: egenKortNamn(matta.reduce((hi, r) => (r.akm2 > hi.akm2 ? r : hi), matta[0]).namn),
  };
}
K("C1 universum 100 rader i 10 grupper × 10", korst.rader.length === 100 && grupper.size === 10 && [...grupper.values()].every((g) => g.length === 10), `${korst.rader.length} rader · ${grupper.size} grupper · ${[...grupper.values()].map((g) => g.length).join("/")}`);

const BRANSCH_NAMN = { teknik: "teknik", konsument: "konsument", industri: "industri", kommunikation: "kommunikation", energi: "energi", halso: "hälsa", fastighet: "fastighet", tillvaxt: "tillväxt", material: "material", finans: "finans" };
let cIx = 2;
for (const [b, s] of Object.entries(perBransch)) {
  const namn = BRANSCH_NAMN[b] ?? b;
  const tal = (v) => String(v).replace(".", ",");
  const rad = `- **${namn}** — median **${tal(s.median)}** · ${s.matta} mätta av ${s.iGruppen} · spridning ${tal(s.min)}–${tal(s.max)} (lägst ${s.minBolag}, högst ${s.maxBolag})`;
  K(`C${cIx} grupp ${b}: ${rad.replace(/\*\*/g, "")}`, k1.body.includes(rad), k1.body.includes(rad) ? "EXAKT" : `SAKNAS — min beräkning: ${rad}`);
  cIx++;
}
K("C12 första meningens 10 medianer i sorteringsordning (median sjunkande, tie localeCompare)", (() => {
  const sorterade = Object.entries(perBransch).sort((a, b) => (b[1].median ?? -Infinity) - (a[1].median ?? -Infinity) || a[0].localeCompare(b[0]));
  const tal = (v) => String(v).replace(".", ",");
  const vantan = sorterade.map(([b, s]) => `**${BRANSCH_NAMN[b] ?? b} ${tal(s.median)}**`).join(" · ");
  return k1.body.includes(vantan);
})(), "10-värdeslistan exakt");
K("C13 'Högst median: teknik 61. Lägst: finans 41.'", (() => {
  const sorterade = Object.entries(perBransch).sort((a, b) => (b[1].median ?? -Infinity) - (a[1].median ?? -Infinity) || a[0].localeCompare(b[0]));
  const ho = sorterade[0], lo = sorterade[sorterade.length - 1];
  const vantan = `Högst median: ${BRANSCH_NAMN[ho[0]]} ${String(ho[1].median).replace(".", ",")}. Lägst: ${BRANSCH_NAMN[lo[0]]} ${String(lo[1].median).replace(".", ",")}.`;
  return k1.body.includes(vantan);
})(), "");
K("C14 ingressens fyra ledande värde == spegelns topp 4 (median-sjunkande)", (() => {
  const sorterade = Object.entries(perBransch).sort((a, b) => (b[1].median ?? -Infinity) - (a[1].median ?? -Infinity) || a[0].localeCompare(b[0]));
  const vantan = sorterade.slice(0, 4).map(([b, s]) => `${BRANSCH_NAMN[b] ?? b} ${String(s.median).replace(".", ",")}`).join(", ");
  return k1.ingress.includes(vantan) && k1.ingress.includes("med flera");
})(), k1.ingress);
K("C15 PEER_MIN_GRUPP=5: alla 10 grupper ≥ 5 mätta (10 rapporterade)", Object.values(perBransch).every((s) => s.matta >= 5), Object.values(perBransch).map((s) => s.matta).join("/"));
K("C16 jämförbarhetsnot: investmentbolag == exakt Industrivärden (industri) + Investor (finans)", (() => {
  const inv = korst.rader.filter((r) => /industrivärden|investor ab/i.test(r.namn || ""));
  const vantan = inv.map((r) => `${egenKortNamn(r.namn)} (${BRANSCH_NAMN[r.bransch]})`).join(" och ");
  return inv.length === 2 && k1.body.includes(`En jämförbarhetsnot: ${vantan} är investmentbolag`);
})(), (() => {
  const inv = korst.rader.filter((r) => /industrivärden|investor ab/i.test(r.namn || ""));
  return inv.map((r) => `${egenKortNamn(r.namn)} (${r.bransch})`).join(" + ");
})());

// ---------- D. "Ingen median rörde sig" + GRANSKNINGSKLAR-rot ----------
const publik = JSON.parse(readFileSync("data/blogg/branschmedianer-akm2.json", "utf8")); // ENDAST LÄS
const pubStat = publik.fabrik?.statistik ?? null;
K("D1 publik fabrik.statistik finns (jämförelsebas)", !!pubStat, pubStat ? Object.keys(pubStat).join(",") : "SAKNAS");
K("D2 påstående 'Ingen branschmedian rörde sig': samtliga 10 medianer == publik utgåva", (() => {
  if (!pubStat) return false;
  return Object.entries(perBransch).every(([b, s]) => pubStat.perBransch?.[b]?.median === s.median);
})(), Object.entries(perBransch).map(([b, s]) => `${b}:${s.median}↔${pubStat?.perBransch?.[b]?.median ?? "?"}`).join(" "));

function faltSkillnader() {
  const skillnader = [];
  for (const [b, s] of Object.entries(perBransch)) {
    const p = pubStat?.perBransch?.[b];
    if (!p) continue;
    for (const f of ["median", "matta", "iGruppen", "min", "max", "minBolag", "maxBolag"]) {
      if (p[f] !== s[f]) skillnader.push(`${b}.${f}: ${JSON.stringify(p[f])} → ${JSON.stringify(s[f])}`);
    }
  }
  return skillnader;
}
K("D3 FYND våg-95-kommafix: exakt 2 namnskillnader mot publik (Prologis,/WBD, → rena namn), inga andra fält", (() => {
  const vantan = [
    'fastighet.minBolag: "Prologis," → "Prologis"',
    'kommunikation.minBolag: "Warner Bros. Discovery," → "Warner Bros. Discovery"',
  ];
  return JSON.stringify(faltSkillnader()) === JSON.stringify(vantan);
})(), faltSkillnader().join(" · ") || "0 skillnader");

K("D4 GRANSKNINGSKLAR-rot: publik statistik nyckeluppsättning == kandidatkonstruktionen (annars falsk förändring)", (() => {
  if (!pubStat) return false;
  return JSON.stringify(Object.keys(pubStat)) === JSON.stringify(["universum", "referens", "perBransch", "rapporteradeGrupper", "gransGrupp"]);
})(), `publik: ${pubStat ? Object.keys(pubStat).join(",") : "—"}`);
K("D5 GRANSKNINGSKLAR-rot: stringify-skillnaden försvinner när publikens två kvarlämnade komman stryks (äkta namnfix, ej nyckelordnings-artefakt)", (() => {
  if (!pubStat) return false;
  const egen = { universum: korst.rader.length, referens: `${korst.skapad} · ${korst.rader.length}-bolagsuniversum`, perBransch, rapporteradeGrupper: Object.values(perBransch).filter((x) => x.matta >= 5).length, gransGrupp: 5 };
  const publikFixad = JSON.parse(JSON.stringify(pubStat).replace('"Prologis,"', '"Prologis"').replace('"Warner Bros. Discovery,"', '"Warner Bros. Discovery"'));
  return JSON.stringify(egen) === JSON.stringify(publikFixad);
})(), "kommafixad publik == spegel: jämförelse grön");

const disk2 = JSON.parse(readFileSync("data/blogg-utkast/m9-ko/branschmedianer-akm2-v2.json", "utf8"));
K("D6 disk-v2 bodyMarkdown == kandidatens body (byte-identisk, newline-normaliserad)", disk2.bodyMarkdown === k1.body, `disk ${disk2.bodyMarkdown.length} tecken == kandidat ${k1.body.length} tecken`);
K("D7 disk-v2.fabrik.seed == kandidat-seed == 904e0fcc…", disk2.fabrik?.seed === k1.seed && k1.seed === "904e0fcc917798642aa9bd0a1c44d04b", `${disk2.fabrik?.seed} / ${k1.seed}`);
K("D8 disk-v2.fabrik.kallor md5 == kandidatens källor", (() => {
  return (disk2.fabrik?.kallor ?? []).every((k) => kvitto[k.fil] === k.md5) && (disk2.fabrik?.kallor ?? []).length === 3;
})(), "");
K("D9 mall-md5 == 7b4a313a… (kandidatens kvitto == disk-v2:s kvitto)", k1.mallMd5 === "7b4a313a35ac6fb77204db4e176eb1a9" && k1.body.includes("7b4a313a35ac6fb77204db4e176eb1a9"), k1.mallMd5);
K("D10 kandidat-md5 reproducerad ur egna komponenter (full determinism-kedja)", (() => {
  try {
    const urdrag = disk2.fabrik.urdrag.map((u) => ({ varde: u.varde, datum: u.datum, notering: u.notering }));
    const statistik = { universum: korst.rader.length, referens: `${korst.skapad} · ${korst.rader.length}-bolagsuniversum`, perBransch, rapporteradeGrupper: Object.values(perBransch).filter((s) => s.matta >= 5).length, gransGrupp: 5 };
    const rekonstruerad = md5(JSON.stringify({ slug: "branschmedianer-akm2", titel: k1.titel, ingress: k1.ingress, bodyMarkdown: k1.body, statistik, urdrag, kallor: disk2.fabrik.kallor, seed: k1.seed, version: "m9-fabrik-v2" }));
    return rekonstruerad === k1.kandMd5;
  } catch { return false; }
})(), k1.kandMd5);
const publikBodyKomma = (publik.body ?? "").includes("Prologis,") || (publik.body ?? "").includes("Warner Bros. Discovery,");
K("D11 publik body komma-status dokumenterad (läsar-synlighet av fixen)", true, publikBodyKomma ? "komma kvar I publik body (synlig skillnad vid nästa publicering)" : "publik body ren (b375518) — kommat lever endast kvar i fabrik.statistik (osynligt för läsare)");

// ---------- E. juridik (2007:528) + 911 ----------
const varumarke = JSON.parse(vmRaw);
function kontrolleraText(text) {
  const fel = [], varningar = [];
  for (const { fran, istallet, allvar } of varumarke.forbjudnaFraser) {
    const re = new RegExp(fran, "gu");
    let m;
    while ((m = re.exec(text)) !== null) {
      const t = { fras: m[0], index: m.index, allvar, ersattning: istallet };
      if (allvar === "FEL") fel.push(t); else varningar.push(t);
    }
  }
  return { fel, varningar };
}
const helText = k1.titel + "\n" + k1.ingress + "\n" + k1.body;
const kt = kontrolleraText(helText);
K("E1 kontrolleraText (spegel av varumarke.ts, hel text) FEL = 0", kt.fel.length === 0, JSON.stringify(kt.fel));
K("E2 kontrolleraText VARNINGAR = 0", kt.varningar.length === 0, JSON.stringify(kt.varningar));
const glossor = ["köp", "sälj", "rekommendera", "bör du", "aktietips", "kursmål", "riskfri", "säker vinst", "garanterad avkastning"];
const glossTräff = [];
for (const g of glossor) {
  const re = new RegExp(g.replace(/[åäö]/gi, (c) => `[${c.toLowerCase()}${c.toUpperCase()}]`), "gi");
  const mm = helText.match(re);
  if (mm) glossTräff.push(`${g}: ${mm.length}`);
}
K("E3 rådgivningsglossor = 0 träffar", glossTräff.length === 0, glossTräff.join(" · ") || "0 träffar");
const irAll = [...helText.matchAll(/investeringsråd\w*/gi)].map((m) => m.index);
const irKontext = irAll.map((i) => helText.slice(Math.max(0, i - 60), i + 25).replace(/\n/g, " "));
K("E4 'investeringsråd' endast NEGERAT", irAll.length > 0 && irKontext.every((kx) => /\b(inte|ej|aldrig|ingen)\b/i.test(kx)), irKontext.map((kx) => "…" + kx.trim()).join(" ‖ "));
const lagrum = ["2007:528", "2022:260", "2022:261", "1985:716", "2005:59", "2022:482"];
const lagTräff = lagrum.filter((l) => helText.includes(l));
K("E5 endast lagrum 2007:528 (ingen blandning)", lagTräff.length === 1 && lagTräff[0] === "2007:528", lagTräff.join(","));
const p911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
const t911 = p911.filter((p) => k1.raw.toLowerCase().includes(p.toLowerCase()));
K("E6 911-referenser = 0 (sex mönster, hela utdata)", t911.length === 0, t911.join(",") || "0 träffar");

// ren body (kvitto strippat) — exportform
const start = k1.body.indexOf("## Granskningsunderlag — maskinens kvitto");
const statusRad = k1.body.indexOf("- **Status:**", start);
const slut = k1.body.indexOf("\n", statusRad) + 1;
const renBody = (k1.body.slice(0, start) + k1.body.slice(slut)).replace(/\n{3,}/g, "\n\n").trim() + "\n";
K("E7 kvitto-avsnitt hittat + strippat (start→status-rad)", start > 0 && statusRad > start, `body ${k1.body.length} → ${renBody.length} tecken`);
K("E8 negerad disclaimer SIST i ren body", /aldrig investeringsrådgivning \(lagen 2007:528\)\._\s*$/.test(renBody), renBody.trimEnd().slice(-100));
const rubriker = [...renBody.matchAll(/^## /gm)].length;
K("E9 ren body ≥ 2 '##'-rubriker (kandidat: 4)", rubriker >= 2, String(rubriker));
K("E10 ren body ≥ 800 tecken", renBody.length >= 800, String(renBody.length));
K("E11 titelkonvention: 'september 2026' + '(utkast)'", k1.titel.includes("september 2026") && k1.titel.includes("(utkast)"), k1.titel);

// ---------- F. länkar (3 interna, mot levande sajten) ----------
const lankar = [...k1.body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
for (const l of lankar) {
  let status = "FEL";
  try {
    const sv = await fetch(`http://localhost:3000${l}`, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(8000) });
    status = String(sv.status);
  } catch (e) { status = `FEL: ${e.name}`; }
  K(`F länk ${l} HTTP 200`, status === "200", status);
}
K("F4 exakt 3 interna länkar (Fördjupa dig)", lankar.length === 3, lankar.join(", "));

// ---------- G. diff disk-v2 → kandidat (rad-nivå) ----------
const aR = disk2.bodyMarkdown.split("\n");
const bR = k1.body.split("\n");
const aSet = new Map(); aR.forEach((l, i) => { if (!aSet.has(l)) aSet.set(l, []); aSet.get(l).push(i); });
const bSet = new Map(); bR.forEach((l, i) => { if (!bSet.has(l)) bSet.set(l, []); bSet.get(l).push(i); });
const enbartA = aR.filter((l) => !bSet.has(l));
const enbartB = bR.filter((l) => !aSet.has(l));
K("G1 diff disk-v2 → kandidat: 0 rader enbart i disk, 0 enbart i kandidat (byte-identiska)", enbartA.length === 0 && enbartB.length === 0, `enbart disk: ${enbartA.length} · enbart kandidat: ${enbartB.length}`);
const diffDetalj = { raderDisk: aR.length, raderKandidat: bR.length, enbartDisk: enbartA, enbartKandidat: enbartB };

// ---------- rapport ----------
let pass = 0, fail = 0;
console.log("═══ SOND s1-u2 instans 2 — branschmedianer-akm2 v2-KANDIDAT ═══");
for (const [id, ok, ev] of R) {
  console.log(`${ok ? "PASS" : "FEL "} · ${id}${ev ? ` — ${ev}` : ""}`);
  ok ? pass++ : fail++;
}
console.log(`═══ ${pass} PASS · ${fail} FEL av ${R.length} ═══`);
console.log("DIFF-detalj: " + JSON.stringify(diffDetalj).slice(0, 2000));
console.log("bodyMd5(kandidat): " + md5(k1.body));
console.log("renBodyMd5: " + md5(renBody));
process.exit(fail === 0 ? 0 : 1);
