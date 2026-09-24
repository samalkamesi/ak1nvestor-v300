import type { Metadata } from "next";
import Link from "next/link";
import { lasPriser, type PrisNiva } from "@/lib/portfolj-forskning/korstabell-data";
import { kr } from "@/lib/variabler";
import { lasPriserGallande, type PriserGallande } from "@/lib/variabler-lagring";
import { b2bAktiv } from "@/lib/b2b-status";

// VÅG 79 (admin-mega steg 1): pristalen läses live via lasPriserGallande()
// (Supabase-override senaste-vinner; priser.json = fallback — ÄNDRA PRIS i
// panelen/filen, aldrig här). ISR: ändring syns ≤ 300 s.
export const revalidate = 300;

// V86 P1 (audit 5.3) + B2B-residual 2+3: ingen egen robots-rad — layoutens
// b2bAktiv()-grind (noindex i AV-läge) är robots-källan för hela /pro-trädet.
// Metadata sätts ENDAST när B2B är PÅ; i AV-läge gäller layoutens neutrala
// "AK1A PRO — under uppbyggnad"-titel i head (pris-copy läcker aldrig).
export const metadata: Metadata = b2bAktiv()
  ? {
      title: "Priser — AK1A PRO",
      description:
        "AK1A PRO i tre nivåer per analytiker-seat: Pro Analytiker, Pro Studio och Pro Institution — transparent flat-fee, aldrig rev-share. Priser exkl. moms. Pedagogisk analys — inte investeringsråd.",
    }
  : {};

/**
 * /pro/priser — PRISMODELL ENLIGT BESLUT PUNKT 5 (VÅG 61 bygg-4, §4e).
 *
 * Alternativ A (b4-rekommendationen, B2B-BESLUT §3.4): flat kr/mån/seat
 * per trappan + engångs-onboarding på Institution (avklippt vid
 * 2-årsbindning). AUM-/rev-share AVRÅTT permanent (FORBUD 3 — transparen-
 * slöftet + compliance-renhet mot oberoende rådgivare). Fas 3-certifierad:
 * introduktionspris första året. Privatsidans nivåer orörda (P4).
 *
 * KÄLLA FÖR SIFFRORNA (VÅG 77 — Excel-beroendet): data/portfolj-system/
 * priser.json:s b2b-sektion, interpolerad via src/lib/variabler.ts
 * (PRISER.b2b*). Ändra pris i JSON-filen — aldrig här. Slutligt
 * prisbeslut: kundägaren (K-B2B:2).
 *
 * K7-COPY (ärlighet i löfte vs leverans): rapportkvoterna formuleras
 * "20/100/obegränsat rapporter/mån — utskriftsklassat dokument (PDF-export
 * på väg)" — ALDRIG "PDF-rapporter" förrän server-PDF finns (fas 3).
 *
 * B2B-notering: priserna redovisas EXKL. MOMS (K-B2B:3 — svensk moms vid
 * teckning tillkommer; omvänd skattskyldighet kan gälla utlandsteckning).
 * Teckningsflödet väntar på G2-grinden (villkor + jurist + fakturaflöde) —
 * CTA:n är därför KONTAKT (mailto), aldrig en köpknapp.
 *
 * Skalet ägs av ../layout.tsx (ProShell) — INTE SeoPageShell.
 */

/** Engångs-onboarding på Institution (avklippt vid 2-årsbindning — §3.4).
 *  Priset läses live i komponenten (PRISER.b2bOnboarding via lagret). */

/** Mallen för de tre pro-nivåerna (K7-justerad copy i punkterna).
 *  VÅG 77 (variabelregistret) + VÅG 79 (live): priserna interpolerar ur
 *  variabellagret (lasPriserGallande — Supabase-override, priser.json =
 *  fallback) — ÄNDRA PRIS I panelen/data/portfolj-system/priser.json,
 *  aldrig här (Excel-beroendet). */
type ProNiva = {
  id: string;
  banderoll: string;
  tagline: string;
  pris: number;
  typ: string;
  punkter: string[];
  lyft: boolean;
  /** Källa — dokumenterad per rad. */
  kalla: string;
};

function proNivaerDefault(p: PriserGallande): ProNiva[] {
  return [
    {
      id: "pro-analytiker",
      banderoll: "PRO ANALYTIKER",
      tagline: "Analytikerversikt",
      pris: p.b2bAnalytiker,
      typ: "kr/mån · 1 seat · exkl. moms",
      punkter: [
        "Obegränsad CSV-portföljimport (instrument + vikter)",
        "Tre låsta mallar i Rapportverkstan + mötespaket-A4",
        "20 rapporter/mån — utskriftsklassat dokument (PDF-export på väg)",
        `Fas 3-certifierad? ${kr(p.fas3IntroManad)} kr/mån det första året`,
      ],
      lyft: false,
      kalla: "B2B-BESLUT §3.4 alternativ A (flat kr/mån/seat) — variabellagret (priser.json + override)",
    },
    {
      id: "pro-studio",
      banderoll: "PRO STUDIO",
      tagline: "Rådgivarens nivå",
      pris: p.b2bStudio,
      typ: "kr/mån · 5 seats · exkl. moms",
      punkter: [
        "Allt i Pro Analytiker",
        "White-label — logo, färger, kolofon (lägger till, subtraherar aldrig)",
        "100 rapporter/mån — utskriftsklassat dokument (PDF-export på väg)",
        "Delade mallbibliotek · prioriterad support",
      ],
      lyft: true,
      kalla: "B2B-BESLUT §3.4 alternativ A (flat kr/mån/seat) — variabellagret (priser.json + override)",
    },
    {
      id: "pro-institution",
      banderoll: "PRO INSTITUTION",
      tagline: "White-label & metodik-licens",
      pris: p.b2bInstitution,
      typ: "kr/mån · 10+ seats · årsbindning · exkl. moms",
      punkter: [
        "Allt i Pro Studio — obegränsat antal rapporter/mån",
        "Rättighetsstyrd metodikmodul (API-utdata)",
        `SLA · onboarding av analysavdelningen (engång ${kr(p.b2bOnboarding)} kr)`,
        "Metod- och ansvarsdeklarationen mal-låst — även för Institution",
      ],
      lyft: false,
      kalla: "B2B-BESLUT §3.4 alternativ A (flat + onboarding) — variabellagret (priser.json + override)",
    },
  ];
}

/**
 * Läs pro-nivåer ur priser.json om de finns (id med "pro"-prefix) — annars
 * null och sidan faller tillbaka på PRO_NIVAER med dokumenterad källa.
 * Ärlig bro: priser.json:s privata nivåer (inkl. moms) läses ALDRIG in här.
 */
function lasProNivaerUrFil(): ProNiva[] | null {
  const priser = lasPriser();
  if (!priser) return null;
  const pros = priser.nivaer.filter((n: PrisNiva) => /^pro[-_]/i.test(n.id));
  if (pros.length === 0) return null;
  // Filen är sanningskällan när den väl bär pro-nivåer — mappa rakt av.
  return pros.map((n) => ({
    id: n.id,
    banderoll: n.namn.toUpperCase(),
    tagline: "",
    pris: n.prisManad,
    typ: "kr/mån · exkl. moms",
    punkter: [n.beskrivning],
    lyft: false,
    kalla: `data/portfolj-system/priser.json (id ${n.id}, uppdaterad ${priser.uppdaterad || "odaterad"})`,
  }));
}

/** Kontakta-CTA:er — mailto enligt BESLUT §4e (teckning väntar på G2). */
const KONTAKT_MAILTO =
  "mailto:info@ak1nvestor.com?subject=AK1A%20PRO%20%E2%80%94%20intresse%20(%C3%B6nskad%20niv%C3%A5)";

export default async function ProPriserPage() {
  // V86 B2B-residual 4 (VIKTIGAST): Next renderar+serialiserar sidkomponenten
  // för RSC-flight-payloaden ÄVEN när layoutens grind inte renderar {children}
  // — därför early-return FÖRE all datahämtning i AV-läge: varken pristalen
  // (lasPriserGallande) eller cockpit-markupen kan då hamna i flight-payloaden
  // eller köras i onödan. Layouten renderar "Under uppbyggnad"-substitutet.
  if (!b2bAktiv()) return null;

  // Pris-talen live ur variabellagret (Supabase-override senaste-vinner,
  // filen = fallback — kastar aldrig).
  const PRISER = await lasPriserGallande();
  const franFil = lasProNivaerUrFil();
  const nivaer = franFil ?? proNivaerDefault(PRISER);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-guld-djup">
        AK1A PRO · Priser
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold">
        Tre nivåer — per analytiker-seat
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Transparent flat-fee, aldrig rev-share: samma metodik oavsett hur stora
        klientportföljer du bygger rapporter för. Mellan TIKR och Koyfin Advisor
        i priset — men med rapportbyggare, metodik och white-label som ingen av
        dem har. <strong className="text-foreground">Alla priser exkl. moms</strong> (B2B;
        svensk moms tillkommer vid teckning).
      </p>

      {/* ── Pris-trappan ── */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {nivaer.map((n) => (
          <article
            key={n.id}
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
            {n.tagline && <p className="mt-1 text-xs italic text-muted-foreground">{n.tagline}</p>}
            <p className="mt-4 flex items-baseline gap-2">
              <span className="tabular font-serif text-4xl font-black text-foreground">
                {n.pris.toLocaleString("sv-SE")}
              </span>
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
            <p className="mt-3 text-[10px] italic leading-snug text-muted-foreground" title={n.kalla}>
              Källa: {n.kalla}
            </p>
            <a href={KONTAKT_MAILTO} className="btn-marin mt-5 inline-flex min-h-[44px] items-center justify-center px-4 py-2.5 text-sm">
              Kontakta oss — {n.banderoll.toLowerCase()}
            </a>
          </article>
        ))}
      </div>

      {/* ── Onboarding + Fas 3-förtur ── */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="gravor-ram rounded-xl bg-card p-6">
          <h2 className="font-serif text-lg font-bold">
            Onboarding — Institution
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <span className="tabular font-mono font-bold text-foreground">
              {PRISER.b2bOnboarding.toLocaleString("sv-SE")} kr
            </span>{" "}
            engångsvis. Engångs-onboarding av analysavdelningen — avklippt vid
            2-årsbindning. Standard i B2B SaaS —
            analysavdelningens upplärning i metodiken och white-label-setup
            betalas en gång, inte varje månad.
          </p>
        </div>
        <div className="gravor-ram rounded-xl bg-card p-6">
          <h2 className="font-serif text-lg font-bold">Fas 3-certifierade analytiker</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <span className="tabular font-mono font-bold text-foreground">
              {PRISER.fas3IntroManad} kr/mån
            </span>{" "}
            det första året — bevislig förtur dokumenterad i certifikatet.
            Metodiken är redan inövad, noll utbildningskostnad, och vägen från
            certifiering till Pro Analytiker är rak.
          </p>
        </div>
      </section>

      {/* ── Vad priserna INTE är (ärlighet-blocket) ── */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gold/30 bg-gold/10 p-6">
          <h2 className="font-serif text-lg font-bold text-guld-djup">Aldrig rev-share</h2>
          <p className="mt-2 text-sm italic leading-relaxed text-guld-djup">
            Priset följer aldrig förvaltat kapital eller klientantal — AUM-prissättning
            är avrått permanent (BESLUT FORBUD 3): den bryter transparenslöftet och ger
            inducement-optik i kundernas tillsyn. AK1A betalar heller aldrig referral
            till rådgivare — oberoende rådgivares förbud mot tredjepartsersättningar.
          </p>
        </div>
        <div className="gravor-ram rounded-xl bg-card p-6">
          <h2 className="font-serif text-lg font-bold">Teckning &amp; fakturering</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Teckningsbara avtal öppnas vid G2-grinden: publicerade B2B-villkor,
            juristgranskade disclaimers och faktura-/momsflöde på plats. Tills dess
            svarar vi gärna på{" "}
            <a href={KONTAKT_MAILTO} className="font-semibold text-gold underline underline-offset-2">
              info@ak1nvestor.com
            </a>{" "}
            — eller boka en demo och se mötespaketet byggas på demoklienten.
          </p>
          {/* G2-juridikpaketet (våg 66): dokumenten är publicerade och länkade —
              B2B-villkoren som PRO-sektion på /villkor (en sanningskälla),
              DPA-mallen som dokument via /api/pro/dpa-mall. Utkast tills
              juristgranskningen (K-B2B:1) är godkänd. */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Underlagen:{" "}
            <Link
              href="/villkor#pro-villkor"
              className="font-semibold text-gold underline underline-offset-2"
            >
              B2B-villkoren (PRO-sektionen på villkorssidan)
            </Link>{" "}
            samt{" "}
            <a
              href="/api/pro/dpa-mall"
              className="font-semibold text-gold underline underline-offset-2"
            >
              DPA-mallen enligt GDPR art 28 (underbiträdeslista och
              incidentflöde ingår)
            </a>{" "}
            — båda utkast till granskning av er jurist.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-guld-djup">
            Rapporter/mån = utskriftsklassat dokument · PDF-export på väg (fas 3)
          </p>
        </div>
      </section>

      <p className="mt-10 text-xs italic text-muted-foreground">
        Pedagogisk forskning — inte investeringsrådgivning (2007:528). Slutligt
        prisbeslut: kundägaren (K-B2B:2).
      </p>
    </div>
  );
}
