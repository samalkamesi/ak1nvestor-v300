#!/usr/bin/env node
// _s4u3-nem-paket.mjs — bygger paket-JSON ur talbanken (alla tal interpoleras, inga handskrivna siffror)
import { readFileSync, writeFileSync } from 'node:fs';
const T = JSON.parse(readFileSync('/home/ak1a/AK1/verktyg/_s4u3-nem-tal.json', 'utf8'));
const g = T.grendata, h = T.harled, s = T.scenario, ser = T.serier;
const prognos = 0.102; // universumradens tillvaxt.prognosTillvaxt (2026-09-03)
const sv = (x, ant = 2) => x.toLocaleString('sv-SE', { minimumFractionDigits: ant, maximumFractionDigits: ant });
const pct = (x, ant = 2) => sv(x * 100, ant) + ' procent';
const ai = x => Math.round(x).toLocaleString('sv-SE');
const cell = (pris, kost) => {
  const cc = s.celler.find(c => c.pris === pris && c.kostnad === kost);
  return `**${ai(cc.netto)}** (${cc.nettoMotBas >= 0 ? '+' : '−'}${sv(Math.abs(cc.nettoMotBas) * 100, 1)} %)`;
};

const body = `Newmont Corporation — ticker NEM på börsen i New York — publicerar sin rapport för tredje kvartalet 2026 torsdagen den **22 oktober efter börsstängning**, med telefonkonferens på kvällen amerikansk östtid. Så här i förväg har bolaget ännu inte låst det exakta datumet i en egen utlysning — det är amerikansk praxis att bekräfta dagen via pressrelease närmare rapporttillfället — men de oberoende kalendrarna konvergerar: en bokar samtalet till just torsdagen 22 oktober, en estimerar samma dag utifrån fjolårets rytm och en håller ett fönster öppet 21–23 oktober. Fjolårets tredjekvartalsrapport kom 23 oktober och årets rytm har varit torsdagar rakt igenom (första kvartalet 23 april, andra kvartalet 23 juli). Paketet räknar med torsdagen 22 oktober och redovisar divergensen öppet — läs datumet mot bolagets egen händelsekalender när rapporten närmar sig.

Det här är läspaketets fråga, som alltid i serien: vad ska du ha med dig i verktygslådan för att kunna läsa rapporten när den landar — inte vad du bör göra med dina pengar. Newmont är världens största guldproducent och materialgrenens första amerikanska bolag i serien. Det gör paketet till en cykelläxa i ren form: en intäkt som drivs av en råvarapris-mekanik bolaget inte själv styr.

## Urvalet: varför Newmont är nästa paket i serien

Kön i spåret styrs av FIFO — tidigaste återstående rappdag med bärande data. Efter 69 paket på disk återstår i biblioteket Newmont, Logitech, Microsoft, Alphabet, Meta, Chevron, Disney, Palantir och Verizon, och av dem har Newmont tidigaste fönstret (22 oktober mot 27–28 oktober för tekniktätningen). Datamässigt är bolaget den starkaste klassen biblioteket har: grön post med relativ AKM1-poäng 0,775 och datatäckning 0,71. Universumraden från datainsamlingen den 3 september 2026, dubbelkällad mot två oberoende dataleverantörer, är fullt befolkad: börsvärde ${sv(T.rad.mcapMdr, 2)} miljarder dollar, kurs ${sv(T.rad.pris, 2)} dollar, och fyraåriga serier för omsättning och resultat. Den noterade också ${ai(T.rad.insiderkop)} insiderköp under senaste halvåret — ett observationsfält i raden, inte en signal att bygga något på. Bibliotekets svagaste kategori för bolaget är katalysator — noll poäng — medan lönsamheten är starkaste kategorin. Det är läspaketets vinkel, helt enligt seriens princip när modellen säger att rapportdagen själv är händelsen: en rapport utan utsedda katalysatorer gör kvartalsdagen till katalysatorn.

## Nyckeltalen att ha med sig — marginaltronen och multiplarklyvningen

Materialgrenen har ${T.kalla.grenN} bolag i universumfilen, och mot dem intar Newmont en position serien inte sett tidigare: **toppen av båda marginalleden samtidigt**. Rörelsemarginalen ${pct(g.ebit.nem, 2)} och nettomarginalen ${pct(g.netto.nem, 2)} är rankade ${ai(g.ebit.rang.plats)} av ${ai(g.ebit.rang.av)} — det högsta värdet i hela grenen, i båda fallen. Bruttomarginalen ${pct(g.brutto.nem, 2)} ligger ${ai(g.brutto.rang.plats)} av ${ai(g.brutto.rang.av)}. Medianbolaget i grenen rör sig med rörelsemarginal ${pct(g.ebit.v, 2)} och nettomarginal ${pct(g.netto.v, 2)} — Newmonts rörelsemarginal är nästan fyra gånger medianen. Det är inte förvaltarskick i sig; det är råvarans mekanik. I andra kvartalets rapport realiserade bolaget i genomsnitt ${sv(h.realiserat, 0)} dollar per uns guld mot kostnaden per uns — all-in sustaining costs, branschens kostnadsmått — på ${sv(h.aisc, 0)} dollar. Skillnaden, ${ai(h.margOz)} dollar per uns, är ${pct(h.aiscMarginal, 2)} av priset: så ser en marginal ut när intäkten är ett världsmarknadspris och kostnaden är gruvans.

Så kommer klyvningen. Vinstmultiplarna är billiga i grenen: EV/EBIT ${sv(g.evEbit.nem, 2)} mot medianen ${sv(g.evEbit.v, 2)} — ${ai((1 - g.evEbit.nem / g.evEbit.v) * 100)} procent under, rank ${ai(g.evEbit.rang.plats)} av ${ai(g.evEbit.rang.av)} — och P/E ${sv(g.pe.nem, 2)} mot ${sv(g.pe.v, 2)}. Men balans- och tillväxtmultiplarna är dyra: P/B ${sv(g.pb.nem, 2)} är ${sv(g.pb.nem / g.pb.v, 2)} gånger medianen ${sv(g.pb.v, 2)} (rank ${ai(g.pb.rang.plats)} av ${ai(g.pb.rang.av)}), och PEG ${sv(g.peg.nem, 2)} mot medianen ${sv(g.peg.v, 3)} — rank ${ai(g.peg.rang.plats)} av ${ai(g.peg.rang.av)}. Bibliotekets modell ger själv P/B-kategorin bottencensur i just det här bolaget — Grahams varning på multiplar över 1,5 är aktiverad, och P/S-kategorin ligger i bottenbandet. Läs klyvningen så här: marknaden betalar ogenerat för kapitalet men prissätter vinsten som om den vore en cykeltopp. Med en nettomarginal som mer än fördubblats på två år är frågan inte otänkbar — det är precis frågan rapporten besvarar. Fritt kassaflödesyield ${pct(g.fcfY.nem, 2)} (rank ${ai(g.fcfY.rang.plats)} av ${ai(g.fcfY.rang.av)}, median ${pct(g.fcfY.v, 2)}) och skuldkvot ${sv(g.skuldEk.nem, 4)} mot medianen ${sv(g.skuldEk.v, 2)} — femte lägsta av ${ai(g.skuldEk.rang.av)} — kompletterar bilden: en maskin som gör kontanter utan hävstång.

Serierna bakom: omsättningen gick ${ser.omsMUSD.map(x => ai(x)).join(' → ')} miljoner dollar åren ${ser.ar.join(' → ')}, totalt ${pct(h.omsTotal, 1)} på fyra år, medan resultatraden gick ${ser.resMUSD.map(x => ai(x)).join(' → ')} — från förlust till rekord. Nettomarginalen per år: ${h.nettoMargAr.map(x => pct(x, 2)).join(', ')}. Det är vändelsens geometri, och den är paketets tredje signaturnummer: svängen från botten ${pct(h.nettoMargAr[1], 2)} till ${pct(h.nettoMargAr[3], 2)} är ${sv(h.marginalsvang, 1)} procentenheter, och i absoluta tal är vändelsen ${ai(h.vandelse)} miljoner dollar från djupet 2023 till 2025. Därför står resultat-CAGR som osatt i källan — procenttillväxt ur ett negativt basår är matte utan mening — och paketet redovisar vändelsen i dollar istället. Det är samma öppna null-hantering serien haft förr, och den är en del av läxan: vissa tal ska vägras räknas.

## Källkritik: tre marginalbegrepp och en residualkassa

**Första provet — identiteten tre vägar.** P/B dividerat med ROE ska ge P/E: ${sv(h.identPBoROE, 3)} mot P/E-fältets ${sv(g.pe.nem, 3)}, ett gap på ${pct(h.gapIdent, 2)}. Omvänt: trailingvinst per aktie ${sv(h.epsT, 2)} dollar dividerat med bokfört kapital per aktie ${sv(h.bvps, 2)} dollar ger härlett ROE ${pct(h.roeHarled, 2)} mot fältets ${pct(g.roe.nem, 2)} — gap ${pct(h.gapRoe, 2)}. Båda gappen är fält-snapshot-divergenser av samma klass serien dokumenterat tidigare (källans värderingsfält och lönsamhetsfält är tagna vid olika tidpunkter), och de redovisas här öppet som just divergenser — inte slätade över.

**Andra provet — bruttofällan.** Tre marginalbegrepp cirkulerar: bruttomarginal ${pct(g.brutto.nem, 2)}, rörelsemarginal ${pct(g.ebit.nem, 2)} och uns-marginalen ${pct(h.aiscMarginal, 2)}. Ingen av dem är den andre. Gruvbolagets bruttomarginal är redan efter rörelsens kostnader, uns-marginalen räknas per producerad uns med branschens kostnadsmått, och rörelsemarginalen är bokföringens. Blanda dem inte — tabellen i nästa sektion använder konsekvent bokförda marginaler för jämförbarhetens skull.

**Tredje provet — teckenkollisionen.** Två förlustår i serien (${ai(ser.resMUSD[0])} och ${ai(ser.resMUSD[1])} miljoner dollar) samtidigt som tillväxtfälten är positiva: trailing-tillväxt ${pct(g.ttm.nem, 1)}, prognostiserad ${pct(prognos, 1)}. Kollisionen löses av datumordningen — förlusterna ligger i historien, tillväxten i nuet — men den påminner om vad fyra års serie förmår dölja: en hel konjunktursväng.

**Fjärde provet — valutan.** Rapportvalutan är dollar och universumradens valuta är dollar: ingen brygga behövs. Men grenens tvärjämförelse i börsvärde är oläslig — filen noterar kollegorna i lokala valutor (svenska kronor, norska, schweiziska) mot Newmont i dollar — så paketet rangordnar bara procentfält, som är valutaneutrala, och lämnar storleksjämförelsen därhän.

**Femte provet — EV-kedjan och residualen.** Bygg enterprise value baklänges: rörelseresultat 2025 blir ${ai(h.ebit2025)} miljoner dollar (marginalen gånger omsättningen), multiplicerat med EV/EBIT-fältet ${sv(g.evEbit.nem, 3)} ger ${ai(h.evFranFalt)} miljoner dollar. Börsvärdet är ${ai(T.rad.mcapMdr * 1000)} miljoner, eget kapital ${ai(h.ek)} miljoner, skuld vid kvoten ${sv(g.skuldEk.nem, 4)} blir ${ai(h.skuld)} miljoner — och residualen, den implicita kassan, landar på ${ai(h.kassaImplicit)} miljoner dollar. Rapporterna visar i stället nettokassa runt tre miljarder. Residualen är alldeles för stor för att vara kassa — den visar att EV/EBIT-fältets nämnare inte är 2025 års bokförda rörelseresultat utan ett högre, prognosbaserat tal. Så ska en residual läsas: inte som ett faktum, utan som ett spår av nämnarbyte — samma läxa som serien kallat EV-kedjans kassaläsning. P/E dividerat med EV/EBIT ger ${sv(h.ebitDiskent, 2)}: diskonten mellan ett vinstmått och ett rörelsemått, i familj med vad grannpaketen i serien visat. Kassaflödet har förresten två egna fönster: yield-fältet gånger börsvärdet ger ${ai(h.fcfVag1)} miljoner dollar, marginalfältet gånger omsättningen ${ai(h.fcfVag2)} — gap ${pct(h.fcfGap, 1)}, redovisat som det är.

## Så står sig bolaget mot branschen

Medianerna nedan är räknade live ur universumfilens ${ai(T.kalla.poster)} poster, ${ai(T.kalla.grenN)} i materialgrenen — mittersta värdet per fält bland de poster som bär det (antalet Bärande varierar från fält till fält; där värden saknas blir n lägre, vilket tabellens rang-kolumn visar):

| Nyckeltal | Newmont | Grenmedian | Rang |
|---|---|---|---|
| P/E | ${sv(g.pe.nem, 2)} | ${sv(g.pe.v, 2)} | ${ai(g.pe.rang.plats)}/${ai(g.pe.rang.av)} |
| P/B | ${sv(g.pb.nem, 2)} | ${sv(g.pb.v, 2)} | ${ai(g.pb.rang.plats)}/${ai(g.pb.rang.av)} |
| EV/EBIT | ${sv(g.evEbit.nem, 2)} | ${sv(g.evEbit.v, 2)} | ${ai(g.evEbit.rang.plats)}/${ai(g.evEbit.rang.av)} |
| PEG | ${sv(g.peg.nem, 2)} | ${sv(g.peg.v, 3)} | ${ai(g.peg.rang.plats)}/${ai(g.peg.rang.av)} |
| Fritt kassaflödesyield | ${pct(g.fcfY.nem, 2)} | ${pct(g.fcfY.v, 2)} | ${ai(g.fcfY.rang.plats)}/${ai(g.fcfY.rang.av)} |
| Bruttomarginal | ${pct(g.brutto.nem, 2)} | ${pct(g.brutto.v, 2)} | ${ai(g.brutto.rang.plats)}/${ai(g.brutto.rang.av)} |
| Rörelsemarginal | ${pct(g.ebit.nem, 2)} | ${pct(g.ebit.v, 2)} | ${ai(g.ebit.rang.plats)}/${ai(g.ebit.rang.av)} |
| Nettomarginal | ${pct(g.netto.nem, 2)} | ${pct(g.netto.v, 2)} | ${ai(g.netto.rang.plats)}/${ai(g.netto.rang.av)} |
| ROE | ${pct(g.roe.nem, 2)} | ${pct(g.roe.v, 2)} | ${ai(g.roe.rang.plats)}/${ai(g.roe.rang.av)} |
| ROIC | ${pct(g.roic.nem, 2)} | ${pct(g.roic.v, 2)} | ${ai(g.roic.rang.plats)}/${ai(g.roic.rang.av)} |
| Skuld/eget kapital | ${sv(g.skuldEk.nem, 4)} | ${sv(g.skuldEk.v, 2)} | ${ai(g.skuldEk.rang.plats)}/${ai(g.skuldEk.rang.av)} |
| Omsättningstillväxt TTM | ${pct(g.ttm.nem, 1)} | ${pct(g.ttm.v, 1)} | ${ai(g.ttm.rang.plats)}/${ai(g.ttm.rang.av)} |

Läs tabellen i två block. Lönsamhetsblocket: Newmont över medianen i varje rad, på topp i marginalerna, med en skuldkvot i bottenregionen — maskinen är både stark och obelånad. Värderingsblocket: vinstnära multiplar under medianen, balans- och tillväxtmultiplar långt över. Mellan blocken står cykelfrågan. För den som vill gå djupare på mekaniken bakom enskilda rader har guiderna om [hur man räknar ROE](/blogg/hur-raknar-man-roe), [P/B och bokvärde](/blogg/pb-tal-nar-jamfor-man-bokvarde-ratt), [PEG-multipelns svagheter](/blogg/peg-multipeln-svagheter-2026) och [EV/EBITDA](/blogg/sa-raknar-du-ev-ebitda) varje mått utförligt — och variabelkapitlen [V07 om bruttomarginal](/blogg/v07-bruttomarginal-analys) följer råvarubolagets marginal som specialfall, medan [V12 om intäktsstabilitet](/blogg/v12-intaktsstabilitet-analys) tar volatiliteten och [V20 om återköp](/blogg/v20-aterekop-egna-aktier-analys) mekaniken i övning ett nedan.

## Tre sätt att läsa utfallet — övningar i metod

**Övning ett — återköpsmekaniken.** Bolaget aktiverade i april ett nytt återköpsprogram på ${ai(h.progAterkop)} miljoner dollar, och första kvartalets återköp löpte i 1 895 miljoner. Räkna: programmet dividerat med börsvärdet ${ai(T.rad.mcapMdr * 1000)} miljoner ger ${pct(h.aterkopAndel, 2)} av aktierna vid oförändrad kurs. Lås aktieantalet ${h.aktierM.toLocaleString('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} miljoner och räkna bakvägen: färre aktier, samma vinst, vinst per aktie upp med ${pct(h.epsLyft, 2)} — mekanik, inte magi. Vid första kvartalets takt tar programmet ${sv(h.kvarterPerProgram, 1)} kvartal, knappt ett år. Frågan till rapporten: höll takten? Se [guiden om återköp](/blogg/v20-aterekop-egna-aktier-analys) för var gränsen går mellan värdeskapande och kosmetika.

**Övning två — marginalhävstången.** Antag att guldpriset faller tio procent från andra kvartalets realiserade ${sv(h.realiserat, 0)} dollar medan kostnaden per uns står kvar på ${sv(h.aisc, 0)} dollar. Marginalen per uns går från ${ai(h.margOz)} till ${ai(h.margOzMinus10)} dollar — ett fall på ${pct(Math.abs(h.marginalfall), 1)}. Prisfallet tio procent blev marginalfallet sexton: förstoringen är ${sv(h.forstorning, 2)} gånger. Det är hela orsaken till att gruvresultat svänger hårdare än guldpriset — kostnaderna sitter fast medan intäkten dansar. Och det är därför vändelsen i nyckeltalssektionen kunde bli ${ai(h.vandelse)} miljoner dollar utan att någon enda gruva bytte plats.

**Övning tre — PEG-läxan med två tillväxtläsningar.** Konventionen: P/E ${sv(g.pe.nem, 2)} dividerat med prognostiserad tillväxt ${sv(prognos * 100, 1)} procent ger PEG ${sv(h.pegKonv, 2)}. Fältet säger ${sv(g.peg.nem, 2)}. Dela i stället P/E med PEG-fältet: ${sv(h.pegImplicitTillvaxt, 2)} procent — det är den tillväxt som räknats in i fältet. Två tillväxtläsningar, ${sv(prognos * 100, 1)} mot ${sv(h.pegImplicitTillvaxt, 2)} procent, och skillnaden mellan dem är en hel bedömning av hur länge guldprismaskinen får lov att snurra. Ingen av dem är fel — de svarar på olika frågor. Se [PEG-guiden](/blogg/peg-multipeln-svagheter-2026) för multiplens fallgropar.

## Praktiskt inför 22 oktober

Rapporten väntas efter stängning med kvällssamtal amerikansk östtid — svensk natt till fredagen. Konsensus för kvartalet ligger enligt en sammanställande källa runt 1,92 dollar per aktie — ett mått att läsa siffrorna mot, inte ett mål. Tre saker att läsa i ordningen de kommer. **Guidansen först:** helårets produktion ligger utlovad på 5,26 miljoner uns guld med drygt hälften vikten mot andra halvåret — tredje kvartalet är alltså första viktprovet på att höstarbetet levererar (förra kvartalet producerades 1,29 miljoner uns, medvetet lägre, medan kassaflödet ändå satte kvartalsrekord 2,2 miljarder dollar). **Kostnadsbanan sedan:** 1 621 dollar per uns senaste kvartalet — håller den, eller äter inflationen? **Kapitalåterbäringen till sist:** utdelningen står i 0,26 dollar per kvartal (1,04 per år, ${pct(h.direktAvk, 2)} direktavkastning — blygsam; payouten är ${pct(h.payoutEps, 1)} av trailingvinsten och ${pct(h.payoutFcf, 1)} av kassaflödet väg två), så återköpen är den rörliga delen: ${ai(h.progAterkop)} miljoner beslutade, 1 895 spenderade första kvartalet.

Scenariorutan att ha i huvudet, räknad på 2025 års bas (intäkt ${ai(s.basIntakt)} miljoner dollar, kostnad ${ai(s.basKostnad)} miljoner, nettovinst ${ai(s.basNetto)} miljoner; tre prislägen × tre kostnadslägen, skatteandelen hållen konstant — en förenkling, redovisad som sådan):

| Guldpris ↓, kostnad → | Kostnad −10 % | Kostnad oförändrad | Kostnad +10 % |
|---|---|---|---|
| **Pris −10 %** | ${cell(-0.10, -0.10)} | ${cell(-0.10, 0)} | ${cell(-0.10, 0.10)} |
| **Pris oförändrad** | ${cell(0, -0.10)} | ${cell(0, 0)} | ${cell(0, 0.10)} |
| **Pris +10 %** | ${cell(0.10, -0.10)} | ${cell(0.10, 0)} | ${cell(0.10, 0.10)} |

Notera asymmetrin: tio procent högre pris med tio procent högre kostnad ger fortfarande plus — medan spegelbilden ger det djupaste minuset. Rutan är metod, inte prognos.

## Källor

- Universumraden NEM: datainsamling 2026-09-03, dubbelkällad (två oberoende marknadsdataleverantörer), i filen med ${ai(T.kalla.poster)} poster; medianer och rang live-räknade ur samma fil (md5 ${T.kalla.md5.slice(0, 8)}).
- Analysbibliotekets post NEM: grön, relativ AKM1 0,775, datatäckning 0,71, versionsdatum 2026-09-04.
- Rapportfenster och rytm: bolagets egen händelsekalender (telefonkonferenser 23 april respektive 23 juli 2026, båda kvällarna östtid) samt tre oberoende kalendrar (bokad samtalstorsdag 22 oktober; ryttestimat 22 oktober; fönster 21–23 oktober) — divergensen redovisas i inledningen.
- Kvartalstal andra kvartalet 2026: bolagets rapport och sammanställningar av den — justerad vinst 2,10 dollar per aktie, rekord fritt kassaflöde 2,2 miljarder, realiserat guldpris 4 414 dollar per uns, produktion 1,29 miljoner uns, kostnad 1 621 dollar per uns, helårsguidans 5,26 miljoner uns med 52-procentig vikt mot andra halvåret.
- Kapitalåterbäring: fjolårets slutrapport deklarerar 0,26 dollar per aktie i utdelning (betald mars 2026, rytmen fortsatt genom året); första kvartalets allokering 1 895 miljoner återköp, 282 utdelning, 39 skuldåterbetalning; nytt program ${ai(h.progAterkop)} miljoner dollar aktiverat i april.
- Serier 2022–2025 ur universumraden; vändelse, marginaler och scenarioruta härledda i paketets motor med ABORT-grind.

Detta läspaket är utbildningsmaterial som visar hur analysmetoden fungerar — inte investeringsråd. Enligt lagen (2007:528) om värdepappersrörelse är utbildning tillåten (2 kap 5 §), medan rådgivning kräver tillstånd.`;

const ord = body.split(/\s+/).filter(Boolean).length;
const paket = {
  slug: 'sa-laser-du-newmont-q3-2026',
  title: `Newmonts kvartalsrapport 2026: så läser du den — materialgrenens första USA-paket: marginaltronen med rörelse- och nettomarginal rankade etta av ${ai(g.ebit.rang.av)} samtidigt som EV/EBIT ligger en tredjedel under grenmedianen`,
  description: `Newmont rapporterar torsdagen 22 oktober 2026 efter stängning (fönstret 21–23 oktober redovisas öppet). Världens största guldproducent och materialgrenens första USA-bolag i serien: rörelsemarginal ${pct(g.ebit.nem, 1)} och netto ${pct(g.netto.nem, 1)} båda rank ${ai(g.ebit.rang.plats)}/${ai(g.ebit.rang.av)} medan EV/EBIT ${sv(g.evEbit.nem, 1)} ligger under medianen ${sv(g.evEbit.v, 1)} — vändelsen +${ai(h.vandelse)} miljoner dollar från 2023 års botten, uns-marginalen 63 procent, återköpsprogrammet 6 miljarder och PEG-läxan med två tillväxtläsningar. Scenariorutan räknas på 2025 års bas; varje siffra har sin källa.`,
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-21',
  readingMinutes: 5,
  tags: ['kvartalsrapport', 'Newmont', 'material', 'gruvor', 'guld', 'nyckeltal'],
  body,
};
writeFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-newmont-q3-2026.json', JSON.stringify(paket, null, 1) + '\n');
console.log('OK paket skrivet. ord=' + ord);
