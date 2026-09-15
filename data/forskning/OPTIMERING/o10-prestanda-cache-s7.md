# O10 — Prestanda spår 7 våg 5: cache-headers + läsbarhetsluckor + mätbevis (s7-u2, rond 2)

Datum: 2026-09-15 · Ägare: studio/fabrik s7-u2 (manifest auto-s7-1789484706463).
**Kompletterar s7-u1:s rond 2 (commit 8850b7ca)** — denna våg valde objekt ur
o8 §4 + de ytor s7-u1:s rond-3-kö INTE täcker (kollisionsundvikande enligt
våg 104; s7-u1:s kö: /kurser-filter+paginering, quiz-knappar, kakbanner,
hero-länk).

## 1. Cache: /deep-courses.json 17,5 MB med max-age=0 (o8 §4 GUL → FIXAD I KOD)

**FÖRE (prod, curl 2026-09-15 ~17:10):**
`Cache-Control: public, max-age=0` + ETag · Content-Length 17 579 260 B.
Filen hämtas på klientens väg ENBAST som fallback när /sok-index.json (76 kB)
misslyckas (käll-loopen i `src/lib/sokindex.ts:84`) — men om fallet inträffar
omvalideras 17,5 MB vid VARJE hämtning (max-age=0 = direkt staleness).

**Fix:** `next.config.ts` → `headers()`-regel för `/deep-courses.json`:
`public, max-age=3600, stale-while-revalidate=86400` — samma hybrid som
sok-index.json (max-age=3600). Innehållet byts först vid kurs-deploys; en
timmes staleness i ett nödfalls-fallback-flöde är försvarbar.

**EFTER (väntar prod-synkens bygge):** `curl -sI
https://lab.ak1nvestor.com/deep-courses.json | grep -i cache-control` skall
svara `public, max-age=3600, stale-while-revalidate=86400`. Bokförs här av
nästa våg (mönstret från koddelnings-EFTER).

## 2. Cache: startsidans HTML årslås (o8 §4 GUL → FIXAD I KOD)

**FÖRE (prod):** `/` svarade `s-maxage=31536000` UTAN stale-while-revalidate
(latent: en framtida CDN skulle låsa HTML:en ett år).

**Fix:** `export const revalidate = 3600` i `src/app/(huvud)/page.tsx` —
exakt mönstret från /kurser (`force-static` + `revalidate` ger
`s-maxage=3600, stale-while-revalidate=31532400`). Statiskt innehåll, ingen
synbar förändring i dagens kedja (nginx = ren proxy utan delad cache).

**Kvar (bokas):** `/portfolj-forskning` har samma årslås men filen ägdes av
s7-u1:s pågående rond-2-arbete vid detta vågfönster → nästa våg lägger
`revalidate = 3600` där (en rad, `dynamic = "force-static"` finns redan).

## 3. Läsbarhet: två ytor utanför s7-u1:s kö (max-md, datorvy orörd)

| Fil | Vad |
|---|---|
| `sprak-vaxlare.tsx` | triggers knapp: höjden var 52 men BREDDEN 44 — rotorsaka nedan; kur `max-md:min-w-[52px]!` |
| `kunskaps-flode.tsx` | "Alla nyheter →" 42→52 (min-h) · nyhets-chips 30→52 (min-h + `py-[17px]!` — py-vägen bevarar truncate på grid-items; flex-display hade brutit ellipsen) |

**Rotorsaka (fynd för HELA spåret):** `globals.css` "MEGA MOBILE
OPTIMIZATION"-blocket (rad ~529) sätter `button, a[role="button"],
[data-touchable] { min-height: 44px; min-width: 44px }` under 640 px —
**olagrad CSS slår Tailwind v4:s @layer-utilities i kaskaden** (samma klass
av fynd som s7-u1:s `.text-[11px]`-override, nu på min-width-sidan:
beräknad stil = 44 px trots `max-md:min-w-[52px]` i CSS:en). Kur i enskilda
komponenter: `!`-suffix. **Beslut för huvudagent/styrelse (bokas):** höja
den globala baslinjen 44→52 (= husstandarden våg 93 C3) eller behåll 44 som
golv — global höjning rör många täta ytor (paginering, quiz-rader) och är
ett designbeslut, ej en barnagents kirurgi.

## 4. Mätbevis (fria fynd från vågens sonder)

1. **Prod-EFTER korsvaliderar s7-u1:s localhost-EFTER exakt**: min
   prod-mätning 15:2x (före rond 2-deploy) gav 38+55+9+10+45 = 157 på fem
   sidor + /portfolj-forskning 29 via separat mätning = **186 = s7-u1:s
   localhost-total** — två oberoende körcanaler, identiskt facit.
   Rådata: `lasbarhet-efter-rond1-prod-2026-09-15.json`.
2. **/portfolj-forskning mätbar via localhost** (42 interaktiva · 29 under
   52 · **0 zoomfällor** — rond 1:s korstabell-input-fix bevisad) — sidans
   CDP-timeout mot PROD är last-artefakt (två verktyg, tre försök), inte en
   sidregression. FÖRE-tabellens 33 → 29 redovisas i o8 §6.
3. **Klass-sond** (`lasbarhet-sond-klasser-2026-09-15.json`): DOM-vägar +
   klassnamn för alla fynd på //kurser/kurssidorna FÖRE rond 2 — facit för
   rond 3-kön (kakbanner-knappar `btn-marin px-3 py-2 text-xs`, filter-pills
   `rounded-full px-3 py-1.5 text-[11px]`, paginering `min-w-9 px-2.5`).

## Kö (ägarkanal)

| Objekt | Ägare |
|---|---|
| ~~portfolj-forskning `revalidate = 3600`~~ | **LEVERERAD s7 våg 6** (se §5) |
| Global 44→52-baslinje i globals.css (designbeslut) | huvudagent/styrelse |
| Brotli i nginx (−15–20 % kall load) | huvudagent/infra (o5 F3) |
| Språkresolvens-CLS (produktbeslut a/b/c) | huvudagent/styrelse (o5) |
| Läsbarhet rond 3 (filter/paginering/quiz/kakbanner/hero) | **LEVERERAD** (o8 §8, 3b2aab63 + kaskadkur 04303dd8) |

tsc 0. Ingen bygga — prod-synken äger deploy (flock-lås); EFTER-curl för §1–2
bokförs av nästa våg när bygget landat.

## 5. EFTER-verifiering + portfolj-forskning-fix (s7 våg 6, 2026-09-15 ~17:55)

**§1 EFTER — LIVE BEVISAD** (deploy 17:40:51, curl 17:48):
`/deep-courses.json` svarar nu
`Cache-Control: public, max-age=3600, stale-while-revalidate=86400` —
EXAKT målbilden. 17,5 MB nödfalls-fallback omvalderas som mest 1×/timme
i stället för vid varje hämtning. POSTEN STÄNGD.

**§2 EFTER — LIVE BEVISAD** (samma deploy, curl 17:48):
`/` svarar `s-maxage=31536000` → **`s-maxage=3600,
stale-while-revalidate=31532400`** — årslåset dött, /kurser-mönstret
reproducerat. POSTEN STÄNGD.

**§5 portfolj-forskning (köposten ovan) — FIXAD I KOD:**
FÖRE (prod, curl 17:48): `s-maxage=31536000` (årslås kvar). Fix =
`export const revalidate = 3600` i `src/app/(huvud)/portfolj-forskning/
page.tsx` (force-static + revalidate, /kurser-mönstret). **Leveransväg
(ärligt bokförd):** raden skrevs av denna våg men sveptes med i
syskonsamlingen 04303dd8 (17:49:52, `git add`-kollision mellan aktiva
fabriksbarn — samma driftfyndklass som o8 rond 3:s trädrevning);
innehållet verifierat i committen (3 rader: 2 kommentars- + 1 exportrad),
tsc 0 körd av denna våg. EFTER-curl bokförs nedan när 04303dd8-bygget
landat (prod-synk poll :x7).

**EFTER §5:** (bokas när bygget landat)

