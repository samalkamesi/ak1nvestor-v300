# DR-KEDJA 3 2026-09-17 — serverfils-arkivet (AUTO)

Körd av `verktyg/dr-kedja3.mjs` (spår 10; manual: DR-PROV-2026-09-16-KEDJA3.md
— detta verktyg är §8:s kommandoradisering, kvartalsmallens fjärde steg).
Arkiv A: server-repo-2026-09-16.tar.gz · Arkiv B: server-git-2026-09-16.bundle.

| Moment | Resultat |
|---|---|
| Självsabotage (domkontraktet) | 3/3 GRIPNA (kapad gzip · skräpfil · kapad bundle) |
| Arkiv A gzip-integritet (gzip -t) | GRÖN (gzip -t exit 0) |
| Arkiv A listning | GRÖN — 8892 poster (full listning exit 0) |
| Exkluderingskontrakt | GRÖN — 0 poster av de förbjudna (node_modules/.next/.git/tool-results/data-cache/data-backups) |
| RTO restore (tar -xzf) | 3.7 s |
| Antalskontrakt (listat == uppackat) | GRÖN — 8322 filer + 570 kataloger = 8892 == 8892 listade |
| src ts/tsx | 675 filer · 203 930 rader |
| Arkiv B bundle verify | GRÖN — The bundle contains these 10 refs: 42bce928621e2efc1789c0e2fec8002cd8fa18a3 refs/heads/develop a1dda8888f1702ffe34f0c6433d98248840aca25 refs · NOTIS: verify är nödvändig men EJ tillräcklig (sabotage s3: kapad bundle godtas) — klon-testet nedan är huvuddomen |
| Arkiv B klon-test | GRÖN — 1 195 commits · klonad HEAD 42bce928 |
| RTO klon | 9.4 s |
| Ancestor-bevis (klonHEAD ∈ trädets historia) | GRÖN — klonens HEAD 42bce928 är föregångare till trädets HEAD (bundlen ≡ historikens delmängd) |
| Total RTO kedja 3 (restore + klon) | 3.7 s + 9.4 s (restore + klon; nätverksflytt till ny VPS tillkommer i verklig katastrof) |
| PG-städning (vilolägeskontraktet) | PG17 nere vid ankomst och vid slut — korrekt viloläge (skrap-DB:er kan ej finnas i nere kluster) |
| Dom | GRÖN (exit 0) |
| Städning /tmp | /tmp/dr-kedja3-1737281 raderad (restore + sabotage + klon + bv) |

Spot-diff mot levande trädet (RPO-visning):

- package.json: SKILJER-FÖRKLARAD (trädets senaste commit 2026-09-17T20:30:22+02:00 > arkivets mtime 2026-09-16T11:40:13.453Z)
- next.config.ts: IDENTISK
- data/DRIFTSBOKEN.md: SKILJER-FÖRKLARAD (trädets senaste commit 2026-09-17T21:13:35+02:00 > arkivets mtime 2026-09-16T11:40:13.453Z)
- src/lib/seo.tsx: IDENTISK

Avbrottsorsak: ingen

SLUT — maskinellt genererat av dr-kedja3.mjs 2026-09-17T19:16:15.563Z
