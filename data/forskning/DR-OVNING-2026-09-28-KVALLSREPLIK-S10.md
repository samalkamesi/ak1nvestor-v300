# DR-ÖVNING 2026-09-28 KVÄLL — OBEROENDE REPLIK av v193 (determinismens sjätte par)

**Fabriksagent:** s10-u1 (manifest auto-s10-1790634304502, vakt 1/3)
**Verktyg:** `node verktyg/dr-ovning-ssdnodes.mjs` — OMODIFIERAT (trädets kanon, v193/r288)
**Kört:** 2026-09-28 22:32–22:36 lokal (UTC) · kvällsfas (fabrikens omgång + kund aktiv i studion)

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi återställde **hela databasen från backup en andra gång, oberoende av nattens prov**:
   **70,0 sekunder** — testdatabasen raderades efteråt, produktionen påverkades inte.
2. **Alla tal kom tillbaka EXAKT likadana** som vid nattens prov — ned till sista raden i
   varje tabell. Detta bevisar att katastrofåterställningen är **förutsägbar** på nya servern.
3. Nattens prov tog 83,7 s i tyst fas; kvällens tog 70,0 s mitt i drift — nya serverns
   minne (62 GB) håller hela återställningen i arbetsminnet, kvällen är inte långsammare.
4. Offsite-paketet (som skickas ut från servern vid katastrof) öppnades och räknades för
   första gången på nya servern: 2 075 poster — tråden, kunskapen och sessions-databasen.
5. Natten till 29/9 är nästa stora test: serverns tre backuptider (02:30, 02:40, 02:50)
   kör för första gången på nya servern.

## 2. Replikdomen — v193 (natt 05:47) vs denna (kväll 22:32)

Samma dump (SHA-256 `fad417f6…` identisk före/efter — ENDAST LÄST bevisat, mtime 02:52:17 orörd),
samma verktyg, samma userspace-PG18:

| Kontrakt | v193 AUTO-6 (natt) | Denna AUTO-7 (kväll) | Dom |
|---|---|---|---|
| Markörkontroll | GRÖN · 1 526 960 rader | GRÖN · 1 526 960 rader | **EXAKT** |
| RTO (restore) | 83,7 s | **70,0 s** | se §3 |
| public | 60 tabeller / 1 504 250 rader | 60 / 1 504 250 | **EXAKT** |
| public + storage | 68 / 1 504 386 | 68 / 1 504 386 | **EXAKT** |
| alla scheman | 99 / 1 504 646 | 99 / 1 504 646 | **EXAKT** |
| board_decisions | 56 330 | 56 330 | **EXAKT** |
| section_data_snapshots | 1 404 276 | 1 404 276 | **EXAKT** |
| Felrader | 1 077 kända / 0 okända | 1 077 kända / 0 okända | **EXAKT** |
| Städning | skrap-DB raderad · PG stoppad | skrap-DB raderad · PG stoppad | **EXAKT** (även oberoende eftermätt) |

**Slutdom: GRÖN — determinismens sjätte replikpar i serien** (09-15 ×2, 09-21 ×2,
09-24 ×2 — alla Contabo/PG17; detta är det FÖRSTA paret på SSD Nodes/userspace-PG18):
verktyget och databasens återställningsdeterminism överlevde serverbytet helt.

## 3. RTO — fasfaktorn som försvann

| Miljö | Fas | RTO |
|---|---|---|
| Contabo (8 kärnor, 8→62 GB) | natt (tom fabrik) | 11,8–17,7 s |
| Contabo | kväll (3 fabriksbarn) | 34–105 s (3–6,6×) |
| SSD Nodes (v193) | natt/förmiddag 05:47 | 83,7 s |
| **SSD Nodes (denna)** | **kväll 22:32, fabrik + kund aktiv** | **70,0 s (0,84×)** |

Contabo-erans kvällsfaktor 3–6,6× håller INTE på nya servern: kvällen var snabbare än
natten. Rimlig rot: 62 GB RAM ger djup page-cache (dumpen + indexbibliotek + PG-buffert
ryms), och 4 kärnor Xeon hann med strömmen trots last. Konsekvens för DRIFTSBOKEN:
**F1-regeln (kvartalsövning i tom fabrik) behålls som försiktighet men RTO-budgeten på
nya servern är ~70–85 s i BÅDA faserna** — två punkter, serien följs vid Q4-övningen.

## 4. Sido: offsite-länkens första räkenskap på nya servern

- Arkiv: `data/backups/offsite/ak1a-offsite-2026-09-28.tar.gz.tar.gz` — 221 935 840 byte,
  färdigskrivet 20:55 lokal; **läsbar gzip-tar, ENDAST LÄST** (tar -tzf).
- Innehåll: **2 075 poster, samtliga under `data/`** — vakten (huvudtrad, mål-state,
  audit- och uppdragsloggar), hela data/forskning (alla DR-protokoll) — och
  **`data/backups/db-snapshot.sqlite`** (2,4 GB rå ≈ 11:1 komprimerad).
- Skapare: `verktyg/backup-offsite.mjs`, ropad av pumpor-daemonen (svit finns:
  testa-backup-offsite.mjs). **Dubbelsuffixet `.tar.gz.tar.gz` är MEDVETET** — källan
  dokumenterar att det bevaras för arkivkompatibilitet, rensningsfiltret och kundens
  nedladdningar (rad 52–53). Avförd som bugg; inget att kurera.
- `db-snapshot.sqlite` är en känd par-artefakt till offsite-arkivet (Contabo-eran:
  1,6 GB vid R121; nu 2,4 GB) — stabil på disk (inga öppna fd:s), skapad 20:53 strax
  före arkivet. Sessions-databasens restore-väg är sedemera testad (R121-klassen,
  RTO 23,8 s på Contabo); djupverifiering på SSD Nodes = öppen köpost (ej denna våg —
  försiktighetsregeln: ingen påvisad ägare vid ankomst).
- **Notis arkitekturen:** db-DUMPARNA (db-*.sql.gz) ingår EJ i offsite-arkivet — deras
  offsite-skydd bärs av datorns valv (hybrid-sync) medan Supabase-molnet är primärkälla.
  Befintlig kontraktssituation (DRIFTSBOKEN §4), ingen förändring; noteras för att
  kvartalsdomen ska veta vilka tre lager som finns: moln (primär) · server-dumpar
  (RPO-minskare) · offsite-arkiv (tråd + sessions-DB).

## 5. Prediktionstämmning: 10/10

P1 markör 1 526 960 EXAKT · P2 RTO 70,0 ∈ [40,200] · P3–P5 tre-nivåradkontrakt EXAKTA ·
P6 board/snapshots EXAKTA · P7 fel 1 077/0 EXAKT · P8 städning grön med oberoende eftermät
(`pg_isready -p 55432` → no response, exit 2) · P9 protokollfil AUTO-7 EXAKT ·
P10 offsite läsbar + namnfyndet löst (medvetet kontrakt, ej bugg).

## 6. KVD + kö

- KVD: src/ orörd = INGET bygge · verktyg KÖRT omodifierat · R2 orörd · data/blogg/ orörd ·
  data/backups ENDAST LÄST (SHA+mtime bevis) · prod (Supabase) RÖRD ALDRIG · GDPR endast
  antal/tabellnamn/tider · syskonytor orörda (revir i anspråket: app-blad/moln-JSON/RPO
  lämnade till u2/u3).
- **Kö:** (1) natten till 09-29: G2-kvittona — 02:30 db-dump, 02:40 moln-JSON, 02:50
  app-dump kör FÖRSTA gången på nya servern (fel-kandidater: pg_dump 18-sökväg, .pgpass,
  644-bits-läxan o561) — nästa DR-pass bevisar blad 15 + app-blad + moln-JSON restore.
  (2) Q4-kvartalsövning (fönster 10-01→12-31, kör tidigt, F1: tom fabrik som försiktighet).
  (3) db-snapshot.sqlite-djupverifiering på SSD Nodes (sqlite-integritet + restore-RTO).
  (4) RTO-serien på SSD Nodes: tredje punkten vid Q4.

SLUT — s10-u1 2026-09-28
