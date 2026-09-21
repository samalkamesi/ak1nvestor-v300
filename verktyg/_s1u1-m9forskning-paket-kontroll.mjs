#!/usr/bin/env node
/**
 * KONTROLLSOND m9-5 — forskningslaget-grona-av-100, FJÄRDE PASSET: paketklassen
 * (fabrik auto-s1-1789980325227 s1-u1, 2026-09-21)
 * ===========================================================================
 * Bygger vidare på den bevisade 09-16-sonden (.zcode/granskning-m9-
 * forskningslaget-verify.mjs, 47/47) och tillför paketleveransens kontroller:
 *   källor (md5 mot DAGENS träd 09-21) → siffror (egen omräkning) →
 *   determinism (seed/mallMd5/kandidatMd5 + F1+F2-fotspår) → juridik 2007:528
 *   (kontrolleraText-spegel på mall OCH paket) → 911 (sex mönster) →
 *   internlänkar LIVE (localhost:3000) → struktur → PAKET-bygge med tre
 *   grindar (vägrar skriva vid rött) + rm-konvention + JSON-giltighet.
 * Skriver ENDAST paketfilen i data/blogg-utkast/granskning/ — data/ i övrt LÄSES.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const md5 = (d) => createHash("md5").update(d).digest("hex");
const md5Fil = (f) => md5(readFileSync(f));
const lasJson = (f) => JSON.parse(readFileSync(f, "utf8"));

let OK = 0, FEL = 0;
const kontroll = (namn, sant, detalj = "") => {
  if (sant) { OK++; console.log(`  ✓ ${namn}${detalj ? " — " + detalj : ""}`); }
  else { FEL++; console.log(`  ✗ FEL: ${namn}${detalj ? " — " + detalj : ""}`); }
};

const utkast = lasJson(`${ROT}/data/blogg-utkast/m9-ko/forskningslaget-grona-av-100-v1.json`);
const original = JSON.parse(execFileSync("git", ["-C", ROT, "show", "584ffcf8:data/blogg-utkast/m9-ko/forskningslaget-grona-av-100-v1.json"], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }));

console.log("═══ 1. KÄLLOR — md5 mot dagens träd (2026-09-21) ═══");
const FIL_KORSTABELL = `${ROT}/data/portfolj-system/korstabell-grund.json`;
const FIL_RAPPORT = `${ROT}/data/rapporter/vagvalidering-SENASTE.md`;
const FIL_VARUMARKE = `${ROT}/data/varumarke.json`;
const md5K = md5Fil(FIL_KORSTABELL), md5R = md5Fil(FIL_RAPPORT), md5V = md5Fil(FIL_VARUMARKE);
kontroll("korstabell-grund.json md5", md5K === "33fe62a0c617e8339024851c6361bd6a", md5K);
kontroll("vagvalidering-SENASTE.md md5", md5R === "b7194627c055d2ddb5503009a544cff8", md5R);
kontroll("varumarke.json md5", md5V === "9b906e4204a759db24c2c78b4b332e18", md5V);
kontroll("kvittots 3 källrader == faktiska md5:er", utkast.fabrik.kallor.map((k) => k.md5).join(":") === [md5K, md5R, md5V].join(":"));
kontroll("AKTUALITET: källorna oförändrade även 09-21 (D1-drift berör ej denna serie)", md5K === utkast.fabrik.kallor[0].md5 && md5R === utkast.fabrik.kallor[1].md5, "kedjan sluten utan git-återvinning av indata");

console.log("═══ 2. SIFFROR — oberoende omräkning ur korstabell-grund.json ═══");
const korstabell = lasJson(FIL_KORSTABELL);
const rader = korstabell.rader;
const grona = rader.filter((r) => r.status === "gron").length;
const gula = rader.filter((r) => r.status === "gul").length;
const roda = rader.filter((r) => r.status === "rod").length;
const osatta = rader.filter((r) => r.status === "osatt").length;
const antal = rader.length;
kontroll("7 gröna · 76 gula · 17 röda · 0 osatta", grona === 7 && gula === 76 && roda === 17 && osatta === 0, `${grona}/${gula}/${roda}/${osatta}`);
kontroll("summakontroll = 100 rader", grona + gula + roda + osatta === antal && antal === 100, `n=${antal}`);
kontroll("andel gröna 7 %, andel röda 17 %", Math.round((grona / antal) * 10000) / 10000 === 0.07 && Math.round((roda / antal) * 10000) / 10000 === 0.17);
const T = { riktGrona: 0.1, riktRoda: 0.3, magertGrona: 0.08, magertRoda: 0.35 };
const andelGrona = 0.07, andelRoda = 0.17;
const typ = andelGrona >= T.riktGrona && andelRoda <= T.riktRoda ? "rikt" : andelGrona < T.magertGrona || andelRoda > T.magertRoda ? "magert" : "balanserat";
kontroll("regimen magert (0,07 < 0,08-tröskeln)", typ === "magert", typ);
const marknadslage = `Forskningsläget är magert — ${grona} av ${antal} bolag klarar de strikta kraven, selektion avgör.`;
kontroll("lägestextcitat ordagrant (motor-formeln)", utkast.bodyMarkdown.includes(`"${marknadslage}"`), "citerad med citationstecken i bodyn");
const topp = rader.filter((r) => r.status === "gron").sort((a, b) => b.akm1Totalt - a.akm1Totalt || (a.ticker < b.ticker ? -1 : 1)).slice(0, 3);
kontroll("topp-1 Industrivärden INDU-C.ST industri 58,1/67", topp[0].ticker === "INDU-C.ST" && topp[0].akm1Totalt === 58.1 && topp[0].akm1MaxMojligt === 67, `${topp[0].ticker} ${topp[0].akm1Totalt}/${topp[0].akm1MaxMojligt} bransch=${topp[0].bransch}`);
kontroll("topp-2 Newmont NEM material 55,1/71,1", topp[1].ticker === "NEM" && topp[1].akm1Totalt === 55.1 && topp[1].akm1MaxMojligt === 71.1, `${topp[1].ticker} ${topp[1].akm1Totalt}/${topp[1].akm1MaxMojligt} bransch=${topp[1].bransch}`);
kontroll("topp-3 Investor INVE-B.ST finans 54/62,9", topp[2].ticker === "INVE-B.ST" && topp[2].akm1Totalt === 54 && topp[2].akm1MaxMojligt === 62.9, `${topp[2].ticker} ${topp[2].akm1Totalt}/${topp[2].akm1MaxMojligt} bransch=${topp[2].bransch}`);
kontroll("tredjeplatsen entydig (54 > nästa gröna)", topp[2].akm1Totalt > Math.max(...rader.filter((r) => r.status === "gron" && !topp.slice(0, 3).map((t) => t.ticker).includes(r.ticker)).map((r) => r.akm1Totalt)));
kontroll("aritmetik 58,1/67 = 86,7 % > 70", Math.round((58.1 / 67) * 1000) / 10 === 86.7 && 58.1 / 67 >= 0.7);
kontroll("aritmetik 55,1/71,1 = 77,5 % > 70", Math.round((55.1 / 71.1) * 1000) / 10 === 77.5 && 55.1 / 71.1 >= 0.7);
kontroll("aritmetik 54/62,9 = 85,9 % > 70", Math.round((54 / 62.9) * 1000) / 10 === 85.9 && 54 / 62.9 >= 0.7);
const regler = korstabell.statusRegler || {};
kontroll("statusRegler.gron citerad ordagrant", utkast.bodyMarkdown.includes(`- **grön:** ${regler.gron}`));
kontroll("statusRegler.gul citerad ordagrant", utkast.bodyMarkdown.includes(`- **gul:** ${regler.gul}`));
kontroll("statusRegler.rod citerad ordagrant", utkast.bodyMarkdown.includes(`- **röd:** ${regler.rod}`));
kontroll("tröskeltexten: rikt ≥10 %/≤30 %, magert <8 %>35 %", utkast.bodyMarkdown.includes("rikt kräver andel gröna ≥ 10 % OCH andel röda ≤ 30 %; magert inträffar när andel gröna < 8 % ELLER andel röda > 35 %"));
const unikaBranscher = new Set(rader.map((r) => r.bransch)).size;
kontroll("100-bolagsuniversum = 10 branscher × 10 bolag", unikaBranscher === 10 && antal === 100, `${unikaBranscher} branscher`);
kontroll("dateringen 2026-09-03 = korstabellens egna skapad", korstabell.skapad === "2026-09-03" && utkast.bodyMarkdown.includes("Underlag daterat 2026-09-03"));
const publik = lasJson(`${ROT}/data/blogg/forskningslaget-grona-av-100.json`);
const forra = publik.fabrik?.statistik ?? null;
kontroll("\"Fördelningen oförändrad\" — publik utgåva 7/76/17/0", !!forra && forra.grona === 7 && forra.gula === 76 && forra.roda === 17, `publishedAt=${publik.publishedAt}`);
kontroll("publik utgåva bygger på SAMMA korstabell (md5)", publik.fabrik?.kallor?.[0]?.md5 === md5K);

console.log("═══ 3. DETERMINISM — seed, mall, mallMd5, kandidatMd5 (fabriksspegel) ═══");
const rapportText = readFileSync(FIL_RAPPORT, "utf8");
const domdatum = rapportText.match(/\*\*Domdatum:\*\* (\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
kontroll("rapportens domdatum parsad (fabrikens regex)", domdatum === "2026-09-04", domdatum);
const manadsnyckel = `${korstabell.skapad.slice(0, 7)}|${domdatum.slice(0, 7)}`;
const seed = md5([md5K, md5R, md5V].join(":") + ":" + manadsnyckel);
kontroll("seed reproducerad (md5 av käll-md5:er + månadsnyckel ur underlagens datum)", seed === utkast.fabrik.seed, `${seed} (${manadsnyckel})`);
const statistik = { universum: antal, grona, gula, roda, osatta, andelGrona, andelRoda, typ, marknadslage, datum: korstabell.skapad };
kontroll("statistik-objektet reproducerat (key-ordning känslig)", JSON.stringify(statistik) === JSON.stringify(forra), "identisk med publik utgåvas fabrik.statistik");
const tal = (x, d = 1) => Number(x).toFixed(d).replace(/\.?0+$/, "").replace(".", ",");
const pct = (x, d = 1) => tal(x * 100, d) + " %";
const kortNamn = (namn) => { let n = String(namn).replace(/\s*\(publ\)\s*$/i, "").replace(/^\s*AB\s+/i, "").replace(/\s+AB$/i, "").trim(); const sfx = /\s*,?\s+(Inc\.|Corporation|A\/S|Abp|Oyj|ASA|NV|S\.A\.|PLC|LLC|Aktiengesellschaft|SE & Co\. KGaA)$/i; while (sfx.test(n)) n = n.replace(sfx, "").trim(); return n; };
const branschNamn = (b) => ({ halso: "hälsa", tillvaxt: "tillväxt" }[b] ?? b);
const toppK = topp.map((r) => ({ ticker: r.ticker, namn: kortNamn(r.namn), bransch: branschNamn(r.bransch), akm1Totalt: r.akm1Totalt, akm1MaxMojligt: typeof r.akm1MaxMojligt === "number" ? r.akm1MaxMojligt : null, andelAvMax: typeof r.akm1MaxMojligt === "number" && r.akm1MaxMojligt > 0 ? Math.round((r.akm1Totalt / r.akm1MaxMojligt) * 1000) / 1000 : null }));
const kallor = [
  { fil: "data/portfolj-system/korstabell-grund.json", md5: md5K, datum: korstabell.skapad },
  { fil: "data/rapporter/vagvalidering-SENASTE.md", md5: md5R, datum: domdatum },
  { fil: "data/varumarke.json", md5: md5V },
];
kontroll("kvittots kallor-array reproducerad (fält+ordning)", JSON.stringify(kallor) === JSON.stringify(utkast.fabrik.kallor));
const datum = korstabell.skapad;
const urdrag = [
  { varde: `${grona} gröna · ${gula} gula · ${roda} röda · ${osatta} osatta`, datum, notering: "statusfördelning, korstabellens rader" },
  { varde: `andel gröna ${pct(andelGrona, 0)}, andel röda ${pct(andelRoda, 0)}`, datum, notering: `regim ${typ} (trösklar: rikt ≥10 % och ≤30 %; magert <8 % eller >35 %)` },
  ...toppK.map((t) => ({ varde: `${t.ticker} AKM1 ${tal(t.akm1Totalt)}/${t.akm1MaxMojligt !== null ? tal(t.akm1MaxMojligt) : "?"}`, datum, notering: `grönt toppbolag (${t.bransch})` })),
];
const sortNycklar = (o) => (Array.isArray(o) ? o.map(sortNycklar) : o && typeof o === "object" ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, sortNycklar(o[k])])) : o);
kontroll("kvittots 5 urdrag reproducerade (värde · datum · notering)", JSON.stringify(sortNycklar(urdrag)) === JSON.stringify(sortNycklar(utkast.fabrik.urdrag)));
const rad = [];
rad.push(`${grona} av ${antal} bolag i korstabellens universum är gröna just nu. Regimen är **${typ}**: "${marknadslage}" — lägestexten ordagrant ur forskningsläges-motorn, som räknar ur fasta trösklar, inte tycke. Fördelningen: ${grona} gröna · ${gula} gula · ${roda} röda · ${osatta} osatta. Underlag daterat ${datum}.`);
rad.push(`## Vad färgerna betyder`);
rad.push(`Statusklassningen är korstabellens egen regelverk, citerat ordagrant ur underlaget (${datum}):`);
rad.push([regler.gron, regler.gul, regler.rod].filter(Boolean).map((r, i) => `- **${["grön", "gul", "röd"][i]}:** ${r}`).join("\n"));
rad.push(`## Regimen och dess trösklar`);
rad.push(`Regimen räknas ur fasta trösklar: rikt kräver andel gröna ≥ 10 % OCH andel röda ≤ 30 %; magert inträffar när andel gröna < 8 % ELLER andel röda > 35 %; däremellan är läget balanserat. I detta underlag: andel gröna ${pct(andelGrona, 0)} och andel röda ${pct(andelRoda, 0)} — utfallet blir ${typ}. Samma underlag ger alltid samma text; trösklarna är skrivna före datan.`);
rad.push(`## De tre högt rankade gröna bolagen`);
rad.push(`Bland de gröna bolagen har dessa tre högst AKM1-poäng i underlaget (daterat ${datum}) — en deskriptiv rankning ur data, inte en värdering:`);
rad.push(toppK.map((t) => `- **${t.namn}** (${t.ticker}, ${t.bransch}) — AKM1 ${tal(t.akm1Totalt)} av ${t.akm1MaxMojligt !== null ? tal(t.akm1MaxMojligt) : "?"} möjliga poäng${t.andelAvMax !== null ? ` (${pct(t.andelAvMax)})` : ""}`).join("\n"));
rad.push(`Urvalet är korstabellens ${antal}-bolagsuniversum (10 branscher × 10 bolag) — talen är urvalsberoende och säger inget om bolag utanför universum. Dateringen kommer ur underlaget själv (skapad ${datum}), aldrig ur klockan.`);
rad.push(`## Ändringen sedan senaste publicerade utgåvan`);
rad.push(forra && forra.grona === grona && forra.gula === gula && forra.roda === roda && forra.typ === typ ? `Fördelningen oförändrad sedan den publicerade utgåvan: ${grona} gröna, ${gula} gula, ${roda} röda.` : "(delta-rad)");
rad.push(`## Fördjupa dig`);
rad.push(`- [Forskningsbiblioteket](/forskningsbiblioteket) — bolagen som klarade kandidatregeln, med urvalsregel och utfall\n- [Kursen V09 ROE](/kurser/v09-roe) — variabeln bakom lönsamhetspoängen\n- [Komplett guide till svensk aktieanalys](/blogg/komplett-guide-svensk-aktieanalys-2026) — metodiken från grunden`);
const DISCLAIMER_RAD = "_Automatiskt utkast ur m9-fabrikens evergreen-serier; den fullständiga AK1A-analysen tillverkas manuellt. Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)._";
const mallUtanDisclaimer = rad.join("\n\n");
const mallBody = mallUtanDisclaimer + "\n\n" + DISCLAIMER_RAD;
const orgBody = original.bodyMarkdown;
const orgDelar = orgBody.split("\n\n## Granskningsunderlag — maskinens kvitto");
const orgMallUtan = orgDelar[0];
const orgRest = orgDelar[1];
kontroll("mall-bodyn regenererad BYTE-IDENTISK ur DAGENS källor", mallBody === orgMallUtan + "\n\n" + DISCLAIMER_RAD, `${mallBody.length} tecken`);
const mallMd5 = md5(JSON.stringify({ slug: utkast.slug, titel: utkast.titel, ingress: utkast.ingress, bodyMall: mallBody, statistik, urdrag, kallor, seed, version: "m9-fabrik-v2" }));
kontroll("mallMd5 reproducerad", mallMd5 === "f095edf7541c259ad560e7faa60d3d22", mallMd5);
kontroll("kvittots inbäddade mall-md5-sträng == reproducerad", orgRest.includes(`mall-md5 \`${mallMd5}\``));
const kandidatMd5 = md5(JSON.stringify({ slug: utkast.slug, titel: utkast.titel, ingress: utkast.ingress, bodyMarkdown: orgBody, statistik, urdrag, kallor, seed, version: "m9-fabrik-v2" }));
kontroll("kandidatMd5 reproducerad över HELA original-bodyn", kandidatMd5 === utkast.fabrik.kandidatMd5 && kandidatMd5 === "60d18ca6c0ae272c95555c6dd18f891d", kandidatMd5);
let b = orgBody;
const F1 = [
  ["## De tre högt rankade gröna bolagen", "## Så räknar metoden — exempel ur det gröna utfallet"],
  ["Bland de gröna bolagen har dessa tre högst AKM1-poäng i underlaget (daterat 2026-09-03) — en deskriptiv rankning ur data, inte en värdering:", "För att visa hur räkningen går till tittar vi på de tre högsta AKM1-poängen bland de gröna bolagen i underlaget (daterat 2026-09-03). Så räknar metoden: AKM1-poängen delas med akm1MaxMojligt (maxpoängen för bolagets datatackning) — andelen avgör färgen och grön kräver ≥ 70 %. Bolagen nedan är illustrativa exempel på beräkningen, inte en värdering och inget köp- eller säljbud:"],
  ["- **Industrivärden** (INDU-C.ST, industri) — AKM1 58,1 av 67 möjliga poäng (86,7 %)", "- **Industrivärden** (INDU-C.ST, industri) — så räknar metoden: 58,1 / 67 = 86,7 %, över gröntröskeln 70 %"],
  ["- **Newmont** (NEM, material) — AKM1 55,1 av 71,1 möjliga poäng (77,5 %)", "- **Newmont** (NEM, material) — så räknar metoden: 55,1 / 71,1 = 77,5 %, över gröntröskeln 70 %"],
  ["- **Investor** (INVE-B.ST, finans) — AKM1 54 av 62,9 möjliga poäng (85,9 %)", "- **Investor** (INVE-B.ST, finans) — så räknar metoden: 54 / 62,9 = 85,9 %, över gröntröskeln 70 %"],
];
for (const [fran, till] of F1) { if (b.includes(fran)) b = b.replace(fran, till); else { FEL++; console.log(`  ✗ FEL: F1-källa saknas: ${fran.slice(0, 60)}…`); } }
const F2 = ["Urvalet är korstabellens 100-bolagsuniversum", "En jämförbarhetsnot: Industrivärden och Investor är investmentbolag — AKM-poängen mäts på portföljförvaltning, inte löpande verksamhet, så deras höga andel speglar innehavens substans snarare än en driftsrörelse. Det är information om metoden, inte fel i den.\n\nUrvalet är korstabellens 100-bolagsuniversum"];
const i2 = b.indexOf(F2[0]);
kontroll("F2-jämförbarhetsnoten insatt före urvalsstycket (exakt position)", i2 > 0 && b.slice(0, i2).includes("över gröntröskeln 70 %"));
b = b.replace(F2[0], F2[1]);
kontroll("dagens body == original + EXAKT v151 F1+F2 (inget annat ändrat)", b === utkast.bodyMarkdown);

console.log("═══ 4. JURIDIK — 2007:528 mekanisk spegel (mall + PAKET-ytan) ═══");
const mallNu = utkast.bodyMarkdown.split("\n\n## Granskningsunderlag")[0] + (utkast.bodyMarkdown.endsWith(DISCLAIMER_RAD) ? "\n\n" + DISCLAIMER_RAD : "");
const fraser = lasJson(FIL_VARUMARKE).forbjudnaFraser;
const korpera = (yta) => {
  let fel = 0, varn = 0; const traffar = [];
  for (const f of fraser) {
    const re = new RegExp(f.fran, "gi");
    const t = (yta.match(re) || []).length;
    if (t > 0) { fel += f.allvar === "FEL" ? t : 0; varn += f.allvar !== "FEL" ? t : 0; traffar.push(`${f.fran} (${f.allvar}) ×${t}`); }
  }
  return { fel, varn, traffar };
};
const rMall = korpera(mallNu);
kontroll("kontrolleraText-spegel på mallen (26 fraser): FEL 0 · VARNINGAR 0", rMall.fel === 0 && rMall.varn === 0, rMall.traffar.join("; ") || "ren");
const glossor = /(?<![\p{L}])(rekommender\w*|aktietips|kursmål|riskfri\w*|säker vinst|garanterad avkastning)(?![\p{L}])|du bör (?:köpa|sälja|investera)|(?:köp|sälj) (?:denna|den här|detta)/giu;
const gTräff = (mallNu.match(glossor) || []);
kontroll("rådgivningsglossor: 0 träffar", gTräff.length === 0, gTräff.join(", "));
const kopS = mallNu.match(/(?<![\p{L}])(köp|sälj)(?![\p{L}])/gu) || [];
kontroll("\"köp\"/\"sälj\" endast i negerad konstruktion", kopS.length === 1 && mallNu.includes("inget köp- eller säljbud"), `${kopS.length} träff(ar)`);
kontroll("\"investeringsrådgivning\" endast negerad (disclaimer)", /aldrig investeringsrådgivning/.test(mallNu) && !mallNu.replace(/aldrig investeringsrådgivning/, "").includes("investeringsrådgivning"));
kontroll("endast lagrummet 2007:528 — ingen lagrumsblandning", /2007:528/.test(mallNu) && !/(2022:260|2022:261|1985:716|2005:59|2022:482)/.test(mallNu));
kontroll("utbildningsgrunden buren (metodik-framställning, trösklar, \"inte en värdering\")", mallNu.includes("inte en värdering") && mallNu.includes("fasta trösklar"));

console.log("═══ 5. 911-REFERENSER — sex mönster, HELA filen + paketet ═══");
const hela = JSON.stringify(utkast);
let n911 = 0;
for (const p of ["911", "11 september", "september 2001", "9/11", "terror", "[Tt]errordåd"]) { const t = (hela.match(new RegExp(p, "g")) || []).length; if (t > 0) { n911 += t; console.log(`    träff: ${p} ×${t}`); } }
kontroll("911 = 0 träffar på sex mönster (hel fil inkl. metadata)", n911 === 0);

console.log("═══ 6. INTERNLÄNKAR — LIVE mot localhost:3000 ═══");
const lankar = ["/forskningsbiblioteket", "/kurser/v09-roe", "/blogg/komplett-guide-svensk-aktieanalys-2026"];
for (const stig of lankar) {
  try {
    const res = await fetch(`http://localhost:3000${stig}`, { redirect: "manual" });
    kontroll(`HTTP ${stig} — 200`, res.status === 200, `status ${res.status}`);
  } catch (e) { kontroll(`HTTP ${stig} — 200`, false, e.message); }
}

console.log("═══ 7. STRUKTUR OCH METADATA ═══");
const rubriker = (utkast.bodyMarkdown.match(/^## /gm) || []).length;
kontroll("6 \"##\"-rubriker i hel body (kvittots kontroll-block)", rubriker === 6 && utkast.fabrik.kontroll.rubriker === 6, `${rubriker}`);
const mallRubriker = (mallNu.match(/^## /gm) || []).length;
kontroll("5 \"##\"-rubriker i mallen (kvittots struktur-rad)", mallRubriker === 5 && orgRest.includes('5 "##"-rubriker'));
kontroll("disclaimer sista raden", utkast.bodyMarkdown.endsWith(DISCLAIMER_RAD) && utkast.fabrik.kontroll.disclaimerSist === true);
kontroll("body ≥ 800 tecken", utkast.bodyMarkdown.length >= 800 && mallNu.length >= 800, `${utkast.bodyMarkdown.length} tecken`);
kontroll("status \"utkast\" · version 1 · (utkast)-suffix i titel", utkast.status === "utkast" && utkast.version === 1 && utkast.titel.endsWith(" (utkast)"));
kontroll("fabrik.serie forskningslaget · manad 2026-09 · m9-fabrik-v2", utkast.fabrik.serie === "forskningslaget" && utkast.fabrik.manad === "2026-09" && utkast.fabrik.version === "m9-fabrik-v2");
kontroll("ingressen namnfri (inga bolagsnamn)", !/Industrivärden|Newmont|Investor/.test(utkast.ingress));
kontroll("kvitto-notering: maskinens granskningskö-notis närvarande", utkast.fabrik.notering.includes("MÄNSKLIG GRANSKNING"));

console.log("═══ 8. PAKET-BYGGE — exportytan (syskonklassen m9-1..4) ═══");
const paketBody = mallNu; // = body utan kvitto, disclaimer sist — EXAKT exportytan
const ord = paketBody.split(/\s+/).filter(Boolean).length;
const rm = Math.round(ord / 200);
kontroll("paket-bodyn == mallen (kvitto stryket vid export)", paketBody === utkast.bodyMarkdown.split("\n\n## Granskningsunderlag")[0] + "\n\n" + DISCLAIMER_RAD);
kontroll("paket-bodyn innehåller INTE kvitto-avsnittet", !paketBody.includes("Granskningsunderlag") && !paketBody.includes("seed"));
kontroll("paket-bodyn slutar med disclaimern", paketBody.endsWith(DISCLAIMER_RAD));
kontroll(`readingMinutes = round(ord/200) = ${rm} (syskonkonventionen: 406→2, 518→3, 548→3)`, rm >= 2 && rm <= 3, `${ord} ord`);
const PAKET_TITEL = utkast.titel.replace(/ \(utkast\)$/, "");
kontroll("paket-titel utan (utkast)-suffix", PAKET_TITEL === "Forskningsläget september 2026 — 7 gröna av 100", PAKET_TITEL);
const PAKET_DESC = "Statusfördelningen i korstabellens 100-bolagsuniversum: 7 gröna, 76 gula, 17 röda — regimen är magert enligt fasta trösklar. Tre exempel visar hur grönstatusen räknas. En deskriptiv översikt, inte en värdering. Underlag daterat 2026-09-03.";
kontroll("description handskriven, syskonintervall 190–270 tkn", PAKET_DESC.length >= 190 && PAKET_DESC.length <= 270, `${PAKET_DESC.length} tkn`);
const rPaket = korpera(paketBody + " " + PAKET_DESC);
kontroll("kontrolleraText på HEL paketyta (body+description): FEL 0 · VARNINGAR 0", rPaket.fel === 0 && rPaket.varn === 0, rPaket.traffar.join("; ") || "ren");
let d911 = 0;
for (const p of ["911", "11 september", "september 2001", "9/11", "terror", "[Tt]errordåd"]) { const t = ((paketBody + PAKET_DESC).match(new RegExp(p, "g")) || []).length; d911 += t; }
kontroll("911 = 0 även på paketytan", d911 === 0);
const paket = {
  slug: utkast.slug,
  title: PAKET_TITEL,
  description: PAKET_DESC,
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: null,
  readingMinutes: rm,
  tags: ["forskningsläget", "AKM1", "statusfördelning", "portföljforskning", "100-bolagsuniversum"],
  body: paketBody,
};
const paketJson = JSON.stringify(paket, null, 2) + "\n";
kontroll("paket-JSON giltig vid återläsning", (() => { try { return JSON.parse(paketJson).slug === "forskningslaget-grona-av-100"; } catch { return false; } })());
kontroll("publishedAt null — publicering = kundens klick (R2)", paket.publishedAt === null);
kontroll("tags = seriens egna (publik utgåvas tagg-uppsättning)", JSON.stringify(paket.tags) === JSON.stringify(publik.tags));

console.log("═══ 9. SKRIV-GRINDEN ═══");
const FIL_PAKET = `${ROT}/data/blogg-utkast/granskning/forskningslaget-grona-av-100-FLYTTKLART-PAKET-2026-09-21.json`;
if (FEL === 0) {
  writeFileSync(FIL_PAKET, paketJson);
  const tillbaka = lasJson(FIL_PAKET);
  kontroll("paketfilen skriven + återläst (body + md5-lock)", tillbaka.body === paket.body && md5Fil(FIL_PAKET).length === 32, `md5 ${md5Fil(FIL_PAKET)} · ${paketBody.length} tkn body`);
} else {
  console.log(`  ✗ SKRIVS EJ — ${FEL} FEL i kontrollerna (grinden vägrar)`);
}

console.log(`\n═══ RESULTAT: ${OK} OK · ${FEL} FEL ═══`);
process.exit(FEL === 0 ? 0 : 1);
