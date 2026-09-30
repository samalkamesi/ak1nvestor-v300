# KVD — ZCode-tema (mörkt läge) för /studio

Uppdrag: kundens order "ser ut som z code, fungerar som z code" — ZCode
Desktop 3.14.3:s exakta tema som CSS-variabler + layout-komponenter.

## Källa (tema-sanningskällan)

- `@zcode/desktop` **3.14.3** (bevis: `/package.json` i app.asar).
- AppImage-mount `/tmp/.mount_ZCode-⟨id⟩/resources/app.asar` (326 913 762
  byte, rw-r--r-- — läsbar) → kopierad till /tmp och uppackad med egen
  asar-sond (pickel-huvudet: u32@12 = JSON-längd, index @ offset 16;
  27 059 filer).
- Tema-block: `/out/renderer/assets/styles-C8Nayk5k.css` (410 172 byte)
  → **`.theme-zai-dark`** = ZCode:s DEFAULT-tema (styles-bunt.js:
  `So('zcode-theme')||'zai-dark'`; sätter klasserna `dark` +
  `theme-zai-dark` på `<html>`).
- Kompositionsstilar: `/out/renderer/assets/styles-DEELZGp2.js`
  (6 097 444 byte) — Tailwind-mönster för composer
  ("rounded-xl border-input-border bg-input text-ui-base leading-6"),
  ghost-knappar, breddklasser (w-64 = 256 px dominerar).
- Fönsterunderlag: `/out/renderer/index.html` — body-gradient
  `linear-gradient(180deg, #000000 0%, #151718 100%)`.

## Exakta huvudvärden (ur .theme-zai-dark)

| Yta            | Värde      | Yta              | Värde          |
|----------------|------------|------------------|----------------|
| background     | `#161616`  | border           | `#ffffff1a`    |
| sidebar        | `#161616`  | border-hover     | `#ffffff26`    |
| header/panel   | `#202020`  | hover            | `#ffffff0d`    |
| input/card     | `#2b2b2b`  | selected/surface | `#ffffff1a`    |
| menu-hover     | `#363636`  | foreground       | `#d4d4d4`¹     |
| brand/primary  | `#ffffff`  | accent           | `#001d3d`      |
| success        | `#46bf72`  | destructive      | `#ff5c5c`      |
| warning        | `#ff8a30`  | terminal-blue    | `#4099ff`      |

¹ `var(--color-neutral-300)` = oklch(87 % 0 0) ≈ `#d4d4d4`;
  subtle = 60 % alfa, subtlest = 30 % alfa av samma.

Typografi: `--ui-font-size: 14px`; skala ui-2xs…ui-xl = 9/10/12/13/14/16/18
px; font-mono-stack med SFMono/Menlo/Consolas (se zcode-tema.ts).
Layoutmått: sidolist 256 px (w-64), topprad 40 px (h-10), chatt-kolonn
≤ 768 px, composer rundad 12 px (rounded-xl) med vit skicka-knapp.

## Leveranser

- `src/app/(huvud)/studio/zcode-tema.ts` — 90 tokens + typografi + mått +
  `zcodeAllaCssVariabler` (style-prop, prefix `--zk-*` mot kollision med
  shadcn-tokens).
- `src/app/(huvud)/studio/zcode-layout.tsx` — ZcodeTemaRot, ZcodeSkal,
  ZcodeSidolist, ZcodeTopprad, ZcodeModellIndikator, ZcodeChattYta,
  ZcodeAnvandarBubble, ZcodeAgentMeddelande, ZcodeVerktygskort,
  ZcodeTankarad, ZcodeInputRad. Ren presentationskod — studio-chatten
  (13 521 rader) är orörd och kan adoptera stegvis.
- `ak1a-reference/zcode-tema/mork-desktop.png` (1440×900 @2x) och
  `mork-mobil.png` (390×844 @2x) — förhandsvisning genererad UR
  zcode-tema.ts (90 tokens parsade ur filen, inte handskriven HTML).

## KVD-resultat (2026-09-30)

1. **tsc 0 fel** — `node node_modules/typescript/bin/tsc --noEmit` →
   0 fel (baslinjen hålls; en kommentar innehöll `*/` i en sökväg som
   stängde blockkommentaren i förtid — åtgärdad innan grinden).
2. **Skärmdump** — puppeteer-core + Chrome 154 (puppeteer-cachen):
   desktop + mobil ovan.
3. **DOM-verifiering 26/26 PASS** — beräknade stilar i den renderade
   förhandsvisningen jämförda mot exakta förväntade värden: bakgrunder
   rgb(22,22,22)/rgb(32,32,32)/rgb(43,43,43), kanter rgba(255,255,255,0.1),
   radier 12 px, textstorlekar 14/12/10 px, sidolist 256 px, topprad
   40 px, kolonn 768 px, trajektory-färger #f59e0b/#a78bfa,
   status #46bf72. 0 FAIL.

## Gränser (ärlighet)

- Bubbel-/knappdetaljer i transkriptet är tolkade ur Tailwind-mönstren i
  styles-bunt.js (bg-input/rounded-xl etc.) — ZCode:s hashade
  komponentklasser går inte att en-till-en mappa; samtliga FÄRGER är
  exakta ur .theme-zai-dark.
- Integration i studio-chat.tsx (byte av befintligt skal) är nästa steg
  och ägs av den som äger den filen.

Pedagogisk plattform — inte investeringsråd.
