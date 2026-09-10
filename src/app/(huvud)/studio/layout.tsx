import type { ReactNode } from "react";
import type { Viewport } from "next";

import { globaltViewport } from "@/components/ak1a/globalt-skal";

/**
 * STUDIO-LAYOUT (VÅG 87 H4 1 — MOBIL-POLISH / SAFE-AREA).
 *
 * Äger /studio:s viewport med viewport-fit=cover: env(safe-area-inset-*)
 * får då värden på iPhone-notch/hem-rad, vilket studions CSS-hjälpare
 * (.studio-safe-top på headern, .studio-safe-bottom på composern — se
 * globals.css "VÅG 87 H3+H4") använder för att respektera systemytorna.
 *
 * Varför en EGEN layout och inte page.tsx: studions sida är "use client"
 * (lås-vyn + StudioChat) — segment-config-exporter (viewport/metadata)
 * är endast tillåtna i SERVER-komponenter, och en klientimport av
 * globalt-skal (→ seo.tsx → content.ts → fs) skulle dessutom dra in
 * node-moduler i klientbunten. Server-layouten importerar samma modul
 * som (huvud)-rotlayouten gör — säker väg. Nycklar slås samman per
 * nyckel med förälderns viewport (globaltViewport), endast viewportFit
 * läggs till — inget annat ändras för studion.
 */
export const viewport: Viewport = {
  ...globaltViewport,
  viewportFit: "cover",
};

export default function StudioLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
