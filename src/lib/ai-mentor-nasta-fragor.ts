/**
 * AI-MENTORN 2.0 — NÄSTA FÖRHANDSFRÅGOR (spår 6, omgång 3: nivån 27 → 30).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts — inklusive omgångens syskon-u2:
 * kapitalstruktur + tillväxtens källa — u3:s tre i ai-mentor-extra-fragor.ts
 * och makrons två i ai-mentor-makro-fragor.ts):
 *   1. Värdering & DCF / inre värde (km-007, med margin of safety och
 *      BOKMASTER-klassikern som syskonkällor)
 *   2. Investmentbolag & substansvärde/NAV (km-067, med Wallenberg-sfären
 *      och case Öresund som syskonkällor)
 *   3. Options (km-059 — avtalet om en rätt, med covered calls och
 *      protective puts som syskonkällor)
 *
 * ÄMNESVAL SEN MOT KOLLISIONSKONTROLL (auto-s6 omgång 3, parallella
 * syskon): ursprungliga valen kapitalstruktur och organisk/förvärvad
 * tillväxt KASSERADES när syskon-u2 visade sig leverera just dem i
 * basens MONSTER (duplikat = förlorat arbete, enligt uppdraget) —
 * ersatta med investmentbolag/NAV och options. Kärnorden är disjunkta
 * mot ALLA tidigare mönster (verifieras MEKANISKT av testfall K, som
 * läser de tidigare lagren live — även framtida tillägg fångas där):
 * "värdera/värdering" är bara starkord i nyckeltal-mönstret (aldrig
 * kärnord), "balansräkning" ägs av rapport-mönstret, "tillväxt" av
 * syskon-u2, P/E-familjen av nyckeltal-mönstret — här tas det som
 * ingen annan fångar: DCF/inre värde, substansvärde/NAV, option/call/put.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som u3:s
 * extra-lager och makro-lagret: Node type-stripping löser endast
 * `import type`, så de rena funktionerna speglas hit). Semantisk likhet
 * med motorn BEVISAS av testets felstavningfall (B) och determinismfall
 * (D). Driftvarning: ändras motorns matchning måste denna spegel följa —
 * testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? svaraLokaltExtra(q, KURSREGISTER)
 *     ?? svaraLokalt(q, KURSREGISTER)
 *     ?? svaraLokaltNasta(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en
 * fråga från tidigare lager (u1:s bevisade princip) — det fångar bara
 * frågor som alla andra lager lämnar null på.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur mekanismerna fungerar — inga
 * köp-/säljsignaler, inga rekommendationer, inga omdömen om enskilda
 * bolag eller värdepapper.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-nasta.mjs kan köra filen direkt i Node. Alla
 * källkurser (km-007, km-030, km-067, km-068, pc-18, km-059–km-061,
 * BOKMASTER-klassikern) finns i KURSREGISTER sedan tidigare rebakes —
 * inga väntande registerberoenden.
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som syskonlagren: speglade rena funktioner, bevisade
// likvärdiga av regressionstestet (fall B + D).

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

/**
 * Flerkällskällmärke — spegling av motorns kallradFler (modulprivat där):
 * en källa ⇒ kallrad-format, flera ⇒ numrerad Källor-lista. Formatet vakas
 * av testfall E ("📖 Källor (").
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

// ── De 3 nästa förhandsfrågorna ─────────────────────────────────────────────

export const NASTA_MONSTER: FragMonster[] = [
  {
    id: "vardering",
    karnord: [
      "värdera", "värdering", "dcf", "diskonterat kassaflöde",
      "diskonterade kassaflöden", "diskontering", "diskonteringsränta",
      "kalkylränta", "inre värde", "inre värdet", "rättvist värde",
      "värderingsmodell", "värderingsmodeller",
    ],
    starkord: ["aktie", "aktier", "bolag", "pris", "metod", "räkna"],
    bygga: (reg) => {
      const dcf = reg.find((r) => r.slug === "km-007-dcf");
      const mos = reg.find((r) => r.slug === "km-030-margin-of-safety");
      const bok = reg.find((r) => r.slug === "foretagsvardering-med-fundamental-analys");
      const kallor = [
        kursKalla(reg, "km-007-dcf", "Läroplanen — värderingsmetoder, DCF-kursen"),
        kursKalla(reg, "km-030-margin-of-safety", "Läroplanen — värderingsmetoder, säkerhetsmarginalen"),
        kursKalla(reg, "foretagsvardering-med-fundamental-analys", "Läroplanen — BOKMASTER, klassikern om konsten att värdera bolag"),
      ];
      const k = kallor[0];
      return {
        text:
          `Att värdera ett bolag är att räkna ut vad det kan vara VÄRT — skilt från vad börsen prissätter det just nu. Pris ser du varje dag; värde är en beräkning. Metoderna som lär ut skillnaden:\n\n1. DCF — diskonterade kassaflöden (${dcf ? dcf.minuter + " min kurs" : "kurs i registret"}): bolagets värde är summan av dess framtida fria kassaflöden, omräknade till dagens pengar. En krona imorgon är mindre värd än en krona idag — därför DISKONTERAS varje år med en ränta (kalkylräntan) som speglar både tidsvärde och osäkerhet. Räkneövningen är pedagogik: den tvingar dig att tänka på hur länge kassaflödet växer och hur säkert det är.\n2. INRE VÄRDE — DCF:ens svar: vad bolaget är värt enligt dina antaganden. Kursen däremot är marknadens kollektiva bud JUST NU. Att kurs och inre värde skiljer sig är utgångspunkten för all värderingsutbildning — inte ett imperativ att handla.\n3. SÄKERHETSMARGINAL — Grahams gamla broms: eftersom varje DCF vilar på antaganden, lägger värderaren in ett avstånd mellan beräknat värde och pris som skydd mot eget fel. Kursen om margin of safety (${mos ? mos.minuter + " min" : "i registret"}) förklarar varför ödmjukhet inför osäkerhet är en metod i sig.\n\nMultiplar (P/E, EV/EBIT) är genvägar till samma fråga — de har sina egna kurser och sitt eget förhandsfrågesvar. Och vill du gå på djupet finns hela BOKMASTER-klassikern Företagsvärdering med fundamental analys som kurs${bok ? " (" + bok.kapitel + " kapitel som kurser med quiz)" : ""}. Allt är utbildning i metoden — aldrig omdömen om vad just du ska göra.` +
          kallradFler(kallor),
        amne: "värdering",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: DCF — diskonterade kassaflöden${dcf ? " · " + dcf.minuter + " min" : ""}`, lank: "/kurser/km-007-dcf", ikon: "🧮", beskrivning: "Avancerad · inre värdets motor" },
          { text: `Kursen: Margin of safety${mos ? " · " + mos.minuter + " min" : ""}`, lank: "/kurser/km-030-margin-of-safety", ikon: "🛡️", beskrivning: "Grahams broms mot egna antagandefel" },
          { text: "BOKMASTER: Företagsvärdering med fundamental analys", lank: "/kurser/foretagsvardering-med-fundamental-analys", ikon: "📚", beskrivning: "Klassikern som kurs — kapitel för kapitel" },
          { text: "Vad är P/E?", lank: "fragor:" + encodeURIComponent("vad är P/E?"), ikon: "⚖️", beskrivning: "Genvägen bland nyckeltal" },
        ],
        motfraga: { text: "Vad är P/E?", kategori: "värdering" },
        fordjupa: { text: k.titel, lank: "/kurser/km-007-dcf" },
      };
    },
  },
  {
    id: "investmentbolag",
    karnord: [
      "investmentbolag", "investmentbolagen", "investmentbolaget",
      "substansvärde", "substansvärdet", "nav", "holdingbolag", "holding",
    ],
    starkord: ["rabatt", "bolag", "värde", "kurs", "äga"],
    bygga: (reg) => {
      const nav = reg.find((r) => r.slug === "km-067-investmentbolag");
      const wallenberg = reg.find((r) => r.slug === "km-068-wallenbergsfaren");
      const oresund = reg.find((r) => r.slug === "pc-18-case-oresund");
      const kallor = [
        kursKalla(reg, "km-067-investmentbolag", "Läroplanen — private equity & investmentbolag, NAV-kursen"),
        kursKalla(reg, "km-068-wallenbergsfaren", "Läroplanen — private equity & investmentbolag, den svenska klassikern"),
        kursKalla(reg, "pc-18-case-oresund", "Läroplanen — praktiska case, investmentbolag i praktiken"),
      ];
      const k = kallor[0];
      return {
        text:
          `Ett investmentbolag äger andelar i andra bolag — bolagets egen "värdepåse" är verksamheten. Det ger ett eget sätt att läsa värde på, med tre nyckelbegrepp:\n\n1. SUBSTANSVÄRDE (NAV, net asset value) — summan av vad innehaven är värda, ofta redovisat per aktie. Det är investmentbolagets motsvarighet till ett driftsbolags balansräkning — men med marknadsvärderade innehav i stället för maskiner och lager.\n2. NAV-RABATT — kursen står ofta LÄGRE än substansvärdet. Rabatten är ett studieobjekt i sig: den kan spegla förväntade kostnader, ovisshet om innehavens värde, eller strukturella skäl. En rabatt är därför ALDRIG i sig en köpsignal — det är ett exempel på hur samma siffra kan läsas på många sätt, och exakt därför ett utbildningsämne.\n3. DEN SVENSKA KLASSIKERN — Wallenberg-sfären (${wallenberg ? wallenberg.minuter + " min kurs" : "kurs i registret"}) har i hundra år byggt just så här: bolag som äger bolag. Att läsa en svensk storägares struktur övar samma muskler som att läsa vilken portfölj som helst.\n\nI kursen Investmentbolag — NAV-rabatt (${nav ? nav.minuter + " min" : "registret"}) går mekanismen igenom steg för steg, och case Öresund (${oresund ? oresund.minuter + " min" : "i registret"}) visar läsningen på ett verkligt exempel — som utbildningsmaterial, inte som omdöme om bolaget.` +
          kallradFler(kallor),
        amne: "investmentbolag",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Investmentbolag — NAV-rabatt${nav ? " · " + nav.minuter + " min" : ""}`, lank: "/kurser/km-067-investmentbolag", ikon: "🧺", beskrivning: "Intermediär · värdepåsen som verksamhet" },
          { text: `Kursen: Wallenberg-sfären${wallenberg ? " · " + wallenberg.minuter + " min" : ""}`, lank: "/kurser/km-068-wallenbergsfaren", ikon: "🏛️", beskrivning: "Den svenska klassikern om ägarbolag" },
          { text: `Case: Öresund — investmentbolag${oresund ? " · " + oresund.minuter + " min" : ""}`, lank: "/kurser/pc-18-case-oresund", ikon: "🔍", beskrivning: "Läsningen på ett verkligt exempel" },
          { text: "Hur läser jag en kvartalsrapport?", lank: "fragor:" + encodeURIComponent("hur läser jag en kvartalsrapport?"), ikon: "📰", beskrivning: "Där substansvärden redovisas" },
        ],
        motfraga: { text: "Hur läser jag en kvartalsrapport?", kategori: "rapportläsning" },
        fordjupa: { text: k.titel, lank: "/kurser/km-067-investmentbolag" },
      };
    },
  },
  {
    id: "options",
    karnord: [
      "option", "optionen", "optioner", "options", "termin", "terminer",
      "derivat", "call", "put", "covered call", "protective put",
      "black scholes",
    ],
    starkord: ["aktier", "rätt", "avtal", "handla", "premie"],
    bygga: (reg) => {
      const grund = reg.find((r) => r.slug === "km-059-optionsgrunder");
      const covered = reg.find((r) => r.slug === "km-060-covered-calls");
      const protective = reg.find((r) => r.slug === "km-061-protective-puts");
      const bs = reg.find((r) => r.slug === "km-062-blackscholes");
      const kallor = [
        kursKalla(reg, "km-059-optionsgrunder", "Läroplanen — options & derivat, kurs 1 (nybörjarnivå)"),
        kursKalla(reg, "km-060-covered-calls", "Läroplanen — options & derivat, en strategi genomgådd som mekanism"),
        kursKalla(reg, "km-061-protective-puts", "Läroplanen — options & derivat, spegelstrategin som mekanism"),
      ];
      const k = kallor[0];
      return {
        text:
          `En option är ett AVTAL om en rätt — inte en skyldighet — att köpa (call) eller sälja (put) en aktie till ett bestämt pris, senast ett bestämt datum. Tre byggen att förstå innan något annat:\n\n1. PREMIEN — priset på rätten, som säljaren får och köparen betalar. Premien smälter i takt med att löptiden rinner ut: en option är ett förgängligt avtal, och tidsvärdet är en av de svåraste men viktigaste lektionerna (${grund ? grund.minuter + " min grundkurs" : "grundkurs i registret"}).\n2. MEKANIKEN, inte strategin — våra kurser går igenom kända upplägg som covered calls (${covered ? covered.minuter + " min" : "i registret"}) och protective puts (${protective ? protective.minuter + " min" : "i registret"}) som MATEMATIK: vad som händer med utfall vid olika kurser — aldrig som upplägg att använda.\n3. HÄVSTÅNGEN — en liten premie rör sig kraftigt när aktien rör sig lite. Det är samma mekanism som gör optioner till ett utmärkt STUDIEOBJEKT i risk och samtidigt till det mest krävande hörnet av utbildningen — därför ligger grunderna på nybörjarnivå och Black-Scholes (${bs ? bs.minuter + " min" : "i registret"}) på avancerad.\n\nJuridiken är enkel här: AK1A lär ut hur instrumenten FUNGERAR — vi lämnar aldrig hviskningar om vad någon bör göra med dem.` +
          kallradFler(kallor),
        amne: "options",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Options-grunder${grund ? " · " + grund.minuter + " min" : ""}`, lank: "/kurser/km-059-optionsgrunder", ikon: "📜", beskrivning: "Nybörjarnivå · avtalet om en rätt" },
          { text: `Kursen: Covered calls${covered ? " · " + covered.minuter + " min" : ""}`, lank: "/kurser/km-060-covered-calls", ikon: "📞", beskrivning: "Strategin som mekanism" },
          { text: `Kursen: Protective puts${protective ? " · " + protective.minuter + " min" : ""}`, lank: "/kurser/km-061-protective-puts", ikon: "🛡️", beskrivning: "Spegelstrategin som mekanism" },
          { text: "Kursen: Black-Scholes", lank: "/kurser/km-062-blackscholes", ikon: "🧮", beskrivning: "Avancerad · prismodellen" },
        ],
        motfraga: { text: "Vad är risk?", kategori: "risk" },
        fordjupa: { text: k.titel, lank: "/kurser/km-059-optionsgrunder" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre nästa mönstren — eller null (då fortsätter
 * widgeten till API-flödet som förr). Ligger SIST i widgetens kedjan
 * (makro ?? extra ?? bas ?? denna) och kan därför aldrig stjäla en fråga
 * från tidigare lager. Samma matchningssemantik som basmotorn: minst ett
 * kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltNasta(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of NASTA_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
