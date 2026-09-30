// Prod-sond: har pushen landat i prod-trädet + byggts?
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const PROD = "/home/ak1a/AK1";

// 1. Prod-trädets HEAD
const head = execFileSync("git", ["-C", PROD, "log", "-1", "--format=%h %ci"], {
  encoding: "utf8", timeout: 30_000,
});
console.log("PROD HEAD:", head.trim());

// 2. Biblioteksfilerna i prod-trädet
const antal = execFileSync("ls", [PROD + "/data/forskningsbiblioteket"], {
  encoding: "utf8",
}).split("\n").filter((f) => f.endsWith(".json")).length;
console.log("PROD bibliotek:", antal, "filer");

// 3. Bygg-läge: BUILD_ID + pm2-processens ålder
const buildId = existsSync(PROD + "/.next/BUILD_ID")
  ? readFileSync(PROD + "/.next/BUILD_ID", "utf8").trim()
  : "(saknas)";
console.log("BUILD_ID:", buildId);

// 4. Live-sond: listvy + tre NYA detaljsidor + en befintlig
const url = (p) => "https://lab.ak1nvestor.com" + p;
const stat = async (p) => {
  try {
    const r = await fetch(url(p), { redirect: "manual" });
    return r.status;
  } catch (e) {
    return "FEL";
  }
};
console.log("GET /forskningsbiblioteket:", await stat("/forskningsbiblioteket"));
for (const t of ["4503.T", "GSK.L", "EVO.ST"]) {
  console.log(`GET ny detaljsida ${t}:`, await stat("/forskningsbiblioteket/" + encodeURIComponent(t)));
}
console.log("GET befintlig MSFT:", await stat("/forskningsbiblioteket/MSFT"));

// 5. Prod-synkens logg — senaste raderna
for (const kandidat of [
  PROD + "/data/vakten/prod-synk.log",
  "/home/ak1a/agent/ak1/data/vakten/prod-synk.log",
]) {
  if (existsSync(kandidat)) {
    const rader = readFileSync(kandidat, "utf8").trim().split("\n");
    console.log("prod-synk.log (" + kandidat + ") sista 5:");
    rader.slice(-5).forEach((r) => console.log("  ", r.slice(0, 160)));
    break;
  }
}
