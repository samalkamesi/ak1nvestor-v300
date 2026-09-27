#!/usr/bin/env node
/** _r224-u28-sond.mjs — kollisionskontroll Diageo/Reckitt/Sage + UK-cellers 1-grenar (rond 224). */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
console.log("total: " + u.length);
const traf = u.filter((b) => ["DGE.L", "DGE", "DEO", "RKT.L", "RKT", "RBGLY", "SGE.L", "SGE", "SGEYY"].includes(b.ticker) || /diageo|reckitt|sage group/i.test(b.namn ?? ""));
console.log(traf.length ? "TRAFF: " + traf.map((b) => b.ticker + " (" + (b.namn ?? "").slice(0, 32) + " · " + b.land + "/" + b.bransch + ")").join(", ") : "DGE/RKT/SGE: INGEN KOLLISION");
const ukKonsument = u.filter((b) => b.land === "Storbritannien" && b.bransch === "konsument").map((b) => b.ticker);
const ukTeknik = u.filter((b) => b.land === "Storbritannien" && b.bransch === "teknik").map((b) => b.ticker);
console.log("UK/konsument: " + ukKonsument.join(", ") + " | UK/teknik: " + ukTeknik.join(", "));
const ulvr = u.find((b) => b.ticker === "ULVR.L");
if (ulvr) console.log("ULVR.L: valuta " + ulvr.valuta + " · pris " + ulvr.pris + " · mcap " + ulvr.marknadsKapitalMdr + " · P/E " + ulvr.vardering?.pe);
const arm = u.find((b) => b.ticker === "ARM");
if (arm) console.log("ARM: land " + arm.land + " · valuta " + arm.valuta + " · notering (100): " + (arm.notering ?? "").slice(0, 100));
// Dryckesbolag i universumet (Diageo-duo-kontrast)
const dryck = u.filter((b) => /diageo|heineken|carlsberg|pernod|anheuser|abi|castel/i.test(b.namn ?? "") || ["CARL-B.CO", "ABI.BR", "RKHB.MI"].includes(b.ticker)).map((b) => b.ticker + "(" + b.land + ")");
console.log("dryckes-referenser: " + (dryck.join(", ") || "inga"));
