import fs from "node:fs";
import path from "node:path";

// VÄXTHUSET 2.0 (r284, v191 Fas 1) — hyresgästernas innehållsmodell.
// Hyresgästens yta lever UTANFOR repot (nya servern: /home/ak1a/tenants/<slug>)
// och ägs av agenten + hyresgästen gemensamt: agenten redigerar JSON, aldrig kod.
// VAXTHUS_KATALOG överridas i test; utan katalog ⇒ tom lista, aldrig kast.

export interface VaxthusSektion {
  typ: "rubrik" | "text" | "bild" | "knapp";
  rubrik?: string;
  text?: string;
  bild?: string;
  knappText?: string;
  knappLank?: string;
}

export interface VaxthusSida {
  slug: string;
  titel: string;
  sektioner: VaxthusSektion[];
}

export interface VaxthusStilar {
  primarFarg: string;
  bakgrundsFarg: string;
  textFarg: string;
}

export interface VaxthusSite {
  namn: string;
  tagline: string;
  stilar: VaxthusStilar;
  sidor: VaxthusSida[];
}

export interface VaxthusListaPost {
  slug: string;
  namn: string;
  tagline: string;
}

export function vaxthusKatalog(): string {
  return process.env.VAXTHUS_KATALOG ?? path.join(process.env.HOME ?? "/home/ak1a", "tenants");
}

const SLUG_RE = /^[a-z0-9-]+$/;

function arGiltigSite(site: unknown): site is VaxthusSite {
  if (!site || typeof site !== "object") return false;
  const s = site as Partial<VaxthusSite>;
  return (
    typeof s.namn === "string" &&
    s.namn.length > 0 &&
    typeof s.tagline === "string" &&
    Array.isArray(s.sidor) &&
    s.sidor.length > 0 &&
    s.sidor.every(
      (sid) => sid && typeof sid.slug === "string" && typeof sid.titel === "string" && Array.isArray(sid.sektioner),
    )
  );
}

export function lasSite(slug: string): VaxthusSite | null {
  if (!SLUG_RE.test(slug)) return null;
  const fil = path.join(vaxthusKatalog(), slug, "innehall", "site.json");
  try {
    const rå = JSON.parse(fs.readFileSync(fil, "utf8")) as unknown;
    return arGiltigSite(rå) ? rå : null;
  } catch {
    return null;
  }
}

export function listaHyresgaster(): VaxthusListaPost[] {
  try {
    return fs
      .readdirSync(vaxthusKatalog(), { withFileTypes: true })
      .filter((e) => e.isDirectory() && SLUG_RE.test(e.name))
      .map((e) => {
        const site = lasSite(e.name);
        return { slug: e.name, namn: site?.namn ?? e.name, tagline: site?.tagline ?? "" };
      })
      .sort((a, b) => a.slug.localeCompare(b.slug));
  } catch {
    return [];
  }
}

export function lasSida(slug: string, sidaSlug: string | undefined): VaxthusSida | null {
  const site = lasSite(slug);
  if (!site) return null;
  const mall = sidaSlug && sidaSlug.length > 0 ? sidaSlug : site.sidor[0]?.slug;
  return site.sidor.find((s) => s.slug === mall) ?? site.sidor[0] ?? null;
}
