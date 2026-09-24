#!/usr/bin/env node
// v166-d23 — appenda djupkapitel 15 "Från boken till egen analys" i
// data/bokmaster/market-mind-games.json enligt DESIGN-v166-djupintegrering.md
// + underlag-f23-market-mind-games.md. Append-only: kapitel 1–14, övriga
// toppfält och chapters_list 1–14 (historiska strängposter) RÖRS EJ.
import fs from 'node:fs';

const FIL = 'data/bokmaster/market-mind-games.json';
const j = JSON.parse(fs.readFileSync(FIL, 'utf8'));

// Förvillkor mot HEAD-läge
if (j.chapterCount !== 14 || j.chapters.length !== 14) {
  throw new Error(`förväntade 14 kapitel, fann ${j.chapterCount}/${j.chapters.length}`);
}
const summaFore = j.chapters.reduce((a, c) => a + c.minutes, 0);
if (summaFore !== 160 || j.totalMinutes !== 160) {
  throw new Error(`förväntade Σ=160, fann ${j.totalMinutes}/${summaFore}`);
}
if (j.chapters.some((c, i) => c.num !== i + 1)) throw new Error('num-sekvens avvikande');
if (j.chapters_list.length !== 14 || typeof j.chapters_list[0] !== 'string') {
  throw new Error('chapters_list förväntades vara 14 historiska strängposter');
}

const MIN = 12; // minutes 11–14 enligt design; f23 bär räkneexempel + tabell

j.chapters.push({
  num: 15,
  minutes: MIN,
  title: 'Från boken till egen analys',
  intro:
    'Bokens sista steg är elevens: att vända Shulls läsning till egen analyspraktik. Detta kapitel sammanfattar kärnan, ger journalens tre frågor som protokoll på papper och genomrättar räkneexemplet som visar hur känslan agerar som omviktare på exakt samma siffra — allt på kursens exempeldata och papper: metodträning, aldrig råd om live-affärer (2007:528).',
  blocks: [
    {
      type: 'text',
      content:
        'Shulls centrala påstående (Market Mind Games, 2012) vänder på gammal tradervisdom kontrollera dina känslor: känslor går inte att stänga av — och ska inte heller. De är information. Shull bygger på neurovetenskapen kring somatiska markörer (Damasio): patienter vars känslokopplingar skadats kunde resonera felfritt men blev handlingsförlamade inför val — ”ren rationalitet” utan känslor existerar inte i hjärnan. Känslor är kroppens komprimerade bedömningar av ett läge, färdiga snabbare än medvetandet. Konsekvensen för din analys: känslan som dyker upp vid en siffra bär en implicit prognos — inte främst om marknaden, utan om vad du själv tror och är rädd att se. Känslor man vägrar känna igen kallar Shull fria radikaler: förnekade driver de besluten under radarn. Kurmetoden är motsattgående — läs reaktionen exakt. Inte ”jag mår dåligt” utan ”jag skäms över att jag gick ur för tidigt”. Då blir känslan en datapunkt bland andra i analysen, inte en dold styrman — kapitel 5:s tre frågor, nu i ditt eget protokoll.',
    },
    {
      type: 'text',
      content:
        'Praktisk läsning: kursens redskap är en emotionell journal som förs vid varje beslut, före handling. Tre frågor, en minut. Ett — vad känner jag, exakt? Namnge känslan (rädsla, skam, stolthet, tristess, lättnad …) och styrka 1–10. ”Jag känner inget” är i sig ett fynd: neutralitet inför ett beslut med reell risk är en reaktion värd att notera. Två — vad handlar känslan om? Vilken trosföreställning bär den? Rädd — för vad? Att mista pengar, eller att visa mig korkad? Känslan pekar ofta bakåt (en gammal förlust), inte på datan framför mig. Tre — vad vill känslan att jag gör — och säger planen något annat? Logga konflikten. Känslan får INTE bestämma — den får rapportera. Beslutet fattas mot planen, med känslan på bordet. Övningen körs på kursens exempeldata och papper — metodträning, aldrig råd om live-affärer (2007:528).',
    },
    {
      type: 'utmaning',
      content:
        'Kör journalen i tjugo loggade beslut på papper — övningsserien ur kapitel 12:s verktygslåda eller kursens exempeldata, aldrig live-affärer. Vid varje beslutstillfälle, före övningsbeslutet: tre rader. Rad ett — känslans namn med så hög precision du förmår (kapitel 5:s emotionella granularitet) plus styrka 1–10; ”känner inget” noteras som fynd. Rad två — känslans objekt: rädd för vad? Att mista pengar, att visa mig korkad, en gammal förlust? Rad tre — känslans vilja mot planens: logga konflikten, om någon. Efter tjugo beslut: läs loggen igen och besvara tre frågor — vilket namn återkommer oftast, vilket objekt bär det, och var i serien är omviktningen som starkast (efter F-segment eller V-segment)? Svaret är din känslas signatur — underlaget för nästa tjugo.',
    },
    {
      type: 'text',
      content:
        'Räkneexemplet, underlaget ordagrant: hypotetisk övningsmodell — i 100 historiskt liknande lägen (pappersdata) följdes 60 st av +5 % och 40 st av −5 % inom en månad. Väntevärde per beslut: 0,60·(+5) + 0,40·(−5) = +1 %. Samma siffra, två elevlägen. Läge A — efter tre rakeförluster (F F F): ryggradsrädsla. Siffran 60 läses inverterat — ”men 40 % går ju dåligt” — och de upplevda oddsen blir 40/60: 0,40·(+5) + 0,60·(−5) = −1 %; i övningen avstår eleven. Läge B — efter tre vinster (V V V): eufori, ”det här kan jag”. Siffran 60 läses komprimerat — ”bra odds ≈ nästan säkert” — och de upplevda oddsen blir 80/20: 0,80·(+5) + 0,20·(−5) = +3 %; i övningen dubblar eleven. Genomräkningen visar Shulls poäng i siffror: känslan agerar som omviktare. Rädslan flyttar 20 sannolikhetspunkter mot förlusten, euforin 20 punkter mot vinsten — det upplevda väntevärdet hamnar 2 procentenheter fel i vardera riktning, en total spread på 4 enheter från samma data. F21:s serie visade dessutom att både F F F (0,45³ ≈ 9 %) och V V V (0,55³ ≈ 17 %) är normala kluster med full kant — känslan läser klustret som budskap, fast det är brus. Journalens tre frågor fångar omviktningen FÖRE beslutet: eleven kan rätta tillbaka 60/40 och läsa siffran som den är. Genomgången är ren aritmetik på underlagets antaganden — ingen hämtad serie. Utbildningsmaterial — beskriver hur metoden fungerar med hypotetisk pappersdata; inga investeringsråd, inga avkastningslöften (2007:528).',
    },
    {
      type: 'tabell',
      content:
        '{"rubrik":"Samma siffra, två känslolägen, två beslut — hypotetisk övningsmodell (pappersdata)","rader":[["Läge","Känsloläge","Siffran 60 läses","Upplevda odds","Upplevt väntevärde","Beslut i övningen"],["Samma data (referens)","neutral — datan rak","60/100 → +5 % · 40/100 → −5 % · väntevärde = +1 %","60/40","0,60·(+5) + 0,40·(−5) = +1 %","läsa siffran som den är"],["A — efter tre rakeförluster (F F F)","ryggradsrädsla","inverterat: ”men 40 % går ju dåligt”","40/60","0,40·(+5) + 0,60·(−5) = −1 %","AVSTÅR"],["B — efter tre vinster (V V V)","eufori — ”det här kan jag”","komprimerat: ”bra odds ≈ nästan säkert”","80/20","0,80·(+5) + 0,20·(−5) = +3 %","DUBBLAR"]]}',
    },
    {
      type: 'text',
      content:
        'Fallgroparna, fyra. Känsloförnekelse: ”jag är rationell, jag känner inget” — den farligaste fällan, ty förnekade känslor verkar ändå: positioner som krymper i smyg, beslut som skjuts upp, ”känsla av att något är fel” utan ord. Symtomet är inte frånvaro av känsla utan känsla utan namn. Att analysera istället för att agera: journalen kan bli flykt — oändlig självgranskning, ännu en bok, ännu en modell — perfektionism som skydd mot att känna osäkerheten. Kuren är formatet: tre frågor, en minut, sedan beslut mot planen. Journalen är väderstation, inte kloster. Känslan som order — motsatsfelet: ”jag känner det så starkt, det måste vara sant”. Känslan är data om mig, inte prognos om marknaden; stark känsla höjer informationsvärdet i journalen, aldrig säkerheten i beslutet. Fel objekt: ”jag litar inte på den här modellen” handlar ofta om en gammal förlust, inte om modellens data. Fråga två finns för att avslöja det.',
    },
    {
      type: 'insikt',
      content:
        'F23 är känslans kurs i Fas 3:s psykologitrio: F22 (Coates, dog-and-wolf) förklarar kroppen, F23 (Shull) känslan, och hjärnans genvägar följer på schemat. F21 (Douglas) gav regelverket — acceptera serien, vilja inte veta — och Shull går ett plan djupare: varför det är så svårt, och vad reaktionen mot slumpen berättar. Räkneexemplet återanvänder F20/F21:s mynt och visar samma matematik sedd genom känslans omviktare; AKM2:s analyser (V01–V20) levererar siffrorna som ska kunna läsas rakt. Elevens journal från F14 (trading room) utökas med de tre frågorna, och AI-Mentorn kan förhöra på dem: vilken känsla, vilket objekt, vilken konflikt med planen? Hela linjen är plattformens röda tråd: metod ger siffran, psykologin lär oss läsa den — och allt förblir utbildning: känslan dokumenteras som känsla, aldrig som råd eller löfte (2007:528).',
    },
  ],
  quiz: [
    {
      q: 'Vad är Shulls centrala påstående som kapitlet utgår från?',
      alternativ: [
        'Känslor ska stängas av innan varje beslut',
        'Känslor går inte att stänga av — och ska inte heller: de är information, kroppens komprimerade bedömningar av ett läge',
        'Känslor är brus som alltid ska filtreras bort ur analysen',
        'Känslor är prognoser om marknaden och ska följas',
      ],
      ratt: 1,
      tips: 'Vad bär känslan som dyker upp vid en siffra — en prognos om marknaden eller om dig själv?',
    },
    {
      q: 'Vad visar räkneexemplet om känslans roll i beslutet?',
      alternativ: [
        'Känslan agerar som omviktare — rädslan och euforin flyttar varsin 20 sannolikhetspunkter, och det upplevda väntevärdet hamnar 2 procentenheter fel i vardera riktning',
        'Känslan påverkar bara hur utfallet känns efteråt, inte hur siffran läses',
        'Känslan höjer alltid träfffrekvensen i serien',
        'Känslan saknar helt mätbar effekt på beslutet',
      ],
      ratt: 0,
      tips: 'Samma 60/40-data lästes efter F F F respektive V V V — vad hände med väntevärdet?',
    },
    {
      q: 'Vilken roll får känslan i journalens tredje fråga?',
      alternativ: [
        'Känslan får bestämma när den är tillräckligt stark',
        'Känslan ska tryckas ner tills den försvinner',
        'Känslan får INTE bestämma — den får rapportera; beslutet fattas mot planen, med känslan på bordet',
        'Planen ska skrivas om efter varje stark känsla',
      ],
      ratt: 2,
      tips: 'Styrman eller datapunkt — vad blir känslan när den ligger på bordet?',
    },
  ],
});

j.chapters_list.push({ num: 15, title: 'Från boken till egen analys', minutes: MIN });
j.chapterCount = j.chapters.length;
j.totalMinutes = j.chapters.reduce((a, c) => a + c.minutes, 0);

fs.writeFileSync(FIL, JSON.stringify(j, null, 2) + '\n');
console.log(
  `OK: kapitel 15 appenderat — chapterCount=${j.chapterCount}, totalMinutes=${j.totalMinutes}, chapters_list=${j.chapters_list.length} poster (post 15 som objekt)`,
);
