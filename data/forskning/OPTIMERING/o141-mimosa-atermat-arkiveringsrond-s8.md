# o141 — Mimosa full-scan återmätning 2026-09-21 + verkställd arkiveringsrond (spår 8: kvalitet & säkerhet)

**Uppdrag:** våg 205:s bokade kvarleverans — "återmät efter vågor som
tillför filer". Sedan senaste mätningarna (o92 standarddomän 725/0
2026-09-19; o133 v1.6 hel-träd 2 145/0 2026-09-20) har fabriksomgångarna
s1–s10 + huvudronderna tillfört hundratals filer. Denna våg mäter om hela,
verkställer o133:s bokade arkiveringsrond och kurar den skalforms-glidning
mätningen avslöjade.

## 1. Återmätning FÖRE (o133-mönstret: `--doman .`, v1.6)

`node verktyg/mimosa-paritet.mjs --doman . --hoppa-over 'testa-mimosa-paritet\.mjs$' --json fullscan-atermat-2026-09-21.json`

| Mått | o133 (09-20) | Denna våg FÖRE (09-21) |
|---|---|---|
| Skannade filer | 2 145 | **2 250** |
| Ohärdade fynd | 0 | **0 — GRÖN** |
| CHILD_PROC_STRANG_LITERAL (info) | 39 | **40 — glidning +1** |

Alla härdningsklasser intakta: SSRF_INTERPOLERAD_FETCH 154/154 härdade,
PATH_API 1/1 härdad, SHELL_URL_VARIABEL 1/1 härdad.

## 2. Rotorsak: glidningen 39 → 40 och o133:s outlösta bokning

STRANG-klassen (v1.6, info-nivå: doktrinbrottet "rondskript föds i
arrayform", inte runtime-risk) visade **9 träffar i levande verktyg/**:
8 engångsskript från avslutade omgångar + 1 LEVANDE svit
(testa-studio-tabbar.mjs). o133 bokade redan 2026-09-20
"arkiveringsrond: 8 sonder + 16 .zcode + 15 arkiv" — den rundan utföll
aldrig; engångsfilerna ackumulerades vidare (129 osparkade i verktyg/
vid denna vågs start). Rotorsaken är PROCEDUR, inte kod: engångs-
wrapprar får stanna kvar i levande katalog efter leverans utan att
någon rond städar dem.

## 3. Kurer (verkställda denna våg)

1. **LEVADE SVIT KURAD — verktyg/testa-studio-tabbar.mjs** (aggregatorns
   öppna tabbar-svit): två `execSync`-strängformer → skalfri form.
   - Rad 254 (win-gren): `execSync("netstat -ano")` → `execFileSync("netstat", ["-ano"])`.
   - Rad 270 (linux-gren): `execSync('ps -eo rss,args | grep -E "next|node" | grep -v grep | head -1')`
     → `execFileSync("ps", ["-eo", "rss,args"])` + grep/head-parsning i JS
     (o133:s ekvivalenskonstruktionsmönster).
   - **Ekvivalensbevis** (sond /tmp/o141-ekvivalens.mjs, körd mot skarp
     processlista): gammal form och ny form väljer IDENTISK rad
     ("15628 next-server (v16.3.2)") och IDENTISKT RSS-värde (15628 kB).
   - `node --check` grön.
2. **ARKIVERINGSROND VERKSTÄLLD** (endast avslutade omgångars filer;
   s1–s7 verifierade KLARA 3/3 i fabriksstatus före flytt; yngsta filen
   2 h gammal — ingen från pågående omgång):
   - 129 osparkade engångsfilier (`verktyg/_s*`, `_r1xx`, `_v2xx`,
     `_o118-trace-tmp/`-katalogen) → `mv` till
     `data/vakten/skrap-arkiv/2026-09-21-engangsverktyg-o141/`
     (sökväglista: /tmp/o141-flytt.txt).
   - 8 trackade STRANG-bärande engångsskript (_r107-motorregen,
     _r107-sond, _s1u1-sandvik-kontroll, _s1u1-tele2-kontroll,
     _s1u2-kinnevik-kontroll, _s5u1o24-synk, _s5u2o20-kvd,
     _s5u2o24-commit — samtliga referensfria enligt grep av
     verktyg/src/data-infra) → `git mv` till samma arkiv.
   - **Lämnades medvetet**: `verktyg/_s8u1o140*` (pågående o142-arbete,
     ägs av huvudsessionen) och de ~500 övriga trackade engångsfilerna
     utan STRANG (bokas som kvarleverans, se §6).

## 4. EFTER-mätning

| Mått | FÖRE | EFTER |
|---|---|---|
| Hel-träd (`--doman .`) skannade/fynd | 2 250 / 0 GRÖN | **2 250 / 0 GRÖN** |
| STRANG totalt (hela trädet, info) | 40 | **39** (tabbar-kuren; arkivfilerna skannas fortfarande i `.`-domänen) |
| **Väktardomänen `(^|/)verktyg/`** | 9 STRANG-träffar i 9 filer | **0 STRANG — LEVANDE VERKTYGSKATALOG REN** |
| Väktardomänens filantal | ~1 040 | **930** (engångsfilerna borta) |

Väktardomänens EFTER-körning: 930 filer, 0 fynd GRÖN,
SSRF_INTERPOLERAD_FETCH 63/63 härdade — rådata /tmp/o141-verktyg-efter.json.

## 5. Bevis och kvalitetsgrind

- `node node_modules/typescript/bin/tsc --noEmit` → **0 fel** (src orörd
  av denna våg — ingen byggrätt begärd, prod-synken äger).
- `node --check` på kurerad fil: grön.
- Mimosa FÖRE/EFTER-JSON:ar arkiverade (fullscan-atermat-2026-09-21.json,
  fullscan-efter-2026-09-21.json).
- R2 orörd · data/blogg/ orörd · pågående syskonarbete (o142: doda-lankar,
  feljagaren, andringar/route.ts, _s8u1o140-omstart.mjs) orört.

## 6. Dom och kvarleveranser

**GRÖN — 0 ohärdade fynd i hela trädet (2 250 filer); ny referensbas
2026-09-21 = 2 250/0. Levande verktygskatalog fri från skalform
(STRANG 9 → 0).**

Kvarleveranser (bokas):
1. **Resten av o133:s arkiveringsrond**: ~500 trackade engångsfilier i
   verktyg/ utan STRANG + 16 .zcode-skript + skrap-arkivets inre —
   städyta för egen våg (git mv-partier, inga beteendechangingar).
2. .zcode:s 8 STRANG-bärande gamla vågskript (granskning-*, synca-prod,
   v2-tsc, vag102-*) — arkiveras lämpligen tillsammans med punkt 1
   efter koll av .zcode-internt beroende.
3. Proceduren "engångswrapper arkiveras vid omgångens slut" är ännu bara
   doktrin — kandidat att mekanisera i agentfabrikens kvitto-steg
   (flytta barnets _-filier till skrap-arkiv när LEVERANS-rad lästs).
