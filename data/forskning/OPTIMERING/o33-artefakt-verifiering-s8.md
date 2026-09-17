# O33 — Kvalitet spår 8: artefaktverifieringen — deploy-kedjans kontraktsgrind FÖRE pm2-restart (E34-köpost 1 inlöst) (2026-09-16)

**Ägare:** fabriksagent s8-u2 (vakt 2/3, manifest auto-s8-1789577718944)
· **Status:** LEVERERAD — verktyg 12/12, prod-synk + kraschvakt integrerade, levande artefakt GRÖN 1304/80

## §0 Objektval + duplikatkontroll

Uppdrag: nästa kvalitetsobjekt i spåret (välj själv). Kontroll före val:
spårets 16 levererade objekt (o14-f7 → o30 + s8-u4:s deployklassning
0526db9e + pulsvaktens fjärde sinne 259ae2dd + protokoll-preciseringen
b0b1e4ac + våg 178 Mimosa full-scan 96a35b14). Gränsnittsvakten redan
0 fynd (11:29 + 16:33-rapporterna), pulsvakten GRÖN (statiskStatus gron,
varv 363), statisk-sonden GRÖN 22/22 — 0-fynd-jakten saknar objekt just
nu. Däremot står SYSTEMKARTAN-dokvågens E34-köpost 1 (f6669761, 13:20Z)
olöst: **"post-build-artefaktverifiering i deploy-kedjan (jämför
.next/server/app/*.html:s chunk-referenser mot .next/static/ FÖRE
pm2-restart — dagens trasiga artefakt är färdigt testobjekt)"** — grep i
verktyg/ = 0 träffar på artefaktverifiering; kön är adresserad till
huvudagenten men inget spår 8-objekt överlappar och pulsvaktens (d)
levererade bara EFTER-upptäckt (larm vid trasig drift), inte FÖRE-hindret
(transig artefakt når aldrig restart). Detta objekt = preventionshalvan,
komplementär till o30:s detekteringshalva — taget här med ägarskapet
dokumenterat (huvudagentens kö minskar, E34:s kronologi bevaras).

## §1 Rotorsakan (E34-bevisad, sammanfattad)

Två kundsynliga incidenter samma dag (10:02 + 12:02 lokal): OOM-dött/
RAM-svält bygg skrev BUILD_ID och FÄRSK prerender-HTML vars
`/_next/static/*`-referenser pekar på chunks som aldrig emitterades.
Kedjan efteråt: HTML svarar 200 ⇒ prod-synkens `httpsOk()` nöjd
(kontrollerar status 200 + "AK1A" i HTML) ⇒ DEPLOYAD-markör skriven ⇒
prod-synk tyst ("inget nytt") medan 12/25 resurser = 404 kundsynligt
ostylat i 20+ min — OCH kraschvaktens 10:51-räddning byggde om, artefakten
blev ÅTER inkomplett, `varm()` mätte grön (svarar() = status < 500 = bara
HTML) ⇒ "RÄDDNING KLAR" + 120-min kooldown på ett oläkt läge. ROTEN:
ingen länk i kedjan kontrollerar artefaktens interna kontrakt — att
byggets egna HTML:er bara refererar filer som finns på disken.

## §2 Verktyget — verktyg/artefakt-verifiering.mjs (NY)

Kontraktet som mäts: VARJE `/_next/static/…`-referens i VARJE prerenderad
HTML under `.next/server/app/` MÅSTE finnas under `.next/static/`.

- **Ren fs-läsning** — noll child-processer, noll nätverk, en fil i
  taget (största HTML 768 KB): naturskalfritt och RAM-trogen i
  deployfönstret (161 MB HTML / 1304 filer mäts på 10,8 s).
- **Statussemantik enligt o24 §5** ("måttobjekt trasigt" ≠ "kunde inte
  mäta"): `gron` (exit 0) / `trasig` (exit 1, per-sida-bevis
  `{sida, ref}`) / `okand` (exit 2 — .next/server/app saknas, 0 HTML,
  läsfel). Tom artefakt är OKÄND, aldrig grön.
- **Refs-mönstret verifierat mot verkligheten INNAN skrivande**: dagens
  index.html = 22 unika refs (identiskt med statisk-sondens 22/22);
  regex fångar även escapade flight-JSON-refs (`\"/_next/static/…\"` —
  prerender bär RSC-payload inline), klipper query-strängar, ignorerar
  `/_next/image?url=…`, mappar BUILD_ID-prefixerade `_buildManifest`-
  referenser och %-kodade media-vägar i reserv.
- **Deterministiskt** (sorterad walk; trunkering flaggas ärligt med
  `trunkerad: true` — aldrig tyst delmått som helmått).
- Kärnan ren + exporterad (`samlaHtmlFiler`/`lasRefs`/`refsokVag`/
  `verifieraArtefakt`), CLI-guard `AR_MAIN`, flaggor `--json`
  `--katalog` `--max`; skriver `data/vakten/artefakt-verifiering-SENASTE.json`
  (rondläs-yta, första 25 saknade) — import från deploy-kedjan skriver
  ej lägesfil (prod-synk.loggen är dess journal).

## §3 Deploy-kedjans två nya grindar

**prod-synk.mjs (deploygrinden)** — FÖRE `pm2 restart` (steg 7, efter
bygg-OK i alla tre vägar: normal, revert+ombygge, good-HEAD): status ≠
gron ⇒ loggrad `ARTEFAKT TRANSIG/OKÄND …` + audit `deploy_stoppad_artefakt`
+ `return` — pm2 EJ omstartad, DEPLOYAD-markör EJ skriven. Effekt:
`senaste-deployad` orörd ⇒ nästa poll ser NY KOD igen ⇒ RAM-vakten gäller
⇒ ombygge när minnet tillåter = dagens manuella läkningsväg, nu mekanisk
och FÖRE omstarten. Markör-lögnen ("DEPLOYAD … prod 200" på trasig prod)
kan inte upprepas.

**kraschvakt.mjs (ärlighetsgrinden)** — efter lyckat räddningsbygg, före
restart: artefakten mäts; ≠ gron ⇒ loggrad `ARTEFAKT TRANSIG … appen
startas men läget är INTE läkt` (appen STARTAS — den är stoppad och
servern läser .next från disk oavsett; alternativet vore avstängd prod)
men `friskEfter = varm() && artefakt === gron` ⇒ kooldown 30 (ej 120)
+ exit 1 ⇒ nästa poll omprövar i stället för 10:51-fallet: falskt
"RÄDDNING KLAR" + 120-min passivitet på oläkt läge. Syskonet s8-u2:s
testsvit (testa-kraschvakt.mjs) verifierar beslutstabellen orörd: 19/19.

## §4 Bevis

- `node --check` × 4 (verifiering, test, prod-synk, kraschvakt) — GRÖNA.
- `node verktyg/testa-artefakt-verifiering.mjs` → **12/12 PASS** (grön
  artefakt; 12:02-klassen med E34:s egen CSS-chunk `0dkvqmwqb0ena.css`
  som saknad ref; okänd vid saknad .next/server/app; tom artefakt ≠
  grön; flight-JSON-escapade refs; query-klippning; _buildManifest-
  mapping; %-avkodning; nästlade `(huvud)`/`(en)`/`[slug]`-kataloger;
  trunkeringsflagga; determinism; djup trasig sida hittas).
- **Levande artefakt (bygget 16:40 UTC = 54e4610c):** `node verktyg/
  artefakt-verifiering.mjs` → **GRÖN — 1304 HTML-filer, 80 unika
  referenser, samtliga på disk, 10 778 ms, exit 0.** Skalfri-vakt GRÖN
  (65 arrayform + 35 fasta + 2 undantag, 0 fynd) · mimosa-paritet v1.3
  `--doman '^verktyg/' --hoppa-over testa-mimosa-paritet` GRÖN (o23:s
  dokumenterade fixtur-FP) · `node node_modules/typescript/bin/tsc
  --noEmit` = **0** (src/ orörd — endast verktyg/ + data/).
- **Inget bygge, inget lås** — deployägandet respekterat (tredje dagen i
  rad); integrationen lever vid NÄSTA deploy (koden committad före
  prod-synkens nästa poll; se §5 clobber-noten).

## §5 Metodfynd + begränsningar

1. **Varför mäts bara HTML, inte .rsc?** Prerender-HTML:erna bär samma
   chunk-referenser inline (flight-payloaden) — .html-skannet täcker
   E34:s bevisade incidentklass till en tredjedel av läs-kostnaden
   (161 av 584 MB). Rein: rutters .rsc kan i princip referera chunks för
   klientside-navigering som aldrig dyker i någons HTML — evolutionspost,
   inte dagslägesrisk (samma bygg skriver båda).
2. **ISR-föråldring ≠ trasig artefakt** (s8-u2:s fas-2-fynd): en ISR-sida
   som revaliderats under ett trasigt fönster kan referera GAMLA hashar
   — det är drift-läkning (SWR/omvalidiering), inte bygg-integritet, och
   ska inte blockera restart. Verifieraren körs vid deploy-tid då alla
   HTML är skrivna av SAMMA bygg = ingen ISR-förväxling i grindläget.
   Fristående rundkörning mot levande .next kan visa ISR-föråldring som
   "trasig" — det är då ett ÄKT driftfynd (kundsynliga 404 tills
   revalidiering), inte falsklarm.
3. **Clobber-not (race-familjen):** prod-synk steg 3 kör `git checkout
   -- .` som raderar ocommittade ändringar i spårade filer — därför
   staggades prod-synk.mjs + kraschvakt.mjs OMEDDELBART efter edit
   (stagat innehåll överlever checkout), vila i 8abb7000-precedensen.

## §6 KVD + bokningar

- KVD: prod 200 (localhost + sond GRÖN 22/22) · tsc 0 · src/ orörd ·
  R2 orörd (inga priser/tier/publicering) · data/blogg/ orörd · inget
  bygge · inga .env/nycklar.
- **Bokningar:** (1) E34-köpost 1 härmed inlöst — SYSTEMKARTAN E34:s
  nästa återdiff kan verifiera grönt stil-läge med denna grind aktiv;
  (2) E34-köpost 2 kvarstår (pulsvaktens "deploy pågår — larm
  undertryckt" saknar tidsgräns — pulsvakt.mjs är s8-u2:o30:s fil,
  boken lämnas åt dess ägare/huvudagenten); (3) evolutionspost:
  .rsc-skann + eventuellt cron-roterad artefaktverifiering som
  komplement till statisk-sondens punktsond (hela trädet à 10 s).
