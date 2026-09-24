// v166-d13 — appenda djupkapitel 15 "Från boken till egen analys" i
// data/bokmaster/fibonacci-applications.json enligt DESIGN-v166
// (f13-underlagets fem sektioner → blocktyper; append-only; 2-space-format).
import fs from 'node:fs';

const SOKVAG = 'data/bokmaster/fibonacci-applications.json';
const rå = fs.readFileSync(SOKVAG, 'utf8');
const slutNyrad = rå.endsWith('\n');

// Formatvakt: rond-trip måste vara bitidentisk innan vi rör något
const bok = JSON.parse(rå);
if (JSON.stringify(bok, null, 2) + (slutNyrad ? '\n' : '') !== rå) {
  throw new Error('filen avviker från JSON.stringify(x, null, 2)-format — avbryter av säkerhetsskäl');
}
if (bok.chapterCount !== 14 || bok.chapters.length !== 14 || bok.totalMinutes !== 160) {
  throw new Error(`oväntad utgångspunkt: chapterCount=${bok.chapterCount}, len=${bok.chapters.length}, totalMinutes=${bok.totalMinutes}`);
}
if (bok.chapters.at(-1).title === 'Från boken till egen analys') {
  throw new Error('djupkapitlet finns redan — dubbelappend förhindrad');
}

const kap = {
  num: 15,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro: 'Fjorton kapitel har gjort talföljden till måttstock — det här tar steget från bokläsning till egen räkning. Du får de sex stegen från svängpunkt till dokumenterad zon, en journalövning som tränar handen och en fullständigt genomräknad sommarsväng i Volvo B 2026, där zonen höll i augusti och föll i september. Underlaget är det granskade v164-arbetet (f13, 2026-09-24); allt nedan är utbildning i att mäta motrörelser — inte investeringsråd (2007:528).',
  blocks: [
    {
      type: 'text',
      content: 'Fischers bok har en enda bärande tanke, och den är värd att upprepa vid varje egen räkning: motrörelser är mätbara. Fibonaccis talföljd (1, 1, 2, 3, 5, 8, 13, 21 …), där varje tal är summan av de två föregående, ger ett förhållande mellan grannar som närmar sig 0,618 — det gyllene snittet. Ur det härleds andelarna kursen arbetar med: 61,8 % (1 ÷ 1,618), 38,2 % (0,618², alltså det som blir över när 61,8 % retracerats) och 50 %. En demystifiering direkt: 50 % är inte ett Fibonaccital — det är Dows halveringsregel, adopterad för att den uppför sig likadant.\n\nPrisgrafens poäng: marknader rör sig i stötar och motstötar, och motstöten sällan hela vägen tillbaka. Den historiska iakttagelsen är att motrörelser ofta stannar när de återgett 38,2–61,8 % av föregående rörelse. Varför? Vinstrealiseringen avtar successivt, nya köpare inväntar skepsis — och många aktörer tittar på samma nivåer, vilket förstärker dem. Kursens huvudregel lyder därför zoner, inte linjer: bandet mellan 38,2 % och 61,8 % (ofta kallat den gyllene zonen) är ett område att studera, aldrig en exakt prick att sikta in sig på. Samma släktskap ger utvidgningstalen 127,2 % och 161,8 % — mått på en rörelses potential när retracementet slagits.'
    },
    {
      type: 'text',
      content: 'Det praktiska arbetet är att spänna verktyget mellan två verkliga svängpunkter — sex steg, i fast ordning:\n\n1. Välj fönstret. Dagsgraf med några månaders historik — verktyget kräver en avslutad sväng, med både botten och topp på plats.\n2. Identifiera den dominerande svängen. Inte varje småstickling, utan den tydligaste rörelsen: en verklig botten och en verklig topp, synliga för alla.\n3. Spänn från sväng till sväng. Vid en uppgång dras verktyget från botten till topp; programmet ritar 38,2/50/61,8 nedåt från toppen. Vid en nedgång tvärt om.\n4. Gör om linjerna till zoner. Avrunda, bredda, och läs 38,2–61,8 som ett band — 50 % är mittpunkt, inte gräns.\n5. Korskontrollera zonen. Gammalt stöd och motstånd, glapp, glidande medelvärden — en zon utan sällskap är svag, en zon med flera oberoende nivåer är konfluens.\n6. Dokumentera. Båda svängpunkterna med datum och pris, de beräknade nivåerna, och ett villkor som ogiltigförklarar läsningen. Ingen nivå utan villkor.'
    },
    {
      type: 'utmaning',
      content: 'Bygg din egen retracement-journal — papper räcker. Välj en aktie du redan följer och dess dagsgraf med några månaders historik. Identifiera den dominerande svängen: botten och topp, båda med datum och pris, dokumenterade innan du räknar. Spänn verktyget, beräkna 38,2-, 50- och 61,8-nivåerna och skriv upp zonen som ett band. Till varje zon två rader: sällskapet (gamla stöd- och motståndsnivåer, glidande medelvärden som ligger i närheten) och ett villkor som ogiltigförklarar läsningen. Följ sedan aktien i fyra veckor, en rad per vecka: stannade kursen i zonen, bröt den, eller nådde den aldrig fram? Sista raden är examinationen — AI-Mentorns fråga, som du nu kan besvara: vad skulle ogiltigförklara din zon? Gör om övningen på tre aktier tills handen minns räkningen utan verktyg.'
    },
    {
      type: 'text',
      content: 'Nu genomräkningen, på verkliga dagsslutkurser — Volvo B:s sommarsväng 2026. Pedagogisk genomräkning på verkliga dagsslutkurser, Volvo B (VOLV-B.ST), källa Yahoo Finance, hämtat 2026-09-24 — en övning i att räkna, inte en rekommendation (2007:528).\n\nSvängen: botten 317,50 kr (23 juni) → topp 371,50 kr (4 aug). Spannet: 371,50 − 317,50 = 54,00 kr.\n\n- 38,2 % retracement: 0,382 × 54,00 = 20,63. Nivå: 371,50 − 20,63 = 350,87 ≈ 350,90 kr.\n- 61,8 % retracement: 0,618 × 54,00 = 33,37. Nivå: 371,50 − 33,37 = 338,13 ≈ 338,10 kr.\n\nDen gyllene zonen blir därmed 350,90–338,10 kr, med 50 %-nivån 344,50 mitt i.\n\nUtfallet, akt 1 (augusti): efter toppen backade kursen. Den 12 aug passerades övre zongränsen (slutkurs 343,20), och den 19 aug stannade nedgången på 338,20 kr — 10 öre från den beräknade 61,8 %-nivån. Därifrån vände kursen upp till 351,30 (26 aug).\n\nAkt 2 (september): zonen bröts. Den 15 sep slutade kursen 330,20 kr — sammanlagt (371,50 − 330,20) ÷ 54,00 = 76,5 % av uppgången återgiven. Lektionen är kursens kärna: zonen var en hypotes — augusti höll den, september förkastade den. En plats att studera med villkor, aldrig ett löfte; och en enträff (338,20 mot 338,13) bevisar ingenting.'
    },
    {
      type: 'text',
      content: 'Fyra fallgropar, kompakterade — alla fyra sitter i gränsen mellan att mäta en motrörelse och att tro på den:\n\n1. Svängpunkter valda för att passa. Med bottnar och toppar nog att välja bland får vilken graf som helst en "träff" i efterhand. Skyddet: svängpunkten ska vara den dominerande, synlig för alla, dokumenterad före läsningen — aldrig flyttad för att nivån ska hamna rätt.\n2. Magiskt tänkande kring talen. 0,618 har ingen kausal kraft; att en nivå "verkar fungera" beror till stor del på att många tittar där — självuppfyllande tills en dag den inte är det. Volvo-september i exemplet ovan är motbeviset inbyggt i kursens eget exempel. Talen mäter hur långt en motrörelse hunnit, ingenting mer.\n3. Att spänna mitt i rörelsen. En sväng utan topp på plats ger nivåer som flyttas varje dag — då är verktyget ingen nivå utan en gissning. Vänta in båda svängpunkterna.\n4. Retracement som signal. Att kursen befinner sig i zonen är ett tillstånd, inte en händelse. Först med bekräftelse — ett vändningsljus, en momentumvändning, volymens beteende — är det en observation värd namnet. Konfluens, inte ensamråde.'
    },
    {
      type: 'insikt',
      content: 'Här knyts boken till ekosystemet — retracement är våglärans måttstock. I Elliotts mönster är de korrektiva vågorna just retracement: våg 2 ger ofta djupt — vanligtvis 50–61,8 % av våg 1 — medan våg 4 oftare stannar grunt kring 38,2 %, och våglängderna förhåller sig ofta till varandra i Fibonaccital. Utan andelarna är vågräkning form; med dem blir den mått. Kursen bygger vidare på svängpunktskartan (samma bottnar och toppar, men frågan är nu: hur djupt går motrörelsen?) och matar konfluensläsningen, där zonen är en röst av flera. I AKM2-analyserna blir retracementnivåerna del av den korta tidshorisontens tekniska läsning, portföljmotorns övningsytor upprepar räkningen tills handen minns den, och AI-Mentorn kan ställa frågan eleven nu kan besvara: vad skulle ogiltigförklara din zon? Kursens plats i Fas 3: andelarna gör motrörelser mätbara — utbildning i att mäta, aldrig råd (2007:528).'
    }
  ],
  quiz: [
    {
      q: 'Vilket påstående fångar kursens huvudregel för retracement-nivåer?',
      alternativ: [
        'Nivåerna är exakta prickar att sikta in sig på',
        'Bandet mellan 38,2 % och 61,8 % är en zon att studera — aldrig en exakt prick att sikta in sig på',
        '50 % är det viktigaste Fibonaccitalet och nivåernas mittpunkt är en gräns',
        '61,8 %-nivån gäller endast index och valutor'
      ],
      ratt: 1,
      tips: 'Huvudregeln lyder zoner, inte linjer — och 50 % är Dows halveringsregel, inte ett Fibonaccital.'
    },
    {
      q: 'Vad lär genomräkningen av Volvo B:s sommarsväng 2026?',
      alternativ: [
        'Att 61,8 %-nivån alltid håller — kursen stannade 10 öre från nivån i augusti',
        'Att zoner kan hoppas över om svängpunkterna väljas med omsorg i efterhand',
        'Att zonen var en hypotes — augusti höll den, september förkastade den (76,5 % av uppgången återgiven), och en enträff bevisar ingenting',
        'Att Fibonacci-nivåer bara fungerar på svenska aktier'
      ],
      ratt: 2,
      tips: 'Akt 1 höll zonen, akt 2 bröt den — motbeviset är inbyggt i kursens eget exempel.'
    },
    {
      q: 'Vilket påstående om verktygets bruk är kursens eget varnande?',
      alternativ: [
        'Att kursen befinner sig i zonen är ett tillstånd, inte en händelse — först med bekräftelse (vändningsljus, momentumvändning, volymens beteende) är det en observation, och svängpunkterna får aldrig väljas i efterhand',
        'Ju fler svängpunkter man provar, desto trovärdigare blir läsningen',
        'Zoner behöver inga ogiltigförklarande villkor om fönstret är minst en månad',
        'Behovet av bekräftelse upphör när konfluens råder'
      ],
      ratt: 0,
      tips: 'Ingen nivå utan villkor — och ingen svängpunkt flyttas för att nivån ska hamna rätt.'
    }
  ]
};

bok.chapters.push(kap);
bok.chapterCount = 15;
bok.totalMinutes = 173;
bok.chapters_list.push({ num: kap.num, title: kap.title, minutes: kap.minutes });

fs.writeFileSync(SOKVAG, JSON.stringify(bok, null, 2) + (slutNyrad ? '\n' : ''));
console.log('APPEND KLAR: kapitel 15 tillagt · chapterCount 14→15 · totalMinutes 160→173 · chapters_list 14→15 poster');
