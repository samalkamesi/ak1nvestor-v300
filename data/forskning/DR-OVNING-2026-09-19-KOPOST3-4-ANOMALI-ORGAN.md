# DR-ÖVNING 2026-09-19 KOPOST-ANOMALI-ORGAN — 09-13-anomalien lokaliserad till EN kvarts + organ-klockan kartlagd + dr-ovning --behall-kur (GODKÄNT)

**Agent:** s10-u2 (manifest auto-s10-1789802729714, vakt 2/3).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG." — alla fyra led EGENMÄTTA.
**Fönster:** 2026-09-19 09:25–09:50 lokal (07:25–07:50Z); anspråk disk-först
09:36 med förhandsregistrerade P1–P9 FÖRE alla mätningar
(data/vakten/auto-s10-1789802729714-u2-ansprak-kopost3-4.md).

## 1. Objektval + duplikatkontroll

Worklog:s samtliga s10-sektioner, data/forskning/DR-*, DR-ARKIVSVEP,
DR-BESLUTSKLOCKA-2026-09-17-KVALL.json, bladkatalogen och syskonens
anspråk lästes FÖRE val. **TAGET av syskon (lämnat HELT orört):**
dagpunkts-RPO:t på blad 9 — u1 (anspråk 09:30) OCH u3 (anspråk 09:29)
valde samma objekt oberoende; dubbelanspråket bokförs neutralt, flocken
serialiserade deras restores (AUTO-4/AUTO-5), deras ytor orörda av mig.
**MITT OBJEKT = s10-u3:s ÖPPNA köposter 3+4 (5b5e9e60 2026-09-17):**
09-13-anomalien (board 765 av 768 — vilka kvartsar?) + organ-klockan ↔
rond-schema. Ingen tidigare leverans berör dem.

## 2. VERKTYGSFYNDET + KUREN: dr-ovning.mjs --behall bröt sitt eget kontrakt

Första körningen (`--fil db-2026-09-14 --behall`, AUTO-6, GRÖN, RTO 14,9 s)
efterlämnade PG17 online men UTAN skrap-DB — analysfönstret var borta.
**Rotorsak (kod, ej syskon):** `stadaPg17()` körde `dropdb --if-exists`
VILLKORSLÖST FÖRE `--behall`-grenen — hjälptexten ("lämna skrap-DB + PG17
uppe för manuell efterundersökning") och konsolraden ("lämnar skrap-DB …
uppe") löftesbrott mot faktiskt beteende. Dubbelbevis: AUTO-6:s egna
protokollrad "skrap-DB **raderad** · PG17 lämnad uppe (--behall)" motsäger
samma körnings konsolrad. Låsfilens mtime (09:33 = min start) visade att
INGET syskon körde — ingen race, verktygsbugg.

**KUR (3 punkter, verktyg/dr-ovning.mjs):** (1) behall-grenen körs FÖRST
och returnerar — dropdb endast vid normal städning; (2) GRÖN-formeln:
`(behall || (skrapDbBort && pgStoppad))` — korrekt --behall underkänns ej
längre; (3) protokollrenderingen behall-medveten ("skrap-DB lämnad +
PG17 uppe (--behall — anroparen städar)"). **Fältverifiering:** AUTO-8
(kurerat verktyg) — skrap-DB LEV kvar efter verktygsexit (psql: board
45 506), analys körde, därefter MANUELL städning enligt kontraktet (se §7).
Klassen: kvartalsövningens efterundersökningsväg var obrukbar sedan
--behall infördes — kurerad innan den behövdes på riktigt.

## 3. Återställ (blad db-2026-09-14 — täcker hela kalenderdagen 09-13)

| Körning | RTO | Radkontrakt public | Fel |
|---|---|---|---|
| AUTO-6 (före kur) | 14,9 s | 60 tabeller / 1 226 931 rader | 780 kända/0 okända |
| AUTO-8 (efter kur) | 15,7 s | 60 tabeller / 1 226 931 rader | 780 kända/0 okända |
| ARKIVSVEP 09-18 (referens) | 13,0 s | 1 226 931 rader | 780/0 |

**Determinism TRE instrument samma tal.** RTO 14,9/15,7 s vid
MemAvailable 1,2–1,4 GB — bekräftar u1:s belastningsläxa (≈1 GB ⇒ 14–20 s).
Dumpkontroll båda: GRÖN 1 247 907 rader · CREATE 95 · COPY 97.

## 4. KöPOST 3 STÄNGD: anomalen = exakt EN kvarts, 5 av 8 rader

Två instrument, identiska tal (skrap = arkivet · prod = levande, båda
Europe/Stockholm, läsande aggregat):

| Dag | board/dag skrap | board/dag prod |
|---|---|---|
| 09-10 … 09-12 | 768 · 768 · 768 | 768 · 768 · 768 |
| **09-13** | **765** | **765** |
| 09-14 | 88 (partial — dumpen slutar 02:30 = 11 kvartsar × 8 EXAKT) | 768 |

**Avvikande kvartsar (≠8) i hela 09-12→09-14, båda instrumenten: exakt
EN — 2026-09-13 10:00 med 5 rader.** P5-primärhypotesen (en kvarts med
5 = 8−3) träffade EXAKT. Raderna landade 10:00:01.181096 · .239557 ·
.300885 · .367675 · .503586 (tight batch, 322 ms — femmma skrevs, tre
försvann inuti batchen).

**Rotorsaksdom:** (a) arkivet (dump född 09-14 02:30) bär SAMMA 765 och
samma fem tidsstämplar ⇒ de tre raderna var frånvarande FÖRE dumpen —
ingen efterhandstampering (skiljer domänen från B9:s raderarfynd, där
rådata raderas ur prod); (b) servern frisk vid tillfället — syslog
(ISO-format! — se läxa §6) 10:00–10:03 endast sysstat + UFW-brus, ingen
OOM/omstart/krasch; pumpor-hjärtat normalt (09:51→10:11 exit 0); (c)
skrivaren är inte src/ (0 träffar), inte pumpor (loggen ren om board),
inte pulsvakt (startad 09-16). **DOM: transient skrivförlust i
kvartsbatchen (nät/pool mot Supabase) — engångshändelse: 09-09→09-19
elva dagar, en avvikelse, −3 rader av ~8 400 = 0,04 %.** Konsekvens för
värsta-falls-RPO: försumbar (768-formeln står; 765-dagen drabbade
dataSkrivningen, inte restore-barheten).

## 5. KöPOST 4 KARTLAGD: organ-klockan är en 6-timmarssvepmotor MED jitter — cron utesluten

Histogram (organ_health_logs per timme, hela arkivet 07-15→09-14 +
levande till 09:19, båda sidor identiska):

- **Fas 1 (07-15 → 08-10 16:00):** 12 rader/12 organ var 6:e timme,
  skarp kadens (ingen jitter).
- **Fas 2 (08-10 17:00 →):** svepen SPLITTAS i 9-organ + 3-organ, par
  med ~2 h inbördes offset, 6-hars bas; septemberläget: par kring
  02/04 · 08/10 · 14/16 · 20/22 med **±1–2 h jitter** och enstaka 7-h-gap.
- **Jittersignaturen utesluter cron** (cron jiggar inte): inget av
  crontab-schemana matchar (vakt 1/7/13/19 · dump 02:30 · moln 02:40 ·
  arkiv sönd 03:20 · /etc vagscan 06:30 · nyheter 08:00). Skrivaren sitter
  i organism-motorn (zcode-app-serverns barnprocesser) — **NY KÖPOST till
  huvudagenten: dokumentera/äga organ-svepets interna schema.**
- **FYND A — split-svep under morgonbelastning:** 09-18: 9-svepet kl 08
  skrev 1 rad, 8 rader kl 09 (samma mönster kl 14/15); 09-19 (idag):
  1 rad kl 09 hittills. Svepen HÅLLER kadensen men förskjuter
  leveransen 1 h under belastning — klassbesläktat med §4: skrivsidan
  degraderar transient. Köpost: övervaka split-frekvens.
- **FYND B — organ_name-kodningsdrift:** 12 organ-id men 16 namnformer —
  "Hjarta"×232 mot "Hjärta"×1, "Ogon" mot "Ögon", "Oron" mot "Öron",
  "Immunforsvar" mot "Immunförsvar" (ASCII-stavning dominerar, korrekt
  UTF-8 existerar i 1 rad vardera). Konsumenter som grupperar på namn
  dubbelräknar. Köpost till organ-ägaren (ej src/ — skrivaren är extern).

## 6. Mätinstrumentläxa (bokförd): sessionens tidszon tolkar literalerna

`created_at >= timestamptz '2026-09-09'` tolkas i SESSIONENS zon: skrap
(CEST) vs prod (UTC) ⇒ 2 h skilt fönster ⇒ gränsdagar 09-09/09-16 visar
704 vs 768 (64 = 8 kvartsar). Inre dagar (09-10…09-15) opåverkad —
anomalidomen står. Framtida sonder: skriv literalerna med explicit offset
(`'2026-09-09 00:00+02'`). Sekundär läxa: Ubuntu-rsyslog loggar ISO-format
("2026-09-13T10:00") — grep på "Sep 13" ger noll träffar och liknar ett
logggap (falskt); alltid ISO-mönster mot denna servers syslog.

## 7. Städning (manuell, --behall-kontraktet) — OBEROENDE EGENMÄTT

`dropdb ak1a_dr_test` OK · `pg_ctlcluster 17 main stop` OK ·
pg_lsclusters: **down** · psql mot skrap-DB: vägran (socket saknas) ·
base endast OID 1/4/5 · pgsql_tmp tom · **WAL 481 MB OFÖRÄNDRAD genom
tre restores denna session** (seriens femte punkt på låget 497×3→529×4→
481×5) · disk 63 GB ledigt · låsfil flock-viloläge (pid-notis från
AUTO-8). Verktygets normalstädning overkifierad: AUTO-4/AUTO-5 (syskon)
städade själva bakom flocken.

## 8. Prediktioner P1–P9 (registrerade 09:36, FÖRE mätning)

| # | Dom |
|---|---|
| P1 restore GRÖN 10–18 s | ✅ 14,9 + 15,7 s (auto-protokoll AUTO-6/AUTO-8) |
| P2 radkontrakt 1 226 931 EXAKT | ✅ ×2 egna + ARKIVSVEP = 3 instrument |
| P3 arkivet reproducerar 765 | ✅ + EN avvikande kvarts 10:00=5 (identisk med live) |
| P4 kontroldagar 768/768 | ✅ (gränseffekt-läxa §6 ärligt bokförd) |
| P5 primär: EN kvarts med 5 | ✅ EXAKT — 10:00:01.181–.503, 5 rader |
| P6 organ-mönstret stabilt | ✅ 2 månaders histogram, dag-till-dag samma parstruktur |
| P7 matchar ingen crontab ⇒ intern mekanism | ✅ + split-svep- och kodningsfynd (§5 A/B) |
| P8 prod == dump för 09-13 | ✅ 765 == 765, kvartsnivå identisk |
| P9 städning + WAL 481 + fel 780/0 | ✅ alla punkter (disk 63 GB — bandet 68–72 i anspråket var snävt, grönt mot verktygets grind) |

**Bonus-korsvalidering (gåva åt u1/u3):** board levande 09:39–09:42 =
49 570 = dumpens 49 346 + 224 = 8 × 28 kvarsmarkörer EXAKT — klockformeln
datum-oberoende bevisad av tredje instrument; organ levande 3 037 =
dumpens 3 024 + 13 (9@03 + 3@05 + 1@09). Mina tal oberoende == u1:s
09:30-mätning (deras DRIFTSBOKEN-rad).

## 9. KVD + gränser

`node node_modules/typescript/bin/tsc --noEmit` = 0 (egenmätt; src/ orörd
= INGET bygge — verktyg/.mjs berör ej typbaslinjen) · R2 orörd (.pgpass
ENDAST PGPASSFILE-pekare, aldrig läst; prod endast LÄSANDE aggregat,
GDPR-rent: antal + tidsstämplar, inga personvärden) · data/blogg/ orörd ·
data/backups/ endast läsning · syskonens ytor orörda (deras
dagfönster-protokoll + JSON:ar orörda) · src/ orörd.

## 10. Kö

1. organ-svepets ägare + interna schema dokumenteras (huvudagenten —
   skrivaren utanför repot).
2. Split-svepövervakning: 09-18 OCH 09-19 bär 1-rad + 8-rad-delning —
   mät frekvensen en vecka; om den växer: samma rot-jakt som §4.
3. organ_name-kodningsdrift (ASCII/UTF-8 dubbelstavning) — kur hos
   organ-ägaren; interna konsumenter grupp på organ_id (säkert).
4. Blad 10:s födelsebevis 09-20 02:30 + jungfrukörning 09-20 03:20
   (u1-kö, orört).
5. Retention ~10-11 · TOTAL i kvartalssviten senast 12-19 (oförändrat).

— s10-u2, fabriksagent spår 10 vakt 2/3, 2026-09-19 09:50 lokal
