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
 *   E  källmärkning — ALLA monsters (119 i fyrtiotre motorer) bygga() ger
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
  { namn: "praktik",        fil: "ai-mentor-praktik-fragor.ts",        fn: "svaraLokaltPraktik",        arr: "PRAKTIK_MONSTER",        antal: 3 },
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
  // 2026-09-18 omgång 20 (samma trefönster): överlevnadsdjup (s6-u2 —
  // likviditetsreserven st-06 + konkursprognos/Altman Z-score st-03, STABI-
  // LITETs två mentorväglösa djupkurser; sond _s6u2-sond-omg20.mjs: hela
  // överlevnads-familjen NULL genom kedjan; motordef här för G-fallets
  // widget-spegling — kanoniska rader bärs av deras eget leveranstest).
  { namn: "överlevnadsdjup", fil: "ai-mentor-overlevnadsdjup-fragor.ts", fn: "svaraLokaltOverlevnadsdjup", arr: "OVERLEVNADSDJUP_MONSTER", antal: 2 },
];

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of MOTORDEFS) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn], monster: modul[d.arr] });
}
const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 119 (2026-09-18 omgång 20: beteendemekanik +3, pe-mekanik +1, överlevnadsdjup +2 — 43-läget)

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
  { fraga: "vad är blankning?",          motor: 7 },
  { fraga: "vad är valutarisk?",         motor: 8 },
  { fraga: "vad är diversifiering?",     motor: 8 },
  { fraga: "vad är bolagsstämma?",       motor: 9 },
  { fraga: "vad är avskrivningar?",      motor: 10 },
  { fraga: "vad är värderingsmultipel?", motor: 11 },
  { fraga: "vad är tulpanmanin?",        motor: 12 },
  { fraga: "vad är dupont-analysen?",    motor: 13 },
  { fraga: "vad är fibonacci retracements?", motor: 14 },
  { fraga: "vad är personaloptioner?",  motor: 15 },
  { fraga: "vad är kapitalförsäkring?",  motor: 15 },
  { fraga: "vad är bekräftelsefällan?", motor: 16 },
  { fraga: "vad är en skuldfälla?",    motor: 17 },
  { fraga: "vad är en svart svan?",    motor: 17 },
  { fraga: "vad är sharpe-kvoten?",    motor: 18 },
  { fraga: "vad är utdelningsfällor?", motor: 19 },
  { fraga: "vad är aktieåterköp?",     motor: 19 },
  { fraga: "vad är förväntningsanalys?", motor: 20 },
  { fraga: "vad är förväntningsgapet?",  motor: 20 },
  { fraga: "vad är kalibrering?",        motor: 20 },
  { fraga: "vad är rebalansering?",      motor: 21 },
  { fraga: "vad är känslighetsanalys?",  motor: 22 },
  { fraga: "vad är stresstest?",         motor: 22 },
  { fraga: "vad är soliditetsgrad?",     motor: 22 },
  { fraga: "vad är balansstyrka?",       motor: 22 },
  { fraga: "vad är en net-net och NCAV?", motor: 23 },
  { fraga: "vad är cigar butts?",        motor: 23 },
  { fraga: "vem är mr market?",          motor: 23 },
  // Omgång 14: varderjustering (normalisering är deras egna fråga — "vad är
  // wacc?" ägs fortfarande av lonsamhetsdjup och "vad är cape?" av
  // case/riskmåttsdjup, deras dokumenterade ansvarsfördelning),
  // optionsdjup + risklasningsdjup.
  { fraga: "vad är normalisering?",     motor: 24 },
  { fraga: "vad är en köpoption?",      motor: 25 },
  { fraga: "vad är kundkoncentration?", motor: 26 },
  { fraga: "vad är en riskmatris?",     motor: 26 },
  { fraga: "hur läser jag riskavsnittet?", motor: 26 },
  // Omgång 15: avkastningskurva (s6-u1) + avkastningsdjup (u2) +
  // värderingsverktyg (u3) — kanoniska ur deras egna rubriker.
  { fraga: "vad är den omvända avkastningskurvan?", motor: 27 },
  { fraga: "vad är avkastningskällor?", motor: 28 },
  { fraga: "vad är tvärsnittsanalys?",  motor: 28 },
  { fraga: "vad är scenarioanalys?",    motor: 29 },
  // Omgång 16: warrant (s6-u1) + tidsaxel (syskon u2, samma fönster) —
  // kanoniska ur lagrens egna rubriker.
  { fraga: "vad är warranter och teckningsoptioner?", motor: 30 },
  { fraga: "vad är konjunkturindikatorer?", motor: 31 },
  { fraga: "vad är refinansieringsmuren?",  motor: 31 },
  { fraga: "vad är rörelsekapital?", motor: 32 },
  { fraga: "vad är kassakonverteringscykeln?", motor: 32 },
  { fraga: "vad är lageromsättning?", motor: 32 },
  // Omgång 17: ekosystemdjup (s6-u2) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är SAM-viktningen?", motor: 33 },
  { fraga: "vad är röstlängdningen?", motor: 33 },
  { fraga: "vad är en backtest?", motor: 33 },
  { fraga: "vad är monte carlo-simulering?", motor: 33 },
  // Omgång 17: handelsdag (s6-u1) — kanonisk ur lagrets egen rubrik.
  { fraga: "hur fungerar handelsdagen?", motor: 34 },
  // Omgång 17: portföljpraktik (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "hur stor ska en aktieposition vara?", motor: 35 },
  { fraga: "vad är tax-loss harvesting?", motor: 35 },
  { fraga: "vad är pensionssparande?", motor: 35 },
  // Omgång 18: utdelningskalender (s6-u1) — kanonisk ur lagrets egen rubrik.
  { fraga: "vad är ex-dagen?", motor: 36 },
  // Omgång 18: kreditdjup (s6-u2) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är kreditpremien?", motor: 37 },
  { fraga: "vad är kreditrating?", motor: 37 },
  // Omgång 18: sektordjup (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "hur analyserar jag SaaS-bolag?", motor: 38 },
  { fraga: "hur analyserar jag halvledarbolag?", motor: 38 },
  { fraga: "hur analyserar jag försvarsbolag?", motor: 38 },
  { fraga: "vad är churn?", motor: 38 },
  { fraga: "vad är net revenue retention?", motor: 38 },
  { fraga: "vad är en foundry?", motor: 38 },
  { fraga: "vad är krigsmateriel?", motor: 38 },
  // Omgång 19: sektorskola 2 (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "hur analyserar jag läkemedelsbolag?", motor: 39 },
  { fraga: "hur analyserar jag detaljhandelsbolag?", motor: 39 },
  { fraga: "hur analyserar jag logistikbolag?", motor: 39 },
  { fraga: "vad är patentbranten?", motor: 39 },
  { fraga: "vad är en pipeline?", motor: 39 },
  { fraga: "vad är like-for-like?", motor: 39 },
  { fraga: "vad är lastmile?", motor: 39 },
  // Omgång 20: beteendemekanik (s6-u3) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är priming?", motor: 40 },
  { fraga: "vad är primingeffekten?", motor: 40 },
  { fraga: "vad är tillgänglighetsfällan?", motor: 40 },
  { fraga: "vad är övermod?", motor: 40 },
  { fraga: "vad är overconfidence?", motor: 40 },
  { fraga: "vad är kompetensillusionen?", motor: 40 },
  // Omgång 20: pe-mekanik (s6-u1) — kanoniska ur lagrets tre sektioner.
  { fraga: "hur fungerar irr och förvärvsmaskinen?", motor: 41 },
  { fraga: "vad är internräntan?", motor: 41 },
  { fraga: "vad är lbo?", motor: 41 },
  { fraga: "vad är utfasningar?", motor: 41 },
  { fraga: "vad är vattenfallet?", motor: 41 },
  { fraga: "vad är carried interest?", motor: 41 },
  // Omgång 20: överlevnadsdjup (s6-u2) — kanoniska ur lagrets egna rubriker.
  { fraga: "vad är likviditetsreserven?", motor: 42 },
  { fraga: "vad är överlevnadstid?", motor: 42 },
  { fraga: "hur länge räcker kassan?", motor: 42 },
  { fraga: "vad är kassaräckvidd?", motor: 42 },
  { fraga: "vad är altman z-score?", motor: 42 },
  { fraga: "vad är z-score?", motor: 42 },
  { fraga: "vad är konkursprognos?", motor: 42 },
  { fraga: "vad är konkursrisk?", motor: 42 },
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
  { fraga: "vad är indexfonder?",  motor: 7 },
  // Nya lagers gränser (rond 50): basens värderings-/aktieslagsfamiljer ligger
  // nära djup- respektive ägande-lagrets kärnord — kedjan måste skilja dem.
  { fraga: "vad är rösträtt?",         motor: 9 },
  { fraga: "vad är jämförelsebolag?",  motor: 11 },
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
  "fyrtiotre motorer lämnar frågan ifred",
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
