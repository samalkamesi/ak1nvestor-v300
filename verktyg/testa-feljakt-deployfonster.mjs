#!/usr/bin/env node
/**
 * testa-feljakt-deployfonster.mjs — offline kontraktssvit för feljaktens
 * DEPLOYFÖNSTERGRINDar (o153 s8-u3): en designad icke-defekt (pm2 nere
 * under aktivt deploylås) får ALDRIG bokföras HÖG — bara MEDEL "väntat
 * fönster" (rond 44-familjen; femte falsklarmet 2026-09-21T05:28:19.389Z:
 * F2 HÖG "ak1a = errored" medan F3 en halv sekund senare korrekt MEDEL-de
 * samma räddningsbyggsfönster).
 *
 * HÄRKOMST: en tidigare ospårad 7-fallssvit (2026-09-21 08:44, "o140") testade
 * ett DI-kontrakt som aldrig landade i feljagaren (jagaDrift/jagaProcesser
 * med grön-not-semantik) och ruttade tyst — ospårad fil är osynlig för organets
 * refactorer (o153 §3 rotorsakan). Denna svit testar DET LEVANDE kontraktet:
 * F2:s deploygrind + o80-DI-ytan; F3/F6 testas av eldprovet feljakt-eldprov.mjs
 * (env-kroksdoktrinen) och lämnas dit.
 *
 * Fem fall, allt mot injicerade mockar (ingen pm2, ingen pgrep, ingen
 * låsfilröring — jagaProcesser tar beroenden enligt o80-mönstret):
 *   1. F2 deploy AKTIVT + pm2 "errored": MEDEL "väntat fönster", ALDRIG HÖG
 *      (05:28:19Z-klassens sken-HÖG stängd)
 *   2. F2 deploy INAKTIVT + pm2 "errored": HÖG bokförs oförändrat
 *      (eskaleringsskyddet för äkta fel består — regressionsskyddet)
 *   3. F2 allt online: grön rad, 0 bokföringar (grinden släcker inte äkta mätning)
 *   4. F2 > 40 zcode-barn: MEDEL RAM-risk oförändrat (grinden rör ej zombie-vakten)
 *   5. F2 pm2 oädlig: MEDEL felhärdning oförändrad (grinden rör ej catch-grenen)
 * Körs: node verktyg/testa-feljakt-deployfonster.mjs  →  PASS x/5 eller FAIL.
 */
import { jagaProcesser } from "./feljagaren.mjs";

let pass = 0;
const felen = [];
function kontroll(nr, namn, villkor, detalj) {
  if (villkor) {
    pass++;
    console.log(`PASS ${nr} — ${namn}`);
  } else {
    felen.push(nr);
    console.log(`FAIL ${nr} — ${namn}${detalj ? ` (${detalj})` : ""}`);
  }
}

function fabrik() {
  const bokat = [];
  const grona = [];
  return {
    bokat,
    grona,
    bokfor: (sp, allvar, f, b) => bokat.push({ sp, allvar, f, b }),
    gron: (sp, not) => grona.push({ sp, not }),
  };
}

// ── Fall 1: F2 under aktivt deploy + errored → MEDEL, aldrig sken-HÖG ───────
{
  const { bokat, bokfor, gron } = fabrik();
  jagaProcesser({
    lasPm2: () => [
      { name: "ak1a", pm2_env: { status: "errored", restart_time: 7325 } },
      { name: "ak1a-pumpor", pm2_env: { status: "online", restart_time: 20 } },
    ],
    raknaZcode: () => "0",
    deployPag: () => true,
    bokfor,
    gron,
  });
  const medel = bokat.filter((b) => b.allvar === "MEDEL" && /deploybygg pågår/.test(b.f));
  const hog = bokat.filter((b) => b.allvar === "HÖG");
  kontroll(1, "F2 deploy aktivt + errored: MEDEL väntat fönster, 0 HÖG (05:28:19Z-klassen stängd)",
    medel.length === 1 && hog.length === 0 && /väntat fönster/.test(medel[0]?.b ?? ""),
    `bokat=${JSON.stringify(bokat)}`);
}

// ── Fall 2: F2 utan deploy + errored → HÖG oförändrat ───────────────────────
{
  const { bokat, bokfor, gron } = fabrik();
  jagaProcesser({
    lasPm2: () => [{ name: "ak1a", pm2_env: { status: "errored", restart_time: 7325 } }],
    raknaZcode: () => "0",
    deployPag: () => false,
    bokfor,
    gron,
  });
  kontroll(2, "F2 utan deploy + errored: HÖG bokförs (äkta fel eskalerar)",
    bokat.length === 1 && bokat[0].allvar === "HÖG" && /ak1a = errored/.test(bokat[0].f),
    `bokat=${JSON.stringify(bokat)}`);
}

// ── Fall 3: F2 allt online → grön, 0 bokföringar ────────────────────────────
{
  const { bokat, grona, bokfor, gron } = fabrik();
  jagaProcesser({
    lasPm2: () => [
      { name: "ak1a", pm2_env: { status: "online", restart_time: 3 } },
      { name: "ak1a-pumpor", pm2_env: { status: "online", restart_time: 20 } },
    ],
    raknaZcode: () => "1",
    deployPag: () => false,
    bokfor,
    gron,
  });
  kontroll(3, "F2 allt online: grön 2/2, 0 bokföringar",
    bokat.length === 0 && grona.length === 1 && /2\/2 pm2-processer online/.test(grona[0]?.not ?? ""),
    `bokat=${JSON.stringify(bokat)} grona=${JSON.stringify(grona)}`);
}

// ── Fall 4: F2 zombie-vakten orörd — > 40 zcode-barn ⇒ MEDEL RAM-risk ───────
{
  const { bokat, bokfor, gron } = fabrik();
  jagaProcesser({
    lasPm2: () => [{ name: "ak1a", pm2_env: { status: "online", restart_time: 3 } }],
    raknaZcode: () => "47",
    deployPag: () => false,
    bokfor,
    gron,
  });
  kontroll(4, "F2 > 40 zcode-barn: MEDEL RAM-risk oförändrat",
    bokat.length === 1 && bokat[0].allvar === "MEDEL" && /47 zcode-barn/.test(bokat[0].f),
    `bokat=${JSON.stringify(bokat)}`);
}

// ── Fall 5: F2 felhärdning orörd — pm2 oädlig ⇒ MEDEL ───────────────────────
{
  const { bokat, bokfor, gron } = fabrik();
  jagaProcesser({
    lasPm2: () => { throw new Error("pm2 borta"); },
    deployPag: () => false,
    bokfor,
    gron,
  });
  kontroll(5, "F2 pm2 oädlig: MEDEL felhärdning oförändrad",
    bokat.length === 1 && bokat[0].allvar === "MEDEL" && /pm2 jlist misslyckades/.test(bokat[0].f),
    `bokat=${JSON.stringify(bokat)}`);
}

const totalt = 5;
if (felen.length === 0) {
  console.log(`SVIT KLAR: ${pass}/${totalt} PASS — deployfönstrets kontrakt håller (designad icke-defekt ⇒ MEDEL väntat fönster, aldrig HÖG; äkta fel ⇒ oförändrat HÖG)`);
} else {
  console.log(`SVIT FEL: ${pass}/${totalt} PASS — fall ${felen.join(", ")} bröt kontraktet`);
  process.exit(1);
}
