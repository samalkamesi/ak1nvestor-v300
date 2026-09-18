/**
 * AI-MENTORN 2.0 — TILLVÄXTDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 21, s6-u2).
 *
 * Två källmärkta förhandsfrågor ovanpå de fyrtiofyra committade lagren —
 * tillväxtens GRÄNSER och tillväxtens MOTORER:
 *   1. S-kurvan och mättnaden ("vad är s-kurvan?") — tillväxtens gränser
 *      (tx-04 primär + tx-01 + v02 + v01 som källor)
 *   2. Prismix och mixeffekten ("vad är prismix?") — intäkten dekompone-
 *      rad i volym, pris och mix (tx-02 primär + v03 + tx-05 som källor)
 *
 * REGISTERBÄRNING: HELA TILLVÄXT-kategorien var mentorväglös utom en kurs
 * (1/8 nådd enligt sondens genomräkning; tx-03 nådd sedan tidigare) — denna
 * leverans länkar kategorin fullt ut 1/8 → 8/8: tx-04 + tx-02 som primära
 * + tx-01-organisk-mot-forvarvad-tillvaxt, tx-05-tillvaxtens-forsta-lasning,
 * v01-forsaljningstillvaxt, v02-arr-tillvaxt, v03-intaktsdiversifiering som
 * källor — varje källa en äkta slug i KURSREGISTER (kedjetestets E-fall
 * vakar; kursKalla faller tillbaka på "Läroplanen" om ett framtidsregister
 * läcker en slug).
 *
 * ÄMNESVAL EFTER SOND I FYRA RONDER (verktyg/_s6u2-sond-omg21.mjs +
 * _s6u2-sond2-omg21.mjs + två riktade omkoller, otrackade; slutläget
 * 45 motorer / 1 346 kärnord LIVE-lästa ur src/ med den riktiga matchern):
 *   • Rond 1 DÖDADE MOAT-familjen: extra-motorn äger moat/vallgrav-orden
 *     ("vad är en moat?" fångas av svaraLokaltExtra; 9 stöldfångster) —
 *     MOAT-kurser kan bara bäras som KÄLLOR (V19-precedensen).
 *   • Rond 2 frös TILLVÄXT-familjen som grön — MEN sondbasen saknade
 *     BASMOTORN (importraden "svaraLokalt, fallbackSvar" med två namn
 *     föll utanför funktionskartans regex; rond 3:s omkoll med basen
 *     inkluderad fann kollisionerna nedan). Sondestmetoden är nu korrigerad
 *     (kartrapporten matchar importlistor med flera namn).
 *   • Rond 3 DÖDADE som kärnord: «organisk tillväxt» och «förvärvad
 *     tillväxt» (basens tillvaxt-monster äger båda EXAKT plus orden
 *     organiskt/förvärvat/tillväxten — deras svar, deras territorium;
 *     tx-01 bärs här ENDAST som KÄLLA enligt V19, deras fråga bärs som
 *     knapp), «volym pris och mix»/«volym och pris»/«pris och volym»
 *     (basens kostnad-monster äger naket «pris»), «arr», «återkommande
 *     intäkter», «intäktsdiversifiering» (basens — v02/v03 här KÄLLOR),
 *     «tillväxtens tak» (tillväxten = basens), «skurvan» sammansatt
 *     (stjäl avkastningskurvans «kurvan inverteras»-frågor, tavstånd 1).
 *   • Rond 4 GRÖN för det frysta paret: 0 kärnordsgrannar mot 1 346
 *     kedjekärnord, kanoniska frågor NULL genom kedjan, 0 främmande i
 *     stöldprovet i båda riktningarna.
 *
 * DOKUMENTERADE GRÄNSER (rond 2–3:s strykningar — inte mina kärnord):
 *   • Extra-motorn äger moat/vallgrav OCH «organisk MOT förvärvad» (deras
 *     moat-kärnord fångar det korta ordet "mot" på tavstånd 1).
 *   • Tsdjup äger volymanalys/volymprofil; handelsdagen inlåsning
 *     (inklämning, tavstånd 2); sektorskola2 like-for-like — deras frågor
 *     bärs som knappar och landar aldrig null (kedjans A-fall vakar).
 *   • «vad är organisk tillväxt?» och «vad är volym pris och mix?» landar
 *     hos BASMOTORN (deras monster [tillvaxt]/[kostnad]) — knapparna i
 *     svaren länkar medvetet dit: eleven får deras svar, inte null.
 *
 * Aritmetiken i båda svar (påhittade tal, maskinellt omräknade i
 * regressionstestets D-fall):
 *   • S-kurvan: marknaden 40 miljarder × 1,15⁵ = 40 × 2,0114 = 80,5
 *     miljarder på fem år; bolagsandelen 10 % ger 4,0 → 8,05 miljarder;
 *     mättnadstaket 100 miljarder = 2,5× från dagens marknad (100 ÷ 40)
 *     och andelens tak 10 miljarder = 2,5× från 4,0; andelen 60 % har
 *     som mest (100 − 60) ÷ 60 = 67 % kvar; kurvåren +2 +8 +20 +35 +28
 *     +15 +6 procent med toppen år 4.
 *   • Prismix: 1 000 × 10,00 = 10 000 → 1 060 × 10,50 = 11 130 (+11,3 %)
 *     dekompilerat 600 + 500 + 30 = 1 130; mixfallet 2 000 × 10 + 500 × 40
 *     = 40 000 → 2 200 × 10 + 460 × 40 = 40 400 (+1,0 %) med genomsnitts-
 *     pris 16,00 → 15,19 (−5,1 %) trots +6,4 % enheter ((2 660 − 2 500)
 *     ÷ 2 500).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * syskonet u3:s koncernläsning, kedjans 44:e motor; trefönster-presedensen
 * från omgång 20) och kan därför aldrig stjäla en fråga från ett tidigare
 * lager; det fångar bara frågor som alla lager före det lämnar null på.
 * Omvänt vaktar testfall I på att dessa frågor INTE fångas av kedjan utan
 * detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur tillväxtens gränser och motorer
 * DEFINIERAS, MÄTS och LÄSES i rapporter — inga köp-/säljsignaler, inga
 * placeringstips, inga omdömen om enskilda börsbolag (exemplens bolag är
 * påhittade och deras tal konstruerade för övningens skull).
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-tillvaxtdjup.mjs kan köra filen direkt i Node.
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

// ── De 2 tillväxtdjup-frågorna ──────────────────────────────────────────────

export const TILLVAXTDJUP_MONSTER: FragMonster[] = [
  {
    id: "s-kurvan-mattnad",
    karnord: ["s-kurvan", "mättnad", "mättnaden", "marknadsmättnad", "utrymmesräkning"],
    // NOTERA gränserna (sondrond 3): «tillväxtens gränser»/«tillväxtens tak»
    // innehåller ordet «tillväxten» som basens tillvaxt-monster äger exakt;
    // «skurvan» sammansatt stjäl avkastningskurvans kurvan-frågor — båda
    // kasserade som kärnord, ämnet bärs av fraserna ovan + texten.
    starkord: [
      "kurva", "kurvan", "gräns", "gränser", "tak", "taket", "marknad",
      "marknaden", "utrymme", "adresserbar", "mätt", "avmattning",
    ],
    bygga: (reg) => {
      const txAntal = reg.filter((r) => r.kategori === "TILLVÄXT").length;
      const kallor = [
        kursKalla(reg, "tx-04-tillvaxtens-granser", "Läroplanen — gränserna: S-kurvan, mättnaden och utrymmesräkningen"),
        kursKalla(reg, "tx-01-organisk-mot-forvarvad-tillvaxt", "Läroplanen — källan: kärnans andel mot köpta bolag"),
        kursKalla(reg, "v02-arr-tillvaxt", "Läroplanen — återkommande intäkter: motorn som också möter ett tak"),
        kursKalla(reg, "v01-forsaljningstillvaxt", "Läroplanen — basen: försäljningstillväxtens grundläsning"),
      ];
      const k = kallor[0];
      const tx04 = reg.find((r) => r.slug === "tx-04-tillvaxtens-granser");
      return {
        text:
          `S-kurvan är tillväxtens typiska form: långsam start, acceleration, avmattning — och till slut mättnad, när marknaden som växer i börjar ta slut (allt nedan är utbildning i hur gränsen RÄKNAS och LÄS — påhittade exempel, inga placeringstips):\n\n1️⃣ KURVANS FORM — VARFÖR TILLVÄXT ALDRIG ÄR EN RAK LINJE. Nya produkter och marknader följer nästan alltid samma procentvisa mönster, övningsexemplet med påhittade tal: år ett +2 procent, år två +8, år tre +20, år fyra +35, år fem +28, år sex +15, år sju +6. Accelerationen stiger till toppen år fyra — sedan kommer avmattningen, inte som en olycka utan som aritmetik: ju större andel av marknaden som redan köpt, desto färre nya kunder återstår. Det är detta fenomen kurvan BESKRIVER: tillväxtens procent brukar falla av egen tyngd långt innan bolaget gjort något fel.\n2️⃣ UTRYMMESRÄKNINGEN — HUR STORT KAN DET BLI. Gränsen går att räkna baklänges. Exemplet: en marknad värd 40 miljarder som växer 15 procent per år i fem år når 40 × 2,0114 = 80,5 miljarder (1,15 upphöjt till 5 = 2,0114). Ett bolag med 10 procent av marknaden omsätter idag 4,0 miljarder; håller det andelen är det 8,05 miljarder år fem. Men mättnadstaket sätter ramen: är marknadens tak 100 miljarder är hela återstående utrymmet 100 ÷ 40 = 2,5 gånger dagens marknad — och för bolagets andel samma sak, 10 miljarder som tak = 2,5 gånger från 4,0. Utrymmesräkningen gör två saker tydliga: hur många X kvar finns i berättelsen, och att X alltid är ÄNDLIGT. En bolagsandel på 60 procent av sin nisch har som mest (100 − 60) ÷ 60 = 67 procent kvar att erövra — och varje ny kund där kostar mer än den förra.\n3️⃣ SÅ LÄSER DU KURVAN I RAPPORTEN. Tre övningar: (1) räkna utrymmet först — adresserbar marknad idag, antaget tak, och antalet X däremellan, INNAN tillväxtprocenten imponerar; (2) leta accelerationen i perioddata — deklarerad tillväxt per kvartal eller år visar var på kurvan bolaget står (stigande tal tidigt, fallande tal senare); (3) skilj på gränser — en MARKNAD kan mättas medan BOLAGET fortfarande växer genom att ta andelar, och återkommande intäkter (arr-modellen, källan nedan) är inte heller oändliga: de möter sitt tak när adressatmarknaden är täckt. Frågan om tillväxtens KÄLLA — organisk eller köpt — är syskonläsningen: förvärv kan flytta kurvans start men aldrig ta bort mättnaden (knappen nedan).\n\nI tillväxt-kategorin finns ${txAntal} kurser — huvudkursen (${tx04 ? tx04.minuter + " min, " + tx04.niva.toLowerCase() + " nivå" : "i registret"}) äger hela gränsläsningen med övningar. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "s-kurvan",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Tillväxtens gränser", lank: "/kurser/tx-04-tillvaxtens-granser", ikon: "🔗", beskrivning: "S-kurvan och mättnaden" },
          { text: "Kursen: Organisk vs förvärvad tillväxt", lank: "/kurser/tx-01-organisk-mot-forvarvad-tillvaxt", ikon: "🔀", beskrivning: "Källan: kärna eller köp" },
          { text: "Kursen: ARR-tillväxt", lank: "/kurser/v02-arr-tillvaxt", ikon: "🔄", beskrivning: "Motorn med tak" },
          { text: "Vad är prismix?", lank: "fragor:" + encodeURIComponent("vad är prismix?"), ikon: "🧮", beskrivning: "Syskonläsningen: motorerna" },
          { text: "Vad är organisk tillväxt?", lank: "fragor:" + encodeURIComponent("vad är organisk tillväxt?"), ikon: "🔍", beskrivning: "Källan förklaras" },
        ],
        motfraga: { text: "Vad är prismix?", kategori: "tillväxt" },
        fordjupa: { text: k.titel, lank: "/kurser/tx-04-tillvaxtens-granser" },
      };
    },
  },
  {
    id: "prismix-mixeffekt",
    karnord: [
      "prismix", "mixeffekt", "prisvolym", "volympris", "volympris mix",
      "produktmix", "mixanalys", "intäktsmotorer", "tillväxtmotorer",
    ],
    // NOTERA gränserna (sondrond 3): «volym pris och mix», «volym och pris»
    // och «pris och volym» innehåller det nakna ordet «pris» som basens
    // kostnad-monster äger; «volymanalys» är tsdjupets — frågan med ordet
    // pris landar medvetet hos basen och länkas som knapp från svaret.
    starkord: [
      "volym", "volymer", "mix", "enhet", "enheter", "genomsnittspris",
      "intäkt", "intäkter", "dekompone", "sammansättning", "billig", "dyr",
    ],
    bygga: (reg) => {
      const txAntal = reg.filter((r) => r.kategori === "TILLVÄXT").length;
      const kallor = [
        kursKalla(reg, "tx-02-volym-pris-och-mix", "Läroplanen — motorerna: volym, pris och mix i dekomponeringen"),
        kursKalla(reg, "v03-intaktsdiversifiering", "Läroplanen — motorns bärighet: en kund, en produkt, en motor"),
        kursKalla(reg, "tx-05-tillvaxtens-forsta-lasning", "Läroplanen — första läsningen: årtal, procent och tjocka filtar"),
      ];
      const k = kallor[0];
      const tx02 = reg.find((r) => r.slug === "tx-02-volym-pris-och-mix");
      return {
        text:
          `Prismix och mixeffekten är tillväxtens dolda tredje motor: intäkten är alltid antal sålda enheter gånger priset per enhet — men när bolaget säljer FLERA produkter till OLIKA pris blir även SAMMANSÄTTNINGEN av det som säljs en motor i sig (allt nedan är utbildning i hur dekomponeringen GÅR TILL — påhittade exempel, inga placeringstips):\n\n1️⃣ IDENTITETEN — INTÄKT ÄR VOLYM GÅNGER PRIS. Övningsexemplet med påhittade tal: år ett säljer bolaget 1 000 enheter à 10,00 kronor = 10 000 kronor. År två: 1 060 enheter à 10,50 kronor = 11 130 kronor — tillväxten (11 130 − 10 000) ÷ 10 000 = 11,3 procent. Dekomponerad: volymens andel (1 060 − 1 000) × 10,00 = 600 kronor; prisets andel (10,50 − 10,00) × 1 000 = 500 kronor; samverkans lilla term 60 × 0,50 = 30 kronor. Kontrollen: 600 + 500 + 30 = 1 130 kronor — summan stänger mot totalen. Tre intäktsmotorer alltså: fler enheter, högre pris, eller båda på en gång.\n2️⃣ MIXEFFEKTEN — MOTORN SOM ALDRIG STÅR I RADEN. Två produkter: A à 10 kronor och B à 40 kronor. År ett: 2 000 A + 500 B = 40 000 kronor, viktat genomsnittspris 40 000 ÷ 2 500 = 16,00 kronor. År två: 2 200 A + 460 B = 40 400 kronor — totalt bara +1,0 procent. Men enhetsvolymen steg (2 660 − 2 500) ÷ 2 500 = 6,4 procent! Fångsten är produktmixen: genomsnittspriset föll till 40 400 ÷ 2 660 = 15,19 kronor, ett fall med 5,1 procent — försäljningen har sklirrat mot den billiga produkten. Det är mixeffekten: säljer bolaget MER av det billiga och MINDRE av det dyra kan totalen stå stilla med stigande volymer — eller tvärtom växa på pris med fallande volymer. Mixen säger därför något om VEM som betalar: prishöjningar som volymen bär ut är den starkaste motorn (prismakt är moat-territorium — knappen nedan), volympåslag genom rabatt äter ofta marginalen.\n3️⃣ SÅ LÄSER DU DET I RAPPORTEN. Tre övningar: (1) volym- och prisuppgifter — många delårsrapporter redovisar sålda enheter eller jämförbara volymer; finner du dem inte, fråga dig varför (tillväxtens första läsning — årtal, procent och tjocka filtar — är nybörjarkursen, knappen nedan); (2) produkt- och kundfördelningen — intäktsdiversifieringen avslöjar om en enda motor bär allt (en produkts prislista eller en enda kunds volym, källan nedan); (3) dekomponeringstestet — när tillväxten redovisas, pröva räkna isär den i volym och pris; en tillväxt som bara är volym genom rabatt är svagare än den ser ut, och en som bara är pris kan vara på väg mot mättnadens gräns (syskonläsningen, knappen nedan).\n\nI tillväxt-kategorin finns ${txAntal} kurser — huvudkursen (${tx02 ? tx02.minuter + " min, " + tx02.niva.toLowerCase() + " nivå" : "i registret"}) äger hela dekomponeringen med övningar. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "prismix",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Volym, pris och mix", lank: "/kurser/tx-02-volym-pris-och-mix", ikon: "🔗", beskrivning: "Tillväxtens tre motorer" },
          { text: "Kursen: Intäktsdiversifiering", lank: "/kurser/v03-intaktsdiversifiering", ikon: "🌐", beskrivning: "Motorns bärighet" },
          { text: "Kursen: Tillväxtens första läsning", lank: "/kurser/tx-05-tillvaxtens-forsta-lasning", ikon: "📗", beskrivning: "Årtal och procent" },
          { text: "Vad är s-kurvan?", lank: "fragor:" + encodeURIComponent("vad är s-kurvan?"), ikon: "📐", beskrivning: "Syskonläsningen: gränsen" },
          { text: "Vad är en moat?", lank: "fragor:" + encodeURIComponent("vad är en moat?"), ikon: "🏰", beskrivning: "Prismaktens grund" },
        ],
        motfraga: { text: "Vad är s-kurvan?", kategori: "tillväxt" },
        fordjupa: { text: k.titel, lank: "/kurser/tx-02-volym-pris-och-mix" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två tillväxtdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltTillvaxtdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of TILLVAXTDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
