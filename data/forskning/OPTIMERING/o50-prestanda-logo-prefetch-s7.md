# o50 — Prestanda: logons `/`-prefetch kurerad (Spår 7, s7-u2, 2026-09-17)

**Klass:** prefetch-spill i initial load (o17/o41/o49-familjen).
**Yta:** `src/components/ak1a/varumarkes-logo.tsx` (Link-grenen).
**Status:** KUR LEVERERAD — EFTER-mätning pending prod-synkens deploy (se §5).

## §1 Objektval och pivot (ärlig kollisionsbokföring)

o41 §7 bokade klassen komplett: "`/-prefetchen` ×3 (18,4 KiB, SeoPageShell
nav/breadcrumb) + `/logga-in` ×2". Mitt anspråk (18:18 lokal) tog hela
posten; realiteten: syskonet u1 committade `/logga-in`-delen som **o49**
(ad04d358, 18:23:01 — deras ingrepp startat före mitt anspråg; inloggad-
knapp.tsx prefetch={false}) och u3 tog chat-chunk-kuren (anspråk 16:2x).
Disk-först gäller (o41-pivot-precedensen): NOLL duplikat — min leverans
blir köpostens kvarrest, den tyngre delen: **logons `/`-prefetch**.
Protokollnamn o50 (o49 ägs av u1).

## §2 FÖRE (Lighthouse mobil, localhost=prod på BUILD_ID E0Xp-0poboB2EQmnwRtE)

Mätning 18:2x lokal, 3 fabriksbarn + mät-chrome igång — CPU-tal lastiga,
strukturplan lastokänsligt (o28-mätplanet). Rådata:
`lighthouse/{blogg,kurser}-s7u2o50-fore.json` + sammanfattning.

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| /blogg | P51 | 5007 | 1854 | 0 |
| /kurser | P46 | 5929 | 3241 | 0 |

Sond (`verktyg/_s7u2-sond-prefetch.mjs`, räknar `_rsc`-requests i
Lighthouse network-requests):

- **/blogg: 45 requests, 704,3 KiB total. RSC-prefetch 5 st = 14,6 KiB:**
  `/?_rsc` ×3 (0,8 + 8,4 + 2,9 = **12,1 KiB**) · `/logga-in?_rsc` ×2
  (0,6 + 1,9 = 2,5 KiB — u1:s yta, deras kur tar den).
- **/kurser: RSC-prefetch 6 st: `/?_rsc` ×2 (8,4 + 2,9 = 11,3 KiB) ·
  `/logga-in` ×2 (0,8 KiB) · BONUSFYND se §6.**

Källanalys (empirisk, ej gissad): SSR-DOM har 1× `<a href="/">` (logon,
aria-label "till startsidan"); hydraterad DOM (chrome --dump-dom +
virtual-time) fortfarande 1× — de tre omgångarna är **Next 16.1.1:s
multiomångs-prefetch på EN synlig länk** (partial + full flight + efterföljare;
olika query-param per omgång). o41 konstaterade samma mekanism för
blogg-korten och att `prefetch={false}` styr BÅDA omgångarna — här bevisat
gälla tre. Toppvaxelns `/`-länk renderas bara i företagsvy (aria-current
annars); Brodkrumma på /blogg saknar href på Hem; NastaSteg föreslår aldrig
`/` (källkod); Mobilmeny renderas först vid öppen drawer — logon är ENDA
`/`-källan. /logga-in ×2 = InloggadKnappens CTA + mobilvariant (u1:s yta).

## §3 Kur

`prefetch={false}` på logo-Link (rad 109-grenen) + precedenskommentar i
koden (o17/o41/o49-stilen). Effekt: logon slutar prefetcha `/` på **varje
sida som visar headern** — komponenten används av 30 filer (SeoPageShell,
Mobilmeny, huvudlayouten), alltså hela sajten, inte bara mätsidorna.
onClick-grenen (mobilmenyns stäng+navigera) opåverkad; Button- och statiska
grenar orörda.

**Avvägningen (o41 §2:s begärda):** startsidan är force-static ⇒ klickkostnad
~100–300 ms när användaren aktivt klickar hemåt; hover-prefetch lever kvar
(Next 16, musanvändare förlorar inget). Mot det: 12,1 KiB + 3 requests spill
i LCP-fönstret på VARJE sidvisning för ALLA besökare (kunden = telefon-först,
mobildata). Samma vägning som o41 gjorde för kortens huvudlänkar — konsekvent.

## §4 tsc

`node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinären;
inget npx, inget bygge — fabrikregeln).

## §5 EFTER (pending prod-synk — bokförs av mig eller nästa omgång)

Prod-synken deployar ad04d358 (u1) + denna commit tillsammans. EFTER-mätning
`s7u2o50-efter /blogg /kurser` när ny BUILD_ID landat. **Förväntan
(lastokänsligt strukturplan):**

| Tal | /blogg | /kurser |
|---|---|---|
| `/?_rsc` prefetch | 3 → **0** | 2 → **0** |
| `/logga-in?_rsc` | 2 → 0 (u1:s kur) | 2 → 0 (u1:s kur) |
| requests | 45 → 40 | −4 |
| transfer | −14,6 KiB | −12,1 KiB |

CPU-tal (LCP/TBT/poäng) redovisas med lastkontext (o41-EFTER-metoden);
kurens värde = requests/transfer/mobildata. Null-resultat ⇒ omgång 2-effekt
→ ny rot bokas (o41-disciplinen). FÖRE dubbelkällad: mina mätningar +
u1:s FÖRE i o49 (samma klass, samma bygge).

### EFTER BOKFÖRD (s7-u3 byggare 3/3, 2026-09-17 19:0x — vakarövertag enligt §5)

Deploy 089ded18 16:41:37Z (BUILD_ID 6qghn83I3yt--H0fK8g0A). Mätning
19:0x lokal (o51 §2:s omgång — rådata `lighthouse/blogg-s7u3o51-fore.json`
+ `kurser-s7u3o51-fore.json`): förväntan UPPFYLLD EXAKT, alla tal.

| Tal | /blogg | /kurser |
|---|---|---|
| `/?_rsc` prefetch | 3 → **0** ✓ | 2 → **0** ✓ |
| `/logga-in?_rsc` | 2 → **0** ✓ (u1) | 2 → **0** ✓ (u1) |
| `_rsc` totalt | 5 → **0** ✓ | 6 → **3** (endast §6-köposten kvar) |
| requests | 45 → **33** (−12) | → **41** (−4+ ✓) |
| transfer | 704,3 → **528,4 KiB** | se o51 §2 |

/blogg-kolumnen konfirmerar u1:s o49 §7-tabell (33/528,4 bitidentiskt
40 min senare — tillståndet stabilt i prod, ingen ISR-återgång).
Kvittot skrivet av s7-u3 (o51) i vakarövertag — kuren är prod-bevisad.

## §6 Bonusfynd — köpost till nästa omgång

Sonden på /kurser: **`/kurser/the-intelligent-investor?_rsc` ×2 (0,9 + 25,1
= 26,0 KiB)** — listvyns första synliga kurskort prefetchas (o41:s
blogg-kortsmönster i större skala: kurs-SMG flighter är tre gånger tyngre).
Kandidat-kur: `prefetch={false}` på kurskortens huvudlänk i kurslistan
(o41 §3:s kirurgi, ny yta — ägs av nästa omgång; kontrollera u3:s
o45-protokoll för gränssnittet mot flight-kuren).

## §7 Kö efter omgången

1. Kurskortens list-prefetch (§6, 26,0 KiB × synliga kort).
2. /kurser solo-rond i vilofönster (u3:s rest från o45-EFTER).
3. /ar via egen mätning (o41:s frivilliga rest).
4. Chat-chunk-kurens EFTER (u3:s pågående objekt).
