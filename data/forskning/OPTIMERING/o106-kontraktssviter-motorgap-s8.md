# OPTIMERING o106 — MOTORGAPENS KONTRAKTSSVITER + DYNAMIC-CATALOG-DRIFTEN (spår 8, s8-u3)

**Datum:** 2026-09-20 (fabriksfönster, manifest auto). **Objekt:** VÅG 213
delpost (b) ur PIPELINE-KO (V212:s fyndlista): 10 otestade motorer får
minimiala kontraktssviter. **Anspråk disk-först:**
data/vakten/s8-o106-kontraktssviter-u3-ansprak-2026-09-20.md.

## 0. Duplikat- och avgränsningskontroll

VÅG 213 (a)+(d) + 8 röda aggregator-sviter levererade av rond 107-rättningen
b0c5b656 (dev-serverfönster, prod-fallback, K4-fråga) — HUVUDAGENTENS yta.
Denna våg tog del (b) (tio nya sviter) + ROTFYNDET dynamic-catalog: noll
filöverlapp med rättningen (dess filer _r107-*, kor-alla-tester,
tradspermanens/scenarion/tidsstampel/styrelse — orörda).

## 1. ROTFYND: dynamic-catalog titel-drift (förmätning)

`src/lib/ak1a/dynamic-catalog.ts` = engångsgenererad ur
`public/deep-courses.json`; generatorn finns inte i verktyg/, svit saknades ⇒
8 titlar glidit mot källan (alla: källan den korrigerade): Överconfidence→
Overconfidence · Utdelnings-tillväxt→Utdelningstillväxt · Kassatäckning & runway —
nyemissionsrisk→Kapitalförbränning — runway · Återinvestering (×2, odisambiguerade)
→ …portföljens ränta-på-ränta / …utdelningens kraft · Graham's→Grahams formel ·
Detailhandel→Detaljhandel · Fiscal politik→Finanspolitik.

**MONTERING:** noll konsumenter i src/verktyg (död export) ⇒ kundpåverkan 0;
framtida konsumenter skulle ärva driften. **KUR:** 8 titlar riktade mot
käll-JSON (Edit, src-yta; tsc 0). **LÅS:** testa-dynamic-catalog.mjs sektion B
— titel/kategori/minuter/kapital parity bit-identisk med källan + urvalsregeln
(inga AKM1/BOKMASTER-kurser i katalogen).

## 2. LEVERANS: tio kontraktssviter (verktyg/testa-*.mjs)

| Svit | PASS | Kontraktets kärna |
|---|---|---|
| testa-nyhets-motor | 44 | parsRssXml (RSS+Atom, caps, graceful) · **valideraRssUrl SSRF-härdning: 16 attackvarianter nekas** (privata IPv4/IPv6, CGNAT, numeriska/hex-värdar, .local/.internal, creds, http) · raknaPaverkan (bas 10, bonus +20/+10, clamp) · raknaAk1aNot (max 2 V, frågeform, specificitetsordning V20>V19, juridikgrind) |
| testa-datacache | 24 | sandbox (process.chdir + TMPDIR — repets kataloger rörs aldrig): roundtrip · filnamnssanering · färskhetsfönster · korrupta rader · lasEllerHamta (cache-först, nätverksreserv, ärligt kast) · cacheStatistik · reservkatalogsgrenen (Vercel) |
| testa-signal-bus | 23 | SIGNAL_TYPER/MOTTAGARE · statiskaSignaler (form, interna länkar, determinism) · raknaStreakRisk (aktiv/risk/bruten, midnattsmatematik) · byggStreakRiskSignal (MIN_STREAK_FOR_RISK=3, ton aldrig dömande) |
| testa-organ-bus | 21 | mikroRapporter (5 organ, trösklar, determinism) · korRunda nätverksfritt (Supabase-env stryken pre-import; bounded 3 beslut, prioritet atgardar>varning>ok, score=poäng×10, ko=spegling) · transportens graceful-fall |
| testa-navigationsminne | 16 | titelFranSida · mockad localStorage: nyast-först, dubblettflytt, tak 24, namnrymdad nyckel · korrupt storage · SSR |
| testa-elevkarna | 17 | sanering (ogiltigt mal, clamp 1–15/0–3000, max 3/2 intressen/välfärd) · roundtrip · valfardsGrad 0–3 med tonkontroll |
| testa-klientkontext | 29 | lästillståndens trösklar (25-porten) · paborjadKurs · predikteraNastaSteg hela prioritetskedjan (88→82→68→62→55→fallback) · lasKlientkontext SSR |
| testa-eko-koppling | 18 | renSlugLista (API-query, åäö, tak) · raknaKallsystem (första förekomst) · EKO_FAS2_NIVA=25-paritet · raknaEkoInsikter graceful |
| testa-shortseller-bank | 24 | bankinvarianter via 200 drag (exakt ETT ratt svar per beräkningsattack, kursRef översättningsbar) · nivå/ämnes/exkluderings-styrning · kontextuellInledning · historiska fall 10/10 · amneFranTes (träffordning) · forsvarsFragor (unika, sokratiska, maxAntal) |
| testa-dynamic-catalog | 14 | inre konsistens (205, unika, kategorier, nivåer) + **paritetslåset mot källan** (B2 fångade de 8 titlarna FÖRE kuren — bevisat vaksamt) |

**Summa: 230 PASS / 0 FAIL.** Alla sviter slutar med
`SVIT <NAMN>: n PASS / m FAIL` + exitkod — aggregatorns kör-alla-upptäckt
(testa-*.mjs) plockar dem mekaniskt vid nästa svep.

## 3. Metodfynd: _o106-ts-import.mjs (delad resolve-hook)

Node ≥22.18 type stripping löser ENDAST fullständiga specifierare — moduler
med interna `./x`-/`@/lib/x`-importer (nyhets-motor→datacache,
organ-bus→@/lib/supabase-rest m.fl.) gick inte att importera direkt ur svit.
Lösning: `module.registerHooks`-resolve-hook (endast verifierad för testa-*
-sviter, ALDRIG prod-kod) som mapprar @/→src/ och prövar .ts/.tsx/index.
Tidigare sviter kom runt detta genom att bara importera lager med `import
type`-beroenden — dokumenterad metodgräns nu breddad.

## 4. EFTER-mätning: motorregistret

`node verktyg/_r107-motorregen.mjs --skriv`: **102 bevarade + 4 nya = 106
motorer · testtade 106 · otestade 0** (de 4 nya = s6-omgångens
frågelager etfmekanik/kontrahent/marknadsrytm/multipel — redan testade,
registret var ej regenererat sedan). data/motorregister.json landad;
data/rapporter/motorregister-2026-09-19.md förblir 09-19-snapshot (historik).

## 5. KVD

tsc 0 via projektbinär (EXIT=0) · INGET bygge (prod-synken äger; src-ändringen
= 8 titelsträngar i en konsumentlös modul) · R2 orörd · data/blogg/ orörd ·
syskonytor orörda (commit med exakt pathspec) · nätverksberoende grenar
testade ENBART i graceful-fall (Supabase-env stryken pre-import) · juridikgrind
(testerna E8: aldrig köp/sälj-råd).

## 6. Kö vidare i spåret

- VÅG 213 (a) kvarstår delvis: aggregatorens miljöklassning
  (arbetsyta-/prodklasser som ärlig rapportstruktur) — huvudagentens yta.
- Registrets monteringsgap för dynamic-catalog (död export): bokförd — antingen
  koppla katalogen till en konsument eller gallra den; separat våg (R2-neutral).
