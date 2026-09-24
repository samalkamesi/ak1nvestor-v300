# o160 — Spår 7 prestandavåg: struktur- och CLS-EFTER-kvittering av deployen 09:41:47Z (41 commits, a2c9d663) (s7-u3, 2026-09-24)

Fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1790249713381).
Uppgift: "mät före/efter (Lighthouse), deploy, prod 200, mätning bokförd".

## §0 Nummerkontroll + kollision, ärligt bokförd

- Reservation gjordes först som **o159** (pool-ts 1790250148606,
  13:42:28 lokal) — men syskonet **s7-u2 reserverade o159 15 sekunder
  tidigare** (1790250133691, "bolagsfamiljens jungfrumark") och deras
  FÖRE-mätning låg redan på disk (o159-fore-*, 13:44:34). Enligt
  klaim-mtime-precedensen (o151 §0, o154→o155-viket) viks o159 till u2:
  mätfiler omdöpta o159-efter→o160-efter, poolposter korade
  (u3:o159 = "viket-till-s7-u2", u3:o160 = reserverat), u2:s namnrymd hel.
- Högsta lediga nummer i OPTIMERING vid omtag: o157 + u1:o158 (reserverat)
  + u2:o159 (reserverat) ⇒ **o160** är detta protokoll. Katalog-ren efter
  omdöp (0 o160-filer före).

## §1 Val (duplikatkontroll klar)

Spårets levererade ytor: bildoptimering o66 §7.2/o101 · cache-headers
o10/o13/o66/o70 · koddelning o27/o119/o121 · 52px o8×4+o123 ·
slug-prefetch o41 · login-prefetch o49 · /kurser-flight o45 ·
CV/CLS-familjen o18+o20+o28+o96+o100-o105+o129+o150 · dataset-CLS
o143+o144 · cv-widget o139+o144 · natt-TBT o151+o155.

Den här omgångens fördelning (anspråk på disk före mitt val):
- **u1:o158** — EFTER-vaktens anomali-dom bokförd + mätarkedjans 2b-slutprob
  (TBT-tolkningen av natt-domen = deras yta; kalkylator-kuren kräver äkta
  RÖD-dom och väntar).
- **u2:o159** — bolagsfamiljens första baslinje (/data/nyckeltalsguide,
  /bolag, /bolag/[slug]).
- **Mitt objekt** = spårets kärnloop mot dagens driftläge: prod-synken
  deployade 09:41:47Z **41 commits (a2c9d663) — första grönbygget efter
  nattens/morgonens OOM-dödade byggkedja** (prod-synk.log r2861: tidigare
  ARTEFAKT TRASIG 06:14Z r2811). Deploymenten bär src-ändringar som
  ALDRIG prestandamätts: v160-branding (SektionsCta ×8 verktygssidor,
  SocialProof ×3, hero-tokens, H1/eyebrow), v161 + s6:s AI-mentor-widget-
  wiring (fyra slutstensmoduler i src/lib). Fråga: växte klient-payload/
  requests, och höll CLS 0-kontrakten (o139/o143/o144-kurerna) i nya trädet?

## §2 FÖRE (lastokänsliga strukturtal, 150e1cde-bygget)

Källa: natt-domens egna fulla Lighthouse-rapporter (o155-efter-vakten,
instrument = verktyg/prestanda-lighthouse.mjs, mobil, o152-kontraktet):

| Sida        | Requests | totalByteWeight | CLS | (CPU-tal, laststämplade: P/LCP/TBT) |
|-------------|----------|-----------------|-----|--------------------------------------|
| /superanalys | 31      | 494 110 B       | 0   | P38 / 7007 / 7508                    |
| /kalkylator  | 35      | 580 675 B       | 0   | P35 / 8291 / 16413                   |

## §3 EFTER (a2c9d663, dagens prod) — körning 14:0x lokal

- prod 200 ×4 före mätning (superanalys/kalkylator/konfluens/kurser,
  loopback). RAM-vakt: available 1 814 MB > fabrikens 1 500-tak;
  mätning sekventiell, en Chrome i taget.
- Instrument: oförändrade kanoniska verktyget. Utfiler i egen namnrymd:
  `{superanalys,kalkylator,konfluens,kurser}-o160-efter.json` +
  `o160-efter-sammanfattning.json`.

| Sida        | Requests | totalByteWeight | CLS | Δreq | ΔB       | (CPU-tal, laststämplade: P/LCP/TBT) |
|-------------|----------|-----------------|-----|------|----------|--------------------------------------|
| /superanalys | 30      | 495 087 B       | 0   | −1   | +977 B   | P68 / 2261 / 2914                    |
| /kalkylator  | 34      | 582 161 B       | 0   | −1   | +1 486 B | P48 / 5037 / 6425                    |
| /konfluens   | 30      | 497 721 B       | 0   | —    | —        | P51 / 5145 / 3540                    |
| /kurser      | 30      | 534 342 B       | 0   | —    | —        | P53 / 4585 / 3095                    |

(konfluens/kurser: jungfrulika strukturvärden i denna namnrymd — båda
bär v160:s nya SektionsCta och kurser bär kursrute-/AI-mentor-ytorna.)

## §4 DOM: GRÖN — 41 commits växte mätytorna med <+0,3 %

- **CLS 0 ×4** — o139:s cv-widget-kurer, o143:s dataset-CLS-kur och
  o144:s slutfacit håller i a2c9d663-trädet; SektionsCta ×8 + SocialProof
  orsakade inget layoutskift på mätytorna.
- **ΔB +977/+1 486 B (+0,20/+0,26 %)** på referensparet = brusnivå;
  requests NETTO −1 på båda (se §5: hash-churn, ej resursförsvinnande).
- Konklusiv: **v160+v161+s6:s 41 committers src-ändringar nådde INTE
  verktygssidornas klientbundel i mätbar grad.**

## §5 Rotbelägg

1. **Chunk-identitet genom tre deployer:** widget-huvudchunken
   `2feezv-iveko5.js` (72 010 B transfer) har IDENTISK filhash i
   natt-FÖRE (150e1cde) och EFTER (a2c9d663) — samma observation som
   o155 gjorde bas↔150e1cde. Verktygssidornas tunga JS är oberört av
   brandingsvepet; s6:s fyra AI-mentor-moduler lever registerdrivet vid
   svarstid (server/API) precis som designat — de syns ENDAST som
   (obefintlig) transfer-tillväxt.
2. **Δreq = hash-churn, ej resursförsvinnande:** superanalys 4 gamla
   chunks ut / 4 nya in (1f6n0qypnpak4.css, 33b6z3…, 3zydnwhk2kx9i,
   03fj1y69j3s59 → 2i19jhnlgvpnf.css, 2nmoorvuwokzu, 2vv1bt98c6u0g,
   1uuq3ae405nad); kalkylator 5 ut / 5 in — normal byggomhashning, ingen
   begäran tillkom per SektionsCta/CTA-block.
3. **Top-JS oförändrad volymordning** (72,0 kB / 48,9 kB / 43,2 kB) på
   båda referensytorna.

## §6 CPU-talen — referens, ALDRIG dom (metrologiregeln o143 §3)

Dagtids-EFTERns P48–P68 / LCP 2261–5145 / TBT 2914–6425 mättes under
pågående drift (fabriksomgång + sessioner) och jämförs INTE mot
natt-talen som dom. Noteras som FAKTA (tolkningsägarskap: u1:o158):
nattens P35–38 med TBT 7 508–16 413 uppstod på ~identisk JS-volym och
samma chunk-hash som dagens P48–68 — ytterligare ett oberoende stöd
för att natt-domens extrema TBT bär last/miljö-artefakt, ej kod.

## §7 Kö vidare

- **b186317c väntar deploy** (prod-synk 11:27/11:37 NY KOD) — nästa
  EFTER-kvittering av samma strukturmetod när den landat; särskilt om
  den bär fler src-ändringar.
- u1:o158:s 2b-slutprob + nästa dombara nattfönster (cron 03:27) äger
  TBT-frågans slutdom; kalkylator-kuren (o139 §8.4) förblir låst tills
  ÄKTA RÖD-dom i tyst fönster.
- u2:s bolagsfamilje-baslinjer (o159) — deras EFTER när deras våg kör.

## §8 KVD

- src/ orörd ⇒ INGET bygge (prod-synken äger; ALDRIG npm ci/build).
- tsc: src orörd — baslinjen bärs av pre-commit-grinden.
- R2 orörd (priser/tier/publicering). data/blogg/ (live) orörd —
  utkastregeln ej aktuell (data-leverans till OPTIMERING/lighthouse).
- Syskonytor orörda: u1:s o158-ytor (natt-mätaren, dom-bokföring) bara
  lästa; u2:s o159-fore-filer orörda, deras namnrymd återlämnad HEL.
- Instrumentet (prestanda-lighthouse.mjs) kört, ej ändrat.
- Mätning mot loopback (middleware-whitelistat), prod 200 ×4 före mätning.

## Verktyg och rådata

- Kanoniska: verktyg/prestanda-lighthouse.mjs (oförändrat).
- Rådata: data/forskning/OPTIMERING/lighthouse/{superanalys,kalkylator,
  konfluens,kurser}-o160-efter.json + o160-efter-sammanfattning.json;
  FÖRE-källa: {superanalys,kalkylator}-o155-efter-vakt.json (u2:s
  natt-vakt, läst som källa med attribution).
- Anspråk: data/vakten/auto-s7-1790249713381-s7-u3-ansprak.md (disk-först,
  nummerbytet kronologiskt dokumenterat där och i §0).
