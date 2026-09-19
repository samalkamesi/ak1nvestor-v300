/**
 * AI-MENTORN 2.0 — BOKMASTAR-FÖRHANDSFRÅGOR (spår 6, omgång 22, s6-u3).
 *
 * Tre källmärkta förhandsfrågor ovanpå de fyrtiosex committade lagren —
 * BOKMASTER-blockets FÖRSTA mentorväg (sondens genomräkning: 70 av 103
 * bokkurser mentorväglösa, kategorins största outnyttjade block; blocket
 * orört i samtliga 21 föregående omgångar eftersom basens "böcker"-monster
 * äger de tre största klassikertitlarna — omgång 20:s dokumentation):
 *   1. Redovisningsdetektiven ("vad är financial shenanigans?") — att läsa
 *      redovisningens BAKSIDA (financial-shenanigans primär + quality-of-
 *      earnings + creative-cash-flow-reporting + financial-statement-analysis
 *      + interpretation-of-financial-statements som källor)
 *   2. Maniernas historia ("vad är manias panics and crashes?") — maniens
 *      fem faser och historiens räknediagnos (manias-panics-and-crashes
 *      primär + extraordinary-popular-delusions + the-great-crash-1929 +
 *      devil-take-the-hindmost + this-time-is-different + irrational-
 *      exuberance + bull-a-history-of-boom-and-bust som källor)
 *   3. Specialsituationerna ("vad är special situations?") — Greenblatts
 *      situationsinvestering: spin-offs, merger arbitrage och distress
 *      (you-can-be-a-stock-market-genius primär + the-art-of-short-selling
 *      + distress-investing + fooling-some-of-the-people + the-big-short
 *      som källor)
 *
 * REGISTERBÄRNING: 17 mentorväglösa BOKMASTER-kurser aktiveras (5 + 7 + 5)
 * — varje källa en äkta slug i KURSREGISTER (kedjetestets E-fall vakar;
 * kursKalla faller tillbaka på "Läroplanen" om ett framtidsregister läcker
 * en slug).
 *
 * ÄMNESVAL EFTER SOND I TVÅ RONDER (verktyg/_s6u3-sond-omg22.mjs +
 * _s6u3-sond2-omg22.mjs, otrackade; 45 motorer / 1 071 kärnord LIVE-lästa
 * + BASMOTORN separat i rundkontroll — sondens funktionskarta tappade
 * basens importrad "svaraLokalt, fallbackSvar" (omgång 21:s kända fälla);
 * kontrollfrågorna "vad är p e?"/"vad är soliditet?"/"vad är en aktie?"/
 * "hur börjar jag?" bevisar basen körd):
 *   • Rond 1 genomräkning: 184 mentorväglösa; BOKMASTER 70/103 störst,
 *     PRAKTISKA CASE 16 näst — AK1TS 12 STÄNGT (basens "teknisk analys"-
 *     monster äger indikatorfamiljen, omgång 18:s dödade rond).
 *   • Rond 2: kandidatfrågor NULL-testade genom hela kedjan med basen.
 *     A/B/D valda; C (the outsiders/100 baggers/dhandho) och E (magic
 *     formula/quantitative value/trollformeln) lämnas som dokumenterade
 *     fribitar åt kommande omgångar.
 *
 * DOKUMENTERADE GRÄNSER (rond 2:s fångster — inte mina kärnord):
 *   • HISTORIA äger tulpanmanin («vad är tulpanmanin?» fångas av dem —
 *     deras fråga bärs som knapp i manierna-svaret).
 *   • BASEN äger «hur ljuger en årsredovisning?» (ämne rapportläsning) —
 *     knapp i detektiv-svaret; eleven får deras svar, aldrig null.
 *   • PRAKTIK äger blankningen — knapp i specialsituation-svaret.
 *   • DJUP äger the snowball och acquirers multiple; NÄSTA äger what works
 *     on wall street; RISKDJUP äger den svarta svanen — böckerna som bär
 *     de svaren finns i deras källmärken, inte här.
 *   • Bokkursernas `minuten` är undefined i registret — registerdrivna
 *     tal tas ur kapitel-/quizantal + kategorital (omgång 19:s minuten-
 *     fälla: «undefined min» passerade meningslöst; D02 vakar med både
 *     text och kontrolltal).
 *
 * Aritmetiken i svaren (påhittade övningstal — historiska faktan flaggas
 * i texten — maskinellt omräknade i regressionstestets D-fall):
 *   • Detektiven: 5-årigt avtal 5 000 000 = 5 × 1 000 000; årsbokföring
 *     år ett ger +4 000 000 överdrift och 4 × 1 000 000 i hål; fordliga-
 *     ngar +40 % mot försäljning +8 % = 5× glipa; DSO 36,5 → 47,3 dagar
 *     (100/1 000 × 365 och 140/1 080 × 365); QoE-kvoten 96/100 = 0,96,
 *     102/105 = 0,97, 66/110 = 0,60 medan resultatet stiger 105 → 110.
 *   • Manierna: kurs 100 → 420 = +320 % på 18 månader; utdelning 4 kronor
 *     oförändrad ⇒ direktavkastning 4,0 % → 0,95 % (4 ÷ 420); Dow −89 %
 *     1929–1932 (381 → 41) och 25 år till återhämtning (1954) — historiska
 *     fakta, inte övningstal.
 *   • Specialsituationerna: spin-off 2,4 → 2,0 mdr = rabatt 16,7 %
 *     ((2,4 − 2,0) ÷ 2,4); bud 40,00 mot 38,50 = spread 3,9 % ((40,00 −
 *     38,50) ÷ 38,50); spricker affären till 34,00 = −11,7 %; väntevärdet
 *     0,8 × 1,50 + 0,2 × (−4,50) = +0,30 kronor.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * syskonet u2:s tillväxtdjup, kedjans 46:e motor; trefönster-presedensen)
 * och kan därför aldrig stjäla en fråga från ett tidigare lager; det
 * fångar bara frågor som alla lager före det lämnar null på. Omvänt vaktar
 * testfall H på att dessa frågor INTE fångas av kedjan utan detta lager.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur redovisningstricks, manier och
 * specialsituationer DEFINIERAS, MÄTS och LÄS — inga köp-/säljsignaler,
 * inga placeringstips, inga omdömen om enskilda börsbolag (övningsexemplens
 * bolag är påhittade och deras tal konstruerade för övningens skull).
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-bokmastar.mjs kan köra filen direkt i Node.
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som syskinlagren: speglade rena funktioner, bevisade
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

// ── De 3 bokmastar-frågorna ─────────────────────────────────────────────────

export const BOKMASTAR_MONSTER: FragMonster[] = [
  {
    id: "redovisningsdetektiven",
    karnord: [
      "financial shenanigans", "redovisningstrick", "redovisningstricks",
      "resultatmassaging", "quality of earnings", "earnings quality",
      "resultatkvalitet", "resultatets kvalitet", "kreativ redovisning",
      "kreativ bokföring", "redovisningsvarning", "redovisningsvarningar",
    ],
    // NOTERA gränserna (sondrond 2 + modultestets G-fall): «hur ljuger en
    // årsredovisning?» är BASens rapportläsning (deras monster, deras svar —
    // knapp nedan); kärnorden ovan är disjunkta mot kedjan (testfall J/G).
    starkord: [
      "schilit", "manipulation", "manipulerad", "bedrägeri", "lusläs",
      "genomlys", "intäktstiming", "engångspost", "nedskrivning",
      "uppskov", "fordringar", "lager",
    ],
    bygga: (reg) => {
      const bmAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const kallor = [
        kursKalla(reg, "financial-shenanigans", "Bokhyllan — detektivkursen: sätten en redovisning kan sminka resultatet"),
        kursKalla(reg, "quality-of-earnings", "Bokhyllan — resultatets kvalitet: kvoten som avslögar glättningen"),
        kursKalla(reg, "creative-cash-flow-reporting", "Bokhyllan — kassaflödets kreativa redovisning"),
        kursKalla(reg, "financial-statement-analysis-and-security-valuation", "Bokhyllan — Penmans helhetsläsning av rapporterna"),
        kursKalla(reg, "interpretation-of-financial-statements", "Bokhyllan — Grahams klassiska tolkningsguide"),
      ];
      const k = kallor[0];
      const fs = reg.find((r) => r.slug === "financial-shenanigans");
      return {
        text:
          `Financial shenanigans är samlingsnamnet på alla sätt en redovisning kan få ett resultat att se bättre ut än verksamheten bakom det — redovisningsdetektivens ämne är att läsa redovisningens BAKSIDA (allt nedan är utbildning i hur trick DEFINIERAS och GENOMSKÅDAS — påhittade exempel, inga placeringstips):\n\n1️⃣ DE SJU KLASSISKA SÄTTEN. Katalogen från detektivkursens källa: (1) bokföra intäkt för tidigt — övningstalet: ett femårigt avtal på 5 000 000 kronor (= 5 × 1 000 000 per år) som bokförs HELT år ett visar 5 000 000 i stället för 1 000 000 — +4 000 000 överdrift år ett, och fyra års hål på 1 000 000 varje årtal därefter; (2) fiktiva intäkter — kunder som inte finns; (3) engångsposter som återkommer varje år och därmed inte är engångna; (4) kostnader som aktiveras i balansräkningen i stället för att kostnadsföras; (5) antagandeändringar i uppskov som flyttar resultat mellan år utan att en enda krona rör sig; (6) lagermetoder som svänger resultatet när inköpspriserna rör sig; (7) nedskrivningstiming — «stora badet»: allt det fula skrivs av SAMMA år, så nästa år börjar skinande rent.\n2️⃣ BALANSRÄKNINGEN SOM LÖGNDETEKTOR. Resultatet kan sminkas — fordringarna sviker inte lika lätt. Övningen: kundfordringarna växer från 100 till 140 (+40 procent) medan försäljningen växer från 1 000 till 1 080 (+8 procent) — glipan är 40 ÷ 8 = 5 gånger. Räknat i dagar: 100 ÷ 1 000 × 365 = 36,5 dagar betaltid år ett, 140 ÷ 1 080 × 365 = 47,3 dagar år två — drygt 10 dagar längre. Två förklaringar finns: kunderna betalar sämre, eller så bokförs intäkter kunderna ännu inte godtagit — detektivens uppgift är att fråga VILKEN, inte att ropa fusk.\n3️⃣ RESULTATETS KVALITET — KVOTEN. Quality of earnings-kvoten är kassaflödet från löpande verksamhet delat med rörelseresultatet. Övningsserien: år ett 96 ÷ 100 = 0,96; år två 102 ÷ 105 = 0,97; år tre 66 ÷ 110 = 0,60 — kvoten FALLER från 0,97 till 0,60 medan resultatet stiger från 105 till 110. Resultat utan motsvarande kassa är en berättelse; kvoten mäter hur mycket av berättelsen som är pengar. Tre övningar att bära med sig: läs fordrings- och lagerändringarna FÖRE resultatraden, räkna kvoten tre år i rad (riktningen säger mer än nivån), och låt engångsposternas återkomst rytm avslöja dem — ett «engångigt» som kommer varje år är en kostnad med mask (rapportläsningens grundövningar — knappen nedan).\n\nI bokmaster-kategorin finns ${bmAntal} bokkurser — huvudboken (${fs ? fs.kapitel + " kapitel och " + fs.quiz + " quizfrågor" : "i registret"}) äger hela detektivkursen. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "financial shenanigans",
        kalla: k,
        kallor,
        handlings: [
          { text: "Boken: Financial Shenanigans", lank: "/kurser/financial-shenanigans", ikon: "🔎", beskrivning: "Detektivkursen i sju sätt" },
          { text: "Boken: Quality of Earnings", lank: "/kurser/quality-of-earnings", ikon: "⚖️", beskrivning: "Kvoten som avslöjar glättningen" },
          { text: "Boken: Creative Cash Flow Reporting", lank: "/kurser/creative-cash-flow-reporting", ikon: "💧", beskrivning: "Kassaflödets baksida" },
          { text: "Hur ljuger en årsredovisning?", lank: "fragor:" + encodeURIComponent("hur ljuger en årsredovisning?"), ikon: "📖", beskrivning: "Rapportläsningens grundkurs" },
          { text: "Vad är manias panics and crashes?", lank: "fragor:" + encodeURIComponent("vad är manias panics and crashes?"), ikon: "🌪️", beskrivning: "Syskonläsningen: manierna" },
        ],
        motfraga: { text: "Hur ljuger en årsredovisning?", kategori: "rapportläsning" },
        fordjupa: { text: k.titel, lank: "/kurser/financial-shenanigans" },
      };
    },
  },
  {
    id: "maniernas-historia",
    karnord: [
      "manias panics and crashes", "spekulativ mani",
      "this time is different", "den här gången är det annorlunda",
      "krashistoria", "krashhistorien",
    ],
    // NOTERA gränserna (modultestets G/G2-fall, LIVE-bevisade): HISTORIA-
    // motorn äger kindleberger, mackay, aliber, spekulationsmani, south sea,
    // sydbubblan, tulpanfamiljen och krasch-orden (deras monster [bubbla]/
    // [krasch1929] — kindleberger ströks som kärnord här efter G-fångsten;
    // den svenska titelöversättningen «mani panik krasch» ströks, nakna
    // «krasch» tillhör basen+historia). «bubbla»-orden hålls som starkord
    // bara — nakna bubbel-frågor utan kärnord går vidare i kedjan till
    // historiens bubbel-svar.
    starkord: [
      "bubbla", "bubblor", "eufori", "panik", "boom", "galenskap",
      "svärmeri", "kreditexpansion", "kreditboom", "hybris", "kraschen",
    ],
    bygga: (reg) => {
      const bmAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const kallor = [
        kursKalla(reg, "manias-panics-and-crashes", "Bokhyllan — maniernas anatomi: de fem faserna, generation efter generation"),
        kursKalla(reg, "extraordinary-popular-delusions", "Bokhyllan — 1841:s ursprungskatalog över folkets galenskaper"),
        kursKalla(reg, "the-great-crash-1929", "Bokhyllan — Galbraith om 1929: tidslinjen dag för dag"),
        kursKalla(reg, "devil-take-the-hindmost", "Bokhyllan — spekulativa epokers historia från 1700-talet"),
        kursKalla(reg, "this-time-is-different", "Bokhyllan — åtta århundradens kristider: varför skulden alltid tror sig unik"),
        kursKalla(reg, "irrational-exuberance", "Bokhyllan — euforins mekanik i tal och beteende"),
        kursKalla(reg, "bull-a-history-of-boom-and-bust", "Bokhyllan — 1990-talets boom- och bust-kronika"),
      ];
      const k = kallor[0];
      const mp = reg.find((r) => r.slug === "manias-panics-and-crashes");
      return {
        text:
          `Manier, paniker och krascher — maniernas historia — är finansens återkommande mönster: en verklig nyhet startar en boom, boomen blir eufori, euforin vänder till panik (allt nedan är utbildning i hur mönstret LÄSES — övningstalen är påhittade, de historiska talen är just historia):\n\n1️⃣ DE FEM FASERNA. Maniernas anatomi går i fem steg: FÖRSKJUTNINGEN (något verkligt nytt — teknik, marknad, lag), BOOMEN (priser stiger, historien fungerar, fler köper historien), EUFORIN (priset slutar handla om bolaget och handlar om nästa köpare), VINSTTAGNINGEN (insiderna säljer medan berättelsen är som bäst) och PANIKEN (utgången trängs, priset letar efter en köpare som inte finns). Fenomenet är äldre än börsen — 1841:s katalog över folkets galenskaper räknade upp tidernas svärmerier, och den läxen har upprepats varje generation sedan dess.\n2️⃣ HISTORIENS RÄKNELEKTION. Två historiska fakta bär ämnet: Dow Jones föll 89 procent från 1929 års topp till 1932 års botten (381 till 41) — och samma nivå återkom först 1954, 25 år senare; och kristidernas åttahundraåriga genomgång visar att varje kreditboom bär samma tro: «den här gången är det annorlunda» — historiens fyra dyraste ord, just för att de sägs precis när skillnaden är som minst. Övningstalet (påhittat): en aktie som stiger från 100 till 420 på 18 månader (+320 procent) med oförändrad utdelning på 4 kronor ser sin direktavkastning pressas från 4,0 till 0,95 procent (4 ÷ 420) — priset har gått ifrån vad bolaget BETALAR och hanterar nu enbart vad nästa köpare BETALAR FÖR VÄNTAN.\n3️⃣ RÄKNEDIAGNOSEN — HUR MAN KÄNNER IGEN FASEN I DATA. Tre övningar: (1) kreditmåttet — hur snabbt växer skulderna mot sin egen historia? (manierna har historiskt varit kreditfenomen framför allt); (2) nyintroduktionerna — andelen nya, okända bolag i handeln stiger i boomen (euforin behöver färskt material); (3) avkastningsmåttet mot den egna historien — direktavkastningen och värderingen emot tioårsmedelvärden, inte emot gårdagens topp. Paniken själv går inte att tajma — men fasernas ordning går att LÄSA, och det är maniernas historia som ger räknediagnosen hennes minne (tulpanmanin — historiens första lektion — har sin egen genomgång, knappen nedan).\n\nI bokmaster-kategorin finns ${bmAntal} bokkurser — huvudboken (${mp ? mp.kapitel + " kapitel och " + mp.quiz + " quizfrågor" : "i registret"}) äger hela anatomin. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "maniernas historia",
        kalla: k,
        kallor,
        handlings: [
          { text: "Boken: Manias, Panics, and Crashes", lank: "/kurser/manias-panics-and-crashes", ikon: "🌪️", beskrivning: "De fem fasernas anatomi" },
          { text: "Boken: The Great Crash 1929", lank: "/kurser/the-great-crash-1929", ikon: "📉", beskrivning: "Galbraiths tidslinje" },
          { text: "Boken: This Time Is Different", lank: "/kurser/this-time-is-different", ikon: "🕰️", beskrivning: "Åtta århundraden kristider" },
          { text: "Vad är tulpanmanin?", lank: "fragor:" + encodeURIComponent("vad är tulpanmanin?"), ikon: "🌷", beskrivning: "Historiens första lektion" },
          { text: "Vad är financial shenanigans?", lank: "fragor:" + encodeURIComponent("vad är financial shenanigans?"), ikon: "🔎", beskrivning: "Syskonläsningen: detektiven" },
        ],
        motfraga: { text: "Vad är tulpanmanin?", kategori: "bokmaster" },
        fordjupa: { text: k.titel, lank: "/kurser/manias-panics-and-crashes" },
      };
    },
  },
  {
    id: "specialsituationerna",
    karnord: [
      "special situations", "special situation", "specialsituation",
      "specialsituationer", "spin off", "spin offs", "spinoff",
      "merger arbitrage", "mergerarbitrage", "distress investing",
      "distress",
    ],
    // NOTERA gränserna (sondrond 2): «blankning» är PRAKTIK-motorns —
    // deras fråga bärs som knapp; «arbitrage» naket hålls som starkord
    // (kräver kärnordsträff för att detta monster skall ens bli kandidat).
    starkord: [
      "greenblatt", "utbrytning", "utbruten", "arbitrage", "bud",
      "budpris", "omstrukturering", "konkurs", "rekapitalisering",
      "situation",
    ],
    bygga: (reg) => {
      const bmAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const kallor = [
        kursKalla(reg, "you-can-be-a-stock-market-genius", "Bokhyllan — situationsboken: spin-offs, merger securities och rekapitaliseringar"),
        kursKalla(reg, "the-art-of-short-selling", "Bokhyllan — kortsidan som situationsläsning: vad som gör en berättelse tom"),
        kursKalla(reg, "distress-investing", "Bokhyllan — nödlidande bolag: kapitalstrukturens våningar"),
        kursKalla(reg, "fooling-some-of-the-people", "Bokhyllan — grävandets hantverk i en enda berättelse"),
        kursKalla(reg, "the-big-short", "Bokhyllan — berättelsen om att läsa mot konsensus"),
      ];
      const k = kallor[0];
      const ys = reg.find((r) => r.slug === "you-can-be-a-stock-market-genius");
      return {
        text:
          `Specialsituationer är situationsbokens grundtanke: prismekanismen kan tvinga fram försäljning som inte handlar om bolaget alls — och där tvingad försäljning finns, finns ibland rabatt som ingen fundamental orsak skapat (allt nedan är utbildning i hur situationerna DEFINIERAS och RÄKNAS — påhittade exempel, inga placeringstips):\n\n1️⃣ GRUNDMEKANISMEN — PÅTVUNGEN FÖRSÄLJNING. Fonder har mandat: en indexfond som bara får äga stora bolag TVINGAS sälja det lilla bolag som spinnas av ur ett stort — inte för att det är dåligt, utan för att reglerna säger så. Samma logik gäller fonder som inte får äga utländska, onoterade eller högriskklassade papper. Säljaren är inte övertygad — han är TVINGAD. Det är den mekanism hela situationsläsningen börjar i.\n2️⃣ SPIN-OFF-RÄKNINGEN. Övningstalet: ett utbrutet bolag med grundläggande värde 2,4 miljarder handlas de första 30 dagarna ned till 2,0 miljarder när indexfunderna dumpar — rabatten blir (2,4 − 2,0) ÷ 2,4 = 16,7 procent. Rabatten är INTE en slutsats (den kan ha skäl — minoritetsägande, okänd berättelse, tunn handel); den är en STARTPUNKT som ska räknas och förklaras, aldrig antas. Bokens andra situationer i samma familj: fusionens värdepapper (byter du aktier rätt?), rekapitaliseringar och rättighetserbjudanden.\n3️⃣ MERGER ARBITRAGE — SPREADENS TVÅ SIDOR. Bud på 40,00 kronor mot kurs 38,50 ger spreaden (40,00 − 38,50) ÷ 38,50 = 3,9 procent — vinsten OM affären genomförs. Spricker den och kursen återgår till 34,00 blir fallet (34,00 − 38,50) ÷ 38,50 = −11,7 procent. Väntevärdesräkningen vid 80 procents genomförandestyrka: 0,8 × 1,50 + 0,2 × (−4,50) = 1,20 − 0,90 = +0,30 kronor — spreadens lockelse är alltid en sannolikhetsfråga, och sannolikheten är bedömningens kärna, inte spridens storlek. Nödlidande bolag (distress) är spegelvänt samma trappsteg: i en kapitalstruktur under press betalas gårdagens fordringsägare före dagens ägare — trappan är hela avkastningsberäkningen. Tre övningar: identifiera VEM som säljer och VARFÖR (tvingad eller övertygad?), räkna spreaden mot båda utfallen — inte bara det glada — och läs shortsidans berättelse om ämnet (vad gör argumentet tomt? — knappen nedan).\n\nI bokmaster-kategorin finns ${bmAntal} bokkurser — huvudboken (${ys ? ys.kapitel + " kapitel och " + ys.quiz + " quizfrågor" : "i registret"}) äger hela situationskatalogen. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "special situations",
        kalla: k,
        kallor,
        handlings: [
          { text: "Boken: You Can Be a Stock Market Genius", lank: "/kurser/you-can-be-a-stock-market-genius", ikon: "🧩", beskrivning: "Situationskatalogen" },
          { text: "Boken: Distress Investing", lank: "/kurser/distress-investing", ikon: "🏗️", beskrivning: "Kapitalstrukturens våningar" },
          { text: "Boken: The Art of Short Selling", lank: "/kurser/the-art-of-short-selling", ikon: "🔍", beskrivning: "Kortsidans läsning" },
          { text: "Vad är blankning?", lank: "fragor:" + encodeURIComponent("vad är blankning?"), ikon: "📉", beskrivning: "Praktikens genomgång" },
          { text: "Vad är manias panics and crashes?", lank: "fragor:" + encodeURIComponent("vad är manias panics and crashes?"), ikon: "🌪️", beskrivning: "Syskonläsningen: manierna" },
        ],
        motfraga: { text: "Vad är blankning?", kategori: "praktik" },
        fordjupa: { text: k.titel, lank: "/kurser/you-can-be-a-stock-market-genius" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre bokmastar-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltBokmastar(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of BOKMASTAR_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
