/**
 * _s6u2o27-aterapplicera.mjs — återapplicerar volatilitetsmekaniks samtliga
 * kedjeteständringar (omgång 27, s6-u2, manifest auto-s6-1789912510460)
 * EFTER ett syskons fullträds-återställning till HEAD raderade dem.
 * IDEMPOTENT + ATOMISK: varje steg kontrolleras före infogning.
 *   1. MOTORDEFS-rad efter pengarstid, FÖRE marknadsrytm
 *   2. Fem kanoniska A-fallsrader i KANONISKA-änden
 *   3. C-fallets motorräkningssträng
 *   4. TOTALT-kommentaren (nytt utfallY-segment först)
 * Mönster: _s6u2c-aterapplicera.mjs (omgång 26, bevisat).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const FIL = join(HÄR, "testa-ai-mentor-kedja.mjs");
let txt = readFileSync(FIL, "utf8");
const fore = txt;

// 1. MOTORDEFS-rad
if (!txt.includes('"volatilitetsmekanik"')) {
  const ANKARE = '  { namn: "pengarstid", fil: "ai-mentor-pengarstid-fragor.ts", fn: "svaraLokaltPengarstid", arr: "PENGARSTID_MONSTER", antal: 2 },';
  if (txt.split(ANKARE).length - 1 !== 1) { console.error("ATENTION: pengarstid-ankaret felaktigt"); process.exit(1); }
  txt = txt.replace(ANKARE, ANKARE + `\n  // 2026-09-20 omgång 27 (manifest auto-s6-1789912510460): volatilitetsmekanik\n  // (s6-u2 — varifrån bruset kommer och vad det kostar: volatilitetsdraget +\n  // marginaltrappan, 2 monsters). Aktiverar rp-06 (född 2026-09-20 av spår 5,\n  // mentorväglös sedan födelsen — rs-09-precedensen) + ln-03. KOLLISION-NOT:\n  // första planen bar marginalhandeln (am-09) men s6-u1:s parallella lager\n  // äger det territoriet helt — monster 2 bytt till marginaltrappan, 0\n  // kärnordsöverlapp kontrollerat. Efter pengarstid, FÖRE marknadsrytm (SIST).\n  { namn: "volatilitetsmekanik", fil: "ai-mentor-volatilitetsmekanik-fragor.ts", fn: "svaraLokaltVolatilitetsmekanik", arr: "VOLATILITETSMEKANIK_MONSTER", antal: 2 },`);
  console.log("1. MOTORDEFS-rad infogad");
} else console.log("1. MOTORDEFS-rad fanns redan");

// 2. Kanoniska rader — infoga efter sista delta-raden i KANONISKA
if (!txt.includes('"vad är volatilitetsdraget?", motor:')) {
  const DELTA = '  { fraga: "vad är delta?", motor: 63 },';
  if (txt.split(DELTA).length - 1 !== 1) { console.error("ATENTION: delta-ankaret felaktigt (antal " + (txt.split(DELTA).length - 1) + ")"); process.exit(1); }
  txt = txt.replace(DELTA, DELTA + `\n  // 2026-09-20 omgång 27 (manifest auto-s6-1789912510460): volatilitetsmekanik\n  // (s6-u2) — kanoniska ur lagrets egna rubriker. Index 65 = LIVE-läget\n  // (66:e motorn av 67; FÖRE marknadsrytm som förblir SIST).\n  { fraga: "vad är volatilitetsdraget?", motor: 65 },\n  { fraga: "vad är variansdraget?", motor: 65 },\n  { fraga: "vad är spegelparet?", motor: 65 },\n  { fraga: "vad är marginaltrappan?", motor: 65 },\n  { fraga: "vad är täckningsbidraget?", motor: 65 },`);
  console.log("2. kanoniska rader infogade (motor 65)");
} else console.log("2. kanoniska rader fanns redan");

// 3. C-fallets räknasträng
txt = txt.replace('"sextiosex motorer lämnar frågan ifred"', '"sextiosju motorer lämnar frågan ifred"');

// 4. TOTALT-kommentar — nytt segment först (om vårt segment saknar)
if (!txt.includes("// 183 (2026-09-20 omgång 27: volatilitetsmekanik")) {
  const m = txt.match(/const TOTALT = MOTORDEFS\.reduce\(\(s, d\) => s \+ d\.antal, 0\); \/\/ (\d+) /);
  if (!m) { console.error("ATENTION: TOTALT-kommentaren hittades inte"); process.exit(1); }
  const nySegment = "// 183 (2026-09-20 omgång 27: volatilitetsmekanik +2 — varifrån bruset kommer och vad det kostar: volatilitetsdraget (rp-06 primär, källor rp-04 + rp-05) + marginaltrappan (ln-03 primär, källor ln-01 + v07) (s6-u2, manifest auto-s6-1789912510460), aktiverar rp-06 + ln-03, 66:e motorn efter pengarstid FÖRE marknadsrytm som förblir SIST [66:e av 67]; återapplicering efter syskons fullträdsåterställning). Tidigare " + m[1] + " (";
  txt = txt.replace(/const TOTALT = MOTORDEFS\.reduce\(\(s, d\) => s \+ d\.antal, 0\); \/\/ \d+ \(/, "const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); " + nySegment);
  console.log("4. TOTALT-kommentar uppdaterad (" + m[1] + " → 183)");
}

if (txt !== fore) { writeFileSync(FIL, txt); console.log("SKRIVEN: testa-ai-mentor-kedja.mjs"); }
else console.log("INGEN ÄNDRING behövdes");
