#!/usr/bin/env node
// v166-d09 — appenda djupkapitel 16 "Från boken till egen analys" i
// data/bokmaster/the-visual-investor.json (underlag f09, DESIGN-v166).
// Metod: text-ankarbyte (d01-mönstret) — befintliga rader RÖRS EJ.
import fs from "node:fs";

const P = "/home/ak1a/AK1/data/bokmaster/the-visual-investor.json";
const txt0 = fs.readFileSync(P, "utf8");
const old = JSON.parse(txt0);

// ---------- förhandsvillkor ----------
if (old.chapters.length !== 15 || old.chapterCount !== 15 || old.totalMinutes !== 170)
  throw new Error(`förhandsvillkor brutet: len=${old.chapters.length} cc=${old.chapterCount} tm=${old.totalMinutes}`);
if (old.chapters_list.length !== 15 || typeof old.chapters_list[0] !== "string")
  throw new Error("chapters_list är inte 15 strängposter");
if (old.chapters[14].num !== 15) throw new Error("sista kapitlet är inte num 15");
const snapChapters = JSON.stringify(old.chapters);
const snapList = JSON.stringify(old.chapters_list);

// ---------- kapitel 16 (underlag f09, tal ordagrant) ----------
const kap = {
  num: 16,
  minutes: 13,
  title: "Från boken till egen analys",
  intro: "Femton kapitel har tränat det visuella ögat — det här tar steget från bokläsning till egen läsning. Du får hierarkin och frågeordningen i praktiken, ett fullständigt genomräknat trefönstersexempel på Ericsson B och fallgroparna mellan att se och att förutsäga. Underlaget är det granskade v164-arbetet (f09, 2026-09-24); allt nedan är utbildning i hur metoden läser grafer — inte investeringsråd (2007:528).",
  blocks: [
    {
      type: "text",
      content: "Murphys bok har en enda bärande tanke, och efter femton kapitel är den fortfarande ryggraden: en prisgraf är komprimerad information, och ögat kan läsa den före formlerna. Innan en enda indikator räknats fram ser ett tränat öga trendens riktning (kapitel 2), var kursen vänt tidigare (kapitel 3) och hur engagerat handeln varit (kapitel 7). Därför ordnar kursen det ögat ser i en hierarki — alltid i samma ordning:\n\n1. Trendens riktning. Högre toppar och bottnar (uppåt), lägre (nedåt) eller ingen av delarna (sidledes). Det första och viktigaste svaret.\n2. Nivåerna. Horisontella zoner där kursen stannat och vänt förr — stöd under, motstånd över.\n3. Volymens form. Var handeln var tung och var den tunn.\n4. Först därefter: formler. Indikatorer och uträkningar bekräftar och preciserar bilden — de ersätter den aldrig. Glidande medelvärden (kapitel 6) och oscillatorer (kapitel 8) är bekräftare, inte ersättare.\n\nOrdningsföljden är poängen: att mäta först man sett. Se — mät — räkna.",
    },
    {
      type: "text",
      content: "Så läggs hierarkin på en ny graf — samma sju frågor, alltid i samma ordning:\n\n1. Vilket fönster tittar du i? Månad, vecka eller dag — och är det medvetet valt? Börja alltid i det största fönstret.\n2. Peker helheten upp, ned eller sidledes? En fråga, tre svar.\n3. Var i rymden står kursen? Nära flerårstopp, mitt i intervallet eller nära flerårsbotten? Samma rörelse betyder olika saker på olika höjd.\n4. Vilka nivåer syns? Rita — mentalt eller med pennan — de horisontella linjer där kursen vänt minst två gånger förut.\n5. Hur ser svängarna ut? Jämför bottnars och toppars inbördes höjd — det är trenddefinitionen i praktiken.\n6. Var var volymen tung? Sök staplarna som sticker ut under svängar och brott.\n7. Nu — och först nu — räkna. Mät rörelserna i procent, fäst datum vid varje märke.\n\nRegelbundet förfarande gör läsningen reproducerbar: två elever som följer ordningen kommer till samma observationer, även om de drar olika slutsatser. Det är skillnaden mellan att titta och att läsa.",
    },
    {
      type: "utmaning",
      content: "Sjufrågebladet: välj en aktie du redan har en AKM1-bedömning på — gärna ur din egen analysmapp. Öppna månadsgrafen (fem år) och besvara de sju frågorna skriftligen, en rad per fråga, i exakt ordning: fönstret, helheten, läget i rymden, nivåerna, svängarna, volymen — och först på rad sju mätningarna (procent och datum vid varje märke). Byt sedan till veckografen och dagsgrafen och upprepa frågorna två och tre. Avsluta med att jämföra ditt blad med AK1TS-motorns rader för samma aktie: pekar ögat och poängen samma håll? Där de skiljer sig har du hittat arbetspunkten — och ett blad värt att spara till nästa graf du möter.",
    },
    {
      type: "text",
      content: "Trefönsterexemplet — tre fönster, samma aktie: Ericsson B. Verkliga kurser, Ericsson B (ERIC-B.ST), källa Yahoo Finance, hämtat 2026-09-24. En övning i att läsa — inte en rekommendation (2007:528).\n\nMånadsgrafen (fem år) — helheten. Månadsavslut topp dec 2021: 114,80 kr. Månadsavslut botten sep 2023: 50,01 kr. Fallet: (114,80 − 50,01) ÷ 114,80 = −56,4 %. Återhämtningen till månadsavslut april 2026: 120,10 kr = +140,2 % (kursen ×2,4). Senaste avslut: 94,26 kr = 21,5 % under apriltoppen. Månadsvyn avslöjar det största sammanhanget: en hel nedgångs- och återhämtningscykel — och att kursen idag står nära där allt började 2021. Den som bara ser denna vy vet formen men inte mekanismen.\n\nVeckografen (14 månader) — vändningen. Veckoavslutstoppen maj 2026: 125,85 kr. Veckoavslutsbotten juli: 91,52 kr. Fallet: (125,85 − 91,52) ÷ 125,85 = −27,3 % — en mellantrendsvändning som månadsgrafens lugna staplar nästan slukar. Efter botten: en bas mellan ~91 och ~100 kr, med högre bottnar (93,82 → 96,7 → 96,76). Veckovyn avslöjar var den stora bilden vände — information månadsgrafen suddar ut och dagsgrafen drunknar i.",
    },
    {
      type: "text",
      content: "Dagsgrafen (fem månader) — mekanismen. Högsta dagavslut: 127,35 kr (2 juni). Lägsta: 91,50 kr (23 juli) — −28,2 %. Största enskilda dagsrörelse: 14 juli, 112,75 → 98,54 kr = −12,6 % på en dag, på 42,8 miljoner aktier mot ett snitt på 8,7 miljoner — 4,9× normal volym. Dagsvyn avslöjar exakt vilka dagar händerna hände och hur tung handeln var. Läst ensam ser den mestadels ut som brus.\n\nSlutsatsen är hierarkin själv: dagsgrafen detaljerar veckografen, veckografen detaljerar månadsgrafen — aldrig tvärtom. Tre fönster, tre sanna svar, en bild. Så läs exemplet: inte som ett utfästende om bolagets framtid, utan som övningen i att flytta information mellan fönster — procent för procent, datum för datum, volym mot snitt.",
    },
    {
      type: "text",
      content: "Fyra fallgropar möter dig mellan syn och tillämpning:\n\nZoomfällan — kursens huvudfallgrop. Den som öppnar dagsgrafen först (eller bara) läser brus som struktur. Varje dagsvy ska bäddas i sin veckovy, varje veckovy i sin månadsvy. Helheten förloras en zoomning i taget — och återfås en utzoomning i taget.\n\nLinjalens självbedrägeri. Ögat hittar gärna mönster som passar: en trendlinje kan dras så att den »fungerar«. Skyddet är räknekulturen från Fas 2:s trappsteg: mät i procent, fäst datum, redovisa öppet vad som skulle förändra läsningen.\n\nSkalningsillusioner. En kort yta med dramatiska staplar kan visa samma marknad som en lugn månadsgraf. Kursen visar samma data i flera skalor — kontrollera alltid axlarnas intervall innan du jämför två bilder.\n\nAtt förväxla se med förutsäga. Det visuella läget är en sannolikhetsbild av historik, inte ett löfte. Boken själv håller indikatorerna få — kursen gör likadant: få verktyg, hårt disciplinerade.",
    },
    {
      type: "insikt",
      content: "Det här är Fas 3:s ingång — och kursens gåva till resten av plattformen. Frågeordningen är en checklista du kan köra på varje graf i AKM2-analyserna och i portföljmotorns övningsytor; räknekulturen (procent, datum, volym mot snitt) är rakt arv från Fas 2:s trappsteg. Samma trappa — månad → vecka → dag — bär vågornas grader och Murphy-systemets tidsramshierarki i grannkurserna. I AI-Mentorn kan du jämföra din egen sjufrågeläsning med modellens: ögat tränas mot samma bild. Kursen övar det hela plattformen vilar på — att se helheten före detaljen. Utbildningsmaterial: metoden beskriver hur grafer läses; inga investeringsråd, inga avkastningslöften (2007:528).",
    },
  ],
  quiz: [
    {
      q: "Vilket påstående fångar den visuella hierarkin?",
      alternativ: [
        "Ögat läser trend, nivåer och volym först — formler och indikatorer bekräftar och preciserar bilden först därefter",
        "Indikatorerna avgör trenden och grafen bekräftar dem",
        "Volymen ska alltid bedömas före trendens riktning",
        "Alla fyra stegen ska räknas fram samtidigt för att bilden ska gälla",
      ],
      ratt: 0,
      tips: "Se — mät — räkna: ordningen är poängen, inte verktygen.",
    },
    {
      q: "Vad visar trefönsterexemplet på Ericsson B?",
      alternativ: [
        "Dagsgrafen ger helheten och månadsgrafen detaljerna",
        "Alla tre fönstren ger alltid samma svar om marknaden",
        "Dagsgrafen detaljerar veckografen, som detaljerar månadsgrafen — tre fönster, tre sanna svar, en bild",
        "Endast månadsgrafen behövs; vecko- och dagsvyerna tillför bara brus",
      ],
      ratt: 2,
      tips: "Fönstren är hierarkiska: det mindre detaljerar det större — aldrig tvärtom.",
    },
    {
      q: "Vilket påstående om zoomfällan stämmer?",
      alternativ: [
        "Den som öppnar dagsgrafen först läser strukturen tydligare",
        "Den som öppnar dagsgrafen först riskerar att läsa brus som struktur — varje dagsvy ska bäddas i sin veckovy och månadsvy",
        "Zoomfällan gäller bara månadsgrafer med långa serier",
        "Zoomnivån spelar ingen roll om indikatorerna är korrekt inställda",
      ],
      ratt: 1,
      tips: "Helheten förloras en zoomning i taget — och återfås en utzoomning i taget.",
    },
  ],
};

const indentera = (s, niv) => s.split("\n").map(l => " ".repeat(niv) + l).join("\n");
const kapText = indentera(JSON.stringify(kap, null, 2), 4);

// ---------- 1) chapters: stäng sista kapitlet, appenda kap 16 ----------
const ankChapters = "\n    }\n  ],\n  \"kalla\"";
if (txt0.split(ankChapters).length !== 2) throw new Error("chapters-ankaret är inte unikt");
let txt = txt0.replace(
  ankChapters,
  "\n    },\n" + kapText + "\n  ],\n  \"kalla\"",
);

// ---------- 2) chapters_list: appenda post 16 som {num,title,minutes} ----------
// (kontrakt DESIGN-v166 rad 31; de 15 strängposterna lämnas orörda — append-only)
const ankLista = "    \"15. Sammanfattning — den visuella investeraren (syntes AKM1 × AK1TS)\"\n  ],";
if (txt.split(ankLista).length !== 2) throw new Error("chapters_list-ankaret är inte unikt");
txt = txt.replace(
  ankLista,
  "    \"15. Sammanfattning — den visuella investeraren (syntes AKM1 × AK1TS)\",\n    {\n      \"num\": 16,\n      \"title\": \"Från boken till egen analys\",\n      \"minutes\": 13\n    }\n  ],",
);

// ---------- 3) räknare ----------
for (const [fr, till] of [["\"chapterCount\": 15", "\"chapterCount\": 16"], ["\"totalMinutes\": 170", "\"totalMinutes\": 183"]]) {
  if (txt.split(fr).length !== 2) throw new Error(`räknefältet ${fr} är inte unikt`);
  txt = txt.replace(fr, till);
}

// ---------- efterkontroll ----------
const book = JSON.parse(txt);
const fel = [];
if (book.chapters.length !== 16) fel.push("chapters-längd != 16");
const summa = book.chapters.reduce((a, k) => a + k.minutes, 0);
if (summa !== 183 || book.totalMinutes !== 183) fel.push(`Σ=${summa} totalMinutes=${book.totalMinutes}`);
if (book.chapterCount !== 16) fel.push("chapterCount != 16");
if (JSON.stringify(book.chapters.slice(0, 15)) !== snapChapters) fel.push("kapitel 1–15 ej bit-identiska");
if (JSON.stringify(book.chapters_list.slice(0, 15)) !== snapList) fel.push("chapters_list-poster 1–15 ej bit-identiska");
const sista = book.chapters[15];
if (sista.num !== 16 || sista.title !== "Från boken till egen analys") fel.push("kap 16 fel");
if (sista.quiz.length !== 3) fel.push("quiz != 3");
const listPost = book.chapters_list[15];
if (typeof listPost !== "object" || listPost.num !== 16 || listPost.title !== sista.title || listPost.minutes !== sista.minutes)
  fel.push("chapters_list-post 16 matchar ej kapitel 16");
const typer = sista.blocks.map(b => b.type).join(",");
if (typer !== "text,text,utmaning,text,text,text,insikt") fel.push("blockstruktur: " + typer);
if (fel.length) { console.error("EFTERKONTROLL FALLERADE:", fel); process.exit(1); }

fs.writeFileSync(P, txt, "utf8");
console.log("✓ kapitel 16 appenderat — 15+1=16 kapitel, Σ 170+13=183 min, chapters_list 15 strängar + 1 objektpost, kapitel 1–15 bit-identiska");
