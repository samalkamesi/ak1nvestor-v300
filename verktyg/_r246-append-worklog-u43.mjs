#!/usr/bin/env node
/** _r246-append-worklog-u43.mjs — appenda U43-delen av rond 246 till worklog.md via node. */
import { readFileSync, appendFileSync } from "node:fs";

const txt = readFileSync("worklog.md", "utf8");
if (txt.includes("## ROND 246 [organ:Φ] FORTS — v173 U43 LEVERERAD")) {
  console.log("REDAN BOKFÖRD — hoppar");
  process.exit(0);
}
const sektion = `
## ROND 246 [organ:Φ] FORTS — v173 U43 LEVERERAD: Publicis Groupe PUB.PA (Frankrike/kommunikation 1→2) — universum 304→305, TEP AVVISAD av sektorvillkoret (källan: Industrials), PUB vald av tre gröna (PUB/MMT/TFI), Orange+Publicis-duon (kommunikationens nät mot budskapet), GEO-SEX-BENSLÅS exakt i FEM fönster, rappdag 10-15 pre-fönsterklassen — FRANKRIKE KOMPLETT (SJÄTTE LANDET, tolv grenar ≥2) — 2026-09-25

SEKTOR-VILLKORET SLOG (rond 245:s dokumenterade villkor): TEP Teleperformance AVVISAD i hämtningssteget — källans Sector-rad: Industrials (Specialty Business Services). ALTERNATIV SOND: ILD Iliad REN men HTTP 404 hos källan (EPA-täckning saknas) · ETL Eutelsat Communication Services men TTM-netto −457,3 M (P/E-bärare RÖD). GENERATION 2: PUB Publicis · MMT M6 · TFI TF1 — alla tre RENA + Communication Services + P/E-bärare GRÖNA (PUB 24,39 mdr/1,62 mdr/15,21 · MMT 1,41/100,5 M/14,05 · TFI 1,35/125,2 M/10,89) ⇒ PUB VALD (störst och stabilast); MMT/TFI dokumenterade reserver.
U43: Frankrike/kommunikation-cellens duo — Orange (nätet/infrastrukturen) + Publicis (budskapet/reklambyråsidan: medieplanering, data, AI-agenter). EPA/EUR; kvartalsrapporterande (TTM jun '26; H1 '26 med UPPGRADERAD guidance); RAPPDAG 2026-10-15 = PRE-fönsterklassen (EL 10-16/PSON 10-12-mönstret).
TRETTON LÅS (TOLV ≤0,2 %): mcap EXAKT (0,24972×97,62 = 24,39 fyra siffror) · PAYOUT RÄTT BAS EXAKT (betald TTM 903/netto 1 622 = 55,67 % mot källraden 55,67 — TD-mönstret) · fcfM EXAKT (14,00) · fcfY EXAKT (10,13) · divY EXAKT (3,84) · P/E pris/EPS 0,05 % · EV-dekomposition 0,07 % (24,39+5,45−2,13 = 27,71 mot 27,69) · evEarnings 0,06 % · evSales 0,07 % · nettoM 0,07 % · PS 0,2 % · PB 0,1 % · D/E 0,2 %. PEG 1,77 MED REN BAS (fwd P/E/EPS-fwd-3Y = 11,90/6,73 = 1,768). P/E-familjen 15,21/15,04/15,203.
GEO-SEX-BENSLÅSET EXAKT I FEM FÖNSTER (±0 %): Europa+NA+APAC+LatAm+MEA+Other = totalen i TTM+FY25+FY24+FY23+FY22 — vågens bredaste geo-lås; NA 50,5 % · Europa 20,2 % · Other 17,1 % (pass-through, växande 1 624→3 026).
TILLVÄXT: oms [14 196 · 14 802 · 16 030 · 17 399] + TTM 17 650 (CAGR +7,02 %; FY22 +20,94 % efterpandemi-topp; TTM +1,44 % — takten dalar men nivån rekord) · netto svag nedgång [1 660 · 1 653 · 1 622] medan EBIT stiger [2 061→2 623] (skatt 592 M/26,69 % i LiveRamp-året) · res-CAGR +10,58 %.
BRUTTOMARGINAL STIGANDE FEM RAKA [42,73 · 43,23 · 43,31 · 45,75 · 46,67] % (moat: medel 44,34 · spread 3,94 p). FCF-IDENTITETSÅS SEX FÖNSTER EXAKT (OCF−capex = FCF-rad FY22–25+TTM; [2 219 · 1 868 · 2 063 · 2 693] + TTM 2 471; FY23-dip = working capital-reningen).
LIVERAMP-KEDJAN dokumenterad: NETTO-SKULD −1,53→−3,32 mdr (FÖRDUBBLAD) · kassa 4 166→2 128 (HALVERAD) · $2,2 mdr kontant (maj '26, största sedan 2019) · ny EUR 500 M-obligation (09-16) · skuld nedtrappad [6 561→5 450].
UTD: DPS 3,75 (3,84 % EXAKT; +4,17 %; shareholder yield 4,32 %); belopp [−227 · −83,2 · −726 · −853 · −903 · −903] (FY22-kolumnens −83,2 = källans avstämningsbild). ROIC-gap +7,24 p (13,92 mot WACC 6,68 — bland vågens bredaste) · räntetäckning 12,73 · 52v +21,29 % ÖVER BÅDA MA = radens TRENDBÄRARE (PT +14,93 % Buy 16).
KVD: append 304+/0− · läs-tillbaka ×2 · llms HELREGEN 305 (totalt n 293; kommunikation 31→32: P/E-median 17,6→16,9, n 29→30; universummedian 20,2→20,1) · läckagevakt 0 (551) · tsc 0 (pre-commit-grinden) · prod dataleverans utan bygge. ETT STEG I TAGET enligt skal-lexan (heredoc-hänget verifierat utan verkställse — node-kanalen använd).
FRANKRIKE KOMPLETT: kommunikation 1→2 ⇒ TOLV GRENNAR ALLA ≥2 (SJÄTTE LANDET): energi 2 · fastighet 2 · finans 5 · halso 2 · industri 2 · kommunikation 2 · konsument 5 · material 2 · teknik 5 — Frankrike 27 bolag.
Kö: v172-fönstret 10-20 (kalendern ÅTTA bolag: PUB 10-15 pre + EL/PSON pre · A3M 10-22 · LI 10-23 · DGE+BBVA+PUIG 10-29 · SGO+4503 10-30 · ENB 11-02; ENGI/NG/SN efter) · Indien-svep · MMT/TFI reserver. R2: Q3-paketet väntar kund. Protokoll: V173-U43-PUB-PUBLICIS-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.
`;
appendFileSync("worklog.md", txt.endsWith("\n") ? sektion : "\n" + sektion);
const efter = readFileSync("worklog.md", "utf8");
if (!efter.includes("## ROND 246 [organ:Φ] FORTS — v173 U43 LEVERERAD")) { console.error("ABORT: läs-tillbaka"); process.exit(1); }
console.log("WORKLOG BOKFÖRD: U43-sektionen appenderad (" + (efter.length - txt.length) + " tecken)");
