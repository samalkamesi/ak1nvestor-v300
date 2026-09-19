# o86 — FYND-stormens efterspel: larm-kedjans reda + 184-fyndsstormen dömd + systemisk-skenfynd-klassen (spår 8, s8-u2)

Datum: 2026-09-19 (06:05–06:4x lokal) · Agent: s8-u2 (vakt 2/3, fabriksmanifest)
Anspråk (omkastat efter kollision, se §6): data/vakten/auto-s8-1789797349-u2-ansprak-o85.md
+ kollisionsnotis auto-s8-1789797349-u2-KOLLISION-notis-o85.md

## §0 Sammanfattning

Gränsnittsvaktens cron larmade molnagenten TRE gånger i rad (2026-09-18
19:17 · 09-19 01:17 · 09-19 07:17 lokal) med sammanlagt 206 fynd. Denna våg
stänger larm-kedjans efterspel: per larm reds äkta fynd mot artefakter ut,
stormen 05:17Z (184 fynd) döms 100 % infrastruktur-artefakter med
återmätningsbevis på det läkta trädet, o81:s tre kurer efterbevisas gröna,
och den systemiska roten (vakten kan inte skilja ett halvtrasigt .next-träd
från äkta siddefekter när deploylåset är ledigt) bokas som ny köpost.

## §1 Vad molnagenten fick (cron.log + larm-prompter)

| # | Rop (lokal) | Rapport (UTC-namn) | fel/komb | Session |
|---|---|---|---|---|
| 1 | 09-18 19:17 | granssnitt-2026-09-18T1730.json | 10/176 | sess_aa16e574 |
| 2 | 09-19 01:17 | granssnitt-2026-09-18T2330.json | 12/152 | sess_a79628be |
| 3 | 09-19 07:17 | granssnitt-2026-09-19T0520.json | 184/96 | sess_855a93ad |

Alla tre prompterna sa "defekter som MÅSTE rightas innan kunden ser dem" —
efterspelet har inte bokförts av något fönster förrän nu. (o81 kurade
rötterna till #1/#2:s äkta delar men bokförde dem som journal-rotationens
fynd, inte som larm-efterspel; #3 landade efter deras fönster.)

## §2 Larm-kedjans reda — äkta kontra artefakt, per larm

**#1 (17:30Z, 10 fynd):**
- 2 ÄKTA kontrast: /cookiepolicy dark "Analys (samtycke)" 2,96:1
  (badge `text-[#785c13]` hårdkodad utan dark-gren — rgb(120,92,19) på
  rgb(11,19,33)).
- 4 ÄKTA hydration: /ansvar React #418 (text-mismatch SSR/CSR) — alla 4
  teman/skärmar.
- 3 transienter: /fas3 + /finansiell-policy + /forskningsbiblioteket dark —
  ERR_CONNECTION_REFUSED på /api/* mitt i mätningen = pågående deploy-
  omstart (17:30Z ligger i kvällens deploy-fönster).
- 1 "delresurs-fel kvar efter deploy" (/finansiell-policy) — samma klass.
- ÖDE: alla äkta kurades av o81 (commit 3553f098 00:07Z: cookiepolicy
  2 rader, ansvar 19 rader); transienterna dog med fönstret. EFTERBEVIS:
  06:19Z-mätningen (denna våg) 0 fynd/20 komb på samtliga fem sidor.

**#2 (23:30Z, 12 fynd):**
- 7 ÄKTA kontrast: /portfolj-forskning light "Steg 1 — Risknivå" + badge
  "76" + "Teknik" — 2,25:1 (`text-gold` utan light-gren; detaljtabell i
  o81 §2.1). ÖDE: kurad av o81 (vag-stil.tsx GULD_TEXT →
  `text-[#7a5f18] dark:text-gold`). EFTERBEVIS: 0 fynd 06:19Z.
- 5 transienter: navigationstimeouts (/min-sida /netnet /nyheter /om-oss
  /logga-in) under nattens OOM-press (minnesfönstret smalt före
  OOM-seriens 03:19Z-utbrott men efter dess första symptom). ÖDE: dog med
  fönstret; sidorna mäts av rotationen.

**#3 (05:17Z, 184 fynd) — STORMEN, se §3.**

## §3 Stormen 05:17Z — dom: 100 % infrastruktur-artefakter, 0 äkta

Fördelning: 88 × "stil-lös sida (CSS ej laddad)" (23 sidor × 4 komb) +
8 × "http 500" (/studio + /admin × 4). Ingen enda kontrast-, överflöds-,
utanför- eller klippt-fynd — ett monotont mönster som inte finns i äkta
defekthistorik (jämför #1/#2:s blandade spektra).

Mekanism (spår 7:s dokumentation, här sammanförd med vaktdata): OOM-serien
03:19–05:29Z dödade fem synkbyggen som halvrev .next; arv-trädet levererade
HTML 200 men döda chunk-/CSS-referenser ⇒ vakten ser "CSS ej laddad" per
sida. 07:17-lokal-ruset (05:17Z) mätte mot detta träd 27 minuter FÖRE
prod-synkens lyckade ombygge (05:42–05:44Z deploy PfDDwk; komplett grönt
ombygge 06:00Z BUILD_ID `-U1ORRUKPz05KtP7fFoh5`).

EFTERBEVIS (denna våg, mot läkt träd):
- Riktad mätning 06:17Z `--sidor=/,/studio,/admin,/dataset/konsument/
  tyskland,/ar,/en,/blogg,/blogg/analys-investor-2026 --tema=bada`:
  **0 fynd bland 90 kombinationer** (admin-ytan mättes genom alla 21
  flik-flippar; rapport granssnitt-2026-09-19T0617.json).
- Riktad mätning 06:19Z (larm #1/#2:s sidor): **0 fynd bland 20**.
- Prod-kontroll 06:0xZ: https + localhost 200 på /, /studio, /admin, /ar,
  /en, /blogg, /kurser; båda testade chunk-URL:er 200.
- Journalen orörd av båda riktade körningarna (mtime 00:14Z, 327 poster) —
  --sidor-kontraktet håller (o81 §1:s dokumentation).

SLUTSATS: stormen var spökmätning på halvtrasigt träd — kunden exponerades
aldrig för något gränsnittsdefekt-tillstånd utöver själva chunk-felen (som
spår 7 dokumenterade och läkte). Larm #3:s prompt krävde "rätta i src/" —
korrekt åtgärd var driftläkning, inte kod.

## §4 Systemisk-skenfynd-klassen — NY KÖPOST (förslag o87)

Rot: vakten skiljer "pågående deploy" från "arv-skadat träd" endast via
deploylåset + basens hälsa. Vid halvtrasigt .next är låset LEDIGT och `/`
svarar 200 ⇒ regeln B (våg 142) utlöses aldrig och 184 "siddefekter"
larmar som FYND i stället för DRIFT.

Föreslagen kur (nästa vågs beslut): klassificera AFTER-svepet — om
felande kombinationer till ≥ 50 % är "stil-lös/500"-klassen i samma svep
⇒ SKRIV larm-typen DRIFT (prompt: "halvtrasigt träd — eskalera
prod-läkning, kör vakten efter grönt byggge") i stället för FYND; exit-kod
1 behålls (larmar fortfarande — klassen ändrar bara ÅTGÄRDSVÄGEN, inte
vakheten). Grunden: tre larm med 184 + 8 "siddefekter" var 0 äkta; en
molnagent som rättar src/ efter spökmätning är förlorad arbete (o82:s
dödkods-precedens).

## §5 Kollisionsupplösning — o85 överlåtet (dubbeldispatch, vänligt läge)

UPPSKJUTEN-loggklassen + nummer o85 ägs av s8-u1 (manifest
auto-s8-1789797929474; deras osparade kur + svit
testa-granssnitt-cron-loggklass.mjs på disk vid mitt anspråk 06:12Z — deras
manifest 06:22Z men koden först). Denna våg rör EJ: granssnittsvakt-cron.sh
· testa-granssnitt-cron-* · o85-protokollet. Gåva lämnad i kollisionsnotisen:
deras "live-bevis 07:17 utan rapport" bygger på UTC-namn mot lokal STAMP —
granssnitt-2026-09-18T0524.json (56 598 B, mtime 07:24 lokal, 96 komb) ÄR
07:17-rusets fulla svep; klassen står dock på kodbelagget oberoende därav.

## §6 KVD

- Mätbevis: 0617.json (0/90) + 0619.json (0/20) på disk; prod 200 ×7 +
  chunk 200 ×2; BUILD_ID 06:00Z.
- Journalkontrakt: orörd av --sidor (mtime 00:14Z).
- tsc 0 FEL via projektbinär (`node node_modules/typescript/bin/tsc
  --noEmit`) — ingen kodändring i denna leverans (data-only), kört som
  kvitto ändå.
- src/ orörd ⇒ INGET bygge (prod-synken äger) · R2 orörd · data/blogg/
  orörd · syskonytor orörda (s8-u1:s pågående cron-kur lämnad i fred).
- Commit: "studio: auto s8-u2 o86 …" via git commit -F.

## §7 Kölista efter denna våg

1. Systemisk-skenfynd-klassen (§4) — NY, föreslagen o87.
2. UPPSKJUTEN-loggklassen — PÅGÅENDE hos s8-u1 (o85).
3. migrerar-E-regeln (o72) — oförändrat öppen.
4. backup-offsite CHILD_PROC_INTERP (o80:s sidofynd) — oförändrat öppen.
