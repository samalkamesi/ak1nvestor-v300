# DR-FONSTERDJUP 2026-09-16 — äldsta bladet restore-bevisat (AUTO)

Körd av `verktyg/dr-fonsterdjup.mjs` (spår 10, s10-u1 O6). Kedja 1:s RTO-serie
(20,0 · 17,7 · 14,7 · 20,0 · 23,9 · 11,2 · 12,2 · 17,3 s) mäter DAGENS dumpar —
detta protokoll bevisar FÖNSTRETS ÄLDSTA blad: katastrofen som upptäcks först på
dag 29 återställs ur precis den filen. Kedja 5:s retentionssvep bevisar
gzip-integritet; detta bevisar RESTORE-BARHETEN (gzip-giltighet ≠ läsbart innehåll
— kedja 5 bevisade att ett heligt block kan bära oläslig data).

Fönster: db-2026-09-11.sql.gz → db-2026-09-16.sql.gz (6 dumpar på disk, 5 dagars spänn) · Skrap-DB: ak1a_dr_fonster

## 1. Moment

| Moment | Resultat |
|---|---|
| Självtest (frisk fixture + trunkerat block vägras — kedja 5:s läxa) | 2/2 PASS |
| Slutmarkörskontroll ÄLDSTA (kolla-dump-markorer) | GRÖN |
| Slutmarkörskontroll YNGSTA (kolla-dump-markorer) | GRÖN |
| Blockräkning äldsta (per tabell COPY-rader, zcat+awk) | 97 tabeller · 1 192 910 rader |
| Blockräkning yngsta | 101 tabeller · 1 272 992 rader |
| **Restore ÄLDSTA (zcat | psql, RTO)** | **14.5 s** · exit 0 |
| Restore-fel (kategoriserade, dr-ovning-kontraktet) | 732 roller · 17 scheman · övrigt kända 13 · **okända 0** |
| TVÅ INSTRUMENT: PG count == dumpblock per public-tabell | 60 tabeller · ALLA IDENTISKA — GRÖN |
| PG-summa == dump-summa (public) | 1 186 890 == 1 186 890 GRÖN |
| Städning | skrap-DB raderad · PG17 stoppad · tmp raderade |

## 2. Tillväxtdiff äldsta → yngsta (per tabell, top-10 |Δ|)

| Tabell | Äldsta | Yngsta | Δ | Not |
|---|---|---|---|---|
| public.section_data_snapshots | 1 100 532 | 1 176 468 | +75 936 | |
| public.board_decisions | 43 549 | 47 042 | +3 493 | |
| cron.job_run_details | 5 614 | 6 063 | +449 | |
| public.organ_health_logs | 2 676 | 2 889 | +213 | |
| auth.schema_migrations | 77 | 82 | +5 | |
| public.profiles | 5 | 3 | −2 | minskar |
| auth.identities | 5 | 3 | −2 | minskar |
| auth.sessions | 19 | 17 | −2 | minskar |
| auth.users | 5 | 3 | −2 | minskar |
| auth.refresh_tokens | 19 | 17 | −2 | minskar |

Totalt: 1 192 910 → 1 272 992 rader (+80 082 på 5 dagar ≈ 16 016/dag över ALLA scheman).
Nya tabeller: auth.mfa_recovery_codes, auth.scim_tokens, auth.scim_users, auth.mfa_recovery_code_sets · Borta: inga · Minskande: public.profiles (-2), auth.identities (-2), auth.sessions (-2), auth.users (-2), auth.refresh_tokens (-2), public.notification_settings (-2), auth.mfa_amr_claims (-2).

## 3. Tolkning (runbook-kunskap)

- ÄLDSTA bladet är restore-barbart med samma kontrakt som färska (okända fel
  0, två instrument identiska) ⇒ retentionens DJUP är bevisat, inte bara dess
  yta. Vid sen upptäckt: använd äldsta FUNGERANDE bladet i fönstret.
- Tillväxtdriften (§2) är kapacitetsbilden: dumpfilerna växer 0.36 MiB/dag (uppmätt på fönstrets filer) och radtillväxten koncentreras till top-raderna ovan —
  planera utrymme efter TILLVÄXTARNA, inte snittet.
- Minskande tabeller = gallringsytor (händelseloggar etc.) — vid restore av
  ÄLDSTA bladet FÖRLORAS det som gallrats sedan: rader som finns i äldsta men
  ej i yngsta är 14 stycken — kunskapen finns bara i gamla blad.

## 4. Dom

**GRÖN — fönstrets äldsta blad restore-bevisat: 14.5 s, okända fel 0, två instrument identiska**

Avbrottsorsak: ingen

SLUT — maskinellt genererat av dr-fonsterdjup.mjs 2026-09-16T18:51:59.610Z
