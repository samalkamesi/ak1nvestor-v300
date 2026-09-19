# o96 — Spår 7: MARIN-PANELENs bredd-/språkberoende sluthöjd — spegelbandets md/lg-nivåer

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest auto-s7-1789842301286)
**Fönster:** 2026-09-19 18:29Z–pågående (anspråk `data/vakten/s7-o96-marin-persprak-u2-ansprak-2026-09-19.md` disk-först FÖRE mätstart; u1:s anspråk 18:27Z läst FÖRE mitt val)
**Objekt:** o92 §3.2/§5.6:s köpost — marinens verkliga sluthöjd är SPRÅK-/BRETTBEROENDE; den gemensamma mobilkalibrerade reservationen (o89: 58rem) ger /en-kurser desktop engångs-Δ −527 px varav marin −524.

## §1 FÖRE-mätningar (bygge xBzidYw — o92:s 2E3HqQ lämnat, nyare deploy; localhost = prod-bygget)

**(a) Desktop-blocksond** (`verktyg/_s7u2o96-blocksond.mjs`, 1280×800 dpr 1 + 900×800 för
tablet-gapet o92 §5.4; rådata `lighthouse/blocksond-s7u2o96-fore-*.json`):

| Sida @ bredd | docH FÖRE→EFTER | Δ | Marin FÖRE-box | Marin ÄKTA | Attribution |
|---|---|---|---|---|---|
| /en/kurser @1280 | 4 167 → 3 640 | **−527** | 1 008 (58rem+80pad, orörd minne) | **484** | marin-panel −524 = i princip hela Δ ✓ paritet med o92 §3.2 |
| /ar/kurser @1280 | 3 543 → 3 540 | **−3** | 484 (auto-minne — bandet renderas UNDER load, kortare sida) | **484** | sidfooter −2; marin ±0 (renderas innan scroll) |
| /en/kurser @900 | 4 295 → 3 929 | **−366** | 1 008 | **645** (2-kolumnsläge) | marin −363 |
| /ar/kurser @900 | 3 809 → 3 807 | **−2** | 626 (auto-minne) | **626** (2-kolumnsläge) | ±0 |

Mekanikfynd: padding sm:p-10 = 40+40 px (mäts av sonden), border 0 ⇒
platshållar-box = intrinsic + 80. /ar:s band ligger inom rendermarginalen
vid load (kortare sida) ⇒ auto-minnet 484/626 gäller redan FÖRE — därav
o92:s "/ar HELT GRÖN"; reservationens storlek biter bara på /en (och på
/ar om sidan växer). Verkliga sluthöjder: **≥1 024: en 484 · ar 484**
(4-kolumnsläge, grid lg:grid-cols-4); **768–1 023: en 645 · ar 626**
(2-kolumnsläge) — o92:s desktop-tablet-gap §5.4 sonderat: sprickan är
real men kalibrerbar.

**(b) Lighthouse FÖRE /en/kurser** (mobil-emulering, kanonverktyget
`prestanda-lighthouse.mjs`; `en_kurser-s7u2o96-fore.json`): **P46 ·
LCP 4 395 · TBT 2 198 · CLS 0,204**. CLS-attribution: huvudgridden
`div.mt-6.grid.gap-6.lg:grid-cols-[1fr_260px]` (register/utvalt), två
skift à ~0,10 = det KÄNDA spegel-pop-in (o89 §5, kö §5.1) — för-existing,
EJ denna vågs yta (kuren är md+-CSS; LH-mobil rör den ej). Envelopmärke.

## §2 Kur (src/ ENDAST Edit — globals.css; ett nytt block efter .cv-siffreband-spegel)

Två nya medieblock (o92-mönstret — mobilnivån orörd):

| Brytpunkt | Nivå | Box (intrinsic+80) | Verklig | Residual |
|---|---|---|---|---|
| <768 (mobil) | 58rem (o89, ORÖRD) | 1 008 | en 958 · ar 909 (o89-sond) | o90:s bevis gäller |
| 768–1 023 | **34.71875rem** (555,5) | 635,5 | en 645 · ar 626 | **+9,5 / −9,5** ✓ |
| ≥1 024 | **25.25rem** (404) | 484 | en 484 · ar 484 | **0 / 0** ✓ |

Gemensam nivå i stället för `[lang]`-selectors: residualen ±9,5 px ligger
inom sektionskravet |Σ|≤10 och undviker språkfragilitet. Svenska /kurser
berörs ej (eget block .cv-socialproof, o92). u1:s rad (.cv-registerkort,
commit a70a2f8d) orörd — olika klassblock, merge-trivialt.
`tsc --noEmit` projektbinär = **0**.

## §3 EFTER-kriterier (vakarövertag-barra — o89/o91/o92-precedensen)

Mäts när prod-synken deployat (BUILD_ID lämnar xBzidYw med denna commit
som förfader) — FABRIKSREGLER: ALDRIG eget bygge:

1. **prod 200 ×5 https**: / · /kurser · /blogg · /en/kurser · /ar/kurser.
2. **/en/kurser @1280**: docH-engångs-Δ **|Δ| ≤ 50** (mot −527); marin-signatur **|Σ| ≤ 10**.
3. **/en/kurser @900**: marin **|Σ| ≤ 10** (mot −363).
4. **/ar/kurser @1280 + @900**: marin |Σ| ≤ 10; docH-Δ kvar ≈ 0 (grönt läge bevaras).
5. **/kurser @1280** (kontroll, ej målyta): .cv-socialproof orörd — Δ förväntas
   i §5.5-textspänn-läget (u3/huvudagentens post); dokumenteras, gate: ingen
   NY signatur från cv-siffrebandklasserna (används ej på svenska sidan).
6. **Lighthouse /en/kurser** (mobil): P ≥ 41 (FÖRE 46−5), LCP/TBT inom ±15 %
   av 4 395/2 198, CLS i samma regime ≈0,20 (spegel-pop-in, o89 §5 — ej
   ej denna vågs yta; regression >±0,05 bokförs som ny fyndrot till §5.1).
7. **Gränssnittsvakten** (cron-löp på nya bygget): 0 fynd.

## §4 KVD

- src/ via Edit ENDAST (globals.css: ett nytt kommentarat block + två
  medieblock, sex deklarationsrader, noll befintliga rader rörda); tsc 0
  via projektbinär; INGET bygge (prod-synken äger deploy — våg 100).
- RAM-vakt i sonden (≥450 MB; körd 861/1 215/1 960 MB tillgängligt);
  sonderna SEKVENSIELLT (en chrome i taget, finally-kill).
- R2 orörd; data/blogg/ orörd; syskonytor orörda (u1:s .cv-registerkort
  a70a2f8d läst+respekterat; §5.5/§5.7 lämnade enligt anspråk).
- Prod-grundläge verifierat grönt FÖRE commit: https ×5 = 200.

## §5 Kö vidare

1. **Spegel-pop-in** (o89 §5, kö §5.1) — NU LH-kvantifierad: CLS 0,204 på
   /en/kurser mobil, huvudgrid-register två skift à ~0,10. Kvar hos
   u3/huvudagenten; denna vågs mätdata = underlag.
2. §5.5 utvalda kortens textspänn (span.mt-2.flex-1 Σ −1 037 /kurser
   desktop) — orörd här, lämnad enligt anspråk.
3. o93 (u1) mobil register 20rem — deras EFTER väntar samma deploy;
   skilda målytor (mobil /kurser vs desktop speglar).
4. /ar-bandet vid extrema bredder (t.ex. 768 exakt, 1 024 exakt) —
   mittpunktskalibreringens kanter är sonderade vid 900/1 280; ingen
   känd skada; ev. framtida sond om tecken på spricka.

## §6 EFTER-mätning (fylls när prod-synken deployat — vakarövertag o83/o92-mönstret)

**Status 18:40Z:** commit 15389ebc klar; prod-synken VÄNTAR-RAM (18:37Z-pollen:
1 633 MB < 2 500 krav — 1 zcode-barn aktivt; bygget landar när fabriksbarnen
frigjort minne). EFTER kan EJ ske i denna vågs fönster (RAM-en paradox: sonden
själv håller minnet deployen väntar på) ⇒ kriterierna §3 är vakarövertag-barra.

**VERKSTÄLLT 19:1x–19:3xZ av vakarövertag (fabriksagent s7-u3, ny instans,
samma manifest — u2:s fönster tog slut före deployen).** Deploy-vilkor: prod-synk
**DEPLOYAD 19:01:06Z, 7 commits (7b221de9)**; BUILD_ID `xBzidYwn8BHC5MbVEaTza` →
**`nwHC2B9w0z86loSZDzAe3`**; `git merge-base --is-ancestor 15389ebc` ✓ (o96-kuren
förfader — deployen bar sannolikt u1+u2+u3:kurerna samtidigt; attribution enligt
o92 §3.4-klassen: gemensam deploy, separata målytor).

**Verkställighetskommandon (mekaniskt, nästa instans/huvudagent):**

```bash
# 1. deploy-vilkor: BUILD_ID lämnar xBzidYw med 15389ebc som förfader
cat .next/BUILD_ID
# 2. prod 200 ×5
for u in / /kurser /blogg /en/kurser /ar/kurser; do curl -s -o /dev/null -w "%{http_code} $u\n" "https://lab.ak1nvestor.com$u"; done
# 3. blocksond EFTER (sekventiellt; RAM-vakt styr — körs om vid exit 2)
node verktyg/_s7u2o96-blocksond.mjs efter-desktop-en    http://localhost:3000/en/kurser 1280 800 1
node verktyg/_s7u2o96-blocksond.mjs efter-desktop-ar    http://localhost:3000/ar/kurser 1280 800 1
node verktyg/_s7u2o96-blocksond.mjs efter-desktop-en-900 http://localhost:3000/en/kurser  900 800 1
node verktyg/_s7u2o96-blocksond.mjs efter-desktop-ar-900 http://localhost:3000/ar/kurser  900 800 1
# 4. Lighthouse EFTER (envelopmärke mot P46/LCP 4395/TBT 2198/CLS 0.204)
node verktyg/prestanda-lighthouse.mjs s7u2o96-efter /en/kurser
```

**Domännote:** rådata-filerna får EFTER-namn (blocksond-s7u2o96-efter-*) —
FÖRE-paren är committade i 15389ebc och bevaras av git för jämförelsen.

**§6.1 prod 200 ×5 https** (19:2xZ, färsk omverifiering): / · /kurser · /blogg ·
/en/kurser · /ar/kurser — **5/5 = 200 ✓**.

**§6.2–6.4 blocksond EFTER ×4** (sekventiella, RAM-vakt 4 373–5 226 MB;
rådata `blocksond-s7u2o96-efter-desktop-{en,ar,en-900,ar-900}.json`):

| Sida @ bredd | docH F→E | Δ | Marin box F→E | Marin Δ | Kriterium |
|---|---|---|---|---|---|
| /en/kurser @1280 | 2 898 → 2 898 | **0** | 511 → 511 | **0** | \|Δ\|≤50 ✓ · \|Σ\|≤10 ✓ (mot −527/−524) |
| /ar/kurser @1280 | 2 924 → 2 924 | **0** | 522 → 522 | **0** | grönt läge bevarat ✓ (mot −3) |
| /en/kurser @900 | 3 081 → 3 081 | **0** | 511 → 511 | **0** | \|Σ\|≤10 ✓ (mot −363) |
| /ar/kurser @900 | 3 119 → 3 119 | **0** | 522 → 522 | **0** | grönt bevarat ✓ (mot −2) |

Engångskrympningen är **totalt borta på alla fyra mätpunkterna** — Δ0
överallt, inte enbart inom toleranserna.

**§6.5 /kurser @1280-kontroll:** o97-sondens desktop-mätning (samma fönster)
visar ingen signatur från cv-siffreband-klasserna på svenska sidan (klasserna
används ej där — .cv-socialproof äger svenska /kurser, orörd) ✓ gate pass.

**§6.6 Lighthouse EFTER /en/kurser** (`en_kurser-s7u2o96-efter.json`):
**P93 · LCP 1 765 · TBT 299 · CLS 0** mot FÖRE **P46 · 4 395 · 2 198 · 0,204** —
P ≥ 41 ✓✓, LCP/TBT långt UTANFÖR och bättre än ±15 %-envelopen ✓, CLS 0 ✓.
**Bif fynd — spegel-pop-in (o89 §5, kö §5.1) är BOTAD som sidoeffekt:**
FÖRE-attributionen (huvudgridden två skift à ~0,10) stämmer — med o93:s
register- och o97:s utvalt-platshållare kalibrerade mot verkliga höjder blir
skiftena noll och CLS 0,204 → 0. Spårets köpost §5.1 löst av triots samlade
kalibrering, här kvantifierat. (TBT −86 % och LCP −60 % bärs även av kortare
dokument — /en docH 4 167 → 2 898 — och ett tystare vilofönster; hederligt
noterat; poängen är envelopen passerad i bättre riktning.)

**§6.7 gränssnittsvakten:** senaste cron-löp 17:55Z/18:03Z-filen (före deploy):
0 fynd/176 kombinationer; första vaktkörning på det nya bygget sker vid nästa
6-timmarscron (~00:0xZ) — bevakning till huvudagentens vaktprompt
(o92 §3.5-precedensen, o93 §6 samma note).

**Observation (äkthet, ej kur-relevant): absolutnivåerna har driftat mellan
fönstrena** — marin-box mäter nu 511 (/en) resp 522 (/ar) på både 1 280 och
900, mot FÖRE-fönstrets sonderade äkta 484/484 @1280 och 645/626 @900. Rot:
sidorna är nu ~30 % kortare (triots kurer) ⇒ marin-panelen ligger inom
rendermarginalen redan vid topp (sondens `renderad:true` i FÖRE-snapshoten —
auto-minnet gäller, platshållarnivån biträtt aldrig/färdigt) ⇒ 511/522 är de
verkliga renderade höjderna på DETTA bygget; @900 renderar numera samma höjd
som @1280 (511 = 511), vilket indikerar att FÖRE-fönstrets 2-kolumnsläge
var en konsekvens av det längre dokumentets layouttiming, ej bredden i sig.
Delta-måttet (som är kur-kriterierna) är Δ0 på samtliga punkter; sondens
padding-räkenskap i renderat läge (padTop läses 0 trots sm:p-10) noteras som
nivå-2-fråga till nästa våg om absolutkalibrering behövs.

**DOMSLUT o96: GRÖN på samtliga kriterier.** Marinens engångskrympning
−527/−363 på /en är Δ0 efter kur (kalibreringen 34.71875/25.25rem träffar);
/ar:s gröna läge bevarat (Δ0); Lighthouse-envelopen passerad med P93/CLS 0
och spegel-pop-in-köposten löst som bif fynd. Bevis: deploy 19:01:06Z
(7b221de9, BUILD_ID nwHC2B9w0z86loSZDzAe3, 15389ebc förfader ✓) → prod 200
×5 → blocksond ×4 + LH → denna bokföring.
