#!/usr/bin/env node
import fs from "node:fs";
const f = "/home/ak1a/agent/ak1/data/vakten/beslutsminne.jsonl";
const m = fs.readFileSync(f, "utf8").trim().split("\n");
const s = JSON.parse(m.pop());
if (s.rond === 123 && !s.landat) {
  s.landat = "ja";
  m.push(JSON.stringify(s));
  fs.writeFileSync(f, m.join("\n") + "\n");
  console.log("kvitterad: landat=ja");
} else {
  console.log("läge:", JSON.stringify(s).slice(0, 160));
}
