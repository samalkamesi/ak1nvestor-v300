/**
 * DIAGNOS (s6-u2c) — varför fångar realekonomi «vad är j-kurvan?» men inte
 * «vad är en j-kurva?»? Listar de exakta kärnorden som träffar, i de lager
 * som sonden rödmarkera (realekonomi + nästa), så att gränserna kan
 * dokumenteras ärligt i modulen.
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

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
function traff(fragaOrd, fragaStr, nyckelord) {
  const nk = diafri(nyckelord);
  if (!nk) return false;
  if (nk.includes(" ")) return fragaStr.includes(nk);
  if (nk.length <= 3) return fragaOrd.includes(nk);
  const max = nk.length <= 7 ? 1 : 2;
  return fragaOrd.some((o) => redigeringstavstand(o, nk) <= max);
}

const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

const FRÅGOR = ["vad är j-kurvan?", "vad är en j-kurva?", "vad är en capital call?", "vad är capital calls?", "hur snabbt får fonden mina pengar tillbaka?"];
const LAGER = [
  { fil: "ai-mentor-realekonomi-fragor.ts", arr: "REALEKONOMI_MONSTER" },
  { fil: "ai-mentor-nasta-fragor.ts", arr: "NASTA_MONSTER" },
];

for (const l of LAGER) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + l.fil)).href);
  const monsters = modul[l.arr];
  if (!monsters) { console.log `(ARRAY SAKNAS ${l.arr})`; continue; }
  for (const f of FRÅGOR) {
    const fragaStr = diafri(f);
    const fragaOrd = fragaStr.split(" ");
    for (const m of monsters) {
      const traffar = (m.karnord || []).filter((nk) => traff(fragaOrd, fragaStr, nk));
      if (traffar.length > 0) {
        console.log(`«${f}» ← ${l.fil} monster "${m.id}" kärnord: ${JSON.stringify(traffar)}`);
      }
    }
  }
}
// Även: finns "kurva"/"kurvan"/"j kurvan" som kärnord NÅGONSTANS i hela kedjan?
import { readdirSync, readFileSync } from "node:fs";
const filer = readdirSync(join(ROT, "src/lib")).filter((f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts"));
for (const fil of filer) {
  const txt = readFileSync(join(ROT, "src/lib", fil), "utf8");
  const karn = [...txt.matchAll(/"(j[- ]?kurv\w*|kurvan|kurva|kurvor|capital calls?|atagna kapitalet|ataget kapital)"/gi)];
  if (karn.length > 0) console.log(`${fil}: kärnordskandidater ${[...new Set(karn.map((k) => k[1]))].join(", ")}`);
}
