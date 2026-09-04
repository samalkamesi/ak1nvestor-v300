/**
 * SPRÅK-GRUNDEN (fas 1 i SPRAK-PLAN.md) — svenska | english | العربية
 *
 * Klientsidig språkväxling UTAN routing-omläggning: SSG:n (700+ sidor)
 * förblir svensk i server-renderingen; komponenter som använder t()
 * hydrerar och byter textnod vid valt språk. Svenska är alltid fallback.
 *
 * - Register: 'sv' | 'en' | 'ar' (ar ⇒ dir="rtl" på <html>)
 * - Lagring: localStorage "ak1a-sprak-v1"
 * - Detektering: navigator-språk, ENDAST om sv/en/ar — annars svenska
 * - t(nyckel): typsäker översättning ur ORDLISTA (src/lib/ordlista.ts)
 *   med {parameter}-interpolation och sv-fallback
 *
 * Se data/forskning/SPRAK-PLAN.md för fas 2 (nyckelsidor) och fas 3
 * (333 kurser — professionell pipeline, aldrig blind maskinöversättning).
 */

import { ORDLISTA, type OrdlistaNyckel, type SprakRad } from "@/lib/ordlista";

// ── Register ────────────────────────────────────────────────────────────────

export type SprakId = "sv" | "en" | "ar";

export const SPRAK_IDN: readonly SprakId[] = ["sv", "en", "ar"] as const;

export type SprakInfo = {
  /** Kort visa-kod i väljaren (versal). */
  kod: string;
  /** Inhemskt namn — visas på sitt eget språk i väljaren. */
  namn: string;
  /** Svensk beskrivning (internal UI / aria-hjälp). */
  beskrivning: string;
  /** Flagga-emoji — diskret viktoriansk markör i väljaren. */
  flagga: string;
  /** Textriktning. */
  dir: "ltr" | "rtl";
};

export const SPRAK: Record<SprakId, SprakInfo> = {
  sv: { kod: "SV", namn: "Svenska", beskrivning: "Svenska", flagga: "🇸🇪", dir: "ltr" },
  en: { kod: "EN", namn: "English", beskrivning: "Engelska", flagga: "🇬🇧", dir: "ltr" },
  ar: { kod: "AR", namn: "العربية", beskrivning: "Arabiska", flagga: "🇸🇦", dir: "rtl" },
};

/** localStorage-nyckel (versionsmarkerad — brytande format ⇒ ny nyckel). */
export const SPRAK_LAGRING = "ak1a-sprak-v1";

// ── Lagring + detektering ───────────────────────────────────────────────────

export function arGiltigtSprak(v: unknown): v is SprakId {
  return typeof v === "string" && (SPRAK_IDN as readonly string[]).includes(v);
}

/** Läs sparat språk — null om ogiltigt/saknat. SSR-säkert (returnerar null). */
export function lasSprak(): SprakId | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(SPRAK_LAGRING);
    return arGiltigtSprak(v) ? v : null;
  } catch {
    return null; // privat läge etc. — aldrig fatalt
  }
}

/** Spara språkval — tyst-fallande. */
export function sparaSprak(sprak: SprakId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SPRAK_LAGRING, sprak);
  } catch {
    /* ignoreras */
  }
}

/**
 * Navigator-detektering — ENDAST sv/en/ar accepteras ("ar-EG" ⇒ ar,
 * "en-US" ⇒ en). Alla andra språk ⇒ null ⇒ svenska. Ingen geografi, ingen
 * gissning: kunddirektivet är "exakt samma avancering", och standardspråket
 * på en svenskspråkig sajt är svenska tills eleven själv väljer.
 */
export function detekteraSprak(): SprakId | null {
  if (typeof navigator === "undefined") return null;
  try {
    const kandidater: string[] = [
      ...(navigator.languages ?? []),
      navigator.language,
    ].filter((s): s is string => typeof s === "string" && s.length > 0);
    for (const k of kandidater) {
      const bas = k.toLowerCase().split("-")[0];
      if (arGiltigtSprak(bas)) return bas;
    }
  } catch {
    /* ignoreras */
  }
  return null;
}

/** Full resolution: sparat val ⇒ navigator ⇒ svenska. */
export function hamtaSprak(): SprakId {
  return lasSprak() ?? detekteraSprak() ?? "sv";
}

export function dirForSprak(sprak: SprakId): "ltr" | "rtl" {
  return SPRAK[sprak].dir;
}

// ── Översatta spegel-routes (våg 51) ────────────────────────────────────────
//
// Sidor som finns i fullständiga EN/AR-versioner under /en/... och /ar/....
// SprakVaxlare-navigerar till spegeln vid språkval (samtidigt som UI-språket
// sätts) så även SID-INNEHÅLLET byter språk — inte bara menyerna. Sidor som
// saknas i registret byter enbart UI-språk (menyer/knappar) på klienten.
//
// Svenska bas-sökvägen är nyckeln; startsidans speglar är /en respektive /ar.
// Byggs ut i takt med att nya spegel-sidor monteras (våg 51-agenter).

export type SpegelVagar = { en: string; ar: string };

export const OVERSATTA_ROUTES: Record<string, SpegelVagar> = {
  "/": { en: "/en", ar: "/ar" },
  "/medlemskap": { en: "/en/medlemskap", ar: "/ar/medlemskap" },
  "/manifest": { en: "/en/manifest", ar: "/ar/manifest" },
  "/logga-in": { en: "/en/logga-in", ar: "/ar/logga-in" },
  "/om-oss": { en: "/en/om-oss", ar: "/ar/om-oss" },
  "/kurser": { en: "/en/kurser", ar: "/ar/kurser" },
  "/fas2-ansok": { en: "/en/fas2-ansok", ar: "/ar/fas2-ansok" },
  "/fas3": { en: "/en/fas3", ar: "/ar/fas3" },
  "/prenumeration": { en: "/en/prenumeration", ar: "/ar/prenumeration" },
  "/transparens": { en: "/en/transparens", ar: "/ar/transparens" },
};

/** Har sökvägen ett /en- eller /ar-prefix? Returnerar språket eller null. */
export function sprakPrefix(sokvag: string): SprakId | null {
  if (sokvag === "/en" || sokvag.startsWith("/en/")) return "en";
  if (sokvag === "/ar" || sokvag.startsWith("/ar/")) return "ar";
  return null;
}

/** Svenska bas-sökvägen: "/en/medlemskap" → "/medlemskap", "/ar" → "/". */
export function basSokvag(sokvag: string): string {
  const prefix = sprakPrefix(sokvag);
  if (!prefix) return sokvag === "/" ? "/" : sokvag.replace(/\/+$/, "") || "/";
  if (sokvag === "/" + prefix) return "/";
  return sokvag.slice(3) || "/"; // klipp "/en" + "/": "/en/x" → "/x"
}

/**
 * Spegel-sökvägen för ett språkval — eller null om sidan saknar spegel.
 * Exempel: på /medlemskap + "en" ⇒ "/en/medlemskap"; på /en/kurser + "sv" ⇒
 * "/kurser"; på /en/kurser + "ar" ⇒ "/ar/kurser". Svenska på svensk sida
 * returnerar sökvägen oförändrad (ingen navigering behövs).
 */
export function spegelSokvag(sokvag: string, mal: SprakId): string | null {
  const bas = basSokvag(sokvag);
  if (mal === "sv") {
    // Endast navigering om vi står på en spegel och basen är registrerad.
    return sprakPrefix(sokvag) && bas in OVERSATTA_ROUTES ? bas : null;
  }
  const vagar = OVERSATTA_ROUTES[bas];
  return vagar ? vagar[mal] : null;
}

// ── t() — typsäker översättning ─────────────────────────────────────────────

export type SprakParametrar = Record<string, string | number>;

/** Interpolation: "Kapitel {num} av {total}" + {num: 3, total: 12}. */
function fyll(text: string, parametrar?: SprakParametrar): string {
  if (!parametrar) return text;
  return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (hel, namn: string) =>
    namn in parametrar ? String(parametrar[namn]) : hel,
  );
}

/**
 * Ren översättningsfunktion — kärnan bakom useSprak().t. Svensk rad är
 * alltid fallback (en nyckel utan översättning visas alldrig tom).
 */
export function oversatt(
  nyckel: OrdlistaNyckel,
  sprak: SprakId,
  parametrar?: SprakParametrar,
): string {
  const rad: SprakRad | undefined = ORDLISTA[nyckel];
  if (!rad) return String(nyckel); // typsystemet hindrar detta i TS-kod
  const text = rad[sprak] || rad.sv;
  return fyll(text, parametrar);
}

/**
 * Fabrik: skapa en t-funktion bunden till ett språk (t.ex. i tester eller
 * utanför React-trädet).
 */
export function skapaT(sprak: SprakId): (nyckel: OrdlistaNyckel, parametrar?: SprakParametrar) => string {
  return (nyckel, parametrar) => oversatt(nyckel, sprak, parametrar);
}

// ── Best-effort textöversättning (brödsmulor m.m.) ─────────────────────────

let svIndex: Map<string, SprakRad> | null = null;

function hamtaSvIndex(): Map<string, SprakRad> {
  if (!svIndex) {
    svIndex = new Map<string, SprakRad>();
    for (const rad of Object.values(ORDLISTA)) svIndex.set(rad.sv, rad);
  }
  return svIndex;
}

/**
 * Översätt en FRITEXT-sträng (t.ex. brödsmulenamn från page.tsx) genom
 * exakt matchning mot ordlistans svenska värden. Ingen träff ⇒ originalet
 * återges ordagrant (svenska). Detta låter navigationen på 700+ SSG-sidor
 * byta språk utan att röra sidfilerna — sidunika ord är fas 2.
 */
export function oversattText(text: string, sprak: SprakId): string {
  if (sprak === "sv") return text;
  const rad = hamtaSvIndex().get(text);
  return rad ? rad[sprak] || rad.sv : text;
}
