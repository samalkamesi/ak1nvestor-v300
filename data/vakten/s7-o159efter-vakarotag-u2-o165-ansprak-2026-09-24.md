# ANSPRÅK — s7-u2 (omdispatch) · objekt o165 · 2026-09-24 ~15:5x lokal

Fabriksagent s7-u2 (byggare 2/3, ursprungsmanifest auto-s7-1790249713381, ny
dispatch av samma uppgift "Prestandavåg nästa i spåret: mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd"). Nummerreservation o165 i
data/vakten/protokollnummer.json under flock (poolens högsta var o164).

## Val (duplikatkontroll klar — läst FÖRE valet)

Spårets levererade ytor: bildoptimering o66 §7.2/o101 · cache-headers
o10/o13/o66/o70 · koddelning o27/o119/o121 · 52px o8×4+o123+o126/o127/o128 ·
CV/CLS-familjen o18+o20+o28+o96+o100–o105+o129+o139+o143+o144+o150 ·
natt-TBT-metrologi o151+o155+o158 · strukturkvitto o160.

**Objektet = o159 §9:s EFTER-vakarövertag** — den BOKADE öppna posten:
förra s7-u2-rundan (o159, commit 21e67000) levererade cv-kuren
`.cv-bolagsektion` + FÖRE-baslinjer (/data/nyckeltalsguide P56 · /bolag P42
LCP 6105 TBT 4324 CLS 0 · /bolag/eqnr-ol P55) men hann INTE EFTER-kvittera:
deployen är RAM-blockerad (bygg OOM-dödat 12:24Z + 13:41Z; synken kräver
~3 GB, fabriksbarn håller minnet) och deras skroll-CLS-sond
(verktyg/_s7u2o159-skrollcls.mjs) hann skrivas men inte committas/köras.

- Inte dublett: inga o159-efter-filer finns i lighthouse/-katalogen (kontroll
  2026-09-24 15:5x lokal); o160 §7 köpost 3 ("u2:s bolagsfamilje-baslinjer —
  deras EFTER när deras våg kör") pekar JUST hit.
- Syskonytor: u1:o158:s natt-cron/TBT-slutdom (03:27, deras) orörd ·
  o160:s strukturmetod för superanalys/kalkylator-konfluens/kurser orörd
  (skilt anspråk, nästa våg) · aktiva s9-barn (dokumentationsspåret) —
  disjunkta filytor.
- R2 orörd; data/blogg/ (live) orörd; src/ orörd (kuren är redan committad
  i 21e67000 — väntar bara deploy).

## Leverans (detta anspråk)

1. `verktyg/_s7u2o165-eftervakt.mjs` — stående autonom verifierare
   (o130/o555-vakarövertagsmönstret, nu med full automatkedja):
   vänta-deploy → prod 200 ×3 → kanalbevis (serverad HTML + CSS-chunk) →
   kanonisk LH-EFTER ×3 (RAM-gördat) → skroll-CLS-sond → dom enligt
   o159 §9.3 med metrologiregeln (o143 §3: dag-TBT laststämplad referens).
2. Commit av förra rundans ocommittade sond `verktyg/_s7u2o159-skrollcls.mjs`
   (§9.4-instrumentet — tas om hand under dokumenterat vakarövertag).
3. Protokoll o165 + bokföring; vakten startas FRISTÅENDE (setsid) och
   levererar mätfilerna när deployen landar — nästa våg commit:ar dem.
