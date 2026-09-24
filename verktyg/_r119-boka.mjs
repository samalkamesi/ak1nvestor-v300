#!/usr/bin/env node
/** R119-boka: worklog + beslutsminne + commit + push (node-kanalen — skalet
 *  hänger på sammansatta git-kommandon). Pushen försöker i 12 min (fabrikens
 *  s6-omgång kan hålla prod-trädet smutsigt till ~14:21Z). */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const RESULTAT = `${ROT}/data/vakten/r119-boka-svar.txt`;
const ut = [];

function kör(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: ROT, encoding: "utf8", maxBuffer: 8 * 1024 * 1024, ...opts });
  return { kod: r.status, ut: (r.stdout || "") + (r.stderr || "") };
}

// 1) worklog-rad
const nu = new Date().toISOString().slice(0, 16).replace("T", " ") + "Z";
const worklogRad = `\n**${nu} — ROND 119 (TUNG-döden nr 6 → V230-koordination) [organ:Φ]: SJÄTTE aggregatdöden bokförd + TUNG-jakt med fabrikskoordination igång (pid 3741377).** R118:s TUNG-relaunch (pid 3730849) dog ~13:52–14:03Z utan AVBRYTER-rad — men den här gången lämnade processkartläggningen (verktyg/_r119-probe.mjs, committad) rökande pistolen: aggregatet borta men dess dev-server FÖRÄLDRALÖS (ppid 1, next dev -p 3117) höll port 3117 — F2-vaccinet i kor-alla-tester.mjs (dödar ort-rot med ppid 1 före start) täcker städningen, inget nytt gap. Trolig mördare oförändrad: minnespress (swap 4,5/8,4 GB i botten; fabrikens auto-s6-manifest skapat 13:55:46Z + parallell studio-session ~1,5 GB född ~14:02Z). V230 (verktyg/_r119-tungjakt.mjs): koordination i stället för getenväntande — jakten väntar in ett FABRIKSLJUGT fönster (prod-ko tom + inga fabriksagenter + MemAvailable ≥ 3000 MB), startar DÅ 'kor-alla-tester --fortsatt --monster=testa-styrelse' (V229-suffixrapporten bevarar v214-GRÖN; bara styrelsesviten mäts) — och när TUNG väl håller sitt minne köar fabrikens egen RAM-vakt (< 1500 MB = vägrar ny omgång) BAKOM TUNG i stället för att mörda det. 2 försök, 2 h tak, ärlig logg per rad i data/vakten/r119-tungjakt.log; resultatet bokförs när jakten landar. INGET bygge: verktyg + bokföring endast, src orörd. [studio]\n`;
fs.appendFileSync(`${ROT}/worklog.md`, worklogRad);
ut.push("worklog: +1 rad");

// 2) beslutsminne (endast om trackad — annars bara på disk)
const trackad = kör("git", ["ls-files", "--error-unmatch", "data/vakten/beslutsminne.jsonl"]);
if (trackad.kod === 0) {
  fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({
    ts: new Date().toISOString(), rond: 119,
    beslut: "rond 119 [Φ]: TUNG-döden nr 6 bokförd (föräldralös dev-server = F2-vaccinets bevis; mördare minnespress med auto-s6 + parallell session) — V230 TUNG-jakt igång: fabriksljugt fönster → --fortsatt → fabrikens RAM-vakt köar bakom; jakt-logg data/vakten/r119-tungjakt.log",
  }) + "\n");
  ut.push("beslutsminne: +1 post (trackad)");
} else {
  fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({
    ts: new Date().toISOString(), rond: 119,
    beslut: "rond 119 [Φ]: TUNG-döden nr 6 bokförd — V230 TUNG-jakt igång (fabrikskoordination)",
  }) + "\n");
  ut.push("beslutsminne: +1 post (ospårad — enbart diskminne)");
}

// 3) commit
fs.writeFileSync(`${ROT}/data/vakten/r119-commitmsg.txt`,
  "studio: rond 119 [organ:Φ] — TUNG-döden nr 6 bokförd (föräldralös dev-server; F2-vaccinet täcker) + V230 TUNG-jakt: fabriksljugt fönster → --fortsatt → fabriken köar bakom (pid 3741377)\n");
const add = kör("git", ["add", "worklog.md", "verktyg/_r119-probe.mjs", "verktyg/_r119-tungjakt.mjs", "verktyg/_r119-launch.mjs"]);
if (trackad.kod === 0) kör("git", ["add", "data/vakten/beslutsminne.jsonl"]);
ut.push(`git add: kod=${add.kod} ${add.ut.slice(0, 200)}`);
const commit = kör("git", ["commit", "-F", "data/vakten/r119-commitmsg.txt"]);
ut.push(`git commit: kod=${commit.kod} ${commit.ut.slice(0, 400)}`);
if (commit.kod !== 0) {
  fs.writeFileSync(RESULTAT, ut.join("\n") + "\nRESULTAT: COMMIT FELADE\n");
  console.log("COMMIT FELADE");
  process.exit(1);
}
const hash = commit.ut.match(/\[develop [0-9a-f]+\]/)?.[0] || commit.ut.split("\n").find((r) => r.includes("develop")) || "?";
ut.push(`commit: ${hash}`);

// 4) push med fabrik-tålamod (updateInstead kräver rent prod-träd)
let pushKod = 1, pushUt = "";
for (let i = 1; i <= 12; i++) {
  const p = kör("git", ["push", "prod", "develop"]);
  pushKod = p.kod; pushUt = p.ut;
  ut.push(`push försök ${i}: kod=${p.kod} ${p.ut.slice(0, 160).replace(/\n/g, " ")}`);
  if (p.kod === 0) break;
  if (i < 12) await new Promise((r) => setTimeout(r, 60_000));
}
fs.writeFileSync(RESULTAT, ut.join("\n") + `\nRESULTAT: ${pushKod === 0 ? "PUSH GRÖN" : "PUSH NEKAD efter 12 försök (fabriken håller prod-trädet) — committen " + hash + " landad lokalt, pushas nästa rond"}\n`);
console.log(pushKod === 0 ? "PUSH GRÖN" : "PUSH NEKAD — se r119-boka-svar.txt");
