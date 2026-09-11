import Link from "next/link";

import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { lasKorstabellGrund, lasPriser } from "@/lib/portfolj-forskning/korstabell-data";
import { lasPriserGallande } from "@/lib/variabler-lagring";
import { kr } from "@/lib/variabler";
import type { PrisNiva } from "@/lib/portfolj-forskning/korstabell-data";

/**
 * TIER-SIDA — den delade säljsidan för en portfölj-tier (våg 99 G2, bakom
 * NEXT_PUBLIC_TIER_AKTIV — grinden ägs av sid-filerna, se /portfolj-plus).
 *
 * ALLA pristal läses ur variabelregistret: strukturen (namn, beskrivningar,
 * rabatt, juridik) ur data/portfolj-system/priser.json via lasPriser() och
 * pristalen via lasPriserGallande() (Supabase-override senaste-vinner, filen
 * = fallback) — INGEN hårdkodad siffra i denna fil. Antalet bevakade bolag
 * läses ur korstabellens underlag (lasKorstabellGrund) — aldrig påhittat.
 *
 * Design: AK1A-DNA enligt /prenumeration (SeoPageShell, serif-rubriker,
 * guld-accenter, värde-chips, checklistor, juridik-block med ångerrättsrad).
 *
 * INGET betalflöde: CTA:n "Ansök om åtkomst" går till befintlig kontakt
 * (mailto) + Fas-ansökan — mänsklig aktivering, samma stomme som
 * /prenumeration:s AktiveraPanel.
 *
 * Pedagogiskt utbildningsmaterial — aldrig investeringsrådgivning (2007:528).
 */

/** Registrets tre tier-id:n (lasPriserGallande mappar dem på prisfälten). */
export type TierId = "forskning" | "forskning-plus" | "portfolj-hyra";

/** Slugs — syskon-länkarna mellan tier-sidorna använder dessa (endast
 *  renderade när tierAktiv() — ingen dödlänk i AV-läge; sidorna grindar
 *  alla tre mot samma flagga). */
const TIER_SLUGS: Record<TierId, string> = {
  forskning: "/portfolj-grund",
  "forskning-plus": "/portfolj-plus",
  "portfolj-hyra": "/portfolj-hyra",
};

/** Per-tier copy — ORD, inga pristal (priserna ägs av registret). */
const TIER_COPY: Record<
  TierId,
  {
    kortNamn: string;
    led: string;
    chips: Array<{ tal: string; etikett: string }>;
    ingar: string[];
    motor: Array<{ rubrik: string; text: string }>;
    ctaRad: string;
  }
> = {
  forskning: {
    kortNamn: "Grund",
    led: "Forskningsmotorns grundnivå: hela underlaget — poäng, vågstatus och kravkontroller — utan köp- eller säljuppmaningar.",
    chips: [
      { tal: "9", etikett: "profiler — risknivå × tillväxttakt, du väljer" },
      { tal: "AKM1", etikett: "poäng per innehav, 20 fundamentalvariabler" },
      { tal: "5", etikett: "horisonter med fundamental och teknisk vågstatus" },
      { tal: "Månadsvis", etikett: "forskningsportfölj med motiv per innehav" },
    ],
    ingar: [
      "Månadsvis forskningsportfölj i vald riskprofil",
      "AKM1-poäng per innehav — 20 fundamentalvariabler",
      "Fundamental och teknisk vågstatus per horisont",
      "Golvmarginal och kravkontroller per innehav",
      "Pedagogiskt underlag — utan köp- eller säljuppmaningar",
    ],
    motor: [
      {
        rubrik: "Bevakning",
        text: "Forskningsuniversumets samtliga mätta bolag — grundfiltret varje nivå i prisstegen bygger vidare på.",
      },
      {
        rubrik: "Analysdjup",
        text: "AKM1-poäng per innehav, fundamental och teknisk vågstatus per horisont samt golvmarginal — du ser hela underlaget och kan reproducera det själv.",
      },
      {
        rubrik: "Uppdateringar",
        text: "Månadsvis forskningsportfölj — varje innehav med motiv, vågstatus och kravkontroller redovisade.",
      },
    ],
    ctaRad: "Ansök om åtkomst till Grund-nivån",
  },
  "forskning-plus": {
    kortNamn: "Plus",
    led: "Grundnivån plus motorns löpande vakt: ersättningsförslag när strikta krav bryts, då-vs-nu-uppföljning och den samlade vågmatrisen.",
    chips: [
      { tal: "≤ 3", etikett: "ersättningsförslag per kravbrott — i samma bransch" },
      { tal: "Då vs nu", etikett: "månads-uppföljning mot förra lägesbilden" },
      { tal: "Kvartalsvis", etikett: "djupuppföljning då-vs-nu" },
      { tal: "Vågmatris", etikett: "portföljens samlade vågstatus per horisont" },
    ],
    ingar: [
      "Allt i Grund-nivån",
      "Löpande ersättningsförslag när ett innehav brutit mot profilens strikta krav — upp till tre alternativ i samma bransch med jämförelsetext",
      "Månads-uppföljning då-vs-nu — portföljen mätt mot förra lägesbilden",
      "Kvartalsvis djupuppföljning då-vs-nu",
      "Portföljens samlade vågmatris per horisont",
    ],
    motor: [
      {
        rubrik: "Bevakning",
        text: "Samma forskningsuniversum som Grund — men motorn vaktar portföljen löpande mot profilens strikta krav.",
      },
      {
        rubrik: "Analysdjup",
        text: "Grund-djupet plus ersättningsanalys vid varje kravbrott (upp till tre alternativ i samma bransch, med jämförelsetext) och portföljens samlade vågmatris per horisont.",
      },
      {
        rubrik: "Uppdateringar",
        text: "Månadsvis uppdatering med då-vs-nu-jämförelse — och kvartalsvis djupuppföljning där utvecklingen granskas extra noga.",
      },
    ],
    ctaRad: "Ansök om åtkomst till Plus-nivån",
  },
  "portfolj-hyra": {
    kortNamn: "Hyra",
    led: "Du hyr den forskningsportfölj som speglar din riskprofil — AK1A sköter omvikningar, kravkontroller och ersättningsanalys vid varje uppdatering.",
    chips: [
      { tal: "Speglad", etikett: "forskningsportfölj i din valda riskprofil" },
      { tal: "Omvikningar", etikett: "AK1A sköter — kravkontroller och ersättningsanalys" },
      { tal: "Löpande", etikett: "underhåll vid varje uppdatering" },
      { tal: "Aldrig", etikett: "förvaltning eller investeringsrådgivning (2007:528)" },
    ],
    ingar: [
      "Allt i Plus-nivån",
      "Du hyr den forskningsportfölj som speglar din valda riskprofil",
      "AK1A sköter omvikningar, kravkontroller och ersättningsanalys vid varje uppdatering",
      "Forskning och utbildning — aldrig förvaltning eller investeringsrådgivning enligt lagen (2007:528)",
    ],
    motor: [
      {
        rubrik: "Bevakning",
        text: "Samma forskningsuniversum som Plus — portföljen du hyr speglar din valda riskprofil bland motorns profiler.",
      },
      {
        rubrik: "Analysdjup",
        text: "Plus-djupet i sin helhet — och omvikningar, kravkontroller och ersättningsanalys sköts av AK1A vid varje uppdatering.",
      },
      {
        rubrik: "Uppdateringar",
        text: "Löpande vid varje uppdatering — hyrtjänsten underhåller portföljen kontinuerligt inom ramen för forskningsarbetet.",
      },
    ],
    ctaRad: "Ansök om åtkomst till Hyra-nivån",
  },
};

/** Mäta antalet bevakade bolag UR UNDERLAGET — aldrig hårdkodat. */
function lasUniversumAntal(): number | null {
  const { finns, rader } = lasKorstabellGrund();
  return finns && rader.length > 0 ? rader.length : null;
}

export async function TierSida({ tierId }: { tierId: TierId }) {
  // ── Prisunderlag: strukturen ur priser.json (lasPriser) + pristalen live
  //    via lasPriserGallande() (Supabase-override, filen = fallback) —
  //    exakt /prenumeration:s mönster (våg 79). Kastar aldrig.
  const fil = lasPriser();
  const live = await lasPriserGallande();
  const override: Record<string, { prisManad?: number; prisAr?: number }> = {
    forskning: { prisManad: live.forskningManad, prisAr: live.forskningAr },
    "forskning-plus": { prisManad: live.plusManad, prisAr: live.plusAr },
    "portfolj-hyra": { prisManad: live.hyraManad, prisAr: live.hyraAr },
  };
  const nivaer: PrisNiva[] = fil
    ? fil.nivaer.map((n) => ({ ...n, ...(override[n.id] ?? {}) }))
    : [];
  const niva = nivaer.find((n) => n.id === tierId) ?? null;
  const copy = TIER_COPY[tierId];
  const rabattProcent = fil ? Math.round(fil.rabattFas.fas2 * 100) : 0;
  const universumAntal = lasUniversumAntal();
  const mailto = `mailto:info@ak1nvestor.com?subject=${encodeURIComponent(
    `Ansökan om åtkomst — ${niva?.namn ?? tierId}`,
  )}`;

  // ── Ärligt fallback-läge: registret saknar nivån → inga påhittade priser.
  if (!niva || !fil) {
    return (
      <SeoPageShell
        breadcrumb={[
          { name: "Hem", href: "/" },
          { name: "Portföljforskning", href: "/portfolj-forskning" },
          { name: copy.kortNamn },
        ]}
        wide
      >
        <h1 className="font-serif text-4xl font-bold">{copy.kortNamn}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          Denna nivå av AK1A Portföljforskning håller på att färdigställas.
          Intresserad redan nu? Mejla{" "}
          <a href="mailto:info@ak1nvestor.com" className="underline hover:text-foreground">
            info@ak1nvestor.com
          </a>{" "}
          så berättar vi mer.
        </p>
      </SeoPageShell>
    );
  }

  const syskon = nivaer.filter((n) => n.id !== tierId);

  return (
    <SeoPageShell
      breadcrumb={[
        { name: "Hem", href: "/" },
        { name: "Portföljforskning", href: "/portfolj-forskning" },
        { name: copy.kortNamn },
      ]}
      wide
    >
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-guld-djup">
        AK1A Portföljforskning · Nivå {copy.kortNamn}
      </p>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight">
        {niva.namn}
      </h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{copy.led}</p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {niva.beskrivning}
      </p>

      {/* Pris — ur variabelregistret, aldrig hårdkodat */}
      <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-3 rounded-2xl border border-gold/30 bg-card p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            Månadspris
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-black text-gold tabular">
              {kr(niva.prisManad)}
            </span>
            <span className="text-sm text-muted-foreground">kr/mån · inkl. moms</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            Årsplan
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold tabular">{kr(niva.prisAr)}</span>
            <span className="text-sm text-muted-foreground">kr/år — ingen bindning</span>
          </p>
        </div>
        {rabattProcent > 0 && (
          <div className="ml-auto">
            <span className="rounded-full border border-bull/40 bg-bull/10 px-3 py-1 text-[11px] font-semibold text-bull">
              {rabattProcent} % rabatt för alltid — Fas 2- och Fas 3-elever
            </span>
          </div>
        )}
      </div>

      {/* Värde-chips */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {copy.chips.map((s) => (
          <div key={s.etikett} className="rounded-xl border border-gold/30 bg-card p-4">
            <div className="font-serif text-xl font-black text-gold">{s.tal}</div>
            <div className="mt-1 text-xs leading-tight text-muted-foreground">{s.etikett}</div>
          </div>
        ))}
      </div>

      {/* ── VAD MAN FÅR ───────────────────────────────────────────────────── */}
      <section className="mt-10" aria-label="Vad som ingår">
        <h2 className="font-serif text-2xl font-bold">Vad du får</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {universumAntal !== null
            ? `Forskningsmotorn bevakar ${universumAntal} mätta bolag — din nivå avgör hur djupt underlaget du ser och hur ofta det uppdateras.`
            : "Forskningsmotorn bevakar forskningsuniversumets samtliga mätta bolag — din nivå avgör hur djupt underlaget du ser och hur ofta det uppdateras."}
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ul className="space-y-2.5 rounded-xl border border-gold/30 bg-card p-6 text-sm">
            {copy.ingar.map((punkt) => (
              <li key={punkt} className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-gold" aria-hidden="true">
                  ✓
                </span>
                <span className="text-muted-foreground">{punkt}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-4 rounded-xl border border-gold/30 bg-card p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Motorns djup på denna nivå
            </p>
            {copy.motor.map((m) => (
              <div key={m.rubrik}>
                <h3 className="font-serif text-base font-bold">{m.rubrik}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — inget betalflöde, ansökan via befintlig kontakt ──────────── */}
      <section className="mt-10 rounded-2xl border-2 border-gold/60 bg-card p-6 shadow-lg sm:p-8">
        <h2 className="font-serif text-2xl font-bold">Ansök om åtkomst</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Betalflödet är inte kopplat — aktivering sker via en kort mejlväxling med
          info@ak1nvestor.com, precis som på{" "}
          <Link href="/prenumeration" className="underline hover:text-foreground">
            prenumerationssidan
          </Link>
          . {copy.ctaRad} så hör vi av oss med nästa steg.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={mailto} className="btn-marin min-h-[44px] px-6 py-2.5 text-sm">
            Ansök om åtkomst
          </a>
          <Link
            href="/fas2-ansok"
            className="min-h-[44px] rounded-md border border-gold/50 px-4 py-2.5 text-sm font-semibold hover:bg-gold/10"
          >
            eller sök Fas 2 {rabattProcent > 0 ? `— ${rabattProcent} % rabatt för alltid` : ""}
          </Link>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Ingen bindningstid på månadsplanen; årsplanen förnyas bara efter aktivt val.
          Priser enligt prisunderlag{" "}
          {fil.uppdaterad ? `uppdaterat ${fil.uppdaterad}` : "ur variabelregistret"} —
          ändras på ett enda ställe, aldrig här.
        </p>
      </section>

      {/* ── PRISSTEGEN — syskon-nivåerna (länkas ENDAST mellan grindade sidor) ── */}
      {syskon.length > 0 && (
        <section className="mt-10" aria-label="Övriga nivåer">
          <h2 className="font-serif text-2xl font-bold">Prisstegens övriga nivåer</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {syskon.map((s) => (
              <Link
                key={s.id}
                href={TIER_SLUGS[s.id as TierId] ?? "/portfolj-forskning"}
                className="group flex flex-col rounded-xl border border-gold/30 bg-card p-5 transition-colors hover:border-gold/60"
              >
                <h3 className="font-serif text-lg font-bold leading-snug group-hover:text-gold">
                  {s.namn}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {TIER_COPY[s.id as TierId]?.led ?? s.beskrivning}
                </p>
                <p className="mt-3 text-sm font-semibold">
                  {kr(s.prisManad)} kr/mån
                  <span className="ml-1 font-normal text-muted-foreground">
                    · {kr(s.prisAr)} kr/år
                  </span>
                </p>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs italic text-muted-foreground">
            Samtliga nivåer sida vid sida finns på{" "}
            <Link href="/prenumeration" className="underline hover:text-foreground">
              prenumerationssidan
            </Link>
            .
          </p>
        </section>
      )}

      {/* ── JURIDIK — utbildningsformulering, ingen rådgivning, ångerrätt ── */}
      <section className="mt-10 rounded-xl border border-gold/30 bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-bold">Utbildning och forskning — inte rådgivning</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {fil.juridiskFotnot}
        </p>
        <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2">
          {[
            "Inga personliga råd — vi säger aldrig vad DU bör köpa eller sälja",
            "Inga förvaltningstjänster — vi rör aldrig dina pengar",
            "Alla antaganden och källor redovisas öppet — du kan reproducera själv",
            "Förnyelse bara efter aktivt val (opt-in) — aldrig tyst automatik",
          ].map((punkt) => (
            <li key={punkt} className="flex gap-2">
              <span className="text-gold" aria-hidden="true">
                ✓
              </span>
              <span>{punkt}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-lg border border-gold/30 bg-paper p-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Ångerrätt och digitalt innehåll.</strong> Som
          konsument har du 14 dagars ångerrätt enligt lagen (2005:59) om distansavtal
          och avtal utanför affärslokaler — men för digitalt innehåll som levereras
          omedelbart upphör ångerrätten när leveransen påbörjats med ditt uttryckliga
          samtycke. Hur det fungerar i praktiken står i{" "}
          <Link href="/villkor#sektion-6" className="underline hover:text-foreground">
            användarvillkoren (sektion 6)
          </Link>
          .
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/finansiell-policy"
            className="rounded-md border border-gold/50 px-4 py-2 font-semibold hover:bg-gold/10"
          >
            Finansiell policy
          </Link>
          <Link
            href="/transparens"
            className="rounded-md border border-gold/50 px-4 py-2 font-semibold hover:bg-gold/10"
          >
            Transparens &amp; GDPR
          </Link>
          <Link
            href="/villkor"
            className="rounded-md border border-gold/50 px-4 py-2 font-semibold hover:bg-gold/10"
          >
            Användarvillkor
          </Link>
        </div>
      </section>
    </SeoPageShell>
  );
}
