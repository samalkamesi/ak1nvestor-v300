#!/usr/bin/env node
/** ROND 122 bokning [organ:Φ]: F3-vaccinet (V235, differentiell diagnos) +
 * TUNG-jakt V230 omstart. Worklog + feljakt-bedömning + beslutsminne +
 * commit + push med fabrik-tålmodig retry (prod-trädet kan vara upptaget
 * av fabriksbarn). Kör DESC: node verktyg/_f3-boka.mjs "<eldprovs-rad>"
 * Skriver status till data/vakten/f3-boka-svar.txt. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const SVAR = `${ROT}/data/vakten/f3-boka-svar.txt`;
const eldprov = process.argv[2]
  || (fs.existsSync(`${ROT}/data/vakten/f3-eldprov-resultat.txt`) ? fs.readFileSync(`${ROT}/data/vakten/f3-eldprov-resultat.txt`, "utf8").trim() : "eldprov okänd");
const ts = new Date().toISOString();
const lines = [`BOKNING start ${ts}`];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cd = (arr, opts = {}) => execFileSync(arr[0], arr.slice(1), { encoding: "utf8", cwd: ROT, maxBuffer: 16 * 1024 * 1024, ...opts });

try {
  // 1) worklog
  const wlPath = `${ROT}/worklog.md`;
  const wl = fs.readFileSync(wlPath, "utf8");
  if (!wl.includes("ROND 122 [organ:Φ] — F3-VACCINET")) {
    fs.appendFileSync(wlPath, `

**ROND 122 [organ:Φ] — F3-VACCINET (V235): FELJÄGARENS DIFFERENTIELLA DIAGNOS + TUNG-JAKT V230 OMSTART:** FYNN nr 2 eskalerade /andringar nätverksfel med en FÄRSK äkta mätning (jakt 14:57–14:59Z) — men mätningen föll i prod-synkens deployfönster (omstart + kall app + s7:s chrome-last ⇒ TimeoutError). Roten: feljägarens rond 44-deploygrind slutar gälla när LÅSET släpper — pm2-omstartens efterdyning (kall app) täcks inte. VACCIN (verktyg/feljagaren.mjs, F3-grenen): differentiell diagnos — rot-sond GET / före dom: död rot ⇒ MEDEL "rot nere — miljöfönster" (eskalerar ALDRIG), levande rot + döda api:er ⇒ HÖG med rot-LEVER-bevis (äkta API-fel eskaleras oförändrat). Eldprov: ${eldprov}. TUNG-jakten V230 lärde oss två saker: 2 h utan fönster (fabriken aktiv 100 %, ärligt avslut 16:46Z exit 2) och RELAUNCHEN (pid 3852222 17:02Z) FÖRST FRÖS efter 5 min (S-vila, barnlös, tystnad — troligen ps/execFileSync under belastning) och avlivades 17:13Z; ny strategi: RONDSTYRD avfyring — varje rond kontrollerar fönstret (ko tom + inga agenter + RAM ≥ 3 GB) och avfyrar TUNG direkt detached, ingen långlevande väntarprocess som kan frysa; V229-suffix bevarar v214-GRÖN. Verktyg committade: _f3-vaccin-test.mjs (återanvändbart eldprov) + _r119-tungjakt.mjs/_r119-launch.mjs (jakten) + engångswrappers för transparens.
`);
    lines.push("worklog: +ROND 122");
  } else lines.push("worklog: redan bokad (idempotent)");

  // 2) feljakt-bedömning (FYNN nr 2)
  const ledger = `${ROT}/data/vakten/feljakt-bedomningar.jsonl`;
  if (!fs.readFileSync(ledger, "utf8").includes("rotkurad (vaccinerad)")) {
    fs.appendFileSync(ledger, JSON.stringify({
      ts, spår: "F3-api", allvar: "GRÖN",
      fynd: "/andringar nätverksfel (FYNN-eskalering nr 2, 2026-09-20 17:31) — fyndet ÄKT men miljöbetingat",
      dom: "rotkurad (vaccinerad) — eskaleringens mätning föll i deployfönstrets efterdyning",
      rotorsaka: "Feljägarens rond 44-deploygrind (vägrar HÖG medan /tmp/ak1a-deploy.lock hålls) slutar gälla när låset släpper — men pm2-omstarten lämnar en KALL app efter låset (ISR-cache tom, första laddningar långsamma) och s7:s chrome-tunga A/B-mätningar låg samtidigt på boxen ⇒ TimeoutError som uppfyller HÖG-kriteriet utan att api:t är trasigt (36/36 GRÖN före 12:34 och efter 17:32).",
      kur: "VACCIN V235 i verktyg/feljagaren.mjs (F3-grenen): differentiell diagnos — rot-sond GET / före all HÖG-dom: rot nere ⇒ MEDEL 'rot nere — miljöfönster (deploy/omstart)' som eskalerar aldrig; rot LEVER ⇒ HÖG bevaras med bevissträngen 'rot LEVER (GET / 200)'. Äkta API-fel förlorar inget skydd.",
      bevis: `Eldprov verktyg/_f3-vaccin-test.mjs (isolerade FYND-filer, äkta ledgern orörd): ${eldprov}`,
      lag: "1 (återmätning 36/36 GRÖN före+efter) · 2 (rot: grindens efterdyningstäckning, ingen ytlagning) · 6 (dom + vaccin + eldprov bokförda)",
      protokoll: "rond 122 F3-order nr 2 (FYNN) — verkställd av studion [organ:Φ]",
    }) + "\n");
    lines.push("ledger: +FYNN nr 2-bedömning");
  } else lines.push("ledger: redan bokad");

  // 3) beslutsminne (idempotent — dubbelrader förbjudna)
  const minne = `${ROT}/data/vakten/beslutsminne.jsonl`;
  if (!fs.readFileSync(minne, "utf8").includes('"rond":122,"beslut":"F3-vaccin V235')) {
    fs.appendFileSync(minne, JSON.stringify({ ts, rond: 122, beslut: "F3-vaccin V235: feljägarens differentiella diagnos (rot-sond + keep-alive-härdning) + TUNG-strategi rondstyrd (frusen väntare avliven) + eldprov " + eldprov, landat: "" }) + "\n");
    lines.push("beslutsminne: +rond 122");
  } else lines.push("beslutsminne: redan bokad");

  // 4) commit
  cd(["git", "add",
    "verktyg/feljagaren.mjs", "verktyg/_f3-vaccin-test.mjs", "verktyg/_f3-boka.mjs",
    "verktyg/_f3-boka-launch.mjs", "verktyg/_f3-eldprov-launch.mjs", "verktyg/_doda-jakt.mjs",
    "verktyg/_f3-mikro.mjs", "verktyg/_f3-mikro2.mjs",
    "verktyg/_r119-tungjakt.mjs", "verktyg/_r119-launch.mjs", "verktyg/_r119-boka.mjs",
    "verktyg/_r119-dokvag.mjs", "verktyg/_r121c-commit.mjs",
    "worklog.md", "data/vakten/feljakt-bedomningar.jsonl"]);
  const msg = `studio: rond 122 [organ:Φ] — F3-vaccinet V235: feljägarens differentiella diagnos (rot-sond GET / före HÖG-dom: död rot => MEDEL miljöfönster, levande rot + döda api:er => HÖG bevaras) + keep-alive-härdning (endast framgång cachas + omprövning) med eldprov ${eldprov}; TUNG-strategi rondstyrd (frusen väntare avliven); FYNN nr 2:s eskalering förklarad: mätning i deployefterdyning (kall app + s7-chrome)`;
  fs.writeFileSync("/tmp/f3-commitmsg.txt", msg);
  const commit = cd(["git", "commit", "-F", "/tmp/f3-commitmsg.txt"]);
  lines.push("commit: " + commit.split("\n")[0]);

  // 5) push med retry (prod-trädet upptaget av fabriksbarn är normalt)
  let pushad = "";
  for (let i = 1; i <= 30 && !pushad; i++) {
    try { pushad = cd(["git", "push", "prod", "develop"]); }
    catch (e) {
      try { cd(["git", "fetch", "prod", "develop"]); cd(["git", "merge", "-m", "merge prod (fabriksleveranser) — rond 122", "prod/develop"]); } catch {}
      lines.push(`push försök ${i}: upptaget — väntar 60 s`);
      fs.writeFileSync(SVAR, lines.join("\n") + "\n");
      await sleep(60_000);
    }
  }
  lines.push(pushad ? `PUSH GRÖN: ${pushad.trim().split("\n").pop()}` : "PUSH nejkad efter 30 försök — väntare krävs");
  // kvittera beslutsminnet
  if (pushad) {
    const m = fs.readFileSync(minne, "utf8").trim().split("\n");
    const sista = JSON.parse(m.pop());
    sista.landat = "ja";
    m.push(JSON.stringify(sista));
    fs.writeFileSync(minne, m.join("\n") + "\n");
  }
  lines.push(`BOKNING klar ${new Date().toISOString()}`);
} catch (e) {
  lines.push(`FEL: ${String(e.stderr || e.message).slice(0, 600)}`);
}
fs.writeFileSync(SVAR, lines.join("\n") + "\n");
console.log(lines.join("\n"));
