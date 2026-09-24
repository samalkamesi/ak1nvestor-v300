// v166-d15 — appenda djupkapitel 16 "Från boken till egen analys" till
// teknisk-analys-med-johnny-torssell.json enligt DESIGN-v166 (append-only).
import { readFileSync, writeFileSync } from 'node:fs';

const SOKVAG = 'data/bokmaster/teknisk-analys-med-johnny-torssell.json';
const rå = readFileSync(SOKVAG, 'utf8');
const d = JSON.parse(rå);

const befintliga = d.chapters.length;
const sisteNum = d.chapters[befintliga - 1].num;
const summaFore = d.chapters.reduce((a, c) => a + c.minutes, 0);
if (befintliga !== 15 || sisteNum !== 15 || summaFore !== 195) {
  throw new Error(`Förväntade 15 kapitel/Σ195, fann ${befintliga}/${sisteNum}/${summaFore}`);
}

const kapitel = {
  num: 16,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro: 'Kursens sista steg går från Torssells bok till ditt eget papper: att mäta trend och kanal i procent, att sätta tröskeln i förväg och att bekräfta ett brott i stället för att känna det. Det är här reglerna blir din metod i stället för din läsning.',
  blocks: [
    {
      type: 'text',
      content: 'Torssells tes, förd till praktiken: teknisk analys blir hantverk att lita på först när den görs kvantitativ — varje verktyg ska ha en entydig definition, en mätmetod och ett svar som inte beror av läsarens humör. Det svenska standardverket, i flera uppdaterade upplagor sedan 1990-talet, håller samma grundsatser genom varje kapitel. Den första: samma graf, samma slutsats — en trendlinje, en formation, ett utbrott ska kunna mätas så att två oberoende läsare får samma resultat; det som inte kan mätas kan inte granskas, och därmed inte läras ut. Den andra: priset är utbud och efterfrågan i ett — kursen sammanfattar alla deltagares sammanvägda handlande, och uppgiften är att läsa avtrycket, inte att gissa bakom det. Den tredje: trender består tills de är brutna — och brottet ska vara mätt och bekräftat, inte bara känt. Verket täcker verktygen (trendlinjer, stöd och motstånd, formationer, glidande medelvärden, oscillatorer) men håller fast vid att verktygen är mindre viktiga än disciplinen i definitionerna. Kursen lyfter precis det: reglerna är budskapet.'
    },
    {
      type: 'text',
      content: 'Torssells hantverk i arbetsordning — fyra steg. Ett: trenden först. Uppåtgående trend är stigande bottnar; nedåtgående är sjunkande toppar. Trendlinjen dras genom bottnarna (uppåt) respektive topparna (nedåt) och ska beröra minst två punkter — tre ger säkrare fäste. Två: kanalen. En parallell linje på motsidan av trendlinjen bildar en kanal; kursen pendlar mellan väggarna så länge trenden lever, och kanalen gör pendlingen mätbar i stället för "den verkar gå upp och ner". Tre: allt i procent. Kanalens bredd, avstånd till ett motstånd, storleken på ett utbrott uttrycks i procent av kursnivån — aldrig i ögonmått; procent gör mätningen jämförbar mellan en aktie på 20 kr och en på 500 kr. Fyra: bekräftelse. Ett brott gäller först när (a) slutkursen — inte dagsinträdet — hamnar rätt om linjen och (b) brottet är tillräckligt stort i procent för att skilja verklig rörelse från brus. Kursen använder 3 % som övningsvärde på tröskeln; poängen är att tröskeln är fast och satt i förväg, inte dess exakta värde.'
    },
    {
      type: 'utmaning',
      content: 'Din egen kanalmätning, papper och penna: välj en svensk aktie, dra trendlinjen genom bottnarna eller topparna och bygg kanalens parallell. Mät kanalens bredd i procent — och skriv uttryckligt vilket räknesätt du använder, mot botten eller mot mittpunkten. Skriv tröskeln i förväg, till exempel 3 %, innan du tittar på om kursen närmar sig en vägg. Avsluta med journalanteckningen: datum, nivåerna i procent och ett skrivet villkor som skulle ogiltigförklara din läsning. Övningen tränar avläsning: vad mätningen lär om metoden, inte vad någon bör handla (2007:528).'
    },
    {
      type: 'text',
      content: 'Sedan räkningen — Torssells procentmått satt i siffror, för hand. Talunderlag (källmärkt): data/analyses/ERIC-B.ST.json — Ericsson B, AK1A Analysis Engine, källa Yahoo Finance, analys 2026-08-24. Nivåer: 52-veckors högsta 128,45 kr, lägst 65,94 kr; MA 50 = 101,43 kr; MA 200 = 101,78 kr. Genomgången är en kursräkning på nivåerna — ingen bedömning av aktien. Tre övningar:'
    },
    {
      type: 'tabell',
      content: JSON.stringify({
        rubrik: 'Ericsson B — tre procentmått på nivåerna (källa: data/analyses/ERIC-B.ST.json, Yahoo Finance, analys 2026-08-24)',
        rader: [
          ['Mått', 'Räkning', 'Resultat'],
          ['Kanalbredd, årsbandet mot botten', '(128,45 − 65,94) ÷ 65,94 = 62,51 ÷ 65,94', '≈ 94,8 %'],
          ['Kanalbredd, samma band mot mittpunkten (128,45 + 65,94) ÷ 2 = 97,20', '62,51 ÷ 97,20', '≈ 64,3 %'],
          ['Avstånd MA 50 till MA 200', '(101,78 − 101,43) = 0,35 kr; 0,35 ÷ 101,43', '≈ 0,3 %'],
          ['Utbrottstest 1: antagen slutkurs 130,00 mot toppnivån', '(130,00 − 128,45) ÷ 128,45', '≈ 1,2 % — under tröskeln: inget bekräftat brott'],
          ['Utbrottstest 2: nästföljande antagen slutkurs 132,50', '(132,50 − 128,45) ÷ 128,45', '≈ 3,2 % — över tröskeln: bekräftat enligt regeln']
        ]
      })
    },
    {
      type: 'text',
      content: 'Läsningarna, en i taget. Kanalbredden: samma band, två räknesätt — 62,51 ÷ 65,94 ≈ 94,8 % av botten, 62,51 ÷ 97,20 ≈ 64,3 % mot mittpunkten — och kursen lär att alltid ange vilket som används, eftersom talet annars inte är jämförbart. Linjerna som ser likadana ut: MA 50 och MA 200 ligger 101,78 − 101,43 = 0,35 kr isär; 0,35 ÷ 101,43 ≈ 0,3 %. I grafen sammanfaller de nästan — i procent syns att avståndet är litet. Det är hela poängen med att mäta. Utbrottstestet, med antagna övningskurser mot tröskeln 3 %: en slutkurs på 130,00 kr mot toppnivån ger (130,00 − 128,45) ÷ 128,45 ≈ 1,2 % — under tröskeln: inget bekräftat brott. En nästföljande slutkurs på 132,50 ger (132,50 − 128,45) ÷ 128,45 ≈ 3,2 % — över tröskeln: bekräftat enligt regeln. Skillnaden mellan brus och brott sitter i en subtraktion och en division, inte i känslan. Utbildningsmaterial — beskriver hur metoden mäter och räknar; inga investeringsråd, inga avkastningslöften (2007:528).'
    },
    {
      type: 'text',
      content: 'Fyra fallgropar att bära med dig. Den första: regler utan förståelse — att mekaniskt räkna 3 % utan att förstå vad tröskeln skyddar mot (brus, tillfälliga stick) ger falsk precision; regeln är ett stöd för omdömet, inte en ersättning. Den andra: att blanda system — olika böcker definierar utbrott olika (slutkurs mot dagskurs, olika trösklar), och den som plockar en definition här och en där får signaler som inte kan jämföras och kan därmed inte heller lära av egna träffar och missar; metodens svar är ett definitionsverk, hållet konsekvent. Den tredje: omritning efteråt — en trendlinje som flyttas varje gång kursen bryter den kan aldrig ha brutits, och regeln tappar sitt värde; kravet på i förväg satta regler är just skyddet mot detta. Den fjärde: procent utan kontext — 3 % betyder olika i en trång kanal och ett brett årsband (jmf 94,8 % ovan), i lugn och i orolig marknad; måttet ska läsas mot sin egen referensram.'
    },
    {
      type: 'insikt',
      content: 'Torssellkursen är den svenska grunden i Fas 3:s bokspår: där Murphy (F06) och DeMark (F17) bygger system på samma idé, visar Torssell hur den ser ut på svenska bolag och index — samma universum som plattformens analyser. Analysmotorn producerar redan datastyrda nivåer (MA 50/200, 52-veckorsbandet) i tal — exakt Torssells anda: nivåer i siffror, inte tyckande — och kursens räkneövningar återanvänder samma datafiler. Den kvantitativa kulturen är också AKM2:s: entydiga regler som kan loggas, granskas och rättas gör lärandet testbart. I AI-Mentorn kan eleven jämföra sin egen kanalmätning mot modellens — samma graf, samma slutsats, prövad i praktiken. Kursen övar vad plattformen gör: att läsa svenska grafer med måttband, inte med magkänsla.'
    }
  ],
  quiz: [
    {
      q: 'Vad är Torssells grundtes om tekniskt analyshantverk?',
      alternativ: [
        'Verktygen är allt — formationerna och oscillatorerna slår alltid definitionerna',
        'Teknisk analys blir hantverk att lita på först när den görs kvantitativ: entydig definition, mätmetod och ett svar som inte beror av läsarens humör',
        'Analysen är bäst när den lämnar utrymme för tolkning från fall till fall',
        'Grafen ska läsas med känslan som sista instans — mätningen är sekundär'
      ],
      ratt: 1,
      tips: 'Samma graf, samma slutsats — det som inte kan mätas kan inte granskas, och därmed inte läras ut.'
    },
    {
      q: 'När gäller ett brott ur en trendlinje eller kanalvägg enligt bokens regel?',
      alternativ: [
        'Så snart dagsinträdet piper över eller under linjen under handelsdagen',
        'När grafen känns annorlunda än förra gången kursen var i samma zon',
        'Först när minst fem indikatorer pekar i samma riktning som brytningen',
        'Först när slutkursen — inte dagsinträdet — hamnar rätt om linjen och brottet överskrider en tröskel i procent som satts i förväg'
      ],
      ratt: 3,
      tips: 'Bekräftelsen har två ben: rätt kursslag (slutkursen) och rätt storlek (tröskeln, med 3 % som kursens övningsvärde).'
    },
    {
      q: 'Räkneexemplet visade MA 50 på 101,43 kr och MA 200 på 101,78 kr — vad är lärdomen av jämförelsen?',
      alternativ: [
        'Avståndet 0,35 kr är cirka 0,3 % — linjer som nästan sammanfaller i grafen kan skiljas i procent, och det är hela poängen med att mäta',
        'Avståndet 0,35 kr bevisar att en ny trend har börjat',
        'Medelvärden som ligger nära varandra ska alltid ritas om tills de skiljer sig mer',
        'Procent är ett onödigt mått när avståndet redan syns i grafen med blotta ögat'
      ],
      ratt: 0,
      tips: 'I grafen sammanfaller de nästan — i procent syns att avståndet är litet.'
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
