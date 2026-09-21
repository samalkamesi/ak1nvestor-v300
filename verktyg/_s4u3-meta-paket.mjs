#!/usr/bin/env node
// _s4u3-meta-paket.mjs — genererar META Q3-läspaket 2026 (s4-u3, manifest auto-s4-1789986325353).
// Läser bolagsuniversum LIVE, beräknar kommunikationgrenens medianer/rang + universummedianer,
// alla härledda tal (TTM, EV-kedja, identitetstest, scenarioruta) och skriver:
//   data/blogg-utkast/kvartal/2026-q3/sa-laser-du-meta-q3-2026.json  (paketet)
//   verktyg/_s4u3-meta-data.json                                    (byggdata/kontroller)
// Q-talen nedan är sökverifierade 2026-09-21 mot Meta IR-pressreleaser (investor.atmeta.com):
// Q3-2025 (2025-10-29), Q4-2025 (2026-01-28), Q1-2026 (2026-04-29), Q2-2026 (2026-07-29).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const arr = Array.isArray(U) ? U : U.bolag;
const A = arr.find(p => p.ticker === "META");
const gren = arr.filter(p => p.bransch === "kommunikation");

// — formaterare (svenska tal) —
const f = (x, d = 2) => x.toFixed(d).replace(".", ",");
const sp = x => Math.round(x).toString().replace(/(\d)(\d{3})$/, "$1 $2");
const pct = (x, d = 1) => (x * 100).toFixed(d).replace(".", ",");

// — grenmedian + rang (konvention: rang stigande, 1 = lägst värde; n = antal värderade) —
const median = v => { const s = v.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b); const n = s.length; return n === 0 ? null : n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const rang = (alla, mitt) => { const s = alla.filter(x => x !== null && x !== undefined && Number.isFinite(x)); return { r: s.filter(x => x < mitt).length + 1, n: s.length, m: median(alla) }; };
const g = {
  pe: rang(gren.map(p => p.vardering?.pe), A.vardering.pe),
  pb: rang(gren.map(p => p.vardering?.pb), A.vardering.pb),
  evEbit: rang(gren.map(p => p.vardering?.evEbit), A.vardering.evEbit),
  peg: rang(gren.map(p => p.vardering?.peg), A.vardering.peg),
  fcfY: rang(gren.map(p => p.vardering?.fcfYield), A.vardering.fcfYield),
  roe: rang(gren.map(p => p.lonksamhet?.roe), A.lonksamhet.roe),
  roic: rang(gren.map(p => p.lonksamhet?.roic), A.lonksamhet.roic),
  brutto: rang(gren.map(p => p.lonksamhet?.bruttoMarginal), A.lonksamhet.bruttoMarginal),
  ebit: rang(gren.map(p => p.lonksamhet?.ebitMarginal), A.lonksamhet.ebitMarginal),
  netto: rang(gren.map(p => p.lonksamhet?.nettoMarginal), A.lonksamhet.nettoMarginal),
  fcfM: rang(gren.map(p => p.lonksamhet?.fcfMarginal), A.lonksamhet.fcfMarginal),
  skuld: rang(gren.map(p => p.stabilitet?.skuldEgenkapital), A.stabilitet.skuldEgenkapital),
  cagrO: rang(gren.map(p => p.tillvaxt?.omsattningCAGR5ar), A.tillvaxt.omsattningCAGR5ar),
  cagrR: rang(gren.map(p => p.tillvaxt?.resultatCAGR5ar), A.tillvaxt.resultatCAGR5ar),
  ttm: rang(gren.map(p => p.tillvaxt?.omsattningTillvaxtTTM), A.tillvaxt.omsattningTillvaxtTTM),
  prognos: rang(gren.map(p => p.tillvaxt?.prognosTillvaxt), A.tillvaxt.prognosTillvaxt),
};
// — universummedianer —
const um = k => median(arr.map(p => k(p)));
const uni = {
  pe: um(p => p.vardering?.pe), pb: um(p => p.vardering?.pb), evEbit: um(p => p.vardering?.evEbit),
  roe: um(p => p.lonksamhet?.roe), ebit: um(p => p.lonksamhet?.ebitMarginal), netto: um(p => p.lonksamhet?.nettoMarginal),
  brutto: um(p => p.lonksamhet?.bruttoMarginal), skuld: um(p => p.stabilitet?.skuldEgenkapital), ttm: um(p => p.tillvaxt?.omsattningTillvaxtTTM),
  nPoster: arr.length,
};

// — härledda kontroller —
const pris = A.pris, mcap = A.marknadsKapitalMdr;
const ttmEps = pris / A.vardering.pe;
const aktietal = mcap * 1000 / pris;                     // M aktier
const q = { // MUSD, sökverifierade
  q3_25: { oms: 51242, netto: 2709, nettoJust: 18640, eps: 1.05, epsJust: 7.25, rl: 470, rapp: "2025-10-29" },
  q4_25: { oms: 59893, op: 24745, netto: 22768, opMarg: 0.41, rapp: "2026-01-28" },
  q1_26: { oms: 56311, kostn: 33439, op: 22872, netto: 26770, eps: 10.44, epsJust: 7.31, skatteforman: 8030, capex: 32230, rapp: "2026-04-29" },
  q2_26: { oms: 60800, op: 18775, opMargFjol: 0.43, netto: 15848, nettoFjol: 18337, eps: 6.18, skatt: 0.16, skattFjol: 0.11, capex: 31100, rapp: "2026-07-29" },
  q2_25_oms: 47516,
  guide: [61000, 64000], kostnadGuide: [165000, 169000],
  konsOms: 63300, konsEps: 6.74, utdKv: 0.525, fy26OmsKons: 254100, fy26EpsKons: 31.20,
};
const ttmOms = q.q3_25.oms + q.q4_25.oms + q.q1_26.oms + q.q2_26.oms;         // MUSD
const ttmNetto = q.q3_25.netto + q.q4_25.netto + q.q1_26.netto + q.q2_26.netto;
const ttmNettoMarg = ttmNetto / ttmOms;
const ttmFcf = ttmOms * A.lonksamhet.fcfMarginal;
const ttmEbit = ttmOms * A.lonksamhet.ebitMarginal;
const vinstKvot = ttmNetto / ttmFcf;
const ek = mcap * 1000 / A.vardering.pb;                 // MUSD, P/B-vägen
const ev = A.vardering.evEbit * ttmEbit;                 // MUSD
const nettoskuldPekare = ev - mcap * 1000;
const skuldPekare = A.stabilitet.skuldEgenkapital * ek;
const kassaPekare = skuldPekare - nettoskuldPekare;
const peImplikat = A.vardering.pb / A.lonksamhet.roe;    // identitet P/E = P/B ÷ ROE
const identGap = peImplikat / A.vardering.pe - 1;
const roeBokslut = 60458 / ek;
const psIdent = A.vardering.pe * A.lonksamhet.nettoMarginal;
const psMdr = mcap / (ttmOms / 1000);
const cagrO = (Math.pow(A.serier.omsattning[3] / A.serier.omsattning[0], 1 / 3) - 1);
const cagrR = (Math.pow(A.serier.resultat[3] / A.serier.resultat[0], 1 / 3) - 1);
const stegO = [A.serier.omsattning[1] / A.serier.omsattning[0] - 1, A.serier.omsattning[2] / A.serier.omsattning[1] - 1, A.serier.omsattning[3] / A.serier.omsattning[2] - 1];
const resJust25 = 60458 + 15930;
const opm2 = q.q2_26.op / q.q2_26.oms;
const nettoYoy2 = q.q2_26.netto / q.q2_26.nettoFjol - 1;
const opYoy2 = q.q2_26.op / (q.q2_26.opMargFjol * q.q2_25_oms) - 1;
const omsYoy2 = q.q2_26.oms / q.q2_25_oms - 1;
const sc = []; for (const o of [61.0, 62.5, 64.0]) for (const m of [0.27, 0.31, 0.35]) sc.push(o * m * 1000);
const konsNetto = q.konsEps * aktietal;
const utdAr = q.utdKv * 4;
const direktavk = utdAr / pris;
const payoutTtm = utdAr / ttmEps;
const payoutFy26 = utdAr / q.fy26EpsKons;
const utdVolym = utdAr * aktietal;
const capexFart = (q.q1_26.capex + q.q2_26.capex) / 2 * 4;
const fcfPerCapex = ttmFcf / capexFart;
const serieNr = readdirSync("/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3").filter(x => x.startsWith("sa-laser-du-")).length + 1;
const grenPaket = ["tele2", "telia", "att"].length + 1; // kommunikationpaket 1-3 på disk; META = 4:e

// — kroppsbygge —
const b = `Meta Platforms — moderbolaget bakom Facebook, Instagram, WhatsApp och Threads, noterat som META på Nasdaq — öppnar sitt rapportfönster för kalenderkvartalet juli–september 2026 på onsdagen den 28 oktober efter marknadens stängning (estimat: bolaget har ännu inte utlyst datumet vid denna läspakets byggdatum 2026-09-21; fjolårets Q3 kom onsdagen 29 oktober 2025 och 2026 års rytm har varit onsdagar — Q1 29 april, Q2 29 juli — så sista onsdagen i oktober är kalenderns tyngdpunkt). Kalenderåret är räkenskapsår och hela rapporten ligger i amerikanska dollar: seriens rakaste jämförelse, utan valutabrygga och utan brutet räkenskapsår. Detta är ett utbildningspaket i AK1A:s kvartalsrapportserie — så läser du siffrorna, inte en rekommendation att köpa, sälja eller behålla några värdepapper.

## Urvalet: biblioteksposten och rappdagen

Metapaketet är nästa objekt i seriens FIFO-kö: av analysbibliotekets återstående bolag (META, CVX, DIS, PLTR, VZ) har Meta det tidigaste rapportfönstret (28 oktober mot Chevrons 30 oktober, Palantirs 2 november, Disneys 12 november och Verizons datumlösa post). Underlaget bärs av två lager: universumraden i bolagsuniversumet (hämtad 2026-09-03, dubbelkällad Yahoo Finance och MarketStack, slutkurs 2026-09-02: pris ${f(pris)} dollar, marknadsvärde ${sp(mcap)} miljarder dollar) och biblioteksposten META.json (2026-09-04) med status GUL — datatäckning ${f(0.7113 * 100, 1)} procent och AKM1 ${f(49.7, 1)} av ${f(71.1, 1)} möjliga poäng (0,699 relativt). Bibliotekspostens starkaste kategori är lönsamhet och den svagaste är katalysator — med noll poäng just där. Det är själva läsarten: Metas siffror bär ingen bolagsspecifik katalysator i modellen, utan ett makrogrepp: annonskonjunkturen och AI-investeringsepoken. Modellsnurret i biblioteksposten ger ändå en karta: AKM1:s kategoripoäng sätter lönsamhet högst (4,33 av 5) medan värdering (1,33) och moat (1,33) halstrar, stabiliteten får 3,0, risken 2,5 och katalysatorn alltså 0; AKM2, som viktas om mot 2026 års profil, landar på 62 poäng med bandet markerat osatt. Topp-variablerna är EBITDA-marginalen (5/5 — rörelsemarginalen ${pct(A.lonksamhet.ebitMarginal, 2)} som nedre gräns), intäktsstabiliteten (5/5 — omsättningens volatilitet mätt som standardavvikelsen på årskurserna är bland universumets lägsta) och kassatäckningen (5/5 — bolaget finansierar sig självt). Bottenvariablerna är alla värderingsmultiplar: P/B ${f(A.vardering.pb, 3)} ger 1/5, P/S ${f(psIdent)} ger 1/5 och EV/EBITDA-proxyn 2/5 — modellen säger alltså: kvaliteten är topp, priset på den kvaliteten är högt. Biblioteksposten dokumenterar också var data saknas: räntetäckning, balansräkningshistorik och återköpsserier är osatta hos källan — paketet härleder i stället balansräkningen bakväg ur multiplarna (se kapitlet om identitetstestet).

## Fyra år som trappa

Universumradens serie har fyra räkenskapsår (källan ger fyra, inte fem — CAGR-talen i universumfältet bygger därför på tre steg):

| År | Omsättning (MUSD) | Årsvinst (MUSD) | Omsättningstillväxt | Nettomarginal |
|---|---|---|---|---|
| 2022 | ${sp(116609)} | ${sp(23200)} | — | ${pct(23200 / 116609)} |
| 2023 | ${sp(134902)} | ${sp(39098)} | +${pct(stegO[0])} | ${pct(39098 / 134902)} |
| 2024 | ${sp(164501)} | ${sp(62360)} | +${pct(stegO[1])} | ${pct(62360 / 164501)} |
| 2025 | ${sp(200966)} | ${sp(60458)} | +${pct(stegO[2])} | ${pct(60458 / 200966)} |

Tre år i rad växte omsättningen över 15 procent med nettomarginaler som steg från ${pct(23200 / 116609)} till ${pct(62360 / 164501)} — och sedan 2025: omsättningen ${sp(164501)} → ${sp(200966)} MUSD (+${pct(stegO[2])}) men årsvinsten FÖLL från ${sp(62360)} till ${sp(60458)} MUSD (−${f(Math.abs(60458 / 62360 - 1) * 100)} procent). Förklaringen sitter i tredje kvartalet 2025: en engångsskatt på 15 930 MUSD kopplad till den amerikanska skattlagens engångseffekter krossade kvartalsvinsten till ${sp(q.q3_25.netto)} MUSD (rapporterad EPS ${f(q.q3_25.eps, 2)} dollar; utan skatteposten ${sp(q.q3_25.nettoJust)} MUSD och EPS ${f(q.q3_25.epsJust, 2)}). Räknat utan engångsposten hade årsvinsten 2025 landat på cirka ${sp(resJust25)} MUSD — det vill säga +${f((resJust25 / 62360 - 1) * 100, 1)} procent, inte minus. Ändpunkts-CAGR:erna: omsättning ${pct(cagrO, 2)} per år, årsvinst ${pct(cagrR, 2)} per år — men vinst-CAGR:n bygger på ett 2025-tal som innehåller en 15,9-miljarders-skatt. Detta är kvartalsrapportens första läslektion: skilj engångsposter från löpande, annars blir både CAGR och nettomarginal oläsliga.

## Nyckeltalen mot två referensramar

Tabellen sätter Metas universumfält (TTM-fönster, hämtat 2026-09-03) mot kommunikationsgrenens medianer (n=${gren.length} bolag, beräknade LIVE ur samma fil) och hela universumets medianer (n=${uni.nPoster}). Rang = position i grenen, 1 = lägst värde:

| Nyckeltal | META | Grenens median | Universummedian | Rang i grenen |
|---|---|---|---|---|
| P/E | ${f(A.vardering.pe)} | ${f(g.pe.m)} | ${f(uni.pe)} | ${g.pe.r}/${g.pe.n} |
| P/B | ${f(A.vardering.pb, 3)} | ${f(g.pb.m, 3)} | ${f(uni.pb, 3)} | ${g.pb.r}/${g.pb.n} |
| EV/EBIT | ${f(A.vardering.evEbit)} | ${f(g.evEbit.m)} | ${f(uni.evEbit)} | ${g.evEbit.r}/${g.evEbit.n} |
| PEG | ${f(A.vardering.peg)} | ${f(g.peg.m)} | — | ${g.peg.r}/${g.peg.n} |
| FCF-avkastning | ${pct(A.vardering.fcfYield, 2)} | ${pct(g.fcfY.m, 2)} | — | ${g.fcfY.r}/${g.fcfY.n} |
| Bruttomarginal | ${pct(A.lonksamhet.bruttoMarginal, 2)} | ${pct(g.brutto.m)} | ${pct(uni.brutto)} | ${g.brutto.r}/${g.brutto.n} |
| Rörelsemarginal | ${pct(A.lonksamhet.ebitMarginal, 2)} | ${pct(g.ebit.m)} | ${pct(uni.ebit)} | ${g.ebit.r}/${g.ebit.n} |
| Nettomarginal | ${pct(A.lonksamhet.nettoMarginal, 2)} | ${pct(g.netto.m)} | ${pct(uni.netto)} | ${g.netto.r}/${g.netto.n} |
| ROE | ${pct(A.lonksamhet.roe, 2)} | ${pct(g.roe.m)} | ${pct(uni.roe, 2)} | ${g.roe.r}/${g.roe.n} |
| ROIC | ${pct(A.lonksamhet.roic, 2)} | ${pct(g.roic.m)} | — | ${g.roic.r}/${g.roic.n} |
| Skuld/eget kapital | ${f(A.stabilitet.skuldEgenkapital, 2)} | ${f(g.skuld.m, 2)} | ${f(uni.skuld, 2)} | ${g.skuld.r}/${g.skuld.n} |
| Omsättningstillväxt TTM | ${pct(A.tillvaxt.omsattningTillvaxtTTM)} | ${pct(g.ttm.m)} | ${pct(uni.ttm)} | ${g.ttm.r}/${g.ttm.n} |

Tre bilder: (1) Plattformen tar ut två tullar — bruttomarginalen ${pct(A.lonksamhet.bruttoMarginal, 2)} är grenens ${g.brutto.r <= 3 ? "högsta" : g.brutto.r + ":e högsta"} (annonsauktionens pris på intäktssidan) samtidigt som rörelsemarginalen ${pct(A.lonksamhet.ebitMarginal, 2)} ligger ${g.ebit.r}/${g.ebit.n} — skillnaden mellan dem, ${f((A.lonksamhet.bruttoMarginal - A.lonksamhet.ebitMarginal) * 100, 1)} procentenheter, är kostnadspåslag på varje intäktsdollar och växer med AI-epoken. (2) Värderingen är berättigad-dyr på bokföringen men billig på tillväxten: P/B ${f(A.vardering.pb, 3)} mot grenens ${f(g.pb.m, 3)} — men PEG ${f(A.vardering.peg)} är ${g.peg.r <= 5 ? "i grenens fem lägsta" : "runt grenens mitt"}: P/E ${f(A.vardering.pe)} delat med prognostillväxten ${pct(A.tillvaxt.prognosTillvaxt)} ger ${f(A.vardering.pe / (A.tillvaxt.prognosTillvaxt * 100))} mot fältets ${f(A.vardering.peg)} (källans PEG bygger på eget tillväxtfönster — procentfällan i renformat). (3) Skuldsättningen ${f(A.stabilitet.skuldEgenkapital, 2)} ligger under universummedianen ${f(uni.skuld, 2)} — obligationslånen från 2022-tiden finansierar inte tillväxten, kassaflödet gör det (tills capex-epoken; se nedan).

## Signaturen: marginaltrappan som vände

Kvartalsserien 2026 (sökverifierad mot Metas egna pressreleaser på investor.atmeta.com):

| Kvartal | Omsättning (MUSD) | Rörelseresultat (MUSD) | Rörelsemarginal | Årsvinst (MUSD) | EPS (dollar) |
|---|---|---|---|---|---|
| Q3 2025 (29 okt) | ${sp(q.q3_25.oms)} | — | — | ${sp(q.q3_25.netto)} (just. ${sp(q.q3_25.nettoJust)}) | ${f(q.q3_25.eps, 2)} (just. ${f(q.q3_25.epsJust, 2)}) |
| Q4 2025 (28 jan) | ${sp(q.q4_25.oms)} | ${sp(q.q4_25.op)} | ${pct(q.q4_25.opMarg, 0)} | ${sp(q.q4_25.netto)} | — |
| Q1 2026 (29 apr) | ${sp(q.q1_26.oms)} | ${sp(q.q1_26.op)} | ${pct(q.q1_26.op / q.q1_26.oms)} | ${sp(q.q1_26.netto)} | ${f(q.q1_26.eps, 2)} (just. ${f(q.q1_26.epsJust, 2)}) |
| Q2 2026 (29 juli) | ${sp(q.q2_26.oms)} | ${sp(q.q2_26.op)} | ${pct(opm2)} | ${sp(q.q2_26.netto)} | ${f(q.q2_26.eps, 2)} |

Q2 2026 är paketets signaturkvartal — tillväxttrappan som vände på tre steg samtidigt: omsättningen ${sp(q.q2_26.oms)} MUSD, +${f(omsYoy2 * 100)} procent mot fjolårets ${sp(q.q2_25_oms)}; rörelseresultatet ${sp(q.q2_26.op)} MUSD, −${f(Math.abs(opYoy2) * 100, 1)} procent mot fjolårets ${sp(q.q2_26.opMargFjol * q.q2_25_oms)} — rörelsemarginalen från ${pct(q.q2_26.opMargFjol)} till ${pct(opm2)}; årsvinsten ${sp(q.q2_26.netto)} MUSD, −${f(Math.abs(nettoYoy2) * 100, 1)} procent. Intäkterna +28 procent, vinstmaskinen bakåt på alla nivåer under intäktsraden. Segmentlösningen förklarar varför bruttomarginalen ändå håller: annonsplattformarna i Family of Apps bär i princip hela bruttovinsten medan Reality Labs — metavers- och enhetsgrenen — redovisar omsättning i hundramiljonklassen (Q3 2025: ${sp(q.q3_25.rl)} MUSD, +74 procent årsbasis) mot breda investeringskostnader; kostnadstyngden sitter alltså inte i varukostnader utan i avskrivningar, personal och forskning. Två krafter driver kompressen: effektiva skattesatsen steg från ${pct(q.q2_26.skattFjol, 0)} till ${pct(q.q2_26.skatt, 0)} procent (2025 års låga 10-11-procentsnivåer var engångsdrabbade åt andra hållet) och kostnadsbasen växer snabbare än intäkterna — bolagets egen helårskostnadsguide för 2026 ligger på ${sp(q.kostnadGuide[0])}–${sp(q.kostnadGuide[1])} MUSD och höjdes i samband med Q2. Capex, inklusive finansiella leasingbetalningar: ${sp(q.q1_26.capex)} MUSD i Q1 och ${sp(q.q2_26.capex)} MUSD i Q2 — årsfart cirka ${sp(capexFart / 1000)} miljarder. Marknadens reaktion på Q2 blev fallande kurs trots omsättningsöverraskning: EPS ${f(q.q2_26.eps, 2)} mot konsensus cirka 7,19–7,22 dollar. Q1 visar samma spänning i spegeln: omsättning ${sp(q.q1_26.oms)} (+${f((56311 / 42314 - 1) * 100, 0)} procent), rörelsemarginal ${pct(q.q1_26.op / q.q1_26.oms)} och vinst ${sp(q.q1_26.netto)} MUSD — men där satt en engångsskatteförmån på ${sp(q.q1_26.skatteforman)} MUSD (EPS ${f(q.q1_26.eps, 2)} rapporterat, ${f(q.q1_26.epsJust, 2)} justerat): två kvartal i rad har skattposten styrt vinstraden, en i minus, en i plus. Universumradens TTM-fält +${pct(A.tillvaxt.omsattningTillvaxtTTM, 0)} förklaras av Q2:s årsjämförelse (+${f(omsYoy2 * 100)} procent) — fönstret och jämförelsen är samma. Den som vill läsa kompressen framåt har en enda brytpunkt att bevaka: när avskrivningarna på 2025–2026 års investeringsvåg börjar plana ut — tills dess växer kostnadsraden mekaniskt så länge capex ligger kring ${sp(capexFart / 1000)} miljarder per år.

## Vinsten mot kassaflödet: tre delar vinst, en del kassa

Universumradens lönsamhetsfält bär paradoxen: nettomarginal ${pct(A.lonksamhet.nettoMarginal, 2)} mot FCF-marginal ${pct(A.lonksamhet.fcfMarginal, 2)} — varje dollar i redovisad vinst motsvaras av ${f(vinstKvot)} dollar i fritt kassaflöde. Härlett på TTM-fönstret: omsättning ${f(ttmOms / 1000, 1)} miljarder, årsvinst ${sp(ttmNetto)} MUSD (nettomarginal ${pct(ttmNettoMarg, 2)} — universumfältets ${pct(A.lonksamhet.nettoMarginal, 2)} är samma fönster, differensen ${f(Math.abs(ttmNettoMarg - A.lonksamhet.nettoMarginal) * 100, 2)} procentenheter är källornas avrundningar), fritt kassaflöde ${sp(ttmFcf)} MUSD (marginalfältet ${pct(A.lonksamhet.fcfMarginal, 2)} gånger omsättningen), FCF-avkastning på marknadsvärdet ${pct(A.vardering.fcfYield, 2)} — mot capex-årsfarten ${sp(capexFart / 1000)} miljarder är det fria kassaflödet ${f(fcfPerCapex * 100, 0)} procent av investeringstakten. Utdelningen ${f(q.utdKv, 3)} dollar per kvartal (${f(utdAr, 2)} per år, direktavkastning ${pct(direktavk, 2)}, utdelningskvot ${pct(payoutTtm)} av TTM-EPS och ${pct(payoutFy26)} av FY2026-konsensus på ${f(q.fy26EpsKons, 2)} dollar) kostar cirka ${f(utdVolym / 1000, 1)} miljarder per år — ${f(utdVolym / capexFart * 100, 1)} procent av capex-farten: AI-epoken återinvesterar drygt tjugo gånger utdelningen. I syskonpaketen är samma släktträd: Microsoft-paketets återbäring 0,79 procent av marknadsvärdet per kvartal mot capex 1,11 procent (vinsten åtta gånger kassan) och Alphabet-paketets molnbottenklubb med FCF-avkastning 0,55 procent (vinsten knappat elva gånger kassan) — Meta står mittemellan: starkare bruttomarginal än båda, men samma epoksignatur med vinsten ${f(vinstKvot)} gånger kassan. Läs klyftan åt rätt håll: den är inte ett bokföringsfel utan en timingfråga — capex bokförs som investering i balansräkningen och återkommer som avskrivning över kommande år, medan driftkassan betalar uttagen direkt; frågan en kvartalsrapport kan besvara är bara hur länge uttagstakten överstiger kassaproduktionen.

## Balansräkningen bakväg: identitetstestet

Universumraden bär tre kapitalfönster och ett identitetstest. P/E = P/B ÷ ROE när alla tre mäter samma vinst och samma kapital: ${f(A.vardering.pb, 3)} ÷ ${pct(A.lonksamhet.roe, 2)} = ${f(peImplikat)} mot P/E-fältets ${f(A.vardering.pe)} — gapet −${f(Math.abs(identGap) * 100, 1)} procent (syskonpaketen Microsoft −11,5 och Alphabet −19 procent: samma klass). Förklaringen är fönster, inte fel: ROE-fältet ${pct(A.lonksamhet.roe, 2)} matchar bokslutsårets vinst 60 458 MUSD mot det egna kapitalet, medan P/E bygger på TTM-EPS. Eget kapital härleds ur P/B: ${sp(mcap)} miljarder ÷ ${f(A.vardering.pb, 3)} = ${sp(ek / 1000)} miljarder dollar; bokslutsvägen ger ROE ${pct(roeBokslut)} mot fältets ${pct(A.lonksamhet.roe, 2)} och TTM-vinsten ${sp(ttmNetto)} MUSD på samma kapital ger ${pct(ttmNetto / ek)} — tre fönster, ingen motsägelse. EV-kedjan sluter balansräkningen: TTM-EBIT ${sp(ttmEbit)} MUSD (omsättning × rörelsemarginal) gånger EV/EBIT ${f(A.vardering.evEbit)} ger EV ${sp(ev / 1000)} miljarder — ${f(ev / (mcap * 1000) * 100 - 100, 1)} procent över marknadsvärdet, en nettoskuld-pekare på ${sp(nettoskuldPekare / 1000)} miljarder. Med skuld/eget kapital ${f(A.stabilitet.skuldEgenkapital, 2)} på kapitalbasen ${sp(ek / 1000)} miljarder blir skulden ${sp(skuldPekare / 1000)} miljarder och kassan — skuld minus nettoskuld — ${sp(kassaPekare / 1000)} miljarder: tre universumfält och två multiplar återger balansräkningens grovdrag. P/S två vägar: identiteten P/E × nettomarginal = ${f(psIdent)} och marknadsvärde ÷ TTM-omsättning = ${f(psMdr, 2)} — samma påstående, två ingångar (bibliotekspostens AKM1-värdering 1/5 på P/S bygger på ${f(psIdent)}-klassen).

## Scenarioruta: nio celler på guiden

Bolagets egen Q3-vägledning är ${f(q.guide[0] / 1000, 1)}–${f(q.guide[1] / 1000, 1)} miljarder dollar i omsättning (mittpunkt 62,5) och tredjepartskonsensus ligger på cirka ${f(q.konsOms / 1000, 1)} miljarder med EPS ${f(q.konsEps, 2)} dollar. Båda ska läsas mot basåret: Q3 2025 omsatte ${sp(q.q3_25.oms)} MUSD, så guidens spann motsvarar +${f((q.guide[0] / q.q3_25.oms - 1) * 100, 1)} till +${f((q.guide[1] / q.q3_25.oms - 1) * 100, 1)} procent årsbasis — mittpunkten +${f((62500 / q.q3_25.oms - 1) * 100, 1)} och konsensus +${f((q.konsOms / q.q3_25.oms - 1) * 100, 1)}: fjärde raka året med tillväxt över tjugo procent, om guiden håller. FY2026-konsensus på helåret ligger kring ${f(q.fy26OmsKons / 1000, 1)} miljarder dollar och EPS ${f(q.fy26EpsKons, 2)}. Rutan korsar tre omsättningsnivåer med tre rörelsemarginaler — cellerna är rörelseresultat i MUSD:

| | Marginal 27 % | Marginal 31 % | Marginal 35 % |
|---|---|---|---|
| Omsättning 61,0 mdr | ${sp(sc[0])} | ${sp(sc[1])} | ${sp(sc[2])} |
| Omsättning 62,5 mdr | ${sp(sc[3])} | ${sp(sc[4])} | ${sp(sc[5])} |
| Omsättning 64,0 mdr | ${sp(sc[6])} | ${sp(sc[7])} | ${sp(sc[8])} |

Mittpunktscellen ${sp(sc[4])} MUSD ska läsas mot Q2:s faktiska ${sp(q.q2_26.op)} MUSD och Q1:s ${sp(q.q1_26.op)}: guidens mitt med oförändrad Q2-marginal (${pct(opm2)}) ger cirka ${sp(62500 * opm2)} MUSD — växer kvartersresultatet eller inte? Det är rapportens enda fråga. EPS-vägen: konsensus ${f(q.konsEps, 2)} dollar på cirka ${sp(aktietal)} miljoner aktier implicerar en årsvinst på ${f(konsNetto / 1000, 1)} miljarder — ${f((konsNetto / q.q2_26.netto - 1) * 100, 1)} procent över Q2:s ${sp(q.q2_26.netto)} MUSD, med skattesatsen ${pct(q.q2_26.skatt, 0)} procent redan i basen. Marginalvalet 27–35 spänner från Q2:s komprimerade ${pct(opm2)} tillbaka mot Q1:s ${pct(q.q1_26.op / q.q1_26.oms)} — ingen cell är en prognos, alla är läsramar för den som följer rapporten.

## Övningar, källor och juridik

Övning A — marginalbrytpunkten: vid omsättning 62,5 miljarder och skattesats 16 procent, vilken rörelsemarginal krävs för att årsvinsten ska överstiga Q2:s 15 848 MUSD? (Ledning: netto = op × 0,84; op måste överstiga 15 848 ÷ 0,84 = 18 867 MUSD, det vill säga marginal 30,2 procent — mittpunktscellen 19 375 klarar det med knapp marginal.) Övning B — identitetstestet: räkna gapet P/B ÷ ROE mot P/E för fönstren bokslut 2025 (60 458 MUSD) och TTM (${sp(ttmNetto)} MUSD) på kapitalbasen ${sp(ek / 1000)} miljarder — vilket fönster ligger närmast ROE-fältets 29,85 procent? Övning C — kassaflödesgapet: om capex år 2028 faller tillbaka till hälften av årsfarten ${sp(capexFart / 1000)} miljarder med oförändrad rörelsemarginal, hur stor blir FCF-marginalen om kassaflödet från drift i dag ligger kring ${sp(ttmFcf + capexFart)} MUSD? (Ledning: FCF = driftkassa − capex; dagens ${sp(ttmFcf)} = ${sp(ttmFcf + capexFart)} − ${sp(capexFart)}; halverat capex ger ${sp(ttmFcf + capexFart / 2)} MUSD, det vill säga FCF-marginal ${f((ttmFcf + capexFart / 2) / ttmOms * 100, 1)} procent — mer än dubbelt mot dagens ${pct(A.lonksamhet.fcfMarginal, 2)}.)

Källor: [Metas pressreleaser och finansiella kalender](https://investor.atmeta.com) (Q3 2025 publicerad 2025-10-29, Q4 2025 den 2026-01-28, Q1 2026 den 2026-04-29, Q2 2026 den 2026-07-29; rappdatum 2026-10-28 är estimat tills bolaget utlyser), bolagsuniversumets META-rad 2026-09-03 (Yahoo Finance och MarketStack, dubbelkällad, slutkurs 2026-09-02), analysbibliotekets META.json 2026-09-04 (AKM1/AKM2-modellerna), grenkalendern kalender-kommunikation.json 2026-09-15 samt tredjepartskonsensus (Public.com, TipRanks) för Q3 2026. Gren- och universummedianerna är beräknade ur 249-bolagsfilen vid paketets byggtidpunkt; kvartalstalen är sökverifierade 2026-09-21. Jämförelseläsningar i seriens syskonpaket på disk: Tele2 (hävstångspaketet), Telia, AT&T (kommunikationgrenen), Microsoft (FCF-paradoxen) och Alphabet (engångspostens paket); mätarnas grensammanhang via [P/E](/dataset/kommunikation/pe), [P/B](/dataset/kommunikation/pb), [PEG](/dataset/kommunikation/peg), [EV/EBIT](/dataset/kommunikation/ev-ebit), [bruttomarginal](/dataset/kommunikation/brutto-marginal), [nettomarginal](/dataset/kommunikation/netto-marginal), [FCF-avkastning](/dataset/kommunikation/fcf-avkastning), [ROE](/dataset/kommunikation/roe), [ROIC](/dataset/kommunikation/roic), [skuldsättning](/dataset/kommunikation/skuldsattning), [tillväxttalen](/dataset/kommunikation/omsattningstillvaxt-ttm) och [universumjämförelsen](/dataset/kommunikation/universumjamforelse); metod och transparens i [källorna](/kallor), [kurserna](/kurser) och [transparensen](/transparens).

Detta paket är utbildningsmaterial om hur en kvartalsrapport läses — inga köp-, sälj- eller behållningsrekommendationer, ingen värdepappersrådgivning (utbildning är tillåtet enligt lagen 2007:528 om värdepappersrörelser; rådgivning kräver tillstånd). Alla tal är historiska eller härledda ur offentliga källor; framtida kvartal är okända och scenariorutan är en läsram, inte en spådom.
Publicering av utkastet är kundens beslut (R2).`;

const paket = {
  slug: "sa-laser-du-meta-q3-2026",
  title: "Meta Q3-rapport 2026: så läser du den — omsättningen växte 28 procent medan rörelseresultatet föll 8 (marginalen 43 till 31) och kassaflödet är en tredjedel av vinsten",
  description: "Meta Platforms (META, Nasdaq) rapporterar kalenderkvartalet juli–september 2026 onsdagen 28 oktober (estimat). Läspaketet visar marginaltrappan som vände: Q2 2026 växte omsättningen 28 procent men rörelseresultatet föll 8 procent, med capex på 31 miljarder dollar per kvartal — PEG 0,77, bruttomarginal 81,75 procent och identitetstestet P/B ÷ ROE. Utbildning i AK1A:s kvartalsserie — aldrig råd, inga rekommendationer.",
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: "2026-10-28",
  readingMinutes: Math.max(3, Math.round(b.split(/\s+/).filter(Boolean).length / 600)),
  tags: ["kvartalsrapport", "Meta", "kommunikation", "USA", "nyckeltal", "AI-investeringar"],
  body: b,
};

writeFileSync("/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-meta-q3-2026.json", JSON.stringify(paket, null, 1) + "\n");

const data = {
  genererad: "2026-09-21", agent: "s4-u3 (manifest auto-s4-1789986325353)",
  universum: { hamtat: "2026-09-03", pris, mcapMdr: mcap, pe: A.vardering.pe, pb: A.vardering.pb, evEbit: A.vardering.evEbit, peg: A.vardering.peg, fcfYield: A.vardering.fcfYield, roe: A.lonksamhet.roe, roic: A.lonksamhet.roic, brutto: A.lonksamhet.bruttoMarginal, ebitMarg: A.lonksamhet.ebitMarginal, nettoMarg: A.lonksamhet.nettoMarginal, fcfMarg: A.lonksamhet.fcfMarginal, skuldEk: A.stabilitet.skuldEgenkapital, cagrOms: A.tillvaxt.omsattningCAGR5ar, cagrRes: A.tillvaxt.resultatCAGR5ar, ttm: A.tillvaxt.omsattningTillvaxtTTM, prognos: A.tillvaxt.prognosTillvaxt, insiderkop: A.aterkop.insiderkopSenaste6man },
  serier: { ar: A.serier.ar, oms: A.serier.omsattning, res: A.serier.resultat },
  gren: { n: gren.length, ...Object.fromEntries(Object.entries(g).map(([k, v]) => [k, { m: v.m, n: v.n, r: v.r }])) },
  universumMedianer: { ...uni },
  kvartal: q,
  kontroller: { ttmOms, ttmNetto, ttmNettoMarg, ttmFcf, ttmEbit, ttmEps, aktietal, ek, ev, nettoskuldPekare, skuldPekare, kassaPekare, peImplikat, identGap, roeBokslut, psIdent, psMdr, cagrO, cagrR, stegO, stegO2: stegO[2], resJust25, opm2, nettoYoy2, opYoy2, omsYoy2, vinstKvot, sc, konsNetto, utdAr, direktavk, payoutTtm, payoutFy26, utdVolym, capexFart, fcfPerCapex, serieNr, grenPaket },
};
writeFileSync("/home/ak1a/AK1/verktyg/_s4u3-meta-data.json", JSON.stringify(data, null, 1) + "\n");
console.log("OK paket + data skrivna. ord:", b.split(/\s+/).filter(Boolean).length, "rm:", paket.readingMinutes, "serieNr:", serieNr);
console.log("grenrang brutto:", g.brutto.r + "/" + g.brutto.n, "peg:", g.peg.r + "/" + g.peg.n, "netto:", g.netto.r + "/" + g.netto.n, "skuld:", g.skuld.r + "/" + g.skuld.n);
