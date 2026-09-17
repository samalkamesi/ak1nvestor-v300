/**
 * AI-MENTORN 2.0 — REDOVISNINGSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 8, s6-u1).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts, extra-, makro-, nästa-,
 * kapitalmekanik-, sektor-, case-, praktik- och portfoljgrund-lagren):
 *   1. Avskrivningar & EBITDA (km-021 primär + km-022 + Higgins-
 *      bokmastern "Analysis for Financial Management")
 *   2. Leasing / IFRS 16 (km-023 primär + bk-01 + km-004)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (kärnord LIVE-lästa ur samtliga nio
 * tidigare lager, 511 ord): "avskrivningar, ebitda, ebit, rörelseresultat"
 * och "leasing, leasa med böjningar" saknades helt — basens rapport-monster äger
 * rapportformens NAMN ("kvartalsrapport/resultaträkning/balansräkning")
 * men inte dess POSTER; extra-lagret äger kassaflödets flöde men inte
 * skillnaden mellan resultat och kassa som AVSKRIVNINGEN är orsaken till;
 * praktikens marginal-monster äger "rörelsemarginal" men inte
 * "rörelseresultat". BOKFÖRING & ÅRSREDOVISNING är registrets fjärde
 * största lärokategori (13 kurser) — rikt källmaterial, noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (samma princip som syskonlagren):
 *   • Basens rapport-monster äger "resultaträkning/balansräkning/
 *     bokslut" som kärnord — frågor med de orden besvaras av basen FÖRE
 *     detta lager. Mina kärnord utformades därför utan dem och mina
 *     kanoniska frågor är verifierade null genom hela kedjan före detta
 *     lager (testfall I).
 *   • "kassaflöde" ägs av extra-lagret; "goodwill" av kapitalmekanik-
 *     lagret; "noter" ägs av ingen — km-004 och km-022 används här endast
 *     som KÄLLOR och kurslänkar, aldrig som kärnord.
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och
 * var död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det.
 * Detta lager kopplas in SIST — och testfall L läser widgetens kedjerad
 * MEKANISKT ur filen (samma vakt som case-/praktik-/portfoljgrund-
 * testerna) så att "lager utan inkoppling" aldrig kan återkomma tyst.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de
 * rena funktionerna speglas hit). Semantisk likhet med motorn BEVISAS
 * av testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? svaraLokaltExtra(q, KURSREGISTER)
 *     ?? svaraLokalt(q, KURSREGISTER)
 *     ?? svaraLokaltNasta(q, KURSREGISTER)
 *     ?? svaraLokaltKapitalmekanik(q, KURSREGISTER)
 *     ?? svaraLokaltSektor(q, KURSREGISTER)
 *     ?? svaraLokaltCase(q, KURSREGISTER)
 *     ?? svaraLokaltPraktik(q, KURSREGISTER)
 *     ?? svaraLokaltPortfoljgrund(q, KURSREGISTER)
 *     ?? svaraLokaltRedovisningsdjup(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en
 * fråga från tidigare lager — det fångar bara frågor som alla andra
 * lager lämnar null på. Omvänt vaktar testfall I på att dessa frågor
 * INTE fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur avskrivningar, EBITDA/EBIT
 * och leasingredovisning FUNGERAR som bokföringsmekanik — inga köp-/
 * säljsignaler, inga placeringstips, inga omdömen om enskilda bolag,
 * värdepapper eller redovisningsval. Att ett bolag väljer längre
 * avskrivningstider beskrivs som något att LÄSA I NOTERNA, aldrig som
 * ett misstroendevotum eller en signal.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-redovisningsdjup.mjs kan köra filen direkt i
 * Node. Alla källkurser (km-021-avskrivningsprinciper,
 * km-022-goodwill-och-immateriella-tillgangar,
 * analysis-for-financial-management, km-023-leasing, bk-01-balansrakningen,
 * km-004-noter) finns i KURSREGISTER — inga väntande registerberoenden.
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

// ── De 2 redovisningsdjup-frågorna ──────────────────────────────────────────

export const REDOVISNINGSDJUP_MONSTER: FragMonster[] = [
  {
    id: "avskrivning",
    karnord: [
      "avskrivning", "avskrivningar", "avskrivningarna", "avskrivs",
      "avskriva", "avskrev", "avskrivit", "avskrivningsplan",
      "avskrivningstakt", "ebitda", "ebit", "rörelseresultat",
    ],
    starkord: [
      "resultat", "kassaflöde", "tillgång", "tillgångar", "maskin",
      "maskiner", "bokföra", "bokförs", "kostnad", "kurva", "utgift",
    ],
    bygga: (reg) => {
      const bkAntal = reg.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
      const kallor = [
        kursKalla(reg, "km-021-avskrivningsprinciper", "Läroplanen — bokföring & årsredovisning, kursen om avskrivningarna"),
        kursKalla(reg, "km-022-goodwill-och-immateriella-tillgangar", "Läroplanen — bokföring & årsredovisning, samma mekanik på immateriella tillgångar"),
        kursKalla(reg, "analysis-for-financial-management", "BOKMASTER — Higgins: kapitalens och avskrivningarnas ekonomi"),
      ];
      const k = kallor[0];
      const av = reg.find((r) => r.slug === "km-021-avskrivningsprinciper");
      const higgins = reg.find((r) => r.slug === "analysis-for-financial-management");
      return {
        text:
          `Avskrivning är bokföringens sätt att sprida en tillgångs kostnad över den tid den används: en maskin för 10 miljoner som beräknas räcka tio år kostar 1 miljon per år i resultaträkningen i stället för 10 miljoner köpsåret. Som räkneövning, tre saker som gör avskrivningarna till en av utbildningens mest lärorika poster:\n\n1️⃣ RESULTAT ÄR INTE KASSA — pengarna betalas UT vid köpet (i investeringskassaflödet), medan avskrivningen är en kostnad UTAN kontantflöde som fördelas över åren. Ett bolag kan därför visa vinst samtidigt som kassan minskar — och tvärtom; det är exakt därför kassaflödesanalysen finns som egen kurs och eget ämne.\n2️⃣ EBITDA OCH DESS SYSKON — EBITDA betyder resultat FÖRE avskrivningar (och före ränta och skatt): ett mått som visar verksamhetens råstyrka men som samtidigt döljer att maskiner slits och måste ersättas. EBIT ligger EFTER avskrivningarna — och skillnaden mellan de två är just avskrivningarnas storlek. Att läsa båda, och veta varför de skiljer, är en hel förmåga.\n3️⃣ PLANEN ÄR EN SKATTNING — livslängd och restvärde VÄLJS av bolaget: två i övrigt identiska bolag kan visa olika resultat bara genom olika antaganden om hur länge samma maskin håller. Därför hör avskrivningarna hemma i notläsningen — antagandena står i noterna, inte på resultatraden.\n\nKursen Avskrivningsprinciper (${av ? av.minuter + " min, " + av.quiz + " quizfrågor" : "i registret"}) går igenom mekaniken kapitel för kapitel, immateriella tillgångar har sin egen kurs (samma princip, svårare att se med ögonen), och i BOKMASTER-djupet Analysis for Financial Management (${higgins ? higgins.kapitel + " kapitel" : "14 kapitel"}) behandlas avskrivningarnas roll i kapitalens kretslopp. I kategorin bokföring & årsredovisning finns ${bkAntal} kurser.\n\nSom alltid: detta är utbildning i att LÄSA bokföringens mekanik — aldrig ett omdöme om något bolags redovisningsval.` +
          kallradFler(kallor),
        amne: "avskrivning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Avskrivningsprinciper", lank: "/kurser/km-021-avskrivningsprinciper", ikon: "🏭", beskrivning: "Intermediär — kostnadens livslängd" },
          { text: "Kursen: Goodwill & immateriella", lank: "/kurser/km-022-goodwill-och-immateriella-tillgangar", ikon: "🌫️", beskrivning: "Avancerad — osynliga tillgångars avskrivning" },
          { text: "BOKMASTER: Analysis for Financial Management", lank: "/kurser/analysis-for-financial-management", ikon: "📗", beskrivning: "Higgins — kapitalens ekonomi på djupet" },
          { text: "Vad är kassaflödesanalys?", lank: "fragor:" + encodeURIComponent("vad är kassaflödesanalys?"), ikon: "💧", beskrivning: "Resultatets sanna motpart" },
        ],
        motfraga: { text: "Hur fungerar leasing i bokföringen?", kategori: "bokföring" },
        fordjupa: { text: k.titel, lank: "/kurser/km-021-avskrivningsprinciper" },
      };
    },
  },
  {
    id: "leasing",
    karnord: [
      "leasing", "leasingavtal", "leasingtillgång", "leasingtillgångar",
      "leasar",
    ],
    // OBS verbformen: "leasa/leasat/leasade" är MEDVETET UTELUCKNADE — de
    // ligger på redigeringstavstånd 1 från basens kärnord "läsa" (läsa/
    // läsat/läsade) och stal böcker-frågan i regressionstestet G01/G2.
    // "leasar" (6 tkn) håller avstånd 3 till "läsa" och är bevisat säker.
    starkord: [
      "hyra", "hyrkostnad", "hyr", "bil", "bilar", "lokal", "lokaler",
      "maskin", "maskiner", "balans", "skuld", "avtal", "ifrs",
    ],
    bygga: (reg) => {
      const bkAntal = reg.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
      const kallor = [
        kursKalla(reg, "km-023-leasing", "Läroplanen — bokföring & årsredovisning, kursen om IFRS 16"),
        kursKalla(reg, "bk-01-balansrakningen", "Läroplanen — bokföring & årsredovisning, kartan leasingen syns på"),
        kursKalla(reg, "km-004-noter", "Läroplanen — bokföring & årsredovisning, avtalens detaljer i noterna"),
      ];
      const k = kallor[0];
      const le = reg.find((r) => r.slug === "km-023-leasing");
      return {
        text:
          `Leasing är att hyra i stället för att äga — bilen, lokalen, maskinen — och redovisningsfrågan är var hyrandet syns. Sedan IFRS 16 är svaret i princip: på balansräkningen. Som mekanik, tre delar:\n\n1️⃣ SYNET PÅ BALANSRÄKNINGEN — ett leasingavtal bokförs som en LEASINGTILLGÅNG (rätten att använda objektet) och en LEASESKULD (återbetalningsskyldigheten). Det som förr kallades operativ leasing och hölls utanför balansräkningen syns numera där — skillnaden mellan "på" och "av" balansen som jämförelseargument har därmed i stort försvunnit, vilket var standardens syfte: gör osynliga åtaganden synliga.\n2️⃣ KOSTNADENS NYA FORM — den jämna hyran ersätts i resultaträkningen av AVSKRIVNING av tillgången plus RÄNTA på skulden. Räntedelen är störst i början, så resultatet belastas tyngre tidigt i avtalet än en rak hyrkostnad skulle gjort — medan kassaflödet som helhet är ungefär samma. Återigen skillnaden mellan resultaträkning och kassa: formen ändras, substansen mindre.\n3️⃣ DETALJERNA BOR I NOTERNA — avtalslängder, förlängningsoptioner och framtida betalningsåtaganden redovisas i noterna; där finns den information en läsare behöver för att förstå hur stor del av verksamheten som vilar på hyrda tillgångar. Notläsning är därför leasingens naturliga syskonämne.\n\nKursen Leasing — IFRS 16 (${le ? le.minuter + " min, " + le.quiz + " quizfrågor" : "i registret"}) behandlar standarden kapitel för kapitel, och i kategorin bokföring & årsredovisning finns ${bkAntal} kurser att gå vidare i.\n\nSom alltid: detta är utbildning i att LÄSA en redovisningsregel — aldrig ett omdöme om att leasa är bättre eller sämre än att äga; det är ett val varje verksamhet gör av sina egna skäl.` +
          kallradFler(kallor),
        amne: "leasing",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Leasing — IFRS 16", lank: "/kurser/km-023-leasing", ikon: "🔑", beskrivning: "Avancerad — hyrandets redovisning" },
          { text: "Kursen: Balansräkningen", lank: "/kurser/bk-01-balansrakningen", ikon: "🗺️", beskrivning: "Nybörjare — kartan leasingen syns på" },
          { text: "Kursen: Noter", lank: "/kurser/km-004-noter", ikon: "🔎", beskrivning: "Avancerad — den dolda informationen" },
          { text: "Vad är avskrivningar?", lank: "fragor:" + encodeURIComponent("vad är avskrivningar?"), ikon: "🏭", beskrivning: "Leasingens kostnadsform, förklaras där" },
        ],
        motfraga: { text: "Vad är avskrivningar?", kategori: "bokföring" },
        fordjupa: { text: k.titel, lank: "/kurser/km-023-leasing" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två redovisningsdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltRedovisningsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of REDOVISNINGSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
