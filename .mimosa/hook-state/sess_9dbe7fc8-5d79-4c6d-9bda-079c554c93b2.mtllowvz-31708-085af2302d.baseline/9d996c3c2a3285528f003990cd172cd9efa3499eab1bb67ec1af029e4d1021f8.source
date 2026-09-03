"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { SankeyPortfolj } from "@/components/ak1a/sankey-portfolj";

// ═══════════════════════════════════════════════════════════
// MEGA PLAN A4: PORTFÖLJBYGGAREN — interaktiv, direkt i kursen
// Eleven komponerar en tänkt portfölj rad för rad och SER
// risk/spridning/allokering förändras i realtid:
// sektorsdonut, viktat AKM1-genomsnitt, vågfördelning (AK1TS)
// och pedagogiska varningar. Allt klient-side.
// Persistens: localStorage "ak1a-portfoljbyggare-v1".
// ═══════════════════════════════════════════════════════════

type Sektor =
  | "Teknik"
  | "Industri"
  | "Hälso"
  | "Finans"
  | "Konsument"
  | "Material"
  | "Energi"
  | "Fastighet";

/** AK1TS-vokabulär: vågklass per tidshorisont-val. */
type Vagklass = "impulsvåg" | "korrigering" | "basbygge";

type Rad = {
  id: string;
  namn: string;
  sektor: Sektor;
  vikt: number; // 0-100 %
  akm1: number; // 0-100 poäng (AKM1-genomsnitt för bolaget)
  vagklass: Vagklass;
};

const NYCKEL = "ak1a-portfoljbyggare-v1";

const SEKTORER: Array<{ namn: Sektor; farg: string }> = [
  { namn: "Teknik", farg: "#2563eb" },
  { namn: "Industri", farg: "#78716c" },
  { namn: "Hälso", farg: "#0d9488" },
  { namn: "Finans", farg: "#a8862a" },
  { namn: "Konsument", farg: "#d97706" },
  { namn: "Material", farg: "#65a30d" },
  { namn: "Energi", farg: "#b91c1c" },
  { namn: "Fastighet", farg: "#7c3aed" },
];

const VAGKLASSER: Array<{ id: Vagklass; symbol: string; etikett: string; farg: string; hint: string }> = [
  { id: "impulsvåg", symbol: "▲", etikett: "Impulsvåg", farg: "#047857", hint: "driver portföljen uppåt" },
  { id: "basbygge", symbol: "◼", etikett: "Basbygge", farg: "#a8862a", hint: "ackumulerar, inget händer — ännu" },
  { id: "korrigering", symbol: "▼", etikett: "Korrigering", farg: "#b91c1c", hint: "vinden är emot positionen" },
];

const sektorFarg = (s: Sektor): string =>
  SEKTORER.find((x) => x.namn === s)?.farg ?? "#a8862a";

const vagInfo = (v: Vagklass) => VAGKLASSER.find((k) => k.id === v) ?? VAGKLASSER[0];

const nyId = (): string =>
  `rad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const nyRad = (namn: string, sektor: Sektor, vikt: number, akm1: number, vagklass: Vagklass): Rad => ({
  id: nyId(),
  namn,
  sektor,
  vikt,
  akm1,
  vagklass,
});

// ── Färdscener (presets) ────────────────────────────────────────────────────

const PRESET_SCHLACHT = (): Rad[] => [
  nyRad("Bästa idén (Teknik)", "Teknik", 45, 78, "impulsvåg"),
  nyRad("Andra idén (Finans)", "Finans", 20, 70, "basbygge"),
  nyRad("Tredje idén (Hälso)", "Hälso", 15, 64, "impulsvåg"),
  nyRad("Fjärde idén (Industri)", "Industri", 12, 58, "korrigering"),
  nyRad("Femte idén (Teknik)", "Teknik", 8, 52, "basbygge"),
];

const PRESET_FERRI = (): Rad[] => [
  nyRad("Ryggrad 1 — bred bas", "Finans", 30, 72, "basbygge"),
  nyRad("Ryggrad 2 — bred bas", "Konsument", 30, 68, "basbygge"),
  nyRad("Satellit 1", "Teknik", 12, 80, "impulsvåg"),
  nyRad("Satellit 2", "Hälso", 10, 66, "impulsvåg"),
  nyRad("Satellit 3", "Industri", 10, 60, "korrigering"),
  nyRad("Satellit 4", "Energi", 8, 54, "korrigering"),
];

// ── Persistens (hydration-säker: las först i useEffect) ─────────────────────

const arSektor = (v: unknown): v is Sektor =>
  typeof v === "string" && SEKTORER.some((s) => s.namn === v);

const arVagklass = (v: unknown): v is Vagklass =>
  typeof v === "string" && VAGKLASSER.some((k) => k.id === v);

const tal = (v: unknown): number =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(100, Math.max(0, Math.round(v)))
    : 0;

function lasRader(): Rad[] {
  try {
    const raw = window.localStorage.getItem(NYCKEL);
    if (!raw) return [];
    const parse: unknown = JSON.parse(raw);
    if (!Array.isArray(parse)) return [];
    return parse
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .map((r, i) => ({
        id: typeof r.id === "string" && r.id !== "" ? r.id : `rad-las-${i}`,
        namn: typeof r.namn === "string" ? r.namn : "",
        sektor: arSektor(r.sektor) ? r.sektor : "Teknik",
        vikt: tal(r.vikt),
        akm1: tal(r.akm1),
        vagklass: arVagklass(r.vagklass) ? r.vagklass : "impulsvåg",
      }));
  } catch {
    return [];
  }
}

// ── Levande SVG: sektorsdonut ───────────────────────────────────────────────

function SektorsDonut({ sektorer, positioner }: {
  sektorer: Array<{ namn: Sektor; vikt: number }>;
  positioner: number;
}) {
  const R = 62;
  const C = 2 * Math.PI * R;
  const sum = sektorer.reduce((a, s) => a + s.vikt, 0);
  let start = 0;
  const segment = sektorer.map((s) => {
    const len = sum > 0 ? (s.vikt / sum) * C : 0;
    const el = { ...s, len, offset: start };
    start += len;
    return el;
  });

  return (
    <svg viewBox="0 0 160 160" className="mx-auto w-full max-w-[200px]">
      <circle cx="80" cy="80" r={R} fill="none" stroke="#5a5045" strokeWidth="22" opacity="0.12" />
      {sum > 0 && (
        <g transform="rotate(-90 80 80)">
          {segment.map((s) =>
            s.len > 1 ? (
              <circle
                key={s.namn}
                cx="80"
                cy="80"
                r={R}
                fill="none"
                stroke={sektorFarg(s.namn)}
                strokeWidth="22"
                strokeDasharray={`${s.len - 1} ${C}`}
                strokeDashoffset={-s.offset}
              />
            ) : null,
          )}
        </g>
      )}
      <circle cx="80" cy="80" r="40" fill="#fffdf7" stroke="#a8862a" strokeWidth="1" />
      <text x="80" y="76" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5a5045">
        {positioner} {positioner === 1 ? "position" : "positioner"}
      </text>
      <text x="80" y="89" textAnchor="middle" fontSize="8" fontStyle="italic" fill="#5a5045">
        {sektorer.length} {sektorer.length === 1 ? "sektor" : "sektorer"}
      </text>
    </svg>
  );
}

// ── Levande SVG: viktat AKM1 ────────────────────────────────────────────────

function Akm1Stapel({ poang }: { poang: number }) {
  const W = 300;
  const x = (v: number) => 10 + (v / 100) * (W - 20);
  const farg = poang >= 70 ? "#047857" : poang >= 50 ? "#a8862a" : "#b91c1c";
  return (
    <svg viewBox="0 0 300 64" className="w-full">
      <text x="10" y="12" fontSize="8" fill="#5a5045">VIKTAT AKM1-GENOMSNITT</text>
      <text x={W - 10} y="14" textAnchor="end" fontSize="14" fontWeight="bold" fill={farg}>
        {Math.round(poang)} / 100
      </text>
      <rect x="10" y="20" width={W - 20} height="18" rx="9" fill="#5a5045" opacity="0.15" />
      {poang > 0 && (
        <rect x="10" y="20" width={Math.max(9, x(poang) - 10)} height="18" rx="9" fill={farg} />
      )}
      <line x1={x(50)} y1="14" x2={x(50)} y2="46" stroke="#5a5045" strokeWidth="1.5" strokeDasharray="4,3" />
      <text x={x(50)} y="56" textAnchor="middle" fontSize="8" fill="#5a5045">tröskel 50</text>
      <text x={W - 10} y="56" textAnchor="end" fontSize="8" fontStyle="italic" fill="#5a5045">
        {poang >= 70 ? "över 70 — ryggrad att luta sig mot" : poang >= 50 ? "mellan 50 och 70 — godkänt, inte mer" : "under 50 — de svaga drar"}
      </text>
    </svg>
  );
}

// ── Levande SVG: vågfördelning (AK1TS) ──────────────────────────────────────

function VagFordelningsRad({ fordelning, sum }: {
  fordelning: Record<Vagklass, number>;
  sum: number;
}) {
  const W = 300;
  let xr = 10;
  const segment = VAGKLASSER.map((k) => {
    const w = sum > 0 ? (fordelning[k.id] / sum) * (W - 20) : 0;
    const x0 = xr;
    xr += w;
    return { ...k, x0, w };
  });
  return (
    <svg viewBox="0 0 300 36" className="w-full">
      <rect x="10" y="10" width={W - 20} height="16" rx="8" fill="#5a5045" opacity="0.15" />
      {sum > 0 &&
        segment
          .filter((s) => s.w > 0.5)
          .map((s) => (
            <g key={s.id}>
              <rect x={s.x0} y="10" width={s.w} height="16" fill={s.farg} opacity="0.85" />
              <text x={s.x0 + s.w / 2} y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fffdf7">
                {s.symbol}
              </text>
            </g>
          ))}
      {sum <= 0 && (
        <text x={W / 2} y="22" textAnchor="middle" fontSize="8" fontStyle="italic" fill="#5a5045">
          lägg till rader för att se vågfördelningen
        </text>
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// HUVUDKOMPONENT
// ═══════════════════════════════════════════════════════════
export function Portfoljbyggare() {
  const [rader, setRader] = useState<Rad[]>([]);
  const [hydrerad, setHydrerad] = useState(false);
  const [form, setForm] = useState<{
    namn: string;
    sektor: Sektor;
    vikt: number;
    akm1: number;
    vagklass: Vagklass;
  }>({ namn: "", sektor: "Teknik", vikt: 10, akm1: 60, vagklass: "impulsvåg" });

  // Hämta sparad portfölj vid montering (SSR-säkert, tomt första passt).
  useEffect(() => {
    setRader(lasRader());
    setHydrerad(true);
  }, []);

  // Autospara vid varje ändring.
  useEffect(() => {
    if (!hydrerad) return;
    try {
      window.localStorage.setItem(NYCKEL, JSON.stringify(rader));
    } catch {
      /* full disk eller privat läge — verktyget fungerar ändå */
    }
  }, [rader, hydrerad]);

  // ── Levande analys ────────────────────────────────────────────────────────
  const analys = useMemo(() => {
    const sumVikt = rader.reduce((a, r) => a + r.vikt, 0);
    const sektorMap = new Map<Sektor, number>();
    for (const r of rader) sektorMap.set(r.sektor, (sektorMap.get(r.sektor) ?? 0) + r.vikt);
    const sektorer = SEKTORER.map((s) => ({ namn: s.namn, vikt: sektorMap.get(s.namn) ?? 0 })).filter(
      (s) => s.vikt > 0,
    );
    const vagtAkm1 = sumVikt > 0 ? rader.reduce((a, r) => a + r.vikt * r.akm1, 0) / sumVikt : 0;
    const vagfordelning: Record<Vagklass, number> = { "impulsvåg": 0, korrigering: 0, basbygge: 0 };
    for (const r of rader) vagfordelning[r.vagklass] += r.vikt;
    const tyngst = rader.length > 0 ? rader.reduce((b, r) => (r.vikt > b.vikt ? r : b)) : null;
    const tyngstaSektorn = sektorer.length > 0 ? sektorer.reduce((b, s) => (s.vikt > b.vikt ? s : b)) : null;
    return { sumVikt, sektorer, vagtAkm1, vagfordelning, tyngst, tyngstaSektorn };
  }, [rader]);

  const { sumVikt, sektorer, vagtAkm1, vagfordelning, tyngst, tyngstaSektorn } = analys;
  const differens = Math.round(100 - sumVikt);

  // ── Varningar i realtid (AK1A-pedagogik) ──────────────────────────────────
  const varningar = useMemo(() => {
    const ut: Array<{ rubrik: string; text: string }> = [];
    if (rader.length === 0) return ut;
    if (tyngst && tyngst.vikt > 40) {
      ut.push({
        rubrik: `Koncentration: ${tyngst.namn.trim() || "Namnlös position"} väger ${tyngst.vikt}%`,
        text: "Över 40%-regeln. Conviction är vackert — tills just det bolaget slår fel och får definiera hela portföljens resultat.",
      });
    }
    if (tyngstaSektorn && tyngstaSektorn.vikt > 50) {
      ut.push({
        rubrik: `Sektorkoncentration: ${tyngstaSektorn.namn} väger ${Math.round(tyngstaSektorn.vikt)}%`,
        text: "Mer än hälften av portföljen kör på samma berättelse. Om berättelsen spricker ramlar positionerna samtidigt — det är då spridning betalar sin försäkringspremie.",
      });
    }
    if (sumVikt > 0 && vagtAkm1 < 50) {
      ut.push({
        rubrik: `Viktat AKM1: ${Math.round(vagtAkm1)} — under tröskeln 50`,
        text: "Portföljen är ett genomsnitt — de svagaste positionerna drar. Varje rad under 50 kostar resten av portföljen energi.",
      });
    }
    return ut;
  }, [rader, tyngst, tyngstaSektorn, sumVikt, vagtAkm1]);

  // ── Åtgärder ──────────────────────────────────────────────────────────────
  const uppdatera = (id: string, patch: Partial<Rad>) =>
    setRader((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const tabort = (id: string) => setRader((rs) => rs.filter((r) => r.id !== id));

  const lagdTill = () => {
    setRader((rs) => [...rs, { id: nyId(), namn: form.namn.trim(), sektor: form.sektor, vikt: form.vikt, akm1: form.akm1, vagklass: form.vagklass }]);
    setForm((f) => ({ ...f, namn: "" }));
  };

  const normalisera = () => {
    if (sumVikt <= 0) return;
    setRader((rs) => {
      const runda = rs.map((r) => ({ ...r, vikt: Math.round((r.vikt / sumVikt) * 100) }));
      const diff = 100 - runda.reduce((a, r) => a + r.vikt, 0);
      if (runda.length > 0 && diff !== 0) {
        const ix = runda.reduce((b, r, i) => (r.vikt > runda[b].vikt ? i : b), 0);
        runda[ix] = { ...runda[ix], vikt: Math.max(0, runda[ix].vikt + diff) };
      }
      return runda;
    });
  };

  const anvandPreset = (r: Rad[]) => setRader(r);

  // ── Rendera ───────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border-2 border-gold/40 bg-card p-4 sm:p-6">
      <p className="text-sm font-bold uppercase tracking-widest text-gold">
        🧩 Portföljbyggaren — komponera och SE risken förändras
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Lägg till rader, dra i reglagen och se sektorsdonuten, det viktade AKM1-snittet och
        AK1TS-vågfördelningen röra sig i realtid. Varningarna är läraren som tittar över axeln.
      </p>

      {/* Färdscener */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => anvandPreset(PRESET_SCHLACHT())}
          className="rounded-lg border border-gold/40 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10"
        >
          ⚔ Schlacht-koncentrerat: 5 bolag
        </button>
        <button
          onClick={() => anvandPreset(PRESET_FERRI())}
          className="rounded-lg border border-gold/40 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10"
        >
          🐢 Ferri-ryggrad: 60% bred bas + satelliter
        </button>
        <button
          onClick={() => anvandPreset([])}
          className="rounded-lg border border-gold/40 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10"
        >
          ✕ Tom — bygg själv
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ── Vänster: positioner + ny rad ─────────────────────── */}
        <section>
          <h3 className="font-serif text-lg font-bold text-gold">Dina positioner</h3>

          {rader.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-gold/30 bg-paper p-4 text-center text-xs italic text-muted-foreground">
              Portföljen är tom. Lägg till din första rad här under — eller testa ett
              färdscenario ovan för att se verktyget andas.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {rader.map((r) => {
                const vi = vagInfo(r.vagklass);
                return (
                  <div key={r.id} className="rounded-xl border border-gold/30 bg-paper p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: sektorFarg(r.sektor) }} />
                      <span className="max-w-[45%] truncate text-sm font-semibold">
                        {r.namn.trim() === "" ? "Namnlös position" : r.namn}
                      </span>
                      <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold" style={{ color: sektorFarg(r.sektor) }}>
                        {r.sektor}
                      </span>
                      <span className="text-[11px] font-semibold" style={{ color: vi.farg }}>
                        {vi.symbol} {vi.etikett}
                      </span>
                      <span className="ml-auto font-mono text-sm font-bold text-gold">{r.vikt}%</span>
                      <button
                        onClick={() => tabort(r.id)}
                        aria-label="Ta bort rad"
                        className="rounded border border-red-300 px-1.5 py-0.5 text-[11px] font-bold text-red-700 hover:bg-red-50"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Vikt: <span className="font-mono text-sm text-gold">{r.vikt}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={r.vikt}
                          onChange={(e) => uppdatera(r.id, { vikt: Number(e.target.value) })}
                          className="mt-1 w-full accent-[#a8862a]"
                        />
                      </label>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        AKM1: <span className="font-mono text-sm text-gold">{r.akm1}</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={r.akm1}
                          onChange={(e) => uppdatera(r.id, { akm1: Number(e.target.value) })}
                          className="mt-1 w-full accent-[#a8862a]"
                        />
                      </label>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <select
                        value={r.sektor}
                        onChange={(e) => uppdatera(r.id, { sektor: e.target.value as Sektor })}
                        className="rounded-lg border border-gold/30 bg-paper px-2 py-1 text-xs"
                        aria-label="Sektor"
                      >
                        {SEKTORER.map((s) => (
                          <option key={s.namn} value={s.namn}>{s.namn}</option>
                        ))}
                      </select>
                      <select
                        value={r.vagklass}
                        onChange={(e) => uppdatera(r.id, { vagklass: e.target.value as Vagklass })}
                        className="rounded-lg border border-gold/30 bg-paper px-2 py-1 text-xs"
                        aria-label="Vågklass"
                      >
                        {VAGKLASSER.map((k) => (
                          <option key={k.id} value={k.id}>{k.symbol} {k.etikett}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ny rad */}
          <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gold">+ Lägg till rad</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={form.namn}
                onChange={(e) => setForm((f) => ({ ...f, namn: e.target.value }))}
                placeholder="Bolagsnamn (fri text)"
                className="rounded-lg border border-gold/30 bg-paper px-2 py-1 text-sm"
              />
              <select
                value={form.sektor}
                onChange={(e) => setForm((f) => ({ ...f, sektor: e.target.value as Sektor }))}
                className="rounded-lg border border-gold/30 bg-paper px-2 py-1 text-xs"
                aria-label="Sektor för ny rad"
              >
                {SEKTORER.map((s) => (
                  <option key={s.namn} value={s.namn}>{s.namn}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Vikt: <span className="font-mono text-sm text-gold">{form.vikt}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.vikt}
                  onChange={(e) => setForm((f) => ({ ...f, vikt: Number(e.target.value) }))}
                  className="mt-1 w-full accent-[#a8862a]"
                />
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                AKM1: <span className="font-mono text-sm text-gold">{form.akm1}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.akm1}
                  onChange={(e) => setForm((f) => ({ ...f, akm1: Number(e.target.value) }))}
                  className="mt-1 w-full accent-[#a8862a]"
                />
              </label>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={form.vagklass}
                onChange={(e) => setForm((f) => ({ ...f, vagklass: e.target.value as Vagklass }))}
                className="rounded-lg border border-gold/30 bg-paper px-2 py-1 text-xs"
                aria-label="Vågklass för ny rad"
              >
                {VAGKLASSER.map((k) => (
                  <option key={k.id} value={k.id}>{k.symbol} {k.etikett}</option>
                ))}
              </select>
              <span className="text-[10px] italic text-muted-foreground">
                {vagInfo(form.vagklass).hint}
              </span>
              <button
                onClick={lagdTill}
                className="ml-auto rounded-lg bg-gold px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Lägg till rad →
              </button>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Dina rader sparas automatiskt i webbläsaren — stäng fliken och kom tillbaka.
          </p>
        </section>

        {/* ── Höger: levande portföljbild ──────────────────────── */}
        <section>
          <h3 className="font-serif text-lg font-bold text-gold">Portföljbilden — levande</h3>

          {/* Nyckeltal */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <div className="rounded-lg bg-gold/10 p-2">
              <p className={`font-mono text-lg font-bold ${differens === 0 ? "text-gold" : "text-red-700"}`}>{sumVikt}%</p>
              <p className="text-[10px] text-muted-foreground">summa vikt</p>
            </div>
            <div className="rounded-lg bg-gold/10 p-2">
              <p className="font-mono text-lg font-bold text-gold">{rader.length}</p>
              <p className="text-[10px] text-muted-foreground">positioner</p>
            </div>
            <div className="rounded-lg bg-gold/10 p-2">
              <p className="font-mono text-lg font-bold text-gold">{sektorer.length}</p>
              <p className="text-[10px] text-muted-foreground">sektorer</p>
            </div>
            <div className="rounded-lg bg-gold/10 p-2">
              <p className="font-mono text-lg font-bold text-gold">{Math.round(vagtAkm1)}</p>
              <p className="text-[10px] text-muted-foreground">vägt AKM1</p>
            </div>
          </div>

          {/* Donut + legend */}
          <div className="mt-3 rounded-xl border border-gold/30 bg-paper p-4">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-gold">
              🥧 Sektorspridning
            </p>
            <div className="mt-2">
              <SektorsDonut sektorer={sektorer} positioner={rader.length} />
            </div>
            {sektorer.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {sektorer.map((s) => (
                  <span key={s.namn} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: sektorFarg(s.namn) }} />
                    {s.namn} {Math.round(sumVikt > 0 ? (s.vikt / sumVikt) * 100 : 0)}%
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Kapitalflöde — Sankey (visas först när portföljen har minst två rader) */}
          {rader.length >= 2 && (
            <div className="mt-3">
              <h4 className="font-serif text-base font-bold text-gold">
                Kapitalflödet — från helhet till positioner
              </h4>
              <div className="hjarlinje mt-1" aria-hidden="true" />
              <div className="mt-2">
                <SankeyPortfolj
                  positioner={rader.map((r) => ({ namn: r.namn, sektor: r.sektor, vikt: r.vikt }))}
                />
              </div>
            </div>
          )}

          {/* Vagt AKM1 */}
          <div className="mt-3 rounded-xl border border-gold/30 bg-paper p-4">
            <Akm1Stapel poang={vagtAkm1} />
          </div>

          {/* Vågfördelning */}
          <div className="mt-3 rounded-xl border border-gold/30 bg-paper p-4">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-gold">
              ▲◼▼ AK1TS-vågfördelning
            </p>
            <div className="mt-2">
              <VagFordelningsRad fordelning={vagfordelning} sum={sumVikt} />
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {VAGKLASSER.map((k) => (
                <span key={k.id} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="font-bold" style={{ color: k.farg }}>{k.symbol}</span>
                  {k.etikett} {sumVikt > 0 ? Math.round((vagfordelning[k.id] / sumVikt) * 100) : 0}%
                </span>
              ))}
            </div>
          </div>

          {/* Varningar — guld-rutor i realtid */}
          <div className="mt-3 space-y-2">
            {rader.length > 0 && differens !== 0 && (
              <div className="rounded-xl border border-gold/40 bg-gold/10 p-3">
                <p className="text-sm font-bold text-gold">
                  ⚠ Vikterna summerar inte till 100%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Summan är {sumVikt}% — differensen är{" "}
                  <span className="font-mono font-bold">
                    {differens > 0 ? "+" : ""}
                    {differens} procentenheter
                  </span>
                  . Det som inte är aktier är kassa: allokeringen är ett heltal.
                </p>
                <button
                  onClick={normalisera}
                  className="mt-2 rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold/20"
                >
                  Justera proportionellt till 100%
                </button>
              </div>
            )}

            {varningar.map((v) => (
              <div key={v.rubrik} className="rounded-xl border border-gold/40 bg-gold/10 p-3">
                <p className="text-sm font-bold text-gold">⚠ {v.rubrik}</p>
                <p className="mt-1 text-xs text-muted-foreground">{v.text}</p>
              </div>
            ))}

            {rader.length > 0 && varningar.length === 0 && differens === 0 && (
              <div className="rounded-xl border border-gold/30 bg-gold/10 p-3">
                <p className="text-sm font-bold text-gold">✓ Inga varningar just nu</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ingen position över 40%, ingen sektor över 50%, viktat AKM1 över tröskeln —
                  portföljen andas sund spridning. Kom ihåg: det är ett ögonblick, inte ett betyg.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Disclaimer */}
      <p className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-xs italic text-gold">
        Pedagogiskt verktyg — inte investeringsråd. Poängen är didaktiska, aldrig rekommendationer.
      </p>

      {/* Nästa steg — från tänkt portfölj till riktig förståelse */}
      <div className="mt-6 rounded-xl border border-gold/30 bg-card p-5">
        <h3 className="font-serif text-lg font-bold">Nästa steg</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Portföljen är byggd — så här växer den till verklig kompetens:
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Link
            href="/min-portfolj"
            className="rounded-xl border border-gold/30 bg-paper p-4 transition-colors hover:border-gold/60"
          >
            <p className="font-serif text-base font-bold text-gold">Min portfölj →</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Lägg in dina faktiska innehav och kör djupanalysen (5×5×4) — jämför med den
              portfölj du just byggt på skräpminnet.
            </p>
          </Link>
          <Link
            href="/superanalys"
            className="rounded-xl border border-gold/30 bg-paper p-4 transition-colors hover:border-gold/60"
          >
            <p className="font-serif text-base font-bold text-gold">Superanalysen →</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              AKM1-reglaget var en gissning — byt den mot ett riktigt betyg: kör 24 steg på
              bolaget bakom positionen.
            </p>
          </Link>
          <Link
            href="/kurser/pf-01-portfoljbyggande"
            className="rounded-xl border border-gold/30 bg-paper p-4 transition-colors hover:border-gold/60"
          >
            <p className="font-serif text-base font-bold text-gold">Kursen Portfölj-byggande →</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Teorin bakom färdscenerna: kärna-satellit, Ferri-ryggraden och dold
              korrelation — varningarnas ursprung.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
