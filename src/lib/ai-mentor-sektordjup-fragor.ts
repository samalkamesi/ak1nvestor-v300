/**
 * AI-MENTORN 2.0 — SEKTORDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 18, s6-u3).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de trettiosju committade
 * lagren: SEKTORANALYS: s tre sektorspecifika frågor —
 *   1. SaaS-bolag ("hur analyserar jag SaaS-bolag?") — prenumerations-
 *      modellens mått: MRR/ARR, churn, net revenue retention, Rule of 40
 *      (se-01 primär + se-13 + km-038 + vm-08 + pc-07 som källor)
 *   2. Halvledarbolag ("hur analyserar jag halvledarbolag?") — cykeln,
 *      värdekedjan foundry/fabless/IDM och kapacitetsvakans läsmetoden
 *      (se-02 primär + km-045 + km-041 + se-16 som källor)
 *   3. Försvarsbolag ("hur analyserar jag försvarsbolag?") — orderstockens
 *      beläggningsaritmetik, anslagscykler och värderingens dubbelhet
 *      (se-03 primär + se-16 + km-041 som källor)
 *
 * REGISTERBÄRNING: SEKTORANALYS var omgångens största mentorväglösa block —
 * 21 av 27 kurser oådda i startsweepen (199 av 420 totalt). Detta lager
 * aktiverar se-01/se-02/se-03 som primära och länkar se-13, se-16, km-038,
 * km-041, km-045, vm-08 och pc-07 som källor — varje källa en äkta slug i
 * KURSREGISTER (kedjetestets E-fall vakar).
 *
 * ÄMNESVAL EFTER SOND I TVÅ RONDER (verktyg/_s6u3-sond-omg18.mjs, otrackad;
 * 38 motorer LIVE-wirade + syskonens disk-moduler, 1 202 kärnord i svepet):
 *   • Rond 1 DÖDADE indikatordjup-idén (candlestick/RSI/MACD/moving
 *     averages/Bollinger): basens "teknisk analys"-monster äger alla dessa
 *     som kärnord — 10 kedjefångster (ämne=teknisk analys). Sondens första
 *     körning missade basmotorn (regex bugg — svaraLokalt utan suffix) och
 *     ropade GRÖN på 35 motorer; 36-motorläget avslöjade ägandet. Lärdom:
 *     sonden MÅSTE verifiera motorantalet mot kedjetestet, inte bara köra.
 *   • Rond 2 justerade sektordjup: "-sektorn"-fraserna (sektormotorns
 *     kärnord "sektorn" fångar varje "vad är X-sektorn?"), "arr" (basens
 *     V02-registeruppslag — AKM1:s variabel V02 heter just ARR; basen äger
 *     frågan "vad är arr?", här ägs endast månadsformen MRR och NRR) och
 *     "orderstock"/"backlog" (tidsaxelns konjunkturindikator-lager, omgång
 *     16 — deras dokumenterade ägande; detta lager nämner orderstocken i
 *     TEXT och länkar deras fråga som knapp, kärnordet är deras).
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt; modultestets G/I-
 * fall bevisar båda vägarna):
 *   • Sektormotorn äger SEKTOR-GRUNDORDEN (sektor, bransch, konjunktur-
 *     känslig, cyklisk) och sina två branschmonsters banker + fastigheter.
 *     Detta lager bär endast de tre sektorspecifika bolagsfamiljerna —
 *     ALDRIG "sektorn"-sammansättningarna (V19-precedensen: källägande ≠
 *     kärnordsägande; se-01 får vara källa fast ordet "saassektorn" är
 *     sektormotorns).
 *   • Basen äger "arr" (V02-uppslaget), teknikens grundfamilj och
 *     värderingsmultipel-orden; SaaS-svaret äger måttfamiljen MRR/churn/
 *     NRR och använder "arr" endast som STÄRKORD (poängsättande först när
 *     eget kärnord redan träffat — kan aldrig stjäla "vad är arr?").
 *   • Tidsaxeln äger orderstock/backlog; försvarssvaret bär beläggnings-
 *     aritmetiken och länkar deras fråga som handlingsknapp.
 *   • Varderjustering äger normalisering; halvledarsvaret visar P/E-fällan
 *     vid cykeltopp och länkar deras fråga som knapp.
 *   • Syskon i samma fönster: u1 utdelningskalender (lager 37:E) och u2
 *     kreditdjup — deras kärnord togs med i grannsvepet via diskutläsning;
 *     0 krockar, 0 stölder åt båda håll.
 *
 * DOKUMENTERAD RISK (accepterad, ncav↔nav-precedensen): "chip" är ett kort
 * vardagsord (exakt matchning, ≤4 tecken) — sweepen visar 0 grannar i
 * kedjans 1 202 kärnord och svenska finansfrågor med det fristående ordet
 * "chip" utan sektorsammanhang är sällsynta; passerar annars till API-
 * flödet som förut.
 *
 * Aritmetiken i alla tre svar (påhittade tal, maskinellt omräknade i
 * regressionstestets D-fall):
 *   • SaaS: 100 kunder × 1 000 kr = 100 000 kr MRR ⇒ ARR = ×12 =
 *     1 200 000 kr; churn 1 %/mån ⇒ kundlivslängd 1/0,01 = 100 mån;
 *     NRR 100 + 8 + 4 − 2 = 110 %; Rule of 40: 30 + 12 = 42;
 *     CAC 12 000 ÷ 1 000 = 12 mån payback.
 *   • Halvledare: foundry investeringar 40 % av intäkterna mot fabless
 *     5 %; bruttomarginal 35 % mot 60 % (åtta respektive tolv gånger
 *     skillnaden i kapital, 40 ÷ 5).
 *   • Försvar: orderstock 45 mdr ÷ årsintäkter 15 mdr = 3,0 års
 *     beläggning; NATO-målet 2 % av BNP nämns som pedagogiskt faktum.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * syskonens utdelningskalender och kreditdjup) och kan därför aldrig stjäla
 * en fråga från ett tidigare lager; det fångar bara frågor som alla lager
 * före det lämnar null på. Omvänt vaktar testfall I på att dessa frågor
 * INTE fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur tre sektorers NYCKELTAL och
 * AFFÄRSMODELLER DEFINIERAS och RÄKNAS som metod — inga köp-/säljsignaler,
 * inga placeringstips, inga omdömen om enskilda börsbolag (exemplen talar
 * om "ett SaaS-bolag", "en foundry", "ett försvarsbolag" med påhittade
 * tal). Försvarstexten berör krig och geopolitik ENDAST som efterfråge-
 * och riskfaktorer i utbildningstermer — inga politiska ställningstaganden.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-sektordjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (se-01-saassektorn, se-13-utbildning, km-038-techsektorn,
 * vm-08-evsales, pc-07-case-sinch, se-02-halvledarsektorn, km-045-
 * materialsektorn, km-041-industrisektorn, se-16-sektoranalysens-metod,
 * se-03-forsvarssektorn) finns i KURSREGISTER (verifierat i 420-registret;
 * kursKalla faller tillbaka på "Läroplanen" om ett framtida register läcker
 * en slug).
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

// ── De 3 sektordjupfrågorna ─────────────────────────────────────────────────

export const SEKTORDJUP_MONSTER: FragMonster[] = [
  {
    id: "saas",
    karnord: [
      "saas", "saasbolag", "saas-bolag", "saasbolagen",
      "mrr", "churn", "churn-rate", "net revenue retention", "nrr",
      "prenumerationsintäkter", "prenumerationsmodell", "abonnemangsintäkter",
    ],
    starkord: [
      "arr", "prenumeration", "abonnemang", "kunder", "månadsintäkt",
      "årsintäkt", "retention", "moln", "mjukvara",
    ],
    bygga: (reg) => {
      const seAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const vmAntal = reg.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
      const kallor = [
        kursKalla(reg, "se-01-saassektorn", "Läroplanen — sektorn analys: SaaS-måttens ABC och fällor"),
        kursKalla(reg, "se-13-utbildning", "Läroplanen — återkommande intäkter utanför tech: samma logik, långsammare klocka"),
        kursKalla(reg, "km-038-techsektorn", "Läroplanen — tech-sektorn: sammanhanget runt prenumerationsmjukvaran"),
        kursKalla(reg, "vm-08-evsales", "Läroplanen — omsättningsmultiplen: hur unga bolag värderas innan vinsten finns"),
        kursKalla(reg, "pc-07-case-sinch", "Läroplanen — ett praktiskt case i tech-nischen med måtten i spel"),
      ];
      const k = kallor[0];
      const se01 = reg.find((r) => r.slug === "se-01-saassektorn");
      return {
        text:
          `SaaS — Software as a Service, mjukvara som prenumeration — är affärsmodellen där intäkterna kommer tillbaka varje månad i stället för vid varje försäljning, och hela analysen börjar i modellens egna mått (allt nedan är utbildning i hur måtten DEFINIERAS och RÄKNAS — inga omdömen om enskilda bolag, talen är påhittade):\n\n1️⃣ MÅTTEN — MÅNADSINTÄKTEN OCH DE TRE RÖRELSENA. MRR (månadsintäkt, Monthly Recurring Revenue) är antal betalande kunder gånger genomsnittlig avgift: 100 kunder × 1 000 kronor = 100 000 kronor i månaden, som årsbelopp (ARR — i AKM1 är det namnet på variabel V02, och den frågan äger basens variabelregister) = 1 200 000 kronor. Sedan följer intäkternas tre rörelser: CHURN (bortfallet — churnar 1 procent av kunderna per månad är den väntade kundlivslängden 1 ÷ 0,01 = 100 månader, omkring åtta år), NRR/NET REVENUE RETENTION (intäkten per startkundskohort ett år senare: avgiftshöjningar +8 procent, utökade abonnemang +4, churn −2 ger 100 + 8 + 4 − 2 = 110 procent — intäkterna växer ALLTSÅ UTAN en enda ny kund, och under 100 procent läcker badkaret), och TILLVÄXTEN av själva kundstocken. En SaaS-analys utan de tre rörelserna är bara en omsättningssiffra.\n2️⃣ EKONOMIN — HÖG MARGINAL, DYR TILLVÄXT. Mjukvaran kopieras nästan gratis: bruttomarginalerna är bland näringslivets högsta och kapitalbehovet litet — men kunden är DYR att skaffa (försäljning och marknadsföring ligger framfront). Övningsräkningen: kostar en kund 12 000 kronor att värva och betalar 1 000 i månaden är payback 12 månader — och stannar kunden 100 månader blir livstidsvärdet ungefär åtta gånger anskaffningen. Därav sektorns övningsregel RULE OF 40: tillväxttakt i procent plus lönsamhetsmarginal i procent — 30 + 12 = 42 — säger om tillväxten är KÖPT eller TJÄNAD. Multiplar på omsättning (EV/Sales) används ofta eftersom vinsten är ung — men nämnarens kvalitet avgörs av rörelserna ovan: samma intäktskrona är värd olika i två bolag med churn 1 och 10 procent.\n3️⃣ FÄLLORNA — PRENUMERATIONENS BAKSIDA. Intäkterna är kontrakterade men inte eviga: konsolideringsrisk (kunden säger upp flera verktyg samtidigt), prishöjningsmattan (NRR som drivs av avgiftshöjningar tar slut när tröskeln nås), och beräkningens frihetsgrader — vilka intäkter RÄKNAS som återkommande är bolagets eget val, därför är definitionskvaliteten (se-01:s kärna) det första kontrollmomentet. Prenumerationslogiken är dessutom inte tech-exklusiv — utbildningssektorn lever samma ekonomi med längre kontrakt (se-13) — det gör måtten lättare att skilja från brus.\n\nI sektorn analys-kategorin finns ${seAntal} kurser och i värderingsmetoder ${vmAntal} — huvudkursen (${se01 ? se01.minuter + " min, " + se01.niva.toLowerCase() + " nivå" : "i registret"}) äger hela SaaS-måttfamiljen. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "saas",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: SaaS-sektorn", lank: "/kurser/se-01-saassektorn", ikon: "🔗", beskrivning: "Måttens ABC och fällor" },
          { text: "Kursen: Utbildning — återkommande intäkter", lank: "/kurser/se-13-utbildning", ikon: "🎓", beskrivning: "Samma logik utanför tech" },
          { text: "Kursen: EV/Sales", lank: "/kurser/vm-08-evsales", ikon: "⚖️", beskrivning: "Multiplen för unga intäkter" },
          { text: "Casemet: tech-nischen", lank: "/kurser/pc-07-case-sinch", ikon: "🗂️", beskrivning: "Måtten i ett praktiskt case" },
          { text: "Hur analyserar jag halvledarbolag?", lank: "fragor:" + encodeURIComponent("hur analyserar jag halvledarbolag?"), ikon: "🔬", beskrivning: "Nästa sektor i spåret" },
        ],
        motfraga: { text: "Hur analyserar jag halvledarbolag?", kategori: "sektor" },
        fordjupa: { text: k.titel, lank: "/kurser/se-01-saassektorn" },
      };
    },
  },
  {
    id: "halvledare",
    karnord: [
      "halvledare", "halvledarbolag", "halvledarbolagen", "halvledarbranschen",
      "chip", "chips", "fabless", "foundry", "foundries",
    ],
    starkord: [
      "kisel", "wafer", "wafers", "litografi", "cykel", "cykeln", "cyklisk",
      "kapitalintensiv", "tillverkning", "euv", "minnen", "processor",
    ],
    bygga: (reg) => {
      const seAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "se-02-halvledarsektorn", "Läroplanen — sektorn analys: cykeln, värdekedjan och läsmetoden"),
        kursKalla(reg, "km-045-materialsektorn", "Läroplanen — materialuppströms: kislets och råvarornas tidiga signal"),
        kursKalla(reg, "km-041-industrisektorn", "Läroplanen — den kapitalintensiva industrin halvledartillverkningen tillhör"),
        kursKalla(reg, "se-16-sektoranalysens-metod", "Läroplanen — tre frågor till vilken sektor som helst"),
      ];
      const k = kallor[0];
      const se02 = reg.find((r) => r.slug === "se-02-halvledarsektorn");
      return {
        text:
          `Halvledarsektorn — chippet i all elektronik — är börsens mest cykliska teknikgren, och analysen står och faller med två bilder: CYKELN och VÄRDEKEDJAN (allt nedan är utbildning i läsmetoden — inga omdömen om enskilda bolag, talen är påhittade):\n\n1️⃣ CYKELN — MULTIPELFÄLLAN MED TECKENBYTT FRAMKANT. Efterfrågan kommer i vågor (konsumelektronik, bilindustri, datacenter) men kapaciteten tar år att bygga — därför alternerar branschen mellan underskott med prisspjut och överskott med prisfall, klassiskt i flerårscykler. Värderingsfällan: vid CYKELTOPPEN är vinsten som högst och P/E som lägst — ett lågt P/E kan alltså vara som DYRAST just när nämnaren står på topp, och vid botten är P/E högt på svag vinst. Läsregeln (normaliseringskursens ämne — knappen nedan): multipel ALDRIG utan VAR I CYKELN, och kapacitetsutbyggnaden är klockan: när branschen bygger som mest står nästa överskott för dörren, för kapaciteten träder i kraft när efterfrågan hunnit vika.\n2️⃣ VÄRDEKEDJAN — TRE AFFÄRSMODELLER, TRE EKONOMIER. FOUNDRY tillverkar åt andra: extremt kapitaltungt — övningsräkning med påhittade tal, investeringar i storleksordningen 40 procent av intäkterna mot en bruttomarginal kring 35 procent. FABLESS designar och hyr tillverkning: investeringar kanske 5 procent av intäkterna och bruttomarginal kring 60 — samma sekundärprodukt, åtta gånger skillnad i kapitaltäthet (40 ÷ 5). IDM gör båda. Därtill utrustningsledet (till exempel litografi) med en handfull aktörer vars kunder är foundries — en cykel på cykeln, och därför ännu vassare svängar. Materialuppströms (kislet, km-045) slår tidigare än efterfrågesidan — sektorns egen ledande indikator.\n3️⃣ LÄSMETODEN — TRE FRÅGOR (se-16): vem är kunden (konsument-, bil- eller datasteknologi? olika kunder, olika cykler), vad driver efterfrågan (en produktcykel eller en strukturell våg?), och var i cykeln står vi (orderläge, kapacitetsbygge, lager hos kunderna). Svaret på de tre avgör om ett lågt P/E är en rabatt eller en fälla — talet ensamt kan aldrig.\n\nI sektorn analys-kategorin finns ${seAntal} kurser — huvudkursen (${se02 ? se02.minuter + " min, " + se02.niva.toLowerCase() + " nivå" : "i registret"}) går igenom hela kedjan steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "halvledare",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Halvledar-sektorn", lank: "/kurser/se-02-halvledarsektorn", ikon: "🔗", beskrivning: "Cykeln och värdekedjan" },
          { text: "Kursen: Material-sektorn", lank: "/kurser/km-045-materialsektorn", ikon: "⛏️", beskrivning: "Kislets tidiga signal" },
          { text: "Kursen: Sektoranalysens metod", lank: "/kurser/se-16-sektoranalysens-metod", ikon: "🧭", beskrivning: "Tre frågor till varje sektor" },
          { text: "Vad är normalisering?", lank: "fragor:" + encodeURIComponent("vad är normalisering?"), ikon: "📉", beskrivning: "Cykelvinstens värderingsläxa" },
          { text: "Hur analyserar jag försvarsbolag?", lank: "fragor:" + encodeURIComponent("hur analyserar jag försvarsbolag?"), ikon: "🛡️", beskrivning: "Nästa sektor i spåret" },
        ],
        motfraga: { text: "Hur analyserar jag försvarsbolag?", kategori: "sektor" },
        fordjupa: { text: k.titel, lank: "/kurser/se-02-halvledarsektorn" },
      };
    },
  },
  {
    id: "forsvar",
    karnord: [
      "försvarsbolag", "försvarsbolagen", "försvarsindustrin", "försvarsaktier",
      "vapenindustri", "krigsmateriel", "försvarsmateriel",
    ],
    starkord: [
      "orderstock", "backlog", "kontrakt", "geopolitik", "export", "licens",
      "säkerhetspolitik", "försvar", "anslag", "stat",
    ],
    bygga: (reg) => {
      const seAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "se-03-forsvarssektorn", "Läroplanen — sektorn analys: anslagscykler, orderstock och värderingens dubbelhet"),
        kursKalla(reg, "se-16-sektoranalysens-metod", "Läroplanen — tre frågor till vilken sektor som helst"),
        kursKalla(reg, "km-041-industrisektorn", "Läroplanen — den projekt- och kontraktsdrivna industrin försvarsindustrin tillhör"),
      ];
      const k = kallor[0];
      const se03 = reg.find((r) => r.slug === "se-03-forsvarssektorn");
      return {
        text:
          `Försvarssektorn har en ekonomi som ingen annan gren: kunden är i första hand stater, betalningen styrs av anslag och fleråriga program, och produkten levereras över årtionden. Det ger analysen tre mekaniska inslag (allt nedan är utbildning i hur sektorns mått LÄS — inga omdömen om enskilda bolag eller länder, inga politiska ställningstaganden, talen är påhittade):\n\n1️⃣ BELÄGGNINGENS ARITMETIK — ORDERSTOCKEN. Sektorns centrala kvot är orderstocken dividerad med årsintäkter: har ett bolag orderstock 45 miljarder och årsintäkter 15 miljarder är beläggningen 45 ÷ 15 = 3,0 år — tre års intäkter redan kontrakterade. Multiåriga program ger därmed en intäktssynlighet som få sektorer matchar, men med två förbehåll: leveranstiderna är långa (intäkterna flyttar i kalendern), och order som flyttas eller omförhandlas syns i beläggningen före resultaträkningen. Frågan "vad är orderstocken?" i allmän bemärkelse ägs av konjunkturindikatorernas lager (knappen nedan) — här är den sektorns passform.\n2️⃣ EFTERFRÅGAN — ANSLAGEN SOM MOTOR. Efterfrågan är ett politiskt beslut: försvarsanslag som andel av BNP (NATO:s välkända tvåprocentsmål är ett pedagogiskt riktmärke i utbildningslitteraturen) rör sig i flerårstrender, inte kvartal. Det gör intäkterna tröga i båda riktningar — upprustning tar år att omvandla till leveranser, och nedrustning träffar långsamt men långvarigt. Två strukturella spärrar följer med: EXPORTLICENSERNA (krigsmateriel är den mest reglerade handeln — en licensfråga kan vända en orderbok) och KUNDKONCENTRATIONEN (staten är ofta den dominerande kunden — riskläsningslagrets ämne, knappen nedan). Underleveranskedjan är bred men plattformarna få: konsolidering är sektorns struktur, inte tillfällighet.\n3️⃣ VÄRDERINGENS DUBBELHET — FRED OCH FARLIGHET I SAMMA MULTIPEL. Multiplen reagerar på förväntningar om anslagstrender och säkerhetsläge — det klassiska förväntningsgapet (knappen nedan): samma orderstock kan prissättas som fredsoptimist eller orolighet, och skillnaden sitter i multipln, inte i orderboken. Marginalerna är ofta stabila men inte höga (utvecklingsprogram med delad risk mellan beställare och leverantör), och de stora svängarna ligger i AVTALSVÅGORNA — tecknas en ny plattform följer årtionden av underhåll och uppgraderingar. Sektoranalysens tre frågor (se-16) landar här: vem är kunden (en stat, flera stater?), vad driver efterfrågan (anslagstrenden), och vad har priset redan räknat med.\n\nI sektorn analys-kategorin finns ${seAntal} kurser — huvudkursen (${se03 ? se03.minuter + " min, " + se03.niva.toLowerCase() + " nivå" : "i registret"}) äger sektorns hela analysram. Som alltid: detta är utbildning i en metod — inga placeringstips och ingen syn på något lands politik.` +
          kallradFler(kallor),
        amne: "forsvar",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Försvars-sektorn", lank: "/kurser/se-03-forsvarssektorn", ikon: "🔗", beskrivning: "Anslagscykler och orderstock" },
          { text: "Kursen: Sektoranalysens metod", lank: "/kurser/se-16-sektoranalysens-metod", ikon: "🧭", beskrivning: "Tre frågor till varje sektor" },
          { text: "Kursen: Industri-sektorn", lank: "/kurser/km-041-industrisektorn", ikon: "🏭", beskrivning: "Kontraktsindustrins granne" },
          { text: "Vad är orderstocken?", lank: "fragor:" + encodeURIComponent("vad är orderstock?"), ikon: "📦", beskrivning: "Konjunkturindikatorernas ämne" },
          { text: "Hur analyserar jag SaaS-bolag?", lank: "fragor:" + encodeURIComponent("hur analyserar jag SaaS-bolag?"), ikon: "☁️", beskrivning: "Första sektorn i spåret" },
        ],
        motfraga: { text: "Hur analyserar jag SaaS-bolag?", kategori: "sektor" },
        fordjupa: { text: k.titel, lank: "/kurser/se-03-forsvarssektorn" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre sektordjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltSektordjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of SEKTORDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
