# o557 — Prestandavåg: rapportbyggarfamiljens jungfrumark (s7-u2, manifest auto-s7-1790617526300)

Datum: 2026-09-28 · Byggare 2/3 · Server: ssdnodes-6ab9b334e519a (nya prod, v190)

## §0 — VAL och duplikatkontroll

Anspråk disk-först FÖRE all mätning: `data/vakten/auto-s7-1790617526300-s7-u2-ansprak.md`
+ o557 reserverat i protokollnummerpoolen. Duplikatkontroll före val:

- **KOLLISION UNDVEKEN**: syskonet s7-u1 i samma manifest reserverade o556
  (ts 1790617855479) = struktur-EFTER-kvitto av deploy 22df62aa på REDAN mätta
  verktygssidor. Mitt valda objekt är disjunkt: **/rapporter + /rapportakademin —
  rapportbyggarfamiljen (E40, född 09-02/05) och kunduppdragets yta (09-21) har
  0 Lighthouse-filer i arkivet** (ls-bevis: inga rapporter-*/rapportakademin-*
  prefix i OPTIMERING/lighthouse/).
- Spårets klassiker stängda sedan länge: bildoptimering o66/o101 · cache o10/o13/
  o66/o70 · koddelning o27/o119/o121 · 52px o8+o123+o137 · CV-widget o139/o144 ·
  dataset-CLS o143/o144 · blogg-CV o129/o138 · ar o150 · natt-TBT o151/o155/o158
  (cron 03:27 äger) · v186 ISR-varmare · v182 nolldowntime.

## §1 — Kanal (läst före mätning)

- Prod-träd = **22df62aa** (DEPLOYAD 2026-09-28T11:52:29Z, .next/BUILD_ID-mtime
  11:40, loopback 200 ×6). fc545155 (HEAD vid mätning) ÄR INTE deployad;
  16:57:30Z-bygget från 4f64779f avbröts 17:40:28Z av buntslagsrace (trädet
  flyttades) — spökmät-disciplin uppfylld: mätning endast mot bevisad kanal.
- **Instrumentfynd (SSD Nodes)**: chrome-launcher hittar ingen Chrome — nya
  serverns Chrome-for-Testing 154 bor i `~/.cache/puppeteer` (r283). Kräver
  `CHROME_PATH` + LD_LIBRARY_PATH (~/.chrome-libs). Cron-wrapparnas AK1A_CHROME-
  resolver har lösningen; prestanda-lighthouse.mjs saknar den (köpost).

## §2 — Jungfrumark FÖRE (kanoniska verktyget, mobil 4G)

| Sida | Poäng | FCP | LCP | TBT | CLS | TTI | SI | Struktur |
|---|---|---|---|---|---|---|---|---|
| /rapporter (omg 1) | **34** | 1 637 | 9 724 | **34 487** | **0** | 39 319 | 24 833 | 31 req · 525 KiB |
| /rapporter (omg 2) | **35** | — | 8 561 | **33 171** | **0** | — | — | — |
| /rapportakademin | ETIMEDOUT ×2 (180 s) — se lastlära nedan |

Auditer omg 1: bootup-time **15,2 s** · mainthread-work **52,4 s** ·
unused-javascript 416 KiB (förklaras i §3) · total-byte-weight grön.

**LASTLÄRA (metrologiregeln o143 §3, ärligt bokförd)**: fönstret bar
loadavg1 7–49 (kulmen 18:12–18:13Z) pga (a) syskonet u1:s PÅGÅENDE
Lighthouse-kedja (npm exec lighthouse + chrome-familjer) och (b) 21
orphan-Chrome-träd (städade, §6). I omgång 2:s parade fönster timeout:ade
ÄVEN /kurser (kontrollsida) = ETIMEDOUT är miljöartefakt, inte sidkod.
/rapporter-värdena är laststämplade referenser; TBT-slutdom kräver tyst
fönster (vakarövertag §8). CLS 0 ×2 är lastoberoende och heligt hållet.

## §3 — Rotspår (bevisat mot deployade chunks)

1. **Huvudchunken 2d0lzhci7o3-h.js: 229 KB rå / 70 KiB transfer — 12 373 ms
   scripting** (bootup-detalj). O160-epokens huvudchunk (2feezv-iveko5.js)
   var 72 010 B och filhash-stabil genom tre deployer = **+218 % tillväxt**
   sedan 09-24 (kandidater: s6 AI-mentor-flottan i klientbunten, desk,
   fas-sync). Laddas av ALLA sidor (HTML-bevis ×5) — global exekveringsbörd,
   inte /rapporter-specifik. Par kontroll avbröts av lasten → §8.
2. **41n3ihu_gg2zl.js: 1,35 MB rå / 428 KiB transfer, 369 KiB "unused"** =
   Link-PREFETCH av /superanalys + /konfluens (tom-lägets CTA-länkar):
   chunken innehåller motorbiblioteken (grep-bevis: monte ×17 · kelly ×6 ·
   SAM-vikt ×7 · bayes ×8 · fibonacci ×11 · elliott ×5 · ekosystem ×18),
   exekveras ALDRIG (saknas i bootup-listan) men kostar 428 KiB transfer i
   mobil-mätning. Kur-kandidat: prefetch={false} på tom-lägets länkar =
   produktnivå-beslut → bokas, ej autonomt.

## §4 — Kur (src via Edit, tsc 0)

`src/components/ak1a/rapportbyggare.tsx` — tom-lägets två CTA-knappar
(Till Superanalysen / Till Konfluensradarn) `min-h-[44px]` → `min-h-[52px]`
(tappsond-fynd 186×44/202×44, o123-andan: 52px-klasser). tsc 0 · INGET
bygge (prod-synken äger deployen).

## §5 — 52px-tappsond (o557-sonden, 390×844, o8/o122-kontraktet)

| Sida | Interaktiva | Under 52 | Input-zoom (font<16) |
|---|---|---|---|
| /rapporter | 45 | 8 | 0 |
| /rapportakademin | 50 | 8 | 0 |

- 6/8 = footer-inline-textlänkar (Integritetspolicy, Villkor, cookiepolicyn,
  integritetspolicyn, Transparens & GDPR, Finansiell policy) — WCAG 2.5.8-
  undantagsklassen, policy-grön enligt o159-precedensen.
- 2/8 på /rapporter = CTA-knapparna → KURADE (§4).
- /rapportakademin: 2 × input 294×36 font 16 = RESTPOST (input-ytans höjd är
  design-yta; zoom-fri, Android-48 nära — lämnad åt mobilpolish-rond).

## §6 — Orphan-Chrome-städning (o139-precedensen)

Väntarens lastsond fångade load1 upp till 48,9 med 95+ chrome-processer.
Kartläggning (`_s7u2o557-orphanstad.mjs`): 21 chrome-HUVUDprocesser med
död ägare (PPID=1/systemd) SIGTERM:ades efter bevis; **zdesk-browsern
(v198-D4, kundens OAuth-fönster via xdg-open) identifierades som AKTIV och
lämnades orörd**. Effekt: load1 44,9 → ~3 · chrome-processer 95+ → 14.
Not: bland orphanerna fanns troligen chrome från AVSLUTADE mätningar hos
båda syskonen (kan ej skiljas — redovisat öppet).

## §7 — Instrumentnotis

`verktyg/mobil-lasbarhet.mjs` hardcodar `/usr/bin/google-chrome` (Contabo).
Kirurgisk edit (Chrome-uppslag AK1A_CHROME→cache→systemväg) skrevs och
syntax-verifierades, men **skrevs över av extern process under vågen**
(filens spawn-rad var original vid senaste kontroll) — därför levererar
denna våg namnrymd-säker kopia `_s7u2o557-tappsond.mjs` med identisk
mätsemantik + SSD Nodes-uppslag. Köpost: resolver i originalverktyget
(cron-sårbarhet på nya servern), ägs av nästa våg.

## §8 — Vakarövertag (nästa våg, exakta steg)

FÖRUTSÄTTNING: u1:s mätkedja tyst + load1 < 3 + CHROME_PATH/LD_LIBRARY_PATH
exporterade (se §1).
1. Paradjämförelse: `node verktyg/prestanda-lighthouse.mjs o557-para
   /kurser /rapporter` i SAMMA fönster — domar huvudchunk-exekveringens
   andel (§3.1) med /kurser som Contabo-bekant kontroll.
2. Kur-EFTER: tapsond omgång 2 (CTA-knapparna 52×2) — gäller först när
   deployad (DEPLOYAD-merge-base + serverad klass-kontroll).
3. /rapportakademin solo-LH (jungfrumark saknas fortfarande).
4. TBT-slutdom /rapporter lämnas ÄRLIGT till natt-fönstret (metrologi) —
   vid behov natt-cronens metodik.

## KVD

src/ rörd EN gång via Edit (1 fil, 2 klass-byte) · tsc 0 projektbinär ·
INGET bygge · R2 orörd · data/blogg/ orörd · syskonytor orörda (u1:s
PÅGÅENDE mätningar lämnades, deras o556-yta orörd; u3 utan anspråk) ·
poolreservation under flock · commit med -F + explicit pathspec ·
mätdata på disk före dom (spökmät-skyddet: kanalidentitet bevisad §1).
