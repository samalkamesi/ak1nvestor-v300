"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * DATASET-SORTERING (VÅG 98 F2) — valbar sortering av /dataset-indexlistan
 * via query-param ?sortera=bransch|pe-hogst|pe-lagst.
 *
 * VARFÖR klientkomponent och inte searchParams i sidfilen: rutten är
 * force-static + ISR 24 h (VÅG 97 E1:s citeringsmagnet-kontrakt), och Next 16
 * tvingar searchParams till TOMMA vid force-static — server-side läsning av
 * query-paramet vore oförenlig med den statiska sidversionen (F1:s
 * ISR-uppvärmning + 24 h-cachen). Mönstret här bevarar ALLT: sidan förblir en
 * cachad statisk version; ?sortera= är en vanlig adressbar länk (delbar,
 * bakåt-vänlig) och sorteringen sker på den INBÄDDADE datan i klienten — noll
 * extra nätverksanrop, samma dataobjekt som servern renderade.
 *
 * Hydration-ärlighet: första passet renderar A–Ö (identiskt med server-HTML:
 * useSearchParams är tom under förrenderingen), och vald sortering appliceras
 * i useEffect — aldrig hydrations-mismatch. All text kommer som färdiga
 * etiketter (props) från servern — ordlistan bundlas inte i klienten.
 */

export type SorterbarBransch = {
  slug: string;
  namn: string;
  /** Råtal för sorteringen (formaterad text bärs av peText). */
  pe: number | null;
  peText: string;
  nText: string;
};

/** Färdigoversatta etiketter från ordlistan (servern) — se DatasetIndexVy. */
export type SorteringsEtiketter = {
  rubrik: string;
  sorteraBransch: string;
  sorteraPeHogst: string;
  sorteraPeLagst: string;
  kolumnBransch: string;
  kolumnMedianPe: string;
  kolumnAntal: string;
  kolumnDetaljer: string;
  detaljer: string;
};

type Sortering = "bransch" | "pe-hogst" | "pe-lagst";

const GILTIGA: readonly Sortering[] = ["bransch", "pe-hogst", "pe-lagst"];

function tolkaSortera(v: string | null): Sortering {
  return GILTIGA.includes(v as Sortering) ? (v as Sortering) : "bransch";
}

/** Deterministisk sortering — null sist, ties på branschnamn i svensk kollation. */
function sorteraRader(rader: readonly SorterbarBransch[], sortering: Sortering): SorterbarBransch[] {
  const kopia = [...rader];
  if (sortering === "bransch") {
    kopia.sort((a, b) => a.namn.localeCompare(b.namn, "sv"));
    return kopia;
  }
  kopia.sort((a, b) => {
    if (a.pe === null && b.pe === null) return a.namn.localeCompare(b.namn, "sv");
    if (a.pe === null) return 1;
    if (b.pe === null) return -1;
    return sortering === "pe-hogst" ? b.pe - a.pe : a.pe - b.pe;
  });
  return kopia;
}

export function DatasetSorteradLista({
  rader,
  etiketter,
  prefix,
}: {
  rader: readonly SorterbarBransch[];
  etiketter: SorteringsEtiketter;
  /** Språkprefix ("", "/en", "/ar") — länkarna stannar på samma språkyta. */
  prefix: string;
}) {
  const parametrar = useSearchParams();
  const [sortering, setSortering] = useState<Sortering>("bransch");

  useEffect(() => {
    setSortering(tolkaSortera(parametrar?.get("sortera") ?? null));
  }, [parametrar]);

  const val: Array<{ id: Sortering; text: string }> = [
    { id: "bransch", text: etiketter.sorteraBransch },
    { id: "pe-hogst", text: etiketter.sorteraPeHogst },
    { id: "pe-lagst", text: etiketter.sorteraPeLagst },
  ];
  const sorterade = sorteraRader(rader, sortering);

  return (
    <>
      <div
        className="mt-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label={etiketter.rubrik}
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {etiketter.rubrik}:
        </span>
        {val.map((v) => (
          <Link
            key={v.id}
            href={"?sortera=" + v.id}
            scroll={false}
            aria-current={sortering === v.id ? "true" : undefined}
            className={
              sortering === v.id
                ? "rounded-full border border-gold/60 bg-gold/10 px-3 py-1 text-sm font-semibold text-foreground"
                : "rounded-full border border-gold/30 px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {v.text}
          </Link>
        ))}
      </div>

      {/* Mobil: vertikala kort — desktop: tabell (VÅG 97 E1:s mönster, samma
          kolumnuppsättning: bransch · median-P/E · antal · detaljlänk). */}
      <div className="mt-3 space-y-3 md:hidden">
        {sorterade.map((r) => (
          <div key={r.slug} className="rounded-xl border border-gold/20 bg-card p-3">
            <span className="flex items-baseline justify-between">
              <Link
                href={prefix + "/dataset/" + r.slug}
                className="font-serif text-base font-bold text-foreground underline decoration-gold/40 underline-offset-4"
              >
                {r.namn}
              </Link>
              <span className="text-xs text-muted-foreground">n={r.nText}</span>
            </span>
            <span className="mt-1 block text-sm">
              <strong className="text-foreground">{etiketter.kolumnMedianPe}:</strong> {r.peText}
            </span>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-foreground">
              <th className="py-1.5 pr-4 font-semibold">{etiketter.kolumnBransch}</th>
              <th className="py-1.5 pr-4 font-semibold">{etiketter.kolumnMedianPe}</th>
              <th className="py-1.5 pr-4 font-semibold">{etiketter.kolumnAntal}</th>
              <th className="py-1.5 font-semibold">
                <span className="sr-only">{etiketter.kolumnDetaljer}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorterade.map((r) => (
              <tr key={r.slug} className="border-t border-gold/10">
                <td className="py-1.5 pr-4">
                  <Link
                    href={prefix + "/dataset/" + r.slug}
                    className="font-semibold text-foreground underline decoration-gold/40 underline-offset-4"
                  >
                    {r.namn}
                  </Link>
                </td>
                <td className="py-1.5 pr-4 font-semibold text-foreground">{r.peText}</td>
                <td className="py-1.5 pr-4 text-muted-foreground">{r.nText}</td>
                <td className="py-1.5">
                  <Link
                    href={prefix + "/dataset/" + r.slug}
                    className="text-muted-foreground underline decoration-gold/40 underline-offset-4 hover:text-foreground"
                  >
                    {etiketter.detaljer}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
