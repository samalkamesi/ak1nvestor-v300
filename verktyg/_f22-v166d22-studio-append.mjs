// v166-d22 — appenda djupkapitel 15 i the-hour-between-dog-and-wolf.json
import fs from 'node:fs';
const SOKVAG = 'data/bokmaster/the-hour-between-dog-and-wolf.json';
const rå = fs.readFileSync(SOKVAG, 'utf8');
const slutNyrad = rå.endsWith('\n');
const bok = JSON.parse(rå);
if (JSON.stringify(bok, null, 2) + (slutNyrad ? '\n' : '') !== rå) throw new Error('formatavvikelse — avbryter');
if (bok.chapterCount !== 14 || bok.chapters.length !== 14 || bok.totalMinutes !== 168) throw new Error(`oväntad bas ${bok.chapterCount}/${bok.chapters.length}/${bok.totalMinutes}`);
if (bok.chapters.at(-1).title === 'Från boken till egen analys') throw new Error('finns redan');

const kap = {
  num: 15,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro: 'Fjorton kapitel har visat var disciplinen bor — i kroppen. Det här tar steget till egen analys: att känna igen euforin och rädslan i eget beteende, att logga den, och ett genomräknat tankeexperiment som visar samma system i tre kroppslägen. Underlaget är det granskade v164-arbetet (f22, 2026-09-24); allt nedan är utbildning om metoder och sig själv — inte investeringsråd (2007:528).',
  blocks: [
    {
      type: 'text',
      content: 'Coates bok har en enda bärande tanke, och den är värd att upprepa vid varje egen läsning: riskbesluten börjar i kroppen. John Coates handlade derivat på Goldman Sachs och Deutsche Bank innan han blev neuroforskare i Cambridge. I boken (2012, på svenska Mellan hund och varg) mätte han dagligen hormoner i saliv hos verkliga handlare i London — och fann att deras risktagande följde kroppens kemi.\n\nTvå cykler. Efter vinster stiger testosteron — energi, mod, fokus — och med det benägenheten att ta större risk. Segerserier driver nivåerna högre tills besluten blir slarvigt övermodiga; Coates kopplar detta till bubblors eufori. Efter förluster stiger kortisol, kroppens långvariga stresshormon: samma människa blir överdrivet försiktig, trångsynt, djupt pessimistisk — en mekanism som kan förstärka krascher. Titeln är skymningen då hunden blir varg: bilden av hur en vanlig, klok person förändras under en boom. Bokens mest kända fynd är winning effect — segern i sig, inte analysen, lagrar kroppen för nästa, större risk. Biologi, inte brist på karaktär, förklarar varför disciplinen smular.'
    },
    {
      type: 'text',
      content: 'Det praktiska arbetet är att känna igen euforin och rädslan i eget beteende — winning effect syns i beteendet innan den syns i resultatet.\n\nEfter en segerserie: positionsstorlekar växer utan att analysen förändrats, besluten fattas snabbare, dokumentationen blir glesare, tröttheten försvinner, känslan är "jag ser marknaden". Spegelbilden efter förluster: setup skippas "tills det lugnat sig", storleken krymper smygande, samma nyhet som nykter var information läsning nu som hot.\n\nCoates poäng om magkänslan: kroppens signaler — han kallar det interoception — är verklig information. Men den ska mätas och vägas, inte lydas blindt.'
    },
    {
      type: 'utmaning',
      content: 'Bygg din egen kroppsjournal — pappersform räcker. Skriv din riskregel i neutralt läge, när du varken vinner eller förlorar. Logga sedan vid varje övningsbeslut tre saker: (1) avvikelse från regeln, (2) sömn senaste natten, (3) tid per beslut. Leta efter mönstret "avvikelsen växer efter V V V" — det är winning effect på egen data. Efter tjugo övningsbeslut: läs loggen baklänges och markera varje beslut som togs i eufori (efter segerserie) respektive rädsla (efter förlustserie). AI-Mentorn fungerar som spegel: tre beslut i rad över din egen storleksregel — vad hände precis innan dem?'
    },
    {
      type: 'text',
      content: 'Nu genomräkningen. Tankeexperiment i pappersform: övningsportfölj 100 000 kr, exempel på en regel (pedagogiskt, inget råd): risk 1 % = 1 000 kr per beslut; stopp på 10 % ger position 10 000 kr. Kant: +2/−2 %, väntevärde +0,2 % per beslut. Tre kroppslägen, identisk kant — tabellen nedan.\n\nSerie 3V/7F är 3 vinster och 7 förluster — ett helt normalt utfall med full kant (7,5 % sannolikhet, och 26 % av serierna ger 4 vinster eller färre). Skillnaden mellan tillståndena är inte kanten utan kroppen: euforiläget bär 2,5× risken för samma förväntan, och en av fyra normala serier kostar då 2 000 kr i stället för 800. Rädsloläget skyddar plånboken men svälter kanten — hälften av besluten togs aldrig. Samma system, tre olika utfall: det är kursens röda tråd.'
    },
    {
      type: 'tabell',
      content: '{"rubrik":"Samma system, tre tillstånd — tankeexperiment i pappersform (övningsportfölj 100 000 kr; risk 1 % = 1 000 kr per beslut; stopp 10 % ger position 10 000 kr; kant +2/−2 %, väntevärde +0,2 % per beslut)","rader":[["Tillstånd","Risk/beslut","Position","Väntevärde, 10 beslut","Serie 3V/7F kostar"],["Neutral — regeln följs","1 000 kr","10 000 kr","+200 kr","−800 kr"],["Efter förlust — kortisol","500 kr","5 000 kr","+60 kr (endast 6 av 10 beslut togs)","−400 kr"],["Efter vinst — testosteron","2 500 kr","25 000 kr","+500 kr","−2 000 kr"]]}'
    },
    {
      type: 'text',
      content: 'Tre fallgropar, kompakterade — alla tre sitter i gränsen mellan vilja och biologi:\n\n1. Att tro att viljan räcker. Coates fynd är att testosteron- och kortisoltillstånd är fysiologiska, inte attityder. "Jag bestämmer mig för att vara disciplinerad" mitt i euforin är som att bestämma sig för att inte känna adrenalin. Vägen ut är struktur: regler och storlekar bestämda i neutralt läge, tvångspauser efter serier, sömn.\n2. Att inte mäta. Utan journal ser ingen sitt eget mönster — minnet rattar sig självt ("jag var nog ganska rationell"). Känslan av att vara rationell är ofta själva symptomet; bara loggen kan skilja känsla från faktiskt beteende.\n3. Att tro att kroppen är fienden. Målet är inte att slåss med kroppen utan att flytta storleksbesluten till neutrala lägen — och att använda kroppens signaler som data, inte som order.'
    },
    {
      type: 'insikt',
      content: 'Här knyts boken till ekosystemet. Detta kapitel förklarar varför zon-mentaliteten är svår att hålla: biologin jobbar emot den. Kedjan är komplett: en bok definierar variablerna, en bevisar att samma regler ger olika utfall, en räknar väntevärdet, en ger mentaliteten — och den här visar mekanismen som saboterar den. Det är också därför AI-Mentorn loggar beslut i journalen: avvikelsen från den egna planen syns bara i data. Mentorn kan spegla "tre beslut i rad över din egen storleksregel — vad hände precis innan dem?" — Coates labbmetod i mjukvara, där salivproverna blev journalrader. Elevens logg blir biodata: när besluten togs, hur stora, efter vilken serie. Nästa kurser gräver djupare: den ena i känslan, den andra i hjärnans genvägar. Hela kedjan är utbildning om metoder och sig själv — aldrig råd om live-affärer, aldrig avkastningslöften (2007:528).'
    }
  ],
  quiz: [
    {
      q: 'Vilket påstående fångar bokens mest kända fynd?',
      alternativ: [
        'Disciplin är en karaktärsegenskap som tränas genom viljestyrka',
        'Winning effect — segern i sig, inte analysen, lagrar kroppen för nästa, större risk: testosteron stiger efter vinster och kortisol efter förluster, och risktagandet följer kroppens kemi',
        'Handlare som mår bäst presterar bäst oavsett riskregler',
        'Magkänslan ska alltid lydas eftersom interoception är samma sak som analys'
      ],
      ratt: 1,
      tips: 'Biologi, inte brist på karaktär, förklarar varför disciplinen smular.'
    },
    {
      q: 'Vad visar tankeexperimentet med samma system i tre kroppslägen?',
      alternativ: [
        'Att euforiläget bär 2,5× risken för samma förväntan — en normal serie 3V/7F kostar 2 000 kr i stället för 800, och rädsloläget svälter kanten (endast 6 av 10 beslut togs)',
        'Att kanten förändras med humöret',
        'Att neutrala lägen alltid ger förlust',
        'Att positionsstorleken saknar betydelse om väntevärdet är positivt'
      ],
      ratt: 0,
      tips: 'Skillnaden mellan tillståndena är inte kanten utan kroppen.'
    },
    {
      q: 'Vilket påstående om fallgroparna är kursens?',
      alternativ: [
        'Kroppen är fienden och dess signaler ska tränas bort',
        'Känslan av att vara rationell är bevis nog — journalföring är överflödig',
        'Testosteron- och kortisoltillstånd är fysiologiska, inte attityder — vägen ut är struktur (regler i neutralt läge, tvångspauser, sömn), och kroppens signaler används som data, inte som order',
        'Tvångspauser efter serier försvagar kanten permanent'
      ],
      ratt: 2,
      tips: 'Vägen ut är struktur — inte att bestämma sig för att inte känna adrenalin.'
    }
  ]
};

bok.chapters.push(kap);
bok.chapterCount = 15;
bok.totalMinutes = 181;
bok.chapters_list.push({ num: kap.num, title: kap.title, minutes: kap.minutes });
fs.writeFileSync(SOKVAG, JSON.stringify(bok, null, 2) + (slutNyrad ? '\n' : ''));
console.log('APPEND KLAR: kapitel 15 · 14→15 · 168→181');
