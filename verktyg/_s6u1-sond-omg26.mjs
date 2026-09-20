/**
 * SOND ROND 1 (omgång 26, s6-u1) — mentorväglösa kurser genom LIVE-genomkörning.
 *
 * Otrackat diskbevis (fabrikskonventionen): kör alla 62 motorers samtliga
 * monsters bygga(KURSREGISTER) och samla alla kurs-slugs som når användaren
 * (källor + handlingslänkar + fördjupa). Mentorväglös = aldrig nämnd i något
 * svar. MOTORDEFS läses ur verktyg/testa-ai-mentor-kedja.mjs (testet kan
 * inte ljuga om sammansättningen).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
// Kolumnuppställda rader (flera mellanslag) + enkelstegs-rader — \s+ täcker båda.
const MOTORDEFS = [...kedjekalla.matchAll(
  /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
)].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

const nadda = new Set();
let monsterTotal = 0;
for (const d of MOTORDEFS) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  const monster = modul[d.arr];
  if (!Array.isArray(monster)) { console.error("FEL arr " + d.arr); process.exit(1); }
  if (monster.length !== d.antal) {
    console.error(`FEL antal ${d.namn}: MOTORDEFS ${d.antal} != verklighet ${monster.length}`);
    process.exit(1);
  }
  monsterTotal += monster.length;
  for (const m of monster) {
    const svar = m.bygga(KURSREGISTER);
    for (const k of svar.kallor ?? []) if (k.slug) nadda.add(k.slug);
    for (const h of svar.handlings ?? []) {
      const m2 = h.lank.match(/^\/kurser\/(.+)$/);
      if (m2) nadda.add(m2[1]);
    }
    const f = svar.fordjupa?.lank?.match(/^\/kurser\/(.+)$/);
    if (f) nadda.add(f[1]);
  }
}

const losa = KURSREGISTER.filter((r) => !nadda.has(r.slug));
console.log(`Motorer: ${MOTORDEFS.length} · monsters: ${monsterTotal} · register: ${KURSREGISTER.length}`);
console.log(`Nådda: ${KURSREGISTER.length - losa.length} · MENTORVÄGLÖSA: ${losa.length}\n`);

const perKat = new Map();
for (const r of losa) {
  if (!perKat.has(r.kategori)) perKat.set(r.kategori, []);
  perKat.get(r.kategori).push(r);
}
const sorterade = [...perKat.entries()].sort((a, b) => b[1].length - a[1].length);
for (const [kat, rader] of sorterade) {
  const total = KURSREGISTER.filter((r) => r.kategori === kat).length;
  console.log(`\n== ${kat} — ${rader.length} av ${total} mentorväglösa ==`);
  for (const r of rader) {
    console.log(`  ${r.slug} · ${r.titel} · ${r.kapitel}kap/${r.quiz}quiz/${r.minuter}min · ${r.niva}`);
  }
}
