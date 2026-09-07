"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  kraverFas,
  harFas2Access,
  harFas3Access,
  arAdmin,
  aktiveraFas2Override,
  fas2LockeradText,
  fas3LockeradText,
} from "@/lib/kurs-access";
import { KursGate } from "@/components/ak1a/kurs-gate";
import { KursSteg } from "@/components/ak1a/kurs-steg";
import { KursArtiklar, type SmakprovKapitel } from "@/components/ak1a/kurs-artiklar";
import type { PrenumerationNiva } from "@/lib/prenumeration";
import type { SprakId } from "@/lib/sprak";

/**
 * Fas2Gate — SSR-SÄKER FAS-GATE (våg 78 B1; exportnamnet Fas2Gate bevaras).
 *
 * KONTRAKT (skillnaden mot v1): barn-kapitlen skickas INTE längre från
 * servern — i v1 renderades hela barnträdet i SSR-passet (`access === null →
 * children`) på force-static-sidor, så Fas 2/3-kursernas fulltext levererades
 * i statisk HTML (mjuk läcka, gick att curl:a). Nu:
 *
 *  1. SSR/first paint visar LÅST vy + SMAKPROV (kapitel 1–2, KursGate-
 *     kontraktet: smakprovet är SEO + lockbete och förblir öppet).
 *  2. Efter montering avgörs åtkomsten lokalt (ak1a-member → member_type,
 *     admin-override) — samma localStorage-logik som tidigare.
 *  3. Behöriga hämtar FULLKURSEN på klienten via /api/kurs/[slug]
 *     (spegelsidorna: /api/kurs-spegel/[lang]/[slug]) — kapitel 3+ skickas
 *     ALDRIG i statiskt HTML/flight-payload.
 *
 * Pedagogik (pedagogik.ts): eleven FÅR se vad som väntar — kurskort med
 * titel, kapitel, XP och smakprovet. Inbjudan vidare när eleven är redo,
 * aldrig ett stopp. Fas 1 förblir gratis, för alltid.
 */
export function Fas2Gate({
  slug,
  titel,
  kapitel,
  xp,
  intro,
  smakprov = [],
  lang = "sv",
  harQuiz = true,
  prenumNiva = null,
  fortsattning,
}: {
  slug: string;
  titel: string;
  kapitel: number;
  /** Verkligt intjänbar XP (quiz×10 + 50 klar-bonus, våg 78 B4a). */
  xp?: number;
  intro?: string;
  /** Kapitel 1–2 — det enda kapitelinnehåll som får serialiseras i SSR. */
  smakprov?: SmakprovKapitel[];
  /** "sv" | "en" | "ar" — styr fullkurs-hämtningen (spegel-API) + artikellabels. */
  lang?: SprakId;
  /** Har kursen quiz → KursSteg i upplåst läge (samma villkor som sidorna). */
  harQuiz?: boolean;
  prenumNiva?: PrenumerationNiva | null;
  /** Full TOC (num+title) för smakprovets "Nästa:"-rader — titlar är publika. */
  fortsattning?: Array<{ num: number; title: string }>;
}) {
  // Rent Set-uppslag (SSR-säkert) — 0 = gratis, 2/3 = lås bakom respektive fas
  const fas = kraverFas(slug);
  const fas3 = fas === 3;
  // LÅST är SSR-default (v1 läckte här: access === null → children)
  const [access, setAccess] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [kurs, setKurs] = useState<{ title: string; chapters: SmakprovKapitel[] } | null>(null);
  const [fel, setFel] = useState(false);
  const [forsokIgen, setForsokIgen] = useState(0);
  const lasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fas === 0) {
      setAccess(true); // gratis-kurs (försvarslinje — sidorna gatar bara fas>0)
      return;
    }
    setAdmin(arAdmin());
    // fas3-medlem öppnar ALLT (supermängd i kurs-access.ts), men en fas2-medlem
    // öppnar bara fas 2 — fas 3-kurser förblir en inbjudan vidare.
    setAccess(fas3 ? harFas3Access() : harFas2Access());
  }, [fas, fas3, slug]);

  // Fullkursen hämtas FÖRST efter lokal åtkomstkontroll (våg 78 B1).
  useEffect(() => {
    if (!access) return;
    let aktiv = true;
    setFel(false);
    const url = lang === "sv" ? `/api/kurs/${slug}` : `/api/kurs-spegel/${lang}/${slug}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((k: { title?: string; chapters?: SmakprovKapitel[] }) => {
        if (!aktiv) return;
        if (Array.isArray(k?.chapters) && k.chapters.length > 0) {
          setKurs({ title: k.title ?? titel, chapters: k.chapters });
        } else {
          setFel(true);
        }
      })
      .catch(() => {
        if (aktiv) setFel(true);
      });
    return () => {
      aktiv = false;
    };
  }, [access, slug, lang, titel, forsokIgen]);

  // Kursöversiktens kapitellänkar sänder ak1a:hoppa-kapitel (KursSteg lyssnar
  // i upplåst läge). I LÅST läge finns ingen lyssnare — hoppa i stället till
  // smakprovsartikeln (kap 1–2) eller låsblocket (kap 3+).
  useEffect(() => {
    if (access) return;
    const hoppa = (e: Event) => {
      const num = (e as CustomEvent<{ num?: number }>).detail?.num;
      const mal = (num != null ? document.getElementById(`kap-${num}`) : null) ?? lasRef.current;
      mal?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("ak1a:hoppa-kapitel", hoppa);
    return () => window.removeEventListener("ak1a:hoppa-kapitel", hoppa);
  }, [access]);

  /** Smakprovet — kapitel 1–2, alltid läsbart även för olåsta (SEO/lockbete). */
  const smakprovSektion = smakprov.length > 0 ? (
    <KursArtiklar
      slug={slug}
      chapters={smakprov}
      total={kapitel}
      lang={lang}
      rubrik="Smakprov — de två första kapitlen"
      fortsattning={fortsattning}
    />
  ) : null;

  // ── Upplåst läge: fullkurs via klient-hämtning, samma chatt som förut ──
  if (access) {
    return (
      <KursGate slug={slug} titel={titel}>
        {fel ? (
          <section className="mt-10" aria-live="polite">
            <div className="rounded-xl border border-gold/40 bg-card p-6 text-center">
              <p className="text-sm font-semibold">
                Kursen kunde inte hämtas just nu — kontrollera anslutningen.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFel(false);
                  setKurs(null);
                  setForsokIgen((n) => n + 1);
                }}
                className="btn-marin mt-3 px-5 py-2 text-xs"
              >
                Försök igen
              </button>
            </div>
            {smakprovSektion}
          </section>
        ) : !kurs ? (
          <section className="mt-10" aria-busy="true">
            <p className="text-sm text-muted-foreground">
              Låser upp kursen — hämtar kapitlen …
            </p>
            {smakprovSektion}
          </section>
        ) : harQuiz ? (
          <KursSteg
            prenumNiva={prenumNiva}
            kurs={{
              slug: slug,
              title: kurs.title,
              chapters: kurs.chapters,
            }}
          />
        ) : (
          <KursArtiklar
            slug={slug}
            chapters={kurs.chapters}
            total={kurs.chapters.length}
            lang={lang}
            rubrik={lang === "sv" ? "Kursinnehåll" : undefined}
          />
        )}
      </KursGate>
    );
  }

  const lasUpp = () => {
    aktiveraFas2Override(); // admin-override öppnar BÅDA faserna lokalt
    setAccess(true);
  };

  // Fas 3-accent: ljus koppar (#D9A066 = 7,5:1 mot marin) — skiljer ekosystemet från Fas 2:s guld
  const accentText = fas3 ? "text-[#D9A066]" : "text-gold";
  const chipKlass = fas3
    ? "rounded-full border border-[#B07A3C]/50 bg-[#B07A3C]/10 px-3 py-1 font-medium text-[#D9A066]"
    : "rounded-full border border-[#E8C766]/40 bg-[#E8C766]/10 px-3 py-1 font-medium text-gold";

  // ── LÅST VY — SSR-default: smakprov + inbjudan vidare ──
  return (
    <div ref={lasRef} className="mt-10">
      {smakprovSektion}

      <section
        className={`marin-panel relative mt-10 overflow-hidden rounded-3xl border-2 p-6 text-center shadow-xl sm:p-10 ${
          fas3 ? "border-[#B07A3C]/60" : "border-gold/50"
        }`}
        aria-label={fas3 ? "Fas 3-kurs — inbjudan vidare" : "Fas 2-kurs — inbjudan vidare"}
      >
        {/* Lås-visualisering */}
        <p className="text-5xl" aria-hidden>
          🔒
        </p>
        <h2 className="mt-4 font-serif text-2xl font-bold leading-tight text-[#EDE6D6] sm:text-3xl">
          {fas3 ? "Fas 3 — det dynamiska ekosystemet" : "Fas 2 — den fundamentala vägen"}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#EDE6D6]/75">
          {fas3 ? (
            <>
              Välkommen vidare när du är redo. I Fas 3 börjar fundamentalanalysen röra
              sig — värde möter vågor, kapitel för kapitel. Du har just läst smakprovet;
              nedan ser du exakt vad som väntar bakom låset — innehållet stänger vi
              aldrig in, vi bjuder in till det.
            </>
          ) : (
            <>
              Välkommen vidare när du är redo. Fas 2 är den snabba fundamentala vägen
              till oberoende analytiker — och chansen att få representera AK1nvestor
              med kvalitet. Du har just läst smakprovet; nedan ser du exakt vad som
              väntar bakom låset — innehållet stänger vi aldrig in, vi bjuder in till det.
            </>
          )}
        </p>

        {/* SE KORTET — eleven får se vad som finns */}
        <div
          className={`mx-auto mt-8 max-w-2xl rounded-2xl border bg-[#081120]/60 p-5 text-left sm:p-6 ${
            fas3 ? "border-[#B07A3C]/40" : "border-[#E8C766]/30"
          }`}
        >
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${accentText}`}>
            Kurskortet — en blick på resan
          </p>
          <h3 className="mt-2 font-serif text-xl font-bold text-[#EDE6D6]">{titel}</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className={chipKlass}>📖 {kapitel} kapitel</span>
            {xp ? <span className={chipKlass}>⚡ {xp} XP</span> : null}
            <span className={chipKlass}>🎓 Fas {fas}-kurs</span>
          </div>
          {intro && (
            <p
              className={`mt-4 border-l-2 pl-4 text-sm italic leading-relaxed text-[#EDE6D6]/80 ${
                fas3 ? "border-[#B07A3C]/60" : "border-[#E8C766]/50"
              }`}
            >
              {intro}
            </p>
          )}
        </div>

        {/* VARFÖR FAS 2/3 — varför detta är nästa analytiska fas */}
        <div className="mx-auto mt-6 max-w-2xl text-left">
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${accentText}`}>
            Varför Fas {fas}?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#EDE6D6]/90">
            {fas3 ? fas3LockeradText(slug) : fas2LockeradText(slug)}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href={fas3 ? "/fas3" : "/fas2-ansok"}
            className="btn-guld-signatur inline-block px-8 py-3.5 text-sm"
          >
            {fas3 ? "Till Fas 3 — ekosystemet →" : "Ansök till Fas 2 →"}
          </Link>
          {/* Redan medlem men ej inloggad på denna enhet — lås upp gratis-kontot
              först (member_type bärs av ak1a-member, våg 78 B1). */}
          <p className="text-xs text-[#EDE6D6]/70">
            Redan Fas {fas}-medlem?{" "}
            <Link
              href={`/logga-in?next=${encodeURIComponent(
                lang === "sv" ? `/kurser/${slug}` : `/${lang}/kurser/${slug}`,
              )}`}
              className="underline hover:text-[#EDE6D6]"
            >
              Logga in
            </Link>{" "}
            för att läsa vidare.
          </p>
          {fas3 ? (
            <p className="max-w-xl text-xs leading-relaxed text-[#EDE6D6]/70">
              Fas 3 innehåller alla framtida utvecklingar — dashboard, AI-koppling och
              rapporter. Efter utbildningen kan ekosystemet fortsätta nyttjas via månadsplan.
            </p>
          ) : (
            <p className="text-xs text-[#EDE6D6]/70">
              Fas 1 förblir gratis — alltid.{" "}
              <Link href="/kurser" className="underline hover:text-[#EDE6D6]">
                Hela gratis-biblioteket
              </Link>{" "}
              väntar tills vidare, och det förblir så.
            </p>
          )}
        </div>

        {/* ADMIN-BONUS — lokal upplåsning för granskning (öppnar båda faserna) */}
        {admin && (
          <div className="mt-6 border-t border-[#E8C766]/20 pt-5">
            <button
              onClick={lasUpp}
              className="btn-marin px-5 py-2 text-xs"
              title="Sätter ak1a-fas2-override=true i localStorage"
            >
              Lås upp (admin)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
