# o92 — Mimosa full-scan ÅTERMÄTNING 2026-09-19 (våg 205, spår 8: kvalitet & säkerhet)

**Uppdrag:** våg 178:s bokade kvarleverans — "906/0 = ny full-scan-referensbas;
återmät efter vågor som tillför filer utanför src/". Sedan 2026-09-16 har
flera vågor ändrat trädet (r87 godkannande-kur, r89 Fas 2-integration,
r91 CTA-vågen, r92 Fas 3-statusrutan, fabriksbarnens o78–o91-prestandakurer,
s5-kursvågorna mt-07/vr-07/pe-05 + 446 kurser i JSON). Återmätningen
verifierar att ingen ohärdad fyndklass smugit sig in.

**Metod:** `node verktyg/mimosa-paritet.mjs --json data/forskning/OPTIMERING/
fullscan-atermat-2026-09-19.json` — standarddomänen (src/ + data/infra/),
samma fyndklasser och förmildran som v178-referensen (v1.4:
konstant-propagering, vittnesfönster ±8 rader).

## Resultat

| Mått | v178-referens (09-16) | Återmätning (09-19) |
|---|---|---|
| Skannade filer | 906 | **725** |
| Ohärdade fynd | 0 | **0 — GRÖN** |
| SSRF_INTERPOLERAD_FETCH | — | 80 träffar, **80 härdade kontexter** |
| PATH_API | — | 1 träff, **1 härdad kontext** |
| SHELL_URL_LOOPBACK (info) | — | 1 |
| SSRF_EXTERN_LITERAL (info) | — | 5 |

**Fildeltat (906 → 725):** standarddomänens filuppsättning har minskat genom
städa/sync-omgångar sedan 09-16 (bland annat flyttade/rensade infrafilnamn
vid prod-synkens omorganisationer); inga domäntillägg har gjorts — domänen
är oförändrad src/ + data/infra/, varför jämförbarheten håller (samma
skanner, samma klasser, samma förmildran).

## Dom

**GRÖN — 0 ohärdade fynd.** Återmätningsbasen är nu **725/0 (2026-09-19)**;
nästa återmätning bokas när vågor åter tillför filer utanför src/ eller
rör data/infra/. Rådata: `fullscan-atermat-2026-09-19.json` (samma katalog).

*Skannern är kompensation för kundens Mimosa-hook (speglad till .mimosa/,
sista äkta körning 2026-09-10) — deterministisk paritet på serverträdet.*
