// _s2u1o30-inpex-rad.mjs — AUTO-S2 omgång 30 u1: INPEX-radens enda källa
// (manifest auto-s2-1790237704889). Importeras av grind + append — raden
// definieras EN gång. Moat i FRACTION 0–1 (omg29-u1:s konventionsfynd).
export const RAAD = {
  ticker: "1605.T",
  namn: "INPEX Corporation",
  bransch: "energi",
  land: "Japan",
  valuta: "JPY",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-24",
      url: "https://stockanalysis.com/quote/tyo/1605/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + kvartalsvyerna ?p=quarterly)",
      paranoid:
        "TYO-primärnoting i JPY (S&P GMI-underlag, sa-close 2026-09-24 15:30 JST, Last checked 2026-09-24; finansvyerna Last updated 2026-08-10 — TTM-kolumnen = källans kvartalsserie till Jun 30 2026): kurs 3 834 ¥ (Yahoo chart-API meta regularMarketPrice 3 834,0 = 0,00 % band EXAKT; chartPreviousClose 3 913 = SA previousClose; day range 3 834–3 919; 52-v 2 585–4 955), mcap 4,55 T ¥ är källans PREV-CLOSE-bas (3 913 × 1 162,28 M = 4 547,7) medan publikationen bär den kurskoherenta kedjan 3 834 × 1 162,28 M = 4 456 mdr (Komatsu/Takeda-precedensens prisvintagespridning ~2 %); aktieantal 1 162,28 M = common-EK/BVPS (5 102 570/4 390,36; källans 1,16 B avrundat; EPS-vägen 433 456/369,20 = 1 174,1 M TTM-viktad = 1,0 % spread), P/E-fält 10,60 = 3 913/369,20 (källans prev-close-bas) mot publikationens 10,39 = 3 834/369,20 EXAKT; fwd P/E 8,92 ⇒ prognos-EPS 429,8 = +16,4 % mot TTM (källans prev-bas +18,8 %), P/B 0,87 = 3 834/4 390,36 EXAKT (BVPS TTM 4 390,36; common-EK 5 102 570 med minoritet 248 382 dokumenterad separat), EV/EBIT 5,57 = (4 456 + nettoskuld 1 102,133)/EBIT 998,113 med EV-konventionen nettoskuld-inräknad BEVISAD (skuld 1 318 323 − kassa 216 190 = 1 102 133 = källans nettoskuld-fält −1 102,13 T öre för öre), Debt/EBITDA 0,96 replikerbar EXAKT: 1 318 323/(998 113 + D&A 378 948) = 0,9574, D/E 0,25 = 1 318 323/5 350 952 total-EK = 0,2464; ROE 9,27 % och ROIC 6,32 % är KÄLLFÄLT (S&P GMI-bas; egna repliker netto/common-EK 8,50 % slutbas och 8,80 % medelbas — källspridningen dokumenterad, fältet bär källan; WACC 3,11 % källfält), räntetäckning 17,34 × källfält (implicit räntekostnad 998 113/17,34 = 57,6 M ¥ — JPY:s låga räntenivå i talet), marginalerna kvartals-exakta ur TTM-kolumnen (brutto 1 102 424/1 962 979 = 56,16 % · EBIT 998 113/1 962 979 = 50,85 % · netto 433 456/1 962 979 = 22,08 %), FCF TTM 420 793 (operativt CF 819 873 − capex 399 080), fcfYield 9,44 % mot kurskoherent mcap, payout 27,27 % källfält på prognosbas (112 ¥ × 1 162,28 M/433 456 = 30,0 % på TTM — basvalet dokumenterat); Altman 2,01 · Piotroski 5 · beta −0,14 (5Y) källfält; goodwill 48 851 = 0,58 % av tillgångarna 8 386 904 (Komatsu 6,9 %, Takeda 59,3 % — reservbalansräkningen äger nästan inget immateriellt); FY2021 = övergångsåret mars→december-bokslut (källans +86,81 % mot 2020) — CAGR-basårseffekten öppet redovisad; utdelningar 46 718→80 399→90 147→100 248→111 412 och återköp 69 999→121 191→99 999→130 000→90 411 (finansieringsvyerna); inga nyemissioner i källans finansieringsvy på fem år (0 dokumenterat, inte osatt).",
    },
  ],
  hamtat: "2026-09-24",
  pris: 3834,
  marknadsKapitalMdr: 4456,
  tillvaxt: {
    omsattningCAGR5ar: 0.1275,
    resultatCAGR5ar: 0.1528,
    omsattningTillvaxtTTM: -0.0757,
    prognosTillvaxt: 0.1641,
  },
  lonksamhet: {
    roe: 0.0927,
    roic: 0.0632,
    bruttoMarginal: 0.5616,
    ebitMarginal: 0.5085,
    nettoMarginal: 0.2208,
    fcfMarginal: 0.2144,
  },
  stabilitet: {
    skuldEgenkapital: 0.25,
    rantaTackning: 17.34,
    fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: 0,
  },
  aterkop: {
    senasteArMdr: 111.412,
    andelUtestande: null,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 0.5823,
    bruttoMarginalSpread5ar: 0.0653,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 10.39,
    pb: 0.87,
    evEbit: 5.57,
    peg: 0.63,
    fcfYield: 0.0944,
    egenKapitalMultipl: 0.87,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [1244369000000, 2324660000000, 2164516000000, 2265837000000, 2011351000000],
    resultat: [223048000000, 438276000000, 321708000000, 427344000000, 393836000000],
    egetKapital: [3346409000000, 4038360000000, 4499033000000, 5137832000000, 5022903000000],
    fcf: [304987000000, 564184000000, 535996000000, 353676000000, 399867000000],
  },
  notering:
    "Japan/energi 0→1 — JAPANS ÅTTONDE gren (konsument 5 · kommunikation 5 · finans 5 · material 1 · teknik 1 · halso 1 · industri 1 ⇒ +energi) och universumets första rad för ett IMPORT-lands energiproducent: energi-grenens övriga bärare (EQNR, Shell, BP, CNQ, PBR, Reliance, Vår Energi, Aker BP med flera) säljer olja och gas TILL världen — INPEX producerar åt ett land som importerar 85–90 % av sin energi (USD-intäkter mot JPY-kostnader: valutaspänningen bor i själva affären, inte i en rapportnot). SIGNATURTAL — IMPORTLANDETS RESERV: (1) UPSTREAM-RENHETEN: EBIT-marginal 50,85 % TTM och bruttomarginal 56,16 % utan raffinaderi- och detaljhandelsslampor — grenens median-EBIT ligger runt 17 %: INPEX bär nästan TRE gånger grenens lönsamhet per intäktskrona för att kedjan slutar vid brunnen; kom ihåg att marginalen är kemisk (priset på en fat-vätska) och inte en moat i LOréal-bemärkelsen — spreaden fem år 6,5 pp berättar om oljeprisets vågor, inte om prissättningsmakt. (2) HANDELN UNDER BOKFÖRT VÄRDE: P/B 0,87 medan BVPS-trappan gått 2 253→4 073 ¥ (+16,0 % per år fem raka år) — marknaden betalar 87 öre per bokförd yen i ett bolag som byggt eget kapital vartenda år; reservernas bokförda värde är en skattning (SE-språk: nedskrivningarna kommer när priset faller), och just där sitter läxan: balansräkningens golv är golvt HOS bedömaren av reserverna. (3) ALTMAANS PARADOX: Z-score 2,01 i gråzonen MEDAN D/E 0,25, Debt/EBITDA 0,96 och räntetäckning 17,34 × är gröna kort — Z-formeln straffar strukturen (jättelika tillgångar 8,4 T ¥ mot omsättning 2,0 T ¥) som är E&P-modellens normalanatomi, inte distressed-signatur; samma gråzons-fenomen som fastighetscellens rader — formeln känner igen fabriker, inte reservoarer. (4) BETA −0,14: femårige-betan är NEGATIV — oljepriset har rört sig mot aktiemarknadens rytm; portföljteorins gamla kuriosa lever (energibäraren som motvikt), men betan är en bakåtblickande vind, ingen egenskap. (5) KASSAFLÖDESHÄREN + ÅTERBÄRINGSTRAPPAN: FCF fem av fem positiva år (305,0→564,2→536,0→353,7→399,9 mdr ¥) medan utdelningarna klivit 46,7→111,4 mdr och återköpen legat 70–130 mdr varje år — FY2025 delar bolaget tillbaka 201,8 mdr (4,5 % shareholder yield) = hälften av årets FCF: E&P-kassan delas ut för att reservprojekt inte kan återinvesteras i samma takt som den mognar. (6) 3 720 ANSTÄLLDA: 527,7 M ¥ omsättning per anställd — värdet sitter i hålet i marken, inte på lönelistan (EQNR:s ~24 000 anställda för comparison: integrerad vs renodlad). (7) BASÅRETS FALLA: 2021 var bokslutsbytesåret (mars→december, +86,8 % mot 2020 enligt källan) vilket blåser upp 5-års-CAGR +12,7 % — trenden från första rena decemberåret är OMSÄTTNING −3,5 % per år (2 324,7→2 011,4) MEDAN netto håller runt 394 mdr: marginalerna bär när volymen sjunker, oljeprisets anatomi i tre rader. ROIC 6,32 % mot WACC 3,11 % = +3,21 pp — positiv men trång spread i Japan-familjen (Komatsu +0,74 · Takeda +1,12): kapitalet tjänar sin kostnad med marginalen, inte med makt. Kontrastpartnerna: EQNR (export-suveränens spegel i samma gren — statens ägarskap mot fria marknaden) · Shell/BP (integrerade kedjans lägre marginaler) · Komatsu och Takeda (Japans trånga spread-familj). FIFO: Q3 2026 (januari–september) rapporteras i november 2026 — december-bokslutets tredje kvartal; japanska marsbolag rapporterar i oktober-november, INPEX har lämnat den kalendern.",
};
