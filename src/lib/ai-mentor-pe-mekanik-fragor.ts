/**
 * AI-MENTORN 2.0 — PE-MEKANIK-FÖRHANDSFRÅGOR (spår 6, omgång 20, s6-u1).
 *
 * En källmärkt förhandsfråga ovanpå de fyrtioett föregående lagren —
 * kedjans fråga för private equity:s ARITMETIK: IRR-mekaniken,
 * förvärvsmaskinens hävstång och utfasningarnas vattenfall
 * (pe-02 primär + pe-03 + pe-04 + ib-02 + The Outsiders).
 *
 * Aktiverar FYRA mentorväglösa kurser — KATEGORIN PRIVATE EQUITY &
 * INVESTMENTBOLAG blir fullt länkad (5/9 → 9/9):
 * pe-02-utfasningar-och-irr-mekanik · pe-03-forvarvsmaskinen ·
 * pe-04-den-privata-agarsidan · ib-02-substansens-kvalitet — plus
 * boken the-outsiders som femte källa (spårets mål "fler kurslänkar
 * per svar", utan API-kostnad).
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u1-sond-omg20.mjs + -sond2- + sondronden
 * i sessionen, otrackade diskbevis; anspråk
 * data/vakten/auto-s6-1789746301683-u1-ansprak.md FÖRE byggstart): hela
 * familjen var NULL genom kedjans 40 motorer / 113 monsters («vad är
 * IRR?» · «vad är internränta?» · «hur räknar man ut internränta?» ·
 * «vad är internräntemetoden?» · «vad är en förvärvsmaskin?» · «hur
 * fungerar en förvärvsmaskin?» · «vad är LBO?» · «vad är leveraged
 * buyout?» · «vad är en buyout?» · «vad är privata bolag?» · «vad är
 * utfasningar?» · «vad är substansens kvalitet?») och samtliga 27
 * planerade kärnord RENTA mot 1 230 unika syskonkärnord (motorns
 * tavstånd).
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; V19-precedensen —
 * källägande ≠ kärnordsägande):
 *   • Basen äger PE-HELHETSfrågan och fondstrukturen («vad är private
 *     equity?» FÅNGAS av basen, amne "private equity", pe-01 — sondbevisat;
 *     bär även «vad är ett onoterat bolag?»-familjen) — detta lager bär
 *     ENDAST mekanik-/aritmetik-vokabulärerna. Basens knapp bärs här som
 *     fragor:-länk (tidigare-lager-kravet).
 *   • Redovisningsdjupet äger exit-familjen («vad är exit?» · «vad är en
 *     exit-multiple?» FÅNGAS av dem — sondbevisat); exit nämns ENDAST i
 *     text, aldrig som kärnord.
 *   • Nästa-lagret äger DCF/optioner; kapitalmekaniken emissionsfamiljen —
 *     IRR är NPV-speglens ränta men orden är disjunkta (internränta rent
 *     bevisat; «kassaflödesdiskontering» används ej som kärnord).
 *   • Djup-lagret äger multipel-orden i singular («värderingsmultipel») —
 *     multiplerna förekommer här ENDAST som stärkord och räkneposter i
 *     kursexempelens aritmetik.
 *   • Riskdjupet äger covenants/löptid (pe-03 K4 korsar dem som KÄLLA till
 *     nedscenariot — orden kasseras som kärnord, nämns i text).
 *   • Stabilitetsdjupet äger räntetäckningsgraden som måttsord — kursens
 *     2,8→2,2-räkning återges som kursexempel i text, inte kärnord.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx): detta lager ligger SIST (efter
 * sektorskola2) och kan därför aldrig stjäla en fråga från ett tidigare
 * lager; det fångar bara frågor som alla lager före det lämnar null på.
 * Omvänt vaktar testfall I på att dessa frågor INTE fångas av kedjan utan
 * detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur fondmekanikerna DEFINIERAS
 * och RÄKNAS — inga köp-/säljsignaler, inga placeringstips, inga
 * omdömen om enskilda fonder eller värdepapper. Aritmetiken återger
 * kursernas egna publicerade räkneexempel (IRR:s 100→200 på tre år =
 * 26,0 procent och 100→400 på tio år = 14,9 procent · förvärvsmaskinens
 * 1 000 = 600 lån + 400 eget med ränta 36 och utfall 1 030 = 2,6x mot
 * 1,4x · vattenfallets 2 200 = 1 000 + 400 + 800 med GP 160 och LP
 * 2 040) — och nedscenariot (täckning 2,8 → 2,2) är genomgående en
 * varningsläsning, aldrig en uppmuntran.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-pe-mekanik.mjs kan köra filen direkt i Node.
 * Alla källkurser (pe-02-utfasningar-och-irr-mekanik, pe-03-forvarvsmaskinen,
 * pe-04-den-privata-agarsidan, ib-02-substansens-kvalitet, the-outsiders)
 * finns i KURSREGISTER (verifierat mot levande register; kursKalla faller
 * tillbaka på "Läroplanen" om ett framtida register läcker en slug).
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

// ── Den 1 pe-mekanikfrågan ─────────────────────────────────────────────────

export const PE_MEKANIK_MONSTER: FragMonster[] = [
  {
    id: "pe-mekanik",
    karnord: [
      "irr",
      "internränta", "internräntan", "internräntemetoden", "internräntemetod",
      "irr-mekanik",
      "förvärvsmaskin", "förvärvsmaskinen", "förvärvsmaskiner",
      "lbo", "leveraged buyout", "buyout",
      "hävstångsköp", "hävstångsköpet",
      "utfasningar", "utfasningarna",
      "utfasningsvinst", "utfasningsvinster",
      "fondlivslängd",
      "vattenfallet", "distribution waterfall",
      "carried interest", "carry",
      "föredragen avkastning",
      "realiserat värde",
      "dpi",
    ],
    starkord: [
      "fond", "fonden", "fondens", "fonder", "kapital", "avkastning",
      "multipel", "multiplar", "utfasning", "exit", "skuld", "skulden",
      "belåning", "hävstång", "hävstången", "ränta", "räntan", "amortering",
      "amortera", "kassaflöde", "kassaflöden", "insats", "insatt", "private",
      "equity", "onoterat", "onoterade", "bolag", "bolaget", "bolagens",
      "distribution", "distribuera", "utdelning", "utdelningar", "tålamod",
      "ebitda", "lp", "gp", "investerare", "realisera", "realisering",
      "nuvärde", "utfall", "lån", "lånat", "bank", "kraven", "krona",
    ],
    bygga: (reg) => {
      const peAntal = reg.filter((r) => r.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG").length;
      const kallor = [
        kursKalla(reg, "pe-02-utfasningar-och-irr-mekanik", "Läroplanen — PRIVATE EQUITY & INVESTMENTBOLAG: klockan, dörrarna och vattenfallet"),
        kursKalla(reg, "pe-03-forvarvsmaskinen", "Läroplanen — PRIVATE EQUITY & INVESTMENTBOLAG: skulden på bolaget och de tre motorerna"),
        kursKalla(reg, "pe-04-den-privata-agarsidan", "Läroplanen — PRIVATE EQUITY & INVESTMENTBOLAG: bolagens värld utanför börsen"),
        kursKalla(reg, "ib-02-substansens-kvalitet", "Läroplanen — PRIVATE EQUITY & INVESTMENTBOLAG: vad substanssiffran innehåller"),
        kursKalla(reg, "the-outsiders", "Bokmastaren — Thorndike om kapitalallokatorerna som ägde frågan om tidpunkten"),
      ];
      const k = kallor[0];
      const pe2 = reg.find((r) => r.slug === "pe-02-utfasningar-och-irr-mekanik");
      return {
        text:
          `Private equity:s aritmetik är tre mekanismer som alla räknas för hand: internräntan som gör tid till tal, hävstångsköpet som lägger skulden på bolaget, och utfasningens vattenfall som fördelar det som betalas ut. Allt nedan är utbildning i mekanismerna — inga råd om att placera i fonder eller bolag:\n\n1️⃣ IRR — RÄNTAN SOM NOLLAR NUVÄRDET — IRR (internal rate of return, internräntan) är den räntesats som ger ett innehavs samtliga kontantflöden nuvärdet noll: den årliga förrentning som förbinder insatt kapital med utfall. Utan mellanbetalningar finns en sluten formel: en insats på 100 som lämnar fonden som 200 efter tre år har IRR = (200 ÷ 100)^(1 ÷ 3) − 1 = 1,260 − 1 = 26,0 procent per år — multipeln 2,0 gånger insatt kapital. Spegnelexemplet: samma insats 100, utfall 400 — men först efter tio år: IRR = 4^(1 ÷ 10) − 1 = 1,149 − 1 = 14,9 procent per år, multipeln 4,0 gånger. IRR-rankningen säger det första innehavet; pengarna säger det andra för den som hade tålamodet — inget av måtten ljuger, de svarar på olika frågor: IRR frågar hur hårt kapitalet arbetade per år, multipeln hur mycket det blev totalt. Därför hör mellanbetalningarna till mekanikens kärna: säljs hälften tidigt och resten sent blandas två klockor i samma beräkning — ett tidigt litet inflöde lyfter IRR kraftigt även om den totala utdelningen är blygsam. Erfarna läsare frågar därför alltid efter de två talen bredvid varandra, IRR och multipel (eller total distribution), och branschens hårdaste mått är DPI — distributions to paid-in: andelen av inbetalat kapital som faktiskt betalats ut, där 1,0 betyder att investerarna fick tillbaka sitt kapital och allt därefter är verklig avkastning.\n2️⃣ FÖRVÄRVSMASKINEN — SKULDEN PÅ BOLAGET — ett hävstångsköp (leveraged buyout, LBO) finansieras till större del med skuld som står PÅ det förvärvade bolaget, inte på fonden: räntan betalas av bolagets kassaflöde före varje utdelning, och om året går sämre är det bolagets likviditet som ansträngs först. Kursens genomgående exempel: köpeskilling 1 000 miljoner kronor — tio gånger EBITDA 100 — finansierad med 600 i lån och 400 i eget kapital från fonden. Lånets ränta 6,0 procent: 600 × 0,06 = 36 per år. Kassaflödet före finansieringen: EBITDA 100, varav 20 går till underhåll och 10 i förenklad skatt — kvar 100 − 20 − 10 = 70; efter räntan 70 − 36 = 34 per år till amortering. Trappan är självförstärkande: med i snitt 40 i amortering per år står 600 − 5 × 40 = 400 kvar efter fem år, och räntan har fallit till 400 × 0,06 = 24 — varje år trappan håller blir nästa år lättare. Värdeskapandet har TRE motorer, och de är inte lika: resultatet (EBITDA växer 100 → 130 — hantverk och konjunktur), multipeln (10 → 11 — nästan helt marknadsväder) och amorteringen (600 → 400 — rent hantverk, varje amorterad krona är gjord oavsett börsens humör). Utfallsräkningen: pris 130 × 11 = 1 430, minus kvarvarande skuld 400 = 1 030 till det egna kapitalet — mot insatsen 400 är det 1 030 ÷ 400 = 2,6 gånger pengarna. Spegelfallet utan hävstång: samma bolag, samma utveckling, köpt helt med eget kapital — 1 430 ÷ 1 000 = 1,4 gånger. Samma bolag, samma år: hävstången gjorde 1,4x till 2,6x — och dess pris syns i nedscenariot: faller EBITDA från 100 till 80 blir räntetäckningsgraden 100 ÷ 36 = 2,8 → 80 ÷ 36 = 2,2, och kassaflödesutrymmet 80 − 20 − 10 = 50 ger bara 50 − 36 = 14 kvar till amortering — en femtedels resultatnedgång, för ett obelånat bolag en dålig period, blir här ett brutet lånevillkor med konkret pris. Hävstången flyttar gränsen för vad som räknas som kris.\n3️⃣ UTFASNINGARNA OCH VATTERFALLET — värdet är inte skapat förrän det lämnar fonden: det orealiserade värdet (NAV — förvaltarens egen uppskattning, aldrig prövat mot en köpare) är en berättelse, det realiserade (vad en utfasning faktiskt betalade, i pengar, efter avgifter) är ett faktum. Fyra dörrar ut ur portföljen, fyra prislogiker: börsintroduktionen (börsen betalar ofta högre multipler — med krav på redovisning och prospectus-ansvar), den strategiska köparen (betalar med synergierna i bagaget — kan bjuda högst, men processen är koncentrerad), den sekundära köparen (en annan fond som tar över — tålamodets restvärde, den vanligaste utgången när innehavet behöver mer tid än fondens livslängd erbjuder) och fortsättningsfordonet (förvaltaren behåller flaggskeppet i en ny farkost — löser klockan men flyttar frågan). Vem som får vad styrs av vattenfallet (distribution waterfall) — fondavtalets fördelningsordning, här i den klassiska whole-of-fund-trappan med genomräknat exempel: fonden fick in 1 000 från sina investerare och distribuerar totalt 2 200. Steg ett — retur av kapital: de inbetalade 1 000 återbetalas krona för krona innan någon annan delar. Steg två — föredragen avkastning (preferred return): investerarna har rätt till en basicskyddande ränta, ofta omkring 8 procent enkel ränta per år — på fem år 1 000 × 0,08 × 5 = 400. Steg tre — vinstdelningen: det återstående 2 200 − 1 000 − 400 = 800 delas med förvaltarens andel — carried interest, vanligen 20 procent: förvaltaren får 800 × 0,20 = 160, investerarna 640. Summering: investerarna totalt 1 000 + 400 + 640 = 2 040 (2,04x på inbetalat, innan avgifter), förvaltaren 160 i carry — plus de löpande förvaltningsavgifterna, som betalades oavsett hur det gick. Ordningen — inte procentsatserna — fördelar risken: tidiga utdelningar återbetalar kapital snabbt och driver IRR, medan carry:n växer först på totalen; de två måtten stramar åt varandra, och fondavtalets arkitektur är just den balansen.\n\nI kategorin private equity & investmentbolag finns ${peAntal} kurser — utfasningar och IRR-mekanik (${pe2 ? pe2.minuter + " min, " + pe2.niva.toLowerCase() + " nivå" : "i registret"}) är familjens kröningskurs: substansen (ib-01), fondstrukturen (pe-01), förvärvsåren (pe-03) och realiseringen (pe-02) bildar en hel cykel, och substansens kvalitet (ib-02) skiljer berättat värde från betalt. Som alltid: detta är utbildning i hur fondmekanikerna fungerar — inga placeringstips.` +
          kallradFler(kallor),
        amne: "pe-mekanik",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Utfasningar och IRR-mekanik", lank: "/kurser/pe-02-utfasningar-och-irr-mekanik", ikon: "⏳", beskrivning: "Dörrarna, vattenfallet och internräntans matte" },
          { text: "Kursen: Förvärvsmaskinen", lank: "/kurser/pe-03-forvarvsmaskinen", ikon: "⚙️", beskrivning: "Hävstångsköpets tre motorer" },
          { text: "Kursen: Den privata ägarsidan", lank: "/kurser/pe-04-den-privata-agarsidan", ikon: "🏝️", beskrivning: "Bolagens värld utanför börsen" },
          { text: "Kursen: Substansens kvalitet", lank: "/kurser/ib-02-substansens-kvalitet", ikon: "🔍", beskrivning: "Vad substanssiffran innehåller" },
          { text: "Vad är private equity?", lank: "fragor:" + encodeURIComponent("vad är private equity?"), ikon: "🏛️", beskrivning: "Fonden och strukturerna — basens private equity-lager" },
        ],
        motfraga: { text: "Vad är private equity?", kategori: "private equity" },
        fordjupa: { text: k.titel, lank: "/kurser/pe-02-utfasningar-och-irr-mekanik" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med pe-mekanik-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger SIST i
 * widgetens kedja och kan därför aldrig stjäla en fråga från tidigare
 * lager. Samma matchningssemantik som basmotorn: minst ett kärnord krävs,
 * poäng = kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret
 * vinner (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltPeMekanik(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of PE_MEKANIK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
