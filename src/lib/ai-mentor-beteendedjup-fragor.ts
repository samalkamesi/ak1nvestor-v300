/**
 * AI-MENTORN 2.0 — BETEENDEDJUPFÖRHANDSFRÅGOR (spår 6, omgång 11, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de sexton tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + extra, makro, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, agande, redovisningsdjup, djup,
 * historia, lonsamhetsdjup och de båda syskonen tsdjup + skattedjup som
 * skrevs i förra fönstret):
 *   1. Bekräftelsefällan (km-019-bekraftelsefalla primär + bf-11-kognitiv-
 *      bias + km-035-flockbeteende + bf-04-investera-som-en-robot) — hur
 *      hjärnan selekterar information som redan bekräftar tesen
 *   2. Ankareffekten (bf-05-ankareffekt primär + km-020-ankareffekt +
 *      bf-06-tillganglighetsheuristik + bf-12-prospektteori) — första
 *      siffran blir referenspunkt även när den är irrelevant
 *   3. Mental accounting (bf-03-mental-accounting primär + bf-02-sunk-cost
 *      + km-037-disposition-effect + pf-06-aterinvestering) — pengar i
 *      mentala fickor med olika regler, fast en krona är en krona
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (718 kärnord LIVE-lästa ur samtliga
 * sexton lager på disk, mekaniskt, med den riktiga matcharen;
 * verktyg/_s6u3-sond-omg11.mjs): frågeformuleringarna "vad är
 * bekräftelsefällan?", "vad är bekräftelsebias?", "vad är ankareffekten?",
 * "vad är mental accounting?" och "vad är mentala konton?" är helt fria
 * (NULL genom hela kedjan, inkl de två pågående syskonlagren). Kategorin
 * BETEENDEFINANS bär 18 kurser i registret men hade inget eget lager —
 * basen äger PSYKOLOGI-GRUNDORDEN (psykologi, beteende, beteendefinans,
 * bias, kognitiv bias, känslor, panik, rädsla, girighet, flockbeteende,
 * hjärnan, dunning, halo-effekt, sunk cost) och djup-lagret fomo-familjen
 * (fomo/prospektteori/förlustaversion/disposition/kahneman/tversky). Fria
 * alternativ som AVSOGS i sonden (dokumenterade i anspråksfilen
 * data/vakten/s6-omg11-u3-ansprak.md): overconfidence/överkonfidens
 * (km-036), tillgänglighetsfälla/heuristik (bf-01/bf-06), sharpe-kvoten
 * (km-016), dogs of the dow (km-065) och utdelningsfällor (ud-04) — de
 * lämnas till framtida omgångar. Varje svar bär FYRA kurslänkar (spårets
 * "fler kurslänkar per svar") — noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt, testfall H/I
 * bevisar båda vägarna):
 *   • Basen äger PSYKOLOGI-GRUNDORDEN — dess beteende-monster svarar på
 *     "vad är kognitiv bias?" och "vad är sunk cost?" (LIVE-bevisat av
 *     sonden; knapparna i monster 1 och 3 länkar medvetet dit). Detta
 *     lagrets kärnord är medvetet FAMILJEORDEN basen saknar:
 *     bekräftelsefällan, bekräftelsebias, ankareffekt, förankring,
 *     mentala konton, mental bokföring, thaler.
 *   • Djup-lagret äger FOMO-FAMILJEN — "vad är FOMO?" och "vad är
 *     prospektteorin?" förblir dess (LIVE-bevisat; monster 2:s knapp
 *     länkar medvetet dit). Källägande ≠ kärnordsägande
 *     (emission/V19-precedensen): bf-12-prospektteori och
 *     km-037-disposition-effect FÅR vara källor här.
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som skattedjup-lagrets
 * "kf"-notis): kärnordet "thaler" (6 tecken → tolerans 1) och "ankare"
 * (6 tecken → exakt krav vid ≤3, tolerans 1 här) är korta — de kan inte
 * fånga syskonkärnord (G2-svepet kör samtliga syskonkärnord som frågor
 * utan träff) och antistöldtestet kör samtliga tidigare kanoniska frågor.
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och var
 * död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det. Detta
 * lager kopplas in SIST — och testfall L läser widgetens kedjerad MEKANISKT
 * ur filen (sjutton lager i ordning + import) så att "lager utan
 * inkoppling" aldrig kan återkomma tyst.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlagren: Node type-stripping löser endast `import type`, så de
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
 *     ?? svaraLokaltTsdjup(q, KURSREGISTER)
 *     ?? svaraLokaltSkattedjup(q, KURSREGISTER)
 *     ?? svaraLokaltBeteendedjup(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla sexton lämnar
 * null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur beslutspsykologin FUNGERAR som
 * mekanik — ingen psykologisk diagnos av eleven, inga handels- eller
 * portföljrekommendationer ("gör så här i dina beslut"), inga omdömen om
 * enskilda värdepapper. Mönstren är generella och välbelagda i forskning-
 * litteraturen; kurserna bär teknikerna, svaren bär mekanismerna.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-beteendedjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (km-019-bekraftelsefalla, bf-11-kognitiv-bias,
 * km-035-flockbeteende, bf-04-investera-som-en-robot, bf-05-ankareffekt,
 * km-020-ankareffekt, bf-06-tillganglighetsheuristik, bf-12-prospektteori,
 * bf-03-mental-accounting, bf-02-sunk-cost, km-037-disposition-effect,
 * pf-06-aterinvestering) finns i KURSREGISTER (verifierat i 358-registret
 * — spår 5:s rebake lägger TILL kurser, slugarna består; kursKalla faller
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

// ── De 3 beteendedjupsfrågorna ──────────────────────────────────────────────

export const BETEENDEDJUP_MONSTER: FragMonster[] = [
  {
    id: "bekraftelsefalla",
    karnord: [
      "bekräftelsefälla", "bekräftelsefällan", "bekräftelsefällor",
      "bekraftelsefalla", "bekräftelsebias", "bekräftelse",
      "confirmation bias",
    ],
    starkord: [
      "information", "hypotes", "tesen", "tes", "motbevis",
      "motargument", "bevisa", "bevis", "källor", "filtret",
      "eko", "bekräftar", "bias",
    ],
    bygga: (reg) => {
      const bf = reg.find((r) => r.slug === "km-019-bekraftelsefalla");
      const katSum = reg.filter((r) => r.kategori === "BETEENDEFINANS").length;
      const kallor = [
        kursKalla(reg, "km-019-bekraftelsefalla", "Läroplanen — beteendefinans, fällan som bekräftar tesen"),
        kursKalla(reg, "bf-11-kognitiv-bias", "Läroplanen — beteendefinans, hela bias-familjen i en kurs"),
        kursKalla(reg, "km-035-flockbeteende", "Läroplanen — beteendefinans, när gruppen förstärker tesen"),
        kursKalla(reg, "bf-04-investera-som-en-robot", "Läroplanen — beteendefinans, regelverket mot fällan"),
      ];
      const k = kallor[0];
      return {
        text:
          `Bekräftelsefällan (confirmation bias) är hjärnans tendens att SÖKA, TOLKA och MINNAS information så att den stödjer det du redan tror — och att förbise, förvanska eller glömma det som talar emot. Det är den mest belagda kognitiva biasen i forskningen (utbildning om mekanismen — ingen diagnos av dig: fällan drabbar alla hjärnor, inklusive professionella analytikers):\n\n1️⃣ MEKANISMEN — du börjar med en SLUTSATS ("det här bolaget är bra") och läser sedan nyhetsflödet som en advokat, inte som en domare: positiva nyheter blir bevis, negativa blir "tillfälliga" eller "missförstådda". Asymmetrin sitter i hur MYCKET bevis som krävs — för tesen räcker en enda positiv nyhet, mot tesen krävs "ovisst". Flockbeteende förstärker: i ett ekokammare av likasinnade blir motbevisen osynliga (därför är källor som INTE redan håller med dig ett eget arbetsmoment).\n2️⃣ I AKTIEANALYSEN — den farligaste platsen är EGNA ÄGANDET: när du redan äger en aktie läses varje kvartalsrapport med ett filter. Siffror som missar förklaras bort ("engångsposter", "omställningsår"), siffror som slår bekräftar tesen. Detsamma gäller kortteser: den som "vet" att ett bolag är värdelöst avfärdar uppgången som "manipulation". Fällan gör att du håller en död tes vid liv — och att du aldrig skriver ner vad som SKULLE få dig att ändra åsikt.\n3️⃣ MOTMEDEL (mekanik, inte råd) — kursen Investera som en robot bygger dem som regler: (a) FÖRREGISTRERA tesen — skriv hypotesen OCH motbeviskravet INNAN du läser rapporten; (b) ADVOKATTESTET — formulera det starkaste motargumentet själv innan någon annan gör det; (c) KÄLLVAL — läs medvetet en källa som brukar ha motsatt hållning. Basens genomgång "Vad är kognitiv bias?" placerar fällan i hela bias-familjen; BETEENDEFINANS-kategorins ${katSum} kurser har varje variant.\n\nKursen Bekräftelsefälla (${bf ? bf.minuter + " min" : "i registret"}) går igenom fällan med aktiemarknadsexempel. Som alltid: detta är utbildning i hur mekanismen fungerar — inget omdöme om dina beslut.` +
          kallradFler(kallor),
        amne: "bekraftelsefalla",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Bekräftelsefälla", lank: "/kurser/km-019-bekraftelsefalla", ikon: "🔍", beskrivning: "Fällan som bekräftar tesen" },
          { text: "Kursen: Kognitiv bias — komplett lista", lank: "/kurser/bf-11-kognitiv-bias", ikon: "🧠", beskrivning: "Hela bias-familjen i en kurs" },
          { text: "Kursen: Flockbeteende", lank: "/kurser/km-035-flockbeteende", ikon: "🐑", beskrivning: "När gruppen förstärker tesen" },
          { text: "Kursen: Investera som en robot", lank: "/kurser/bf-04-investera-som-en-robot", ikon: "🤖", beskrivning: "Regelverket mot fällan" },
          { text: "Vad är kognitiv bias?", lank: "fragor:" + encodeURIComponent("vad är kognitiv bias?"), ikon: "❓", beskrivning: "Basens bias-genomgång" },
        ],
        motfraga: { text: "Vad är kognitiv bias?", kategori: "psykologi" },
        fordjupa: { text: k.titel, lank: "/kurser/km-019-bekraftelsefalla" },
      };
    },
  },
  {
    id: "ankareffekt",
    karnord: [
      "ankareffekt", "ankareffekten", "ankareffekter",
      "ankare", "förankring", "förankrad", "anchoring",
    ],
    starkord: [
      "snitt", "genomsnitt", "köpkurs", "referenspunkt", "referens",
      "pris", "irrelevant", "riktkurs", "riktkurser", "målkurs",
      "historic", "topp", "botten",
    ],
    bygga: (reg) => {
      const ae = reg.find((r) => r.slug === "bf-05-ankareffekt");
      const katSum = reg.filter((r) => r.kategori === "BETEENDEFINANS").length;
      const kallor = [
        kursKalla(reg, "bf-05-ankareffekt", "Läroplanen — beteendefinans, snittet som styr fast det är irrelevant"),
        kursKalla(reg, "km-020-ankareffekt", "Läroplanen — beteendefinans, ankarteknikens mekanik"),
        kursKalla(reg, "bf-06-tillganglighetsheuristik", "Läroplanen — beteendefinans, det nära blir referensen"),
        kursKalla(reg, "bf-12-prospektteori", "Läroplanen — beteendefinans, referenspunkten i värderingen"),
      ];
      const k = kallor[0];
      return {
        text:
          `Ankareffekten är att den FÖRSTA siffran du ser blir en referenspunkt — och att alla senare bedömningar dras mot den, även när siffran är helt irrelevant för frågan. Klassikern från forskningen: fick deltagare gissa Afrikas andel av FN:s medlemsländer efter ett slumpat hjul, drogs gissningarna mot hjulets tal — trots att hjulet inte sa något alls. Mekanismen är generell (utbildning om hur den fungerar, ingen diagnos):\n\n1️⃣ MEKANISMEN — hjärnan bedömer genom JUSTERING från en startpunkt, inte från noll: startpunkten kan vara din KÖPKURS, aktiens toppkurs, en analysts riktkurs eller 52-veckorslistan. Problemet är att marknaden inte känner till DITT ankare: kursen drivs av bolagets värde och flödet, inte av vad du betalade. Därmed blir "snittet irrelevant" — kursen rör sig inte mot ditt genomsnitt för att du önskar det (kursens titelord).\n2️⃣ I AKTIEANALYSEN — ankaret dyker upp överallt: "den var värd 300 kr förr" (historskursen som referens, inte värde), "analytikerna säger 250" (konsensus som startpunkt), "den har fallit 60 %, nu är den billig" (botten mot förra toppen — ett bolag kan falla 60 % och fortfarande vara dyrt). Tillgänglighetsheuristiken gör att det MEST NÄRA — senaste kursen, senaste nyheten — blir ankaret. Prospektteorin visar konsekvensen: vi mäter vinst och förlust MOT en referenspunkt, och vilken referens vi väljer ändrar hela beslutet.\n3️⃣ MOTMEDEL (mekanik, inte råd) — (a) FRÅGA BAKLÄNGES: "vad är bolaget värt UTAN att jag får se kursen?" — värdera först, titta sedan; (b) BYT REFERENS: räkna på nyckeltal mot NUVARANDE fundamentals, inte mot historiens toppar; (c) DOKUMENTERA varje antagande med dess tal, så att ankaret syns i pappret. BETEENDEFINANS-kategorins ${katSum} kurser har teknikerna.\n\nKursen Ankareffekt — snitt irrelevant (${ae ? ae.minuter + " min" : "i registret"}) bygger ombedömningen steg för steg. Som alltid: detta är utbildning i mekanismen — inga omdömen om dina placeringar.` +
          kallradFler(kallor),
        amne: "ankareffekt",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Ankareffekt — snitt irrelevant", lank: "/kurser/bf-05-ankareffekt", ikon: "⚓", beskrivning: "Snittet som styr fast det är irrelevant" },
          { text: "Kursen: Ankareffekt", lank: "/kurser/km-020-ankareffekt", ikon: "🧭", beskrivning: "Ankarteknikens mekanik" },
          { text: "Kursen: Tillgänglighetsheuristik", lank: "/kurser/bf-06-tillganglighetsheuristik", ikon: "👁️", beskrivning: "Det nära blir referensen" },
          { text: "Kursen: Prospektteori", lank: "/kurser/bf-12-prospektteori", ikon: "⚖️", beskrivning: "Referenspunkten i värderingen" },
          { text: "Vad är FOMO?", lank: "fragor:" + encodeURIComponent("vad är fomo?"), ikon: "❓", beskrivning: "Syskinlagrets fomo-genomgång" },
        ],
        motfraga: { text: "Vad är FOMO?", kategori: "psykologi" },
        fordjupa: { text: k.titel, lank: "/kurser/bf-05-ankareffekt" },
      };
    },
  },
  {
    id: "mentalaccounting",
    karnord: [
      "mental accounting", "mentala konton", "mentalt konto",
      "mental bokföring", "thaler",
    ],
    starkord: [
      "pengar", "konton", "fickor", "utdelning", "vinst",
      "förlust", "spelvinst", "bonus", "budget", "märker",
      "reserverad", "buffert",
    ],
    bygga: (reg) => {
      const ma = reg.find((r) => r.slug === "bf-03-mental-accounting");
      const katSum = reg.filter((r) => r.kategori === "BETEENDEFINANS").length;
      const kallor = [
        kursKalla(reg, "bf-03-mental-accounting", "Läroplanen — beteendefinans, fickorna pengarna sorteras i"),
        kursKalla(reg, "bf-02-sunk-cost", "Läroplanen — beteendefinans, redan gjorda kostnader i samma ficka"),
        kursKalla(reg, "km-037-disposition-effect", "Läroplanen — beteendefinans, förlorarna som inte får realiseras"),
        kursKalla(reg, "pf-06-aterinvestering", "Läroplanen — portföljhantering, ränta-på-ränta utan fickor"),
      ];
      const k = kallor[0];
      return {
        text:
          `Mental accounting (mental bokföring — Richard Thalers begrepp) är att vi sorterar pengar i mentala FICKOR med olika regler: lönen är "riktiga pengar" som sparas försiktigt, utdelningen är "bonus" som får riskeras, spelvinsten är "lekpengar" som kan gamba bort. Ekonomiskt är en krona en krona — hjärnan behandlar den olika beroende på vilken ficka den kom ifrån. Mekanism, inte diagnos:\n\n1️⃣ MEKANISMEN — fickorna skapar REGELSKILLNADER som inte finns i ekonomin: "utdelningsaktierna får jag handla för, men lönen rör jag inte" fast båda är din egen kapital; "kursvinsten i det här bolaget är 'huspengar', jag kan inte förlora" — kasseras fickan görs kraftigare risktagande med vinstpengar än med insatt kapital. Ursprunget styr hur pengarna används, och det är just vad rationalitetsläran säger inte ska spela roll.\n2️⃣ I PORTFÖLJEN — mental accounting binder ihop flera klassiska fällor: DISPOSITIONSEFFEKTEN (förloraraktier "låses" i sin ficka eftersom realisering gör förlusten påtaglig — vinnare säljs, förlorare behålls); SUNK COST ("jag har redan lagt 20 000 i den aktien" — pengarna är borta oavsett vad du gör härnäst); och utdelningsmyten ("utdelningen är trygg inkomst, kursvinsten är spekulativ" — totalavkastningen är samma krona delad i två fickor). Återinvesteringskursen visar motsatsen: ränta-på-ränta uppstår när ALLA kronor — utdelning som kursvinst — får arbeta i ETT konto.\n3️⃣ MOTMEDEL (mekanik, inte råd) — (a) EN BUDGET: för portföljen finns ett totalbelopp och en strategi — inte en ficka per kurs eller per penningkälla; (b) BYT FRÅGA: "skulle jag köpa den här aktien med nysparat kapital i dag?" — om svaret beror på vilken ficka pengarna kom ifrån är det mental accounting som talar; (c) RÄKNA TOTALAVKASTNING först, utdelning och kursvinst är två sätt att ta samma värde. BETEENDEFINANS-kategorins ${katSum} kurser har varje mekanism med exempel.\n\nKursen Mental accounting (${ma ? ma.minuter + " min" : "i registret"}) går igenom fickorna och hur de låses upp. Som alltid: detta är utbildning i mekanismen — inga omdömen om din ekonomi.` +
          kallradFler(kallor),
        amne: "mentalaccounting",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Mental accounting", lank: "/kurser/bf-03-mental-accounting", ikon: "👛", beskrivning: "Fickorna pengarna sorteras i" },
          { text: "Kursen: Sunk cost", lank: "/kurser/bf-02-sunk-cost", ikon: "🕳️", beskrivning: "Redan gjorda kostnader i samma ficka" },
          { text: "Kursen: Disposition effect", lank: "/kurser/km-037-disposition-effect", ikon: "🔒", beskrivning: "Förlorarna som inte får realiseras" },
          { text: "Kursen: Återinvestering", lank: "/kurser/pf-06-aterinvestering", ikon: "♻️", beskrivning: "Ränta-på-ränta utan fickor" },
          { text: "Vad är sunk cost?", lank: "fragor:" + encodeURIComponent("vad är sunk cost?"), ikon: "❓", beskrivning: "Basens sunk cost-genomgång" },
        ],
        motfraga: { text: "Vad är sunk cost?", kategori: "psykologi" },
        fordjupa: { text: k.titel, lank: "/kurser/bf-03-mental-accounting" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre beteendedjup-mönstren — eller null (då har
 * hela kedjan före redan lämnat null och API-flödet tar över som förr).
 * Ligger SIST i widgetens kedja och kan därför aldrig stjäla en fråga från
 * tidigare lager. Samma matchningssemantik som basmotorn: minst ett
 * kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltBeteendedjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of BETEENDEDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
