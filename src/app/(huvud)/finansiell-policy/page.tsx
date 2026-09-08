import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/finansiell-policy",
  title: "Finansiell policy — ärlighet, ansvar, anti-casino | AK1A",
  description:
    "AK1A:s finansiella policy: pedagogisk analys är aldrig investeringsråd, teorier redovisas som struktureringsverktyg, alla fel loggas öppet, anti-casino-principen gäller alltid.",
  keywords: ["finansiell policy", "ansvarsfriskrivning", "pedagogisk analys", "AK1A", "anti-casino"],
});

export default function FinansiellPolicyPage() {
  const sektion = (rubrik: string, stycken: string[]) => (
    <section className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{rubrik}</h2>
      {stycken.map((p, i) => (
        <p key={i} className="mt-3 leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
    </section>
  );

  return (
    <SeoPageShell breadcrumb={[{ name: "Finansiell policy" }]}>
      <h1 className="font-serif text-4xl font-bold">Finansiell policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Fastställd 2026-08-25 · gäller allt AK1A publicerar</p>

      {sektion("1. Vad vi är — och inte är", [
        "AK1A Research Lab bedriver pedagogisk finansanalys. Vi lär ut metodik. Vi utfärdar ALDRIG personliga investeringsråd, förvaltning eller rekommendationer i mar-knadsmissbruksförordningens (MAR) mening. Alla exempel, analyser och verktyg är undervisningsmaterial.",
      ])}

      {sektion("2. Teoriernas status — redovisad ärlighet", [
        "Elliott-vågor, Fibonacci, GANN, Lucas-cykler och volymanalys är heuristiska struktureringsverktyg utan vetenskapligt belagd prediktiv förmåga. De används för att strukturera tänkandet — aldrig som bevis. Vår motor beräknar proxy-signaler ur pris- och volymdata och märker dem som sådana i varje rapport.",
        "Faktiska marknadsdata hämtas från oberoende källor (Yahoo Finance, MarketStack, Stooq). Källa redovisas per analys. Uppskkattningar markeras [est.].",
      ])}

      {sektion("3. Anti-casino", [
        "Inga push-notiser om priser. Inga snabba beslut. Inga löften om avkastning. Ord som 'garanterad avkastning', 'riskfritt' eller 'slå index varje år' förekommer aldrig i vårt material — se vårt varumärkes-system där de är förbjudna fraser.",
      ])}

      {sektion("4. Reproducerbarhet och felloggning", [
        "Varje analys publiceras med sina antaganden och källor så att den kan granskas steg för steg. När vi har fel loggar vi det öppet och poängsätter våra egna prognoser i nästa version — självläkande metodik är kärnan i trovärdighet.",
      ])}

      {sektion("5. Organ-systemens autonomi och gränser", [
        "Våra AI-organ (analyserar, föreslår, optimerar) arbetar med hårda tak: loggmaximi på 500 rader, 30 dagars retention, och deterministiska (icke-slumpade) beslut. Organen föreslår — penningflöden och produktbeslut godkänns alltid av grundaren innan genomförande.",
      ])}

      {sektion("6. Ansvar", [
        "Historisk avkastning är ingen garanti för framtida avkastning. Alla beslut fattas på egen risk. AK1A Research Lab tar inget ansvar för direkta eller indirekta förluster som uppstår genom användning av materialet. Vid avvikelse mellan denna policy och Sverige/EU:s regelverk gäller regelverket.",
        "Fragor: info@ak1nvestor.com",
      ])}
    </SeoPageShell>
  );
}
