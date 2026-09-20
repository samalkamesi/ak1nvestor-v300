#!/usr/bin/env node
// Svit för data/infra/contabo/rop-halsa-cron.sh:s loggklass (o136, s8-vakt).
// =====================================================================================
// Kontrakt (mot o136:s bokning "rop-hälsan i cron-schema"): wrappern är TUNN
// — all mätlogik bor i verktyget (rop-halsa.mjs: gap-matematik, klassning,
// exit 0/1/2). Wrapperns enda jobb: köra, LÄSA KLASSEN UR VERKTYGETS EGEN
// UTDATA (o85-doktrinen) och logga en ärlig rad + larma molnagenten vid
// FYND/verktygsfel.
//
// Detta är o85:s testbara-vaktkörningsväg-mönster: sviten overridar själva
// vaktkommandot (ROP_HALSA_KOMMANDO) med en mock som skriver verktygets
// UTdata och exitar — wrapperns loggklass påstås. Larmvägen körs mot
// dummy-env-fil (ROP_HALSA_ENV_FIL med fel nyckel ⇒ session-hämtningen
// misslyckas) ⇒ sviten kan ALDRIG posta ett skarpt larm till studion
// (säkerhetskontroll: "FYND-larm till molnagenten"-raden får aldrig synas
// i tmp-loggen).
//
// Körs: node verktyg/testa-rop-halsa-cron.mjs  (exit 0 = alla PASS)

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const SKRIPT = path.join(ROT, "data", "infra", "contabo", "rop-halsa-cron.sh");
const SKARP_LOGG = path.join(ROT, "data", "vakten", "rop-halsa-cron.log");
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `rop-halsa-cron-${namn}-`));
  const mock = path.join(tmp, "mock-verktyg.sh");
  fs.writeFileSync(
    mock,
    `#!/usr/bin/env bash\nprintf '%s\\n' \\\n${utdataRader.map((r) => JSON.stringify(r)).join(" \\\n")} \\\n\nexit ${exitkod}\n`,
    "utf8",
  );
  fs.chmodSync(mock, 0o755);
  fs.writeFileSync(path.join(tmp, "dummy.env"), "ADMIN_PASSWORD=rop-halsa-svit-dummy\n", "utf8");
  const ut = spawnSync("bash", [SKRIPT], {
    env: {
      ...process.env,
      ROP_HALSA_KATALOG: tmp,
      ROP_HALSA_KOMMANDO: mock,
      ROP_HALSA_ENV_FIL: path.join(tmp, "dummy.env"),
    },
    encoding: "utf8",
    timeout: 120000,
  });
  const logg = fs.existsSync(path.join(tmp, "rop-halsa-cron.log"))
    ? fs.readFileSync(path.join(tmp, "rop-halsa-cron.log"), "utf8")
    : "";
  const senaste = fs.existsSync(path.join(tmp, "rop-halsa-senaste.txt"))
    ? fs.readFileSync(path.join(tmp, "rop-halsa-senaste.txt"), "utf8")
    : "";
  return { tmp, ut, logg, senaste };
}

// Verktygets UTdata-signatur (o136): första raden bär klassen.
const GRON_UTDATA = [
  "ROP-HÄLSA: GRÖN — 2740 rop · 0 tystnadsgap (värst 0 s) · 0 organ-gap · 0 omstart(er) i fönstret",
  "Rapport: data/vakten/rop-halsa.json",
];
const OBS_UTDATA = [
  "ROP-HÄLSA: OBSERVATION — 2747 rop · 1 tystnadsgap (värst 180 s) · 1 organ-gap · 0 omstart(er) i fönstret",
  "  TYSTNAD 180 s  2026-09-20T14:36:43 → 2026-09-20T14:39:43",
  "Rapport: data/vakten/rop-halsa.json",
];
const FYND_UTDATA = [
  "ROP-HÄLSA: FYND — 5700 rop · 1 tystnadsgap (värst 900 s) · 2 organ-gap · 1 omstart(er) i fönstret",
  "  TYSTNAD 900 s  2026-09-20T13:00:00 → 2026-09-20T13:15:00",
  "Rapport: data/vakten/rop-halsa.json",
];

// L1: GRÖN — exit 0 + klassrad GRÖN → GRÖN-rad, ingen larmtext.
{
  const { tmp, ut, logg } = korMock("gron", GRON_UTDATA, 0);
  kontroll("L1 GRÖN: exit 0 vidare", ut.status === 0, `status=${ut.status}`);
  kontroll("L1 GRÖN: loggrad bär GRÖN", /GRÖN — daemonens rop-kadens hel/.test(logg), logg);
  kontroll("L1 GRÖN: ingen larmtext", !/larm till molnagenten|larmvägen bruten/.test(logg), logg);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// L2: OBSERVATION — exit 0 + klassrad OBSERVATION → trend-rad, inget larm.
{
  const { tmp, ut, logg } = korMock("observation", OBS_UTDATA, 0);
  kontroll("L2 OBSERVATION: exit 0 vidare", ut.status === 0, `status=${ut.status}`);
  kontroll("L2 OBSERVATION: loggrad bär klass + sammanfattning", /OBSERVATION — OBSERVATION — 2747 rop/.test(logg), logg);
  kontroll("L2 OBSERVATION: ingen larmtext", !/larm till molnagenten|larmvägen bruten/.test(logg), logg);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// L2b: FYND — exit 1 → FYND-larmVÄG (mot dummy-env ⇒ larmet kan aldrig posta
// skarpt: session-hämtningen misslyckas ⇒ "larmvägen bruten"-klassen loggas).
{
  const { tmp, ut, logg } = korMock("fynd", FYND_UTDATA, 1);
  kontroll("L2b FYND: exit 1 vidare", ut.status === 1, `status=${ut.status}`);
  kontroll("L2b FYND: FYND-klassen loggas", /FYND men larmvägen bruten/.test(logg), logg);
  kontroll(
    "L2b FYND: SKARPT larm ALDRIG postat (dummy-env låser vägen)",
    !/FYND-larm till molnagenten/.test(logg),
    "larmraden får endast synas med äkta session — sviten får aldrig posta",
  );
  kontroll("L2b FYND: ingen rapport promemorerad som skarp", !/rop-halsa\.json/.test(logg.split("\n").find((r) => r.includes("FYND")) ?? "") || /FYND men larmvägen bruten/.test(logg));
  fs.rmSync(tmp, { recursive: true, force: true });
}

// L3: VAKTFEL — exit 2 → verktygsfel-larmväg (dummy-env ⇒ bruten, ärligt).
{
  const { tmp, ut, logg } = korMock("vaktfel", ["ROP-HÄLSA: FEL — loggen oläslig (ENOENT)"], 2);
  kontroll("L3 VAKTFEL: exit 2 vidare", ut.status === 2, `status=${ut.status}`);
  kontroll("L3 VAKTFEL: VAKTFEL-klassen loggas", /VAKTFEL men larmvägen bruten/.test(logg), logg);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// L4: OVÄNTAD EXIT 0 — verktyget tyst (exit 0 UTAN klassrad) =
// verktygshälsa-anomali (o85:s fjärde klass) — loggas, larmar ej.
{
  const { tmp, ut, logg } = korMock("tyst-verktyg", ["(ingen klassrad alls)"], 0);
  kontroll("L4 OVÄNTAD EXIT 0: wrappern exit 0", ut.status === 0, `status=${ut.status}`);
  kontroll("L4 OVÄNTAD EXIT 0: anomaliklassen loggas", /OVÄNTAD EXIT 0 utan klassrad/.test(logg), logg);
  kontroll("L4 OVÄNTAD EXIT 0: inget larm", !/larm till molnagenten/.test(logg), logg);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// L5: retention — loggen hålls ≤ 200 rader.
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rop-halsa-cron-retention-"));
  const logg = path.join(tmp, "rop-halsa-cron.log");
  fs.writeFileSync(logg, Array.from({ length: 250 }, (_, i) => `gammal rad ${i}`).join("\n") + "\n", "utf8");
  const mock = path.join(tmp, "mock-verktyg.sh");
  fs.writeFileSync(mock, `#!/usr/bin/env bash\nprintf '%s\\n' ${JSON.stringify(GRON_UTDATA[0])}\nexit 0\n`, "utf8");
  fs.chmodSync(mock, 0o755);
  fs.writeFileSync(path.join(tmp, "dummy.env"), "ADMIN_PASSWORD=dummy\n", "utf8");
  spawnSync("bash", [SKRIPT], {
    env: { ...process.env, ROP_HALSA_KATALOG: tmp, ROP_HALSA_KOMMANDO: mock, ROP_HALSA_ENV_FIL: path.join(tmp, "dummy.env") },
    encoding: "utf8", timeout: 120000,
  });
  const antal = fs.readFileSync(logg, "utf8").split("\n").filter(Boolean).length;
  kontroll("L5 retention: logg ≤ 201 rader (200-gräns + årets körrad)", antal <= 201, `fick ${antal}`);
  kontroll("L5 retention: äldsta raden borta", !fs.readFileSync(logg, "utf8").includes("gammal rad 0"));
  fs.rmSync(tmp, { recursive: true, force: true });
}

// L6: skarp logg orörd (sviten skriver ALDRIG i prod-loggen).
{
  const efter = fs.existsSync(SKARP_LOGG) ? fs.statSync(SKARP_LOGG) : null;
  kontroll(
    "L6 skarp cron.log orörd av sviten",
    (!skarpFanns && !efter) || (efter.mtimeMs === skarpStat.mtimeMs && efter.size === skarpStat.size),
    skarpFanns ? `fanns (${skarpStat.size} B) → ${efter.size} B` : "fanns ej",
  );
}

// L7: crontab-installationen — raden finns (dokumenterat kontrakt; sviten
// installerar ALDRIG, den konstaterar).
{
  const crontab = spawnSync("crontab", ["-l"], { encoding: "utf8" });
  const har = (crontab.stdout || "").includes("rop-halsa-cron.sh");
  kontroll(
    "L7 crontab: rop-halsa-cron.sh installerad (27 6 * * *)",
    har && /27 6 \* \* \* .*rop-halsa-cron\.sh/.test(crontab.stdout || ""),
    har ? "raden finns men inte i 06:27-slotten" : "raden saknas",
  );
}

for (const r of resultat) console.log(r.includes("FAIL") ? `  ${r}` : `  ${r}`);
console.log(`\nrop-halsa-cron (o136): ${pass} PASS · ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
