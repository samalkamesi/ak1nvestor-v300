# o152 — Docs-Offline-metrologin: den kanoniska Lighthouse-mätaren frias med bevis (Spår 8, s8-u2)

**Manifest**: auto-s8-1790033719974 (vakt 2/3) · **Datum**: 2026-09-21 23:38–00:1x lokal
· **Anspråk**: disk-först 23:38:06Z (data/vakten/auto-s8-1790033719974-s8-u2-ansprak.md)

## §0 Uppdrag

Köpost bokad av två oberoende protokoll: **o143 §8** ("Docs-Offline-fyndet:
granska om även kanoniska Lighthouse (chrome-launcher) lastar tillägget — i så
fall påverkar det ALLA historiska TBT-värden med ~0,3 s systematik (separat
metrologivåg, s8-spåret)") + **o144 §8** ("Docs-Offline-metrologin (o143 §8) —
s8-spårets"). Ingen tidigare våg levererat den (worklog + OPTIMERING-genomgång;
grep "docs.offline" träffar endast protokolltexter + s7-sondernas egen kur).

## §1 Kontext (o143 §3:s sidofynd)

En direktstartad mät-Chrome (färsk /tmp-profil, UTAN `--disable-extensions`)
lastade systemtillägget **Google Docs Offline**
(`ghbmnnjooekpmoecnnnilnnbdlolhkhi`) vars `service_worker_bin_prod.js` åt
200–330 ms i longtask-attributionen. o143 kurerade sin sond med flaggan — men
frågan lämnades öppen för den KANONISKA mätvägen: `verktyg/prestanda-lighthouse.mjs`
→ `npx --yes lighthouse` → chrome-launcher. Om den vägen lastade tillägget
skulle spårets samtliga TBT-baser (o139-fore nattbas 375/582, o143-efter,
o144 EFTER ×5, o150-blocksonder — och o151-nattmätarens kommande dom) bära
~0,3 s systematik.

## §2 Metod — fyra pelare

| Pelare | Metod | Bevisvärde |
|---|---|---|
| A statisk | chrome-launcher 1.2.1-källan i npx-cachens lighthouse 13.5.0 | nödvändig ej tillräcklig — npx `--yes` är versionflytande |
| B process | ÄKTA kanonisk körning med IDENTISKA args som prestanda-lighthouse.mjs rad 43–50 (enda avvikelsen: `--output-path` tmpfil i stället för stdout — påverkar ej Chrome-starten); Chrome-cmdlines pollade ur /proc var 400 ms | huvudbeviset: exakta flaggor på huvudprocessen per user-data-dir-profil |
| C rapport | sök `chrome-extension://` + tilläggs-ID + SW-filnamn i producerad rapporthelhet | sekundär — tom rapport kan ej skilja "flaggan på" från "SW osynlig i rapport" |
| D kontroll | A/B rå Chrome enligt o143-metodik (CDP+tracing, CPU 4×, mobil 412×823, /dataset, 10 s): utan/med `--disable-extensions` | kausaliteten: tilläggsspår + longtask-attribution för/svinner med flaggan |

Sond: `verktyg/_s8u2o152-tillaggsbevis.mjs` (RAM-vakt ≥1 500 MB;
skalfria child-process-former; rapportskriv `data/vakten/_s8u2o152-tillaggsbevis.json`,
gitignorerad per konvention — nyckeltal nedan).

## §3 Resultat

- **A**: `chrome-launcher/dist/flags.js:36` — `'--disable-extensions'` ("Disable
  all chrome extensions") + `--disable-component-extensions-with-background-pages`
  i DEFAULT_FLAGS (lighthouse 13.5.0, cache:ad binär — npx löser samma: `npx
  --yes lighthouse --version` → 13.5.0).
- **B**: exit 0; 16 chrome-cmdlines i 4 profiler. Lighthouse-EGNA profilen
  `/tmp/lighthouse.mQ5Gqq5`: huvudprocess-cmdline (den med
  `--remote-debugging-port`) bär **`--disable-extensions`** samt
  `--disable-component-extensions-with-background-pages` bland chrome-launcher-
  defaults. (Parallella profiler = ett syskons funk-o144-verktyg — också rent.)
  Renderer/zygote-barn bär aldrig flaggan (de får `--type=*`) — dom måste
  föras per profil-huvudprocess, inte "samtliga processer".
- **C**: 0 träffar på samtliga tre monster i rapporten; kärnmått FCP 1 284 ·
  LCP 4 522 · TBT 643 · CLS 0 · poäng 0,68.
- **D**: utan flagga = **4 tilläggs-URL:er** i trace — Docs Offline
  (`…ghbmnnjooekpmoecnnnilnnbdlolhkhi/service_worker_bin_prod.js`) +
  **Chrome Web Store Payments** (`…nmmhkkegccagdldgiimedpiccmgmieda/craw_background.js`
  + `_generated_background_page.html`) + en component-SW
  (`…fignfifoniblkonapihmkfakmlgkbkcf/service_worker.js`) — och longtask med
  tilläggsattr: {dur 63 ms, blocking 13 ms, attr: [next-chunk, Docs-Offline-SW]}.
  Med flaggan = ENDAST component-SW:ns 1 spillrad, **0 longtasks** med
  tilläggsattr (tre oberoende körningar: longtask-attributionen utan flagga
  1/0/1 — den är timing-känslig; tilläggs-URL:erna 100 % reproducerbara 4/4/4).

## §4 Dom — INSTRUMENTET FRIAT

Den kanoniska mätvägen startar SIN Chrome med `--disable-extensions`:
**historiska kanoniska TBT-värden bär INTE Docs-Offline-systematiken.**
o143 §8:s ~0,3 s-systematik gällde endast karena rå-Chrome-starter (o143
kurerade redan sin sond). Berörda basrader: o139-fore (nattbas 375/582 —
o151-nattmätarens jämförelsebas), o143-efter, o144 EFTER ×5, o150-blocksonder
— alla kanoniskt mätta = alla rena. o151-nattmätaren (ropar prestanda-
lighthouse.mjs) mäter fortsatt rent.

## §5 Bonusfynd

1. **TVÅ systemtillägg, inte ett**: Web-Store-Payments
   (`nmmhkkegccagdldgiimedpiccmgmieda`) attribuerar i SAMMA longtask-klass som
   Docs Offline vid råstart utan flagga. All framtida kod som startar rå
   Chrome-mätare SKALL bära `--disable-extensions` (o143-sonden + o152-sonden
   gör det).
2. **Component-SW-spillet** (`fignfifoniblkonapihmkfakmlgkbkcf/service_worker.js`)
   överlever flaggan (1 trace-rad, 0 longtask-påverkan) — exakt den klass
   chrome-launchern avser med `--disable-component-extensions-with-background-pages`.

## §6 Konstruktörens egna fångster före grönt (o69-precedensen)

Sondens pelare-B-pollning var buggad i två versioner: (v1) matchade
`/google-chrome/` i args[0] — men binären EFTER wrapper-exec är
`/opt/google/chrome/chrome` (sökvägen saknar bindestrecket); (v2) delade
cmdline endast på NUL — men **Chrome 153 på denna server skriver
/proc/[pid]/cmdline som EN mellanslagseparerad sträng** (enda NUL:et på
slutet; ps visar densamma korrekt). v1/v2 gav 0 cmdlines → dom-formeln
"BELASTAT" var ett SONDFEL, inte ett instrumentfynd — upptäckt genom
diskrepansen mot pelare A + C innan någon kur av instrumentet gjordes på
felaktig grund. v3: dubbel split (NUL, sedan space om ett enda argument) +
dom per profil-huvudprocess. Även dom-aggregatet "samtliga processer"
korrigerades till huvudprocess-per-profil (renderer-barn bär aldrig flaggan).

## §7 Kur — explicit instrumentkontrakt (trots friande dom)

`verktyg/prestanda-lighthouse.mjs`: `--chrome-flags` utökas med
`--disable-extensions` + o152-refererande kommentar. Motivering: npx `--yes`
är versionflytande (cache-miss ⇒ senaste lighthouse); chrome-launchers
defaults är EJ något bibliotek API-löfte till oss — låser instrumentegenskapen
"tilläggsfri mät-Chrome" i det egna verktyget. Idempotent med dagens default =
**noll mätförändring** (samma flagga satt en gång till). o151-nattmätaren
ärver kontraktet via sitt rop.

## §8 Kö vidare

- o120:s /blogg kall-TBT-arkitekturpost (oförändrad öppen, ej denna vågs yta).
- o138 §6.1 ar-microjustering villkorad (vakarövertaget tillhör s7-u2:s linje).
- Chrome-153-cmdline-formen (space-avdelad /proc/cmdline) — värd notera i
  framtida processinspektionsverktyg (denna vågs lärdom, protokollförd här).
- Component-tillägget fignfifoniblkonapihmkfakmlgkbkcf:s identitet oklassad
  (inget mätpåverkansbevis; lämnas som dokumenterad observation).

## §9 KVD

`node --check` ×2 (sond + instrument) · mimosa-paritet GRÖN ×2 (sonden:
SSRF_LOOPBACK 1 träff klassad, 0 fynd; instrumentet: 0 fynd) ·
`node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (src/ orörd =
INGET bygge — prod-synken äger deployen) · R2 orörd (priser/tier/publicering)
· data/blogg/ orörd · syskonytor orörda (funk-o144-chromerna observerades
endast via /proc; deras filer orörda) · RAM-vakt respekterad (vägrade vid
1 446 MB, körde vid 2 910/3 852 MB).

LEVERANS: verktyg/_s8u2o152-tillaggsbevis.mjs, verktyg/prestanda-lighthouse.mjs,
data/forskning/OPTIMERING/o152-docs-offline-metrologi-s8.md (+ gitignorerad
bevisrapport data/vakten/_s8u2o152-tillaggsbevis.json kvar på disk).
