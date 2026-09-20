#!/usr/bin/env node
// s4-u1 Catena — kirurgisk infogning av KO-rader i GRANSKNINGSKO-SAMMANSTALLNING.md
// (två rader: huvudtabellen efter syskonens Investor-rad, slugtabellen efter investor-ab-sluggen)
import { readFileSync, writeFileSync } from 'node:fs';
const FIL = 'data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md';
let t = readFileSync(FIL, 'utf8');
if (t.includes('sa-laser-du-catena-q3-2026')) { console.log('Catena-rader finns redan — avbryter (idempotent)'); process.exit(0); }

const huvud = '| Catena Q3 2026 (januari–september) | [kvartal/2026-q3/sa-laser-du-catena-q3-2026.json](./kvartal/2026-q3/sa-laser-du-catena-q3-2026.json) | UTKAST v1 (2026-09-20) | fabrik auto-s4-1789908909779-s4-u1 (byggare 1/3, klaim disk-först 14:57 FÖRE byggstart) | 4 källor: kalender-fastighet.json 2026-09-15 + EGEN kalenderverifiering catena.se 2026-09-20 (23/10 kl 08:00; Q1 23/4 + Q2 6/7 infriade; fjol 24/10 2025), bolagsuniversum CATE.ST 2026-09-03 (fullt värderingsfält P/E 11,437 · P/B 0,946 · EV/EBIT 20,824 · PEG 9,17 · FCF-yield 5,26 %; medianer omräknade 2026-09-20 ur 231-postfilen: fastighet n=16–17, universum n=204–231), netnet-CATE_ST.json 2026-09-20 kl 10:18 UTC on-demand (kurs 366,40 · P/B 0,8883 · P/E 10,7638 · NCAV −297,91 klass ej), kvartalstal sökverifierade mot catena.se/Cision/Inderes/MarketScreener/Investing (Q1-26: hyra 701/driftöverskott 567/förv 424/vinst 464/EPRA 6,26; jan–jun-26: 1 510/916; jan–sep-25: 1 963/401; jan–jun-25: 1 288; Q1-25: 644/398) | egna beräkningar (motor verktyg/_s4u1-catena-byggdata.mjs; KVD verktyg/_s4u1-catena-kvd.mjs: 219 PASS 0 FEL 0 VARNING, 18 interna länkar HTTP 200) | FASTIGHETSGRENNENS ÅTTONDE PAKET — seriens ~66:e, logistikplattformens första (inte bostäder). Tre signaturnummer: (1) TRE VÄGAR TILL SAMMA BOKFÖRDA KAPITAL — 412,26 (universum-P/B) · 412,46 (golv-fält) · 412,47 (netnet-P/B), spänn 21 öre = 0,05 % = seriens tajtaste kapital-identitet (Balder-precedensen: tre delta −6,1 %); dubbelmätning kurs −6,05 %/P/B −6,10 %/P/E −5,89 % med EPS-nämnaren −0,18 % = kursen rörde sig, fundamentet stilla. (2) MITTPOSTEN MED EXTREMKANTER — P/B exakt grenmedianen 0,946 (rang 9 av 17 = medianposten) + ROE 8,51 mot median 8,57, SAMTIDIGT grenens högsta EBIT-marginal 84,86 % (nästan 10 pp före NP3), näst högsta nettomarginal 75,04 (efter Wallenstam 80,80), högsta TTM-tillväxt +25,5 % (före SPG 15,0), fjärde högsta FCF-yield 5,26, femte lägst belåning 0,93 — och resultat-CAGR −6,26 % med 2022-kvoten 129,3 % (universumets femte högsta av 219 postår; ovan endast investmentbolagsklassen med Industrivärden 1 285 %) som marginalens innehållsvarning: EBIT ÖVER brutto med 2,1 pp. (3) KVARTALSKEDJAN MED BEGREPPSNOT — hyresintäkter 644/644/675/688/701/809 (Q2-26 +25,6 %), rullande fyra 2 873 Mkr, Q4-25-cellen härledd ur universumhelåret (totala intäkter) mot hyresceller med gap 144 Mkr ≈ 5 % dokumenterat — seriens första öppet blandade cell; förv-kedjan 398/406/401/424/492, Q1-26-vinst 464 = +40 över förvaltningen, EPRA 6,26 mot förv-EPS 6,53. Därtill: PEG 9,17 mot konvention 1,97 (kvot 4,66; universumets 11:e högsta av 189, median 1,26, högst Prologis 121,59 — Prologis-klassen i mindre format), identitet P/B÷ROE 11,12 mot 11,437 = +2,9 % (när-godkänt), två fönster två multiplar 11,44/15,75 (trailing 2 264 mot bokslut 1 644 = +37,7 %, NP3-intervalläran), trailing-intäkt 3 017 mot hyreskedja 2 873 (två intäktsbegrepp), NCAV −297,91 (djupare negativt än Balders −106,48), scenarioruta 9/9 på 2025-basen med marginalvikt 0,39 (djupare i volymfickan än bankerna/Balder 0,50). Publicering = kundens beslut (R2) |';

const slug = '| sa-laser-du-catena-q3-2026 | 2026-10-23 fredag kl 08:00 (officiell: bolagets egen finansiella kalender på catena.se — interimsrapport jan–sep 2026 publiceras 23 oktober kl 08:00, sökverifierad 2026-09-20; fjolårets kom fredagen 24/10 2025 = samma veckoslutsrytm; Q1 23/4 + Q2 6/7 infriade; MarketScreener-angeringen i kalender-fastighet.json upplöstes därmed av EGEN verifiering — ASML/Balder-klassen, P&G-raden för Diös kvarstår tills dess egen verifiering) — fastighetsgrenens åttonde paket, seriens ~66:e, SEK hela vägen; nordisk logistikplattform; samma rappdag som syskonpaketet Balder; syskon i omgången: u2 Investor AB 16/10 + u3 Shell 29/10 = tre skilda objekt, noll kollision | UTKAST v1 | Se raden ovan |';

// Huvudtabellen: efter syskonens Investor AB-rad (raden som slutar med R2-pipe)
const ankHuvud = '\n| Shell Q3 2026 |';
const idxShell = t.indexOf(ankHuvud);
if (idxShell < 0) throw new Error('Shell-huvudrad saknas');
const idxInvestorEnd = t.indexOf('\n', t.indexOf('| Investor AB Q3 2026', idxShell));
t = t.slice(0, idxInvestorEnd) + '\n' + huvud + t.slice(idxInvestorEnd);

// Slugtabellen: efter investor-ab-sluggen
const idxSlugInvestor = t.indexOf('| sa-laser-du-investor-ab-q3-2026 |');
if (idxSlugInvestor < 0) throw new Error('investor-ab-slug saknar');
const idxSlugEnd = t.indexOf('\n', idxSlugInvestor);
t = t.slice(0, idxSlugEnd) + '\n' + slug + t.slice(idxSlugEnd);

writeFileSync(FIL, t);
console.log('KO-rader infogade: huvudtabell (efter Investor AB) + slugtabell (efter investor-ab)');
