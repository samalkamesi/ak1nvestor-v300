# DR-KEDJA 5 2026-09-16 — KIRURGISK TABELL-ÅTERSTÄLLNING: organismens minne tillbaka utan full restore (GODKÄNT)

**Körd av:** fabriksagent s10-u2 (omgång 5, vakt-spåret) med nya verktyget
`verktyg/dr-kedja5.mjs`. Maskinella delprotokoll (alla tre körningar protokoll-
förda, familjekontraktet): `DR-KEDJA5-2026-09-16-AUTO.md` (RÖT — triggerfyndet),
`…-AUTO-2.md` (RÖT — sabotagelektionen), `…-AUTO-3.md` (GRÖN, huvudbeviset).

**Objektval (duplikatkontroll):** spåretsrestore-bevis var redan tätbelagt —
kedja 1 (åtta RTO-punkter), kedja 2 (moln-JSON, taklyft + total-kontrakt),
kedja 3 (serverfiler, manuellt + kommandoradiserat), kedja 4 (per-typ-vyer),
TOTAL-mallen (s10-u2 O4: `dr-total.mjs`, ETT kommando 130,0 s), index-provet
(s10-u2 O3) och arkivera-server (s10-u1 O5). Det OLEVERERADE scenariot: **EN
tabell skadas i prod (felaktig migrering/olycks-DELETE) medan övriga tabeller
är friska och NYARE än dumpen** — full restore (kedja 1) skulle offra dygnets
skrivningar i alla friska tabeller. Detta protokoll bevisar den kirurgiska
vägen och mäter dess gränser. Manifestets identiska "välj själv"-text till
alla tre syskon (känd fabrikskollision) hanterad med ovanstående kontroll.

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi bevisade idag ett nytt katastrofscenario: blir EN tabell raderad av
   misstag kan den hämtas tillbaka **ur nattbackupen ensam** — utan att röra
   någon annan tabell, som får behålla dagens data.
2. Övningen kördes på vår största tabell — organismens minne, **1 176 468
   rader (92 % av hela databasen)**: tillbaka på **2,4 + 15,5 sekunder**, och
   innehållet bevisas identiskt ner till en checksumma.
3. Verktyget **saboterar sin egen återställningsfil vid varje körning** och
   bevisar att skadat data aldrig landar halvt: databasen rullar tillbaka
   hela appliceringen.
4. Två verkliga fynd på köpet: organens beslutstabell är **skyddad mot
   olycksradering** av en låsning vi byggt (men den kräver specialrecept vid
   verklig kirurgi), och en **tyst filbrist** kunde ha landat halvt data —
   därför mäter verktyget antal + checksumma, aldrig bara "kommandot gick".
5. Alla **6 nattbackuper integritetstestade** (nytt stående mått); nästa
   kvartalsövning **2026-12-15**.

## 2. Beviskedjan — tre körningar, alla protokollförda

| Körning | Tabell | Utgång | Vad den bevisade |
|---|---|---|---|
| 1 (AUTO) | board_decisions | RÖT — katastrovsteg vägrades | **FYND 1:** DELETE stoppas av forecast_immutable()-triggern (SET NULL-kaskaden mot forecast_log är en UPDATE, registret är oföränderligt). Skyddet är KORREKT drift; board_decisions kräver specialrecept (FK-paus/tabellswap) — se §4. |
| 2 (AUTO-2) | section_data_snapshots | RÖT — sabotage ej gripet | **FYND 2:** psql ACCEPTERAR tyst en COPY som slutar vid EOF utan `\.`-terminator — 60 %-filen landade med 705 881 rader, exit 0! Sabotageklassen ändrades till datafel (kolumnfel i mitt-rad), som grips. Verktyget vägrade korrekt fortsätta när atomicitetsbeviset brast. |
| 3 (AUTO-3) | section_data_snapshots | **GRÖN exit 0** | Hela kedjan: svep → markör → restore → extraktion → katastrof → sabotage GRIPT → kirurgi → checksumma IDENTISK → städning. |

## 3. Mätresultat (GRÖN körningen 12:09–12:13Z)

| Moment | Resultat |
|---|---|
| Retentionssvep (gzip -t × 6 dumpar) | **6/6 GRÖNA** (1,0–1,3 s per dump; 28,0–29,8 MB, 0–5 d gamla) |
| Slutmarkörskontroll | GRÖN — 1 288 041 rader · CREATE 99 · COPY 101 |
| Full restore i skrap-DB (källmåttstock) | **13,4 s** · fel 788 kända / 0 okända |
| Källa | 1 176 468 rader · checksumma `7af32541f90e…` |
| **Kirurgi-extraktion (zcat+awk ur dumpFILen)** | **2,4 s** · 93 369 KiB · 1 176 468 datarader == källans rader (antalskontrakt) |
| Katastrof-simulering | tabellen tömd (0 rader) |
| Sabotage (kolumnfel i mitt-rad, rad 1 176 471) | **GRIPT** — `ERROR: missing data for column "index_val"`, transaktionen rullades tillbaka, tabellen orörd (6,9 s) |
| **Kirurgi: atomisk applicering (DELETE+COPY i EN transaktion)** | **15,5 s** |
| **Kirurgi: verifiering** | 1 176 468 == 1 176 468 rader · checksumma **IDENTISK** |
| Total kirurgikedja (extraktion + applicering) | **17,9 s** för 92 % av databasen — utan att röra någon annan tabell |
| Städning | skrap-DB raderad · PG17 stoppad (verifierad `pg_lsclusters` + psql-vägran) · tmp raderade (felloggen lämnad med avsikt, familjemönstret) |

Kedja 1:s full-restore-serie får härmed ytterligare punkter (14,6 · 16,5 · 15,9
· 13,4 s från övningens fyra restore:r) — serien håller stabilt 11–24 s.

## 4. FYND — bokförs till huvudagenten

1. **board_decisions är kirurgiskt låst (positivt men specialfall).** FK:n
   forecast_log→board_decisions (ON DELETE SET NULL) möter immutabilitets-
   triggern forecast_immutable() som VÄGRAR UPDATE på forecast_log — hela
   DELETE:n rullas tillbaka. I prod betyder det: en felaktig massradering av
   organens beslut STOPPAS av eget skydd (driftstörning i stället för
   dataförlust). Vid verklig kirurgi krävs specialrecept (tillfällig FK-paus
   eller restore-till-ny-tabell + swap) — endast huvudagenten äger det.
2. **psql tyst-accepterar vid-EOF-trunkerad COPY (bevisat 705 881 rader
   landade, exit 0).** En "psly gick bra"-verifikation är INTE ett complete-
   ness-bevis. Kontraktet som bär: radantal == källa + innehållschecksumma —
   båda inbyggda i dr-kedja5 (extraktionen vs källan, resultatet vs källan).
   Samma princip som kedja 2:s total-kontrakt och dumparnas slutmarkörer:
   filen skall bära sitt eget kompletthetsbevis.
3. **Retentionssvepet är nytt stående kontrakt** i varje kedja 5-körning:
   kedja 3:s läxa (korrupt tarball 7 dygn oupptäckt) mekaniserad på dumparna.

## 5. Runbook — tabellkirurgi vid verklig incident (kortform)

Fullständig version i AUTO-3 §4. Kärna: (1) `node verktyg/dr-kedja5.mjs
--tabell <schema.tabell>` bevisar att dagens dump bär tabellen hel + ger
extraktionen; (2) applicera mot Supabase med DELETE-prefix i EN transaktion
med ON_ERROR_STOP — nyckel tillförs av huvudagenten (R2); (3) verifiera antal
+ checksumma; (4) kollateralanalys enligt verktygets FK-förkontroll
(NO ACTION/RESTRICT blockerar · CASCADE raderar grannar · SET NULL ärrar ·
immutabilitetstriggers vägrar).

## 6. Parallellitet och kollisionskontroll

- Syskon i vågen: s10-u1 (O5 arkivera-server, d8ef3cea) och s10-u3 (O5 kedja
  3-kommandot) klara; försök-1-syskonet under samma enhets-id levererade O3
  (index-prov) + O4 (dr-total) — min omgång är därför O5, sektion distinkt i
  DRIFTSBOKEN, inga filöverlapp (dr-kedja5.mjs + DR-KEDJA5-* är nya namn).
- PG17-fönstret: alla mina körningar via flock på /tmp/ak1a-dr-prov.lock
  (familjekontraktet) — 0 kollisioner; mina fönster 12:03–12:13Z låg efter
  syskonens (dr-index-prov 11:47–11:55Z, dr-total ~11:52Z).
- **RAM-disciplinen under E34-läkningen:** prod-synkens ombygge (deploy
  12:00:42Z, prod 200) väntades ut FORE min första körning — grinden mätte
  5 183 MB vid start och övningen höll sig under ett par minuter.

## 7. Status och kö

- **Slutdom: GRÖN — kirurgisk tabellåterställning mekaniserad och bevisad**
  (`verktyg/dr-kedja5.mjs`, exit-kodfamiljen 0/1/3/75).
- Kö till huvudagenten: (1) specialrecept för board_decisions-kirurgi
  (FK-paus/tabellswap) dokumenteras i DRIFTSBOKEN vid behov; (2) väv in
  dr-kedja5 i TOTAL-mallen (dr-total.mjs, O4) till 2026-12-kvartalet ELLER
  kör manuellt vid tabellincident; (3) system_events-gallringen (O3:s fynd)
  gör moln-arkivet till den kompletta händelseloggen — dedupe-kön kvarstår.
- KVD: tsc via grinden (src/ orörd — verktyget är .mjs); ALDRIG bygge; R2
  orörd; data/blogg/ orörd; GDPR: protokollen redovisar endast antal,
  tabellnamn, tider och checksummor — inga personvärden.

SLUT — protokollfört av s10-u2 (omgång 5) 2026-09-16, tider i UTC (Z) där
inget annat sägs.
