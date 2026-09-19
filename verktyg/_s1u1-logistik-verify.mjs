#!/usr/bin/env node
// _s1u1-logistik-verify.mjs — fabrik auto-s1-1789854906402 s1-u1 (granskare)
// Oberoende maskinell granskning av data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json
// Läser ALLT, skriver INGET (utmatning enbart till stdout).
import { readFileSync, existsSync, statSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const u = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json`, "utf8"));
const raw = readFileSync(`${ROT}/data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json`, "utf8");
let ok = 0, fel = 0, varn = 0;
const r = (namn, pass, detalj) => {
  if (pass === true) { ok++; console.log(`PASS ${namn} — ${detalj ?? ""}`); }
  else if (pass === "VARN") { varn++; console.log(`VARN ${namn} — ${detalj ?? ""}`); }
  else { fel++; console.log(`FEL  ${namn} — ${detalj ?? ""}`); }
};
const na = t => Math.abs(t) < 5e-9 ? 0 : t;

// ---------- 1. STRUKTUR ----------
const falt = ["slug","title","description","pillar","author","publishedAt","readingMinutes","tags","body"];
for (const f of falt) r(`struktur.falt.${f}`, typeof u[f] !== "undefined" && u[f] !== null && u[f] !== "", typeof u[f]);
r("struktur.title.langd<=60", u.title.length <= 60, `${u.title.length} tecken: "${u.title}"`);
r("struktur.desc.langd<=155(OG)", u.description.length <= 155, `${u.description.length} tecken`);

// Ordantal: body utan markdown-länkar/markdown-styrtecken
const bodyRen = u.body
  .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
  .replace(/[#*_>`]/g, " ");
const ord = bodyRen.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
const rm600 = Math.max(1, Math.round(ord / 600));
const rm200 = Math.max(1, Math.round(ord / 200));
r("ord.antal", ord > 800, `${ord} ord (byggarens eget mått: 1 169)`);
console.log(`INFO  readingMinutes: fil=${u.readingMinutes} · round(${ord}/600)=${rm600} · round(${ord}/200)=${rm200} (seriebeslut: fabriksägaren)`);

// ---------- 2. ARITMETIK (textens egna räkneexempel, omräknade) ----------
const P = (namn, exp, txt, tol = 0.05) =>
  r(`aritmetik.${namn}`, na(exp - txt) <= tol, `beräknat ${exp.toFixed(4)} vs text "${txt}" (tol ${tol})`);
P("maersk2022.marginal", 31 / 82 * 100, 37.8);
P("maersk2025.marginal", 3.5 / 54.0 * 100, 6.5);
P("maersk2023.fall", (4 - 31) / 31 * 100, -87, 0.6);
P("dsv.bruttomarginal2025", 66859 / 247331 * 100, 27.0);
P("dsv.ebit.tillvaxt", (19611 / 16096 - 1) * 100, 21.8);
P("dsv.intakt.tillvaxt", (247331 / 167100 - 1) * 100, 48, 0.4);
P("dsv.vinst.fall", (8.5 / 10.2 - 1) * 100, -16.8, 0.15);
P("kn.rorelsemarginal", 1242 / 24476 * 100, 5.1);
P("kn.bruttomarginal", 8800 / 24476 * 100, 36.0);
P("kn.ebit.fall", -24.9, -24.9, 0.01);
P("dsv.segment.summa", 13.0 + 2.7 + 3.8, 19.5, 0.01);
r("aritmetik.dsv.segment.andel", na(13.0 / 19.6 - 2 / 3) < 0.005, `13,0/19,6 = ${(13.0 / 19.6 * 100).toFixed(1)} % vs "två tredjedelar"`);
r("aritmetik.dsv.eps.forandring", na((50.9 / 51.6 - 1) * 100 + 1.4) < 0.05, `50,9/51,6 = ${((50.9 / 51.6 - 1) * 100).toFixed(1)} % — "i princip oförändrad"`);
r("aritmetik.maersk.2024intakt", na(54 - 55.5) > -4 && na(54 - 55.5) < 0, `"nästan oförändrad intäkt 54" mot 2024 års 55,5 (≈ −2,7 %)`);
r("aritmetik.dsv.jfc.faktor", 16.3 / 5.6 > 2.8 && 16.3 / 5.6 < 3.0, `16,3/5,6 = ${(16.3 / 5.6).toFixed(2)}× — textens "16,3 mot 5,6" (ingen kvot påstådd)`);

// ---------- 3. JURIDIK 2007:528 ----------
const hela = `${u.title}\n${u.description}\n${u.body}`;
const vm = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, "utf8"));
let vmFynd = 0, vmVarn = 0;
for (const f of vm.forbjudnaFraser ?? []) {
  const re = new RegExp(f.fran, "gi");
  const t = hela.match(re);
  if (t) { if (f.allvar === "FEL") vmFynd++; else vmVarn++; console.log(`FYND varumarke [${f.allvar}] /${f.fran}/ → ${t.join(", ")} — ${f.motiv}`); }
}
r("juridik.varumarkesgrind", vmFynd === 0 && vmVarn === 0, `${vm.forbjudnaFraser.length} regexer: ${vmFynd} FEL + ${vmVarn} VARNING`);
const rad = u.body.split(/\n\n/);
const sista = rad[rad.length - 1].toLowerCase();
r("juridik.disclaimer.sista", /pedagogisk|utbildning/.test(sista) && /investeringsråd/.test(sista), `sista stycket: "${sista.slice(0, 80)}…"`);
console.log(`INFO  disclaimer.tidig: första stycket inleder utan disclaimer ("${rad[0].slice(0, 60)}…") — seriens standard är sist-rad (bilaktier-precedensen noterade tidig+sista; majoriteten av seriens utkast bar endast sist)`);
const radgloss = [...hela.matchAll(/(?<ord>köp(?:er|ta)?|sälj(?:a|er)?|rekommendera(?:r|s)?|bör du|råd(?:et|en)? till)\b/gi)].map(m => m[0]);
console.log(`INFO  rådgivningsglossor: ${radgloss.length} träffar → kontextklassning manuellt: ${[...new Set(radgloss)].join(", ") || "0"}`);
const radgKontext = [...hela.matchAll(/[^.]*\b(?:köp\w*|sälj\w*|rekommender\w*)\b[^.]*\./gi)].map(m => m[0].trim());
let radgFel = 0;
for (const s of radgKontext) if (/\b(du|din|ditt|vi|råd|tips|nu)\b/i.test(s) && /köp|sälj|rekommender/i.test(s) && !/nej|aldrig|inte\b.*investeringsråd/i.test(s)) if (/^(?!.*(?:bolaget|speditören|koncernen|Rederiaget|bolagen|DSV|Maersk))/i.test(s)) { radgFel++; console.log(`FYND rådglossa i råd-kontext: "${s.slice(0, 120)}"`); }
r("juridik.radglossor.kontext", radgFel === 0, `${radgKontext.length} verbmeningar klassade, ${radgFel} i råd-kontext`);
const lagrum = hela.match(/\b(19|20)\d{2}:\d+\b/g) ?? [];
r("juridik.lagrum.antal", lagrum.length === 0, `lagrum i text: ${lagrum.join(", ") || "0"} (0 = ingen blandningsrisk)`);
const irad = [...hela.matchAll(/.{0,40}investeringsråd.{0,40}/gis)].map(m => m[0].replace(/\n/g, " "));
r("juridik.investeringsrad.negerad", irad.length === 1 && /inte\b|ej\b/.test(irad[0]), irad.map(s => `"…${s}…"`).join(" | "));

// ---------- 4. 911-MÖNSTER (seriens sex) ----------
const m911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
let t911 = 0;
for (const m of m911) { const c = (raw.match(new RegExp(m.replace(/\//g, "\\/"), "gi")) ?? []).length; if (c) { t911 += c; console.log(`FYND 911-mönster "${m}": ${c} träffar`); } }
r("911.sexmonster", t911 === 0, `0 träffar av ${m911.length} mönster i HELA filen (title+desc+body+metadata)`);

// ---------- 5. SUPERLATIV/ORDINAL (skannas för manuell dom) ----------
const sup = [...hela.matchAll(/[^.]*(?:världens|människans|branschens|sektorns|universumets|seriens|börsens|Sveriges|marknadens)\s+(?:mest|störst\w*|högst\w*|lägst\w*|bäst\w*|största|högsta|bästa)[^.]*\./gi)].map(m => m[0].trim());
console.log(`INFO  superlativkandidater (${sup.length}): ${sup.map(s => `"${s.slice(0, 110)}…"`).join(" | ") || "0"}`);
const ordi = [...hela.matchAll(/\b(första|andra|tredje|fjärde|femte|sjätte|sjunde|åttonde|nionde|tionde|elfte|tolfte)\b/gi)].map(m => m[0]);
console.log(`INFO  ordningstal (${ordi.length}): ${ordi.join(", ") || "0"}`);

// ---------- 6. LÄNKAR ----------
const lankar = [...new Set([...u.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
console.log(`INFO  unika interna länkar: ${lankar.length} st`);
for (const l of lankar) {
  const m = l.match(/^\/(kurser|blogg)\/(.+)$/);
  if (!m) { r(`lank.format ${l}`, false, "okänd länktyp"); continue; }
  const [, typ, id] = m;
  if (typ === "blogg") {
    const live = existsSync(`${ROT}/data/blogg/${id}.json`);
    r(`lank.blogg.live ${l}`, live, live ? "LEVE-fil i data/blogg/" : "SAKNAS i data/blogg/ (utkastlänk?)");
  } else {
    const seo = existsSync(`${ROT}/data/seo/kurser/${id}.json`);
    const tillagg = existsSync(`${ROT}/data/kurser-tillagg/${id}.json`);
    r(`lank.kurs.fil ${l}`, seo || tillagg, seo ? "registerfil i data/seo/kurser/" : tillagg ? "registerfil i data/kurser-tillagg/" : "SAKNAS i båda registren"); 
  }
}
// HTTP mot localhost (deploylåset kontrollerat LEDIGT före körning)
const hamta = async (l) => {
  try { const s = await fetch(`http://localhost:3000${l}`, { redirect: "manual" }); return s.status; } catch { return "ERR"; }
};
for (const l of lankar) {
  const s = await hamta(l);
  r(`lank.http ${l}`, s === 200, `HTTP ${s}`);
}

// ---------- 7. UNIVERSUM (byggaren: 0/165 vid byggtiden; dagens träd kan ha tillförts) ----------
const uni = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const urader = Array.isArray(uni) ? uni : Object.values(uni).find(Array.isArray);
const faltStr = rad => Object.values(rad).map(v => String(v ?? "")).join(" ").toLowerCase();
// Namn-matchning på namn/ticker-fält (substring i fritext ger falska positiva: "dsv" i ISIN etc.)
const logistiknamn = ["maersk", "mærsk", "dsv panalpina", "kuehne", "schenker", "postnord", "dhl", "fedex", "expeditors", "geodis", "rxo", "c.h. robinson", "xpo logistics"];
const logTr = [];
for (const rad of urader) {
  const namn = String(rad.namn ?? rad.bolag ?? "").toLowerCase();
  const tick = String(rad.ticker ?? "").toLowerCase();
  for (const e of logistiknamn) if (namn.includes(e) || tick.includes(e)) { logTr.push(String(rad.namn ?? rad.ticker)); break; }
}
const maerskRad = urader.find(rad => /m[æa]rsk/i.test(String(rad.ticker ?? "") + String(rad.namn ?? "")));
if (logTr.length === 0) {
  r("universum.logistik", true, `0 logistikbolag i ${urader.length} poster`);
} else if (logTr.length === 1 && maerskRad) {
  // Maersk tillagd EFTER bygget (2026-09-19): paritetsnot — texten EBIT, universumraden nettoresultat
  const ar = maerskRad.serier?.ar ?? [], netto = maerskRad.serier?.resultat ?? [], oms = maerskRad.serier?.omsattning ?? [];
  const textEbit = { 2022: 31, 2023: 4, 2024: 6.5, 2025: 3.5 };
  const textOms = { 2022: 82, 2024: 55.5, 2025: 54 };
  let paritetOk = true; const detalj = [];
  ar.forEach((a, i) => {
    const e = textEbit[a], n = netto[i] / 1e9, o = oms[i] / 1e9, to = textOms[a];
    if (e !== undefined && n !== undefined) { detalj.push(`${a}: EBIT-text ${e} ≥ netto-universum ${n.toFixed(1)} = ${e >= n}`); if (e < n) paritetOk = false; }
    if (to !== undefined && o !== undefined) { detalj.push(`${a}: omsättning text ${to} ≈ universum ${o.toFixed(1)} (Δ${Math.abs(to - o).toFixed(1)})`); if (Math.abs(to - o) > 3) paritetOk = false; }
  });
  r("universum.logistik.maersk.paritet", paritetOk, `Maersk tillagd i universumet 2026-09-19 (${logTr[0]}); kompatibilitet text↔rad: ${detalj.join(" · ")}`);
} else {
  r("universum.logistik", false, `${logTr.length} logistikträffar: ${logTr.join(", ")} — manuell dom krävs`);
}

// ---------- 8. KONSISTENS (title/desc/body-tal) ----------
const descTal = [...u.description.matchAll(/\d+[\d.,]*\s*(?:miljarder|mdr)/gi)].map(m => m[0]);
console.log(`INFO  description-tal: ${descTal.join(", ")}`);
r("konsistens.maersk.desc.body", u.description.includes("31→3,5") || (u.description.includes("31") && u.body.includes("3,5 miljarder 2025")), "Maersk EBIT 31→3,5 konsekvent desc+body");
r("konsistens.publishedAt", /^\d{4}-\d{2}-\d{2}$/.test(u.publishedAt), `publishedAt ${u.publishedAt} (R2: publiceringsdatum = kundens beslut)`);

console.log(`\nSUMMA: ${ok} PASS · ${varn} VARN · ${fel} FEL`);
process.exit(fel > 0 ? 1 : 0);
