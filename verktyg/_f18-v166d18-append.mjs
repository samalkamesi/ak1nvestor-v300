// v166-d18 way-of-the-turtle — appendar djupkapitel 15 "Från boken till egen analys"
// enligt DESIGN-v166-djupintegrering.md + underlag-f18-way-of-turtle.md. Append-only: kapitel 1–14 orörda.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/way-of-the-turtle.json';
const raw = fs.readFileSync(FIL, 'utf8');
if (JSON.stringify(JSON.parse(raw), null, 2) + '\n' !== raw) {
  console.error('FÖRHVILLKOR: filen är inte stringify(2)-ren — avbryter innan någon skrivning.');
  process.exit(1);
}
const b = JSON.parse(raw);
if (b.chapterCount !== 14 || b.chapters.length !== 14 || b.totalMinutes !== 168 || b.chapters_list.length !== 14) {
  console.error('FÖRHVILLKOR: väntat 14 kapitel/168 min — hittade', b.chapters.length, b.totalMinutes);
  process.exit(1);
}
if (b.chapters.some(c => c.title === 'Från boken till egen analys')) {
  console.error('FÖRHVILLKOR: kapitlet finns redan — avbryter (idempotens).');
  process.exit(1);
}

const kap = {
  num: 15,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro:
    'Kursens sista steg: från Faiths bok till dina fyra egna svar. Kapitlet läser experimentet som frågan kan handel läras ut — och räknar Donchian 20/10 genom ett verkligt OMX-år, där det ärliga utfallet mot indexet blir lärdomen i stället för ett betyg.',
  blocks: [
    {
      type: 'text',
      content:
        'Curtis Faith var en av turtlarna: 1983–1984 rekryterade handlaren Richard Dennis ett tjugotal nybörjare via en annons, gav dem två veckors undervisning och exakt samma skriftliga regler — för att bevisa sin tes mot kollegan William Eckhardt: att framgångsrik handel kan läras ut, som han sade på samma sätt som man föder upp sköldpaddor i Singapore. Resultaten spreds vida, och det är experimentets egentliga fynd: samma regler, olika utfall. Faiths slutsats i boken: reglerna var inte hemligheten — förmågan att följa dem var det. Turtlarnas regelverk var trendföljande och mekaniskt: position öppnades vid utbrott över 20 dagars högsta notering (System 1) eller 55 dagars (System 2), avslutades vid 10 respektive 20 dagars bottennivå, och varje positions risk begränsades med volatilitetsmåttet N (ATR) så att alla marknader fick jämn vikt. Kursen använder regelverket som avläsbart exempel på vad »ett system« betyder — inte som mall att kopiera.',
    },
    {
      type: 'text',
      content:
        'Faiths checklista: ett system är inte en köpsignal, det är fyra svar. ETT — marknad och tidsram: vad som handlas och på vilken series längd signalerna läses; turtlarna läste terminer på dagliga kurser. TVÅ — entry: när en position öppnas; hos turtlarna Donchian-utbrottet, dagens slutkurs över föregående 20 dagars högsta höga. TRE — exit: både skyddsstopp, som begränsar förlusten per position, och trendförlorare-exit, där 10 dagars bottennivå stänger när trenden dör. FYRA — position och risk: hur stor positionen får vara; turtlarnas N-logik, där storleken ska krympa när volatiliteten växer så att risken per position hålls i princip konstant. Faiths poäng för eleven: de flesta söker det perfekta ingångsköpet, men entry är systemets minst viktiga del — exits och positionstorlek bär utfallet. Övningen är att sortera vilka beslut som hör till vilken fråga, och att se att alla fyra måste ha ett skrivet svar innan något verkställs (F14:s checklista i generaliserad form).',
    },
    {
      type: 'utmaning',
      content:
        'Veckans övning — de fyra svaren på papper, Faiths checklista i hemformat. Skriv fyra rubriker: marknad och tidsram · entry · exit · position och risk. Sortera under varje rubrik de regler du redan arbetar efter — värderingsfiltret, Brytpunkten, procentkulturen, storleken i kronor — och markera luckorna: ett beslut utan skrivet svar är inte en regel utan en vana. Fyll luckorna med formuleringar i kapitlets stil (vad som läses, på vilken series längd, när en position öppnas, när den avslutas, hur stor den får vara i procent) — som definitioner att granska, utbildning och inte råd (2007:528). Avsluta journalen med domarfrågan från räkneexemplet, besvarad i förväg: vad hade krävts för att döma reglerna rättvist — hur många signaler, hur lång serie, vilka marknadslägen, vilken jämförelse? Datera och spara; efter en månad jämför du det som står skrivet med det som hänt, och skillnaden mellan regel och efterrationalisering syns i svart på vitt.',
    },
    {
      type: 'text',
      content:
        'Räkneexemplet, ordagrant ur underlaget: Donchian 20/10 genomrättat. Genomgående övning på historisk data: OMX Stockholm PI (^OMX), källa Yahoo Finance, hämtat 2026-09-24. Enkla regler, långsida, en position i taget: positionen öppnas när slutkursen bryter 20 dagars högsta och avslutas när den bryter 10 dagars lägsta. Perioden 2025-09-24 → 2026-09-24 (250 börsdagar) utlöste fem signaler — tabellen nedan för datumen, kurserna och utfallen. Multiplerat: 0,987 × 1,091 × 0,983 × 0,957 × 1,013 ≈ +2,5 %. Träffare: 2 av 5 (40 %). Samma periods köp-och-håll: 2 645 → 3 287 = +24,2 %. Utläsen är två. Först mönstret: fyra små affärer och en enda +9,1 %-vinnare som bär hela summan — trendföljarens klassiska form, få träffare men asymmetriska utfall. Sedan det obekväma: det här året underpresterade systemet mot indexet kraftigt. Det är inte ett fel i räkningen utan själva lärdomen — ett enskilt år är inte ett bevis, varken för eller emot. Ett system ska bedömas över långa serier och många marknadslägen; därför slutar övningen med frågan »vad hade krävts för att döma systemet rättvist?« snarare än ett betyg. Genomgången, inte en rekommendation (2007:528).',
    },
    {
      type: 'tabell',
      content: JSON.stringify({
        rubrik: 'Donchian 20/10 på OMX Stockholm PI — räkneexemplets alla tal (^OMX, källa Yahoo Finance, hämtat 2026-09-24)',
        rader: [
          ['#', 'Ingång (datum · kurs)', 'Exit (datum · kurs)', 'Utfall'],
          ['1', '2025-10-02 · 2 709', '2025-11-18 · 2 674', '−1,3 %'],
          ['2', '2025-12-05 · 2 827', '2026-03-03 · 3 083', '+9,1 %'],
          ['3', '2026-04-10 · 3 110', '2026-04-28 · 3 056', '−1,7 %'],
          ['4', '2026-05-25 · 3 193', '2026-06-10 · 3 054', '−4,3 %'],
          ['5', '2026-06-30 · 3 203', '2026-08-18 · 3 245', '+1,3 %'],
          ['Multiplerat', '0,987 × 1,091 × 0,983 × 0,957 × 1,013', '—', '≈ +2,5 %'],
          ['Träffare', '2 av 5', '—', '40 %'],
          ['Köp-och-håll, samma period', '2 645 → 3 287', '2025-09-24 → 2026-09-24 (250 börsdagar)', '+24,2 %'],
        ],
      }),
    },
    {
      type: 'text',
      content:
        'Fyra fallgropar, kompakterade. Att tro att systemet är hemligheten: Dennis delade ut samma regler till alla, och utfallen skilde sig ändå — de som plockade ur systemet bara bitar de gillade, eller hoppade över signaler i efterhand som »uppenbart fel«, klarade sig sämst; fallgropen är att älska regeln mer än efterlevnaden. Kurveanpassning: putsa parametrarna (21 dagar? 18? exit 9 eller 12?) tills historiken ser bäst ut, och anpassningen gäller bruset i just den serien — i räkneexemplet går det att hitta parametrar som slår indexet 2025–26, och det bevisar ingenting om framtiden; Faiths hälsning är att inte byta regler för att det senaste året gjorde ont. Att läsa 40 % träffare som »dåligt«: förväntansvärdeslogiken (F20 fördjupar den) säger att träffrekvens och utfallsstorlek bara betyder något tillsammans — att vilja ha rätt ofta är det sämsta skälet att välja exit. Kort minne kring jämförelsen: köp-och-håll vann i år, men nästa trendlösa år kan förhållandet vända; elevens skydd är att rapportera båda sidorna — som här (2007:528).',
    },
    {
      type: 'insikt',
      content:
        'F18 är Fas 3:s systemkurs: utbrottet är momentum i praktik (F11), entry- och exit-nivåerna swingkartans logik (F12), journalen och checklistan rummets disciplin (F14) — här generaliserad till skrivna svar på fyra frågor. F19 berättar turtlarnas historia vidare (mentorskapet, de som höll systematiken), och F20 fördjupar trendföljningens förväntansvärde — båda bygger direkt på det här underlaget. Fas 2:s procentkultur lever i tabellen; AKM2-analyserna tränar att skilja systematik från åsikt, och AI-Mentorn kan förhöra eleven på de fyra systemfrågorna. Räkneexemplet med sin ärliga jämförelse är plattformens röda tråd: metod, data, källmärke — aldrig råd. Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528).',
    },
  ],
  quiz: [
    {
      q: 'Vad var Turtle-experimentets egentliga fynd enligt Faith?',
      alternativ: [
        'Reglerna var hemligheten — de som fick dem nådde i princip samma utfall',
        'Samma regler gav olika utfall: reglerna var inte hemligheten, förmågan att följa dem var det',
        'Urvalet avgjorde allt — bara redan erfarna handlare klarade av reglerna',
        'Regelverket fungerade bara på råvaruterminer och saknar annan pedagogisk användning',
      ],
      ratt: 1,
      tips: 'Dennis delade ut samma skriftliga regler till ett tjugotal nybörjare — utfallen spretade ändå.',
    },
    {
      q: 'Vad utgör ett komplett system enligt Faiths checklista?',
      alternativ: [
        'En ingångssignal med hög träffrekvens — exits och storlek är detaljer',
        'Ett skyddsstopp per position — övriga delar formuleras i efterhand',
        'Fyra skrivna svar: marknad och tidsram, entry, exit samt position och risk',
        'En vinstkurva som stiger varje kvartal — annars är systemet inte komplett',
      ],
      ratt: 2,
      tips: 'Entry är systemets minst viktiga del — exits och positionstorlek bär utfallet.',
    },
    {
      q: 'Vad lär räkneexemblets jämförelse — systemets +2,5 % mot indexets +24,2 %?',
      alternativ: [
        'Att Donchian-reglerna är bevisat sämre än köp-och-håll och ska överges',
        'Att räkningen innehåller ett fel — ett korrekt räknat system slår alltid indexet',
        'Att parametrarna ska justeras tills systemet vunnit också det här året',
        'Att ett enskilt år inte är ett bevis, varken för eller emot — ett system bedöms över långa serier och många marknadslägen',
      ],
      ratt: 3,
      tips: 'Kurveanpassning: parametrar som vinner just det här året bevisar ingenting om framtiden.',
    },
  ],
};

b.chapters.push(kap);
b.chapters_list.push({ num: 15, title: 'Från boken till egen analys', minutes: 13 });
b.chapterCount = b.chapters.length;
b.totalMinutes = b.chapters.reduce((s, c) => s + c.minutes, 0);

fs.writeFileSync(FIL, JSON.stringify(b, null, 2) + '\n');
console.log('APPEND KLAR: kapitel 15 · chapterCount', b.chapterCount, '· totalMinutes', b.totalMinutes);
