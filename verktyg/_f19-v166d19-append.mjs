// v166-d19 — appenda djupkapitel 15 "Från boken till egen analys" i
// data/bokmaster/the-complete-turtletrader.json enligt DESIGN-v166.
// Append-only: kapitel 1–14, chapters_list 1–14 och övriga toppfält RÖRS EJ.
// F19-underlagets tal och deklarationer ÖVERFÖRS ORDAGRANT (inga nya tal).
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/the-complete-turtletrader.json';
const b = JSON.parse(fs.readFileSync(FIL, 'utf8'));

// Förvillkor: ren utgångspunkt enligt kontraktet
if (b.chapters.length !== 14 || b.chapterCount !== 14 || b.totalMinutes !== 168) {
  console.error(`FÖRVILLKOR FEL: len=${b.chapters.length} chapterCount=${b.chapterCount} totalMinutes=${b.totalMinutes}`);
  process.exit(1);
}
if (b.chapters.at(-1).num !== 14) { console.error('FÖRVILLKOR FEL: sista num != 14'); process.exit(1); }

const MIN = 12; // 168 + 12 = 180

const kap = {
  num: 15,
  minutes: MIN,
  title: 'Från boken till egen analys',
  intro: 'Kursens sista steg: från Covels bok till din egen analys. Kapitlet läser experimentet utifrån — samma regler, olika människor, utfall över hela spektrat — och räknar turtlarnas risklogik i miniatyr: tre hypotetiska affärer där stoppavståndet bestämmer positionens storlek och två förluster av tre ändå landar på plus. Siffrorna är konstruerade övningstal; lärdomen om asymmetrin är verklig.',
  blocks: [
    {
      type: 'text',
      content: 'Michael Covel rekonstruerar i The Complete TurtleTrader (2007) hela turtleexperimentet utifrån — motstycket till Curtis Faiths inifrånperspektiv (F18). Byggstenarna: 1983 lät Richard Dennis placera en annons där han sökte handelsassistenter till att lära sig hans system, med ett frågeformulär där färdigheter i poker och bridge vägde tyngre än ekonomiska examina. Enligt boken kom uppemot tusen ansökningar; ett tjugotal togs ut i två klasser (1983 och 1984), fick cirka två veckors undervisning, skriftliga regler och Dennis kapital att handla med. Programmet redovisade samlat vinster i storleksordningen 100 miljoner dollar — men siffran är historiens minst intressanta del. Det intressanta är spridningen: exakt samma regler, samma lärare, samma marknader — och utfall som spände över hela spektrat. Det är kursens pedagogiska kärna: Dennis och Eckhardt slog vad om huruvida handel kan läras ut, och svaret blev "reglerna kan läras ut — men utfallet följde inte reglerna, det följde människorna som använde dem". Historien är med andra ord inte en framgångssaga om ett system, utan ett stycke utbildningsforskning i naturligt format: vad är det träning faktiskt kan förmedla, och var går gränsen?'
    },
    {
      type: 'text',
      content: 'Covels mest användbara material är vad deltagarna gjorde efter utbildningen, dokumenterat i intervjuer. Tre spår syns. De som höll systematiken: Jerry Parker (Chesapeake Capital) behöll trendföljningen men förlängde tidsramarna till sin egen tålamodsnivå — en medveten, en gång fattad anpassning — och byggde ett förvaltningsbolag i miljardklassen; Liz Cheval (EMC Capital), Paul Rabar och Tom Shanks stannade i trendföljning i decennier. De som bröt: Covel låter flera deltagare själva berätta om brottet — signaler som hoppades över i efterhand för att de "uppenbart" var fel, affärer utanför systemet efter vinstsviter (övermod) eller under förlustsviter (tristess och olydnad). Brottet var sällan dramatiskt — det var små undantag som växte. Mönstret: de som höll gjorde en av två saker — följde reglerna mekaniskt, eller ändrade en gång, medvetet, till en variant de kunde leva med, och stannade sedan. De som bröt höll inte fast vid något alls: de improviserade mitt i. Och det obekväma: Dennis själv, regelverkets upphovsman, förlorade stort 1987–88 och avvecklade sin verksamhet, medan Eckhardt fortsatte — reglernas ägare hade inget eget skydd. Det är ytterligare ett bevis på att systemet aldrig var hemligheten.'
    },
    {
      type: 'utmaning',
      content: 'Veckans övning — spårsortering på papper: F14:s journallärdom i historisk förpackning. Skriv tre rubriker: höll mekaniskt · höll efter en medveten anpassning · bröt mitt i. Sortera under rubrikerna deltagarna du minns från boken — Parker, Cheval, Rabar, Shanks, och Dennis själv hör hemma någonstans — med en rad per person: vad gör att hen hamnar där (citat eller händelse, inte känsla). Lägg till en fjärde kolumn: du. Var hamnar dina tre senaste egna analys- eller placeringsbeslut enligt samma kriterier — och vad heter dina små undantag? Domarfrågan skrivs i förväg: vad skulle ett brott behöva för att synas i din journal innan det växt? Jämför efter en månad: stämmer sorteringen med det du faktiskt gjorde — regeln eller improvisationen?'
    },
    {
      type: 'text',
      content: 'Räkneexemplet, ordagrant ur underlaget: turtlarnas risklogik i miniatyr. Genomgångshypotetiskt exempel med konstruerade tal — inte historisk data. Startkapital 100 000 kr, risktaket 1 % av saldot per position. Turtlarnas logik: stoppavståndet bestämmer positionens storlek — aldrig tvärtom (F18:s fjärde systemfråga). Räkneverket: affär 1 köper 1 000 / 5 = 200 aktier, affär 2 köper 990 / 2,50 = 396 aktier, affär 3 köper 980 / 4 = 245 aktier som stängs vid trendföljarexiten: (110 − 80) × 245 = +7 350 kr. Kedjan: 0,99 × 0,99 × 1,075 ≈ 1,0536 — kontot slutar på 105 360 kr, +5,4 % trots två förluster av tre affärer. Tre utläsen. Först: förlusterna är mekaniskt avgränsade till 1 % var, oavsett hur den känns. Sedan: eftersom risken räknas på aktuellt saldo krymper positionerna automatiskt efter förluster — inbyggda bromsar, precis som turtlarnas enhetsstorlek efter volatiliteten. Slutligen: vinnaren får löpa medan förlustarna klipps — asymmetrin bär hela resultatet (F20 fördjupar förväntansvärdeslogiken). Kursunderlag — utbildning om hur metoden och historien fungerar; hypotetiska övningstal, inga investeringsråd, inga avkastningslöften (2007:528).'
    },
    {
      type: 'tabell',
      content: JSON.stringify({
        rubrik: 'Turtlarnas risklogik i miniatyr — 1 % risk, tre konstruerade affärer (hypotetiska övningstal, inte historisk data)',
        rader: [
          ['Affär', 'Saldo', 'Risk (1 %)', 'Ingång/stopp', 'Antal', 'Utfall', 'Nytt saldo'],
          ['1', '100 000', '1 000 kr', '100 / 95 kr', '200', 'stopp: −1 000 kr', '99 000'],
          ['2', '99 000', '990 kr', '50,00 / 47,50 kr', '396', 'stopp: −990 kr', '98 010'],
          ['3', '98 010', '980 kr', '80 / 76 kr', '245', 'trend-exit 110: +7 350 kr', '105 360']
        ]
      })
    },
    {
      type: 'text',
      content: 'Fyra fallgropar, kompakterade. Historieberättande som bevis: experimentet saknar kontrollgrupp, siffrorna bygger på intervjuer och har omdebatterats — även Covel har i efterhand ifrågasatt enstaka deltagares redovisade resultat. Att "följsamheten avgjorde" är i sig en tilltalande berättelse; kursen tränar eleven att se skillnaden mellan ett dokumenterat mönster och en bra historia om samma mönster. Survivorship-bias i legenden: turtlemyten räknar Parkers och Chevals fondframgångar och glömmer de som lämnade branschen — de synliga turtlarna är redan sorterade av tiden, och urvalet bär inte något vittnesbörd om metoden, bara om minnet. Decennieanpassning: 1980-talets råvarumarknader var ett gott decennium för trendregler; samma regler under andra marknadslägen ger andra kurvor (F18:s lärdom: en kort period är inget bevis). Att leta efter reglernas hemlighet: reglerna har varit publika i decennier — Faiths svar gäller fortfarande, de är värdefulla för få, de som faktiskt följer dem. Fallgropen är att samla regler i stället för att träna efterlevnad.'
    },
    {
      type: 'insikt',
      content: 'Dennis gav turtlarna tre saker: skrivna regler, kapital utan egen riskförlust, och en feedbackkultur i gruppen. Det är mallsatsen för AK1A:s ekosystem: kursinnehållet är reglerna, övningsytorna och pappersexemplen riskerar inget kapital, och AI-Mentorn med F14:s journal är feedbackslingan. Kurser kan ge två av tre — den tredje, kulturen, är det lärvägarna bygger över tid, och det är därför mentorskapet är en produkt och inte ett tillbehör. F18 (inifrån, Faith) och F19 (utifrån, Covel) berättar samma förlopp i två källor — eleven tränar källtriangulering, plattformens röda tråd: metod, dokumentation, källmärke — aldrig råd (2007:528). Fas 2:s procentkultur lever i tabellen, F20 avrundar med förväntansvärdet, och AKM2-analyserna visar samma gräns i bolagsanalys: systematik skiljd från åsikt.'
    }
  ],
  quiz: [
    {
      q: 'Vad blev turtleexperimentets egentliga fynd enligt Covel?',
      alternativ: [
        'De samlat redovisade vinsterna — cirka 100 miljoner dollar — bevisar att systemet var hemligheten',
        'Samma regler, samma lärare, samma marknader gav utfall över hela spektrat: reglerna kunde läras ut, men utfallet följde människorna som använde dem',
        'Urvalet avgjorde allt — bara deltagare med ekonomisk examen klarade av reglerna',
        'Experimentet visade att handel inte kan läras ut och att Dennis förlorade vadet'
      ],
      ratt: 1,
      tips: 'Siffran 100 miljoner kallas historiens minst intressanta del — spridningen är det intressanta.'
    },
    {
      q: 'Vad skilde de som höll systematiken från de som bröt?',
      alternativ: [
        'De som höll justerade reglerna löpande, varje månad, efter marknadsläget',
        'De som bröt följde reglerna exakt men råkade ut för ett ogynnsamt decennium',
        'De som höll följde reglerna mekaniskt eller ändrade en gång, medvetet, till en variant de kunde leva med — de som bröt improviserade mitt i',
        'Skillnaden låg i kapitalmängden — de som höll hade mest att handla för'
      ],
      ratt: 2,
      tips: 'Parkers förlängda tidsramar var en medveten, en gång fattad anpassning — inte ett pågående justerande.'
    },
    {
      q: 'Vad visar räkneexemblets kedja 0,99 × 0,99 × 1,075 ≈ 1,0536?',
      alternativ: [
        'Att förlusterna klipps mekaniskt vid 1 % var medan vinnaren får löpa — asymmetrin bär resultatet trots två förluster av tre affärer',
        'Att ett system med två förluster av tre affärer är felkonstruerat och ska överges',
        'Att 1 % risk per position alltid ger +5,4 % över tre affärer',
        'Att positionens storlek bestäms av önskad exponering och stoppet sätts i efterhand'
      ],
      ratt: 0,
      tips: 'Risken räknas på aktuellt saldo: positionerna krymper automatiskt efter förluster — och exits bär utfall, inte antalet träffar.'
    }
  ]
};

// Append-only
b.chapters.push(kap);
b.chapters_list.push({ num: 15, title: 'Från boken till egen analys', minutes: MIN });
b.chapterCount = b.chapters.length;
b.totalMinutes = b.chapters.reduce((s, c) => s + c.minutes, 0);

fs.writeFileSync(FIL, JSON.stringify(b, null, 2) + '\n', 'utf8');

// Efterkontroll: läs tillbaka och parse:a
const tillbaka = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const sum = tillbaka.chapters.reduce((s, c) => s + c.minutes, 0);
console.log(`APPEND KLAR: chapterCount=${tillbaka.chapterCount} (len ${tillbaka.chapters.length}), totalMinutes=${tillbaka.totalMinutes} (Σ ${sum}), sista kap num=${tillbaka.chapters.at(-1).num} "${tillbaka.chapters.at(-1).title}" minutes=${tillbaka.chapters.at(-1).minutes}, chapters_list len=${tillbaka.chapters_list.length}, post 15=${JSON.stringify(tillbaka.chapters_list[14])}`);
if (tillbaka.chapterCount !== 15 || tillbaka.totalMinutes !== 180 || sum !== 180) { console.error('EFTERKONTROLL FEL'); process.exit(1); }
console.log('GRÖN: append enligt kontraktet (15 kapitel, Σ 180 min).');
