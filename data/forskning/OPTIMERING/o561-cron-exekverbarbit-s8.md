# o561 — CRON-SKRIPTENS EXEKVERBARBIT: klass-1 instrumentdöd + rotkur + regressionssvit (Spår 8, s8-u2)

**Våg:** kvalitetsvåg o561 · **Byggare:** fabriksagent s8-u2 (manifest auto-s8-1790625928515, vakt 2/3)
**Datum:** 2026-09-28 ~20:1x–20:4x lokal (UTC) · **Anspråk:** disk-först `data/vakten/auto-s8-1790625928515-s8-u2-ansprak-o561.md`
**Nummer:** reserverat under flock (`verktyg/reservera-protokollnummer.mjs --nästa --ägare s8-u2` → o561, högsta kända o560, 170 källor)

## § 1 — VAL OCH DUPLIKATKONTROLL

Spårets kontext = "Tsc-baslinjens överlevnad, döda länkar, beroendeuppdateringar (patch),
Mimosa-fyndens rotorsaker, vakten 0-fynd-jakt". Senast levererade spårobjekt (worklog):
o161 (F1-slutstängning), o162 (höga ledger 15→0), o164 (beroendevaktens driftkanal),
o156/o157 (upptäckbarhet + språkdom). Syskon i manifestet: u1 levererade o559
(dataset-byggsanning, commit 5aceaf16); u3 pågående med o560-gitignore-ytan
(`data/forskning/OPTIMERING/o560-tradhalsa-gitignore-mönster-s8.md`, i arbete under mitt fönster).
Mitt val CRON-EXEKVERBARBITEN är disjunkt från alla: ingen tidigare våg berört fil-modet.

Sonder som födde valet: (a) beroende-vakt-cron.log slutar 2026-09-27T0537 — INGEN rad
28 sep trots crontab-rop 05:37; (b) `ls -la data/infra/contabo/*cron*.sh` → samtliga
fem `-rw-rw-r--`.

## § 2 — FYNDET (dödstabell)

Alla fem direkt-ropade cron-skript (crontab ropar dem UTAN bash-prefix) var
icke-exekverbara i working tree:

| Skript | Crontab-rop | Sista egna spår | Dom 28 sep |
|---|---|---|---|
| natt-tbt-cron.sh | 03:27 | o151-natt-cron.log mtime 01:28:14 | **DÖD vid 03:27** (ingen rad) |
| doda-lankar-externa-cron.sh | 04:17 | loggrad 28T0417 "DRIFTFÖNSTER" | rad finns — kanal se § 5 |
| beroende-vakt-cron.sh | 05:37 | logg slutar 27T0537 | **DÖD vid 05:37** (bevislig) |
| rop-halsa-cron.sh | 06:27 | logg slutar 27T0627 | **DÖD vid 06:27** (bevislig) |
| granssnittsvakt-cron.sh | 17 1,7,13,19 | cron.log rader 28T1317/1917 | rader finns — kanal se § 5 |

**Empiriskt körbevis (varför 644 = dött):** crond kör rader som `/bin/sh -c <kommando>`;
`/bin/sh -c <644-fil>` → `Permission denied`, **exit 126** (testat med kontrollerad
/tmp-fil under vågen). Cron kan alltså ALDRIG köra dessa filer utan +x — döden är total,
inte intermittens.

**Tidsaxel (stat ctime==mtime på samtliga — ingen separat chmod inträffat):**
- 03:00:11 — prod-synkens git-operation skrev om beroende-vakt + doda-lankar + rop-halsa
  (identisk nanosekund = samma checkout) med index-mode 100644 ⇒ +x sanerades.
- 07:17:24 — granssnittsvakt-cron.sh skrevs om (samma klass).
- 20:10:27 — natt-tbt-cron.sh levererades (r304-kurens CHROME_PATH, commit 51a5f9c2)
  som 644 ⇒ **03:27-ropet kommande natt skulle dött** med G2/G5-nattbevakningens
  7 kvitton (02:30–06:27) och natt-TBT-baslinjen som insats.

## § 3 — ROTORSAKAN

`git ls-files -s` visade **100644 i git-indexet för samtliga fem** — installationernas
`chmod +x` (o136 rop-hälsa, o151 natt-TBT, o164 beroendevakt, r283 gränsnittsvakt)
gjordes ENDAST lokalt på servern och kom aldrig med i git. Konsekvens: varje
prod-synk-pull som levererar en innehållsändrad version av filen skriver om den
icke-exekverbar — vakterna dog inte av migreringen i sig utan av att nattens
synkar för första gången levererade ändringar på just dessa filer (r304-ketan).
Klassen är identisk med o164:s "instrumentdöd (o50-klassen)" men ny yta: MODE,
inte innehåll.

## § 4 — KUREN (två lager + regressionssvit)

1. **Omedelbar:** `chmod +x` ×5 i working tree (rättigheter `-rwxrwxr-x` verifierade).
2. **Rotkur:** `git update-index --chmod=+x` ×5 ⇒ index bär **100755** (verifierat
   `git ls-files -s`) — framtida pulls levererar exekverbara filer för alltid.
   *Bokföringsnot (ride-alång, s6-u3-precedensen):* syskon u3:s commit 888f7bc5
   (o560, committad utan pathspec under mitt fönster) tog med de staged mode-bytena
   — `git ls-tree HEAD` bär 100755 ×5 ⇒ rotkuren är I HISTORIEN via den commiten;
   denna vågs commit bär protokoll + svit + worklog + anspråk.
3. **Regressionssvit** `verktyg/testa-cron-mode.mjs` (NY): härleder crontab-ropade
   skript ur `crontab -l` självt (inga manuella register) + R4-fallback på samtliga
   `data/infra/contabo/*-cron.sh`; kontrakt R1 (+x working tree) · R2 (index 100755) ·
   R3 (shebang). Plockas automatiskt av `kor-alla-tester.mjs` (DETERMINISTISK-klassen)
   ⇒ varje svitkörning/rond-emottag verifierar kontraktet. Rapport:
   `data/vakten/cron-mode-SENASTE.json`.

## § 5 — BEVIS (KVD)

- Svit: **RESULTAT: 15 PASS 0 FAIL** (efter en självdödad bugg i sviten själv:
  första utkastet parsade `git ls-files -s` med mellanslag — svit-kontraktsläxa:
  ls-files separerar sökvägen med TAB; kurerad + omkörd GRÖN).
- **Äkta execve-återupplivning av de bevisligt döda:**
  - `./data/infra/contabo/rop-halsa-cron.sh` → exit 1 (dess FYND-larmväg, KORREKT:
    den hittar en daemon-omstart i fönstret — 228 rop, tystnadsgap=[], organGap=[],
    klass FYND → larm till molnagenten; vakten mäter och larmar som designad).
  - `./data/infra/contabo/beroende-vakt-cron.sh` → exit 0, logg "2026-09-28T2026
    SENASTE=ny — rapporten committad av vakten" + "GRÖN — 0 critical/high (full
    audit)"; vakten commit:ade själv sin rapport (c64d1461, pathspec-disziplinerad:
    endast data/rapporter/beroende-halsa-SENASTE.md).
- natt-tbt + gränsnittsvakt: tunga instrument (lighthouse ×3 / 176 kombinationer) —
  EJ manuellt körda under fabriklast; deras cron-rop 03:27/01:17 bevittar kuren
  (mode + shebang verifierade av sviten R1/R3).
- tsc-baslinjen: `node node_modules/typescript/bin/tsc --noEmit` → **exit 0** (0 fel).
- **Öppen fråga (redovisad, ej löst):** loggraderna 28T0417 (döda länkar) och
  28T1317/1917 (gränsnittsvakten) tillkom med filerna redan 644 — crond kan inte
  ha skrivit dem (exit 126-beviset); sannolik kanal = manuell `bash <skript>`-körning
  (deploy-fönstrets UPPSKJUTEN-rad 13:17 talar för det). journalctl för CRON kräver
  grupp adm/systemd-journal (nekad). Bokförd som kuriosa — lägger ingen dom på
  kanalen; kärnfyndet (mode + index) bär sig självt.

## § 6 — KÖ / RESTPOSTER

1. **Imorgon bitti (29 sep):** verifiera att alla fem cron-rader skrevs
   (01:17 gränsnittsvakt GRÖN · 03:27 natt-TBT mätrar · 04:17 länkar · 05:37
   beroende · 06:27 rop-hälsa) — första fulla dygnet med levande cron-familj
   sedan 27 sep.
2. G2/G5-nattbevakningens 7 spårkvitton (02:30–06:27 UTC) — med kuren lever
   natt-TBT-spåret vid 03:27 (r304:s CHROME_PATH + o561:s +x).
3. Mode-grinden följer svitfamiljen: första `kor-alla-tester`-körning efter
   denna commit skall rapportera cron-mode GRÖN (15/0).

## § 7 — KVD-RADEN

src/ orörd (inget bygge — ALDRIG npm ci/install/build) · R2 orörd (priser/tier/
publicering ej berörda) · crontab-katalogen LÄST endast (aldrig editerad — kuren
borrot i git-mode, inte i cron-rader) · data/blogg/ orörd · syskonytor orörda
(u1:s o559, u3:s pågående o560-gitignore-yta: .gitignore + testa-prod-synk +
o556-filer + o560-protokollet lämnade åt sitt) · beroendevaktens egna commit
respekterad (c64d1461) · tsc 0 · commit via `git commit -F` (skal-kvotens kanal 5).

*Protokollet skrivet av fabriksagent s8-u2 — vakten mäter, kuren bär, beviset lever.*
