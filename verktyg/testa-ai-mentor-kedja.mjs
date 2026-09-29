/**
 * TESTA AI-MENTORN — HELA KEDJAN (våg 176, spår 6), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-kedja.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * De per-fil-testerna (testa-ai-mentor*.mjs) vakar var sin motor — men ingen
 * vakar SAMMANSPELLET: chat-widget.tsx komponerar tjugofyra motorer i en ??-kedja
 * där första icke-null vinner. Ett monster i en TIDIG motor kan tyst skugga
 * en senare motors fråga, och per-fil-testerna kan aldrig se det. Detta test
 * vakar kedjan:
 *
 *   G  driftvakt    — widgetens kompositionsordning läses ur källan och
 *                     måste överensstämma med testets kedja (testet kan
 *                     inte ljuga om ordningen)
 *   A  kanoniska    — en fråga per motor: alla TIDIGARE motorer → null,
 *                     förväntad motor → icke-null, kedja ≡ motorns svar
 *   B  skuggprober  — högriskfrågor där tidiga motorers kärnordsfamiljer
 *                     ligger nära (räntenetto vs ränta, substansvärde,
 *                     utspädning, indexfonder)
 *   C  genomström-  — omatchad fråga → null (API-flödet tar över);
 *                     juridikfråga → basens juridikmonster svarar
 *      ning
 *   D  determinism  — samma fråga två gånger ⇒ bitidentiskt svar
 *   E  källmärkning — ALLA monsters (132 i femtio motorer) bygga() ger
 *                     källrad i texten; varje kalla-slug och varje
 *                     fordjupa-/handlings-kurslänk pekar på en äkta slug
 *   F  kursläkthet  — varje monster har ≥2 handlings och ≥1 äkta
 *                     /kurser/-länk
 *   H  struktur     — inventarieråkning per motor + disjunkta id:n över
 *                     alla motorer (nytt monster ⇒ uppdatera inventarien
 *                     medvetet, inte tyst)
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Testfall C vaktar att juridikfrågor ("vilket bolag ska jag köpa?")
 * får ett pedagogiskt svar — aldrig en rekommendation.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// Node >= 22.18 kör .ts-importer direkt; 22.6–22.17 behöver flaggan.
const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-kedja.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// ── Motorerna i KEDJEORDNING (måste spegla chat-widget.tsx — fall G vaktar) ─
// 2026-09-16: tjugoett motorer / 74 monsters efter fabrikens s6-u1/u2/u3 +
// omgång 9–12 (ägande, redovisningsdjup, djup, historia, lonsamhetsdjup,
// tsdjup, skattedjup, beteendedjup, riskdjup + omgång 12:s tre lager:
// riskmåttsdjup — sharpe-kvoten, RISKHANTERING & PORTFÖLJTEORIs första;
// utdelningsdjup — utdelningsfällor + aktieåterköp, UTDELNINGSSTRATEGIs
// första; förväntningsdjup — förväntningsanalys/gap/kalibrering,
// KATALYSATORs första, sist i kedjan).
// 2026-09-17: tjugofyra motorer / 80 monsters efter omgång 13 (syskon u1:
// portfoljbalans — rebalansering, PORTFÖLJHANTERINGs djup; s6-u2:
// stabilitetsdjup — känslighetsanalys/stresstest + soliditetsgrad,
// STABILITETs första egna lager, sist i kedjan).
// Workloggen räknar
// frågeformuleringar — monsterantalet här är KODENS sanning (mätt med import).
const MOTORDEFS = [
  { namn: "makro",          fil: "ai-mentor-makro-fragor.ts",          fn: "svaraLokaltMakro",          arr: "MAKRO_MONSTER",          antal: 2 },
  { namn: "extra",          fil: "ai-mentor-extra-fragor.ts",          fn: "svaraLokaltExtra",          arr: "EXTRA_MONSTER",          antal: 3 },
  // 2026-09-20 (manifest auto-s6-1789912510460): modernarisk (s6-u3 — tre
  // moderna risktyper: regulatorisk risk (regelverk/tillsyn/kapitalkrav,
  // bankexemplet 100 Mkr utlåning vid 4 % → 4 Mkr; 6 %-krav ⇒ 66,7 Mkr =
  // −33 %), GDPR/datarisk (sanktionstaket 4 % av omsättningen: 1 000 Mkr →
  // 40 Mkr mot 80 Mkr vinst) + ESG-risk (övergångsrisken 100 ton × 1 000 kr
  // = 100 tkr; priset 2 000 kr ⇒ 200 tkr). Aktiverar rk-06/rk-13/rk-14 —
  // mentorväglösa enligt sond _s6u3-sond-lagerluckor.mjs — + pf-13 och
  // v18-regulatoriska som källor. KEDJEPLATS FÖRE basen: basen äger naket
  // «risk» som kärnord, och frågor som «vad är regulatorisk risk?» bär ju
  // ordet risk — ett senare lager hade aldrig nåtts. Kärnorden mekaniskt
  // disjunkta (sond _s6u3-sond-disjunktion.mjs: 0 kollisioner); nakna
  // «regulatorisk»/«regulatoriska» bärs EJ som kärnord — basens
  // katalysator-familj («vad är regulatoriska katalysatorer?») förblir
  // basens. Anspråk data/vakten/auto-s6-1789912510460-u3-ansprak.md FÖRE
  // byggstart.
  { namn: "modernarisk", fil: "ai-mentor-modernarisk-fragor.ts", fn: "svaraLokaltModernaRisker", arr: "MODERNA_RISK_MONSTER", antal: 3 },
  { namn: "bas",            fil: "ai-mentor-svar.ts",                  fn: "svaraLokalt",               arr: "MONSTER",                antal: 25 },
  { namn: "nästa",          fil: "ai-mentor-nasta-fragor.ts",          fn: "svaraLokaltNasta",          arr: "NASTA_MONSTER",          antal: 3 },
  { namn: "kapitalmekanik", fil: "ai-mentor-kapitalmekanik-fragor.ts", fn: "svaraLokaltKapitalmekanik", arr: "KAPITALMEKANIK_MONSTER", antal: 2 },
  { namn: "sektor",         fil: "ai-mentor-sektor-fragor.ts",         fn: "svaraLokaltSektor",         arr: "SEKTOR_MONSTER",         antal: 3 },
  { namn: "case",           fil: "ai-mentor-case-fragor.ts",           fn: "svaraLokaltCase",           arr: "CASE_MONSTER",           antal: 1 },
  // 2026-09-19 våg 189 (arbetsstationen): marknadsmekanik — ordervärlden,
  // likviditet, index-konstruktion (orderbok/matchning/ordertyper/spread/
  // likviditet/handelsvolym/värdeviktning/likviktat/omxs30/courtage).
  // Tie-brytning enligt makro-precedensen: EFTER case, FÖRE praktik —
  // praktik behåller index/indexfond-familjen, detta lager bär bara
  // KONSTRUKTIONS-frågorna (kärnorden mekaniskt disjunkta, testfall K i
  // testa-ai-mentor-marknadsmekanik.mjs).
  { namn: "marknadsmekanik", fil: "ai-mentor-marknadsmekanik-fragor.ts", fn: "svaraLokaltMarknadsmekanik", arr: "MARKNADSMEKANIK_MONSTER", antal: 10 },
  { namn: "praktik",        fil: "ai-mentor-praktik-fragor.ts",        fn: "svaraLokaltPraktik",        arr: "PRAKTIK_MONSTER",        antal: 3 },
  // 2026-09-19 våg 210 (studion): valutamekanik — valutans MEKANIK
  // (ppp/ränteparitet/realväxelkurs/kronstyrka/devalvering/hedging/
  // exportörens vind/reservvaluta/valutamarknaden/valutalån). Tie-brytning
  // enligt våg 189-doktrinen: EFTER praktik, FÖRE portfoljgrund —
  // portfoljgrund behåller valuta-GRUNDERNA (kanoniska "vad är valutarisk?"),
  // detta lager bär MEKANIK-frågorna (kärnorden mekaniskt disjunkta,
  // testfall K i testa-ai-mentor-valutamekanik.mjs).
  { namn: "valutamekanik", fil: "ai-mentor-valutamekanik-fragor.ts", fn: "svaraLokaltValutamekanik", arr: "VALUTAMEKANIK_MONSTER", antal: 10 },
  { namn: "portföljgrund",  fil: "ai-mentor-portfoljgrund-fragor.ts",  fn: "svaraLokaltPortfoljgrund",  arr: "PORTFOLJGRUND_MONSTER",  antal: 2 },
  { namn: "ägande",         fil: "ai-mentor-agande-fragor.ts",         fn: "svaraLokaltAgande",         arr: "AGANDE_MONSTER",         antal: 2 },
  { namn: "redovisningsdjup", fil: "ai-mentor-redovisningsdjup-fragor.ts", fn: "svaraLokaltRedovisningsdjup", arr: "REDOVISNINGSDJUP_MONSTER", antal: 2 },
  { namn: "djup",           fil: "ai-mentor-djup-fragor.ts",           fn: "svaraLokaltDjup",           arr: "DJUP_MONSTER",           antal: 3 },
  { namn: "historia",       fil: "ai-mentor-historia-fragor.ts",       fn: "svaraLokaltHistoria",       arr: "HISTORIA_MONSTER",       antal: 3 },
  { namn: "lonsamhetsdjup", fil: "ai-mentor-lonsamhetsdjup-fragor.ts", fn: "svaraLokaltLonsamhetsdjup", arr: "LONSAMHETSDJUP_MONSTER", antal: 2 },
  { namn: "tsdjup",          fil: "ai-mentor-tsdjup-fragor.ts",          fn: "svaraLokaltTsdjup",          arr: "TSDJUP_MONSTER",          antal: 4 },
  { namn: "skattedjup",      fil: "ai-mentor-skattedjup-fragor.ts",      fn: "svaraLokaltSkattedjup",      arr: "SKATTEDJUP_MONSTER",      antal: 3 },
  { namn: "beteendedjup",    fil: "ai-mentor-beteendedjup-fragor.ts",    fn: "svaraLokaltBeteendedjup",    arr: "BETEENDEDJUP_MONSTER",    antal: 3 },
  { namn: "riskdjup",        fil: "ai-mentor-riskdjup-fragor.ts",        fn: "svaraLokaltRiskdjup",        arr: "RISKDJUP_MONSTER",        antal: 2 },
  { namn: "riskmåttsdjup",   fil: "ai-mentor-riskmattsdjup-fragor.ts",   fn: "svaraLokaltRiskmattsdjup",   arr: "RISKMATTSDJUP_MONSTER",   antal: 1 },
  { namn: "utdelningsdjup",  fil: "ai-mentor-utdelningsdjup-fragor.ts",  fn: "svaraLokaltUtdelningsdjup",  arr: "UTDELNINGSDJUP_MONSTER",  antal: 2 },
  { namn: "förväntningsdjup", fil: "ai-mentor-forvantningsdjup-fragor.ts", fn: "svaraLokaltForvantningsdjup", arr: "FÖRVÄNTNINGSDJUP_MONSTER", antal: 3 },
  // Omgång 13: syskon u1:s portfoljbalans (rebalansering — på disk i samma
  // fönster, disk-läge-presedensen) + detta spårs stabilitetsdjup
  // (känslighetsanalys/stresstest + soliditetsgrad — STABILITETs första).
  { namn: "portfoljbalans", fil: "ai-mentor-portfoljbalans-fragor.ts", fn: "svaraLokaltPortfoljbalans", arr: "PORTFOLJBALANS_MONSTER", antal: 1 },
  { namn: "stabilitetsdjup", fil: "ai-mentor-stabilitetsdjup-fragor.ts", fn: "svaraLokaltStabilitetsdjup", arr: "STABILITETSDJUP_MONSTER", antal: 2 },
  // Omgång 13: detta spårs grahamgolv — Grahams värdegolv (net-net/NCAV +
  // cigar butts + Mr Market), sist i kedjan; bär widgetknappen "vad är en
  // net-net och NCAV?" som före leveransen gick till API-flödet.
  { namn: "grahamgolv", fil: "ai-mentor-grahamgolv-fragor.ts", fn: "svaraLokaltGrahamgolv", arr: "GRAHAMGOLV_MONSTER", antal: 3 },
  // 2026-09-17 omgång 14: varderjustering (syskon u2 — normalisering/CAPE +
  // WACC) + optionsdjup (s6-u1 — köpoption med säljoptionsspegeln; aktiverar
  // od-01/od-02 som ingen mentorväg nådde) + risklasningsdjup (syskon u3 —
  // kundkoncentration/riskmatris/riskavsnitt, RISKläsningskursernas första).
  { namn: "varderjustering", fil: "ai-mentor-varderjustering-fragor.ts", fn: "svaraLokaltVarderjustering", arr: "VARDERJUSTERING_MONSTER", antal: 2 },
  { namn: "optionsdjup", fil: "ai-mentor-optionsdjup-fragor.ts", fn: "svaraLokaltOptionsdjup", arr: "OPTIONS_DJUP_MONSTER", antal: 1 },
  { namn: "risklasningsdjup", fil: "ai-mentor-risklasningsdjup-fragor.ts", fn: "svaraLokaltRisklasningsdjup", arr: "RISKLÄSNINGSDJUP_MONSTER", antal: 3 },
  // 2026-09-17 omgång 15: avkastningskurva (s6-u1 — den omvända
  // avkastningskurvan/inverterad yield curve; aktiverar mk-08/mk-06/mk-01
  // som ingen mentorväg nådde; makro äger ränteorden, detta lager bär
  // kurvsammansättningarna — nakna inverter-ord bara starkord,
  // invester-stammens tavstånd 1–2) + avkastningsdjup (syskon u2 —
  // avkastningens tre källor + tvärsnittet mellan bolag, vr-familjens två
  // mentorväglösa kurser) + värderingsverktyg (syskon u3 — scenarioanalys
  // + DDM/Gordon + PEG ratio). Kärnorden mekaniskt disjunkta i alla
  // riktningar (sonderna _s6u{1,2,3}-sond-omg15.mjs + direkta motorprover).
  { namn: "avkastningskurva", fil: "ai-mentor-avkastningskurva-fragor.ts", fn: "svaraLokaltAvkastningskurva", arr: "AVKASTNINGSKURVA_MONSTER", antal: 1 },
  { namn: "avkastningsdjup", fil: "ai-mentor-avrakningsdjup-fragor.ts", fn: "svaraLokaltAvkastningsdjup", arr: "AVKASTNINGSDJUP_MONSTER", antal: 2 },
  { namn: "värderingsverktyg", fil: "ai-mentor-varderingsverktyg-fragor.ts", fn: "svaraLokaltVarderingsverktyg", arr: "VARDERINGSVERKTYG_MONSTER", antal: 3 },
  // 2026-09-18 omgång 16: warrant (s6-u1 — warranter/teckningsoptioner/
  // emissionsrätter, od-03 primär; aktiverar od-03 + ks-04 som ingen
  // mentorväg nådde; nästa äger nakna option-orden, kapitalmekaniken
  // emissionsfamiljen — detta lager bär endast warrant-sammansättningarna)
  // + tidsaxel (syskon u2, samma fönster — konjunkturindikatorerna +
  // refinansieringsmuren, kedjans NÄR-frågor; aktiverar ma-04 + st-05,
  // spår 5:s omgång-13-kurser; riskdjupet äger refinansieringsorden,
  // sektorn konjunkturCYKEL-orden — deras lager bär indikator-/klung-/
  // mur-orden). Kärnorden mekaniskt disjunkta (sonderna
  // _s6u{1,2}-sond-omg16.mjs + detta tests H-fall).
  { namn: "warrant", fil: "ai-mentor-warrant-fragor.ts", fn: "svaraLokaltWarrant", arr: "WARRANT_MONSTER", antal: 1 },
  { namn: "tidsaxel", fil: "ai-mentor-tidsaxel-fragor.ts", fn: "svaraLokaltTidsaxel", arr: "TIDSAXEL_MONSTER", antal: 2 },
  // + kapitalbindning (syskon u3, samma fönster — rörelsekapital +
  // kassakonverteringscykeln + lageromsättning, lönsamhetens andra halva;
  // aktiverar ln-04/bk-01/bk-03/km-003).
  { namn: "kapitalbindning", fil: "ai-mentor-kapitalbindning-fragor.ts", fn: "svaraLokaltKapitalbindning", arr: "KAPITALBINDNING_MONSTER", antal: 3 },
  // 2026-09-18 omgång 17: ekosystemdjup (s6-u2 — SAM-viktningen/röstlängd-
  // ningen + backtestens hantverk med Monte Carlo-systern; aktiverar
  // ek-01..ek-05 — HELA EKOSYSTEM-kategorien var mentorväglös enligt
  // sondens genomräkning av 207/414 nådda kurser; basen äger kvar
  // helhetsorden konfluens/vågfundamentet/ak1ts, detta lager bär
  // röstlängdnings- och provbänks-orden).
  { namn: "ekosystemdjup", fil: "ai-mentor-ekosystemdjup-fragor.ts", fn: "svaraLokaltEkosystemdjup", arr: "EKOSYSTEMDJUP_MONSTER", antal: 2 },
  // 2026-09-18 omgång 17: handelsdag (s6-u1 — marknadsstrukturen, auktionerna
  // och kortläget; aktiverar am-03..am-06 — KATEGORIN AKTIEMARKNADEN I
  // PRAKTIKEN fullt länkad 4/8 → 8/8 + flash-boys som femte källa; basen äger
  // kvar orderbok/likviditet/spread/nätmäklare, praktik blankningsstrategin
  // och kortpositions-orden, redovisningsdjupet leasing — clearing kasserat
  // som kärnord, nämns endast i text; sond _s6u1-sond-omg17.mjs: hela
  // familjen NULL, kärnorden renta mot 1 032 syskonord).
  { namn: "handelsdag", fil: "ai-mentor-handelsdag-fragor.ts", fn: "svaraLokaltHandelsdag", arr: "HANDELSDAG_MONSTER", antal: 1 },
  // 2026-09-18 omgång 17 (tredje i fönstret — tre-agenter-precedensen):
  // portföljpraktik (s6-u3 — positionsstorlek + tax-loss harvesting +
  // pensionssparande, PORTFÖLJHANTERING:s praktiska beslutsfrågor;
  // aktiverar pf-02/pf-09/pf-14 + källorna pf-11/rk-01/pf-03/km-051/
  // km-052/pf-08/pf-06/km-055/ma-03; basen äger formuleringen "position
  // sizing" och skatt-/ISK-grubben (V19: pf-02 här KÄLLA), skattedjupet
  // kapitalförsäkringsfamiljen, portföljbalans rebalansering, portföljgrund
  // diversifiering/valutarisk, makro inflationsorden; sond
  // _s6u3-sond-omg17.mjs: familjerna NULL genom kedjan, 0 grannar).
  { namn: "portföljpraktik", fil: "ai-mentor-portfoljpraktik-fragor.ts", fn: "svaraLokaltPortfoljpraktik", arr: "PORTFOLJPRAKTIK_MONSTER", antal: 3 },
  // 2026-09-18 omgång 18: utdelningskalender (s6-u1 — utdelningens tidslinje:
  // stämma → avstämningsdag/record date → ex-dag med kursjustering →
  // utbetalningsdag + svensk turnus + DRIP-räntesnurran + Dogs of the Dow
  // med utdelningsfällan som motläxa; aktiverar ud-03/ud-05/ud-06/ud-07/
  // km-065 — KATEGORIN UTDELNINGSSTRATEGI fullt länkad 3/8 → 8/8; basen
  // äger kvar utdelningsaktie(r)/direktavkastning/återinvestering/
  // dividend-aristocrats-frågan («betaldag» kasserat som kärnord — granne
  // till basens «betala», tavstånd 2; utdelningsdjupet äger fällorna och
  // bär fragor:-knappen, skattedjupet DRIP-beskattningen; sond
  // _s6u1-sond-omg18.mjs + _s6u1-sond2-omg18.mjs: familjen NULL genom
  // kedjan, 21 kärnord renta mot 1 147, 0 omvända stölder).
  { namn: "utdelningskalender", fil: "ai-mentor-utdelningskalender-fragor.ts", fn: "svaraLokaltUtdelningskalender", arr: "UTDELNINGSKALENDER_MONSTER", antal: 1 },
  // 2026-09-18 omgång 18: kreditdjup (s6-u2 — kreditens pris: kreditpremien
  // med spread som kurs och kronprislapp + kreditrating/covenanter med
  // betygstrappan och tröskel-aritmetiken; aktiverar ma-05 — MAKROEKONOMI &
  // RÄNTA:S ENDA mentorväglösa kurs — och ks-05 — KAPITALSTRUKTUR:s
  // mentorväglösa kurs; makro äger obligation/statsobligations-orden,
  // basen naket "spread"/"z-spread", riskdjupet covenants/löptid/
  // refinansiering solo, avkastningskurvan kurvorden; sond
  // _s6u2-sond-omg18.mjs: hela kreditpris-familjen NULL genom kedjans
  // 36 motorer / 104 monsters).
  { namn: "kreditdjup", fil: "ai-mentor-kreditdjup-fragor.ts", fn: "svaraLokaltKreditdjup", arr: "KREDITDJUP_MONSTER", antal: 2 },
  // 2026-09-18 omgång 18: sektordjup (s6-u3 — tre sektorspecifika frågor:
  // SaaS-bolag MRR/churn/NRR/Rule of 40 + halvledarbolag cykeln/foundry/
  // fabless + försvarsbolag orderstockens beläggning/anslagscykler;
  // aktiverar se-01/se-02/se-03 — SEKTORANALYS var omgångens största
  // mentorväglösa block, 21/27 kurser — och länkar se-13/se-16/km-038/
  // km-041/km-045/vm-08/pc-07 som källor; sektormotorn äger "-sektorn"-
  // fraserna, basen "arr" (V02-uppslaget), tidsaxeln orderstock/backlog,
  // varderjustering normalisering — deras frågor bärs som knappar; rond 1
  // av sonden _s6u3-sond-omg18.mjs DÖDADE indikatordjup-idén (basen äger
  // candlestick/rsi/macd/moving average-orden — 10 kedjefångster); rond 2:
  // 11 frågor NULL, 0 grannar mot 1 202 kärnord, 0 omvända stölder).
  { namn: "sektordjup", fil: "ai-mentor-sektordjup-fragor.ts", fn: "svaraLokaltSektordjup", arr: "SEKTORDJUP_MONSTER", antal: 3 },
  // 2026-09-18 omgång 19: sektorskola 2 (s6-u3 — tre analytikerklassiker:
  // läkemedelsbolag patentbrant/pipeline/blockbuster + detaljhandelsbolag
  // like-for-like/marginaltrappa + logistikbolag nätverksmatte/
  // kapitaltäthet/lastmile; aktiverar 8 mentorväglösa kurser — km-039,
  // km-048, pc-02, se-07, km-044, se-05, se-04, se-15 — PRAKTISKA CASE och
  // MOAT får sina första mentorvägar; extra äger moat/vallgrav (rond 2 av
  // sonden _s6u3-sond-omg19.mjs DÖDADE moat-lager-idén — deras kärnord),
  // e-handel ENDAST stärkord efter prototyp-stöldprovet i
  // _s6u3-sond2-omg19.mjs: 16 kandidatfrågor NULL, 0 grannar mot 1 229
  // kärnord).
  { namn: "sektorskola2", fil: "ai-mentor-sektorskola2-fragor.ts", fn: "svaraLokaltSektorskola2", arr: "SEKTORSKOLA2_MONSTER", antal: 3 },
  // 2026-09-18 omgång 20: beteendemekanik (s6-u3 — psykologins tysta
  // mekanismer: priming + tillgänglighetsfällan + övermod/overconfidence;
  // aktiverar 5 mentorväglösa kurser — bf-08, bf-01, km-036 primära + bf-10,
  // bf-07 källor; rond 2 av sonden _s6u3-sond2-omg20.mjs DÖDADE halo +
  // dunning-kruger som kärnord — basens beteende-monster äger dem, deras
  // kurser bärs ENDAST som källor enligt V19; "kalibrering" förväntnings-
  // djupets, nybörjar-frågorna basens "borja"-monsters; rond 3 GRÖN: 0
  // grannar mot 1 259 kärnord, 0 främmande i prototyp-stöldprovet).
  { namn: "beteendemekanik", fil: "ai-mentor-beteendemekanik-fragor.ts", fn: "svaraLokaltBeteendemekanik", arr: "BETEENDEMEKANIK_MONSTER", antal: 3 },
  // 2026-09-18 omgång 20: pe-mekanik (s6-u1 — private equity:s aritmetik:
  // IRR/internräntan med 26,0-procent-på-3-år mot 14,9-på-10-år-jämförelsen,
  // förvärvsmaskinens LBO-trappa 600 lån/400 eget med 2,6x-mot-1,4x-spegeln,
  // utfasningarnas fyra dörrar + vattenfallet 1 000 + 400 + 800 med GP 160/
  // LP 2 040 och DPI-måttet; aktiverar 4 mentorväglösa kurser — pe-02 primär
  // + pe-03 + pe-04 + ib-02, KATEGORIN PRIVATE EQUITY & INVESTMENTBOLAG
  // fullt länkad 5/9 → 9/9, the-outsiders femte källan; sonden
  // _s6u1-sond-omg20.mjs + sond2: hela familjen NULL genom kedjan, 27
  // kärnord renta mot 1 230 — basen äger PE-helhetsfrågan/onoterat-orden
  // (bärs som fragor:-knapp), redovisningsdjupet exit-familjen, djup-lagret
  // multipel-orden: exit och onoterat nämns ENDAST i text).
  { namn: "pe-mekanik", fil: "ai-mentor-pe-mekanik-fragor.ts", fn: "svaraLokaltPeMekanik", arr: "PE_MEKANIK_MONSTER", antal: 1 },
  // 2026-09-18 omgång 21: riskpremie (s6-u1, manifest auto-s6-1789768506578 —
  // aktiernas riskpremie, ma-06 MAKROEKONOMI & RÄNTA:S enda mentorväglösa
  // kurs; wiread FÖRE överlevnadsdjup; motordef här för G-fallets widget-
  // spegling — kanoniska rader bärs av deras eget leveranstest; kärnorden
  // sonderade fria av s6-u3:s rond 2).
  { namn: "riskpremie", fil: "ai-mentor-riskpremie-fragor.ts", fn: "svaraLokaltRiskpremie", arr: "RISKPREMIE_MONSTER", antal: 1 },
  // 2026-09-18 omgång 20 (samma trefönster): överlevnadsdjup (s6-u2 —
  // likviditetsreserven st-06 + konkursprognos/Altman Z-score st-03, STABI-
  // LITETs två mentorväglösa djupkurser; sond _s6u2-sond-omg20.mjs: hela
  // överlevnads-familjen NULL genom kedjan; motordef här för G-fallets
  // widget-spegling — kanoniska rader bärs av deras eget leveranstest).
  { namn: "överlevnadsdjup", fil: "ai-mentor-overlevnadsdjup-fragor.ts", fn: "svaraLokaltOverlevnadsdjup", arr: "OVERLEVNADSDJUP_MONSTER", antal: 2 },
  // 2026-09-18 omgång 21: koncernläsning (s6-u3, manifest auto-s6-
  // 1789768506578 — att läsa en KONCERN:s redovisning: koncernredovisningen
  // med konsolidering/eliminering/minoritetsintressen + segmentrapporteringen
  // med affärsområdenas nedbrytning + pensionsåtagandena som beräknad skuld;
  // aktiverar 6 mentorväglösa kurser — bk-04, km-024, km-025 primära + km-001,
  // bk-02, bk-05 källor — BOKFÖRING & ÅRSREDOVISNING 8/17 → 2/17 lösa; basens
  // rapport-monster äger resultaträkningen/bokslutet/balansräkningen/
  // årsredovisningen (bk-02 här KÄLLA enligt V19), portföljpraktiken
  // pension-sparandet ("pension"-grundordet — detta lager bär endast
  // sammansättningarna pensionsåtagande/pensionsskuld/pensionsförpliktelse,
  // deras fråga bärs som knapp), kapitalmekaniken goodwill, lönsamhetsdjupet
  // WACC/kapitalkostnad — samtliga nämns endast i text; sonderna
  // _s6u3-sond{,2,3}-omg21.mjs: familjerna NULL genom kedjans 43 motorer /
  // 1 317 kärnord, 0 grannar, 0 främmande i prototyp-stöldprovet).
  { namn: "koncernläsning", fil: "ai-mentor-koncernlasning-fragor.ts", fn: "svaraLokaltKoncernlasning", arr: "KONCERNLASNING_MONSTER", antal: 3 },
  // 2026-09-18 omgång 21: tillväxtdjup (s6-u2, samma manifest — S-kurvan/
  // mättnaden med utrymmesräkningen baklänges + prismix/mixeffekten med
  // intäkten dekompilerad i volym, pris och sammanhang; aktiverar HELA
  // TILLVÄXT-kategorien 1/8 → 8/8 — tx-04, tx-02 primära + tx-01, tx-05,
  // v01, v02, v03 källor; SONDENS LÄXA: rund 1–2 saknade basmotorn (import
  // med två namn föll utanför kartrapporten) — rund 3 DÖDADE «organisk
  // tillväxt»/«förvärvad tillväxt» (basens tillvaxt-monster äger EXAKT,
  // tx-01 här KÄLLA enligt V19) och «volym pris och mix» (basens kostnad-
  // monster äger naket «pris»), «skurvan» sammansatt (avkastningskurvans
  // kurvan-frågor, tavstånd 1); rund 4 GRÖN: 0 grannar, 0 stölder — deras
  // frågor bärs som knappar; wiread SIST i fönstrets dokumenterade ordning).
  { namn: "tillväxtdjup", fil: "ai-mentor-tillvaxtdjup-fragor.ts", fn: "svaraLokaltTillvaxtdjup", arr: "TILLVAXTDJUP_MONSTER", antal: 2 },
  // 2026-09-19 omgång 22 (tredje instansen): faktordjup (s6-u1, manifest
  // auto-s6-1789791914561 — aktiernas bucklor under CAPM-linjen: linjen
  // 2,0 + 1,2 × 4,0 = 6,8 och dess bucklor, de fyra klassiska faktorerna
  // (värde: billigaste tredjedelen lång/dyraste kort · storlek: Banz 1981 ·
  // momentum: Carhart 1997, tolv månaders vinnare mot förlorare ·
  // lågvolatilitet: Sharpe-paret 0,27/0,42), regressionens laddningar
  // (A 1,00/0,05/0,10/0,02 = ren marknad mot B 0,70/0,45/0,30/0,15 =
  // buckelbärare), blandningen 0,5 × 6,0 + 0,5 × 9,0 = 7,5, momentum-
  // nettot 6,0 − 2,5 = 3,5, tre skolor (riskkompensation/beteende/
  // struktur) och fyra fällor (varningshistorien 0,982¹³ ≈ 0,79 ·
  // faktorzoo · kostnadernas tystnad · berättelsens förklädnad).
  // Aktiverar pf-15 (PORTFÖLJHANTERING:s teorikröning — spår 5:s färska
  // kurs 2026-09-18, mentorväglös sedan födelsen) + rp-02; källor
  // dessutom ma-06 + km-015. Sondens dokumenterade gränser:
  // riskmåttsdjupet äger beta/CAPM/smart beta («vad är betat?» FÅNGAS
  // av dem), riskpremielagret premie-orden i risk-sammanhang, «faktorer»
  // plural STRYKS (granne «sektorer» på tavstånd 2 inom toleransen) —
  // deras frågor bärs som knappar, aldrig kärnord. Sond
  // _s6u1-sond-omg22.mjs: familjen NULL genom kedjans 47 motorer /
  // 128 monsters; kärnorden RENTA mot 1 350 syskonkärnord. Anspråk
  // data/vakten/auto-s6-1789791914561-u1-ansprak.md FÖRE byggstart.
  // Wiread efter tillväxtdjup, FÖRE bokmastar — ingen SIST-anspråk.)
  { namn: "faktordjup", fil: "ai-mentor-faktordjup-fragor.ts", fn: "svaraLokaltFaktordjup", arr: "FAKTORDJUP_MONSTER", antal: 1 },
  // 2026-09-19 omgång 22: bokmastar (s6-u3 — BOKMASTER-blockets första
  // mentorväg: redovisningsdetektiven + maniernas historia + specialsitua-
  // tionerna; 17 mentorväglösa bokkurser aktiverade som källor. Sondens
  // dokumenterade gränser: historia äger tulpanmanin, basen «hur ljuger
  // en årsredovisning?», praktik blankningen, djup snowball/acquirers
  // multiple, nästa what-works, riskdjup svarta svanen — alla bärs som
  // knappar, aldrig kärnord. Bokkursernas minuten=undefined i registret:
  // registerdrivna tal ur kapitel/quiz + kategorital. Wiread SIST).
  { namn: "bokmastar", fil: "ai-mentor-bokmastar-fragor.ts", fn: "svaraLokaltBokmastar", arr: "BOKMASTAR_MONSTER", antal: 3 },
  // 2026-09-19 omgång 22: riskbudget (s6-u2, manifest auto-s6-1789791914561 —
  // volatilitetsbudgeten: risken som BESLUT, ekvationen 10w² − 2w − 3 = 0 ⇒
  // 65,7/34,3 med kontrollen 139,76 + 4,24 = 144,00, svängen 18→24 ⇒ 15,90 =
  // 32,5 % över taket, återförd vikt 48,3/51,7 + sortino/calmar: tre divisioner
  // där exempelportföljen 1,00/1,43/0,80 möter spegeln 1,00/1,17/1,13 — tre
  // mått tre vinnare; aktiverar HELA RISKHANTERING & PORTFÖLJTEORI-kategorin
  // 7/13 → 13/13: rp-04, rp-02 primära + rp-01, rp-03, km-017, km-031 källor.
  // Sondens dokumenterade gränser: basen äger naket risk/volatilitet/kelly/
  // position sizing/value at risk, portföljbalansen riskparitet (rp-03 här
  // KÄLLA enligt V19), riskmåttsdjupet sharpe-kvoten — ägarnas frågor bärs
  // som knappar, aldrig kärnord. Wiread efter bokmastar i fönstrets ordning).
  { namn: "riskbudget", fil: "ai-mentor-riskbudget-fragor.ts", fn: "svaraLokaltRiskbudget", arr: "RISKBUDGET_MONSTER", antal: 2 },
  // 2026-09-19 omgång 22 (omstartsfullbordan): konvertibel (s6-u1, manifest
  // auto-s6-1789791914561 — mellanformerna skuld↔aktie: konvertibeln med
  // valrätten (1 000 ÷ 125 = 8 aktier · pariteten 125 · golvet 1 000 vid
  // aktie 100) + preferensaktien/evighetsräntan (6,50 ÷ 0,065 = 100,0 mot
  // 6,50 ÷ 0,078 = 83,3 = −16,7 %) + stämpelordningen (70/60/25/40 →
  // 100 %/40 %/0 %) med AT1/Credit Suisse-läxan 16 mdr francs; aktiverar
  // ks-06 + ks-07 — KAPITALSTRUKTUR fullt mentorlänkad 6/8 → 8/8, källor
  // ks-07 + rk-02 + rk-08 + ma-05. Ursprungsinstansen byggde modul + anspråk
  // (s6-omg22-u1-ansprak.md) men avslutade utan kvitto-rad; omstarten
  // fullbordade test + wiring + denna motordef. Sondens dokumenterade
  // gränser: basen äger kapitalstruktur-helhetsfrågan och konkurs-orden,
  // makro obligation/epi-orden, optionsdjupet optionens premie/order,
  // kapitalmekaniken emission/utspädning, kreditdjupet kreditpris-familjen
  // — deras frågor bärs som knappar; naket «konvertering» bärs INTE
  // (avkastningskurvans «kurvinvertering», tavstånd 4), «at1» kort-exakt.
  // Sond _s6u1-sond-omg22.mjs: familjen NULL genom kedjans 46 motorer /
  // 125 monsters. Wiread SIST i fönstrets ordning: bokmastar → riskbudget
  // → detta lager.)
  { namn: "konvertibel", fil: "ai-mentor-konvertibel-fragor.ts", fn: "svaraLokaltKonvertibel", arr: "KONVERTIBEL_MONSTER", antal: 1 },
  // 2026-09-19 omgång 23: sektorläsning (s6-u2, manifest auto-s6-
  // 1789814130065 — sektorläsningens energi- och telekom-sidor, SEKTOR-
  // ANALYS-blockets första mentorväg in i km-043 + km-046; aktiverar 8 av
  // sondens 9 oådda sektorkurser: energi (cykeln: −182,5 · +912,5 ·
  // +2 372,5 M USD mot brytpris 45, svängen 2 555,0; reserverna 547,5 ÷
  // 36,5 = 15,0 år; elprisspegeln 1,0 → 5,0 mdr = femdubblad) + telekom
  // (abonnemangskassan 2,0 M × 350 × 12 = 8,4 mdr; churn 288 000/år; capex
  // 1 400 ÷ 8 400 = 16,7 %; spektrum 2 200 ÷ 20 = 110 M/år; utdelning 3,50
  // ÷ 70,00 = 5,0 %, payout 70,0 %). Källor: skog + rederi + bil (energi)
  // och media + flyg + spel (telekom). Sondens dokumenterade gränser:
  // «kraftbolag» struket (fraktbolag-granne, tavstånd 2 — prototypen stal
  // «vad är fraktbolag?»), «oljepris» = makro-familjens (endast stärkord
  // här), «tänker»-formuleringar ägs av sektor-bank («banker» tavstånd 1
  // från «tänker»). Sond _s6u2-sond-omg23.mjs + -sond2- + -sond3-: 50
  // motorer / 1 453 kärnord, familjen NULL genom hela kedjan. Wiread SIST
  // i fönstrets ordning: … → konvertibel (49) → detta lager (50:e index).)
  { namn: "sektorlasning", fil: "ai-mentor-sektorlasning-fragor.ts", fn: "svaraLokaltSektorlasning", arr: "SEKTORLASNING_MONSTER", antal: 2 },
  // 2026-09-19 omgång 23: vardegrund (s6-u3, manifest auto-s6-1789814130065
  // — värderingsfamiljens grundvåning; aktiverar HELA det fria värderings-
  // blocket, 10 kurser: VÄRDERINGSMETODER 7/7 mentorväglösa (vm-02/05/07
  // primära + vm-09/10/11 + km-028 källor) + VÄRDERING:s vr-05/06/07 källor.
  // Tre monsters: intrinsic value/motiverat värde — DCF-miniräknaren
  // 10,00 → 184,6 kr (nuvärden 9,72 + 9,45 + 9,19 = 28,36; TV 196,80 →
  // 156,22; terminalandelen 84,6 %; kurs 150 = 0,81 = 19 % under värdet;
  // WACC-läxan 8→9 % = 158,1 = −14 %) + realoptionerna — gruvträdet (idag
  // 100 − 120 = −20 mot vänta 0,5×30 + 0,5×0 = +15; flexibilitetens värde
  // 15 − (−20) = 35 mkr) + kassaflödesavkastningen — yield-familjen
  // (4 ÷ 100 = 4,0 % · P/FCF 100 ÷ 4 = 25 · P/CF 100 ÷ 6 = 16,7 ·
  // P/B 100 ÷ 80 = 1,25). Sondens dokumenterade gränser: Nästa äger
  // DCF-familjen («reverse dcf» FÅNGAD av dem — km-028 här KÄLLA enligt
  // V19), «inre värde», substans-/tillgångs-orden och option-familjen
  // («verkliga optioner»/«real option» med mellanslag = deras; sammanskrivna
  // «realoption(er)» = detta lagers), Extra «fcf yield»/«free cash flow
  // yield»/«price to cash flow», Lönsamhetsdjupet «wacc», Basen «pris och
  // värde», Djup «jämförelsebolag» — deras frågor bärs som knappar; «p/cf»
  // STRYKS som kärnord (8 grannar: fcf/p/e/dcf/put/etf/kf/peg/pmi). Sond
  // _s6u3-sond{,2,3}-omg23.mjs: 50 motorer / 132 monsters / 1 453 kärnord,
  // kvarvarande kärnord NULL + 0 grannar. Wiread SIST i fönstrets ordning:
  // … → konvertibel (50) → sektorlasning (51) → detta lager (52:a motorn).)
  { namn: "vardegrund", fil: "ai-mentor-vardegrund-fragor.ts", fn: "svaraLokaltVardegrund", arr: "VARDEGRUND_MONSTER", antal: 3 },
  // 2026-09-19 omgång 23: realekonomi (s6-u1, manifest auto-s6-1789814130065
  // — ekonomins verkliga sida i sex fönster; aktiverar HELA det fria
  // MAKROEKONOMI-blocket: mk-02 arbetslöshet primär + mk-03 handelsbalans +
  // mk-05 geopolitik + mk-07 finanspolitik + mk-10 oljepris + mk-11
  // kinaekonomin = 6 mentorväglösa kurser i ett svar). Ett monster:
  // realekonomin — AKU:s stickprov 30 000 (15–74 år) och klyftan 1–2
  // procentenheter mot registret · deltagandet 79 − 72 = 7 procentenheter
  // (1990→1999) med 2005:s sjukskrivningsfälla 11 % · Phillips platt sedan
  // 2015 (<20 % av inflationssvängningarna) och platser 3–6 månader före ·
  // bytesbalansens undertal −3 + 5 = +2 % av BNP med 2022:s −2 % ·
  // J-kurvan 12–18 månader mot 1982:s 16-procentare · REER −21 % ·
  // fatet 159 liter, skiffern 1 → 9 (9 − 1 = 8) miljoner fat/dag,
  // brytkostnad 40–60 mot 20–40 dollar, oljechockens 4 procentenheter,
  // valutadubbeln 65 % dollar/80 % krona = 15 · budgeten 1,2 biljoner =
  // 50 % av BNP, multiplikatorn 10 × 0,7 = 7 till 10 × 1,2 = 12,
  // 27 utgiftsområden, anslagsavvikelsen 5–10 % · Kinas 9,5 % → 5–6 %,
  // 17 biljoner ≈ 70 % av USA:s, statliga 30 % + fastighet 25 % av BNP,
  // börsens 8 % Kina-intäkter, Evergrande −25 %, statistikfällan 1–2
  // procentenheter, Caixin < 48 · GPR 2018 (elva tidningar), +50 % olja
  // på en dag/−10 % krona, OMXSPI 3 månader, tumregeln 5–10 dagar.
  // Sondens dokumenterade gränser: Makro äger ränte-/inflations-/
  // penningpolitik-orden (endast starkord + knapp här), tidsaxeln
  // konjunkturindikator-familjen (naket «indikator» aldrig kärnord),
  // handelsdagen «sanktioner» (deras «auktioner» fångar live), tillväxt-
  // djupet «phillips-kurvan» bindestrecksform (substring «s kurvan»),
  // u2 sektorlasning energibolag/oljebolag («oljepris» enligt deras not
  // endast starkord — oljepris-ORTEN är detta lagers), u3 vardegrund
  // värderingsorden, basen «hur påverkar X aktier/börsen?»-formerna.
  // Sond _s6u1-sond{,2,3}-omg23.mjs (fyra ronder; rond 2 dödade första-
  // valet indikatorfamiljen — basen äger hela paraplyet): 51 motorer /
  // 1 490 kärnord inkl. disk, kvarvarande kärnord NULL + funk-säkra.
  // INGEN SIST-anspråk — 53:e motorn: … → konvertibel (50) →
  // sektorlasning (51) → vardegrund (52) → detta lager.)
  { namn: "realekonomi", fil: "ai-mentor-realekonomi-fragor.ts", fn: "svaraLokaltRealekonomi", arr: "REALEKONOMI_MONSTER", antal: 1 },
  // 2026-09-19 omgång 24: försäkring + krypto (s6-u1, manifest auto-s6-
  // 1789839901194 — sektorfamiljens sista fria block; aktiverar se-19 +
  // se-11 primärt ⇒ KATEGORIN SEKTORANALYS FULLT LÄNKAD 30/30 + källorna
  // poor-charlies-almanack, ib-03, sj-02, rs-01 = 6 kurser nya mentorvägar).
  // Två monsters: combined ratio/floaten — teckningsmotorn (690 + 260) ÷
  // 1 000 = 95 % (stormåret 105 %) mot kapitalmotorn floaten 4 000 Mkr ×
  // 4 % = 160 Mkr (bra år 210, stormår 110; effektiv ränta 1,25 %) +
  // krypto som extrem risk — blockkedjan och svängningsaritmetiken
  // 10 000 → 2 500 = −75 % ⇒ +300 % tillbaka. Sondens dokumenterade
  // gränser: naket «försäkring» = beteendedjupets («förankring», tav 2 —
  // sammansättningarna är detta lagers), «float»↔«moat» tav 2 hålls isär
  // av längdtoleransen, «termin/terminer» = nästas, «price to sales/book»
  // = basens — od-07 och v04/v05 bärs INTE. Sond _s6u1-sond{,2,3}-omg24:
  // familjerna NULL genom kedjans 54 motorer / 148 monsters, 0 grannar.
  // Wiread SIST — 55:e motorn. Anspråk FÖRE byggstart.
  { namn: "försäkring", fil: "ai-mentor-forsakring-fragor.ts", fn: "svaraLokaltForsakring", arr: "FORSKRING_MONSTER", antal: 2 },
  // 2026-09-19 omgång 24: moatdjup (s6-u2, manifest auto-s6-1789839901194
  // — moatens två mekanisker i siffror: prisfullmakten med hävstången
  // (100 − 60) × 100 000 = 4,0 Mkr mot (105 − 60) × 100 000 = 4,5 Mkr
  // = +12,5 % vinst på 5 % pris, spegeln (95 − 60) × 100 000 = 3,5 Mkr
  // = −12,5 %, brytpunkten 4,0 Mkr ÷ 45 = 88 888,9 enheter ⇒ bolaget
  // tål 11,1 % kundbortfall + byteskostnaderna med churn-spegeln —
  // marginal 8 000 kr/år; churn 2 % ⇒ 1 ÷ 0,02 = 50 år ⇒ 8 000 × 50
  // = 400 000 kr mot churn 20 % ⇒ 5 år ⇒ 40 000 kr; kvoten 10 × =
  // tiofalt kundvärde på oförändrad marginal (de tre benen: lärandet,
  // integrationen, risken). Aktiverar MT-blockets 7 mentorväglösa
  // kurser ⇒ KATEGORIN MOAT fullt länkad 4/11 → 11/11: mt-07 + mt-05
  // primära + mt-01, mt-03, mt-04, mt-06, mt-08 källor. Sondens
  // dokumenterade gränser: «moat»/«moats»/«moaten»/«vallgrav»/«vallgraven»
  // = extra-lagrets kärnord (rond 1-bevis: 4 formuleringar → extra — här
  // ENDAST stärkord, deras frågor bärs som knappar), «kostnadsöverlägsenhet»/
  // «kvalitetspremien»/«inlåsningseffekten» NULL men medvetet ej kärnord
  // (2 frågor = uppdraget; kurserna bärs som källor). Sond
  // _s6u2-sond-omg24.mjs + _s6u2-sond2-omg24.mjs: hela familjen NULL
  // genom kedjans 54 motorer / 148 monsters / 1 570 kärnord, kärnorden
  // RENTA. Anspråk data/vakten/auto-s6-1789839901194-s6-u2-ansprak.md
  // FÖRE byggstart. Wiread sist i fönstrets löpande ordning — 56:e
  // motorn: … → realekonomi (53) → försäkring (55) → detta lager.)
  { namn: "moatdjup", fil: "ai-mentor-moatdjup-fragor.ts", fn: "svaraLokaltMoatdjup", arr: "MOATDJUP_MONSTER", antal: 2 },
  // 2026-09-19 omgång 24: nya territorier (s6-u3, manifest auto-s6-
  // 1789839901194 — TRE monsters: aktivisten, guidningen, bostadsmekaniken +
  // demografin; aktiverar 7 mentorväglösa kurser: kt-07 + ib-04 + kt-06 +
  // kt-04 + kt-05 + ma-08 + mk-12 — fyra av spår 5:s sex nyaste). DEKONFLIKT
  // mot fönstrets syskon, ärligt bokfört: ursprungsplanens försäkringsmonster
  // överläts åt u1 (deras anspråk 16:25 UTC FÖRE detta lagers 17:53; deras
  // modul lästes på disk) — ersättaren aktivisten sondbekräftad NULL genom
  // kedjan ÄVEN med syskonens lager wireade, grannkontroll omkörd mot deras
  // kärnord: 0 överlapp. Aktivisten: substans 178,0 mot kurs 124,0 = gap
  // 54,0 = 43,5 %, flaggtröskeln 5 %, röstlängden 20,0 A + 80,0 B = 28,0 M
  // röster med stiftelsens 51,4 % röster på 14,4 % kapital, prisbanan
  // 124,0 → 146,0. Guidningen: det dubbla slaget 0,90 × 0,90 = 0,81 (kurs
  // 180,0 → 145,8 = −19,0 %), kalibreringsserien 12,00 → 10,50 mot väntan
  // 9,00 (+20 % över). Bostaden: lånekraften 144 000 ÷ 0,040 = 3 600 000
  // mot 7 200 000 (kvot 2,0), bolånetaket 85 % av 4 000 000, tjänstegraden
  // 216 000 = 27,0 %, hävstången 37,5 ÷ 15 = 2,5, beroendekvoten 0,84 →
  // 1,00, pensionen 41,7 → 25,0 (−40 %). Sondens dokumenterade gränser:
  // basen äger naked «katalysator», nästas substansvärde-orden, ägande
  // bolagsstämma/rösträtt, makro ränte-orden, basen «hur påverkar X
  // börsen?»-formerna — samtliga bärs som knappar ur svaren. Sond
  // _s6u3-sond{,2,3}-omg24.mjs: familjerna NULL genom kedjan, 0 grannar.
  // Wiread sist i fönstrets löpande ordning — 57:e motorn: … →
  // realekonomi (53) → försäkring (55) → moatdjup (56) → detta lager.
  // INGEN SIST-anspråk. Anspråk data/vakten/auto-s6-1789840407-u3-ansprak.md
  // FÖRE byggstart.
  { namn: "nyaterritorier", fil: "ai-mentor-nya-territorier-fragor.ts", fn: "svaraLokaltNyaTerritorier", arr: "NYA_TERRITORIER_MONSTER", antal: 3 },
  // 2026-09-20 omgång 25: etfmekanik (s6-u1, manifest auto-s6-1789864506792
  // — den börshandlade fondens inre maskineri ETT monster; aktiverar am-08 +
  // am-07 + od-07 som källa ⇒ KATEGORIN AKTIEMARKNADEN I PRAKTIKEN fullt
  // länkad 8/10 → 10/10 (km-069/km-070 var nådda sedan tidigare): korgen/NAV 10 000 000 ÷ 1 000 000 = 10,00 med
  // 10 200 000 → 10,20; skapelsen AP-korgen 5 000 000 ÷ 10,00 = 500 000
  // andelar; arbitraget premie 0,4 % med 500 000 × 10,04 = 5 020 000 −
  // 5 000 000 = 20 000 − 2 000 = 18 000 netto, självförstörande
  // 0,4 → 0,3 → 0,2, diskontet 9,96 = 4 980 000; flashdagen 6 maj 2010
  // (20-30-50 %); hävstångens tull 1,05 × 0,9524 = 1,00 mot 1,10 × 0,9048
  // = 0,995 och 0,995^5 ≈ 0,976, nedgångsspegeln 0,80 × 1,25 = 1,00 mot
  // 0,60 × 1,25 = 0,75; rullens contango 50,00/50,50 med 0,99^12 = 0,886 =
  // −11,4 %; indexomläggningen 40 000 × 0,80 = 32 000, × 0,12 = 3 840 Mkr,
  // fond-spegeln 50 000 × 0,012 = 600, bågen 42,00 → 44,52 = +6,0 % → 42,74,
  // tidsaxeln 3 840 ÷ 60 = 64 handelsdagar, viktdriften 10 000 × 0,004 =
  // 40. Sondens dokumenterade gränser: praktiken äger naket index/indexfond/
  // etf (grundfrågorna — här stärkord + knapp; «etfens» träffas aldrig av
  // deras exakta korta match), marknadsmekaniken spread/likviditet, nästas
  // nav och naket «termin» (od-07 bärs som källa + länk), basen «hävstång»
  // (endast sammansättningen «hävstångsetf» kärnord här), portfölj-
  // praktiken «rebalansering» («ombalansering» KASTADES ur kärnorden —
  // tavstånd 2 — förekommer endast i text), naket «arbitrage» lämnas
  // ledigt (bf-13 mentorväglös — framtida lagers fett). Sond
  // _s6u1-sond{,2}-omg25.mjs: familjerna NULL genom kedjans 58 motorer /
  // 165 monsters / 1 688 kärnord, kärnorden RENTA. 59:e motorn — efter
  // nyaterritorier, FÖRE fönstrets syskonlager kontrahent (s6-u2). Anspråk
  // data/vakten/s6-omg25-u1-ansprak.md FÖRE byggstart.
  { namn: "etfmekanik", fil: "ai-mentor-etfmekanik-fragor.ts", fn: "svaraLokaltEtfmekanik", arr: "ETFMEKANIK_MONSTER", antal: 1 },
  // 2026-09-20 omgång 25: kontrahent (s6-u2, manifest auto-s6-1789864506792
  // — kontrahentriskens två monsters: motparten + nettingen (+8, −5, +2 ⇒
  // brutto 15 mot netto +5; den bilaterala världen med Lehman som MOTPART)
  // och clearinghuset (trappan 28 + 8 + 4 = 40 ⇒ 70/20/10 %, haircutsen
  // 100/98/80 per 100 ⇒ aktiepant 50 000 ÷ 0,80 = 62 500). Aktiverar rk-16
  // — spår 5:s kurs född 2026-09-19, mentorväglös sedan födelsen — +
  // källorna od-07, ma-05, am-04, ks-05. Sondens dokumenterade gränser:
  // «ccp» STRYKS (granne «ccc» — kapitalbindningens — tavstånd 1, bärs i
  // text), «lehman» historia-lagrets (historieförankring i text),
  // «initial margin»/«variation margin» basens ([2 bas]), basens
  // bank-formulering undviks («vem står på andra sidan» = kärnordsfrasen).
  // Sond _s6u2-sond{,2}-omg25.mjs: familjen NULL genom kedjans 58 motorer
  // / 165 monsters / 1 688 kärnord, 0 grannar, 0 stölder mot 117 kanoniska.
  // Wiread sist EFTER syskonet u1:s etfmekanik (deras SIST-deklaration i
  // widgeten respekterad — detta lager 60:e motorn). Anspråk
  // data/vakten/auto-s6-1789864506792-s6-u2-ansprak.md FÖRE byggstart.
  { namn: "kontrahent", fil: "ai-mentor-kontrahent-fragor.ts", fn: "svaraLokaltKontrahent", arr: "KONTRAHENT_MONSTER", antal: 2 },
  // 2026-09-20 omgång 25: multipel — grundmultiplarna (s6-u2 försök 2,
  // manifest auto-s6-1789864506792 — P/S-talet och P/B-talet, 2 monsters).
  // Aktiverar v04-ps + v05-pb (VÄRDERING-kategorins mentorväglösa
  // grundmultiplar; kategorins tredje vr-08 bärs som KÄLLA här). Sond
  // _s6u2b-sond-omg25.mjs: PS-familjen TOTALT NULL genom kedjan,
  // PB-familjen NULL med dokumenterade gränser («p/b för en bank» =
  // sektorns, «substansvärde» = nästas investmentbolag), 0 kärnords-
  // kollisioner, råa «p/s»/«p/b» substring-farliga (falsk träff på
  // «köp svenska aktier») ⇒ korta exakta ord «ps»/«pb» bär. KANONISKA-
  // poster bärs AV DETTA LAGERS EGNA TEST (marknadsrytm-precedensen:
  // kontrahenttestets G2-Math.max skole gå sönder av nya motorindex —
  // härleds LIVE ur kärnorden i stället). Anspråk data/vakten/
  // auto-s6-1789864506792-s6-u2-ansprak2.md FÖRE byggstart. 61:a motorn
  // (av 62), FÖRE marknadsrytm — deras SIST-deklaration + L01 respekteras.
  { namn: "multipel", fil: "ai-mentor-multipel-fragor.ts", fn: "svaraLokaltMultipel", arr: "MULTIPEL_MONSTER", antal: 2 },
  // 2026-09-20 omgång 26 (manifest auto-s6-1789890903364): riskadress (s6-u1
  // — riskens adresser i ett monster: leverantörsrisken + modellrisken +
  // personalrisken ovanpå anatomi-kartan; aktiverar FYRA mentorväglösa
  // kurser rs-06/07/08/09. Sond _s6u1-sond2-omg26.mjs: kärnordsfamiljerna
  // NULL genom kedjan; basen äger naket «risk»/«risken», makro «ränte-
  // täckning», marknadsmekanik «stopp», risklasningsdjup kundkoncentration.
  // KANONISKA-poster bärs AV LAGRETS EGNA TEST (multipel-precedensen).
  // 62:a motorn (av 63), FÖRE marknadsrytm — deras SIST-deklaration + L01
  // respekteras. Anspråk data/vakten/auto-s6-1789890903364-s6-u1-ansprak.md
  // FÖRE byggstart.)
  { namn: "riskadress", fil: "ai-mentor-riskadress-fragor.ts", fn: "svaraLokaltRiskadress", arr: "RISKADRESS_MONSTER", antal: 1 },
  // 2026-09-20 omgång 26 (manifest auto-s6-1789890903364): balansdjup (s6-u2
  // — lagervärderingen + obeskattade reserver, 2 monsters: (1) bk-07 varornas
  // värde: lägsta-värde-principen, nettoförsäljningsvärdet, rullningen,
  // grottan; (2) bk-06 uppskovet + det justerade egna kapitalet, P/B-fällan
  // 1,67 mot 0,79. Aktiverar kategorins två SISTA mentorväglösa — BOKFÖRING
  // & ÅRSREDOVISNING 17/19 → 19/19 FULLT MENTORLÄNKAD. Sond
  // _s6u2-sond{,2}-omg26.mjs + rond 3: 18/18 kärnord RENTA mot samtliga
  // lager; «lageromsättnings-» = kapitalbindningens, nakna «lagret»/«lager»
  // ENDAST stärkord («laget»/«lagen» avstånd 1 — falskträfffaran dokumenterad).
  // KANONISKA-poster bärs AV LAGRETS EGNA TEST (multipel-precedensen).
  // 63:e motorn (av 64), FÖRE marknadsrytm — deras SIST-deklaration + L01
  // respekteras. Anspråk data/vakten/auto-s6-1789890903364-s6-u2-ansprak.md
  // FÖRE byggstart (10:00 — fönstrets första på disk).)
  { namn: "balansdjup", fil: "ai-mentor-balansdjup-fragor.ts", fn: "svaraLokaltBalansdjup", arr: "BALANSDJUP_MONSTER", antal: 2 },
  // 2026-09-20 omgång 26: optionshantverk (s6-u3 — binomialträdet och
  // replikeringen + straddlen + deltat; aktiverar od-08 + od-04 + od-06
  // primärt + od-05 som källa ⇒ OPTIONS & DERIVAT fullt mentorlänkad
  // 12/12 — kategorins fyra sista mentorväglösa).
  // MOTORDEF HÄR för fall G:s widget-spegling (riskpremie-precedensen):
  // deras modul, deras leverans — kanoniska rader bärs av deras eget
  // leveranstest. 64:e motorn, efter balansdjup, FÖRE marknadsrytm (SIST).
  { namn: "optionshantverk", fil: "ai-mentor-optionshantverk-fragor.ts", fn: "svaraLokaltOptionshantverk", arr: "OPTIONSHANTVERK_MONSTER", antal: 3 },
  // 2026-09-20 omgång 26: pengarstid (s6-u2 fönster 3, manifest
  // auto-s6-1789890903364 — pengarnas tid och ordning: andrahandsmarknaden
  // + sekvensrisken, 2 monsters). Aktiverar pe-05/pe-06/ib-05 + rp-05 ⇒
  // PRIVATE EQUITY & INVESTMENTBOLAG 13/13 OCH RISKHANTERING & PORTFÖLJ-
  // TEORI 14/14 fullt länkade (pe-06 + rp-05 födda samma dag av spår 5 —
  // rs-09-precedensen). 66:e motorn, efter optionshantverk, FÖRE
  // marknadsrytm (SIST). RACE-NOT: två föregående wiringar raderades av
  // lost-update (u3:s widget-skrivning 10:57 + återställning 11:07) —
  // detta är återappliceringen.
  { namn: "pengarstid", fil: "ai-mentor-pengarstid-fragor.ts", fn: "svaraLokaltPengarstid", arr: "PENGARSTID_MONSTER", antal: 2 },
  // 2026-09-20 omgång 27 (manifest auto-s6-1789912510460): volatilitetsmekanik
  // (s6-u2 — varifrån bruset kommer och vad det kostar: volatilitetsdraget +
  // marginaltrappan, 2 monsters). Aktiverar rp-06 (född 2026-09-20 av spår 5,
  // mentorväglös sedan födelsen — rs-09-precedensen) + ln-03. KOLLISION-NOT:
  // första planen bar marginalhandeln (am-09) men s6-u1:s parallella lager
  // äger det territoriet helt — monster 2 bytt till marginaltrappan, 0
  // kärnordsöverlapp kontrollerat. Efter pengarstid, FÖRE marknadsrytm (SIST).
  { namn: "volatilitetsmekanik", fil: "ai-mentor-volatilitetsmekanik-fragor.ts", fn: "svaraLokaltVolatilitetsmekanik", arr: "VOLATILITETSMEKANIK_MONSTER", antal: 2 },
  // 2026-09-20 omgång 27 (manifest auto-s6-1789912510460): co-invest (s6-u1
  // — andelen bredvid fonden, ETT monster: två biljetter till samma
  // konsert — LP-vägen 200 − 20 carry − 12 avgifter = 168 mot biljetten
  // 200, gap 32 · urvalsasymmetrin: tre skäl att dela (kapacitet/
  // riskdelning/tvivel), helägda 2,10x → 176 mot erbjudna 1,70x → 170,
  // gap 6 trots 34 enheter avgift+carry · mätningen: break-even 1,76x,
  // speglingen 2,10 − 1,76 = 0,34x = 34 enheter, trappan +34/+14/0/−6,
  // enskild affär 144 mot 170 = +26 = +18 % · fem krav, fyra fällor,
  // protokollets fem frågor. Aktiverar pe-07 (född 2026-09-20 av spår 5,
  // mentorväglös sedan födelsen — rs-09-precedensen) ⇒ KATEGORIN PRIVATE
  // EQUITY & INVESTMENTBOLAG fullt länkad 13/14 → 14/14 + pe-04
  // källaktivering (källor pe-06 + km-014). Sondens dokumenterade gränser
  // (_s6u1f-sond-omg27.mjs): djup äger «multipeln»-familjen (break-even i
  // TEXT), nästa «call», solidformen «coinvestering» STRYKS (tavstånd 2
  // till «investering» — hyphen-formerna blir flerordsfraser som kräver
  // co-prefixet). VAL-EPILOG: v1 marginalhandeln (am-09) nedställd till
  // s6-u2 (deras anspråk 16:03 FÖRE detta lagers 16:04 — de bytte i sin
  // tur sitt monster 2 till ln-03; am-09 förblir mentorväglös, fynden i
  // _s6u1e-sond-omg27.mjs). KANONISKA-poster bärs AV LAGRETS EGNA TEST
  // (multipel-precedensen). 69:e motorn (av 69), efter volatilitetsmekanik,
  // FÖRE marknadsrytm — deras SIST-deklaration + L01 respekteras. Anspråk
  // data/vakten/auto-s6-1789912510460-s6-u1-ansprak.md v2 FÖRE byggstart.
  { namn: "co-invest", fil: "ai-mentor-coinvest-fragor.ts", fn: "svaraLokaltCoinvest", arr: "COINVEST_MONSTER", antal: 1 },
  // 2026-09-20 fönstret efter omgång 27 (s6-u2, verktygsprefix _s6u2o28-):
  // tvångsmekanik — kontraktet som säljer åt dig och kalendern som flyttar
  // kursen, 2 monsters. (1) MARGINALHANDELN: am-09 primär (född 2026-09-20
  // av spår 5 u1 — f212ccae, mentorväglös sedan födelsen — AKTIVERAR
  // KATEGORIN AKTIEMARKNADEN I PRAKTIKEN FULLT LÄNKAD: am-09 var kategorins
  // sista lösa kurs) + källor km-030 (värderingsmarginalen — ordets andra
  // hem) + mk-04 KÄLLAKTIVERING (MAKROEKONOMI:s enda lösa ⇒ kategorin
  // stängs) + bf-15 (kaskadens systemvy) + am-01 (spreaden i kravdagen).
  // Belåningsvärdet 105 000 + 50 000 + 12 500 = 167 500 (55,8 % av 300 000)
  // · kaskaden −20/−40/−50/−55 ⇒ värdeandel 58,3/44,4/33,3/25,9 % mot
  // kravet 30 · kravdagen S ≥ 18 300 (135 000 − 35 000/0,30) · hävstången
  // 1,5 ⇒ eget −82,5 % vid börsens −55 · räntan 5 950/år ≈ 496/mån, netto
  // = 1,5a − 0,5r, spegeln +9,0/−15,0, brytpunkten a = r · sex fällor +
  // protokollets fem frågor. (2) OPTIONSFÖRFALLETS DAG: kt-08 primär (född
  // 2026-09-20 av spår 5 u3 — 62901006, mentorväglös sedan födelsen) +
  // källor km-059 (open interest — grundkursens begrepp) + am-05 (stängnings-
  // auktionen) + kt-03 KÄLLAKTIVERING (mentorväglös) + od-01 (gamman).
  // Magnetkartan 12 000 kontrakt × 100 = 1 200 000 aktier = 15 % av
  // omsättningen 8 000 000 (24 % när den sinar till 5 000 000) · hedgen
  // korta 50 000 vid delta 0,50; 101 ⇒ 0,62 ⇒ köper 12 000; 99 ⇒ 0,38 ⇒
  // köper tillbaka 12 000 · σ 1,5 % ⇒ 49,5 % inom en krona · tron, torkan,
  // efterspelet, arbetsbladets fem rader. Sondens dokumenterade gränser
  // (_s6u2o28-sond.mjs — 28/32 NULL, 14 kontroller rätt ägare, 0 grannar):
  // «open interest» → realekonomin · «pin-risken» → basen · «gamma-hedgning»
  // → valutamekaniken · «stängningsauktionen» → handelsdagen ·
  // «förfallodagen»/«delta» → optionshantverket · naket «hävstång»/«margin
  // call»/«margin of safety»/«marginalen» → basen · «belåningsgrad» →
  // sektorn (tav 2) · «belåningsräntan» → handelsdagen (tav 2) — alla bärs
  // i TEXT. VAL-EPILOG: am-09 var u1:s nedställda omgång-27-v1 (disk-först
  // 16:03/16:04, de bytte till ln-03 — fynden låg färdiga i
  // _s6u1e-sond-omg27.mjs). Anspråk data/vakten/s6-u2-fonster28-ansprak.md
  // FÖRE byggstart. 70:e motorn (av 70), efter co-invest, FÖRE marknadsrytm
  // — deras SIST-deklaration + L01 (multipel-precedensen).
  { namn: "tvangsmekanik", fil: "ai-mentor-tvangsmekanik-fragor.ts", fn: "svaraLokaltTvangsmekanik", arr: "TVANGSMEKANIK_MONSTER", antal: 2 },
  // 2026-09-20 fönster 29 (s6-u2, verktygsprefix _s6u2o29-): händelsemotor —
  // KATALYSATOR-KATEGORISTÄNGNING 9/11 → 11/11 via AKM1:s två sista lösa
  // variabelkurser: v16 PRODUKTLANSERINGAR (lanseringsdramat — tre faser:
  // förväntan +37,5 % → eventvecka +8,2 % → månaden efter −5,0 %; rNPV
  // 0,85 × 3,0 = 2,55 miljarder; IV-varningen 80/√12 ≈ 23 %; lanserings-
  // nettot 275 − 180 = 95, kostnaden äter 65,5 %; SAAB:s tioårsdröm
  // 6,1 %/år; Sinch-spegeln −95 %) + v17 AVTAL & PARTNERSKAP (avtals-
  // mekaniken — LOI-trappan: avsiktsförklaringar leder till bindande avtal
  // i 30–50 % av fallen; take-or-pay-trappan; TCV/ACV 500/10 = 50;
  // budpremie-banden 20–40/40–60/0–15; budspreaden 0,90 × 13 − 0,10 × 17
  // = 10,0; synergifällan 60–70 % förstör + Sinch 25/25-skulden; Geely-
  // rabatten 72,3 %; Medimmune-avskrivningen 28,8 %). Källmärke 5+5
  // numrerade 📖 Källor; registerdrivna tal VID SVARSTID (KATALYSATOR = 11
  // LIVE). Sond _s6u2o29-sond.mjs (3 ronder, kedjan 70 motorer/189
  // monsters): kärnorden RENTA; dokumenterade gränser — naket
  // «produktlansering»/«partnerskap»/«katalysatorkalendern» → basen ·
  // «s-kurvan» → tillväxtdjupet · «pipelinen» → sektorskola2 · «merger
  // arbitrage» → bokmastaren — starkord/TEXT, aldrig kärnord. RÄTTELSE av
  // fönster-28-raden: deras «1 (v17 kvar)» missade v16 — exakta slug-
  // verifiering visar BÅDA lösa; detta lager stänger kategorin helt. Anspråk
  // data/vakten/s6-u2-fonster29-ansprak.md FÖRE byggstart. 71:a motorn (av
  // 71), efter tvångsmekanik, FÖRE marknadsrytm — deras SIST-deklaration +
  // L01 (multipel-precedensen).
  { namn: "handelsemotor", fil: "ai-mentor-handelsemotor-fragor.ts", fn: "svaraLokaltHandelsemotor", arr: "HANDELSEMOTOR_MONSTER", antal: 2 },
  // 2026-09-20 fönster 30 (s6-u3, verktygsprefix _s6u3o29-): lönsamhetsgrund —
  // KATEGORISTÄNGNING LÖNSAMHET 9/12 → 12/12 via familjens tre sista lösa
  // kurser, TRE monsters: lönsamhetens grund (ln-05 primär, källor v07 +
  // v09 + ln-04 + roic-01; bageriets trappa 60/25/20/13,5 post för post ·
  // per styck 25 − 10 = 15 · kampanjen break-even +50 %, +20 % ⇒ 12) +
  // nästa kronas avkastning (roic-03 primär, källor roic-01 + ln-01 + ln-02
  // + mk-09; 15,0 döljer 8,0: 16/200, kombinerat 166/1 200 = 13,8, fyra år
  // 214/1 800 = 11,9 · inflationens minne 40/100 = 40,0 mot 40/250 = 16,0 ·
  // FCF 80/börsvärde 800 = 10,0) + värdeekvationen (roic-04 primär, källor
  // roic-01 + km-008 + vr-03 + ib-04; värdemultiplikatorn 30/8 = 3,75 ·
  // tvillingarna 0,2 × 30 = 0,6 × 10 = 6 % men FCF 80/40 · Gordon-P/E 21,2
  // mot 10,6). Sondens dokumenterade gränser (_s6u3o29-sond{,2}.mjs,
  // 48/53 NULL + 0 grannar + handelsemotor-grannkontroll 0): «hur mäts
  // lönsamhet?» → extra · «inflationens minne» → makro · «tillväxtens
  // tvillingar»/«multipelns pris på spridningen»/«negativt eget kapital»
  // → basen · «nya kronor mot bokförda» → extra · naket «roic»/«dupont»/
  // «wacc»/«nopat» → lonsamhetsdjupet · naket «multipel» → djup ·
  // «marginaltrappan» → volatilitetsmekaniken · «bruttomarginal»/«roe»
  // titelform → basens V-uppslag. Anspråk data/vakten/s6-u3-fonster30-
  // ansprak.md FÖRE byggstart. 72:a motorn, efter handelsemotor, FÖRE
  // marknadsrytm (deras SIST-deklaration + L01 — multipel-precedensen).
  { namn: "lonsamhetsgrund", fil: "ai-mentor-lonsamhetsgrund-fragor.ts", fn: "svaraLokaltLonsamhetsgrund", arr: "LONSAMHETSGRUND_MONSTER", antal: 3 },
  // 2026-09-20 fönster 29 (s6-u1): kemisektor — molekylens ekonomi (1 monster:
  // kemisektorn — kväve ur luft, fosfor ur berg, balanspriset). se-21 primär
  // (SEKTORANALYS:s sista lösa kurs ⇒ kategorin fullt mentorlänkad) +
  // källor se-16 + km-029 + ln-03 + mt-07. Aritmetiken: Norden Bulk
  // 12 000 × 18 % = 2 160 · Norden Special 3 000 × 38 % = 1 140 — 34,5 % av
  // parets bruttovinst på 20 % av omsättningen · ammoniaken 33 energienheter/
  // ton ⇒ gas 4/8/12 = 132/264/396 USD/ton · balanspriset: partnern 14/ton
  // mot lågkostnadens 278 (nitton gånger), pris 500 ⇒ −46/218. Sond C
  // (_s6u1o29c-sond.mjs): 20/20 kandidater NULL, 31 kärnord 0 grannar;
  // gränser i TEXT (fosfatbrottet → se-20 · varukorgen → km-045 · gasen →
  // km-043). TVIST-NOTIS: förstavalet v17 (anspråk 22:19:54) togs fysiskt
  // av s6-u2 (handelsemotor 22:24–22:25, anspråk 22:22:10) — lämnat helt;
  // v15-reserven död (basens nätverkseffekt-familj). Anspråk data/vakten/
  // s6-u1-fonster29-ansprak.md FÖRE byggstart. 73:e motorn, efter
  // lonsamhetsgrund, FÖRE marknadsrytm (deras SIST + L01).
  { namn: "kemisektor", fil: "ai-mentor-kemisektor-fragor.ts", fn: "svaraLokaltKemisektor", arr: "KEMISEKTOR_MONSTER", antal: 1 },
  // 2026-09-21 fönster 31 (manifest auto-s6-1789965330060) — TRE syskonlager
  // efter kemisektor, FÖRE marknadsrytm (deras SIST-deklaration + L01 —
  // multipel-precedensen). Raderna KONVERGERADE av s6-u2 efter fönstrets
  // yttre git-restore-race (trackade filer återtog äldre lägen flera
  // gånger; riskpremie-precedensen: bär syskonens rader tills deras egna
  // commits gör det — behåll EN av varje).
  // · stålsektor (s6-u1, _s6u1o31-): kapacitetens hävstång, malmen mot
  //   skrotet, förädlingstrappan — 1 monster, se-23 primär (registrets
  //   nyaste kurs; mentorn lär sig den samma dag den föds) + källor rk-15
  //   + vr-02 + se-20 + mt-05. Anspråk s6-u1-fonster31-ansprak.md.
  { namn: "stålsektor", fil: "ai-mentor-stalsektor-fragor.ts", fn: "svaraLokaltStalsektor", arr: "STALSEKTOR_MONSTER", antal: 1 },
  // · case-praktik (s6-u2, _s6u2o31-): PRAKTISKA CASE-familjens metodfrågor
  //   — 2 monsters: övningsbolaget («hur övar jag på riktiga bolag?» —
  //   pc-21 primär, källor pc-22 + pc-01 + bk-02 + portfolj-ekosystemet;
  //   Norra Verkstads AB 850 → 1 000 → 1 150, +17,6/+15,0 %, DuPont
  //   8,0 × 2,5 = 20,0, multipel 30/2,0 = 15,0, FCF 125 − 65 = 60,
  //   täckning 60/23 = 2,6; fyra stegen LÄSA/RÄKNA/TOLKA/DOKUMENTERA +
  //   caseloggen) + jämförelsecaset («hur jämför jag två bolag sida vid
  //   sida?» — pc-22 primär, källor pc-21 + pc-17 Sandvik + pc-13 SSAB +
  //   pc-20 Essity, kursernas egna par-lista; Södra Verktyg AB 660
  //   (+4,8 %), 99/660 = 15,0, 10,0 × 1,2 = 12,0, multipel 45/3,0 = 15,0
  //   IDENTISK med Norras — åtta av nio mått skiljer, det nionde
  //   sammanfaller; Mot vad-kolumnen + tre fällorna). Sond
  //   (_s6u2o31-sond{,2,3}.mjs): båda kanoniska NULL genom kedjan;
  //   gränser: «jämföra bolag» + «bolagsjämförelse» → avrakningsdjupet
  //   (rond 3-fångst, strukna) · naket «case» → case-motorn · «två
  //   aktier» → basen · «i samma bransch» → sektorn · «tvärsnittsanalys»
  //   → avkastningsdjupet — i TEXT, aldrig kärnord. Anspråk
  //   auto-s6-1789965330060-s6-u2-ansprak.md FÖRE byggstart 04:41 UTC.
  //   Aktiverar 6 mentorväglösa kurser (105 → 99).
  { namn: "casepraktik", fil: "ai-mentor-casepraktik-fragor.ts", fn: "svaraLokaltCasepraktik", arr: "CASEPRAKTIK_MONSTER", antal: 2 },
  // · beteendefallor (s6-u3, _s6u3o31-): KATEGORISTÄNGNING BETEENDEFINANS
  //   18/23 → 23/23 — 3 monsters: haloeffekten (bf-09 primär, källor
  //   bf-14 + km-019) + arbitragens gränser (bf-13 primär, källor bf-12 +
  //   km-019 + bf-17) + slumpens serier (bf-16 primär). Anspråk
  //   auto-s6-1789965330060-s6-u3-ansprak.md FÖRE byggstart.
  { namn: "beteendefallor", fil: "ai-mentor-beteendefallor-fragor.ts", fn: "svaraLokaltBeteendefallor", arr: "BETEENDEFALLOR_MONSTER", antal: 3 },
  // · kategoristängning (s6-u3 FÖRSÖK 2, _s6u3o32-): TRE kategoristängningar
  //   — 3 monsters: budprocessen (kt-09 primär, källor kt-02 + kt-04 +
  //   bf-12 + pe-04 ⇒ KATALYSATOR 12/12) + ekonomiska vinsten (roic-05
  //   primär, källor km-008 + roic-02 + ln-01 + vr-07 ⇒ LÖNSAMHET 13/13) +
  //   försäkringsskrivandet (od-09 primär, källor od-01 + am-09 + rk-12 +
  //   bf-16 ⇒ OPTIONS & DERIVAT 13/13). Anspråk
  //   auto-s6-1789965330060-s6-u3-ansprak-v2.md FÖRE byggstart (redispatch:
  //   försök 1:s beteendefallor levererat men kvitto-löst — deras rad ovan
  //   respekteras). GRÄNSER i TEXT: «budpremien» → handelsemotorn · naket
  //   «option» → nästa · «roic»/«wacc»/«nopat» → lonsamhetsdjupet ·
  //   «tidsvärde»/«inre värde» → optionsdjup/nästa.
  { namn: "kategoristangning", fil: "ai-mentor-kategoristangning-fragor.ts", fn: "svaraLokaltKategoristangning", arr: "KATEGORISTANGNING_MONSTER", antal: 3 },
  // 2026-09-21 omgång 33 (manifest auto-s6-1789999525797): banksektorn
  // (s6-u1, _s6u1o33-) — 1 monster: balansräkningen spegelvänd (se-24
  // primär — spår 5:s nyaste kurs, rs-09-precedensen; källor se-19 + ln-01
  // + ud-09 + vr-02 + st-04 + ma-08 + mt-05; källaktivering pc-03).
  // Översikt+djup-precedens som se-23/km-045: översiktsorden
  // («banksektorn»/«kreditförlust»/«kapitaltäckning»/«utlåning») ägs av
  // det tidiga sektorlagret — detta lager äger maskinens begrepp
  // (nätlånet, räntenätet, deposit-beta, K/I-talet,
  // kärnprimärkapitalrelationen, förlusttrapporna). 78:e motorn, FÖRE
  // marknadsrytm som förblir SIST.
  { namn: "banksektorn", fil: "ai-mentor-banksektor-fragor.ts", fn: "svaraLokaltBanksektorn", arr: "BANKSEKTOR_MONSTER", antal: 1 },
  // 2026-09-21 omgång 33 (manifest auto-s6-1789999525797): notläsning
  // (s6-u2, _s6u2o33-) — 2 monsters: skuggskulderna (st-07 primär —
  // källor km-004 + st-04 + st-06 + bk-06 + se-22 KÄLLAKTIVERING ⇒
  // STABILITET fullt mentorlänkad) + intäktredovisningen (bk-08 primär —
  // källor bk-02 + bk-05 + bk-06 + km-004 ⇒ BOKFÖRING & ÅRSREDOVISNING
  // fullt mentorlänkad). TVÅ KATEGORISTÄNGNINGAR. Kärnord disjunkta
  // (sond _s6u2o33-karnord.mjs: 0 kollisioner mot 2 017 kärnord + u1:s
  // kandidatlista). 79:e motorn, efter banksektorn, FÖRE marknadsrytm
  // som förblir SIST. Anspråk auto-s6-1789999525797-s6-u2-ansprak.md
  // FÖRE byggstart (od-10 lämnat åt u3 enligt deras anspråk — disk-först;
  // vr-09 nedlagt: varderjusteringens SOTP äger kärnordsfamiljen).
  { namn: "notlasning", fil: "ai-mentor-notlasning-fragor.ts", fn: "svaraLokaltNotlasning", arr: "NOTLASNING_MONSTER", antal: 2 },
  // 2026-09-22 omgång 34 (manifest auto-s6-1790029519192): nykull +3
  // (s6-u3, _s6u3o34-) — TRE KATEGORISTÄNGNINGAR på spår 5:s kurskull
  // 492→495: produktionsgapet (ma-09 primär ⇒ MAKROEKONOMI & RÄNTA fullt
  // mentorlänkad) — st-08:s PRIMÄR på u1:s källaktiverade kurs + under-
  // hållscapexet (ln-06 primär — LÖNSAMHET 13/15, roic-06 återstår öppet
  // bokförd). PIVOT: ränteswap-monstret (od-11) kasserades av u3 efter
  // u1:s parallella motor — u1:s kassationsnot i chat-widget.tsx bär den
  // öppna bokföringen (båda anspråk 00:30:12/00:30:25, u1:s v2 =
  // valideringsfönstret) — rs-09-precedensen, fönster-33-spegeln.
  // 82:a motorn i widgetens kedja, efter notlasning FÖRE nyfodda (deras
  // egen deklaration). MOTORDEF BARS av s6-u1 (v2) enligt riskpremie-
  // precedensen; kommentar kurerad av u3 (kvitto-commit) till pivot-
  // innehållet — radens position och antal (3) orörda.
  { namn: "nykull", fil: "ai-mentor-nykull-fragor.ts", fn: "svaraLokaltNykull", arr: "NYKULL_MONSTER", antal: 3 },
  // 2026-09-21 omgång 33 (manifest auto-s6-1789999525797): nyfodda +3
  // (s6-u3, _s6u3o33-) — TRE KATEGORISTÄNGNINGAR: kompetensparadoxen
  // (bf-18 primär, källor bf-16 + km-036 + ek-04 + km-016 ⇒ BETEENDEFINANS
  // 24/24) + kreditderivatet (od-10 primär, källor od-09 + ma-05 + ks-05 +
  // rs-03 ⇒ OPTIONS & DERIVAT 14/14) + avknoppningen (kt-10 primär, källor
  // km-012 + vr-09 + am-07 + kt-09 ⇒ KATALYSATOR 13/13). Spår 5:s tre
  // nyaste kurser (486→489, samtliga födda mentorväglösa — rs-09-
  // precedensen). Gränser: naket «kompetensillusion» → overmod-monstret
  // (beteendemekanik) · «kreditspread/kreditsprid» → kreditdjup · naket
  // «swap» → handelsdagens vwap (tav-1) · «pro rata» med mellanslag →
  // makrons ränta (tav-1 på «rata») — här sammanskrivna «prorata».
  // Kärnord disjunkta (sond _s6u3o33 rond 3: 0 kollisioner mot 2 147
  // kärnord i 78 lager). 81:a motorn, efter notlasning, FÖRE marknadsrytm
  // som förblir SIST. Anspråk auto-s6-1789999525797-s6-u3-ansprak.md FÖRE
  // byggstart (disk-först; u2 lämnade od-10 åt detta fönster).
  { namn: "nyfodda", fil: "ai-mentor-nyfodda-fragor.ts", fn: "svaraLokaltNyfodda", arr: "NYFODDA_MONSTER", antal: 3 },
  // 2026-09-22 omgång 34 (manifest auto-s6-1790029519192): ränteswap +1
  // (s6-u1, _s6u1o34-) KASSERAD FÖRE commit — u3:s anspråk (00:30:12)
  // nådde disk 12 s före u1:s (00:30:25) med od-11 som primär i deras
  // nykull-motor; filen raderad utan git-spör (Newmont/VZ-precedensen,
  // anspråket kvarstår som tidslinjebevis). Totalbilden för omgången
  // bokförs i valideringsfonster-raden nedan.
  // 2026-09-22 omgång 34 (manifest auto-s6-1790029519192): skuldordning +2
  // (s6-u2, _s6u2o34-) — KATEGORISTÄNGNING KAPITALSTRUKTUR 7/9 → 9/9:
  // senioritetsordningen (ks-09 primär — källor ks-03 + ks-05 + ks-06 +
  // rk-03 + st-07; trappan, konkursräkningen 389,2/377,2, klyftan 74,2 %
  // mot 20,7 % = 53,5 pp, yield-trappan 0,045×0,793≈3,6 pp, rekonstruktionen
  // 40 mot 20,7) + valutasäkringen i rapporten (ks-08 primär — källor od-07
  // + od-11 + ma-07 + km-058 + rk-07; terminen 11,50×1,040/1,025=11,67,
  // pengmarknadsbeviset 466,7/466,8, notens 78/0/100 %, premiens cykel
  // +6,8/−4,8 MSEK, sex fällor). RACE, slutlig bokföring: od-11 ägs av
  // u3:s NYKULL som primär (deras anspråk 00:30:12 vann disk-först; u1:s
  // konkurrerande ränteswap-bygge kasserat av dem själva — noten ovan);
  // od-11 här endast källa. Gränser i TEXT: naket
  // «valutasäkring» → valutamekanikens hedging-monster (banksektorn-
  // precedensen) · naket «termin» → nästa · «swap» → handelsdagen ·
  // «konkursprognos» → överlevnadsdjupet · «covenants» → ks-05:s ägare ·
  // «borgen» → notläsningen. Kärnord disjunkta (sond _s6u2o34-karnord.mjs,
  // 3 ronder: 0 kollisioner; «valutasäkring»-familjen medvetet lämnad åt
  // valutamekaniken, «valutanot» struket tav-1 mot portföljgrundens
  // «valutan»). 82:a motorn av 83, efter nyfodda, FÖRE
  // valideringsfönstret + marknadsrytm som förblir SIST. Anspråk
  // auto-s6-1790029519192-s6-u2-ansprak.md FÖRE byggstart (disk-först).
  { namn: "skuldordning", fil: "ai-mentor-skuldordning-fragor.ts", fn: "svaraLokaltSkuldordning", arr: "SKULDORDNING_MONSTER", antal: 2 },
  // 2026-09-22 omgång 34 (manifest auto-s6-1790029519192): valideringsfonster
  // +1 (s6-u1 v2, _s6u1o34b-) — labbets valideringsdisciplin: det rullande
  // fönstret som skiljer en modell som fungerar från en modell som minns
  // (ek-07 primär — EKOSYSTEM:s ENDA lösa kurs ⇒ kategorin fullt
  // mentorlänkad 11/11: ek-lärvägen 7/7 + fyra superdjup; källor
  // ek-familjen komplett ek-01…ek-06 + bf-18). Fönsterräkningen
  // (20 − 8) / 2 = 6 ·
  // effektiviteten 7,8/12 = 0,65 (trösklar 0,50/0,70; paren 3,4/4,0 = 0,85
  // robust men svag, 3,0/11 = 0,27 minne) · slumphärfånget 121 kombinationer
  // σ 4 % ⇒ +9,6 % (2,40σ), 343 σ 3 % ⇒ +8,3 % (2,76σ) · platån mot
  // nåltoppen (14 bäst, 13/15 nära; sekvenser 14,14,12,14,13,14 vs
  // 3,14,5,14,2,14) · affärerna 12,14,9,15,11,13 (median 12,5, tunnaste 9,
  // krav ≥ 10). V1-ANSPRÅKET (od-11-ränteswapen) KASSERAT: u3:s anspråk
  // 00:30:12 före u1:s 00:30:25 — Newmont/VZ-precedensen, filen raderad
  // utan git-spör, anspråket kvarstår som tidslinjebevis. Gränser:
  // «backtesten» + «monte carlo» → ekosystemdjupet · «standardavvikelsen»
  // → riskmåttsdjupet · «överanpassningen»/«kurvanpassning» → ek-04:s
  // deklarerade ägande (bärs i TEXT). Kärnord disjunkta (sond
  // _s6u1o34b-karnord.mjs v2, kommentar-strippad: 38 fria av 44 kandidater
  // mot 2 585 unika kärnord i 83 lager). 84:e motorn, efter skuldordning,
  // FÖRE marknadsrytm som förblir SIST.
  { namn: "valideringsfonster", fil: "ai-mentor-valideringsfonster-fragor.ts", fn: "svaraLokaltValideringsfonster", arr: "VALIDERINGSFONSTER_MONSTER", antal: 1 },
  // 2026-09-24 omgång 35 (manifest auto-s6-1790245511290): enhetsekonomi
  // (s6-u2, _s6u2o35-) — KATEGORISTÄNGNING TILLVÄXT (tx-06 + tx-07, kat-
  // egorins två sista mentorväglösa — sond _s6u1d-mentorlosa: 91 lösa,
  // TILLVÄXT exakt 2). 2 monsters: enhetsekonomin (tx-06 primär — källor
  // tx-05 + tx-03 + v02 + v19 + mt-05 + mt-03; fem talen CAC 600/ARPU
  // 100/kontribution 70/churn 3,5 %/payback 8,6 ⇒ LTV 70/0,035 = 2 000,
  // LTV/CAC 3,33, livslängd 28,6, årsbortfall 1−0,965¹² = 34,8 %,
  // diskonterat ≈ 1 630, tre liv 4 000/2 000/1 000 med nyckeltal
  // 6,67/3,33/1,67 vid IDENTISK payback 8,6, kassatrappan 1 000/mån ×
  // 600 = 600 000 ut, brytpunkt 8 571 kunder ≈ 10 mån, jämvikt 28 571
  // ≈ 2,0 Mkr/mån, spakarna 120 kr → 1,7 mån mot 1 400 → 20,0) +
  // konverteringstestet (tx-07 primär — källor tx-06 + tx-05 + tx-03 +
  // bk-08 + km-003; oms 200→240, EBITDA 96→120, tullen 18+12−6 = 24,
  // driftkassa 120−18−12+6−10−6 = 80, konvertering 0,67 mot 0,75,
  // tullens andel 24/40 = 60 %, marginalökning mot tull 24/24 = ett
  // till ett (brytpunkten), betalningstid 75→90 dagar, fordringar +44 %
  // mot omsättning +20 %, cykeln 90→118 (+28) med attribution till
  // kapitalbindningen, utmaningen 106/0,71 · 90 · 113). Gränser i TEXT:
  // «churn»/«churn rate» → sektordjup · naket «kundlivslängd» →
  // pe-mekaniken («fondlivslängd», tav 2) · «ltv inflationen» → makro ·
  // kassakonverteringscykeln/rörelsekapital → kapitalbindningen ·
  // ARR → v02 · bränntakten → v19 · redovisningskonsten → bk-08 ·
  // S-kurvan/mättnaden → tx-04. Kärnord disjunkta (sond _s6u2o35-sond:
  // 82 filer · 2 324 kärnord — kandidaterna renta, 3 dokumenterade
  // kasserade). 85:e motorn, efter valideringsfönstret, FÖRE marknadsrytm
  // som förblir SIST. Anspråk auto-s6-1790245511290-s6-u2-ansprak.md på
  // disk FÖRE byggstart.
  { namn: "enhetsekonomi", fil: "ai-mentor-enhetsekonomi-fragor.ts", fn: "svaraLokaltEnhetsekonomi", arr: "ENHETSEKONOMI_MONSTER", antal: 2 },
  // 2026-09-24 omgång 35: nätverkseffekter (s6-u1 v2, _s6u1o35-, PIVOT
  // efter kassationsracet: v1 krishantering pf-07 kasserad utan git-spör
  // — s6-u3:s anspråk 12:29:01 före mitt 12:31:31, Newmont/VZ-
  // precedensen; deras slutstenar tog roic-06 + pf-07 + rp-07) —
  // KATEGORISTÄNGNING MOAT 11/11 (v15, kategorins ENDA sista
  // mentorväglösa) + AKM1:S SISTA VARIABELKURS: med V15 är ALLA tjugo
  // variabelkurser (V01–V20) mentorlänkade — mentorn kan nu varenda
  // variabel i kundens egen modell. Territoriebevis: ingen av 84 lager
  // äger «nätverkseffekt»-familjen som kärnord (enda spåret i maskinen:
  // «nätverk» STARKORD i sektorskola2 — kan aldrig svara ensamt).
  // 1 monster: nätverkseffektens ekonomi (v15 primär — källor mt-01 +
  // mt-02 + mt-03 + mt-05 + mt-07 + mt-08; Metcalfes kraftlag n(n−1)/2:
  // 10/20/100/1 000/2 000 användare ⇒ 45/190/4 950/499 500/1 999 000
  // kopplingar — dubbla folk = fyrdubbla, fyra gånger = sextondubbla ·
  // Svea Handelsplats (påhittad tvåsidig): 200 × 800 = 160 000 mot
  // konkurrentens 400 × 400 = 160 000 — dubbla flaskhalsen: 400 × 800
  // = 320 000 · Metcalfe-klyftan (1,0/0,5)² = 4:1 → (1,05/0,45)² ≈
  // 5,4:1 efter ett års 10 %-flykt · tätheten 96/120 = 0,80 mot
  // 30/120 = 0,25 · avgiftstaket 1 % × 320 000 × 500 = 1,6 Mkr).
  // Gränser i TEXT: «moat»/«vallgraven» → moatdjup + basens moat-
  // monster · «moat-erosion»/«vallgravstestet» → mt-02 · «vallgraven i
  // siffror» → mt-03 · «byteskostnader»/«inlåsning» → mt-05 ·
  // «prisfullmakten» → mt-07 · «kostnadsöverlägsenhet» → mt-06 ·
  // «kvalitetspremien» → mt-08 · naket «plattform»/«ekosystem» →
  // ekosystemdjup + AKM1-familjen · naket «nätverk» → sektorskola2:s
  // starkord. Kärnord disjunkta (sond i två ronder, kommentar-strippad:
  // 20 kandidater + obestämda fraser mot 2 402 unika kärnord i 84
  // lager — ALLA fria). 85:e motorn, efter enhetsekonomi, FÖRE
  // marknadsrytm som förblir SIST. Anspråk auto-s6-krishantering-
  // s6u1-ansprak.md (v2 pivot) på disk FÖRE byggstart.
  { namn: "natverkseffekter", fil: "ai-mentor-natverkseffekter-fragor.ts", fn: "svaraLokaltNatverkseffekter", arr: "NATVERKSEFFEKT_MONSTER", antal: 1 },
  // 2026-09-24 omgång 35 (manifest auto-s6-1790245511290): slutstenarna +4
  // (s6-u3, _s6u3o35-) — FYRA KATEGORISTÄNGNINGAR, var och en sin kategoris
  // sista mentorväglösa kurs (sond _s6u3o35-sond: 86 lösa i 9 kategorier):
  // bankens lönsamhet (roic-06 ⇒ LÖNSAMHET 15/15 — mätningsbytet, Norra
  // Bank AB: soliditet 640/12 040 = 5,3 %, naiv ROIC 189/12 040 = 1,57 %,
  // grusmarginalen 495−162 = 333 = 2,8 %, DuPont 23,9 % × 0,041 × 18,8 ≈
  // ROE 18,3 %, förlustbågen 0,70 pp × 11 000 = 77 ⇒ 156→79 = −49 %,
  // riskvägda 2 450+4 000 = 6 450, kärnkapitalrelation 516/6 450 = 8,0 %,
  // C/I 300/489 = 61 %) + krishanteringen (pf-07 ⇒ PORTFÖLJHANTERING 15/15
  // — ÅTERTAGEN efter kassationsdubbelsegeln: u1:s v1 kasserad av dem då
  // s6-u3:s anspråk 12:28:37 vann deras 12:31:31, deras v2 = v15
  // nätverkseffekter; krischecklistan/korrelationsfallet/kris-
  // sensitivitetspoängen/triggervillkoren/förskjutna tiden, 2008–2009 som
  // fallstudie) + förlustavdraget (sj-07 primär + sj-06 KÄLLA ⇒ SKATT &
  // JURIDIK 7/7 — utjämningstrappan 20 000+30 000 = 50 000 fullt mot
  // förlust 60 000, rest 10 000 × 0,70 = 7 000, skattevärde 15 000+2 100 =
  // 17 100 mot fullt 18 000, kvoteringens pris 900; samma förlust 100 000:
  // onoterad/noterad-utan-underlag 70 000/21 000 mot med-underlag
  // 100 000/30 000; dagkvittning 400/600 ⇒ 200; återförvärv 10 000 bärs ⇒
  // 12 000−10 000 = 2 000, skatt 600 mot 3 600; medelvärde
  // (100×40+100×60)/200 = 50 ⇒ 100×(55−50) = 500; utmaningen 15 000+
  // 25 000 = 40 000 + 7 000 + onoterad 14 000 ⇒ (61 000)×0,30 = 18 300;
  // gåvan 50→120→130 ⇒ vinst 80 = 24,0/aktie) + väntat fall i svansen
  // (rp-07 ⇒ RISKHANTERING & PORTFÖLJTEORI 16/16 — (12+10+9+8+7)/5 = 9,2
  // mot VaR 7,0 = skillnad 2,2; VaR 99 −10/CVaR 99 −12; två obligationer
  // 0,96² = 0,9216/2×0,04×0,96 = 0,0768/0,0016: VaR 0+0 = 0 mot 100
  // (percentilfällan) men ES 80+80 = 160 mot 103,2 = (0,32+4,84)/0,05;
  // utmaningen 60+60 = 120 mot 101,8; tre portföljer rangvändningen VaR
  // 3-1-2 mot CVaR 2-1-3; normalfallet 12/√12 = 3,5, VaR 1,645×3,5 = 5,7,
  // CVaR 2,06×3,5 = 7,1). Gränser i TEXT: «riskvägda tillgångar» +
  // «banken/banker» → banksektorn + sektor (tav-1 på «bankens») · naket
  // «krishantering» → basens «riskhantering» (tav-2) · «kapitalvinst-
  // skatt» → km-051 · «utländsk källskatt»/«crypto»/«optionsbeskattning»
  // → skattedjupet · naket «fall» → nästa:s «call» (tav-1 — titelfrasens
  // risk dokumenterad) · «value at risk» → km-031:s ägare · «sharpe» →
  // rp-02 · «sekvensrisken» → pengarstid. Kärnord disjunkta (sond
  // _s6u3o35-sond-karnord rond 2+3: 0 kollisioner/0 grannar mot 83 motorer
  // — regexfynd: exakt-ett-mellanslag-mönstret missade 17 kolumnjusterade
  // MOTORDEFS-rader, \s+ krävs). 86:e motorn, efter nätverkseffekter,
  // FÖRE marknadsrytm som förblir SIST. Anspråk
  // auto-s6-1790245511290-s6-u3-ansprak.md FÖRE byggstart (12:28:37).
  { namn: "slutstenarna", fil: "ai-mentor-slutstenarna-fragor.ts", fn: "svaraLokaltSlutstenarna", arr: "SLUTSTENARNA_MONSTER", antal: 4 },
  // 2026-09-20 omgång 25: marknadsrytm (s6-u3, manifest auto-s6-1789864506792
  // — korrelationsrisk/kapitalcykeln/bull-bear, 3 monsters). MOTORDEF BÄRS
  // HÄR av s6-u2 enligt riskpremie-precedensen (u1 omgång 21: «motordef här
  // för G-fallets widget-spegling — kanoniska rader bärs av deras eget
  // leveranstest»): u3:s parallellprocess wireade widgeten men deras
  // MOTORDEFS-rad föll i fönstrets lost-update-race (deras skrivning av
  // denna fil bar en äldre läsning). BASF: deras modul, deras leverans —
  // denna rad existerar bara för att fall G ska spegla widgetens faktiska
  // komponentordning. Om u3:s commit bär sin egen rad: behåll EN.
  // S6-u2-försök-2-not: multipel wireas FÖRE denna — marknadsrytm förblir
  // SIST (65:e sedan omgång 26:s optionshantverk) enligt deras widget-
  // deklaration + testfall L01.
  // 2026-09-28 omgång 36 (s6-u3, manifest auto-s6-1790612726901): ägarslut —
  // ägarsidans tre läsningar: familjekontoret (ib-07 primär — tredje
  // ägarformen: 3,0 Mkr/200 Mkr = 1,5 % · 500/3 = 166,7 ⇒ 1,8 % · SFO/MFO)
  // ⇒ PRIVATE EQUITY & INVESTMENTBOLAG 17/17 STÄNGT med syskon u2:s ib-06 +
  // pe-08 (racet förlorat öppet: deras anspråk 16:32:31 < mitt 16:37:55 —
  // evighets-/avgiftsfamiljerna deras, pivothistorien i modulen) +
  // investmentbolagscaset (pc-04 primär — substansrabatt, kapitalåterföring,
  // värdefälla; PRAKTISKA CASEs första ägarsidescase) + ericssoncaset
  // (pc-10 primär — RAN, CFIUS, Open RAN, DCF-fällan). Gränser (rond 2+3):
  // «substansvärde»/«nav» → nästa · «portfölj» → basen · «telekom» →
  // sektorläsningen · «vad är ett X-case?» → case-motorn · evighets-/
  // avgiftsfamiljerna → u2:s privatkapital. EFTER slutstenarna, FÖRE
  // marknadsrytm (deras SIST). Anspråk
  // data/vakten/auto-s6-1790612726901-s6-u3-ansprak.md FÖRE byggstart.
  { namn: "ägarslut", fil: "ai-mentor-agarslut-fragor.ts", fn: "svaraLokaltAgarslut", arr: "AGARSLUT_MONSTER", antal: 3 },
  // 2026-09-28 fönster 36 (manifest auto-s6-1790612726901): årsreview +1
  // (s6-u1, _s6u1o36-) — KATEGORISTÄNGNING PORTFÖLJHANTERING 15/15: pf-12
  // årsrapportering — portfölj-review, kategorins ENDA mentorväglösa i
  // färsk sond _s6u1o36-sond.mjs (80 lösa i 5 kategorier; sondfynd: ALLA
  // kärnordsblock per fil måste läsas — 1 319 → 2 733 unika kärnord när
  // basens monsters togs med; sondfilen levereras med fönstret).
  // Portföljens årsreview (källor pf-01 + pf-04 + pf-05 + pf-06 + pf-07 +
  // pf-09 + pf-11): tidsvägd mot enkel avkastning, Nora Portfölj
  // [påhittad]: 200 000 + 50 000 halvårsinsättning ⇒ 262 000, vinst
  // 12 000 — enkel division 4,8/6,0 % men kedjad 1,030 × 1,024 = 1,0547 ⇒
  // +5,5 % mot benchmark +7,2 % = −1,7 pp; top-3-bidrag +23 100 brutto
  // mot −11 100 = 192 % av netto; viktavvikelsen 0,67 × 262 000 = 175 540
  // mot 0,60 × 262 000 = 157 200 ⇒ 18 340 kr; protokollets fem frågor +
  // AKM1-årsprovet + ritualens sju rader. Gränser i TEXT: «årsrapport»/
  // «årsredovisning»/«kvartalsrapport»/«bokslut» → basens rapport-monster
  // (BOLAGETS rapportläsning; tav 5 mot «årsrapportering» — aldrig stulen
  // fråga) · naket «rebalansering» → pf-04 · «tax-loss»/«förlustavdrag» →
  // pf-09/skattedjup · «sharpe» → rp-02 · «krischecklistan» → slutstenarnas
  // pf-07 (reviewn = dess lugna årsversion). Kärnord disjunkta (sond två
  // ronder: 25 kandidater mot 2 733 — 0 kollisioner, dokumenterad gräns
  // «årsrapport» → basen). EFTER slutstenarna/ägarslut, FÖRE marknadsrytm
  // som förblir SIST. Anspråk
  // auto-s6-1790612726901-s6-u1-ansprak.md FÖRE byggstart.
  { namn: "arsreview", fil: "ai-mentor-arsreview-fragor.ts", fn: "svaraLokaltArsreview", arr: "ARSREVIEW_MONSTER", antal: 1 },
  // 2026-09-28 omgång 41 (manifest auto-s6-1790612726901): faktorfadrarna (s6-u2
  // PIVOT 2, _s6u2o41-) — O'SHAUGHNESSYS BEVIS + DEN MAGISKA FORMELN
  // (what-works-on-wall-street + the-little-book-that-beats-the-market,
  // BOKMASTERs två faktorfäder 46 → 48 länkade; AK1TS lämnat — stub-mager
  // kursdata). 2 monsters: decilmetoden (1951–1996: Alla aktier 13,6 % mot
  // Stora 11,9; P/S decil 1 ≈16 % — 10 000 USD → 8,2 MUSD mot 3,1;
  // glansaktierna decil 10 knappt 5 %; tre proven logik/monotonitet/
  // stabilitet; Trending Value 17–20 % med jämnare kurva) + magiska
  // formeln (EBIT-avkastning 125/1 000 = 12,5 % mot 4; A/B-P/E-fällan
  // 13,3/20,0; ROIC-butikerna 20/10 % med 1,2^10 = 6,2 mot 2,6; rank-
  // exemplet 1+1 vinner; backtest 30,8 % mot 12,3 — 960 000 mot 76 000,
  // netto 18 % ⇒ 1,18^17 ≈ 16,7 = 167 000; årets hjul 20–30 positioner
  // à 3–3,5 %, 5–7/kvartal). Gränser i TEXT: «mr market» → grahamgolvet
  // · «faktorpremien» → faktordjupet · «värdefälla» → agarslut · naket
  // «ev/ebit» → redovisningsdjupets «ebit» · naket «p/s»/«p/e» →
  // multipel/pe-mekanik · «överreaktion» → förväntningsdjupet.
  // RACE-HISTORIK: rond 1 (ib-06+pe-08, klaim 16:32:31Z — 5:24 FÖRE s6-u3:s
  // 16:37:55Z) kasserad enligt rond-35-precedensen när u3:s agarslut (FULL
  // PE-stängning 17/17) wireades; bokföring i auto-s6-1790612726901-
  // s6-u2-ansprak.md. EFTER arsreview, FÖRE marknadsrytm som förblir SIST.
  { namn: "faktorfadrarna", fil: "ai-mentor-faktorfadrarna-fragor.ts", fn: "svaraLokaltFaktorfadrarna", arr: "FAKTORFADRARNA_MONSTER", antal: 2 },
  // 2026-09-28 v206-u1 (manifest v206-mega-kapacitet-1789637000): bokmastar2 —
  // BOKMASTER +2 monsters, data-djupmetodens två tyngsta lösa kurser (wc -c
  // på data/bokmaster/*.json): INTERMARKET-KEDJAN (intermarket-analysis primär
  // 137 453 byte + technical-analysis-financial-markets + the-visual-investor
  // + a-random-walk-down-wall-street + martin-pring-on-market-momentum — Murphy-
  // familjen + EMH-sidan) + STORHETSSPRÅNGET (good-to-great primär 130 341
  // byte + the-innovators-dilemma + competition-demystified + made-in-america
  // + shoe-dog + the-everything-store + zero-to-one). Böckernas EGNA tal i
  // svaren: Dow −22,6 % 19/10 1987 (100 → 77,4) · Nikkei 38 957 × 0,20 ≈
  // 7 790 medan statsobligationerna steg · guld 252 → 400 dollar = (400−252)
  // ÷ 252 = 0,587 = +58,7 % · matrisen obl–aktier +0,3..+0,6 (mittpunkt
  // +0,45), råvaror–obl −0,5..−0,7, dollar–råvaror −0,4..−0,6 · kvot-exempel
  // (påhittat) 264/114 = 2,32 = +16 % relativt · fönster 60–120 dagar ·
  // tratten 1 435 → 126 (8,8 %) → 19 → 11 (0,8 %) · 7x/15 år = 7^(1/15) =
  // 1,1385 = 13,9 %/år · Circuit City 18,5x = 18,5^(1/15) = 1,2148 = 21,5 %
  // /år · 11+11+6 = 28 · tio av elva VD:ar interna = 10/11 = 0,91 = 91 % mot
  // 6x externa · fyra år till igelkotten · tolv kvartal samriktade (övning).
  // 12 lösa BOKMASTER-kurser aktiverade (53 → 41 kvar). Kärnordsdisjunktion
  // 2 ronder (54 kandidater, sond + rågrep): 0 kollisioner. Gränser i TEXT:
  // «teknisk analys» → basen · «korrelationsrisken» → marknadsrytm ·
  // «valutarisk» → valutamekanik · «inflation»/«deflation» → makro ·
  // «råvaror» → etfmekanik · «moat» → moatdjup · naket «guld» lämnas öppet.
  // EFTER faktorfadrarna, FÖRE marknadsrytm som förblir SIST (90:e motorn).
  // Anspråk data/vakten/auto-v206-1789637000-u1-ansprak.md på disk FÖRE
  // byggstart (klaim-mtime 23:53:12Z, disk-först; race-fritt fönstret).
  { namn: "bokmastar2", fil: "ai-mentor-bokmastar2-fragor.ts", fn: "svaraLokaltBokmastar2", arr: "BOKMASTAR2_MONSTER", antal: 2 },
  // indexinklusion (2026-09-29 s6-u1, _s6u1o37_, nyföddaktivering —
  // kt-11-indexinklusionen primär [spår 5:s nyaste KATALYSATOR-kurs, född
  // 2026-09-29 av omgång 31, mentorlänkad samma dag, rs-09/se-24-
  // precedensen] + am-07 + am-02 + kt-01 + kt-02 + kt-03 + kt-05 + kt-09 +
  // ts-08 som källor ⇒ KATEGORISTÄNGNING KATALYSATOR 13/14 → 14/14, andra
  // stängningen; flödesräkneläran 48 000 × 0,80 = 38 400 · indexvikt
  // 38 400/3 840 000 = 1,0 % · köpbehov 0,22 × 38 400 = 8 448 Mkr =
  // 70,4 normaldagar · på 20 handelsdagar 422 Mkr/dag = 3,5× volymen ·
  // tre pulser: ryktets/tillkännagivandets/effektdagens (volymtopp UTAN
  // prisrörelse) · asymmetrin: uteslutningsspegeln djup endast vid
  // fundamental orsak (kt-09); kärnordsdisjunktion 3 ronder 57 kandidater
  // 0 kollisioner — gränser: naket «index»/«indexfond*» → praktik (deras
  // dokumenterade ägande; därför SAMMANSATTA kärnord: indexinklusion*,
  // indexvikt*, terminsstyrelse*) · «indexomläggning*»/«effektdag»/
  // «tillkännagivande» → etfmekanik · «flöde»-familjen → etfmekanik,
  // «float» → försäkring · naket «katalysator» → basen; 91:a motorn EFTER
  // bokmastar2, FÖRE marknadsrytm som förblir SIST; anspråk
  // data/vakten/auto-s6-1790670747-s6-u1-ansprak.md på disk FÖRE byggstart
  // (klaim 08:32 UTC, disk-först).
  { namn: "indexinklusion", fil: "ai-mentor-indexinklusion-fragor.ts", fn: "svaraLokaltIndexinklusion", arr: "INDEXINKLUSION_MONSTER", antal: 1 },
  // peibslutet (2026-09-29 s6-u3, manifest auto-s6-1790670317558 —
  // KATEGORISTÄNGNING PRIVATE EQUITY & INVESTMENTBOLAG 18/18: EVIGHETS-
  // KAPITALET [ib-06 primär — tidens tre utfall 8 %/år i 40 år: 1,08^40 =
  // 21,7× · (1,08^10 × 0,90)^4 = 1,943^4 = 14,3× (52 % lägre) · tids-
  // stressad 1,08^30 × (1,08^9 × 0,80) = 16,1×; tre friheter mot tre
  // ofriheter; källor pe-06/pe-02/pe-05/ib-05/ib-03/km-067 +
  // the-intelligent-asset-allocator] + AVGIFTSMASKINEN [pe-08 primär —
  // Nordisk Kurs I (påhittad): fasta hjulet 2 % av förbandet 1 000 =
  // 20/år (år ett: 800 investerat men avgift 20 mot 16), 8 × 20 = 160 =
  // 16 %; plant läge 840 = −16 %; trappan på 1 700: 1 000 → tröskel 400
  // (enkel 5 × 8 %; ränta-på-ränta 1,08^5 = 1,4693 ⇒ 469) → uppfångst
  // 100 (X = 0,20 × (400 + X) ⇒ X = 100; utan 60 = 8,6 %) → 200 delade
  // 160/40; carry 140 = 20,0 % av 700, LP 1 560 + 140 = 1 700 stänger;
  // netto-kvot 140/560 = 25,0 %; clawback 140 − 0,20 × 500 = 40, deal-
  // för-deal 60 − 20 = 40 sex år tidigare; källor pe-02/pe-06/pe-07/
  // pe-01/ib-05/rk-16] + UTDELNINGSREKAPITALISERINGEN [pe-09 primär —
  // Stenbro/Norra Trä (påhittade): köp EV 1 200 = 8,0× EBITDA 150, lån
  // 720 (60 %), EK 480; år 3 EBITDA 180/skuld 640 = 3,6×; nytt lån 6,0 ×
  // 180 = 1 080 ⇒ 440 ut, täckning 4,33 → 2,56 (ränta 41,6 → 70,2);
  // IRR-magin: utan rekap −480 → +960 MOIC 2,00/IRR 14,9 % mot med rekap
  // −480 → +440 år 3 → +520 år 5 MOIC 2,00/IRR 18,9 % — +4,0 pp av
  // klockan ensam; riskflyttet 480 → 40 per hundra; källor pe-02/pe-03/
  // pe-08/st-01/st-02/st-05/ud-08]. u2:s omgång-41-rond-1-val (ib-06 +
  // pe-08) KASSERAT av dem själva och aldrig byggt — deras worklog bokför
  // ytan öppen ("vilande anspråk på övergivna ytor gäller inte"); pe-09
  // är spår 5:s nyaste PE-kurs (född 2026-09-29, d105da81 —
  // rs-09-precedensen). Kärnordsdisjunktion (sond _s6u3-karnord: 2 879
  // levande kärnord, 4 kollisioner kurerade) — gränser: «vattenfallet»/
  // «carried interest»/«carry»/«irr»/«dpi»/«fondlivslängden» → pe-mekanikens
  // KÄRNORD (pe-02:s värld; kurserna pe-08/pe-09 äger aritmetiken, här nås
  // den via fördelningstrappan/tröskeln/uppfångsten/irr-magin) ·
  // «spärrkonto» → tav-1 mot banksektorns «sparkontot» (endast text) ·
  // «kostnadstrappan» → ib-05 · «familjekontoret» → agarslut ·
  // «refinansieringsmuren» → st-05 · «covenanter» → ks-05 ·
  // «extrautdelningar» → ud-08. 92:a motorn EFTER indexinklusion, FÖRE
  // marknadsrytm som förblir SIST; anspråk
  // data/vakten/auto-s6-1790670317558-s6-u3-ansprak.md på disk FÖRE
  // byggstart (klaim ~08:5x UTC, disk-först).
  { namn: "peibslutet", fil: "ai-mentor-peib-slutet-fragor.ts", fn: "svaraLokaltPeibSlutet", arr: "PEIB_SLUTET_MONSTER", antal: 3 },
  // aterstangning (2026-09-29 s6-u2, _s6u2o38_, fönster 38 — ÅTERSTÄNG-
  // NINGEN: TVÅ kategoristängningar i ett lager, spår 5:s omgång-31-
  // nyfödda mentorlänkade samma vecka de föddes (rs-09-precedensen;
  // anspråk data/vakten/s6-u2-fonster38-ansprak.md på disk FÖRE
  // byggstart, klaim 08:54:35 UTC, disk-först): ENHETSMULTIPLN [vr-10
  // primär ⇒ KATEGORISTÄNGNING VÄRDERING 10/11 → 11/11 (andra
  // stängningen — första vid vr-09, spår 5:s nyfödd återöppnade) —
  // gruvans ton: etikett 2 000 kr/KAPACITETston (20 000/10,0 = 25 000/
  // 12,5) men uttagning 90/70 % ⇒ 20 000/9,0 = 2 222 mot 25 000/8,75 =
  // 2 857 kr per PRODUCERAD ton (knappt 29 %) och med C1 400/450 vid
  // malmpris 600 ⇒ EBITDA 9,0 × 200 = 1 800 mot 8,75 × 150 = 1 312,5 ⇒
  // EV/EBITDA 11,1 mot 19,0 (70 % på samma etikett); abonnenten 4 000
  // kr/st (10 000/2,5 = 6 000/1,5) men ARPU 60/45 med churn 1,2/2,0 % ⇒
  // livstid 1/0,012 = 83 mot 1/0,020 = 50 mån ⇒ livstidsintäkt ≈ 5 000
  // mot 2 250 kr; kilowattimmen 12 000 kr/INSTALLERAD kW men kapacitets-
  // faktor 40/25 % ⇒ 3 504 mot 2 190 GWh ⇒ 3,42 mot 5,48 kr per LEVERERAD
  // kWh (60 % på samma skylt); fyra fällor (heterogeniteten, marginal-
  // fällan, döda enheten, överbyggd kapacitet) + tre bryggor (vr-03/vr-06
  // EV/EBITDA-vägen · vr-08 Q per enhet · tx-06 kundens sidan); källor
  // vr-03/vr-06/vr-08/tx-06/se-20/se-21/se-18/am-08] + EX-DAGENS MEKANIK
  // [ud-10 primär ⇒ KATEGORISTÄNGNING UTDELNINGSSTRATEGI 10/11 → 11/11
  // (andra stängningen — första vid ud-09) — Lindvalls Livs AB (påhittat):
  // teoretisk ex-kurs 120,00 − 4,50 = 115,50 (utdelningen tas UR kursen:
  // 4,50/120,00 = 3,75 %), frukosthandeln 100 aktier: 12 049 in mot
  // 11 951 ut = −98 kr = −0,82 % = exakt de två courtagen (2 × 49), den
  // korta positionen erlägger 25 × 4,50 = 112,50, prisindex faller/
  // totalavkastningsindex räknar tillbaka, T+2 ⇒ ex-dagen en bankdag
  // före avstämningsdagen; mekanik mot budskap]. Kärnordsdisjunktion
  // (sond _s6u2o38: 2 656 levande kärnord ur 91 lager, 56 kandidater —
  // M1 0 kollisioner; M2:s nakna «ex-dag»/«ex-dagen»/«avstämningsdag»
  // ägs av utdelningskalender-lagret (ud-07:s dokumenterade datumägande)
  // ⇒ kurerat med SAMMANSATTA kärnord: teoretisk ex-kurs*/ex-kurs*/
  // ex-spärren/äganderättsdag*/frukosthandeln/utdelningsjusteringen) —
  // övriga gränser: «CAC»/«LTV» → tx-06 · «tobins q» → vr-08 · naket
  // «ton» → se-20/se-21 · «kortläge» → am-06 · «pariteten» → od-05 ·
  // «indexomläggning» → am-07 · «isk» → km-052. 93:e motorn EFTER
  // peibslutet, FÖRE marknadsrytm som förblir SIST.
  { namn: "aterstangning", fil: "ai-mentor-aterstangning-fragor.ts", fn: "svaraLokaltAterstangning", arr: "ATERSTANGNING_MONSTER", antal: 2 },
  { namn: "marknadsrytm", fil: "ai-mentor-marknadsrytm-fragor.ts", fn: "svaraLokaltMarknadsrytm", arr: "MARKNADSRYTM_MONSTER", antal: 3 },
];

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of MOTORDEFS) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn], monster: modul[d.arr] });
}
const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 237 (2026-09-29 s6-u2, _s6u2o38_, fönster 38: aterstangning +2 [ÅTERSTÄNGNINGEN — TVÅ KATEGORISTÄNGNINGAR I ETT LAGER: vr-10 ENHETSMULTIPLAR ⇒ VÄRDERING 11/11 + ud-10 EX-DAGENS MEKANIK ⇒ UTDELNINGSSTRATEGI 11/11, båda spår 5:s omgång-31-nyfödda mentorlänkade samma vecka (rs-09-precedensen); gruvans ton 2 000 kr/kapacitetston men 2 222/2 857 producerad och EV/EBITDA 11,1/19,0 · abonnenten 4 000 kr men livstid 83/50 mån ⇒ 5 000/2 250 · kilowattimmen 12 000 kr/kW men 3,42/5,48 levererad · Lindvalls Livs 120,00 − 4,50 = 115,50, frukosthandeln −98 kr = −0,82 % = två courtagen, korta 25 × 4,50 = 112,50; M2:s nakna ex-dag-ord kurerade till sammansatta (ud-07 äger datumen); 93:e motorn efter peibslutet, FÖRE marknadsrytm som förblir SIST; anspråk s6-u2-fonster38-ansprak.md FÖRE byggstart — detaljer i motordef-raden]. Tidigare 235 (2026-09-29 s6-u3, manifest auto-s6-1790670317558: peibslutet +3 [KATEGORISTÄNGNING PRIVATE EQUITY & INVESTMENTBOLAG 18/18 — EVIGHETSKAPITALET (ib-06) + AVGIFTSMASKINEN (pe-08) + UTDELNINGSREKAPITALISERINGEN (pe-09): u2:s omgång-41-rond-1-val kasserat av dem själva och aldrig byggt (yta öppen enligt deras egen worklog), pe-09 = spår 5:s nyaste PE-kurs (rs-09-precedensen); tidens tre utfall 21,7×/14,3×/16,1× · trappan 1 000→400→100→160/40 med carry 140 = 20,0 % av 700 och netto-kvot 140/560 = 25,0 % · IRR-magin 14,9 %→18,9 % vid oförändrad MOIC 2,00; gränser: «vattenfallet»/«carry»/«irr»/«dpi» → pe-mekaniken · «spärrkonto» → banksektorn (tav-1) · «kostnadstrappan» → ib-05 · «familjekontoret» → agarslut; 92:a motorn efter indexinklusion, FÖRE marknadsrytm som förblir SIST; anspråk auto-s6-1790670317558-s6-u3-ansprak.md FÖRE byggstart — detaljer i motordef-raden]. Tidigare 232 (2026-09-29 s6-u1, _s6u1o37_, nyföddaktivering: indexinklusion +1 [INDEXINKLUSIONEN — kt-11 primär, spår 5:s nyaste KATALYSATOR-kurs född 2026-09-29, mentorlänkad samma dag; KATEGORISTÄNGNING KATALYSATOR 13/14 → 14/14 (andra stängningen); 91:a motorn efter bokmastar2, FÖRE marknadsrytm som förblir SIST; detaljer i motordef-raden]. Tidigare 231 (2026-09-28 v206-u1, manifest v206-mega-kapacitet-1789637000: bokmastar2 +2 [INTERMARKET-KEDJAN + STORHETSSPRÅNGET — data-djupmetodens två tyngsta lösa BOKMASTER-kurser: intermarket-analysis 137 453 byte + good-to-great 130 341 byte som primära; 12 lösa kurser aktiverade 53 → 41 kvar; kärnordsdisjunktion 2 ronder 0 kollisioner; 90:e motorn efter faktorfadrarna, FÖRE marknadsrytm som förblir SIST; anspråk auto-v206-1789637000-u1-ansprak.md 23:53:12Z FÖRE byggstart — detaljer i motordef-raden]. Tidigare 229 (2026-09-28 omgång 41: faktorfadrarna +2 [s6-u2 PIVOT 2, _s6u2o41-, manifest auto-s6-1790612726901 — O'SHAUGHNESSYS BEVIS (what-works-on-wall-street) + DEN MAGISKA FORMELN (the-little-book-that-beats-the-market): BOKMASTERs två faktorfäder; rond-1-racet (ib-06+pe-08) viket åt u3:s agarslut enligt rond-35-precedensen — klaim-mtime-bokföring i anspråksfilen; 89:e motorn efter arsreview, FÖRE marknadsrytm som förblir SIST]. Tidigare 227 (2026-09-28: agarslut +3 [s6-u3:s FULLA PE-kategoristängning 17/17] + arsreview +1 [s6-u1:s PORTFÖLJHANTERING 15/15]) (2026-09-28 fönster 36: årsreview +1 [s6-u1, _s6u1o36-, manifest auto-s6-1790612726901 — KATEGORISTÄNGNING PORTFÖLJHANTERING 15/15: pf-12 årsrapportering — portfölj-review, kategorins enda mentorväglösa i färsk sond _s6u1o36; källor pf-01/04/05/06/07/09/11; tidsvägd 1,030 × 1,024 = 1,0547 ⇒ +5,5 % mot benchmark +7,2 % = −1,7 pp, top-3 192 % av netto, rebalansering 18 340 kr; gräns «årsrapport» → basens rapport-monster; efter slutstenarna/ägarslut, FÖRE marknadsrytm SIST; anspråk auto-s6-1790612726901-s6-u1-ansprak.md FÖRE byggstart] · ägarslut +3 [s6-u3, samma fönster — ib-07 ⇒ PRIVATE EQUITY & INVESTMENTBOLAG 17/17 med u2:s ib-06+pe-08; deras motordef-rad ovan]). Tidigare 223 (2026-09-24 omgång 35: slutstenarna +4 [s6-u3, _s6u3o35-, manifest auto-s6-1790245511290 — FYRA KATEGORISTÄNGNINGAR: roic-06 ⇒ LÖNSAMHET 15/15 + pf-07 ⇒ PORTFÖLJHANTERING 15/15 (ÅTERTAGEN efter kassationsdubbelsegeln: u1:s v1 kasserad åt detta lager, deras v2 = v15) + sj-07+sj-06 ⇒ SKATT & JURIDIK 7/7 + rp-07 ⇒ RISKHANTERING & PORTFÖLJTEORI 16/16; detaljer i motordef-raden; 86:e motorn efter nätverkseffekter, FÖRE marknadsrytm som förblir SIST; anspråk auto-s6-1790245511290-s6-u3-ansprak.md 12:28:37 FÖRE byggstart] · nätverkseffekter +1 [s6-u1 v2, _s6u1o35-, PIVOT efter kassationsracet: v1 krishantering pf-07 kasserad — s6-u3:s anspråk 12:29:01 före mitt 12:31:31, Newmont/VZ-precedensen] — KATEGORISTÄNGNING MOAT 11/11 (v15) + AKM1:S SISTA VARIABELKURS: med V15 är ALLA 20 variabelkurser V01–V20 mentorlänkade; källor mt-01/02/03/05/07/08; Metcalfe n(n−1)/2: 45/190/4 950/499 500/1 999 000, tvåsidiga 200 × 800 = 160 000 → 400 × 800 = 320 000, klyftan 4:1 → 5,4:1, tätheten 0,80 mot 0,25, avgiftstaket 1,6 Mkr; 85:e motorn efter enhetsekonomi, FÖRE marknadsrytm som förblir SIST; syskonet s6-u3:s slutstenar LANDADE +4 i motordef-raden ovan (plan +3, pf-07 återtagen efter detta lagrets kassationsnot = +4)]. Tidigare 218 (2026-09-24 omgång 35, manifest auto-s6-1790245511290 — enhetsekonomi +2 [s6-u2, _s6u2o35-: KATEGORISTÄNGNING TILLVÄXT — tx-06 enhetsekonomin (fem talen CAC 600/ARPU 100/kontribution 70/churn 3,5 %/payback 8,6 ⇒ livslängd 28,6 mån, LTV 70/0,035 = 2 000, LTV/CAC 3,33, årsbortfall 34,8 %, diskonterat ≈ 1 630, tre liv 4 000/2 000/1 000 med nyckeltal 6,67/3,33/1,67 vid identisk payback, kassatrappan 600 000 ut/brytpunkt 8 571 kunder ≈ 10 mån/jämvikt 28 571 ≈ 2,0 Mkr/mån) + tx-07 konverteringstestet (oms 200→240, EBITDA 96→120, tull 18+12−6 = 24, driftkassa 80, konvertering 0,67 mot 0,75, tullens andel 60 %, marginalökning mot tull 24/24 = ett till ett, betalningstid 75→90 dagar, fordringar +44 % mot omsättning +20 %, cykeln 90→118 med attribution till kapitalbindningen); 85:e motorn efter valideringsfönstret, FÖRE marknadsrytm som förblir SIST; anspråk auto-s6-1790245511290-s6-u2-ansprak.md FÖRE byggstart]). Tidigare 216 (2026-09-22 omgång 34, manifest auto-s6-1790029519192 — TRE syskonleveranser + EN kassation: nykull +3 [s6-u3, _s6u3o34-, PIVOT v2 efter kassationsracet: produktionsgapet ma-09 ⇒ KATEGORISTÄNGNING MAKROEKONOMI & RÄNTA 14/14 + bindningsrisken st-08 PRIMÄR (u1:s källaktiverade kurs — låntagarens stol; spegelgräns mot u1:s rivna swap-motor enligt kursens kap 5) + underhållscapexet ln-06 (nyföddaktivering, LÖNSAMHET 13/15 — roic-06 öppet bokförd kvar); ränteswap-monstret kasserat utan git-spör av u3 när u1:s motor nådde disk först i tron att klaimen var deras — bådas bokföring konvergerad: od-11 källaktiverat ×2 (skuldordning + bindningsrisken), primär förblir ledig för nästa omgång; 82:a motorn efter notlasning FÖRE nyfodda; motordef bärs av s6-u1 v2 enligt riskpremie-precedensen — u3:s kvitto kurade beskrivningen, raden/antalet orörda] + skuldordning +2 [s6-u2, _s6u2o34-: senioritetsordningen ks-09 + valutasäkringen ks-08 — KATEGORISTÄNGNING KAPITALSTRUKTUR 9/9; od-11 här endast källa (deras race-not); 83:e motorn] + valideringsfonster +1 [s6-u1 v2, _s6u1o34b-: walk-forward ek-07 — KATEGORISTÄNGNING EKOSYSTEM 11/11 (ek-lärvägen 7/7 + fyra superdjup), plattformens egen familj komplett; 84:e motorn efter skuldordning, FÖRE marknadsrytm som förblir SIST] + KASSATION [s6-u1 v1: ränteswap od-11 — u3:s anspråk 00:30:12 nådde disk 12 s FÖRE u1:s 00:30:25 med od-11 som primär i nykull-motorn; u1:s motor raderad utan git-spör, Newmont/VZ-precedensen, anspråksfilen kvarstår som tidslinjebevis]). Tidigare 210 (2026-09-21 omgång 33: nyfodda +3 [s6-u3, _s6u3o33-, manifest auto-s6-1789999525797 — TRE KATEGORISTÄNGNINGAR: kompetensparadoxen (bf-18 primär, källor bf-16 + km-036 + ek-04 + km-016 ⇒ BETEENDEFINANS 24/24) + kreditderivatet (od-10 primär, källor od-09 + ma-05 + ks-05 + rs-03 ⇒ OPTIONS & DERIVAT 14/14) + avknoppningen (kt-10 primär, källor km-012 + vr-09 + am-07 + kt-09 ⇒ KATALYSATOR 13/13); spår 5:s tre nyaste kurser 486→489 aktiverade (rs-09-precedensen); 81:a motorn efter notlasning, FÖRE marknadsrytm som förblir SIST]. Tidigare 207 (2026-09-21 omgång 33: notläsning +2 [s6-u2, _s6u2o33-, manifest auto-s6-1789999525797 — skuggskulderna (st-07 primär, källor km-004 + st-04 + st-06 + bk-06 + se-22 KÄLLAKTIVERING) + intäktredovisningen (bk-08 primär, källor bk-02 + bk-05 + bk-06 + km-004): TVÅ KATEGORISTÄNGNINGAR — STABILITET + BOKFÖRING & ÅRSREDOVISNING fullt mentorlänkade; 79:e motorn efter banksektorn, FÖRE marknadsrytm som förblir SIST]. Tidigare 205 (2026-09-21 omgång 33: banksektorn +1 [s6-u1, _s6u1o33-, manifest auto-s6-1789999525797 — balansräkningen spegelvänd: se-24 primär (spår 5:s nyaste kurs, rs-09-precedensen; källor se-19 + ln-01 + ud-09 + vr-02 + st-04 + ma-08 + mt-05; källaktivering pc-03); 78:e motorn efter kategoristängning, FÖRE marknadsrytm som förblir SIST]. Tidigare 204 (2026-09-21 fönster 32: kategoristängning +3 [s6-u3 FÖRSÖK 2, _s6u3o32-, redispatch: budprocessen (kt-09 primär) + ekonomiska vinsten (roic-05) + försäkringsskrivandet (od-09) — TRE kategoristängningar: KATALYSATOR 12/12 + LÖNSAMHET 13/13 + OPTIONS & DERIVAT 13/13; 77:e motorn efter beteendefallor, FÖRE marknadsrytm som förblir SIST — u3-försök-1:s beteendefallor redan i trädet, kvitto-löst]. Tidigare 201 (2026-09-21 fönster 31, manifest auto-s6-1789965330060 — TRE syskonlager efter kemisektor, FÖRE marknadsrytm som förblir SIST [76:e av 76]: stålsektor +1 [s6-u1: kapacitetens hävstång, se-23 primär — registrets nyaste kurs] + case-praktik +2 [s6-u2: övningsbolaget + jämförelsecaset — pc-21/pc-22 primära, PRAKTISKA CASE-familjens metodfrågor, 6 mentorväglösa kurser aktiverade 105 → 99] + beteendefallor +3 [s6-u3: kategoristängning BETEENDEFINANS 18/23 → 23/23 — haloeffekten + arbitragens gränser + slumpens serier]; raderna konvergerade av s6-u2 efter fönstrets yttre git-restore-race). Tidigare 195 (2026-09-20 fönster 29: kemisektor +1 — kategoristängning SEKTORANALYS 31/32 → 32/32: kemisektorn — molekylens ekonomi (se-21 primär — kväve ur luft, fosfor ur berg, balanspriset; källor se-16 + km-029 + ln-03 + mt-07) (s6-u1, verktygsprefix _s6u1o29-, efter tvist: v17 togs fysiskt av s6-u2, v15-reserven basens), 73:e motorn efter lonsamhetsgrund FÖRE marknadsrytm som förblir SIST [73:e av 73]. Tidigare 194 (2026-09-20 fönster 30: lönsamhetsgrund +3 — kategoristängning LÖNSAMHET 9/12 → 12/12: lönsamhetens grund (ln-05 primär, källor v07 + v09 + ln-04 + roic-01) + nästa kronas avkastning (roic-03 primär, källor roic-01 + ln-01 + ln-02 + mk-09) + värdeekvationen (roic-04 primär, källor roic-01 + km-008 + vr-03 + ib-04) (s6-u3, verktygsprefix _s6u3o29-), 72:a motorn efter handelsemotor FÖRE marknadsrytm som förblir SIST [72:a av 72]. Tidigare 191 (2026-09-20 fönster 29: händelsemotor +2 — lanseringsdramat (v16 primär, källor kt-04 + v13 + v01 + kt-05) + avtalsmekaniken (v17 primär, källor v03 + kt-07 + am-01 + v16) (s6-u2, verktygsprefix _s6u2o29-), aktiverar v16 + v17 ⇒ KATALYSATOR fullt länkad 11/11 (kategoristängning — fönster-28-radens «1 (v17 kvar)» rättad: BÅDA var lösa), 71:a motorn efter tvångsmekanik FÖRE marknadsrytm som förblir SIST [71:a av 71]. Tidigare 189 (2026-09-20 fönstret efter omgång 27: tvångsmekanik +2 — kontraktet som säljer åt dig och kalendern som flyttar kursen: marginalhandeln (am-09 primär, källor km-030 + mk-04 KÄLLAKTIVERING + bf-15 + am-01) + optionsförfallets dag (kt-08 primär, källor km-059 + am-05 + kt-03 KÄLLAKTIVERING + od-01) (s6-u2, verktygsprefix _s6u2o28-), aktiverar am-09 ⇒ AKTIEMARKNADEN I PRAKTIKEN fullt länkad (sista lösa kursen) + mk-04 ⇒ MAKROEKONOMI fullt länkad + kt-08/kt-03 ⇒ KATALYSATOR 3 lösa → 1 (v17 kvar), 70:e motorn efter co-invest FÖRE marknadsrytm som förblir SIST [70:e av 70]. Tidigare 187 (2026-09-20 manifest auto-s6-1789912510460: co-invest +1 — andelen bredvid fonden: två biljetter/urvalsasymmetrin/break-even 1,76x (s6-u1, v2 efter nedställning av v1 marginalhandeln till s6-u2), aktiverar pe-07 ⇒ PRIVATE EQUITY & INVESTMENTBOLAG fullt länkad 14/14 + pe-04 källaktivering, 69:e motorn efter volatilitetsmekanik FÖRE marknadsrytm som förblir SIST [69:e av 69]. Tidigare 186 (2026-09-20 manifest auto-s6-1789912510460: modernarisk +3 — regulatorisk risk + GDPR/datarisk + ESG-risk, s6-u3, TREDJE motorn FÖRE basen, 68-motorläget. Tidigare 183 (2026-09-20 omgång 27: volatilitetsmekanik +2 — varifrån bruset kommer och vad det kostar: volatilitetsdraget (rp-06 primär, källor rp-04 + rp-05) + marginaltrappan (ln-03 primär, källor ln-01 + v07) (s6-u2, manifest auto-s6-1789912510460), aktiverar rp-06 + ln-03, 66:e motorn efter pengarstid FÖRE marknadsrytm som förblir SIST [66:e av 67]; återapplicering efter syskons fullträdsåterställning). Tidigare 181 (2026-09-20 omgång 26: pengarstid +2 — pengarnas tid och ordning: andrahandsmarknaden (pe-05 primär, källor pe-06 J-kurvan + ib-05 kostnadstrappan) + sekvensrisken (rp-05 primär, källor rp-04 + ek-04) (s6-u2 fönster 3, manifest auto-s6-1789890903364), aktiverar pe-05/pe-06/ib-05 + rp-05 = PRIVATE EQUITY & INVESTMENTBOLAG 13/13 + RISKHANTERING & PORTFÖLJTEORI 14/14, 66:e motorn FÖRE marknadsrytm som förblir SIST [66:e av 66]; optionshantverk +3 — binomialträdet m.fl. (s6-u3), 64:e motorn FÖRE marknadsrytm som förblir SIST [65:e]; balansdjup +2 — lagervärderingen + obeskattade reserver (s6-u2, manifest auto-s6-1789890903364), aktiverar bk-07 + bk-06 = BOKFÖRING & ÅRSREDOVISNING fullt länkad 19/19, 63:e motorn FÖRE marknadsrytm som förblir SIST [64:e]; riskadress +1 — riskens adresser: leverantörsrisken + modellrisken + personalrisken ovanpå anatomi-kartan, aktiverar rs-06/07/08/09, 62:a motorn (s6-u1). Omgång 25: multipel +2 — P/S-talet + P/B-talet, grundmultiplarna (s6-u2 försök 2), 61:a motorn FÖRE marknadsrytm som förblir SIST (62:a — deras SIST-deklaration); marknadsrytm +3 — korrelationsrisk/kapitalcykeln/bull-bear (u3:s, motordef harmoniserad av s6-u2); kontrahent +2 — motparten/nettingen + clearinghuset/trappan, 60-motorläget; etfmekanik +1 — korgen/skapelsen/arbitraget/indexomläggningen, 59-motorläget, 166 monsters. 2026-09-19 våg 210: valutamekanik +10 — 58-motorläget, 165 monsters. Omgång 24: nya territorier +3 — aktivisten + guidningen + bostadsmekaniken/demografin, 57-läget; moatdjup +2 — prisfullmakten + byteskostnaderna, 56-läget; försäkring +2 — combined ratio/floaten + krypto, 55-läget. KOMMENTARBAS RÄTTAD här: omgång 23:s «138» förglömmde våg 189:s marknadsmekanik +10 — verkligt 54-läge var 148, varför 55/56/57-lägena är 150/152/155, inte 140/142/145; antal-fälten i MOTORDEFS har alltid varit sanna, endast kommentarsiffrorna ärvde fel bas. Omgång 23: sektorläsning +2, vardegrund +3, realekonomi +1 — 53-läget; omgång 22: faktordjup +1, bokmastar +3, riskbudget +2, konvertibel +1 — 50-läget; 2026-09-18 omgång 21: koncernläsning +3, riskpremie +1, tillväxtdjup +2; omgång 20: beteendemekanik +3, pe-mekanik +1, överlevnadsdjup +2)

/** Kedjan exakt som chat-widget.tsx komponerar den: första icke-null vinner. */
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { svar: s, motor: m.namn };
  }
  return null;
}

// ── Testharness (samma form som syskonsviterna) ─────────────────────────────
let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log("PASS  " + namn + (detalj ? "  — " + detalj : ""));
  } else {
    fail++;
    console.log("FAIL  " + namn + (detalj ? "  — " + detalj : ""));
  }
}

// ── FALL G: driftvakt — kedjan speglar widgetens komposition ────────────────
{
  const kalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rad = kalla.match(/const lokalt = ([^;]+);/);
  const widgetOrdning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const testOrdning = MOTORER.map((m) => m.fnk.name || m.fn);
  kontroll(
    "G: kedjan speglar widgetens kompositionsordning",
    widgetOrdning.length === MOTORER.length && widgetOrdning.every((f, i) => f === (MOTORER[i].fnk.name || MOTORER[i].fn)),
    widgetOrdning.length ? "widget: " + widgetOrdning.join(" ?? ") : "kompositionsraden hittades ej i chat-widget.tsx",
  );
}

// ── FALL A: kanonisk fråga per motor — ingen tidigare motor får skugga ──────
const KANONISKA = [
  { fraga: "vad är styrräntan?",         motor: 0 },
  { fraga: "vad är kassaflödesanalys?",  motor: 1 },
  // 2026-09-20 s6-u3 (manifest auto-s6-1789912510460): modernarisk —
  // kanoniska ur lagrets egna rubriker (motorindex 2 = FÖRE basen; fall G
  // verifierar widgetens ordning varje körning).
  { fraga: "vad är regulatorisk risk?", motor: 2 },
  { fraga: "vad är gdpr?",               motor: 2 },
  { fraga: "vad är esg?",                motor: 2 },
  { fraga: "vad är AKM1?",               motor: 3 },
  { fraga: "vad är optioner?",           motor: 4 },
  { fraga: "vad är goodwill?",           motor: 5 },
  { fraga: "hur analyserar jag banker?", motor: 6 },
  { fraga: "vad är praktiska case?",     motor: 7 },
  { fraga: "vad är blankning?",          motor: 9 },
  { fraga: "vad är valutarisk?", motor: 11 },
  // 2026-09-19 våg 210 (studion): valutamekanik — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är köpkraftsparitet?", motor: 10 },
  { fraga: "vad är ppp?",               motor: 10 },
  { fraga: "vad är ränteparitet?",     motor: 10 },
  { fraga: "vad är realväxelkurs?",    motor: 10 },
  { fraga: "vad betyder stark krona?", motor: 10 },
  { fraga: "vad är devalvering?",      motor: 10 },
  { fraga: "vad är valutahedging?",    motor: 10 },
  { fraga: "hur fungerar valutamarknaden?", motor: 10 },
  { fraga: "vad är valutalån?",        motor: 10 },
  { fraga: "vad är en reservvaluta?",  motor: 10 },
  { fraga: "vad är diversifiering?", motor: 11 },
  { fraga: "vad är bolagsstämma?", motor: 12 },
  { fraga: "vad är avskrivningar?", motor: 13 },
  { fraga: "vad är värderingsmultipel?", motor: 14 },
  { fraga: "vad är tulpanmanin?", motor: 15 },
  { fraga: "vad är dupont-analysen?", motor: 16 },
  { fraga: "vad är fibonacci retracements?", motor: 17 },
  { fraga: "vad är personaloptioner?", motor: 18 },
  { fraga: "vad är kapitalförsäkring?", motor: 18 },
  { fraga: "vad är bekräftelsefällan?", motor: 19 },
  { fraga: "vad är en skuldfälla?", motor: 20 },
  { fraga: "vad är en svart svan?", motor: 20 },
  { fraga: "vad är sharpe-kvoten?", motor: 21 },
  { fraga: "vad är utdelningsfällor?", motor: 22 },
  { fraga: "vad är aktieåterköp?", motor: 22 },
  { fraga: "vad är förväntningsanalys?", motor: 23 },
  { fraga: "vad är förväntningsgapet?", motor: 23 },
  { fraga: "vad är kalibrering?", motor: 23 },
  { fraga: "vad är rebalansering?", motor: 24 },
  { fraga: "vad är känslighetsanalys?", motor: 25 },
  { fraga: "vad är stresstest?", motor: 25 },
  { fraga: "vad är soliditetsgrad?", motor: 25 },
  { fraga: "vad är balansstyrka?", motor: 25 },
  { fraga: "vad är en net-net och NCAV?", motor: 26 },
  { fraga: "vad är cigar butts?", motor: 26 },
  { fraga: "vem är mr market?", motor: 26 },
  // Omgång 14: varderjustering (normalisering är deras egna fråga — "vad är
  // wacc?" ägs fortfarande av lonsamhetsdjup och "vad är cape?" av
  // case/riskmåttsdjup, deras dokumenterade ansvarsfördelning),
  // optionsdjup + risklasningsdjup.
  { fraga: "vad är normalisering?", motor: 27 },
  { fraga: "vad är en köpoption?", motor: 28 },
  { fraga: "vad är kundkoncentration?", motor: 29 },
  { fraga: "vad är en riskmatris?", motor: 29 },
  { fraga: "hur läser jag riskavsnittet?", motor: 29 },
  // Omgång 15: avkastningskurva (s6-u1) + avkastningsdjup (u2) +
  // värderingsverktyg (u3) — kanoniska ur deras egna rubriker.
  { fraga: "vad är den omvända avkastningskurvan?", motor: 30 },
  { fraga: "vad är avkastningskällor?", motor: 31 },
  { fraga: "vad är tvärsnittsanalys?", motor: 31 },
  { fraga: "vad är scenarioanalys?", motor: 32 },
  // Omgång 16: warrant (s6-u1) + tidsaxel (syskon u2, samma fönster) —
  // kanoniska ur lagrens egna rubriker.
  { fraga: "vad är warranter och teckningsoptioner?", motor: 33 },
  { fraga: "vad är konjunkturindikatorer?", motor: 34 },
  { fraga: "vad är refinansieringsmuren?", motor: 34 },
  { fraga: "vad är rörelsekapital?", motor: 35 },
  { fraga: "vad är kassakonverteringscykeln?", motor: 35 },
  { fraga: "vad är lageromsättning?", motor: 35 },
  // Omgång 17: ekosystemdjup (s6-u2) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är SAM-viktningen?", motor: 36 },
  { fraga: "vad är röstlängdningen?", motor: 36 },
  { fraga: "vad är en backtest?", motor: 36 },
  { fraga: "vad är monte carlo-simulering?", motor: 36 },
  // Omgång 17: handelsdag (s6-u1) — kanonisk ur lagrets egen rubrik.
  { fraga: "hur fungerar handelsdagen?", motor: 37 },
  // Omgång 17: portföljpraktik (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "hur stor ska en aktieposition vara?", motor: 38 },
  { fraga: "vad är tax-loss harvesting?", motor: 38 },
  { fraga: "vad är pensionssparande?", motor: 38 },
  // Omgång 18: utdelningskalender (s6-u1) — kanonisk ur lagrets egen rubrik.
  { fraga: "vad är ex-dagen?", motor: 39 },
  // Omgång 18: kreditdjup (s6-u2) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är kreditpremien?", motor: 40 },
  { fraga: "vad är kreditrating?", motor: 40 },
  // Omgång 18: sektordjup (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "hur analyserar jag SaaS-bolag?", motor: 41 },
  { fraga: "hur analyserar jag halvledarbolag?", motor: 41 },
  { fraga: "hur analyserar jag försvarsbolag?", motor: 41 },
  { fraga: "vad är churn?", motor: 41 },
  { fraga: "vad är net revenue retention?", motor: 41 },
  { fraga: "vad är en foundry?", motor: 41 },
  { fraga: "vad är krigsmateriel?", motor: 41 },
  // Omgång 19: sektorskola 2 (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "hur analyserar jag läkemedelsbolag?", motor: 42 },
  { fraga: "hur analyserar jag detaljhandelsbolag?", motor: 42 },
  { fraga: "hur analyserar jag logistikbolag?", motor: 42 },
  { fraga: "vad är patentbranten?", motor: 42 },
  { fraga: "vad är en pipeline?", motor: 42 },
  { fraga: "vad är like-for-like?", motor: 42 },
  { fraga: "vad är lastmile?", motor: 42 },
  // Omgång 20: beteendemekanik (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är priming?", motor: 43 },
  { fraga: "vad är primingeffekten?", motor: 43 },
  { fraga: "vad är tillgänglighetsfällan?", motor: 43 },
  { fraga: "vad är övermod?", motor: 43 },
  { fraga: "vad är overconfidence?", motor: 43 },
  { fraga: "vad är kompetensillusionen?", motor: 43 },
  // Omgång 20: pe-mekanik (s6-u1) — kanoniska ur lagrets tre sektioner.
  { fraga: "hur fungerar irr och förvärvsmaskinen?", motor: 44 },
  { fraga: "vad är internräntan?", motor: 44 },
  { fraga: "vad är lbo?", motor: 44 },
  { fraga: "vad är utfasningar?", motor: 44 },
  { fraga: "vad är vattenfallet?", motor: 44 },
  { fraga: "vad är carried interest?", motor: 44 },
  // Omgång 21: riskpremie (s6-u1) — kanoniska ur lagrets egna formuleringar.
  { fraga: "vad är aktiernas riskpremie?", motor: 45 },
  { fraga: "vad är riskpremien?", motor: 45 },
  { fraga: "vad är aktieriskpremien?", motor: 45 },
  { fraga: "hur räknar man ut riskpremien?", motor: 45 },
  { fraga: "vad är premie per riskenhet?", motor: 45 },
  // Omgång 20: överlevnadsdjup (s6-u2) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är likviditetsreserven?", motor: 46 },
  { fraga: "vad är överlevnadstid?", motor: 46 },
  { fraga: "hur länge räcker kassan?", motor: 46 },
  { fraga: "vad är kassaräckvidd?", motor: 46 },
  { fraga: "vad är altman z-score?", motor: 46 },
  { fraga: "vad är z-score?", motor: 46 },
  { fraga: "vad är konkursprognos?", motor: 46 },
  { fraga: "vad är konkursrisk?", motor: 46 },
  // Omgång 21: koncernläsning (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är koncernredovisning?", motor: 47 },
  { fraga: "vad är minoritetsintressen?", motor: 47 },
  { fraga: "vad är moderbolag?", motor: 47 },
  { fraga: "vad är segmentrapportering?", motor: 47 },
  { fraga: "vad är affärsområden?", motor: 47 },
  { fraga: "vad är pensionsåtaganden?", motor: 47 },
  { fraga: "vad är pensionsskulden?", motor: 47 },
  // Omgång 21: tillväxtdjup (s6-u2) — kanoniska ur lagrets egna rubriker
  // («vad är organisk tillväxt?»/«vad är volym pris och mix?» landar hos
  // BAS-motorn — deras monster [tillvaxt]/[kostnad]; se motordef-kommentaren).
  { fraga: "vad är s-kurvan?", motor: 48 },
  { fraga: "vad är mättnad?", motor: 48 },
  { fraga: "vad är marknadsmättnad?", motor: 48 },
  { fraga: "vad är utrymmesräkning?", motor: 48 },
  { fraga: "vad är prismix?", motor: 48 },
  { fraga: "vad är mixeffekten?", motor: 48 },
  { fraga: "vad är prisvolym?", motor: 48 },
  { fraga: "vad är produktmix?", motor: 48 },
  { fraga: "vad är tillväxtmotorer?", motor: 48 },
  { fraga: "vad är intäktsmotorer?", motor: 48 },
  // Omgång 22 (tredje instansen): faktordjup (s6-u1) — kanoniska ur
  // lagrets egna rubriker («vad är betat?»/«vad är smart beta?» =
  // riskmåttsdjupets, «vad är sharpe-kvoten?» dito, «vad är aktiernas
  // riskpremie?» = riskpremielagrets, «vad är faktorer?» plural stryks
  // («sektorer», tavstånd 2) — deras frågor, dokumenterade gränser; se
  // motordef-kommentaren).
  { fraga: "vad är faktorpremier?", motor: 49 },
  { fraga: "vad är faktorpremierna?", motor: 49 },
  { fraga: "vad är en faktor?", motor: 49 },
  { fraga: "vad är momentum?", motor: 49 },
  { fraga: "vad är värdefaktorn?", motor: 49 },
  { fraga: "vad är storleksfaktorn?", motor: 49 },
  { fraga: "vad är lågvolatilitetsanomalin?", motor: 49 },
  { fraga: "vad är femfaktormodellen?", motor: 49 },
  { fraga: "vad är faktorzoo?", motor: 49 },
  // «vad är det tysta betat?» STRYKS (kedjetest-fånga): riskmåttsdjupets
  // «beta» (tolerans 1) fångar böjningen «betat» — deras fråga; kursens
  // signaturfras bärs i faktordjup-svarets TEXT, aldrig som kärnord.
  // Omgång 22: bokmastar (s6-u3) — kanoniska ur lagrets egna rubriker
  // («vad är tulpanmanin?» = historia, «vad är blankning?» = praktik och
  // «hur ljuger en årsredovisning?» = basens rapportläsning — deras
  // frågor, dokumenterade gränser; se motordef-kommentaren).
  { fraga: "vad är financial shenanigans?", motor: 50 },
  { fraga: "vad är redovisningstrick?", motor: 50 },
  { fraga: "vad är resultatmassaging?", motor: 50 },
  { fraga: "vad är quality of earnings?", motor: 50 },
  { fraga: "vad är kreativ redovisning?", motor: 50 },
  { fraga: "vad är manias panics and crashes?", motor: 50 },
  { fraga: "vad är spekulativ mani?", motor: 50 },
  { fraga: "vad är this time is different?", motor: 50 },
  { fraga: "vad är krashhistoria?", motor: 50 },
  { fraga: "vad är special situations?", motor: 50 },
  { fraga: "vad är spin off?", motor: 50 },
  { fraga: "vad är merger arbitrage?", motor: 50 },
  { fraga: "vad är distress investing?", motor: 50 },
  // Omgång 22: riskbudget (s6-u2) — kanoniska ur lagrets egna rubriker
  // («vad är volatilitet?»/«vad är risk?» = basens risk-monster, «vad är
  // riskparitet?» = portföljbalansen, «vad är sharpe-kvoten?» = riskmåtts-
  // djupet — deras frågor, dokumenterade gränser; se motordef-kommentaren).
  { fraga: "vad är volatilitetsbudgeten?", motor: 51 },
  { fraga: "vad är volatilitetsbudget?", motor: 51 },
  { fraga: "vad är riskbudget?", motor: 51 },
  { fraga: "vad är sortino?", motor: 51 },
  { fraga: "vad är sortino-kvoten?", motor: 51 },
  { fraga: "vad är calmar?", motor: 51 },
  { fraga: "vad är calmar-kvoten?", motor: 51 },
  { fraga: "vad är tre mått tre frågor?", motor: 51 },
  // Omgång 22 (omstart): konvertibel (s6-u1) — kanoniska ur lagrets egna
  // kärnord («vad är kapitalstrukturen?» = basens monster — deras fråga,
  // dokumenterad gräns; bärs som fragor:-knapp; se motordef-kommentaren).
  { fraga: "vad är en konvertibel?", motor: 52 },
  { fraga: "vad är konvertibler?", motor: 52 },
  { fraga: "vad är hybridkapital?", motor: 52 },
  { fraga: "vad är konverteringskursen?", motor: 52 },
  { fraga: "vad är konverteringspremien?", motor: 52 },
  { fraga: "vad är paritetsvärdet?", motor: 52 },
  { fraga: "vad är en preferensaktie?", motor: 52 },
  { fraga: "vad är stämpelordningen?", motor: 52 },
  { fraga: "vad är kapitaltrappan?", motor: 52 },
  { fraga: "vad är at1-kapital?", motor: 52 },
  { fraga: "vad är additional tier 1?", motor: 52 },
  { fraga: "vad är en nollskrivning?", motor: 52 },
  { fraga: "vad är evighetsräntan?", motor: 52 },
  // Omgång 23: sektorläsning (s6-u2) — kanoniska ur lagrets egna
  // rubriker («vad är oljepriset?» = ingen ägare i kedjan — makro-
  // familjens blomma, dokumenterad gräns i modulens kommentar; «vad är
  // en moat?» = extra-lagrets, bärs som knapp ur svaren).
  { fraga: "hur analyserar jag ett energibolag?", motor: 53 },
  { fraga: "hur analyserar jag ett telekombolag?", motor: 53 },
  // Omgång 23: vardegrund (s6-u3) — kanoniska ur lagrets egna kärnord
  // («vad är DCF?»/«vad är inre värde?»/«vad är substansvärde?» = nästas,
  // «vad är fcf yield?»/«vad är price to cash flow?» = extras, «vad är
  // wacc?» = lönsamhetsdjupets — deras frågor, dokumenterade gränser;
  // bärs som fragor:-knappar; se motordef-kommentaren).
  { fraga: "vad är motiverat värde?", motor: 54 },
  { fraga: "vad är intrinsic value?", motor: 54 },
  { fraga: "hur räknar man ut motiverat värde?", motor: 54 },
  { fraga: "vad är fair value?", motor: 54 },
  { fraga: "vad är verkligt värde?", motor: 54 },
  { fraga: "vad är realoptioner?", motor: 54 },
  { fraga: "vad är en realoption?", motor: 54 },
  { fraga: "vad är kassaflödesavkastning?", motor: 54 },
  { fraga: "hur räknar man ut kassaflödesavkastning?", motor: 54 },
  { fraga: "vad är asset based valuation?", motor: 54 },
  // Omgång 23: realekonomi (s6-u1) — kanonisk ur lagrets paraplyfråga
  // («vad är rsi?»-familjen = basens teknisk-analys-monster, rond 2:s
  // dödade förstavalet — dokumenterad gräns i modulens kommentar;
  // «vad är inflation och KPI?» = makro-lagrets och «vad är
  // konjunkturindikatorer?» = tidsaxelns, bärs som knappar ur svaret).
  { fraga: "vad är realekonomin?", motor: 55 },
  // Omgång 24: försäkring + krypto (s6-u1) — kanoniska ur lagrets egna
  // kärnord («vad är försäkring?» naket = beteendedjupets «förankring»,
  // tav 2 inom 10-bokstaversordens tolerans — dokumenterad gräns i
  // modulens kommentar; «vad är en moat?» = extras, «vad är
  // volatilitet?» = basens risk-monster, «vad är terminer?» = nästas —
  // deras frågor, dokumenterade gränser; bärs som fragor:-knappar).
  { fraga: "vad är combined ratio?", motor: 56 },
  { fraga: "vad är en combined ratio?", motor: 56 },
  { fraga: "hur räknar man ut combined ratio?", motor: 56 },
  { fraga: "vad är floaten?", motor: 56 },
  { fraga: "vad är float?", motor: 56 },
  { fraga: "vad är försäkringssektorn?", motor: 56 },
  { fraga: "hur analyserar jag försäkringsbolag?", motor: 56 },
  { fraga: "vad är premieinkomster?", motor: 56 },
  { fraga: "vad är underwriting?", motor: 56 },
  { fraga: "vad är teckningsresultat?", motor: 56 },
  { fraga: "vad är krypto?", motor: 56 },
  { fraga: "vad är kryptovalutor?", motor: 56 },
  { fraga: "vad är bitcoin?", motor: 56 },
  { fraga: "vad är blockchain?", motor: 56 },
  { fraga: "vad är blockkedjan?", motor: 56 },
  { fraga: "vad är ethereum?", motor: 56 },
  // Omgång 24: moatdjup (s6-u2) — kanoniska ur lagrets egna kärnord
  // («vad är en moat?»/«vallgraven i siffror?» = extra-lagrets,
  // «vad är kostnadsöverlägsenhet?»/«vad är kvalitetspremien?» NULL
  // men medvetet ej kärnord — dokumenterade gränser i modulens
  // kommentar; bärs som knappar/källor, aldrig kärnord).
  { fraga: "vad är prisfullmakten?", motor: 57 },
  { fraga: "vad är prisfullmakt?", motor: 57 },
  { fraga: "hur testar man prisfullmakten?", motor: 57 },
  { fraga: "vad är byteskostnader?", motor: 57 },
  { fraga: "vad är byteskostnad?", motor: 57 },
  { fraga: "vad är inlåsningseffekten?", motor: 57 },
  // Omgång 24: nya territorier (s6-u3) — kanoniska ur lagrets egna kärnord
  // («vad är en tillverkad katalysator?» = basens (naked katalysator),
  // «vad är substansvärde?» = nästas, «vad är en bolagsstämma?» = ägandes,
  // «vad är räntan?» = makros, «hur påverkar bostadsmarknaden börsen?» =
  // basens påverkar-form — deras frågor, dokumenterade gränser i modulens
  // kommentar; bärs som knappar ur svaren).
  { fraga: "vad är en aktivist?", motor: 58 },
  { fraga: "vad är aktivism?", motor: 58 },
  { fraga: "vad är ett kravbrev?", motor: 58 },
  { fraga: "vad är en aktiekampanj?", motor: 58 },
  { fraga: "vad är guidningen?", motor: 58 },
  { fraga: "vad är guidning?", motor: 58 },
  { fraga: "vad är bolagets prognos?", motor: 58 },
  { fraga: "hur fungerar bostadsmarknaden?", motor: 58 },
  { fraga: "vad är lånekraft?", motor: 58 },
  { fraga: "vad är demografi?", motor: 58 },
  { fraga: "vad är befolkningspyramiden?", motor: 58 },
  // 2026-09-20 omgång 25 (s6-u1): etfmekanik — kanoniska ur lagrets egna
  // rubriker; gränserna sondbekäftade: praktiken äger naket index/etf,
  // nästas nav, basens hävstång, portfölj-praktikens rebalansering.
  { fraga: "vad är en börshandlad fond?", motor: 59 },
  { fraga: "vad är en auktoriserad deltagare?", motor: 59 },
  // s6-u2-harmonisering (omg 25, dokumenterad): de två ursprungliga
  // formuleringarna «hur skapas etf-andelar?»/«vad är etf-arbitrage?» var
  // strukturellt skuggade — praktik äger naket «etf» (kort exakt match på
  // ordet i frågan) och ligger FÖRE i kedjan, så etfmekanikens
  // «etf-arbitrage»-fras kan aldrig nås av en fråga med naket etf-ord.
  // Raderna bär i stället lagrets EGNA kärnordsformuleringar (sondverifierat:
  // etfmekanik=true, praktik=false): «skapelse»+«inlösen» (am-08:s
  // rubrikkärna) och «flashdagen» (6 maj 2010, lagrets signaturhändelse).
  { fraga: "vad är skapelse och inlösen?", motor: 59 },
  { fraga: "vad är flashdagen?", motor: 59 },
  { fraga: "vad är contango?", motor: 59 },
  { fraga: "vad är backwardation?", motor: 59 },
  { fraga: "vad är en hävstångsetf?", motor: 59 },
  { fraga: "vad är spårningsavvikelsen?", motor: 59 },
  { fraga: "vad är indexomläggningen?", motor: 59 },
  { fraga: "vad är effektdagen?", motor: 59 },
  // 2026-09-20 omgång 25 (s6-u2): kontrahent — kanoniska ur lagrets egna
  // rubriker; gränserna sondbekräftade: «ccp» stryket (granne «ccc»),
  // «lehman» historiens, basens «initial margin»/«variation margin» och
  // bank-formuleringen — deras frågor, dokumenterade gränser; bärs som
  // knappar/text, aldrig kärnord.
  { fraga: "vad är kontrahentrisk?", motor: 60 },
  { fraga: "vad är en kontrahent?", motor: 60 },
  { fraga: "vem är motparten?", motor: 60 },
  { fraga: "vad är motpartsrisk?", motor: 60 },
  { fraga: "vad är netting?", motor: 60 },
  { fraga: "vem står på andra sidan när det blåser?", motor: 60 },
  { fraga: "vad är ett clearinghus?", motor: 60 },
  { fraga: "vad är en clearingcentral?", motor: 60 },
  { fraga: "vad är collateral?", motor: 60 },
  { fraga: "vad är en garantifond?", motor: 60 },
  { fraga: "vad är en haircut?", motor: 60 },
  { fraga: "vad är säkerhetskrav?", motor: 60 },
  { fraga: "vad är default-trappan?", motor: 60 },
  // 2026-09-20 omgång 26: optionshantverk (s6-u3) — kanoniska ur lagrets
  // egna rubriker (index 63 = LIVE-läget av _s6u3o26-kanoniska.mjs; värdet
  // verifieras av fall G:s komponentordning varje körning).
  { fraga: "vad är binomialträdet?", motor: 64 },
  { fraga: "vad är en straddle?", motor: 64 },
  { fraga: "vad är delta?", motor: 64 },
  // 2026-09-20 omgång 27 (manifest auto-s6-1789912510460): volatilitetsmekanik
  // (s6-u2) — kanoniska ur lagrets egna rubriker. Index 65 = LIVE-läget
  // (66:e motorn av 67; FÖRE marknadsrytm som förblir SIST).
  { fraga: "vad är volatilitetsdraget?", motor: 66 },
  { fraga: "vad är variansdraget?", motor: 66 },
  { fraga: "vad är spegelparet?", motor: 66 },
  { fraga: "vad är marginaltrappan?", motor: 66 },
  { fraga: "vad är täckningsbidraget?", motor: 66 },
  // 2026-09-20 fönstret efter omgång 27 (s6-u2, _s6u2o28-): tvångsmekanik —
  // kanoniska ur lagrets egna rubriker. Index 68 = LIVE-läget (70:e motorn
  // av 70; FÖRE marknadsrytm som förblir SIST — fall G verifierar varje körning).
  { fraga: "vad är marginalhandeln?", motor: 68 },
  { fraga: "vad är belåningskontot?", motor: 68 },
  { fraga: "vad är kaskadpunkten?", motor: 68 },
  { fraga: "vad är marginalkravet?", motor: 68 },
  { fraga: "vad är optionsförfallet?", motor: 68 },
  { fraga: "vad är förfalloptron?", motor: 68 },
  { fraga: "vad är magnetkartan?", motor: 68 },
  // 2026-09-20 fönster 29 (s6-u2): händelsemotor — kanoniska ur lagrets
  // egna rubriker (motorindex 69, efter tvångsmekanik, FÖRE marknadsrytm;
  // fall G verifierar widgetens ordning varje körning).
  { fraga: "vad är sell the news?", motor: 69 },
  { fraga: "vad är en avsiktsförklaring?", motor: 69 },
  { fraga: "vad är rnpv?", motor: 69 },
  { fraga: "vad är take or pay?", motor: 69 },
  { fraga: "vad är budpremien?", motor: 69 },
  // 2026-09-20 fönster 30 (s6-u3, _s6u3o29-): lönsamhetsgrund — kanoniska
  // ur lagrets egna rubriker (motorindex 70, efter handelsemotor, FÖRE
  // marknadsrytm; fall G verifierar widgetens ordning varje körning).
  { fraga: "vad är lönsamhet?", motor: 70 },
  { fraga: "vad är bageriets trappa?", motor: 70 },
  { fraga: "vad är kampanjräkningen?", motor: 70 },
  { fraga: "vad är inkrementell avkastning?", motor: 70 },
  { fraga: "vad är medeltalets blindhet?", motor: 70 },
  { fraga: "vad är nästa kronas avkastning?", motor: 70 },
  { fraga: "vad är värdeekvationen?", motor: 70 },
  { fraga: "vad är värdemultiplikatorn?", motor: 70 },
  { fraga: "vad är återinvesteringsandelen?", motor: 70 },
  { fraga: "vad är tvillingbolagen?", motor: 70 },
  // 2026-09-20 fönster 29 (s6-u1, _s6u1o29-): kemisektor — kanoniska ur
  // lagrets egna rubriker (motorindex 71 = 73:e motorn, efter
  // lonsamhetsgrund, FÖRE marknadsrytm; fall G verifierar varje körning).
  { fraga: "vad är kemisektorn?", motor: 71 },
  { fraga: "vad är bulkkemin?", motor: 71 },
  { fraga: "vad är specialkemin?", motor: 71 },
  { fraga: "vad är ammoniaken?", motor: 71 },
  { fraga: "vad är balanspriset?", motor: 71 },
  { fraga: "vad är fosforn?", motor: 71 },
  // 2026-09-21 fönster 31 (manifest auto-s6-1789965330060) — tre
  // syskonlager efter kemisektor, FÖRE marknadsrytm; konvergerat
  // dokumenterat av s6-u2 (stålsektor 72 · casepraktik 73 ·
  // beteendefallor 74; fall G verifierar varje körning).
  { fraga: "vad är stålsektorn?", motor: 72 },
  { fraga: "hur övar jag på riktiga bolag?", motor: 73 },
  { fraga: "hur jämför jag två bolag sida vid sida?", motor: 73 },
  { fraga: "vad är haloeffekten?", motor: 74 },
  { fraga: "vad är arbitragens gränser?", motor: 74 },
  { fraga: "vad är slumpens serier?", motor: 74 },
  // 2026-09-21 fönster 32 (s6-u3 FÖRSÖK 2, _s6u3o32-): kategoristängning —
  // TRE monsters med tre kanoniska var (index 75 = 76:e motorn, efter
  // beteendefallor, FÖRE marknadsrytm; fall G verifierar varje körning;
  // samtliga sonderade NULL genom hela kedjan FÖRE byggstart).
  { fraga: "hur fungerar en budprocess?", motor: 75 },
  { fraga: "vad är budtiden?", motor: 75 },
  { fraga: "vad är tvångsinlösen?", motor: 75 },
  { fraga: "vad är eva?", motor: 75 },
  { fraga: "vad är ekonomisk vinst?", motor: 75 },
  { fraga: "vad är värdebryggan?", motor: 75 },
  { fraga: "vad är spridningen?", motor: 75 },
  { fraga: "vad är försäkringsskrivandet?", motor: 75 },
  { fraga: "vad är en kontanttäckt position?", motor: 75 },
  { fraga: "vad är wheel-cykeln?", motor: 75 },
  // 2026-09-28 v206-u1 (manifest v206-mega-kapacitet-1789637000): bokmastar2 —
  // kanoniska ur lagrets egna rubriker (motorindex 88 = 90:e motorn, efter
  // faktorfadrarna, FÖRE marknadsrytm SIST; fall G verifierar varje körning;
  // gränser: «teknisk analys» → basen, «korrelationsrisken» → marknadsrytm,
  // «valutarisk» → valutamekanik, «inflation»/«deflation» → makro,
  // «råvaror» → etfmekanik, «moat» → moatdjup, naket «guld» lämnas öppet;
  // KEDJETEST-FUNNA gränsen: «vad är murphy för bok?» skuggas av basens
  // böcker-monster (kärnord «bok», exakt) — deras fråga; Murphy-frågan
  // bärs utan ordet «bok», stryket dokumenterat här).
  { fraga: "vad är intermarket-analys?", motor: 88 },
  { fraga: "vad är murphy?", motor: 88 },
  { fraga: "vad är normalförhållandet?", motor: 88 },
  { fraga: "vad är sektorsrotation?", motor: 88 },
  { fraga: "vad är flight to quality?", motor: 88 },
  { fraga: "vad är bra till bäst?", motor: 88 },
  { fraga: "vad är good to great?", motor: 88 },
  { fraga: "vad är en igelkott?", motor: 88 },
  { fraga: "vad är flugsvärmen?", motor: 88 },
  { fraga: "vad är svänghjulet?", motor: 88 },
  { fraga: "vad är stockdale-paradoxen?", motor: 88 },
  { fraga: "vad är profit per x?", motor: 88 },
  // 2026-09-29 s6-u1 (_s6u1o37_): indexinklusion — kanoniska ur lagrets egna
  // rubriker. OBS gränsen: naket «index»-formuleringar («vad händer när en
  // aktie tas in i index?») ägs av praktik (motor 10, deras dokumenterade
  // kärnordsägarskap) — detta lagers frågor är SAMMANSATTA av just det skälet.
  { fraga: "vad är indexinklusionen?", motor: 89 },
  { fraga: "vad är indexinklusion?", motor: 89 },
  { fraga: "vad är inklusionseffekten?", motor: 89 },
  { fraga: "vad är en terminsstyrelse?", motor: 89 },
  { fraga: "vad är en indexvikt?", motor: 89 },
  { fraga: "vad är flödeskatalysatorn?", motor: 89 },
  { fraga: "vad är uteslutningsspegeln?", motor: 89 },
  // 2026-09-29 s6-u2 (_s6u2o38_): aterstangning — kanoniska ur lagrets egna
  // rubriker. OBS gränserna: naket «ex-dagen»/«avstämningsdagen» ägs av
  // utdelningskalendern (motor 41, ud-07:s dokumenterade datumägarskap) —
  // detta lagers frågor är SAMMANSATTA mekanikfrågor av just det skälet;
  // naket «ton» ägs av sektorfamiljerna — «ev per ton» är sammansatt fras.
  { fraga: "vad är en enhetsmultipl?", motor: 91 },
  { fraga: "vad är enhetsmultiplar?", motor: 91 },
  { fraga: "vad är ev per ton?", motor: 91 },
  { fraga: "vad är kapacitetsfaktorn?", motor: 91 },
  { fraga: "vad är den teoretiska ex-kursen?", motor: 91 },
  { fraga: "vad är ex-kursen?", motor: 91 },
  { fraga: "vad är ex-spärren?", motor: 91 },
  { fraga: "vad är frukosthandeln?", motor: 91 },
];
for (const { fraga, motor } of KANONISKA) {
  const skuggor = MOTORER.slice(0, motor).filter((m) => m.fnk(fraga, KURSREGISTER) !== null).map((m) => m.namn);
  const vantan = MOTORER[motor].fnk(fraga, KURSREGISTER);
  const k = kedja(fraga);
  kontroll(
    "A: " + fraga,
    skuggor.length === 0 && vantan !== null && k !== null && JSON.stringify(k.svar) === JSON.stringify(vantan),
    skuggor.length ? "SKUGGAD av: " + skuggor.join(", ") : (k ? "motor=" + k.motor : "kedjan null"),
  );
}

// ── FALL B: skuggprober — nära kärnordsfamiljer över motorgränser ──────────
// "räntenetto" är bankens mått men ligger en redigering från "räntan";
// "substansvärde"/"utspädning"/"indexfonder" har grannar i tidigare motorer.
const PROBER = [
  { fraga: "vad är räntenetto?",   motor: 6 },
  { fraga: "vad är substansvärde?", motor: 4 },
  { fraga: "vad är utspädning?",   motor: 5 },
  { fraga: "vad är indexfonder?",  motor: 9 },
  // Nya lagers gränser (rond 50): basens värderings-/aktieslagsfamiljer ligger
  // nära djup- respektive ägande-lagrets kärnord — kedjan måste skilja dem.
  { fraga: "vad är rösträtt?", motor: 12 },
  { fraga: "vad är jämförelsebolag?", motor: 14 },
  // Stabilitetsdjup-lagrets dokumenterade ansvarsgränser (omgång 13):
  // basen äger GRUNDORDEN — stabilitetsdjupet bär bara familjeorden.
  { fraga: "vad är soliditet?", motor: 3 },
  { fraga: "hur stresstestar jag en balansräkning?", motor: 3 },
];
for (const { fraga, motor } of PROBER) {
  const skuggor = MOTORER.slice(0, motor).filter((m) => m.fnk(fraga, KURSREGISTER) !== null).map((m) => m.namn);
  const vantan = MOTORER[motor].fnk(fraga, KURSREGISTER);
  const k = kedja(fraga);
  kontroll(
    "B: " + fraga,
    skuggor.length === 0 && vantan !== null && k !== null && JSON.stringify(k.svar) === JSON.stringify(vantan),
    skuggor.length ? "SKUGGAD av: " + skuggor.join(", ") : (k ? "motor=" + k.motor : "kedjan null"),
  );
}

// ── FALL C: genomströmning + juridik ────────────────────────────────────────
kontroll(
  "C: omatchad fråga → kedjan null (API-flödet tar över)",
  kedja("vilken färg har månen?") === null,
  "sjuttio motorer lämnar frågan ifred",
);
{
  const k = kedja("vilket bolag ska jag köpa?");
  kontroll(
    "C: juridikfråga → pedagogiskt lokalt svar (ej tystnad)",
    k !== null,
    k ? "motor=" + k.motor + " · ämne=" + k.svar.amne : "null",
  );
}

// ── FALL D: determinism genom hela kedjan ───────────────────────────────────
for (const { fraga } of [...KANONISKA.slice(0, 3), ...PROBER.slice(0, 2)]) {
  const a = kedja(fraga);
  const b = kedja(fraga);
  kontroll(
    "D: determinism (" + fraga + ")",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt via " + a.motor : "null",
  );
}

// ── FALL E + F: källmärkning och kursläkthet på ALLA monsters ───────────────
const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
const akaKursLank = (lank) => lank.startsWith("/kurser/") && slugSet.has(lank.replace("/kurser/", ""));
let eFel = 0;
let fFel = 0;
const eDetaljer = [];
const fDetaljer = [];
for (const m of MOTORER) {
  for (const monster of m.monster) {
    let s;
    try {
      s = monster.bygga(KURSREGISTER);
    } catch (e) {
      eFel++;
      eDetaljer.push(m.namn + "/" + monster.id + " kastade: " + String(e?.message).slice(0, 60));
      continue;
    }
    // E1: källrad i texten (enskild "📖 Källa:" eller numrerad "📖 Källor (n)")
    if (!s.text.includes("📖 Käll")) { eFel++; eDetaljer.push(m.namn + "/" + monster.id + " saknar källrad"); }
    // E2: varje kalla-slug äkta
    const kallor = s.kallor ?? (s.kalla ? [s.kalla] : []);
    for (const k of kallor) {
      if (k.slug && !slugSet.has(k.slug)) { eFel++; eDetaljer.push(m.namn + "/" + monster.id + " kalla.slug " + k.slug + " finns ej i registret"); }
    }
    // E3: fordjupa-kurslänk äkta (om den pekar på /kurser/)
    if (s.fordjupa?.lank?.startsWith("/kurser/") && !akaKursLank(s.fordjupa.lank)) {
      eFel++;
      eDetaljer.push(m.namn + "/" + monster.id + " fordjupa " + s.fordjupa.lank + " är en död kurslänk");
    }
    // F1: ≥2 handlings
    if ((s.handlings?.length ?? 0) < 2) { fFel++; fDetaljer.push(m.namn + "/" + monster.id + " har " + (s.handlings?.length ?? 0) + " handlings"); }
    // F2: ≥1 äkta kurslänk, inga döda
    const lankar = (s.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/"));
    const doda = lankar.filter((h) => !akaKursLank(h.lank));
    if (lankar.length < 1) { fFel++; fDetaljer.push(m.namn + "/" + monster.id + " saknar kurslänk i handlings"); }
    if (doda.length > 0) { fFel++; fDetaljer.push(m.namn + "/" + monster.id + " döda länkar: " + doda.map((h) => h.lank).join(", ")); }
  }
}
kontroll(
  "E: källmärkning på samtliga " + TOTALT + " monsters",
  eFel === 0,
  eFel === 0 ? "källrad + äkta slugs + äkta fordjupa överallt" : eDetaljer.slice(0, 6).join(" · "),
);
kontroll(
  "F: kursläkthet på samtliga " + TOTALT + " monsters",
  fFel === 0,
  fFel === 0 ? "≥2 handlings och ≥1 äkta kurslänk överallt" : fDetaljer.slice(0, 6).join(" · "),
);

// ── FALL H: struktur — inventarie + disjunkta id:n ──────────────────────────
{
  const fel = MOTORER.filter((m) => m.monster.length !== m.antal);
  kontroll(
    "H: inventarie per motor (" + MOTORER.map((m) => m.namn + "=" + m.antal).join(" · ") + ", totalt " + TOTALT + ")",
    fel.length === 0,
    fel.length ? fel.map((m) => m.namn + " har " + m.monster.length + " (väntat " + m.antal + ") — uppdatera inventarien medvetet").join(" · ")
      : "inventarien stämmer",
  );
  const idn = MOTORER.flatMap((m) => m.monster.map((x) => x.id));
  const dubletter = idn.filter((id, i) => idn.indexOf(id) !== i);
  kontroll(
    "H: disjunkta monster-id:n över alla " + MOTORER.length + " motorer",
    new Set(idn).size === idn.length,
    dubletter.length ? "dubletter: " + [...new Set(dubletter)].join(", ") : idn.length + " unika id",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("AI-MENTORN KEDJAN (våg 176): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
