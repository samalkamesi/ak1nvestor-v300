/**
 * AI-MENTORN 2.0 — VÄRDERINGSJUSTERINGAR (spår 6, omgång 14: nivån 66 → 68).
 *
 * Två ytterligare källmärkta förhandsfrågor — värderingens två justerings-
 * rattar, varken tidigare lager äger:
 *   1. NORMALISERING / CAPE (vr-02 + vm-04 + Shillers Irrational
 *      Exuberance som syskonkällor) — nämnarens justeringsratt: en
 *      årsvinst i ett cykliskt bolag säger inte vad bolaget TJÄNAR utan
 *      VAR I CYKELN det står; normaliseringen räknar ut snittet.
 *   2. SUM OF THE PARTS / SOTP (km-012 + vr-03 + Damodarans Investment
 *      Valuation som syskonkällor) — helhetens justeringsratt: när ett
 *      bolag är flera verksamheter med olika multiplar är summan av
 *      delarna en egen läsning — och konglomeratrabatten ett eget kapitel.
 *
 * ÄMNESVAL MOT KOLLISIONSKONTROLL (kärnorden disjunkta mot ALLA tidigare
 * lager — verifieras MEKANISKT av testfall J, som läser dem LIVE ur
 * modulerna): "multiplar" ägs av djup-lagret (multipel-mönstret länkar
 * redan vm-04 som SIDOKÄLLA — ämnet normalisering är dock deras inte),
 * "cyklisk/cykliska/konjunkturcykel" av sektor-lagret (därför tas INTE
 * cykel-orden som kärnord här — en "vad är cyklisk justering?"-fråga får
 * sin träddning genom sektorn, dokumenterad fälla i testets B-fall),
 * "diskonteringsränta/kalkylränta" av värderings-mönstret samt — det
 * stora BYTET under omgången — "wacc/kapitalkostnad" av lönsamhets-
 * djupets ROIC-monster ("vad är WACC?" ägs av dem genom hela kedjan;
 * dokumenterad fälla, testets B-fall). Vidare är "cape" medvetet EJ
 * kärnord: det korta ordet ligger redigeringsavstånd 1 från case-mönstrets
 * "case" och skulle stjäla case-frågor i isolering (kedjeordningen
 * skyddar, men disjunktionen hålls ren ändå — Shiller- och normaliser-
 * orden bär CAPE-ämnet). Här tas det som ingen annan fångar: normaliser-
 * familjen, shiller, snittvinst + sotp, summan av delarna, delvärdering,
 * konglomerat(rabatt).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som samtliga
 * syskonlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? svaraLokaltExtra(q, KURSREGISTER)
 *     ?? svaraLokalt(q, KURSREGISTER)
 *     ?? … (alla tidigare lager)
 *     ?? svaraLokaltVarderjustering(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en
 * fråga från tidigare lager (u1:s bevisade princip) — det fångar bara
 * frågor som alla andra lager lämnar null på.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur metoden fungerar — inga
 * köp-/säljsignaler, inga rekommendationer, inga omdömen om enskilda
 * bolag eller värdepapper. Räkneexemplen är aritmetik, inte uppmaningar.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-varderjustering.mjs kan köra filen direkt i
 * Node. Alla källkurser (vr-02, vm-04, irrational-exuberance, km-008,
 * vm-11, investment-valuation) finns i KURSREGISTER sedan tidigare
 * rebakes — inga väntande registerberoenden.
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som syskonlagren: speglade rena funktioner, bevisade
// likvärdiga av regressionstestet (fall B + C).

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

/** Källrad som avslutar varje svar — KÄLLMÄKT (samma format som motorn). */
function kallrad(k: LokalKalla): string {
  return `\n\n📖 Källa: ${k.titel}${k.slug ? ` (${k.slug})` : ""} — ${k.lagrow}.`;
}

/**
 * Flerkällskällmärke — spegling av motorns kallradFler (modulprivat där):
 * en källa ⇒ kallrad-format, flera ⇒ numrerad Källor-lista. Formatet vakas
 * av testfall A ("📖 Källor (").
 */
function kallradFler(kallor: LokalKalla[]): string {
  if (kallor.length === 0) return "";
  if (kallor.length === 1) return kallrad(kallor[0]);
  const rader = kallor
    .map((k, i) => `${i + 1}. ${k.titel}${k.slug ? ` (${k.slug})` : ""} — ${k.lagrow}`)
    .join("\n");
  return `\n\n📖 Källor (${kallor.length}):\n${rader}`;
}

function kursKalla(register: RegisterRad[], slug: string, lagrow: string): LokalKalla {
  const r = register.find((x) => x.slug === slug);
  return r
    ? { slug: r.slug, titel: r.titel, lagrow }
    : { titel: "Läroplanen", lagrow };
}

// ── De 2 nya förhandsfrågorna ───────────────────────────────────────────────

export const VARDERJUSTERING_MONSTER: FragMonster[] = [
  {
    id: "normalisering",
    karnord: [
      "normalisera", "normaliserar", "normaliserad", "normaliserade",
      "normaliserat", "normalisering", "normaliserings",
      "shiller", "genomsnittsvinst", "genomsnittsvinsten",
      "snittvinst", "snittvinsten", "genomsnittlig vinst",
      "normaliserad vinst", "normaliserade vinster", "normaliserat resultat",
    ],
    starkord: ["vinst", "vinster", "resultat", "cykel", "cykler", "bolag", "jämföra", "värdera"],
    bygga: (reg) => {
      const nm = reg.find((r) => r.slug === "vr-02-normaliserade-multipler");
      const cj = reg.find((r) => r.slug === "vm-04-cyklisk-justering");
      const bok = reg.find((r) => r.slug === "irrational-exuberance");
      const kallor = [
        kursKalla(reg, "vr-02-normaliserade-multipler", "Läroplanen — värdering, normaliseringens hantverk"),
        kursKalla(reg, "vm-04-cyklisk-justering", "Läroplanen — värderingsmetoder, Shiller P/E"),
        kursKalla(reg, "irrational-exuberance", "Läroplanen — BOKMASTER, Shiller: Irrational Exuberance"),
      ];
      const k = kallor[0];
      return {
        text:
          `Att normalisera en vinst är att räkna BORT cykeln innan man jämför. En årsvinst i ett cykliskt bolag (skog, stål, bygg, bank) svarar inte på frågan "vad tjänar bolaget?" utan på "var i cykeln står det just nu?" — rekordår och bottenår är samma bolag med samma maskiner. Tre steg i hantverket:\n\n1. TA SNITTET — i stället för senaste årets vinst används ett genomsnitt över en hel konjunkturcykel, ofta tio år. En spik i nämnaren (ett toppårs resultat) får ett billigt P/E att se ut som en fyndpris — normaliseringen är just det skyddet.\n2. CAPE — Robert Shillers cykliskt justerade P/E är metodens mest kända tillämpning: dagens pris dividerat med tioåriga snittvinsten. Boken som gjorde idén berömd — Irrational Exuberance (${bok ? bok.kapitel + " kapitel som kurs" : "i BOKMASTER"}) — visar hur hela marknaders multipler svällt och krympt i generationer.\n3. LÄS GAPET, inte talet — skillnaden mellan dagens multipel och den normaliserade är i sig information: en vinstmarginal långt över cykelns snitt pekar på ett läge som HISTORISKT återgått — ingen förutsägelse, en empirisk iakttagelse som gör multipeln till ett studieobjekt.\n\nKurserna tar räknelåan steg för steg — normaliserade multipler (${nm ? nm.minuter + " min" : "i registret"}) och den cykliska justeringen (${cj ? cj.minuter + " min" : "i registret"}) — som utbildning i att LÄSA en multipel, aldrig som en signal om att handla.` +
          kallradFler(kallor),
        amne: "normalisering",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Normaliserade multipler${nm ? " · " + nm.minuter + " min" : ""}`, lank: "/kurser/vr-02-normaliserade-multipler", ikon: "⚖️", beskrivning: "Räkna bort cykeln ur nämnaren" },
          { text: `Kursen: Cyklisk justering — Shiller P/E${cj ? " · " + cj.minuter + " min" : ""}`, lank: "/kurser/vm-04-cyklisk-justering", ikon: "🔄", beskrivning: "Tioårssnittet som metod" },
          { text: "BOKMASTER: Irrational Exuberance — Shiller", lank: "/kurser/irrational-exuberance", ikon: "📚", beskrivning: "Boken bakom CAPE — kapitel för kapitel" },
          { text: "Vad är en värderingsmultipel?", lank: "fragor:" + encodeURIComponent("vad är en värderingsmultipel?"), ikon: "🧮", beskrivning: "Grannen som normaliseringen justerar" },
        ],
        motfraga: { text: "Vad är en värderingsmultipel?", kategori: "värdering" },
        fordjupa: { text: k.titel, lank: "/kurser/vr-02-normaliserade-multipler" },
      };
    },
  },
  {
    id: "sotp",
    karnord: [
      "sotp", "sum of the parts", "summan av delarna",
      "delvärdering", "delvärderingar", "konglomerat", "konglomeraten",
      "konglomeratrabatt", "konglomeratrabatten",
    ],
    starkord: ["bolag", "divisioner", "verksamheter", "multiplar", "värdera", "summa"],
    bygga: (reg) => {
      const grund = reg.find((r) => r.slug === "km-012-sum-of-the-parts-sotp");
      const anatomi = reg.find((r) => r.slug === "vr-03-multipelns-anatomi");
      const bok = reg.find((r) => r.slug === "investment-valuation");
      const kallor = [
        kursKalla(reg, "km-012-sum-of-the-parts-sotp", "Läroplanen — värderingsmetoder, kursen om SOTP"),
        kursKalla(reg, "vr-03-multipelns-anatomi", "Läroplanen — värdering, multiplens inre byggnad"),
        kursKalla(reg, "investment-valuation", "Läroplanen — BOKMASTER, Damodaran: Investment Valuation"),
      ];
      const k = kallor[0];
      return {
        text:
          `Sum of the parts (SOTP) — "summan av delarna" — är värderingsmetoden för bolag som egentligen är FLERA bolag: en skogsdivision och en tidningsdel, ett industriföretag med ett finansben, ett konglomerat av verksamheter som inte liknar varandra. En enda koncernmultipel föser ihop dem alla; SOTP värderar varje del för sig och lägger sedan ihop.\n\nMEKANIKEN i ett genomskinligt exempel (aritmetik, inte uppmaning): en koncern har två divisioner — del A tjänar 10 i EBIT och rimliga jämförelsebolag handlas till 8 × EBIT ⇒ 80; del B tjänar 5 och är värd 12 × EBIT ⇒ 60. Summan av delarna är då 140, men koncernen har också gemensamma kostnader (koncernstab, duala börsnoteringar av annat slag — 5 här) ⇒ justerat substansvärde 135. Handlas hela koncernen till 110 är skillnaden 25 — en rabatt på (135 − 110) ÷ 135 = 18,5 %.\n\nRABBATTEN ÄR STUDIEOBJEKTET. Att helheten ofta handlas LÄGRE än summan av delarna — konglomeratrabatten — har strukturella förklaringar som kursen går igenom: svårare överblick, dubbla ägarstrukturer, kostnader för att hålla ihop det som kanske vore fristående. En rabatt är därför ALDRIG i sig en köpsignal — det är ett mått på avståndet mellan två sätt att räkna, och exakt den dubbelheten gör SOTP till ett av värderingsutbildningens bästa övningar i att fråga "vad är det jag egentligen äger?"\n\nKurserna: SOTP-grunderna (${grund ? grund.minuter + " min" : "i registret"}) bygger summan del för del, multipelns anatomi (${anatomi ? anatomi.minuter + " min" : "i registret"}) förklarar varför delarna bär olika multiplar, och Damodarans Investment Valuation (${bok ? bok.kapitel + " kapitel som kurs" : "i BOKMASTER"}) är standardverket. Som alltid: utbildning i att LÄSA en värdering — aldrig omdömen om enskilda bolag.` +
          kallradFler(kallor),
        amne: "sotp",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Sum of the parts — SOTP${grund ? " · " + grund.minuter + " min" : ""}`, lank: "/kurser/km-012-sum-of-the-parts-sotp", ikon: "🧩", beskrivning: "Värdera varje del för sig — sedan addera" },
          { text: `Kursen: Multipelns anatomi${anatomi ? " · " + anatomi.minuter + " min" : ""}`, lank: "/kurser/vr-03-multipelns-anatomi", ikon: "🔍", beskrivning: "Varför delarna bär olika multiplar" },
          { text: "BOKMASTER: Investment Valuation — Damodaran", lank: "/kurser/investment-valuation", ikon: "📚", beskrivning: "Standardverket om värdering" },
          { text: "Vad är substansvärde?", lank: "fragor:" + encodeURIComponent("vad är substansvärde?"), ikon: "🧺", beskrivning: "Investmentbolagets släkting till SOTP" },
        ],
        motfraga: { text: "Vad är substansvärde?", kategori: "värdering" },
        fordjupa: { text: k.titel, lank: "/kurser/km-012-sum-of-the-parts-sotp" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två nya mönstren — eller null (då fortsätter
 * widgeten till API-flödet som förr). Ligger SIST i widgetens kedjan och kan
 * därför aldrig stjäla en fråga från tidigare lager. Samma matchningssemantik
 * som basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltVarderjustering(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of VARDERJUSTERING_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
