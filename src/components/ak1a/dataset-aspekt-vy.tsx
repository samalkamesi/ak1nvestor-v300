import Link from "next/link";

import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { branschNamn, datasetProcent, datasetTal } from "@/components/ak1a/dataset-sidor";
import { StrukturData } from "@/components/seo/StrukturData";
import { SITE_URL } from "@/lib/seo";
import type { AspektSida } from "@/lib/dataset-aspekter-kontrakt";

/**
 * DATASET-ASPEKTVYN — serverkomponent för /dataset/[bransch]/[aspekt]
 * (VÅG 150 fas A slutled). ALL löptext, ALLA tal och ALLA internlänkar
 * bärs av modulernas AspektSida (kontraktet) — vyn formaterar och trycker
 * de delar som enligt kontraktet ALDRIG får finnas i datat:
 *
 *  - DISCLAIMERN: "Pedagogisk analys — inte investeringsråd." trycks av
 *    VYN på varje sida (KVD §7 punkt 4; kontraktet: "den finns inte i
 *    datatypen — om vyn glömmer den finns den ingenstans").
 *  - /forskningsbiblioteket-länken i sidfoten (S7 §7 punkt 5).
 *
 * Vyn renderar ALDRIG något som inte finns i AspektSida — gränsvakten
 * mot bolagsnamn/poäng är strukturell hela vägen ut i JSX:en.
 */

/** Huvudmåttets korta namn = titeln före tankstrecket ("ROE inom Teknik"). */
function kortNamn(titel: string): string {
  return titel.split(" — ")[0] ?? titel;
}

/** JSON-LD: schema.org Dataset — samma mönster som branschdetaljerna (våg 97). */
function aspektJsonLd(sida: AspektSida, hamtat: string | null): object {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: sida.titel,
    description: sida.beskrivning,
    url: `${SITE_URL}/dataset/${sida.bransch}/${sida.aspekt}`,
    isPartOf: `${SITE_URL}/dataset/${sida.bransch}`,
    creator: { "@type": "Organization", name: "AK1A Research Lab", url: SITE_URL },
    variableMeasured: sida.matTabell?.map((r) => r.etikett) ?? [kortNamn(sida.titel)],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    inLanguage: "sv-SE",
    dateModified: hamtat ?? undefined,
  };
}

export function AspektVy({
  sida,
  hamtat,
  syskon,
}: {
  sida: AspektSida;
  hamtat: string | null;
  /** Branschens andra publicerade aspekter (registret) — internlänkning. */
  syskon: { slug: string; titel: string }[];
}) {
  const namn = branschNamn("sv", sida.bransch);
  const fmt = (v: number | null) =>
    sida.enhet === "procent" ? datasetProcent(v, "sv") : datasetTal(v, "sv");
  const fmtTabell = (v: number | null, enhet: "procent" | "multipl") =>
    enhet === "procent" ? datasetProcent(v, "sv") : datasetTal(v, "sv");

  return (
    <SeoPageShell
      breadcrumb={[
        { name: "Dataset", href: "/dataset" },
        { name: namn, href: `/dataset/${sida.bransch}` },
        { name: kortNamn(sida.titel) },
      ]}
    >
      <StrukturData data={aspektJsonLd(sida, hamtat)} id={`jsonld-aspekt-${sida.bransch}-${sida.aspekt}`} />

      <h1 className="font-serif text-4xl font-bold">{sida.titel}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tal ur 100-bolagsuniversumet · data hämtad {hamtat ?? "—"} · pedagogisk statistik
      </p>
      <p className="mt-6 leading-relaxed text-muted-foreground">{sida.ingress}</p>

      {/* Statistikblocket: median, kvartiler, spridning — med n-redovisning. */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          {kortNamn(sida.titel)} — median och spridning
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-foreground">
                <th className="py-1.5 pr-4 font-semibold">Median</th>
                <th className="py-1.5 pr-4 font-semibold">Kvartiler (P25–P75)</th>
                <th className="py-1.5 pr-4 font-semibold">Hela spridningen</th>
                <th className="py-1.5 font-semibold">Underlag</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gold/10">
                <td className="py-2 pr-4 font-semibold text-foreground">{fmt(sida.median)}</td>
                <td className="py-2 pr-4 text-foreground">
                  {fmt(sida.p25)} – {fmt(sida.p75)}
                </td>
                <td className="py-2 pr-4 text-foreground">
                  {fmt(sida.min)} – {fmt(sida.max)}
                </td>
                <td className="py-2 text-muted-foreground">n = {sida.matta} bolag</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          n = antal bolag med ändligt mätt värde i källmaterialet — saknad data räknas
          aldrig som noll, och under 5 mätta publiceras ingen sida alls.
        </p>
      </section>

      {/* Flermätastabellen (hub-sidor: land + värdering). */}
      {Array.isArray(sida.matTabell) && sida.matTabell.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold">Fler mått för samma grupp</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-foreground">
                  <th className="py-1.5 pr-4 font-semibold">Mått</th>
                  <th className="py-1.5 pr-4 font-semibold">Median</th>
                  <th className="py-1.5 font-semibold">Underlag</th>
                </tr>
              </thead>
              <tbody>
                {sida.matTabell.map((r) => (
                  <tr key={r.etikett} className="border-t border-gold/10">
                    <td className="py-2 pr-4 font-semibold text-foreground">{r.etikett}</td>
                    <td className="py-2 pr-4 text-foreground">{fmtTabell(r.median, r.enhet)}</td>
                    <td className="py-2 text-muted-foreground">
                      {r.median === null ? `n = ${r.matta} — osatt` : `n = ${r.matta}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">Så räknas talet</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed text-muted-foreground">
          {sida.saRaknas.map((steg, i) => (
            <li key={i}>{steg}</li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">Så läser du det</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed text-muted-foreground">
          {sida.saLaserDu.map((punkt, i) => (
            <li key={i}>{punkt}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">Fällor att undvika</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed text-muted-foreground">
          {sida.fellerAttUndvika.map((fella, i) => (
            <li key={i}>{fella}</li>
          ))}
        </ul>
      </section>

      {/* Internlänkning (tema 8): modulernas kurslänkar — frågetexten är
          länktext (kontraktet: "den pedagogiska frågan är länktext"). */}
      <section className="mt-8 rounded-lg border border-gold/30 bg-card p-4">
        <h2 className="font-serif text-2xl font-bold">Fortsätt i kurserna</h2>
        <ul className="mt-3 space-y-2.5">
          {sida.kurslankar.map((l) => (
            <li key={l.url}>
              <Link
                href={l.url}
                className="group block text-sm font-semibold text-foreground hover:text-gold"
              >
                {l.titel}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* DISCLAIMERN — trycks av VYN på varje aspektsida (KVD §7 punkt 4):
          finns den inte här finns den INGENSTANS (kontraktet bär den ej). */}
      <section className="mt-8 rounded-lg border border-gold/30 bg-card p-4">
        <h2 className="font-serif text-2xl font-bold">
          Pedagogisk analys — inte investeringsråd.
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Den här sidan visar hur metoden fungerar: medianer, spridning och jämförelsefällor
          ur ett redovisat urval av bolag. Ingenting här är en rekommendation att köpa eller
          sälja någon aktie — talen är utbildningsunderlag, inte råd.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-2">
        <Link
          href={`/dataset/${sida.bransch}`}
          className="text-muted-foreground underline decoration-gold/40 underline-offset-4 hover:text-foreground"
        >
          Alla nyckeltal inom {namn}
        </Link>
        <Link
          href="/forskningsbiblioteket"
          className="text-muted-foreground underline decoration-gold/40 underline-offset-4 hover:text-foreground"
        >
          Forskningsbiblioteket — metod och bolagsöversikter
        </Link>
      </div>

      {/* Branschens andra aspekter — internlänkning mellan långsvanssidorna. */}
      {syskon.length > 0 && (
        <section className="mt-6">
          <h2 className="font-serif text-2xl font-bold">Andra mått inom {namn}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {syskon.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/dataset/${sida.bransch}/${s.slug}`}
                  className="inline-block rounded-full border border-gold/30 px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {s.titel}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </SeoPageShell>
  );
}
