// r327 landa: merge hem + bokför (worklog, PIPELINE v211, beslutsminne) + commit + push prod
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const run = (cmd, timeout = 120000) =>
  execSync(cmd, { cwd: YTA, encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] });

const steg = (namn, fn) => {
  try { const ut = fn(); console.log(`[OK] ${namn}${ut ? ': ' + String(ut).trim().slice(0, 400) : ''}`); return true; }
  catch (e) { console.log(`[FEL] ${namn}: ${(e.stdout || '') + (e.stderr || e.message)}`.slice(0, 600)); process.exit(1); }
};

// 1) Merge hem fabrikens commits
steg('fetch prod', () => run('git fetch prod develop 2>&1'));
steg('merge prod/develop', () => run('git merge prod/develop --no-edit 2>&1'));

// 2) Worklog-rad
const nu = new Date().toISOString();
fs.appendFileSync(`${YTA}/worklog.md`, `
## ROND 327 [organ:Φ] (2026-09-29 ~06:1x UTC) — Q3-LÄCKESROTSUTREDNING: akut läckage TÄPPT i prod; soft-404-defekt bokas som v211; v206 LEVERERAD I PROD

**UTREDNINGEN (hjärtatslagets kö-uppgift, fortsättning på r325:s fynd):** Alla tre
Q3-framtidsslugar (Holmen/Evolution/Sandvik, publishedAt 2026-10-21) svarade fortfarande
200 — men kroppsmätningen avgjorde domen: **nuvarande artefakt (BUILD_ID 05:38:36 =
7dad3195-trädet) bär datumfiltret (847185f8, bloggArPublicerad i src/lib/content.ts) och
serverar 404-SKAL utan innehåll** (45,7 kB, generell titel, noll "Holmens"-träffar).
r325:s "äkta titel 144 kB"-mätning träffade den GAMLA 03:07-artefakten — läckaget dog
med 05:38-bytet (räddningsbytes-markörens bullriga fönster förklarar förvirringen).

**BEVIS-KEDJAN:** 86/86 publika poster → 200 + äkta titel (ingen regression) · okända
slugar → ÄKTA 404 i alla tre språk (våg 81-kuren intakt i Next 16.3.6) · listvyer (/ och
/blogg) läcker inte framtidsposter · .meta-filerna saknar statusmarkering — roten till
kvarvarande defekt (nedan).

**KVARVARANDE DEFEKT (godartad, bokas v211):** Framtidsslugar serveras som SOFT-404
(HTTP 200 + 404-skal) i alla tre språk — länkbara/indexerbara men innehållslösa.
Rot: generateStaticParams inkluderar framtida slugar medvetet (S2: schemalagda inlägg
skall vakna live vid revalidate 3600 utan deploy — designen är RÄTT), men Next 16.3.6
skriver ingen 404-status i .meta för notFound-renderade statiska platser. Kur-alternativ
i PIPELINE (middleware-status / plats-exklusion+S2-offer / Next-uppgraderingsutredning).

**v206 PREFETCH-KUREN → LEVERERAD I PROD:** koden (beed9f7d, 27 platser) är bevisat i
05:38-artefakten (landade i trädet 01:04 < byggstart 05:17). v207 EFTERMÄTNINGEN får
ett INSTRUMENTFYND: prefetch syns ALDRIG i serverad HTML (next/link prefetchar i
runtime vid viewport) — HTML-mätning är fel instrument; kräver browser/motor-mätning.
Noterad baslinje: startsidans 19 script-buntar = 965 kB.

**FABRIKS_EMOTTAG:** s2–s4-familjens commits merge:ade hem (universum 322 via
s2-u2 KINA + s2-u3 EUROPA-UTILITIES + Veolia-industri; SEO-speglarna Ö28–Ö30 gruv/
rederi/kemiktier-EN). Deploy: bokföringspushen landar utan src-ändring — synken tar
trädet vid nästa gröna poll (fabrikens s4-manifest aktiv, VÄNTAR-FABRIK-sekvens).

**Verktyg:** _r325-familjen (ingrepp/truth), _r326-familjen (byggsond/deployvakt),
_r327-familjen (sond 1–8 + detta landa-skript) — 14 skript committade.
`);

// 3) PIPELINE-sektion
fs.appendFileSync(`${YTA}/data/forskning/PIPELINE-KO.md`, `

## ROND 327 [organ:Φ] (2026-09-29) — Q3-läckesutredning klar; v206 kvitterad i prod; v211 soft-404-kur bokad

| Våg | Innehåll | Status |
|---|---|---|
| v206 | PREFETCH-KUREN (27 tunga länkar, beed9f7d) | ✓ LEVERERAD I PROD r327 — koden bevisad i 05:38-artefakten (BUILD_ID 05:38:36, träd 7dad3195); prod 200 ×10 rutter; effektmätning överlämnad till v207 |
| v207 | PREFETCH-EFTERMÄTNING (1,35 MB-motorbuntar borta ur vanlig sidlast) | BOKAD — INSTRUMENTFYND r327: prefetch syns ej i serverad HTML (runtime-fenomen); kräver browser/motor-mätning (Browser Use eller prestanda-mätverktyg); baslinje: startsida 19 buntar/965 kB |
| v211 | SOFT-404-KUREN: framtida blogg-platser (idag 3 Q3-slugar × 3 språk) serveras HTTP 200 + 404-skal — .meta saknar status i Next 16.3.6; designen (platser vid byggtid för S2-autopublicering utan deploy) är RÄTT, statuskoden är felet | BOKAD — kur-alternativ: (a) middleware sätter 404 vid notFound-platser, (b) plats-exklusion + acceptera deploy-per-publicering (bryter S2), (c) Next-uppgraderingsutredning; beslut nästa dedikerade rond |
| v205 | NATTEMOTTAGET G2/G5 (7 spårkvitton 02:30–06:27 UTC) | PÅGÅR — fönstret löpt; kvitton läsas nästa rond (denna rond ägdes av läckesutredningen) |
`);

// 4) Beslutsminne
fs.appendFileSync(`${YTA}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
  ts: nu, rond: 327,
  beslut: "r327 Q3-läckesutredning: AKUT INNEHÅLLSLÄCKAGE TÄPPT i prod — 05:38-artefakten bär datumfiltret, kroppar = 404-skal utan innehåll (r325:s äkta-titel-mätning träffade gamla 03:07-artefakten); 86/86 publika 200, okända slug 404 äkta ×3 språk. Soft-404 (HTTP 200 på framtida platser) = kvarvarande godartad defekt bokad som v211. v206 prefetch-kur LEVERERAD I PROD (artefakt-bevisad). v207 kräver runtime-instrument.",
  landat: "denna commit (worklog r327 + PIPELINE v211-bokning + 14 verktygsskript)"
}) + '\n');

// 5) Commit + push
const msg = `studio: [organ:Φ] r327 Q3-LÄCKESROTSUTREDNING KLAR — godartad i prod: 05:38-artefakten (7dad3195) bär datumfiltret och serverar 404-skal utan innehåll för alla tre framtidsslugar (kropp 45,7 kB, noll Holmens-träffar; r325:s äkta-titel-mätning var 03:07-artefakten); 86/86 publika poster 200 + äkta titel; okända slugar ÄKTA 404 ×3 språk (våg 81-kur intakt i Next 16.3.6); KVARVARANDE DEFEKT bokad som v211: framtidsslugar = SOFT-404 (HTTP 200 + 404-skal, .meta utan status) — kur-alternativ i PIPELINE; v206 PREFETCH-KUREN LEVERERAD I PROD (beed9f7d bevisad i artefakten) + v207 INSTRUMENTFYND: prefetch mäts ej i serverad HTML, kräver runtime-mätning, baslinje startsida 19 buntar/965 kB; fabrikens s2–s4 merge:ade hem (universum 322, Ö28–Ö30); verktyg _r325/_r326/_r327-familjerna committade`;
fs.writeFileSync('/tmp/r327-commitmsg.txt', msg);
steg('git add', () => run('git add -A 2>&1'));
steg('commit (pre-commit tsc körs)', () => run('git commit -F /tmp/r327-commitmsg.txt 2>&1'));
steg('push prod develop', () => run('git push prod develop 2>&1'));
steg('verifiering', () => run('git log --oneline -1'));
console.log('\nKLAR r327');
