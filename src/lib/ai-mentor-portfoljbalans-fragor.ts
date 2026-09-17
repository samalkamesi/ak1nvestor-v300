/**
 * AI-MENTORN 2.0 — PORTFÖLJBALANS-FÖRHANDSFRÅGOR (spår 6, omgång 13, s6-u1).
 *
 * EN ytterligare källmärkt förhandsfråga ovanpå de 21 tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, agande, redovisningsdjup, djup,
 * historia, lonsamhetsdjup, tsdjup, skattedjup, beteendedjup, riskdjup,
 * riskmattsdjup, utdelningsdjup och förväntningsdjup):
 *   1. Rebalansering (pf-04-rebalansering primär + the-intelligent-asset-
 *      allocator + all-about-asset-allocation + the-bogleheads-guide-to-
 *      investing) — portföljens underhållsdisiplin: vad mekaniken gör,
 *      metoderna (kalender, bandbredd, kassaflöden) och avvägningarna
 *      (premie mot kostnad och trend)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (771 kärnord LIVE-lästa ur samtliga 21
 * lager med den riktiga matchern; verktyg/_s6u1-sond-omg13.mjs): "vad är
 * rebalansering?", "vad är ombalansering?", "vad är kärna och satellit?",
 * "vad är riskparitet?", "vad är taktisk allokering?", "vad är
 * portföljvikter?" och "vad är equal weight?" är HELT fria (NULL genom
 * hela kedjan) och kärnorden rebalansering/ombalansering/kärna och
 * satellit/riskparitet/taktisk allokering/portföljvikter har INGA
 * grannar alls inom redigeringstavstånd 2. ÄMNESLUCKA: kategorin
 * PORTFÖLJHANTERING (14 kurser pf-01..pf-14) saknade eget djuplager —
 * portfoljgrund (omgång 7) tog diversifiering/korrelation/valutarisk,
 * men rebalanseringen — kategorins kärnbegrepp med egen spetkurs i
 * registret (pf-04, 20 min) — gick rakt ut i API-flödet. Första
 * avsågna kandidater som DOG i sonden: DCF-familjen (nästa-lagret äger
 * DCF-värderingen, extra diskonterat kassaflöde, lonsamhetsdjup WACC),
 * Graham-familjen ("margin of safety" ägs av basens variabel-V08 —
 * svenska "säkerhetsmarginal" på samma koncept vore dolt dubbelägande),
 * teknisk analys (basen äger stöd/motstånd, trendlinjer, RSI, MACD,
 * candlesticks; tsdjup volymanalys), sektor-stilar (basens V20 äger
 * cykliska/defensiva/räntenära), obligationer (makro äger
 * obligationer/statsobligationer; kreditrisk/duration saknar kurser i
 * registret — spår 5-bord enligt omgång 12:s sond). Varje svar bär FYRA
 * källor med numrerad Källor-rad + FYRA kurslänkar + en levande
 * fragor:-knapp — noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt, testfallen H/I
 * bevisar båda vägarna):
 *   • Basens portfölj-monster äger portfölj-GRUNDORDEN — sondbevis: "hur
 *     rebalanserar man en portfölj?" och "vad är 60 40 portföljen?"
 *     fångas av basen (portfölj-diagnostiken); detta lager äger endast
 *     SAMMANSÄTTNINGARNA basens uppslag saknar (rebalansering/
 *     ombalansering/kärna och satellit/riskparitet/taktisk allokering/
 *     portföljvikter/equal weight/rebalanseringspremie/bandbredd) —
 *     utdelningsdjup-precedensen: sammansättningsägande ≠ grundordsägande.
 *   • Portfoljgrund-lagret äger diversifiering/korrelation (diversifiering
 *     är här endast KÄLLA/LÄNK + fragor:-knapp, aldrig kärnord).
 *   • Skattedjup-lagret äger ISK/depå-djupet — skatteaspekten nämns som
 *     grannmekanik i text med kurslänk (pf-08), aldrig som kärnord.
 *   • Riskmattsdjup-lagret äger riskmåtten — riskparitet nämns som
 *     organisationsGRANN i text, men kärnordet "riskparitet" är sond-
 *     bevisat fritt (riskmattsdjup äger inte ordet; deras kärnord är
 *     sharpe/beta/capm/standardavvikelse-familjen).
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som riskmattsdjup-lagrets
 * beta/capm-notis): 1) Verbformerna "rebalansera/rebalanserar" ägs av BASens
 * portfölj-monster (ai-mentor-svar.ts, kärnord sedan våg 158; dokumenterat
 * i portfoljgrund-lagrets header) — därför är verbet NAKET strunet här;
 * "rebalansering" (13 tkn) ligger tavstånd 3 från basens "rebalansera"
 * (11 tkn) — ömsesidigt säkert (toleransen är 2 på båda längder), och
 * testfall I bevisar att kedjan utan detta lager lämnar den kanoniska
 * frågan null. 2) "equal weight" (engelsk fras, matchas som flerordsfras
 * via fragaStr.includes) och "portföljvikter" delar STAVNINGSSTAM med
 * basens portfölj-ord — men basens matchning kräver basens egna kärnord
 * (sondbevis: "vad är portföljvikter?" NULL genom hela kedjan), och
 * flerordskravet gör "weight" ensamt verkningslöst. Dokumenteras här för
 * att nästa omgång inte "optimerar" bort marginalen.
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och var
 * död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det. Detta
 * lager kopplas in SIST — och testfall L läser widgetens kedjerad
 * MEKANISKT ur filen (tjugoandra lagret i ordning + import) så att "lager
 * utan inkoppling" aldrig kan återkomma tyst.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? … (kedjans 21 lager, se widgeten) …
 *     ?? svaraLokaltForvantningsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltPortfoljbalans(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla andra lämnar null
 * på. Omvänt vaktar testfall I på att den kanoniska frågan INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur rebalansingsmekaniken FUNGERAR
 * som metod — inga köp-/säljsignaler, inga placeringstips, inga omdömen
 * om enskilda portföljer eller värdepapper. Portföljen i texten är en
 * aritmetisk illustration av mekaniken, aldrig en utfästelse om avkastning
 * eller en rekommendation att handla.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-portfoljbalans.mjs kan köra filen direkt i Node.
 * Alla källkurser (pf-04-rebalansering, the-intelligent-asset-allocator,
 * all-about-asset-allocation, the-bogleheads-guide-to-investing) finns i
 * KURSREGISTER (verifierat i 358-registret — spår 5:s rebake lägger TILL
 * kurser, slugarna består; kursKalla faller tillbaka på "Läroplanen" om
 * ett framtida register läcker en slug).
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

/** Källrad som avslutar varje svar — KÄLLMÄRKT (samma format som motorn). */
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

// ── Den 1 portföljbalansfrågan ──────────────────────────────────────────────

export const PORTFOLJBALANS_MONSTER: FragMonster[] = [
  {
    id: "rebalansering",
    karnord: [
      "rebalansering", "ombalansering", "rebalancing",
      "kärna och satellit", "riskparitet", "taktisk allokering",
      "portföljvikter", "equal weight", "rebalanseringspremie",
      "bandbreddsmetoden", "återbalansering",
    ],
    starkord: [
      "portfölj", "vikter", "målblandning", "andel", "aktier", "fonder",
      "risk", "kostnad", "disciplin", "avsittning", "skatt",
    ],
    bygga: (reg) => {
      const kategoriAntal = reg.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
      const kallor = [
        kursKalla(reg, "pf-04-rebalansering", "Läroplanen — mekaniken: kalender, bandbredd och kassaflöden"),
        kursKalla(reg, "the-intelligent-asset-allocator", "Bokmastern — Bernsteins kanon om vikternas makt över avkastningen"),
        kursKalla(reg, "all-about-asset-allocation", "Bokmastern — Ferri om allokeringens underhåll i praktiken"),
        kursKalla(reg, "the-bogleheads-guide-to-investing", "Bokmastern — indexskolans enkla rebalanseringsdisciplin"),
      ];
      const k = kallor[0];
      const pf04 = reg.find((r) => r.slug === "pf-04-rebalansering");
      return {
        text:
          `Rebalansering är portföljens underhållsdisciplin: att med jämna mellanrum flytta tillbaka pengarna till målblandningen, så att vikterna inte driver iväg med marknaden. Mekaniken är enkel — det som stigit får minskas, det som sackat fyllas på — men den arbetar EMOT det som just känns bäst, och det är hela poängen: regeln tränger undan känslan (allt nedan är utbildning i hur metoden fungerar — inga placeringstips):\n\n1️⃣ Aritmetisk illustration med en hypotetisk 60/40-portfölj på 100 000 kr (60 000 aktier + 40 000 räntor). Aktierna stiger 25 % ⇒ 75 000 + 40 000 = 115 000, och aktievikten har drivit till 75 000 ÷ 115 000 = 65,2 % — portföljen är nu risktagande på ett sätt ägaren aldrig valde. Rebalansering tillbaka till 60/40 flyttar 6 000 kr (sälja aktier till 69 000, fylla räntor till 46 000). Om aktierna därefter faller tillbaka 20 % hamnar den rebalanserade portföljen på 69 000 × 0,8 + 46 000 = 101 200 kr (+1,2 %) medan den orörda står på 100 000 kr (0 %) — det lilla överskottet är REBALANSERINGSPREMIEN, betalningen för att ha sålt högt och köpt lågt utan att gissa. Ärlighetens motexempel: i en trendande marknad där aktierna stiger ytterligare 25 % släpar den rebalanserade portföljen (86 250 + 46 000 = 132 250 mot 93 750 + 40 000 = 133 750) — premien är ingen lag, den är ett växlingsförhållande mellan svängiga och trendande marknader.\n2️⃣ METODERNA — tre huvudspår: KALENDER (fast rutin, exempelvis en gång per år — enkelt och förutsägbart), BANDVIDD (rebalansera först när en vikt passerar sitt band, exempelvis 60 ± 5 procentenheter — handlar sällan och bara när det behövs, kostnadseffektivt) och KASSAFLÖDEN (nya sparbelopp och utdelningar riktas till det som sackat — rebalansering utan att sälja alls). Kärna-och-satellit är portföljens organisationsform: en bred kärna bär huvudvikten och satelliterna får plats inom banden; grannbegreppet RISKPARITET väger i stället positioner efter deras risk, inte efter kapital.\n3️⃣ AVVÄGNINGARNA — premien ska vägas mot tre verkliga kostnader: COURTAGE och spread (små justeringar kan ätas upp), SKATT (i en vanlig depå realiserar varje försäljning vinsten — depå- versus ISK-frågan finns i skattekursen) och TRENDENS TÅLAMOD (regeln sålde ur vinnaren på vägen upp). Bandbreddsmetoden är det vanliga svaret på alla tre: färre, större och mer motiverade affärer.\n\nI kategorin portföljhantering finns ${kategoriAntal} kurser — rebalanseringskursen (${pf04 ? pf04.minuter + " min" : "i registret"}) går igenom mekaniken, metoderna och kostnadsavvägningarna steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "rebalansering",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Rebalansering", lank: "/kurser/pf-04-rebalansering", ikon: "⚖️", beskrivning: "Mekaniken, metoderna och kostnadsavvägningarna" },
          { text: "Kursen: Diversifiering", lank: "/kurser/pf-03-diversifiering", ikon: "🧺", beskrivning: "Grannbegreppet — vad en målblandning vilar på" },
          { text: "Kursen: ISK vs aktiedepå", lank: "/kurser/pf-08-isk-vs-aktiedepa", ikon: "🧾", beskrivning: "Skatteverktyget — vad försäljningar kostar i depån" },
          { text: "Boken: The Intelligent Asset Allocator", lank: "/kurser/the-intelligent-asset-allocator", ikon: "📚", beskrivning: "Bernsteins kanon om vikternas makt" },
          { text: "Vad är diversifiering?", lank: "fragor:" + encodeURIComponent("vad är diversifiering?"), ikon: "🧺", beskrivning: "Portföljgrundens granne — ett tidigare lager" },
        ],
        motfraga: { text: "Vad är diversifiering?", kategori: "portfölj" },
        fordjupa: { text: k.titel, lank: "/kurser/pf-04-rebalansering" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de portföljbalans-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltPortfoljbalans(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of PORTFOLJBALANS_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
