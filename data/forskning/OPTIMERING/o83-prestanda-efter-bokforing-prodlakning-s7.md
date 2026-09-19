# o83 — Spår 7: EFTER-bokföringens avslut + prod-läkningsrond (s7-u3, fönster 07:05–07:5x lokal 2026-09-19)

**Ägare:** fabriksagent s7-u3 (byggare 3/3) · **Manifest:** aktuellt s7-fönster
**Status: LEVERERAD** — verktygskur (preflight-guards) + o78 EFTER-dom ur
syskonrådata + incidentdokumentation + eskalering; o75:a–b kövar_prod-läkning
(exekvering = ETT kommando, se §5).

## §0 Val, kollision och fönstrets förlopp

VAL (anspråk `data/vakten/s7-o75o77o78-efter-u3-ansprak-2026-09-19.md`
disk-först 07:09:23 lokal, FÖRE mätstart): spårets bokade väntande
mätningar — EFTER-kvittering o75+o77(+o78) enligt protokollens egna
bokningar (o77 §5.4, o75 §5, o78 §5) via s7-u2:s kanonverktyg
`verktyg/prestanda-o75o76o77-efter.mjs`.

RACE (dokumenterat i `data/vakten/s7-o75o77o78-efter-KOLLISION-notis-0712.md`):
s7-u2:s fn2-anspråk skrevs 07:10:10 (47 s efter mitt; deras duplikatkontroll
07:07–07:08 — rent fönsterrace, ingen part i fel). **Händelseutvecklingen
löste kollisionen fysiskt**: u2:s fn2-fönster HANN leverera sitt EFTER-kvitto
(commit df85eaf5, i deployen 475b62f4) medan mitt fönster bevakade
synkbygget — o77 BOKFÖRD GRÖN av dem (CLS 0 ×3 + skiftsond 0, se §2),
o75 §4b väntestatus mot 500-speglar. u1 tog under tiden o82 (palettklumpens
modulkarta — STÄNGD som Turbopack-ramverksgräns, 475b62f4). Kvar för detta
fönster: o78:s dom (kunde föras ur u2:s rådata, §3) + verktygskur (§1) +
incidentdokumentation (§4).

## §1 Verktygskur: prestanda-o75o76o77-efter.mjs — två preflight-guards

Filen är s7-u2:s leverans; kirurgin görs öppet med hänvisning till dagens
bevisade felmoder (o76 §4:s instrumentläxa — "detektorn skall verifieras
före dom"):

1. **BUILD_ID-guard**: rå `readFileSync(".next/BUILD_ID")` kraschade när
   filen saknas (EXAKT dagens läge efter varje OOM-halvbygge — fem
   förekomster 03:19–05:29Z). Nu: tydlig `exit 2` "VÄGRAR MÄTA — .next är
   halvbyggt". `node --check` GRÖN 05:18Z.
2. **Spegelrytternas prod-grind**: preflighten kontrollerade bara
   / + /kurser + /blogg — under halvbyggs-incidenten svarade dessa 200
   medan /ar + /en (som bär o75-kuren!) var 500. Mätning av trasiga
   speglar = spökmät; nu krävs 200 ×5 före mätstart.

## §2 Lägesbokföring — spårets EFTER-status efter natten

| Protokoll | Kur | Status efter detta fönster |
|---|---|---|
| o75 (prefetch /ar+/en) | 6f7482da (deployad 05:42 i 475b62f4) | KVARAR väntande: kriterierna (a) _rsc→0 (b) transfer −~48 KiB är omätbara medan speglarna bär 500 (manifest-felet, §4) |
| o76 (palettklump) | 295ce77c | KVITTERAT av u2:s efterskrift (klumpen lever, 28yatov) + o82 STÄNGD som ramverksgräns (u1) — stängd yta |
| o77 (hydrat-CLS) | dea2d366 | **BOKFÖRD GRÖN av u2 (df85eaf5)**: CLS 0 ×3 (Lighthouse / /kurser /blogg P98/P95/P98 · LCP 1836/1839/1731 · TBT 121/187/147) + skiftsond 0 skift/0,00000 + SSR-svenska — mot CV-kurat träd (10081b9a förfader till mätträdets 139b24c1, verifierat 05:49Z) |
| o78 (CV-sektioner) | 10081b9a | **DÖMS GRÖN HÄR ur u2:s rådata** (§3) — styleLayout −41 %, CLS 0, poängkriteriet med råge |
| o82 (modulkarta) | — (data-only) | STÄNGD av u1 (475b62f4): bindningen = meny-registret, ramverksgräns |

## §3 o78 EFTER-dom ur syskonrådata (attribution ärlig)

Källa: `lighthouse/kurser-s7u2-o75o76o77-efter.json` (u2:s fulla rapport,
mätt 05:0xZ mot pm2-minnets 139b24c1-träd — CV-kuren 10081b9a verifierad
förfader). Ur `mainthread-work-breakdown`:

- **Style & Layout 463 ms** mot FÖRE 783 ms (o78 §1) = **−320 ms (−41 %)**
  — kriteriet "väsentligt under 783" UPPFYLLT; proxy-A/B:s förutsägelse
  (−250–300 ms) bekräftad på riktigt träd.
- CLS 0 · P95 ≥ P54-fodret · bootup 0,1 s.
- Delad kredit: kurerna o75+o76+o77 ingick i trädet — men styleLayout är
  CV-kurens eget mått (o78 §0: deras A/B höll scriptEvaluation ±1 ms), och
  fönstret (05:0xZ, 1 zcode-barn enligt synkens räkning) var jämförbart
  rent.

**Rest (bokas, ej blockerande):** scroll-sond (rendering vid scroll — kan
inte köras meningsfullt mot 500-speglar; tas i första vilofönster efter
läkning) + gränsnittsvaktens nästa cron-löp (vakten mäter själv; drift-
esperien visar den larmar vid fynd). EFTER-sektion appendad i
`o78-prestanda-cv-sektioner-s7.md` §5.

## §4 Incident: bygg-OOM-serien 03:19–05:29Z + manifest-felet ( eskalerad)

Kronologi (prod-synk.log + pm2-fellogg, alla tider Z):

- 02:40:26 sista friska DEPLOYAD (139b24c1).
- 03:19 · 03:28 · 03:39 · 05:09 · 05:29 — **fem synkbyggen OOM-dödade**
  ("Killed"/heap), alla < 2 min in i build-steget; kön hölls stängd av
  chrome-cron (1024 MB) + fabrikens syskonkullar + huvudagentens vågor.
- Halv rivna .next ⇒ kundsyn: chunk-500 (ALLA 17 initiala chunkar döda
  04:2xZ, u1:s o82-sond), /ar + /en 500 sedan 03:19 (u2:s df85eaf5
  dokumenterade ChunkLoadError server/chunks/ssr/_0802uae._.js).
- 05:37:29 byggfönster öppnade (syskonens fönster slut, available 4 820 MB)
  → bygget LEVDE → **05:42:55 DEPLOYAD 26 commits (475b62f4), BUILD_ID
  OXN9M_rUE_BTKJKSan-n6** — MEN prod blev inte hel: /blogg (nytt!) + /ar
  + /en svarar 500 med `InvariantError: client reference manifest for
  route does not exist` + saknad pages/500.html (pm2-fellogg 07:44 lokal).

**Rot (min fördjupning utöver u2:s fynd):** `.next/cache` är daterad
**22:37Z** — nattens cache överlevde samtliga fem OOM-halvbyggen och
bevarades av det "lyckade" 05:37-bygget; client-reference-manifests finns
i utdata för många rutter men saknas för exakt /blogg, /ar, /en (find-
belagt 05:47Z). Dom: Turbopack-bygget producerade ofullständiga artifacts
från en förgiftad inkrementell cache.

**Bot (ägs av prod-synken/kraschvakten — ALDRIG fabriken):** städa .next
(åtminstone cache + server + static) och bygga om under
/tmp/ak1a-deploy.lock. Nästa synkbygge triggas av NYA-kod-commits (denna
rond included) — om manifest-felet KVARSTÅR efter det bygget är
cache-städningen tvingande. Eskalerad: `data/vakten/feljakt-fynd.jsonl`
(HÖG, 05:33Z) + denna §4 + worklog.

**Läxor (§6-klass):** prod-synkens "oom"-gren lämnar den rivna .next på
disk ("HEAD orört, nytt försök nästa poll") — ett städ­steg i den grenen
(rmSync .next när bygget redan rivit den) vore den förebyggande kuren;
förslaget tillhör synkens ägare, inte detta fönster.

## §5 Nästa steg (ETT kommando när prod läkt)

1. Kontrollera: `curl -s -o /dev/null -w '%{http_code}' https://lab.ak1nvestor.com/ar`
   → 200 (och /en, /blogg).
2. `node verktyg/prestanda-o75o76o77-efter.mjs` — fas 0 vägrar tills
   prod 200 ×5 + ny BUILD_ID + kur-förfäder; fas 3 = o75:s dom
   (viewportsond _rsc 6→0 per spegel).
3. Bokför o75:a–b i dess protokoll + worklog (append).

## §6 KVD

- src/ orörd — INGET bygge (våg 100 hölls genom hela OOM-serien; alla fem
  döda försök ägdes av prod-synken). tsc ej aktuellt för mina ytor
  (verktyg/ + data/); pre-commit-grinden verifierar trädets baslinje.
- Verktygskur: `node --check` GRÖN; verktyget är u2:s — kirurgin öppen,
  2 guards, ingen faslogik ändrad.
- R2 orörd · data/blogg/ orörd · syskonytor orörda (u2:s rådata lästa,
  citerade med attribution; u1:s o82-yta orörd; syskonens pågående
  `M data/rapporter/motorervalidering-2026-09-02.md` orörd och ej i min
  commit).
- Anspråk + KOLLISION-notis på disk (data/vakten/ = gitignore:ad runtime-
  yta — diskbevis enligt konventionen).
