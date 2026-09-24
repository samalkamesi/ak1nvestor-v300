# o157 — SPRÅKDOMEN + SPRÅKKONTRAKTET (spår 8, s8-u2, 2026-09-24)

**Fabriksagent s8-u2 (vakt 2/3).** Våg: nyckeltalsguidens en/ar-404-utredning
(o152 §restpost 2) — DOM: AVSIKT, EJ DEFEKT — plus språkkontraktssviten som
gör domes underlag maskinläsbart och självunderhållande.

## §0 — VAL, KLAIM OCH KOLLISION

- VAL: o152:s bokade restpost "nyckeltalsguide en/ar-404 utredning" (bokad
  av o152-u1, bekräftad unik i §0-kollisionskompletteringen, aldrig levererad).
- KOLLISION (o146/o147-klassen, ärligt redovisad): syskonet **s8-u1** valde
  oberoende samma restpost från UPPTÄCKBARHETSEN (guiden lever men är osynlig:
  sitemap 0, inlänkar 0) — deras anspråk `auto-s8-kvalitetsvag-s8u1-0924-
  ansprak-o156.md` (disk-först) + pool-reservation o156 FÖRE mitt nummertag.
  Deras ände äger upptäckbarhetsfixen (src/app/sitemap.ts + dataset-vyernas
  länkar = deras kur-yta, orörd här). Min ände är DISJUNKT: språkfrågan.
- Nummer: o157 reserverat i poolen (protokollnummer.json). Notis till u1
  lämnad på disk: `auto-s8-kvalitetsvag-s8u2-0924-notis-till-u1-sprakdom-o157.md`
  — innehåller den praktiska avgränsningen för deras kur: de behöver INTE
  bygga speglar (det vore ny innehållsproduktion, ej rotorsaksfix).

## §1 — UTREDNINGEN: ÄR en/ar-404 ETT DEFEKT?

FÖRE-facit (localhost = prod, 2026-09-24): `/data/nyckeltalsguide` → 200 ·
`/en/data/nyckeltalsguide` + `/ar/data/nyckeltalsguide` → 404.

Beviskedja (sju oberoende ben, alla gröna = avsikt):

1. **Sidans egen natur** (`src/app/(huvud)/data/nyckeltalsguide/page.tsx`):
   våg 87-byggd svensk SEO-citeringsmagnet — hårdkodad svenska i alla lager
   (rubriker, FAQ, tabelltexter), svenska sökord ("median P/E",
   "nyckeltal branschjämförelse"), svenska decimaler via egen `sv()`-funktion.
   Målgruppen är svensk sökpublik; sidan saknar ALL språkparameterisering
   (att jämföra: dataset-familjens `datasetPrefix(lang)` + `skapaT(lang)`).
2. **Ingen regression**: `git log --all -- "src/app/(en)/en/data"
   "src/app/(ar)/ar/data"` = TOMT — speglar har aldrig funnits, inget har
   rivits.
3. **Ingen mekanism kan skapa de döda vägarna**: språklänkar byggs ENBAST
   inom speglade familjer via `datasetPrefix(lang)` ("länkarna stannar på
   samma språkyta" — dataset-sidor.tsx:29, certifikat.tsx:28). Ingen global
   språkväxlare mekaniskt prefixar aktuell sökväg. 404:orna kan bara uppstå
   vid handskriven URL — och landar då på hjälpsam 404 (kursförslag med
   Levenshtein-matchning, `noindex`).
4. **Inget löfte**: sitemap.xml har 0 träffar på nyckeltalsguide i ALLA
   språk (o147:s livskontraktssvit förblev 0 fel — inget dött löfte).
5. **Etablerat mönster**: 14 kundrese-ytor är fullt speglade (blogg, kurser,
   medlemskap, dataset, transparens … — 200×3 mätta) medan data-/verktygs-/
   SEO-ytor är enbart-sv (topplistan, portfolj-forskning, kalkylator, pro/*,
   alla policy-ytor …). Systemkartan bokför klassen som kända poster
   (D23 tier-sidor, E31-trespråksspåret).
6. **Strukturell symmetri**: (en)/en ≡ (ar)/ar = exakt 18 rutter var
   (rot + 14 ytor + 3 dynamiska) — speglingsarbetet är disciplinerat, ingen
   påbörjad/halv spegel av guiden finns.
7. **o152:s egen formulering**: "guiden verkar enbart-sv — ev.
   flerspråksgap att undersöka … INTE ett vaktfynd" — utredningen bekräftar
   inkikationen.

**DOM: AVSIKT.** 404 på en ospeglad ytas språkvariant är det KORREKTA
svaret — samma instrumentklass som vaktens `forvantade401` (o149): svaret
är gränsvaktsbeteende, inte defekt.

## §2 — METAROTORSAKAN OCH KUR

**Rotorsaka till restpostens uppkomst**: platsens språkstatus fanns ENDAST
i huvuden (vågsdokument, git-historik, kodkommentarer). o152-u1 tvingades
utreda manuellt; denna våg höll på att om-utreda samma sak — och utan kur
skulle nästa sond som råkar mäta en språkvariant av en ospeglad yta göra
det en tredje gång. Det är samma glidningsklass som o148 ("tal hårdkodade
i stället för räknade ur källan"): kunskap hårdkodad i prosa i stället för
härledd ur maskinläsbar källa.

**KUR: `verktyg/testa-sprakkontrakt.mjs`** — språkkontraktssviten:

- Kontraktet härleds ur FILSTRUKTUREN (`app/(huvud)`, `(en)/en`, `(ar)/ar`)
  — ingen manuell registrering att glömma: bygger en framtid en spegel
  träder ytan AUTOMATISKT in i kontraktet.
- R1 SPEGLAT: sv-rutt med båda språkparen ⇒ 200 krävs ×3 (redirect döms
  ej grönt). R2 SV-ONLY: ospeglad ytas en/ar-varianter förväntas 404 =
  KORREKT (o157-domen; icke-404 ⇒ OBS — designändring på väg). R3
  ASYMMETRI: en utan ar eller tvärtom ⇒ OBS.
- Dynamiska barn ([slug]/[bransch]) mäts ej — ägs av o147:s
  sitemap-livskontrakt + o146:s bolags-ledger. 429/5xx: omprov ×1, kvarstår
  ⇒ "oprovad" — ALDRIG falsgrönt; >10 % oprovade ⇒ exit 2 (o147-precedensen).
- Rapport: `data/vakten/sprakkontrakt-SENASTE.json` (gitignorerad, kvar på
  disk) — bär domen om nyckeltalsguiden i `dom`-fältet för framtida vågor.

## §3 — SVITENS BEVIS

- Första körningen fångade ETT fel: sondens EGEN trailing-slash-bugg
  (`/en/` → 308 medan `/en` → 200) — konstruktörens fångst FÖRE grönt
  (o69-precedensen). Kur: kanon URL-trimning i `mät()`.
- Slutlig körning: **0 fel · 0 OBS · 126/126 mätningar provade · exit 0** —
  rötter 200×3 (/, /en, /ar) · 15 speglade statiska ytor 200×3 (/
  inkluderat) · 39 sv-only-ytor med en/ar = 404 exakt (däribland
  /data/nyckeltalsguide: **domen lever som grönt kontraktsvärde**) ·
  0 asymmetrier · rutter 63/18/18 (sv/en/ar).
- `node --check` PASS.

## §4 — KVD

- src/ orörd = INGET bygge (byggen ägs av prod-synken/kraschvakten).
- tsc `node node_modules/typescript/bin/tsc --noEmit` = **exit 0**.
- Mimosa (kvalitetsvakt.mjs full-scan): GRÖN — motorvalidering 107/0/0,
  inga avvikelser.
- R2-ytor orörda (priser/tier/publicering) · data/blogg orörd ·
  syskonytor orörda (u1:s sitemap/dataset-länkar = deras pågående o156;
  deras anspråksfil orörd).
- Commit med explicit pathspec (enda filägda ytor: sviten + protokollet +
  worklog-raden + poolen + notisen).

## §5 — RESTPOSTER / KÖ

1. u1:o156 äger upptäckbarhetsfixen (svensk sitemap-post + intern länk) —
   när den landar: kör språkkontraktssviten som sidokontroll (guiden förblir
   sv-only ⇒ R2-förväntningen 404 skall hålla — deras kur skall INTE röra
   språkvarianterna).
2. Vill kunden framöver ha guiden trestrecket = ny byggarvåg med
   översättnings-KVD (s3-mönstret: språkgrindar, talparitet,
   disclaimer-exakthet) — inte vaktens yta; sviten träder automatiskt in i
   R1-läget när speglarna finns.
3. Svitens R2 (icke-404- OBS-klassen) är än så länge obevisad i skarpt
   läge — den får sitt eldprov först när en designändring sker.
