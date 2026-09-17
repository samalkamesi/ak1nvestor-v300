# DR-KEDJA 7 — KIRURGIRECEPTET FÖR board_decisions (agentprotokoll, s10-u2, 2026-09-17)

OBJEKT (anspråk FÖRE ingreppet, `data/vakten/auto-s10-1789647928135-u2-ansprak.md`,
skrivet ~14:3x lokal): spårets äldsta ÖPPNA köpost — kedja 5:s FYND 1 från
2026-09-16, upprepad i varje efterföljande DR-protokolls kö ("board_decisions-
recept … kvarstår"): **public.board_decisions kan EJ kirurgeras** — FK:n
`forecast_log.board_decision_id → board_decisions(id) ON DELETE SET NULL` gör att
kirurgins DELETE försöker UPDATE:a `forecast_log`, där `trg_forecast_log_immutable`
(`forecast_immutable()`, BEFORE DELETE OR UPDATE) vägrar allt. Receptet var
obevisat och bokat "till huvudagenten". Duplikatkontroll: kedja 1 (09-17) taget
i morse av två syskon, kedja 2 (jungfrunatten) mitt eget O8, kedja 4 +
middags-RPO + per-typ-diagnos VALT AV SYSKON s10-u1 (anspråksfil läst FÖRE mitt
val; deras commit 07dd6aa0 landade under mitt fönster — deras ytor orörda).
Detta objekt rör INTE dr-kedja5.mjs eller dr-total.mjs — nytt fristående verktyg.

## Leverans

`verktyg/dr-kedja7.mjs` — specialrecept-verktyget för triggerblockade tabeller,
i kedja 5:s familjekontrakt (flock `/tmp/ak1a-dr-prov.lock` med kö, RAM-/diskgrind
exit 75, markörkontroll via kolla-dump-markorer, felkategorisering, maskinellt
protokoll, garanterad finally-städning). RECEPTET som bevisas:

```sql
-- EN transaktion (psql --single-transaction + ON_ERROR_STOP=1):
SET LOCAL session_replication_role = replica;
DELETE FROM public.board_decisions;
COPY public.board_decisions (…) FROM stdin;  -- tabellens block ur natt-dumpen
-- SET LOCAL dör med transaktionen; COMMIT
```

Replica-läget (superuser; lokal PG-postgres är det) stänger av användartriggrar
OCH FK-enforsering — kaskaden eldas aldrig, grannen får inga ärr — men FK:n
validerar inte heller under appliceringen, därför bär verktyget ett OBLIGATORISKT
efterkontrakt (se nedan).

## Den GRÖNA körningen (körning 3, 14:43 lokal, exit 0)

Maskinellt delprotokoll: `DR-KEDJA7-2026-09-17-AUTO-3.md`. Mätvärden:

| Moment | Värde |
|---|---|
| Retentionssvep | 7/7 dumpar gzip-GRÖNA (28,0–30,3 MB; 09-11→09-17) |
| Slutmarkörkontroll | GRÖN · 1 307 940 rader |
| Full restore (källmåttstock) | **15,2 s** (kedja 7-serien 17,5 · 13,1 · 15,2 s) · fel 788 kända / 0 okända |
| Källa | public.board_decisions **47 810 rader** · checksumma `8e16c9e70d173a338352c2affac71abe` |
| Skyddstriggrar aktiva före | 2/2 (`trg_forecast_log_immutable`, `trg_forecast_outcomes_immutable`, tgenabled=O) |
| Kollateralbaslinje | forecast_log 429 rader, varav **113 refererar** board_decisions |
| Extraktion (zcat+awk ur dumpfil) | 47 810 datarader · 80 929 KiB · 1,1 s · antalskontrakt == källa |
| KATASTROF (buggig migrering) | 500 rader muterade (consensus_level=-1, sondbekräftat) · checksumma förändrad |
| NAIV KIRURGI (kedja 5:s recept) | **VÄGRAD på 0,5 s** — "AK1A prognosmotor: UPDATE på forecast_log är förbjuden — registret är oföränderligt" · HEL rullbak, katastrofen kvar |
| SABOTAGE (mitt-rads-kolumnfel i receptfilen) | VÄGRAD (uuid-inmatningssyntaxfel) · rullbak |
| **RECEPET (replica-läge + DELETE + COPY)** | **4,2 s** · 47 810 rader tillbaka · checksumma IDENTISK med källan |
| Kollateral efter | 113 == 113 referenser · 429 == 429 rader — **0 SET NULL-ärr, kaskaden eldades ALDRIG** |
| Hängande referenser (manuell FK-sond) | **0** |
| Skyddstriggrar aktiva efter | 2/2 |
| LIVE-triggerbevis | engångs-UPDATE i forecast_log **VÄGRAD** — skyddet LEVER efter receptet |
| Replicationsrollen efter | `origin` (SET LOCAL dog med transaktionen) |
| Städning (ägar + oberoende mätt) | skrap-DB ak1a_dr_k7 raderad · PG17 stoppad · tmp raderade (fellogg medvetet kvar: `/tmp/dr-kedja7-fel-2026-09-17.log`) · låsfil utan hållare |

## FYND

1. **KÖPOSTEN STÄNGD — board_decisions ÄR kirurgerbar.** Kedja 5:s "specialrecept
   FK-paus/tabellswap = huvudagenten" är bevisat: `SET LOCAL
   session_replication_role = replica` i kirurgins transaktion läker tabellen
   identiskt (radantal + checksumma) på 4,2 s, utan DDL och utan bestående spår.
   Skyddet är OBERÖRT: triggrarna förblir aktiva och en live-UPDATE vägras
   fortfarande efteråt. Ingen FK-paus, ingen tabellswap behövs.

2. **Skiktat skydd kartlagt (dubbelt):** en olycks-DELETE av board_decisions
   stoppas REDAN av skyddet via SET NULL-kaskaden (riktigt fel innan någon kirurgi);
   den realistiska katastrofen är MUTATION (board_decisions är själv triggerfri —
   konsensusförfalskning landar obehindrat), och ENDAST replica-receptet läker den.
   Naiva kirurgin rullas helt tillbaka av samma skydd — kirurgen som inte kan
   skada prognosloggen kan inte läka beslutsregistret utan receptet.

3. **0 ärr — receptets avgörande fördel framför FK-paus-varianter.** Eftersom
   kaskaden aldrig eldas skrivs inga SET NULL-värden in i forecast_log
   (113 referenser == baslinjen). Kedja 5:s kollateralvarning ("kirurgin läker
   EJ grannar") gäller INTE detta recept — grannen rörs aldrig. Priset: FK:n
   validerar inte under appliceringen — därför är den manuella hängande-sonden
   OBLIGATORISK efter varje verklig applicering (verktyget bär den; 0 hängande).

4. **Instrumentbuggar (2, bokförda enligt ärlighetsdoktrinen — båda grepna ur
   körningarnas RÖT-protokoll):** (a) körning 1: `conrelid::regclass::text`
   återger `forecast_log` UTAN `public.`-prefix när schemat ligger i search_path
   — FK-jämförelsen missade träffen; kur: schema-prefixnormalisering före
   jämförelse. (b) körning 2: `psql -q` undertrycker `UPDATE n`-ekot — radparsning
   är INTE ett mått; kur: oberoende sond (räkna katastrofsignaturen före/efter)
   i stället för process-eko. Tre körningar alla protokollförda: RÖT · RÖT · GRÖN
   (`DR-KEDJA7-2026-09-17-AUTO{,-2,-3}.md`).

## RUNBOOK — triggerblockad tabell vid verklig incident (prod)

1. `node verktyg/dr-kedja7.mjs` — bevisar att dagens dump bär tabellen hel och
   att receptet håller samtliga kontrakt (mot skrap-DB, ~1 min).
2. Receptfil: `SET LOCAL session_replication_role = replica;` + `DELETE FROM
   public.board_decisions;` + tabellens COPY-block — EN transaktion,
   ON_ERROR_STOP. Mot Supabase krävs motsvarande superuser-rättigheter,
   lågtrafik, huvudagentens ägande (R2).
3. VERIFIERA EFTERÅT (FK:n var avstängd!): radantal + checksumma +
   hängande-referenssonden + live-triggerbeviset — exakt verktygets steg.
4. Gränser: replica-läget pausar ALLA triggrar under transaktionen — kör ALDRIG
   mot en tabell vars triggrar utför affärslogik som COPY-datan förlitar sig på;
   håll transaktionen minimal (endast DELETE + COPY); rollen återställs
   automatiskt (SET LOCAL) men verifieras ändå.

## KVD

- src/ ORÖRD — verktyget är ren node utanför src/; tsc-baslinjen orörd (pre-commit-
  grinden verifierar; inget bygge — byggen ägs av prod-synken).
- R2 ORÖRD — inga priser/tier/publicering; prod RÖRDES ALDRIG (allt i lokal
  skrap-DB; .pgpass/.env aldrig inlästa).
- data/blogg/ ORÖRD. data/backups/ endast lästa.
- Syskonytor orörda (u1:s MIDDAGS-objekt committat 07dd6aa0 före min DRIFTSBOK-
  edit — disk-först-precedensen; u3:s yta orörd).
- Flock-disiplin: fönstret togs först EFTER u1:s dr-ovning släppt låset
  (väntat ut; PG17 orörd under väntan).

SLUT — agent s10-u2, 2026-09-17 ~14:5x lokal.
