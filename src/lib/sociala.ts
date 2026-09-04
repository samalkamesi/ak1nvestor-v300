/**
 * SOCIALA_PROFILER — kundens sociala profil-URL:er (VÅG 1a).
 *
 * MARKNADS-BESLUT §4 K1: URL-listan levereras av KUNDEN. Tills dess står
 * platshållarna tomma — och en tom URL renderas ALDRIG (inga döda länkar,
 * ingen tom ikonrad): footerns ikonrad och organizationJsonLd:s sameAs
 * visas endast för ifyllda profiler. Fyll i exakt URL (med https://) när
 * kunden levererar; ingen annan kod behöver ändras.
 */

export type SocialProfil = "linkedin" | "youtube" | "x" | "instagram";

/** Profil-URL:er — TOM STRÄNG = profilen finns ännu ej publikt. */
export const SOCIALA_PROFILER: Record<SocialProfil, string> = {
  linkedin: "",
  youtube: "",
  x: "",
  instagram: "",
};

/** Endast ifyllda URL:er — grunden för footer-ikonraden och JSON-LD sameAs. */
export const SOCIALA_URLS: string[] = Object.values(SOCIALA_PROFILER).filter(
  (url) => url.trim().length > 0
);

/** Metadata om varje profil (etikett + ev. ikon) — ikonraden mappar själv. */
export const SOCIALA_ETIKETTER: Record<SocialProfil, string> = {
  linkedin: "LinkedIn",
  youtube: "YouTube",
  x: "X",
  instagram: "Instagram",
};
