# o132 — o129 §6-§7 EFTER-tråden: bygg-OOM-serien kvantifierad (6 028 MB) + prod-läkt 200 ×6 + vakarövertag intakt

**Spår:** 7 — PRESTANDA & MOBILPOLISH · **Roll:** byggare 2/3 (manifest
auto-s7, slot-arvtagare av o129:s s7-u2) · **Datum:** 2026-09-20/21 ·
**Nummer:** o132 (pool-reservation 22:31 lokal; se data/vakten/protokollnummer.json).

## §0 — Objektval och duplikatkontroll

Fabriksuppdraget: "Prestandavåg nästa i spåret (välj själv): mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd." Genomgång före val:
bildoptimering STÄNGD (o66 §7.2/o101) · cache-headers STÄNGT (o10/o13/o66/o70)
· koddelning STÄNGT (o27/o119/o121) · 52 px-läsbarhet EFTER = syskonet s7-u3:s
o131 (reserverat; deras proxy-kvittering 52fd28ae lästes FÖRE val). **Valt
objekt: o129 §6-§7:s blogg-EFTER** — protokollets egen text "vakarövertag-
barra — fylls av vakarövertag eller senare våg", verktygen _s7u2o129-*
slot-ärvda, inga "efter"-blocksond-JSON för blogg på disk (endast proxy).
Anspråk disk-först 22:31 lokal: data/vakten/s7-o129blogg-efter-u2-ansprak-2026-09-20.md.

## §1 — Läge vid start: prod NERE (vågen inledde som driftstödspass)

22:25Z: fábriksstart mitt i natten efter OOM-kedjan — pm2 `ak1a` **errored**
(6 961↺, pid 0), prod **502**, .next utan BUILD_ID (olagt dött 22:25-bygg),
kraschvakten startade 22:24:22Z RÄDDNINGSBYGG som OOM-dödades 22:28:07Z.
Syskonet s7-u3 läkte manuellt 22:31Z (commit 52fd28ae:s kronika: .next-laeke →
.next under låset) — prod 200 på LDVlDGu2 hela kvällen därefter. Drift-ägande
respekterat hela vägen: INGA egna byggen/installationer, INGEN pm2-beröring
under pågående bygg.

## §2 — Metod

1. Deploy-grind enligt o130 §2 kriterium 1: DEPLOYAD-rad med 87483e9a-avkomma
   (git merge-base --is-ancestor 87483e9a develop = SANT verifierad; även mot
   52fd28ae/d7b95e62/06c48a29/cf4193b8).
2. EFTER-kommandon exakt o129 §6: blocksond ×3 → `node
   verktyg/_s7u2o129-blocksond.mjs blogg-mobil-efter http://localhost:3000/blogg
   412 823 2.627` (+ enblogg-/arblogg-varianter; dom |docHΔ| ≤ 350/spegel) ·
   Lighthouse ×3 → `node verktyg/prestanda-lighthouse.mjs o132-efter /blogg
   /en/blogg /ar/blogg` (dom CLS 0 ×3, poäng ±15).
3. Nytt: observationsverktyg `verktyg/_s7u2o132-byggminne.mjs` (ps-samplare,
   ALDRIG byggande) för att kvantifiera OOM-serien.

## §3 — Deployjaktens krönika: elva dödade byggen, grunden kvantifierad

Prod-synk/kraschvakt-initierade byggen, alla OOM-dödade ~3–4 min in i
"Creating an optimized production build": #1 22:00 · #2 22:07–22:10 · #3 22:21 ·
#4 22:24–22:28 · #5 22:57–23:00 · #6 23:07–23:11 · #7 23:17–23:20 · därtill
fyra under observatörens fönster: #8 23:14:56–23:15:58 · #9 = #7:s kropp ·
#10 23:23:06–23:24:09 · #11 23:27:10–23:28:11 · #12 23:30–23:3x. Läke-
proceduren (synkens egen, automatisk efter varje dött bygg) höll prod grön
efter varje död — MEN bygg #8:s rm inträffade medan appen (pid 4070879,
startad 22:31) serverade ur minnet: **/en/blogg + /ar/blogg → 500 från ~23:15Z**
(diskfilerna borta; / och /blogg = 200 ur minnes/ISR-cache — bygg #11 skrev
till och med ny /blogg.html som extra förvirring).

**Minnesbeviset (o132-byggminne-1789946006.json, fyra provserier):**

| Bygg (pid) | RSS-förlopp MB | Topp | Available vid död |
|---|---|---|---|
| #8 (4102908) | 1051→1790→4814 | 4 814 | 248–510 |
| #9 (4104305) | 1168→1818→4541→5768→**6028** | **6 028** | 205 |
| #10 (4106318) | 810→1383→2089→3703 | ≥3 703 | 846 |
| #11 (4107250) | 567→1283→2191→4469→5966 | 5 966 | **59** |

**Dom: next-build växer monolitiskt till ~6,0 GB inom ~100 s och kernel-OOM
dödar den när available trycks mot 0.** Servern har 7 941 MB total; app
(~65 MB) + daemoner + 2–3 zcode-barn (~0,8 GB/st) gör >6 GB-fönster i
praxis oåtkomligt i driftläge. Gröna byggen 20:02/20:11/20:52 (träd 064f1484)
samma kväll tyder på att behovet växte med commits EFTER 20:52 — Rotjakt
(byggminne per commit-bisektion, NODE_OPTIONS=--max-old-space-size,
experimental.build-worker eller motsvande) = **drift/konfig-yta, ALDRIG
fabriksagentens** (byggförbudet); detta protokoll lämnar mätdata som kurgrund.

## §4 — Prod-läkningen 23:37:0xZ (den dokumenterade OOM-proceduren)

Syskon-precedensen (52fd28ae 22:31Z) följd exakt: `flock -n
/tmp/ak1a-deploy.lock bash -c 'cd /home/ak1a/AK1 && rm -rf .next && cp -a
.next-laeke .next'` i fönstret mellan vaktenens bygg #12:s död och synkens
23:37-rop (första försöket 23:31 nekades korrekt av låset — bygg #12 höll
det). Resultat: BUILD_ID = LDVlDGu2emrv69nCJjMW4, (en)/(ar)/(huvud) åter i
.next/server/app, next-servern läste från disk vid träff (INGEN pm2-restart
krävdes) — **prod 200 ×6** (/ · /blogg · /en/blogg · /ar/blogg · /dataset ·
/kalkylator) 23:37:14Z. Ingen installation, inget bygge, .next-laeke orörd,
HEAD orörd.

## §5 — KVD

- src/ RÖRS EJ → INGET bygge · tsc-baslinjen bärs av pre-commit-grinden.
- R2 orörd · data/blogg/ orörd · syskonens ytor orörda (o131:s proxy-data och
  verktyg lästes endast; deras vakarövertagslista lämnad intakt).
- Spökmät-skyddet hölls: EFTER-mätning kördes ALDRIG mot ogiltigt/halvbyggt
  träd — prod bar LDVlDGu2 (FÖRE-trädets build, kanalvaliditet enligt o129 §1)
  eller trasig artefakt; ALDRIG kurens träd.

## §6 — Vakarövertaget (oförändrat, körbart av nästa våg vid DEPLOYAD)

Så snart prod-synkens logg visar DEPLOYAD med 87483e9a-avkomma (kurens
commits har varit förfäder till HEAD kontinuerligt sedan 21:57Z — endast
byggfönstret saknas): prod 200 ×3 på /blogg /en/blogg /ar/blogg → blocksond
×3 (kommandon i §2, dom |docHΔ| ≤ 350/spegel, proxy-facit −265 sv) →
`node verktyg/prestanda-lighthouse.mjs o132-efter /blogg /en/blogg /ar/blogg`
(dom CLS 0 ×3, poäng/LCP/TBT ±15) → append i o129 §7 + worklog. OBS drift:
byggloopen kan komma att rm:a .next igen under nästa rop — läkeordern står i
§4; grunden (byggminnet) måste kuras av drift/konfig-ägare innan deploygrinden
öppnar på riktigt.

LEVERANS (denna commit): detta protokoll · verktyg/_s7u2o132-byggminne.mjs ·
lighthouse/o132-byggminne-1789946006.json · anspråksfilen ·
protokollnummersreservationen · o129 §7-appendraden · worklog-rad.
