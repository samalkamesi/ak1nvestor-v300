/**
 * AI-MENTORN 2.0 — BALANSDJUP: LAGERVÄRDERINGEN + OBE SKATTADE RESERVER
 * (omgång 26, manifest auto-s6-1789890903364 — spår 6, byggare s6-u2,
 * 2026-09-20).
 *
 * Två källmärkta förhandsfrågor om balansräkningens två mest svenska
 * specialrader — varornas värde och skatteuppskovets tvillingpost — speglar
 * bk-07 (Lagret och lagervärderingen — balansräkningens termometer) och
 * bk-06 (Obeskattade reserver och avsättningar — balansräkningens tvegift):
 * BOKFÖRING & ÅRSREDOVISNING-kategorins två SISTA mentorväglösa kurser
 * (sond omgång 26, del 2: 349/464 nådda; kategorin hade exakt 2 öppna).
 * KATEGORIEFFEKT: 17/19 → 19/19 FULLT MENTORLÄNKAD.
 *
 *   1. LAGERVARDERING    (varornas värde — bk-07 primär; källor bk-03,
 *                          ln-02)
 *   2. OBESKATTADE-RESERVER (uppskovet + det justerade egna kapitalet —
 *                          bk-06 primär; källor km-049, v05-pb)
 *
 * ÄMNESVAL EFTER SOND I TRE RONDER (verktyg/_s6u2-sond-omg26.mjs +
 * _s6u2-sond2-omg26.mjs + rond 3-inline; anspråk data/vakten/
 * auto-s6-1789890903364-s6-u2-ansprak.md FÖRE byggstart):
 *   · Rond 1 (del 2): LAGER/BOKFÖRING-familjen HELT RENT genom kedjans
 *     62 motorer / 173 monsters / 1 816 kärnord — enda grannen
 *     «lageromsättningshastighet» → kapitalbindning/lageromsattning
 *     (STRYKS; hela omsättnings-formfamiljen lämnas deras — diafri gör
 *     «lageromsättning» identisk med deras «lageromsattning»).
 *   · Rond 2: hela NULL-testet för 8 kandidatfamiljer — LAGER och
 *     OBE SKATTADE bägge totalt RENTA; bf-13-arbitrage/RISK-adresserna/
 *     OPTIONS/ESG/LÖNSAMHET/KATALYSATOR/PE dokumenterade RENTA och
 *     medvetet lämnade öppna (dödade alternativ i anspråket).
 *   · Rond 3: 18 exakta kärnordskandidater mot ALLA lagers kärnord LIVE
 *     (diafri + redigeringsavstånd enligt motorns toleransplan): 18/18
 *     RENTA.
 *
 * STRUKNA kärnord (dokumenterade gränser):
 *   · "lagret"/"lager" — falskträfffarliga nakna kortord: «laget» ligger
 *     redigeringsavstånd 1 från «lagret» (hur ligger laget?-frågor) och
 *     «lagen» avstånd 1 från «lager» (juridikfrågor) — bärs ENDAST som
 *     stärkord; frågorna fångas i stället av fraserna «lagrets värde» och
 *     «lagret värt».
 *   · "lageromsättning" — kapitalbindningens «lageromsattning» är samma
 *     diafri-ord (känd fälla dokumenterad i sonden).
 *   · "eget kapital" — kapitalmekanikens kärnterritorium (multipel-
 *     precedenten); frasen «justerat eget kapital» är däremot trygg
 *     (substringskyddad i båda riktningarna).
 *   · "skatt"/"reserv" nakna — skattedjupets respektive
 *     likviditetsreservens (st-06) familjer.
 *   · "avsättning"/"avsättningar" nakna — BEVISAD STÖLDFARA i G-fallet:
 *     «avkastning»/«avkastningar» ligger redigeringsavstånd 2 (k→s, s→t)
 *     och toleransplanen för 10–11-bokstavsord är 2 — sex syskonfrågor
 *     («aktiens avkastning», «riskjusterad avkastning» …) fångades falskt
 *     i första testkörningen. KUREN: frasen «en avsättning» (fraser är
 *     exakta substrängar, immuna mot redigeringsavstånd) fångar
 *     «vad är en avsättning?»-formerna; naken plural «avsättningar?»
 *     lämnas åt widgetens narmasteKurser-fallback — samma dokumenterade
 *     gräns som multipelens nakna «p/s».
 *   · "balansräkning" naken — basens och redovisningsdjupens karta
 *     (bärs som stärkord).
 *
 * KEDJEPLACERING: 63:e motorn, wiread FÖRE marknadsrytm — deras
 * SIST-deklaration i widgeten + deras testfall L01 (sista ledet)
 * respekteras, multipel-precedensen följd (61:a → detta lager 62:a i
 * kompositionsordningen före SIST-ledet). Kärnorden är mekaniskt
 * disjunkta mot samtliga tidigare lager; verifieras av kedjetestets
 * fall G + detta lagers testfall K (kärnorden läses LIVE ur samtliga
 * src/lib/ai-mentor-*-fragor.ts vid varje körning) och testfall G/G2
 * (antistöld mot hela kedjan, härledd ur kärnorden).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som samtliga
 * syskonlager). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   … ?? svaraLokaltMultipel(q, KURSREGISTER)
 *     ?? svaraLokaltBalansdjup(q, KURSREGISTER)
 *     ?? svaraLokaltMarknadsrytm(q, KURSREGISTER)   ← SIST (deras deklaration)
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur posterna räknas, läses och
 * hänger ihop — ALDRIG uppmaning att köpa eller sälja något. Aritmetiken
 * bär tydligt markerade PÅHITTADE övningstal ur kursernas egna
 * övningsbolag (Kavla Kläder AB, Svea Ylle AB, Norrull Textil AB,
 * Norra Kraft AB — kursernas egna markör, följd ordagrant).
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-balansdjup.mjs kan köra filen direkt i Node.
 * Källkurserna (bk-07, bk-03, ln-02, bk-06, km-049, v05-pb) finns i
 * KURSREGISTER — inga fantomlänkar (testfall D vaktar).
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

/** Kategoriräknare — registerdrivna tal i svaret (testfall D2 vaktar). */
function bokforingAntal(register: RegisterRad[]): number {
  return register.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
}

/** Registerdrivna kursegenskaper — minuter och kapitel vid svarstid. */
function kursMinuter(register: RegisterRad[], slug: string): number {
  return register.find((r) => r.slug === slug)?.minuter ?? 24;
}
function kursKapitel(register: RegisterRad[], slug: string): number {
  return register.find((r) => r.slug === slug)?.kapitel ?? 6;
}

// ── De 2 balansdjup-frågorna ────────────────────────────────────────────────

export const BALANSDJUP_MONSTER: FragMonster[] = [
  {
    id: "lagervardering",
    karnord: [
      "lagervärdering", "nettoförsäljningsvärde", "lägsta värdets princip",
      "lägstavärderegeln", "lagerdagar", "lagerrullning", "lagergrottan",
      "fifo", "avfo", "lagrets värde", "lagret värt",
    ],
    starkord: ["lagret", "lager", "balansräkning", "bokförd", "nedskrivning", "värdera", "varv", "rea"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "bk-07-lagret-och-lagervarderingen", "Läroplanen — bokföring, lagret och lagervärderingen (BK-07)"),
        kursKalla(reg, "bk-03-kassaflodesrakningen", "Läroplanen — bokföring, lagerökningen som kontantutgång"),
        kursKalla(reg, "ln-02-resultatkvalitet-och-accruals", "Läroplanen — lönsamhet, nedskrivningarnas resultatkvalitet"),
      ];
      const k = kallor[0];
      const min = kursMinuter(reg, "bk-07-lagret-och-lagervarderingen");
      const kap = kursKapitel(reg, "bk-07-lagret-och-lagervarderingen");
      return {
        text:
          `Lagervärderingen svarar på balansräkningens mest praktiska fråga: vad är varorna i lagret värda när rapporten skrivs? Principen är försiktighet ärvd från 1930-talskriserna — värdet är det LÄGSTA av anskaffningsvärde (inköp plus kostnader till plats och skick: frakt, tull, inlagring) och nettoförsäljningsvärde (beräknat försäljningspris minus kvarvarande säljkostnader). Tre delar (alla övningstal PÅHITTADE, ur övningsbolag):\n\n1. PRINCIPEN I PRAKTIK — Kavla Kläder AB:s vinterjacka: anskaffningsvärde 800 kronor (inköp 760 + frakt och tull 40), butikspris 1 500, kvarvarande säljkostnad 150 ⇒ nettoförsäljningsvärde 1 500 − 150 = 1 350 överstiger 800 ⇒ lagret bokförs till 800. Misslyckas säsongen — reapris 690, säljkostnad 90 ⇒ nettoförsäljningsvärde 690 − 90 = 600 — slår försiktigheten till: nedskrivning 800 − 600 = 200 kronor per jacka, och 10 000 jackor = 2,0 miljoner kronor som träffar resultaträkningen direkt medan balansraden sjunker från 8,0 till 6,0 miljoner. Ordningen är läroplanens poäng: förlusten togs när den ANADES (reapriset hade svarat), inte när jackorna såldes. Och återföringsförbudet gör nedskrivningen enkelriktad — jackan som bärs vidare till 600 och säljs nästa säsong till 900 visar 300 kronor per styck i extra pappersvinst: året efter en nedskrivning ser resultaten bättre ut än affären var (ln-02:s resultatkvalitetsglasögon).\n2. RULLNINGEN — från stillbild till fart: Svea Ylle AB med sålda varors kostnad 1 800 miljoner per år och genomsnittslager (480 + 420) ÷ 2 = 450 miljoner snurrar 1 800 ÷ 450 = 4,0 varv per år = 365 ÷ 4,0 = 91 lagerdagar. Samma svar andra vägen: dagsförbrukningen 1 800 ÷ 365 ≈ 4,9 miljoner ger 450 ÷ 4,9 ≈ 91 dagar — två vägar till en sanning är nyckeltalets egen kontroll. Konkurrenten Norrull Textil AB med lagret 300 miljoner på samma volym snurrar 6,0 varv = 61 dagar och bär 450 − 300 = 150 miljoner mindre bundet kapital. Spektrat gör måttet levande: med dagsförbrukning 2 miljoner bär Butik A (lager 20 M) 10 dagar, Butik B (60 M) 30 dagar, Butik C (120 M) 60 dagar — och ett prisfall som drar ned nettoförsäljningsvärdena 10 procent kostar 2,0 · 6,0 · 12,0 miljoner: samma väder, sexfalt olika bördor.\n3. GROTTAN — varningssystemet: när lagret växer 20 procent på en försäljningstillväxt av 5 procent blir kvoten 20 ÷ 5 = 4,0, väl över tumregelströskeln 2,0. Följ kedjan: lagret 450 → 540 miljoner, rullningen faller 1 890 ÷ 540 = 3,5 varv ≈ 104 dagar, kassabindningen växer med 90 miljoner (bk-03:s lagring: kontantutgång FÖRE resultateffekt) — och ett kommande nettoförsäljningsvärdesfall på 5 procent bär 540 × 0,05 = 27 miljoner i nedskrivningar. Lagret växer FÖRE marginalfallet syns i resultaträkningen — därför kallas raden balansräkningens termometer, och läsordningen är alltid tre frågor: hur många dagar, vilket värde, vilken riktning.\n\nFIFO och AVFO (först-in-först-ut respektive genomsnittspris) är de vanligaste metoderna när varor köpts in till olika priser under året — FIFO låter de dyra senaste inköpen stanna kvar i lagret, AVFO jämnar ut svängningarna; metodvalet är i sig redovisningspolitik (bk-05:s formbara rum). Kategorin BOKFÖRING & ÅRSREDOVISNING (${bokforingAntal(reg)} kurser) äger djupet — detta är utbildning i bokföringsmekanik, aldrig råd om något bolag. Kursen: ${min} minuter · ${kap} kapitel.` +
          kallradFler(kallor),
        amne: "lagervardering",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Lagret och lagervärderingen", lank: "/kurser/bk-07-lagret-och-lagervarderingen", ikon: "🌡️", beskrivning: "Balansräkningens termometer — tre frågor, en läsordning" },
          { text: "Kursen: Kassaflödesräkningen", lank: "/kurser/bk-03-kassaflodesrakningen", ikon: "💧", beskrivning: "Lagerökningen som kontantutgång före vinsten" },
          { text: "Vad är obeskattade reserver?", lank: "fragor:" + encodeURIComponent("vad är obeskattade reserver?"), ikon: "⚖️", beskrivning: "Syskonraden — posten som är två saker samtidigt" },
        ],
        motfraga: { text: "Vad är obeskattade reserver?", kategori: "bokföring" },
        fordjupa: { text: k.titel, lank: "/kurser/bk-07-lagret-och-lagervarderingen" },
      };
    },
  },
  {
    id: "obeskattade-reserver",
    karnord: [
      "obeskattade reserver", "obeskattad reserv", "obeskattade", "skatteuppskov",
      "latent skatt", "justerat eget kapital", "en avsättning",
      "balansens tvegift",
    ],
    starkord: ["reserver", "skatt", "balansräkning", "substansvärde", "kapital", "pension", "garanti"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "bk-06-obeskattade-reserver-och-avsattningar", "Läroplanen — bokföring, obeskattade reserver och avsättningar (BK-06)"),
        kursKalla(reg, "km-049-bolagsskatt-206", "Läroplanen — skatt & juridik, bolagsskatten 20,6 procent"),
        kursKalla(reg, "v05-pb", "Läroplanen — värdering, P/B och det justerade kapitalet"),
      ];
      const k = kallor[0];
      const min = kursMinuter(reg, "bk-06-obeskattade-reserver-och-avsattningar");
      const kap = kursKapitel(reg, "bk-06-obeskattade-reserver-och-avsattningar");
      return {
        text:
          `Obeskattade reserver är den svenska balansräkningens mest förvirrande post — en rad som är eget kapital och skuld på samma gång. Den föds ur ett gränsvärde: bokföringen får periodisera kostnader efter matchningsprincipen, medan skatten beskattar inkomsten efter sina egna tidsregler; när bokförd och taxerad vinst skiljer sig år efter år ackumuleras differensen i reserven. I löpande drift uppför sig posten som eget kapital — pengar som stannar och kan arbetas — men den är samtidigt en latent skatteskuld som realiseras när vinsten lämnar bolaget genom utdelning eller nedläggning. Tre delar (övningstal PÅHITTADE; övningsuniversumets skattesats 20 procent, verkliga bolagsskatten 20,6 — km-049):\n\n1. SKATTEUPPSKOVET — Norra Kraft AB köper en maskin: bokförd avskrivning 20,0 Mkr/år men skattemässigt tillåten 40,0 det första året. Med intäkter 100,0 och kontanta kostnader 50,0: bokfört resultat före skatt 100,0 − 50,0 − 20,0 = 30,0; taxerad inkomst 100,0 − 50,0 − 40,0 = 10,0. Betald skatt 0,20 × 10,0 = 2,0 (skatten betalas på det taxerade), bokförd skattekostnad 0,20 × 30,0 = 6,0, bokfört netto 30,0 − 6,0 = 24,0. Kassaflödet 100,0 − 50,0 − 2,0 = 48,0 mot 44,0 utan acceleration — skillnaden 4,0 Mkr är exakt 0,20 × (40,0 − 20,0): skatteuppskovet, statens räntefria lån till bolaget. Samma år växer reserven med skillnaden mellan bokförd och taxerad vinst, 30,0 − 10,0 = 20,0 Mkr — en bokförd skuld till framtiden som ännu inte förfallit, ty när de skattemässiga avskrivningarna tar slut medan de bokförda fortsätter vänder klockorna och differensen beskattas tillbaka.\n2. DET JUSTERADE EGNA KAPITALET — substansläsningens svenska grundtal: rapporterat EK 180,0 Mkr + obeskattade reserver 250,0 (en fjärdedel av balansomslutningen 1 000,0) − latent skatt 0,20 × 250,0 = 50,0 ⇒ justerat 180,0 + 250,0 − 50,0 = 380,0 Mkr. På 10,0 miljoner aktier: 38,0 kronor per aktie justerat mot 18,0 rapporterat. Med aktien noterad till 30,0 blir P/B rapporterat 30,0 ÷ 18,0 = 1,67 — en substanspremie på två tredjedelar — medan P/B justerat blir 30,0 ÷ 38,0 = 0,79, en rabatt. Samma bolag, samma dag, samma kurs: första läsningen visar dyrt, andra billigt, och kvoten 1,67 ÷ 0,79 ≈ 2,1 gånger är ren reservgeometri. I internationella jämförelser är korrigeringen nödvändig — den utländska rapporten redovisar uppskjuten skatt öppet, och den svenska som inte justeras ser fattigare ut än den är (vr-06:s jämförelsebolag-läxa via v05).\n3. FÄLLORNA OCH AVSÄTTNINGARNA — (a) att läsa reserven som skuld ger falskt mörk bild: den betalar ingen ränta, kan inte sägas upp och realiseras först vid utdelning eller nedläggning; (b) att läsa den som fritt kapital är den spegelvända fällan: vid en riktig belastning — omstrukturering, vinster som lämnar bolaget — försvinner 20 procent i samma ögonblick posten behövs som buffert; (c) avsättningarna (pension, garanti, omstrukturering) är skulder av osäkert belopp eller tidpunkt, värderade till uppskattning: en garantiavsättning som inte rört sig på fem år kan vara överdimensionerad — parkerade vinstpengar som kan släppas tillbaka — eller ett tecken på att produkten blivit säkrare; noterna, inte balansraden, avgör. Kursens mästerskap är granskarens fem frågor till varje balansräkning med reserver.\n\nKategorin BOKFÖRING & ÅRSREDOVISNING (${bokforingAntal(reg)} kurser) äger djupet — detta är utbildning i hur posterna fungerar, aldrig råd om något bolag. Kursen: ${min} minuter · ${kap} kapitel.` +
          kallradFler(kallor),
        amne: "obeskattade-reserver",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Obeskattade reserver och avsättningar", lank: "/kurser/bk-06-obeskattade-reserver-och-avsattningar", ikon: "⚖️", beskrivning: "Balansräkningens tvegift — granskarens fem frågor" },
          { text: "Kursen: P/B (Price-to-Book)", lank: "/kurser/v05-pb", ikon: "📚", beskrivning: "Multipeln som behöver det justerade kapitalet" },
          { text: "Vad är lagervärdering?", lank: "fragor:" + encodeURIComponent("vad är lagervärdering?"), ikon: "🌡️", beskrivning: "Syskonraden — balansräkningens termometer" },
        ],
        motfraga: { text: "Vad är lagervärdering?", kategori: "bokföring" },
        fordjupa: { text: k.titel, lank: "/kurser/bk-06-obeskattade-reserver-och-avsattningar" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två balansdjup-mönstren — eller null
 * (då prövar widgeten nästa lager i kedjan). Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltBalansdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of BALANSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
