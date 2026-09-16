/**
 * AI-MENTORN 2.0 — FÖRVÄNTNINGSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 12, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de arton tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, ägande, redovisningsdjup, djup,
 * historia, lönsamhetsdjup, tsdjup, skattedjup, beteendedjup, riskdjup):
 *   1. Förväntningsanalys (kt-02 primär + expectations-investing +
 *      the-alchemy-of-finance + kt-01) — priset är en sammanfattning av
 *      förväntningar; konsten är att läsa vad som REDAN står i priset
 *   2. Förväntningsgapet (kt-02 + kt-01 + contrarian-investment-strategies +
 *      irrational-exuberance) — kursreaktionen styrs av TECKNET på gapet
 *      mellan förväntan och utfall, inte av utfallets storlek
 *   3. Kalibrering (kt-02 primär + against-the-gods + fooled-by-randomness +
 *      expectations-investing) — att "80 % säker" slår in åtta gånger av tio;
 *      förväntan före, utvärdering efter
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (754 kärnord LIVE-lästa ur samtliga
 * arton lager med den riktiga matcharen; verktyg/_s6u3-sond-omg12.mjs +
 * _s6u3-sond2-omg12.mjs): "vad är förväntningsanalys?", "vad är
 * förväntningsgap?", "vad är förväntningsklyfta?", "vad är kalibrering?",
 * "vad står redan i kursen?", "vad är earnings drift?" och "vad är
 * expectations game?" är HELT fria (NULL genom hela kedjan) och samtliga
 * planerade kärnord ligger UTANFÖR felstavningstoleransen mot varje
 * befintligt kärnord (diagnostik i sonden: INGA träffar). ÄMNESLUCKA:
 * kategorin KATALYSATOR (5 kurser: kt-01, kt-02, V16–V18) hade inget eget
 * lager — men basens katalysator-monster äger grundordet, så detta lager
 * äger FAMILJEORDEN basen saknar (förväntningsanalys, förväntningsgap,
 * förväntningsklyfta, kalibrering, earnings drift, expectations game,
 * inprisat) — samma ansvarsfördelning som riskdjup-lagrets skuldfälle.
 * Första avsågna kandidater som DOG i sonderna: moat/vallgrav (extra-
 * lagret), investmentbolag/substansvärde/nav-rabatt (nästa-lagret; private
 * equity/onoterat: basen), covered calls/protective puts/black-scholes
 * (nästa-lagret), böcker/läslista (basens böcker-monster), organisk/förvärvad
 * tillväxt + arr (basens tillväxt-monster och variabeluppslag V01–V03),
 * produktlansering/avtal/regulatorisk (basens variabeluppslag äger
 * V-kursernas titelord), obligation/statsobligation/löptid (makro). Kredit-
 * familjen (företagsobligationer, kupong, kreditrisk, kreditrating) är fri
 * men saknar kursunderlag i registret — bokförd i anspråksfilen som framtida
 * bord. Varje svar bär FYRA källor med numrerad Källor-rad + FYRA
 * kurslänkar + en levande fragor:-knapp — noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt; testfallen H/I
 * bevisar båda vägarna):
 *   • Basen äger KATALYSATOR-GRUNDORDEN (katalysator, katalysatorn,
 *     katalysatorer, katalysatorjakt, "prisad" — därför fångar den "vad är
 *     en katalysator?" och "vad betyder prisad in?"): detta lagrets kärnord
 *     är FAMILJEORDEN basens uppslag saknar. Källor och kurslänkar FÅR peka
 *     på basens kärnordskurser (kt-01 är här KÄLLA, aldrig kärnord) —
 *     källägande ≠ kärnordsägande (emission/V19-precedensen).
 *   • Basens data-drivna variabeluppslag äger V-KURSERNAS TITELORD
 *     (produktlanseringar, avtal, partnerskap, regulatoriska — V16–V18):
 *     de tre V-kurserna i kategorin får bara omnämnas som KÄLLOR/LÄNKAR i
 *     svarens text, aldrig som kärnord (praktik-lagrets V-ords-lära).
 *   • Beteendedjup-lagret äger de kognitiva FÄLLORNA (bekräftelsefällan,
 *     ankareffekten, mentala konton): kalibreringssvaret nämner
 *     ankareffekten som GRANNFÄLLA i text utan att bära den som kärnord.
 *   • Historia-lagret äger bubbel-HISTORIEN (tulpanmanin, 1929):
 *     irrational-exuberance är här endast KÄLLA (Shillers bokkurs), aldrig
 *     kärnord — förväntningsgapets extremfall hänvisar utan kärnordsanspråk.
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som riskdjup-lagrets
 * "svarta"↔"starta"-kur):
 *   1. TSDJUP-FÄLLAN — frågeordet "förväntningar" (plural, 12 tecken dia-
 *     fritt) ligger redigeringstavstånd 2 från tsdjup-kärnordet
 *     "förlängningar" (11 tecken): en fråga som "hur kalibrerar jag
 *     förväntningar?" fångas därför av TSDJUP före detta lager (bevisat i
 *     sonden, diagnostiserat till just förväntningar↔förlängningar).
 *     Mina kanoniska frågor bär SAMMANSÄTTNINGARNA (förväntningsanalys,
 *     förväntningsgap, förväntningsklyfta) som ligger ≥ 4 ifrån allt —
 *     fällan vakas av testfall J (dokumenterat utfall, inte ett fel att
 *     rätta: tsdjup existerade före leveransen och ordet är deras granne).
 *   2. "inprisad"-KOLLISIONEN — basen äger "prisad" (6 tecken, tål 1 fel)
 *     som ligger exakt 2 ifrån "inprisad": maskulinformen är därför MEDVETET
 *     struken som kärnord (neutrformen "inprisat" och plural "inprisade"
 *     är fria och bärs); "katalysatorjakt" ägs av basen och bärs ej.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx): kedjan enligt riskdjup-lagrets
 * dokumentation med detta lager tillagt SIST:
 *   … ?? svaraLokaltBeteendedjup ?? svaraLokaltRiskdjup
 *   ?? svaraLokaltForvantningsdjup(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla andra lämnar null
 * på. Omvänt vaktar testfall I på att dessa frågor INTE fångas av kedjan
 * utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur förväntningar LÄSAS och
 * KALIBRERAS som metod — inga köp-/säljsignaler, inga placeringstips,
 * inga omdömen om enskilda bolag eller värdepapper. Aritmetiska
 * illustrationer (P/E-par, överraskningspar, kalibreringstabeller) är
 * mekanikens räkneexempel, aldrig utfästelser om avkastning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-forvantningsdjup.mjs kan köra filen direkt i
 * Node. Alla källkurser (kt-02-forvantningsanalys-och-kalibrering,
 * kt-01-vad-ar-en-katalysator, expectations-investing, contrarian-
 * investment-strategies, the-alchemy-of-finance, against-the-gods,
 * fooled-by-randomness, irrational-exuberance) finns i KURSREGISTER
 * (verifierat i 358-registret — spår 5:s rebake lägger TILL kurser,
 * slugarna består; kursKalla faller tillbaka på "Läroplanen" om ett
 * framtida register läcker en slug).
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

// ── De 3 förväntningsdjupfrågorna ───────────────────────────────────────────

export const FÖRVÄNTNINGSDJUP_MONSTER: FragMonster[] = [
  {
    id: "forvantningsanalys",
    karnord: [
      "förväntningsanalys", "förväntningsanalyser", "förväntningspris",
      "inprisat", "inprisade", "står redan i priset", "står redan i kursen",
      "prissatt", "prissatta",
    ],
    starkord: [
      "förväntan", "förväntning", "pris", "kurs", "marknad", "katalysator",
      "rapport", "analys", "värderingsmultipel", "läsa",
    ],
    bygga: (reg) => {
      const katAntal = reg.filter((r) => r.kategori === "KATALYSATOR").length;
      const kallor = [
        kursKalla(reg, "kt-02-forvantningsanalys-och-kalibrering", "Läroplanen — katalysatorspåret: förväntningsanalys och kalibrering"),
        kursKalla(reg, "expectations-investing", "Bokmastern — Rappaport & Mauboussin: Expectations Investing"),
        kursKalla(reg, "the-alchemy-of-finance", "Bokmastern — Soros: The Alchemy of Finance, reflexiviteten"),
        kursKalla(reg, "kt-01-vad-ar-en-katalysator", "Läroplanen — katalysatorns grund: överraskningens tecken (kärnordet katalysator ägs av basmotor-monstret)"),
      ];
      const k = kallor[0];
      const kt02 = reg.find((r) => r.slug === "kt-02-forvantningsanalys-och-kalibrering");
      const exp = reg.find((r) => r.slug === "expectations-investing");
      return {
        text:
          `Förväntningsanalys är konsten att läsa AV vad marknaden redan räknar med — priset är inte en siffra om bolaget utan en SAMMANFATTNING av förväntningar på bolaget. Därför kan två identiska nyheter ge motsatta kursreaktioner: allt avgörs av läget mellan nyheten och det som redan står i priset (allt nedan är utbildning i hur läsningen görs — ingen kommentar om något enskilt värdepapper):\n\n1️⃣ DEN OMVÄNDA LÄSNINGEN — Rappaport & Mauboussins Expectations Investing formulerar metoden: i stället för att spåra framtiden och JÄMFÖRA med priset, börjar du i priset och frågar Vilka förväntningar MOTIVERAR detta pris? — tillväxttakten, marginalen och hur länge den håller. Då blir frågan inte "är bolaget bra?" utan "är förväntningarna i priset höga eller låga?". Ett utmärkt bolag till ett pris som räknar med det omöjliga är ett förlorat analysuppdrag; ett mediokert bolag till ett pris som räknar med undergång kan vara det intressanta. (Läran gäller mekanismen — aldrig valet av bolag.)\n2️⃣ EN ARITMETISK ILLUSTRATION — samma bolag, två prislägen: P/E 12 mot P/E 24 betyder två OLIKA implikata förväntningar (ungefär dubbelt så krävande tillväxt- och marginalkrav i det högre läget). Räknar priset med +15 % tillväxt och rapporten visar +10 % — ett i sig utmärkt utfall — är förväntningsgapet NEGATIVT fem procentenheter trots att nyheten var god. Det är samma mekanik som i katalysator-kursen: kursen svarar på överraskningens TECKEN, inte på nyhetens storlek.\n3️⃣ REFLEXIVITETEN — Soros påminner om att förväntningar inte bara SPEGLAR verkligheten utan ÅTERVERKAR på den: höga förväntningar ger bolaget billig kapital att växa med (emissioner till högt pris), vilket kan GöRA förväntningarna självuppfyllande — ett tag. Beteendedjupets fällor (ankareffekten framför allt) gör att både du och marknaden hakar fast vid senaste siffran; förväntningsanalysen är motgiftet — mät avståndet mellan pris och förväntan, inte siffrorna var för sig.\n\nI kategorin katalysator finns ${katAntal} kurser — förväntningsanalys-kursen (${kt02 ? kt02.minuter + " min" : "i registret"}) går igenom avläsningen steg för steg, och bokkursen Expectations Investing (${exp ? exp.minuter + " min" : "i registret"}) tar hela metoden kapitel för kapitel. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "forvantningsanalys",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Förväntningsanalys", lank: "/kurser/kt-02-forvantningsanalys-och-kalibrering", ikon: "🎯", beskrivning: "Vad står redan i kursen?" },
          { text: "Bokmastern: Expectations Investing", lank: "/kurser/expectations-investing", ikon: "📚", beskrivning: "Rappaport & Mauboussin — hela metoden" },
          { text: "Bokmastern: The Alchemy of Finance", lank: "/kurser/the-alchemy-of-finance", ikon: "⚗️", beskrivning: "Soros — när förväntningar skapar verkligheten" },
          { text: "Kursen: Vad är en katalysator?", lank: "/kurser/kt-01-vad-ar-en-katalysator", ikon: "⚡", beskrivning: "Händelsen som möter förväntan" },
          { text: "Vad är förväntningsgapet?", lank: "fragor:" + encodeURIComponent("vad är förväntningsgapet?"), ikon: "↔️", beskrivning: "Gapet som styr reaktionen — detta lagret" },
        ],
        motfraga: { text: "Vad är förväntningsgapet?", kategori: "katalysator" },
        fordjupa: { text: k.titel, lank: "/kurser/kt-02-forvantningsanalys-och-kalibrering" },
      };
    },
  },
  {
    id: "forvantningsgap",
    karnord: [
      "förväntningsgap", "förväntningsgapet", "förväntningsklyfta",
      "förväntningsklyftan", "expectations game", "earnings drift",
    ],
    starkord: [
      "överraskning", "överraskningar", "förväntan", "förväntning",
      "rapport", "reaktion", "konträr", "överreaktion", "drift",
    ],
    bygga: (reg) => {
      const katAntal = reg.filter((r) => r.kategori === "KATALYSATOR").length;
      const kallor = [
        kursKalla(reg, "kt-01-vad-ar-en-katalysator", "Läroplanen — katalysatorns grund: överraskningens tecken mot prissatt förväntan (kärnordet katalysator ägs av basmotor-monstret)"),
        kursKalla(reg, "kt-02-forvantningsanalys-och-kalibrering", "Läroplanen — katalysatorspåret: förväntningsanalys och kalibrering"),
        kursKalla(reg, "contrarian-investment-strategies", "Bokmastern — Dreman: Contrarian Investment Strategies, överraskningsforskningen"),
        kursKalla(reg, "irrational-exuberance", "Bokmastern — Shiller: Irrational Exuberance, gapets extrema fall (bubbel-historien ägs av historia-lagret)"),
      ];
      const k = kallor[0];
      const dreman = reg.find((r) => r.slug === "contrarian-investment-strategies");
      return {
        text:
          `Förväntningsgapet är avståndet mellan vad marknaden väntar sig och vad som händer — och kursreaktionen styrs av TECKNET på gapet, inte av utfallets storlek. Det är katalysator-mekanikens kärna (allt nedan är utbildning i hur gapet läses — inga prognoser):\n\n1️⃣ ÖVERRASKNINGSPARET — aritmetisk illustration: Bolag A rapporterar +10 % omsättningstillväxt och kursen FALLER 8 % — priset hade prissatt +15 %, gapet blev −5 enheter trots goda nyheter. Bolag B rapporterar −2 % och kursen STIGER 6 % — priset hade prissatt −8 %, gapet blev +6 enheter trots sämre nyheter. Samma läxa två gånger: utfallets tecken ≠ reaktionens tecken. "Bra rapport" och "bra reaktion" är två olika frågor.\n2️⃣ DREMANS KONTRÄRA STATISTIK — David Dremans långa datastudier visar varför gapet är systematiskt: bolag som prissatts som vinnare (höga multiplar) överraskar oftare NEGATIVT — inte nödvändigtvis genom att bli dåliga utan genom att inte kunna LEVA UPP till det extremt högt ställda — medan lågt prissatta bolag överraskar oftare positivt, eftersom nästan inget förväntas. Förväntningsgapet är alltså inte slumpbrus utan har en lutning kopplad till prisläget (läran gäller mekanismen — konträr strategi är ett studieområde, inte ett råd här).\n3️⃣ TVÅ FÖRLÄNGNINGAR — EARNINGS DRIFT (kursdrift efter överraskningar): forskningen bakom Dremans övningar visar att kurser i medeltal fortsätter i överraskningens riktning ett tag — gapet sluts inte på en sekund; det är därför "allt är redan prissatt" bara är den FÖRSTA ordningen av sanning. Och EXPECTATIONS GAME (Mauboussins namn på hela spelet): när alla analyserar samma gap flyttas övertaget från att GISSA utfallet till att läsa FÖRVÄNTNINGEN bättre — förväntningsanalysens kärna. Gapets extrema fall — när förväntningarna löper ifrån all grund — är studieobjektet i historia-lagrets bubbelkurser; Shillers bokkurs är bryggan.\n\nI kategorin katalysator finns ${katAntal} kurser — grundkursen går igenom överraskningens tecken och kalibreringskursen övningen; Dremans bokkurs (${dreman ? dreman.minuter + " min" : "i registret"}) bär överraskningsstatistiken. Som alltid: detta är utbildning i hur gapet läses — inga placeringstips.` +
          kallradFler(kallor),
        amne: "forvantningsgap",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Vad är en katalysator?", lank: "/kurser/kt-01-vad-ar-en-katalysator", ikon: "⚡", beskrivning: "Överraskningens tecken mot förväntan" },
          { text: "Kursen: Förväntningsanalys", lank: "/kurser/kt-02-forvantningsanalys-och-kalibrering", ikon: "🎯", beskrivning: "Läs avståndet före händelsen" },
          { text: "Bokmastern: Contrarian Investment Strategies", lank: "/kurser/contrarian-investment-strategies", ikon: "📚", beskrivning: "Dreman — överraskningsstatistiken" },
          { text: "Bokmastern: Irrational Exuberance", lank: "/kurser/irrational-exuberance", ikon: "🔥", beskrivning: "När gapet blir extremt" },
          { text: "Vad är kalibrering?", lank: "fragor:" + encodeURIComponent("vad är kalibrering?"), ikon: "🎓", beskrivning: "Öva in avstånds-känslan — detta lagret" },
        ],
        motfraga: { text: "Vad är kalibrering?", kategori: "katalysator" },
        fordjupa: { text: k.titel, lank: "/kurser/kt-01-vad-ar-en-katalysator" },
      };
    },
  },
  {
    id: "kalibrering",
    karnord: [
      "kalibrering", "kalibreringen", "kalibrera", "kalibrerad",
    ],
    starkord: [
      "sannolikhet", "säker", "prognos", "osäkerhet", "träffsäker",
      "öva", "övning", "utvärdera", "utfall", "brier",
    ],
    bygga: (reg) => {
      const katAntal = reg.filter((r) => r.kategori === "KATALYSATOR").length;
      const kallor = [
        kursKalla(reg, "kt-02-forvantningsanalys-och-kalibrering", "Läroplanen — katalysatorspåret: kalibreringsövningen, förväntan före och utvärdering efter"),
        kursKalla(reg, "against-the-gods", "Bokmastern — Bernstein: Against the Gods, sannolikhetstänkandets historia"),
        kursKalla(reg, "fooled-by-randomness", "Bokmastern — Taleb: Fooled by Randomness, bruset bakom träffarna"),
        kursKalla(reg, "expectations-investing", "Bokmastern — Rappaport & Mauboussin: Expectations Investing, förväntningarna som träningsunderlag"),
      ];
      const k = kallor[0];
      const kt02 = reg.find((r) => r.slug === "kt-02-forvantningsanalys-och-kalibrering");
      const gods = reg.find((r) => r.slug === "against-the-gods");
      return {
        text:
          `Kalibrering är egenskapen hos en bedömare (inte en prognos): den som säger "jag är 80 % säker" och har rätt i åtta fall av tio är VÄL kalibrerad — samma säkerhet med rätt i fyra av tio är dåligt kalibrerad. Ordet kommer från mätvärlden (ett kalibrerat instrument visar sant) och lånas till omdömet (allt nedan är utbildning i träningen — inga prognoser):\n\n1️⃣ VARFÖR DET ÄR TRÄNING, INTE TALANG — kalibrering kan inte avläsas från EN prognos, bara från en SERIE: därför bygger kursens övning på katalysatorkalenderns tumregel — SKRIV din förväntan FÖRE händelsen (gärna som sannolikhet, inte känsla), UTVÄRDERA efteråt mot utfallet. Enkla poängmått som Brier-talet (straff för avståndet mellan sannolikhet och utfall) gör serien mätbar. Utan skrivet facit blir minnet en efterrationaliseringsmaskin — beteendedjupets fällor (bekräftelsefällan, minnet av "jag visste det") skevar retrospektivet; kalibreringsloggen är motgiftet.\n2️⃣ EN ARITMETISK ILLUSTRATION — tio prognoser med "70 % säker": slagit in 4 gånger ⇒ ÖVERMOD (säger 70, lever 40); slagit in 6–8 gånger ⇒ grovt kalibrerad; slagit in 10 av 10 vid "70 % säker" ⇒ UNDERMOD — också ett kalibreringsfel (du vet mer än du vågar säga). Felen är SPEGLADE: övertro gör prognoser värdelösa för beslut, undertro gör dem ospelbara. Talebs Fooled by Randomness tillför brusaxiomet: i en liten serie kan även den välkalibrerade träffa fel av ren slump — därför mäts kalibrering över många omgångar, aldrig över den senaste.\n3️⃣ HISTORIEN OCH KOPPLINGEN — Bernsteins Against the Gods berättar hur sannolikhetstänkandet överhuvudtaget blev ett verktyg (från hasardborden till riskmåtten): kalibrering är dess praktiska arv — att skilja "jag tror" från "jag är säker" med ett tal. Och kopplingen till övriga monster i detta lager: förväntningsanalysen ger LÄSNINGEN (vad står i priset), gapet ger HÄNDELSEN (tecknet mot förväntan) — kalibreringen ger TRÄNINGEN som gör dig bättre på båda, omgång efter omgång.\n\nI kategorin katalysator finns ${katAntal} kurser — kalibreringskursen (${kt02 ? kt02.minuter + " min" : "i registret"}) innehåller övningsupplägg; bokkursen Against the Gods (${gods ? gods.minuter + " min" : "i registret"}) bakgrunden. Som alltid: detta är utbildning i en metod — inga prognoser, inga placeringstips.` +
          kallradFler(kallor),
        amne: "kalibrering",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Förväntningsanalys", lank: "/kurser/kt-02-forvantningsanalys-och-kalibrering", ikon: "🎯", beskrivning: "Övningen: förväntan före, facit efter" },
          { text: "Bokmastern: Against the Gods", lank: "/kurser/against-the-gods", ikon: "🎲", beskrivning: "Bernstein — sannolikhetens historia" },
          { text: "Bokmastern: Fooled by Randomness", lank: "/kurser/fooled-by-randomness", ikon: "🧭", beskrivning: "Taleb — bruset bakom träffarna" },
          { text: "Bokmastern: Expectations Investing", lank: "/kurser/expectations-investing", ikon: "📚", beskrivning: "Förväntningarna som träningsunderlag" },
          { text: "Vad är förväntningsanalys?", lank: "fragor:" + encodeURIComponent("vad är förväntningsanalys?"), ikon: "🎯", beskrivning: "Läsningen som kalibreras — detta lagret" },
        ],
        motfraga: { text: "Vad är förväntningsanalys?", kategori: "katalysator" },
        fordjupa: { text: k.titel, lank: "/kurser/kt-02-forvantningsanalys-och-kalibrering" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre förväntningsdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltForvantningsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of FÖRVÄNTNINGSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
