// r332 landa: validering + bokföring (worklog/PIPELINE/beslutsminne) + commit + push
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).split('\n').filter(l => !l.startsWith('hint:') && !l.startsWith(' ')).join(' ').slice(0, 400); }
};

console.log('=== VALIDERING ===');
const syn = sh('node --check verktyg/marke-framtids-404.mjs');
const json = sh("node -e \"JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json giltig')\"");
console.log(`verktyg: ${syn === '' ? 'OK' : syn} · ${json}`);
console.log('slutpush-läge: ' + (fs.existsSync(`${YTA}/data/vakten/r330-slutpush-kvito.log`) ? fs.readFileSync(`${YTA}/data/vakten/r330-slutpush-kvito.log`, 'utf8').trim().split('\n').pop() : '(saknas)'));

fs.appendFileSync(`${YTA}/worklog.md`, `
## ROND 332 [organ:Φ] (2026-09-29 ~08:5x–09:0x UTC) — v211 SOFT-404-KUREN LEVERERAD OCH SKARPT BEVISAD: 8/8 framtidsplatser nu ÄKTA 404

**ROT-KURAD (fortsättning r327):** Next 16.3.6 skriver "status": 404 i .meta för
_not-found (globala) men INTE för generateStaticParams-platser som når notFound()
— next start serverar dem HTTP 200 (soft-404). KUREN: verktyg/marke-framtids-404.mjs
som postbuild-steg (package.json) — märker "status": 404 i .meta för varje statisk
bloggplats vars inlägg ännu ej är publicerat (bloggArPublicerad-logiken, sv-SE-
datum). S2-AUTOUBLICERINGEN BEVARAS: när publiceringsdagen kommer omrenderar ISR
(revalidate 3600) sidan med innehåll och Next skriver färsk meta UTAN 404 ⇒ 200 —
exakt som designat, ingen deploy krävs.

**SKARPT DRIFTBEVIS (_r332-drifttest.mjs mot levande artefakt):** 8 framtids-
slugar funna (Q3-familjen växer: Ericsson, Evolution, Goldman Sachs, Holmen,
Industrivärden, Nordea, Sandvik, SKF-B — granskningskön levererar), alla 8 .meta
märkta, alla 8 svarar NU ÄKTA 404 — effekten omedelbar UTAN omstart (next start
läser meta från disk per request), kontrollpost (publikt inlägg) 200. Inget
innehåll har någonsin läckts (kropparna var redan 404-skal) — soft-404-klassen
var länkbarhet/indexbarhet, nu stängd.

**REST (bokfad v211-rest):** /en/ + /ar/-speglarna är on-demand (inga statiska
platser att märka) — deras soft-404 kvarstår till publiceringsdagen; innehålls-
lösa skal, ingen läcka. Fönster-notis: ett byggbyte FÖRE att denna push deployar
lämnar märkningen borta tills postbuild-steget lever (auto-hel vid min deploy).

**Slutpush-kön leverar r330-r331-commits vid nästa fabrikspaus.
`);

fs.appendFileSync(`${YTA}/data/forskning/PIPELINE-KO.md`, `

## ROND 332 [organ:Φ] (2026-09-29) — v211 SOFT-404-KUREN LEVERERAD: postbuild-märkning, 8/8 skarpt bevisade

| Post | Innehåll | Status |
|---|---|---|
| v211 | Soft-404-kuren: verktyg/marke-framtids-404.mjs (postbuild i package.json) märker "status": 404 i .meta för opublicerade bloggplatsers statiska platser; ISR-vakningen bevarad (publiceringsdagen ⇒ omrendering ⇒ 200 automatiskt) | ✓ LEVERERAD r332 — skarpt bevisad: 8/8 framtids-slugar (hela Q3-familjen) äkta 404 direkt efter märkning, kontroll 200, ingen omstart krävd |
| v211-rest | /en/ + /ar/-speglarnas on-demand soft-404 (inga statiska platser att märka) | BOKAD — mindre klass (innehållslösa skal, ingen läcka); kurbehov utreds om sökrapport visar indexering |
| v207 | Prefetch-eftermätning (runtime-instrument) | BOKAD (nästa) |
`);

fs.appendFileSync(`${YTA}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 332,
  beslut: "r332 v211 SOFT-404-KUREN LEVERERAD: marke-framtids-404.mjs som npm postbuild märker status:404 i .meta för opublicerade bloggplatsers statiska platser (Next 16.3.6 skriver det ej själv för generateStaticParams+notFound — bara för globala _not-found); S2-autopublicering bevarad (ISR omrenderar med 200 på publiceringsdagen). Skarpt bevis: 8/8 Q3-framtids-slugar äkta 404 direkt, kontroll 200, ingen omstart. Rest: en/ar-on-demand-speglar (bokad). v207 nästa.",
  landat: "denna commit (marke-framtids-404.mjs + package.json postbuild + worklog r332)"
}) + '\n');

const msg = `studio: [organ:Φ] r332 v211 SOFT-404-KUREN LEVERERAD — verktyg/marke-framtids-404.mjs som npm postbuild (package.json): märker "status": 404 i .meta för varje statisk bloggplats vars inlägg ännu ej är publicerat (bloggArPublicerad-logik, sv-SE-datum, idempotent, exit 0 alltid); ROTEN: Next 16.3.6 skriver status:404 endast för globala _not-found — generateStaticParams-platser som når notFound() serveras HTTP 200 av next start (soft-404, länkbara/indexerbara); S2-AUTOUBLICRINGEN BEVARAS: ISR (revalidate 3600) omrenderar med innehåll på publiceringsdagen och skriver färsk meta utan 404 = 200 utan deploy, exakt designen; SKARPT DRIFTBEVIS (_r332-drifttest.mjs mot levande artefakt): 8/8 framtids-slugar (Q3-familjen: Ericsson, Evolution, Goldman Sachs, Holmen, Industrivärden, Nordea, Sandvik, SKF-B — granskningskön levererar) märkta och svarar ÄKTA 404 DIREKT utan omstart (next start läser meta per request), kontrollpost 200; ingen innehållsläcka någonsin (kroppar var 404-skal) — länkbarhetsklassen stängd; REST bokad: /en/+/ar/-on-demand-speglar (inga statiska platser att märka, innehållslösa skal); fönster-notis: byggbyte före denna deploys landning lämnar märkningen borta tills postbuild lever`;
fs.writeFileSync('/tmp/r332-commitmsg.txt', msg);
const steg = (n, f) => { const ut = sh(f); console.log(`[${ut.startsWith('FEL') ? 'FEL' : 'OK'}] ${n}: ${ut.slice(0, 250)}`); if (ut.startsWith('FEL') && n !== 'push') process.exit(1); return ut; };
steg('git add', 'git add -A');
steg('commit', 'git commit -F /tmp/r332-commitmsg.txt');
const push = steg('push', 'git push prod develop');
if (push.startsWith('FEL')) console.log('push köar — slutpushen/bakgrund tar den vid fabrikspaus');
steg('HEAD', 'git log --oneline -1');
console.log('\nKLAR r332');
