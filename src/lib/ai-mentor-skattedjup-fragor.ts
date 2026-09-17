/**
 * AI-MENTORN 2.0 — SKATTEDJUPFÖRHANDSFRÅGOR (spår 6, omgång 10, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de tretton tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + extra, makro, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, agande, redovisningsdjup, djup och
 * syskonet historia som skrevs i förra fönstret):
 *   1. Kapitalförsäkring (sj-05-kapitalforsakring-vs-isk primär +
 *      km-052-isk + km-051-kapitalvinstskatt + km-050-utdelningsskatt-30)
 *      — sparandet i försäkringsform och dess schablonmekanik
 *   2. Bolagsskatt 20,6 % (km-049-bolagsskatt-206 primär +
 *      km-050-utdelningsskatt-30 + km-051-kapitalvinstskatt +
 *      km-053-312reglerna) — bolagets skatt och dubbelbeskattningens kedja
 *   3. Optionsbeskattning (sj-04-optionsbeskattning primär +
 *      km-051-kapitalvinstskatt + km-050-utdelningsskatt-30 +
 *      km-049-bolagsskatt-206) — när optionens värde blir skattepliktigt
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (626 kärnord LIVE-lästa ur samtliga
 * tretton lager, mekaniskt, med den riktiga matcharen;
 * verktyg/_s6u3-sond-omg10.mjs): frågeformuleringarna "vad är
 * kapitalförsäkring?", "vad är bolagsskatt?" och "hur fungerar
 * optionsbeskattning?" är helt fria (NULL genom hela kedjan). Kategorierna
 * SVENSK BOLAGSSKATT & JURIDIK + SKATT & JURIDIK bär tio kurser i registret
 * — varav bolagsstämma-kursen ägs av agande-lagret och ISK-schablonfrågan
 * av basen — och är spårets största återstående otäckta ämnesyta. Tre fria
 * alternativ som AVSOGS i sonden (dokumenterade i anspråksfilen): hela
 * 3:12-ytan samt kapitalvinst-/käll-/schablon-/utdelningsskatt-ordfamiljen
 * (basens skatt-monster äger dem), soliditet/skuldsättningsgrad/
 * intäktsstabilitet (basens kapitalstruktur- och variabelmonster),
 * nätverkseffekter/moat-erosion/katalysator/tillväxt (bas + extra).
 * Varje svar bär FYRA kurslänkar (spårets "fler kurslänkar per svar") —
 * noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt, testfall H/I
 * bevisar båda vägarna):
 *   • Basen äger SKATT-GRUNDORDEN (skatt, beskattning, beskattas,
 *     kapitalvinstskatt, källskatt, schablonskatt, utdelningsskatt,
 *     3:12-reglerna — dess skatt-monster svarar på "hur fungerar ISK och
 *     skatt?"). Detta lagrets kärnord är medvetet FAMILJEORDEN basen
 *     saknar: kapitalförsäkring, bolagsskatt, optionsbeskattning,
 *     personaloptioner, aktieoptioner, dubbelbeskattning, avkastningsskatt.
 *     Svaren nämner "skatt" och "beskattning" i TEXT men bär dem ej som
 *     kärnord. Källor och kurslänkar FÅR peka på basens kärnordskurser
 *     (km-052-isk, km-051, km-053) — källägande ≠ kärnordsägande
 *     (emission/V19-precedensen från kapitalmekanik-lagret).
 *   • Basen äger utdelnings-GRUNDORDEN — bolagsskatt-svaret beskriver
 *     utdelningsbeskattningen som LED i kedjan (mekanik) och knappen
 *     "Hur beskattas utdelningar?" länkar medvetet till basens
 *     utdelnings-monster (bevisat LIVE i kedjan).
 *   • Nästa-lagret äger options-GRUNDORDEN (option/optioner/terminer) —
 *     detta lager äger BE.skattnings-orden (optionsbeskattning,
 *     personaloptioner, aktieoptioner); knappen "Vad är optioner?" länkar
 *     medvetet dit (bevisat LIVE i kedjan).
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som historia-lagrets
 * "krasch↔bransch"-notis): kärnordet "kf" (2 tecken → exakt matchning)
 * fångar frågor som ställer förkortningen rakt av ("vad är kf?") utan
 * felstavningstolerans — det kan inte fånga syskonkärnord (exakt krav),
 * och antistöldtestet kör samtliga syskonkärnord som frågar utan träff.
 * "aktieoptioner" ligger på redigeringstavstånd 5 från nästa-lagrets
 * "optioner" — över tolerans 2, bevisat i kedjetestets G2-svep.
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och var
 * död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det. Detta
 * lager kopplas in SIST — och testfall L läser widgetens kedjerad MEKANISKT
 * ur filen (fjorton lager i ordning + import) så att "lager utan
 * inkoppling" aldrig kan återkomma tyst.
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
 *     ?? svaraLokaltSkattedjup(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla tretton lämnar
 * null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur svensk beskattning av ägande
 * FUNGERAR som mekanik — inga skatteråd, inga kontorekommendationer
 * ("välj ISK/kapitalförsäkring"), inga uppläggstips, inga omdömen om
 * enskilda värdepapper. Varje svar pekar uttryckligen vidare: konkreta
 * beslut hör hemma hos Skatteverket och auktoriserad rådgivare — här
 * lär du dig mekanismerna att ställa rätt frågor med. Skattemekanik är
 * dessutom ett rörigt detaljregelage (siffror och regler ändras) —
 * kurserna bär detaljerna, svaren bär strukturen.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-skattedjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (sj-05-kapitalforsakring-vs-isk, km-052-isk,
 * km-051-kapitalvinstskatt, km-050-utdelningsskatt-30, km-049-bolagsskatt-
 * 206, km-053-312reglerna, sj-04-optionsbeskattning) finns i KURSREGISTER
 * (verifierat i 358-registret — spår 5:s rebake till 369 lägger TILL
 * kurser, slugarna består; kursKalla faller tillbaka på "Läroplanen" om
 * ett framtida register läcker en slug).
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

// ── De 3 skattedjupsfrågorna ────────────────────────────────────────────────

export const SKATTEDJUP_MONSTER: FragMonster[] = [
  {
    id: "kapitalforsakring",
    karnord: [
      "kapitalförsäkring", "kapitalförsäkringen", "kapitalforsakring",
      "kf", "försäkringskonto", "avkastningsskatt",
    ],
    starkord: [
      "schablon", "schablonskatt", "isk", "skatt", "konto", "sparande",
      "ägande", "försäkring", "avkastning", "utdelning",
    ],
    bygga: (reg) => {
      const kf = reg.find((r) => r.slug === "sj-05-kapitalforsakring-vs-isk");
      const kallor = [
        kursKalla(reg, "sj-05-kapitalforsakring-vs-isk", "Läroplanen — skatt & juridik, kontotypernas mekanik sida vid sida"),
        kursKalla(reg, "km-052-isk", "Läroplanen — svensk bolagsskatt & juridik, schablonskattens beräkning"),
        kursKalla(reg, "km-051-kapitalvinstskatt", "Läroplanen — svensk bolagsskatt & juridik, vad schablonen ersätter"),
        kursKalla(reg, "km-050-utdelningsskatt-30", "Läroplanen — svensk bolagsskatt & juridik, hur utdelningar beskattas"),
      ];
      const k = kallor[0];
      return {
        text:
          `En kapitalförsäkring (KF) är ett sparkonto i FÖRSÄKRINGSFORM: du äger inte värdepapperen själv — försäkringsbolaget gör det — utan har ett försäkringsavtal med ett värde (bytesvärdet) som följer innehavet. Så fungerar mekaniken (utbildning om reglerna, inte ett kontoråd — vilket konto som passar en viss situation hör hemma hos Skatteverket och auktoriserad rådgivare):\n\n1️⃣ BESKATTNINGEN — KF beskattas med ÅRLIG avkastningsskatt: en schablonintäkt räknas fram på kapitalunderlaget (i princip statslåneräntan plus en fast procentsats, enligt de regler som gäller för år) och beskattas med kapitalinkomstskatten. Det är samma SCHABLONIDE som i ett investeringssparkonto (ISK) — skillnaden är ägarformen: på ISK äger du papprena och har schablonskatt, i KF äger försäkringen papprena och du har schablonskatt.\n2️⃣ VAD SCHABLENERSÄTTER — i ett vanligt depåkonto beskattas varje realisation med kapitalvinstskatt och varje utdelning löpande; i KF (som på ISK) deklareras inga affärer och inga utdelningar per hand — schablonen träffar underlaget oavsett hur mycket du handlat. Priset för enkelheten: schablonen tas ut även på år då innehavet FALLER, och försäkringen har ofta en årlig depå-/försäkringsavgift som vanliga depåer saknar.\n3️⃣ ÄGARFORMENS FÖLJDER — eftersom innehavet ligger i försäkringsform följer arvs- och bytesrättsregler med (bland det som gjort KF intressant i förmögenhetsplanering — återigen ett område där rådgivare, inte utbildning, ger svar), och RÄTTIGHETER som röstande på bolagsstämma kan inte utövas via försäkringsinnehav. Basens genomgång "Hur fungerar ISK och skatt?" täcker schablonräkningen i detalj.\n\nKursen Kapitalförsäkring vs ISK (${kf ? kf.minuter + " min" : "i registret"}) lägger mekanikerna sida vid sida. Som alltid: detta är utbildning i hur kontotyperna FUNGERAR — inget svar på vilket konto just du bör ha.` +
          kallradFler(kallor),
        amne: "kapitalforsakring",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kapitalförsäkring vs ISK", lank: "/kurser/sj-05-kapitalforsakring-vs-isk", ikon: "🛡️", beskrivning: "Kontotypernas mekanik sida vid sida" },
          { text: "Kursen: ISK — schablonskatt", lank: "/kurser/km-052-isk", ikon: "🏦", beskrivning: "Schablonintäktens beräkning" },
          { text: "Kursen: Kapitalvinstskatt", lank: "/kurser/km-051-kapitalvinstskatt", ikon: "💹", beskrivning: "Vad schablonen ersätter" },
          { text: "Kursen: Utdelningsskatt 30%", lank: "/kurser/km-050-utdelningsskatt-30", ikon: "🧾", beskrivning: "Utdelningens beskattning utanför schablonen" },
          { text: "Hur fungerar ISK och skatt?", lank: "fragor:" + encodeURIComponent("hur fungerar isk och skatt?"), ikon: "❓", beskrivning: "Basens schablonskatt-genomgång" },
        ],
        motfraga: { text: "Hur fungerar ISK och skatt?", kategori: "skatt" },
        fordjupa: { text: k.titel, lank: "/kurser/sj-05-kapitalforsakring-vs-isk" },
      };
    },
  },
  {
    id: "bolagsskatt",
    karnord: [
      "bolagsskatt", "bolagsskatten", "bolagsskattesatsen",
      "dubbelbeskattning", "vinstskatt",
    ],
    starkord: [
      "skatt", "sats", "procent", "20", "vinst", "resultat",
      "utdelning", "aktiebolag", "bolaget", "utdelad", "kvarvarande",
    ],
    bygga: (reg) => {
      const kb = reg.find((r) => r.slug === "km-049-bolagsskatt-206");
      const katSum =
        reg.filter((r) => r.kategori === "SVENSK BOLAGSSKATT & JURIDIK").length +
        reg.filter((r) => r.kategori === "SKATT & JURIDIK").length;
      const kallor = [
        kursKalla(reg, "km-049-bolagsskatt-206", "Läroplanen — svensk bolagsskatt & juridik, bolagets vinstskatt"),
        kursKalla(reg, "km-050-utdelningsskatt-30", "Läroplanen — svensk bolagsskatt & juridik, ägarens skatt på det utdelade"),
        kursKalla(reg, "km-051-kapitalvinstskatt", "Läroplanen — svensk bolagsskatt & juridik, ägarens skatt vid realisation"),
        kursKalla(reg, "km-053-312reglerna", "Läroplanen — svensk bolagsskatt & juridik, fåmansbolagens egna regler"),
      ];
      const k = kallor[0];
      return {
        text:
          `Bolagsskatten är skatten på BOLAGETS vinst — inte din. Ett svenskt aktiebolag betalar 20,6 % i vinstskatt på årets resultat (kursens ram; satsen är långsamförändrad men kollas bäst hos Skatteverket), och först DET SOM BLIR KVAR efter den skatten kan delas ut till ägarna. Så hänger kedjan ihop (mekanikutbildning — aldrig skatte- eller uppläggsråd):\n\n1️⃣ DUBBELBESKATTNINGENS KEDJA — vinsten beskattas två gånger på väg till din ficka: först 20,6 % i bolaget, därefter 30 % utdelningsskatt på det mottagna beloppet. Räknat på 100 kr i vinst blir det 20,6 kr i bolagsskatt och 79,4 kr kvar; av det utdelade går sedan 23,8 kr i utdelningsskatt — sammanlagt lämnar cirka 44 kr av 100 kr skattewägarna, och ungefär 56 kr når ägaren. Därför skiljer sig "vinst per aktie" (före bolagsskatt) från vad som faktiskt kan betalas ut.\n2️⃣ VARFÖR DET SPELAR ROLL FÖR ANALYSEREN — ett bolag som ÅTERINVESTERAR behåller vinsten efter de 20,6 % men betalar ingen ägarskatt förrän utdelning eller realisation sker; ett bolag som DELAR UT löper hela kedjan direkt. Detta är en av mekanikerna bakom att tillväxtbolag och utdelningsbolag värderas olika — inte en rekommendation utan en förklaring till varför "kvarvarande vinst" är en egen rad i analysen.\n3️⃣ GRÄNSLANDEN — aktieägare i onoterade fåmansbolag möter 3:12-reglerna (egna beskattningsvägar för utdelning och löneuttag — egen kurs i läroplanen), och den som säljer aktier möter kapitalvinstskatten i stället för utdelningsskatten. Kurserna i de båda skattekategorierna (sammanlagt ${katSum} i registret) går igenom varje led.\n\nKursen Bolagsskatt 20,6% (${kb ? kb.minuter + " min" : "i registret"}) tar bolagsskattens beräkning steg för steg. Som alltid: detta är utbildning i skattemekaniken — konkreta upplägg hör hemma hos Skatteverket och skatterådgivare.` +
          kallradFler(kallor),
        amne: "bolagsskatt",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Bolagsskatt 20,6%", lank: "/kurser/km-049-bolagsskatt-206", ikon: "🏢", beskrivning: "Bolagets vinstskatt steg för steg" },
          { text: "Kursen: Utdelningsskatt 30%", lank: "/kurser/km-050-utdelningsskatt-30", ikon: "🧾", beskrivning: "Ägarens led av kedjan" },
          { text: "Kursen: 3:12-reglerna", lank: "/kurser/km-053-312reglerna", ikon: "🔒", beskrivning: "Fåmansbolagens egna regler" },
          { text: "Kursen: Kapitalvinstskatt", lank: "/kurser/km-051-kapitalvinstskatt", ikon: "💹", beskrivning: "Realisationens beskattning" },
          { text: "Hur beskattas utdelningar?", lank: "fragor:" + encodeURIComponent("hur beskattas utdelningar?"), ikon: "❓", beskrivning: "Basens utdelnings-genomgång" },
        ],
        motfraga: { text: "Hur beskattas utdelningar?", kategori: "utdelning" },
        fordjupa: { text: k.titel, lank: "/kurser/km-049-bolagsskatt-206" },
      };
    },
  },
  {
    id: "optionsbeskattning",
    karnord: [
      "optionsbeskattning", "optionsbeskattningen",
      "personaloptioner", "personaloption",
      "aktieoptioner", "aktieoption",
    ],
    starkord: [
      "option", "optioner", "utnyttjande", "tjänsteinkomst", "lön",
      "kvalificerade", "okvalificerade", "skatt", "beskattas", "realisation",
    ],
    bygga: (reg) => {
      const ob = reg.find((r) => r.slug === "sj-04-optionsbeskattning");
      const kallor = [
        kursKalla(reg, "sj-04-optionsbeskattning", "Läroplanen — skatt & juridik, optionernas beskattningsvägar"),
        kursKalla(reg, "km-051-kapitalvinstskatt", "Läroplanen — svensk bolagsskatt & juridik, kapitalvägen vid realisation"),
        kursKalla(reg, "km-050-utdelningsskatt-30", "Läroplanen — svensk bolagsskatt & juridik, utdelningsvägen"),
        kursKalla(reg, "km-049-bolagsskatt-206", "Läroplanen — svensk bolagsskatt & juridik, bolagsskattens roll i programmen"),
      ];
      const k = kallor[0];
      return {
        text:
          `Optionsbeskattning handlar om EN fråga: NÄR blir optionens värde skattepliktigt, och som VAD? Huvudspåret i svensk praxis (utbildning om huvudreglerna — detaljer, undantag och ditt specifika fall hör hemma hos Skatteverket):\n\n1️⃣ PERSONALOPTIONER — TJÄNSTEVÄGEN. Optioner som delas i anställning beskattas som huvudregel som TJÄNSTEINKOMST det år optionen UTNYTTJAS (eller säljs): förmånsvärdet — skillnaden mellan aktiens värde och det pris du betalar — blir lönebeskattat vid din marginella skattesats. Kvalificerade personaloptioner har en egen spår med uppskovsmöjligheter vid vissa villkor; okvalificerade följer huvudregeln rakt av. Att värdet realiseras i anställningen är nyckeln.\n2️⃣ MARKNADSOPTIONER — KAPITALVÄGEN. Optioner du själv förvärvat i en vanlig kapitaldepå (fonder på warranter eller optioner) beskattas som KAPITALVINST först vid realisation — 30 %-regeln gäller, och inget händer vid löpande värdeförändringar. Samma instrument, annan väg: skillnaden mellan din marginella löneskatt och 30 % kapitalskatt är ofta den största ekonomin i hela beslutet.\n3️⃣ VARFÖR MEKANIKEN ÄR ANALYSRELEVANT — för anställda i listade bolag är optionsprogram en del av ersättningen: att veta att utnyttandet utlöser lönebeskattning (och att programmet kostar bolaget bolagsskattemässigt) gör att du läser bolagets ersättningsrapport med andra ögon. Next-lagrets "Vad är optioner?" täcker själva INSTRUMENTET — mekaniken här är skattevägarna runt det.\n\nKursen Options-beskattning (${ob ? ob.minuter + " min" : "i registret"}) går igenom kvalificerade/okvalificerade program med exempel. Som alltid: utbildning i hur reglerna fungerar — aldrig råd om när du bör utnyttja dina optioner.` +
          kallradFler(kallor),
        amne: "optionsbeskattning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Options-beskattning", lank: "/kurser/sj-04-optionsbeskattning", ikon: "📜", beskrivning: "Tjänste- och kapitalvägarna" },
          { text: "Kursen: Kapitalvinstskatt", lank: "/kurser/km-051-kapitalvinstskatt", ikon: "💹", beskrivning: "Kapitalvägen vid realisation" },
          { text: "Kursen: Utdelningsskatt 30%", lank: "/kurser/km-050-utdelningsskatt-30", ikon: "🧾", beskrivning: "Utdelningsvägen i programmen" },
          { text: "Kursen: Bolagsskatt 20,6%", lank: "/kurser/km-049-bolagsskatt-206", ikon: "🏢", beskrivning: "Programmets kostnad på bolagssidan" },
          { text: "Vad är optioner?", lank: "fragor:" + encodeURIComponent("vad är optioner?"), ikon: "❓", beskrivning: "Själva instrumentet — nästa-lagret" },
        ],
        motfraga: { text: "Vad är optioner?", kategori: "derivat" },
        fordjupa: { text: k.titel, lank: "/kurser/sj-04-optionsbeskattning" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre skattedjup-mönstren — eller null (då har
 * hela kedjan före redan lämnat null och API-flödet tar över som förr).
 * Ligger SIST i widgetens kedja och kan därför aldrig stjäla en fråga från
 * tidigare lager. Samma matchningssemantik som basmotorn: minst ett
 * kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltSkattedjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of SKATTEDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
