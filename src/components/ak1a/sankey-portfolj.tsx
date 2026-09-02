"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// SANKEY-PORTFÖLJFLÖDE (VIL-3 · forskning-visualisering §1.1 + §5:2)
// Kapitalets väg: Portfölj 100 % → sektorer → positioner.
// Donuten visar tillståndet — Sankeyn visar rörelsen.
// Ren SVG + React state, inga externa bibliotek. SSR-säker.
// Bågformade Q-bezier-strålar, bredd ∝ vikt, marin fyllning med
// guldkant; sektorfärger ur Okabe-Ito (färgblindsäker, §4.1).
// ═══════════════════════════════════════════════════════════════

export type SankeyPosition = { namn: string; sektor: string; vikt: number };

/** Okabe-Ito (Color Universal Design, Okabe & Ito 2008) — mörka medlemmar
    först (noder/etiketter), ljusa (gul, himmelblå) sist: håller för
    deuteranopi, protanopi och tritanopi. */
const OKABE_ITO = [
  "#0072B2", // blå
  "#D55E00", // vermillion
  "#009E73", // blågrön
  "#CC79A7", // rödlig lila
  "#E69F00", // orange
  "#56B4E9", // himmelblå
  "#F0E442", // gul
  "#7F7F7F", // grå — sektorer nr 9+ cyklar
];

const MARIN = "#0E1B2E";  // --djup-marin: strålarnas grundton
const GULD = "#C9A84C";   // guldkanten runt varje stråle
const PAPPER = "#FFFDF7"; // text-halo (samma papper som övriga VIL-kort)
const TEXT = "#5A5045";

const pctSv = (andel: number) =>
  andel.toLocaleString("sv-SE", { maximumFractionDigits: 1 });

/** Bågformad stråle mellan två kolumner — kvadratiska bezierbågar med
    horisontell tangent i båda ändarna (klassisk Sankey-form), sluten till band.
    Bredden (y-utsträckningen) är proportionell mot vikten i båda ändar. */
function strale(
  x0: number, y0a: number, y0b: number,
  x1: number, y1a: number, y1b: number
): string {
  const mx = (x0 + x1) / 2;
  return [
    `M${x0},${y0a}`,
    `Q${mx},${y0a} ${x1},${y1a}`,
    `L${x1},${y1b}`,
    `Q${mx},${y1b} ${x0},${y0b}`,
    "Z",
  ].join(" ");
}

type Strale = { key: string; sektor: string; d: string; title: string };

export function SankeyPortfolj({ positioner }: { positioner: Array<SankeyPosition> }) {
  const [hoverSektor, setHoverSektor] = useState<string | null>(null);

  const giltiga = positioner.filter((p) => Number.isFinite(p.vikt) && p.vikt > 0);
  const total = giltiga.reduce((s, p) => s + p.vikt, 0);

  // Hederskoden: utan vikter varken gissar motorn eller bilden (osatt, tomt flöde)
  if (giltiga.length === 0 || total <= 0) {
    return (
      <div className="rounded-xl border border-gold/20 bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">
          🧭 Sankey — kapitalets väg
        </p>
        <div className="hjarlinje mt-3" aria-hidden="true" />
        <p className="mt-3 text-[11px] italic text-muted-foreground">
          osatt — inga positionsvikter att visa flöde för. Motorn gissar aldrig.
        </p>
      </div>
    );
  }

  // Sektorsaggregat — deterministisk ordning: totalvikt fallande, sen namn
  const sektorMap = new Map<string, SankeyPosition[]>();
  for (const p of giltiga) {
    const lista = sektorMap.get(p.sektor) ?? [];
    lista.push(p);
    sektorMap.set(p.sektor, lista);
  }
  const sektorer = [...sektorMap.entries()]
    .map(([namn, pos]) => ({
      namn,
      positioner: [...pos].sort(
        (a, b) => b.vikt - a.vikt || a.namn.localeCompare(b.namn, "sv")
      ),
      vikt: pos.reduce((s, p) => s + p.vikt, 0),
    }))
    .sort((a, b) => b.vikt - a.vikt || a.namn.localeCompare(b.namn, "sv"))
    .map((s, i) => ({ ...s, farg: OKABE_ITO[i % OKABE_ITO.length] }));

  // ── Geometri: tre kolumner, EN gemensam skala k → strålbredd ∝ vikt överallt
  const S = sektorer.length;
  const P = giltiga.length;
  const GAP_S = 6; // lucka mellan sektorsnoder
  const GAP_P = 7; // lucka mellan positionsnoder (etiketter ≈ 7 px får rum)
  const HOJD = Math.max(190, P * 17, S * 24); // växer med antal noder
  const TOPP = 10;
  const k = (HOJD - Math.max((S - 1) * GAP_S, (P - 1) * GAP_P)) / total;
  const nodeH = (v: number) => Math.max(2.5, v * k);

  const W = 380;
  const XL = 6, XL_W = 8;    // vänster nod: portföljen
  const XM = 152, XM_W = 8;  // mitten: sektorsnoder
  const XR = 312, XR_W = 6;  // höger: positionsnoder
  const mittY = TOPP + HOJD / 2;

  // Mittkolumn: sektorsnoder staplade uppifrån och ner (ordning = sektorordning)
  const hojdS = sektorer.reduce((s, sek) => s + nodeH(sek.vikt), 0) + (S - 1) * GAP_S;
  let cursorM = mittY - hojdS / 2;
  const sektorNoder = sektorer.map((sek) => {
    const h = nodeH(sek.vikt);
    const nod = { y: cursorM, h };
    cursorM += h + GAP_S;
    return nod;
  });

  // Vänsterkolumn: portföljnoden = sektorernas storlekar i samma ordning (inga luckor)
  const vansterHojd = sektorer.reduce((s, sek) => s + nodeH(sek.vikt), 0);
  let cursorL = mittY - vansterHojd / 2;
  const vansterSlices = sektorer.map((sek) => {
    const h = nodeH(sek.vikt);
    const slice = { y: cursorL, h };
    cursorL += h;
    return slice;
  });

  // Högerkolumn: positioner grupperade per sektor — strålar korsar aldrig varandra
  const hojdP = giltiga.reduce((s, p) => s + nodeH(p.vikt), 0) + (P - 1) * GAP_P;
  let cursorR = mittY - hojdP / 2;
  const posNoder: Array<{ namn: string; sektor: string; y: number; h: number }> = [];
  const hogerStralar: Strale[] = [];
  sektorer.forEach((sek, i) => {
    let offset = sektorNoder[i].y; // utgångsläge på sektornsnoden
    for (const pos of sek.positioner) {
      const h = nodeH(pos.vikt);
      posNoder.push({ namn: pos.namn, sektor: sek.namn, y: cursorR, h });
      hogerStralar.push({
        key: `h-${sek.namn}-${pos.namn}-${cursorR.toFixed(1)}`,
        sektor: sek.namn,
        d: strale(XM + XM_W, offset, offset + h, XR, cursorR, cursorR + h),
        title: `${sek.namn} → ${pos.namn}: ${pctSv((pos.vikt / total) * 100)} % av portföljen`,
      });
      offset += h;
      cursorR += h + GAP_P;
    }
  });

  const vansterStralar: Strale[] = sektorer.map((sek, i) => {
    const slice = vansterSlices[i];
    const nod = sektorNoder[i];
    return {
      key: `v-${sek.namn}`,
      sektor: sek.namn,
      d: strale(XL + XL_W, slice.y, slice.y + slice.h, XM, nod.y, nod.y + nod.h),
      title: `Portfölj → ${sek.namn}: ${pctSv((sek.vikt / total) * 100)} % av portföljen`,
    };
  });

  const fargFor = (sekNamn: string) =>
    sektorer.find((s) => s.namn === sekNamn)?.farg ?? MARIN;

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">
        🧭 Sankey — kapitalets väg: portfölj → sektor → position
      </p>
      <svg
        viewBox={`0 0 ${W} ${HOJD + TOPP * 2}`}
        role="img"
        className="mt-2 w-full"
      >
        <title>
          Sankey-diagram: kapitalflödet från portföljen via sektorer till positioner.
          Strålbredden är proportionell mot vikten.
        </title>

        {/* Strålar — marin fyllning med guldkant; hover lyfter sektorn i Okabe-Ito */}
        {[...vansterStralar, ...hogerStralar].map((s) => {
          const lyft = hoverSektor === s.sektor;
          const dimmad = hoverSektor !== null && !lyft;
          return (
            <path
              key={s.key}
              d={s.d}
              fill={lyft ? fargFor(s.sektor) : MARIN}
              fillOpacity={lyft ? 0.6 : dimmad ? 0.1 : 0.45}
              stroke={GULD}
              strokeWidth={lyft ? 1.1 : 0.5}
              strokeOpacity={dimmad ? 0.4 : 0.9}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverSektor(s.sektor)}
              onMouseLeave={() => setHoverSektor(null)}
            >
              <title>{s.title}</title>
            </path>
          );
        })}

        {/* Vänster nod: portföljen (spänner hela flödet) */}
        <rect
          x={XL}
          y={mittY - vansterHojd / 2}
          width={XL_W}
          height={vansterHojd}
          rx="2"
          fill={MARIN}
          stroke={GULD}
          strokeWidth="1"
        >
          <title>Portfölj 100 % — hela kapitalet som ger upphov till flödet</title>
        </rect>
        <text
          transform={`translate(${XL + XL_W / 2}, ${mittY}) rotate(-90)`}
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill={GULD}
        >
          Portfölj 100 %
        </text>

        {/* Mittensektorer — Okabe-Ito-noder med guldkant */}
        {sektorer.map((sek, i) => {
          const nod = sektorNoder[i];
          const lyft = hoverSektor === sek.namn;
          return (
            <g
              key={sek.namn}
              className="cursor-pointer"
              onMouseEnter={() => setHoverSektor(sek.namn)}
              onMouseLeave={() => setHoverSektor(null)}
            >
              <rect
                x={XM}
                y={nod.y}
                width={XM_W}
                height={nod.h}
                rx="1.5"
                fill={sek.farg}
                stroke={GULD}
                strokeWidth={lyft ? 1.5 : 0.8}
              />
              <title>{`${sek.namn}: ${pctSv((sek.vikt / total) * 100)} % av portföljen · ${sek.positioner.length} positioner`}</title>
              <text
                x={XM + XM_W + 4}
                y={nod.y + nod.h / 2 + 2.5}
                fontSize="7.5"
                fontWeight={lyft ? "bold" : "600"}
                fill={lyft ? sek.farg : TEXT}
                style={{ paintOrder: "stroke", stroke: PAPPER, strokeWidth: 2.2 }}
              >
                {sek.namn} {pctSv((sek.vikt / total) * 100)} %
              </text>
            </g>
          );
        })}

        {/* Höger positioner — marin-mininoder med etikett höger om */}
        {posNoder.map((p) => {
          const lyft = hoverSektor === p.sektor;
          return (
            <g
              key={`p-${p.namn}-${p.y.toFixed(1)}`}
              className="cursor-pointer"
              opacity={hoverSektor !== null && !lyft ? 0.35 : 1}
              onMouseEnter={() => setHoverSektor(p.sektor)}
              onMouseLeave={() => setHoverSektor(null)}
            >
              <rect
                x={XR}
                y={p.y}
                width={XR_W}
                height={p.h}
                rx="1"
                fill={MARIN}
                stroke={GULD}
                strokeWidth="0.6"
              />
              <title>{`${p.namn} (${p.sektor})`}</title>
              <text
                x={XR + XR_W + 3}
                y={p.y + p.h / 2 + 2.5}
                fontSize="7"
                fontWeight={lyft ? "bold" : "normal"}
                fill={TEXT}
                style={{ paintOrder: "stroke", stroke: PAPPER, strokeWidth: 2 }}
              >
                {p.namn} {pctSv(giltiga.find((g) => g.namn === p.namn && g.sektor === p.sektor)!.vikt / total * 100)} %
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
        <span>{P} positioner</span>
        <span aria-hidden="true">·</span>
        <span>{S} sektorer</span>
        <span aria-hidden="true">·</span>
        <span className="flex flex-wrap items-center gap-1">
          {sektorer.map((s) => (
            <span key={s.namn} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm" style={{ background: s.farg }} />
              {s.namn}
            </span>
          ))}
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Strålbredden är proportionell mot vikten — donuten visar tillståndet, Sankeyn
        visar vägen. Hovra en stråle eller nod för att lyfta fram hela sektorns flöde.
      </p>
      <p className="mt-1 text-[10px] italic text-muted-foreground/70">
        Flödet visar historik, inte framtid. Pedagogiskt verktyg — inte investeringsråd.
      </p>
    </div>
  );
}
