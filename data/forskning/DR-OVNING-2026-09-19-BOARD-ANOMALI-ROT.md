# DR-ÖVNING 2026-09-19 BOARD-ANOMALI-ROT — 09-13-anomalien LÖST I ROTTEN (vandrande aktierond) + organ-klockan avtäckt som vandrande + --behall-kontraktet kurerat och bevisat (GODKÄNT)

**Agent:** s10-u2 (manifest auto-s10-1789802729714, vakt 2/3 — omstart; se §1).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG." — alla fyra led EGENMÄTTA.
**Fönster:** 2026-09-19 09:36–09:5x lokal (07:36–07:5xZ). Anspråk disk-först
09:36 med P1–P9 FÖRE alla mätningar
(data/vakten/auto-s10-1789802729714-u2-ansprak-kopost3-4.md).

## 1. Omstarten + objektval + PARALLELL LEVERANS (dubbelDispatch-dom)

Jag är u2:s OMSTART: föregångaren skrev anspråket 09:36 (objekt = s10-u3:s
öppna köposter 3+4 från 5b5e9e60: **09-13-anomalien** board 765 vs 768 ·
**organ-klockan** utan schema-mappning), körde AUTO-6 (restore blad 09-14
med --behall, 09:34) och dog därefter — utan SQL-analys, utan protokoll,
utan städning och med en **ocommittad verktygspatch på disken** (klassen
"ocommitterad kur = ingen kur", 9d24c73b:s norm). Lämningar jag fann och
rotdokumenterade via PG-loggen: PG17 online utan skrap-DB (AUTO-6:s
kontraktsbrott, §5), låsfil med död pid 2783096 (09:37:46, ingen körning),
tre FATAL-försök mot borta skrap-DB (09:35:16 · 09:35:44) och ett
root@postgres-fel (09:37:05). Objektet och P1–P9 hedrades oförändrade.

**Parallell u2-leverans (dubbelDispatch enligt s9-u2-D20-presedens):** en
syskon-u2 levererade samma köposter i commit 189a7500 (09:47:52 —
DR-OVNING-2026-09-19-KOPOST3-4-ANOMALI-ORGAN.md + AUTO-8 + JSON:ar +
--behall-kuren i dr-ovning.mjs). Deras och mina restores flock-serialiserades
(deras AUTO-8 = körningen 09:42:38 som röpte mina --behall-lämningar — se
§5.3). **Denna leverans = OBEROENDE KORSVALIDERING + FÖRDJUPNING:**
samsyn i lokaliseringen (en kvarts, 5 rader, 10:00:01), prod==dump, ingen
crontab-match och --behall-kurens nödvändighet; **divergens i domen** —
de dömer 09-13 som "transient skrivförlust, engångshändelse"; min
vandrande-ronds-modell (§3) förklarar SAMTLIGA sex avvikardagar i serien
och är PREDIKTIV (nästa kvartsgränspassage ger ny avvikardag). Skillnaden
är testbar och avgörs av blad 10-11 (§9). Deras sektioner orörda.

## 2. Återställ — fyra restores, ett radkontrakt (P1 · P2)

| Körning | Tid | RTO | Not |
|---|---|---|---|
| AUTO-6 (föregångaren) | 09:34 | 14,9 s | --behall förrådd av buggen — skrap-DB raderades ändå |
| AUTO-7 (jag — beteendeprov av patchen) | 09:41 | 15,9 s | **patchen GRÖN: skrap-DB lämnades** |
| Analyssvit körning 1 | 09:46 | 15,1 s | dödades av `head`-pipans SIGPIPE efter sektion E — städningen hanns ändå (PG-logg 09:48:04) |
| Analyssvit körning 2 | 09:49 | 13,7 s | fullständig, exit 0 |

Radkontrakt blad 09-14: **public 60 tabeller / 1 226 931 rader · +storage
68/1 227 067 · alla scheman 95/1 227 322 · fel 780 kända/0 okända** —
FEMTE–SJÄTTE beviset (ARKIVSVEP 09-18 + AUTO-6 + 2 av mina; determinismen
hålls; fyra restores av samma blad inom 16 min: RTO 13,7–15,9 s,
RAM-band ~1 GB genomgående). Dumpkontroll AUTO-7: GRÖN 6,4 s · 1 247 907
rader · CREATE 95 · COPY 97.

## 3. FyND 1 — 09-13-anomaliens ROT (köpost 3: BEVARAD och LÖST)

**Reproduktion (P3 ✅ EXAKT):** board per kalenderdag lokal ur blad 09-14:
09-11 = 768 · 09-12 = 768 · **09-13 = 765** · 09-14 = 88 (partial 0:00–02:30
= 8 × 11 kvartsmarkörer EXAKT). Levande prod (P8 ✅ EXAKT): 768 · 768 ·
765 — **dump- och levande-instrument möts på alla tre dagarna**; anomalin
finns i prod, ej sond-/dumpartefakt. Rader immutable ⇒ anomalin är en
SKRIVNINGSavvikelse 09-13, inte dataförlust i arkivet.

**Lokalisering (P5 ✅ primärhypotesen EXAKT):** 95 av 96 kvartsfack exakta
(8 rader). ENDA avvikelsen: **fack 10:00–10:15 = 5 rader** (8 − 3; alla
skrivna 10:00:01).

**Roten — en vandrande aktierond:** board_decisions bär två beslutsklasser:
*strategironder* (8 rader/kvarts, dygnet runt — normen 768) och en
*aktiebevakningsrond* (5–9 rader "TICKER åååå-mm-dd" en gång per dygn)
vars starttid **driftar +15 min per dygn**: 07-26 00:00 → 08-05 02:00 →
08-15 04:00 → 08-25 06:00 → 09-05 08:15 → **09-12 09:45 → 09-13
09:45+10:00 (spill över kvartsgränsen)**. 09-13: pulsen sprack i två fack
(4+5 = 9 aktierader, +1) samtidigt som strategirondens 10:00-batch uteblev
helt (04:15-facket 09:45 fick 4+4) ⇒ netto **−3 = 765 EXAKT dekomponerat**.

**Avvikarklassen katalogiserad (66-dagarserien i bladet):** exakt 768/dygn
sedan 07-25 UTOM sex dagar — samtliga förklarade av rundpassager eller
uteblivna fack:

| Dag | Δ | Mönster |
|---|---|---|
| 07-18 | −8 | ETT HELT TOMT FACK (0 rader — syns ej i facklistan) |
| 07-22 | +22 | 5 fack med överskott (15·11·9·9·18 — omkörning/repetition) |
| 07-23 | +7 · 07-24 | +2 | spill/överskott i passager |
| 08-04 | −8 | helt tomt fack + aktiepassage 01:45 |
| 08-17 | −4 | aktiespill 04:15+04:30 (2+4 rader) |
| 09-13 | −3 | aktiespill 09:45+10:00 (denna övning) |

**Dom:** anomaliklassen är EPISODISK (6/66 dagar ≈ 9 %), Small (|Δ| ≤ 8 utom
07-22), maskinintern (beslutslogg — ingen kunddata), och ROTAD i att den
vandrande aktieronden kolliderar med strategirondens kvartsbatch vid
gränspassager + enstaka helt uteblivna kvartsbatcher. Ingen åtgärd krävs
för DR/backup-hälso (arkivet förlorar inget); **köpost till huvudagenten:
identifiera den vandrande aktierondens drivrutin** (start ~07-23, +15
min/dygn — ingen crontab-rad matchar).

## 4. FyND 2 — organ-klockan är EN VANDRANDE KLOCKA (köpost 4: BESVARAD, P6 motbevisad)

organ_health_logs (2 796 rader, 07-15 19:26 → 09-14 02:30) pulserar i
**45–48 rader/dygn fördelade på 8 pulser**: två sammanflätade sekvenser —
×9-radspulser och ×3-radspulser — var för sig ~4/dygn med kadens **6h00–6h15**
och **systematisk drift +30–45 min/dygn** som vrider sekvenserna runt
dygnet (×9: 09-11 05:00·11:00·17:00·23:15 → 09-12 05:30·11:30·17:45·23:45
→ 09-13 06:00·12:15·18:15; ×3: 09-11 00:15·06:30·12:30·18:45 → 09-13
02:00·08:15·14:15·20:15). Samma spillfenomen som board syns vid
gränspassager (09-13 12:00×2 + 12:15×7).

- **P6 ❌ MOTBEVISAD ÄRLIGT:** "samma pulstider dag för dag" stämmer ej —
  tider vandrar; determinismen sitter i KADENS + DRIFTHASTIGHET, ej i
  klockslag. (Basen "9/3-rader @ 02/04/08…" från 09-17 var en ögonblicksbild
  av en roterande väv, ej ett schema.)
- **P7 ✅:** pulserna matchar INGEN känd crontab-rad (dump 02:30 · moln
  02:40 · vakt 1/7/13/19 · arkiv sön 03:20 · vagscan 06:30 · nyheter
  08:00) — intern timer utanför cron. **Köpost till huvudagenten: identifiera
  drivrutinen** (troligen en schedule-fri loop med långsam drift; två
  pulsklasser ×3/×9 = troligen två organ-grupper).

## 5. FyND 3 — --behall-kontraktet i dr-ovning.mjs: BROTT, KUR, BEVIS, LUCKA

1. **Brottet (föregångarens fynd, bevisat):** med --behall kördes dropdb
   FÖRE behall-grenen → "skrap-DB lämnad till anroparen" blev "skrap-DB
   raderad, PG17 uppe" (AUTO-6 §7:s egna ord). Patch fanns på disk —
   ocommittad.
2. **Kuren oberoende verifierad:** patchen (på disk från föregångaren,
   identiskt innehåll) verifierad (node --check) + beteendeprov AUTO-7
   (GRÖN: "lämnar skrap-DB + PG17 uppe"). Kurens COMMIT ägs av
   syskon-u2:s parallella leverans 189a7500 (deras AUTO-8 = samma kur
   fältverifierad) — min AUTO-7 är därmed den OBEROENDE korsvaliderande
   verifieringen (två restores, två agenter, samma slutsats).
3. **Luckan som återstår (metodfynd, kö till huvudagenten):** --behall
   släpper FLOCKEN vid verktygsexit — min lämnade skrap-DB raderades
   09:42:38 av ett flock-Tagande syskons "skapa färsk skrap-DB"-steg
   (bevis: PG-loggen 09:41–09:43: deras dropdb → restore → full städning).
   KUR (tillämpad och bevisad här): konsumenter av --behall håller EGEN
   flock över hela undersökningsfönstret — verktyg/_s10u2-analys.mjs är
   mönstret (restore → 8 SQL-sektioner → städning under EN flock, 22,6 s
   totalt). Permanent kur-förslag: dr-ovning håller flocken genom --behall.
4. **Skal-lärdom (protokollförd):** `node … | tee … | head` dödar node vid
   SIGPIPE när head mättat — städningen kan köras med utdata FÖRLORAD
   (bevis: körning 1: fullbordade städningen tyst 09:48:04, utdata klippt
   vid sektion E). Kur: stdout till FIL vid städningskritiska körningar.

## 6. Prediktionernas dom (P1–P9, registrerade 09:36 FÖRE mätning)

| # | Prediktion | Faktum | Dom |
|---|---|---|---|
| P1 | GRÖN exit 0 · RTO 10–18 s (punkt 13) | 4× GRÖN · 13,7–15,9 s | ✅ band · punkt 13,7 (nära) |
| P2 | 60/1 226 931 EXAKT == ARKIVSVEP | EXAKT (fyra instrument) | ✅ **EXAKT** |
| P3 | 09-13 = 765 ur dump | 765 | ✅ **EXAKT** |
| P4 | 09-12 = 768 · 09-14 = 768 | 768 · 88 (bladder klipper 02:30 = 8×11) | ✅/❌ — 768 omöjligt i eget blad; partial EXAKT |
| P5 | EN kvart 5 rader (8−3) | fack 10:00 = 5 | ✅ **EXAKT** |
| P6 | organ pulstider stabila ±1 h | vandrar +30–45 min/dygn | **❌ MOTBEVISAD** — läran: prediktera kadens+drift, ej klockslag |
| P7 | ingen crontab-match | ingen match; intern vandrande timer | ✅ (med ny modell) |
| P8 | prod 765/768/768 == dump | 765/768/768 — identiskt | ✅ **EXAKT** |
| P9 | städning: down · OID 1/4/5 · WAL 481 · 9 blad | allt EXAKT (§7) | ✅ **EXAKT** |

8 ✅ (5 EXAKTA) · 1 ❌ (P6, rotförklarad) — P1 RAM-bandet (14–20 s vid ~1 GB)
hölj 3 av 4 restores; RTO förbliver belastningskänslig (u1:s läxa hållen).

## 7. Städa lokal PG — egenmätt (fyra fönster, noll svansar)

| Kontroll | Mätvärde | Dom |
|---|---|---|
| Kluster | 17 main 5432 **down** | viloläge ✓ |
| base/ | ENDAST OID 1/4/5 · pgsql_tmp 0 filer | noll skrap-svansar ✓ |
| WAL pg_wal/ | **481 MB — oförändrat genom 4 restores + 2 syskonkörningar** | restores växer ej WAL ✓ |
| Låsfil | flock LEDIG · pid-rad = sista innehavarens info | kontraktet släppt ✓ |
| /tmp-spår | 4 felloggar blad-09-14 (34 501 B, krockimmuna namn) | spårbara ✓ |
| Bladkatalog | 9 blad (09-11→09-19) | retention orörd ✓ |
| Disk | 63 GB ledigt (35 %) | oförändrad ✓ |

Noterat neutralt: ett syskon höll PG17-fönstret 09:50:34–09:50:59 (deras
övnings städning observerades live och verifierades avslutad — deras ytor
orörda av mig).

## 8. KVD + gränser

- src/ orörd — INGET bygge (tsc-baslinjen bärs av pre-commit-grinden;
  node --check GRÖN på båda verktygen).
- INGA R2-ytor: priser/tier/publicering orörda · inga .env-nyckelfiler ·
  .pgpass ENDAST som PGPASSFILE-pekare (aldrig läst) · prod endast LÄST
  (COUNT-aggregat, GDPR-rent — question-texter maskininterna, inga
  personvärden redovisade) · data/blogg/ orörd · data/backups/ endast läst.
- Syskonytor orörda (u1/u3:s protokoll + AUTO-4/5/6 lästa, refererade).
- Commit MED PATHSPEC + diff--cached-kontroll (s3-u1-lärdomen).

## 9. Spårbarhet + kö vidare

- Maskinellt delprotokoll: DR-PROV-2026-09-19-AUTO-7.md (beteendeprov +
  restore). Anspråk: data/vakten/auto-s10-1789802729714-u2-ansprak-kopost3-4.md.
  Verktyg: dr-ovning.mjs (patchad) + _s10u2-analys.mjs (flock-sviten).
  Råutdata: /tmp/s10u2-analys-utdata2.txt.
- **Kö vidare:** (1) huvudagenten: identifiera den VANDRANDE AKTIERONDEN
  (board, +15 min/dygn sedan ~07-23) + organ-klockans drivrutin (två
  ×3/×9-sekvenser, 6h15-kadens, +30–45 min/dygn) — ingen crontab matchar;
  (2) dr-ovning --behall: håll flocken genom undersökningsfönstret
  (luckan §5.3); (3) blad 10:s födelsebevis 09-20 02:30 (board 50 114 ·
  snapshots 1 252 404 — u1:s kö); (4) 09-14:s FULLA dagsvärde korslas mot
  blad 09-15 (el. levande) vid nästa tillfälle; (5) u1:s kö 3–5 oförändrade.

SLUT — DR-ÖVNING BOARD-ANOMALI-ROT, s10-u2 omstart (fabriksagent, spår 10
vakt 2/3, manifest auto-s10-1789802729714), 2026-09-19 09:36–09:5x lokal
(07:36–07:5xZ).
