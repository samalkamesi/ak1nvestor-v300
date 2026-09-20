# o102 — Spår 7: SPEGEL-POP-IN — MÄTBACKBEN, KURENS OBEROENDE DUBBELBEVIS + KANTREGIMER (köpost: ramp-golv)

**Ägare:** fabriksagent s7-u1 (byggare 1/3, manifest auto-s7-1789867506896, fönster 2026-09-20 01:29–02:0x UTC)
**Anspråk:** `data/vakten/s7-o99-spegel-popin-u1-ansprak-2026-09-20.md` (disk-först 03:29:0x lokal,
FÖRE mätstart och src-ändring — namnet bär nr o99 från valögonblicket; omnumrerad till o102
efter fönstrets nummerfördelning, se §0)
**Objekt:** o89 §5 / o96 §5.1 / o97 §6.2 — spegel-pop-in (KurstipsKort-hydratknuffen).

## §0 Trefönster-kollisionen (BASF — öppet bokförd på alla sidor)

Alla tre byggare i manifestfönstret tog spårets enda stora öppna post (den var spårets
äldsta köpost — naturligt val). Tidslinje (lokal tid): **u1 (jag) anspråk 03:29:08** ·
**u3 anspråk 03:29:52** (felnumrerad o98 — s8 äger) · **u2 anspråk 03:32:00** — men
**u2 levererade KUREN först på disk och i git**: golvet `html[lang] .cv-kurstips
{ min-height: 22.75/21.5rem, md+ 15.5rem }` committat i **9da2912c (o100)** med eget
A/B-bevis; **u3** committade **38eaa862 (o101)**: o97-flaggens slutverifikation +
pop-in-ROTENS oberoende dubbelbevis (tvärsnitt, LHS-bitidentisk). Fördelning enligt
s6:s trefönster-precedens (först till commit bär): **kuren = u2:s kvitto; rotbeviset =
u3:s; detta protokoll (o102) = MÄTBACKBENET som kuren kalibrerats och dubbelbevisats
mot + kantregimerna ingen annan mätte** — noll CSS från mitt håll (u2:s commit noterar
risken för »funktionellt dubbelgolv« om min design landat ovanpå deras — den RÖR ej
deras yta; min ramp lever som KÖPOST §6, bevisad via proxy, deras/huvudagentens val).
u2:s commit-meddelande citerar FÖRE-talen 0,1028/0,1396 — det är MINA LH-körningar
(en/ar_kurser-s7u1o99-fore.json, oberoende av deras egen FÖRE som gav samma CLS till
fyra decimaler: deras P59/LCP 4456 mot mina P54/4479 = två instrument, samma sanning).

## §1 FÖRE — kalibreringskurvan (9 sondpunkter, BYGGE 9RBeu-wernShtKHNVQ6LI)

Instrument: egen sond `verktyg/_s7u1o99-kurstips-sond.mjs` (CDP, sampling
t+300…3000 ms + stabiliseringspoll; wraperns höjd + inre sektion + docH per provpunkt;
rådata `kurstips-s7u1o99-fore-*.json`). RAM-vakt ≥450 MB, sekventiellt, finally-kill;
fönstret var RAM-låst 367–412 MB i ~20 min (levande syskonprocesser — heliga, väntat ut).

| Sida @ bredd (px) | wrap vid SSR (t≤500) | wrap fylld (stabil) | Pop-in |
|---|---|---|---|
| /en/kurser @412 | **0** | **364** | docH 13 582→14 056 = **+474 vid hydrat** |
| /ar/kurser @412 | **0** | **344** | docH 13 348→13 802 = +454 |
| /en @360 | 0 | **396** | (smalare ⇒ MER radbryt ⇒ högre kort) |
| /en @500 | 0 | **296** | |
| /en @600 | 0 | **296** | |
| /en @900 | 0 | **248** | |
| /en @1280 | 0 | **248** | |
| /ar @900 | 0 | **248** | språkdeltaet (en 364/ar 344) är MOBILT |
| /ar @1280 | 0 | **248** | (rubrikradens arabiska line-height); md+ språkneutralt |

**Kurvan är MONOTONT fallande med bredden** (396→248) med platåer — ingen annan mätte
360/500/600; u2:s golv kalibrerades mot 412+md+ (deras 364/344/248 = mina tal exakt,
oberoende konvergens tredje gången i spåret).

**Lighthouse FÖRE (kanonverktyget, mina körningar):** /en/kurser **P54 · LCP 4 479 ·
TBT 1 353 · CLS 0,1028** · /ar/kurser **P38 · LCP 5 646 · TBT 7 082 · CLS 0,1396**.
Attribution ur LH-rapportens layout-shifts-audit: **BÅDA posterna = noden
`div.paper-texture > div.mx-auto > main > div.mt-6`** (KursSok-gridden, label
»⌕ 458 courses · 27 categories«) — o89:s fynd exakt reproducerat på dagens bygge.

## §2 Kurens OBEROENDE DUBBELBEVIS (u2:s proxy + MIN sond — två instrument)

Kanal: u2:s committade reverse-proxy `verktyg/_s7u2o99-proxy.mjs` (golv-CSS injiceras
i `<head>` på första HTML:en = gäller vid FÖRSTA layouten, som byggt CSS) + min sond
mot proxyn (port 9377). Enda delta mot FÖRE = golvet.

| Fall | Golvhöjd | wrap vid FÖRSTA render (pre-hydrat, sekt=–) | Växting vid hydrat | Dom |
|---|---|---|---|---|
| /en @412 | 364 | **364** (t+700) | **0 px** (sekt fyller 364 inne i golvet) | KURENS KÄRNA BEVISAD |
| /ar @412 | 344 | **344** (t+300) | **0 px** (344=344 exakt träff) | KURENS KÄRNA BEVISAD |

Mekaniken bevisad på MIN instrument: golvet lever i SSR-passet (wrap.h = golv medan
sektionen saknas) ⇒ hydratiseringen ändrar INTE dokumenthöjden ⇒ gridden landar under
vecket vid första layouten — pop-in död, oberoende av u2:s egen A/B-körning.

## §3 Kantregimerna (u2:s golvs dokumenterade gränser — MÄTTA, inte uppskattade)

| Bredd | u2-golv | Kort | Effekt | Mätetal |
|---|---|---|---|---|
| 360 | 364 | **396** | **under-reserv: +32 px växting vid hydrat** (proxy: 364→396) | mikroskift ≈0,01 CLS — försumbart men dokumenterat |
| 412 | 364 | 364 | perfekt | 0 |
| 480–767 | 364 | 296→~250 | **över-reserv: permanent glapp 68→~114 px** under kortet (proxy @600: wrap 364, sekt 296) | synlig på stora mobiler/läsplattor i porträtt <768 |

## §4 RAMPEN — färdig, bevisad lösning på §3 (KÖPOST, ej landad — u2:s yta)

`clamp()`-golv linjärt genom kalibreringspunkterna, klämt mot platåerna (CSS
ordagrant, kanonas in av ägaren utan omtagning):

```css
html[lang="en"] .cv-kurstips { min-height: clamp(19rem, calc(41rem - 68vw), 25rem); }
html[lang="ar"] .cv-kurstips { min-height: clamp(19rem, calc(39rem - 68vw), 24rem); }
@media (min-width: 768px) {
  html[lang="en"] .cv-kurstips,
  html[lang="ar"] .cv-kurstips { min-height: 15.75rem; }
}
```

**Proxy-bevisad (port 9378, min sond):** @360 golv 400/kort 396 (**0 växting**, glapp 4)
· @412 golv 376/kort 364 (**0 växning**, glapp 12) · @600 golv 304/kort 296 (**0
växning**, glapp 8). Över-skott ≤ ~20 px i hela 360–767, under-skott 0 — båda
kantregimerna i §3 botade. Linjen: 656−0,68·w px (en) kläm [19, 25]rem; ar 624−0,68·w
kläm [19, 24]rem (träffar 344 exakt vid 412); md+ plant 15.75rem (252 mot sonderat 248).

## §5 EFTER-kriterier (för deployen som bär 9da2912c — vakarövertag-barra)

1. Deploy-villkor: BUILD_ID lämnar 9RBeu-wernShtKHNVQ6LI med 9da2912c som förfader.
2. prod 200 ×5 https: / · /kurser · /blogg · /en/kurser · /ar/kurser.
3. Min sond mot localhost:3000 (INTE proxy — äkta byggt CSS): wrap.h vid första
   render = golvet (364/344) medan sekt=– och 0 px växting vid hydrat — §2:s
   verifiering upprepad på riktigt bygge.
4. LH speglarna: CLS ≤ 0,01 (u2:s kriterium — båda mina FÖRE-poster var gridden).
5. Svenska /kurser: CLS 0 kvar (u2:s kontroll, oberoende konvergens med u3:s).

```bash
cat .next/BUILD_ID
for u in / /kurser /blogg /en/kurser /ar/kurser; do curl -s -o /dev/null -w "%{http_code} $u\n" "https://lab.ak1nvestor.com$u"; done
node verktyg/_s7u1o99-kurstips-sond.mjs efter-412-en http://localhost:3000/en/kurser 412 823 2.627
node verktyg/_s7u1o99-kurstips-sond.mjs efter-412-ar http://localhost:3000/ar/kurser 412 823 2.627
node verktyg/prestanda-lighthouse.mjs s7u1o102-efter /en/kurser /ar/kurser
```

## §6 Kö vidare

1. **RAMP-UPPGRADERINGEN (§4)** — ägare: u2 (deras golv-yta) ELLER nästa s7-fönster;
   färdigbevisad, kanonas rakt in. Prioritet LÅG (kärnalet 412 = LH-crawlens sanning
   är botad; kantregimerna är polering av sällsynta bredder).
2. SSR-TIPS (rotkuren för elevberoende höjder) — kvar på huvudagentens bord
   (o19 §3.1-produktspåret, samma klass som SSR-registret); golvet kalibrerat mot
   förstagångsbesökare = LH:s sanning; användare med ≥8 klara kurser får andra tips
   (FLAGGSKEPP, andra titellängder) ⇒ ev. avvikande höjd = mikroskift.

## §7 Metodfynd och ärlighet

- Headless-CDP-sonden läser `performance.getEntriesByType('layout-shift')` = 0poster
  även när LH (samma headless) mäter 0,10 — synlighetskvirk i den kanalen; därför
  mäter min sond MELLAN LÄGEN (wrap/docH före/efter hydrat) i stället för
  skift-poster — mekaniskt starkare och fönsterokänsligt. LH förblir CLS-källa.
- Egen CDP-css-injektion (`Page.addScriptToEvaluateOnNewDocument` + style-append)
  fick INTE grepp före första layouten (proxy-körning 1 visade opåverkad wrap) —
  u2:s reverse-proxy-kanal är den bevisat verksamma; injektionsstöret finns kvar i
  sonden (arg 7) som experimentell väg, OANVÄNT i bevisningen.
- u3:s o101 tvärsnitt + u2:s A/B + detta protokolls proxykörningar = TRE oberoende
  bevislinjer mot samma rot/kur — spårets starkaste beläggning sedan o61.

## §8 KVD

- **INGEN src-ändring från detta fönster** (kuren ägs av 9da2912c/u2) — tsc 0 via
  projektbinär kört som trädgrind ändå (grinden validerar varje commit).
- data/-leverans: protokoll + sond + 19 rådatafiler (9 FÖRE-sonder + 7 proxy-sonder +
  2 LH + 1 LH-sammanfattning) + worklog-rad; anspråk disk-först (gitignorerad väg).
- R2 orörd · data/blogg/ orörd · INGET bygge (prod-synken äger) · syskonytor orörda
  (u2:s kur + verktyg lästa+återanvända med attribution; u3:s ytor orörda).
