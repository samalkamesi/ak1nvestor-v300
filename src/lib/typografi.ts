import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";

/**
 * TYPOGRAFI — VÅG 84 SPIKE (agent V84-SPIKE; STYRELSE-VAG84-PLAN steg 1).
 *
 * ⚠️ DÖD KOD — FÅR EI IMPORTERAS FRÅN AKTIVA RUTTER ÄN (0 imports i nuläget).
 * Filen är den deploybara förberedelsen inför html-lang-route-group-flyttet
 * (STYRELSE-SPEGLAR-P2 §2): de fyra next/font-instanserna lyfts ur
 * src/app/layout.tsx till modul-singletons så att ALLA TRE framtida
 * rot-layouterna — (huvud) sv, (en), (ar) — delar EXAKT samma fontobjekt
 * (identiska CSS-variabler, identisk preload, ingen koddubblering).
 *
 * Flytt-agentens kontrakt (steg 2):
 *   1. Varje ny rot-layout: `import { typografiKlasser } from "@/lib/typografi"`
 *      — eller hellre: lät <GlobaltSkal> (src/components/ak1a/globalt-skal.tsx)
 *      äga body-klassen helt, layouten ropar bara <GlobaltSkal lang="…">.
 *   2. Fontinstanserna nedan är KOPIAN av src/app/layout.tsx:25-58 — rader
 *      därutur tas BORT ur layout.tsx när flyttet sker (en sanning).
 *   3. Ingen ändring i konfigurationen (subsets/weights/preload) får ske här
 *      utan eget beslut — grunden är "906 = 906 förbyggda sidor, visuellt
 *      identisk" (VAG84-PLAN steg 3).
 */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// VÅG 68 PRESTANDA B (o1 #9): Source Serif delas i två instanser — normal
// (400/600/700) preloadas; italic lämnas ur preload-listan (hämtas on demand
// med display:swap när serif-kursiv löptext renderas). Eftersom Google
// tjänar variabla woff2-filer är filunderlaget oförändrat: RIKTIG italic
// behålls för alla vikter, bara preloaden försvinner.
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal"],
});

const sourceSerifKursiv = Source_Serif_4({
  variable: "--font-serif-kursiv",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["italic"],
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Body-klassraden — identisk med dagens src/app/layout.tsx:210-212. */
export const typografiKlasser = `${inter.variable} ${sourceSerif.variable} ${sourceSerifKursiv.variable} ${jetbrainsMono.variable}`;
