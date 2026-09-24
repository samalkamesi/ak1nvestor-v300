#!/usr/bin/env node
// ROND 112 — beslutsminne-append (körs EFTER landad push; data/vakten/ är
// avsiktligt oversionerat runtime-tillstånd).
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const MINNE = `${ROT}/data/vakten/beslutsminne.jsonl`;

const head = execFileSync("git", ["-C", ROT, "rev-parse", "--short", "HEAD"], {
  encoding: "utf8",
}).trim();
const post = {
  ts: new Date().toISOString(),
  rond: 112,
  beslut:
    "V213(c) stängd: dataset-aspekter-sviten migrerad till ts-import-bryggan — GRÖN under ren node (0 fel/24 aspekter/184 sidkontroller) OCH i fullsvepets egen kedja; fullsvep r112 omstartat fristående (omgång 1 dog tyst med sessionsomstarten — detached-launcher + append-läge)",
  landat: head,
};
fs.appendFileSync(MINNE, JSON.stringify(post) + "\n");
console.log(`beslutsminne appenderat (landat=${head})`);
