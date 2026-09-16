/**
 * AI-MENTORN 2.0 — RISKDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 11, s6-u1).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de sjutton tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + extra, makro, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, agande, redovisningsdjup, djup,
 * historia, lonsamhetsdjup, tsdjup, skattedjup och syskonet beteendedjup som
 * skrevs i samma fönster):
 *   1. Skuldfällan (rk-03-skuldfalla primär + ks-03-skuldens-anatomi +
 *      rk-04-likviditetskris + st-01-soliditet-och-rantetackning) — när
 *      skuldens STRUKTUR gör normala svängningar till existenshot
 *   2. Svarta svanar (rk-12-black-swanrisk primär + the-black-swan +
 *      fooled-by-randomness + km-033-tailrisk-hedging) — Talebs tre kriterier
 *      och varför modellerna missar det extremt osannolika
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (720 kärnord LIVE-lästa ur samtliga
 * sexton lager med den riktiga matcharen; verktyg/_s6u1-sond-omg11.mjs):
 * "vad är skuldfällan?", "vad är en skuldfälla?", "vad är räntetäckningsgrad?",
 * "vad är refinansieringsrisk?", "vad är covenants?", "vad är en svart svan?"
 * och "vad är black swan?" är helt fria (NULL genom hela kedjan) och samtliga
 * planerade kärnord ligger UTANFÖR felstavningstoleransen mot varje
 * syskonkärnord (närhetsdiffen: INGA träffar). ÄMNESLUCKA: kategorin
 * RISKHANTERING är registrets största enskilda kursfamilj utan eget lager
 * (15 rk-kurser) — samma lucktyp som lönsamhetsdjup-syskonet fann i
 * LÖNSAMHET. Första avsågna kandidater som DOG i sonden: regulatorisk risk
 * och tail risk (basens risk-monster äger dem), sunk cost, dunning-kruger
 * och halo-effekten (basens beteende-monster), dividend aristocrats, payout
 * ratio och speciella utdelningar (basens utdelnings-monster), covered
 * calls, protective puts och black-scholes (nästa-lagret), kapitalallokering
 * (basen), orderbok och nätmäklare (basen). Beteendefamiljerna som
 * syskonet beteendedjup tog i samma fönster (bekräftelsefälla, ankareffekt,
 * mental accounting) var FRIA i min sond men påtagna på disk när valet
 * slutfördes — riskdjup är komplement, inte konkurrent. Varje svar bär FYRA
 * källor med numrerad Källor-rad + FYRA kurslänkar + en levande fragor:-
 * knapp — noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt, testfallen H/I
 * bevisar båda vägarna):
 *   • Basen äger RISK-GRUNDORDEN (risk, tail risk, regulatorisk risk — dess
 *     risk-monster svarar på dem): detta lagrets kärnord är FAMILJEORDEN
 *     basens uppslag saknar (skuldfälla, räntetäckningsgrad, refinansiering,
 *     covenants, löptid, svart svan, black swan, svansrisk). Källor och
 *     kurslänkar FÅR peka på basens kärnordskurser (km-033-tailrisk-hedging
 *     är här endast KÄLLA, aldrig kärnord) — källägande ≠ kärnordsägande
 *     (emission/V19-precedensen från kapitalmekanik-lagret).
 *   • Makro-lagret äger ränte-GRUNDORDEN inklusive "räntetäckning" ("vad är
 *     räntetäckning?" fångas av makro, bevisat i sonden) — detta lager äger
 *     endast sammansättningen "räntetäckningsgrad" (makro matchar den inte
 *     inom tolerans; "vad är räntetäckningsgrad?" är HELT fritt i sonden).
 *   • Kapitalstrukturens grundord (skuldsättningsgrad, soliditet) ägs av
 *     basens variabeluppslag — skuldfälle-svaret nämner soliditeten som
 *     GRANNMÅTT i text utan att bära den som kärnord; st-01-kursen är KÄLLA.
 *   • Historia-lagret äger krasch-HISTORIEN (1929, tulpanmanin) — svan-
 *     svaret hänvisar historiskt utan kärnordsanspråk på deras område.
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som tsdjup-lagrets
 * "gann"-kur och lönsamhetsdjupets "roic"-notis):
 *   1. KORTORDSKUREN — "taleb" (5 tecken, tål 1 fel) ligger ett stavfel
 *      från det vanliga svenska ordet "talen" och är därför MEDVETET struket
 *      som kärnord (tsdjup-precedensen: namnet bärs av fraserna "svart svan"
 *      / "black swan" och av boktitlarna i källorna). "vem är taleb?" förblir
 *      null och går till API-flödet.
 *   2. "svarta"-KOLLISIONEN — basens "borja"-monster äger kärnordet "starta"
 *      (6 tecken, tål 1 fel) som ligger exakt ett fel från "svarta":
 *      formuleringen "vad är svarta svanar?" fångas därför av basen FÖRE
 *      detta lager (bevisat i sonden, diagnostiserat till starta↔svarta).
 *      Fraserna "svarta svanar"/"svarta svanen" bärs ändå som kärnord (exakt
 *      frasmatchning kan inte fånga främmande ord) — men den kanoniska
 *      frågan är "vad är en svart svan?" som är HELT fri. Inget detta lager
 *      kan göra åt basens beteende: det existerade före leveransen.
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och var
 * död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det. Detta
 * lager kopplas in SIST — och testfall L läser widgetens kedjerad
 * MEKANISKT ur filen (artonde lager i ordning + import) så att "lager
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
 *     ?? svaraLokaltExtra(q, KURSREGISTER)
 *     ?? svaraLokalt(q, KURSREGISTER)
 *     ?? svaraLokaltNasta(q, KURSREGISTER)
 *     ?? svaraLokaltKapitalmekanik(q, KURSREGISTER)
 *     ?? svaraLokaltSektor(q, KURSREGISTER)
 *     ?? svaraLokaltCase(q, KURSREGISTER)
 *     ?? svaraLokaltPraktik(q, KURSREGISTER)
 *     ?? svaraLokaltPortfoljgrund(q, KURSREGISTER)
 *     ?? svaraLokaltAgande(q, KURSREGISTER)
 *     ?? svaraLokaltRedovisningsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltDjup(q, KURSREGISTER)
 *     ?? svaraLokaltHistoria(q, KURSREGISTER)
 *     ?? svaraLokaltLonsamhetsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltTsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltSkattedjup(q, KURSREGISTER)
 *     ?? svaraLokaltBeteendedjup(q, KURSREGISTER)
 *     ?? svaraLokaltRiskdjup(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla andra lämnar null
 * på. Omvänt vaktar testfall I på att dessa frågor INTE fångas av kedjan
 * utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur riskmått och skuldstrukturer
 * BERÄKNAS och LÄSAS som metod — inga köp-/säljsignaler, inga
 * placeringstips, inga omdömen om enskilda bolag eller värdepapper.
 * Exempel med siffror är aritmetiska illustrationer av mekaniken, aldrig
 * utfästelser om avkastning eller varningar om enskilda titlar.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-riskdjup.mjs kan köra filen direkt i Node. Alla
 * källkurser (rk-03-skuldfalla, ks-03-skuldens-anatomi, rk-04-
 * likviditetskris, st-01-soliditet-och-rantetackning, rk-12-black-
 * swanrisk, the-black-swan, fooled-by-randomness, km-033-tail-risk-
 * hedging) finns i KURSREGISTER (verifierat i 358-registret — spår 5:s
 * rebake lägger TILL kurser, slugarna består; kursKalla faller tillbaka
 * på "Läroplanen" om ett framtida register läcker en slug).
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

// ── De 2 riskdjupfrågorna ───────────────────────────────────────────────────

export const RISKDJUP_MONSTER: FragMonster[] = [
  {
    id: "skuldfalla",
    karnord: [
      "skuldfälla", "skuldfällan", "skuldfällor", "skuldfall",
      "räntetäckningsgrad", "refinansiering", "refinansieringsrisk",
      "covenants", "löptid",
    ],
    starkord: [
      "skuld", "ränta", "lån", "amortering", "hävstång", "kris",
      "bolag", "bindningstid", "bank", "förfaller",
    ],
    bygga: (reg) => {
      const riskAntal = reg.filter((r) => r.kategori === "RISKHANTERING").length;
      const kallor = [
        kursKalla(reg, "rk-03-skuldfalla", "Läroplanen — riskdjupet, skuldens struktur och fällans mekanik"),
        kursKalla(reg, "ks-03-skuldens-anatomi", "Läroplanen — löptider, bindning och covenants"),
        kursKalla(reg, "rk-04-likviditetskris", "Läroplanen — grannkrisen: när kassan sinar"),
        kursKalla(reg, "st-01-soliditet-och-rantetackning", "Läroplanen — svensk stabilitetsstandard och täckningsmåttet"),
      ];
      const k = kallor[0];
      const rk03 = reg.find((r) => r.slug === "rk-03-skuldfalla");
      return {
        text:
          `Skuldfällan är inte "att ha skuld" — det är när skuldens STRUKTUR gör att en normal svängning (högre ränta, svagare år, snäva kredittider) räcker för att hela balansräkningen ska tryta. Skillnaden mellan hävstång och fälla är struktur, inte storlek (allt nedan är utbildning i hur mekaniken läses — ingen kommentar om något enskilt bolag):\n\n1️⃣ DE TRE BYGGSTENARNA I FÄLLAN — LÖPTID (när skulden förfaller till betalning): många korta lån som alla förfaller samma år skapar en refinansieringsvägg — bolaget måste förnya (refinansiera) hela beloppet på en dag, till vilken ränta marknaden då bjuder. BINDNINGSTID (hur länge räntan är låst): bunden ränta ger beräknbarhet, rörlig ger känslighet mot varje räntebeslut. COVENANTS (villkoren i låneavtalet): målkrav — till exempel på soliditet eller räntetäckningsgrad — som ger banken rätt att säga upp eller omförhandla om de bryts; en bruten covenant kan förvandla en betalningsförmögenhet till ett likviditetsproblem över en natt.\n2️⃣ SÅ RÄKNAS RÄNTETÄCKNINGSGRADEN — rörelseresultat ÷ räntekostnad. Aritmetisk illustration: ett bolag med 500 mkr i lån och 60 mkr i rörelseresultat. Vid 2 % ränta kostar skulden 10 mkr per år ⇒ täckningsgraden 60 ÷ 10 = 6x — bred marginal. Förfaller lånet och måste refinansieras vid 6 % kostar samma skuld 30 mkr per år ⇒ 60 ÷ 30 = 2x, och 20 mkr per år har försvunnit ur kassaflödet UTAN att något i verksamheten försämrats en krona. Det är den mekaniken som gör refinansieringsrisken till skuldens dolda klangbotten — och det är därför löptidsprofilen (förfall per år, i noterna) är viktigare än räntesiffran ensam.\n3️⃣ FÄLLAN MOT HÄVSTÅNGEN — hävstång är ett verktyg: lånat kapital som avkastar mer än det kostar förstärker avkastningen. Fällan uppstår när tre saker klaffar: korta löptider, rörlig ränta och ett cykelkänsligt resultat som sjunker JUST när räntan stiger. Därför läses skuld alltid tillsammans med grannmåtten — soliditeten (basens variabeluppslag), likviditetskrisens kaskad (syskonämnet här) och känslighetsanalysens stress av balansräkningen.\n\nI kategorin riskhantering finns ${riskAntal} kurser — skuldfälle-kursen (${rk03 ? rk03.minuter + " min" : "i registret"}) går igenom löptidsprofiler, covenants och refinansieringsmoment steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "skuldfalla",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Skuldfälla", lank: "/kurser/rk-03-skuldfalla", ikon: "🪤", beskrivning: "Fällans mekanik och varningstecknen" },
          { text: "Kursen: Skuldens anatomi", lank: "/kurser/ks-03-skuldens-anatomi", ikon: "🏗️", beskrivning: "Löptider, bindning och covenants" },
          { text: "Kursen: Likviditetskris", lank: "/kurser/rk-04-likviditetskris", ikon: "💧", beskrivning: "Grannkrisen — när kassan sinar" },
          { text: "Kursen: Soliditet & räntetäckningsgrad", lank: "/kurser/st-01-soliditet-och-rantetackning", ikon: "⚖️", beskrivning: "Det svenska täckningsmåttet" },
          { text: "Vad är svarta svanar?", lank: "fragor:" + encodeURIComponent("vad är en svart svan?"), ikon: "🦢", beskrivning: "Det extremt osannolika — detta lagret" },
        ],
        motfraga: { text: "Vad är svarta svanar?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-03-skuldfalla" },
      };
    },
  },
  {
    id: "svartsvan",
    karnord: [
      "svart svan", "svarta svanar", "svarta svanen",
      "black swan", "svansrisk", "oförutsedda händelser",
    ],
    starkord: [
      "taleb", "kris", "risk", "sannolikhet", "slump",
      "extrem", "prognos", "modell", "efterrationalisering",
    ],
    bygga: (reg) => {
      const riskAntal = reg.filter((r) => r.kategori === "RISKHANTERING").length;
      const kallor = [
        kursKalla(reg, "rk-12-black-swanrisk", "Läroplanen — riskdjupet, svarta svanar och svansriskens natur"),
        kursKalla(reg, "the-black-swan", "Bokmastern — Nassim Nicholas Taleb: The Black Swan"),
        kursKalla(reg, "fooled-by-randomness", "Bokmastern — Taleb: Fooled by Randomness, slumpens dolda roll"),
        kursKalla(reg, "km-033-tailrisk-hedging", "Läroplanen — svansrisk-hedging som KATEGORI (kärnordet tail risk ägs av basen)"),
      ];
      const k = kallor[0];
      const rk12 = reg.find((r) => r.slug === "rk-12-black-swanrisk");
      return {
        text:
          `En svart svan är den händelse som (1) ligger utanför den normala förväntan — inget i gårdagens data pekar mot den, (2) får enorm konsekvens när den väl inträffar, och (3) i efterhand framstår som nästan självklar — "man borde ha sett det". Kriterierna formulerades av Nassim Nicholas Taleb, och just det tredje — efterrationaliseringen — är poängen: berättelsen om att det var förutsägbart skapas FÖRST efteråt (allt nedan är utbildning i hur begreppet används — inga prognoser):\n\n1️⃣ VARFÖR MODELLERNA MISSAR — mycket finansmatematik bygger antaganden om normalfördelning: massan av utfall samlas kring medelvärdet och extremerna blir försumbara svansar. Men marknadernas stora rörelser kommer inte från mitten — de kommer från svansarna, där normalfördelningens sannolikheter är som minst. Ett mått som standardavvikelsen (volatilitetskursernas grund) är byggt för mitten och säger nästan ingenting om händelser sex standardavvikelser ut. Det är därför "extremt osannolikt enligt modellen" och "omöjligt" inte är samma sak — svansrisken (kategorin tail risk) är just risken i fördelningens svans.\n2️⃣ SLUMPENS ROLL — Talebs tidigare bok Fooled by Randomness tillför det pedagogiska motgiftet: vi är skickliga på att se MÖNSTER där det bara är brus, och duktiga analyser förväxlas ofta med tur. Historievalet i kedjan (tulpanmanin, 1929) visar mönstret genom seklen: händelsen chockar, sedan skrivs den in i berättelsen som oundviklig.\n3️⃣ LITTERATURENS HANTERING — som UTBILDNINGSKATEGORIER, aldrig råd: robusthet (strukturer som tål slagen snarare än förutsäger dem — skuldfälle-kursens löptidstänkande är släkt här), marginaler (Grahams säkerhetsmarginal — värderingsmetodernas kurs), och svansrisk-hedging (km-033) som studerar hur optionskontrakt TEORETISKT kan försäkra mot svansar — till ett pris, som kursen räknar på. Gemensamt: fokus flyttas från att GISSA händelsen till att bära konsekvensen.\n\nI kategorin riskhantering finns ${riskAntal} kurser — black swan-kursen (${rk12 ? rk12.minuter + " min" : "i registret"}) går igenom kriterierna, de historiska fallen och svansmåttens gränser. Som alltid: detta är utbildning i hur begreppet läses — inga prognoser, inga placeringstips.` +
          kallradFler(kallor),
        amne: "svartsvan",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Black swan-risk", lank: "/kurser/rk-12-black-swanrisk", ikon: "🦢", beskrivning: "Kriterierna, fallen, svansmåttens gränser" },
          { text: "Bokmastern: The Black Swan — Taleb", lank: "/kurser/the-black-swan", ikon: "📚", beskrivning: "Begreppets källa, alla kapitel" },
          { text: "Bokmastern: Fooled by Randomness — Taleb", lank: "/kurser/fooled-by-randomness", ikon: "🎲", beskrivning: "Slumpen, mönstren och bruset" },
          { text: "Kursen: Tail-risk hedging", lank: "/kurser/km-033-tailrisk-hedging", ikon: "🛡️", beskrivning: "Att försäkra mot svansar — med pris" },
          { text: "Vad är skuldfällan?", lank: "fragor:" + encodeURIComponent("vad är skuldfällan?"), ikon: "🪤", beskrivning: "Robusthetens släkting — detta lagret" },
        ],
        motfraga: { text: "Vad är skuldfällan?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-12-black-swanrisk" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två riskdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltRiskdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of RISKDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
