import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourses, getCourse } from "@/lib/content";
import { courseMetadata, courseJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { KursGate, NivaBar } from "@/components/ak1a/kurs-gate";
import { KursQuiz } from "@/components/ak1a/kurs-quiz";
import { LasProgress, KapitelBadge, InsiktPuls, VisaMetafor } from "@/components/ak1a/kurs-visuellt";

export const dynamic = "force-static";

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
  return courseMetadata(course);
}

export default async function KursPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const siblings = Object.values(getCourses())
    .filter((c) => c.category === course.category && c.slug !== course.slug)
    .slice(0, 6);

  return (
    <SeoPageShell
      wide
      breadcrumb={[{ name: "Kurser", href: "/kurser" }, { name: course.title }]}
    >
      <JsonLd data={courseJsonLd(course)} />
      <LasProgress />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Kurser", path: "/kurser" },
          { name: course.title, path: `/kurser/${course.slug}` },
        ])}
      />

      <header className="border-b border-gold/30 pb-6">
        <p className="text-xs uppercase tracking-widest text-gold">
          AKM1 · {course.category}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold">{course.title}</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">{course.learn}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            `📖 ${course.chapters.length} kapitel`,
            `⏱ ${course.totalMinutes || course.minutes} min`,
            course.xp ? `⚡ ${course.xp} XP` : null,

            `⚖ Vikt: ${course.weight || "6%"}`,
            `🏷 ${course.category}`,
          ].filter(Boolean).map((chip: string) => (
            <span key={chip} className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-medium text-gold">
              {chip}
            </span>
          ))}
        </div>
      </header>

      <div className="mt-4"><NivaBar slug={slug} /></div>

      {course.why && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold">Varför denna variabel är avgörande</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
            {course.why}
          </p>
        </section>
      )}

      {/* Korstabell: kursens struktur och snabbval */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Kursöversikt</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-gold/20">
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
                    <a href={`#kap-${ch.num}`} className="text-gold hover:underline">
                      {ch.num}. {ch.title}
                    </a>
                  </td>
                  <td className="p-3 text-muted-foreground">{ch.intro?.slice(0, 90)}{(ch.intro?.length || 0) > 90 ? "…" : ""}</td>
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

      {/* Kapitel med strukturerade kort + INSIGHT-boxar */}
      <KursGate slug={slug} titel={course.title}>
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Kursinnehåll</h2>
        <div className="mt-4 space-y-6">
          {course.chapters.map((ch) => {
            const insiktBlock = (ch.blocks || []).find((b) => b.type === "insikt");
            const utmaningBlock = (ch.blocks || []).find((b) => b.type === "utmaning");
            const text = (ch.blocks || [])
              .filter((b) => b.type === "text")
              .map((b) => String(b.content))
              .join("\n\n");
            const stycken = text.split(/\n\n+/);
            const insikt = stycken.length > 1
              ? (stycken.find((p) => p.length > 80 && p.length < 350) || "").split(/[.!?] /)[0]
              : "";
            return (
              <article key={ch.num} id={`kap-${ch.num}`} className="scroll-mt-24 rounded-xl border border-gold/20 bg-card p-5">
                <div className="flex items-start gap-3">
                  <KapitelBadge num={ch.num} total={course.chapters.length} aktiv />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl font-semibold">{ch.title}</h3>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                      Kapitel {ch.num} av {course.chapters.length} · {ch.minutes || 9} min läsning
                    </p>
                  </div>
                </div>
                {ch.intro && (
                  <p className="mt-3 border-l-2 border-gold/50 pl-3 text-sm italic text-muted-foreground">
                    {ch.intro}
                  </p>
                )}
                {insikt && (
                  <div className="mt-3 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold"><InsiktPuls /> Nyckelinsikt</p>
                    <p className="mt-1 text-sm font-medium leading-relaxed">{insikt}.</p>
                  </div>
                )}
                {(slug === "the-intelligent-investor" && ch.num === 2) && <VisaMetafor typ="mr-market" />}
                {(slug === "the-intelligent-investor" && ch.num === 3) && <VisaMetafor typ="bro" />}
                {(slug === "the-intelligent-investor" && ch.num === 8) && <VisaMetafor typ="skala" />}
                {insiktBlock && (
                  <div className="mt-3 rounded-lg border-2 border-gold bg-gold/15 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold">◆ 10x-insikt</p>
                    <p className="mt-1 text-sm font-semibold leading-relaxed">{String(utmaningBlock.content)}</p>
                  </div>
                )}
                {utmaningBlock && (
                  <details className="mt-3 rounded-lg border-2 border-gold/60 bg-paper px-4 py-3">
                    <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-gold">
                      🎯 Utmaning — klicka när du vågar
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/90">{String(utmaningBlock.content)}</p>
                    <p className="mt-2 text-[11px] italic text-muted-foreground">Belöning: +10 XP och äkta förståelse — ingen fuskar sig till insikt.</p>
                  </details>
                )}
                <div className="mt-3 space-y-3">
                  {stycken
                    .filter((p) => p !== insikt)
                    .map((p, i) => {
                      const rader = p.split("\n");
                      const listRader = rader.filter((r) => /^[•\-*]\s/.test(r.trim()));
                      if (listRader.length >= 2) {
                        return (
                          <ul key={i} className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground/90">
                            {rader.map((r, j) =>
                              /^[•\-*]\s/.test(r.trim()) ? <li key={j}>{r.trim().replace(/^[•\-*]\s*/, "")}</li> : null
                            )}
                          </ul>
                        );
                      }
                      return (
                        <p key={i} className="text-sm leading-relaxed text-foreground/90">
                          {p}
                        </p>
                      );
                    })}
                </div>
                {(ch as any).quiz && (
                  <KursQuiz slug={slug} kapitelNr={ch.num} fragor={(ch as any).quiz} />
                )}
                <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="h-px flex-1 bg-gold/20" />
                  {ch.num < course.chapters.length ? `Nästa: ${course.chapters[ch.num]?.title || ""}` : "Kursen klar ⭐"}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      </KursGate>

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
            q: `Förklara med egna ord: vad mäter ${course.title} och varför väger den ${course.weight || "6%"} i AKM1?`,
            a: course.learn || "",
          },
          num
            ? {
                q: `Räkneövning: hämta senaste siffrorna från ett bolags årsredovisning (se "Var hittar jag siffrorna" i kalkylatorn) och beräkna ${course.title}. Vilken poäng (0-5) ger din uträkning?`,
                a: "Facit är din egen uträkning — kontrollera mot kalkylatorns automatpoäng på /kalkylator.",
              }
            : {
                q: `Tillämpning: hitta ett bolag där ${course.title.toLowerCase()} är starkt — och ett där den är svag. Vad skiljer dem?`,
                a: `Ledning: se kapitel ${course.chapters?.[2]?.num ?? 3} ("${course.chapters?.[2]?.title ?? "beräkning i praktiken"}").`,
              },
          {
            q: `Reflektion: hur skulle din portfölj påverkas om ditt största innehav svek på just ${course.title.toLowerCase()}?`,
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
