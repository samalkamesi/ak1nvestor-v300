/**
 * AI-MENTORN 2.0 — UTDELNINGSKALENDER-FÖRHANDSFRÅGOR (spår 6, omgång 18, s6-u1).
 *
 * En källmärkt förhandsfråga ovanpå de trettiosex föregående lagren —
 * kedjans NÄR-fråga för utdelningens tidslinje: UTDELNINGSKALENDERN —
 * stämman, avstämningsdagen, ex-dagen och utbetalningsdagen + DRIP:s
 * räntesnurra + Dogs of the Dow (ud-07 primär + ud-05 + km-065 +
 * ud-03 + ud-06 — hela kategorin UTDELNINGSSTRATEGI som källor).
 *
 * Aktiverar FEM mentorväglösa kurser — KATEGORIN UTDELNINGSSTRATEGI
 * blir fullt länkad (3/8 → 8/8): ud-03-dividend-aristocrats ·
 * ud-05-drip · ud-06-svenska-utdelningsaktier · ud-07-utdelningskalender ·
 * km-065-dogs-of-the-dow (spårets mål "fler kurslänkar per svar",
 * utan API-kostnad).
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u1-sond-omg18.mjs + _s6u1-sond2-omg18.mjs,
 * otrackade diskbevis; anspråk data/vakten/auto-s6-1789724700618-u1-ansprak.md
 * FÖRE byggstart): kalenderfamiljen var NULL genom kedjan («vad är
 * utdelningskalender?» · «vad är ex-dagen?» · «vad är record date?» ·
 * «vad är avstämningsdag?» · «vad är avanmälningsdag?» · «vad är
 * utbetalningsdagen?» · «hur fungerar drip?» · «vad är dogs of the dow?» ·
 * «vad är vårutdelning?» · «vad är höstutdelning?» · «vad är
 * utdelningsturnus?» · «vad är stämmobonus?») och samtliga 21 planerade
 * kärnord RENTA mot 1 147 unika syskonkärnord (motorns tavstånd).
 * «betaldag» kasserades som kärnord (tavstånd 2 till basens «betala» —
 * hade stulit betala-frågorna) och ersattes med «utbetalningsdag».
 *
 * ANSVARSFÖRDELNING (syskinlagrens dokumentationsplikt; V19-precedensen —
 * källägande ≠ kärnordsägande):
 *   • Basens utdelnings-monster äger grundfamiljen utdelning/utdelningar/
 *     utdelningsaktie(r)/direktavkastning/dividend/payout ratio/
 *     återinvestering («vad är svenska utdelningsaktier?», «när betalas
 *     utdelningen ut?» och «vad är dividend aristocrats?» FÅNGAS av basen —
 *     sondbevisat); ud-kurserna får sina länkar här i stället.
 *   • Utdelningsdjupet äger fällor/återköp/utdelningsgrad — dess fråga
 *     «vad är utdelningsfällor?» bär detta lagers fragor:-knapp
 *     (tidigare-lager-kravet).
 *   • Skattedjupet äger beskattningsdetaljerna — DRIP-avsnittet nämner
 *     bara att återinvesterad utdelning beskattas som utdelning och
 *     länkar vidare i text.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx): detta lager ligger SIST (efter
 * portfoljpraktiken) och kan därför aldrig stjäla en fråga från ett
 * tidigare lager; det fångar bara frågor som alla lager före det lämnar
 * null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur utdelningskalenderns mekanismer
 * DEFINIERAS och RÄKNAS — inga köp-/säljsignaler, inga placeringstips,
 * inga omdömen om enskilda värdepapper. Räkneexemplen är tydligt märkta
 * generella exempel (200-kronorsaktien med 5 kronors utdelning; DRIP-snutten
 * 1 000 aktier × 5 kronor; Dogs-mekanikens likavikt) — de återger metoders
 * aritmetik, inte några faktiska bolags data, och ingenstans sägs eller
 * antyds att en strategi bör följas: Dogs presenteras med sin skeptiska
 * motläxa (utdelningsfällan) i samma andetag.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-utdelningskalender.mjs kan köra filen direkt
 * i Node. Alla källkurser (ud-07-utdelningskalender, ud-05-drip,
 * km-065-dogs-of-the-dow, ud-03-dividend-aristocrats,
 * ud-06-svenska-utdelningsaktier) finns i KURSREGISTER (verifierat mot
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

// ── Den 1 utdelningskalenderfrågan ──────────────────────────────────────────

export const UTDELNINGSKALENDER_MONSTER: FragMonster[] = [
  {
    id: "utdelningskalendern",
    karnord: [
      "utdelningskalender", "utdelningskalendern", "utdelningsturnus",
      "ex-dag", "exdagen", "ex-dagen", "exdatum", "utdelningsdatum",
      "record date", "record-dag",
      "avstämningsdag", "avanmälan", "avanmälningsdag",
      "utbetalningsdag", "utbetalningsdagen",
      "stämmobonus",
      "vårutdelning", "höstutdelning",
      "drip",
      "dogs of the dow", "dogs-strategin",
    ],
    starkord: [
      "utdelning", "utdelningar", "utdelnings", "dividend",
      "kalender", "kurs", "kursen", "dag", "dagen", "datum",
      "stämma", "stämman", "aktie", "aktier", "ägare", "ägarna",
      "betala", "utbetalning", "kvartal", "kvartalsvis", "återinvestera",
    ],
    bygga: (reg) => {
      const udAntal = reg.filter((r) => r.kategori === "UTDELNINGSSTRATEGI").length;
      const kallor = [
        kursKalla(reg, "ud-07-utdelningskalender", "Läroplanen — utdelningsstrategin: kalenderns fyra stationer och deras aritmetik"),
        kursKalla(reg, "ud-05-drip", "Läroplanen — utdelningsstrategin: återinvesteringens räntesnurra"),
        kursKalla(reg, "km-065-dogs-of-the-dow", "Läroplanen — utdelningsstrategin: kalenderstrategins klassiker och dess motläxa"),
        kursKalla(reg, "ud-03-dividend-aristocrats", "Läroplanen — utdelningsstrategin: kontinuitetens bevis (frågefamiljen ägs av basen)"),
        kursKalla(reg, "ud-06-svenska-utdelningsaktier", "Läroplanen — utdelningsstrategin: svensk turnus vår och höst (frågefamiljen ägs av basen)"),
      ];
      const k = kallor[0];
      const ud07 = reg.find((r) => r.slug === "ud-07-utdelningskalender");
      return {
        text:
          `Utdelningskalendern är utdelningens tidslinje — fyra stationer mellan beslut och pengar på kontot, och varje station har sin egen regel och sin egen aritmetik. Allt nedan är utbildning i mekanismerna — inga råd om vilka aktier någon bör äga:\n\n1️⃣ KALENDERNS FYRA STATIONER — STÄMMAN beslutar utdelningen (svenska bolag: årsstämma, klassiskt mars–april; amerikanska bolag deklarerar i stället kvartalsvis, fyra gånger per år). AVSTÄMNINGSDAGEN (på engelska record date) är dagens registerbeslut: rätten till utdelningen tillhör den som står registrerad i aktieboken (i Sverige Euroclear Swedens register) just den dagen — därför följer också avanmälan kalendern: andelar som flyttats måste vara avbockade senast avstämningsdagen för att rätten ska nå rätt ägare. EX-DAGEN är första dagen då köparen INTE längre får utdelningen — affären sluts utan rätten, och kursen justeras därför ned teoretiskt med utdelningens belopp: det generella räkneexemplet är en aktie med slutkurs 200,00 kronor och beslutad utdelning 5,00 kronor — på ex-dagen ligger referenskursen vid 195,00 kronor (200,00 − 5,00; samma sak som 200,00 × (1 − 2,5 %), ty 5,00 ÷ 200,00 = 2,5 procent direktavkastning — procenten är basens begrepp, kalenderns bidrag är VILKEN dag pengarna byter ägare). I Sverige sammanfaller ex-dagen sedan 2012 i regel med avstämningsdagen (Euroclear Swedens regelverk); amerikanska marknader har flyttat ex-dagen närmare record date allteftersom avräkningstiden kortats — läs alltid bolagets egna kuonginformation för gällande datum. UTBETALNINGSDAGEN slutligen är när kronorna (eller residerna) faktiskt betalas ut — i Sverige vanligen några veckor efter stämman; en stämmobonus är samma mekanik i praktiken: utdelningen presenteras och beslutas på stämman och betalas enligt kalendern. Svensk turnus har klassiskt varit VÅRUTDELNING (stämmor på våren) med ett mindre antal HÖSTUTDELNING-bolag, medan den amerikanska kvartalsrytmen ger fyra utbetalningar per år — kalendern är alltså inte en kuriosa utan en läsnyckel: den talar om när en kassaflödesprognos får sina datum.\n2️⃣ DRIP — RÄNTESNURRAN SOM BYGGERS BLECK — DRIP (dividend reinvestment investment plan; uttalas med p, som i droppa) är automatisk återinvestering av utdelningen i nya aktier, antingen via bolagets eget program eller via nätmäklarens inställning. Kursens räknesnutt, ett generellt exempel: 1 000 aktier à 200,00 kronor med 5,00 kronor i utdelning ger 5 000 kronor; återinvesteras beloppet à ex-dagskursen 195,00 kronor blir det 5 000 ÷ 195,00 = 25,64 NYA aktier — aktieantalet växer till 1 025,64 stycken, alltså +2,56 procent fler andelar på ett år, UTAN att en enda krona satts in och utan att utdelningen höjts. Nästa års utdelning räknas sedan på det större antalet: 1 025,64 × 5,00 = 5 128,20 kronor — ränta på ränta i ren aritmetik, ty tillväxten per år blir (1 025,64 ÷ 1 000) − 1 = 2,56 procent så länge utdelning per aktie och kurs står stilla. Två ärligheter hör till mekaniken: återinvesterad utdelning beskattas som utdelning också i Sverige (DRIP är ingen skattely — detaljerna ägs av skattekursen), och automatiken köper även då kursen känns hög — disciplinen är både styrka (aldrig tveksam cashflowsanvändning) och bindning (icke-val ompriseras).\n3️⃣ DOGS OF THE DOW — KALENDERSTRATEGIN SOM KLASSIKER (med motläxa) — regeln är mekanisk: av de trettio bolagen i Dow Jones-indexet rangordnas de med högst direktavkastning, de tio översta likaviktas (10 procent av paketet i varje bolag) och hela paketet rebalanseras en gång per år — en kalenderstrategi i bokstavlig mening, ty dess enda aktiva datum är årsskiftet. Hypotesen bakom: blå chip med tillfälligt fallen kurs får hög direktavkastning, och när kursen återhämtar sig blir det utdelning + värdeåtergång på köpet. Motläxan är lika mekanisk och hör hemma i samma andetag: en hög direktavkastning kan vara en UTDELNINGSFÄLLA — kursen har rasat fortare än marknaden tror att utdelningen är värd, och nästa årsskifte kan visa en höjd direktavkastning som aldrig betalades ut (fäll-kursen ägs av utdelningsdjupet — fragor-knappen nedan). Jämförelsen bredvid: dividend aristocrats — bolag med minst 25 år av oavbrutet höjda utdelningar — flyttar bevisbördan från kalendern (när betalas?) till historien (har betalningen höjts i varje cykel?); och svenska utdelningsaktier läser kalendern i svensk turnus med vår som huvudsak och höst som komplement. Sammanvägt: kalendern talar om När, kvalitetsfrågorna talar om Ifall — båda behövs, ingen av dem är ett råd.\n\nI kategorin utdelningsstrategi finns ${udAntal} kurser — utdelningskalendern (${ud07 ? ud07.minuter + " min, " + ud07.niva.toLowerCase() + " nivå" : "i registret"}) är spårets datumlära: stämma → avstämningsdag → ex-dag → utbetalning, och strategierna (DRIP, dogs, aristocrats) bor alla på samma kalender. Som alltid: detta är utbildning i hur mekanismerna fungerar — inga placeringstips.` +
          kallradFler(kallor),
        amne: "utdelningskalendern",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Utdelnings-kalender", lank: "/kurser/ud-07-utdelningskalender", ikon: "🗓️", beskrivning: "Stämma, avstämning, ex-dag, utbetalning" },
          { text: "Kursen: DRIP — automatisk återinvestering", lank: "/kurser/ud-05-drip", ikon: "💧", beskrivning: "Räntesnurrans aritmetik" },
          { text: "Kursen: Dogs of the Dow", lank: "/kurser/km-065-dogs-of-the-dow", ikon: "🐕", beskrivning: "Kalenderstrategin och dess motläxa" },
          { text: "Kursen: Svenska utdelningsaktier", lank: "/kurser/ud-06-svenska-utdelningsaktier", ikon: "🇸🇪", beskrivning: "Turnus vår och höst" },
          { text: "Vad är utdelningsfällor?", lank: "fragor:" + encodeURIComponent("vad är utdelningsfällor?"), ikon: "⚠️", beskrivning: "Hög direktavkastning kan vara en fälla — utdelningsdjupets lager" },
        ],
        motfraga: { text: "Vad är utdelningsgrad?", kategori: "utdelning" },
        fordjupa: { text: k.titel, lank: "/kurser/ud-07-utdelningskalender" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med utdelningskalender-mönstret — eller null (då har hela
 * kedjan före redan lämnat null och API-flödet tar över som förr). Ligger
 * SIST i widgetens kedja och kan därför aldrig stjäla en fråga från
 * tidigare lager. Samma matchningssemantik som basmotorn: minst ett
 * kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltUtdelningskalender(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of UTDELNINGSKALENDER_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
