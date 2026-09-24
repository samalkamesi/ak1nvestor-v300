/**
 * SOND s6-u2 omgång 35 (manifest auto-s6-1790245511290) — TILLVÄXT-
 * stängningen tx-06/tx-07: kärnordsdisjunktion + kanonisk frågeägar-test
 * mot den LEVANDE kedjan (motorlistan läses ur kedjetestets MOTORDEFS).
 *
 * Kör: node verktyg/_s6u2o35-sond.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// Motorlistan LIVE ur kedjetestet (framtidsäker när syskonen wirear).
const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const MOTORDEFS = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

// Samtliga kärnord per lager (även monster utanför MOTORDEFS - full filsökning).
const { readdirSync } = await import("node:fs");
const filer = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
const lagerKarnord = new Map(); // fil -> Set<normaliserat kärnord>
function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
for (const fil of filer) {
  const kall = readFileSync(join(ROT, "src/lib", fil), "utf8");
  const ord = new Set();
  // kärnordsblock: första arrayen efter "karnord: [" i varje monster
  for (const m of kall.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
    for (const o of m[1].matchAll(/"([^"]+)"/g)) ord.add(normalisera(o[1]));
  }
  lagerKarnord.set(fil, ord);
}
const totaltKarnord = [...lagerKarnord.values()].reduce((s, x) => s + x.size, 0);

// Kandidat-kärnord för de två nya monstren.
const KANDIDATER_ENHET = [
  "enhetsekonomin", "enhetsekonomi", "enhetsekonomins",
  "kundanskaffningskostnad", "kundanskaffningskostnaden", "värvningskostnad", "värvningskostnaden",
  "livstidsvärdet", "livstidsvärde", "kundlivslängden", "kundlivslängd",
  "kundbortfall", "bortfallet", "bortfallsprocent", "årsbortfall",
  "återbetalningstiden", "återbetalningstid", "payback",
  "kassatrappan", "jämviktsstock", "jämviktsstocken",
  "månadsintäkt", "månadsintäkten", "per kund", "per-kund",
  "kohort", "kohorten", "kohorter",
  "ersättningsmaskin", "ersättningsmaskinen",
  "ltv inflationen", "bortfalsförnekelsen", "payback blindheten",
  "marginalanskaffning", "nästa kund", "nästa kunden",
  "CAC", "LTV", "churn", "ARPU",
];
const KANDIDATER_CONV = [
  "konverteringsgraden", "konverteringsgrad", "kassaflödeskonvertering", "konverteringstestet",
  "tullkvot", "tullkvoten", "tullen", "tillväxtens tull",
  "driftkassan", "driftkassa",
  "betalningstiden", "betalningstid",
  "lagertiden", "leverantörstiden", "leverantörstid",
  "äkta tull", "slirande kvalitet",
  "intäktsraden", "kassaraden",
  "tullens andel",
];

function tav(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (!n || !m) return Math.max(n, m);
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
// Motorns matchningssemantik: korta (≤3) exakt, 4–7 tål 1, längre 2 (enkelord);
// flerordsfraser = substring.
function kolvisioner(kand) {
  const nk = normalisera(kand);
  const traffar = [];
  for (const [fil, ord] of lagerKarnord) {
    for (const o of ord) {
      let kol = false;
      if (nk.includes(" ") || o.includes(" ")) {
        kol = o.includes(nk) || nk.includes(o);
      } else if (nk.length <= 3 || o.length <= 3) {
        kol = o === nk;
      } else {
        const max = Math.min(nk.length, o.length) <= 7 ? 1 : 2;
        kol = tav(o, nk) <= max;
      }
      if (kol) traffar.push(fil + " «" + o + "»");
    }
  }
  return traffar;
}

console.log("== SOND s6-u2 omgång 35 — kärnordsdisjunktion ==");
console.log("Lager: " + lagerKarnord.size + " filer · " + totaltKarnord + " kärnord LIVE");
console.log();
console.log("-- Monster 1: ENHETSEKONOMIN (tx-06) --");
for (const k of KANDIDATER_ENHET) {
  const t = kolvisioner(k);
  console.log((t.length ? "KOLLISION " : "RENT      ") + " «" + k + "»" + (t.length ? " → " + t.join(" | ") : ""));
}
console.log();
console.log("-- Monster 2: KONVERTERINGSTESTET (tx-07) --");
for (const k of KANDIDATER_CONV) {
  const t = kolvisioner(k);
  console.log((t.length ? "KOLLISION " : "RENT      ") + " «" + k + "»" + (t.length ? " → " + t.join(" | ") : ""));
}

// Kanoniska frågor genom den LEVANDE kedjan (import av varje modul i MOTORDEFS-ordning).
console.log();
console.log("== Kanoniska frågor genom levande kedjan (" + MOTORDEFS.length + " motorer) ==");
const KANONISKA = [
  "Vad är enhetsekonomin?",
  "Hur räknar man livstidsvärdet?",
  "Vad är CAC?",
  "Vad är LTV?",
  "Vad är churn?",
  "Vad är payback?",
  "Vad är kassatrappan?",
  "Vad är konverteringsgraden?",
  "Vad är konverteringstestet?",
  "Vad är tullkvoten?",
  "Vad är driftkassan?",
  "Betalningstiden — vad säger den?",
];
const moduler = [];
for (const d of MOTORDEFS) {
  try {
    const mod = await import(pathToFileURL(join(ROT, "src/lib", d.fil)).href);
    if (typeof mod[d.fn] === "function") moduler.push({ ...d, fn: mod[d.fn] });
  } catch (e) {
    console.log("  (importfel " + d.namn + ": " + e.message + ")");
  }
}
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
for (const f of KANONISKA) {
  const agare = [];
  for (const m of moduler) {
    try { if (m.fn(f, KURSREGISTER)) agare.push(m.namn); } catch {}
  }
  console.log("«" + f + "» → " + (agare.length ? agare.join(", ") : "NULL (fritt)"));
}
console.log();
console.log("TOTALT: " + MOTORDEFS.length + " motorer · " + MOTORDEFS.reduce((s, d) => s + d.antal, 0) + " monsters i MOTORDEFS");
