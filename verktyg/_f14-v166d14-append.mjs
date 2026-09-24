#!/usr/bin/env node
// v166-d14 — appendar djupkapitel 16 "Från boken till egen analys" till
// come-into-my-trading-room.json enligt DESIGN-v166 (rond 174 [organ:Φ]).
// Underlag: data/forskning/KURS-FAS3/underlag-f14-trading-room.md (granskat v164).
// Append-only: kapitel 1–15, chapters_list-poster 1–15 och övriga fält RÖRS EJ.
import fs from "node:fs";

const SOKVAG = "data/bokmaster/come-into-my-trading-room.json";
const bok = JSON.parse(fs.readFileSync(SOKVAG, "utf8"));

if (bok.chapters.length !== 15 || bok.chapterCount !== 15 || bok.totalMinutes !== 170) {
  console.error("FÖRFÖRHÅLLANDE FEL — väntat 15/15/170, fann",
    bok.chapters.length, bok.chapterCount, bok.totalMinutes);
  process.exit(1);
}

const kapitel = {
  num: 16,
  minutes: 13,
  title: "Från boken till egen analys",
  intro: "Kursens sista steg går från Elders bok till ditt eget rum: tre skärmar i fallande ordning, en checklista skriven före dagen och en journal som stämmer plan mot utfall. Sedan räknas hela kedjan igenom på Ericsson B:s verkliga kurser — en genomräkning, inte en rekommendation.",
  blocks: [
    {
      type: "text",
      content: "Elders centrala bild, förd till praktiken: handel är inte en skärm man stirrar på utan ett rum man går in i beredd — med två möbler: triple screen och journalen. Den ena förenar analysen, den andra minnet. Triple screen löser analysens klassiska dilemma: samma aktie säger olika saker beroende på zoom, och kuren är tre skärmar i fallande tidsram som ställer varsin fråga i fast ordning. Skärm ett är trenden — veckografen, hos Elder läst med till exempel macd på veckobasis; svaret avgör vilket håll övningar överhuvudtaget får sökas åt: upptrend betyder att bara köpsidans villkor letas — inte att något köps; skärm ett är riktningen, aldrig beslutet. Skärm två är momentumet — dagsgrafen, där tillfällen söks där den kortare serien vänder med trenden: divergenser och oscillatorläge (F11:s verktyg); ett översålt dagsläge i en upptrend är en fråga, aldrig en automatik. Skärm tre är ingången — tim- eller realgrafen; först när skärm ett och två sagt ja bestämmer den korta grafen var beslutet verkställs: nivå, stopp vid logisk plats, mätbart mål — allt satt i förväg (F12:s kartlogik). Kedjans poäng: skärm ett ger riktning, skärm två tillfälle, skärm tre verkställighet — alla tre måste säga ja, annars ingen övning. Journalen är rummets andra hälft: varje beslut dokumenteras — grafen vid ingången, skälet, planen, sinnesstämningen — och stäms av mot utfallet. Elders regel att goda handlare är goda bokförare är kursens röda tråd: journalen är systemets minne, och utan den vet du om en månad varför en övning gjordes eller vad den lärde."
    },
    {
      type: "text",
      content: "Praktiken är en personlig checklista ur Elders frågor, skriven före dagen och formulerad som ja eller nej — fem rader. Rad ett, skärm 1: pekar veckotrenden uppåt — eller nedåt, för kortsidans villkor? Rad två, skärm 2: visar dagsgrafen ett tillfälle med trenden — oscillatorläge eller divergens förenad med en prisnivå? Rad tre, skärm 3: finns en definierad ingång, ett stopp under logiken och ett mål som ger belöning per risk minst 2,0? Rad fyra, risk: står positionen med 2 %-regeln, och är kontots totala öppna risk högst 6 %? Rad fem, journal: är raden förberedd — datum, skäl, plan — innan något verkställs? Regeln är mekanisk: en nej-rad är ingen övning, inga undantag. Ritualen runt omkring håller rummet ordnat: morgonen mappar nivåerna (F12:s karta), kvällen kvitterar journalen, och veckans slut jämför plan mot utfall — först då framgår vilket steg som brast."
    },
    {
      type: "utmaning",
      content: "Din egen checklista och journal, papper och penna: skriv de fem raderna med dina ord — skärm 1 riktning, skärm 2 tillfälle, skärm 3 verkställighet, 2 %-regeln med 6 %-taket, journalraden — varje rad formulerad så att svaret bara kan bli ja eller nej. Välj sedan en aktie du känner väl och besvara checklistan skriftligt enbart som läsövning: alla fem rader fylls i, inget verkställs. Avsluta med journalraden som rad fem kräver — datum, skäl, plan — och stäm vid veckans slut plan mot utfall: vilket steg brast, och var det en nej-rad som rundades? Övningen tränar metodens bokföring: vad kedjan lär om rummet, inte vad någon bör handla (2007:528)."
    },
    {
      type: "text",
      content: "Genomgående övning på historisk data, Ericsson B (ERIC-B.ST), källa Yahoo Finance, hämtat 2026-09-24 — samma källmärkta material som F12:s övningssväng. En genomräkning, inte en rekommendation (2007:528). Skärm 1 (vecka): efter juli-botten 91,50 kr (23 juli) gör veckografen högre bottnar med macd vänt uppåt — trenden upp: övningen söks på köpsidans villkor. Skärm 2 (dag): basen ~91–100 kr med högre bottnar 93,82 → 96,70 → 96,76 kr, oscillatorn som återhämtar sig ur nedre zonen medan pris bottnar allt högre — ett tillfälle med trenden. Skärm 3 (timme): verkställighet planerad vid slutkurs över basens tak: ingång 100,50 kr, stopp 96,50 kr (under senaste högre botten), mål 112,50 kr (zonen där fallet 14 juli började). Risk 4,00 kr/aktie, belöning 12,00 kr, kvot 3,0. Sedan 2 %-regeln uträknad: övningskonto 100 000 kr ger riskbudgeten 2 % = 2 000 kr. Positionen blir 2 000 ÷ 4,00 = 500 aktier, värde 500 × 100,50 = 50 250 kr. Självkontrollen: nås stoppet blir förlusten 500 × 4,00 = −2 000 kr = exakt 2,0 % av kontot — aldrig mer. Nås målet: 500 × 12,00 = +6 000 kr = +6,0 %. F12 tränade samma mekanik med 1 %-budget; regeln är identisk, parametern Elders. Tillägget är 6 %-taket: med 2 % per övning ryms högst tre öppna samtidigt — checklistans fjärde rad. Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528)."
    },
    {
      type: "tabell",
      content: "{\"rubrik\":\"Tre skärmar och 2 %-regeln på Ericsson B — genomräkning av övningen\",\"rader\":[[\"Fråga\",\"Svar i övningen\",\"Läsning\"],[\"Skärm 1 — veckotrend?\",\"Ja: högre bottnar efter 91,50 kr (23 juli), macd vänt upp\",\"Trenden upp — övningen söks på köpsidans villkor\"],[\"Skärm 2 — tillfälle?\",\"Basen ~91–100 kr, bottnar 93,82 → 96,70 → 96,76 kr\",\"Oscillatorn ur nedre zonen, pris bottnar allt högre\"],[\"Skärm 3 — verkställighet?\",\"Ingång 100,50 kr, stopp 96,50 kr, mål 112,50 kr\",\"Risk 4,00, belöning 12,00 kr/aktie — kvot 3,0\"],[\"2 %-regeln?\",\"2 000 ÷ 4,00 = 500 aktier (50 250 kr)\",\"Stopp = −2 000 kr = 2,0 % av 100 000 kr; mål = +6 000 kr = +6,0 %\"],[\"6 %-tak?\",\"Högst tre öppna övningar\",\"2 % per övning ryms tre gånger — fjärde raden\"]]}"
    },
    {
      type: "text",
      content: "Fyra fallgropar bär kursens erfarenhet. Den första är att hoppa över skärm tre: klassikern är att skärm ett och två säger ja och eleven jagar in sig i stunden — utan förberedd nivå blir stoppet en efterhandskonstruktion och risken obudgeterad; skärm tre är där riskräkningen verkställs, inte där känslan tar över. Den andra är journalen som domare i stället för lärare: används den till att skuldbelägga slutar du snart skriva sanningen — och utan sann data är journalen värdelös; frågorna är lärarens — vad hände, vad visste jag då, vad upprepas — inte vem som hade fel. Den tredje är tre indikatorer i stället för tre tidsramar: RSI, stochastic och macd på samma dagsgraf ställer samma fråga tre gånger (F11:s fallgrop) — triple screen är tidsramar i ordning, och indikatorerna hålls få. Den fjärde är att vända mot skärm ett: frestelsen att vara tidig in före veckovändningen är vad triple screen finns för att stoppa — den vackraste dagssignalen mot en fallen veckotrend är en övning utan första ja."
    },
    {
      type: "insikt",
      content: "F14 är Fas 3:s samlingskurs: skärm två är F11:s momentumläsning, skärm tre F12:s nivåkarta, skärm ett F09:s visuella hierarki — tre kurser som här får sin ordning. Checklistan är konfluens (F03) i blankettform, journalen plattformens röda tråd om mätbara beslut, och räknekulturen — procent, datum, källmärke — arvslinje från Fas 2. I AKM2-analyserna tränas läsning av flera tidshorisonter utan att blanda dem; i portföljmotorns övningsytor upprepas 2 %-räkningen tills den sitter, och AI-Mentorn kan förhöra checklistan rad för rad. Kursen fogar samman delarna till en helhet — ett förberett beslut i ett förberett rum, aldrig en uppmaning."
    }
  ],
  quiz: [
    {
      q: "Vilken fråga ställer första skärmen i triple screen, och vad får dess svar styra?",
      alternativ: [
        "Veckografens trend — svaret avgör vilket håll övningar överhuvudtaget får sökas åt: riktningen, aldrig beslutet",
        "Dagsgrafens oscillatorläge — svaret avgör exakt vilken dag en position ska verkställas",
        "Timgrafens ingångsnivå — svaret avgör om veckotrenden är värd att följa",
        "Kontots totala öppna risk — svaret avgör vilken tidsram som är den rätta"
      ],
      ratt: 0,
      tips: "Skärm ett är riktningen: upptrend betyder att bara köpsidans villkor letas — inte att något köps."
    },
    {
      q: "Vad menas med regeln att en nej-rad är ingen övning, inga undantag?",
      alternativ: [
        "Att checklistan är ett förslag som kan rundas när känslan är stark",
        "Att samtliga fem rader måste besvaras ja innan en övning överhuvudtaget finns — en enda nej-rad skjuter upp den",
        "Att journalen skrivs först efter att utfallet blivit känt",
        "Att nekar skärm tre får skärm ett och två gemensamt överta dess roll"
      ],
      ratt: 1,
      tips: "Kedjan är en AND-länk: riktning, tillfälle och verkställighet måste alla säga ja."
    },
    {
      q: "I räkneexemplet gav 2 %-regeln 500 aktier på övningskontot 100 000 kr — vad är självkontrollen metoden kräver?",
      alternativ: [
        "Att målet alltid nås före stoppet eftersom kvoten är 3,0",
        "Att positionens värde aldrig får överstiga hälften av kontot",
        "Att nås stoppet blir förlusten 500 × 4,00 = −2 000 kr = exakt 2,0 % av kontot — aldrig mer",
        "Att antalet aktier dubblas om stoppet sätts närmare ingången"
      ],
      ratt: 2,
      tips: "2 %-regeln räknas baklänges: riskbudgeten 2 000 kr divideras med risk per aktie — stoppet definierar storleken, inte tvärtom."
    }
  ]
};

bok.chapters.push(kapitel);
bok.chapters_list.push({ num: kapitel.num, title: kapitel.title, minutes: kapitel.minutes });
bok.chapterCount = bok.chapters.length;
bok.totalMinutes = bok.chapters.reduce((a, k) => a + k.minutes, 0);

fs.writeFileSync(SOKVAG, JSON.stringify(bok, null, 2) + "\n", "utf8");
console.log("APPEND KLAR:", bok.chapterCount, "kapitel, totalMinutes", bok.totalMinutes,
  "— chapters_list-post 16:", JSON.stringify(bok.chapters_list[15]));
