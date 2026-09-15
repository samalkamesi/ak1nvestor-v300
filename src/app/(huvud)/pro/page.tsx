import type { Metadata } from "next";
import { CsvImport } from "@/components/ak1a/pro/csv-import";
import { Morgonrond } from "@/components/ak1a/pro/morgonrond";
import { lasVagvalideringTraff } from "@/components/ak1a/pro/morgonrond-data";
import { PRISER, kr } from "@/lib/variabler";
import { b2bAktiv } from "@/lib/b2b-status";

export const dynamic = "force-static";
// Prissida (PRISER.b2bAnalytiker SSR:as) — revalidate=300 som produktfamiljen
// /fas2-ansok, /fas3, /medlemskap, /prenumeration; årslåset (o10 §2) dör även här.
export const revalidate = 300;

// V86 B2B-residual 2+3: ingen egen robots — layoutens b2bAktiv()-grind gäller
// hela trädet. Metadata (titel + pris copy i description) sätts ENDAST när
// B2B är PÅ; i AV-läge ärar sidan layoutens neutrala "under uppbyggnad"-meta.
export const metadata: Metadata = b2bAktiv()
  ? {
      title: "AK1A PRO — Analytikerplattformen | Bygg institutionella rapporter",
      description: `AK1A PRO är den skilda B2B-världen: importera en portfölj via CSV, kör AKM1 · AK1TS · Konfluens som rättighetsstyrd metodik-modul och bygg institutionella rapporter — white-label redo. Från ${PRISER.b2bAnalytiker} kr/mån/seat. Pedagogisk analys — inte investeringsråd.`,
      keywords: [
        "AK1A PRO",
        "analytikerplattform",
        "B2B finansanalys",
        "portfölj CSV-import",
        "rapportmallar",
        "white-label",
        "metodik-licens",
      ],
    }
  : {};

/**
 * /pro — /PRO-ÖVERSIKTEN med MORNONRONDEN (B2B-BESLUT §4a/§4e + §7 steg 3).
 *
 * En sida, en berättelse: vad plattformen är (hero) → vad den gör (tre kort)
 * → att den FUNKERAR (kärnan: CSV-import direkt på sidan) → RÅDGIVARENS DAG
 * (morgonronden: fyra kort med riktig data — träff-%, regim, veckans
 * research, screening) → vad den kostar (tre nivåer) → vad den är för något
 * (disclaimer + Fas 3-förtur). Landningssidans hero + tre ben + CsvImport
 * är översiktens introduktion OVANFÖR morgonronden (BESLUT §4e).
 *
 * Träff-% läses server-side ur vågvalideringsrapporten (ingen läs-API finns)
 * vid build; regim + veckans research hämtas live av korten (forskningslage-
 * kortets mönster). force-static kvar (BESLUT §7 steg 1 v).
 *
 * Allt AK1A-DNA: marin-panel, guld, serif, .btn-marin — samma papper och
 * pennskaft som den publika världen, men väggarna är mörkare här.
 */

/** De tre korten — plattformens tre ben (forskning-b2b 5.3: MVP-steg 1–2). */
const KORT = [
  {
    ikon: "🗂",
    rubrik: "CSV-import",
    text: "Dra in portföljen — motorerna gör resten. Klistra en depå-export (ticker, antal, pris) eller välj en fil: normalisering, vikter och dubbla motorlöp sker på stället. Instrument och vikter — aldrig personuppgifter.",
    fot: "Normalisering på sekunder · max 10 innehav per analys",
  },
  {
    ikon: "📜",
    rubrik: "Rapportmallar",
    text: "Tre AK1A-DNA-mallar, white-label redo: Portföljöversikt (20×5-värmematris), Djupanalys-kort per innehav och Konfluens-sidan (värde-grind-status). Firmans logo och kolofon — metod- och ansvarsdeklarationen förblir mal-låst.",
    fot: "Tre låsta mallar · drag-och-släpp senare",
  },
  {
    ikon: "🔑",
    rubrik: "Metodik-modulen",
    text: "AKM1+AK1TS+Konfluens i varje analys — den hierarkiska, deterministiska metodiken som rättighetsstyrd modul. Samma data ger samma vågklass, varje gång: en reproducerbarhet ingen data-vanthet kan kopiera utan att kopiera metoden.",
    fot: "Deterministisk · falsifierbar · rättighetsstyrd",
  },
] as const;

/** Pris-trappan (forskning-b2b 5.2) — per analytiker-seat, kr/mån.
 *  VÅG 77: priserna interpolerar ur variabelregistret (priser.json →
 *  @/lib/variabler) — ändra pris i JSON-filen, aldrig här. */
const NIVAER = [
  {
    banderoll: "PRO ANALYTIKER",
    tagline: "Analytikerversikt",
    pris: String(PRISER.b2bAnalytiker),
    typ: "kr/mån · 1 seat",
    punkter: [
      "Obegränsad CSV-portföljimport",
      "Tre låsta AK1A-rapportmallar",
      "20 rapporter/mån · AK1A-branding",
      "Fas 3-certifierad? 299 kr/mån det första året",
    ],
    lyft: false,
  },
  {
    banderoll: "PRO STUDIO",
    tagline: "Pro-rapporter",
    pris: kr(PRISER.b2bStudio),
    typ: "kr/mån · 5 seats",
    punkter: [
      "Allt i Pro Analytiker",
      "White-label — logo, färger, kolofon",
      "100 rapporter/mån · delade mallbibliotek",
      "Portföljöversikts-sidor · prioriterad support",
    ],
    lyft: true,
  },
  {
    banderoll: "PRO INSTITUTION",
    tagline: "White-label & metodik-licens",
    pris: kr(PRISER.b2bInstitution),
    typ: "kr/mån · 10+ seats · årsbindning",
    punkter: [
      "Allt i Pro Studio — obegränsat rapportskapande",
      "Rättighetsstyrd metodikmodul (API-utdata)",
      "SLA · onboarding av analysavdelningen",
      "Den blå hav-produkten — ingen motsvarighet på marknaden",
    ],
    lyft: false,
  },
] as const;

export default function ProPage() {
  // V86 B2B-residual 4 (VIKTIGAST): sidan serialiseras in i RSC-flight-payloaden
  // även när layoutens grind inte renderar {children} — early-return i AV-läge
  // före all datahämtning (lasVagvalideringTraff) håller cockpit-markupen ur
  // payloaden. Layouten renderar "Under uppbyggnad"-substitutet.
  if (!b2bAktiv()) return null;

  // Vågvalideringens träff-% — server-side ur rapportfilen (build/request-vägen).
  const traff = lasVagvalideringTraff();

  return (
    <>
      {/* ═══ HERO — marin fullbleed-vägg, startskottet ═══ */}
      <section className="marin-panel relative overflow-hidden border-b border-gold/40">
        {/* Guld-korn — djup i väggen (samma radiala signatur som paper-texture) */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 12%, rgba(232,199,102,0.07), transparent 42%), radial-gradient(circle at 82% 88%, rgba(232,199,102,0.05), transparent 42%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-[#E8C766]/90">
            B2B · Rådgivare · Analytiker · Institutioner
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-[#EDE6D6] sm:text-5xl">
            AK1A PRO — Analytikerplattformen
          </h1>
          <p className="mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
            Bygg institutionella rapporter på AKM1 · AK1TS · Konfluens — metodiken som
            rättighetsstyrd modul.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#EDE6D6]/80">
            Alla plattformar säljer data och redskap. PRO säljer metodiken: ett hierarkiskt,
            deterministiskt analysramverk som ryggrad i varje rapport — reproducerbar, granskningsbar,
            svensk. Importera en portfölj och se den genom AK1A:s glasögon inom två minuter.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#kom-igang" className="btn-guld-signatur min-h-[44px] px-6 py-3 text-sm">
              Kom igång
            </a>
            <a
              href="mailto:info@ak1nvestor.com?subject=Boka%20demo%20%E2%80%94%20AK1A%20PRO"
              className="btn-marin min-h-[44px] px-6 py-3 text-sm"
              style={{ background: "transparent", color: "#E8C766" }}
            >
              Boka demo
            </a>
          </div>

          <div className="hjarlinje mt-10" />
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[11px] uppercase tracking-wider text-[#EDE6D6]/60">
            <span>CSV-import på 2 minuter</span>
            <span>Tre låsta AK1A-mallar</span>
            <span>White-label redo</span>
            <span>Från {PRISER.b2bAnalytiker} kr/mån/seat</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* ═══ TRE KORT — plattformens tre ben ═══ */}
        <section id="plattformen" className="scroll-mt-24">
          <h2 className="font-serif text-3xl font-bold">En plattform, tre ben</h2>
          <p className="mt-2 max-w-2xl text-sm italic leading-relaxed text-muted-foreground">
            Minsta värde först: importen rör vid motorerna redan i MVP — mallarna och
            metodik-licensen byggs på samma ryggrad.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {KORT.map((k) => (
              <article
                key={k.rubrik}
                className="gravor-ram flex flex-col rounded-xl bg-card p-6"
              >
                <span className="text-2xl" aria-hidden>{k.ikon}</span>
                <h3 className="mt-3 font-serif text-xl font-bold">{k.rubrik}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{k.text}</p>
                <p className="mt-4 border-t border-gold/20 pt-3 font-mono text-[10px] uppercase tracking-wider text-guld-djup">
                  {k.fot}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══ KÄRNAN — fungerande CSV-import (inte bara mockup) ═══ */}
        <section id="kom-igang" className="mt-16 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl font-bold">Kom igång — direkt här</h2>
              <p className="mt-2 max-w-2xl text-sm italic leading-relaxed text-muted-foreground">
                Ingen mockup: kärnan nedan kör de riktiga motorerna. Importera en portfölj och
                analysera — konfluens-tabellen och universum-sammanfattningen är samma utdata som
                rapportsiderna byggs på.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <CsvImport />
          </div>
        </section>

        {/* ═══ MORNONRONDEN — rådgivarens fyra kort, översiktens kärna (§4a) ═══ */}
        <section id="morgonronden" className="mt-16 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl font-bold">Morgonronden</h2>
              <p className="mt-2 max-w-2xl text-sm italic leading-relaxed text-muted-foreground">
                Före kaffet är klart: vågmotorns ärliga träff-%, regimen i underlaget,
                veckans research och vägen in i dina screeningar. Fem sekunder — sedan
                vet du var dagen börjar.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Morgonrond traff={traff} />
          </div>
        </section>

        {/* ═══ PRIS-TRAPPAN — tre nivåer per seat ═══ */}
        <section id="priser" className="mt-16 scroll-mt-24">
          <h2 className="font-serif text-3xl font-bold">Tre nivåer — per analytiker-seat</h2>
          <p className="mt-2 max-w-2xl text-sm italic leading-relaxed text-muted-foreground">
            Mellan TIKR och Koyfin Advisor i priset — men med rapportbyggare, metodik och
            white-label som ingen av dem har. Transparent flat-fee, aldrig rev-share.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {NIVAER.map((n) => (
              <article
                key={n.banderoll}
                className={`flex flex-col rounded-xl bg-card p-6 ${
                  n.lyft ? "border-2 border-gold shadow-lg" : "border border-gold/30"
                }`}
              >
                {n.lyft && (
                  <span className="mb-3 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Rådgivarens nivå
                  </span>
                )}
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-guld-djup">
                  {n.banderoll}
                </p>
                <p className="mt-1 text-xs italic text-muted-foreground">{n.tagline}</p>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="tabular font-serif text-4xl font-black text-foreground">{n.pris}</span>
                  <span className="text-xs text-muted-foreground">{n.typ}</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {n.punkter.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-gold">✓</span>
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:info@ak1nvestor.com?subject=AK1A%20PRO%20%E2%80%94%20intresse%20niv%C3%A5"
                  className={`mt-6 min-h-[44px] px-4 py-2.5 text-center text-sm ${
                    n.lyft
                      ? "rounded-md bg-gold font-semibold text-primary-foreground hover:opacity-90"
                      : "rounded-md border border-gold/50 font-semibold hover:bg-gold/10"
                  }`}
                >
                  {n.pris === String(PRISER.b2bAnalytiker) ? "Kom igång som analytiker" : "Boka demo"}
                </a>
              </article>
            ))}
          </div>

          <p className="mt-4 text-[11px] italic leading-relaxed text-muted-foreground">
            Alla nivåer: svensk-språkigt, faktura per seat, inga dolda data-avgifter i nivå 1–2 —
            rapporten bär metodikens utdata (klasser, poäng, vågstruktur), inte vidaredistribuerad
            rådata. Institution-nivån tecknas på avtal med årsbindning.
          </p>
        </section>

        {/* ═══ FAS 3-FÖRTUR + DISCLAIMER — den mal-låsta grunden ═══ */}
        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="gravor-ram rounded-xl bg-card p-6">
            <h3 className="font-serif text-lg font-bold">Fas 3-certifierade analytiker</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Fas 3-certifierade analytiker får <strong className="text-foreground">bevislig förtur</strong>:
              metodiken är redan inövad, noll utbildningskostnad, och vägen från certifiering till
              Pro Analytiker är rak. Introduktionspriset 299 kr/mån det första året dokumenteras i
              ert certifikat — förtur som går att bevisa, inte bara lovas.
            </p>
          </div>
          <div className="rounded-xl border border-gold/30 bg-gold/10 p-6">
            <h3 className="font-serif text-lg font-bold text-guld-djup">Vad PRO inte är</h3>
            <p className="mt-2 text-sm italic leading-relaxed text-guld-djup">
              Pedagogisk analys — inte investeringsråd. PRO säljer analysverktyg och metodik, aldrig
              rådgivning: inga personliga rekommendationer, inga klient-omdömen, aldrig &quot;lämplig
              för din klient&quot;. Ansvars- och metoddeklarationen följer varje export och kan aldrig
              suddas ut — inte ens av white-label.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
