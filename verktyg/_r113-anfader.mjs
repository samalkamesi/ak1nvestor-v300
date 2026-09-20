// R113: verifiera att R113-committen är anfader i prod/develop.
import { execFileSync } from "node:child_process";

try {
  const lokal = execFileSync("git", ["-C", "/home/ak1a/agent/ak1", "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const prod = execFileSync("git", ["-C", "/home/ak1a/AK1", "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const arAnfader = execFileSync(
    "git",
    ["-C", "/home/ak1a/AK1", "merge-base", "--is-ancestor", lokal, prod],
    { encoding: "utf8", stdio: "pipe" },
  ).exitCode;
  console.log("lokal HEAD:", lokal.slice(0, 8));
  console.log("prod  HEAD:", prod.slice(0, 8));
} catch (e) {
  console.log("sond:", String(e.status !== undefined ? "is-ancestor exit " + e.status : e).slice(0, 120));
}
