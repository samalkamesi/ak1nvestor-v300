import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const metadata: Metadata = {
  title: "Cookiepolicy — samtycke & kontroll | AK1A Research Lab",
  description:
    "AK1A Research Labs cookiepolicy: vilka cookies och localStorage-nycklar vi använder, kategorier, laglig grund enligt lagen om elektronisk kommunikation, och hur du ändrar ditt val.",
  alternates: { canonical: "https://lab.ak1nvestor.com/cookiepolicy" },
  keywords: ["cookiepolicy", "cookies", "samtycke", "LEK", "localStorage", "AK1A"],
};

const KAKOR: Array<{ namn: string; kat: string; syfte: string; tid: string }> = [
  {
    namn: "ak1a-cookie-samtycke",
    kat: "Nödvändiga",
    syfte: "Sparar ditt cookie-val (version, kategorier, datum) — krävs för att respektera ditt val.",
    tid: "Tills du ändrar ditt val",
  },
  {
    namn: "ak1a-member",
    kat: "Nödvändiga",
    syfte: "Inloggnings- och medlemstyp (gratis/Fas 2/Fas 3) för att visa rätt innehåll.",
    tid: "Sessionen / tills utloggning",
  },
  {
    namn: "ak1a-elevkarna-v1 · ak1a-klara-kurser",
    kat: "Nödvändiga",
    syfte: "Kursprogress och elevkärna — utan dessa kan utbildningen inte återupptas.",
    tid: "Tills du rensar browserdata",
  },
  {
    namn: "ak1a-quiz-* · ak1a-sr-v1 · ak1a-sr-xp-v1",
    kat: "Nödvändiga",
    syfte: "Quiz-svar per kurs, repeterings-schema (spaced repetition) och XP.",
    tid: "Tills du rensar browserdata",
  },
  {
    namn: "ak1a-tracer-v1",
    kat: "Analys (samtycke)",
    syfte: "Förståelse-Först-tracern: scroll-djup, klick, tid per sektion, intresseprofil — för att anpassa utbildningen och föreslå nästa steg. Aktiveras endast efter samtycke.",
    tid: "Tills du rensar eller återkallar",
  },
  {
    namn: "ak1a-notiser-v1 · ak1a-notiser-dag-v1 · ak1a-signal · ak1a-organ-event",
    kat: "Preferenser (samtycke)",
    syfte: "Notiser och signaler (max 1 per typ och dag) som stöttar din studievanor.",
    tid: "Tills du rensar browserdata",
  },
  {
    namn: "ak1a-badges · ak1a-shortseller-v1 · ak1a-analysbank-v1 · ak1a-villkors-samtycke",
    kat: "Preferenser (samtycke)",
    syfte: "Insikter, verktygs state och bekräftat villkorssamtycke.",
    tid: "Tills du rensar browserdata",
  },
];

export default function CookiePolicy() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Cookiepolicy" }]}>
      <h1 className="font-serif text-3xl font-bold">Cookiepolicy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Senast uppdaterad: 2026-09-01 · Enligt lagen (2022:482) om elektronisk kommunikation, 6 kap.
        19–20 §§
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-bold">Vad cookies och lokal lagring är</h2>
          <p className="mt-2 text-muted-foreground">
            Cookies är små textfiler som webbplatser sparar i din webbläsare. Vi använder även{" "}
            <strong className="text-foreground">localStorage</strong> — lokal lagring i webbläsaren
            som fungerar liknande men aldrig skickas automatiskt till oss. I vardagsspråk kallar vi
            allt detta cookies på den här sidan. Fördelen för dig: din utbildningsprogress och dina
            inställningar finns kvar mellan besök, på din egen enhet.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Laglig grund — samtycke</h2>
          <p className="mt-2 text-muted-foreground">
            Enligt lagen om elektronisk kommunikation krävs ditt{" "}
            <strong className="text-foreground">samtycke</strong> innan cookies som inte är strikt
            nödvändiga sparas. Därför möter du vår cookie-banner vid första besöket. Strikt
            nödvändiga cookies (inloggning, säkerhet, leverans av tjänsten) får användas utan
            samtycke — utan dem fungerar inte webbplatsen alls.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Våra cookies — fullständig förteckning</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-gold/25">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-gold/10 font-serif">
                <tr>
                  <th className="p-3">Nyckel</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Syfte</th>
                  <th className="p-3">Varaktighet</th>
                </tr>
              </thead>
              <tbody>
                {KAKOR.map((k) => (
                  <tr key={k.namn} className="border-t border-gold/15 align-top">
                    <td className="p-3 font-mono text-[11px]">{k.namn}</td>
                    <td className="p-3">
                      <span
                        className={
                          k.kat.startsWith("Nödvändiga")
                            ? "rounded-full bg-muted px-2 py-0.5"
                            : "rounded-full bg-gold/20 px-2 py-0.5 text-[#785c13]"
                        }
                      >
                        {k.kat}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{k.syfte}</td>
                    <td className="p-3 text-muted-foreground">{k.tid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Utöver detta lagrar driftleverantören Vercel tekniska serverloggar (IP, tidsstämpel)
            enligt deras standard — det är inte cookies och styrs inte av ditt val här.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Din kontroll</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Ändra ditt val:</strong> öppna{" "}
              <Link className="text-gold underline" href="/?cookies=1">
                cookie-inställningarna
              </Link>{" "}
              när som helst (samma länk finns i sidfoten).
            </li>
            <li>
              <strong className="text-foreground">Återkalla samtycke:</strong> samma väg — valet
              gäller omedelbart.
            </li>
            <li>
              <strong className="text-foreground">Radera allt:</strong> webbläsarens inställningar →
              Rensa webbplatsdata, eller utvecklarverktygen → Application → Local Storage (alla
              nycklar som börjar på ak1a-).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Kontakt</h2>
          <p className="mt-2 text-muted-foreground">
            Frågor om cookies:{" "}
            <a className="text-gold underline" href="mailto:info@ak1nvestor.com">
              info@ak1nvestor.com
            </a>
            . Se även{" "}
            <Link className="text-gold underline" href="/privacy-policy">
              integritetspolicyn
            </Link>{" "}
            för hur personuppgifter behandlas enligt GDPR.
          </p>
        </section>
      </div>
    </SeoPageShell>
  );
}
