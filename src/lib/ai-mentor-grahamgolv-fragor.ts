/**
 * AI-MENTORN 2.0 — GRAHAMGOLV-FÖRHANDSFRÅGOR (spår 6, omgång 13, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de tjugoett committade
 * lagren (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa,
 * kapitalmekanik, sektor, case, praktik, portfoljgrund, ägande,
 * redovisningsdjup, djup, historia, lonsamhetsdjup, tsdjup, skattedjup,
 * beteendedjup, riskdjup, riskmåttsdjup, utdelningsdjup, förväntningsdjup)
 * — i samma fönster wireade syskonen s6-u1:s portfoljbalans (rebalan-
 * serings-familjen) och s6-u2:s stabilitetsdjup (känslighetsanalys/
 * soliditetsgrad-familjen; modulen otrackad på disk vid denna leverans,
 * deras wiring äger sina frågor):
 *   1. Net-net & NCAV (value-investing-from-graham-to-buffett primär +
 *      the-intelligent-investor + security-analysis + the-snowball) —
 *      Grahams extrema värdegolv: kursen betalar mindre än det som
 *      blir kvar när allt sålts och allt betalats
 *   2. Cigar butts (the-essays-of-warren-buffett primär + the-snowball +
 *      the-intelligent-investor + the-warren-buffett-way) — fimpen med
 *      ett gratis blosst kvar: värdestyrd rabatt som arbetsform
 *   3. Mr Market (the-intelligent-investor primär + the-essays-of-warren-
 *      buffett + value-investing-from-graham-to-buffett + security-
 *      analysis) — Grahams metafor om marknaden som tjänstvillig
 *      partner: priset är en offert, aldrig ett omdöme
 *
 * ÄMNESVAL EFTER TRE SONDROMDER (verktyg/_s6u3-sond-omg13.mjs + två
 * inlinesondor; 798 kärnord LIVE-lästa ur 21 lager med den riktiga
 * matcharen): rond 1 dödade stabilitets-familjen (soliditet → basens
 * kapitalstruktur, räntetäckningsgrad → riskdjupets kärnord, kvick/
 * intäktsstabilitet/skuldsättningsgrad → basens variabeluppslag),
 * blanknings-familjen (praktik-lagrets eget blankning-monster), private
 * equity (basen) och obligationer (makro). Rond 2 fann friheten: net-net,
 * NCAV, cigar butts, mr market, värdegolv — samtliga NULL genom hela
 * kedjan med INGA kärnordsgrannar inom tolerans. WIDGET-KOPPLING (samme
 * fyndtyp som praktik-lagrets fall K): widgetens förslagsknappar "Vad är
 * en net-net?" och "Förklara NCAV & cigar-butts" ställer exakt frågan
 * "vad är en net-net och NCAV?" — som före denna leverans gick rakt ut i
 * API-flödet vid varje klick; nu svarar kedjan lokalt utan API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt, testfallen H/I
 * bevisar båda vägarna; emission/V19-precedensen):
 *   • Basens böcker-monster äger GRAHAM-ORDEN: kärnorden "graham" och
 *     "intelligent investor" fångar varje fråga som bär dem (bevisat i
 *     sonden: "vad är grahams formel?" och "vad är the intelligent
 *     investor?" går till basen). Detta lager bär därför ALDRIG nakna
 *     graham-ord som kärnord — Graham-kurserna är här KÄLLOR och
 *     STARKORD (starkord kan aldrig stjäla en fråga: de räknas bara när
 *     ett kärnord redan träffat). Källägande ≠ kärnordsägande.
 *   • Nästa-lagret äger substansvärde/NAV-rabatt ("vad är substansvärde?"
 *     och "vad är nav-rabatt?" fångas där — fragor:-knappen i net-net-
 *     svaret länkar medvetet dit).
 *   • Djup-lagrets mästare äger Buffett-frågorna ("vem var warren
 *     buffett?" → deras monster; cigar butts-svarets knapp länkar dit).
 *   • Syskonen i fönstret: portfoljbalans (rebalansering) och
 *     stabilitetsdjup (känslighetsanalys/soliditetsgrad) delar inte ett
 *     enda kärnord med Graham-golv-familjen (närhetskontrollen i sonden:
 *     0 grannar ≤ 3 för net net/ncav/cigar butts/mr market/värdegolv).
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som utdelningsdjupets
 * "drip"-kur): kärnordet "ncav" (fyra tecken, tål ett fel) matchar även
 * frågeordet "nav" — men "nav" fångas av NÄSTA-lagret FÖRE detta lager
 * (deras kärnord matchar exakt, och kedjan prövar dem först), så stöld
 * är omöjlig i kompositionen; fallet vakas av testfall J3. Nakna kortord
 * ("fimp", "golv") är medvetet strukna som kärnord — kortordskuren,
 * tsdjup-precedensen.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de
 * rena funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
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
 *     ?? svaraLokaltPortfoljbalans(q, KURSREGISTER)
 *     ?? svaraLokaltGrahamgolv(q, KURSREGISTER)
 * Detta lager levererades SIST och kan därför aldrig stjäla en fråga från
 * ett tidigare lager; det fångar bara frågor som alla lager före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE
 * fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur Grahams begrepp NCAV, cigar
 * butts och Mr Market DEFINIERAS och RÄKNAS som metod — inga köp-/
 * säljsignaler, inga placeringstips, inga omdömen om enskilda bolag eller
 * värdepapper. Aritmetiken illustrerar mekaniken med påhittade tal,
 * aldrig utfästelser om avkastning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-grahamgolv.mjs kan köra filen direkt i Node.
 * Alla källkurser (value-investing-from-graham-to-buffett,
 * the-intelligent-investor, security-analysis, the-snowball,
 * the-essays-of-warren-buffett, the-warren-buffett-way) finns i
 * KURSREGISTER (verifierat i 358-registret — spår 5:s rebake lägger TILL
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

// ── De 3 grahamgolvfrågorna ─────────────────────────────────────────────────

export const GRAHAMGOLV_MONSTER: FragMonster[] = [
  {
    id: "netnet",
    karnord: [
      "net net", "netnet", "netnets", "net-net",
      "ncav", "nettotillgångsvärde", "nettotillgångsvärdesrabatt",
      "värdegolv", "värdegolvet", "värdegolven",
    ],
    starkord: [
      "graham", "kurs", "tillgångar", "skulder",
      "rabatt", "likvidation", "substans", "balansräkning",
      "säkerhetsmarginal",
    ],
    bygga: (reg) => {
      const bokAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const vmAntal = reg.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
      const kallor = [
        kursKalla(reg, "value-investing-from-graham-to-buffett", "Läroplanen — Greenwald om Grahams arv: från substansvärde till tillväxt"),
        kursKalla(reg, "the-intelligent-investor", "Läroplanen — Grahams huvudverk kapitel för kapitel"),
        kursKalla(reg, "security-analysis", "Läroplanen — Graham & Dodds grundverk, net-net-kapitlen"),
        kursKalla(reg, "the-snowball", "Läroplanen — Buffett-biografin: net-net-epokens affärer"),
      ];
      const k = kallor[0];
      const gw = reg.find((r) => r.slug === "value-investing-from-graham-to-buffett");
      return {
        text:
          `En net-net är Grahams mest extrema värdegolv: ett bolag vars börsvärde är LÄGRE än dess nettotillgångsvärde — NCAV (Net Current Asset Value). Med andra ord: kursen betalar mindre än det som blir kvar när allt i balansräkningen sålts och alla skulder betalats (allt nedan är utbildning i hur måttet beräknas och läses — ingen kommentar om något enskilt bolag):\n\n1️⃣ FORMELN — NCAV = omsättningstillgångar (kassa + fordringar + lager) − ALLA skulder. Notera vad som saknas: anläggningstillgångar räknas INTE — byggnader, maskiner och varumärken nollställs helt, som en extra säkerhetsmarginal. Aritmetisk illustration med påhittade tal: omsättningstillgångar 100 miljoner, skulder 40 miljoner ⇒ NCAV = 60 miljoner. Börsvärdet 36 miljoner ⇒ 36 ÷ 60 = 60 % av NCAV — kursen betalar 60 öre per krona för pengar som redan finns i balansräkningen, och hela verksamheten följer med gratis. Grahams inköpsregel var striktare: högst två tredjedelar (66,7 %) av NCAV — rabatten är själva skyddet.\n2️⃣ LÄSNINGEN — varför handlas något under sitt golv? Tre klassiska förklaringar: (a) marknaden förväntar sig att verksamheten FÖRBRÄNNER tillgångarna (förluster äter golvet underifrån — då är rabatten en prisatt varning, samma mekanik som kapitalförbränningen i risk-kurserna); (b) kapitalet är låst — bolaget vägrar dela ut eller sälja av, och ägarna kan inte tvinga fram värdet (den värdestylda rabatten som investmentbolagsspåret känner igen); (c) bolaget är för litet eller omdiskuterat för att analyseras. Grahams egen regel mot fallet (a): net-nets köptes som en KORG av många — den enskilda träffen får aldrig bära metoden.\n3️⃣ GRÄNSERNA — bokfört värde är inte likvidationsvärde: ett lager som säljs i panik kan ge mycket mindre än bokfört, och fordringar kan visa sig osäkra. Golvet gäller på RAPPORTDAGEN; mellan rapporterna kan det både växa och smälta. Därför är net-net ett startläge för analys, aldrig ett slutgiltigt svar — frågan "varför står kursen här?" är alltid del av läsningen (förväntningsgapets metod). Cigar butts är arbetsformen som bygger på detta golv — nästa svar.\n\nI bokmaster-biblioteket finns ${bokAntal} böcker som kurser och i värderingsmetoderna ${vmAntal} kurser — Greenwald-boken (${gw ? gw.minuter + " min" : "i registret"}) ägnar net-nets ett eget kapitel med räkneexempel. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "netnet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Value Investing (Greenwald)", lank: "/kurser/value-investing-from-graham-to-buffett", ikon: "📗", beskrivning: "Från Graham till Buffett — med net-net-kapitel" },
          { text: "Kursen: The Intelligent Investor", lank: "/kurser/the-intelligent-investor", ikon: "🛡️", beskrivning: "Grahams huvudverk, kapitel för kapitel" },
          { text: "Kursen: Security Analysis", lank: "/kurser/security-analysis", ikon: "📐", beskrivning: "Grundverket där golvmåttet föddes" },
          { text: "Kursen: The Snowball", lank: "/kurser/the-snowball", ikon: "❄️", beskrivning: "Net-net-epokens affärer i Buffett-biografin" },
          { text: "Vad är substansvärde?", lank: "fragor:" + encodeURIComponent("vad är substansvärde?"), ikon: "🧮", beskrivning: "Släktmåttet — nästa-lagrets område" },
        ],
        motfraga: { text: "Vad är cigar butts?", kategori: "värderingsmetoder" },
        fordjupa: { text: k.titel, lank: "/kurser/value-investing-from-graham-to-buffett" },
      };
    },
  },
  {
    id: "cigarbutt",
    karnord: [
      "cigar butts", "cigar butt", "cigarbutts", "cigarbutt",
      "cigarettfimp", "cigarettfimpar", "fimpen",
    ],
    starkord: [
      "buffett", "graham", "billigt", "värde", "rabatt",
      "substans", "sista", "net net", "golv",
    ],
    bygga: (reg) => {
      const bokAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const kallor = [
        kursKalla(reg, "the-essays-of-warren-buffett", "Läroplanen — Buffetts egna brev om cigar butts och skiftet till kvalitet"),
        kursKalla(reg, "the-snowball", "Läroplanen — biografin: fimphandeln som ung man"),
        kursKalla(reg, "the-intelligent-investor", "Läroplanen — Grahams metod som cigar butts bygger på"),
        kursKalla(reg, "the-warren-buffett-way", "Läroplanen — Hagstrom om de två skolorna"),
      ];
      const k = kallor[0];
      const ew = reg.find((r) => r.slug === "the-essays-of-warren-buffett");
      return {
        text:
          `Cigar butts — cigarettfimparna — är Warren Buffetts bild för den djupaste värdemässiga rabatten: på trottoaren ligger en avslagen fimpe med ett sista blosst kvar. Plocka upp den, ta det gratis blosset, upprepa. Översatt till aktier: ett bolag köpt så billigt att bara ETT sista värdeuttrag återstår — verksamheten behöver inte växa ett steg, värdet behöver bara gå FRAM till sitt golv (allt nedan är utbildning i mekaniken — ingen kommentar om något enskilt bolag):\n\n1️⃣ MATTAN UNDER FIMPEN — cigar butts bygger på net-net-måttet NCAV (förra svarets golv): omsättningstillgångar minus alla skulder. Aritmetisk illustration med påhittade tal: NCAV 60 miljoner, börsvärde 30 miljoner ⇒ kursen betalar hälften av golvet. Skulle en händelse frigöra 45 miljoner (75 % av NCAV — en försäljning, en extra utdelning, ett bud) uppstår 50 % värdeutrymme UTAN att verksamheten tjänat en krona mer. Det är blosset: vinsten kommer från rabatten, inte från rörelsen.\n2️⃣ TVÅ UTFALL SOM BARA VÄRDET — fimpen betalar på två sätt: antingen omprissätter marknaden bolaget (golvet syns), eller så frigörs kapitalet (styrelsen delar ut, säljer av eller tar emot ett bud — kapitalåterbäringens dörrar). I båda fallen är drivkraften att kursen låg under något räknbart — inte att framtiden blev bättre än väntat. Därför är cigar butts metodens mest mekaniska gren: räkna golvet, betala mindre, vänta på att rabatten sluts.\n3️⃣ KOSTNADERNA BUFFETT RÄKNADE PÅ — i breven beskriver han tre problem: fimphandeln är TIDSKRAVANDE (positioner måste resas och städas en i taget, ofta med påtryckningar mot styrelser), affärerna TAR SLUT (fimparna på trottoaren sinar), och SKATTEN kan äta återinvesteringens kronor. Hans egen sväng — med Munger bakom ratten — gick mot underbart företag till rimligt pris: färre affärer, längre kvarhållning, värdet som växer inifrån. De två skolorna lever sida vid sida; gemensam nämnare är kravet att betala mindre än något som kan räknas (mästarna har sina egna svar).\n\nI bokmaster-biblioteket finns ${bokAntal} böcker som kurser — essaysamlingen (${ew ? ew.minuter + " min" : "i registret"}) samlar Buffetts egna ord om skiftet. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "cigarbutt",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: The Essays of Warren Buffett", lank: "/kurser/the-essays-of-warren-buffett", ikon: "✉️", beskrivning: "Buffetts egna ord om fimpar och skiftet" },
          { text: "Kursen: The Snowball", lank: "/kurser/the-snowball", ikon: "❄️", beskrivning: "Fimphandeln som ung man" },
          { text: "Kursen: The Intelligent Investor", lank: "/kurser/the-intelligent-investor", ikon: "🛡️", beskrivning: "Metoden bakom rabatten" },
          { text: "Kursen: The Warren Buffett Way", lank: "/kurser/the-warren-buffett-way", ikon: "🎩", beskrivning: "De två skolorna sida vid sida" },
          { text: "Vem var Warren Buffett?", lank: "fragor:" + encodeURIComponent("vem var warren buffett?"), ikon: "🏛️", beskrivning: "Mästaren bakom bilden — djup-lagret" },
        ],
        motfraga: { text: "Vem är Mr Market?", kategori: "bokmaster" },
        fordjupa: { text: k.titel, lank: "/kurser/the-essays-of-warren-buffett" },
      };
    },
  },
  {
    id: "mrmarket",
    karnord: [
      "mr market", "herr marknad", "mr marknad", "herrar marknad",
    ],
    starkord: [
      "graham", "pris", "erbjudande", "humör", "eufori",
      "panik", "psykologi", "offert", "partner",
    ],
    bygga: (reg) => {
      const bokAntal = reg.filter((r) => r.kategori === "BOKMASTER").length;
      const kallor = [
        kursKalla(reg, "the-intelligent-investor", "Läroplanen — kapitel 8: Mr Market föddes här"),
        kursKalla(reg, "the-essays-of-warren-buffett", "Läroplanen — Buffetts hyllning: marknaden är där för att tjäna dig, inte guida dig"),
        kursKalla(reg, "value-investing-from-graham-to-buffett", "Läroplanen — Greenwald om priset som tjänare, inte herre"),
        kursKalla(reg, "security-analysis", "Läroplanen — analysens plats före offerten"),
      ];
      const k = kallor[0];
      const tii = reg.find((r) => r.slug === "the-intelligent-investor");
      return {
        text:
          `Mr Market — herr marknad — är Benjamin Grahams metafor från kapitel 8 i The Intelligent Investor, och hela värdeinvesteringens psykologiska grund: föreställ dig att du äger en andel av ett litet bolag tillsammans med en mycket tjänstvillig partner vid namn Mr Market. Varje dag dyker han upp med ett pris: antingen erbjuder han att köpa din andel eller sälja dig fler — och hans humör svänger. Vissa dagar är han euforisk och priset är högt; andra dagar är han deprimerad och priset är lågt (allt nedan är utbildning i hur metaforen används — ingen kommentar om marknadsläget i dag):\n\n1️⃣ TJÄNSTEN ÄR GRATIS ATT AVSTÅ — Mr Market erbjuder, du bestämmer. Det finns ingen obligatorisk affär: hans pris är en OFFERT att acceptera eller ignorera, aldrig ett omdöme om vad bolaget är värt. Nyckeln är friheten — du får låta honom stå och ropa en hel vecka utan att lyfta ett finger. Den enda gången hans humör betyder något är när det råkar passa din egen kalkyl.\n2️⃣ PRIS ÄR KÄNSLA, VÄRDE ÄR KALKYL — marknadspriset är den senaste handlarens sinnelag sammanfattat i en siffra; det innehåller ingen analys alls. Därför är en stor del av volatiliteten (riskmåttens nämnare) helt enkelt Mr Markets humör — samma bolag, samma dag, två olika pris beroende på vem som ropade senast. Metoden som följer: räkna värdet FÖRST — substans, förtjänstkraft, golv — och låt sedan offerten bli en affär först när den avviker tydligt från kalkylen. I vändningar är det omvända ordningen som skadar: först pris, sedan en efterhandspåhittad berättelse som förklarar priset.\n3️⃣ DE FLESTA DAGAR SKA INGENTING HÄNDA — Mr Markets bud ligger oftast hyfsat nära värdet, och då är rätt svar att göra ingenting. Det är avvikelserna som är affärerna: hans eufori bjuder ut, hans depression bjuder in. Psykologin är detsamma som beteendefinansens flockmekanik — att inte delge humöret är en färdighet som går att träna, och Grahams metafor är träningens redskap: partnern blir hanterbar när han har ett namn och en vana.\n\nI bokmaster-biblioteket finns ${bokAntal} böcker som kurser — huvudverket (${tii ? tii.minuter + " min" : "i registret"}) går igenom Mr Market-kapitlet steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "mrmarket",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: The Intelligent Investor", lank: "/kurser/the-intelligent-investor", ikon: "🛡️", beskrivning: "Kapitel 8 — Mr Markets födelseplats" },
          { text: "Kursen: The Essays of Warren Buffett", lank: "/kurser/the-essays-of-warren-buffett", ikon: "✉️", beskrivning: "Priset som tjänare, inte herre" },
          { text: "Kursen: Value Investing (Greenwald)", lank: "/kurser/value-investing-from-graham-to-buffett", ikon: "📗", beskrivning: "Grahams arv i modern form" },
          { text: "Kursen: Security Analysis", lank: "/kurser/security-analysis", ikon: "📐", beskrivning: "Kalkylen före offerten" },
          { text: "Vilka böcker ska jag läsa?", lank: "fragor:" + encodeURIComponent("vilka böcker ska jag läsa?"), ikon: "📚", beskrivning: "Biblioteket bakom metaforen — bas-lagret" },
        ],
        motfraga: { text: "Vad är en net-net?", kategori: "bokmaster" },
        fordjupa: { text: k.titel, lank: "/kurser/the-intelligent-investor" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre grahamgolv-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltGrahamgolv(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of GRAHAMGOLV_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
