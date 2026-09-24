/**
 * SOND omgång 24 (s6-u1, manifest auto-s6-1789839901194) — startsweep.
 *
 * Räknar mentorväglösa kurser: slugs i KURSREGISTER som INTE nås av någon
 * motors kalla/kallor/handlings/fordjupa. Motorlistan läses LIVE ur
 * chat-widget.tsx kompositionsrad (som kedjetestets G-fall) — sonden kan
 * inte ljuga om kedjan. Skriver även kärnordsinventarien (diafri) för
 * rond 2:s grannkontroller till data/vakten/_s6u1-sond-omg24-karnord.json.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// Motorerna LIVE ur widgetens kompositionsordning
const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const rad = widget.match(/const lokalt = ([^;]+);/);
if (!rad) { console.error("FEL: kompositionsraden hittades ej"); process.exit(1); }
const fns = [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]);
const fnTillFil = {};
for (const [, namn, fil] of widget.matchAll(/import \{ ([^}]+) \} from "@\/lib\/([^"]+)"/g)) {
  for (const n of namn.split(",")) {
    const v = n.trim();
    if (v.startsWith("svaraLokalt")) fnTillFil[v] = fil;
  }
}

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);

// Normalisering (samma plan som motorn) för kärnordsinventarien
const diafri = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");

const nadda = new Set();
const karnordsEtt = new Map(); // ord → "motor/monster"
const starkordsEtt = new Set();
let motorAntal = 0;
let monsterAntal = 0;

for (const fn of fns) {
  const fil = fnTillFil[fn];
  if (!fil) { console.error("FEL: ingen import för " + fn); process.exit(1); }
  const filTs = fil.endsWith(".ts") ? fil : fil + ".ts";
  const modul = await import(pathToFileURL(join(ROT, "src/lib", filTs)).href);
  motorAntal++;
  const arrNamn = Object.keys(modul).filter((k) => k === "MONSTER" || k.endsWith("_MONSTER"));
  for (const arr of arrNamn) {
    for (const m of modul[arr]) {
      monsterAntal++;
      for (const k of m.karnord ?? []) karnordsEtt.set(diafri(k), fn.replace("svaraLokalt", "").toLowerCase() + "/" + m.id);
      for (const k of m.starkord ?? []) starkordsEtt.add(diafri(k));
      const s = m.bygga(KURSREGISTER);
      if (s.kalla?.slug) nadda.add(s.kalla.slug);
      for (const k of s.kallor ?? []) if (k.slug) nadda.add(k.slug);
      for (const h of s.handlings ?? []) {
        if (h.lank.startsWith("/kurser/")) nadda.add(h.lank.replace("/kurser/", ""));
      }
      if (s.fordjupa?.lank?.startsWith("/kurser/")) nadda.add(s.fordjupa.lank.replace("/kurser/", ""));
    }
  }
}

// Mentorväglösa per kategori
const perKat = new Map();
const losa = [];
for (const r of KURSREGISTER) {
  if (!nadda.has(r.slug)) {
    losa.push(r);
    if (!perKat.has(r.kategori)) perKat.set(r.kategori, []);
    perKat.get(r.kategori).push(r);
  }
}

console.log("KEDJAN: " + motorAntal + " motorer / " + monsterAntal + " monsters / " + KURSREGISTER.length + " kurser");
console.log("NÅDDA: " + nadda.size + " slugs · MENTORVÄGLÖSA: " + losa.length + " kurser\n");
for (const [kat, rs] of [...perKat.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log("## " + kat + " — " + rs.length + " mentorväglösa:");
  for (const r of rs) console.log("   " + r.slug + "  ·  " + r.titel + "  ·  " + r.minuter + " min · " + r.niva);
}

// Kärnordsinventarie för rond 2
writeFileSync(
  join(ROT, "data/vakten/_s6u1-sond-omg24-karnord.json"),
  JSON.stringify({ motorAntal, monsterAntal, karnord: [...karnordsEtt.entries()], starkord: [...starkordsEtt] }, null, 1),
);
console.log("\nKärnordsinventarie: " + karnordsEtt.size + " kärnord · " + starkordsEtt.size + " starkord → data/vakten/_s6u1-sond-omg24-karnord.json");
