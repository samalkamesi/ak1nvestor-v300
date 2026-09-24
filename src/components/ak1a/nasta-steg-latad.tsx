"use client";

import dynamic from "next/dynamic";

/**
 * NASTA STEG — uppskjuten laddning (o118, spår 7; o105 §6 post 3).
 *
 * NastaSteg är personlig mönsterigenkänning: den läser elevens lokala
 * statistik (member-local) först i useEffect och renderar ALDRIG något i
 * server-HTML ("tomt första passt"-kontraktet i nasta-steg.tsx). Ändå
 * bundleades modulen i shellens delade chunk och hydratiserades i det
 * kritiska fönstret på ALLA SEO-sidor — FÖRE-bevis 2026-09-20: chunken
 * 10f47l5mmeoxy.js (57 kB rå / 17 kB gzip) bar widgetens fem unika
 * strängar med 12–17 initial-referenser per sida på /en/blogg, /ar/blogg,
 * /blogg och /kurser; /en/blogg-anomalin (TBT ~1 100 ms under last mot
 * ~325 tyst, script-last identisk — o110) bekräftade widgeten som nästa
 * kur (o105 §6.3, o109:s facit).
 *
 * o71:s SearchModal-mönster (RefMottagare-klassen — SSR=null-kontrakt):
 * dynamisk import med ssr:false flyttar koden till egen chunk som hämtas
 * först efter sidans kritiska hydratisering. SSR-HTML:n blir bitidentisk
 * (fallback null = förra null-renderen), no-JS-kontraktet orött (widgeten
 * syntes aldrig utan JS) och sektionen syns för eleven vid samma logiska
 * tidpunkt som förut — efter mount. Shell-sidor är serverkomponenter där
 * App Router förbjuder ssr:false, därav denna tunna klient-wrapper.
 */

export const NastaStegLatad = dynamic(
  () => import("@/components/ak1a/nasta-steg").then((m) => ({ default: m.NastaSteg })),
  { ssr: false },
);
