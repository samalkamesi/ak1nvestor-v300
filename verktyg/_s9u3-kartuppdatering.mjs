#!/usr/bin/env node
/**
 * GENERERAD av verktyg/ — dokvåg s9-u3 omgång 11: kartredigering via node-kanal
 * (clobber-kuren: unika ankarsträngar, EN läsning→EN skrivning, omedelbar commit).
 * Raderas efter commit (worklog-mönstret _s9u2-kartuppdatering.mjs).
 */
import fs from 'node:fs';

const KARTA = 'data/forskning/SYSTEMKARTAN.md';
let text = fs.readFileSync(KARTA, 'utf8');
const fore = text.length;
let antal = 0;

function byt(ankare, ny, etikett) {
  const i = text.indexOf(ankare);
  if (i === -1) throw new Error(`ANKARE SAKNAS (${etikett}): ${ankare.slice(0, 70)}…`);
  if (text.indexOf(ankare, i + 1) !== -1) throw new Error(`ANKARE EJ UNIKT (${etikett})`);
  text = text.slice(0, i) + ny + text.slice(i + ankare.length);
  antal++;
}

// 1. Ny UPPDATERING-sektion före ÖVERSIKT-tabellen
const sektion = `## UPPDATERING 2026-09-17 (dokvåg s9-u3 omgång 11 — B7 + B8 återdiffade; A3-korsvalidering; andra varvet)

Elfte u3-dokvågen, andra varvets åttonde omgång. Objektval mot duplikat med
TVÅ TRÄDSKIFT under mätningen (s10-u3-kuren): A3 var självklart tredjeobjekt
(mina mätningar 06:5x–07:2x hann FÖRE commit-upptäckten) men togs av syskonet
s9-u2 omgång 8 (223140e1 — deras A3-fynd identiska med mina, se
korsvalideringen), och E35 höjdes av s9-u1 omgång 11 (dad5bc94, 8→9 —
snittet 286 räknat av dem); deras sektioner orörda, A3 avstås här. B7 + B8
genomfördes som huvudobjekt — B7:s egen kö sade uttryckligen "B8-dokvåg
verifierar" (ensemble-kurens självläkning 2026-10-01). Allt MÄTT i arbetsytan
2026-09-17 ~06:5x–07:2x lokal (nio svitkörningar, motorvalidering, eget
full-svep mot localhost på samtliga 22 bibliotekssidor, live-sonder,
node-läsning av JSON/loggar, crontab-läsning, ls/grep/git log) — aldrig
worklog-läsning:

| Mått | Kartan (senaste passning) | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| AKM2-sviterna (B7) | 156 kontroller gröna (09-16) | **156 GRÖNA igen, samtliga egna körningar** (kärna 25/25 · dynamik 55/55 · moduler 64/64 · snapshot 12/12 i ren env) + motorvalidering **107/0/0 (6,7 s, egen)** |
| snapshot env-läcka (B7) | 11/12 med ärvt env | **LEVER KVAR mätt**: 11/12 med ärvt env (kontroll 11 FAIL, egen körning), 12/12 i ren env — gapet orört |
| berika-pipelinen (B7) | stillastående sedan 09-04 (12 d) | **13 DAGAR** (git-mätt: 4b98cd15 senaste); 0 akm2-cacher på disk |
| data/cache (B7) | "endast 7 sporadiska on-demand-filer" (09-16) | **33 runtime-skrivna filer** (netnet 25 · analys 7, färskast analys-nyh 09-17 06:17 · vagfundament 1) — on-demand-skrivningarna LEVER; men akm1/akm2/akm3/fundamental fortfarande 0, självläkningen väntar på månads-cronen 2026-10-01 |
| AKM2-dashboard (B7) | 22/22 (09-16) | **22/22 BEKRÄFTAD** (eget full-svep, alla 22 sidor 200) — metodnotis: filnamnets sista \`_\` är \`.\` i URL:en; svep utan transform gav 12/22 + tio 404:or = mätartefakt, ej regression |
| ensemble-vyn (B8) | 0/22 | **0/22 KVAR** (samma svep — konsumentytan fortsatt tom) |
| AKM3-sviten (B8) | 55/55 (09-16) | **55/55 PASS exit 0 ×3 återmätningar** — MEN ett engångsfail i första körningen (dokvågens egna två bash-block körde node parallellt: stacktrace + avslutskod 1, ej reproducerbar i 3 isolerade körningar) — instabilitetsnotis, ej kontraktsbrott; 0 tmp-läckor i roten (s8-u2:s självläkning verifierad) |
| kalibrering-loggen (B8) | 1 rad (09-04, ΔΦ=0) | **fortfarande 1 rad** (node-mätt) |
| regime-loggen (B8) | 1 genesis-rad (09-03) | **fortfarande 1 rad**; /api/forskningslage live-sondad bär EXAKT genesis-talen (7 gröna/100 · 17 röda · "magert") — regimen frusen i 14 dagar, åldern osynlig för eleven |
| Contabo-cron (B8 gap 4) | akm3-kalibrering + vagvalidering saknas | **fortfarande saknas** (användar-crontab + /etc/crontab grep-mätta: 0 träffar); vercel.json: kalibrering \`20 5 2 * *\` = nästa molnrond **2026-10-02**, vagvalidering 05:30 UTC daglig |
| vagvalideringsrapporten (B8/B9-gräns) | 12 d (B9-not 09-16) | **13 dagar** (mtime 09-10 16:33) — Vercel-fs kan inte förnya Contabo-filen; speglingsgapet lever |
| A3 (KORSVALIDERING) | syskonets omgång 8: 24 lager/80 monsters/E01 358/390 | **bekräftat EXAKT med oberoende mätningar FÖRE deras commit-upptäckt**: kedjan 24 lager (chat-widget.tsx:986 egenhändigt läst), 80 monsters (id-räknat: basen 25 + 55 i 23 frågelager-filer), bas **25 PASS · 1 FAIL** (endast E01) + de fem nyaste lagren ALLA GRÖNA (grahamgolv 30/0 · förväntningsdjup 30/0 · portföljbalans 27/0 · stabilitetsdjup 27/0 · riskmåttsdjup 27/0 = 141/0), E01 RÖD **inbakad 358 · byggd 390** (siffror.json 390, uppdaterad 09-17; gapet 17 → 23 → 32 kurser), larvag-synk GRÖN 390=390=390 · 0 fantomer (ts 07:12) — eftersläpningen specifik för mentorns --baka-steg; deras sektion lämnas helt åt dem |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| B7 | LEVER 8 → **LEVER 8** | Lägesbekräftelse med egna mätbevis (156 kontroller + 107/0/0 + 22/22-livlinan) och två preciserade mått (cache-delåterfyllningen 33 runtime-filer — netnet/analys lever medan datacache-typerna står på 0; metodnotisen URL-transform). Berika fortfarande stillastående 13 dagar, env-läckan orörd: inga gap stängda eller öppnade — ingen poängrörelse (E33/B14-precedensen) |
| B8 | PÅGÅR 7 → **PÅGÅR 7** | Driftbilden oförändrat frusen (1+1 loggrad, regimen genesis-tal live i 14 dagar, ensemble 0/22, Contabo-cron fortfarande saknas) men sviten grön ×3 + instabilitetsnotis (engångsfail vid parallellkörning) + molnrondens datum preciserat (2026-10-02): kunskap tillförd, inga gap stängda — ingen poängrörelse |

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg; u1
omgång 11:s E35 +1 och u2 omgång 8:s A3/E37-passningar landade under fönstret
och är räknade i deras sektioner).

Kö till huvudagenten från fynden: (1) **B8:s tidsfönster**: nästa molnrond
2026-10-02 — sker inte Contabo-speglingen (akm3-kalibrering + vagvalidering)
före dess växer kalibreringskedjan + regimen endast i molnet och prod-diskens
loggar står stilla ytterligare en månad (samma speglingsfamilj som B9/D25
bokfört); (2) **registerrebaken 358→390** (u2 omgång 8:s kö upprepas med
tyngd: gapet fördjupades 17→23→32 på två dygn; larvag-synkens samtidiga
390-grönhet visar att kedjan KAN hänga med — --baka som obligatoriskt steg i
s5/s6-prompterna); (3) AKM3-svitens engångsfail utreds (parallellköarnings-
känslighet — fast tmp-namn? samma klass som s8:s tmp-fynd men med
självläkning intakt); (4) berika-cadansen (B7:s gamla kö lever oförändrat);
(5) metodnotisen för framtida bibliotekssvep: URL-transform sista \`_\` →
\`.\` (annars 10/22 falska 404:or — denna dokvågs eget misstag, dokumenterat).

`;
byt('## ÖVERSIKT — 38 system', sektion + '## ÖVERSIKT — 38 system', 'ny sektion');

// 2. ÖVERSIKT B7-rad
byt(
  'Kärnan 156 kontroller grön (mätt 09-16); berika-pipelinen stillastående 12 d (0 cacher på disk), AKM3-ensemble 0/22 i prod, snapshot-svit env-känslig |',
  'Kärnan 156 kontroller grön igen (mätt 09-17); berika-pipelinen stillastående 13 d (0 akm2-cacher; däremot 33 runtime-filer åter i data/cache — netnet/analys lever), AKM3-ensemble 0/22 i prod (AKM2-livlinan 22/22 håller), snapshot-svit env-känslig |',
  'översikt B7'
);

// 3. ÖVERSIKT B8-rad
byt(
  'Konstruktion topp (55/55, LÅST grind ΔΦ=0, hash-kedjor; mätt 09-16); men kalibreringen ENBART Vercel-cron-driven (Contabo-crontab saknar raden, mätt), regimen FROSEN på genesis 09-03 (uppdateringsvägen vagvalidering finns ej på Contabo), ensemble-vy 0/22; n_eff-målet 8–12 kvartal bort |',
  'Konstruktion topp (55/55 ×3 återmätningar 09-17 + LÅST grind ΔΦ=0, hash-kedjor); men kalibreringen ENBART Vercel-cron-driven (nästa molnrond 2026-10-02; Contabo-crontab saknar fortfarande raden, mätt 09-17), regimen FROSEN på genesis 09-03 (14 d; genesis-talen lever live i /api/forskningslage), ensemble-vy 0/22; n_eff-målet 8–12 kvartal bort |',
  'översikt B8'
);

// 4. Snitt-raden: kort tillägg före "Sämst:"
byt(
  'Sämst: betalning (5). Bäst: Studio, Dataset, SEO,\nMediebibliotek (9).',
  'u3 omgång 11 (09-17, andra varvet) återdiffade B7/B8 utan poängrörelser — B7 bekräftad med 156 gröna + 22/22-livlina (metodnotis: URL-transform \`_\`→\`.\` i bibliotekssvep, annars 10 falska 404:or) men berika 13 d + cache-nyansen 33 runtime-filer, B8 fruset kvar (loggar 1+1 rad, regimen genesis-tal live i 14 d, ensemble 0/22, nästa molnrond 10-02, sviten 55/55 ×3 + instabilitetsnotis); A3 korsvaliderat mot u2 omgång 8 med identiska oberoende tal (24 lager/80 monsters/E01 358/390).\nSämst: betalning (5). Bäst: Studio, Dataset, SEO,\nMediebibliotek (9).',
  'snittrad'
);

// 5. B7-blocket: ny notis
const b7notis = `*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 11, återdiff): läget
bekräftat med egna mätbevis — 156 kontroller gröna igen (kärna 25/25 ·
dynamik 55/55 · moduler 64/64 · snapshot 12/12 i ren env) + motorvalidering
107/0/0 (6,7 s) + AKM2-livlinan 22/22 i eget full-svep mot localhost
(metodnotis: filnamnets sista \`_\` är \`.\` i URL:en — svep utan transform
gav 12/22 + tio 404:or = mätartefakt, ej regression). Cache-bilden
NYANSERAD: data/cache bär 33 runtime-skrivna filer (netnet 25 · analys 7,
färskast analys-nyh 09-17 06:17 · vagfundament 1) mot "7 sporadiska" vid
senaste diffen — on-demand-skrivningarna lever, men akm1/akm2/akm3/
fundamental fortfarande 0 och berika-pipelinen stillastående 13 dagar
(4b98cd15 09-04). Env-läckan lever (11/12 med ärvt env, egen körning).
Score 8 kvar.*

`;
byt('- **Vad:** Plattformens vetenskapliga kärna', b7notis + '- **Vad:** Plattformens vetenskapliga kärna', 'B7-notis');

// 6. B8-blocket: ny notis + observationsrad
const b8notis = `*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 11, återdiff): driftbilden
oförändrat frusen — kalibrering-loggen 1 rad (09-04), regime-loggen 1 rad
(09-03), /api/forskningslage live-sondad bär EXAKT genesis-talen (7 gröna
av 100 · 17 röda · "magert" — regimen frusen i 14 dagar, åldern osynlig för
eleven), ensemble 0/22 (eget svep), Contabo-crontaberna (användare + /etc)
bär fortfarande INGEN akm3-kalibrering/vagvalidering; vercel.json: nästa
molnrond 2026-10-02. Sviten 55/55 ×3 återmätningar MEN ett engångsfail i
första körningen (parallell node-körning i dokvågens eget fönster:
stacktrace + avslutskod 1, ej reproducerbar isolerat; 0 tmp-läckor i
roten) — instabilitetsnotis. Vagvalideringsrapporten 13 dagar gammal
(mtime 09-10) — B9-gränsfyndet åldras vidare. Score 7 kvar, PÅGÅR kvar.*

`;
byt('- **Vad:** Regimdetektering', b8notis + '- **Vad:** Regimdetektering', 'B8-notis');

byt(
  '55/55 (mätt 2026-09-16). Kalibreringens indata är Bana B',
  '55/55 (mätt 2026-09-16; återmätt 09-17 ×3 grönt med en\n  instabilitetsnotis — se UPPDATERING-sektionen). Kalibreringens indata är Bana B',
  'B8-observation'
);

fs.writeFileSync(KARTA, text);
console.log(`OK: ${antal} ersättningar · ${fore} → ${text.length} tecken (${text.length - fore} till)`);
