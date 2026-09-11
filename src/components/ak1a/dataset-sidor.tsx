import Link from "next/link";

import { type OrdlistaNyckel } from "@/lib/ordlista";
import { SITE_URL, JsonLd } from "@/lib/seo";
import { skapaT, type SprakId } from "@/lib/sprak";
import { branschNamn as branschNamnFranLib, type BranschMedianer, type DatasetMedianRad } from "@/lib/dataset-medianer";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

/**
 * DATASET-SIDORNA — delade serverkomponenter för /dataset, /dataset/[bransch]
 * och deras /en- + /ar-speglar (VÅG 97 E1, DATASET-CITERINGSMAGNETER).
 *
 * ALL text kommer ur ordlistans "dataset"-domän (svenska först — kalla.ts
 * lasUiKallor registrerar varje nyckel som MÖS-källa automatiskt), läst med
 * skapaT(lang) och sv-fallback. Sex tunna sidfiler återanvänder dessa vyer:
 * ingen text dupliceras mellan språkversionerna.
 *
 * KONTRAKT (A2-DATASET-KONTRAKT §1): vyerna renderar ENBAST branschmedianer
 * med n — dataobjektet (BranschMedianer) kan per konstruktion inte bära
 * bolagsnamn eller poäng. Talen formateras per språk (sv decimalkomma).
 */

/** Språkprefix för interna länkar: sv ⇒ "", en ⇒ "/en", ar ⇒ "/ar". */
export function datasetPrefix(lang: SprakId): string {
  return lang === "sv" ? "" : "/" + lang;
}

/** "31,8" på svenska, "31.8" på en/ar; null redovisas ärligt som "—". */
export function datasetTal(x: number | null, lang: SprakId): string {
  if (x === null) return "—";
  const s = String(x);
  return lang === "sv" ? s.replace(".", ",") : s;
}

/** Procenttal: sv "20 %", en/ar "20%"; null ⇒ "—". */
export function datasetProcent(x: number | null, lang: SprakId): string {
  if (x === null) return "—";
  return lang === "sv" ? datasetTal(x, lang) + " %" : datasetTal(x, lang) + "%";
}

/** Visningsnamn för en bransch-nyckel — återexport ur libbet (enda namnkällan). */
export function branschNamn(lang: SprakId, slug: string): string {
  return branschNamnFranLib(lang, slug);
}

// ── JSON-LD: schema.org Dataset ──────────────────────────────────────────────

/** De fem publika variablerna — samma namn som detaljtabellens rader. */
function datasetVariabler(lang: SprakId): string[] {
  const t = skapaT(lang);
  return [
    t("dataset.mat.pe"),
    t("dataset.mat.pb"),
    t("dataset.mat.ebit"),
    t("dataset.mat.fcf"),
    t("dataset.mat.tillvaxt"),
  ];
}

/** Index-sidans Dataset-schema: namn, beskrivning, variabler, licens m.m. */
export function datasetJsonLd(lang: SprakId, m: BranschMedianer): object {
  const t = skapaT(lang);
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: t("dataset.jsonld.namn"),
    description: t("dataset.jsonld.beskrivning", {
      nBolag: m.totalt.nBolag,
      hamtat: m.hamtat ?? "—",
    }),
    url: SITE_URL + datasetPrefix(lang) + "/dataset",
    creator: {
      "@type": "Organization",
      name: "AK1A Research Lab",
      url: SITE_URL,
    },
    variableMeasured: datasetVariabler(lang),
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    inLanguage: lang === "sv" ? "sv-SE" : lang,
    dateModified: m.hamtat ?? undefined,
  };
}

/** Detaljsidans Dataset-schema — branschens fem medianer i description. */
export function datasetBranschJsonLd(
  lang: SprakId,
  rad: DatasetMedianRad,
  m: BranschMedianer,
): object {
  const t = skapaT(lang);
  const namn = branschNamn(lang, rad.bransch);
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: t("dataset.detalj.titel", { bransch: namn }),
    description:
      t("dataset.jsonld.beskrivning", { nBolag: m.totalt.nBolag, hamtat: m.hamtat ?? "—" }) +
      " " +
      t("dataset.meta.detalj.beskrivning", {
        bransch: namn,
        nBolag: m.totalt.nBolag,
        hamtat: m.hamtat ?? "—",
        pe: datasetTal(rad.medianPe, lang),
        pb: datasetTal(rad.medianPb, lang),
        ebit: datasetTal(rad.medianEbitMarginal, lang),
        fcf: datasetTal(rad.medianFcfMarginal, lang),
        tillvaxt: datasetTal(rad.medianTillvaxt, lang),
      }),
    url: SITE_URL + datasetPrefix(lang) + "/dataset/" + rad.bransch,
    isPartOf: SITE_URL + datasetPrefix(lang) + "/dataset",
    creator: { "@type": "Organization", name: "AK1A Research Lab", url: SITE_URL },
    variableMeasured: datasetVariabler(lang),
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    inLanguage: lang === "sv" ? "sv-SE" : lang,
    dateModified: m.hamtat ?? undefined,
  };
}

// ── Metod + disclaimer (identisk sektion på index och detaljer) ─────────────

function MetodOchDisclaimer({ lang }: { lang: SprakId }) {
  const t = skapaT(lang);
  return (
    <>
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">{t("dataset.metod.rubrik")}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {t("dataset.metod.text")}
        </p>
      </section>
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          {t("dataset.disclaimer.rubrik")}
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {t("dataset.disclaimer.text")}
        </p>
      </section>
    </>
  );
}

/** Källrad + licensieringsrad — citeringsmagnetens attributionblock. */
function KallaOchLicens({
  lang,
  kallor,
}: {
  lang: SprakId;
  kallor: string[];
}) {
  const t = skapaT(lang);
  return (
    <div className="mt-4 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
      <p>{t("dataset.tabell.kalla", { kallor: kallor.join(", ") })}</p>
      <p>{t("dataset.jsonld.licens")}</p>
    </div>
  );
}

// ── Index-vyn (/dataset) ─────────────────────────────────────────────────────

export function DatasetIndexVy({
  lang,
  medianer,
}: {
  lang: SprakId;
  medianer: BranschMedianer;
}) {
  const t = skapaT(lang);
  const prefix = datasetPrefix(lang);
  return (
    <SeoPageShell breadcrumb={[{ name: t("dataset.brodsmula") }]} wide>
      <JsonLd data={datasetJsonLd(lang, medianer)} />

      <h1 className="font-serif text-4xl font-bold">{t("dataset.titel")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("dataset.datering", { hamtat: medianer.hamtat ?? "—" })}
      </p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        {t("dataset.ingress", { nBolag: medianer.totalt.nBolag })}
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">{t("dataset.tabell.rubrik")}</h2>

        {/* Mobil: vertikala kort — desktop: tabell (nyckeltalsguide-mönstret). */}
        <div className="mt-4 space-y-3 md:hidden">
          {medianer.rader.map((r) => (
            <div key={r.bransch} className="rounded-xl border border-gold/20 bg-card p-3">
              <span className="flex items-baseline justify-between">
                <Link
                  href={prefix + "/dataset/" + r.bransch}
                  className="font-serif text-base font-bold text-foreground underline decoration-gold/40 underline-offset-4"
                >
                  {branschNamn(lang, r.bransch)}
                </Link>
                <span className="text-xs text-muted-foreground">
                  n={r.nPe}/{r.antalBolag}
                </span>
              </span>
              <span className="mt-1 block text-sm">
                <strong className="text-foreground">{t("dataset.tabell.medianPe")}:</strong>{" "}
                {datasetTal(r.medianPe, lang)}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-foreground">
                <th className="py-1.5 pr-4 font-semibold">{t("dataset.tabell.bransch")}</th>
                <th className="py-1.5 pr-4 font-semibold">{t("dataset.tabell.medianPe")}</th>
                <th className="py-1.5 pr-4 font-semibold">{t("dataset.tabell.antal")}</th>
                <th className="py-1.5 font-semibold">
                  <span className="sr-only">{t("dataset.tabell.detaljer")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {medianer.rader.map((r) => (
                <tr key={r.bransch} className="border-t border-gold/10">
                  <td className="py-1.5 pr-4">
                    <Link
                      href={prefix + "/dataset/" + r.bransch}
                      className="font-semibold text-foreground underline decoration-gold/40 underline-offset-4"
                    >
                      {branschNamn(lang, r.bransch)}
                    </Link>
                  </td>
                  <td className="py-1.5 pr-4 font-semibold text-foreground">
                    {datasetTal(r.medianPe, lang)}
                  </td>
                  <td className="py-1.5 pr-4 text-muted-foreground">
                    {r.nPe < r.antalBolag ? `${r.nPe}/${r.antalBolag}` : r.antalBolag}
                  </td>
                  <td className="py-1.5">
                    <Link
                      href={prefix + "/dataset/" + r.bransch}
                      className="text-muted-foreground underline decoration-gold/40 underline-offset-4 hover:text-foreground"
                    >
                      {t("dataset.tabell.detaljer")}
                    </Link>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gold/30 font-semibold text-foreground">
                <td className="py-1.5 pr-4">{t("dataset.tabell.totalt")}</td>
                <td className="py-1.5 pr-4">{datasetTal(medianer.totalt.medianPe, lang)}</td>
                <td className="py-1.5 pr-4 text-muted-foreground">
                  {medianer.totalt.nMedPe < medianer.totalt.nBolag
                    ? `${medianer.totalt.nMedPe}/${medianer.totalt.nBolag}`
                    : medianer.totalt.nBolag}
                </td>
                <td className="py-1.5" />
              </tr>
            </tbody>
          </table>
        </div>

        <KallaOchLicens lang={lang} kallor={medianer.kallorRadata} />
      </section>

      <MetodOchDisclaimer lang={lang} />
    </SeoPageShell>
  );
}

// ── Detalj-vyn (/dataset/[bransch]) ─────────────────────────────────────────

export function DatasetBranschVy({
  lang,
  medianer,
  rad,
}: {
  lang: SprakId;
  medianer: BranschMedianer;
  rad: DatasetMedianRad;
}) {
  const t = skapaT(lang);
  const prefix = datasetPrefix(lang);
  const namn = branschNamn(lang, rad.bransch);

  /** Raden i detaljtabellen: nyckeltal · beskrivning · median (med enhet) · n. */
  const rader: Array<{
    namn: OrdlistaNyckel;
    beskrivning: OrdlistaNyckel;
    varde: number | null;
    n: number;
    procent: boolean;
  }> = [
    { namn: "dataset.mat.pe", beskrivning: "dataset.mat.pe.beskrivning", varde: rad.medianPe, n: rad.nPe, procent: false },
    { namn: "dataset.mat.pb", beskrivning: "dataset.mat.pb.beskrivning", varde: rad.medianPb, n: rad.nPb, procent: false },
    { namn: "dataset.mat.ebit", beskrivning: "dataset.mat.ebit.beskrivning", varde: rad.medianEbitMarginal, n: rad.nEbitMarginal, procent: true },
    { namn: "dataset.mat.fcf", beskrivning: "dataset.mat.fcf.beskrivning", varde: rad.medianFcfMarginal, n: rad.nFcfMarginal, procent: true },
    { namn: "dataset.mat.tillvaxt", beskrivning: "dataset.mat.tillvaxt.beskrivning", varde: rad.medianTillvaxt, n: rad.nTillvaxt, procent: true },
  ];

  return (
    <SeoPageShell
      breadcrumb={[{ name: t("dataset.brodsmula"), href: prefix + "/dataset" }, { name: namn }]}
    >
      <JsonLd data={datasetBranschJsonLd(lang, rad, medianer)} />

      <h1 className="font-serif text-4xl font-bold">
        {t("dataset.detalj.titel", { bransch: namn })}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("dataset.datering", { hamtat: medianer.hamtat ?? "—" })}
      </p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        {t("dataset.detalj.ingress", {
          bransch: namn,
          nBolag: medianer.totalt.nBolag,
          hamtat: medianer.hamtat ?? "—",
          nBransch: rad.antalBolag,
        })}
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          {t("dataset.detalj.tabell.rubrik", { bransch: namn })}
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-foreground">
                <th className="py-1.5 pr-4 font-semibold">{t("dataset.detalj.tabell.nyckeltal")}</th>
                <th className="py-1.5 pr-4 font-semibold">{t("dataset.detalj.tabell.median")}</th>
                <th className="py-1.5 font-semibold">{t("dataset.detalj.tabell.antal")}</th>
              </tr>
            </thead>
            <tbody>
              {rader.map((r) => (
                <tr key={r.namn} className="border-t border-gold/10 align-top">
                  <td className="py-2 pr-4">
                    <span className="block font-semibold text-foreground">{t(r.namn)}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {t(r.beskrivning)}
                    </span>
                  </td>
                  <td className="py-2 pr-4 font-semibold text-foreground">
                    {r.procent ? datasetProcent(r.varde, lang) : datasetTal(r.varde, lang)}
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {r.n < rad.antalBolag ? `${r.n}/${rad.antalBolag}` : r.n}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <KallaOchLicens lang={lang} kallor={medianer.kallorRadata} />
      </section>

      <MetodOchDisclaimer lang={lang} />

      <div className="mt-8 flex flex-col gap-2">
        <Link
          href={prefix + "/dataset"}
          className="text-muted-foreground underline decoration-gold/40 underline-offset-4 hover:text-foreground"
        >
          {t("dataset.detalj.tillbaka")}
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="font-serif text-2xl font-bold">{t("dataset.detalj.andra.rubrik")}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {medianer.rader
            .filter((r) => r.bransch !== rad.bransch)
            .map((r) => (
              <li key={r.bransch}>
                <Link
                  href={prefix + "/dataset/" + r.bransch}
                  className="inline-block rounded-full border border-gold/30 px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {branschNamn(lang, r.bransch)}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </SeoPageShell>
  );
}
