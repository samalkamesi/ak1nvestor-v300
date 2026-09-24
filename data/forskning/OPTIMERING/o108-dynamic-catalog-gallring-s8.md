# OPTIMERING o108 — DYNAMIC-CATALOG-GALLRINGEN: DÖD EXPORT BORT + MOTORREGENS GALLRINGSSTÖD (spår 8, s8-u3 instans 2)

**Datum:** 2026-09-20 03:17Z (fabriksfönster, manifest auto-s8-1789871713656, vakt
3/3 — redispatch-instans; instans 1 levererade o106-kontraktssviterna, addf9e33).
**Anspråk disk-först:** data/vakten/s8-o108-dynamic-catalog-gallring-u3-ansprak-2026-09-20.md
(nummret i filnamnet enligt o107 §3.1/§3.2:s kur; båda formerna grepade — o108 ledigt,
endast substräng-träffar i lighthouse-mät-JSON).

## 0. Val och duplikatkontroll

Spårets bokade öppna post togs: "Registrets monteringsgap för dynamic-catalog
(död export): antingen koppla katalogen till en konsument eller gallra den;
separat våg (R2-neutral)" — o106-kontraktssviterna §6. Övriga öppna poster
lämnade: bryggkonsolideringen (o107 §5.1 — berörs ej; _o106-ts-import.mjs och
ts-import.mjs orörda), V213(a/c/d) = huvudagentens yta, patch-kö omgång 4 väntar
react-kvittot (kön bär react-familjen ännu). Fabrikskön (ko/) = endast vårt
eget manifest ⇒ inget aktivt syskonrace; anspråk ändå disk-först.

**Beslut: GALLRA (inte koppla).** Källan public/deep-courses.json är levande med
mångfaldiga konsumenter (kurssidor, speglar, sökindex, admin, cron); TS-modulen
var en engångsgenererad kopia UTAN generator, UTAN konsument (enda importeraren
= sin egen testsvit; src-grep tom utanför modulen) och hade REDAN glidit.
Att koppla = ny kundsynlig yta utan kundösran (inte vaktens roll); att gallra
eliminerar HELA felklassen. Kopian är återgenererbar ur källan vid framtida behov.

## 1. Rotfyndet UTVIDGAT: 13 summaries driftade (utöver de 8 titlarna)

Fullfältsparitetsförmätningen FÖRE gallring (verktyg/_s8u3o108-paritet.mjs —
oberoende av sviten, som bara låste titel/kategori/minuter/kapitel) bevisade:

- **Samtliga 11 CatalogCourse-fält = förlustfria projektioner av källan**
  (id = versal av två första slug-segmenten · slug/category/title identiska ·
  level = källnivå normaliserad (vokabulär låst Nybörjare/Intermediär/Avancerad)
  · minutes/chapterCount identiska · hasLynch/hasGraham/hasAk1/hasHistory =
  sanningsvärde av källans lynchSection/grahamSection/ak1Section/history).
- **13 summaries AVVIKER** — katalogen bär ÄLDRE varianter, källan de
  korrigerade (exakt titeldriftens mönster, o106 §1): "knyter till" mot källans
  "knyter an till" · "när det borde göra det inte" mot "när det inte borde
  göra det" · engelskt "matter" mot källans "spelar roll" m.fl. (km-001,
  km-020, km-021, km-027, ts-03 … 13 st). Paritetslåset täckte INTE summary —
  död kopia = ett fält per lås; ytterligare bevis för gallringsbeslutet.
- Driften var aldrig kundsynlig (noll konsumenter); de 13 äldre texterna lever
  kvar i git-historiken (addf9e33 och äldre).

## 2. Leverans

1. **Bevis FÖRE:** svit GRÖN (14 PASS/0 FAIL — pariteten senast bevisad) +
   fullfältspariteten GRÖN (§1).
2. **Gallrat:** src/lib/ak1a/dynamic-catalog.ts (2 896 rader, 205 poster) +
   verktyg/testa-dynamic-catalog.mjs (sviten vaktar en modul som ej längre
   finns — gallras med sin moder).
3. **Motorregen-kur (verktyget, inte bara data):** _r107-motorregen.mjs
   bevarade ALLTID befintliga poster — spökposten hade ÅTERKOMMIT vid nästa
   regen (rot: verktyget klarade inte gallring). Kur: poster vars fil saknas
   på disk lämnar registret, transparent i utdata + regen-fältet
   `gallradeUrRegistret` (aldrig tyst död); register.uppdaterad = löpande
   datum. Ändring i huvudagentens verktyg bokförs här öppet: tillägg av
   gallringssteget, ingen befintlig logik omskriven.
4. **EFTER-mätning:** data/motorregister.json = **105 motorer · 105 testtade ·
   0 otestade** (före: 106/106/0; dynamic-catalog gallrad transparent
   "− dynamic-catalog (kursexpansion)").

## 3. Bevis (KVD)

- tsc: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (hela
  trädet, efter gallring).
- Grannsviter: 9/9 GRÖNA (nyhets-motor 44 · datacache 24 · signal-bus 23 ·
  organ-bus 21 · navigationsminne 16 · elevkarna 17 · klientkontext 29 ·
  eko-koppling 18 · shortseller-bank 24 = 216 PASS / 0 FAIL) — syskonens
  sviter opåverkade, _o106-bryggan orörd.
- Mimosa-paritet verktyg-scope: **GRÖN 0 fynd** (skip-flagga enligt vakten).
- Prod: **200** (opåverkad — gallrad export hade noll konsumenter; ingen
  runtime-yta förändrad FÖRE nästa deploy).
- INGET bygge (prod-synken äger; ändringen = död kods borttagning + verktyg).
- Gränssnittsvakten EJ körd: inga kundsynliga ytor ändrades (noll konsumenter
  = noll renderade skillnader); vaktkravet gäller gränssnittsändringar.
- R2 orörd (priser/tier/publicering: inget berört; data-innehållet lever
  kvar i public/deep-courses.json — källan orörd) · data/blogg/ orörd ·
  syskonytor orörda · commit med exakt PATHSPEC (o106 tillägg 2:s läxa).

## 4. Kö vidare i spåret

1. Bryggkonsolideringen (o107 §5.1) — nu med 9 sviter att migrera (denna våg
   gallrade den tionde).
2. Mimosa full-scan-återmätning triggar nästa gång en större fil-tillskjutande
   våg landar (denna våg = netto −2 filer; verktyg-scope-kvitto grönt).
3. Patch-kö omgång 4 (periferin) låses upp av react-kvittot (levereras av
   prod-synkens :x7-rop med RAM).

LEVERANS: gallring ×2 (src/lib/ak1a/dynamic-catalog.ts, verktyg/testa-
dynamic-catalog.mjs) · verktyg/_r107-motorregen.mjs (tillägg) ·
data/motorregister.json (105/105/0) · verktyg/_s8u3o108-paritet.mjs ·
verktyg/_s8u3o108-svitkoll.mjs · anspråksfilen · detta protokoll · worklog.
