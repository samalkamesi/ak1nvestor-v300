# KONTROLL 9 — Diff-bläddring /diff med radnummer+CJK (z code TUI)

Datum: 2026-09-11 · Kontrollant: kontrollagent (AK1A) · Läge: skrivskyddad mot src/

## Källan (z code TUI, på server)

Filer lästa via SSH:

- `packages/zcode-tui/src/file-diff-view.ts` (495 r)
- `packages/zcode-tui/src/file-diff-budget.ts` (171 r)
- `packages/zcode-tui/src/turn-diff-store.ts` (100 r)
- `packages/zcode-tui/src/diff-browser.ts` (93 r)

Källans delfunktioner:

1. **Radnummer, dual gutter** — `renderCodeLine` (file-diff-view.ts ~466–480):
   `${oldLabel.padStart(digits)} ${newLabel.padStart(digits)} │${marker} ` när
   bredd ≥ 24; `digits` från `maximumLineNumber()` (~306–317); old/new-räknare
   stegras per markör i renderloopen (~412–421). Fortsättningsrader får tom
   gutter.
2. **Ordnivå-diff** — `wordDiffLines` (~327–353) med `diffWordsWithSpace`
   (npm-paketet `diff`) + `sanitizeTerminalText`; `changedWords` (~355–382)
   parar konsekutiva −/+ block i hunkar och highlightar ändrade fragment via
   `theme.diffAddedWord/diffRemovedWord` + kodhighlighter.
3. **CJK-säker radbrytning** — `wrapTextWithAnsi`, `visibleWidth`,
   `truncateToWidth` ur `@earendil-works/pi-tui` (wcwidth-medvetna, hanterar
   dubbelbredd CJK + ANSI); `padded()` fyller efter synlig bredd;
   `stringPrefix` i file-diff-budget.ts är surrogate-pars-säker.
4. **Budget mot enorma diffar** — file-diff-budget.ts:
   `MAX_RETAINED_DIFF_FILES=32`, `MAX_RETAINED_DIFF_LINES=2 000`,
   `MAX_RETAINED_DIFF_CHARACTERS=250 000`, metadata-cap 4 096 tecken;
   `boundedFileDiffs` trunkerar surrogate-säkert + sätter `truncated`-flagga.
   Render-nivå: 8 filer / 8 hunks / 160 rader + `expanded` (Ctrl+O) +
   trunkeringsmeddelanden. TurnDiffStore: max 20 turnar +
   `enforceCurrentBudget` (kvarvarande budget fördelas omvänt över
   verktygskall).
5. **Diff-bläddring** — diff-browser.ts: `diffBrowserSources` = "Current
   changes" (workspace-diff.ts) + Turn N i omvänd ordning med ±N och
   prompt-rad; `DiffDetailPage` paginerar filens alla rader (pageCount/render).

## Studion (AK1A, webbkopia)

Filer lästa (endast läst): `src/components/ak1a/studio-chat.tsx` (11 693 r),
`src/lib/studio/kommandon.ts`, `src/lib/studio/studio-transport.ts`,
`src/app/api/studio/andringar/route.ts`.

- `Filandring` (studio-chat.tsx:236–244): sokvag/plus/minus/rader + `punkter`
  (oldStart/oldLines/newStart/newLines/rader) — radnummer bärs i datat men
  används ENDAST till markering i kodvyn.
- `KodvyFil` (studio-chat.tsx:2544–2783): hämtar filen, syntaxmarkerar,
  gula ändrade rader + röda spökrader, EN kolumn radnummer (`w-8`, rad
  2744), MAX_VISADE=200.
- `AndringsPanel` (2789–2860): filrader med ±N-badges; expanderad rad-diff
  (2838–2851) renderar `{+|−} {r.text}` — INGA radnummer.
- `DiffForhandsvisning` (2866–2900): permission-diff, samma rad-rendering
  utan radnummer.
- Budget: studio-transport.ts:3060–3062 `MAX_RADLANGD=200`,
  `MAX_RADER_PER_FIL=400`, `MAX_FILER=12`; hunk-rader cap 120 (5444); ±N är
  ärliga heltal även vid kapning; sessionStorage-clamp 50 rader / 20 punkter
  / 40 rader-per-punkt (studio-chat.tsx:662–666).
- Kommandon (kommandon.ts): help, ny, modell, komprimera, installningar,
  filer, fardigheter, styrelsen, automation, sparad — INGET /diff.
- `/api/studio/andringar`: senaste turnens ändringar endast.

## Dom per delfunktion

| # | Delfunktion | Dom | Motiv |
|---|---|---|---|
| 1 | Radnummer i diff-rader | **GAP** | Kodvyn har nya-filens radnummer, men diff-raderna (AndringsPanel + DiffForhandsvisning) saknar old/new-gutter helt; punkternas oldStart/newStart används bara till färgmarkering. |
| 2 | Ordnivå-diff | **GAP** | Någon `diffWords*`/word-diff finns ingenstans i src — endast helrads ±. |
| 3 | CJK-säker radbrytning | **STÄMD** | Webbens DOM bryter själv (`whitespace-pre-wrap break-all`, studio-chat.tsx:2740/2844/2890); surrogatpar/CJK kan aldrig söndras av renderingen — ekvivalent säkerhet annan mekanism. |
| 4 | Budget mot enorma diffar | **STÄMD** | Ekvivalent funktion med lägre gränser: 12 filer/400 rader/200 tecken per rad/hunk-cap 120 + ärliga ±N + sessionStorage-clamp; källans 32/2 000/250 000 är TUI-retention, inte funktionskrav. |
| 5 | Diff-bläddring /diff | **GAP** | Ingen /diff-kommando, ingen sammanhängande bläddrare över "current changes + turnar"; endast per-turn-paneler i historiken + GET senaste turnen. |

## Fix-skiss (endast data/forskning — src ägs av andra barn just nu)

1. **Radnummer i diff-rader** (studio-chat.tsx):
   - AndringsPanel rad-diff ~2840–2850: när `fil.punkter` finns, iterera
     hunkar och håll `oldLine`/`newLine`-räknare per markör (källans modell,
     file-diff-view.ts renderloop ~412–421); rendera två `w-8 text-right
     select-none text-[#484F58]`-span före `{r.typ}`-span. Faller tillbaka på
     tomma etiketter för Write (+ bara newLine från newStart).
   - DiffForhandsvisning ~2886–2895: samma gutter; kräver att transportens
     Edit-förhandsdiff (studio-transport.ts ~3187–3218) berikas med
     `punkter`-form (oldStart=1/newStart=1 per edit-par, som källans
     previewEditDiff).
2. **Ordnivå-diff**: `npm i diff`; client-modul `wordDiff(rader)` som med
   `diffWordsWithSpace` delar -/-parade rader i fragment; rendera ändrat
   fragment med `<span className="rounded-sm bg-sky-500/20">` inuti
   grön/röd rad (AndringsPanel + DiffForhandsvisning). Parning av −/+-block
   som källans `changedWords`.
3. **/diff-bläddring**: ny kommandopost i kommandon.ts (`diff`) + drawer som
   listar turnar i omvänd ordning (prompt-rad + ±N, som
   `diffBrowserSources`); datakälla: utöka `/api/studio/andringar` med
   `?turn=alla` (transporten har redan per-meddelande-ändringar i
   session-state); detaljvy med nästa/förra-paging ~160 rader/sida
   (DiffDetailPage-modellen).

## Slutsats

Post 9 är delvis uppfylld: radbrytningssäkerhet och budget är på plats
(webbens egna mekanismer + transportens caps), men tre kärndelar saknas —
radnummer i diff-raderna, ordnivå-diff och /diff-bläddringen själv.

GAP — Studion saknar radnummer i diff-raderna, ordnivå-diff och hela /diff-bläddringen; endast CJK-radbrytning och diff-budget är funktionellt ekvivalenta med z codes TUI.
