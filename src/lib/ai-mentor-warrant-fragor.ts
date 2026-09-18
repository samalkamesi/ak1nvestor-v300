/**
 * AI-MENTORN 2.0 — WARRANT-FÖRHANDSFRÅGA (spår 6, omgång 16, s6-u1).
 *
 * EN ytterligare källmärkt förhandsfråga ovanpå de 30 tidigare lagren
 * (basens MONSTER i ai-mentor-svar.ts + makro, extra, nästa,
 * kapitalmekanik, sektor, case, praktik, portföljgrund, ägande,
 * redovisningsdjup, djup, historia, lönsamhetsdjup, tsdjup, skattedjup,
 * beteendedjup, riskdjup, riskmåttsdjup, utdelningsdjup, förväntningsdjup,
 * portföljbalans, stabilitetsdjup, grahamgolv, värderingsjustering,
 * optionsdjup, riskläsningsdjup, avkastningskurva, avräkningsdjup och
 * värderingsverktyg):
 *   1. Warranter och teckningsoptioner (od-03 primär + ks-04-emissionens-
 *      mekanik + od-01-optionens-greker + od-02-implicit-volatilitet) —
 *      optionen möter den svenska emissionen: tre instrument som låter
 *      lika, värdets två delar, utspädningens räkneläge och hävstångens
 *      dubbelskepp
 *
 * ÄMNESVAL EFTER SOND (verktyg/_s6u1-sond-omg16.mjs — hela 30-lagers-
 * kedjan LIVE med riktiga matchern): omgång 15:s bokförda fribit gäller
 * fortfarande — «vad är warrant?», «vad är warranter?», «hur fungerar
 * warranter?», «vad är en teckningsoption?», «vad är teckningsoptioner?»,
 * «hur fungerar teckningsoptioner?», «vad är en emissionsrätt?» och «vad
 * är emissionsrätter?» är SAMTLIGA NULL genom kedjan. Länkräkningen
 * visar od-03-warranter-och-teckningsoptioner och ks-04-emissionens-
 * mekanik OLÄNKADE — detta lager aktiverar två döda kurser (spårets
 * "fler kurslänkar per svar").
 *
 * ANSVARSFÖRDELNING (V19-precedensen — kärnordsägande är territoriellt;
 * syskonlagrens dokumentationsplikt, testfall G/G2/H/I bevisar båda
 * vägarna):
 *   • Nästa-lagret äger NAKTA OPTION-ORDEN — sondbevis: «skillnaden
 *     mellan warrant och option» ⇒ nästa (deras kärnord option/optioner/
 *     optionen/options). Detta lager äger ENDAST sammansättningarna
 *     warrant/warranter + teckningsoption-familjen + emissionsrätts-
 *     familjen — orden deras uppslag saknar. Frågor med naket option-ord
 *     fångas av kedjan FÖRE detta lager och når det aldrig.
 *   • Extra-lagrets moat-monster fångar «warrant mot option» via kärnordet
 *     moat («mot» ligger redigeringstavstånd 1 från «moat», som tål 1
 *     fel) — dokumenterad granne; korta ord som «mot»/«och» är därför
 *     ALDRIG kärnord här.
 *   • Kapitalmekaniken äger EMISSIONSFAMILJEN (teckningsrätt, teckna,
 *     nyemission, utspädning, företrädesrätt) — sondbevis: emissionens
 *     mekanik bor där. Närhetstecken: teckningsoption↔teckningsrätt är
 *     redigeringstavstånd 5, långt utanför matcharens tolerans (≤2) i
 *     båda riktningar — deras frågor når dem, våra når oss. Tecknings-
 *     rätt/utspädning/nyemission är STARKORD här (läsord efter kärnords-
 *     träff i det egna monstret, kan aldrig fånga en fråga ensamma) och
 *     målet för lagrets fragor:-knapp (tidigare-lager-kravet).
 *   • Skattedjupet äger aktieoption/personaloption (beskattningsvägarna)
 *     och optionsdjupet köpoptionen/säljoptionen (börsoptionerna) —
 *     båda lämnas åt sina ägare; nakna option-ord är starkord här.
 *
 * MATCHNINGEN speglar motorns hjälpfunktioner (samma lösning som alla
 * syskonlager: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av
 * testets felstavningfall (B) och determinismfall (C). Driftvarning:
 * ändras motorns matchning måste denna spegel följa — testfall B vaktar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx):
 *   svaraLokaltMakro(q, KURSREGISTER)
 *     ?? … (kedjans 30 lager, se widgeten) …
 *     ?? svaraLokaltVarderingsverktyg(q, KURSREGISTER)
 *     ?? svaraLokaltWarrant(q, KURSREGISTER)
 * Detta lager ligger SIST i kedjan och kan därför ALDRIG stjäla en fråga
 * från tidigare lager — det fångar bara frågor som alla andra lämnar null
 * på. Omvänt vaktar testfall I på att den kanoniska frågan INTE fångas av
 * kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur instrumenten är byggda och
 * hur emissionskommunikén läses — inga placeringstips, inga omdömen om
 * enskilda emissioner eller warranter, inga avrådan. Samtliga tal är
 * aritmetiska illustrationer med påhittade nivåer (12,00/10,00 kr osv.)
 * tagna ur kursens genomräknade exempel, aldrig utfästelser; fällorna
 * presenteras som läsregler, inte som handlingsråd.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-warrant.mjs kan köra filen direkt i Node.
 * Alla källkurser (od-03-warranter-och-teckningsoptioner, ks-04-
 * emissionens-mekanik, od-01-optionens-greker, od-02-implicit-
 * volatilitet) finns i KURSREGISTER (verifierat mot 408-registret;
 * kursKalla faller tillbaka på "Läroplanen" om ett framtide register
 * läcker en slug).
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

// ── Den 1 warrantfrågan ────────────────────────────────────────────────────

export const WARRANT_MONSTER: FragMonster[] = [
  {
    id: "warranter",
    karnord: [
      // Warrant-familjen (engelskt lån i svensk text — böjningar med):
      "warrant", "warranter", "warranten", "warranterna",
      // Teckningsoption-familjen (svenska sammansättningar, ≥ 12 tkn —
      // granngaranti mot kapitalmekanikens teckningsrätt dokumenterad av
      // sonden: redigeringstavstånd 5, matchar-toleransen är 2):
      "teckningsoption", "teckningsoptioner", "teckningsoptionen",
      // Emissionsrätts-familjen (δ = INGA grannar i 943 syskonkärnord):
      "emissionsrätt", "emissionsrätter", "emissionsrätten",
      // Räkneverbens fasta nivåer (d=4 från teckningsrätt — säkra):
      "teckningskurs", "teckningspris",
      // Kursens egen titelfras (includes-matchning):
      "warranter och teckningsoptioner",
    ],
    starkord: [
      // Nakna option-ord ägs av nästa-lagret, emissionsfamiljen av
      // kapitalmekaniken — här endast läsord efter kärnordsträff:
      "option", "optioner", "aktie", "aktier", "emission", "nyemission",
      "utspädning", "teckningsrätt", "teckna", "hävstång", "löptid",
      "tidsvärde", "inre värde", "underliggande", "bank", "lösen",
      "greker", "volatilitet", "premie", "värdepapper",
    ],
    bygga: (reg) => {
      const odAntal = reg.filter((r) => r.kategori === "OPTIONS & DERIVAT").length;
      const ksAntal = reg.filter((r) => r.kategori === "KAPITALSTRUKTUR").length;
      const kallor = [
        kursKalla(reg, "od-03-warranter-och-teckningsoptioner", "Läroplanen — options & derivat: instrumentens anatomi och fällor"),
        kursKalla(reg, "ks-04-emissionens-mekanik", "Läroplanen — kapitalstruktur: kvot, teckningsrätt och utspädningens aritmetik"),
        kursKalla(reg, "od-01-optionens-greker", "Läroplanen — options & derivat: delta, gamma, theta och vega"),
        kursKalla(reg, "od-02-implicit-volatilitet", "Läroplanen — options & derivat: marknadens pris på framtiden"),
      ];
      const k = kallor[0];
      const od03 = reg.find((r) => r.slug === "od-03-warranter-och-teckningsoptioner");
      const ks04 = reg.find((r) => r.slug === "ks-04-emissionens-mekanik");
      return {
        text:
          `Warranter och teckningsoptioner är optionens svenska ansikte — den svenska spararens första möte med optioner sker oftast inte på den amerikanska börsoptionsmarknaden utan i nyemissionens spår. Tre byggen bär hela läsningen (allt nedan är utbildning i hur instrumenten är byggda och läses — inga placeringstips, och samtliga tal är aritmetiska illustrationer ur kursens genomräknade exempel):\n\n1️⃣ TRE INSTRUMENT SOM LÅTER LIKA — teckningsrätten, teckningsoptionen och warranten. TECKNINGSRÄTTEN är rätten under en PÅGÅENDE emission: kort liv (veckor), delas till befintliga ägare, följer emissionskvoten — emissionens mekanik är kapitalmekanikens område (knappen nedan). TECKNINGSOPTIONEN är ett omsättningsbart värdepapper med månadslång löptid: rätten att teckna nya aktier till en fast teckningskurs fram till en bestämd dag, ofta del av emissionspaketet när bolaget vill betala delar av ett förvärv i framtida aktier. WARRANTEN ser ut som en aktierelaterad sparprodukt och handlas på börsen som en aktie — men den är emitterad av en BANK med bolagets aktie som underliggande, och därför uppstår INGEN ny aktie i bolaget när en warrant löses: ingen utspädning från själva warranten.\n2️⃣ VÄRDETS TVÅ DELAR — all optionprissättning, från nybörjarens papper till de avancerade modellerna, delar värdet i två. INRE VÄRDE = aktiekursen minus teckningskursen, och aldrig under noll: aktien till 12,00 kr med teckningskurs 10,00 kr ger inre värde 12,00 − 10,00 = 2,00 kr per option. TIDSVÄRDE = det som återstår av marknadspriset över det inre värdet — priset för hoppet fram till löptidens slut. En option till 2,40 kr när det inre värdet är 2,00 kr bär 0,40 kr tidsvärde; på sista dagen är tidsvärdet noll och kvar står bara det inre.\n3️⃣ UTSPÄDNINGENS RÄKNELÄGE — kursens signaturräkneläxa, varför optionerna i en emission aldrig är gratis. Påhittat bolag: 100 miljoner aktier till kursen 12,00 kr (marknadsvärde 1 200 miljoner kr) emitterar optioner på 10 miljoner nya aktier till teckningskursen 10,00 kr. Vid full lösen: 10 miljoner × 10,00 kr = 100 miljoner kr nytt kapital in i bolaget, och aktieantalet växer till 110 miljoner. Blandar ihop det gamla marknadsvärdet med det nya kapitalet — (1 200 + 100) ÷ 110 — ger det en teoretisk nivå om 11,82 kr per aktie: siffran 12,00 → 11,82 är utspädningstecknet (−1,5 %), och vinst per aktie delas på fler andelar även när totalvinsten växer. Vems räkning som står på skärmen — emissionens eller den enskilda ägarens — avgör vad utspädningen betyder.\n4️⃣ HÄVSTÅNGEN, DUBBELSKEPPAD — warrantens lilla pris rör sig i procent mångdubbelt kraftigare än aktien. Med warrantpriset 2,40 kr (2,00 kr inre + 0,40 kr tidsvärde) på en aktie till 12,00 kr: stiger aktien till 13,00 kr (+8,3 %) växer det inre värdet till 3,00 kr och warranten (samma tidsvärde) till 3,40 kr — +41,7 %, en hävstång om ungefär 5 gånger. Men sjunker aktien till 11,00 kr (−8,3 %) faller warranten till 1,40 kr (−41,7 %): exakt samma skepp går nedåt, och slutstationen är noll — ett tidsvärde som sinar på en option som aldrig kommer in i pengarna.\n5️⃣ TRE FÄLLOR MED NAMN — GRATISSTÄMPELN: optionerna i ett emissionspaket är aldrig gratis; de prissätts in i emissionsvillkoret (teckningskursen ligger under marknadskursen just för att optionen har värde). TIDEN: lång löptid känns som stort hopp men tidsvärdet äts av kalendern — det är optionens greker (theta) som talar om takten. UTSPÄDNINGSLÄGET: läs emissionskommunikén med optionsspåret synligt — hur många optioner, till vilken teckningskurs, och vad full lösen gör med antalet aktier; hantverket är mästerskapskapitlets egen övning.\n\nI kategorin options & derivat finns ${odAntal} kurser och i kapitalstruktur ${ksAntal} — warranterna och teckningsoptionerna (${od03 ? od03.minuter + " min" : "i registret"}) och emissionens mekanik (${ks04 ? ks04.minuter + " min" : "i registret"}) är spårets två ändar, med optionens greker och implicit volatilitet som prissättningens fördjupning. Som alltid: detta är utbildning i att läsa instrumenten — ingen kommentar om nuläget och inga placeringstips.` +
          kallradFler(kallor),
        amne: "warranter",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Warranter och teckningsoptioner", lank: "/kurser/od-03-warranter-och-teckningsoptioner", ikon: "🎟️", beskrivning: "Instrumentens anatomi och fällorna med namn" },
          { text: "Kursen: Emissionens mekanik", lank: "/kurser/ks-04-emissionens-mekanik", ikon: "🧮", beskrivning: "Kvot, teckningsrätt och utspädningens aritmetik" },
          { text: "Kursen: Optionens greker", lank: "/kurser/od-01-optionens-greker", ikon: " theta ", beskrivning: "Delta, gamma, theta och vega" },
          { text: "Kursen: Implicit volatilitet", lank: "/kurser/od-02-implicit-volatilitet", ikon: "📉", beskrivning: "Marknadens pris på framtiden" },
          { text: "Vad är teckningsrätt?", lank: "fragor:" + encodeURIComponent("vad är teckningsrätt?"), ikon: "🪞", beskrivning: "Kapitalmekanikens emissionsgrund — ett tidigare lager" },
        ],
        motfraga: { text: "Vad är utspädning?", kategori: "kapitalmekanik" },
        fordjupa: { text: k.titel, lank: "/kurser/od-03-warranter-och-teckningsoptioner" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av warrant-mönstren — eller null (då har hela
 * kedjan före redan lämnat null och API-flödet tar över som förr). Ligger
 * SIST i widgetens kedja och kan därför aldrig stjäla en fråga från
 * tidigare lager. Samma matchningssemantik som basmotorn: minst ett
 * kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort → först
 * deklarerade mönstret vinner (strikt >, deterministiskt). Samma fråga ⇒
 * bitidentiskt svar.
 */
export function svaraLokaltWarrant(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of WARRANT_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
