import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";
// force-static ensamt ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser sedan våg 82.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/ansvar",
  title: "Ansvar & friskrivning — utbildning, inte rådgivning | AK1A",
  description:
    "AK1A:s ansvarsfriskrivning: allt material är pedagogisk utbildning — aldrig investerings-, finansiell, skatte- eller juridisk rådgivning. Historiska exempel är exempel, XP mäter lärande, egna beslut är ditt ansvar.",
  keywords: [
    "ansvar",
    "friskrivning",
    "ansvarsfriskrivning",
    "utbildning inte rådgivning",
    "historisk avkastning",
    "AK1A",
  ],
});

const lasMer = "font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold";

export default function AnsvarPage() {
  const sektion = (rubrik: string, stycken: React.ReactNode[]) => (
    <section className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{rubrik}</h2>
      {/* Strängar blir <p>; element (t.ex. sektion 9:s <ul>) wrappas i <div> —
          block-element inuti <p> är ogiltig HTML och bröt hydratiseringen
          (React #418 ×4 teman/skärmar, vaktsvep 2026-09-18T1730). */}
      {stycken.map((p, i) =>
        typeof p === "string" ? (
          <p key={i} className="mt-3 leading-relaxed text-muted-foreground">
            {p}
          </p>
        ) : (
          <div key={i} className="mt-3 leading-relaxed text-muted-foreground">
            {p}
          </div>
        ),
      )}
    </section>
  );

  return (
    <SeoPageShell breadcrumb={[{ name: "Ansvar & friskrivning" }]}>
      <h1 className="font-serif text-4xl font-bold">Ansvar &amp; friskrivning</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fastställd 2026-09-01 · gäller allt AK1A publicerar
      </p>

      {sektion("1. Utbildning — inte rådgivning", [
        "AK1A Research Lab är en pedagogisk plattform. Inget i vårt material — kurser, analyser, quiz, motorer, e-post eller annat — utgör investeringsrådgivning, finansiell rådgivning, skatterådgivning eller juridisk rådgivning.",
        "Regler som lagen om värdepappersmarknadsmissbruk och branschreglerna för rådgivare nämns här inte som våra förpliktelser: vi omfattas inte av dem, eftersom vi inte lämnar rådgivning. De förklarar däremot varför vi är så tydliga med gränsdragningen — redan antydan om skräddarsyda tips skulle omedelbart försvåra vårt pedagogiska uppdrag. Hur vi håller den gränsen i praktiken beskriver vi i vår finansiella policy.",
        <>
          Se även:{" "}
          <Link href="/finansiell-policy" className={lasMer}>
            Finansiell policy
          </Link>{" "}
          — ärlighet, ansvar och anti-casino-principen.
        </>,
      ])}

      {sektion("2. Egna beslut", [
        "Alla investeringsbeslut fattas självständigt av dig. Eleven ansvarar för sina handlingar — vi ansvarar för att utbilda. Vi kan inte och ska inte välja åt dig; målet är att du ska kunna resonera själv, inte följa någon annan.",
      ])}

      {sektion("3. Historisk data är pedagogik — inte rekommendation", [
        "När våra exempel använder historiska aktier — Precise Biometrics, Boliden och andra — är det PEDAGOGISKA exempel som visar hur en metod tillämpas steg för steg. Det är aldrig rekommendationer att köpa, sälja eller hålla någon värdepapper, vare sig nu eller i framtiden.",
        "Historisk avkastning är ingen garanti för framtida avkastning. Att en metod fungerat på ett historiskt material betyder inte att den kommer att göra det igen.",
      ])}

      {sektion("4. Ingen garanti — inga löften", [
        "Vi ger inga löften om avkastning, risknivå eller resultat — varken uttryckliga eller underförstådda. Formuleringar som 'garanterad avkastning' eller 'riskfritt' finns inte i vårt material och ska inte heller finnas där.",
        "XP, nivåer och badges mäter LÄRANDE — aldrig investeringsframgång. En hög nivå i AK1A betyder att du behärskar metodiken, inte att din portfölj kommer att stiga.",
      ])}

      {sektion("5. Verktyg och motorer är modeller", [
        "AKM1, AK1TS och Konfluensradarn är pedagogiska modeller — medvetna förenklingar av en komplex verklighet. De är byggda för att träna strukturerat tänkande, inte för att förutsäga marknaden.",
        "Underliggande data kan vara föråldrad, ofullständig eller fel. Kontrollera alltid mot primärkällor — framför allt bolagens egna rapporter och andra offentliga källor — innan du fattar ett beslut.",
      ])}

      {sektion("6. Tillgänglighet", [
        "Vi strävar efter hög tillgänglighet men garanterar inte oavbruten drifttid. Planerat underhåll, tekniska fel eller omständigheter utanför vår kontroll kan medföra avbrott. Planerade underhållsåtgärder annonseras i plattformen när det är möjligt.",
      ])}

      {sektion("7. Länkar till tredjepart", [
        "Vi länkar till externa aktörer — exempelvis Yahoo Finance för aktiedata och bokhandlar för litteratur. Vi styr inte deras innehåll, deras villkor eller deras tillgänglighet, och tar inget ansvar för vad som publiceras där.",
      ])}

      {sektion("8. Ansvarsgräns", [
        "Så långt lagen tillåter är vårt ansvar gentemot dig begränsat till det belopp du senast erlagt i avgift till oss. Tvingande konsumentskydd — exempelvis konsumenttjänstlagen (1985:716) och lagen (2022:261) om avtal om digitalt innehåll och digitala tjänster — urholkas aldrig av denna friskrivning.",
      ])}

      {sektion("9. Vad DU som elev ansvarar för", [
        "Ditt ansvar i tre punkter:",
        <ul key="elev" className="mt-3 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
          <li>Korrekt e-postadress — den är ditt konto, dina certifikat och din återställningsväg.</li>
          <li>Eget lösenord — håll det hemligt; kontoaktivitet som sker med dina inloggningsuppgifter är din ansvarighet.</li>
          <li>Egna beslut — och deras konsekvenser.</li>
        </ul>,
      ])}

      {sektion("Frågor", [
        "Frågor om detta material: info@ak1nvestor.com",
      ])}

      <div className="mt-12 rounded-lg border border-gold/30 bg-gold/5 p-4">
        <p className="font-serif text-lg font-bold">Relaterade sidor</p>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
          <li>
            <Link href="/finansiell-policy" className={lasMer}>
              Finansiell policy
            </Link>{" "}
            — den policy denna sida fördjupar: ärlighet, anti-casino, felloggning.
          </li>
          <li>
            <Link href="/upphovsratt" className={lasMer}>
              Upphovsrättspolicy
            </Link>{" "}
            — hur vi förhåller oss till de 101 kanonböckerna och andras rättigheter.
          </li>
          <li>
            <Link href="/kallor" className={lasMer}>
              Källor
            </Link>{" "}
            — fullständig förteckning över böcker och datakällor bakom kurserna.
          </li>
        </ul>
      </div>
    </SeoPageShell>
  );
}
