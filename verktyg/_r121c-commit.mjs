#!/usr/bin/env node
/** R121-hygien: skuldlista-uppdatering i rondmallen (ENOBUFS kurerat sedan o35). */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const ROT = "/home/ak1a/agent/ak1";
const AR = (f) => execFileSync("git", ["-C", ROT, ...f], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
fs.writeFileSync("/tmp/r121c-msg.txt", "studio: rond 121 hygien [organ:Φ] — rondmallens skuldlista aktuell: mimosa-ENOBUFS KURERAT (o35: full-scan 954/0 + kraschbevis-arkivering; kvar endast äkta eldprov) + granskningskön hänvisad till sammanställningen i stället för fruset antal");
AR(["add", "verktyg/styrelse-rond.mjs", "verktyg/_r121-push.mjs", "verktyg/_r121b-commit.mjs"]);
AR(["commit", "-F", "/tmp/r121c-msg.txt"]);
console.log("commit:", AR(["log", "-1", "--format=%h"]).trim());
fs.rmSync("/tmp/r121c-msg.txt", { force: true });
