"use client";

import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// AK1NVESTOR VISUAL INTELLIGENCE LIBRARY (VIL)
// Interaktiva SVG-visualiseringar som gör finans begripligt visuellt
// ═══════════════════════════════════════════════════════════════

/** 1. RÄNTEPÅRÄNKNING — se exponentialtillväxt live */
export function CompoundChart({ startBelopp = 10000, ranta = 7, ar = 30 }) {
  const [belopp, setBelopp] = useState(startBelopp);
  const [r, setR] = useState(ranta);
  const [n, setN] = useState(ar);

  const punkter = useMemo(() => {
    const ut = [];
    for (let i = 0; i <= n; i++) {
      ut.push({ ar: i, varde: belopp * Math.pow(1 + r / 100, i) });
    }
    return ut;
  }, [belopp, r, n]);

  const max = punkter[punkter.length - 1]?.varde || 1;
  const W = 400, H = 200, PAD = 40;
  const x = (i: number) => PAD + (i / n) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const path = punkter.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.varde)}`).join(" ");
  const area = `${path} L${x(n)},${H - PAD} L${x(0)},${H - PAD} Z`;
  const slutVarde = punkter[punkter.length - 1]?.varde || 0;

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">📈 Ränta-på-ränta — den tålmodigas supervapen</p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <label>Start: <input type="number" value={belopp} onChange={(e) => setBelopp(Number(e.target.value) || 0)} className="w-24 rounded border border-gold/30 bg-paper px-2 py-1" /></label>
        <label>Ränta: <input type="range" min="0" max="15" value={r} onChange={(e) => setR(Number(e.target.value))} className="w-24" /> {r}%</label>
        <label>År: <input type="range" min="5" max="50" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-24" /> {n}</label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
        <path d={area} fill="url(#guld)" opacity="0.3" />
        <defs><linearGradient id="guld" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8862a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#a8862a" stopOpacity="0" />
        </linearGradient></defs>
        <path d={path} stroke="#a8862a" strokeWidth="2.5" fill="none" />
        <circle cx={x(n)} cy={y(slutVarde)} r="4" fill="#a8862a" />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={y(max * f)} y2={y(max * f)} stroke="#a8862a" strokeWidth="0.5" opacity="0.2" />
        ))}
        <text x={x(n / 2)} y={y(slutVarde * 0.5)} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#a8862a">
          {Math.round(slutVarde).toLocaleString("sv-SE")} kr
        </text>
      </svg>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {belopp.toLocaleString("sv-SE")} kr → {Math.round(slutVarde).toLocaleString("sv-SE")} kr på {n} år ({r}% årligen)
      </p>
    </div>
  );
}

/** 2. MARGINAL OF SAFETY — visuell bro */
export function MarginalBro({ pris = 70, varde = 100 }) {
  const marginal = Math.round(((varde - pris) / varde) * 100);
  const W = 300, H = 120;
  const bronH = 70;
  const lastX = 150;
  const lastBredd = (pris / varde) * 100;
  const broBredd = 100;

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">🌉 Marginal of Safety</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
        {/* Bron */}
        <path d={`M20 ${bronH} Q150 ${bronH - 50} 280 ${bronH}`} stroke="#a8862a" strokeWidth="8" fill="none" strokeLinecap="round" />
        {/* Pelare */}
        {[50, 100, 150, 200, 250].map((px) => (
          <line key={px} x1={px} y1={bronH} x2={px} y2={bronH + 15} stroke="#c9a84c" strokeWidth="3" />
        ))}
        {/* Last (pris) */}
        <rect x={lastX - lastBredd / 2} y={bronH - 30} width={lastBredd} height={22} rx="4" fill="#d97706" opacity="0.8" />
        <text x={lastX} y={bronH - 15} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">PRIS {pris}</text>
        {/* Bro-kapacitet */}
        <rect x={lastX - broBredd / 2} y={bronH + 18} width={broBredd} height={8} rx="3" fill="#047857" opacity="0.6" />
        <text x={lastX} y={bronH + 35} textAnchor="middle" fontSize="8" fill="#047857">KONSTRUKTION {varde}</text>
        {/* Marginal-pil */}
        <line x1={lastX + lastBredd / 2 + 5} y1={bronH - 20} x2={lastX + broBredd / 2 - 5} y2={bronH - 20} stroke="#047857" strokeWidth="2" markerEnd="url(#pil)" />
        <defs><marker id="pil" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#047857" /></marker></defs>
        <text x={lastX + (lastBredd + broBredd) / 4} y={bronH - 28} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#047857">+{marginal}%</text>
      </svg>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Pris {pris} mot värde {varde} = <strong className="text-green-700">{marginal}% marginal</strong> — du kan ha fel och ändå överleva.
      </p>
    </div>
  );
}

/** 3. MARKNADSCYKEL — vågor med känslolägen */
export function Marknadscykel() {
  const W = 360, H = 160, midY = 80;
  const path = "M20 120 C60 60, 100 40, 140 50 C180 60, 200 100, 240 110 C280 120, 300 80, 340 60";
  const punkt = { x: 185, y: 95 }; // "vi är här"

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">🌊 Marknadscykeln & känslolägen</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
        <path d={path} stroke="#a8862a" strokeWidth="3" fill="none" />
        {/* Känslo-etiketter */}
        <text x="70" y="30" fontSize="8" fill="#047857" fontWeight="bold">EUFORI ↑</text>
        <text x="140" y="38" fontSize="8" fill="#5a5045">GREED</text>
        <text x="160" y="135" fontSize="8" fill="#d97706">ÅNGEST</text>
        <text x="240" y="130" fontSize="8" fill="#b91c1c" fontWeight="bold">PANIK ↓</text>
        <text x="300" y="45" fontSize="8" fill="#5a5045">HOPP</text>
        {/* Köp-zon (lågt) */}
        <rect x="200" y="95" width="60" height="30" fill="#047857" opacity="0.1" rx="4" />
        <text x="230" y="115" textAnchor="middle" fontSize="8" fill="#047857" fontWeight="bold">KÖP-ZON</text>
        {/* Sälj-zon (högt) */}
        <rect x="80" y="30" width="50" height="25" fill="#b91c1c" opacity="0.1" rx="4" />
        <text x="105" y="45" textAnchor="middle" fontSize="8" fill="#b91c1c" fontWeight="bold">SÄLJ-ZON</text>
        {/* Mr Market-figur */}
        <circle cx={punkt.x} cy={punkt.y - 8} r="6" fill="#fffdf7" stroke="#a8862a" strokeWidth="1.5" />
        <circle cx={punkt.x - 2} cy={punkt.y - 10} r="1" fill="#0a0b0d" />
        <circle cx={punkt.x + 2} cy={punkt.y - 10} r="1" fill="#0a0b0d" />
        <path d={`M${punkt.x - 2} ${punkt.y - 5} Q${punkt.x} ${punkt.y - 3} ${punkt.x + 2} ${punkt.y - 5}`} stroke="#0a0b0d" strokeWidth="0.5" fill="none" />
        <text x={punkt.x + 10} y={punkt.y - 12} fontSize="7" fill="#5a5045" fontStyle="italic">Mr Market</text>
      </svg>
      <p className="mt-1 text-[11px] text-muted-foreground">Graham: köp när andra är rädda, var försiktig när andra är euforiska.</p>
    </div>
  );
}

/** 4. AKM1-RADAR — 20 variabler som spindelwebb */
export function Akm1Radar({ poang }: { poang: number[] }) {
  const n = poang.length;
  const W = 260, H = 260, cx = 130, cy = 130, R = 90;
  const vinkel = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const punkt = (i: number, val: number) => ({
    x: cx + Math.cos(vinkel(i)) * (R * val / 5),
    y: cy + Math.sin(vinkel(i)) * (R * val / 5),
  });
  const path = poang.map((v, i) => {
    const p = punkt(i, v);
    return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
  }).join(" ") + " Z";

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-3">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-gold">🎯 AKM1-profil</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto mt-1 w-full max-w-[260px]">
        {/* Grid-cirklar */}
        {[1, 2, 3, 4, 5].map((niv) => (
          <circle key={niv} cx={cx} cy={cy} r={R * niv / 5} fill="none" stroke="#a8862a" strokeWidth="0.4" opacity="0.3" />
        ))}
        {/* Axlar */}
        {poang.map((_, i) => {
          const p = punkt(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#a8862a" strokeWidth="0.4" opacity="0.3" />;
        })}
        {/* Datayta */}
        <path d={path} fill="#a8862a" fillOpacity="0.25" stroke="#a8862a" strokeWidth="2" />
        {/* Etiketter */}
        {poang.map((v, i) => {
          const p = punkt(i, 5.8);
          return <text key={i} x={p.x} y={p.y} textAnchor="middle" fontSize="6" fill="#5a5045" fontWeight="600">V{String(i + 1).padStart(2, "0")}</text>;
        })}
      </svg>
    </div>
  );
}

/** 5. PORTFÖLJ-DONUT — sektorsfördelning */
export function PortfoljDonut({ sektorer }: { sektorer: Array<{ namn: string; procent: number; farg: string }> }) {
  const W = 200, H = 200, cx = 100, cy = 100, R = 70;
  let vinkelStart = -Math.PI / 2;
  const arcs = sektorer.map((s) => {
    const vinkelSlut = vinkelStart + (s.procent / 100) * Math.PI * 2;
    const x1 = cx + R * Math.cos(vinkelStart), y1 = cy + R * Math.sin(vinkelStart);
    const x2 = cx + R * Math.cos(vinkelSlut), y2 = cy + R * Math.sin(vinkelSlut);
    const stor = vinkelSlut - vinkelStart > Math.PI;
    const d = `M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${stor ? 1 : 0} 1 ${x2},${y2} Z`;
    vinkelStart = vinkelSlut;
    return { d, ...s };
  });

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-3">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-gold">🥧 Portföljspridning</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto mt-1 w-full max-w-[200px]">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.farg} stroke="#fffdf7" strokeWidth="2" />
        ))}
        <circle cx={cx} cy={cy} r="35" fill="#fffdf7" stroke="#a8862a" strokeWidth="1" />
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="9" fill="#5a5045">{sektorer.length} sektorer</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="7" fill="#5a5045" fontStyle="italic">spridning = skydd</text>
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {sektorer.map((s, i) => (
          <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.farg }} />
            {s.namn} {s.procent}%
          </span>
        ))}
      </div>
    </div>
  );
}

/** 6. KONSEPTKART — hur idéer hänger ihop */
export function KonseptKart({ noder, kanter }: {
  noder: Array<{ id: string; label: string; x: number; y: number }>;
  kanter: Array<{ fran: string; till: string }>;
}) {
  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">🗺️ Konsekvens-karta</p>
      <svg viewBox="0 0 300 180" className="mt-2 w-full">
        {kanter.map((k, i) => {
          const fran = noder.find((n) => n.id === k.fran);
          const till = noder.find((n) => n.id === k.till);
          if (!fran || !till) return null;
          return <line key={i} x1={fran.x} y1={fran.y} x2={till.x} y2={till.y} stroke="#a8862a" strokeWidth="1" opacity="0.4" />;
        })}
        {noder.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="18" fill="#fffdf7" stroke="#a8862a" strokeWidth="1.5" />
            <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#a8862a">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
