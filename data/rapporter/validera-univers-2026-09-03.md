# Validering — bolagsuniversum (fundamentaldata)

- **Datum:** 2026-09-03
- **Källa:** `data/portfolj-system/bolagsunivers.json` + `data/cache/fundamental-*.json`
- **Kontrakt:** `src/lib/portfolj-forskning/typer.ts` (BolagsNyckeltal)
- **Resultat:** 100 poster — **0 schemafel**, 0 varningar
- **Total null-andel (nyckeltalsfält):** 39.0% — null är ärlig avsaknad, aldrig gissning

## Översikt per bransch

| Bransch | Bolag | Med serier | ≥2 källor | Avvikelsemarkeringar |
|---|---:|---:|---:|---:|
| teknik | 10 | 9 | 10 | 1 |
| industri | 10 | 9 | 10 | 0 |
| halso | 10 | 10 | 10 | 0 |
| konsument | 10 | 9 | 10 | 1 |
| fastighet | 10 | 9 | 10 | 0 |
| finans | 10 | 7 | 10 | 1 |
| material | 10 | 10 | 10 | 0 |
| energi | 10 | 10 | 10 | 1 |
| kommunikation | 10 | 10 | 10 | 0 |
| tillvaxt | 10 | 10 | 10 | 0 |

## Null-andel per fält

| Fält | Null | Andel |
|---|---:|---:|
| `stabilitet.rantaTackning` | 100/100 | 100% |
| `stabilitet.fcfPositivaSenaste5` | 100/100 | 100% |
| `stabilitet.nyemissionerSenaste5ar` | 100/100 | 100% |
| `aterkop.senasteArMdr` | 100/100 | 100% |
| `aterkop.andelUtestande` | 100/100 | 100% |
| `moat.bruttoMarginalMedel5ar` | 100/100 | 100% |
| `moat.bruttoMarginalSpread5ar` | 100/100 | 100% |
| `moat.roeMedel5ar` | 100/100 | 100% |
| `stabilitet.kassaManaderBurnRate` | 96/100 | 96% |
| `golv.vardePerAktie` | 90/100 | 90% |
| `golv.marginal` | 90/100 | 90% |
| `tillvaxt.resultatCAGR5ar` | 30/100 | 30% |
| `lonksamhet.roic` | 16/100 | 16% |
| `vardering.fcfYield` | 13/100 | 13% |
| `stabilitet.skuldEgenkapital` | 12/100 | 12% |
| `vardering.peg` | 12/100 | 12% |
| `tillvaxt.omsattningCAGR5ar` | 9/100 | 9% |
| `lonksamhet.fcfMarginal` | 8/100 | 8% |
| `vardering.pe` | 8/100 | 8% |
| `tillvaxt.prognosTillvaxt` | 7/100 | 7% |
| `marknadsKapitalMdr` | 6/100 | 6% |
| `vardering.evEbit` | 5/100 | 5% |
| `lonksamhet.roe` | 3/100 | 3% |
| `vardering.pb` | 2/100 | 2% |
| `vardering.egenKapitalMultipl` | 2/100 | 2% |
| `pris` | 0/100 | 0% |
| `tillvaxt.omsattningTillvaxtTTM` | 0/100 | 0% |
| `lonksamhet.bruttoMarginal` | 0/100 | 0% |
| `lonksamhet.ebitMarginal` | 0/100 | 0% |
| `lonksamhet.nettoMarginal` | 0/100 | 0% |
| `aterkop.insiderkopSenaste6man` | 0/100 | 0% |

## Schemafel

Inga — alla poster följer kontraktet.

## Avvikelser mellan källor (>15 %)

- **GOOGL**: AVVIKELSE>15% marknadsvärde: Yahoo 4123 vs MarketStack 1978 (52%)
- **NKE**: AVVIKELSE>15% marknadsvärde: Yahoo 56.73 vs MarketStack 45.97 (19%)
- **BRK-B**: AVVIKELSE>15% marknadsvärde: Yahoo 1082 vs MarketStack 711.4 (34%)
- **EQNR.OL**: AVVIKELSE>15% pris: Yahoo 401.2 vs MarketStack 44.23 (89%)
- **EQNR.OL**: AVVIKELSE>15% P/E: Yahoo 11.63 vs MarketStack 1.282 (89%)
- **EQNR.OL**: AVVIKELSE>15% P/B: Yahoo 2.422 vs MarketStack 0.267 (89%)
- **EQNR.OL**: AVVIKELSE>15% marknadsvärde: Yahoo 952.2 vs MarketStack 105 (89%)

## Kända begränsningar (sammanfattning)

- Yahoo ger 4 räkenskapsårs resultaträkningshistorik (ej 5) — CAGR noteras per post.
- Balansräknings-/kassaflödeshistorik är tömd hos Yahoo — NCAV, FCF-serier, ROE-medel och räntetäckning blir null.
- MarketStack fundamentals-endpoint ej tillgänglig på aktuell plan (HTTP 404) — källa B validerar endast pris/PE/PB/marknadsvärde.
- MarketStack saknar färska kurser för de flesta icke-USA-börser — dubbelkoll främst för USA-bolag.
- Återköpsbelopp och aktieantalshistorik saknas hos båda källorna — aterkop.senasteArMdr/andelUtestande null.

---
*AK1A Research Lab — pedagogisk forskning. ALDRIG investeringsråd.*
