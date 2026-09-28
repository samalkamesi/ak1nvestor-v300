# DR-APPDUMP SSD NODES 2026-09-28 — app-kedjans barhet på nya servern: pg17-död kurerad, jungfruappblad, APP-BLADETS FÖRSTA RESTORE

**Agent:** s10-u2 (vakt 2/3, manifest auto-s10-1790634304502) · **Fönster:**
2026-09-28 22:30–22:52 UTC · **Dom: GODKÄNT** (exit 0 genom hela kedjan).
Anspråk disk-först med prediktioner låsta FÖRE mätning:
`data/vakten/s10u2-appkedja-ssdnodes-2026-09-28-ansprak.md`.

## VAL (duplikatkontroll klar före ingrepp)

Restore-kärnan (kedja 1) är levererad otaliga gånger — inklusive IDAG:
05:44-jungfrukörningen (db-cutover-test, RTO 83,7 s) + s10-u1:s
kvällsreplik 22:40 (RTO 70,0 s, determinismens sjätte par). Ännu en
db-bladsrestore = slöseri (s10-u1:s F1-regel 2026-09-24). Det
OLEVERERADE i spåret: **app-kedjan (aufr-projektet) hade ALDRIG körts
på SSD Nodes** — inget app-blad fanns på servern, dump-skriptet hade
aldrig körts här (/tmp/supabase-appdump.log saknades), och inget
app-blad var restore-bevisat på userspace-PG18. Tre delobjekt i ett
fönster: rotfynd+kur, jungfrukörning, första app-restore.

## F1 — ROTFYND: PG17-döden (vakt-kärnan, negativprov bevisat)

`verktyg/dumpa-app-db.sh` (crontab 02:50 varje natt) hårdkodade
`PG_DUMP=/usr/lib/postgresql/17/bin/pg_dump`. SSD Nodes (v190-bytet)
har ENBART postgresql-client-18 — v193 (r288) kurade rot-mönstret för
dr-ovning.mjs men skriptet glömdes. **Negativprov 22:31 (odestruktivt,
skriptets egen .part-radering fångade det):** exit 1 på 0 s,
`/tmp/supabase-appdump.err.log`: `line 73: /usr/lib/postgresql/17/bin/
pg_dump: No such file or directory`, kedjan orörd. Utan kur: första
cron-natten (inatt 02:50 UTC) hade dumpat INGET app-blad — aufr-projektet
oskyddat, tyst exit 1 i /tmp. **Kur (commit 2471c406 + återföring
bbcb3343, se F3):** detekterar nyaste klienten (18 först, 17-fallback
för Contabo-reservens träd) + explicit vakt när ingen hittas.

## JUNGRUKÖRNINGEN — kedjans första blad på SSD Nodes (22:32–22:36)

`bash verktyg/dumpa-app-db.sh` → **exit 0**: pg_dump **18.6** valdes
automatiskt (markörkollens egen utskrift) · `db-app-2026-09-28.sql.gz`
**89 717 367 B (85,6 MB) på 169 s** · markör **GRÖN 2 309 297 rader ·
CREATE TABLE 418 · COPY 420** — tabellkontraktet IDENTISKT med
Contabo-seriens sista (09-24: 418/420) · retention 0 raderade
(fönstret 1 blad brett: app-historiken 09-21→09-27 dog med Contabo —
offsite-arkivet äger den; fynd värt nästa kvartals runbook).

## F2 — ROTFYND: DR-dumpkontrollens 120 s-gräns dödade GRÖNA blad

Första restore-försöket 22:37 dog i [1/7]: `DUMPEN UNDERKÄND` trots
markör-GRÖN 2 minuter tidigare. Rot: `dr-ovning-ssdnodes.mjs` rad 209
`satt timeoutMs 120000 EXPLICIT — spawnSync-timeout ⇒ SIGTERM ⇒ status
null ⇒ "underkänd" = FALSK NEGATIV. Mätt: markörkollen på 85,6 MB-bladet
= 87,0 s rent (time 22:39) men 146,4 s under full fabrikslast
(load ~5) — gränsen sprängd i produktionstrafik. Jungfrukörningen 05:44
märkte inget (36,8 MB-blad ≈ 40 s). **Kur: 120 000 → 300 000 i BÅDA
syskonen** (dr-ovning-ssdnodes.mjs rad 209 + dr-ovning.mjs rad 219 —
identisk latent rad; Contabo-kvartalet ≤2026-12 hade dött samma död
med app-blad i fel lastfas). Paritet med sql()-mätningens 300 000.
**Skarpt bevis: den GRÖNA körningens egen dumpkontroll tog 146,4 s —
över gamla gränsen; kuren var nödvändig, inte kosmetisk.** PG var orörd
vid underkännandet (vägran före PG-start — kontraktet höll).
Aborterat försök ärligt kvarlämnat: DR-PROV-2026-09-28-SSDNODES-AUTO-8.md.

## F3 — CLOBBER-KOLLISION (noll förlorat bevis, mönster nr 9 i spåret)

Syskonens commit-fönster 22:40:09/22:40:49 (ff5ae912 DR-replik,
787e1199 offsite-kur) skrev över min okommittade dumpa-app-db.sh-kur på
disk; min `git add` 22:44 fångade HEAD-identiskt innehåll = 0 diff =
filen saknades i 2471c406 ("2 files changed"). Beviset levde i
loggarna (negativprov 22:31 + jungfrukörning 22:32–22:36 GRÖN med
kuren på disk). **Återföring rad-för-rad + bash -n + OMEDELBAR commit
bbcb3343, verifierad i HEAD via git show** (clobber-kurens mönster;
s10-u2 O2-lärdomen: innehållets leverans är det som räknas — denna
gång också i trädet). Lärdom bekräftad: i 3-parallella manifest är
verktygsfilernas commitfönster sekundsnårt — commit FÖRE nästa körning.

## DR-ÖVNINGEN — APP-BLADETS FÖRSTA RESTORE PÅ SSD NODES (22:46–22:52)

`node verktyg/dr-ovning-ssdnodes.mjs --fil data/backups/supabase/
db-app-2026-09-28.sql.gz` → **exit 0** (protokoll
DR-PROV-2026-09-28-SSDNODES-AUTO-9.md):

| Kontrakt | Värde | Contabo-referens (09-24) |
|---|---|---|
| Dumpkontroll | GRÖN 146,4 s (2 309 297/418/420) | — |
| RTO restore | **210,1 s** | 93,8 s (2,2× — fasfaktorn) |
| public | **372 tabeller / 201 683 rader** | 372 / 188 736 |
| public+storage | 380 / 203 033 | — |
| alla scheman | 417 / 204 885 | — |
| felrader | **3 307 kända / 0 okända** | 2 611 / 0 |

APP-KEDJAN ÄR DÄRMED BEVISAD ÄNDA TILL ÄNDA PÅ SSD NODES: cron-skript
→ pg_dump 18 → markör → blad → restore → tremätmätning → protokoll.

## PREDIKTIONSDOM (8 poster, låsta före mätning)

P1 ✓ EXAKT (negativprov exit 1, kedjan orörd) · P2 ✓ EXAKT (pg_dump
18 · 89,7 MB ∈ [88,100] · 169 s ∈ [90,300]) · P3 ✓ (GRÖN · 418/420
EXAKT som 09-24 · 2 309 297 ∈ [2 295 000, 2 340 000]) · P4 tabell
372 EXAKT men rader 201 683 ∉ [188 700, 195 000] = **MISS med rot**:
aufr-tillväxten saknade modell — första punkterna nu: 188 736 (09-24)
→ 201 683 (09-28) = **+3 237 rader/dag** (nästa app-pass: band
[201 600, 205 600] för 10-02) · P5 RTO 210,1 ∉ [60,140] = MISS med
rot: fabrikens egen 3-parallella last (fasfaktorn, s10-u1:s F1-regel
belagd på SSD Nodes: RTO för protokoll mäts i tom fabrik; s10-u1:s
70,0 s samma kväll på 36,8 MB × 2,3 datamängd ≈ 161 s i lugnare fas)
· P6 ✓ (3 307 ∈ [2 000, 3 500] · 0 okända) · P7 ✓ (oberoende
eftermätning: pg_isready no response exit 2 · 0 PG-processer · flock
ledig) · P8 ✓ (retention 0). Dom: 6/8 + 2 rotförklarade missar.

## STÄDNING LOKAL PG (oberoende eftermätt 22:5x)

Skrap-DB raderad (verktyget [7/7] + PG nere gör DB:n onåbar) ·
userspace-PG18 STOPPAD (`pg_isready -h 127.0.0.1 -p 55432` → no
response, exit 2; ps utan postgres-processer; port 5432 orörd hela
fönstret) · DR-låset släppt (flock-ledig) · fellogg bevarad
/tmp/dr-ovning-fel-blad-app-2026-09-28-p521730-*.log · kedjan 2 blad
orörda (app + cutover-test).

## KVD

Endast verktyg/ + data/ berörda = **INGET bygge** (tsc-baslinjen
orörd; pre-commit-grinden verifierade 2471c406 + bbcb3343; node
--check ×2 + bash -n GRÖN) · src/ orörd · **R2 orörd** (.env* läses
ENDAST av skriptet självt vid körning — dess design sedan 09-20;
lösenord aldrig loggat; inga priser/tier/publicering) · data/blogg/
orörd · crontab RÖRS EJ (kuren sitter i skriptet) ⇒ crontab.reference
orörd · syskonytor orörda (deras commits ff5ae912/787e1199 lästa,
deras sektioner deras ägo) · GDPR: endast antal/tabellnamn/tider.

## KÖ (till nästa våg/rond)

1. **Jungfrunatten 02:50 UTC inatt (29/9)**: crontabens första
   app-dump på SSD Nodes — kvittas i /tmp/supabase-appdump.log
   (v166 G2:s diskriminerande test 02:30–06:27 UTC gäller alla kedjor;
   app-kedjan är nu KURAD och klar).
2. App-tillväxtmodell aufr: +3 237/dag (ovan) — sätt band vid nästa
   app-pass; rkaq-modellen (+19 800/dag) gäller ej över projekt.
3. App-bladshistoriken (09-21→09-27) lever endast i offsite-arkivet —
   överförs vid behov (DR-runbook: fönstret på nya servern är 1 blad).
4. RTO-fasfaktorn på SSD Nodes: 210,1 s under 3-parallell fabrik —
   kvartalsmätning i TOM fabrik (F1-regeln, femte belägg).

LEVERANS: verktyg/dumpa-app-db.sh (kur) · verktyg/dr-ovning-ssdnodes.mjs
+ verktyg/dr-ovning.mjs (timeout-kur) · data/forskning/
DR-APPDUMP-SSDNODES-2026-09-28.md · DR-PROV-2026-09-28-SSDNODES-AUTO-8.md
(aborterat, ärligt) · DR-PROV-2026-09-28-SSDNODES-AUTO-9.md (verktygets)
· DRIFTSBOKEN + worklog (sektioner).
