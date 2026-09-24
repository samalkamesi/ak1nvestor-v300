// _s4u1-dios-bokfor.mjs — engångsbokföring: klaimfilens LEVERERAT-sektion,
// worklog-append och städning av engångsfixar.
import { readFileSync, writeFileSync, appendFileSync, unlinkSync, existsSync } from 'node:fs';

const kp = '/home/ak1a/AK1/data/vakten/auto-s4-1789931110711-s4-u1-ansprak.md';
let k = readFileSync(kp, 'utf8');
if (!k.includes('LEVERERAT')) {
  k += `
## LEVERERAT (2026-09-20)

LEVERERAT: data/blogg-utkast/kvartal/2026-q3/sa-laser-du-dios-q3-2026.json (2 870 ord, rm 5)
+ KO-rader i båda tabellerna i GRANSKNINGSKO-SAMMANSTALLNING.md + beräkningsmotor
verktyg/_s4u1-dios-byggdata.mjs (fryst talbank _s4u1-dios-tal.json) + KO-infogare
verktyg/_s4u1-dios-ko.mjs + KVD verktyg/_s4u1-dios-kvd.mjs GRÖN 124 PASS 0 FEL 0 VARNING.
Syskonläge vid leverans: u3 LVMH MC_PA (klaim 21:09) + u2 Wihlborgs WIHL.ST (klaim ~21:20)
— tre skilda objekt, noll kollision, deras ytor orörda. KVD-processen kurerade TVÅ egna
skriptbuggar FÖRE grönt (d.vardering-fältvägarna i sektion 3 gav NaN; komma-mot-punkt i
en toFixed-jämförelse) och FEM paketgap rättades FÖRE grönt (resultat-CAGR −0,89 saknades
i texten · svängtalet −202 % saknades · marginaldiffen 1,0→0,95 pp exakt · kurs/EPRA-kvoten
64,8 % saknades · rådgloskontrollens disclaimer-stripp). INGET bygge, src orörd,
data/blogg/ orörd. Publicering = kundens beslut (R2).
`;
  writeFileSync(kp, k);
  console.log('klaimfil uppdaterad med LEVERERAT');
}

const wp = '/home/ak1a/AK1/worklog.md';
const wl = readFileSync(wp, 'utf8');
if (!wl.includes('DIÖS Q3-LÄSPAKET')) {
  const rad = `### SPÅR 4 s4-u1 (manifest auto-s4-1789931110711, byggare 1/3) — 2026-09-20: DIÖS Q3-LÄSPAKET — fastighetsgrenens tionde, seriens första norrlandsbolag: billigast i grenen på EV/EBIT med dubbel substansrabatt och resultatraden som svänger 1,7 miljarder mellan åren [fabrik]

Fabriksagent s4-u1 (byggare 1/3). VAL MED KLAIM FÖRE BYGGSTART (data/vakten/auto-s4-1789931110711-s4-u1-ansprak.md, disk-först 21:12): worklogens Catena-könot satte villkoret "Diös 23/10 när egen kalenderverifiering gjorts (P&G-raden)" — verifieringen GJORD (sökverifierad 2026-09-20): MFN:s bolagskalender 2026-10-23 kl 13:00 (Fabege-precedensens källklass) + Nordnet 23/10 + bolagets egen finanskalender i Q1-2026-rapporten "oktober 2026" med rytm infriad (Q1 29/4 07:00, Q2 6/7 13:00, bokslut 2027-02-12) — gallran upplöst, Diös = tidigaste återstående rappdagen med bärande universumdata och verifierat datum. Syskon: u2 Wihlborgs 21/10 + u3 LVMH oktoberfönstret = tre skilda objekt, noll kollision. LEVERANS: data/blogg-utkast/kvartal/2026-q3/sa-laser-du-dios-q3-2026.json (2 870 ord/rm 5; seriens ~68:e). Tre signaturnummer: (1) BILLIGHETSTRIPPELN MED BAKSIDA — EV/EBIT 14,236 grenens LÄGSTA (rang 1 av 17 mot medianen 24,89, −43 %) · P/E 8,194 näst lägst (median 14,38) · P/B 0,743 med DUBBEL substansrabatt 25,7 % mot bokfört golv 87,31 och 35,2 % mot EPRA NTA 100,20 (kurs 64,8 % av EPRA) — samtidigt belåning 1,4674 över medianen 1,10 (rang 12/17) och TTM 0,2 % i botten (14/17): billigheten och balansen är samma mynt. (2) RESULTATRADETS TÄRNING — +830 → −850 → +691 → +808 Mkr 2022–2025 (svängen −1 680 Mkr = minus 202 % av 2022 års resultat medan hyrorna +13,4 % samma år; EBIT-marginalen 69,72 % ÖVER brutto 68,77 % med 0,95 pp = värderader i rörelsen; femårsparadoxen omsättning +6,42 %/år mot resultat −0,89 %/år). (3) IDENTITETSTESTET MED HÄRLEDD ROE — ROE null hos källan, härledning epsT 7,92 ÷ EK/aktie 87,35 = 9,07 % stänger P/B÷ROE = 8,1940 mot P/E-fältet 8,194 med gap 0,00 %, plus golv-dubbelidentiteten 64,90÷87,31 = 0,7433 mot P/B 0,743 och 1−P/B 0,2570 mot marginalfältet 0,2567 — två fält, en värld. Därtill: två fönster två multiplar 8,194/11,16 (trailingvinst 1 100 mot bokslut 808 Mkr, gap 292 Mkr/36 % = 2026 års värderader, bevisade av Q1 +13/+61 Mkr och Q2-EPS 1,70/0,05 = 236/7 Mkr), PEG-nämnarbytet 1,37/1,28/127,6 (procentfällan), EV-kedjan sluten (EBIT-TTM 1 860 → EV 26 474 → nettoskuld implicit 17 458 mot totala skulder 17 806, implicit kassa 348 Mkr — skuldbegreppsdubbelheten Yahoo-kvot 1,47 mot bolagets LTV), utdelningen mot TRE nämnare (2,40 kr = 3,70 % kurs / 2,75 % bokfört / 2,40 % EPRA), scenarioruta 9/9 (1 856→1 966 Mkr; 3 % intäkt = 55,7 Mkr = 2,09 marginalpp; miljard-ekvationen 18 intäktsprocent eller 37,6 marginalprocent), kvartalskedja Q1 663/661 + förvaltning 220/221 + jämförbara +1,5 % + nettouthyrning 15/10/25-mot-3 + EPRA 100,20/99,90 + utdelning 0,60 kr/kv (X-dag 2027-01-08). KVD verktyg/_s4u1-dios-kvd.mjs GRÖN 124 PASS 0 FEL 0 VARNING (fältparitet 22 kontroller LIVE ur universumfilen, aritmetik 48 påståenden omräknade oberoende, 12 medianer + 10 rang LIVE ur 237-postfilen, exakt ett lagrum 2007:528 2 kap 5 §, rådglosor 0 med disclaimer-stripp — seriens negerade standardfras är juridiktext, ej råd, 0 engelska läckor, 13 interna länkar i tillåten uppsättning, 0 externa URL:er i body, disclaimer sista raden); KVD-processen kurerade två egna skriptbuggar (d.vardering-fältvägar gav NaN; komma-mot-punkt i toFixed-jämförelse) och rättade fem paketgap FÖRE grönt — vaccinerade. Motor verktyg/_s4u1-dios-byggdata.mjs med fryst talbank _s4u1-dios-tal.json (motorn kurerade under bygget fältnamnet ebitMarginal, kronor/Mkr-seriekonverteringen, en f/r-prefixväxling och ett stamfel i en söksträng). KO: huvudrad + slugrad i båda tabellerna (syskonen orörda). Ren dataleverans: data/blogg/ orörd, src orörd = INGET bygge, R2 orörd (publicering = kundens beslut). Kö i spåret efter denna: MTG-B 5/11 (bruten serie enligt könot), NVDA 17/11 (tredjepartskonfirmans), biblioteksobjekten NEM/META/GOOGL/MSFT/CVX/DIS/PLTR/VZ/LOGN (estimat-klass eller kräver eget verifieringsarbete), novemberfältet Fresenius 4/11 + Latour 3/11 + Sinch 5/11 + Polestar 5/11 + Enel 11/11 + Coloplast-redan-levererad-klassen.

`;
  appendFileSync(wp, rad);
  console.log('worklog-rad appenderad');
}

for (const f of ['/home/ak1a/AK1/verktyg/_s4u1-dios-fix.mjs', '/home/ak1a/AK1/verktyg/_s4u1-dios-fix2.mjs']) {
  if (existsSync(f)) { unlinkSync(f); console.log('borttagen:', f); }
}
console.log('bokföring klar');
