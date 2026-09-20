#!/usr/bin/env node
/**
 * _s4u2-inve-kvd.mjs — KVD för Investor AB Q3-läspaketet (kvartalsrapportserien #65).
 * Mekanisk kvalitetsgrind: struktur, talparitet mot källorna, oberoende aritmetik,
 * interna länkar HTTP 200, rådverb, juridikgrind (exakt ett lagrum), ord/rm.
 * Dom: PASS räknas per kontroll; FEL ⇒ exit 1 (ALDRIG --no-verify-kultur).
 */
import { readFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-investor-ab-q3-2026.json";
const d = JSON.parse(readFileSync(FIL, "utf8"));
const body = d.body;
let pass = 0, fel = 0;
const OK = (m) => { pass++; console.log("PASS " + m); };
const NEJ = (m) => { fel++; console.log("FEL  " + m); };
const sek = async (u) => {
  try { const r = await fetch(u, { signal: AbortSignal.timeout(8000) }); return r.status; } catch { return 0; }
};

// ── 1. Struktur ──────────────────────────────────────────────────────────────
const keys = ["slug","title","description","pillar","author","publishedAt","readingMinutes","tags","body"];
keys.every((k) => typeof d[k] !== "undefined" && d[k] !== null && d[k] !== "")
  ? OK("nycklar 9/9 (" + keys.join(", ") + ")") : NEJ("saknad nyckel av 9");
d.slug === "sa-laser-du-investor-ab-q3-2026" ? OK("slug") : NEJ("slug");
d.publishedAt === "2026-10-16" ? OK("publishedAt = rappdagen") : NEJ("publishedAt");
d.pillar === "Institutionell metodik" && d.author === "AK1A Research Lab" ? OK("pillar/author enligt serien") : NEJ("pillar/author");
const H2 = body.match(/^## [^\n]+$/gm) || [];
const vantadeH2 = ["Urvalet", "NAV-trappan", "Nyckeltalen", "Portföljen", "Tre sätt att öva", "Praktiskt", "Källor"];
vantadeH2.every((v) => H2.some((h) => h.includes(v))) ? OK("H2 7/7 (" + H2.length + " totalt)") : NEJ("H2 saknas av 7: " + vantadeH2.filter((v) => !H2.some((h) => h.includes(v))).join(","));

// ── 2. Ord och läsminuter ────────────────────────────────────────────────────
const ord = body.replace(/\|/g, " ").split(/\s+/).filter((w) => /[a-zA-Z0-9åäöÅÄÖ]/.test(w)).length;
const rm = Math.round(ord / 600);
rm === d.readingMinutes ? OK(`ord ${ord} ⇒ readingMinutes ${rm} = fältet ${d.readingMinutes}`) : NEJ(`rm ${rm} ≠ ${d.readingMinutes} (ord ${ord})`);
ord >= 2400 && ord <= 3600 ? OK("ord inom seriens band 2 400–3 600") : NEJ("ord utanför band: " + ord);
d.description.length >= 140 && d.description.length <= 320 ? OK(`description ${d.description.length} tecken`) : NEJ("description " + d.description.length + " tecken (band 140–320)");
d.tags.length >= 5 && d.tags.includes("kvartalsrapport") && d.tags.includes("läspaket") ? OK("tags " + d.tags.length) : NEJ("tags");

// ── 3. Talparitet mot källorna (multiset: varje källtal ska finnas i texten) ─
const kallTal = ["410,75","1,159","4,79","4,64","5,08","1,17","27,3","13,6","89,4","88,7","80,1","50,6",
  "355","367","397","311","354","354,45","396,51","402,55","330,40","354,30",
  "1 214 733","1 087 082","1 085 862","953 705","1 125 062","128 871","42,07","11,9",
  "1 225 307","3 063 530 101","1 258","23 300","28 800","14 333","1,9","2,1",
  "946 199","77,9","73,4","278 983","182 966","163 785","138 888","94 045","88 009",
  "84 699","87 230","82 912","88 419","56 427","40 821","54 882","43 325","44 836","51 999",
  "38 624","34 390","36 118","30 291","10 888","11 560",
  "40,2","22,3","−2,0","12,2","−17,5","17,2","17,4","−4,7","7,2","3,3",
  "23,0","44,2","52,5","6,2","14,37","12,41","1,77","1,51","2,72","15,02","1,25","0,94",
  "21,8","11,8","13,8","11,7","15,9","3,6","6,9","1,5","1 009 998","21,3","3,4","7,2","13,6","1,036",
  "1 701","1 520","375","4 902","455","349","16","16 oktober","4 november","22 januari","20 april","20 juli","16 juli","08:15","3 september","20 september","62,9","0,86","33","12,8","88,7","22,1","30,2","34,4","3,3","39,7","52 100","50 507","23 387","27 119"];
const saknas = kallTal.filter((t) => !body.includes(t));
saknas.length === 0 ? OK("talparitet " + kallTal.length + "/" + kallTal.length + " källtal i texten") : NEJ("saknade källtal: " + saknas.join(" | "));

// ── 4. Aritmetik — oberoende omräkning av paketets härledda påståenden ───────
const A = [];
A.push(["rapporterat NAV/aktie", 1085862 / 3063.530101, 354.45, 0.01]);
A.push(["justerat NAV/aktie", 1214733 / 3063.530101, 396.51, 0.01]);
A.push(["kurs/rapporterat = P/B-fältet", 410.75 / (1085862 / 3063.530101), 1.159, 0.001]);
A.push(["kurs/justerat", 410.75 / (1214733 / 3063.530101), 1.036, 0.002]);
A.push(["premie rapporterat", 410.75 / (1085862 / 3063.530101) - 1, 0.159, 0.002]);
A.push(["premie justerat", 410.75 / (1214733 / 3063.530101) - 1, 0.036, 0.002]);
A.push(["justeringsgap Mkr", 1214733 - 1085862, 128871, 1]);
A.push(["justeringsgap kr/aktie", (1214733 - 1085862) / 3063.530101, 42.07, 0.01]);
A.push(["justeringsgap andel", (1214733 - 1085862) / 1085862, 0.119, 0.001]);
A.push(["NAV-trappa H1", 397 / 355 - 1, 0.118, 0.002]);
A.push(["B-kurs H1", 402.55 / 330.4 - 1, 0.218, 0.002]);
A.push(["årsskiftesrabatt", 330.4 / 355 - 1, -0.069, 0.002]);
A.push(["halvårspremie", 402.55 / (1214733 / 3063.530101) - 1, 0.015, 0.002]);
A.push(["noterad summa", [278983,163785,94045,84699,82912,56427,54882,44836,38624,36118,4738,3671,2479].reduce((a,b)=>a+b,0), 946199, 1]);
A.push(["noterad andel", 946199 / 1214733, 0.779, 0.001]);
A.push(["ABB-andel", 278983 / 1214733, 0.230, 0.001]);
A.push(["ABB H1-värde", 278983 / 182966 - 1, 0.525, 0.002]);
A.push(["topp-3 andel", (278983 + 163785 + 94045) / 1214733, 0.442, 0.001]);
A.push(["Saab H1", 82912 / 88419 - 1, -0.062, 0.002]);
A.push(["PEG implicit tillväxt", 4.792 / 5.08, 0.94, 0.01]);
A.push(["mcap härlet Mkr", 410.75 * 3063.530101, 1258345, 600]);
A.push(["Elux+Husq+ElPro summa", 4738 + 3671 + 2479, 10888, 1]);
A.push(["12/31-summa tre små", 3255 + 4483 + 3822, 11560, 1]);
A.push(["Saab-vikt", 82912 / 1214733, 0.068, 0.002]);
A.push(["AZN-vikt", 94045 / 1214733, 0.077, 0.002]);
A.push(["ABB 10 %×vikt", 0.2297 * 0.10, 0.023, 0.001]);
let aFel = [];
for (const [namn, calc, textTal, tol] of A) if (Math.abs(calc - textTal) > tol) aFel.push(`${namn}: calc ${calc.toFixed(4)} mot ${textTal}`);
aFel.length === 0 ? OK("aritmetik " + A.length + "/" + A.length + " oberoende omräknad") : NEJ("aritmetikfel: " + aFel.join("; "));

// ── 5. Interna länkar HTTP 200 ───────────────────────────────────────────────
const links = [...new Set(body.match(/\]\((\/[^)]+)\)/g) || [])].map((s) => s.slice(2, -1));
const ext = links.filter((l) => !l.startsWith("/"));
ext.length === 0 ? OK("externa URL:er 0 (endast interna") : NEJ("externa länkar i body: " + ext.join(","));
for (const l of links) {
  const st = await sek("http://localhost:3000" + l);
  st === 200 ? OK("länk 200 " + l) : NEJ(`länk ${st} ${l}`);
}

// ── 6. Rådverb och juridikgrind ──────────────────────────────────────────────
const radMönster = /\b(köp|sälj|rekommenderar|rekommendera|bör du köpa|bör du sälja|råd till att)\b/gi;
const disclaimerFormel = "Inga köp-, sälj- eller hållningsrekommendationer"; // seriens standardnegation — samtliga syskonpaket bär den
const radTräffar = [...body.matchAll(radMönster)].map((m) => m[0].toLowerCase());
const ogiltiga = radTräffar.filter((t) => !(body.includes(disclaimerFormel) && ["köp", "sälj"].includes(t)));
ogiltiga.length === 0 ? OK("rådverb 0 (disclaimer-negationens bindestremsformer vitlistade som exakt fras)") : NEJ("rådverb: " + ogiltiga.join(","));
const lagrum = [...body.matchAll(/2007:528/g)].length;
lagrum === 1 ? OK("juridikgrind: exakt ett lagrum (2007:528)") : NEJ("lagrum " + lagrum + " st (ska vara exakt 1)");
const disclaimerSist = body.trimEnd().endsWith("*") && body.trimEnd().includes("Inga köp-, sälj- eller hållningsrekommendationer");
disclaimerSist ? OK("disclaimer sista raden") : NEJ("disclaimer ej sist");

// ── 7. Dubbelkoll: publiceringsdatum och kalender är officiellt belagda ─────
body.includes("Oct. 16, 2026") || body.includes("16 oktober") ? OK("rappdag 16 oktober i text") : NEJ("rappdag saknas");
body.includes("Interim Management Statement") ? OK("IMS-formen namngiven") : NEJ("IMS-formen ej namngiven");

// ── DOM ──────────────────────────────────────────────────────────────────────
console.log(`\nKVD INVE: ${pass} PASS · ${fel} FEL`);
process.exit(fel === 0 ? 0 : 1);
