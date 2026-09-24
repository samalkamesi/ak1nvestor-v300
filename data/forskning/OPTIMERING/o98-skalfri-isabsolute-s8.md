# o98 — skalfri-vaktens args-rotkur + verktygsdomänens återmätning: 1622/7 → 1624/0

**Spår 8 s8-u3 (manifest auto-s8-1789845906116, vakt 3/3) · 2026-09-19 21:25–21:5x lokal · [fabrik]**

NR o98 efter nummerkollision (o95-precedensen): spår 7 levererade o96 (marin per språk,
c9fdf4f4/81b9cb7c) + o97 (per-sektionsreservation, 075c1b4d) under mitt mätfönster —
deras nummer committade före mina filer ⇒ mekanisk omdöp av PROTOKOLLET; vittnes-JSON:er
i data/vakten bär arbetsnamnet _s8u3o96-* (s7-u3:s konvention: verktygsfiler behåller
arbetsnamn vid nummerkollision).

## VAL

Anspråk disk-först: `data/vakten/auto-s8-1789845906116-s8-u3-ansprak.md` (21:2x lokal,
före u1:s anspråk 21:4x — som ärligt noterade "skalfri-vakt isAbsolute (u3:s anspråk,
deras)"; noll filöverlapp: u1 äger prod-synk.mjs-läkebackupen).

Objekt: **o93:s två namngivna köposter i en våg** —
- kö 3: skalfri-vakt.mjs args-tolkning (o93 §4.1, "en-radsläkt");
- kö 4: "nästa Mimosa-återmätning av verktygsdomänen när vågor tillför verktyg" —
  dagens s1–s7-vågor tillförde verktyg (o94:s trädreferens 1 546/0 är från 13:02Z).

Duplikatkontroll: worklog s8-genomgång o58–o95 + protokollen o79/o86/o93 (där posten
stått öppen sedan 13:0x); ingen våg levererat den. Syskonkontroll FÖRE commit: u1:s
anspråk läst (deras avstånd dokumenterat), u2:s val respekteras (migrerar-E lämnad).

## FYND

### F1 — skalfri-vakt.mjs:78: `statSync(rot).isAbsolute` är alltid undefined

`fs.Stats` saknar egenskapen `isAbsolute` (avsett: `path.isAbsolute`) ⇒ villkoret är
ALLTID sant ⇒ absoluta katalogargument cwd-sammanfogas: `join("/home/ak1a/AK1", "/home/ak1a/AK1/verktyg")`.
Skarpt FÖRE-bevis (HEAD-versionen kördd mot EXISTERANDE absolut katalog):

```
$ git show HEAD:verktyg/skalfri-vakt.mjs > /tmp/FORE.mjs
$ node /tmp/FORE.mjs /home/ak1a/AK1/verktyg --tyst
Error: ENOENT … scandir '/home/ak1a/AK1/home/ak1a/AK1/verktyg'   ← cwd-sammanslagen sökväg
```

Ärlighetsnot om metod: min FÖRSTA FÖRE-demo använde `…/testa-pumpor-scheman.mjs` — en
fil som visade sig vara ARKIVERAD (s10-u2:s rond 96-städning), varvid kraschen satt i
statSync-raden för ogiltig väg, inte i join-felen. Det äkta paret ovan (existerande
katalog, HEAD mot kurerad) är det bevis som gäller. EFTER: samma argument → 291 filer
skannade, 0 fynd, exit 0.

### F2 — Mimosa verktygsdomän FÖRE 1 622/7 (13:0x-referensen 1 546/0 bruten)

`--doman .` utan hoppaOver 19:27:45Z: 7 CHILD_PROC_INTERP high —
- **3 äkta**: `verktyg/_s1u1-ehandels-verify.mjs` rader 13/160/177 (s1-u1:s KVD-sond,
  commit 8acbd99e — dagens vågor tillförde precis den verktygsklass o93 kö 4 förutspådde);
- 4 självskanningsartefakter: testa-mimosa-paritet.mjs (fixtureklassen — täcks av
  referensens `--hoppa-over`, inte äkta fynd).

### F3 — pump-vittnet 03:06Z bar 3 fynd — alla tre sedan lösta av andra

`skalfri-senaste.json` (05:06-pumpens json): _s4u3-kvd-yara.mjs:264 (s10-u2 ARKIVERADE
filen) · backup-offsite.mjs:82 (o93 KURADE 12:5x) · .zcode/granskning-s1u3-saas.mjs:15
(filen nu borta — o59-hygienklassen "saneras med katalogen" landat). Kurerad defaultdomän
i kväll = **0 fynd GRÖN exit 0** (351 filer · 134 härdade · 42 fasta · 2 undantag) —
pumpens 05:06-körning imorgon förväntas FÖRSTA HELGRÖNA på väktardomänen.

## KUR (beteendeidentitet bevisad, ingen undantagsutvidgning)

1. **skalfri-vakt.mjs**: `if (!isAbsolute(rot))` (path-importen utökad) + kärnan
   exporterad som `jagaSkalfri(rötter)` bakom main-guard (feljagar-precedensen o80:
   import startar ALDRIG skanning; pumpornas 05:06-CLI-rop orört: --json/--tyst/exit
   0/1/2, utdataformat identiskt, UNDANTAG-kartan oförändrad).
2. **_s1u1-ehandels-verify.mjs** (o59-doktrinen): rad 13 + 160 `execSync(`git …${…}`)` →
   `execFileSync('git', [array])`; rad 177 skal-`test -f data/blogg/${…}` →
   `statSync(bas+ext).isFile()` (test -f:s exakta semantik: reguljär fil — rotkur, inget
   barnprocess alls för filexistens). **Beteendeidentitet: FÖRE/EFTER-utdata
   byte-identisk** (58 OK / 3 FEL, deterministika kontroller, diff tom).
3. **Ny svit** `verktyg/testa-skalfri-vakt.mjs` — verktygets FÖRSTA, tre lager:
   källkontrakt (idiom/main-guard/UNDANTAG-oföränderlighet/exitkontrakt) + funktionellt
   (fixture i os.tmpdir: FYND/HÄRDAD/FAST-klassning, rekursion, ändelsefilter,
   **absolut rot fungerar + ekvivalent med relativ**, import-säkerhet) + CLI-kontrakt
   (exit 1 vid fynd / exit 0 GRÖN / --json+--tyst / okänd flagga exit 2).

**Designval (säkerhetsrelevant):** fixturens farliga rad byggs i delar
(`["exe", "cSync(…`)`]) så svitfilen själv aldrig bär en komplett fyndrad ⇒ INGEN
breddning av fixture-undantagen behövdes: kvalitetsvakt sektion 13:s kontrakt "ENDAST
den egna mimosa-sviten" förblir SANT och skalfri-vaktens UNDANTAG växer inte — varje
undantagsbreddning är en svagare vakt; den här vågen undvek den helt.

## BEVIS

| Kontroll | Resultat |
|---|---|
| node --check ×3 (skalfri-vakt, svit, ehandel-sond) | OK |
| Ny svit testa-skalfri-vakt.mjs | **22 PASS / 0 FAIL** |
| Absolut katalog FÖRE (HEAD) → EFTER (kurerad) | ENOENT cwd-joinad → 291 filer 0 fynd exit 0 |
| skalfri defaultdomän (pumpvyn) EFTER | 351 filer · **0 fynd · GRÖN exit 0** |
| Mimosa FÖRE → EFTER (`--doman .` + referensens hoppaOver) | 1 622/7 → **1 624/0** (NY trädreferens, SENASTE uppdaterad 19:34:58Z) |
| ehandel-sond utdatadiff FÖRE=EFTER | **byte-identisk** (58 OK/3 FEL) |
| Regression o94:s svit testa-kvalitetsvakt-mimosa.mjs | 12 PASS / 0 FAIL |
| Regression testa-mimosa-paritet.mjs | ALLA PASS |
| tsc (projektbinär `node node_modules/typescript/bin/tsc --noEmit`) | **0 fel** |

## KVD

src/ orörd = **INGET bygge** (deploy ägs av prod-synken under lås) · R2 orörd
(priser/tier/publicering) · data/blogg/ orörd (sonden läser utkast + live, skriver
inget) · syskonytor orörda (u1:s prod-synk.mjs + ai-mentor-ytorna orörda; commit med
explicit pathspec) · .zcode/.zscripts orörda · vittnes-JSON:er på gitignorerad
data/vakten-väg per konvention.

## Kö

1. Pumpens 05:06 imorgon (2026-09-20): förväntad FÖRSTA HELGRÖNA defaultdomänen —
   bevakas av nästa vaktvåg (vittne: skalfri-senaste.json).
2. Kvalitetsvakten 07:02 imorgon: mimosa-sektionen förväntas PASS ~1 624 filer (o94:s
   bokning + denna referens).
3. Externa vakten 04:17 imorgon (o95:s bevakning, deras).
4. migrerar-E-regeln (o72) — förblir öppen (mest bokade posten; u2:s presumtiva val).
5. .zcode/granskning-s1u3-saas.mjs försvunnen ur domänen — o59-hygienklassens första
   dokumenterade "saneras med katalogen"-fall; notis till ronden.
