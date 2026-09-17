#!/usr/bin/env node
// s8-u1 o46 — rätta köfilens sökväg i protokoll + worklog (data/vakten/ → data/infra/).
// En-träff-verifiering per ersättning (clobber-kuren); kör EN gång.
import fs from "node:fs";

const filer = [
  "/home/ak1a/AK1/data/forskning/OPTIMERING/o46-patch-ko-s8.md",
  "/home/ak1a/AK1/worklog.md",
  "/home/ak1a/AK1/verktyg/_s8u1o46-commitmsg.txt",
];
const byt = [
  ["data/vakten/patch-ko.json", "data/infra/patch-ko.json"],
  ["`data/vakten/{patch-ko.json,auto-s8-…-u1-ansprak.md}`", "`data/infra/patch-ko.json` + `data/vakten/auto-s8-…-u1-ansprak.md` (runtime)"],
  ["data/vakten/{patch-ko.json,anspråk}", "data/infra/patch-ko.json + anspråk (runtime, data/vakten)"],
];
for (const fil of filer) {
  let text = fs.readFileSync(fil, "utf8");
  for (const [fran, till] of byt) {
    const antal = text.split(fran).length - 1;
    if (antal === 1) {
      text = text.replace(fran, till);
      console.log(`${fil.split("/").pop()}: 1 träff ersatt — ${fran.slice(0, 50)}`);
    } else if (antal > 1) {
      text = text.split(fran).join(till);
      console.log(`${fil.split("/").pop()}: ${antal} träffar ersatta — ${fran.slice(0, 50)}`);
    }
  }
  fs.writeFileSync(fil, text);
}
console.log("KLAR");
