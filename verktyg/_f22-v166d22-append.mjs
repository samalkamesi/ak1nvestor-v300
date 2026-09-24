#!/usr/bin/env node
// v166-d22 — appenda djupkapitel 15 "Från boken till egen analys" till
// data/bokmaster/the-hour-between-dog-and-wolf.json (append-only, DESIGN-v166).
// Underlag: data/forskning/KURS-FAS3/underlag-f22-dog-and-wolf.md
// (granskat v164). Tal överförs ORDAGRANT — inga nya tal hittas på.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/the-hour-between-dog-and-wolf.json';
const raw = fs.readFileSync(FIL, 'utf8');
const j = JSON.parse(raw);

if (j.chapters.length !== 14 || j.chapterCount !== 14 || j.totalMinutes !== 168) {
  throw new Error(`Förväntade 14 kapitel/168 min — fann ${j.chapters.length}/${j.chapterCount}/${j.totalMinutes}`);
}

// Deklarationer ORDAGRANT ur underlaget (juridikgrind 2007:528)
const UTBILDNINGSDEKLARATION =
  'Utbildningsmaterial — beskriver hur metoden fungerar med hypotetiska tankeexperiment i pappersform; inga investeringsråd, inga avkastningslöften (2007:528).';

// Tabellens data (underlagets tabell, ordagrant — U+2014 tankstreck, U+2212 minus)
const tabellData = {
  rubrik: 'Samma system, tre tillstånd — identisk kant, tre kroppslägen (hypotetiskt tankeexperiment i pappersform)',
  rader: [
    ['Tillstånd', 'Risk/beslut', 'Position', 'Väntevärde, 10 beslut', 'Serie 3V/7F kostar'],
    ['Neutral — regeln följs', '1 000 kr', '10 000 kr', '+200 kr', '−800 kr'],
    ['Efter förlust — kortisol', '500 kr', '5 000 kr', '+60 kr (endast 6 av 10 beslut togs)', '−400 kr'],
    ['Efter vinst — testosteron', '2 500 kr', '25 000 kr', '+500 kr', '−2 000 kr'],
  ],
};

const kapitel = {
  num: 15,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro:
    'Kursens sista steg: från Coates laboratorium till din egen logg. Kärnan — riskbesluten börjar i kroppen — bärs med oss in i en praktisk läsning där euforin och rädslan känns igen på beteendet, en övning som gör journalen till salivprov, och ett räkneexempel som visar kursens röda tråd i siffror: samma system, tre kroppslägen, tre olika utfall.',
  blocks: [
    {
      type: 'text',
      content:
        'John Coates handlade derivat på Goldman Sachs och Deutsche Bank innan han blev neuroforskare i Cambridge — bokens biografiska puls och kursens utgångspunkt (kapitel 1). I The Hour Between Dog and Wolf (2012, svensk titel Mellan hund och varg) mätte han dagligen hormoner i saliv hos verkliga handlare i London — och fann att deras risktagande följde kroppens kemi. Två cykler, kursens kemikapitel i bokform: efter vinster stiger testosteron — energi, mod, fokus — och med det benägenheten att ta större risk (kapitel 4). Segerserier driver nivåerna högre tills besluten blir slarvigt övermodiga; Coates kopplar detta till bubblors eufori. Efter förluster stiger kortisol, kroppens långvariga stresshormon (kapitel 5): samma människa blir överdrivet försiktig, trångsynt, djupt pessimistisk — en mekanism som kan förstärka krascher. Titeln är skymningen då hunden blir varg: bilden av hur en vanlig, klok person förändras under en boom. Bokens mest kända fynd är winning effect — segern i sig, inte analysen, lagrar kroppen för nästa, större risk. Det är kursens vändning av skulden: biologi, inte brist på karaktär, förklarar varför disciplinen smular.',
    },
    {
      type: 'text',
      content:
        'Praktisk läsning: winning effect syns i beteendet innan den syns i resultatet. Efter en segerserie: positionsstorlekar växer utan att analysen förändrats, besluten fattas snabbare, dokumentationen blir glesare, tröttheten försvinner, känslan är "jag ser marknaden". Läs listan som ett checkhäkte — varje rad är en mätbar förändring, ingen karaktärsdom.\n\nSpegelbilden efter förluster: setup skippas "tills det lugnat sig", storleken krymper smygande, samma nyhet som nykter var information läsning nu som hot. Coates poäng om magkänslan (kapitel 8): kroppens signaler — han kallar det interoception — är verklig information, men den ska mätas och vägas, inte lydas blindt.',
    },
    {
      type: 'utmaning',
      content:
        'Övningen, i pappersform — Coates labbmetod på egen data.\n\nSTEG 1 — REGELN I NEUTRALT LÄGE. Skriv riskregeln när du är utvilad och opåverkad av senaste utfall: vad som triggar ett beslut, hur stor risken får vara per beslut, vad som avslutar. Regeln gäller tills den ändras i ett neutralt läge — aldrig i ett laddat.\n\nSTEG 2 — LOGGEN VID VARJE ÖVNINGSBESLUT. Tre kolumner: (1) avvikelse från regeln, (2) sömn, (3) tid per beslut. Ingen självkritik, ingen förklaring — bara mätning.\n\nSTEG 3 — LÄS MÖNSTRET. När loggen växt: letar du efter mönstret "avvikelsen växer efter V V V"? Det är winning effect på egen data — segern som lagrar kroppen för nästa, större avvikelse. Utvärderingen är utbildning om ditt eget mönster, inte omdöme om din karaktär (2007:528).',
    },
    {
      type: 'text',
      content: `Räkneexemplet, ordagrant ur underlaget — samma system, tre tillstånd.\n\nTankeexperiment i pappersform: övningsportfölj 100 000 kr, exempel på en regel (pedagogiskt, inget råd): risk 1 % = 1 000 kr per beslut; stopp på 10 % ger position 10 000 kr. Kant: +2/−2 %, väntevärde +0,2 % per beslut (F21:s mynt). Tre kroppslägen, identisk kant — neutral där regeln följs, efter förlust (kortisol), efter vinst (testosteron). Tabellen nedan visar dem sida vid sida.\n\n${UTBILDNINGSDEKLARATION}`,
    },
    {
      type: 'tabell',
      content: JSON.stringify(tabellData),
    },
    {
      type: 'text',
      content:
        'Utläsning: serie 3V/7F betyder 3 vinster, 7 förluster — ett helt normalt utfall med full kant (7,5 % sannolikhet, och 26 % av serierna ger 4 vinster eller färre, se F21). Skillnaden mellan tillstånden är inte kanten utan kroppen: euforiläget bär 2,5× risken för samma förväntan, och en av fyra normala serier kostar då 2 000 kr i stället för 800. Rädsloläget skyddar plånboken men svälter kanten — hälften av besluten togs aldrig. Samma system, tre olika utfall: det är kursens röda tråd.\n\nTre fallgropar, kompakterade.\n\nATT TRO ATT VILJAN RÄCKER. Coates fynd är att testosteron- och kortisoltillstånd är fysiologiska, inte attityder. "Jag bestämmer mig för att vara disciplinerad" mitt i euforin är som att bestämma sig för att inte känna adrenalin. Vägen ut är struktur: regler och storlekar bestämda i neutralt läge, tvångspauser efter serier, sömn.\n\nATT INTE MÄTA. Utan journal ser ingen sitt eget mönster — minnet rattar sig självt ("jag var nog ganska rationell"). Känslan av att vara rationell är ofta själva symptomet; bara loggen kan skilja känsla från faktiskt beteende.\n\nATT TRO ATT KROPPEN ÄR FIENDEN. Målet är inte att slåss med kroppen utan att flytta storleksbesluten till neutrala lägen — och använda kroppens signaler som data, inte som order.',
    },
    {
      type: 'insikt',
      content: `F22 förklarar varför F21:s zon är svår att hålla: biologin jobbar emot den. F18 definierar variablerna, F19 bevisar att samma regler ger olika utfall, F20 räknar väntevärdet, F21 ger mentaliteten — F22 visar mekanismen som saboterar den. Det är också därför AI-Mentorn loggar beslut i journalen (F14): avvikelsen från den egna planen syns bara i data. Mentorn kan spegla "tre beslut i rad över din egen storleksregel — vad hände precis innan dem?" — Coates labbmetod i mjukvara, där salivproverna blev journalrader. Elevens logg blir biodata: när besluten togs, hur stora, efter vilken serie. F23 (Shull) gräver djupare i känslan, F24 (Zweig) i hjärnans genvägar. Hela kedjan är utbildning om metoder och sig själv — aldrig råd om live-affärer, aldrig avkastningslöften (2007:528). ${UTBILDNINGSDEKLARATION}`,
    },
  ],
  quiz: [
    {
      q: 'Vad är bokens mest kända fynd — winning effect?',
      alternativ: [
        'Att analysen förbättras automatiskt efter varje vinst, så att nästa beslut blir bättre underbyggt',
        'Att segerserier gör handlare mer försiktiga eftersom kroppen sparar energi',
        'Att segern i sig — inte analysen — lagrar kroppen för nästa, större risk; biologi, inte brist på karaktär, förklarar varför disciplinen smular',
        'Att testosteronnivåerna faller efter vinster och stiger efter förluster',
      ],
      ratt: 2,
      tips: 'Fråga inte vad du tänkte efter segern — fråga vad kroppen gjorde redo för.',
    },
    {
      q: 'Räkneexemplet kör samma system i tre kroppslägen med identisk kant. Vad är tabellens utläsning?',
      alternativ: [
        'Att skillnaden mellan tillstånden inte är kanten utan kroppen: euforiläget bär 2,5× risken för samma förväntan, rädsloläget skyddar plånboken men svälter kanten — hälften av besluten togs aldrig',
        'Att kanten växer med risktagandet, så euforiläget har högst väntevärde per krona i risk',
        'Att det neutrala läget ger sämst väntevärde eftersom positionen är minst',
        'Att kroppsläget är irrelevant så länge systemet är detsamma',
      ],
      ratt: 0,
      tips: 'Jämför risk-kolumnen med väntevärdes-kolumnen: vad är konstant, och vad är det som förändras?',
    },
    {
      q: 'Varför loggar övningen avvikelse från regeln, sömn och tid per beslut vid varje övningsbeslut?',
      alternativ: [
        'För att avvikelser alltid beror på sömnbrist, så kolumnerna kan slås ihop till en',
        'För att känslan av att vara rationell ofta är själva symptomet — utan journal ser ingen sitt eget mönster, och bara loggen kan skilja känsla från faktiskt beteende',
        'För att loggen ska ersätta riskregeln när den växt sig tillräckligt lång',
        'För att tid per beslut ska minimeras — snabbare beslut är alltid bättre beslut',
      ],
      ratt: 1,
      tips: 'Minnet rattar sig självt — vad finns kvar som bevis när känslan har skrivit historien?',
    },
  ],
};

j.chapters.push(kapitel);
j.chapters_list.push({ num: 15, title: 'Från boken till egen analys', minutes: 13 });
j.chapterCount = j.chapters.length;
j.totalMinutes = j.chapters.reduce((a, c) => a + c.minutes, 0);

fs.writeFileSync(FIL, JSON.stringify(j, null, 2) + '\n');
console.log(
  `APPEND klart: chapterCount=${j.chapterCount}, totalMinutes=${j.totalMinutes}, chapters_list=${j.chapters_list.length} poster`,
);
