#!/usr/bin/env node
/**
 * KVD — ks-05 + am-05 (spår 5, s5-u2 omgång 9, 2026-09-17). Omnumrerad från
 * ks-04 (trefaldig prefixkollision: u1:s emissionens-mekanik i registret,
 * u3:s konvertibler på disk — registerbeviset äger prefixet, omgång 4-presedens).
 * Maskinell kvalitetsgrind FÖRE registermerge (o8-mönstret + varumärkesgrind):
 *   1. strukturparitet chapters_list <-> chapters + metadata
 *   2. aritmetik — vartenda tal i texterna omräknat ( båda kurserna)
 *   3. juridikgrind (2007:528) — 0 rådgivningsfraser
 *   4. teckenvakt — 0 U+00A0, 0 kyrilliska/CJK, 0 mjuka bindestreck
 *   5. korslänkar — varje slug-referens måste finnas i registret (prefix-logik)
 *   6. språkmönster — dubbelmellanslag/kolon/versal/engelskläckor/VERSALORD
 *   7. varumärkesgrind — data/varumarke.jsons egna regexer mot ALL text
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

let FEL = 0, VARN = 0;
const fel = (m) => { console.error(`FEL: ${m}`); FEL++; };
const warn = (m) => { console.error(`VARNING: ${m}`); VARN++; };
const ok = (m) => console.log(`  ✓ ${m}`);

const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const kurser = {
  "ks-05": JSON.parse(readFileSync("data/kurser-tillagg/ks-05-covenanter-och-kreditbetyg.json", "utf8")),
  "am-05": JSON.parse(readFileSync("data/kurser-tillagg/am-05-handelsdagens-auktioner.json", "utf8")),
};
const META = {
  "ks-05": { slug: "ks-05-covenanter-och-kreditbetyg", category: "KAPITALSTRUKTUR", level: "Intermediär" },
  "am-05": { slug: "am-05-handelsdagens-auktioner", category: "AKTIEMARKNADEN I PRAKTIKEN", level: "Intermediär" },
};
const TILLATNA_VERSALER = new Set([
  "KAPITALSTRUKTUR", "AKTIEMARKNADEN", "PRAKTIKEN", "STABILITET", "RISKHANTERING", "RISKHANTERINGENS",
  "AK1A", "AKM1", "AKM2", "AK1TS", "EBITDA", "EBIT", "LÖNSAMHET", "BETEENDEFINANS",
]);

// ── 1. strukturparitet + metadata ────────────────────────────────────────
console.log("1) STRUKTUR ×2");
for (const [id, kurs] of Object.entries(kurser)) {
  const m = META[id];
  const metaFalt = [["slug", m.slug], ["category", m.category], ["level", m.level], ["chapterCount", 6], ["totalMinutes", 24], ["minutes", 24], ["xp", 50], ["weight", "—"]];
  for (const [f, v] of metaFalt) kurs[f] === v ? ok(`${id} ${f} = ${JSON.stringify(v)}`) : fel(`${id} ${f} = ${JSON.stringify(kurs[f])}, väntat ${JSON.stringify(v)}`);
  /^[a-z0-9][a-z0-9-]*$/.test(kurs.slug) ? ok(`${id} slug ren ASCII`) : fel(`${id} slug ogiltig`);
  if (register[kurs.slug]) fel(`${id} slug finns redan i registret (kollision!)`);
  else ok(`${id} slug fri i registret`);
  if (kurs.chapters_list.length !== kurs.chapters.length) fel(`${id} chapters_list ${kurs.chapters_list.length} ≠ chapters ${kurs.chapters.length}`);
  else ok(`${id} chapters_list = chapters längd`);
  kurs.chapters_list.forEach((c, i) => {
    const k = kurs.chapters[i];
    if (c.num !== k.num || c.title !== k.title || c.minutes !== k.minutes)
      fel(`${id} paritetsbrott kapitel ${c.num}: list=${JSON.stringify(c)} vs body=${JSON.stringify({ num: k.num, title: k.title, minutes: k.minutes })}`);
  });
  ok(`${id} paritet num/title/minutes ×6`);
  const saknas = kurs.chapters.filter((k) => !Array.isArray(k.blocks) || !k.intro || k.blocks.length < 2);
  saknas.length === 0 ? ok(`${id} intro + ≥2 blocks per kapitel`) : fel(`${id} kapitel utan intro/blocks: ${saknas.map((k) => k.num).join(",")}`);
  const minSum = kurs.chapters.reduce((a, k) => a + k.minutes, 0);
  minSum === 24 ? ok(`${id} kapitelminuter summerar 24`) : fel(`${id} kapitelminuter = ${minSum}`);
  const extrafalt = kurs.chapters.flatMap((k) => k.blocks).filter((b) => Object.keys(b).join(",") !== "type,content");
  extrafalt.length === 0 ? ok(`${id} blocks bär exakt type+content`) : fel(`${id} extra blockfält: ${extrafalt.length}`);
  for (const s of ["summary", "learn", "why", "history", "lynchSection", "grahamSection", "ak1Section"]) if (!kurs[s]) fel(`${id} saknar ${s}`);
  ok(`${id} summary/learn/why/history/lynch/graham/ak1 på plats`);
  for (const h of ["origin", "evolution", "modern"]) if (!kurs.history[h]) fel(`${id} history saknar ${h}`);
  ok(`${id} history origin/evolution/modern`);
}

// ── 2. aritmetik ─────────────────────────────────────────────────────────
console.log("2) ARITMETIK (texternas tal omräknade)");
const A = [
  // ks-04: räntetäckning, trösklar, spread
  ["ks04 räntetäckning", 900 / 180, 5.0],
  ["ks04 minimi-EBIT", 3.0 * 180, 540],
  ["ks04 utrymme mkr", 900 - 540, 360],
  ["ks04 utrymme andel", 360 / 900, 0.40],
  ["ks04 skuldbörda", 3600 / 900, 4.0],
  ["ks04 min-EBITDA", 3600 / 4.5, 800],
  ["ks04 EBITDA-fall andel", 100 / 900, 0.1111],
  ["ks04 IG-räntekostnad", 4000 * 0.0325, 130],
  ["ks04 HY-räntekostnad", 4000 * 0.0700, 280],
  ["ks04 ränteskillnad/år", 280 - 130, 150],
  ["ks04 femårsskillnad", 150 * 5, 750],
  ["ks04 spreadsteg procentenheter", 5.0 - 1.25, 3.75],
  ["ks04 spreadsteg kronor", 4000 * 0.0375, 150],
  // am-05: auktionsorderboken
  ["am05 budsumma", 100 + 150 + 200 + 250 + 300, 1000],
  ["am05 lössumma", 120 + 130 + 180 + 220 + 300, 950],
  ["am05 köp@101", 100 + 150, 250],
  ["am05 köp@100", 100 + 150 + 200, 450],
  ["am05 köp@99", 100 + 150 + 200 + 250, 700],
  ["am05 sälj@99", 120 + 130, 250],
  ["am05 sälj@100", 120 + 130 + 180, 430],
  ["am05 sälj@101", 120 + 130 + 180 + 220, 650],
  ["am05 sälj@102", 120 + 130 + 180 + 220 + 300, 950],
  ["am05 volym@98", Math.min(1000, 120), 120],
  ["am05 volym@99", Math.min(700, 250), 250],
  ["am05 volym@100", Math.min(450, 430), 430],
  ["am05 volym@101", Math.min(250, 650), 250],
  ["am05 volym@102", Math.min(100, 950), 100],
  ["am05 maxvolym är @100", Math.max(120, 250, 430, 250, 100), 430],
  ["am05 köpsidoöverskott", 450 - 430, 20],
];
for (const [namn, a, b] of A) {
  const diff = Math.abs(a - b);
  if (diff > 0.005) fel(`${namn}: ${a} ≠ ${b} (diff ${diff})`);
  else ok(`${namn} = ${a}`);
}
const bodyK = JSON.stringify(kurser["ks-05"]);
for (const tal of ["5,0", "540", "360", "40 procent", "4,0", "800", "11 procent", "4 000", "3,25", "130", "7,00", "280", "150", "750", "3,75 procentenheter", "3 600"])
  bodyK.includes(tal) ? ok(`ks-04 texten nämner "${tal}"`) : fel(`ks-04 texten nämner INTE "${tal}"`);
const bodyA = JSON.stringify(kurser["am-05"]);
for (const tal of ["1 000 aktier", "950", "450", "430", "700", "650", "250", "120", "102", "101", "100", "99", "98", "430 aktier", "20 omatchade bud", "09:00"])
  bodyA.includes(tal) ? ok(`am-05 texten nämner "${tal}"`) : fel(`am-05 texten nämner INTE "${tal}"`);

// ── 3. juridikgrind ──────────────────────────────────────────────────────
console.log("3) JURIDIKGRIND (2007:528)");
const texter = [];
for (const kurs of Object.values(kurser))
  texter.push(kurs.summary, kurs.learn, kurs.why, ...Object.values(kurs.history), kurs.lynchSection, kurs.grahamSection, kurs.ak1Section,
    ...kurs.chapters.flatMap((k) => [k.intro, ...k.blocks.map((b) => b.content)]));
const allText = texter.join("\n");
const radsFrasor = [/köp den här aktien/i, /sälj din aktie/i, /du (bör|borde) (köpa|sälja|investera i)/i, /rekommenderar (att )?(du )?(köper|säljer|investera)/i, /vårt (tips|råd) är (att )?köp/i, /placera dina pengar i/i];
for (const re of radsFrasor) if (re.test(allText)) fel(`rådgivningsfras matchad: ${re}`);
ok("0 rådgivningsfraser");
const nekningar = allText.match(/aldrig en uppmaning att (köpa eller sälja|handla)/g);
(nekningar ?? []).length >= 2 ? ok(`utbildningsframing i båda kurserna (${nekningar.length} nekningsfraser)`) : warn(`nekningsfraser: ${String((nekningar ?? []).length)} — kontrollera manuellt`);
for (const ord of ["köp", "sälj", "handla"]) {
  const trajffar = [...allText.matchAll(new RegExp(`[^.]*\\b${ord}\\w*[^.]*\\.`, "gi"))].map((m) => m[0].trim().slice(0, 90));
  if (trajffar.length > 4) warn(`ordet "${ord}" förekommer ${trajffar.length} gånger — kontrollera kontext`);
  else trajffar.forEach((t) => console.log(`    kontext [${ord}]: "${t}…"`));
}

// ── 4. teckenvakt ────────────────────────────────────────────────────────
console.log("4) TECKENVAKT");
const u00a0 = (allText.match(/\u00A0/g) ?? []).length;
u00a0 === 0 ? ok("0 U+00A0") : fel(`${u00a0} U+00A0`);
const kyr = (allText.match(/[\u0400-\u04FF]/g) ?? []).length;
kyr === 0 ? ok("0 kyrilliska") : fel(`${kyr} kyrilliska tecken`);
const cjk = (allText.match(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g) ?? []).length;
cjk === 0 ? ok("0 CJK") : fel(`${cjk} CJK-tecken`);
const mjukBinde = (allText.match(/\u00AD/g) ?? []).length;
mjukBinde === 0 ? ok("0 mjuka bindestreck") : fel(`${mjukBinde} mjuka bindestreck`);

// ── 5. korslänkar ────────────────────────────────────────────────────────
console.log("5) KORSLÄNKAR mot registret");
const slugRef = new Set();
for (const m of allText.matchAll(/\b([a-z]{2}-\d{2,3}[a-z0-9-]*|[a-z]{2}-\d{3})\b/g)) slugRef.add(m[1]);
const regSlugs = Object.keys(register);
let lankade = 0; const saknadeRef = [];
const SUFFIX = /-(kursen|kursens|kurs|temat|tema|blocket|familjen)$/;
const EGNA = new Set(Object.values(META).map((m) => m.slug)); // egna slugar: finns i registret EFTER denna KVD
for (const refRå of slugRef) {
  const ref = refRå.replace(SUFFIX, ""); // "st-01-kursen" = kursen st-01 (svensk sammansättning)
  const egen = [...EGNA].some((s) => s === refRå || s.startsWith(`${ref}-`) || s === ref);
  if (egen || register[ref] || regSlugs.some((s) => s === ref || s.startsWith(`${ref}-`))) lankade++;
  else saknadeRef.push(refRå);
}
saknadeRef.length === 0 ? ok(`${lankade} unika slug-referenser lever i registret (prefix-logik)`) : fel(`döda referenser: ${saknadeRef.join(", ")}`);
for (const [id, kurs] of Object.entries(kurser))
  lankadeId([kurs.summary, kurs.why, kurs.ak1Section].join(" ")) ? ok(`${id} bär korslänkar i summary/why/ak1`) : warn(`${id} tunn länkning i summary/why/ak1`);
function lankadeId(t) { return /\b[a-z]{2}-\d{2,3}\b/.test(t); }

// ── 6. språkmönster ──────────────────────────────────────────────────────
console.log("6) SPRÅKMÖNSTER");
const dubbel = (allText.match(/ {2,}(?![\s])/g) ?? []).length;
dubbel === 0 ? ok("0 dubbelmellanslag") : warn(`${dubbel} dubbelmellanslag`);
const kolon = (allText.match(/:(?![sS][ .,;:)])(?![ ])[a-zåäö]/g) ?? []).length;
kolon === 0 ? ok("0 kolon utan mellanslag (genitiv-:s undantaget)") : fel(`${kolon} kolon utan mellanslag`);
const versal = (allText.match(/[;,][A-ZÅÄÖ]/g) ?? []).length;
versal === 0 ? ok("0 versal direkt efter semikolon/komma") : fel(`${versal} versal direkt efter semikolon/komma`);
const mellanslagForeSkiljetecken = (allText.match(/ [,.;:](?=[^\d])/g) ?? []).length;
mellanslagForeSkiljetecken === 0 ? ok("0 mellanslag före skiljetecken") : warn(`${mellanslagForeSkiljetecken} mellanslag före skiljetecken`);
const engLackor = allText.match(/\b(the|and|with|of|from|that|this)\b/gi) ?? [];
engLackor.length === 0 ? ok("0 engelska funktionsord") : fel(`engelska funktionsord: ${[...new Set(engLackor.map((w) => w.toLowerCase()))].join(", ")}`);
const versaler = [...allText.matchAll(/\b[A-ZÅÄÖ]{4,}\b/g)].map((m) => m[0]);
const främstaVers = versaler.filter((v) => !TILLATNA_VERSALER.has(v) && !v.includes("-"));
främstaVers.length === 0 ? ok("0 främmande VERSALORD") : warn(`VERSALORD att granska: ${[...new Set(främstaVers)].join(", ")}`);
const aktia = (allText.match(/\baktia\b/gi) ?? []).length;
aktia === 0 ? ok("0 'aktia'-stavfel") : fel(`${aktia} 'aktia' — ska vara 'aktie'`);

// ── 7. varumärkesgrind ───────────────────────────────────────────────────
console.log("7) VARUMÄRKESGRIND (data/varumarke.json egna regexer)");
const varumarke = JSON.parse(readFileSync("data/varumarke.json", "utf8"));
let vFEL = 0, vVARN = 0;
for (const regel of varumarke.forbjudnaFraser) {
  let re;
  try { re = new RegExp(regel.fran, "gu"); } catch { re = new RegExp(regel.fran, "g"); }
  const trajffar = [...allText.matchAll(re)];
  if (trajffar.length > 0) {
    const m = `${regel.allvar} "${trajffar[0][0]}" (${regel.motiv})`;
    if (regel.allvar === "FEL") { fel(`varumärke ${m}`); vFEL++; }
    else { warn(`varumärke ${m}`); vVARN++; }
  }
}
ok(`varumärkesgrind: ${vFEL} FEL, ${vVARN} VARNING av ${varumarke.forbjudnaFraser.length} regler`);

// ── 8. sammanfattning ────────────────────────────────────────────────────
const ord = allText.split(/\s+/).filter(Boolean).length;
console.log(`\nBody+meta (båda kurser): ${ord} ord`);
console.log(`KVD: ${FEL} FEL, ${VARN} VARNING — ${FEL === 0 ? "GRÖN" : "RÖD"}`);
process.exit(FEL === 0 ? 0 : 1);
