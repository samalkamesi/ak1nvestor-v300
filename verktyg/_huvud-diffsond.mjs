// Diff-sond: vad ändrades i de 22 befintliga analyserna?
import { execFileSync } from "node:child_process";
const d = execFileSync(
  "git",
  ["-C", "/home/ak1a/agent/ak1", "diff", "--", "data/forskningsbiblioteket/MSFT.json"],
  { encoding: "utf8", timeout: 60_000 },
);
const rader = d.split("\n");
console.log(rader.slice(0, 70).join("\n"));
console.log("... totalt", rader.length, "diff-rader för MSFT.json");
