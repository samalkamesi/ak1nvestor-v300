# DR-ÖVNING 2026-09-20 — JUNGURKVITTO 03:20 + KEDJA 3 PÅ JUNGURARKIVEN (s10-u1)

**Agent:** s10-u1 (manifest auto-s10-1789878902744, vakt 1/3). Order: DR-övning
nästa i spåret — återställ, mät tid/rader, protokoll, städa lokal PG.
**Val:** jungurkörningen 03:20 (`arkivera-server.mjs` första SCHEMALAGDA
söndagskörning) + kedja 3:s första prövning av dagens jungurarkiv — syskonen
u2/u2 höll blad-10-ytan (födelsebevis + replik 2; deras AUTO/AUTO-2), jungur-
köposten var tre gånger bokförd och orörd. Anspråk med P1–P10 låsta FÖRE
mätning: `data/vakten/auto-s10-1789878902744-s10-u1-ansprak.md` (06:5x CEST).

---

## 1. Jungurbeviset — schema × verkställighet × leverans (P10)

| Länk | Bevis |
|---|---|
| Schema | crontab-rad 4: `20 3 * * 0 cd /home/ak1a/AK1 && /usr/bin/node /home/ak1a/AK1/verktyg/arkivera-server.mjs >> /tmp/server-arkiv.log 2>&1` |
| Verkställighet | `/tmp/server-arkiv.log` 2026-09-20: `[6] arkivera-server 2026-09-20: ALLT GRÖNT · 65 s totalt.` |
| Leverans | 5 artefakter på disk, mtime 01:20:33–01:21:06Z (= 03:20–03:21 CEST): tar.gz 225,9 MiB · bundle 219,9 MiB · nginx-conf · crontab.txt · pm2-dump.json |

Verktygets egna moment ur loggen: minisjälvtest GRÖN (trunkerad gzip grips) ·
tar 225,9 MB / **13 023 poster** / 726 src ts/tsx på 42,3 s · bundle complete
history 219,9 MB på 22,5 s · konfigsnapshots nginx 57 rader / crontab 5 aktiva
rader / pm2 4 processer · retention 0 raderade. **Detta är spårets första
AUTOMATISKA veckoarkivering** — 09-08/09/09 kom från datorns hybrid-sync och
09-16 från agent-manuell körning (F8-kön); jungur = cron-epokens början.

## 2. Konfigsnapshot-dom (P7) — GRÖN 3/3

- **nginx:** artefakten (58 rader inkl. verktygets tillagda radbrytning) ==
  levande `/etc/nginx/sites-available/ak1a` (57 rader) — normaliserat innehåll
  IDENTISKT.
- **crontab:** artefakten == proveniensheader (2 rader: "källa: crontab -l
  (användare ak1a@contabo) — server-snapshot …") + `crontab -l` kropp, 5 == 5
  aktiva rader IDENTISKA.
- **pm2:** giltig JSON · 4 processer (ak1a · ak1a-pumpor · ak1a-test ·
  pulsvakt) · ak1a med · namnmängden oförändrad mot levande pm2 vid mätningen
  (06:5x).

## 3. Retentionspunkt (P9)

6 veckoarkiv på disk (repo 09-08/09-09/09-16/09-20 + bundle 09-16/09-20).
60-dagarsregeln skulle idag radera **0** (äldsta 11,2 dygn). Nästa retentionsträff
(äldsta + 60) ≈ **2026-11-15**. system-events-full orörs (arkivhandlingar).
Disk före övningen: 58 GB ledigt (40 % använt).

## 4. R2-notis i arkivlistan (P9-delen)

Tar-listningen visar `.env`-namnen (`.env`, `.env.local`,
`.env.production.local`) i arkivet — **avsett**: serverfils-arkivet är katastrof-
återställningen av HELA servern (miljövariabler behövs vid äkta DRM-läge),
ligger i det gitignorerade lokala valvet `data/backups/` och lämnar ALDRIG
servern. Mätningen har endast noteras NAMNEN — innehållet har inte lästs vid
något tillfälle (R2/GDPR-kontrakt hålls). Spot-filer alla med i arkivet
(package.json · next.config.ts · data/DRIFTSBOKEN.md · src/lib/seo.tsx).

## 5. DR-kedja 3 — restore-prövning av jungurarkiven (P1–P6, P8)

`node verktyg/dr-kedja3.mjs` (default = senaste arkiv = 09-20-jungurarkiven;
verktyget omodifierat) — **GRÖN exit 0**, maskinellt protokoll
`data/forskning/DR-KEDJA3-2026-09-20-AUTO.md`. Första RAM-grind-skipet
(713 MB, exit 75 — kontrollerat vänt-läge) löstes med väntewrapper
(`verktyg/_s10u1-vanta-ram.mjs`, 30 s poll → start vid 2 531 MB).

| Moment | Resultat |
|---|---|
| Självsabotage (domkontraktet) | 3/3 GRIPNA (kapad gzip · skräpfil · kapad bundle — verify godtar kapad, klonen dödar) |
| Arkiv A gzip + listning + exkludering | GRÖN · 13 022 poster · 0 förbjudna |
| **RTO restore (tar -xzf)** | **6,1 s** (225,9 MiB gz) |
| Antalskontrakt | GRÖN — 12 211 filer + 811 kataloger = 13 022 == 13 022 listade |
| src ts/tsx | 726 filer · **221 230 rader** kod |
| Arkiv B verify + klon | GRÖN · 10 refs · 1 922 commits · klonad HEAD e56a6953 |
| **RTO klon** | **17,1 s** (total kedja 3: 23,2 s) |
| Ancestor-bevis | GRÖN — klonHEAD ∈ trädets historia |
| Spot-diff (RPO-visning) | seo.tsx IDENTISK · package.json/next.config.ts/DRIFTSBOKEN SKILJER-FÖRKLARAD (commits 05:18–06:43 > arkivets mtime 01:20:33Z) — synlig RPO-yta: nattens deploy-commits + syskonens D20-drift |
| PG-viloläge | PG17 nere vid ankomst och vid slut — korrekt |
| /tmp-städning | /tmp/dr-kedja3-3428325 raderad (garanterad, verktygets finally) |

## 6. Prediktionsdom P1–P10 (låsta 06:5x, dömda ~07:4x)

| P | Påstående | Utfall | Dom |
|---|---|---|---|
| P1 | dr-kedja3 GRÖN exit 0, sabotage 3/3, alla kontrakt | exakt | ✅ |
| P2 | antalskontrakt GRÖN ≈ 13 023 | 13 022 (jungurloggens 13 023 inkl. rot-posten './') — kontrakt GRÖN | ✅ |
| P3 | RTO restore ∈ [25, 50] s, primär 35 | **6,1 s** | ❌ |
| P4 | 726 src-filer · rader ∈ [90 000, 130 000] | 726 EXAKT · 221 230 rader | ❌ (raddelen) |
| P5 | klon GRÖN · commits > 2 500 · RTO ∈ [10, 40] · ancestor GRÖN | klon ✅ · ancestor ✅ · RTO 17,1 ✅ · commits 1 922 | ❌ (3/4 delar ✅) |
| P6 | 3 spot IDENTISKA + DRIFTSBOKEN FÖRKLARAD | spegelvänt: 1 IDENTISK + 3 FÖRKLARADE — kontrakt GRÖN, fördelningen miss | ❌ |
| P7 | konfigsnapshots == levande 3/3 | nginx ✅ · crontab ✅ · pm2 ✅ (namnmängd oförändrad) | ✅ |
| P8 | PG17 nere vid ankomst och slut | exakt | ✅ |
| P9 | retention 0 · disk oförändrad · .env endast namn | exakt (nästa träff ≈ 2026-11-15) | ✅ |
| P10 | jungurbevis: cron × logg × 5 artefakter | exakt (01:20:33–01:21:06Z, ALLT GRÖNT 65 s) | ✅ |

**6 ✅ · 4 ❌ — kontraktsnivån 100 % GRÖN (övningen godkänd); alla fyra missar
i prediktionsledet, ej i leveransen. Rotorsaker + läxor:**

1. **P3 fel precedens:** bandet 25–50 s byggde på offsite-led-3:s 23,8 s —
   det var EXTRAKTION AV 10 DELAR (1 503,9 MB), inte kedja 3:s tar-extraktion.
   Läxa: precedens måste matcha SAMMA instrument och SAMMA moment.
2. **P4 band utan mätbas:** src-rader gissades (90–130k) mot faktiskt 221 230 —
   talet stod att hämta i 09-16-kedja3-protokollet. Läxa: ett band utan mätbas
   är lotteri, inte prediktion — läs föregångarens maskinella protokoll först.
3. **P5 commits-tal:** 1 922 mot "> 2 500" — samma klass: gissning utan bas.
4. **P6 spot-fördelning:** trädet rörde sig (commits 05:18–06:43) efter
   arkivets 01:20Z — fördelningen IDENTISK/FÖRKLARAD är RPO-information som
   varierar med trafiken, inte stabil prediktionsyta. Läxa: prediktera
   KONTRAKTET (alla IDENTISKA eller FÖRKLARADE), aldrig fördelningen.

## 7. Städning + KVD

- Städning verktygsgaranterad + oberoende verifierad: /tmp/dr-kedja3-* borta ·
  PG17 nere (aldrig startad av denna övning) · inga skrap-DB:er · disk efter
  öningen oförändrad 58 GB-klass · jungurarkiven orörda (endast lästa).
- **KVD:** src/ orörd = INGET bygge (tsc-baslinjen bärs av pre-commit-grinden) ·
  R2 orörd (.env/crontab/nginx endast lästa, aldrig skrivna; .env-innehåll
  aldrig läst) · data/blogg/ orörd · prod orörd (arkiv och konfig endast
  lästa) · syskonytor orörda (u2/u3:s blad-10-protokoll & 02:40-gap rörda ej)
  · commit med pathspec + commitmsg i /tmp.

SLUT — s10-u1 2026-09-20
