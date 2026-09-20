/**
 * _s6u2o27-slutsvep.mjs — FINAL konvergens för volatilitetsmekanik (omgång 27,
 * s6-u2, manifest auto-s6-1789912510460). Efter tre lost-update-raderingar av
 * syskonens harmoniseringspass samlas ALLA delade filändringar HÄR i ett
 * atomiskt, idempotent svep som läser widgetens LEVANDE kedja som sanning:
 *   1. Kedjetestets kanoniska rader (motorindex räknas LIVE ur MOTORDEFS)
 *   2. 41 sviters komponentankare (pengarstid→marknadsrytm-junktionen)
 *   3. marknadsrytm-kända (Set) + case (ordnad lista)
 *   4. multipel/optionshantverk L2 (exakt substring ur levande widget)
 * Kör FÖLJT AV verifiering + commit i samma kommandokedja.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const MIN = "svaraLokaltVolatilitetsmekanik";
const MIN_ARR = "VOLATILITETSMEKANIK_MONSTER";

// ── Levande widgetkedja (sanningen) ─────────────────────────────────────────
const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const kedjRad = widget.split("\n").find((l) => l.includes("const lokalt = "));
if (!kedjRad || !kedjRad.includes(MIN + "(q, KURSREGISTER)")) {
  console.error("ATENTION: widgetkedjan saknar " + MIN + " — återvajra widgeten först!");
  process.exit(1);
}
const P = "svaraLokaltPengarstid(q, KURSREGISTER)";
const M = "svaraLokaltMarknadsrytm(q, KURSREGISTER);";
const liveSegment = kedjRad.slice(kedjRad.indexOf(P), kedjRad.indexOf(M) + M.length);
console.log("Levande kedjesegment pengarstid→marknadsrytm: " + liveSegment.replace(/\(q, KURSREGISTER\)/g, ""));

// ── 1. Kedjetest: kanoniska rader + motorindex LIVE ─────────────────────────
{
  const FIL = join(HÄR, "testa-ai-mentor-kedja.mjs");
  let txt = readFileSync(FIL, "utf8");
  const snitt = txt.slice(txt.indexOf("const MOTORDEFS = ["), txt.indexOf("];", txt.indexOf("const MOTORDEFS = [")) + 2);
  const MD = eval(snitt + "; MOTORDEFS");
  const idx = MD.findIndex((d) => d.namn === "volatilitetsmekanik");
  if (idx === -1) { console.error("ATENTION: MOTORDEFS-raden saknas"); process.exit(1); }
  if (!txt.includes('"vad är volatilitetsdraget?", motor:')) {
    const DELTA = '  { fraga: "vad är delta?", motor: ' + (idx - 2) + " },";
    if ((txt.split(DELTA).length - 1) !== 1) { console.error("ATENTION: delta-ankaret stämmer ej (väntat motor " + (idx - 2) + ")"); process.exit(1); }
    txt = txt.replace(DELTA, DELTA + `\n  // 2026-09-20 omgång 27 (manifest auto-s6-1789912510460): volatilitetsmekanik\n  // (s6-u2) — kanoniska ur lagrets egna rubriker. Index ${idx} = LIVE-läget räknat\n  // ur MOTORDEFS (FÖRE marknadsrytm som förblir SIST). Slutsvep-raden.\n  { fraga: "vad är volatilitetsdraget?", motor: ${idx} },\n  { fraga: "vad är variansdraget?", motor: ${idx} },\n  { fraga: "vad är spegelparet?", motor: ${idx} },\n  { fraga: "vad är marginaltrappan?", motor: ${idx} },\n  { fraga: "vad är täckningsbidraget?", motor: ${idx} },`);
    writeFileSync(FIL, txt);
    console.log("1. kanoniska rader infogade (motor " + idx + ")");
  } else console.log("1. kanoniska rader fanns redan");
}

// ── 2. 41 sviters ankare ────────────────────────────────────────────────────
{
  const ANKARE = '"svaraLokaltMarknadsrytm",];';
  let andrade = 0, hoppade = 0;
  for (const f of readdirSync(HÄR).filter((x) => /^testa-ai-mentor-.*\.mjs$/.test(x)).sort()) {
    const sokVag = join(HÄR, f);
    let txt = readFileSync(sokVag, "utf8");
    if (!txt.includes("KOMPONENTER")) continue;
    if (txt.includes(MIN)) { hoppade++; continue; }
    if ((txt.split(ANKARE).length - 1) !== 1) continue;
    txt = txt.replace(ANKARE, '"' + MIN + '",\n    // Omgång 27 (auto-s6-1789912510460, s6-u2): volatilitetsmekanik — slutsvepet.\n    ' + ANKARE);
    writeFileSync(sokVag, txt);
    andrade++;
  }
  console.log("2. " + andrade + " sviter harmoniserade · " + hoppade + " hoppade");
}

// ── 3. marknadsrytm (Set) + case (ordnad lista) ─────────────────────────────
{
  const FIL = join(HÄR, "testa-ai-mentor-marknadsrytm.mjs");
  let txt = readFileSync(FIL, "utf8");
  if (!txt.includes('"' + MIN + '"')) {
    const ANK = '"svaraLokaltMarknadsrytm",';
    const pos = txt.indexOf(ANK);
    if (pos === -1) { console.error("ATENTION: marknadsrytm-ankaret saknas"); process.exit(1); }
    txt = txt.slice(0, pos) + '"' + MIN + '",\n            ' + txt.slice(pos);
    writeFileSync(FIL, txt);
    console.log("3a. marknadsrytm-kända + " + MIN);
  } else console.log("3a. marknadsrytm fanns redan");
  if (!txt.includes('"svaraLokaltModernaRisker"')) {
    const ANK2 = '"svaraLokaltMakro", "svaraLokaltExtra",';
    if (txt.includes(ANK2)) {
      let t2 = readFileSync(FIL, "utf8");
      t2 = t2.replace(ANK2, ANK2 + ' "svaraLokaltModernaRisker",');
      writeFileSync(FIL, t2);
      console.log("3a2. modernarisk dokumenterad i marknadsrytm-kända (konvergens)");
    }
  }
}
{
  const FIL = join(HÄR, "testa-ai-mentor-case.mjs");
  let txt = readFileSync(FIL, "utf8");
  if (!txt.includes('"' + MIN + '(q, KURSREGISTER)"')) {
    const ANK = '"svaraLokaltMarknadsrytm(q, KURSREGISTER)",';
    if ((txt.split(ANK).length - 1) !== 1) { console.error("ATENTION: case-ankaret fel"); process.exit(1); }
    txt = txt.replace(ANK, '"' + MIN + '(q, KURSREGISTER)",\n    ' + ANK);
    writeFileSync(FIL, txt);
    console.log("3b. case-listan + " + MIN);
  } else console.log("3b. case fanns redan");
  if (!txt.includes('"svaraLokaltModernaRisker(q, KURSREGISTER)"')) {
    const ANK2 = '"svaraLokaltExtra(q, KURSREGISTER)",';
    if ((txt.split(ANK2).length - 1) === 1) {
      let t2 = readFileSync(FIL, "utf8");
      t2 = t2.replace(ANK2, ANK2 + '\n  "svaraLokaltModernaRisker(q, KURSREGISTER)",');
      writeFileSync(FIL, t2);
      console.log("3b2. modernarisk dokumenterad i case-listan (konvergens)");
    }
  }
}

// ── 4. multipel/optionshantverk L2 — exakt substring ur levande widget ──────
for (const namn of ["multipel", "optionshantverk"]) {
  const FIL = join(HÄR, "testa-ai-mentor-" + namn + ".mjs");
  let txt = readFileSync(FIL, "utf8");
  const rx = /widget\.includes\("([^"]*svaraLokaltPengarstid\(q, KURSREGISTER\))([^"]*)(\?\? svaraLokaltMarknadsrytm\(q, KURSREGISTER\);")\)/;
  const m = txt.match(rx);
  if (!m) { console.log("4. " + namn + ": inget L2-junktionspåstående (hoppar)"); continue; }
  const ny = 'widget.includes("' + m[1] + liveSegment.slice(P.length, liveSegment.indexOf(M)) + m[3] + ')';
  if (m[2].includes(MIN)) { console.log("4. " + namn + ": bär redan min komponent"); continue; }
  txt = txt.replace(m[0], ny);
  writeFileSync(FIL, txt);
  console.log("4. " + namn + " L2 uppdaterad till levande kedja");
}

console.log("SLUTSVEP KLART");
