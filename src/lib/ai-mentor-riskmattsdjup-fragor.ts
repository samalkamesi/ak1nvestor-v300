/**
 * AI-MENTORN 2.0 — RISKMÅTTSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 12, s6-u1).
 *
 * EN ytterligare källmärkt förhandsfråga ovanpå de arton tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + extra, makro, nästa, kapitalmekanik,
 * sektor, case, praktik, portfoljgrund, agande, redovisningsdjup, djup,
 * historia, lonsamhetsdjup, tsdjup, skattedjup, beteendedjup och riskdjup):
 *   1. Sharpe-kvoten (km-016-sharpe-kvot primär + km-013-volatilitet-
 *      standardavvikelse + km-015-beta-capm + km-034-drawdownanalys) —
 *      riskjusterad avkastning: vad kvoten mäter, familjen runt den och
 *      hur talet läses
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (754 kärnord LIVE-lästa ur samtliga
 * arton lager med den riktiga matcharen; verktyg/_s6u1-sond-omg12.mjs):
 * "vad är sharpe-kvoten?", "vad är sharpe kvot?", "vad är sharpekvot?",
 * "vad är sharpe?", "vad är sharpe ratio?", "hur räknar man sharpe-kvoten?",
 * "vad är riskjusterad avkastning?", "vad är riskjusterat?", "vad är beta?",
 * "vad är capm?" och "vad är standardavvikelsen?" är HELT fria (NULL genom
 * hela kedjan) och kärnorden sharpe/riskjusterad/standardavvikelse har INGA
 * grannar alls. ÄMNESLUCKA: kategorin RISKHANTERING & PORTFÖLJTEORI (nio
 * kurser km-013..km-034) saknade eget lager — basens risk-monster äger
 * risk-GRUNDORDEN och riskdjup-syskonet skuldstruktur/svansrisk, men
 * portföljteorins RISKMÅTT (sharpe/beta/capm/standardavvikelse) var ett
 * hål: rismåttens kanoniska frågor gick tidigare rakt ut i API-flödet.
 * Första avsågna kandidater som DOG i sonden: moat/vallgrav (extra-lagret
 * äger dem), katalysatorer (basen), value at risk, kelly-kriteriet,
 * drawdown, volatilitet, position sizing (basens risk-monster — av
 * riskdjup-modulen dokumenterade ägarskap), organisk/förvärvad tillväxt
 * (basens tillväxt-monster), känslighetsanalys av balansräkningen (basens
 * rapport-monster). Varje svar bär FYRA källor med numrerad Källor-rad +
 * FYRA kurslänkar + en levande fragor:-knapp — noll API-kostnad.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt, testfallen H/I
 * bevisar båda vägarna):
 *   • Basens risk-monster äger RISK-GRUNDORDEN — volatilitet, drawdown,
 *     kelly-kriteriet, value at risk och position sizing ("vad är
 *     volatilitet?" förblir basens; bevisat i sonden): detta lagrets
 *     kärnord är RISKMÅTTEN basens uppslag saknar (sharpe-familjen, beta,
 *     capm, standardavvikelse, riskjusterad avkastning). Källor och
 *     kurslänkar FÅR peka på basens kärnordskurser (km-034-drawdownanalys
 *     är här endast KÄLLA, aldrig kärnord) — källägande ≠ kärnordsägande
 *     (emission/V19-precedensen från kapitalmekanik-lagret).
 *   • Riskdjup-lagret (före detta i kedjan) äger skuldstruktur- och
 *     svansrisk-familjerna — svaret berör ingen av dem.
 *   • Praktik-lagret äger index-familjen och portfoljgrund diversifiering/
 *     korrelation — korrelation nämns ENDAST som grannbegrepp i text,
 *     aldrig som kärnord (km-014 är därför inte källa här).
 *
 * DOKUMENTERAD RISK (accepterad, samma bokföring som riskdjup-lagrets
 * "svarta"-notis och tsdjup-lagrets "gann"-kur):
 *   1. "beta" (4 tecken, tål 1 fel) ligger på redigeringstavstånd 2 från
 *      basens kärnord "betala" — ömsesidigt säkert (toleransen är 1 på
 *      båda längder; sondens närhetsrapport: d=2) men dokumenteras här för
 *      att nästa omgång inte "optimerar" bort marginalen.
 *   2. "capm" (4 tecken, tål 1 fel) ligger på avstånd 2 från nästa-lagrets
 *      "call" och case-lagrets "case" — samma ömsesidiga säkerhet (d=2).
 *   3. "var" som kärnord för VaR är MEDVETET struket — tre bokstäver ger
 *      exakt matchning på det vanliga svenska frågeordet "var" ("var
 *      hittar jag …?") och skulle stjäla platsfrågor; VaR ägs sedan tidigare
 *      av basens risk-monster ("value at risk"-frasen, sond-bevisat).
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och var
 * död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det. Detta
 * lager kopplas in SIST — och testfall L läser widgetens kedjerad
 * MEKANISKT ur filen (nittonde lager i ordning + import) så att "lager
 * utan inkoppling" aldrig kan återkomma tyst.
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
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla andra lämnar null
 * på. Omvänt vaktar testfall I på att den kanoniska frågan INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur riskmått BERÄKNAS och LÄSAS
 * som metod — inga köp-/säljsignaler, inga placeringstips, inga omdömen
 * om enskilda fonder, portföljer eller värdepapper. Portföljerna A och B
 * i texten är aritmetiska illustrationer av mekaniken, aldrig utfästelser
 * om avkastning eller rekommendationer.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-riskmattsdjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (km-016-sharpe-kvot, km-013-volatilitet-
 * standardavvikelse, km-015-beta-capm, km-034-drawdownanalys) finns i
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

// ── Den 1 riskmåttsdjupfrågan ───────────────────────────────────────────────

export const RISKMATTSDJUP_MONSTER: FragMonster[] = [
  {
    id: "sharpekvot",
    karnord: [
      "sharpe-kvot", "sharpe kvot", "sharpekvot", "sharpe", "sharpe ratio",
      "riskjusterad avkastning", "riskjusterad", "riskjusterat",
      "beta", "capm", "standardavvikelse", "standardavvikelsen",
    ],
    starkord: [
      "avkastning", "risk", "mått", "portfölj", "fond", "kvot",
      "jämföra", "riskfri", "avvikelse", "spridning", "index",
    ],
    bygga: (reg) => {
      const kategoriAntal = reg.filter((r) => r.kategori === "RISKHANTERING & PORTFÖLJTEORI").length;
      const kallor = [
        kursKalla(reg, "km-016-sharpe-kvot", "Läroplanen — riskmåttet sharpe-kvoten, beräkning och tolkning"),
        kursKalla(reg, "km-013-volatilitet-standardavvikelse", "Läroplanen — nämnarens mått: spridningen kring medelvärdet"),
        kursKalla(reg, "km-015-beta-capm", "Läroplanen — betan och CAPM: marknadsrelaterad risk"),
        kursKalla(reg, "km-034-drawdownanalys", "Läroplanen — grannmåttet drawdown (kärnordet ägs av basens risk-monster)"),
      ];
      const k = kallor[0];
      const km16 = reg.find((r) => r.slug === "km-016-sharpe-kvot");
      return {
        text:
          `Sharpe-kvoten är riskjusterad avkastning som ett enda tal: hur mycket avkastning du får PER ENHET risk. Formeln (portföljavkastningen − den riskfria räntan) ÷ standardavvikelsen. Täljaren är överskottsavkastningen — det som riskandet faktiskt betalar — och nämnaren straffar alla svängningar. Måttet togs fram av William F. Sharpe (Nobelpris 1990) just för att råavkastning ensam är ett vilseledande mått: 8 % avkastning kan vara bra eller dåligt beroende på hur mycket kursen pendlade på vägen (allt nedan är utbildning i hur måttet beräknas och läses — inga placeringstips):\n\n1️⃣ Aritmetisk illustration med två hypotetiska portföljer — A: avkastning 8 %, riskfri ränta 2 %, standardavvikelse 12 % ⇒ (8 − 2) ÷ 12 = 0,5. B: avkastning 6 %, standardavvikelse 5 % ⇒ (6 − 2) ÷ 5 = 0,8. B har LÄGRE råavkastning men HÖGRE kvot — varje enhet risk (varje procentandel standardavvikelse) betalades bättre. Det är hela poängen med måttet: det gör avkastningar jämförbara som annars inte vore det, och flyttar frågan från "hur mycket?" till "hur mycket per hur mycket risk?".\n2️⃣ FAMILJEN RUNT KVOTEN — nämnaren standardavvikelsen är spridningsmåttet kring medelavkastningen (volatilitetskursens grundmått) och mäter TOTAL variabilitet, både upp- och nedåt. Grannen BETA mäter bara den marknadsrelaterade delen: hur känsligt en portfölj rör sig med ett brett index (beta 1 = som marknaden, under 1 = dämpat) — och CAPM är modellen som binder ihop betan med förväntad avkastning via riskpremien. Skillnaden är filosofisk: standardavvikelsen/Sharpe straffar all rörelse, betan bryr sig bara om den del av risken som inte kan diversifieras bort (korrelationskursen är släkt här). Ett tredje grannmått, drawdown, mäter inte spridning utan det djupaste fallet från en topp — samma resa, tre olika linjaler.\n3️⃣ SÅ LÄS TALET — sharpe-kvoten är ett JÄMFÖRELSEMÅTT mellan portföljer eller fonder i samma kategori, aldrig ett absolut facit: det finns ingen magisk nivå där en kvot "blir bra", och ett högt tal kan byggas på en kort lucky period. Två känsligheter att känna till: talet beror på mätperioden (historiskt fönster — samma portfölj kan få olika kvot över olika perioder), och nämnaren bestraffar även UPPÅTSVÄNGningar som de flesta sparare knappast lider av — därför läses Sharpe alltid tillsammans med grannmåtten, aldrig ensam.\n\nI kategorin riskhantering & portföljteori finns ${kategoriAntal} kurser — sharpe-kursen (${km16 ? km16.minuter + " min" : "i registret"}) går igenom beräkningen, tolkningen och jämförelserna steg för steg. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "sharpekvot",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Sharpe-kvoten", lank: "/kurser/km-016-sharpe-kvot", ikon: "📊", beskrivning: "Beräkning, tolkning och jämförelser" },
          { text: "Kursen: Volatilitet & standardavvikelse", lank: "/kurser/km-013-volatilitet-standardavvikelse", ikon: "📉", beskrivning: "Nämnarens mått — spridningen kring medelvärdet" },
          { text: "Kursen: Beta & CAPM", lank: "/kurser/km-015-beta-capm", ikon: "🧭", beskrivning: "Marknadsrelaterad risk och riskpremien" },
          { text: "Kursen: Drawdown-analys", lank: "/kurser/km-034-drawdownanalys", ikon: "🕳️", beskrivning: "Grannmåttet — det djupaste fallet från en topp" },
          { text: "Vad är volatilitet?", lank: "fragor:" + encodeURIComponent("vad är volatilitet?"), ikon: "🌡️", beskrivning: "Spridningsmåttets grundord — basens risk-monster" },
        ],
        motfraga: { text: "Vad är volatilitet?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/km-016-sharpe-kvot" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de riskmåttsdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltRiskmattsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of RISKMATTSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
