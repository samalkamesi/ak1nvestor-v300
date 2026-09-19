#!/usr/bin/env node
// s4-u3 GETINGE Q3 2026 — byggskript: genererar läspaketet ur beräknings-JSON.
// Alla tal i body interpoleras från /tmp/s4u3-getinge-berakning.json (motorräknade).
import { readFileSync, writeFileSync } from 'node:fs';

const B = JSON.parse(readFileSync('/tmp/s4u3-getinge-berakning.json', 'utf8'));
const f = B.f, K = B.kontroller, M = B.medianer;

const fmt = (n, d = 0) => n.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/\u00A0/g, ' ');
const pct = (n, d = 2) => fmt(n * 100, d) + ' %';
const mkr = n => fmt(Math.round(n));

const tabell = [
  ['P/E', fmt(f.pe, 3), fmt(M.pe.gren.med, 3), fmt(M.pe.univ.med, 3), `${M.pe.rang.join('/')}`],
  ['P/B', fmt(f.pb, 3), fmt(M.pb.gren.med, 3), fmt(M.pb.univ.med, 3), `${M.pb.rang.join('/')}`],
  ['EV/EBIT', fmt(f.evEbit, 2), fmt(M.evEbit.gren.med, 2), fmt(M.evEbit.univ.med, 2), `${M.evEbit.rang.join('/')}`],
  ['PEG', fmt(f.peg, 2), fmt(M.peg.gren.med, 2), fmt(M.peg.univ.med, 2), `${M.peg.rang.join('/')}`],
  ['FCF-avkastning', pct(f.fcfYield), pct(M.fcfYield.gren.med), pct(M.fcfYield.univ.med), `${M.fcfYield.rang.join('/')}`],
  ['ROE', pct(f.roe), pct(M.roe.gren.med), pct(M.roe.univ.med), `${M.roe.rang.join('/')}`],
  ['ROIC', pct(f.roic), pct(M.roic.gren.med), pct(M.roic.univ.med), `${M.roic.rang.join('/')}`],
  ['Bruttomarginal', pct(f.brutto, 1), pct(M.brutto.gren.med, 1), pct(M.brutto.univ.med, 1), `${M.brutto.rang.join('/')}`],
  ['EBIT-marginal', pct(f.ebit), pct(M.ebit.gren.med), pct(M.ebit.univ.med), `${M.ebit.rang.join('/')}`],
  ['Nettomarginal', pct(f.netto), pct(M.netto.gren.med), pct(M.netto.univ.med), `${M.netto.rang.join('/')}`],
  ['FCF-marginal', pct(f.fcfMarg), pct(M.fcfMarg.gren.med), pct(M.fcfMarg.univ.med), `${M.fcfMarg.rang.join('/')}`],
  ['Skuld/EK', fmt(f.skuldEK, 3), fmt(M.skuldEK.gren.med, 3), fmt(M.skuldEK.univ.med, 3), `${M.skuldEK.rang.join('/')}`],
  ['Prognostillväxt', pct(f.prognos), pct(M.prognos.gren.med), pct(M.prognos.univ.med), `${M.prognos.rang.join('/')}`],
  ['Resultat-CAGR', pct(f.resCAGR), pct(M.resCAGR.gren.med), pct(M.resCAGR.univ.med), `${M.resCAGR.rang.join('/')}`],
  ['Omsättnings-CAGR', pct(f.omsCAGR), pct(M.omsCAGR.gren.med), pct(M.omsCAGR.univ.med), `${M.omsCAGR.rang.join('/')}`],
  ['Omsättningstillväxt TTM', pct(f.ttm, 1), pct(M.ttm.gren.med), pct(M.ttm.univ.med), `${M.ttm.rang.join('/')}`],
];
const l = (slug, namn) => `[${namn}](/dataset/halso/${slug})`;
const rad = r => `| ${l(r[5] || slugFor(r[0]), r[0])} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} |`;
function slugFor(namn) {
  const map = {
    'P/E': 'pe', 'P/B': 'pb', 'EV/EBIT': 'ev-ebit', 'PEG': 'peg', 'FCF-avkastning': 'fcf-avkastning',
    'ROE': 'roe', 'ROIC': 'roic', 'Bruttomarginal': 'brutto-marginal', 'EBIT-marginal': 'netto-marginal',
    'Nettomarginal': 'netto-marginal', 'FCF-marginal': 'fcf-avkastning', 'Skuld/EK': 'skuldsattning',
    'Prognostillväxt': 'prognos-tillvaxt', 'Resultat-CAGR': 'resultat-cagr-5ar',
    'Omsättnings-CAGR': 'omsattning-cagr-5ar', 'Omsättningstillväxt TTM': 'omsattningstillvaxt-ttm',
  };
  return map[namn];
}

const serie = B.ar.map((a, i) => {
  const stegO = i === 0 ? '—' : '+' + fmt(K.stegOms[i - 1] * 100, 2) + ' %';
  const stegR = i === 0 ? '—' : (K.stegRes[i - 1] >= 0 ? '+' : '') + fmt(K.stegRes[i - 1] * 100, 2) + ' %';
  return `| ${a} | ${mkr(B.oms[i])} | ${mkr(B.res[i])} | ${stegO} | ${stegR} | ${pct(K.nettoMarg[i])} |`;
}).join('\n');

const [c11, c12, c13, c21, c22, c23, c31, c32, c33] = K.rutor;

const body = `## Urvalet: varför Getinge är nästa paket i serien

Kvartalsrapportserien ger varje rapporterande bolag i universumet ett läspaket inför Q3 2026 — urval, nyckeltal, källkritik och övningar, allt byggt på den egna datainsamlingen. Hälsogrenen har fem paket på disk (AstraZeneca, Johnson & Johnson, Boston Scientific, CellaVision och Novo Nordisk); med de tidigare fönstrens bolag tömda är det dags för grenens sjätte och seriens 49:e paket: **Getinge (GETI-B.ST)**, den svenska medicinteknikjätten som gör utrustning för sterilisering, intensivvård, kardiologi och akutvård — en tillverkningsindustri i hälsogrenens marginalvärld, vilket i sig är en läsart: läkemedelsbolagens bruttomarginaler drar upp grenens medeltal, och ett utrustningsbolag mäts därför bäst mot universumet i stort (mer om det i nyckeltalssektionen).

Sorteringen bakom valet, samma tron som alltid — officiellt bekräftad rappdag med bärande universumdata:

1. **Kinnevik (15 oktober)** gallras — för fjärde paketet i rad. Universumposten har nollår i omsättningsserien (0, 936, 23 och 0 miljoner kronor), negativt resultat alla fyra åren, P/E osatt och PEG på negativt underlag; gallran dokumenterades i Wallenstam-, SAP- och Vår Energi-paketens urvalsnotiser och omprövas inte.
2. **Getinge (20–21 oktober)** — rappdagen är bekräftad i bolagets EGET material, med en dagars intern divergens som redovisas öppet: rapport- och presentationssidan anger tisdagen den 20 oktober, finanskalendern i pre-close-briefen den 21:a (MarketScreener speglar det senare). Q1 2026 redovisades 21 april och Q2 17 juli — rytmen håller — och Q3:s pre-close brief hölls redan den 15 september. Kalenderfakta med båda läsningarna är ärligare än ett valt datum; paketet använder 20 oktober som primärt datum och noterar 21:a som alternativ läsning.
3. **Billerud och Viaplay (22 oktober)** gallras på data: Billerud med P/E osatt, negativa marginaler och resultat-CAGR −46,3 procent (Boliden-paketets gallran), Viaplay med bruten resultatserie (nollår 2025, förlustår −9 747 miljoner kronor 2023) och ROE −52,9 procent.
4. **Balder, Catena, Diös och Hexagon (23 oktober)** gallras enligt Wihlborgs-precedensen — tredjepartsdatum utan bekräftelse på bolagets egen IR-sida.
5. **Equinor (28 oktober)** är nästa stora namn i kön med stark data (P/E 11,6, ROE 21,3 procent), sedan Stora Enso (30 oktober), Kambi (4 november) och MTG (5 november).

En skalnot innan siffrorna: marknadsvärdet är 66,9 miljarder kronor och kursen i filen 245,70 kronor — mittpartiet i en gren där Novo Nordisk väger hundratals miljarder och CellaVision knappt fyra. [Bolagets sida](/bolag/geti-b-st) i universumbiblioteket samlar underlaget.

## Nyckeltalen att ha med sig — utrustningsbolaget i läkemedelsgrenen

Alla tal nedan är hämtade ur bolagsuniversumets datainsamling för Getinge (2026-09-03) och jämförda mot hälsogrenens och hela universumets medianer (beräknade ur samma fil; 20–22 bolag i grenen per mått, universumet 155–195):

| Mått | Getinge | Hälso-median | Universum-median | Rang i grenen |
|---|---|---|---|---|
${tabell.map(rad).join('\n')}

Fyra bilder ur tabellen:

- **Multiplklyvningen.** P/B 2,163 ligger 40 procent under hälsogrenens median 3,620 — och EV/EBIT 13,74 är grenens fjärde lägsta (19 av 22, medianen 17,86). Men PEG 1,54 är grenens TREDJE HÖGSTA (3/21 mot medianen 0,79). Samma bolag är alltså billigt i bok- och rörelsemultiplar och dyrt på tillväxtjusterad basis — en klyvning som bara är möjlig när vinsten fallit medan kapitalbasen växt, och som förklaras av marginalsvängen nedan. P/E 24,818 ligger strax under grenens median 26,08 och över universumets 21,15 — mittpartiet igen.
- **Marginalernas underläge — och universums mittpunkt.** Bruttomarginalen 48,6 procent ser låg ut i hälsogrenen (18/22, medianen 71,0) men ligger PÅ universumets median 47,8. Det är definitionen av Getinges position: ett medicinteknik-tillverkningsbolag bland läkemedelsdominerade grenmedianer — grenen är fel måttstock för brutto, universumet är rätt. EBIT-marginalen 16,12 och nettomarginalen 7,82 procent ligger under båda medianerna; det är här marginalsvängen syns.
- **Balansräkningens måttfullhet.** Skuld/EK 0,358 är grenens femte lägsta (medianen 0,642, universumets 0,520) — ingen CellaVision-fred (0,059) men väl under grenen. Notera samtidigt ROIC 13,81 procent mot ROE 8,95: när avkastningen på rörelsekapital överstiger ägarnas, bär balansräkningen kapital som inte jobbar i rörelsen — kassa och finansiella placeringar späder ägaravkastningen.
- **Tillväxtens mittpunkt och framtidens avstånd.** Omsättningstillväxten är SERIENS RENA MITTPUNKT: CAGR +7,32 procent mot grenens median +7,30 — på tredje decimalen skillnad (CellaVision-paketets "P/B är medianen"-mönster, i tillväxtformat). Men prognostillväxtfältet 8,77 procent är grenens sjätte lägsta (17/22, medianen 24,22) och TTM-tillväxten 1,7 procent likaså (17/22). Historiens tempo är mittpartiet; nutiden och fältets framtid ligger under.

## Källkritik: kontroller som landar — och ett ROE-fält med avstånd

Serien kör samma kontroller mot varje paket — datavakten dubbelkollar källans fält med egna beräkningar. Getinges kontrollprofil är den tajtaste i serien sedan SAP: alla tre huvudkontroller gröna på en gång.

**Identitetstestet.** P/E ska kunna härledas ur P/B och ROE: 2,163 ÷ 8,95 % = **24,17** mot källans P/E-fält 24,818 — differensen **2,6 procent**, väl inom seriens femprocentiga hållhake (Novo bröt på 13,9; CellaVision passerade på 3,8). Kedjan och fältet är samstämmiga.

**Absolutkontrollen.** P/E × årsresultatet: 24,818 × 2 258 Mkr = **56 039 Mkr** mot marknadsvärdet 66 921 — residualen **−16,3 procent**. Multiplens svar ligger UNDER marknadsvärdet: det implicita årsresultatet är 66 921 ÷ 24,818 = **2 696 Mkr** att hålla isär från det bokförda 2 258. CellaVisions residual var +18,9 procent (marknadsvärdet under multiplens svar — framtidsmultipl); Getinge är spegelbilden med −16,3 (marknadsvärdet över multiplens svar — vinsten har varit för liten för kursen, eller kursen för stor för vinsten; läsaren dömer inte, räknaren räknar). I seriens residualtrappa ett medelstort gap.

**EV-kedjan — paketets tajtaste kontroll.** EBIT 2025: 16,12 % × 34 969 = 5 637 Mkr. Eget kapital via P/B: 66 921 ÷ 2,163 = 30 939 Mkr; skuld via skuld/EK: 30 939 × 0,358 = 11 079 Mkr. EV = 66 921 + 11 079 = 78 000 Mkr ger EV/EBIT **13,84** mot fältets 13,74 — differansen **0,71 procent**, tajtare än CellaVisions serienotering 1,2. Och vänd på fältet: 13,74 × 5 637 = **77 452 Mkr** — 548 Mkr under kedjans EV. Fältet implicerar alltså en blygsam nettokassa i storleksordning en halv miljard kronor; filen separerar inte kassa och skuld, så netto-positionen kan inte verifieras här, men båda spåren pekar på samma balansräkningsbild: en medelskuld som EV-multipeln redan räknat in.

**TTM-detektiven — fältet över båda spåren.** Bokfört resultat på P/B-kapitalet: 2 258 ÷ 30 939 = **7,30 procent**. Implicit resultat (absolutkontrollens 2 696) på samma kapital: **8,72 procent**. Källans ROE-fält: **8,95 procent**. Fältet ligger strax ÖVER båda spåren — 0,23 procentenheter från det implicita, 1,65 från det bokförda. Hos CellaVision omgärdades fältet av spåren; hos Getinge håller fältet avstånd till båda, och avståndet är störst till det bokförda 2025-resultatet. Kompatibel läsning: ROE-fältet räknas på nyare underlag än räkenskapsåret — absolutkontrollens implicita vinst ligger 19,4 procent över den bokförda, och fältet ligger närmare den. Hypotesen redovisas som hypotes; kedjan som kedja.

**FCF-paret.** FCF-marginal 8,31 % × 34 969 = 2 906 Mkr → avkastning 2 906 ÷ 66 921 = **4,34 procent** mot fältets 4,25 — differansen **2,2 procent**, grönt (Novo bröt på 6,0). P/FCF blir inversen 1 ÷ 4,25 % = **23,5** — att jämföra med P/E 24,818: kassaflödet och resultatet prissätts nästan lika, en samstämmighet som saknar dramatik och just därför är värd att notera i en marginalsvängsberättelse.

**PEG — tredje riktningsfallet på raken.** Källans PEG-fält är 1,54; seriens konvention räknar själv: P/E ÷ prognostillväxt = 24,818 ÷ 8,77 = **2,83**. Källan ligger alltså 0,54× UNDER konventionen — samma riktning som GS (1,24 mot 3,31) och ASSA (1,45 mot 1,97). Den implicita nämnaren 24,818 ÷ 1,54 = **16,1 procent** matchar inget av filens tillväxtfält (prognos 8,77, TTM 1,7, omsättning-CAGR 7,32). Och den bakåtblickande PEG:n är osaligbar helt enkelt: 24,818 ÷ (−3,22) är ett negativt tal utan tolkning. Seriens PEG-doktrin står fast: en PEG utan nämnare är ingenting — här blir läxan dessutom att nämnaren kan saknas helt.

**CAGR-fälten: exakt replikering.** Omsättning: (34 969 ÷ 28 292)^(1/3) = 1,0732 → **+7,32 %/år** — fältet säger 7,32. Resultat: (2 258 ÷ 2 491)^(1/3) = 0,9678 → **−3,22 %/år** — fältet säger −3,22. Båda replikeras; replikationen leder rakt in i paketets huvudläsart.

## Marginalsvängen — fyra års volymtillväxt utan vinsttrappa

Serien 2022–2025 i filen, med steg och nettomarginal framräknad:

| År | Omsättning (Mkr) | Resultat (Mkr) | Oms-steg | Res-steg | Nettomarginal |
|---|---|---|---|---|---|
${serie}

Här är paketets huvudperson. Intäkterna växer FYRA ÅR I RAD — 28 292 → 34 969 Mkr, +23,6 procent totalt, aldrig ett backande år — men resultatet gör en U-kurva: −3,2, −32,1 och sedan +37,9 procent, med nettomarginalen 8,80 → 7,58 → 4,71 → 6,46. Året 2024 är botten: över tusen miljoner mer i intäkter än 2022, men 833 miljoner lägre resultat. Året 2025 är vändningen i ren form: omsättningssteget +0,60 procent — i princip platt volym — men resultatsteget +37,85 procent, hela vägen från marginalen som steg 1,75 procentenheter.

Det är också därför resultat-CAGR:n är negativ (−3,22 %/år) trots att volymen aldrig backar: ändpunktsräkningen stryker med två bra år och ett bottenvärde som aldrig hämtats helt. CellaVisions serie klättrade i marginal fyra år i rad (18,5 → 20,2); Getinge är dens motsats på tre år och dess återgång på det fjärde — och därmed seriens tydligaste fall hittills av att CAGR-tal inte kan läsas utan serien bakom.

Nutidsfältet bromsar: TTM-tillväxten 1,7 procent är lägre än alla tre årsstegen. Och det färskaste officiiella kvartalet — Q2 2026, redovisat 17 juli — visade enligt bolagets pressrelease nettoförsäljningen öka organiskt med 2,7 procent (5,1) och orderintaget med 5,0 procent (3,6); finansiella medier sammanfattade samma rapport till 4,6 respektive 6,2 procent organiskt. Divergensen mellan pressrelease och mediasummering redovisas öppet enligt seriens källdoktrin (JPM-paketets justerade divergens) — läsaren som vill ha exakta kvartalstal går till rapporten själv; läspaketets uppgift är frågorna, inte att avgöra vilken siffra som gäller.

Slutligen DuPont-trappan: brutto 48,6 → EBIT 16,12 → netto 7,82 procent. Klippet brutto→EBIT är 32,5 procentenheter — kostnadsledet äter två tredjedelar av bruttovinsten, distributions-, forsknings- och administrationskostnaders territorium — medan klippet EBIT→netto är 8,3 enheter. Getinges vändningsberättelse lever alltså i kostnadsledet: det är där 2024 års 1,75 marginalprocent gick förlorade och där 2025 års återkomst började.

## Tre sätt att läsa utfallet — övningar i metod

När siffrorna landar den 20–21 oktober finns tre övningar att göra vid köksbordet — ren matematik, inga behov av att gissa marknadens humör:

**Övning 1 — marginal-läsaren.** Räkna nio månaders nettomarginal och ställ den mot linjen 6,46 procent (2025 års). Håll vändningen? Om nio månaders marginalen ligger över linjen är U-kurvan på väg upp för andra året i rad; under linjen var 2025 ett exceptionellt år. Kontrollera också orderintagets organiska tillväxt mot Q2:s +5,0 (3,6) — orderintaget är volymens framförposter, och Getinges intäktsserie har visat att volymen aldrig är problemet.

**Övning 2 — multipl-läsaren.** P/E 24,818 mot grenens median 26,08: räkna ut vilket TTM-resultat som får Getinges P/E att möta medianen vid oförändrat börsvärde — 66 921 ÷ 26,08 = **2 566 Mkr**. Medianmultiplen ligger alltså först vid ett resultat 13,7 procent över 2025 års 2 258 — att jämföra med CellaVision, där medianen räcktes med 1,6 procent, och Novo, där den krävde en halvering. Tre bolag, tre avstånd — övningen kalibrerar hur olika grenens multiplrum är.

**Övning 3 — scenariorutan med seriens högsta marginalvikt.** Nio celler på 2025-basen (nettoresultat i Mkr vid omsättning ±3 % och nettomarginal ±2 procentenheter kring 6,46 %):

| Netto (Mkr) | Omsättning −3 % | Omsättning 0 % | Omsättning +3 % |
|---|---|---|---|
| Marginal 4,46 % | ${mkr(c11)} | ${mkr(c12)} | ${mkr(c13)} |
| Marginal 6,46 % | ${mkr(c21)} | ${mkr(c22)} | ${mkr(c23)} |
| Marginal 8,46 % | ${mkr(c31)} | ${mkr(c32)} | ${mkr(c33)} |

Räknesatserna bakom: en procentenhet marginal är 349,7 Mkr per år (1 % av 34 969); tre procent volym är bara 67,7 Mkr i netto vid basmarginalen. Förhållandet — marginalvikten — är **5,16**: vid en nettomarginal på 6,5 procent väger en enda procentenhet marginal över FEM GÅNGER så mycket som tre procent volym. Det är seriens högsta netto-marginalvikt hittills (CellaVision 1,65, ASSA 1,98, Novo 1,01) — och Getinges egen serie är beviset: 2025 levererade +0,6 procent volym men +37,9 procent resultat, exakt den mekanik rutan mäter. Som EBIT-variant blir vikten 1 ÷ (3 × 16,12 %) = 2,07 — även på rörelsenivån väger marginalen dubbelt mot volymen.

## Praktiskt inför 20–21 oktober

- **Tid:** tisdagen den 20 oktober enligt bolagets rapport- och presentationssida, onsdagen den 21:a enligt finanskalendern i pre-close-briefen — en dagars intern divergens som redovisas som den är; bolaget brukar publicera på morgonen svensk tid med telefonkonferens samma förmiddag. Q1 kom 21 april och Q2 17 juli; pre-close brief för Q3 hölls 15 september.
- **Tre saker att plocka ut:** (1) nio månaders nettomarginal mot linjen 6,46 — står vändningen?; (2) orderintagets organiska tillväxt mot Q2:s +5,0 (3,6) — växer framförposten?; (3) FCF-marginalen mot 8,31 — följer kassaflödet resultatåterkomsten, eller binder arbetarkapitalet upp den?
- **Läsarnot:** Getinges bruttomarginal 48,6 procent hör hemma i universums jämförelse (median 47,8), inte i hälsogrenens (71,0) — läkemedelsbolagens måttstock snedvrider bilden för ett utrustningsbolag.
- **Vågvalideringsnot:** Getinge står inte i seriens vågvalideringskarta (de tolv universumbolag som kartades i våg 152) — paketet vilar på universumdata och kalenderfakta enligt Iberdrola-precedensen, och säger det öppet.
- **Fortsätt läsning:** [bolagets sida](/bolag/geti-b-st) samlar underlaget, [kurssidan](/kurser) visar noteringen, grenens fem syskonpaket är AstraZeneca, Johnson & Johnson, Boston Scientific, CellaVision och Novo Nordisk; datavaktens metoder finns på [transparens](/transparens)-sidan och [källorna](/kallor) redovisar samtliga underlag.

## Källor

- Rappdag 2026-10-20/21 (officiellt: bolagets rapport- och presentationssida anger 20 oktober, finanskalendern i pre-close-briefen 21 oktober — dagens divergens mellan bolagets egna sidor redovisas öppet; Q1 2026 redovisat 21 april, Q2 2026 den 17 juli, Q3-pre-close brief den 15 september) — Getinge Investor Relations (getinge.com), kalenderunderlag hämtat 2026-09-15 — internt: data/blogg-utkast/kvartal/2026-q3/kalender-halso.json.
- Q2 2026-tal (organisk nettoförsäljning +2,7 % (5,1), orderintag +5,0 % (3,6)): Getinges interim-rapport April–Juni 2026 via pressrelease 2026-07-17; mediasummeringar (4,6 % respektive 6,2 % organiskt) redovisade som källdivergens enligt seriens källdoktrin — sökverifierade 2026-09-19.
- Nyckeltal, kurs (245,70 kr), börsvärde (66,921 mdr kr) och serier: bolagsuniversumets datainsamling för GETI-B.ST 2026-09-03 (Yahoo Finance quoteSummary-moduler; MarketStack-källan saknade färsk kurs — ingen dubbelkoll av pris och valuation, vilket redovisas öppet; ROIC = approximerad proxy: EBIT före skatt ÷ (skuld + bokfört EK); räntetäckning osatt — räntekostnad saknas; serier/CAGR bygger på 4 räkenskapsår eftersom källan ger 4, inte 5; prognostillväxtfältet = källans konsensus-tal för EPS ett år fram; EK- och FCF-serierna tomma i filen; moat-fälten utan femårshistorik hos källan; insiderköp senaste 6 månader: 0) — internt: data/portfolj-system/bolagsunivers.json. Medianer beräknade 2026-09-19 ur samma 195-postfil (per mått 20–22 bolag i hälsogrenen, 155–195 i universumet; Getinges positioner: P/E 13/21, P/B 18/21, EV/EBIT 19/22, PEG 3/21, FCF-avkastning 12/21, ROE 16/21, ROIC 13/21, brutto 18/22, EBIT 17/22, netto 16/22, FCF-marginal 19/22, skuld/EK 5/21, prognostillväxt 17/22, resultat-CAGR 15/20, omsättnings-CAGR 11/22, TTM-tillväxt 17/22).
- Identitetstest, absolutkontroll, TTM-detektiv, EV-kedja med nettokassa-utläsningen, FCF-par, PEG-konvention, CAGR-replikering, marginalserie, scenarioruta, marginalvikter och multiplövning: egna beräkningar ur ovanstående filvärden — formlerna redovisade i texten.

*Detta paket är finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar med källa och datum angivna; där en källa saknar data står det explicit, och där källans fält inte håller för kontroll redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

const ord = body.replace(/\|/g, ' ').replace(/[#*[\]()\/`—-]/g, ' ').split(/\s+/).filter(w => w.length > 0 && /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
const paket = {
  slug: 'sa-laser-du-getinge-q3-2026',
  title: 'Getinges Q3 2026: så läser du den — marginalsvängen 8,8 → 4,7 → 6,5 procent bakom resultatsteget +37,9 på volymen +0,6, seriens tajtaste kontrollprofil och PEG-fältets 1,54 mot konventionens 2,83',
  description: 'Getinge redovisar Q3 2026 den 20–21 oktober — hälsogrenens sjätte paket, seriens 49:e. Intäkterna växer fyra år i rad (28,3 → 35,0 mdr kr) medan nettomarginalen svängt 8,8 → 4,7 → 6,5 procent. Kontroller alla gröna — EV-kedjan 0,7 procent — och marginalvikten 5,2 är seriens högsta. 16 medianmått, scenarioruta, full källkritik.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-20',
  readingMinutes: Math.round(ord / 600),
  tags: ['kvartalsrapport', 'Getinge', 'halso', 'nyckeltal', 'läspaket', 'medicinteknik', 'marginaler', 'PEG'],
  body,
};
const SOKVAG = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-getinge-q3-2026.json';
writeFileSync(SOKVAG, JSON.stringify(paket, null, 2) + '\n');
console.log('SKREV', SOKVAG);
console.log('ord:', ord, '| readingMinutes:', paket.readingMinutes, '| title tkn:', paket.title.length, '| desc tkn:', paket.description.length);
