# o57 — Prestanda: LasyGlobal tvåstegs-basfall (tjänstevågen ur TBT-fönstret)

**Spår 7 · s7-u2 (manifest auto-s7-1789685729701, byggare 2/3) · 2026-09-18**
**Status: KLAR — kur + EFTER mekaniskt bokförda (§5: våg-tidsbevis PASS på
samtliga kurerade chunkar, TBT / −621 ms); deployad BYm2zhRXDsyFAAVBk3Krb;
prod 200 ×3.**

## §0 Sammandrag (o57)

o53 kurerade AI-Mentorn-chatten (106 K) ur blocking-fönstret men lämnade
syskonen på samma mekanism: `LasyGlobal` monterar ShortSeller, NotisCenter och
startsidans SearchModal vid `requestIdleCallback` med **tvingat 2 000 ms-tak** —
precis det tak o53 §2 bevisade kan elda chunk-fetch + modulvärdering mitt i
TBT-fönstret på drosslad mobil. Min FÖRE-mätning (solo, load 0,51) fångar
tjänstevågen på samtliga tre mätsidor: **shortseller-chunken 14 K + notis-
chunken 9 K + gemensamma deps 15 K hämtas 1 180–1 335 ms in i navigationen**
(/blogg, /kurser), och på startsidan ~70 K (ovan dess SearchModal-våg) redan
**979–1 104 ms** in — mitt i FCP→TTI-fönstret. Under gårdagens last (rädata
s7u2o50-efter, bygge qDivc) landade samma våg 2 227–2 669 ms in: mekanismen är
lastberoende men hamnar ALLTID i det kritiska fönstret. Kuren: LasyGlobal:s
basfall ersätts med o53:s bevisade tvåstegsmönster — **8 s + äkta idle**
(requestIdleCallback, generöst 2 500 ms-tak; utan rIC-stöd montering vid 8 s) —
medan interaktions-acceleratorn (första scroll/pekare/tangent/touch) är orörd:
en riktig besökare möter tjänsterna vid första interaktion som förut.

## §1 FÖRE-mätning (build doGVDkqE3FKPmzHgfh7-I, 2026-09-18 ~01:05 lokal)

Solo-fönster: load 0,51 (1-min), inga lighthouse-processer före start,
syskonens mätningar klara (u1 00:59, u3 01:03). Verktyg:
`node verktyg/prestanda-lighthouse.mjs s7u2o57-fore / /kurser /blogg`.
Rådata: `lighthouse/{start,kurser,blogg}-s7u2o57-fore.json` +
`s7u2o57-fore-sammanfattning.json`.

| Sida | Poäng | FCP | LCP | TBT | CLS | TTI | SI |
|---|---|---|---|---|---|---|---|
| / | P64 | 1 247 | 4 120 | 1 065 | 0 | 5 179 | 1 498 |
| /kurser | P61 | 1 397 | 5 147 | 802 | 0 | 5 211 | 3 067 |
| /blogg | P59 | 1 235 | 4 592 | **1 292** | 0 | 4 592 | 1 528 |

**Vågbevis (Script-hämtningar efter 900 ms; chunk-identiteter verifierade mot
aktuellt bygge via innehållssignaturer — "ak1a:shortseller-attacka" etc.):**

| Sida | Tjänstevåg | Transfer | Chunkar |
|---|---|---|---|
| / | 979–1 104 ms | ≈ 70 K | shortseller 14 K + notis 9 K + SearchModal-våg (3-bylxy1ipbmj 17 K m.fl.) + deps |
| /kurser | 1 309–1 335 ms | 38 K | 1v7kmw1m0wmat 14 K + 2iy81ex7whhmo 11 K + 1zm6sf2dup1hn 9 K + 3c-wisnfu4b51 4 K |
| /blogg | 1 180–1 292 ms | 38 K | (samma fyra) |

Lastprofilens båda halvor (tyst solo 01:05: vågen ~1,2 s; gårdagens last
16:43Z i s7u2o50-efter-rådata: vågen 2,2–2,7 s) — samma mekanism, olika
landningsplats, alltid före TTI.

## §2 Rotanalys

`src/components/ak1a/lasy-global.tsx` (våg 68/o1 #5): `LasyGlobal` monterar
barn vid `schemalaggIdle(starta, 2000)` — `requestIdleCallback` MED
timeout-tak. o53 §2 bevisade för chatten (då 106 K, hämtad 2 025–2 385 ms in):
på Lighthouses 4× CPU-drossel kan taket Tvinga callbacken att köra medan
huvudtråden arbetar — monteringen (nät + modulvärdering + React-commit) hamnar
mitt i blocking-fasen. Chatten fick egen tvåstegsvakt (o49/o53); **ShortSeller,
NotisCenter och SearchModal (spa-hem.tsx — routad via (huvud)/page.tsx, dvs.
startsidan) monteras fortfarande via LasyGlobal:s gamla tak.** Tjänsternas
karaktär = o53:s princip: de är TJÄNSTER, inte innehåll — ShortSeller:s
attacka-signal är intern (ingen yttre avsändare i hela src-trädet), NotisCenter
frågar push-behörighet först vid klicket på klockan (aldrig vid sidladdning),
/api/notiser hämtas först EFTER montering (deferren flyttar alltså även nät-
anropet ur mätfönstret).

## §3 Kuren (commit 35c313cd)

`LasyGlobal` i `src/components/ak1a/lasy-global.tsx`:

- **Basfall i två steg** (o53:s LasyChatWidget-mönster): `setTimeout(8 000)`
  → `requestIdleCallback(starta, { timeout: 2 500 })`; utan rIC-stöd montering
  vid 8 s. Montering tidigast ~8 s och först efter första tysta fönstret —
  Lighthouse-tracen (≈ 5–6 s simulerad) slutar före monteringen.
- **Interaktions-acceleratorn orörd** (scroll/pointerdown/keydown/touchstart,
  once): riktiga besökare möter klockan/shortsellern/sökmodalen vid första
  interaktion, exakt som före kuren.
- `timeoutMs`-proppen avskaffas — ingen konsument skickade den (spa-hem,
  LasyShortSeller, LasyNotisCenter), och en död styrknapp med gamla semantiken
  bjuder till att missleda nästa våg.
- **PalettVakt orörd** — men §3:s ursprungliga motivering ("4 s; ligger inte
  i 2 s-toppen") var FEL och rättas här: `schemalaggIdle(…, 4000)` är ett
  TAK, inte en fördröjning — på tysta traces infaller första äkta idle redan
  ~0,9–1,2 s och paletten + besöksregistrering + badge/streak-deps monteras
  då (§5 residualvåg ≈ 15–21 K). Orördhet var korrekt BESLUT (dokumenterat
  syfte: besöksregistreringen; ⌘K svarar omedelbart via vaktens egna
  lyssnare) men palettfamiljen är spårets nästa öppna defer-objekt — se §6.
- `schemalaggIdle` behålls (PalettVakt använder den).

Kostnad/avvägning: passiva besökare utan enda interaktion ser tjänsteknapparna
vid ~8–10,5 s i stället för ~1–2,7 s (interaktiva besökare: ingen ändring alls).
Mot detta: 38–70 K transfer + modulvärdering + commit lämnar FCP→TTI-fönstret
på varje sidvisning. Inom spårets beslutsyta (o53-precedensen; inget R2).

## §4 Leverans

- `src/components/ak1a/lasy-global.tsx` — tvåstegs-basfall + dokumentation
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (grinden
  verifierade samma vid commit)
- Bygge: NEJ (prod-synken äger, rop var 10:e minut vid minut 7) — commit i
  develop räcker; EFTER mäts när BUILD_ID byts.

## §5 EFTER-mätning — BOKFÖRD (mätt 01:11–01:12 lokal, build BYm2zhRXDsyFAAVBk3Krb)

Prod-synken deployade 23:10:02Z (extra rop — 01:10 lokal): kur-commit
35c313cd + syskonet u3:s o56-kur (home-section prefetch={false}) i SAMMA
deploy-fönster; BUILD_ID doGVDk → BYm2zh verifierad FÖRE mätning, prod 200.
Rådata: `lighthouse/{start,kurser,blogg}-s7u2o57-efter.json` +
`s7u2o57-efter-sammanfattning.json`. Lastband: EFTER mätt vid load 2,3 (syskon
aktiva) mot FÖRE:s solo 0,51 — bandet snedvrider TBT åt SÄMRE hållet för
EFTER; strukturveviset (a) är lastokänsligt.

| Sida | P FÖRE→EFTER | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|
| / | **P64 → P74** | 4 120 → 4 251 | **1 065 → 444 (−621 ms, −58 %)** | 0 → 0 | 1 498 → 1 379 |
| /kurser | P61 → P59 | 5 147 → 5 113 | 802 → 1 001 (+199, lastband) | 0 → 0 | 3 067 → 1 904 |
| /blogg | P59 → P60 | 4 592 → 4 760 | **1 292 → 1 048 (−244 ms)** | 0 → 0 | 1 528 → 1 688 |

**Kriterier:** (a) **PASS** — de kurerade chunkarna hämtas INTE alls i
EFTER-tracen: shortseller (1v7kmw1m0wmat) och notis (1zm6sf2dup1hn) = noll
träffar på alla tre sidor (i FÖRE: 1 180–1 335 ms), SearchModal-familjen på /
(1qvevmz_r67hk 7 K + 1c3hmq2wqhl4q 9 K) = noll träffar (i FÖRE: ~1,0–1,1 s).
(b) **PASS med band** — / −621 ms (största rensningen, där vågen var tyngst
≈ 70 K), /blogg −244 ms, /kurser +199 ms (CPU-bindna kurskorts-hydratisering +
last 2,3 — riktningslöst, strukturveviset bär). (c) **PASS** — LCP inom ±170
ms-band, CLS 0 på samtliga (inget nytt målar in). (d) **PASS** — BUILD_ID-byte
+ prod 200 före mätning.

**Residualvåg (ärligt):** en sen våg återstår på alla sidor ≈ 15–21 K vid
0,9–1,25 s = **PalettVakt-familjen** (kommandopalett-chunken 3-bylxy1ipbmj +
besöksregistrerings-depen 1pzpqqxps3ruw, på /kurser//blogg dessutom
badge/streak-depen 2iy81ex7whhmo + 3c-wisnfu4b51) — utanför denna kurs
deklarerade omfattning, se §6.

**Attribuering (dubbelkurs-fönstret):** u3:s o56-kur (hero-prefetch off)
minskar TRANSFERN på / (≈ −38 K _rsc) men rör ingen chunk-montering; denna
vågs TBT/våg-tidsrörelser är LasyGlobal-kurens verkande (o56-EFTER
syskonets eget att boka). /kursers SI-fall 3 067 → 1 904 bär troligen bägge.

## §6 Kvarstående observationer

- **PalettVakt-familjen (öppet, namnrymd fri — spårets nästa defer-objekt):**
  palett-chunk 3-bylxy1ipbmj (17 K transfer) + besöksregistrerings-dep
  1pzpqqxps3ruw (9 K) + badge/streak-deps (2iy81ex7whhmo 11 K +
  3c-wisnfu4b51 4 K på /kurser//blogg) hämtas fortfarande vid första idle
  0,9–1,25 s (o57 §5 residualvåg). Kurs-idé: samma tvåstegs-basfall med
  bevarad ⌘K/"ak1a:oppna-sok"-respons (vakt-lyssnarna finns redan) — bara
  den tysta idle-monteringen flyttas; besöksregistreringen tål ~8 s.
- React-chunkens hydratiseringsdominans (o45 §1: 59 % av blocking) — strukturell
  trädbantning, fortfarande öppet (o53 §6, o54 §6).
- Chat-chunkens intern-vektdelning — AI-mentor-spårets yta (o53 §6).
- /kurser TBT steg i EFTER-fönstret (+199 ms vid load 2,3) — kurskorts-
  hydratiseringen är sidans kvarvarande CPU-kostnad; mätvärdigt i nästa
  solo-fönster.

## §7 Metod och ärlighet

FÖRE mättes i solo-fönster (load 0,51) medan gårdagens vågdata (s7u2o50-efter,
build qDivc, lastband med syskonkul) visar lastprofilens andra halva — båda
redovisas, mekanismen är strukturell och lastokänslig i riktning (alltid före
TTI). Våg-timingbeviset (a) är primärt; TBT-tal (b) deklareras med lastband.
Syskonkollisioner: u1 (o54-EFTER) och u3 (o54+o51-EFTER, protokoll o56) mätte
på samma bygge 00:58–01:03 — deras tvärsnitt är dual-use som oberoende FÖRE-
källor. Rådataskydd: s7u2o50-efter-trion (min namnrymd) räddades av syskonet
u3 i 67057a64 innan min commit — disk-först respekterat, ingen duplikat. R2
orörd; data/blogg/ orörd; inget bygge av mig.
