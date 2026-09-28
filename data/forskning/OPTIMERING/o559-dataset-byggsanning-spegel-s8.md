# o559 — Dataset-ytornas byggsanning: o146 §7:s öppna spegelpost stängd (s8-u1)

**Spår:** 8 KVALITET & SÄKERHET (vakt) · **Agent:** s8-u1 (fabrik, manifest
auto-s8-1790625928515) · **Datum:** 2026-09-28 · **Nummer:** reserverat via
verktyg/reservera-protokollnummer.mjs (o559, högsta kända o558).

## ROTORSAKA (bevisad i källan + prod-precedens)

`/dataset/[bransch]` och `/dataset/[bransch]/[aspekt]` är `force-static` +
`dynamicParams = false` — sidorna FINNS bara där `generateStaticParams` såg
dem vid senaste gröna bygge. Samtidigt LOVAR fyra ytor ur LIVE-data
(`lasBranschMedianer()`/`aspektParametrar()` läser bolagsunivers.json från
disk i den körande processen):

1. `/dataset` + `/en/dataset` + `/ar/dataset` — index-tabellens branschlänkar
   (ISR 24 h; dataset-sidor.tsx DatasetIndexVy → DatasetSorteradLista).
2. Detaljsidornas "andra branscher"-syskonlista (samma vy-fil, tre språk).
3. Aspektsidornas syskonlänkar ([aspekt]/page.tsx renderar
   `aspektParametrar()` live i ISR-fönstret).
4. `/llms.txt` — force-dynamic, maskinläsbara branschlöften (seo.tsx).

Fönstret öppnas när processen startar om med nyare data än .next-bygget —
exakt o146:s bevisade prod-scenario (OOM ⇒ prod-synken återställer .next ur
läkebackupen medan data levererats vidare; jfr 6961-omstartslooparna).
**Prod-precedens för JUST dataset-klassen:** s4-u1:s fynd 2026-09-20
"/dataset/teknik/peg svarar 404 medan /dataset/material/peg är 200" (worklog
rad ~16095) — gapet uppstod verkligen; senare deploy läkte symptomet men
rotorsakan stannade i källan. o146 §7 bokförde posten öppet: "latent samma
klass för /dataset/[bransch]+spegel om branschmängden växer utan deploy".

O146/o147 kurerade SITEMAP-grenen (byggdSidaFinns i sitemap.ts, alla tre
språk + aspekter) men lämnade sidornas EGNA länkar och llms.txt — kunden
skulle fortfarande kunna KLLICKA sig till 404 även när sitemap teg.

## KUR (3 filer, ingen ny mekanism — o147:s vakt återanvänd oförändrad)

1. **src/components/ak1a/dataset-sidor.tsx** (servervyer): ny export
   `byggdBranschFinns(lang, bransch)` — mappar språkprefix till byggsökväg
   ("dataset/x" | "en/dataset/x" | "ar/dataset/x", sitemap-konventionen) och
   frågar `byggdSidaFinns`. Tillämpad i (a) index-tabellens `sorterbara`
   (gäller alla tre språkens index) och (b) detaljsidans "andra branscher".
2. **src/app/(huvud)/dataset/[bransch]/[aspekt]/page.tsx**: syskonlistan
   filtreras med `byggdSidaFinns(\`dataset/${p.bransch}/${p.aspekt}\`)`.
3. **src/lib/seo.tsx**: llms.txt:s bransch-loop `continue`:ar när bygget
   konstaterat saknar branschsidan.

Fail-open-doktrinen (o147) bärs av lib-kärnan oförändrad: utan .next (dev,
ren klon) reklamerar allt som förut; endast ett konstaterat saknad.html
håller ett löfte tillbaka — till nästa gröna bygge släpper det in det igen
automatiskt. I ett FRISKT deploy-bygge ändras inget (alla byggda ⇒ alla
synliga, K5a) — kuren verkar endast i gap-fönstret, vilket är definitionen
av en vakt.

## BEVIS

- **Svit** `verktyg/testa-dataset-byggsanning-s8.mjs`: **14 PASS · 0 FAIL**
  (K1 vylagret ×4 · K2 aspektsyskon ×2 · K3 llms ×2 · K4 fail-open-kärna
  orörd ×3 · K5 mekanikeldprov mot låtsat .next-träd i tmp ×3: friskt läge
  oförändrat / en saknad gallras exakt / ingen .next ⇒ fail-open) +
  villkorad HTTP-sond (aldrig fejkade EFTER-tal): **30 dataset-löften på
  index×3 + llms · 0 döda — LEVERANS-GRÖN** (fönstret stängt idag, som
  väntat; FÖRE-sonden 40/40 gröna dokumenterad i anspråksarbetet).
- **tsc 0** (`node node_modules/typescript/bin/tsc --noEmit`, projektbinär,
  exit 0 — baslinjen håller).
- **INGET bygge** — fabriksregeln; prod-synken bygger kuren live vid nästa
  gröna bygge (filtret är då identiskt med beteendet i dag: 0 synlig
  förändring förrän nästa gap, som då gallras tyst).
- Gränsnittsvakten orörd nivå (0 fynd/180 vid dagen mätning); koden påverkar
  ingen visuell yta i friskt läge.

## AVGRÄNSNINGAR (kontrollerade, ej fynd)

- `datasetJsonLd` bär index-URL endast — inga per-bransch-URL:er att fila.
- Kurslänkarna i LarDigMer: kurser är on-demand-ISR (dynamicParams=true,
  självtjänar nya slugs) — utanför o146-klassen per sitemap-byggsanning §OMFATTNING.
- Aspekt-speglar på en/ar finns ej (endast index+detalj speglas).
- llms löptext "under varje bransch finns aspektsidor": aspekt-URL:er listas
  ej i llms (endast sv-detaljsidorna); löptextens sanning kontrolleras av
  att bransch-raderna själva gallras.

## KVAR BOKFÖRAT TILL SPÅRET

- EFTER-deploy-kvitto: kör sviten igen efter nästa gröna bygge (HTTP-sonden
  ska förbli LEVERANS-GRÖN; ett GAP-ÖPPET-läge rapporteras nu istället för
  att bli kundklickbart).
- Samma klass, obevakad granne: /bolag/[slug]-sidornas EGNA syskonlänkar
  (syskonBolag, o146) — om de renderar live-listor i ISR bör de få samma
  vakt; ej kartlagt denna våg (annan filägare-yta vid behov).

— s8-u1 (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-28
