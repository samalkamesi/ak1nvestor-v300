"use client";

import * as React from "react";
import { fetchDeepCourse, type DeepCourse } from "@/lib/ak1a/deep-courses-data";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Eyebrow, GoldRule, HonestyTag } from "./primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  Zap,
  BookOpen,
  Lightbulb,
  BookMarked,
  CheckCircle2,
  Circle,
  History,
  Loader2,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Deep course viewer — renders the full 6-chapter course content
 * (theory, insights, definitions, historical context).
 * Data is loaded via API to avoid bundling 989KB into the client.
 */
export function DeepCourseViewer({ slug }: { slug: string }) {
  const { setKurserDeepSlug, progress, completeCourse } = useAk1aStore();
  const [course, setCourse] = React.useState<DeepCourse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [readChapters, setReadChapters] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDeepCourse(slug).then((c) => {
      if (!cancelled) {
        setCourse(c);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
          <p className="mt-3 text-sm text-muted-foreground">Laddar kurs…</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Kursen hittades inte.</p>
        <Button className="mt-4" variant="outline" onClick={() => setKurserDeepSlug(null)}>
          Tillbaka till kurser
        </Button>
      </div>
    );
  }

  const isCompleted = progress.completedCourses.includes(course.variableId);
  const readCount = readChapters.size;
  const totalCount = course.chapters.length;
  const pct = Math.round((readCount / totalCount) * 100);

  const markRead = (num: number) => {
    setReadChapters((prev) => {
      const next = new Set(prev);
      next.add(num);
      if (next.size >= totalCount && !isCompleted) {
        completeCourse(course.variableId);
      }
      return next;
    });
  };

  return (
    <div className="paper-texture min-h-screen">
      {/* Sticky course header */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setKurserDeepSlug(null)}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Tillbaka till kurser
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {readCount}/{totalCount}
              </span>
              <Progress value={pct} className="h-1.5 w-20" />
            </div>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Course header */}
        <header className="border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-gold text-background hover:bg-gold">POWER 20</Badge>
            <Badge variant="outline" className="border-gold/40 text-gold">
              {course.category}
            </Badge>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              VIKT: {course.weight}
            </span>
            <span className="text-[11px] text-muted-foreground">
              · {course.chapterCount} KAPITEL · {course.totalMinutes} MIN
            </span>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
            {course.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            {course.summary}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" /> {course.minutes} min
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Zap className="h-4 w-4 text-gold" /> {course.xp} XP
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="h-4 w-4" /> {course.level}
            </span>
            <HonestyTag kind="matt" />
          </div>
        </header>

        {/* Vad du kommer lära dig */}
        <section className="border-b border-border py-6">
          <Eyebrow>Vad du kommer lära dig</Eyebrow>
          <p className="mt-2 text-base leading-relaxed">{course.learn}</p>
        </section>

        {/* Varför detta är viktigt */}
        <section className="border-b border-border py-6">
          <Eyebrow>Varför detta är viktigt</Eyebrow>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            {course.why}
          </p>
        </section>

        {/* Kapitel list */}
        <section className="border-b border-border py-6">
          <div className="flex items-center justify-between">
            <Eyebrow>Kapitel</Eyebrow>
            <span className="text-xs text-muted-foreground">
              {readCount}/{totalCount} lästa ({pct}%)
            </span>
          </div>
          <div className="mt-3 space-y-1">
            {course.chapters.map((ch) => {
              const isRead = readChapters.has(ch.num);
              return (
                <button
                  key={ch.num}
                  onClick={() => {
                    document
                      .getElementById(`chapter-${ch.num}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="flex w-full items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-all hover:border-gold/50"
                >
                  {isRead ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-bull" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-serif text-lg font-bold text-gold">{ch.num}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{ch.title}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{ch.minutes}m</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Historisk kontext */}
        {course.history && (
          <section className="border-b border-border py-6">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-gold" />
              <Eyebrow>Historisk kontext</Eyebrow>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">Ursprung</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{course.history.origin}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">Evolution</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{course.history.evolution}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">Modern relevans</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{course.history.modern}</p>
              </div>
            </div>
          </section>
        )}

        {/* Tre perspektiv: Lynch, Graham, AKM1 */}
        {(course.lynchSection || course.grahamSection || course.ak1Section) && (
          <section className="border-b border-border py-6">
            <Eyebrow>Tre perspektiv</Eyebrow>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {course.lynchSection && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
                    <Quote className="h-3.5 w-3.5" /> Peter Lynch
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {course.lynchSection}
                  </p>
                </div>
              )}
              {course.grahamSection && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
                    <Quote className="h-3.5 w-3.5" /> Benjamin Graham
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {course.grahamSection}
                  </p>
                </div>
              )}
              {course.ak1Section && (
                <div className="rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
                    <BookOpen className="h-3.5 w-3.5" /> AKM1-metodiken
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {course.ak1Section}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Full chapters */}
        {course.chapters.map((ch) => {
          const isRead = readChapters.has(ch.num);
          return (
            <section
              key={ch.num}
              id={`chapter-${ch.num}`}
              className="scroll-mt-32 border-b border-border py-8"
            >
              <div className="flex items-center gap-2">
                <span className="font-serif text-3xl font-bold text-gold">{ch.num}</span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    KAPITEL {ch.num} · {ch.minutes} MIN
                  </p>
                  <h2 className="font-serif text-2xl font-bold leading-tight">{ch.title}</h2>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-muted-foreground">{ch.intro}</p>

              <Button
                variant={isRead ? "outline" : "default"}
                size="sm"
                className={cn("mt-4", !isRead && "bg-gold text-background hover:bg-gold/90")}
                onClick={() => markRead(ch.num)}
              >
                {isRead ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-bull" /> Läst
                  </>
                ) : (
                  "Markera läst"
                )}
              </Button>

              <GoldRule className="my-5" />

              {/* Chapter content blocks */}
              <div className="space-y-4">
                {ch.blocks.map((block, i) => {
                  if (block.type === "insight") {
                    return (
                      <div key={i} className="rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
                          <Lightbulb className="h-3.5 w-3.5" /> Insikt
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed">{block.content}</p>
                      </div>
                    );
                  }
                  if (block.type === "definition") {
                    return (
                      <div key={i} className="rounded-lg border border-border bg-muted/40 p-4">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <BookMarked className="h-3.5 w-3.5" /> Definition
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed">{block.content}</p>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="max-w-none">
                      {block.content.split("\n\n").map((para, j) => (
                        <p key={j} className="mb-3 text-sm leading-relaxed text-foreground/90">
                          {para}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Completion */}
        <section className="py-8 text-center">
          {readCount >= totalCount ? (
            <Card className="border-gold/40 bg-gold/[0.03] p-6">
              <CheckCircle2 className="mx-auto h-10 w-10 text-bull" />
              <h3 className="mt-3 font-serif text-xl font-bold">Kurs slutförd!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Du har läst alla {totalCount} kapitel. +{course.xp} XP tilldelat.
              </p>
              <Button
                className="mt-4 bg-gold text-background hover:bg-gold/90"
                onClick={() => setKurserDeepSlug(null)}
              >
                Tillbaka till kurser
              </Button>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">
              Läs alla {totalCount} kapitel för att slutföra kursen ({readCount}/{totalCount} lästa).
            </p>
          )}
        </section>
      </article>
    </div>
  );
}
