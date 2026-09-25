#!/usr/bin/env node
/** _r226-harda-rest.mjs — härda de två sista (tolererade men nu referenslösa) execSync-raderna. Kvitto: /tmp/r226-harda-rest.txt */
import { readFileSync, writeFileSync } from "node:fs";
const ut = [];
const byte = (fil, gamla, nya) => {
  let txt = readFileSync(fil, "utf8");
  const n = txt.split(gamla).length - 1;
  if (n !== 1) { ut.push(`AVBRYTER ${fil}: ${n} träffar`); return; }
  writeFileSync(fil, txt.split(gamla).join(nya));
  ut.push(`${fil}: härdad`);
};
byte("verktyg/_f22-v166d22-kvd.mjs",
  "execSync('node node_modules/typescript/bin/tsc --noEmit', { cwd: '/home/ak1a/AK1', stdio: 'pipe', timeout: 240000 });",
  'execFileSync("node", ["node_modules/typescript/bin/tsc", "--noEmit"], { cwd: \'/home/ak1a/AK1\', stdio: \'pipe\', timeout: 240000 });');
byte("verktyg/_r187-levera.mjs",
  "execSync(`git -C /home/ak1a/AK1 cat-file -e HEAD:data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-en.json`);",
  'execFileSync("git", ["-C", "/home/ak1a/AK1", "cat-file", "-e", "HEAD:data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-en.json"]);');
for (const f of ["verktyg/_f22-v166d22-kvd.mjs", "verktyg/_r187-levera.mjs"]) {
  ut.push(`${f}: execSync kvar=${(readFileSync(f, "utf8").match(/execSync\(/g) ?? []).length}`);
}
writeFileSync("/tmp/r226-harda-rest.txt", ut.join("\n"));
console.log(ut.join("\n"));
