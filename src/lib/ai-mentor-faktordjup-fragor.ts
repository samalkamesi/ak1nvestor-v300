/**
 * AI-MENTORN 2.0 — FAKTORDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 22, s6-u1).
 *
 * En källmärkt förhandsfråga ovanpå de fyrtiosju föregående lagren —
 * kedjans fråga för avkastningens bucklor: faktorpremierna, de återkommande
 * höjdskillnader under marknadens våg som klassisk finans sammanfattade i
 * en enda linje (pf-15 primär + rp-02 + ma-06 + km-015-beta-capm).
 *
 * Aktiverar TVÅ mentorväglösa kurser — pf-15-faktorpremierna (PORTFÖLJ-
 * HANTERING:s teorikröningskurs, spår 5:s färska tillägg 2026-09-18,
 * mentorväglös sedan födelsen) och rp-02-tre-matt-tre-fragor (RISKHANTERING
 * & PORTFÖLJTEORI:s Sharpe-mått) — spårets mål "fler kurslänkar per svar",
 * utan API-kostnad.
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u1-sond-omg22.mjs, otrackat diskbevis;
 * anspråk data/vakten/auto-s6-1789791914561-u1-ansprak.md FÖRE byggstart —
 * fönstrets ansvariga rad): hela faktor-familjen var NULL genom kedjans
 * 47 motorer / 128 monsters («vad är faktorpremier?» · «vad är
 * faktorpremierna?» · «vad är en faktor?» · «vad är momentum?» · «vad är
 * värdefaktorn?» · «vad är lågvolatilitetsanomalin?» · «hur fungerar
 * faktorinvestering?») och samtliga kärnord RENTA mot 1 350 unika
 * syskonkärnord. Moat-, reverse-DCF-, VaR-, Kelly- och riskparitet-
 * familjerna var REDAN tagna (extra-, nästa-, bas-, portfoljbalens-
 * lagren — sondbevisat) och lämnades ifred.
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; V19-precedensen —
 * källägande ≠ kärnordsägande):
 *   • Riskmåttsdjupet äger beta/CAPM/smart beta-familjen («vad är betat?» ·
 *     «vad är smart beta?» FÅNGAS av dem — sondbevisat); km-015 bärs här
 *     ENDAST som källa + fragor:-knapp, och naket «beta» är INTE kärnord
 *     här — betat är deras territorium, bucklorna är mitt.
 *   • Riskpremielagret äger premie-orden i risk-sammanhang; «premie» naket
 *     är inte kärnord här (optionspremie = optionsdjupets territorium).
 *   • «faktorer» (plural) STRYKS som kärnord — grannen «sektorer» ligger
 *     på tavstånd 2, inom toleransen för åttabokstavsord (G01-mönstret
 *     från omgång 20:s beteendemekanik); grundformen «faktor» är trygg
 *     (tavstånd 2 mot «sektor» överskrider dess tolerans 1).
 *   • Ekosystemdjupet äger backtest/SAM-orden — ek-04:s hantverk citeras
 *     i kursen men bärs inte som kärnord här.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx): detta lager ligger efter tillväxtdjup
 * och FÖRE bokmastar — syskonens SIST-positioner (bokmastar wiread,
 * konvertibel på väg) respekteras; jag gör INTE anspråk på SIST. Ett
 * senare lager kan därför aldrig stjäla en fråga från detta; omvänt vakar
 * testfall I på att dessa frågor INTE fångas av kedjan utan detta lager
 * (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur bucklorna DEFINIERAS, MÄTS och
 * PRÖVAS — inga köp-/säljsignaler, inga placeringstips, inga omdömen om
 * enskilda värdepapper. Aritmetiken återger kursens egna exempeltal
 * (CAPM-linjen 2,0 + 1,2 × 4,0 = 6,8 · Sharpe-paret 0,27/0,42 ·
 * laddningarna 1,00/0,05/0,10/0,02 mot 0,70/0,45/0,30/0,15 · blandningen
 * 0,5 × 6,0 + 0,5 × 9,0 = 7,5 · momentum-nettot 6,0 − 2,5 = 3,5 ·
 * varningshistorien 0,982¹³ ≈ 0,79) — och kursens sista budskap bärs med
 * i texten: kursen lär läsa bucklorna, inte att handla på dem; aldrig en
 * rekommendation att bära någon faktor alls.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-faktordjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (pf-15-faktorpremierna, rp-02-tre-matt-tre-fragor,
 * ma-06-aktiernas-riskpremie, km-015-beta-capm) finns i KURSREGISTER
 * (verifierat mot levande register; kursKalla faller tillbaka på
 * "Läroplanen" om ett framtida register läcker en slug).
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

// ── Den 1 faktorpremiefrågan ────────────────────────────────────────────────

export const FAKTORDJUP_MONSTER: FragMonster[] = [
  {
    id: "faktorpremier",
    karnord: [
      "faktorpremier", "faktorpremie", "faktorpremierna",
      "faktor",
      "momentum", "momentumfaktorn",
      "värdefaktorn", "värdefaktorer",
      "storleksfaktorn", "storleksfaktorer",
      "storlekspremie", "värdepremie",
      "lågvolatilitet", "lågvolatilitetsanomalin",
      "femfaktormodellen",
      "faktorzoo",
      "faktorinvestering", "faktorinvesteringar",
      // «det tysta betat» STRYKS som kärnord (kedjetest-fånga 2026-09-19):
      // riskmåttsdjupets «beta» (4 tecken, tolerans 1) fångar böjningen
      // «betat» i frågan — deras territorium; kursens signaturfras bärs
      // i SVARSTEXTEN och källraden i stället, aldrig som kärnord.
    ],
    starkord: [
      "portfölj", "portföljen", "portföljer", "avkastning", "avkastningen",
      "premie", "premier", "motpremie", "risk", "index", "aktier",
      "börsen", "börs", "regression", "regressionen", "laddning", "laddningar",
      "bucklor", "bucklan", "buckeln", "värde", "storlek", "småbolag",
      "små", "beta", "capm", "sharpe", "volatilitet", "historien",
      "fälla", "fällor", "tålamod", "skola", "skolor", "kostnad", "kostnader",
      "mått", "egenskaper", "sjuttio", "decennium", "decennier", "våg",
      "linjen", "lutning", "lutningar", "egenskap", "diversifiering",
      "värdepapper", "vinnare", "förlorare", "trender", "trenderna",
    ],
    bygga: (reg) => {
      const pfAntal = reg.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
      const kallor = [
        kursKalla(reg, "pf-15-faktorpremierna", "Läroplanen — PORTFÖLJHANTERING: bucklorna under marknadens våg, från CAPM-linjen till de fyra klassiska faktorerna"),
        kursKalla(reg, "rp-02-tre-matt-tre-fragor", "Läroplanen — RISKHANTERING & PORTFÖLJTEORI: Sharpe, Sortino och Calmar i samma portfölj — anomaliens mått"),
        kursKalla(reg, "ma-06-aktiernas-riskpremie", "Läroplanen — MAKROEKONOMI & RÄNTA: trappans första steg — premien bucklorna ligger ovanpå"),
        kursKalla(reg, "km-015-beta-capm", "Läroplanen — VÄRDERINGSMETODER: betat och CAPM — den enda linje som bucklorna avviker från"),
      ];
      const k = kallor[0];
      const pf15 = reg.find((r) => r.slug === "pf-15-faktorpremierna");
      const rp02 = reg.find((r) => r.slug === "rp-02-tre-matt-tre-fragor");
      return {
        text:
          `Faktorpremierna är avkastningens bucklor: grupper av aktier som decennium efter decennium ligger systematiskt över eller under den linje klassisk finans ritade — inte en gång, inte av slump, utan kvarstående även när risken räknats bort. Allt nedan är utbildning i hur bucklorna definieras, mäts och prövas — inga råd om placering:\n\n1️⃣ LINJEN OCH dess BUCKLOR — klassisk finans sammanfattade aktiernas hela premie i en enda linje: väntad överavkastning = riskfri ränta + beta × marknadens premie. Med riskfri ränta 2,0 procent, marknadspremie 4,0 procent och beta 1,2 blir den väntade avkastningen 2,0 + 1,2 × 4,0 = 6,8 procent. Linjen är vacker — och ofullständig. När forskarna mätte verkliga portföljer fann de bucklor: billiga mot dyra, små mot stora, stigande mot fallande, lugna mot svängiga — varje gruppering bar sin egen lilla premie eller motpremie, med sjuttio års minne. En faktor är just detta: en portföljkonstruktion — lång den ena sidan, kort den andra — som mäter avståndet mellan två grupper, och vars historiska avkastning över tid varit tillräckligt stadig för att kallas premie. Bucklorna är inte mystik; de är statistik.\n2️⃣ DE KLASSISKA FAKTORERNA — fyra frågor, omformade till portföljer. Värdefaktorn frågar vad marknaden betalar för bokfört värde, vinst eller kassaflöde: portföljen äger den billigaste tredjedelen och är kort den dyraste. Storleksfaktorn frågar vad storleken kostar i avkastning: liten mot stor, sedan Banz 1981. Momentumfaktorn frågar vad trenderna förtjänar: de senaste tolv månadernas vinnare mot förlorare — Carharts tillägg 1997, den mest omdebatterade, för dess mekanism saknar den osynliga logik som substans och storlek har. Lågvolatilitet är anomalin som vägrar försvinna: de lugnaste bolagen har historiskt avkastat bättre än deras beta berättigar — synligt i kursens övningstal: en högbeta-portfölj med avkastning 8,0 procent och volatilitet 22 procent ger Sharpe-kvoten (8,0 − 2,0) ÷ 22 = 0,27, medan en lågbeta-portfölj med 7,5 procent avkastning på 13 procent volatilitet ger (7,5 − 2,0) ÷ 13 = 0,42 — mindre risk justerat, högre belöning. Femfaktormodellens tillägg 2015 frågar istället vad bolaget gör med kapitalet: hög marginal och återhållsam expansion som premiebärare.\n3️⃣ MÄTNINGEN — regressionens språk. En faktorregression förklarar portföljens månatliga avkastning med faktorernas, och lutningen mot varje faktor kallas laddning: 1,0 mot marknaden betyder att portföljen andas med index; 0,45 mot värdefaktorn betyder att hälften av värdebucklan flyter igenom. Kursens övningsexempel: portfölj A — stora, månade tillväxtbolag — bär marknadsladdning 1,00, värde 0,05, storlek 0,10, momentum 0,02: i praktiken ren marknad. Portfölj B — mindre, billigare, lönsammare bolag — bär marknad 0,70, värde 0,45, storlek 0,30, momentum 0,15: marknaden och två bucklor vid sidan av. Skillnaden syns i väntad sammansättning: med övningspremierna marknad 6,0 procent och värdefaktorn 9,0 procent ger en portfölj som är halva marknad och halva ren värdeprofil: 0,5 × 6,0 + 0,5 × 9,0 = 7,5 procent väntat — inte därför att värdefaktorn vore ett råd utan därför att detta är hur laddningarnas aritmetik fungerar. Samma språk blottlägger motpremier: momentum är den dyraste faktorn att bära i drift — bruttopremie 6,0 procent med omsättningskostnad 2,5 procent ger netto 6,0 − 2,5 = 3,5 procent.\n4️⃣ TRE SKOLOR OM VARFÖR — riskkompensation: bucklorna är priset för verklig olägenhet (trötta värdebolag, koncentrerad småbolagsrisk — den som vill ha premien måste vilja ha obehaget). Beteende: bucklorna är samlade misstag — överreaktion som lämnar värdepapper billigt, underreaktion som driver momentum — premien en väntande korrigering, inte en lön. Struktur: vissa bucklor lever för att nyckelaktörer inte kan arbeta dem — institutionellas storleksbegränsningar lämnar småbolag obemannade, benchmark-krav gör en motpremievinkel kostsam. Skolorna utesluter inte varandra, men har olika konsekvenser: riskkompensationen skulle kunna bestå, beteendepremien kan krympa när den blir känd, strukturen består så länge ägarlandskapet gör det.\n5️⃣ FYRA FÄLLOR — historien som lag: en faktor som avkastar −1,8 procent om året i tretton år ger kumulativt 0,982 upphöjt till tretton ≈ 0,79 — drygt tjugo procents utfall, medan marknaden bar sina vanliga år; en sjuttioårig buckla kan ligga under vatten i ett decennium plus tre, ty en premie är ett medeltal, inte ett schema. Datagrävning: med tusentals prövade variabler producerar slumpen mönster som ser ut som premier — faktorzoo-problemet; motgiften heter förhandsregistrering och prövningar utanför ursprungsperioden. Kostnadernas tystnad: en premie mätt brutto i akademiska portföljer är inte en premie i en depå — omsättning, smal likviditet och skatt vrider netto mot brutto, som övningens 6,0 − 2,5 = 3,5. Berättelsens förklädnad: ett bolag kan passa faktorprofilen av tillfällighet — billigt av skäl som resultatkvaliteten avslöjar som dålig — faktormåttet säger inget om skälet.\n\nI kategorin portföljhantering finns ${pfAntal} kurser — faktorpremierna (${pf15 ? pf15.kapitel + " kapitel · " + pf15.minuter + " min · " + pf15.niva.toLowerCase() + " nivå" : "i registret"}) är spårets teorikröningskurs, och Sharpe-måttet den delar med riskhanteringen (${rp02 ? rp02.minuter + " min" : "i registret"}, rp-02) är samma kvot som anomaliens övningstal. Fem frågor bär kursens slutform: vad bär portföljen på? vilken förklaringsskola passar? vad kostar lutningen i drift? hur länge orkar du ha fel? vad skulle förklara att du har rätt? Som alltid: detta är utbildning i hur bucklorna fungerar — aldrig en rekommendation att bära någon faktor alls, ty det beslutet tillhör varje läsare med sina egna mått på tid, kostnad och tålamod.` +
          kallradFler(kallor),
        amne: "faktorpremier",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Faktorpremierna", lank: "/kurser/pf-15-faktorpremierna", ikon: "📐", beskrivning: "Bucklorna, regressionen och de fyra fällorna" },
          { text: "Kursen: Tre mått, tre frågor", lank: "/kurser/rp-02-tre-matt-tre-fragor", ikon: "📊", beskrivning: "Sharpe, Sortino och Calmar — anomaliens mått" },
          { text: "Kursen: Aktiernas riskpremie", lank: "/kurser/ma-06-aktiernas-riskpremie", ikon: "⚖️", beskrivning: "Trappans första steg — bucklornas grund" },
          { text: "Kursen: Beta & CAPM", lank: "/kurser/km-015-beta-capm", ikon: "📏", beskrivning: "Linjen som bucklorna avviker från" },
          { text: "Vad är beta?", lank: "fragor:" + encodeURIComponent("vad är beta?"), ikon: "🔍", beskrivning: "Riskmåttsdjup-lagrets fråga — linjens lutning" },
          { text: "Vad är aktiernas riskpremie?", lank: "fragor:" + encodeURIComponent("vad är aktiernas riskpremie?"), ikon: "🌊", beskrivning: "Riskpremie-lagrets fråga — vågen under bucklorna" },
        ],
        motfraga: { text: "Vad är beta?", kategori: "beta" },
        fordjupa: { text: k.titel, lank: "/kurser/pf-15-faktorpremierna" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med faktordjup-mönstret — eller null (då har hela kedjan
 * före redan lämnat null och API-flödet tar över som förr). Ligger efter
 * tillväxtdjup och FÖRE bokmastar i widgetens kedja och kan därför aldrig
 * stjäla en fråga från senare lager; tidigare lagers frågor lämnas ifred
 * (kärnorden mekaniskt disjunkta — testfall J/G2 vaktar). Samma
 * matchningssemantik som basmotorn: minst ett kärnord krävs, poäng =
 * kärnord × 3 + stärkord, oavgjort → först deklarerade mönstret vinner
 * (strikt >, deterministiskt). Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltFaktordjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of FAKTORDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
