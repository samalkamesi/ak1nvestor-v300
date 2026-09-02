/**
 * SHORTSELLER-BANK — Agent 3 (The Short-Seller), nästa nivå.
 *
 * 10x-KALKYL (dom: "bygg vidare med AI eller ta bort — bygg mot nästa nivå
 * med 10x kalkylerad förbättring"):
 *
 *   DAGENS (v1): 15 statiska attackfrågor, 5 ämnen, ingen elevkontext,
 *     ingen progression, inga räknefall, en slumpfråga per anrop,
 *     försvar = en enda fråga utan bedömning.
 *
 *   NÄSTA NIVÅ (v2 — denna bank, ± samma antal rader som gamla routen):
 *   (1) KONTEXTUELLA attacker — varje fråga kan bära kursRef (V01–V20 +
 *       flaggskepp) och får en inledning baserad på elevens faktiska
 *       situation ("Du har klarat V09-kursen — men kan du använda den
 *       under tryck?"), se kontextuellInledning().
 *   (2) ÄMNESBANK 5x i bredd — 30 attackfrågor över 10 ämnen med
 *       svårighetsgrad 1–3 (ROE, tillväxt, värdering, risk, kassaflöde,
 *       moat, V19-emission, vågor/AK1TS, portfölj, DCF-matematik).
 *   (3) BERÄKNINGS-ATTACKER — 8 frågor med inbyggda räknefall (ROE-snitt,
 *       CAGR-miss, P/E-förväxling, skuldsättningsgrad, kassaflöde/
 *       working capital, emissions-TEK, WACC-fel, glömt terminal-tillväxt):
 *       eleven RÄKNAR och väljer — rätt svar + förklaring visas FÖRST
 *       efter elevens val (enda undantaget från sokratiska regeln).
 *   (4) PROGRESSION — nivå 1–3; nästa nivå efter 3 korrekta försvar
 *       (localStorage "ak1a-shortseller-v1" i komponenten) + streak av
 *       hållna försvar. OBS (P8): nivån styr bara svårighetsURVAL — inga
 *       interna trösklar, inget innehåll låses, alla ämnen är alltid öppna.
 *   (5) FÖRSVAR-BETYG — forsvarsFragor() gör nyckelordsanalys av tesen och
 *       väljer 1–5 sekventiella attacker ("Hållbart? / Försvaret håller
 *       inte — ny attack"); slutbetyg skrivs i komponenten med
 *       pedagogik.ts-ton (aldrig dömande).
 *   (6) AI-READY — /api/shortseller försöker Z.ai GLM först när
 *       ZAI_API_KEY finns i process.env (route.ts system-prompt-redo) och
 *       faller deterministiskt tillbaka på just denna bank.
 *   (7) CHAT-INTEGRATION — komponenten exporterar useShortsellerKompakt()
 *       och lyssnar på window-event "ak1a:shortseller-attacka".
 *
 *   KALKYL: 15→30 frågor (2x) × 5→10 ämnen (2x) × 0→8 räknefall ×
 *   0→3 progressionssnivåer × 0→sekventiellt försvarssystem ×
 *   0→elevkontext = kraftigt över 10x djup per kodrad.
 *
 * Ren data + rena funktioner: modulen importeras både av klientkomponenten
 * och av API-routen (server) — därför finns INGEN localStorage här.
 */

// ── Typer ──────────────────────────────────────────────────────────────────

export type AmneId =
  | "roe"
  | "tillvaxt"
  | "vardering"
  | "risk"
  | "kassaflode"
  | "moat"
  | "v19-emission"
  | "vagor-ak1ts"
  | "portfolj"
  | "dcf-matematik";

export type AmneVal = AmneId | "overraska";
export type Niva = 1 | 2 | 3;
export type AttackKategori = "matematik" | "antagande" | "risk" | "historia" | "logik";

export type Svarsalternativ = { text: string; ratt: boolean };

export type Berakning = {
  /** Räknefallet med siffrorna (och gärna kollegans fel) — visas eleven. */
  raknefall: string;
  /** Eleven räknar och väljer — rätt/fel + förklaring kommer FÖRST efter val. */
  alternativ: Svarsalternativ[];
  /** Pedagogisk förklaring som visas efter elevens val. */
  forklaring: string;
};

export type AttackFraga = {
  id: string;
  amne: AmneId;
  kategori: AttackKategori;
  svarighet: 1 | 2 | 3;
  fraga: string;
  kontext: string;
  /** Kurs-slug (V-spåret/flaggskepp) — gör attacken kontextuell mot eleven. */
  kursRef?: string;
  /** Satt = beräknings-attack (rätt svar + förklaring efter elevval). */
  berakning?: Berakning;
};

export type HistorisktFall = { bolag: string; fel: string; lardom: string };

// ── Ämnen (10 + överraska) ─────────────────────────────────────────────────

export const AMNEN: { id: AmneVal; namn: string; ikon: string }[] = [
  { id: "roe", namn: "ROE & lönsamhet", ikon: "💰" },
  { id: "tillvaxt", namn: "Tillväxt & CAGR", ikon: "🌱" },
  { id: "vardering", namn: "Värdering & multipel", ikon: "⚖️" },
  { id: "risk", namn: "Risk & balansräkning", ikon: "⚠️" },
  { id: "kassaflode", namn: "Kassaflöde", ikon: "💧" },
  { id: "moat", namn: "Moat", ikon: "🏰" },
  { id: "v19-emission", namn: "V19: Emission & bränning", ikon: "🔥" },
  { id: "vagor-ak1ts", namn: "Vågor & AK1TS", ikon: "🌊" },
  { id: "portfolj", namn: "Portfölj", ikon: "🧺" },
  { id: "dcf-matematik", namn: "DCF-matematik", ikon: "🧮" },
  { id: "overraska", namn: "Överraska mig", ikon: "🎯" },
];

/** Kurstitlar för kontextuella inledningar (samma slugs som kurstips.ts V_SPÅR/flaggskepp). */
export const KURS_TITLAR: Record<string, string> = {
  "v01-forsäljningstillväxt": "V01 — Försäljningstillväxt",
  "v02-arr-tillväxt": "V02 — ARR-tillväxt",
  "v04-ps": "V04 — P/S",
  "v06-ev-ebitda": "V06 — EV/EBITDA",
  "v07-bruttomarginal": "V07 — Bruttomarginal",
  "v09-roe": "V09 — ROE",
  "v10-skuldsattningsgrad": "V10 — Skuldsättningsgrad",
  "v13-patent-ip": "V13 — Patent & Immateriella rättigheter",
  "v14-varumarke": "V14 — Varumärke & Kundlojalitet",
  "v15-natverkseffekter": "V15 — Nätverkseffekter",
  "v19-kapitalforbranning": "V19 — Kapitalförbränning & Emission-risk",
  "v20-aterekop-egna-aktier": "V20 — Återköp av egna aktier",
  "ak1ts-vaglarans-hierarki": "AK1TS — Våglärans Hierarki",
  "portfolj-ekosystemet": "Från aktie till portfölj — 5×5×4-ekosystemet",
};

// ── Ämnesbanken: 30 attacker över 10 ämnen, svårighetsgrad 1–3 ─────────────
// 8 av dem är beräknings-attacker (berakning satt) — se respektive fråga.

const ATTACKER: AttackFraga[] = [
  // ── ROE & lönsamhet (V09) ──────────────────────────────────────────────
  {
    id: "roe-1",
    amne: "roe",
    kategori: "antagande",
    svarighet: 1,
    kursRef: "v09-roe",
    fraga:
      "Din analys lyfter ROE på 18% — men vad driver den: marginal, omsättningshastighet eller hävstång? Vilket av de tre skulle du satsa på att det är?",
    kontext:
      "DuPont: ROE = marginal × omsättningshastighet × hävstång — samma ROE kan vara tre helt olika bolag med tre helt olika risker.",
  },
  {
    id: "roe-2",
    amne: "roe",
    kategori: "matematik",
    svarighet: 2,
    kursRef: "v09-roe",
    fraga: "Räkna själv: vad är korrekt ROE för det här bolaget?",
    kontext: "Vinsten tjänas under hela året — därför snittas basen, inte årsskiftet.",
    berakning: {
      raknefall:
        "Bolag X: vinst 120 Mkr. Eget kapital var 400 Mkr vid ingången av året och 600 Mkr vid utgången (utdelning och återköp inräknade). En analystes räknar 120 / 600 = 20% och är nöjd.",
      alternativ: [
        { text: "20% — utgående eget kapital är rätt bas", ratt: false },
        { text: "24% — snittet av ingående och utgående eget kapital", ratt: true },
        { text: "30% — ingående eget kapital är den konservativa basen", ratt: false },
        { text: "12% — snittet av vinsten mot hela balansräkningen", ratt: false },
      ],
      forklaring:
        "ROE enligt snittprincip = vinst / ((400 + 600) / 2) = 120 / 500 = 24%. Vinsten skapas under året, inte vid årsskiftet — därför snittas eget kapital. Kollegans 20% underskattar avkastningen; 30% överskattar den.",
    },
  },
  {
    id: "roe-3",
    amne: "roe",
    kategori: "historia",
    svarighet: 3,
    fraga:
      "H&M levererade ROE över 30% i mitten av 2010-talet. Vilken del av DuPont-kedjan brant först — och i vilken siffra hade du sett det komma innan aktien gjorde det?",
    kontext:
      "ROE är en produkt av moat — när moat eroderar syns det först i marginalen (V07), länge före kursen.",
  },

  // ── Tillväxt & CAGR (V01/V02) ──────────────────────────────────────────
  {
    id: "tillvaxt-1",
    amne: "tillvaxt",
    kategori: "logik",
    svarighet: 1,
    kursRef: "v01-forsäljningstillväxt",
    fraga:
      "Du säger att bolaget växer 20% om året. Hur mycket av den tillväxten är organisk — och hur mycket är köpt?",
    kontext:
      "Sinch växte 60%+ per år, men bara en bråkdel var organisk — resten köptes med skulder som ägarna sedan fick bära.",
  },
  {
    id: "tillvaxt-2",
    amne: "tillvaxt",
    kategori: "matematik",
    svarighet: 2,
    fraga: "Räkna själv: vad är korrekt CAGR?",
    kontext: "Verklig tillväxt komponerars — den adderas inte.",
    berakning: {
      raknefall:
        "Intäkten gick från 100 Mkr (2021) till 200 Mkr (2025). En kollega säger: 'Total ökning 100% på 4 år — det är CAGR 25% per år, imponerande!'",
      alternativ: [
        { text: "25% per år — totalen delat på antal år", ratt: false },
        { text: "Cirka 19% per år — ränta-på-ränta: (200/100)^(1/4) − 1", ratt: true },
        { text: "50% per år — dubblat på fyra år är som 50% per år", ratt: false },
        { text: "10% per år — eftersom tillväxten deaccelererar mot slutet", ratt: false },
      ],
      forklaring:
        "CAGR = (200/100)^(1/4) − 1 ≈ 18,9% per år. Kollegans 25% är det aritmetiska snittet av totalen — men tillväxt komponeras år på år, den adderas inte. Missar du det överskattar du både historien och framtiden.",
    },
  },
  {
    id: "tillvaxt-3",
    amne: "tillvaxt",
    kategori: "risk",
    svarighet: 3,
    fraga:
      "Tillväxten deaccelererar från 30% till 10%. Vilken multipel står kvar när marknaden prissätter om berättelsen — och hur stor del av din säkerhetsmarginal överlever den ompriseringen?",
    kontext:
      "P/S 12x vid 30% tillväxt kan bli P/S 2x vid 10% — aktien faller 80% trots att bolaget fortfarande växer.",
  },

  // ── Värdering & multipel (V04/V06) ─────────────────────────────────────
  {
    id: "vardering-1",
    amne: "vardering",
    kategori: "antagande",
    svarighet: 1,
    kursRef: "v06-ev-ebitda",
    fraga:
      "Du jämför P/E mellan ett kapitalintensivt bolag med stora avskrivningar och ett lättviktigt utan. Varför leder den jämförelsen dig vilse?",
    kontext:
      "P/E straffar kapitalintensiva bolag genom avskrivningar — EV/EBITDA (V06) jämför det operativa på lika villkor.",
  },
  {
    id: "vardering-2",
    amne: "vardering",
    kategori: "matematik",
    svarighet: 2,
    fraga: "Räkna själv: vad blir forward P/E?",
    kontext: "Trailing eller forward — basen avgör om multipeln är ett argument eller en illusion.",
    berakning: {
      raknefall:
        "Bolag Y: aktiekurs 150 kr. Senaste årets vinst per aktie (VPS) var 10 kr, vilket ger trailing P/E 15. Nästa år väntas VPS 15 kr. Kollegan säger: 'P/E 15 och jag räknar på kommande vinst — billigt!'",
      alternativ: [
        { text: "15 — multipeln är samma oavsett vilken vinst man menar", ratt: false },
        { text: "10 — kursen delat med väntad VPS: 150 / 15", ratt: true },
        { text: "25 — väntad VPS delat med kursen, upp och ner", ratt: false },
        { text: "0,10 — den inverterade multipeln är den riktiga", ratt: false },
      ],
      forklaring:
        "Forward P/E = 150 / 15 = 10. Kollegan blandar baser: hon citerar trailing-P/E:t (15, räknat på gårdagens 10 kr) men argumenterar med kommande vinst. (0,10 är earnings yield E/P — ett mått, men inte P/E.)",
    },
  },
  {
    id: "vardering-3",
    amne: "vardering",
    kategori: "risk",
    svarighet: 3,
    fraga:
      "Räntan stiger 200 punkter. Gör om din värdering i huvudet: vad händer med motivärdet — och hur stor del av din tes överlever det?",
    kontext:
      "Långa tillgångar har lång duration: 2022 tvingade räntan fram omprisering av hela tillväxtsektorn, fundamentals till trots.",
  },

  // ── Risk & balansräkning (V10) ─────────────────────────────────────────
  {
    id: "risk-1",
    amne: "risk",
    kategori: "logik",
    svarighet: 1,
    fraga:
      "Vad är det värsta som kan hända med din position — och har du räknat på det scenariot, eller bara hoppats att det inte inträffar?",
    kontext: "Margin of safety är att överleva scenariot där du har fel.",
  },
  {
    id: "risk-2",
    amne: "risk",
    kategori: "matematik",
    svarighet: 2,
    kursRef: "v10-skuldsattningsgrad",
    fraga: "Räkna själv: vad är korrekt skuldsättningsgrad?",
    kontext: "Tre olika kvoter ur samma balansräkning — bara en är skuldsättningsgraden (V10).",
    berakning: {
      raknefall:
        "Balansräkning: tillgångar 500 Mkr, skulder 300 Mkr, eget kapital 200 Mkr. Kollegan säger: 'Skuldsättningsgraden är 500 / 200 = 2,5 — det är mycket, men ok.'",
      alternativ: [
        { text: "2,5 — tillgångar delat med eget kapital", ratt: false },
        { text: "1,5 — skulder delat med eget kapital", ratt: true },
        { text: "0,6 — eget kapital delat med skulder", ratt: false },
        { text: "0,4 — skulder delat med tillgångar", ratt: false },
      ],
      forklaring:
        "Skuldsättningsgrad (V10) = skulder / eget kapital = 300 / 200 = 1,5. Kollegans 2,5 är kapitalmultiplikatorn (tillgångar/eget), 0,6 är den omvända kvoten och 0,4 är skuldbeloppet i procent av balansomslutningen. Samma siffror — fyra olika betydelser.",
    },
  },
  {
    id: "risk-3",
    amne: "risk",
    kategori: "historia",
    svarighet: 3,
    kursRef: "v10-skuldsattningsgrad",
    fraga:
      "Penn Central kallades 'för stort för att falla' — och föll. Vilka balansräkningsrader visade varningarna i förväg — och vilka rader i din egen analys läser du aldrig?",
    kontext:
      "Penn Central (1970): kassaflödet visade blödningen länge före aktien och obligationerna gjorde det.",
  },

  // ── Kassaflöde ─────────────────────────────────────────────────────────
  {
    id: "kassaflode-1",
    amne: "kassaflode",
    kategori: "matematik",
    svarighet: 1,
    fraga:
      "Bokförd vinst kan sminkas. Vilken rad i kassaflödesanalysen litar du på mest — och vad gör dig så säker på just den raden?",
    kontext: "Vinst är en åsikt, kassaflöde är ett faktum.",
  },
  {
    id: "kassaflode-2",
    amne: "kassaflode",
    kategori: "matematik",
    svarighet: 2,
    fraga: "Räkna själv: hur mycket kontanter genererade driften?",
    kontext: "Ökade fordringar och lager binder kontanter — vinsten finns på pappret, pengarna hos kunderna.",
    berakning: {
      raknefall:
        "Bolag Z: vinst 50 Mkr, avskrivningar 20 Mkr. Under året ökade kundfordringarna med 30 Mkr och lagret med 10 Mkr. Kollegan säger: 'Driftskassaflöde = 50 + 20 = 70 Mkr — välförtjänt!'",
      alternativ: [
        { text: "70 Mkr — vinst plus avskrivningar räcker långt", ratt: false },
        { text: "30 Mkr — även ökade fordringar och lager dras ifrån", ratt: true },
        { text: "50 Mkr — vinsten är kassan, resten är detalar", ratt: false },
        { text: "10 Mkr — bara lagret räknas som kontantbindning", ratt: false },
      ],
      forklaring:
        "Driftskassaflöde (förenklat) = 50 + 20 − 30 − 10 = 30 Mkr. Avskrivningar är ingen kassaflödespost, men de ökade kundfordringarna och lagret binder faktiska kontanter. Bolaget är 'lönsamt' medan pengarna flyttats till kunder och hyllor.",
    },
  },
  {
    id: "kassaflode-3",
    amne: "kassaflode",
    kategori: "risk",
    svarighet: 3,
    kursRef: "v19-kapitalforbranning",
    fraga:
      "Bolaget är lönsamt på pappret men bränner kassa varje kvartal. Hur länge räcker kistan — och vad händer med dig som ägare den dagen den tar slut?",
    kontext:
      "V19: kapitalförbränning → emission → utspädning. Lönsamhet på papper utan kassa är en klocka som tickar.",
  },

  // ── Moat (V13/V14/V15) ─────────────────────────────────────────────────
  {
    id: "moat-1",
    amne: "moat",
    kategori: "antagande",
    svarighet: 1,
    kursRef: "v14-varumarke",
    fraga:
      "Du skriver 'starkt varumärke' i din analys. Vad tvingar konkret kunden att stanna — och vad skulle få samma kund att byta imorgon?",
    kontext:
      "En moat du inte kan förklara mekanismen bakom är en trend, inte ett vallgrav.",
  },
  {
    id: "moat-2",
    amne: "moat",
    kategori: "logik",
    svarighet: 2,
    kursRef: "v15-natverkseffekter",
    fraga:
      "Nätverkseffekter skalar uppåt — men kan de även vända? Vad händer med ett tvåsidigt nätverk när båda sidor börjar lämna samtidigt?",
    kontext: "Nätverk som växer exponentiellt kan krympa exponentiellt.",
  },
  {
    id: "moat-3",
    amne: "moat",
    kategori: "historia",
    svarighet: 3,
    kursRef: "v13-patent-ip",
    fraga:
      "Kodak hade varumärke, patent och distribution — och förlorade ändå. Vilken typ av moat höll inte — och hur testar du din egen moat mot exakt den typen av angrepp?",
    kontext: "Teknikskiften äter patent-moats: paradigmbyten struntar i distribution och varumärke.",
  },

  // ── V19: Emission & kapitalförbränning ─────────────────────────────────
  {
    id: "v19-1",
    amne: "v19-emission",
    kategori: "antagande",
    svarighet: 1,
    kursRef: "v19-kapitalforbranning",
    fraga:
      "Bolaget meddelar en ny emission 'för att finansiera tillväxt'. Vem betalar egentligen — och vad får den ägaren som inte tecknar?",
    kontext:
      "Emissioner är inte gratis kapital: i en emission till underpris betalar gamla ägare genom utspädning.",
  },
  {
    id: "v19-2",
    amne: "v19-emission",
    kategori: "matematik",
    svarighet: 2,
    kursRef: "v19-kapitalforbranning",
    fraga: "Räkna själv: vad blir den teoretiska ex-rights-kursen (TEK)?",
    kontext: "Det nya kapitalet tillförs bolaget — kursen landar strax under gamla kursen, inte på emissionspriset.",
    berakning: {
      raknefall:
        "Bolag A: 10 miljoner aktier à 20 kr (marknadsvärde 200 Mkr). Ny emission: 2,5 miljoner aktier till 16 kr, som ger 40 Mkr nytt kapital. Kollegan säger: 'Emissionen diluerar — nya kursen blir väl emissionspriset, 16 kr?'",
      alternativ: [
        { text: "16 kr — emissionen till underpris sätter den nya kursen", ratt: false },
        { text: "19,2 kr — (gammalt värde + nytt kapital) / totalt antal aktier", ratt: true },
        { text: "20 kr — den gamla kursen gäller för gamla aktier", ratt: false },
        { text: "18,4 kr — hälften av utspädningen slår igenom", ratt: false },
      ],
      forklaring:
        "TEK = (200 + 40) / 12,5 = 19,2 kr. De 40 Mkr:n tillförs bolagets värde, så värdet per aktie efter emissionen landar strax under gamla kursen. Kursfall till 16 kr kräver att marknaden samtidigt värderar om verksamheten — det är en annan fråga.",
    },
  },
  {
    id: "v19-3",
    amne: "v19-emission",
    kategori: "risk",
    svarighet: 3,
    kursRef: "v19-kapitalforbranning",
    fraga:
      "Tre emissioner på fem år, var och en med löftet 'nu är vi framme vid lönsamhet'. Vilken siffra i rapporten avslöjar om löftet håller den här gången — och hur många gånger till tänker du finansiera resan?",
    kontext:
      "Kapitalförbränning + upprepade emissioner = ägarna betalar för en resa utan garanterad destination.",
  },

  // ── Vågor & AK1TS ──────────────────────────────────────────────────────
  {
    id: "vagor-1",
    amne: "vagor-ak1ts",
    kategori: "logik",
    svarighet: 1,
    kursRef: "ak1ts-vaglarans-hierarki",
    fraga:
      "Du pratar om 'trenden'. Vilken tidshorisont i våglärans hierarki menar du — Mikro, Meso eller Makro? Och hur avgör du skillnaden i praktiken?",
    kontext: "AK1TS fem horisonter: en 'trend' utan angiven horisont är bara en känsla.",
  },
  {
    id: "vagor-2",
    amne: "vagor-ak1ts",
    kategori: "antagande",
    svarighet: 2,
    fraga:
      "Vågor upprepas — men aldrig identiskt. Vilken variabel i din analys fångar det som INTE upprepas den här gången?",
    kontext: "Mönstren återkommer, kontexterna gör det inte: 2000 ≠ 2008 ≠ 2020.",
  },
  {
    id: "vagor-3",
    amne: "vagor-ak1ts",
    kategori: "logik",
    svarighet: 3,
    fraga:
      "Om vågstrukturen säger 'köp' men fundamentet (AKM1) säger 'sälj' — vilken litar du på, och varför? Vad kostar det att ha fel i just den ordningen?",
    kontext:
      "AK1TS och AKM1 är komplement: signalerna som pekar åt samma håll är de enda riktigt starka.",
  },

  // ── Portfölj ───────────────────────────────────────────────────────────
  {
    id: "portfolj-1",
    amne: "portfolj",
    kategori: "risk",
    svarighet: 1,
    kursRef: "portfolj-ekosystemet",
    fraga:
      "Hur stor är din största position i procent av portföljen — och vad i din analys motiverar just den storleken?",
    kontext: "Positionens storlek är analysens slutpoäng — den avslöjar vad du verkligen tror.",
  },
  {
    id: "portfolj-2",
    amne: "portfolj",
    kategori: "logik",
    svarighet: 2,
    kursRef: "portfolj-ekosystemet",
    fraga:
      "Du äger fem bolag. Diversifierar du mellan fem OLKA risker — eller fem varianter av samma risk?",
    kontext: "Fem bolag med samma kunder, samma räntekänslighet och samma sektor = en risk, inte fem.",
  },
  {
    id: "portfolj-3",
    amne: "portfolj",
    kategori: "antagande",
    svarighet: 3,
    kursRef: "portfolj-ekosystemet",
    fraga:
      "Din portfölj föll 30% förra månaden. Vilken mekanism — inte vilken känsla — hindrar dig från att sälja allt på botten?",
    kontext: "En skriven plan är det enda försvaret som fungerar när det gör som mest ont.",
  },

  // ── DCF-matematik ──────────────────────────────────────────────────────
  {
    id: "dcf-1",
    amne: "dcf-matematik",
    kategori: "matematik",
    svarighet: 1,
    fraga:
      "Din DCF — vilken WACC använde du, och vad händer med motivärdet om den är en hel procentenhet för låg?",
    kontext: "WACC 8% mot 9% kan flytta motivärdet med 25% eller mer.",
  },
  {
    id: "dcf-2",
    amne: "dcf-matematik",
    kategori: "matematik",
    svarighet: 2,
    fraga: "Räkna själv: vad är korrekt WACC?",
    kontext: "Räntan är avdragsgill — lånet kostar mindre än skylten säger.",
    berakning: {
      raknefall:
        "En DCF-räknare: 60% eget kapital med 10% avkastningskrav, 40% lån till 4% ränta. Hon summerar: 0,6 × 10 + 0,4 × 4 = 7,6% och kör vidare med det.",
      alternativ: [
        { text: "7,6% — räkneverket är redan korrekt", ratt: false },
        { text: "Cirka 7,3% — räntekostnaden är avdragsgill och räknas efter skatt", ratt: true },
        { text: "10% — det egna kapitalets kostnad dominerar och räcker", ratt: false },
        { text: "6,0% — den billiga räntan väger upp avkastningskravet", ratt: false },
      ],
      forklaring:
        "Efter skatt kostar lånet 4% × (1 − 0,206) ≈ 3,2% (svensk bolagsskatt 20,6%). Korrekt WACC = 0,6 × 10 + 0,4 × 3,2 ≈ 7,3%. Hon glömde skatteskyddet på räntan — felet ser litet ut, men i en DCF med långa kassaflöden blir det en stor post i motivärdet.",
    },
  },
  {
    id: "dcf-3",
    amne: "dcf-matematik",
    kategori: "matematik",
    svarighet: 3,
    fraga: "Räkna själv: vad är korrekt terminalvärde?",
    kontext: "I en DCF står merparten av värdet i terminalraden — både WACC och g förtjänar respekt.",
    berakning: {
      raknefall:
        "FCF år 6: 10 Mkr. WACC 8%, evig tillväxt efter år 5: 2%. En räknare glömmer tillväxtterminen och skriver: 'Terminalvärde = 10 / 0,08 = 125 Mkr, klart.'",
      alternativ: [
        { text: "125 Mkr — Gordon räknas utan tillväxt", ratt: false },
        { text: "Cirka 167 Mkr — Gordon: FCF / (WACC − g) = 10 / 0,06", ratt: true },
        { text: "80 Mkr — tillväxten minskar värdet", ratt: false },
        { text: "200 Mkr — 10 Mkr i evighet vid 5% avkastning", ratt: false },
      ],
      forklaring:
        "Terminalvärde = FCF / (WACC − g) = 10 / (0,08 − 0,02) ≈ 166,7 Mkr. Den eviga tillväxten g gör nämnaren mindre och värdet större. Kom ihåg att detta är känsligaste raden i hela DCF:n — en procentenhet i g eller WACC flyttar miljonerna.",
    },
  },
];

// ── Historiska fall per ämne ───────────────────────────────────────────────

const HISTORISKA_FALL: Record<AmneId, HistorisktFall> = {
  roe: {
    bolag: "H&M",
    fel: "ROE föll från 30% till 10% när moaten eroderade",
    lardom: "ROE är en produkt av moat — när moaten försvinner, försvinner ROE",
  },
  tillvaxt: {
    bolag: "Sinch",
    fel: "Förvärvsdriven tillväxt financed med skulder",
    lardom: "Organisk tillväxt väger tyngre än köpt tillväxt",
  },
  vardering: {
    bolag: "Nifty Fifty (1972)",
    fel: "Betalade premium för 'kvalitet' oavsett pris",
    lardom: "Priset du betalar väger tyngre än bolagets kvalitet",
  },
  risk: {
    bolag: "Penn Central (1970)",
    fel: "Ignorerade välbekanta varningar i balansräkningen",
    lardom: "Läs balansräkningen — varningarna står där, i förväg",
  },
  kassaflode: {
    bolag: "Wirecard",
    fel: "Imponerande vinst på pappret — kassan fanns inte",
    lardom: "Vinst är en åsikt, kassaflöde är ett faktum",
  },
  moat: {
    bolag: "Kodak",
    fel: "Patent, varumärke och distribution — men ett teknikskifte åt förbi",
    lardom: "Moats skyddar mot konkurrenter, inte mot paradigmskiften",
  },
  "v19-emission": {
    bolag: "Northvolt",
    fel: "Tung kapitalförbränning och upprepade kapitalbehov",
    lardom: "Fråga alltid hur länge kistan räcker — och vem som betalar när den är tom",
  },
  "vagor-ak1ts": {
    bolag: "IT-bubblan (2000)",
    fel: "Mönstret lästes rätt — kontexten ignorerades",
    lardom: "Vågor upprepas, kontexterna gör det aldrig",
  },
  portfolj: {
    bolag: "LTCM (1998)",
    fel: "'Diversifierade' modeller — samma risk överallt, med hävstång",
    lardom: "Diversifiera mellan olika risker, inte olika namn på samma risk",
  },
  "dcf-matematik": {
    bolag: "Nortel (2000)",
    fel: "DCF-motivvärden byggda på ohållbara tillväxtantaganden",
    lardom: "En DCF är bara så stark som sina mest känsliga antaganden",
  },
};

// ── Urvalsfunktioner (rena — används av både klient och API-route) ────────

function slump(n: number): number {
  return Math.floor(Math.random() * n);
}

/** Filtrera pool stegvis: exakt nivå → högst nivån → allting (P8: inget låses). */
function nivaPool(pool: AttackFraga[], niva: Niva): AttackFraga[] {
  if (pool.length === 0) return pool;
  const exakt = pool.filter((a) => a.svarighet === niva);
  if (exakt.length > 0) return exakt;
  const inom = pool.filter((a) => a.svarighet <= niva);
  if (inom.length > 0) return inom;
  return pool;
}

/** Välj en attack — sokratisk eller beräknings-attack, med svårighet efter nivå. */
export function valAttack(opts: {
  amne?: AmneVal;
  niva?: Niva;
  exkludera?: string[];
  baraBerakning?: boolean;
}): AttackFraga {
  const niva: Niva = opts.niva ?? 1;
  const exkludera = opts.exkludera ?? [];
  let pool = ATTACKER.filter((a) => (opts.baraBerakning ? Boolean(a.berakning) : true));
  if (opts.amne && opts.amne !== "overraska") pool = pool.filter((a) => a.amne === opts.amne);
  const osedda = pool.filter((a) => !exkludera.includes(a.id));
  const bas = osedda.length > 0 ? osedda : pool;
  const urval = nivaPool(bas, niva);
  return urval[slump(urval.length)];
}

/** Välj en beräknings-attack (8 st) — svårighet styrd av nivån. */
export function valBerakningsAttack(niva: Niva = 1, exkludera: string[] = []): AttackFraga {
  return valAttack({ niva, exkludera, baraBerakning: true });
}

/** Kontextuell inledning — preficas eleven med sin faktiska situation. */
export function kontextuellInledning(
  fraga: AttackFraga,
  ctx: { klaraKurser: string[]; paagaaendeKurs?: string | null }
): string | null {
  if (!fraga.kursRef) return null;
  const titel = KURS_TITLAR[fraga.kursRef];
  if (!titel) return null;
  if (ctx.paagaaendeKurs && ctx.paagaaendeKurs === fraga.kursRef) {
    return `Du läser just nu kursen ${titel} — då vätter jag på kunskapen medan den är färsk: `;
  }
  if (ctx.klaraKurser.includes(fraga.kursRef)) {
    return `Du har klarat kursen ${titel} — men kan du använda den under tryck? `;
  }
  return null;
}

/** Historiskt fall för ett ämne. */
export function historisktFallFor(amne: AmneId): HistorisktFall {
  return HISTORISKA_FALL[amne];
}

// ── Tes-analys (nyckelord → ämnen → 1–5 sekventiella attacker) ────────────

const NYCKELORD: Record<AmneId, string[]> = {
  roe: ["roe", "avkastning på eget", "eget kapital", "lönsamhet", "dupont", "vinstmarginal"],
  tillvaxt: ["tillväxt", "growth", "cagr", "organisk", "intäkt", "arr", "återkommande", "förvärv"],
  vardering: ["p/e", "pe-tal", "multipel", "ev/ebitda", "p/s", "undervärder", "billig", "kursmål"],
  risk: ["risk", "skuld", "balansräkning", "hävstång", "soliditet", "ränta", "skuldsättningsgrad"],
  kassaflode: ["kassaflöde", "fcf", "fritt kassaflöde", "kassa", "utdelning", "brinner"],
  moat: ["moat", "konkurrens", "varumärke", "patent", "nätverk", "fördel", "switching"],
  "v19-emission": ["emission", "nyemission", "utspäd", "kapitalförbränning", "burn rate", "teckna"],
  "vagor-ak1ts": ["våg", "trend", "cykel", "horisont", "teknisk", "graf", "mönster", "korrektion"],
  portfolj: ["portfölj", "position", "diversifier", "vikt", "exponering", "andel"],
  "dcf-matematik": ["dcf", "wacc", "terminalvärde", "nutidsvärde", "diskonter", "motivärde", "kalkyl"],
};

/** Nyckelordsanalys av tesen → träffade ämnen, ordnade efter träffar. */
export function amneFranTes(tes: string): AmneId[] {
  const lower = tes.toLowerCase();
  return (Object.keys(NYCKELORD) as AmneId[])
    .map((amne) => ({ amne, traffar: NYCKELORD[amne].filter((n) => lower.includes(n)).length }))
    .filter((x) => x.traffar > 0)
    .sort((a, b) => b.traffar - a.traffar)
    .map((x) => x.amne);
}

/**
 * Bygg 1–5 sekventiella försvars-attacker ur tesen.
 * Antalet styrs av hur många ämnesdomäner tesen rör (1–5; mager tes → 2).
 * Enbart sokratiska frågor — beräknings-attacker hör till attack-läget.
 */
export function forsvarsFragor(tes: string, niva: Niva = 1, maxAntal = 5): AttackFraga[] {
  const amnenTräffade = amneFranTes(tes);
  const antal = Math.min(maxAntal, Math.max(1, amnenTräffade.length || 2));
  const fragor: AttackFraga[] = [];
  const använda = new Set<string>();

  const ta = (pool: AttackFraga[]): AttackFraga | null => {
    const osedda = pool.filter((a) => !använda.has(a.id));
    if (osedda.length === 0) return null;
    const urval = nivaPool(osedda, niva);
    const vald = urval[slump(urval.length)];
    använda.add(vald.id);
    return vald;
  };

  for (const amne of amnenTräffade.slice(0, antal)) {
    const f = ta(ATTACKER.filter((a) => a.amne === amne && !a.berakning));
    if (f) fragor.push(f);
  }
  while (fragor.length < antal) {
    const f = ta(ATTACKER.filter((a) => !a.berakning));
    if (!f) break;
    fragor.push(f);
  }
  return fragor.slice(0, antal);
}
