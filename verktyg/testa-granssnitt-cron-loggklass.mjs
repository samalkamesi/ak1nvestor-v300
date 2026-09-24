#!/usr/bin/env node
// Svit för gränsnittsvakt-cron.sh:s ärliga loggklass (o85, s8-vakt).
// =====================================================================
// Kontrakt (mot 2026-09-18T0717-fyndet, o72 §5.2:s köpost): exit 0 från
// vakten betyder INTE alltid mätt — vakten har tre exit-0-lägen (våg 142:
// driftavbrott larmar ej): fullt svep, UPPSKJUTEN (deploy höll låset,
// INGET mätt) och AVBRUTEN (deploy startade mitt i svepet, PARTIELLT
// mätt). Före o85 loggade wrappern alla som "GRÖN — 0 fynd".
//
// Detta är o72:s uttryckliga krav på TESTBAR VAKTKÖRNINGSVÄG: sviten
// overridar själva vaktkommandot (GRANSSNITT_VAKT_KOMMANDO) med en mock
// som skriver vaktens UTdata och exitar — wrapperns loggklass läses ur
// utdata och påstås. Larmvägen körs mot dummy-env-fil (GRANSSNITT_ENV_FIL)
// ⇒ sviten kan ALDRIG posta ett skarpt larm till studion (säkerhetskontroll
// L5: "FYND-larm"-raden får aldrig synas i tmp-loggen).
//
// Körs: node verktyg/testa-granssnitt-cron-loggklass.mjs  (exit 0 = alla PASS)

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const SKRIPT = path.join(ROT, "data", "infra", "contabo", "granssnittsvakt-cron.sh");
const SKARP_LOGG = path.join(ROT, "data", "vakten", "cron.log");

let pass = 0;
let fail = 0;
const resultat = [];
function kontroll(namn, ok, detalj = "") {
  if (ok) { pass++; resultat.push(`PASS ${namn}`); }
  else { fail++; resultat.push(`FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
}

// bash -n: syntax före beteende.
const synt = spawnSync("bash", ["-n", SKRIPT]);
kontroll("N1 bash -n syntax ren", synt.status === 0, synt.stderr?.toString().trim());

// En körning = tmp-katalog (rapport + logg + mock-vakt + dummy-env) med
// ÖPPEN RAM-grind (RAM_MIN=1 ⇒ rond 1) och mockad vaktkörning. Skarp
// cron.log, skarpa rapporter och skarp .env röras ALDRIG.
function kor({ rader = [], exitKod = 0 }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vakt-cron-klass-"));
  const mock = path.join(tmp, "mock-vakt.mjs");
  const utdata = rader.join("\n") + (rader.length ? "\n" : "");
  fs.writeFileSync(mock, `process.stdout.write(${JSON.stringify(utdata)});\nprocess.exit(${exitKod});\n`);
  fs.writeFileSync(path.join(tmp, "dummy.env"), "ADMIN_PASSWORD=vakt-svit-dummy\n");
  const env = {
    ...process.env,
    GRANSSNITT_KATALOG: tmp,
    GRANSSNITT_RAM_MIN: "1",
    GRANSSNITT_VAKT_KOMMANDO: `node ${mock}`,
    GRANSSNITT_ENV_FIL: path.join(tmp, "dummy.env"),
  };
  const r = spawnSync("bash", [SKRIPT], { env, encoding: "utf8", timeout: 30_000 });
  let logg = "";
  try {
    logg = fs.readFileSync(path.join(tmp, "cron.log"), "utf8");
  } catch (e) {
    if (e.code !== "ENOENT") throw e; // saknad logg = inget loggats — är ett fel i klassfallen
  }
  const krascharkiv = fs.readdirSync(tmp).filter((f) => f.startsWith("vaktkrasch-"));
  fs.rmSync(tmp, { recursive: true, force: true });
  return { kod: r.status, ut: r.stdout, logg, krascharkiv };
}

// L1: UPPSKJUTEN (vakten väntade ut deploylåset 12 min, INGET mätt) ⇒
// egen loggklass — aldrig GRÖN. (Utdatan ordagrant ur granssnittsvakt.mjs:420.)
{
  const r = kor({
    rader: [
      "GRÄNSSNITTSVAKTEN: UPPSKJUTEN — deploy pågår efter 12 min väntan, inga fynd bokförda (nästa cron-körning mäter).",
      "Rapport: /home/ak1a/AK1/data/vakten/granssnitt-2026-09-18T0529.json",
    ],
    exitKod: 0,
  });
  kontroll("L1 UPPSKJUTEN → exit 0 (våg 142: larmar ej)", r.kod === 0, `kod=${r.kod}`);
  kontroll("L1 UPPSKJUTEN-loggrad", r.logg.includes("UPPSKJUTEN — deploy pågår, inget mätt"), r.logg.trim());
  kontroll("L1 ALDRIG GRÖN vid uppskjuten", !r.logg.includes("GRÖN"), r.logg.trim());
}

// L2: AVBRUTEN (deploy startade mitt i svepet, PARTIELLT mätt + journalfört)
// ⇒ egen loggklass — aldrig GRÖN. (Utdatan ur granssnittsvakt.mjs:731.)
{
  const r = kor({
    rader: [
      "──────────────────────────────────────────────────",
      "GRÄNSSNITTSVAKTEN: 0 fynd bland 61 kombinationer",
      "Rapport: /home/ak1a/AK1/data/vakten/granssnitt-2026-09-18T0941.json",
      "GRÄNSSNITTSVAKTEN: AVBRUTEN — DEPLOY PÅGÅR — transienta driftfel under deploy räknas ej som fynd (nästa körning mäter).",
    ],
    exitKod: 0,
  });
  kontroll("L2 AVBRUTEN → exit 0", r.kod === 0, `kod=${r.kod}`);
  kontroll("L2 AVBRUTEN-loggrad", r.logg.includes("AVBRUTEN — deploy startade mitt i svepet, partiellt mätt"), r.logg.trim());
  kontroll("L2 ALDRIG GRÖN vid avbruten", !r.logg.includes("GRÖN"), r.logg.trim());
}

// L3: äkta fullt svep med 0 fynd ⇒ GRÖN — prefixet "GRÖN — 0 fynd" är
// bevarat ordagrant (driftsläsarnas grepparam) med äkthetstillägget.
{
  const r = kor({
    rader: [
      "──────────────────────────────────────────────────",
      "GRÄNSSNITTSVAKTEN: 0 fynd bland 176 kombinationer",
      "Rapport: /home/ak1a/AK1/data/vakten/granssnitt-2026-09-18T0524.json",
    ],
    exitKod: 0,
  });
  kontroll("L3 GRÖN → exit 0", r.kod === 0, `kod=${r.kod}`);
  kontroll("L3 GRÖN-prefix bevarat ordagrant", r.logg.includes("GRÖN — 0 fynd (fullt svep)"), r.logg.trim());
  kontroll("L3 ingen felklasslogg", !r.logg.includes("UPPSKJUTEN") && !r.logg.includes("AVBRUTEN") && !r.logg.includes("OVÄNTAD"), r.logg.trim());
}

// L4: 07:17-klassen — exit 0 UTAN vaktsvar (varken rapport eller journal
// skrevs 2026-09-18T0717, ändå loggades GRÖN) ⇒ anomali-loggrad, aldrig GRÖN.
{
  const r = kor({ rader: [], exitKod: 0 });
  kontroll("L4 oväntad exit 0 → fortfarande exit 0 (larmar ej)", r.kod === 0, `kod=${r.kod}`);
  kontroll("L4 OVÄNTAD-loggrad", r.logg.includes("OVÄNTAD EXIT 0 utan vaktsvar"), r.logg.trim());
  kontroll("L4 ALDRIG GRÖN utan vaktsvar", !r.logg.includes("GRÖN"), r.logg.trim());
}

// L5: fynd (exit 1) mot dummy-env ⇒ larmVÄGEN träffas men kan inte nå
// skarp studio: "larmvägen bruten"-raden är svitens säkerhetsbevis —
// raden "FYND-larm till molnagenten" får ALDRIG synas i tmp-loggen.
{
  const r = kor({
    rader: [
      "──────────────────────────────────────────────────",
      "GRÄNSSNITTSVAKTEN: 3 fynd bland 176 kombinationer",
      "  ⑴ light/390x844 /kurser: överflöd 12px, kontrast 1, utanför 0",
      "Rapport: /home/ak1a/AK1/data/vakten/granssnitt-2026-09-19T0117.json",
    ],
    exitKod: 1,
  });
  kontroll("L5 fynd → exit 1 vidare", r.kod === 1, `kod=${r.kod}`);
  kontroll(
    "L5 dummy-env ⇒ larmvägen bruten-rad",
    r.logg.includes("FEL men larmvägen bruten (session/pass saknas)"),
    r.logg.trim()
  );
  kontroll("L5 ALDRIG skarpt FYND-larm från sviten", !r.logg.includes("FYND-larm"), r.logg.trim());
}

// L6: vaktkrasch (exit 2, ingen GRÄNSSNITTSVAKTEN:-rad) ⇒ KRASCHAD-gren:
// vaktkrasch-<stamp>.txt arkiveras i tmp (o35-kontraktet) + bruten-rad.
{
  const r = kor({
    rader: ["Error: Cannot find module 'puppeteer-core'", "Require stack:", "- /home/ak1a/AK1/verktyg/granssnittsvakt.mjs"],
    exitKod: 2,
  });
  kontroll("L6 krasch → exit 2 vidare", r.kod === 2, `kod=${r.kod}`);
  kontroll("L6 vaktkrasch-arkiv skrivet i tmp", r.krascharkiv.length === 1, r.krascharkiv.join(","));
  kontroll("L6 ingen GRÖN/UPPSKJUTEN/AVBRUTEN vid krasch", !/GRÖN|UPPSKJUTEN|AVBRUTEN/.test(r.logg), r.logg.trim());
}

// L7: skarp cron.log orörd av sviten (ägarhetsbevis — bara cron skriver den).
{
  const före = fs.statSync(SKARP_LOGG);
  kor({ rader: ["GRÄNSSNITTSVAKTEN: 0 fynd bland 176 kombinationer"], exitKod: 0 });
  const efter = fs.statSync(SKARP_LOGG);
  kontroll("L7 skarp cron.log orörd", före.mtimeMs === efter.mtimeMs && före.size === efter.size);
}

// L8: defaultvärdena i skriptet = skarp drift (överridningarna ägs av sviten).
{
  const text = fs.readFileSync(SKRIPT, "utf8");
  kontroll("L8 default vaktkommando", text.includes(":-node verktyg/granssnittsvakt.mjs"));
  kontroll("L8 default env-fil", text.includes(":-/home/ak1a/AK1/.env.production.local"));
  kontroll("L8 klassläsning ur vaktens utdata", text.includes("GRÄNSSNITTSVAKTEN: UPPSKJUTEN"));
}

console.log(resultat.join("\n"));
console.log(`\nGRÄNSSNITTS-CRON-LOGGKLASS: ${pass} PASS · ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
