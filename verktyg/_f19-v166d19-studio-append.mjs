// v166-d19 — appenda djupkapitel 15 "Från boken till egen analys" i
// data/bokmaster/the-complete-turtletrader.json enligt DESIGN-v166
// (f19-underlaget; append-only; formatvakt som d13).
import fs from 'node:fs';

const SOKVAG = 'data/bokmaster/the-complete-turtletrader.json';
const rå = fs.readFileSync(SOKVAG, 'utf8');
const slutNyrad = rå.endsWith('\n');
const bok = JSON.parse(rå);
if (JSON.stringify(bok, null, 2) + (slutNyrad ? '\n' : '') !== rå) {
  throw new Error('filen avviker från JSON.stringify(x, null, 2)-format — avbryter');
}
if (bok.chapterCount !== 14 || bok.chapters.length !== 14 || bok.totalMinutes !== 168) {
  throw new Error(`oväntad utgångspunkt: ${bok.chapterCount}/${bok.chapters.length}/${bok.totalMinutes}`);
}
if (bok.chapters.at(-1).title === 'Från boken till egen analys') {
  throw new Error('djupkapitlet finns redan — dubbelappend förhindrad');
}

const kap = {
  num: 15,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro: 'Fjorton kapitel har berättat Turtle-sagan utifrån — det här tar steget till egen analys. Du får mönstret de-som-höll och de-som-bröt att sortera i en egen journal, det obekväma vittnesmålet om regelverkets upphovsman — och ett genomräknat hypotetiskt exempel: 1 % risk, två förluster, en vinnare. Underlaget är det granskade v164-arbetet (f19, 2026-09-24); allt nedan är utbildning om hur metoden och historien fungerar — inte investeringsråd (2007:528).',
  blocks: [
    {
      type: 'text',
      content: 'Covels bok har en enda bärande tanke, och den är värd att upprepa vid varje egen läsning: reglerna kan läras ut — men utfallet följde inte reglerna, det följde människorna som använde dem. Michael Covel rekonstruerar hela turtleexperimentet utifrån — motstycke till Curtis Faiths inifrånperspektiv. Byggstenarna: 1983 lät Richard Dennis placera en annons där han sökte handelsassistenter till att lära sig hans system, med frågeformulär där färdigheter i poker och bridge vägde tyngre än ekonomiska examina. Enligt boken kom uppemot tusen ansökningar; ett tjugotal togs ut i två klasser (1983 och 1984), fick cirka två veckors undervisning, skriftliga regler och Dennis kapital att handla med. Programmet redovisade samlat vinster i storleksordningen 100 miljoner dollar — men siffran är historiens minst intressanta del.\n\nDet intressanta är spridningen: exakt samma regler, samma lärare, samma marknader — och utfall som spände över hela spektrat. Det är kursens pedagogiska kärna: Dennis och Eckhardt slog vad om huruvida handel kan läras ut, och svaret blev ett stycke utbildningsforskning i naturligt format: vad är det träning faktiskt kan förmedla, och var går gränsen?'
    },
    {
      type: 'text',
      content: 'Det praktiska materialet är vad deltagarna gjorde efter utbildningen, dokumenterat i intervjuer. Tre spår syns — och eleven lär sig skilja dem:\n\n1. De som höll systematiken. Jerry Parker (Chesapeake Capital) behöll trendföljningen men förlängde tidsramarna till sin egen tålamodsnivå — en medveten, en gång fattad anpassning — och byggde ett förvaltningsbolag i miljardklassen. Liz Cheval (EMC Capital), Paul Rabar och Tom Shanks stannade i trendföljning i decennier.\n2. De som bröt. Covel låter flera deltagare själva berätta om brottet: signaler som hoppades över i efterhand för att de "uppenbart" var fel, affärer utanför systemet efter vinstsviter (övermod) eller under förlustsviter (tristess och olydnad). Brottet var sällan dramatiskt — det var små undantag som växte.\n3. Mönstret. De som höll gjorde en av två saker: följde reglerna mekaniskt, eller ändrade en gång, medvetet, till en variant de kunde leva med — och stannade sedan. De som bröt höll inte fast vid något alls: de improviserade mitt i.\n\nCovel noterar också det obekväma: Dennis själv, regelverkets upphovsman, förlorade stort 1987–88 och avvecklade sin verksamhet, medan Eckhardt fortsatte. Reglernas ägare hade inget eget skydd — ytterligare ett bevis på att systemet aldrig var hemligheten.'
    },
    {
      type: 'utmaning',
      content: 'Bygg din egen turtle-journal — papper räcker, inget kapital riskeras. Skriv först tre egna regler att följa under en månad: en om risk (t.ex. hur stor del av övningskapitalet en enda läsning får riskera), en om dokumentation (när journalen skrivs, alltid före och efter), en om ogiltigförklaring (vad som gör en läsning övergiven). Följ dem mekaniskt på pappersexempel. Varje avvikelse noteras med sin klassificering: övermod (kom efter en vinstsvit), tristess (kom efter stillhet), olydnad (jag visste bättre än regeln). Månadens sluträkning: hur många avvikelser, vilken sorts, hur stora? Till sist Parker-frågan: vilken av dina tre regler skulle du kunna ändra en gång, medvetet, och leva med — och vilka är rent mekaniska? AI-Mentorn fungerar gärna som motfrågare på svaren.'
    },
    {
      type: 'text',
      content: 'Nu genomräkningen. Genomgångshypotetiskt exempel med konstruerade tal — inte historisk data. Startkapital 100 000 kr, risktaket 1 % av saldot per position. Turtlarnas logik i miniatyr: stoppavståndet bestämmer positionens storlek — aldrig tvärtom.\n\nRäkneverket: affär 1 köper 1 000 / 5 = 200 aktier, affär 2 köper 990 / 2,50 = 396 aktier, affär 3 köper 980 / 4 = 245 aktier som stängs vid trendföljarexiten: (110 − 80) × 245 = +7 350 kr. Kedjan: 0,99 × 0,99 × 1,075 ≈ 1,0536 — kontot slutar på 105 360 kr, +5,4 % trots två förluster av tre affärer.\n\nTre utläsen. Först: förlusterna är mekaniskt avgränsade till 1 % var, oavsett hur den känns. Sedan: eftersom risken räknas på aktuellt saldo krymper positionerna automatiskt efter förluster — inbyggda bromsar, precis som turtlarnas enhetsstorlek efter volatiliteten. Slutligen: vinnaren får löpa medan förlustarna klipps — asymmetrin bär hela resultatet (förväntansvärdeslogiken fördjupas i trendföljarbibeln).'
    },
    {
      type: 'tabell',
      content: '{"rubrik":"Hypotetiskt exempel med konstruerade tal — inte historisk data (startkapital 100 000 kr, risktak 1 % av saldot per position)","rader":[["Affär","Saldo","Risk (1 %)","Ingång/stopp","Antal","Utfall","Nytt saldo"],["1","100 000","1 000 kr","100 / 95 kr","200","stopp: −1 000 kr","99 000"],["2","99 000","990 kr","50,00 / 47,50 kr","396","stopp: −990 kr","98 010"],["3","98 010","980 kr","80 / 76 kr","245","trend-exit 110: +7 350 kr","105 360"]]}'
    },
    {
      type: 'text',
      content: 'Fyra fallgropar, kompakterade — alla fyra sitter i gränsen mellan historien och det dokumenterade:\n\n1. Historieberättande som bevis. Experimentet saknar kontrollgrupp; siffrorna bygger på intervjuer och har omdebatterats — även Covel har i efterhand ifrågasatt enstaka deltagares redovisade resultat. Att "följsamheten avgjorde" är en tilltalande berättelse; skillnaden mellan ett dokumenterat mönster och en bra historia om samma mönster är själva träningen.\n2. Survivorship-bias i legenden. Turtlemyten räknar Parkers och Chevals fondframgångar och glömmer de som lämnade branschen. De synliga turtlarna är redan sorterade av tiden — urvalet bär inget vittnesbörd om metoden, bara om minnet.\n3. Decennieanpassning. 1980-talets råvarumarknader var ett gott decennium för trendregler; samma regler under andra marknadslägen ger andra kurvor — en kort period är inget bevis.\n4. Att leta efter reglernas hemlighet. Reglerna har varit publika i decennier. Faiths svar gäller fortfarande: de är värdefulla för få — de som faktiskt följer dem. Fallgropen är att samla regler i stället för att träna efterlevnad.'
    },
    {
      type: 'insikt',
      content: 'Här knyts boken till ekosystemet — mentorskapets roll. Dennis gav turtlarna tre saker: skrivna regler, kapital utan egen riskförlust, och en feedbackkultur i gruppen. Det är mallsatsen för AK1A:s ekosystem: kursinnehållet är reglerna, övningsytorna och pappersexemplen riskerar inget kapital, och AI-Mentorn med journalen är feedbackslingan. Kurser kan ge två av tre — den tredje, kulturen, är det lärvägarna bygger över tid, och det är därför mentorskapet är en produkt och inte ett tillbehör. Faiths inifrånperspektiv och Covels utifrånperspektiv berättar samma förlopp i två källor — eleven tränar källtriangulering, plattformens röda tråd: metod, dokumentation, källmärke — aldrig råd. Fas 2:s procentkultur lever i tabellen, förväntansvärdet avrundar serien, och AKM2-analyserna visar samma gräns i bolagsanalys: systematik skiljd från åsikt. Kursunderlag — utbildning om hur metoden och historien fungerar; hypotetiska övningstal, inga investeringsråd, inga avkastningslöften (2007:528).'
    }
  ],
  quiz: [
    {
      q: 'Vad blev svaret i Dennis och Eckhardts vadslagning om huruvida handel kan läras ut?',
      alternativ: [
        'Handel kan inte läras ut — turtlarnas resultat kom av medfödd begåvning',
        'Reglerna kan läras ut — men utfallet följde inte reglerna, det följde människorna som använde dem: samma regler, samma lärare, samma marknader, och utfall över hela spektrat',
        'Systemet var hemligheten — alla som fick reglerna lyckades',
        'Utbildningen misslyckades eftersom Dennis själv förlorade stort 1987–88'
      ],
      ratt: 1,
      tips: 'Spridningen bland deltagarna är kärnan — inte summan på vinsterna.'
    },
    {
      q: 'Vad visar det hypotetiska räkneexemplet med 1 % risk, två förluster och en vinnare?',
      alternativ: [
        'Att trendföljning alltid ger positiv avkastning över tre affärer',
        'Att positionsstorleken bestäms av en månatlig avkastningsmålsättning',
        'Att förlusterna mekaniskt avgränsas till 1 % var, att positionerna krymper automatiskt efter förluster (risken räknas på aktuellt saldo), och att vinnaren får löpa — kedjan slutar +5,4 % trots två förluster av tre affärer',
        'Att stoppavståndet beräknas efter hur många aktier man redan äger'
      ],
      ratt: 2,
      tips: 'Stoppavståndet bestämmer positionens storlek — aldrig tvärtom.'
    },
    {
      q: 'Vilket påstående om mönstret bland deltagarna är kursens?',
      alternativ: [
        'De som höll följde reglerna mekaniskt eller ändrade en gång, medvetet, till en variant de kunde leva med — de som bröt improviserade mitt i, och brottet var sällan dramatiskt: små undantag som växte',
        'Alla som bröt mot reglerna lämnade branschen omgående',
        'De som höll hade hemlig tillgång till Dennis egna positioner',
        'Jerry Parker bröt med trendföljningen och byggde sin framgång på kortsiktighet'
      ],
      ratt: 0,
      tips: 'Håll-spåren: mekaniskt eller ett medvetet en-gångs-val. Break-spåren: improvisation mitt i.'
    }
  ]
};

bok.chapters.push(kap);
bok.chapterCount = 15;
bok.totalMinutes = 181;
bok.chapters_list.push({ num: kap.num, title: kap.title, minutes: kap.minutes });

fs.writeFileSync(SOKVAG, JSON.stringify(bok, null, 2) + (slutNyrad ? '\n' : ''));
console.log('APPEND KLAR: kapitel 15 · chapterCount 14→15 · totalMinutes 168→181 · chapters_list 14→15');
