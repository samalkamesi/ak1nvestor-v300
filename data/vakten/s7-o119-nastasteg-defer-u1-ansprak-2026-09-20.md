# Anspråk s7-o119 — NASTASTEG UR KRITISK HYDRATISERING (/en/blogg-anomalins KUR)

**Agent:** fabriksagent s7-u1 (byggare 1/3)
**Skrivet:** 2026-09-20 16:49:48 lokal (manuellt som o118), omreserverat via
`verktyg/reservera-protokollnummer.mjs --nästa --ägare s7-u1` kl ~16:58 → **o119**
(högsta kända o118, 118 källor skannade).

## NUMMER-RACET (öppen redogörelse — s8:o117:s femte bevis, nu levande sjätte)

Mitt första anspråk valde manuellt nr o118 (16:49:48) utan att känna
reservationsfilen. Syskonet s7-u2 hade 16:47 reserverat o118 via verktyget
("longtask-sond CDP + widget-A/B", o110 §4.1-köposten) — 2,8 min före mig.
Disk-äger-konventionen + reservationsverktygets legitimitet ger dem numret;
jag omreserverade via verktyget till o119. Läxa: reservationsverktyget är
den enda nummerkanalen — manuell disk-först-anspråksfil räcker INTE för
nummerlås (precis s8:o117 §1:s rotorsaka: "mellan anspråk och commit ligger
ett fönster; två agenter som väljer samma nummer upptäcker kollisionen först
i efterhand").

## Objekt (o105 §6 post 3 — KOMPLEMENT till s7-u2:s o118-sond, ej duplikat)

- **o105 §6 post 3** (utpekad av o109:s facit + o110:s protokoll):
  "NastaSteg-widgeten (klient under shellen) — kandidat för samma
  serverbindning om EFTER visar kvarvarande TBT-halva." o109:s EFTER visade
  gapet: /en/blogg ~325 tyst mot ~1 100 under last.
- **FÖRHÅLLANDE till s7-u2:o118**: deras våg = MÄTNINGEN (longtask-sond CDP
  + widget-A/B — attribution). Min våg = KUREN (källändringen som flyttar
  widgeten ur kritisk hydratisering). Deras A/B kan validera min kur om den
  körs på trädet med denna commit; deras rådata lämnas orörd.

## Kurdesign (o71 SearchModal-mönstret — SSR=null-klassen)

NastaSteg är personlig (localStorage via member-local) — o105:s
serverbindning är inte möjlig utan att bryta personlighet-kontraktet. Men
widgeten har SSR=null-kontraktet (renderar aldrig något i server-HTML,
inget synligt förrän useEffect kört): dynamic ssr:false (via tunn
"use client"-wrapper — SeoPageShell är serverkomponent där App Router
förbjuder ssr:false) ger SSR-HTML bitidentisk + widgetkod ur ALLA
shell-sidors kritiska chunk + hydratisering/re-render/style-layout EFTER
det kritiska fönstret. No-JS-kontrakt orört (syntes aldrig utan JS).

## Före-data

**Struktur (RAM-fritt, BUILD_ID IxcwwO):** chunk 10f47l5mmeoxy.js
(56 982 B rå / 17 354 B gzip) bär ALLA widgetens fem unika strängar
("Håll streaken levande", "Fortsätt läroplanen", "Testa hela analysflödet",
"Räkna på ett nytt case", "Djupdyk i dina innehav") och refereras i
initial load 12 ggr (/en/blogg, /ar/blogg) · 13 ggr (/blogg) · 17 ggr
(/kurser) — o76:s klump-klass.

**Lighthouse FÖRE (s7u1o119-fore, mobil 4G, load ~1,3, RAM-grind grön
1 989 MB):** /en/blogg P67 · LCP 4 059 · **TBT 876** · CLS 0 ·
/ar/blogg P66 · LCP 4 561 · TBT 737 · CLS 0 · /blogg P75 · LCP 4 232 ·
TBT 348 · CLS 0. (Paritet med o110:s EFTER-fönster: sv 329,5; en/anomali
lever i lastfönstret.)

## EFTER-kriterier (vakarövertag-barra om deployen landar efter mitt fönster)

1. prod-synken deployad med kur-committen som förfader (BUILD_ID lämnar IxcwwO)
2. prod 200 ×5: / · /blogg · /en/blogg · /ar/blogg · /en
3. Struktur: widgetens kännetecken EJ i initial-chunkarna på shell-sidor;
   egen chunk hämtad efter kritiskt fönster; SSR-HTML bitjämförbar
4. Lighthouse n=2 /en/blogg: TBT ↓ (mål ≤500 i tyst fönster); /ar/blogg +
   sv /blogg ±15 %; CLS 0 kvar; LCP/FCP ±15 %

## Gränser

R2 orörd (ingen pris-/tier-yta) · data/blogg/ orörd · src ENDAST Write/Edit ·
INGET eget bygge (prod-synken äger) · syskonytor orörda (s7-u2:s o118-rådata
orörd; nasta-steg.tsx orörd — endast shell-edit + ny wrapper).
