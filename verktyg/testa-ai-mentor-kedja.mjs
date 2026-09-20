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
  { namn: "marknadsrytm", fil: "ai-mentor-marknadsrytm-fragor.ts", fn: "svaraLokaltMarknadsrytm", arr: "MARKNADSRYTM_MONSTER", antal: 3 },
];

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of MOTORDEFS) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn], monster: modul[d.arr] });
}
const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 179 (2026-09-20 omgång 26: optionshantverk +3 — binomialträdet m.fl. (s6-u3), 64:e motorn FÖRE marknadsrytm som förblir SIST [65:e]; balansdjup +2 — lagervärderingen + obeskattade reserver (s6-u2, manifest auto-s6-1789890903364), aktiverar bk-07 + bk-06 = BOKFÖRING & ÅRSREDOVISNING fullt länkad 19/19, 63:e motorn FÖRE marknadsrytm som förblir SIST [64:e]; riskadress +1 — riskens adresser: leverantörsrisken + modellrisken + personalrisken ovanpå anatomi-kartan, aktiverar rs-06/07/08/09, 62:a motorn (s6-u1). Omgång 25: multipel +2 — P/S-talet + P/B-talet, grundmultiplarna (s6-u2 försök 2), 61:a motorn FÖRE marknadsrytm som förblir SIST (62:a — deras SIST-deklaration); marknadsrytm +3 — korrelationsrisk/kapitalcykeln/bull-bear (u3:s, motordef harmoniserad av s6-u2); kontrahent +2 — motparten/nettingen + clearinghuset/trappan, 60-motorläget; etfmekanik +1 — korgen/skapelsen/arbitraget/indexomläggningen, 59-motorläget, 166 monsters. 2026-09-19 våg 210: valutamekanik +10 — 58-motorläget, 165 monsters. Omgång 24: nya territorier +3 — aktivisten + guidningen + bostadsmekaniken/demografin, 57-läget; moatdjup +2 — prisfullmakten + byteskostnaderna, 56-läget; försäkring +2 — combined ratio/floaten + krypto, 55-läget. KOMMENTARBAS RÄTTAD här: omgång 23:s «138» förglömmde våg 189:s marknadsmekanik +10 — verkligt 54-läge var 148, varför 55/56/57-lägena är 150/152/155, inte 140/142/145; antal-fälten i MOTORDEFS har alltid varit sanna, endast kommentarsiffrorna ärvde fel bas. Omgång 23: sektorläsning +2, vardegrund +3, realekonomi +1 — 53-läget; omgång 22: faktordjup +1, bokmastar +3, riskbudget +2, konvertibel +1 — 50-läget; 2026-09-18 omgång 21: koncernläsning +3, riskpremie +1, tillväxtdjup +2; omgång 20: beteendemekanik +3, pe-mekanik +1, överlevnadsdjup +2)

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
  { fraga: "vad är AKM1?",               motor: 2 },
  { fraga: "vad är optioner?",           motor: 3 },
  { fraga: "vad är goodwill?",           motor: 4 },
  { fraga: "hur analyserar jag banker?", motor: 5 },
  { fraga: "vad är praktiska case?",     motor: 6 },
  { fraga: "vad är blankning?",          motor: 8 },
  { fraga: "vad är valutarisk?", motor: 10 },
  // 2026-09-19 våg 210 (studion): valutamekanik — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är köpkraftsparitet?", motor: 9 },
  { fraga: "vad är ppp?",               motor: 9 },
  { fraga: "vad är ränteparitet?",     motor: 9 },
  { fraga: "vad är realväxelkurs?",    motor: 9 },
  { fraga: "vad betyder stark krona?", motor: 9 },
  { fraga: "vad är devalvering?",      motor: 9 },
  { fraga: "vad är valutahedging?",    motor: 9 },
  { fraga: "hur fungerar valutamarknaden?", motor: 9 },
  { fraga: "vad är valutalån?",        motor: 9 },
  { fraga: "vad är en reservvaluta?",  motor: 9 },
  { fraga: "vad är diversifiering?", motor: 10 },
  { fraga: "vad är bolagsstämma?", motor: 11 },
  { fraga: "vad är avskrivningar?", motor: 12 },
  { fraga: "vad är värderingsmultipel?", motor: 13 },
  { fraga: "vad är tulpanmanin?", motor: 14 },
  { fraga: "vad är dupont-analysen?", motor: 15 },
  { fraga: "vad är fibonacci retracements?", motor: 16 },
  { fraga: "vad är personaloptioner?", motor: 17 },
  { fraga: "vad är kapitalförsäkring?", motor: 17 },
  { fraga: "vad är bekräftelsefällan?", motor: 18 },
  { fraga: "vad är en skuldfälla?", motor: 19 },
  { fraga: "vad är en svart svan?", motor: 19 },
  { fraga: "vad är sharpe-kvoten?", motor: 20 },
  { fraga: "vad är utdelningsfällor?", motor: 21 },
  { fraga: "vad är aktieåterköp?", motor: 21 },
  { fraga: "vad är förväntningsanalys?", motor: 22 },
  { fraga: "vad är förväntningsgapet?", motor: 22 },
  { fraga: "vad är kalibrering?", motor: 22 },
  { fraga: "vad är rebalansering?", motor: 23 },
  { fraga: "vad är känslighetsanalys?", motor: 24 },
  { fraga: "vad är stresstest?", motor: 24 },
  { fraga: "vad är soliditetsgrad?", motor: 24 },
  { fraga: "vad är balansstyrka?", motor: 24 },
  { fraga: "vad är en net-net och NCAV?", motor: 25 },
  { fraga: "vad är cigar butts?", motor: 25 },
  { fraga: "vem är mr market?", motor: 25 },
  // Omgång 14: varderjustering (normalisering är deras egna fråga — "vad är
  // wacc?" ägs fortfarande av lonsamhetsdjup och "vad är cape?" av
  // case/riskmåttsdjup, deras dokumenterade ansvarsfördelning),
  // optionsdjup + risklasningsdjup.
  { fraga: "vad är normalisering?", motor: 26 },
  { fraga: "vad är en köpoption?", motor: 27 },
  { fraga: "vad är kundkoncentration?", motor: 28 },
  { fraga: "vad är en riskmatris?", motor: 28 },
  { fraga: "hur läser jag riskavsnittet?", motor: 28 },
  // Omgång 15: avkastningskurva (s6-u1) + avkastningsdjup (u2) +
  // värderingsverktyg (u3) — kanoniska ur deras egna rubriker.
  { fraga: "vad är den omvända avkastningskurvan?", motor: 29 },
  { fraga: "vad är avkastningskällor?", motor: 30 },
  { fraga: "vad är tvärsnittsanalys?", motor: 30 },
  { fraga: "vad är scenarioanalys?", motor: 31 },
  // Omgång 16: warrant (s6-u1) + tidsaxel (syskon u2, samma fönster) —
  // kanoniska ur lagrens egna rubriker.
  { fraga: "vad är warranter och teckningsoptioner?", motor: 32 },
  { fraga: "vad är konjunkturindikatorer?", motor: 33 },
  { fraga: "vad är refinansieringsmuren?", motor: 33 },
  { fraga: "vad är rörelsekapital?", motor: 34 },
  { fraga: "vad är kassakonverteringscykeln?", motor: 34 },
  { fraga: "vad är lageromsättning?", motor: 34 },
  // Omgång 17: ekosystemdjup (s6-u2) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är SAM-viktningen?", motor: 35 },
  { fraga: "vad är röstlängdningen?", motor: 35 },
  { fraga: "vad är en backtest?", motor: 35 },
  { fraga: "vad är monte carlo-simulering?", motor: 35 },
  // Omgång 17: handelsdag (s6-u1) — kanonisk ur lagrets egen rubrik.
  { fraga: "hur fungerar handelsdagen?", motor: 36 },
  // Omgång 17: portföljpraktik (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "hur stor ska en aktieposition vara?", motor: 37 },
  { fraga: "vad är tax-loss harvesting?", motor: 37 },
  { fraga: "vad är pensionssparande?", motor: 37 },
  // Omgång 18: utdelningskalender (s6-u1) — kanonisk ur lagrets egen rubrik.
  { fraga: "vad är ex-dagen?", motor: 38 },
  // Omgång 18: kreditdjup (s6-u2) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är kreditpremien?", motor: 39 },
  { fraga: "vad är kreditrating?", motor: 39 },
  // Omgång 18: sektordjup (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "hur analyserar jag SaaS-bolag?", motor: 40 },
  { fraga: "hur analyserar jag halvledarbolag?", motor: 40 },
  { fraga: "hur analyserar jag försvarsbolag?", motor: 40 },
  { fraga: "vad är churn?", motor: 40 },
  { fraga: "vad är net revenue retention?", motor: 40 },
  { fraga: "vad är en foundry?", motor: 40 },
  { fraga: "vad är krigsmateriel?", motor: 40 },
  // Omgång 19: sektorskola 2 (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "hur analyserar jag läkemedelsbolag?", motor: 41 },
  { fraga: "hur analyserar jag detaljhandelsbolag?", motor: 41 },
  { fraga: "hur analyserar jag logistikbolag?", motor: 41 },
  { fraga: "vad är patentbranten?", motor: 41 },
  { fraga: "vad är en pipeline?", motor: 41 },
  { fraga: "vad är like-for-like?", motor: 41 },
  { fraga: "vad är lastmile?", motor: 41 },
  // Omgång 20: beteendemekanik (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är priming?", motor: 42 },
  { fraga: "vad är primingeffekten?", motor: 42 },
  { fraga: "vad är tillgänglighetsfällan?", motor: 42 },
  { fraga: "vad är övermod?", motor: 42 },
  { fraga: "vad är overconfidence?", motor: 42 },
  { fraga: "vad är kompetensillusionen?", motor: 42 },
  // Omgång 20: pe-mekanik (s6-u1) — kanoniska ur lagrets tre sektioner.
  { fraga: "hur fungerar irr och förvärvsmaskinen?", motor: 43 },
  { fraga: "vad är internräntan?", motor: 43 },
  { fraga: "vad är lbo?", motor: 43 },
  { fraga: "vad är utfasningar?", motor: 43 },
  { fraga: "vad är vattenfallet?", motor: 43 },
  { fraga: "vad är carried interest?", motor: 43 },
  // Omgång 21: riskpremie (s6-u1) — kanoniska ur lagrets egna formuleringar.
  { fraga: "vad är aktiernas riskpremie?", motor: 44 },
  { fraga: "vad är riskpremien?", motor: 44 },
  { fraga: "vad är aktieriskpremien?", motor: 44 },
  { fraga: "hur räknar man ut riskpremien?", motor: 44 },
  { fraga: "vad är premie per riskenhet?", motor: 44 },
  // Omgång 20: överlevnadsdjup (s6-u2) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är likviditetsreserven?", motor: 45 },
  { fraga: "vad är överlevnadstid?", motor: 45 },
  { fraga: "hur länge räcker kassan?", motor: 45 },
  { fraga: "vad är kassaräckvidd?", motor: 45 },
  { fraga: "vad är altman z-score?", motor: 45 },
  { fraga: "vad är z-score?", motor: 45 },
  { fraga: "vad är konkursprognos?", motor: 45 },
  { fraga: "vad är konkursrisk?", motor: 45 },
  // Omgång 21: koncernläsning (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är koncernredovisning?", motor: 46 },
  { fraga: "vad är minoritetsintressen?", motor: 46 },
  { fraga: "vad är moderbolag?", motor: 46 },
  { fraga: "vad är segmentrapportering?", motor: 46 },
  { fraga: "vad är affärsområden?", motor: 46 },
  { fraga: "vad är pensionsåtaganden?", motor: 46 },
  { fraga: "vad är pensionsskulden?", motor: 46 },
  // Omgång 21: tillväxtdjup (s6-u2) — kanoniska ur lagrets egna rubriker
  // («vad är organisk tillväxt?»/«vad är volym pris och mix?» landar hos
  // BAS-motorn — deras monster [tillvaxt]/[kostnad]; se motordef-kommentaren).
  { fraga: "vad är s-kurvan?", motor: 47 },
  { fraga: "vad är mättnad?", motor: 47 },
  { fraga: "vad är marknadsmättnad?", motor: 47 },
  { fraga: "vad är utrymmesräkning?", motor: 47 },
  { fraga: "vad är prismix?", motor: 47 },
  { fraga: "vad är mixeffekten?", motor: 47 },
  { fraga: "vad är prisvolym?", motor: 47 },
  { fraga: "vad är produktmix?", motor: 47 },
  { fraga: "vad är tillväxtmotorer?", motor: 47 },
  { fraga: "vad är intäktsmotorer?", motor: 47 },
  // Omgång 22 (tredje instansen): faktordjup (s6-u1) — kanoniska ur
  // lagrets egna rubriker («vad är betat?»/«vad är smart beta?» =
  // riskmåttsdjupets, «vad är sharpe-kvoten?» dito, «vad är aktiernas
  // riskpremie?» = riskpremielagrets, «vad är faktorer?» plural stryks
  // («sektorer», tavstånd 2) — deras frågor, dokumenterade gränser; se
  // motordef-kommentaren).
  { fraga: "vad är faktorpremier?", motor: 48 },
  { fraga: "vad är faktorpremierna?", motor: 48 },
  { fraga: "vad är en faktor?", motor: 48 },
  { fraga: "vad är momentum?", motor: 48 },
  { fraga: "vad är värdefaktorn?", motor: 48 },
  { fraga: "vad är storleksfaktorn?", motor: 48 },
  { fraga: "vad är lågvolatilitetsanomalin?", motor: 48 },
  { fraga: "vad är femfaktormodellen?", motor: 48 },
  { fraga: "vad är faktorzoo?", motor: 48 },
  // «vad är det tysta betat?» STRYKS (kedjetest-fånga): riskmåttsdjupets
  // «beta» (tolerans 1) fångar böjningen «betat» — deras fråga; kursens
  // signaturfras bärs i faktordjup-svarets TEXT, aldrig som kärnord.
  // Omgång 22: bokmastar (s6-u3) — kanoniska ur lagrets egna rubriker
  // («vad är tulpanmanin?» = historia, «vad är blankning?» = praktik och
  // «hur ljuger en årsredovisning?» = basens rapportläsning — deras
  // frågor, dokumenterade gränser; se motordef-kommentaren).
  { fraga: "vad är financial shenanigans?", motor: 49 },
  { fraga: "vad är redovisningstrick?", motor: 49 },
  { fraga: "vad är resultatmassaging?", motor: 49 },
  { fraga: "vad är quality of earnings?", motor: 49 },
  { fraga: "vad är kreativ redovisning?", motor: 49 },
  { fraga: "vad är manias panics and crashes?", motor: 49 },
  { fraga: "vad är spekulativ mani?", motor: 49 },
  { fraga: "vad är this time is different?", motor: 49 },
  { fraga: "vad är krashhistoria?", motor: 49 },
  { fraga: "vad är special situations?", motor: 49 },
  { fraga: "vad är spin off?", motor: 49 },
  { fraga: "vad är merger arbitrage?", motor: 49 },
  { fraga: "vad är distress investing?", motor: 49 },
  // Omgång 22: riskbudget (s6-u2) — kanoniska ur lagrets egna rubriker
  // («vad är volatilitet?»/«vad är risk?» = basens risk-monster, «vad är
  // riskparitet?» = portföljbalansen, «vad är sharpe-kvoten?» = riskmåtts-
  // djupet — deras frågor, dokumenterade gränser; se motordef-kommentaren).
  { fraga: "vad är volatilitetsbudgeten?", motor: 50 },
  { fraga: "vad är volatilitetsbudget?", motor: 50 },
  { fraga: "vad är riskbudget?", motor: 50 },
  { fraga: "vad är sortino?", motor: 50 },
  { fraga: "vad är sortino-kvoten?", motor: 50 },
  { fraga: "vad är calmar?", motor: 50 },
  { fraga: "vad är calmar-kvoten?", motor: 50 },
  { fraga: "vad är tre mått tre frågor?", motor: 50 },
  // Omgång 22 (omstart): konvertibel (s6-u1) — kanoniska ur lagrets egna
  // kärnord («vad är kapitalstrukturen?» = basens monster — deras fråga,
  // dokumenterad gräns; bärs som fragor:-knapp; se motordef-kommentaren).
  { fraga: "vad är en konvertibel?", motor: 51 },
  { fraga: "vad är konvertibler?", motor: 51 },
  { fraga: "vad är hybridkapital?", motor: 51 },
  { fraga: "vad är konverteringskursen?", motor: 51 },
  { fraga: "vad är konverteringspremien?", motor: 51 },
  { fraga: "vad är paritetsvärdet?", motor: 51 },
  { fraga: "vad är en preferensaktie?", motor: 51 },
  { fraga: "vad är stämpelordningen?", motor: 51 },
  { fraga: "vad är kapitaltrappan?", motor: 51 },
  { fraga: "vad är at1-kapital?", motor: 51 },
  { fraga: "vad är additional tier 1?", motor: 51 },
  { fraga: "vad är en nollskrivning?", motor: 51 },
  { fraga: "vad är evighetsräntan?", motor: 51 },
  // Omgång 23: sektorläsning (s6-u2) — kanoniska ur lagrets egna
  // rubriker («vad är oljepriset?» = ingen ägare i kedjan — makro-
  // familjens blomma, dokumenterad gräns i modulens kommentar; «vad är
  // en moat?» = extra-lagrets, bärs som knapp ur svaren).
  { fraga: "hur analyserar jag ett energibolag?", motor: 52 },
  { fraga: "hur analyserar jag ett telekombolag?", motor: 52 },
  // Omgång 23: vardegrund (s6-u3) — kanoniska ur lagrets egna kärnord
  // («vad är DCF?»/«vad är inre värde?»/«vad är substansvärde?» = nästas,
  // «vad är fcf yield?»/«vad är price to cash flow?» = extras, «vad är
  // wacc?» = lönsamhetsdjupets — deras frågor, dokumenterade gränser;
  // bärs som fragor:-knappar; se motordef-kommentaren).
  { fraga: "vad är motiverat värde?", motor: 53 },
  { fraga: "vad är intrinsic value?", motor: 53 },
  { fraga: "hur räknar man ut motiverat värde?", motor: 53 },
  { fraga: "vad är fair value?", motor: 53 },
  { fraga: "vad är verkligt värde?", motor: 53 },
  { fraga: "vad är realoptioner?", motor: 53 },
  { fraga: "vad är en realoption?", motor: 53 },
  { fraga: "vad är kassaflödesavkastning?", motor: 53 },
  { fraga: "hur räknar man ut kassaflödesavkastning?", motor: 53 },
  { fraga: "vad är asset based valuation?", motor: 53 },
  // Omgång 23: realekonomi (s6-u1) — kanonisk ur lagrets paraplyfråga
  // («vad är rsi?»-familjen = basens teknisk-analys-monster, rond 2:s
  // dödade förstavalet — dokumenterad gräns i modulens kommentar;
  // «vad är inflation och KPI?» = makro-lagrets och «vad är
  // konjunkturindikatorer?» = tidsaxelns, bärs som knappar ur svaret).
  { fraga: "vad är realekonomin?", motor: 54 },
  // Omgång 24: försäkring + krypto (s6-u1) — kanoniska ur lagrets egna
  // kärnord («vad är försäkring?» naket = beteendedjupets «förankring»,
  // tav 2 inom 10-bokstaversordens tolerans — dokumenterad gräns i
  // modulens kommentar; «vad är en moat?» = extras, «vad är
  // volatilitet?» = basens risk-monster, «vad är terminer?» = nästas —
  // deras frågor, dokumenterade gränser; bärs som fragor:-knappar).
  { fraga: "vad är combined ratio?", motor: 55 },
  { fraga: "vad är en combined ratio?", motor: 55 },
  { fraga: "hur räknar man ut combined ratio?", motor: 55 },
  { fraga: "vad är floaten?", motor: 55 },
  { fraga: "vad är float?", motor: 55 },
  { fraga: "vad är försäkringssektorn?", motor: 55 },
  { fraga: "hur analyserar jag försäkringsbolag?", motor: 55 },
  { fraga: "vad är premieinkomster?", motor: 55 },
  { fraga: "vad är underwriting?", motor: 55 },
  { fraga: "vad är teckningsresultat?", motor: 55 },
  { fraga: "vad är krypto?", motor: 55 },
  { fraga: "vad är kryptovalutor?", motor: 55 },
  { fraga: "vad är bitcoin?", motor: 55 },
  { fraga: "vad är blockchain?", motor: 55 },
  { fraga: "vad är blockkedjan?", motor: 55 },
  { fraga: "vad är ethereum?", motor: 55 },
  // Omgång 24: moatdjup (s6-u2) — kanoniska ur lagrets egna kärnord
  // («vad är en moat?»/«vallgraven i siffror?» = extra-lagrets,
  // «vad är kostnadsöverlägsenhet?»/«vad är kvalitetspremien?» NULL
  // men medvetet ej kärnord — dokumenterade gränser i modulens
  // kommentar; bärs som knappar/källor, aldrig kärnord).
  { fraga: "vad är prisfullmakten?", motor: 56 },
  { fraga: "vad är prisfullmakt?", motor: 56 },
  { fraga: "hur testar man prisfullmakten?", motor: 56 },
  { fraga: "vad är byteskostnader?", motor: 56 },
  { fraga: "vad är byteskostnad?", motor: 56 },
  { fraga: "vad är inlåsningseffekten?", motor: 56 },
  // Omgång 24: nya territorier (s6-u3) — kanoniska ur lagrets egna kärnord
  // («vad är en tillverkad katalysator?» = basens (naked katalysator),
  // «vad är substansvärde?» = nästas, «vad är en bolagsstämma?» = ägandes,
  // «vad är räntan?» = makros, «hur påverkar bostadsmarknaden börsen?» =
  // basens påverkar-form — deras frågor, dokumenterade gränser i modulens
  // kommentar; bärs som knappar ur svaren).
  { fraga: "vad är en aktivist?", motor: 57 },
  { fraga: "vad är aktivism?", motor: 57 },
  { fraga: "vad är ett kravbrev?", motor: 57 },
  { fraga: "vad är en aktiekampanj?", motor: 57 },
  { fraga: "vad är guidningen?", motor: 57 },
  { fraga: "vad är guidning?", motor: 57 },
  { fraga: "vad är bolagets prognos?", motor: 57 },
  { fraga: "hur fungerar bostadsmarknaden?", motor: 57 },
  { fraga: "vad är lånekraft?", motor: 57 },
  { fraga: "vad är demografi?", motor: 57 },
  { fraga: "vad är befolkningspyramiden?", motor: 57 },
  // 2026-09-20 omgång 25 (s6-u1): etfmekanik — kanoniska ur lagrets egna
  // rubriker; gränserna sondbekäftade: praktiken äger naket index/etf,
  // nästas nav, basens hävstång, portfölj-praktikens rebalansering.
  { fraga: "vad är en börshandlad fond?", motor: 58 },
  { fraga: "vad är en auktoriserad deltagare?", motor: 58 },
  // s6-u2-harmonisering (omg 25, dokumenterad): de två ursprungliga
  // formuleringarna «hur skapas etf-andelar?»/«vad är etf-arbitrage?» var
  // strukturellt skuggade — praktik äger naket «etf» (kort exakt match på
  // ordet i frågan) och ligger FÖRE i kedjan, så etfmekanikens
  // «etf-arbitrage»-fras kan aldrig nås av en fråga med naket etf-ord.
  // Raderna bär i stället lagrets EGNA kärnordsformuleringar (sondverifierat:
  // etfmekanik=true, praktik=false): «skapelse»+«inlösen» (am-08:s
  // rubrikkärna) och «flashdagen» (6 maj 2010, lagrets signaturhändelse).
  { fraga: "vad är skapelse och inlösen?", motor: 58 },
  { fraga: "vad är flashdagen?", motor: 58 },
  { fraga: "vad är contango?", motor: 58 },
  { fraga: "vad är backwardation?", motor: 58 },
  { fraga: "vad är en hävstångsetf?", motor: 58 },
  { fraga: "vad är spårningsavvikelsen?", motor: 58 },
  { fraga: "vad är indexomläggningen?", motor: 58 },
  { fraga: "vad är effektdagen?", motor: 58 },
  // 2026-09-20 omgång 25 (s6-u2): kontrahent — kanoniska ur lagrets egna
  // rubriker; gränserna sondbekräftade: «ccp» stryket (granne «ccc»),
  // «lehman» historiens, basens «initial margin»/«variation margin» och
  // bank-formuleringen — deras frågor, dokumenterade gränser; bärs som
  // knappar/text, aldrig kärnord.
  { fraga: "vad är kontrahentrisk?", motor: 59 },
  { fraga: "vad är en kontrahent?", motor: 59 },
  { fraga: "vem är motparten?", motor: 59 },
  { fraga: "vad är motpartsrisk?", motor: 59 },
  { fraga: "vad är netting?", motor: 59 },
  { fraga: "vem står på andra sidan när det blåser?", motor: 59 },
  { fraga: "vad är ett clearinghus?", motor: 59 },
  { fraga: "vad är en clearingcentral?", motor: 59 },
  { fraga: "vad är collateral?", motor: 59 },
  { fraga: "vad är en garantifond?", motor: 59 },
  { fraga: "vad är en haircut?", motor: 59 },
  { fraga: "vad är säkerhetskrav?", motor: 59 },
  { fraga: "vad är default-trappan?", motor: 59 },
  // 2026-09-20 omgång 26: optionshantverk (s6-u3) — kanoniska ur lagrets
  // egna rubriker (index 63 = LIVE-läget av _s6u3o26-kanoniska.mjs; värdet
  // verifieras av fall G:s komponentordning varje körning).
  { fraga: "vad är binomialträdet?", motor: 63 },
  { fraga: "vad är en straddle?", motor: 63 },
  { fraga: "vad är delta?", motor: 63 },
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
  { fraga: "vad är räntenetto?",   motor: 5 },
  { fraga: "vad är substansvärde?", motor: 3 },
  { fraga: "vad är utspädning?",   motor: 4 },
  { fraga: "vad är indexfonder?",  motor: 8 },
  // Nya lagers gränser (rond 50): basens värderings-/aktieslagsfamiljer ligger
  // nära djup- respektive ägande-lagrets kärnord — kedjan måste skilja dem.
  { fraga: "vad är rösträtt?", motor: 11 },
  { fraga: "vad är jämförelsebolag?", motor: 13 },
  // Stabilitetsdjup-lagrets dokumenterade ansvarsgränser (omgång 13):
  // basen äger GRUNDORDEN — stabilitetsdjupet bär bara familjeorden.
  { fraga: "vad är soliditet?", motor: 2 },
  { fraga: "hur stresstestar jag en balansräkning?", motor: 2 },
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
  "sextiofem motorer lämnar frågan ifred",
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
