/**
 * AI-MENTORN 2.0 — ÖVERLEVNADSDJUP-FÖRHANDSFRÅGOR (spår 6, omgång 20, s6-u2).
 *
 * Två källmärkta förhandsfrågor ovanpå de fyrtio committade lagren —
 * bolagets överlevnad, stabilitetsfamiljens krönande par:
 *   1. Likviditetsreserven ("vad är likviditetsreserven?") —
 *      reservens tre ben, överlevnadstiden i månader, kassaräckvidden
 *      (st-06 primär + st-05 + v11 + bk-01 + km-003 som källor)
 *   2. Konkursprognos — Altman Z-score ("vad är altman z-score?") —
 *      de fem nyckeltalen med vikter, gråzonen och rörelsen
 *      (st-03 primär + st-01 + v12 + bk-01 som källor)
 *
 * REGISTERBÄRNING: STABILITET-kategorin går 5/9 → 9/9 FULLT MENTORLÄNKAD
 * (sondens genomräkning i 426-registret): st-03 + st-06 aktiveras som
 * primära kurser, v11-likviditet + v12-intaktsstabilitet som källor;
 * st-05-refinansieringsmuren + st-01 + bk-01-balansrakningen +
 * km-003-kassaflodesanalysen är registeräkta syskonkällor — varje slug
 * finns i KURSREGISTER (kedjetestets E-fall + modultestets D01 vakar).
 * Spår 5:s sex färska kurser (am-07/ks-07/mt-06/vr-06/st-06/ib-03) var
 * ALLA mentorväglösa; detta lager aktiverar st-06 — syskonens sondningar
 * äger de övriga fem.
 *
 * ÄMNESVAL EFTER SOND I TRE RONDER (verktyg/_s6u2-sond{,2,3}-omg20.mjs,
 * otrackade diskbevis; kedjan LIVE-läst med den riktiga matchern:
 * 40 motorer / 113 monsters / 1 257 kärnord / register 426):
 *   • Rond 1: hela likviditetsreservsfären NULL genom kedjan
 *     («vad är likviditetsreserven?» · «vad är överlevnadstid?» ·
 *     «vad är kassaräckvidd?» · «hur länge räcker kassan?» ·
 *     «vad är likviditetsbuffert?») och hela konkursprognosfären NULL
 *     («vad är altman z-score?» · «vad är z-score?» · «vad är
 *     konkursprognos?» · «vad är konkursrisk?» · «hur förutsäger man
 *     konkurs?»).
 *   • Rond 2: kärnordsfamiljerna RENTA mot kedjans 1 257 kärnord —
 *     likviditetsreserv-, överlevnadstids- och kassaräckviddfamiljen
 *     samt altman-, z-score- och konkursfamiljen har 0 grannar inom
 *     tavstånd 2.
 *   • Rond 3: korsformuleringar + källkursfakta; döda spår bokförda
 *     (se ansvarsfördelning).
 *
 * ANSVARSFÖRDELNING (syskonlagrens dokumentationsplikt; modultestets
 * G/G2-fall bevisar båda vägarna):
 *   • Basen äger naket «likviditet» (aktiemarknads-monstret) och «kvick»
 *     (variabel-V11-uppslaget) — v11-likviditet är här ENDAST källa
 *     (V19-precedensen: källägande ≠ kärnordsägande); detta lager bär
 *     ENBART sammansättningarna i likviditetsreserv- och
 *     likviditetsbuffert-familjerna.
 *   • Kapitalbindningen äger rörelsekapital/kassakonverteringscykeln —
 *     Z-modellens X1-term förklarar rörelsekapitalet i TEXT men bär det
 *     aldrig som kärnord.
 *   • Stabilitetsdjupet äger känslighetsanalys/stresstest/soliditetsgrad —
 *     deras fråga bärs som knapp; balansstyrka lämnas orörd.
 *   • Tidsaxeln äger refinansieringsmuren — muren förklaras i TEXT som
 *     reservens koppling (inom/efter överlevnadstiden) och länkas som
 *     kurs + knapp, kärnorden är deras.
 *   • Riskdjupet äger covenants — facilitetens villkor nämns i TEXT som
 *     fälla, deras knapp äger ordet.
 *   • Basens «z poäng» (quiz-xp-monstret) är olik formulering: det
 *     fångar quiz-frågor, inte konkursprognos — dokumenterad gräns.
 *
 * Aritmetiken i båda svar är KURSERNAS EGNA ÖVNINGSTAL (maskinellt
 * omräknade i modultestets D-fall):
 *   • Likviditetsreserven: kassa 840,0 + outnyttjad facilitet 630,0 =
 *     smal reserv 1 470,0 Mkr; obeskattade reserver 260,0 × (1 − 0,206)
 *     = 206,4 Mkr i netto → bred reserv 1 676,4 Mkr; förbrukning 210,0
 *     per månad ⇒ smal överlevnadstid 1 470,0 ÷ 210,0 = 7,0 månader,
 *     bred 1 676,4 ÷ 210,0 = 8,0 månader; kvartalsmåttet 210,0 × 3 =
 *     630,0; spegelbolaget 95,0 ÷ 80,0 = 1,2 månader.
 *   • Altman Z-score: Z = 1,2×X1 + 1,4×X2 + 3,3×X3 + 0,6×X4 + 1,0×X5;
 *     övningen med totala tillgångar 2 000 Mkr: rörelsekapital 400 +
 *     350 − 250 = 500 ⇒ X1 = 0,25; balanserat resultat 360 ⇒ X2 = 0,18;
 *     rörelseresultat 130 ⇒ X3 = 0,065; börsvärde 1 600 ÷ skuld 2 000 ⇒
 *     X4 = 0,80; omsättning 2 300 ⇒ X5 = 1,15; viktat 0,300 + 0,252 +
 *     0,2145 + 0,480 + 1,150 = 2,3965 ≈ 2,40 — mitt i gråzonen
 *     (gränserna: över 2,99 säker zon, 1,81–2,99 gråzon, under 1,81
 *     stresszon).
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningsfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * sektorskola2, kedjans 40:e motor) och kan därför aldrig stjäla en fråga
 * från ett tidigare lager; det fångar bara frågor som alla lager före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE
 * fångas av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur överlevnadsmått DEFININIERAS
 * och RÄKNAS som metod — inga köp-/säljsignaler, inga placeringstips,
 * inga omdömen om enskilda börsbolag (exemplens bolag är kursens påhittade
 * övningsbolag). Gränsvärdena presenteras som modellens läsverktyg, aldrig
 * som handlingsanvisning — ett lågt Z är «modellen kräver vidare läsning»,
 * aldrig en uppmaning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-overlevnadsdjup.mjs kan köra filen direkt i Node.
 * Alla källkurser (st-06-likviditetsreserven, st-05-refinansieringsmuren,
 * v11-likviditet, bk-01-balansrakningen, km-003-kassaflodesanalysen,
 * st-03-altman-z-score, st-01-soliditet-och-rantetackning,
 * v12-intaktsstabilitet) finns i KURSREGISTER (verifierat i 426-registret;
 * kursKalla faller tillbaka på «Läroplanen» om ett framtida register läcker
 * en slug).
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

// ── De 2 överlevnadsdjup-frågorna ───────────────────────────────────────────

export const OVERLEVNADSDJUP_MONSTER: FragMonster[] = [
  {
    id: "likviditetsreserv",
    karnord: [
      "likviditetsreserv", "likviditetsreserven", "likviditetsreserver",
      "likviditetsreserverna", "likviditetsbuffert", "likviditetsbufferten",
      "överlevnadstid", "överlevnadstiden", "kassaräckvidd", "kassaräckvidden",
      "räcker kassan",
    ],
    starkord: [
      "kassa", "kassan", "facilitet", "faciliteten", "buffert",
      "obeskattade", "reserver", "netto", "månader", "förbrukning",
    ],
    bygga: (reg) => {
      const stAntal = reg.filter((r) => r.kategori === "STABILITET").length;
      const kallor = [
        kursKalla(reg, "st-06-likviditetsreserven", "Läroplanen — reservens tre ben, överlevnadstiden och fällorna"),
        kursKalla(reg, "st-05-refinansieringsmuren", "Läroplanen — reservens koppling till skuldens förfallokalender"),
        kursKalla(reg, "v11-likviditet", "Läroplanen — likviditetsmåttens grundkurs (AKM1:s variabel V11)"),
        kursKalla(reg, "bk-01-balansrakningen", "Läroplanen — var i balansräkningen reserverna står"),
        kursKalla(reg, "km-003-kassaflodesanalysen", "Läroplanen — förbrukningstalet ur kassaflödets fyra kvartal"),
      ];
      const k = kallor[0];
      const st06 = reg.find((r) => r.slug === "st-06-likviditetsreserven");
      return {
        text:
          `En kris testar inte skulden först — den testar reserven. Likviditetsreserven är det bolaget kan betala med utan att låna, sälja eller be aktieägarna om något, och frågan den besvarar är inte hur mycket bolaget är skyldigt utan hur länge det kan andas (allt nedan är utbildning i hur reserven DEFINIERAS och RÄKNAS, med kursexemplets påhittade tal — inga omdömen om enskilda bolag):\n\n1️⃣ RESERVENS TRE BEN. Första benet är kassan och bankmedlen — likvida medel plus kortfristiga placeringar som snabbt kan realiseras. Andra benet är de obeskattade reserverna, och de kräver en nettoberäkning: posten ligger i det egna kapitalet men en framtida skatteskuld vilar på den, och skulle reserven realiseras betalar bolaget skatt på vinsten. Räkneexemplet: obeskattade reserver 260,0 miljoner kronor gånger (1 minus 0,206) med dagens bolagsskattesats ger 260,0 × 0,794 = 206,4 miljoner i netto — en isbit som är 260,0 på pappret men 206,4 i handen, eftersom skatten smälter av först när isen används. Tredje benet är den outnyttjade kreditfaciliteten: en tecknad men inte utnyttjad kredit hos banken — verklig reserv, men villkorad. Exempelbolagets ben: kassa 840,0 Mkr, obeskattade reserver i netto 206,4 Mkr, outnyttjad facilitet 630,0 Mkr.\n2️⃣ SMAL OCH BRED RESERV — OCH ÖVERLEVNADSTIDEN. Smala reserven räknas utan de obeskattade: 840,0 + 630,0 = 1 470,0 Mkr. Breda reserven tar med dem i netto: 1 470,0 + 206,4 = 1 676,4 Mkr. Båda talen redovisas — de svarar på olika frågor. Överlevnadstiden (kassaräckvidden) föds när reserven ställs mot månadsförbrukningen, driftskostnadernas medelvärde ur fyra kvartal — i exemplet 210,0 Mkr per månad: smala reserven 1 470,0 ÷ 210,0 = 7,0 månader, breda 1 676,4 ÷ 210,0 = 8,0 månader, så länge lever bolaget om intäkterna tystnar helt och förbrukningen står oförändrad (kvartalsmåttet: 210,0 × 3 = 630,0 per kvartal). Spegelbolaget visar motsatsen: kassa 95,0 utan facilitet mot förbrukning 80,0 per månad = 95,0 ÷ 80,0 = 1,2 månader — det bolaget måste inom veckor låna, emittera eller sälja något. Överlevnadstid är förhandlingsutrymme, och förhandlingsutrymme är avkastning: bolaget med sju månaders reserv förhandlar med banken i stark position.\n3️⃣ FÄLLORNA OCH MUREN. Faciliteten är reserv bara tills den behövs som mest: en kredit banken får säga upp vid nyckeltalsbrott är borta i samma chock som tömmer kassan (covenanternas mekanik ägs av kapitalstruktur-kursen — knappen nedan). I koncerner kan kassan sitta i dotterbolag där moderbolaget inte fritt kan förfoga över den. Att räkna 260,0 i stället för 206,4 netto överdriver reserven med allt som skatten tar, och förbrukningstalet från ett starkt kvartal underskattar den annualiserade förbrukningen. Störst blir läsningen tillsammans med refinansieringsmuren: ligger muren (st-05, tidsaxel-lagrets ämne) INOM överlevnadstiden är den ett förnyelsekrav; ligger den EFTER har bolaget förhandlingsutrymme.\n\nI stabilitetskategorin finns ${stAntal} kurser — huvudkursen (${st06 ? st06.minuter + " min, " + st06.niva.toLowerCase() + " nivå" : "i registret"}) äger hela kedjan tre ben → överlevnadstid → muren. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "likviditetsreserv",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Likviditetsreserven", lank: "/kurser/st-06-likviditetsreserven", ikon: "🔗", beskrivning: "Reservens tre ben steg för steg" },
          { text: "Kursen: Refinansieringsmuren", lank: "/kurser/st-05-refinansieringsmuren", ikon: "🧱", beskrivning: "Reservens motpol i kalendern" },
          { text: "Kursen: Kassaflödesanalysen", lank: "/kurser/km-003-kassaflodesanalysen", ikon: "💧", beskrivning: "Förbrukningstalets källa" },
          { text: "Vad är Altman Z-score?", lank: "fragor:" + encodeURIComponent("vad är altman z-score?"), ikon: "🚨", beskrivning: "Systerns fråga: stresspoängen" },
          { text: "Vad är känslighetsanalys?", lank: "fragor:" + encodeURIComponent("vad är känslighetsanalys?"), ikon: "🧪", beskrivning: "Stabilitetsfamiljens grannämne" },
        ],
        motfraga: { text: "Vad är Altman Z-score?", kategori: "stabilitet" },
        fordjupa: { text: k.titel, lank: "/kurser/st-06-likviditetsreserven" },
      };
    },
  },
  {
    id: "konkursprognos",
    karnord: [
      "altman", "altmans", "z-score", "zscore", "konkursprognos",
      "konkursprognosen", "konkursrisk", "konkursrisken", "konkurs",
      "konkursen",
    ],
    starkord: [
      "poäng", "trappa", "gråzon", "kris", "obestånd",
      "rekonstruktion", "finansiell", "nöd",
    ],
    bygga: (reg) => {
      const stAntal = reg.filter((r) => r.kategori === "STABILITET").length;
      const kallor = [
        kursKalla(reg, "st-03-altman-z-score", "Läroplanen — de fem nyckeltalen med vikter, gråzonen och rörelsen"),
        kursKalla(reg, "st-01-soliditet-och-rantetackning", "Läroplanen — den svenska stabilitetsstandard modellen bygger på"),
        kursKalla(reg, "v12-intaktsstabilitet", "Läroplanen — stabilitetsfamiljens tredje ben (AKM1:s variabel V12)"),
        kursKalla(reg, "bk-01-balansrakningen", "Läroplanen — balansräkningen som en sammanhängande berättelse"),
      ];
      const k = kallor[0];
      const st03 = reg.find((r) => r.slug === "st-03-altman-z-score");
      return {
        text:
          `Konkurs är när bolaget inte längre kan betala sina förpliktelser — och konkursprognos är konsten att i förväg läsa stressen i balansräkningen. Altman Z-score är utbildningens klassiska svar: fem nyckeltal vikta till ett enda tal som kan följas kvartal efter kvartal (allt nedan är utbildning i hur modellen DEFINIERAS och RÄKNAS, med kursexemplets påhittade tal — inga omdömen om enskilda bolag):\n\n1️⃣ MODELLEN — FEM NYCKELTAL MED VIKTER. Originalformeln för börsnoterade tillverkare: Z = 1,2 × X1 + 1,4 × X2 + 3,3 × X3 + 0,6 × X4 + 1,0 × X5. X1 är rörelsekapital dividerat med totala tillgångar — likviditetens vikt i hela kroppen. X2 är balanserat resultat (behållna vinster) dividerat med totala tillgångar — historiens buffert: bolag som ackumulerat vinster har en kudde, bolag som ätit upp den har inte. X3 är rörelseresultatet dividerat med totala tillgångar — verksamhetens egen kraft. X4 är börsvärdet dividerat med bokförd räntebärande skuld — finansieringens risk. X5 är omsättningen dividerat med totala tillgångar — kapitalomsättningen. Tre av fem termer vilar på balansräkningen (bk-01), och modellen är i praktiken AKM1-stabilitetsfamiljens sätt att väga sig själv: X1 är likviditetsbenet, X4 skuldstrukturens, X2 och X3 historia och kraft.\n2️⃣ RÄKNEEXEMPLET — Z STEG FÖR STEG. Ett tillverkningsbolag med totala tillgångar 2 000 Mkr. Rörelsekapital: kundfordringar 400 + lager 350 − leverantörsskulder 250 = 500 ⇒ X1 = 500 ÷ 2 000 = 0,25. Balanserat resultat 360 ⇒ X2 = 0,18. Rörelseresultat 130 ⇒ X3 = 0,065. Börsvärde 1 600 mot räntebärande skuld 2 000 ⇒ X4 = 0,80. Omsättning 2 300 ⇒ X5 = 1,15. Vikterna: 1,2 × 0,25 = 0,300; 1,4 × 0,18 = 0,252; 3,3 × 0,065 = 0,2145; 0,6 × 0,80 = 0,480; 1,0 × 1,15 = 1,150. Summan: 0,300 + 0,252 + 0,2145 + 0,480 + 1,150 = 2,3965 — avrundat 2,40.\n3️⃣ GRÄNSERNA, RÖRELSEN OCH MODELLENS EGENA GRÄNSER. Originalmodellens gränsvärden: Z över 2,99 är säker zon, mellan 1,81 och 2,99 gråzonen, under 1,81 stresszonen. Exemplets 2,40 ligger nästan exakt mitt i gråzonen — och tolkningen blir därför inte «stressat» och inte «säkert» utan «modellen kräver vidare läsning»: en svag lönsamhetsterm drar mot stresszon medan kapitalomsättningen håller uppe. Rörelserna är minst lika informativa som nivåerna: ett Z som faller från 3,4 till 2,4 under tre år är en starkare varning än ett stabilt 2,2, för termerna rör sig i takt — bufferten äts, resultatet trycks och lånet växer. Och modellens egna gränser är en del av utbildningen: formeln är tränad på historisk data (bakåtblickande), den är gjord för börsnoterade tillverkare (för privata bolag byts börsvärdet i X4 mot bokfört eget kapital), och bokförd skuld fångar inte alla förpliktelser. Tillsammans med reservens tre ben och känslighetsanalysen blir Z-poängen stabilitetsläsningens farkost — inte dess domare.\n\nI stabilitetskategorin finns ${stAntal} kurser — huvudkursen (${st03 ? st03.minuter + " min, " + st03.niva.toLowerCase() + " nivå" : "i registret"}) räcker från de fem termerna till gränsernas tolkning. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "konkursprognos",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Konkursprognos — Altman Z-score", lank: "/kurser/st-03-altman-z-score", ikon: "🔗", beskrivning: "Från termerna till gråzonen" },
          { text: "Kursen: Soliditet & räntetäckning", lank: "/kurser/st-01-soliditet-och-rantetackning", ikon: "🏛️", beskrivning: "Svensk stabilitetsstandard" },
          { text: "Kursen: Intäktsstabilitet", lank: "/kurser/v12-intaktsstabilitet", ikon: "📶", beskrivning: "Familjens tredje ben" },
          { text: "Vad är likviditetsreserven?", lank: "fragor:" + encodeURIComponent("vad är likviditetsreserven?"), ikon: "🏊", beskrivning: "Systerns fråga: hur länge räcker kassan?" },
          { text: "Vad är känslighetsanalys?", lank: "fragor:" + encodeURIComponent("vad är känslighetsanalys?"), ikon: "🧪", beskrivning: "Stresstestets grannämne" },
        ],
        motfraga: { text: "Vad är likviditetsreserven?", kategori: "stabilitet" },
        fordjupa: { text: k.titel, lank: "/kurser/st-03-altman-z-score" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de två överlevnadsdjup-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltOverlevnadsdjup(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of OVERLEVNADSDJUP_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
