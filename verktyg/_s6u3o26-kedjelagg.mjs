/**
 * _s6u3o26-kedjelagg.mjs — lägger optionshantverks-lagret i kedjetestet
 * (manifest auto-s6-1789890903364, omgång 26, s6-u3). IDEMPOTENT och
 * racetålt: syskon (u1/u2) skriver samma fil parallellt — skriptet läser
 * FÄRSKT, infogar endast saknade delar, beräknar motorindex LIVE och
 * skriver EN gång. Omkrörning vid viloläge mellan läsning och skrivning
 * (jämför innehåll) — förlorare omkrörs oskadat.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const FIL = join(HÄR, "testa-ai-mentor-kedja.mjs");

const MOTORDEF_RAD =
  '  { namn: "optionshantverk", fil: "ai-mentor-optionshantverk-fragor.ts", fn: "svaraLokaltOptionshantverk", arr: "OPTIONSHANTVERK_MONSTER", antal: 3 },';
const MOTORDEF_BLOCK = [
  "  // 2026-09-20 omgång 26 (manifest auto-s6-1789890903364): optionshantverk",
  "  // (s6-u3 — optionspositionens tre verkstadsgolv: priset (od-08 binomial-",
  "  // trädet/replikeringen, FÖDD 2026-09-20 av spår 5 u3 — mentorväglös",
  "  // sedan födelsen) + konstruktionen (od-04 straddle/strangle/prisspridning)",
  "  // + förvaltningen (od-06 delta/thetans hyra/förfallodagen). od-05",
  "  // aktiveras som KÄLLA ⇒ OPTIONS & DERIVAT FULLT MENTORLÄNKAD 8/8. Sond",
  "  // _s6u3o26-sond.mjs: hela familjen NULL med 0 grannar; dokumenterade",
  "  // gränser «collar» (portföljgrund) · «prisspridning» (bas) · «ex-dagen»",
  "  // (utdelningskalender) · «omhedging» (valutamekanik) · naket «option»",
  "  // (nästa) — ENDAST sammansättningarna bär. FÖRSTA valet (riskens",
  "  // adresser) togs på disk av u1 100 s före — nedställning bokförd i",
  "  // auto-s6-1789890903364-s6-u3-ansprak.md v2. KANONISKA-poster bärs AV",
  "  // DETTA LAGERS EGNA TEST (multipel-precedensen). 65:e motorn, FÖRE",
  "  // marknadsrytm — deras SIST-deklaration + testfall L01 respekteras.",
  MOTORDEF_RAD,
].join("\n");

for (let forsok = 0; forsok < 5; forsok++) {
  const fore = readFileSync(FIL, "utf8");
  if (fore.includes('namn: "optionshantverk"')) {
    console.log("MOTORDEF finns redan — idempotent hopp");
    break;
  }
  // 1. MOTORDEF: efter balansdjup-raden (eller före marknadsrytm-raden om
  //    balansdjup saknas — okänd framtidsordning), alltid FÖRE marknadsrytm.
  let ut = fore;
  const balans = ut.indexOf('namn: "balansdjup"');
  const markrytm = ut.indexOf('namn: "marknadsrytm"');
  const anchorBalans = ut.indexOf("\n", balans) + 1; // efter balansdjup-raden
  const anchorRytm = ut.lastIndexOf("\n", markrytm - 2) + 1; // början av marknadsrytm-blockets rad? — använd raden före def-raden
  // Enkel strategi: slutet av balansdjup-def-raden om den finns, annars
  // raden omedelbart före marknadsrytm-def-raden.
  let insPoint;
  if (balans >= 0) {
    insPoint = anchorBalans;
  } else {
    // klipp in strax före marknadsrytm-KOMMENTARSBLOCKET: hitta sista
    // def-radens slut före marknadsrytm-def
    insPoint = ut.lastIndexOf("\n", ut.lastIndexOf("\n", markrytm - 2) - 1) + 1;
  }
  ut = ut.slice(0, insPoint) + MOTORDEF_BLOCK + "\n" + ut.slice(insPoint);

  // 2. TOTALT-kommentar: 176 ( → 179 ( + ny förpost
  ut = ut.replace(
    "const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 176 (2026-09-20 omgång 26:",
    "const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 179 (2026-09-20 omgång 26: optionshantverk +3 — binomialträdet/replikeringen + straddlen + deltat (s6-u3, manifest auto-s6-1789890903364), aktiverar od-08/od-04/od-06 + od-05 som källa = OPTIONS & DERIVAT fullt länkad 8/8, 65:e motorn FÖRE marknadsrytm som förblir SIST [66:e]; balansdjup +2 — lagervärderingen + obeskattade reserver (s6-u2), aktiverar bk-07 + bk-06 = BOKFÖRING & ÅRSREDOVISNING fullt länkad 19/19, 63:e motorn; riskadress +1 — riskens adresser (s6-u1), aktiverar rs-06/07/08/09, 62:a motorn. Omgång 25 (2026-09-20):",
  );

  // 3. Tre kanoniska — motorindex BERÄKNAT LIVE ur MOTORDEFS efter insert.
  const snitt = ut.slice(ut.indexOf("const MOTORDEFS = ["), ut.indexOf("];", ut.indexOf("const MOTORDEFS = [")) + 2);
  const MOTORDEFS = eval(snitt + "; MOTORDEFS");
  const idx = MOTORDEFS.findIndex((m) => m.namn === "optionshantverk");
  if (idx < 0) throw new Error("motordef saknas efter insert");
  const KAN = [
    "  // 2026-09-20 omgång 26: optionshantverk (s6-u3) — kanoniska ur lagrets",
    "  // egna rubriker; index beräknat LIVE av _s6u3o26-kedjelagg.mjs.",
    '  { fraga: "vad är binomialträdet?", motor: ' + idx + " },",
    '  { fraga: "vad är en straddle?", motor: ' + idx + " },",
    '  { fraga: "vad är delta?", motor: ' + idx + " },",
  ].join("\n");
  const kanStart = ut.indexOf("const KANONISKA = [");
  const kanSlut = ut.indexOf("];", kanStart);
  ut = ut.slice(0, kanSlut) + KAN + "\n" + ut.slice(kanSlut);

  // 4. Skriv EN gång — om filen ändrats under oss: jämför och omkrör.
  const nu = readFileSync(FIL, "utf8");
  if (nu !== fore) {
    console.log("race upptäckt (försök " + (forsok + 1) + ") — omkrör");
    continue;
  }
  writeFileSync(FIL, ut);
  console.log("MOTORDEF + TOTALT(179) + 3 kanoniska (motor " + idx + ") skrivna — motorer " + MOTORDEFS.length + " · monsters " + MOTORDEFS.reduce((s, d) => s + d.antal, 0));
  break;
}
