/**
 * AI-MENTORN 2.0 — UTDELNINGSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 12, s6-u2).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de nitton tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, ägande, redovisningsdjup, djup,
 * historia, lonsamhetsdjup, tsdjup, skattedjup, beteendedjup, riskdjup samt
 * syskonet s6-u1:s riskmåttsdjup som dök upp på disk under detta fönster; i
 * samma fönster dök även syskonet s6-u3:s förväntningsdjup upp och lades
 * EFTER detta lager — kedjans slutläge: tjugoett lager):
 *   1. Utdelningsfällor (ud-04-utdelningsfallor primär + km-063-
 *      direktavkastning + ud-01-payout-ratio + ud-08-speciella-utdelningar)
 *      — när hög direktavkastning är en prissatt varning, inte en gåva
 *   2. Aktieåterköp (km-066-utdelning-vs-aterkop primär + v20-aterekop-
 *      egna-aktier + ks-02-kapitalallokering + ud-02-aterinvestering) —
 *      kapitalåterbäringens andra dörr och dess aritmetik
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (754 kärnord LIVE-lästa ur arton lager
 * med den riktiga matcharen; verktyg/_s6u2-sond-omg12.mjs — omkörd mot
 * nittonlagersläget när syskonets riskmåttsdjup dök upp på disk, samma
 * resultat: alla kandidater fria):
 * "vad är utdelningsfällor?", "vad är en utdelningsfälla?", "vad är yield
 * trap?", "vad är en avkastningsfälla?", "vad är utdelningsgrad?", "vad är
 * aktieåterköp?" och "vad är ett återköpsprogram?" är helt fria (NULL genom
 * hela kedjan) och samtliga planerade kärnord ligger UTANFÖR
 * felstavningstoleransen mot varje syskonkärnord (närhetssonden: INGA
 * grannar). ÄMNESLUCKA: kategorin UTDELNINGSSTRATEGI är registrets näst
 * största enskilda kursfamilj utan eget lager (12 kurser; störst utan eget
 * lager var RISKHANTERING som riskdjup-syskonet tog omgången innan) —
 * samma lucktyp som lönsamhetsdjup-syskonet fann i LÖNSAMHET. Syskonet
 * s6-u1:s parallella omgång 12-leverans (riskmåttsdjup: sharpe-kvoten,
 * beta/capm/standardavvikelse som familjeord) dök upp på disk under detta
 * fönster och respekteras enligt disk-läge-presedensen (tsdjup i 16-läget,
 * riskdjup i 18-läget): detta lager kopplas in EFTER deras —
 * utdelningsdjup är komplement, inte konkurrent (noll kärnordsöverlapp:
 * deras måttfamilj delar inte ett enda ord med utdelningsfamiljen).
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt, testfallen H/I
 * bevisar båda vägarna; emission/V19-precedensen från kapitalmekanik-lagret):
 *   • Basens utdelnings-monster äger utdelnings-GRUNDORDEN (utdelning,
 *     utdelningar, utdelningsaktie, aktieutdelning, utdelningsstrategi,
 *     utdelningsvägen, direktavkastning, dividend, payout ratio,
 *     återinvestering): detta lagrets kärnord är FAMILJEORDEN basens
 *     uppslag saknar (utdelningsfälla, yield trap, avkastningsfälla,
 *     utdelningsgrad, aktieåterköp, återköpsprogram). Källor och kurslänkar
 *     FÅR peka på basens kärnordskurser (km-063-direktavkastning, ud-01-
 *     payout-ratio, ud-02-aterinvestering är här endast KÄLLOR, aldrig
 *     kärnord) — källägande ≠ kärnordsägande.
 *   • Basens V20-uppslag äger det NAKNA ordet "återköp" (variabelNyckelord
 *     bygger ord ur v20-kursens titel "Återköp av egna aktier": frågorna
 *     "vad är återköp?", "hur fungerar återköp?" och "vad är återköp av
 *     aktier?" fångas av basen FÖRE detta lager — bevisat i sonden).
 *     Detta lager äger endast SAMMANSÄTTNINGARNA (aktieåterköp,
 *     återköpsprogram) som basens uppslag inte matchar inom tolerans.
 *     Dokumenterad risk, samma bokföring som riskdjup-lagrets "svarta"-
 *     kollision: det existerade före leveransen och är basens beteende.
 *   • Skattedjup-lagret äger beskattningens djup (ISK, kapitalförsäkring,
 *     utdelningsskatt) — återköp-svaret nämner skatteaspekten som
 *     GRANNOMRÅDE i text utan att bära skatte-kärnord.
 *   • Riskdjup-lagret äger skuldfällan — utdelningsfälle-svaret nämner
 *     skuldfinansierad utdelning som GRANNMEKANIK (syskonkällan ks-03 är
 *     deras primära källa, här endast referens i text).
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som riskdjup-lagrets
 * kortordskur): "drip" (4 tecken, exakt matchning) skulle kunna bära
 * ud-05-kursen men är MEDVETET struket som kärnord — kortorden är
 * felstavningsosäkra och frågan "vad är drip?" förblir null (API-flödet).
 * Ud-05 är inte heller källa här; ämnet DRIP väntar på ett framtida lager.
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
 *     ?? svaraLokaltRiskmattsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltUtdelningsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltForvantningsdjup(q, KURSREGISTER)
 * Detta lager levererades SIST och lades sedan EFTER syskonet förväntningsdjup
 * i samma fönster (däras wiring såg detta lager på disk och respekterade det) —
 * slutläget är NÄST SIST, vilket är lika säkert: en senare länk kan aldrig
 * stjäla en fråga från ett tidigare lager, och detta lager fångar bara frågor
 * som alla lager före det lämnar null på. Omvänt vaktar testfall I på att
 * dessa frågor INTE fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur utdelningsgrad, direktavkastning
 * och återköp BERÄKNAS och LÄSAS som metod — inga köp-/säljsignaler, inga
 * placeringstips, inga omdömen om enskilda bolag eller värdepapper.
 * Exempel med siffror är aritmetiska illustrationer av mekaniken, aldrig
 * utfästelser om avkastning eller varningar om enskilda titlar.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-utdelningsdjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (ud-04-utdelningsfallor, km-063-direktavkastning, ud-01-
 * payout-ratio, ud-08-speciella-utdelningar, km-066-utdelning-vs-aterkop,
 * v20-aterekop-egna-aktier, ks-02-kapitalallokering, ud-02-aterinvestering)
 * finns i KURSREGISTER (verifierat i 358-registret — spår 5:s rebake lägger
 * TILL kurser, slugarna består; kursKalla faller tillbaka på "Läroplanen"
 * om ett framtida register läcker en slug).
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

// ── De 2 utdelningsdjupfrågorna ─────────────────────────────────────────────

export const UTDELNINGSDJUP_MONSTER: FragMonster[] = [
  {
    id: "utdelningsfalla",
    karnord: [
      "utdelningsfälla", "utdelningsfällan", "utdelningsfällor",
      "utdelningsfalla", "yield trap", "avkastningsfälla",
      "utdelningsgrad",
    ],
    starkord: [
      "utdelning", "direktavkastning", "vinst", "kassaflöde",
      "skuld", "varning", "hållbar", "för hög", "nedtagning",
    ],
    bygga: (reg) => {
      const udAntal = reg.filter((r) => r.kategori === "UTDELNINGSSTRATEGI").length;
      const kallor = [
        kursKalla(reg, "ud-04-utdelningsfallor", "Läroplanen — utdelningsstrategin, fällorna som ser ut som gåvor"),
        kursKalla(reg, "km-063-direktavkastning", "Läroplanen — direktavkastningens aritmetik (kärnordet direktavkastning ägs av basen)"),
        kursKalla(reg, "ud-01-payout-ratio", "Läroplanen — utdelningsgradens mått (kärnordet payout ratio ägs av basen)"),
        kursKalla(reg, "ud-08-speciella-utdelningar", "Läroplanen — engångsposter som kan förvilla (kärnordsfamiljen ägs av basen)"),
      ];
      const k = kallor[0];
      const ud04 = reg.find((r) => r.slug === "ud-04-utdelningsfallor");
      return {
        text:
          `Utdelningsfällan (yield trap) är situationen då en hög direktavkastning inte är en gåva utan en PRISATT varning: marknaden har flyttat kursen neråt för att den väntar sig en nedtagning av utdelningen, och den höga procentsiffran är resultatet av den rörelsen — inte ett tecken på generositet (allt nedan är utbildning i hur mekaniken läses — ingen kommentar om något enskilt bolag):\n\n1️⃣ SÅ RÄKNAS UTDELNINGSGRADEN (PAYOUT RATIO) — utdelning per aktie ÷ vinst per aktie. Aritmetisk illustration: ett bolag tjänar 4 kr per aktie och delar ut 5 kr per aktie ⇒ utdelningsgraden är 5 ÷ 4 = 125 %. Varje årets utdelning överstiger årets vinst, och var femte utdelningskrona (1 av 5) saknar täckning i det årets resultat — den tas ur kassan, ur sålda tillgångar eller ur ny skuld. En engångsföreteelse kan vara rimlig (balanseffekt); flera år i rad över 100 % är fällans kärna: utdelningen äter balansräkningen medan procentsiffran fortfarande ser generös ut.\n2️⃣ PROCENTENS SPEGELEFFEKT — direktavkastningen = utdelning ÷ kurs, och nämnaren rör sig. Aritmetisk illustration: utdelningen 10 kr per aktie på kursen 200 kr ger 5 %. Faller kursen till 100 kr — oförändrad utdelning — står siffran plötsligt på 10 %. Dubblad "avkastning" utan att en enda krona mer delats ut: hela ökningen kom från kursfallet. Om nedgången samtidigt speglar en väntad nedtagning till 5 kr är den "äkta" framförda avkastningen åter 5 % — skillnaden mellan siffran på skärmen och siffran i grundantagandet är just fällan. Därför läses direktavkastning ALDRIG utan sin utdelningsgrad och utan källan till pengarna.\n3️⃣ DE TRE RÖDA FLAGGORNA — (a) utdelningsgrad över 100 % i flera år: utdelningen tas ur annat än årets vinst; (b) utdelning finansierad med upptagen skuld: mekaniken gränsar till skuldfällan (syskonämnet i riskdjup-lagret — skuldens struktur avgör om svängen blir farlig); (c) återkommande "speciella utdelningar": engångsposter som varje år förklarar sig själva som undantag. Hållbarheten prövas mot det FRITT kassaflödet — inte bara redovisad vinst — och mot utdelningens bana över tiden (en lugnt växande utdelning är en annan historia än en som hålls uppe till varje pris).\n\nI kategorin utdelningsstrategi finns ${udAntal} kurser — fällkursen (${ud04 ? ud04.minuter + " min" : "i registret"}) går igenom varningstecknen, aritmetiken och hur hållbarheten prövas steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "utdelningsfalla",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Utdelnings-fällor", lank: "/kurser/ud-04-utdelningsfallor", ikon: "🪤", beskrivning: "Fällans mekanik och varningstecknen" },
          { text: "Kursen: Direktavkastning", lank: "/kurser/km-063-direktavkastning", ikon: "💸", beskrivning: "Procentens aritmetik — och spegeleffekten" },
          { text: "Kursen: Payout ratio", lank: "/kurser/ud-01-payout-ratio", ikon: "📏", beskrivning: "Utdelningsgraden som mått" },
          { text: "Kursen: Speciella utdelningar", lank: "/kurser/ud-08-speciella-utdelningar", ikon: "🎁", beskrivning: "Engångsposter som kan förvilla" },
          { text: "Vad är aktieåterköp?", lank: "fragor:" + encodeURIComponent("vad är aktieåterköp?"), ikon: "🔁", beskrivning: "Kapitalåterbäringens andra dörr — detta lagret" },
        ],
        motfraga: { text: "Vad är aktieåterköp?", kategori: "utdelningsstrategi" },
        fordjupa: { text: k.titel, lank: "/kurser/ud-04-utdelningsfallor" },
      };
    },
  },
  {
    id: "aktieaterkop",
    karnord: [
      "aktieåterköp", "aktieåterköpet", "aktieåterköps",
      "aktieåterköpsprogram", "återköpsprogram", "återköpsprogrammet",
    ],
    starkord: [
      "aktier", "utdelning", "ägare", "vinst", "kurs",
      "kapital", "styrelse", "antal", "andel",
    ],
    bygga: (reg) => {
      const udAntal = reg.filter((r) => r.kategori === "UTDELNINGSSTRATEGI").length;
      const kallor = [
        kursKalla(reg, "km-066-utdelning-vs-aterkop", "Läroplanen — utdelningsstrategin, återbäringens två dörrar"),
        kursKalla(reg, "v20-aterekop-egna-aktier", "Läroplanen — AKM1 V20, återköpets plats i kapitalstrukturen"),
        kursKalla(reg, "ks-02-kapitalallokering", "Läroplanen — styrelsens fem vägar (kärnordet kapitalallokering ägs av basen)"),
        kursKalla(reg, "ud-02-aterinvestering", "Läroplanen — återinvesteringens ränta-på-ränta (kärnordet återinvestering ägs av basen)"),
      ];
      const k = kallor[0];
      const km066 = reg.find((r) => r.slug === "km-066-utdelning-vs-aterkop");
      return {
        text:
          `Aktieåterköp är den andra dörren för kapitalåterbäring: i stället för att dela ut pengar köper bolaget tillbaka sina egna aktier — och antalet aktier som bär framtida vinster minskar (allt nedan är utbildning i hur mekaniken beräknas — ingen kommentar om något enskilt bolag):\n\n1️⃣ ARITMETIKEN — samma totalvinst på färre aktier ger högre vinst per aktie, utan att verksamheten tjänar en krona mer. Illustration: ett bolag med 1 000 aktier och 10 000 kr i årlig vinst ⇒ 10 kr per aktie. Köper bolaget tillbaka 100 aktier (10 % av upplaget) återstår 900 aktier som bär samma 10 000 kr ⇒ 10 000 ÷ 900 ≈ 11,1 kr per aktie — +11 % i vinst per aktie av ren matematik. Det är därför återköp ibland kallas en tyst utdelning: värdet flyttas till kvarvarande aktier i stället för att betalas ut i kontanter.\n2️⃣ ÅTERKÖP MOT UTDDELNING — tre klassiska skillnader (som UTBILDNING, inte råd): KRONTALLET — utdelningen är synliga kronor hos ägaren, återköpet är en kursmekanism som syns först i andelen; SKATTEN — utdelning beskattas hos ägaren det året den betalas, medan återköpet skjuter beskattningen till ägarens egna försäljningar (de svenska sparformerna har egna regler — skattedjup-lagret äger det spåret); VALFRIHETEN — utdelningen tvingar alla ägare att ta emot kapital, återköpet låter varje ägare behålla sin andel ostörd. Samma krona fungerar olika beroende på dörr.\n3️⃣ NÄR MEKANIKEN SKAPAR ELLER FÖRSTÖR VÄRDE — återköp köper in sig i samma värderingslogik som allt annat: köper bolaget aktier UNDER inre värde överförs värde till kvarvarande ägare; köper det ÖVER inre värde förstörs värde — exakt som vid varje annat förvärv. Två varningstecken ur litteraturen: återköp som finansieras med skuld i tider med hög ränta (gränsar till skuldfällans mekanik — riskdjup-lagret), och återköp som främst gör vinst-per-aktie-räknaren snyggare inför ett kvartal (styrelsens egentliga fem alternativ — återinvestera i verksamheten, förvärva, dela ut, köpa tillbaka, behålla buffert — finns i kapitalallokeringskursen). En tredje väg som aldrig får glömmas: behålla vinsten i verksamheten och låta den arbeta — återinvesteringens ränta-på-ränta är historiens mest underskattade återbäring.\n\nI kategorin utdelningsstrategi finns ${udAntal} kurser — jämförelsekursen (${km066 ? km066.minuter + " min" : "i registret"}) ställer de två dörrarna sida vid sida med räkneexempel. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "aktieaterkop",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Utdelning vs återköp", lank: "/kurser/km-066-utdelning-vs-aterkop", ikon: "⚖️", beskrivning: "De två dörrarna sida vid sida" },
          { text: "Kursen: Återköp av egna aktier (V20)", lank: "/kurser/v20-aterekop-egna-aktier", ikon: "🔁", beskrivning: "Återköpet i kapitalstrukturen" },
          { text: "Kursen: Kapitalallokering", lank: "/kurser/ks-02-kapitalallokering", ikon: "🧭", beskrivning: "Styrelsens fem vägar" },
          { text: "Kursen: Återinvestering", lank: "/kurser/ud-02-aterinvestering", ikon: "🌱", beskrivning: "Den tredje vägen — ränta på ränta" },
          { text: "Vad är utdelningsfällor?", lank: "fragor:" + encodeURIComponent("vad är utdelningsfällor?"), ikon: "🪤", beskrivning: "När hög utdelning är en varning — detta lagret" },
        ],
        motfraga: { text: "Vad är utdelningsfällor?", kategori: "utdelningsstrategi" },
        fordjupa: { text: k.titel, lank: "/kurser/km-066-utdelning-vs-aterkop" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två utdelningsdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltUtdelningsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of UTDELNINGSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
