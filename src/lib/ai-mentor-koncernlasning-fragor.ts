/**
 * AI-MENTORN 2.0 — KONCERNLÄSNING-FÖRHANDSFRÅGOR (spår 6, omgång 21, s6-u3,
 * manifest auto-s6-1789768506578).
 *
 * Tre källmärkta förhandsfrågor ovanpå de fyrtiotre committade lagren —
 * att läsa en KONCERN:s redovisning, där helheten är mer än moderbolaget:
 *   1. Koncernredovisningen ("vad är koncernredovisning?") — konsolideringens
 *      logik (bk-04 primär + km-001 + km-024 som källor)
 *   2. Segmentrapporteringen ("vad är segmentrapportering?") — nedbrytningen
 *      i affärsområden (km-024 primär + bk-02 + bk-04 som källor)
 *   3. Pensionsåtagandena ("vad är pensionsåtaganden?") — löftet som skuld
 *      (km-025 primär + bk-05 + km-005 som källor)
 *
 * REGISTERBÄRNING: 6 mentorväglösa kurser aktiveras (238 → 244 av 432 enligt
 * sondens genomräkning): bk-04, km-024, km-025 som primära + km-001, bk-02,
 * bk-05 som källor — varje källa en äkta slug i KURSREGISTER (kedjetestets
 * E-fall vakar). BOKFÖRING & ÅRSREDOVISNING var 8/17 mentorväglösa i rond 1.
 *
 * ÄMNESVAL EFTER SOND I TRE RONDER (verktyg/_s6u3-sond-omg21.mjs +
 * _s6u3-sond2-omg21.mjs + _s6u3-sond3-omg21.mjs, otrackade; 43 motorer /
 * 1 317 kärnord LIVE-lästa ur src/ med den riktiga matcharen + diskutläsning
 * av ev. syskonmoduler):
 *   • Rond 1: genomräkning — 194 kurser mentorväglösa; större block avståtta
 *     med dokumenterad anledning: BOKMASTER 70 (basens bok-monster äger
 *     intelligent investor/phil fisher/thinking fast and slow), PRAKTISKA
 *     CASE 16 (case-formuleringarna ägs av case-motorn), AK1TS 12 (basens
 *     tekniska monster äger rsi/macd/candlestick — ts-kurser endast källor).
 *     BOKFÖRING & ÅRSREDOVISNING 8 lösa — bäst kohesion per kurs.
 *   • Rond 2: kandidaterna NULL genom hela kedjan; kontroller fångade av
 *     sina ägare (pensionssparande→portföljpraktiken, resultaträkningen/
 *     bokslutet/balansräkningen→basens rapport-monster, avskrivning→
 *     redovisningsdjupet, goodwill→kapitalmekaniken, köpoption→optionsdjupet,
 *     ROIC/WACC→lönsamhetsdjupet). Grannsvep: 0 grannar. DÖDA SPÅR: WACC-
 *     familjen (lönsamhetsdjupets kärnord), termin (nästa-lagret), bayesiansk
 *     omviktning (ekosystemdjupet), "hur läser man affärsområden i en
 *     årsredovisning?" (basens — ordet årsredovisning; formulering UTAN det
 *     ordet är fri och är den kanoniska här).
 *   • Rond 3: omvänt prototyp-stöldprov — 0 främmande av 1 317 kanoniska
 *     kedjefrågor; "redovisningspolitik" KASSERAD som kärnord trots fri
 *     formulering (tematiskt hemma hos pensions-svarets källa, inte dess
 *     fråga) — bk-05 bärs som KÄLLA enligt V19.
 *
 * DOKUMENTERADE GRÄNSER (rond 2:s fångade kontroller — inte mina kärnord):
 *   • "pension"-grundordet ägs av portföljpraktiken (pensionssparande/
 *     tjänstepension) — här bärs endast sammansättningarna pensionsåtagande/
 *     pensionsskuld/pensionsförpliktelse; deras "vad är pensionssparande?"
 *     länkas som knapp (landar aldrig null — deras lager ligger före detta).
 *   • "resultaträkning", "bokslut", "balansräkning", "årsredovisning" är
 *     basens rapport-monsters — nämns i texterna, aldrig kärnord; bk-02
 *     bärs som KÄLLA.
 *   • "goodwill" är kapitalmekanikens (koncernredovisningens svar nämner
 *     koncerngoodwill som begrepp men äger inte ordet som kärnord).
 *
 * Aritmetiken i alla tre svar (påhittade tal, maskinellt omräknade i
 * modultestets D03-fall):
 *   • Koncernredovisning: 200 + 140 = 340 före eliminering; 340 − 20 = 320
 *     koncernresultat; 80 % av 100 = 80 koncernens andel, 100 − 80 = 20
 *     minoritetsintresse.
 *   • Segment: 500 + 300 + 200 = 1 000 intäkter; 60 + 45 − 5 = 100 resultat;
 *     marginaler 60/500 = 12,0 %, 45/300 = 15,0 %, −5/200 = −2,5 %,
 *     helhet 100/1 000 = 10,0 %; B 200 → 300 = +50 %, helhet 900 → 1 000
 *     = +11,1 % (100/900), utan B 700 → 700 oförändrad.
 *   • Pension: 2 000 → 2 200 = +200 = +10 %; 2 200 ÷ 3 000 ≈ 73,3 % av
 *     eget kapital.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * överlevnadsdjupet, kedjans 44:e motor) och kan därför aldrig stjäla en
 * fråga från ett tidigare lager; det fångar bara frågor som alla lager före
 * det lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE
 * fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur koncernredovisning,
 * segmentrapportering och pensionsåtaganden DEFINIERAS, BERÄKNAS och LÄSAS —
 * inga köp-/säljsignaler, inga placeringstips, inga omdömen om enskilda
 * börsbolag (exemplen talar om påhittade koncerner och övningstal). Ämnet
 * framingas som utbildning i rapportläsning, inte som rådgivning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-koncernlasning.mjs kan köra filen direkt i Node.
 * Alla källkurser (bk-04-koncernredovisningens-grunder, km-024-
 * segmentrapportering, km-025-pensionsataganden, km-001-bokforingens-
 * grunder, bk-02-resultatrakningen, bk-05-redovisningspolitiken, km-005-
 * eget-kapital-utdelningar) finns i KURSREGISTER (verifierat i 432-registret;
 * kursKalla faller tillbaka på "Läroplanen" om ett framtida register läcker
 * en slug).
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

// ── De 3 koncernläsning-frågorna ────────────────────────────────────────────

export const KONCERNLASNING_MONSTER: FragMonster[] = [
  {
    id: "koncernredovisning",
    karnord: [
      "koncernredovisning", "koncernredovisningen", "minoritetsintresse",
      "minoritetsintressen", "moderbolag", "dotterbolag",
    ],
    starkord: [
      "koncern", "koncernen", "konsolidering", "eliminering", "redovisning",
      "bolag", "äger", "grupp",
    ],
    bygga: (reg) => {
      const bkAntal = reg.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
      const kallor = [
        kursKalla(reg, "bk-04-koncernredovisningens-grunder", "Läroplanen — konsolideringens logik: bolaget som äger bolag"),
        kursKalla(reg, "km-001-bokforingens-grunder", "Läroplanen — grunderna: de fyra lagrens byggstenar innan koncernskiktet"),
        kursKalla(reg, "km-024-segmentrapportering", "Läroplanen — nästa steg: koncernen bruten i rapporterbara delar"),
      ];
      const k = kallor[0];
      const bk04 = reg.find((r) => r.slug === "bk-04-koncernredovisningens-grunder");
      return {
        text:
          `Koncernredovisning är när ett bolag som äger andra bolag redovisar hela gruppen som EN ekonomisk enhet — moderbolag och dotterbolag slås ihop till en gemensam bild (allt nedan är utbildning i hur koncernredovisningen DEFINIERAS och LÄSAS — påhittade exempel, inga placeringstips):\n\n1️⃣ KONSOLIDERINGENS LOGIK — DE INTERNA AFFÄRERNA RÄKNAS EJ. Varje bolag i en koncern för egen redovisning, men summan av delarna är INTE koncernens bild: affärer MELLAN bolagen i gruppen måste elimineras, annars räknas samma vinst flera gånger. Övningsexemplet med påhittade tal: säljer moderbolaget varor för 100 till dotterbolaget med 20 i vinst, och varan ännu inte sålts vidare utåt, finns den vinsten bara "på papper inne i gruppen" — moderbolaget enskilt redovisar 200 i resultat och dotterbolaget 140, summa 340, men koncernresultatet efter eliminering av den interna vinsten är 340 − 20 = 320. Det är elimineringsmekanismens kärna: koncernen ska visa gruppen mot OMVÄRLDEN, inte mot sig själv. Samma logik gäller internlån, internutdelningar och fordringar mellan bolagen — allt som är internt stryks vid konsolideringen.\n2️⃣ MINORITETSINTERESSERNA — NÄR KONCERNEN INTE ÄGER ALLT. Äger koncernen 80 procent av ett dotterbolag tillhör de återstående 20 procenten andra ägare — minoritetsintressena. Har dotterbolaget 100 i resultat är koncernens andel 80 procent av 100 = 80, medan 100 − 80 = 20 redovisas som minoritetsintressen (den andel av resultatet som inte tillhör koncernens ägare). I koncernbalansräkningen syns motsvarande post i eget kapital — därför kan "koncernens vinst" och "vinst till moderbolagets aktieägare" vara två olika tal, och båda är riktiga: frågan är vems andel man mäter.\n3️⃣ LÄSNINGENS TRE VAKTORD. (1) LAGENHET — kolla alltid att du jämför koncernsiffror med koncernsiffror (moderbolagets egna rapport visar ofta i princip bara aktierna i dotterbolagen, inte verksamheten). (2) GRÄNSDRAGNING — vilka bolag som konsolideras styrs av kontroll, inte av exakt 50-procentbruk; läsguiden i årsberättelsen redovisar koncernstrukturen. (3) HELHETENS KÄLLOR — koncerngoodwill (köpeskillnaden vid förvärv) växer fram just här i konsolideringen; begreppet och dess avskrivningar ägs av kapitalmekanikens genomgång (knappen nedan). Nästa steg när helheten står klar: bryta ned den i segment (syskonfrågan nedan).\n\nI kategorin bokföring och årsredovisning finns ${bkAntal} kurser — huvudkursen (${bk04 ? bk04.minuter + " min, " + bk04.niva.toLowerCase() + " nivå" : "i registret"}) går igenom konsolideringens logik från grunden. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "koncernredovisning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Koncernredovisningens grunder", lank: "/kurser/bk-04-koncernredovisningens-grunder", ikon: "🔗", beskrivning: "Konsolideringens logik" },
          { text: "Kursen: Bokföringens grunder", lank: "/kurser/km-001-bokforingens-grunder", ikon: "📚", beskrivning: "Byggstenarna innan koncernskiktet" },
          { text: "Kursen: Segmentrapportering", lank: "/kurser/km-024-segmentrapportering", ikon: "🧩", beskrivning: "Nästa steg: helheten bruten ned" },
          { text: "Vad är segmentrapportering?", lank: "fragor:" + encodeURIComponent("vad är segmentrapportering?"), ikon: "🧩", beskrivning: "Frågan om affärsområdena" },
          { text: "Vad är goodwill?", lank: "fragor:" + encodeURIComponent("vad är goodwill?"), ikon: "🏛️", beskrivning: "Koncerngoodwillens ägare" },
          { text: "Vad är avskrivningar?", lank: "fragor:" + encodeURIComponent("vad är avskrivningar?"), ikon: "📉", beskrivning: "Redovisningsdjupets genomgång" },
        ],
        motfraga: { text: "Vad är segmentrapportering?", kategori: "bokföring" },
        fordjupa: { text: k.titel, lank: "/kurser/bk-04-koncernredovisningens-grunder" },
      };
    },
  },
  {
    id: "segmentrapportering",
    karnord: [
      "segmentrapportering", "segmentrapport", "segment", "affärsområde",
      "affärsområden",
    ],
    starkord: [
      "intäkter", "rörelseresultat", "marginal", "verksamhet", "rapport",
      "koncern", "grenar", "uppdelning",
    ],
    bygga: (reg) => {
      const bkAntal = reg.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
      const kallor = [
        kursKalla(reg, "km-024-segmentrapportering", "Läroplanen — nedbrytningen: koncernen i rapporterbara affärsområden"),
        kursKalla(reg, "bk-02-resultatrakningen", "Läroplanen — underlaget: resultatens väg från intäkt till vinst"),
        kursKalla(reg, "bk-04-koncernredovisningens-grunder", "Läroplanen — ramen: helheten segmenten bryts ned ur"),
      ];
      const k = kallor[0];
      const km024 = reg.find((r) => r.slug === "km-024-segmentrapportering");
      return {
        text:
          `Segmentrapportering är att koncernen redovisar sina siffror uppdelade per affärsområde — segment — i stället för bara som en enda klump (allt nedan är utbildning i hur segmentrapporten DEFINIERAS och LÄSAS — påhittade exempel, inga placeringstips):\n\n1️⃣ VAD ETT SEGMENT ÄR. Ett segment är en rapporterbar del av verksamheten — ofta affärsområden, ibland geografiska marknader — som ledningen följer internt och som redovisningen visar separat: intäkter, resultat och ibland tillgångar per segment. Övningsexemplet med påhittade tal: en koncern med tre affärsområden A, B och C redovisar intäkter 500 + 300 + 200 = 1 000 och rörelseresultat 60 + 45 − 5 = 100. Marginalerna per segment blir 60 på 500 = 12,0 procent, 45 på 300 = 15,0 procent och −5 på 200 = −2,5 procent — mot helhetens 100 på 1 000 = 10,0 procent. Tre verksamheter med tre olika lönsamhet, osynliga i klumpsiffran.\n2️⃣ VAD NEDBRYTNINGEN AVSLÖJAR. Segmentrapportens värde är rörelserna MELLAN åren och MELLAN segmenten. Tillväxtexemplet (påhittade tal): affärsområde B växer från 200 till 300 — +50 procent — medan A och C står stilla; helheten går från 900 till 1 000, alltså +11,1 procent (100 av 900). Utan B vore helheten 700 mot 700 — oförändrad. Rubriksiffran "koncernen växer 11 procent" döljer alltså att hela tillväxten bor i ett av tre segment — det påverkar både hur bräcklig tillväxten är och hur en eventuell omvärdering av bara det segmentet borde se ut. Samma läsning avslöjar motiven till förvärv och avyttringar: koncerner säljer gärna det som drar ned marginalen (här C med −2,5 procent).\n3️⃣ TRE FALLGROPAR I LÄSNINGEN. (1) ALLOKERINGEN — gemensamma kostnader (koncernledning, IT, finans) fördelas på segmenten enligt intern regel; ändras regeln ändras segmentbilderna utan att verksamheten gjort det. (2) OMKLASSEN — segment kan definieras om mellan år; jämför alltid att segmenten är desamma innan du jämför talen (noten till segmentrapporten redovisar omstruktureringar). (3) AGGREGERING — små segment slås ibland ihop till "Övrigt"; det som är litet för koncernen kan vara avgörande för förändringen. Frågan att ställa: skildrar indelningen hur verksamheten faktiskt drivs, eller hur den gärna ses?\n\nI kategorin bokföring och årsredovisning finns ${bkAntal} kurser — huvudkursen (${km024 ? km024.minuter + " min, " + km024.niva.toLowerCase() + " nivå" : "i registret"}) går igenom segmentrapportens struktur och gränser. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "segment",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Segmentrapportering", lank: "/kurser/km-024-segmentrapportering", ikon: "🔗", beskrivning: "Koncernen i rapporterbara delar" },
          { text: "Kursen: Resultaträkningen", lank: "/kurser/bk-02-resultatrakningen", ikon: "📊", beskrivning: "Underlaget segmenten byggs på" },
          { text: "Kursen: Koncernredovisningens grunder", lank: "/kurser/bk-04-koncernredovisningens-grunder", ikon: "🏢", beskrivning: "Ramen runt segmenten" },
          { text: "Vad är koncernredovisning?", lank: "fragor:" + encodeURIComponent("vad är koncernredovisning?"), ikon: "🧩", beskrivning: "Helheten först" },
        ],
        motfraga: { text: "Vad är pensionsåtaganden?", kategori: "bokföring" },
        fordjupa: { text: k.titel, lank: "/kurser/km-024-segmentrapportering" },
      };
    },
  },
  {
    id: "pensionsataganden",
    karnord: [
      "pensionsåtagande", "pensionsåtaganden", "pensionsskuld",
      "pensionsförpliktelse",
    ],
    // "pension"-grundordet ägs av portföljpraktiken (pensionssparande/
    // tjänstepension) — här bärs endast sammansättningarna; deras fråga
    // länkas som knapp (rond 2:s dokumenterade gräns, vakad av G-fallet).
    starkord: [
      "avsättning", "skuld", "beräkning", "antaganden", "diskontering",
      "personal", "balansräkning", "löfte",
    ],
    bygga: (reg) => {
      const bkAntal = reg.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
      const kallor = [
        kursKalla(reg, "km-025-pensionsataganden", "Läroplanen — åtagandet: löftet om pension som beräknad skuld"),
        kursKalla(reg, "bk-05-redovisningspolitiken", "Läroplanen — valens makt: antaganden som rör siffrorna"),
        kursKalla(reg, "km-005-eget-kapital-utdelningar", "Läroplanen — motposten: vad skulden ställs mot i kapitalet"),
      ];
      const k = kallor[0];
      const km025 = reg.find((r) => r.slug === "km-025-pensionsataganden");
      return {
        text:
          `Pensionsåtaganden är bolagets löfte om framtida pension till anställda — ett åtagande som redovisas som en beräknad skuld i balansräkningen (allt nedan är utbildning i hur åtagandena DEFINIERAS och BERÄKNAS — påhittade exempel, inga placeringstips):\n\n1️⃣ VAD ÅTAGANDET ÄR. Har ett bolag utfäst pension till sin personal finns en förpliktelse som växer fram över decennier — löner tjänas in nu, utbetalas sen. Redovisningen gör det osynliga synligt: åtagandet diskonteras till dagens värde och bokförs som pensionsskuld (en avsättning), med en pensionskostnad i resultaträkningen och ofta plangång av tillgångar som ska täcka betalningarna. Skulden är alltså inte ett lån från banken utan ett internt löfte som mätts i pengar — därför heter poster och notter olika i olika rapporter men logiken är densamma: intjänat → beräknat → avsett.\n2️⃣ ANTAGANDENAS HÄVSTÅNG. Skuldens storlek beror på framtidsantaganden — diskonteringsränta, löneutveckling, kvarvarande livslängd — och en liten ändring rör mycket. Övningsexemplet med påhittade tal: en pensionsskuld på 2 000 minskar inte alls i verkligheten, men sjunker diskonteringsräntan från 4,0 till 3,5 procent stiger det beräknade värdet av samma löften till 2 200 — ökningen 2 200 − 2 000 = 200 är +10 procent, orsakad av ett räntebeslut utanför bolaget. Det är samma mekanism som gör åtagandena till en rörlig post: lågräntelägen blåser upp skulderna, höjräntelägen krymper dem — utan att en enda anställd eller ett enda löfte ändrats.\n3️⃣ LÄSNINGEN — SKULDEN I SAMMANHANG. Tre vaktord: (1) STORLEK MOT KAPITAL — sätt skulden mot det egna kapitalet: är skulden 2 200 och det egna kapitalet 3 000 är förhållandet 2 200 av 3 000 ≈ 73,3 procent — balansräkningens känslighet för antagandena är då betydande. (2) RÖRELSEN — följ noten som förklarar årets förändring (tjänat, kostnad, ränteeffekt, betalat) i stället för bara slutpoängen. (3) TÄCKNINGEN — finns plangång och hur dess avkastning rör sig med samma ränta som skulden. Och en varning från läran: en stor pensionsskuld är inte i sig "dåligt" — det är ett löfte som kostar; frågan är hur det mäts, hur det rör sig och vad som händer med kapitalet när antagandena ändras. Skatte- och sparande-sidan av pension (hur DU som privatperson sparar) ägs av portföljpraktikens genomgång — knappen nedan.\n\nI kategorin bokföring och årsredovisning finns ${bkAntal} kurser — huvudkursen (${km025 ? km025.minuter + " min, " + km025.niva.toLowerCase() + " nivå" : "i registret"}) äger beräkningarna och läsningen från grunden. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "pensionsataganden",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Pensionsåtaganden", lank: "/kurser/km-025-pensionsataganden", ikon: "🔗", beskrivning: "Löftet som beräknad skuld" },
          { text: "Kursen: Redovisningspolitiken", lank: "/kurser/bk-05-redovisningspolitiken", ikon: "⚖️", beskrivning: "Antagandenas makt över siffrorna" },
          { text: "Kursen: Eget kapital & utdelningar", lank: "/kurser/km-005-eget-kapital-utdelningar", ikon: "🏛️", beskrivning: "Motposten i kapitalet" },
          { text: "Vad är pensionssparande?", lank: "fragor:" + encodeURIComponent("vad är pensionssparande?"), ikon: "🧓", beskrivning: "Privatekonomiska sidan" },
        ],
        motfraga: { text: "Vad är koncernredovisning?", kategori: "bokföring" },
        fordjupa: { text: k.titel, lank: "/kurser/km-025-pensionsataganden" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre koncernläsning-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltKoncernlasning(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of KONCERNLASNING_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
