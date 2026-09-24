// v166-d04 — appenda kapitel 17 "Från boken till egen analys" till elliott-wave-principle
// Kirurgisk textappend (roundtrip stringify är ej identisk med filen — hela-fil-omskrivning förbjuden).
// KVD inbyggd: JSON, Σ-konsistens, quiz=3, varumärkesgrind, blockstruktur, talöverföring ≥80 %,
// append-only-snapshot + r175-style signifikantaTal-kontroll mot underlaget (≥70 %).
import fs from 'node:fs';

const P = '/home/ak1a/AK1/data/bokmaster/elliott-wave-principle.json';
const UNDERLAG = '/home/ak1a/AK1/data/forskning/KURS-FAS3/underlag-f04-elliott-wave.md';
const old = fs.readFileSync(P, 'utf8');
const oldBook = JSON.parse(old);
const snapChapters = JSON.stringify(oldBook.chapters);
const snapList = JSON.stringify(oldBook.chapters_list);

// ---------- kapitel 17 (underlag f04, tal ordagrant) ----------
const tabell = {
  rubrik: 'Atlas Copco A — covidbotten till 2021-topp (dagavslut, källa Yahoo Finance 2026-09-24)',
  rader: [
    ['Märke', 'Datum', 'Dagavslut', 'Uträkning'],
    ['Botten', '2020-03-23', '66,68 kr', '—'],
    ['Våg 1-topp', '2020-04-23', '92,38 kr', '+25,70 kr (+38,5 %)'],
    ['Våg 2-botten', '2020-05-04', '80,32 kr', '−12,06 kr = 46,9 % retraktion'],
    ['Våg 3-topp', '2020-09-29', '109,65 kr', '+29,33 kr = 1,14 × våg 1'],
    ['Våg 4-botten', '2020-10-28', '98,03 kr', '−11,62 kr = 39,6 % retraktion'],
    ['Våg 5-topp', '2021-04-16', '139,50 kr', '+41,47 kr = 1,61 × våg 1']
  ]
};

const kap = {
  num: 17,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro: "Bokens sista kapitel blir din första egen räkning. Här slås läsningen om till handlag: mönstret i fem och tre omsatt i järnregler, ett fast graderingsförfarande och ett källmärkt räkneexempel där hela grammatiken körs på verkliga dagavslut — Atlas Copco A från covidbotten till 2021-topp. Målet är inte att du kan recitera boken, utan att du kan räkna efter dess regler.",
  blocks: [
    {
      type: 'text',
      content: "Kursen vilar på Elliotts iakttagelse från 1930-talet: marknadens svängar är inte slumpmässiga utan återkommer i två grundformer — fem svängar i riktning med den större trenden, motivvågen, och tre mot den, korrektiven. Konventionen märker impulsvågorna 1–5 och korrektivens A–C; en komplett cykel är åtta svängar, och eftersom varje sväng själv delas upp i mindre svängar av samma slag blir strukturen fraktal — det är hierarkin från kurs F01, här med grammatik. Förklaringen bakom mönstret är ingen prislag utan mänsklig masspsykologi: priset är gruppens samlade humör. Optimismen bygger i steg — därav femman, framåtskeenden får medvind — medan pessimismen reagerar snävare och snabbare, därav trean. Elliotts poäng, sedd med dagens ögon: humöret driver kurvan, inte tvärtom — nyheterna tolkas efter stämningen, inte före. Därför mönstrar sig samma psykologi på alla tidsskalor, och därför kan samma regler läsas på en dagsgraf som på en månadsgraf. Detta kapitel är ingen bokrecension och ingen repetition: det lär ut metoden att räkna, från rå kurva till etiketterade vågor med datum och uträkningar."
    },
    {
      type: 'text',
      content: "Innan någon räkning börjar: de tre järnreglerna, som gallrar omöjliga lösningar mekaniskt. Bryts en enda är räkningen ogiltig — inte \"nästan\". Regel ett: våg 3 får aldrig vara den kortaste av våg 1, 3 och 5. Regel två: våg 2 får aldrig falla under våg 1:s startpunkt. Regel tre: våg 4 får aldrig falla under våg 1:s topp — enda undantaget är den sällsynta slutdiagonalen, fördjupning och ej nybörjarstoff. Sedan graderingen, steg för steg, ovanpå F01:s förfarande. Steg ett: zooma ut i månadsgrafen och fastställ den större riktningen. Steg två: välj ett huvudtidspann och behåll det genom hela läsningen. Steg tre: markera ytterpunkterna, senaste betydande botten och topp. Steg fyra: räkna fem svängar med trenden och kontrollera järnreglerna vid varje nytt märke — är reglerna okända är räkningen gissning. Steg fem: mät varje sväng i procent och skriv datumet vid märket. Steg sex: leta inre struktur — finns en mindre femma inuti en våg graderar du nästa nivå ner, F01:s lyft. Steg sju: etikettera pågående vågor som hypotes, avslutade som fakta."
    },
    {
      type: 'utmaning',
      content: "Din övning efter boken: en egen regelstyrd läsning på papper. Välj en aktie du redan följer, zooma ut i månadsgrafen och fastställ den större riktningen; välj huvudtidspann och skriv ner varför; markera ytterpunkterna; räkna fem svängar med trenden med järnreglerna kontrollerade vid varje nytt märke; mät varje sväng i procent med datumet vid märket; leta den inre strukturen och gradera en nivå ner där en mindre femma syns. Etikettera pågående vågor som hypotes och avslutade som fakta, och redovisa öppet om en alternativ märkning också uppfyller järnreglerna — kursen tränar just det. En sida, sju steg, en räkning som är din egen — det är skillnaden mellan att ha läst om mönstren och att kunna läsa dem."
    },
    {
      type: 'text',
      content: "Nu grammatiken i rörelse — inte en rekommendation, en räkneövning. Verkliga dagavslut, Atlas Copco A (ATCO-A.ST), källa Yahoo Finance, hämtat 2026-09-24: covidbotten mars 2020 till toppen april 2021, graderat på dagavslut. Tabellen nedan är sex märken — botten och fem vågändpunkter — var och en med datum, pris och uträkning; så ser en regelstyrd läsning ut när den är riktigt ifylld."
    },
    { type: 'tabell', content: JSON.stringify(tabell) },
    {
      type: 'text',
      content: "Fibonacci-relationerna: våg 2 gav tillbaka 46,9 % av våg 1 — innanför retraktionszonen 38,2–61,8 %. Våg 4 gav tillbaka 39,6 % av våg 3, en aning ovanför 38,2 %-linjen. Våg 3 blev 1,14 × våg 1 (endast kravet: ej kortast). Våg 5 landade på 1,61 × våg 1 — mitt i förlängningsreferensen 1,618. Järnreglerna kontrolleras mot tabellen: våg 3 inte kortast (våg 1 var det), våg 2 över våg 1:s start (80,32 > 66,68), våg 4 över våg 1:s topp (98,03 > 92,38). Hela svepet: 66,68 → 139,50 kr = +109,2 % på tretton kalendermånader. Två ärlighetsnoteringar hör till räkningen. Inuti våg 3 syns julisvängarna, 107,00 kr den 2020-07-15 och 96,72 kr den 2020-07-31 — det är underordnad grad, fraktalen i praktiken. Och en alternativ märkning finns: juli-toppen som våg 3-topp. Båda läsningarna uppfyller järnreglerna; kursen tränar att redovisa dem öppet i stället för att gömma den ena."
    },
    {
      type: 'text',
      content: "Fyra fallgropar att bära med sig. Omräkning tills det passar: att justera etiketterna retroaktivt tills siffrorna blir vackra är kurvanpassning, inte analys — skyddet är järnreglerna plus redovisade datum, och att visa alternativa läsningar. Prognos vs beskrivning: Elliott är starkast som beskrivning av vad som hänt och hypotesgenerator för vad som kan pågå — aldrig en spådomsmaskin, och kursen håller den skillnaden hårt. Alla kurvor är inte impulser: korrektiva marknader kan snurra i åratal utan någon ren femma, och att tvinga fram en är det klassiska felet. Zoner, inte linjer: 46,9 % är \"inom zonen\" — inte ett löfte om att 50,0 % håller nästa gång. Sifferjakt dödar metoden."
    },
    {
      type: 'insikt',
      content: "Här knyts boken till ekosystemet: kurs F01 gav hierarkin, graderna mikro till mega — och Elliottmönstret är det som graderas. Kurs F02 gjorde fundamenten till tidsserier: en intäktsvåg kan läsas med samma fem-och-tre-öga. Kurs F03 gav konfluensregeln: en Elliott-räkning är ett vittne, och det krävs ett oberoende — fundamentalt värde, nyckeltalsnivå — som säger samma sak innan något vägs in i AKM2:s tidshorisonter, som själva är grader. Regelverket samlar allt: hierarkin (F01) för skala, formen (F04) för struktur, konfluensen (F03) för bevisning. Allt är utbildningsmaterial — metoden beskriver hur den läser och räknar; inga investeringsråd, inga avkastningslöften (2007:528), och kurskurserna är historiska källmärkta exempel."
    }
  ],
  quiz: [
    {
      q: 'Vilket påstående om järnreglerna stämmer med kursen?',
      alternativ: [
        'Våg 2 får aldrig falla under våg 1:s startpunkt',
        'Våg 3 får vara den kortaste om volymen bekräftar räkningen',
        'Våg 4 får bryta under våg 1:s topp när korrektionen är grund',
        'En bruten järnregel kan godtas om räkningen redovisas öppet'
      ],
      ratt: 0,
      tips: 'Bryts en enda regel är räkningen ogiltig — inte nästan.'
    },
    {
      q: 'Vilken roll ger kursen Elliottanalysen?',
      alternativ: [
        'En spådomsmaskin som förutsäger kommande toppdatum',
        'En beskrivning av vad som hänt och en hypotesgenerator för vad som kan pågå',
        'En ersättning för den fundamentala analysen',
        'Ett mått som gör konfluens med oberoende vittnen onödig'
      ],
      ratt: 1,
      tips: 'Kursen skiljer hårt mellan beskrivning och prognos — vad är metoden starkast som?'
    },
    {
      q: 'Vad kräver konfluensreglernas vittneslogik innan en Elliott-räkning vägs in i AKM2:s tidshorisonter?',
      alternativ: [
        'Att räkningen gjorts i månadsgrafen först',
        'Att etiketterna räknats om tills siffrorna blir vackra',
        'Att minst ett oberoende vittne — fundamentalt värde eller nyckeltalsnivå — säger samma sak',
        'Att nyhetsflödet bekräftar den pågående vågen'
      ],
      ratt: 2,
      tips: 'Ett vittne räcker aldrig — vad utgör det andra, oberoende?'
    }
  ]
};

// ---------- kirurgisk append ----------
const kapJson = JSON.stringify(kap, null, 2).split('\n').map(l => '    ' + l).join('\n');

// 1) chapters: stängs omedelbart före "kalla"-nyckeln
const kapAnchor = '\n  ],\n  "kalla": {';
if (old.split(kapAnchor).length !== 2) throw new Error('chapters-ankaret är inte unikt');
let txt = old.replace(kapAnchor, ',\n' + kapJson + kapAnchor);

// 2) chapters_list: stängs omedelbart före "chapters"-nyckeln
const listAnchor = '\n  ],\n  "chapters": [';
if (txt.split(listAnchor).length !== 2) throw new Error('chapters_list-ankaret är inte unikt');
txt = txt.replace(listAnchor, ',\n    {\n      "num": 17,\n      "title": "Från boken till egen analys",\n      "minutes": 13\n    }' + listAnchor);

// 3) räknare (unika rader i filhuvudet)
for (const [fr, till] of [['"chapterCount": 16,', '"chapterCount": 17,'], ['"totalMinutes": 170,', '"totalMinutes": 183,']]) {
  if (txt.split(fr).length !== 2) throw new Error(`räknefältet ${fr} är inte unikt`);
  txt = txt.replace(fr, till);
}

fs.writeFileSync(P, txt);

// ---------- KVD ----------
const fel = [];
const book = JSON.parse(fs.readFileSync(P, 'utf8'));

// JSON + Σ-konsistens
if (book.chapterCount !== book.chapters.length || book.chapterCount !== 17) fel.push('chapterCount stämmer ej');
const sum = book.chapters.reduce((a, c) => a + c.minutes, 0);
if (book.totalMinutes !== sum || book.totalMinutes !== 183) fel.push(`totalMinutes ${book.totalMinutes} != Σ ${sum}`);
if (book.chapters_list.length !== book.chapters.length) fel.push('chapters_list-längd stämmer ej');
for (let i = 0; i < book.chapters.length; i++) {
  const cl = book.chapters_list[i], ch = book.chapters[i];
  if (cl.num !== ch.num || cl.title !== ch.title || cl.minutes !== ch.minutes) fel.push(`chapters_list[${i}] skiljer från chapters[${i}]`);
}

// append-only: gamla kapitel/lista bit-identiska
if (JSON.stringify(book.chapters.slice(0, 16)) !== snapChapters) fel.push('befintliga kapitel RÖRDA');
if (JSON.stringify(book.chapters_list.slice(0, 16)) !== snapList) fel.push('chapters_list befintliga rader RÖRDA');

// nya kapitlet
const ny = book.chapters[16];
if (ny.num !== 17) fel.push('fel num');
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

// lagrum: endast 2007:528 tillåten
const lagrum = [...new Set(nyText.match(/\b\d{4}:\d+\b/g) || [])];
if (!lagrum.every(x => x === '2007:528')) fel.push(`lagrum: ${lagrum.join(',')}`);

// talöverföring: underlagets markörer ≥ 80 %
const markorer = ['66,68', '92,38', '25,70', '38,5', '80,32', '12,06', '46,9', '109,65', '29,33', '1,14', '98,03', '11,62', '39,6', '139,50', '41,47', '1,61', '107,00', '96,72', '109,2', '38,2', '61,8', '1,618', '50,0', '2020-03-23', '2020-04-23', '2020-05-04', '2020-09-29', '2020-10-28', '2021-04-16', '2020-07-15', '2020-07-31', '2026-09-24', 'ATCO-A.ST', 'Yahoo Finance', 'F01', 'F02', 'F03', 'F04', 'tretton', '2007:528'];
const saknas = markorer.filter(m => !nyText.includes(m));
const andel = (markorer.length - saknas.length) / markorer.length;
if (andel < 0.8) fel.push(`talöverföring ${(andel * 100).toFixed(0)}% < 80%: saknas ${saknas.join(', ')}`);

// r175-style signifikantaTal: underlagets tokens ≥ 70 % närvarande i kapitlet
const signifikantaTal = (t) => [...new Set((t.match(/\d+[.,]?\d*/g) || [])
  .map(s => s.replace(/[.,]$/, ''))
  .filter(s => s.length >= 2 && !/^(19|20)\d\d$/.test(s) && s !== '2007' && !/^528/.test(s)))];
const uTal = signifikantaTal(fs.readFileSync(UNDERLAG, 'utf8'));
const kTal = new Set(signifikantaTal(nyText));
const r175Kvot = uTal.filter(t => kTal.has(t)).length / uTal.length;
if (r175Kvot < 0.7) fel.push(`r175-talöverföring ${(r175Kvot * 100).toFixed(0)}% < 70%`);

// juridik: käll-/övningsdeklaration närvaro (ordagrant från underlaget)
if (!nyText.includes('inte en rekommendation, en räkneövning')) fel.push('övningsdeklaration saknas');
if (!nyText.includes('källa Yahoo Finance')) fel.push('källdeklaration saknas');
if (!nyText.includes('inga investeringsråd')) fel.push('juridikdisclaimer saknas');

console.log(`KVD: ${fel.length === 0 ? 'GRÖN' : 'RÖD — ' + fel.join('; ')}`);
console.log(`talmarkörer: ${(andel * 100).toFixed(0)} % (${markorer.length - saknas.length}/${markorer.length})${saknas.length ? ' saknade: ' + saknas.join(', ') : ''} · r175-token: ${uTal.length} st, ${(r175Kvot * 100).toFixed(0)} %`);
console.log(`kapitel 17: ${ny.blocks.length} block, quiz ${ny.quiz.length}, minutes ${ny.minutes}; bok: ${book.chapterCount} kapitel, Σ ${book.totalMinutes} min`);
process.exit(fel.length === 0 ? 0 : 1);
