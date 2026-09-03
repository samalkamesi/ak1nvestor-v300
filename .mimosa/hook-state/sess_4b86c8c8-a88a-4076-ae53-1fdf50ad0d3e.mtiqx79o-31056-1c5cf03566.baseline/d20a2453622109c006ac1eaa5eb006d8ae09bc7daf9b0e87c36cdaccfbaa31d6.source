"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Scenario = {
  id: string;
  titel: string;
  situation: string;
  val: Array<{ text: string; risk: number; bias: string; poang: number }>;
};

const SCENARIOS: Scenario[] = [
  {
    id: "krasch",
    titel: "📉 Marknadskraschen",
    situation: "Klockan är 09:02 på måndagsmorgon. Under helgen har en stor bank kollapsat i USA. Din portfölj (500 000 kr) har fallit 18% i förhandeln. Du vaknar, öppnar din mobil och ser röda siffror överallt. Nyheterna pratar om 'den värsta krisen sedan 2008'. Vad gör du?",
    val: [
      { text: "🔥 SÄLJ ALLT NU — jag kan inte sova om natten med den här risken", risk: -2, bias: "Förlustaversion", poang: 0 },
      { text: "😤 SÄLJ HÄLFTEN — jag tar lite av risken av bordet", risk: 0, bias: "Känslomässig hedging", poang: 2 },
      { text: "😐 VÄNTA — jag gör ingenting innan jag läst mer om vad som hänt", risk: 2, bias: "Mr Market-läsning", poang: 5 },
      { text: "💰 KÖP MER — om bolagen är bra är detta en rabatt", risk: 4, bias: "Kontra-visuellt", poang: 3 },
    ],
  },
  {
    id: "tillväxt",
    titel: "🚀 Tillväxtbolaget",
    situation: "En vän tipsar om ett teknikbolag som stigit 300% på ett år. 'Alla pratar om det — det är som Tesla 2020!' Du tittar på kursgrafen: perfekt uppåtgående, vacker kurva. P/E är 85. Du förstår inte riktigt vad bolaget gör, men din vän är klok och har haft rätt förr. Vad gör du?",
    val: [
      { text: "📈 KÖP — min vän är klok och grafen ser fantastisk ut", risk: 4, bias: "Flockbeteende", poang: 0 },
      { text: "🔍 LÄS ÅRSREDOVISNINGEN först — vad gör bolaget egentligen?", risk: 1, bias: "Graham-analys", poang: 5 },
      { text: "⏳ VÄNTA — om det är verkligt kommer det finnas tid att köpa senare", risk: 2, bias: "Tålamod", poang: 4 },
      { text: "🚫 AVSTÅ — P/E 85 utan att jag förstår bolaget är spekulativt", risk: 3, bias: "Marginal-tänk", poang: 3 },
    ],
  },
  {
    id: "förlust",
    titler: "",
    titel: "📕 Förlustpositionen",
    situation: "Du köpte en aktie för tre månader sedan till 50 kr. Idag står den i 35 kr — en förlust på 30%. Bolaget har inte förändrats fundamentalt: samma affärsmodell, samma kunder, samma ledning. Det är bara marknadshumöret som svängt. Vad gör du?",
    val: [
      { text: "💀 SÄLJ — jag kan inte se den här förlusten varje dag", risk: -2, bias: "Förlustaversion", poang: 0 },
      { text: "🛒 KÖP MER — samma bolag, 30% billigare", risk: 4, bias: "Genomsnitt", poang: 4 },
      { text: "📊 KOLLA GRUNDERNA — har något förändrats som jag missat?", risk: 1, bias: "Analys", poang: 5 },
      { text: "⏸ GÖR INGENTING — om affären är oförändrad är kursen bara brus", risk: 3, bias: "Mr Market", poang: 4 },
    ],
  },
  {
    id: "emission",
    titel: "🎫 Nyemissionen",
    situation: "Ett bolag du äger gör en nyemission till 40% rabatt mot marknadspriset. Du måste bestämma inom 5 dagar. Om du inte tecknar späds din andel ut med 15%. Men du har redan mycket i det här bolaget. Vad gör du?",
    val: [
      { text: "💳 TECKNA ALLT — 40% rabatt är för bra för att missa", risk: 3, bias: "Overconfidence", poang: 2 },
      { text: "⚖️ RÄKNA PÅ TERP — vad är aktien värd EFTER utspädningen?", risk: 1, bias: "Matematik", poang: 5 },
      { text: "🚫 TECKNA INTE — jag har redan för mycket i ett bolag", risk: 2, bias: "Diversifiering", poang: 4 },
      { text: "🤔 LÄS PROSPEKTET först — varför behöver bolaget kapital?", risk: 1, bias: "Grundanalys", poang: 5 },
    ],
  },
  {
    id: "framgång",
    titel: "🏆 Vinstpositionen",
    situation: "En aktie du köpte för ett år sedan har stigit 80%. Du har en stor vinst. Din analys säger att bolaget fortfarande är rättvärderat — inte billigt, inte dyrt. Men du känner en stark lust att 'ta av vinsten'. Vad gör du?",
    val: [
      { text: "💰 SÄLJ ALLT — ta vinsten medan den finns", risk: -1, bias: "Ankarning", poang: 1 },
      { text: "⚖️ SÄLJ HÄLFTEN — lås in lite, låt resten springa", risk: 1, bias: "Balans", poang: 4 },
      { text: "📊 KOLLA OM TESEN ÄR INTAKT — om affären är oförändrad, behåll", risk: 2, bias: "Långsiktighet", poang: 5 },
      { text: "🔥 KÖP MER — det går upp, det måste fortsätta", risk: 4, bias: "Eufori", poang: 0 },
    ],
  },
];

type Profil = {
  riskaptit: number;
  biases: string[];
  starkaSidor: string[];
  rekommenderadNiva: number;
  personlighet: string;
  beskrivning: string;
};

export function KognitivProfiler() {
  const [steg, setSteg] = useState(0);
  const [svar, setSvar] = useState<Array<{ scenarioId: string; valIndex: number; risk: number; bias: string; poang: number }>>([]);
  const [klar, setKlar] = useState(false);
  const router = useRouter();

  const scenario = SCENARIOS[steg];
  const total = SCENARIOS.length;

  const val = (index: number) => {
    const v = scenario.val[index];
    setSvar((p) => [...p, { scenarioId: scenario.id, valIndex: index, risk: v.risk, bias: v.bias, poang: v.poang }]);
    if (steg < total - 1) setSteg(steg + 1);
    else setKlar(true);
  };

  const analysera = (): Profil => {
    const snittRisk = svar.reduce((s, v) => s + v.risk, 0) / Math.max(1, svar.length);
    const snittPoang = svar.reduce((s, v) => s + v.poang, 0) / Math.max(1, svar.length);
    const biases = [...new Set(svar.map((v) => v.bias))];
    const starka = biases.filter((b) => ["Mr Market-läsning", "Graham-analys", "Analys", "Matematik", "Långsiktighet", "Grundanalys", "Tålamod"].includes(b));

    let personlighet = "";
    let beskrivning = "";
    let niva = 1;

    if (snittRisk < 0) {
      personlighet = "🛡️ Risk-avers";
      beskrivning = "Du undviker risk — ibland så mycket att du säljer i panik när du borde hålla eller köpa. Din största utmaning är att hantera Mr Markets humör utan att låta det påverka dina beslut.";
      niva = 1;
    } else if (snittRisk < 1.5) {
      personlighet = "⚖️ Balanserad";
      beskrivning = "Du har en sund balans mellan försiktighet och risk. Du tenderar att analysera innan du agerar — Graham skulle nicka gillande. Din utmaning är att våga agera när marginalen är uppenbar.";
      niva = 2;
    } else if (snittRisk < 2.5) {
      personlighet = "🎯 Analytisk";
      beskrivning = "Du tänker som en analytiker — du vill förstå innan du agerar. Detta är en styrka men kan också bli en fälla om du överanalyserar och aldrig handlar. Din utmaning: våga agera när siffrorna är tydliga.";
      niva = 3;
    } else {
      personlighet = "🚀 Risk-tagare";
      beskrivning = "Du är beredd att ta risk — ibland för mycket. Din energi är en styrka men du behöver Grahams Marginal of Safety som skyddsnät. Din utmaning: lär dig skilja mellan kalkylerad risk och ren spekulation.";
      niva = 2;
    }

    if (snittPoang >= 4) niva = Math.min(5, niva + 1);
    if (snittPoang < 2) niva = Math.max(1, niva - 1);

    return { riskaptit: Math.round(snittRisk * 10) / 10, biases, starkaSidor: starka, rekommenderadNiva: niva, personlighet, beskrivning };
  };

  if (klar) {
    const profil = analysera();
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border-2 border-gold/40 bg-card p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Din finansiella personlighet</p>
          <p className="mt-3 text-5xl">{profil.personlighet.split(" ")[0]}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-gold">{profil.personlighet.split(" ").slice(1).join(" ")}</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">{profil.beskrivning}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-paper p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Riskaptit</p>
              <p className="mt-1 font-serif text-2xl font-bold text-gold">{profil.riskaptit}</p>
              <p className="text-[10px] text-muted-foreground">-2 (avers) till +4 (aggressiv)</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Rekommenderad nivå</p>
              <p className="mt-1 font-serif text-2xl font-bold text-gold">{profil.rekommenderadNiva}</p>
              <p className="text-[10px] text-muted-foreground">av 5 i läroplanen</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Bias att vakta</p>
              <p className="mt-1 text-xs font-semibold text-orange-600">{profil.biases.filter(b => !starkaIncludes(profil.starkaSidor, b)).slice(0, 2).join(", ") || "Inga uppenbara"}</p>
            </div>
          </div>

          {profil.starkaSidor.length > 0 && (
            <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3">
              <p className="text-[10px] uppercase tracking-widest text-green-700">Starka sidor</p>
              <p className="mt-1 text-sm text-green-800">{profil.starkaSidor.join(" · ")}</p>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <Link href="/laroplan" className="block rounded-xl bg-gold px-6 py-3 text-sm font-bold text-primary-foreground">
              Starta AKM1-läroplanen (Nivå {profil.rekommenderadNiva}) →
            </Link>
            <Link href="/kurser/the-intelligent-investor" className="block text-xs underline hover:text-gold">
              Eller börja med Graham komplett →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function starkaIncludes(starka: string[], bias: string): boolean {
    return starka.includes(bias);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">
          Scenario {steg + 1} av {total}
        </p>
        <div className="flex gap-1">
          {SCENARIOS.map((_, i) => (
            <span key={i} className={`h-1.5 w-8 rounded-full ${i < steg ? "bg-gold" : i === steg ? "bg-gold/60" : "bg-gold/15"}`} />
          ))}
        </div>
      </div>

      <div key={steg} className="mt-6 animate-[fadeIn_0.5s_ease-out]">
        <h2 className="font-serif text-2xl font-bold">{scenario.titel}</h2>
        <p className="mt-4 rounded-xl border-l-4 border-gold/50 bg-gold/5 px-5 py-4 text-sm leading-relaxed text-foreground/90">
          {scenario.situation}
        </p>

        <div className="mt-6 space-y-3">
          {scenario.val.map((v, i) => (
            <button
              key={i}
              onClick={() => val(i)}
              className="w-full rounded-xl border border-gold/25 bg-card px-5 py-4 text-left text-sm font-medium transition-all hover:border-gold/60 hover:bg-gold/5"
            >
              {v.text}
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
