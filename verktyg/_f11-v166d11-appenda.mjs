// v166-d11 — appenda djupkapitel 16 "Från boken till egen analys" till
// martin-pring-on-market-momentum.json enligt DESIGN-v166 (append-only).
import { readFileSync, writeFileSync } from 'node:fs';

const SOKVAG = 'data/bokmaster/martin-pring-on-market-momentum.json';
const rå = readFileSync(SOKVAG, 'utf8');
const d = JSON.parse(rå);

const befintliga = d.chapters.length;
const sisteNum = d.chapters[befintliga - 1].num;
const summaFore = d.chapters.reduce((a, c) => a + c.minutes, 0);
if (befintliga !== 15 || sisteNum !== 15 || summaFore !== 180) {
  throw new Error(`Förväntade 15 kapitel/Σ180, fann ${befintliga}/${sisteNum}/${summaFore}`);
}

const kapitel = {
  num: 16,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro: 'Kursens sista steg går från Prings bok till ditt eget papper: att läsa farten bredvid nivån, att klassificera en divergens steg för steg — och att räkna ett RSI för hand på verkliga kurser. Det är här begreppet blir din metod i stället för din läsning.',
  blocks: [
    {
      type: 'text',
      content: 'Prings centrala bild, förd till praktiken: priset talar om var marknaden befinner sig, momentum talar om med vilken fart och i vilken riktning den rör sig. Pris är position, momentum är hastighet — en bil kan stå på samma backe med motorn avslagen eller i full fart uppåt; positionen säger inget om vilket. Två aktiegrafer kan visa samma kursnivå och ändå beskriva två helt olika marknader: en där köpkraften håller på att sinna och en där den byggts upp. Därför kompletterar måtten varandra i stället för att konkurrera: prisgrafen ger nivån — trend, stöd, motstånd — och momentumgrafen ger det inre trycket. Prings iakttagelse, som du mötte i kapitel 9, är att det inre trycket ofta vänder FÖRE priset: farten avtar medan kursen fortfarande stiger, och prisvändningen kommer senare. Momentum är alltså inte en bättre prisindikator — det är ett mått på ett annat. Kursens grundsatser sammanfattas i tre läsregler: läs nivå ur pris, fart ur momentum, och läs dem alltid i samma tidsfönster.'
    },
    {
      type: 'text',
      content: 'Momentumdivergens är den klassiska övningen — pris och momentum pekar inte åt samma håll — och metoden går i sex steg. Ett: markera prisets tydliga svängar, topparna och bottnarna i valt fönster — inte varje småstickling. Två: fäst momentumpanelen under prisgrafen, RSI, MACD-histogram eller rate-of-change — samma period, samma datumaxel. Tre: jämför sväng för sväng — ny pristopp, högre eller lägre topp i momentum? Ny prisbotten, högre eller lägre botten? Fyra: klassificera. Pris gör lägre bottnar medan momentum gör högre är positiv divergens — nedgången tappar fart. Pris gör högre toppar medan momentum gör lägre är negativ divergens — uppgången tappar fart. Fem: kräv bekräftelse. Divergensen är ett tillstånd, inte en signal; Pring håller fast vid att momentumkurvan dessutom ska själv vända och slå sin referenslinje — till exempel mittdelen av RSI:s spann — innan läsningen får status av observation. Sex: dokumentera. Datum vid båda kurvornas svängar, måttvärden och ett villkor som skulle ogiltigförklara läsningen.'
    },
    {
      type: 'utmaning',
      content: 'Din egen divergensjournal, papper och penna: välj en aktie du känner väl, markera de tydliga svängarna i senaste halvåret och läs momentumpanelen sväng för sväng enligt de sex stegen. Avsluta med journalanteckningen steget sex kräver — datum vid båda kurvornas svängar, momentumvärdena och ett skrivet villkor som skulle ogiltigförklara din läsning. Övningen tränar avläsning: vad kurvorna lär om metoden, inte vad någon bör handla (2007:528).'
    },
    {
      type: 'text',
      content: 'Sedan räkningen — momentum satt i siffror, för hand. Verkliga slutkurser, Atlas Copco B (ATCO-B.ST), källa Yahoo Finance, hämtat 2026-09-24. Femton dagar ger fjorton förändringar — RSI-14:'
    },
    {
      type: 'tabell',
      content: JSON.stringify({
        rubrik: 'Femton dagar, fjorton förändringar — råmaterialet till RSI-14',
        rader: [
          ['Dag', 'Datum', 'Kurs', 'Förändring'],
          ['0', '2026-09-04', '175,95', '—'],
          ['1', '2026-09-07', '178,85', '+2,90'],
          ['2', '2026-09-08', '180,70', '+1,85'],
          ['3', '2026-09-09', '176,70', '−4,00'],
          ['4', '2026-09-10', '174,55', '−2,15'],
          ['5', '2026-09-11', '175,15', '+0,60'],
          ['6', '2026-09-14', '168,35', '−6,80'],
          ['7', '2026-09-15', '168,85', '+0,50'],
          ['8', '2026-09-16', '170,15', '+1,30'],
          ['9', '2026-09-17', '172,45', '+2,30'],
          ['10', '2026-09-18', '171,05', '−1,40'],
          ['11', '2026-09-21', '175,50', '+4,45'],
          ['12', '2026-09-22', '182,00', '+6,50'],
          ['13', '2026-09-23', '180,00', '−2,00'],
          ['14', '2026-09-24', '177,85', '−2,15']
        ]
      })
    },
    {
      type: 'text',
      content: 'Uppgångarna: 2,90 + 1,85 + 0,60 + 0,50 + 1,30 + 2,30 + 4,45 + 6,50 = 20,40. Nedgångarna: 4,00 + 2,15 + 6,80 + 1,40 + 2,00 + 2,15 = 18,50. Medelvinst U = 20,40 ÷ 14 = 1,457; medelförlust D = 18,50 ÷ 14 = 1,321. RS = U ÷ D = 1,457 ÷ 1,321 = 1,10. RSI = 100 − 100 ÷ (1 + 1,10) = 100 − 47,6 = 52,4. Lärdomen är Prings poäng i miniatyr: kursen står bara +1,1 % högre än för tre veckor sedan — men vägen dit innehöll både en nedgång på 6,80 kr (14 sep) och en uppgång på 6,50 kr (22 sep). Nivån är oförändrad, men momentumvärdet mitt emellan 0 och 100 avslöjar att köp- och säljkraft varit nästan jämnstarka: en marknad i jämvikt, inte i vila. För hand räknas enkelmedelvärdet så här; diagramprogram använder Wilders utjämning där gamla värden vägs ned rekursivt — logiken är densamma. Utbildningsmaterial — beskriver hur metoden läses och räknas; inga investeringsråd, inga avkastningslöften (2007:528). Kurser är historiska, källmärkta exempel.'
    },
    {
      type: 'text',
      content: 'Fyra fallgropar att bära med dig. Den första: divergensen som varar — en divergens kan bestå i veckor eller månader medan priset fortsätter i gamla riktningen; tillståndet säger att trycket avtar, inte att vändningen kommer imorgon, och därför kräver metoden bekräftelse innan något får kallas observation. Den andra: överköpt och översålt som automatik i trend — i en stark trend kan RSI stanna över 70 i lång tid, och det är tecken på trendens styrka, inte en säljsignal; 70/30 är en fråga om marknadsregim, där trösklarna säger långt mindre i en trendig marknad och mer i en sidledes. Den tredje: multipla mått, en signal — RSI, rate-of-change och stochastic mäter nästan samma fart, så fem bekräftande indikatorer är ett mått räknat fem gånger; Pring håller indikatorerna få. Den fjärde: fönsterförväxlingen — RSI-14 på dagsdata och på veckodata beskriver olika världar, och momentum läses alltid med angivet fönster, i samma zoomnivå som prisgrafen.'
    },
    {
      type: 'insikt',
      content: 'Momentumkursen är Fas 3:s fart-block i ekosystemet: den bygger på F09:s visuella trappa — se först, mät sedan — och matar F03 Konfluens, där teknisk struktur och fundamental bana (F02) möts; momentum är en av de källor konfluensen väger. I AKM2-analyserna blir momentumtidshorisonten den korta, reaktiva delen av femhorisontsläsningen, och räknekulturen i det här kapitlet — procent, datum, källmärke — är rak arvslinje från Fas 2. AI-Mentorn kan ställa frågan du nu kan besvara: vad säger farten som nivån tiger om? I portföljmotorns övningsytor upprepas RSI-räkningen tills handen minns den. Det är kursens egentliga leverans: Prings verktyg som övning — att mäta trycket, inte gissa på det.'
    }
  ],
  quiz: [
    {
      q: 'Vad är relationen mellan pris och momentum i Prings läsning?',
      alternativ: [
        'Priset talar om var marknaden befinner sig, momentum om med vilken fart och i vilken riktning den rör sig',
        'Momentum är en förbättrad prisindikator som bör ersätta prisgrafen',
        'Pris och momentum mäter samma sak och är utbytbara',
        'Momentum talar om marknadens nivå och priset om dess fart'
      ],
      ratt: 0,
      tips: 'Positionen säger inget om farten — bilen på backe kan stå still eller köra i full fart uppåt.'
    },
    {
      q: 'När får en momentumdivergens status av observation enligt metoden?',
      alternativ: [
        'Så snart pris och momentum pekar olika — divergensen är i sig en signal',
        'När momentumkurvan dessutom själv vänt och slagit sin referenslinje',
        'Först när priset har vänt och bekräftat en ny riktning',
        'När fem olika momentumindikatorer visar samma divergens'
      ],
      ratt: 1,
      tips: 'Divergensen är ett tillstånd, inte en signal — bekräftelsen är metodens femte steg.'
    },
    {
      q: 'Räkneexemplet gav Atlas Copco B RSI 52,4 efter femton dagar — vad säger det värdet om marknaden?',
      alternativ: [
        'Marknaden var överköpt och nära en vändning nedåt',
        'Marknaden var översåld och nära en vändning uppåt',
        'Köp- och säljkraften varit nästan jämnstarka — en marknad i jämvikt, inte i vila',
        'Värdet visar att kursen med hög säkerhet stiger närmaste veckan'
      ],
      ratt: 2,
      tips: 'Kursen stod bara +1,1 % högre än tre veckor tidigare — ett mitt emellan 0 och 100 betyder jämnstyrka.'
    }
  ]
};

// Append-only: chapters + chapters_list (nya posten som {num,title,minutes}
// enligt DESIGN-v166 rad 31; befintliga strängposter RÖRS EJ).
d.chapters.push(kapitel);
d.chapters_list.push({ num: 16, title: 'Från boken till egen analys', minutes: 13 });
d.chapterCount = d.chapters.length;
d.totalMinutes = d.chapters.reduce((a, c) => a + c.minutes, 0);

const ut = JSON.stringify(d, null, 2) + '\n';
writeFileSync(SOKVAG, ut);

// Bit-identitetskontroll för kapitel 1–15: gamla objektvärden ska finnas
// oförändrade i nya filen (formateringen var stringify(…,null,2)+'\n').
const d2 = JSON.parse(ut);
if (JSON.stringify(d2.chapters.slice(0, 15)) !== JSON.stringify(d.chapters.slice(0, 15))) {
  throw new Error('Befintliga kapitel ändrade sig — ABRYTER');
}
console.log('APPEND KLAR:', d2.chapterCount, 'kapitel, Σ', d2.totalMinutes, 'min, chapters_list', d2.chapters_list.length);
