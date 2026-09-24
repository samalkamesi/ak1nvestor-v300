#!/usr/bin/env node
// v166-d24 — appenda djupkapitel 15 "Från boken till egen analys" till
// data/bokmaster/your-money-and-your-brain.json (append-only, DESIGN-v166).
// Underlag: data/forskning/KURS-FAS3/underlag-f24-money-and-brain.md
// (granskat v164). Tal överförs ORDAGRANT — inga nya tal hittas på.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/bokmaster/your-money-and-your-brain.json';
const raw = fs.readFileSync(FIL, 'utf8');
const j = JSON.parse(raw);

if (j.chapters.length !== 14 || j.chapterCount !== 14 || j.totalMinutes !== 168) {
  throw new Error(`Förväntade 14 kapitel/168 min — fann ${j.chapters.length}/${j.chapterCount}/${j.totalMinutes}`);
}

// Deklarationer — juridikgrind 2007:528. JURI är underlagets slutdeklaration
// ORDAGRANT; RAKNE följer syskonens deklarationsformel (f20/f21-spåret).
const RAKNEDEKLARATION = 'Räkneexemplet är en genomgång på antaganden, ingen rekommendation (2007:528).';
const JURIDIKDEKLARATION =
  'Utbildningsmaterial — beskriver hur metoden och forskningen fungerar med hypotetiska exempel; inga investeringsråd, inga avkastningslöften (2007:528).';

// Underlagets tabell (ordagrant) — serialiseras till inre JSON-sträng
const tabellData = {
  rubrik: 'Samma sväng, två olika resor — en portfölj på 100 som svänger +10 % och −10 % (genomgång på antaganden)',
  rader: [
    ['Resa', 'Väg', 'Slut', 'Känsla'],
    ['A', '100 → 110 → 99', '99', '"uppe på 110… nu backar den"'],
    ['B', '100 → 90 → 99', '99', '"djupt hål… äntligen tillbaka"'],
  ],
};

const kapitel = {
  num: 15,
  minutes: 12,
  title: 'Från boken till egen analys',
  intro:
    'Kursens sista steg: från Zweigs bok till din egen räkning. Kärnan bärs med oss — hjärnans evolutionärt gamla system reagerar på förväntan och känsla, inte på logik och siffror, och de reagerar snabbare än tanken — och räkneexemplet gör den mätbar: en och samma sväng på +10 och −10 procent blir två helt olika känsloresor, medan aritmetiken står still på 99.',
  blocks: [
    {
      type: 'text',
      content:
        'Bokens kärna i kursens ljus: Jason Zweig — finansjournalist (Money, senare WSJ-kolumnist och redaktör för Grahams The Intelligent Investor) — översatte 2007 den unga forskningsgrenen neuroekonomi till vanliga investerares beslut, och svaret på frågan vad som händer i hjärnan när människor hanterar pengar står på tre ben. Belöningssystemet (dopamin, nucleus accumbens) aktiveras av VÄNTAN på vinst, inte av vinsten i sig — chansen är belöningen, därför känns spänningen i en hypad aktie värdefull i sig, redan före utfallet (kapitel 2). Förlustaversionen (amygdala, anterior insula): en förlust smärtar grovt räknat dubbelt så mycket som en lika stor vinst känns bra (Kahneman–Tverskys λ ≈ 2) — hjärnan behandlar inte +10 % och −10 % som speglingar utan som två olika valörer (kapitel 5–6, 8). Och övertron: illusionen att kontroll och information ger förutsägbarhet — den som själv valt aktierna värderar dem högre, och handlar oftare, med sämre resultat som konsekvens — plus bias blind spot: alla ser genvägarna hos andra, ingen hos sig själv (kapitel 4). Tre system, en gemensam signatur: de reagerar på förväntan och känsla, och de hinner fram före tanken.',
    },
    {
      type: 'text',
      content:
        'Praktisk läsning: underlagets tre experiment, var och en med sin förutsägelse — bokens laboratorium är läsarens spegel.\n\nETT — DOPAMINDJUREN (Schultz apor; Knutson/Kuhnen i skannern). Apors dopaminceller lär sig signaler som föregår belöning; i hjärnskannern aktiveras accumbens före ett riskabelt val — kroppen avgör innan medvetandet hinner. Förutsägelse: privatpersoner köper det som redan stigit (förväntan kopierar senaste svängen) och jagar "lottoaktier" där historien är starkast — beteendet mätbart i Barber & Odeans data: de mest handelsaktiva hushållen fick sämst avkastning, ca 11,4 % mot marknadens 17,9 % under 1991–1996 (kapitel 2, 4).\n\nTVÅ — MYNTKASTET (Kahneman–Tversky). Vid jämna odds — krona: vinna 1 000, klave: förlora 1 000 — vägrar de flesta; först vid grovt dubbel vinst säger de ja. Förutsägelse: förluster realiseras ogärna (papperet är inte "på riktigt"), medan vinster tas för tidigt — dispositionseffekten, om och om igen påvisad i kontodata (kapitel 8).\n\nTRE — TÄRNINGARNA (Langer). Folk som vill slå höga tal kastar hårdare — hjärnan låtsas att ansträngning styr slumpen. Förutsägelse: "min research, min aktie" upplevs säkrare än samma aktie i andras händer, vilket förklarar koncentrerade portföljer byggda på kännsla av kontroll snarare än beräknad kant (kapitel 4, 10).',
    },
    {
      type: 'utmaning',
      content:
        'Övningen — räkna resan själv, på papper, i två kolumner. Välj en position eller portfölj du följer (utbildningens exempel, inte ett råd om vad du ska äga — 2007:528) och en period med minst tio noteringar. Kolumn ett är SIFFRAN: värdet vid varje notering, i procent från start. Kolumn två är KÄNSLAN: ett ord per rad — lugn, kick, oro, lättnad — kapitel 1:s skanner-protokoll i serieformat. Räkna sedan resan: multiplicera svängfaktorerna och ställ resultatet mot vad känslokolumnen sa längs vägen. Kursens förutsägelse, rakt ur underlaget: de två kolumnerna matchar inte — känslan har en annan nolla än aritmetiken. Notera var mismatchen var som störst (vid toppen? bottnen? mitt i?) och vilken referenspunkt ditt känsloläge vandrar efter. Spara bladet — kapitel 14:s hjärn-audit och journalen i /profil är dess naturliga hem.',
    },
    {
      type: 'text',
      content: `Räkneexemplet, ordagrant ur underlaget: en portfölj på 100 som svänger +10 % och −10 %. ${RAKNEDEKLARATION} Ren aritmetik på ett hypotetiskt exempel — ingen hämtad serie, inga nya tal. Två rutter genom samma sväng, med känslan noterad som olisikerad passagerare, står i tabellen nedan.`,
    },
    {
      type: 'tabell',
      content: JSON.stringify(tabellData),
    },
    {
      type: 'text',
      content:
        'Tre sätt känslan luras på samma siffror — kursens kärnfynd.\n\nETT — SYMMETRIFELET: +10 sedan −10 KÄNNS som noll men är −1 % (1,10 · 0,90 = 0,99). Tjugo sådana svängar: 0,99²⁰ ≈ 82 — 18 % borta på en resa som "bara gick upp och ner".\n\nTVÅ — REFERENSPUNKTEN VANDRAR: i resa A blir toppen 110 hjärtats nollpunkt — 99 känns som en förlust (−10 % från toppen) fast resan började på 100. I resa B blir botten 90 nollpunkten — 99 känns som en seger (+10 %), fast portföljen ligger ned. Samma slutvärde, två motsatta känslor: värdet är ordningsokänsligt, känslan är det inte.\n\nTRE — ASYMMETRISK VIKT: med λ ≈ 2 väger nedsvängens smärta dubbla lyftets behag — därför upplevs svängiga portföljer tyngre än de är i procent, och ju oftare kursen kollas, desto fler "förluster" registreras (den myopiska förlustaversionen — kapitel 6:s motgift, fast granskningsfrekvens, är skrivet för exakt detta).\n\nUtläset: siffran och känslan är två instrument som mäter två olika saker — kursen tränar eleven att läsa dem side om side utan att blanda ihop dem.',
    },
    {
      type: 'text',
      content:
        'Fallgroparna, kompakterade till tre.\n\n"JAG ÄR IMMUN." Bokens farligaste läsning är nöjsläsning: genvägarna syns alltid hos andra. Zweigs motgift är att utgå från att de egna besluten är förgiftade och kräva bevis för motsatsen — kontrollfrågan "vad om jag har fel?" som skriven regel, inte humör.\n\nATT LÄSA OM BETEENDE UTAN ATT ÄNDRA PROCESS. Att känna namnet på biasen ändrar inte ett beslut; kärnan är att fatta FÄRRE beslut i stunden. Elev som kan ordet förlustaversion men saknar förbestämda regler för beslut, storlek och genomgång har bara köpt en dyrare ursäkt — kapitel 13:s verktygslåda är motgåvet.\n\nATT BOKEN BLIR TIMING-VERKTYG. "Nu ser jag när dopaminet köper" är bara övertro på en ny nivå — neurokunskapen förklarar beteende, den förutsäger inte marknadens nästa steg (kapitel 11:s tre-skikts-test på neuroanspråk).',
    },
    {
      type: 'insikt',
      content: `F24 är Fas 3:s avslutande psykologikurs och samlar tråden. Fas 2 bygger processen (AKM2, V01–V20); F18–F20 visar historiskt att regler utan tolkning överlever serier; F21 ger zonen (utfall som stickprov); F22 (Coates) kroppens kemi; F23 (Shull) känslan som information — och F24 förklarar VARFÖR allt behövs: hjärnans genvägar fungerar snabbare än tanken. Skyddet är därför inte viljestyrka utan arkitektur: regler skrivna i förväg, positionstorlekar, journalen (F14) där känsla redovisas som känsla, och AI-Mentorn som förhöra eleven på experimenten. Räkneexemplet är plattformens röda tråd i miniatyr: siffra och känsla side om side — utbildning om hur hjärnan fungerar, aldrig råd om vad någon ska köpa eller sälja (2007:528). ${JURIDIKDEKLARATION}`,
    },
  ],
  quiz: [
    {
      q: 'Vad visar räkneexemplet om svängen +10 % sedan −10 %?',
      alternativ: [
        'Att svängen lämnar portföljen oförändrad, eftersom procenterna tar ut varandra',
        'Att resultatet beror på ordningen — upp före ner är bättre än ner före upp',
        'Att procent alltid räknas additivt och svängen därför är exakt noll',
        'Att +10 % sedan −10 % känns som noll men är −1 % — 1,10 · 0,90 = 0,99, och tjugo sådana svängar ger 0,99²⁰ ≈ 82',
      ],
      ratt: 3,
      tips: 'Multiplicera faktorerna, inte procenterna — procentsvängar är inte symmetriska.',
    },
    {
      q: 'Resa A och resa B i tabellen slutar båda på 99 — varför känns de olika?',
      alternativ: [
        'Därför att känslans nollpunkt vandrar: i resa A blir toppen 110 nollpunkten och 99 känns som en förlust (−10 % från toppen), i resa B blir botten 90 nollpunkten och 99 känns som en seger (+10 %)',
        'Därför att den ena resan är mer lönsam i procent vid slutnoteringen',
        'Därför att slutvärdet 99 räknas olika beroende på svängarnas ordning',
        'Därför att hjärnan minns nedgångar tydligare än uppgångar i resa A men tvärtom i resa B',
      ],
      ratt: 0,
      tips: 'Värdet är ordningsokänsligt — känslan är det inte.',
    },
    {
      q: 'Vilken läsning av boken pekar kursen ut som den farligaste?',
      alternativ: [
        'Att läsa den långsamt med anteckningar efter varje kapitel',
        'Att läsa den tillsammans med Kahnemans och Coates böcker för bredare täckning',
        'Nöjsläsningen — genvägarna syns alltid hos andra, aldrig hos en själv (bias blind spot)',
        'Att läsa den igen före varje större beslut för att kalibrera känslan',
      ],
      ratt: 2,
      tips: 'Zweigs motgift: utgå från att de egna besluten är förgiftade och kräv bevis för motsatsen.',
    },
  ],
};

j.chapters.push(kapitel);
j.chapters_list.push({ num: 15, title: 'Från boken till egen analys', minutes: 12 });
j.chapterCount = j.chapters.length;
j.totalMinutes = j.chapters.reduce((a, c) => a + c.minutes, 0);

fs.writeFileSync(FIL, JSON.stringify(j, null, 2) + '\n');
console.log(
  `APPEND klart: chapterCount=${j.chapterCount}, totalMinutes=${j.totalMinutes}, chapters_list=${j.chapters_list.length} poster`,
);
