#!/usr/bin/env node
/**
 * _r226-harda-mimosa.mjs — härdra de 13 CHILD_PROC_INTERP-fynden (o59-doktrinen:
 * execFileSync-array, ingen skalinterpretation) i de åtta gamla rondskripten.
 * Kirurgiska strängbyten med träffverifikation per rad. Kvitto: /tmp/r226-harda.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const ut = [];
const byte = (fil, gamla, nya, forvantat) => {
  let txt = readFileSync(fil, "utf8");
  const n = txt.split(gamla).length - 1;
  if (n !== forvantat) { ut.push(`AVBRYTER ${fil}: träffar ${n} ≠ ${forvantat} för: ${gamla.slice(0, 60)}…`); return false; }
  txt = txt.split(gamla).join(nya);
  writeFileSync(fil, txt);
  ut.push(`${fil}: ${n} träff(ar) härdade`);
  return true;
};

// De fem KVD-skripten: identisk rad + import-byte (execSync används endast där)
for (const f of ["verktyg/_f17-v166d17-kvd.mjs", "verktyg/_f21-v166d21-kvd.mjs", "verktyg/_f22-v166d22-kvd.mjs", "verktyg/_f23-v166d23-kvd.mjs", "verktyg/_f24-v166d24-kvd.mjs"]) {
  const ok1 = byte(f, "import { execSync } from 'node:child_process';", "import { execFileSync } from 'node:child_process';", 1);
  const ok2 = byte(f, "execSync(`git show HEAD:${FIL}`, { encoding: 'utf8' })", 'execFileSync("git", ["show", `HEAD:${FIL}`], { encoding: \'utf8\' })', 1);
  if (ok1 && ok2) {
    const kvar = (readFileSync(f, "utf8").match(/execSync\(/g) ?? []).length;
    ut.push(`  ${f}: execSync kvar=${kvar} (väntas 0)`);
  }
}

// _r187-levera.mjs — tre rader + import (kontrollera övriga execSync först)
{
  const f = "verktyg/_r187-levera.mjs";
  const innan = readFileSync(f, "utf8");
  const execSyncAntal = (innan.match(/execSync\(/g) ?? []).length;
  ut.push(`${f}: execSync-före=${execSyncAntal}`);
  const ok =
    byte(f, "import { execSync } from 'node:child_process';", "import { execFileSync } from 'node:child_process';", 1) &&
    byte(f,
      "execSync(`git -C ${ROT} add data/forskning/SEO-GUIDER-2026-09.md data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-en.json verktyg/_v171-b27-en-kvd.mjs verktyg/_r187-levera.mjs`, { encoding: 'utf8' })",
      'execFileSync("git", ["-C", ROT, "add", "data/forskning/SEO-GUIDER-2026-09.md", "data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-en.json", "verktyg/_v171-b27-en-kvd.mjs", "verktyg/_r187-levera.mjs"], { encoding: \'utf8\' })', 1) &&
    byte(f, "execSync(`git -C ${ROT} commit -F /tmp/r187-msg.txt`, { encoding: 'utf8' })",
      'execFileSync("git", ["-C", ROT, "commit", "-F", "/tmp/r187-msg.txt"], { encoding: \'utf8\' })', 1) &&
    byte(f, "execSync(`git -C ${ROT} push prod develop 2>&1`, { encoding: 'utf8' })",
      'execFileSync("git", ["-C", ROT, "push", "prod", "develop"], { encoding: \'utf8\' })', 1);
  if (ok) ut.push(`  ${f}: execSync kvar=${(readFileSync(f, "utf8").match(/execSync\(/g) ?? []).length} (väntas 0)`);
}

// _r187-ratta.mjs — tre rader + import
{
  const f = "verktyg/_r187-ratta.mjs";
  const ok =
    byte(f, "import { execSync } from 'node:child_process';", "import { execFileSync } from 'node:child_process';", 1) &&
    byte(f, "execSync(`git -C ${ROT} add worklog.md verktyg/_r187-dublett.mjs verktyg/_r187-ratta.mjs`, { encoding: 'utf8' })",
      'execFileSync("git", ["-C", ROT, "add", "worklog.md", "verktyg/_r187-dublett.mjs", "verktyg/_r187-ratta.mjs"], { encoding: \'utf8\' })', 1) &&
    byte(f, "execSync(`git -C ${ROT} commit -F /tmp/r187-ratta.txt`, { encoding: 'utf8' })",
      'execFileSync("git", ["-C", ROT, "commit", "-F", "/tmp/r187-ratta.txt"], { encoding: \'utf8\' })', 1) &&
    byte(f, "execSync(`git -C ${ROT} push prod develop 2>&1`, { encoding: 'utf8' })",
      'execFileSync("git", ["-C", ROT, "push", "prod", "develop"], { encoding: \'utf8\' })', 1);
  if (ok) ut.push(`  ${f}: execSync kvar=${(readFileSync(f, "utf8").match(/execSync\(/g) ?? []).length} (väntas 0)`);
}

// _v182-sjalvtest.mjs — två rader (strängkonkatenation räknas som interp) + import
{
  const f = "verktyg/_v182-sjalvtest.mjs";
  const ok =
    byte(f, "import { execSync } from 'node:child_process';", "import { execFileSync } from 'node:child_process';", 1) &&
    byte(f, "execSync('node ' + ROT + '/verktyg/_v182-emottag.mjs status', { cwd: ROT }).toString()",
      'execFileSync("node", [ROT + "/verktyg/_v182-emottag.mjs", "status"], { cwd: ROT }).toString()', 2);
  if (ok) ut.push(`  ${f}: execSync kvar=${(readFileSync(f, "utf8").match(/execSync\(/g) ?? []).length} (väntas 0)`);
}

writeFileSync("/tmp/r226-harda.txt", ut.join("\n"));
console.log(ut.join("\n"));
