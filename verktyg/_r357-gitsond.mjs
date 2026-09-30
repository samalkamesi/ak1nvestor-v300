// Sond: git-läge i arbetsytan (r357) — kollar tracked-status för labb-filerna
// och om träd/yta är ren. Städas efter bruk.
import { execFileSync } from "node:child_process";

const kör = (args) =>
  execFileSync("git", ["-C", "/home/ak1a/agent/ak1", ...args], {
    encoding: "utf8",
    timeout: 60_000,
  });

console.log("== HEAD ==");
console.log(kör(["log", "-1", "--format=%h %ci"]));

console.log("== tracked? ==");
const tracked = kör(["ls-files", "data/forskning/labb", "verktyg/_r355b-labb.mjs"]);
console.log(tracked === "" ? "(inga av filerna är tracked)" : tracked);

console.log("== status --porcelain ( hela trädet ) ==");
try {
  const status = kör(["status", "--porcelain"]);
  console.log(status === "" ? "(ytan är REN)" : status);
} catch (e) {
  console.log("status-fel:", e.message);
}
