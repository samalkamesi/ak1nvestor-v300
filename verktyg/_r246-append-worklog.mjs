#!/usr/bin/env node
/** _r246-append-worklog.mjs — appenda ROND 246-sektionen till worklog.md via node (skal-lexan: heredoc hänger). */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const txt = readFileSync("worklog.md", "utf8");
if (txt.includes("## ROND 246 [organ:Φ] — v173 U42 LEVERERAD")) {
  console.log("REDAN BOKFÖRD — hoppar");
  process.exit(0);
}
const sektion = `
## ROND 246 [organ:Φ] — v173 U42 LEVERERAD: Klépierre S.A. LI.PA (Frankrike/fastighet 1→2) — universum 303→304, URW+Klépierre-duon (handelns fastigheter i två format: Westfield-mixed-malls mot kontinentala regionstäva köpcentrum — SIIC-REIT), rappdag 10-23 INOM v172-fönstret (SJUNDE bolaget, dagen efter A3M) — 2026-09-25

U42: Frankrike/fastighet-cellens duo — URW (mixed-malls) + Klépierre (regionstäva köpcentrum). EPA/EUR (URW.PA-precedensen) med fastighetsradens fältprofil (VNA/AT1-mallen: serier.fcf=[] — REIT-FCF=OCF dokumenterad i paranoid). Kalenderårsbokslut, halvårsrapportering (TTM jun '26).
TRETTON LÅS (SEX EXAKTA): mcap EXAKT (0,28678×36,24 = 10,39 fyra siffror) · PS EXAKT · netto-M EXAKT (78,12) · FCF-M EXAKT (56,89 — REIT=OCF) · divY EXAKT (5,24) · D/E 0,06 % EXAKT · PAYOUT med RÄTT bas EXAKT (betald TTM 536,8/netto 1 367 = 39,27 % mot källraden 39,28 — TD-mönstret) · P/E 0,08 % · P/B 0,4 % · fcfY/evSales/evEarnings snäva · EV 10,7 % (REIT-JV-strukturen — proportionella andelar i konsoliderade center; dokumenterad tolerans 12 %). P/E-FAMILJEN TIGHT 7,59/7,60/7,597; fwd P/E 12,67 > trailing (IFRS-värderingsvinsterna värderas bort — VNA-noten); PEG NULL (basblandning: 5,29 mot 2,42/4,05).
IFRS-BERGOCHDALBANEN dokumenterad (URW-mönstret): netto [544,7 · 415,2 · 192,7 · 1 098 · 1 299] + TTM 1 367 — FY23-botten 192,7 = räntechockens nedskrivningsvåg; netto-CAGR +46,2 % MED VÄRDERINGSNOT; pretax-M 98,3 > EBIT-M 64,8 = fastighetskaskaden (resultatet är fastighetsvärderingar, inte hyreskollaps).
HYRESSIDAN = sanningen: oms [1 409 · 1 566 · 1 539 · 1 695 · 1 743] + TTM 1 749 (CAGR +3,63 %; FY23-dip = centeravyttringar; rev-fwd −6,75 % = planerade försäljningar dokumenterat) · bruttomarginal 77,9 %.
REIT-FCF = OCF: [865,8 · 910,4 · 933,8 · 965 · 1 025] + TTM 1 009 — STIGANDE FEM RAKA ÅR (TTM-dip −1,55 % dokumenterad); capex 14 M (underhållet i fastighetsposterna); FCF-M 56,89 EXAKT · yield 9,58 % — SIIC-utdelningsbasen.
UTD HÖJD fem raka [1,70 · 1,75 · 1,80 · 1,85 · 1,90] (5,24 % EXAKT; FCF-payout 54,75 % = SIIC-logiken). P/B 0,89 = substansrabatt 11 % · NETTO-SKULD −7,67 mdr stabil · ROIC-gap −1,49 p (REIT-kapitallogiken) · skatt 11,25 % (SIIC) · SEGMENTLÅS EJ TILLÄMPLIGT (källan erbjuder ingen segmentstruktur — dokumenterat, inget falskt lås).
KVD: append 303+/0− · läs-tillbaka ×2 · llms HELREGEN 304 (totalt n 292; 10 aspektrader; fastighet 18→19) · läckagevakt 0 (549) · tsc 0 (pre-commit-grinden) · prod dataleverans utan bygge. ETT STEG I TAGET enligt skal-lexan.
Frankrike-grenmätning EFTER inlägget (mätt): energi 2 · fastighet 2 · finans 5 · halso 2 · industri 2 · kommunikation 1 · konsument 5 · material 2 · teknik 5 ⇒ kvarvarande 1-gren: kommunikation (U43 TEP — med SEKTOR-VILLKORET: GICS/sector-rad får ej visa Industrials, då ny sond).
Kö: U43 TEP LI-hämtning (fyra paneler EPA/EUR) → FRANKRIKE KOMPLETT (sjätte landet, tolv grenar ≥2) · v172-fönstret 10-20 (SJU bolag inne: A3M 10-22 · LI 10-23 · DGE+BBVA+PUIG 10-29 · SGO+4503 10-30 · ENB 11-02) · Indien-svep. R2: Q3-paketet väntar kund. Protokoll: V173-U42-LI-KLEPIERRE-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.
`;
appendFileSync("worklog.md", txt.endsWith("\n") ? sektion : "\n" + sektion);
const efter = readFileSync("worklog.md", "utf8");
if (!efter.includes("## ROND 246 [organ:Φ] — v173 U42 LEVERERAD")) { console.error("ABORT: läs-tillbaka"); process.exit(1); }
console.log("WORKLOG BOKFÖRD: ROND 246-sektionen appenderad (" + (efter.length - txt.length) + " tecken)");
