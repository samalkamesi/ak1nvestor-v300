# DR-KEDJA 3 2026-09-16 — serverfils-arkivet (AUTO)

Körd av `verktyg/dr-kedja3.mjs` (spår 10; manual: DR-PROV-2026-09-16-KEDJA3.md
— detta verktyg är §8:s kommandoradisering, kvartalsmallens fjärde steg).
Arkiv A: server-repo-2026-09-16.tar.gz · Arkiv B: server-git-2026-09-16.bundle.

| Moment | Resultat |
|---|---|
| Självsabotage (domkontraktet) | UNDERKÄNT — kontraktet grep ej allt |
| Arkiv A gzip-integritet (gzip -t) | nåddes ej |
| Arkiv A listning | nåddes ej |
| Exkluderingskontrakt | nåddes ej |
| RTO restore (tar -xzf) | nåddes ej |
| Antalskontrakt (listat == uppackat) | nåddes ej |
| src ts/tsx | nåddes ej filer · nåddes ej rader |
| Arkiv B bundle verify | nåddes ej |
| Arkiv B klon-test | nåddes ej |
| RTO klon | nåddes ej |
| Ancestor-bevis (klonHEAD ∈ trädets historia) | nåddes ej |
| Total RTO kedja 3 (restore + klon) | nåddes ej |
| PG-städning (vilolägeskontraktet) | PG17 nere vid ankomst och vid slut — korrekt viloläge (skrap-DB:er kan ej finnas i nere kluster) |
| Dom | RÖD (exit 1) |
| Städning /tmp | /tmp/dr-kedja3-1096656 raderad (restore + sabotage + klon + bv) |

Spot-diff mot levande trädet (RPO-visning):

- (nåddes ej)

Avbrottsorsak: sabotagekontraktet underkänt

SLUT — maskinellt genererat av dr-kedja3.mjs 2026-09-16T11:33:29.808Z
