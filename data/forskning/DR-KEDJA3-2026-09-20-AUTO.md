# DR-KEDJA 3 2026-09-20 — serverfils-arkivet (AUTO)

Körd av `verktyg/dr-kedja3.mjs` (spår 10; manual: DR-PROV-2026-09-16-KEDJA3.md
— detta verktyg är §8:s kommandoradisering, kvartalsmallens fjärde steg).
Arkiv A: server-repo-2026-09-20.tar.gz · Arkiv B: server-git-2026-09-20.bundle.

| Moment | Resultat |
|---|---|
| Självsabotage (domkontraktet) | 3/3 GRIPNA (kapad gzip · skräpfil · kapad bundle) |
| Arkiv A gzip-integritet (gzip -t) | GRÖN (gzip -t exit 0) |
| Arkiv A listning | GRÖN — 13022 poster (full listning exit 0) |
| Exkluderingskontrakt | GRÖN — 0 poster av de förbjudna (node_modules/.next/.git/tool-results/data-cache/data-backups) |
| RTO restore (tar -xzf) | 6.1 s |
| Antalskontrakt (listat == uppackat) | GRÖN — 12211 filer + 811 kataloger = 13022 == 13022 listade |
| src ts/tsx | 726 filer · 221 230 rader |
| Arkiv B bundle verify | GRÖN — The bundle contains these 10 refs: e56a6953cb67587ac5f90a3343e397d5cdd4a094 refs/heads/develop a1dda8888f1702ffe34f0c6433d98248840aca25 refs · NOTIS: verify är nödvändig men EJ tillräcklig (sabotage s3: kapad bundle godtas) — klon-testet nedan är huvuddomen |
| Arkiv B klon-test | GRÖN — 1 922 commits · klonad HEAD e56a6953 |
| RTO klon | 17.1 s |
| Ancestor-bevis (klonHEAD ∈ trädets historia) | GRÖN — klonens HEAD e56a6953 är föregångare till trädets HEAD (bundlen ≡ historikens delmängd) |
| Total RTO kedja 3 (restore + klon) | 6.1 s + 17.1 s (restore + klon; nätverksflytt till ny VPS tillkommer i verklig katastrof) |
| PG-städning (vilolägeskontraktet) | PG17 nere vid ankomst och vid slut — korrekt viloläge (skrap-DB:er kan ej finnas i nere kluster) |
| Dom | GRÖN (exit 0) |
| Städning /tmp | /tmp/dr-kedja3-3428325 raderad (restore + sabotage + klon + bv) |

Spot-diff mot levande trädet (RPO-visning):

- package.json: SKILJER-FÖRKLARAD (trädets senaste commit 2026-09-20T05:42:33+02:00 > arkivets mtime 2026-09-20T01:20:33.546Z)
- next.config.ts: SKILJER-FÖRKLARAD (trädets senaste commit 2026-09-20T05:18:07+02:00 > arkivets mtime 2026-09-20T01:20:33.546Z)
- data/DRIFTSBOKEN.md: SKILJER-FÖRKLARAD (trädets senaste commit 2026-09-20T06:43:21+02:00 > arkivets mtime 2026-09-20T01:20:33.546Z)
- src/lib/seo.tsx: IDENTISK

Avbrottsorsak: ingen

SLUT — maskinellt genererat av dr-kedja3.mjs 2026-09-20T04:44:28.870Z
