/**
 * blogg-faq.ts — ur-en-källa-parser för FAQ-sektioner i bloggposter.
 *
 * Våg 137 (organ Ψ, SEO-rond F): bloggposter får en "## FAQ"-sektion i
 * sin body-markdown. Sektionen är SAMMA källa för två konsumenter — det
 * synliga innehållet på sidan och FAQPage-JSON-LD:n — eftersom Google
 * sedan 2023 kräver att FAQ-innehåll som markupas med strukturdata också
 * är synligt för läsaren. Genom att plocka paren ur body-markdownen kan
 * synligt innehåll och strukturdata aldrig drifta isär.
 *
 * Format i body:
 *
 *   ## FAQ
 *
 *   **Det här är frågan?**
 *
 *   Det här är svaret. Ett block (stycke) trimmad text.
 *
 *   **Nästa fråga?**
 *
 *   Nästa svar.
 *
 * Regler:
 * - Body delas i block på /\n\n+/; sektionen börjar vid blocket som
 *   (trimmat) är exakt "## FAQ" och slutar vid nästa block som börjar
 *   med "## " (FAQ är sista sektionen i posterna, men parsern är robust
 *   mot efterföljande sektioner).
 * - Inom sektionen är ett block som matchar /^\*\*(.+)\*\*$/ en FRÅGA
 *   (texten utan asteriskerna); nästa icke-frågeblock är dess SVAR.
 * - Ren funktion: kastar aldrig, inga externa beroenden. Okända
 *   blockformer tolkas som svar om de följer en fråga, annars ignoreras
 *   de tyst. Extra whitespace och radbrytningar i block tåls.
 */

/** Ett FAQ-par: frågetexten (utan asterisker) och svarstexten (trimmad). */
export type FaqPar = { fraga: string; svar: string };

/** Blockform för en fråga: hela (trimmade) blocket är "**fråga?**". */
const FRAGA_RE = /^\*\*(.+)\*\*$/;

/**
 * Extraherar FAQ-par ur en bloggposts body-markdown.
 *
 * Returnerar paren i ordning; [] om bodyn saknar "## FAQ"-sektion eller
 * innehåller noll fullständiga par (en fråga utan efterföljande
 * svarblock är inte ett par och hopas över).
 */
export function parseFaqFragor(body: string): FaqPar[] {
  const block: string[] = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const faqIndex: number = block.findIndex((b) => b === "## FAQ");
  if (faqIndex === -1) {
    return [];
  }

  const par: FaqPar[] = [];
  let aktivFraga: string | null = null;

  for (let i = faqIndex + 1; i < block.length; i++) {
    const b: string = block[i];

    // Nästa "## "-rubrik avslutar FAQ-sektionen (exklusivt).
    if (b.startsWith("## ")) {
      break;
    }

    if (FRAGA_RE.test(b)) {
      // Girig (.+) fångar exakt blocket utan de yttre asteriskerna,
      // detsamma som b.slice(2, -2) — utan indexåtkomst i typingen.
      aktivFraga = b.slice(2, -2).trim();
      continue;
    }

    if (aktivFraga !== null) {
      par.push({ fraga: aktivFraga, svar: b });
      aktivFraga = null;
    }
    // Block som inte följer en fråga ignoreras tyst.
  }

  return par;
}
