// ROND 112: git-diff av den smutsiga motorrapporten (transporten hänger på
// git direkt — node-kanalen). Skriver diff till data/vakten/r112-motordiff.txt.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const ROTA = "/home/ak1a/agent/ak1";
let ut = "";
try {
  ut = execFileSync("git", ["-C", ROTA, "diff", "--stat"], { encoding: "utf8", timeout: 25_000 });
} catch (e) {
  ut = "diff --stat FEL: " + String(e).slice(0, 200);
}
ut += "\n─── DIFF (motorervalidering, första 120 raderna) ───\n";
try {
  ut += execFileSync("git", ["-C", ROTA, "diff", "--", "data/rapporter/motorervalidering-2026-09-02.md"], {
    encoding: "utf8",
    timeout: 25_000,
    maxBuffer: 8 * 1024 * 1024,
  })
    .split("\n")
    .slice(0, 120)
    .join("\n");
} catch (e) {
  ut += "diff FEL: " + String(e).slice(0, 200);
}
writeFileSync(`${ROTA}/data/vakten/r112-motordiff.txt`, ut, "utf8");
console.log("diff skriven,", ut.length, "tecken");
