// v166-d13 fibonacci-applications — appendar djupkapitel 15 "Från boken till egen analys"
// enligt DESIGN-v166-djupintegrering.md + underlag-f13-fibonacci.md. Append-only: kapitel 1–14 orörda.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/fibonacci-applications.json';
const raw = fs.readFileSync(FIL, 'utf8');
if (JSON.stringify(JSON.parse(raw), null, 2) + '\n' !== raw) {
  console.error('FÖRHVILLKOR: filen är inte stringify(2)-ren — avbryter innan någon skrivning.');
  process.exit(1);
}
const b = JSON.parse(raw);
if (b.chapterCount !== 14 || b.chapters.length !== 14 || b.totalMinutes !== 160 || b.chapters_list.length !== 14) {
  console.error('FÖRHVILLKOR: väntat 14 kapitel/160 min — hittade', b.chapters.length, b.totalMinutes);
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
    'Sista steget: från Fischers kapitel till din egen graf. Kapitlet visar hur andelarna spänns mellan två verkliga svängpunkter, hur zonen beräknas för hand — och hur ett verkligt september förkastade den. Mönstret är kursens metod i miniatyr: mät, dokumentera, ogiltigförklara.',
  blocks: [
    {
      type: 'text',
      content:
        'Fibonaccis talföljd (1, 1, 2, 3, 5, 8, 13, 21 …), där varje tal är summan av de två föregående; förhållandet mellan två grannar närmar sig 0,618 — det gyllene snittet. Ur det härleds andelarna kursen arbetar med: 61,8 % (1 ÷ 1,618), 38,2 % (0,618², alltså det som blir över när 61,8 % retracerats) och 50 %. En demystifiering direkt: 50 % är inte ett Fibonaccital — det är Dows halveringsregel, adopterad för att den uppför sig likadant. Prisgrafens poäng: marknader rör sig i stötar och motstötar (F12), och motstöten går sällan hela vägen tillbaka. Den historiska iakttagelsen är att motrörelser ofta stannar när de återgett 38,2–61,8 % av föregående rörelse — vinstrealiseringen avtar successivt, nya köpare inväntar skepsis, och många aktörer tittar på samma nivåer, vilket förstärker dem. Kursens huvudregel lyder därför zoner, inte linjer: bandet mellan 38,2 % och 61,8 % (den gyllene zonen) är ett område att studera, aldrig en exakt prick att rikta mot. Samma släktgång ger utvidgningstalen 127,2 % och 161,8 % — mått på en rörelses potential när retracementet slagits.',
    },
    {
      type: 'text',
      content:
        'Att spänna verktyget mellan två verkliga svängpunkter — sex steg. (1) Välj fönstret: dagsgraf med några månaders historik; verktyget kräver en avslutad sväng, med både botten och topp på plats. (2) Identifiera den dominerande svängen — inte varje småstickling, utan den tydligaste rörelsen: en verklig botten och en verklig topp, synliga för alla (samma svängpunkter F12:s karta markerar). (3) Spänn från sväng till sväng: vid en uppgång dras verktyget från botten till topp, och programmet ritar 38,2/50/61,8 nedåt från toppen; vid en nedgång tvärt om. (4) Gör om linjerna till zoner: avrunda, bredda, läs 38,2–61,8 som ett band — 50 % är mittpunkt, inte gräns. (5) Korskontrollera zonen: gammalt stöd/motstånd, glapp, glidande medelvärden — en zon utan sällskap är svag, en zon med flera oberoende nivåer är konfluens (F03). (6) Dokumentera: båda svängpunkterna med datum och pris, de beräknade nivåerna, och ett villkor som ogiltigförklarar läsningen. Ingen nivå utan villkor.',
    },
    {
      type: 'utmaning',
      content:
        'Veckans övning — egen retracement-journal på papper. Välj en avslutad sväng från en dagsgraf (några månaders historik) och anteckna den dominerande svängens båda ändar med datum och pris — botten och toppen, exakt som grafen visar dem, inte som minnet önskar dem. Beräkna spannet och nivåerna 38,2/50/61,8 för hand, som i kapitlets räkneexempel, och skriv upp varje delsteg. Korskontrollera zonen mot minst två oberoende nivåer (gammalt stöd eller motstånd, glapp, glidande medelvärde) och dokumentera vilka. Formulera därefter ETT villkor som ogiltigförklarar läsningen — ett konkret, observerbart villkor, exempelvis en dagsslutkurs utanför zonens kant — och håll det skrivet: när villkoret slår är läsningen en död hypotes, och svängpunkterna flyttas aldrig i efterhand för att rädda nivån. Upprepa en gång i veckan i en månad: journalen samlar då fyra dokumenterade hypoteser med utfall — exakt det underlag AI-Mentorn frågar efter.',
    },
    {
      type: 'text',
      content:
        'Räkneexemplet, ordagrant ur underlaget. Pedagogisk genomräkning på verkliga dagsslutkurser, Volvo B (VOLV-B.ST), källa Yahoo Finance, hämtat 2026-09-24 — en övning i att räkna, inte en rekommendation (2007:528). Svängen: botten 317,50 kr (23 juni) → topp 371,50 kr (4 aug). Spannet: 371,50 − 317,50 = 54,00 kr. 38,2 % retracement: 0,382 × 54,00 = 20,63. Nivå: 371,50 − 20,63 = 350,87 ≈ 350,90 kr. 61,8 % retracement: 0,618 × 54,00 = 33,37. Nivå: 371,50 − 33,37 = 338,13 ≈ 338,10 kr. Den gyllene zonen blir därmed 350,90–338,10 kr, med 50 %-nivån 344,50 mitt i. Utfallet, akt 1 (augusti): efter toppen backade kursen. Den 12 aug passerades övre zongränsen (slutkurs 343,20), och den 19 aug stannade nedgången på 338,20 kr — 10 öre från den beräknade 61,8 %-nivån. Därifrån vände kursen upp till 351,30 (26 aug). Akt 2 (september): zonen bröts. Den 15 sep slutade kursen 330,20 kr — sammanlagt (371,50 − 330,20) ÷ 54,00 = 76,5 % av uppgången återgiven. Lektionen är kursens kärna: zonen var en hypotes — augusti höll den, september förkastade den. En plats att studera med villkor, aldrig ett löfte; och en enträff (338,20 mot 338,13) bevisar ingenting.',
    },
    {
      type: 'tabell',
      content: JSON.stringify({
        rubrik: 'Volvo B:s sommarsväng 2026 — räkneexemplets alla tal (VOLV-B.ST, källa Yahoo Finance, hämtat 2026-09-24)',
        rader: [
          ['Post', 'Tal', 'Beräkning/källa'],
          ['Botten', '317,50 kr (23 juni)', 'dagsgrafens dominerande sväng'],
          ['Topp', '371,50 kr (4 aug)', 'dagsgrafens dominerande sväng'],
          ['Spann', '54,00 kr', '371,50 − 317,50'],
          ['38,2 %-nivå', '350,87 ≈ 350,90 kr', '371,50 − 0,382 × 54,00 (20,63)'],
          ['50 %-nivå', '344,50 kr', 'zonens mittpunkt'],
          ['61,8 %-nivå', '338,13 ≈ 338,10 kr', '371,50 − 0,618 × 54,00 (33,37)'],
          ['Akt 1 — augusti', '338,20 kr (19 aug)', '10 öre från 61,8 %-nivån; vändning upp till 351,30 (26 aug); 12 aug slutkurs 343,20'],
          ['Akt 2 — september', '330,20 kr (15 sep)', '(371,50 − 330,20) ÷ 54,00 = 76,5 % återgivet — zonen förkastad'],
        ],
      }),
    },
    {
      type: 'text',
      content:
        'Fyra fallgropar, kompakterade. Svängpunkter valda för att passa: med bottnar och toppar nog att välja bland får vilken graf som helst en "träff" i efterhand — skyddet är den dominerande, för alla synliga, före läsningen dokumenterade svängpunkten, aldrig flyttad för att nivån ska hamna rätt. Magiskt tänkande kring talen: 0,618 har ingen kausal kraft; att en nivå "verkar fungera" beror till stor del på att många tittar där — självuppfyllande tills en dag den inte är det, och Volvo-september i räkneexemplet är motbeviset inbyggt i kursens eget exempel. Talen mäter hur långt en motrörelse hunnit, ingenting mer. Att spänna mitt i rörelsen: en sväng utan topp på plats ger nivåer som flyttas varje dag — då är verktyget ingen nivå utan en gissning; vänta in båda svängpunkterna. Retracement som signal: att kursen befinner sig i zonen är ett tillstånd, inte en händelse. Först med bekräftelse — ett vändningsljus (F07), en momentumvändning (F11), volymens beteende — är det en observation värd namnet. Konfluens, inte ensamråde (F03).',
    },
    {
      type: 'insikt',
      content:
        'Fibonacci är våglärans måttstock. I Elliotts mönster (F01, F04) är de korrektiva vågorna just retracement: våg 2 ger ofta djupt — vanligtvis 50–61,8 % av våg 1 — medan våg 4 oftare stannar grunt kring 38,2 %, och våglängderna förhåller sig ofta till varandra i Fibonaccital. Utan andelarna är vågräkning form; med dem blir den mått. Kursen bygger vidare på F12:s svängpunkter (samma bottnar och toppar — men frågan är nu hur djupt går motrörelsen?) och matar F03:s konfluens, där zonen är en röst av flera. I AKM2-analyserna blir retracementnivåerna del av den korta tidshorisontens tekniska läsning, portföljmotorns övningsytor upprepar räkningen tills handen minns den, och AI-Mentorn kan ställa frågan eleven nu kan besvara: vad skulle ogiltigförklara din zon? Kursens plats i Fas 3: andelarna gör motrörelser mätbara — utbildning i att mäta, aldrig råd (2007:528). Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta, historiska exempel; inga investeringsråd, inga avkastningslöften (2007:528).',
    },
  ],
  quiz: [
    {
      q: 'Vilken är kursens huvudregel för retracement-nivåer?',
      alternativ: [
        'Zonen 38,2–61,8 % är en exakt prick att rikta mot',
        '50 % är det viktigaste Fibonaccitalet och ska alltid vägas tyngst',
        'Zoner, inte linjer — bandet 38,2–61,8 % är ett område att studera, aldrig en exakt prick',
        'Utvidgningstalen 127,2 % och 161,8 % ersätter retracement-nivåerna',
      ],
      ratt: 2,
      tips: '50 % är inte ens ett Fibonaccital — det är Dows halveringsregel, adopterad för att den uppför sig likadant.',
    },
    {
      q: 'Vad lär räkneexemplets andra akt (september 2026)?',
      alternativ: [
        'Att 61,8 %-nivån statistiskt sett alltid håller',
        'Att en enträff (338,20 mot 338,13) bevisar nivåns kraft',
        'Att zonen ska flyttas i efterhand tills den passar utfallet',
        'Att zonen var en hypotes — augusti höll den, september förkastade den, då 76,5 % av uppgången återgivits',
      ],
      ratt: 3,
      tips: 'En plats att studera med villkor, aldrig ett löfte — och en enträff bevisar ingenting.',
    },
    {
      q: 'Vad kräver den dokumenterade läsningen av varje nivå?',
      alternativ: [
        'Ett villkor som ogiltigförklarar läsningen — ingen nivå utan villkor',
        'Minst tre tidigare träffar på nivån',
        'Att svängpunkterna justeras i efterhand tills nivån hamnar rätt',
        'Att verktyget spänns så snart en botten är på plats',
      ],
      ratt: 0,
      tips: 'Båda svängpunkterna med datum och pris, de beräknade nivåerna — och villkoret som dödar läsningen om det slår in.',
    },
  ],
};

b.chapters.push(kap);
b.chapters_list.push({ num: 15, title: 'Från boken till egen analys', minutes: 13 });
b.chapterCount = b.chapters.length;
b.totalMinutes = b.chapters.reduce((s, c) => s + c.minutes, 0);

fs.writeFileSync(FIL, JSON.stringify(b, null, 2) + '\n');
console.log('APPEND KLAR: kapitel 15 · chapterCount', b.chapterCount, '· totalMinutes', b.totalMinutes);
