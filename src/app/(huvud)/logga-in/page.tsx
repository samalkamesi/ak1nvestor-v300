import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { MedlemInloggning } from "@/components/ak1a/medlem-inloggning";
import { LoggaIn } from "@/components/ak1a/logga-in";
import { MigreraProgressBanner } from "@/components/ak1a/migrera-progress";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/logga-in",
  harSpeglar: true, // Ömsesidig hreflang med /en|ar/logga-in (VÅG 63 O3 #2)
  title: "Logga in — gratis konto, alla kurser upplåsta | AK1A",
  // Antal ur src/lib/siffror.ts (guldkällan)
  description:
    `Logga in med e-post eller skapa gratis konto: alla ${SIFFROR.kurser} kurser, kalkylatorn och portföljsystemet — helt kostnadsfritt, för alltid.`,
  keywords: ["logga in", "gratis konto", "aktieutbildning gratis", "AK1A"],
});

export default function LoggaInPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Logga in" }]}>
      <h1 className="text-center font-serif text-4xl font-bold">Välkommen till AK1A</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground leading-relaxed">
        Institutionell metodik — som en rättighet. Ett konto låser upp allt i Fas 1,
        helt gratis. Ditt framsteg sparas och du tjänar XP och stjärnor för varje kurs.
      </p>
      {/* FAS L1 (våg 86): riktig medlemsauth ÖVERST — Supabase-kontot via
          /api/medlem; den lokala gäst-vyn lever kvar som mjuk fall-back nedan. */}
      <div className="mt-10">
        <MedlemInloggning />
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Ditt konto följer dig mellan enheter — logga in var som helst.
      </p>
      {/* VÅG 87 (FAS L2 §A.3): migreringsbanner — lokal progress på enheten
          ⇒ registrera/lås molnet + import-knapp (formuläret sitter på sidan,
          därför ingen extra inloggningslänk). */}
      <div className="mt-8">
        <MigreraProgressBanner lankTillLoggaIn={false} />
      </div>
      {/* Fall-back-sektion: gäster utan konto (mjuk migrering, styrelsens L1:
          gamla localStorage-medlemmar får gäst-läget kvar tills de registrerar). */}
      <section className="mt-14 border-t border-gold/15 pt-10">
        <h2 className="text-center font-serif text-xl font-bold">Fortfarande gäst?</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground leading-relaxed">
          Kursframsteg sparas lokalt tills du skapar konto — inget försvinner, men
          ett konto gör att allt följer med dig mellan enheter.
        </p>
        <div className="mt-8">
          <LoggaIn />
        </div>
      </section>
    </SeoPageShell>
  );
}
