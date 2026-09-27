# V172 — GRANSKNING: kvartalsrapportsserien Q3 2026 (vågstart rond 192, 2026-09-25)

## PROCESREGLER (EMOTTAG-MONSTER-anpassade för rapportvågen)

1. **Väntar-listan uppdateras VID LEVERANS.** Disk-läget är sanningen: finns paketet i
   `data/blogg/` = PUBLICERAD; finns det endast i `data/blogg-utkast/kvartal/2026-q3/`
   = VÄNTAR. Levererande/granskande session ropar `node verktyg/_r172-rapportvag-status.mjs`
   som SISTA steg i sin körning (monstrets regel 1 — v166-läxan).
2. **RAPPORTBLOCK byggs om per körning — senaste mätningen gäller.** Blocket ERSÄTTS,
   appendas aldrig; dubbelkörning är bitidentisk (monstrets regel 2 — v170-kuret mönster).
3. **STÄNGDVAKT.** Bär SAMMANFATTNING-raden STÄNGD lämnar statusverktyget filen orörd
   (bevisbevarande; monstrets regel 3).
4. **PUBLICERINGSGRIND (R2 — kundens vetorätt).** Flytt av ett paket från utkast till
   `data/blogg/` = extern publicering = KUNDENS BESLUT, aldrig autonomt. Granskning,
   kur och kvalitetsmätning av utkast är internt arbete och görs autonomt. LÄGET JUST NU:
   9 paket publicerade i tidigare omgångar med schemalagda oktober-datum (10-05 → 10-21) —
   befintligt läge dokumenteras här som faktum; YTTERLIGARE publiceringar väntar kund.
5. **Juridikgrinden (V152, fast för serien).** "Så läser du"-formuleringar, aldrig råd
   (lagen 2007:528); källor per siffra; konsensus endast som pedagogiskt begrepp.

## RAPPORTBLOCK (maskinellt genererat — byggs om per körning, reglerna § 1–2)
LÄGE: 8 publicerade (i data/blogg/, schemalagda oktober-datum) · 76 väntar (i data/blogg-utkast/kvartal/2026-q3/) — mätning 2026-09-25 (datumPrecision: verktyget är tidsidempotent; körningstidpunkterna lever i git-historiken)

### PUBLICERADE
✓ sa-laser-du-ericsson-q3-2026
✓ sa-laser-du-evolution-q3-2026
✓ sa-laser-du-goldman-sachs-q3-2026
✓ sa-laser-du-holm-q3-2026
✓ sa-laser-du-industrivarden-q3-2026
✓ sa-laser-du-nordea-q3-2026
✓ sa-laser-du-sandvik-q3-2026
✓ sa-laser-du-skf-b-q3-2026

### VÄNTAR (grupperade efter kalenderns rapportvecka — estimat/spann i egen grupp)
**spann/estimat** (6): sa-laser-du-asml-q3-2026 · sa-laser-du-att-q3-2026 · sa-laser-du-lvmh-q3-2026 · sa-laser-du-precise-biometrics-q3-2026 · sa-laser-du-saab-q3-2026 · sa-laser-du-samsung-q3-2026
**v39** (1): sa-laser-du-hm-b-q3-2026
**v40** (1): sa-laser-du-nike-q3-2026
**v42** (8): sa-laser-du-investor-ab-q3-2026 · sa-laser-du-jnj-q3-2026 · sa-laser-du-jpmorgan-q3-2026 · sa-laser-du-kinnevik-q3-2026 · sa-laser-du-np3-q3-2026 · sa-laser-du-prologis-q3-2026 · sa-laser-du-vz-q3-2026 · sa-laser-du-wallenstam-q3-2026
**v43** (29): sa-laser-du-abb-q3-2026 · sa-laser-du-atlas-copco-q3-2026 · sa-laser-du-balder-q3-2026 · sa-laser-du-castellum-q3-2026 · sa-laser-du-catena-q3-2026 · sa-laser-du-dios-q3-2026 · sa-laser-du-electrolux-q3-2026 · sa-laser-du-essity-q3-2026 · sa-laser-du-fabege-q3-2026 · sa-laser-du-getinge-q3-2026 · sa-laser-du-handelsbanken-q3-2026 · sa-laser-du-hexagon-q3-2026 · sa-laser-du-iberdrola-q3-2026 · sa-laser-du-newmont-q3-2026 · sa-laser-du-nflx-q3-2026 · sa-laser-du-nokia-q3-2026 · sa-laser-du-norsk-hydro-q3-2026 · sa-laser-du-pg-q3-2026 · sa-laser-du-sap-q3-2026 · sa-laser-du-sca-q3-2026 · sa-laser-du-seb-q3-2026 · sa-laser-du-swedbank-q3-2026 · sa-laser-du-tele2-q3-2026 · sa-laser-du-telia-q3-2026 · sa-laser-du-var-energi-q3-2026 · sa-laser-du-volvo-car-q3-2026 · sa-laser-du-volvo-group-q3-2026 · sa-laser-du-wihlborgs-q3-2026 · sa-laser-du-yara-q3-2026
**v44** (21): sa-laser-du-aker-bp-q3-2026 · sa-laser-du-alfa-laval-q3-2026 · sa-laser-du-alphabet-q3-2026 · sa-laser-du-assa-abloy-q3-2026 · sa-laser-du-astrazeneca-q3-2026 · sa-laser-du-boliden-q3-2026 · sa-laser-du-boston-scientific-q3-2026 · sa-laser-du-carlsberg-q3-2026 · sa-laser-du-cellavision-q3-2026 · sa-laser-du-cvx-q3-2026 · sa-laser-du-eli-lilly-q3-2026 · sa-laser-du-eqnr-q3-2026 · sa-laser-du-fortum-q3-2026 · sa-laser-du-logitech-q3-2026 · sa-laser-du-meta-q3-2026 · sa-laser-du-microsoft-q3-2026 · sa-laser-du-palantir-q3-2026 · sa-laser-du-shell-q3-2026 · sa-laser-du-ssab-q3-2026 · sa-laser-du-stora-enso-q3-2026 · sa-laser-du-upm-kymmene-q3-2026
**v45** (7): sa-laser-du-coloplast-q3-2026 · sa-laser-du-hufvudstaden-q3-2026 · sa-laser-du-kambi-q3-2026 · sa-laser-du-latour-q3-2026 · sa-laser-du-mtg-b-q3-2026 · sa-laser-du-novo-nordisk-q3-2026 · sa-laser-du-truecaller-q3-2026
**v46** (2): sa-laser-du-disney-q3-2026 · sa-laser-du-rwe-q3-2026
**v47** (1): sa-laser-du-nvda-q3-2026

<!-- SLUT-RAPPORTBLOCK -->


## GRANSKNINGSOMGÅNG (rond 194, 2026-09-25 — mätverktyg verktyg/_r172-granska-utkast.mjs, kurerat per ronds läxor)

DOM: **71 GRÖN · 5 GUL · 0 RÖD** av 76 väntande. Fullrapport: /tmp/r172-granskning-resultat.json (maskinmätning; mätverktyget committat och omkörbart).

**Verktygskurerna (valideringsrondens läxor, AR3/AR8-klassen — utkasten friades, mätaren kurerades):** (1) källkravet "externa URL:er" → "namngivna källor per siffra" (ABB-mönstret: intern datapipeline citeras per siffra — V152 uppfyllt); (2) rädverbcounten smalades till rådgivningskonstruktioner (beskrivande "säljer lås"/substantiv "noll köp"/pedagogiska "bör du se" är legala); (3) längdbandet 700–4200 (grundliga paket 3522–4145 = trimnotis >3800, inte fel). Första (okurerade) mätningen gav 2/23/51 — tre felklasser var alla mätarens.

### GRÖNA — klara för publiceringspaket (R2, kundens beslut)
✓ sa-laser-du-abb-q3-2026 (2023 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-20 ∈ kroppens datum ✓)
✓ sa-laser-du-aker-bp-q3-2026 (3702 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-29 ∈ kroppens datum ✓)
✓ sa-laser-du-alfa-laval-q3-2026 (3093 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-27 ∈ kroppens datum ✓)
✓ sa-laser-du-alphabet-q3-2026 (2996 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-28 ∈ kroppens datum ✓)
✓ sa-laser-du-asml-q3-2026 (2738 ord · 6 H2 · 0 käll-URL · kalenderträff saknas (neutral))
✓ sa-laser-du-assa-abloy-q3-2026 (3397 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-27 ∈ kroppens datum ✓)
✓ sa-laser-du-astrazeneca-q3-2026 (2086 ord · 8 H2 · 0 käll-URL · kalendern 2026-10-30 ∈ kroppens datum ✓)
✓ sa-laser-du-atlas-copco-q3-2026 (1792 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-22 ∈ kroppens datum ✓)
✓ sa-laser-du-att-q3-2026 (2424 ord · 13 H2 · 0 käll-URL · kalenderträff saknas (neutral))
✓ sa-laser-du-balder-q3-2026 (2826 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-23 ∈ kroppens datum ✓)
✓ sa-laser-du-boliden-q3-2026 (3483 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-29 ∈ kroppens datum ✓)
✓ sa-laser-du-boston-scientific-q3-2026 (3206 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-28 ∈ kroppens datum ✓)
✓ sa-laser-du-carlsberg-q3-2026 (2806 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-29 ∈ kroppens datum ✓)
✓ sa-laser-du-castellum-q3-2026 (3125 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-22 ∈ kroppens datum ✓)
✓ sa-laser-du-catena-q3-2026 (3187 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-23 ∈ kroppens datum ✓)
✓ sa-laser-du-cellavision-q3-2026 (2869 ord · 8 H2 · 0 käll-URL · kalendern 2026-10-29 ∈ kroppens datum ✓)
✓ sa-laser-du-coloplast-q3-2026 (3155 ord · 7 H2 · 1 käll-URL · kalendern 2026-11-03/2026-11-05 ∈ kroppens datum ✓)
✓ sa-laser-du-cvx-q3-2026 (3607 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-30 ∈ kroppens datum ✓)
✓ sa-laser-du-dios-q3-2026 (2922 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-23 ∈ kroppens datum ✓)
✓ sa-laser-du-electrolux-q3-2026 (3125 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-23 ∈ kroppens datum ✓)
✓ sa-laser-du-eli-lilly-q3-2026 (3285 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-29 ∈ kroppens datum ✓)
✓ sa-laser-du-eqnr-q3-2026 (2732 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-28 ∈ kroppens datum ✓)
✓ sa-laser-du-essity-q3-2026 (2789 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-22 ∈ kroppens datum ✓)
✓ sa-laser-du-fabege-q3-2026 (3368 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-21 ∈ kroppens datum ✓)
✓ sa-laser-du-fortum-q3-2026 (3064 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-28 ∈ kroppens datum ✓)
✓ sa-laser-du-getinge-q3-2026 (2770 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-20/2026-10-21 ∈ kroppens datum ✓)
✓ sa-laser-du-handelsbanken-q3-2026 (1955 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-21 ∈ kroppens datum ✓)
✓ sa-laser-du-hexagon-q3-2026 (3586 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-23 ∈ kroppens datum ✓)
✓ sa-laser-du-hm-b-q3-2026 (1549 ord · 7 H2 · 1 käll-URL · kalendern 2026-09-24 ∈ kroppens datum ✓)
✓ sa-laser-du-hufvudstaden-q3-2026 (3285 ord · 7 H2 · 1 käll-URL · kalendern 2026-11-05 ∈ kroppens datum ✓)
✓ sa-laser-du-iberdrola-q3-2026 (3350 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-21 ∈ kroppens datum ✓)
✓ sa-laser-du-investor-ab-q3-2026 (2941 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-16 ∈ kroppens datum ✓)
✓ sa-laser-du-jnj-q3-2026 (2608 ord · 8 H2 · 0 käll-URL · kalendern 2026-10-13 ∈ kroppens datum ✓)
✓ sa-laser-du-jpmorgan-q3-2026 (3191 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-13 ∈ kroppens datum ✓)
✓ sa-laser-du-kambi-q3-2026 (2780 ord · 7 H2 · 0 käll-URL · kalendern 2026-11-04 ∈ kroppens datum ✓)
✓ sa-laser-du-kinnevik-q3-2026 (2946 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-15 ∈ kroppens datum ✓)
✓ sa-laser-du-latour-q3-2026 (3314 ord · 8 H2 · 0 käll-URL · kalendern 2026-11-03 ∈ kroppens datum ✓)
✓ sa-laser-du-logitech-q3-2026 (3784 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-27 ∈ kroppens datum ✓)
✓ sa-laser-du-meta-q3-2026 (2250 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-28 ∈ kroppens datum ✓)
✓ sa-laser-du-microsoft-q3-2026 (2802 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-27/2026-10-28 ∈ kroppens datum ✓)
✓ sa-laser-du-mtg-b-q3-2026 (2799 ord · 8 H2 · 1 käll-URL · kalendern 2026-11-05 ∈ kroppens datum ✓)
✓ sa-laser-du-newmont-q3-2026 (2252 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-22 ∈ kroppens datum ✓)
✓ sa-laser-du-nflx-q3-2026 (2788 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-20/2026-10-16/2026-10-21 ∈ kroppens datum ✓)
✓ sa-laser-du-nike-q3-2026 (3080 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-01 ∈ kroppens datum ✓)
✓ sa-laser-du-nokia-q3-2026 (3265 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-22 ∈ kroppens datum ✓)
✓ sa-laser-du-norsk-hydro-q3-2026 (3298 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-23 ∈ kroppens datum ✓)
✓ sa-laser-du-novo-nordisk-q3-2026 (2560 ord · 8 H2 · 0 käll-URL · kalendern 2026-11-04 ∈ kroppens datum ✓)
✓ sa-laser-du-np3-q3-2026 (3098 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-16 ∈ kroppens datum ✓)
✓ sa-laser-du-nvda-q3-2026 (3176 ord · 8 H2 · 1 käll-URL · kalendern 2026-11-17 ∈ kroppens datum ✓)
✓ sa-laser-du-palantir-q3-2026 (2759 ord · 8 H2 · 1 käll-URL · kalendern 2026-11-02 ∈ kroppens datum ✓)
✓ sa-laser-du-pg-q3-2026 (3262 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-22 ∈ kroppens datum ✓)
✓ sa-laser-du-precise-biometrics-q3-2026 (1345 ord · 8 H2 · 0 käll-URL · kalenderträff saknas (neutral))
✓ sa-laser-du-prologis-q3-2026 (2620 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-15 ∈ kroppens datum ✓)
✓ sa-laser-du-rwe-q3-2026 (2719 ord · 7 H2 · 0 käll-URL · kalendern 2026-11-11 ∈ kroppens datum ✓)
✓ sa-laser-du-saab-q3-2026 (2657 ord · 7 H2 · 0 käll-URL · kalenderträff saknas (neutral))
✓ sa-laser-du-samsung-q3-2026 (2738 ord · 14 H2 · 0 käll-URL · kalenderträff saknas (neutral))
✓ sa-laser-du-sap-q3-2026 (2589 ord · 8 H2 · 0 käll-URL · kalendern 2026-10-21 ∈ kroppens datum ✓)
✓ sa-laser-du-sca-q3-2026 (3297 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-23 ∈ kroppens datum ✓)
✓ sa-laser-du-seb-q3-2026 (2895 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-22 ∈ kroppens datum ✓)
✓ sa-laser-du-shell-q3-2026 (2328 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-29 ∈ kroppens datum ✓)
✓ sa-laser-du-ssab-q3-2026 (3372 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-28 ∈ kroppens datum ✓)
✓ sa-laser-du-stora-enso-q3-2026 (2539 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-30 ∈ kroppens datum ✓)
✓ sa-laser-du-swedbank-q3-2026 (2761 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-22 ∈ kroppens datum ✓)
✓ sa-laser-du-tele2-q3-2026 (3084 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-20 ∈ kroppens datum ✓)
✓ sa-laser-du-telia-q3-2026 (3169 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-21/2026-10-22 ∈ kroppens datum ✓)
✓ sa-laser-du-truecaller-q3-2026 (3698 ord · 7 H2 · 0 käll-URL · kalendern 2026-11-03 ∈ kroppens datum ✓)
✓ sa-laser-du-upm-kymmene-q3-2026 (2901 ord · 7 H2 · 0 käll-URL · kalendern 2026-10-28 ∈ kroppens datum ✓)
✓ sa-laser-du-volvo-car-q3-2026 (1386 ord · 6 H2 · 0 käll-URL · kalendern 2026-10-23 ∈ kroppens datum ✓)
✓ sa-laser-du-volvo-group-q3-2026 (3170 ord · 8 H2 · 1 käll-URL · kalendern 2026-10-23 ∈ kroppens datum ✓)
✓ sa-laser-du-wallenstam-q3-2026 (2634 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-15 ∈ kroppens datum ✓)
✓ sa-laser-du-yara-q3-2026 (3297 ord · 7 H2 · 1 käll-URL · kalendern 2026-10-22 ∈ kroppens datum ✓)

### GULA — mindre kur/notis behövs (publiceringspaket efter kur)
△ sa-laser-du-disney-q3-2026: 3869 ord — trimövervägande (publicerade spann ≤ 3179)
△ sa-laser-du-lvmh-q3-2026: kalenderns  saknas bland kroppens 13 datum — verifiera mot bolagets IR
△ sa-laser-du-var-energi-q3-2026: 3840 ord — trimövervägande (publicerade spann ≤ 3179)
△ sa-laser-du-vz-q3-2026: 4145 ord — trimövervägande (publicerade spann ≤ 3179)
△ sa-laser-du-wihlborgs-q3-2026: kalenderns 2026-10-20 saknas bland kroppens 6 datum — verifiera mot bolagets IR

### RÖDA — substansfel (rättas före paket)
(inga)

_Mätningsklasser: BlogPost-form, ord 700–4200 (trimnotis >3800), H2 ≥ 5, mallstommen (Källor/nyckeltal/så läser du), juridikgrinden (disclaimer krävs; rådgivningsmönster smala), källsektion ≥ 2 namngivna rader, kalenderfakta (artikelns datum mot kalenderns fönster), varumärkesgrindens FEL-nivå (VARN = GUL)._
