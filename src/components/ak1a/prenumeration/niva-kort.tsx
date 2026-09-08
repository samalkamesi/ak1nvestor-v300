"use client";

/**
 * NIVÅ-KORT — ett pris-kort per prenumerationsnivå ur priser.json.
 *
 * ALLA belopp kommer via props från servern (lasPriser() läser
 * data/portfolj-system/priser.json) — komponenten hårdkodar inga pris-siffror.
 *
 * Fas-rabatt-logik: efter montering läses member-local (harFas2Access/
 * harFas3Access i kurs-access.ts). Känns en fas-status igen visas det
 * ordinarie priset överstruket + det rabatterade priset + en rabatt-chip.
 * Innan hydrering (och för icke-elever) visas det ordinarie priset rakt av —
 * SSR-HTML och första klient-rendering är identiska (ingen hydration-flash).
 */

import {
  useFasRabatt,
  formateraKr,
  rabatteratPris,
  manaderGratis,
  type PrenumerationNiva,
  type RabattFasInfo,
} from "@/lib/prenumeration";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

export function NivaKort({
  niva,
  ingar,
  rabattFas,
  markerad = false,
}: {
  niva: PrenumerationNiva;
  /** Checklist-rader — servern bygger dem ur beskrivningen + utökade. */
  ingar: string[];
  rabattFas: RabattFasInfo;
  /** Mitt-kortet ("Mest valda") — guldkant och skugga. */
  markerad?: boolean;
}) {
  const { t, tText } = useSprak();
  const { hydrerad, fasStatus, harRabatt, rabatt, rabattProcent } = useFasRabatt(rabattFas);

  const manad = rabatteratPris(niva.prisManad, rabatt);
  const ar = rabatteratPris(niva.prisAr, rabatt);
  const gratisManader = manaderGratis(niva.prisManad, niva.prisAr);

  /** Välj nivån i AktiveraPanelen + scrolla dit (samma CustomEvent-mönster
   *  som ak1a:oppna-sok — sidan är en server-komponent och kan inte ta callbacks). */
  const valj = () => {
    window.dispatchEvent(
      new CustomEvent("ak1a:valj-prenumeration", { detail: { nivaId: niva.id } })
    );
    document.getElementById("aktivera")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <article
      className={`relative flex flex-col rounded-xl bg-card p-7 ${
        markerad
          ? "border-2 border-gold shadow-lg"
          : "border border-gold/30"
      }`}
    >
      {markerad && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow">
          {t("prenum.mestValda")}
        </span>
      )}

      <h3 className="font-serif text-xl font-bold leading-tight">{niva.namn}</h3>

      {/* Pris — månadsvis */}
      <div className="mt-4">
        {hydrerad && harRabatt ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm text-muted-foreground line-through">
              {formateraKr(niva.prisManad)}
            </span>
            <span className="font-serif text-4xl font-black text-gold">
              {formateraKr(manad)}
            </span>
            <span className="text-sm text-muted-foreground">{t("prenum.perManad")}</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-serif text-4xl font-black">{formateraKr(niva.prisManad)}</span>
            <span className="text-sm text-muted-foreground">{t("prenum.perManad")}</span>
          </div>
        )}
        {hydrerad && harRabatt && (
          <span className="mt-1.5 inline-block rounded-full border border-bull/40 bg-bull/10 px-2.5 py-0.5 text-[11px] font-semibold text-bull">
            {t("prenum.fasRabattChip", {
              fas: fasStatus === "fas3" ? "3" : "2",
              procent: rabattProcent,
            })}
          </span>
        )}

        {/* Årspris — med "månader gratis"-badge ur prisdatan */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {hydrerad && harRabatt && (
            <span className="line-through">{formateraKr(niva.prisAr)}</span>
          )}
          <span className={harRabatt ? "font-semibold text-foreground" : "text-foreground"}>
            {formateraKr(ar)}
          </span>
          <span>{t("prenum.perAr")}</span>
          {gratisManader !== null && (
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold">
              {gratisManader === 1
                ? t("prenum.manader1")
                : gratisManader === 2
                  ? t("prenum.manader2")
                  : t("prenum.manaderFlera", { n: gratisManader })}
            </span>
          )}
        </div>
      </div>

      {/* Beskrivning ur priser.json — tText-exaktmatch mot ordlistan (V86):
          svensk data ordagrant på /prenumeration, översatt på speglarna. */}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{tText(niva.beskrivning)}</p>

      {/* Vad som ingår */}
      <ul className="mt-4 flex-1 space-y-2 text-sm">
        {ingar.map((punkt) => (
          <li key={punkt} className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-gold" aria-hidden="true">
              ✓
            </span>
            <span className="text-muted-foreground">{punkt}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={valj}
        className={`mt-6 rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
          markerad
            ? "bg-gold text-primary-foreground"
            : "border border-gold/50 text-foreground hover:bg-gold/10"
        }`}
      >
        {t("prenum.aktiveraNiva")}
      </button>
    </article>
  );
}
