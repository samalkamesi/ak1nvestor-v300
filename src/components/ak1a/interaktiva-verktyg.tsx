"use client";

import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════
// A1: MARGINAL-KALKYLATOR — interaktiv, direkt i kursen
// Eleven drar reglage och SER marginalen förändras visuellt
// ═══════════════════════════════════════════════════════════
export function MarginalKalkylator() {
  const [varde, setVarde] = useState(100);
  const [pris, setPris] = useState(70);
  const marginal = Math.round(((varde - pris) / Math.max(1, varde)) * 100);
  const broBredd = 200;
  const lastBredd = Math.min(broBredd, (pris / Math.max(1, varde)) * broBredd);
  const sakert = marginal >= 30;

  return (
    <div className="rounded-2xl border-2 border-gold/40 bg-card p-6">
      <p className="text-sm font-bold uppercase tracking-widest text-gold">
        🌉 Övning: Beräkna din egen marginal of safety
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Dra reglagen. Se hur bron reagerar. Lär känna när det är säkert att gå på.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gold">Ditt beräknade VÄRDE</span>
            <span className="font-mono text-lg text-gold">{varde} kr</span>
          </div>
          <input type="range" min="10" max="200" value={varde} onChange={(e) => setVarde(Number(e.target.value))} className="mt-1 w-full accent-[#a8862a]" />
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Aktuell KURS (pris)</span>
            <span className="font-mono text-lg text-foreground">{pris} kr</span>
          </div>
          <input type="range" min="5" max="200" value={pris} onChange={(e) => setPris(Number(e.target.value))} className="mt-1 w-full accent-[#a8862a]" />
        </div>
      </div>

      {/* Visuell bro */}
      <div className="mt-6 overflow-hidden rounded-xl bg-paper p-4">
        <svg viewBox="0 0 300 120" className="w-full">
          {/* Bro-båge */}
          <path d="M20 80 Q150 30 280 80" stroke={sakert ? "#047857" : "#b91c1c"} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7" />
          {/* Pelare */}
          {[50, 100, 150, 200, 250].map((x) => (
            <line key={x} x1={x} y1={80} x2={x} y2={100} stroke="#c9a84c" strokeWidth="4" />
          ))}
          {/* Mark }}
          <line x1="0" y1="100" x2="300" y2="100" stroke="#5a5045" strokeWidth="2" opacity="0.3" />

          {/* Last = priset */}
          <rect x={150 - lastBredd / 2} y={50} width={lastBredd} height={25} rx="5"
            fill={sakert ? "#d97706" : "#b91c1c"} opacity="0.85" />
          <text x={150} y={67} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">
            PRIS {pris}
          </text>

          {/* Bro-kapacitet */}
          <text x={150} y={115} textAnchor="middle" fontSize="9" fill={sakert ? "#047857" : "#b91c1c"} fontWeight="bold">
            KONSTRUKTION FÖR {varde}
          </text>

          {/* Marginal-pil */}
          {marginal > 0 && (
            <>
              <path d={`M ${150 + lastBredd / 2} 40 L ${150 + broBredd / 2 - 10} 40`} stroke="#047857" strokeWidth="2" markerEnd="▶" />
              <text x={150 + (lastBredd + broBredd) / 4} y={35} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#047857">
                +{marginal}%
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Resultat */}
      <div className={`mt-4 rounded-xl p-4 text-center ${sakert ? "bg-green-50 border border-green-300" : "bg-red-50 border border-red-300"}`}>
        <p className={`text-2xl font-bold ${sakert ? "text-green-700" : "text-red-700"}`}>
          {marginal > 0 ? `+${marginal}% marginal` : `${marginal}% — ÖVERVÄRDERAD`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {sakert
            ? "✓ Säker att gå på bron — du kan ha fel och ändå överleva"
            : marginal > 0
              ? "⚠ Tunn marginal — bro som knappt bär lasten"
              : "✗ Ingen marginal — bron kollapsar om du har fel"}
        </p>
        <p className="mt-2 text-[11px] italic text-gold">
          Grahams regel: minst 30% marginal för trygghet
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// A2: MR MARKET-SIMULATOR — träna på att inte reagera
// 30 dagar av slumpmässiga prisrörelser — kan du hålla nerverna?
// ═══════════════════════════════════════════════════════════
export function MrMarketSimulator() {
  const [dag, setDag] = useState(0);
  const [kurs, setKurs] = useState(100);
  const [historik, setHistorik] = useState<number[]>([100]);
  const [agande, setAgande] = useState(false);
  const [poang, setPoang] = useState(0);
  const [meddelande, setMeddelande] = useState("Mr Market knackar på... tryck Nästa dag");

  const nextDay = () => {
    if (dag >= 30) return;
    // Simulerad MR Market: mean-reverting med drift
    const drift = (100 - kurs) * 0.1; // drar mot "verkligt värde" 100
    const noise = (Math.random() - 0.5) * 15;
    const nyKurs = Math.max(20, kurs + drift + noise);
    setKurs(nyKurs);
    setHistorik((p) => [...p, nyKurs]);
    setDag(dag + 1);

    // Mr Market kommenterar
    if (nyKurs < 60) setMeddelande("😰 PANIK! 'Allt är förlorat! Jag säljer billigt!'");
    else if (nyKurs > 140) setMeddelande("🤩 EUFORI! 'Allt går upp! Köp köp köp!'");
    else if (nyKurs < 80) setMeddelande("😟 'Det ser mörkt ut... kanske borde sälja...'");
    else if (nyKurs > 120) setMeddelande("😊 'Tiden är rätt! Priset kan bara gå upp!'");
    else setMeddelande("😐 'Inget särskilt idag. Priset är... pris.'");
  };

  const kop = () => {
    if (agande) return;
    setAgande(true);
    if (kurs < 70) { setPoang(poang + 10); setMeddelande("✓ BRA KÖP! Du köpte när Mr Market var deprimerad (+10p)"); }
    else if (kurs > 130) { setPoang(poang - 5); setMeddelande("✗ DÅLIGT KÖP! Du köpte i eufori (-5p)"); }
    else setMeddelande("Neutralt köp — varken bra eller dåligt");
  };

  const salj = () => {
    if (!agande) return;
    setAgande(false);
    if (kurs > 130) { setPoang(poang + 10); setMeddelande("✓ BRA SÄLJ! Du sålde i eufori (+10p)"); }
    else if (kurs < 70) { setPoang(poang - 5); setMeddelande("✗ DÅLIGT SÄLJ! Du sålde i panik (-5p)"); }
    else setMeddelande("Neutralt försäljning");
  };

  const W = 360, H = 140;
  const maxH = Math.max(...historik, 150);
  const minH = Math.min(...historik, 50);
  const x = (i: number) => 20 + (i / 30) * (W - 40);
  const y = (v: number) => H - 20 - ((v - minH) / (maxH - minH)) * (H - 40);
  const path = historik.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");

  return (
    <div className="rounded-2xl border-2 border-gold/40 bg-card p-6">
      <p className="text-sm font-bold uppercase tracking-widest text-gold">
        🎮 Mr Market-simulator — kan du hålla nerverna?
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        30 dagar. Mr Market erbjuder nytt pris varje dag. Köp lågt, sälj högt. Låt dig inte påverkas av hans humör.
      </p>

      <div className="mt-4 rounded-xl bg-paper p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <line x1="20" y1={y(100)} x2={W - 20} y2={y(100)} stroke="#a8862a" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.5" />
          <text x={W - 15} y={y(100) - 3} fontSize="7" fill="#a8862a" textAnchor="end" fontStyle="italic">verkligt värde</text>
          {/* Köp-zon */}
          <rect x="20" y={y(70)} width={W - 40} height={y(50) - y(70)} fill="#047857" opacity="0.08" />
          <text x="25" y={y(62)} fontSize="7" fill="#047857" fontWeight="bold">KÖP-ZON</text>
          {/* Sälj-zon */}
          <rect x="20" y={y(150)} width={W - 40} height={y(130) - y(150)} fill="#b91c1c" opacity="0.08" />
          <text x="25" y={y(138)} fontSize="7" fill="#b91c1c" fontWeight="bold">SÄLJ-ZON</text>
          <path d={path} stroke="#a8862a" strokeWidth="2" fill="none" />
          {historik.length > 1 && <circle cx={x(dag)} cy={y(kurs)} r="4" fill="#a8862a" />}
        </svg>
      </div>

      <div className="mt-3 rounded-lg bg-gold/10 px-4 py-3 text-center">
        <p className="text-sm font-medium italic text-gold">{meddelande}</p>
        <p className="mt-1 text-xs text-muted-foreground">Dag {dag}/30 · Kurs: {Math.round(kurs)} kr {agande ? "· DU ÄGER" : ""}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={nextDay} disabled={dag >= 30}
          className="rounded-lg border border-gold/40 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/10 disabled:opacity-30">
          Nästa dag →
        </button>
        <button onClick={kop} disabled={agande || dag >= 30}
          className="rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-30">
          Köp
        </button>
        <button onClick={salj} disabled={!agande || dag >= 30}
          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-30">
          Sälj
        </button>
      </div>

      {dag >= 30 && (
        <div className={`mt-4 rounded-xl p-4 text-center ${poang >= 20 ? "bg-green-50 border-green-300" : poang >= 0 ? "bg-yellow-50 border-yellow-300" : "bg-red-50 border-red-300"}`}>
          <p className="text-lg font-bold">
            {poang >= 20 ? "🏆 Mr Market mästrat!" : poang >= 0 ? "😅 Du överlevde..." : "💀 Mr Market vann den gången"}
          </p>
          <p className="text-sm text-muted-foreground">Poäng: {poang} · {poang >= 20 ? "Du ignorerade hans humör och handlade på värde!" : "Försök igen — köp när han är deprimerad, sälj när han är euforisk."}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// A3: INFLATIONS-JÄMFÖRARE — se din köpkraft försvinna
// ═══════════════════════════════════════════════════════════
export function InflationsJamforare() {
  const [belopp, setBelopp] = useState(100000);
  const [ar, setAr] = useState(20);
  const [inflation, setInflation] = useState(2);
  const [avkastning, setAvkastning] = useState(7);

  const framtidaBelopp = belopp * Math.pow(1 + avkastning / 100, ar);
  const behovForSamma = belopp * Math.pow(1 + inflation / 100, ar);
  const realAvkastning = Math.pow(1 + avkastning / 100, ar) / Math.pow(1 + inflation / 100, ar) - 1;
  const kassaVerde = belopp * Math.pow(1 + 0 / 100, ar);

  const data = useMemo(() => {
    const ut: { ar: number; investerat: number; kassa: number; behov: number }[] = [];
    for (let i = 0; i <= ar; i++) {
      ut.push({
        ar: i,
        investerat: belopp * Math.pow(1 + avkastning / 100, i),
        kassa: belopp,
        behov: belopp * Math.pow(1 + inflation / 100, i),
      });
    }
    return ut;
  }, [belopp, ar, avkastning, inflation]);

  const W = 360, H = 180;
  const max = framtidaBelopp * 1.1;
  const x = (i: number) => 30 + (i / ar) * (W - 50);
  const y = (v: number) => H - 25 - (v / max) * (H - 40);
  const pInv = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.investerat)}`).join(" ");
  const pKassa = `M${x(0)},${y(belopp)} L${x(ar)},${y(belopp)}`;
  const pBehov = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.behov)}`).join(" ");

  return (
    <div className="rounded-2xl border-2 border-gold/40 bg-card p-6">
      <p className="text-sm font-bold uppercase tracking-widest text-gold">💰 Inflations-jämförare</p>
      <p className="mt-1 text-xs text-muted-foreground">Se hur kassan smälter, hur inflationen äter, och hur investering skyddar.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <label>Belopp (kr)<input type="number" value={belopp} onChange={(e) => setBelopp(Number(e.target.value) || 0)} className="mt-1 w-full rounded border border-gold/30 bg-paper px-2 py-1 text-sm" /></label>
        <label>År<input type="range" min="5" max="50" value={ar} onChange={(e) => setAr(Number(e.target.value))} className="mt-2 w-full" /> {ar}</label>
        <label>Inflation %<input type="range" min="0" max="10" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} className="mt-2 w-full" /> {inflation}%</label>
        <label>Avkastning %<input type="range" min="0" max="15" value={avkastning} onChange={(e) => setAvkastning(Number(e.target.value))} className="mt-2 w-full" /> {avkastning}%</label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full">
        <path d={pInv} stroke="#047857" strokeWidth="2.5" fill="none" />
        <path d={pBehov} stroke="#d97706" strokeWidth="2" fill="none" strokeDasharray="6,3" />
        <path d={pKassa} stroke="#5a5045" strokeWidth="1.5" fill="none" opacity="0.5" />
        <text x={W / 2} y={H - 5} textAnchor="middle" fontSize="8" fill="#5a5045">år →</text>
        <circle cx={x(ar)} cy={y(framtidaBelopp)} r="4" fill="#047857" />
        <circle cx={x(ar)} cy={y(behovForSamma)} r="3" fill="#d97706" />
        <circle cx={x(ar)} cy={y(belopp)} r="3" fill="#5a5045" />
      </svg>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <div className="rounded-lg bg-green-50 p-2 text-center">
          <p className="font-bold text-green-700">{Math.round(framtidaBelopp).toLocaleString("sv-SE")} kr</p>
          <p className="text-[10px] text-muted-foreground">Investering efter {ar} år</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-2 text-center">
          <p className="font-bold text-orange-700">{Math.round(behovForSamma).toLocaleString("sv-SE")} kr</p>
          <p className="text-[10px] text-muted-foreground">Behov för samma köpkraft</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <p className="font-bold text-gray-600">{belopp.toLocaleString("sv-SE")} kr</p>
          <p className="text-[10px] text-muted-foreground">Kassan (oförändrad)</p>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] italic text-gold">
        Real avkastning: {Math.round(realAvkastning * 100)}% efter {ar} år (före skatt)
      </p>
    </div>
  );
}
