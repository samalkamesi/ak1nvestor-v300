/**
 * AI-MENTORN 2.0 — LÖNSAMHETSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 9, s6-u2).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de tretton tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + extra, makro, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, agande, redovisningsdjup, djup,
 * historia):
 *   1. DuPont-analysen (ln-01 primär + v09-roe + ln-04 + v10-skuldsattningsgrad)
 *      — ROE-uppdelningens tre komponenter, 1910-talets ramberäkning
 *   2. ROIC (roic-01 primär + ln-01 + ln-02-resultatkvalitet + ln-04)
 *      — lönsamhet utan hävstångens makeup, ROIC mot kapitalkostnaden
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (626 kärnord LIVE-lästa ur samtliga
 * tretton lager med den riktiga matcharen; verktyg/_s6u2omg9-sond.mjs):
 * "vad är dupont-analysen?" och "vad är roic?" är helt fria (NULL genom
 * hela kedjan) och samtliga planerade kärnord ligger UTANFÖR felstavnings-
 * toleransen mot varje syskonkärnord (närhetsdiffen: INGA träffar).
 * ÄMNESLUCKA: kategorin LÖNSAMHET är registrets sjunde största (7 kurser)
 * men hade INGET eget lager — samma lucktyp som redovisningsdjup-syskonet
 * fann i BOKFÖRING. Första avsågna kandidater som DOG i sonden: optioner
 * (nästa-lagret äger options-familjen), ISK/skatt och återköp (basen äger),
 * moat (extra äger), våglära/AKM1/konfluens (basens ekosystem-monster),
 * private equity (basen), soliditet (basen:kapitalstruktur). Varje svar
 * bär FYRA källor med numrerad Källor-rad + FYRA kurslänkar + en levande
 * fragor:-knapp — noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt, testfallen H/I
 * bevisar båda vägarna):
 *   • Basen äger VARIABELUPPSLAGET (V07 bruttomarginal, V08 EBITDA-marginal,
 *     V09 ROE, V10 skuldsättningsgrad, V20 vinst per aktie/återköp):
 *     formuleringar som bär variabeltitel-orden fångas av basen FÖRE detta
 *     lager ("hur räknar man isär roe?" → basens V9-svar, bevisat LIVE i
 *     sonden). Detta lager äger DUPONT- och ROIC-orden som basens uppslag
 *     saknar — de är komplement, inte konkurrenter.
 *   • Praktik-lagret äger marginal-FAMILJEN (vinstmarginal, rörelsemarginal,
 *     marginalanalys) — DuPont-texten nämner vinstmarginalen som KOMPONENT
 *     i text men bär inte ordet som kärnord. Knappen "Vad är
 *     vinstmarginal?" i praktik-testets anda länkas inte här; i stället
 *     länkar DuPont-svaret till sitt eget syskon ("Vad är ROIC?").
 *   • Redovisningsdjup-lagret äger EBITDA-familjen — ROIC-texten nämner
 *     EBITDA i text (NOPAT byggs på rörelseresultatet) utan att bära
 *     ebitda-orden som kärnord; "nopat", "wacc" och "kapitalkostnad" är
 *     detta lagrets (fria i sonden, dokumenterat ovan).
 *   • Basen äger "spread" (aktiespread) — ROIC-svaret talar om "marginalen
 *     mot kapitalkostnaden" i stället för "spread mellan ROIC och WACC" i
 *     kärnordsposition; WACC nämns i text och är kärnord (fritt).
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som historia-lagrets
 * krasch-notis): kärnordet "roic" (4 tecken, tål 1 fel) kan teoretiskt
 * fånga korta främmande ord på avstånd 1 — närhetsdiffen mot samtliga 626
 * syskonkärnord fann INGA träffar och G2-fallet kör dem alla som frågor.
 * Talet i "du pont" är medvetet FRAS (matchas som sammanhängande sträng)
 * så att det aldrig kan fånga fristående "pont". AVSTÅTT efter sonden:
 * "spread"-orden (basen äger) och "vinstmarginal"-familjen (praktiken
 * äger) som kärnord — nämns i text, ägs av syskon.
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och var
 * död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det. Detta
 * lager kopplas in SIST — och testfall L läser widgetens kedjerad
 * MEKANISKT ur filen (fjorton lager i ordning + import) så att "lager
 * utan inkoppling" aldrig kan återkomma tyst.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de
 * rena funktionerna speglas hit). Semantisk likhet med motorn BEVISAS
 * av testets felstavningfall (B) och determinismfall (C). Driftvarning:
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
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla tretton lämnar
 * null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur lönsamhetsmått BERÄKNAS och
 * LÄSAS som metod — inga köp-/säljsignaler, inga placeringstips, inga
 * omdömen om enskilda bolag eller värdepapper. Exempel med siffror är
 * aritmetiska illustrationer av identiteten, aldrig utfästelser om
 * avkastning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-lonsamhetsdjup.mjs kan köra filen direkt i
 * Node. Alla källkurser (ln-01-dupont-analysen, v09-roe,
 * ln-04-kapitalbindning-och-rorelsekapital, v10-skuldsattningsgrad,
 * roic-01-avkastning-pa-investerat-kapital, ln-02-resultatkvalitet-och-
 * accruals) finns i KURSREGISTER (verifierat i 358-registret — spår 5:s
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

// ── De 2 lönsamhetsdjupfrågorna ─────────────────────────────────────────────

export const LONSAMHETSDJUP_MONSTER: FragMonster[] = [
  {
    id: "dupont",
    karnord: [
      "dupont", "du pont", "dupontanalys",
      "dupontmodellen", "dupontmodell",
    ],
    starkord: [
      "roe", "analys", "identitet", "marginal", "omsättning",
      "hävstång", "lönsamhet", "vinst", "kapital", "bolag", "formel",
    ],
    bygga: (reg) => {
      const lonsamhetAntal = reg.filter((r) => r.kategori === "LÖNSAMHET").length;
      const kallor = [
        kursKalla(reg, "ln-01-dupont-analysen", "Läroplanen — lönsamhetsdjupet, DuPont-identitetens tre komponenter"),
        kursKalla(reg, "v09-roe", "Läroplanen — nyckeltalet ROE som DuPont plockar isär"),
        kursKalla(reg, "ln-04-kapitalbindning-och-rorelsekapital", "Läroplanen — lönsamhetens andra halva: kapitalets omsättningshastighet"),
        kursKalla(reg, "v10-skuldsattningsgrad", "Läroplanen — skuldsättningsgraden, hävstångskomponentens risksida"),
      ];
      const k = kallor[0];
      const ln01 = reg.find((r) => r.slug === "ln-01-dupont-analysen");
      return {
        text:
          `DuPont-analysen är bolagsanalysens äldsta ramberäkning — utvecklad hos det amerikanska kemiföretaget Du Pont på 1910-talet — och poängen är EN enda multiplikativ identitet: avkastning på eget kapital (ROE) = vinstmarginal × omsättningshastighet på kapitalet × hävstång. Tre komponenter, en produkt (allt nedan är utbildning i hur metoden FUNGERAR — ingen kommentar om något enskilt bolag):\n\n1️⃣ VARFÖR IDENTITETEN ÄR ETT GLASÖGONPAR — två bolag kan visa EXAKT samma ROE med helt olika berättelser: det ena bär sin avkastning i en hög vinstmarginal (mycket vinst per omsatt krona — typiskt för licens- och mjukvarubolag), det andra i en hög omsättningshastighet (kapitalet vrider runt fort — typiskt för handel och distribution), och det tredje i hävstången (mer lånat kapital per krona eget). DuPont skiljer de tre historierna åt — och därmed också de tre RISKERNA: en marginal kan pressas av konkurrens, en omsättningshastighet kan stanna av, en hävstång förstärker i BÅDA riktningar.\n2️⃣ SÅ LÄSER DU KOMPONENTERNA — vinstmarginalen (praktik-lagrets ämne) fångar prissättning och kostnadskontroll; omsättningshastigheten binder samman med kapitalbindningen — hur mycket kapital som ligger bundet i lager och kundfordringar (lönsamhetens andra halva, som kapitalbindningskursen kallar det); hävstången är balansräkningens bidrag och läses bäst tillsammans med skuldsättningsgraden och soliditeten. Aritmetisk illustration av kraften: ROE 15 % kan vara 10 % marginal × 1,0 omsättningshastighet × 1,5 hävstång — men också 5 % × 1,5 × 2,0. Samma produkt, tre riskprofiler.\n3️⃣ GRÄNSERNA — identiteten säger HUR avkastningen är sammansatt, inte OM den är hållbar eller ens äkta: hävstångskomponenten målar ROE snyggt i uppgången och elakartat i nedgången, och själva vinsten kan bära accruals av olika kvalitet. Därför kompletteras DuPont av ROIC — som tar bort finansieringens makeup och frågar vad verksamheten själv avkastar (knappen nedan) — och av resultatkvalitetsstudiet.\n\nI kategorin lönsamhet finns ${lonsamhetAntal} kurser — DuPont-kursen (${ln01 ? ln01.minuter + " min" : "i registret"}) plockar isär identiteten steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "dupont",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Du Pont-analysen", lank: "/kurser/ln-01-dupont-analysen", ikon: "🧮", beskrivning: "Plocka isär ROE — tre komponenter" },
          { text: "Nyckeltalet: ROE (Return on Equity)", lank: "/kurser/v09-roe", ikon: "📈", beskrivning: "Talet DuPont förklarar" },
          { text: "Kursen: Kapitalbindning och rörelsekapital", lank: "/kurser/ln-04-kapitalbindning-och-rorelsekapital", ikon: "🔄", beskrivning: "Omsättningshastighetens grund" },
          { text: "Nyckeltalet: Skuldsättningsgrad", lank: "/kurser/v10-skuldsattningsgrad", ikon: "⚖️", beskrivning: "Hävstångskomponentens risksida" },
          { text: "Vad är ROIC?", lank: "fragor:" + encodeURIComponent("vad är roic?"), ikon: "🎯", beskrivning: "Lönsamhet utan hävstångens makeup — detta lagret" },
        ],
        motfraga: { text: "Vad är ROIC?", kategori: "lönsamhet" },
        fordjupa: { text: k.titel, lank: "/kurser/ln-01-dupont-analysen" },
      };
    },
  },
  {
    id: "roic",
    karnord: [
      "roic", "avkastning på investerat kapital",
      "investerat kapital", "nopat",
      "wacc", "kapitalkostnad",
    ],
    starkord: [
      "hävstång", "makeup", "avkastning", "lönsamhet", "vinst",
      "skuld", "ebitda", "kapital", "bolag", "jämföra", "spread",
    ],
    bygga: (reg) => {
      const lonsamhetAntal = reg.filter((r) => r.kategori === "LÖNSAMHET").length;
      const kallor = [
        kursKalla(reg, "roic-01-avkastning-pa-investerat-kapital", "Läroplanen — lönsamhetsdjupet, ROIC utan hävstångens makeup"),
        kursKalla(reg, "ln-01-dupont-analysen", "Läroplanen — DuPont-identiteten som ROIC kompletterar"),
        kursKalla(reg, "ln-02-resultatkvalitet-och-accruals", "Läroplanen — är vinsten äkta? Kvaliteten i täljaren"),
        kursKalla(reg, "ln-04-kapitalbindning-och-rorelsekapital", "Läroplanen — nämnarens bindningar: rörelsekapitalet"),
      ];
      const k = kallor[0];
      const roic = reg.find((r) => r.slug === "roic-01-avkastning-pa-investerat-kapital");
      return {
        text:
          `ROIC — avkastning på investerat kapital — svarar på en enda fråga som ROE aldrig kan besvara ensam: vad avkastar VERKSAMHETEN per krona kapital som jobbar i den, oavsett hur kapitalet finansierats (utbildning i måttets mekanik — inga omdömen om enskilda bolag):\n\n1️⃣ FORMEN — ROIC = rörelseresultat efter skatt (NOPAT) ÷ investerat kapital. NOPAT byggs vidare från rörelseresultatet (EBIT-väggen — som redovisningsdjup-lagrets ämne — är grannvallen): finansiella poster räknas BORT, för de hör till finansieringen. Nämnaren är eget kapital plus räntebärande skuld — det kapital som bolaget faktiskt sysselsätter i verksamheten.\n2️⃣ VARFÖR "UTAN HÄVSTÅNGENS MAKEUP" — ROE kan höjas mekaniskt: håll verksamheten oförändrad och låna mer, så stiger avkastningen på det egna kapitalet (DuPont-identitetens tredje komponent). ROIC tar bort den effekten — finansieringen lämnar både täljare och nämnare — och det som återstår är verksamhetens egen kraft. Därför är ROIC standardmåttet när man jämför bolag med olika skuldsättning, och därför är kapitalbindningen nämnarens dolda järn: lager och kundfordringar som växer snabbare än försäljningen binder kapital och pressar ROIC även när vinsten ser stark ut (lönsamhetens andra halva).\n3️⃣ SÅ LÄSES TALET — ROIC jämförs med kapitalkostnaden (WACC — genomsnittlig kostnad för eget och lånat kapital): en avkastning över kapitalkostnaden betyder att bolaget skapar värde på varje ytterligare krona det binder; en avkastning under den betyder att tillväxten kostar mer än den producerar — att växa sig fattigare är möjligt. Läsningen är alltid ÖVER TID och MOT BRANSCHEN (sektorkursernas medianer) — en enstaka siffra säger lite. Och som alltid med täljare: kolla kvaliteten — är vinsten äkta eller accruals-buren? Resultatkvalitetskursen är densamma kontrollen här som i DuPont-arbetet.\n\nI kategorin lönsamhet finns ${lonsamhetAntal} kurser — ROIC-kursen (${roic ? roic.minuter + " min" : "i registret"}) går igenom NOPAT-bygget och nämnarens fallgropar steg för steg. Som alltid: detta är utbildning i hur måttet byggs och läses — inga placeringstips.` +
          kallradFler(kallor),
        amne: "roic",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: ROIC — lönsamhet utan hävstångens makeup", lank: "/kurser/roic-01-avkastning-pa-investerat-kapital", ikon: "🎯", beskrivning: "NOPAT, investerat kapital, WACC-läsningen" },
          { text: "Kursen: Du Pont-analysen", lank: "/kurser/ln-01-dupont-analysen", ikon: "🧮", beskrivning: "Kompletterande identitet — ROE i tre bitar" },
          { text: "Kursen: Resultatkvalitet — är vinsten äkta?", lank: "/kurser/ln-02-resultatkvalitet-och-accruals", ikon: "🔍", beskrivning: "Kvalitetskontrollen i täljaren" },
          { text: "Kursen: Kapitalbindning och rörelsekapital", lank: "/kurser/ln-04-kapitalbindning-och-rorelsekapital", ikon: "🔄", beskrivning: "Nämnarens bindningar" },
          { text: "Vad är DuPont-analysen?", lank: "fragor:" + encodeURIComponent("vad är dupont-analysen?"), ikon: "🧮", beskrivning: "ROE-uppdelningen — detta lagret" },
        ],
        motfraga: { text: "Vad är DuPont-analysen?", kategori: "lönsamhet" },
        fordjupa: { text: k.titel, lank: "/kurser/roic-01-avkastning-pa-investerat-kapital" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två lönsamhetsdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltLonsamhetsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of LONSAMHETSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
