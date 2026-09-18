import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";

/**
 * TYPOGRAFI — VÅG 84 SPIKE (agent V84-SPIKE; STYRELSE-VAG84-PLAN steg 1);
 * AKTIV KÄLLA sedan VÅG 85 (html-lang-massflyttet): src/app/layout.tsx
 * raderades och alla tre rot-layouterna ((huvud)/(en)/(ar)) rullar sina
 * dokument via <GlobaltSkal> som sätter typografiKlasser på <body>.
 *
 * ⚠️ ÄNDRINGAR HÄR TRÄFFAR ALLA TRE SPRÅKROTARNA SAMTIDIGT — de fyra
 * next/font-instanserna är modul-singletons som delas av alla layouter
 * (identiska CSS-variabler, identisk preload, ingen koddubblering).
 *
 * Flytt-agentens kontrakt (steg 2 — INFRIAT våg 85):
 *   1. Varje rot-layout ropar <GlobaltSkal lang="…"> som äger body-klassen.
 *   2. Denna fil är sanningen; gamla instansdeklarationer i layouter
 *      togs bort atomärt vid flyttet.
 *   3. Ingen ändring i konfigurationen (subsets/weights/preload) utan
 *      eget beslut — grunden är "906 = 906 förbyggda sidor, visuellt
 *      identisk" (VAG84-PLAN steg 3). Undantag som BESLUTATS:
 *      jetbrainsMono preload:false (VÅG 96 D1) och serif-kursiv
 *      preload:true (VÅG s7-u1/o54) — se kommentarerna vid instanserna.
 */

// VÅG s7-u3 (2026-09-15, prestandaspåret): ALLA fyra fonter display:
// "optional" (var "swap"). Bevis — Lighthouse mobil + CDP-skiftsond
// (verktyg/prestanda-skiftspar.mjs): vid font-swap ändrade radbrytningen
// +32 px i hero och −32 px i sifferbandet på / → CLS 0,125 (de enda
// skiften som fanns; /kurser och /blogg = 0). "optional" målar fallback
// EN gång och byter aldrig → noll skift, alltid. Fonterna preloadas och
// serveras lokalt (~50 kB) → vid normala uppkopplingar hinner riktig
// font fram inom blockperioden; endast first-visit på mycket långsamt
// nät ser systemfont för den visningen (därefter cachad). Beslut inom
// spårets beslutsyta (preload/weights-redan beslutade i v68/v96 kvarstår).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "optional",
});

// VÅG 68 PRESTANDA B (o1 #9): Source Serif delas i två instanser — normal
// (400/600/700) preloadas. Eftersom Google tjänar variabla woff2-filer är
// filunderlaget oförändrat: RIKTIG italic behålls för alla vikter.
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "optional",
  weight: ["400", "600", "700"],
  style: ["normal"],
});

// VÅG s7-u1 (o54, 2026-09-17): serif-KURSIV preloadas igen (o1 #9:s
// preload:false upphävs). Bevis — Lighthouse-trace på prod (FÖRE §1):
// kursiv-woff2:n (51 KiB) var den ENDA fonten utan preload ⇒ upptäcktes
// via style-resolution först 954–1 509 ms in (A/B: 80–133 ms), mitt i
// JS-kön — och den är LCP-KRITISK: hero-citatet ("Lär dig läsa bolag
// som en analytiker…", p.font-serif.text-lg.italic) är LCP-elementet
// på /, /en och /ar, och med display:optional (s7-u3-beslutet) REJAS
// fonten om den inte hunnit fram ⇒ LCP-elementet målas i fallback i
// Lantern-kedjan med element render delay 2 203–2 240 ms (TTFB 41–56 ms
// — all tid är render-fördröjning). Preload → fetch vid ~80 ms som A/B
// ⇒ font-fasen ur den kritiska kedjan. Kostnad: +51 KiB preload på
// kalla sidvisningar utan kursivtext — cache-täckt efter första besöket.
const sourceSerifKursiv = Source_Serif_4({
  variable: "--font-serif-kursiv",
  subsets: ["latin"],
  display: "optional",
  weight: ["400", "600", "700"],
  style: ["italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "optional",
  // VÅG 96 D1 (prestanda våg 3): mono preloads INTE längre. Prod-mätning
  // 2026-09-11: 3 woff2 preloadades på ALLA sidor (50+47+40 kB opak) men
  // startsidans HTML har 0 font-mono/verify-stamp-förekomster — monospace
  // används först i verktyg/kodblock långt under vecket. preload:false
  // skär ~40 kB ur den kritiska bandbredden per kall sidvisning; filen
  // hämtas on demand med display:swap (samma mönster som serif-kursiv,
  // o1 #9/våg 68). Visuellt oförändrat efter swap.
  preload: false,
});

/** Body-klassraden — identisk med dagens src/app/layout.tsx:210-212. */
export const typografiKlasser = `${inter.variable} ${sourceSerif.variable} ${sourceSerifKursiv.variable} ${jetbrainsMono.variable}`;
