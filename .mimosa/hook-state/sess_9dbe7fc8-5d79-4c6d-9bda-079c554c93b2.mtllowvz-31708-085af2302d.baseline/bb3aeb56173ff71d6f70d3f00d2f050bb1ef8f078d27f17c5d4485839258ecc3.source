import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const metadata: Metadata = {
  title: "Integritetspolicy — GDPR | AK1A Research Lab",
  description:
    "AK1A Research Labs integritetspolicy: vilka personuppgifter vi behandlar (konto, utbildningsdata, beteendedata), rättslig grund, lagring, dina GDPR-rättigheter och kontakt.",
  alternates: { canonical: "https://lab.ak1nvestor.com/privacy-policy" },
  keywords: [
    "integritetspolicy",
    "GDPR",
    "dataskydd",
    "personuppgifter",
    "AK1A",
    "cookies",
  ],
};

const KATEGORIER: Array<{ rubrik: string; text: string }> = [
  {
    rubrik: "1. Konto och inloggning",
    text: "E-postadress (användarnamn), medlemstyp (gratis-konto / Fas 2 / Fas 3 / admin) och ett lösenord som lagras som hash i Supabase Auth — vi ser aldrig lösenordet i klartext. Behandlas för att leverera tjänsten du har konto för.",
  },
  {
    rubrik: "2. Utbildningsdata",
    text: "Kursprogress, lästa kapitel, quiz-svar, XP, nivå (1–100), certifikat och streaks. Lagras dels lokalt i din webbläsare (localStorage), dels på servern kopplat till ditt konto — utan detta kan ingen utbildning levereras eller återupptas.",
  },
  {
    rubrik: "3. Beteendedata (Förståelse-Först-tracern)",
    text: "Vår pedagogiska tracer följer scroll-djup, klick, tid per sektion, musrörelsemönster och intresseprofil. Syftet är ENDAST att anpassa utbildningen till dig — föreslå nästa steg, upptäcka flaskhalsar och bygga din kognitiva profil. Datan används aldrig för individuell prissättning, profilering mot tredje man eller försäljning. Du kan radera den när som helst (se sektion om lokal data).",
  },
  {
    rubrik: "4. Signaler och notiser",
    text: "Systemhändelser (prestationer, Fas 2-avstånd, påminnelser) som driver dina notiser och e-postutskick. Max en per typ och dag — byggda för att stötta, inte stressa.",
  },
  {
    rubrik: "5. E-postkommunikation",
    text: "Morgonmejl, veckorapport och nyhetsbrev skickas endast till den e-postadress du registrerat, och endast marknadsföring du aktivt samtyckt till. Du kan återkala samtycket i varje mejl (avregistreringslänk) eller genom att kontakta oss.",
  },
  {
    rubrik: "6. Cookies och lokal lagring",
    text: "Vi använder cookies och localStorage för inloggning, säkerhet, utbildningsprogress och — med ditt samtycke — beteendeanpassning. Se den fullständiga listan med kategorier i vår cookiepolicy.",
  },
  {
    rubrik: "7. Tekniska loggar",
    text: "Vår driftleverantör Vercel lagrar serverloggar (bl.a. IP-adress och tidsstämplar) för säkerhet och felsökning, med kort lagringstid enligt deras standard.",
  },
];

export default function PrivacyPolicy() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Integritetspolicy" }]}>
      <h1 className="font-serif text-3xl font-bold">Integritetspolicy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Senast uppdaterad: 2026-09-01 · Enligt dataskyddsförordningen (GDPR, EU 2016/679) och
        dataskyddslagen (2018:218)
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-bold">Personuppgiftsansvarig</h2>
          <p className="mt-2 text-muted-foreground">
            AK1A Research Lab (drivet av Ak1 Apex Nexus), e-post{" "}
            <a className="text-gold underline" href="mailto:info@ak1nvestor.com">
              info@ak1nvestor.com
            </a>
            , organisationsnummer [ORGANISATIONSNR — kompletteras vid registrering]. Frågor om
            personuppgifter besvaras på samma adress. Vi har inget separat dataskyddsombud — kontakta
            oss direkt, vi svarar inom 30 dagar.
          </p>
          <p className="mt-2 text-muted-foreground">
            Vill du se hela dataregistret — vad, varför, rättslig grund, lagringstid
            och dina rättigheter per kategori, precis som artikel 13 kräver — läs{" "}
            <Link href="/transparens" className="text-gold underline">
              Transparens &amp; GDPR
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">
            Vilka personuppgifter vi behandlar — hela ärliga listan
          </h2>
          <div className="mt-3 space-y-3">
            {KATEGORIER.map((k) => (
              <div key={k.rubrik} className="rounded-lg border border-gold/20 bg-card p-4">
                <h3 className="font-serif font-bold">{k.rubrik}</h3>
                <p className="mt-1 text-muted-foreground">{k.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Ändamål och rättslig grund</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Avtal (art. 6.1 b):</strong> konto, inloggning,
              kursprogress, quiz, certifikat, leverans av Fas 1/Fas 2/Fas 3 — det du har konto för.
            </li>
            <li>
              <strong className="text-foreground">Berättigat intresse (art. 6.1 f):</strong>{" "}
              beteendedata för att anpassa utbildningen, produktförbättring, säkerhet och skydd mot
              missbruk. Vår intresseavvägning: anpassningen sker i din webbläsare, sammanfattas
              grovt, används aldrig mot dig — och du kan radera den när som helst.
            </li>
            <li>
              <strong className="text-foreground">Samtycke (art. 6.1 a):</strong> nyhetsbrev och
              marknadsföring samt icke-nödvändiga cookies (se{" "}
              <Link className="text-gold underline" href="/cookiepolicy">
                cookiepolicyn
              </Link>
              ). Samtycke återkallas när som helst.
            </li>
            <li>
              <strong className="text-foreground">Rättslig förpliktelse:</strong> bokföring av
              betalningar enligt bokföringslagen (7 år).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Vem får dina uppgifter</h2>
          <p className="mt-2 text-muted-foreground">
            Vi säljer aldrig personuppgifter. Vi delar endast med underleverantörer som behandlar
            data åt oss: <strong className="text-foreground">Supabase</strong> (autentisering och
            databas) samt <strong className="text-foreground">Vercel</strong> (drift och loggar) —
            båda med standardavtalsklausuler (SCC) respektive EU–US Data Privacy Framework för
            överföring utanför EES — samt e-postleverantör för utskick (endast med samtycke). Vid
            lagkrav kan uppgifter lämnas till myndighet.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Lagringstid</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Konto- och utbildningsdata: så länge kontot är aktivt.</li>
            <li>
              Vid kontorstängning raderas serverdata inom 30 dagar; lokaldata i din webbläsare
              raderar du själv (se nedan).
            </li>
            <li>Nyhetsbrevssamtycke: till du återkallar det.</li>
            <li>Betalningsunderlag: 7 år (bokföringslagen).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Dina rättigheter (art. 15–22)</h2>
          <p className="mt-2 text-muted-foreground">
            Du har rätt till <strong className="text-foreground">tillgång</strong> (få ut kopia),{" "}
            <strong className="text-foreground">rättelse</strong>,{" "}
            <strong className="text-foreground">radering</strong> (rätten att bli glömd),{" "}
            <strong className="text-foreground">begränsning</strong>,{" "}
            <strong className="text-foreground">dataportabilitet</strong> (få data i maskinläsbart
            format) och <strong className="text-foreground">invändning</strong> mot
            intressegrundad behandling. Samtycke kan återkallas när som helst. Kontakt:{" "}
            <a className="text-gold underline" href="mailto:info@ak1nvestor.com">
              info@ak1nvestor.com
            </a>
            . Du kan också klaga till Integritetsskyddsmyndigheten (IMY,{" "}
            <a
              className="text-gold underline"
              href="https://www.imy.se"
              target="_blank"
              rel="noopener noreferrer"
            >
              imy.se
            </a>
            ).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Så raderar du lokal data själv</h2>
          <p className="mt-2 text-muted-foreground">
            All lokaldata lagras under nycklar som börjar på{" "}
            <code className="rounded bg-muted px-1">ak1a-</code> (t.ex.{" "}
            <code className="rounded bg-muted px-1">ak1a-tracer-v1</code> för beteendedata,{" "}
            <code className="rounded bg-muted px-1">ak1a-elevkarna-v1</code> för elevkärnan,{" "}
            <code className="rounded bg-muted px-1">ak1a-klara-kurser</code> för progress). Öppna
            webbläsarens utvecklarverktyg → Application → Local Storage → ta bort ak1a-nycklarna,
            eller rensa webbplatsdata. Serverdata raderas via begäran till oss.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Barn och unga</h2>
          <p className="mt-2 text-muted-foreground">
            Tjänsten riktar sig inte till personer under 18 år. Konto för minderårig kräver
            målsmans godkännande — kontakta oss i sådana fall.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold">Ändringar och kontakt</h2>
          <p className="mt-2 text-muted-foreground">
            Vi kan uppdatera policyn vid förändringar i tjänsten eller lagstiftning — större
            förändringar meddelas på plats och via e-post. Se även{" "}
            <Link className="text-gold underline" href="/villkor">
              användarvillkoren
            </Link>
            ,{" "}
            <Link className="text-gold underline" href="/cookiepolicy">
              cookiepolicyn
            </Link>{" "}
            och{" "}
            <Link className="text-gold underline" href="/ansvar">
              ansvarsfriskrivningen
            </Link>
            .
          </p>
        </section>
      </div>
    </SeoPageShell>
  );
}
