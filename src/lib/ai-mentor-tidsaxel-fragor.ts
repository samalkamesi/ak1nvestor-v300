/**
 * AI-MENTORN 2.0 — TIDSAXEL-FÖRHANDSFRÅGOR (spår 6, omgång 16, s6-u2).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de trettio committade
 * lagren (92 monsters) — kedjans NÄR-frågor, som hela kedjan lämnar null på:
 *   1. Konjunkturindikatorerna (ma-04 primär + ma-01 + kt-02 + ma-02) —
 *      VAR i cykeln tiden står: de månatliga mätningarna (inköpschefsindex/
 *      PMI, förtroendebarometrar, orderstockar), tre klockor (ledande,
 *      jämnivå, eftersläpande), diffusionsindexets aritmetik och panelen
 *      på tre ben — ma-familjens fjärde kurs, mentorväglös sedan
 *      registreringen 2026-09-17.
 *   2. Refinansieringsmuren (st-05 primär + st-04 + ks-03 + st-01) —
 *      NÄR skulden förfaller i klunga: balansräkningens fjärde dimension
 *      (tiden), förfallotabellen, klungmåttet, mur-kvoten och kalendern —
 *      STABILITET-familjens femte kurs (senaste tillskottet i registret),
 *      mentorväglös sedan registreringen 2026-09-17.
 *
 * Lagernamnet är berättelsen: båda monsters svarar på NÄR-frågor —
 * indikatorerna på var i cykeln, muren på vilket datum skulden måste
 * omförhandlas.
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u2-sond-omg16.mjs, otrackad diskbevis:
 * 30 motorer, 92 monsters, 971 kärnord LIVE-lästa med den riktiga matcharn,
 * kandidat- och närhetssvep): hela konjunkturindikator-familjen var NULL
 * genom kedjan ("vad är konjunkturindikatorer?" · "vad är pmi?" · "vad är
 * konjunkturbarometern?" · "vad är konsumentförtroende?" · "vilka
 * framskrivningsindikatorer finns?" · "vad är leadindikatorer?") och
 * muren/klungan likaså ("vad är refinansieringsmuren?" · "vad är
 * klungprofil?" · "vad är löptidsstrukturen?" · "vad är en förfalloklunga?"
 * · "vad är mur-kvoten?").
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; emission/V19-
 * precedensen — källägande ≠ kärnordsägande):
 *   • Riskdjupet äger "refinansiering", "refinansieringsrisk", "löptid"
 *     (solo) och "covenants" — detta lager bär ENDAST de sammansatta
 *     klung-/mur-/löptidsprofil-orden; frågan "hur refinansierar bolag
 *     skuld?" och "när förfaller skulden?" fångas av basens
 *     kapitalstruktur-monster och lämnas därmed åt basen.
 *   • Sektorn äger konjunkturCYKEL-familjen ("konjunkturcykler",
 *     "konjunkturkänsliga") — detta lager bär ENDAST indikator-/
 *     barometer-/PMI-orden; naket "konjunktur" bärs inte här.
 *   • Makro äger ränta/realränta/inflation/nominell ränta (sondbevis:
 *     "vad är realräntan?" FÅNGAS av makro) — ma-03 länkas aldrig här,
 *     ränteorden är som mest starkord.
 *   • Stabilitetsdjupet äger känslighetsanalys/stresstest och
 *     soliditetsgrad; deras kurser (st-01/st-02) länkas som KÄLLOR.
 *   • collar är en dokumenterad fälla (portföljgrundens "dollar", d=1) och
 *     bärs inte här; prisspridning fångas av basen.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras
 * motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro ?? svaraLokaltExtra ?? svaraLokalt ?? svaraLokaltNasta
 *   ?? svaraLokaltKapitalmekanik ?? svaraLokaltSektor ?? svaraLokaltCase
 *   ?? svaraLokaltPraktik ?? svaraLokaltPortfoljgrund ?? svaraLokaltAgande
 *   ?? svaraLokaltRedovisningsdjup ?? svaraLokaltDjup ?? svaraLokaltHistoria
 *   ?? svaraLokaltLonsamhetsdjup ?? svaraLokaltTsdjup ?? svaraLokaltSkattedjup
 *   ?? svaraLokaltBeteendedjup ?? svaraLokaltRiskdjup ?? svaraLokaltRiskmattsdjup
 *   ?? svaraLokaltUtdelningsdjup ?? svaraLokaltForvantningsdjup
 *   ?? svaraLokaltPortfoljbalans ?? svaraLokaltStabilitetsdjup
 *   ?? svaraLokaltGrahamgolv ?? svaraLokaltVarderjustering
 *   ?? svaraLokaltOptionsdjup ?? svaraLokaltRisklasningsdjup
 *   ?? svaraLokaltAvkastningskurva ?? svaraLokaltAvkastningsdjup
 *   ?? svaraLokaltVarderingsverktyg ?? svaraLokaltTidsaxel
 * Detta lager levererades SIST och kan därför aldrig stjäla en fråga från
 * ett tidigare lager; det fångar bara frågor som alla 30 lager före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas
 * av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur konjunkturindikatorerna och
 * förfallotabellen DEFINIERAS och RÄKNAS som metod — inga köp-/sälj-
 * signaler, inga placeringstips, inga omdömen om enskilda bolag, värde-
 * papper eller om aktuellt konjunkturläge. Aritmetiken illustrerar
 * mekaniken med kursfilernas påhittade exempel (diffusionsindexet
 * 35/45/20 → 57,5 · orderkvoten 120/100 → 1,2 · Svea Fastigheter 1 200,0
 * med klungan 750,0 och mur-kvoten 2,3×) — aldrig utfästelser om den
 * verkliga ekonomin eller något verkligt bolag.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-tidsaxel.mjs kan köra filen direkt i Node.
 * Alla källkurser (ma-04-konjunkturindikatorerna, ma-01-transmissions-
 * mekaniken, kt-02-forvantningsanalys-och-kalibrering, ma-02-lonebildning-
 * och-kostnadsspiralen, st-05-refinansieringsmuren, st-04-stabilitet-genom-
 * kreditcykeln, ks-03-skuldens-anatomi, st-01-soliditet-och-rantetackning)
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

// ── De 2 tidsaxelfrågorna ───────────────────────────────────────────────────

export const TIDSAXEL_MONSTER: FragMonster[] = [
  {
    id: "konjunkturindikatorerna",
    karnord: [
      "konjunkturindikator", "konjunkturindikatorer",
      "konjunkturindikatorn", "konjunkturindikatorerna",
      "inköpschefsindex", "inköpschefsindexet",
      "pmi",
      "konjunkturbarometer", "konjunkturbarometern",
      "förtroendebarometer", "förtroendebarometern",
      "konsumentförtroende", "konsumentförtroendet",
      "framskrivningsindikator", "framskrivningsindikatorer",
      "framskrivande indikator", "framskrivande indikatorer",
      "leadindikator", "leadindikatorer",
      "eftersläpande indikator", "eftersläpande indikatorer",
      "eftersläpande mått",
      "diffusionsindex", "diffusionsindexet",
      "mjuka data", "mjuk data",
      "nettobalans", "nettobalansen",
      "orderstock", "orderstocken", "orderstockar",
    ],
    starkord: [
      "konjunktur", "indikator", "index", "cykel", "månad",
      "månadens", "siffror", "data", "order", "sysselsättning",
      "barometer", "trend", "panel", "produktion", "rapport",
      "förväntningar", "vänta", "läsa", "mäter", "ekonomi",
    ],
    bygga: (reg) => {
      const maAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
      const kallor = [
        kursKalla(reg, "ma-04-konjunkturindikatorerna", "Läroplanen — MAKROEKONOMI & RÄNTA: månadens siffror och deras klockor"),
        kursKalla(reg, "ma-01-transmissionsmekaniken", "Läroplanen — MAKROEKONOMI & RÄNTA: vägen från indikator till bolagets resultat"),
        kursKalla(reg, "kt-02-forvantningsanalys-och-kalibrering", "Läroplanen — KATALYSATOR: vad priset redan räknat med"),
        kursKalla(reg, "ma-02-lonebildning-och-kostnadsspiralen", "Läroplanen — MAKROEKONOMI & RÄNTA: det eftersläpande benets mekanik"),
      ];
      const k = kallor[0];
      const ma4 = reg.find((r) => r.slug === "ma-04-konjunkturindikatorerna");
      return {
        text:
          `Konjunkturindikatorerna är de månatliga mätningarna av konjunkturens puls — inköpschefsindex (i branschlitteraturen ofta förkortat PMI), förtroendebarometrar, orderstockar, sysselsättning — och konsten är att läsa dem efter deras KLOCKA. Indelningen är ämnets första och viktigaste: LEDANDE mått rör sig före konjunkturen (beslut och attityder som föregår produktionen — förtroendebarometrar, inköpschefsindex, orderstockar); JÄMNIVÅMÅTT mäter konjunkturen medan den sker (produktion, försäljning); EFTERSLÄPANDE mått skriver protokollet i efterhand (sysselsättning, löneutveckling). Allt nedan är utbildning i läsmetoden — inga omdömen om något enskilt bolag eller dagens konjunkturläge:\n\n1️⃣ DIFFUSIONSINDEXETS ARITMETIK — de mjuka undersökningarnas räknesätt är enkelt och starkt: andelen som svarar högre plus hälften av andelen som svarar oförändrat. Kursens genomgående exempel (påhittat): 35 procent svarar högre, 45 oförändrat, 20 lägre — kontrollen att summorna stämmer ges av 35 + 45 + 20 = 100 — och indexet blir 35 + 22,5 = 57,5. Skalan är säsongsrensat centrerad kring 50: över 50 betyder växande aktivitet, under 50 krympande — NIVÅN är avståndet från neutralpunkten, RIKTNINGEN läses över flera månader. Nettobalansen är samma räknesätt utan halveringen: högerandelen minus vänsterandelen. Undersökningarna publiceras först och revideras sällan — men de mäter attityder, som kan ångra sig; den hårda statistiken kommer med fördröjning och revidering.\n2️⃣ MJUKT MÖTER HÅRT VID ORDERSTOCKEN — orderstocken är industrins eget ledande hårda mått: nya order minus fakturering, ackumulerat. Kursens exempel (påhittat): nya order 120 mot fakturering 100 ger tillväxten +20 och kvoten 120 ÷ 100 = 1,2 — beläggningen växer. Inköpschefens svar handlar i praktiken om samma orderläge som orderstatistiken fångar, men statistiken kommer senare — det är där mjukt och hårt möts, och varför panelen (nedan) vill se båda.\n3️⃣ PANELEN PÅ TRE BEN OCH VÄGEN TILL RAPPORTEN — kursens slutverktyg är en panel: ett MJUKT LEDANDE mått (förtroendebarometern eller inköpschefsindex för den ekonomi som bär bolagets marknad — fångar attitydernas vändning först), ett HÅRT ORDERMÅTT (orderstocken eller orderkvoten i bolagets sektor — bekräftar att attityderna blivit beställningar), ett EFTERSLÄPANDE mått (sysselsättning eller löneutvecklingen). Tre ben, tre klockor: attityd, beställning, bekräftelse. Reglerna är fällorna i positiv form: riktning läses över månader, nivå som avstånd från 50, en våg är inte en trend förrän den syns i båda — attityden OCH orderstocken. Slutstationen är inte makron utan bolagets nästa rapport: via transmissionsmekaniken (ma-01) binder indikatorerna samma efterfrågan som rapporten kommer att rapportera, och förväntningsanalysen (kt-02) frågar vad priset redan räknat med. Fem fällor att vägra: den enskilda månaden, revideringarna, säsongsrensningens artefakter, att läsa nivå utan grannserie — och att glömma att samma totalsiffra betyder olika saker i olika sektorer.\n\nI kategorin makroekonomi & ränta finns ${maAntal} kurser — konjunkturindikatorerna (${ma4 ? ma4.minuter + " min, " + ma4.niva.toLowerCase() + " nivå" : "i registret"}) är månadssiffrornas lärokurs. Som alltid: detta är utbildning i en metod — inga placeringstips och ingen prognos om den verkliga ekonomin.` +
          kallradFler(kallor),
        amne: "konjunkturindikatorerna",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Konjunkturindikatorerna", lank: "/kurser/ma-04-konjunkturindikatorerna", ikon: "📊", beskrivning: "Månadens siffror och deras klockor" },
          { text: "Kursen: Transmissionsmekaniken", lank: "/kurser/ma-01-transmissionsmekaniken", ikon: "⚙️", beskrivning: "Från indikator till bolagets resultat" },
          { text: "Kursen: Förväntningsanalys", lank: "/kurser/kt-02-forvantningsanalys-och-kalibrering", ikon: "🎯", beskrivning: "Vad priset redan räknat med" },
          { text: "Vad är realräntan?", lank: "fragor:" + encodeURIComponent("vad är realräntan?"), ikon: "🧮", beskrivning: "Räntefamiljens penningvärdesspegel — makro-lagret" },
        ],
        motfraga: { text: "Vad är förväntningsanalys?", kategori: "makro" },
        fordjupa: { text: k.titel, lank: "/kurser/ma-04-konjunkturindikatorerna" },
      };
    },
  },
  {
    id: "refinansieringsmuren",
    karnord: [
      "refinansieringsmuren", "refinansieringsmur",
      "klungprofil", "klungprofilen",
      "klunga", "klungan",
      "skuldklunga", "skuldklungan",
      "förfalloklunga", "förfalloklungan",
      "löptidsprofil", "löptidsprofilen",
      "löptidsstruktur", "löptidsstrukturen",
      "förfallotabell", "förfallotabellen",
      "mur kvot", "murkvot", "murkvoten",
      "uppslag", "uppslaget", "uppslagskänslighet", "uppslagskänsligheten",
    ],
    starkord: [
      "skuld", "skulder", "förfaller", "förfall", "lån", "lånen",
      "ränta", "räntor", "kassa", "balansräkning", "fönster",
      "mur", "kalendarium", "kalender", "år", "kredit", "bank",
      "amortering", "profil", "tabell", "cykel", "dimension",
    ],
    bygga: (reg) => {
      const stAntal = reg.filter((r) => r.kategori === "STABILITET").length;
      const kallor = [
        kursKalla(reg, "st-05-refinansieringsmuren", "Läroplanen — STABILITET: när skulden förfaller i klunga"),
        kursKalla(reg, "st-04-stabilitet-genom-kreditcykeln", "Läroplanen — STABILITET: fönstret som öppnas och stängs"),
        kursKalla(reg, "ks-03-skuldens-anatomi", "Läroplanen — KAPITALSTRUKTUR: löptider, bindning och instrumenten"),
        kursKalla(reg, "st-01-soliditet-och-rantetackning", "Läroplanen — STABILITET: täckningsgraderna som muren lever bredvid"),
      ];
      const k = kallor[0];
      const st5 = reg.find((r) => r.slug === "st-05-refinansieringsmuren");
      return {
        text:
          `Refinansieringsmuren är balansräkningens fjärde dimension — TIDEN. Frågan heter: NÄR förfaller skulden? Tänk (kursens genomgående exempel, påhittat) två bolag med identisk balansräkning i varje etablerat mått: samma skuld 1 200,0 miljoner, samma räntetäckning 3,8×, samma soliditet. Det första bolagets skuld förfaller jämnt — en femtedel per år i fem år; det andra bär en klunga: mer än hälften av allt förfaller inom samma tvåårsfönster. Efter varenda mått är bolagen utbytbara — men deras nästa fem år är olika historier. Allt nedan är utbildning i mätmetoden — inga omdömen om något enskilt bolag:\n\n1️⃣ FÖRFALLOTABELLEN OCH KLUNGMÅTTET — konstruktionen är tabellen: alla skuldliknande poster (banklån, obligationer, kreditramar, konvertibler, leasingåtaganden) på en rad per år, oavsett form — kursen mäter inte instrumenten utan deras slutdatum. Markera det rullande 24-månadersfönstret där förfallen är tätast och räkna andelen av hela skulden: Svea Fastigheter (400,0 + 350,0) ÷ 1 200,0 = 62,5 procent — klungan.\n2️⃣ MUR-KVOTEN OCH TRAPPSTEGEN — klungan delat i allt som kan betala eller bära den UTAN marknaden: kassan, de outnyttjade ramarna och fönstrets fria kassaflöde — 750,0 ÷ (80,0 + 120,0 + 2 × 60,0) = 750,0 ÷ 320,0 = 2,3×. Kvotens trappsteg: UNDER 1,0 bär bolaget självt sin mur (refinansiering blir ett val, inte ett måste); 1,0–2,0 krävs marknaden men förhandlingarna är hanterliga; ÖVER 2,0 — som exemplet — är friheten begränsad och kalendern blir en del av analysen; över 3,0 är murpassagen beroende av att fönstret står öppet. Kalendern: förhandlingar inleds i praktiken 12–18 månader före förfall.\n3️⃣ UPPSALGET OCH TVÅ BLINDHETER — när muren rullas ärver inte de nya lånen de gamlas villkor utan dagens marknad. Räkneläxan (påhittade tal): erbjuds 6,5 procent mot dagens snitt 3,0 blir uppslaget (6,5 − 3,0) = 3,5 procentenheter × 750,0 = 26,3 miljoner mer i ränta per år; efter att hela klungan rullats blir räntekostnaden 48,8 + 13,5 = 62,3 miljoner per år mot förra 36,0 — utan en krona ny skuld. Två blindheter att hålla isär: SNITTRÄNTANS FRED (snittet är en minnesbild av en gång tecknade räntor, inte ett löfte — läs det med förfallotabellen bredvid) och TÄCKNINGENS BLINDHET (räntetäckningen är ett FLÖDESMÅTT — dagens ränta mot dagens resultat; muren är ett STOCKMÅTT — en mängd skuld som möter en framtida marknad; ett bolag kan bära 3,8× och inte passera ett enda datum, och ett annat passera med 2,0× om inget förfaller). Fönstret självt äger kreditcykeln (st-04): muren är datumet där allt annat måste hålla.\n\nI stabilitets-kategorin finns ${stAntal} kurser — refinansieringsmuren (${st5 ? st5.minuter + " min, " + st5.niva.toLowerCase() + " nivå" : "i registret"}) äger datumet; tillsammans med grader, stress, konkursmodell och cykel gör den balansräkningen till vad den är för en fundamental läsare: inte ett dokument utan en tidsmaskin. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "refinansieringsmuren",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Refinansieringsmuren", lank: "/kurser/st-05-refinansieringsmuren", ikon: "🧱", beskrivning: "När skulden förfaller i klunga" },
          { text: "Kursen: Kreditcykeln", lank: "/kurser/st-04-stabilitet-genom-kreditcykeln", ikon: "🔄", beskrivning: "Fönstret som öppnas och stängs" },
          { text: "Kursen: Skuldens anatomi", lank: "/kurser/ks-03-skuldens-anatomi", ikon: "🔬", beskrivning: "Löptider, bindning och instrumenten" },
          { text: "Vad är covenants?", lank: "fragor:" + encodeURIComponent("vad är covenants?"), ikon: "📜", beskrivning: "Skuldens spelregler — riskdjupet" },
        ],
        motfraga: { text: "Vad är covenants?", kategori: "stabilitet" },
        fordjupa: { text: k.titel, lank: "/kurser/st-05-refinansieringsmuren" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två tidsaxel-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltTidsaxel(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of TIDSAXEL_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
