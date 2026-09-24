/**
 * SOND spår 6 omgång 25 s6-u3 — välja nästa +3 förhandsfrågor.
 * Otrackad provenans (diskbevis). Tre delar:
 *   1. Kedjans kärnord LIVE ur src/ (import av alla MONSTER-arrayer).
 *   2. Registergenomräkning: vilka kurser nås av något monsters bygga()
 *      (kalla/kallor/handlings/fordjupa) = mentorväg vs mentorväglösa.
 *   3. Kandidat-kärnordsfamiljer NULL-testade mot kedjan med motorns
 *      toleransplan (exakt ≤3 · avstånd ≤1 för 4–7 · ≤2 för >7).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

// ── Del 1: kedjans motorer + kärnord LIVE ───────────────────────────────────
// Motorlistan speglar kedjetestets MOTORDEFS (58 motorer, omgång 24-läge +
// våg 189 marknadsmekanik + våg 210 valutamekanik).
const MOTORER = [
  ["makro", "ai-mentor-makro-fragor.ts", "MAKRO_MONSTER"],
  ["extra", "ai-mentor-extra-fragor.ts", "EXTRA_MONSTER"],
  ["bas", "ai-mentor-svar.ts", "MONSTER"],
  ["nästa", "ai-mentor-nasta-fragor.ts", "NASTA_MONSTER"],
  ["kapitalmekanik", "ai-mentor-kapitalmekanik-fragor.ts", "KAPITALMEKANIK_MONSTER"],
  ["sektor", "ai-mentor-sektor-fragor.ts", "SEKTOR_MONSTER"],
  ["case", "ai-mentor-case-fragor.ts", "CASE_MONSTER"],
  ["marknadsmekanik", "ai-mentor-marknadsmekanik-fragor.ts", "MARKNADSMEKANIK_MONSTER"],
  ["praktik", "ai-mentor-praktik-fragor.ts", "PRAKTIK_MONSTER"],
  ["valutamekanik", "ai-mentor-valutamekanik-fragor.ts", "VALUTAMEKANIK_MONSTER"],
  ["portföljgrund", "ai-mentor-portfoljgrund-fragor.ts", "PORTFOLJGRUND_MONSTER"],
  ["ägande", "ai-mentor-agande-fragor.ts", "AGANDE_MONSTER"],
  ["redovisningsdjup", "ai-mentor-redovisningsdjup-fragor.ts", "REDOVISNINGSDJUP_MONSTER"],
  ["djup", "ai-mentor-djup-fragor.ts", "DJUP_MONSTER"],
  ["historia", "ai-mentor-historia-fragor.ts", "HISTORIA_MONSTER"],
  ["lonsamhetsdjup", "ai-mentor-lonsamhetsdjup-fragor.ts", "LONSAMHETSDJUP_MONSTER"],
  ["tsdjup", "ai-mentor-tsdjup-fragor.ts", "TSDJUP_MONSTER"],
  ["skattedjup", "ai-mentor-skattedjup-fragor.ts", "SKATTEDJUP_MONSTER"],
  ["beteendedjup", "ai-mentor-beteendedjup-fragor.ts", "BETEENDEDJUP_MONSTER"],
  ["riskdjup", "ai-mentor-riskdjup-fragor.ts", "RISKDJUP_MONSTER"],
  ["riskmåttsdjup", "ai-mentor-riskmattsdjup-fragor.ts", "RISKMATTSDJUP_MONSTER"],
  ["utdelningsdjup", "ai-mentor-utdelningsdjup-fragor.ts", "UTDELNINGSDJUP_MONSTER"],
  ["förväntningsdjup", "ai-mentor-forvantningsdjup-fragor.ts", "FÖRVÄNTNINGSDJUP_MONSTER"],
  ["portfoljbalans", "ai-mentor-portfoljbalans-fragor.ts", "PORTFOLJBALANS_MONSTER"],
  ["stabilitetsdjup", "ai-mentor-stabilitetsdjup-fragor.ts", "STABILITETSDJUP_MONSTER"],
  ["grahamgolv", "ai-mentor-grahamgolv-fragor.ts", "GRAHAMGOLV_MONSTER"],
  ["varderjustering", "ai-mentor-varderjustering-fragor.ts", "VARDERJUSTERING_MONSTER"],
  ["optionsdjup", "ai-mentor-optionsdjup-fragor.ts", "OPTIONS_DJUP_MONSTER"],
  ["risklasningsdjup", "ai-mentor-risklasningsdjup-fragor.ts", "RISKLÄSNINGSDJUP_MONSTER"],
  ["avkastningskurva", "ai-mentor-avkastningskurva-fragor.ts", "AVKASTNINGSKURVA_MONSTER"],
  ["avkastningsdjup", "ai-mentor-avrakningsdjup-fragor.ts", "AVKASTNINGSDJUP_MONSTER"],
  ["värderingsverktyg", "ai-mentor-varderingsverktyg-fragor.ts", "VARDERINGSVERKTYG_MONSTER"],
  ["warrant", "ai-mentor-warrant-fragor.ts", "WARRANT_MONSTER"],
  ["tidsaxel", "ai-mentor-tidsaxel-fragor.ts", "TIDSAXEL_MONSTER"],
  ["kapitalbindning", "ai-mentor-kapitalbindning-fragor.ts", "KAPITALBINDNING_MONSTER"],
  ["ekosystemdjup", "ai-mentor-ekosystemdjup-fragor.ts", "EKOSYSTEMDJUP_MONSTER"],
  ["handelsdag", "ai-mentor-handelsdag-fragor.ts", "HANDELSDAG_MONSTER"],
  ["portföljpraktik", "ai-mentor-portfoljpraktik-fragor.ts", "PORTFOLJPRAKTIK_MONSTER"],
  ["utdelningskalender", "ai-mentor-utdelningskalender-fragor.ts", "UTDELNINGSKALENDER_MONSTER"],
  ["kreditdjup", "ai-mentor-kreditdjup-fragor.ts", "KREDITDJUP_MONSTER"],
  ["sektordjup", "ai-mentor-sektordjup-fragor.ts", "SEKTORDJUP_MONSTER"],
  ["sektorskola2", "ai-mentor-sektorskola2-fragor.ts", "SEKTORSKOLA2_MONSTER"],
  ["beteendemekanik", "ai-mentor-beteendemekanik-fragor.ts", "BETEENDEMEKANIK_MONSTER"],
  ["pe-mekanik", "ai-mentor-pe-mekanik-fragor.ts", "PE_MEKANIK_MONSTER"],
  ["riskpremie", "ai-mentor-riskpremie-fragor.ts", "RISKPREMIE_MONSTER"],
  ["överlevnadsdjup", "ai-mentor-overlevnadsdjup-fragor.ts", "OVERLEVNADSDJUP_MONSTER"],
  ["koncernläsning", "ai-mentor-koncernlasning-fragor.ts", "KONCERNLASNING_MONSTER"],
  ["tillväxtdjup", "ai-mentor-tillvaxtdjup-fragor.ts", "TILLVAXTDJUP_MONSTER"],
  ["faktordjup", "ai-mentor-faktordjup-fragor.ts", "FAKTORDJUP_MONSTER"],
  ["bokmastar", "ai-mentor-bokmastar-fragor.ts", "BOKMASTAR_MONSTER"],
  ["riskbudget", "ai-mentor-riskbudget-fragor.ts", "RISKBUDGET_MONSTER"],
  ["konvertibel", "ai-mentor-konvertibel-fragor.ts", "KONVERTIBEL_MONSTER"],
  ["sektorlasning", "ai-mentor-sektorlasning-fragor.ts", "SEKTORLASNING_MONSTER"],
  ["vardegrund", "ai-mentor-vardegrund-fragor.ts", "VARDEGRUND_MONSTER"],
  ["realekonomi", "ai-mentor-realekonomi-fragor.ts", "REALEKONOMI_MONSTER"],
  ["försäkring", "ai-mentor-forsakring-fragor.ts", "FORSKRING_MONSTER"],
  ["moatdjup", "ai-mentor-moatdjup-fragor.ts", "MOATDJUP_MONSTER"],
  ["nyaterritorier", "ai-mentor-nya-territorier-fragor.ts", "NYA_TERRITORIER_MONSTER"],
  ["etfmekanik", "ai-mentor-etfmekanik-fragor.ts", "ETFMEKANIK_MONSTER"],
  ["kontrahent", "ai-mentor-kontrahent-fragor.ts", "KONTRAHENT_MONSTER"],
  ["multipel", "ai-mentor-multipel-fragor.ts", "MULTIPEL_MONSTER"],
  ["marknadsrytm", "ai-mentor-marknadsrytm-fragor.ts", "MARKNADSRYTM_MONSTER"],
];

const registerModul = await import(pathToFileURL(join(LIB, "ai-mentor-register.ts")));
const KURSREGISTER = registerModul.KURSREGISTER;

const allaKarnord = [];   // {motor, monster, ord}
const naddaSlugs = new Set();
let monsterAntal = 0;

for (const [namn, fil, arr] of MOTORER) {
  const modul = await import(pathToFileURL(join(LIB, fil)));
  const monster = modul[arr];
  if (!monster) { console.error("FEL: " + fil + " saknar " + arr); process.exit(1); }
  monsterAntal += monster.length;
  for (const m of monster) {
    for (const k of m.karnord) allaKarnord.push({ motor: namn, monster: m.id, ord: diafri(k) });
    // bygga() för att fånga källor + länkar (registerdriven genomräkning)
    try {
      const svar = m.bygga(KURSREGISTER);
      if (svar.kalla?.slug) naddaSlugs.add(svar.kalla.slug);
      for (const kk of svar.kallor ?? []) if (kk.slug) naddaSlugs.add(kk.slug);
      for (const h of svar.handlings ?? []) {
        const m2 = /\/kurser\/([a-z0-9-]+)/.exec(h.lank ?? "");
        if (m2) naddaSlugs.add(m2[1]);
      }
      if (svar.fordjupa?.lank) {
        const m3 = /\/kurser\/([a-z0-9-]+)/.exec(svar.fordjupa.lank);
        if (m3) naddaSlugs.add(m3[1]);
      }
    } catch (e) {
      console.error("FEL i bygga() " + namn + "/" + m.id + ": " + e.message);
    }
  }
}

console.log("=== DEL 1: kedjan LIVE");
console.log("motorer: " + MOTORER.length + " · monsters: " + monsterAntal +
  " · kärnord: " + allaKarnord.length + " (dialektfria) · register: " + KURSREGISTER.length);

// ── Del 2: mentorväglösa kurser per kategori ────────────────────────────────
console.log("\n=== DEL 2: mentorväglösa kurser (nådda " + naddaSlugs.size + " av " + KURSREGISTER.length + ")");
const perKat = new Map();
for (const r of KURSREGISTER) {
  if (!naddaSlugs.has(r.slug)) {
    if (!perKat.has(r.kategori)) perKat.set(r.kategori, []);
    perKat.get(r.kategori).push(r);
  }
}
const sorterat = [...perKat.entries()].sort((a, b) => b[1].length - a[1].length);
for (const [kat, rader] of sorterat) {
  console.log("\n[" + kat + "] — " + rader.length + " mentorväglösa:");
  for (const r of rader) console.log("  " + r.slug + " · " + r.titel + " · " + r.minuten + " min " + r.niva);
}

// ── Del 3: kandidat-kärnordsfamiljer mot kedjan ─────────────────────────────
console.log("\n=== DEL 3: kandidatfamiljer NULL-test (motorns toleransplan)");
const KANDIDATER = {
  "LAGER/BOKFÖRING (bk-06/07)": ["lagret", "lagervärdering", "lagervardering", "lager", "fifo", "avfo", "obeskattade reserver", "avsättningar", "avsattningar", "lagersnurra", "lageromsättningshastighet"],
  "RISK-ADRESSER (rs-06/07/08)": ["leverantörsrisk", "leverantörsrisken", "modellrisk", "modellrisken", "personalrisk", "personalrisken", "riskens anatomi", "koncentrationsrisk", "nyckelpersonrisk", "enskild leverantör"],
  "BETEENDE (bf-09/13)": ["haloeffekt", "halo-effekten", "arbitrage", "arbitragemöjlighet", "riskfri vinst", "gränsarbitrage", "arbitragens gränser"],
  "OPTIONS (od-04/05/08)": ["binomialträdet", "replikering", "replikeringsportfölj", "riskneutral värdering", "collar", "straddle", "prisspridning", "ex-dagen och optionen"],
  "ESG/REGLER (rk-06/13/14)": ["regulatorisk risk", "regulatoriska risken", "esg", "esg-risk", "gdpr", "data-risk", "koldioxidpris", "klassificeringsförordningen", "gröncertifikat"],
  "LÖNSAMHET (ln/roic)": ["operativ hävstång", "marginaltrappan", "inkrementell roic", "värdeekvationen", "nästa kronas avkastning"],
  "KATALYSATOR (kt-03/v17)": ["katalysatorkedja", "katalysatorkedjor", "andra ordningens effekt", "avtal", "partnerskap"],
  "PE (pe-05/06)": ["andrahandsmarknaden", "lp-andel", "j-kurvan", "capital call", "capital calls"],
};
const ordPerKarn = new Map();
for (const { motor, monster, ord } of allaKarnord) {
  if (!ordPerKarn.has(ord)) ordPerKarn.set(ord, []);
  ordPerKarn.get(ord).push(motor + "/" + monster);
}
for (const [tema, familj] of Object.entries(KANDIDATER)) {
  console.log("\n[" + tema + "]");
  for (const f_raw of familj) {
    const f = diafri(f_raw);
    // exakt träff?
    if (ordPerKarn.has(f)) {
      console.log("  " + f_raw + " → ÄGD av " + [...new Set(ordPerKarn.get(f))].slice(0, 4).join(", "));
      continue;
    }
    // grannkontroll: kärnord inom tolerans?
    const gran = [];
    for (const [k, agare] of ordPerKarn) {
      if (!k.includes(" ") && !f.includes(" ")) {
        const maxF = Math.max(maxFel(f.length), maxFel(k.length));
        if (redigeringstavstand(k, f) <= maxF) gran.push(k + " (" + [...new Set(agare)][0] + ")");
      }
    }
    console.log("  " + f_raw + " → NULL" + (gran.length ? " MEN grannar: " + gran.join(", ") : " (RENT)"));
  }
}

function pathToFileURL(p) { return "file://" + p; }
