/**
 * AI-MENTORN 2.0 — KONTRAHENT-FÖRHÅSFRÅGOR (omgång 25, manifest
 * auto-s6-1789864506792 — spår 6, byggare s6-u2, levererad 2026-09-20).
 *
 * Två källmärkta förhandsfrågor om KONTRAHENTRISKEN — vem som står på
 * andra sidan när det blåser, och clearinghuset som trär in emellan —
 * speglar rk-16 (Kontrahentrisken — vem står på andra sidan när det
 * blåser; RISKHANTERING, Avancerad, född 2026-09-19 i spår 5 och
 * mentorväglös sedan födelsen; sondbevis nedan).
 *
 *   1. Kontrahentrisk   (motparten + nettingen — rk-16; källor od-07, ma-05)
 *   2. Clearinghus      (CCP + panten, haircutsen och trappan — rk-16;
 *                        källor am-04, ks-05)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL mot SAMTLIGA 58 befintliga motorer /
 * 165 monsters / 1 688 kärnord (LIVE-lästa ur serverns filer 2026-09-20
 * 00:36–00:40 UTC, sonder verktyg/_s6u2-sond-omg25.mjs + -sond2-):
 *   · hela familjen NULL genom kedjan: kontrahent/kontrahentrisk/motpart/
 *     motparten/netting/clearinghus/clearingcentral/collateral/garantifond/
 *     säkerhetskrav/haircut — samtliga 0 grannar inom motorns tolerans
 *     ("kontrahent"→kortlaget d4 · "motpart"→moat d3 · "netting"→hedging
 *     d3 · "haircut"→nairu d3 — alla utanför).
 *   · OMVÄND STÖLD-PROTOTYP: 0 stölder mot kedjetestets 117 kanoniska
 *     frågor (verklig matchningssemantik).
 *
 * STRUKNA kärnord (dokumenterade gränser):
 *   · "ccp" — granne "ccc" (kapitalbindningens kassakonverteringscykeln)
 *     tavstånd 1 inom toleransen; CCP bärs i TEXT, aldrig som kärnord.
 *   · "lehman" — historia-lagret äger kraschfamiljen; Lehman-fallet bärs
 *     som historieförankring i text (15 september 2008 som MOTPART).
 *   · "initial margin"/"variation margin"/"margin" — basens ord (sond
 *     rond 1: [2 bas]); marginalerna beskrivs i text, orden ägs av basen.
 *   · "vem betalar när en bank går omkull?" — basens bank-formulering
 *     ([2 bas]); kursens undertitel "vem står på andra sidan" används
 *     i stället som kärnordsfras.
 *
 * KEDJEPLACERING: SIST i kedjan (58:e motorn, efter nya territorier) —
 * kontrahentorden är mekaniskt disjunkta mot samtliga tidigare lager,
 * ingen tie behövde brytas. Verifieras av kedjetestets fall G + detta
 * lagers testfall K (kärnorden läses LIVE ur samtliga
 * src/lib/ai-mentor-*-fragor.ts vid varje körning) och testfall G2
 * (antistöld mot tidigare lagers kanoniska frågor).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som samtliga
 * syskonlager). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   … ?? svaraLokaltNyaTerritorier(q, KURSREGISTER)
 *     ?? svaraLokaltKontrahent(q, KURSREGISTER)
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur kontrahentrisk och clearing
 * fungerar — inga rekommendationer om säkringsval, motpartsval eller
 * konstruktioner. Aritmetiken bär tydligt markerade exempelvärden.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-kontrahent.mjs kan köra filen direkt i Node.
 * Källkurserna (rk-16, od-07, ma-05, am-04, ks-05) finns i KURSREGISTER —
 * inga fantomlänkar (testfall D vaktar).
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

/** Kategoriräknare — registerdrivna tal i svaret (testfall D2 vaktar). */
function rkAntal(register: RegisterRad[]): number {
  return register.filter((r) => r.kategori === "RISKHANTERING").length;
}

// ── De 2 kontrahent-frågorna ────────────────────────────────────────────────

export const KONTRAHENT_MONSTER: FragMonster[] = [
  {
    id: "kontrahentrisk",
    karnord: [
      "kontrahent", "kontrahenter", "kontrahentrisk",
      "motpart", "motparten", "motparter", "motpartsrisk",
      "netting", "nettoavtal", "vem står på andra sidan",
    ],
    starkord: ["risk", "exponering", "avtal", "bolag", "bank", "säkring", "fungerar", "betyder"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "rk-16-kontrahentrisken", "Läroplanen — riskhantering, kontrahentrisken"),
        kursKalla(reg, "od-07-terminskontraktet", "Läroplanen — derivat, terminens motpartslöfte"),
        kursKalla(reg, "ma-05-kreditpremien", "Läroplanen — makroekonomi & ränta, kreditrisken som prislapp"),
      ];
      const k = kallor[0];
      return {
        text:
          `Kontrahentrisk — motpartsrisk — är risken att den andra sidan av ett avtal inte håller sitt löfte: att säljaren aldrig levererar, eller att köparen aldrig betalar. Varje transaktion som sträcker sig över tid bär den, och den syns inte i priset förrän den slår till. Tre delar:\n\n1. VAR RISKEN BOR — ett aktieköp på börsen avgörs i sekunder, men ett derivatavtal levereras om tre månader. Under tiden är motpartens utfäste en exponering: värdet av det den andra sidan är skyldig dig. Räkneexempel: säljs en termin med leverans om tre månader och köparens betalning är 8 miljoner är de 8 miljonerna inte en tillgång — de är ett löfte som ska infrias av en motpart som kan försvagas dessförinnan.\n2. NETTINGEN — flera avtal med samma motpart slås ihop till ETT netto: exponeringarna +8, −5 och +2 miljoner ger brutto 15 (8 + 5 + 2) men netto +5 (8 − 5 + 2). En motpart med nettoavtal bär alltså mindre risk än tre utan — nettingen förvandlar tre löften till ett och skär den aggraverade exponeringen till en tredjedel. Därför är nettavtal centrala i standarddokumentationen mellan professionella motparter.\n3. DEN BILATERALA VÄRLDEN — utan motpart emellan står du ensam: en återförsäkring på 800 miljoner utan pant, en kundfordran, en bank som förvarar papperet. När Lehman föll 15 september 2008 föll den inte bara som bolag — den föll som MOTPART, och positioner som varit "säkra" stannade låsta i en pågående affär.\n\nKontrahentrisk är ett läsarperspektiv: vilka löften bär balansräkningen, och vem står bakom dem? Riskhanteringskategorin (${rkAntal(reg)} kurser) äger djupet — vilka säkringsval någon BÖR göra är en rådgivningsfråga vi aldrig besvarar.` +
          kallradFler(kallor),
        amne: "kontrahentrisk",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kontrahentrisken", lank: "/kurser/rk-16-kontrahentrisken", ikon: "🛡️", beskrivning: "Vem står på andra sidan när det blåser" },
          { text: "Kursen: Terminskontraktet", lank: "/kurser/od-07-terminskontraktet", ikon: "📜", beskrivning: "Avtalet som skapar motparten" },
          { text: "Vad är ett clearinghus?", lank: "fragor:" + encodeURIComponent("vad är ett clearinghus?"), ikon: "🏛️", beskrivning: "Institutionen som trär in emellan" },
        ],
        motfraga: { text: "Vad är ett clearinghus?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-16-kontrahentrisken" },
      };
    },
  },
  {
    id: "clearinghus",
    karnord: [
      "clearinghus", "clearinghuset", "clearingcentral", "centrala motparten",
      "central motpart", "collateral", "säkerhetskrav", "säkerhetskraven",
      "garantifond", "garantifonden", "haircut", "haircuts", "default-trappa",
    ],
    starkord: ["clearing", "pant", "risk", "motpart", "säkerhet", "kapital", "fungerar"],
    bygga: (reg) => {
      const kallor = [
        kursKalla(reg, "rk-16-kontrahentrisken", "Läroplanen — riskhantering, clearinghusets trappa"),
        kursKalla(reg, "am-04-marknadsstruktur", "Läroplanen — aktiemarknaden i praktiken, hur handeln är uppbyggd"),
        kursKalla(reg, "ks-05-covenanter-och-kreditbetyg", "Läroplanen — kapitalstruktur, skuldens spelregler"),
      ];
      const k = kallor[0];
      return {
        text:
          `Ett clearinghus — en central motpart (CCP) — trär in mellan köpare och säljare och blir motpart för BÅDA: ditt löfte till en främling blir ett löfte till en institution som byggts för att hålla. Skyddet är inte ett trollspö — det är en trappa av andras pengar. Tre steg:\n\n1. TRAPPAN — räkneexempel: en motpart faller med 40 miljoner i exponeringsvärde. Första trappsteget är säkerheterna i pant: 28 miljoner. Andra steget garantifonden som alla medlemmar betalar in i: 8 miljoner. Tredje steget clearinghusets EGNA kapital: 4 miljoner — det svider institutionen själv. Summa 28 + 8 + 4 = 40: 70 procent bär panten, 20 procent garantifonden, 10 procent huset. Ordningen är hela poängen — andras kapital konsumeras FÖRE husets eget.\n2. MARGINALERNA OCH HAIRCUTS — panten är inte en fast summa utan rullas dagligen: ett säkerhetskrav på 50 000 kr växer när positionen rör sig emot — i exempelvärlden 20 000 kr MER en dålig dag. Och säkerheterna rabatteras (haircut): av 100 kr i pantsatt värde räknas kontanter som 100, statspapper som 98 och aktier som 80 — aktiepant som SKA täcka 50 000 kr kräver därför 62 500 kr i nominellt värde (50 000 ÷ 0,80), för att ett kursfall inte ska öppna glipa i panten.\n3. VAD CLEARINGEN GÖR — netting + daglig säkerhetsställning + trappa betyder att en enskilt misslyckad motpart sällan sprider sig vidare: exponeringen är pantsatt, nettad och finansierad. Priset är att kapital binds i pant och att ANSVARET flyttas — clearinghuset äger inte risken, den FÖRDELAR den; blir själva huset den svaga länken står hela kedjan där.\n\nSå läs clearingen som infrastruktur — skyddet är aritmetik och andras kapital, inte magi. Hur någon BÖR handla eller säkra är aldrig frågan här — det är utbildning i mekaniken.` +
          kallradFler(kallor),
        amne: "clearinghus",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Kontrahentrisken", lank: "/kurser/rk-16-kontrahentrisken", ikon: "🛡️", beskrivning: "Trappan och marginalerna i detalj" },
          { text: "Kursen: Marknadsstruktur", lank: "/kurser/am-04-marknadsstruktur", ikon: "🏗️", beskrivning: "Handelns byggnad — clearingen i sitt sammanhang" },
          { text: "Vad är kontrahentrisk?", lank: "fragor:" + encodeURIComponent("vad är kontrahentrisk?"), ikon: "🤝", beskrivning: "Risken huset skyddar mot" },
        ],
        motfraga: { text: "Vad är kontrahentrisk?", kategori: "riskhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-16-kontrahentrisken" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två kontrahent-mönstren — eller null
 * (då prövar widgeten nästa lager i kedjan). Samma matchningssemantik som
 * basmotorn: minst ett kärnord krävs, poäng = kärnord × 3 + stärkord,
 * oavgjort → först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltKontrahent(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of KONTRAHENT_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
