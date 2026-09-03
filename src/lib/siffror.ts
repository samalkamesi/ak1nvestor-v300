/**
 * SIFFROR — sajtens enda källa för kurs-/bok-/quiz-tal.
 *
 * Importera härifrån och interpolera — ALDRIG hårdkoda tal i copy.
 * Underlaget genereras av `node verktyg/rakna-siffror.mjs` (läser
 * public/deep-courses.json, data/bokkanon.json och src/lib/kurs-access.ts)
 * till data/siffror.json. Kör skriptet efter varje kurstillägg —
 * Kvalitetsvakten kontrollerar konsistensen.
 */
import radata from "../../data/siffror.json";

export interface Siffror {
  kurser: number;
  bokmaster: number;
  quiz: number;
  quizXp: number;
  kanonBocker: number;
  kanonSomKurs: number;
  fas2Kurser: number;
  fas3Kurser: number;
}

const raa = radata as unknown as Siffror & { _kalla?: string; uppdaterad?: string };

export const SIFFROR: Siffror = {
  kurser: raa.kurser,
  bokmaster: raa.bokmaster,
  quiz: raa.quiz,
  quizXp: raa.quizXp,
  kanonBocker: raa.kanonBocker,
  kanonSomKurs: raa.kanonSomKurs,
  fas2Kurser: raa.fas2Kurser,
  fas3Kurser: raa.fas3Kurser,
};

/** "8 211" — svenskt tusentalsavstånd för presentation. */
export const tal = (n: number) => n.toLocaleString("sv-SE");
