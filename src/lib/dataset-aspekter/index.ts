/**
 * DATASET-ASPEKTER — REGISTRET (våg 150 slutled, fas A)
 * =====================================================
 * Samlar fabrikens fyra modulfilers aspekter till EN modulmap som delas av
 * rutten (src/app/(huvud)/dataset/[bransch]/[aspekt]) och sitemap — så att
 * gränsregeln (matta >= MIN_MATTA) räknas EN gång och publicerade URL:er
 * aldrig kan skilja sig mellan dem (VÅG150-RAPPORT §6 steg 2+4).
 *
 * Registret är SLUTLEDET som kontraktet talar om: exkluderingen av sidor
 * under gränsregeln fattas HÄR (generateStaticParams + sitemap), medan
 * modulerna sedan u5:s vit-test dessutom returnerar null under gränsen
 * (dubbelgrind — se kontraktets filhuvud).
 *
 * Gränsdragningen gäller oförändrat: registret bär ENBAST publika
 * marknadsnyckeltal ur bolagsunivers.json (via modulerna) — aldrig
 * bolagsnamn, tickers, AKM-poäng eller vågklasser.
 */
import { MIN_MATTA, type AspektModule } from "../dataset-aspekter-kontrakt";
import { branschSlugs, lasBranschMedianer } from "../dataset-medianer";
import { aspekter as landAspekter } from "./land";
import { aspekter as nyckeltalA } from "./nyckeltal-a";
import { aspekter as nyckeltalB } from "./nyckeltal-b";
import { aspekter as varderingAspekter } from "./vardering";

/** Alla fas A-moduler (15 aspekter): nyckeltal A + B, land, värderingshub. */
export const aspektModuler: AspektModule[] = [
  ...nyckeltalA,
  ...nyckeltalB,
  ...landAspekter,
  ...varderingAspekter,
];

/** Aspekt-slug → modul (rutten slår upp params mot detta). */
export function aspektUrSlug(slug: string): AspektModule | undefined {
  return aspektModuler.find((m) => m.slug === slug);
}

/** Param-uppsättningen för generateStaticParams/sitemap: { bransch, aspekt }. */
export type AspektParam = { bransch: string; aspekt: string };

/**
 * ALLA publicerbara aspekt-URL:er: bransch-slugs (dataset-medianernas
 * namnkälla — EN branschvärld) × modulerna, filtrerat på gränsregeln.
 * Modulernas null-retur + matta-kontrollen nedan är samma gräns två gånger
 * (dubbelgrinden) — utfallet är fas A:s 130 URL:er av 150 teoretiska.
 */
export function aspektParametrar(): AspektParam[] {
  const branscher = branschSlugs(lasBranschMedianer());
  const ut: AspektParam[] = [];
  for (const bransch of branscher) {
    for (const modul of aspektModuler) {
      const sida = modul.generera(bransch);
      if (sida !== null && sida.matta >= MIN_MATTA) {
        ut.push({ bransch, aspekt: modul.slug });
      }
    }
  }
  return ut;
}
