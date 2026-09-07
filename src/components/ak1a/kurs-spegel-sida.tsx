import Link from "next/link";
import type { Metadata } from "next";
import { getCourse, getCourses, type CourseChapter } from "@/lib/content";
import { skapaT } from "@/lib/sprak";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import {
  KursSpegel,
  KursSpegelSprak,
  kursSpegelJsonLd,
  kursSpegelMetadata,
  byggKursSpegel,
  hamtaKursLager,
} from "@/lib/kurs-speglar";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { KursGate, NivaBar } from "@/components/ak1a/kurs-gate";
import { Fas2Gate } from "@/components/ak1a/fas2-gate";
import { KursArtiklar, type SmakprovKapitel } from "@/components/ak1a/kurs-artiklar";
import { LasProgress } from "@/components/ak1a/kurs-visuellt";
import { KursSteg } from "@/components/ak1a/kurs-steg";
import { Kallkort } from "@/components/ak1a/kallkort";
import { kraverFas } from "@/lib/kurs-access";

/**
 * KURSSPEGEL-SIDA (våg 52, agent B) — gemensam server-renderare för de
 * dynamiska kursspegel-rutterna /en/kurser/[slug] och /ar/kurser/[slug].
 *
 * Spegla EXAKT strukturen hos svenska /kurser/[slug] (samma data ur
 * public/deep-courses.json via getCourse) men med alla text-block, titlar,
 * intros och quiz-frågor ur översättningslagret (src/lib/kurs-speglar.ts):
 * publicerad översättning → svensk originaltext. Block-nivå markeras EJ;
 * i stället EN notis överst med andel klart (räknad ur lagret).
 *
 * UI-runorna (Kapitel X av, min läsning, Nästa, Kursöversikt …) kommer ur
 * ordlistan via t() = skapaT(lang) — samma nycklar som KursSteg använder
 * på klienten. Sidunika rubriker (Varför-sektionen, övningar, perspektiv)
 * levereras av språk-packet (KursSpegelTexter) i respektive sidfil.
 *
 * RTL: hela innehållscontainern får dir="rtl" för arabiska (samma mönster
 * som våg 51:s /ar-spegelsidor; meny-chromet är klientsidigt och sköter
 * sig självt via SprakLeverantor).
 */

/** Sidunika texter per språk — proffsig översättning, inte maskinord. */
export type KursSpegelTexter = {
  notisTitel: (procent: number) => string;
  notisText: string;
  whyRubrik: string;
  perspektivRubrik: string;
  perspektivAk1: string;
  nyckelinsikt: string;
  ovningarRubrik: string;
  ovningarIntro: string;
  ovningLabel: string;
  ledningLabel: string;
  ovning1: (titel: string, vikt: string) => string;
  ovning2Nummer: (titel: string) => string;
  ovning2NummerFacit: string;
  ovning2Tillampning: (titel: string) => string;
  ovning2TillampningFacit: (kapitelNum: number, kapitelTitel: string) => string;
  ovning3: (titel: string) => string;
  ovning3Facit: string;
  fortsattRubrik: string;
  fortsattText: string;
  oppnaLab: string;
  seMedlemskap: string;
  relaterade: (kategori: string) => string;
};

export function KursSpegelSida({
  lang,
  spegel,
  texter,
}: {
  lang: KursSpegelSprak;
  spegel: KursSpegel;
  texter: KursSpegelTexter;
}) {
  const t = skapaT(lang);
  const kurs = spegel.kurs;
  const slug = kurs.slug;
  const totaltMin = kurs.totalMinutes || kurs.minutes;

  const siblings = Object.values(getCourses())
    .filter((c) => c.category === kurs.category && c.slug !== kurs.slug)
    .slice(0, 6);

  const harQuiz = (kurs.chapters as unknown as Array<{ quiz?: unknown }>).some((ch) => ch.quiz);

  // ── VÅG 78 B1: SSR-säker Fas-gate (samma som svenska /kurser/[slug]) ──
  const fas = kraverFas(slug);
  // ── VÅG 78 B4a: verkligt intjänbar XP (quiz×10 + 50 klar-bonus) ──
  const intjanbarXp =
    kurs.chapters.reduce(
      (s, ch) => s + ((ch as unknown as { quiz?: unknown[] }).quiz?.length ?? 0),
      0
    ) * 10 + 50;
  const smakprov: SmakprovKapitel[] = kurs.chapters.slice(0, 2).map((ch) => ({
    num: ch.num,
    title: ch.title,
    intro: ch.intro,
    minutes: ch.minutes,
    blocks: (ch.blocks || []).map((b) => ({ type: String(b.type), content: String(b.content) })),
    quiz: (ch as unknown as { quiz?: SmakprovKapitel["quiz"] }).quiz,
  }));
  const forsattning = kurs.chapters.map((ch) => ({ num: ch.num, title: ch.title }));
  // Kursöversiktens intro-snuttar: kap 1–2 syns alltid; fas-kurser visar ingen
  // prosa från kapitel 3+ i statiskt HTML (titlar/tider = kurskorts-metadata).
  const introSnutt = (ch: CourseChapter, langd: number): string | null => {
    if (!ch.intro) return null;
    if (fas > 0 && ch.num > 2) return null;
    return ch.intro.slice(0, langd);
  };

  const ovningar = (() => {
    const num = ["v04", "v05", "v06", "v07", "v08", "v09", "v10", "v19"].includes(slug.slice(0, 3));
    const vikt = kurs.weight || "6%";
    return [
      { q: texter.ovning1(kurs.title, vikt), a: kurs.learn || "" },
      num
        ? { q: texter.ovning2Nummer(kurs.title), a: texter.ovning2NummerFacit }
        : {
            q: texter.ovning2Tillampning(kurs.title),
            a: texter.ovning2TillampningFacit(
              kurs.chapters?.[2]?.num ?? 3,
              kurs.chapters?.[2]?.title ?? kurs.title
            ),
          },
      { q: texter.ovning3(kurs.title), a: texter.ovning3Facit },
    ];
  })();

  return (
    <SeoPageShell
      wide
      breadcrumb={[{ name: t("nav.kurser"), href: `/${lang}/kurser` }, { name: kurs.title }]}
    >
      <div lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
        <JsonLd data={kursSpegelJsonLd(spegel, lang)} />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: t("nav.kurser"), path: `/${lang}/kurser` },
            { name: kurs.title, path: `/${lang}/kurser/${slug}` },
          ])}
        />
        <LasProgress />

        {/* Översättnings-notis — EN per sida (block markeras ej): andel klart
            räknad ur översättningslagret. Döljs först när ALLT är publicerat. */}
        {!spegel.komplett && (
          <div
            role="note"
            className="mb-6 rounded-xl border border-gold/40 bg-gold/[0.06] p-4"
          >
            <p className="text-sm font-semibold text-foreground">
              🌐 {texter.notisTitel(spegel.procent)}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gold/15">
              <div className="h-full rounded-full bg-gold" style={{ width: `${spegel.procent}%` }} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{texter.notisText}</p>
          </div>
        )}

        <header className="border-b border-gold/30 pb-6">
          <p className="text-xs uppercase tracking-widest text-gold">
            AKM1 · {kurs.category}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold">{kurs.title}</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">{kurs.learn}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              `📖 ${kurs.chapters.length} ${t("kurs.kapitelEnhet")}`,
              `⏱ ${totaltMin} min`,
              `⚡ ${intjanbarXp} XP`,
              `⚖ ${t("kurs.vikt")}: ${kurs.weight || "6%"}`,
              `🏷 ${kurs.category}`,
            ]
              .filter((chip): chip is string => Boolean(chip))
              .map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-medium text-gold"
                >
                  {chip}
                </span>
              ))}
          </div>
        </header>

        <div className="mt-4">
          <NivaBar slug={slug} />
        </div>

        {kurs.why && (
          <section className="mt-8">
            <h2 className="font-serif text-2xl font-bold">{texter.whyRubrik}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
              {kurs.why}
            </p>
          </section>
        )}

        {/* Kursöversikt — HELT VERTIKAL lista på mobil (våg 47:s krav: aldrig
            sidscroll på telefon); tabell från md och upp. Samma fallback-mönster
            för kapiteltitlar/intros som övriga spegeln. */}
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">{t("kurs.kursoversikt")}</h2>

          <ol className="mt-3 space-y-2 md:hidden">
            {kurs.chapters.map((ch) => (
              <li key={ch.num}>
                <a
                  href={`#kap-${ch.num}`}
                  className="flex items-start gap-3 rounded-xl border border-gold/20 bg-card p-3 active:bg-gold/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 font-serif text-sm font-bold text-gold">
                    {ch.num}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug">{ch.title}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {introSnutt(ch, 110) ?? (fas > 0 && ch.num > 2 ? `🔒 kapitel ${ch.num} — Fas ${fas}` : "")}
                      {introSnutt(ch, 110) && (ch.intro?.length || 0) > 110 ? "…" : ""}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {ch.minutes || 9} min
                  </span>
                </a>
              </li>
            ))}
            <li className="flex items-center justify-between rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 text-sm font-semibold">
              <span>{t("kurs.totalt")}</span>
              <span className="font-mono text-xs">{totaltMin} min</span>
            </li>
          </ol>

          <div className="mt-3 hidden overflow-x-auto rounded-xl border border-gold/20 md:block">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-left text-xs uppercase tracking-wide text-gold">
                <tr>
                  <th className="p-3">{t("kurs.kapitel")}</th>
                  <th className="p-3">{t("kurs.fokus")}</th>
                  <th className="p-3 text-right">{t("kurs.tid")}</th>
                </tr>
              </thead>
              <tbody>
                {kurs.chapters.map((ch) => (
                  <tr key={ch.num} className="border-t border-gold/10 hover:bg-gold/5">
                    <td className="p-3 font-medium">
                      <a href={`#kap-${ch.num}`} className="text-gold hover:underline">
                        {ch.num}. {ch.title}
                      </a>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {introSnutt(ch, 90) ?? (fas > 0 && ch.num > 2 ? `🔒 kapitel ${ch.num} — Fas ${fas}` : "")}
                      {introSnutt(ch, 90) && (ch.intro?.length || 0) > 90 ? "…" : ""}
                    </td>
                    <td className="p-3 text-right font-mono text-xs text-muted-foreground">
                      {ch.minutes || 9} min
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gold/30 bg-gold/5 font-semibold">
                  <td className="p-3" colSpan={2}>
                    {t("kurs.totalt")}
                  </td>
                  <td className="p-3 text-right font-mono text-xs">{totaltMin} min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── VÅG 78 B1: SSR-säker Fas-gate (som svenska originalet) ──
            Fas 2/3-kurser: smakprov (kap 1–2) + låst vy i SSR; behöriga
            hämtar fullkursen via /api/kurs-spegel/[lang]/[slug] — kapitel 3+
            skickas aldrig i statiskt HTML. Gratis-kurser: som förut. */}
        {fas > 0 ? (
          <Fas2Gate
            slug={slug}
            titel={kurs.title}
            kapitel={kurs.chapters.length}
            xp={intjanbarXp}
            intro={kurs.chapters[0]?.intro}
            smakprov={smakprov}
            lang={lang}
            harQuiz={harQuiz}
            fortsattning={forsattning}
          />
        ) : (
          <KursGate slug={slug} titel={kurs.title}>
            {harQuiz ? (
              <KursSteg
                kurs={{
                  slug: slug,
                  title: kurs.title,
                  chapters: kurs.chapters.map((ch) => ({
                    num: ch.num,
                    title: ch.title,
                    intro: ch.intro,
                    minutes: ch.minutes,
                    blocks: ch.blocks,
                    quiz: (ch as unknown as { quiz?: Array<{ q: string; alternativ: string[]; ratt: number; tips?: string }> }).quiz,
                  })),
                }}
              />
            ) : (
              <KursArtiklar
                slug={slug}
                chapters={kurs.chapters as SmakprovKapitel[]}
                total={kurs.chapters.length}
                lang={lang}
                rubrik={t("kurs.kursinnehall")}
                fortsattning={forsattning}
              />
            )}
          </KursGate>
        )}

        {/* Källverk — upphovsrättslig transparens visas för alla BOKMASTER-
            kurser, även låsta (samma ordning som originalet). */}
        <Kallkort kurs={kurs} />

        {(kurs.lynchSection || kurs.grahamSection || kurs.ak1Section) && (
          <section className="mt-10">
            <h2 className="font-serif text-2xl font-bold">{texter.perspektivRubrik}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {kurs.lynchSection && (
                <div className="rounded-lg border border-gold/20 bg-card p-4">
                  <h3 className="font-serif font-semibold text-gold">Peter Lynch</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{kurs.lynchSection}</p>
                </div>
              )}
              {kurs.grahamSection && (
                <div className="rounded-lg border border-gold/20 bg-card p-4">
                  <h3 className="font-serif font-semibold text-gold">Benjamin Graham</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{kurs.grahamSection}</p>
                </div>
              )}
              {kurs.ak1Section && (
                <div className="rounded-lg border border-gold/20 bg-card p-4">
                  <h3 className="font-serif font-semibold text-gold">{texter.perspektivAk1}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{kurs.ak1Section}</p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="mt-10 rounded-xl border border-gold/30 bg-card p-6">
          <h2 className="font-serif text-2xl font-bold">{texter.ovningarRubrik}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{texter.ovningarIntro}</p>
          <div className="mt-4 space-y-3">
            {ovningar.map((o, i) => (
              <details key={i} className="rounded-lg border border-gold/20 p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  {texter.ovningLabel} {i + 1}. {o.q.slice(0, 110)}
                  {o.q.length > 110 ? "…" : ""}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.q}</p>
                <p className="mt-2 text-xs italic text-gold">
                  {texter.ledningLabel} {o.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-gold/40 bg-paper p-6">
          <h2 className="font-serif text-2xl font-bold">{texter.fortsattRubrik}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{texter.fortsattText}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/${lang}`}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {texter.oppnaLab}
            </Link>
            <Link
              href={`/${lang}/medlemskap`}
              className="rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold hover:bg-gold/10"
            >
              {texter.seMedlemskap}
            </Link>
          </div>
          {siblings.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                {texter.relaterade(kurs.category)}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/${lang}/kurser/${s.slug}`}
                      className="inline-block rounded-full border border-gold/30 px-3 py-1 text-xs hover:bg-gold/10"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </SeoPageShell>
  );
}

// ── Sidfilernas allyta: generateMetadata (sidfilerna deklarerar själva
//    routing-exporten: generateStaticParams ⇒ [] + dynamicParams = true +
//    revalidate — on-demand-ISR, inget förbygge av 666 sidor).

/**
 * Metadata-byggare för en kursspegel-sida: hämtar lagret, bygger spegeln
 * (progressstyrd robots/canonical/hreflang — se kursSpegelMetadata).
 * Används som `export const generateMetadata = (p) => kursSpegelGenerateMetadata("en", p)`.
 */
export async function kursSpegelGenerateMetadata(
  lang: KursSpegelSprak,
  params: Promise<{ slug: string }>
): Promise<Metadata> {
  const { slug } = await params;
  const kurs = getCourse(slug);
  if (!kurs) return {};
  const lager = await hamtaKursLager(slug, lang);
  const spegel = byggKursSpegel(kurs, lager);
  return kursSpegelMetadata({ lang, spegel });
}
