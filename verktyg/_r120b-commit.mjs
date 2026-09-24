#!/usr/bin/env node
/** R120-tilläggscommit: PIPELINE-KO-bokningen + r120-wrapperna (bevis-konvention). */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const ROT = "/home/ak1a/agent/ak1";
const AR = (f) => execFileSync("git", ["-C", ROT, ...f], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

fs.writeFileSync("/tmp/r120b-msg.txt", "studio: rond 120 tillägg [organ:Φ] — PIPELINE-KO ≥3 vågar bokade (V232 TUNG-slutbokföring · V233 prestanda-omkörning · V234 DR-färskhetsprov — spårrotation 8/7/10) + r120-wrappers (push-väntare + fabriksonder) som bevis-konvention");
AR(["add", "data/forskning/PIPELINE-KO.md", "verktyg/_r120-boka.mjs", "verktyg/_r120-push.mjs", "verktyg/_r120-sond.mjs", "verktyg/_r120-sond2.mjs", "verktyg/_r120-launch.mjs"]);
AR(["commit", "-F", "/tmp/r120b-msg.txt"]);
console.log("commit:", AR(["log", "-1", "--format=%h %s"]).slice(0, 120));
fs.rmSync("/tmp/r120b-msg.txt", { force: true });
