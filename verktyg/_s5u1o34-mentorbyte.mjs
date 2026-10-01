#!/usr/bin/env node
// _s5u3o33-mentorbyte.mjs — byt KURSREGISTER-arrayen i src/lib/ai-mentor-register.ts
// mot färska baken-rader (/tmp/s5u1o34-mentor-bake.txt). Idempotent
// strukturbyte: från tilldelningens [= till första ]; efter den.
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/src/lib/ai-mentor-register.ts";
const BAKE = "/tmp/s5u1o34-mentor-bake.txt";

const src = readFileSync(FIL, "utf8");
const rader = readFileSync(BAKE, "utf8").trimEnd().split("\n");
console.log("baken:", rader.length, "rader");

const START = "export const KURSREGISTER: RegisterRad[]";
const iStart = src.indexOf(START);
if (iStart < 0) throw new Error("startdeklaration saknas");
const iOpen = src.indexOf("= [", iStart);
if (iOpen < 0) throw new Error("tilldelningens hakparantes saknas");
const iLeft = iOpen + 2; // index FÖR '[' (slutet av "= [") — +1 klipper bort hakparantesen
const iSlut = src.indexOf("];", iLeft);
if (iSlut < 0) throw new Error("arrayslut saknas");

const ny = src.slice(0, iLeft + 1) + "\n" + rader.join("\n") + "\n" + src.slice(iSlut);
writeFileSync(FIL, ny);
const koll = readFileSync(FIL, "utf8");
const antal = (koll.match(/^\s*\{ slug: "/gm) || []).length;
console.log("registerbyte klart — slug-rader i filen:", antal);
if (antal !== rader.length) { console.error("VAKT: antal stämmer ej"); process.exit(1); }
console.log("GRÖN");
