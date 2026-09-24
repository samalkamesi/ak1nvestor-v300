#!/usr/bin/env node
// v166-d17 — appenda djupkapitel 15 "Från boken till egen analys" till
// data/bokmaster/the-new-science-of-technical-analysis.json (append-only,
// DESIGN-v166). Underlag: data/forskning/KURS-FAS3/underlag-f17-demar.md
// (granskat v164). Tal överförs ORDAGRANT — inga nya tal hittas på.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/the-new-science-of-technical-analysis.json';
const raw = fs.readFileSync(FIL, 'utf8');
const j = JSON.parse(raw);

if (j.chapters.length !== 14 || j.chapterCount !== 14 || j.totalMinutes !== 168) {
  throw new Error(`Förväntade 14 kapitel/168 min — fann ${j.chapters.length}/${j.chapterCount}/${j.totalMinutes}`);
}

const KALLDEKLARATION =
  'Verkliga dagsslutkurser, Volvo B (VOLV-B.ST), källa Yahoo Finance, hämtat 2026-09-24 (251 handelsdagar). En kursräkning — ingen bedömning av aktien.';
const JURIDIKDEKLARATION =
  'Utbildningsmaterial — beskriver hur metoden räknar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528).';

const kapitel = {
  num: 15,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro:
    'Kursens sista kapitel går från bokens mekanik till det egna ritblocket: vad kvarstår när DeMarks räkneregler ska föras över på riktiga kurser? Svaret är en nioräkning utförd steg för steg på verkliga dagsslutkurser — varje tal källmärkt, varje steg deklarerat, varje fallgrop namngiven. Utbildning i att räkna, aldrig råd om att handla.',
  blocks: [
    {
      type: 'text',
      content:
        'Underlaget sätter fingret på det som gör boken hel: Thomas DeMarks The New Science of Technical Analysis (1994) växer fram ur en irritation kursen gör till program — traditionell teknisk analys är för subjektiv. Samma graf, två ritare: två olika trendlinjer, två olika slutsatser. DeMarks svar är att ersätta ögat med OBJEKTIVA RÄKNEREGLER: varje signal definierad så att två oberoende läsare, med samma data, får exakt samma resultat. Där Dow-traditionen säger att rusningen ser trött ut frågar DeMark: vilka tal gör "trött" mätbart?\n\nBokens signaturidé är UTMATTNING SOM NÅGOT ATT RÄKNA FRAM. Prisrörelser drivs av köpare och säljare som successivt förbrukas — till slut finns inga nya att tillgå, och vändningen kommer. Ögat anar det i en utdragen svans i diagrammet; DeMark översätter aningen till en mekanisk räkning, sitt mest kända verktyg nioräkningen TD Sequential. Poängen är inte räkningen i sig utan kulturen bakom: regler som kan loggas, granskas och felas — hantverket synliggjort i tal. Ett förbehåll kursen bär med sig till slut: bokens system byggdes med hjälp av stora institutionella aktörer, och till privatpersonen är boken ett kunskapsverk om hur regler konstrueras — inte en handelsmanual.',
    },
    {
      type: 'text',
      content:
        'Kursen sammanfattar den praktiska läsningen av en nioräkning i fyra steg — här säljsidans variant, spegelvänd för köpsidan.\n\nSTEG 1 — VÄNDVILKORET. Räkningen inleds när en stängning är högre än stängningen fyra handelsdagar tidigare, efter att den föregående stängningen varit lägre än sitt jämförelsetal. Vändningen definierar startpunkten: ingen räkning utan föregående motrörelse.\n\nSTEG 2 — RÄKNA NIO. Varje dag som stänger högre än sitt fyra-dagars-jämförelsetal får ett nummer, till och med nio. En enda stängning under jämförelsetalet bryter räkningen — då börjar räkningen om när vändvillkoret återkommer.\n\nSTEG 3 — KONTROLLERA GILTIGHETEN. Nian kräver att dag 8:s eller dag 9:s högsta kurs sticker över både dag 6:s och dag 7:s högsta. Utan det är serien en innehållslös stigning — regeln skyddar mot att räkna ett långsamt seglande uppåt utan acceleration.\n\nSTEG 4 — VAD NIAN BETYDER. En giltig nia markerar UTMATTNING I OMRÅDET: en observation att rörelsens bränsle håller på att ta slut, inte en klocka. DeMark byggde därför vidarelager — bekräftelser och fortsättningsräkning mot setupens extrema nivå — just för att utmattning kan dröja.',
    },
    {
      type: 'utmaning',
      content:
        'Genomför en egen nioräkning på papper. Välj en aktie med en tydlig sväng bakom sig och hämta dagsslutkurserna. Räkna enligt kapitlets fyra steg: markera vändvillkoret, numrera varje kvalificerande dag till och med nio, kontrollera giltigheten mot dag 6, 7, 8 och 9. Skriv I FÖRVÄG — innan du ser vidare i kursserien — villkoret som skulle ogiltigförklara din observation, till exempel att dag 8:s högsta inte sticker över både dag 6:s och dag 7:s högsta. Dokumentera därefter dag för dag: datum, slutkurs, jämförelsetal, ditt nummer. Journalen är övningens leverans — en iakttagelse med villkor som går att fela, i linje med kursens loggningskultur. Övningen tränar räkneverket; den berör inget beslut.',
    },
    {
      type: 'text',
      content: `${KALLDEKLARATION}\n\nVÄNDVILKORET: 13 juli stänger 335,30 — lägre än 340,20 (7 jul). Därpå 14 juli: 337,10 — högre än 333,70 (8 jul). Räkningen startar.\n\nGILTIGHETEN: dag 8:s högsta 354,20 ≥ dag 6:s 342,10 och dag 7:s 348,90 — uppfyllt (dag 9:s 355,90 likaså). Giltig nia avslutad 24 juli.\n\nEFTERSPELET: kursen steg sju handelsdagar till — 371,50 (4 aug), +4,7 % från dag 9 — vände och föll till 330,20 (15 sep), −11,1 % från toppen. Året rymmer fyra sälj-nior (tre giltiga) och en ogiltig köp-nia; exemplet visar kursens båda sanningar på en gång: utmattningen kom i området — men nian var ingen tidtagare. Tabellen nedan visar räkningen dag för dag.\n\n${JURIDIKDEKLARATION}`,
    },
    {
      type: 'tabell',
      content:
        '{"rubrik":"Volvo B — säljsidans nioräkning juli 2026 (dagsslutkurser, källa Yahoo Finance, hämtat 2026-09-24)","rader":[["Nr","Datum","Slutkurs","−4 jämförelse","Utfall"],["1","14 jul","337,10","333,70","högre"],["2","15 jul","338,50","334,40","högre"],["3","16 jul","341,30","336,90","högre"],["4","17 jul","339,10","335,30","högre"],["5","20 jul","338,70","337,10","högre"],["6","21 jul","339,50","338,50","högre"],["7","22 jul","348,00","341,30","högre"],["8","23 jul","352,00","339,10","högre"],["9","24 jul","354,80","338,70","högre"]]}',
    },
    {
      type: 'text',
      content:
        'Kursen kompakterar underlagets varningar till fyra fallgropar. ATT MEKANISERA UTAN URSPRUNGET: den som läser varje nia som en färdig handlingssignal utan att förstå att räkningen mäter utmattning gör om ögats misstag i ny förpackning — regeln är en översättning av en iakttagelse, och glöms iakttagelsen blir siffran tom. Volvo-efterspelet (+4,7 % efter nian) är det inbyggda motbeviset. KOMPLEXITET SOM TRYGGHET: DeMarks senare verk lägger lager på lager av undantag och filter, och känslan av stringens kan bli en drog — fler regler betyder fler grader att överanpassa samma historik med, inte automatiskt bättre frågor. Kursens hållning: förstå en regel djupt före nästa. RÄKNING I TOMRUM: i trendlös marknad fullbordas nior utan att någon rörelse tröttnat — verktyget hör hemma i tydliga svängar, inte i sidledsgyttja. BEKRÄFTELSENS FRÅNVARO: en observation utan villkor som ogiltigförklarar den är ingen metod — konfluens gäller även här.',
    },
    {
      type: 'insikt',
      content:
        'DeMark-kursen är Fas 3:s regelmaskin: där Torssell-kursen ger den svenska regelboken och Elliott-kurserna mönstren, ger den här kursen mekaniseringen — hur en iakttagelse (att svansen ser trött ut) blir en räkning två läsare delar. Räkneexemplet landar medvetet i samma Volvo-sväng som Fibonacci-kursens genomräkning: Fibonacci mäter hur djupt motrörelsen går, DeMark mäter hur trött rörelsen är — samma sväng, två komplementära frågor, och septemberfallet förkastade bådas hypoteser lika hedervärt. I AKM2-kulturen är arvet direkt: signaler som loggas och kan felas gör lärandet testbart, portföljmotorn övar räkningen, och AI-Mentorn kan ställa frågan vilka tal som skulle ogiltigförklara din nia. Kursen lär ut att konstruera regler — utbildning i metod, aldrig råd (2007:528).',
    },
  ],
  quiz: [
    {
      q: 'Vad är poängen med DeMarks räkneregler enligt kursens kärna?',
      alternativ: [
        'Att ögat ska träna skärpa genom ännu mer diagramläsning',
        'Att ersätta ögonmåttet med regler som ger två oberoende läsare exakt samma resultat från samma data',
        'Att förutsäga exakt vilken dag en vändning kommer att inträffa',
        'Att ersätta fundamental analys helt och hållet',
      ],
      ratt: 1,
      tips: 'Replikerbarheten är kriteriet — samma graf, samma svar, oavsett vem som räknar.',
    },
    {
      q: 'Vad kräver giltighetskontrollen för att en nia ska räknas som innehållsfull?',
      alternativ: [
        'Att volymen ökat varje räknad dag',
        'Att räkningen fullbordats inom tio handelsdagar',
        'Att dag 8:s eller dag 9:s högsta kurs sticker över både dag 6:s och dag 7:s högsta',
        'Att alla stängningarna ligger över 50-dagarsmedelvärdet',
      ],
      ratt: 2,
      tips: 'Regeln skyddar mot att räkna ett långsamt seglande uppåt utan acceleration.',
    },
    {
      q: 'Vad markerar en giltig nia enligt metoden?',
      alternativ: [
        'Utmattning i området — en observation att rörelsens bränsle håller på att ta slut, inte en klocka',
        'En exakt tidpunkt då vändningen kommer',
        'Att trenden har brutits och aldrig kommer tillbaka',
        'Att räkningen gäller vilken marknad som helst, även trendlös',
      ],
      ratt: 0,
      tips: 'Volvo-efterspelet (+4,7 % efter nian) är det inbyggda motbeviset mot tidtagarläsningen.',
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
