/**
 * AI-MENTORN 2.0 — EKOSYSTEMDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 17, s6-u2).
 *
 * Två ytterligare källmärkta förhandsfrågor ovanpå de trettiotre committade
 * lagren (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa,
 * kapitalmekanik, sektor, case, praktik, portfoljgrund, ägande,
 * redovisningsdjup, djup, historia, lonsamhetsdjup, tsdjup, skattedjup,
 * beteendedjup, riskdjup, riskmåttsdjup, utdelningsdjup, förväntningsdjup,
 * portfoljbalans, stabilitetsdjup, grahamgolv, varderjustering, optionsdjup,
 * riskläsningsdjup, avkastningskurva, avrakningsdjup, värderingsverktyg,
 * warrant, tidsaxel, kapitalbindning):
 *   1. SAM-viktningen (ek-01 primär + ek-02 + ek-03 + konfluens-kursen) —
 *      ekosystemets röstlängdning: fem teorier viktas till en signal, med
 *      fyra skyddväggar som gör viktningen till metod
 *   2. Backtestens hantverk (ek-04 primär + ek-05 + ek-01 + am-02) — frågan
 *      till historien som håller varje regel ärlig; bär Monte Carlo-
 *      simuleringen (ek-05) som systermetod: tusen framtider ur en prognos
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u2-sond-omg17.mjs, otrackad): en
 * genomräkning LIVE ur alla 33 motorer / 98 monsters visade att HELA
 * EKOSYSTEM-kategorin var mentorväglös — ek-01, ek-02, ek-03, ek-04 och
 * ek-05: 0 av 5 kurser nåddes av någon kalla, handlings- eller fordjupa-
 * länk (207 av 414 registerkurser nås totalt). Kärnordsfamiljerna
 * "sam-viktning/samviktning/röstlängdning/röstbudgeten/viktprofilerna" och
 * "backtest i alla böjningar / monte carlo / simulera + simulering / tusen framtider"
 * verifierades mekaniskt
 * fria: tio kanoniska kandidatfrågor NULL genom hela kedjan, inget av 1 060
 * befintliga kärnord inom motorns tolerans (kort ord exakt, ≤7 tecken
 * avstånd 1, annars 2), och samtliga 50 tidigare lagrets kanoniska frågor
 * lämnas ifred (0 omvända stölder). SAM-viktning och Monte Carlo är också
 * kundens EGEN metodik (ak1a-analys-färdigheten kör dem mot riktiga data) —
 * frågorna om dem är troliga från varje användare som ser en analys.
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt; kedjetestets A/B-
 * fall + detta modultests H-fall bevisar gränserna):
 *   • Basen äger ekosystemets HELHETSORD — "konfluens", "vågfundamentet" och
 *     "ak1ts" är basens kärnord och deras frågor går kvar dit (kedjebevisat
 *     i sonden). Detta lager äger RÖSTLÄNGDNINGEN (sammanvägningen inuti
 *     ekosystemet) — konfluens-kursen är här KÄLLA, inte kärnordsägande.
 *   • Nästa-lagret äger DCF/inre värde-orden; ek-05:s diskonterings-
 *     exempel (152-kronors schablonvärdet) nämns här som MEKANIK i text,
 *     aldrig som kärnord — "monte carlo" och "simulering" är detta lagers.
 *   • Historia-lagret äger de historiska krascherna; backtest-svaret nämner
 *     historien som MATERIAL, inte kärnord.
 *   • Stabilitetsdjupet äger stresstest/känslighetsanalys: "stresstest" ↔
 *     "backtest" håller redigeringstavstånd > 4 (mekaniskt verifierat i
 *     sonden) — en stresstest-fråga kan aldrig fastna här, och vice versa.
 *
 * DOKUMENTERAD RISK (accepterad): "simulering" är ett bredare ord än
 * övriga familjen — det ägs här medvetet eftersom ingen tidigare motor
 * bär det (sond: 0 grannar bland 1 060) och frågan "hur simulerar jag en
 * kassaflödesprognos?" annars går till API-flödet. "sam" som NAKET ord är
 * medvetet INTE kärnord (kort ord, exakt matchning, skulle kunna fastna i
 * fraser) — familjen kräver sammansättningarna.
 *
 * Aritmetiken i svaren är ek-kursernas EGNA räkningar (data/kurser-tillagg/
 * ek-01, ek-04, ek-05) och maskinellt omräknade i regressionstestet:
 * mikro-horisonten VOL 30 + FIB 25 + EW 20 + GANN 15 + LUC 10 = 100;
 * rösterna 0,6×30 + 0,4×25 + (−0,2)×20 + 0×15 + 0,1×10 = 25,0 →
 * SAM(mikro) = +0,25; röstbudgeten 25,75 + 26,00 + 23,25 + 15,00 + 10,00
 * = 100,00; överlevnadsfällan (20×11,0 + 3×(−40,0)) ÷ 23 = 100/23 ≈ 4,3
 * procent per år, gapet 11,0 − 4,3 = 6,7 procentenheter; percentilbandet
 * P5 92 · P25 121 · P50 150 · P75 183 · P95 230 med kvartilavståndet
 * 183 − 121 = 62 mot hela bandet 230 − 92 = 138.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningfall och determinismfall. Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B/C vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * kapitalbindning) och kan därför aldrig stjäla en fråga från ett tidigare
 * lager; det fångar bara frågor som alla trettiotre lagren före det
 * lämnar null på. Omvänt vaktar kedjetestets A-fall på att dessa frågor
 * INTE fångas av kedjan utan detta lager.
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur SAM-viktningen och backtesten
 * DEFINIERAS och RÄKNAS som metod — inga köp-/säljsignaler, inga
 * placeringstips, inga omdömen om enskilda bolag eller värdepapper.
 * Aritmetiken illustrerar mekaniken med kursernas publicerade
 * räkneexempel, aldrig utfästelser om avkastning. SAM-värdet +0,25 är en
 * ÖVNING i normalisering, inte en signal att handla på.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-ekosystemdjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (ek-01-sam-viktningen, ek-02-labbets-karta,
 * ek-03-arbetsflodet-i-labbet, ek-04-backtestens-hantverk,
 * ek-05-monte-carlo-i-motorn, konfluens-varde-moter-vagor,
 * am-02-index-och-passivt-agande) finns i KURSREGISTER (verifierat i
 * 414-registret; kursKalla faller tillbaka på "Läroplanen" om ett
 * framtida register läcker en slug).
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { FragMonster, LokalKalla, LokaltSvar } from "./ai-mentor-svar";

// ── Hjälpbyggare — spegling av motorns (ai-mentor-svar.ts) ─────────────────
// Samma driftvarning som syskonlagren: speglade rena funktioner, bevisade
// likvärdiga av regressionstestet (felstavning- + determinismfall).

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
 * av kedjetestets E-fall och detta modultests A-fall ("📖 Källor (").
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

// ── De 2 ekosystemdjup-frågorna ─────────────────────────────────────────────

export const EKOSYSTEMDJUP_MONSTER: FragMonster[] = [
  {
    id: "samviktning",
    karnord: [
      "sam-viktning", "samviktning", "samviktningen", "samvägning",
      "teoriröstning", "röstlängdning", "röstlängdningen", "röstbudgeten",
      "viktprofilerna",
    ],
    starkord: [
      "ekosystem", "teorier", "signaler", "rösta", "viktas", "horisont",
      "ensemble", "vägd",
    ],
    bygga: (reg) => {
      const ekAntal = reg.filter((r) => r.kategori === "EKOSYSTEM").length;
      const kallor = [
        kursKalla(reg, "ek-01-sam-viktningen", "Läroplanen — ekosystemet, röstlängdningen: fem teorier vägs till en signal"),
        kursKalla(reg, "ek-02-labbets-karta", "Läroplanen — ekosystemet, kartan över huset med fem rum"),
        kursKalla(reg, "ek-03-arbetsflodet-i-labbet", "Läroplanen — ekosystemet, arbetsflödet från insamling till dokumentation"),
        kursKalla(reg, "konfluens-varde-moter-vagor", "Läroplanen — konfluens: fordran på oberoende källor som kompletterar viktningen"),
      ];
      const k = kallor[0];
      const ek01 = reg.find((r) => r.slug === "ek-01-sam-viktningen");
      return {
        text:
          `SAM-viktningen är ekosystemets röstlängdning: fem teorier — Elliott, Fibonacci, GANN, Lucas och volyman — var och en mäter marknaden på sitt sätt, och i stället för att utse en vinnare vägs deras röster samman till EN signal. Grundhållningen är att teorier är mätinstrument med egen noggrannhet: ingen är sann, några är användbara (allt nedan är utbildning i hur metoden räknas — ingen signal att handla på):\n\n1️⃣ FORMALISMEN — varje teori får en VIKT i procent av horisontens röstmassa, och signalen normaliseras till ett tal mellan −1 och +1. Mikro-horisontens profil i labbets metodik: volym 30, Fibonacci 25, Elliott 20, GANN 15, Lucas 10 — summan exakt 100. En dagläsning kan ge signalerna volym +0,6, Fibonacci +0,4, Elliott −0,2, GANN 0 och Lucas +0,1. Räkningen: 0,6 × 30 = 18,0 · 0,4 × 25 = 10,0 · −0,2 × 20 = −4,0 · 0 × 15 = 0,0 · 0,1 × 10 = 1,0 — summa 25,0 av 100, alltså SAM(mikro) = +0,25. Ett svagt positivt läge, läsbart och jämförbart mellan dagar just för att skalan är densamma.\n2️⃣ RÖSTBUDGETEN — vikterna skiljer sig mellan horisonter (medellång bär tyngst), och multiplicerar man hela viktverket färdigt framgår varje teoris TOTALA andel: Elliott 26,00, volym 25,75, Fibonacci 23,25, GANN 15,00 och Lucas 10,00 — summan exakt 100. Budskapet är maktfördelningen i en enda rad: strukturteorierna ligger strax över en fjärdedel var, kalendarteorierna hålls medvetet små (tidsfönster är uppmärksamhetsfilter, aldrig huvudsignaler). Men budgeten säger inget om KORRELATIONEN — fem teorier som läser samma prisserie med samma fönster är fem kopior av en röst — därför kompletteras den av konfluenskravet: minst tre metodologiskt oberoende källor måste peka samma håll.\n3️⃣ DE FYRA SKYDDVÄGGARNA — utan regler är en viktning bara ett sätt att förlora mer systematiskt. (1) DEKLARERA FÖRE RESULTAT: vikterna publiceras innan resultaträkningen, annars blir de en efterhandskonstruktion. (2) TEORI UTAN BRYTPUNKT RÖSTAR INTE: varje tes måste bära en observation som skulle döda den. (3) VERKLIG OBEROENDE: konfluens kräver olika metoder, inte olika namn. (4) BAYES-DISCIPLIN: vikterna uppdateras bara på fördefinierade bevis — aldrig på känslan efter en svag månad.\n\nSAM-viktningen är ekosystemets femte ben — AKM1 poängsätter fundamentalvariablerna, AK1TS läser vågorna, konfluens fordrar oberoende källor, och SAM ställer frågan efteråt: hur slog de deklarerade vikterna? Ekosystem-familjen har ${ekAntal} kurser; huvudkursen (${ek01 ? ek01.kapitel + " kapitel · " + ek01.minuter + " min · nivå " + ek01.niva.toLowerCase() : "i registret"}) äger hela räkneverket med övningar. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "samviktning",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: SAM-viktningen", lank: "/kurser/ek-01-sam-viktningen", ikon: "🗳️", beskrivning: "Röstlängdningen steg för steg" },
          { text: "Kursen: Labbets karta", lank: "/kurser/ek-02-labbets-karta", ikon: "🗺️", beskrivning: "Huset med fem rum — orienteringen" },
          { text: "Kursen: Arbetsflödet i labbet", lank: "/kurser/ek-03-arbetsflodet-i-labbet", ikon: "🔧", beskrivning: "Fem stationer, en loggad analys" },
          { text: "Kursen: Konfluens — värde möter vågor", lank: "/kurser/konfluens-varde-moter-vagor", ikon: "🧭", beskrivning: "Oberoende-kravet bakom viktningen" },
          { text: "Vad är en backtest?", lank: "fragor:" + encodeURIComponent("vad är en backtest?"), ikon: "🧪", beskrivning: "Hur metoden prövas mot historien" },
        ],
        motfraga: { text: "Vad är en backtest?", kategori: "ekosystem" },
        fordjupa: { text: k.titel, lank: "/kurser/ek-01-sam-viktningen" },
      };
    },
  },
  {
    id: "backtest",
    karnord: [
      "backtest", "backtesten", "backtester", "backtesting", "backtestar",
      "monte carlo", "monte-carlo-simulering", "simulera", "simulering", "simuleringar",
      "tusen framtider",
    ],
    starkord: [
      "historia", "historien", "metod", "testa", "prognos", "kassaflöde",
      "framtider", "procentiler", "ekosystem", "strategi",
    ],
    bygga: (reg) => {
      const ekAntal = reg.filter((r) => r.kategori === "EKOSYSTEM").length;
      const kallor = [
        kursKalla(reg, "ek-04-backtestens-hantverk", "Läroplanen — ekosystemet, provbänken: att testa en metod mot historien utan att lura sig själv"),
        kursKalla(reg, "ek-05-monte-carlo-i-motorn", "Läroplanen — ekosystemet, simuleringen: tusen framtider ur en kassaflödesprognos"),
        kursKalla(reg, "ek-01-sam-viktningen", "Läroplanen — ekosystemet, viktningen som backtesten prövar"),
        kursKalla(reg, "am-02-index-och-passivt-agande", "Läroplanen — aktiemarknaden i praktiken, indexets tysta selektion (överlevnadsmaskinen)"),
      ];
      const k = kallor[0];
      const ek04 = reg.find((r) => r.slug === "ek-04-backtestens-hantverk");
      const ek05 = reg.find((r) => r.slug === "ek-05-monte-carlo-i-motorn");
      return {
        text:
          `Ett backtest har tre delar och en fråga. DEL ETT: REGELN — fullständigt definierad FÖRE testet, utan tolkningsutrymme (en regel som kräver känsla är två regler — en skriven och en biologist). DEL TVÅ: MATERIALET — vilket universum, vilka år, vilka källor, angivna vid start och aldrig utvidgade i efterhand. DEL TRE: RÄKNEMOTORN — som låter regeln arbeta materialet KRONOLOGISKT och bokför varje beslut, kostnad och utfall. FRÅGAN: höll regeln på detta material? (Allt nedan är utbildning i hantverket — aldrig en uppmaning att handla på någon regel.)\n\n1️⃣ ÖVERLEVNADSFÄLLAN — den fälla som inte syns i kurvan, bara i listan den byggdes av. Kursens räkneexempel: backtesta regeln "de tjugo största bolagen, innehav i tio år" på DAGENS bolaglista och snittet blir +11,0 procent per år — men dagens lista innehåller per definition bara överlevarna. Under perioden försvann tre bolag (uppköp, konkurs, avnotering) med −40,0 procent vardera för den som höll dem. Räkningen hem: (20 × 11,0 + 3 × (−40,0)) ÷ 23 = 100 ÷ 23 ≈ 4,3 procent per år. Överlevnadsgapet: 11,0 − 4,3 = 6,7 PROCENTENHETER per år, i tio år — från en urvalslista. Kuren är en enda regel: rita urvalet vid PERIODENS START, inte vid dess slut.\n2️⃣ TIDSORDNINGEN — materialet har en tidslinje och regeln ska gå den FRAMÅT. Träna-pröva-disciplinen: bygg (och finslipa) regeln ENDAST på träningsperioden — till exempel 2005–2015 — och pröva den sedan OFÖRÄNDRAD på nästa period, 2016–2025. Att välja perioden efteråt, testa 2007–2009 för att "inkludera krisen", är att fråga historien på måndagen och publicera svaret på fredagen. Och månadsfällan: tio år månadsdata är 120 rader, men månader är grannar som upprepar varandra (volatiliteten klustrar) — de bär informationen av kanske ett tiotal oberoende år.\n3️⃣ KOSTNADERNA + SYSTERN MONTE CARLO — courtaget, spreaden och skatten finns inte i rådatan men finns i verkliga livet; de ska in i räkningen innan kurvan läses. Och framåtblicken har sin egen metod: Monte Carlo-simuleringen (ek-05) byter EN prognos mot en FÖRDELNING av möjliga. Exemplet: tre antaganden (tillväxt, rörelsemarginal, kalkylränta) ger schablonvärdet 152 kronor — men låt varje antagande bära en fördelning i stället för ett fast tal, räkna modellen tiotusen gånger, och läs utfallet som percentiler: P5 92 · P25 121 · P50 150 · P75 183 · P95 230 kronor. Medianen 150 träffar basfallets 152 nästan exakt — budskapet är inte punkten mot punkten utan BANDET mot punkten: kvartilavståndet 183 − 121 = 62 kronor mot hela bandet 230 − 92 = 138. Den som bär ett tal från en analys bär en siffra; den som bär ett band bär en hållning.\n\nVarför backtesten är ekosystemets ärlighetsorgan: allt i labbet är regler — AKM1:s tjugo poängsatta variabler, AK1TS:s horisontläsning, SAM-viktningens röster — och en regel skiljer sig från en åsikt på exakt ett sätt: den kan prövas. Ekosystem-familjen har ${ekAntal} kurser; huvudkursen (${ek04 ? ek04.kapitel + " kapitel · " + ek04.minuter + " min · nivå " + ek04.niva.toLowerCase() : "i registret"}) äger fällorna med räkningar, systerkursen (${ek05 ? ek05.minuter + " min · nivå " + ek05.niva.toLowerCase() : "i registret"}) bygger simuleringen från grunden. Slutsatsen aldrig längre än materialet — som alltid utbildning, aldrig råd.` +
          kallradFler(kallor),
        amne: "backtest",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Backtestens hantverk", lank: "/kurser/ek-04-backtestens-hantverk", ikon: "🧪", beskrivning: "Överlevnadsfällan, överanpassningen, tidsordningen" },
          { text: "Kursen: Monte Carlo i motorn", lank: "/kurser/ek-05-monte-carlo-i-motorn", ikon: "🎲", beskrivning: "Tusen framtider ur en prognos" },
          { text: "Kursen: SAM-viktningen", lank: "/kurser/ek-01-sam-viktningen", ikon: "🗳️", beskrivning: "Regeln som prövas — röstlängdningen" },
          { text: "Kursen: Index och passivt ägande", lank: "/kurser/am-02-index-och-passivt-agande", ikon: "📊", beskrivning: "Indexet som överlevnadsmaskin" },
          { text: "Vad är SAM-viktningen?", lank: "fragor:" + encodeURIComponent("vad är SAM-viktningen?"), ikon: "🗳️", beskrivning: "Viktningen som backtesten prövar" },
        ],
        motfraga: { text: "Vad är SAM-viktningen?", kategori: "ekosystem" },
        fordjupa: { text: k.titel, lank: "/kurser/ek-04-backtestens-hantverk" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två ekosystemdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltEkosystemdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of EKOSYSTEMDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
