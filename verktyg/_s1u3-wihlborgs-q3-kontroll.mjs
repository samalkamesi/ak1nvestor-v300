#!/usr/bin/env node
/**
 * KONTROLLSOND s1-u3 (omgång auto-s1-1790012730031) — Wihlborgs Q3-2026
 * läspaket (kvartalsfamiljen, FIFO enligt worklog 16849). Speglar släktets
 * standard (HB-sonden 09-21): median() ur dataset-nyckeltal.ts-konventionen
 * (udda→mittersta, jämn→medel av två mittersta, null exkluderas),
 * kontrolleraText (26 fraser ur data/varumarke.json, RegExp 'giu'),
 * 911-sexmönstret, internlänkar mot localhost:3000 med deploylåscheck.
 * Medianer replikeras mot BYGGVINTAGEN 78b39e9b (237 rader, 2026-09-20
 * 20:23 — utkastets egna "237 poster"), enligt Nordea-vintage-metoden.
 * LÄSER ENDAST. Sonden skriver aldrig mot utkastet.
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

const FIL = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-wihlborgs-q3-2026.json`;
const ut = JSON.parse(readFileSync(FIL, "utf8"));
const yta = nfc([ut.title, ut.description, ...ut.tags, ut.body].join("\n"));
const body = nfc(ut.body);

let lockFri = true;
try { execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"]); } catch { lockFri = false; }

console.log("═══ 1. KÄLLOR — WIHL-raden mot DAGENS universum + byggvintage + kalender ═══");
const dagens = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const w = dagens.find((r) => r.ticker === "WIHL.ST");
kontroll("WIHL.ST-rad: pris 79,65 · mcap 24,487 mdr · hämtat 2026-09-03", w.pris === 79.65 && w.marknadsKapitalMdr === 24.487 && w.hamtat === "2026-09-03");
kontroll("värdering: P/E 11,203 · P/B 1,013 · EV/EBIT 17,955 · PEG 1,97 · FCF-yield 0,061", w.vardering.pe === 11.203 && w.vardering.pb === 1.013 && w.vardering.evEbit === 17.955 && w.vardering.peg === 1.97 && w.vardering.fcfYield === 0.061);
kontroll("lönsamhet: ROE 9,27 · ROIC 5,46 · brutto 71,69 · EBIT 71,09 · netto 47,34 · FCF-marg 32,33 (%)", w.lonksamhet.roe === 0.0927 && w.lonksamhet.roic === 0.0546 && w.lonksamhet.bruttoMarginal === 0.7169 && w.lonksamhet.ebitMarginal === 0.7109 && w.lonksamhet.nettoMarginal === 0.4734 && w.lonksamhet.fcfMarginal === 0.3233);
kontroll("tillväxt: CAGR 9,29 · resCAGR −1,00 · TTM 6,8 · prognos 9,44 (%)", w.tillvaxt.omsattningCAGR5ar === 0.0929 && w.tillvaxt.resultatCAGR5ar === -0.01 && w.tillvaxt.omsattningTillvaxtTTM === 0.068 && w.tillvaxt.prognosTillvaxt === 0.0944);
kontroll("stabilitet: skuld/EK 1,4875 · räntetäckning null · insiderköp 0", w.stabilitet.skuldEgenkapital === 1.4875 && w.stabilitet.rantaTackning === null && w.aterkop.insiderkopSenaste6man === 0);
kontroll("golv: NAV-proxy 78,66 kr/aktie (tillgångstung)", w.golv.vardePerAktie === 78.66 && w.golv.typ === "tillgangstung");
kontroll("serier 2022–2025: omsättning 3 335→3 881→4 174→4 354 Mkr", JSON.stringify(w.serier.omsattning) === JSON.stringify([3335000000, 3881000000, 4174000000, 4354000000]));
kontroll("serier resultat 2 288→−27→1 706→2 220 Mkr (V-formens källa)", JSON.stringify(w.serier.resultat) === JSON.stringify([2288000000, -27000000, 1706000000, 2220000000]));
kontroll("noteringens förbehåll speglas ärligt i utkastet (4 år ej 5 · ROIC-proxy · räntetäckning osatt · ingen MarketStack-dubbelkoll)", body.includes("fyra räkenskapsår, inte fem") && body.includes("approximerad proxy") && body.includes("osatt") && body.includes("ingen dubbelkoll det datumet"));

const vint = JSON.parse(execFileSync("git", ["-C", ROT, "show", "78b39e9b:data/portfolj-system/bolagsunivers.json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
notis("byggvintage", `78b39e9b (2026-09-20 20:23) = ${vint.length} rader — utkastets egna "237 poster" deklarerar samma vintage (senaste commit före bygget 21:21)`);

const kal = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-fastighet.json`, "utf8"));
const kalW = kal.bolag.find((b) => b.ticker === "WIHL.ST");
kontroll("kalenderunderlaget: 20/21-divergensen + wihlborgs.se-källorna (utkastets urvalsberättelse bär underlaget)", kalW.rapportfenster.includes("2026-10-20/21") && kalW.kallor.some((k) => k.url.includes("wihlborgs.se/en/investor-relations")));
kontroll("kalenderns Q1/Q2-rytm (21/4 + 6/7 07:00) = utkastets rytm-kontroll", kalW.notera.includes("2026-04-21") && kalW.notera.includes("2026-07-06 kl 07:00"));
kontroll("2026-10-21 är en onsdag (datumaritmetik)", new Date("2026-10-21").getDay() === 3);

console.log("═══ 2. MEDIANER & RANG — replik mot BYGGVINTAGEN 78b39e9b (237 rader) ═══");
const median = (v) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const p1 = (x) => Math.round(x * 10000) / 10000;
const nr = (x, antal = 2) => Math.round(x * 10 ** antal) / 10 ** antal;
const fast = vint.filter((r) => r.bransch === "fastighet");
const V = (o, vag) => vag.split(".").reduce((a, k) => a && a[k] !== undefined ? a[k] : null, o);
kontroll("fastighetsgrenen n=17 i vintagen (textens 17 bolag)", fast.length === 17);
kontroll("fastighet P/E-median 14,38 · P/B 0,946 · skuld/EK 1,10", p1(median(fast.map((r) => V(r, "vardering.pe")))) === 14.38 && p1(median(fast.map((r) => V(r, "vardering.pb")))) === 0.946 && p1(median(fast.map((r) => V(r, "stabilitet.skuldEgenkapital")))) === 1.1);
kontroll("fastighet ROE-median 8,57 % (n=16) · EBIT 57,37 % · netto 43,58 %", p1(median(fast.map((r) => V(r, "lonksamhet.roe"))) * 100) === 8.57 && p1(median(fast.map((r) => V(r, "lonksamhet.ebitMarginal"))) * 100) === 57.37 && p1(median(fast.map((r) => V(r, "lonksamhet.nettoMarginal"))) * 100) === 43.58);
kontroll("universum-medianer i vintagen: P/E 20,39 · P/B 2,72 · ROE 14,75 % (textens tabellkolumn)", p1(median(vint.map((r) => V(r, "vardering.pe")))) === 20.39 && p1(median(vint.map((r) => V(r, "vardering.pb")))) === 2.72 && p1(median(vint.map((r) => V(r, "lonksamhet.roe"))) * 100) === 14.75);
kontroll("universum EBIT 20,81 % · netto 13,90 % · skuld 0,53 (avrundat 2 dec ur 0,5266)", nr(median(vint.map((r) => V(r, "lonksamhet.ebitMarginal"))) * 100, 2) === 20.81 && nr(median(vint.map((r) => V(r, "lonksamhet.nettoMarginal"))) * 100, 2) === 13.9 && nr(median(vint.map((r) => V(r, "stabilitet.skuldEgenkapital"))), 2) === 0.53);
const pegV = vint.map((r) => V(r, "vardering.peg")).filter((x) => typeof x === "number");
kontroll("universum PEG-median 1,32 med n=194 (textens redovisning exakt)", Math.abs(median(pegV) - 1.32) <= 0.005 && pegV.length === 194, `${p1(median(pegV))} (n=${pegV.length})`);
const pbs = fast.map((r) => ({ t: r.ticker, pb: V(r, "vardering.pb"), land: r.land })).filter((x) => typeof x.pb === "number").sort((a, b) => a.pb - b.pb);
kontroll("nio av sjutton under 0,95 (titelns räknefacit)", pbs.filter((x) => x.pb < 0.95).length === 9);
kontroll("WIHL P/B-rang 10 av 17 stigande", pbs.findIndex((x) => x.t === "WIHL.ST") + 1 === 10);
const roes = fast.map((r) => ({ t: r.ticker, v: V(r, "lonksamhet.roe") })).filter((x) => typeof x.v === "number").sort((a, b) => b.v - a.v);
kontroll("ROE 7 av 16 (sjunde högsta)", roes.findIndex((x) => x.t === "WIHL.ST") + 1 === 7 && roes.length === 16);
const ebs = fast.map((r) => ({ t: r.ticker, v: V(r, "lonksamhet.ebitMarginal") })).filter((x) => typeof x.v === "number").sort((a, b) => b.v - a.v);
kontroll("EBIT-marginal 3 av 17 efter CATE 84,86 % och NP3 74,88 % (citatet exakt)", ebs.findIndex((x) => x.t === "WIHL.ST") + 1 === 3 && p1(ebs[0].v * 100) === 84.86 && p1(ebs[1].v * 100) === 74.88);
const fys = fast.map((r) => ({ t: r.ticker, v: V(r, "vardering.fcfYield") })).filter((x) => typeof x.v === "number").sort((a, b) => b.v - a.v);
kontroll("FCF-yield 3 av 16 efter URW 9,51 och FABG 7,70, före CATE 5,26 och BALD 5,05 (%)", fys.findIndex((x) => x.t === "WIHL.ST") + 1 === 3 && p1(fys[0].v * 100) === 9.51 && p1(fys[1].v * 100) === 7.7 && p1(fys[3].v * 100) === 5.26 && p1(fys[4].v * 100) === 5.05);
const sks = fast.map((r) => ({ t: r.ticker, v: V(r, "stabilitet.skuldEgenkapital") })).filter((x) => typeof x.v === "number").sort((a, b) => b.v - a.v);
kontroll("skuld/EK 4 av 17; Balder 1,480 = textens syskonvärde 1,48", sks.findIndex((x) => x.t === "WIHL.ST") + 1 === 4 && nr(sks.find((x) => x.t === "BALD-B.ST").v, 3) === 1.48);
kontroll("Balder −32 % under bok (P/B 0,678) · Catena −5,4 % (0,946) · medianposten 5,4 % under", p1(pbs.find((x) => x.t === "BALD-B.ST").pb) === 0.678 && p1(pbs.find((x) => x.t === "CATE.ST").pb) === 0.946);

console.log("═══ 2b. FYND B1 — \"enda europeiska … över pari\" mot vintagens egna data ═══");
const euPari = pbs.filter((x) => x.pb > 1 && x.land && x.land !== "USA");
const eu = pbs.filter((x) => x.pb > 1).map((x) => `${x.t}=${x.pb} (${x.land})`).join(" · ");
kontroll("FYND B1(bärare): europeiska bolag över pari = " + euPari.length + " st — NP3 (Sverige) 1,422 gör \"enda\" falskt i TITELN", !(ut.title.includes("enda europeiska kollegan med P/B över pari")) && euPari.length === 1, `över pari totalt: ${eu} — utkastets titel bär påståendet medan NP3.ST land=Sverige P/B 1,422 står i samma vintage`);
kontroll("FYND B1 yta 2: body \"enda bolaget i det europeiska hyresgänget över pari\" — falskt av samma skäl", !body.includes("enda bolaget i det europeiska hyresgänget över pari"), "NP3 1,422 i grenens eget NP3-paket redan granskat 09-19 med just P/B 1,42 + premie");
kontroll("FYND B1 yta 3: sammanfattande läsningen \"det enda europeiska bolaget över pari\" — falskt", !body.includes("det enda europeiska bolaget över pari"), "samma belägg");

console.log("═══ 3. ARITMETIK — identiteter, kedjor, scenarioruta, rättesatser ═══");
kontroll("premien: (79,65 − 78,66) ÷ 78,66 = 1,26 %", nr((79.65 / 78.66 - 1) * 100) === 1.26);
kontroll("kapitalträff väg 1: 79,65 ÷ 1,013 = 78,63 (0,03 kr från golvet 78,66 = 0,04 %)", nr(79.65 / 1.013) === 78.63 && nr((78.66 - 79.65 / 1.013) / 78.66 * 100, 2) === 0.04);
const id = 1.013 / 0.0927;
kontroll("identitetstest P/E = P/B ÷ ROE: 10,928 mot källans 11,203 = 2,52 % över", nr(id, 3) === 10.928 && nr((11.203 / id - 1) * 100) === 2.52);
kontroll("implicit EPS: 79,65 ÷ 11,203 = 7,11 kr · trailingvinst 7,11 × 307,4 M = 2 186 Mkr", nr(79.65 / 11.203) === 7.11 && Math.abs(7.109 * 307.4 - 2186) < 1);
kontroll("aktietalet: 24 487 ÷ 79,65 = 307,4 M (bodyns tal ✓) · kontroll 850 ÷ 2,76 = 308 M (0,2 %)", nr(24487 / 79.65, 1) === 307.4 && Math.abs(850 / 2.76 - 307.97) < 0.1 && Math.abs(308 / 307.43 - 1) < 0.002);
kontroll("FYND B7: källradens \"aktietal 24 487 ÷ 79,65 = 307,5\" — korrekt 1 dec av 307,432 är 307,4", !body.includes("24 487 ÷ 79,65 = 307,5"), "källraden bär 307,5; bodyn bär rätt 307,4 — intern inkonsekvens i samma utkast");
kontroll("trailing 2 186 mot bokslut 2 220 = −1,5 % (1 dec) · P/E bokslutsväg 11,03", nr((2186 / 2220 - 1) * 100, 1) === -1.5 && nr(79.65 / (2220 / 307.43), 2) === 11.03);
kontroll("PEG: konventionen 11,203 ÷ 9,44 = 1,19 mot källans 1,97 = 1,66×", nr(11.203 / 9.44) === 1.19 && nr(1.97 / 1.19, 2) === 1.66);
kontroll("oms-CAGR (4 354/3 335)^(1/3) − 1 = 9,29 % · steg +16,4/+7,5/+4,3 %", nr(((4354 / 3335) ** (1 / 3) - 1) * 100) === 9.29 && nr((3881 / 3335 - 1) * 100, 1) === 16.4 && nr((4174 / 3881 - 1) * 100, 1) === 7.5 && nr((4354 / 4174 - 1) * 100, 1) === 4.3);
kontroll("resultat-CAGR (2 220/2 288)^(1/3) − 1 = −1,00 %", nr(((2220 / 2288) ** (1 / 3) - 1) * 100) === -1.0);
const K = { h: [1045, 1097, 1101, 1111, 1150, 1174], d: [731, 813, 790, 773, 800, 864] };
kontroll("kvartalskedja hyresintäkter: Q2-25 härledd 2 142−1 045 = 1 097 · Q4-25 härledd 4 354−3 243 = 1 111", 2142 - 1045 === 1097 && 4354 - 3243 === 1111);
kontroll("H1-2026: 1 150+1 174 = 2 324 (källans H1-rad) · drift 800+864 = 1 664", K.h[4] + K.h[5] === 2324 && K.d[4] + K.d[5] === 1664);
kontroll("rullande fyra kvartal: hyror 4 536 · drift 3 227", K.h.slice(2).reduce((a, b) => a + b, 0) === 4536 && K.d.slice(2).reduce((a, b) => a + b, 0) === 3227);
kontroll("kvartalssteg hyror: Q1-26 +10 % · Q2-26 +7 % · drift H1 1 664/1 544 = +8 %", nr((1150 / 1045 - 1) * 100, 0) === 10 && nr((1174 / 1097 - 1) * 100, 0) === 7 && nr((1664 / 1544 - 1) * 100, 0) === 8);
kontroll("vinststeg: Q1-26 548/431 = +27,1 % · Q2-26 302/452 = −33,2 %", nr((548 / 431 - 1) * 100, 1) === 27.1 && nr((302 / 452 - 1) * 100, 1) === -33.2);
kontroll("värdeposter: Q1 vinst 548 − förvaltning 520 = +28 · Q2 302 − 557 = −255 (\"minus ett par hundra\")", 548 - 520 === 28 && 557 - 302 === 255);
kontroll("V-formens återhämtning: 2 220 − (−27) = 2 247 Mkr på två år", 2220 - -27 === 2247);
kontroll("2023: nettomarginal −27/3 881 = −0,70 % · förvaltning 1 747 mot drift +19 % till 2 763", nr((-27 / 3881) * 100) === -0.7 && 2763 / 1.19 > 2300);
kontroll("marginalgap: brutto 71,69 − EBIT 71,09 = 0,60 pp · EBIT − netto = 23,75 exakt (textens \"23,7 pp\" = flyttalstrunkering — randfall, NOT)", nr(71.69 - 71.09, 2) === 0.6 && Math.abs(71.09 - 47.34 - 23.75) < 0.01);
kontroll("bokslut 2025: nettomarginal 2 220/4 354 = 50,99 % · FCF 32,33 % × 4 354 = 1 408 Mkr", nr((2220 / 4354) * 100) === 50.99 && Math.round(0.3233 * 4354) === 1408);
kontroll("FCF-yield bokslutsväg: 1 408 ÷ 24 487 = 5,75 % mot fältets 6,10 (fönstren)", nr((1408 / 24487) * 100) === 5.75);
kontroll("direktavkastning: 3,30 ÷ 79,65 = 4,14 %", nr((3.3 / 79.65) * 100) === 4.14);
kontroll("belåningsgrad: 1 ÷ (1 + 1/1,4875) = 59,8 % ≈ \"kring 60\"", nr((1 / (1 + 1 / 1.4875)) * 100) === 59.8);
const O = 4354, M = 0.7109;
const cell = (dv, dm) => nr(O * (1 + dv) * (M + dm), 1);
const ruta = [[cell(-0.03, -0.01), cell(-0.03, 0), cell(-0.03, 0.01)], [cell(0, -0.01), cell(0, 0), cell(0, 0.01)], [cell(0.03, -0.01), cell(0.03, 0), cell(0.03, 0.01)]];
const forv = [[2960.2, 3002.4, 3044.6], [3051.7, 3095.3, 3138.8], [3143.3, 3188.1, 3233.0]];
kontroll("scenarioruta 9/9 celler exakta (±3 % hyror × ±1 pp marginal)", JSON.stringify(ruta) === JSON.stringify(forv), JSON.stringify(ruta[2]));
kontroll("rättesatser: 1 pp = 43,5 Mkr · 3 % hyror = 92,9 Mkr · vikt 2,1× · marginalvikt 0,47", nr(O * 0.01, 1) === 43.5 && nr(O * 0.03 * M, 1) === 92.9 && nr((O * 0.03 * M) / (O * 0.01), 1) === 2.1 && nr(1 / (3 * M), 2) === 0.47);
kontroll("EBIT-fältet 71,09 % × 4 354 = 3 095 Mkr ligger 0,4 % från rapporternas drift 3 107", Math.round(O * M) === 3095 && nr((3107 / 3095 - 1) * 100, 1) === 0.4);
kontroll("P/E-framräkning: 11,203 ÷ 1,0944 = 10,24", nr(11.203 / 1.0944) === 10.24);
const marg = K.d.map((d, i) => d / K.h[i]);
kontroll("driftsmarginal min = 69,6 % (textens undre gräns ✓)", nr(Math.min(...marg) * 100, 1) === 69.6, `${nr(Math.min(...marg) * 100, 2)} % (Q1-26)`);
kontroll("FYND B2(bärare): driftsmarginal MAX = 74,1 % (Q2-25: 813/1 097) — texten skriver 73,6", nr(Math.max(...marg) * 100, 1) === 73.6, `verklig max ${nr(Math.max(...marg) * 100, 2)} % (Q2-25) — textens 73,6 är Q2-26, näst högsta`);

console.log("═══ 4. JURIDIK — lagen (2007:528), mekanisk spegel ═══");
const varumarke = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, "utf8"));
const speglar = varumarke.forbjudnaFraser.map((f) => ({ fran: new RegExp(f.fran, "giu"), allvar: f.allvar }));
const kt = (text) => { const fel = [], varn = []; for (const s of speglar) { const m = text.match(s.fran); if (m) (s.allvar === "FEL" ? fel : varn).push(m[0]); } return { fel, varn }; };
const rj = kt(yta);
kontroll("kontrolleraText på HELA ytan (title+desc+tags+body): 0 FEL 0 VARN", rj.fel.length === 0 && rj.varn.length === 0, `FEL ${rj.fel.length} · VARN ${rj.varn.length}${rj.fel.length ? " — " + rj.fel.join(",") : ""}`);
const gloss = ["aktietips", "kursmål", "du bör köpa", "köp denna", "sälj denna"].filter((g) => new RegExp(g.split(" ").join("\\s+"), "i").test(yta));
kontroll("rådgivningsglossor: 0 träffar", gloss.length === 0, gloss.join(",") || "0");
const rek = yta.match(/rekommendation/gi) || [];
kontroll("\"rekommendation\" 2 träffar, båda negerade (ingress + slutdisclaimer)", rek.length === 2 && body.includes("inte en rekommendation att köpa, sälja eller behålla") && body.includes("inga köp-, sälj- eller behållningsrekommendationer"));
const lagrum = ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482"];
kontroll("exakt en lagrumsfamilj (2007:528) — ingen blandning", yta.includes("2007:528") && lagrum.every((l) => !yta.includes(l)));
kontroll("utbildningsgrunden bärande (metod-formuleringar + övningsram + \"inte vår prognos\")", body.includes("utbildning i metod") && body.includes("Övning") && body.includes("inte vår prognos") && body.includes("räknestorhet, inte prognos"));
kontroll("FYND B3: stavfelet \"handssignal\" — kur \"handelsingnal\"", !body.includes("handssignal"), "\"inte en handssignal\" → \"inte en handelsingnal\" (kosmetika, men syns för läsaren)");

console.log("═══ 5. 911-REFERENSER — sex mönster (URL-id:n exkluderas maskinellt) ═══");
const m911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
const ytaText = yta.replace(/\((https?:\/\/[^)]+)\)/g, "(extern-länk)");
const t911 = m911.filter((m) => new RegExp(m.replace(/\//g, "\\/"), "i").test(ytaText));
kontroll("911 = 0 träffar på sex mönster i text-ytan", t911.length === 0, t911.join(",") || "0");

console.log("═══ 6. INTERNLÄNKAR — statiskt + levande sajt (deploylåset kontrollerat) ═══");
const interna = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]))];
let lankOK = 0, lankFEL = 0;
for (const sokvag of interna) {
  try {
    const sv = await fetch(`http://localhost:3000${sokvag}`, { redirect: "manual" });
    if (sv.status === 200) { lankOK++; console.log(`  ✓ HTTP 200 ${sokvag}`); }
    else { lankFEL++; console.log(`  ✗ FEL: HTTP ${sv.status} ${sokvag}`); }
  } catch (e) { lankFEL++; console.log(`  ✗ FEL: fetch ${sokvag} (${e.code || e.message})`); }
}
kontroll(`interna länkar ${interna.length} st: samtliga HTTP 200 mot localhost:3000`, lankFEL === 0 && lankOK === interna.length, `${lankOK}/${interna.length}`);
notis("deploylåset", lockFri ? "FRITT vid länkdom (medie-lärdomen följd)" : "UPPTAGT vid sondens start — HTTP-dom kan bära byggtillstånd");
const externa = [...new Set([...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]))];
for (const url of externa) {
  try {
    const sv = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000), headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64) kontroll-sond" } });
    if (sv.status === 403) notis("extern länk", `${url.slice(0, 60)}… — 403 (bot-skydd; källan dokumenterad i kalenderunderlaget med hämtdatum)`);
    else kontroll(`extern länk levande: ${url.slice(0, 60)}…`, sv.status >= 200 && sv.status < 400, String(sv.status));
  } catch (e) { notis("extern länk", `${url.slice(0, 60)}… — fetch misslyckades (${e.code || e.message}); källraden i kalenderunderlaget bär URL:en`); }
}

console.log("═══ 7. STRUKTUR & KONVENTIONER + FYND B4–B6 ═══");
const h2 = (body.match(/^## /gm) || []).length;
const ord = body.match(/\S+/g)?.length ?? 0;
kontroll("H2-rubriker = 8 (kvartalsfamiljens stil)", h2 === 8, String(h2));
kontroll(`readingMinutes ${ut.readingMinutes} = kvartalskonventionen round(${ord}/600) = ${Math.round(ord / 600)} — GRÖN (HB:s B2-gapa finns ej här)`, ut.readingMinutes === Math.round(ord / 600), `ord ${ord}`);
kontroll("FYND B4: title 344 tkn > familjetaket 314 (syskonens max: Kinnevik 313)", ut.title.length <= 314, `title ${ut.title.length} tkn — 30 över taket; kur: stryka t.ex. \"...medan nio av sjutton handlas under 0,95\" (detaljen står i bodyn)`);
kontroll("description väl inom spannet (200–1 100 tkn)", ut.description.length >= 200 && ut.description.length <= 1100, `desc ${ut.description.length}`);
kontroll("publishedAt 2026-10-21 = rappdagen (Kinnevik-konventionen FÖLJD — grön, ingen HB-not)", ut.publishedAt === "2026-10-21");
kontroll("tags 6 st — inom familjespannet (6–7)", ut.tags.length >= 6 && ut.tags.length <= 7);
kontroll("Källor-sektionen sist + disclaimer + R2-rad", body.includes("## Källor") && body.trim().endsWith("Publicering av utkastet är kundens beslut (R2)."));
kontroll("FYND B5: \"webcast kl 09:00 (Q2:s rytm)\" — bolagets IR-sida anger 08:30 för Q2-2026", !body.includes("webcast kl 09:00"), "kalenderunderlaget (09-15) bar 09:00; dagens IR-sida: \"webcast … at 08:30\" — kur: 08:30 eller neutral \"samma förmiddag\"");
kontroll("FYND B6: \"avstämningsdag och årsstämma 2026-04-22\" — stämman 22/4 ✓ men avstämningsdagen beslutades 24/4", !body.includes("avstämningsdag och årsstämma 2026-04-22"), "kallelse 2026-03-16 föreslog och stämman beslutade avstämningsdag fredagen 24 april 2026; kur: dela raden (årsstämma 22/4 · avstämning 24/4)");
notis("quick-facts-drift (C)", "utkastets \"bokfört fastighetsvärde kring 64 mdr / hyresvärde kring 5,0\" är HELÅRS-2025-tal (källraden daterar dem); bolagets quick facts visar efter förvärvet 66,2 mdr / 5,2 — inget fel (fönstren deklarerade) men presensformen kan förtydligas vid ägarens nästa ratt");
notis("vintage-drift (C, Nordea-vintage-metoden)", "universum-medianerna i tabellen låsta till 237-postvintagen (dagens fil 249: P/B 2,70 · ROE 14,57 · EBIT 21,11 · PEG 1,26 n=206) — texten rättas EJ, den deklarerar sin vintage");
notis("externa rappdagen", "kalendervyn på wihlborgs.se laddas dynamiskt — 21/10 vilar på byggarens 09-20-liveverifiering (.ics) + sammanställningens not; arkivsidan bekräftar rytmerna runt om (2026-02-10 · 2025-10-23 · 2026-04-21 · 2026-07-06)");

console.log(`\n═══ RESULTAT: ${OK} OK · ${FEL} FEL (= fyndens belägg) · ${NOT} NOT ═══`);
console.log(`═══ utkast-md5 ${md5Fil(FIL)} (orörd av sonden) ═══`);
process.exit(FEL === 0 ? 0 : 1);
