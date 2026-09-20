/**
 * Sond omgång 27 (s6-u1, manifest auto-s6-1789912510460): vilka kurser i
 * KURSREGISTER är fortfarande mentorväglösa (slug:n förekommer i INGEN
 * frågemoduls text) — och vilka kategorier har flest lösa kurser?
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const LIB = join(ROT, "src/lib");

const regText = readFileSync(join(LIB, "ai-mentor-register.ts"), "utf8");
const slugRader = [...regText.matchAll(/^\s*\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)"/gm)];
const register = slugRader.map((m) => ({ slug: m[1], titel: m[2], kategori: m[3] }));

const fragorFiler = readdirSync(LIB).filter((f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts"));
fragorFiler.push("ai-mentor-svar.ts");
let allt = "";
for (const f of fragorFiler) allt += readFileSync(join(LIB, f), "utf8");

const mentorlosa = register.filter((r) => !allt.includes('"' + r.slug + '"') && !allt.includes("'" + r.slug + "'"));
const perKategori = {};
for (const r of mentorlosa) perKategori[r.kategori] = (perKategori[r.kategori] || 0) + 1;

console.log("Register: " + register.length + " kurser");
console.log("Frågemoduler genomsökta: " + fragorFiler.length);
console.log("Mentorväglösa: " + mentorlosa.length);
console.log("\nPer kategori (flest först):");
for (const [k, n] of Object.entries(perKategori).sort((a, b) => b[1] - a[1])) console.log("  " + String(n).padStart(3) + "  " + k);
console.log("\nAlla mentorväglösa:");
for (const r of mentorlosa) console.log("  " + r.slug.padEnd(44) + " [" + r.kategori + "]  " + r.titel);
