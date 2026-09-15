# PI-TUI-UPPSTREAM — öppna pi (earendil-works) som kallkodsreferens för studions TUI-paritet

> Forskningsrond 2026-09-11 · Kunddirektiv: "forska titta på nätet överallt läs böcker".
> Ägare: forskningsagent AK1A. ALDRIG kopiera kod — vi bygger egen implementation;
> citat max en rad. V = kundvärde 1-5, A = ansträngning 1-5 (ZCODE-GAP-REGISTER:s skala).

## 1. Projektöversikt

- **Repo:** github.com/earendil-works/pi — MIT-licensierad "unified LLM API, agent loop,
  TUI, coding agent CLI"; hem för en "self extensible coding agent" (docs: pi.dev).
- **Monorepo-paket:** `pi-coding-agent` (CLI), `pi-agent-core` (agentruntime med
  verktygshantering), `pi-ai` (enat multi-provider-LLM-API), **`pi-tui`**
  (terminal-UI med differentiell rendering), `chord` (appkomposition), `pi-telemetry`.
- **Kulturellt:** RFC-process för planer, sandboxning via tre mönster (Gondolin
  micro-VM / Docker / OpenShell), supply-chain-härdning (exakta versioner, låsfil
  som sanning, `--ignore-scripts`), fristående binärer som byggs offline.
- **Aktualitet:** pi-tui 0.85.1 (2026-09-05) — aktivt underhållen; changelog visar
  tät releasekadens (0.84.0 → 0.85.1 på en månad).

## 2. pi-tui — vad paketet är

README beskriver sig i en rad som ett minimalt terminal-UI-ramverk med differentiell
rendering för flimmerfria CLI-appar. Grundpelare:

- **Differentiell rendering + synkroniserad output (CSI 2026):** endast ändrade
  rader målas om, atomärt, flimmerfritt.
- **Två utbytbara renderare bakom gemensamt gränssnitt:** `TuiMainScreen`
  (huvudbuffert, bevarar terminalens scrollback) och `TuiAltScreen` (fast viewport i
  alternativ buffert, appägd scrollning, återställer vid stopp).
- **Mus (endast alt-screen):** SGR-normalisering, träfftestning, hjulchaining,
  drag-markering med urklipp, scrollbar-tummar, klickbara länkar.
- **IME-stöd:** Focusable + CURSOR_MARKER så hårdvarumarkören placerar CJK-kandidatfönster rätt.
- **Bracketed paste:** klistra-in över ~10 rader blir markörer (`[paste #1 +50 lines]`).
- **Inline-bilder:** Kitty-grafikprotokoll + iTerm2, textplatshållare som fallback.
- **Teman:** de flesta komponenter tar tema-gränssnitt (EditorTheme, MarkdownTheme,
  SelectListTheme, SettingsListTheme, ImageTheme).
- **Sökpanel:** Ctrl+Shift+F slår på matchnavigering i alt-screen-scrollviews,
  inklusive hopp via OSC 133 prompt-markörer.
- **Layout (alt-screen):** VStack/HStack/ScrollView med basis/grow/shrink/
  minSize/maxSize; "dock"-mönstret håller editor+status fixerad medan transkriptet scrollar.
- **Överlägg:** showOverlay med förankring/procent/absolut position, responsiv
  synlighet, fockushantering via OverlayHandle.
- **Terminalabstraktion:** ProcessTerminal (stdin/stdout) och VirtualTerminal
  (@xterm/headless, för tester) — så hela UI:n kan köras huvudlöst i test.

### Komponentförteckning (17 inbyggda)

Text · TruncatedText · Input · Editor · Markdown · Loader · CancellableLoader ·
SelectList · SettingsList · MouseRegion · Spacer · Image · Box · Container ·
VStack · HStack · ScrollView

**Editor-funktioner:** flerradig redigering med radbrytning, slash-kommando-autocomplete,
Tab-filsökvägskomplettering, hantering av stora klistra-in, fejk-markör med dold äkta
markör, klick-för-position, dynamisk ram padding, Alt+Enter för ny rad.
**Markdown-funktioner:** rubriker, betoning, kodblock, länkar, blockcitat, valfri
syntaxmarkering via krok, render-cache, Unicode/LaTeX-rendering.

### Förhöjda funktioner ur changelog (ur ett studioperspektiv)

- Inkrementell fullskärmssökning Ctrl+Shift+F med Enter/Ctrl+G-navigering (0.84.2),
  omarbetat sök-UI med resultaträkning och klickbara pilar (0.84.4).
- OSC 133 prompt-navigering: hopp mellan turer i transkriptet (0.84.0).
- Staplade transienta notiser (0.84.0); klickbar "hopp till slutet"-etikett (0.85.0).
- Kill ring / ångra i editorn (0.49.x/0.52.8); konfigurerbar keybinding-manager med
  namespaced ID:n (0.61.0).
- Fuzzy-matchning för slash-kommandon (0.43.0); debounce/avbryt för @-filuppslag (0.63.0);
  symlink-genomträngning (0.68.1); triggertecken per provider (0.79.1).
- Dubbelklick ord / trippelklick stycke (0.84.1); copyOnSelect-alternativ (0.84.4);
  LaTeX-rendering i Markdown (0.84.0/0.85.0).

## 3. Kontroll av uppgiftens exempelgissningar

- **Tabbar:** pi-tui har INGEN tabb-komponent. Inte ett uppströmsgap — ej relevant för oss.
- **Hjälpsystem:** inget hjälpsystem i pi-tui-paketet (README/changelog/plan tiga).
- **Teman:** tema-gränssnitt finns, men vårt register #15 är STÄNGT-som-beslut
  (kunden valde fast mörkt) — vi föreslår INTE teman.
- **Editor-funktioner:** se ovan; de paradigm-studierna (web textarea/CodeMirror)
  har de flesta nativt.

## 4. PARITETSFYND — nya kandidater för ZCODE-GAP-REGISTER (max 8, rankat på kundvärde)

Sötpris-kriterium enligt registrets regel 1 (högst V/A-kvot först inom samma V).
Alla är funktioner pi-tui har som varken z code-studion använder i vår implementation
eller som finns som poster i registret idag.

| # | Kandidat (pi-tui-förebild) | Studio idag | V | A | Not |
|---|---|---|---|---|---|
| P1 | **Transkriptsökning** — inkrementell sökpanel i konversationen med nästa/förra-navigering, resultaträkning och klickbara pilar (Ctrl+Shift+F, 0.84.2/0.84.4) | Saknas helt | 4 | 2 | SKILJ från register #14 (sök i prompt-HISTORIK/input): detta är fulltextsök i agentens SVAR. Långa sessioner = högt värde |
| P2 | **Input-autocomplete** — fuzzy slash-kommandon + @-filuppslag med debounce/avbryt och träffordning (0.43.0/0.63.0/0.79.1) | Saknas | 4 | 3 | @-filreferenser i chattnmatningen; kombinera med studions kommandobibliotek |
| P3 | **Turmarkörer + hopp mellan turer** — OSC 133-analog: knapp/genväg som hoppar föregående/nästa tur i transkriptet (0.84.0) | Saknas | 3 | 1 | Billig; para gärna med P1 (sök+turn-hopp samma navigeringsskikt) |
| P4 | **"Hopp till slutet"-indikator** — klickbar etikett som visas när användaren scrollat upp, med hopp tillbaka (0.85.0) | Saknas | 3 | 1 | Välbeprövat chattmönster; höjer känslan av levande session |
| P5 | **Stora paste-markörer** — klistra-in över N rader kollapsas till expanderbar markör i inmatning/transkript (README + 0.58.0, atomära segment) | Obehandlat: stora paste dumpas rått | 3 | 1 | Skyddar transkriptlayout och kontextfönster |
| P6 | **Transient toast-stack** — staplade, självförsvinnande in-app-notiser (0.84.0) | Enstaka statusrader | 3 | 1 | SKILJ från register #4 (web-notiser vid ej fokus, STÄNGT): detta är in-app-lager |
| P7 | **Keybinding-manager** — remappbara genvägar med namespaced ID:n och listbara bindningar (0.61.0) | Fast hardkodade genvägar | 3 | 2 | Växer i värde med antalet lägen; förutsättning för framtida V/A-snabbgenvägar |
| P8 | **LaTeX i Markdown** — Unicode/LaTeX-rendering av formler i chatt-svar (0.84.0/0.85.0) | Saknas | 2 | 2 | Syskon till register #10 (Mermaid, ÖPPEN) — samma renderarrör kan bära båda |

**Runner-up (under cuttoffen, sparade här för framtida omrankning):** kill ring i
inmatningen (V2 A1); SettingsList med cyklande värden (V2 A2); råoutput-debuglogg
motstycke till PI_TUI_WRITE_LOG för supportsärenden (V2 A1).

## 5. Icke-gap — där webb/studion redan är starkare än uppströms

Differentiell rendering (DOM-diff nativt) · drag-markering + urklipp + copyOnSelect
(register #8 STÄNGD, webb nativ) · dubbelklick ord/trippelklick stycke (webb nativ) ·
IME/CJK-markör (webb nativ; CJK-diff täcks av #9) · inline-bilder (webb-img nativt
starkare än Kitty/iTerm2) · klickbara länkar (webb nativ) · överläggspositionering
(webb-modaler/CSS starkare) · proportionella scrollbars med tummar (CSS) ·
layout basis/grow/shrink (flexbox) · TruncatedText/radbrytning med ANSI (CSS).
VirtualTerminal (@xterm/headless) förtester bekräftar register #13 (ÖPPEN) — förstärker,
ersätter ej.

## 6. Slutsats

pi-tui är värd namnet kallkod: det är z code:s TUI-fundament och dess senaste
releasewåg (0.84–0.85) handlar nästan uteslutande om **navigering och inmatning i
långa transkript** — sök, tur-hopp, hopp-till-slut, paste-markörer, autocomplete.
Det är exakt den axel där studion har störst outnyttjad kundvinst: P1+P3+P4+P5
(V12/A5 sammanlagt) vore en koherent "navigeringsrond". Uppströms saknas tabbar
och hjälpsystem — inga nya poster därifrån.

## Källor

- https://github.com/earendil-works/pi — README, projektstruktur, paketlista (hämtat 2026-09-11)
- https://github.com/earendil-works/pi/tree/main/packages/tui — paketstruktur (hämtat 2026-09-11)
- https://github.com/earendil-works/pi/blob/main/packages/tui/README.md — funktioner, komponenter, API-yta (hämtat 2026-09-11)
- https://github.com/earendil-works/pi/blob/main/packages/tui/CHANGELOG.md — versioner 0.84.0–0.85.1 (hämtat 2026-09-11)
- https://github.com/earendil-works/pi/blob/main/tui-plan.md — layoutplan alt-screen, icke-mål (hämtat 2026-09-11)
- Eget register: `data/forskning/ZCODE-GAP-REGISTER.md` (V/A-skala, statusposter)
