/**
 * observatoriet.ts — parser för Observatoriet v3 (våg 139): planeringsvyn.
 *
 * Läser data/forskning/PIPELINE-KO.md (dispatchlistan — sanningskällan för
 * vad organismen arbetar med just nu) och bryter ut två saker:
 *
 *   1. PÅGÅENDE VÅG — den SISTA "## VÅG "-sektionen i filen: dess
 *      tabellrader (Block | Agent | Uppgift | Utdatafil | Status) blir
 *      agenter med exklusiva filägarskap som panelen kan visa live.
 *      API:t berikar varje rad mekaniskt med filbevis (finns utdatafilen
 *      på disk? är den committad?) — statusen i trädet är alltså ALDRIG
 *      bara en påstående, den kontrolleras mot verkligheten.
 *
 *   2. NÄSTA I KÖN — sektionen "## NÄSTA I KÖN (observatoriet)" som
 *      huvudagenten underhåller vid varje vågbokföring. Rader:
 *        - ▶ NÄSTA: <uppdrag> — <varför>
 *        - · <uppdrag> — <varför>
 *
 * Ren funktion: kastar aldrig, inga beroenden, tyst mot okända former.
 */

/** En rad i en vågtabell (agent med exklusivt filägarskap). */
export interface VagRad {
  block: string;
  agent: string;
  uppdrag: string;
  utdatafil: string;
  status: string;
}

/** Ett kommande uppdrag ur kön med sin varför-rad. */
export interface NastaRad {
  markering: string;
  uppdrag: string;
  varfor: string;
}

/** Parsat resultat av PIPELINE-KO.md. */
export interface Planering {
  vagTitel: string;
  vagRader: VagRad[];
  nasta: NastaRad[];
}

/** Markeringen i en kö-rad (▶/·/◦) — grupp utan capture behövs ej. */
const MARKERING_RE = /^([▶·◦]+)\s*(.+)$/;

/** Tabellrad: minst Block..Status (5 celler) + ledande/efterföljande tomma. */
const MIN_CELLER = 7;

/** Skiljerad i markdown-tabell ("---"). */
const SKILJERAD_RE = /^-+$/;

/**
 * Parsar PIPELINE-KO.md till planeringsvyn. Tomma/partiella resultat är
 * giltiga (filen byggs upp successivt) — aldrig fel.
 */
export function parsPipelineKo(text: string): Planering {
  const rader: string[] = text.split("\n");

  // --- 1. Pågående våg: SISTA "## VÅG "-rubriken i filen ---
  let vagIndex = -1;
  for (let i = 0; i < rader.length; i++) {
    if (rader[i].startsWith("## VÅG ")) {
      vagIndex = i;
    }
  }

  const vagRader: VagRad[] = [];
  let vagTitel = "";
  if (vagIndex !== -1) {
    vagTitel = rader[vagIndex].slice(3).trim();
    for (let i = vagIndex + 1; i < rader.length; i++) {
      const rad = rader[i];
      if (rad.startsWith("## ")) {
        break;
      }
      if (!rad.startsWith("|")) {
        continue;
      }
      const celler: string[] = rad.split("|").map((c) => c.trim());
      if (celler.length < MIN_CELLER) {
        continue;
      }
      const block = celler[1] ?? "";
      if (block === "" || block === "Block" || SKILJERAD_RE.test(block)) {
        continue;
      }
      vagRader.push({
        block,
        agent: celler[2] ?? "",
        uppdrag: celler[3] ?? "",
        utdatafil: celler[4] ?? "",
        status: celler[5] ?? "",
      });
    }
  }

  // --- 2. Nästa i kön: sista "## NÄSTA I KÖN"-rubriken ---
  let nastaIndex = -1;
  for (let i = 0; i < rader.length; i++) {
    if (rader[i].startsWith("## NÄSTA I KÖN")) {
      nastaIndex = i;
    }
  }

  const nasta: NastaRad[] = [];
  if (nastaIndex !== -1) {
    for (let i = nastaIndex + 1; i < rader.length; i++) {
      const rad = rader[i];
      if (rad.startsWith("## ")) {
        break;
      }
      if (!rad.startsWith("- ")) {
        continue;
      }
      const kropp = rad.slice(2).trim();
      const m = kropp.match(MARKERING_RE);
      const markering: string = m !== null ? m[1] : "·";
      const text: string = m !== null ? m[2] : kropp;
      const dash = text.indexOf(" — ");
      const uppdrag: string = dash >= 0 ? text.slice(0, dash) : text;
      const varfor: string = dash >= 0 ? text.slice(dash + 3) : "";
      nasta.push({ markering, uppdrag, varfor });
    }
  }

  return { vagTitel, vagRader, nasta };
}

/**
 * Extraherar sökvägsliknande token ur en utdatafil-cell — cellen kan
 * innehålla flera vägar ("fil1 + fil2, data/..."). Endast läsning.
 */
export function utdatafilVagar(cella: string): string[] {
  const match = cella.match(/[\w./-]+\.(?:md|json|mjs|ts|tsx|sh|txt)/g);
  return match ?? [];
}
