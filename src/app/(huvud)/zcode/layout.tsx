import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { globaltViewport } from "@/components/ak1a/globalt-skal";

/**
 * ZCODE-LAYOUT — en-trycks-ingången till agentchatten (kunddirektivet
 * "komma in med ett tryck", 2026-09-30).
 *
 * Äger /zcode:s viewport med viewport-fit=cover — exakt mönstret från
 * studio-layouten (VÅG 87 H4 1): env(safe-area-inset-*) får värden på
 * telefonens notch/hem-rad, vilket sidans composer/header respekterar
 * via .studio-safe-top/.studio-safe-bottom (globals.css "VÅG 87 H3+H4").
 *
 * Metadata: privat chatsida — ALDRIG indexerad (robotarnas plats är de
 * pedagogiska sidorna, inte kundens egen ingång). absolute-title så
 * rot-layoutens template inte dubbelnamnar.
 */
export const viewport: Viewport = {
  ...globaltViewport,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: { absolute: "ZCode — AK1A" },
  description: "Din privata direktingång till AK1A-agenten.",
  robots: { index: false, follow: false },
};

export default function ZcodeLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
