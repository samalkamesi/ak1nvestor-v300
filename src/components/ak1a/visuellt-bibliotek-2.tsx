"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// AK1NVESTOR VISUAL INTELLIGENCE LIBRARY — VOLYM 2 (VIL-2)
// Fyra nya interaktiva SVG-visualiseringar: våg-tidslinje,
// bubbelhistorik, risktermometer och konvergenskort.
// Ren SVG + React state — inga externa bibliotek. SSR-säker.
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// 7. VÅG-TIDSLINJE — AK1TS: fem tidshorisonter på en guldlinje
// ───────────────────────────────────────────────────────────────

const HORISONTER: Array<{
  id: string;
  namn: string;
  fonster: string;
  n: number | null;
  konkret: string;
  beslut: string;
  vagklass: string;
}> = [
  {
    id: "mikro",
    namn: "Mikro",
    fonster: "5 dagar",
    n: 5,
    konkret: "n = 5 → c₋₁ / c₋₆ − 1 (senaste slutkurs ÷ slutkurs 6 handelsdagar tidigare)",
    beslut: "Timing: inträde, utfart och rebalansering — veckans rytm",
    vagklass: "Mikrovågor & stjärtpunkter — mest brus, minst vikt",
  },
  {
    id: "kort",
    namn: "Kort",
    fonster: "63 dagar",
    n: 63,
    konkret: "n = 63 → c₋₁ / c₋₆₄ − 1 (ett kvartal ≈ 63 handelsdagar)",
    beslut: "Swing-positioner, stoppavstånd och kvartalsvändningar",
    vagklass: "Minivågor — kvartalets andetag",
  },
  {
    id: "medellang",
    namn: "Medellång",
    fonster: "252 dagar",
    n: 252,
    konkret: "n = 252 → c₋₁ / c₋₂₅₃ − 1 (ett handelsår)",
    beslut: "Nyckeltal, årsresultat och sektorrotation",
    vagklass: "Intermediära vågor — årsformatet",
  },
  {
    id: "lang",
    namn: "Lång",
    fonster: "3 år",
    n: 756,
    konkret: "n = 756 → c₋₁ / c₋₇₅₇ − 1 (tre handelsår)",
    beslut: "Asset-allokering och ackumulationsfaser",
    vagklass: "Primärvågor & konjunkturcykler",
  },
  {
    id: "mega",
    namn: "Mega",
    fonster: "hela historiken",
    n: null,
    konkret: "n = hela serien → c₋₁ / c[första noteringen] − 1",
    beslut: "Pension & levnadslopp — grad 1-läget",
    vagklass: "Supercykler & sekulära trender",
  },
];

const HORISONT_IDX: Record<string, number> = {
  mikro: 0,
  kort: 1,
  medellang: 2,
  "medellång": 2,
  lang: 3,
  "lång": 3,
  mega: 4,
};

export function VagTidslinje({ horisont = "kort" }: { horisont?: string }) {
  const [vald, setVald] = useState(HORISONT_IDX[(horisont ?? "").toLowerCase()] ?? 1);
  const h = HORISONTER[vald];

  const W = 380;
  const XS = [35, 110, 185, 260, 335];
  const LINJE_Y = 62;

  // Fönsterbredd ∝ √n — pedagogisk känsla för horisontens längd
  const barBredd = (n: number | null) =>
    n === null ? 352 : Math.min(352, Math.round(Math.sqrt(n) * 13));

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">
        📏 Våg-tidslinjen — fem horisonter, en guldlinje
      </p>
      <svg viewBox={`0 0 ${W} 110`} className="mt-2 w-full">
        {/* Guldlinjen */}
        <line x1={20} y1={LINJE_Y} x2={360} y2={LINJE_Y} stroke="#a8862a" strokeWidth="2" opacity="0.7" />
        {[20, 360].map((x) => (
          <circle key={x} cx={x} cy={LINJE_Y} r="3" fill="#a8862a" opacity="0.7" />
        ))}

        {HORISONTER.map((hor, i) => {
          const aktiv = i === vald;
          return (
            <g key={hor.id} onClick={() => setVald(i)} className="cursor-pointer">
              {/* Ping-effekt på aktiv punkt */}
              {aktiv && (
                <circle
                  cx={XS[i]}
                  cy={LINJE_Y}
                  r={7}
                  fill="none"
                  stroke="#a8862a"
                  strokeWidth="2"
                  className="animate-ping"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              )}
              <circle
                cx={XS[i]}
                cy={LINJE_Y}
                r={aktiv ? 8 : 5.5}
                fill={aktiv ? "#a8862a" : "#fffdf7"}
                stroke="#a8862a"
                strokeWidth={aktiv ? 2.5 : 1.5}
              />
              <text
                x={XS[i]}
                y={LINJE_Y - 22}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill={aktiv ? "#a8862a" : "#5a5045"}
              >
                {hor.namn}
              </text>
              <text x={XS[i]} y={LINJE_Y + 24} textAnchor="middle" fontSize="8" fill="#5a5045">
                {hor.fonster}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Expanderad panel för vald horisont */}
      <div className="mt-3 rounded-lg border border-gold/30 bg-paper p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gold">
          {h.namn} · {h.fonster}
        </p>
        <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Momentumformeln:</span>{" "}
            <code className="rounded bg-card px-1.5 py-0.5 text-[11px] text-gold">
              mₙ = c₋₁ / c₋₍ₙ₊₁₎ − 1
            </code>
          </p>
          <p>{h.konkret}</p>
          <p>
            <span className="font-semibold text-foreground">Beslut horisonten betjänar:</span> {h.beslut}
          </p>
          <p>
            <span className="font-semibold text-foreground">Typisk vågklass:</span> {h.vagklass}
          </p>
        </div>
        {/* Fönsterbredd ∝ √n */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Fönster</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full border border-gold/20">
            <div
              className="h-full rounded-full bg-gold/70 transition-all"
              style={{ width: `${(barBredd(h.n) / 352) * 100}%` }}
            />
          </div>
          <span className="w-16 text-right text-[9px] text-muted-foreground">
            {h.n === null ? "∞ hela serien" : `${h.n} d`}
          </span>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Klicka på en punkt — kortare horisont = mer brus, längre = mer signal. Läs alltid konfluens
        inom en och samma horisont.
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// 8. BUBBELHISTORIK — 1637–2026, storlek ∝ kraschens storlek
// ───────────────────────────────────────────────────────────────

type Bubbel = {
  ar: number;
  decennium: string;
  namn: string;
  ort: string;
  fallet: number; // ungefärlig topp→botten i procent
  x: number;
  kort: string;
  kansla: string; // Marknadscykelns vokabulär
  kanslaNot: string;
};

// Fast data-array — inget slumpmässigt vid render (SSR-säkert)
const BUBBLOR: Bubbel[] = [
  {
    ar: 1637, decennium: "1630-talet", namn: "Tulpaner", ort: "Amsterdam", fallet: 90, x: 45,
    kort: "Världens första dokumenterade bubbla: kontrakt på lökar handlades till huspriser — och föll till nästan noll.",
    kansla: "EUFORI",
    kanslaNot: "”Den här gången är det annorlunda” sades för första gången.",
  },
  {
    ar: 1720, decennium: "1720-talet", namn: "South Sea", ort: "London", fallet: 80, x: 98,
    kort: "Statsskuld byttes mot aktier i ett handelskompani med vaga löften. Även Isaac Newton förlorade pengar.",
    kansla: "GIRIGHET",
    kanslaNot: "”Jag kan beräkna himlakroppars banor — inte människors galenskap.”",
  },
  {
    ar: 1873, decennium: "1870-talet", namn: "Järnväg", ort: "Wien & New York", fallet: 60, x: 150,
    kort: "Spekulation i järnvägsaktier över hela västvärlden. Kraschen öppnade en flerårig depression.",
    kansla: "ÅNGEST",
    kanslaNot: "När tåget ändå inte kommer försöker alla sälja samtidigt.",
  },
  {
    ar: 1929, decennium: "1920-talet", namn: "1929-kraschen", ort: "New York", fallet: 89, x: 200,
    kort: "Ett decennium av kreditdriven eufori slutade på en svart torsdag — och en tioårig depression.",
    kansla: "KAPITULATION",
    kanslaNot: "Från ”permanent högkonjunktur” till köer utanför bankerna.",
  },
  {
    ar: 1972, decennium: "1970-talet", namn: "Nifty Fifty", ort: "USA", fallet: 60, x: 248,
    kort: "50 ”oförstörbara” kvalitetsbolag prissattes till vilken multipel som helst — bra företag, fel pris.",
    kansla: "GIRIGHET",
    kanslaNot: "”För riktigt bra bolag kan man aldrig betala för mycket.”",
  },
  {
    ar: 1989, decennium: "1980-talet", namn: "Japan", ort: "Tokio", fallet: 82, x: 282,
    kort: "Kejsarpalatsets trädgård sades vara värd mer än hela Kalifornien. Nikkei återhämtade sig först 2024.",
    kansla: "EUFORI",
    kanslaNot: "”Nikkei kan aldrig falla — Japan är annorlunda.”",
  },
  {
    ar: 2000, decennium: "2000-talet", namn: "IT-bubblan", ort: "Nasdaq", fallet: 78, x: 316,
    kort: "Dotcom-bolag utan vinst värderades på klick och förhoppningar. Fiberoptik grävdes i onödan.",
    kansla: "EUFORI",
    kanslaNot: "”De gamla värderingsregeln gäller inte i den nya ekonomin.”",
  },
  {
    ar: 2008, decennium: "2000-talet", namn: "Bostad", ort: "Globalt", fallet: 57, x: 350,
    kort: "Subprime-lån paketerades som säkra papper. Banker föll som dominobrickor.",
    kansla: "PANIK",
    kanslaNot: "Från ”huspriser går aldrig ner” till kreditfrysning över en natt.",
  },
];

// Känsloläge → färg: rött = cykelns topp (farligt), guld = varning, grönt = botten (möjlighet)
function kansloFarg(k: string): string {
  if (k.startsWith("EUFORI") || k.startsWith("GIRIGHET")) return "#b91c1c";
  if (k.startsWith("ÅNGEST")) return "#a8862a";
  return "#047857";
}

export function BubbelHistorik() {
  const [vald, setVald] = useState(6); // IT-bubblan som start
  const b = BUBBLOR[vald];

  const BASE_Y = 80;
  const radie = (fall: number) => 4 + fall / 9;

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">
        🫧 Bubbelhistorik 1637–2026 — storlek = kraschens storlek
      </p>
      <svg viewBox="0 0 400 150" className="mt-2 w-full">
        {/* Tidslinje */}
        <line x1={20} y1={BASE_Y} x2={380} y2={BASE_Y} stroke="#a8862a" strokeWidth="1.5" opacity="0.7" />
        <text x={20} y={BASE_Y + 18} fontSize="7" fill="#5a5045">1637</text>
        <text x={372} y={BASE_Y + 18} fontSize="7" fill="#5a5045">2026</text>

        {BUBBLOR.map((bb, i) => {
          const r = radie(bb.fallet);
          const aktiv = i === vald;
          const namnY = i % 2 === 0 ? 24 : 40;
          const topY = BASE_Y - r;
          return (
            <g key={bb.ar + bb.namn} onClick={() => setVald(i)} className="cursor-pointer">
              {/* Namn i två staplade rader + linje ner till bubblan */}
              <line x1={bb.x} y1={namnY + 3} x2={bb.x} y2={topY - 3} stroke="#a8862a" strokeWidth="0.5" opacity={aktiv ? 0.7 : 0.25} />
              <text x={bb.x} y={namnY} textAnchor="middle" fontSize="8" fontWeight={aktiv ? "bold" : "normal"} fill={aktiv ? "#a8862a" : "#5a5045"}>
                {bb.namn}
              </text>
              {/* Bubblan */}
              {aktiv && (
                <circle
                  cx={bb.x}
                  cy={BASE_Y - r}
                  r={r + 2}
                  fill="none"
                  stroke="#b91c1c"
                  strokeWidth="2"
                  className="animate-ping"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              )}
              <circle
                cx={bb.x}
                cy={BASE_Y - r}
                r={r}
                fill="#b91c1c"
                fillOpacity={aktiv ? 0.35 : 0.12}
                stroke="#b91c1c"
                strokeWidth={aktiv ? 2 : 1}
                strokeOpacity={aktiv ? 1 : 0.6}
              />
              <text x={bb.x} y={BASE_Y + 14} textAnchor="middle" fontSize="7" fill="#a8862a" fontWeight="600">
                {bb.ar}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Decennium-slider */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Välj decennium:</span>
        <input
          type="range"
          min={0}
          max={BUBBLOR.length - 1}
          step={1}
          value={vald}
          onChange={(e) => setVald(Number(e.target.value))}
          className="w-40"
        />
        <span className="font-semibold text-gold">{b.decennium}</span>
      </div>

      {/* Detaljpanel */}
      <div className="mt-2 rounded-lg border border-gold/30 bg-paper p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gold">
            {b.namn} · {b.ar} · {b.ort}
          </p>
          <p className="text-[11px] font-bold text-bear">≈ −{b.fallet} %</p>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">{b.kort}</p>
        <p className="mt-1.5 text-[11px]">
          <span className="text-muted-foreground">Känsloläge: </span>
          <span className="font-bold" style={{ color: kansloFarg(b.kansla) }}>{b.kansla}</span>
          <span className="text-muted-foreground"> — {b.kanslaNot}</span>
        </p>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Nedgångstal är ungefärliga (lokal index/valda titlar, topp→botten) och pedagogiska — inte
        exakta mått. Röd känsla = cykelns topp, grön = botten.
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// 9. RISKTERMOMETER — V10 skuld + V11 likviditet + V19 kapitalförbränning
// ───────────────────────────────────────────────────────────────

export function RiskTermometer({ niva = 3 }: { niva?: number }) {
  const start = Math.max(0, Math.min(10, niva));
  const [v10, setV10] = useState(start);
  const [v11, setV11] = useState(start);
  const [v19, setV19] = useState(start);

  const tryck = (v10 + v11 + v19) / 3;
  const zon = tryck <= 3 ? 0 : tryck <= 6 ? 1 : 2;
  const ZONER = [
    {
      namn: "ÖVERLEVA",
      farg: "#047857",
      text: "Lågt samlat tryck — bolaget hanterar motgångar utan tvingande åtgärder. Normala positioner.",
    },
    {
      namn: "LIGGA LÅGT",
      farg: "#a8862a",
      text: "Måttligt tryck — minska exponering, håll buffert och följ kassaflödet extra noga.",
    },
    {
      namn: "AKTA",
      farg: "#b91c1c",
      text: "Högt tryck — skuld + illikviditet + kapitalförbränning kan tvinga emission eller kollaps. Överlevnadsläge.",
    },
  ];
  const z = ZONER[zon];

  // Termometergeometri
  const TUBE_TOP = 20, TUBE_BOT = 147, TUBE_X = 60, TUBE_W = 22;
  const yLevel = TUBE_BOT - (tryck / 10) * (TUBE_BOT - TUBE_TOP);
  const yFor = (v: number) => TUBE_BOT - (v / 10) * (TUBE_BOT - TUBE_TOP);

  const RADBAR = [
    { label: "V10 · Skuldsättningsgrad", v: v10, set: setV10, low: "skuldfri", high: "extrem hävstång" },
    { label: "V11 · Likviditet", v: v11, set: setV11, low: "proppfull kassa", high: "illikvid & låst" },
    { label: "V19 · Kassatäckning — nyemissionsrisk", v: v19, set: setV19, low: "positivt kassaflöde", high: "brinner hårt" },
  ];

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">
        🌡️ Risktermometer — tre AKM1-variabler, ett samlat tryck
      </p>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row">
        {/* Termometern */}
        <svg viewBox="0 0 150 200" className="mx-auto w-full max-w-[150px] shrink-0">
          <defs>
            <linearGradient id="risk-kvicksilver" x1="0" y1={TUBE_TOP} x2="0" y2={TUBE_BOT} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="45%" stopColor="#a8862a" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          {/* Zonstreck (AKTA >6, LIGGA LÅGT 3–6, ÖVERLEVA ≤3) */}
          <line x1={TUBE_X} y1={yFor(6)} x2={TUBE_X + TUBE_W} y2={yFor(6)} stroke="#c9a84c" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={TUBE_X} y1={yFor(3)} x2={TUBE_X + TUBE_W} y2={yFor(3)} stroke="#c9a84c" strokeWidth="1" strokeDasharray="2 2" />

          {/* Kvicksilver + glödlampa */}
          <circle cx={TUBE_X + TUBE_W / 2} cy={165} r={17} fill={z.farg} stroke="#a8862a" strokeWidth="1.5" />
          <rect x={TUBE_X + 3} y={yLevel} width={TUBE_W - 6} height={TUBE_BOT - yLevel} fill="url(#risk-kvicksilver)" />
          {/* Rör */}
          <rect x={TUBE_X} y={TUBE_TOP} width={TUBE_W} height={TUBE_BOT - TUBE_TOP} rx={TUBE_W / 2} fill="none" stroke="#a8862a" strokeWidth="2" />

          {/* Skala 0–10 */}
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <g key={v}>
              <line x1={TUBE_X - 6} y1={yFor(v)} x2={TUBE_X} y2={yFor(v)} stroke="#a8862a" strokeWidth="0.8" opacity="0.6" />
              <text x={TUBE_X - 9} y={yFor(v) + 2.5} textAnchor="end" fontSize="7" fill="#5a5045">{v}</text>
            </g>
          ))}

          {/* Nivåmarkering */}
          <circle cx={TUBE_X + TUBE_W / 2} cy={yLevel} r="3.5" fill="#fffdf7" stroke={z.farg} strokeWidth="2" />

          {/* Zonetexter */}
          <text x={TUBE_X + TUBE_W + 8} y={yFor(8.8)} fontSize="7" fontWeight="bold" fill="#b91c1c">AKTA</text>
          <text x={TUBE_X + TUBE_W + 8} y={yFor(4.6)} fontSize="7" fontWeight="bold" fill="#a8862a">LIGGA LÅGT</text>
          <text x={TUBE_X + TUBE_W + 8} y={yFor(1.2)} fontSize="7" fontWeight="bold" fill="#047857">ÖVERLEVA</text>
        </svg>

        {/* Sliders + bedömning */}
        <div className="flex-1 space-y-2">
          {RADBAR.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground">{r.label}</span>
                <span className="rounded border border-gold/30 bg-paper px-1.5 py-0.5 font-bold text-gold">{r.v}/10</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={r.v}
                onChange={(e) => r.set(Number(e.target.value))}
                className="mt-1 w-full"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>0 = {r.low}</span>
                <span>10 = {r.high}</span>
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-l-4 border-gold/30 bg-paper p-2.5" style={{ borderLeftColor: z.farg }}>
            <p className="text-sm font-bold tracking-wide" style={{ color: z.farg }}>
              {z.namn}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{z.text}</p>
            <p className="mt-1 text-[11px]">
              <span className="text-muted-foreground">Samlat risktryck: </span>
              <span className="font-bold" style={{ color: z.farg }}>{tryck.toFixed(1)} / 10</span>
            </p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        V10, V11 och V19 ur AKM1:s fundament — sliders visar risktryck per variabel (10 = värst).
        Ej investeringsråd.
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// 10. KONVERGENSKORT — flaggskeppsregeln: tre familjer måste samspela
// ───────────────────────────────────────────────────────────────

type Sig = 0 | 1 | 2; // 0 = ▲ upp, 1 = ▼ ner, 2 = ◆ neutral

const FAMILJER = [
  { namn: "PRIS", desc: "momentum · trend · lägen" },
  { namn: "VOLYM", desc: "deltagande · flöden · breadth" },
  { namn: "TID", desc: "vågor · cykler · säsong" },
];

const SIG_INFO: Array<{ ord: string; farg: string }> = [
  { ord: "uppåt", farg: "#047857" },
  { ord: "nedåt", farg: "#b91c1c" },
  { ord: "neutralt", farg: "#a8862a" },
];

function SigGraf({ sig, cx, cy }: { sig: Sig; cx: number; cy: number }) {
  const f = SIG_INFO[sig].farg;
  if (sig === 0) return <polygon points={`${cx - 11},${cy + 8} ${cx + 11},${cy + 8} ${cx},${cy - 10}`} fill={f} />;
  if (sig === 1) return <polygon points={`${cx - 11},${cy - 8} ${cx + 11},${cy - 8} ${cx},${cy + 10}`} fill={f} />;
  return <polygon points={`${cx},${cy - 12} ${cx + 10},${cy} ${cx},${cy + 12} ${cx - 10},${cy}`} fill={f} />;
}

export function KonvergensKort() {
  // Start: 2 av 3 uppåt = bekräftelse — flaggskeppsregel demonstrated
  const [kort, setKort] = useState<Sig[]>([0, 0, 2]);

  const upp = kort.filter((s) => s === 0).length;
  const ner = kort.filter((s) => s === 1).length;
  const neu = kort.length - upp - ner;

  let rubrik = "";
  let farg = "#5a5045";
  let brodtext = "";
  if (upp === 3) {
    rubrik = "3 av 3 uppåt → STARKAST SIGNAL";
    farg = "#047857";
    brodtext = "Alla tre familjer pekar samma håll — högsta bekräftelsegraden. Ändå: beslutet tas först med positionstorlek och stopp.";
  } else if (ner === 3) {
    rubrik = "3 av 3 nedåt → STARKAST SIGNAL NEDÅT";
    farg = "#b91c1c";
    brodtext = "Alla tre familjer pekar ner — starkast negativa bekräftelsen. Riskhantering först, sedan åtgärd.";
  } else if (upp === 2) {
    rubrik = "2 av 3 uppåt → BEKRÄFTELSE";
    farg = "#047857";
    brodtext = "Majoritet räcker som bekräftelse — men den avvikande familjen sänker säkerheten. Mindre position, bredare stopp.";
  } else if (ner === 2) {
    rubrik = "2 av 3 nedåt → BEKRÄFTELSE NEDÅT";
    farg = "#b91c1c";
    brodtext = "Majoritet nedåt — bekräftad negativ signal. Den tredje familjen avgör om du agerar eller bara förhöjer vaksamheten.";
  } else {
    rubrik = "SPLITTRAT → OSÄKERHET";
    farg = "#a8862a";
    brodtext = "Familjerna oense (eller neutrala) — ingen bekräftelse. Avvakta tills minst två familjer pekar samma håll.";
  }

  const vaxla = (i: number) =>
    setKort(kort.map((s, j) => (j === i ? ((s + 1) % 3) as Sig : s)));

  const slumpa = () =>
    setKort([0, 1, 2].map(() => Math.floor(Math.random() * 3)) as Sig[]);

  const XS = [12, 134, 256];

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">
        🃏 Konvergens — 5 horisonter × 5 teorier × 4 dimensioner
      </p>
      <svg viewBox="0 0 380 118" className="mt-2 w-full">
        {FAMILJER.map((f, i) => (
          <g key={f.namn} onClick={() => vaxla(i)} className="cursor-pointer">
            <rect
              x={XS[i]}
              y={10}
              width={112}
              height={98}
              rx={10}
              fill="#fffdf7"
              stroke="#a8862a"
              strokeWidth={kort[i] === 0 || kort[i] === 1 ? 2 : 1.5}
              strokeOpacity={0.8}
            />
            <text x={XS[i] + 56} y={30} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#a8862a" letterSpacing="1.5">
              {f.namn}
            </text>
            <SigGraf sig={kort[i]} cx={XS[i] + 56} cy={58} />
            <text x={XS[i] + 56} y={84} textAnchor="middle" fontSize="8" fontWeight="bold" fill={SIG_INFO[kort[i]].farg}>
              {SIG_INFO[kort[i]].ord.toUpperCase()}
            </text>
            <text x={XS[i] + 56} y={98} textAnchor="middle" fontSize="6" fill="#5a5045">
              {f.desc}
            </text>
          </g>
        ))}
      </svg>

      {/* Räknare + syntes */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          ▲ {upp} · ▼ {ner} · ◆ {neu} — klicka ett kort för att växla ▲→▼→◆
        </p>
        <button
          onClick={slumpa}
          className="rounded border border-gold/30 bg-paper px-2.5 py-1 text-[11px] font-semibold text-gold transition-colors hover:bg-gold hover:text-paper"
        >
          Slumpa kort
        </button>
      </div>

      <div className="mt-2 rounded-lg border border-l-4 border-gold/30 bg-paper p-2.5" style={{ borderLeftColor: farg }}>
        <p className="text-[12px] font-bold" style={{ color: farg }}>Konfluens: {rubrik}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{brodtext}</p>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Konfluens mäter bekräftelsegrad — ALDRIG en automatisk köp- eller säljorder. Läs den per
        tidshorisont: Mikro kan peka ↓ samtidigt som Lång pekar ↑.
      </p>
    </div>
  );
}
