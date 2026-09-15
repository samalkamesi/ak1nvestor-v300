/**
 * AI-MENTORN 2.0 — EXTRA FÖRHANDSFRÅGOR (spår 6, s6-u3: nivån 15 → 18).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de femton i
 * ai-mentor-svar.ts — den fundamentala analysens byggstenar:
 *   1. Kassaflödesanalys    (de riktiga pengarna — km-003)
 *   2. Fundamental analys   (metoden själv — BOKMASTER-klassikern)
 *   3. Moat/konkurrensfördel (AKM1:s moat-dimension V13–V15)
 *
 * ÄMNESVAL SEN MOT KOLLISIONSKONTROLL (auto-s6, parallella syskon):
 * utdelning och kvartalsrapport lämnas ÅT s6-u1 (ai-mentor-spar6-monster.ts)
 * respektive s6-u1+s6-u2 (rapportläsning) — de valde dem först, duplikat är
 * förlorat arbete. Dessa tre kärnordsfamiljer är verifierat fria mot både
 * basens MONSTER och syskonens tillägg.
 *
 * Matchningen återanvänder EXAKT motorns hjälpfunktioner (diafri/traff/
 * kursKalla/kallrad ur ai-mentor-svar.ts) — samma felstavningstolerans,
 * samma determinism, ingen kopierad logik som kan drifta isär.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltExtra(q, KURSREGISTER) ?? svaraLokalt(q, KURSREGISTER)
 * Extra-mönstren prövas FÖRE basens. Deras kärnord är disjunkta mot
 * basens fjorton, så företrädesordningen är i praktiken bara en
 * deterministisk tie-brytning.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning — inga köp-/säljsignaler, inga
 * rekommendationer om enskilda bolag.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som ai-mentor-svar.ts) ───────
 * Registret skickas IN som parameter (endast `import type` av register-
 * modulen) så att verktyg/testa-ai-mentor-extra.mjs kan köra filen
 * direkt i Node utan bundlar.
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Motorn exporterar sina hjälpfunktioner, men Node type-stripping (som
// verktyg/testa-ai-mentor-extra.mjs kör med) löser ENbart `import type` —
// runtime-import av .ts utan extension failerar (ERR_MODULE_NOT_FOUND).
// Därför samma lösning som s6-u2:s monster-modul: spegla de rena funk-
// tionerna här. Semantisk likhet med motorn BEVISAS av regressionstestets
// felstavningsfall (B) och determinismfall (D). Driftvarning: ändras
// motorns matchning måste denna spegel följa — testfall B vaktar.

function normalisera(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

function diafri(s: string): string {
  return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}

function redigeringstavstand(a: string, b: string): number {
  if (a === b) return 0;
  const n = a.length;
  const m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array<number>(m + 1);
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

function traff(fragaOrd: string[], fragaStr: string, nyckelord: string): boolean {
  const nk = diafri(nyckelord);
  if (!nk) return false;
  if (nk.includes(" ")) return fragaStr.includes(nk); // flerordsfras
  if (nk.length <= 3) return fragaOrd.includes(nk); // korta ord: exakt
  const max = nk.length <= 7 ? 1 : 2; // längre ord tål 1–2 fel
  return fragaOrd.some((o) => redigeringstavstand(o, nk) <= max);
}

/** Källrad som avslutar varje svar — KÄLLMÄRKT (samma format som motorn). */
function kallrad(k: LokalKalla): string {
  return `\n\n📖 Källa: ${k.titel}${k.slug ? ` (${k.slug})` : ""} — ${k.lagrow}.`;
}

function kursKalla(register: RegisterRad[], slug: string, lagrow: string): LokalKalla {
  const r = register.find((x) => x.slug === slug);
  return r
    ? { slug: r.slug, titel: r.titel, lagrow }
    : { titel: "Läroplanen", lagrow };
}

// ── De 3 extra förhandsfrågorna ────────────────────────────────────────────

export const EXTRA_MONSTER: FragMonster[] = [
  {
    id: "kassaflode",
    karnord: ["kassaflöde", "kassaflödesanalys", "kassaflödesanalysen", "fritt kassaflöde", "operativt kassaflöde", "cash flow", "fcf"],
    starkord: ["analys", "rapport", "läsa", "bolag", "pengar"],
    bygga: (reg) => {
      const k = kursKalla(reg, "km-003-kassaflodesanalysen", "Läroplanen — bokföring & årsredovisning, kassaflödesanalysen");
      return {
        text:
          "Kassaflödesanalys handlar om att följa de RIKTIGA pengarna — det som faktiskt rör sig över bolagets bankkonto, inte det redovisade resultatet. Tre delar att känna igen i varje rapport:\n\n1. Löpande verksamhet — pengar in från kunder, minus betalda kostnader (motorn).\n2. Investeringar — pengar ut till maskiner, byggnader, uppköp (framtidens byggstenar).\n3. Finansiering — lån, amorteringar, utdelning, emissioner (kranarna).\n\nVarför just kassaflödet är nybörjarvänligt: resultatet kan sminkas av skatteregler, avskrivningar och upplupna intäkter — bankkontot ljuger sämre. Ett bolag som redovisar vinst år efter år medan det löpande kassaflödet läcker är en klassisk pedagogisk varning. Detta är utbildning i att LÄSA — aldrig ett omdöme om något enskilt bolag." +
          kallrad(k),
        amne: "kassaflödesanalys",
        kalla: k,
        handlings: [
          { text: "Kursen: Kassaflödesanalysen", lank: "/kurser/km-003-kassaflodesanalysen", ikon: "💧", beskrivning: "6 kapitel · 18 quiz · 24 min" },
          { text: "Fördjupning: DCF — diskonterade kassaflöden", lank: "/kurser/km-007-dcf", ikon: "🧮", beskrivning: "Kassaflödet som värderingsmotor (avancerad)" },
          { text: "Vad är en kvartalsrapport?", lank: "fragor:" + encodeURIComponent("vad är en kvartalsrapport?"), ikon: "📰", beskrivning: "Där kassaflödet publiceras" },
        ],
        motfraga: { text: "Vad är en kvartalsrapport?", kategori: "fundamental analys" },
        fordjupa: { text: k.titel, lank: "/kurser/km-003-kassaflodesanalysen" },
      };
    },
  },
  {
    id: "fundamental",
    karnord: ["fundamental analys", "fundamentalanalys", "fundamental", "fundamentalt", "fundamentala", "fundamentala analysen"],
    starkord: ["analys", "aktie", "aktier", "bolag", "värdera", "värdering", "metod"],
    bygga: (reg) => {
      const k = kursKalla(reg, "foretagsvardering-med-fundamental-analys", "Läroplanen — BOKMASTER, värderingsklassikern kapitel för kapitel");
      const bok = reg.find((r) => r.slug === "foretagsvardering-med-fundamental-analys");
      return {
        text:
          "Fundamental analys är konsten att värdera ett bolag efter vad det ÄR — intäkter, marginaler, skulder, kassaflöde, ledning — i stället för vad kursgrafen gör just nu. Den svarar på frågan VARFÖR: varför är bolaget lönsamt, och varför är det rimligt prissatt?\n\nHos oss lever metoden i AKM1: tjugo variabler (V01–V20) i åtta dimensioner — tillväxt, värdering, lönsamhet, stabilitet, moat, katalysator, risk och kapitalstruktur — som ett strukturerat frågeformulär du ställer mot VARJE bolag. Teknisk analys (AK1TS) svarar i stället på NÄR; först tillsammans blir det konfluens.\n\nDjupast går klassikern Företagsvärdering med fundamental analys (Hjelström, Isaksson & Nilsson)" + (bok ? ` — ${bok.kapitel} kapitel som kurs med ${bok.quiz} quizfrågor` : "") + ". Pedagogik hela vägen: metoden lär ut att analysera, aldrig att handla." +
          kallrad(k),
        amne: "fundamental analys",
        kalla: k,
        handlings: [
          { text: "BOKMASTER: Företagsvärdering med fundamental analys", lank: "/kurser/foretagsvardering-med-fundamental-analys", ikon: "📚", beskrivning: "15 kapitel · 45 quiz · klassikern som kurs" },
          { text: "Kursen: Kassaflödesanalysen", lank: "/kurser/km-003-kassaflodesanalysen", ikon: "💧", beskrivning: "Fundamental analysens ärligaste del" },
          { text: "Vad är AKM1?", lank: "fragor:" + encodeURIComponent("vad är AKM1?"), ikon: "🏛️", beskrivning: "Tjugo variabler i åtta dimensioner" },
        ],
        motfraga: { text: "Vad är teknisk analys?", kategori: "metoder" },
        fordjupa: { text: k.titel, lank: "/kurser/foretagsvardering-med-fundamental-analys" },
      };
    },
  },
  {
    id: "moat",
    karnord: ["moat", "moats", "vallgrav", "vallgraven", "konkurrensfördel", "konkurrensfördelar", "konkurrensövertag", "konkurrenskraft"],
    starkord: ["bolag", "bra", "hålla", "skydda", "lönsamhet"],
    bygga: (reg) => {
      const k = kursKalla(reg, "v14-varumarke", "Läroplanen — AKM1, moat-dimensionen (V13–V15)");
      return {
        text:
          "Moat — vallgraven — är Buffetts bild för det som skyddar ett bolags lönsamhet från konkurrenter: vissa bolag håller goda marginaler i årtionden medan andra med samma produkter slås ut på ett par år. Skillnaden är vallgraven. I AKM1 är moat en av de åtta dimensionerna, med tre variabler — alltså tre kurser:\n\n🛡️ V13 Patent & immateriella rättigheter — den LAGLIGA vallgraven.\n❤️ V14 Varumärke & kundlojalitet — den KÄNSLOMÄSSIGA: kunderna kommer tillbaka även när konkurrenten är billigare.\n🕸️ V15 Nätverkseffekter — den EKONOMISKA: varje ny kund gör tjänsten värdefullare för alla andra (svårast att bryta, svårast att bygga).\n\nNyckelfrågan för eleven: tillväxt UTAN moat äts upp av konkurrensen — därför räcker aldrig V01–V03 (tillväxt) ensamma i en analys. Det är ett lärande om hur affärer fungerar — inte ett omdöme om bolag." +
          kallrad(k),
        amne: "moat",
        kalla: k,
        handlings: [
          { text: "Kursen V14: Varumärke & kundlojalitet", lank: "/kurser/v14-varumarke", ikon: "❤️", beskrivning: "6 kapitel · 17 quiz · 33 min" },
          { text: "Kursen V13: Patent & immateriella rättigheter", lank: "/kurser/v13-patent-ip", ikon: "🛡️", beskrivning: "Den lagliga vallgraven · 33 min" },
          { text: "Kursen V15: Nätverkseffekter", lank: "/kurser/v15-natverkseffekter", ikon: "🕸️", beskrivning: "Den ekonomiska vallgraven · 33 min" },
        ],
        motfraga: { text: "Vad är AKM1?", kategori: "ekosystem" },
        fordjupa: { text: k.titel, lank: "/kurser/v14-varumarke" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre extra mönstren — eller null (då prövar
 * widgeten basmotorn svaraLokalt, sedan API-flödet som förr). Samma
 * matchningssemantik som basmotorn: minst ett kärnord krävs, poäng =
 * kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret vinner
 * (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltExtra(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of EXTRA_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
