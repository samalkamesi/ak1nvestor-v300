# O22 — VAKTNÄTETS EGEN HÄLSA (s8-u2, spår 8 KVALITET & SÄKERHET)

**Datum:** 2026-09-16, fönster 05:40–06:0x lokal tid (03:4x–04:0x Z).
**Agent:** fabriksbarn s8-u2 i manifest auto-s8-1789530300719 (VAKT-rollen).
**Objekt (valt efter duplikatkontroll):** spårets kontextord "vakten
0-fynd-jakt" + "Tsc-baslinjens överlevnad" pekar på VAKTERNAS EGEN
DRIFT — men inget tidigare spår 8-objekt har mätt vaktnätet självt
(nio levererade objekt granskade via git log: kvalitetsgrind-bevis,
beroende-vakt, dödlänkar intern + extern, tsc-determinism, F5-feljakt,
F7-nyckelbevakning, nollfynd-jakt mot dåvarande prod, mimosa-paritet).
Detta objekt = hälsosonden ÖVER vakternas egna mekanismer. Två levande
rotorsaker hittades; en KURAD i denna våg, en MÄTT + BEVISAD + bokad.

## §0 Syskollisionskoll

**NUMMERNOT:** detta protokoll committades först som
o21-vaktnat-halsa-s8.md (082350e2, 06:1x) — syskonet s8-u1 landade sitt
o21-skalfri-verktygsskal-s8.md därefter (9a44ab46) utan namnkontroll;
jag viker numret och har döpt om mitt till o22 (s7-u4:s o19→o20-
renommé + u1:s o18-not-precedens: serien skall vara unik, den aktiva
agenten städar). Sektionen nedan skrevs FÖRE omdöpet.

Manifestets syskon s8-u1 + s8-u3 dispatchades samma fönster (05:55,
pm2-loggen) med samma generiska uppdragstext. Mina filer är exklusivt
mina: data/infra/konfig-referens/crontab.reference (orörd sedan
1c4e52a0), data/rapporter/kvalitetsrapport-SENASTE.md (verktygets egna
utdata), detta protokoll (o21 ledigt vid ls-kontroll — u1:s o18-not-
precedens tillämpad) + worklog-append (delad fil — skrev + committade i
ett fönster, s2-u2-läxan). Syskonen s7-u1 (redispatch, 570beaac) + prod-
synkens RAM-kö respekterade: inga tunga körningar från denna våg
(kvalitetsvakten ~10 s, alla övriga kommandon läsningar). Eftertext:
s8-u1:s commit svepte ÄVEN med kvalitetsvaktkörningens subprocess-utdata
(validera-motorer.mjs-appendet 107 PASS/0 FAIL/0 SKIP i
data/rapporter/motorervalidering-2026-09-02.md) — korrekt data, fel
ägare i historiken; noterat här för spårbarheten.

## 1. FYND 1 — konfigintegritetsvaktens falsklarm var 10:e minut (KURAD)

### Bevisade fakta

- Journalen data/vakten/konfig-larm.jsonl rad 105–134: **30 larm**
  "SAKNAD crontab-rad: 30 2 * * * … pg_dump …" från
  **2026-09-15T22:49:06Z till 2026-09-16T03:49:01Z** (= 00:49–05:49
  lokal tid, nattlusten) — ett larm per daemon-tick (min%10==9).
- Verkligheten: serverns crontab HÄRDADES 00:49 lokal av syskonet s10-u5
  (DR-NATTKEDJAN-2026-09-16): `PGPASSFILE=~/.pgpass` (lösenordet ur
  processlistan — s10-u1:s säkerhetskur) + dump-markörsvakten
  `kolla-dump-markorer.mjs --natt` före retentionen + retention låses
  vid RÖD natt. Kedjan testkörd GRÖN av s10-u5. Förändringen = RÄTT.
- Normen data/infra/konfig-referens/crontab.reference levde kvar på den
  GAMLA raden (pg_dump med lösenordsbarande sträng, ingen markörvakt) —
  **protokollbrott mot filens egen regel** ("ändras crontab på servern ⇒
  uppdatera denna fil I SAMMA ändring", crontab.reference r 17–19).

### Rotorsak

Inte vaktens, inte crontabbens — **normens**: härdningen verkställdes på
servern utan referenssynk i samma ändring. Vakten gjorde exakt sitt
jobb (den ENDa mekanism som upptäckte driftsklyftan), men en norm som
lever efter verkligheten förvandlar vaktens signal till brus: 30 larm i
rad utan att någon reagerade (natt). Larmkultur-regeln: ett vaktlarm
som är felaktigt i >1 dag tränar systemet att ignorera larm — kurades
inom 5 h här, men mekanismen saknar eskalering (se kö).

### Kur (levererad i denna våg)

crontab.reference rad 1 synkad till den härdade verkligheten — byggd
PROGRAMMATISKT ur `crontab -l` (transkriptionsfel omöjligt), citerad
anslutningssträng maskad som `<DATABASE_URL>`-joker (vaktens matchning:
platshållare → `.+?`, resten ordagrant — konfigintegritet-vakt.mjs
r 94–97). Kommentarsblocket dokumenterar härdningen + protokollbrottet
så nästa läsare förstår varför raden ser ut som den gör.

### Bevis GRÖN (tre steg i kedjan)

1. Manuell körning `node verktyg/konfigintegritet-vakt.mjs` 05:54:13
   lokal (03:54:13Z): **GRÖN — crontab 2/2 · pm2 4/4 online**, journalrad
   gron.
2. Daemonens EGNA tick 05:59:26 lokal (03:59:26Z): **GRÖN — 2/2 · 4/4**
   (journalens sista rad; den schemalagda vägen bevisad, ingen daemon-
   omstart krävd — daemonen spawnar verktyget per tick, verktyget läser
   referensen färsk).
3. Larmkedjan BRUTEN: sista larm 05:49 → gröna rader därefter; inga nya
   SAKNAD-larm efter referenssynken.

## 2. FYND 2 — kvalitetsvakten TRIGGERLÖS på Contabo (MÄTT + BEVISAD + BOKAT)

### Bevisade fakta

- data/rapporter/kvalitetsrapport-SENASTE.md hade huvudet "KVALITETSVAKTEN
  — 2026-09-10 … node v22.19.0 på **win32**" — rapporten på servern var
  genererad på KUNDENS WINDOWS-ARBETSSTATION och committad/synkad dit;
  **ingen servergenererad rapport fanns på disk** (mtime = git-synkens
  checkout, inte vaktkörning). Sex dagar utan mätning.
- Schemat lever ENDAST i vercel.json (`0 7 * * * /api/cron/kvalitet`) =
  den PASSIVA backup-arkitekturen (AGENTS.md: "GitHub = kodbas +
  Vercel-backup (passiv)"). Prod = Contabo: användar-crontabben har 2
  rader (backup + gränssnittsvakt) och pumpor-daemonens 16 pumpor
  (kvalitet saknas — pumpor-daemon.mjs r 68–83 uppräknade).
- Rotorsak = samma familj som beroendevaktens födelsefynd ("npm audit
  körs aldrig", BEROENDE-HALSA-2026-09 §2): **Contabo-migrationen
  flyttade aldrig kvalitetsvaktens trigger** — rutten lever, verktyget
  lever, ingen ropar på det.
- Förstärkt allvar: `agent-status.mjs` r 181 äter rapportens status
  ("kvalitetsvakten RÖD — åtgärda före leverans") vid sessionstart, och
  kvartalsrapporten (kvartalsrapport.mjs r 352) citerar rapporten som
  källa — **varje session har läst en 6 dagar gammal arbetsstations-
  rapport som sanning** utan att något markerade den som inaktuell
  (rapporten saknar åldersvarning; se kö).

### Mätning (bevis att verktyget fungerar felfritt på servern)

`node verktyg/kvalitetsvakt.mjs` 05:53 lokal, första serverkörningen
sedan 09-10, mot aktuellt träd (deployad prod-bas 50463d80):

```
PASS ×9 + MANUELL ×1 — SAMMANFATTNING: ANTAL FEL: 0 | MANUELLA: 4 | STATUS: GRÖN
RESULTAT_JSON={"datum":"2026-09-16T03:53:40.312Z","fel":0,"manuella":4,"status":"GRÖN"}
```

De 4 manuella = samma kända sedan 09-10 (kunder→elever ×3 på PRO-B2B-
ytan enligt yta-regeln + "Sista chansen" i superanalys) — inga nya.
Innehållsjuridiken (förbjudna fraser, rådsförbud) alltså grön på dagens
prod-träd. Rapporten omskriven servergenererad och committas i denna
våg (från och avsedd som färsk bas).

### Bokning till huvudagenten (cronifiering = dess yta; precedens: o14-doda-
länkar-externa §6.1 + pumpor-daemon.mjs ägs av våg 124/166/167)

1. **Pump-rad** i pumpor-daemon.mjs tick()-block, före prod-synkens :x7:
   `if (tim === 7 && min === 2) korEnGang("kvalitetsvakt", "node", ["verktyg/kvalitetsvakt.mjs"]);`
   — 07:02 lokal = färsk rapport före 07:43-styrelseronden och dagens
   sessioner; ALDRIG crontab (konfig-referens-README OBS 2:
   dubbelkörningsrisk — pumpor skall bo i daemonen).
2. **Trädtvisten att besluta**: rapportfilen är GIT-SPÅRAD — en daglig
   pump smutsar arbetsytan (prod-synkens "smutsig yta"-larm).
   Rekommenderat: `git rm --cached data/rapporter/kvalitetsrapport-SENASTE.md`
   + .gitignore-rad (serverlokal rapport som gränsnittsvaktens i
   data/vakten/; agent-status + kvartalsrapport läser från disk och
   bryr sig inte om spårning). Alternativ: daglig auto-commit (saknar
   precedens) eller flytt av utskriftsväg (verktygsändring).
3. **Familjeaudit**: vercel.json bär 12 cron-scheman (autonom, vagscan,
   vagvalidering, expand-courses, seo-refresh, datacache, kvalitet,
   email, nyheter/scan, portfolj-uppfoljning, oversatt, akm3-
   kalibrering) — kontrollera vilka som saknar levande Contabo-trigger
   och bokför; denna våg bevisar metoden (vercel.json är HISTORISK,
   aldrig sanning).

## 3. Bevisfilförteckning

| Vad | Var |
|---|---|
| 30 falsklarm + gröna rader | data/vakten/konfig-larm.jsonl r 105–134 (larm), sista 2 rader (grön 03:54Z manuell + 03:59Z daemon) |
| Synkad norm | data/infra/konfig-referens/crontab.reference (rad 1 + kommentar) |
| Färsk server-rapport | data/rapporter/kvalitetsrapport-SENASTE.md (huvud 2026-09-16, linux) |
| Död trigger | vercel.json crons[].path "/api/cron/kvalitet"; crontab -l (2 rader); verktyg/pumpor-daemon.mjs r 68–83 (16 pumpar, kvalitet ej där) |
| Hälsosond av daemon | ~/.pm2/logs/ak1a-pumpor-out.log (ticks 05:51–05:59) |

## 4. Kö (nästa på detta objekt)

1. **Huvudagenten**: §2 bokning 1–3 (pump-rad + trädtvist + familjeaudit).
2. **Härdning (bokas, ej akut)**: konfigintegritetsvakten saknar
   eskalering vid upprepat identiskt larm (30 i rad ignorerades en hel
   natt) — t.ex. >6 identiska larm ⇒ pulsvakt-larmrad; ägs av vakten
   (verktyg/konfigintegritet-vakt.mjs, huvudagent-yta).
3. **agent-status**: visa rapportens ÅLDER (dagar sedan genererad) vid
   läsning — en gammal GRÖN är inte grön (en rad, huvudagent-yta).

## 5. Återanvändning

```bash
node verktyg/konfigintegritet-vakt.mjs   # norm ↔ crontab/pm2, GRÖN/LARM i journalen
node verktyg/kvalitetsvakt.mjs           # 10 innehållskontroller, ~10 s, GRÖN/RÖD
tail -3 data/vakten/konfig-larm.jsonl    # larmhistorik (append-only)
```

— s8-u2 (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-16 06:0x lokal
