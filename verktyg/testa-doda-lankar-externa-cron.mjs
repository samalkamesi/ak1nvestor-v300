#!/usr/bin/env node
// Svit för data/infra/contabo/doda-lankar-externa-cron.sh:s loggklass (o94, s8-vakt).
// =====================================================================================
// Kontrakt (mot o87-externa §Kö post 2 "externa vakten i cron-schema"):
// wrappern är TUNN — allt skydd bor i verktyget (mätfönster-grind, drift-tak,
// filskydd, exit 0/1/2). Wrapperns enda jobb: köra, LÄSA KLASSEN UR VERKTYGETS
// EGEN UTDATA (o85-doktrinen — exit 0 betyder inte alltid grönt: verktyget
// levererar mätvärde med exit 0 ÄVEN vid fynd) och logga en ärlig rad +
// larma molnagenten vid fynd/verktygsfel.
//
// Detta är o85:s testbara-vaktkörningsväg-mönster: sviten overridar själva
// vaktkommandot (DODA_EXTERNA_KOMMANDO) med en mock som skriver verktygets
// UTdata och exitar — wrapperns loggklass påstås. Larmvägen körs mot
// dummy-env-fil (DODA_EXTERNA_ENV_FIL med fel nyckel ⇒ session-hämtningen
// misslyckas) ⇒ sviten kan ALDRIG posta ett skarpt larm till studion
// (säkerhetskontroll L2/L5: "FYND-larm till molnagenten"-raden får aldrig
// synas i tmp-loggen).
//
// Körs: node verktyg/testa-doda-lankar-externa-cron.mjs  (exit 0 = alla PASS)

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const SKRIPT = path.join(ROT, "data", "infra", "contabo", "doda-lankar-externa-cron.sh");
const SKARP_LOGG = path.join(ROT, "data", "vakten", "doda-lankar-externa-cron.log");
const skarpFanns = fs.existsSync(SKARP_LOGG);
const skarpStat = skarpFanns ? fs.statSync(SKARP_LOGG) : null;

let pass = 0;
let fail = 0;
const resultat = [];
function kontroll(namn, ok, detalj = "") {
  if (ok) { pass++; resultat.push(`PASS ${namn}`); }
  else { fail++; resultat.push(`FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
}

// N1: bash -n — syntax före beteende.
const synt = spawnSync("bash", ["-n", SKRIPT]);
kontroll("N1 bash -n syntax ren", synt.status === 0, synt.stderr?.toString().trim());

// En körning = egen tmp-katalog (mock-verktyg + dummy-env + logg + senaste).
function korMock(namn, utdataRader, exitkod) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `doda-externa-cron-${namn}-`));
  const mock = path.join(tmp, "mock-verktyg.sh");
  const rader = utdataRader.map((r) => `echo ${JSON.stringify(r).replace(/(^"|"$)/g, "'")}`).join("\n");
  fs.writeFileSync(mock, `#!/usr/bin/env bash\nprintf '%s\\n' \\\n${utdataRader.map((r) => JSON.stringify(r)).join(" \\\n")} \\\n\nexit ${exitkod}\n`, "utf8");
  fs.chmodSync(mock, 0o755);
  fs.writeFileSync(path.join(tmp, "dummy.env"), "ADMIN_PASSWORD=doda-svit-dummy\n", "utf8");
  const ut = spawnSync("bash", [SKRIPT], {
    env: {
      ...process.env,
      DODA_EXTERNA_KATALOG: tmp,
      DODA_EXTERNA_KOMMANDO: mock,
      DODA_EXTERNA_ENV_FIL: path.join(tmp, "dummy.env"),
    },
    encoding: "utf8",
    timeout: 120000,
  });
  const logg = fs.existsSync(path.join(tmp, "doda-lankar-externa-cron.log"))
    ? fs.readFileSync(path.join(tmp, "doda-lankar-externa-cron.log"), "utf8")
    : "";
  const senaste = fs.existsSync(path.join(tmp, "doda-lankar-externa-senaste.txt"))
    ? fs.readFileSync(path.join(tmp, "doda-lankar-externa-senaste.txt"), "utf8")
    : "";
  return { tmp, ut, logg, senaste };
}

const GRON_UTDATA = [
  "Crawlade 2422 sidor, validerade 308 unika externa mål på 34 s",
  'Klasser: {"OK":300,"BLOCKERAD":7,"DOD":0,"SERVERFEL":0,"OUPPNABAR":0}',
  "DÖDA (4xx): 0",
  "OUPPNÅBARA (domän/anslutning): 0",
  "SERVERFEL kvarstår: 0 · BLOCKERADE (kan ej maskinverifiera): 7",
  "Rapport: /home/ak1a/AK1/data/vakten/doda-lankar-externa-2026-09-19.json",
];

// L1: GRÖN — exit 0, noll döda/ouppnåbara → GRÖN-rad, ingen larmtext.
{
  const { ut, logg, senaste } = korMock("gron", GRON_UTDATA, 0);
  kontroll("L1 GRÖN: exit 0 + DÖDA 0/OUPP 0 → 'GRÖN — 0 döda externa (full crawl)'",
    ut.status === 0 && logg.includes("GRÖN — 0 döda externa (full crawl)"), `exit=${ut.status} logg=${logg.trim()}`);
  kontroll("L1b GRÖN: ingen larmrad", !logg.includes("-larm") && !logg.includes("larmvägen"), logg.trim());
  kontroll("L1c senaste-filen skriven i överriden katalog", senaste.includes("Crawlade 2422 sidor"));
}

// L2: FYND mot dummy-env ⇒ larmVÄGEN träffas men kan inte nå studion —
// ärlig "larmvägen bruten"-rad, ALDRIG "FYND-larm till molnagenten".
{
  const { ut, logg } = korMock("fynd", [
    "Crawlade 2422 sidor, validerade 308 unika externa mål på 34 s",
    'Klasser: {"OK":305,"DOD":2,"SERVERFEL":0,"OUPPNABAR":1}',
    "DÖDA (4xx): 2",
    "  404 https://dod-example.se/sida  ← data/analyses/x.md",
    "OUPPNÅBARA (domän/anslutning): 1",
    "  ENOTFOUND https://borta-example.se  ← data/forskning/y.md",
    "Rapport: /home/ak1a/AK1/data/vakten/doda-lankar-externa-2026-09-19.json",
  ], 0);
  kontroll("L2 FYND: dummy-env ⇒ 'FYND men larmvägen bruten (session/pass saknas)'",
    logg.includes("FYND men larmvägen bruten (session/pass saknas)"), logg.trim());
  kontroll("L2b FYND: ALDRIG 'FYND-larm till molnagenten' (skarpt larm omöjligt)",
    !logg.includes("FYND-larm till molnagenten"), logg.trim());
  kontroll("L2c FYND: exit 0 (mätvärde levererat, verktygets kontrakt)", ut.status === 0, `exit=${ut.status}`);
}

// L3: DRIFTFÖNSTER — exit 2, rapport kasserad av verktyget: rad, ingen larm.
{
  const { ut, logg } = korMock("drift", [
    "DRIFTFÖNSTER: 61.0 % av 2422 sidor svarade 5xx/nätfel (tak 5 %) — rapporten kasseras, ingen fyndfil skrivs (o47 §2). Diagnostik vid driftfynd: kör om med --tvinga (utdata märks diagnostik, är ALDRIG mätvärde).",
  ], 2);
  kontroll("L3 DRIFTFÖNSTER: exit 2 → 'DRIFTFÖNSTER — verktygets tak kasserade rapporten'",
    ut.status === 0 && logg.includes("DRIFTFÖNSTER — verktygets tak kasserade rapporten"), `exit=${ut.status} logg=${logg.trim()}`);
  kontroll("L3b DRIFTFÖNSTER: ingen larmrad (artefaktdoktrinen)", !logg.includes("-larm"), logg.trim());
}

// L4: SKIPPAD — exit 1 + GRIND:-rad (bygg/deploy/bas): ärlig skip-rad.
{
  const { ut, logg } = korMock("grind", [
    "GRIND: deploy-låset ägs av en process (bygg pågår) — ingen mätning (o87/o55 §2).",
  ], 1);
  kontroll("L4 SKIPPAD: exit 1 + GRIND → 'SKIPPAD — mätfönster stängt'",
    ut.status === 0 && logg.includes("SKIPPAD — mätfönster stängt"), `exit=${ut.status} logg=${logg.trim()}`);
}

// L5: VAKTFEL — exit 1 UTAN GRIND (verktygskrasch): VAKTFEL-rad mot dummy-env.
{
  const { logg } = korMock("vaktfel", [
    "node:internal/modules/cjs/loader:1145 throw err;",
    "Error: Cannot find module 'verktyg/doda-lankar-externa.mjs'",
  ], 1);
  kontroll("L5 VAKTFEL: exit 1 utan GRIND → 'VAKTFEL men larmvägen bruten'",
    logg.includes("VAKTFEL men larmvägen bruten (session/pass saknas)"), logg.trim());
  kontroll("L5b VAKTFEL: ALDRIG 'VAKTFEL-larm till molnagenten'", !logg.includes("VAKTFEL-larm till molnagenten"), logg.trim());
}

// L6: OVÄNTAD EXIT 0 — exit 0 utan klassrader (o85:s fjärde klass): ärlig rad.
{
  const { logg } = korMock("ovantad", ["(total tyst utdata)"], 0);
  kontroll("L6 OVÄNTAD EXIT 0: utan DÖDA/OUPPNÅBARA-rader → OVÄNTAD-rad",
    logg.includes("OVÄNTAD EXIT 0 utan sammanfattning"), logg.trim());
}

// L7: DIAGNOSTIK — manuell --tvinga-körning märks av verktyget: loggas, ej mätvärde.
{
  const { logg } = korMock("diagnostik", [
    "Crawlade 2422 sidor, validerade 308 unika externa mål på 34 s [DIAGNOSTIK — ej mätvärde]",
    "DÖDA (4xx): 3",
  ], 0);
  kontroll("L7 DIAGNOSTIK: [DIAGNOSTIK-märke → DIAGNOSTIK-rad, ej GRÖN",
    logg.includes("DIAGNOSTIK — manuell --tvinga-körning") && !logg.includes("GRÖN —"), logg.trim());
}

// L8: retention — 32 rapporter + 5 mellanlager före ⇒ 30 + 3 efter körning.
{
  const { tmp } = korMock("retention-frod", GRON_UTDATA, 0); // skapar tmp + kör en gång (loggar GRÖN)
  for (let i = 1; i <= 32; i++) {
    fs.writeFileSync(path.join(tmp, `doda-lankar-externa-2026-08-${String(i).padStart(2, "0")}.json`), "{}\n");
  }
  for (let i = 1; i <= 5; i++) {
    fs.writeFileSync(path.join(tmp, `doda-lankar-externa-2026-08-${String(i).padStart(2, "0")}-insamling.json`), "{}\n");
  }
  const mock = path.join(tmp, "mock-verktyg.sh");
  spawnSync("bash", [SKRIPT], {
    env: {
      ...process.env,
      DODA_EXTERNA_KATALOG: tmp,
      DODA_EXTERNA_KOMMANDO: mock,
      DODA_EXTERNA_ENV_FIL: path.join(tmp, "dummy.env"),
    },
    encoding: "utf8",
    timeout: 120000,
  });
  const filer = fs.readdirSync(tmp);
  const rapporter = filer.filter((f) => /^doda-lankar-externa-.*\.json$/.test(f) && !f.endsWith("-insamling.json"));
  const mellanlager = filer.filter((f) => f.endsWith("-insamling.json"));
  kontroll("L8 retention: rapporter ≤ 30 kvar", rapporter.length <= 30, `rapporter=${rapporter.length}`);
  kontroll("L8b retention: mellanlager ≤ 3 kvar", mellanlager.length <= 3, `mellanlager=${mellanlager.length}`);
}

// L9: skarp logg orörd — sviten kör alltid mot tmp; skarp data/vakten-logg
// får varken skapas (om den saknades) eller förändras (mtime + storlek).
{
  const nuFanns = fs.existsSync(SKARP_LOGG);
  const nuStat = nuFanns ? fs.statSync(SKARP_LOGG) : null;
  const oforandrad = skarpFanns
    ? nuFanns && nuStat.size === skarpStat.size && nuStat.mtimeMs === skarpStat.mtimeMs
    : !nuFanns;
  kontroll("L9 skarp logg orörd av svitten (skapas ej/förändras ej)", oforandrad,
    `fanns=${skarpFanns} nu=${nuFanns}`);
}

for (const r of resultat) console.log(r);
console.log(fail === 0 ? `ALLA PASS (${pass})` : `${fail} FAIL (${pass} PASS)`);
process.exit(fail === 0 ? 0 : 1);
