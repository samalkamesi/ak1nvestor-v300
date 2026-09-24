// v166-d20 the-trend-following-bible — appendar djupkapitel 15 "Från boken till egen analys"
// enligt DESIGN-v166-djupintegrering.md + underlag-f20-trend-following.md. Append-only: kapitel 1–14 orörda.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/the-trend-following-bible.json';
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

const kap = {
  num: 15,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro:
    'Kursens sista steg: från Abrahams manual till ditt eget beslutsträd. Kapitlet ställer filosofin på tre ben — många små förluster, få stora vinster, asymmetrin — och räknar förväntansvärdet genom ett system där en enda stoppändring vänder kanten: varför reglerna ser ut som de gör blir aritmetik i stället för tro.',
  blocks: [
    {
      type: 'text',
      content:
        'Trendföljning vilar på en inställning som känns fel för de flesta: du kan inte veta var en trend slutar — och du behöver inte veta det. Metoden förutsäger inte vändningar; den reagerar på dem. Filosofin i boken står på tre ben. För det första: många små förluster. Varje utbrott som inte leder någonstans stängs av stoppet, och de smärtsamma posterna blir många — de är hyran för att få vara med från start på varje trend som faktiskt löper. För det andra: få stora vinster. När en trend väl tar fart låter trendföljaren vinsten växa; exitregeln — inte känslan — avgör när resan slutar. För det tredje: asymmetrin. Förlusten är i förväg begränsad av stoppet, vinsten lämnas öppen. Summan av det är trendföljningens karaktär: en förväntansvärdesmaskin, inte en träfffrekvensmaskin. Att ha fel ofta är inbyggt i konstruktionen — felet är en kostnad, inte en skam. Där finns också kursens tidigare kapitel i ett: köp högt, sälj högre (kapitel 2), tålamodet när det går DÅLIGT (kapitel 9). Traditionen löper från Dows diagram till turtlarnas regelverk (F18) och vidare till dagens systematiker — Abraham står i den linjen, och kursen använder den som rättesnöre för hur du ska tänka om dina egna utfall, inte som mall att kopiera.',
    },
    {
      type: 'text',
      content:
        'Ett trendföljarsystem är ett beslutträd där varje gren har ett skrivet svar innan marknaden öppnar — inget lämnas åt stunden. Gren ett, ingen position: trendfiltret frågar om kursen är över 200-dagars medelvärdet — nej → gör ingenting (avsaknad av signal ÄR ett beslut); ja → entryregeln frågar om kursen brutit ut över en definierad nivå — nej → vänta; ja → öppna, med positionsstorlek = riskbudget ÷ stoppavstånd (kapitel 6:s kärnekvitetsmatematik). Gren två, öppen position: stopp träffat → avsluta (förlusten var budgeterad); exitregeln frågar om trenden är död — till exempel kurs under 10 dagars bottennivå → avsluta (vinsten realiseras); ingetdera → gör ingenting — inga känsla-exits. Lägg märke till vad trädet aldrig frågar: "var tror du kursen går?" Ingen nod innehåller en prognos. Detta är definitionen av trendföljning i praktiken: kontrollen ligger inte i att veta framtiden utan i att styra kostnaden för att inte veta den. Systemets fyra frågor — marknad och tidsram, entry, exit, position och risk — är generaliserade ur F18:s checklista; trädet hänger dem på grenar du kan gå dag för dag, och läsövningens syfte är att göra "gör ingenting" lika medvetet som köp och sälj.',
    },
    {
      type: 'utmaning',
      content:
        'Veckans övning — träddagboken. Välj en kurva du redan följer — aktie, index eller råvara; det är grenarna som tränas, inte instrumentet — och gå igenom den dag för dag på papper, minst tjugo handelsdagar. Skriv för varje dag vilken gren som gällde och varför: ingen position/trendfilter nej/entry nej-vänta, eller öppen position/stopp/exit/gör ingenting. Räkna till slut andelen "gör ingenting"-dagar och ställ den mot magkänslan om hur många beslut en trendföljare "borde" ta. Skriv dessutom i förväg, innan första dagen, vilket utfall som skulle ogiltigförklara ditt träd — vad som skulle visa att reglerna inte mäter det du tror. Ett träd ska gå att läsa av en utomstående; annars är det en humöranteckning. Övningen är utbildning i att läsa ett system, inte råd om att handla (2007:528).',
    },
    {
      type: 'text',
      content:
        'Genomgående övning, ren aritmetik på antaganden (ingen hämtad serie): en strategi med 40 % träffare, vinnare +8 %, stopp −2 %. Räknat per 100 affärer: 40 × 8 = +320 procentenheter mot 60 × 2 = −120. Netto +200 procentenheter = +2,0 % i förväntansvärde per affär — en positiv kant, trots att sex av tio affärer är förlorare. Sedan ändras en enda sak: samma träffare, samma vinnare, men stopp vid −6 % (regeln flyttades ut "för att få luft" efter flera små stoppningar — eller genomglappet släppte igenom mer än tänkt).',
    },
    {
      type: 'tabell',
      content:
        '{"rubrik":"Samma signaler, samma träffrekvens — enda skillnaden är var stoppet satt","rader":[["Stopp","Vinnare","Förlorare","Förväntansvärde/affär"],["Stopp −2 %","40 × 8 = +320","60 × 2 = −120","+2,0 %"],["Stopp −6 %","40 × 8 = +320","60 × 6 = −360","−0,4 %"]]}',
    },
    {
      type: 'text',
      content:
        'Samma signaler, samma träffrekvens — enda skillnaden är var stoppet satt, och kanten är borta. Skillnaden växer med antalet affärer: över 20 affärer blir det ×1,02²⁰ ≈ +49 % mot ×0,996²⁰ ≈ −8 %. Brytgränsen vid −6 %-stopp är 8p = 6(1−p), alltså p ≈ 43 % träffare — en "harmlös" ökning som ändå kräver bättre signalträff än systemet visat. Utläset: kanten tillhör inte signalen utan hela systemet — entry, exit, stopp och storlek vägs tillsammans. Genomgång av exemplet, inte en rekommendation (2007:528). Fallgroparna är fyra. Att vilja ha rätt oftare istället för att tjäna mer: träffprocent ger kick, trendföljning betalar för utfall — den som väljer exit för att höja träffaren, tar vinsten tidigt för att slippa se den rinna tillbaka, kapar vinnarna och byter en känsla av kontroll mot en sämre summa. Drawdown-trötthet: sträckan av många små förluster medan trenden uteblir urholkar tålamodet, och tröttheten föder exakt de ändringar — bredare stopp, hoppat över signaler — som räkneexemplet nyss visade kan vända kanten negativ, och de kommer oftast precis när reglerna ska få visa sig. Att läsa exemplet som "smalt stopp är alltid bättre": för snäva stopp ökar stoppfrekvensen och kan mala ner kanten genom vischan (whipsaw) — poängen är sambandet träffare × utfallsstorlek, inte en magisk stoppvolym. Och prognos-lustan: vändningsgissningar flyttar dig från trädet till magkänsla — filosofin i kapitlets första block finns just för att den frestelsen aldrig försvinner.',
    },
    {
      type: 'insikt',
      content:
        'F20 är Fas 3:s nerv i den systematiska linjen: F18 gav systemets fyra frågor, F19 turtlarnas vidare historia — här finns filosofin och räknenervet som förklarar varför Abrahams regler ser ut som de gör. I plattformens modell möts två skikt: det fundamentala filtret (AKM2:s dimensioner — lönsamhet, värdering, kvalitet) avgör vad som är värt att äga; den tekniska entryn (trendfilter, utbrott, stopp) avgör när och hur exponeringen tas och lämnas — fundament för urval, trend för timing: två olika svar som aldrig får förväxlas. AI-Mentorn kan förhöra dig på beslutträdets grenar; journalen (F14) mäter verklig träffare och verklig utfallsstorlek att ställa mot planerat förväntansvärde; Fas 2:s procentkultur gör tabellen läsbar. Räkne- och trädmaterialet levererar plattformens röda tråd: metod, genomskinlig aritmetik — aldrig råd. Utbildningsmaterial — beskriver hur metoden fungerar med genomskinliga räkneexempel; inga investeringsråd, inga avkastningslöften (2007:528).',
    },
  ],
  quiz: [
    {
      q: 'Vilket påstående fångar trendföljningens filosofi enligt boken?',
      alternativ: [
        'Trendföljning är en träfffrekvensmaskin — målet är att ha rätt så ofta som möjligt.',
        'Trendföljning är en förväntansvärdesmaskin — många små, budgeterade förluster är hyran för att få vara med när en trend löper.',
        'Trendföljning förutsäger vändningar och agerar innan de syns i kurserna.',
        'Trendföljning klarar sig utan stopp, eftersom vinnarna växer upp förlusterna av sig själva.',
      ],
      ratt: 1,
      tips: 'Förlusten är begränsad i förväg, vinsten lämnas öppen — att ha fel ofta är inbyggt i konstruktionen.',
    },
    {
      q: 'I kapitlets räkneexempel (40 % träffare, vinnare +8 %) — vad hände när enda ändringen var att stoppet flyttades från −2 % till −6 %?',
      alternativ: [
        'Kanten förbättrades, eftersom bredare stopp ger färre stoppningar och mer luft.',
        'Ingenting — förväntansvärdet beror bara på träffprocenten.',
        'Förväntansvärdet per affär sjönk från +2,0 % till −0,4 % — samma signaler, men kanten försvann.',
        'Vinnarna blev större, eftersom positionerna fick större spelrum.',
      ],
      ratt: 2,
      tips: '60 × 6 = −360 mot 40 × 8 = +320 — kanten tillhör hela systemet, inte signalen.',
    },
    {
      q: 'Vilken fråga ställer beslutträdet aldrig?',
      alternativ: [
        '"Var tror du kursen går?" — ingen nod innehåller en prognos.',
        '"Är kursen över 200-dagars medelvärdet?" — det är trendfiltrets första fråga.',
        '"Har stoppet träffats?" — det är den första frågan för en öppen position.',
        '"Hur stor ska positionen vara?" — positionsstorleken är riskbudget ÷ stoppavstånd.',
      ],
      ratt: 0,
      tips: 'Kontrollen ligger inte i att veta framtiden utan i att styra kostnaden för att inte veta den.',
    },
  ],
};

b.chapters.push(kap);
b.chapters_list.push({ num: 15, title: 'Från boken till egen analys', minutes: 13 });
b.chapterCount = b.chapters.length;
b.totalMinutes = b.chapters.reduce((s, c) => s + c.minutes, 0);

fs.writeFileSync(FIL, JSON.stringify(b, null, 2) + '\n');
console.log('APPEND KLAR: kapitel 15 · chapterCount', b.chapterCount, '· totalMinutes', b.totalMinutes);
