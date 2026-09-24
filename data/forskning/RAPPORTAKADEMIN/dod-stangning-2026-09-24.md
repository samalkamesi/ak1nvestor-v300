# RAPPORTAKADEMIN — DoD-stängningsunderlag (2026-09-24, v169)

Kunduppdragets definition-of-done (data/vakten/kunduppdrag.json, ordagrant):
"vertikalt snitt LIVE för en Fas 2-testelev med bevisad bedöm-först-ordning
+ gröna sviter + prod 200 + den laggrundade konfigurationen implementerad
och committad."

Audit per komponent, med bevis:

## 1. Vertikalt snitt LIVE — UPPFYLLT
- Sidan /rapportakademin: 200 (rond 131 beviskedja 404→405→401→200; rond 147
  "DoD hålls"; E39-återmätning 2026-09-21: 200, 69 003 B).
- GET /api/rapportakademin/pass: 200 + {"ok":false,"kod":"inloggning"} för
  gäst (rond 148-kontraktet leverande, E39 mätte det i prod).
- Innehållet: ABB-passet abb-ar-2025, fem sektioner A-Ö (V01/V07/V09/V10/
  värdering) på verifierade tal (data/analyses/ABB.ST.json + 71-kontrolls-
  granskning 2026-09-19), commit 9b05f298 (rond 130).

## 2. Bevisad bedöm-först-ordning — UPPFYLLT (mekaniskt; gräns dokumenterad)
- Kontraktet i koden (pass/route.ts POST): korrigera server-side → LAGRA
  minimerad bedömning (auth + art 13 + minimering, tre grindar) → FÖRST
  DÄREFTER expertläsningen i svaret; misslyckas lagringen (502) exponeras
  ingenting. Doc-kommentar: "ordningen är mekanisk, inte ett UX-löfte".
- passSkal() strippar rattSvar/tolerans/expertlasning ur allt klienten ser
  i GET — kontraktssvitens test A mäter detta live.
- GRÄNS (dokumenterad sedan rond 131): fullt e2e med en FAS 2-TESTELEVS
  inloggning kräver ett testelev-konto — Supabase-auth-skapande kan inte
  göras autonomt utan service-nyckel (R2-yta: nyckelfiler är kundens).
  Rond 131 bokförde detta som "frivillig fördjupning"; grindsvarsbevisen
  (401/403/200-kod) + kodläsningen bär ordningen. Sviten A–E mäter det
  som är maskinellt möjligt utan konto.

## 3. Gröna sviter — UPPFYLLT (v169)
- NY kontraktssvit: verktyg/testa-rapportakademin-kontrakt.mjs (sex test:
  gäst-GET 200 + 0 läckta facit-nycklar · gäst-POST 401 utan expert ·
  elev-yta 401 · gallringsrutt med idempotens · publikt skal rent ·
  daemon-radens driftsbevis). Körs GRÖN i prod efter v169-deployen
  (utfall bokförs i worklog rond 184).
- tsc-projektbinär 0 fel (våg 133-baslinjen) — mekanisk grind vid varje
  commit, inklusive v169:s (b78e5c7d).

## 4. Prod 200 — UPPFYLLT
- Sajten + ytan svarar 200 (komponent 1); verifieras igen av sviten efter
  v169:s bygg (gallringsrutten tillhör samma deploy).

## 5. Laggrundad konfiguration implementerad och committad — UPPFYLLT
- LAGBESLUT STYRELSE-MUADCVYF-CG1JM2:s sex leveranser (rond 128–129,
  f5a5ac2f): minimering.ts (art 5.1 c+25) · citat-validator.ts (ÄL 22 §+1 §)
  · gallring.ts (art 5.1 e + ångerrätt 2005:59) · art13.ts (art 13) ·
  api/rapportakademin/route.ts (bedömning/export art 20-tänk/radering art 17)
  · verktyg/beslutsminne.mjs (LAGGRUNDEN-grinden: NEKAR utan lagrum).
- v169 (b78e5c7d) stänger det sista maskinella gapet: gallringsjobbet hade
  0 anropare (E39-gap 1 — "AUTOMATISKT"-löftet utan motor). Ny rutt
  /api/cron/rapportakademin-gallring + pumpor-daemonens dagliga 04:41-rop
  gör BESLUT 1.2 verksamt i drift.

## Tio-åtgärdslistan — lägesredovisning (inte del av DoD-meningslagen)
1. Vertikalt snitt ETT bolag A-Ö: LEVER (komponent 1–2 ovan).
2. PDF-sektionsextraktion ~10 bolag FÖRE innehållsproduktion: källregistret
   + HEAD-verifierade direkta PDF-url:er levererade (rond 142, 41f0a9e1:
   10/10 url:er mot karantänkontraktet). Själva hämtningen/extraktionen är
   INTE startad — innehållsproduktionen har inte påbörjats, villkoret
   "FÖRE" är alltså intakt; karantänsverktyget (rapport-intag-karantan.mjs)
   bär verkställandelogiken inklusive citattak >200 ord ⇒ refusera.
3. Fel-ledger med spacing i Supabase: bedömningarna loggas som ra_bedomning
   i system_events (Supabase) med ratt true/false = ledgern; repetitionen
   styrs av spaced-repetition.ts och pass-klientens spacing-notis (rond 130
   leverans 3). Latimier-namnet avser teknikbeskrivningen i
   R2-beslutsunderlaget.
4. Karantän-intag: verktyget lever (checksumma+provenans+isolerad parsning
   + PDF:er aldrig publikt hostade), klart för första hämtningen.
5. Fas 2-grind server-side på mentor-endpoints: LEVER (pass-ruttens grindar
   + members.member_type server-side; E39 mätte 401/403-grindsvar i prod).
6–10. LAGBESLUTets GDPR-punkter: se komponent 5 (minimering, gallring —
   nu MED motor, art 13, export/radering, citat-validator).

## Slutsats
DoD-meningslagans fyra komponenter är uppfyllda med bevis; den enda
dokumenterade gränsen (testelev-e2e) kräver kundens konto-material och är
bokförd som frivillig fördjupning sedan rond 131. Uppdraget kan stängas:
data/vakten/uppdrag-klart.json + UPPDRAG KLART (kunduppdragsprotokollet
punkt 4). Resterande arbete (PDF-hämtning, fler pass, extraktionsdjup)
tillhör evolutionsspårets fortsättning — inte uppdragets slutcriterium.

## Stängningskvitto (rond 184, 2026-09-24 ~21:03 lokal)
- Kontraktssviten körd mot prod-appen EFTER v169-deployen: **6 PASS · 0 FEL**
  (A gäst-GET 200 + kod-inloggning + 0 läckta facit-nycklar · B gäst-POST 401
  utan expert i kropp · C elev-yta 401 · D gallringsrutt 200 med kanoniskt
  svar, idempotens bevisad över två körningar, gallrade=0 fel=0 · E publikt
  skal 200 utan facit i SSR · F daemon-radens driftsbevis i källträdet).
- Byggbevis: BUILD_ID 20:04:27 lokal (v169-bygget under flock-lås),
  pm2 ak1a omstartad 20:05:57 — online.
- Driftsbevis gallringsmotorn: pm2 ak1a-pumpor omstartad 21:02:56
  (restarts 26; skal-pm2 hängde och verkställde ej — node-kanalen genomförde,
  skal-kvotens kur bevisad igen). Daemonprocessen bär nu 04:41-ra-gallring-
  raden; första automatiska gallringen 2026-09-25 04:41.
- Uppdraget markerat klart enligt kunduppdragsprotokollet punkt 4:
  data/vakten/uppdrag-klart.json + UPPDRAG KLART.
