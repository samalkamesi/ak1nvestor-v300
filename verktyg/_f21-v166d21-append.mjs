#!/usr/bin/env node
// v166-d21 — appenda djupkapitel 15 "Från boken till egen analys" till
// data/bokmaster/trading-in-the-zone.json (append-only, DESIGN-v166).
// Underlag: data/forskning/KURS-FAS3/underlag-f21-trading-in-zone.md
// (granskat v164). Tal överförs ORDAGRANT — inga nya tal hittas på.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/trading-in-the-zone.json';
const raw = fs.readFileSync(FIL, 'utf8');
const j = JSON.parse(raw);

if (j.chapters.length !== 14 || j.chapterCount !== 14 || j.totalMinutes !== 160) {
  throw new Error(`Förväntade 14 kapitel/160 min — fann ${j.chapters.length}/${j.chapterCount}/${j.totalMinutes}`);
}

// Deklarationer ORDAGRANT ur underlaget (juridikgrind 2007:528)
const RAKNEDEKLARATION = 'Genomgång på antaganden, ingen rekommendation (2007:528).';
const JURIDIKDEKLARATION =
  'Utbildningsmaterial — beskriver hur metoden och psykologin fungerar med genomskinliga räkneexempel på antaganden; inga investeringsråd, inga avkastningslöften (2007:528).';

// Tabellens data (underlagets tabell, ordagrant) — serialiseras till inre JSON-sträng
const tabellData = {
  rubrik: 'Tio affärer med 55 % vinstchans — tre möjliga serier av samma process (V = vinst +1R · F = förlust −1R; genomgång på antaganden)',
  rader: [
    ['Serie', 'Utfall', 'V/F', 'Känsla under vägen', 'Summa'],
    ['A', 'V V V F V F F V F V', '6/4', '"Jag har koll" — eufori efter drömstarten', '+2R'],
    ['B', 'F F F F F V V V V V', '5/5', '"Kanten är fejk" — förtvivlan, vändning till slut', '0R'],
    ['C', 'V F F V F V F F V V', '5/5', 'Vågig, tråkig — inget dramatiskt alls', '0R'],
  ],
};

const kapitel = {
  num: 15,
  minutes: 12,
  title: 'Från boken till egen analys',
  intro:
    'Kursens sista steg: från Douglas bok till din egen serie. Kärnan bärs med oss — resultatet av en enskild affär är obetydligt, fördelningen över serien är allt — och räkneexemplet visar varför: tio affärer med 55 procents vinstchans räknas genom tre möjliga serier, där aritmetiken avslöjar hur lite varje tiopack säger om kanten.',
  blocks: [
    {
      type: 'text',
      content:
        'Mark Douglas bud går att sammanfatta i en mening: resultatet av en enskild affär är obetydligt — fördelningen över serien är allt. Marknaden säljer inte visshet. En kant är bara en obalans i sannolikheter, exempelvis 55 mot 45 — aldrig ett löfte om nästa utfall (kapitel 8). Nybörjaren söker säkerheten i varje enskild affär; veteranen har accepterat att frågan är obesvarbar och har i stället en process vars fördelning hon hoppas är positiv. Zonen är det mentala tillstånd där varje utfall redan är accepterat i förväg — inte likgiltighet utan fokuserat lugn: energin läggs på att följa reglerna, inte på nästa utfall (kapitel 11).\n\nKursen ställer detta mot kasinots logik (kapitel 8:s analogi): kasinot vet inte hur en enskild snurr landar, men hjulets fasta sannolikheter gör utfallet av en omgång ointressant. Din skillnad mot kasinot: du äger inte hjulet — du äger en metod och måste mäta om dess fördelning bär. Därför blir journalföringen (trading-rummets disciplin, F14) och aritmetiken (förväntansvärdet, F20) kursens bevisverktyg: det du kan bokföra kan du räkna på — och det du kan räkna på kan du bära.',
    },
    {
      type: 'text',
      content:
        'Praktisk läsning: Douglas fem grundsanningar är kursens ryggrad (kapitel 10 citerade dem i helhet), och här görs varje sanning till en skrivövning — inte en plakattext att memorera.\n\nETT: Allt kan hända. Priset styrs av andra människors beslut; ingen regel tvingar nästa affär att likna den senaste.\nTVÅ: Du behöver inte veta vad som händer härnäst. Utdelningen kommer från serien, inte från spåkraft — okunnighet om utfall är inget hinder.\nTRE: Vinster och förluster är slumpmässigt fördelade för varje given kant. Strängen av utfall går inte att förutsäga, bara fördelningen.\nFYRA: En kant är bara högre sannolikhet för ett utfall än ett annat — en indikation, aldrig visshet.\nFEM: Varje ögonblick på marknaden är unikt. Minnen av samma läge förra gången är associationer, inte data.\n\nLäsningssättet är aktivt: markera den sanning som provocerar dig mest — den pekar ut var ditt motstånd sitter (övningen nedan gör det till regelverk).',
    },
    {
      type: 'utmaning',
      content:
        'Övningen i två steg, på papper.\n\nSTEG 1 — SANNINGEN SOM PROVOCERAR. Markera den av de fem som väcker mest motstånd och skriv varför, i helmeningar. Provokationen pekar ut var motståndet sitter: den sanning du helst vill förneka är den föreställning som störst styrker dina beslut. Skriv därefter vad som skulle förändras i din process om du trodde på den fullt ut.\n\nSTEG 2 — DET MENTALA LÅSET. En serie om 20 affärer bokförs i förväg som ett stickprov — kapitel 12:s mekaniska period i papperformat. Innan serien startar skrivs villkoren: vilken metod som följs, samma fördefinierade risk per beslut (i kronor eller procent), utfall bokförs i riskmultiplar (vinst +1R, förlust −1R) och en rad känsloläge per affär — utan omdöme. Utvärderingen får ske först när stickprovet är fullt: beslut före slumpen, omdöme efter serien. Vid seriens slut ställs den verkliga fördelningen mot den planerade i journalen — träning i metod, utbildning och inte råd (2007:528).',
    },
    {
      type: 'text',
      content: `Räkneexemplet, ordagrant ur underlaget: tio affärer med 55 % vinstchans.\n\n${RAKNEDEKLARATION} Genomgång på antaganden: vinstchans 55 % per affär, mått i riskmultiplar (R) som F14:s journal tränar — vinst +1R, förlust −1R. Tre möjliga utfall av samma serie, med känslan som olisikerad passagerare, visas i tabellen nedan.`,
    },
    {
      type: 'tabell',
      content: JSON.stringify(tabellData),
    },
    {
      type: 'text',
      content:
        'Samma process, samma väntevärde (0,55 per affär) — tre helt olika känslor. Aritmetiken som kursen visar fram:\n\nExakt 5 vinster av 10 (väntevärdet!) inträffar bara i ~23 % av serierna — det vanligaste är alltså att avvika från väntevärdet.\n≤4 vinster: ~26 %. Var fjärde tiopack ser ut som bevis för att kanten är borta — i serie B var den hel normal.\n≥7 vinster: ~27 %. Var fjärde tiopack känns som att koden är bruten — också det slumpen.\nSerie A:s drömstart: tre raka vinster sker i 0,55³ ≈ 17 % av serierna. Serie B:s mardröm: fem raka förluster i 0,45⁵ ≈ 1,8 % — ovanligt, men inget logiskt fel i kanten.\n\nVäntat resultat per tiopack är 5,5R; över hundratals affärer konvergerar andelen mot 55 % (lagen om stora tal), medan tiopacken avviker som regel. Utläset: ordningen är slump, fördelningen är metod — utvärdera aldrig en kant på en serie känslor.',
    },
    {
      type: 'text',
      content:
        'Fyra fallgropar, kompakterade.\n\nIDENTITET PER AFFÄR: den som kopplar självbild till utfall (förlust lika med jag är dålig) börjar handla för att bevisa något, inte för en kant — och förmågan att stänga en förlorare försvinner först.\nREPRESENTATIVHETSGENVÄGEN: fem raka vinster tolkas som att metoden behärskas, med storleksökning på känsla — fast ≥7/10 händer i 27 % av serierna med vilken kant som helst.\nTILLGÄNGLIGHETSGENVÄGEN: senaste förlusten väger tyngst i minnet; en normal 4/10-serie får bära hela ansvaret för systemets död.\nHÄMTNINGSBETEENDET: efter förluster dubbleras storleken för att ta tillbaka — beslutet flyttar dig från din egen fördelning till exakt den känslodrivna spelstil sanningarna finns för att skydda emot.',
    },
    {
      type: 'insikt',
      content: `F21 är Fas 3:s psykologiska cement. Fas 2 lärde strukturerad analys — AKM2:s dimensioner, procentkulturen, vad som är värt att äga. Fas 3:s tekniska linje (F11–F20) gav verktygen och räknenervet: F20 beräknade förväntansvärdet, det här kapitlet förklarar varför kanten känns så svår att bära — för att varje tiopack kan ljuga om den. Tillsammans blir det plattformens modell i två skikt: analysen väljer objekt och metod, sannolikhetstänkandet får dig att följa metoden dagen då serien är grå. AI-Mentorn kan förhöra dig på de fem sanningarna; journalen (F14) mäter den verkliga fördelningen att ställa mot den planerade; kapitel 14:s syntes — quiz som sannolikhets träning, AK1TS som känslans frizon — är samma logik i ekosystemets stomme. Röda tråden hålls hela vägen: metod och genomskinlig aritmetik — aldrig råd. ${JURIDIKDEKLARATION}`,
    },
  ],
  quiz: [
    {
      q: 'Vad är en kant enligt Douglas — riktigt läst?',
      alternativ: [
        'Ett löfte om att nästa affär slår väl ut när setupen är tillräckligt god',
        'En obalans i sannolikheter — exempelvis 55 mot 45 — en indikation, aldrig visshet om nästa utfall',
        'En metod som med rätt inställning kan undvika enskilda förluster',
        'Ett mått på hur många vinster i rad metoden kommer generera',
      ],
      ratt: 1,
      tips: 'Marknaden säljer inte visshet — kanten lever i fördelningen, aldrig i den enskilda affären.',
    },
    {
      q: 'Vad visar räkneexemblets fynd att exakt 5 vinster av 10 inträffar bara i ~23 % av serierna?',
      alternativ: [
        'Att det vanligaste är att avvika från väntevärdet — ett tiopack utan 5/5 är normalt, inget bevis emot kanten',
        'Att antagandet 55 % är felräknat och bör korrigeras',
        'Att en serie med fyra förluster ska avbrytas innan den blir fem',
        'Att väntevärdet 0,55 per affär bara gäller i teorin',
      ],
      ratt: 0,
      tips: 'Väntat resultat per tiopack är 5,5R — men lagen om stora tal kräver hundratals affärer innan andelen närmar sig 55 %.',
    },
    {
      q: 'Vad är det mentala låset i övningen?',
      alternativ: [
        'Att varje affär utvärderas separat medan känslan av serien är färsk',
        'Att tre raka vinster räcker som bevis för att fördelningen bär',
        'Att ett i förväg bokfört stickprov — tjugo affärer — utvärderas först när det är fullt: beslut före slumpen, omdöme efter serien',
        'Att minnet av tidigare liknande lägen får vägleda bedömningen',
      ],
      ratt: 2,
      tips: 'Varje ögonblick är unikt — minnen är associationer, inte data; journalen mäter fördelningen.',
    },
  ],
};

j.chapters.push(kapitel);
j.chapters_list.push({ num: 15, title: 'Från boken till egen analys', minutes: 12 });
j.chapterCount = j.chapters.length;
j.totalMinutes = j.chapters.reduce((a, c) => a + c.minutes, 0);

fs.writeFileSync(FIL, JSON.stringify(j, null, 2) + '\n');
console.log(
  `APPEND klart: chapterCount=${j.chapterCount}, totalMinutes=${j.totalMinutes}, chapters_list=${j.chapters_list.length} poster`,
);
