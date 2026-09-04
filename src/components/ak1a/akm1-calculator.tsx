"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  raknaAKM2,
  forklaraPoang,
  VARIABEL_META,
  BAND_TEXT,
  MODELL_VERSION,
  DYNAMIKTAK,
  KASSA_PORT_MANADER,
  KASSA_PORT_MAX_KOMPOSIT,
} from "@/lib/akm2/karna";
import { VIKTPROFILER } from "@/lib/akm2/vikter";
import { MODULER, aktivaModulerForBransch, KARNA_MODUL_VARIABLER } from "@/lib/akm2/moduler";
import { harFas2Access, arAdmin, aktiveraFas2Override } from "@/lib/kurs-access";
import { BRANSCHER } from "@/lib/portfolj-forskning/typer";
import type { BranschModul } from "@/lib/akm2/moduler";
import type {
  AKM1Bedomning,
  BolagsNyckeltal,
  Bransch,
} from "@/lib/portfolj-forskning/typer";
import type {
  DynamikJustering,
  DynamikLagerSvar,
  ModulAktivering,
  PartialtResultat,
  ViktProfilId,
} from "@/lib/akm2/typer";

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
  { id: "V19", name: "Kassatäckning — nyemissionsrisk", category: "Risk", slug: "v19-kapitalforbranning", weight: "KRITISK", kalla: "Balansräkningen: Kassa & bank + Kassaflödesanalysen: 'Kassaflöde från den löpande verksamheten' — räcker kassan så bolaget slipper nyemission? Kontrollera även nyemissionshistorik i förvaltningsberättelsen" },
  { id: "V20", name: "Återköp av egna aktier", category: "Kapitalstruktur", slug: "v20-aterekop-egna-aktier", weight: "6%", kalla: "Bolagets not om återköp av egna aktier (börsen/finanskalender); insiderköp (VD/styrelse, Finansinspektionen) noteras som kompletterande observation" },
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
  if (total >= 40) return { rec: "FÖRSIKTIGT KÖP", tier: "MEDEL", farg: GULD_TEXT };
  if (total >= 25) return { rec: "MINSKA", tier: "SVAG-MEDL", farg: "text-orange-700" };
  return { rec: "SÄLJ", tier: "SVAG", farg: "text-red-700" };
}

// ── Numeriska beräknare: fält → mått → poäng enligt pedagogiska trösklar ────

/**
 * Mörkare guldton för löptext/etiketter — text-gold (#a8862a) ger bara ~3:1
 * kontrast mot cream-bakgrund och håller inte WCAG för brödtext.
 * I mörkt läge är --gold (#c9a84c) ljus nog som den är.
 */
const GULD_TEXT = "text-[#7a5f18] dark:text-gold";

// ── AKM2-läge (STYRELSE-mega-integration M2, VÅG 57) ─────────────────────────
// Kärnan (src/lib/akm2/ — ren TS) körs HELT på klienten, ingen API-route.
// AKM1-läget är oförändrat: med neutrala AKM2-val (inga moduler, profilen
// "akm1-klassisk", dynamik av) är kompositen exakt din AKM1-summa — det är
// projektionsinvarianten (data/forskning/AKM2-BESLUT.md §0), kärnans garanti.

/** UI-id:n för modulregistret (ordningen kopplad till MODULER i akm2/moduler/index.ts). */
const MODUL_IDN: readonly string[] = ["saas", "bank", "cyklisk", "tillgangstung", "tillvaxt", "allman"];
const modulIdFor = (m: BranschModul): string => MODUL_IDN[MODULER.indexOf(m)] ?? m.namn;

/** Branschnycklar (å-fria) → svenska etiketter för väljaren. */
const BRANSCH_NAMN: Record<Bransch, string> = {
  teknik: "Teknik", industri: "Industri", halso: "Hälsa", konsument: "Konsument",
  fastighet: "Fastighet", finans: "Finans", material: "Material", energi: "Energi",
  kommunikation: "Kommunikation", tillvaxt: "Tillväxt",
};

/** Fast övningsdatum — determinism (kärnan läser aldrig klockan); visas ej som data. */
const KALKYL_DATUM = "2026-09-04";

/**
 * Skugga-nyckeltal för kalkylatorläget: ALL nyckeltalsdata null — dina egna
 * poäng är enda underlaget (raknaAKM2-opt "akm1Manuell": människans poäng är
 * fattade beslut, inga automatiska osatt-omfördelningar). Hårda porten
 * (BESLUT §5) följer DATA (stabilitet.kassaManaderBurnRate) — med null-data
 * utlöses den ALDRIG här: modellen gissar aldrig.
 */
function skuggaNyckeltal(bransch: Bransch): BolagsNyckeltal {
  return {
    ticker: "KALKYLATORN",
    namn: "Kalkylatorövning",
    bransch,
    land: "Sverige",
    valuta: "SEK",
    kallor: [],
    hamtat: KALKYL_DATUM,
    pris: null,
    marknadsKapitalMdr: null,
    tillvaxt: { omsattningCAGR5ar: null, resultatCAGR5ar: null, omsattningTillvaxtTTM: null, prognosTillvaxt: null },
    lonksamhet: { roe: null, roic: null, bruttoMarginal: null, ebitMarginal: null, nettoMarginal: null, fcfMarginal: null },
    stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
    vardering: { pe: null, pb: null, evEbit: null, peg: null, fcfYield: null, egenKapitalMultipl: null },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    notering: "Kalkylatorövning — inga nyckeltal inlästa; varje poäng är användarens egen bedömning.",
  };
}

type DynamikLage = "av" | "medriktning" | "motriktning";

/**
 * Injicerad dynamikfunktion (lager 3) för kalkylatorläget. Kalkylatorn har
 * ingen vågdata — läget är en manuell ÖVNING där du öppnar konfluensporten:
 * ±1 poängsteg per satt variabel (kärnan rundar effektiv poäng till heltal;
 * Φ-tabellens ±0,2 skulle avrundas bort på hela poäng). Taket ±10 vaktas i
 * kärnan — fundamentalbilden kan aldrig vändas.
 */
function kalkylatorDynamik(lage: DynamikLage): (r: PartialtResultat) => DynamikLagerSvar {
  const steg = lage === "medriktning" ? 1 : -1;
  return (r) => {
    const perVariabel: Record<string, DynamikJustering> = {};
    for (const v of Object.keys({ ...r.lager1.poang, ...r.lager2.poang })) {
      perVariabel[v] = {
        variabel: v,
        riktning: steg > 0 ? "forbattras" : "forsvamras",
        justering: steg,
        port: "oppen",
        motivering:
          steg > 0
            ? "Medriktning (övning): du bedömer att den fundamentala vågbilden bekräftar poängen — +1 poängsteg per satt variabel."
            : "Motriktning (övning): du bedömer att den fundamentala vågbilden motsäger poängen — −1 poängsteg per satt variabel.",
      };
    }
    return {
      ticker: r.ticker,
      perVariabel,
      perHorisont: { mikro: "osatt", kort: "osatt", medellang: "osatt", lang: "osatt", mega: "osatt" },
      konfluens: {
        raknadeTeorier: 5,
        sammaRiktning: 5,
        port: "oppen",
        text: steg > 0
          ? "Kalkylatorövning: konfluensporten öppnad manuellt i medriktning — fundamentalbilden förstärks, aldrig vänds (dynamiktak ±10)."
          : "Kalkylatorövning: konfluensporten öppnad manuellt i motriktning — fundamentalbilden dämpas, aldrig vänds (dynamiktak ±10).",
      },
      horisontVikter: { mikro: 0.05, kort: 0.2, medellang: 0.25, lang: 0.3, mega: 0.2 },
      datum: r.datum,
    };
  };
}

/** "5" → "5" · "5.6" → "+5,6" · "-2" → "−2" (typografiskt minus i löptext). */
function foran(n: number, decimaler = 0): string {
  const v = Number(n.toFixed(decimaler));
  const s = v.toFixed(decimaler).replace(".", ",");
  return v > 0 ? `+${s}` : s.replace("-", "−");
}

type Raknare = {
  id: string;
  namn: string;
  falt: Array<{ key: string; label: string; enhet?: string; placeholder: string }>;
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
      { key: "oms_iar", label: "Nettoomsättning i år", enhet: "MSEK", placeholder: "t.ex. 1200 (i år)" },
      { key: "oms_far", label: "Nettoomsättning förra året", enhet: "MSEK", placeholder: "t.ex. 1000 (förra året)" },
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
      { key: "bv", label: "Börsvärde", enhet: "MSEK", placeholder: "t.ex. 6000" },
      { key: "oms", label: "Nettoomsättning (senaste 12 mån)", enhet: "MSEK", placeholder: "t.ex. 3000 (rullande 12 mån)" },
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
      { key: "bv", label: "Börsvärde", enhet: "MSEK", placeholder: "t.ex. 6000" },
      { key: "ek", label: "Eget kapital", enhet: "MSEK", placeholder: "t.ex. 4000" },
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
      { key: "bv", label: "Börsvärde", enhet: "MSEK", placeholder: "t.ex. 6000" },
      { key: "skuld", label: "Räntebärande skulder", enhet: "MSEK", placeholder: "t.ex. 1500" },
      { key: "kassa", label: "Kassa & bank", enhet: "MSEK", placeholder: "t.ex. 500" },
      { key: "ebitda", label: "EBITDA (rullande 12 mån)", enhet: "MSEK", placeholder: "t.ex. 1000" },
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
      { key: "oms", label: "Nettoomsättning", enhet: "MSEK", placeholder: "t.ex. 1000" },
      { key: "rkost", label: "Rörelsens kostnader (exkl. avskr.)", enhet: "MSEK", placeholder: "t.ex. 550" },
    ],
    formula: "(Omsättning − Rörelsens kostnader) ÷ Omsättning × 100 %",
    kalla: "Resultaträkningen: 'Rörelsens kostnader' (vissa bolag redovisar bruttovinst direkt — använd den isåfall). OBS: vissa bolag inkluderar personalkostnader — jämför med 5-års historik.",
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
      { key: "ebitda", label: "EBITDA", enhet: "MSEK", placeholder: "t.ex. 180" },
      { key: "oms", label: "Nettoomsättning", enhet: "MSEK", placeholder: "t.ex. 1000" },
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
      { key: "res", label: "Resultat efter skatt", enhet: "MSEK", placeholder: "t.ex. 250" },
      { key: "ek_start", label: "Eget kapital, årets början", enhet: "MSEK", placeholder: "t.ex. 1100" },
      { key: "ek_slut", label: "Eget kapital, årets slut", enhet: "MSEK", placeholder: "t.ex. 1400" },
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
      { key: "skulder", label: "Skulder och övriga förpliktelser", enhet: "MSEK", placeholder: "t.ex. 1500" },
      { key: "ek", label: "Eget kapital", enhet: "MSEK", placeholder: "t.ex. 4000" },
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
    namn: "V19 · Kassatäckning — nyemissionsrisk",
    var: "V19",
    falt: [
      { key: "fkf", label: "Kassaflöde från löpande verksamheten", enhet: "MSEK (negativ = förbränning)", placeholder: "t.ex. -60 (minus = förbränning)" },
      { key: "kassa", label: "Kassa & bank", enhet: "MSEK", placeholder: "t.ex. 300" },
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

  // ── AKM2-läge (M2) ──
  const [lage, setLage] = useState<"akm1" | "akm2">("akm1");
  const [flik, setFlik] = useState("rakna");
  const [fas2, setFas2] = useState<boolean | null>(null); // null = före montering (SSR-säkert)
  const [admin, setAdmin] = useState(false);
  const [bransch, setBransch] = useState<Bransch>("teknik");
  const [modulLage, setModulLage] = useState<"auto" | "manuell">("auto");
  const [manuellaModuler, setManuellaModuler] = useState<string[]>([]);
  const [modulPoang, setModulPoang] = useState<Record<string, number>>({});
  const [viktprofilId, setViktprofilId] = useState<ViktProfilId>("akm2-2026");
  const [dynamikLage, setDynamikLage] = useState<DynamikLage>("av");

  useEffect(() => {
    // Samma mönster som Fas2Gate/min-sida: åtkomst avgörs lokalt efter montering
    // (ak1a-member → member_type, eller admin-override ak1a-fas2-override).
    setFas2(harFas2Access());
    setAdmin(arAdmin());
  }, []);

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

  // ── AKM2: aktiva moduler + kompositberäkning (endast i AKM2-läge med åtkomst) ──

  /** Auto: modulregistret matchar bransch (fallback "allmän"); manuell: kryssrutor. */
  const aktivaModuler = useMemo<BranschModul[]>(
    () =>
      modulLage === "auto"
        ? aktivaModulerForBransch(bransch)
        : MODULER.filter((m) => manuellaModuler.includes(modulIdFor(m))),
    [modulLage, bransch, manuellaModuler],
  );

  /** Union av aktiva modulvariabler (V21+, sorterad). */
  const aktivaModulVariabler = useMemo(() => {
    const m = new Set<string>();
    for (const mod of aktivaModuler) for (const v of mod.aktivaV) m.add(v);
    return [...m].sort();
  }, [aktivaModuler]);

  /**
   * Tre körningar av kärnan ger EXAKT komponentredovisning (alla heltal —
   * skillnaderna summerar precis till komposit − AKM1-summan):
   *   R0 utan moduler/dynamik → viktprofilens omviktning av dina 20 poäng
   *   R1 med moduler          → modulpåslag (lager 2)
   *   R2 med dynamik          → dynamikjustering (lager 3, tak ±10)
   */
  const akm2 = useMemo(() => {
    if (lage !== "akm2" || fas2 !== true) return null;
    const k = skuggaNyckeltal(bransch);
    const akm1Manuell: AKM1Bedomning = {
      ticker: k.ticker,
      poang,
      totalt: total,
      perKategori: katMedel,
      motivering: {}, // kalkylatorläget: dina poäng är fattade beslut (R4 §5)
      datum: k.hamtat,
    };
    const aktiveringar: ModulAktivering[] = aktivaModuler.map((m) => ({
      modulId: modulIdFor(m),
      aktiv: true,
      automatisk: modulLage === "auto",
      orsak: m.namn,
      poang: Object.fromEntries(m.aktivaV.map((v) => [v, modulPoang[v] ?? 3])),
    }));
    const R0 = raknaAKM2(k, { akm1Manuell, moduler: [], viktprofil: viktprofilId });
    const R1 = raknaAKM2(k, { akm1Manuell, moduler: aktiveringar, viktprofil: viktprofilId });
    const R2 =
      dynamikLage === "av"
        ? R1
        : raknaAKM2(k, {
            akm1Manuell,
            moduler: aktiveringar,
            viktprofil: viktprofilId,
            dynamik: kalkylatorDynamik(dynamikLage),
          });
    const forklaring = forklaraPoang(R2);
    const modulRader = aktivaModuler.map((m) => ({
      modul: m,
      id: modulIdFor(m),
      rader: m.aktivaV.map((v) => ({
        v,
        namn: VARIABEL_META[v]?.namn ?? v,
        poang: modulPoang[v] ?? 3,
      })),
    }));
    // Modulvariablernas viktade andel AV kompositen (union — delade variabler
    // som V22 räknas EN gång; detta är andel, inte ökning vs utan moduler).
    const modulAndel = aktivaModulVariabler.reduce((s, v) => {
      return s + (forklaring.rader.find((r) => r.variabel === v)?.bidrag ?? 0);
    }, 0);
    return {
      R0,
      R2,
      modulRader,
      modulAndel,
      viktEffekt: R0.komposit - total,
      modulPaslag: R1.komposit - R0.komposit,
      dynamikJustering: R2.komposit - R1.komposit,
      skillnad: R2.komposit - total,
    };
  }, [lage, fas2, bransch, poang, total, katMedel, aktivaModuler, modulLage, modulPoang, viktprofilId, dynamikLage]);

  const vaxlaModul = (id: string) => {
    setManuellaModuler((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  /** Växla modulläge — vid byte till manuell förhandsfylls kryssrutorna med autosvaret. */
  const valjModulLage = (nytt: "auto" | "manuell") => {
    setModulLage(nytt);
    if (nytt === "manuell") setManuellaModuler(aktivaModulerForBransch(bransch).map(modulIdFor));
  };

  /** Växla modelläge — AKM2-fliken existerar bara i AKM2-läget (styrd Tabs). */
  const valjLage = (nytt: "akm1" | "akm2") => {
    setLage(nytt);
    if (nytt === "akm1") setFlik("rakna");
  };

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
    <div>
      {/* LÄGESVÄXEL — AKM1 (gratis, oförändrat) / AKM2 (Fas 2 + Forskning Plus) */}
      <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Modelläge: AKM1 eller AKM2">
        <button
          type="button"
          aria-pressed={lage === "akm1"}
          onClick={() => valjLage("akm1")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            lage === "akm1"
              ? "border-gold bg-gold/15 text-foreground"
              : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
          }`}
        >
          AKM1 — klassisk summa
        </button>
        <button
          type="button"
          aria-pressed={lage === "akm2"}
          onClick={() => valjLage("akm2")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            lage === "akm2"
              ? "border-gold bg-gold/15 text-foreground"
              : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
          }`}
        >
          AKM2 — moduler & vikter {fas2 === false && <span aria-hidden>🔒</span>}
        </button>
        <p className="w-full text-xs leading-relaxed text-muted-foreground sm:w-auto sm:flex-1">
          {lage === "akm1"
            ? "AKM1: dina 20 poäng, rak summa 0–100 — gratis och oförändrat."
            : fas2 === true
              ? "AKM2: samma poäng + branschmoduler, forskningsvikter och dynamik (Fas 2)."
              : "AKM2 ingår i Fas 2 + Forskning Plus — AKM1-läget förblir gratis."}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        {lage === "akm2" && fas2 !== true ? (
          /* ── LÅST: AKM2 kräver Fas 2+ — en inbjudan vidare, aldrig ett stopp ── */
          <section
            className="marin-panel relative overflow-hidden rounded-3xl border-2 border-gold/50 p-6 text-center shadow-xl sm:p-10"
            aria-label="AKM2 — inbjudan vidare"
          >
            <p className="text-5xl" aria-hidden>
              🔒
            </p>
            <h2 className="mt-4 font-serif text-2xl font-bold leading-tight text-[#EDE6D6] sm:text-3xl">
              AKM2 — den dynamiska modellen
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#EDE6D6]/75">
              Ingår i Fas 2 + Forskning Plus-prenumerationen. AKM2 lägger
              branschmoduler (V21+), forskningsvikter och vågdynamik ovanpå samma
              20 poäng du redan satt — två avläsningar av samma bolag, med exakt
              redovisning av varje komponent. Välkommen vidare när du är redo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/medlemskap#fas2"
                className="btn-guld-signatur inline-block px-8 py-3.5 text-sm"
              >
                Se Fas 2 →
              </Link>
              <Link href="/prenumeration" className="btn-marin px-6 py-3 text-sm">
                Prenumerationer →
              </Link>
            </div>
            <p className="mt-6 text-xs text-[#EDE6D6]/70">
              AKM1-läget förblir gratis — alltid. Byt tillbaka med växeln ovan.
            </p>
            {admin && (
              <div className="mt-6 border-t border-[#E8C766]/20 pt-5">
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-marin"
                  onClick={() => {
                    aktiveraFas2Override(); // öppnar båda faserna lokalt (granskning/test)
                    setFas2(true);
                  }}
                  title="Sätter ak1a-fas2-override=true i localStorage"
                >
                  Lås upp (admin)
                </Button>
              </div>
            )}
          </section>
        ) : (
        <Tabs value={flik} onValueChange={setFlik}>
          {/* Mobil: fullbredds vertikal stack (ingen överlappning/overflow) —
              desktop (sm:): horisontell rad med flex-wrap. Ingen absolut positionering. */}
          <TabsList className="flex h-auto w-full flex-col items-stretch justify-start gap-1 p-1 sm:inline-flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
            <TabsTrigger
              value="rakna"
              className="h-auto w-full flex-none justify-start whitespace-normal border-l-2 border-l-transparent px-3 py-2.5 text-left data-[state=active]:border-l-gold data-[state=active]:bg-gold/15 data-[state=active]:text-foreground dark:data-[state=active]:border-l-gold dark:data-[state=active]:bg-gold/15 sm:w-auto sm:justify-center sm:whitespace-nowrap"
            >
              🧮 Räkna med egna siffror
            </TabsTrigger>
            <TabsTrigger
              value="manuellt"
              className="h-auto w-full flex-none justify-start whitespace-normal border-l-2 border-l-transparent px-3 py-2.5 text-left data-[state=active]:border-l-gold data-[state=active]:bg-gold/15 data-[state=active]:text-foreground dark:data-[state=active]:border-l-gold dark:data-[state=active]:bg-gold/15 sm:w-auto sm:justify-center sm:whitespace-nowrap"
            >
              ⌨️ Poängsätt manuellt
            </TabsTrigger>
            <TabsTrigger
              value="guide"
              data-chat-anker="guide"
              className="h-auto w-full flex-none justify-start whitespace-normal border-l-2 border-l-transparent px-3 py-2.5 text-left data-[state=active]:border-l-gold data-[state=active]:bg-gold/15 data-[state=active]:text-foreground dark:data-[state=active]:border-l-gold dark:data-[state=active]:bg-gold/15 sm:w-auto sm:justify-center sm:whitespace-nowrap"
            >
              📖 Var hittar jag siffrorna?
            </TabsTrigger>
            {lage === "akm2" && (
              <TabsTrigger
                value="akm2"
                className="h-auto w-full flex-none justify-start whitespace-normal border-l-2 border-l-transparent px-3 py-2.5 text-left data-[state=active]:border-l-gold data-[state=active]:bg-gold/15 data-[state=active]:text-foreground dark:data-[state=active]:border-l-gold dark:data-[state=active]:bg-gold/15 sm:w-auto sm:justify-center sm:whitespace-nowrap"
              >
                🧩 AKM2: moduler &amp; vikter
              </TabsTrigger>
            )}
          </TabsList>

          {/* FLIK 1: räkna med egna siffror */}
          <TabsContent value="rakna" className="mt-4 space-y-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Mata in siffror från bolagets årsredovisning eller kvartalsrapport — poängen
              beräknas automatiskt enligt pedagogiska trösklar och läggs in i din
              totalpoäng. Börja med V01 och V09 — de viktigaste.
            </p>
            {RAKNARE.map((r) => {
              const v = siffror[r.id] || {};
              // Komma → punkt, sedan riktiga tal (samma tolerans som tidigare: ogiltiga/0 → NaN/0 → tas om hand av tal()).
              const num = Object.fromEntries(
                Object.entries(v).map(([k, s]) => [k, Number(s.replace(",", "."))])
              );
              const resultat = r.rakna(num);
              return (
                <div key={r.id} className="rounded-xl border border-gold/20 bg-card p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold">{r.namn}</h3>
                    {resultat && (
                      <span className={`rounded-full bg-gold/15 px-3 py-1 text-sm font-bold ${GULD_TEXT}`}>
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
                          placeholder={f.placeholder}
                        />
                      </label>
                    ))}
                  </div>
                  <details className="mt-3">
                    <summary className={`cursor-pointer text-xs font-semibold ${GULD_TEXT}`}>
                      Var hittar jag siffrorna? (klicka för att visa)
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.kalla}</p>
                    <p className="mt-1 text-xs italic text-muted-foreground">💡 {r.exempel}</p>
                  </details>
                  {resultat && (
                    /* DNA: primär "Använd poäng"-knapp i marin med guldtext */
                    <Button
                      size="sm"
                      variant="outline"
                      className="btn-marin mt-3"
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
              V20 återköp av egna aktier) poängsätter du på fliken "Poängsätt manuellt".
            </p>
          </TabsContent>

          {/* FLIK 2: manuellt */}
          <TabsContent value="manuellt" className="mt-4 space-y-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Alla 20 variabler som reglage — snabbt läge när du redan har en bild av bolaget.
              Varje variabelnamn länkar till hela kursen med förklaring och exempel.
            </p>
            {KATEGORIER.map((kat) => (
              <section key={kat}>
                {/* DNA: rubrikaxel med guld-hårlinje under; koppar-accent på snittet */}
                <h2 className="flex items-baseline gap-2 font-serif text-lg font-bold">
                  {kat}
                  <span className="text-xs font-normal koppar-text">
                    snitt {katMedel[kat].toFixed(1)} / 5
                  </span>
                </h2>
                <div className="hjarlinje mt-1" />
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
                            <span className={`ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase ${GULD_TEXT}`}>
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
          <TabsContent value="guide" className="mt-4 space-y-6">
            <div className="rounded-xl border border-gold/30 bg-card p-6">
              <h3 className="font-serif text-xl font-bold">Kartan över en svensk årsredovisning</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Varje siffra i kalkylatorn finns på en bestämd plats. Så här hittar du dem:
              </p>
              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className={`font-semibold ${GULD_TEXT}`}>1. Konsoliderad resultaträkningen</p>
                  <p className="text-muted-foreground">
                    Nettoomsättning (V01, V04, V07), rörelsens kostnader (V07),
                    rörelseresultat (V06, V08), årets resultat (V09). Föregående år står
                    i kolumnen till vänster.
                  </p>
                </div>
                <div>
                  <p className={`font-semibold ${GULD_TEXT}`}>2. Konsoliderad balansräkningen</p>
                  <p className="text-muted-foreground">
                    Kassa och bank (V06, V19), omsättningstillgångar och kortfristiga
                    skulder (V11), eget kapital (V05, V09, V10), skulder och övriga
                    förpliktelser (V06, V10).
                  </p>
                </div>
                <div>
                  <p className={`font-semibold ${GULD_TEXT}`}>3. Kassaflödesanalysen</p>
                  <p className="text-muted-foreground">
                    Kassaflöde från den löpande verksamheten (V19 — positivt eller
                    negativt?), avskrivningar (V06, V08 — för att räkna fram EBITDA).
                  </p>
                </div>
                <div>
                  <p className={`font-semibold ${GULD_TEXT}`}>4. Förvaltningsberättelsen</p>
                  <p className="text-muted-foreground">
                    ARR och prenumerationsintäkter (V02), kundkoncentration (V03),
                    pipeline och lanseringar (V16), avtal (V17), risker (V18),
                    moat-beskrivning (V13–V15).
                  </p>
                </div>
                <div>
                  <p className={`font-semibold ${GULD_TEXT}`}>5. Noterna (bakom rapporterna)</p>
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
                <li><strong>Rule of thumb:</strong> kvartalet för snabb puls, årsredovisningen för hela poängsättningen.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gold/30 bg-card p-6">
              <h3 className="font-serif text-xl font-bold">Genomgång: Räkna V09 (ROE) steg för steg</h3>
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

          {/* FLIK 4 (endast AKM2-läge): moduler, modulvariabler, vikter, dynamik */}
          {lage === "akm2" && (
            <TabsContent value="akm2" className="mt-4 space-y-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Samma {VARIABLER.length} poäng — två avläsningar. AKM2 lägger moduler
                (lager 2), forskningsvikter (lager 4) och — som övning — dynamik
                (lager 3) ovanpå din AKM1-kärna. Med neutrala val (inga moduler,
                profilen "akm1-klassisk", dynamik av) är kompositen exakt din
                AKM1-summa: projektionsinvarianten är kärnans garanti.
              </p>

              {/* 1 · Modulväljare — auto från bransch eller manuella kryssrutor */}
              <section className="rounded-xl border border-gold/20 bg-card p-5">
                <h3 className="font-serif text-lg font-bold">Moduler — lager 2</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={modulLage === "auto" ? "default" : "outline"}
                    onClick={() => valjModulLage("auto")}
                  >
                    Automatiskt — från bransch
                  </Button>
                  <Button
                    size="sm"
                    variant={modulLage === "manuell" ? "default" : "outline"}
                    onClick={() => valjModulLage("manuell")}
                  >
                    Manuellt — kryssrutor
                  </Button>
                </div>
                {modulLage === "auto" ? (
                  <div className="mt-4 space-y-3">
                    <label className="block text-xs text-muted-foreground">
                      Bolagets bransch
                      <select
                        value={bransch}
                        onChange={(e) => setBransch(e.target.value as Bransch)}
                        className="mt-1 h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm text-foreground"
                      >
                        {BRANSCHER.map((b) => (
                          <option key={b} value={b}>
                            {BRANSCH_NAMN[b]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                      {aktivaModuler.map((m) => (
                        <li key={modulIdFor(m)}>
                          <span className="font-semibold text-foreground">{modulIdFor(m)}</span> — {m.namn}{" "}
                          <span className="font-mono">[{m.aktivaV.join(", ")}]</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs italic text-muted-foreground">
                      Registret matchade {aktivaModuler.length}{" "}
                      {aktivaModuler.length === 1 ? "modul" : "moduler"} mot branschen{" "}
                      {BRANSCH_NAMN[bransch]} — utan branschfamilj faller det tillbaka på
                      "allmän". V29 (insider-ägande) är villkorad och aldrig aktiv.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {MODULER.map((m, i) => (
                      <label
                        key={MODUL_IDN[i]}
                        className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                      >
                        <Checkbox
                          className="mt-0.5"
                          checked={manuellaModuler.includes(MODUL_IDN[i])}
                          onCheckedChange={() => vaxlaModul(MODUL_IDN[i])}
                        />
                        <span>
                          <span className="font-semibold text-foreground">{MODUL_IDN[i]}</span> — {m.namn}{" "}
                          <span className="font-mono">[{m.aktivaV.join(", ")}]</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              {/* 2 · Modulvariabler V21+ — samma hantverk som V01–V20 */}
              <section>
                <h2 className="font-serif text-lg font-bold">
                  Modulvariabler{" "}
                  <span className="text-xs font-normal koppar-text">
                    {KARNA_MODUL_VARIABLER.length} stycken (V21+)
                  </span>
                </h2>
                <div className="hjarlinje mt-1" />
                {aktivaModulVariabler.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Ingen modul aktiv — aktivera en ovan (eller välj bransch) så växer
                    modulvariablerna fram här.
                  </p>
                ) : (
                  <div className="mt-3 space-y-4">
                    {aktivaModulVariabler.map((v) => {
                      const meta = VARIABEL_META[v];
                      return (
                        <div key={v} className="flex items-center gap-4">
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/kurser/${meta?.kursSlug ?? ""}`}
                              className="text-sm font-medium hover:text-gold"
                              title={meta?.kalla}
                            >
                              {v} · {meta?.namn ?? v}
                            </Link>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {meta?.kategori}
                            </p>
                          </div>
                          <Slider
                            value={[modulPoang[v] ?? 3]}
                            min={0}
                            max={5}
                            step={1}
                            onValueChange={([n]) => setModulPoang((p) => ({ ...p, [v]: n }))}
                            className="w-32 shrink-0"
                          />
                          <span className="w-8 shrink-0 text-right font-mono text-sm font-bold">
                            {modulPoang[v] ?? 3}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="mt-3 text-xs italic text-muted-foreground">
                  I en datadriven analys räknas modulvariablerna ur nyckeltalen av
                  modulregistret — här poängsätter du dem själv, samma hantverk som
                  V01–V20. Default 3 = neutralt mittskikt.
                </p>
              </section>

              {/* 3 · Viktprofil — lager 4 */}
              <section>
                <h2 className="font-serif text-lg font-bold">Viktprofil — lager 4</h2>
                <div className="hjarlinje mt-1" />
                <div className="mt-3 space-y-2">
                  {VIKTPROFILER.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={viktprofilId === p.id}
                      onClick={() => setViktprofilId(p.id)}
                      className={`block w-full rounded-xl border p-4 text-left transition-colors ${
                        viktprofilId === p.id
                          ? "border-gold bg-gold/15"
                          : "border-border hover:border-gold/40"
                      }`}
                    >
                      <span className="text-sm font-semibold">{p.namn}</span>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {p.beskrivning.split(". ")[0]}.
                      </p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs italic text-muted-foreground">
                  "akm1-klassisk" är låst — modulpoängen redovisas men väger 0 i den
                  profilen (kärnan noterar detta i resultatet). Byt till "akm2-2026"
                  för modulviktning.
                </p>
              </section>

              {/* 4 · Dynamik — lager 3 (övning) */}
              <section>
                <h2 className="font-serif text-lg font-bold">Vågdynamik — lager 3 (övning)</h2>
                <div className="hjarlinje mt-1" />
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {([
                    { id: "av", label: "Av", beskrivning: "Ren fundamental syntes (default)" },
                    { id: "medriktning", label: "Medriktning +1", beskrivning: "Vågen bekräftar fundamentet" },
                    { id: "motriktning", label: "Motriktning −1", beskrivning: "Vågen motsäger fundamentet" },
                  ] as const).map((alt) => (
                    <button
                      key={alt.id}
                      type="button"
                      aria-pressed={dynamikLage === alt.id}
                      onClick={() => setDynamikLage(alt.id)}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        dynamikLage === alt.id
                          ? "border-gold bg-gold/15"
                          : "border-border hover:border-gold/40"
                      }`}
                    >
                      <span className="text-sm font-semibold">{alt.label}</span>
                      <p className="mt-0.5 text-xs text-muted-foreground">{alt.beskrivning}</p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs italic text-muted-foreground">
                  Dynamiklagret kräver normalt verklig vågdata (Fas 3-ytor). Här öppnar
                  du konfluensporten manuellt för att se hur moduleringen verkar: ±1
                  poängsteg per satt variabel, sammanlagt tak ±{DYNAMIKTAK}{" "}
                  kompositpoäng — den fundamentala bilden kan aldrig vändas.
                </p>
              </section>

              {/* 5 · Porten, källor, disclaimer */}
              <p className="text-xs leading-relaxed text-muted-foreground">
                Hård port (BESLUT §5): kassatäckning under {KASSA_PORT_MANADER} månader
                takar kompositen till max {KASSA_PORT_MAX_KOMPOSIT}/100 — porten följer
                DATA (nyckeltalens kassa/bränning), aldrig poängens ursprung, och
                utlöses aldrig i kalkylatorläget (ingen nyckeltalsdata inläst).
                Källor: data/forskning/AKM2-BESLUT.md · r2-vikter-2026-09-03.md ·
                r4-akm2-arkitektur-2026-09-03.md · modellversion {MODELL_VERSION}.
                Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
              </p>
            </TabsContent>
          )}
        </Tabs>
        )}
      </div>

      {/* Resultatpanel */}
      <aside className="h-fit space-y-4 rounded-xl border border-gold/30 bg-card p-6 lg:sticky lg:top-6">
        {lage === "akm2" && akm2 ? (
          <>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">AKM2-komposit</p>
              <p className="font-serif text-5xl font-bold text-gold">
                {akm2.R2.komposit}
                <span className="text-lg text-muted-foreground"> / 100</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Band: {BAND_TEXT[akm2.R2.band]} · AKM1: {total}/100 · {MODELL_VERSION}
              </p>
            </div>
            <div className="space-y-1.5 rounded-lg border border-gold/30 bg-paper p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Komponenter — varje del redovisas
              </p>
              <div className="flex items-baseline justify-between gap-2">
                <span>Kärna V01–V20 (dina poäng)</span>
                <span className="font-mono font-bold">{total}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span>Viktprofil "{akm2.R2.lager4.viktprofil}"</span>
                <span className="font-mono font-bold">{foran(akm2.viktEffekt)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span>Moduler (lager 2)</span>
                <span className="font-mono font-bold">{foran(akm2.modulPaslag)}</span>
              </div>
              {akm2.modulRader.map((rad) => (
                <p key={rad.id} className="pl-3 text-xs leading-relaxed text-muted-foreground">
                  · {rad.id} ({modulLage === "auto" ? "automatisk" : "manuell"}) —{" "}
                  {rad.rader.map((r) => `${r.v} ${r.poang}p`).join(" · ")}
                </p>
              ))}
              {akm2.modulRader.length > 0 && (
                <p className="pl-3 text-xs leading-relaxed text-muted-foreground">
                  · Modulvariablernas viktade andel av kompositen:{" "}
                  {foran(akm2.modulAndel, 1)} p (andel — inte ökning; kärnvariablernas
                  vikt minskar motsvarande i omfördelande profiler).
                </p>
              )}
              {akm2.R2.lager2.notering && (
                <p className="pl-3 text-xs italic text-muted-foreground">{akm2.R2.lager2.notering}</p>
              )}
              <div className="flex items-baseline justify-between gap-2">
                <span>Dynamik (lager 3)</span>
                <span className="font-mono font-bold">{foran(akm2.dynamikJustering)}</span>
              </div>
              {dynamikLage !== "av" && (
                <p className="pl-3 text-xs leading-relaxed text-muted-foreground">
                  ·{" "}
                  {dynamikLage === "medriktning"
                    ? "Medriktning — vågen bekräftar fundamentet (+1 steg per satt variabel)"
                    : "Motriktning — vågen motsäger fundamentet (−1 steg per satt variabel)"}{" "}
                  · tak ±{DYNAMIKTAK} p
                  {Math.abs(akm2.dynamikJustering) === DYNAMIKTAK ? " — taket nått" : ""}
                </p>
              )}
              {akm2.viktEffekt !== 0 && (
                <p className="pl-3 text-xs italic text-muted-foreground">
                  · Viktprofilen omfördelar dina poäng (t.ex. V06/V07/V19 väger tyngst i
                  "akm2-2026") — se profilerna på AKM2-fliken.
                </p>
              )}
            </div>
            <div className="rounded-lg border border-gold/30 bg-paper p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Skillnad mot AKM1
              </p>
              <p
                className={`mt-1 font-serif text-2xl font-bold ${
                  akm2.skillnad >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {akm2.skillnad === 0 ? "identisk" : `AKM2 ger ${foran(akm2.skillnad)} p`}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {akm2.skillnad === 0
                  ? "Neutrala val — projektionsinvarianten: AKM1 är en projektion av AKM2."
                  : `moduler ${foran(akm2.modulPaslag)}, dynamik ${foran(akm2.dynamikJustering)}${
                      akm2.viktEffekt !== 0 ? `, vikter ${foran(akm2.viktEffekt)}` : ""
                    }`}
              </p>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
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
          {lage === "akm2" && akm2 ? (
            <>
              AKM2-kompositen = Σ(vikt × effektiv poäng × 20) enligt profilen
              "{akm2.R2.lager4.viktprofil}" — pedagogisk forskning, ALDRIG
              investeringsråd (lagen 2007:528).{" "}
              <Link href="/blogg/komplett-guide-svensk-aktieanalys-2026" className="underline hover:text-foreground">
                Läs metoden
              </Link>
              . Bakomliggande forskning: AKM2-BESLUT (§0–§6).
            </>
          ) : (
            <>
              Poäng 0–5 per variabel, summa max 100. Förenklad pedagogisk modell — AK1A:s
              officiella analyser väger in vågtyp, osäkerhet och konfluens.{" "}
              <Link href="/blogg/komplett-guide-svensk-aktieanalys-2026" className="underline hover:text-foreground">
                Läs metoden
              </Link>
              . Pedagogisk finansanalys — inte investeringsråd.
            </>
          )}
        </p>
      </aside>
      </div>
    </div>
  );
}
