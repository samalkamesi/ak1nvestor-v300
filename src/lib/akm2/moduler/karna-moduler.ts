/**
 * AKM2 · LAGER 2 — Kärnmodulerna V21–V28 (AKM2-BESLUT §1, trösklar ur R1 §5).
 *
 * ÄGARE: modul-agenten. Filer i src/lib/akm2/moduler/ ägs av modul-agenten;
 * kärna (karna.ts/typer.ts), dynamik.ts och vikter.ts rörs ALDRIG härifrån.
 *
 * PRINCIPER (BESLUT "Byggregler" + R1):
 *  - En funktion per variabel: (k: BolagsNyckeltal) => VariabelSvar.
 *  - ÄRLIGHET: returnera osatt: true när underlaget saknas — ALDRIG gissa.
 *  - Trösklarna dokumenteras i motiveringen (reproducerbarhet).
 *  - Enbart `import type` från portfolj-forskning/typer.ts (akm2/typer.ts ägs
 *    av kärnagenten och importeras inte förrän kontraktet finns på plats).
 *  - Allt är pedagogisk forskning — ALDRIG investeringsråd.
 *
 * DATAÄRLIGHET LÄGE 2026-09 (BolagsNyckeltal): serier.fcf/omsattning/resultat/
 * egetKapital finns; bruttovinst-, skuld-, kassa- och aktieantalsserier SAKNAS,
 * liksom CFO, totala tillgångar, CapEx och utdelningshistorik. Det gör:
 *  - beräkningsbara idag: V21 (roic-fältet/R1-approx), V22 (fcfYield/fallback),
 *    V24 (rantaTackning + skuld/EBIT-approx), V25 (andelUtestande), V28 (evEbit)
 *  - osatta tills data tillförs: V23, V26, V27 (motiveringen dokumenterar
 *    exakt vilka fält som krävs).
 */

import type { BolagsNyckeltal } from "../../portfolj-forskning/typer";

// ── Kontrakt ────────────────────────────────────────────────────────────────

/** Resultat för en modulvariabel. poang är alltid ett heltal 0–5 (0 när osatt). */
export type VariabelSvar = {
  poang: number;
  motivering: string;
  osatt?: boolean;
};

/** Samtliga kärnmodulvariabler som denna fil beräknar (BESLUT §1). */
export const KARNA_MODUL_VARIABLER: string[] = [
  "V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28",
];

// ── Internhjälp (ej exporterade) ────────────────────────────────────────────

function arTal(x: number | null | undefined): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function sista(serie: number[] | undefined): number | null {
  if (!serie || serie.length === 0) return null;
  const v = serie[serie.length - 1];
  return Number.isFinite(v) ? v : null;
}

function osattSvar(motivering: string): VariabelSvar {
  return { poang: 0, motivering, osatt: true };
}

/** Decimal → svensk procentsträng, t.ex. 0.185 → "18,5 %". */
function proc(x: number, decimaler = 1): string {
  return (x * 100).toFixed(decimaler).replace(".", ",") + " %";
}

/** Formatera tal med svensk decimaltecken (för multiplar/kvoter). */
function tal(x: number, decimaler = 2): string {
  return x.toFixed(decimaler).replace(".", ",");
}

/**
 * Senaste två årens FCF-trend ur serier.fcf.
 * true  = "stabil eller stigande" (senaste ≥ 90 % av föregående år),
 * false = fallande, null = ej kontrollerbar (för få datapunkter).
 */
function fcfTrendStabil(stigande: number[] | undefined): boolean | null {
  if (!stigande || stigande.length < 2) return null;
  const n = stigande[stigande.length - 1];
  const f = stigande[stigande.length - 2];
  return n >= 0.9 * f;
}

// ── V21 · ROIC — Avkastning på investerat kapital (Lönsamhet) ───────────────

/**
 * R1 §5 V21 · Formel: ROIC = NOPAT / investerat kapital (utbildningsnivå 1:
 * EBIT / investerat kapital). Prioritering:
 *  1) lonksamhet.roic (direkt fält) — exakta värdet,
 *  2) R1-approximation med befintliga fält: EBIT = ebitMarginal × senaste
 *     omsättningen; investerat kapital ≈ senaste eget kapital × (1 + skuld/EK).
 *     Kassa kan ej dras av (kassafält saknas i BolagsNyckeltal) vilket ger en
 *     konservativt lägre ROIC — dokumenteras i motiveringen.
 * Trösklar (R1 §5, på ROIC i procent): <0 → 0 · [0,5) → 1 · [5,10) → 2 ·
 * [10,15) → 3 · [15,20) → 4 · ≥20 → 5 (alternativt 3-årig stigande trend —
 * kan ej kontrolleras: ROIC-serie saknas i BolagsNyckeltal).
 */
export function raknaV21ROIC(k: BolagsNyckeltal): VariabelSvar {
  const TROSKEL_TEXT =
    "Trösklar (R1 §5): <0 % → 0 p · 0–5 % → 1 p · 5–10 % → 2 p · 10–15 % → 3 p · " +
    "15–20 % → 4 p · ≥20 % → 5 p (alternativt 3-årig stigande trend — ej kontrollerbar, " +
    "ROIC-serie saknas i BolagsNyckeltal).";

  if (arTal(k.lonksamhet.roic)) {
    const roic = k.lonksamhet.roic * 100;
    const poang = roic < 0 ? 0 : roic < 5 ? 1 : roic < 10 ? 2 : roic < 15 ? 3 : roic < 20 ? 4 : 5;
    return {
      poang,
      motivering:
        `ROIC ${proc(k.lonksamhet.roic)} (källa: lonksamhet.roic). ` +
        `Poäng ${poang}/5. ${TROSKEL_TEXT}`,
    };
  }

  // R1-approximation (nivå 1) via befintliga fält.
  const oms = sista(k.serier?.omsattning);
  const ek = sista(k.serier?.egetKapital);
  const ebitMarginal = k.lonksamhet.ebitMarginal;
  const skuldEk = k.stabilitet.skuldEgenkapital;
  if (arTal(ebitMarginal) && arTal(oms) && oms > 0 && arTal(ek) && ek > 0 && arTal(skuldEk)) {
    const ebit = ebitMarginal * oms;
    const invKap = ek * (1 + skuldEk);
    if (invKap > 0) {
      const roic = (ebit / invKap) * 100;
      const poang =
        roic < 0 ? 0 : roic < 5 ? 1 : roic < 10 ? 2 : roic < 15 ? 3 : roic < 20 ? 4 : 5;
      return {
        poang,
        motivering:
          `ROIC ≈ ${proc(roic / 100)} enligt R1:s förenkling (nivå 1): EBIT ${tal(ebit)} Mdr ` +
          `(ebitMarginal ${proc(ebitMarginal)} × senaste omsättning ${tal(oms)} Mdr) / ` +
          `investerat kapital ${tal(invKap)} Mdr (senaste eget kapital × (1 + skuld/EK ${tal(skuldEk)})). ` +
          `Approximation: NOPAT-skatt och kassaavdrag saknas i BolagsNyckeltal — utan kassaavdrag ` +
          `blir ROIC konservativt lägre. Poäng ${poang}/5. ${TROSKEL_TEXT}`,
      };
    }
  }

  return osattSvar(
    "Osatt: varken lonksamhet.roic eller underlag för R1-approximationen " +
    "(ebitMarginal + senaste omsättning + senaste eget kapital + skuld/EK) är kompletta. " +
    `Formel: NOPAT/investerat kapital (R1 §5). ${TROSKEL_TEXT}`
  );
}

// ── V22 · Fri kassaflödesavkastning (Värdering) ─────────────────────────────

/**
 * R1 §5 V22 · Formel: FCF-avkastning = FCF / börsvärde (R1:s primärformel;
 * EV-varianten för skuldsatta bolag kan ej beräknas — kassa/skuldnivå saknas).
 * Konversion = FCF / nettoresultat (R1:s sanktionerade alternativformel när
 * EBITDA saknas; beräknas som fcfMarginal / nettoMarginal).
 * Trösklar (R1 §5, på FCF-avkastningen): <0 → 0 (1 p om trovärdig vändpunkt,
 * dvs. stigande FCF-serie) · [0,2 %) → 1 · [2,4 %) → 2 · [4,6 %) → 3 ·
 * [6,8 %) → 4 · ≥8 % → 5 men ENDAST om konversion > 50 % OCH stabil/stigande
 * FCF (senaste året ≥ 90 % av föregående); annars 4 p med not.
 */
export function raknaV22FriaKassaflodesavkastning(k: BolagsNyckeltal): VariabelSvar {
  const TROSKEL_TEXT =
    "Trösklar (R1 §5): <0 % → 0 p (1 p vid stigande FCF-serie) · 0–2 % → 1 p · 2–4 % → 2 p · " +
    "4–6 % → 3 p · 6–8 % → 4 p · ≥8 % → 5 p endast med konversion >50 % och stabil/stigande FCF.";

  let avkastning: number | null = null;
  let kalla = "";
  if (arTal(k.vardering.fcfYield)) {
    avkastning = k.vardering.fcfYield;
    kalla = "vardering.fcfYield";
  } else {
    // Fallback: fcfMarginal × senaste omsättning / börsvärde (samma enhet på
    // omsättningsserien och marknadsKapitalMdr krävs — kvoten är enhetslös då).
    const oms = sista(k.serier?.omsattning);
    const fcfM = k.lonksamhet.fcfMarginal;
    const mkap = k.marknadsKapitalMdr;
    if (arTal(fcfM) && arTal(oms) && oms > 0 && arTal(mkap) && mkap > 0) {
      avkastning = (fcfM * oms) / mkap;
      kalla =
        `approximation: fcfMarginal ${proc(fcfM)} × senaste omsättning ${tal(oms)} Mdr / ` +
        `börsvärde ${tal(mkap)} Mdr`;
    }
  }

  if (avkastning === null) {
    return osattSvar(
      "Osatt: vardering.fcfYield saknas och fallbacken kräver fcfMarginal + senaste " +
      "omsättning + marknadsKapitalMdr. Formel: FCF/börsvärde + konversion FCF/nettoresultat. " +
      TROSKEL_TEXT
    );
  }

  if (avkastning < 0) {
    const trend = fcfTrendStabil(k.serier?.fcf);
    if (trend === true) {
      return {
        poang: 1,
        motivering:
          `FCF-avkastning ${proc(avkastning)} (källa: ${kalla}). Negativ fri kassaflödesavkastning, ` +
          "men serier.fcf visar stigande trend senaste året — R1:s \"trovärdig vändpunkt\" ger 1 p. " +
          `Poäng 1/5. ${TROSKEL_TEXT}`,
      };
    }
    return {
      poang: 0,
      motivering:
        `FCF-avkastning ${proc(avkastning)} (källa: ${kalla}). Negativ FCF utan påvisad ` +
        "vändpunkt i serier.fcf-serien. Poäng 0/5. " + TROSKEL_TEXT,
    };
  }

  const poang = avkastning < 0.02 ? 1 : avkastning < 0.04 ? 2 : avkastning < 0.06 ? 3 : avkastning < 0.08 ? 4 : 5;
  if (poang < 5) {
    return {
      poang,
      motivering:
        `FCF-avkastning ${proc(avkastning)} (källa: ${kalla}). Poäng ${poang}/5. ${TROSKEL_TEXT}`,
    };
  }

  // Kandidat för 5 p — kontrollera R1:s tillägskrav.
  const not: string[] = [];
  let konversion: number | null = null;
  if (arTal(k.lonksamhet.fcfMarginal) && arTal(k.lonksamhet.nettoMarginal) && k.lonksamhet.nettoMarginal > 0) {
    konversion = k.lonksamhet.fcfMarginal / k.lonksamhet.nettoMarginal;
  } else {
    not.push("konversion ej kontrollerbar (fcfMarginal/nettoMarginal saknas)");
  }
  const trend = fcfTrendStabil(k.serier?.fcf);
  if (trend !== true) {
    not.push(trend === false ? "FCF-serien faller" : "FCF-trend ej kontrollerbar (för få datapunkter)");
  }

  if (konversion !== null && konversion > 0.5 && trend === true) {
    return {
      poang: 5,
      motivering:
        `FCF-avkastning ${proc(avkastning)} (källa: ${kalla}) med konversion ` +
        `${proc(konversion)} (FCF/nettoresultat >50 %) och stabil/stigande FCF-serie — ` +
        `alla krav för 5 p uppfyllda. ${TROSKEL_TEXT}`,
    };
  }
  return {
    poang: 4,
    motivering:
      `FCF-avkastning ${proc(avkastning)} (källa: ${kalla}) når 5-poängsnivån, men R1:s ` +
      `tilläggskrav ej fullt uppfyllda (${not.join("; ")} eller konversion ${konversion === null ? "okänd" : proc(konversion) + " ≤ 50 %"}) ` +
      `— poäng sätts till 4/5. ${TROSKEL_TEXT}`,
  };
}

// ── V23 · Redovisningskvalitet (Risk/Kvalitet) ──────────────────────────────

/**
 * R1 §5 V23 · Sloan-accruals = (nettoresultat − CFO) / totala tillgångar, med
 * Beneish M-indikatorer (TATA/GMI/DSRI) som flagga och tak.
 * DATAÄRLIGHET: BolagsNyckeltal saknar CFO, totala tillgångar, kundfordringar
 * och bruttovinstserie — Sloan-kärnan kan därför INTE beräknas ärligt idag och
 * funktionen returnerar alltid osatt tills fälten tillförs. GMI-liknande
 * bruttomarginalobservation nämns i motiveringen när data räcker (den ger
 * aldrig poäng — en flagga ensam bär inte variabeln enligt R1).
 * Trösklar (R1 §5, på accruals — lägre är bättre): 5 p: <−5 % · 4 p: −5–0 % ·
 * 3 p: 0–5 % · 2 p: 5–10 % · 1 p: >10 % · 0 p: M-Score-flagg (>−1,78) eller
 * extrem accrual-bild + samtidigt sjunkande bruttomarginal.
 */
export function raknaV23Redovisningskvalitet(k: BolagsNyckeltal): VariabelSvar {
  const observationer: string[] = [];
  if (arTal(k.lonksamhet.bruttoMarginal) && arTal(k.moat.bruttoMarginalMedel5ar)) {
    const nu = k.lonksamhet.bruttoMarginal;
    const medel = k.moat.bruttoMarginalMedel5ar;
    if (nu < medel) {
      observationer.push(
        `GMI-liknande flagga: bruttomarginalen ${proc(nu)} ligger under 5-årsmedlet ${proc(medel)} ` +
        "(Beneish GMI — sjunkande bruttomarginal är ett av M-Scorens delindex)"
      );
    } else {
      observationer.push(
        `Bruttomarginalen ${proc(nu)} ligger i linje med eller över 5-årsmedlet ${proc(medel)} — ingen GMI-flagga`
      );
    }
  }
  const obsText = observationer.length > 0 ? " Observation ur befintliga fält: " + observationer.join("; ") + "." : "";

  return osattSvar(
    "Osatt: Sloan-accruals (nettoresultat − CFO)/totala tillgångar kan inte beräknas — " +
    "BolagsNyckeltal saknar kassaflöde från löpande verksamhet (CFO), totala tillgångar, " +
    "kundfordringar och bruttovinstserie, vilket också omöjliggör Beneish M-delindexen " +
    "(TATA/GMI/DSRI kräver tvååriga balans- och resultaträkningar). Poängsättning sker först " +
    "när dessa fält tillförs — aldrig gissning." +
    " Trösklar (R1 §5, på accruals, lägre = bättre): <−5 % → 5 p · −5–0 % → 4 p · 0–5 % → 3 p · " +
    "5–10 % → 2 p · >10 % → 1 p · 0 p vid M-Score-flagg (>−1,78) eller extrem accrual-bild + " +
    "samtidigt sjunkande bruttomarginal." + obsText
  );
}

// ── V24 · Skuldbetjäningsförmåga (Stabilitet) ───────────────────────────────

/**
 * R1 §5 V24 · Räntetäckning = EBIT/räntekostnad (läses direkt ur
 * stabilitet.rantaTackning, x-gånger) + nettoskuld/EBITDA. Eftersom kassa- och
 * EBITDA-fält saknas approximeras ND/EBITDA med bruttoskuld/EBIT där
 * skuld = skuldEgenkapital × senaste eget kapital och EBIT = ebitMarginal ×
 * senaste omsättning. Utan kassaavdrag ÖVERSKATTAR måttet nettoskulden —
 * dokumenterat (konservativ riktning).
 * Trösklar (R1 §5, kombinerad): 5 p: nettokassa (ej kontrollerbar — kassa
 * saknas) eller täckning >10 · 4 p: 6–10 · 3 p: 4–6 och ND/EBITDA <1,5 ·
 * 2 p: 2–4 och ND/EBITDA 1,5–2,5 · 1 p: täckning 1,5–2 · 0 p: täckning <1,5
 * eller ND/EBITDA >3,5. Härledning där R1:s fack tiger: 2-fack med ND >2,5 → 1 p.
 */
export function raknaV24Skuldbetjaningsformaga(k: BolagsNyckeltal): VariabelSvar {
  const TROSKEL =
    "Trösklar (R1 §5): täckning >10 → 5 p · 6–10 → 4 p · 4–6 → 3 p (kräver ND/EBITDA <1,5) · " +
    "2–4 → 2 p (ND/EBITDA 1,5–2,5) · 1,5–2 → 1 p · <1,5 eller ND/EBITDA >3,5 → 0 p.";

  // ND-approximation (bruttoskuld/EBIT) om underlaget finns.
  let ndApprox: number | null = null;
  let ndText = "ND/EBITDA-kontroll saknas (skuld/EK, eget kapital eller EBIT-finans saknas)";
  const ek = sista(k.serier?.egetKapital);
  const oms = sista(k.serier?.omsattning);
  const skuldEk = k.stabilitet.skuldEgenkapital;
  if (arTal(skuldEk) && arTal(ek) && ek > 0 && arTal(k.lonksamhet.ebitMarginal) && arTal(oms) && oms > 0) {
    const skuld = skuldEk * ek;
    const ebit = k.lonksamhet.ebitMarginal * oms;
    if (ebit > 0) {
      ndApprox = skuld / ebit;
      ndText =
        `ND/EBITDA ≈ bruttoskuld/EBIT = ${tal(skuld)} Mdr / ${tal(ebit)} Mdr = ${tal(ndApprox)} ` +
        "(approximation: kassa och EBITDA saknas i BolagsNyckeltal — utan kassaavdrag " +
        "överskattar måttet nettoskulden, konservativ riktning)";
    }
  }

  const tackning = k.stabilitet.rantaTackning;
  if (!arTal(tackning)) {
    if (ndApprox !== null && ndApprox > 3.5) {
      return {
        poang: 0,
        motivering:
          `Räntetäckning saknas, men ${ndText}. ND-approxen överstiger 3,5 — R1:s 0-poängsvillkor ` +
          "för skuldbetjäningsförmåga uppfylls oavsett täckning. Poäng 0/5. " + TROSKEL,
      };
    }
    return osattSvar(
      `Osatt: stabilitet.rantaTackning saknas och ${ndText.toLowerCase()}. Formel: ` +
      "EBIT/räntekostnad + (räntebärande skuld − kassa)/EBITDA. " + TROSKEL
    );
  }

  let poang = tackning < 1.5 ? 0 : tackning < 2 ? 1 : tackning < 4 ? 2 : tackning < 6 ? 3 : tackning < 10 ? 4 : 5;
  let justering = "";
  if (ndApprox !== null) {
    if (ndApprox > 3.5) {
      poang = 0;
      justering = " ND-approxen >3,5 sätter poängen till 0 enligt R1.";
    } else if (poang === 3 && ndApprox >= 1.5) {
      poang = 2;
      justering = " R1:s 3-poängsfack kräver ND/EBITDA <1,5 — härledning ger 2 p.";
    } else if (poang === 2 && ndApprox > 2.5) {
      poang = 1;
      justering = " 2-poängsfacket spänner ND/EBITDA 1,5–2,5 — härledning ger 1 p.";
    }
  }

  return {
    poang,
    motivering:
      `Räntetäckning ${tal(tackning, 1)}x. ${ndText}.${justering} Poäng ${poang}/5. ` +
      "Nettokassa-fallet (5 p utan täckningskrav) kan ej kontrolleras — kassanivå saknas. " +
      TROSKEL,
  };
}

// ── V25 · Utspädning (Risk/Kapitalstruktur) ────────────────────────────────

/**
 * R1 §5 V25 · Netto-perspektivet: aktieantals-CAGR (minskande antal aktier =
 * positivt). BolagsNyckeltal saknar aktieantalsserie — enda nettoobservationen
 * är aterkop.andelUtestande (procentenheter minskning av aktieantalet, läst
 * som ETT ÅRS nettoförändring; 3-årig CAGR kan ej beräknas — dokumenterat).
 * SBC-intensitet (SBC/omsättning >20 % → tak 2 p) kan ej kontrolleras —
 * stockBasedCompensation saknas i typen; noteras i motiveringen.
 * Trösklar (R1 §5, på netto-CAGR): <0 % → 5 · [0,1) → 4 · [1,2) → 3 ·
 * [2,4) → 2 · [4,7) → 1 · ≥7 % → 0.
 */
export function raknaV25Utspadning(k: BolagsNyckeltal): VariabelSvar {
  const TROSKEL =
    "Trösklar (R1 §5, netto-CAGR på aktieantalet): <0 % → 5 p · 0–1 % → 4 p · 1–2 % → 3 p · " +
    "2–4 % → 2 p · 4–7 % → 1 p · ≥7 % → 0 p (samt tak 2 p om SBC/omsättning >20 % — " +
    "SBC-fält saknas och kontrollen kan ej köras).";

  const minskning = k.aterkop?.andelUtestande;
  if (arTal(minskning)) {
    const nettoCagr = -minskning; // procent per år; minskning 1,5 % → netto −1,5 %
    const poang =
      nettoCagr < 0 ? 5 : nettoCagr < 1 ? 4 : nettoCagr < 2 ? 3 : nettoCagr < 4 ? 2 : nettoCagr < 7 ? 1 : 0;
    return {
      poang,
      motivering:
        `Nettoförändring av aktieantalet ${proc(nettoCagr / 100)} per år (källa: ` +
        "aterkop.andelUtestande, tolkat som procentenheter — EN ÅRS nettoobservation, " +
        "3-årig aktieantals-CAGR kan ej beräknas då aktieantalsserie saknas i BolagsNyckeltal). " +
        `Poäng ${poang}/5. ${TROSKEL}`,
    };
  }

  const emissioner = k.stabilitet.nyemissionerSenaste5ar;
  if (arTal(emissioner) && emissioner > 0) {
    return osattSvar(
      `Osatt med varning: ${emissioner} nyemission(er) senaste 5 åren tyder på utspädning, men ` +
      "magnituden (aktieantals-CAGR) kan ej beräknas — aktieantalsserie och andelUtestande saknas " +
      "i BolagsNyckeltal. Antal emissioner kan ärligt inte mappas mot R1:s CAGR-trösklar. " + TROSKEL
    );
  }

  return osattSvar(
    "Osatt: aktieantalsserie saknas i BolagsNyckeltal och aterkop.andelUtestande är null — " +
    "netto-utspädningen kan inte mätas. " + TROSKEL
  );
}

// ── V26 · Kapitalcykel (Lönsamhet) ──────────────────────────────────────────

/**
 * AKM2-BESLUT §1 V26 · CapEx/omsättning-trend + kapitalomsättningshastighet
 * (omsättning/totala tillgångar). Båda komponenterna är OBERÄKNINGSBARA med
 * dagens BolagsNyckeltal (capitalExpenditures- och totaltillgångs-serier
 * saknas) → alltid osatt; motiveringen dokumenterar kraven. Evidensram:
 * asset growth-forskningen (Cooper–Gulen–Schill 2008; Titman–Wei–Xie 2004) —
 * sjunkande/återhållsam CapEx-intensitet och stigande kapitalomsättning ska
 * premieras när trösklarna kalibreras av viktforskaren.
 */
export function raknaV26Kapitalcykel(_k: BolagsNyckeltal): VariabelSvar {
  return osattSvar(
    "Osatt: kapitalcykeln mäts som CapEx/omsättning-trend samt kapitalomsättningshastigheten " +
    "omsättning/totala tillgångar (AKM2-BESLUT §1) — BolagsNyckeltal saknar CapEx-serie och " +
    "totaltillgångs-serie, varför ingen komponent kan beräknas ärligt. Kräver tillförda fält: " +
    "capex per år och totala tillgångar per år (minst 3 datapunkter för trend). " +
    "Trösklar kalibreras enligt asset growth-evidensen (Cooper m.fl. 2008; Titman m.fl. 2004) " +
    "när data finns — tills dess ges aldrig poäng."
  );
}

// ── V27 · Utdelningskontinuitet (Kapitalstruktur) ───────────────────────────

/**
 * R1 §5 (utdelning) + AKM2-BESLUT §1 V27 · Kontinuitet = antal på varandra
 * följande år utan sänkning/avstående; payout ur FCF-serien (utdelning/FCF).
 * BolagsNyckeltal saknar utdelningshistorik (dividendsPaid/utdelningsserie)
 * → kontinuitet och payout kan INTE beräknas → osatt. FCF-seriens bärkraft
 * nämns som observation när den finns (aldrig poäng).
 * Trösklar (R1 §5): 5 p: ≥10 års kontinuitet och FCF-payout 40–80 % ·
 * 4 p: ≥5 år och payout <90 % · 3 p: betalar utdelning, kort historik, rimlig
 * payout · 2 p: ingen utdelning men stark FCF + återköp · 1 p: ingen utdelning
 * och svag FCF · 0 p: nyligen sänkt/avstått utdelning.
 */
export function raknaV27Utdelningskontinuitet(k: BolagsNyckeltal): VariabelSvar {
  let obs = "";
  const fcf = k.serier?.fcf;
  if (fcf && fcf.length > 0) {
    const positiva = fcf.filter((v) => v > 0).length;
    obs =
      ` Observation ur befintliga fält: serier.fcf visar ${positiva} av ${fcf.length} år med ` +
      "positivt fritt kassaflöde — FCF-serien kan bära en payout-utdelning, men utan " +
      "utdelningsbelopp kan varken payout eller kontinuitet fastställas.";
  }
  return osattSvar(
    "Osatt: utdelningshistorik (utdelning per år eller dividendsPaid) saknas i BolagsNyckeltal " +
    "— kontinuitetsår och payout ur FCF kan ej beräknas. Kontinuitetsår hämtas manuellt ur " +
    "årsredovisningarna enligt R1:s dataplan. Trösklar (R1 §5): ≥10 års kontinuitet + " +
    "FCF-payout 40–80 % → 5 p · ≥5 år och payout <90 % → 4 p · betalar, kort historik → 3 p · " +
    "ingen utdelning men stark FCF + återköp → 2 p · ingen utdelning och svag FCF → 1 p · " +
    "nyligen sänkt/avstått → 0 p." + obs
  );
}

// ── V28 · Earnings yield — EV/EBIT (Värdering) ──────────────────────────────

/**
 * AKM2-BESLUT §1 V28 (R1 spår 15) · Earnings yield = EBIT/EV = 1/(EV/EBIT),
 * läst direkt ur vardering.evEbit. Trösklarna är HÄRLEDDA (R1 ger principen
 * "EV-multiperna bäst" men ingen tabell): de kalibreras så att EV/EBIT ≤10
 * → 5 p och speglar V22:s avkastningstrappa. Negativ EBIT (evEbit ≤ 0) ger
 * 0 p — earnings yield är meningslös utan positiv rörelsvinst.
 * Trösklar: ≥10 % → 5 · [8,10) → 4 · [6,8) → 3 · [4,6) → 2 · [2,4) → 1 · <2 % → 0.
 */
export function raknaV28EarningsYield(k: BolagsNyckeltal): VariabelSvar {
  const TROSKEL =
    "Trösklar (härledda ur R1 spår 15 — ingen tabell i R1; EV/EBIT ≤10 → 5 p): " +
    "≥10 % → 5 p · 8–10 % → 4 p · 6–8 % → 3 p · 4–6 % → 2 p · 2–4 % → 1 p · <2 % → 0 p.";

  const m = k.vardering.evEbit;
  if (!arTal(m)) {
    return osattSvar(
      "Osatt: vardering.evEbit saknas — EBIT/EV kan inte beräknas. Formel: 1/(EV/EBIT). " + TROSKEL
    );
  }
  if (m <= 0) {
    return {
      poang: 0,
      motivering:
        `EV/EBIT ${tal(m)} innebär icke-positiv rörelsvinst — earnings yield saknar mening och ` +
        "variabeln ges 0 p (dokumenterat val: utan positiv EBIT är en låg multipel ingen " +
        "undervärderingssignal). " + TROSKEL,
    };
  }
  const y = 1 / m;
  const poang = y >= 0.1 ? 5 : y >= 0.08 ? 4 : y >= 0.06 ? 3 : y >= 0.04 ? 2 : y >= 0.02 ? 1 : 0;
  return {
    poang,
    motivering:
      `Earnings yield EBIT/EV = ${proc(y)} (1/(EV/EBIT ${tal(m)}), källa: vardering.evEbit). ` +
      `Poäng ${poang}/5. ${TROSKEL}`,
  };
}

// ── Register över kärnfunktionerna (konsumeras av moduler/index.ts) ─────────

/** Karta variabel-ID → beräkningsfunktion (V21–V28, kärnmodulerna). */
export const KARNA_MODUL_FUNKTIONER: Record<string, (k: BolagsNyckeltal) => VariabelSvar> = {
  V21: raknaV21ROIC,
  V22: raknaV22FriaKassaflodesavkastning,
  V23: raknaV23Redovisningskvalitet,
  V24: raknaV24Skuldbetjaningsformaga,
  V25: raknaV25Utspadning,
  V26: raknaV26Kapitalcykel,
  V27: raknaV27Utdelningskontinuitet,
  V28: raknaV28EarningsYield,
};
