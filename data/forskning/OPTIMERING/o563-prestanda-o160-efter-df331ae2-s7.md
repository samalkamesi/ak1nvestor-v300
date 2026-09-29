# O563 — SPÅR 7 PRESTANDA: o160 §7:S STRUKTUR-EFTER-KVITTERING AV DEPLOyen df331ae2 (171 commits) + o556 §6.1-OMSTAND, SOM AUTONOM EFTERVAKT (s7-u3, 2026-09-29)

Fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1790673915240).
Uppgiftstext: "mät före/efter (Lighthouse), deploy, prod 200, mätning
bokförd". Anspråk disk-först FÖRE all ändring
(data/vakten/auto-s7-1790673915240-s7-u3-ansprak.md 09:35Z); nummer
o563 i poolen under flock (o561 = s8-u2, o562 = syskonet s7-u1:s
natt-TBT-referensserie — lästa FÖRE val, disjunkta ytor).

## §0 Nummerkontroll

Högsta i poolen vid tag: o562 (s7-u1, samma manifests syskon). Nästa
lediga = o563 (o561 var taget av s8-u2 sedan 09-28 20:18Z). Katalogen
ren: 0 o563-filer före detta protokoll.

## §1 Val (duplikatkontroll klar) + den ärliga förlusten

Spårets stängda ytor oförändrade sedan o556/o557/o558-rundan
(worklog 18530/18538): bildoptimering (o66/o101), cache-headers
(o10/o13/o66/o70 + migreringsrondens GRÖN ×4), koddelning (o27/o119/
o121 + prefetch-kuren beed9f7d i VÄNTANDE träd), 52px-familjen,
CV/CLS-familjen, dataset-CLS, natt-TBT (o562 = u1:s nya referensserie).

Öppna poster vid valet:
1. **o160 §7** — "strukturkvitto av KOMMANDE deploy … särskilt om den
   bär fler src-ändringar": u1:o556:s eftervakt (avsedd att stänga den)
   dog 2026-09-29 01:07:19Z "tidsgräns utan tyst fönster" (status.json
   bevisar), §6.1-omstartskö orörd (888f7bc5). **MITT OBJEKT.**
2. o558 §7-omstand — rondägd sedan r317 (e17795e9), lämnad orörd.

**Läget som gjorde valet tvingande:** prod-synken står med
"NY KOD: 22df62aa → df331ae2" och VÄNTAR-FABRIK (V235-sekvens, väntat
29/30 min vid 09:27Z) — deployen av **171 commits (47 src-filer,
+3 343 rader)** är IMMINENT: AI-MENTORN:s fyra slutstensmoduler med
widget-wiring i src/lib, prefetch-kuren (27 tunga Links), v178/v179-UI,
ordlista/seo-tillägg — ALDRIG prestandamätta i prod (senast mätta träd
= a2c9d663 2026-09-24, o160).

**22df62aa-isolerad EFTER-mätning är oåterkalleligt förlorad**: kanalen
bär df331ae2-trädet så snart deployen landar; o556:s vakt fanns för det
isolatet och dog utan tyst fönster (chrome-svep + nattlast); ett nytt
kontant försök NU bröt mot spårregeln (chrome 55, load1 6,5 = pågående
svep — ALDRIG Lighthouse under vaktsvep). Bokförs öppet: df331ae2-
mätningen är SUPERMÄNGDEN (22df62aa ⊂ df331ae2, merge-base) och
strukturdomen jämför mot a2c9d663-FÖRE (o160 §3-tabellen) — de 14
mellankommitsarna kan inte separeras från de 171, vilket protokollet
bär som osäkerhetsnot, inte döljer.

## §2 FÖRE (lastokänsliga strukturtal — o160 §3, a2c9d663)

| Sida         | Requests | totalByteWeight | CLS | (CPU-ref P/LCP/TBT, laststämplad) |
|--------------|----------|-----------------|-----|-----------------------------------|
| /            | jungfrulig | jungfrulig     | 0-familj | P60 / 5025 / 932 (o110-efterB) |
| /superanalys | 30       | 495 087 B       | 0   | P68 / 2261 / 2914                 |
| /kalkylator  | 34       | 582 161 B       | 0   | P48 / 5037 / 6425                 |
| /konfluens   | 30       | 497 721 B       | 0   | P51 / 5145 / 3540                 |
| /kurser      | 30       | 534 342 B       | 0   | P53 / 4585 / 3095                 |

## §3 Kuren — eftervakten som fristående organism

`verktyg/_s7u3o563-eftervakt.mjs` (o165/o556-fotspåret; setsid nohup,
överlever agentronden; 6 h tak; logg → data/vakten/o563-eftervakt/):

1. **vanta-deploy** — poll 60 s av prod-synk.loggens "DEPLOYAD
   automatiskt: N commits (hash)"; krav: df331ae2 är anfader till (eller
   lika med) deployad hash via `git merge-base --is-ancestor` — vakten
   mäter ALDRIG ett träd som saknar uppdragets 171 commits.
2. **vanta-fonster** — ×2 stabila poller à 60 s: load1 < 3,0 ·
   chrome-linux64 < 20 · RAM ≥ 1 500 MB · prod 200. Spårregeln bärs
   mekaniskt: inget Lighthouse-under-svep, inget Chrome-på-CPU-flick.
3. **värme ×2** → **mät** — kanoniska verktyg/prestanda-lighthouse.mjs
   OFÖRÄNDRAT i ETT anrop ×5 sidor, CHROME_PATH = puppeteer-cachens
   Chrome-for-Testing 154 (nya SSD Nodes-servern saknar system-Chrome —
   o556/o558:s rotkur), retry ×3 omgångar, färskhetskontroll 20 min.
4. **dom** → lighthouse/o563-eftervakt-dom.json:
   - STRUKTUR (lastokänsligt, dom-bar alltid): ΔtotalByteWeight ≤ +3 %
     och Δrequests ≤ +3 mot o160-tabellen (de fyra; / bokförs som
     jungfruligt strukturvärde — ingen falsk jämförelse).
   - CLS 0 ×5 heligt (o100) — brott ⇒ RÖD.
   - LCP ±15 % ⇒ GRÖN; utanför ⇒ GUL med laststämpel-not (omdom vid
     nästa tysta fönster).
   - TBT = dagtidsFAKTA (nattcronen 03:27 äger slutdomen, o158 §6;
     Contabo↔SSD-TBT ej jämförbara — o558:s metrologiregel: referenserna
     i §2 är Contabo-tal, TBT-jämförelse över migreringen ogiltig).
   - Idempotent (dom ⇒ exit 0) · single-instans (pid-lås, stöld >7 h) ·
     exit 2 vid tidsgräns (omstartbar) · tidsgräns-utan-deploy är egen
     status.

## §4 Verifiering

- `node --check`: GRÖNT.
- Kortbudgetskörning (O563_TAK_TIMMAR=0,003 ≈ 11 s): läste senaste
  DEPLOYAD (22df62aa), körde anfaderkontrollen korrekt (df331ae2 Är
  ICKE-anfader till 22df62aa ⇒ "vantar-deploy" — falska sidan bevisad),
  avslutade med tidsgräns-exit 2 och städade pid-låset (o165:s
  läxfälla kurerad från födseln; omtest-låsning bevisad).
- Den sanna anfadarsidan är bevisad i git: df331ae2 är HEAD i trädet
  prod-synken bygger från (dess DEPLOYAD-hash kommer bli ättling till
  eller lika med df331ae2 — supermängds-logiken §1).

## §5 KVD

- R2 orörd (priser/tier/publicering) · data/blogg/ (live) orörd ·
  data/blogg-utkast/ orörd · src/ orörd (INGET bygge — deployen ägs av
  prod-synken; ALDRIG npm ci/install/build).
- tsc: src orörd — baslinjen bärs av pre-commit-grinden.
- Syskonytor orörda: u1:o556:s döda vaktyta + o562:s referensserie-yta
  enbart lästa; u2:s yta (o557-rapportfamiljen) orörd; o558:s
  rondägda omstand orörd; vaktposter från tidigare vågar orörda.
- Kanoniska instrumentet (prestanda-lighthouse.mjs) körs av vakten,
  ej ändrat.
- Mätning mot loopback (whitelistat); RAM-tak 1 500 MB före varje
  Chrome-fas.

## §6 Kö vidare

1. När vakten domar (status "klar"): adoptera dom-JSON + de fem
   <sida>-o563-efter.json + o563-efter-sammanfattning.json; boka facit
   här + worklog. **GRÖN ⇒ o160 §7 SLUTSTÄNGT + o556 §6.1:omstand
   fullbordat** (supermängds-noten §1 följer med).
2. Tidsgräns utan deploy/fönster (6 h): omstarta vakten (samma
   kommando) — alla kontrakt består i verktyget.
3. RÖD (CLS-brott): eskalering enligt spårets mönster + rotanalys i
   nästa våg; struktur-GUL (Δbyte > +3 % utan CLS-brott): chunk-hash-
   jämförelse enligt o160 §5-metoden (hash-churn vs verklig tillväxt).
4. u1:o562:s natt-TBT-referensserie (o558 §) äger TBT-slutdomen vid
   nästa tysta nattfönster.

## Verktyg och rådata

- verktyg/_s7u3o563-eftervakt.mjs (organismen).
- Runtime: data/vakten/o563-eftervakt/{status.json,drift.log}
  (gitignorerade). Anspråk: data/vakten/auto-s7-1790673915240-s7-u3-
  ansprak.md. Poolrad: o563 (flock-reserverad).
- Väntade mätdata: lighthouse/{start,superanalys,kalkylator,konfluens,
  kurser}-o563-efter.json + o563-efter-sammanfattning.json +
  o563-eftervakt-dom.json.
- FÖRE-referens: o160-efter-tabellen (a2c9d663) + o110-efterB (/).
