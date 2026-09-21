# o147 — SITEMAP-BYGGSANNING KOMPLEMENT: rapportakademin-grinden + dataset/aspekt-klassen + livskontraktet

**Våg:** SPÅR 8 s8-u2 (manifest auto-s8-1790006726228, vakt 2/3), 2026-09-21 18:16–19:0x lokal.
**Granne:** o146 (s8-u3, publiceringskontraktet) — samma rotorsak, bolagsgrenen; detta protokoll är det disjunkta komplementet.
**KVD:** tsc 0 projektbinär (kördes 18:4x, efter både agents ändringar i trädet) · svit 10/10 enhet + live FÖRE-facit · INGET bygge (prod-synkens ägo) · R2 orörd · data/blogg orörd.

## 1. FYNDET (gränsnittsvakten 11:30Z: 28 fel → två klasser)

- **24 ÄKTA kundsynliga fynd** = 6 bolagssidor × 4 kombinationer (tema×skärm):
  /bolag/{ai-pa, dsy-pa, cap-pa, barc-l, nwg-l, lloy-l} ⇒ 404. o146:s yta.
- **4 by-design-fynd** = /studio × 4: GET /api/studio/stream ⇒ 401 för vaktens
  ANONYMA webbläsare. **DÖMNING: korrekt svar** — slutpunkten är kundens privata
  chattyta och SKALL avvisa anonyma (den som läcker den läcker tråden). Ingen
  kodändring i kundens huvudyta från vakt-håll; o146 §7 bokför notisen.
- 09:02Z-svepets /rapportakademin ⇒ 404 = samma stale-byggs-klass som §2
  (sidan finns i HEAD men ej i det körande bygget).

## 2. ROTORSAKSKEDJAN (bevisad mot prod, 2026-09-21)

1. Senaste GRÖNA deploy = d401d719, byggt 02:12Z (243 bolagssidor; ingen
   rapportakademin.html — verifierat .next/server/app-inventering).
2. KORREKTA dataleveranser därefter (data-doktrinen, inget bygge krävs):
   AI.PA 09:30Z (ad6883a9) · DSY+CAP+BARC+LLOY+NWG 09:38Z (00a8db01) ⇒
   bolagsunivers.json 249 rader. Rapportakademin-sidan + dess sitemap-
   inbjudan föddes rond 130 (ea754110 03:02Z, inbjudan 54baa3d7 03:16Z).
3. Prod-synkens 15:07Z-bygge OOM-dödades ⇒ ".next ÅTERSTÄLLD ur läkebackup"
   (prod-synk.log 15:14:24Z) = 02:12Z-läget; pm2 startad om 15:41Z på läket.
4. sitemap.xml är force-dynamisk och läser universumfilen LIVE (249 URL:er
   + hårdkodade poster) ⇒ annonserade 6 sidor det körande bygget saknar.
   **KLASSFEL: "sitemap lovar mer än bygget levererar"** — varje dataappend
   eller nya byggsida under ett bygg-eftersläpningsfönster (OOM-läkecykler
   förlänger fönstret obegränsat) blir ett annonserat dött löfte
   (Search Console-risk + kundklickbar 404).
5. PRECISION: /rapportakademin annonseras INTE av det körande bygget (dess
   inbjudan är odeployad kod; 0 träffar i live sitemap.xml på localhost och
   prod) — de sex bolags-URL:erna var dagens ENDA liveannonserade döda löften.
   /dataset-klasserna: 227 annonserade URL:er, ALLA byggda (0 fel) — latent
   klass, ej aktiv: nästa bransch/aspekt som passerar matta via dataappend
   under ett stale-byggs-fönster skulle träffa den.

## 3. KUREN (o147-delarna; bolagsgrenen är o146:s)

- **src/lib/sitemap-byggsanning.ts (ny, 74 r):** `byggdSidaFinns(relSokvag)`
  — ETT existsSync mot `.next/server/app/<sökväg>.html` = byggets EGNA
  nedteckning av vad det kan leverera. Sentinel (`.next/BUILD_ID` + app-mapp)
  saknas ⇒ **fail-open** (reklamera som före o147): dev, ren klon och sondfel
  kan ALDRIG tyst gallra sitemapen. Endast konstaterat "bygget saknar sidan"
  håller URL:en tillbaka — nästa gröna bygge släpper in den automatiskt.
  Me kanism-komplement till o146:s ledger: ledgern kräver byggkrok
  (generateStaticParams-ägare); .next-sonden kräver inget och täcker sidor
  utan sådan ägare (rapportakademin).
- **src/app/sitemap.ts (o147-grenar):** (a) /rapportakademin-posten blir
  villkorad (`byggdSidaFinns("rapportakademin")`) — PROFYLAX: när rond-130:s
  inbjudan deployar kan den aldrig annonsera sidan under ett stale-byggs-
  fönster; (b) dataset-bransch (sv/en/ar) + dataset-aspekt-grenarna får
  samma grind — stänger o146 §7:s bokförda "latent klass /dataset-bransch".
- **verktyg/testa-sitemap-livskontrakt.mjs (ny):** DEL A enhetsinvarianter —
  A1 konsistens (sond ≡ .next-fakta, 9 prover: gamla ytor true, gap-sidor
  false, skräpslug false) + A2 fail-open (barnprocess utan bygginformation ⇒
  true). DEL B livekontrakt — ALLA sitemap-annonserade URL:er i de byggfrusna
  klasserna HTTP-probas mot BAS (localhost — loopback-whitelistad; svitens
  FÖRSTA version probade sitemap:ns absoluta prod-URL:er rakt genom nginx
  och falskgrönades av 429:or; KUR: ursprungsmappning till BAS + 429-omprov
  + "oprovad"-kategori + exit 2 om >10 % oprovade — sviten mäter SIDORNA,
  inte rategrinden).

## 4. BEVIS

- tsc 0 projektbinär (efter o146+o147 gemensamt i trädet).
- Svitens FÖRE-facit (läkebygget, 2026-09-21 ~18:5x lokal):
  A1 9/9 PASS · A2 PASS · live 476 URL:er provade, **exakt 6 FEL = de sex
  bolagssidorna**, 0 varningar, 0 oprovade · per klass: bransch 10/0 ·
  spegel 20/0 · aspekt 197/0 · bolag 249/6 · rapportakademin 0 annonserade
  (körande bygget saknar inbjudan — väntat). Rapport:
  data/vakten/sitemap-livskontrakt-SENASTE.json (gitignorerad per konvention).
- RIDNING o18: u3:s commit 98219b5f (18:25:14) bär mina src-ändringar
  (sitemap-grendar + hela sitemap-byggsanning.ts) med creditering i
  meddelandet — sanktionerad av min notis 18:3x; denna commit lägger svit +
  protokoll + worklog ovanpå. Disk-först-tvisten (deras anspråk 18:15:58,
  mitt 18:16:37) dokumenterad i data/vakten/*o147*-anspråket.

## 5. EFTER-VERIFIERING (rids nästa gröna bygge)

När prod-synken får igenom ett grönt bygge på HEAD (o146+o147 i trädet):
1. `node verktyg/_s8u3o146-bolag-sond.mjs` ⇒ GRÖN (o146:s kvitto).
2. `node verktyg/testa-sitemap-livskontrakt.mjs` ⇒ **0 FEL** — kontraktet:
   sitemap annonserar aldrig en URL tjänsten 404:ar på; de sex bolags-
   sidorna + rapportakademin har då .html och bygg-ledgern är skriven.
3. Gränsnittsvaktens nästa 6-timmarssvep: bolag-404-klassen borta
   (24 fynd → 0 i klassen; /studio-401 kvarstår = dömd by-design §1).

## 6. KVAR (bokförd kö, ej detta pass)

- o146 §7: "100 bolag"-metadata föråldrad (VÅG 149-kommentarer säger 100,
  universumet 249) — kosmetisk teknisk skuld i kommentarer/marknadsytor.
- Feljakt-ledgerns F1-dom (o141:s köpost) — u1:s o145-ledgerarbete gränssnitt.
- Svitens(prod-URL)-läxa generaliserad: verktyg som probar mot prod-domänen
  BÖR mappa ursprung till localhost när servern är samma maskin.

## 7. REDISPATCH-COMPLETTERING (samma agent-id, 2026-09-21 18:2x–18:3x lokal)

Sessionen dog före commit; redispatchen (samma s8-u2) stängde kontraktet —
detta är den commit som levererar svit + protokoll + worklog som o146:s
ridningsmeddelande (98219b5f) lovade. Tre kompletterande bevis:

1. **OBEROENDE DUBBELKÖRNING av sviten** (16:29:25Z, ts = skriptstart;
   runtime 76 s → rapport skriven 16:30:41Z): A1 9/9 PASS · A2 PASS ·
   2 627 annonserade / 476 byggfrusna probade / **exakt 6 FEL** (samma sex
   bolag) / 0 varningar / 0 oprovade / per klass: bransch 10/0 · spegel 20/0
   · aspekt 197/0 · bolag 249/6 — identisk med §4:s facit. (Tidigare
   16:24:14Z-körningen med äldre verktygsversion gav samma 6 FEL med
   datasetklasserna osplittrade 227/0 — två versioner, samma dom.)
2. **Merge-base-beviset för §2:5-PRECISIONen**:
   `git merge-base --is-ancestor 54baa3d7 d401d719` ⇒ NEJ — rond 130:s
   /rapportakademin-inbjudan har strukturellt ALDRIG kunnat annonseras av
   körande prod (deploy-trädet föregår inbjudan); 09:02Z:s 404-fynd kom via
   gränsnittsvaktens sidmätning. Grindens roll förblir profylax för NÄSTA
   bygge (där inbjudan + rutt finally deployas tillsammans).
3. **Reservation**: o147 poster #28 i data/vakten/protokollnummer.json
   (ägare s8-u2, detta manifest) — protokollnummerserien sluten.

KVD redispatchen: tsc 0 (friskt, 16:3xZ) · duplikatprotokoll som skrevs
av redispatchen innan worklog-raden hittades = RADERAT odelevererat (o147
levererar ENDELIGT det kanoniska namnet ovan) · engångsverktyg
(_s8u2o147-reservera.mjs) städade · R2 orörd · data/blogg orörd ·
syskonagenters ytor orörda (u1:s olevererade filer lämnas åt deras commit).
