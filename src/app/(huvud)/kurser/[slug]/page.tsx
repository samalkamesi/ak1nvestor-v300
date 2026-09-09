import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourses, getCourse } from "@/lib/content";
import {
  courseMetadata,
  courseJsonLd,
  courseFaqJsonLd,
  breadcrumbJsonLd,
  JsonLd,
} from "@/lib/seo";
import { lasPriser } from "@/lib/portfolj-forskning/korstabell-data";
import { kraverFas } from "@/lib/kurs-access";
import { medKursOverrides } from "@/lib/kurs-metadata-live";
import { skapaT } from "@/lib/sprak";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { KursGate, NivaBar } from "@/components/ak1a/kurs-gate";
import { Fas2Gate } from "@/components/ak1a/fas2-gate";
import { KursSteg, KapitelOversiktLank } from "@/components/ak1a/kurs-steg";
import { KursArtiklar, type SmakprovKapitel } from "@/components/ak1a/kurs-artiklar";
import { LasProgress } from "@/components/ak1a/kurs-visuellt";
import { Kallkort } from "@/components/ak1a/kallkort";
import { LarvagKort } from "@/components/ak1a/larvag-kort";

/**
 * VÅG 81 (slutligt, prodmätt): dynamicParams=false = ÄKTA 404 på okända
 * slug:ar (routern matchar aldrig → Vercel servar den förhandsrenderade
 * 404:n med korrekt status). dynamicParams=true visade sig i Next 16 ge
 * SOFT-404: notFound-HTML med HTTP 200 + statisk skal UTAN request-
 * kontext (inga SSR-kursförslag, root-layout-titel) — verifierat mot
 * prod och lokal produktionsserver 2026-09-07; samma mekanism gör att
 * /blogg/[slug] och /en|/ar-speglarna svarar 200 på okända slug:ar
 * (systemfynd → våg 82). KursForslag-komponenten (usePathname) behåller
 * sin fix — den renderar SSR-förslag så snart en request-scoped 404-
 * render någonsin blir möjlig. generateStaticParams prerenderar de 333
 * kända kurserna (SSG oförändrat).
 */
export const dynamicParams = false;

// VÅG 82 (ordförandebeslut): revalidate 3600 landar FÖRST NU, samtidigt
// som metadata-lagret — samma bevisade combo som /en|/ar-speglarna.
// Kompatibelt med dynamicParams=false ovan: kända sidor blir ISR (○ i
// build-utskriften), okända slug:ar förblir ÄKTA 404 (våg 81 — RÖR EJ).
// Kursens title/summary/learn/why läses live via medKursOverrides(course)
// vid varje revalidation; strukturella fält (kapitel, XP-ekonomi, kategori)
// kommer fortfarande från filen.
export const revalidate = 3600;

export function generateStaticParams() {
  return Object.keys(getCourses()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  // VÅG 82: title/summary (learn) live-mergas med panelens override —
  // filvärdena är fallback (tombstone/miss saknas ⇒ filen gäller).
  const kurs = await medKursOverrides(course);
  return courseMetadata(kurs);
}

export default async function KursPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  // VÅG 82: kursens vitlistefält title/summary/learn/why live-mergas
  // (kurs-metadata-live); allt strukturellt (kapitel, quiz, XP, kategori)
  // är fortfarande filens — vitlåset garanteras av skrivvägen.
  const kurs = await medKursOverrides(course);

  const siblings = Object.values(getCourses())
    .filter((c) => c.category === course.category && c.slug !== course.slug)
    .slice(0, 6);

  // Har kursen quiz renderas KapitelAv KursSteg (steg-läge) — annars vanliga
  // kapitel-artiklar med id="kap-N". Styr både val av komponent och om
  // Kursöversiktens länkar ska vara #ankare eller kapitelval (VÅG 63 O2 #4).
  const harQuiz = (course.chapters as unknown as Array<{ quiz?: unknown }>).some(
    (ch) => Array.isArray(ch.quiz) && ch.quiz.length > 0
  );

  // Prenum-CTA-raden (VÅG 63 O2 #2): exempelnivå ur priser.json — byggs vid
  // build via lasPriser(), serialiserbar prop in i KursSteg.
  const priser = lasPriser();
  const prenumNiva =
    priser?.nivaer.find((n) => n.id === "forskning") ?? priser?.nivaer[0] ?? null;

  // ── VÅG 78 B1: SSR-säker Fas-gate ──
  // Fas 2/3-kurser: servern renderar SMAKPROV (kapitel 1–2) + låst vy —
  // kapitel 3+ hämtas på klienten efter lokal åtkomstkontroll och skickas
  // ALDRIG i statiskt HTML/flight-payload. Gratis-kurser (fas 0) renderas
  // som förut i sin helhet.
  const fas = kraverFas(slug);

  // ── VÅG 78 B4a: verkligt intjänbar XP ──
  // Chippet lovar det quizet faktiskt betalar ut: 10 XP per fråga + 50 i
  // klar-bonus (kurs.xp-fältet i deep-courses.json stämmer inte med quizet
  // för 333/333 kurser — visa det verkliga intjänbara i stället).
  const intjanbarXp =
    course.chapters.reduce(
      (s, ch) => s + ((ch as unknown as { quiz?: unknown[] }).quiz?.length ?? 0),
      0
    ) * 10 + 50;

  // Smakprovet (kapitel 1–2) — det enda kapitelinnehåll som får serialiseras
  // till Fas2Gate för fas-kurser. "Nästa:"-rader pekar på fulla TOC:n.
  const smakprov: SmakprovKapitel[] = course.chapters.slice(0, 2).map((ch) => ({
    num: ch.num,
    title: ch.title,
    intro: ch.intro,
    minutes: ch.minutes,
    blocks: (ch.blocks || []).map((b) => ({ type: String(b.type), content: String(b.content) })),
    quiz: (ch as unknown as { quiz?: SmakprovKapitel["quiz"] }).quiz,
  }));
  const forsattning = course.chapters.map((ch) => ({ num: ch.num, title: ch.title }));

  // FRONT A (A3-FAQSCHEMA): FAQPage-schema — kursens egna kanoniska fråga +
  // syskonfrågor i samma kategori, ORDAGRADT ur data/llms-fragor.json
  // (courseFaqJsonLd → faqJsonLd). null ⇒ ingen fråga i korpusen ⇒ inget
  // schema. Renderas som eget <script type="application/ld+json"> bredvid
  // Course-schemat — fråga/svar-form, inget överlapp med kursdatan där.
  const faqSchema = courseFaqJsonLd(kurs);

  // Kursöversiktens intro-snuttar: kapitel 1–2 syns alltid (smakprov/SEO);
  // för fas-kurser visas ingen prosa från kapitel 3+ i den statiska HTML:n
  // (våg 78 B1) — titlar och tider får följa med (kurskorts-metadata).
  const introSnutt = (ch: (typeof course.chapters)[number], langd: number): string | null => {
    if (!ch.intro) return null;
    if (fas > 0 && ch.num > 2) return null;
    return ch.intro.slice(0, langd);
  };

  return (
    <SeoPageShell
      wide
      breadcrumb={[{ name: "Kurser", href: "/kurser" }, { name: kurs.title }]}
    >
      <JsonLd data={courseJsonLd(kurs)} />
      {faqSchema && <JsonLd data={faqSchema} />}
      <LasProgress />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Kurser", path: "/kurser" },
          { name: kurs.title, path: `/kurser/${course.slug}` },
        ])}
      />

      <header className="border-b border-gold/30 pb-6">
        <p className="text-xs uppercase tracking-widest text-gold">
          AKM1 · {course.category}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold">{kurs.title}</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">{kurs.learn}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            `📖 ${course.chapters.length} kapitel`,
            `⏱ ${course.totalMinutes || course.minutes} min`,
            `⚡ ${intjanbarXp} XP`,

            `⚖ Vikt: ${course.weight || "6%"}`,
            `🏷 ${course.category}`,
          ].filter((chip): chip is string => Boolean(chip)).map((chip) => (
            <span key={chip} className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-medium text-gold">
              {chip}
            </span>
          ))}
        </div>
      </header>

      <div className="mt-4"><NivaBar slug={slug} /></div>

      {kurs.why && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold">Varför denna variabel är avgörande</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
            {kurs.why}
          </p>
        </section>
      )}

      {/* Kursöversikt — HELT VERTIKAL lista på mobil (krav 2026-09-03: aldrig
          sidscroll på telefon, oavsett orientering); tabell från md och upp. */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Kursöversikt</h2>

        {/* Mobil: vertikala kapitelkort */}
        <ol className="mt-3 space-y-2 md:hidden">
          {course.chapters.map((ch) => (
            <li key={ch.num}>
              <KapitelOversiktLank
                num={ch.num}
                harQuiz={harQuiz}
                className="flex items-start gap-3 rounded-xl border border-gold/20 bg-card p-3 active:bg-gold/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 font-serif text-sm font-bold text-gold">
                  {ch.num}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{ch.title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {introSnutt(ch, 110) ?? (fas > 0 && ch.num > 2 ? `🔒 kapitel ${ch.num} — låses med Fas ${fas}` : "")}
                    {introSnutt(ch, 110) && (ch.intro?.length || 0) > 110 ? "…" : ""}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {ch.minutes || 9} min
                </span>
              </KapitelOversiktLank>
            </li>
          ))}
          <li className="flex items-center justify-between rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 text-sm font-semibold">
            <span>Totalt</span>
            <span className="font-mono text-xs">{course.totalMinutes || course.minutes} min</span>
          </li>
        </ol>

        {/* Desktop: tabell */}
        <div className="mt-3 hidden overflow-x-auto rounded-xl border border-gold/20 md:block">
          <table className="w-full text-sm">
            <thead className="bg-gold/10 text-left text-xs uppercase tracking-wide text-gold">
              <tr>
                <th className="p-3">Kapitel</th>
                <th className="p-3">Fokus</th>
                <th className="p-3 text-right">Tid</th>
              </tr>
            </thead>
            <tbody>
              {course.chapters.map((ch) => (
                <tr key={ch.num} className="border-t border-gold/10 hover:bg-gold/5">
                  <td className="p-3 font-medium">
                    <KapitelOversiktLank
                      num={ch.num}
                      harQuiz={harQuiz}
                      className="text-gold hover:underline"
                    >
                      {ch.num}. {ch.title}
                    </KapitelOversiktLank>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {introSnutt(ch, 90) ?? (fas > 0 && ch.num > 2 ? `🔒 kapitel ${ch.num} — låses med Fas ${fas}` : "")}
                    {introSnutt(ch, 90) && (ch.intro?.length || 0) > 90 ? "…" : ""}
                  </td>
                  <td className="p-3 text-right font-mono text-xs text-muted-foreground">{ch.minutes || 9} min</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gold/30 bg-gold/5 font-semibold">
                <td className="p-3" colSpan={2}>Totalt</td>
                <td className="p-3 text-right font-mono text-xs">{course.totalMinutes || course.minutes} min</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── VÅG 78 B1: SSR-säker Fas-gate ──
          Fas 2/3-kurser: Fas2Gate renderar smakprov (kap 1–2) + låst vy i
          SSR-passet och hämtar fullkursen på klienten för behöriga —
          kapitel 3+ skickas aldrig i statiskt HTML.
          VÅG 87 (FAS L2): GRATIS-kurser går via den generaliserade KursGate-
          egisen — samma smakprov som SSR-bas + låst kort; medlemmen låser
          upp på klienten mot server-verifierad session (§E kandidat 1: sidan
          läser ALDRIG session i SSR-passet, ISR-cachen förblir gäst-vyn). */}
      {fas > 0 ? (
        <Fas2Gate
          slug={slug}
          titel={kurs.title}
          kapitel={course.chapters.length}
          xp={intjanbarXp}
          intro={course.chapters[0]?.intro}
          smakprov={smakprov}
          harQuiz={harQuiz}
          prenumNiva={prenumNiva}
          fortsattning={forsattning}
        />
      ) : (
      <KursGate
        slug={slug}
        titel={kurs.title}
        smakprov={
          <KursArtiklar
            slug={slug}
            chapters={smakprov}
            total={course.chapters.length}
            lang="sv"
            rubrik={skapaT("sv")("fas.smakprovRubrik")}
            fortsattning={forsattning}
          />
        }
      >
      {harQuiz ? (
        <KursSteg
          prenumNiva={prenumNiva}
          kurs={{
            slug: slug,
            title: kurs.title,
            chapters: (course.chapters as any[]).map((ch) => ({
              num: ch.num,
              title: ch.title,
              intro: ch.intro,
              minutes: ch.minutes,
              blocks: ch.blocks,
              quiz: ch.quiz,
            })),
          }}
        />
      ) : (
      <KursArtiklar
        slug={slug}
        chapters={course.chapters as SmakprovKapitel[]}
        total={course.chapters.length}
        lang="sv"
        rubrik="Kursinnehåll"
        fortsattning={forsattning}
      />
      )}
    </KursGate>
      )}

    {/* Källverk — upphovsrättslig transparens: visas för alla BOKMASTER-kurser,
        även låsta (transparensen ska inte sitta bakom betalväggen). */}
    <Kallkort kurs={kurs} />

      {(course.lynchSection || course.grahamSection || course.ak1Section) && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">Tre perspektiv</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {course.lynchSection && (
              <div className="rounded-lg border border-gold/20 bg-card p-4">
                <h3 className="font-serif font-semibold text-gold">Peter Lynch</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {course.lynchSection}
                </p>
              </div>
            )}
            {course.grahamSection && (
              <div className="rounded-lg border border-gold/20 bg-card p-4">
                <h3 className="font-serif font-semibold text-gold">Benjamin Graham</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {course.grahamSection}
                </p>
              </div>
            )}
            {course.ak1Section && (
              <div className="rounded-lg border border-gold/20 bg-card p-4">
                <h3 className="font-serif font-semibold text-gold">AK1:s tolkning</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {course.ak1Section}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {(() => {
        const num = ["v04", "v05", "v06", "v07", "v08", "v09", "v10", "v19"].includes(slug.slice(0, 3));
        const ovningar = [
          {
            q: `Förklara med egna ord: vad mäter ${kurs.title} och varför väger den ${course.weight || "6%"} i AKM1?`,
            a: kurs.learn || "",
          },
          num
            ? {
                q: `Räkneövning: hämta senaste siffrorna från ett bolags årsredovisning (se "Var hittar jag siffrorna" i kalkylatorn) och beräkna ${kurs.title}. Vilken poäng (0-5) ger din uträkning?`,
                a: "Facit är din egen uträkning — kontrollera mot kalkylatorns automatpoäng på /kalkylator.",
              }
            : {
                q: `Tillämpning: hitta ett bolag där ${kurs.title.toLowerCase()} är starkt — och ett där den är svag. Vad skiljer dem?`,
                a: `Ledning: se kapitel ${course.chapters?.[2]?.num ?? 3} ("${course.chapters?.[2]?.title ?? "beräkning i praktiken"}").`,
              },
          {
            q: `Reflektion: hur skulle din portfölj påverkas om ditt största innehav svek på just ${kurs.title.toLowerCase()}?`,
            a: "Testa i Min portfölj (/min-portfolj) eller diskutera i labbet.",
          },
        ];
        return (
          <section className="mt-10 rounded-xl border border-gold/30 bg-card p-6">
            <h2 className="font-serif text-2xl font-bold">Övningsuppgifter</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Tre övningar för att fästa variabeln — fäll ut för ledning.
            </p>
            <div className="mt-4 space-y-3">
              {ovningar.map((o, i) => (
                <details key={i} className="rounded-lg border border-gold/20 p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Övning {i + 1}. {o.q.slice(0, 110)}{o.q.length > 110 ? "…" : ""}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.q}</p>
                  <p className="mt-2 text-xs italic text-gold">Ledning: {o.a}</p>
                </details>
              ))}
            </div>
          </section>
        );
      })()}

      <section className="mt-12 rounded-lg border border-gold/40 bg-paper p-6">
        <h2 className="font-serif text-2xl font-bold">Fortsätt läroplanen</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Interaktiva övningar, vågmatriser och AI-tutor hittar du i labbet.
        </p>

        {/* VÅG 88 (B1-LARVAG): "Fortsätt här" — lärvägsmotorns nästa steg,
            räknat på SERVERN (raknaLarvag via /api/larvag: progress ur
            sessionen + hårt fas-filter + anonym svaghetsargmax). Kortet är
            en KLIENT-komponent som hämtar i useEffect: ISR-passet (○,
            revalidate 3600) förblir orört — personliga värden når aldrig
            sidans statiska HTML. Aktuell kurs exkluderas alltid. */}
        <div className="mt-4">
          <LarvagKort antal={2} rubrik="Fortsätt här" exkluderaSlug={slug} />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Öppna AK1A Research Lab
          </Link>
          <Link
            href="/medlemskap"
            className="rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold hover:bg-gold/10"
          >
            Se medlemskap
          </Link>
        </div>
        {siblings.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
              Relaterade kurser i {course.category}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/kurser/${s.slug}`}
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
    </SeoPageShell>
  );
}
