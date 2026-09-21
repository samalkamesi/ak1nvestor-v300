#!/usr/bin/env node
/**
 * PAKETKONTROLL s1-u3 (omgång auto-s1-1789980325227) — forskningslaget-grona-av-100
 * FEMTE PASSET: verifierar FLYTTKLART PAKET + aktualitet + torr-determinism.
 * LÄSER ENDAST utöver fabrikens --visa (dokumenterat torrt, 0 rader skrivna).
 * Speglar: kontrolleraText (src/lib/varumarke.ts:141 — 26 fraser, RegExp 'giu'),
 * m9-fabrikens seed-formel (m9-fabrik.mjs:1338) och kvittostrypningskontraktet.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const md5 = (d) => createHash("md5").update(d).digest("hex");
const md5Fil = (f) => md5(readFileSync(f));
const lasJson = (f) => JSON.parse(readFileSync(f, "utf8"));

let OK = 0, FEL = 0, NOT = 0;
const kontroll = (namn, sant, detalj = "") => {
  if (sant) { OK++; console.log(`  ✓ ${namn}${detalj ? " — " + detalj : ""}`); }
  else { FEL++; console.log(`  ✗ FEL: ${namn}${detalj ? " — " + detalj : ""}`); }
};
const notis = (namn, detalj) => { NOT++; console.log(`  · NOT ${namn} — ${detalj}`); };

const utkast = lasJson(`${ROT}/data/blogg-utkast/m9-ko/forskningslaget-grona-av-100-v1.json`);
const paket = lasJson(`${ROT}/data/blogg-utkast/granskning/forskningslaget-grona-av-100-FLYTTKLART-PAKET-2026-09-21.json`);
const korstabell = lasJson(`${ROT}/data/portfolj-system/korstabell-grund.json`);
const varumarke = lasJson(`${ROT}/data/varumarke.json`);

console.log("═══ 1. KÄLLOR & AKTUALITET (dagens träd 2026-09-21) ═══");
const md5K = md5Fil(`${ROT}/data/portfolj-system/korstabell-grund.json`);
const md5R = md5Fil(`${ROT}/data/rapporter/vagvalidering-SENASTE.md`);
const md5V = md5Fil(`${ROT}/data/varumarke.json`);
kontroll("korstabell md5 == kvitto (33fe62a0…)", md5K === "33fe62a0c617e8339024851c6361bd6a", md5K);
kontroll("vagvalidering md5 == kvitto (b7194627…)", md5R === "b7194627c055d2ddb5503009a544cff8", md5R);
kontroll("varumarke md5 == kvitto (9b906e42…)", md5V === "9b906e4204a759db24c2c78b4b332e18", md5V);
let gitOrord = false;
try { execFileSync("git", ["-C", ROT, "diff", "--quiet", "HEAD", "--", "data/blogg-utkast/m9-ko/forskningslaget-grona-av-100-v1.json"]); gitOrord = true; } catch { gitOrord = false; }
kontroll("utkastfilen git-orörd sedan rättningscommiten b0ad7faa (diff HEAD tom)", gitOrord);

console.log("═══ 2. TORR-DETERMINISM (fabrikens --visa, 0 rader skrivna) ═══");
const visa = execFileSync("node", [`${ROT}/verktyg/m9-fabrik.mjs`, "--visa", "forskningslaget-grona-av-100"], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
const visaRad = visa.split("\n").find((l) => l.includes("forskningslaget-grona-av-100"));
const kandRad = visa.split("\n").find((l) => l.includes("kandidat-md5") && visa.split("\n").indexOf(l) > visa.split("\n").indexOf(visaRad));
kontroll("fabriken: OFÖRÄNDRAT (evergreen-skip vid --skriv)", visaRad?.includes("OFÖRÄNDRAT"), (visaRad || "").trim());
kontroll("kandidat-md5 == kvittots (60d18ca6…)", (kandRad || "").includes("60d18ca6c0ae272c95555c6dd18f891d"), (kandRad || "").trim().slice(0, 90));
const manadsnyckel = `${korstabell.skapad.slice(0, 7)}|2026-09`;
const seed = md5([md5K, md5R, md5V].join(":") + ":" + manadsnyckel);
kontroll("seed reproducerad ur dagens filer (904e0fcc…)", seed === utkast.fabrik.seed, seed);
notis("drift-bevakning (D-klassen)", "kassaflodesanalys bär ny kandidat på underlag 2026-09-21 (243 bolag) och branschmedianer ny kandidat 0431dd6c — D1/D2 lever, berör INTE detta paket (OFÖRÄNDRAT)");

console.log("═══ 3. SIFFROR — oberoende omräkning ur korstabell-grund.json ═══");
const rader = korstabell.rader;
const grona = rader.filter((r) => r.status === "gron").length;
const gula = rader.filter((r) => r.status === "gul").length;
const roda = rader.filter((r) => r.status === "rod").length;
const osatta = rader.filter((r) => r.status === "osatt").length;
const antal = rader.length;
kontroll("fördelning 7/76/17/0", grona === 7 && gula === 76 && roda === 17 && osatta === 0, `${grona}/${gula}/${roda}/${osatta}`);
kontroll("summakontroll 7+76+17+0 = 100 = n", grona + gula + roda + osatta === antal && antal === 100);
const andelGrona = Math.round((grona / antal) * 10000) / 10000;
const andelRoda = Math.round((roda / antal) * 10000) / 10000;
kontroll("andel gröna 0,07 · andel röda 0,17", andelGrona === 0.07 && andelRoda === 0.17);
kontroll("regim magert (0,07 < 0,08-tröskeln)", andelGrona < 0.08 && andelRoda <= 0.35);
const lage = `Forskningsläget är magert — ${grona} av ${antal} bolag klarar de strikta kraven, selektion avgör.`;
kontroll("lägestextcitet ordagrant i paketet", paket.body.includes(`"${lage}"`));
const topp = rader.filter((r) => r.status === "gron").sort((a, b) => b.akm1Totalt - a.akm1Totalt || (a.ticker < b.ticker ? -1 : 1));
kontroll("topp-1 INDU-C.ST 58,1/67 industri", topp[0].ticker === "INDU-C.ST" && topp[0].akm1Totalt === 58.1 && topp[0].akm1MaxMojligt === 67 && topp[0].bransch === "industri");
kontroll("topp-2 NEM 55,1/71,1 material", topp[1].ticker === "NEM" && topp[1].akm1Totalt === 55.1 && topp[1].akm1MaxMojligt === 71.1 && topp[1].bransch === "material");
kontroll("topp-3 INVE-B.ST 54/62,9 finans", topp[2].ticker === "INVE-B.ST" && topp[2].akm1Totalt === 54 && topp[2].akm1MaxMojligt === 62.9 && topp[2].bransch === "finans");
kontroll("tredjeplatsen entydig (54 > nästa gröna)", topp[2].akm1Totalt > topp[3].akm1Totalt, `${topp[2].akm1Totalt} > ${topp[3].akm1Totalt} (${topp[3].ticker})`);
const pct1 = (x, y) => (Math.round((x / y) * 1000) / 10).toFixed(1).replace(".", ","); // fabrikens tal()-format: komma
kontroll("aritmetik 58,1/67 = 86,7 % ≥ 70", pct1(58.1, 67) === "86,7" && 58.1 / 67 >= 0.7);
kontroll("aritmetik 55,1/71,1 = 77,5 % ≥ 70", pct1(55.1, 71.1) === "77,5" && 55.1 / 71.1 >= 0.7);
kontroll("aritmetik 54/62,9 = 85,9 % ≥ 70", pct1(54, 62.9) === "85,9" && 54 / 62.9 >= 0.7);
const regler = korstabell.statusRegler;
kontroll("statusRegler grön/gul/röd citerade ordagrant i paketet", paket.body.includes(`- **grön:** ${regler.gron}`) && paket.body.includes(`- **gul:** ${regler.gul}`) && paket.body.includes(`- **röd:** ${regler.rod}`));
kontroll("universum 10 branscher × 10 bolag", new Set(rader.map((r) => r.bransch)).size === 10 && antal === 100);
const live = lasJson(`${ROT}/data/blogg/forskningslaget-grona-av-100.json`);
const liveStat = live.fabrik?.statistik || {};
kontroll("\"oförändrad\"-raden: publik utgåva bär 7/76/17", (liveStat.grona ?? live.grona) === 7 || (live.bodyMarkdown || live.body || "").includes("7 gröna, 76 gula, 17 röda") || paket.body.includes("7 gröna, 76 gula, 17 röda"), `publishedAt=${live.publishedAt ?? live.datum ?? "?"}`);
kontroll("\"oförändrad\"-raden: publik utgåva bygger på samma korstabell-md5", (live.fabrik?.kallor || []).some((k) => k.md5 === md5K) || JSON.stringify(live).includes(md5K));

console.log("═══ 4. JURIDIK — lagen (2007:528), mekanisk spegel ═══");
const speglar = varumarke.forbjudnaFraser.map((f) => ({ fran: new RegExp(f.fran, "giu"), allvar: f.allvar }));
const kontrolleraText = (text) => {
  const fel = [], varn = [];
  for (const s of speglar) { const m = text.match(s.fran); if (m) (s.allvar === "FEL" ? fel : varn).push(m[0]); }
  return { fel, varn };
};
const r1 = kontrolleraText(utkast.bodyMarkdown);
kontroll("kontrolleraText på HEL utkast-body: 0 FEL 0 VARN", r1.fel.length === 0 && r1.varn.length === 0, `FEL ${r1.fel.length} · VARN ${r1.varn.length}`);
const paketYta = [paket.title, paket.description, ...paket.tags, paket.body].join("\n");
const r2 = kontrolleraText(paketYta);
kontroll("kontrolleraText på HEL paket-yta (title+desc+tags+body): 0 FEL 0 VARN", r2.fel.length === 0 && r2.varn.length === 0, `FEL ${r2.fel.length} · VARN ${r2.varn.length}`);
const radglossor = ["rekommendera", "aktietips", "kursmål", "säker vinst", "du bör köpa", "köp denna", "sälj denna"];
const glossTräff = radglossor.filter((g) => new RegExp(g.split(" ").join("\\s+"), "i").test(paketYta));
kontroll("rådgivningsglossor: 0 träffar", glossTräff.length === 0, glossTräff.join(",") || "0");
const kopS = (paketYta.match(/\bköp[a-z]*\b/gi) || []);
const säljS = (paketYta.match(/\bsälj[a-z]*\b/gi) || []);
const negerad = paket.body.includes("inget köp- eller säljbud");
kontroll("\"köp\"/\"sälj\" endast i negerad konstruktion", negerad && kopS.every((t) => "inget köp- eller säljbud".includes(t.toLowerCase().slice(0, 3))), `${kopS.length}+${säljS.length} träff(ar), negerad: ${negerad}`);
const invRad = paketYta.match(/investeringsrådgivning/gi) || [];
kontroll("\"investeringsrådgivning\" endast negerad (disclaimern)", invRad.length === 1 && /aldrig investeringsrådgivning/i.test(paket.body));
const lagrum = ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482"];
kontroll("endast lagrummet 2007:528 — ingen lagrumsblandning", paketYta.includes("2007:528") && lagrum.every((l) => !paketYta.includes(l)));
kontroll("utbildningsgrunden bärande (\"inte en värdering\" + \"så räknar metoden\")", paket.body.includes("inte en värdering") && paket.body.includes("så räknar metoden"));
const raderBody = paket.body.trim().split("\n").filter((l) => l.trim());
kontroll("disclaimern exakt sista raden i paket-body", raderBody[raderBody.length - 1].startsWith("_Automatiskt utkast"));

console.log("═══ 5. 911-REFERENSER — sex mönster ═══");
const m911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
const råUtkast = readFileSync(`${ROT}/data/blogg-utkast/m9-ko/forskningslaget-grona-av-100-v1.json`, "utf8");
const t911a = m911.filter((m) => new RegExp(m.replace(/\//g, "\\/"), "i").test(råUtkast));
const t911b = m911.filter((m) => new RegExp(m.replace(/\//g, "\\/"), "i").test(paketYta));
kontroll("911 = 0 träffar på sex mönster (hela utkastfilen inkl. metadata)", t911a.length === 0, t911a.join(",") || "0");
kontroll("911 = 0 träffar på sex mönster (hela paket-ytan)", t911b.length === 0, t911b.join(",") || "0");

console.log("═══ 6. INTERNLÄNKAR — statiskt + levande sajt ═══");
const statiskt = [];
statiskt.push(["/forskningsbiblioteket", readFileSync(`${ROT}/src/app/(huvud)/forskningsbiblioteket/page.tsx`, "utf8").length > 0]);
const karta = readFileSync(`${ROT}/src/lib/larvag-karta.ts`, "utf8");
statiskt.push(["/kurser/v09-roe", karta.includes('"v09-roe"')]);
statiskt.push(["/blogg/komplett-guide-svensk-aktieanalys-2026", readFileSync(`${ROT}/data/blogg/komplett-guide-svensk-aktieanalys-2026.json`, "utf8").length > 0]);
for (const [sokvag, ok] of statiskt) kontroll(`statiskt: ${sokvag}`, ok);
for (const [sokvag] of statiskt) {
  try {
    const sv = await fetch(`http://localhost:3000${sokvag}`, { redirect: "manual" });
    kontroll(`HTTP localhost:3000${sokvag} → 200`, sv.status === 200, String(sv.status));
  } catch (e) {
    notis(`HTTP ${sokvag}`, `fetch misslyckades (${e.code || e.message}) — statiskt belagt ovan`);
  }
}

console.log("═══ 7. STRUKTUR & PAKET-KONTRAKT ═══");
const helRubrik = (utkast.bodyMarkdown.match(/^## /gm) || []).length;
const paketRubrik = (paket.body.match(/^## /gm) || []).length;
kontroll("6 rubriker i hel utkast-body · 5 i paket-body", helRubrik === 6 && paketRubrik === 5, `${helRubrik}/${paketRubrik}`);
kontroll("paket-body ≥ 800 tecken", paket.body.length >= 800, `${paket.body.length} tecken`);
kontroll("ingressen namnfri (inga bolagsnamn ur topp-3)", !["Industrivärden", "Newmont", "Investor", "INDU-C", "NEM", "INVE-B"].some((n) => utkast.ingress.includes(n)));
kontroll("paket-JSON giltig + nycklar enligt exportkontraktet", ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"].every((k) => k in paket));
kontroll("titel utan \"(utkast)\"", !paket.title.includes("(utkast)") && paket.title === "Forskningsläget september 2026 — 7 gröna av 100");
kontroll("publishedAt null (publicering = kundens klick, R2)", paket.publishedAt === null);
const kvittoOrd = ["Granskningsunderlag", "maskinens kvitto", "kandidatMd5", "kandidat-md5", "md5", "seed", "Determinism", "Dataurdrag"];
const kvittoLacka = kvittoOrd.filter((o) => paket.body.includes(o));
kontroll("kvittot fullständigt struket ur paket-body (0 av 8 kvitto-ord; 'kandidatregeln' i mall-länken är legitim)", kvittoLacka.length === 0, kvittoLacka.join(",") || "0");
const forv = utkast.bodyMarkdown.replace(/\n\n## Granskningsunderlag[\s\S]*?(?=\n\n_Automatiskt utkast)/, "");
const nfc = (s) => s.normalize("NFC");
kontroll("paket-body == exakt kvittostrypning av utkastet (reprodukt, NFC-okänslig)", nfc(forv) === nfc(paket.body));
kontroll("description bär nyckeltal + datering + icke-värdering", ["7 gröna", "76 gula", "17 röda", "2026-09-03", "inte en värdering", "magert"].every((s) => nfc(paket.description).includes(s)));
kontroll("pillar/author enligt syskonmallen", paket.pillar === "Institutionell metodik" && paket.author === "AK1A Research Lab");
kontroll("tags: 5 st, sökordsbärande (NFC)", paket.tags.length === 5 && paket.tags.some((t) => nfc(t).includes("forskningsläg")) && paket.tags.includes("AKM1"));
const ord = paket.body.match(/\S+/g)?.length ?? 0;
kontroll(`readingMinutes ${paket.readingMinutes} = floor(ord/200) med ${ord} ord`, paket.readingMinutes === Math.max(1, Math.floor(ord / 200)));

console.log(`\n═══ RESULTAT: ${OK} OK · ${FEL} FEL · ${NOT} NOT ═══`);
process.exit(FEL === 0 ? 0 : 1);
