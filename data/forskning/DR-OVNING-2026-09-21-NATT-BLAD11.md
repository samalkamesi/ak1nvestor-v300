# DR-ÖVNING 2026-09-21 NATT — BLAD 11:S FÖDELSEBEVIS + KURENS FÖRSTA NATT (spår 10, s10-u3, vakt 3/3)

**Manifest:** auto-s10-1789948522392 · **Agent:** s10-u3 · **Fönster:** 02:00–03:0x lokal.
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader, protokoll,
städa lokal PG." Anspråk disk-först 02:02 med P1–P12 låsta FÖRE mätning
(data/vakten/auto-s10-1789948522392-s10-u3-ansprak.md).

## 1. Valet och nattens kollisionskarta

Alla tre vakter i omgången startade 01:55; duplikatkontroll + anspråkskoll gav:
u1 tog NATTFAS-punkten (blad 10, femte restore — RTO 13,7 s, AUTO, commit
b4f0ee21); u2 pivoterade RPO-nattpunkt efter grindnek (commit 989ff63a).
**Mitt objekt: nattfönstrets FÖDSLAR** — blad 11 (02:30), moln-JSON (02:40),
kurens första crontab-appdump (02:50) + retention. En fjärde part (en tidigare
s10-u3-instans, commit eae53f72) anlände 02:3x, såg min wrapper LEVANDE
(faser C/D/E väntade), lämnade mina ytor orörda och pivoterade till
åldrings-restore på gårdagens app-blad — D25 hanterat av dem, bekräftat av mig:
inga av mina filer rördes, deras AUTO-3/AUTO-4 är deras.

## 2. RPO-före-punkten (02:0x–02:1x — delad med u2, redovisad öppet)

u2 och jag körde båda `dr-rpo-diff.mjs` mot blad 10 inom samma kvarts med
**identiska värden** (board 50 866 · snapshots 1 271 388 · organ 3 120 ·
totalt +19 784 @ 1 365 503 levande) — en omedveten dubbelmätning som blev
intra-kvarts-stillaståndets återiga korsbevis. JSON-filen (deras namnval,
DR-RPO-DIFF-2026-09-21-NATT.json) committades av dem (989ff63a); mina värden
ovan är densamma mätning. Ärlighetsnot: min körning skedde utan egna för-
registrerade RPO-band (u2:s läxa samma natt — pivot/extra-mätning kräver nya
låsta band; mina P1–P12 täckte ej RPO-punkten).

## 3. BLAD 11:S FÖDELSEBEVIS (02:30 — formelns SJUNDE test, sjunde träffen)

Född db-2026-09-21.sql.gz 33 569 773 B · slutmarkör GRÖN
(kolla-dump-markorer, 5,5 s): **1 387 527 rader · CREATE 99 · COPY 101**.

Restore (dr-ovning.mjs, flock + grind 6 443 MB): **RTO 11,8 s** ·
**public 60/1 365 519** · +storage 68/1 365 655 · alla 99/1 365 915 ·
fel **788 kända/0 okända** · städning grön. Protokoll: AUTO-2 (maskinellt).

| Nyckeltabell | Blad 10 | Blad 11 | Steg |
|---|---|---|---|
| board_decisions | 50 114 | **50 882** | **+768 = 8×96 EXAKT** |
| section_data_snapshots | 1 252 404 | **1 271 388** | **+18 984 (pumpens dygnsbatch)** |
| organ_health_logs | 3 072 | **3 120** | +48 |
| public totalt | 1 345 719 | **1 365 519** | **+19 800 EXAKT — modala dagsteget TREDJE dagen i rad** |

**FYND F1 — pumpens landningsfönster är BREDT:** blad 10 landade batchen
04:39–10:40; inatt hade den landat FÖRE 02:12 (min levande punkt) — dvs blad
11 bakade in dagens batch redan vid födelsen. Batchstorleken deterministisk
(+18 984, dag 4), landningstiden ej (fönster ≈ [natt, 10:40]). Köposten
"landningstidsvarians" får sitt andra belägg.

## 4. Kedja-2 (02:40) — u2:a:s dubbelprognos stängd på header-vägen

system-events-full-2026-09-21.json.gz 27 898 867 B · header
**170 979 · totaltFranApi 170 979 · truncerad false** (mäter faktiskt 02:40:40).
Mitt band [170 600, 171 100] ✅; u2:a:s snävare [170 950, 171 250] ✅ (punkten
171 080 −101). Dagssteg **+2 283** ∈ prognos [1 900, 2 400] ✅.
**Översättnings-stillastående dag 4: 146 190 EXAKT** (oförändrad sedan 09-17;
domens deadline "två veckor" = 10-01 lever vidare).

## 5. KURENS ELDPORV — första AUTOMATISKA appdumpen (02:50) HELA vägen grön

Crashkortet: crontab "50 2 * * *" startade **02:50:01** (loggrad) →
db-app-2026-09-21.sql.gz 88 343 929 B (84,2 MB) klar **02:52:26** →
slutmarkör GRÖN (21,3 s) → **retention körd: 0 blad över 30 dygn raderade**.
Kvittot på s10-u3:s (09-20) DUBBELPROJEKT-kur: appens RPO-gap ~2 400 r/dygn
är mekaniskt stängt från i natt — exponeringen är nu ≤ 24 h per konstruktion.

**Restore ×3 på bladet (tre instrument, samma kontrakt):**

| Körning | Instrument | RTO | Radkontrakt | Dom |
|---|---|---|---|---|
| 1 (AUTO-5) | dr-ovning.mjs (okurerad) | 19,8 s | mätningen RÖT — `public.analytiska sidan` | restore grön, mätning saknad |
| 2 | /tmp citerad kontraktsmätning | — | **372/183 326 · 380/184 671 · 417/186 499** | GRÖN |
| 3 (AUTO-6) | dr-ovning.mjs EFTER kur i trädet | 22,6 s | **372/183 326 · identiskt** · 2 611/0 | **GRÖN** |

Nyckeltabeller (körning 2/3): **system_events 170 980** · user_activities
6 460 · auth.users 45 · members 3 · profiles 11 · board 77 (stilla, dag 3) ·
ai_generated_courses 154 · courses 3.

**FYND F2 — kedjekors med 1 rads precision:** app-bladets 170 980 = moln-JSON:ns
170 979 **+1** — exakt gapet 02:40→02:50. Appens dump-kedja är varje natt
FRÄSCHARE än moln-JSON; de två kedjorna är nu kolonner i samma skyddsmatris.

**FYND F3 — kuren bars in i TRÄDET (min komplettering av deras rotfynd):**
åldrings-agentens commit (eae53f72) påstod "kvartalsverktyget kan nu MÄTA
app-blad" men kuren fanns ENDAST i deras /tmp-kopia — trädets dr-ovning.mjs
var fortfarande okurerat (mitt AUTO-5 02:54 är beviset). Jag applicerade deras
exakta två-raderskur (citerade identifierare i matDatabas) i verktyget +
AUTO-6 GRÖN = påståendet nu SANT i git. Beviskedja totalt: AUTO-3 RÖT (deras)
→ AUTO-4 GRÖN (/tmp-kur) → AUTO-5 RÖT (trädet okurerat) → kur i träd →
AUTO-6 GRÖN.

## 6. Retention-vakten

Efter blad 11: **11 blad** (db-2026-09-11 … db-2026-09-21) · äldsta 10 dagar
KVAR — korrekt (30-dagars-cron raderar först ~10-11; kurens app-retention
rapporterade 0 raderade). Inget förtida borttag = inget fynd, kontraktet håller.

## 7. Städning lokal PG (orderns fjärde steg — oberoende eftermätt)

Tre separata PG17-fönster i natten (min blad-11-restore, min kontraktsmätning,
AUTO-6) — samtliga städade av verktygen; slutligt oberoende egenmätt:
**pg_lsclusters 17/main down** · **psql-socketvägran** (skrap-DB:s frånvaro
bevisad) · /tmp enligt mall (felloggar blad+pid+ms: p4144154 · p4152128 ·
p4160819 + s10u3-app-kontrakt-fel.log) · DR-lås flock-viloläge · disk 54 G
ledigt · RAM-fönstret hölls 1 349–6 556 MB genom natten (grinden vägrade
aldrig felaktigt).

## 8. Prediktionernas dom — 12/12 ✅ varav 7 EXAKTA

P1 board 50 882 **EXAKT** · P2 snapshots 1 271 388 **EXAKT** · P3 public
1 365 519 **EXAKT (modal, siffra för siffra)** · P4 RTO 11,8 ∈ [11,19] ·
P5 markör 1 387 527 ∈ [1 387 000, 1 388 300] + CREATE 99/COPY 101 **EXAKT** ·
P6 fel 788/0 **EXAKT** · P7 universum 60/68/99 **EXAKT** · P8 organ 3 120 ∈
[3 096, 3 168] · P9 städning grön · P10 app-eldprov: finns 02:52 · 84,2 MB ∈
[84,89] · markör GRÖN · 02:50-lograd · 372 **EXAKT** · 183 326 ∈ [181 500,
184 500] · RTO 19,8/22,6 ∈ [19,30] · 0 okända · P11 kedja-2 170 979 ∈ band ·
truncerad false · oversattning 146 190 **EXAKT** · P12 retention 11 blad +
09-11 kvar. Spårets starkaste samlade dom hittills (föregångaren: u2:s 10/10
09-20). Bärande orsak: fyra hörn var förankrade FÖRE natten (formel + levande
punkt + konsistens + fasmodell) — prediktionens kraft är förankringens.

## 9. KVD

- src/ orörd = **INGET bygge** (kuren är .mjs i verktyg/, utanför tsconfig;
  tsc-baslinjen bärs av pre-commit-grinden som validerar committen).
- R2 orörd: .pgpass ENDAST PGPASSFILE-pekare · prod-DB ENDAST läst (COUNT) ·
  crontab ENDAST läst · inga priser/tier/publicering.
- GDPR: endast antal, tabellnamn, tider — inga personvärden; dumpfil aldrig
  utanför backup-katalogen.
- data/blogg/ orörd · data/backups ENDAST lästa (crontabens egna skrivningar
  är dessas) · syskonytor orörda (u1:s AUTO + u2:s RPO-JSON + åldrings-
  agentens AUTO-3/4 + deras DRIFTSBOK-sektion orörda; mitt enda verktygs-
  grep var deras doktrinerade kur, applicerad ordagrant).

## 10. Kö

1. Blad 12:s födelsebevis 09-22 02:30 (formelns åttonde test: board ≈ 50 882+
   8×96 = 51 650 om dygn utan avvikelse · public ≈ 1 385 319 om modalt steg).
2. Kurens dag-2-kvitto 09-22 02:50 + app-RPO-per-timme nu mätbart mot 02:50-serien.
3. dr-ovning.mjs:citeringskur — efterföljare kontrollerar att AUTO-6-mönstret
   håller (app-blad via kanoniskt kommando, inga /tmp-omvägar behövs).
4. Pumpens landningstidsvarians: tredje punkten behövs för fönstrets kanter.
5. Kvartalsövning ≤ 2026-12-21 — med F1-regeln (u2): tom fabrik.

SLUT — handprotokoll s10-u3 2026-09-21 ~03:0x lokal. Maskinella delprotokoll:
AUTO-2 · AUTO-5 · AUTO-6 · DR-RPO-DIFF-2026-09-21-NATT.json (delad med u2) ·
DR-APPDUMP-2026-09-21-KUR-ELDPROV.json.
