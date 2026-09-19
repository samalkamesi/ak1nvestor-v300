import Link from "next/link";
import { Suspense } from "react";

import { getCourses } from "@/lib/content";
import { type OrdlistaNyckel } from "@/lib/ordlista";
import { SITE_URL } from "@/lib/seo";
import { skapaT, type SprakId } from "@/lib/sprak";
import { branschNamn as branschNamnFranLib, type BranschMedianer, type DatasetMedianRad } from "@/lib/dataset-medianer";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { DatasetSorteradLista } from "@/components/ak1a/dataset-sortering";
import { StrukturData } from "@/components/seo/StrukturData";

/**
 * DATASET-SIDORNA — delade serverkomponenter för /dataset, /dataset/[bransch]
 * och deras /en- + /ar-speglar (VÅG 97 E1, DATASET-CITERINGSMAGNETER ·
 * VÅG 98 F2, DATASET-DJUP: kvartilspridning + universumjämförelse + guide-
 * länkning + index-sortering).
 *
 * ALL text kommer ur ordlistans "dataset"-domän (svenska först — kalla.ts
 * lasUiKallor registrerar varje nyckel som MÖS-källa automatiskt), läst med
 * skapaT(lang) och sv-fallback. Sex tunna sidfiler återanvänder dessa vyer:
 * ingen text dupliceras mellan språkversionerna.
 *
 * KONTRAKT (A2-DATASET-KONTRAKT §1): vyerna renderar ENBAST branschmedianer
 * + kvartiler + universummedianer med n — dataobjektet (BranschMedianer) kan
 * per konstruktion inte bära bolagsnamn eller poäng. Talen formateras per
 * språk (sv decimalkomma).
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

/** Detaljsidans Dataset-schema — branschens fem medianer + P/E-spridning i description. */
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
        p25pe: datasetTal(rad.p25Pe, lang),
        p75pe: datasetTal(rad.p75Pe, lang),
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

// ── Spridningsstapel (VÅG 98 F2): P25 — median — P75 ─────────────────────────

/**
 * Kompakt visuell spridningsrad: en stapel där fältintervallet P25→P75 är
 * guldfyllt och medianen är ett streck. Skalan (lo/hi) är samma för hela
 * kolumnen — räknad i vyn ur ALLA branschers kvartiler för nyckeltalet, så
 * staplarna är jämförbara nedåt i tabellen. dir="ltr" håller stapeln läsbar
 * även på ar-spegeln (tal är LTR oavsett textriktning). Server-renderad ren
 * CSS — inga bilder, inget klient-JS.
 */
function SpridningsBar({
  p25,
  median,
  p75,
  lo,
  hi,
  lang,
}: {
  p25: number | null;
  median: number | null;
  p75: number | null;
  lo: number;
  hi: number;
  lang: SprakId;
}) {
  const t = skapaT(lang);
  if (p25 === null || p75 === null) return null;
  const span = hi - lo;
  const pos = (v: number) =>
    span <= 0 ? 50 : Math.max(0, Math.min(100, ((v - lo) / span) * 100));
  const vanster = pos(p25);
  const bredd = Math.max(pos(p75) - vanster, span > 0 ? 1.5 : 100);
  const medianPos = median === null ? null : pos(median);
  return (
    <span className="mt-1.5 block max-w-[220px]">
      <span
        dir="ltr"
        className="relative block h-1.5 rounded bg-foreground/10"
        aria-hidden
      >
        <span
          className="absolute top-0 h-1.5 rounded bg-gold/60"
          style={{ left: vanster + "%", width: bredd + "%" }}
        />
        {medianPos !== null && (
          <span
            className="absolute -top-[3px] h-3 w-0.5 rounded bg-gold"
            style={{ left: "calc(" + medianPos + "% - 1px)" }}
          />
        )}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">
        {t("dataset.spridning.p25p75", {
          p25: datasetTal(p25, lang),
          p75: datasetTal(p75, lang),
        })}
      </span>
      <span className="sr-only">
        {t("dataset.spridning.sronly", {
          p25: datasetTal(p25, lang),
          median: datasetTal(median, lang),
          p75: datasetTal(p75, lang),
        })}
      </span>
    </span>
  );
}

/** Skala per nyckeltal: minsta P25 → största P75 över ALLA branscher. */
function spridningsSkala(varden: Array<{ p25: number | null; p75: number | null }>): {
  lo: number;
  hi: number;
} {
  const tal = varden.flatMap((v) => [v.p25, v.p75]).filter((v): v is number => v !== null);
  if (tal.length === 0) return { lo: 0, hi: 1 };
  return { lo: Math.min(...tal), hi: Math.max(...tal) };
}

// ── Guide-länkning (VÅG 98 F2): Lär dig mer — 2–3 kurser per bransch ─────────

/**
 * Statiskt urval per bransch (uppdragets tillåtelse): en sektorskurs ur
 * SEKTORANALYS-kategorin + två metodkurser kopplade till nyckeltalen som
 * bärs av just branschen (fastighet ⇒ P/B, finans ⇒ ROE/skuld, tillväxt ⇒
 * tillväxtvariabeln …). Slugs verifierade mot public/deep-courses.json;
 * saknad kurs filtreras tyst och urvalet faller tillbaka på evighetskurserna.
 * Samma mönster som bloggens "Fortsätt i kurserna": deskriptiv ankartext
 * (titel — kategori) + metadata-rad, aldrig "läs mer".
 */
const KURSURVAL: Record<string, string[]> = {
  teknik: ["km-038-techsektorn", "km-009-pe", "v15-natverkseffekter"],
  industri: ["km-041-industrisektorn", "km-010-evebit", "v07-bruttomarginal"],
  halso: ["km-048-halsovardsektorn", "km-039-pharmasektorn", "km-030-margin-of-safety"],
  konsument: ["km-044-konsumentsektorn", "v14-varumarke", "km-009-pe"],
  fastighet: ["km-042-fastighetsektorn", "v05-pb", "km-030-margin-of-safety"],
  finans: ["km-040-banksektorn", "v09-roe", "v10-skuldsattningsgrad"],
  material: ["km-045-materialsektorn", "v07-bruttomarginal", "km-030-margin-of-safety"],
  energi: ["km-043-energisektorn", "v08-ebitda-marginal", "km-030-margin-of-safety"],
  kommunikation: ["km-046-telekomsektorn", "v15-natverkseffekter", "km-010-evebit"],
  tillvaxt: ["v01-forsaljningstillvaxt", "km-009-pe", "km-030-margin-of-safety"],
};

/** Fallback när branschen saknar urval eller alla kurser försvunnit ur JSON:et. */
const KURSURVAL_FALLBACK = ["km-009-pe", "km-030-margin-of-safety"];

function kurserForBransch(bransch: string) {
  const alla = getCourses();
  const slugs = KURSURVAL[bransch] ?? KURSURVAL_FALLBACK;
  const hittade = slugs
    .map((s) => alla[s])
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  return hittade.length > 0 ? hittade : KURSURVAL_FALLBACK.map((s) => alla[s]).filter((c) => c);
}

/** "Lär dig mer"-sektionen — kurslänkar med bloggens deskriptiva mönster. */
function LarDigMer({ lang, bransch }: { lang: SprakId; bransch: string }) {
  const t = skapaT(lang);
  const prefix = datasetPrefix(lang);
  const kurser = kurserForBransch(bransch);
  if (kurser.length === 0) return null;
  return (
    <section className="mt-8 rounded-lg border border-gold/30 bg-card p-4">
      <h2 className="font-serif text-2xl font-bold">{t("dataset.kurser.rubrik")}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {t("dataset.kurser.ingress")}
      </p>
      <ul className="mt-3 space-y-2.5">
        {kurser.map((c) => (
          <li key={c.slug}>
            <Link href={prefix + "/kurser/" + c.slug} className="group block text-sm">
              <span className="font-semibold text-foreground group-hover:text-gold">
                {c.title} — {c.category}
              </span>
              <span className="block text-muted-foreground">
                {t("dataset.kurser.meta", {
                  antal: c.chapterCount,
                  minuter: c.totalMinutes || c.minutes,
                  niva: c.level.toLowerCase(),
                })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
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

  // Sorterbar lista (VÅG 98 F2): ?sortera=bransch|pe-hogst|pe-lagst. Datan
  // serialiseras hit som planta rader — klientkomponenten sorterar den
  // inbäddade datan, inga nya anrop. Suspense-gränsen krävs av Next för
  // useSearchParams i statiskt förrenderade sidor; innehållet renderas
  // ändå server-side (A–Ö-fallet) så fallback:en visas aldrig i praktiken.
  const sorterbara = medianer.rader.map((r) => ({
    slug: r.bransch,
    namn: branschNamn(lang, r.bransch),
    pe: r.medianPe,
    peText: datasetTal(r.medianPe, lang),
    nText: r.nPe < r.antalBolag ? `${r.nPe}/${r.antalBolag}` : String(r.antalBolag),
  }));
  const etiketter = {
    rubrik: t("dataset.sortera.rubrik"),
    sorteraBransch: t("dataset.sortera.bransch"),
    sorteraPeHogst: t("dataset.sortera.peHogst"),
    sorteraPeLagst: t("dataset.sortera.peLagst"),
    kolumnBransch: t("dataset.tabell.bransch"),
    kolumnMedianPe: t("dataset.tabell.medianPe"),
    kolumnAntal: t("dataset.tabell.antal"),
    kolumnDetaljer: t("dataset.tabell.detaljer"),
    detaljer: t("dataset.tabell.detaljer"),
  };

  return (
    <SeoPageShell breadcrumb={[{ name: t("dataset.brodsmula") }]} wide>
      <StrukturData data={datasetJsonLd(lang, medianer)} id="jsonld-dataset" />

      {/* Brandgenomgång P2 (våg 195): H1 som löfte i stället för filnamn,
          underrubriken bär omfånget + juridikgrunden. */}
      <h1 className="font-serif text-4xl font-bold">{t("dataset.h1")}</h1>
      <p className="mt-2 text-muted-foreground">
        {t("dataset.underrubrik", { nBolag: medianer.totalt.nBolag })}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("dataset.datering", { hamtat: medianer.hamtat ?? "—" })}
      </p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        {t("dataset.ingress", { nBolag: medianer.totalt.nBolag })}
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">{t("dataset.tabell.rubrik")}</h2>

        <Suspense fallback={null}>
          <DatasetSorteradLista rader={sorterbara} etiketter={etiketter} prefix={prefix} />
        </Suspense>

        <p className="mt-2 text-xs text-muted-foreground">{t("dataset.sortera.notis")}</p>

        {/* Totalraden står utanför sorteringen — universummedianen är
            referensen, inte en rad bland branscherna. */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody>
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

      {/* Brandgenomgångens CTA-gap (våg 201): dataset-ytan lämnade besökaren
          utan nästa steg — primär kursväg med samma guldknapp som social
          proof. Server-renderad på statisk sida (inget hydrerings-pop-in);
          prefetch={false} enligt o17-precedensen (tunga kursrutter hämtas
          vid klick, inte i initial last). */}
      <section className="mt-10 rounded-lg border border-gold/20 bg-card p-6 text-center">
        <h2 className="font-serif text-2xl font-bold">{t("dataset.cta.rubrik")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {t("dataset.cta.text")}
        </p>
        <Link
          href={prefix + "/kurser"}
          prefetch={false}
          className="btn-guld-signatur mt-5 inline-flex min-h-[44px] items-center gap-2 px-7 py-3 text-sm max-md:min-h-[52px]"
        >
          {t("dataset.cta.knapp")}
        </Link>
      </section>

      <MetodOchDisclaimer lang={lang} />
    </SeoPageShell>
  );
}

// ── Detalj-vyn (/dataset/[bransch]) ─────────────────────────────────────────

/**
 * Δ-cellens innehåll: relativ avvikelse i procent mot universumets median,
 * ↑/↓/≈. >999 %-tak när universummedianen ligger nära noll (ärligt tal,
 * aldrig en vägg av siffror). Returnerar en färdig nyckel + parametrar —
 * allt textligt lever i ordlistan.
 */
function deltaCell(
  bransch: number | null,
  universum: number | null,
  lang: SprakId,
): string {
  const t = skapaT(lang);
  if (bransch === null || universum === null) return "—";
  if (universum === 0) return "—";
  const d = ((bransch - universum) / Math.abs(universum)) * 100;
  if (Math.abs(d) < 0.05) return t("dataset.jamforelse.niva");
  const kapat = Math.abs(d) > 999;
  const tal = datasetTal(Math.round(Math.abs(d) * 10) / 10, lang);
  return d > 0
    ? t("dataset.jamforelse.hogre", { delta: kapat ? ">999" : tal })
    : t("dataset.jamforelse.lagre", { delta: kapat ? ">999" : tal });
}

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

  /** Raden i detaljtabellen: nyckeltal · beskrivning · median + spridning · n. */
  const rader: Array<{
    namn: OrdlistaNyckel;
    beskrivning: OrdlistaNyckel;
    varde: number | null;
    p25: number | null;
    p75: number | null;
    n: number;
    procent: boolean;
  }> = [
    { namn: "dataset.mat.pe", beskrivning: "dataset.mat.pe.beskrivning", varde: rad.medianPe, p25: rad.p25Pe, p75: rad.p75Pe, n: rad.nPe, procent: false },
    { namn: "dataset.mat.pb", beskrivning: "dataset.mat.pb.beskrivning", varde: rad.medianPb, p25: rad.p25Pb, p75: rad.p75Pb, n: rad.nPb, procent: false },
    { namn: "dataset.mat.ebit", beskrivning: "dataset.mat.ebit.beskrivning", varde: rad.medianEbitMarginal, p25: rad.p25EbitMarginal, p75: rad.p75EbitMarginal, n: rad.nEbitMarginal, procent: true },
    { namn: "dataset.mat.fcf", beskrivning: "dataset.mat.fcf.beskrivning", varde: rad.medianFcfMarginal, p25: rad.p25FcfMarginal, p75: rad.p75FcfMarginal, n: rad.nFcfMarginal, procent: true },
    { namn: "dataset.mat.tillvaxt", beskrivning: "dataset.mat.tillvaxt.beskrivning", varde: rad.medianTillvaxt, p25: rad.p25Tillvaxt, p75: rad.p75Tillvaxt, n: rad.nTillvaxt, procent: true },
  ];

  // En gemensam stapelskala per nyckeltal — min P25 till max P75 över alla
  // branscher — så spridningsraderna är jämförbara nedåt i kolumnen.
  const skalor = {
    pe: spridningsSkala(medianer.rader.map((r) => ({ p25: r.p25Pe, p75: r.p75Pe }))),
    pb: spridningsSkala(medianer.rader.map((r) => ({ p25: r.p25Pb, p75: r.p75Pb }))),
    ebit: spridningsSkala(medianer.rader.map((r) => ({ p25: r.p25EbitMarginal, p75: r.p75EbitMarginal }))),
    fcf: spridningsSkala(medianer.rader.map((r) => ({ p25: r.p25FcfMarginal, p75: r.p75FcfMarginal }))),
    tillvaxt: spridningsSkala(medianer.rader.map((r) => ({ p25: r.p25Tillvaxt, p75: r.p75Tillvaxt }))),
  };
  const skalaFor = (nyckel: OrdlistaNyckel) =>
    nyckel === "dataset.mat.pe"
      ? skalor.pe
      : nyckel === "dataset.mat.pb"
        ? skalor.pb
        : nyckel === "dataset.mat.ebit"
          ? skalor.ebit
          : nyckel === "dataset.mat.fcf"
            ? skalor.fcf
            : skalor.tillvaxt;

  /** Universumjämförelseraderna — branschmedian mot universummedian (F2). */
  const jamforRader: Array<{
    namn: OrdlistaNyckel;
    bransch: number | null;
    universum: number | null;
    procent: boolean;
  }> = [
    { namn: "dataset.mat.pe", bransch: rad.medianPe, universum: medianer.totalt.medianPe, procent: false },
    { namn: "dataset.mat.pb", bransch: rad.medianPb, universum: medianer.totalt.medianPb, procent: false },
    { namn: "dataset.mat.ebit", bransch: rad.medianEbitMarginal, universum: medianer.totalt.medianEbitMarginal, procent: true },
    { namn: "dataset.mat.fcf", bransch: rad.medianFcfMarginal, universum: medianer.totalt.medianFcfMarginal, procent: true },
    { namn: "dataset.mat.tillvaxt", bransch: rad.medianTillvaxt, universum: medianer.totalt.medianTillvaxt, procent: true },
  ];

  return (
    <SeoPageShell
      breadcrumb={[{ name: t("dataset.brodsmula"), href: prefix + "/dataset" }, { name: namn }]}
    >
      <StrukturData data={datasetBranschJsonLd(lang, rad, medianer)} id="jsonld-dataset-bransch" />

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
                <th className="py-1.5 pr-4 font-semibold">
                  {t("dataset.detalj.tabell.median")} · {t("dataset.spridning.rubrik").toLowerCase()}
                </th>
                <th className="py-1.5 font-semibold">{t("dataset.detalj.tabell.antal")}</th>
              </tr>
            </thead>
            <tbody>
              {rader.map((r) => {
                const skala = skalaFor(r.namn);
                return (
                  <tr key={r.namn} className="border-t border-gold/10 align-top">
                    <td className="py-2 pr-4">
                      <span className="block font-semibold text-foreground">{t(r.namn)}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {t(r.beskrivning)}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="block font-semibold text-foreground">
                        {r.procent ? datasetProcent(r.varde, lang) : datasetTal(r.varde, lang)}
                      </span>
                      <SpridningsBar
                        p25={r.p25}
                        median={r.varde}
                        p75={r.p75}
                        lo={skala.lo}
                        hi={skala.hi}
                        lang={lang}
                      />
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {r.n < rad.antalBolag ? `${r.n}/${rad.antalBolag}` : r.n}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* "Så läser du spridningen"-raden — en förklarande rad under tabellen. */}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {t("dataset.spridning.salarader")}
        </p>

        <KallaOchLicens lang={lang} kallor={medianer.kallorRadata} />
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          {t("dataset.jamforelse.rubrik", { bransch: namn })}
        </h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {t("dataset.jamforelse.ingress", { nBolag: medianer.totalt.nBolag })}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-foreground">
                <th className="py-1.5 pr-4 font-semibold">{t("dataset.detalj.tabell.nyckeltal")}</th>
                <th className="py-1.5 pr-4 font-semibold">{t("dataset.jamforelse.branschmedian")}</th>
                <th className="py-1.5 pr-4 font-semibold">{t("dataset.jamforelse.universummedian")}</th>
                <th className="py-1.5 font-semibold">{t("dataset.jamforelse.kolumn")}</th>
              </tr>
            </thead>
            <tbody>
              {jamforRader.map((r) => (
                <tr key={r.namn} className="border-t border-gold/10">
                  <td className="py-2 pr-4 font-semibold text-foreground">{t(r.namn)}</td>
                  <td className="py-2 pr-4 text-foreground">
                    {r.procent ? datasetProcent(r.bransch, lang) : datasetTal(r.bransch, lang)}
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {r.procent ? datasetProcent(r.universum, lang) : datasetTal(r.universum, lang)}
                  </td>
                  <td className="py-2 text-foreground">{deltaCell(r.bransch, r.universum, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <LarDigMer lang={lang} bransch={rad.bransch} />

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
