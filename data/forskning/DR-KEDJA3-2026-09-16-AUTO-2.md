# DR-KEDJA 3 2026-09-16 — serverfils-arkivet (AUTO)

Körd av `verktyg/dr-kedja3.mjs` (spår 10; manual: DR-PROV-2026-09-16-KEDJA3.md
— detta verktyg är §8:s kommandoradisering, kvartalsmallens fjärde steg).
Arkiv A: server-repo-2026-09-16.tar.gz · Arkiv B: server-git-2026-09-16.bundle.

| Moment | Resultat |
|---|---|
| Självsabotage (domkontraktet) | 3/3 GRIPNA (kapad gzip · skräpfil · kapad bundle) |
| Arkiv A gzip-integritet (gzip -t) | GRÖN (gzip -t exit 0) |
| Arkiv A listning | GRÖN — 8435 poster (full listning exit 0) |
| Exkluderingskontrakt | GRÖN — 0 poster av de förbjudna (node_modules/.next/.git/tool-results/data-cache/data-backups) |
| RTO restore (tar -xzf) | 3.2 s |
| Antalskontrakt (listat == uppackat) | GRÖN — 7903 filer + 532 kataloger = 8435 == 8435 listade |
| src ts/tsx | 666 filer · 201 657 rader |
| Arkiv B bundle verify | GRÖN — The bundle contains these 10 refs: 59939c18ec9517c7a65a1833965bd1bdb006bfbf refs/heads/develop a1dda8888f1702ffe34f0c6433d98248840aca25 refs · NOTIS: verify är nödvändig men EJ tillräcklig (sabotage s3: kapad bundle godtas) — klon-testet nedan är huvuddomen |
| Arkiv B klon-test | GRÖN — 1 067 commits · klonad HEAD 59939c18 |
| RTO klon | 9.4 s |
| Ancestor-bevis (klonHEAD ∈ trädets historia) | GRÖN — klonens HEAD 59939c18 är föregångare till trädets HEAD (bundlen ≡ historikens delmängd) |
| Total RTO kedja 3 (restore + klon) | 3.2 s + 9.4 s (restore + klon; nätverksflytt till ny VPS tillkommer i verklig katastrof) |
| PG-städning (vilolägeskontraktet) | PG17 nere vid ankomst och vid slut — korrekt viloläge (skrap-DB:er kan ej finnas i nere kluster) |
| Dom | GRÖN (exit 0) |
| Städning /tmp | /tmp/dr-kedja3-1096836 raderad (restore + sabotage + klon + bv) |

Spot-diff mot levande trädet (RPO-visning):

- package.json: IDENTISK
- next.config.ts: IDENTISK
- data/DRIFTSBOKEN.md: SKILJER-FÖRKLARAD (trädets senaste commit 2026-09-16T07:35:24+02:00 > arkivets mtime 2026-09-15T22:45:20.792Z)
- src/lib/seo.tsx: IDENTISK

Avbrottsorsak: ingen

SLUT — maskinellt genererat av dr-kedja3.mjs 2026-09-16T11:35:04.769Z
