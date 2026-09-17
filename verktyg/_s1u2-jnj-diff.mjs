#!/usr/bin/env node
// s1-u2: bygger granskning/sa-laser-du-jnj-q3-2026-diff.json programmatiskt ur
// utkastfilen (exakta strängar inkl. U+00A0) + sista korskontroller. Skriver EN fil.
import { readFileSync, writeFileSync } from 'node:fs';

const UT = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-jnj-q3-2026.json';
const u = JSON.parse(readFileSync(UT, 'utf8'));
const b = u.body;
const NB = '\u00A0';
const poster = [];
const kors = [];

// --- sista korskontroller ---
const V = JSON.parse(readFileSync('/tmp/universum-jnj-vintage.json', 'utf8'));
for (const t of ['GS', 'JPM', 'ABT', 'ABBV']) {
  const r = V.find(x => x.ticker === t);
  kors.push(`${t}: ${r ? `FINNS (bransch ${r.bransch}, serier-resultat ${JSON.stringify(r.serier?.resultat)})` : 'finns ej i universumet'}`);
}
const halsoUSA = V.filter(x => x.bransch === 'halso' && x.land === 'USA').map(x => `${x.ticker} ${x.marknadsKapitalMdr}`);
kors.push('hälsa-USA: ' + halsoUSA.join(', '));
const kalF = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-finans.json', 'utf8'));
const seb = kalF.bolag.find(x => (x.ticker || '').includes('SEB'));
kors.push('SEB-kalender: ' + JSON.stringify(seb?.rapportfenster) + ' | notera: ' + JSON.stringify(seb?.notera || '').slice(0, 200));
const holm = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-holm-q3-2026.json', 'utf8'));
kors.push('holm +10,3: ' + (holm.body.includes('10,3') ? 'FINNS i holm-paketet' : 'saknas') + ' | jfr: ' + (holm.body.match(/\+10,30?[^0-9]/g) || ['nej']).join(','));

// --- diffposter (gammalt byggs med \u00A0 där tusentalsavgränsning finns) ---
const P = (id, typ, falt, gammalt, nytt, orsak) => poster.push({ id, typ, fil: 'sa-laser-du-jnj-q3-2026.json', falt, gammalt, nytt, orsak });

P('A1a', 'byt', 'body — Absolutkontrollen (produkt + residual)',
  `31,453 × 26${NB}804${NB}000${NB}000 MUSD = **843066212,0 mdr USD** mot marknadsvärdet 663,228 mdr — residualen **+127115494,0 procent**`,
  '31,453 × 26,804 mdr USD = **843,1 mdr USD** mot marknadsvärdet 663,228 mdr — residualen **+27,1 procent**',
  'Universumfilen lagrar serien i USD (26 804 000 000 = 26,804 mdr). Utkastet har multiplicerat P/E med råtalet och satt mdr-etikett på produkten: 31,453 × 26,804 mdr = 843,1 mdr USD (sond: 843,066). Residualen (843,1 − 663,2)/663,2 = +27,1 % — exakt det tal utkastets EGNA description redovisar ("absolutkontrollen som gapar +27,1 procent"); bodyns +127 115 494,0 procent är samma kvot räknad på de förstorade talen. Slutsatsen (positivt gap ≈ 21 % lägre implicit årsunderlag) opåverkad — presentationen rättas');

P('A1b', 'byt', 'body — TTM-detektiven (ROE på bokfört resultat)',
  'Resultat-ROE på årsresultatet: 26804000,0 ÷ 85,0 = 31523277,06 %',
  'Resultat-ROE på årsresultatet: 26,804 ÷ 85,0 = 31,5 %',
  'Sond: 26,804 mdr ÷ 85,0 mdr = 31,52 % (ORSAK: råtal i tusen istället för mdr). Kontrasten i meningen blir dessutom pedagogiskt RÄTT med riktiga tal: 31,5 % (bokfört år) mot 24,80 % (implicit TTM) mot källans ROE-fält 25,74 % — TTM-spåret ligger närmast fältet, vilket är meningens poäng');

P('A1c', 'byt', 'body — TTM-detektiven (sista meningen)',
  'på ett rullande tolvmånadersresultat kring 21,1 mdr USD — lägre än 2025 års bokförda 26804000,0.',
  'på ett rullande tolvmånadersresultat kring 21,1 mdr USD — lägre än 2025 års bokförda 26,804 mdr USD.',
  'Samma råtalsklass: 26804000,0 (tusen USD) → 26,804 mdr USD — konsekvent med resten av kedjan');

P('A1d', 'byt', 'body — EV-kedjan (bas + båda kvoter)',
  `EBIT 2025: 29,19 % × 94${NB}193${NB}000${NB}000 = 27494936,7 mdr USD. Skuld via P/B-kedjan: 85,0 × 0,58 = 49,1 mdr; EV med skuld = 712,3 mdr ger EV/EBIT **0,00** (+-100,0 procent mot fältet) — men utan skuld: 663,228 ÷ 27494936,7 = **0,00**, alltså 100,0 procent från fältets 24,191.`,
  'EBIT 2025: 0,2919 × 94,193 mdr USD = 27,5 mdr USD. Skuld via P/B-kedjan: 85,0 × 0,5771 = 49,1 mdr; EV med skuld = 712,3 mdr ger EV/EBIT 25,9 (+7,1 procent mot fältet) — men utan skuld: 663,228 ÷ 27,5 = **24,12**, alltså 0,3 procent från fältets 24,191.',
  'Sond med exakta fält: EBIT = 0,2919 × 94,193 = 27,495 mdr. Med skuld: 712,3/27,5 = 25,91. Utan skuld: 663,228/27,495 = 24,12 — 0,3 % från fältets 24,191 (detta är kedjans finess: fältet stänger UTAN skuld). Textens "0,00" och "+-100,0 procent" är artefakter av att dividera med det förstorade råtalet; som det står är båda kvoterna nonsens och slutsatsen "stänger fint på fel antagande" saknar synbart belägg. Notera även: skulden är räknad på det exakta fältet 0,5771 (textens "0,58" är tabellavrundningen — med 0,58 blir skulden 49,3); "85,0 × 0,58 = 49,1" är inledningsvis en aritmetisk självmotsägelse som rättas av att visa det exakta fältet');

P('A1e', 'byt', 'body — FCF-paret',
  `FCF-marginal 17,24 % × 94${NB}193${NB}000${NB}000 = 16238873,2 mdr USD → avkastning 2448460,14 % mot fältets 2,55 % — differensen 96017944,6 procent.`,
  'FCF-marginal 17,24 % × 94,193 mdr USD = 16,24 mdr → avkastning 2,45 % mot fältets 2,55 % — differensen 4,0 procent.',
  'Sond: FCF = 16,239 mdr; avkastning 16,239/663,228 = 2,45 %; differens mot fältets 2,55 % = 4,0 % — INOM hållhaken, vilket är meningen ("Paret håller inom seriens femprocentiga hållhake"). Som texten står är den meningen direkt självmotsägande (2 448 460 % är inte inom 5 %)');

P('A1f', 'byt', 'body — scenariorutans räknesatser',
  `Räknesatserna bakom: en procentenhet marginal är 941${NB}930${NB}000 MUSD per år (1 % av 94${NB}193${NB}000${NB}000); tre procents volym är 824${NB}848 MUSD i EBIT vid basmarginalen.`,
  'Räknesatserna bakom: en procentenhet marginal är 0,94 mdr USD per år (1 % av 94,193 mdr); tre procents volym är 0,82 mdr USD i EBIT vid basmarginalen.',
  '1 % av 94,193 mdr = 0,9419 mdr (textens "941 930 000 MUSD" blandar råtal och MUSD); 3 % volym × basmarginal = 0,825 mdr');

P('A1g', 'byt', 'body — scenariorutans 9 celler + tabellrubrik (mdr USD)',
  `| EBIT (mdr USD) | Omsättning −3 % | Omsättning 0 % | Omsättning +3 % |\n|---|---|---|---|\n| Marginal 27,19 % | 24842744,4 | 25611076,7 | 26379409,0 |\n| Marginal 29,19 % | 26670088,6 | 27494936,7 | 28319784,8 |\n| Marginal 31,19 % | 28497432,8 | 29378796,7 | 30260160,6 |`,
  `| EBIT (mdr USD) | Omsättning −3 % | Omsättning 0 % | Omsättning +3 % |\n|---|---|---|---|\n| Marginal 27,19 % | 24,8 | 25,6 | 26,4 |\n| Marginal 29,19 % | 26,7 | 27,5 | 28,3 |\n| Marginal 31,19 % | 28,5 | 29,4 | 30,3 |`,
  'Alla 9 celler är beräknade i tusen USD (24 842 744,4 = 24,84 mdr) trots rubrikens "mdr USD" — sonden verifierat 9/9 celler exakta som tusental; samma tal i mdr med en decimal. (Strängen verifieras i två steg: mittcellen 27494936,7 förekommer även i EV-kedjan men med annan omgivning — denna post kräver tabellradernas exakta följd och verkställs HELT eller inte alls)');

P('A1h', 'byt', 'body — Övning 1 (referensnivån)',
  `stämmer blocket med 26${NB}804${NB}000${NB}000-nivån`,
  'stämmer blocket med 26,8 mdr-nivån',
  'Råtalet 26 804 000 000 (USD) → 26,8 mdr USD, konsistent med textens övliga nivåangivelser (21,1 mdr osv.)');

P('A1i', 'byt', 'body — CAGR-serietabellens rubrik + 8 cellsiffror',
  `| År | Omsättning (MUSD) | Resultat (MUSD) | Oms-steg | Res-steg | Nettomarginal |\n|---|---|---|---|---|---|\n| 2022 | 94${NB}943${NB}000${NB}000 | 17${NB}941${NB}000${NB}000 | — | — | 18,90 % |\n| 2023 | 85${NB}159${NB}000${NB}000 | 35${NB}153${NB}000${NB}000 | -10,3 % | **+95,94 %** | 41,28 % |\n| 2024 | 88${NB}821${NB}000${NB}000 | 14${NB}066${NB}000${NB}000 | +4,3 % | **-59,99 %** | 15,84 % |\n| 2025 | 94${NB}193${NB}000${NB}000 | 26${NB}804${NB}000${NB}000 | +6,0 % | **+90,56 %** | 28,46 % |`,
  `| År | Omsättning (mdr USD) | Resultat (mdr USD) | Oms-steg | Res-steg | Nettomarginal |\n|---|---|---|---|---|---|\n| 2022 | 94,943 | 17,941 | — | — | 18,90 % |\n| 2023 | 85,159 | 35,153 | -10,3 % | **+95,94 %** | 41,28 % |\n| 2024 | 88,821 | 14,066 | +4,3 % | **-59,99 %** | 15,84 % |\n| 2025 | 94,193 | 26,804 | +6,0 % | **+90,56 %** | 28,46 % |`,
  'Filens serier är i USD (94 943 000 000 USD = 94,943 mdr) — kolumnrubriken "MUSD" är därför fel med faktor 1 000. Samtliga 8 serievärden SONDVERIFIERADE exakta mot filen; steg/procentkolumner korrekta och oförändrade. (Endast rubrik + de två beloppskolumnerna rättas)');

P('A2', 'byt', 'body — Tre saker att plocka ut (marginalbanan)',
  '2025 års 28,46 % kontra TTM-spårets runt 0,0 %',
  '2025 års 28,46 % kontra TTM-spårets runt 22,4 %',
  'Sond: implicit TTM-resultat 21,086 mdr ÷ omsättning 94,193 mdr = 22,4 % nettomarginal. "Runt 0,0 %" är omöjligt — inget tal i paketet stödjer det (troligen en ersatt platshållare). Övningens kontrast (28,46 mot 22,4) blir dessutom meningsfull');

P('B1', 'byt', 'body — Övning 2 (multipl-läsarens räkneväg)',
  '24,82 × 663,228 mdr ÷ 31,45 ≈ 523,3 mdr USD i TTM-resultat, alltså 2382 procent över det implicita underlaget',
  '663,228 mdr ÷ 24,82 ≈ 26,7 mdr USD i TTM-resultat, alltså 27 procent över det implicita underlaget',
  'Frågan är "vilket årsresultat ger P/E = medianens 24,82 vid oförändrat marknadsvärde" — svaret är MV ÷ P/E_median = 663,228 ÷ 24,82 = 26,7 mdr (26,7 % över det implicita 21,1). Utkastets uttryck (median-P/E × MV ÷ JNJ-P/E = 523,3) har ingen ekonomisk tolkning; talet 523,3 mdr skulle vara världens största årsresultat och "2382 procent" följer av feluttrycket');

P('B2', 'byt', 'body — scenariorutans slutsats (ordningen)',
  'Notera ordningen: volym slår marginal — tre procent försäljning flyttar EBIT mindre än två procentenheter marginal.',
  'Notera ordningen: marginalen slår volymen — tre procent försäljning flyttar EBIT mindre än två procentenheter marginal.',
  'Självmotsägelse: "volym slår marginal" followed by "flyttar EBIT MINDRE". Sond: 2 pp marginal = 1,88 mdr; 3 % volym = 0,82 mdr — MARGINALEN rör EBIT mest. Textens egna marginalvikt 1,14 (1 %-punkt marginal ≈ 3 % volym) bekräftar riktningen');

P('B3a', 'byt', 'body — Så står sig bolaget (plats bland USA-noterade)',
  'JNJ ligger på fjärde plats i filen på marknadsvärde bland de USA-noterade, efter Eli Lilly (1 034 mdr USD) och före Abbott',
  'JNJ ligger på andra plats i filen på marknadsvärde bland de USA-noterade, efter Eli Lilly (1 034 mdr USD) och före AbbVie',
  'Universumet (vintage = dagens träd): USA-noterade i hälsa = LLY 1 034,5 > JNJ 663,2 > ABBV 462,9 > PFE 157,0 > BSX 70,1 mdr. JNJ är NäST STÖRST (2:a), inte 4:a. Abbott (ABT) finns INTE i universumet — bolaget som står före i filen är AbbVie. Textens senare styckes "näst störst efter Eli Lilly" (B3b) är det RÄTTA påståendet — meningen rättas till konsistens med den');

P('B3b', 'byt', 'body — USA-klassen i grenen (Abbott)',
  'bland de USA-noterade i filen är JNJ näst störst efter Eli Lilly (1 034 mdr USD) och före Abbott',
  'bland de USA-noterade i filen är JNJ näst störst efter Eli Lilly (1 034 mdr USD) och före AbbVie',
  'Abbott finns inte bland filens hälsobolag (USA-grenen: LLY, JNJ, ABBV, PFE, BSX — sond) — bolaget efter JNJ är AbbVie (462,9 mdr)');

P('B4', 'byt', 'body — sammanfattningen (stavfel)',
  'om tillväxten rightfärdigar prislappen',
  'om tillväxten rättfärdigar prislappen',
  'Anglicism: "rightfärdigar" → "rättfärdigar"');

P('B5', 'byt', 'body — absolutkontrollen (citattecken)',
  'betyder inte att kursen " borde" vara högre',
  'betyder inte att kursen "borde" vara högre',
  'Citationstecknet har fångat ett inledande mellanslag (" borde") — strängen finns exakt så i filen; negerad formulering (juridiken ren), endast teckensättningen rättas');

P('B6', 'byt', 'body — scenariorutans slutsats (grammatik)',
  'de kan flytta årsresultatet mer än en recessionsår',
  'de kan flytta årsresultatet mer än ett recessionsår',
  '"recessionsår" är neutrum: ett år — "en recessionsår" är fel artikel');

P('C1', 'forslag', 'body — medianmetoden + EBIT-meningen (metodval att deklarera)',
  'EBIT-marginalen 29,19 % landar på 0,3-procentaren, alltså precis på medianen (åtta av sexton, 29,19 mot 29,19)',
  'EBIT-marginalen 29,19 % är grenens åttonde värde av sexton mätta — med seriens mediandefinition (övre mittersta) ÄR det JNJ:s eget värde som står som median (åtta av sexton, 29,19 mot 29,19)',
  'METODFYND (sonden): samtliga 45 medianceller i tabellen följer ÖVRE-mittersta-metoden vid jämnt antal mätta; projektets kanon (src/lib/dataset-nyckeltal.ts + peer.ts) använder MEDEL av mittersta. 6 hälsomedianer + 5 universummedianer skiljer mellan metoderna (t.ex. netto: 17,0 upper mot 13,4 kanon; EBIT: 29,19 mot 27,7). AKUT KONSEKvens: de länkade datasetsidorna visar KANON-talen live — /dataset/halso/netto-marginal visar i dag "Median 13,4 %" medan paketet skriver 17,02 — kunden som klickar ser två olika tal. Två vägar: (a) deklarera metoden i tabellens inledande mening ("beräknade ur samma fil; median = övre mittersta vid jämnt antal mätta") och behåll talen, eller (b) byt till kanontal (7+5 celler) för samsyn med datasetsidorna. FÖRSLAG (a) som minsta ingrepp + omformulering av "0,3-procentaren" som ingen metod ger stöd för. Ingen tabellcell i sig är FEL — metodvalet är odeklarerat och skiljer från länkade ytor');

P('C2', 'forslag', 'body — antalet paket i huvudfönstret',
  'en vecka före det svenska huvudfönstret 20–23 oktober som redan har 18 paket',
  'en vecka före det svenska huvudfönstret 20–23 oktober som redan har 19 paket',
  'Sammanställningen räknar 19 paket med rappdag 20–23/10 (inkl. AT&T, som byggdes parallellt med JNJ-paketet 16:4x — byggarens vy kan legitimt ha varit 18). Dagens träd = 19; rättning valfri men rekommenderad för tidlös text');

P('C3', 'forslag', 'publishedAt (seriepraxis)',
  '2026-10-13',
  '2026-10-12',
  'R2-NOTIS: publiceringstidpunkten är kundens beslut. Seriepraxis bland syskonen är DAGEN FÖRE rappdag (nike 09-30/10-01, hm-b 09-23/09-24, holmen 10-21/10-22); JNJ:s fält = rappdagen 10-13. Vissa syskon avviker också (ericsson/nordea/wallenstam 10-13 mot rappdag 10-15) — ingen tvingande norm, notis vid flytt');

P('C4', 'forslag', 'body — Praktiskt inför (formulering)',
  'om FCF-marginalen 17,24 % bekräftas — det är fältet som hållhaken lit på',
  'om FCF-marginalen 17,24 % bekräftas — det är fältet hållhaken vilar på',
  '"som hållhaken lit på" är grammatiskt bruten (förslagsvis "vilar på" eller "gäller"); låg prioritet');

P('C5', 'forslag', 'body — nyckeltalstabellens EBIT-länk',
  '[EBIT-marginal](/dataset/halso/netto-marginal)',
  'EBIT-marginal',
  'Länken leder till NETTOMARGINAL-sidan (sidtitel "Nettomarginal inom Hälsa") — ett annat mått än länktexten. Ingen EBIT-marginal-aspekt finns i registret (sond: 0 träff i dataset-aspekter-källan; även FCF-marginal-raden länkar fcf-avkastning-sidan). Alternativ: ta bort länken (förslag ovan) eller behåll medvetet som närmaste-släkting-konvention — paketägarens val; syskonen länkar inte EBIT-marginal alls');
// --- verifiering: varje gammalt exakt 1 träff, nytt ej redan närvarande ---
const problem = [];
for (const p of poster) {
  const n = b.split(p.gammalt).length - 1;
  const finnsNytt = b.includes(p.nytt);
  if (n !== 1) problem.push(`${p.id}: gammalt träffar ${n} gånger`);
  if (finnsNytt && p.typ === 'byt') problem.push(`${p.id}: nytt finns redan i bodyn`);
  p.unik = n === 1 && !(finnsNytt && p.typ === 'byt');
}

const diff = {
  granskat: 'data/blogg-utkast/kvartal/2026-q3/sa-laser-du-jnj-q3-2026.json',
  granskadAv: 'agentfabrik s1-u2 (2026-09-17, omgång auto-s1-1789673729457)',
  rapport: 'sa-laser-du-jnj-q3-2026-KONTROLL-2026-09-17.md',
  bedomning: 'FLYTTKLAR EFTER RÄTTNING — se rapporten: källor/siffror/juridik/länkar genomgående gröna; 9 byt-poster (A1a–i) samlar det systematiska enhetsfelet (filens USD-råtal märkta MUSD/mdr med tusenfel i derivat), plus A2, B1–B6 konkreta felaktigheter; C1 metoddeklaration (median: övre mittersta vs kanon + datasetsidornas live-tal 13,4 % mot paketets 17,0), C2–C4 förslag',
  anvandning: 'Verkställ BYT-posterna exakt (sök/ersätt — samtliga stränger maskinellt verifierade unika i filen, U+00A0 bevarad i gamla stränger; A1g och A1i är block-poster: verkställ HELA blocket eller inget). C-poster = ägarens/stilens beslut; C3 är R2 (publiceringstid = kundens klick). Originalet ändras av paketets ägare eller nästa våg — inte av granskaren. Publicering förblir kundens beslut (R2).',
  korskontroller: kors,
  poster,
};
writeFileSync('/home/ak1a/AK1/data/blogg-utkast/granskning/sa-laser-du-jnj-q3-2026-diff.json', JSON.stringify(diff, null, 2) + '\n');
console.log('diff.json skriven:', poster.length, 'poster;', problem.length ? 'PROBLEM: ' + problem.join('; ') : 'ALLA stränger unika + nya värden frånvarande ✓');
console.log(kors.join('\n'));
