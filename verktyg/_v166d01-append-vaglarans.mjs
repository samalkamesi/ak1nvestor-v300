// v166-d01 — appenda kapitel 21 "Från boken till egen analys" till ak1ts-vaglarans-hierarki
// Kirurgisk textappend (roundtrip stringify är ej identisk med filen — hela-fil-omskrivning förbjuden).
// KVD inbyggd: JSON, Σ-konsistens, quiz=3, varumärkesgrind, blockstruktur, talöverföring ≥80 %, append-only-snapshot.
import fs from 'node:fs';

const P = '/home/ak1a/AK1/data/bokmaster/ak1ts-vaglarans-hierarki.json';
const old = fs.readFileSync(P, 'utf8');
const oldBook = JSON.parse(old);
const snapChapters = JSON.stringify(oldBook.chapters);
const snapList = JSON.stringify(oldBook.chapters_list);

// ---------- kapitel 21 (underlag f01, tal ordagrant) ----------
const kap = {
  num: 21,
  minutes: 14,
  title: 'Från boken till egen analys',
  intro: "Bokens sista blad vänder nu in i ditt eget skrivblock: här slås läsningen om till handlag. Kapitlet visar kursens kärna i praktik, ett fast sju-stegsförfarande för att gradera en faktisk graf och ett källmärkt räkneexempel där hela maskineriet körs på verkliga dagavslut — Volvo B från covidbotten till 2021-topp. Målet är inte att du kan kursen, utan att du kan metoden.",
  blocks: [
    {
      type: 'text',
      content: "Kursen vilar på en enda idé: en prisrörelse är aldrig självförklarande — den får sin betydelse av sin plats i en större rörelse. Våghierarkin, gradtanken, säger att kurser rör sig i svängar på många skalor samtidigt: en liten sväng ingår i en medelstor, som ingår i en stor, som ingår i en ännu större. Ekosystemet ger graderna namn — mikro, kort, medellång, lång, mega — fem nivåer av sammanhang, och hela kursen har varit en enda lång övning i att hålla isär dem. Skillnaden märks i frågorna du ställer. Utan hierarkin frågar läsaren: steg kursen eller föll den? Med hierarkin frågar läsaren: är denna nedgång en hel egen rörelse, eller bara en andel av den föregående uppgången? Det andra är ett mycket starkare frågeverktyg — och mätbart i procent, därav kursens räknefokus. Detta kapitel är ingen bokrecension och ingen repetition: det lär ut metoden att gradera, från rå kurva till etiketterade vågor med datum och uträkningar."
    },
    {
      type: 'text',
      content: "Så läses en faktisk graf — samma ordning varje gång, för det regelbundna förfarandet är poängen. Steg ett: zooma ut först. Öppna månadsgraf och notera den större bilden — var står kursen i det fleråriga spelet? Gradera aldrig först på den vyn du råkar ha. Steg två: välj ett tidspann för huvudläsningen (i exemplet nedan: dagavslut, trender på veckobasis) och förklara valet — blanda inte vyer mitt i en läsning. Steg tre: markera yttersvängarna, senaste betydande botten och topp — de två priser som ramar in det du ska gradera. Steg fyra: dela upp rörelsen mellan dem; svängar med trenden kallas impulsvågor (konventionellt fem), svängar mot trenden korrigeringar (tre), och räkningen börjar alltid i en ändpunkt, aldrig mitt i en sväng. Steg fem: mät varje sväng i kronor och procent och skriv datumet vid varje märke — ett märke utan datum är en åsikt, med datum är det ett dataexpanderbart påstående. Steg sex: gradera neråt — titta inside en av vågorna; finns där en mindre femsvängsstruktur har du bevis för nästa lägre grad. Steg sju: etikettera pågående vågor som hypotes och avslutade som fakta, och notera i marginalen vilka observationer som skulle ändra läsningen."
    },
    {
      type: 'utmaning',
      content: "Din övning efter boken: gradera en egen graf i vågjournalen. Välj en aktie du redan följer, öppna månadsgrafen och notera det fleråriga spelet; välj ditt huvudtidspann och skriv ner varför; markera yttersvängarna; räkna impulsvågor och korrigeringar från en ändpunkt; mät varje sväng i kronor och procent med datum vid varje märke; leta efter en mindre femsvängsstruktur inside en av vågorna. Avsluta med de två disciplinraderna: pågående vågor etiketteras hypotes, avslutade fakta — och i marginalen noterar du vilka observationer som skulle ändra din läsning. En sida i journalen, sju steg, en gradering som är din egen — det är hela skillnaden mellan att ha läst en bok och att kunna en metod."
    },
    {
      type: 'text',
      content: "Nu metoden i rörelse — inte en rekommendation, en övning. Verkliga dagavslut, Volvo B (VOLV-B.ST), källa Yahoo Finance, hämtat 2026-09-24: covidbotten mars 2020 till toppen mars 2021, graderat på dagavslut med trender på veckobasis. Tabellen nedan är sex märken — botten och fem vågändpunkter — var och en med datum, pris och uträkning; så ser ett dataexpanderbart påstående ut när det är riktigt ifyllt."
    },
    {
      type: 'tabell',
      content: "{\"rubrik\":\"Volvo B — covidbotten till 2021-topp (dagavslut, källa Yahoo Finance 2026-09-24)\",\"rader\":[[\"Märke\",\"Datum\",\"Dagavslut\",\"Uträkning\"],[\"Botten\",\"2020-03-18\",\"97,46 kr\",\"—\"],[\"Våg 1 topp\",\"2020-06-05\",\"153,00 kr\",\"+55,54 kr (+57,0 %)\"],[\"Våg 2 botten\",\"2020-06-11\",\"136,20 kr\",\"−16,80 kr = 30,3 % retraktion\"],[\"Våg 3 topp\",\"2020-11-24\",\"203,30 kr\",\"+67,10 kr = 1,21 × våg 1\"],[\"Våg 4 botten\",\"2020-12-07\",\"193,15 kr\",\"−10,15 kr = 15,1 % retraktion\"],[\"Våg 5 topp\",\"2021-03-12\",\"237,50 kr\",\"+44,35 kr = 0,80 × våg 1\"]]}"
    },
    {
      type: 'text',
      content: "Läsningen: våg 2 gav tillbaka 30,3 % av våg 1 och våg 4 bara 15,1 % av våg 3 — båda grunda, vilket är vanligt i starka trender. Våg 5 blev 0,80 × våg 1 (referens: ≈1,0 × våg 1 eller 0,618 × våg 3 — här 0,66 × våg 3, inne i zonen). En strukturregel kontrolleras alltid: våg 4:s botten (193,15) fick aldrig hamna under våg 1:s topp (153,00) — den gjorde det inte, strukturen håller som femvåg. Hela svepet: 97,46 → 237,50 kr = +143,7 % på knappt tolvmånaders handel. Sedan det hierarkiska lyftet, kursens kärna i ett enda drag: byt till månadsgraf — hela femvågssvepet ovan är där en enda uppåtsväng i det större spelet, följd av nedgången till 148,20 kr (månadslåg april 2022, −37,6 % från toppen). Samma kurva, två grader, två olika sanningar om vad som hände — det är våglärans hierarki i praktiken."
    },
    {
      type: 'text',
      content: "Fyra fallgropar att bära med sig från graderingsbordet. Subjektiv gradering: två läsare kan rita två strukturer i samma kurva — skyddet är förfarandet, med fasta steg, mätta procent, dokumenterade datum, och att alltid redovisa det som skulle förändra läsningen. Räkna vågor efteråt: i efterhand passar allt, och därför är retroaktiva räkningar värdelösa som bevis — metoden är ett beskrivnings- och hypotesverktyg, inte en spådomsmaskin, och kursen tränar just att skilja dem. Blanda tidsramar: dagssvängar räknade in i en veckostruktur ger graderingsförvirring (en \"våg 4\" på fel nivå) — lösningen är steg två ovan, ett huvudtidspann med medvetna byten, aldrig automatik. Sifferjakt: att prova Fibonacci-kombinationer tills en passar är inte analys utan kurvanpassning — zoner (38,2/50/61,8 %), inte linjer."
    },
    {
      type: 'insikt',
      content: "Här knyts boken till ekosystemet: Fas 2 läste varje fundamental variabel (V01–V20) som ett värde i en årsredovisning; Fas 3 gör om varje variabel till en tidsserie som graderas i samma fem nivåer. Det lever redan i vågfundament-cachen (data/cache/vagfundament-VOLV_B_ST.json, per 2026-06-30): varje V-indikator bärs av mikro/kort/medellång/lång/mega med etiketterna impulsvåg (16 av 100 celler), basbygge (17) och korrigering (8) — resten osatt, för fundamentalserier från Yahoo sträcker sig cirka fyra år. Volvos intäktsrad är exemplet: Fas 2 läste \"+16,6 % 2023\"; Fas 3 läser svängen +16,6 → −4,6 → −9,0 % som en medellång korrigering i vad som kan vara en längre våg. V01–V20 blir därmed samma typ av graderbara serier som priset — och kurs F03 (Konfluens) visar hur de två världarna vägs samman. Fasprogressionen är verbprogression: Fas 1 beskriver, Fas 2 analyserar, Fas 3 integrerar. Allt är utbildningsmaterial — metoden beskriver hur den läser och räknar; inga investeringsråd, inga avkastningslöften (2007:528), och kurskurserna är historiska källmärkta exempel."
    }
  ],
  quiz: [
    {
      q: "Vad är den praktiska skillnad hierarkin gör i hur en prisrörelse efterfrågas?",
      alternativ: [
        "Frågan flyttas från 'steg eller föll kursen?' till 'är denna nedgång en hel egen rörelse, eller bara en andel av den föregående uppgången?'",
        "Frågan blir om kursen kommer att stiga imorgon",
        "Frågan blir vilken aktie som är billigast just nu",
        "Frågan försvinner — hierarkin ger svaret automatiskt"
      ],
      ratt: 0,
      tips: "Vilket av frågeverktygen är mätbart i procent?"
    },
    {
      q: "Vilken strukturregel kontrolleras alltid i en femvågsräkning?",
      alternativ: [
        "Våg 3 ska alltid vara kortast",
        "Våg 5 ska alltid vara längst",
        "Våg 4:s botten får aldrig hamna under våg 1:s topp",
        "Våg 2 ska retrace exakt 61,8 % av våg 1"
      ],
      ratt: 2,
      tips: "Tänk på Volvo-exemplet: 193,15 mot 153,00."
    },
    {
      q: "Varför är retroaktiva vågräkningar värdelösa som bevis?",
      alternativ: [
        "För att historiska kurser är felaktiga",
        "För att metoden bara fungerar på dagsgraf",
        "För att räkningar kräver dyra datakällor",
        "För att i efterhand passar allt — metoden är ett beskrivnings- och hypotesverktyg, inte en spådomsmaskin"
      ],
      ratt: 3,
      tips: "Vad händer med en räkning när svaret redan står i kurvan?"
    }
  ]
};

// ---------- kirurgisk append ----------
const kapJson = JSON.stringify(kap, null, 2).split('\n').map(l => '    ' + l).join('\n');

// 1) chapters: sista '\n  ]\n}' = chapters-arrayens stängning (filen saknar trailing newline)
const tail = '\n  ]\n}';
const ti = old.lastIndexOf(tail);
if (ti < 0 || ti + tail.length !== old.length) throw new Error('chapters-ankaret hittades inte i filslutet');
let txt = old.slice(0, ti) + ',\n' + kapJson + tail;

// 2) chapters_list: stängs omedelbart före "chapters"-nyckeln
const listAnchor = '\n  ],\n  "chapters": [';
if (txt.split(listAnchor).length !== 2) throw new Error('chapters_list-ankaret är inte unikt');
txt = txt.replace(listAnchor, ',\n    {\n      "num": 21,\n      "title": "Från boken till egen analys",\n      "minutes": 14\n    }' + listAnchor);

// 3) räknare (unika rader i filhuvudet)
for (const [fr, till] of [['"chapterCount": 20,', '"chapterCount": 21,'], ['"totalMinutes": 220,', '"totalMinutes": 234,']]) {
  if (txt.split(fr).length !== 2) throw new Error(`räknefältet ${fr} är inte unikt`);
  txt = txt.replace(fr, till);
}

fs.writeFileSync(P, txt);

// ---------- KVD ----------
const fel = [];
const book = JSON.parse(fs.readFileSync(P, 'utf8'));

// JSON + Σ-konsistens
if (book.chapterCount !== book.chapters.length || book.chapterCount !== 21) fel.push('chapterCount stämmer ej');
const sum = book.chapters.reduce((a, c) => a + c.minutes, 0);
if (book.totalMinutes !== sum || book.totalMinutes !== 234) fel.push(`totalMinutes ${book.totalMinutes} != Σ ${sum}`);
if (book.chapters_list.length !== book.chapters.length) fel.push('chapters_list-längd stämmer ej');
for (let i = 0; i < book.chapters.length; i++) {
  const cl = book.chapters_list[i], ch = book.chapters[i];
  if (cl.num !== ch.num || cl.title !== ch.title || cl.minutes !== ch.minutes) fel.push(`chapters_list[${i}] skiljer från chapters[${i}]`);
}

// append-only: gamla kapitel/lista bit-identiska
if (JSON.stringify(book.chapters.slice(0, 20)) !== snapChapters) fel.push('befintliga kapitel RÖRDA');
if (JSON.stringify(book.chapters_list.slice(0, 20)) !== snapList) fel.push('chapters_list befintliga rader RÖRDA');

// nya kapitlet
const ny = book.chapters[20];
if (ny.num !== 21) fel.push('fel num');
if (ny.minutes < 11 || ny.minutes > 14) fel.push('minutes utanför 11–14');
if (ny.quiz.length !== 3) fel.push('quiz != 3');
ny.quiz.forEach((q, i) => {
  if (q.alternativ.length !== 4) fel.push(`quiz[${i}] != 4 alternativ`);
  if (q.ratt < 0 || q.ratt > 3) fel.push(`quiz[${i}] ratt utanför 0–3`);
  if (!q.tips) fel.push(`quiz[${i}] saknar tips`);
});

// blockstruktur enligt designens sektionsmappning
const typer = ny.blocks.map(b => b.type);
const forv = ['text', 'text', 'utmaning', 'text', 'tabell', 'text', 'text', 'insikt'];
if (JSON.stringify(typer) !== JSON.stringify(forv)) fel.push(`blockstruktur ${typer.join(',')} != ${forv.join(',')}`);

// varumärkesgrind: förbjudna fraser mot allt nytt innehåll
const varumarke = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const nyText = [ny.title, ny.intro, ...ny.blocks.map(b => b.content), ...ny.quiz.flatMap(q => [q.q, q.alternativ.join(' '), q.tips])].join('\n');
for (const f of varumarke.forbjudnaFraser) {
  const re = new RegExp(f.fran, 'giu');
  const tr = nyText.match(re);
  if (tr) fel.push(`varumärke: "${tr[0]}" träff på /${f.fran}/`);
}

// talöverföring: underlagets markörer ≥ 80 %
const markorer = ['97,46', '153,00', '55,54', '57,0', '136,20', '16,80', '30,3', '203,30', '67,10', '1,21', '193,15', '10,15', '15,1', '237,50', '44,35', '0,80', '0,618', '0,66', '148,20', '37,6', '143,7', '2020-03-18', '2020-06-05', '2020-06-11', '2020-11-24', '2020-12-07', '2021-03-12', 'april 2022', '2026-09-24', 'VOLV-B.ST', 'Yahoo Finance', '16 av 100', '2026-06-30', '+16,6', '−4,6', '−9,0', 'V01–V20', 'F03', '38,2/50/61,8', 'mikro', 'medellång', 'mega', 'hypotes', '2007:528'];
const saknas = markorer.filter(m => !nyText.includes(m));
const andel = (markorer.length - saknas.length) / markorer.length;
if (andel < 0.8) fel.push(`talöverföring ${(andel * 100).toFixed(0)}% < 80%: saknas ${saknas.join(', ')}`);

// juridik: käll-/övningsdeklaration närvaro
if (!nyText.includes('inte en rekommendation, en övning')) fel.push('övningsdeklaration saknas');
if (!nyText.includes('källa Yahoo Finance')) fel.push('källdeklaration saknas');

console.log(`KVD: ${fel.length === 0 ? 'GRÖN' : 'RÖD — ' + fel.join('; ')}`);
console.log(`talmarkörer: ${(andel * 100).toFixed(0)} % (${markorer.length - saknas.length}/${markorer.length})${saknas.length ? ' saknade: ' + saknas.join(', ') : ''}`);
console.log(`kapitel 21: ${ny.blocks.length} block, quiz ${ny.quiz.length}, minutes ${ny.minutes}; bok: ${book.chapterCount} kapitel, Σ ${book.totalMinutes} min`);
process.exit(fel.length === 0 ? 0 : 1);
