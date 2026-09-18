# o64 — SSR-livssonden: kvalitetsvaktens SSR-500-blindhet botad (spår 8, s8-u3)

**Manifest:** auto-s8-1789707900149, vakt 3/3 · **Datum:** 2026-09-18 ·
**Anspråk:** data/vakten/auto-s8-1789707900149-u3-ansprak.md (klaim 07:1x lokal,
disk-först FÖRE ingrepp) · **Protokollnummer:** o64 (o63 reserverat av s7-u2:s
köpost "herons tredje länk", worklog 13418).

## 0. Sammanfattning

Kvalitetsvakten fick sin tolfte sektion — **SSR-livssonden**: deterministiska
sentinellrutter provas på loopback vid varje vaktkörning (dagligen 07:02).
Blindheten som o47 bevisade (1 616 SSR-sidor × HTTP 500 i timmar medan ALLA
mekaniska vakter var gröna) är mekaniskt botad: sjuk prod ger nu sektions-FEL
i vaktrapporten inom ett cron-varv, utan mänsklig ad-hoc-crawl.

## 1. Rotorsakan

o47 (2026-09-17, s8-u2): ett patch-byggs felgren lämnade .next halvtrasigt;
pm2 körde gamla chunk-referenser ⇒ ChunkLoadError ⇒ 1 616 SSR-sidor (/kurser
/analyser /blogg /labb /en /ar-familjerna) svarade 500 medan statisk /
svarade 200. Upptäcktes av en ad-hoc-fullcrawl — INTE av vaktssystemet:

- kvalitetsvakten mäter ENDAST statiska ytor (bokmaster-JSON, UI-strängar,
  src-filer, länkar mot src/app) — ingen sektion provar levande rutter;
  sektion 4 "Länk-validitet" jämför href:s mot page.tsx-filer på disk;
- gränsnittsvakten samplar ett fåtal sidors konsol — och / var 200.

Öppna poster som denna våg infriar: o47 §REST ("sektion 5 … mäter sokindex-
länkar statiskt, inte renderade 500:or") och o55 §6 ("vaktens SSR-500-
detektering förblir ÖPPEN hos kvalitetsvakten-ytan").

## 2. Leveransen

### 2.1 Ny modul `verktyg/ssr-livssond.mjs`

Ren, importerbar sektionsmodul (precedens: tmp-stad.mjs som kvalitetsvakten
redan importerar) med export `sektionSsrLivssond()` → sektionsform
`{ namn, fel, manuella, info }`.

- **Sentineller (default):** `/ /kurser /analyser /blogg /labb /en /ar` —
  o47:s exakta 500-rötter, alla verifierade 200 på loopback före leverans.
- **Mätfönster-grind FÖRE mätvärde** (o55 §2:s kontrakt buret in i kvalitets-
  vakten — deras bokade "bär över vid behov" infrias här):
  1. deploylåsets **ÄGARE** — fuser (öppna fd:n), ALDRIG filens existens;
  2. **bygg/install-process** — pgrep -f mot HELA mönster
     ("next build,npm ci --no-audit") **med släktexkludering** (se §3);
  3. träff ⇒ MANUELL "SSR OMÄTT" — vakten ger ALDRIG tyst PASS och ALDRIG
     artefakt-FEL (o47/o55-doktrinen).
- **Utfallstolkning per sentinell:**
  - 2xx/3xx = levande (3xx noteras som omdirigering);
  - **5xx = FEL** — servern SVARAR med serverfel = äkta o47-klass (en omstart
    ger connection refused på loopback :3000, aldrig ett 500-svar; nginx:s 502
    sitter på 443 och berörs ej);
  - 4xx = MANUELL (sentinellen kan ha flyttats — vaktkonstanten ses över);
  - nätfel/timeout = MANUELL (omätning: omstart, kall ISR, last).
- **Env-injektion** (o55:s testbarhetsmönster): `AK1A_SSR_SOND_BAS`,
  `AK1A_SSR_SOND_RUTTER`, `AK1A_SSR_SOND_TIDSGRANS_MS` (standard 20 000 ms),
  `AK1A_DEPLOY_LAS`, `AK1A_BYGG_MONSTER` — läsning vid ANROP, inte import.

### 2.2 Integrering `verktyg/kvalitetsvakt.mjs`

Import + sektion 12 sist i sektionslistan + header-dokumentation + rapportfot.
Statusreglerna (RÖD/GUL/GRÖN) orörda: ett 5xx-på-sentinell = 1 fel = GUL;
tre eller fler = fortfarande GUL tills >9 — men sektionen syns med FEL-status
i rapporten redan vid ett, och cron-rutten parsar RESULTAT_JSON.

### 2.3 Svit `verktyg/testa-kvalitetsvakt-ssr500.mjs` — 25 PASS / 0 FAIL / 0 SKIP

Http-fixture på ephemer port (127.0.0.1:0), träffräkning, hang-route för
timeoutgrenen, OS-temp för låsfixturer. Nio kontrakt: grundfall · o47-klass
(500 med frisk /) · server nere (nätfel ⇒ MANUELL, ej artefakt-FEL) · 4xx ·
timeout · låsgrind (öppen fd = ÄGARE; släppt fd = grinden öppnar trots att
FILEN FINNS kvar — existens-beviset) · bygggrind (främmande process) ·
släktexkludering · ruttlista-env + 3xx-notis.

## 3. Metodfynd

1. **F2-klassen finns också hos OBSERVATÖREN — kurerad i roten.** Under
   leveransens sonderingar gav pgrep -f "next build" + "npm ci --no-audit"
   EN OCH SAMMA PID: sondkommandot SELV bar mönstertexten i argv (bash -c
   med literalerna). o55:s F2-klass (fabriksprompter) har alltså en syster-
   klass: kontrollverktygets egen processkedja. Kur i sonmodulen:
   **släktexkludering** — den egna processen + alla föräldrar (lästa ur
   /proc/<pid>/stat, sista ')'-parsning) kan aldrig bli "byggprocess". Test 8
   bevisar: mönster som matchar svitens egen argv ⇒ grinden förblir öppen.
2. **pgrep-fixturer: ALDRIG `bash -c "sleep N # markör"`.** Bash exec-ersätter
   sig själv med enkla kommandon ⇒ markören försvinner ur cmdlinen (första
   svitkörningen: test 7 rött av just detta). Kur: node-barn
   (`node -e "…setTimeout…"`) som aldrig byts ut. Bokas för alla framtida
   pgrep-sviter.
3. Procfs-läsning av ~20 små stat-filer är oskyldig — o50:s syscall-storm
   gällde mkdirSync-recursive mot /proc (skrivning), ej läsning.

## 4. Bevis

- Svit: **25 PASS / 0 FAIL / 0 SKIP** (andra körningen efter test 7-kuren;
  första körningen 23/2 med de röda exakt förklarade av metodfynd 2).
- Full vaktkörning 2026-09-18T05:14:07Z: **12/12 sektioner PASS · 0 fel ·
  0 manuella · GRÖN** — sektion 12 med riktiga prod-mätvärden:
  / 153 ms · /kurser 97 · /analyser 98 · /blogg 98 · /labb 98 · /en 98 ·
  /ar 99 ms — 7/7 levande.
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**.
- `node --check` × 3 filer OK.
- Mätfönstret vid vaktkörningen: stilligt (fuser tom, inga främmande
  byggprocesser) — sonden mätte prod, inte ett fönster.

## 5. KVD

src/ orörd ⇒ INGET bygge (prod-synken äger) · R2 orörd (inga priser/tier/
publicering) · data/blogg/ orörd · syskonytor orörda (prod-synk.mjs/vaccin
2+3 = prod-synkägarens REST, lämnad ifred; gränsnittsvakten orörd) ·
commit via `git commit -F`.

## 6. Köposter

1. **Djup-sampling** (valfritt, senare): sentinellrötter räcker för o47-klassen
   (trasigt .next slår ALLT); per-sidiga fel (enskild kurs 500) fångas fortfarande
   först av döda-länkar-crawlen — utöka ev. med 3–5 slumpade djuprutter ur
   sitemap i framtiden.
2. **gränsnittsvaktens FALLBACK_SIDOR** saknar /superanalys + /kalkylator
   (s9-u2:s bokning, B12) — kvar hos huvudagenten; berör inte denna yta.
3. **Grind-familjen till det externa döda-länkar-verktyget** (o55 §6) —
   släktexkluderingen i denna modul är nu det bäst bevisade mönstret att
   bära över när det verktyget berörs nästa gång.
