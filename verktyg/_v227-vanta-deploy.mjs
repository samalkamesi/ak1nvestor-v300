// Väntare v227 — eftermätning av KUR A: deployloopen ska brytas.
// Vittnar på prod-synkloggen + senaste-deployad.txt tills något avgörande
// landar: GRÖNT (DEPLOYAD/KANT-notis) eller RÖTT (tillbakarullning).
// Tak 75 min; skriver utfall sist. Avslutar vid första avgörandet.
import { readFileSync } from 'node:fs';

const LOGG = '/home/ak1a/AK1/data/vakten/prod-synk.log';
const MARKOR = '/home/ak1a/AK1/data/vakten/senaste-deployad.txt';
// Mål-hashar: kurens bokföringscommit + svitcommiten + kompletteringen
// (pusharna mitt i byggena tvingade ombyggen — buntslagsläran)
const MAL_HASHAR = ['62bd7657', '05605b55', 'edf578aa'];
const START = Date.now();
const TAK_MS = 75 * 60_000;

const andraLinjer = new Set(); // redan rapporterade nyckelrader
let senasteDeployadRapporterad = '';

while (Date.now() - START < TAK_MS) {
  let text = '';
  try {
    text = readFileSync(LOGG, 'utf8');
  } catch {
    text = '';
  }
  const rader = text.trim().split('\n').filter((r) => r > '');

  for (const r of rader.slice(-6)) {
    const nyckel = r.slice(0, 60);
    if (andraLinjer.has(nyckel)) continue;
    if (/BYGGER FRÅN|BUNTSLAGSRACE|PATCH-KÖ|NOLLDOWNTIME|VÄNTAR/.test(r)) {
      andraLinjer.add(nyckel);
      console.log(`[väntare ${new Date().toISOString().slice(11, 19)}] ${r.slice(0, 130)}`);
    }
  }

  // Avgörande GRÖNT: KUR A-linjen eller DEPLOYAD-markör i mål-hash
  const kantGron = rader.find((r) => r.includes('INGET rollback (v227'));
  const deployad = rader.filter((r) => (r.includes('DEPLOYAD automatiskt') || r.includes('DEPLOYAD (patch-kö')) && r > '2026-10-01T07:31').pop();
  let markor = '';
  try {
    markor = readFileSync(MARKOR, 'utf8').trim();
  } catch { /* finns ej ännu */ }

  if (kantGron) {
    console.log(`\nAVGÖRANDE (KUR A aktiv): ${kantGron.slice(0, 160)}`);
  }
  if (deployad && deployad !== senasteDeployadRapporterad) {
    senasteDeployadRapporterad = deployad;
    console.log(`\nDEPLOYAD-RAD: ${deployad.slice(0, 160)}`);
  }
  // Slutvillkor (enkelt + robust mot efterhands-pushar): markören har
  // lämnat den gamla aa2f35eb OCH en DEPLOYAD-rad finns efter kurens push.
  if (markor && !markor.startsWith('aa2f35eb') && deployad) {
    console.log(`\nMARKÖR = ${markor.slice(0, 8)} — LOOPEN BRUTEN, deploy i mål.`);
    console.log(`UTFALL: GRÖNT efter ${Math.round((Date.now() - START) / 60000)} min`);
    process.exit(0);
  }

  // Avgörande RÖTT: ny tillbakarullning EFTER kurens push (07:31Z)
  const rod = rader.filter((r) => r.includes('TILLBAKARULLNING') && r > '2026-10-01T07:31').pop();
  if (rod) {
    console.log(`\nUTFALL: RÖTT — ny tillbakarullning trots kuren: ${rod.slice(0, 160)}`);
    process.exit(1);
  }

  await new Promise((s) => setTimeout(s, 60_000));
}

console.log('UTFALL: TIDSUTEN — inget avgörande inom 75 min (kontrollera manuellt)');
process.exit(2);
