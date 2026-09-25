#!/usr/bin/env node
/** _r209-u13-muv2koll.mjs — kollisionskontroll MUV2.DE (node-kanal). */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
console.log("MUV2-koll: " + (u.some((b) => b.ticker === "MUV2.DE" || /munich re/i.test(b.namn ?? "")) ? "UPPTAGEN" : "LEDIG"));
