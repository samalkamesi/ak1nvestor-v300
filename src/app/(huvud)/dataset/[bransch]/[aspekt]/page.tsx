import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AspektVy } from "@/components/ak1a/dataset-aspekt-vy";
import { aspektParametrar, aspektUrSlug } from "@/lib/dataset-aspekter";
import { lasAspektUniversum } from "@/lib/dataset-aspekter-kontrakt";
import { branschNamn } from "@/lib/dataset-medianer";
import { sidaMetadata } from "@/lib/seo";

/**
 * /dataset/[bransch]/[aspekt] — aspektsidorna (VÅG 150 fas A slutled):
 * 130 statiska långsvanssidor ("ROE inom Teknik", "Svenska
 * fastighetsbolag", "Värdering inom Industri" …) byggda på modulernas
 * AspektSida ur bolagsuniversets publika nyckeltal. SSG via
 * generateStaticParams (registret — gränsregeln matta >= MIN_MATTA
 * räknas EN gång och delas med sitemap), därefter ISR 24 h.
 *
 * Okänd bransch/aspekt — eller sidan fallen mot gränsregeln — ⇒ 404:
 * dynamicParams false ger det FÖRE render (aldrig soft-404), notFound()
 * är försvarslinjen om ett anrop ändå når render.
 *
 * Kontraktet (src/lib/dataset-aspekter-kontrakt.ts) styr datat; VYN
 * trycker disclaimern "Pedagogisk analys — inte investeringsråd." —
 * den finns ingenstans i datatyperna (KVD §7 punkt 4).
 */
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return aspektParametrar();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bransch: string; aspekt: string }>;
}): Promise<Metadata> {
  const { bransch, aspekt } = await params;
  const modul = aspektUrSlug(aspekt);
  const sida = modul?.generera(bransch);
  if (!modul || !sida) return {};
  const namn = branschNamn("sv", bransch);
  const kort = sida.titel.split(" — ")[0] ?? sida.titel;
  return sidaMetadata({
    path: `/dataset/${bransch}/${aspekt}`,
    title: sida.titel,
    description: sida.beskrivning,
    keywords: [
      `${kort} ${namn.toLowerCase()}`,
      `${kort.toLowerCase()} median`,
      `${namn.toLowerCase()} nyckeltal`,
      `${kort.toLowerCase()} spridning`,
      "AK1A Research Lab",
    ],
  }).metadata;
}

export default async function DatasetAspektSida({
  params,
}: {
  params: Promise<{ bransch: string; aspekt: string }>;
}) {
  const { bransch, aspekt } = await params;
  const modul = aspektUrSlug(aspekt);
  const sida = modul?.generera(bransch);
  if (!modul || !sida) notFound();

  const namn = branschNamn("sv", bransch);
  const syskon = aspektParametrar()
    .filter((p) => p.bransch === bransch && p.aspekt !== aspekt)
    .map((p) => ({
      slug: p.aspekt,
      titel: (aspektUrSlug(p.aspekt)?.titel(namn) ?? p.aspekt).split(" — ")[0],
    }));

  return <AspektVy sida={sida} hamtat={lasAspektUniversum().hamtat} syskon={syskon} />;
}
