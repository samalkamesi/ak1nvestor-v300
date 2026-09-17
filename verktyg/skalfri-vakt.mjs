#!/usr/bin/env node
// skalfri-vakt — mäter interpolerade processanrop (exec/execSync/spawn*)
// i VÄKTARDOMÄNEN (verktyg/, .zcode/, .zscripts/). Komplement till
// verktyg/mimosa-paritet.mjs, vars domän medvetet är src/ + data/infra/
// (o15: "väktarnas egen domän" lämnades därute — denna vakt täcker den).
//
// Klasslogik (ärver Mimosa:s CHILD_PROC_INTERP-läxa, o15 §Del 3):
//   FYND  = exec*/spawn* där FÖRSTA argumentet är interpolerat
//           (template `${…}` eller sträng+konkat) — skal tolkar värdet.
//   FAST  = första argumentet en ren strängsliteral — inget interpolerat
//           värde, men skal körs fortfarande (documenterat, ej fynd).
//   HÄRDAD = execFile/execFileSync/spawnSync med array-argument =
//           per definition utan skal (o15 rad 84).
//
// Begränsning (ärlig): radvis heuristik, ingen full JS-parser — samma
// klass av förenkling som Mimosa:s semgrep-yta; syftet är FÖRE/EFTER-
// dokumentation av härdningsvågor, inte en komplett analys.
//
// Undantag (granskad-lämna, protokollförs i o21): .sh-program är AV
// konstruktion skal — deras $(...)/${...} är det korrekta idiomet när
// inre citering finns och inga externa värden flödar in.
//
// CLI: node verktyg/skalfri-vakt.mjs [katalog …] [--json FIL] [--tyst]
//      (inga kataloger = verktyg + .zcode + .zscripts)
// Exit: 0 = grönt (0 fynd utan undantag), 1 = fynd, 2 = argumentfel.

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const args = process.argv.slice(2);
const jsonIndex = args.indexOf("--json");
const jsonFil = jsonIndex >= 0 ? args.splice(jsonIndex, 2)[1] : null;
const tyst = args.includes("--tyst");
const kataloger = args.filter((a) => !a.startsWith("--"));
if (args.some((a) => a.startsWith("--") && a !== "--tyst")) {
  console.error(`Okänd flagga. Tillåtna: --json FIL, --tyst`);
  process.exit(2);
}
const rötter = kataloger.length > 0 ? kataloger : ["verktyg", ".zcode", ".zscripts"];

// ── Undantag: dokumenterade granskad-lämna ──────────────────────────────────
const UNDANTAG = new Map([
  [
    ".zscripts/dev.sh",
    "bash-program: $(...)-idiom med inre citering (dirname/date/basename), inga externa värden — granskad-lämna enligt o21",
  ],
  [
    "verktyg/testa-mimosa-paritet.mjs",
    "testggrund: filens ÄNDAMÅL är att skriva farliga exec-mönster som STRÄNGDATA till tmp-filer som mimosa-pariteten ska hitta — radträffar är innehåll, inte körkod (o15 §Del 3-lärdomen om klasspecifika vittnen)",
  ],
]);

// ── Skanning ────────────────────────────────────────────────────────────────
function lsFiler(dir) {
  const ut = [];
  for (const namn of readdirSync(dir)) {
    if ([".git", "node_modules", ".next", ".mimosa", "dist", ".vercel"].includes(namn)) continue;
    const hel = join(dir, namn);
    const info = statSync(hel);
    if (info.isDirectory()) ut.push(...lsFiler(hel));
    else ut.push(hel);
  }
  return ut;
}

const FYND_RE = /\b(execSync|exec|spawnSync|spawn)\s*\(\s*(`[^`]*\$\{|["'][^"']*\$\{|["'][^"']*["']\s*\+)/;
const HARDAD_RE = /\b(execFileSync|execFile|spawnSync|spawn)\s*\(\s*["'][^"'$\n]*["']\s*,\s*\[/;
const FAST_RE = /\b(execSync|exec)\s*\(\s*["'][^'"$\n]*["']\s*[,)]/;

const fynd = [];
const hardade = [];
const fasta = [];
const undantagna = [];
let skannade = 0;

for (const rot of rötter) {
  let absolut = rot;
  if (!statSync(rot).isAbsolute) absolut = join(process.cwd(), rot);
  const filer = lsFiler(absolut).filter((f) => /\.(mjs|cjs|js|sh)$/.test(f));
  for (const fil of filer) {
    const rel = relative(process.cwd(), fil).split(sep).join("/");
    skannade++;
    if (UNDANTAG.has(rel)) {
      undantagna.push({ fil: rel, skäl: UNDANTAG.get(rel) });
      continue;
    }
    const rader = readFileSync(fil, "utf8").split("\n");
    rader.forEach((rad, i) => {
      const nr = i + 1;
      if (FYND_RE.test(rad)) fynd.push({ fil: rel, rad: nr, text: rad.trim().slice(0, 120) });
      else if (HARDAD_RE.test(rad)) hardade.push({ fil: rel, rad: nr });
      else if (FAST_RE.test(rad)) fasta.push({ fil: rel, rad: nr });
    });
  }
}

const rapport = {
  ts: new Date().toISOString(),
  doman: rötter,
  skannadeFiler: skannade,
  fynd: fynd.length,
  fyndLista: fynd,
  hardadeArrayform: hardade.length,
  hardadeLista: hardade,
  fastaKommandon: fasta.length,
  fastaLista: fasta,
  undantagna: undantagna,
};

if (jsonFil) {
  const katalog = join(jsonFil, "..");
  try { mkdirSync(katalog, { recursive: true }); } catch { /* finns */ }
  writeFileSync(jsonFil, JSON.stringify(rapport, null, 2) + "\n");
}

if (!tyst) {
  console.log(`skalfri-vakt: ${skannade} filer i ${rötter.join(", ")}`);
  for (const f of fynd) console.log(`  FYND   ${f.fil}:${f.rad}  ${f.text}`);
  for (const u of undantagna) console.log(`  UNDANTAG ${u.fil} — ${u.skäl}`);
  console.log(
    `Fynd: ${fynd.length} · härdade (arrayform): ${hardade.length} · fasta kommandon: ${fasta.length} · undantag: ${undantagna.length}`
  );
  console.log(fynd.length === 0 ? "GRÖN — väktardomänen skalfri (arrayform/fast/undantag)." : "FYND — interpolerade processanrop kvarstår.");
}

process.exit(fynd.length === 0 ? 0 : 1);
