/**
 * AI-MENTORN 2.0 — PORTFÖLJGRUNDSFÖRHANDSFRÅGOR (spår 6, omgång 7, s6-u2).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts, extra-, makro-, nästa-,
 * kapitalmekanik-, sektor- och case-lagren, samt praktik-lagret som
 * ett syskon skrev parallellt i detta fönster):
 *   1. Diversifiering & korrelation (pf-03 primär + km-014 + pf-11 som
 *      medveten motpol — koncentrerad portfölj)
 *   2. Valutarisk (rk-07 primär + km-058 + sj-01)
 *
 * ÄMNESVAL EFTER KOLLISIONSKONTROLL (kärnord LIVE-lästa ur samtliga
 * tidigare lager): "diversifiering/diversifiera/korrelation" och
 * "valuta/valutarisk/växelkurs/dollar" saknades helt — basens portfölj-
 * monster äger "portfölj/sprida/riskspridning/rebalansera" och risk-
 * monstret "volatilitet/drawdown", men SPRIDNINGENS mekanik (korrelationen
 * mellan innehaven) och VALUTASPIDRET hade inget enda förhandsmönster.
 * Registret bär 14 PORTFÖLJHANTERING-kurser, 9 RISKHANTERING & PORTFÖLJ-
 * TEORI-kurser och dedikerade valutakurser (rk-07, km-058) — rikt
 * källmaterial, noll API-kostnad.
 *
 * AVSTÅENDE (duplikatskydd, detta fönster): indexfond/passivt ägande
 * valdes bort NÄR praktik-lagret (syskon u3 omgång 6) visade sig bära
 * samma kärnordsfamilj ("index/indexfond/etf/passivt…") med nästan
 * identisk källbas — deras anspråksfil (s6-omg6-u3) och filskrivning
 * föregick min commit. Sambandet diversifiering↔index täcks här i stället
 * via en fragor:-knapp ("Vad är en indexfond?") som kedjan låter
 * praktik-lagret besvara. Mina egna kärnord är strängdisjunkta mot
 * praktik-lagrets (diversifiering/korrelation/valuta vs index/blankning/
 * marginal — verifierat LIVE av testfall J som läser ALLA lager).
 *
 * ANSVARSFÖRDELNING (bevisad av testens kedjefall H/I, samma princip som
 * kapitalmekanik-lagrets emission-notis):
 *   • Basens V20-titeluppslag ("Återköp av egna AKTIER") äger ordet
 *     "aktier" i titelmatchningen — frågor med det ordet besvaras av
 *     basen FÖRE detta lager. Mina kärnord utformades därför utan
 *     "aktier" och mina kanoniska frågor är verifierade null genom hela
 *     kedjan före detta lager.
 *   • "rikssbank/centralbank" ägs av makro-lagret (starkord här).
 *   • "källskatt" ägs av basens skatt-monster — sj-01 används här endast
 *     som KÄLLA och kurslänk, aldrig som kärnord.
 *
 * BUGGHISTORIK I KEDJAN (dokumenterad för framtida omgångar): sektor-
 * lagret (c363ec8b) levererades en gång utan sin widget-inkoppling och
 * var död kod tills syskonet s6-u1 omgång 5 kuraterade tillbaka det
 * tillsammans med sitt case-lager. Denna omgång kopplar in sitt lager
 * SIST — och testfall L läser widgetens kedjerad MEKANISKT ur filen så
 * att "lager utan inkoppling" aldrig kan återkomma tyst.
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
 *     ?? svaraLokaltKapitalmekanik(q, KURSREGISTER)
 *     ?? svaraLokaltSektor(q, KURSREGISTER)
 *     ?? svaraLokaltCase(q, KURSREGISTER)
 *     ?? svaraLokaltPraktik(q, KURSREGISTER)
 *     ?? svaraLokaltPortfoljgrund(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en
 * fråga från tidigare lager — det fångar bara frågor som alla andra
 * lager lämnar null på. Omvänt vaktar testfall I på att dessa frågor
 * INTE fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur spridning, korrelation och
 * valutamekaniker FUNGERAR — inga köp-/säljsignaler, inga placeringstips,
 * inga omdömen om enskilda bolag eller värdepapper. Både diversifierings-
 * frågans "två skolor" och valutafrågans "hedga eller inte" beskrivs som
 * medvetna valfrågor där valet lämnas åt läsaren.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-portfoljgrund.mjs kan köra filen direkt i Node.
 * Alla källkurser (pf-03, km-014, pf-11, rk-07, km-058,
 * sj-01-utlandsk-kallskatt) finns i KURSREGISTER — inga väntande
 * registerberoenden.
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

// ── De 2 portfoljgrunds-frågorna ────────────────────────────────────────────

export const PORTFOLJGRUND_MONSTER: FragMonster[] = [
  {
    id: "diversifiering",
    karnord: [
      "diversifiering", "diversifiera", "diversifierat", "diversifierade",
      "korrelation", "korrelationen", "korrelerad", "korrelerade",
      "okorrelerad", "okorrelerade", "samvariation",
    ],
    starkord: [
      "risk", "risken", "sprida", "spridning", "portfölj", "portfolj",
      "aktier", "bolag", "innehav",
    ],
    bygga: (reg) => {
      const pfAntal = reg.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
      const kallor = [
        kursKalla(reg, "pf-03-diversifiering", "Läroplanen — portföljhantering, kursen om spridning"),
        kursKalla(reg, "km-014-korrelation-diversifiering", "Läroplanen — riskhantering & portföljteori, samrörelsens matematik"),
        kursKalla(reg, "pf-11-koncentrerad-portfolj", "Läroplanen — portföljhantering, motpolen: medvetet få innehav"),
      ];
      const k = kallor[0];
      const pf = reg.find((r) => r.slug === "pf-03-diversifiering");
      return {
        text:
          `Diversifiering är idén att inte lägga alla ägg i samma korg — men mekaniken är mer preciserad än så, och det är den som gör ämnet lärorikt:\n\n1️⃣ KORRELATIONEN ÄR MOTORN — spridning fungerar bara om innehaven rör sig OLIKT. Korrelationen mäter samrörelsen mellan två tillgångar och skrivs från −1 via 0 till +1: vid +1 rör de sig i perfekt synk (ingen spridningseffekt alls), vid 0 är de oberoende, vid −1 rör de sig spegelvänt och utjämnar varandra helt. Tio bolag i samma bransch med korrelation nära +1 faller 20 % TILLSAMMANS — vad risken beträffar är de närmast ett enda bolag.\n2️⃣ ANTALET ÄR HALVA SVARET — den klassiska forskningen visar att den specifika risken planar ut någonstans kring 20–30 innehav: där efter försvinner det mesta av risken i varje enskilt bolag, och vad som återstår är den aktiva risken — din egen förståelse av vad du äger. Fler innehav bortom det köper allt mindre lugn för allt mer arbete.\n3️⃣ MOTPOLEN FINNS OCH ÄR MEDVETEN — koncentrerad portföljskolan (5–10 bolag) accepterar högre koncentration för att kunna förstå varje bolag på djupet. Två skolor, samma krav på medvetenhet: den breda köper sömn med ytterlighet, den smala köper djup med koncentration. Spridningskursen (${pf ? pf.minuter + " min" : "i registret"}) går igenom båda hållningarna.\n\nI kategorin portföljhantering finns ${pfAntal} kurser — från portföljbyggande och position sizing till rebalansering och krishantering. Som alltid: detta är utbildning i mekaniken, inte ett svar på hur just ditt ägande bör se ut.` +
          kallradFler(kallor),
        amne: "diversifiering",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Diversifiering", lank: "/kurser/pf-03-diversifiering", ikon: "🧺", beskrivning: "Intermediär — spridningens praktik" },
          { text: "Kursen: Korrelation & diversifiering", lank: "/kurser/km-014-korrelation-diversifiering", ikon: "🔗", beskrivning: "Intermediär — samrörelsens matematik" },
          { text: "Kursen: Koncentrerad portfölj", lank: "/kurser/pf-11-koncentrerad-portfolj", ikon: "🎯", beskrivning: "Avancerad — motpolen: få bolag på djupet" },
          { text: "Vad är en indexfond?", lank: "fragor:" + encodeURIComponent("vad är en indexfond?"), ikon: "🧮", beskrivning: "Spridning som färdig produkt" },
        ],
        motfraga: { text: "Vad är en indexfond?", kategori: "portföljhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/pf-03-diversifiering" },
      };
    },
  },
  {
    id: "valutarisk",
    karnord: [
      "valuta", "valutor", "valutan", "valutarisk", "valutarisken",
      "valutakurs", "valutakursen", "valutakurser", "växelkurs",
      "växelkursen", "växelkurser", "dollar", "dollarn", "euro",
    ],
    starkord: [
      "aktier", "bolag", "påverkar", "risk", "rikssbank", "export",
      "import", "intäkter",
    ],
    bygga: (reg) => {
      const rk = reg.find((r) => r.slug === "rk-07-valutarisk");
      const km = reg.find((r) => r.slug === "km-058-valutor");
      const kallor = [
        kursKalla(reg, "rk-07-valutarisk", "Läroplanen — riskhantering, kursen om valutaeffekten"),
        kursKalla(reg, "km-058-valutor", "Läroplanen — makroekonomi & ränta, valutornas mekanik"),
        kursKalla(reg, "sj-01-utlandsk-kallskatt", "Läroplanen — skatt & juridik, utländska aktiers praktiska spår"),
      ];
      const k = kallor[0];
      return {
        text:
          `Valutarisk är att två saker mäts i olika pengar: ett bolag bokför i kronor men kan sälja i dollar, köpa råvaror i euro och äga fabriker i en tredje valuta. Kursrörelserna flyttar då siffror i rapporten utan att verksamheten rört sig — som ren räkneövning:\n\n1️⃣ OMRÄKNINGSEFFEKTEN — ett bolag säljer för 10 miljoner dollar. Vid kursen 9,00 kronor per dollar blir det 90 mkr; vid 10,50 blir samma försäljning 105 mkr — 17 % mer intäkter utan att ett enda extra paket lämnat fabriken (105 ÷ 90 ≈ 1,17). Spegelvänt gäller för importören: samma kostnad i dollar blir dyrare i kronor när kronan svagas. Det är därför svag krona ofta kallas exportstödjande — mekanik, inte omdöme.\n2️⃣ RAPPORTEN SKILJER ÅT — seriösa bolag redovisar vad av tillväxten som är ORGANISK och vad som är VALUTAEFFEKT (samma distinktion som tx-kurserna om organisk kontra förvärvad tillväxt gör för bolagsköp). Utan den noten kan en valutavind blåsa upp en intäktsökning som ser ut som tillväxt men bara är omräkning.\n3️⃣ RISKSIDAN ÄR ETT VAL, OCKSÅ ATT INTE VÄLJA — valutarisken kan säkras (hedgas) med terminer eller optioner till en kostnad, eller bäras öppet — båda hållningarna är medvetna positioner. Och för den som äger utländska aktier kommer ett andra praktiskt spår: utländsk källskatt på utdelningar. Valutakurserna (${km ? km.minuter + " min kurs" : "kurs i registret"}) och riskhanteringen runt dem (${rk ? rk.minuter + " min kurs" : "kurs i registret"}) har varsin kurs här.\n\nSom alltid: detta är utbildning i att LÄSA mekaniken — aldrig ett omdöme om någon enskild valuta, position eller bolag.` +
          kallradFler(kallor),
        amne: "valutarisk",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Valutarisk", lank: "/kurser/rk-07-valutarisk", ikon: "💱", beskrivning: "Intermediär — valutaeffekten i rapporten" },
          { text: "Kursen: Valutor", lank: "/kurser/km-058-valutor", ikon: "🌍", beskrivning: "Intermediär — valutornas makromekanik" },
          { text: "Kursen: Utländsk källskatt", lank: "/kurser/sj-01-utlandsk-kallskatt", ikon: "🧾", beskrivning: "Utländska aktiers praktiska spår" },
          { text: "Vad är diversifiering?", lank: "fragor:" + encodeURIComponent("vad är diversifiering?"), ikon: "🔗", beskrivning: "Spridningen över länder och valutor" },
        ],
        motfraga: { text: "Vad är diversifiering?", kategori: "portföljhantering" },
        fordjupa: { text: k.titel, lank: "/kurser/rk-07-valutarisk" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två portföljgrunds-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt).
 * Samma fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltPortfoljgrund(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of PORTFOLJGRUND_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
