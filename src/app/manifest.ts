import type { MetadataRoute } from "next";
import { getCourseList } from "@/lib/content";

/**
 * PWA-MANIFEST — AK1A Research Lab installerbar som app (Android/desktop/iOS).
 * Servas automatiskt på /manifest.webmanifest av Next metadata routes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AK1A Research Lab — Finansutbildning",
    short_name: "AK1A",
    description:
      `${getCourseList().length} kurser, AI-Mentor, kalkylator och portföljsystem — pedagogisk finansanalys enligt AKM1/AK1TS. Fas 1 alltid gratis.`,
    lang: "sv",
    dir: "ltr",
    start_url: "/?kalla=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f5f1e8",
    theme_color: "#a8862a",
    categories: ["education", "finance", "business"],
    icons: [
      {
        src: "/ak1a/ikon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/ak1a/ikon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/ak1a/ikon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Läroplanen",
        short_name: "Läroplan",
        url: "/laroplan",
        description: "5 nivåer till självständig analys",
      },
      {
        name: "Kalkylatorn (AKM1)",
        short_name: "Kalkylator",
        url: "/kalkylator",
        description: "20 fundamentalvariabler",
      },
      {
        name: "Repetera flashcards",
        short_name: "Repetera",
        url: "/?kalla=pwa#repetera",
        description: "Spaced repetition — 140 kort", // Uppdaterad 2026-09-01: 140 kort i data/spaced-repetition.json
      },
    ],
  };
}
