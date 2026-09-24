#!/usr/bin/env node
// testa-beroende-vakt-cron.mjs — svit för o164: beroendevaktens driftkanal.
// =====================================================================
// Två domäner:
//   V — ÄKTA verktyg/beroende-vakt.mjs mot mockad npm (PATH-injektion) med
//       utdata-överridning (BERODEVAKT_RAPPORTKATALOG/VAKTKATALOG): idem-
//       potenskontraktet (SENASTE=ny|oforandrad), exitkodskontraktet 0/1/2.
//   W — ÄKTA wrapper (beroende-vakt-cron.sh) mot mock-kommandon: logg-
//       klasserna GRÖN/FYND/VAKTFEL/OVÄNTAD/SKIPPAD, git-committen vid
//       SENASTE=ny, retentionen, larmvägen (dummy-env ⇒ kan ALDRIG posta
//       skarpt, git-mock ⇒ kan ALDRIG röra prod-trädet).
// Svitkontrakt: PASS/FAIL per påstående, sista raden "SVIT <p> PASS /
// <f> FAIL", exit 0 endast vid 0 FAIL. Ingen prod-yta berörs: allt i tmp.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, existsSync, writeFileSync, rmSync, statSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chmodX = (p) => chmodSync(p, 0o755);
const WRAPPER = path.join(REPO, "data", "infra", "contabo", "beroende-vakt-cron.sh");
const VERKTYG = path.join(REPO, "verktyg", "beroende-vakt.mjs");

let pass = 0;
let fail = 0;
const rapport = (namn, ok, detalj = "") => {
  if (ok) {
    pass++;
    console.log(`PASS ${namn}`);
  } else {
    fail++;
    console.log(`FAIL ${namn}${detalj ? ` — ${detalj}` : ""}`);
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TMP = path.join(tmpdir(), `berodevakt-svit-${Date.now()}`);
const RAPPORTKAT = path.join(TMP, "rapporter");
const VAKTKAT = path.join(TMP, "vakten");
const BIN = path.join(TMP, "bin");
for (const d of [RAPPORTKAT, VAKTKAT, BIN]) mkdirSync(d, { recursive: true });

// ── mock-npm: svarar audit/outdated ur styrbara fixture-filer ──────────
const AUDIT_JSON = path.join(TMP, "audit.json");
const OUTDATED_JSON = path.join(TMP, "outdated.json");
writeFileSync(
  path.join(BIN, "npm"),
  `#!/usr/bin/env bash
case "$1" in
  audit) if [ -s "${AUDIT_JSON}" ]; then cat "${AUDIT_JSON}"; else exit 1; fi ;;
  outdated) cat "${OUTDATED_JSON}" 2>/dev/null || printf '' ;;
esac
exit 0
`,
);
chmodX(path.join(BIN, "npm"));
const GRON_AUDIT = {
  metadata: { vulnerabilities: { info: 0, low: 0, moderate: 1, high: 0, critical: 0, total: 1 } },
  vulnerabilities: {
    "paket-x": {
      severity: "moderate",
      isDirect: false,
      via: [{ title: "Exempel-M", url: "https://example.invalid/GHSA-x", range: "<2.0.0" }],
      fixAvailable: false,
    },
  },
};
const ROD_AUDIT = {
  ...GRON_AUDIT,
  metadata: { vulnerabilities: { info: 0, low: 0, moderate: 1, high: 1, critical: 0, total: 2 } },
  vulnerabilities: {
    ...GRON_AUDIT.vulnerabilities,
    "js-yaml-exempel": {
      severity: "high",
      isDirect: false,
      via: [{ title: "Exempel-H", url: "https://example.invalid/GHSA-y", range: "<4.3.0" }],
      fixAvailable: { name: "js-yaml-exempel", version: "4.3.0" },
    },
  },
};
writeFileSync(OUTDATED_JSON, JSON.stringify({ zod: { current: "4.6.0", wanted: "4.6.5", latest: "5.0.0" } }));

const korVerktyg = () =>
  spawnSync(process.execPath, [VERKTYG], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${BIN}:${process.env.PATH}`,
      BERODEVAKT_RAPPORTKATALOG: RAPPORTKAT,
      BERODEVAKT_VAKTKATALOG: VAKTKAT,
    },
  });

const senasteSokvag = path.join(RAPPORTKAT, "beroende-halsa-SENASTE.md");

async function verktygsdomaener() {
  console.log("── V: ÄKTA verktyget mot mockad npm ──");
  writeFileSync(AUDIT_JSON, JSON.stringify(GRON_AUDIT));

  const v1 = korVerktyg();
  rapport(
    "V1 första mätning: exit 0 + RESULTAT_JSON + SENASTE=ny + rapporten skriven",
    v1.status === 0 && /^RESULTAT_JSON=/m.test(v1.stdout) && /^SENASTE=ny$/m.test(v1.stdout) && existsSync(senasteSokvag),
    `exit=${v1.status} stdout=${JSON.stringify((v1.stdout || "").slice(-200))}`,
  );
  const v1json = (v1.stdout.match(/^RESULTAT_JSON=(.*)$/m) || [])[1] || "{}";
  rapport(
    "V1b grön mätning räknar rätt (1 sårbarhet, 0 critical, 0 high, 1 inom intervall)",
    (() => {
      try {
        const j = JSON.parse(v1json);
        return j["sårbarheter"] === 1 && j.critical === 0 && j.high === 0 && j.inomIntervall === 1;
      } catch {
        return false;
      }
    })(),
    v1json,
  );

  // bevara mtime: om verktyget skriver OM filen får den ny mtime — kontraktet
  // säger oförändrad läge ⇒ ingen skrivning alls (mtime + innehåll bevaras)
  const mtimeFore = statSync(senasteSokvag).mtimeMs;
  await sleep(1100); // fs-tidsupplösning-skydd
  const v2 = korVerktyg();
  const mtimeEfter = statSync(senasteSokvag).mtimeMs;
  rapport(
    "V2 identisk omätning: SENASTE=oforandrad + filen EJ omskriven (mtime bevarad)",
    v2.status === 0 && /^SENASTE=oforandrad$/m.test(v2.stdout) && mtimeEfter === mtimeFore,
    `exit=${v2.status} mtime ${mtimeFore}→${mtimeEfter}`,
  );

  writeFileSync(AUDIT_JSON, JSON.stringify(ROD_AUDIT));
  const v3 = korVerktyg();
  const v3json = (v3.stdout.match(/^RESULTAT_JSON=(.*)$/m) || [])[1] || "{}";
  rapport(
    "V3 high dyker upp: exit 1 (vaktens arbetskod) + SENASTE=ny (git-ytan SPELAR roll)",
    v3.status === 1 && /^SENASTE=ny$/m.test(v3.stdout) && v3json.includes('"high":1'),
    `exit=${v3.status} json=${v3json}`,
  );
  rapport(
    "V3b rapporten bar high-rad i texten",
    /js-yaml-exempel/.test(readFileSync(senasteSokvag, "utf8")),
    "high-paketet syns inte i SENASTE.md",
  );

  writeFileSync(AUDIT_JSON, ""); // tom fil ⇒ mock ekar inget + -s-testet faller ⇒ exit 1 utan stdout
  const v4 = korVerktyg();
  rapport(
    "V4 npm tystnar: exit 2 (verktygsfel, ej falskgrön)",
    v4.status === 2,
    `exit=${v4.status}`,
  );
}

// ── mock-kommandon + mock-git för wrapper-domänen ───────────────────────
const GITMARKER = path.join(TMP, "git-anrop.log");
writeFileSync(
  path.join(BIN, "git-mock"),
  `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "${GITMARKER}"
exit 0
`,
);
chmodX(path.join(BIN, "git-mock"));
writeFileSync(path.join(TMP, "tom.env"), "");
const LAS = path.join(TMP, "deploy.lock");

const nyMock = (namn, utdata, kod) => {
  const p = path.join(BIN, namn);
  // heredoc: utdata får RIKTIGA radbrytningar (JSON.stringify-formen gör \n
  // till två tecken, vilket dödade ^…$-ankren i wrapperns grep)
  writeFileSync(p, `#!/usr/bin/env bash\ncat <<'MOJ'\n${utdata}\nMOJ\nexit ${kod}\n`);
  chmodX(p);
  return p;
};
const korWrapper = (extra = {}) =>
  spawnSync("bash", [WRAPPER], {
    encoding: "utf8",
    env: {
      ...process.env,
      BERODEVAKT_KATALOG: VAKTKAT,
      BERODEVAKT_DEPLOYLAS: LAS,
      BERODEVAKT_ENV_FIL: path.join(TMP, "tom.env"),
      BERODEVAKT_GIT_KOMMANDO: path.join(BIN, "git-mock"),
      ...extra,
    },
  });
const lasLogg = () => {
  try {
    return readFileSync(path.join(VAKTKAT, "beroende-vakt-cron.log"), "utf8");
  } catch {
    return "";
  }
};

async function wrapperdomaener() {
  console.log("── W: ÄKTA wrappern mot mockade klasser ──");

  // W1 GRÖN + oförändrad ⇒ ingen git
  rmSync(GITMARKER, { force: true });
  let r = korWrapper({ BERODEVAKT_KOMMANDO: nyMock("w1", "RESULTAT_JSON={\"sårbarheter\":1,\"critical\":0,\"high\":0}\nSENASTE=oforandrad", 0) });
  let logg = lasLogg();
  rapport(
    "W1 grön: loggrad GRÖN + exit 0",
    r.status === 0 && /GRÖN — 0 critical\/high/.test(logg),
    `exit=${r.status} logg=${JSON.stringify(logg.slice(-160))}`,
  );
  rapport(
    "W1b SENASTE=oforandrad ⇒ git-mock EJ anropad (trädet orört)",
    !existsSync(GITMARKER),
    existsSync(GITMARKER) ? readFileSync(GITMARKER, "utf8") : "",
  );

  // W2 GRÖN + SENASTE=ny ⇒ git add+commit
  rmSync(GITMARKER, { force: true });
  r = korWrapper({ BERODEVAKT_KOMMANDO: nyMock("w2", "RESULTAT_JSON={\"sårbarheter\":1,\"critical\":0,\"high\":0}\nSENASTE=ny", 0) });
  logg = lasLogg();
  const gitAnrop = existsSync(GITMARKER) ? readFileSync(GITMARKER, "utf8") : "";
  rapport(
    "W2 SENASTE=ny ⇒ add+commit anropade + 'committad av vakten'-loggrad",
    /rapporten committad av vakten/.test(logg) && /^add /m.test(gitAnrop) && /^commit /m.test(gitAnrop),
    `logg=${JSON.stringify(logg.slice(-160))} git=${JSON.stringify(gitAnrop)}`,
  );

  // W3 exit 0 utan kontraktsrad
  r = korWrapper({ BERODEVAKT_KOMMANDO: nyMock("w3", "tyst verktyg", 0) });
  logg = lasLogg();
  rapport(
    "W3 exit 0 utan RESULTAT_JSON ⇒ OVÄNTAD-anomali-loggrad (våg 142)",
    r.status === 0 && /OVÄNTAD EXIT 0 utan RESULTAT_JSON/.test(logg),
    `exit=${r.status} logg=${JSON.stringify(logg.slice(-160))}`,
  );

  // W4 FYND exit 1 + dummy-env ⇒ larmvägen bruten (ALDRIG skarp post)
  r = korWrapper({ BERODEVAKT_KOMMANDO: nyMock("w4", "RESULTAT_JSON={\"sårbarheter\":9,\"critical\":1,\"high\":2}\nSENASTE=oforandrad", 1) });
  logg = lasLogg();
  rapport(
    "W4 fynd: exit 1 + FYND-loggrad + larmvägen bruten (dummy-env, ingen skarp post)",
    r.status === 1 && /FYND men larmvägen bruten/.test(logg),
    `exit=${r.status} logg=${JSON.stringify(logg.slice(-160))}`,
  );

  // W5 VAKTFEL exit 2
  r = korWrapper({ BERODEVAKT_KOMMANDO: nyMock("w5", "FEL: npm audit misslyckades", 2) });
  logg = lasLogg();
  rapport(
    "W5 verktygsfel: exit 2 + VAKTFEL-loggrad + larmvägen bruten",
    r.status === 2 && /VAKTFEL men larmvägen bruten/.test(logg),
    `exit=${r.status} logg=${JSON.stringify(logg.slice(-160))}`,
  );

  // W6 okänd exit-kod — else-grenen klassar VAKTFEL och viktigar exiten
  r = korWrapper({ BERODEVAKT_KOMMANDO: nyMock("w6", "konstigt", 7) });
  logg = lasLogg();
  rapport(
    "W6 okänd exit 7 ⇒ VAKTFEL-klass (larmvägsrad) + koden viktigidarebefordrad",
    r.status === 7 && /VAKTFEL men larmvägen bruten/.test(logg),
    `exit=${r.status} logg=${JSON.stringify(logg.slice(-160))}`,
  );

  // W7 deploylås hålls ⇒ SKIPPAD
  const hallare = spawn("bash", ["-c", `flock "${LAS}" -c 'sleep 3'`]);
  await sleep(400); // barnet hinner ta låset
  r = korWrapper({ BERODEVAKT_KOMMANDO: nyMock("w7", "RESULTAT_JSON={}", 0) });
  logg = lasLogg();
  rapport(
    "W7 deploylås hålls ⇒ SKIPPAD-loggrad + verktyget EJ kört (exit 0)",
    r.status === 0 && /SKIPPAD — deployfönster aktivt/.test(logg),
    `exit=${r.status} logg=${JSON.stringify(logg.slice(-160))}`,
  );
  hallare.kill();
  // flock-barnet ('sleep 3') överlever kill av bash-föräldern kort — polla
  // tills låset faktiskt är fritt så W8/W9 inte fastnar i SKIPPAD-grenen
  for (let i = 0; i < 30; i++) {
    if (spawnSync("bash", ["-c", `flock -n "${LAS}" -c 'true'`]).status === 0) break;
    await sleep(200);
  }

  // W8 retention: 35 gamla timestamp-json ⇒ ≤ 30 kvar
  for (let i = 1; i <= 35; i++) writeFileSync(path.join(VAKTKAT, `beroende-vakt-2026-08-${String(i).padStart(2, "0")}T00-00-00.json`), "{}");
  r = korWrapper({ BERODEVAKT_KOMMANDO: nyMock("w8", "RESULTAT_JSON={\"sårbarheter\":0,\"critical\":0,\"high\":0}\nSENASTE=oforandrad", 0) });
  const kvar = spawnSync("bash", ["-c", `ls -1 "${VAKTKAT}"/beroende-vakt-*.json | wc -l`], { encoding: "utf8" }).stdout.trim();
  rapport(
    "W8 retention: 35 gamla rapporter ⇒ ≤ 30 kvar efter körning",
    Number(kvar) <= 30,
    `kvar=${kvar}`,
  );

  // W9 exit 1 utan kontraktsrad (verktyget lovar JSON vid fynd)
  r = korWrapper({ BERODEVAKT_KOMMANDO: nyMock("w9", "diverse utdata men ingen rad", 1) });
  logg = lasLogg();
  rapport(
    "W9 exit 1 utan RESULTAT_JSON ⇒ OVÄNTAD-loggrad, inget FYND-larm",
    r.status === 0 && /OVÄNTAD EXIT 1 utan RESULTAT_JSON/.test(logg) && !/FYND-larm/.test(logg),
    `exit=${r.status} logg=${JSON.stringify(logg.slice(-160))}`,
  );
}

async function main() {
  process.chdir(REPO); // wrappern cd:ar självt till ROT; chdir gör cwd-neutral
  await verktygsdomaener();
  await wrapperdomaener();
  console.log(`SVIT ${pass} PASS / ${fail} FAIL`);
  rmSync(TMP, { recursive: true, force: true });
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("SVITKRASCH:", e);
  process.exit(1);
});
