# O32 — Prestanda spår 7: vilande CPU-facit på JS-friskt bygge (u3:s rest) (2026-09-16)

**Ägare:** fabriksagent s7-u1 (byggare 1/3, manifest auto-s7-1789575318875)
· **Status:** LEVERERAD — vilande facit mätt 18:49–18:52 (load 0,56), tabell §4
· Anspråk: data/vakten/s7-vilafacit-u1-ansprak-1843.md

## §0 Objektval + duplikatkontroll

Uppdrag: nästa prestandaobjekt i spåret. Kontroll före val: o28 §6 (blogg-CV:s
EFTER) + o27:s EFTER-tabell togs av syskonet s7-u3 (54e4610c, anspråk
18:16 — deras funktionssond/S&L/gränsnittsvakt/bokning lämnades orörda);
o16-köposterna + o31 av s7-u2 (3a8f2287, /studio chatt-lazy + SEO-stängning).
u3:s commit bokför uttryckligen RESTEN: "o27:s CPU-delta om-mäts vid
verifierat tömd fabrikskö" — detta objekt tas här. Dessutom gör u3:s
INSTRUMENTFYND (hela r4b2-ronden var JS-nedbruten: chunks 5xx efter
10:02:39-OOM) att spåret saknar en giltig vilande CPU-baslinje för trion
/, /kurser, /blogg på ett fullfungerande bygge — den levereras här.

## §1 Förutsättningar (bevisade 18:10–18:40)

- Deploy 0bd01237 16:10:35 (CV-kuren cd2b68ac anfader — merge-base
  verifierad), prod 200.
- Statisk sond GRÖN 18:18: 22/22 refererade chunks 200 (12:02-OOM:en läkt).
- Funktionssond manuell: /blogg SSR-HTML 200 (229 kB), cv-bloggkort
  ×55 (110 träffar) — kuren live.
- ISR-trigga ×2+8 s: /, /kurser, /blogg, /en/blogg — alla 14–23 ms (varm).
- u2:s studio-vakare (PID 1179591) i VÄNTHELÄGE — chrome-tystnad hålls
  tills vakaren mätt klart (ömsesidig kontaminationsrespekt, u3:s
  föredöme).
- **18:46 VAKARFYND (tidszonstolkningsbugg):** vakarens lastDeployadTs()
  kör Date.parse på prod-synk-loggens UTC-tidsstämpel ("2026-09-16T16:40:33")
  utan Z-suffix ⇒ tolkad som lokal CEST ⇒ 2 h fel. Deployen av hela
  kur-kedjan (16:40:33Z: chatt-lazy 3a8f2287 + 54e4610c, prod 200) är
  OSYNLIG för vakaren — den triggar först vid DEPLOYAD-rad ≥ 18:34:33
  (≈ 20:34 lokal) eller dör vid 4 h-taket 20:34:35Z ⇒ mitt mätfönster
  18:50–19:00 ligger helt under triggern, noll kontaminationsrisk i båda
  riktningarna (vakaren pollar varannan minut, mäter ej). Vakaren lämnas
  levande + orörd; /studio-EFTER förblir u2:s yta (o31 §7 pending om
  taket slår till — buggen bokas åt dem här).
- 18:50 mätstart-grindar: load 0,56 (0,95/1,60 — fallande) ·
  MemAvailable 3 049 MB · 0 chrome/lighthouse · fabrikens manifest
  auto-s7-1789575318875: u2+u3 klara = ingen aktiv syskon-mätning.

## §2 Metod

Vilande-grindar före mätning: 0 chrome-processer, 0 lighthouse-processer
(pgrep-fällan medveten — egna skalet uteslutet), last fallande, RAM ≥ 1 500 MB
(u2:s tröskel — chrome får aldrig OMA-döda pm2, dagens två incidenter).
ISR-trigga ×2 + 8 s per sida (11163-metoden). Instrumentpar mot u3:s
bokförda siffror + start-fore-161. Last-kontext bokförs med varje tal
(o28 §1:s metodregel: utan vilande-kontext är CPU-tal rådata med
varudeklaration).

## §3 FÖRE-referenser

| Sida | FÖRE-källa | Poäng | LCP | TBT | CLS | mainthread | Vikt |
|---|---|---|---|---|---|---|---|
| / | start-fore-161.json (04:22, JS-friskt+ tyst; u3: "spårets giltiga poäng-FÖRE") | 62 | 5 411 | 574 | 0,1096 | 3 940 | 790 KiB |
| /, /kurser, /blogg vikt/unused | u3:s instrumentpar (54e4610c-tabellen): vikt 790→732 / 839→774 / 831→764 KiB · unused-JS 84→74 / 116→73 / 116→74 KiB | — | — | — | — | — | — |

Obs: detta bygge (deploy pågår ~18:38→) innehåller dessutom u2:s
chatt-lazy (3a8f2287) — min EFTER blir samtidigt första fullt vilande
facit för ALLA tre kurer (o27 SPA-koddelning + o28 CV-blogg + o31
chatt-lazy-startsida).

## §4 EFTER — vilande facit (mätt 18:49–18:52, spårets första vilande CPU-tal på fullt fungerande bygge)

Bygge: deploy 16:40:33Z (54e4610c = CV-blogg + SPA-koddelning + chatt-lazy +
tre mentorlager 6c6cd2d5) · statisk sond GRÖN 18:52 (22/22 chunks 200 på
nya bygget) · prod HTTPS 200. Rådata:
`lighthouse/{start,kurser,blogg,en_blogg}-vila-1849.json` +
`vila-1849-sammanfattning.json`.

| Sida | Poäng | LCP ms | TBT ms | CLS | mainthread | Vikt | unused-JS |
|---|---|---|---|---|---|---|---|
| / | 60 | 4 937 | 739 | 0,0000 | 6,2 s | 738 KiB | 79 KiB |
| /kurser | 50 | 5 857 | 1 866 | 0,0023 | 8,2 s | 780 KiB | 79 KiB |
| /blogg | 51 | 5 118 | 3 106 | 0,0000 | 7,7 s | 771 KiB | 79 KiB |
| /en/blogg | 70 | 4 246 | 442 | 0,0000 | 4,5 s | 704 KiB | 80 KiB |

Last-kontext: load 0,59/0,92/1,54 vid mätstart, MemAvailable 2 950 MB,
0 chrome/lighthouse före (egna skalet uteslutet ur pgrep), fabrikens
syskon klara. Alla fyra sidor ISR-triggade ×2+8 s direkt före (14–21 ms).

## §5 Värdering

**o27 (SPA-koddelning) — viktvinsten består i vila, CPU-deltat varudeklarat:**
startsida vikt 790 → 738 KiB (−52) och LCP 5 411 → 4 937 (−474) mot
fore-161; men TBT 574 → 739 (+165) och poäng 62 → 60 (±0). Förklaring är
bygges-diffen inom samma dygn: koddelningens (~190 kB ur bunt) vinster delvis
uppätna av s6:s tre nya mentorlager (riskdjup+beteendedjup+skattedjup i
6c6cd2d5) + chatt-lazy-omstrukturering. **Slutsats: koddelningen lever
(nätverkssidan bevisad), men spår 6:s globala bunt-tillväxt äter CPU-vinster
i realtid** — boka chat-widgetens lager-lazy per yta (se §6).

**o28 (CV-blogg) — poängsidan i vila:** CLS 0,0000 (huvud+spegel) vid
full hydratisering; TBT 3 106 ms är sidans äkta JS-kostnad när ALLA chunks
lever (r4b2:s "TBT 336" var den JS-nedbrutna rundens artefakt — u3:s
instrumentfynd, här kvantifierat i vila). CV-kurens strukturvinst
(u3:s funktionssond: reserv auto 352px, 0 animationer, 55/55 text efter
scroll) + noll CLS = kuren korrekt; /blogg:s resterande TBT är
bundteläsnings-/hydratiseringsskuld, inte kortlistans layout.

**/en/blogg = spårets snabbaste blogg-yta** (P70 · TBT 442 · vikt 704) —
huvudspegeln bär tyngre gemensam bunt; nytt sondobjekt för nästa våg om
500 ms TBT-gap mot /blogg ska jämföras (språkskillnad i bunt-redovisning).

**Spårets nya baslinje:** vila-1849 ersätter r4b2-eran som referens-FÖRE
för framtida kuror — på fullt fungerande, statiskt-sond-verifierat bygge
med dokumenterad last-kontext (o28 §1:s metodregel uppfylld från båda ändar).

## §6 KVD + kö

- KVD: prod HTTPS 200 (18:52) · statisk sond GRÖN 22/22 på mätbygget
  (18:52) · src orörd (data-only-våg — tsc behövs ej; grinden passerade
  vid commit) · R2 orörd · data/blogg/ orörd · inget bygge.
- **KÖ till huvudagenten:** (1) chat-widget/mentorlager växer i ALLA sidors
  gemensamma bunt (unused-JS 79–80 KiB på alla fyra ytor, TBT-uppätna
  koddelningsvinster) — lazy-ladda lager per yta, s6-fabriksmönstret;
  (2) u2:s vakarbugg: lastDeployadTs() i /tmp/s7u2c-vakare.mjs Date.parse-ar
  prod-synkens UTC-rad utan Z ⇒ 2 h fel — vakaren fastnar/dör vid tak;
  kur = parse med explicit Z eller rad-hash-jämförelse (ägare u2/huvudagent);
  (3) /en-blogg mot /blogg TBT-gap (442 vs 3 106) som sondbart objekt.
- u3:s rest "o27 CPU-delta vid tömd fabrikskö" är härmed **infriad**:
  vilande par mot fore-161 levererat med bygges-varudeklaration.

## §7 DUBBELMÄTARFYND (u1-omstartens kvitto, 19:0x) — §4:s CPU-tal delvis kontaminerade

**Händelsen:** två u1-processer (denna vågs ursprungsbarn + fabriksretry
efter 25-min-timeout) mätte SAMTIDIGT 18:49–18:52 — var för sig med
grindar "0 chrome/lighthouse vid start", men startarna låg ~90 s isär så
ingen såg den andres svärm. Bevis: två parallella filserier på disk med
överlappande mtimes — vila-1849 (committad 6794e6a2) och s7u1-vila
(committas här som bevispar). Fil-mtime = mätningens SLUT; ~60–90 s per
sida ger fönstren nedan.

**Kontamineringskarta (ömsesidig — CPU-tal, ej strukturtal):**

| Mätning | Fönster | Annan svärm aktiv? | Talens status |
|---|---|---|---|
| deras / (vila-1849) | ~18:49:20–18:50:18 | NEJ (min start ~18:50:30) | **ENSAM — giltigt** |
| deras /kurser | 18:50:18–18:50:48 | min / pågick | kontaminerad |
| deras /blogg | 18:50:48–18:51:16 | min / pågick | kontaminerad |
| deras /en/blogg | 18:51:16–18:51:43 | min / + /kurser | kontaminerad |
| min / (s7u1-vila) | ~18:50:30–18:51:21 | deras /kurser + /blogg | kontaminerad |
| min /kurser | 18:51:21–18:51:49 | deras /en/blogg | kontaminerad |
| min /blogg | 18:51:49–18:52:13 | deras slut 18:51:43 | **i princip ensam** |
| min /en/blogg | 18:52:13–18:52:38 | NEJ | **ENSAM — giltigt** |

**Konsekvenser för §5:s slutsatser:**
1. §5:s startsida-slutsats STÅR SIG (deras / togs ensam): TBT 574→739
   (+165) vid last 0,59 är legitimt — s6:s mentorlager äter koddelningens
   CPU-vinster på / (kön i §6 består).
2. §5:s "/blogg:s äkta all-JS TBT 3 106 ms" är **Dubbelmätar-artefakt,
   inte äkta kostnad** — ensam-talet (min /blogg, efter deras svärms
   slut): TBT 1 217 · P58 · LCP 4 671. Kontamineringen ~×2,5 på TBT.
   /blogg:s hydratiseringsskuld är reell men hälften så stor.
3. /en/blogg ensam-tal (min): P69 · LCP 4 220 · TBT 503 — bekräftar
   §5:s "snabbaste spegel"-fynd och TBT-gapet mot /blogg (sond-objektet
   i §6 kö 3 består, nu med renare talpar: 503 vs 1 217).
4. /kurser har INGET ensam-tal denna rond — enda resterande lucka i
   trio-facit (rest: nattfönster-om-mätning).
5. Strukturtalen är DOBBELT bekräftade (simulerat nätverk = lastokänsligt):
   vikt 738↔739 · 780↔780 · 771↔771 · 704↔699 KB — två oberoende
   svärmar, samma bygge, identiska tal. §4:s vikt/unused-JS/CLS-kolumner
   är spårets solidaste baslinje hittills.

**Metodläxa (bokas åt spåret):** "0 mätarprocesser vid start" räcker
inte när fabriken kör retries — grinden måste också vara SEQ-kollad mot
senaste Lighthouse-fil-mtime i katalogen (en fil < 3 min gammal = någon
mäter just nu) innan egen körning.
