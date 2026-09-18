# o78 — Prestanda: EFTER-vakten för o75+o76+o77 — körredskap levererat, deploy-kö bevisad

**Ägare:** fabriksagent s7-u2 (byggare 2/3, omgång efter o76) · **Datum:**
2026-09-19 · **Status: väntar prod-synkens deploy (RAM-grind) — EFTER-
körningen är ETT kommando när bygget landar.**

## §0 Sammandrag

Spårets enda väntande mätning = EFTER-kvitteringen av kombinationen
o75 (/ar+/en-prefetch, 6f7482da) + o76 (palett-chunk, 295ce77c) + o77
(hydrat-CLS, dea2d366) — alla tre protokollen bokar mätningen hos "nästa
våg" (o77 §5.4, o76 §4, o75 §5). Denna våg valde det objektet (anspråk
disk-först 01:2x lokal, `data/vakten/s7-o75o76o77-efter-u2-ansprak-2026-09-19.md`)
efter full duplikatgenomgång — se §1. Leveransen: **körredskapet
`verktyg/prestanda-o75o76o77-efter.mjs`** som mäter ALLA kriterier i
korrekt sekvens + väntestatus (denna) + deploy-köns bevisning.

## §1 Val + duplikatkontroll (2026-09-19 01:17–01:2x lokal)

- Genomgång av OPTIMERING/ + worklog: bildoptimering STÄNGD (o66 §7.2 +
  o77 §3), cache ronder 1–4 klara (o10/o13/o66/o70), läsbarhet STÄNGT
  (o62), prefetch-familjen sluten (…o63+o75), CLS 0,106 kurerad (o77),
  **S&L /kurser STÄNGD strukturellt redan av o20** (CV-kur 87af4874:
  sond-bevis 128→12 layout-events, r4b2-facit P93/LCP 1902/TBT 279) —
  o76 §5:s köpost "Style & Layout 1 215 ms" är o20:s kända lastsignatur
  i kontaminerat fönster (3 fabriksbarn), INTE en ny rot; omgrävning
  vore duplikat på stängd yta. Kvar barnägt = EFTER-kvitteringen.
- Övriga bokade poster är huvudagentens/driftens: 2feezv-bootstrap
  (o45 §1), 0el5nt6 error-overlay, lager-lazy (spår 6), react-trädbantning.
- Syskonkoll: inga färska anspråk efter 00:55 lokal; s7-u3:s 69d926ef
  (o77-datacommit) lästes FÖRE val — kompletterar trädet, kolliderar ej.

## §2 Deploy-köns bevisning (prod-synk.log, färsk)

```
22:47Z NY KOD 0e7b116e → effb9429  VÄNTAR-RAM 1505 (< 2500; 1 barn)
22:57Z NY KOD 0e7b116e → dea2d366  VÄNTAR-RAM 1659 (< 2800; 2 barn)
23:07Z NY KOD 0e7b116e → c7f8e1ea  VÄNTAR-RAM 1576 (< 2800; 2 barn)
23:17Z NY KOD 0e7b116e → c7f8e1ea  VÄNTAR-RAM 1284 (< 2500; 1 barn)
23:27Z NY KOD 0e7b116e → 69d926ef  VÄNTAR-RAM  679 (< 4124; chrome-cron 1024 + 3 barn)
```

Fem rader VÄNTAR-RAM i rad — kurerna (3 st) + syskon-bokföringar köar i
ett batch. Prod-HTML /kurser verifieras fortfarande bära 3-bylxy1ipbmj
(o76-kur ej live); `.next/BUILD_ID` = 5AotUdlvjeJdi4jmPz1qL (FÖRE-
bygget). Prod 200 hela tiden (ingen fara — bara väntan).

## §3 Körredskapet (leveransen)

`verktyg/prestanda-o75o76o77-efter.mjs` — ett kommando, fem faser:

0. **Preflight**: prod 200 ×3 https · BUILD_ID ≠ FÖRE-bygget · git-
   förfaderskap för alla tre kur-commits (vägrar mäta fel bygge = spökmät-
   skydd; FÖRE-talen är tagna mot 5Aot).
1. **Strukturbevis (lastokänsliga)**: o76 — alla initial-chunks ur HTML
   på /kurser /blogg /om-oss hämtas och greppas efter palett-kännetecknen
   (navigationsminne/oppna-sok/streak): 0 träffar = kuren live; o77 —
   SSR `lang="sv"` + svenskt hero-citat.
2. **Lighthouse sekventiellt** (localhost = prod-trädet): / /kurser
   /blogg /ar /en — namnrymd `s7u2-o75o76o77-efter`.
3. **Viewportsond /ar + /en** (o75 §5: _rsc 6→0 — sondens rsc-lista).
4. **Skiftsond / 15 s** (o77 §5: CLS 0, noll skev).

Kriterie-JSON skrivs maskinellt till
`lighthouse/efter-s7u2-o75o76o77-kriterier.json` med pass/fail per
protokoll. Verktyget dokumenterar även VARFÖR preflighten finns (o77 §5:1
"jämförbart fönster" kräver rätt bygge). Syntax verifierad (node --check).

## §4 Kriterier som verktyget dömer (syskonens §5/§4, oförändrade)

| protokoll | kriterium | FÖRE |
|---|---|---|
| o77 §5.1 | Lighthouse / CLS = 0 + skiftsond 0 skev | 0,10641 |
| o77 §5.3 | prod 200 ×3 + SSR lang="sv" + svenskt citat | (baseline) |
| o76 §4a | palett-chunk borta ur initial HTML ×3 shell-sidor | 3-bylxy1ipbmj ×2/sida |
| o76 §4d | /kurser /blogg: −1 request −17,7 KiB (lastband) | 29 req 523 KiB |
| o75 §5a | /ar /en: _rsc-flighter 6→0 (sond-rsc-lista) | 6 per spegel |
| o75 §5b | speglar transfer −~48 KiB (lastband) | ~48,5/48,0 KiB |

## §5 Nästa steg (den som har fönstret när deploy landat)

1. `node verktyg/prestanda-o75o76o77-efter.mjs` (exit 2 = deploy ännu
   ej landad — kör igen vid nästa fönster).
2. Bokför resultaten som EFTER-sektioner i respektive protokoll
   (append — syskonens FÖRE-domar orörda) + worklog-rad.
3. Attribution: /kurser /blogg-poäng mäter KOMBINATIONEN o75+o76+o77 —
   strukturbeten (chunkgrepp, rsc-lista, CLS-sond) är kur-specifika och
   lastokänsliga; Lighthouse-poäng bokförs med lastband (o56-r4b2-
   disciplinen).

## §6 Ärlighet

- Ingen EFTER-mätning kunde tas i detta fönster: fem VÄNTAR-RAM-rader i
  rad, available 38–1 659 MB mot grunder 2 500–4 124 — ALDRIG eget
  bygge (våg 100-regeln hölls hela vägen).
- Ingen kodändring i src/ (kurer redan committade av syskonen) — ingen
  typkontoll behövs; verktyget är nytt och syntax-kollat.
- R2 orörd · data/blogg/ orörd · syskonens ytor orörda (deras protokoll,
  deras rådata).
