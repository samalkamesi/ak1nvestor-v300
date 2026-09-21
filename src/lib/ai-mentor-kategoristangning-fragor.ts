/**
 * AI-MENTORN 2.0 — KATEGORISTÄNGNINGS-FÖRHANDSFRÅGOR (s6-u3 försök 2, fönster
 * 32 i spår 6, manifest auto-s6-1789965330060, byggare 3/3).
 *
 * TRE källmärkta monsters som VAR OCH EN stänger sin kategori fullt:
 *   · BUDPROCESSEN ("hur fungerar en budprocess?" — dag noll, budtiden som
 *     sannolikhetsmaskin, acceptens nio tiondelar, avslagets väg hem)
 *     kt-09 BUDPREMIEN OCH BUDPROCESSEN primär — KATALYSATOR-familjens
 *     nionde och sista steg ⇒ KATALYSATOR 12/12 FULLT MENTORLÄNKAD.
 *   · DEN EKONOMISKA VINSTEN ("vad är EVA?" — NOPAT minus kapitalhyran,
 *     spridningen ROIC−WACC, tillväxtens två ansikten, värdebryggan)
 *     roic-05 DEN EKONOMISKA VINSTEN primär — LÖNSAMHET-familjens sista
 *     mentorväglösa steg ⇒ LÖNSAMHET 13/13 FULLT MENTORLÄNKAD.
 *   · FÖRSÄKRINGSSKRIVANDET ("vad är försäkringsskrivandet?" — motpartens
 *     stol, frekvensens frestelse, kontanttäckt mot naken, svansen)
 *     od-09 FÖRSÄKRINGSSKRIVANDET primär — OPTIONS & DERIVAT-familjens
 *     sista steg ⇒ OPTIONS & DERIVAT 13/13 FULLT MENTORLÄNKAD.
 *
 * ÄMNESVAL EFTER SOND (dokumenterad kedja):
 *   • u1:s anspråk lämnade kategoristängningarna åt u2/u3; u2 tog
 *     casepraktik; u3-försök 1 tog beteendefallor (18/23 → 23/23 — modulen
 *     + test + wiring finns i trädet, buret in av u1:s ride-alang-commit
 *     bd7cfe04, men barnet dog före kvittot ⇒ denna redispatch). Dessa tre
 *     kurser förblev lösa (sond 2026-09-21: 108 mentorlösa; kt-09, roic-05,
 *     od-09 bland dem).
 *   • u3-försök 1 listade kt-09 som DÖTT (handelsemotorn äger «budpremie»/
 *     «budpremien»/«budspreaden» som kärnord i avtalsmekaniken). Försök 2:s
 *     sond visar att RESTEN av budprocessens kärnordsfamilj är RENT:
 *     kursen aktiveras med ett monster som äger PROCESSEN, med premie-
 *     begreppets avtalssida som dokumenterad gräns i text.
 *
 * DOKUMENTERADE GRÄNSER (kursens/kursernas egna gränsdragning — bärs i TEXT):
 *   • budPREMIEN som avtalsförhandlingsbegrepp → handelsemotorns
 *     avtalsmekanik (kärnorden deras; aritmetiken 26,3 procent får härledas
 *     ur kursens exempel men ordet stjäls aldrig).
 *   • naket «option»/«optioner» → nästa-motorn (deras kärnord — sammansatta
 *     ord här: optionssäljare, optionsskrivande; «skriven säljoption»/
 *     «skriven köpoption» KASSERADE — delsträngskollision med optionsdjupets
 *     «säljoption»/«köpoption» enligt J-fallets fraskonvention, och i kedjan
 *     skuggade av dem oavsett).
 *   • «roic»/«wacc» nakna → lonsamhetsdjupet; «nopat»/«kapitalkostnad» →
 *     lonsamhetsdjupet (kärnord deras — här starkord).
 *   • «tidsvärde»/«inre värde» → optionsdjupet/nästa (kärnord deras —
 *     premiens anatomi 3,50 = 2,00 + 1,50 bärs i text med gränshänvisning).
 *   • «premieinkomster» → försäkringssektorns lager.
 *   • kalendern som begrepp → kt-05 · kalibreringen → kt-02 · den uteblivna
 *     katalysatorn → kt-04 · prospektteorin → bf-12 · den privata ägarsidans
 *     premielogik → pe-04 · jämförelsebolagen → vr-06 · terminalvärdet →
 *     vr-07 · DuPont → ln-01 · avkastningstrappan → roic-02 · grekerna →
 *     od-01 · implicit volatilitet → od-02 · marginalhandeln → am-09 ·
 *     korrelationen → km-014 · svarta svanar → rk-12 · slumpens serier →
 *     bf-16 · speglingen mot budarbitraget → od-09:s försäkringsskrivare.
 *
 * Aritmetiken i svaren (kursernas EGNA modelltal med tydligt påhittade verk
 * — Krokbäck Skog, Nordvirke, Norrverk, Sörverk — maskinellt omräknade i
 * regressionstestets D-fall):
 *   · Bud: Krokbäck 95 → kontantbud 120, öppnar 116 (+22,1 procent) ·
 *     premien (120−95)/95 = 26,3 procent, spannet 20–40 · spread 120−118 =
 *     2 kronor mot friståendekurs 88: p = 30/32 = 93,8 procent ·
 *     2/118 = 1,7 procent på budtiden ≈ 7 procent årsbasis · avslag:
 *     118 → 88 = −25,4 procent.
 *   · EVA: Norrverk NOPAT 250×0,72 = 180 · hyra 1 000×10 % + 500×
 *     (9,72 %×0,72 = 7,0 %) = 135 = 9,0 % av 1 500 · EVA 180−135 = 45 ·
 *     spridningen 12−9 = 3 % × 1 500 = 45 · Sörverk ROIC 7 % ⇒ −2 % ×
 *     1 500 = −30 · två vägar 15 %×0,8 = 6 %×2,0 = 12 % · bryggan
 *     1 500+45/0,09 = 2 000 (1,33×) · 1 500+45×1,03/0,06 = 2 272,5 (1,52×)
 *     · Sörverk 1 166,7 · 985 · 712,5 (0,78× · 0,66× · 0,48×) ·
 *     avskrivningens hyror 9,0 → 2,25.
 *   · Försäkring: put 100 på aktie 98 premie 3,50 = 2,00 + 1,50 · put 95
 *     på aktie 100 premie 1,50: 0,78×1,50 − 0,22×5,50 = 1,17 − 1,21 =
 *     −0,04 · noll-premien 0,22×5,50/0,78 ≈ 1,55 · kontanttäckt 1 500 på
 *     95 000 = 1,58 procent ≈ 6,3 procent årsbasis · naken marginal 19 000
 *     = kraft ≈ 5× · wheel 1,50+2,00 = 3,50 per aktie · Barings 1995: 827
 *     miljoner pund, 233 år · maxförlust naken put 95×100 = 9 500.
 *
 * KEDJEPLATS: 77:e motorn (efter beteendefallor, FÖRE marknadsrytm — deras
 * SIST-deklaration + L01 respekteras, multipel-precedensen). Kärnorden är
 * mekaniskt disjunkta mot samtliga 76 lager (sond mot 2 261 kärnord; 0
 * kollisioner efter kassation — verifieras levande av detta lagers eget
 * test (J-fall) och kedjetestets strukturfall).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras
 * motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur budprocessen, den ekonomiska
 * vinsten och försäkringsskrivandet LÄS och RÄKNAS — inga köp-/säljsignaler,
 * inga placeringstips, inga omdömen om enskilda bolag. Exempelvärdena är
 * kursernas egna modelltal (Krokbäck, Nordvirke, Norrverk och Sörverk är
 * påhittade bolag) — konstruerade för övningens skull.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-kategoristangning.mjs kan köra filen direkt i
 * Node. Källkurserna finns i KURSREGISTER — inga fantomlänkar (testfall
 * D21 vakar).
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

// ── Den 1 frågan: budprocessen (kt-09) ──────────────────────────────────────

export const KATEGORISTANGNING_MONSTER: FragMonster[] = [
  {
    id: "budprocessen",
    karnord: [
      // Sond _s6u3o32 (inline node): 0 kollisioner mot 2 261 kärnord i 76
      // lager efter kassation. GRÄNSER (bärs i TEXT): «budpremie»/
      // «budpremien»/«budspread» → handelsemotorns avtalsmekanik (deras
      // kärnord, tidigare i kedjan) · kalendern → kt-05 · kalibreringen →
      // kt-02 · den uteblivna katalysatorn → kt-04.
      "budprocessen", "budprocess", "budpris", "budpriset",
      "budtiden", "budtid",
      "tvångsinlösen", "tvångsinlösningen", "budplikt", "budplikten",
      "acceptnivån", "acceptvillkoret",
      "motbud", "motbudet",
      "budgivare", "budgivaren", "budgivarna",
      "friståendekurs", "friståendekursen",
      "budarbitrage", "budarbitraget",
      "uppköpserbjudande", "uppköpserbjudandet",
      "kontantbud", "kontantbudet",
      "budläge", "budläget", "aktiebud", "aktiebudet",
      "dag noll", "nio tiondelar",
    ],
    starkord: [
      "bud", "budet", "buden", "premie", "premien", "spread", "spreaden",
      "accept", "accepten", "accepter", "acceptperiod", "styrelse", "styrelsen",
      "avslag", "avslaget", "fullbordan", "fullbordandet", "kontroll",
      "kontrollen", "sannolikhet", "sannolikheten", "minoritet", "minoriteten",
      "budgivning", "Krokbäck", "Nordvirke", "finansiering", "prövning",
    ],
    bygga: (reg) => {
      const ktAntal = reg.filter((r) => r.kategori === "KATALYSATOR").length;
      const kallor = [
        kursKalla(reg, "kt-09-budpremien-och-budprocessen", "Läroplanen — katalysatorns paradfall: dag noll, premien, budtiden, accepten, avslaget, protokollet"),
        kursKalla(reg, "kt-02-forvantningsanalys-och-kalibrering", "Läroplanen — läs sannolikheten ur priset: kalibreringen som budtidens hantverk"),
        kursKalla(reg, "kt-04-den-uteblivna-katalysatorn", "Läroplanen — när händelsen dör måste priset hitta ett fundament: avslagets läsning"),
        kursKalla(reg, "bf-12-prospektteori", "Läroplanen — utfallsformen med liten topp och tung fot som intuitionen feltolkar"),
        kursKalla(reg, "pe-04-den-privata-agarsidan", "Läroplanen — budgivarens premielogik när kapitalet måste placeras"),
      ];
      const k = kallor[0];
      const kt09 = reg.find((r) => r.slug === "kt-09-budpremien-och-budprocessen");
      return {
        text:
          `Budprocessen är katalysatorfamiljens paradfall — den enda händelse på börsen med garanterat pris på definierat datum (acceptens slutdag, om det fullbordas) och samtidigt den mest datumslösa i förväg, ty ingen vet vilken morgon budet kommer. Kursen följer processens dramaturgi: dag noll, budtiden, accepten, avslaget och protokollet (allt nedan är utbildning i mekaniken, med kursens egna modelltal och tydligt påhittade bolag — inga placeringstips):\n\n1️⃣ DAG NOLL — PRISET BYTER FRÅGA. Kursens exempel: Krokbäck Skog (påhittat sågverk med skogsmark) handlad i 95 kronor i månader; en morgon offentliggör Nordvirke ett kontantbud på 120 — aktien öppnar i 116, ett kliv på 22,1 procent på en enda notering. Vad hände? Inte skogen — skogen är densamma. Priset bytte fråga: från vad bolaget är värt för en marginell köpare till vad det är värt för en köpare som betalar för hela ägandet och kontrollen. Budet står dessutom utanför alla kalendrar tills det står på dem — spekulanten i budrykten jagar den enda händelseklass som per konstruktion inte kan stå i almanackan (gränsen mot kt-05:s kalender, som äger de schemalagda händelserna).\n2️⃣ BUDTIDEN — SPREADEN SOM SANNOLIKHETSMASKIN. Ett bud på 120 gör inte aktien till en obligation på 120: den handlas en bit under. Dag noll i 116, mitt i acceptperioden i 118 — skillnaden mot budet, budtidens spread, är här 2 kronor. Varför existerar den? Därför att fullbordan inte är säker: villkor kan släppa, myndighetsprövningar falla ut fel, finansiärarna kyla. I avslagsfallet faller kursen inte till 120 minus något utan till friståendekursen — värdet utan bud, i exemplet antaget 88, alltså 30 kronor under spreadhandlarens inköp. Räkna sannolikhetsvägningen: den som köper i 118 vinner 2 vid fullbordan och förlorar 30 vid avslag; neutral prissättning ger p × 2 − (1 − p) × 30 = 0, alltså p = 30/32 = 93,8 procent — marknadens implicita tro på att affären går igenom. Det är kt-02:s kalibrering med en enda händelse och en klocka: budtiden, typiskt tre till sex veckor, där förlängningarna är egna signaler. Avkastningen 2/118 = 1,7 procent på en budtid (kvartal) är cirka 7 procent årsbasis — en avkastning som måste vägas mot sin egen svans, ty 2 kronor mot 30 är en utfallsform med liten topp och tung fot, exakt den form prospektteorin (bf-12) lär att intuitionen feltolkar. Spreaden rör sig levande: smalnar när fullbordan närmar sig, vidgas på dåliga nyheter — en opinionsmätning uppdaterad varje minut börsen är öppen.\n3️⃣ ACCEPTEN — NIO TIONDELAR, BUDPLIKT OCH TVÅNGSINLÖSEN. Budet fullbordas inte av budgivarens vilja ensam utan av ägarnas accepter, och maskineriet kretsar kring tre mekanismer. Acceptnivån: budet förenas typiskt med villkor om gotttagande motsvarande nio tiondelar av aktierna — över den tröskeln kan budgivaren enligt aktiebolagsrättens minoritetsskydd lösa in resterande aktier mot ersättning (tvångsinlösen), som gör målbolaget till helägt dotterbolag och noteringen till ett minne; de nio tiondelar som målsätts är praktiskt nog samma som krävs för att städa resten — budtidens magiska siffra. Budplikten: den som stegvis bygger en ägarposition passerar trösklar — kring trettio procent av rösterna i svensk marknadspraxis — där ett offentligt erbjudande till alla ägare ska lämnas; regeln hindrar tysta kontrollförvärv så att minoritetsägare möter samma bud som storägaren. Klockorna: acceptperioder, styrelsens yttrande, motbud och myndighetsprövningar som kan flytta fullbordedatum — allt enligt börskommitténs regelverk om likabehandling och information, ramen för hela dramaturgin (mekanik och historia; varje beslut i ett faktiskt budläge är läsarens eget).\n4️⃣ AVSLAGET — NÄR AFFÄREN DÖR OCH KURSEN SÖKER HEM. Bud dör på några fasta sätt: styrelsen avstyrker och budgivaren står pall, villkoren släpper (finansieringen sinar, prövningen faller ut fel, en stor ägare vägrar sälja), eller förhandlingar offentliggörs som avbrutna — marknadens mest tystlåtna bulletin, ty den avslöjar att priset fanns men inte delades. Gemensamt: spreadens höga fullbordanstro visar sig vara en felräkning och kursen söker hem. Vägen hem är inte linjär: Krokbäcks 95-kurs lämnar utrymme för en första reaktion mot 88, men en kurs som bukat under budspekulation har ofta byggt in en premie som aldrig fanns och faller då under nivån före ryktet — marknadens sätt att avskriva sin egen entusiasm. Räkna: köparen i 118 vid avslag till 88 bär 30 kronors förlust = 25,4 procent, spegelbilden av spreadhandlarens 1,7 procents uppsida. Detta är kt-04:s uteblivna katalysator i ren form: priset som byggts på en förväntan måste hitta ett fundament när förväntan dör — och ingen regel kräver att ett sådant finns. Motbudet är vändpunkten: ett andra bud kan väcka processen ur döden, och spreadens språng vid motbud är bland marknadens största enrörelser — en påminnelse om att bud inte är naturlagar utan prisdialog.\n5️⃣ PROTKOLLET — BUDLÄGETS FEM FRÅGOR. (1) VILKEN PREMIE och mot vilken bas — överkursen mot referenskursen, och om referensen är en uppblåst rykteskurs är premien mindre än den ser ut. (2) VAD SÄGER SPREADEN — uppsida och nedsida mot fullbordan respektive friståendekurs räknade, och vilken sannolikhet implicerar neutral prissättning? (3) VILKA VILLKOR OCH KLOCKOR — acceptnivå, budtid, prövningar, förlängningar namngivna med datum. (4) VEM BETALAR OCH VARMED — kontantbudets klingande mynt mot aktiebudets svävande värde, budgivarens balansräkning och finansiering som villkor bland villkor (pe-04:s privata ägarsida har sin egen premielogik när kapital måste placeras). (5) VAD ÄR FRISTÅENDEKURSEN — värdet utan bud, punkten kursen söker vid avslag och den enda nivå som är ett pris bland priser snarare än en förväntan. Premien säger vad kontroll kostar, spreaden vad marknaden tror, villkoren vad som kan gå sönder, betalningen vem som bär risken, friståendekursen vad som finns under dramat.\n\nI kategorin katalysator finns ${ktAntal} kurser — budprocessen (${kt09 ? kt09.niva.toLowerCase() + " nivå" : "i registret"}) är familjens nionde steg och paradfall: kalendern och kedjorna kartlades först, och budet är händelsen som slår som en hammare. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "budprocessen",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Budpremien och budprocessen", lank: "/kurser/kt-09-budpremien-och-budprocessen", ikon: "🔨", beskrivning: "Dag noll, budtiden, accepten, avslaget" },
          { text: "Kursen: Förväntningsanalys", lank: "/kurser/kt-02-forvantningsanalys-och-kalibrering", ikon: "🎯", beskrivning: "Läs sannolikheten ur priset" },
          { text: "Kursen: Den uteblivna katalysatorn", lank: "/kurser/kt-04-den-uteblivna-katalysatorn", ikon: "🚫", beskrivning: "När händelsen kommer och ingenting händer" },
          { text: "Kursen: Katalysatorernas kalender", lank: "/kurser/kt-05-katalysatorernas-kalender", ikon: "📅", beskrivning: "De schemalagda händelserna — budet står utanför" },
          { text: "Kursen: Prospektteori", lank: "/kurser/bf-12-prospektteori", ikon: "⚖️", beskrivning: "Utfallsformen spreadhandlaren bär" },
          { text: "Vad är en katalysator?", lank: "fragor:" + encodeURIComponent("vad är en katalysator?"), ikon: "💡", beskrivning: "Familjens första steg" },
          { text: "Vad är väntevärdet?", lank: "fragor:" + encodeURIComponent("vad är väntevärdet för optionsäljaren?"), ikon: "🎲", beskrivning: "Spegeln på säljarsidan" },
        ],
        motfraga: { text: "Vad är en katalysator?", kategori: "katalysator" },
        fordjupa: { text: k.titel, lank: "/kurser/kt-09-budpremien-och-budprocessen" },
      };
    },
  },
  {
    id: "ekonomiskavinsten",
    karnord: [
      // GRÄNSER (bärs i TEXT): naket «roic»/«wacc»/«nopat»/«kapitalkostnad»
      // → lonsamhetsdjupet (deras kärnord — här starkord) · DuPont → ln-01 ·
      // avkastningstrappan → roic-02 · terminalvärdet → vr-07.
      "eva", "ekonomisk vinst", "ekonomiska vinsten",
      "kapitalhyra", "kapitalhyran",
      "värdebrygga", "värdebryggan",
      "kapitalbas", "kapitalbasen",
      "spridning", "spridningen",
      "alternativkostnad", "alternativkostnaden",
    ],
    starkord: [
      "roic", "wacc", "nopat", "kapital", "kapitalet", "hyran", "hyra",
      "vinst", "vinsten", "tröskel", "tröskeln", "tillväxt", "tillväxten",
      "avkastning", "avkastningen", "kapitalkostnad", "Norrverk", "Sörverk",
      "evighetsström", "spridningens", "tecken", "minoritet", "DuPont",
    ],
    bygga: (reg) => {
      const lnAntal = reg.filter((r) => r.kategori === "LÖNSAMHET").length;
      const kallor = [
        kursKalla(reg, "roic-05-den-ekonomiska-vinsten", "Läroplanen — EVA och tröskeln där tillväxt börjar skapa värde"),
        kursKalla(reg, "km-008-wacc", "Läroplanen — den vägda kapitalkostnaden: hyrans bygglås och viktning"),
        kursKalla(reg, "roic-02-avkastningstrappan", "Läroplanen — ROIC:s två vägar: marginal och kapitalomsättning"),
        kursKalla(reg, "ln-01-dupont-analysen", "Läroplanen — DuPont-produkten som förklarar samma utgång via två trappor"),
        kursKalla(reg, "vr-07-terminalvardet", "Läroplanen — nämnarens gräns: samma värde, olika läsriktning"),
      ];
      const k = kallor[0];
      const roic05 = reg.find((r) => r.slug === "roic-05-den-ekonomiska-vinsten");
      return {
        text:
          `Den ekonomiska vinsten (EVA) är det belopp med vilket ett bolag överträffar sitt eget kapital — bokförd vinst räknar ingen kapitalhyra alls, och först när hyran är betald finns något som med rätta kan kallas vinst. Kursen bygger begreppet i sex steg (allt nedan är utbildning i hur vinsten läses, med kursens egna modelltal och tydligt påhittade bolag — inga placeringstips):\n\n1️⃣ TVÅ SLAGS VINST — DEN SYNLIGA OCH DEN SOM ÅTERSTÅR. Kursens exempelbolag Norrverk (påhittat) har rörelseresultat 250 kronor. Skatten dras på rörelsen (räntan är en kostnad som redan burit sin skattesubvention): 250 × 0,72 = 180 i rörelseresultat efter skatt. De 1 500 kronor investerat kapital är inte gratis — de kunde burit avkastning var annars, och den alternativkostnaden ska betalas innan någon kallas vinst. Sätts hyran till 9 procent blir den 135 kronor, och återstoden 180 − 135 = 45 kronor är den ekonomiska vinsten. Hade den varit noll hade ägarna varit exakt lika nöjda som i nästa bästa alternativ — bokslutet hade visat vinst, ekonomin likgiltighet.\n2️⃣ KAPITALHYRAN — VIKTNINGENS BYGGLÅS. Hyran är ett viktat genomsnitt: egenkapitalets 1 000 kronor kräver 10 procent (ägarnas alternativa placering med samma risk) = 100 kronor; skuldens 500 kronor kostar 9,72 procent före skatt men räntan dras ifrån beskattningen — efter 28 procents skatt 9,72 × 0,72 = 7,0 procent = 35 kronor. Samlad hyra 135 kronor på 1 500 = exakt 9,0 procent. Ägarna kräver mer, långivarna får skattehjälpen, och kapitalstrukturen bestämmer blandningen; skiften mellan halvorna rör hyran mindre än intuitionen bjuder (kvantiteten ägs av kapitalstrukturfamiljen — här läses hyran som den är, och mästaren läser EVA som ett intervall, aldrig ett punkttal, ty ägarnas krav är en väntan inte en observation).\n3️⃣ SPRIDNINGEN — ETT TECKEN SOM VÄGER KAPITALMASSAN. ROIC om 12 procent säger vad kapitalet bär; spridningen säger vad som återstår över tröskeln: 12 − 9 = 3 procent, och 3 procent av 1 500 = 45 kronor — samma tal som subtraktionen gav. Systerbolaget Sörverk (påhittat) har samma kapital men resultat efter skatt 105 kronor: ROIC 7 procent, spridning minus 2 procent, ekonomisk vinst minus 30 kronor — en resultaträkning med vinst (105/0,72 ≈ 146 före skatt) och en ekonomi som varje år gräver. Samma spridning kan vinnas på två skilda vägar (ln-01:s DuPont-produkt): bolag A med rörelsemarginal 15 procent och kapitalhastighet 0,8, bolag B med marginal 6 procent och hastighet 2,0 — båda landar på ROIC 12 procent fast A är ett marginbolag och B ett volymbolag; vilken trappa som är bäst beror på branschens golv, inte på modellen.\n4️⃣ TILLVÄXTENS TVÅ ANSIKTEN. Värdet av rörelsen är kapitalet plus framtida ekonomiska vinster som en växande ström. Norrverk med plus 45: vid nolltillväxt blir värdet 1 500 + 45/0,09 = 2 000 kronor — 1,33 gånger kapitalbasen; växer strömmen med 3 procent blir nämnaren 0,09 − 0,03 = 0,06 och värdet 1 500 + 45 × 1,03/0,06 = 1 500 + 772,5 = 2 272,5 kronor (1,52 gånger). Sörverk med minus 30: vid nolltillväxt 1 500 − 30/0,09 = 1 166,7 (0,78×); vid 3 procent 1 500 − 30 × 1,03/0,06 = 985 (0,66×); vid 5 procent 1 500 − 30 × 1,05/0,04 = 712,5 kronor (0,48×). Läs raden baklänges: FÖR Sörverk är varje tillväxtsteg en fördjupning av hålet — att växa ett bolag under tröskeln är att expandera en förlust med ränta på ränta. Omsättningstillväxt och vinsttillväxt rapporteras med samma tecken oavsett kapitalunderlag, men värdestillväxten har två tecken — kursens starkaste läsglas.\n5️⃣ VÄRDEBRYGGAN — KAPITAL PLUS STRÖM. Företagsvärde = investerat kapital + ekonomisk vinst × (1 + g)/(WACC − g). Bankdelen är återvinningsbar — den sitter kvar i maskiner och lager och kan i princip säljas tillbaka — strömdelen är förtjänt. Multipelläsningen faller ur divisionen: 1,33 och 1,52 mot 0,66 — rörelsens egen bokförda multipel, inte en marknadsstämd gissning. Nämnaren bär hela tillväxtantagandet: när g närmar sig avkastningskravet svämmar bryggan över, och den som pushar g mot 8 procent på ett 9-procentigt kapitalkrav bygger värde på en nämnare av en enda procentenhet (vr-07:s terminalvärde diskonterar kassaflöden, bryggan överskottet över hyran — samma värde vid konsekventa antaganden, olika läsriktning).\n6️⃣ MÄTNINGENS HANTVERK — JUSTERINGAR OCH FÄLLOR. Avskrivningens vinkel: en maskin om 100 kronor skrivs av rakt över fyra år à 25 — kapitalbasen sjunker 100, 75, 50, 25 och hyran vid 9 procent avtar 9,0, 6,75, 4,50, 2,25 kronor; en åldrad anläggning kan alltså visa stigande ekonomisk vinst utan att rörelsen förbättrats — avskrivningens inbyggda present, och kontrollfrågan vid varje läsning: är förändringen förtjänad i rörelsen eller är den balansräkningens ålder? Leasing hör hemma i kapitalbasen vad än balansräkningen kallar den; goodwill är mätningens svåraste post — att lämna den utanför gynnar förvärvsvuxna bolag, att lägga in den bestraffar dem som köpt dyrt, avgörande är att valet är detsamma över tiden. Tre fällor avslutar: punktvärdesfällan (EVA ett år är väder, inte klimat), kapitalkravets fönster (tröskeln rör sig med räntan — spridning i går behöver inte vara spridning i dag) och tillväxtfällan i förklädnad: en styrning som belönar ekonomisk vinst utan att fråga efter tecknet på tillväxtkapitalets spridning bygger om Sörverk i större skala.\n\nI kategorin lönsamhet finns ${lnAntal} kurser — den ekonomiska vinsten (${roic05 ? roic05.niva.toLowerCase() + " nivå" : "i registret"}) är ROIC-familjens femte steg: först lärde sig kurserna mäta avkastningen, sedan trappan och de inkrementella kronorna — och här står frågan hur mycket av vinsten som är vinst över huvud taget. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "ekonomiskavinsten",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Den ekonomiska vinsten", lank: "/kurser/roic-05-den-ekonomiska-vinsten", ikon: "🧮", beskrivning: "EVA och tröskeln där tillväxt skapar värde" },
          { text: "Kursen: WACC", lank: "/kurser/km-008-wacc", ikon: "🔑", beskrivning: "Den vägda kapitalkostnaden — hyrans lås" },
          { text: "Kursen: Avkastningstrappan", lank: "/kurser/roic-02-avkastningstrappan", ikon: "🪜", beskrivning: "ROIC:s två vägar" },
          { text: "Kursen: DuPont-analysen", lank: "/kurser/ln-01-dupont-analysen", ikon: "🧩", beskrivning: "Plocka isär ROE — produkten bakom trapporna" },
          { text: "Kursen: Terminalvärdet", lank: "/kurser/vr-07-terminalvardet", ikon: "♾️", beskrivning: "Nämnarens gräns — grannläsningen" },
          { text: "Vad är värdebryggan?", lank: "fragor:" + encodeURIComponent("vad är värdebryggan?"), ikon: "🌉", beskrivning: "Från ekonomisk vinst till företagsvärde" },
          { text: "Vad är spridningen?", lank: "fragor:" + encodeURIComponent("vad är spridningen?"), ikon: "➖", beskrivning: "Tecknet som väger kapitalmassan" },
        ],
        motfraga: { text: "Vad är avkastningstrappan?", kategori: "lönsamhet" },
        fordjupa: { text: k.titel, lank: "/kurser/roic-05-den-ekonomiska-vinsten" },
      };
    },
  },
  {
    id: "forsakringsskrivandet",
    karnord: [
      // GRÄNSER (bärs i TEXT): naket «option»/«optioner» → nästa-motorn
      // (sammansatta ord här: optionssäljare, säljoption, optionsskrivande)
      // · «tidsvärde»/«inre värde» → optionsdjupet/nästa · «premieinkomster»
      // → försäkringssektorn · grekerna → od-01 · implicit volatilitet →
      // od-02 · marginalhandeln → am-09 · svarta svanar → rk-12.
      "försäkringsskrivandet", "försäkringsskrivande", "försäkringsskrivaren",
      "optionssäljare", "optionssäljaren", "optionsäljare",
      "optionsskrivande",
      "utfärdare", "utfärdaren",
      "kontanttäckt", "kontanttäckt position", "naken position",
      "wheel", "wheel-cykeln",
      "marginalkedjan",
      "väntevärde", "väntevärdet",
    ],
    starkord: [
      "premie", "premien", "sälja", "säljer", "säljoption", "köpoption",
      "skriven", "put", "puter", "kontrakt", "kontrakten", "tilldelning",
      "tilldelad", "tilldelas", "theta", "frekvens", "frekvensen", "utfärda",
      "reserv", "reserver", "återförsäkring", "straddle", "hjulet", "cykeln",
      "nakna", "naken", "marginal", "svans", "svansen", "Barings", "Kobe",
      "Nikkei", "aktuarie", "policys", "försäkringsbolag",
    ],
    bygga: (reg) => {
      const odAntal = reg.filter((r) => r.kategori === "OPTIONS & DERIVAT").length;
      const kallor = [
        kursKalla(reg, "od-09-forsakringsskrivandet", "Läroplanen — optionssäljarens sida: motpartens stol, frekvensens frestelse, svansen"),
        kursKalla(reg, "od-01-optionens-greker", "Läroplanen — theta: premiens åldrande som säljarens lönemekanik"),
        kursKalla(reg, "am-09-marginalhandeln", "Läroplanen — belåningskontot, marginalkravet och kaskaden: den nakna positionens motor"),
        kursKalla(reg, "rk-12-black-swanrisk", "Läroplanen — svarta svanar: säljarens arbetsdag"),
        kursKalla(reg, "bf-16-slumpens-serier", "Läroplanen — tolv raka premier är slumpens serie, inte skicklighet"),
      ];
      const k = kallor[0];
      const od09 = reg.find((r) => r.slug === "od-09-forsakringsskrivandet");
      return {
        text:
          `Försäkringsskrivandet är optionens baksida: den som köper en put betalar 3,50 — men vem tar emot pengarna och vad lovar hon? En utfärdare, en säljare som åtar sig att köpa aktien till lösenpriset om köparen väljer att utnyttja sitt val. Kontraktets symmetri är total: köparens maximala förlust är premien och hennes öppna vinst; säljarens maximala vinst är premien och hennes öppna förlust. Säljarsidan är därmed inte en anomali utan en affärsmodell — att ta emot många små premier mot att då och då betala stora belopp är exakt vad ett försäkringsbolag gör, och optionssäljaren är ett försäkringsbolag i miniatyr utan kontor och utan aktuarie: hon får göra aktuariearbetet själv (allt nedan är utbildning i mekaniken, med kursens egna modelltal — inga placeringstips, aldrig en uppmaning att själv skriva kontrakt):\n\n1️⃣ AFFÄRSMODELLENS TRE PELARE. Kapitalbindning: premierna är små mot åtagandet, alltså krävs avsatt kapital eller marginal — försäkringsbolagets reserv. Riskspridning: en enskild policys utfall är slump, många policers utfall är statistik (km-014:s diversifieringslära på försäkring). Svansförståelse: verksamhetens historia avgörs inte av de många åren som fungerar utan av de få som inte gör det.\n2️⃣ PREMIENS ANATOMI. En put med lösenpris 100 på en aktie i 98 kostar antaget 3,50. Dela beloppet: 2,00 är överskottet mellan lösenpris och marknadspris — värdet som redan existerar, som kontraktet levererar om det löses in i dag — och 1,50 är betalningen för det som kan hända under återstående löptid (de båda delarnas namn och theta-mekaniken ägs av optionskurserna bredvid; säljarens läsning är att endast den senare delen är en lön som kan behållas intakt). Förfallet accelererar mot slutet, brantast när lösenpris ligger nära kurs — kontrakt långt ovanför kursen har premie som är nästan ren tid: maximal frekvens, liten krona per styck; kontrakt nära kursen bär mer per dag men även mer risk. Ingen optimal punkt finns utan att svansräkningen är med från början.\n3️⃣ FREKVENSENS FRESTELSE — 78 PROCENT OCH VÄNTEVÄRDET NOLL. Kursens räkneexempel: säljoption med lösenpris 95 på en aktie i 100, premie 1,50, löptid tre månader. Aktien når inte ned till 95 vid förfall i ungefär 78 procent av fallen — premien behålls — och når däremot i 22 procent; i tilldelningsfallen står aktien vid förfall i snitt 88, alltså köper säljaren till 95 värde 88: förlust 7,00 minus behållen premie 1,50 = netto minus 5,50. Väntevärdet: 0,78 × 1,50 − 0,22 × 5,50 = 1,17 − 1,21 = minus 0,04 — i princip noll, före transaktionskostnader. Detta är en mekanisk sanning om en välordnad marknad: frekvensen är redan i priset, och den som ändå vill bära risken måste veta varifrån edgen skulle komma — svaret kan inte vara frekvensen själv. Tolv behållna premier i rad är en följd av 78-procentsprocessen och bevisar ingenting om den trettonde (bf-16:s serieödmjukhet); och utfallsformen — vinna ofta, förlora sällan men stort — är precis den prospektteorin visar att människor betalar för att uppleva; säljaren intar den omvända ställningen och blir betald för att bära den. Frekvens är hur ofta, väntevärde är hur mycket: en affärsmodell som redoviserar den ena utan den andra är en halv bokföring.\n4️⃣ KONTANTTÄCKT MOT NAKEN — OCH WHEEL-CYKELN. Tio kontrakt säljoptioner à 100 aktier med lösenpris 95: åtagandet är att köpa 1 000 aktier à 95 = 95 000 kronor. Kontanttäckt position avsätter hela beloppet — pengarna ligger isolerade och väntar, och tjänar under tiden ränta; premien 1 500 på säkerheten 95 000 är 1,58 procent för perioden, ungefär 6,3 procent årsbasis vid fyra oförändrade omgångar — och villkoret "oförändrad värld" är halva läran, ty en tilldelning konverterar kontanter till aktier och därmed in i marknadsrisk. Den nakna positionen avsätter i stället marginal — grovt en femtedel, 19 000 för samma exponering — och mekaniken är am-09:s belåningskonto i praktik: kraft cirka fem gånger, varje nedåtrörelse kräver mer marginal vid precis det tillfället som är dåligt; kraften förstorar svansen, den skapar den inte. Mellan formerna löper wheel-cykeln: den tilldelade puten lämnar aktieinnehav (1 000 aktier à 95), därefter skrivs köpoptioner mot innehavet med lösenpris ovanför inköpet och premie 2,00; tilldelas kontraktet lämnas aktierna och cykeln börjar om. Ett helt varv med behållna båda premier samlar 1,50 + 2,00 = 3,50 per aktie före aktiens egen utveckling — illustrativt, inte normativt, ty varje led är ett nytt beslut med egen svans. Kontanttäckt binder, naken belånar, wheel roterar — ingen form ändrar ekvationen i kapitel tre; de ändrar bara vem som betalar den och när.\n5️⃣ SVANSEN — VAR FÖRSÄKRINGSSKRIVARE RUINERAR SIG. Barings 1995: nakna straddles på Nikkei 225 — kontrakt som betalade om marknaden stod stilla — och förlusterna samlades i en dold räkenskap; jordskalvet i Kobe i januari 1995 flyttade indexet genom golvet i konstruktionen, förlusten växte till 827 miljoner pund och banken, 233 år gammal, upphörde. Tre läxor: svanshändelser flyttar hela underlaget — inte aktien som sjunker nio procent utan marknaden som byter regim, med den implicita volatiliteten (od-02:s yta) som ännu en kraft som vänder mot positionen (efter 1987 års krasch sköt indexoptioners implicita volatilitet flera gånger upp på dagar). Den nakna positionens maximala förlust är inte teoretisk: för en put med lösenpris 95 och 100 aktier per kontrakt är taket 9 500 per kontrakt, nått om aktien faller till noll; den skrivna köpoptionen utan innehav har förlust öppen uppåt, utan gräns alls. Och frekvensens psykologi är ruinens motor — varje behållen premie bekräftar modellen tills den inte gör det (rk-12:s svarta svanar är säljarens arbetsdag). Försäkringsbolagets svar på samma matematik är organisationen: reserv satt efter svansen inte genomsnittet, riskspridning över åtaganden som inte samvarierar, återförsäkring av den yttersta delen, återhållsam utdelningspolitik. Skillnaden mellan försäkringsbolag och ruin är inte sannolikheten — organisationen före svansen.\n6️⃣ PROTKOLLET — SÄLJARSIDANS FEM FRÅGOR. (1) Var är tiden och var är det redan innantill liggande värdet — anatomin uppskattad i kronor före allt annat. (2) Vad är frekvensen och vad är väntevärdet — båda måtten redovisade, aldrig det ena. (3) Vad är avsett och vad är marginal — kontanttäckt, naken eller wheel, med belopp och belåningens kraft utskriven. (4) Varifrån kommer edgen — om svaret är att premier behålls ofta är svaret redan i priset; om svaret är en läsning av volatilitetens nivå eller replikeringsmaskinen är det åtminstone ett svar av rätt sort. (5) Vad dödar konstruktionen — svansens storlek, form och historiska datum namngivna (1987, Kobe), reservens storlek mot den, återförsäkringens närvaro eller frånvaro. En konstruktion som inte kan namnge sin egen död är inte förstådd — den är bara ännu obegripen medan den tjänar pengar.\n\nI kategorin options och derivat finns ${odAntal} kurser — försäkringsskrivandet (${od09 ? od09.niva.toLowerCase() + " nivå" : "i registret"}) är familjens sista steg: först lärde kurserna ut köparsidan och prisbildningen, och här vänds stolen om till motparten som bär samma maskineri baklänges. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "forsakringsskrivandet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Försäkringsskrivandet", lank: "/kurser/od-09-forsakringsskrivandet", ikon: "🪑", beskrivning: "Optionssäljarens sida — utfärdarens stol" },
          { text: "Kursen: Optionens greker", lank: "/kurser/od-01-optionens-greker", ikon: "θ", beskrivning: "Theta — premiens åldrande" },
          { text: "Kursen: Implicit volatilitet", lank: "/kurser/od-02-implicit-volatilitet", ikon: "🌊", beskrivning: "Ytan som vänder mot positionen" },
          { text: "Kursen: Marginalhandeln", lank: "/kurser/am-09-marginalhandeln", ikon: "🏦", beskrivning: "Belåningskontot och kaskaden" },
          { text: "Kursen: Black swan-risk", lank: "/kurser/rk-12-black-swanrisk", ikon: "🦢", beskrivning: "Svansen som är säljarens arbetsdag" },
          { text: "Vad är en katalysator?", lank: "fragor:" + encodeURIComponent("vad är en katalysator?"), ikon: "💡", beskrivning: "Katalysatorfamiljens första steg" },
          { text: "Hur fungerar en budprocess?", lank: "fragor:" + encodeURIComponent("hur fungerar en budprocess?"), ikon: "🔨", beskrivning: "Systerfrågan — spreaden som spegel" },
        ],
        motfraga: { text: "Vad är implicit volatilitet?", kategori: "optionsderivat" },
        fordjupa: { text: k.titel, lank: "/kurser/od-09-forsakringsskrivandet" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med kategoristängnings-mönstren — eller null (då har hela
 * kedjan före redan lämnat null och API-flödet tar över som förr). Ligger
 * efter beteendefallor och FÖRE marknadsrytm i widgetens kedja och kan
 * därför aldrig stjäla en fråga från ett tidigare lager; det fångar bara
 * frågor som alla lager före det lämnar null på. Samma matchningssemantik
 * som basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltKategoristangning(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of KATEGORISTANGNING_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
