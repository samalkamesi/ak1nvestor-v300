/**
 * AI-MENTORN 2.0 — SEKTORFÖRHANDSFRÅGOR (spår 6, omgång 3, u1: nivån 33 → 36).
 *
 * Tre ytterligare källmärkta förhandsfrågor ovanpå de tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts, extra-, makro-, nästa- och
 * kapitalmekanik-lagren, samt u3 omgång 4:s katalysator/börs/PE-mönster):
 *   1. Sektorsanalys (cykliskt vs defensivt — km-047 Utility som
 *      nybörjaringång, med Livsmedel och Tech som motpoler)
 *   2. Bank-sektorn (räntenettot — km-040, med Finans/Försäkring och
 *      Balansräkningen som syskonkällor)
 *   3. Fastighets-sektorn (hyresintäkter och belåning — km-042, med
 *      Ränta och Investmentbolag/NAV som syskonkällor)
 *
 * ÄMNESVAL SEN MOT KOLLISIONSKONTROLL (auto-s6 omgång 3, parallella
 * syskon): SEKTORANALYS är registrets STÖRSTA helt otäckta kategori —
 * 26 kurser (km-038–km-048 + se-01–se-15) utan ett enda kärnord i
 * basens, extra-, makro- eller nästa-lager ("sektor", "bransch",
 * "bank", "fastighet" saknas bland de 411 existerande kärnorden —
 * verifierat mekaniskt av testfall J, som läser samtliga lager LIVE).
 * "riksbank/centralbank" ägs av makro-lagret och är disjunkta mot
 * bankens kärnord ("räntenetto" har redigeringstavstånd 6 till
 * "ränta" — ingen felstavningsträff). Anspråksnotis skriven till
 * syskonen FÖRE byggstart: data/vakten/s6-omg3-u1-ansprak.md.
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
 *     ?? svaraLokaltSektor(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en
 * fråga från tidigare lager (bevisad princip från nästa-lagret) — det
 * fångar bara frågor som alla andra lager lämnar null på. Omvänt
 * vaktar testfall I på att sektorfrågorna INTE fångas av kedjan utan
 * detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur sektorer och affärsmodeller
 * fungerar — inga köp-/säljsignaler, inga placeringstips, inga omdömen
 * om enskilda bolag eller värdepapper.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-sektor.mjs kan köra filen direkt i Node.
 * Alla källkurser (km-038/km-040/km-042/km-047, se-06, se-14,
 * bk-01-balansrakningen, km-054-ranta, km-067-investmentbolag) finns
 * i KURSREGISTER — inga väntande registerberoenden.
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

// ── De 3 sektorförhandsfrågorna ──────────────────────────────────────────────

export const SEKTOR_MONSTER: FragMonster[] = [
  {
    id: "sektorsanalys",
    karnord: [
      "sektor", "sektorn", "sektorer", "sektors", "sektorsanalys",
      "bransch", "branschen", "branscher", "branschanalys",
      "konjunkturkänslig", "konjunkturkänsliga", "cyklisk", "cykliska",
      "konjunkturcykel", "konjunkturcykler", "branschcykel", "gics",
    ],
    starkord: [
      "aktier", "aktie", "bolag", "bolagen", "analysera", "analyserar",
      "jämföra", "jämför", "skillnad", "skillnader", "olika", "börsen",
      "indelning", "indela",
    ],
    bygga: (reg) => {
      const sektorAntal = reg.filter((r) => r.kategori === "SEKTORANALYS").length;
      const kallor = [
        kursKalla(reg, "km-047-utilitysektorn", "Läroplanen — sektorsanalys, den defensiva nybörjaringången"),
        kursKalla(reg, "se-14-livsmedel", "Läroplanen — sektorsanalys, stapelvaror som stabilast exempel"),
        kursKalla(reg, "km-038-techsektorn", "Läroplanen — sektorsanalys, tillväxtsektorn som motpol"),
      ];
      const k = kallor[0];
      return {
        text:
          `En sektor är en grupp bolag som driver liknande affärer och blåses av samma samhällsekonomiska vindar — banker, fastigheter, teknologi, livsmedel. Varför spelar det roll för analysen? Därför att samma nyckeltal betyder olika saker i olika sektorer: ett lågt P/E kan vara billigt i en bransch och en varning i en annan. Tre begrepp gör ramverket begripligt:\n\n1. CYKLISKT ELLER DEFENSIVT — vissa sektorer (industri, lyx, bilar) svänger hårt med konjunkturen eftersom kunderna kan skjuta upp sina inköp; andra (el, vatten, livsmedel) säljer sådant hushållen betalar även i motvind. Detta är en av de första frågorna i VARJE sektorstudie.\n2. VINDARNA SKILJER SIG — räntan väger tyngst för fastigheter och banker, råvarupriser för material och energi, innovationstakt för tech. Att veta vilken kraft som styr sektorn är halva förståelsen av varför kurserna rör sig olika.\n3. JÄMFÖRELSEN SKER INOM SEKTORN — ett bolags nyckeltal ska primärt jämföras med sina direkta konkurrenter, inte med hela börsen. En banks balansräkning och ett techbolags tillväxttakt mäts med olika måttstock — sektorkunskapen är därför en del av AKM1:s åtta dimensioner.\n\nI kategorin sektorsanalys finns ${sektorAntal} kurser — från Utility (den enda nybörjarnivån, en perfekt första sektor) till tech, pharma, krypto och halvledare.` +
          kallradFler(kallor),
        amne: "sektorsanalys",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Utility-sektorn", lank: "/kurser/km-047-utilitysektorn", ikon: "🔌", beskrivning: "Nybörjarnivå — den defensiva första sektorn" },
          { text: "Kursen: Livsmedel — staplar och varumärke", lank: "/kurser/se-14-livsmedel", ikon: "🛒", beskrivning: "Nybörjarnivå — mest stabila intäkterna" },
          { text: "Kursen: Tech-sektorn", lank: "/kurser/km-038-techsektorn", ikon: "💻", beskrivning: "Intermediär — tillväxtsektorn som motpol" },
          { text: "Hur fungerar banker?", lank: "fragor:" + encodeURIComponent("hur fungerar banker?"), ikon: "🏦", beskrivning: "Sektorns mest annorlunda affärsmodell" },
          { text: "Hur fungerar fastighetsbolag?", lank: "fragor:" + encodeURIComponent("hur fungerar fastighetsbolag?"), ikon: "🏢", beskrivning: "Belåningens hävstång i praktiken" },
        ],
        motfraga: { text: "Varför säger P/E olika saker i olika sektorer?", kategori: "sektorsanalys" },
        fordjupa: { text: k.titel, lank: "/kurser/km-047-utilitysektorn" },
      };
    },
  },
  {
    id: "bank",
    karnord: [
      "bank", "banken", "banker", "banksektor", "banksektorn",
      "bankaktie", "bankaktier", "bankbolag", "bankbolagen",
      "storbank", "storbanker", "storbankerna", "räntenetto",
      "räntenettot", "kreditförlust", "kreditförluster",
      "kapitaltäckning", "utlåning", "utlåningsgrad",
    ],
    starkord: [
      "aktier", "bolag", "analysera", "analyserar", "fungerar",
      "annorlunda", "skillnad", "värdera", "värdering", "nyckeltal",
    ],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "km-040-banksektorn", "Läroplanen — sektorsanalys, balansräkningen är affären"),
        kursKalla(reg, "se-06-finanssektorn", "Läroplanen — sektorsanalys, försäkringarnas syskonmekanik"),
        kursKalla(reg, "bk-01-balansrakningen", "Läroplanen — bokföring, bankens viktigaste rapport"),
      ];
      const k = kallor[0];
      return {
        text:
          `En banks affär låter enkel: låna in pengar till lägre ränta och låna ut dem till högre — skillnaden heter räntenetto och är motorn. Men tre saker gör banker annorlunda än nästan alla andra bolag, och de förklarar varför sektorn kräver sitt eget analyssätt:\n\n1. BALANSRÄKNINGEN ÄR AFFÄREN — hos ett industribolag är balansräkningen ett verktyg; hos banken är den själva produkten. In- och utlåning, kapitaltäckning och kreditförluster är inte fotnoter utan kärnrörelsen. Därför börjar bankanalysen på en annan sida av rapporten.\n2. P/E SÄGER MINDRE, P/B OCH KAPITALTÄCKNING MER — eftersom en banks bokförda värden är finansiella poster (inte maskiner som avskrivs) blir förhållandet mellan börsvärde och bokfört eget kapital (P/B) meningsfullare än för de flesta andra bolag. Kapitaltäckningsreglerna sätter dessutom en takregel för hur mycket banken får växa — regleringen är en del av affärsmodellen.\n3. KREDITFÖRLUSTERNAS CYKEL — när konjunkturen vänder stiger andelen lån som inte betalas tillbaka, och förlusterna slår mot resultatet precis när räntenettot redan pressas. Det är mekaniken bakom banksektorns rykte som konjunkturkänslig — inte ett omdöme om någon enskild bank.\n\nVill du djupare: hela finanssidan av sektorskategorin binder samman banker, försäkring och balansräkningens grunder.` +
          kallradFler(kallor),
        amne: "bank",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Bank-sektorn", lank: "/kurser/km-040-banksektorn", ikon: "🏦", beskrivning: "Intermediär — balansräkningen är affären" },
          { text: "Kursen: Finans-sektorn — försäkring", lank: "/kurser/se-06-finanssektorn", ikon: "🛡️", beskrivning: "Syskonbranschens motsvarande mekanik" },
          { text: "Kursen: Balansräkningen — bolagets karta", lank: "/kurser/bk-01-balansrakningen", ikon: "🗺️", beskrivning: "Rapporten bankanalysen börjar på" },
          { text: "Vad är sektorsanalys?", lank: "fragor:" + encodeURIComponent("vad är sektorsanalys?"), ikon: "🧭", beskrivning: "Ramverket runt alla sektorer" },
        ],
        motfraga: { text: "Hur hänger kreditförluster ihop med konjunkturen?", kategori: "sektorsanalys" },
        fordjupa: { text: k.titel, lank: "/kurser/km-040-banksektorn" },
      };
    },
  },
  {
    id: "fastighet",
    karnord: [
      "fastighet", "fastigheten", "fastigheter", "fastighetsbolag",
      "fastighetsbolagen", "fastighetsaktie", "fastighetsaktier",
      "fastighetssektorn", "hyresintäkt", "hyresintäkterna",
      "hyresvärd", "hyresvärdar", "vakans", "vakanser", "vakansgrad",
      "stamaktionär", "stamaktieägare",
    ],
    starkord: [
      "aktier", "bolag", "analysera", "fungerar", "värde",
      "ränta", "räntor", "belåning", "direktavkastning",
    ],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "km-042-fastighetsektorn", "Läroplanen — sektorsanalys, hyresintäkter och belåning"),
        kursKalla(reg, "km-054-ranta", "Läroplanen — makroekonomi & ränta, sektorns kostnadssida"),
        kursKalla(reg, "km-067-investmentbolag", "Läroplanen — private equity & investmentbolag, NAV-räkningens släktskap"),
      ];
      const k = kallor[0];
      return {
        text:
          `Fastighetsbolag tjänar sina pengar på hyresintäkter — kontor, bostäder, lager och butikslokaler som hyrs ut på ofta fleråriga kontrakt. Affärsmodellen är enkel att förstå men har tre mekanismer som styr hela sektorns svängningar:\n\n1. HYRESINTÄKTER OCH VAKANS — intäkterna är långa och förutsägbara, men varje outhyrd yta (vakans) kostar utan att ge något tillbaka. Vakansgraden är därför en av sektorns egna nyckeltal: ett litet tal med stor kraft på marginalerna.\n2. BELÅNINGENS HÄVSTÅNG — fastigheter köps traditionellt med hög belåning, och räntekostnaden är då en av de största posterna i resultaträkningen. När räntan rör sig rör sig sektorns resultat — det är mekaniken bakom fastighetsbolagens rykte som räntekänsliga (samma mekanik som makro-avsnittet om ränta förklarar, här applicerad på en sektor).\n3. VÄRDET SITTER I FASTIGHETSKATALOGEN — sektorns egna värderingsmått bygger på substansräkning: bolagets fastigheter värderas och ställs mot bolagets börsvärde, på samma princip som investmentbolagens NAV-rabatt. Rabatt eller premium mot substansen blir sektorns motsvarighet till P/E-diskussionen.\n\nEn klassisk sektordetalj: många fastighetsbolag har stamaktieägare — långsiktiga huvudägare som röstar med tungt mandat. Ägarstrukturen är en del av bilden när man studerar hur bolaget styrs.` +
          kallradFler(kallor),
        amne: "fastighet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Fastighet-sektorn", lank: "/kurser/km-042-fastighetsektorn", ikon: "🏢", beskrivning: "Intermediär — hyresintäkter och belåning" },
          { text: "Kursen: Ränta — priset på pengar", lank: "/kurser/km-054-ranta", ikon: "💸", beskrivning: "Sektorns kostnadssida förklarad" },
          { text: "Kursen: Investmentbolag — NAV-rabatt", lank: "/kurser/km-067-investmentbolag", ikon: "🏛️", beskrivning: "Substansräkningens släktskap" },
          { text: "Vad är ränta?", lank: "fragor:" + encodeURIComponent("vad är ränta?"), ikon: "🏦", beskrivning: "Belåningens pris från grunden" },
        ],
        motfraga: { text: "Vad är ett investmentbolag?", kategori: "värdering" },
        fordjupa: { text: k.titel, lank: "/kurser/km-042-fastighetsektorn" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre sektormönstren — eller null (då har
 * hela kedjan före redan lämnat null och API-flödet tar över som förr).
 * Samma matchningssemantik som basmotorn: minst ett kärnord krävs,
 * poäng = kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret
 * vinner (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltSektor(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of SEKTOR_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
