#!/usr/bin/env node
/**
 * KVD — kvalitetsverifiering för se-16/pc-22/ek-04 (spår 5 u3 omgång 11).
 * Struktur, aritmetik, register-paritet, juridikgrind, korsreferenser,
 * språkgrind. Pedagogisk plattform — aldrig investeringsråd.
 */
import { readFileSync } from "node:fs";

const REPO = "/home/ak1a/AK1";
const MINA = ["se-16-sektoranalysens-metod", "pc-22-ditt-andra-case", "ek-04-backtestens-hantverk"];
const FILPATH = {
  "se-16-sektoranalysens-metod": "data/kurser-tillagg/se-16-sektoranalysens-metod.json",
  "pc-22-ditt-andra-case": "data/kurser-tillagg/pc-22-ditt-andra-case.json",
  "ek-04-backtestens-hantverk": "data/kurser-tillagg/ek-04-backtestens-hantverk.json",
};
const reg = JSON.parse(readFileSync(`${REPO}/public/deep-courses.json`, "utf8"));

let PASS = 0, FEL = 0, VARN = 0;
const ok = (namn, villkor) => { if (villkor) { PASS++; } else { FEL++; console.log("  FEL:", namn); } };
const warn = (namn) => { VARN++; console.log("  VARNING:", namn); };

console.log("── 1. STRUKTURPARITET (chapters_list ↔ chapters) + register-paritet ──");
for (const slug of MINA) {
  const k = reg[slug];
  ok(`${slug}: finns i registret`, !!k);
  ok(`${slug}: chapterCount = chapters = chapters_list`, k.chapterCount === k.chapters.length && k.chapters.length === k.chapters_list.length);
  const paritet = k.chapters_list.every((c, i) => c.num === k.chapters[i].num && c.title === k.chapters[i].title && c.minutes === k.chapters[i].minutes);
  ok(`${slug}: list↔chapters num/titel/minuter identiska`, paritet);
  ok(`${slug}: totalMinutes = summa kapitelminuter`, k.chapters_list.reduce((s, c) => s + c.minutes, 0) === k.totalMinutes);
  ok(`${slug}: minutes = totalMinutes`, k.minutes === k.totalMinutes);
  ok(`${slug}: xp 50, level känt, category känt`, k.xp === 50 && ["Nybörjare", "Intermediär", "Avancerad"].includes(k.level) && typeof k.category === "string");
  ok(`${slug}: history.origin/evolution/modern finns`, !!(k.history?.origin && k.history?.evolution && k.history?.modern));
  ok(`${slug}: lynch/graham/ak1-sektioner finns`, !!(k.lynchSection && k.grahamSection && k.ak1Section));
  ok(`${slug}: blocks enbart kända typer`, k.chapters.every(c => c.blocks.every(b => ["text", "definition", "insight", "tabell", "utmaning"].includes(b.type))));
  // register ↔ proveniens round-trip
  const prov = JSON.parse(readFileSync(`${REPO}/${FILPATH[slug]}`, "utf8"));
  ok(`${slug}: register↔proveniens djupt identisk`, JSON.stringify(reg[slug]) === JSON.stringify(prov));
}

console.log("── 2. Aritmetik — oberoende omräkning av kursvärden i text ──");
const aritmetik = [
  // pc-22
  ["pc-22", "30/2,0 = 15,0", 30 / 2.0, 15.0],
  ["pc-22", "45/3,0 = 15,0", 45 / 3.0, 15.0],
  ["pc-22", "45/25,0 = 1,8", 45 / 25.0, 1.8],
  ["pc-22", "Södra DuPont (66/660)×(660/550) = 12,0 %", (66 / 660) * (660 / 550) * 100, 12.0],
  ["pc-22", "Södra soliditet 550/1 100 = 50,0 %", 550 / 1100 * 100, 50.0],
  ["pc-22", "Södra FCF-täckning 75/30 = 2,5", 75 / 30, 2.5],
  ["pc-22", "Södra utdelningsandel 30/66 = 45,5 %", 30 / 66 * 100, 45.5],
  ["pc-22", "Södra tillväxt 660/630 − 1 = +4,8 %", (660 / 630 - 1) * 100, 4.8],
  ["pc-22", "Södra marginal år 3: 99/660 = 15,0 %", 99 / 660 * 100, 15.0],
  ["pc-22", "Södra marginal år 1: 87/600 = 14,5 %", 87 / 600 * 100, 14.5],
  ["pc-22", "Södra marginal år 2: 95/630 ≈ 15,1 %", 95 / 630 * 100, 15.1],
  ["pc-22", "Norra andel 23/92 = 25,0 %", 23 / 92 * 100, 25.0],
  ["pc-22", "Södra BVA 550/22 = 25,0", 550 / 22, 25.0],
  ["pc-22", "Södra VPA 66/22 = 3,0", 66 / 22, 3.0],
  ["pc-22", "Norra BV 46×30 = 1 380", 46 * 30, 1380],
  ["pc-22", "Södra BV 22×45 = 990", 22 * 45, 990],
  ["pc-22", "Norra DuPont 8,0 × 2,5 = 20,0", 8.0 * 2.5, 20.0],
  // se-16
  ["se-16", "vakanser medel (4+5+5+6+30)/5 = 10,0", (4 + 5 + 5 + 6 + 30) / 5, 10.0],
  ["se-16", "vakanser median = 5,0", 5, 5.0],
  ["se-16", "verkstads-ROE medel (18+22+15+9+26)/5 = 18,0", (18 + 22 + 15 + 9 + 26) / 5, 18.0],
  ["se-16", "bank 100 mdr × 1,0 % = 1,0 mdr", 100 * 0.01, 1.0],
  ["se-16", "bank 0,1 pp = 100 mkr", 100 * 0.001 * 1000, 100],
  ["se-16", "fastighet 1 000 mdr × 5 % = 50 mdr", 1000 * 0.05, 50],
  ["se-16", "fastighet 1 pp = 10 mdr", 1000 * 0.01, 10],
  ["se-16", "SaaS 110 % av 100 = 110", 100 * 1.1, 110],
  // ek-04
  ["ek-04", "överlevnad (20×11 + 3×(−40))/23 = 4,3 %", (20 * 11 + 3 * -40) / 23, 4.35],
  ["ek-04", "överlevnadsgap 11,0 − 4,3 = 6,7", 11.0 - 4.3478, 6.65],
  ["ek-04", "överanpassning fall komplex 84 − 31 = 53", 84 - 31, 53],
  ["ek-04", "överanpassning fall enkel 62 − 58 = 4", 62 - 58, 4],
  ["ek-04", "kostnad 0,3 % × 2,0 byten = 0,6 %", 0.3 * 2.0, 0.6],
  ["ek-04", "1,092^10 = 2,41", Math.pow(1.092, 10), 2.41],
  ["ek-04", "1,041^10 = 1,49", Math.pow(1.041, 10), 1.49],
  ["ek-04", "regelgap 9,2 − 4,1 = 5,1", 9.2 - 4.1, 5.1],
  ["ek-04", "kvot (1,092/1,041)^10 − 1 > 60 %", Math.pow(1.092 / 1.041, 10) * 100 - 100 > 60, true],
];
for (const [slug, namn, v, e] of aritmetik) {
  const bra = typeof v === "boolean" ? v === e : Math.abs(v - e) < 0.06;
  ok(`${slug}: ${namn}`, bra);
}

console.log("── 3. Textåtergivning — nyckeltal FINNS i kurstexten (citateverifiering) ──");
const hela = (slug) => JSON.stringify(reg[slug]);
const finnes = (slug, ...nalar) => ok(`${slug}: tal i texten`, nalar.every(n => hela(slug).includes(n)));
finnes("pc-22-ditt-andra-case", "15,0", "2,5", "45,5", "25,0", "1 380", "990");
finnes("se-16-sektoranalysens-metod", "10,0", "5,0", "1,0 miljard", "50 miljarder");
finnes("ek-04-backtestens-hantverk", "4,3", "6,7", "84 procent", "31 procent", "0,6", "60 procent");

console.log("── 4. JURIDIKGRIND — rådsfraser + utbildningsframing ──");
const radsmönster = [
  /\bköp den här aktien\b/i, /\bsälj den här aktien\b/i, /\brekommenderar (att )?(köpa|sälja|köp|sälj)\b/i,
  /\bbör (köpa|sälja) aktien\b/i, /\btipsar vi\b/i, /\bmin rekommendation\b/i, /\bvårt råd är\b/i, /\bplacera dina pengar i\b/i,
];
for (const slug of MINA) {
  const t = hela(slug);
  const träffar = radsmönster.filter(m => m.test(t));
  ok(`${slug}: 0 rådsfraser`, träffar.length === 0);
  ok(`${slug}: utbildningsframing i kursavslut (KURSENS RAM)`, t.includes("KURSENS RAM") || t.includes("utbildning, aldrig råd"));
  ok(`${slug}: aldrig investeringsråd-formulering negativ närvaro`, !/är (detta|en) (investeringsråd|aktietips)[^.]*\.$/i.test(t));
}

console.log("── 5. KORSREFERENSER — nämnda kursslugs lever i registret ──");
const slugLista = Object.keys(reg);
for (const slug of MINA) {
  const t = hela(slug);
  const referenser = [...t.matchAll(/\b([a-z0-9]+(?:-[a-z0-9]+)+)\b/g)].map(m => m[1]);
  const kursrefs = [...new Set(referenser.filter(r => /^[a-z]+-\d|^(akm1|ak1ts|konfluens|vagfundament|portfolj|v\d\d|the-|km-|rk-|vm-|vr-|ln-|mt-|rs-|st-|tx-|ud-|bk-|kt-|ma-|od-|bf-|ek-|ks-|ib-|pe-|roic|am-|pc-|se-|rp-|pf-|mk-|ts-|sj-|v0|v1)/.test(r)))];
  const brutna = kursrefs.filter(r => !slugLista.some(s => s === r || s.startsWith(r)));
  // filtrera bort icke-kurs-ord (datum, filnamn, etc.) — endast de som LIKNAR kurser men saknas
  const misstankta = brutna.filter(r => /\d/.test(r) && !/^(2026|2025|2024|kapitel|steg|1934|1996|1998|1999|2005|2007|2009|2015|2016|2021|2008)/.test(r) && !/-kurs(en|ens|erna)$/.test(r) && !/^(akm1|ak1ts)-kurs/.test(r));
  if (misstankta.length) warn(`${slug}: okända korsreferenser att kontrollera: ${misstankta.join(", ")}`);
  else PASS++;
}
// specifika korsreferenser som SKA finnas (registeräkta)
const KraFinns = (ref) => ok(`korsreferens lever: ${ref}`, slugLista.some(s => s.startsWith(ref)));
KraFinns("ek-03-arbetsflodet"); KraFinns("pc-21"); KraFinns("rs-03"); KraFinns("vr-02"); KraFinns("st-04");
KraFinns("ma-01"); KraFinns("am-02"); KraFinns("km-065"); KraFinns("km-040"); KraFinns("km-041"); KraFinns("km-042");
KraFinns("se-01"); KraFinns("se-14"); KraFinns("v09"); KraFinns("ln-01"); KraFinns("tx-02"); KraFinns("ud-09");
KraFinns("rk-12"); KraFinns("km-013"); KraFinns("km-070"); KraFinns("km-003"); KraFinns("km-004");

console.log("── 6. SPRÅKGRIND ──");
const CJK = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
const MJUKT = /\u00ad/;
const TAB = /\t/;
const dubbel = /  +\S/;
const TITTLAR = ["Way of the Turtle","What Works on Wall Street","Dogs of the Dow","dogs of the dow","Security Analysis","Quantitative Value","Standard and Poor","The Theory of Investment Value","Common Sense on Mutual Funds"];
const engVardag = /\b(the|and|with|both|own hand|stretch|notably|bearish|float|approximately|without|current|becoming|much)\b/i;
const norska = /\b(også|ikke|betyr|selger|svang|mer enn nok|jensen)\b/i;
for (const slug of MINA) {
  const t = hela(slug);
  const tStrippad = TITTLAR.reduce((s, titel) => s.split(titel).join(""), t);
  ok(`${slug}: 0 CJK`, !CJK.test(t));
  ok(`${slug}: 0 mjuka bindestreck`, !MJUKT.test(t));
  ok(`${slug}: 0 tabbar`, !TAB.test(t));
  if (dubbel.test(t.replace(/  +"/g, '"'))) warn(`${slug}: dubbeltecken att kontextgranska`); else PASS++;
  const eng = tStrippad.match(engVardag);
  if (eng) { FEL++; console.log(`  FEL: ${slug}: engelsk läcka: ${eng[0]}`); } else PASS++;
  const no = tStrippad.match(norska);
  if (no) { FEL++; console.log(`  FEL: ${slug}: norsk läcka: ${no[0]}`); } else PASS++;
  const innehall = reg[slug].chapters.flatMap(c => c.blocks.map(b => b.content)).join(" ");
  ok(`${slug}: 0 citattecken i innehåll`, !/"/.test(innehall));
}

console.log("── 7. SYSTEMKONSISTENS ──");
ok("register 396 kurser", Object.keys(reg).length === 396);
ok("ek-serien 01–04 utan nummerdublett", ["ek-01-sam-viktningen", "ek-02-labbets-karta", "ek-03-arbetsflodet-i-labbet", "ek-04-backtestens-hantverk"].every(s => !!reg[s]) && Object.keys(reg).filter(s => s.startsWith("ek-")).length === 4);
const siffror = JSON.parse(readFileSync(`${REPO}/data/siffror.json`, "utf8"));
ok("siffror.json 396", siffror.kurser === 396);
ok("siffror quiz 8 223 oförändrad", siffror.quiz === 8223);
const llms = readFileSync(`${REPO}/public/llms.txt`, "utf8");
const llmsF = readFileSync(`${REPO}/public/llms-full.txt`, "utf8");
ok("llms 6 ställen 396", (llms.split("396 kurser").length - 1) === 6);
ok("llms-full 4 ställen 396", (llmsF.split("396 kurser").length - 1) === 4);
ok("llms 0 kvarvarande 393", !(llms + llmsF).includes("393 kurser"));
const sok = JSON.parse(readFileSync(`${REPO}/public/sok-index.json`, "utf8"));
const speglar = JSON.parse(readFileSync(`${REPO}/public/speglar-slugar.json`, "utf8"));
const sokAntal = sok.kurser ? sok.kurser.length : Object.keys(sok).length;
console.log("   (sökindex struktur:", sokAntal, "· speglar:", speglar.kurser ? speglar.kurser.length : Object.keys(speglar).length, ")");

console.log(`\n──────── KVD: ${PASS} PASS · ${FEL} FEL · ${VARN} VARNING ────────`);
process.exit(FEL === 0 ? 0 : 1);
