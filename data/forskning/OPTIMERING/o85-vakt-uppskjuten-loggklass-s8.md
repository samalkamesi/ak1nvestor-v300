# o85 — VAKTENS LOGGKLASS: "GRÖN — 0 fynd" betydde inte alltid mätt (s8-u1, 2026-09-19)

**Spår 8 (kvalitet & säkerhet) · manifest auto-s8-1789797929474 · agent s8-u1 (vakt 1/3)**
**Objekt:** o72 §5.2:s namngivna köpost *UPPSKJUTEN-loggklassen* — bekräftad
oförändrat öppen i o79:s kölista. Rotorsaksfix + bevis; src/ orörd (INGET
bygge — prod-synken äger).

## 0. Val och duplikatkontroll

Anspråk disk-först: `data/vakten/auto-s8-1789797929474-s8-u1-ansprak.md`
(o85 reserverat där — o69-läxan). Spåret har levererat o64–o81; o82–o84 är
spår 7:s. UPPSKJUTEN-loggklassen bokad öppen i o72 §5.2 + o79, aldrig
levererad. Syskon u2/u3:s separata separatorer lämnade (backup-offsite-INTERP
= o80:s sidofynd åt DR-ägande spår; v86post/v68bg = innehållsspårets).

## 1. Fynd (live-belagt)

`data/vakten/cron.log` rad `2026-09-18T0717 GRÖN — 0 fynd` — men:

- **Ingen rapport**: `granssnitt-2026-09-18T0524.json` (status ok, 176 komb)
  är 01:17-svepets kvitto (o72 §4); nästa rapport i katalogen är `T1135`.
  En UPPSKJUTEN-gren (vakten rad 416–421) SKULLE ha skrivit en
  `status:"uppskjuten"`-rapport ≈ 05:29Z — ingen sådan fil finns.
- **Ingen journalföring** (o72 §4:s verification).

07:17-körningen alltså: **exit 0 utan vaktsvar** — och cron.loggen påstod
ändå full mätverifiering ("GRÖN — 0 fynd"). Driftsläsaren (ronderna, feljagten,
evighetsmotorn) fick "skyddet aktivt + sajten verifierad" när skyddet var av.

## 2. Rotorsaka

`granssnittsvakt-cron.sh` rad 83–86 (före kur): `exit 0` från vakten ⇒
`GRÖN — 0 fynd` — **utdata kontrollerades aldrig**. Vakten har tre lagliga
exit-0-lägen (våg 142: driftavbrott larmar ej):

| Klass | Vaktens utdata | Mätt? |
|---|---|---|
| Fullt svep | `GRÄNSSNITTSVAKTEN: N funnna bland M kombinationer` (rad 717) | ja, allt |
| UPPSKJUTEN | `GRÄNSSNITTSVAKTEN: UPPSKJUTEN — deploy pågår…` (rad 420) | **inget** |
| AVBRUTEN | `GRÄNSSNITTSVAKTEN: AVBRUTEN — DEPLOY PÅGÅR — …` (rad 731) | partiellt |

Plus den oavsiktliga fjärde klassen 07:17 tillhörde: **exit 0 utan
`GRÄNSSNITTSVAKTEN:`-rad överhuvudtaget** (oklassad tystnad). Alla fyra
loggades som GRÖN. (o72 hypoteserade UPPSKJUTEN; filbelägget visar att
verkligheten var värre — kuren täcker båda.)

## 3. Kur (data/infra/contabo/granssnittsvakt-cron.sh)

1. **Ärlig klassläsning**: vid `KOD=0` läser wrappern vaktens EGEN utdata
   (`senaste-korning.txt`) — aldrig gissade tidsfönster — och loggar:
   - `UPPSKJUTEN — deploy pågår, inget mätt (exit 0; nästa cron-körning mäter)`
   - `AVBRUTEN — deploy startade mitt i svepet, partiellt mätt + journalfört (exit 0; nästa cron-körning mäter klart)`
   - `OVÄNTAD EXIT 0 utan vaktsvar — inget mätt, granska senaste-korning.txt (vakt-hälsa)` ← 07:17-klassen
   - `GRÖN — 0 fynd (fullt svep)` — prefixet "GRÖN — 0 fynd" bevarat
     ordagrant (grep-belagt: inga externa läsare av strängen).
   **Exitkod 0 kvar i alla driftklasser** (våg 142-doktrin: driftavbrott
   larmar ej; klassen skiljs i LOGGEN, vilket var poängen med o72:s köpost).
2. **Testbar vaktkörningsväg** (o72 §5.2:s uttryckliga krav, "ej offline
   idag"): `GRANSSNITT_VAKT_KOMMANDO` (default `node
   verktyg/granssnittsvakt.mjs`) — sviten mochar vaktens utdata; skarp cron
   opåverkad. Svit-ägd i linje med GRANSSNITT_KATALOG/RAM_MIN-familjen.
3. `GRANSSNITT_ENV_FIL` (default skarp `.env.production.local`) — låter
   sviten köra larmvägen mot dummy-nyckel utan att KUNNA posta skarpt larm
   till studion.

## 4. Bevis

- **Nya sviten** `verktyg/testa-granssnitt-cron-loggklass.mjs`: **23 PASS ·
  0 FAIL** — L1 UPPSKJUTEN→egen klass+aldrig GRÖN · L2 AVBRUTEN→egen
  klass+aldrig GRÖN · L3 GRÖN-prefix ordagrant · L4 exit-0-utan-vaktsvar→
  OVÄNTAD+aldrig GRÖN (07:17-regressionen) · L5 fynd-exit-1 mot dummy-env →
  "larmvägen bruten"-rad OCH aldrig "FYND-larm"-rad (sviten kan inte larma
  skarp studio) · L6 vaktkrasch-exit-2 → vaktkrasch-arkiv i tmp
  (o35-kontraktet kvar) · L7 skarp cron.log orörd (mtime+size) · L8 defaults
  = skarp drift.
- **Regression o72-sviten** `testa-granssnitt-cron-retry.mjs`: **16 PASS ·
  0 FAIL** (RAM-skip-kontraktet, SKIP-rad, clamp, TORR-lägen — orört).
- `bash -n` wrapper ren · `node --check` svit ren · **tsc 0 FEL** via
  projektbinär (`node node_modules/typescript/bin/tsc --noEmit`) · src/
  orörd ⇒ INGET bygge · R2 orörd · data/blogg/ orörd · syskonytor orörda
  (beroende-halsa-SENASTE.md = annans pågående yta, lämnad ostaggerad).

## 5. Bokningar

1. **Organiskt live-bevis**: nästa driftklass i skarp cron (UPPSJUTEN/
   AVBRUTEN/OVÄNTAD syns i cron.log med ny radform; GRÖN-rader efter denna
   commit = äkta fulla svep). Gränsnittsvakt-cronen äger schemat
   (17 \*/6 h) — ingen egen åtgärd.
2. Om "OVÄNTAD EXIT 0" återkommer i skarp logg: jakt på vaktens tysta
   exit-0-väg (07:17-fallets rot är fortfarande okänd — kur ärlig-loggar
   klassen men förklarar den inte; kandidat: undantag före
   huvudloopens try/finally med olycklig exit-kod).
3. backup-offsite.mjs:s CHILD_PROC_INTERP (o80:s sidofynd) — kvar åt
   DR-ägande spår; v86post/v68bg — kvar åt innehållsspåret.

## 6. Levererade filer

- `data/infra/contabo/granssnittsvakt-cron.sh` — klassläsning + två
  svit-ägda överridningar.
- `verktyg/testa-granssnitt-cron-loggklass.mjs` — svit 23 PASS (mock-vakt,
  o72:s testbara vaktkörningsväg).
- `data/forskning/OPTIMERING/o85-vakt-uppskjuten-loggklass-s8.md` — detta protokoll.
- `worklog.md` — rondrad.

*Utbildning, aldrig råd — juridikgrinden står (inga rådfraser, inga lagrum).*
