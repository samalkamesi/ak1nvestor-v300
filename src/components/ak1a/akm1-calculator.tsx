"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

type Var = { id: string; name: string; category: string; slug: string; weight: string; kalla: string };

const VARIABLER: Var[] = [
  { id: "V01", name: "Försäljningstillväxt", category: "Tillväxt", slug: "v01-forsaljningstillvaxt", weight: "KRITISK", kalla: "Resultaträkning: Nettoomsättning (året + föregående år)" },
  { id: "V02", name: "ARR-tillväxt", category: "Tillväxt", slug: "v02-arr-tillvaxt", weight: "8%", kalla: "Förvaltningsberättelsen eller presentation: 'ARR' (SaaS-bolag)" },
  { id: "V03", name: "Intäktsdiversifiering", category: "Tillväxt", slug: "v03-intaktsdiversifiering", weight: "6%", kalla: "Not om segment/intäktsfördelning + storkundsnot" },
  { id: "V04", name: "P/S", category: "Värdering", slug: "v04-ps", weight: "8%", kalla: "Börsvärde (börsen) ÷ Nettoomsättning (resultaträkningen)" },
  { id: "V05", name: "P/B", category: "Värdering", slug: "v05-pb", weight: "6%", kalla: "Börsvärde ÷ Eget kapital (balansräkningen)" },
  { id: "V06", name: "EV/EBITDA", category: "Värdering", slug: "v06-ev-ebitda", weight: "8%", kalla: "(Börsvärde + Räntebärande skulder − Kassa) ÷ EBITDA" },
  { id: "V07", name: "Bruttomarginal", category: "Lönsamhet", slug: "v07-bruttomarginal", weight: "KRITISK", kalla: "Resultaträkning: (Nettoomsättning − Rörelsens kostnader exkl. personalkostnader)" },
  { id: "V08", name: "EBITDA-marginal", category: "Lönsamhet", slug: "v08-ebitda-marginal", weight: "8%", kalla: "Resultaträkning: Rörelseresultat + Avskrivningar ÷ Nettoomsättning" },
  { id: "V09", name: "ROE", category: "Lönsamhet", slug: "v09-roe", weight: "8%", kalla: "Resultat efter skatt ÷ snitt Eget kapital (balansräkning, årets början + slut)" },
  { id: "V10", name: "Skuldsättningsgrad", category: "Stabilitet", slug: "v10-skuldsattningsgrad", weight: "6%", kalla: "Balansräkning: Skulder och övriga förpliktelser ÷ Eget kapital" },
  { id: "V11", name: "Likviditet", category: "Stabilitet", slug: "v11-likviditet", weight: "6%", kalla: "Balansräkning: Omsättningstillgångar ÷ Kortfristiga skulder (kvick) — både åren" },
  { id: "V12", name: "Intäktsstabilitet", category: "Stabilitet", slug: "v12-intaktsstabilitet", weight: "6%", kalla: "5 års nettoomsättning i årsredovisningen — hur jämn kurvan?" },
  { id: "V13", name: "Patent & IP", category: "Moat", slug: "v13-patent-ip", weight: "6%", kalla: "Not om immateriella tillgångar; förvaltningsberättelsen" },
  { id: "V14", name: "Varumärke", category: "Moat", slug: "v14-varumarke", weight: "6%", kalla: "Förvaltningsberättelsen, kundnot, marknadsandelar" },
  { id: "V15", name: "Nätverkseffekter", category: "Moat", slug: "v15-natverkseffekter", weight: "6%", kalla: "Förvaltningsberättelsen; kundantal över tid" },
  { id: "V16", name: "Produktlanseringar", category: "Katalysator", slug: "v16-produktlanseringar", weight: "6%", kalla: "Förvaltningsberättelsen: kommande lanseringar/pipeline" },
  { id: "V17", name: "Avtal & Partnerskap", category: "Katalysator", slug: "v17-avtal-partnerskap", weight: "6%", kalla: "Pressmeddelanden + förvaltningsberättelse: 'viktiga avtal'" },
  { id: "V18", name: "Regulatoriska", category: "Katalysator", slug: "v18-regulatoriska", weight: "6%", kalla: "Riskavsnittet i förvaltningsberättelsen; myndighetsbeslut" },
  { id: "V19", name: "Kapitalförbränning", category: "Risk", slug: "v19-kapitalforbranning", weight: "KRITISK", kalla: "Kassaflödesanalysen: 'Kassaflöde från den löpande verksamheten' + Balansräkningen: Kassa" },
  { id: "V20", name: "Återköp & insiderköp (VD/styrelse/bolag)", category: "Kapitalstruktur", slug: "v20-aterekop-egna-aktier", weight: "6%", kalla: "Aktieägar-/insiderdata (Finansinspektionen, börsen); not om återköp" },
];

const KATEGORIER = ["Tillväxt", "Värdering", "Lönsamhet", "Stabilitet", "Moat", "Katalysator", "Risk", "Kapitalstruktur"];

/** Riktiga poäng från AK1A-analyser — pedagogiska exempel. */
const EXEMPEL: Record<string, { label: string; poang: Record<string, number>; not: string }> = {
  prec: {
    label: "Precise Biometrics",
    poang: { V01: 2, V02: 3, V03: 3, V04: 3, V05: 2, V06: 2, V07: 5, V08: 2, V09: 1, V10: 5, V11: 4, V12: 2, V13: 4, V14: 3, V15: 3, V16: 4, V17: 4, V18: 4, V19: 3, V20: 1 },
    not: "Förenklat — officiell analys: 38/100 (fusionens osäkerhet vägs in där)",
  },
  volcar: {
    label: "Volvo Cars",
    poang: { V01: 3, V02: 3, V03: 5, V04: 5, V05: 2, V06: 3, V07: 3, V08: 3, V09: 2, V10: 2, V11: 3, V12: 2, V13: 4, V14: 5, V15: 2, V16: 3, V17: 4, V18: 3, V19: 3, V20: 2 },
    not: "Förenklat — officiell analys: 62/100",
  },
};

function bedom(total: number) {
  if (total >= 80) return { rec: "STARKT KÖP", tier: "STARK", farg: "text-green-700" };
  if (total >= 60) return { rec: "KÖP", tier: "MEDL-STARK", farg: "text-green-700" };
  if (total >= 40) return { rec: "FÖRSIKTIGT KÖP", tier: "MEDEL", farg: "text-gold" };
  if (total >= 25) return { rec: "MINSKA", tier: "SVAG-MEDL", farg: "text-orange-700" };
  return { rec: "SÄLJ", tier: "SVAG", farg: "text-red-700" };
}

// ── Numeriska beräknare: fält → mått → poäng enligt pedagogiska trösklar ────

type Raknare = {
  id: string;
  namn: string;
  falt: Array<{ key: string; label: string; enhet?: string }>;
  formula: string;
  var: string;
  kalla: string;
  exempel: string;
  rakna: (v: Record<string, number>) => { varde: number; enhet: string; poang: number } | null;
};

const tal = (v: Record<string, number>, k: string) => {
  const n = Number(v[k]);
  return Number.isFinite(n) && n !== 0 ? n : null;
};

function poangFranTrosklar(varde: number, trosklar: Array<[number, number]>): number {
  for (const [grans, p] of trosklar) {
    if (varde >= grans) return p;
  }
  return 1;
}

export const RAKNARE: Raknare[] = [
  {
    id: "v01",
    namn: "V01 · Försäljningstillväxt",
    var: "V01",
    falt: [
      { key: "oms_iar", label: "Nettoomsättning i år", enhet: "MSEK" },
      { key: "oms_far", label: "Nettoomsättning förra året", enhet: "MSEK" },
    ],
    formula: "(Året − Förra) ÷ Förra × 100 %",
    kalla: "Årsredovisning/kvartalsrapport → Konsoliderad resultaträkning → raden 'Nettoomsättning'. Föregående års siffra står i kolumnen bredvid (eller i fjolårets rapport).",
    exempel: "Omsättning 1 200 MSEK i år, 1 000 förra → (1200−1000)/1000 = 20 % → poäng 4",
    rakna: (v) => {
      const a = tal(v, "oms_iar");
      const b = tal(v, "oms_far");
      if (a == null || b == null) return null;
      const t = ((a - b) / Math.abs(b)) * 100;
      const p = t >= 30 ? 5 : t >= 20 ? 4 : t >= 10 ? 3 : t >= 0 ? 2 : 1;
      return { varde: Math.round(t * 10) / 10, enhet: "%", poang: p };
    },
  },
  {
    id: "v04",
    namn: "V04 · P/S (pris/omsättning)",
    var: "V04",
    falt: [
      { key: "bv", label: "Börsvärde", enhet: "MSEK" },
      { key: "oms", label: "Nettoomsättning (senaste 12 mån)", enhet: "MSEK" },
    ],
    formula: "Börsvärde ÷ Nettoomsättning",
    kalla: "Börsvärde: aktiekurs × antal aktier (finns på t.ex. Avanza/Nordnet under 'Nyckeltal' eller 'Börsvärde'). Omsättning: resultaträkningen, rullande 12 månader om möjligt.",
    exempel: "Börsvärde 6 000 MSEK, omsättning 3 000 → P/S 2,0 → poäng 3",
    rakna: (v) => {
      const bv = tal(v, "bv");
      const oms = tal(v, "oms");
      if (bv == null || oms == null) return null;
      const ps = bv / oms;
      const p = ps < 1 ? 5 : ps < 2 ? 4 : ps < 3 ? 3 : ps < 5 ? 2 : 1;
      return { varde: Math.round(ps * 100) / 100, enhet: "x", poang: p };
    },
  },
  {
    id: "v05",
    namn: "V05 · P/B (pris/eget kapital)",
    var: "V05",
    falt: [
      { key: "bv", label: "Börsvärde", enhet: "MSEK" },
      { key: "ek", label: "Eget kapital", enhet: "MSEK" },
    ],
    formula: "Börsvärde ÷ Eget kapital",
    kalla: "Eget kapital: balansräkningen → 'Eget kapital' (summan av moderbolag + minoriteter vid koncern). Jämför gärna med 5-årigt snitt i noterna.",
    exempel: "Börsvärde 6 000, eget kapital 4 000 → P/B 1,5 → poäng 4",
    rakna: (v) => {
      const bv = tal(v, "bv");
      const ek = tal(v, "ek");
      if (bv == null || ek == null) return null;
      const pb = bv / ek;
      const p = pb < 1 ? 5 : pb < 2 ? 4 : pb < 3 ? 3 : pb < 5 ? 2 : 1;
      return { varde: Math.round(pb * 100) / 100, enhet: "x", poang: p };
    },
  },
  {
    id: "v06",
    namn: "V06 · EV/EBITDA",
    var: "V06",
    falt: [
      { key: "bv", label: "Börsvärde", enhet: "MSEK" },
      { key: "skuld", label: "Räntebärande skulder", enhet: "MSEK" },
      { key: "kassa", label: "Kassa & bank", enhet: "MSEK" },
      { key: "ebitda", label: "EBITDA (rullande 12 mån)", enhet: "MSEK" },
    ],
    formula: "(Börsvärde + Skulder − Kassa) ÷ EBITDA",
    kalla: "Räntebärande skulder + kassa: balansräkningen. EBITDA: rörelseresultat + avskrivningar (kassaflödesanalysen visar avskrivningarna).",
    exempel: "EV = 6000+1500−500 = 7000, EBITDA 1000 → 7,0x → poäng 2",
    rakna: (v) => {
      const bv = tal(v, "bv");
      const skuld = Number(v.skuld) || 0;
      const kassa = Number(v.kassa) || 0;
      const ebitda = tal(v, "ebitda");
      if (bv == null || ebitda == null) return null;
      const ev = bv + skuld - kassa;
      const m = ev / ebitda;
      const p = m < 5 ? 5 : m < 7 ? 4 : m < 10 ? 3 : m < 14 ? 2 : 1;
      return { varde: Math.round(m * 100) / 100, enhet: "x", poang: p };
    },
  },
  {
    id: "v07",
    namn: "V07 · Bruttomarginal",
    var: "V07",
    falt: [
      { key: "oms", label: "Nettoomsättning", enhet: "MSEK" },
      { key: "rkost", label: "Rörelsens kostnader (exkl. avskr.)", enhet: "MSEK" },
    ],
    formula: "(Omsättning − Rörelsens kostnader) ÷ Omsättning × 100 %",
    kalla: "Resultaträkningen: 'Rörelsens kostnader' (vissa bolag redovisar bruttovinst direkt — använd den isåfall). OBS: vissa bolag inkluderar personalkostnader — jämör med 5-års historik.",
    exempel: "Omsättning 1 000, kostnader 550 → bruttomarginal 45 % → poäng 4",
    rakna: (v) => {
      const oms = tal(v, "oms");
      const rk = Number(v.rkost);
      if (oms == null || !Number.isFinite(rk)) return null;
      const m = ((oms - rk) / oms) * 100;
      const p = m >= 60 ? 5 : m >= 40 ? 4 : m >= 25 ? 3 : m >= 10 ? 2 : 1;
      return { varde: Math.round(m * 10) / 10, enhet: "%", poang: p };
    },
  },
  {
    id: "v08",
    namn: "V08 · EBITDA-marginal",
    var: "V08",
    falt: [
      { key: "ebitda", label: "EBITDA", enhet: "MSEK" },
      { key: "oms", label: "Nettoomsättning", enhet: "MSEK" },
    ],
    formula: "EBITDA ÷ Nettoomsättning × 100 %",
    kalla: "Rörelseresultat (EBIT) + avskrivningar (kassaflödesanalysen: 'Avskrivningar av materiella/immateriella tillgångar').",
    exempel: "EBITDA 180 på omsättning 1 000 → 18 % → poäng 4",
    rakna: (v) => {
      const e = tal(v, "ebitda");
      const oms = tal(v, "oms");
      if (e == null || oms == null) return null;
      const m = (e / oms) * 100;
      const p = m >= 25 ? 5 : m >= 15 ? 4 : m >= 10 ? 3 : m >= 5 ? 2 : 1;
      return { varde: Math.round(m * 10) / 10, enhet: "%", poang: p };
    },
  },
  {
    id: "v09",
    namn: "V09 · ROE (avkastning eget kapital)",
    var: "V09",
    falt: [
      { key: "res", label: "Resultat efter skatt", enhet: "MSEK" },
      { key: "ek_start", label: "Eget kapital, årets början", enhet: "MSEK" },
      { key: "ek_slut", label: "Eget kapital, årets slut", enhet: "MSEK" },
    ],
    formula: "Resultat ÷ snitt(Eget kapital början, slut) × 100 %",
    kalla: "Resultat: resultaträkningens nedersta rad 'Årets resultat'. Eget kapital: balansräkningen båda tidpunkterna (förra årets rapport har årets början).",
    exempel: "Resultat 250, EK-snitt 1250 → ROE 20 % → poäng 5",
    rakna: (v) => {
      const res = tal(v, "res");
      const e1 = Number(v.ek_start);
      const e2 = Number(v.ek_slut);
      if (res == null || !Number.isFinite(e1) || !Number.isFinite(e2) || e1 + e2 === 0) return null;
      const roe = (res / ((e1 + e2) / 2)) * 100;
      const p = roe >= 20 ? 5 : roe >= 15 ? 4 : roe >= 10 ? 3 : roe >= 5 ? 2 : 1;
      return { varde: Math.round(roe * 10) / 10, enhet: "%", poang: p };
    },
  },
  {
    id: "v10",
    namn: "V10 · Skuldsättningsgrad",
    var: "V10",
    falt: [
      { key: "skulder", label: "Skulder och övriga förpliktelser", enhet: "MSEK" },
      { key: "ek", label: "Eget kapital", enhet: "MSEK" },
    ],
    formula: "Skulder ÷ Eget kapital",
    kalla: "Balansräkningen: hela posten 'Skulder och övriga förpliktelser' (både lång- och kortfristiga) ÷ 'Eget kapital'.",
    exempel: "Skulder 1 500, EK 4 000 → 0,38 → poäng 5",
    rakna: (v) => {
      const s = tal(v, "skulder");
      const ek = tal(v, "ek");
      if (s == null || ek == null) return null;
      const g = s / ek;
      const p = g < 0.5 ? 5 : g < 1 ? 4 : g < 2 ? 3 : g < 3 ? 2 : 1;
      return { varde: Math.round(g * 100) / 100, enhet: "x", poang: p };
    },
  },
  {
    id: "v19",
    namn: "V19 · Kapitalförbränning",
    var: "V19",
    falt: [
      { key: "fkf", label: "Kassaflöde från löpande verksamheten", enhet: "MSEK (negativ = förbränning)" },
      { key: "kassa", label: "Kassa & bank", enhet: "MSEK" },
    ],
    formula: "Kassa ÷ |årlig förbränning| → antal månader bolaget klarar sig",
    kalla: "Kassaflödesanalysen: 'Kassaflöde från den löpande verksamheten' (per år). Kassa: balansräkningens översta poster. Vinstdrivande bolag: FKF > 0 ger direkt poäng 5.",
    exempel: "FKF −60/år, kassa 300 → 60 månader (5 år) runway → poäng 4",
    rakna: (v) => {
      const fkf = Number(v.fkf);
      const kassa = tal(v, "kassa");
      if (!Number.isFinite(fkf) || kassa == null) return null;
      if (fkf > 0) return { varde: fkf, enhet: "MSEK positivt", poang: 5 };
      const manader = Math.round((kassa / Math.abs(fkf)) * 12);
      const p = manader >= 60 ? 5 : manader >= 36 ? 4 : manader >= 18 ? 3 : manader >= 12 ? 2 : 1;
      return { varde: manader, enhet: "mån runway", poang: p };
    },
  },
];

// ── Huvudkomponent ───────────────────────────────────────────────────────────

/** AKM1-kalkylator v2: räkna med egna siffror, poängsätt manuellt, rapportguide. */
export function Akm1Calculator() {
  const [poang, setPoang] = useState<Record<string, number>>(
    Object.fromEntries(VARIABLER.map((v) => [v.id, 3]))
  );
  const [siffror, setSiffror] = useState<Record<string, Record<string, string>>>({});
  const [not, setNot] = useState<string | null>(null);

  const total = useMemo(() => VARIABLER.reduce((s, v) => s + (poang[v.id] ?? 0), 0), [poang]);
  const { rec, tier, farg } = bedom(total);

  const katMedel = useMemo(() => {
    const ut: Record<string, number> = {};
    for (const k of KATEGORIER) {
      const vars = VARIABLER.filter((v) => v.category === k);
      ut[k] = vars.reduce((s, v) => s + (poang[v.id] ?? 0), 0) / vars.length;
    }
    return ut;
  }, [poang]);

  const laddaExempel = (nyckel: string) => {
    setPoang({ ...EXEMPEL[nyckel].poang });
    setNot(EXEMPEL[nyckel].not);
  };

  const aterstall = () => {
    setPoang(Object.fromEntries(VARIABLER.map((v) => [v.id, 3])));
    setSiffror({});
    setNot(null);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <Tabs defaultValue="rakna">
          <TabsList className="flex-wrap">
            <TabsTrigger value="rakna">🧮 Räkna med egna siffror</TabsTrigger>
            <TabsTrigger value="manuellt">⌨️ Poängsätt manuellt</TabsTrigger>
            <TabsTrigger value="guide">📖 Var hittar jag siffrorna?</TabsTrigger>
          </TabsList>

          {/* FLIK 1: räkna med egna siffror */}
          <TabsContent value="rakna" className="mt-6 space-y-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Mata in siffror från bolagets årsredovisning eller kvartalsrapport — poängen
              beräknas automatiskt enligt pedagogiska trösklar och läggs in i din
              totalpoäng. Börja med V01 och V09 — de viktigaste.
            </p>
            {RAKNARE.map((r) => {
              const v = siffror[r.id] || {};
              const num = Object.fromEntries(
                Object.entries(v).map(([k, s]) => [k, s.replace(",", ".")])
              ) as Record<string, number>;
              const resultat = r.rakna(num);
              return (
                <div key={r.id} className="rounded-xl border border-gold/20 bg-card p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold">{r.namn}</h3>
                    {resultat && (
                      <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-gold">
                        {resultat.varde} {resultat.enhet} → poäng {resultat.poang}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-mono text-muted-foreground">{r.formula}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {r.falt.map((f) => (
                      <label key={f.key} className="text-xs text-muted-foreground">
                        {f.label} {f.enhet ? `(${f.enhet})` : ""}
                        <Input
                          inputMode="decimal"
                          value={v[f.key] || ""}
                          onChange={(e) =>
                            setSiffror((p) => ({
                              ...p,
                              [r.id]: { ...p[r.id], [f.key]: e.target.value },
                            }))
                          }
                          className="mt-1 h-9 text-sm"
                          placeholder="t.ex. 1200"
                        />
                      </label>
                    ))}
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-gold">
                      Var hittar jag siffrorna? (klicka för att visa)
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.kalla}</p>
                    <p className="mt-1 text-xs italic text-muted-foreground">💡 {r.exempel}</p>
                  </details>
                  {resultat && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => {
                        setPoang((p) => ({ ...p, [r.var]: resultat.poang }));
                        setNot(null);
                      }}
                    >
                      Använd poäng {resultat.poang} för {r.var} ✓
                    </Button>
                  )}
                </div>
              );
            })}
            <p className="text-xs italic text-muted-foreground">
              Trösklarna är pedagogiska förenklingar — AK1A:s officiella analyser väger
              in bransch, trend och vågtyp. Kvalitativa variabler (moat, katalysatorer,
              V20 återköp/insider) poängsätter du på fliken "Poängsätt manuellt".
            </p>
          </TabsContent>

          {/* FLIK 2: manuellt */}
          <TabsContent value="manuellt" className="mt-6 space-y-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Alla 20 variabler som reglage — snabbt läge när du redan har bild av bolaget.
              Varje variabelnamn länkar till hela kursen med förklaring och exempel.
            </p>
            {KATEGORIER.map((kat) => (
              <section key={kat}>
                <h2 className="flex items-baseline gap-2 border-b border-gold/30 pb-1 font-serif text-lg font-bold">
                  {kat}
                  <span className="text-xs font-normal text-muted-foreground">
                    snitt {katMedel[kat].toFixed(1)} / 5
                  </span>
                </h2>
                <div className="mt-3 space-y-4">
                  {VARIABLER.filter((v) => v.category === kat).map((v) => (
                    <div key={v.id} className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/kurser/${v.slug}`}
                          className="text-sm font-medium hover:text-gold"
                          title={v.kalla}
                        >
                          {v.id} · {v.name}
                          {v.weight === "KRITISK" && (
                            <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gold">
                              kritisk
                            </span>
                          )}
                        </Link>
                      </div>
                      <Slider
                        value={[poang[v.id] ?? 0]}
                        min={0}
                        max={5}
                        step={1}
                        onValueChange={([n]) => setPoang((p) => ({ ...p, [v.id]: n }))}
                        className="w-32 shrink-0"
                      />
                      <span className="w-8 shrink-0 text-right font-mono text-sm font-bold">
                        {poang[v.id] ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </TabsContent>

          {/* FLIK 3: guide */}
          <TabsContent value="guide" className="mt-6 space-y-6">
            <div className="rounded-xl border border-gold/30 bg-card p-6">
              <h3 className="font-serif text-xl font-bold">Kartan över en svensk årsredovisning</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Varje siffra i kalkylatorn finns på en bestämd plats. Så här hittar du dem:
              </p>
              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className="font-semibold text-gold">1. Konsoliderad resultaträkningen</p>
                  <p className="text-muted-foreground">
                    Nettoomsättning (V01, V04, V07), rörelsens kostnader (V07),
                    rörelseresultat (V06, V08), årets resultat (V09). Föregående år står
                    i kolumnen till vänster.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gold">2. Konsoliderad balansräkningen</p>
                  <p className="text-muted-foreground">
                    Kassa och bank (V06, V19), omsättningstillgångar och kortfristiga
                    skulder (V11), eget kapital (V05, V09, V10), skulder och övriga
                    förpliktelser (V06, V10).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gold">3. Kassaflödesanalysen</p>
                  <p className="text-muted-foreground">
                    Kassaflöde från den löpande verksamheten (V19 — positivt eller
                    negativt?), avskrivningar (V06, V08 — för att räkna fram EBITDA).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gold">4. Förvaltningsberättelsen</p>
                  <p className="text-muted-foreground">
                    ARR och prenumerationsintäkter (V02), kundkoncentration (V03),
                    pipeline och lanseringar (V16), avtal (V17), risker (V18),
                    moat-beskrivning (V13–V15).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gold">5. Noterna (bakom rapporterna)</p>
                  <p className="text-muted-foreground">
                    Segmentredovisning (V03), storkunder (V03), finansiella skulder (V06),
                    aktieägar- och insideruppgifter (V20).
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gold/30 bg-card p-6">
              <h3 className="font-serif text-xl font-bold">Kvartalsrapport vs årsredovisning</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                <li><strong>Kvartalsrapport</strong> (var 3:e månad): omsättning, rörelseresultat, kassa — men tunn balansräkning och sällan noter. Perfekt för V01-trenden.</li>
                <li><strong>Årsredovisningen</strong> (en gång om året, publiceras på bolagets + börsens sajt): ALLT — noter, förvaltningsberättelse, risker. Hämta den som PDF från investor relations-sidan.</li>
                <li><strong>Rule of thumb:</strong> kvartalet för snabb pulse, årsredovisningen för hela poängsättningen.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gold/30 bg-card p-6">
              <h3 className="font-serif text-xl font-bold">Gengått exempel: Räkna V09 (ROE) steg för steg</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                <li>Öppna årsredovisningens <strong>resultaträkning</strong>: hitta "Årets resultat efter skatt" — säg <strong>250 MSEK</strong></li>
                <li>Öppna <strong>balansräkningen</strong> i samma rapport: "Eget kapital" i år = <strong>1 400</strong></li>
                <li>Öppna <strong>fjolårets</strong> rapport (samma sida): "Eget kapital" = <strong>1 100</strong></li>
                <li>Snitt: (1400+1100)/2 = 1 250. ROE = 250 ÷ 1 250 = <strong>20 %</strong></li>
                <li>I kalkylatorn: mata in 250, 1100, 1400 → "20,0 % → poäng 5" → <strong>Använd poäng</strong></li>
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">
                Läs mer: <Link href="/kurser/v09-roe" className="underline hover:text-gold">kursen V09: ROE</Link> och{" "}
                <Link href="/blogg/v09-roe-avkastning-eget-kapital" className="underline hover:text-gold">artikeln om att räkna ROE som Carnegie</Link>.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Resultatpanel */}
      <aside className="h-fit space-y-4 rounded-xl border border-gold/30 bg-card p-6 lg:sticky lg:top-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">AKM1-poäng</p>
          <p className="font-serif text-5xl font-bold text-gold">
            {total}
            <span className="text-lg text-muted-foreground"> / 100</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Nivå: {tier}</p>
        </div>
        <div className="rounded-lg border border-gold/30 bg-paper p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Rekommendation</p>
          <p className={`mt-1 font-serif text-2xl font-bold ${farg}`}>{rec}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prova på riktiga analyser
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => laddaExempel("prec")}>
              Precise Biometrics
            </Button>
            <Button variant="outline" size="sm" onClick={() => laddaExempel("volcar")}>
              Volvo Cars
            </Button>
            <Button variant="ghost" size="sm" onClick={aterstall}>
              Återställ
            </Button>
          </div>
          {not && <p className="text-xs italic text-muted-foreground">{not}</p>}
        </div>
        <p className="border-t border-gold/20 pt-3 text-xs leading-relaxed text-muted-foreground">
          Poäng 0–5 per variabel, summa max 100. Förenklad pedagogisk modell — AK1A:s
          officiella analyser väger in vågtyp, osäkerhet och konfluens.{" "}
          <Link href="/blogg/komplett-guide-svensk-aktieanalys-2026" className="underline hover:text-foreground">
            Läs metoden
          </Link>
          . Pedagogisk finansanalys — inte investeringsråd.
        </p>
      </aside>
    </div>
  );
}
