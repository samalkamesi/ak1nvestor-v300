#!/usr/bin/env node
// v166-d08 — appendar djupkapitel 15 "Från boken till egen analys" till
// encyclopedia-of-chart-patterns.json enligt DESIGN-v166-djupintegrering.md
// (underlag f08, granskat v164). Append-only: enbart chapters/chapters_list/
// chapterCount/totalMinutes berörs; befintliga kapitel bit-identiska.
import fs from "node:fs";

const SOKVAG = "data/bokmaster/encyclopedia-of-chart-patterns.json";
const bok = JSON.parse(fs.readFileSync(SOKVAG, "utf8"));
const forrSista = bok.chapters[bok.chapters.length - 1].num;

const hm = {
  rubrik: "Kupol (rund topp) — H&M B, månadsgrad (verkliga dagavslut, källa Yahoo Finance, hämtat 2026-09-24)",
  rader: [
    ["Märke", "Datum", "Slutkurs", "Mätning"],
    ["Kupoltopp", "2015-03-02", "365,40 kr", "—"],
    ["Kupolens innersta dal", "2016-06-27", "236,60 kr", "−35,3 % rundning"],
    ["Utbrott (misslyckat)", "2017-01-23", "234,60 kr", "återkast till 250,00 på 6 handelsdagar"],
    ["Utbrott (bestående)", "2017-03-30", "227,70 kr", "aldrig över 236,60 igen"],
    ["Måttregelns mål", "—", "107,80 kr", "236,60 − (365,40 − 236,60)"],
    ["Botten", "2018-03-27", "120,94 kr", "−46,9 % från utbrottet; målet ej nått"],
  ],
};

const elux = {
  rubrik: "Huvud-och-skuldror — Electrolux B, dags/veckograd (verkliga dagavslut, källa Yahoo Finance, hämtat 2026-09-24)",
  rader: [
    ["Märke", "Datum", "Slutkurs", "Mätning"],
    ["Huvud", "2021-07-14", "246,90 kr", "—"],
    ["Nacke (dalens slut)", "2021-10-06", "180,68 kr", "−26,8 % djup dal"],
    ["Höger skuldra", "2022-01-03", "221,90 kr", "10,1 % under huvudet"],
    ["Utbrott (misslyckat)", "2022-02-14", "180,30 kr", "återkast till 184,70 nästa dag"],
    ["Utbrott (bestående)", "2022-02-18", "179,35 kr", "24/2: 166,50 på 2,3 × normalvolym"],
    ["Måttregelns mål", "—", "114,46 kr", "180,68 − (246,90 − 180,68)"],
    ["Botten", "2022-09-29", "114,72 kr", "−36,0 % från utbrottet; målet nått på 26 öre"],
  ],
};

const kapitel = {
  num: forrSista + 1,
  minutes: 13,
  title: "Från boken till egen analys",
  intro: "Fjorton kapitel har mätt formationernas statistik — det här tar steget från uppslagsverk till egen mätning. Du får Bulkowskins arbetsordning steg för steg, två fullt genommätta formationer på svenska aktier och fallgroparna mellan statistik och verklighet. Underlaget är det granskade v164-arbetet (f08, 2026-09-24); allt nedan är utbildning i hur metoden mäter och räknar — inga investeringsråd, inga avkastningslöften (2007:528).",
  blocks: [
    {
      type: "text",
      content: "Kärnan först, och den är ett byte av fråga. De flesta böcker om formationer säger \"huvud-och-skuldror är en vändning nedåt\". Thomas Bulkowski frågade i stället: av tusentals mätta fall, hur ofta bröt formationen nedåt? Hur stor var den genomsnittliga rörelsen efter utbrottet? Hur ofta misslyckades utbrottet helt? Han mätte tusentals formationer i amerikanska aktier, uppdelat på bull- och björnmarknad, och rapporterade per formation: utbrottsriktning, träffprocent, medelrörelse efter utbrott, misslyckandefrekvens mot fasta trösklar (t.ex. 5 och 10 %) och hur ofta kursen återkastas (throwback/pullback) till utbrottsnivån efteråt. Kursens kärna är det omättade perspektivet: en formation är inte en signal utan en statistisk fördelning. \"Den här typen av topp har historiskt brutit nedåt i majoriteten av mätta fall, med en genomsnittlig nedgång på X procent och ett misslyckande i Y procent av fallen\" är ett påstående man kan lära sig och pröva — \"den ser bearish ut\" är en åsikt. Skillnaden mellan att gissa och att mäta är sifferunderlaget bakom.",
    },
    {
      type: "text",
      content: "Sedan hantverket — Bulkowskins förfarande, samma ordning varje gång. 1. Fastställ förtrenden: en toppformation kräver per definition en föregående upptrend — utan den finns ingen formation att mäta. 2. Markera komponenterna med datum: toppar och dalar som bildar formen (två toppar och en dal; tre toppar och två dalar). Ett märke utan datum är en åsikt, med datum ett prövbart påstående. 3. Dra linjen — nacke/halslinje genom dalarna, eller formationsgränsen vid en rund topp (kupol): dess lägsta punkt. 4. Vänta på bekräftat utbrott: kursen ska stänga utanför linjen. Innan dess är formen bara en likhet — inget har hänt. 5. Mät utbrottet: datum, stängning, avstånd i procent från linjen, och volymen mot normalvolymen (utbrott på kraftig volym är ett av bokens mätbara kvalitetstecken). 6. Beräkna målet (måttregeln): formationshöjden (topp till nacke) projiceras från utbrottspunkten — som en zon, aldrig en exakt siffra. 7. För in allt i statistiktabellen: riktning, rörelse till nästa betydande vändning, misslyckande ja/nej mot tröskeln. Ett fall i taget — tabellen är poängen.",
    },
    {
      type: "utmaning",
      content: "Ta en aktie du själv följer och bygg din första egen statistiktabell. Gå hela arbetsordningen: fastställ förtrenden, markera komponenterna med datum, dra linjen och vänta sedan — tills kursen faktiskt stänger utanför den. Först då får raden skrivas: formationsnamn, utbrottsdatum, stängning, avstånd i procent, volym mot normalvolymen, måttregelns mål som zon — och lite senare utfallet: rörelse till nästa betydande vändning, misslyckande ja/nej mot tröskeln. Samla fem till tio rader innan du beskriver helheten. Skriv avslutningsvis ner tre observationer: en om vilka krav som var svårast att hålla hårda, en om vad återkasten gjorde med din tålmodighet, en om hur din tabell skiljer sig från en åsikt om kurvan. Det är bokens metod i miniatyr — frekvenser över fall, inte en känsla för en kurva.",
    },
    {
      type: "text",
      content: "Nu mätövningen i rörelse, på två svenska formationer. Verkliga dagavslut, källa Yahoo Finance, hämtat 2026-09-24 — och samma ord som underlaget: så här ser mätövningen ut, inte en rekommendation, en övning i att mäta. Första fallet är en kupol (rund topp) på H&M B i månadsgrad: kupoltoppen 2015-03-02 på 365,40 kr rundas av i en innersta dal 2016-06-27 på 236,60 kr — 35,3 % rundning — varefter ett första utbrot 2017-01-23 på 234,60 kr misslyckas med återkast till 250,00 på 6 handelsdagar, innan det bestående utbrottet 2017-03-30 på 227,70 kr; efter det kommer kursen aldrig över 236,60 igen. Måttregeln ger 107,80 kr som zon, botten 2018-03-27 på 120,94 kr blir −46,9 % från utbrottet — målet nåddes alltså inte. Tabellen samlar mätningarna:",
    },
    { type: "tabell", content: JSON.stringify(hm) },
    { type: "tabell", content: JSON.stringify(elux) },
    {
      type: "text",
      content: "Jämförelsen är kursens kärna: samma verktyg, två formationer, två utfall. Båda fick misslyckade förstautbrott med återkast — det är normalfördelningen, inte undantaget. Electrolux nådde måttregelns mål på 26 öre; H&M stannade 12 procent över sitt. Ingen enskild formation bär sin egen sanning — därför mäts frekvenser över många fall, och därför är bokens tabeller källan, inte minnet av en lyckad kurva.",
    },
    {
      type: "text",
      content: "Fyra fallgropar, kompakterade. 1. Formationsjakt: hjärnan ser mönster i nästan vilken kurva som helst — skyddet är regelverkets hårda krav (förtrend, definierade komponenter, dragen linje och bekräftat utbrott); utan dem är \"formationen\" en likhet, inte ett dataunderlag. 2. Statistiken från en annan tid och marknad: Bulkowskis urval är amerikanska aktier under bestämda perioder; svenska bolag i en annan epok kan bete sig annorlunda. Statistik är en urvalsbeskrivning, inte en naturlag — kursen tränar att sammanställa eget urval i stället för att låna främmande siffror okritiskt. 3. Medelvärden utan spridning: \"genomsnittlig nedgång 20 %\" säger inget om risken; misslyckandefrekvensen vid fasta trösklar och återkasten är minst lika viktiga tal. 4. Ett fall är ingen frekvens: räkneexemplen ovan illustrerar metoden — de bevisar ingenting om nästa formation. Kursen håller skillnaden mellan anekdot och statistik hårt (F03:s konfluensregel: formationen är ett vittne, aldrig hela bevisningen).",
    },
    {
      type: "insikt",
      content: "Här knyts boken till ekosystemet — den här kursen är statistikbenet i Fas 3-kedjan. F01 gav hierarkin: formationer graderas (kupolen ovan är månadsgrad, skuldrorna dagsgrad). F04 gav formens grammatik och den här kursen ger formens frekvenser: hur ofta en form håller och hur långt den rör sig. F07:s ljus mäter dagsskalan, formationerna vecko- och månadsskalan — samma mätidé (träffprocent, trösklar) på olika grader. F03:s konfluensregel väger formationsutbrottet som ett tekniskt vittne mot fundamentala serier, och AKM2-modellens tidshorisonter får därigenom utbrottsavstånd och målzoner som mätta procent i stället för kvalitativa gissningar. Normen är ekosystemets egen: varje märke med datum, varje rörelse i procent — dataexpanderbart, precist som vågfundament-cacherna. Utbildningsmaterial — beskriver hur metoden läser och räknar; inga investeringsråd, inga avkastningslöften (2007:528). Kurskurser är historiska källmärkta exempel.",
    },
  ],
  quiz: [
    {
      q: "Vilket påstående fångar kärnan i Bulkowskins angreppssätt?",
      alternativ: [
        "Ögats intryck av kurvan räcker som underlag — mätning tillför ingenting",
        "En formation är inte en signal utan en statistisk fördelning: utbrottsriktning, träffprocent och misslyckandefrekvens mätta över tusentals fall",
        "En formations betydelse är densamma oavsett förtrend, marknadsmiljö och epok",
        "En formation är främst något som ska hittas snabbt, redan innan något utbrott bekräftats",
      ],
      ratt: 1,
      tips: "Tänk på skillnaden mellan \"den ser bearish ut\" och ett påstående man kan lära sig och pröva.",
    },
    {
      q: "Vad kräver regelverket innan en formation överhuvudtaget räknas som mätbar?",
      alternativ: [
        "Att formen är tydligt synlig för ögat i diagrammet",
        "Att volymen stigit redan när formen börjar byggas",
        "Ett bekräftat utbrott — kursen ska stänga utanför linjen; innan dess är formen bara en likhet",
        "Att måttregelns mål redan nåtts en gång för samma formationstyp",
      ],
      ratt: 2,
      tips: "Innan stängningen utanför linjen har inget hänt — formen är fortfarande bara en likhet.",
    },
    {
      q: "Hur formuleras måttregeln?",
      alternativ: [
        "Formationshöjden (topp till nacke) projiceras från utbrottspunkten — som en zon, aldrig en exakt siffra",
        "Målet sätts vid den volymtopp som inträffar under formationens byggnad",
        "Målet är alltid exakt formationshöjden i kronor, räknat från formationens topp",
        "Måttregeln gäller bara rundade toppar, inte huvud-och-skuldror",
      ],
      ratt: 0,
      tips: "Tänk på hur målet räknades i båda räkneexemplen: höjden projicerad från utbrottspunkten.",
    },
  ],
};

if (bok.chapters.some(k => k.title === kapitel.title)) {
  console.error("ABORT: kapitlet finns redan"); process.exit(1);
}
bok.chapters.push(kapitel);
bok.chapters_list.push({ num: kapitel.num, title: kapitel.title, minutes: kapitel.minutes });
bok.chapterCount = bok.chapters.length;
bok.totalMinutes = bok.chapters.reduce((a, k) => a + k.minutes, 0);

fs.writeFileSync(SOKVAG, JSON.stringify(bok, null, 2) + "\n", "utf8");
console.log(`OK: kapitel ${kapitel.num} appenderat — ${bok.chapterCount} kapitel, Σ ${bok.totalMinutes} min`);
