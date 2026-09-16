# DR-TOTAL 2026-09-16 — FLOCK-BETEENDEPROV + kvartalsövning iteration 2 (GODKÄNT)

Spår 10, s10-u2 omgång 6 (O6). Detta protokoll stänger O4:s ärlighetsnot
(DR-TOTAL-2026-09-16-AUTO.md): flockStartaOm() lades till EFTER den äkta
130,0 s-körningen — *"nästa totalkörning verifierar flock-lagret beteendemässigt"*.
DRIFTSBOKENs DR-rad bar samma förbehåll ("flock-lagret tillagt efter körningen,
verifieras beteende 2026-12"). Förbehållet är nu INLÖST, i förtid, med ett
verktyg som gör verifieringen återkommande: `verktyg/dr-total-flockprov.mjs`.

## Vad som bevisades (tre punkter, EN körning som SAMTIDIGT var övningen)

Skillnaden mellan gammal fillås-semantik och flock-lagret är BETEENDE, inte
kodväg — därför krävs ett körande prov, inte en kodläsning:

- **(i) RE-EXEC-VÄGEN ANVÄNDS**: under pågående övning bar låsfilen
  `/tmp/ak1a-dr-total.lock` raden `pid=1225710 … verktyg=dr-total.mjs flock=1`
  med pid LEVANDE (`ps`: `/usr/bin/node …/dr-total.mjs`) — taLas flock=1-grenen
  är den aktiva koden, inte fillåsgrenen.
- **(ii) KÖ-BETEENDE (det skiljande beviset)**: en FRÄMMANDE hållare
  (`flock /tmp/ak1a-dr-total.lock -c 'sleep 25'`, startad 1,2 s före
  dr-total) höll låset när dr-total startade. GAMLA semantiken hade svarat
  `TOTAL-LÅSET UPTAGET` + exit 3 direkt (färsk låsfil, < 30 min). ISTÄLLET
  observerades flock=1-raden först efter **24,1 s** — tidskonsistens: hållaren
  släppte vid t≈23,8 s (25 s benslängd − 1,2 s förskjutning), dr-total
  förvärvade och skrev låsraden omedelbart efter. dr-total VÄNTADE UT
  främmande låshållare = dokumenterat starkt flock, inte fillås.
- **(iii) DÖTT LÅS OSKADLIGT**: en 45 min bakdaterad låsfil med död pid
  (99999, ingen hållare) startade utan exit 3 — flock(1) förvärvar oavsett
  mtime; döda barnlämningar kräver ingen manuell kvittning.

## Maskinellt bevisblock (ordagrant ur verktygets utdata)

```
- Läge före: ingen låsfil på disk.
- (iii) Död låsfil skapad: pid=99999, mtime bakdaterad 45 min (2026-09-16T17:57:05.712Z) — ingen process håller den.
- (ii) Främmande hållare startad: flock pid=1224947, håller låsfilen i 25 s (levande vid dr-total-start: ja).
- Låsfilen under köfasen (senast läst innan flock=1): `pid=1225710 start=2026-09-16T18:42:30.793Z verktyg=dr-total.mjs flock=1`
- (i) RE-EXEC BEVISAD: låsfilen bär `pid=1225710 start=2026-09-16T18:42:30.793Z verktyg=dr-total.mjs flock=1` efter 24.1 s; pid LEVER: `1225710 /usr/bin/node /home/ak1a/AK1/verktyg/dr-total.mjs`.
- (ii) KÖ-BETEENDE: dr-total flock=1 efter 24.1 s >= hållare 25 s − 2 s → VÄNTADE UT hållaren (GRÖN).
Grind OK: MemAvailable 1075 MB · 73 GB ledigt på /
=== KEDJA 1: SQL-dumpen (Supabase → PG17-skrap) (dr-ovning.mjs) ===
[kedja 1] dr-ovning.mjs exit 0 på 39.9 s
=== KEDJA 2: Moln-JSON: system_events (fullarkiv) (dr-kedja2.mjs) ===
[kedja 2] dr-kedja2.mjs exit 0 på 39.8 s
=== KEDJA 4: Per-typ-snapshots (typvyerna) (dr-kedja4.mjs) ===
[kedja 4] dr-kedja4.mjs exit 0 på 36.4 s
=== KEDJA 3: Serverfils-arkivet (tar.gz + git bundle) (dr-kedja3.mjs) ===
[kedja 3] dr-kedja3.mjs exit 0 på 30.8 s
Totalprotokoll: data/forskning/DR-TOTAL-2026-09-16-AUTO-2.md
- dr-total avslutad: exit 0 på 146.9 s (väggklocka från start 171.0 s).
- (iii) DÖTT LÅS: dr-total startade trots 45 min gammal död låsfil — exit 3 uteblev (GRÖN: flock gör döda lås oskadliga). [processen startades: ja]
- Städning PG17: NERE — korrekt viloläge.
- Städning /tmp: dr-total-*-rester BORTA — GRÖNT.
- Låsfilen efteråt: innehåll `pid=1225710 start=2026-09-16T18:42:30.793Z verktyg=dr-total.mjs flock=1`; flock -n förvärvar → LÅSET SLÄPPT (GRÖNT).
DOM: GRÖN — flock-lagret beteendebevisat (i+ii+iii) och TOTAL-övningen GRÖN.
```

Ärlighetsnot om bevisblocket: raden *"Låsfilen under köfasen (senast läst
innan flock=1)"* är MISSVISANDE ETIKETTERAD — poll-loopen sätter flock=1-raden
i samma läsning den upptäcker den, så utskriften efteråt visar redan nya
raden. Kö-fasen dokumenteras i stället av TIDEN (24,1 s > 0,5–1 s som ett
låstagande utan motståndare hade tagit) och av att hållarprocessen levde vid
dr-total-start. Korrigerad etikett till 2026-12-versionen om verktyget
återanvänds; bevisvärdet opåverkat.

## Övningens mätvärden (iteration 2, maskinellt överprotokoll AUTO-2)

| Kedja | Vad | Exit | Väggtid | Nyckeltal |
|---|---|---|---|---|
| 1 | SQL-dump → PG17-skrap | 0 | 39,9 s | restore **14,3 s** · dump 1 288 041 rader · public 60 tabeller/1 266 528 rader · fel 788 (kända 788, okända 0) · markörsummering 1/1 GRÖN (5,5 s) |
| 2 | Moln-JSON system_events | 0 | 39,8 s | **161 678 rader** · 0 felaktiga · COPY 32 628 ms (4 955 rader/s) |
| 4 | Per-typ-snapshots | 0 | 36,4 s | 10/10 matchade · sabotage 3/3 gripna |
| 3 | Serverfils-arkivet | 0 | 30,8 s | 8 322 filer + 570 kataloger == listat · src 675 filer/203 930 rader · klon 1 195 commits |
| TOTALT | fyra kedjor i EN sekvens | **0** | **147,0 s == väggklocka** | överprotokoll DR-TOTAL-2026-09-16-AUTO-2.md + 4 delprotokoll (AUTO-4, KEDJA2-AUTO-4, KEDJA4-4, KEDJA3-AUTO-5) |

Jämförelse mot iteration 1 (13:51 lokal): TOTALT 147,0 s vs 130,0 s; kedja 1
restore 14,3 s vs 12,2 s — samma källor (02:30-dumpen, 07:24-exporten),
skillnaden är lastläge: grinden läste MemAvailable **1 075 MB** (mot iteration
1:s betydligt luftigare läge; dr-total:s tak är 1 000 MB). Ingen åtgärd —
kontraktet är grönt och omkörningsvägen (exit 75 → 90 s väntan → EN ny chans)
förblev overksam.

## Städning av lokal PG (uppdragets fjärde led — verifierad)

- PG17 **NERE** vid slutet (pg_lsclusters; korrekt viloläge — ett nere kluster
  kan inte bära skrap-DB:er).
- `/tmp/dr-total-*`-kataloger BORTA (finally verkställd).
- Total-låsfilen släppt: `flock -n` förvärvar direkt = ingen hållare kvar.
- Barnens gemensamma `/tmp/ak1a-dr-prov.lock` är en ren artefaktfil utan
  hållare (flock-lås dör med processen) — oskadlig enligt samma bevis (iii).

## Kvartalsmallen 2026-12 (uppdaterad)

`node verktyg/dr-total.mjs` förblir kärnan. Ny standardform:
`node verktyg/dr-total-flockprov.mjs` — samma ETT KOMMANDO + flock-beteendet
om-verifieras gratis vid varje kvartal (hållare 25 s, tre bevispunkter,
städbevis). Flagga `--hollare-sek N` (5–300) för annan belastning.
Kvar från tidigare kör (oförändrat): väv in dr-kedja5 (kirurgi) i totalen
ELLER kör manuellt vid tabellincident; board_decisions-specialreceptet och
system_events-återimporten är huvudagentens.

DOM: **GRÖN** — flock-lagret beteendebevisat (i re-exec, ii kö-beteende,
iii dött lås oskadligt) och TOTAL-övningen grön på 147,0 s med verifierad
PG-städning. O4:s förbehåll är stängt.

SLUT — s10-u2 omgång 6 (O6), 2026-09-16 ~20:45 lokal (18:44:58 UTC)
