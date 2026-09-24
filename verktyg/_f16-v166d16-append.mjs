// v166-d16 — appenda djupkapitel 15 "Från boken till egen analys" till
// data/bokmaster/bollinger-on-bollinger-bands.json (append-only, DESIGN-v166).
// Källunderlag: data/forskning/KURS-FAS3/underlag-f16-bollinger.md (v164, granskat).
// Tal ÖVERFÖRS ORDAGRANT från underlaget — inga nya tal hittas på.
import { readFileSync, writeFileSync } from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/bollinger-on-bollinger-bands.json';
const j = JSON.parse(readFileSync(FIL, 'utf8'));

// --- Preconditions (append-only-säkring) ---
if (j.chapterCount !== 14) throw new Error(`chapterCount ${j.chapterCount} ≠ 14`);
if (j.totalMinutes !== 170) throw new Error(`totalMinutes ${j.totalMinutes} ≠ 170`);
if (j.chapters.length !== 14) throw new Error(`chapters.length ${j.chapters.length} ≠ 14`);
if (j.chapters_list.length !== 14) throw new Error(`chapters_list.length ${j.chapters_list.length} ≠ 14`);
if (j.chapters.some(c => c.title === 'Från boken till egen analys')) throw new Error('kapitlet finns redan');

const KALLDEKL = 'Pedagogisk genomräkning på verkliga dagsslutkurser, Ericsson B (ERIC-B.ST), källa Yahoo Finance, hämtat 2026-09-24 — en övning i att räkna, inte en rekommendation (2007:528).';
const UTBDEKL = 'Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528).';

const kapitel = {
  num: 15,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro: 'Femtonde och sista steg: från Bollingers bok till ditt eget papper. Banden är volatilitetens fickor — och i detta kapitel räknar du dem själv, för hand, på verkliga dagsslutkurser.',
  blocks: [
    {
      type: 'text',
      content: 'Kärnan, en gång till — nu som arbetsredskap. På 1980-talet löste John Bollinger ett praktiskt problem: band med fast bredd — till exempel medelvärdet ± 5 % — blir översvallande när marknaden är lugn och snäva när den stormar. Hans svar: låt bandens bredd styras av volatiliteten själv. Resultatet är tre linjer. I mitten ett enkelt glidande medelvärde över 20 dagar; runt det ett band på medelvärdet ± 2 standardavvikelser på var sida. Standardavvikelsen är spridningsmåttet: hur långt, i kronor, kurserna i snitt ligger från sitt eget medelvärde. Sprider sig slutkurserna vidgas bandet; samlas de snörps det åt. Därav bildens fickor — två mjuka väggar som andas med marknadens temperament, aldrig fasta nivåer. Vid normalfördelning hamnar cirka 95 % av observationerna inom ± 2 standardavvikelser; en tumregel att minnas, inte en lag — aktiekursers fördelningar har fetare svansar än normalfördelningen, och det är just därför fallgroparna senare i kapitlet finns. Bollinger sammanfann metodiken i boken Bollinger on Bollinger Bands (2001) — kursens kanonkälla, redan upptagen i plattformens bokkanon.'
    },
    {
      type: 'text',
      content: 'Praktisk läsning i tre lägen — så läses banden dag för dag. ETT — MÄT BREDDEN (squeeze): räkna ut bandens bredd som (övre − nedre) ÷ medelvärdet. När bredden krymper mot periodens smalaste trycks volatiliteten ihop — marknader växlar mellan lugn och storm, och en komprimering säger att något väntar. Inte vad: riktning ger squeeze aldrig. TVÅ — FÖLJ EXPANSIONEN: när utbrottet kommer vidgas banden, ofta kraftigt, för att de nya kurserna river upp standardavvikelsen. Expansion är rörelsens storlek, inte dess riktning. TRE — KÄNN IGEN BANDPROMENADER: i en stark trend slutar kursen dag efter dag nära eller utanför det yttre bandet — Bollinger kallar det walking the bands. Då hjälper %b, hans lägesmått: (kurs − nedre) ÷ (övre − nedre), där 0 är vid nedre väggen och 100 vid övre. Tre lägen, tre frågor till samma diagram: hur trångt är fickan, hur hårt andas den, och var i den vandrar kursen?'
    },
    {
      type: 'utmaning',
      content: 'Din bandjournal — fjädern i verkstaden. Välj en aktie och dokumentera bandbredden varje dag i en månad, för hand: datum, bredd i procent av medelvärdet, och kursens %b. Jämför varje dag med breddens eget förlopp — inte med en fast siffra, utan med fönstrets historia. Skriv FÖRE månadens första handelsdag ner tre villkor som ogiltigförklarar din squeeze-läsning: vilken annan läsning (F03 konfluens — trend, nivåer, volym) måste hålla med, och vad som gör läsningen död om det inte gör det. Vid månadens slut: stämde komprimeringen, kom utbrottet, och sade något alls om riktningen? Kravet är hela poängen — en squeeze får aldrig betyda något på egen hand, och journalen tvingar dig att bevisa sällskapet i stället för att tro det.'
    },
    {
      type: 'text',
      content: `Räkneexemplet — Ericsson B, 20 handeldagar hösten 2026, sex steg för hand. ${KALLDEKL} Steg 1 — medelvärde: summan av de 20 kurserna är 1 952,21 kr; delat med 20 ger 97,61 kr. Steg 2 — avvikelser: varje kurs minus medelvärdet; exempel: 17 sep 101,25 − 97,61 = +3,64 och 24 sep 94,04 − 97,61 = −3,57. Steg 3 — kvadrater: varje avvikelse i kvadrat, sedan summering — kvadratsumman blir 49,21. Notera: de två extremdagarna ensamma bidrar 13,25 + 12,75 = 26,0, drygt hälften av allt. Volatiliteten styrs av extremdagarna. Steg 4 — varians: 49,21 ÷ 20 = 2,46 (Bollinger dividerar med hela populationen, inte n − 1). Steg 5 — standardavvikelse: roten ur 2,46 = 1,57 kr. Steg 6 — banden: 97,61 ± 2 × 1,57 ger övre bandet 100,75 kr och nedre 94,47 kr — en bredd på 6,4 % av medelvärdet. Rådatan i tabellen nedan; kör stegen själv och kontrollera vartenda tal — det är genomgången, inte resultatet, som är övningen.`
    },
    {
      type: 'tabell',
      content: JSON.stringify({
        rubrik: 'Räkneexemplets rådata — Ericsson B, 20 handeldagar (dagsslutkurser i kr)',
        rader: [
          ['#', 'Datum', 'Kurs (kr)', '#', 'Datum', 'Kurs (kr)'],
          ['1', '28 aug', '96,76', '11', '11 sep', '98,66'],
          ['2', '31 aug', '96,72', '12', '14 sep', '98,04'],
          ['3', '1 sep', '96,48', '13', '15 sep', '98,10'],
          ['4', '2 sep', '96,64', '14', '16 sep', '98,96'],
          ['5', '3 sep', '96,80', '15', '17 sep', '101,25'],
          ['6', '4 sep', '97,06', '16', '18 sep', '99,98'],
          ['7', '7 sep', '97,24', '17', '21 sep', '100,30'],
          ['8', '8 sep', '97,26', '18', '22 sep', '96,52'],
          ['9', '9 sep', '96,78', '19', '23 sep', '97,38'],
          ['10', '10 sep', '97,24', '20', '24 sep', '94,04']
        ]
      })
    },
    {
      type: 'text',
      content: 'Utfallet i diagrammet — samma tjugodagarsfönster, läst med lägesmåttet. Den 10 sep var bandbredden 1,8 % — periodens smalaste (jun–sep): en squeeze. Den 16 sep stängde kursen 98,96 över dåvarande övre band (98,70) och den 17 sep nåddes 101,25, %b = 132 — utbrott och expansion. Därefter vände allt: efter en bandpromenad uppåt längs övre bandet stängde kursen 24 sep på 94,04, strax under det nedre bandet (%b −7), och bredden vuxit till 6,4 %. På tio handeldagar hade kursen vandrat från översta till nedersta väggen. Lektionen: squeezen sade ATT rörelse kom, expansionen visade KRAFTEN — men riktningarna var två, först uppåt sedan nedåt. Banden mätte båda, tipsade om ingen. Så ser verklig bandläsning ut: mätetalen beskriver vad som hänt, och översättningen till beslut kräver allt det där sällskapet — konfluens, bekräftelse, dom — som tidigare kapitel byggt.'
    },
    {
      type: 'text',
      content: 'Fallgroparna, kompakterade till tre — alla tre synliga i Ericssonsejouren ovan. ETT — BANDEN SOM KÖP-/SÄLJSIGNALER: läsningen "köp vid det nedre bandet, sälj vid det övre" fungerar bara i sidgående marknad; i en trend blir det fel sida om och om igen — bandpromenaden slår snabbt sönder den läsningen, och sejouren är det inbyggda beviset. Att kursen stänger under nedre bandet är ett tillstånd, ingen händelse; först med bekräftelse — vändningsljus (F07), momentumvändning (F11) — är det en observation värd namnet. TVÅ — ATT GLÖMMA ATT BANDEN FÖLJER VOLATILITETEN, INTE RIKTNINGEN: vidgande band betyder rörelse, oavsett håll; en squeeze betyder väntan, utan riktningsinformation. Den som läser "expanderande band = uppgång" läser fel diagram — expansionen i exemplet gick åt båda håll. TRE — DET GLIDANDE FÖNSTRET: varje handelsdag åker den äldsta kursen ur fönstret och en ny tillträder; banden räknas om i tysthet och medelvärdet glider. Igårs nivå är inte dagens — samma regel som F13: ingen nivå utan villkor som ogiltigförklarar läsningen.'
    },
    {
      type: 'insikt',
      content: `Volatilitetens plats i kartan — banden bland kursens övriga röster. Banden kompletterar F11:s momentum: momentum mäter fart, banden mäter spridning — två olika diagnosinstrument som tillsammans säger mer än något av dem ensamt. Bandkanterna är röster i F03:s konfluens, där de möter F13:s fibonacci-zoner och gammalt stöd/motstånd; bekräftelsen kommer från F07:s ljus och F12:s svängpunkter. I handelsrummet (F14) är banden ett rutinverktyg — dagens breddmätning är själva disciplinen. I AKM2-analyserna hamnar bandläsningen i den korta tidshorisontens tekniska del, portföljmotorns övningsytor upprepar räkningen tills handen minns den, och AI-Mentorn kan ställa frågan eleven nu kan besvara: vad skulle ogiltigförklara din squeeze-läsning? Kursens plats i Fas 3: volatiliteten blir mätbar — utbildning i att mäta, aldrig råd (2007:528). ${UTBDEKL}`
    }
  ],
  quiz: [
    {
      q: 'Vad mäter Bollingerbanden — och vad mäter de inte?',
      alternativ: [
        'De mäter kursens framtida riktning de kommande tio handeldagarna',
        'Volatilitetens spridning runt medelvärdet — aldrig riktningen',
        'Bolagets fundamentala värde jämfört med konkurrenter',
        'Volymens ackumulation och distribution i varje ljus'
      ],
      ratt: 1,
      tips: 'Banden är spridningsmått i kronor kring ett eget medelvärde — expansion och squeeze beskriver rörelsens storlek och frånvaro, aldrig dess håll.'
    },
    {
      q: 'Vad säger en squeeze om den kommande rörelsen?',
      alternativ: [
        'Att något väntar — men aldrig åt vilket håll utbrottet går',
        'Att utbrottet alltid kommer uppåt efter kompressionen',
        'Att marknaden förblir lugn tills bredden når 6,4 %',
        'Att kursen återvänder till mittbandet inom fem handeldagar'
      ],
      ratt: 0,
      tips: 'Kompressionen säger ATT rörelse väntar; riktningen gav den aldrig — Ericssonsejouren bröt först uppåt och stängde sedan under nedre bandet.'
    },
    {
      q: 'Vad kännetecknar en bandpromenad (walking the bands)?',
      alternativ: [
        'Kursen studsar jämnt mellan bandens kanter i en sidgående marknad',
        'Banden slutar röra sig medan kursen befinner sig vid mittbandet',
        'Kursen slutar dag efter dag nära eller utanför det yttre bandet i en stark trend — ett läge att läsa med %b, inte en signal',
        'En stängning över det övre bandet betyder alltid att trenden är över'
      ],
      ratt: 2,
      tips: 'Promenaden är ett tillstånd i stark trend — %b lägesbestämmer den, och ingen enstaka tagg är i sig en händelse värd namnet.'
    }
  ]
};

// --- Append (befintliga kapitel/fält RÖRS EJ) ---
j.chapters.push(kapitel);
j.chapters_list.push({ num: 15, title: 'Från boken till egen analys', minutes: 13 });
j.chapterCount = j.chapters.length;
j.totalMinutes = j.chapters.reduce((s, c) => s + c.minutes, 0);

// --- Postconditions ---
if (j.chapterCount !== 15) throw new Error('chapterCount ≠ 15 efter append');
if (j.totalMinutes !== 183) throw new Error(`totalMinutes ${j.totalMinutes} ≠ 183`);
if (j.chapters_list.length !== 15) throw new Error('chapters_list ≠ 15');

writeFileSync(FIL, JSON.stringify(j, null, 2) + '\n', 'utf8');
console.log('APPEND OK: kapitel 15, chapterCount', j.chapterCount, ', totalMinutes', j.totalMinutes);
