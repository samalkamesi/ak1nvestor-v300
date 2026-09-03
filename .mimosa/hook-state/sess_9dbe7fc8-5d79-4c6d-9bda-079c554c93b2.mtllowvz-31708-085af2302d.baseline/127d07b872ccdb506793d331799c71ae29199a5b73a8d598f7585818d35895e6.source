"use client";

/**
 * ELEVKÄRNAN (v1) — elevens "varför": välfärdsmål, huvudmål, horisont,
 * intressen och tid. Kompletterar den kognitiva profilen (profilen visar
 * hur du TÄNKER — kärnan visar vad du VILL). Allt lokalt i localStorage,
 * inga personuppgifter, alltid frivilligt, aldrig dömande.
 */

export type ElevKarna = {
  mal: string;              // huvudmål (id ur fast lista)
  horisontAr: number;       // 1-10+ (tidsperspektiv)
  intressen: string[];      // multi (max 3) ur fast lista
  tidPerVecka: number;      // minuter
  valfard: string[];        // välfärdsmål multi ur fast lista (max 2)
  sparad: number;           // timestamp
};

const KEY = "ak1a-elevkarna-v1";

export const MAX_INTRESSEN = 3;
export const MAX_VALFARD = 2;

/** Fast lista — huvudmål (elevens riktning). */
export const MAL_ALTERNATIV: string[] = [
  "Bli oberoende analytiker",
  "Förstå mina aktier djupare",
  "Bygga långsiktig förmögenhet",
  "Byta karriär till finans",
  "Hantera mina pengar klokare",
];

/** Fast lista — intressen (vad som lockar). */
export const INTRESSEN_ALTERNATIV: string[] = [
  "Svenska bolag",
  "Värdeinvestering",
  "Vågor & timing",
  "Kvantitativ analys",
  "Beteende & psykologi",
  "Risk & kriser",
];

/** Fast lista — välfärdsmål (kärnan i uppdraget: vad kunskapen ska ge livet). */
export const VALFARD_ALTERNATIV: string[] = [
  "Sömn utan ekonomisk oro",
  "Frihet att välja liv",
  "Trygghet för familjen",
  "Stolthet i hantverket",
  "Lugn i beslut",
];

export function lasElevKarna(): ElevKarna | null {
  try {
    const rå = localStorage.getItem(KEY);
    if (!rå) return null;
    const k = JSON.parse(rå) as Partial<ElevKarna>;
    return {
      mal: typeof k.mal === "string" && MAL_ALTERNATIV.includes(k.mal) ? k.mal : "",
      horisontAr: Math.max(1, Math.min(15, Math.round(Number(k.horisontAr)) || 1)),
      intressen: (Array.isArray(k.intressen) ? k.intressen : [])
        .filter((i) => INTRESSEN_ALTERNATIV.includes(i))
        .slice(0, MAX_INTRESSEN),
      tidPerVecka: Math.max(0, Math.min(3000, Math.round(Number(k.tidPerVecka)) || 0)),
      valfard: (Array.isArray(k.valfard) ? k.valfard : [])
        .filter((v) => VALFARD_ALTERNATIV.includes(v))
        .slice(0, MAX_VALFARD),
      sparad: Number(k.sparad) || 0,
    };
  } catch {
    return null;
  }
}

export function sparaElevKarna(k: ElevKarna) {
  try {
    localStorage.setItem(KEY, JSON.stringify(k));
  } catch {}
}

export function rensaElevKarna() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

/**
 * Välfärdsgrad 0–3 (0 = ej satt). Alltid uppmuntrande, aldrig dömande —
 * graden beskriver hur tydligt kärnan lyser, inte hur "bra" eleven är.
 */
export function valfardsGrad(k: ElevKarna | null): { grad: number; text: string } {
  if (!k || k.valfard.length === 0) {
    return {
      grad: 0,
      text: "Din kärna är ännu oskriven — välkommen att forma den närhelst du vill. Allt här bygger mot det som spelar roll för dig.",
    };
  }
  if (k.valfard.length === 1) {
    return {
      grad: 1,
      text: "Du har valt din riktning — välkommen. Varje analys och övning bär nu mot det du vill uppnå.",
    };
  }
  if (!k.mal || k.intressen.length === 0 || k.tidPerVecka === 0) {
    return {
      grad: 2,
      text: "Två välfärdsmål lyser tydligt i din kärna — vi bygger allt för att hjälpa dig dit.",
    };
  }
  return {
    grad: 3,
    text: "Din kärna är fullt formad — mål, intressen och din väg. Resan är din egen, och vi går bredvid dig hela vägen.",
  };
}
