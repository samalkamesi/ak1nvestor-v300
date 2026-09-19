/**
 * SOND omgång 23, s6-u3 — STARTSWEEP: vilka kurser i KURSREGISTER (446) är
 * fortfarande MENTORVÄGLÖSA i dagens 50-motorläge?
 *
 * Metod: kedjan laddas LIVE ur chat-widget.tsx (importrader + ??-raden), alla
 * monsters byggs mot registret och deras kursförankring samlas in:
 *   • kalla.slug (källmärke)
 *   • kallor[].slug (flerkällsrad)
 *   • fordjupa.lank (/kurser/…)
 *   • handlings[].lank (/kurser/…)
 * En kurs räknas NÅDD om minst en av ovan pekar på den. Resterande = fria.
 * Grupperat per kategori för att hitta nästa lämpliga block.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = { svaraLokalt: "ai-mentor-svar.ts" }; // basen: { svaraLokalt, fallbackSvar }
for (const m of widgetKalla.matchAll(/import \{ (svaraLokalt\w+)(?:, )?(svaraLokalt\w+)? \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  if (m[1]) FN_TILL_FIL[m[1]] = m[3] + ".ts";
  if (m[2]) FN_TILL_FIL[m[2]] = m[3] + ".ts";
}
const rad = widgetKalla.match(/const lokalt = ([^;]+);/);
const fns = [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]);

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);

const MOTORER = [];
let monsterAntal = 0;
for (const fn of fns) {
  const fil = FN_TILL_FIL[fn];
  if (!fil) { console.log("VARNING: " + fn + " utan importrad"); continue; }
  const m = await import(pathToFileURL(join(ROT, "src/lib/" + fil)).href);
  const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
  MOTORER.push({ namn: fn.replace("svaraLokalt", "").toLowerCase() || "bas", fnk: m[fn], monster: arrNamn ? m[arrNamn] : [] });
  if (arrNamn) monsterAntal += m[arrNamn].length;
}
console.log("Kedja LIVE: " + MOTORER.length + " motorer · " + monsterAntal + " monsters · registret " + KURSREGISTER.length + " kurser");

// Bygg ALLA monsters mot registret och samla kursförankringen.
const nadd = new Set();
for (const m of MOTORER) {
  for (const mo of m.monster) {
    const svar = mo.bygga(KURSREGISTER);
    if (svar.kalla?.slug) nadd.add(svar.kalla.slug);
    for (const k of svar.kallor ?? []) if (k.slug) nadd.add(k.slug);
    if (svar.fordjupa?.lank?.startsWith("/kurser/")) nadd.add(svar.fordjupa.lank.slice("/kurser/".length));
    for (const h of svar.handlings ?? []) if (h.lank?.startsWith("/kurser/")) nadd.add(h.lank.slice("/kurser/".length));
  }
}
console.log("Nådda kurser: " + nadd.size + " av " + KURSREGISTER.length);

// Fria kurser per kategori
const fria = KURSREGISTER.filter((r) => !nadd.has(r.slug));
const perKat = {};
for (const r of fria) (perKat[r.kategori] ??= []).push(r);
console.log("\n── MENTORVÄGLÖSA KURSER PER KATEGORI (" + fria.length + " fria):");
for (const [kat, rs] of Object.entries(perKat).sort((a, b) => b[1].length - a[1].length)) {
  console.log("\n" + kat + " — " + rs.length + " fria:");
  for (const r of rs) console.log("   " + r.slug + " · " + r.titel + (r.variabel ? " · " + r.variabel : ""));
}
