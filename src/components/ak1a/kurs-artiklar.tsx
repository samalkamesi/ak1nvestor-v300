"use client";

import { skapaT } from "@/lib/sprak";
import type { SprakId } from "@/lib/sprak";
import { KapitelBadge, InsiktPuls } from "@/components/ak1a/kurs-visuellt";
import { KursQuiz, type QuizFraga } from "@/components/ak1a/kurs-quiz";
import { RikText } from "@/components/ak1a/rik-text";

/**
 * Serialiserbart kapitel — det ENDA kapitelformat som får skickas från
 * server-komponenter in i klient-gates för Fas 2/3-kurser (våg 78 B1):
 * SSR-passet får bara bära smakprovet (kapitel 1–2), aldrig resten.
 * Samma form som KursSteg:s Kapitel-typ (num/title/intro/minutes/blocks/quiz).
 */
export type SmakprovKapitel = {
  num: number;
  title: string;
  intro?: string;
  minutes?: number;
  blocks?: Array<{ type: string; content: string }>;
  quiz?: QuizFraga[];
};

/**
 * KursArtiklar — kapitel som läsbara artiklar med id="kap-N" (våg 78 B1).
 * Tre användare:
 *  1. Gratis-kurser utan quiz (ersätter sidornas inline-artikelrendering).
 *  2. Smakprov (kapitel 1–2) för låsta Fas 2/3-kurser — alltid i SSR-HTML:n
 *     som lockbete/SEO, medan kapitel 3+ hämtas på klienten efter upplåsning.
 *  3. Upplockat fullinnehåll för behöriga Fas 2/3-medlemmar.
 * UI-runor via skapaT(lang) — samma ordlista som KursSteg (sv|en|ar).
 */
export function KursArtiklar({
  slug,
  chapters,
  total,
  lang = "sv",
  rubrik,
  klass,
  fortsattning,
}: {
  slug: string;
  chapters: SmakprovKapitel[];
  /** Totala kapitalantalet i HELA kursen (kan överstiga chapters.length för smakprov). */
  total: number;
  lang?: SprakId;
  /** Valfalig sektionsrubrik (t.ex. "Kursinnehåll" / "Smakprov — kapitel 1–2"). */
  rubrik?: string;
  /** Extra klasser på sektionen (t.ex. marginal vid inbäddning). */
  klass?: string;
  /** Valfri full TOC (num+title) för "Nästa:"-rader som pekar utanför smakprovet —
   *  titlar är redan publika i kursöversikten, så de får serialiseras. */
  fortsattning?: Array<{ num: number; title: string }>;
}) {
  const t = skapaT(lang);

  return (
    <section className={klass ?? "mt-10"} aria-label={rubrik ?? t("kurs.kursinnehall")}>
      {rubrik && <h2 className="font-serif text-2xl font-bold">{rubrik}</h2>}
      <div className="mt-4 space-y-6">
        {chapters.map((ch) => {
          const insiktBlock = (ch.blocks || []).find((b) => b.type === "insikt");
          const text = (ch.blocks || [])
            .filter((b) => b.type === "text")
            .map((b) => String(b.content))
            .join("\n\n");
          const stycken = text.split(/\n\n+/);
          const insikt = stycken.length > 1
            ? (stycken.find((p) => p.length > 80 && p.length < 350) || "").split(/[.!?] /)[0]
            : "";
          const nasta =
            (fortsattning ?? chapters).find((n) => n.num === ch.num + 1) ??
            chapters.find((n) => n.num === ch.num + 1);
          return (
            <article key={ch.num} id={`kap-${ch.num}`} className="scroll-mt-24 rounded-xl border border-gold/20 bg-card p-5">
              <div className="flex items-start gap-3">
                <KapitelBadge num={ch.num} total={total} aktiv />
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-xl font-semibold">{ch.title}</h3>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {t("kurs.kapitelAv", { num: ch.num, total, min: ch.minutes || 9 })}
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
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold"><InsiktPuls /> {t("kurs.insikt")}</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed">{insikt}.</p>
                </div>
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
                      <RikText key={i} text={p} />
                    );
                  })}
              </div>
              {ch.quiz && ch.quiz.length > 0 && (
                <KursQuiz slug={slug} kapitelNr={ch.num} fragor={ch.quiz} />
              )}
              <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-gold/20" />
                {nasta ? t("kurs.nasta", { titel: nasta.title }) : `${t("kurs.kursenSlut")} ⭐`}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
