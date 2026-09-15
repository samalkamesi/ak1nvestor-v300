# S2-U1 — Omsättningstillväxt TTM per bransch (dataset-djup, spår 2)

**Uppgift:** Utöka /dataset nästa i spåret — kvartiler + universumjämförelse,
läckagevakt 0, prod 200. Valt objekt: nytt nyckeltal (faktisk tillväxt TTM)
i stället för nya bolagsrader — syskonen tog bolagsutökningen (energi +3,
universum 100 → 103) och jämförelsehubbarna.

## Leverans

Ny aspektmodul `omsattningstillvaxt-ttm` — 10 nya Dataset-JSON-LD-sidor
(`/dataset/<bransch>/omsattningstillvaxt-ttm`, alla 10 branscher över
gränsregeln: n=10, energi n=13 efter syskonets utökning):

- Median + kvartiler P25/P75 + min/max enligt kontraktets `sammanfatta`
  (samma percentilkonvention som branschmedianerna — korscheckad mot
  oberoende räkning i KVD).
- Universumjämförelse via s2-u2:s kontraktsfält `universum`
  (`sammanfattaUniversum`) + ingressens "högre/lägre än universumets median
  6,8 %" — vyn renderar blocket med avvikelsetext.
- Pedagogiken: TTM = faktum, mot `prognos-tillvaxt` (förväntan) och
  `omsattning-cagr-5ar` (femårsmedel) — spegeln faktum/medel/förväntan.
- sitemap + generateStaticParams: automatiskt via registret (exakt 10 nya
  URL:er verifierade).
- llms.txt: 10 nya rader i datasetsektionen (median + kvartiler + n +
  universummedian, genererade programmatiskt ur rådatan).

## Filer

| Fil | Ändring |
|---|---|
| `src/lib/dataset-aspekter/omsattning-tillvaxt-ttm.ts` | NY modul (exklusivt ägd) |
| `src/lib/dataset-aspekter-kontrakt.ts` | +1 fält i AspektUniversumRad (omsattningTillvaxtTTM) |
| `src/lib/dataset-aspekter/index.ts` | registrering (17→module, syskonens räknade 19 totalt) |
| `public/llms.txt` | 10 nya datasetrader |

Not: kodbasen är ett delat träd under fabrikens omgång — s2-u2:s commit
24c1d61b svepte med detta uppdragets filer (tsc-grönt koherent träd);
denna anteckning är uppdragets egna kvitto-commit.

## KVD (bevis, 2026-09-15)

- KVD-skript (`.tmp/s2-u1-kvd-ttm.ts`): 10 sidor, kvartil-logik
  min ≤ P25 ≤ median ≤ P75 ≤ max, median/P25/P75 = oberoende räkning,
  universumfält matta/antalBolag/median korrekta, strukturgränser
  (beskrivning ≤ 160, listlängder), **läckagevakt 0** (0 bolagsnamn/tickers
  — skiftlägeskänsliga ordgränser, 0 AKM-fält, 0 rådord), registret exakt
  10 TTM-URL:er. GRÖN.
- `npx tsc --noEmit` = 0 fel (hela trädet).
- Sidvärden per bransch: teknik 11,5 % · industri 11,6 % · hälsa 5,5 % ·
  konsument 1,2 % · fastighet 5,8 % · finans 4,1 % · material 3,8 % ·
  energi 15,4 % · kommunikation 3,5 % · tillväxt 46,8 % (universum 6,8 %).

## Drift

Sidorna är SSG (dynamicParams=false) — de 10 URL:erna publiceras vid
nästa prod-bygge (prod-synken/kraschvakten äger byggena; fabriksbarn
bygger aldrig). Rådata läsbar från disk: `hamtat`-raden visar 2026-09-15
efter energi-utökningen.
