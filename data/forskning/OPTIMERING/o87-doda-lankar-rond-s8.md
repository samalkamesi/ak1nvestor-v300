# o87 — döda-länkar-rond på det läkta trädet (spår 8, s8-u3b) — 2026-09-19

Fabriksagent s8-u3b (manifest auto-s8-1789797929474, vakt 3/3, ANDRA
instansen — dubbeldispatch). Protokollet bär nummer o87 med explicit
distans: o86 var vid valtillfället DUBBELBOKAT av två levande parter med
SKILDA objekt (syskon u2, äldre manifest: FYND-stormens efterspel —
riktad verifieringsmätning; samt instans u3a i samma manifest:
gränsnittsvaktens driftblindhet — modul + wiring på disk och VÄXANDE när
denna instans vaknade, bevis: anspråk 08:14:52 · granssnitt-drift.mjs
08:16:51 · granssnittsvakt.mjs 08:18:00). Båda lämnades HELT orörda;
denna rond valde spårets post "döda länkar" som ingen bokat.

## 1. Varför en länkrond nu (lägesgrunden)

Senaste interna crawl: data/vakten/doda-lankar-2026-09-17.json
(2026-09-17T11:46Z, 3 227 sökvägar). Sedan dess HÄNDE mycket: OOM-serien
med fem dödade synkbyggen (03:19–05:29Z, DRIFTSBOKEN/o83), det
manifest-förgiftade bygget (chunk-500 + /blogg /ar /en 500), tre deployer
(05:42Z PfDDwk · 06:01Z · 08:00 lokal -U1ORRUKPz05KtP7fFoh5), nya rutter
och sektioner. Duplikatkontroll: u2:o86-anspråk = efterspelsmätning ·
u3a:o86-anspråk = driftblindhets-kur · o59 KVD = länkverktyget KURATERAT
(o47/o55) men ingen rond bokad · worklog 09-17→19 saknar länkleverans.
Anspråk disk-först: data/vakten/auto-s8-1789797929474-s8-u3b-ansprak-o87.md.

## 2. Metod och mätfönster

- Kanal: node (skal-kvoten — bevisat pålitlig). Verktyget ÄR härdat:
  mätfönster-grind (o47 §2) + driftfel-tak + filskydd (o55), svit finns.
- Regression FÖRE mätning: node verktyg/testa-doda-lankar.mjs →
  **24 PASS · 0 FAIL · 0 SKIP** (C6/D1–D3/E1–E3/F1–F4/G1–G2 gröna;
  sviten städade sina tmp-rapporter).
- Själva crawlen: node verktyg/doda-lankar.mjs --bas=http://localhost:3000
  (localhost = middleware-whitelist, AGENTS.md). Verktygets EGEN grind
  godkände fönstret — loggrad:
  `[doda-lankar] matfonster: {"grunder":"gröna","las":"/tmp/ak1a-deploy.lock"}`
  (fuser-ägande + byggmonster + bas-koll, allt grönt vid 06:23:1xZ-start).
- GET-only, fast concurrency, inga återförsök, hårt sidtak — skonsamt mot
  prod som betjänade riktiga besökare samtidigt.

## 3. Resultat — GRÖN

```
[doda-lankar] sitemap: {"antal":2420}
[doda-lankar] crawlad: {"sidor":3743,"ms":691131}
Kontrollerade 3743 unika sökvägar på http://localhost:3000 (691 s)
DÖDA LÄNKAR: 0
Omdirigeringar: 0
Rapport: data/vakten/doda-lankar-2026-09-19.json (06:34:53Z)
```

**0 döda länkar · 0 omdirigeringar av 3 743 unika sökvägar.** Länkgrafen
sluten: sitemap-frö 2 420 + alla interna <a href>-mål följda tills grafen
inte växte mer. Rapporten = diskbevis i data/vakten/ (gitignorerad
konvention; skrivs aldrig över — klockslagssuffix-filskyddet.

## 4. Jämförelse 09-17 → 09-19 (tillväxt och läkning)

| Mått | 09-17 11:46Z | 09-19 06:34Z | Delta |
|---|---|---|---|
| Kontrollerade sökvägar | 3 227 | 3 743 | **+516 (+16,0 %)** |
| Körtid | 772 s | 691 s | −81 s (snabbare trots +16 %) |
| Döda länkar | 0 | 0 | — |
| Omdirigeringar | 0 | 0 | — |

Tillväxten kartlagd ur prefixstatistiken: kursspeglingarna /en/kurser +
/ar/kurser 397→441 vardera (+88), TRE NYA datasetsektioner
(/dataset/fastighet 20 · /dataset/material 20 · /dataset/teknik 20 =
+60), /dataset/halso 20→22, /dataset/konsument 20→21, samt nya
analyser/blogg-sidor i grafen. Incidentens manifest-offer /ar + /en
crawlas fritt (441+441 kurssidor + 56+56 blogg-sidor 200) — LÄKNINGEN
länkbelagd, inte bara HTTP-belagd.

## 5. KVD

- tsc **0 FEL** via projektbinär (node node_modules/typescript/bin/tsc
  --noEmit, exit 0) — kvitto; INGEN kod ändrades i denna våg (verktyg
  orörda, src/ orörd) ⇒ INGET bygge (prod-synken äger).
- R2 orörd (priser/tier/publicering orörda) · data/blogg/ orörd (inga
  utkast publicerade) · syskonytor orörda (u3a:s o86-filer + u2:s ytor
  lästa endast som kontext, aldrig skrivna).
- Mätvärdet är ETT godkänt fönster (grunden grön) — inte tvingat läge.

## 6. Köposter (till nästa i spåret)

1. **EXTERNA länkar** — senaste rond 09-15 (doda-lankar-externa-*.json):
   nu 4 dagar gammal och sidorna har vuxit 16 %; nästa kvalitetsvåg i
   spåret kör externa collection+kontroll (se verktygets kontrakt).
2. **o86-leveranserna** — båda parternas (u2 efterspel, u3a driftblindhet)
   kvitton väntas i worklog; om u3a:n dör mitt i leveransen är modulen +
   wiring på disk och sviten/protokollet det som återstår (detta protokoll
   äger INTE deras ytor — uppgiften står i deras anspråk).
3. Länkgrafen som ROUTE-regression: 3 743-sökvägarsdomen (0 döda) är nu
   frusen i denna rapport — nästa crawl JÄMFÖR mot den, inte bara mot 0.
