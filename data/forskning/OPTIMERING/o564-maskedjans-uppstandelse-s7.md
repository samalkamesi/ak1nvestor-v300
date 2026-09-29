# o564 — Spår 7: MÄTKEDJANS UPPSTÅNDELSE — natt-TBT-cronens rotorsak bevisad + reserv-vakt med 14 h-tak + struktur-mätning bokförd

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest auto-s7-1790673915240)
**Anspråk:** `data/vakten/auto-s7-1790673915240-s7-u2-ansprak-o564-maskedjans-uppstandelse.md` (nr-lås i poolen under flock, o564; disk-först FÖRE all mätning/ändring)
**Uppdrag:** nästa prestandavåg i spåret — mät före/efter (Lighthouse), deploy, prod 200, mätning bokförd.
**Datum:** 2026-09-29 (sond 09:30–10:00 UTC).

## §0 Valet (varför detta objekt)

Spårets kontextlista sonderades före val (duplikat = förlorat arbete):
- **Bildoptimering:** AVSLUTAT — o101 §6 + o111 (skulptur-hero.jpg = deklarerad aktiv
  standard i `public/ak1a/logo/README.md`, 0 runtime-referenser i src; råmaterial
  arkiverat). Ingen våg kvar där.
- **Cache-header-granskning:** rond 4 GRÖN i o558 — denna våg levererar den dom-bara
  strukturmätningen som JSON med byte-tal (§4).
- **Mobil läsbarhet ≥52 px:** o557 (CTA 44→52 på /rapporter-familjen) + o159-tapsonden
  0 fynd. Kvar.
- **Koddelning:** kräver src + bygge — EFTER-mätning kan inte ägas inom sessionen
  (byggen ägs av prod-synken); förblir spårets öppna post.

Det verkliga NÄSTA var att hela mätinfrastrukturen var nere samtidigt:
natt-TBT-cronen utan dom sedan 28 sep, o558-eftervakten död på tidsgräns
(22:33:24Z 28 sep, fas "tidsgrans", egen köpost: "omstart av vakten vid nästa
rond"), och prod-synken utan DEPLOYAD sedan 22df62aa (28 sep 11:52Z). Utan
mätkedja kan ingen framtida våg domas — kur här maximerar spårets värde.

## §0.5 Nummerkollisionen (o159/o160-precedensen, ärligt bokförd)

Min reservation **o563** skedde ~09:38 UTC (poolens `hogstaKanda` var då o562).
Syskonet **s7-u3** i samma manifest committade 09:44:28Z en samtidig prestandavåg
som också tagit **o563** (commit 3ae85a27: protokoll `o563-prestanda-o160-efter-
df331ae2-s7.md` + eftervakt `verktyg/_s7u3o563-eftervakt.mjs`, pid 824990, startad
09:40:55Z). Ej committerat anspråk viker sig — min våg omdöptes till **o564**,
poolen kyrt med ny post under flock, och min 09:41-startade vakt **dödad + lås
städat** (`pkill`, `/tmp/ak1a-o563-eftervakt.lock` var min O_EXCL). Skälet är
metrologiskt, inte bara artighetsmässigt: två Chrome-vaktar som väntar på samma
tysta fönster hade mätt samtidigt och kontaminerat varandra (exakt den mekanism
som födde o558:s OGILTIG-fabrikslast-serier). Syskonets committade vakt äger
EFTER-mätningen; min kurerade version lever vidare som **OSTARTAD RESERV** (§3).

## §1 Rotorsaksbevis: varför natt-TBT-mätningen uteblev 29 sep 03:27

Beviskedja (alla poster mätta i denna session):

1. `dom-o151-natt.json` mtime = **28 sep 02:16** — nattens (29 sep) mätning
   producerade ingen dom-fil.
2. `data/forskning/OPTIMERING/lighthouse/o151-natt-cron.log` mtime =
   **28 sep 01:28** — cron-skriptet skriver till loggen i VARJE utfall
   (HOPPAR ÖVER deployfönster / HOPPAR ÖVER ingen Chrome / matarens utdata):
   ingen rad alls för 29 sep 03:27 ⇒ ropet exekverades aldrig.
3. r328-commit `1d2d2a68` (crontab-massförlustens läkning) är daterad
   **2026-09-29 06:40:00 +0000** — dvs crontaben var fortfarande i trasigt
   tillstånd vid 03:27 och läktes först 3 h 13 min senare. r328:s egna bevis
   (u5-backup-kedjan) visade massförlusten "efter 28 sep 16:12Z" — natten
   28→29 sep låg helt i förlustfönstret.
4. Nuvarande `crontab -l` bär raden `27 3 * * * /home/ak1a/AK1/data/infra/contabo/natt-tbt-cron.sh`
   och r328 läkte enligt referensen — **kedjan är åter beväpnad för natten
   30 sep 03:27** (första möjliga automatiska beviset).

**Dom:** utebliven nattmätning = crontab-lägets följd, INTE instrumentfel.
Ingen ytterligare kur behövs för cron-sidan; verktygssidan verifieras torrt (§2).

## §2 Torr kedjeverifiering (alla GRÖN, 09:40–09:41 UTC)

- `node --check verktyg/natt-tbt-matare.mjs` → **syntax GRÖN** (versionen vid
  verifieringstillfället; syskonet u3 modifierar just nu mataren vidare — deras
  yta, deras våg bokför den, här orörd)
- `bash -n data/infra/contabo/natt-tbt-cron.sh` → **syntax GRÖN**
- Chrome-detektion: `node verktyg/chrome-sokvag.mjs` →
  `/home/ak1a/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome`
  (exekverbar, r304-kuren levande — cron-skriptets egen detektion hittar samma
  sökväg via puppeteer-cachen)
- crontab ↔ `data/infra/konfig-referens/crontab.reference`: innehållsparitet
  (endast radordning samt referensens `<DATABASE_URL>`-maskning skiljer —
  skyddande, inte dränerande)

## §3 Reserv-vakten (OSTARTAD — syskonets committade vakt äger mätningen)

`verktyg/_s7u2o564-eftervakt.mjs` (o165/o558-mönstret, hela kedjan bevarad) med
tre kurer mot o558:s dödsorsaker:

1. **Tak 4 h → 14 h** — o558 dog efter 4 h utan att lasten (fabrikssyskon +
   timmarsbyggen) sjönk under 2,5 en enda gång. 14 h når kvällens/nattens
   tysta fönster. (Syskonets vakt har 6 h tak, löper ut ~15:41Z — därav
   reservens existens.)
2. **Vaktsvepskydd** — gränssnittsvaktens svep (01/07/13/19 → :17) är förbjuden
   mättid (o556:s spårregel); vakten nollställer tyst-räknaren och vilar 5 min
   i fönstret :05–:40 dessa timmar, med grind även i mätfasen.
3. **DEPLOYAD-krav > 2026-09-29T09:37:19Z** (df331ae2-bygget) — mätlogiken
   startar först när DEPLOYAD-rad landat i prod-synk.loggen (BYGGER-rad sist =
   fortsätt vänta).

**Startvillkor (bokfört i filens header):** startas ENDAST om syskonets o563-vakt
dör på tidsgrans utan dom (eller skriver dom-fil med fas ≠ "klar").
Start: `setsid nohup node verktyg/_s7u2o564-eftervakt.mjs &`.
Dom-reglerna oförändrade från o558 §5: struktur dom-bar = CLS 0 ×3 +
skrollsumma < 0,01 + prod 200; TBT/LCP/poäng laststämplas (natt-cronen äger
TBT-slutdomen, o158 §6).

## §4 Struktur-mätning bokförd (dom-bar dagtid, o160-mönstret)

`verktyg/_s7u2o564-header-sond.mjs` → `data/forskning/OPTIMERING/lighthouse/o564-header-struktur.json`
(3 ytor × 2 lager, 09:57 UTC):

| Yta | next-direkt | nginx-https | Cache-Control |
|---|---|---|---|
| `/` (HTML) | gzip 106 342 → 23 638 B (**77,8 %**) | identisk | `s-maxage=3600, stale-while-revalidate=…` |
| `/_next/static/chunks/0el5nt6-nk2y3.js` | gzip 12 887 → 3 612 B (**72 %**) | identisk | `public, max-age=31536000, immutable` |
| `/manifest.webmanifest` | **okomprimerad** 1 076 B (0 %) | identisk | `public, max-age=0, must-revalidate` |

- **gzip GRÖN** på start/leverans-ytor båda lagren (o558:s rond-4-dom
  oberoende ombevisad med byte-tal).
- **Brotli SAKNAS** (br-only → ingen encoding, båda lagren) — kvarvarande
  o5-rest; kräver nginx-modul (systemändring) ⇒ **bokas**, utförs ej i denna våg.
- **Nytt fynd (marginellt):** `manifest.webmanifest` (application/manifest+json)
  serveras okomprimerad av båda lagren — 1 076 B, under all bandbreftspänning;
  dokumenteras som observation, ingen kurvärd.

## §5 Deploy + prod 200

- Prod-synken byggde från HEAD df331ae2 (BYGGER FRÅN 09:37:19Z; föregående
  07:57-bygge avbröts 08:48 av buntslagsrace — trädet flyttade under bygget,
  V235-sekvensens pris). DEPLOYAD bekräftas av syskonets vakt-dom (dess krav är
  merge-base-anfader df331ae2 — starkare än mitt tidsstämpelkrav och därför
  rätt ägare av den verifieringen).
- **prod 200 ×3 loopback** (`/bolag`) + **https 200** (`/`) — bokförda 09:49
  och 09:57 UTC (före/efter namnbytet, båda omgångarna GRÖN).

## §6 Kö (nästa i spåret)

1. **30 sep 03:27** — natt-TBT-cronens första automatiska körning på läkt
   crontab (§1.4): dom-fil = TBT-slutdomen för CV-kurens EFTER (o158 §6).
2. **Syskonets o563-vakt** levererar dom + mätfiler i nästa tysta fönster
   (deras commit: "nästa våg adopterar dom + mätfiler när status klar" —
   adoptionen tillhör deras kö-post).
3. **Reserv-vakten** (§3) startas endast om (2) dör på tidsgrans utan dom.
4. **Koddelning** ("Reduce unused JavaScript" 392–416 KiB på /bolag-familjen,
   o558:s domfiler) — spårets största kvarvarande CPU-post; kräver src + bygge
   och mäts med levande mätkedja (denna vågs leverans).
5. Brotli (o5-resten) — kräver nginx-modulbeslut (styrelsekanal, ej brådskande).

## §7 KVD

- src/ orörd ⇒ **INGET bygge** (byggen ägs av prod-synken; dess pågående
  df331ae2-bygge är ovikigt mot denna vågs data/verktyg-ytor).
- `node node_modules/typescript/bin/tsc --noEmit` — inte applicerbart (inga
  src-filer; verktygsskript är rena .mjs utan TS) — syntaxkontroll utförd med
  `node --check` × 4 GRÖN (matare, cron-skript via bash -n, reservvakt, sond).
- R2 orörd (priser/tier/publicering ej berörda). `data/blogg/` (live) orörd.
- Syskonytor orörda: u3:s hela o563-namnrymd orörd; deras pågående modifiering
  av `verktyg/natt-tbt-matare.mjs` (+93/−13) lämnad ostaged (deras våg
  bokför den); o558:s protokoll+verktyg lämnade som historik.
- Skal-kvoten följd: alla tunga körningar via node-skriptfiler; bakgrundsstart
  endast för den (sedan dödade) första vakten — o165-bevisat mönster.

**LEVERANS-kvitto:** protokoll (denna fil) · anspråk (med kollisionshistorik) ·
`lighthouse/o564-header-struktur.json` · `verktyg/_s7u2o564-eftervakt.mjs` (reserv,
ostartad) · `verktyg/_s7u2o564-header-sond.mjs` · poolens o564-post · worklog-rad.
