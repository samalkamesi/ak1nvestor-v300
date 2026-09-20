/**
 * SOND ROND 1 (manifest auto-s6-1789912510460, omgång 27, s6-u2 byggare 2/3,
 * verktygsprefix _s6u2o27-) — välja nästa +2 förhandsfrågor.
 *
 * Samma bevismetod som _s6u3o26-sond.mjs (oprojektspårad provenans):
 *   1. Kedjans motorer LIVE ur verktyg/testa-ai-mentor-kedja.mjs:s
 *      MOTORDEFS (extraherad ur källtexten — kan inte ljuga om läget).
 *   2. Registergenomräkning: vilka kurser nås av något monsters bygga()
 *      (kallor/kalla/handlings/fordjupa) = mentorväg vs mentorväglösa.
 *   3. Kandidat-kärnordsfamiljer NULL-testade mot kedjan med motorns
 *      toleransplan (exakt ≤3 · avstånd ≤1 för 4–7 · ≤2 för >7).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const LIB = join(ROT, "src", "lib");

// ── Motorns matchare (spegling — samma som alla lager) ──────────────────────
function normalisera(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}
function diafri(s) {
  return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
function redigeringstavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
    }
    fore = [...nu];
  }
  return fore[m];
}
function maxFel(len) { return len <= 3 ? 0 : len <= 7 ? 1 : 2; }
function traff(fragaOrd, fragaStr, nyckelord) {
  const nk = diafri(nyckelord);
  if (!nk) return false;
  if (nk.includes(" ")) return fragaStr.includes(nk);
  if (nk.length <= 3) return fragaOrd.includes(nk);
  const max = maxFel(nk.length);
  return fragaOrd.some((o) => redigeringstavstand(o, nk) <= max);
}

// ── Del 0: MOTORDEFS LIVE ur kedjetestets källtext ──────────────────────────
const kedjekalla = readFileSync(join(ROT, "verktyg", "testa-ai-mentor-kedja.mjs"), "utf8");
const snitt = kedjekalla.slice(
  kedjekalla.indexOf("const MOTORDEFS = ["),
  kedjekalla.indexOf("];", kedjekalla.indexOf("const MOTORDEFS = [")) + 2,
);
const MOTORDEFS = eval(snitt + "; MOTORDEFS");
console.log("MOTORER: " + MOTORDEFS.length + " · MONSTERS: " + MOTORDEFS.reduce((s, d) => s + d.antal, 0));

const { KURSREGISTER } = await import(pathToFileURL(join(LIB, "ai-mentor-register.ts")).href);
console.log("REGISTER: " + KURSREGISTER.length + " kurser");

const MOTORER = [];
for (const d of MOTORDEFS) {
  const modul = await import(pathToFileURL(join(LIB, d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn], monster: modul[d.arr] });
}

// ── Del 1: mentorvägar — vilka slugs nås av bygga()? ────────────────────────
const nadda = new Set();
let karnordTotalt = 0;
for (const m of MOTORER) {
  for (const mon of m.monster) {
    karnordTotalt += (mon.karnord?.length ?? 0) + (mon.starkord?.length ?? 0);
    const s = mon.bygga(KURSREGISTER);
    for (const k of s.kallor ?? (s.kalla ? [s.kalla] : [])) if (k.slug) nadda.add(k.slug);
    for (const h of s.handlings ?? []) {
      const mt = h.lank.match(/^\/kurser\/(.+)$/);
      if (mt) nadda.add(mt[1]);
    }
    if (s.fordjupa?.lank?.startsWith("/kurser/")) nadda.add(s.fordjupa.lank.slice("/kurser/".length));
  }
}
const vaglosa = KURSREGISTER.filter((r) => !nadda.has(r.slug));
console.log("MENTORVÄGAR: " + nadda.size + " · MENTORVÄGLÖSA: " + vaglosa.length);
console.log("KÄRNORD+STARKORD i kedjan: " + karnordTotalt);
console.log("\n── Mentorväglösa kurser (kandidater som primärkälla) ──");
for (const r of vaglosa) {
  console.log(`${r.slug}  [${r.kategori}]  ${r.titel}  (${r.niva}${r.minuten ? ", " + r.minuten + " min" : ""})`);
}

// ── Del 2: NULL-test av kandidatfamiljer mot HELA kedjan ────────────────────
function sondFraga(ord) {
  const fraga = "vad är " + ord + "?";
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { fanget: true, motor: m.namn };
  }
  return { fanget: false };
}
function grannar(kandidat) {
  const nk = diafri(kandidat);
  const ut = [];
  if (nk.includes(" ") || nk.length <= 3) {
    for (const m of MOTORER) for (const mon of m.monster) {
      for (const k of mon.karnord ?? []) if (diafri(k).includes(nk) || nk.includes(diafri(k))) ut.push(m.namn + ":" + k);
    }
    return ut;
  }
  const max = maxFel(nk.length);
  for (const m of MOTORER) for (const mon of m.monster) {
    for (const k of mon.karnord ?? []) {
      const kk = diafri(k);
      if (kk.includes(" ")) continue;
      if (Math.abs(kk.length - nk.length) <= max && redigeringstavstand(kk, nk) <= max) ut.push(m.namn + ":" + k + " (d" + redigeringstavstand(kk, nk) + ")");
    }
  }
  return ut;
}

const KANDIDATER = process.argv.slice(2);
if (KANDIDATER.length) {
  console.log("\n── Kandidat-NULL-test (fråga 'vad är <ord>?' + grannkontroll) ──");
  for (const k of KANDIDATER) {
    const res = sondFraga(k);
    const g = grannar(k);
    console.log(`\n'${k}': fråga ${res.fanget ? "FÅNGAD av " + res.motor : "NULL (fri)"} · grannar: ${g.length ? g.join(" · ") : "0"}`);
  }
}
