/**
 * AI-MENTORN 2.0 — SEKTORLÄSNING-FÖRHANDSFRÅGOR (spår 6, omgång 23, s6-u2).
 *
 * Två källmärkta förhandsfrågor ovanpå de femtio committade lagren —
 * sektorläsningens ENERGI- och TELEKOM-sidor:
 *   1. Energibolagsläsningen ("hur analyserar jag ett energibolag?") —
 *      oljepriset som cykel-drivrutin + reserverna som sinande tillgång
 *      (km-043 primär + se-17 skog + se-18 rederi + se-09 bil som källor)
 *   2. Telekomläsningen ("hur analyserar jag ett telekombolag?") —
 *      abonnemangskassan, nätets kapitalintensitet och licensen
 *      (km-046 primär + se-08 media + se-10 flyg + se-12 spel som källor)
 *
 * REGISTERBÄRNING: sondens genomräkning (omgång 23) visade SEKTORANALYS som
 * ett av spårets största mentorväglösa block — 9 oådda kurser av 29. Denna
 * leverans aktiverar 8 av dem: km-043 + km-046 som primära och se-08, se-09,
 * se-10, se-12, se-17, se-18 som källor (varje källa en äkta slug i
 * KURSREGISTER; kursKalla faller tillbaka på "Läroplanen" om ett framtids-
 * register läcker en slug). Medvetet kvar: se-11-krypto (extremrisk-familjen
 * lämnas öppen för framtida lager).
 *
 * ÄMNESVAL EFTER SOND I TRE RONDER (verktyg/_s6u2-sond-omg23.mjs +
 * -sond2- + -sond3-, otrackade; slutläget 50 motorer / 1 453 kärnord LIVE
 * + diskutläsning; anspråk data/vakten/auto-s6-1789814130065-s6-u2-ansprak.md
 * FÖRE byggstart):
 *   • Rond 1 genomräkning — 274 av 446 kurser nådda; BOKMASTER 60 störst
 *     (lämnas till syskonen), PRAKTISKA CASE 16, AK1TS FÖRDJUPNING 12,
 *     SEKTORANALYS 9. Indikatorfamiljen (RSI/MACD/Bollinger) DÖDADES i
 *     rond 2: basens teknisk analys-monster äger hela familjen; case-
 *     metodiken DÖDADES: case-modulen äger kortordet «case» exakt.
 *   • Rond 2 — energioch telekomformuleringarna (7 st) samtliga NULL
 *     genom hela kedjan; territoriumkoll mot sektorsyskonen: sektor-modulen
 *     äger generiska sektor/bransch + bank + fastighet, sektordjup äger
 *     saas/halvledare/försvar, sektorskola2 äger pharma/detaljhandel/
 *     logistik — energi + telekom fritt land.
 *   • Rond 3 GRÖN för det frysta paret: 0 kärnordsgrannar mot 1 453
 *     (ett undantag: «kraftbolag» grannar med sektorskola2:s «fraktbolag»
 *     på tavstånd 2 och PROTOTYPEN STJÖL «vad är fraktbolag?» — kraft-
 *     orden STRYKS som kärnord, funktionellt bevisat i sonden), 0 stölder
 *     mot kedjans 129 kanoniska frågor, mina 10 kanoniska + varianter NULL.
 *
 * DOKUMENTERADE GRÄNSER (rond 2–3:s fynd — inte mina kärnord):
 *   • «oljepris»/«oljepriset» = makro-familjens begrepp (mk-10-kursen);
 *     här ENDAST stärkord, aldrig kärnord — «vad är oljepriset?» landar
 *     null genom hela kedjan i dag och får API-flödets pedagogik.
 *   • «kraftbolag»/«kraftbolagen» strukna — fraktbolag-grannen
 *     (sektorskola2:s logistikmonster, tavstånd 2; «vad är fraktbolag?»
 *     stals av prototypen innan strykningen).
 *   • Formuleringar med ordet «tänker» ("energisektorn hur tänker man?")
 *     fångas av sektor-modulens bank-monster («banker» ligger tavstånd 1
 *     från «tänker» efter diakritisk rens) — kedjans befintliga egenskap,
 *     deras territorium, oförändrad av detta lager.
 *   • «vad är en moat?»-knappen landar hos extra-lagret (deras monster) —
 *     knapparnas frågor ska alltid landa hos en ägare, aldrig null.
 *
 * Aritmetiken i båda svar (påhittade tal, maskinellt omräknade i
 * regressionstestets D-fall):
 *   • Energi: produktion 100 000 fat/dag × 365 = 36,5 miljoner fat/år;
 *     tre prislägen mot brytpris 45: (40 − 45) × 36,5 = −182,5 ·
 *     (70 − 45) × 36,5 = +912,5 · (110 − 45) × 36,5 = +2 372,5 miljoner
 *     dollar; svängen 2 372,5 − (−182,5) = 2 555,0; reserverna 547,5 ÷ 36,5
 *     = 15,0 år; elprisspegeln 0,50 × 2,0 = 1,0 mot 2,50 × 2,0 = 5,0 mdr
 *     kronor = femdubblad intäkt på oförändrad anläggning.
 *   • Telekom: 2,0 miljoner abonnenter × 350 = 700 Mkr/månad × 12 =
 *     8 400 Mkr = 8,4 mdr/år; churn 1,2 % × 2,0 miljoner = 24 000/månad =
 *     288 000/år; capex 1 400 ÷ 8 400 = 16,7 % (vart sjätte intäktskrona);
 *     spektrum 2 200 ÷ 20 = 110 Mkr/år; utdelningen 3,50 ÷ 70,00 = 5,0 %
 *     direktavkastning, payout 1 960 ÷ 2 800 = 70,0 %.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * syskonet u1:s konvertibel, kedjans 50:e motor; trefönster-presedensen från
 * omgång 20–22) och kan därför aldrig stjäla en fråga från ett tidigare
 * lager; det fångar bara frågor som alla lager före det lämnar null på.
 * Omvänt vaktar testfall H på att dessa frågor INTE fångas av kedjan utan
 * detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur energi- och telekom-läsning
 * DEFINIERAS, RÄKNAS och LÄSES i rapporter — inga köp-/säljsignaler, inga
 * placeringstips, inga omdömen om enskilda börsbolag (exemplens bolag är
 * påhittade och deras tal konstruerade för övningens skull).
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-sektorlasning.mjs kan köra filen direkt i Node.
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

// ── De 2 sektorläsning-frågorna ─────────────────────────────────────────────

export const SEKTORLASNING_MONSTER: FragMonster[] = [
  {
    id: "energibolagslasning",
    karnord: [
      "energibolag", "energibolaget", "energibolagen", "energibolagens",
      "energisektorn", "energisektor", "oljebolag", "oljebolaget",
      "oljebolagen", "oljeaktie", "oljeaktier", "elbolag", "elbolagen",
      "energianalys",
    ],
    // NOTERA gränserna (sondrond 3): «kraftbolag»/«kraftbolagen» STRUKNA —
    // grannar med sektorskola2:s «fraktbolag» (tavstånd 2; prototypen
    // stal «vad är fraktbolag?» före strykningen); «oljepris» är makro-
    // familjens begrepp och får ENDAST stå bland stärkorden.
    starkord: [
      "energi", "olja", "oljepris", "oljepriset", "råolja", "förnybar",
      "förnybara", "vindkraft", "solkraft", "kärnkraft", "elpris",
      "elpriset", "raffinaderi", "reserver", "borrning", "upptäckt",
      "brytpris", "brytningskostnad",
    ],
    bygga: (reg) => {
      const sekAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "km-043-energisektorn", "Läroplanen — olje-major mot förnybar; oljepriset som cykel-drivrutin"),
        kursKalla(reg, "se-17-skogssektorn", "Läroplanen — massans cykel och ägd råvara: råvaran som växer tillbaka"),
        kursKalla(reg, "se-18-rederi-och-shipping", "Läroplanen — fraktens cykel och fartyget som kapital"),
        kursKalla(reg, "se-09-bil", "Läroplanen — el och disruption: efterfrågeskiftet mellan sektorerna"),
      ];
      const k = kallor[0];
      const km043 = reg.find((r) => r.slug === "km-043-energisektorn");
      return {
        text:
          `Energibolag läses annorlunda än de flesta bolag: intäkterna följer en råvarupris-cykel som bolaget själv inte styr — läsningen börjar därför i CYKELN, inte i bolaget (allt nedan är utbildning i hur metoden fungerar — påhittade tal, inga placeringstips):\n\n1️⃣ CYKEL-DRIVRUTINEN — RÅVARUPRISET BESTÄMMER. Övningsexemplet med påhittade tal: ett producerande bolag pumpar 100 000 fat olja per dag = 100 000 × 365 = 36,5 miljoner fat per år, med ett brytpris på 45 dollar per fat. Tre prislägen, samma bolag: botten 40 dollar ger (40 − 45) × 36,5 = −182,5 miljoner dollar i förlust; normalnivå 70 dollar ger (70 − 45) × 36,5 = +912,5 miljoner; högkonjunktur 110 dollar ger (110 − 45) × 36,5 = +2 372,5 miljoner. Svängen mellan botten och topp: 2 372,5 − (−182,5) = 2 555,0 miljoner dollar — på ett och samma bolag, samma fält, samma personal. Det enda som rörde sig var råvarapriset. Därför är första övningen i energi-läsning att PRISPLACERA cykeln: var i cykeln står oljepriset historiskt, och vad händer med kassaflödet på nästa halva? (Oljepriset som makro-drivrutin är sin egen läsning — se kursen nedan.)\n2️⃣ RESERVERNA — TILLGÅNGEN SOM SINAR. Olja är en sinande tillgång: varje sålt fat gör bolaget ett fat fattigare. Reserverna 547,5 miljoner fat med oförändrad produktion 36,5 miljoner per år ger 547,5 ÷ 36,5 = 15,0 års livslängd. Frågan som följer: ersätts reserverna? Borrning och upptäckt kostar kapital — ett bolag som producerar utan att hitta nytt är en blomma som blommar ut. Här ger sektorns grannar motbilder: skogsbolaget äger en råvara som VÄXER TILLBAKA (massans cykel, källan nedan), och rederiet äger kapital som CYKLAR i värde med fraktpriset (fartyget som kapital, källan nedan) — oljebolaget är ensamt om tillgången som bara sinar.\n3️⃣ TVÅ VÄRLDAR — MAJORN MOT FÖRNYBAREN. Energi-sektorn är två olika företagstyper med samma skylt. OLJE-MAJORN: integrerad kedja (letning, borrning, raffinaderi, pump), kassan byggs för att bära cykelns botten, utdelningen är cykeltestet. FÖRNYBAREN: anläggningen är kapitalet (vind, sol) och intäkten följer EL-priset — övningsexemplet: en park som producerar 2,0 miljarder kilowattimmar ger 0,50 × 2,0 = 1,0 miljard kronor vid elpris 50 öre men 2,50 × 2,0 = 5,0 miljarder vid 2,50 — femdubblad intäkt på en oförändrad anläggning, pris-cykeln igen, i ny dräkt. Mellan världarna står elförskjutningen (källan nedan): transportens efterfrågan på olja möter bilarnas övergång till el, samtidigt som elens efterfrågan växer. Läsövningen: skilj PRIS-TAGET-bolag (resultatet följer råvaran) från ANLÄGGNINGS-bolag (resultatet följer kapitalet och elpriset) — multiplarna betyder olika saker i de två världarna.\n\nI sektoranalys-kategorin finns ${sekAntal} kurser — huvudkursen (${km043 ? km043.minuter + " min, " + km043.niva.toLowerCase() + " nivå" : "i registret"}) äger hela energi-läsningen med övningar. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "energibolagslasning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Energi-sektorn", lank: "/kurser/km-043-energisektorn", ikon: "🔗", beskrivning: "Olje-major mot förnybar" },
          { text: "Kursen: Skogssektorn", lank: "/kurser/se-17-skogssektorn", ikon: "🌲", beskrivning: "Råvaran som växer tillbaka" },
          { text: "Kursen: Rederi och shipping", lank: "/kurser/se-18-rederi-och-shipping", ikon: "🚢", beskrivning: "Fartyget som kapital" },
          { text: "Hur analyserar jag ett telekombolag?", lank: "fragor:" + encodeURIComponent("hur analyserar jag ett telekombolag?"), ikon: "📶", beskrivning: "Syskonläsningen: nätet" },
          { text: "Vad är en moat?", lank: "fragor:" + encodeURIComponent("vad är en moat?"), ikon: "🏰", beskrivning: "Försvarsmurarnas grunder" },
        ],
        motfraga: { text: "Hur analyserar jag ett telekombolag?", kategori: "sektorlasning" },
        fordjupa: { text: k.titel, lank: "/kurser/km-043-energisektorn" },
      };
    },
  },
  {
    id: "telekomlasning",
    karnord: [
      "telekom", "telekombolag", "telekombolaget", "telekombolagen",
      "telekomsektorn", "telekomsektor", "telekomaktie", "telekomaktier",
      "telekombranschen", "teleoperatör", "teleoperatören", "mobiloperatör",
    ],
    starkord: [
      "abonnemang", "abonnent", "abonnenter", "nät", "nätet", "fiber",
      "mobilt", "uppkoppling", "täckning", "utbyggnad", "basstation",
      "spektrum", "frekvens", "arpu", "churn",
    ],
    bygga: (reg) => {
      const sekAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "km-046-telekomsektorn", "Läroplanen — infrastrukturens försvarsmur, kapitalintensitet, utdelning"),
        kursKalla(reg, "se-08-media", "Läroplanen — innehåll och streaming: röret mot innehållet i röret"),
        kursKalla(reg, "se-10-flyg", "Läroplanen — kapitalintensiva nätverk med fasta kostnader"),
        kursKalla(reg, "se-12-spel", "Läroplanen — licens och regulation: tillståndets ekonomi"),
      ];
      const k = kallor[0];
      const km046 = reg.find((r) => r.slug === "km-046-telekomsektorn");
      return {
        text:
          `Telekombolag är infrastruktur-rörelser: en kassa av abonnemang ovanpå ett nät som är dyrt att bygga, dyrt att kopiera och permanent att underhålla (allt nedan är utbildning i hur metoden fungerar — påhittade tal, inga placeringstips):\n\n1️⃣ ABONNEMANGSKASSAN — DEN ÅTERKOMMANDE INTÄKTEN. Övningsexemplet med påhittade tal: 2,0 miljoner abonnenter betalar i snitt 350 kronor per månad = 2,0 miljoner × 350 = 700 miljoner kronor per månad, × 12 = 8 400 miljoner = 8,4 miljarder kronor per år — innan en enda ny tjänst sålts. Intäkten per abonnent och månad kallas ARPU och är telekom-läsningens första snabbmått. Sedan kommer läckan: flyttar 1,2 procent av abonnenterna per månad går 1,2 % × 2,0 miljoner = 24 000 abonnenter bort varje månad = 288 000 per år — bolaget måste ersätta 288 000 kunder BARA för att stå still. Övningen: läs ARPU och churn tillsammans — stigande ARPU med stigande churn är ett bolag som mjökar sina kvarvarande, inte ett som växer.\n2️⃣ NÄTET — KAPITALET SOM BYGGS EN GÅNG, UNDERHÅLLS ALLTID. Näten kostar kapital att bygga och kapital att hålla vid liv. Övningsexemplet: underhåll och utbyggnad (capex) på 1 400 miljoner kronor per år mot omsättningen 8 400 miljoner ger 1 400 ÷ 8 400 = 16,7 procent — exakt vart sjätte intäktskrona återinvesteras i nätet. Detta är telekom-läsningens skiljetecken mot lättare rörelser: stora avskrivningar, ständigt capex, och en skillnad mellan resultat och kassaflöde som MÅSTE förstås. Flyg-bolaget är spegelbilden (källan nedan): nätverk av fasta kostnader där planen ska flyga även med tomma säten — telekomets basstation sänder även med tom bandbredd.\n3️⃣ FÖRSVARSMUREN, LICENSEN OCH UTDELNINGEN. Varför överlever dessa kapitaltunga bolag? Att duplicera ett helt nät är så dyrt att sällan någon gör det — infrastrukturens försvarsmur (moat-begreppet förklaras hos sin egen fråga, knappen nedan). Nätet kräver dessutom TILLSTÅND: frekvenserna auktioneras ut, övningsexemplet spektrum för 2 200 miljoner kronor med licens i 20 år = 2 200 ÷ 20 = 110 miljoner kronor per år i rak tillståndskostnad — licensens ekonomi är samma som spelbolagets (källan nedan), fast auktionerat. När kassan är stabil och utbyggnaden i fas blir telekom klassiska utdelningsbolag: exempelutdelningen 3,50 kronor per aktie på kursen 70,00 = 5,0 procent direktavkastning, med 1 960 miljoner utdelat av 2 800 miljoner vinst = 70,0 procent payout — läsningen: hur mycket av utdelningen bärs av kassan, och vad händer med den vid nästa nätgeneration? Gränsen mot medie-bolagen (källan nedan): telekom äger RÖRET, media äger INNEHÅLLET — två olika affärer som ofta blandas ihop.\n\nI sektoranalys-kategorin finns ${sekAntal} kurser — huvudkursen (${km046 ? km046.minuter + " min, " + km046.niva.toLowerCase() + " nivå" : "i registret"}) äger hela telekom-läsningen med övningar. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "telekomlasning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Telekom-sektorn", lank: "/kurser/km-046-telekomsektorn", ikon: "🔗", beskrivning: "Infrastruktur, kapital, utdelning" },
          { text: "Kursen: Media", lank: "/kurser/se-08-media", ikon: "🎬", beskrivning: "Röret mot innehållet" },
          { text: "Kursen: Spel", lank: "/kurser/se-12-spel", ikon: "🎰", beskrivning: "Licensens ekonomi" },
          { text: "Hur analyserar jag ett energibolag?", lank: "fragor:" + encodeURIComponent("hur analyserar jag ett energibolag?"), ikon: "🛢️", beskrivning: "Syskonläsningen: cykeln" },
          { text: "Vad är en moat?", lank: "fragor:" + encodeURIComponent("vad är en moat?"), ikon: "🏰", beskrivning: "Försvarsmurarnas grunder" },
        ],
        motfraga: { text: "Hur analyserar jag ett energibolag?", kategori: "sektorlasning" },
        fordjupa: { text: k.titel, lank: "/kurser/km-046-telekomsektorn" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två sektorläsning-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltSektorlasning(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of SEKTORLASNING_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
