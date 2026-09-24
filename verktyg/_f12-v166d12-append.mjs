// v166-d12 — append:ar djupkapitel 15 "Från boken till egen analys" till
// data/bokmaster/the-master-swing-trader.json (append-only enligt DESIGN-v166).
// Underlag: data/forskning/KURS-FAS3/underlag-f12-swing.md (tal ORDAGRANTA).
import { readFileSync, writeFileSync } from 'node:fs';

const SOKVAG = '/home/ak1a/AK1/data/bokmaster/the-master-swing-trader.json';
const ra = readFileSync(SOKVAG, 'utf8');
const bok = JSON.parse(ra);

// Formattrott: filen ska vara pretty-2 + en avslutande nyrad (skrivs tillbaka identiskt).
if (JSON.stringify(bok, null, 2) + '\n' !== ra) {
  console.error('FEL: filen matchar inte JSON.stringify(bok, null, 2) + nyrad — avbryter.');
  process.exit(1);
}
// Append-förutsättningar.
if (bok.chapterCount !== 14 || bok.chapters.length !== 14 || bok.totalMinutes !== 177) {
  console.error('FEL: oväntad utgångspunkt —', bok.chapterCount, bok.chapters.length, bok.totalMinutes);
  process.exit(1);
}
const MINUTES = 13;
const Titel = 'Från boken till egen analys';

const tabellRader = [
  ['Element', 'Nivå', 'Varför just där', 'Kronor och procent'],
  ['Ingång (övning)', '100,50 kr', 'Slutkurs över basens tak — basen ~91–100 kr efter juli-botten 91,50 kr (23 juli)', '—'],
  ['Stopp', '96,50 kr', 'Under senaste högre botten (högre bottnar: 93,82 → 96,7 → 96,76)', 'Risk 4,00 kr = 4,0 %'],
  ['Mål', '112,50 kr', 'Zonen där det stora fallet 14 juli började (112,75)', 'Belöning 12,00 kr = 11,9 %'],
  ['Kvot belöning/risk', '—', '12,00 ÷ 4,00', '3,0'],
  ['Utfall A — stoppet nås', '—', '1 % riskregel på övningskapital 100 000 kr; position 1 000 ÷ 4,0 % = 25 000 kr', '−1 000 kr = −1,0 % av kapitalet'],
  ['Utfall B — målet nås', '—', 'Samma position: 25 000 × 11,9 %', '+2 985 kr ≈ +3,0 % av kapitalet'],
  ['Netto: en förlust + en vinst', '—', '−1 000 + 2 985', '+1 985 kr'],
  ['Väntevärde vid 40 % träffsäkerhet', '—', '0,4 × 11,9 − 0,6 × 4,0', '+2,4 % på positionen']
];

const kapitel = {
  num: 15,
  minutes: MINUTES,
  title: Titel,
  intro: 'Kursens sista kapitel: att bära Farleys hantverk från boksidorna till den egna kartan. Underlaget sammanfattar kärnan (varför svängar finns), den praktiska läsningen (kartan före dagen), ett genomräknat övningsexempel i svenska kronor, fallgroparna och kopplingen till resten av plattformen. Målet är en egen, förberedd analysprocess — aldrig en uppmaning.',
  blocks: [
    {
      type: 'text',
      content: 'Kärnan, förklarad med kursens bild: mellan dagsbruset och den långa trenden finns svängen — en prisrörelse som varar några få handelsdagar, ofta två till fem. Svängarna finns av två skäl. För det första kommer nyhetsflödena i stötar: rapporter, räntebesked och bolagshändelser faller inte jämnt över tiden, och varje tillslag flyttar priset tills ny information prissatts — sedan väntar marknaden på nästa. Priset rör sig därför i stötar och motstötar, inte i linjer. För det andra andas likviditeten: köpare och säljare är inte alltid närvarande i samma grad. När ena sidan drar sig undan rör sig priset lätt — få motparter — och när de återkommer stannar det. Obalans, rörelse, balans, vila: det är själva svängmekanismen. Farleys bidrag är att han ordnar detta i mönstercykler — samma faser återkommer (utmattning, vändning, utbrott, trend, konsolidering) och varje fas har sin egen logik. Svänghandeln blir därmed inte signaljakt utan hantverk: förberedelse, läsning och hantering av få, väl förberedda tillfällen.'
    },
    {
      type: 'text',
      content: 'Praktisk läsning är kursens dagliga ritual — och den sker före börsöppning. Steg ett, svängpunkterna: markera senaste betydande topp och botten på dagsgraf och veckograf. De avgränsar svängen och definierar riktningen — högre bottnar betyder att köparna håller, lägre toppar att säljarna håller. Steg två, gapen: öppningsglappet mot föregående dags slutkurs är information, och kursen typar det i tre slag — utbrottsgap som lämnar en bas med volym, fortsättningsgap mittemellan i en rörelse, och utmattningssgap som kommer brant och sent och töms under dagen. Gapet visar var brådstörtade beslut togs — och där blir nivåer ofta viktiga när kursen återvänder. Steg tre, nivåerna: föregående dags högsta och lägsta, veckans topp och botten, basens tak och golv samt tydliga stöd- och motståndszoner med datum; dit hör också var volymen var tung, för Farley korskontrollerar alltid pris med volym. Regeln som binder samman ritualen: beslutet ska vara förberett, inte improviserat — när kursen når en utsedd nivå vet eleven redan vad som skulle bekräfta eller förkasta läsningen.'
    },
    {
      type: 'utmaning',
      content: 'Bygg din egen karta före dagen — på papper, som övning. Välj en aktie du redan följer i kursens övningar. Före nästa börsöppning: rita svängpunkterna (dagsgraf och veckograf), typa eventuellt gap, och skriv ned nivåerna — föregående dags högsta och lägsta, veckans topp och botten, basens tak och golv samt stöd- och motståndszoner med datum — och markera var volymen var tung. Bestäm därefter tre övningstal i förväg: var en övningssväng ur basen skulle börja, var tesen vore fel (stopp) och var den vore färdig (mål), och skriv vid varje nivå vad som skulle bekräfta eller förkasta din läsning. Journalför efteråt med tre rader: vad förberedde jag, vad hände, vad lärde jag. Ingen order läggs — detta är en övning i förberedelse och utvärdering, inte en rekommendation (2007:528).'
    },
    {
      type: 'text',
      content: 'Räkneexemplet överförs från underlaget med dess käll- och övningsdeklaration ordagrant: Pedagogisk övning på historisk data, Ericsson B (ERIC-B.ST), källa Yahoo Finance, hämtat 2026-09-24 — en genomräkning, inte en rekommendation (2007:528). Utgångsläget: efter juli-botten 91,50 kr (23 juli) byggde kursen en bas ~91–100 kr med högre bottnar (93,82 → 96,7 → 96,76), och övningen är en sväng ur basen med tre tal bestämda i förväg. Ingång (övning): slutkurs 100,50 kr — över basens tak. Stopp: 96,50 kr — under senaste högre botten. Risk: 4,00 kr = 4,0 % av positionen. Mål: 112,50 kr — zonen där det stora fallet 14 juli började (112,75). Belöning: 12,00 kr = 11,9 %. Kvoten belöning/risk = 12,00 ÷ 4,00 = 3,0. Utfall A — stoppet nås: med 1 % riskregel på ett övningskapital om 100 000 kr är riskbudgeten 1 000 kr; positionen blir 1 000 ÷ 4,0 % = 25 000 kr och förlusten 25 000 × 4,0 % = −1 000 kr = −1,0 % av kapitalet. Svängen höll inte — övningen kostade exakt budgeten, inte mer. Utfall B — målet nås: vinsten blir 25 000 × 11,9 % = +2 985 kr ≈ +3,0 % av kapitalet. En förlust plus en vinst netto: −1 000 + 2 985 = +1 985 kr. Väntevärdets lektion: vid 3,0 i kvot räcker 40 % träffsäkerhet för positivt utfall per avslutad övning — 0,4 × 11,9 − 0,6 × 4,0 = +2,4 % på positionen. Eleven lär sig att kvoten — inte träffprocenten — bär resultatet. Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528).'
    },
    {
      type: 'tabell',
      content: JSON.stringify({
        rubrik: 'Övningssvängen Ericsson B — tre tal i förväg (källa: Yahoo Finance, hämtat 2026-09-24)',
        rader: tabellRader
      })
    },
    {
      type: 'text',
      content: 'Fallgroparna, fyra till antalet och kompakta i texten. Den första och värsta: överhandel — kursens huvudfallgrop. Svängar finns varje vecka, och frestelsen att vara med i alla är metodens död. Farley är tydlig: de bästa tillfällena är få; tålmodighet är en position. Kalendern med förberedda nivåer är skyddet — ingen nivå, inget beslut. Den andra: att tro att varje sväng är din. Vissa svängar tillhör trendföljaren, andra bashandelns motpart, och många tillhör ingen alls; att tvinga in varje rörelse i samma mall ger dåliga övningar. Frågan är alltid villkoren, aldrig själva rörelsen. Den tredje: gapet som alltid-signal. Ett gap bevisar brådstörtade beslut — inte riktning. Utan volymkontroll och läge i mönstercykeln är gapet bara ett glapp; kursen tränar typning först, tolkning sedan. Den fjärde: att flytta stoppet. När stoppet väl är satt är det kontraktet med sig själv. Att ”ge svängen lite mer tid” förvandlar en budgeterad småförlust till en obudgeterad stor — utfall A ovan förutsätter att 96,50 kr respekteras.'
    },
    {
      type: 'insikt',
      content: 'Ekosystemkopplingen: swing-kursen är Fas 3:s övning i beslutsprocesser, inte signaler — plattformens röda tråd. Kartan före dagen bygger vidare på F09:s frågeordning och F03:s konfluenslära (korskontrollen av pris, volym och läge är konfluens i praktiken); svängpunkterna är F01:s vågors kortaste grader, lästa med F08:s mönsteröga. Riskräkningen är samma procent- och budgetkultur som Fas 2:s trappsteg och portföljmotorns övningsytor tränar, och journalfrågorna — vad förberedde jag, vad hände, vad lärde jag — förs vidare till F14:s tre skärmar. I AI-Mentorn kan eleven låta modellen ställa sokratiska frågor till den egna processkartan. Kursen övar det hela ekosystemet vilar på: ett förberett, mätbart och utvärderat beslut — aldrig en uppmaning.'
    }
  ],
  quiz: [
    {
      q: 'Varför rör sig priset i svängar — kursens förklaring?',
      alternativ: [
        'Nyhetsflödena kommer i stötar och likviditeten andas — obalans, rörelse, balans, vila',
        'Alla aktier återgår till ett medelvärde på bestämda dagar',
        'Börskalendern fördelar rörelserna jämnt över året',
        'Svängar följer alltid valutakursen'
      ],
      ratt: 0,
      tips: 'Vilka två krafter får priset att röra sig i stötar och motstötar?'
    },
    {
      q: 'Vad bär resultatet i övningsexemplet — väntevärdets lektion?',
      alternativ: [
        'Träffprocenten — kvoten spelar ingen roll',
        'Antalet avslutade övningar per vecka',
        'Kvoten belöning/risk — vid 3,0 räcker 40 % träffsäkerhet för +2,4 % per avslutad övning',
        'Tajmningen i öppningsauktionen'
      ],
      ratt: 2,
      tips: 'Räkna på utfallen A och B: vad ger en förlust plus en vinst i netto?'
    },
    {
      q: 'Vilken är kursens huvudfallgrop i kapitlet?',
      alternativ: [
        'Att rita både dagsgraf och veckograf',
        'Att journalföra varje avslutad övning',
        'Överhandel — svängar finns varje vecka men de bästa tillfällena är få; tålmodighet är en position',
        'Att korskontrollera pris med volym'
      ],
      ratt: 1,
      tips: 'Vad säger Farley om hur många av veckans svängar som är värda förberedelse?'
    }
  ]
};

// Prefix-integritet: gamla kapitel och gamla chapters_list-poster sparas för jämförelse.
const gamlaChapters = JSON.stringify(bok.chapters);
const gamlaList = JSON.stringify(bok.chapters_list);

bok.chapters.push(kapitel);
bok.chapters_list.push({ num: 15, title: Titel, minutes: MINUTES });
bok.chapterCount = bok.chapters.length;          // 14 + 1 = 15
bok.totalMinutes = bok.chapters.reduce((s, k) => s + k.minutes, 0); // 177 + 13 = 190

// Verifiera append-only INNAN skriv: prefixen bit-identiska.
if (JSON.stringify(bok.chapters.slice(0, 14)) !== gamlaChapters) {
  console.error('FEL: befintliga kapitel ändrade — avbryter.');
  process.exit(1);
}
if (JSON.stringify(bok.chapters_list.slice(0, 14)) !== gamlaList) {
  console.error('FEL: befintliga chapters_list-poster ändrade — avbryter.');
  process.exit(1);
}
if (bok.chapterCount !== 15 || bok.totalMinutes !== 190) {
  console.error('FEL: summor fel —', bok.chapterCount, bok.totalMinutes);
  process.exit(1);
}

writeFileSync(SOKVAG, JSON.stringify(bok, null, 2) + '\n');
console.log('APPEND OK: kapitel 15, chapterCount', bok.chapterCount, ', totalMinutes', bok.totalMinutes,
  ', quiz', kapitel.quiz.length, ', block', kapitel.blocks.map(b => b.type).join('/'));
