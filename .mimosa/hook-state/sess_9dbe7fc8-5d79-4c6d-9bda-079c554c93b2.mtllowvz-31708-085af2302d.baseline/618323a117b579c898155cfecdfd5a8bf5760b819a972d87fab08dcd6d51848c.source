/**
 * ASSISTENT-MOTORN (v1) — "den högra handen".
 *
 * Prediktiv intelligens ovanpå KlientKontexten (klientkontext.ts — den
 * enda datakällan): proaktiva förslag (prioriterade, klickbara, max 3 i
 * panelen), en tids- och lägesmedveten hälsning, frustration-detektering
 * (streak bruten + hög aktiv tid + tunn quiz-träff) och elevens optimala
 * studietid ur dygnsrytmen.
 *
 * Ton: PEDAGOGIK_PRINCIPER (pedagogik.ts) — vi hjälper, vi dömer aldrig.
 * Panelen inleder alltid med "Jag tror du vill…" och avslutar med "om jag
 * har fel, berätta gärna": assistenten gissar ödmjukt, eleven väljer
 * alltid själv. Inga "du borde" — bara välkomnande dörrar.
 *
 * SSR-säkert: allt bygger på KlientKontext (localStorage via guards),
 * inga nätanrop, inga sidoeffekter.
 */

import {
  INTRESSE_KURS,
  paborjadKurs,
  toppIntresseUrProfil,
  type KlientKontext,
} from "./klientkontext";
import { raknaKurstips } from "./kurstips";

// ── Typer ───────────────────────────────────────────────────────────────────

/** Ett proaktivt förslag — ett tips, aldrig ett tvång (prioritet = rang). */
export type ProaktivtForslag = {
  rubrik: string;
  text: string;
  ikon: string;
  lank: string;
  prioritet: number;
};

// ── Elevkärnans mål → dörren närmast drömmen ────────────────────────────────

/** MAL_ALTERNATIV (elevkarna.ts) mappat till labbets mest gångbara dörr. */
const MAL_TIPS: Record<string, { rubrik: string; text: string; ikon: string; lank: string }> = {
  "Bli oberoende analytiker": {
    rubrik: "Superanalysen — ditt hantverk i 24 steg",
    text: "Ditt mål är analysens hantverk: Superanalysen väver AKM1 och AK1TS till en komplett egen analys — precis vägen dit du vill.",
    ikon: "🏅",
    lank: "/superanalys",
  },
  "Förstå mina aktier djupare": {
    rubrik: "Dina aktier, djupare",
    text: "Din portfölj väntar på sin djupanalys — öppna Min portfölj och låt ekosystemet (5×5×4) läsa dina innehav tillsammans med dig.",
    ikon: "💼",
    lank: "/min-portfolj",
  },
  "Bygga långsiktig förmögenhet": {
    rubrik: "Från aktie till portfölj",
    text: "Välfärd byggs steg för steg — ekosystem-kursen visar hur enskilda aktier blir en portfölj som bär över tid.",
    ikon: "🧩",
    lank: "/kurser/portfolj-ekosystemet",
  },
  "Byta karriär till finans": {
    rubrik: "Läroplanen som karriärsteg",
    text: "Ditt mål är ett nytt hantverk — läroplanen lägger stegarna i ordning, från grund till BOKMASTER.",
    ikon: "🗺️",
    lank: "/laroplan",
  },
  "Hantera mina pengar klokare": {
    rubrik: "Kalkylatorn — 20 variabler i din hand",
    text: "Klokare beslut börjar i tydliga tal: kalkylatorn gör V01–V20 till ett samtal med verkligheten.",
    ikon: "🧮",
    lank: "/kalkylator",
  },
};

// ── Proaktiva förslag ───────────────────────────────────────────────────────

/**
 * Räkna fram elevens proaktiva förslag — en prioriterad lista ur samma
 * regler som predikteraNastaSteg, plus elevkärnans mål. Sorteras på
 * prioritet (fallande), dedupliceras på länk och kapas till maxAntal.
 * Listan är ALLTID minst ett förslag lång: även en färsk elev får en
 * välkomnande dörr, aldrig en tom panel.
 */
export function raknaProaktivaForslag(k: KlientKontext, maxAntal = 3): ProaktivtForslag[] {
  const forslag: ProaktivtForslag[] = [];
  const lamna = (f: ProaktivtForslag) => {
    if (!forslag.some((x) => x.lank === f.lank)) forslag.push(f);
  };

  // 1 ── Streaken bruten (eller aldrig tänd) → Dagens Pass — högst prioritet.
  if (k.streak <= 0) {
    lamna({
      rubrik: "Tänd dagens kedja",
      text: "Fem minuters pass räcker för att tända streaken igen — närvaron som bygger välfärd, en dag i taget.",
      ikon: "🔥",
      lank: "/dagens-pass",
      prioritet: 100,
    });
  }

  // 2 ── Kurs påbörjad men ej klarad → nästa kapitel.
  const paborjad = paborjadKurs(k);
  if (paborjad) {
    lamna({
      rubrik: `Fortsätt i ${paborjad.titel}`,
      text: "Du stod mitt i resan — nästa kapitel väntar på precis den plats du lämnade.",
      ikon: "📖",
      lank: paborjad.lank,
      prioritet: 90,
    });
  }

  // 3 ── Tunn quiz-träff → repetition (glömskekurvan är normal, inte ett baksteg).
  if (k.quizTraff > 0 && k.quizTraff < 50) {
    lamna({
      rubrik: "Repetera det du redan mött",
      text: `Din träff på quiz är ${k.quizTraff} % — repetition är inte baksteg, det är hur hjärnan bygger. Dagens Pass repetitionerar precis det som vill sätta sig.`,
      ikon: "🔁",
      lank: "/dagens-pass",
      prioritet: 75,
    });
  }

  // 4 ── Intressets topp → flaggskeppet i området (om det inte redan är klarat).
  const topp = toppIntresseUrProfil(k.intresseProfil);
  if (topp) {
    const kurs = INTRESSE_KURS[topp];
    if (kurs && !k.klaraKurser.includes(kurs.slug)) {
      lamna({
        rubrik: `Din nyfikenhet pekar mot ${kurs.omrade}`,
        text: kurs.text,
        ikon: kurs.ikon,
        lank: `/kurser/${kurs.slug}`,
        prioritet: 65,
      });
    }
  }

  // 5 ── Fas 2-redo → nästa kapitel i labbet (när eleven känner sig redo).
  if (k.lasTillstand === "fas2-redo") {
    lamna({
      rubrik: "Fas 2 väntar på din grund",
      text: `Nivå ${k.niva} och ${k.klaraKurser.length} klara kurser — grunden bär vidare. Fas 2 är nästa kapitel, i din takt.`,
      ikon: "🏛️",
      lank: "/fas2-ansok",
      prioritet: 60,
    });
  }

  // 6 ── Elevens mål (ur kärnan) → dörren närmast drömmen.
  const malTips = k.mal ? MAL_TIPS[k.mal] : undefined;
  if (malTips) {
    lamna({ ...malTips, prioritet: 55 });
  }

  // 7 ── Alltid minst en välkomnande dörr: nästa steg i spåret.
  if (forslag.length === 0) {
    const tips = raknaKurstips({ antal: 1 })[0];
    if (tips) {
      lamna({
        rubrik: `Nästa steg: ${tips.titel}`,
        text: tips.varför,
        ikon: tips.ikon,
        lank: `/kurser/${tips.slug}`,
        prioritet: 50,
      });
    } else {
      lamna({
        rubrik: "Biblioteket är öppet — alltid",
        text: "Hela spåret är klarat, en resa att vara stolt över. Välj nästa fördjupning fritt — resan är din.",
        ikon: "🧭",
        lank: "/kurser",
        prioritet: 45,
      });
    }
  }

  return forslag.sort((a, b) => b.prioritet - a.prioritet).slice(0, Math.max(1, maxAntal));
}

// ── Hälsning ────────────────────────────────────────────────────────────────

/**
 * Tids- och lägesmedveten hälsning — samma dygnsrytm som briefing
 * (morgon < 11 · dag · kväll ≥ 17), tonad efter lästillståndet och med
 * elevens namn när det finns. Alltid uppmuntrande, aldrig dömande.
 */
export function genereraHalsning(k: KlientKontext): string {
  const timme = new Date().getHours();
  const halsning = timme < 11 ? "God morgon" : timme >= 17 ? "God kväll" : "God dag";
  const tilltal = k.namn ? `, ${k.namn}` : "";

  switch (k.lasTillstand) {
    case "nybörjare":
      return `${halsning}${tilltal} — varje analytiker börjar med ett första steg, och just ditt väntar här. Välkommen.`;
    case "växande":
      return `${halsning}${tilltal} — ${k.klaraKurser.length} ${
        k.klaraKurser.length === 1 ? "kurs" : "kurser"
      } i ryggen och en rytm som växer för varje besök.`;
    case "avancerad":
      return `${halsning}${tilltal} — ${k.klaraKurser.length} kurser och ${k.quizTraff} % träff på quiz: din grund är djup och bär.`;
    case "fas2-redo":
      return `${halsning}${tilltal} — nivå ${k.niva} och en grund som bär hela vägen: Fas 2 väntar när du känner dig redo.`;
  }
}

// ── Frustration ─────────────────────────────────────────────────────────────

/**
 * Tre samverkande signaler: kedjan bruten + lång närvaro + tunn träff.
 * (quizTraff > 0: en elev som ännu inte mött sina första quiz bär inget
 * misslyckande — hen är bara ny, aldrig frustrerad.)
 * Vid True möts eleven av paus-uppmuntran — ALDRIG tjat om mer plugg.
 */
export function detekteraFrustration(k: KlientKontext): boolean {
  return k.streak <= 0 && k.aktivTid >= 30 && k.quizTraff > 0 && k.quizTraff < 50;
}

// ── Optimal tid ─────────────────────────────────────────────────────────────

/**
 * Elevens finaste studietid ur dygnsrytmen — samma gruppering som
 * tracerns dagrytm: kväll ≥ 18 (natt ≤ 4 räknas hit), morgon 5–9,
 * dag 10–17; majoritetsregel, annars "blandat". Okänd rytm = välkomnande.
 */
export function raknaOptimalTid(k: KlientKontext): string {
  const timmar = k.typiskaTimmar;
  if (timmar.length === 0) {
    return "Din dygnsrytm är ännu okänd — varje besök ritar den tydligare.";
  }
  const kvall = timmar.filter((h) => h >= 18 || h <= 4).length;
  const morgon = timmar.filter((h) => h >= 5 && h <= 9).length;
  const dag = timmar.filter((h) => h >= 10 && h <= 17).length;
  const storst = Math.max(kvall, morgon, dag);
  if (storst === 0) {
    return "Din dygnsrytm är ännu okänd — varje besök ritar den tydligare.";
  }
  if (kvall === storst && kvall > timmar.length / 2) {
    return "Dina kvällar — lugnet efter dagen är din finaste studietimma.";
  }
  if (morgon === storst && morgon > timmar.length / 2) {
    return "Dina morgnar — när sinnet vilar är läsningen som starkast.";
  }
  if (dag === storst && dag > timmar.length / 2) {
    return "Dina dagtimmar — en jämn och klar rytm för djupläsning.";
  }
  return "Din nyfikenhet kommer både morgon och kväll — välj den stund som känns lättast.";
}
