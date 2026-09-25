#!/usr/bin/env node
/** _r225-rattelse-avslut.mjs — rättelse-commit + push + prod-verifikation. Kvitto: /tmp/r225-rattelse-avslut.txt */
import { writeFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";

const A = "/home/ak1a/agent/ak1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 200)}`);
  return r;
};

const MSG = `studio: [organ:Φ] rond 225 RÄTTELSE — U29:s milestone-formulering 'UK:s sista 1-gren öppnad, sju grenar alla ≥2' var FEL: prod-verifieringen (_r225-u29-prodverif.mjs) visar kvarvarande UK-1-grenar hälsa (GSK.L) och kommunikation (BT.L) — det var U26-köns NAMNGIVNA grenar (energi/konsument/teknik) som öppnats, ej alla. Rättat kirurgiskt: SGE.L-radens notering+paranoid (strängbyte verifierat med läs-tillbaka, 291 rader, felsträngar borta, data/tal/lås opåverkade), worklog-rättelserad, PIPELINE-KO (milestone + kö med UK-hälsa/UK-kommunikation), protokoll V173-U29, beslutsminnet. Självfångat i efterverifieringen — lärodomen: grenstrukturmätningen körs FÖRE 'alla/alla'-formuleringar, aldrig härleds ur köns namngivning. Läckagevakt GRÖN 0 (525) på rättat läge.`;
writeFileSync("verktyg/_r225-rattelse-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "data/forskning/V173-U29-SGE-SAGE-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r225-u29-prodverif.mjs", "verktyg/_r225-u29-rattelse.mjs", "verktyg/_r225-u29-ko-uppdatera.mjs", "verktyg/_r225-rattelse-commitmsg.txt"], "add");
const c = run(A, ["commit", "-F", "verktyg/_r225-rattelse-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r225-rattelse-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
const pu = run(A, ["push", "prod", "develop"], "push");
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher/);
  ut.push("LIVE llms: " + (m ? m[1] + " bolag" : "mönster saknas"));
  run(A, ["status", "--porcelain"], "slut");
}
writeFileSync("/tmp/r225-rattelse-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
