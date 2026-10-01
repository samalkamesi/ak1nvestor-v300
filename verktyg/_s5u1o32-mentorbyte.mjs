#!/usr/bin/env node
// Byt KURSREGISTER-arrayen i src/lib/ai-mentor-register.ts mot färska baken-rader.
// Idempotent strukturbyte: start efter deklarationsraden, slut vid arrayens ]; .
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/src/lib/ai-mentor-register.ts";
const BAKE = "/home/ak1a/AK1/data/vakten/_s5u1o32-mentor-bake.txt";

const src = readFileSync(FIL, "utf8");
const rader = readFileSync(BAKE, "utf8").trimEnd().split("\n");
console.log("baken:", rader.length, "rader");

const START = "export const KURSREGISTER: RegisterRad[]";
const iStart = src.indexOf(START);
if (iStart < 0) throw new Error("startdeklaration saknas");
const iOpen = src.indexOf("= [", iStart); // tilldelningens hakparantes — inte typens
if (iOpen < 0) throw new Error("tilldelning saknas");
const iLeft = iOpen + 1;
// slutet: första "];" efter arrayöppningen
const iSlut = src.indexOf("];", iLeft);
if (iSlut < 0) throw new Error("arrayslut saknas");

const ny = src.slice(0, iLeft + 1) + "\n" + rader.join("\n") + "\n" + src.slice(iSlut);
writeFileSync(FIL, ny);
const koll = readFileSync(FIL, "utf8");
const antal = (koll.match(/^\s*\{ slug: "/gm) || []).length;
console.log("registerbyte klart — slug-rader i filen:", antal);
if (antal !== rader.length) { console.error("VAKT: antal stämmer ej"); process.exit(1); }
console.log("GRÖN");
