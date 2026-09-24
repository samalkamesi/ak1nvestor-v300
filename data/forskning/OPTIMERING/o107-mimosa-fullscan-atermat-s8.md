# o107 — MIMOSA FULL-SCAN ÅTERMÄTNING 2026-09-20 (s8-u2) + kanonisk TS-import-brygga

Protokollserie: OPTIMERING (spår 8 — kvalitet & säkerhet, VAKT).
Fönster: fabrik auto-s8-1789871713656, byggare 2/3. nr-val: o107 var fritt
på disk (o105 = s7-sidfooter, o106 = dubbelbokat, se §3.1).

## §0 — Fönstrets val och kollisionshantering (öppen bokföring)

1. VAL 1 (anspråk data/vakten/auto-s8-1789871713656-s8-u2-ansprak.md,
   disk-först 04:50:12 lokal): VÅG 213 del (b) — tio kontraktssviter för
   motorregistrets otestade motorer.
2. KOLLISION: syskonet s8-u3:s anspråk (04:53:20, +3 min) täcker samma
   objekt och hade 04:55–05:00 levererat 7/10 sviter på disk med plan för
   samtliga tio + rotkur + register-regen; s8-u1 stängde samtidigt sin
   tsc-grindvåg på samma nummerserie. MItT anspråk var först på DISK, men
   syskonets ARBETE var först LEVERERAT — enligt s7-precedensen (o101:
   "först till leverans på disk äger, noll förlorat arbete") ställde jag
   ned från V213(b): att skriva om sju färdiga sviter vore dubbelgolv.
   Fördelningen blev: V213(b) = s8-u3 (tio sviter), min FÖRARBETE
   (motorläsning + brygga) kanaliserades in i nedanstående i stället.
3. PIVOT: spårets stående kvarleverans från V178/V205 — mimosa full-scan
   återmäts "efter vågor som tillför filer utanför src/". Förra basen
   2026-09-19T19:34Z (1 624 filer, 0 fynd) föregrep ~7,5 timmars
   fabriksvågor (s6 omg 25, s7 o98–o104, v211, r106/r107, s8-u1, s8-u3)
   som tillfört 148 filer — 0-fynd-kvittot täckte ej aktuellt träd.

## §1 — Återmätningen (huvudbevis)

Verktyg: verktyg/mimosa-paritet.mjs v1.4 (oförändrad), samma anrop som
kvalitetsvakten: `--doman . --hoppa-over 'testa-mimosa-paritet\.mjs$'
--json data/vakten/mimosa-fullscan-SENASTE.json` (SENASTE är gitignorerad
skannervägg; rådata kurerad nedan).

| Mätning          | Förra (19:34Z 09-19) | Denna (05:1x lokal 09-20) |
|------------------|----------------------|---------------------------|
| Skannade filer   | 1 624                | **1 772** (+148)          |
| Fynd             | 0                    | **0**                     |
| Exit             | 0                    | **0** — GRÖN              |

Tillväxt per klass (träffar, samtliga härdade/tilåtna kontexter):
SSRF_LOOPBACK 78→89, SSRF_INTERPOLERAD_FETCH 143→146 (146/146 härdade),
SSRF_EXTERN_LITERAL 16→17, SHELL_URL_VARIABEL 1→1 (härdad),
SHELL_URL_LOOPBACK 1→2 (loopback = tillåten), PATH_API 1→1 (härdad).

**Slutsats: nya referensbasen 1 772/0 (2026-09-20).** Fabriksvågornas
148 nya filer (främst verktyg/_*-sonder och -wrapprar) introducerade noll
ohärdade mönster — o59-härdningens EXEC_INTERP-mönster och flock-argv-
konventionen håller i storproduktion.

Korskontroll: verktyg/testa-mimosa-paritet.mjs — ALLA PASS på aktuellt
träd (skannerns egen paritet grön, inte bara dess utdata).

Rådata: data/forskning/OPTIMERING/fullscan-atermat-2026-09-20-s8u2.json
(beatydelsekopia av SENASTE, commitas — konventionen från
fullscan-atermat-2026-09-19.json).

## §2 — Kanonisk TS-import-brygga (rotorsaksgåva åt V213(c))

**Rotorsaken bakom "otestade motorer"**: node ≥ 22.18 strippar typer i
.ts-filer men löser INTE "@/lib/x"-alias (tsconfig paths) eller
extensionless relativa importer ("./datacache") — Next/bundlar-konventioner.
Det är samma rot som håller dataset-aspekter-sviten röd (V213(c), bokförd
v209-u3: "extensionless src-importer") och som gjort @/-importerande motorer
(klientkontext, signal-bus, organ-bus, eko-koppling) otestbara i ren node.

**Leverans**: verktyg/ts-import.mjs + verktyg/_ts-resolve-hooks.mjs —
`importeraTs("src/lib/<motor>.ts")` registrerar (idempotent per process) en
resolver-hook som översätter @/-alias → src/ samt extensionless relativ →
.ts/index.ts, och returnerar dynamic import. Rökbevisat i fönstret:
signal-bus (@/-alias via supabase-rest/organ-event), klientkontext
(extensionless genom fem modulers graf), nyhets-motor (→ datacache) — alla
laddar och anropas korrekt under ren node.

**Förhållande till o106-bryggan**: s8-u3:s sviter har sin egen
verktyg/_o106-ts-import.mjs (aktiveraTsImport + direkt pathToFileURL-import)
— orörd av mig, deras fönster deras. Två bryggor är överlevbara kort sikt
(olika API-form); KONSOLIDERING bokas som öppen post: framtida våg väljer
kanonisk brygga (denna, icke-underscore-namngiven och dokumenterad för
återanvändning) och migrerar o106-sviternas import. HUVUDAGENTENS V213(c):
bryggan löser svitens root-cause — testa-dataset-aspekter kan importera
modulerna i stället för att textgrepa, när den vågen körs.

## §3 — Processfynd (bokas åt fabriken)

### §3.1 Nummerracet o106 (faktisk dubbelbokning, ingen försumlighet)
- 04:53:20 — s8-u3:s anspråk väljer "o106" efter kollisionskontroll
  ("inget o106-anspråk/protokoll finns" — SANT vid tillfället).
- 04:55–05:00 — s8-u3:s sviter skriver "våg 213 del b / o106" i sina
  filhuvuden; s8-u1 håller på att landa sitt EGET o106-protokoll.
- 04:57:59 — s8-u1:s o106-tsc-grind-patchko-s8.md landar på disk.
- ⇒ två olösbara "o106" i samma fönster. Ingen av dem flyttas av mig
  (deras leveranser deras); protokollet HÄR (o107) dokumenterar race:t.
  KUR åt fabriken (förlänger s7-u1:s nr-förslag, o103 §6): numret RESERVERAS
  i anspråksfilens NAMN (s8-o106-…-ansprak gjorde rätt) och valet låser
  först när anspråksfilen + nummer finns — grep på BÅDA former före val.

### §3.2 Anspråksynlighet vid "välj själv"-manifest
Tre vakt-syskon fick samma "välj själv"-rubrik och två valde samma objekt
inom 3 minuter. Anspråksnamnet avgör synligheten: manifest-id-namngivna
anspråk (auto-s8-…-s8-u2) syns inte vid en ämnesgrep — u3:s kollisionskontroll
fann inte mitt 3 min äldre anspråk. KUR: namnge anspråk med BÅDE manifest-id
OCH ämnesord (s8-u2 gjorde det i sin pivot; gör det alltid).

## §4 — KVD

- Full-scan: exit 0, 0 fynd, 1 772 filer — GRÖN (§1).
- test-mimosa-paritet: ALLA PASS.
- tsc: `node node_modules/typescript/bin/tsc --noEmit` = 0 fel (trädet;
  src orörd av mig — INGET bygge, prod-synken äger).
- R2 orörd (priser/tier/publicering) · data/blogg/ orörd ·
  syskonens ytor orörda (u3:s sviter + _o106-brygga orörda; u1:s leverans
  orörd) · commit med PATHSPEC (u1:s tillägg2-läxa tillämpad).

## §5 — Kö vidare i spåret

1. Bryggkonsolidering (§2) — välj kanon, migrera o106-sviternas import.
2. Huvudagenten V213(c): dataset-aspekter-sviten via bryggan (import i
   stället för textgrep) — rotorsaken är kurad, verktyget finns.
3. Nästa återmätning: efter nästa större fil-tillskjutande våg (regeln
   står kvar; denna våg stängde skulden till 2026-09-20).
