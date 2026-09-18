/**
 * AI-MENTORN 2.0 — BETEENDEMEKANIK-FÖRHANDSFRÅGOR (spår 6, omgång 20, s6-u3).
 *
 * Tre källmärkta förhandsfrågor ovanpå de fyrtio committade lagren —
 * psykologins tysta mekanismer, hur hjärnans genvägar styr bedömningar
 * utan att man märker det:
 *   1. Priming ("vad är priming?") — omedvetna influenser
 *      (bf-08 primär + bf-01 + km-036 som källor)
 *   2. Tillgänglighetsfällan ("vad är tillgänglighetsfällan?") — minnet
 *      som sannolikhetsmätare (bf-01 primär + bf-08 + bf-07 som källor)
 *   3. Övermod ("vad är övermod?") — kompetensillusionen
 *      (km-036 primär + bf-10 + bf-07 som källor)
 *
 * REGISTERBÄRNING: 5 mentorväglösa kurser aktiveras (246 → 251 av 426 nådda
 * enligt sondens genomräkning): bf-08, bf-01, km-036 som primära + bf-10,
 * bf-07 som källor — varje källa en äkta slug i KURSREGISTER (kedjetestets
 * E-fall vakar). BETEENDEFINANS var 9 kurser mentorväglösa i rond 1.
 *
 * ÄMNESVAL EFTER SOND I TRE RONDER (verktyg/_s6u3-sond-omg20.mjs +
 * _s6u3-sond2-omg20.mjs + _s6u3-sond3-omg20.mjs, otrackade; 40 motorer /
 * 1 259 kärnord LIVE-lästa ur src/ med den riktiga matchern + diskutläsning
 * av ev. syskonmoduler):
 *   • Rond 1: genomräkning — 180 kurser mentorväglösa; BOKMASTER 69 (störst
 *     men basens "böcker"-monster äger delar av territoriet: "intelligent
 *     investor", "phil fisher", "thinking fast and slow" alla fångade),
 *     CASE 16, BETEENDEFINANS 9, VÄRDERINGSMETODER 8. 19/27 kandidater
 *     fria — priming/overconfidence/ESG/bedrägeri/insynshandel/EMH m.fl.
 *   • Rond 2 DÖDADE halo + dunning-kruger som kärnord: basens beteende-
 *     monster äger redan "halo effekt"- och dunning-familjerna (frågorna
 *     "vad är halo-effekten?" och "vad är dunning-kruger?" fångas av
 *     svaraLokalt) och grannsvepet bevisade konflikten ("haloeffekt" ↔
 *     "halo effekt" inom tolerans 2). bf-09 och bf-10 bärs här ENDAST som
 *     KÄLLOR (V19-precedensen: källägande ≠ kärnordsägande).
 *   • Rond 3: den justerade familjen GRÖN — 0 kärnordsgrannar mot 1 259
 *     kedjekärnord, 10/12 kanoniska frågor NULL genom kedjan, 0 främmande
 *     i prototyp-stöldprovet mot 1 259 kanoniska kedjefrågor.
 *
 * DOKUMENTERADE GRÄNSER (rond 3:s två fångade kontroller — inte mina
 * kärnord, inte mina knappar i deras formulering):
 *   • Nybörjar-frågor ("är nybörjare övermodiga …?") fångas av basens
 *     "borja"-monster — ordet "nybörjare" bärs aldrig här.
 *   • "kalibrering" är förväntningsdjupets kärnord — det ordet ägs där;
 *     deras formulering "vad är kalibrering av beslut?" länkas som knapp
 *     från övermod-svaret (knappen landar aldrig null — kedjan fångar).
 *   • Beteendedjupet äger sina etablerade bias-ord (förlustaversion med
 *     syskon); "vad är förlustaversion?" bärs som knapp (deras ämne).
 *
 * Aritmetiken i alla tre svar (påhittade tal, maskinellt omräknade i
 * regressionstestets D-fall):
 *   • Priming: 35 − 15 = 20 procentenheters glipa; 35 ÷ 15 ≈ 2,3×.
 *   • Tillgänglighet: 18 ÷ 2 = 9× överdrift; 40 av 100 rubriker = 40 %
 *     av minnesbildens yta mot 2 % av verkligheten = 20× övervikt.
 *   • Övermod: 80 − 50 = 30 procentenheter (förarmodellen); 90 − 60 = 30
 *     procentenheter (konfidensglipan); självbild 7 mot test 4 = +3 skalsteg.
 *
 * Matchningen speglar motorns hjälpfunktioner (samma lösning som alla
 * syskinlagren: Node type-stripping löser endast `import type`, så de rena
 * funktionerna speglas hit). Semantisk likhet med motorn BEVISAS av testets
 * felstavningsfall (B) och determinismfall (C). Driftvarning: ändras motorns
 * matchning måste denna spegel följa — testfall B vakar.
 *
 * SAMMANSÄTTNING (chat-widget.tsx) — detta lager levereras SIST (efter
 * sektorskola2, kedjans 40:e motor) och kan därför aldrig stjäla en fråga
 * från ett tidigare lager; det fångar bara frågor som alla lager före det
 * lämnar null på. Omvänt vaktar testfall I på att dessa frågor INTE fångas
 * av kedjan utan detta lager (dupliceringsskydd).
 *
 * ── JURIDIKGRINDEN (lagen 2007:528) ──────────────────────────────────
 * All text är pedagogisk utbildning om hur tre kognitiva mekanismer
 * DEFINIERAS, MÄTS och MOTVERKAS i beslutsprocesser — inga köp-/säljsignaler,
 * inga placeringstips, inga omdömen om enskilda börsbolag (exemplen talar
 * om påhittade experiment och grupper). Psykologiämnet framingas som
 * utbildning i beslutsprocesser, inte som handelsrådgivning.
 *
 * ── DEPENDENCY-INJECTION (samma mönster som hela motorn) ─────────────
 * Registret skickas IN som parameter (endast `import type`) så att
 * verktyg/testa-ai-mentor-beteendemekanik.mjs kan köra filen direkt i Node.
 * Alla källkurser (bf-08-priming, bf-01-tillganglighetsfalla,
 * km-036-overconfidence, bf-10-dunningkruger, bf-07-framstegseffekt) finns
 * i KURSREGISTER (verifierat i 426-registret; kursKalla faller tillbaka på
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

// ── De 3 beteendemekanik-frågorna ───────────────────────────────────────────

export const BETEENDEMEKANIK_MONSTER: FragMonster[] = [
  {
    id: "priming",
    karnord: ["priming", "primingeffekt", "primingeffekten", "omedvetna influenser"],
    starkord: [
      "omedveten", "intryck", "rubrik", "rubriker", "exponering",
      "påverkan", "beslut", "hjärna", "psykologi",
    ],
    bygga: (reg) => {
      const bfAntal = reg.filter((r) => r.kategori === "BETEENDEFINANS").length;
      const kallor = [
        kursKalla(reg, "bf-08-priming", "Läroplanen — mekanismen: hur tidigare intryck styr nästa bedömning"),
        kursKalla(reg, "bf-01-tillganglighetsfalla", "Läroplanen — systermekanismen: det minns lätt bedöms vanligt"),
        kursKalla(reg, "km-036-overconfidence", "Läroplanen — tredje benet: påverkad tro blir överskattad träffsäkerhet"),
      ];
      const k = kallor[0];
      const bf08 = reg.find((r) => r.slug === "bf-08-priming");
      return {
        text:
          `Priming är att det du mötte sist i tiden blir din måttstock nästa gång — utan att du märker det (allt nedan är utbildning i hur mekanismen DEFINIERAS och MÄTS i beslutsprocesser — påhittade exempel, inga placeringstips):\n\n1️⃣ MEKANISMEN — AKTIVERINGEN FÖRE BEDÖMNINGEN. Hjärnan tolkar inte världen från noll: varje bedömning börjar från det som redan är aktiverat. Läser du fem negativa rubriker om en bransch på morgonen och öppnar en årsredovisning på eftermiddagen far analysen strängare — inte för att siffrorna ändrats, utan för att startläget gjorde det. Pedagogiska övningsexperiment med påhittade tal: den grupp som läst negativa rubriker satte sannolikheten för börsfall till 35 procent, kontrollgruppen utan rubriker till 15 — glipan 35 − 15 = 20 procentenheter och förhållandet 35 ÷ 15 ≈ 2,3 gånger, utan att en enda ny uppgift om bolaget tillkommit. Det är primingens signatur: rörelse utan information.\n2️⃣ VAR PÅVERKAN SITTER I KEDJAN. Mekanismen syns i hela beslutskedjan: nyhetsflödet före köpbeslutet, forumtrådar mellan två analyser, till och med ordningen man läser bolagets egna dokument i (vd-ordet före sifferbilagan sätter tonen — samma siffror lästa i omvänd ordning väger annorlunda). Den farliga egenskapen är att påverkan lämnar MINNESSPÅR: senare tror man att slutsatsen var ens egen analys. Därför är frågan att ställa sig inte "är jag påverkad?" (det är man alltid) utan "VAR tog jag in underlaget, och i vilken ordning?" — exponeringens källordning är mekanismens reglage.\n3️⃣ MOTGIFTET — SKRIV TESSEN FÖRE EXONERINGEN. Tre övningar ur utbildningslitteraturen: (1) beslutsdagboken — skriv ner tes och sannolikhet FÖRE nyhetsläsningen, så blir skillnaden mot efteråt synlig och mätbar; (2) källordning med rapports före reportage — primärkällan först, tolkningen efter; (3) exponeringsfönster — pausa flödet en timme före ett beslut och läs endast bolagets egna siffror. Syskonmekanismerna fördjupar: tillgänglighetsfällan (knappen nedan) är minnets variant av samma svaghet, och övermod är vad som händer när den påverkade tron möter en otestad träffsäkerhet.\n\nI beteendefinans-kategorin finns ${bfAntal} kurser — huvudkursen (${bf08 ? bf08.minuter + " min, " + bf08.niva.toLowerCase() + " nivå" : "i registret"}) går igenom hela mekanismen med övningar. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "priming",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Priming", lank: "/kurser/bf-08-priming", ikon: "🔗", beskrivning: "Omedvetna influenser" },
          { text: "Kursen: Tillgänglighetsfällan", lank: "/kurser/bf-01-tillganglighetsfalla", ikon: "🌀", beskrivning: "Minnets variant" },
          { text: "Kursen: Overconfidence", lank: "/kurser/km-036-overconfidence", ikon: "📐", beskrivning: "Påverkade trons mått" },
          { text: "Vad är tillgänglighetsfällan?", lank: "fragor:" + encodeURIComponent("vad är tillgänglighetsfällan?"), ikon: "🧠", beskrivning: "Syskonmekanismen" },
          { text: "Vad är en halo-effekt?", lank: "fragor:" + encodeURIComponent("vad är en halo-effekt?"), ikon: "✨", beskrivning: "Ett drag färgar helheten" },
        ],
        motfraga: { text: "Vad är tillgänglighetsfällan?", kategori: "beteende" },
        fordjupa: { text: k.titel, lank: "/kurser/bf-08-priming" },
      };
    },
  },
  {
    id: "tillganglighetsfalla",
    karnord: [
      "tillgänglighetsfälla", "tillgänglighetsfällan", "tillgänglighetsfalla",
      "tillgänglighetsheuristik",
    ],
    starkord: [
      "minne", "minns", "nyhet", "nyheter", "rubrik", "rubriker",
      "frekvens", "sannolikhet", "lätt", "bild", "uppskattar",
    ],
    bygga: (reg) => {
      const bfAntal = reg.filter((r) => r.kategori === "BETEENDEFINANS").length;
      const kallor = [
        kursKalla(reg, "bf-01-tillganglighetsfalla", "Läroplanen — fällan: minnets lätthet läses som sannolikhet"),
        kursKalla(reg, "bf-08-priming", "Läroplanen — systermekanismen: exponeringen som aktiverar minnet"),
        kursKalla(reg, "bf-07-framstegseffekt", "Läroplanen — minnessystern i ropet: det pågående känns viktigare"),
      ];
      const k = kallor[0];
      const bf01 = reg.find((r) => r.slug === "bf-01-tillganglighetsfalla");
      return {
        text:
          `Tillgänglighetsfällan är att hjärnan använder minnets lätthet som sannolikhetsmätare: det som kommer snabbt i minnet bedöms vanligare än det är (allt nedan är utbildning i hur fällan DEFINIERAS och MÄTS — påhittade exempel, inga placeringstips):\n\n1️⃣ FÄLLAN — LÄTT I MINNET LIKA MED VANLIGT I VÄRLDEN. Nyhetsflödets urvalslogik är fällans motor: det sällsynta är nytt, det nya trycks fram, det framtryckta minns — och cirkeln är sluten. Övningsexemplet med påhittade tal: är verklig frekvens av konkurser i en bransch 2 procent per år, men en enskild stor konkurs fyller en månad av rubriker, bedömer hushållen sedan risken till 18 procent — överdriften 18 ÷ 2 = 9 gånger, utan att något nytt hänt i ekonomin. Räknat på minnesbildens yta: är 40 av 100 lästa rubriker om kriser (40 procent av exponeringen) medan kriser utgör 2 procent av verkligheten blir minnesövervikten 40 ÷ 2 = 20 gånger. Fällan slår åt båda håll: i uppgångar minns alla berättelserna om tjänade miljoner ("alla tjänar på aktier") och risken suddas ut — glömskan är samma mekanism spegelvänt.\n2️⃣ MÄTNINGEN — SKILJ MINNET FRÅN VERKLIGHETEN. Fällans diagnostik är en enkel tvåfrågeövning: "Hur vanligt tror du att X är?" följt av "Varifrån har du bilden?" — kan svaret på den andra frågan bara vara "nyheterna" eller "en story" och inte data, är siffran i den första tillgänglighetens, inte verklighetens. Detta är skillnaden mot priming (syskonmekanismen, knappen nedan): priming handlar om ordningen i intrycken, tillgängligheten om urvalet i minnet. Framstegseffekten är den tredje systern: det som sker just nu känns större bara för att det ligger närmast i tiden.\n3️⃣ MOTGIFTET — BASLINJEN FÖRE BILDEN. Tre övningar: (1) frekvensförst — slå upp den verkliga långsiktiga frekvensen (konkursstatistik, historiska utfall) FÖRE bedömningen av det aktuella; (2) minnesrevision — fråga sig "vilka fall KOMMER INTE i minnet?" (de tusen bolag som inte kollapsade syns aldrig i flödet); (3) kvantifiera storyn — när en berättelse känns sannolik, leta den siffra som skulle göra den VANLIG och jämför med baslinjen. Baslinjen är motgiftet: siffran som inte minns men ändå räknas.\n\nI beteendefinans-kategorin finns ${bfAntal} kurser — huvudkursen (${bf01 ? bf01.minuter + " min, " + bf01.niva.toLowerCase() + " nivå" : "i registret"}) äger hela fällan från mekanism till motgift. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "tillganglighet",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Tillgänglighetsfällan", lank: "/kurser/bf-01-tillganglighetsfalla", ikon: "🔗", beskrivning: "Minnets måttstock" },
          { text: "Kursen: Framstegseffekten", lank: "/kurser/bf-07-framstegseffekt", ikon: "⏳", beskrivning: "Närliggande i tiden" },
          { text: "Kursen: Priming", lank: "/kurser/bf-08-priming", ikon: "🧠", beskrivning: "Exponeringens kraft" },
          { text: "Vad är priming?", lank: "fragor:" + encodeURIComponent("vad är priming?"), ikon: "🧠", beskrivning: "Syskonmekanismen" },
          { text: "Vad är förlustaversion?", lank: "fragor:" + encodeURIComponent("vad är förlustaversion?"), ikon: "⚖️", beskrivning: "Förlustens dubbla vikt" },
        ],
        motfraga: { text: "Vad är övermod?", kategori: "beteende" },
        fordjupa: { text: k.titel, lank: "/kurser/bf-01-tillganglighetsfalla" },
      };
    },
  },
  {
    id: "overmod",
    karnord: ["övermod", "overconfidence", "kompetensillusion"], // böjnings-
    // formerna "övermodig/övermodigt" medvetet EJ kärnord: basens "borja"-
    // monster äger nybörjar-frågorna och "är nybörjare övermodiga …?" ska
    // förbli deras (rond 3:s dokumenterade gräns, vakad av modultestets G01).
    starkord: [
      "träffsäkerhet", "självförtroende", "kunskap", "kunskaper",
      "osäkerhet", "uppskattar", "rankar", "egna", "färdighet",
    ],
    bygga: (reg) => {
      const bfAntal = reg.filter((r) => r.kategori === "BETEENDEFINANS").length;
      const kallor = [
        kursKalla(reg, "km-036-overconfidence", "Läroplanen — illusionen: tron på egen träffsäkerhet över det egna kunskapsläget"),
        kursKalla(reg, "bf-10-dunningkruger", "Läroplanen — kurvan: lite kunskap ger hög självbild, mest för att man saknar kartan"),
        kursKalla(reg, "bf-07-framstegseffekt", "Läroplanen — bränslet: tidiga framgångar feltolkas som metod"),
      ];
      const k = kallor[0];
      const km036 = reg.find((r) => r.slug === "km-036-overconfidence");
      return {
        text:
          `Övermod (overconfidence) är den systematiska överskattningen av den egna träffsäkerheten — inte ett pejorativt ord utan ett mätbart bias med tre klassiska prov (allt nedan är utbildning i hur illusionen DEFINIERAS och MÄTS — påhittade exempel, inga placeringstips):\n\n1️⃣ DE TRE PROVEN. Förarprovet: i klassiska enkäter rankar omkring 80 procent av bilisterna sig som bättre än genomsnittet — matematiskt kan högst 50 procent ligga över medianen, glipan 80 − 50 = 30 procentenheter är övermodets fotavtryck. Konfidensprovet: om man får ange 90-procentiga konfidensintervall ("jag är 90 procent säker på att vinsten landar mellan X och Y") och intervallen bara träffar 60 procent av gångerna är glipan 90 − 60 = 30 procentenheter mellan trodd och verklig träffsäkerhet. Kunskapsprovet: på en tiogradig kunskapsskala bedömer sig ägare med två månaders erfarenhet i medeltal till 7 när ett prov ger 4 — övervurderingen +3 skalsteg är Dunning-Kruger-kurvans första topp (kurvan, knappen nedan): lite kunskap ger HÖG självbild, delvis för att man saknar kartan över det man ännu inte kan.\n2️⃣ VAR I KEDJAN SITTER ÖVERMODET. Mekanismen förstärks av sina systrar: framstegseffekten (tidiga framgångar i en uppgång feltolkas som metod — marknaden belönar, inte sällan, bara risktagandet) och exponeringen (efter en period av bekräftande nyheter känns träffsäkerheten högre utan att ny kunskap tillkommit). Konsekvenserna i en portfölj är klassiskt tre: koncentration ("jag behöver inga fler bolag"), för kort tidshorisont ("jag hinner agera före") och för stora positioner relaterat till hur väl processen är bevisad. Notera ordningen: övermodet slår på POSITIONENS storlek och FREKVENSEN av beslut, sällan på själva analysen — analysen kan vara korrekt medan risktagandet ändå vilar på en otestad träffsäkerhet.\n3️⃣ MOTGIFTET — MÄT TRÄFFSÄKERHETEN SOM EN VANA. Fyra övningar: (1) förutsägelser med datum — skriv ner förväntade utfall och tidsramar, och RÄKNA träffprocenten kvartalsvis (kalibreringens matte ägs av förväntningsdjupet — knappen nedan); (2) baslinjejämförelse — "vad skulle en enkel regel ha gjort?" innan resultatet krediteras skicklighet; (3) intervalldisiplin — byt punktskattningar mot intervall och granska täckningen; (4) kunskapstrappan — räkna vilka områden man kan RÄTTA andra i (ett tecken på verklig nivå) mot dem man bara läst om. Gemensam nämnare: övermod motas inte av ödmjukhet utan av mätning — träffsäkerhet som mäts, kalibreras.\n\nI beteendefinans-kategorin finns ${bfAntal} kurser — huvudkursen (${km036 ? km036.minuter + " min, " + km036.niva.toLowerCase() + " nivå" : "i registret"}) äger de tre proven och motgiften. Som alltid: detta är utbildning i en metod — inga placeringstips.` +
          kallradFler(kallor),
        amne: "overmod",
        kalla: k,
        kallor,
        handlings: [
          { text: "Kursen: Overconfidence", lank: "/kurser/km-036-overconfidence", ikon: "🔗", beskrivning: "De tre proven" },
          { text: "Kursen: Dunning-Kruger", lank: "/kurser/bf-10-dunningkruger", ikon: "⛰️", beskrivning: "Kurvans första topp" },
          { text: "Kursen: Framstegseffekten", lank: "/kurser/bf-07-framstegseffekt", ikon: "⏳", beskrivning: "Bränslet feltolkat" },
          { text: "Vad är kalibrering av beslut?", lank: "fragor:" + encodeURIComponent("vad är kalibrering av beslut?"), ikon: "🎯", beskrivning: "Träffsäkerhet som vana" },
          { text: "Vad är priming?", lank: "fragor:" + encodeURIComponent("vad är priming?"), ikon: "🧠", beskrivning: "Syskonmekanismen" },
        ],
        motfraga: { text: "Vad är priming?", kategori: "beteende" },
        fordjupa: { text: k.titel, lank: "/kurser/km-036-overconfidence" },
      };
    },
  },
];

// ── Huvudingången ──────────────────────────────────────────────────────────

/**
 * Svara lokalt med NÅGOT av de tre beteendemekanik-mönstren — eller null
 * (då har hela kedjan före redan lämnat null och API-flödet tar över som
 * förr). Ligger SIST i widgetens kedja och kan därför aldrig stjäla en
 * fråga från tidigare lager. Samma matchningssemantik som basmotorn:
 * minst ett kärnord krävs, poäng = kärnord × 3 + stärkord, oavgjort →
 * först deklarerade mönstret vinner (strikt >, deterministiskt). Samma
 * fråga ⇒ bitidentiskt svar.
 */
export function svaraLokaltBeteendemekanik(fraga: string, register: RegisterRad[]): LokaltSvar | null {
  const fragaStr = diafri(fraga);
  if (!fragaStr) return null;
  const fragaOrd = fragaStr.split(" ");
  let bast: { svar: LokaltSvar; poang: number } | null = null;
  for (const m of BETEENDEMEKANIK_MONSTER) {
    const karnTraff = m.karnord.filter((nk) => traff(fragaOrd, fragaStr, nk));
    if (karnTraff.length === 0) continue; // krav: minst ett kärnord
    const starkTraff = m.starkord?.filter((nk) => traff(fragaOrd, fragaStr, nk)) ?? [];
    const poang = karnTraff.length * 3 + starkTraff.length;
    if (!bast || poang > bast.poang) bast = { svar: m.bygga(register), poang };
  }
  return bast ? bast.svar : null;
}
