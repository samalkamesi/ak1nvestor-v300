"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SectionId = "hem" | "prec" | "kurser" | "labb" | "styrelse" | "analyser" | "aktier" | "utbildning" | "om-oss";
export type Level = "nyborjare" | "intermediar" | "avancerad";

export interface QuizProgress {
  completedCourses: string[]; // course ids (e.g. "V01")
  xp: number;
  streak: number;
  quizzesPassed: string[];
  flashcardsViewed: string[];
}

interface Ak1aState {
  // navigation
  section: SectionId;
  setSection: (s: SectionId) => void;

  // reading-level depth
  level: Level;
  setLevel: (l: Level) => void;

  // search modal
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // summary drawer
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;

  // share dialog
  shareOpen: boolean;
  setShareOpen: (open: boolean) => void;

  // PREC analysis reading progress (0..29 sections)
  precSection: number;
  setPrecSection: (i: number) => void;

  // Deep course viewer — when set, KURSER shows this course full-page
  kurserDeepSlug: string | null;
  setKurserDeepSlug: (slug: string | null) => void;

  // learning progress (XP / courses / quizzes)
  progress: QuizProgress;
  addXp: (amount: number) => void;
  completeCourse: (id: string) => void;
  passQuiz: (id: string) => void;
  viewFlashcard: (id: string) => void;
  bumpStreak: () => void;

  // theme is handled by next-themes
}

const levelLabels: Record<Level, string> = {
  nyborjare: "Nybörjare",
  intermediar: "Intermediär",
  avancerad: "Avancerad",
};

export const levelLabel = (l: Level) => levelLabels[l];

export const useAk1aStore = create<Ak1aState>()(
  persist(
    (set, get) => ({
      section: "hem",
      setSection: (s) => {
        set({ section: s });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      },

      level: "nyborjare",
      setLevel: (l) => set({ level: l }),

      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      summaryOpen: false,
      setSummaryOpen: (open) => set({ summaryOpen: open }),

      shareOpen: false,
      setShareOpen: (open) => set({ shareOpen: open }),

      precSection: 0,
      setPrecSection: (i) => set({ precSection: i }),

      kurserDeepSlug: null,
      setKurserDeepSlug: (slug) => {
        set({ kurserDeepSlug: slug });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      },

      progress: {
        completedCourses: [],
        xp: 0,
        streak: 0,
        quizzesPassed: [],
        flashcardsViewed: [],
      },
      addXp: (amount) =>
        set((st) => ({ progress: { ...st.progress, xp: st.progress.xp + amount } })),
      completeCourse: (id) =>
        set((st) => ({
          progress: {
            ...st.progress,
            completedCourses: st.progress.completedCourses.includes(id)
              ? st.progress.completedCourses
              : [...st.progress.completedCourses, id],
            xp: st.progress.xp + (st.progress.completedCourses.includes(id) ? 0 : 100),
          },
        })),
      passQuiz: (id) =>
        set((st) => ({
          progress: {
            ...st.progress,
            quizzesPassed: st.progress.quizzesPassed.includes(id)
              ? st.progress.quizzesPassed
              : [...st.progress.quizzesPassed, id],
          },
        })),
      viewFlashcard: (id) =>
        set((st) => ({
          progress: {
            ...st.progress,
            flashcardsViewed: st.progress.flashcardsViewed.includes(id)
              ? st.progress.flashcardsViewed
              : [...st.progress.flashcardsViewed, id],
            xp: st.progress.flashcardsViewed.includes(id)
              ? st.progress.xp
              : st.progress.xp + 20,
          },
        })),
      bumpStreak: () =>
        set((st) => ({ progress: { ...st.progress, streak: st.progress.streak + 1 } })),
    }),
    {
      name: "ak1a-store",
      partialize: (st) => ({ level: st.level, progress: st.progress }),
    }
  )
);
