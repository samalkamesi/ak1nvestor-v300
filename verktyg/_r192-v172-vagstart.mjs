#!/usr/bin/env node
// _r192-v172-vagstart.mjs — v172 VÅGSTART enligt EMOTTAG-MONSTER: granskningsfil + underlagsdoc
// (veckokarta ur kalendrarna) + PIPELINE-KO-bokföring + worklog + commit + push + verifikation + minne
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const UTKAST_DIR = `${ROT}/data/blogg-utkast/kvartal/2026-q3`;

const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r192-vagstart-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// ── Veckokartan ur kalendrarna ──
const kalRader = [];
for (const f of fs.readdirSync(UTKAST_DIR).filter((f) => f.startsWith('kalender-'))) {
  const k = JSON.parse(fs.readFileSync(`${UTKAST_DIR}/${f}`, 'utf8'));
  for (const b of k.bolag || []) kalRader.push({ bransch: k.bransch, ...b });
}
const vecka = (fenster) => {
  const m = String(fenster || '').match(/2026-(09|10|11)-(\d{2})/);
  if (!m) return null;
  const d = new Date(Date.UTC(2026, Number(m[1]) - 1, Number(m[2])));
  return Math.ceil(((d - Date.UTC(2026, 0, 1)) / 86400000 + 3) / 7);
};
const grupper = new Map();
for (const b of kalRader) {
  const v = vecka(b.rapportfenster);
  const nyckel = v === null ? 'spann' : (v >= 40 && v <= 44 ? `v${v}` : `v${v}+`);
  if (!grupper.has(nyckel)) grupper.set(nyckel, []);
  grupper.get(nyckel).push(b);
}
const veckoRad = (v) => (grupper.get(v) || []).map((b) => `- ${b.namn} (${b.ticker}) — ${String(b.rapportfenster).split(';')[0].trim()}`).join('\n');
const v40 = veckoRad('v40'), v41 = veckoRad('v41'), v42 = veckoRad('v42'), v43 = veckoRad('v43'), v44 = veckoRad('v44');
const spannet = veckoRad('spann');
const v45plus = [...(grupper.get('v45+') || [])].map((b) => `${b.namn} (${b.ticker})`).join(' · ');
steg('veckokarta', kalRader.length === 100, `${kalRader.length} kalenderbolag: v41 ${grupper.get('v41')?.length || 0} · v42 ${grupper.get('v42')?.length || 0} · v43 ${grupper.get('v43')?.length || 0} · v44 ${grupper.get('v44')?.length || 0} · spann ${grupper.get('spann')?.length || 0} · v45+ ${grupper.get('v45+')?.length || 0}`);

// ── Granskningsfilen (PROCESREGLER + tom RAPPORTBLOCK-markör — statusverktyget fyller) ──
const gransk = `# V172 — GRANSKNING: kvartalsrapportsserien Q3 2026 (vågstart rond 192, 2026-09-25)

## PROCESREGLER (EMOTTAG-MONSTER-anpassade för rapportvågen)

1. **Väntar-listan uppdateras VID LEVERANS.** Disk-läget är sanningen: finns paketet i
   \`data/blogg/\` = PUBLICERAD; finns det endast i \`data/blogg-utkast/kvartal/2026-q3/\`
   = VÄNTAR. Levererande/granskande session ropar \`node verktyg/_r172-rapportvag-status.mjs\`
   som SISTA steg i sin körning (monstrets regel 1 — v166-läxan).
2. **RAPPORTBLOCK byggs om per körning — senaste mätningen gäller.** Blocket ERSÄTTS,
   appendas aldrig; dubbelkörning är bitidentisk (monstrets regel 2 — v170-kuret mönster).
3. **STÄNGDVAKT.** Bär SAMMANFATTNING-raden STÄNGD lämnar statusverktyget filen orörd
   (bevisbevarande; monstrets regel 3).
4. **PUBLICERINGSGRIND (R2 — kundens vetorätt).** Flytt av ett paket från utkast till
   \`data/blogg/\` = extern publicering = KUNDENS BESLUT, aldrig autonomt. Granskning,
   kur och kvalitetsmätning av utkast är internt arbete och görs autonomt. LÄGET JUST NU:
   9 paket publicerade i tidigare omgångar med schemalagda oktober-datum (10-05 → 10-21) —
   befintligt läge dokumenteras här som faktum; YTTERLIGARE publiceringar väntar kund.
5. **Juridikgrinden (V152, fast för serien).** "Så läser du"-formuleringar, aldrig råd
   (lagen 2007:528); källor per siffra; konsensus endast som pedagogiskt begrepp.

## RAPPORTBLOCK (maskinellt genererat — byggs om per körning, reglerna § 1–2)
<!-- SLUT-RAPPORTBLOCK -->

## SAMMANFATTNING
(öppen — vågen pågår)
`;
fs.writeFileSync(`${ROT}/data/forskning/V172-GRANSKNING.md`, gransk);
steg('granskningsfil skapad', true);

// ── Statusverktyget fyller RAPPORTBLOCK ──
const statusUt = execFileSync('node', ['verktyg/_r172-rapportvag-status.mjs'], { cwd: ROT, encoding: 'utf8', timeout: 120000 });
steg('RAPPORTBLOCK genererat', statusUt.includes('publicerade'), statusUt.trim().split('\n')[0]);

// ── Underlagsdokumentet ──
const vag = `# V172 — RAPPORTVÅGSUNDERLAG: Q3 2026 (rond 192, 2026-09-25)

**Spår:** evighetskatalogen spår 4 (kvartalsrapporter) · **Kanal:** session ·
**Utlösare:** rapportdagarna från 2026-10-09 (Öresund) · Q3 2026 slutar 2026-09-30.

## Läget vid vågstarten (disk-läget = sanningen)

- **10 branchkalendrar** (data/blogg-utkast/kvartal/2026-q3/kalender-*.json, byggda
  2026-09-15/16): 100 bolag med rappfönster, källor och explicit bekräftat-vs-estimat.
  Fas 2 i V152-KVARTALSKARTA är därmed LEVERERAD (av tidigare omgångar) — kortlagd här.
- **71 läspakets-utkast** (sa-laser-du-*-q3-2026.json) — fas 3 påbörjad: mallstommen
  bevisad i de publicerade exemplen.
- **9 publicerade** i data/blogg/ med schemalagda oktober-datum (10-05 → 10-21):
  industrivärden, ericsson, goldman-sachs, nordea, sandvik, skf-b, evolution, holm (+ den
  allmänna "så läser du en kvartalsrapport" från 09-09). Publicering av ytterligare
  paket = R2 (väntar kund — granskningsfilens regel 4).

## Veckokartan v40–v44 (ur kalendrarna — första datumet i fönstret; spann/estimat särskilt)

### v40 (09-28 – 10-04)
${v40 || '- (inga kartlagda rapporter — Q3 slutar onsdagen 09-30)'}

### v41 (10-05 – 10-11)
${v41}

### v42 (10-12 – 10-18)
${v42}

### v43 (10-19 – 10-25)
${v43}

### v44 (10-26 – 11-01)
${v44}

### Senare / spann-estimat (ej officiellt bekräftat)
${v45plus ? 'November+: ' + v45plus : ''}
${spannet ? 'Spann/estimat (första datum oklart):\n' + spannet : ''}

## Mallstommen (bevisad i de 9 publicerade paketen)

1. Urvalet: varför detta bolag nu · 2. Vad motorn mäter just nu · 3. Nyckeltalen att ha
med sig (branschspecifika, AKM2-dimensionerna) · 4. Tre sätt att läsa utfallet —
övningsexempel · 5. Praktiskt inför rapportdagen (datum, klockslag, källa) · 6. Källor.

## Vågstart-checklistan (EMOTTAG-MONSTER — alla fyra punkter tillämpade)

- [x] Emottags-analog skapad: verktyg/_r172-rapportvag-status.mjs (disk-mätaren; granskningsfilen
      är vågens sanning —monstrets "emottag" är här en statusmätare eftersom integrationen
      är en R2-publicering, inte en deep-courses-append)
- [x] Självtest-analog: dubbelkörning av status = ombyggnad (bitidentisk blocksektion) —
      demonstrerad vid vågstarten (två körningar, blocket identiskt)
- [x] Granskningsfilen skapad med PROCESREGLER-sektionen (V172-GRANSKNING.md, fem regler
      inkl. R2-publiceringsgrinden monstret saknar men V152 kräver)
- [x] Manifestprompter behövs ej (session-kanal; fabriken kvotdöd till 09-28 — PIPELINE-KO v171)

## Nästa steg (vågens fortsättning)

1. Granskningsomgång av de 71 väntande utkasten (kvalitetskur mot mallstommen + kalender-
   fakta) — internt, autonomt.
2. Publiceringspaket till kunden (R2): vilka av de granskade utkasten som får gå live
   före sina rapportdatum — kundens beslut, påminnelse i sessionen.
3. Allteftersom rapporterna publiceras (v41+): läspaketen uppdateras med FAKTISKA
   utfall enligt mallens sektion 1 ("vad som rapporterades") — källa = bolagets eget
   rapportmaterial, aldrig prognoser.

_Juridikgrinden fast för serien: utbildning i metod ("så läser du"), aldrig råd (2007:528)._
`;
fs.writeFileSync(`${ROT}/data/forskning/V172-RAPPORTVAG.md`, vag);
steg('underlagsdokument skrivet', true);

// Självtest-analog: dubbelkörning bitidentisk
const före = fs.readFileSync(`${ROT}/data/forskning/V172-GRANSKNING.md`, 'utf8');
execFileSync('node', ['verktyg/_r172-rapportvag-status.mjs'], { cwd: ROT, encoding: 'utf8', timeout: 120000 });
const efter = fs.readFileSync(`${ROT}/data/forskning/V172-GRANSKNING.md`, 'utf8');
steg('självtest: dubbelkörning', före === efter, före === efter ? 'bitidentisk ✓' : 'SKILDLIG — avbryt');

// ── PIPELINE-KO: v172 → PÅBÖRJAD ──
const koP = `${ROT}/PIPELINE-KO.md`;
const ko = fs.readFileSync(koP, 'utf8');
const gammal = '| v172 | kvartalsrapporter (spår 4) | Q3 2026 slutar 09-30: förbered analysramverket (vilka bolag i universet rapporterar v 40–44, tidtabell, mallar ur AKM2) så rapportvågen kan starta direkt vid publiceringarna | session | bokad |';
const ny = '| v172 | kvartalsrapporter (spår 4) | Q3 2026 slutar 09-30: förbered analysramverket (vilka bolag i universet rapporterar v 40–44, tidtabell, mallar ur AKM2) så rapportvågen kan starta direkt vid publiceringarna | session | PÅBÖRJAD r192: V172-RAPPORTVAG.md + V172-GRANSKNING.md (EMOTTAG-MONSTER-mönstret: 5 PROCESREGLER, RAPPORTBLOCK-ombyggnad, stängdvakt, R2-publiceringsgrind) + _r172-rapportvag-status.mjs · läget: 10 kalendrar/100 bolag kartlagda, 71 utkast VÄNTAR, 9 publicerade (schemalagda okt-datum) · utlösare = rapportdagarna från 10-09 · nästa: granskningsomgång av utkasten + publiceringspaket till kund (R2) |';
if (!ko.includes(gammal)) steg('PIPELINE-KO', false, 'v172-raden matchade ej');
fs.writeFileSync(koP, ko.replace(gammal, ny));
steg('PIPELINE-KO bokförd', true);

// ── Worklog rond 192 ──
const nyRond = `## ROND 192 [organ:Φ] — v172 KVARTALSRAPPORTVÅGEN STARTAD: underlag + granskningsfil + statusmätare enligt EMOTTAG-MONSTER — 2026-09-25 ~02:0x lokal
PIPELINE-KO v172 verkställt (Q3 2026 slutar 09-30). SONDERINGEN VISADE: vågen var längre gången än kön visade — 10 branchkalendrar med 100 bolag (byggda 09-15/16, källhänvisade rappfönster med bekräftat-vs-estimat explicit), 71 läspakets-utkast i kvartal/2026-q3/, 9 redan publicerade med schemalagda oktober-datum. V152-KVARTALSKARTA:s fas 2 (kalenderinläsning) var alltså redan levererad — vågstarten byggde vidare istället för att uppfinna om. LEVERANSER: (1) data/forskning/V172-GRANSKNING.md — EMOTTAG-MONSTER-mönstret anpassat för rapportvågen: fem PROCESREGLER (väntar-lista vid leverans med disk-läget som sanning: data/blogg = PUBLICERAD / utkast = VÄNTAR; RAPPORTBLOCK byggs om per körning = senaste mätningen gäller, bitidentisk dubbelkörning; stängdvakt; PUBLICERINGSGRIND R2 — flytt utkast→blogg = kundens beslut, aldrig autonomt, de 9 befintliga dokumenterade som faktum; juridikgrinden fast). (2) verktyg/_r172-rapportvag-status.mjs — disk-mätaren (RAPPORTBLOCK-ombyggare + stängdvakt); SJÄLVTEST-ANALOG: dubbelkörning bitidentisk ✓. (3) data/forskning/V172-RAPPORTVAG.md — underlaget: läget (100/71/9), VECKOKARTAN v40–v44 ur kalendrarna (första kartläggningen av vilka bolag rapporterar vilka veckor: v41 Öresund 10-09 m.fl., v42 JPM/GS/Nordea/NP3/Wallenstam/Prologis m.fl., v43 Ericsson 10-15-belgen + fastigheter/banker, v44 SEB/Swedbank/Equinor/Shell m.fl., november+ Latour/Berkshire/RWE/Enel), mallstommen (bevisad i de 9 publicerade), vågstart-checklistan ✓, nästa steg (granskningsomgång av 71 utkast + publiceringspaket till kund R2 + utfallsuppdatering allteftersom rapporterna landar). (4) PIPELINE-KO: v172 → PÅBÖRJAD med lägesbild. Ren dataleverans (dokument + verktyg) — src orörd, inget bygge. NÄSTA: granskningsomgången av utkasten (autonomt) + R2-påminnelse om publiceringspaketet i sessionen; därefter v173 dataset-djup enligt rotationen.`;
fs.appendFileSync(`${ROT}/worklog.md`, '\n' + nyRond + '\n');
steg('worklog', true);

// ── Commit → push → verifikation ──
const msg = `studio: [organ:Φ] v172 KVARTALSRAPPORTVÅGEN STARTAD (rond 192) — V172-RAPPORTVAG.md (läge 100 kalenderbolag/71 utkast/9 publicerade + veckokarta v40–v44 + mallstomme) + V172-GRANSKNING.md (EMOTTAG-MONSTER-mönstret: 5 PROCESREGLER, RAPPORTBLOCK-ombyggnad med bitidentisk dubbelkörning, stängdvakt, R2-publiceringsgrind) + _r172-rapportvag-status.mjs (disk-mätaren). PIPELINE-KO: v172 → PÅBÖRJAD, utlösare = rapportdagarna från 10-09; publicering av ytterligare paket väntar kund (R2). Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r192-msg.txt', msg);
const filer = ['data/forskning/V172-RAPPORTVAG.md', 'data/forskning/V172-GRANSKNING.md', 'PIPELINE-KO.md', 'verktyg/_r172-rapportvag-status.mjs', 'verktyg/_r192-v172-sondra.mjs', 'verktyg/_r192-v172-djup.mjs', 'verktyg/_r192-v172-format.mjs', 'verktyg/_r192-v172-kal.mjs', 'verktyg/_r192-v172-vagstart.mjs', 'worklog.md'];
git(['add', ...filer]);
steg('git add', true, `${filer.length} filer`);
try {
  const ut = git(['commit', '-F', '/tmp/r192-msg.txt']);
  steg('commit (tsc-grinden)', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('commit (tsc-grinden)', false, String(e.stdout || e.message).slice(0, 400)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('HEAD', true, hash);

const status = git(['status', '--porcelain'], PROD);
const trackedMod = status.split('\n').filter((l) => /^ ?M/.test(l));
if (trackedMod.length > 0) steg('prod-renhet', false, `tracked-mod: ${trackedMod.join(' | ')} — adoptera först`);
steg('prod-renhet', true, '0 tracked-mod');
try {
  const push = git(['push', 'prod', 'develop']);
  steg('push prod develop', true, push.split('\n').filter((l) => l.includes('->') || l.includes('|')).join(' | ').slice(0, 160));
} catch (e) { steg('push prod develop', false, String(e.stdout || e.message).slice(0, 500)); }

const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('prod HEAD ≡ push', prodHead === hash, prodHead);
const vagProd = fs.readFileSync(`${PROD}/data/forskning/V172-RAPPORTVAG.md`, 'utf8');
steg('underlag i prod', vagProd.includes('Veckokartan'));
const granskProd = fs.readFileSync(`${PROD}/data/forskning/V172-GRANSKNING.md`, 'utf8');
steg('granskningsfil i prod', granskProd.includes('RAPPORTBLOCK') && granskProd.includes('9 publicerade'));
const koProd = fs.readFileSync(`${PROD}/PIPELINE-KO.md`, 'utf8');
steg('PIPELINE-KO PÅBÖRJAD i prod', koProd.includes('PÅBÖRJAD r192'));
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('sajten', sajt === 200, String(sajt));
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 192, beslut: 'v172 kvartalsrapportvågen startad enligt EMOTTAG-MONSTER (granskningsfil + statusmätare + veckokarta v40–v44); 71 utkast väntar granskning, publicering R2-väntar kund', landat: hash }) + '\n');
steg('beslutsminne', true);

console.log(kvitto.join('\n'));
