import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { ORG_NR_LANG } from "@/lib/variabler";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

// Statisk per default ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser, /villkor och /privacy-policy.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/integritetspolicy",
  title: "Integritetspolicy — personuppgifter och GDPR | AK1A",
  description:
    "AK1A Research Labs integritetspolicy: vem som är personuppgiftsansvarig, vilka personuppgifter vi behandlar (konto, utbildningsdata, beteendedata, loggar), ändamål och rättslig grund enligt GDPR art 6, mottagare, lagringstid, dina rättigheter enligt art 15–22, kakor enligt lagen (2022:482) och hur du klagar till IMY.",
  keywords: [
    "integritetspolicy",
    "GDPR",
    "artikel 13",
    "personuppgifter",
    "dataskydd",
    "cookies",
    "kakor",
    "AK1A Research Lab",
    "finansutbildning",
  ],
});

/** Blocktyper: stycke (p), punktlista (ul) eller framhävd ruta (box). */
type Block = { p: React.ReactNode } | { ul: React.ReactNode[] } | { box: React.ReactNode };

export default function IntegritetspolicyPage() {
  const lank = (href: string, text: string) => (
    <Link href={href} className="underline hover:text-foreground">
      {text}
    </Link>
  );
  const epost = (
    <a className="text-gold underline" href="mailto:info@ak1nvestor.com">
      info@ak1nvestor.com
    </a>
  );

  const sektion = (rubrik: string, blocks: Block[]) => (
    <section className="mt-8" id={`sektion-${rubrik.split(".")[0]}`}>
      <h2 className="font-serif text-2xl font-bold">{rubrik}</h2>
      {blocks.map((block, i) => {
        if ("p" in block) {
          return (
            <p key={i} className="mt-3 leading-relaxed text-muted-foreground">
              {block.p}
            </p>
          );
        }
        if ("ul" in block) {
          return (
            <ul key={i} className="mt-3 space-y-2 leading-relaxed text-muted-foreground">
              {block.ul.map((li, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-gold" aria-hidden="true">
                    ·
                  </span>
                  <span>{li}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <div key={i} className="mt-4 rounded-lg border border-gold/30 bg-card p-4">
            <div className="leading-relaxed text-muted-foreground">{block.box}</div>
          </div>
        );
      })}
    </section>
  );

  return (
    <SeoPageShell breadcrumb={[{ name: "Integritetspolicy" }]}>
      <h1 className="font-serif text-4xl font-bold">Integritetspolicy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fastställd 2026-09-29 · gäller lab.ak1nvestor.com · AK1A Research Lab
      </p>

      <p className="mt-6 leading-relaxed text-muted-foreground">
        Denna integritetspolicy (&quot;Policyn&quot;) berättar hur AK1A Research Lab —
        utbildningsplattformen på lab.ak1nvestor.com (&quot;Plattformen&quot;), driven av
        Ak1 Apex Nexus — behandlar personuppgifter när du besöker, registrerar
        konto eller använder utbildningen. Policyn uppfyller
        dataskyddsförordningens (EU) 2016/679 (GDPR) informationsplikt enligt
        artikel 13 och kompletteras av {lank("/transparens", "transparensregistret")}
        (det fullständiga dataregistret) samt {lank("/cookiepolicy", "cookiepolicyn")}
        (den fullständiga kaklistan).
      </p>

      <div className="mt-4 rounded-lg border border-gold/30 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Snabbfakta.</strong> Personuppgiftsansvarig:
        AK1A Research Lab{ORG_NR_LANG} · Kontakt: {epost} · Grund: GDPR och
        dataskyddslagen (2018:218) · Kakor: lagen (2022:482) om elektronisk
        kommunikation — samtycke före icke-nödvändiga kakor · Vi säljer aldrig
        personuppgifter och spårar aldrig dina investeringar · Underleverantörer
        inom EES: Contabo, Supabase och one.com (Vercel enbart passiv reserv) ·
        Klagan: Integritetsskyddsmyndigheten (imy.se).
      </div>

      {sektion("1. Personuppgiftsansvarig och kontakt", [
        {
          p: (
            <>
              Personuppgiftsansvarig för behandlingen som beskrivs i denna policy
              är AK1A Research Lab{ORG_NR_LANG}, driven av Ak1 Apex Nexus, med
              kontakt via {epost}. Frågor om personuppgifter besvaras på samma
              adress — normalt inom 30 dagar. Vi har inget separat
              dataskyddsombud; kontakta oss direkt så hjälper vi dig.
            </>
          ),
        },
        {
          p: (
            <>
              Plattformen är finansiell <em>utbildning</em> — kurser, quiz och
              övningar som lär ut metodik och kritiskt tänkande. Det präglar
              även integritetsarbetet: vi samlar in det minsta som krävs för
              att du ska kunna lära dig (dataminimering, GDPR art 5.1 c),
              spårar aldrig dina investeringar och säljer aldrig data.
            </>
          ),
        },
      ])}

      {sektion("2. Vilka personuppgifter vi behandlar — hela ärliga listan", [
        {
          p: (
            <>
              Detta är den kompletta förteckningen över personuppgifter som
              behandlas på Plattformen. Vill du se samma uppgifter som register
              med lagringstid per rad finns{" "}
              {lank("/transparens", "transparensregistret")}.
            </>
          ),
        },
        {
          ul: [
            <>
              <strong className="text-foreground">Konto och inloggning.</strong>{" "}
              E-postadress (användarnamn) och ett lösenord som lagras som hash i
              Supabase Auth (EU-region) — vi ser aldrig lösenordet i klartext.
              Medlemskontot behövs för att leverera det du köpt (Fas 2, Fas 3
              och övriga köpta nivåer); allt gratisinnehåll kan användas helt
              utan konto. Medlemstyp (gratis / Fas 2 / Fas 3 / admin) synkas
              till kontot.
            </>,
            <>
              <strong className="text-foreground">Utbildningsdata.</strong>{" "}
              Kursprogress, lästa kapitel, quiz-svar, XP, nivå (1–100),
              certifikat och streaks. Lagras dels lokalt i din webbläsare
              (localStorage), dels på servern kopplat till ditt konto — utan
              detta kan ingen utbildning levereras eller återupptas.
            </>,
            <>
              <strong className="text-foreground">
                Beteendedata (Förståelse-Först-tracern).
              </strong>{" "}
              Vår pedagogiska tracer följer scroll-djup, klick, tid per sektion,
              musrörelsemönster och intresseprofil. Syftet är endast att anpassa
              utbildningen till dig — föreslå nästa steg, upptäcka flaskhalsar
              och bygga din kognitiva profil. Datan används aldrig för
              individuell prissättning, profilering mot tredje man eller
              försäljning, och aktiveras endast efter ditt samtycke. Du kan
              radera den när som helst (sektion 8).
            </>,
            <>
              <strong className="text-foreground">Signaler och notiser.</strong>{" "}
              Systemhändelser (prestationer, Fas 2-avstånd, påminnelser) som
              driver dina notiser och e-postutskick — max en per typ och dag.
            </>,
            <>
              <strong className="text-foreground">E-postkommunikation.</strong>{" "}
              Morgonmejl, veckorapport och nyhetsbrev skickas endast till den
              e-postadress du registrerat, och endast marknadsföring du aktivt
              samtyckt till.
            </>,
            <>
              <strong className="text-foreground">Tekniska loggar.</strong>{" "}
              Sajten drivs på egen virtuell server hos Contabo (Tyskland/EU).
              Serverns trafik- och säkerhetsloggar (webbserverns åtkomstlogg
              samt Intrångsspärren fail2ban) innehåller IP-adress och
              tidsstämpel — mer lagras inte i ledet — och används enbart för
              drift och skydd mot angrepp, med kort lagringstid genom löpande
              loggrotation.
            </>,
            <>
              <strong className="text-foreground">Betalningsunderlag.</strong>{" "}
              Vid köp hanteras kortuppgifter uteslutande av extern
              betaltjänstleverantör (Stripe); AK1A lagrar aldrig kortnummer.
              Kvar hos oss finns endast de underlag som bokföringslagen kräver.
            </>,
          ],
        },
      ])}

      {sektion("3. Ändamål och rättslig grund (GDPR art 6)", [
        {
          ul: [
            <>
              <strong className="text-foreground">Avtal (art 6.1 b):</strong>{" "}
              konto, inloggning, kursprogress, quiz, certifikat och leverans av
              Fas 1/Fas 2/Fas 3 — det du har kontot för.
            </>,
            <>
              <strong className="text-foreground">Berättigat intresse (art 6.1 f):</strong>{" "}
              produktförbättring, säkerhet och skydd mot missbruk samt — efter
              samtycke — anpassning av utbildningen (tracern). Vår
              intresseavvägning för tracern: anpassningen sker i din webbläsare,
              sammanfattas grovt, används aldrig mot dig och kan raderas när
              som helst.
            </>,
            <>
              <strong className="text-foreground">Samtycke (art 6.1 a):</strong>{" "}
              nyhetsbrev och marknadsföring samt icke-nödvändiga kakor (se{" "}
              {lank("/cookiepolicy", "cookiepolicyn")}). Samtycket återkallas
              när som helst.
            </>,
            <>
              <strong className="text-foreground">Rättslig förpliktelse (art 6.1 c):</strong>{" "}
              bokföring av betalningar enligt bokföringslagen (1999:1078) — 7 år.
            </>,
          ],
        },
      ])}

      {sektion("4. Vem får dina uppgifter — mottagare och vidarebefordran", [
        {
          p: (
            <>
              Vi säljer aldrig personuppgifter. Vi delar endast med
              underleverantörer som behandlar data åt oss:{" "}
              <strong className="text-foreground">Contabo</strong> (serverdrift,
              Tyskland — trafik- och säkerhetsloggar),{" "}
              <strong className="text-foreground">Supabase</strong>{" "}
              (autentisering och databas, EU-region) samt{" "}
              <strong className="text-foreground">one.com</strong> (DNS och
              e-post, EU) — samtliga inom EES, så personuppgifterna lämnar inte
              EES i normaldrift.{" "}
              <strong className="text-foreground">Stripe</strong> hanterar
              kortbetalningar enligt ovan.{" "}
              <strong className="text-foreground">Vercel</strong> finns kvar som
              passiv reserv-/backuphosting utan aktiv drift och omfattas av
              EU–US Data Privacy Framework om reserven någonsin aktiveras. Vid
              lagkrav kan uppgifter lämnas till myndighet.
            </>
          ),
        },
        {
          p: (
            <>
              För AK1A PRO (företagskunder) är rollfördelningen den omvända:
              kundföretaget är personuppgiftsansvarig och AK1A är
              personuppgiftsbiträde enligt GDPR art 28 — det regleras av
              personuppgiftsbiträdesavtal (DPA) och beskrivs i{" "}
              {lank("/villkor", "användarvillkorens PRO-sektion")}.
            </>
          ),
        },
      ])}

      {sektion("5. Hur länge uppgifterna sparas", [
        {
          ul: [
            <>
              <strong className="text-foreground">Konto- och utbildningsdata:</strong>{" "}
              så länge kontot är aktivt. Vid kontorstängning raderas serverdata
              inom 30 dagar; lokaldata i din webbläsare raderar du själv
              (sektion 8).
            </>,
            <>
              <strong className="text-foreground">Beteendedata (tracern):</strong>{" "}
              till du raderar eller återkallar samtycket — funktionen är alltid
              frivillig.
            </>,
            <>
              <strong className="text-foreground">Nyhetsbrevssamtycke:</strong>{" "}
              till du återkallar det.
            </>,
            <>
              <strong className="text-foreground">Betalningsunderlag:</strong> 7 år
              enligt bokföringslagen (1999:1078).
            </>,
            <>
              <strong className="text-foreground">Tekniska loggar:</strong> kort
              lagringstid genom löpande loggrotation.
            </>,
          ],
        },
      ])}

      {sektion("6. Dina rättigheter som registrerad (art 15–22)", [
        {
          p: (
            <>
              Du har rätt till{" "}
              <strong className="text-foreground">tillgång</strong> (få ut kopia),{" "}
              <strong className="text-foreground">rättelse</strong>,{" "}
              <strong className="text-foreground">radering</strong> (rätten att
              bli glömd), <strong className="text-foreground">begränsning</strong>,{" "}
              <strong className="text-foreground">dataportabilitet</strong> (få
              data i maskinläsbart format) och{" "}
              <strong className="text-foreground">invändning</strong> mot
              intressegrundad behandling. Samtycke kan återkallas när som helst.
              Använd dina rättigheter via {epost} — vi svarar normalt inom 30
              dagar.
            </>
          ),
        },
        {
          p: (
            <>
              Är du inte nöjd med hur vi behandlar dina personuppgifter har du
              rätt att klaga till Integritetsskyddsmyndigheten (IMY,{" "}
              <a
                className="text-gold underline"
                href="https://www.imy.se"
                target="_blank"
                rel="noopener noreferrer"
              >
                imy.se
              </a>
              ).
            </>
          ),
        },
      ])}

      {sektion("7. Kakor och lokal lagring (lagen 2022:482)", [
        {
          p: (
            <>
              Kakor (cookies) och lokal lagring (localStorage) används för
              inloggning, säkerhet, utbildningsprogress och — först efter
              samtycke — beteendeanpassning. Enligt lagen (2022:482) om
              elektronisk kommunikation, 6 kap. 19–20 §§, krävs ditt samtycke
              innan kakor som inte är strikt nödvändiga sparas; därför möter du
              kakbannern vid första besöket. I korthet:
            </>
          ),
        },
        {
          ul: [
            <>
              <strong className="text-foreground">Strikt nödvändiga (inget samtycke krävs):</strong>{" "}
              <code className="rounded bg-muted px-1">ak1a-cookie-samtycke</code>{" "}
              (sparar ditt kakval),{" "}
              <code className="rounded bg-muted px-1">ak1a_admin</code> och{" "}
              <code className="rounded bg-muted px-1">ak1a_medlem</code>/
              <code className="rounded bg-muted px-1">ak1a_medlem_refresh</code>{" "}
              (httpOnly- och Secure-signerade sessionskakor för admin- och
              medlemssession via Supabase Auth),{" "}
              <code className="rounded bg-muted px-1">ak1a-member</code> (äldre
              lokal profil), samt progress-nycklarna{" "}
              <code className="rounded bg-muted px-1">ak1a-elevkarna-v1</code>,{" "}
              <code className="rounded bg-muted px-1">ak1a-klara-kurser</code>,{" "}
              <code className="rounded bg-muted px-1">ak1a-quiz-*</code> och{" "}
              <code className="rounded bg-muted px-1">ak1a-sr-v1</code>/
              <code className="rounded bg-muted px-1">ak1a-sr-xp-v1</code>.
            </>,
            <>
              <strong className="text-foreground">Analys (endast efter samtycke):</strong>{" "}
              <code className="rounded bg-muted px-1">ak1a-tracer-v1</code> —
              Förståelse-Först-tracern (sektion 2).
            </>,
            <>
              <strong className="text-foreground">Preferenser (samtycke):</strong>{" "}
              notiser och signaler (
              <code className="rounded bg-muted px-1">ak1a-notiser-v1</code> m.fl.),
              verktygs-state och bekräftat villkorssamtycke (
              <code className="rounded bg-muted px-1">ak1a-badges</code>,{" "}
              <code className="rounded bg-muted px-1">ak1a-villkors-samtycke</code>{" "}
              m.fl.).
            </>,
            <>
              Vi använder <strong className="text-foreground">inga
              marknadsförings- eller tredjepartskakor</strong>. Contabos tekniska
              trafik- och säkerhetsloggar (IP, tidsstämpel) är inte kakor och
              styrs inte av ditt val.
            </>,
          ],
        },
        {
          p: (
            <>
              Den fullständiga förteckningen med kategori, syfte och varaktighet
              per nyckel finns i {lank("/cookiepolicy", "cookiepolicyn")}; ändra
              eller återkalla ditt val när som helst via{" "}
              {lank("/?cookies=1", "kakinställningarna")}.
            </>
          ),
        },
      ])}

      {sektion("8. Så raderar du lokal data själv", [
        {
          p: (
            <>
              All lokaldata lagras under nycklar som börjar på{" "}
              <code className="rounded bg-muted px-1">ak1a-</code> (t.ex.{" "}
              <code className="rounded bg-muted px-1">ak1a-tracer-v1</code> för
              beteendedata,{" "}
              <code className="rounded bg-muted px-1">ak1a-elevkarna-v1</code> för
              elevkärnan,{" "}
              <code className="rounded bg-muted px-1">ak1a-klara-kurser</code> för
              progress). Öppna webbläsarens utvecklarverktyg → Application →
              Local Storage → ta bort ak1a-nycklarna, eller rensa
              webbplatsdata. Serverdata raderas via begäran till {epost}.
            </>
          ),
        },
      ])}

      {sektion("9. Barn och unga", [
        {
          p: (
            <>
              Tjänsten riktar sig inte till personer under 18 år, och medlemskap
              förutsätter att du har fyllt 18 (se{" "}
              {lank("/villkor", "användarvillkoren")}). Konto för minderårig
              kräver målsmans (vårdnadshavares) godkännande — kontakta oss i
              sådana fall.
            </>
          ),
        },
      ])}

      {sektion("10. Ändringar, relaterade dokument och kontakt", [
        {
          p: (
            <>
              Vi kan uppdatera policyn vid förändringar i tjänsten eller
              lagstiftning — större förändringar meddelas på plats och via
              e-post, och gällande version publiceras alltid med datum på denna
              sida.
            </>
          ),
        },
        {
          box: (
            <>
              <strong className="text-foreground">Kontakt.</strong> Frågor om
              personuppgifter besvaras via {epost} · AK1A Research Lab
              {ORG_NR_LANG} · lab.ak1nvestor.com. Relaterade dokument:{" "}
              {lank("/transparens", "Transparensregistret (artikel 13-registret)")},{" "}
              {lank("/cookiepolicy", "Cookiepolicyn (fullständig kaklista)")},{" "}
              {lank("/villkor", "Användarvillkoren (inklusive personuppgifts- och PRO-sektionerna)")} och{" "}
              {lank("/ansvar", "ansvarsfriskrivningen")}.
            </>
          ),
        },
      ])}
    </SeoPageShell>
  );
}
