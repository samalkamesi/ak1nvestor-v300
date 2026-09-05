/**
 * VARUMARKE — varumärket som kod (röst, ton, lexikon, förbjudna fraser).
 *
 * Importera härifrån och ALDRIG hårdkoda varumärkes-copy — exakt som tal
 * importeras ur siffror.ts. Underlaget är data/varumarke.json (single
 * source, mönstret siffror.json/siffror.ts): samma fil läss också av
 * verktyg/kvalitetsvakt.mjs sektion 2b (Förbjudna fraser) — ingen
 * dubbelpost, ingen drift. Upprättat enligt MARKNADS-BESLUT.md våg 2
 * + m6-varumarke.md §E (dokumentet BRAND.md härleds ur detta).
 *
 * kontrolleraText(text) är en ren, beroendefri funktion — avsedd som sista
 * grind i AI-publiceringspipelines (nyhets-motor, email-mallar,
 * analysfabrik) och i nya marknadsytor (våg 3–4).
 */
import radata from "../../data/varumarke.json";

export type Allvar = "FEL" | "VARNING";
export type Persona = "nyborjare" | "avancerad" | "b2b";

export interface TonRegel {
  id: number;
  regel: string;
  exempel: string;
  antiexempel: string;
}

export interface ForbjudenFras {
  /** Regex-källa (kompileras med flaggorna "giu" — ordgränser, skiftlägesokänsligt). */
  fran: RegExp;
  istallet: string;
  allvar: Allvar;
  motiv: string;
}

export interface Huvudbudskap {
  rubrik: string;
  underrubrik: string;
  bevis: string[];
  cta: string;
}

export interface CtaNiva {
  niva: "signatur" | "primar" | "sekundar" | "textlank";
  klass: string;
  regel: string;
}

/** En träff av en förbjuden fras i en text. */
export interface Traff {
  fras: string;
  index: number;
  allvar: Allvar;
  ersattning: string;
}

/** Råformatet i data/varumarke.json (regex-källor som strängar). */
interface VarumarkeData {
  _kalla?: string;
  version: string;
  uppdaterad?: string;
  tonRegler: TonRegel[];
  lexikon: { viSager: string[] };
  forbjudnaFraser: { fran: string; istallet: string; allvar: string; motiv: string }[];
  huvudbudskap: Record<Persona, Huvudbudskap>;
  ctaHierarki: CtaNiva[];
  signatur: { disclaimer: string; slogan: string };
  design: {
    farger: Record<string, string>;
    typografi: Record<string, string>;
    notering?: string;
  };
}

const raa = radata as unknown as VarumarkeData;

export const VARUMARKE_VERSION = raa.version;

/** Tio ton-regler (m6 §B) — rytmen är gravör, inte reklam. */
export const TON_REGLER: readonly TonRegel[] = Object.freeze(raa.tonRegler.map((r) => Object.freeze(r)));

/**
 * Förbjudna fraser (m6 §C + MARKNADS-BESLUT §3): FEL = juridiskt/löftesbrott
 * (P1/P2/P3/P6 — stoppar publicering), VARNING = tonalt (manuell granskning).
 * "investeringsråd" träffas ENDAST onegerat — "inte/aldrig investeringsråd"
 * är själva disclaimer-formen (SIGNATUR.disclaimer).
 */
export const FORBJUDNA_FRASER: readonly ForbjudenFras[] = Object.freeze(
  raa.forbjudnaFraser.map((f) =>
    Object.freeze({
      fran: new RegExp(f.fran, "giu"),
      istallet: f.istallet,
      allvar: f.allvar === "FEL" ? "FEL" : "VARNING",
      motiv: f.motiv,
    }),
  ),
);

/** Ordlista: vi säger / vi undviker (undviker = FORBJUDNA_FRASER — ingen dubbelpost). */
export const LEXIKON: { viSager: readonly string[]; undviker: readonly ForbjudenFras[] } = Object.freeze({
  viSager: Object.freeze(raa.lexikon.viSager),
  undviker: FORBJUDNA_FRASER,
});

/** Huvudbudskap per persona (m6 §E-tabellen) — enda källan för nya marknadsytor. */
export const HUVUDBUDSKAP: Readonly<Record<Persona, Huvudbudskap>> = Object.freeze({
  nyborjare: Object.freeze(raa.huvudbudskap.nyborjare),
  avancerad: Object.freeze(raa.huvudbudskap.avancerad),
  b2b: Object.freeze(raa.huvudbudskap.b2b),
});

/** CTA-hierarki (fyra nivåer; A9:s textlänk-form = nivå 4). */
export const CTA_HIERARKI: readonly CtaNiva[] = Object.freeze(raa.ctaHierarki.map((c) => Object.freeze(c)));

/** Signatur: disclaimer citeras framåt, slogan är en tripplett. */
export const SIGNATUR = Object.freeze({
  disclaimer: raa.signatur.disclaimer,
  slogan: raa.signatur.slogan,
});

/** Designtokens ärvda ur src/app/globals.css (koden är sanningen). */
export const DESIGN = Object.freeze({
  farger: Object.freeze({ ...raa.design.farger }),
  typografi: Object.freeze({ ...raa.design.typografi }),
});

/**
 * Kontrollera en text mot varumärket — ren funktion, inga beroenden.
 *
 * AC (MARKNADS-BESLUT våg 2): "SISTA CHANSEN att gå med gratis!" ⇒ minst en
 * VARNING; "garanterad avkastning" ⇒ FEL. Negerad disclaimer ("Pedagogisk
 * analys — inte investeringsråd") ger INGEN träff — negeringen är tillåten
 * form. Citerande text (policy-sidor som citerar förbudet) hanteras av
 * kvalitetsvaktens citerings-undantag (A10), ALDRIG här: funktionen sänker
 * aldrig nivå.
 *
 * Yta-regeln (K8, B2B-BESLUT våg 61 bygg-2): med { proYta: true } undantas
 * A8-varningen "kunder" — legitim B2B-terminologi på /pro-ytorna (samma
 * undantag som kvalitetsvaktens sektion 2b applicerar på filmönstret).
 * ENDAST VARNING-nivån filtreras; FEL-fraserna gäller även på B2B-ytor.
 */
export function kontrolleraText(
  text: string,
  yta?: { proYta?: boolean },
): { fel: Traff[]; varningar: Traff[] } {
  const fel: Traff[] = [];
  const varningar: Traff[] = [];
  if (typeof text !== "string" || text.length === 0) return { fel, varningar };
  for (const { fran, istallet, allvar } of FORBJUDNA_FRASER) {
    fran.lastIndex = 0; // globala regexar är stateful — börja från början varje gång
    let m: RegExpExecArray | null;
    while ((m = fran.exec(text)) !== null) {
      // K8: "kunder" är legitim terminologi när anropet deklarerar en PRO-yta.
      if (yta?.proYta === true && allvar === "VARNING" && m[0].toLowerCase() === "kunder") {
        continue;
      }
      const traff: Traff = { fras: m[0], index: m.index, allvar, ersattning: istallet };
      if (allvar === "FEL") fel.push(traff);
      else varningar.push(traff);
    }
  }
  return { fel, varningar };
}
