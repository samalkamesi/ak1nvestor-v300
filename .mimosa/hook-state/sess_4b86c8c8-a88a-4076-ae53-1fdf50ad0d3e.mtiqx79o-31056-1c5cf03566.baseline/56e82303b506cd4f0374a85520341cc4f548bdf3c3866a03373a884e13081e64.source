import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * AK1A EKOSYSTEM-KONFIGURATION — central referens för alla agenter.
 * AKM1 = 20 fundamentalvariabler (V01-V20)
 * AK1TS = teknisk analys (5 teorier × 5 horisonter × 4 dimensioner)
 * 5×5×4 = det fullständiga ramverket (100 datapunkter)
 *
 * ALLA agenter (chatbot, shortseller, profilering, quiz) MÅSTE referera
 * till AKM1 och AK1TS — aldrig generiska termer.
 */

export const EKOSYSTEM = {
  modeller: {
    AKM1: {
      namn: "AKM1 — Institutionell Fundamentalmodell",
      variabler: 20,
      beskrivning: "20 fundamentalvariabler (V01-V20) i 7 kategorier",
      kategorier: ["Tillväxt", "Värdering", "Lönsamhet", "Stabilitet", "Moat", "Katalysator", "Risk"],
      poangskala: "0-5 per variabel, max 100",
      anvands: ["kurser", "kalkylator", "portfoljanalys", "quiz", "shortseller"],
    },
    AK1TS: {
      namn: "AK1TS — Teknisk Våganalys",
      teorier: 5,
      horisonter: 5,
      dimensioner: 4,
      beskrivning: "5 teorier × 5 horisonter × 4 dimensioner = 100 datapunkter",
      teoriLista: ["Elliott Wave", "Fibonacci", "GANN", "Lucas", "Volym"],
      horisontLista: ["Mikro", "Kort", "Medellång", "Lång", "Mega"],
      dimensionLista: ["Våg", "Pris", "Tid", "Brytpunkt"],
      anvands: ["djupanalys", "portfolj", "blogg", "utbildning"],
    },
  },
  principer: [
    "Marginal of safety — köp endast med marginal mellan pris och värde",
    "Mr Market — hans humör är din möjlighet, inte din uppmaning",
    "Konfluens — minst 3 av 5 teorier måste peka samma håll",
    "Reproducerbarhet — varje slutsats har en källa",
    "Pedagogisk finansanalys — ALDRIG investeringsråd",
  ],
  rekommendationsskala: ["SÄLJ", "MINSKA", "FÖRSIKTIGT KÖP", "KÖP", "STARKT KÖP"],
};

/** Hämta modell-referens för en agent. */
export function ModellRef(modell: "AKM1" | "AK1TS"): string {
  if (modell === "AKM1") {
    return `AKM1 (20 fundamentalvariabler: V01-V20, 0-5 poäng per variabel, max 100)`;
  }
  return `AK1TS (5 teorier: Elliott/Fibonacci/GANN/Lucas/Volym × 5 horisonter × 4 dimensioner = 100 datapunkter)`;
}

/** Validera att en analys refererar till AKM1/AK1TS. */
export function valideraEkosystemReferens(text: string): boolean {
  return text.includes("AKM1") || text.includes("AK1TS") || text.includes("5×5×4");
}
