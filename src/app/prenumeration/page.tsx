import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { lasPriser } from "@/lib/portfolj-forskning/korstabell-data";
import { NivaKort } from "@/components/ak1a/prenumeration/niva-kort";
import { RabattBand } from "@/components/ak1a/prenumeration/rabatt-band";
import { AktiveraPanel } from "@/components/ak1a/prenumeration/aktivera-panel";

export const dynamic = "force-static";

/**
 * PRENUMERATION — den dedikerade prenumerations-sidan för AK1A
 * Portföljforskning (tjänsten i data/portfolj-system/priser.json).
 *
 * ALLA pris-siffror läses vid build-tillfället ur priser.json via lasPriser()
 * (src/lib/portfolj-forskning/korstabell-data.ts) — metadata description,
 * nivå-kort, rabatt-band och aktiverings-panel. Inga hårdkodade belopp här.
 * Klientkomponenterna får prisdatan som serialiserbara props.
 */

// Prisunderlaget läses EN gång vid build (force-static) — metadata och vy
// delar samma läsning så de aldrig kan skilja sig åt.
const priser = lasPriser();
const grundNiva = priser?.nivaer.find((n) => n.id === "forskning") ?? priser?.nivaer[0];
const rabattProcent = priser ? Math.round(priser.rabattFas.fas2 * 100) : 0;

export const metadata: Metadata = pageMetadata({
  path: "/prenumeration",
  title: "Prenumeration — forskningsbaserad portföljuppföljning | AK1A",
  description: grundNiva
    ? `Tre nivåer från ${grundNiva.prisManad} kr/mån: månadsvis forskningsportfölj (10 branscher × 10 bolag) med AKM1-poäng, fundamental och teknisk vågstatus, då-vs-nu-uppföljning och ersättningsförslag när strikta krav bryts. Är du Fas 2- eller Fas 3-elev? ${rabattProcent} % rabatt för alltid — statusen känns igen automatiskt. Forskning, inte rådgivning.`
    : "Tre nivåer av forskningsbaserad portföljuppföljning: AKM1-poäng, vågstatus per horisont, då-vs-nu-uppföljning och ersättningsförslag. Fas 2- och Fas 3-elever får rabatt för alltid. Forskning — inte rådgivning.",
  keywords: [
    "portföljforskning",
    "prenumeration aktieanalys",
    "forskningsportfölj",
    "AKM1 portfölj",
    "portföljhyra",
    "portföljuppföljning",
    "aktieanalys prenumeration Sverige",
    "AK1A Research Lab",
  ],
});

/** Checklistor per nivå — byggda ur priser.json-beskrivningarna + utökade. */
const INGAR_PER_NIVA: Record<string, string[]> = {
  forskning: [
    "Månadsvis forskningsportfölj — 10 branscher × 10 bolag",
    "Välj risknivå (konservativ, balanserad, tillväxt) och tillväxttakt (lugn, stadig, aggressiv) — 9 profiler",
    "AKM1-poäng per innehav",
    "Fundamental och teknisk vågstatus per horisont",
    "Golvmarginal och kravkontroller per innehav",
    "Pedagogiskt underlag — utan köp- eller säljuppmaningar",
  ],
  "forskning-plus": [
    "Allt i Grund-nivån",
    "Ersättningsförslag när ett innehav brutit mot profilens strikta krav — upp till tre alternativ i samma bransch med jämförelsetext",
    "Månads-uppföljning då-vs-nu — portföljen mätt mot förra lägesbilden",
    "Kvartalsvis djupuppföljning då-vs-nu",
    "Portföljens samlade vågmatris per horisont",
  ],
  "portfolj-hyra": [
    "Allt i Plus-nivån",
    "Du hyr den forskningsportfölj som speglar din valda riskprofil",
    "AK1A sköter omvikningar, kravkontroller och ersättningsanalys vid varje uppdatering",
    "Forskning och utbildning — aldrig förvaltning eller investeringsrådgivning enligt lagen (2007:528)",
  ],
};

export default function PrenumerationPage() {
  // ── Ärligt fallback-läge: priser.json saknas/ogiltig → vi visar inga påhittade priser.
  if (!priser || priser.nivaer.length === 0) {
    return (
      <SeoPageShell breadcrumb={[{ name: "Hem", href: "/" }, { name: "Prenumeration" }]} wide>
        <h1 className="font-serif text-4xl font-bold">Prenumeration</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          AK1A Portföljforskning — forskningsbaserad portföljuppföljning, inte
          rådgivning. Prislistan håller på att sättas och publiceras här inom
          kort. Intresserad redan nu? Mejla{" "}
          <a
            href="mailto:info@ak1nvestor.com"
            className="underline hover:text-foreground"
          >
            info@ak1nvestor.com
          </a>{" "}
          så berättar vi mer.
        </p>
      </SeoPageShell>
    );
  }

  const { nivaer, rabattFas, juridiskFotnot, notering, uppdaterad, tjanst } = priser;
  const exempelNiva = grundNiva ?? nivaer[0];
  const mittId = nivaer[1]?.id; // mitt-kortet markeras "Mest valda"

  return (
    <SeoPageShell breadcrumb={[{ name: "Hem", href: "/" }, { name: "Prenumeration" }]} wide>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight">
        Forskningsbaserad portföljuppföljning — inte rådgivning.
      </h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
        <strong className="text-foreground">{tjanst}</strong> följer en
        forskningsportfölj åt dig — månadsvis, systematiskt och med alla siffror
        redovisade. Du får hela underlaget: poäng, vågstatus, kravkontroller och
        vad som förändrats sedan sist. Vi lämnar aldrig köp- eller säljuppmaningar
        — du fattar dina egna beslut, med bättre underlag.
      </p>

      {/* Värdeprop-chips */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { tal: "10 × 10", etikett: "branscher × bolag i forskningsuniversumet" },
          { tal: "AKM1", etikett: "poäng per innehav — 20 fundamentalvariabler" },
          { tal: "5", etikett: "horisonter med fundamental + teknisk vågstatus" },
          { tal: "Då vs nu", etikett: "månads-uppföljning — vad förändrats sedan sist?" },
          { tal: "≤ 3", etikett: "ersättningsförslag i samma bransch när strikta krav bryts" },
          { tal: `${rabattProcent} %`, etikett: `rabatt för alltid för Fas 2- och Fas 3-elever` },
        ].map((s) => (
          <div key={s.etikett} className="rounded-xl border border-gold/30 bg-card p-4">
            <div className="font-serif text-2xl font-black text-gold">{s.tal}</div>
            <div className="mt-1 text-xs leading-tight text-muted-foreground">{s.etikett}</div>
          </div>
        ))}
      </div>

      {/* ── RABATT-BAND ───────────────────────────────────────────────────── */}
      <div className="mt-10">
        <RabattBand rabattFas={rabattFas} exempelNiva={exempelNiva} />
      </div>

      {/* ── NIVÅ-KORT ─────────────────────────────────────────────────────── */}
      <section className="mt-8" aria-label="Prenumerationsnivåer">
        <h2 className="font-serif text-2xl font-bold">Tre nivåer — öppen för alla</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Alla nivåer finns som månads- och årspris. Rabatten för Fas 2- och
          Fas 3-elever gäller på alla nivåer och båda perioderna — för alltid.
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

        {/* Prisnotering — ur priser.json, ordagrant */}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {uppdaterad && <>Prisunderlag uppdaterat {uppdaterad}. </>}
          {notering} {rabattFas.beskrivning}
        </p>
      </section>

      {/* ── JURIDIK-BLOCK ─────────────────────────────────────────────────── */}
      <section className="mt-10 rounded-xl border border-gold/30 bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-bold">
          Så skiljer sig detta från rådgivning
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {juridiskFotnot}
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

      {/* ── AKTIVERING ────────────────────────────────────────────────────── */}
      <section className="mt-10" aria-label="Aktivera prenumeration">
        <h2 className="font-serif text-2xl font-bold">Aktivera din prenumeration</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Prenumerationen är öppen för alla. Betalflödet är inte kopplat ännu —
          aktivering sker via en kort mejlväxling med info@ak1nvestor.com, och din
          begäran sparas i din webbläsare tills dess.
        </p>
        <div className="mt-6">
          <AktiveraPanel nivaer={nivaer} rabattFas={rabattFas} />
        </div>
      </section>

      {/* ── AVSLUT ────────────────────────────────────────────────────────── */}
      <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
        Osäker på nivå? Utforska gärna{" "}
        <Link href="/medlemskap" className="underline hover:text-foreground">
          medlemskapet och Fas-utbildningarna
        </Link>{" "}
        först — Fas 2 och Fas 3 ger {rabattProcent} % rabatt på prenumerationen,
        för alltid. Vill du se metoden i verket?{" "}
        <Link href="/vagfundament" className="underline hover:text-foreground">
          Vågfundamentet
        </Link>{" "}
        och{" "}
        <Link href="/konfluens" className="underline hover:text-foreground">
          Konfluensradarn
        </Link>{" "}
        är öppna som gratisverktyg.
      </p>
    </SeoPageShell>
  );
}
