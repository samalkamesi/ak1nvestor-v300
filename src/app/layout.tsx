import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ak1a/theme-provider";
import { Ak1aStoreProvider } from "@/components/ak1a/store-provider";
import { organizationJsonLd, websiteJsonLd, SITE_URL } from "@/lib/seo";
// VÅG 68 PRESTANDA B (o1 #5): de fyra tunga globala klientkomponenterna
// (ChatWidget 1 118 r, ShortSeller 804 r, Kommandopaletten, NotisCenter)
// monteras via lazy/idle-wrappern — funktionaliteten är identisk, bara
// NÄR/HUR koden laddas har ändrats. CookieConsent lämnas orörd (kräver
// omedelbar synlighet), liksom PwaRegistrerare/TracerMount/TrafikRapportor.
import {
  LasyChatWidget,
  LasyShortSeller,
  LasyNotisCenter,
  PalettVakt,
} from "@/components/ak1a/lasy-global";
import { PwaRegistrerare } from "@/components/ak1a/pwa-registrerare";
import { TracerMount } from "@/components/ak1a/tracer-mount";
import { CookieConsent } from "@/components/ak1a/cookie-consent";
import { SprakLeverantor } from "@/components/ak1a/sprak-leverantor";
import { TrafikRapportor } from "@/components/ak1a/trafik-rapportor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// VÅG 68 PRESTANDA B (o1 #9): Source Serif delas i två instanser — normal
// (400/600/700) preloadas; italic lämnas ur preload-listan (hämtas on demand
// med display:swap när serif-kursiv löptext renderas — citat/blockquote på
// manifest/speglar/medlemskap ligger sällan ovanför fold). Eftersom Google
// tjänar variabla woff2-filer är filunderlaget oförändrat: RIKTIG italic
// behålls för alla vikter, bara preloaden (−50 kB kritisk bandbredd) försvinner.
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal"],
});

const sourceSerifKursiv = Source_Serif_4({
  variable: "--font-serif-kursiv",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["italic"],
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1321" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  // metadataBase (VÅG 1a): relativa og:image-sökvägar (t.ex. /og/start.png)
  // slås upp mot SITE_URL — aldrig hårdkodad domän (AC2).
  metadataBase: new URL(SITE_URL),
  // Start-klustrets hreflang (VÅG 63 O3 #2): ömsesidighet med /en- och
  // /ar-speglarna — layouten deklarerar start-tratten; sidor med egen
  // metadata (via pageMetadata/spegelMetadata) överskuggar detta fält.
  alternates: {
    canonical: SITE_URL,
    languages: {
      "sv-SE": SITE_URL,
      en: `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
      "x-default": SITE_URL,
    },
  },
  title: "AK1A Research Lab — Från utbildning till inkomst | Ak1 Apex Nexus",
  description:
    "Sveriges enda institutionella metodik, byggd för privatpersoner. Djupare än en blogg. Tydligare än en bank. Snabbare än en utbildning. Pedagogisk finansanalys — inte investeringsråd.",
  keywords: [
    "AK1A Research Lab",
    "AKM1",
    "AK1TS",
    "institutionell analys",
    "aktieanalys",
    "Precise Biometrics",
    "pedagogisk finansanalys",
    "svenska aktier",
    "retail investerare",
  ],
  authors: [{ name: "Ak1 Apex Nexus" }],
  icons: {
    icon: "/ak1a/favicon.svg",
    apple: "/ak1a/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AK1A Research Lab",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "AK1A Research Lab — Sveriges enda institutionella metodik för privatpersoner",
    description:
      "Djupare än en blogg. Tydligare än en bank. Snabbare än en utbildning. Håll know-how — redovisa generöst.",
    // VÅG 1a bugg-fix: url var hårdkodad ägardomän och avvek från SITE_URL
    // (lab-undersajten) — kanonisk URL nu importeras ur seo.tsx (AC2).
    url: SITE_URL,
    siteName: "AK1A Research Lab",
    type: "website",
    images: [
      {
        url: "/og/start.png",
        width: 1200,
        height: 630,
        alt: "AK1A Research Lab — institutionell aktieanalysutbildning byggd för privatpersoner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AK1A Research Lab",
    description:
      "Sveriges enda institutionella metodik, byggd för privatpersoner.",
    images: [
      {
        url: "/og/start.png",
        alt: "AK1A Research Lab — institutionell aktieanalysutbildning byggd för privatpersoner",
      },
    ],
  },
};

/** Sidvisnings-beacon: en fire-and-forget per sidladdning (alla sidor inkl SPA). */
function PageViewBeacon() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(${(function () {
          try {
            var hk = "ak1a-senaste";
            var hist: any[] = [];
            try { hist = JSON.parse(localStorage.getItem(hk) || "[]"); } catch (e) {}
            hist = hist.filter(function (x) { return x && x.path !== location.pathname; });
            hist.unshift({ path: location.pathname, t: Date.now() });
            try { localStorage.setItem(hk, JSON.stringify(hist.slice(0, 12))); } catch (e) {}
            var k = "ak1a-session";
            var sid = localStorage.getItem(k);
            if (!sid) {
              sid = "s-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
              localStorage.setItem(k, sid);
            }
            var payload = JSON.stringify({
              path: location.pathname,
              sessionId: sid,
              ref: document.referrer ? new URL(document.referrer).pathname : null,
            });
            if (navigator.sendBeacon) {
              navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
            } else {
              fetch("/api/track", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: payload }).catch(function () {});
            }
          } catch (e) {}
        }).toString()})();`,
      }}
    />
  );
}

/** Amber markering på allt utom produktion — omöjligt att förväxla miljöer. */
function StagingBanner() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(${(function () {
          var host = location.hostname;
          if (host === "lab.ak1nvestor.com" || host === "localhost" || host === "127.0.0.1") return;
          var b = document.createElement("div");
          b.textContent = "⚠ TESTMILJÖ (B) — inte produktion · " + host;
          b.style.cssText =
            "background:#b45309;color:#fffdf7;text-align:center;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.08em";
          document.body && document.body.prepend
            ? document.body.prepend(b)
            : document.addEventListener("DOMContentLoaded", function () { document.body.prepend(b); });
        }).toString()})();`,
      }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sourceSerif.variable} ${sourceSerifKursiv.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground paper-texture`}
      >
        <StagingBanner />
        <PageViewBeacon />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd()).replace(/</g, "\\u003c"),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {/* Språk-grunden (fas 1): sv|en|ar klientsidigt — SSR förblir svensk,
              <html lang>+dir sätts vid val; se data/forskning/SPRAK-PLAN.md */}
          <SprakLeverantor>
            <Ak1aStoreProvider>
              {children}
              <Toaster />
              {/* VÅG 68 PRESTANDA B (o1 #5): idle/lazy-montering — se
                  src/components/ak1a/lasy-global.tsx. ⌘K-lyssnaren registreras
                  direkt i PalettVakt; paletten laddas vid första öppningen. */}
              <LasyChatWidget />
              <LasyShortSeller />
              <PwaRegistrerare />
              <TracerMount />
              <TrafikRapportor />
              <PalettVakt />
              <LasyNotisCenter />
              <CookieConsent />
            </Ak1aStoreProvider>
          </SprakLeverantor>
        </ThemeProvider>
      </body>
    </html>
  );
}
