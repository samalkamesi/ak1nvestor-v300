"use client";

import { useState } from "react";
import Link from "next/link";
import { uppmuntran } from "@/lib/pedagogik";

/**
 * PROFILTESTET — två moduler, en samlad bild (ERRRC-audit M1-djupmerge).
 *
 * Modul 1 "Din inlärningsstil" — hur du tar in och vill studera (ärvda
 * frågor ur diagnosens scenario-spel, omskrivna i pedagogik.ts-ton).
 * Modul 2 "Din riskprofil" — hur du fattar beslut under press (oförändrad).
 * Resultat: "Din analytikerprofil" — typ-namn, rekommenderad läroplansnivå
 * och hur inlärningsstilen påverkar studievanorna.
 *
 * Hydration-säker: allt client-state, inget Date/localStorage under render.
 */

/* ── MODUL 1: Din inlärningsstil ──────────────────────────────────────── */

type LarandeFraga = {
  id: string;
  rubrik: string;
  fraga: string;
  alternativ: Array<{ text: string; poang: Record<string, number> }>;
};

const INLARNINGSFRAGOR: LarandeFraga[] = [
  {
    id: "o",
    rubrik: "🏝️ Tre timmar ensam med ett prospekt",
    fraga: "Ett gruvbolag du aldrig hört talas om ligger framför dig. Hur sätter du dig helst in i det?",
    alternativ: [
      { text: "🗺️ Jag skissar bolaget, branschen och konkurrenterna som en karta", poang: { visuell: 2, nyfikenhet: 1 } },
      { text: "📖 Jag läser prospektet från pärm till pärm — ostört och i min egen takt", poang: { text: 2, mal: 1 } },
      { text: "🧮 Jag räknar själv på tillgångar, skulder och marginal", poang: { praktisk: 2, nyfikenhet: 1 } },
      { text: "☕ Jag börjar med sammanfattningen och samtalen kring bolaget", poang: { text: 1, fokus10: 1 } },
    ],
  },
  {
    id: "tid",
    rubrik: "⏰ En vanlig tisdagskväll",
    fraga: "Du har en halvtimme över innan sömn. Vad känns mest som du?",
    alternativ: [
      { text: "📱 Några snabba nyheter och en kort video — koncentrerat", poang: { fokus10: 2, tavling: 1 } },
      { text: "📖 Ett kapitel ur en investeringsbok, i lugn och ro", poang: { fokus30: 2, text: 1 } },
      { text: "💻 Kalkylbladet framför mig — jag räknar klart det jag påbörjat", poang: { fokus60: 2, praktisk: 1, mal: 1 } },
      { text: "🎧 En finans-podd på promenaden — lär mig medan jag rör mig", poang: { fokus10: 1, nyfikenhet: 1 } },
    ],
  },
  {
    id: "driv",
    rubrik: "🔥 Vad får dig att vilja fortsätta lära?",
    fraga: "Du har klickat dig igenom något riktigt svårt. Vilken del känns bäst i kroppen?",
    alternativ: [
      { text: "🏆 Siffran som visar att jag klarade det — gärna synligt", poang: { tavling: 3 } },
      { text: "💡 Aha-känslan — nu förstår jag varför det hänger ihop", poang: { nyfikenhet: 3 } },
      { text: "🎯 Att steget är avklarat på vägen mot mitt mål", poang: { mal: 3 } },
      { text: "🤝 Att jag nu kan förklara det för någon annan", poang: { nyfikenhet: 1, mal: 1 } },
    ],
  },
  {
    id: "paradox",
    rubrik: "📊 Din vän tipsar om en aktie som stigit 200%",
    fraga: "Vad är din första instinkt?",
    alternativ: [
      { text: "📈 Visa mig grafen — jag vill se resan bolaget gjort", poang: { visuell: 2, nyfikenhet: 1 } },
      { text: "📖 Har någon läst årsredovisningen? Vad säger kassaflödet?", poang: { text: 2, mal: 1 } },
      { text: "🧮 Vilken marginal finns? Jag vill räkna själv", poang: { praktisk: 2, mal: 1 } },
      { text: "⏳ Lugn — om det är verkligt hinner jag sätta mig in i det i lugn och ro", poang: { nyfikenhet: 1, fokus60: 1 } },
    ],
  },
];

type LarandeStil = {
  stil: "visuell" | "text" | "praktisk";
  tid: "fokus10" | "fokus30" | "fokus60";
  drivkraft: "tavling" | "nyfikenhet" | "mal";
};

const STIL_KORT: Record<LarandeStil["stil"], { namn: string; studievanor: string }> = {
  visuell: {
    namn: "kartläsaren",
    studievanor: "Börja med graf-kurserna — du tar in mest när siffrorna får form. Sök först kurser med diagram och visualiseringar, så landar resten naturligt.",
  },
  text: {
    namn: "djupläsaren",
    studievanor: "Börja med de textbaserade originalverken — läs Graham kapitel för kapitel i ditt eget tempo. Din tålamod med text är en styrka hela vägen till bokmästarnivå.",
  },
  praktisk: {
    namn: "räknaren",
    studievanor: "Börja i verktygen — öppna kalkylatorn och räkna på ett riktigt bolag medan du lär dig. Varje kurs blir levande när du får prova på direkt.",
  },
};

const TID_KORT: Record<LarandeStil["tid"], string> = {
  fokus10: "Korta, intensiva pass på cirka tio minuter passar dig fint.",
  fokus30: "En lugn halvtimme per pass — lagom djup utan avbrott.",
  fokus60: "Djupa, ostörda sessioner där du får räkna till punkt.",
};

const DRIV_KORT: Record<LarandeStil["drivkraft"], string> = {
  tavling: "Poäng och streaks ger dig energi — låt dem bära dig genom läroplanen.",
  nyfikenhet: "Följ aha-upplevelserna — din nyfikenhet vet vilken kurs som är nästa.",
  mal: "Sätt ett mål — varje avklarat kurssteg är en stapel mot det.",
};

/* ── MODUL 2: Din riskprofil (oförändrade scenarier) ──────────────────── */

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
    situation: "Ett bolag du äger gör en nyemission till 40% rabatt mot marknadspriset. Du måste bestämma dig inom 5 dagar. Om du inte tecknar späds din andel ut med 15%. Men du har redan mycket i det här bolaget. Vad gör du?",
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

/* ── Sammanställning ─────────────────────────────────────────────────── */

type Riskprofil = {
  riskaptit: number;
  biases: string[];
  starkaSidor: string[];
  rekommenderadNiva: number;
  emoji: string;
  adjektiv: string;
  beskrivning: string;
};

const STARKA_BIAS = ["Mr Market-läsning", "Graham-analys", "Analys", "Matematik", "Långsiktighet", "Grundanalys", "Tålamod"];

function analyseraRisk(svar: Array<{ risk: number; bias: string; poang: number }>): Riskprofil {
  const snittRisk = svar.reduce((s, v) => s + v.risk, 0) / Math.max(1, svar.length);
  const snittPoang = svar.reduce((s, v) => s + v.poang, 0) / Math.max(1, svar.length);
  const biases = [...new Set(svar.map((v) => v.bias))];
  const starkaSidor = biases.filter((b) => STARKA_BIAS.includes(b));

  let emoji = "";
  let adjektiv = "";
  let beskrivning = "";
  let niva = 1;

  if (snittRisk < 0) {
    emoji = "🛡️";
    adjektiv = "Den försiktige";
    beskrivning = "Du undviker risk — ibland så mycket att du säljer i panik när du borde hålla eller köpa. Din största utmaning är att hantera Mr Markets humör utan att låta det påverka dina beslut.";
    niva = 1;
  } else if (snittRisk < 1.5) {
    emoji = "⚖️";
    adjektiv = "Den balanserade";
    beskrivning = "Du har en sund balans mellan försiktighet och risk. Du tenderar att analysera innan du agerar — Graham skulle nicka gillande. Din utmaning är att våga agera när marginalen är uppenbar.";
    niva = 2;
  } else if (snittRisk < 2.5) {
    emoji = "🎯";
    adjektiv = "Den metodiske";
    beskrivning = "Du tänker som en analytiker — du vill förstå innan du agerar. Detta är en styrka men kan också bli en fälla om du överanalyserar och aldrig handlar. Din utmaning: våga agera när siffrorna är tydliga.";
    niva = 3;
  } else {
    emoji = "🚀";
    adjektiv = "Den modige";
    beskrivning = "Du är beredd att ta risk — ibland för mycket. Din energi är en styrka men du behöver Grahams Marginal of Safety som skyddsnät. Din utmaning: lär dig skilja mellan kalkylerad risk och ren spekulation.";
    niva = 2;
  }

  if (snittPoang >= 4) niva = Math.min(5, niva + 1);
  if (snittPoang < 2) niva = Math.max(1, niva - 1);

  return {
    riskaptit: Math.round(snittRisk * 10) / 10,
    biases,
    starkaSidor,
    rekommenderadNiva: niva,
    emoji,
    adjektiv,
    beskrivning,
  };
}

function raknaLarandeStil(scores: Record<string, number>): LarandeStil {
  const best = (keys: string[]) => keys.reduce((a, b) => ((scores[b] || 0) > (scores[a] || 0) ? b : a));
  return {
    stil: best(["visuell", "text", "praktisk"]) as LarandeStil["stil"],
    tid: best(["fokus10", "fokus30", "fokus60"]) as LarandeStil["tid"],
    drivkraft: best(["tavling", "nyfikenhet", "mal"]) as LarandeStil["drivkraft"],
  };
}

/* ── Komponent ───────────────────────────────────────────────────────── */

type Fas = "intro" | "modul1" | "modul2" | "resultat";

export function KognitivProfiler() {
  const [fas, setFas] = useState<Fas>("intro");
  const [steg1, setSteg1] = useState(0);
  const [steg2, setSteg2] = useState(0);
  const [larandeScores, setLarandeScores] = useState<Record<string, number>>({});
  const [svar, setSvar] = useState<Array<{ scenarioId: string; valIndex: number; risk: number; bias: string; poang: number }>>([]);

  const borjaOm = () => {
    setFas("intro");
    setSteg1(0);
    setSteg2(0);
    setLarandeScores({});
    setSvar([]);
  };

  const valLarande = (alt: { poang: Record<string, number> }) => {
    const nya = { ...larandeScores };
    for (const [k, v] of Object.entries(alt.poang)) {
      nya[k] = (nya[k] || 0) + v;
    }
    setLarandeScores(nya);
    if (steg1 < INLARNINGSFRAGOR.length - 1) setSteg1(steg1 + 1);
    else setFas("modul2");
  };

  const scenario = SCENARIOS[steg2];

  const valScenario = (index: number) => {
    const v = scenario.val[index];
    setSvar((p) => [...p, { scenarioId: scenario.id, valIndex: index, risk: v.risk, bias: v.bias, poang: v.poang }]);
    if (steg2 < SCENARIOS.length - 1) setSteg2(steg2 + 1);
    else setFas("resultat");
  };

  /* ── Resultat: Din analytikerprofil ── */

  if (fas === "resultat") {
    const risk = analyseraRisk(svar);
    const stil = raknaLarandeStil(larandeScores);
    const stilKort = STIL_KORT[stil.stil];
    const typNamn = `${risk.adjektiv} ${stilKort.namn}`;
    const biasAttVakta = risk.biases.filter((b) => !risk.starkaSidor.includes(b)).slice(0, 2);

    return (
      <div className="mx-auto max-w-2xl">
        <div className="marin-panel rounded-2xl p-8 text-center">
          <p className="text-xs uppercase tracking-widest opacity-80">Din analytikerprofil</p>
          <p className="mt-3 text-5xl">{risk.emoji}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold capitalize text-gold">{typNamn}</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed opacity-90">{risk.beskrivning}</p>
          <p className="mx-auto mt-3 max-w-lg text-xs italic opacity-70">{uppmuntran("klar")}</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gold/25 bg-card p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Riskaptit</p>
            <p className="mt-1 font-serif text-2xl font-bold text-gold tabular-nums">{risk.riskaptit}</p>
            <p className="text-[10px] text-muted-foreground">-2 (avers) till +4 (aggressiv)</p>
          </div>
          <div className="rounded-xl border border-gold/25 bg-card p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Rekommenderad nivå</p>
            <p className="mt-1 font-serif text-2xl font-bold text-gold tabular-nums">{risk.rekommenderadNiva}</p>
            <p className="text-[10px] text-muted-foreground">av 5 i läroplanen</p>
          </div>
          <div className="rounded-xl border border-gold/25 bg-card p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Bias att vakta</p>
            <p className="mt-1 text-xs font-semibold text-orange-600">{biasAttVakta.join(", ") || "Inga uppenbara"}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-gold/40 bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-gold">Din inlärningsstil → studievanor</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{stilKort.studievanor}</p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">⏱️ {TID_KORT[stil.tid]}</p>
            <p className="text-sm text-muted-foreground">🔥 {DRIV_KORT[stil.drivkraft]}</p>
          </div>
        </div>

        {risk.starkaSidor.length > 0 && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="text-[10px] uppercase tracking-widest text-green-700">Starka sidor</p>
            <p className="mt-1 text-sm text-green-800">{risk.starkaSidor.join(" · ")}</p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <Link href="/laroplan" className="btn-marin block px-6 py-3 text-center text-sm">
            Starta AKM1-läroplanen (från nivå {risk.rekommenderadNiva}) →
          </Link>
          <Link href="/kurser/the-intelligent-investor" className="block text-center text-xs underline hover:text-gold">
            Eller börja med Graham komplett →
          </Link>
          <button onClick={borjaOm} className="block w-full text-center text-xs text-muted-foreground hover:text-gold">
            Gör om profilen
          </button>
        </div>
      </div>
    );
  }

  /* ── Intro ── */

  if (fas === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="marin-panel rounded-2xl p-8 text-center">
          <p className="text-4xl">🧠</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-gold">Din profil — två moduler, en helhet</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed opacity-90">
            Först hur du lär dig bäst, sedan hur du fattar beslut under press. Tillsammans
            blir det din analytikerprofil — och vi kan tipsa rätt kurser, i rätt ordning,
            för just dig.
          </p>
          <div className="mx-auto mt-6 grid max-w-md gap-3 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-gold/25 p-4">
              <p className="text-xs uppercase tracking-widest text-gold">Modul 1</p>
              <p className="mt-1 font-serif text-lg font-bold">Din inlärningsstil</p>
              <p className="mt-1 text-xs opacity-80">4 snabba val — hur du tar in och vill studera.</p>
            </div>
            <div className="rounded-xl border border-gold/25 p-4">
              <p className="text-xs uppercase tracking-widest text-gold">Modul 2</p>
              <p className="mt-1 font-serif text-lg font-bold">Din riskprofil</p>
              <p className="mt-1 text-xs opacity-80">5 marknadsscenarier — dina val under press.</p>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-md text-xs italic opacity-70">{uppmuntran("start")}</p>
          <p className="mt-2 text-[10px] uppercase tracking-widest opacity-60">Ingen rätt eller fel · ca 5 minuter</p>
          <button onClick={() => setFas("modul1")} className="btn-marin mt-6 px-8 py-3 text-sm">
            Starta modul 1 →
          </button>
        </div>
      </div>
    );
  }

  /* ── Modul 1: Din inlärningsstil ── */

  if (fas === "modul1") {
    const fraga = INLARNINGSFRAGOR[steg1];
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">
            Modul 1 av 2 · Din inlärningsstil
          </p>
          <div className="flex gap-1">
            {INLARNINGSFRAGOR.map((_, i) => (
              <span key={i} className={`h-1.5 w-8 rounded-full ${i < steg1 ? "bg-gold" : i === steg1 ? "bg-gold/60" : "bg-gold/15"}`} />
            ))}
          </div>
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Val {steg1 + 1} av {INLARNINGSFRAGOR.length}</p>

        <div key={steg1} className="mt-6 animate-[fadeIn_0.5s_ease-out]">
          <h2 className="font-serif text-2xl font-bold">{fraga.rubrik}</h2>
          <p className="mt-4 rounded-xl border-l-4 border-gold/50 bg-gold/5 px-5 py-4 text-sm leading-relaxed text-foreground/90">
            {fraga.fraga}
          </p>

          <div className="mt-6 space-y-3">
            {fraga.alternativ.map((alt, i) => (
              <button
                key={i}
                onClick={() => valLarande(alt)}
                className="w-full rounded-xl border border-gold/25 bg-card px-5 py-4 text-left text-sm font-medium transition-all hover:border-gold/60 hover:bg-gold/5"
              >
                {alt.text}
              </button>
            ))}
          </div>
        </div>

        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  /* ── Modul 2: Din riskprofil ── */

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">
          Modul 2 av 2 · Din riskprofil
        </p>
        <div className="flex gap-1">
          {SCENARIOS.map((_, i) => (
            <span key={i} className={`h-1.5 w-8 rounded-full ${i < steg2 ? "bg-gold" : i === steg2 ? "bg-gold/60" : "bg-gold/15"}`} />
          ))}
        </div>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Scenario {steg2 + 1} av {SCENARIOS.length}</p>

      {steg2 === 0 && (
        <p className="mt-4 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-xs italic text-muted-foreground">
          Del 1 klar — tack! Nu sätter vi din riskprofil på prov i fem verkliga marknadssituationer.
        </p>
      )}

      <div key={steg2} className="mt-6 animate-[fadeIn_0.5s_ease-out]">
        <h2 className="font-serif text-2xl font-bold">{scenario.titel}</h2>
        <p className="mt-4 rounded-xl border-l-4 border-gold/50 bg-gold/5 px-5 py-4 text-sm leading-relaxed text-foreground/90">
          {scenario.situation}
        </p>

        <div className="mt-6 space-y-3">
          {scenario.val.map((v, i) => (
            <button
              key={i}
              onClick={() => valScenario(i)}
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
