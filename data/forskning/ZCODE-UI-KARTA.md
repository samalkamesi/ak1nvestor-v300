# ZCODE-UI-KARTA — ZCode Desktop 3.14.3 chatt-gränssnitt, EXAKTA värden

**Syfte:** ge `/zcode`-sidan (src/app/(huvud)/zcode/zcode-klient.tsx) full
pixel-paritet med ZCode Desktop-appens chatt-UI, särskilt för telefon.

**Källa:** `/root/squashfs-root/resources/app.asar` (326 913 762 byte) —
extraherad ur `ZCode-3.14.3-linux-x64.AppImage` (samma binär som kör på
servern, PID-grupp "ZCode" verifierad 2026-09-30). Kartlagt 2026-09-30.

**KVD-källhänvisningsformat:** `asar:/out/renderer/assets/<fil>@<teckenoffset>`
(där filen är en-förs-en-byte den inre asar-sökvägen; teckenoffset = position
i den minifierade filen). Tre huvudkällor:

| Kortnamn | Asar-sökväg | Storlek | Innehåll |
|---|---|---|---|
| **CSS** | /out/renderer/assets/styles-C8Nayk5k.css | 410 172 B | kompilerad Tailwind v4 + samtliga teman |
| **APP** | /out/renderer/assets/styles-DEELZGp2.js | 6 097 444 B | huvud-React-bundle (chatt, composer, markdown) |
| **BTN** | /out/renderer/assets/button-Blgh4Uay.js | 5 307 B | Button-komponenten (cva-varianter) |

Råmaterialet för temaparsningen (alla block med offsets) ligger här:
`data/forskning/zcode-ui-karta/tema-block-med-offsets.txt`.
Live-skärmdump av den KÖRANDE appen (display :10, 412×915 = telefonformat,
mörkt tema): `data/forskning/zcode-ui-karta/zcode-3143-live-mobil-412x915.png`.

**Måttsystem (Tailwind v4, verifierat mot CSS):**
`--spacing: .25rem` ⇒ 1 enhet = 4 px. Radii: `--radius-xs:.125rem`(2 px) ·
`sm:.25rem`(4) · `md:.375rem`(6) · `lg:.5rem`(8) · `xl:.75rem`(12) ·
`2xl:1rem`(16) · `3xl:1.5rem`(24). Källa CSS @253k-området (grep
`--radius-`/`--spacing:`).

---

## 1. FÄRGSYSTEM (design tokens)

Appen använder Tailwind v4-tokennamn som CSS-variabler. Två teman: ljus
(`:root`) och mörk (`.dark`). Nedan ALLA chatt-relevanta token med exakta
värden. (Parstillstånd: hexvärdet före `@supports`-fallbacken; color-mix-
varianten står bredvid där den finns.)

### 1.1 Ytor, text, linjer

| Token | Ljust tema | Mörkt tema |
|---|---|---|
| `--color-background` | `var(--color-neutral-50)` = **#FAFAFA** | `var(--color-neutral-900)` = **#171717** |
| `--color-background-alt` | #F5F5F599 (60 % neutral-100) | #26262699 (60 % neutral-800) |
| `--color-header` | — (neutral-vit) | `var(--color-neutral-900)` = #171717 |
| `--color-panel` | — | `var(--color-neutral-900)` = #171717 |
| `--color-sidebar` | `var(--color-neutral-100)` = **#F5F5F5** | `var(--color-neutral-950)` = **#0A0A0A** |
| `--color-surface` | #0A0A0A08 (neutral-950 3 %) | #FFFFFF0D (vit 5 %) |
| `--color-surface-hover` | #0A0A0A0D (neutral-950 5 %) | #FFFFFF1A (vit 10 %) |
| `--color-hover` | = surface-hover | = surface-hover |
| `--color-card` | — | `var(--color-neutral-800)` = #262626 |
| `--color-card-selected` | — | `var(--color-neutral-700)` = #404040 |
| `--color-card-border` | = border | = border |
| `--color-popover` | — | `var(--color-neutral-800)` = #262626 |
| `--color-popover-header` | — | `var(--color-neutral-700)` = #404040 |
| `--color-selected` | #0A0A0A1A (neutral-950 10 %) | #FFFFFF1A (vit 10 %) |
| `--color-accent` | `var(--color-sky-50)` = **#F0F9FF** | #052F4A80 (sky-950 50 %) |
| `--color-border` | #0A0A0A1A (neutral-950 10 %) | #FAFAFA1A (neutral-50 10 %) |
| `--color-border-hover` | #0A0A0A33 (neutral-950 20 %) | #FAFAFA4D (neutral-50 30 %) |
| `--color-foreground` | `var(--color-neutral-700)` = **#404040** | `var(--color-neutral-200)` = **#E5E5E5** |
| `--color-foreground-subtle` | (neutral-600 60 % transparent) | #E5E5E599 (neutral-200 60 %) |
| `--color-foreground-subtlest` | (neutral-600 30 %) | #E5E5E54D (neutral-200 30 %) |
| `--color-foreground-inverse` | `var(--color-black)` | `var(--color-white)` |

Källor: CSS — ljust block @3592-17728 (`:root,:host`), mörkt block
@356673-365257 (`.dark`). Hel rådump: tema-block-med-offsets.txt.

### 1.2 Input/composer-specifika

| Token | Ljust | Mörkt |
|---|---|---|
| `--color-input` | — | `var(--color-neutral-800)` = #262626 |
| `--color-input-focused` | — | `var(--color-neutral-950)` = #0A0A0A |
| `--color-input-border` | = `--color-border` | = border |
| `--color-input-border-hover` | = `--color-border-hover` | = border-hover |
| `--color-input-border-focused` | `var(--color-brand)` | `var(--color-brand)` |

Källa: CSS @13646 (ljust) resp @358967 (mörkt).

### 1.3 Brand

| Token | Värde | Hex |
|---|---|---|
| `--color-brand` (ljust tema) | `var(--color-sky-400)` | **#00BCFF** |
| `--color-brand` (mörkt tema) | `var(--color-sky-500)` | **#00A6F4** |
| `--color-icon-blue` | = terminal-bright-blue | ljust: #00A6F4 · mörkt: #0084D1 |

Sky-skalan (konverterad från oklch med egen omvandlare, avrundning ±1):
sky-50 #F0F9FF · 100 #DFF2FE · 200 #B8E6FE · 300 #74D4FF · 400 #00BCFF ·
500 #00A6F4 · 600 #0084D1 · 700 #0069A8 · 950 #052F4A.
Källor: CSS @212/412 (brand), @356968 (mörk brand), sky-skalan i :root-blocket.

### 1.4 Trajectory-färger (meddelande-/händelsefärger i chattflödet)

| Roll | Ljust | Mörkt |
|---|---|---|
| `--color-trajectory-user` | **#2563eb** | **#60a5fa** |
| `--color-trajectory-assistant` | **#0f766e** | **#2dd4bf** |
| `--color-trajectory-reasoning` | **#7c3aed** | **#a78bfa** |
| `--color-trajectory-tool-call` | **#d97706** | **#f59e0b** |
| `--color-trajectory-tool-result` | **#0284c7** | **#38bdf8** |

Källa: CSS @213-218 (ljust), @412-417 (mörkt).

### 1.5 Status & misc

| Token | Ljust | Mörkt |
|---|---|---|
| `--color-success` | green-500 | green-500 |
| `--color-warning` | amber-500 (#F59E0B-klass) | amber-500 |
| `--color-destructive` | red-500 | red-600 |
| `--color-interaction-ask-fill` | #00C75833 (green-500 20 %) | #05DF723D (green-400 24 %) |
| `--color-interaction-confirmation-surface` | green-50 | green-950 45 % (#2F0D68-liknande oklab) |
| `--color-interaction-confirmation-foreground` | green-700 | green-300 |
| `--color-idle-task` | violet-500 | violet-400 |
| `--color-idle-task-surface` | — | #2F0D6880 |
| `--color-workflow-rule` | neutral-950 5,5 % | vit 6,5 % |
| `--color-workflow-trace` | neutral-950 30 % | vit 35 % |
| `--color-workflow-trace-strong` | neutral-950 55 % | vit 60 % |
| `--color-animated-gradient-text-strong` | #0A0A0A | #FFFFFF |
| `--color-animated-gradient-text-soft` | #0A0A0A38 | #FFFFFF33 |

### 1.6 Terminal-palett (för terminalpanel/kodvy)

Mörkt tema: bg neutral-950 (#0A0A0A), fg neutral-50 (#FAFAFA), cursor
neutral-50, selection sky-500 26 %. ANSI: black=neutral-800, red=red-600,
green=green-600, yellow=yellow-600, blue=sky-600, magenta=fuchsia-600,
cyan=cyan-600, white=neutral-200; bright-black=neutral-500.
Ljust tema: bg neutral-50, fg neutral-950, ANSI -500-varianter.
Källa: CSS @13646-14760 (ljust), @358967-360092 (mörkt).

---

## 2. TYPOGRAFI

### 2.1 Font-stackar (CSS @3592)

```
--font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
             "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
             "Liberation Mono", "Courier New", "Microsoft YaHei UI",
             "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", monospace
```

### 2.2 Storleksskalan — `--ui-font-size: 14px` (CSS rad 1, `:root`)

| Klass | Beräkning | Exakt |
|---|---|---|
| `text-ui-2xs` | ui − 5 px | **9 px** |
| `text-ui-xs` | ui − 4 px | **10 px** |
| `text-ui-sm` | ui − 2 px | **12 px** |
| `text-ui-caption` | ui − 1 px | **13 px** |
| `text-ui-base` | ui | **14 px** |
| `text-ui-lg` | ui + 2 px | **16 px** |
| `text-ui-xl` | ui + 4 px | **18 px** |

Font-vikter: normal 400, medium 500, semibold 600, bold 700 (CSS @3592).

### 2.3 Chattbrödtext (markdown-renderaren, "streamdown")

- Container: `size-full text-ui-base leading-[1.75] tracking-wide
  [&>*:first-child]:mt-0 [&>*:last-child]:mb-0` — dvs **14 px,
  radhöjd 27,25 px (1.75), letter-spacing 0.025em** (Tailwind `tracking-wide`).
  Källa: APP @1307700 (Zj-komponenten, C-variabeln).
- Stycke `<p>`: inga extra klasser (ärver). Källa: APP @1272308 (LYe).
- Rubriker (APP @1298319, NZe):
  - h1: `mt-6 mb-4 text-ui-xl font-semibold` (18 px)
  - h2: `mt-6 mb-4 text-ui-lg font-semibold` (16 px)
  - h3: `mt-6 mb-4 text-ui-base font-semibold` (14 px)
  - h4: `mt-6 mb-4 text-ui-base font-semibold` (14 px)
  - h5: `mt-6 mb-4 text-ui-base font-medium`
  - h6: `mt-6 mb-4 text-ui-base font-normal`
  - Alla sätts av gemensam komponent Xj med `data-streamdown="heading-N"` (APP @1307375).
- `strong`: `font-medium` (500 — ej 700). Källa: APP @1310920-blocket.
- Inline kod: `rounded-md bg-markdown-inline-code/50 mx-0.5 px-1.5 py-0.5
  font-mono text-ui-sm` (12 px, radius 6 px, halv transparent
  `--color-markdown-inline-code`). Källa: APP @1310920.
- Kodblock: wrapper `my-4 border border-border bg-card`, kodarea
  `pl-3 pr-2 pt-2`. Källa: APP @1310920.
- Blockquote: `my-4 border-border border-l-2 pl-3 text-foreground-subtle`.
  Källa: APP @1239347 (gJe).
- Punktlista: `my-3 list-outside list-disc space-y-1.5 pl-5
  marker:text-foreground-subtlest`. Källa: APP (ul-komponent, _Je).
- Nummerlista: `my-3 list-inside list-decimal space-y-1.5 pl-0
  marker:text-foreground-subtlest`. Källa: APP @1240202-förregion (vJe).
- Listobjekt: `pl-1 [&>p]:my-0 [&>p]:inline`. Källa: APP @1240189 (yJe).
- Tabell: `w-max min-w-full border-separate border-spacing-0 text-ui-base`.
  Källa: APP @1246k-regionen (YJe).

---

## 3. CHATTLAYOUT (shell → spalt)

### 3.1 Workspace-shell

`data-workspace-shell`-div: `relative flex h-full min-h-0 w-full
overflow-hidden` (+ `max-md:flex-col` i web-läge). Källa: APP @5204000-regionen.

### 3.2 Sidebar (vänster panel)

- Panel: `w-[var(--workspace-sidebar-panel-width)] max-w-[50%] flex-none
  overflow-hidden transition-[width,opacity] duration-200 ease-out` +
  `data-[workspace-sidebar-resizing=true]:transition-opacity`.
  Källa: APP @5313724.
- Inre `aside`: `h-full overflow-hidden select-none`. Samma källa.
- **Standardbredd 264 px** (`p5=264`), tangentsteg 16 px (`Rvn=16`),
  Home = 264 px, End = 50 % av container, pilar ±16 px; användarens bredd
  sparas i localStorage-nyckel `zcode:workspace-shell:sidebar-width-px`.
  Källor: APP @5287067 (konstanter), @5295000-5299600 (resize-logiken).
- CSS-variabler som shell sätter (APP @5299478):
  `--workspace-sidebar-panel-width`, `--workspace-sidebar-width`,
  `--workspace-panel-radius`.
- I mobil (`max-md:`): panelen blir horisontell — `max-md:!h-[var(--web-remote-navigation-height)]
  max-md:!w-full max-md:!max-w-none max-md:border-b max-md:border-border
  max-md:bg-sidebar` eller kollapsad `max-md:!h-0 … max-md:!border-b-0`
  (webb-fjärrstyrningsläge). Källa: APP @5204000-regionen.
- Sidopanelens innehållsortiment (aktivitetsikoner, MIe-mappen):
  book, browser, community, diff, feedback, folder, login, logout,
  **message** (chatt), mcp, settings, sidebarClose, sidebarOpen, skills,
  themeDark, themeLight, terminal. Källa: APP @1865000-förregion (MIe).

### 3.3 Header (över chattytan)

- `header` med `data-workspace-header-variant`:
  `@container/workspace-header relative flex w-full shrink-0 h-12 border-b`
  + varianten aktiv: `border-border/50` (draft: `border-transparent`).
  Källa: APP @4026008. ⇒ **höjd 48 px, kant 1 px border/50 %**.
- Inner: `flex h-12 flex-1 min-w-0 items-center justify-between gap-2
  overflow-hidden p-2 [app-region:drag] transition-[padding]
  duration-300` (+ responsiv `pl-38` när sidebar är kollapsad —
  152 px vänsterpadding för fönsterkontroller). Källa: APP @4026008-förregion.
- Drag-mask för ny uppgift: `absolute inset-0 z-40 bg-accent/55
  backdrop-blur-sm`. Källa: APP @4026008+.

### 3.4 Meddelandespaltens breddlogik (konversationscontainern)

Turn-sektion: `relative mx-auto flex w-full flex-col gap-5 px-4
@md/conversation:px-6 pb-5` + `pt-14` (första synlig) / `pt-0`.
Källa: APP @3064203-regionen.

Bredd (APP @2459953, _Ct + pCt/hCt/mCt @2460000-2460400):

| Läge | Klass | Effekt |
|---|---|---|
| Tom vy (centerad) | `max-w-2xl` | max **672 px** |
| Med innehåll, bas | `w-full` | hel bredd |
| ≥ 864 px container | `@min-[864px]/conversation:w-[calc(100%_-_6rem)]` + `max-w-4xl` | bredd −96 px, max **896 px** |
| ≥ 1280 px container | `@min-[1280px]/conversation:w-[calc(100%_-_24rem)]` + `max-w-6xl` | bredd −384 px, max **1152 px** |

Statuspanel öppen: `@min-[1280px]/conversation:-translate-x-42` (skjuter
spalten 168 px vänster). Källa: APP @2460340 (gCt).

Tomhetslayout: `flex min-h-full flex-col items-center justify-center gap-4
px-4` + spaltmellanrum `before:block before:min-h-[52px] before:w-full
before:shrink before:basis-[29dvh] after:block after:min-h-4
after:flex-1`. Källa: APP @3103000-regionen.

---

## 4. MEDDELANDEN

### 4.1 Användarmeddelande (högerställt)

- Rad: `group/user-row flex flex-col items-end` — dvs kolumn med
  **items-end = högerställd**. Källa: APP @3010900-regionen (GZ-wrapper).
- Bubbla: `flex max-w-full flex-col gap-2 rounded-xl rounded-tr-xs border
  border-border bg-surface px-4 py-3 text-ui-base text-foreground
  @min-[624px]/conversation:max-w-xl`
  ⇒ **radius 12 px men endast 2 px övre höger (rounded-tr-xs = 0.125 rem),
  1 px kant border-token, yta surface-token, padding 16 px/12 px,
  maxbredd 576 px vid ≥624 px container**. data-attribut
  `data-v4-user-input-bubble`. Källa: APP @3012661.
- Bifogade filer (piller ovanför bubblan): `flex max-w-xl flex-col
  items-end gap-2` (APP @3012071-förregion); varje piller
  `flex min-w-0 items-center gap-2 rounded-lg border border-border
  bg-surface px-3 py-1.5 text-ui-sm text-foreground hover:bg-surface-hover`
  med ikon `size-4`, namn `min-w-0 max-w-64 truncate`, storlek
  `text-foreground-subtlest`. Källa: APP @3106366-regionen.
- Media-bifogade: `flex max-w-full flex-wrap justify-end gap-2`
  (`data-v4-user-input-media-attachments`). Källa: APP @3012071.
- Statusrad under: `mt-1` + `data-v4-user-input-status`. Källa: APP @3013500+.
- Redigeringsläge: vanlig textarea `w-full max-w-xl` +
  `shellClassName: min-h-32`. Källa: APP @3010470-regionen.

### 4.2 Agentmeddelande (assistant turn)

- Sektion (per turn): se 3.4. Innehåller grupp
  `group/assistant-turn flex w-full flex-col gap-5` — **ingen bubbla,
  ingen kant: texten ligger direkt på bakgrunden**, vänsterställt, med
  20 px (gap-5) mellan block. Källa: APP @3064203+.
- Markdown-rendering enligt § 2.3.

### 4.3 Verktygsanrop (tool summary-rad)

- Trigger: `group/tool-summary inline-flex max-w-full cursor-pointer
  items-center gap-2 self-start text-left text-ui-base transition-colors
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-input-border-focused` (testid
  `tool-summary-trigger-<toolId>`). Källa: APP @zwt (cirka @2185000,
  sök "group/tool-summary").
- Innehåll: `tool-summary-content min-w-0 flex max-w-full items-center
  gap-2 text-foreground-subtlest`. Källa: Rwt, APP @zwt-förregion.
- Badge (t.ex. antal diffar): `shrink-0 rounded border border-border
  bg-background-alt px-1.5 py-0.5 text-ui-xs leading-none
  text-foreground-subtlest @max-[360px]/conversation:hidden`.
  Källa: APP @zwt-förregion (badge-variabeln).
- Chevron: `size-4 text-foreground-subtlest` med
  `transition-transform duration-200 ease-out` + `group-hover/tool-summary:opacity-100`.
  Källa: APP @zwt+.
- Markerad kryssruta (flermarkering): `size-4 rounded-sm border-foreground
  bg-transparent data-[state=checked]:border-foreground
  data-[state=checked]:bg-foreground data-[state=checked]:text-background`
  med `checkIconStrokeWidth:1.33`. Källa: APP @3064203-förregion.

---

## 5. COMPOSER (inmatningsområdet)

### 5.1 Dock (yttre fästet)

- Yttre: `pointer-events-none z-20 flex w-full justify-center` +
  antingen `mt-3 shrink-0` (sticky av) eller **`sticky bottom-0`**.
  `data-v4-composer-dock="true"`. Källa: APP @3103005.
- Inre: `pointer-events-auto relative z-10 w-full shrink-0
  transition-[width,max-width,transform] duration-150 ease-out
  @min-[1280px]/conversation:transition-[transform]` + `px-4 pb-4`.
  `data-v4-composer-dock-content="true"`. Samma breddklasser som
  meddelandespalten (§ 3.4). Källa: APP @3103179.

### 5.2 Inkorgsrutan

```
relative flex flex-col gap-3 overflow-hidden rounded-2xl border
border-input-border bg-input p-3 transition-colors
hover:border-input-border-hover
focus-within:!border-input-border-focused
focus-within:bg-input-focused
```
⇒ **radius 16 px, 1 px kant input-border, yta input-token, padding 12 px,
fokus = kanten blir brand-färgad + ytan input-focused**.
Källa: APP @1659649.

### 5.3 Textfältet (Lexical 0.42.0)

- Rich text-editor (Lexical), `namespace: "ChatInput"`. Källa: APP @1647074.
- ContentEditable-yta: `min-h-10 max-h-40 overflow-y-auto text-foreground
  outline-none` ⇒ **minhöjd 40 px, maxhöjd 160 px, auto-scroll**,
  testid `chat-input`. Källa: APP @1647074+ (r7e-användningen).
- Platshållartext (i18n, APP @1675828):
  - ny uppgift: `chat.placeholder.newTask` — "向 ZCode 提问…" (sv-eng
    motsvarighet "Ask ZCode…" i andra språk); @-kontext, /-kommandon
  - **mobil variant: `chat.placeholder.newTaskMobile`** — kortare
    "Ask ZCode…" (telefonläget använder `compactNewTask`)
  - påföljdskrav: `chat.placeholder.followUpAsk`
  - kö: `chat.placeholder.followUpQueue`
  - Vallogiken: funktion `snt` (APP @1675828).

### 5.4 Verktygsrad (under/kring fältet)

- `group/toolbar flex items-end gap-3`. Källa: APP @1660800-regionen.
- Vänster (leading actions): `flex min-w-0 flex-1 items-center` →
  `flex shrink-0 items-center gap-1` med
  `data-composer-leading-actions` / `data-composer-leading-content`.
  Innehåller +‑meny (bilagor/attachments, `chat.composer.attachment`),
  plugins m.m. Kompaktläge: `data-[composer-compact=icon]:size-7
  data-[composer-compact=icon]:justify-center
  data-[composer-compact=icon]:gap-0 data-[composer-compact=icon]:p-0`.
  Källor: APP @1660800+, @1943579.
- Höger (trailing): `ml-auto flex shrink-0 items-center justify-end gap-1.5`
  (`data-composer-trailing-actions`). Källa: APP @1660800+.
- Modellväljar-pill (höger): triggerknapp
  `flex h-7 shrink-0 items-center overflow-hidden rounded-lg border
  border-border bg-input transition-all hover:border-border-hover`
  (`flex h-7 items-center gap-1 px-2 text-ui-sm text-foreground`).
  Etikettkapsel: `inline-flex h-4 min-w-7 items-center justify-center
  rounded-sm bg-surface px-1 py-0 font-sans text-ui-base leading-none
  tracking-normal text-foreground-subtle` och
  `max-w-[45%] truncate font-sans text-ui-base leading-none
  tracking-normal text-foreground-subtle`. Källor: APP @1860639-regionen
  (ftt/nht), IIe/Ox @järnvägsregionen.

### 5.5 Send-/stop-knapp

- Send: `type="submit"`, **testid `chat-send-button`**, aria
  `chat.send` ("Send"), shortcut **Enter**, storlek `icon-md`
  (⇒ `size-7 rounded-lg` = 28 px, radius 8) med överskrivning
  `gap-1 rounded-lg bg-brand text-ui-base text-foreground-inverse
  hover:bg-brand/80`. Ikon: lucide **arrow-up** `size-4`.
  Källa: APP @1661967-regionen (sänd-JSX).
- Vid strömning: samma plats, `chat.stop` ("Stop", ikon lucide
  `circle-stop`: cirkel r10 + rect 6×6 rx1, fil
  circle-stop-BiBe8t6B.js), avbryt Esc. Källor: APP @1662000+,
  assets/circle-stop-BiBe8t6B.js.
- Avbryt/redigera-knapp (X): ghost `icon-lg` (size-8) med lucide `x`.
  Källa: APP @1660800+-regionen (yl-import @x-C5hAhxku.js).
- Flytande CTA-pill i composer-området: `flex items-center gap-2
  rounded-full border border-border bg-accent px-4 py-2 text-ui-base
  text-foreground shadow-sm`. Källa: APP @1655000-1660000-regionen.
- Overlay (drag-drop/draft): `pointer-events-none absolute inset-0 z-10
  flex items-center justify-center rounded-2xl bg-accent/55
  backdrop-blur-sm`. Källa: APP @1656000-regionen.

### 5.6 Köpiller (köade meddelanden)

Rad: `mb-2 flex max-w-xl flex-wrap justify-end gap-2`
(`data-v4-user-input-attachment-pills`-stil, samma klass på köpillerna).
Källa: APP @3012661-förregion.

---

## 6. BUTTON-BASkomponenten (alla knappar)

cva-definition (hela filen BTN):

- Bas: `group/button inline-flex shrink-0 items-center justify-center
  rounded-md border border-transparent bg-clip-padding
  text-ui-base/relaxed whitespace-nowrap transition-colors outline-none
  select-none disabled:pointer-events-none disabled:opacity-50
  [&_svg]:pointer-events-none [&_svg]:shrink-0
  [&_svg:not([class*='size-'])]:size-4`
- Varianter:
  - default: `bg-primary text-primary-foreground hover:bg-primary/80`
  - outline: `border-border text-foreground hover:border-border-hover
    hover:bg-input/50 hover:text-foreground aria-expanded:bg-input/50`
  - secondary: `bg-secondary text-foreground hover:bg-secondary/80`
  - **ghost: `text-foreground hover:bg-hover hover:text-foreground
    aria-expanded:bg-hover`**
  - destructive: `bg-destructive text-destructive-foreground
    hover:bg-destructive/90`
  - warning: `bg-warning text-warning-foreground hover:bg-warning/90`
  - link: `text-primary underline-offset-4 hover:underline`
- Storlekar:

| Storlek | Klass |
|---|---|
| default | `h-7 gap-1 px-2` |
| xs | `h-5 gap-1 rounded-sm px-2` |
| sm | `h-6 gap-1 px-2` |
| lg | `h-8 gap-1 rounded-lg px-2.5` |
| icon | `size-7` |
| icon-xs | `size-5 rounded-sm` |
| icon-sm | `size-6` |
| **icon-md** | `size-7 rounded-lg` |
| icon-lg | `size-8 rounded-lg` |

(`[&_svg:not([class*='size-'])]`-storlekar per nivå: default 3.5, xs 2.5,
sm 3, lg 4.) Källa: BTN hela filen (5 307 B).

---

## 7. IKONER

- Bibliotek: **lucide** via `createLucideIcon` (viewBox 24, stroke-baserade;
  fil per ikon i /out/renderer/assets/). Källa: assets/createLucideIcon-DCyUO5SG.js.
- Filikoner: material-icons-SVG:er via `material-icons/<namn>.svg`
  (mapp-typ-, filtillägs-mappning i APP @~858394-regionens filikonregistret;
  t.ex. tsx→react, md→markdown, json→json). Källa: APP @OCe/kCe/W_.
- Chattens ikoner (verifierade):

| Element | Ikon | SVG-data |
|---|---|---|
| Send | **arrow-up** | `M5 12l7-7 7 7` + `M12 19V5` (arrow-up-ReTlMnNe.js) |
| Stop | **circle-stop** | circle cx12 cy12 r10 + rect x9 y9 6×6 rx1 (circle-stop-BiBe8t6B.js) |
| Avbryt (X) | **x** | (x-C5hAhxku.js) |
| Chatt/täcke | **message** | `M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719` (message-*.js) |
| Chevron (utfäll) | chevron-down/right | `Is`=chevron-down m3 8 4-4 4 4 (APP-import) |
| Verktyg | wrench (wrench-CRoSfFKZ.js) | |

- Navigationsikon-mapp (APP @1865000-förregion, MIe): book, browser,
  community, diff, feedback, folder, login, logout, message, mcp,
  settings, sidebarClose, sidebarOpen, skills, themeDark, themeLight,
  terminal.

---

## 8. STARTSKÄRM / global chrome

Ur /out/renderer/index.html (`<style>`-block, inbäddat):

- `html, body, #root`: margin 0, 100 % × 100 %.
- `#root`: opacity 0 → `body.zcode-startup-ready #root` opacity 1,
  **transition opacity 0.16s ease**.
- Loading-skal: 96×96 px, `border-radius: 24px`, bakgrund
  `linear-gradient(180deg, #000000 0%, #151718 100%)`, kant
  `1px solid rgba(255,255,255,0.1)`, skuggor `0 20px 25px -5px
  rgb(0 0 0/0.2), 0 8px 10px -6px rgb(0 0 0/0.2)`.
- Logo: 56 px bred, vit.
- Animation: `startup-logo-pop 0.72s cubic-bezier(0.22, 1, 0.36, 1)`
  (0 %: scale .72/opacity 0 → 38 %: 1.045/1 → 58 %: .985 → 76 %: 1.008 →
  100 %: 1); `prefers-reduced-motion` avslutar direkt.

---

## 9. SKÄRMDUMP (live-bevis)

`data/forskning/zcode-ui-karta/zcode-3143-live-mobil-412x915.png` —
scrot av display :10 (Xvnc 412×915, telefonformat) där ZCode 3.14.3 KÖR
(PID 2383450, samma AppImage som kartlagts). Dominanta färger i dumpen:
#2B2B2B (yta) och #161616 (botten) = mörka temat (neutral-900 #171717 +
sammansatt yta; avvikelsen ±1-2 är fönsterkomposit). Tom display :11
dumpades också (800×360, 932 B blank).

---

## 10. PARITETSCHECKLISTA för zcode-klient.tsx

1. Basfont 14 px; skalorna enligt § 2.2; sans = systemstacken (ej Inter/Roboto).
2. Användarbubbla: radius 12 px UTAN topp-höger (2 px), kant border/10 %,
   yta surface 3-5 %, padding 16/12, max 576 px, högerställd kolumn.
3. Agenttext: INGEN bubbla — naken text, 14 px/1.75/0.025em, gap-5 mellan
   turns, markdown enl § 2.3 (strong = 500!).
4. Composer: rund 16 px-ruta, 12 px padding, fokus → brand-kant (ljus
   #00BCFF / mörk #00A6F4) + mörkare input-yta; fält 40→160 px autohöjd.
5. Send-knapp: 28 px, radius 8, bg-brand, pil-upp 16 px, Enter.
6. Verktygsrad: vänster bilagor/plugins, höger modellpill + send,
   gap 12 px (gap-3), piller 28 px höga.
7. Spalt: 672 px tom; ≥864 px → min(100 %−96, 896); ≥1280 px →
   min(100 %−384, 1152); padding 16 px (24 px ≥768).
8. Header 48 px, kant-botten border/50 %, dragbar.
9. Sidebar 264 px standard, mörkt tema #0A0A0A mot chatt #171717.
10. Mörkt tema = neutral-skalan (pga/pt exakta hex i § 1.1), brand
    himmelsblå; trajectory-palett för roller enl § 1.4.

---

## KVD

- Samtliga värden ovan har källhänvisning (fil + offset eller filnamn).
- Extraktionen är reproducerbar: AppImage `--appimage-extract` → egen
  asar-parsning (4-byte pickle-huvud, JSON-katalog @offset 16,
  datbas 8+pickleSize) → selektiv filextraktion (2 722 filer, 37,3 MB).
- Två oberoende bevislinjer: (a) statisk parsning av CSS/JS ur asar,
  (b) live-process på :10 + skärmdump + färghistogram som bekräftar
  mörka temat.
- Osäkerhetsmarkeringar: oklch→hex-konvertering ±1/kanal; `hN` (streaming-
  stopikon i send-knappen) kunde inte spåras till exakt fil men
  circle-stop-familjen är den enda stoppikonen i chattsammanhang;
  MIe-namnen är komponentvariabler vars exakta lucide-mappning delvis
  härledd ur importgrannskap.

*Byggd av fabriksagent (uppdrag: ZCode Desktop UI-karta) 2026-09-30.*
