#!/usr/bin/env node
// _s2u1o30-append.mjs — AUTO-S2 omgång 30 u1: kirurgisk append av INPEX
// 1605.T i data/portfolj-system/bolagsunivers.json (diskens faktiska läge,
// idempotent). Mütx via mkdir (omg29-u3:s clobber-läxa: läs-modifiera-skriv
// under lås). Prefix-garanti: gamla rader innehållsidentiska efter
// stringify-round-trip (indent 2). Skriver ENDAST om alla grindar gröna.
import { readFileSync, writeFileSync, mkdirSync, rmdirSync, existsSync } from "node:fs";
import { RAAD } from "./_s2u1o30-inpex-rad.mjs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const LAS = "/tmp/s2u1o30-universum.lock";

for (let i = 0; i < 60; i++) {
  try { mkdirSync(LAS); break; }
  catch { if (i === 59) { console.error("ABORT: universumlåset upptaget 60 s"); process.exit(1); } }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
}
try {
  const fore = readFileSync(FIL, "utf8");
  const gamla = JSON.parse(fore);
  console.log("Disk före:", gamla.length, "rader");

  const dublett = gamla.filter((b) => b.ticker === RAAD.ticker || (b.namn ?? "").toLowerCase() === RAAD.namn.toLowerCase());
  if (dublett.length) {
    console.log("IDEMPOTENT: INPEX redan på disk (" + dublett.map((b) => b.hamtat).join(",") + ") — kontrollerar innehållsmatch");
    const disk = JSON.parse(JSON.stringify(dublett[0]));
    const ny = JSON.parse(JSON.stringify(RAAD));
    console.log(JSON.stringify(disk) === JSON.stringify(ny) ? "IDENTISK rad — exit 0" : "AVVIKANDE rad — manuell granskning krävs");
    process.exit(JSON.stringify(disk) === JSON.stringify(ny) ? 0 : 1);
  }
  // omg29-koordinater ska fortfarande vara frånvarande (deras leverans är förlorad — dataägarärende)
  const omg29 = gamla.filter((b) => ["6861.T", "PDD", "JD", "066570.KS", "009150.KS", "042700.KS"].includes(b.ticker));
  console.log("Omg29-koordinater på disk:", omg29.length, "(förväntat 0 — deras leverans förlorad ur trädet)");

  const nya = [...gamla, RAAD];
  const efter = JSON.stringify(nya, null, 2) + "\n";
  // prefix-identitet: gamla rader oförändrade
  const kontroll = JSON.parse(efter);
  for (let i = 0; i < gamla.length; i++) {
    if (JSON.stringify(kontroll[i]) !== JSON.stringify(gamla[i])) { console.error("ABORT: prefix-identitet bruten vid rad " + i); process.exit(1); }
  }
  if (kontroll.length !== gamla.length + 1) { console.error("ABORT: längd"); process.exit(1); }
  writeFileSync(FIL, efter);
  const lasTillbaka = JSON.parse(readFileSync(FIL, "utf8"));
  console.log("APPEND GRÖN:", gamla.length, "→", lasTillbaka.length, "| sista rad:", lasTillbaka[lasTillbaka.length - 1].ticker, "| Japan/energi:", lasTillbaka.filter((b) => b.land === "Japan" && b.bransch === "energi").length);
} finally {
  if (existsSync(LAS)) rmdirSync(LAS);
}
