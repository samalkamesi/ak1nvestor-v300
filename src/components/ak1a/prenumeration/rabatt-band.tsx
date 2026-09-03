"use client";

/**
 * RABATT-BAND — Fas 2/Fas 3-rabatten (data/portfolj-system/priser.json →
 * rabattFas.fas2/fas3).
 *
 * Två lägen, samma band:
 *  - Icke-elev: bandet är ett försäljningsargument — "Fas 2- eller Fas 3-elev?
 *    X % rabatt för alltid" + länk till /fas2-ansok. Rabatt-procenten och
 *    exempelperiset läses ur priser.json via props — inget hårdkodat.
 *  - Elev (member-local: harFas2Access/harFas3Access efter montering): bandet
 *    bekräftar "din status känns igen automatiskt" och VISAR det rabatterade
 *    priset för exempelnivån direkt (ordinarie överstruket → rabatterat).
 */

import Link from "next/link";
import {
  useFasRabatt,
  formateraKr,
  rabatteratPris,
  type PrenumerationNiva,
  type RabattFasInfo,
} from "@/lib/prenumeration";

export function RabattBand({
  rabattFas,
  exempelNiva,
}: {
  rabattFas: RabattFasInfo;
  /** Lägsta nivån ur priser.json — visas som konkret exempel. */
  exempelNiva: PrenumerationNiva;
}) {
  const { hydrerad, fasStatus, harRabatt, rabatt, rabattProcent } = useFasRabatt(rabattFas);

  // Elev → den kännda rabatten; icke-elev → Fas 2-rabatten i pitcken (lägsta tröskeln).
  const exempelRabatt = harRabatt ? rabatt : rabattFas.fas2;
  const exempelRabatterat = rabatteratPris(exempelNiva.prisManad, exempelRabatt);

  return (
    <div className="marin-panel rounded-2xl border border-[#E8C766]/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">
            🎓
          </span>
          <div>
            <p className="font-serif text-lg font-bold text-[#E8C766]">
              {hydrerad && harRabatt
                ? `Din Fas ${fasStatus === "fas3" ? "3" : "2"}-status är kännd — ${rabattProcent} % rabatt för alltid`
                : `Fas 2- eller Fas 3-elev? ${Math.round(rabattFas.fas2 * 100)} % rabatt för alltid`}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#EDE6D6]/85">
              {hydrerad && harRabatt ? (
                <>
                  Din status känns igen automatiskt — du behöver aldrig bevis eller
                  kupongkoder. Exempel: {exempelNiva.namn}{" "}
                  <span className="line-through">{formateraKr(exempelNiva.prisManad)}</span>{" "}
                  <strong className="text-[#E8C766]">{formateraKr(exempelRabatterat)}</strong>/mån,
                  alla nivåer, både månads- och årspris.
                </>
              ) : (
                <>
                  Din status känns igen automatiskt — inga kupongkoder. Exempel:{" "}
                  {exempelNiva.namn} <span className="line-through">{formateraKr(exempelNiva.prisManad)}</span>{" "}
                  <strong className="text-[#E8C766]">{formateraKr(exempelRabatterat)}</strong>/mån.
                  Prenumerationen är öppen för alla — utbildningseleverna får den bara
                  lite billigare, för alltid.
                </>
              )}
            </p>
          </div>
        </div>

        {!(hydrerad && harRabatt) && (
          <Link
            href="/fas2-ansok"
            className="shrink-0 rounded-md border border-[#E8C766] px-4 py-2.5 text-center text-sm font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/15"
          >
            Ansök om Fas 2 →
          </Link>
        )}
      </div>
    </div>
  );
}
