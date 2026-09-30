import type { CSSProperties } from "react";

/**
 * ZCODE-TEMA — EXAKT VISUELL KOPIA AV ZCODE DESKTOP 3.14.3 (mörkt läge).
 *
 * Kundens order: "ser ut som z code, fungerar som z code" — Z.ai:s remote/v4
 * fungerar inte i kundens telefon, så /studio får ZCode:s UTSEENDE på vår egen
 * motor. Denna fil är tema-sanningskällan; layout-komponenterna i
 * zcode-layout.tsx bygger på den.
 *
 * KÄLLA (utvunnen 2026-09-30 ur app.asar på servern — se worklog):
 *   @zcode/desktop 3.14.3 (package.json i arkivet), AppImage-mount
 *   /tmp/.mount_ZCode-⟨id⟩/resources/app.asar →
 *   /out/renderer/assets/styles-C8Nayk5k.css, block `.theme-zai-dark`.
 *   `.theme-zai-dark` är ZCode:s STANDARD-tema: themes-väljaren defaultar till
 *   `zai-dark` (styles-bunt.js: "So(`zcode-theme`)||`zai-dark`") och sätter
 *   klasserna `dark` + `theme-zai-dark` på <html>.
 *
 * NAMNGIVNING: prefix --zk-* i stället för ZCode:s egna --color-* — undviker
 * kollision med shadcn/tailwind-tokens i globals.css. Varje token behåller
 * ZCode:s semantiska namn (background, sidebar, input, …) för spårbarhet.
 *
 * Sammansättningar lösta till konkreta värden (ZCode använder color-mix som
 * fallback-as emot exakta hex — vi tar FALLBACK-hexen, som är de exakta
 * avsedda färgerna i zai-dark):
 *   --color-foreground: var(--color-neutral-300) = oklch(87% 0 0) ≈ #d4d4d4
 *   --color-foreground-subtle: neutral-300 60 %  → rgba(212,212,212,.6)
 *   --color-foreground-subtlest: neutral-300 30 % → rgba(212,212,212,.3)
 *   --color-input-border m.m.: var(--color-border) → #ffffff1a
 *
 * Fönsterunderlaget (Electron-<body> i index.html): hård gradient
 * linear-gradient(180deg,#000000,#151718) — finns som --zk-fonster-gradient
 * för autentisk ram runt appytan (brukas av helskärms/öppna-vyer).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Exakta temavärden ur .theme-zai-dark (ZCode Desktop 3.14.3). */
export const ZCODE_TEMA = {
  // ── Ytor ────────────────────────────────────────────────────────────────
  "zk-background": "#161616", // appens huvudyta
  "zk-sidebar": "#161616", // vänster sessionslista
  "zk-header": "#202020", // topprad
  "zk-panel": "#202020", // paneler/kort-bakgrund
  "zk-card": "#2b2b2b", // kort
  "zk-popover": "#2b2b2b",
  "zk-popover-header": "#202020",
  "zk-menu": "#2b2b2b",
  "zk-menu-hover": "#363636",
  "zk-toast": "#2b2b2b",
  "zk-tooltip": "#2b2b2b",
  "zk-tooltip-tag": "#363636",
  "zk-tab": "#202020",
  "zk-tab-active": "#161616",
  "zk-input": "#2b2b2b", // chatt-input & användarbubbel
  "zk-secondary": "#363636",
  "zk-tag": "#363636",
  "zk-accent": "#001d3d", // ZCode:s mörkblå accent-yta
  "zk-idle-task-surface": "#160d38",

  // ── Kanter / hover / val ───────────────────────────────────────────────
  "zk-border": "#ffffff1a", // 10 % vitt
  "zk-border-hover": "#ffffff26", // 15 % vitt
  "zk-border-strong": "#ffffff59", // workflow-trace (35 % vitt)
  "zk-hover": "#ffffff0d", // 5 % vitt
  "zk-selected": "#ffffff1a",
  "zk-surface": "#ffffff0d",
  "zk-surface-hover": "#ffffff1a",
  "zk-input-border": "#ffffff1a",
  "zk-input-border-hover": "#ffffff26",
  "zk-input-border-focused": "#ffffff26",
  "zk-workflow-rule": "#ffffff11", // 1/17 vitt — subtila linjer

  // ── Text ───────────────────────────────────────────────────────────────
  "zk-foreground": "#d4d4d4", // neutral-300 (oklch 87 % 0 0)
  "zk-foreground-subtle": "rgba(212,212,212,0.6)",
  "zk-foreground-subtlest": "rgba(212,212,212,0.3)",
  "zk-foreground-inverse": "#000000",
  "zk-tooltip-foreground": "#f8f8f8",
  "zk-tooltip-tag-foreground": "#adadad",

  // ── Varumärke / primär ─────────────────────────────────────────────────
  "zk-brand": "#ffffff", // ZCode zai-dark: brand = ren vit
  "zk-primary": "#ffffff",
  "zk-primary-foreground": "#000000",

  // ── Status ─────────────────────────────────────────────────────────────
  "zk-success": "#46bf72",
  "zk-destructive": "#ff5c5c",
  "zk-warning": "#ff8a30",
  "zk-diff-added": "#46bf72",
  "zk-diff-removed": "#ff5c5c",

  // ── Interaktion (fråga/bekräfta — agentens dialogkort) ─────────────────
  "zk-interaction-ask-surface": "#001d3d",
  "zk-interaction-ask-foreground": "#80beff",
  "zk-interaction-ask-fill": "rgba(70,191,114,0.24)",
  "zk-interaction-confirmation-surface": "rgba(70,191,114,0.16)",
  "zk-interaction-confirmation-foreground": "#87d9a4",

  // ── Trajektory (agentflödets färgspråk) ────────────────────────────────
  "zk-trajectory-user": "#60a5fa",
  "zk-trajectory-assistant": "#2dd4bf",
  "zk-trajectory-reasoning": "#a78bfa",
  "zk-trajectory-tool-call": "#f59e0b",
  "zk-trajectory-tool-result": "#38bdf8",

  // ── Terminal (kodblockets palett) ──────────────────────────────────────
  "zk-terminal-bg": "#161616",
  "zk-terminal-fg": "#d4d4d4",
  "zk-terminal-cursor": "#f8f8f8",
  "zk-terminal-selection": "rgba(64,153,255,0.28)",
  "zk-terminal-black": "#363636",
  "zk-terminal-red": "#ff5c5c",
  "zk-terminal-green": "#46bf72",
  "zk-terminal-yellow": "#ff8a30",
  "zk-terminal-blue": "#4099ff", // ZCode:s signaturblå
  "zk-terminal-magenta": "#7b5ce5",
  "zk-terminal-cyan": "#42c8c8",
  "zk-terminal-white": "#adadad",
  "zk-terminal-bright-black": "#747474",
  "zk-terminal-bright-red": "#ff9999",
  "zk-terminal-bright-green": "#87d9a4",
  "zk-terminal-bright-yellow": "#ffb26b",
  "zk-terminal-bright-blue": "#80beff",
  "zk-terminal-bright-magenta": "#a888f2",
  "zk-terminal-bright-cyan": "#8ee5e5",
  "zk-terminal-bright-white": "#f8f8f8",

  // ── Användningsdiagram (kontext-fönstret m.m.) ─────────────────────────
  "zk-usage-chart-1": "#4099ff",
  "zk-usage-chart-2": "#46bf72",
  "zk-usage-chart-3": "#7b5ce5",
  "zk-usage-chart-4": "#ff5c5c",
  "zk-usage-chart-5": "#ff8a30",
  "zk-usage-chart-6": "#42c8c8",

  // ── Sök/markering ──────────────────────────────────────────────────────
  "zk-find-highlight": "#542500",
  "zk-find-highlight-active": "#ff8a30",

  // ── Fonsterunderlag (Electron-body i index.html) ───────────────────────
  "zk-fonster-gradient": "linear-gradient(180deg,#000000 0%,#151718 100%)",
} as const;

export type ZcodeTemaNyckel = keyof typeof ZCODE_TEMA;

/**
 * CSS-variabler som style-prop: <div style={zcodeTemaCssVariabler}> —
 * savvy-nivån som ZCode själv sätter på <html class="theme-zai-dark">.
 * Alla --zk-* ovan blir tillgängliga för barnens
 * bg-[var(--zk-input)] etc.
 */
export const zcodeTemaCssVariabler = ZCODE_TEMA as unknown as CSSProperties;

/**
 * Typografi — ZCode:s egna stacks och UI-skala.
 * Källa: styles.css :root (--font-sans, --font-mono, --ui-font-size: 14px,
 * --text-ui-* = ui-font-size ± px).
 */
export const ZCODE_TYPOGRAFI = {
  /** Chattens brödtext. */
  fontSans:
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  /** Kod, verktygskort, terminal. */
  fontMono:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", monospace',
  /** Bas-storlek för UI-text (ZCode: --ui-font-size). */
  uiBasPx: 14,
  /** Skalan som CSS-variabler — text-[length:var(--zk-text-ui-sm)] etc. */
  textVar: {
    "zk-text-ui-2xs": "9px",
    "zk-text-ui-xs": "10px",
    "zk-text-ui-sm": "12px",
    "zk-text-ui-caption": "13px",
    "zk-text-ui-base": "14px",
    "zk-text-ui-lg": "16px",
    "zk-text-ui-xl": "18px",
  },
  vikt: { normal: 400, medium: 500, semibold: 600, bold: 700 },
} as const;

/** Layoutmått i px — ZCode Desktops komposition (w-64-sidolist, h-10-topprad). */
export const ZCODE_MATT = {
  /** Sidolistens bredd (w-64 i ZCode:s klasser; hopfällbar på mobil). */
  sidolistBreddPx: 256,
  /** Toppradens höjd (h-10). */
  toppradHojdPx: 40,
  /** Chattkolumnens maxbredd (max-w-3xl-mönstret i ZCode-transkriptet). */
  chattKolumnMaxPx: 768,
  /** Composerns maxhöjd innan scroll (max-h-60). */
  inputMaxHojdPx: 240,
  /** Radavstånd i chatt-text (leading-6). */
  chattRadhojdPx: 24,
  radii: { md: 6, lg: 8, xl: 12, "2xl": 16 },
  /** Scrollbar (ZCode: scrollbar-color: var(--color-border) transparent). */
  scrollbarFarge: "var(--zk-border)",
} as const;

/**
 * Kompletta stilvariabler (tema + typografi) i ett — använd på rotelementet:
 *   <ZcodeTemaRot> … </ZcodeTemaRot>  (zcode-layout.tsx breder detta).
 */
export const zcodeAllaCssVariabler: CSSProperties = {
  ...zcodeTemaCssVariabler,
  ...(ZCODE_TYPOGRAFI.textVar as unknown as CSSProperties),
  "--zk-font-sans": ZCODE_TYPOGRAFI.fontSans,
  "--zk-font-mono": ZCODE_TYPOGRAFI.fontMono,
} as CSSProperties;
