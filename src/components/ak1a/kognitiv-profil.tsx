"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * FAS 1: Kognitiv Profilering — interaktivt textäventyr
 * Känner av: inlärningsstil, tidsallokering, drivkraft, kunskapsnivå, risktolerans
 * Resultat: LearnerProfile som driver ALL annan anpassning
 */

export type LearnerProfile = {
  stil: "visuell" | "text" | "praktisk";
  tid: "fokus10" | "fokus30" | "fokus60";
  drivkraft: "tavling" | "nyfikenhet" | "mal";
  niva: "nyborjare" | "intermediar" | "avancerad";
  risk: "konservativ" | "balanserad" | "aggressiv";
  scores: Record<string, number>;
  diagnostiserad: string;
};

const SCENARIER = [
  {
    id: "oster",
    rubrik: "🏝️ Du vaknar på en öde ö med en kassa full av pengar",
    fraga: "En flaskpost innehåller en prospekt för ett guldgruve-bolag. Vad gör du först?",
    alternativ: [
      { text: "📐 Räkna på bolagets tillgångar, skulder och marginal i sanden", poang: { praktisk: 2, text: 1 } },
      { text: "🗺️ Rita en karta över guldbolagets konkurrenter och marknad", poang: { visuell: 2, nyfikenhet: 1 } },
      { text: "📖 Läs hela prospektet från pärm till pärm — tre gånger", poang: { text: 2, mal: 1 } },
      { text: "⚡ Skicka ett SMS: 'Köper allt. Vad är värsta fallet?'", poang: { tavling: 2, aggressiv: 1 } },
    ],
  },
  {
    id: "tid",
    rubrik: "⏰ En vanlig tisdag — hur ser ditt liv ut?",
    fraga: "Du har 30 minuter över innan du ska somna. Vad gör du?",
    alternativ: [
      { text: "📱 Scrolla nyheter om aktier, snabbt och ytligt", poang: { fokus10: 2, tavling: 1 } },
      { text: "📖 Läs ett kapitel ur en investeringsbok — ostört", poang: { fokus30: 2, text: 1 } },
      { text: "💻 Öppna kalkylatorn och räkna på en aktie jag följer", poang: { fokus60: 2, praktisk: 1, mal: 1 } },
      { text: "🎧 Lyssna på en finans-podd — lär mig passivt", poang: { fokus10: 1, nyfikenhet: 1 } },
    ],
  },
  {
    id: "driv",
    rubrik: "🔥 Vad får dig att vilja lära dig mer?",
    fraga: "Du klarade ett svårt test. Vad känns bäst?",
    alternativ: [
      { text: "🏆 POÄNG! Jag slog rekordet och är bäst i klassen!", poang: { tavling: 3 } },
      { text: "💡 AHA-upplevelsen — nu förstår jag VARFÖR det funkar så!", poang: { nyfikenhet: 3 } },
      { text: "🎯 Jag är ett steg närmare mitt mål: bli oberoende analytiker", poang: { mal: 3 } },
      { text: "🤝 Jag kan nu hjälpa andra att förstå — det känns meningsfullt", poang: { nyfikenhet: 1, mal: 1 } },
    ],
  },
  {
    id: "risk",
    rubrik: "🎲 Du har 10 000 kr att investera",
    fraga: "Vilken portfölj väljer du?",
    alternativ: [
      { text: "🏦 80% räntefond + 20% bred index — jag sover gott om natten", poang: { konservativ: 3 } },
      { text: "⚖️ 50% index + 30% enskilda bolag + 20% kassa — balanserat", poang: { balanserad: 3 } },
      { text: "🚀 100% i tre småbolag jag tror på — high risk, high reward", poang: { aggressiv: 3, tavling: 1 } },
      { text: "🔍 60% i ett bolag jag analyserat djupt + 40% kassa — koncentrerad men grundad", poang: { balanserad: 1, mal: 1, praktisk: 1 } },
    ],
  },
  {
    id: "niva",
    rubrik: "📊 Vad kan du idag?",
    fraga: "Vad är ROE?",
    alternativ: [
      { text: "🤷 Ingen aning — men jag vill lära mig!", poang: { nyborjare: 3, nyfikenhet: 1 } },
      { text: "💡 Något med avkastning... på kapital? Ränta?", poang: { nyborjare: 2, intermediar: 1 } },
      { text: "📐 Resultat ÷ eget kapital — men jag är osäker på snitt vs slutvärde", poang: { intermediar: 3, mal: 1 } },
      { text: "🔬 Du Pont-uppdelning: marginal × omsättningshastighet × hävstång — och jag använder snitt EK", poang: { avancerad: 3, praktisk: 1 } },
    ],
  },
  {
    id: "paradox",
    rubrik: "🎭 Din bästa vän tipsar om en aktie som stigit 200%",
    fraga: "Vad är din första reaktion?",
    alternativ: [
      { text: "😤 FOMO! Jag köper direkt — annars missar jag tåget!", poang: { aggressiv: 2, tavling: 1 } },
      { text: "🔍 'Vad är bolagets affär? Vad är marginalen? P/E?' — analysera först", poang: { mal: 2, praktisk: 1 } },
      { text: "📊 'Låt mig rita en graf över kursen och fundamentals...' — visuellt", poang: { visuell: 2, nyfikenhet: 1 } },
      { text: "📖 'Har du läst årsredovisningen? Vad säger kassaflödet?' — text", poang: { text: 2, konservativ: 1 } },
    ],
  },
];

export function KognitivProfil() {
  const [steg, setSteg] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [profil, setProfil] = useState<LearnerProfile | null>(null);
  const [sparad, setSparad] = useState(false);

  useEffect(() => {
    const existerande = localStorage.getItem("ak1a-learner-profil");
    if (existerande) {
      setProfil(JSON.parse(existerande));
      setSparad(true);
    }
  }, []);

  const val = (alt: { poang: Record<string, number> }) => {
    const nya = { ...scores };
    for (const [k, v] of Object.entries(alt.poang)) {
      nya[k] = (nya[k] || 0) + v;
    }
    setScores(nya);
    if (steg < SCENARIER.length - 1) setSteg(steg + 1);
    else {
      // Bygg profil
      const best = (keys: string[]) => keys.reduce((a, b) => (nya[b] || 0) > (nya[a] || 0) ? b : a);
      const p: LearnerProfile = {
        stil: best(["visuell", "text", "praktisk"]) as LearnerProfile["stil"],
        tid: best(["fokus10", "fokus30", "fokus60"]) as LearnerProfile["tid"],
        drivkraft: best(["tavling", "nyfikenhet", "mal"]) as LearnerProfile["drivkraft"],
        niva: best(["nyborjare", "intermediar", "avancerad"]) as LearnerProfile["niva"],
        risk: best(["konservativ", "balanserad", "aggressiv"]) as LearnerProfile["risk"],
        scores: nya,
        diagnostiserad: new Date().toISOString(),
      };
      setProfil(p);
      localStorage.setItem("ak1a-learner-profil", JSON.stringify(p));
      setSparad(true);
    }
  };

  const borjaOm = () => {
    setSteg(0); setScores({}); setProfil(null); setSparad(false);
    localStorage.removeItem("ak1a-learner-profil");
  };

  // Visa profil om klar
  if (profil) {
    const rekommendation = `
      ${profil.niva === "nyborjare" ? "Börja med Nivå 1: Grunderna" : profil.niva === "intermediar" ? "Börja med Nivå 2: Fördjupning" : "Börja med Nivå 3: Bokmaster"}
    `.trim();

    const anpassning = [
      { ikon: "🎨", rubrik: "Inlärningsstil", varde: profil.stil, tips: profil.stil === "visuell" ? "Du lär bäst med grafer och bilder" : profil.stil === "text" ? "Du föredrar djupgående text" : "Du lär genom att GÖRA" },
      { ikon: "⏱️", rubrik: "Fokus", varde: profil.tid === "fokus10" ? "10-minuterspass" : profil.tid === "fokus30" ? "30-minuterspass" : "60+-minuterspass", tips: profil.tid === "fokus10" ? "Korta, intensiva mikro-lektioner" : profil.tid === "fokus30" ? "Medeldjup kapitel i behagligt tempo" : "Djupgående sessioner utan avbrott" },
      { ikon: "🔥", rubrik: "Drivkraft", varde: profil.drivkraft, tips: profil.drivkraft === "tavling" ? "Du motiveras av poäng, nivåer och ranking" : profil.drivkraft === "nyfikenhet" ? "Du drivs av AHA-upplevelser" : "Du fokuserar på att nå ditt mål" },
      { ikon: "📊", rubrik: "Nivå", varde: profil.niva, tips: profil.niva === "nyborjare" ? "Vi börjar från grunden" : profil.niva === "intermediar" ? "Du har grunderna — nu fördjupar vi" : "Du är redo för mästarna" },
      { ikon: "⚖️", rubrik: "Riskprofil", varde: profil.risk, tips: profil.risk === "konservativ" ? "Vi betonar Marginal of Safety extra" : profil.risk === "balanserad" ? "Balans mellan tillväxt och trygghet" : "Vi lär dig kanalisera din risk-appetit" },
    ];

    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border-2 border-gold bg-gradient-to-br from-gold/10 to-transparent p-8 text-center">
          <p className="text-4xl">🧠</p>
          <h2 className="mt-3 font-serif text-3xl font-bold">Din kognitiva profil</h2>
          <p className="mt-2 text-sm text-muted-foreground">AI-motorn använder detta för att anpassa din upplevelse</p>
        </div>

        <div className="mt-6 space-y-3">
          {anpassning.map((a) => (
            <div key={a.rubrik} className="flex items-center gap-4 rounded-xl border border-gold/20 bg-card p-4">
              <span className="text-2xl">{a.ikon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{a.rubrik}</p>
                <p className="font-serif text-lg font-bold capitalize">{a.varde}</p>
                <p className="text-xs italic text-gold">{a.tips}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-green-50 border-2 border-green-300 p-5 text-center">
          <p className="text-sm font-bold text-green-800">🎯 Din rekommenderade startpunkt</p>
          <p className="mt-1 text-lg">{rekommendation}</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/laroplan" className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-primary-foreground">
            Starta din anpassade läroplan →
          </Link>
          <button onClick={borjaOm} className="rounded-xl border border-gold/30 px-4 py-3 text-xs text-muted-foreground">
            Gör om testet
          </button>
        </div>
      </div>
    );
  }

  // Visa scenario
  const scenario = SCENARIER[steg];
  const framsteg = Math.round(((steg + 1) / SCENARIER.length) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border-2 border-gold/30 bg-card p-8">
        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Scenario {steg + 1} av {SCENARIER.length}</span>
          <span>{framsteg}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gold/15">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${framsteg}%` }} />
        </div>

        {/* Scenario */}
        <div key={steg} className="animate-[fadeIn_0.5s_ease-out]">
          <h2 className="mt-6 font-serif text-2xl font-bold">{scenario.rubrik}</h2>
          <p className="mt-3 text-sm italic text-muted-foreground">{scenario.fraga}</p>

          <div className="mt-6 space-y-3">
            {scenario.alternativ.map((alt, i) => (
              <button
                key={i}
                onClick={() => val(alt)}
                className="w-full rounded-xl border-2 border-gold/20 bg-paper px-5 py-4 text-left text-sm leading-relaxed transition-all hover:border-gold/50 hover:bg-gold/5"
              >
                <span className="mr-2 text-lg">{String.fromCharCode(65 + i)}</span>
                {alt.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
