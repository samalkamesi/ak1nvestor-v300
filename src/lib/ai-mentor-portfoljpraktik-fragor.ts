/**
 * AI-MENTORN 2.0 — PORTFÖLJPRAKTIK-FÖRHANDSFRÅGOR (spår 6, omgång 17, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de trettiotre committade
 * lagren (98 monsters): PORTFÖLJHANTERING:s praktiska beslutsfrågor —
 *   1. Positionsstorlek ("hur stor ska en aktieposition vara?") —
 *      risk-per-position-metoden: storleken räknas baklänges från
 *      stoppavståndet (pf-02 primär + pf-11 + rk-01 + pf-03)
 *   2. Tax-loss harvesting ("vad är tax-loss harvesting?") —
 *      att skörda en realiserad förlust mot en realiserad vinst i
 *      aktiedepån (pf-09 primär + km-051 + km-052 + pf-08)
 *   3. Pensionssparande ("vad är pensionssparande?") —
 *      tidshorisontens aritmetik: ränta på ränta mot inflation
 *      (pf-14 primär + pf-06 + km-055 + ma-03)
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u3-sond-omg17.mjs, otrackad; 33 motorer /
 * 98 monsters / 1 032 kärnord LIVE-lästa ur src/ med den riktiga matcharen):
 * rond 1 dödade kandidaterna förlustaversion/prospektteori/disposition
 * effect (djup-lagret äger), sunk cost/flockbeteende/dunning-kruger/
 * halo-effekt (basen), position sizing som FORMULERING (basens kärnord —
 * IDENTISKT), valutarisk (portföljgrund), black swan/svansrisk (riskdjupet),
 * krishantering/koncentrerad portfölj/årsrapportering/regulatorisk risk
 * (basen), ISK/investeringssparkonto/schablonskatt (basens skatt-monster —
 * IDENTISKA kärnord). Rond 2 fann friheten: positionstorlek,
 * positionsstorleken, risk per position, positionsplanering, tax loss
 * harvesting, skatteförlustrealisering, skörda förluster, förlustavdrag,
 * pension, pensionssparande, pensionssparandet — ALLA NULL genom hela
 * kedjan med INGA kärnordsgrannar inom tolerans 2 (kompletterande ord
 * "aktieposition/aktiepositioner" verifierade på samma sätt i modultestets
 * J-fall — 0 krockar mot 1 032 kärnord). Registerbärningen är spårets
 * starkaste för PORTFÖLJHANTERING sedan portföljbalans-lagret:
 * pf-02, pf-09 och pf-14 är varje frågas dedikerade kurser.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt; testfallen H/I
 * bevisar båda vägarna):
 *   • Basen äger FORMULERINGARNA "position sizing" och "risk" (dess monster
 *     fångar frågor med de orden — kedjebevisat i sonden). Detta lager bär
 *     därför ALDRIG "position sizing" som kärnord — endast de svenska
 *     sammansättningarna (V19-precedensen). Kursen pf-02 får gärna vara
 *     KÄLLA: källägande ≠ kärnordsägande.
 *   • Basen äger skatt-GRUNDORDEN (schablonskatt, kapitalvinstskatt med
 *     flera) och ISK/investeringssparkonto; skattedjupet äger
 *     kapitalförsäkringsfamiljen. Detta lager bär endast
 *     förlustrealiseringsfamiljen — kvittningsmekaniken är ett eget ämne.
 *   • Portföljbalans-lagret äger rebalansering; portföljgrunden äger
 *     diversifiering/korrelation. Positionsstorlek-svaret LÄNKAR dit som
 *     källor men äger aldrig deras ord.
 *   • Makro äger ränte- och inflationsorden; pensionssparande-svaret äger
 *     pension/familjen och använder inflation enbart som STÄRKORD.
 *
 * DOKUMENTERAD RISK (accepterad, ncav↔nav-precedensen): "pension" är ett
 * vardagligt ord — sweepen visar 0 grannar i kedjans 1 032 kärnord, och
 * korta frågor utan kärnord passerar fortfarande till API-flödet. Omvänt
 * kan "förlustaversion"-frågor (djup-lagrets) ALDRIG stjälas här:
 * "forlustaversion" mot detta lagers längsta kärnord "skatteforlust-
 * realisering" ligger på avstånd långt över tolerans 2 (mekaniskt
 * verifierat i sonden + testfall G2 LIVE).
 *
 * Aritmetiken i alla tre svar (påhittade tal, maskinellt omräknade i
 * regressionstestet):
 *   • Positionsstorlek: portfölj 100 000 kr, risktak 1 % = 1 000 kr;
 *     kurs 50 kr, stopp 45 kr ⇒ risk 5 kr/aktie ⇒ 200 aktier =
 *     10 000 kr (10 % av portföljen); stopp 48 kr ⇒ 2 kr/aktie ⇒
 *     500 aktier = 25 000 kr (25 %).
 *   • Tax-loss harvesting: vinst 100 000 − förlust 40 000 = 60 000;
 *     skatt 30 % × 60 000 = 18 000 mot 30 000 utan skörd ⇒
 *     12 000 kr lägre skatt i år (uppskjutning, inte borttagning).
 *   • Pensionssparande: 1 000 kr/månad i 360 månader vid 0,5 %/månad ⇒
 *     slutvärde ≈ 1 004 500 kr (insatt 360 000); realt efter 2 % inflation
 *     i 30 år (delat med 1,811) ⇒ ≈ 554 500 kr.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * kapitalbindning) och kan därför aldrig stjäla en fråga från ett tidigare
 * lager; det fångar bara frågor som alla 33 lagren före det lämnar null
 * på. Omvänt vaktar testfall I på att dessa frågor INTE fångas av kedjan
 * utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur positionsstorlek, förlust-
 * kvittning och långsiktigt sparande DEFINIERAS och RÄKNAS som metod —
 * inga köp-/säljsignaler, inga placeringstips, inga pensions- eller
 * skatteråd till någon enskild person ("kontakta gärna Skatteverket för
 * ditt fall" är den ärliga hänvisningen). Aritmetiken illustrerar
 * mekaniken med påhittade tal, aldrig utfästelser om avkastning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-portfoljpraktik.mjs kan köra filen direkt i
 * Node. Alla källkurser (pf-02-position-sizing, pf-11-koncentrerad-
 * portfolj, rk-01-kapitalforbranning, pf-03-diversifiering,
 * pf-09-taxloss-harvesting, km-051-kapitalvinstskatt, km-052-isk,
 * pf-08-isk-vs-aktiedepa, pf-14-pensionssparande, pf-06-aterinvestering,
 * km-055-inflation, ma-03-realrantan) finns i KURSREGISTER (verifierat i
 * 414-registret; kursKalla faller tillbaka på "Läroplanen" om ett
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

// ── De 3 portföljpraktikfrågorna ────────────────────────────────────────────

export const PORTFOLJPRAKTIK_MONSTER: FragMonster[] = [
  {
    id: "positionstorlek",
    karnord: [
      "positionstorlek", "positionsstorlek", "positionsstorleken",
      "risk per position", "positionsplanering", "hur stor position",
      "hur stora positioner", "aktieposition", "aktiepositioner",
    ],
    starkord: [
      "position", "storlek", "stopp", "risk", "portfölj", "aktie",
      "koncentrerad", "kelly", "fördelning",
    ],
    bygga: (reg) => {
      const pfAntal = reg.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
      const rkAntal = reg.filter((r) => r.kategori === "RISKHANTERING").length;
      const kallor = [
        kursKalla(reg, "pf-02-position-sizing", "Läroplanen — portföljhanteringen: hur en position storleksätts baklänges från risken"),
        kursKalla(reg, "pf-11-koncentrerad-portfolj", "Läroplanen — den koncentrerade skolan: 5–10 bolag och dess pris"),
        kursKalla(reg, "rk-01-kapitalforbranning", "Läroplanen — kapitalförbränning: varför storleken bestämmer om du överlever felen"),
        kursKalla(reg, "pf-03-diversifiering", "Läroplanen — diversifiering: storlekens gränspost"),
      ];
      const k = kallor[0];
      const pf02 = reg.find((r) => r.slug === "pf-02-position-sizing");
      return {
        text:
          `Positionsstorlek — hur stor en enskild aktieposition ska vara — är portföljhanteringens mest konkreta beslut, och det finns en metod som gör det mekaniskt i stället för magkänsla: att räkna storleken BAKLÄNGES från risken (allt nedan är utbildning i hur metoden räknas — ingen rekommendation om hur DU ska placera):\n\n1️⃣ METODEN — välj först hur stor del av portföljen du maximalt är beredd att förlora på EN position (en klassisk övningsregel i litteraturen: en procent), och räkna sedan ut antalet aktier: Antal = (portfölj × riskandel) ÷ (kurs − stoppnivå). Aritmetisk illustration med påhittade tal: portfölj 100 000 kronor, riskandel 1 procent = 1 000 kronor. Köpkurs 50 kronor med stopp på 45 (risk 5 kronor per aktie) ger 1 000 ÷ 5 = 200 aktier — en position på 10 000 kronor, alltså 10 procent av portföljen. Notera mekaniken: stoppavståndet, inte magkänslan, bestämmer positionens storlek.\n2️⃣ KÄNSLIGHETEN — flytta stoppet till 48 kronor (risk 2 kronor per aktie) och samma 1 000-kronors risk bär 500 aktier = 25 000 kronor, en fjärdedel av portföljen. Två slutsatser följer: ett TÄTARE stopp ger en STÖRRE position vid oförändrad risk — men också större risk att stoppet triggas av prisbrus; och samma riskandel rymmer olika stora kronbelopp i olika volatila aktier. Det är därför frågan "hur stor?" aldrig har ett universellt svar — bara en metod att räkna det för sig (det är också Kelly-idéns kärna: sambandet mellan sannolikhet, utfall och storlek — basens monster äger den frågan, kursen länkas nedan).\n3️⃣ SKOLORNA OCH DERAS PRIS — den koncentrerade skolan (5–10 bolag, alltså ofta 10–20 procent per position) argumenterar att kunskapen om varje bolag är fördelen; den breda skolan svarar med kapitalförbränningens matte: en position som faller 50 procent kräver +100 procent för att återhämta sig, och ju tyngre den var, desto djupare hål. Enkel övningsregel att pröva på papper: riskera aldrig så mycket att tre fel I RAD (3 × 1 % = 3 %) känns som en kris — för det är ungefär vad slumpen serverar förr eller senare. Två skolor, två aritmetiker — utbildningens uppgift är att visa båda.\n\nI portföljhanteringsfamiljen finns ${pfAntal} kurser och i riskhanteringens ${rkAntal} — huvudkursen (${pf02 ? pf02.minuter + " min" : "i registret"}) äger hela positionsstorleksämnet. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "positionstorlek",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Position sizing", lank: "/kurser/pf-02-position-sizing", ikon: "🔗", beskrivning: "Storleken baklänges från risken" },
          { text: "Kursen: Koncentrerad portfölj", lank: "/kurser/pf-11-koncentrerad-portfolj", ikon: "🎯", beskrivning: "5–10-bolagsskolan" },
          { text: "Kursen: Kapitalförbränning", lank: "/kurser/rk-01-kapitalforbranning", ikon: "🔥", beskrivning: "Varför storleken avgör överlevnaden" },
          { text: "Kursen: Diversifiering", lank: "/kurser/pf-03-diversifiering", ikon: "🧺", beskrivning: "Storlekens gränspost" },
          { text: "Vad är tax-loss harvesting?", lank: "fragor:" + encodeURIComponent("vad är tax-loss harvesting?"), ikon: "🧾", beskrivning: "Nästa praktikfråga" },
        ],
        motfraga: { text: "Vad är tax-loss harvesting?", kategori: "portföljhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/pf-02-position-sizing" },
      };
    },
  },
  {
    id: "taxloss",
    karnord: [
      "tax loss harvesting", "tax-loss harvesting", "skatteförlustrealisering",
      "skatteförlustrealiseringen", "skörda förluster", "förlustavdrag",
      "förlustavdraget",
    ],
    starkord: [
      "förlust", "vinst", "kvittning", "realisera", "skatt", "aktiedepå",
      "december", "skatteår",
    ],
    bygga: (reg) => {
      const pfAntal = reg.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
      const kmAntal = reg.filter((r) => r.kategori === "SVENSK BOLAGSSKATT & JURIDIK").length;
      const kallor = [
        kursKalla(reg, "pf-09-taxloss-harvesting", "Läroplanen — att skörda en förlust mot en vinst: mekaniken och dess gränser"),
        kursKalla(reg, "km-051-kapitalvinstskatt", "Läroplanen — kapitalvinstskatten: sidan förlusten kvittas mot"),
        kursKalla(reg, "km-052-isk", "Läroplanen — schablonskatten: varför skörden bara bor i aktiedepån"),
        kursKalla(reg, "pf-08-isk-vs-aktiedepa", "Läroplanen — kontots två skattesystem"),
      ];
      const k = kallor[0];
      const pf09 = reg.find((r) => r.slug === "pf-09-taxloss-harvesting");
      return {
        text:
          `Tax-loss harvesting — på svenska skatteförlustrealisering eller att skörda förluster — är att medvetet sälja en position som står i förlust för att den realiserade förlusten ska få kvittas mot realiserade vinster i deklarationen, och sedan köpa tillbaka exponingen. Det är en av portföljpraktikens mest missförstådda mekaniker (allt nedan är utbildning i hur reglerna fungerar — skatten i ditt eget fall avgör Skatteverket, fråga alltid dem):\n\n1️⃣ VAR DEN FUNKAR — mekaniken bor i AKTIEDEPÅN, där vinster beskattas först när de realiseras (kapitalvinstskatten) och realiserade förluster får kvittas mot realiserade vinster samma år. I ISK och kapitalförsäkring beskattas istället hela värdet schablonmässigt varje år — där finns ingen post att kvitta, alltså ingen skörd att skörda. Aritmetisk illustration med påhittade tal: du har sålt aktie A med vinst 100 000 kronor och håller aktie B i förlust 40 000. Utan åtgärd: skatt 30 procent × 100 000 = 30 000 kronor. Säljer du B (realiserar förlusten) blir den beskattade vinsten 100 000 − 40 000 = 60 000 och skatten 30 % × 60 000 = 18 000 kronor — 12 000 kronor lägre skatt DETTA ÅRET.\n2️⃣ VAD DET VERKLIGEN ÄR — en RÄNTEFRI KREDIT, inte en gåva. Köper du tillbaka B behåller du exponingen men med ett NYTT lägre omkostnadsbelopp: nästa gång B stiger beskattas vinsten från det lägre underlaget, och skulden betalas tillbaka då. Tidsvärdet gör den ändå verklig: de 12 000 som får stanna kvar och arbeta (ränta på ränta) är skördens faktiska värde — pengar som får växa istället för att skickas till staten i förtid. I Sverige finns inte den amerikanska wash-sale-regeln som spärrar återköp — men exakt när återköpet läggs bäst (till exempel kring affärer samma dag) är Skatteverkets material att slå upp, inte mentorns.\n3️⃣ FALLGROPPARNA — december är skördens klassiska månad (sista chansen innan skatteåret stänger), men handelskostnaden (courtage och spread) kan äta det sparade vid små belopp; kvittningen gäller FÖRLUSTER MOT VINSTER (netton per år — stora enskilda förluster får inte automatisk återbäring utan sparas framåt); och en position som sålts enbart för skatten kan ha stigit vid återköpet — mekaniken försäkrar inte mot kursrisk, bara mot tidslag. Den ärliga sammanfattningen: skörden flyttar skatt i tiden och låter mellanskillnaden arbeta — den tar aldrig bort skatten.\n\nI portföljhanteringsfamiljen finns ${pfAntal} kurser och i den svenska skatt- och juridikkategorin ${kmAntal} — huvudkursen (${pf09 ? pf09.minuter + " min" : "i registret"}) går igenom skörden steg för steg. Som alltid: detta är utbildning i en metod — inga skatteråd, kontakta Skatteverket för ditt fall.` +
          kallradFler(kallor),
        amne: "taxloss",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Tax-loss harvesting", lank: "/kurser/pf-09-taxloss-harvesting", ikon: "🔗", beskrivning: "Skördens mekanik" },
          { text: "Kursen: Kapitalvinstskatt", lank: "/kurser/km-051-kapitalvinstskatt", ikon: "🧾", beskrivning: "Sidan förlusten kvittas mot" },
          { text: "Kursen: ISK — schablonskatt", lank: "/kurser/km-052-isk", ikon: "🏦", beskrivning: "Varför skörden bor i depån" },
          { text: "Kursen: ISK vs Aktiedepå", lank: "/kurser/pf-08-isk-vs-aktiedepa", ikon: "⚖️", beskrivning: "Kontots två skattesystem" },
          { text: "Vad är pensionssparande?", lank: "fragor:" + encodeURIComponent("vad är pensionssparande?"), ikon: "🕰️", beskrivning: "Tidshorisontens aritmetik" },
        ],
        motfraga: { text: "Vad är pensionssparande?", kategori: "portföljhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/pf-09-taxloss-harvesting" },
      };
    },
  },
  {
    id: "pension",
    karnord: [
      "pension", "pensionen", "pensionssparande", "pensionssparandet",
      "pensionsspar", "tjanstepension", "tjänstepensionen",
    ],
    starkord: [
      "sparande", "avkastning", "tidshorisont", "ränta", "månadsspar",
      "inflation", "årtionde", "långsiktigt",
    ],
    bygga: (reg) => {
      const pfAntal = reg.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
      const maAntal = reg.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
      const kallor = [
        kursKalla(reg, "pf-14-pensionssparande", "Läroplanen — portföljhanteringen: sparandet vars tidshorisont mäts i årtionden"),
        kursKalla(reg, "pf-06-aterinvestering", "Läroplanen — återinvesteringen: portföljens ränta på ränta"),
        kursKalla(reg, "km-055-inflation", "Läroplanen — inflationen: målet som tär på årsräntan"),
        kursKalla(reg, "ma-03-realrantan", "Läroplanen — realräntan: pengars tidsvärde efter inflation"),
      ];
      const k = kallor[0];
      const pf14 = reg.find((r) => r.slug === "pf-14-pensionssparande");
      return {
        text:
          `Pensionssparande är sparande vars tidshorisont mäts i årtionden i stället för månader — och det enkla som följer av det: när tiden är den stora resursen blir ränta på ränta mot inflation hela spelet (allt nedan är utbildning i mekanismerna — ingen rekommendation om hur DU ska spara):\n\n1️⃣ MEKANIKEN — månadssparande som får växa. Aritmetisk illustration med påhittade tal: 1 000 kronor i månaden i 30 år (360 insättningar = 360 000 kronor insatta) vid en antagen avkastning på 6 procent per år ≈ 0,5 procent per månad ger ett slutvärde på omkring 1 004 500 kronor — nästan tre gånger det insatta, och de sista åren tillväxer mer än hela det ursprungliga beloppet. Det är kurvans natur: de första årtiondet ser det ut som ingenting, det sista gör skillnaden. Därför är START, inte belopp, variabeln som aritmetiken belönar först.\n2️⃣ INFLATIONENS MOTRÄKNING — 1 004 500 kronor om 30 år är inte 1 004 500 kronor i dagens köpkraft. Vid 2 procent inflation per år i 30 år delas slutvärdet med 1,811 — realvärdet blir omkring 554 500 kronor. Det är realräntans hela poäng: avkastning MINUS inflation är den siffra ett decennielångt sparande faktiskt lever med, och skilnaden mellan 4 och 6 procent nominellt låter liten per år men fördubblas till något helt annat över 360 månader. Därför hör makron hemma i pensionsmatten, inte bara i nyhetsflödet.\n3️⃣ DE TRE MEKANISKA FRÅGORNA — utbildningen kring långsiktigt sparande kretsar kring tre frågor, alla mekaniska: HORISONT (när pengarna ska användas — den styr hur stora svängningar portföljen aritmetiskt kan bära innan de måste realiseras i en dal), SKATTEFORM (schablonskatt mot beskattning vid realisering — basens monster äger ISK-frågorna, länken nedan), och AVGIFT (en avgiftsskillnad på en procentpunkt per år är inte en procent av slutvärdet utan av VARJE års värde — sammanlagt en sjättedel eller mer av ett trettioårigt slutvärde). Ingen av de tre har ett rätt svar utanför ditt eget liv — därför slutar utbildningen vid mekanismerna och deras aritmetik.\n\nI portföljhanteringsfamiljen finns ${pfAntal} kurser och i makroekonomi och ränta ${maAntal} — huvudkursen (${pf14 ? pf14.minuter + " min" : "i registret"}) äger pensionssparande-ämnet. Som alltid: detta är utbildning i mekanismer — inga pensionsråd.` +
          kallradFler(kallor),
        amne: "pension",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Pensionssparande", lank: "/kurser/pf-14-pensionssparande", ikon: "🔗", beskrivning: "Tidshorisontens ämne" },
          { text: "Kursen: Återinvestering", lank: "/kurser/pf-06-aterinvestering", ikon: "📈", beskrivning: "Portföljens ränta på ränta" },
          { text: "Kursen: Inflation", lank: "/kurser/km-055-inflation", ikon: "🔥", beskrivning: "Målet som tär på räntan" },
          { text: "Kursen: Realräntan", lank: "/kurser/ma-03-realrantan", ikon: "⚖️", beskrivning: "Tidsvärdet efter inflation" },
          { text: "Hur stor ska en aktieposition vara?", lank: "fragor:" + encodeURIComponent("hur stor ska en aktieposition vara?"), ikon: "📏", beskrivning: "Första praktikfrågan" },
        ],
        motfraga: { text: "Hur stor ska en aktieposition vara?", kategori: "portföljhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/pf-14-pensionssparande" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre portföljpraktik-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltPortfoljpraktik(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of PORTFOLJPRAKTIK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
