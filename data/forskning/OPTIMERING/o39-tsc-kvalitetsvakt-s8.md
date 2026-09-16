# O39 — Typbaslinjens överlevnad: kontroll 11 i kvalitetsvakten (spår 8, 2026-09-17)

## Objekt

Uppdragstextens spår 8-kandidat "Tsc-baslinjens överlevnad" — **INTE tidigare
levererad** (duplikatkontroll: o9 döda länkar, o11 F5-rotorsak, o12 nollfynd,
o14 externa länkar + säkerhetshärdning, o15 mimosa-paritet, o21 skalfri-vakt,
o22 vaktnät, o23 korsvalidering, o24 kraschvakt-triggar, o25 fyndlogg, o26+o34
larm-eskalering, o29 full-scan + delresurs, o30 pulsvakt-kontrakt, o33 tids-
stämpel + artefakt, o35 pumpor + fullscan-baslinje, o36 rsc-skann — ingen
levererar tsc-mätning i den dagliga vakten).

## Rotorsaka (varför luckan är reel)

Typnollen (0 fel, våg 133) är mekanisk **endast vid commit** — pre-commit-
kroken (våg 138) blockerar tsc-fel. Men:

1. **Merge-committar passerar grinden** (dokumenterat i AGENTS.md: "grenarnas
   kod granskades var för sig") — en fel löst merge-konflikt kan introducera
   typfel utan att någon grind reagerar i commit-ögonblicket; arbetsstationens
   "tsc efter merge" är disciplin, inte mekanik.
2. **Arbetsytan mellan commits är omätad** — genererade filer, påbörjade men
   ocommittade ändringar, diskreta skador: ingen mätte trädet som helhet.
3. Fabriken merge:ar barns grenar kontinuerligt (flera om dagen) — väg 1 är
   inte teoretisk, den är vardag.

Kvalitetsvakten ("system som ständigt söker efter fel") hade 10 sektioner —
ingen mätte typer. **Kur: kontroll 11 kör tsc dagligen och gör baslinje 0 till
ett 07:02-bevis i stället för ett commit-antagande.**

## Leverans

- `verktyg/kvalitetsvakt.mjs` — ny sektion 11 "Typbaslinje": kör ALLTID
  `node node_modules/typescript/bin/tsc --noEmit` via **projektbinären**
  (ALDRIG npx — i deployfönstret kan npx lösa tsc till cachens dummy-paket;
  regeln dokumenterad i filhuvudet). Budget 120 s (spegel av motorernas).
  Huvudets inaktuella "kl 07:00 UTC via /api/cron/kvalitet"-rad rättad till
  sanningen (07:02 lokal, vaktpumporna enligt o35). Footer-kontrollistan
  kompletterad.
- `verktyg/testa-kvalitetsvakt-tsc.mjs` — kontraktstest 11 PASS / 0 FAIL
  (statiskt kontrakt: binär, aldrig npx i kod, timeout, transientgrenar;
  full vaktkörning: exit 0, sektion 11 finns + PASS, 11 sektioner i
  sammanfattningen, RESULTAT_JSON parsar GRÖN).
- Bevisfil `kvalitetsvakt-tsc-bevis-2026-09-17.json` (samma mapp).

## Klassificering (falsklarmsdoktrinen — vakten ger ALDRIG tyst PASS)

| tsc-utfall | Sektion | Motiv |
|---|---|---|
| exit 0 | **PASS** | baslinjen lever i trädet |
| typfel i src/ | **FEL** (baslinjebrott) | typnollen gäller hela trädet |
| fel enbart i node_modules | **MANUELL** (deploy-transient) | npm ci byter trädet — K2/K3-precedensen; omkör efter deploy |
| saknad binär | **MANUELL** (OMÄTT) | deployfönster eller saknat beroende |
| timeout 120 s | **MANUELL** (OMÄTT) | kall cache/maskinlast — manuell omkörning |
| exit ≠ 0 utan tolkbara rader | **MANUELL** (OMÄTT) | okänd utgång |

## Bevis

- Färska rapporten (skriven av testets fullkörning): sektion 11
  `node node_modules/typescript/bin/tsc --noEmit — 0 fel på 7.8 s`, total
  kör tid 18,3 s, `ANTAL FEL: 0 | MANUELLA: 4 | STATUS: GRÖN`,
  RESULTAT_JSON `{"fel":0,"manuella":4,"status":"GRÖN"}`.
- tsc oberoende: exit 0 två gånger (8,0 s och 7,8 s).
- Kanaler: primär = vaktpumporna 07:02 (spawn utan timeout — korEnGang);
  manuell = /api/cron/kvalitet (50 s budget; 18,3 s rymms; kall tsc kan i
  värsta fall överskrida — primärkanalen äger den dagliga mätningen).

## Avgränsningar / bokningar

- Negative grenade (saknad binär, timeout, deploy-transient) är STATISKT
  kontraktsverifierade — att trigga dem äkta kräver att node_modules rörs
  (förbjudet för fabriksbarn); kodvägarna är raka och granskade.
- Inget bygge (verktyg/ berör EJ src/ — prod-bygget ägs av prod-synken);
  ingen src-ändring alls i denna våg.
- Syskon-ytor orörda: pumpor-daemon.mjs (o35-ägaren), cron-rutten
  (route.ts), larm-eskaleringen (o34), gränsnittsvakten.
- ÖPPEN KÖ (annan ägare, ej rörd här): beroende-vaktens critical-RCE i next
  (GHSA-p293-qw3h-jr36 + GHSA-2xp9-vwfh-vxw4, fix 16.3.3 inom intervall) —
  installation ägs av prod-synken; vakten mäter och rapporterar redan.
