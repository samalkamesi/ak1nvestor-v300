#!/usr/bin/env node
// Registersynk för s5-u2 o29: VM-12 + UD-10 → public/deep-courses.json
// Insert med serieordning (efter senaste familjemedlemmen). Idempotent vakt.
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/public/deep-courses.json";
const dc = JSON.parse(readFileSync(FIL, "utf8"));
const slugs = Object.keys(dc);
console.log("register före:", slugs.length);

if ("vm-12-reverserad-dcf" in dc || "ud-10-ex-dagens-mekanik" in dc) {
  console.error("VAKT: kurs/kurser redan i registret — avbryter (idempotens).");
  process.exit(1);
}

const vm12 = JSON.parse(readFileSync("/home/ak1a/AK1/data/kurser-tillagg/vm-12-reverserad-dcf.json", "utf8"));
const ud10 = JSON.parse(readFileSync("/home/ak1a/AK1/data/kurser-tillagg/ud-10-ex-dagens-mekanik.json", "utf8"));

// Kontroll: källa == det som stoppas in (round-trip-grund)
if (vm12.slug !== "vm-12-reverserad-dcf" || ud10.slug !== "ud-10-ex-dagens-mekanik") {
  console.error("VAKT: slug-fel i källfiler — avbryter.");
  process.exit(1);
}

const ut = {};
let insattVm = 0, insattUd = 0;
for (const s of slugs) {
  ut[s] = dc[s];
  if (s === "vm-11-waccfallor") { ut["vm-12-reverserad-dcf"] = vm12; insattVm = 1; }
  if (s === "ud-09-utdelningens-hallbarhet") { ut["ud-10-ex-dagens-mekanik"] = ud10; insattUd = 1; }
}
if (!insattVm || !insattUd) {
  console.error("VAKT: granne saknas (vm-11/ud-09) — avbryter, inget skrivet.");
  process.exit(1);
}

const nya = Object.keys(ut);
console.log("register efter:", nya.length, "(| vm-11@", nya.indexOf("vm-11-waccfallor"), "< vm-12@", nya.indexOf("vm-12-reverserad-dcf"),
  "| ud-09@", nya.indexOf("ud-09-utdelningens-hallbarhet"), "< ud-10@", nya.indexOf("ud-10-ex-dagens-mekanik"), ")");

// Round-trip: parse tillbaka och jämför bitidentiskt med källfilerna
writeFileSync(FIL, JSON.stringify(ut, null, 2) + "\n");
const rt = JSON.parse(readFileSync(FIL, "utf8"));
const okVm = JSON.stringify(rt["vm-12-reverserad-dcf"]) === JSON.stringify(vm12);
const okUd = JSON.stringify(rt["ud-10-ex-dagens-mekanik"]) === JSON.stringify(ud10);
console.log("round-trip: vm-12 bitidentisk:", okVm, "| ud-10 bitidentisk:", okUd);
if (!okVm || !okUd) { console.error("VAKT: round-trip bruten — avbryter."); process.exit(1); }
console.log("SYNK GRÖN: register", slugs.length, "→", nya.length);
