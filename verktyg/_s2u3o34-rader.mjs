#!/usr/bin/env node
/**
 * s2-u3 omg34 — FRANKRIE/INDUSTRI-TRION Thales (HO.PA) + Dassault Aviation
 * (AM.PA) + Alstom (ALO.PA): rader + Aritmetikgrind FÖRE skrivning.
 *
 * Källa: StockAnalysis /quote/epa/ fem ytor × 3 bolag, curl-html ordagrant
 * (kanon /tmp/*-kanon.json ur _s2u3o34-kanon.mjs), S&P GMI-underlag,
 * hämtat 2026-10-01. Grindmönstret: OMG32/33 (ABORT FÖRE skrivning vid rött).
 *
 * Läge: disk 330 (syskon u2:s SU.PA+LR.PA på disk, ocommittade) + 3 = 333.
 */
import { readFileSync } from "node:fs";

const KALLA = "https://stockanalysis.com/quote/epa/";
const YTOR = " (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)";

export const RADER = [
  {
    ticker: "HO.PA",
    namn: "Thales S.A.",
    bransch: "industri",
    land: "Frankrike",
    valuta: "EUR",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-10-01",
        url: KALLA + "HO/" + YTOR,
        paranoid:
          "EPA-PRIMÄRNOTING i EUR (S&P GMI-underlag; SA-html ordagrant via curl — sammanfattningslagret kasseras, s2u2-metodfynd omg33; kanon: verktyg/_s2u3o34-kanon.mjs): kurs 224,40 EUR (översiktens huvudtal; dagens spannr 223,70–227,10; källans Price Target-fält 293,32 (+30,71 %) är ANALYSKURS ej handelskurs — s2u2-fällan förtjänstfullt fångad igen), mcap 46,13 mdr EUR (aktiebas 205,46 M; replik 224,40×0,20546 = 46,107 = 0,05 % band), EPS TTM 7,26, P/E 30,93 (replik 224,40/7,26 = 30,909 = 0,07 % band; mcap/netto 46,13/1,496 = 30,84 — fältets bas är EPS-vägen), fwd P/E 19,33 ⇒ prognosTillväxt +60,01 % implicit, PEG 0,52 = 30,93/60,01 mallens konvention (källans PEG-fält 0,80 på deras EPS-tillväxtsbas — redovisad), P/B 5,75 = 46,13/8,007 EK-total EXAKT (BVPS-fältet 38,97 ger 5,76 — raden bär mcap/EK-vägen), EV 46,66 mdr = mcap 46,13 + skuld 5,575 − kassa 5,056 + minoritet 0,011 = 46,66 EV-IDENTITETEN EXAKT, EV/EBIT 18,22 källans fält (replik 46,66/2,373 = 19,67 — källans bredare EBIT-bas 2,563, spannet dokumenterat) · EV/EBITDA 13,28 · EV/Sales 2,04 · EV/FCF 11,66 · EV/Earnings 31,19, D/E 0,70 = 5,575/8,007 EXAKT · räntetäckning 10,59 · Debt/EBITDA 1,68 · Debt/FCF 1,39, ROE 19,35 % källans fält · ROA 3,76 · ROIC 22,76 mot WACC 4,74 = +18,02 pp (cellens bredaste värdeskapningsgap — låg kapitalbindning + statliga kontrakt) · ROCE 17,49, marginaler TTM: brutto 26,86 % = 6,130/22,821 EXAKT · EBIT 10,40 % = 2,373/22,821 EXAKT · netto 6,55 % = 1,496/22,821 EXAKT · FCF 17,54 % = 4,003/22,821 EXAKT — FY23 FY22 FY21 alla fyra repliker exakt på kolumnbas, FCF-IDENTITETEN: OCF 4,685 − capex 0,6828 = 4,002 (källans FCF-rad 4,003 — avrundning), fcfYield 8,68 % = 4,003/46,13 EXAKT, FCF-M 17,54 > netto-M 6,55 (båda EXAKTA — orderförskottens kassalogik: kunderna finansierar tillverkningen), utdelning 3,90 EUR/år (1,74 %), DPS-trappan 2,56→2,94→3,40→3,70→3,90 (FY21→25: +52 % på fyra år, källans Dividend Per Share-rad), betald TTM 801,3 M = 3,90×205,46 M EXAKT (payout 53,6 % av netto), återköp −43,7 M TTM, aktiebas 212,92→205,46 M FY21→25 (−3,5 %), insiders 0,02 % · institutioner 19,68 % (källans fält — franska statens APE-block utanför källans insiderdefinition), float 89,73 M, beta 0,12 (5Y), 52-v 212,60–279,30 med kursen −15,57 % på 52v UNDER MA50 245,07 och MA200 243,13, RSI 34,61 (kursens motcykel mot orderbokens tillväxt — kvartilpedagogikens kontrastfall; källans tal), analytiker Köp med PT 293,32, 84,958 anställda (källans rev/anställd 277,923 — replik 22,821 mdr/84,958 = 268,6k, källans bas dokumenterad; vinst/anställd 18,217), skatt 325,2 M / eff. 18,12 % (patentbox-Struktur), ORDERBOKEN källans backlog-fält: 34,744→40,957→45,251→50,602→53,323 M€ FY21→25 (+53 % på fyra år; TTM-kolumnen bär inte backlog — senaste året FY25 redovisas) = 2,41× FY25-omsättningen, segment TTM: Defence 12,969 (56,8 % av omsättningen) + Aerospace 5,930 + Cyber & Digital 3,787 + Other 134 = 22,820 (huvudtal 22,821, diff 1 = avrundning), TBV −2,482 M (goodwill 8,644 + immateriella 1,845 — förvärvs和历史), netto-skuld −519 M (FY23 −4,354 — skuldnedgången på fyra år), working capital −4,530 M (orderförskotts-maskinen: obförd intäkt 12,480 M), TTM-PERIODETIKETTERNA: fi-ytans Current-kolumn bär 'Oct 1, 2026' medan bs/cf-ytorna bär 'TTM Jun 30, 2026' (källans etiketter ordagrant — värdena konsekventa mellan ytor: ov rev-ttm 22,82B = fi 22,821), kalenderårsbokslut (Dec 31), nästa rapport 2026-10-23 (källans Est. Earnings-datum)",
      },
    ],
    hamtat: "2026-10-01",
    pris: 224.4,
    marknadsKapitalMdr: 46.13,
    tillvaxt: {
      omsattningCAGR5ar: 0.0813,
      resultatCAGR5ar: 0.1137,
      omsattningTillvaxtTTM: 0.0309,
      prognosTillvaxt: 0.6001,
    },
    lonksamhet: {
      roe: 0.1935,
      roic: 0.2276,
      bruttoMarginal: 0.2686,
      ebitMarginal: 0.104,
      nettoMarginal: 0.0655,
      fcfMarginal: 0.1754,
    },
    stabilitet: {
      skuldEgenkapital: 0.7,
      rantaTackning: 10.59,
      fcfPositivaSenaste5: 5,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: 0,
    },
    aterkop: {
      senasteArMdr: 0.8013,
      andelUtestande: 0.0002,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: 0.2574,
      bruttoMarginalSpread5ar: 0.0153,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 30.93,
      pb: 5.75,
      evEbit: 18.22,
      peg: 0.52,
      fcfYield: 0.0868,
      egenKapitalMultipl: 5.75,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2021", "2022", "2023", "2024", "2025"],
      omsattning: [16192000000, 17569000000, 18428000000, 20577000000, 22136000000],
      resultat: [1089000000, 1121000000, 1023000000, 1420000000, 1675000000],
      egetKapital: [6719000000, 7382000000, 6969000000, 7558000000, 7988000000],
      fcf: [2452000000, 2525000000, 1056000000, 2098000000, 2635000000],
    },
    notering:
      "cellmotiverad trio (Frankrike/industri 5→6: syskonen u2:s Schneider+Legrand samma manifestomgång nådde mattan 5 — mina +3 tar cellen till 8; Airbus flygkroppen + Safran motorerna + Veolia kretsloppet + Schneider/Legrand elektrifieringen (syskon) + Thales försvarselektroniken = SEX industriella arketyper i EN cell); FÖRSVARSANDELN 56,8 % (Defence 12,969 av 22,821 TTM) med ORDERBOKEN 53,3 mdr = 2,41× årsomsättningen (källans backlog-serie +53 % på fyra år) som signaturtal — låg beta 0,12 och working capital −4,53 mdr (obförd intäkt 12,48 mdr) visar statliga kontrakts kapitallogik: kunderna betalar i förskott; FCF-M 17,54 > netto-M 6,55 (båda EXAKTA) — orderförskotten gör kassan före bokslutet; ROIC-gap +18,02 pp (WACC 4,74) cellens bredaste; bruttomarginal-trappan fem raka stigande 24,91→26,44 % (moat-medel 25,74, spread 1,53 pp); DPS +52 % på fyra år; netto-skuld −519 M efter FY23:s −4,354 (nedbyggd); TBV −2,48 mdr (goodwell-tung); kursen −15,6 % 52v UNDER båda MA medan orderboken växer — värderingskvartilernas pedagogik; kollisionskontroll primär+sekundär GRÖN (HO/HO.PA+namn+URL); EPA/EUR (AIR.PA-precedensen); kalenderårsbokslut; RAPPDAG 2026-10-23 (källans datum); alla repliker i paranoid (StockAnalysis EPA 2026-10-01)",
  },
  {
    ticker: "AM.PA",
    namn: "Dassault Aviation société anonyme",
    bransch: "industri",
    land: "Frankrike",
    valuta: "EUR",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-10-01",
        url: KALLA + "AM/" + YTOR,
        paranoid:
          "EPA-PRIMÄRNOTING i EUR (S&P GMI-underlag; SA-html ordagrant via curl, kanon _s2u3o34-kanon.mjs): kurs 282,80 EUR (översiktens huvudtal; dagens spannr 282,20–290,40; källans Price Target-fält 360,65 (+27,53 %) är ANALYSKURS ej handelskurs), mcap 21,88 mdr EUR (aktiebas 77,05 M; replik 282,80×0,07705 = 21,788 = 0,42 % band), EPS TTM 12,93, P/E 21,97 (replik 282,80/12,93 = 21,87 = 0,45 % band), fwd P/E 16,55 ⇒ prognosTillväxt +32,75 % implicit, PEG 0,67 = 21,97/32,75 mallens konvention (källans PEG-fält 0,97 på deras 3-årsbas — redovisad), P/B 3,33 = 21,88/6,561 EXAKT, NETTKASSAN — bolagets signatur: kassa 10,115 mdr mot skuld 0,201 = netto +9,914 mdr = 127,60 EUR/aktie = 45,1 % av kursen (källans Net Cash-fält; källans per-aktie-fält 128,67 på sin bas — dokumenterad), EV 11,97 mdr = mcap 21,88 + 0,201 − 10,115 + minoritet 0,006 = 11,972 EV-IDENTITETEN EXAKT — kassan halverar företagsvärdet (EV/EBIT 10,18 · EV/EBITDA 8,65 · EV/Sales 1,35 · EV/FCF 8,96 · EV/Earnings 11,92 — EV-familjen på den-netto-basen), D/E 0,03 = 0,201/6,561 · räntetäckning 128,33 (kassan bär ränta — universumets klass) · Debt/EBITDA 0,20, ROE 15,74 % · ROIC 7,33 mot WACC 6,50 = +0,83 pp (trångt — 10-mdr-kassan drar ner avkastningen på investerat kapital; fcfYield 6,11 % visar helheten) · ROCE 11,46, marginaler TTM: brutto 33,91 % = 3,016/8,895 EXAKT · EBIT 8,67 % = 0,771/8,895 EXAKT · netto 11,29 % = 1,005/8,895 EXAKT · FCF 15,03 % = 1,337/8,895 EXAKT, FCF-IDENTITETEN OCF 1,461 − capex 0,125 = 1,336 (källans rad 1,337 — avrundning), fcfYield 6,11 % = 1,337/21,88 EXAKT, NETTO-M 11,29 > EBIT-M 8,67 (pretax-M 14,68 — ränteinkomsterna på kassan är den andra fabriken: pretax 1,31 mdr mot EBIT 0,77), segment TTM: Defense Export 4,126 + Falcon 2,891 + Defense France 1,712 + Other 210 = 8,939 = källans Revenue (Total) EXAKT (huvudtal 8,895 = elimineringsbas), Rafale-exportens flöde: Defense Export 4,549 FY21 → 1,512 FY23 (mellan/toppar) → 4,126 TTM (nya kontrakt), FY23 OCF −672,61 M (avanceringsflödet vänder — intjänat utan kassa) mot FY22 +5,110 (FCF-M 69,83 % — avancetoppen): FCF-serien 1,490→4,935→−1,018→1,535→1,683 (berg-och-dalbana med fyra positiva av fem), fyra raka positiva nettoår 693→924→977 + TTM 1,005, ORDERBOKEN källans backlog-fält: 20,762→35,008→38,508→43,224→46,596 M€ FY21→25 = 6,14× FY25-omsättningen (Rafale-kontraktens berg — cellens högsta backlog-täckning; TTM-kolumnen bär ej backlog), utdelning 4,78 EUR/år (1,69 %), DPS-trappan 2,49→3,00→3,37→4,72→4,78 FY21→25, betald TTM 370,77 M (replik 4,78×77,05 = 368,3 = 0,7 % band), återköp −337,05 M TTM, aktiebas 83,18→77,05 M (−7,4 %), insiders 0,30 % · institutioner 9,52 % · float 16,58 M av 77,05 M = 21,5 % (familjeholding-konstruktionen: huvudägarens block utanför float — källans fält), beta 0,42, under MA50 295,64 och MA200 306,01, RSI 43,72, analytiker Köp, 14,573 anställda (rev/anställd 610,357 källans fält — replik 8,895 mdr/14,573 = 610,4k EXAKT, cellens högsta produktivitet), skatt 302,89 M / eff. 23,19 %, TBV +6,338 M, kalenderårsbokslut, nästa rapport 2026-10-16 (källans Est. Earnings-datum)",
      },
    ],
    hamtat: "2026-10-01",
    pris: 282.8,
    marknadsKapitalMdr: 21.88,
    tillvaxt: {
      omsattningCAGR5ar: 0.00857,
      resultatCAGR5ar: 0.1273,
      omsattningTillvaxtTTM: 0.1747,
      prognosTillvaxt: 0.3275,
    },
    lonksamhet: {
      roe: 0.1574,
      roic: 0.0733,
      bruttoMarginal: 0.3391,
      ebitMarginal: 0.0867,
      nettoMarginal: 0.1129,
      fcfMarginal: 0.1503,
    },
    stabilitet: {
      skuldEgenkapital: 0.03,
      rantaTackning: 128.33,
      fcfPositivaSenaste5: 4,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: 0,
    },
    aterkop: {
      senasteArMdr: 0.3708,
      andelUtestande: 0.003,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: 0.3593,
      bruttoMarginalSpread5ar: 0.0667,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 21.97,
      pb: 3.33,
      evEbit: 10.18,
      peg: 0.67,
      fcfYield: 0.0611,
      egenKapitalMultipl: 3.33,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2021", "2022", "2023", "2024", "2025"],
      omsattning: [7318000000, 7067000000, 4964000000, 6401000000, 7572000000],
      resultat: [605390000, 716230000, 693400000, 923820000, 977390000],
      egetKapital: [5300000000, 6006000000, 5742000000, 6332000000, 6656000000],
      fcf: [1490000000, 4935000000, -1018000000, 1535000000, 1683000000],
    },
    notering:
      "cellmotiverad trio (Frankrike/industri 6→7 av 8): Thales försvarselektronik + Dassault STRIDSFLYGET (Rafale) + Alstom tågen — tre offentlig-kund-arketyper; NETTKASSAN 9,914 mdr EUR = 127,60 EUR/aktie = 45 % av kursen som signaturtal (Rafale-avanceringsforfinskottningen: kunderna betalar kontraktet i förskott — working capital-maskinen i sin renaste form; EV 11,97 mot mcap 21,88: kassan halverar företagsvärdet, EV/EBIT 10,18 mot P/E 21,97 — basisvalets pedagogik); ORDERBOKEN 46,596 mdr = 6,14× årsomsättningen (cellens högsta täckning); NETTO-M 11,29 > EBIT-M 8,67 — räntenetto på kassan är den andra fabriken; FY23:s NEGATIVA OCF −673 M mot FY22:s +5,110 (FCF-M 69,8 %) dokumenterar avanceringsflödets timing — intjänt ≠ inkasserat samma år; float 21,5 % (familjeholding-blocket), rev/anställd 610k = cellens högsta produktivitet (14,6 tusen anställda mot Thales 85/Alstom 88 tusen); moat-spread 6,67 pp (Falcon-jetens mot Rafale-ordernas blandning); kollisionskontroll GRÖN (AM/AM.PA+namn); EPA/EUR; kalenderårsbokslut; RAPPDAG 2026-10-16; alla repliker i paranoid (StockAnalysis EPA 2026-10-01)",
  },
  {
    ticker: "ALO.PA",
    namn: "Alstom S.A.",
    bransch: "industri",
    land: "Frankrike",
    valuta: "EUR",
    kallor: [
      {
        namn: "StockAnalysis",
        hamtat: "2026-10-01",
        url: KALLA + "ALO/" + YTOR,
        paranoid:
          "EPA-PRIMÄRNOTING i EUR (S&P GMI-underlag; SA-html ordagrant via curl, kanon _s2u3o34-kanon.mjs): BOKFÖRINGSÅRET april–mars (BHP-precedensen: universumets andra brutet räkenskapsår — årsetikett = slutår, FY2026 = apr 2025–mar 2026; SA-kolumner Mar '22→Mar '26 + Current), kurs 15,32 EUR (översiktens huvudtal; dagens spannr 14,62–15,44; källans Price Target-fält 21,10 (+37,73 %) är ANALYSKURS ej handelskurs), källans mcap-bas = föregående close 14,96: mcap 6,92 mdr = 14,96×462,62 M EXAKT (0,07 % band mot replik; dagskursen 15,32 i pris-fältet — källans beräkningsbasis dokumenterad), EPS FY26 0,60, P/E 24,93 = 14,96/0,60 EXAKT (källans bas), fwd P/E 8,87 ⇒ prognosTillväxt +181,1 % implicit — VÄNDNINGSÅRET (Sartorius-klassen: trailing-talet bukar på årets låga EPS, marknaden prissätter ~1,73 EUR nästa år), PEG 0,14 = 24,93/181,1 mallens konvention (källans PEG-fält 0,39 på deras 3-års EPS-prognos +24,10 % — redovisad), P/B 0,64 = 6,92/10,784 EXAKT (Shareholders' Equity med minoritet; Total Common 10,663 ger 0,649 — spannet dokumenterat) = SUBSTANSRABATT 36 %, EV 8,30 mdr = mcap 6,92 + skuld 3,555 − kassa 2,297 + minoritet 0,121 = 8,299 EV-IDENTITETEN EXAKT, EV/EBIT 9,78 · EV/EBITDA 5,46 · EV/Sales 0,43 · EV/FCF 25,61 · EV/Earnings 29,63, D/E 0,33 = 3,555/10,663 EXAKT · räntetäckning 7,73 · Debt/EBITDA 2,66, netto-skuld −1,258 mdr (FY24 −3,679 — HALVERAD på två år: emissionen + FCF-vändningen), ROE 3,41 % · ROIC 3,57 mot WACC 7,19 = −3,62 pp (NEGATIVT värdeskapningsgap — integrationens arv, dokumenterat ärligt; ROCE 4,53), marginaler FY26: brutto 12,27 % = 2,352/19,171 EXAKT · EBIT 3,47 % = 0,665/19,171 EXAKT · netto 1,46 % = 0,280/19,171 EXAKT på attributable-basen (källans st-yta bär 1,69 % på konsolierat 324 M — basdualiteten dokumenterad, raden bär fi/attributable-konventionen) · FCF 1,69 % = 0,324/19,171 EXAKT, FCF-IDENTITETEN OCF 891 − capex 567 = 324 EXAKT, fcfYield 4,68 % = 0,324/6,92 EXAKT, TTM-KOLUMNEN = FY2026 IDENTISK (fi Current 19,171 = FY26 19,171 — året slutet mar 2026; källans Current-etikett 'Oct 1, 2026' är sidans etikett, värdena är FY26), resultatserien −581→−132→−309→+138→+280 M€ FY22→FY26 (Bombardier Transportation-integrationens förlustår → vändning; FY24-dippen = avskrivningar/böter-klassen) — RESULTAT-CAGR NULL (negativ start FY22, BASF-klassen), omsättningen 15,471→19,171 rakt växande (CAGR +5,50 %/år), FCF-serien −1,005→+175→−567→+490→+324 (3 av 5 positiva), ORDERBOKEN källans backlog-fält: 81,013→87,387→91,900→94,960→104,412 M€ FY22→26 = 5,45× FY26-omsättningen (TGV- och signalorderboken — cellens största backlog i absoluta tal), UTDELNINGEN ÅTERFÖDD: DPS 0,25 EUR deklarerad FY26 (källans fi DPS-rad, första på åratal) — betalt under året endast 44 M (betalningsslippet: deklarationstidpunkt mot utbetalning nästa räkenskapsår, dokumenterat; aterkop-fältet bär det BETALDA 44 M), aktiebas 373,39→462,03 M (+23,7 % FY22→FY26 — nyemissionerSenaste5ar = 1: rättighetsemissionen hösten 2023 + konvertibeln löpte in; utspädningen är balansräkningens pris), insiders 0,00 % · institutioner 60,44 % · float 337,42 M, beta 1,06 (trions enda över 1), 52-v 14,48–30,23 med kursen −30,79 % på 52v NÄRA BOTTEN under MA50 15,92 och MA200 20,14, RSI 47,82, analytiker Hold med PT 21,10, 87,832 anställda (rev/anställd 218,269 källans fält — replik 19,171 mdr/87,832 = 218,4k EXAKT), skatt 199,0 M / eff. 35,35 %, TBV-dualiteten källans egna fält: TBV-total +386 M mot TBVPS −0,79 (källans interna basblandning — redovisad som not, raden bär inget av dem; goodwill-tung Bombardier-balans som läkt från −3,077 M FY22), geografi FY26: Europa ex Frankrike 8,101 + Americas 3,226 + Asien/Stillahav 2,551 + Afrika/ME/CA 1,784 = 15,662 (Frankrike-benet resten ≈ 3,509), nästa rapport 2026-11-17 (källans Earnings Date)",
      },
    ],
    hamtat: "2026-10-01",
    pris: 15.32,
    marknadsKapitalMdr: 6.92,
    tillvaxt: {
      omsattningCAGR5ar: 0.055,
      resultatCAGR5ar: null,
      omsattningTillvaxtTTM: 0.0369,
      prognosTillvaxt: 1.8106,
    },
    lonksamhet: {
      roe: 0.0341,
      roic: 0.0357,
      bruttoMarginal: 0.1227,
      ebitMarginal: 0.0347,
      nettoMarginal: 0.0146,
      fcfMarginal: 0.0169,
    },
    stabilitet: {
      skuldEgenkapital: 0.33,
      rantaTackning: 7.73,
      fcfPositivaSenaste5: 3,
      kassaManaderBurnRate: null,
      nyemissionerSenaste5ar: 1,
    },
    aterkop: {
      senasteArMdr: 0.044,
      andelUtestande: 0,
      insiderkopSenaste6man: null,
    },
    moat: {
      bruttoMarginalMedel5ar: 0.1207,
      bruttoMarginalSpread5ar: 0.0141,
      roeMedel5ar: null,
    },
    vardering: {
      pe: 24.93,
      pb: 0.64,
      evEbit: 9.78,
      peg: 0.14,
      fcfYield: 0.0468,
      egenKapitalMultipl: 0.64,
    },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: {
      ar: ["2022", "2023", "2024", "2025", "2026"],
      omsattning: [15471000000, 16507000000, 17619000000, 18489000000, 19171000000],
      resultat: [-581000000, -132000000, -309000000, 138000000, 280000000],
      egetKapital: [8911000000, 8997000000, 8672000000, 10464000000, 10663000000],
      fcf: [-1005000000, 175000000, -567000000, 490000000, 324000000],
    },
    notering:
      "cellmotiverad trio (Frankrike/industri 7→8): Thales elektronik + Dassault stridsflyg + Alstom TÅGEN — järnvägens vändningsexempel; VÄNDNINGSÅRET som signatur: P/E 24,93 mot fwd 8,87 (prognos +181 %) med resultatserien −581→+280 M€ (negativ start ⇒ resCAGR NULL, BASF-klassen) — trailing-multipeln straffar bottenåret, forward-talet prissätter normaliseringen (Sartorius-precedensen); ORDERBOKEN 104,412 mdr = 5,45× årsomsättningen (cellens STÖRSTA i absoluta tal — järnvägens backlog-natur); P/B 0,64 = substansrabatt 36 % mot ROIC-gap −3,62 pp (negativt — integrationens arv dokumenterat ärligt); netto-skuld halverad −3,679→−1,258 på två år; aktiebasen +23,7 % (nyemission 2023 + konvertibel — utspädningen dokumenterad, nyemissionerSenaste5ar=1); UTDELNINGEN ÅTERFÖDD 0,25 EUR (deklarerad FY26, 44 M betalt under året — betalningsslip dokumenterat); BOKFÖRINGSÅRET april–mars med årsetikett = slutår (BHP-precedenten, universumets andra brutna året); TBV-dualitet i källans egna fält redovisad; kollisionskontroll GRÖN (ALO/ALO.PA+namn); EPA/EUR; RAPPDAG 2026-11-17; alla repliker i paranoid (StockAnalysis EPA 2026-10-01)",
  },
];

// ── Aritmetikgrinden — EVERY check must pass BEFORE append (OMG32/33-mönstret) ──
const kanon = {
  "HO.PA": JSON.parse(readFileSync("/tmp/thales-kanon.json", "utf8")),
  "AM.PA": JSON.parse(readFileSync("/tmp/dassault-kanon.json", "utf8")),
  "ALO.PA": JSON.parse(readFileSync("/tmp/alstom-kanon.json", "utf8")),
};
const num = (s) => parseFloat(String(s).replace(/[^0-9.\-]/g, ""));
// st-ytorna bär suffix (5.58B / 200.65M) — normalisera till MILJONER; bs/cf-tabeller är redan i M
const numM = (s) => { const t = String(s).trim(); const v = parseFloat(t.replace(/[^0-9.\-]/g, "")); if (/B\s*$/.test(t)) return v * 1e3; if (/M\s*$/.test(t)) return v; return v; };
// källans beräkningskursbas: ALO bär prev close 14,96 (dokumenterad i paranoid); övriga dagskursen
const KURSBAS = { "ALO.PA": 14.96 };
let PASS = 0, FEL = 0;
const kolla = (ticker, etikett, faktisk, expect, tolerans) => {
  const av = Math.abs(faktisk - expect) / Math.abs(expect);
  const ok = av <= tolerans;
  if (ok) PASS++; else { FEL++; console.log(`FEL ${ticker} ${etikett}: ${faktisk} mot ${expect} (avvikelse ${(av * 100).toFixed(2)} % > ${(tolerans * 100).toFixed(1)} %)`); }
  return ok;
};

for (const r of RADER) {
  const t = r.ticker;
  const kursbas = KURSBAS[t] ?? r.pris;
  // 1. mcap-replik: kursbas × aktiebas (källans Shares Out ur kanon-st)
  const bas = numM(kanon[t].st["Shares Outstanding"]) * 1e6;
  kolla(t, "mcap-replik (kursbas×bas)", (kursbas * bas) / 1e9, r.marknadsKapitalMdr, 0.012);
  // 2. P/E-replik
  const eps = num(kanon[t].fi["Earnings Per Share EPS Growth"].split(" | ")[0]);
  kolla(t, "P/E-replik (kursbas/EPS)", kursbas / eps, r.vardering.pe, 0.012);
  // 3. EV-identiteten (mcap + skuld − kassa; numM tar B-suffixen)
  const skuld = numM(kanon[t].st["Total Debt"]) / 1e3;
  const kassa = numM(kanon[t].st["Cash & Cash Equivalents"]) / 1e3;
  const evKalla = numM(kanon[t].st["Enterprise Value"]) / 1e3;
  const minoritet = num(kanon[t].bs["Minority Interest"].split(" | ")[0]) / 1e3;
  kolla(t, "EV-identitet", r.marknadsKapitalMdr + skuld - kassa + minoritet, evKalla, 0.012);
  // 4. P/B-replik (mcap/EK ur bs Shareholders' Equity)
  const ek = num(kanon[t].bs["Shareholders' Equity"].split(" | ")[0]) / 1e3;
  kolla(t, "P/B-replik (mcap/EK)", r.marknadsKapitalMdr / ek, r.vardering.pb, 0.012);
  // 5. D/E-replik (skuld/EK-total ur bs; källans fält avrundat — småvärdesklassen 5 %)
  const ekTot = num(kanon[t].bs["Total Common Equity"].split(" | ")[0]) / 1e3;
  kolla(t, "D/E-replik (skuld/EK)", skuld / ekTot, r.stabilitet.skuldEgenkapital, 0.05);
  // 6. FCF-identiteten TTM (OCF − capex = FCF)
  const ocf = num(kanon[t].cf["Operating Cash Flow"].split(" | ")[0]);
  const capex = Math.abs(num(kanon[t].cf["Capital Expenditures"].split(" | ")[0]));
  const fcfKalla = num(kanon[t].cf["Free Cash Flow"].split(" | ")[0]);
  kolla(t, "FCF-identitet (OCF−capex)", ocf - capex, fcfKalla, 0.005);
  // 7. fcfYield-replik
  kolla(t, "fcfYield (FCF/mcap)", (fcfKalla / 1e3) / r.marknadsKapitalMdr, r.vardering.fcfYield, 0.005);
  // 8. fcfMarginal-replik (FCF/oms)
  const oms = num(kanon[t].fi["Revenue Revenue Growth"].split(" | ")[0]);
  kolla(t, "fcfMarginal (FCF/oms)", fcfKalla / oms, r.lonksamhet.fcfMarginal, 0.005);
  // 9. bruttoMarginal-replik
  const gp = num(kanon[t].fi["Gross Profit Gross Profit Growth"].split(" | ")[0]);
  kolla(t, "bruttoMarginal (GP/oms)", gp / oms, r.lonksamhet.bruttoMarginal, 0.005);
  // 10. ebitMarginal-replik
  const ebit = num(kanon[t].fi["Operating Income Operating Income Growth"].split(" | ")[0]);
  kolla(t, "ebitMarginal (EBIT/oms)", ebit / oms, r.lonksamhet.ebitMarginal, 0.005);
  // 11. nettoMarginal-replik (attributable = fi-basen)
  const ni = num(kanon[t].fi["Net Income Net Income Growth"].split(" | ")[0]);
  kolla(t, "nettoMarginal (NI/oms)", ni / oms, r.lonksamhet.nettoMarginal, 0.005);
  // 12. omsattningCAGR: (sistaFY/startFY)^(1/4)−1 — serie-ENDES
  const o = r.serier.omsattning;
  const cagr = Math.pow(o[o.length - 1] / o[0], 1 / (o.length - 1)) - 1;
  kolla(t, "omsCAGR-serien", cagr, r.tillvaxt.omsattningCAGR5ar, 0.002);
  // 13. prognosTillväxt: pe/fwdPe − 1
  const fwd = num(kanon[t].fi["Forward PE"].split(" | ")[0]);
  kolla(t, "prognosTillväxt (pe/fwd−1)", r.vardering.pe / fwd - 1, r.tillvaxt.prognosTillvaxt, 0.002);
  // 14. peg: pe/prognosPct
  kolla(t, "peg (pe/prognosPct)", r.vardering.pe / (r.tillvaxt.prognosTillvaxt * 100), r.vardering.peg, 0.02);
  // 15. resultatCAGR (om satt): serie-endes
  const res = r.serier.resultat;
  if (r.tillvaxt.resultatCAGR5ar !== null) {
    kolla(t, "resCAGR-serien", Math.pow(res[res.length - 1] / res[0], 1 / (res.length - 1)) - 1, r.tillvaxt.resultatCAGR5ar, 0.002);
  } else if (res[0] < 0) { PASS++; } else { FEL++; console.log(`FEL ${t}: resCAGR NULL utan negativ start`); }
  // 16. fcfPositivaSenaste5: räkna ur serien
  const fpos = r.serier.fcf.filter((x) => x > 0).length;
  if (fpos === r.stabilitet.fcfPositivaSenaste5) PASS++; else { FEL++; console.log(`FEL ${t}: fcfPositiva ${r.stabilitet.fcfPositivaSenaste5} mot seriens ${fpos}`); }
  // 17. moat-medel och -spread ur fi-bruttomarginalrader (FY-kolumner = kol 1..5)
  const bm = kanon[t].fi["Gross Margin"].split(" | ").slice(1).map(num); // FY25..FY21 eller FY26..FY22
  const medel = bm.reduce((a, b) => a + b, 0) / bm.length / 100;
  const spread = (Math.max(...bm) - Math.min(...bm)) / 100;
  kolla(t, "moat-medel", medel, r.moat.bruttoMarginalMedel5ar, 0.002);
  kolla(t, "moat-spread", spread, r.moat.bruttoMarginalSpread5ar, 0.002);
  // 18. utdelning: senasteArMdr = källans betalda TTM
  const divBetald = Math.abs(num(kanon[t].cf["Common Dividends Paid"].split(" | ")[0])) / 1e3;
  kolla(t, "utdelning-betald", divBetald, r.aterkop.senasteArMdr, 0.005);
  // 19. aktiebas-utveckling: nyemission-flagga stämmer med basrörelsen
  const baser = kanon[t].bs["Total Common Shares Outstanding"].split(" | ").map(num);
  const basvaxt = baser[0] / baser[baser.length - 1] - 1;
  if ((basvaxt > 0.05) === (r.stabilitet.nyemissionerSenaste5ar >= 1)) PASS++; else { FEL++; console.log(`FEL ${t}: basväxt ${(basvaxt * 100).toFixed(1)} % mot nyemissionflagga ${r.stabilitet.nyemissionerSenaste5ar}`); }
  // 20. serier-längd konsekvent
  if (r.serier.ar.length === r.serier.omsattning.length && r.serier.omsattning.length === r.serier.resultat.length && r.serier.resultat.length === r.serier.fcf.length) PASS++; else { FEL++; console.log(`FEL ${t}: serielängder inkonsistenta`); }
}

console.log(`\nARITMETIKGRIND: ${PASS} PASS · ${FEL} FEL`);
if (FEL > 0) { console.log("ABORT — inget skrivs till bolagsunivers.json"); process.exit(1); }
console.log("GRÖN — rader klara för append (kör _s2u3o34-append.mjs)");
