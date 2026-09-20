#!/usr/bin/env node
// SVIT: rop-halsa (o136, spår 8 s8-u1) — sondens FÖRSTA svit.
// =============================================================================
// Lager (konsol/urval/drift-precedensen):
// (1) KÄLLKONTRAKT på verktygsfilen: main-guard + exporterad kärna
//     (o80-precedensen), inga barnprocesser/nät i instrumentet (fött
//     mimosa-ren, o123-doktrinen), klassrad-prefix för cron-wrapperns
//     klassläsning (o85-doktrinen).
// (2) FUNKTIONELLT: parsaNoggrann/hittaTystnadsgap/hittaOrganGap/klassa
//     importeras och körs mot konstruerade fixture-rader — epok-detektering,
//     gap-matematik, omstart-räkning (epok-raden räknas EJ), fönster-respekt.
// (3) CLI-KONTRAKT (crontabs 06:27-rop): exit 0 GRÖN/OBSERVATION · exit 1
//     FYND · exit 2 FEL/okänd flagga · --json skriver rapportfil.
import { strict as assert } from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERKTYG = path.join(ROT, "verktyg", "rop-halsa.mjs");

let pass = 0;
let fel = 0;
const KOLL = (namn, villkor, detalj = "") => {
  if (villkor) {
    pass++;
    console.log(`  PASS ${namn}`);
  } else {
    fel++;
    console.log(`  FAIL ${namn}${detalj ? " — " + detalj : ""}`);
  }
};

// Fixture-byggare: rop-rader i daemonens EGET loggformat (pm2 lokal-prefix
// + logga():s UTC-rad — sonden är offset-neutral, skillnadsmatematik).
const T = (lokalTs, rad) => `${lokalTs}: ${lokalTs.slice(11)} ${rad}`;
const ropRad = (ts, namn) => T(ts, `▶ ${namn}`);
const startRad = (ts) => T(ts, "PUMPOR-DAEMONEN v2 (klockstyrd) startar — scheman: …");
const slutRad = (ts, namn, kod) => T(ts, `${namn}.mjs slut kod=${kod}`);

console.log("rop-halsa (o136): källkontrakt — main-guard + rent instrument + klassrad");
{
  const kalla = fs.readFileSync(VERKTYG, "utf8");
  KOLL(
    "main-guard: resolve-jämförelse (o80)",
    /resolve\(process\.argv\[1\]\) === fileURLToPath\(import\.meta\.url\)/.test(kalla),
    "import måste ALDRIG starta mätning",
  );
  KOLL(
    "inga barnprocesser i instrumentet",
    !/child_process|spawnSync|execFileSync|execSync/.test(kalla),
    "sonden ska vara ren filläsning (född mimosa-ren)",
  );
  KOLL(
    "ingen nätförbindelse i instrumentet",
    !/fetch\(|https?:\/\/(?!.*\*)/.test(kalla.split("* ")[0]) || !/fetch\(/.test(kalla),
    "vaktinstrument läser bara logg + klocka",
  );
  KOLL(
    "klassrad-prefix för wrapper-klassläsning (o85)",
    kalla.includes('`ROP-HÄLSA: ${resultat.klass}'),
    "wrappern läser klass ur verktygets egna utdata",
  );
  KOLL(
    "exporterad kärna för sviten",
    kalla.includes("export function analysera") && kalla.includes("export function klassa"),
    "kärnan måste vara importerbar",
  );
}

console.log("rop-halsa (o136): funktionellt — parsning, epok, gap-matematik");
const { parsaNoggrann, hittaTystnadsgap, hittaOrganGap, klassa, analysera } = await import(
  pathToFileURL(VERKTYG).href
);
{
  const rader = [
    "ej en loggrad alls",
    ropRad("2026-09-18T20:09:54", "hjärtslag"),
    startRad("2026-09-18T20:09:55"),
    ropRad("2026-09-18T20:10:00", "automation-motor"),
    slutRad("2026-09-18T20:10:02", "automation-motor", 0),
    ropRad("2026-09-18T20:11:00", "automation-motor"),
    ropRad("2026-09-18T20:14:04", "kraschvakt"),
  ];
  const { startar, rop } = parsaNoggrann(rader);
  KOLL("rop-rader parsade (4 st, skräprad ignorerad)", rop.length === 4, `fick ${rop.length}`);
  KOLL("startar-rad känns igen", startar.length === 1);
  KOLL("rop sorterade tidsordnade", rop[0].ts <= rop.at(-1).ts);
  KOLL("namn extraherat utan ▶", rop[0].namn === "hjärtslag", rop[0].namn);
}
{
  // Tystnadsgap: 200 s mellan två rop i fönstret → 1 post; 60 s → 0.
  const bas = Date.parse("2026-09-20T12:00:00Z");
  const p = (minSek) => [{ ts: bas, namn: "kraschvakt" }, { ts: bas + minSek * 1000, namn: "kraschvakt" }];
  const fran = bas, till = bas + 3_600_000;
  const ett = hittaTystnadsgap(p(200), fran, till, 120);
  KOLL("200 s-gap hittas med rätt längd", ett.length === 1 && ett[0].sek === 200, JSON.stringify(ett));
  KOLL("60 s-gap under tröskel → 0", hittaTystnadsgap(p(60), fran, till, 120).length === 0);
  // Lookback-gräns: föregående rop > 1 h före fönstret → gapet döms ej
  // (fönstret öppnar MITT I en tystnad — hel-tystnad mäts från fönsterstart).
  const gammal = [
    { ts: bas - 7_200_000, namn: "kraschvakt" },
    { ts: bas + 300_000, namn: "kraschvakt" },
  ];
  KOLL("föregångare > 1 h före fönstret → inget gap", hittaTystnadsgap(gammal, fran, till, 120).length === 0);
}
{
  // Organ-gap: automation-motor 61 s → 0; 130 s → 1 (1,5×60=90).
  const bas = Date.parse("2026-09-20T12:00:00Z");
  const tät = Array.from({ length: 10 }, (_, i) => ({ ts: bas + i * 61_000, namn: "automation-motor" }));
  KOLL("automation-motor 61 s-kadens → 0 organ-gap", hittaOrganGap(tät, bas, bas + 3_600_000).length === 0);
  const glapp = [...tät, { ts: bas + 10 * 61_000 + 70_000, namn: "automation-motor" }];
  const og = hittaOrganGap(glapp, bas, bas + 3_600_000);
  KOLL("automation-motor 131 s-miss → 1 organ-gap", og.length === 1 && og[0].organ === "automation-motor", JSON.stringify(og));
  // kraschvakt 610 s → 0 (≤ 900); 1300 s → 1.
  const kv = [
    { ts: bas, namn: "kraschvakt" }, { ts: bas + 610_000, namn: "kraschvakt" },
    { ts: bas + 610_000 + 1_300_000, namn: "kraschvakt" },
  ];
  const kg = hittaOrganGap(kv, bas, bas + 3_600_000);
  KOLL("kraschvakt 610 s → 0 poster", hittaOrganGap(kv.slice(0, 2), bas, bas + 3_600_000).length === 0);
  KOLL("kraschvakt 1300 s-miss → 1 post", kg.length === 1 && kg[0].vantaSek === 600, JSON.stringify(kg));
  // Organ med < 2 rop döms aldrig.
  KOLL("ensamt rop → ingen dom", hittaOrganGap([{ ts: bas, namn: "kraschvakt" }], bas, bas + 3_600_000).length === 0);
}
{
  // Klassning: samtliga fyndvägar + gränsfall.
  const arg = { maxObservationer: 4, fyndTystnadSek: 600 };
  KOLL("GRÖN: tomt", klassa({ omstarterIvanster: 0, tystnadsgap: [], organGap: [], ...arg }) === "GRÖN");
  KOLL("OBSERVATION: 1 mikro-gap", klassa({ omstarterIvanster: 0, tystnadsgap: [{ sek: 200 }], organGap: [], ...arg }) === "OBSERVATION");
  KOLL("FYND: omstart i fönstret", klassa({ omstarterIvanster: 1, tystnadsgap: [], organGap: [], ...arg }) === "FYND");
  KOLL("FYND: tystnad ≥ 600 s", klassa({ omstarterIvanster: 0, tystnadsgap: [{ sek: 600 }], organGap: [], ...arg }) === "FYND");
  KOLL("FYND: fler än maxObservationer", klassa({
    omstarterIvanster: 0, tystnadsgap: [{ sek: 200 }, { sek: 200 }, { sek: 200 }, { sek: 200 }, { sek: 200 }], organGap: [], ...arg,
  }) === "FYND");
  KOLL("FYND: automation-motor-miss ≥ 5 (persistent svält, v166)", klassa({
    omstarterIvanster: 0, tystnadsgap: [],
    organGap: Array.from({ length: 5 }, () => ({ organ: "automation-motor" })), ...arg,
  }) === "FYND");
  KOLL("OBSERVATION: enstaka am-miss (inte larmvärd)", klassa({
    omstarterIvanster: 0, tystnadsgap: [],
    organGap: [{ organ: "automation-motor" }], ...arg,
  }) === "OBSERVATION");
}
{
  // Epok: EGEN start-rad räknas EJ som omstart; senare start-rad gör det.
  const nu = Date.parse("2026-09-20T22:00:00Z");
  const bygg = (extra) => {
    const rader = [
      startRad("2026-09-18T20:09:54"), // epoken föds
      ropRad("2026-09-18T20:10:00", "automation-motor"),
      ...Array.from({ length: 30 }, (_, i) => ropRad(
        new Date(Date.parse("2026-09-20T21:00:00Z") + i * 60_000).toISOString().slice(0, 19), "automation-motor")),
      ...extra,
    ];
    return analysera(rader, nu, { fonsterTimmar: 24, minstaTystnadSek: 120, fyndTystnadSek: 600, maxObservationer: 4 });
  };
  const utan = bygg([]);
  KOLL("epok från start-rad", utan.epokFrånStartRad === true && utan.epok.startsWith("2026-09-18"));
  KOLL("epokens EGEN start-rad ≠ omstart (gränsbuggen, o136 §4)", utan.omstarterIvanster === 0, `fick ${utan.omstarterIvanster}`);
  KOLL("tät kadens i fönstret → GRÖN", utan.klass === "GRÖN", utan.klass);
  const med = bygg([startRad("2026-09-20T21:40:00"), ropRad("2026-09-20T21:41:00", "hjärtslag")]);
  KOLL("senare start-rad = omstart i fönstret ⇒ FYND", med.omstarterIvanster === 1 && med.klass === "FYND", `${med.omstarterIvanster}/${med.klass}`);
}
{
  // Fönster-respekt: gap UTANFÖR fönstret påverkar ej (24 h vs 54 h-doktrinen).
  const nu = Date.parse("2026-09-20T22:00:00Z");
  const rader = [
    startRad("2026-09-18T20:09:54"),
    ropRad("2026-09-18T20:10:00", "automation-motor"),
    ropRad("2026-09-19T02:00:00", "automation-motor"), // gap utanför 24 h-fönstret
    ropRad("2026-09-19T02:03:30", "automation-motor"), // 210 s-gap — OBS utanför
    ...Array.from({ length: 20 }, (_, i) => ropRad(
      new Date(Date.parse("2026-09-20T21:20:00Z") + i * 60_000).toISOString().slice(0, 19), "automation-motor")),
  ];
  const arg = { fonsterTimmar: 24, minstaTystnadSek: 120, fyndTystnadSek: 600, maxObservationer: 4 };
  const r24 = analysera(rader, nu, arg);
  KOLL("gammalt gap utanför 24 h-fönstret → GRÖN", r24.klass === "GRÖN" && r24.tystnadsgap.length === 0, r24.klass);
  const r54 = analysera(rader, nu, { ...arg, fonsterTimmar: 54 });
  KOLL(
    "210 s-gapet syns i 54 h-fönstret (epok-mätning)",
    r54.tystnadsgap.some((g) => g.sek === 210) && r54.klass !== "GRÖN",
    JSON.stringify(r54.tystnadsgap),
  );
}

console.log("rop-halsa (o136): CLI-kontrakt — exitkoder, JSON, import-säkerhet");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "rop-halsa-svit-"));
const KOR = (args, ekstra = {}) =>
  spawnSync(process.execPath, [VERKTYG, ...args], { encoding: "utf8", timeout: 30_000, ...ekstra });
{
  const logg = path.join(TMP, "gron.log");
  const rader = [
    startRad("2026-09-18T20:09:54"),
    ...Array.from({ length: 40 }, (_, i) => ropRad(
      new Date(Date.parse("2026-09-20T21:00:00Z") + i * 60_000).toISOString().slice(0, 19), "automation-motor")),
  ];
  fs.writeFileSync(logg, rader.join("\n") + "\n");
  const jsonUt = path.join(TMP, "rapport.json");
  const r = KOR(["--logg", logg, "--json", jsonUt]);
  KOLL("GRÖN → exit 0", r.status === 0, `status=${r.status} stdout=${r.stdout.slice(0, 120)}`);
  KOLL("klassraden bär ROP-HÄLSA: GRÖN", r.stdout.includes("ROP-HÄLSA: GRÖN"), r.stdout.slice(0, 100));
  const j = JSON.parse(fs.readFileSync(jsonUt, "utf8"));
  KOLL("JSON-rapportens nycklar", ["verktyg", "version", "klass", "tystnadsgap", "organGap", "omstarterIvanster", "exit"].every((k) => k in j));
  KOLL("JSON klass GRÖN + exit 0", j.klass === "GRÖN" && j.exit === 0);
  // Determinism: två körningar → identisk utdata rapports-kropp (tid-fält exkluderat).
  const jsonUt2 = path.join(TMP, "rapport2.json");
  KOR(["--logg", logg, "--json", jsonUt2]);
  const rensa = (p) => { const x = JSON.parse(fs.readFileSync(p, "utf8")); delete x.tid; return x; };
  KOLL("determinism: två körningar identiska (minus tid)", JSON.stringify(rensa(jsonUt)) === JSON.stringify(rensa(jsonUt2)));
}
{
  const logg = path.join(TMP, "fynd.log");
  const rader = [
    startRad("2026-09-18T20:09:54"),
    ropRad("2026-09-20T21:00:00", "automation-motor"),
    ropRad("2026-09-20T21:15:00", "automation-motor"), // 900 s hel-tystnad ≥ 600
    ropRad("2026-09-20T21:16:00", "automation-motor"),
  ];
  fs.writeFileSync(logg, rader.join("\n") + "\n");
  const r = KOR(["--logg", logg]);
  KOLL("hel-tystnad 900 s ⇒ FYND exit 1", r.status === 1, `status=${r.status}`);
  KOLL("klassraden bär FYND", r.stdout.includes("ROP-HÄLSA: FYND"));
  KOLL("gapdetalj radas", r.stdout.includes("TYSTNAD 900 s"));
}
{
  const r = KOR(["--logg", path.join(TMP, "saknas.log")]);
  KOLL("saknad logg ⇒ FEL exit 2", r.status === 2, `status=${r.status}`);
  KOLL("FEL-klassen loggas ärligt", (r.stdout + r.stderr).includes("ROP-HÄLSA: FEL"));
  const tom = path.join(TMP, "tom.log");
  fs.writeFileSync(tom, "bara skräp\n");
  const r2 = KOR(["--logg", tom]);
  KOLL("oparsabel logg ⇒ exit 2", r2.status === 2, `status=${r2.status}`);
  const r3 = KOR(["--logg", tom, "--fel-flagga"]);
  KOLL("okänd flagga ⇒ exit 2", r3.status === 2, `status=${r3.status}`);
}
{
  // Import-säkerhet (o80): import får ALDRIG köra mätning.
  const fore = fs.readdirSync(TMP).length;
  const r = KOR(["-e", `import(${JSON.stringify(pathToFileURL(VERKTYG).href)})`], {});
  // (-e körs inte av VERKTYG — egen process med -e: bara import-sidan)
  const protokoll = spawnSync(process.execPath, [
    "--input-type=module", "-e",
    `import ${JSON.stringify(pathToFileURL(VERKTYG).href)}; console.log("import-ok");`,
  ], { encoding: "utf8", timeout: 30_000 });
  KOLL(
    "import startar ingen mätning (tom stdout utom import-ok)",
    protokoll.status === 0 && protokoll.stdout.trim() === "import-ok" && !protokoll.stdout.includes("ROP-HÄLSA"),
    protokoll.stdout.slice(0, 100),
  );
  KOLL("import skapade ingen rapportfil", fs.readdirSync(TMP).length === fore, `${fore} → ${fs.readdirSync(TMP).length}`);
  void r;
}

console.log(`\nrop-halsa (o136): ${pass} PASS · ${fel} FAIL`);
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(fel === 0 ? 0 : 1);
