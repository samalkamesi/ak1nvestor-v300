# o88 — Spår 7: o78-RESTEN — scroll-sond LEVERERAD (kriterium 3 GRÖNT ×5 sidor) + styleLayout-omprövning (463 döms artefakt; kuren står på fyra ben)

**Ägare:** fabriksagent s7-u1 (byggare 1/3, manifest auto-s7-1789816500128)
**Fönster:** 2026-09-19 13:17–13:3x lokal · **Status: LEVERERAD**

## §0 Val + duplikatkontroll

Anspråk disk-först FÖRE mätstart: `data/vakten/s7-o78-rest-u1-ansprak-2026-09-19.md`.
Köpost = o84 §6.1 (bokad "nästa s7-fönster i viloläge"): o78-resten =
styleLayout-omprövning (o84 §3: u2:s 463 ms vilade på chunk-500-fönstrets
JS-döda sida) + scroll-sonden (o78 §5 kriterium 3, aldrig mätt). Verktygs-
fixarna (o84 §6.1) lämnade till verktygsägarna — mina ytor: mätning +
protokoll + nytt sondverktyg. Senaste s7-leveranser lästa (o82–o84);
s8-spåret (o85–o87) orört.

## §1 Prod-läge (allt mot ETT grönt träd, hela rundet)

- prod 200 ×5 https (/, /kurser, /blogg, /ar, /en — 13:31 lokal).
- BUILD_ID `hZjYd72rzYIjfWnbt1oc8` (deployat 10:30:50Z med trädet
  7d690be6; CV-kuren 10081b9a förfader via 06:01Z-kedjan d694ae81).
  BUILD_ID kontrollerad FÖRE och EFTER varje mätning (o83:s guard-metod) —
  oförändrad hela rondet = ingen spökmätning över deploy. Notera:
  prod-synken står i VÄNTAR-RAM för 1e335c69 — nästa poll kan bygga.
- Fönster: vakten 13:16–13:25 (GRÖN, se §4) väntades ut före Lighthouse;
  0 chrome-processer + ingen parallell prestandakörning vid båda
  Lighthouse-starterna; last 1,27–1,79 fallande (3 zcode-barn i omgången
  = så rent vilofönster som omgången tillåter — deklarerat, inte solo).

## §2 Scroll-sonden (kriterium 3) — NYTT VERKTYG + GRÖN DOM

`verktyg/_s7u1o88-scroll-sond.mjs` (CDP som sl-sonden: färsk profil, 390×844
mobil, load + 6 s efersläpning, 400-px-steg till botten, dom per sektion).

Kalibreringens två protokollfynd (inbyggda i verktyget, F1/F2 i headern):
1. Dokumenthöjden VÄXER under scroll (/kurser 16 845→24 187 px —
   kortfamiljens egna cv-reservationer ersätts av verkliga höjder) ⇒
   sektioner identifieras med ORDINAL inom klassen, aldrig dokumentposition.
2. cv:auto SLÄPPER renderingen när sektionen lämnar viewporten (innerText
   → "") men behåller inlärd verklig höjd ⇒ dom ställs på mätning NÄR
   sektionen är I SIKTE. (Första testkörningens "text=0 vid sidbotten"
   var detta korrekta beteende — inte fastbränd platshållare.)

Dom (råda `lighthouse/scroll-s7u1o88.json`, 5 sidor):

| Sida | cv-sektioner | Dom |
|---|---|---|
| /kurser | 5/5 | **ALLA GRÖNA** — renderad text i sikte @steg 22–53, domText 82–876 tecken, inga fastbrända platshållare, auto-nyckeln håller höjderna (t.ex. kategorivägg reserv 1 216 → verklig 1 278) |
| /en/kurser | 3/3 | ALLA GRÖNA (utan cv-kurstips = o78 §6:s kända, medvetna lucka; kategoriväggen täcker spegeln) |
| /ar/kurser | 3/3 | ALLA GRÖNA |
| / | 0 | Startsidan har INGA cv-klasser i HTML (curl-belagt — ingen shell-sida); sondens 0-träffar korrekta, every()-på-tom-array fixad med läs-notis i protokollet |
| /blogg | 2/2 | ALLA GRÖNA — shell-komponenterna cv-nasta-steg + cv-sidfooter; dokhöjden MINSKAR där (26 403→25 269; bloggkortens reservationer var FÖR stora — harmless, deklareras) |

## §3 styleLayout-omprövning (kriterium 2, o84 §3:s bokning)

Lighthouse /kurser via kanonverktyget, två omgångar + oberoende kanal:

| Mätning | Fönster | Style & Layout |
|---|---|---|
| FÖRE (o78 §1) | solo, load 0,53, träd före kuren | 783 ms |
| u2:s EFTER (o78 §5b) | chunk-500-perioden | 463 ms — o84 §3 omvärderad |
| **o88 omg 1** (kurser-s7u1o88-efter.json) | load ~1,3–1,8 | 896 ms |
| **o88 omg 2** (kurser-s7u1o88-efter2.json) | load 1,79 fallande | **661 ms** |
| **o88 trace-sond** (sond-sl-s7u1o88-efter-kurser.json) | othrotad CDP-trace | **197 ms / 23 event mot FÖRE 636 ms / 95 event = −69 % tid, −76 % event** |

DOM: **u2:s 463 ms döms FÄRSK ARTEFAKT I BEKRÄFTAD RIKTNING** — en JS-död
sida hydrat:ar ej och kan inte producera äkta styleLayout-tid; båda mina
levande omgångar (896/661) plus tracens kollapsade Layout-antal pekar samma
väg. **Kuren står på fyra ben:** (1) proxy-A/B-isolatet −288 ms med
scriptEvaluation ±1 ms (o78 §3, orept); (2) omg 2:s 661 < 783 trots 26+
commits tjockare träd och högre last; (3) tracens strukturella kollaps;
(4) helhetssiffrorna P69/P73 · LCP 4 816/4 570 · TBT 412/265 · CLS 0 ×2 =
generationens bästa friska /kurser-tal (o61-ref P56 · 5 458 · 1 194).
Omg 1:s 896 deklareras lastfenomen (o78 §1:s klass 783–1 215 ms).

Ärlighetsrad: omg 1 är den ENDA av mina mätningar över FÖRE:s 783 — den
redovisas orädad; spridningen 661–896 är fönsterbrus av last (3 barn,
vaktnedlagning), inte trädsignal (trace + omg 2 + isolat pepar enhetligt).

## §4 Gränssnittsvakten (kriterium 3, halva 2) — GRÖN

`data/vakten/granssnitt-2026-09-19T1125.json`: status ok, **0 fynd**, körd
13:16–13:25 lokal mot SAMMA bygge som alla mina mätningar (hZjYd).
Vaktkörningen väntades ut före Lighthouse (fönsterdisciplin).

## §5 KVD

Data + verktygsleverans; src/ orörd ⇒ tsc-baslinjen bärs av pre-commit-
grinden (grinden kör mekaniskt); INGET bygge (våg 100 — prod-synken äger;
den står i VÄNTAR-RAM för 1e335c69 och äger nästa deploy); R2 orörd;
data/blogg/ orörd; syskonytor orörda (vaktkörningen 13:16 respekterad,
syskonens utdata lästa+citerade). Append: o78 §5c (protokollets egen
rest-dom). LEVERANS-raden i worklog bär filerna.

## §6 Kö vidare

- o78-resten STÄNGD — spårets bokade väntande mätningar är TOMMA igen.
- Kvar i spårets periferi (huvudagentens): 0el5nt6 · 2feezv · lager-lazy.
- Verktygsfixarna (o84 §6.1: sond-URL:en i prestanda-o75o76o77-efter.mjs
  + KLUMP_KRAV i prestanda-o82-klumpkarta.mjs) väntar verktygsägarna.
- Skiftsond/desktop-förfining (o78 §6): ingen ny signal — vakten GRÖN,
  scroll-sonden visar inga stavhopp (höjderna inlästa vid rendering).
