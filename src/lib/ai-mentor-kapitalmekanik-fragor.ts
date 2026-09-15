/**
 * AI-MENTORN 2.0 — KAPITALMEKANIK-FÖRHANDSFRÅGOR (spår 6, omgång 4: nivån 30 → 32).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts, u3:s extra-lager, u1:s makro-lager,
 * u3:s nästa-lager):
 *   1. Emission & utspädning (rk-02, med V19 kapitalförbränning och
 *      kapitalstruktur-grunderna som syskonkällor)
 *   2. Goodwill & immateriella tillgångar (km-022, med balansräkningen och
 *      organisk/förvärvad tillväxt som syskonkällor)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (auto-s6 omgång 4, parallella syskon):
 * kärnordsfamiljerna "utspädning/företrädesrätt/teckningsrätt" och
 * "goodwill/immateriella/nedskrivning/överpris" är verifierat fria mot
 * ALLA 30 tidigare mönstren (kontrolleras MEKANISKT av testfall K, som
 * läser tidigare lager live). Ord som ÄGS av andra: "emission"/"nyemission"
 * fångas av basens V19-titeluppslag ("Kapitalförbränning & Emission-risk"
 * ger variabelSvar — ett relevant källmärkt svar), "balansräkning" ägs av
 * rapport-mönstret, "förvärv" av tillväxtmönstret, "skuld/soliditet" av
 * kapitalstruktur-mönstret — här tas det som ingen annan fångar.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som övriga
 * syskonlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (D). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? svaraLokaltExtra(q, KURSREGISTER)
 *     ?? svaraLokalt(q, KURSREGISTER)
 *     ?? svaraLokaltNasta(q, KURSREGISTER)
 *     ?? svaraLokaltKapitalmekanik(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla andra lämnar
 * null på (u1:s bevisade princip, fjärde tillämpningen).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur mekanismerna fungerar — inga
 * köp-/säljsignaler, inga rekommendationer, inga omdömen om enskilda
 * bolag eller värdepapper. Aritmetiken är räkneövningar, inte råd.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-kapitalmekanik.mjs kan köra filen direkt i
 * Node. Alla källkurser (rk-02, v19, ks-01, km-022, bk-01, tx-01) finns
 * i KURSREGISTER sedan tidigare rebakes — inga väntande beroenden.
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

/** Registerfakta vid svarstid — inga hårdkodade siffror som blir lögn(er). */
function fa(r: RegisterRad | undefined): string {
  return r ? `${r.kapitel} kapitel · ${r.minuter} min${r.quiz ? ` · ${r.quiz} quizfrågor` : ""}` : "kursregistret";
}

// ── De 2 kapitalmekanik-frågorna ────────────────────────────────────────────

export const KAPITALMEKANIK_MONSTER: FragMonster[] = [
  {
    id: "emission",
    karnord: [
      "utspädning", "utspädningen", "utspädd", "utspädd", "företrädesrätt",
      "foretradesratt", "teckningsrätt", "teckna", "teckna aktier",
      "riktad emission", "kapitalanskaffning", "nytt kapital",
    ],
    starkord: ["emission", "nyemission", "aktier", "aktie", "bolag"],
    bygga: (reg) => {
      const risk = reg.find((r) => r.slug === "rk-02-emissionrisk");
      const v19 = reg.find((r) => r.slug === "v19-kapitalforbranning");
      const ks = reg.find((r) => r.slug === "ks-01-kapitalstruktur-grunder");
      const kallor = [
        kursKalla(reg, "rk-02-emissionrisk", "Läroplanen — riskhantering, kursen om utspädning"),
        kursKalla(reg, "v19-kapitalforbranning", "Läroplanen — AKM1, V19 kapitalförbränning & emission-risk"),
        kursKalla(reg, "ks-01-kapitalstruktur-grunder", "Läroplanen — kapitalstruktur, var kapitalet kommer ifrån"),
      ];
      const k = kallor[0];
      return {
        text:
          `En emission är när ett bolag skapar NYA aktier för att samla in kapital. Mekaniken i tre steg — som ren räkneövning, aldrig som handlingsråd:\n\n1️⃣ UTSPÄDNINGEN — dina aktier blir en mindre andel av helheten. Säg att bolaget har 100 miljoner aktier och emitterar 25 miljoner nya: den gamla ägarens 1 000 aktier var 0,001 % av bolaget före, men 1 000 ÷ 125 miljoner efter — andelen faller med en femtedel. Det är aritmetik, inte omdöme: samma bolag, fler andelar.\n2️⃣ FÖRETRÄDESRÄTTEN — enligt aktiebolagslagen (2005:551) ska befintliga ägare få teckna nya aktier först, förhållandevis till sina innehav, så att utspädningen blir en fråga om val snarare än tvång. Kursen om emission-risk (${risk ? risk.minuter + " min" : "i registret"}) går igenom mekaniken steg för steg.\n3️⃣ VARFÖR BOLAGET EMITTERAR — och här blir det en analysfråga med två mycket olika ansikten: nytt kapital till något som växer (en fråga om priset på tillväxten) eller nytt kapital som täcker ett hål (brinnande kassa — det är exakt vad V19 kapitalförbränning mäter, ${v19 ? v19.minuter + " min kurs" : "kurs i registret"}).\n\nPedagogikens kärna: utspädning är varken bra eller dålig i sig — den är bara HALVA ekvationen. Den andra halvan är vad kapitalet åstadkommer. Emissionskurserna lär dig läsa båda halvorna innan du formar dig en uppfattning — utbildning, inte råd.` +
          kallradFler(kallor),
        amne: "emission",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Emission-risk — utspädning${risk ? " · " + risk.minuter + " min" : ""}`, lank: "/kurser/rk-02-emissionrisk", ikon: "🧮", beskrivning: `${fa(risk)} · nivå ${(risk?.niva || "intermediär").toLowerCase()}` },
          { text: `V19: Kapitalförbränning${v19 ? " · " + v19.minuter + " min" : ""}`, lank: "/kurser/v19-kapitalforbranning", ikon: "🔥", beskrivning: "Emissionens risksida — AKM1-variabeln" },
          { text: `Kursen: Kapitalstruktur — grunder${ks ? " · " + ks.minuter + " min" : ""}`, lank: "/kurser/ks-01-kapitalstruktur-grunder", ikon: "🏗️", beskrivning: "Var kapitalet kommer ifrån — nybörjarnivå" },
          { text: "Vad är kapitalstruktur?", lank: "fragor:" + encodeURIComponent("vad är kapitalstruktur?"), ikon: "⚖️", beskrivning: "Ramverket runt emissionen" },
        ],
        motfraga: { text: "Vad är kapitalstruktur?", kategori: "kapitalstruktur" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-02-emissionrisk" },
      };
    },
  },
  {
    id: "goodwill",
    karnord: [
      "goodwill", "immateriella", "immateriell", "immateriella tillgångar",
      "nedskrivning", "nedskrivningar", "överpris", "overpris",
      "varumärkesvärde", "kundrelationer",
    ],
    starkord: ["balansräkning", "förvärv", "tillgång", "tillgångar", "bolag"],
    bygga: (reg) => {
      const gw = reg.find((r) => r.slug === "km-022-goodwill-och-immateriella-tillgangar");
      const balans = reg.find((r) => r.slug === "bk-01-balansrakningen");
      const bok = reg.find((r) => r.slug === "foretagsvardering-med-fundamental-analys");
      const kallor = [
        kursKalla(reg, "km-022-goodwill-och-immateriella-tillgangar", "Läroplanen — bokföring & årsredovisning, kursen om goodwill"),
        kursKalla(reg, "bk-01-balansrakningen", "Läroplanen — bokföring & årsredovisning, balansräkningen som karta"),
        kursKalla(reg, "foretagsvardering-med-fundamental-analys", "Läroplanen — BOKMASTER, klassikern om konsten att värdera — och betala — bolag"),
      ];
      const k = kallor[0];
      return {
        text:
          `Goodwill är bokföringens namn på ÖVERPRISET: skillnaden mellan vad ett bolag betalade i ett förvärv och det förvärvade bolagets REDOVISADE eget kapital. Köper du ett bolag till 12 mdr vars balansräkning visar 7 mdr — de extra 5 mdr är goodwill (${gw ? gw.minuter + " min kurs" : "kurs i registret"}).\n\nTre saker som gör goodwill till ett av utbildningens mest lärrika balansposter:\n\n1️⃣ VAD SOM RYMS — varumärken, kundrelationer, know-how: värden som är verkliga men svåra att mäta. Redovisningslogiken (ÅRL 1995:1554) är försiktig: internt skapad goodwill FÅR inte bokföras som tillgång — bara förvärvad. Därav paradoxen att samma varumärke kan vara miljardvärt i en balans och osynligt i en annan.\n2️⃣ NEDSKRIVNINGARNA — goodwill prövas årligen och skrivs ner när betalningsförmågan hos förvärvet inte håller måttet. En nedskrivning är bokföringens EFTERHANDS-bekännelse: för högt betalat, för länge sedan — därför är summan av nedskrivningar en av de ärligaste ledtrådarna om ett företags förvärvshistoria.\n3️⃣ TEST-FRÅGAN — hade en köpare betalat samma överpris om varje tillgång sålts separat? Om svaret är nej vilar en del av priset på något obestämbart — och då blir goodwill en fråga om TRO, inte om att mäta. Överpriset är priset på KÖPT tillväxt — därför hör goodwill ihop med frågan om organisk kontra förvärvad tillväxt — och för den som vill gå på djupet finns hela bokmaster-klassikern Företagsvärdering med fundamental analys${bok ? ` (${bok.kapitel} kapitel som kurser, ${bok.minuter} min)` : ""}: konsten att värdera, och betala, bolag kapitel för kapitel.\n\nSom alltid: detta är utbildning i att LÄSA en balansräkning — aldrig ett omdöme om enskilda förvärv eller bolag.` +
          kallradFler(kallor),
        amne: "goodwill",
        kalla: k,
        kallor,
        handlings: [
          { text: `Kursen: Goodwill & immateriella${gw ? " · " + gw.minuter + " min" : ""}`, lank: "/kurser/km-022-goodwill-och-immateriella-tillgangar", ikon: "🧊", beskrivning: `${fa(gw)} · nivå ${(gw?.niva || "avancerad").toLowerCase()}` },
          { text: `Kursen: Balansräkningen — bolagets karta${balans ? " · " + balans.minuter + " min" : ""}`, lank: "/kurser/bk-01-balansrakningen", ikon: "🗺️", beskrivning: "Nybörjarnivå — poster på plats" },
          { text: "BOKMASTER: Företagsvärdering med fundamental analys", lank: "/kurser/foretagsvardering-med-fundamental-analys", ikon: "📚", beskrivning: "Klassikern om att värdera — och betala — bolag" },
          { text: "Vad är tillväxtens källa?", lank: "fragor:" + encodeURIComponent("vad är organisk tillväxt?"), ikon: "📈", beskrivning: "Goodwill kopplas till förvärv" },
        ],
        motfraga: { text: "Vad är organisk tillväxt?", kategori: "tillväxt" },
        fordjupa: { text: k.titel, lank: "/kurser/km-022-goodwill-och-immateriella-tillgangar" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två kapitalmekanik-mönstren — eller null
 * (då fortsätter widgeten till API-flödet som förr). Ligger SIST i
 * widgetens kedja (makro ?? extra ?? bas ?? nästa ?? denna) och kan därför
 * aldrig stjäla en fråga från tidigare lager. Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltKapitalmekanik(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of KAPITALMEKANIK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
