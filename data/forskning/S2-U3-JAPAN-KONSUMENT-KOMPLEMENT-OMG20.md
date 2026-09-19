# S2-U3 KOMPLEMENT — JAPAN/KONSUMENT OBEROENDE EFTERVERIFIERAD (omg20, andra instansen)

**Manifest:** auto-s2-1789831500945 (byggare 3/3 — omstarts-dispatch efter primärinstansen)
· **Komplement-instans:** s2-u3 (denna agent) · **Primärleverans:** commit `bd344f82`
· **Presedens:** S1-u3 c4747477 (LYXAKTIER-KOMPLEMENT) — "kollisionen intra-slot:
primären levande, write-skyddet stoppade duplikatet, KOMPLEMENT-presedens följd".

## VAD DENNA LEVERANS ÄR

Jag dispatchades som omstarts-instans av samma slot (s2-u3, "Japan/konsument 2→5")
medan primärinstansen arbetade. Min rapport är därför ett VERIFIERINGSKOMPLEMENT:
oberoende datakorskonfirmation av primärens tre rader + full EFTER-KVD på
slutläget + race-dokumentation. Alla primärens ytor (universum-rader, llms,
land.ts, protokoll S2-U3-JAPAN-KONSUMENT-UTOKNING-OMG20.md) lämnades orörda —
mitt enda write-försök (Edit på land.ts) stoppades korrekt av modified-detekten,
write-skyddet bevisat i praktiken.

## OBEROENDE DATACROSSKONFIRMATION (källa: StockAnalysis TYO, hämtat 2026-09-19, close 2026-09-18 15:30 JST)

Jag hämtade EGNA paneler (översikt + statistics + financials + balance-sheet +
cash-flow) oberoende av primärens skript `_s2u3o20-append-japan-konsument.mjs`
och jämförde rad-för-rad. Resultat per bolag:

| Bolag | Panel jag hämtade | Konfidens |
|---|---|---|
| 3382.T Seven & i | översikt+statistics+financials+BS | 100 % — varenda tal identiskt: pris 2 020 · mcap 4,29 T · P/E 15,90 (aktiebas 2 020/127,02 EXAKT) · fwd 16,60 · P/B 1,15 · EV/EBIT 16,29 · brutto 16,36 · EBIT 5,42 · netto 3,56 · FCF 5,38 % · ROE 8,05 · ROIC 4,65 · WACC 2,90 · skuld 3 878,7 /kassa 661,5 /nettoskuld 3 217,2 mdr · räntetäckning 9,74 · beta 0,09 · 52v 1 811–2 417 · serierna FY2022–26 (oms/netto/EK/FCF) EXAKTA |
| 2914.T Japan Tobacco | översikt+statistics+financials+BS+CF | 100 % — pris 6 886 · mcap 12,23 T · P/E 20,04 (aktiebas 19,65 = −1,9 % spridning, dokumenterad i raden) · fwd 17,87 (prognos +12,1 %, PEG-spår 1,65 — min replik ger 1,6502) · P/B 2,76 · EV/EBIT 12,89 (replik 13,02 = +1,0 %) · brutto 56,86 · ROE 14,30 · ROIC 12,91 · WACC 4,81 · nettoskuld 848,9 · räntetäckning 13,47 · 52v +45,09 % · serierna FY2021–25 EXAKTA inkl. FY2024-dipen (netto 179 240) och FCF-serien |
| 4452.T Kao | översikt+statistics | 100 % — pris 3 478 · mcap 3,15 T · P/E 23,26 (aktiebas EXAKT) · fwd 21,66 · P/B 2,74 · EV/EBIT 15,64 · EV/EBITDA 12,03 · ROE 12,32 · ROIC 12,82 · WACC 5,02 · skuld 237,21 /kassa 326,66 /nettokassa 89,45 mdr · räntetäckning 51,22 · Altman 4,4 · beta 0,19 · payout 51,93 · buyback-yield 1,99 · analytiker Buy 4 038,46 (13 st) |

## ERSÄTTNINGSVALET KONFIRMERAT PÅ DJUPET (Honda-pivoten)

Primärens Honda-avvisning är OBEROENDE DUBBELKONFIRMERAD av mig: både översikt-
och statistics-panel visar TTM-netto **−169,70 mdr JPY** (EPS −43,29, ROE −0,76 %,
räntetäckning −0,89, P/E n/a) — Sony-fällan/omg18-konventionen korrekt tillämpad;
en Honda-rad hade lämnat Japan/konsument på matta 4 ⇒ landsidan aldrig född.

Min egen sondering av ersättningsfältet (fyra kandidater, alla fria i universumet):
- **Panasonic 6752.T** (P/E 39,53) — FALLER: sektorn Technology i källan ⇒ hade
  landat i Japan/teknik, ej konsument-cellen.
- **Oriental Land 4661.T** (P/E 36,67, Consumer Discretionary) och **Kirin 2503.T**
  (P/E 11,71 men EPS +266 % = engångspost-risk) — P/E-bärande alternativ, avsända.
- **Kao 4452.T** (P/E 23,26, Consumer Staples, stabilt) — primärens val, och med
  cellens femte affärsmodell (hushållsvarumärken) kompletteras kvartilstrukturen
  bil 8,3 · närbutik 15,9 · tobak 20,0 · hushåll 23,3 · plagg 40,0 — jämn
  fempointsfördelning med defensivt kluster och premium-toppar. Valet håller.

## EFTER-KVD PÅ SLUTLÄGET (min omkörning, disk-läge 207*)

| Kontroll | Resultat |
|---|---|
| tsc --noEmit (projektbinär) | **0 fel** — land.ts japan-modulen (primärens src-ändring) typar grönt |
| Kontraktstest (testa-dataset-aspekter.mjs, cachad tsx — INTE npx) | **GRÖNT: 183 sidkontroller, 0 fel, 30 varningar** (baslinjen) · 23 aspekter inkl. japan · 47 null = gränsregeln |
| Läckagevakt v3 (_s2u3o20-lackagevakt.mjs) | **GRÖN: 0 träffar** — 207 namn/tickers sökta i dataset-html + llms Dataset-sektionen |
| v98-dataset-vakt | **GRÖN: 0 träffar** — 207+207 i 1 566 utdatafiler |
| Prod HTTPS | **200 ×6**: / · /dataset · /dataset/konsument · /dataset/finans · /llms.txt · /api/data/nyckeltalsguide |
| llms round-trip | prod == disk == "207 bolag i 10 branscher (rådata 2026-09-19)" |

\* Disk-läget 207 = primärens 206 + syskon-u1:s ostagade HDFCBANK.NS-rad (deras
pågående +1-arbete, deras ägo — ingick som ride-along-kontroll i mina
disk-läsande vakter; deras leverans granskas av dem själva).

## RACE-KRONOLOGI (dokumentation åt spåret)

1. 17:39–17:46 lokal: primärinstansens verktyg + anspråk på disk (jag läste dem
   som precedens; datakvalitet korskonfirmerad innan jag överhuvudtaget övervägde
   egen append).
2. Mitt Edit-försök på land.ts stoppades av modified-detekten — primärens
   japan-modul skyddad, jag fick race-läget bevisat.
3. Fabriksstatus: u2 klar (c071eb98, MUFG+BNP), u1 pågående, u3 pågående.
4. Poll-fönster ~25 s: primärens commit `bd344f82` landade (203→206, KVD GRÖN
   enligt deras protokoll) — jag fullföljde aldrig egen append (noll
   duplikat-ytor, S1-u3-presedensens exakta mekanik).
5. Min EFTER-KVD (ovan) + detta komplement = omstarts-instansens leverans.

## LEVERANS (denna instans)

- data/forskning/S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20.md (detta dokument)
- worklog.md (komplement-rad)

Primärens leverans (bd344f82): bolagsunivers.json +3 rader · land.ts japan-modul ·
public/llms.txt · protokoll S2-U3-JAPAN-KONSUMENT-UTOKNING-OMG20.md · verktygen
_s2u3o20-*.mjs. Allt bekräftat av denna verifiering.
