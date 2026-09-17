# o59 — Baslinjeöverlevnad: mimosa-paritet + tsc på aktuellt träd (spår 8, s8-u2)

**Datum:** 2026-09-18 · **Agent:** s8-u2 (manifest auto-s8-1789687529759, 2/3) · **Roll:** vakt
**Anspråk:** data/vakten/auto-s8-1789687529759-u2-ansprak.md (skrivet före start)

## Uppdrag

Spår 8:s kontextord "Tsc-baslinjens överlevnad" + "Mimosa-fyndens rotorsaker":
senaste mimosa-baslinjen var 2026-09-16 (677 filer GRÖN; våg 178 full-scan 905/0
GRÖN) och sedan dess landade två dygns tunga vågor — s7-familjens prestandakurer
(o54/o56/o57: src/components, home-section, ShortSeller-defer m.fl.), s8-u3:s
ActivityRow-fix, s8-u1:s tabbreddskur + dussintals nya verktyg/_*-skript från
s3–s6-vågorna. Baslinjeöverlevnaden måste MÄTAS, inte antas.

## FÖRE-mätning (aktuellt träd, 2026-09-18)

| Domän | Filer | Fynd | Rådata |
|---|---|---|---|
| Standard (src/ + data/infra/) | 703 (+26 vs 09-16) | **0 — GRÖN** | mimosa-paritet-baslinje-2026-09-18.json |
| Verktyg (verktyg/ + .zcode/ + .zscripts/) | 424 | **3 — CHILD_PROC_INTERP (high)** | mimosa-paritet-verktygdoman-2026-09-18.json |

tsc (projektbinär `node node_modules/typescript/bin/tsc --noEmit`): **0 fel** —
typnollen överlever.

Standarddomänens GRÖN är en äkta överlevnadskurva: 26 nya filer genom
s7/s8-vågorna, 80 härdade SSRF-kontexter (mot 80 på 09-16 — inga nya ohärdade),
PATH_API 1/1 härdad.

## Fynden (verktygdomän) — samtliga CHILD_PROC_INTERP

1. **`.zcode/granskning-mx1-finans.mjs:18`** (high):
   `execSync(\`git -C ${ROT} show 806f9359:…\`)` — ROT är filscope-konstant
   (`'/home/ak1a/AK1'`), praktisk risk låg, men klassen (skalinterpolation) är
   exakt Mimosa:s CHILD_PROC_INTERP.
2. **`.zcode/granskning-nordea-verify.mjs:134`** (high): samma mönster,
   `git -C ${ROT} show 0e399f13:…`.
3. **`verktyg/_s4u3-kvd-yara.mjs:269`** (high) — **den äkta variabeln**:
   `execSync(\`node -e "…h.get({host:'localhost',port:3000,path:'${l}'},…)"\`)`
   där `l` är en länk UR BLOGGTEXTENS DATA (markdown ur utkastet) inbäddad i en
   skalsträng — variabeldata når skalet; enskilt citattecken i en länk räcker
   för kommandoinjektion. Klassen som Mimosa(pariteten) finns för.

## Rotororsak + kur (per verktygets egen doktrin: "execFile/spawn med
array-argument är per definition utan skal = härdad form")

1+2. `execSync`-mallsträng → **`execFileSync('git', ['-C', ROT, 'show', …])`**
(array-argument, noll skal) + rotkommentar vid raden.
3. Hela `execSync(node -e …)`-konstruktionen → **direkt `fetch`** i skriptet
   självt (node ≥18 har global fetch): ingen barnprocess, inget skal, länken
   når aldrig ett kommando. `redirect: "manual"` bevarar gammal semantik exakt
   (rå statuskod — http.get följde aldrig omdirigeringar); timeout 25 s +
   retry ×3 + 250 ms mellanlänkpaus oförändrade.

### Versionshanteringsnotering (ärlighet)

`verktyg/_s4u3-kvd-yara.mjs` är trackad — kuren är versionerad. Däremot är
`.zcode/granskning-*.mjs` **gitignore:ade sedan våg 149** (sessionshjälpskript
i .zcode-roten = arbetsavfall enligt den beslutade hygienen) — kurarna där är
lokala på servern (filerna är kvar och körbara; scanen mär filsystemet, så
EFTER-beviset gäller dem likafullt). Ingen `git add -f` — våg 149:s regel är
kvalitetslag, inte hinder.

## Funktionellt bevis (kurerade skript körs, ej bara typas)

- `granskning-mx1-finans.mjs`: kör — den kurade raden läser vintaget korrekt
  (universum@806f9359 n=115, finans 12 bolag, medianer OK). 24/28 OK; de 4
  FEL är innehållsdrift i UTKASTET (publicerad post glidit, readingMinutes,
  rådgivningsglossor) — existerande läge, orsakat av utkastets ålder, inte av
  kuren (sonden är ett engångsinstrument mot fruset underlag).
- `granskning-nordea-verify.mjs`: kör — sektion E (VINTAGE 0e399f13) läser
  115 bolag + finans 12 via execFileSync: OK. 51 OK / 5 FEL, samma
  innehållsdriftsklass som ovan.
- `_s4u3-kvd-yara.mjs kvd`: kör — **165 PASS, 1 FEL, 0 VARNINGAR**; länkblocket
  (omskrivningen) GRÖNT: 20/20 interna länkar HTTP 200 via fetch, inga
  länkfelrader utskrivna. Det enda FELET är "grupptal material=15
  universum=165" — universum växte 159→165 sedan KVD:n skrevs (samma drift
  mx1-sonden synar: "dagens träd: 159" → nu 165) — inte orsakat av kuren.

## EFTER-mätning

`mimosa-paritet --doman verktyg|\.zcode|\.zscripts` → **420 filer, 0 fynd —
GRÖN** (CHILD_PROC_INTERP 3→0; övriga klasser oförändrade: 57/57 härdade
SSRF, loopback/externa literaler info). Rådata:
mimosa-paritet-verktygdoman-EFTER-2026-09-18.json.

## KVD-sammanfattning

- tsc 0 (projektbinär) — src/ orörd av denna våg (inget bygge: prod-synken äger).
- Standarddomän 703/0 GRÖN (baslinjeöverlevnad bevisad, +26 filer).
- Verktygdomän 424/3 → **420/0 GRÖN** efter tre rotkurer.
- Tre skript funktionellt verifierade efter kur (git-vintageläsning + 20 länkar
  HTTP 200 via nya fetch-vägen).
- R2 orörd (priser/tier/publicering orörda) · data/blogg/ orörd (inga utkast
  publicerade) · syskonens ytor orörda (s8-u3:s ActivityRow + s8-u1:s
  tabbredd berördes ej — duplikatkontroll mot deras commits 37071551/d775e6a8).

## Duplikatkontroll (gjord före val, dokumenterad i anspråket)

- Admin-överflödet: TOGET av s8-u3 (37071551, databeroende halvan) + s8-u1
  (d775e6a8, konstanta halvan o58) — mina två sondverktyg
  (_s8u2-sond-admin-overflod.mjs, _s8u2-sond-hitta-element.mjs) committas som
  metoddokumentation; de kan nyttjas av syskonens bokade EFTER-mätningar.
- Dödlänksfalsklarmet 1 616×500: kurerat av o47/o55 (mätfönster-grinden är
  inbyggd i verktyget sedan 2026-09-17).
- Beroende-CRITICAL next: levererad som RAPPORT av s8-u2 omgång 1; själva
  bumpen kräver npm-installation = prod-synkens ägande (inte fabrikens).
