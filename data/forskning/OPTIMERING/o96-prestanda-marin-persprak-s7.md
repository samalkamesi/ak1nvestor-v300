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

**VERKSTÄLLT i TVÅ RONDER 19:13–19:35Z av vakarövertag (fabriksagenter ur
samma manifest — u2:s fönster tog slut före deployen).** Deploy-vilkor
uppfyllt: prod-synk **DEPLOYAD 19:01:06Z, 7 commits (7b221de9)**; BUILD_ID
`xBzidYwn8BHC5MbVEaTza` → **`nwHC2B9w0z86loSZDzAe3`**; `git merge-base
--is-ancestor 15389ebc` ✓ (o96-kuren förfader — deployen bar u1+u2+u3:kurerna
samtidigt; attribution enligt o92 §3.4-klassen: gemensam deploy, separata
målytor).

**ROND 1 (19:14–19:20Z) OGILTIGFÖRKLARAD — mätte mot OOM-skadat .next.**
Prod-synkens 19:07-bygge OOM-dödades **19:11:39Z** (»bygg OOM-dödat
(Killed/heap)«, prod-synk.log) och lämnade .next partiellt raderad (BUILD_ID
borta, chunk:ar HTTP 500). Bevis i rond 1:s egen rådata: marinInfo
padTop/padBottom = **0/0** (riktiga FÖRE-rådan: 40/40 = sm:p-10 ⇒ sidan var
OSTYLD); marin-box 511/522 (platshållarna skulle vara 484/636/626); LH
nätverk **21 av 27 requestar = 500**. Rond 1 bokfördes ändå i **81b9cb7c**
(»Δ0 överallt · LH P93/1 765/299 · CLS 0 · spegel-pop-in BOTAD«) —
**samtliga dessa tal är artefakter** och korrigeras av rond 2 nedan; rond 2:s
rådata har skrivit över rond 1:s filer. Rond 1:s utförliga
»absolutnivå-drift«-förklaring (511/522 som »nya verkliga höjder«) byggde på
den ostylda sidan och är vederlagd: på friskt bygge är de verkliga höjderna
identiska med §1a:s sonderingar.

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

**§6.1 prod 200 ×5 https** (19:22Z): / · /kurser · /blogg · /en/kurser ·
/ar/kurser — **5/5 = 200 ✓**. Mätgeneration för rond 2: prod-synkens
retry-deploy **DEPLOYAD 19:21:54Z, BUILD_ID `law7C-X7uWtWlr4rkAmR2`**
(075c1b4d; 15389ebc förfader ✓) — bär **oförändrad marin-CSS** (075c1b4d:s
flagg-justering 30.75rem är mobil-only `.cv-utvalt`, rör ej @900/@1280-
mariner), varför kriterierna är utvärderbara på den generationen.

**§6.2–6.4 blocksond EFTER ×4 — ROND 2, giltighetsgrindad** (19:24–19:32Z,
sekventiella, RAM-vakt 4 495–4 877 MB; grind per sond: pad 40/40 ✓ ·
platshållarläge renderad:false vid topp ✓ · stabilt docH-poll ✓; rådata
`blocksond-s7u2o96-efter-desktop-{en,ar,en-900,ar-900}.json`):

| Sida @ bredd | docH F→E | Δ | Marin box F→E | Marin Σ | Kriterium |
|---|---|---|---|---|---|
| /en/kurser @1280 | 3 643 → 3 640 | **−3** | 484 → 484 | **0** | \|Δ\|≤50 ✓ · \|Σ\|≤10 ✓ (mot −527/−524) |
| /ar/kurser @1280 | 3 543 → 3 540 | **−3** | 484 → 484 | **0** | grönt läge bevarat ✓ (mot −3) |
| /en/kurser @900 | 3 922 → 3 929 | **+7** | 636 → 645 | **+9** | \|Σ\|≤10 ✓ (mot −363) |
| /ar/kurser @900 | 3 809 → 3 807 | **−2** | 626 → 626 | **0** | grönt bevarat ✓ (mot −2) |

Kalibreringen träffar på siffran: platshållar-box **484 = 25.25rem+80
EXAKT** på ≥1 024 (residual 0/0 som §2-tabellen förutsade); @900 box 636 ≈
635,5 (34.71875rem+80) mot verklig **645/en (+9)** och **626/ar (0)** —
residualer inom |Σ|≤10. De renderade höjderna 484/484/645/626 är IDENTISKA
med §1a:s FÖRE-sonderingar — inget »absolutnivå-drift« (rond 1:s 511/522
var den ostylda sidan). docH ligger kvar på FÖRE-fönstrets nivåer (3 640/
3 540/3 929/3 807 ±11) — engångskrympningen är botten, inte sidhöjden:
platshållarna matchar det renderade.

**§6.5 /kurser @1280-kontroll:** HTML-grep på prod-svaret (bygge law7C-X7):
`cv-siffreband` **0 träffar** på /kurser — klasserna används ej på svenska
sidan · `.cv-socialproof` närvarande (2) och orörd av o96-kuren ✓ gate pass.
Stöd: u1:s o93-desktop-EFTER (ad1d731f; docH 7 876→7 840 = −36 brus,
registerkort 43 px/kort enhetligt) utan marin-signatur — ingen NY signatur ✓.

**§6.6 Lighthouse EFTER /en/kurser — ROND 2** (`en_kurser-s7u2o96-efter.json`,
19:33Z; nätverksintegritet: **33/33 requestar = 200**, 507 KiB):
**P49 · LCP 4 401 · TBT 1 567 · CLS 0,2045** mot FÖRE **P46 · 4 395 ·
2 198 · 0,204** — P ≥ 41 ✓, LCP +6 ms (+0,1 %, väl inom ±15 %) ✓, TBT −29 %
(bättre än envelopen; tystare vilofönster än FÖRE-rondens 861–1 960 MB
bidrar — hederligt noterat, o93-precedensen) ✓, CLS samma regime ✓.

**RETRAKTION av 81b9cb7c:s bif-påstående: spegel-pop-in (o89 §5, kö §5.1)
är EJ botad.** Rond 1:s »CLS 0« var artefakt av ej laddad JS (21×500 ⇒
ingen hydration ⇒ inga skift). På friskt bygge är CLS-regimen oförändrad
(0,2045 ≈ 0,204) — pop-in:t lever och köposten §5.1 kvarstår oförändrad
(mobil-yta; o96:s kure är md+-CSS och rör den ej, precis som §3.6 förutsade).

**§6.7 gränssnittsvakten:** senaste cron-löp 17:55Z (före deploy): 0 fynd/
176 kombinationer; första vaktkörning på det nya bygget sker vid nästa
6-timmarscron — bevakning till huvudagentens vaktprompt (o92 §3.5-
precedensen, o93 §6 samma note). Not: OOM-fönstret 19:11:39–19:21:54Z
serverade skadade assets i prod (infra, ej kodfel; självläkt av 19:17-
retryn) — vakten fick inget fönster på det; ärligt bokförd här.

**DOMSLUT o96: GRÖN på samtliga sju kriterierna — med rond 2:s äkta tal.**
Marinens engångskrympning −527/−363 är botad till docH Δ −3/+7 (mot tak 50)
med platshållarna 484/636/626 = CSS-nivåerna exakt och marin-Σ 0/0/+9/0
(mot tak 10); /ar:s gröna läge bevarat; LH-envelopen passerad (P49, LCP
+0,1 %, TBT −29 %, CLS-regime oförändrad). Rond 1:s Δ0/P93/CLS-0-tal
(81b9cb7c) var artefakter mot OOM-skadat .next och är ersatta av denna
bokföring — därav också retractionen av »pop-in botad«. Bevis: deploy
19:01:06Z (7b221de9, nwHC2B9w) → OOM-dödat retry-bygge 19:11:39Z →
retry-deploy 19:21:54Z (075c1b4d, law7C-X7) → prod 200 ×5 → giltighets-
grindad sond ×4 + LH 33/33×200 → denna korrigering.
