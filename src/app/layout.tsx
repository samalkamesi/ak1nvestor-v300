import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ak1a/theme-provider";
import { Ak1aStoreProvider } from "@/components/ak1a/store-provider";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { ChatWidget } from "@/components/ak1a/chat-widget";
import { ShortSeller } from "@/components/ak1a/short-seller";
import { PwaRegistrerare } from "@/components/ak1a/pwa-registrerare";
import { Kommandopalett } from "@/components/ak1a/kommandopalett";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
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
    url: "https://ak1nvestor.com",
    siteName: "AK1A Research Lab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AK1A Research Lab",
    description:
      "Sveriges enda institutionella metodik, byggd för privatpersoner.",
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
        className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground paper-texture`}
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
          <Ak1aStoreProvider>
            {children}
            <Toaster />
            <ChatWidget />
            <ShortSeller />
            <PwaRegistrerare />
            <Kommandopalett />
          </Ak1aStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
