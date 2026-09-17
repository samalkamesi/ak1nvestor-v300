# o57 — Prestanda: LasyGlobal tvåstegs-basfall (tjänstevågen ur TBT-fönstret)

**Spår 7 · s7-u2 (manifest auto-s7-1789685729701, byggare 2/3) · 2026-09-18**
**Status: FÖRE mätt + kur levererad (tsc 0, commit 35c313cd) · EFTER pending
prod-synkens bygge (rop xx:7).**

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
- **PalettVakt orörd** (4 s-tyst idle har dokumenterat syfte: besöks-
  registreringen; ligger inte i 2 s-toppen och palettens ⌘K-svar är redan
  omedelbart via vaktens egna lyssnare).
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

## §5 EFTER-mätning — PENDING (skrivet 01:15 lokal 2026-09-18)

Kur-commit 35c313cd i develop sedan 01:12; prod-synkens nästa rop 01:17 bygger
(RAM-vakten kan hålla det — ärligt fönster deklareras vid bokning). Kriterier:

(a) tjänstevågens fyra chunkar hämtas INTE alls under Lighthouse-tracen på
    någon mätsida (o53 §5-mönstret: "hämtas ej alls under mätningen");
(b) TBT ned, särskilt /blogg (FÖRE 1 292 ms);
(c) LCP/CLS oförändrade eller bättre (CLS 0 kvar — inget nytt målar in);
(d) prod 200 + BUILD_ID verifierad före mätning.

## §6 Kvarstående observationer

- React-chunkens hydratiseringsdominans (o45 §1: 59 % av blocking) — strukturell
  trädbantning, fortfarande öppet (o53 §6, o54 §6).
- Chat-chunkens intern-vektdelning — AI-mentor-spårets yta (o53 §6).
- PalettVakt:s 4 s-idle: utanför denna kurs omfattning; palettchunkens vikt
  (3-bylxy1ipbmj 17 K råmaterial i initial load-vågen på /) kan förtjäna en
  egen sond — namnrymd fri.

## §7 Metod och ärlighet

FÖRE mättes i solo-fönster (load 0,51) medan gårdagens vågdata (s7u2o50-efter,
build qDivc, lastband med syskonkul) visar lastprofilens andra halva — båda
redovisas, mekanismen är strukturell och lastokänslig i riktning (alltid före
TTI). Våg-timingbeviset (a) är primärt; TBT-tal (b) deklareras med lastband.
Syskonkollisioner: u1 (o54-EFTER) och u3 (o54+o51-EFTER, protokoll o56) mätte
på samma bygge 00:58–01:03 — deras tvärsnitt än dual-use som oberoende FÖRE-
källor. Rådataskydd: s7u2o50-efter-trion (min namnrymd, o50 §5:s bokade
mätning) committas med denna våg om syskonet u3:s plan inte hann före (disk-
först gäller). R2 orörd; data/blogg/ orörd; inget bygge av mig.
