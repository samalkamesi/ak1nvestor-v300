#!/usr/bin/env node
// _v229-sond.mjs — rond v229: eftermät deployens avgörande + nginx-läget
// (node-kanalen: skalets git/curl-kedjor hänger, detta är den bevisade vägen)
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import https from "node:https";

const VAKT = "/home/ak1a/agent/ak1/data/vakten";
const PROD = "/home/ak1a/AK1";
const WS = "/home/ak1a/agent/ak1";

function svans(fil, n) {
  try {
    const rader = fs.readFileSync(fil, "utf8").trimEnd().split("\n");
    return rader.slice(-n).join("\n");
  } catch (e) {
    return `(kunde inte läsa ${fil}: ${e.message})`;
  }
}

function git(katalog, arg) {
  try {
    return execFileSync("git", ["-C", katalog, ...arg], { encoding: "utf8", timeout: 15000 }).trim();
  } catch (e) {
    return `(git fel i ${katalog}: ${e.message.split("\n")[0]})`;
  }
}

function nginxProcesser() {
  try {
    const ut = execFileSync("ps", ["-eo", "pid,etimes,cmd"], { encoding: "utf8", timeout: 10000 });
    return ut.split("\n").filter((r) => /\bnginx\b/.test(r)).map((r) => r.trim());
  } catch (e) {
    return [`(ps fel: ${e.message.split("\n")[0]})`];
  }
}

function httpsKoll() {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.request(
      { hostname: "lab.ak1nvestor.com", path: "/", method: "GET", timeout: 10000, headers: { "User-Agent": "v229-sond" } },
      (res) => {
        let data = "";
        res.on("data", (c) => { data += c; });
        res.on("end", () => resolve(`HTTPS ${res.statusCode} · ${Date.now() - start} ms · AK1A-innehåll: ${data.includes("AK1A") ? "JA" : "NEJ"} (${data.length} B)`));
      }
    );
    req.on("error", (e) => resolve(`HTTPS FEL: ${e.message}`));
    req.on("timeout", () => { req.destroy(); resolve("HTTPS TIMEOUT 10 s"); });
    req.end();
  });
}

console.log("══ V229-SOND — " + new Date().toISOString() + " ══\n");

console.log("── PROD-TRÄDET (/home/ak1a/AK1) ──");
console.log("HEAD:", git(PROD, ["rev-parse", "--short", "HEAD"]));
console.log("log -6:\n" + git(PROD, ["log", "--oneline", "-6"]));
console.log("status (första 10):\n" + (git(PROD, ["status", "--short"]) || "(ren)") .split("\n").slice(0, 10).join("\n"));

console.log("\n── ARBETSYTAN ──");
console.log("HEAD:", git(WS, ["rev-parse", "--short", "HEAD"]));
console.log("status (första 10):\n" + (git(WS, ["status", "--short"]) || "(ren)").split("\n").slice(0, 10).join("\n"));
console.log("prod är anfader till arbetsyta:", git(WS, ["merge-base", "--is-ancestor", git(PROD, ["rev-parse", "HEAD"]).split("\n")[0], "HEAD"]) === "" ? "kontroll…" : "");
try {
  execFileSync("git", ["-C", WS, "merge-base", "--is-ancestor", git(PROD, ["rev-parse", "HEAD"]), "HEAD"], { timeout: 15000 });
  console.log("prod-HEAD är anfader till arbetsytans HEAD: JA (arbetsytan ⊇ prod)");
} catch {
  console.log("prod-HEAD är anfader till arbetsytans HEAD: NEJ (prod bär okända commits)");
}
try {
  execFileSync("git", ["-C", WS, "merge-base", "--is-ancestor", git(WS, ["rev-parse", "HEAD"]), git(PROD, ["rev-parse", "HEAD"])], { timeout: 15000 });
  console.log("arbetsytans HEAD är anfader till prod-HEAD: JA (allt lokalt landat i prod)");
} catch {
  console.log("arbetsytans HEAD är anfader till prod-HEAD: NEJ (lokala commits väntar push)");
}

console.log("\n── NGINX ──");
const np = nginxProcesser();
console.log(np.length ? np.join("\n") : "INGA nginx-processer");
console.log("error.log-storlek:", fs.statSync("/var/log/nginx/error.log").size, "B");
console.log("access.log svans:", svans("/var/log/nginx/access.log", 3));

console.log("\n── HTTPS ──");
console.log(await httpsKoll());

console.log("\n── PROD-SYNK.LOG (sista 70) ──");
console.log(svans(VAKT + "/prod-synk.log", 70));
