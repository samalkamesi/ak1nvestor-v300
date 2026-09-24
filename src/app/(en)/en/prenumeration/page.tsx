import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { lasPriser } from "@/lib/portfolj-forskning/korstabell-data";
import { NivaKort } from "@/components/ak1a/prenumeration/niva-kort";
import { RabattBand } from "@/components/ak1a/prenumeration/rabatt-band";
import { AktiveraPanel } from "@/components/ak1a/prenumeration/aktivera-panel";
import { spegelMetadata } from "@/lib/spegel-metadata";

export const dynamic = "force-static";

/**
 * /en/prenumeration — full mirror of the Swedish /prenumeration flow page
 * (wave 51, agent S3). All page texts are translated to English; price
 * figures are read at build time from data/portfolj-system/priser.json via
 * lasPriser() — no invented amounts. The interactive level cards, discount
 * band and activation panel are reused as-is (client components); their
 * built-in labels remain Swedish until phase 3 of the language plan, while
 * the checklists passed from this server page are translated. Product names
 * ("Portföljforskning Grund" etc.) are kept in Swedish, like course and book
 * titles. Swedish statute names are cited in the original with an English
 * explanation.
 */

const priser = lasPriser();
const grundNiva = priser?.nivaer.find((n) => n.id === "forskning") ?? priser?.nivaer[0];
const rabattProcent = priser ? Math.round(priser.rabattFas.fas2 * 100) : 0;

export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "prenumeration",
  title: "Subscription — research-based portfolio monitoring | AK1A",
  description: grundNiva
    ? `Three tiers from SEK ${grundNiva.prisManad}/month: a monthly research portfolio (10 sectors × 10 companies) with AKM1 scores, fundamental and technical wave status, then-vs-now follow-up and replacement suggestions when strict requirements are broken. Phase 2 or Phase 3 student? ${rabattProcent} % off forever — your status is recognised automatically. Research, not advice.`
    : "Three tiers of research-based portfolio monitoring: AKM1 scores, wave status per horizon, then-vs-now follow-up and replacement suggestions. Phase 2 and Phase 3 students get a discount forever. Research — not advice.",
  keywords: [
    "portfolio research",
    "stock analysis subscription",
    "research portfolio",
    "AKM1 portfolio",
    "portfolio monitoring",
    "AK1A Research Lab",
  ],
});

/** Checklists per tier — built from the priser.json descriptions + extended. */
const INGAR_PER_NIVA: Record<string, string[]> = {
  forskning: [
    "Monthly research portfolio — 10 sectors × 10 companies",
    "Choose risk level (conservative, balanced, growth) and growth pace (calm, steady, aggressive) — 9 profiles",
    "AKM1 score per holding",
    "Fundamental and technical wave status per horizon",
    "Floor margin and requirement checks per holding",
    "Educational material — no prompts to buy or sell",
  ],
  "forskning-plus": [
    "Everything in the Basic tier",
    "Replacement suggestions when a holding has broken the profile's strict requirements — up to three alternatives in the same sector with comparison text",
    "Monthly then-vs-now follow-up — the portfolio measured against the previous picture",
    "Quarterly deep then-vs-now follow-up",
    "The portfolio's combined wave matrix per horizon",
  ],
  "portfolj-hyra": [
    "Everything in the Plus tier",
    "You rent the research portfolio that mirrors your chosen risk profile",
    "AK1A manages rebalancing, requirement checks and replacement analysis at every update",
    "Research and education — never management or investment advice under the Swedish Securities Market Act (lagen (2007:528))",
  ],
};

export default function PrenumerationPageEn() {
  // ── Honest fallback: priser.json missing/invalid → no invented prices.
  if (!priser || priser.nivaer.length === 0) {
    return (
      <SeoPageShell lang="en" breadcrumb={[{ name: "Home", href: "/en" }, { name: "Subscription" }]} wide>
        <h1 className="font-serif text-4xl font-bold">Subscription</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          AK1A Portfolio Research — research-based portfolio monitoring, not
          advice. The price list is being set and will be published here
          shortly. Interested already? Email{" "}
          <a href="mailto:info@ak1nvestor.com" className="underline hover:text-foreground">
            info@ak1nvestor.com
          </a>{" "}
          and we will tell you more.
        </p>
      </SeoPageShell>
    );
  }

  const { nivaer, rabattFas, uppdaterad } = priser;
  const exempelNiva = grundNiva ?? nivaer[0];
  const mittId = nivaer[1]?.id; // the middle card is marked "Most chosen"

  return (
    <SeoPageShell breadcrumb={[{ name: "Home", href: "/en" }, { name: "Subscription" }]} wide>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight">
        Research-based portfolio monitoring — not advice.
      </h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
        <strong className="text-foreground">AK1A Portfolio Research</strong>{" "}
        (Portföljforskning) follows a research portfolio for you — monthly,
        systematically and with every number reported. You get the entire
        basis: scores, wave status, requirement checks and what has changed
        since last time. We never issue prompts to buy or sell — you make your
        own decisions, on a better basis.
      </p>

      {/* Value proposition chips */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { tal: "10 × 10", etikett: "sectors × companies in the research universe" },
          { tal: "AKM1", etikett: "score per holding — 20 fundamental variables" },
          { tal: "5", etikett: "horizons with fundamental + technical wave status" },
          { tal: "Then vs now", etikett: "monthly follow-up — what has changed since last time?" },
          { tal: "≤ 3", etikett: "replacement suggestions in the same sector when strict requirements are broken" },
          { tal: `${rabattProcent} %`, etikett: `discount forever for Phase 2 and Phase 3 students` },
        ].map((s) => (
          <div key={s.etikett} className="rounded-xl border border-gold/30 bg-card p-4">
            <div className="font-serif text-2xl font-black text-gold">{s.tal}</div>
            <div className="mt-1 text-xs leading-tight text-muted-foreground">{s.etikett}</div>
          </div>
        ))}
      </div>

      {/* ── DISCOUNT BAND ─────────────────────────────────────────────────── */}
      <div className="mt-10">
        <RabattBand rabattFas={rabattFas} exempelNiva={exempelNiva} />
      </div>

      {/* ── TIER CARDS ────────────────────────────────────────────────────── */}
      <section className="mt-8" aria-label="Subscription tiers">
        <h2 className="font-serif text-2xl font-bold">Three tiers — open to everyone</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Every tier is available with a monthly and an annual price. The
          Phase 2 and Phase 3 student discount applies to all tiers and both
          periods — forever.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {nivaer.map((niva) => (
            <NivaKort
              key={niva.id}
              niva={niva}
              rabattFas={rabattFas}
              markerad={niva.id === mittId}
              ingar={INGAR_PER_NIVA[niva.id] ?? [niva.beskrivning]}
            />
          ))}
        </div>

        {/* Price note — translated equivalent of the priser.json note
            (data/portfolj-system/priser.json, updated 2026-09-01). */}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {uppdaterad && <>Pricing basis updated {uppdaterad}. </>}
          Price levels set on 2026-09-03 — decided by the owner. All amounts
          in SEK including 25 % VAT (per section 5 of the terms of use and
          consumer law requirements to state prices including tax). Phase 2
          and Phase 3 members receive a {rabattProcent} % discount on all
          tiers, always and automatically.
        </p>
      </section>

      {/* ── LEGAL BLOCK ──────────────────────────────────────────────────── */}
      <section className="mt-10 rounded-xl border border-gold/30 bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-bold">
          How this differs from advice
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Research-based analysis — not investment advice under the Swedish
          Act (2007:528) on securities business (lagen (2007:528) om
          värdepappersrörelser). AK1A Portfolio Research is educational
          material within AK1A Research Lab; the customer always makes their
          own decisions and bears their own responsibility for them.
        </p>
        <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2">
          {[
            "No personal recommendations — we never tell YOU what to buy or sell",
            "No management services — we never touch your money",
            "All assumptions and sources are reported openly — you can reproduce them yourself",
            "Renewal only after an active choice (opt-in) — never silent automation",
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
          <strong className="text-foreground">Right of withdrawal and digital content.</strong>{" "}
          As a consumer you have a 14-day right of withdrawal under the
          Swedish Distance Contracts Act (lagen (2005:59) om distansavtal och
          avtal utanför affärslokaler) — but for digital content delivered
          immediately, the right of withdrawal ends once delivery has begun
          with your express consent. How this works in practice is described
          in{" "}
          <Link href="/villkor#sektion-6" className="underline hover:text-foreground">
            the terms of use (section 6)
          </Link>
          .
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/finansiell-policy"
            className="rounded-md border border-gold/50 px-4 py-2 font-semibold hover:bg-gold/10"
          >
            Financial policy
          </Link>
          <Link
            href="/en/transparens"
            className="rounded-md border border-gold/50 px-4 py-2 font-semibold hover:bg-gold/10"
          >
            Transparency &amp; GDPR
          </Link>
          <Link
            href="/villkor"
            className="rounded-md border border-gold/50 px-4 py-2 font-semibold hover:bg-gold/10"
          >
            Terms of use
          </Link>
        </div>
      </section>

      {/* ── ACTIVATION ───────────────────────────────────────────────────── */}
      <section className="mt-10" aria-label="Activate subscription">
        <h2 className="font-serif text-2xl font-bold">Activate your subscription</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The subscription is open to everyone. The payment flow is not
          connected yet — activation takes place through a short email
          exchange with info@ak1nvestor.com, and your request is saved in
          your browser until then.
        </p>
        <div className="mt-6">
          <AktiveraPanel nivaer={nivaer} rabattFas={rabattFas} />
        </div>
      </section>

      {/* ── CLOSING ──────────────────────────────────────────────────────── */}
      <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
        Unsure about the tier? Feel free to explore{" "}
        <Link href="/en/medlemskap" className="underline hover:text-foreground">
          the membership and the Phase educations
        </Link>{" "}
        first — Phase 2 and Phase 3 give {rabattProcent} % off the
        subscription, forever. Want to see the method at work?{" "}
        <Link href="/vagfundament" className="underline hover:text-foreground">
          The Wave Foundation
        </Link>{" "}
        and{" "}
        <Link href="/konfluens" className="underline hover:text-foreground">
          the Confluence Radar
        </Link>{" "}
        are open as free tools.
      </p>
    </SeoPageShell>
  );
}
