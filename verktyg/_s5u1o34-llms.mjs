#!/usr/bin/env node
// llms ×2 — mönstersträng uppdatering av talkällan mot registret + siffror.json.
// Dynamisk: läser gamla/n nya kursetalen ur registret, quiz/XP ur siffror.json.
// URL:er med siffror i slug röras EJ — mönstret kräver « kurser» efter talet.
import { readFileSync, writeFileSync } from "node:fs";

const NBSP = "\u00a0";
const dc = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
const nyKurser = Object.keys(dc).length;
const siffror = JSON.parse(readFileSync("/home/ak1a/AK1/data/siffror.json", "utf8"));
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);

const filer = [
  { fil: "/home/ak1a/AK1/public/llms.txt", stop: 6 },
  { fil: "/home/ak1a/AK1/public/llms-full.txt", stop: 4 },
];

for (const { fil, stop } of filer) {
  let t = readFileSync(fil, "utf8");
  // gamla kursetalet = det tal som idag följs av « kurser» i VAD-raden
  const m = t.match(/(\d+) kurser i 27 ämnesområden/);
  if (!m) { console.error(`VAKT: ${fil} — hittar inte «N kurser i 27 ämnesområden»`); process.exit(1); }
  const gammalt = m[1];
  const traffar = (t.match(new RegExp(`${gammalt} kurser`, "g")) || []).length;
  if (traffar !== stop) { console.error(`VAKT: ${fil} — ${traffar} «${gammalt} kurser»-träffar, väntat ${stop}`); process.exit(1); }
  t = t.replace(new RegExp(`${gammalt} kurser`, "g"), `${nyKurser} kurser`);
  // quiz + XP med både hårt och vanligt mellanslag — läks mot siffror.json
  const quizTraff = (t.match(new RegExp(`\\d+${NBSP}? ?\\d+ quiz`, "g")) || []).length;
  t = t.replace(new RegExp(`\\d+${NBSP}\\d+ quiz`, "g"), `${fmt(siffror.quiz)} quiz`)
       .replace(/\d+ \d+ quiz/g, `${fmt(siffror.quiz)} quiz`.replace(NBSP, " "));
  const xpTraff = (t.match(new RegExp(`\\d+${NBSP}\\d+ XP`, "g")) || []).length;
  t = t.replace(new RegExp(`\\d+${NBSP}\\d+ XP`, "g"), `${fmt(siffror.quizXp)} XP`);
  writeFileSync(fil, t);
  console.log(`${fil.split("/").pop()}: ${traffar} «${gammalt} kurser»→${nyKurser} · quiz ${quizTraff} st → ${fmt(siffror.quiz)} · XP ${xpTraff} st → ${fmt(siffror.quizXp)}`);
}
console.log("LLMS-REGEN GRÖN");
