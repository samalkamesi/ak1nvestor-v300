// R113: vad spärrar prod-trädet? (status via node-kanalen)
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

let ut = "";
try {
  ut = execFileSync("git", ["-C", "/home/ak1a/AK1", "status", "--porcelain"], {
    encoding: "utf8",
    timeout: 25_000,
  });
} catch (e) {
  ut = "status FEL: " + String(e).slice(0, 200);
}
writeFileSync("/home/ak1a/agent/ak1/data/vakten/r113-prodstatus.txt", ut || "(rent träd)", "utf8");
console.log(ut ? ut.split("\n").length - 1 + " rader smutsiga" : "rent träd");
