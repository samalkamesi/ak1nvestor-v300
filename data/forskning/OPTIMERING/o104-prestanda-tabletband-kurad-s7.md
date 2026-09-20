# o104 — Spår 7: TABLET-BANDEN KURADE — utvalt-kortens reservationer 640–1 087 med sex sonderade band-nivåer (o103 öppnad igen + A/B-motbevis + nytt sm-bandfynd)

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest auto-s7-1789867506896 — REDISPATCH försök 2; försök 1 = o100-kurstips-golvet 9da2912c, disjunkt yta)
**Anspråk:** `data/vakten/s7-o104-tabletband-kur-u2-ansprak-2026-09-20.md` (nr-lås i filnamn enligt o103 §6.4)
**Bygge:** 9RBeu-wernShtKHNVQ6LI (oförändrat hela serien — verifierat; kuren varken i FÖRE- eller A/B-läget)

## §0 Lägets omskrivning under fönstret (full öppenhet)

1. Valt objekt 03:5x som "o97 §6.3 tablet-gapet, oanspråkat" — under mitt
   mätfönster levererade syskonen sina vågor (föregångarens o100 9da2912c,
   u3:s o101 ×2 38eaa862/5e6a9c0e, u1-instans-2:s o102 d9e14cca + o103
   1aa12ee5 04:10:45) — o103 STÄNGDE tablet-posten KARTLAGD utan kur.
2. **Zombie-reset 04:1x–05:2x:** nio commits (s6:s tre + s7:s sex) raderades
   från develop av en främmande `git reset` till 65f9963d (samma klass som
   s5:s 02:27-incident). Upptäckt vid leveransförberedelsen; träd läkt med
   `git reset --hard 1aa12ee5` (noll förlorat arbete — reflog intakt, inga
   ocommittade tracked-ändringar i fönstret; mina untracked-filer orörda).
   Incidentrad i worklog; zombie-jakten = huvudagentens bord.
3. Mitt ursprungliga nummer o100 kolliderade med föregångarens leverans ⇒
   allt döpt om till **o104** (o99–o103 upptagna; grep-kontrollerad).

## §1 Metod

`verktyg/_s7u2o104-sond.mjs` (CDP, fri viewport = u3:s o96-blocksond generaliserad;
RAM-vakt ≥450 MB, EN chrome, sekventiellt, finally-kill; snapshot före/efter
progressiv scroll; fontgrind: computed font = -apple-system i varje JSON —
två race-skadade proxy-mätningar (ab2-768/800, Times New Roman-signatur,
0 element/sidor utan CSS) gallrades och omkördes i rond 3).
`verktyg/_s7u2o104-ab.mjs`: reverse proxy :9378 mot :3000 som injicerar
kandidat-CSS i HTML-head (o99-proxy-mönstret) — A/B i EN process, skal-säkert.

## §2 FÖRE-mätning (appens läge; ΣΔspan = platshållare→renderat, /kurser)

| Bredd | kol | liW | flagg | nya | borja | ΣΔspan | docHΔ |
|---|---|---|---|---|---|---|---|
| 640 | 1 | 602 | synlig | 628→369–447 | 184→158–178 | **−1 623** | −4 573 |
| 700 | 2 | 313 | synlig | 628→800–836 | 184→194–214 | ~+1 000 (härlett ur mätta platshållare) | — |
| 768 | 2 | 347 | synlig | 728 ✓ | 204 ✓ | −66 | +135 |
| 820 | 2 | 373 | synlig | 728→688 | 204→175/194 | −294 | −43 |
| 900 | 2 | 413 | synlig | 728→622 | 204→175 | −394 | −130 |
| 1 024 | 3 | 311 | synlig | 728→836 | 204 ✓ | **+335** | +212 |
| 1 088 | 3 | 333 | — | 728→758 | 204 ✓ | +100 | +53 |
| 1 152 | 3 | 354 | — | 728 ✓ | 204 ✓ | −17 | −36 |
| 1 280 (kontroll) | 3 | 357 | — | 728 ✓ | 204 ✓ | −17 = o97 ✓ | −36 |

Grid-kartan (mätt): 640 = EN kolonn (scrollbar ⇒ content 625 < Tailwind
sm:640 ⇒ sm:tänder ej) — mobilnivåernas rike slutar egentligen vid ~656;
700–1 023 = 2 kol (liW 313–413); ≥1 024 = 3 kol (liW 311–357).

## §3 KUR (globals.css, REN CSS, ett nytt block efter o97-familjen)

Sex band, nivåer = mätta verkliga EFTER-li (sektionsmedel, spegel:
`verktyg/_s7u2o104-band.css`):

| Band | nivåer (flagg/nya/borja) | kalibreringsmätning |
|---|---|---|
| 640–699 | 19.5 / 26 / 10.5 rem | @640 (radpar 174–505, medel 310; nya 418; borja 168) |
| 700–735 | — / 51 / 12.75 rem | @700 (nya 800–836; borja 194–214) |
| 736–767 | — / 45.5 / 12.75 rem | 768-profilen (liW 331–345 ≈ 347) |
| **768–799** | **orört** (o97:s 45.5/12.75 = −66 mätt) | rond 1:s bandnivåer under-tär här (+112) ⇒ togs bort |
| 800–899 | — / 43 / 11.5 rem | @820 (nya 661–739 mitt 688; borja 175–194) |
| 900–1 023 | — / 39 / 11 rem | @900 (nya 622; borja 175) |
| 1 024–1 087 | — / 52.25 / — | @1 024 (nya 836; borja 204 ✓ o97) |
| **≥1 088** | **orört** (o97; 1 088 Σ+100 dokumenterad rest — överprecision avstås) | 1 152/1 280 ✓ |

Flaggskeppen orörda ≥700: sektionen ligger överst (över vecket i alla
testade viewportar) — platshållaren aldrig aktiv (o103 §3.2:s egen not;
mina FÖRE==EFTER för flagg på ALLA geometrier bekräftar).

## §4 A/B-BEVIS (proxy-injicerad kandidat-CSS, identisk kanal — enda delta = kuren)

| Bredd | utan kur | med kur |
|---|---|---|
| 640 | −1 623 | **−93** |
| 700 | ~+1 000 | **−61** |
| 720 | — | **−136** |
| 740 | — | **+10** |
| 768 | −66 | −66 (orörd ✓) |
| 800 | (≈820-läget) | **+45** |
| 820 | −294 | **−45** |
| 900 | −394 | **−18** |
| 1 024 | +335 | **−6** |
| 1 152 / 1 280 | −17 / −17 | −17 / −17 (kontroller orörda ✓, o97-paritet bitidentisk) |

## §5 DOM mot o103

o103 förkastade kur med «EN nivå per md-band kan inte träffa alla tre …
delband = överanpassning på tre punkter». Motbevis: (a) serien är 12
geometrier, inte tre — höjden följer kortbreddens radbrytningskliv (mätpunkter
640·700·720·740·768·800·820·900·1 024·1 088·1 152·1 280), bandgränserna
sätts VID kliven, inte mellan mätpunkter godtyckligt; (b) A/B-ronderna visar
ΣΔspan −136…+45 över hela registret — kirurgisk regim (o97-facit −17),
inte skattning. «Skörhet mot kurstillskott» gäller reservationer som klass
(o93+o97 lever i prod med samma egenskap); auto-nyckeln minns verklig höjd
efter första pass. NYTT FYND UTANFÖR o103:s objekt (768–1 024): sm-bandet
640–767 med SMÄRRE felen (−1 623 docH −4 573 @640; ~+1 000 @700–767) —
o103:s kundpåverkanssiffra («värsta fallet 126 px») täckte inte detta.

## §6 EFTER-kriterier (vakarövertag-barra om deploy landar efter fönstret)

1. prod 200 ×5 https: / · /kurser · /en/kurser · /ar/kurser · /blogg.
2. Sond EFTER (`node verktyg/_s7u2o104-sond.mjs efter-<geo> http://localhost:3000/kurser <BREDDxHOJD>`)
   på nytt bygge: ΣΔspan ≤ ~150 på 640·700·768·820·900·1 024; 1 280 = −17.
3. Mobil <640 + ≥1 088 orörda (Δ0 mot o97-läget).
4. Gränssnittsvakten 0 fynd nästa cron-löp.

## §7 KVD

- src/ ENDAST Edit (globals.css: ett nytt kommentarat block + sex
  @media-band; tsc 0 via projektbinär, exit 0). INGET eget bygge
  (prod-synken äger deploy).
- R2 orörd · data/blogg/ orörd · syskonleveranser orörda (o99–o103:s
  filer i HEAD efter läkningen; föregångarens o100-golv disjunkt).
- Reset-incidenten läkt + bokförd (§0.2, worklog) — återställningen bar
  ENDAST redan committat material (noll ocommittat förlorat).

## §8 Kö vidare

1. Utvalt-familjens höjdheterogenitet i sig (flagg radvis 174–934) =
  huvudagentens SSR-post (o19 §3.1 + o97 §6.1 + o103 §6.1) — RÖRS EJ.
2. o100-EFTER + o104-EFTER vid prod-synkens deploy (BUILD_ID lämnar
  9RBeu): bådas EFTER-kriterier vakarövertag-barra.
3. Zombie-resetens ursprung (vilken process ägde 04:1x-reseten? kandidater:
  levande s7-sessioner med git-städning i sitt slutsteg) — huvudagenten;
  det finns nu TVÅ incidenter i klassen (s5 02:27 + denna).
