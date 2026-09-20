#!/usr/bin/env node
// _s1u1-boerspsykologi-kontroll.mjs — oberoende kontroll m9-utkast #1 (boerspsykologi-fallstugor v1)
// Fabrik auto-s1-u1, omgång auto-s1-1789925707056 (2026-09-20). LÄSER ENDAST — skriver ingenting.
//Speglar kontrolleraText ur src/lib/varumarke.ts (regex "giu", negerings-lookbehird via källmönstret).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const REPO = "/home/ak1a/AK1";
const las = (p) => readFileSync(REPO + "/" + p, "utf8");
const lasJson = (p) => JSON.parse(las(p));
const md5 = (s) => createHash("md5").update(s).digest("hex");
const md5Fil = (p) => md5(las(p));

let ok = 0, fel = 0;
const K = [];
function kontroll(id, passar, detalj) {
  if (passar) { ok++; console.log(`  OK   ${id} — ${detalj}`); }
  else { fel++; console.log(`  FEL  ${id} — ${detalj}`); }
  K.push({ id, passar, detalj });
}

console.log("═══ s1-u1 sond: boerspsykologi-fallstugor-v1 — " + new Date().toISOString() + " ═══");

// ── A. Källor: md5 mot kvittot (A1–A5) ───────────────────────────────────────
const ut = lasJson("data/blogg-utkast/m9-ko/boerspsykologi-fallstugor-v1.json");
const vagj = lasJson("data/rapporter/vagvalidering-SENASTE.json");
const vm = lasJson("data/varumarke.json");
const kallor = ut.fabrik.kallor;
console.log("\n── A. KÄLLOR (md5 mot kvitto) ──");
for (const k of kallor) {
  const faktisk = md5Fil(k.fil);
  kontroll(`A:kalla:${k.fil}`, faktisk === k.md5, `kvitto ${k.md5.slice(0, 8)}… == träd ${faktisk.slice(0, 8)}…`);
}
// Kompletterande: .md-spegeln (rond 102:s andra källa) — rapporteras, ej kvittolagd
const mdSpegel = md5Fil("data/rapporter/vagvalidering-SENASTE.md");
console.log(`  notis: vagvalidering-SENASTE.md md5 ${mdSpegel.slice(0, 8)}… (rond 102 hade b7194627… — ${mdSpegel.startsWith("b7194627") ? "oförändrad" : "FÖRÄNDRAD"})`);

// ── B. Siffror mot källan (oberoende omräkning) ─────────────────────────────
console.log("\n── B. SIFFROR (källvärde → bodypåstående) ──");
const body = ut.bodyMarkdown;
const t = vagj.totalt;
const cell = (h, k) => vagj.perHorisontKlass.find((r) => r.horisont === h && r.klass === k);
const ki = cell("kort", "impulsvåg"), bm = cell("medellång", "basbygge"), be = cell("mega", "basbygge");
const im = cell("medellång", "impulsvåg"), ie = cell("mega", "impulsvåg");

kontroll("B1", t.traffProcent === 52 && body.includes("52 % träff"), `totalt ${t.traffProcent} % i källa+body`);
kontroll("B2", t.nDomda === 48 && body.includes("48 mätningar"), `nDomda ${t.nDomda}`);
kontroll("B3", t.osattAndelProcent === 20 && body.includes("20 % av mätningarna"), `osatta ${t.osattAndelProcent} %`);
kontroll("B4", vagj.universumAntal === 12 && body.includes("12 tickers"), `universum ${vagj.universumAntal} tickers`);
kontroll("B5", vagj.rullandeSedan === "2026-09-04" && body.includes("räknare sedan 2026-09-04"), `rullandeSedan ${vagj.rullandeSedan}`);
kontroll("B6", vagj.domdatum === "2026-09-04" && ut.ingress.includes("domdatum 2026-09-04") && body.includes("Tre fall ur domdatum 2026-09-04"), `domdatum ${vagj.domdatum} i ingress+body`);
kontroll("B7", ki.traffProcent === 100 && ki.nDomda === 2 && body.includes("100 % träff — på exakt n = 2"), `kort/impulsvåg ${ki.traffProcent} % n=${ki.nDomda}`);
kontroll("B8", bm.traffProcent === 0 && bm.nDomda === 6 && body.includes("medellång basbygge (6 dömda)"), `medellång/basbygge ${bm.traffProcent} % n=${bm.nDomda}`);
kontroll("B9", be.traffProcent === 0 && be.nDomda === 6 && body.includes("mega basbygge (6 dömda)"), `mega/basbygge ${be.traffProcent} % n=${be.nDomda}`);
kontroll("B10", bm.nDomda + be.nDomda === 12 && body.includes("sammanlagt 0 träffar på 12 mätningar"), `basbyggessumma ${bm.nDomda}+${be.nDomda} = 12`);
kontroll("B11", im.traffProcent === 100 && im.nDomda === 6 && body.includes("100 % (n = 6)") && ie.traffProcent === 100 && ie.nDomda === 6, `impulsvågskontrast: medellång 100/6 · mega 100/6`);
// n-konsistens: Σ nDomda == totalt.nDomda
const summaN = vagj.perHorisontKlass.reduce((a, r) => a + r.nDomda, 0);
kontroll("B12", summaN === t.nDomda, `Σ cell-nDomda ${summaN} == totalt ${t.nDomda}`);
// totalträff rekonstruerad ur celler (avrundade träffar per cell)
const traffar = vagj.perHorisontKlass.reduce((a, r) => a + (r.nDomda > 0 ? Math.round((r.traffProcent * r.nDomda) / 100) : 0), 0);
kontroll("B13", Math.round((traffar / t.nDomda) * 100) === t.traffProcent, `rekonstruerad träff ${traffar}/${t.nDomda} = ${Math.round((traffar / t.nDomda) * 100)} % == ${t.traffProcent} %`);
// aritmetik: 0,5² = 25 % · 0,5¹² ≈ 0,02 % · 3/n med n=2 → 150 %
kontroll("B14", Math.pow(0.5, 2) === 0.25 && body.includes("0,5 × 0,5 = 25 %"), `P(2/2|slant) = 25 %`);
kontroll("B15", body.includes("0,5 upphöjt till 12") && body.includes("ungefär 0,02 %"), `0,5^12 = ${(Math.pow(0.5, 12) * 100).toFixed(2)} % ≈ "0,02 %" (pct(x,2)-format)`);
kontroll("B16", 3 / 2 === 1.5 && body.includes("med n = 2 blir det 150 %"), `tumregel 3/n: 3/2 = 150 %`);
kontroll("B17", body.includes("± 6 %") && vagj.domProtokollText.includes("|momentum| ≤ 6 %"), `tröskeln ±6 % == protokollets "|momentum| ≤ 6 %"`);

// protokollcitat ordagrant: strängen mellan citattecknen efter "ordagrant ur rapporten: "
const m = body.match(/ordagrant ur rapporten: "([\s\S]*?)"/);
kontroll("B18", m !== null && m[1] === vagj.domProtokollText, `dom-protokollet citerat EXAKT (längd ${m ? m[1].length : 0} == ${vagj.domProtokollText.length} tkn)`);

// kvittots fyra urdrag återfinns i bodyn
console.log("  -- kvittots urdrag --");
for (const [i, u] of ut.fabrik.urdrag.entries()) {
  const kand = [u.varde.replace(/n=48/, "48 mätningar")];
  // urdragen är kompakta ("totalt 52 % (n=48 dömda, osatta 20 %)") — dela i delsträngar som MÅSTE finnas
  const delar = [u.varde.match(/totalt (\d+) %/)?.[0], u.varde.match(/n=(\d+) dömda/)?.[0], u.varde.match(/osatta (\d+) %/)?.[0],
    u.varde.match(/kort\/impulsvåg (\d+) % på n=(\d+)/)?.[0], u.varde.match(/n=(\d+)$/)?.[0]].filter(Boolean);
  const alla = delar.every((d) => body.includes(d) || (d === "n=2" && body.includes("n = 2")) || (d === "n=12" && body.includes("på 12 mätningar")));
  kontroll(`B19.${i + 1}`, alla, `urdrag "${u.varde}" (datum ${u.datum}) — kärntal återfinns i body`);
}
// ingressens "tolv domar" == beräknad basSumma (internt konsistens; HÅRDKODAT i mallen — se flagga F4)
kontroll("B20", ut.ingress.includes("samtliga tolv domar") && bm.nDomda + be.nDomda === 12, `ingress "tolv domar" == källans 6+6 (konsistens; mallen hårdkodar — flagga F4)`);

// ── C. Juridik — kontrolleraText-spegel (exakt algoritm ur varumarke.ts) ────
console.log("\n── C. JURIDIK (lagen 2007:528) ──");
function kontrolleraText(text) {
  const f = [], v = [];
  for (const { fran, allvar } of vm.forbjudnaFraser) {
    const re = new RegExp(fran, "giu");
    let m2; let träffar = 0;
    while ((m2 = re.exec(text)) !== null) {
      träffar++;
      (allvar === "FEL" ? f : v).push({ fras: m2[0], index: m2.index });
      if (m2.index === re.lastIndex) re.lastIndex++;
    }
    if (träffar > 0) console.log(`    träff: "${m2?.[0] ?? "?"}" (${allvar}, ${träffar}×)`);
  }
  return { f, v };
}
const DISCLAIMER = "_Automatiskt utkast ur m9-fabrikens evergreen-serier; den fullständiga AK1A-analysen tillverkas manuellt. Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)._";

// Ren body = bodyn med kvitto-avsnittet strippat (M9-GRANSKNING §1:6), disclaimer behållen sist
const ix = body.indexOf("## Granskningsunderlag — maskinens kvitto");
kontroll("C0:kvitto-markör", ix > 0, `kvitto-avsnitt hittas vid tecken ${ix}`);
const mallDel = body.slice(0, ix).replace(/\n+$/, "");
const renBody = mallDel + "\n\n" + DISCLAIMER;

for (const [namn, yta] of [["hel body", ut.titel + "\n" + ut.ingress + "\n" + body], ["REN body (publik yta)", ut.titel.replace(" (utkast)", "") + "\n" + ut.ingress + "\n" + renBody]]) {
  const r = kontrolleraText(yta);
  kontroll(`C:kontrolleraText:${namn}`, r.f.length === 0 && r.v.length === 0, `FEL ${r.f.length} · VARNINGAR ${r.v.length} (26 fraser ur varumarke.json, spegel av varumarke.ts)`);
}
// rådgivningsglossor (genomläsningssteg)
const glosso = ["\\bköp\\b", "\\bsälj\\b", "rekommender", "\\bbör du\\b", "\\bbör inte\\b", "aktietips", "kursmål", "riskfri", "säker vinst", "garanterad avkastning", "\\bhandla\\b"];
const glosTraff = glosso.map((g) => { const re = new RegExp(g, "giu"); return { g, n: (ut.titel + " " + ut.ingress + " " + renBody).match(re)?.length ?? 0 }; }).filter((x) => x.n > 0);
console.log(`    glossoträffar: ${glosTraff.map((x) => `${x.g}: ${x.n}`).join(", ") || "0"}`);
const handla = renBody.includes("inte en slutsats att handla på");
kontroll("C:glossa", glosTraff.every((x) => ["\\bhandla\\b"].includes(x.g)) && glosTraff.length <= 1, `rädgivningsglossor: endast "handla" i negeringen "inte en slutsats att handla på" (${handla})`);
// investeringsråd endast negerat
const irad = [...renBody.matchAll(/investeringsråd\w*/gi)].map((x) => x[0]);
kontroll("C:investeringsråd", body.includes("aldrig investeringsrådgivning (lagen 2007:528)") && irad.length === 1, `"investeringsrådgivning" ${irad.length} förekomst i ren body = negerad disclaimern`);
// lagrum: endast 2007:528
const andra = ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482"].filter((l) => body.includes(l));
kontroll("C:lagrum", body.includes("2007:528") && andra.length === 0, `2007:528 närvarande · blandade lagrum 0 (${andra.join(",") || "—"})`);
// disclaimer sista rad
const sista = renBody.trimEnd().split("\n").pop().trim();
kontroll("C:disclaimerSist", sista === DISCLAIMER, `disclaimer = sista rad i ren body`);

// ── D. 911-referenser (sex mönster, etablerad standard sedan 09-16) ─────────
console.log("\n── D. 911 ──");
const helaFilen = las("data/blogg-utkast/m9-ko/boerspsykologi-fallstugor-v1.json");
const p911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
const t911 = p911.filter((p) => helaFilen.toLowerCase().includes(p.toLowerCase()));
kontroll("D1:911", t911.length === 0, `${p911.length} mönster → ${t911.length} träffar i HELA filen`);

// ── E. Internlänkar: statiskt + HTTP mot levande sajten ────────────────────
console.log("\n── E. LÄNKAR ──");
const lankar = ["/kurser/km-019-bekraftelsefalla", "/kurser/km-036-overconfidence", "/blogg/mr-market-psykologi-svenska-borsen"];
const statisk = ["/data/seo/kurser/km-019-bekraftelsefalla.json", "/data/seo/kurser/km-036-overconfidence.json", "/data/blogg/mr-market-psykologi-svenska-borsen.json"];
for (const [i, l] of lankar.entries()) {
  const statiskFinns = (() => { try { readFileSync(REPO + statisk[i]); return true; } catch { return false; } })();
  let kod = "?";
  try { const r = await fetch("http://localhost:3000" + l, { redirect: "manual" }); kod = String(r.status); } catch (e) { kod = "ERR:" + e.message.slice(0, 30); }
  kontroll(`E${i + 1}:${l}`, statiskFinns && kod === "200", `statisk ${statiskFinns ? "✓" : "SAKNAS"} · HTTP ${kod}`);
}

// ── F. Struktur + paketmått ─────────────────────────────────────────────────
console.log("\n── F. STRUKTUR/PAKET ──");
const rubHel = (body.match(/^## /gm) ?? []).length;
const rubRen = (renBody.match(/^## /gm) ?? []).length;
kontroll("F1:rubriker", rubHel === 7 && rubRen === 6, `${rubHel} "##" i hel body (kvitto inräknat) · ${rubRen} i ren body — fabrik.kontroll.rubriker = ${ut.fabrik.kontroll.rubriker}`);
kontroll("F2:langd", body.length >= 800 && renBody.length >= 800, `hel ${body.length} tkn · ren ${renBody.length} tkn (krav ≥ 800)`);
const rester = ["## Granskningsunderlag", "kandidatMd5", "mall-md5", "Determinism", "Dataurdrag", "kontrolleraText-förkontroll", "genereradUr"].filter((s) => renBody.includes(s));
kontroll("F3:kvittoRester", rester.length === 0, `kvitto-rester i ren body: ${rester.length}`);
const ord = renBody.split(/\s+/).filter(Boolean).length;
const lasmin = Math.max(1, Math.round(ord / 200));
console.log(`    paketmått: ren body ${renBody.length} tkn · ${ord} ord → readingMinutes ${lasmin} · rubriker ${rubRen}`);
kontroll("F4:lankarKvar", lankar.every((l) => renBody.includes(l)), `3 "Fördjupa dig"-länkar bevarade i ren body`);

// ── Sammanställning ─────────────────────────────────────────────────────────
console.log(`\n═══ RESULTAT: ${ok} OK · ${fel} FEL · ${K.length} kontroller ═══`);
console.log(`PAKET: hel ${body.length} → ren ${renBody.length} tkn · ${ord} ord · ${lasmin} min · rubriker ${rubRen} · disclaimer sist ✓`);
process.exit(fel === 0 ? 0 : 1);
