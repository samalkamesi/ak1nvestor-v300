# o116 — Mimosa full-scan återmätning 2026-09-20 + fixture-undantaget mekaniserat (spår 8, s8-u3)

**Manifest:** auto-s8-1789896901533 · **Agent:** s8-u3 (byggare 3/3) · **Fönster:** 2026-09-20 09:45–10:1xZ
**Anspråk disk-först:** data/vakten/auto-s8-1789896901533-s8-u3-ansprak.md (09:50Z, FÖRE all mätning)

## OBJEKT (duplikatkontroll)
o29-kontraktet ("återmät efter vågor som tillför filer utanför src/") mot o96:s
baslinje **1 624 filer / 0 fynd / exit 0 (2026-09-19T19:34Z)**. Sedan dess:
s3 (AR11–13), s4 (Prologis/Kambi/Balder), s5 (bk-07 m.fl.), s6 (AI-Mentorn
omg 26 — 65 motorer), s7 (o109–o111) + huvudagentens rondskript = ~50 nya
verktyg/_*-filer, samtliga omätta. Förkastade kandidater med motiv i anspråket:
o86:s DRIFT-tröskel (REDAN levererad — granssnittsvakt.mjs r48/759–778),
v213b kontraktssviter (status "klar" 10/10), döda länkar (VÅG 193 + per-guide
KVD), patch-beroenden (ogörligt utan npm install — fabriksbarnsforbud).

## NUMMERKOLLISION (redovisad)
Första val var o115 (ledigt vid anspråk 09:50Z); u1 levererade under fönstret
"o115 react-kvittot formaliserat" (572363f0). Omnummererad till **o116** enligt
o107-mönstret; objekten disjunkta (u1: react-kvitto · u2: o114 ts-import ·
tidigare u3-förare: o113 patch-kö omgång 4 — ingen rörde mimosa-ytan).
Rådatafiler döpta om _s8u3o115→_s8u3o116 före EFTER-körningarna.

## FÖRE-mätning (`--doman .`, UTAN flagga)
**1 887 filer / 6 CHILD_PROC_INTERP-fynd [high] / exit 1** — samtliga övriga
klasser gröna (SSRF_INTERPOLERAD_FETCH 151/151 härdade, SHELL_URL_VARIABEL
1/1 härdad, PATH_API 1/1 härdad). Rådata: data/vakten/_s8u3o116-mimosa-fore.json.

Fynden, tre familjer:
1. `verktyg/_f2-kur.mjs:46` — execSync(`curl … "${url}"`) med interpolerad URL
   i skalsträng (huvudagentens F2-rotkur, rond 111, färdiglevererad d0c13a6d).
2. `verktyg/_r113-commit.mjs:13` — execSync(`git ${args}`) med interpolerade
   argument i skalsträng (huvudagentens rond-113-commitcykel, 7edca54d).
3. `verktyg/testa-mimosa-paritet.mjs` ×4 (r 33/138/139/166) — svitens EGNA
   fixtures, dokumenterat undantag sedan o15 — INTE äkta fynd.

## ROTORSAKA (metodfynd, o92-klassen "undantaget bodde i körkunskapen")
o96:s baslinje mättes med `--hoppa-over "testa-mimosa-paritet\.mjs$"` — men
undantaget fanns ENDAST som flagga + körkunskap, aldrig i instrumentet.
Kvalitetsvaktens sektion 13 (o94) skickar flaggan programmässigt (r 1065) —
automatiken var säkrad — men varje MANUELL mätare som glömmer flaggan får
4 falska high-fynd och en trasig baslinjeskillnad. Bevis: denna vågs egen
FÖRE-körning utan flagga = exakt det felet, första försöket.

## KURER
- **K1 (o59-doktrinen, arrayform):** _f2-kur.mjs curl-sonden →
  `execFileSync("curl", ["-s","-o","/dev/null","-w","%{http_code}","--max-time","20", url], …)`.
- **K2 (arrayform):** _r113-commit.mjs kör() → `execFileSync("git", delar, …)`
  med `delar = args.split(" ")`; samtliga anrop i filen verifierade som
  mellanslagsseparerade token-listor utan citat/jokertecken (förlustfri split,
  dokumenterat i källan).
- **K3 (instrumentet, rotorsakan):** mimosa-paritet.mjs **v1.5** —
  `STANDARD_HOPPA_FIXTURE = "testa-mimosa-paritet\\.mjs$"` gäller SOM STANDARD
  när --hoppa-over utelämnas; explicit flagga ersätter standarden helt (o96:s
  och sektion 13:s anrop förblir semantiskt identiska). Rapportfältet
  `hoppaOver` redovisar nu alltid det värde som gällde (standard markeras).

## EFTER-mätning + BEVIS
- **Utan flagga (rotkuren): 1 888 filer / 0 fynd / exit 0** — första
  manuellmätningen utan flagga någonsin GRÖN av sig själv.
- **Med o96:s exakta flagga: 1 888 filer / 0 fynd / exit 0** — baslinjen
  återställd JÄMFÖRBART (1 624 → 1 888: tillväxt = s3–s7 + rondskript, allt
  mätt och grönt). NY REFERENSBAS: **1 888/0 (2026-09-20, v1.5)**.
- Sviten `verktyg/testa-mimosa-paritet.mjs`: **ALLA PASS** (25 test, däribland
  "fixture-fil undantas → 0 fynd" — explicit flagg-semantik intakt).
- `node --check` ×3 GRÖN · `node node_modules/typescript/bin/tsc --noEmit` = **0**.
- Kvalitetsvakten påverkas ej avvändarvägen (dess subprocess skickar flaggan;
  v1.5 ändrar bara fallet flagga-saknas — deras anrop oförändrat).

## KVD / GRÄNSER
src/ orörd = INGET bygge (tsc 0 som kvitto) · R2 orörd (priser/tier/publicering)
· data/blogg/ (live) orörd · ALDRIG --no-verify · npm ci/install/rm -rf
node_modules ALDRIG · syskonytor orörda (u1: react · u2: ts-import · o113-u3:
patch-kö — commit med exakt pathspec).

## BOKNINGAR (§ nästa våg)
1. Kvalitetsvaktens 07:02-cron mäter nu v1.5 — första organiska körningen
   bekräftar sektion 13 på den nya baslinjen (1 888 ± tillväxt).
2. Rondskript-mönstret (_r11x-commit.mjs) återföds varje rond — nästa ronder
   bör föddas direkt i arrayform (K2 som mall); värdigt ett huvudagent-notis.
3. o115-nummerkrocken: anspråks-tid är inte nummer-tid — nummer låses först vid
   protokoll-skrivning (läxa bokförd här, o107-mönstret räcker).
