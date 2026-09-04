/**
 * BLOGGSPEGLAR — server-side översättningslager för de dynamiska blogg-
 * spegel-rutterna /en/blogg, /ar/blogg, /en/blogg/[slug] och /ar/blogg/[slug]
 * (våg 55, agent L2 — kunddirektiv: "inte kurser eller annat eller BLOG,
 * ingen översätts" ⇒ bloggen in i MÖS).
 *
 * Mönstret är EXAKT src/lib/kurs-speglar.ts (våg 52, agent B — läst+följt,
 * ej ändrad): samma Supabase-läsning, samma toleranta kolumnavläsning,
 * samma fallback-ordning och samma SEO-tröskel — men scope-typ "blogg" och
 * bloggens nyckelformat.
 *
 * ── KONTRAKT MOT ÖVERSÄTTNINGSLAGRET (src/lib/oversattning/kalla.ts) ──
 *
 *   scope_typ   = "blogg"
 *   scope_nyckel = "{slug}:titel"            (title-fältet)
 *                  "{slug}:ingress"          (description-fältet)
 *                  "{slug}:p{n}"             (stycke n av body, 1-BASERAT,
 *                                           /\n\n+/-delning, tomma block
 *                                           bort — identiskt med kalla.ts:s
 *                                           bloggStycken, som är den enda
 *                                           räkneordningen)
 *   Enhet       = varje icke-tom titel/ingress/stycke. pillar/author/tags/
 *                datum/readingMinutes är struktur och översätts ALDRIG.
 *
 * PROGRESSANDELEN (notisen "X % klart" + SEO-tröskeln) räknas över DET
 * universumet — identiskt med kalla.ts:s enumerate ⇒ andelen speglar
 * pipeline:ens verkliga framsteg och kan nå 100 %.
 *
 * FAKTISKT SCHEMA (agent A:s data/sql/oversattningar.sql, inläst 2026-09-01):
 *   oversattningar(scope_typ, scope_nyckel, sprak, kallhash, text, status,
 *                  kvalitet, kontrollrapport, uppdaterad)
 *   UNIQUE (scope_typ, scope_nyckel, sprak); status 'publicerad' = 100 poäng.
 * Kolumnmatchning/avläsning toleranta på samma sätt som kurs-speglarna
 * (lasKolumn/arPublicerad nedan — justera i EN punkt vid schemaändring).
 *
 * FALLBACK-ORDNING (per fält): publicerad översättning → svensk originaltext.
 * Ingen fält-nivå-markering; i stället EN notis överst på artikelsidan med
 * översättningsandelen (renderad av BloggSpegelSida).
 *
 * SEO-BESLUT (samma INDEX_TRASKEL = 80 % som kursspeglarna): spegeln robots-
 * noindex:ad + canonical mot svenska originalet tills publicerad-andelen ≥
 * 80 %. Vid ≥ 80 %: egen canonical + fullt hreflang-kluster.
 */

import { cache } from "react";
import type { Metadata } from "next";
import type { BlogPost } from "@/lib/content";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { SPEGEL_SITE_URL, SPEGEL_SITE_NAME } from "@/lib/spegel-metadata";
import { INDEX_TRASKEL } from "@/lib/kurs-speglar";

// ── Konvention: nyckelbyggare (EN punkt när nycklarna ändras) ────────────────

export type BloggSpegelSprak = "en" | "ar";

export function nyckelBloggTitel(slug: string): string {
  return `${slug}:titel`;
}
export function nyckelBloggIngress(slug: string): string {
  return `${slug}:ingress`;
}
/** Styckenyckel — styckeIndex är 1-baserat exakt som kalla.ts ("...:p<n>"). */
export function nyckelBloggStycke(slug: string, styckeNr: number): string {
  return `${slug}:p${styckeNr}`;
}

/**
 * Styckedelen av ett blogg-inläggs body. /\n\n+/ — identisk med kalla.ts:s
 * bloggStycken (duplicerad medvetet, som kursspeglarna duplicerar sin
 * blockuppräkning: kalla.ts får aldrig importeras av renderkoden, och
 * StyckeNumret måste vara samma text i registret och här).
 */
export function bloggStycken(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((s) => s.trim().length > 0);
}

// ── Hämtning: Supabase PostgREST → Map<nyckel, Map<sprak, text>> ─────────────

/** Tolerant kolumnavläsning — samma kandidater som kurs-speglarna. */
function lasKolumn(rad: Record<string, unknown>, kandidater: string[]): string | null {
  for (const k of kandidater) {
    const v = rad[k];
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return null;
}

function arPublicerad(rad: Record<string, unknown>): boolean {
  // status saknas helt ⇒ antag publicerad (pipeline utan statuskolumn);
  // finns status ⇒ kräv "publicerad".
  const status = lasKolumn(rad, ["status", "status_varde", "publicerad_status"]);
  if (status === null) return true;
  return status.trim().toLowerCase() === "publicerad";
}

/** Tolka rader → lager. `slugs` = säkerhetsnät: utan scope_typ-kolumn accepteras
 *  bara nycklar som hör till ett känt blogg-slug (kurs-nycklar sorteras bort). */
function franRader(rader: unknown, slugs: readonly string[]): Map<string, Map<string, string>> {
  const lager = new Map<string, Map<string, string>>();
  if (!Array.isArray(rader)) return lager;
  for (const r of rader) {
    if (!r || typeof r !== "object") continue;
    const rad = r as Record<string, unknown>;
    if (!arPublicerad(rad)) continue;
    const typ = lasKolumn(rad, ["scope_typ", "typ", "scope_typ_varde"]);
    if (typ !== null && typ !== "blogg") continue; // kursrader läcker aldrig in
    const sprak = lasKolumn(rad, ["sprak", "mal_sprak", "lang", "locale", "target_lang", "sprak_kod"]);
    const nyckel = lasKolumn(rad, ["scope_nyckel", "nyckel"]);
    const text = lasKolumn(rad, ["text", "innehall", "oversattning", "oversatt_text", "varde", "content"]);
    if (!sprak || !nyckel || !text) continue;
    if (typ === null && !slugs.some((s) => nyckel.startsWith(`${s}:`))) continue;
    const perSprak = lager.get(nyckel) ?? new Map<string, string>();
    perSprak.set(sprak, text);
    lager.set(nyckel, perSprak);
  }
  return lager;
}

/** Kör sökvägarna i tur och ordning; första försöket med träffar vinner. */
async function hamtaLager(sokvagar: string[], slugs: readonly string[]): Promise<Map<string, Map<string, string>>> {
  const rest = getSupabaseRest();
  const tomt = new Map<string, Map<string, string>>();
  if (!rest) return tomt; // ingen env ⇒ svensk fallback, 0 %
  for (const sokvag of sokvagar) {
    try {
      const svar = await fetch(`${rest.origin}${sokvag}`, {
        headers: { apikey: rest.headers.apikey, Authorization: rest.headers.Authorization },
        signal: AbortSignal.timeout(6000),
        // ISR-vänligt: on-demand-genereras med cache; publish kan
        // revalidateTag("oversattningar") / revalidateTag(`oversattningar:blogg`).
        next: { revalidate: 3600, tags: ["oversattningar", "oversattningar:blogg"] },
      });
      if (!svar.ok) continue; // troligen tabellen/kolumnen ej skapad ännu
      const lager = franRader(await svar.json(), slugs);
      if (lager.size > 0) return lager;
    } catch {
      /* nästa försök / tomt */
    }
  }
  return tomt;
}

/** Alla publicerade bloggöversättningar för EN slug: Map<nyckel, Map<sprak, text>>. */
export const hamtaBloggOversattningar = cache(
  async (slug: string): Promise<Map<string, Map<string, string>>> =>
    hamtaLager(
      [
        `/rest/v1/oversattningar?scope_typ=eq.blogg&scope_nyckel=like.${encodeURIComponent(`${slug}:*`)}&status=eq.publicerad&select=*&limit=10000`,
        `/rest/v1/oversattningar?scope_nyckel=like.${encodeURIComponent(`${slug}:*`)}&select=*&limit=10000`,
      ],
      [slug]
    )
);

/**
 * ALLA bloggöversättningar i EN fråga — till listvyerna /en|ar/blogg (en
 * fetch i stället för en per inlägg). `slugs` är samtidigt säkerhetsnät i
 * den toleranta fallback-frågan (utan scope_typ-filter).
 */
export const hamtaAllaBloggOversattningar = cache(
  async (slugs: readonly string[]): Promise<Map<string, Map<string, string>>> =>
    hamtaLager(
      [
        `/rest/v1/oversattningar?scope_typ=eq.blogg&status=eq.publicerad&select=*&limit=10000`,
        `/rest/v1/oversattningar?status=eq.publicerad&select=*&limit=10000`,
      ],
      slugs
    )
);

/** Plocka ett en-språk-lager (nyckel → publicerad text) ur ett alla-lager. */
export function urAllaLager(
  alla: Map<string, Map<string, string>>,
  slug: string,
  sprak: BloggSpegelSprak
): Map<string, string> {
  const lager = new Map<string, string>();
  for (const [nyckel, perSprak] of alla) {
    if (!nyckel.startsWith(`${slug}:`)) continue;
    const text = perSprak.get(sprak);
    if (text) lager.set(nyckel, text);
  }
  return lager;
}

/** Lager för EN slug + EN språk: nyckel → publicerad text. */
export async function hamtaBloggLager(slug: string, sprak: BloggSpegelSprak): Promise<Map<string, string>> {
  const alla = await hamtaBloggOversattningar(slug);
  return urAllaLager(alla, slug, sprak);
}

// ── Tillämpning: svenskt inlägg + lager → speglat inlägg + andel ─────────────

export type BloggSpegel = {
  /** Inläggskopia där titel, ingress och alla stycken bytts mot publicerade
   *  översättningar — svensk originaltext där sådan saknas. `post.body` är
   *  ommonterad ur de speglade styckena (samma /\n\n+/-format). */
  post: BlogPost;
  /** De speglade styckena i ordning (block inkl. ##-rubriker och listor). */
  stycken: string[];
  /** Publicerad andel av källuniversumet (titel+ingress+stycken, kalla.ts-
   *  paritet), 0–100. */
  procent: number;
  publicerade: number;
  totala: number;
  /** true när ALLA fält är publicerade (notis döljs). */
  komplett: boolean;
  /** true när andelen nått SEO-tröskeln (indexerbar). */
  indexerbar: boolean;
};

/**
 * Bygg bloggspegeln: räkna enheterna med samma filter som kalla.ts (icke-tom
 * titel/ingress/stycke), plocka publicerade översättningar ur lagret, fallback
 * till svensk originaltext per fält. Markdownstrukturen (## / listor / ** **)
 * ligger kvar i texterna och renderas av BloggSpegelSida.
 */
export function byggBloggSpegel(post: BlogPost, lager: Map<string, string>): BloggSpegel {
  let publicerade = 0;
  let totala = 0;
  const ta = (nyckel: string, svensk: string): string => {
    totala += 1;
    const text = lager.get(nyckel);
    if (typeof text === "string" && text.trim().length > 0) {
      publicerade += 1;
      return text;
    }
    return svensk;
  };

  const title = ta(nyckelBloggTitel(post.slug), post.title);
  const description = ta(nyckelBloggIngress(post.slug), post.description);
  const stycken = bloggStycken(post.body).map((p, i) => ta(nyckelBloggStycke(post.slug, i + 1), p));

  const procent = totala === 0 ? 100 : Math.round((publicerade / totala) * 100);
  return {
    post: { ...post, title, description, body: stycken.join("\n\n") },
    stycken,
    procent,
    publicerade,
    totala,
    komplett: publicerade >= totala,
    indexerbar: procent >= INDEX_TRASKEL,
  };
}

// ── Metadata: per språk, hreflang mot originalet, noindex under tröskeln ─────

/**
 * Metadata för bloggspegeln. Under INDEX_TRASKEL % publicerat:
 *   robots noindex,follow + canonical → SVENSKA originalet /blogg/{slug}
 *   (halvfärdiga speglar konkurrerar aldrig med originalet i söket).
 * Vid ≥ tröskeln: egen canonical + fullt hreflang-kluster (sv-SE/en/ar/
 * x-default→sv) — samma mönster som kursSpegelMetadata().
 */
export function bloggSpegelMetadata(opts: { lang: BloggSpegelSprak; spegel: BloggSpegel }): Metadata {
  const { lang, spegel } = opts;
  const post = spegel.post;
  const slug = post.slug;
  const svUrl = `${SPEGEL_SITE_URL}/blogg/${slug}`;
  const egenUrl = `${SPEGEL_SITE_URL}/${lang}/blogg/${slug}`;
  const index = spegel.indexerbar;

  const titel =
    lang === "en"
      ? `${post.title} — Blog | ${SPEGEL_SITE_NAME}`
      : `${post.title} — المدونة | ${SPEGEL_SITE_NAME}`;
  const beskrivning = clamp(
    lang === "en"
      ? `${post.description} In-depth article on Swedish stock analysis and institutional methodology by AK1A Research Lab.`
      : `${post.description} مقالة معمّقة في تحليل الأسهم السويدية والمنهجية المؤسسية من AK1A Research Lab.`,
    300
  );

  return {
    title: titel,
    description: beskrivning,
    keywords: ["AK1A", post.title, ...(post.tags ?? []).slice(0, 5), lang === "en" ? "stock analysis" : "تحليل الأسهم"],
    alternates: index
      ? {
          canonical: egenUrl,
          languages: {
            "sv-SE": svUrl,
            en: `${SPEGEL_SITE_URL}/en/blogg/${slug}`,
            ar: `${SPEGEL_SITE_URL}/ar/blogg/${slug}`,
            "x-default": svUrl,
          },
        }
      : {
          // Under tröskeln: canonical MOT ORIGINALET — hreflang-klustret är
          // avsiktligt ute (vi annonserar inte halvfärdiga speglar till robotar).
          canonical: svUrl,
        },
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: titel,
      description: beskrivning,
      url: egenUrl,
      siteName: SPEGEL_SITE_NAME,
      type: "article",
      locale: lang === "ar" ? "ar_AR" : "en_US",
      alternateLocale: ["sv_SE"],
      publishedTime: post.publishedAt,
    },
    twitter: { card: "summary_large_image", title: titel, description: beskrivning },
  };
}

function clamp(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Artikel-JSON-LD på målspråk (spegel mot articleJsonLd i seo.tsx). */
export function bloggSpegelJsonLd(spegel: BloggSpegel, lang: BloggSpegelSprak) {
  const post = spegel.post;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    inLanguage: lang === "ar" ? "ar" : "en",
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SPEGEL_SITE_NAME,
      url: SPEGEL_SITE_URL,
    },
    mainEntityOfPage: `${SPEGEL_SITE_URL}/${lang}/blogg/${post.slug}`,
  };
}
