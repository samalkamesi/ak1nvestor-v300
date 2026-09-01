"use client";

/**
 * BADGES — bibliotekets merit-system (gamification-lager).
 *
 * All state lagras lokalt i localStorage under "ak1a-badges" (array av badge-id).
 * Händelsestyrt: komponenter anropar geBadge(id) vid riktiga händelser —
 * geBadge returnerar true ENDAST när badgen är ny, för konfetti-momentet.
 *
 * SSR-säkert: alla läsningar går via typeof window-guards.
 */

import { lasKlaraKurser, lasMedlem, lasStreak, lasXP, nivaFranXP } from "@/lib/member-local";

// ── Typer ───────────────────────────────────────────────────────────────────

export type BadgeKategori = "start" | "kurser" | "streak" | "xp" | "ekosystem";

export type Badge = {
  id: string;
  namn: string;
  ikon: string;
  beskrivning: string;
  kategori: BadgeKategori;
  krav: string;
};

export type BadgeStatus = {
  badge: Badge;
  upplast: boolean;
  /** Läsbar framstegstext, t.ex. "kurser klarade 7/10". */
  framsteg: string;
  /** 0–100 — för progress-bar i panelen. */
  procent: number;
};

// ── Konstanter ──────────────────────────────────────────────────────────────

const NYCKEL = "ak1a-badges";

/** De 4 original-BOKMASTER-kurserna (de första bokkurserna som byggdes). */
export const ORIGINAL_BOKMASTER: readonly string[] = [
  "the-intelligent-investor",
  "mina-basta-investeringar",
  "blue-ocean-strategy",
  "zero-to-one",
];

/** Ekosystemets två flaggskepp. */
export const FLAGGSKEPP: readonly string[] = [
  "akm1-den-kontroversiella-modellen",
  "ak1ts-vaglarans-hierarki",
];

export const KATEGORI_META: Record<BadgeKategori, { etikett: string; ikon: string }> = {
  start: { etikett: "Start", ikon: "🏛️" },
  kurser: { etikett: "Kurser", ikon: "📚" },
  streak: { etikett: "Streak", ikon: "🔥" },
  xp: { etikett: "XP-milstolpar", ikon: "💎" },
  ekosystem: { etikett: "Ekosystem", ikon: "🔬" },
};

// ── Badge-listan (28 meriter i 5 kategorier) ────────────────────────────────

export const BADGER: Badge[] = [
  // START — de första stegen in i labbet
  { id: "forsta-steg", namn: "Första steget", ikon: "🏛️", kategori: "start", krav: "1 inloggning",
    beskrivning: "Dörren till labbet är öppen — du loggade in för första gången." },
  { id: "forsta-quiz-ratt", namn: "Tanken tänd", ikon: "🧠", kategori: "start", krav: "1 rätt quiz-svar",
    beskrivning: "Ditt första rätt besvarade quiz-svar — minnet börjar sätta sig." },
  { id: "forsta-kurs-klar", namn: "Debutanten", ikon: "🥇", kategori: "start", krav: "1 kurs klarad",
    beskrivning: "Första kursen klarad. Grunden till allt som följer är lagd." },
  { id: "forsta-flashcard", namn: "Kortvändaren", ikon: "⚡", kategori: "start", krav: "1 flashcard repeterat",
    beskrivning: "Första flashkortet vänt — glömskekurvan arbetar nu för dig." },
  { id: "forsta-superanalys", namn: "Sikte inställt", ikon: "🎯", kategori: "start", krav: "1 superanalys slutförd",
    beskrivning: "Din första superanalys är slutförd — analysmaskineriet rullar." },

  // KURSER — från grundmur till full kanon
  { id: "kurser-5", namn: "Grundmurad", ikon: "📚", kategori: "kurser", krav: "5 kurser klarade",
    beskrivning: "Fem kurser klarade — muren mot gissningar har börjat resas." },
  { id: "kurser-10", namn: "Studierutinen", ikon: "📚", kategori: "kurser", krav: "10 kurser klarade",
    beskrivning: "Tio kurser klarade. Läsandet har blivit en vana." },
  { id: "kurser-25", namn: "Fackverket", ikon: "📚", kategori: "kurser", krav: "25 kurser klarade",
    beskrivning: "Tjugofem kurser klarade — kunskapsbyggnaden tar form." },
  { id: "kurser-50", namn: "Halvkanon", ikon: "📚", kategori: "kurser", krav: "50 kurser klarade",
    beskrivning: "Femtio kurser klarade — halva biblioteket är genomgånget." },
  { id: "kurser-100", namn: "Hundraguldet", ikon: "🏆", kategori: "kurser", krav: "100 kurser klarade",
    beskrivning: "Ett hundratal kurser klarade — kanon behärskad i sin helhet." },
  { id: "forsta-bokmaster", namn: "Bokmästare", ikon: "📚", kategori: "kurser", krav: "1 BOKMASTER-kurs klarad",
    beskrivning: "Första BOKMASTER-kursen klarad — en klassiker behärskad, kapitel för kapitel." },
  { id: "kanon-kannaren", namn: "Kanonkännaren", ikon: "🏆", kategori: "kurser", krav: "4 original-BOKMASTER",
    beskrivning: "Alla fyra original-BOKMASTER klarade — kanonens fundament är ditt." },
  { id: "flaggskeppen", namn: "Flaggskeppskapten", ikon: "🏛️", kategori: "kurser", krav: "AKM1 + AK1TS klarade",
    beskrivning: "Båda flaggskeppen klarade: AKM1 och AK1TS våglärans hierarki." },

  // STREAK — daglig närvaro
  { id: "streak-3", namn: "Tänd gnista", ikon: "🔥", kategori: "streak", krav: "3 dagars streak",
    beskrivning: "Tre dagar i rad — kunskap älskar närvaro." },
  { id: "streak-7", namn: "Veckoelden", ikon: "🔥", kategori: "streak", krav: "7 dagars streak",
    beskrivning: "Sju dagar i rad — en hel veckas disciplin." },
  { id: "streak-14", namn: "Dubbelveckan", ikon: "🔥", kategori: "streak", krav: "14 dagars streak",
    beskrivning: "Fjorton dagar i rad. Vanan sitter." },
  { id: "streak-30", namn: "Månadselden", ikon: "🔥", kategori: "streak", krav: "30 dagars streak",
    beskrivning: "Trettio dagar i rad — en hel månads oavbruten närvaro." },
  { id: "streak-100", namn: "Hundra dagars eld", ikon: "🔥", kategori: "streak", krav: "100 dagars streak",
    beskrivning: "Hundra dagar i rad. Detta är sällan skådat." },

  // XP-MILSTOLPAR — nivåer och poäng
  { id: "niva-5", namn: "Kvarts", ikon: "💎", kategori: "xp", krav: "Nivå 5",
    beskrivning: "Nivå 5 uppnådd — det första skimret av verklig förståelse." },
  { id: "niva-10", namn: "Bergkristall", ikon: "💎", kategori: "xp", krav: "Nivå 10",
    beskrivning: "Nivå 10 uppnådd — klarhet börjar synas i dina analyser." },
  { id: "niva-25", namn: "Guldådern", ikon: "💎", kategori: "xp", krav: "Nivå 25",
    beskrivning: "Nivå 25 uppnådd — Fas 2-porten står öppen. Ansök när du är redo." },
  { id: "niva-50", namn: "Diamanten", ikon: "💎", kategori: "xp", krav: "Nivå 50",
    beskrivning: "Nivå 50 uppnådd — halva vägen till toppnivån är tillryggalagd." },
  { id: "xp-1000", namn: "Tusenklubben", ikon: "⚡", kategori: "xp", krav: "1 000 XP",
    beskrivning: "1 000 XP förtjänade — poäng som betyder något." },
  { id: "xp-10000", namn: "Tiotusenklubben", ikon: "⚡", kategori: "xp", krav: "10 000 XP",
    beskrivning: "10 000 XP förtjänade — en studie i uthållighet." },

  // EKOSYSTEM — verktygen i bruk
  { id: "forsta-djupanalys", namn: "Djupdykaren", ikon: "🔬", kategori: "ekosystem", krav: "1 djupanalys körd",
    beskrivning: "Första djupanalysen körd — 5×5×4-matrisen har öppnats." },
  { id: "forsta-vagskattning", namn: "VågLäsaren", ikon: "🎯", kategori: "ekosystem", krav: "1 vågskattning",
    beskrivning: "Första vågskattningen registrerad — tidshorisonterna kartlagda." },
  { id: "certifikat-skapat", namn: "Intyget utfärdat", ikon: "🏆", kategori: "ekosystem", krav: "1 certifikat skapat",
    beskrivning: "Certifikatet har skapats — kompetensen är bestyrkt." },
  { id: "topplista-besokt", namn: "Podieplatsen", ikon: "🥇", kategori: "ekosystem", krav: "1 besök på topplistan",
    beskrivning: "Du har besökt topplistan och sett konkurrensen — platsen är din att ta." },
];

export const BADGE_MAP: Record<string, Badge> = Object.fromEntries(
  BADGER.map((b) => [b.id, b])
);

// ── Läs/skriv mot localStorage ──────────────────────────────────────────────

/** Alla upplåsta badge-id:n. SSR-säker (returnerar [] på servern). */
export function lasBadges(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const rå = localStorage.getItem(NYCKEL);
    if (!rå) return [];
    const lista: unknown = JSON.parse(rå);
    if (!Array.isArray(lista)) return [];
    return lista.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

/**
 * Lås upp en badge. Returnerar true ENDAST om badgen är ny —
 * perfekt för konfetti-momentet: `if (geBadge("kurser-5")) firad!`
 * Okända id:n och redan upplåsta badgar returnerar false.
 */
export function geBadge(id: string): boolean {
  if (typeof window === "undefined") return false;
  const badge = BADGE_MAP[id];
  if (!badge) return false;
  const nuvarande = lasBadges();
  if (nuvarande.includes(id)) return false;
  try {
    localStorage.setItem(NYCKEL, JSON.stringify([...nuvarande, id]));
  } catch {
    /* privat läge m.m. — ignoreras */
  }
  return true;
}

/** Sann om badgen redan är upplåst (bevaknings-vänlig hjälp). */
export function harBadge(id: string): boolean {
  return lasBadges().includes(id);
}

// ── Framstegsberäkning ──────────────────────────────────────────────────────

/** Räkna rätt besvarade quiz-frågor (ak1a-quiz-*-nycklar med värde "1"). */
function raknaQuizRatt(): number {
  if (typeof window === "undefined") return 0;
  try {
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("ak1a-quiz-") && localStorage.getItem(k) === "1") n++;
    }
    return n;
  } catch {
    return 0;
  }
}

/** Räkna repeterade flashcards (spaced repetition-state). */
function raknaRepeteradeKort(): number {
  if (typeof window === "undefined") return 0;
  try {
    const s: unknown = JSON.parse(localStorage.getItem("ak1a-sr-v1") || "{}");
    if (!s || typeof s !== "object") return 0;
    return Object.keys(s as Record<string, unknown>).length;
  } catch {
    return 0;
  }
}

/** Lås framsteg till [0, mal] och ge procent. */
function stapel(nu: number, mal: number): { text: string; procent: number } {
  const n = Math.max(0, Math.min(nu, mal));
  return {
    text: `${n.toLocaleString("sv-SE")}/${mal.toLocaleString("sv-SE")}`,
    procent: mal > 0 ? Math.min(100, Math.round((nu / mal) * 100)) : 0,
  };
}

/**
 * Alla badges med upplåst/låst + live-framsteg hämtat från den lokala
 * inlärningsstatistiken (kurser, XP, nivå, streak, quiz, flashcards).
 */
export function badgeStatus(): BadgeStatus[] {
  const upplasta = new Set(lasBadges());
  const klaraSlugs = lasKlaraKurser();
  const xp = lasXP();

  const kurser = klaraSlugs.length;
  const niva = nivaFranXP(xp);
  const streak = lasStreak().antal;
  const quizRatt = raknaQuizRatt();
  const kort = raknaRepeteradeKort();
  const bokmaster = ORIGINAL_BOKMASTER.filter((s) => klaraSlugs.includes(s)).length;
  const flaggskepp = FLAGGSKEPP.filter((s) => klaraSlugs.includes(s)).length;
  const inloggad = Boolean(lasMedlem());

  return BADGER.map((badge) => {
    const upplast = upplasta.has(badge.id);
    let framsteg = badge.krav;
    let procent = 0;

    switch (badge.id) {
      // START
      case "forsta-steg":
        framsteg = inloggad ? "Inloggad — merit väntar" : "Ej inloggad ännu";
        procent = inloggad ? 100 : 0;
        break;
      case "forsta-quiz-ratt":
        framsteg = `${stapel(quizRatt, 1).text} rätt quiz-svar`;
        procent = stapel(quizRatt, 1).procent;
        break;
      case "forsta-kurs-klar":
        framsteg = `${stapel(kurser, 1).text} kurs klarad`;
        procent = stapel(kurser, 1).procent;
        break;
      case "forsta-flashcard":
        framsteg = `${stapel(kort, 1).text} flashcard repeterat`;
        procent = stapel(kort, 1).procent;
        break;
      case "forsta-superanalys":
        framsteg = "Väntar på din första superanalys";
        procent = 0;
        break;

      // KURSER
      case "kurser-5":
      case "kurser-10":
      case "kurser-25":
      case "kurser-50":
      case "kurser-100": {
        const mal = Number(badge.id.split("-")[1]);
        framsteg = `kurser klarade ${stapel(kurser, mal).text}`;
        procent = stapel(kurser, mal).procent;
        break;
      }
      case "forsta-bokmaster":
        framsteg = `${stapel(bokmaster, 1).text} BOKMASTER-kurs klarad`;
        procent = stapel(bokmaster, 1).procent;
        break;
      case "kanon-kannaren":
        framsteg = `${stapel(bokmaster, 4).text} original-BOKMASTER klarade`;
        procent = stapel(bokmaster, 4).procent;
        break;
      case "flaggskeppen":
        framsteg = `${stapel(flaggskepp, 2).text} flaggskepp klarade`;
        procent = stapel(flaggskepp, 2).procent;
        break;

      // STREAK
      case "streak-3":
      case "streak-7":
      case "streak-14":
      case "streak-30":
      case "streak-100": {
        const mal = Number(badge.id.split("-")[1]);
        framsteg = `${stapel(streak, mal).text} dagar i rad`;
        procent = stapel(streak, mal).procent;
        break;
      }

      // XP-MILSTOLPAR
      case "niva-5":
      case "niva-10":
      case "niva-25":
      case "niva-50": {
        const mal = Number(badge.id.split("-")[1]);
        framsteg = `Nivå ${Math.min(niva, mal)} av ${mal}`;
        procent = stapel(niva, mal).procent;
        break;
      }
      case "xp-1000":
      case "xp-10000": {
        const mal = Number(badge.id.split("-")[1]);
        framsteg = `${stapel(xp, mal).text} XP`;
        procent = stapel(xp, mal).procent;
        break;
      }

      // EKOSYSTEM — rena händelse-badgar
      default:
        framsteg = `Väntar på: ${badge.krav.toLowerCase()}`;
        procent = 0;
        break;
    }

    return { badge, upplast, framsteg, procent };
  });
}
