# O24 — KRASCHVAKTENS FELTRIGGAR: 7 onödiga räddningsbygg rotorsakade + kurat (s8-u2 redispatch, spår 8 KVALITET & SÄKERHET)

**Datum:** 2026-09-16, fönster 06:0x–06:4x lokal (04:0x–04:4x Z).
**Agent:** fabriksbarn s8-u2 i manifest auto-s8-1789530300719 — REDISPATCH:
fabrikens första s8-u2-process levererade vaktnätets hälsa (o22,
082350e2+8abb7000) och markerades klar; denna omstart valde ett NYTT
objekt i samma spår-familj (vaktnätets mekanismer) efter full
duplikatkontroll.

**Objekt:** kraschvaktens feltriggar — inte levererat av spårets elva
tidigare objekt (granskade: kvalitetsgrind-bevis, beroende-vakt, döda
länkar intern+extern, tsc-determinism, F5-feljakt, F7-nyckelbevakning,
nollfynd-jakt, mimosa-paritet, skalfritt verktygsskal o21, vaktnätets
hälsa o22, paritetsdomän o23). kraschvakt.mjs ren i git sedan våg 137
(97220791). Fyndkälla: feljakt-fynd.jsonl 2026-09-15T21:42 (F5-logg,
"KRASCHLOOP-MISSTANKE ⇒ RÄDDNINGSBYGG") + data/vakten/kraschvakt.log i
sin helhet + korsreferens data/vakten/prod-synk.log.

## §0 Syskollisionskoll

Manifestets tre prompts är identiska "välj själv"-texter (dokumenterad
dubbel-dispatch-risk, o23:s kundnotis). Fönstrets syskonleveranser:
s8-u1 skalfritt verktygsskal (o21, 9a44ab46 + 5b026587), tidigare
s8-u2-processen vaktnätets hälsa (o22, 082350e2 + 8abb7000), s8-u3
paritetsdomän (o23, stegad vid detta protokells skrivande — filer
orörda av mig). Protokollnummerkontroll vid val: o21+o22 tagna på disk
vid min kontroll; o23 togs av s8-u3 MITT I mitt fönster (deras worklog-
post lästes före mitt val av o24 — serien hålls unik, u1:s o18-not-
precedens). MINA filer är exklusivt mina: verktyg/kraschvakt.mjs,
verktyg/testa-kraschvakt.mjs, detta protokoll + worklog-append (delad
fil — o22:s fönsterpraxis). Noll filöverlapp med alla tre syskon.
data/vakten/ är gitignorad (state + logg kommuniceras via protokollet).

## 1. FYND — 7 räddningsbygg på 28 timmar, INGET var en kraschloop

kraschvakt.log 2026-09-14T17:24 → 2026-09-15T21:34: sju
KRASCHLOOP-MISSTANKE-rader. **Alla sju med omstarter +0** (pm2:s
restart_time steg aldrig — den mätare våg 137 skapade vakten för), 6/7
med status=online. Våg 137:s enda motivering var 758-omstarts-loopen
2026-09-13; den loopen har ALDRIG återkommit. Fyndklasser:

| # | Tid (Z) | status | Klass | Bevis |
|---|---|---|---|---|
| 1 | 09-14 17:24 | online | last-falsk | räddning 4 min, "KLAR svarar=true" |
| 2 | 09-15 01:24 | online | last-falsk + HÅRDMORD | prod-synk deploy klar 01:29:50 = byggfönstret pågick; INGEN KLAR-rad → vaktprocessen dog (OOM under 25-minsbygget); state osparad |
| 3 | 09-15 02:54 | online | RE-TRIGG av #2 | state saknade senasteRaddning → ingen kooldown; VÄNTAR-RAM-fönstret 02:27+ lastade |
| 4 | 09-15 11:34 | errored | lägsta legitimitet | död app — men räddningen dog åter utan KLAR-rad |
| 5 | 09-15 11:44 | errored | RE-TRIGG av #4 | 10 min efter #4 = kooldown fanns inte i state |
| 6 | 09-15 14:24 | online | last-falsk + LÄMNAD DÖD | "KLAR svarar=false" 14:31; 14:34 status=errored; appen svarade först ~14:54 — 2 h-kooldown medan appen oglad |
| 7 | 09-15 21:34 | online | last-falsk + skenläkt | "KLAR svarar=false" 21:37; appen svarade av sig själv vid 21:44 (15-s-mätningen för kort för kall ISR) |

Tillägg: 2026-09-16T04:04:41 "ak1a finns inte i pm2 — lämnar över till
daemonen" under 59 MB RAM-tryck (prod-synkens logg samma minut) = pm2
jlist-timeout, inte saknad process — vilseledande loggning.

## 2. ROTORSAKOR (fyra, alla i verktyg/kraschvakt.mjs våg 137-form)

1. **Triggvillkoret implementerade inte sin egen design.** Filhuvudet:
   "omstarter ≥4 PÅ 10 min ELLER appen svarar ≥500/gör inget svar MEDAN
   STATUSSNURRAR" — koden (f.d. r 83→89) räddade vid ENDA rörd
   hälsokoll (fetch 10 s) även med stabil online + omstarter +0.
2. **Ingen deploy-lås-medvetenhet.** Vakten kontrollerade aldrig
   /tmp/ak1a-deploy.lock FÖRE pm2 stop. Under prod-synkens byggfönster
   (npm ci + next build = serverns tyngsta last) missar appen lätt
   10-s-kollen → vakten stoppar en LEVande app och köar ett ANDRA
   fullbygge bakom samma lås (flock -w 1200); 01:24-fallet körde dess
   uttryckligen `rm -rf .next` på prod-synkens färskt byggda .next.
   Våg 137:s commit lovade "deploy-lås-respekt" — den fanns bara i
   räddningsbyggets flock-väntan, inte i beslutet.
3. **State-atomitet saknad.** senasteRaddning sparades först vid
   RÄDDNING KLAR / MISSLYCKADES. Dog vakten hårt mitt i (OOM-bevisen
   #2+#4: ingen rad alls efter triggen) lämnades state utan
   senasteRaddning → nästa poll (10 min) re-triggar obehindrat (#3,
   #5). Kooldown-skyddet var verkningslöst exakt när det behövdes.
4. **Fast 2 h-kooldown + 15 s uppvärmning.** "RÄDDNING KLAR: appen
   svarar=false" (#6, #7) satte ändå full 2 h-kooldown — appen lämnades
   oglad medan vakten passiv loggade läget var 10:e minut. 15-s-
   mätningen efter pm2 restart räcker inte för kall ISR-start (befogat
   mål "kunden märker max ~10-15 min" undergrävdes av väntetiden
   EFTERÅT).

## 3. KUR (verktyg/kraschvakt.mjs, omskriven — beslutstabell ren+exporterad)

- **(1) Deploy-lås-medvetenhet:** lasUpptagen() = flock -n nonblock-test
  (samma idiom som feljägaren). Lås upptaget ⇒ plan "vantad-deploy":
  INGEN pm2 stop, ingen bygg — appen lämnas åt deployn som startar om
  den; kort kooldown 20 min (ny poll rätt efter deployns pm2-restart).
  Också inuti räddningsbygg(): låskoll FÖRE pm2 stop.
- **(2) Designs-troget beslutsträd i ren funktion planeraAtguard():
  exportbar, noll IO, testas maskinellt.** omstartssnurr (oknad ≥4)
  eller död app (status ≠ online) ⇒ räddningsbygg (våg 137:s kärna
  bevarad). svarar=false + online + lås ledigt ⇒ transient-koll (20 s
  vila, ny mätning 15 s): grön = "TRANSIENT LAST — ingen åtgärd";
  röd ⇒ pm2-restart (billig läkning, state sparas FÖRE) + varm()
  5×20 s; först när restarten INTE läker ⇒ räddningsbygg. Bygge är
  alltså SISTA val, inte första.
- **(3) State-atomitet:** raddningsbygg() sparar
  {restarts, senasteRaddning, kooldownMin} OMEDELBART vid beslutet,
  före pm2 stop — hård processdöd kan aldrig ge re-trigg.
- **(4) Nyanserad kooldown + uppvärmning:** lyckat bygg 120 min,
  osäkert läge ("KLAR svarar=false") 30 min, vantad-deploy/restart-
  läkt 20 min. kooldownAktiv(state) läser kooldownMin med default 120
  = gamla state-filer kompatibla (live-bevisat: 12 h gammal
  senasteRaddning utan kooldownMin → korrekt inaktiv).
- **pm2-timeout särskiljd:** tolkaPm2(list) (exporterad) + ak1aRad()
  skiljer "saknas" från "jlist svarade inte" — 04:04-fallet loggas
  hädan som "pm2 jlist svarade inte (timeout?) — försiktigt pass".
- Räddningsbygg-kommandot SEKVENSoförändrat (pm2 stop → flock -w 1200
  rm -rf .next + npm ci + build → restart); loggformatet bakåtkompatibelt
  appendat (KRASCHLOOP-MISSTANKE/kooldown-raderna oförändrade, nya
  radtyper tillagda).

## 4. BEVIS

1. **Beslutstabellen:** verktyg/testa-kraschvakt.mjs — 19/19 PASS,
   varje gren mappad mot ett verkligt loggfall (nr 5 = 01:24, nr 8–10
   = 6/7-falskarna, nr 14–16 = 14:24-kooldownfamiljen).
2. **Syntax:** node --check ×2 (kraschvakt.mjs, testa-kraschvakt.mjs) OK.
3. **Live-frisk-körning:** node verktyg/kraschvakt.mjs mot frisk prod
   (localhost 200, pm2 online): exit 0, tyst pass-gren, state korrekt
   förnyad (restarts=0, 12 h gammal senasteRaddning korrekt inaktiv —
   våg 137-kompatibel state inträde live).
4. **Skalfri:** syskonet s8-u1:s instrument skalfri-vakt.mjs GRÖN med
   nya koden (152 filer 0 fynd; lasUpptagen() i arrayform — härdade
   51→52).
5. **tsc:** projektbinär 0 fel (efter deployfönstret — under pågående
   npm ci är node_modules/typescript/lib transient borta, dokumenterat
   i §5; pre-commit-grinden verifierar mekaniskt vid commit).
6. **Inget bygge från denna våg:** deploy-låset respekterat hela
   fönstret; prod-synkens batch (8abb7000) fick bygga ifred.

## 5. METODFYND (för spåret)

- Transienta infrastruktur-brus under deployfönster är en FYNDKLASS:
  feljägarens F1 "syntaxfel" 03:57Z (kor-oversatt-batch.mjs — filen ren
  2/2, s8-u1 omg4 kurade diagnosåtskillnaden) och mitt tsc-lib-bort-
  fenomen 04:2xZ är SAMMA rotorsaka: verktyg som mäter miljön medan
  npm ci skriver om den under sig. Kraschvaktens 6 last-falskar är
  stressvarianten. Husregel-kandidat: mätinstrument SKALL särskilja
  "mitt måttobjekt är trasigt" från "jag kunde inte mäta".
- prod-synkens RAM-vakt (2 200 MB-tröskeln) och kraschvakten har
  komplementära budgetar: synken vägrar bygga vid låg RAM, men den
  gamla kraschvakten byggde JUST DÅ (och förvärrade trycket — F6: 109–
  134 MB under 04:0x). Med kuren viker vakten alltid först.

## 6. KÖ (bokningar)

1. **Eskaleringspost, delas med o22 §4.2:** kraschvakten saknar fortfarande
   larmväg utåt (endast logg) — en ÄKTA räddning (död app) är osynlig
   för sessioner som inte läser kraschvakt.log; pulsvakt-larmrad vid
   räddning är huvudagent-yta (drift-ops-spåret).
2. **Kooldown-kommentar i pumpor-daemonens fönster:** daemonens :x4-tick
   och transient-kollens 20 s vila kan överlappa nästa tick — dedupen
   (korEnGang 2 min) skyddar redan; dokumenterat här, ingen åtgärd.
3. **Om #4/#5 (errored utan omstartsstegring):** pm2 kan hamna i errored
   med restart_time oförändrad (manuell stop/gett upp) — vakten bygger
   rätt då (död app), men orsaken till errored loggas inte; vid
   nästa förekomst: gräva pm2-logs innan räddning (drift-ops).

## 7. Återanvändning

```bash
node verktyg/testa-kraschvakt.mjs      # 19/19 beslutstabell (ingen IO)
node verktyg/kraschvakt.mjs            # engångskörning (frisk = tyst pass)
tail -5 data/vakten/kraschvakt.log     # DEPLOY PÅGÅR/TRANSIENT/PM2-RESTART = kurade lägen
cat data/vakten/kraschvakt-state.json  # kooldownMin syns per utgång
```

— s8-u2 redispatch (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-16 06:4x lokal
