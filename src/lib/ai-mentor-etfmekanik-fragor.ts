/**
 * AI-MENTORN 2.0 — ETF-MEKANIK-FÖRHANDSFRÅGOR (spår 6, omgång 25, s6-u1).
 *
 * Ett källmärkt förhandsfråga-monster ovanpå de åttiofem föregående lagren —
 * kedjans fråga för den börshandlade fondens inre maskineri: korgen, andelen,
 * skapelsen och inlösen, arbitraget som håller priset vid NAV, hävstångens
 * och rullens tullar, samt indexomläggningens flöde (am-08 primär + am-07 +
 * am-01 + od-07 + am-02).
 *
 * Aktiverar TVÅ mentorväglösa kurser — KATEGORIN AKTIEMARKNADEN I PRAKTIKEN
 * blir FULLT LÄNKAD (8/10 → 10/10; km-069/km-070 var redan nådda) med
 * am-08-etfens-inre-mekanik som primär (Intermediär, 24 min) och
 * am-07-indexomlaggningen som andra källan — spårets mål "fler kurslänkar
 * per svar", utan API-kostnad. am-08 byggdes 2026-09-19 av spår 5; detta
 * lager ger den — och terminskontraktet od-07 som tredje mentorväglösa
 * kurs — sin mentorväg.
 *
 * ÄMNESVAL EFTER SOND I TRE RONDER (verktyg/_s6u1-sond-omg25.mjs +
 * _s6u1-sond2-omg25.mjs, otrackade diskbevis; anspråk
 * data/vakten/s6-omg25-u1-ansprak.md FÖRE byggstart): hela den svenska
 * etf-mekanik-familjen var NULL genom kedjans 58 motorer / 165 monsters
 * («vad är en börshandlad fond?» · «vad är en auktoriserad deltagare?» ·
 * «hur skapas etf-andelar?» · «vad är etf-arbitrage?» · «vad är contango?»
 * · «vad är en hävstångsetf?» · «vad är spårningsavvikelsen?») och
 * omläggnings-familjen likaså («vad är indexomläggningen?» · «vad är
 * effektdagen?» · «vad händer när ett bolag tillkommer ett index?»);
 * kärnorden indexomläggning/omläggning/effektdag/tillkännagivande/
 * auktoriserad deltagare/skapelse/inlösen/contango/backwardation/
 * hävstångsetf/spårningsavvikelse/flashdagen/börshandlad fond RENTA mot
 * kedjans unika syskonkärnord (0 grannar inom tavstånd 2; motorns
 * tolerans är 2). Prototyp-stöldprovet: 0 fångster av syskonens kanoniska
 * frågor.
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; V19-precedensen —
 * källägande ≠ kärnordsägande):
 *   • Praktik (am-02) äger GRUNDFRÅGORNA («vad är en indexfond?» · «vad är
 *     en etf?» FÅNGAS av praktiken — sondbevisat): naket index/indexfond/
 *     etf är deras kärnord, här ENDAST stärkord + knapp; «etfens» är ett
 *     annat ord än «etf» och träffas aldrig av deras korta exakta match.
 *   • Marknadsmekaniken (am-01) äger spread/likviditet/orderbok;
 *     handelsdagen (am-05) äger auktionerna — bärs som knapp respektive
 *     text; am-01 här ENDAST som källa.
 *   • Nästa/options äger naket «termin» — od-07 bärs här ENDAST som källa +
 *     kurslänk; contango/backwardation är egna FRIA kärnord (inget syskon
 *     äger dem), termins-orden i övrigt stärkord.
 *   • Nästa/investmentbolag äger nav/substansvärde — nav här endast
 *     stärkord och korgens räkning i text (NAV:s mekanik är kursens eget
 *     kapitel och citeras med kursens tal, aldrig som ägt kärnord).
 *   • Basen äger «hävstång» — sammansättningen «hävstångsetf» är ett eget
 *     ord (tavstånd > 2 mot «hävstång») och detta lagers enda hävstångs-
 *     kärnord; nätt «hävstång» lämnas basen.
 *   • Portfölj-praktiken äger «rebalansering» — ordet «ombalansering»
 *     KASTADES ur kärnordslistan (tavstånd 2 hade stulit deras fråga) och
 *     förekommer endast i svartext.
 *   • Naket «arbitrage» bärs INTE (bf-13-arbitragens gränser är
 *     mentorväglös — framtida lagres fett); sammansättningen
 *     «etf-arbitrage» KASTADES ur kärnorden efter G2-upptäcken i
 *     regressionstestet: praktikens nakna korta kärnord «etf» träffar
 *     varje fråga där «etf» står som fristående ord («vad är
 *     etf-arbitrage?» → «etf arbitrage» efter diafri), och praktiken
 *     ligger FÖRE detta lager i kedjan — frågan är deras och kärnordet
 *     här hade varit dödvikt. Lagrets arbitrage-fångst sker via
 *     korg-/skapelse-/premie-orden («börshandlad fond», «skapelsen»,
 *     «inlösen», «premiens» territorium i texten).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx): detta lager ligger efter nyaterritorier
 * (59:e motorn av 60 i fönstrets slutläge — FÖRE syskonet s6-u2:s kontrahent,
 * som wireades parallellt i samma fabrikfönster; inget SIST-anspråk mot
 * dem) och kan därför aldrig stjäla en fråga från tidigare lager; omvänt
 * vaktar testfall H på att denna fråga INTE fångas av kedjan utan detta
 * lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur den börshandlade fonden och
 * indexomläggningen DEFINIERAS, RÄKNAS och LÄSES — inga köp-/säljsignaler,
 * inga placeringstips, inga omdömen om enskilda värdepapper. Aritmetiken
 * återger kursernas egna exempeltal (10 000 000 ÷ 1 000 000 = 10,00 ·
 * 10 200 000 → NAV 10,20 · 5 000 000 ÷ 10,00 = 500 000 andelar ·
 * 500 000 × 10,04 = 5 020 000 − 5 000 000 = 20 000 − 2 000 = 18 000 ·
 * diskontet 9,96 → 4 980 000 · flashdagen 6 maj 2010 med 20-30-50 procent ·
 * 1,05 × 0,9524 = 1,00 mot 1,10 × 0,9048 = 0,995 · 0,995^5 ≈ 0,976 ·
 * 0,80 × 1,25 = 1,00 mot 0,60 × 1,25 = 0,75 · contangon 50,00/50,50 med
 * 0,99^12 = 0,886 = −11,4 procent · omläggningen 40 000 × 0,80 = 32 000 ·
 * × 0,12 = 3 840 · 50 000 × 0,012 = 600 · 42,00 → 44,52 = +6,0 procent ·
 * 44,52 × 0,96 = 42,74 · 3 840 ÷ 60 = 64 handelsdagar · 10 000 × 0,004 =
 * 40) — och kursernas sista budskap bärs med i texten: mekanikens kostnader
 * är inga avgifter och inga bedrägerier utan konstruktioner att läsa ur
 * definitionstalen, och flödesblicken kompletterar aldrig den fundamentala
 * analysen.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-etfmekanik.mjs kan köra filen direkt i Node.
 * Alla källkurser (am-08-etfens-inre-mekanik, am-07-indexomlaggningen,
 * am-01-likviditet-och-spread, od-07-terminskontraktet,
 * am-02-index-och-passivt-agande) finns i KURSREGISTER (verifierat mot
 * levande register; kursKalla faller tillbaka på "Läroplanen" om ett
 * framtida register läcker en slug).
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

// ── Det 1 etfmekanik-monstret ───────────────────────────────────────────────

export const ETFMEKANIK_MONSTER: FragMonster[] = [
  {
    id: "etfmekanik",
    karnord: [
      // indexomläggningen (am-07)
      "indexomläggning", "indexomläggningen", "indexomläggnings",
      "omläggning", "omläggningen", "omläggningar",
      "effektdag", "effektdagen",
      "tillkännagivande", "tillkännagivandet",
      // den börshandlade fondens mekanik (am-08)
      "börshandlad fond", "börshandlade fonder",
      "auktoriserad deltagare", "ap-deltagare",
      "skapelse", "skapelsen", "skapelser",
      "inlösen", "inlösningen", "inlösningar",
      "contango", "backwardation",
      "hävstångsetf", "hävstångsetfs",
      "spårningsavvikelse", "spårningsavvikelsen",
      "flashdagen",
      "inre mekanik",
      "2x",
    ],
    starkord: [
      "aktie", "aktier", "andel", "andelar", "andelen", "andelarna",
      "index", "indexet", "indexfond", "indexfonder",
      "etf", "etfs", "fond", "fonden", "fonder",
      "korg", "korgen", "korgar",
      "nav", "premie", "premien", "diskont", "diskontet", "rabatt",
      "kurs", "kursen", "pris", "priset", "värde", "värdet",
      "börsen", "börs", "handla", "handlas", "handel", "orderbok", "orderboken",
      "spread", "likviditet", "likviditeten", "omsättning", "flöde", "flödet", "flöden",
      "köpa", "köp", "sälja", "sälj", "skapelseavgift", "inlösenavgift",
      "termin", "terminer", "terminen", "rulla", "rullen", "spot", "råvara", "råvaror",
      "hävstång", "hävstången", "daglig", "omstalning", "volatilitet",
      "vikt", "vikter", "kvartal", "börsvärde", "fritt flöde",
      "market maker", "arbitrage", "arbitragör", "girighet", "maskin", "ventil", "ventiler",
      "förvaltare", "fondförvaltare", "regelverk", "kommitté",
    ],
    bygga: (reg) => {
      const amAntal = reg.filter((r) => r.kategori === "AKTIEMARKNADEN I PRAKTIKEN").length;
      const kallor = [
        kursKalla(reg, "am-08-etfens-inre-mekanik", "Läroplanen — AKTIEMARKNADEN I PRAKTIKEN: korgen, skapelsen och arbitraget som håller priset"),
        kursKalla(reg, "am-07-indexomlaggningen", "Läroplanen — AKTIEMARKNADEN I PRAKTIKEN: flödet som flyttar kursen utan en enda nyhet"),
        kursKalla(reg, "am-01-likviditet-och-spread", "Läroplanen — AKTIEMARKNADEN I PRAKTIKEN: arbitragörens kostnad och konkurrensfält"),
        kursKalla(reg, "od-07-terminskontraktet", "Läroplanen — OPTIONS & DERIVAT: rullans instrument bakom contangon"),
        kursKalla(reg, "am-02-index-och-passivt-agande", "Läroplanen — AKTIEMARKNADEN I PRAKTIKEN: regelverket och vikterna som korgen förvaltas mot"),
      ];
      const k = kallor[0];
      const am8 = reg.find((r) => r.slug === "am-08-etfens-inre-mekanik");
      return {
        text:
          `En börshandlad fond är två konstruktioner i ett: en korg av underliggande tillgångar, och en andel som handlas i orderboken som en aktie — och emellan en maskin som håller andelens pris vid korgens värde. Allt nedan är utbildning i hur maskinen är byggd och räknas — inga råd om placering:\n\n1️⃣ NAV — KORGENS RÄKNNING — kursens exempel: tolv aktier med sammanlagt värde 10 000 000 kronor, förvaltade mot ett index (am-02:s regelverk), och 1 000 000 andelar utestående. Räkningen som förenar dem är NAV, nettotillgångsvärdet per andel: 10 000 000 ÷ 1 000 000 = 10,00 kronor. Detta tal — inte kursen — är andelens värde, och det räknas om varje gång korgen rör sig: stiger korgvärdet till 10 200 000 är NAV 10,20, oavsett vad orderboken tror. Dubbelnaturen är hela ämnet: den slutna fonden handlas med fondbolaget till NAV en gång om dagen, investmentbolagets andel handlas i orderboken med premier som kan bestå i år — den börshandlade fonden förenar aktiens handelbarhet med fondens värdeförankring, och skillnaden mellan kurs och NAV, premien eller diskontet, är maskinens temperaturmätare.\n2️⃣ SKAPELSEN OCH INLÖSENEN — ANDELARNA SOM ANDAS — en auktoriserad deltagare (AP — en institution med avtal med fonden, ofta en market maker eller storbank) vill skapa 500 000 andelar: hon köper korgens tolv aktier i exakt indexvikter till 5 000 000 kronor, lämnar in korgen hos fonden och får 5 000 000 ÷ 10,00 = 500 000 nyutfärdade andelar. Inlösen är spegelväxlingen: andelar lämnas in, korgen lämnas ut. NAV förändras inte av skapelsen — båda sidor av bråket växer lika — men utbudet av andelar andas med efterfrågan: vill världen äga mer skapas andelar (och underliggande aktier köps), vill världen äga mindre löses andelar in och underlaget säljs. Efterfrågan driver utbudet, inte kursen — det är ventilens hela poäng.\n3️⃣ ARBITRAGET — GIRIGHETEN SOM HÅLLER PRISET VID NAV — kursens exempeltal: NAV 10,00 men andelen het, kurs 10,04 — en premie på 0,4 procent. AP:n köper korgen (5 000 000), skapar 500 000 andelar, säljer dem till 10,04: inkomst 500 000 × 10,04 = 5 020 000; bruttovinst 5 020 000 − 5 000 000 = 20 000; kostnader (avgifter, kapitalbindning, risk) 2 000; netto 18 000 kronor — förtjänat på öre som fanns i glappet. Och nu mekanikens kärna: försäljningen trycker KURSEN nedåt och korgköpet trycker NAV uppåt — båda rörelserna minskar glappet, nästa AP finner premiern 0,3, sedan 0,2, tills den är mindre än kostnadströskeln. Vinsten är självförstörande; priset står inte VID NAV men inom en marginal bestämd av kostnaderna. Spegelfallet diskont: kurs 9,96 — AP:n köper 500 000 andelar billigt (4 980 000), löser in dem mot korgen (värd 5 000 000), säljer korgen: samma 20 000 brutto, samma mekanik uppåt.\n4️⃣ PREMIENS RISK — NÄR MASKINEN STRETAR — tre situationer stänger ventilerna. Den illikvida korgen: en andel på tjugo småbolag med breda spreadar kan bara skapas dyrt, och premiern blir bred och bestående. Den stängda marknaden: vid tidsskillnader handlas andelen medan korgens aktier sover — glappet är inte arbitragebart förrän båda sidor öppnar. Stressen: historiens signaturdag är den 6 maj 2010 (flashdagen), då enskilda andelar föll 20-30-50 procent mot korgar som knappt rört sig — orderbokens bud försvann, och utan bud finns inget pris att arbitrera mot. Premiern är därför inte ett fejl i konstruktionen utan en mätare på underlagets hållbarhet.\n5️⃣ HÄVSTÅNGENS OCH RULLENS TULLAR — en 2x-andel lovar dubbelt av indexets DAGLIGA rörelse, inte dubbelt av indexet över tid: index +5 procent sedan −4,76 procent ger 1,05 × 0,9524 = 1,00 — plant; men andelen ger 1,10 × 0,9048 = 0,995, minus 0,5 procent av ingenting annat än volatilitet, och fem sådana sågpar på tio dagar ger 0,995 upphöjt till fem ≈ 0,976 — minus 2,4 procent medan underlaget står stilla; och faller indexet också är återhämtningens aritmetik hårdare: underlaget 0,80 × 1,25 = 1,00 är återställt medan andelen 0,60 × 1,25 = 0,75 fortfarande ligger 25 procent under. Rullen: en råvaruandel utan fysisk vara håller exponering via terminer som måste rullas — i contango (nästa termin dyrare, 50,00 mot 50,50) kostar varje rulle skillnaden oavsett vad spot gör: spot plant i ett år med tolv rullor à 0,99 ger 0,99 tolv gånger = 0,886 — minus 11,4 procent på ett år utan att råvaran rört sig; i backwardation är rullen i stället en inkomst. De båda tullarna är inte avgifter och inte bedrägerier — konstruktionen gör exakt vad den definierats göra — och de syns i spårningsavvikelsen, avståndet mellan andel och underlag över tid.\n6️⃣ INDEXOMLÄGGNINGEN — FLÖDET SOM FLYTTAR KURSEN UTAN EN ENDA NYHET — när ett bolag tillkommer ett index måste indexföljarna köpa, oavsett vad de anser: exempelbolaget 40 000 miljoner i börsvärde, 80 procent fritt handelbart = 32 000 miljoner, och indexvikt 12 procent av det fria flödet ger orderbilagan 32 000 × 0,12 = 3 840 miljoner som ska köpas (kontroll baklänges: 3 840 ÷ 32 000 = 12 procent); spegelvändt säljer en indexfond på 50 000 miljoner med vikten 1,2 procent för 50 000 × 0,012 = 600 miljoner när bolaget lämnar. Kursens båge: 42,00 vid tillkännagivandet, 44,52 vid effektdagen (+6,0 procent), därefter −4 procent på en månad till 44,52 × 0,96 = 42,74 — netto +1,8 procent. Tidsaxeln räknas i likviditet: 3 840 ÷ 60 (daglig omsättning) = 64 handelsdagar — flödet kan inte vänta till effektdagen ens om det ville. Två fällor att lära sig: flödet är inte värde (kursen steg inte för att bolaget blev bättre) och inte en garanti (det som är känt av alla har redan börjat prissättas); den tysta systern är viktdriften — en fond på 10 000 miljoner vars bolag vandrat från 1,8 till 2,2 procent i vikt köper 10 000 × 0,004 = 40 miljoner vid ombalanseringen, mekaniskt.\n\nI kategorin aktiemarknaden i praktiken finns ${amAntal} kurser — ETF:ens inre mekanik (${am8 ? am8.minuter + " min, " + am8.niva.toLowerCase() + " nivå" : "i registret"}) är dess åttonde steg: spridens värld (am-01) och indexens regler (am-02) föregår, auktionerna (am-05) och kortläget (am-06) omger, och indexomläggningen (am-07) är flödessidan av samma maskin. Som alltid: detta är utbildning i hur maskinen fungerar — inga placeringstips — och den som förstår spreaden, ventilerna och omläggningen förstår den börshandlade andelen fullständigt, ty den är ingenting annat än marknadens mekanik, monterad i en produkt.` +
          kallradFler(kallor),
        amne: "etfmekanik",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: ETF:ens inre mekanik", lank: "/kurser/am-08-etfens-inre-mekanik", ikon: "🧺", beskrivning: "Korgen, skapelsen och arbitraget som håller priset" },
          { text: "Kursen: Indexomläggningen", lank: "/kurser/am-07-indexomlaggningen", ikon: "🔄", beskrivning: "Flödet som flyttar kursen utan en enda nyhet" },
          { text: "Kursen: Terminskontraktet", lank: "/kurser/od-07-terminskontraktet", ikon: "📜", beskrivning: "Rullans instrument bakom contangon" },
          { text: "Vad är indexfonder?", lank: "fragor:" + encodeURIComponent("vad är indexfonder?"), ikon: "🧭", beskrivning: "Praktikens fråga — regelverket och vikterna" },
          { text: "Vad är spreaden?", lank: "fragor:" + encodeURIComponent("vad är spreaden?"), ikon: "📏", beskrivning: "Marknadsmekanikens fråga — kostnaden i glappet" },
          { text: "Vad är en termin?", lank: "fragor:" + encodeURIComponent("vad är en termin?"), ikon: "📆", beskrivning: "Optionslager-frågan — priset idag, leveransen sedan" },
        ],
        motfraga: { text: "Vad är indexfonder?", kategori: "indexfonder" },
        fordjupa: { text: k.titel, lank: "/kurser/am-08-etfens-inre-mekanik" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med etfmekanik-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger i
 * widgetens kedja efter nyaterritorier (59:e motorn, FÖRE fönstrets
 * syskonlager kontrahent) och kan därför aldrig stjäla en fråga från
 * tidigare lager; deras frågor lämnas ifred
 * (kärnorden mekaniskt disjunkta — testfall J/G2 vaktar). Samma
 * matchningssemantik som basmotorn: minst ett kärnord krävs, poäng =
 * kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret vinner
 * (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltEtfmekanik(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of ETFMEKANIK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
