#!/usr/bin/env node
// ── CRON-MODE-KONTRAKTET (o561, spår 8 — svaret på nattens tysta vaktdöd) ───
//
// BAKGRUND (2026-09-28): samtliga fem direkt-ropade cron-skript i
// data/infra/contabo/ befanns -rw-rw-r-- (644) i SÅVÄL working tree SOM
// git-index — crontab ropar dem utan bash-prefix, och /bin/sh -c vägrar
// 644-filer (empiriskt bevisat: "Permission denied", exit 126). Prod-synkens
// pull kl 03:00:11 levererade om tre av dem med index-mode 100644 ⇒
// exekverarbiten sanerades ⇒ vakterna dog TYST vid morgonens rop:
// beroendevakten (05:37, loggen slutar 27 sep) och rop-hälsan (06:27,
// loggen slutar 27 sep) bevisligen; natt-TBT:cronen hade precis levererats
// 644 kl 20:10:27 (r304-kurens CHROME_PATH) och skulle dött 03:27.
// Rotorsaken: installationernas chmod +x (o136/o151/o164/r283) kom ALDRIG
// med i git — indexet bar 100644 sedan respektive commit, och varje pull
// som rör filen skriver om den ockej exekverbar.
//
// KUR (o561): chmod +x ×5 lokalt + git update-index --chmod=+x (index bär
// 100755 — framtida pulls levererar exekverbara filer). Denna svit är
// regressiongrinden: samma klass av död får ALDRIG kunna ske tyst igen —
// kor-alla-tester.mjs plockar upp sviten (DETERMINISTISK-klassen), så varje
// svitskörning (rond-emottag, KVD) verifierar kontraktet.
//
// KONTRAKT (tre regler — källan är crontab -l självt, inga manuella register):
//   R1 CRONTAB-ROPAD: varje skriptväg som crontab ropar DIREKT (absolut sökväg
//      som slutar .sh utan bash/sh/node-prefix) skall vara exekverbar
//      (access X_OK) i working tree.
//   R2 INDEX-MODE: varje crontab-ropat skript skall bära mode 100755 i
//      git-indexet — annars sanerar nästa pull som rör filen biten (rotfelet
//      från 2026-09-28).
//   R3 SHEBANG: varje crontab-ropat skript skall börja på #! (execve kräver
//      tolk-deklaration när crond släpper in det).
//
//   rader ropade via tolk (/usr/bin/node …, /bin/bash …) mäts inte av R1-R3 —
//   tolken är exekverbar, skriptet behöver inget +x. crontab -l ej körbar
//   (främmande miljö) ⇒ fall fritt på R4: alla data/infra/contabo/*cron*.sh
//   skall vara +x OCH 100755 i index (installationens alla wrappers).
//
// Exit: 0 = grönt (0 fel) · 1 = fel (kontraktsbrott — LARM-klass: vakt död
// eller döende). Rapport: data/vakten/cron-mode-SENASTE.json. Svitten är
// DETERMINISTISK (inget nätverk, inget byggande, läsning + git ls-files).

import { accessSync, readFileSync, readdirSync, constants, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTABO = path.join(REPO, "data", "infra", "contabo");
const RAPPORT = path.join(REPO, "data", "vakten", "cron-mode-SENASTE.json");

let pass = 0;
let fel = [];
const kontroll = (villkor, beskrivning) => {
  if (villkor) { pass++; console.log(`PASS ${beskrivning}`); }
  else { fel.push(beskrivning); console.log(`FEL ${beskrivning}`); }
};

// ── R1+R3: crontab-ropade skript ────────────────────────────────────────────
let cronRader = [];
try {
  cronRader = execFileSync("crontab", ["-l"], { encoding: "utf8" }).split("\n");
} catch {
  console.log("OBs: crontab -l ej körbar här — R4-fallback (alla *cron*.sh)");
}

const ropadeSkript = new Set();
for (const rad of cronRader) {
  const ren = rad.replace(/\\%.*/g, "").trim();
  if (!ren || ren.startsWith("#")) continue;
  // fält 6+ = kommandot; direkt-rop = absolut sökväg som FÖRSTA token
  const falt = ren.split(/\s+/);
  const kommando = falt.slice(5).join(" ");
  const forsta = kommando.split(/\s+/)[0] || "";
  if (forsta.startsWith("/") && forsta.endsWith(".sh")) {
    // tolk-prefix? (t.ex. "/bin/bash /väg/x.sh" har x.sh som ANDRA token)
    const match = kommando.match(/(?:^|\s)((?:\/[\w.-]+)+\.sh)(?:\s|$)/);
    const mal = match ? match[1] : null;
    if (forsta.endsWith(".sh") && mal === forsta) ropadeSkript.add(forsta);
  }
}

for (const skript of [...ropadeSkript].sort()) {
  const namn = path.basename(skript);
  let läsbart = true;
  try { accessSync(skript, constants.R_OK); } catch { läsbart = false; }
  kontroll(läsbart && _x(skript), `R1 ${namn}: crontab-ropad skript är exekverbart (+x) i working tree`);
  kontroll(_shebang(skript), `R3 ${namn}: shebang-rad finns (#!)`);
}

// ── R2+R4: git-index-mode ──────────────────────────────────────────────────
const malFil = (dir, bas) => path.join(dir, bas);
function _x(fil) { try { accessSync(fil, constants.X_OK); return true; } catch { return false; } }
function _shebang(fil) {
  try { return readFileSync(fil, "utf8").startsWith("#!"); } catch { return false; }
}

// alla wrappers i contabo-katalogen (R4-fallback + kompletterande skydd):
const wrappers = readdirSync(CONTABO).filter((f) => f.endsWith("-cron.sh"));
const granskade = new Set([...ropadeSkript].map((s) => path.basename(s)));
for (const bas of wrappers) granskade.add(bas); // crontab-ropade ELLER wrapper

// git-index-mode för alla granskade (relativ sökväg)
let indexRader = "";
try {
  indexRader = execFileSync("git", ["ls-files", "-s", "data/infra/contabo/"], { cwd: REPO, encoding: "utf8" });
} catch (e) {
  fel.push(`git ls-files ej körbar: ${e.message.split("\n")[0]}`);
}
const indexMode = new Map();
for (const rad of indexRader.split("\n")) {
  const m = rad.match(/^(\d{6}) [0-9a-f]+ \d+\t(.+)$/);
  if (m) indexMode.set(m[2], m[1]);
}

for (const bas of [...granskade].sort()) {
  const relativ = `data/infra/contabo/${bas}`;
  const abs = malFil(CONTABO, bas);
  const ropad = ropadeSkript.has(malFil(CONTABO, bas)) || ropadeSkript.has(abs);
  kontroll(indexMode.get(relativ) === "100755",
    `R2 ${bas}: git-index bär 100755${ropad ? " (crontab-ropad)" : ""}`);
  if (!ropad) {
    // R4: även icke-ropade wrappers skyddas — de är installationskontrakt
    kontroll(_x(abs), `R4 ${bas}: wrapper exekverbar i working tree`);
  }
}

// ── rapport + dom ──────────────────────────────────────────────────────────
const rapport = {
  protokoll: "o561",
  tid: new Date().toISOString(),
  pass,
  fel: fel.length,
  feldetaljer: fel,
  ropadeSkript: [...ropadeSkript].sort(),
  granskadeFiler: [...granskade].sort(),
};
writeFileSync(RAPPORT, JSON.stringify(rapport, null, 2) + "\n");
console.log(`\nRESULTAT: ${pass} PASS ${fel.length} FAIL — rapport: data/vakten/cron-mode-SENASTE.json`);
process.exit(fel.length === 0 ? 0 : 1);
