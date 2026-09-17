# o48 — Snapshot-testets hermetik: kvalitetssvitens enda röda kontroll rotorsaksfixad + PÅVISAD PROD-LÄCKA (spår 8, s8-u2)

Datum: 2026-09-17 · Manifest auto-s8-1789642527960, position u2 (2/3) · Agent: vakt.

## §1 Objektval & duplikatkontroll

Spårets kontextord "vakten 0-fynd-jakt" + u3:s bokförda köpost ("snapshot
11/12 FAIL 11 — enda röda i parken", commit 3c78e03f, nummerflytt o47):
`verktyg/testa-akm2-snapshot.mjs` kontroll 11 var kvalitetstestparkens ENDA
röda kontroll. Duplikatkontroll: worklog.md har 0 träffar på
"testa-akm2-snapshot" (testet saknar tidigare rotorsaksleverans); OPTIMERING
o9–o46 listar ingen sådan. Föregående u2-fönster cederade tmp-migreringen till
u3 och bokade döda länkar-återmätning — ingen av dessa ytor rörd av mig
(döda länkar-bokningen levererades ALDRIG: ingen doda-lankar-2026-09-17-fil,
inget protokoll — objektet förblir öppet, se §7c).

## §2 Symtom

`node verktyg/testa-akm2-snapshot.mjs` på prod-servern: 11/12 PASS,
FAIL på kontroll 11 ("skriv-validering: … giltig utan env ⇒ ärligt
'ej konfigurerat'") — deterministiskt på servern, PASS på miljöer utan
Supabase-variabler. U3 bevisade felet HEAD-befintligt (noll regression
från deras migrering).

## §3 Rotorsak — miljöberoende "hermetik"

Kontroll 11:s fjärde anrop (r4: giltig ticker + giltigt resultat) förväntar
sig feltexten "Supabase ej konfigurerat" och DOKUMENTERADE sin nätfrihet med
påståendet ".env laddas ALDRIG här (getSupabaseRest blir null utan
NEXT_PUBLIC_SUPABASE_URL)". Detta förväxlar två kanaler: .env-filen läses
aldrig — men **process.env kan bära variablerna ändå**, och prod-serverns
fabriksbarn gör det (bevisat i detta fönster: NEXT_PUBLIC_SUPABASE_URL ·
SUPABASE_SERVICE_ROLE_KEY · NEXT_PUBLIC_SUPABASE_ANON_KEY samtliga SATTA i
skal-miljön). Med dem satta:

1. r4 passerar ren validering, `getSupabaseRest()` ≠ null,
2. kontrollen går VIDARE till nät: idempotens-läsning `lasAkm2Snapshot(ticker)`
   mot PROD-lagret — och vid ojämförligt resultat en **riktig POST av
   test-fixturer till system_events**,
3. svaret blir `ok:true` (eller nät-fel) — aldrig "ej konfigurerat" ⇒ FAIL.

Testet var alltså inte bara icke-deterministiskt (PASS på dev, FAIL på
servern) — det saknade nätskydd AV KONSTRUKTION och kunde skriva till
produktionsdatabasen.

## §4 Prod-fyndet — fixture-läckan påvisad (read-only-sonder)

Sond 1 (`lasAkm2Snapshot("ABB.ST")`, skrivskyddad): prod-lagrets GÄLLANDE
snapshot för ABB.ST är test-fixturen — namn "Fixtur AB", komposit 62,
datum 2026-09-03, sparad **2026-09-15T22:07:31.119176+00:00**.
Sond 2 (all-läsning, 100 tickers): exakt **EN** fixture-rad (ABB.ST), 99 äkta
— omfattningen begränsad men verklig: senaste-vinner-semantiken gör att
fixturen kväver produktionens äkta ABB.ST-rad, och appens server-läsväg
(fil-kedjan först, lagret när cachefilen saknas) kan visa fixtureskräp.

Troligt förlopp: första fullkörningen på servern (2026-09-15 22:07Z) POSTade
fixturen; varje senare körning idempotens-hoppade (`ok:true, hoppat:true` —
fixturen är deterministisk) ⇒ kontrollen failat deterministiskt sedan dess,
utan att någon la märke till att FAIL:et var en funnel till en tyst
prod-skrivning.

## §5 Kur — hermetik-pinn (samma princip som kontroll 10:s NEXT_PHASE-pinn)

`verktyg/testa-akm2-snapshot.mjs`, kontroll 11 i genererad TS-kod: de tre
Supabase-variablerna sparas, RADERAS före r1–r4 och återställs i `finally`
— r4 svarar deterministiskt "Supabase ej konfigurerat" ÖVERALLT och
kontrollen är nätfri AV KONSTRUKTION (oavsett maskinens miljö). Headerns
felpåstående ("getSupabaseRest är bara null om…") korrigerad till
verkligheten: miljön, inte .env, är kanalen. KLASSSTÄNGD:
`skrivAkm2Snapshot` anropas av inget annat verktyg och mönstret
"förvänta 'ej konfigurerat' utan env-pinn" finns i ingen annan testa-*.mjs
(grep-verifierat).

## §6 Bevis

- Testet **12/12 kontroller gröna**, två fullkörningar i SAMMA skal med
  Supabase-variablerna fortfarande SATTA (fönstret som förut gav 11/12 FAIL)
  — pinnens poäng just att svaret är miljooberoende.
- Tmp-testfilen städad efter varje körning (`ls` verifierar frånvaro).
- `node --check` ok; `node node_modules/typescript/bin/tsc --noEmit` = 0
  (projektbinären; src/ orörd).
- `node verktyg/mimosa-paritet.mjs '^verktyg/testa-akm2-snapshot'` = GRÖN,
  0 fynd (87 härdade kontexter).
- KVALITETSVAKTEN helkörning `--kör-motorer` 2026-09-17T11:50:11Z:
  **FEL 0 · MANUELLA 0 · GRÖN**, 11/11 sektioner PASS (inkl. typbaslinjen)
  — data/rapporter/kvalitetsrapport-SENASTE.md är väktarens egen utdata.

## §7 Rest & bokningar

a) **Fixture-raden i prod (ABB.ST, 2026-09-15T22:07:31Z)**: radering ur
   Supabase = R2 (radering är kundens veto) — bokas, utförs EJ av fabriksbarn.
   Icke-destruktivt alternativ: omkörning av kor-akm2-berika för ABB.ST skriver
   en ny äkta rad som vinner (senaste-vinner). Ingen lokal akm2-cache för
   ABB.ST hittades i data/cache/ — berika-ägaren avgör väg.
b) **u3:s tmp-migrering är REVERTAD** (72682834 återställer 3c78e03f, utan
   motivering i revert-meddelandet) ⇒ o44:s rotköpost om tmp-ROTSKRIVARNA är
   öppet igen i trädet — eskaleras till manifestägaren; inte u2:s yta.
c) **Döda länkar-återmätning** (förra u2-fönstrets bokning, o47-doda-lankar)
   levererades aldrig — objektet förblir öppet i spåret.
d) Revertens orsak är obokförd — arbetsstationen eller huvudsessionen kan ha
   vetskap; worklog saknar notis.

## §8 Filer & ytor

Endast: verktyg/testa-akm2-snapshot.mjs (kirurgisk edit av kontroll 11 +
header-dokumentation), detta protokoll, anspråksfilen, worklog-rad samt
kvalitetsrapport-SENASTE.md (väktarens egen överskrivning från §6-körningen).
src/ orörd · INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd ·
syskonytor (prod-synk.mjs, tmp-filerna) orörda.
