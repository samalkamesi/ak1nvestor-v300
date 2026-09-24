// v166-d03: appenda djupkapitel 14 "Från boken till egen analys" till
// konfluens-varde-moter-vagor.json enligt DESIGN-v166-djupintegrering.md.
// Append-only: befintliga kapitel/fält RÖRS EJ. Tal överförs ordagrant från
// underlag-f03-konfluens.md (käll-/övningsdeklaration med).
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/konfluens-varde-moter-vagor.json';
const j = JSON.parse(fs.readFileSync(FIL, 'utf8'));

if (j.chapters.some(c => c.title === 'Från boken till egen analys')) {
  console.log('ABORT: djupkapitlet finns redan — inget görs (append-only/idempotens).');
  process.exit(0);
}

const kap = {
  num: j.chapters.length + 1,
  minutes: 13,
  title: 'Från boken till egen analys',
  intro:
    'Tretton kapitel har byggt metoden — det här tar steget från läsning till eget papper. Du får den praktiska ordningen steg för steg, ett fullständigt genomräknat exempel och fallgroparna som väntar mellan intention och utförande. Underlaget är det granskade v164-arbetet (f03, 2026-09-24); allt nedan är utbildning i hur metoden läser, väger och räknar — inte råd om aktier.',
  blocks: [
    {
      type: 'text',
      content:
        "Konfluens betyder sammanflöde: två floder möts och blir starkare. I analysen betyder det att två oberoende bedömningar av samma aktie, räknade var för sig, pekar mot samma område — den fundamentala värderingen (Fas 2: vad är bolaget värt ur redovisningen?) och den tekniska strukturen (Fas 3: var har marknaden historiskt vänt, stannat, brutit?).\n\nNyckelordet är oberoende. Två vittnen som inte pratat med varandra och ändå berättar samma sak är ett starkt indicie. Ett vittne som upprepar sig är det inte. Konfluens är alltså inte ”fler indikatorer” utan källor som kan säga emot varandra — och inte gör det. Det är Fas 3:s svar på Fas 2:s grundregel att ingen enskild indikator får sista ordet: här får hela metodfamiljen en motvikt.",
    },
    {
      type: 'text',
      content:
        'Så vägs de två bedömningarna samman, steg för steg:\n\n1. Poängsätt varje ben isolerat med trappsteg som bestämts i förväg — samma kultur som AKM1:s kurvor i V05/V06. Fundamentala benet först, innan grafen öppnas. Ordningen är ett bias-skydd: den som sett kurvan först letar multiplar som passar den.\n2. Bestäm vikterna i förväg. Lång horisont: exempelvis 60 % fundamentalt och 40 % tekniskt; kortare horisont flyttar vikt mot det tekniska.\n3. Räkna vägt medelvärde av de två benens poäng.\n4. Respektera asymmetrin. Ett starkt ben räddar inte ett brutet: medelvärdet döljer att en av två pelare är borta. Konfluens är ett OCH, inte ett ELLER.\n\nSteg 1–2 gör bedömningen reproducerbar: en annan analytiker med samma underlag och samma regler ska kunna få fram samma poäng. Det är utbildningens kärna — metoden, inte magkänslan.',
    },
    {
      type: 'utmaning',
      content:
        'Pappersexperimentet: välj en aktie du redan studerat och för de två benen på papper — i rätt ordning. Skriv först det fundamentala benets trappsteg och poäng med grafen stängd, välj sedan vikter (skriv dem ner innan du räknar), och bestäm till sist vad som skulle vederlägga bedömningen. Räkna därefter det tekniska benet och det vägda medelvärdet. Testa slutligen replikerbarheten: kan en annan elev med samma regler och samma underlag landa på samma poäng? I så fall har du en bedömning; i annat fall har du en åsikt — och skillnaden är hela kursen.',
    },
    {
      type: 'text',
      content:
        "Ett genomräknat fall (pedagogiskt exempel, tydligt konstruerat): ett svenskt industritolag — kalla det Bolaget — med kurs 48 kr och 200 miljoner aktier. Alla siffror är konstruerade för genomräkningen.\n\nFundamentala benet (Fas 2:s V05 och V06): Börsvärde = 48 × 200 m = 9,6 mdr. Eget kapital 8,0 mdr, alltså P/B = 9,6 ÷ 8,0 = 1,2 — V05-trappsteget ”under 2” ger 4 poäng. Räntebärande skuld 3,0 och kassa 1,4 ger EV = 9,6 + 3,0 − 1,4 = 11,2 mdr. Rörelseresultat 1,3 plus avskrivningar 0,7 ger EBITDA 2,0 mdr, alltså EV/EBITDA = 11,2 ÷ 2,0 = 5,6× — V06-trappsteget ”4–6×” ger 5 poäng (kassatäckningen är 32 månader, så V06:s värdefallehåll — V19-kontrollen — slår inte). Fundamentalt ben: (4 + 5) ÷ 2 = 4,5 av 5.\n\nTekniska benet (Fas 3:s verktyg): föregående sväng gav låg 30 kr och hög 70 kr. Fibonacci-retracement 61,8 %: 70 − 0,618 × (70 − 30) = 70 − 24,7 = 45,3 kr. Samma område har varit stöd vid tre tidigare tillfällen (zon 44–46) — en strukturnivå, inte en pixellinje. Kursen 48 ligger (48 − 45,3) ÷ 48 = 5,6 % över zonen. Momentum avtagande, men vändning ännu inte bekräftad: tekniskt ben 4 av 5 (strukturen intakt, beviset återstår).",
    },
    {
      type: 'text',
      content:
        'Vägning 60/40: 0,6 × 4,5 + 0,4 × 4,0 = 2,70 + 1,60 = 4,3 av 5.\n\nKontrastfallet: hade samma aktie i stället stängt under 44 — bruten zon — är det tekniska benet 1, inte 4: 0,6 × 4,5 + 0,4 × 1,0 = 3,1. Den fundamentala poängen är oförändrad, multiplerna rörde sig inte, men omständigheten ändrades. Låg multipel utan intakt struktur är Fas 3:s version av V06:s värdefallehåll: billighet utan tecken. Samma räkning visar alltså både konfluensen (4,3) och dess frånvaro (3,1) — med identiskt fundamentalt underlag.\n\nExemplet visar hur metoden räknas; det säger inget om vad någon bör göra med någon aktie (2007:528).',
    },
    {
      type: 'text',
      content:
        "Fyra fallgropar möter dig mellan metod och genomförande:\n\nFalsk konfluens — samma signal räknad två gånger. P/B 1,2 och P/E 7 är inte två signaler; båda säger ”kursen låg mot underliggande värde” och drivs av samma källa (pris och redovisning). Testet: kan bedömningarna vara oense? Om nej — ett vittne, ingen konfluens. Även inom det tekniska benet är RSI och momentum ur samma kursserie släkt, inte främlingar.\n\nBekräftelsebias. När den fundamentala bedömningen redan känns klar letar ögat automatiskt zoner och retracement som passar — man ritar linjen där svaret redan står. Motgift: det fundamentala benet först med regler i förväg, plus att skriva ner vad som skulle vederlägga bedömningen innan resultatet räknas.\n\nKonfluens i efterhand. I en färdig kurshistoria ser varje vändning ut som perfekt konfluens — grafen döljer alla gånger zonen inte höll.\n\nBlandade tidshorisonter. Det fundamentala benet talar i år, det tekniska i veckor och månader; konfluens är inte en tidpunkt (se F01:s hierarki och dess grader).",
    },
    {
      type: 'insikt',
      content:
        'Fas 2 byggde det fundamentala benet: tjugo indikatorer (V01–V20) med trappsteg och poäng. Fas 3:s tekniska kurser bygger det andra benet — hierarki (F01), tidsserier (F02), formationer, momentum, retracement — och konfluenskursen är Fas 3:s signatur just för att den är den enda kursen som inte lär ut ett verktyg utan sammanvägningen: dit hela banan spänner (F02 → F03 → F04+). I plattformen lever samma tänk i AKM2-analyserna, där fundamental och teknisk bedömning förs och loggas var för sig — separata vittnen, gemensam bild — och i AI-Mentorn, där du kan jämföra dina två ben med modellens. Kursen övar det som plattformen gör. Utbildningsmaterial — beskriver hur metoden läser, väger och räknar; inga investeringsråd, inga avkastningslöften (2007:528).',
    },
  ],
  quiz: [
    {
      q: 'Vad gör två bedömningar till äkta konfluens?',
      alternativ: [
        'Att båda beräknas från samma kursserie så att de alltid stämmer överens',
        'Att de visas samtidigt i samma diagram',
        'Att de är oberoende — de kan säga emot varandra, och gör det inte',
        'Att den ena bekräftar den andra genom att räknas om tills den stämmer',
      ],
      ratt: 2,
      tips: 'Vittnestestet: två som inte pratat med varandra och ändå berättar samma sak.',
    },
    {
      q: 'Varför poängsätts det fundamentala benet innan grafen öppnas?',
      alternativ: [
        'Ordningen är ett bias-skydd — den som sett kurvan först letar multiplar som passar den',
        'Därför att redovisning alltid publiceras före kurser',
        'Därför att det fundamentala benet är viktigare i alla lägen',
        'Därför att diagrammet gör multiplarna ogiltiga',
      ],
      ratt: 0,
      tips: 'Vad letar ögat efter när svaret redan står?',
    },
    {
      q: 'Vad visar kontrastfallet i räkneexemplet — bruten zon, fundamentalt oförändrat?',
      alternativ: [
        'Att ett starkt fundamentalt ben alltid räddar medelvärdet',
        'Att den vägda poängen stiger eftersom aktien blir billigare',
        'Att vikterna automatiskt flyttas till 40/60',
        'Att poängen faller från 4,3 till 3,1 — konfluens är ett OCH, inte ett ELLER',
      ],
      ratt: 3,
      tips: 'En av två pelare borta — vad bärs då medelvärdet av?',
    },
  ],
};

// Append-only: kapitlet, listraden, och de två härledda räknarna.
j.chapters.push(kap);
j.chapters_list.push({ num: kap.num, title: kap.title, minutes: kap.minutes });
j.chapterCount = j.chapters.length;
j.totalMinutes = j.chapters.reduce((a, c) => a + c.minutes, 0);

fs.writeFileSync(FIL, JSON.stringify(j, null, 2) + '\n', 'utf8');
console.log(
  `APPENDAT: kapitel ${kap.num} "${kap.title}" (${kap.minutes} min, ${kap.blocks.length} block, quiz ${kap.quiz.length}) · chapterCount=${j.chapterCount} · totalMinutes=${j.totalMinutes}`,
);
