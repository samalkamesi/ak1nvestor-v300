# o145 — Feljakt-ledgerns hälsa: skral-dom-kur + skrivgrind-vaccin + hela fyndloggen domad (spår 8, s8-u1)

**Manifest:** auto-s8-1790006726228 · **Agent:** s8-u1 (vakt 1/3) · **Datum:** 2026-09-21
**Anspråk:** disk-först 16:1xZ (`data/vakten/auto-s8-1790006726228-s8-u1-ansprak-feljakt-ledgerhalsa.md`) · **Reservation:** o145 under flock (`--nästa`, högsta kända o144, 144 källträffar)

## §0 — VAL

Duplikatkontroll före valet: worklog spår 8 + OPTIMERING igenlästa (senaste: o141
u1/u2 2026-09-21 — mimosa-återmätning + vakt-återmätning; inget tar detta objekt).
Inga syskonanspråk (u2/u3) på disk. Objektet = två MÄTTA sjukdomar i feljakts-
ledgern + 18 öppna fynd (färdigt mått från egen körning av feljakt-lage):

1. **8 bedömningsrader med ogiltig domklass** (VARN vid varje läsning) — läses-
   verktyget ignorerar dem, deras fynd kan visas öppna trots äkta bedömning.
2. **18 öppna äkta fynd (0 HÖGA)**: F5-logg 9 · F6-drift 7 · F1-kod 1 · F3-api 1.

## §1 — ROTORSAKA (bevisad i två lager)

**Lager 1 — skral-radernas natur** (rader 270–273, 496–497, 717–718 i
feljakt-bedomningar.jsonl, egen sondering):

- **Fritext-dom** (o145 §2a): `dom`-fältet glidit till fritext ("äkta + LÄKT",
  "äkta + KUR I KOD (deploy köad bakom RAM-fönstret)", "ÄKTA + KURERAD-LIVE — …",
  "frisk — eskalering avvisad…", "rotkurad (vaccinerad) — …") — inga av de fyra
  giltiga klasserna. `byggaBedomningar()` i feljakt-lage.mjs hoppar raden (VARN).
- **Nyckelglidning** (o145 §2b): fyra av raderna (270–273) skrevs med bedömarens
  EGNA ts/spår/fynd i stället för fyndradens exakta nyckel — bevis: rad 270:s
  nyckel `2026-09-19T06:08:23.736Z|s7-prestanda/drift|prod bygg-OOM-loop: … 03:19–05:29Z`
  (en-dash) medan fyndraden är `2026-09-19T05:33:00.000Z|s7-prestanda|prod
  bygg-OOM-loop: … 03:19-05:29Z` (bindestreck) — 0 fyndmatch. Alla fyra målfynden
  VISADE SIG ha giltiga domer redan (rotkurad@22:50 / rotkurad@19:31) — skral-
  raderna var äkta men hemlösa duplikat.
- **Hemlösa eskalerings-bedömningar** (496–497): bedömde FYNN-eskaleringar som
  aldrig skrev fyndrader (fyndloggen har "/andringar nätverksfel" endast 09-15 +
  deployfönster-rader 09-20; inga på 12:58/17:26) — fel ledger från början.
  Också självmotstridiga (rad 497: bedömnings-ts 17:26 FÖRE den refererade
  eskaleringen 17:31).
- **Rätt nyckel men fritext-dom** (717–718): domdTs 22:52:21.348Z — SENARE än
  giltig pagaende-dom@22:50:02.440Z på samma nyckel; avsikten (uppdatering till
  läkt) bevisad av innehållet och korrekt kronologi.

**Lager 2 — den strukturella roten**: skrivvägen saknade validering. Bedömningar
skrevs för hand (fritext tillåten, nyckel handskriven) — inget verktyg kontrollerade
kontraktet vid skrivtid. Kontraktet fanns ENDAST i läsaren (feljakt-lage), som
reagerar med VARN efter att skadan skett.

**Sidofynd (dokterat, ej åtgärdat — se §7)**: `f6-ram-stang.mjs` skriver domer
till `/home/ak1a/agent/ak1/data/vakten/feljakt-bedomningar.jsonl` (YTA-konstant)
medan läsesverktyget läser `/home/ak1a/AK1/data/vakten/feljakt-bedomningar.jsonl` —
två fysiska kopior (olika inoder, 788 vs 791 rader vid mätningen). Rund 127:s
domer nådde prod-repet via organens commit+push-flöde, så mönstret FUNGERAR för
organ med push-disciplin — men en körning utan commit+push skriver domer som
aldrig syns i läget. Agent-ytans kopia var REN mot sin HEAD (rond 146-bokföringen
13:39) ⇒ nästa prod-synk-pull synkar den hårfint; ingen driftbomb vid mättillfället.

## §2 — KUR 1: normaliseringen (kirurgi med bevarad historik)

Engångssond `verktyg/_s8u1o145-normalisera-skral.mjs` (idempotensavslag testat —
första körningen VÄGRADE skriva när planen var ofullständig, inget skedde):

- **Rad 270/271/272/273** → giltig dom `rotkurad` + RÄTT nyckel (kopierad ur
  fyndraden: OOM-loopen 05:33:00.000Z, manifest-offret 07:05:08.303Z,
  godkannande-500 08:13:33.267Z) + `domdTs = radens ursprungliga ts` ⇒ hierarkin
  bevaras: de förlorar mot yngre giltiga domer (22:50/19:31) exakt som kontraktet
  ("senaste domdTs vinner") kräver. Originaltexten bevaras i `domOriginal`,
  gamla nyckeln i `nyckelOriginal`, stämpel `normaliserad: "o145 s8-u1 §3"`.
- **Rad 496/497** → arkiverade till `data/vakten/feljakt-bedomningar-arkiv.jsonl`
  med motivering (hemlösa eskalerings-bedömningar). Inga rader förlorades.
- **Rad 717/718** → `rotkurad` (avsikten "äkta + LÄKT"), domdTs 22:52 bevarad ⇒
  vinner korrekt över pagaende@22:50 (händelsen läkt + korroborerad).
- **Backup FÖRE skrivning:** `data/vakten/skrap-arkiv/feljakt-bedomningar.backup-o145.jsonl`.

Bevis: feljakt-lage FÖRE (8 VARN-rader) → EFTER (0 VARN, 0 änklar). Klassglidning
418→420 rotkurad (717/718 vann som avsett); bedömda totalt oförändrad 760.

## §3 — KUR 2: skrivgrinden (permanent vaccin) — verktyg/feljakt-skriv-dom.mjs

Den nya ENDA vägen att skriva bedömningar. VÄGRAR vid skrivtid:

1. dom utanför de fyra klasserna (fritext-döden),
2. nyckel som inte matchar exakt en fyndrad — hemgjord nyckel = nyckelglidning,
3. bedömning utan fyndrad överhuvud (eskaleringar hör ej i fynd-ledgern),
4. append till ledger utan slutlig radbrytning (korrupt-radskydd).

o69-KOLLISIONSGRUPP-KONTRAKTET implementerat fullt ut: exakt nyckel som matchar
N identiska fyndrader → basdom tillåts med `antalTäckta: N`-kvitto (grinden var
först för strikt — avvisade live kollisionsgruppen; kurerad + svitfall T8).
Nyckelfälten ts/spår/fynd/allvar KOPIERAS ur fyndraden — aldrig handskrivna.

**Svit `verktyg/testa-feljakt-skriv-dom.mjs`: 18 PASS · 0 FAIL** (fritext-avslag,
glidnings-avslag, fältkopiering, prefix, tvetydig-prefix-avslag, append-icke-
destruktivitet, korrupt-ledger-vägran, okänd-nyckel-lämnar-hel-katalog, lage-
integration ×2, kollisionsgrupp ×2). Engångsfel under utvecklingen: svitens EGEN
fixture buggade (H2 raderade ledgern före T7) — verktyget oskyldigt, isolat-
verifierat först, sedan sviten rightad. GRINDENS FÖRSTA LEVANDE FÅNGST: den
avvisade min egen driv-rad med gliden nyckel ("RAM 340 MB — MemAvailable < 800 MB"
— MemAvailable-texten bor i bevisfältet) — vaccinet fångar sin konstruktör.

## §4 — KUR 3: F6-domerna (7 st) via grinden — dogfooding

`f6-ram-stang --torr` (rond 127:s fyra-källors evidensregel): alla 6 RAM-rader
STÄNGS klass V+F (två oberoende källor: prod-synkens VÄNTAR-RAM med attribution +
fabrikens zcode-fönster). Egna citationer: 12:37:25Z "754 MB … chrome-cron
levande (+1024)" och 12:47:25Z "694 MB … chrome-cron levande (+1024)" kring
12:43-fyndet. Verktyget kördes ENDAST torrt (skarpt läge skriver till agent-ytans
kopia — §1 sidofynd; domerna transporteras via grinden i stället). Sjunde domen:
05:28:20.226 "prod osvarar — deploybygg pågår" (räddningsbyggets flock-fönster,
RÄDDNING KLAR 05:31:04.990Z).

## §5 — KUR 4: F5/F1/F3-domerna (9 domer, 11 fyndrader)

Egen logggravning per fönster (prod-synk.log, kraschvakt.log, hjartslag.log,
agentfabrik/logg.jsonl):

- **23:13 agentfabrik "misslyckades" = FALSKT-POS**: loggraden är s8-u2:s LYCKADE
  o135-leverans (uppgift-klar kod 0, 1148 s) — F5-mönstret /misslyckades/i träffade
  FILNAMNET `o135-prodsynk-MISSLYCKADES-domning-s8.md` i leveransfältet. Orden är
  ett namn, inte ett fel.
- **23:43 arbetsyta-synk**: DESIGNSKYDD (ocommittade ändringar skyddas från
  radering); grönt kvitto 23:52:09Z "AGENTARBETSYTA synkad".
- **Nattens OOM-kedja 02:2x** (6 fyndrader, 4 domer — två kollisionsgrupper):
  byggfel 02:28:44 + ombyggfel 02:32:01 under RAM-svält (VÄNTAR-RAM 158 MB!)
  ⇒ pm2-loop ⇒ hjärtat fetch failed ×2 (02:31/02:41 — dess EGEN WEB-VAKT-restartar
  design) + kraschvaktens korrekta larm + räddningsbyggs-misslyckande 02:39.
  LÄKT: oom-återställningar var ~10 min → **ÅTERSTÄLLD grön 03:14:30** →
  **RÄDDNING KLAR 05:31:04**. Alla transient-design (o130/o131-krönika + rond 141).
- **05:24 kraschloop**: samma krönika, räddning SLUTFÖRD 05:31.
- **F1-timeout _r103-v209-manifest.mjs**: omkoll GRÖN (node --check exit 0) —
  kontrollens 10 s-tak under last, aldrig kodfel.
- **F3 /anvandning**: självläkt vid omtest (fyndradens eget bevis); färsk sond
  401 = auth-kontraktet LEVER.

## §6 — SLUTBEVIS

```
FELJÄKT-LÄGE (2026-09-21 16:2xZ, efter alla kurer):
Totalt fynd: 778 · bedömda: 778 · ÖPPNA ÄKTA: 0 (varav HÖG/KRITISK: 0)
falskt-pos: 9 · rotkurad: 420 · pagaende: 2 · transient-design: 347
VARN: 0 (före: 8 ogiltiga domklasser) · Änklar: 0
```

**FYNDLOGGEN HELT DOMAD** — andra gången i historien (o135 var första), första
gången med permanent skrivgrind. Kvarvarande pagaende (2) = medvetet öppna
åtgärdsposter (22:50-domarna), inte skral.

KVD: `tsc --noEmit` = **0 fel** (projektbinär, src orörd ⇒ INGET bygge — prod-
synken äger) · mimosa-paritet verktyg-scope = **GRÖN 0 fynd** (5 filer) · node
--check ×6 · R2 orört (priser/tier/publicering orörda) · data/blogg/ orört ·
src/ orörd · syskonytor orörda (u2/u3:s ytor icke vidragna; f6-ram-stang.mjs
och feljakt-lage.mjs körda endast; agent-ytan /home/ak1a/agent/ak1 lämnad ren —
inget skrevs där) · fyndloggen (feljägarens ägodata) orörd — endast bedömning-
ledgern kirurgerades med backup.

## §7 — KÖPOSTER (bokade, ej verkställda — andras ytor)

1. **FYNN-F5-vaccin** (feljagarens ägare, organ): mönstret /misslyckades/i bör
   exkludera träffar som kommer enbart från leverans-/filnamnsfält (§5 första
   fallet). V235-precedensen: vaccinationen är organets besord.
2. **f6-ram-stang YTA-konstant**: överväg prod-sökvägen eller en
   --vaktkatalog-flagga (dagens agent-yta-mönster fungerar ENDAST med
   commit+push-disciplin efter varje körning — tyst-förlust-risk dokumenterad
   här; organets beslut).
3. **Ledgerns dualism**: feljakt-bedomningar.jsonl är trackad-men-ignorad
   (data/vakten/ i .gitignore + ls-files-träff) — klassen worklog varnade om
   (s9-u3:s checkout-radering). Överväg antingen full trackning eller ren local-
   fil + tydlig ägarskapsskylt.

## §8 — LEVERANS

verktyg/feljakt-skriv-dom.mjs (ny, permanent) · verktyg/testa-feljakt-skriv-dom.mjs
(ny svit, 18/0) · verktyg/_s8u1o145-normalisera-skral.mjs (engångs, bevarad som
normaliseringsbevis) · verktyg/_s8u1o145-skriv-f6domer.mjs +
verktyg/_s8u1o145-skriv-resten.mjs (engångsdrivar) ·
data/vakten/feljakt-bedomningar.jsonl (normaliserad + 16 nya domer) ·
data/vakten/feljakt-bedomningar-arkiv.jsonl (nya, okompilerad runtime —
innehållet dokumenterat här) · detta protokoll · worklog.
