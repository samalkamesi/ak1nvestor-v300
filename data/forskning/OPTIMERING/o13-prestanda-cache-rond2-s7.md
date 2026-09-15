# O13 — Prestanda spår 7: cache-header-granskning ROND 2 (s7-u3, 2026-09-15)

**Ägare:** studio/fabrik s7-u3 · **Status:** KOD LEVERERAD (b77699ba), EFTER bokförs nedan.

## Uppdrag och urval (duplikatkontroll gjord före start)

Spårets kontext räknar upp "bildoptimering, koddelning, cache-header-granskning,
mobil läsbarhet". Läge efter worklog + protokollgenomgång (o5, o8, o10):

- bildoptimering AVKLARAT (o5 F5), koddelning SLUTBEHANDLAT (o5), läsbarhet
  rond 1-3 LEVERERADE (o8), cache-GUL: o10 våg 6 deklarerade "spårets sista
  post stängd" — men den karteringen var endast 4 vägar bred.

**VALET: cache-header-granskning rond 2 — HELA den publika ytan.** Ingen
annan fabrikens våg har bokat detta (syskonfönstret pågår i komponenterna
för läsbarhet rond 4).

## FÖRE — komplett prod-kartering (HEAD-sond, 2026-09-15 ~21:00)

56 vägar mätta (o10:s 4 + 52 nya). Resultat per grupp:

| Cache-Control-profil | Antal | Vägar (urval) | Dom |
|---|---|---|---|
| **s-maxage=31536000 (ÅRSLÅS, swr saknas)** | **30** | se nedan | latent: framtida CDN låser HTML år |
| s-maxage=3600 + swr (GRÖNT mönster) | 8 | /, /kurser, /kurser/[slug], /portfolj-forskning, /en/blogg, /en/kurser, /ar/blogg, /ar/kurser | ✓ |
| s-maxage=86400 + swr | 4 | /dataset, /dataset/finans, /en/dataset, /bolag/nda-se-st | dagsdata — RÄTT |
| s-maxage=300 + swr | 7 | /fas2-ansok, /medlemskap, /prenumeration, /villkor, /portfolj-grund/hyra/plus | produkter — medvetet kort |
| no-cache | 6 | /profil, /min-portfolj, /logga-in, /certifikat, /dagens-pass, /laroplan | personligt/dagligt — RÄTT |
| 404 | 1 | /data | korrekt |

**Nyckelfynd:** kuren (revalidate i page.tsx) fanns REDAN i speglarna
/en/blogg + /en/kurser — men applicerades aldrig på (huvud)-originaLEN.
Svenska /blogg bar årslås medan /en/blogg var grön: mönstret var
ojämnt applicerat över språkgrupperna.

**Årslås-listan (30):** /analyser /ansvar /bibliotek /blogg /blogg/[slug]
/cookiepolicy /fas3 /finansiell-policy /forskningsbiblioteket /kalkylator
/kallor /konfluens /labb /manifest /min-sida /netnet /nyheter /om-oss
/portfoljbyggare /privacy-policy /pro /rapporter /studio /superanalys
/topplista /transparens /upphovsratt /vagfundament /en /ar

Rådata: `cache-arslas-fore-2026-09-15.json` (samma mapp).

## KUR — 29 rutter (commit b77699ba)

| Grupp | Värde | Vägar |
|---|---|---|
| Innehåll (26) | `revalidate = 3600` | /analyser /ansvar /bibliotek /blogg /blogg/[slug] /cookiepolicy /finansiell-policy /forskningsbiblioteket /kalkylator /kallor /konfluens /labb /min-sida /netnet /nyheter /om-oss /portfoljbyggare /privacy-policy /rapporter /superanalys /topplista /transparens /upphovsratt /vagfundament /en /ar |
| Pris-SSR (3) | `revalidate = 300` | /fas3 (PRISER.fas3EnGang), /pro (PRISER.b2bAnalytiker), /manifest (PRISER) |

- Pris-KLASSIFICERINGSPRINCIP (spårets nya): sidor som SSR:ar PRISER-objektet
  följer produktfamiljens medvetna 300-spår (/fas2-ansok, /medlemskap,
  /prenumeration, /villkor) — vid framtida prisändring (kundens R2-beslut +
  deploy) kan en CDN som mest servera 5 min gammalt pris, aldrig timmar.
- /min-sida: lasPriser() men dashboard-kontext → 3600 enligt
  /portfolj-forskning-precedensen (våg 6, samma lasPriser-mönster).
- Mönster: filer med force-static fick revalidate-rad under; filer utan
  (bibliotek, cookiepolicy, om-oss, privacy-policy, topplista, vagfundament,
  min-sida) fick revalidate utanpå (statisk default + revalidate = ISR).
- R2 orörd: INGA prisvärden ändras — enbart HTTP-cache-huvud; inga ytor i
  stopplistan rörda.

## BOKAS (ej kur-bar av barnagent)

| Objekt | Ägare | Orsak |
|---|---|---|
| /studio årslås | huvudagent | page.tsx är "use client" — route-segment-config stöds ej i klientkomponenter; kur = server-wrapper-kirugi på kundens chatt-yta |

## Kvarstående övriga spårs-köobjekt (oförändrade)

Brotli i nginx (huvudagent/infra, o5 F3) · språkresolvens-CLS a/b/c
(huvudagent/styrelse, o5) · global 44→52-baslinje (huvudagent/styrelse, o10).

## Verktyg

`verktyg/cache-sond.mjs` — HEAD-sond med grupperad utdata. Driftläxa:
6 parallella HEAD triggar prodens rate-limit (429) — sonden kör sekventiellt
med 900 ms mellanrum + 3 omförsök (backoff 4/8 s). Omkörningsläge för
enstaka vägar som tredje argument.

## EFTER — LIVE BEVISAD (2026-09-15, deploy efter 21:07-pollen)

Väntare (node, 45 s-intervall) detekterade live: `/analyser` svarar
`s-maxage=3600, stale-while-revalidate=31532400`. Full EFTER-sond (55 vägar):

| Mått | FÖRE | EFTER |
|---|---|---|
| Årslås (s-maxage=31536000) | **30** | **1** (endast /studio — bokat ovan) |
| GRÖNA 3600+swr | 8 | 34 |
| 300-familjen (produkter/priser) | 7 | 10 (+fas3, pro, manifest) |

Stickprov ur EFTER (HTTP 200 samtliga): /fas3 /pro /manifest =
`s-maxage=300, swr=31535700` ✓ · /blogg /en /ar = `s-maxage=3600,
swr=31532400` ✓ · / = 3600 ✓ (oförändrad) · /studio = årslås kvar (bokat).
Prod `curl /` = 200. Rådata: `cache-arslas-efter-2026-09-15.json`.

**Ärligt driftfynd (bokas till huvudagent):** prod-synkens logg slutar
skriva efter 21:07:09 "VÄNTAR-RAM" — ingen DEPLOYAD-rad trots att bygget
bevisligen landat (väntare + EFTER-sond + curl vid 21:1x–23:11, prod 200).
Deployen skedde alltså via en kanal som inte loggade, ELLER loggrader
förlorades. Beteendebeviset står fast (rond 36-lärdomen: beviset slutar i
prod-beteende, ej loggrad); loggtystnaden 21:07→23:11 med minst en deploy
i intervallet = observationspliktig anomali. Ägarskap: huvudagent/drift
(prod-synk.mjs + daemonstatus — ej barnagents yta).

POSTEN STÄNGD: spårets cache-karta är NU faktiskt komplett — 0 kur-bara
årslås kvar. Kvar i spårets kö (oförändrat): brotli (infra), språkresolvens-
CLS (produktbeslut), global 44→52 (designbeslut), /studio-wrapper (kirurgi).

