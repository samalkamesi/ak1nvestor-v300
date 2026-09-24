// v166-d02: appenda djupkapitel "Från boken till egen analys" till
// vagfundament-variablerna-som-tidsserier.json enligt DESIGN-v166 (rond 174).
// Append-only: befintliga kapitel/fält lämnas orörda (verifieras mot backup).
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/vagfundament-variablerna-som-tidsserier.json';
const BACKUP = '/tmp/vagfundament-pre-f02.json';

const kapitel = {
  num: 13,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro: 'Boken tar slut här — inte läsandet. Detta kapitel flyttar metoden från kursens sidor till ditt eget papper: plocka en fundamental variabel ur fem årsredovisningar, gör den till tidsserie och läs trend och svängning med egna ögon. Matrisen räknar detta åt dig — men först när du burit en serie i handen vet du vad cellerna egentligen säger.',
  blocks: [
    {
      type: 'text',
      content: 'I Fas 2 läste du varje fundamental variabel som en nivå: omsättningen 479 miljarder kronor, brutomarginalen 24 procent. En nivå är ett foto. Läs samma variabel som tidsserie — en punkt per räkenskapsår — och den blir en film med två huvudroller: trenden (vart banan pekar i genomsnitt) och svängningen (hur mycket enskilda år avviker från banan). Fotografiet kan inte skilja dem åt; filmen måste. Konkret: AB Volvos nettoomsättning var 552 mdr kr 2023 och 479 mdr kr 2025 — samma bolag, 13 procents skillnad, två helt olika berättelser om hur stort Volvo är. Först som serie syns att 2023 var en cykeltopp och att talet 2025 är samma svängning på väg nedåt, inte ett nytt bolag. Det är kursens fundament i en enda mening: en fundamental variabel blir något annat som tidsserie. "Vad är marginalen?" byts mot "vilken bana har marginalen, och var i svängningen togs mätningen?" — och eftersom priset på börsen redan är en tidsserie kan de två först då jämföras punkt för punkt. Det är grunden Fas 3 står på, och nu är den din.'
    },
    {
      type: 'text',
      content: 'Så går det till, från fem årsredovisningar till plottad serie. Plocka serien: femårsöversikten står oftast sist i årsredovisningen; annars fem rapporter, samma post varje år — nettoomsättning, rörelseresultat, aldrig blandat. Homogenitet först: bryts serien av förvärv, avyttring eller räkenskapsårslutbyte? Läs noterna — en böjd serie ser ut som tillväxt eller svängning utan att affären ändrats. Normalisera: råa kronor bärs av inflation och volym, så gör om till skalfria mått — marginal i procent, tillväxt i procent — när du jämför år, och strök valutaeffekter och engångsposter efter noter, inte efter minne. Plotta: punkter, år på x-axeln, y-axeln från noll (en trunkerad axel dramatiserar svängningen), och en enkel medellinje — ögat hittar trend och amplitud på sekunder. Kontrollfrågan efteråt är kursens egen: kan du med en mening säga vart banan pekar och hur mycket åren svänger? Då är serien läst, inte bara räknad.'
    },
    {
      type: 'utmaning',
      content: 'Gör övningen på riktigt denna vecka — papper och penna räcker. Välj ett bolag, plocka nettoomsättning och nettoresultat fem år ur femårsöversikten, räkna marginalen per år och plotta serien för hand: punkter, år på x-axeln, y-axeln från noll, en medellinje. Skriv därefter tre meningar i din journal: en om vart banan pekar, en om hur mycket åren svänger, och en om något i noterna som böjer serien — förvärv, valuta eller engångspost. Datera och spara. Nästa årsredovisning blir då inte ett nytt foto utan nästa punkt i din egen serie, och det är hela skillnaden mellan att ha läst en bok och att ha börjat ett analytiskt register.'
    },
    {
      type: 'text',
      content: 'Räkneexemplet från boken bärs med hit ordagrant, för det är mallen för ditt eget. Två svenska industrikoncerner, samma datakontrakt — och varsin seriekaraktär. Marginal = nettoresultat ÷ nettoomsättning (egna beräkningar; källor i noten efter tabellen):'
    },
    {
      type: 'tabell',
      content: '{"rubrik":"Räkneexempel — Volvo B och Alfa Laval (rk 2022–2025)","rader":[["","2022","2023","2024","2025","Bana"],["Volvo B omsättning, mdr kr","473","552","527","479","topp, sedan −13 %"],["Volvo B marginal","6,9 %","9,0 %","9,6 %","7,2 %","svänger 7–10 %"],["Alfa Laval omsättning, mdr kr","52,1","63,6","67,0","69,7","stigande vartenda år"],["Alfa Laval marginal","8,6 %","10,0 %","11,0 %","11,9 %","klättrar jämnt"]]}'
    },
    {
      type: 'text',
      content: 'Läs raderna som tidsserier, inte som fotografier. Volvos endpoint-tillväxt 2022→2025 är +0,4 %/år, men årsväxlingarna är +17, −5 och −9 procent — svängningen drunknar trenden, och marginalens fyraårsgenomsnitt 8,2 % beskriver bolaget bättre än något enskilt år (toppåret 9,6 % är just ett toppår). Alfa Laval: +10,2 %/år i omsättning med avtagande men positiva årsväxlingar (+22, +5, +4) och en marginal som stigit varje år — trend med lit svängning. Siffrorna är utbildningsexempel på metoden, inte omdömen om bolagen. Källor: bolagsunivers.json — Volvo B: StockAnalysis (underlag S&P Global Market Intelligence), hämtat 2026-09-15; Alfa Laval: Yahoo Finance, hämtat 2026-09-03. Källorna ger fyra bokförda år (2022–2025).'
    },
    {
      type: 'text',
      content: 'Fyra fallgropar, alla kända och alla botade av samma medicin: hela serien. Att extrapolera — trenden är ett påstående om dåtid; dra Volvos 2023-linje vidare och du prognostiserar en topp i evighet, medan vändpunkter i en serie syns först bakåt. En tillrättalagd bas — endpoint-räknningen styrs av basåret: Volvos +0,4 %/år vilar på svagåret 2022, så "tillväxten" är en effekt av basen, och byter du endpoint berättar samma bolag en nedgång; visa alltid hela serien, aldrig bara två valda punkter. Valutaeffekter — båda koncernerna rapporterar i SEK med stora intäkter i EUR och USD: kurssvängningar böjer serien utan att en enda enhet sålts mer eller mindre, och årsredovisningens not om valutaeffekter (liksom ledningens valutajusterade tal) är rättesnöret. Glömd normalisering — råa kronor från fem olika år jämforda som vore inflationen noll: en dold trendkälla som inte är bolagets. Mönstret att känna igen: varje grop är en förfalskad serie, och motgiftet är alltid noterade brott och skalfria mått.'
    },
    {
      type: 'insikt',
      content: 'Här binder kapitlet ihop ekosystemet — och bokens sista steg är bokstavligt talat Fas 2:s första. De fundamentala variablerna (AKM1:V01–V20) var redan halva vägen hit: V12 intäktsstabilitet ÄR ett tidseriemått (variationskoefficienten — ren svängningsmätning), och V07 bruttomarginal kräver 5-årssnitt för topppoäng. Fas 3 generaliserar: varje V-variabels serie blir underlaget till att förstå prisets banor — en marginal som svänger med lastbilscykeln (Volvo) förklarar varför en aktie svänger, och en stadig klättring (Alfa Laval) varför den inte gör det. Härifrån tar F03 Konfluens över: fundamental bana och teknisk struktur i samma bild. Metod, inte råd — så byggs analysförmåga steg för steg, i journalen som i matrisen. Detta kapitel är utbildningsmaterial: det beskriver hur metoden läser och räknar, och innehåller inga investeringsråd (2007:528).'
    }
  ],
  quiz: [
    {
      q: 'Vad händer med en fundamental variabel när den läses som tidsserie i stället för som nivå?',
      alternativ: [
        'Den fryses till ett foto av ett enskilt räkenskapsår',
        'Den blir en film med två huvudroller — trend och svängning — som fotot inte kan skilja åt',
        'Den byter datakälla och blir aktiekursens historik',
        'Den sammanfattas i matrisens helhetsrad och förlorar sin egen historia'
      ],
      ratt: 1,
      tips: 'Fotot fångar ett läge; filmen fångar rörelsen — och rörelsen har två mått.'
    },
    {
      q: 'Varför räcker inte endpoint-tillväxten som beskrivning av Volvo B:s serie 2022→2025 (+0,4 %/år)?',
      alternativ: [
        'Basåret 2022 var ett svagår och årsväxlingarna (+17, −5, −9) drunknar trenden — svängningen är historien',
        'Endpoint-tillväxt är ett mått som bara fungerar på marginaler',
        'Räkneexemplen är hämtade från bolagsunivers.json och gäller därför inte',
        'Serien borde ha börjat på cykeltoppen 2023 i stället'
      ],
      ratt: 0,
      tips: 'Vad gör ett svagt basår med ett genomsnitt — och vad döljer genomsnittet?'
    },
    {
      q: 'Vad gör AKM1:s V12 intäktsstabilitet till ett rent tidseriemått?',
      alternativ: [
        'Den mäter intäkternas nivå i kronor för det senaste året',
        'Den ger toppoäng redan på ett enskilt års underlag',
        'Variationskoefficienten mäter svängningen i intäktsserien mellan åren',
        'Den läser priset i stället för fundamentet och speglar kursvolatiliteten'
      ],
      ratt: 2,
      tips: 'Ett av AKM1:s tjugo mått handlar helt om variation mellan år — vilket?'
    }
  ]
};

const rå = fs.readFileSync(FIL, 'utf8');
fs.writeFileSync(BACKUP, rå);
const bok = JSON.parse(rå);

// Förvillkor: append-only mot befintligt max
const maxNum = Math.max(...bok.chapters.map(c => c.num));
if (maxNum !== 12 || bok.chapters.length !== 12) {
  console.error(`AVBRYT: oväntad grund — ${bok.chapters.length} kapitel, max num ${maxNum}`);
  process.exit(1);
}
if (bok.chapters.some(c => c.title === kapitel.title)) {
  console.error('AVBRYT: kapiteltiteln finns redan');
  process.exit(1);
}

const gamlaChapters = JSON.stringify(bok.chapters, null, 2);
const gamlaListan = JSON.stringify(bok.chapters_list, null, 2);
const gamlaTopp = { ...bok };

bok.chapters.push(kapitel);
bok.chapters_list.push({ num: kapitel.num, title: kapitel.title, minutes: kapitel.minutes });
bok.chapterCount = bok.chapters.length;
bok.totalMinutes = bok.chapters.reduce((a, c) => a + c.minutes, 0);

const uts = JSON.stringify(bok, null, 2) + '\n';
fs.writeFileSync(FIL, uts);

// Efterkontroll: append-only bevis
const ny = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const bevis = {
  jsonGiltig: true,
  appendChapters: JSON.stringify(ny.chapters.slice(0, 12), null, 2) === gamlaChapters,
  appendListan: JSON.stringify(ny.chapters_list.slice(0, 12), null, 2) === gamlaListan,
  oförändradeToppfält: Object.entries(gamlaTopp).every(([k, v]) =>
    ['chapterCount', 'totalMinutes', 'chapters', 'chapters_list'].includes(k) || JSON.stringify(ny[k]) === JSON.stringify(v)),
  kapitel13Sist: ny.chapters[12].num === 13 && ny.chapters[12].title === kapitel.title,
  chapterCount: ny.chapterCount,
  totalMinutes: ny.totalMinutes,
  summaKontroll: ny.totalMinutes === ny.chapters.reduce((a, c) => a + c.minutes, 0)
};
console.log(JSON.stringify(bevis, null, 2));
if (Object.values(bevis).some(v => v === false)) { console.error('APPEND-ONLY BRUTEN'); process.exit(1); }
console.log('APPEND OK — backup i', BACKUP);
