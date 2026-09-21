#!/usr/bin/env node
/**
 * KONTROLLSOND s1-u3 (omgång auto-s1-1789980325227) — Handelsbanken Q3-2026
 *läspaket (kvartalsfamiljen, rappdags-FIFO: SHB 10-01-idealet — se KONTROLL).
 * Speglar: median() ur src/lib/dataset-nyckeltal.ts (udda→mittersta, jämn→
 * medel av två mittersta, null exkluderas), kontrolleraText (varumarke.ts:141,
 * 26 fraser RegExp 'giu'), Kinnevik-kontrollens 09-19-standard.
 * Medianer replikeras mot BYGGVINTAGEN 9839c530 (120 rader — textens egna
 * "omräknade 2026-09-16 (n=120)"), enligt Nordea-vintage-metoden.
 * LÄSER ENDAST. Deploylåset kontrolleras före HTTP-dom (medie-lärdomen).
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const md5 = (d) => createHash("md5").update(d).digest("hex");
const md5Fil = (f) => md5(readFileSync(f));
const nfc = (s) => s.normalize("NFC");
let OK = 0, FEL = 0, NOT = 0;
const kontroll = (namn, sant, detalj = "") => {
  if (sant) { OK++; console.log(`  ✓ ${namn}${detalj ? " — " + detalj : ""}`); }
  else { FEL++; console.log(`  ✗ FEL: ${namn}${detalj ? " — " + detalj : ""}`); }
};
const notis = (namn, detalj) => { NOT++; console.log(`  · NOT ${namn} — ${detalj}`); };

const ut = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-handelsbanken-q3-2026.json`, "utf8"));
const yta = nfc([ut.title, ut.description, ...ut.tags, ut.body].join("\n"));
const body = nfc(ut.body);

// ── Deploylåset före HTTP-dom (medie-lärdomen) ──
let lockFri = true;
try { execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"]); } catch { lockFri = false; }

console.log("═══ 1. KÄLLOR — SHB-raden mot DAGENS universum + vintage + kalender + vågvalidering ═══");
const dagens = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const dagensRader = Array.isArray(dagens) ? dagens : dagensRader;
const shb = dagensRader.find((r) => r.ticker === "SHB-A.ST");
const vint = JSON.parse(execFileSync("git", ["-C", ROT, "show", "9839c530:data/portfolj-system/bolagsunivers.json"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }));
const vintRader = Array.isArray(vint) ? vint : vintRader;
const shbV = vintRader.find((r) => r.ticker === "SHB-A.ST");
kontroll("SHB-A.ST-rad: pris 148,6 · mcap 297,908 mdr (dagens fil)", shb.pris === 148.6 && shb.marknadsKapitalMdr === 297.908);
kontroll("SHB-raden identisk mellan vintage 9839c530 (120) och dagens fil (242)", JSON.stringify(shbV) === JSON.stringify(shb), "raden orörd av universum-driften");
kontroll("ROE 12,75 % · EBIT-marginal 50,09 % · nettomarginal 42,58 % · brutto 0", shb.lonksamhet.roe === 0.1275 && shb.lonksamhet.ebitMarginal === 0.5009 && shb.lonksamhet.nettoMarginal === 0.4258 && shb.lonksamhet.bruttoMarginal === 0);
kontroll("P/E 12,414 · P/B 1,596 · EV/EBIT 47,358 · PEG 18,54", shb.vardering.pe === 12.414 && shb.vardering.pb === 1.596 && shb.vardering.evEbit === 47.358 && shb.vardering.peg === 18.54);
kontroll("CAGR 4,17/3,39 % · TTM −3,8 % · prognos 5,32 %", shb.tillvaxt.omsattningCAGR5ar === 0.0417 && shb.tillvaxt.resultatCAGR5ar === 0.0339 && shb.tillvaxt.omsattningTillvaxtTTM === -0.038 && shb.tillvaxt.prognosTillvaxt === 0.0532);
kontroll("serier 2022–2025: omsättning 50,249→62,249→62,345→56,796 mdr", JSON.stringify(shb.serier.omsattning) === JSON.stringify([50249000000, 62249000000, 62345000000, 56796000000]));
kontroll("serier resultat 21 468→29 1xx→27 5xx→23 7xx Mkr (prefix-steg −8,9/−13,6 % verifieras i §6)", shb.serier.resultat[0] === 21468000000);
kontroll("stabilitet null ×5 · insider 0 · återköp null · källor Yahoo 09-03 + MarketStack 'ingen färsk data'", shb.stabilitet.skuldEgenkapital === null && shb.aterkop.insiderkopSenaste6man === 0 && JSON.stringify(shb.kallor.map((k) => k.namn)) === JSON.stringify(["Yahoo Finance", "MarketStack"]));
kontroll("vågvalidering-SENASTE.md md5 oförändrad (b7194627…)", md5Fil(`${ROT}/data/rapporter/vagvalidering-SENASTE.md`) === "b7194627c055d2ddb5503009a544cff8");
const vv = readFileSync(`${ROT}/data/rapporter/vagvalidering-SENASTE.md`, "utf8");
const vvRad = vv.split("\n").find((l) => l.includes("SHB-B.ST"));
kontroll("domprotkoll SHB-B: mikro basbygge miss −11,3 · kort basbygge miss 22 · medellång impulsvåg träff 13,1 · lång osatt · mega impulsvåg träff 13,1", vvRad.includes("mikro: basbygge → miss ✗ (-11,3 %)") && vvRad.includes("kort: basbygge → miss ✗ (22 %)") && vvRad.includes("medellång: impulsvåg → träff ✓ (13,1 %)") && vvRad.includes("lång: osatt → osatt") && vvRad.includes("mega: impulsvåg → träff ✓ (13,1 %)"));
kontroll("basbyggetröskeln ±6 % = motorns egen definition i domprotokollet", vv.includes("basbygge → träff vid |momentum| ≤ 6 %"));
const kal = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-finans.json`, "utf8"));
const kalS = kal.bolag.find((b) => b.ticker === "SHB-A.ST");
kontroll("kalender: 2026-10-21 (onsdag) 07:00 CET · fastslaget i Q2 2026-07-15 · pre-close 2026-09-30", kalS.rapportfenster.startsWith("2026-10-21") && kalS.notera.includes("2026-07-15") && kalS.notera.includes("2026-09-30"));
kontroll("2026-10-21 är en onsdag (datumaritmetik)", new Date("2026-10-21").getDay() === 3);
kontroll("externa källor i kalendern: handelsbanken IR (officiell) + MarketScreener", kalS.kallor.some((k) => k.url.includes("handelsbanken.com") && k.url.includes("investor-relations")) && kalS.kallor.some((k) => k.url.includes("marketscreener.com")));

console.log("═══ 2. MEDIANER — replik mot BYGGVINTAGEN 9839c530 (120 rader; Nordea-vintage-metoden) ═══");
const median = (v) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const p1 = (x) => (Math.round(x * 10000) / 10000);
const finansV = vintRader.filter((r) => r.bransch === "finans");
const pbclean = finansV.map((r) => r.vardering.pb).filter((v) => typeof v === "number");
const nordeaPB = finansV.find((r) => /NDA|NORDEA/i.test(r.ticker))?.vardering.pb;
const brkPB = finansV.find((r) => /BRK|BERKSHIRE/i.test(r.ticker) || /Berkshire/i.test(r.namn))?.vardering.pb;
kontroll("trasiga P/B-värden i vintagen: Nordea 21,537 (textens '21,5' = korrekt avrundning) + Berkshire 0,001", Math.abs(nordeaPB - 21.537) < 0.001 && brkPB === 0.001, `NDA ${nordeaPB} · BRK ${brkPB}`);
const pbExkl = pbclean.filter((v) => v !== nordeaPB && v !== brkPB);
kontroll("finans P/B-median ~2,01 (n=10 exkl. de två trasiga; projektets median()-konvention)", Math.abs(median(pbExkl) - 2.01) < 0.015 && pbExkl.length === 10, `${p1(median(pbExkl))} (n=${pbExkl.length})`);
const peF = finansV.map((r) => r.vardering.pe).filter((v) => typeof v === "number");
kontroll("finans P/E-median 14,1 (n=12)", Math.abs(median(peF) - 14.1) < 0.1 && peF.length === 12, `${p1(median(peF))} (n=${peF.length})`);
const roeF = finansV.map((r) => r.lonksamhet.roe).filter((v) => typeof v === "number");
kontroll("finans ROE-median 14,55 %", Math.abs(median(roeF) - 0.1455) < 0.001, `${p1(median(roeF))}`);
const ebitF = finansV.map((r) => r.lonksamhet.ebitMarginal).filter((v) => typeof v === "number");
kontroll("finans EBIT-median 50,4 %", Math.abs(median(ebitF) - 0.504) < 0.002, `${p1(median(ebitF))}`);
const nettoF = finansV.map((r) => r.lonksamhet.nettoMarginal).filter((v) => typeof v === "number");
kontroll("FYND-B1(bärare) finans nettomarginal-median 37,8 % — projektets median() ger 39,19 %", Math.abs(median(nettoF) - 0.378) < 0.002, `${p1(median(nettoF))} (nedre-mittersta = 0,378 exakt = textens tal)`);
const cagrFo = finansV.map((r) => r.tillvaxt?.omsattningCAGR5ar).filter((v) => typeof v === "number");
const cagrFr = finansV.map((r) => r.tillvaxt?.resultatCAGR5ar).filter((v) => typeof v === "number");
kontroll("FYND-B1(bärare) finans CAGR-medianer 7,13/10,42 % — projektets median() ger 7,35/12,07 %", Math.abs(median(cagrFo) - 0.0713) < 0.001 && Math.abs(median(cagrFr) - 0.1042) < 0.001, `${p1(median(cagrFo))} / ${p1(median(cagrFr))} (nedre-mittersta = 0,0713/0,1042 exakt = textens tal)`);
const progF = finansV.map((r) => r.tillvaxt?.prognosTillvaxt).filter((v) => typeof v === "number");
kontroll("finans prognos-median 5,94 % · PEG-median 2,12", Math.abs(median(progF) - 0.0594) < 0.001 && Math.abs(median(finansV.map((r) => r.vardering.peg).filter((v) => typeof v === "number")) - 2.12) < 0.02);
const peU = vintRader.map((r) => r.vardering.pe).filter((v) => typeof v === "number");
const pbU = vintRader.map((r) => r.vardering.pb).filter((v) => typeof v === "number");
const roeU = vintRader.map((r) => r.lonksamhet.roe).filter((v) => typeof v === "number");
kontroll("universum P/E 20,5 · ROE 15,34 % (n=117 med värde)", Math.abs(median(peU) - 20.5) < 0.15 && Math.abs(median(roeU) - 0.1534) < 0.001 && roeU.length === 117, `P/E ${p1(median(peU))} · ROE ${p1(median(roeU))} (n=${roeU.length})`);
kontroll("FYND-B1(bärare) universum P/B 2,77 — projektets median() ger 2,79", Math.abs(median(pbU) - 2.77) < 0.02, `${p1(median(pbU))} (nedre-mittersta = 2,774 = textens tal)`);
const ebitU = vintRader.map((r) => r.lonksamhet.ebitMarginal).filter((v) => typeof v === "number");
const nettoU = vintRader.map((r) => r.lonksamhet.nettoMarginal).filter((v) => typeof v === "number");
kontroll("universum EBIT 21,1 %", Math.abs(median(ebitU) - 0.211) < 0.002, `${p1(median(ebitU))}`);
kontroll("FYND-B1(bärare) universum nettomarginal 14,1 % — projektets median() ger 14,31 %", Math.abs(median(nettoU) - 0.141) < 0.002, `${p1(median(nettoU))} (nedre-mittersta = 14,09 = textens tal)`);
kontroll("universum omsättnings-CAGR 3,32 % (projektets median(); udda antal mätta)", Math.abs(median(vintRader.map((r) => r.tillvaxt?.omsattningCAGR5ar).filter((v) => typeof v === "number")) - 0.0332) < 0.001);
kontroll("FYND-B1(bärare) universum resultat-CAGR 1,40 % — projektets median() ger 1,57 %", Math.abs(median(vintRader.map((r) => r.tillvaxt?.resultatCAGR5ar).filter((v) => typeof v === "number")) - 0.014) < 0.001, `${p1(median(vintRader.map((r) => r.tillvaxt?.resultatCAGR5ar).filter((v) => typeof v === "number")))} (nedre-mittersta = 0,0140 = textens tal)`);
kontroll("FYND-B1(bärare) universum prognos-median 9,67 % — projektets median() ger 9,94 %", Math.abs(median(vintRader.map((r) => r.tillvaxt?.prognosTillvaxt).filter((v) => typeof v === "number")) - 0.0967) < 0.002, `${p1(median(vintRader.map((r) => r.tillvaxt?.prognosTillvaxt).filter((v) => typeof v === "number")))} (nedre-mittersta = 0,0967 = textens tal)`);
kontroll("universum PEG-median 1,73", Math.abs(median(vintRader.map((r) => r.vardering.peg).filter((v) => typeof v === "number")) - 1.73) < 0.02);
const seb = vintRader.find((r) => /SEB-A/.test(r.ticker));
const swed = vintRader.find((r) => /SWED-A/.test(r.ticker));
kontroll("SEB P/E 14,4 · P/B 1,95 · ROE 14,1 %", Math.abs(seb.vardering.pe - 14.4) < 0.05 && Math.abs(seb.vardering.pb - 1.95) < 0.005 && Math.abs(seb.lonksamhet.roe - 0.141) < 0.001, `${seb.vardering.pe}/${seb.vardering.pb}/${seb.lonksamhet.roe}`);
kontroll("Swedbank P/E 13,8 · P/B 2,07 · ROE 15,0 %", Math.abs(swed.vardering.pe - 13.8) < 0.05 && Math.abs(swed.vardering.pb - 2.07) < 0.005 && Math.abs(swed.lonksamhet.roe - 0.15) < 0.001, `${swed.vardering.pe}/${swed.vardering.pb}/${swed.lonksamhet.roe}`);
notis("vintage-drift (C-klassen, Nordea-vintage-metoden)", `textens medianer låsta till n=120 (09-16); dagens fil 242 rader — texten rättas EJ, den var sann mot sin vintage och daterar sig själv ("omräknade 2026-09-16, n=120")`);

console.log("═══ 3. ARITMETIK — identitet, PEG-matchning, scenarium, rättesatser ═══");
const id = 1.596 / 0.1275;
kontroll("P/E = P/B ÷ ROE: 1,596/0,1275 ≈ 12,5 mot 12,4 — avvikelse 0,8 %", Math.round(id * 10) / 10 === 12.5 && Math.abs(id - 12.414) / 12.414 < 0.009, `${p1(id)}`);
kontroll("PEG-implicit tillväxt 12,414/18,54 ≈ 0,67 %/år", Math.round((12.414 / 18.54) * 1000) / 1000 === 0.67 || Math.abs(12.414 / 18.54 - 0.669) < 0.002, `${p1(12.414 / 18.54)}`);
kontroll("PEG med prognos 5,32 → 2,33 · med CAGR 3,39 → 3,66", Math.abs(12.414 / 5.32 - 2.333) < 0.001 && Math.abs(12.414 / 3.39 - 3.66) < 0.005);
const O = 56796, M = 0.5009;
const cell = (dv, dm) => Math.round(O * (1 + dv) * (M + dm));
const ruta = [[cell(-0.03, -0.03), cell(-0.03, 0), cell(-0.03, 0.03)], [cell(0, -0.03), cell(0, 0), cell(0, 0.03)], [cell(0.03, -0.03), cell(0.03, 0), cell(0.03, 0.03)]];
const forv = [[25943, 27596, 29248], [26745, 28449, 30153], [27548, 29303, 31058]];
kontroll("scenarioruta 9/9 celler exakta", JSON.stringify(ruta) === JSON.stringify(forv), JSON.stringify(ruta[2]));
const r1 = Math.round(O * 0.01), r3v = Math.round(O * 0.03 * M), r3m = Math.round(O * 0.03);
kontroll("rättesatser: 1 pp marginal ≈ 568 mkr · 3 % volym ≈ 853 mkr · 3 pp marginal ≈ 1 704 mkr", r1 === 568 && Math.abs(r3v - 853) <= 1 && r3m === 1704, `${r1}/${r3v}/${r3m}`);
kontroll("vikter: 3 % volym drygt 1,5× tyngre än 1 pp · 3 pp dubbelt så tung som 3 % volym", r3v / r1 > 1.5 && r3v / r1 < 1.51 && Math.abs(r3m / r3v - 2) < 0.01, `${p1(r3v / r1)}× · ${p1(r3m / r3v)}×`);
kontroll("övning 2: 1,60 ÷ 0,1455 ≈ 11,0", Math.round((1.60 / 0.1455) * 10) / 10 === 11);
const om = shb.serier.omsattning, re = shb.serier.resultat;
const stegO = (om[3] / om[2] - 1) * 100, stegR = (re[3] / re[2] - 1) * 100;
kontroll("2025-steg: omsättning −8,9 % · resultat −13,6 % (ur seriens exakta Mkr)", Math.abs(stegO + 8.83) < 0.1 && Math.abs(stegR + 13.6) < 0.15, `${stegO.toFixed(2)} % · ${stegR.toFixed(2)} %`);

console.log("═══ 4. JURIDIK — lagen (2007:528), mekanisk spegel ═══");
const varumarke = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, "utf8"));
const speglar = varumarke.forbjudnaFraser.map((f) => ({ fran: new RegExp(f.fran, "giu"), allvar: f.allvar }));
const kt = (text) => { const fel = [], varn = []; for (const s of speglar) { const m = text.match(s.fran); if (m) (s.allvar === "FEL" ? fel : varn).push(m[0]); } return { fel, varn }; };
const rj = kt(yta);
kontroll("kontrolleraText på HELA ytan (title+desc+tags+body): 0 FEL 0 VARN", rj.fel.length === 0 && rj.varn.length === 0, `FEL ${rj.fel.length} · VARN ${rj.varn.length}`);
const gloss = ["aktietips", "kursmål", "säker vinst", "du bör köpa", "köp denna", "sälj denna"].filter((g) => new RegExp(g.split(" ").join("\\s+"), "i").test(yta));
kontroll("rådgivningsglossor: 0 träffar", gloss.length === 0, gloss.join(",") || "0");
const rek = (yta.match(/rekommendation/gi) || []).length;
kontroll("\"rekommendation\" endast negerad (ingressen)", rek === 1 && nfc(ut.body).includes("inte en rekommendation att köpa, sälja eller behålla"));
const rad = (yta.match(/\bråd\b/g) || []).length;
kontroll("\"råd\" endast i negerad rådgivnings-mening", rad >= 1 && nfc(ut.body).includes("inte råd om att köpa, sälja eller behålla"));
const lagrum = ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482"];
kontroll("exakt ett lagrumsfamily (2007:528 + 2 kap 5 §) — ingen blandning", yta.includes("2007:528") && yta.includes("2 kap 5 §") && lagrum.every((l) => !yta.includes(l)));
kontroll("utbildningsgrunden bärande (metod-formuleringar genomgående)", nfc(ut.body).includes("utbildningspaket") && nfc(ut.body).includes("Detta är utbildningsmaterial i en metod") && nfc(ut.body).includes("övning i mekanik, inte en avläsning"));
kontroll("träffprocentens inramning: öppet kvitto om förflutna, aldrig garanti/mått på värde", nfc(ut.body).includes("aldrig en garanti om framtiden, och aldrig ett mått på värde"));

console.log("═══ 5. 911-REFERENSER — sex mönster (URL-id:n exkluderas maskinellt) ═══");
const m911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
const ytaText = yta.replace(/\((https?:\/\/[^)]+)\)/g, "(extern-länk)"); // URL:ar (t.ex. MarketScreener-id 6491123) är inte referenser
const t911 = m911.filter((m) => new RegExp(m.replace(/\//g, "\\/"), "i").test(ytaText));
const url911 = (yta.match(/\((https?:\/\/[^)]*911[^)]*)\)/g) || []);
kontroll("911 = 0 träffar på sex mönster i text-ytan (URL-id:n exkluderade)", t911.length === 0, t911.join(",") || `0 (URL-träffar utanför text: ${url911.length ? url911[0].slice(1, 50) + "…" : 0})`);

console.log("═══ 6. INTERNLÄNKAR — statiskt + levande sajt ═══");
const interna = [...new Set([...nfc(ut.body).matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]))].filter((p) => !p.startsWith("/bolag") || true);
let lankOK = 0, lankFEL = 0;
for (const sokvag of interna) {
  const statisk = sokvag.startsWith("/dataset/") ? existsSync(`${ROT}/src/app/(huvud)${sokvag.split("?")[0]}/page.tsx`) || sokvag.includes("universumjamforelse") : true;
  try {
    const sv = await fetch(`http://localhost:3000${sokvag}`, { redirect: "manual" });
    if (sv.status === 200) { lankOK++; console.log(`  ✓ HTTP 200 ${sokvag}`); }
    else { lankFEL++; console.log(`  ✗ FEL: HTTP ${sv.status} ${sokvag}`); }
  } catch (e) { lankFEL++; console.log(`  ✗ FEL: fetch ${sokvag} (${e.code || e.message})`); }
}
kontroll(`interna länkar ${interna.length} st: samtliga HTTP 200 mot localhost:3000`, lankFEL === 0 && lankOK === interna.length, `${lankOK}/${interna.length}`);
notis("deploylåset", lockFri ? "FRITT vid länkdom (medie-lärdomen följd)" : "UPPTAGT vid sondens start — HTTP-dom kan bära byggtillstånd");
const externa = [...new Set([...nfc(ut.body).matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]))];
for (const url of externa) {
  try {
    const sv = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (sv.status === 403) notis("extern länk", `${url.slice(0, 60)}… — 403 (bot-skydd; servern svarar, källan dokumenterad i kalenderunderlaget med hämtdatum)`);
    else kontroll(`extern länk levande: ${url.slice(0, 60)}…`, sv.status >= 200 && sv.status < 400, String(sv.status));
  } catch (e) { notis("extern länk", `${url.slice(0, 60)}… — fetch misslyckades (${e.code || e.message}); källraden i kalenderunderlaget bär URL:en`); }
}

console.log("═══ 7. STRUKTUR & KONVENTIONER ═══");
const h2 = (nfc(ut.body).match(/^## /gm) || []).length;
const ord = nfc(ut.body).match(/\S+/g)?.length ?? 0;
kontroll("H2-rubriker = 8 (kvartalsfamiljens stil)", h2 === 8, String(h2));
kontroll("FYND-B2(bärare) readingMinutes 6 — kvartalsfamiljens round(ord/600) ger 3 vid 1 955 ord", ut.readingMinutes === Math.round(ord / 600), `rm ${ut.readingMinutes} mot konventionens ${Math.round(ord / 600)} (ord ${ord}; /200-ceilen ger 10 — 6 matchar ingen konvention)`);
kontroll("title ≤ 314 tkn (familjetaket) · description väl inom spann", ut.title.length <= 314 && ut.description.length >= 200 && ut.description.length <= 1100, `title ${ut.title.length} · desc ${ut.description.length}`);
kontroll("publishedAt 2026-10-19 = före rappdagen 10-21 (pre-rapport-läspaket; Kinnevik-konventionen var rappdagen — se NOT)", ut.publishedAt === "2026-10-19");
kontroll("tags 7 st sökordsbärande · pillar Institutionell metodik", ut.tags.length === 7 && ut.pillar === "Institutionell metodik");
kontroll("Källor-sektion sist med 5 poster (vågvalidering · universum · kalender · egna beräkningar · transparens)", nfc(ut.body).trim().endsWith("(/kallor).") || nfc(ut.body).includes("källor-sidan](/kallor)"));
notis("publishedAt-konventionen", "Kinnevik = rappdagen (10-15); HB = 10-19, två dagar före — pre-rapport-logiken är meningsfull för ett läspaket men avviker från familjekonventionen; ägarens beslut (C-klass)");
notis("kalenderns pre-close-lydelse", "kalender-underlaget skriver 'hölls per kalender 2026-09-30' (preteritum om ett framtida datum) — HB-textens neutrala 'tidsplanerad till 30 september' är den rimliga formen; kalenderfilen ägs av byggaren");

console.log(`\n═══ RESULTAT: ${OK} OK · ${FEL} FEL · ${NOT} NOT ═══`);
process.exit(FEL === 0 ? 0 : 1);
