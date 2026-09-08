import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ak1a/theme-provider";
import { Ak1aStoreProvider } from "@/components/ak1a/store-provider";
import { organizationJsonLd, websiteJsonLd, SITE_URL } from "@/lib/seo";
import {
  spegelWebsiteJsonLd,
  spegelUtbildningsOrganisationJsonLd,
  type SpegelSprak,
} from "@/lib/spegel-metadata";
import {
  SprakLeverantor,
  SpegelSprakLeverantor,
} from "@/components/ak1a/sprak-leverantor";
import type { SprakId } from "@/lib/sprak";
import {
  LasyChatWidget,
  LasyShortSeller,
  LasyNotisCenter,
  PalettVakt,
} from "@/components/ak1a/lasy-global";
import { PwaRegistrerare } from "@/components/ak1a/pwa-registrerare";
import { TracerMount } from "@/components/ak1a/tracer-mount";
import { CookieConsent } from "@/components/ak1a/cookie-consent";
import { TrafikRapportor } from "@/components/ak1a/trafik-rapportor";
import { typografiKlasser } from "@/lib/typografi";

/**
 * GLOBALT SKAL — VÅG 84 SPIKE (agent V84-SPIKE; STYRELSE-VAG84-PLAN steg 1 +
 * STYRELSE-SPEGLAR-P2 §2 risk 4-6).
 *
 * ⚠️ DÖD KOD — DENNA MODUL IMPORTERAS AV INGEN AKTIV RUTT (kontrakt:
 * 0 imports från src/app vid spikens deploy). Den är det färdiga, typ-
 * kontrollerade skalet som FLYTT-AGENTEN (steg 2, egen våg) klipper in i
 * de tre rot-layouterna. Tills dess: INGEN beteendeförändring — allt som
 * renderas idag går fortfarande genom src/app/layout.tsx, orört.
 *
 * VAD DEN ÄGER (allt som annars skulle skrivas i TRE kopior):
 *   <html lang dir suppressHydrationWarning> + <body> med fontklasserna
 *   (ur @/lib/typografi), StagingBanner + PageViewBeacon (inline-skript i
 *   <body>-toppen — SPEGLAR-P2 risk 4), organisation/website-JSON-LD på
 *   rätt språk, ThemeProvider (defaultTheme light, enableSystem false —
 *   inget pre-paint-temaskript finns, ingen ny flash-risk), språkleverantör
 *   (sv ⇒ SprakLeverantor med MGTM; en/ar ⇒ SpegelSprakLeverantor med
 *   SSR-rätt språk via prop), Ak1aStoreProvider, Toaster, de sex
 *   lazy-globalerna (LasyChatWidget, LasyShortSeller, PwaRegistrerare,
 *   TracerMount, TrafikRapportor, PalettVakt, LasyNotisCenter, CookieConsent)
 *   samt viewport- och metadata-defaults (fabriker nedan).
 *
 * FLYTT-AGENTENS TRE LAYOUTER (steg 2 — hela innehållet per fil):
 *
 *   // src/app/(huvud)/layout.tsx  (ALLT sv + neutralt)
 *   import "@/app/globals.css";
 *   import { GlobaltSkal, huvudMetadata, globaltViewport } from
 *     "@/components/ak1a/globalt-skal";
 *   export const metadata = huvudMetadata();
 *   export const viewport = globaltViewport;
 *   export default function Layout({ children }: { children: React.ReactNode }) {
 *     return <GlobaltSkal lang="sv">{children}</GlobaltSkal>;
 *   }
 *
 *   // src/app/(en)/en/layout.tsx — samma men lang="en",
 *   //   metadata = spegelRotMetadata("en"); (en)/en/**-sidorna oförändrade.
 *   // src/app/(ar)/ar/layout.tsx — lang="ar", spegelRotMetadata("ar").
 *
 *   Därpå: gamla src/app/layout.tsx + en/layout.tsx + ar/layout.tsx raderas
 *   (atomiskt); en/ar-layouternas inline lang/dir-skript blir överflödiga —
 *   SSR-htmlen bär rätt lang/dir — men SpegelSprakLeverantor BESTÅR (SPA-
 *   navigering in/ut ur speglarna; documentElement-skrivningen redundant,
 *   ofarlig; SPEGLAR-P2 risk 5).
 *
 * GRINDAR (steg 3): next build ⇒ EXAKT 906 = 906 förbyggda sidor; SSR-grep
 * /en ⇒ lang="en", /ar ⇒ lang="ar" dir="rtl", sv opåverkad; ingen grupp
 * utan skal (risk 4 — glöms en GlobaltSkal syns det direkt: osynkade
 * menyer/tema); PWA/manifest/viewport per grupp (risk 6).
 */

/** Viewport — identisk i alla tre grupperna (SPEGLAR-P2 risk 6). */
export const globaltViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1321" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/** Metadata-default för (huvud) — KOPIA av src/app/layout.tsx:70-144 (oförändrad). */
export function huvudMetadata(): Metadata {
  return {
    manifest: "/manifest.json",
    // metadataBase (VÅG 1a): relativa og:image-sökvägar slås upp mot SITE_URL.
    metadataBase: new URL(SITE_URL),
    // Start-klustrets hreflang (VÅG 63 O3 #2): sidor med egen metadata
    // (pageMetadata/spegelMetadata) överskuggar detta fält.
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
      title:
        "AK1A Research Lab — Sveriges enda institutionella metodik för privatpersoner",
      description:
        "Djupare än en blogg. Tydligare än en bank. Snabbare än en utbildning. Håll know-how — redovisa generöst.",
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
}

/**
 * Metadata-default för (en)/(ar) — rot-layouternas säkerhetsnät (SPEGLAR-P2
 * risk 3: annars ärvs (huvud):s canonical SITE_URL ⇒ dubbelkanonikaler).
 * SAMTLIGA 13+13 spegel-sidor har idag egen metadata (spegelMetadata/
 * kursSpegelGenerateMetadata/bloggSpegelGenerateMetadata — se
 * data/forskning/V84-METADATA-KARTA.md), så denna default träffar främst
 * FRAMTIDA spegel-sidor + gruppens not-found-gräns. Titlar/beskrivningar =
 * spegel-rotsidornas egna (en|ar)/page.tsx — konsekvent språk.
 */
export function spegelRotMetadata(lang: SpegelSprak): Metadata {
  const url = `${SITE_URL}/${lang}`;
  const titel =
    lang === "en"
      ? "AK1A Research Lab — From Education to Income | Ak1 Apex Nexus"
      : "AK1A Research Lab — من التعلّم إلى الدخل | Ak1 Apex Nexus";
  const beskrivning =
    lang === "en"
      ? "Sweden's only institutional methodology, built for private individuals. Deeper than a blog. Clearer than a bank. Faster than a degree. Educational financial analysis — never investment advice."
      : "المنهجية المؤسسية الوحيدة في السويد، المصمَّمة للأفراد. أعمق من مدونة. أوضح من بنك. أسرع من دورة تعليمية. تحليل مالي تعليمي — وليس نصائح استثمارية أبدًا.";
  return {
    manifest: "/manifest.json",
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        "sv-SE": SITE_URL,
        en: `${SITE_URL}/en`,
        ar: `${SITE_URL}/ar`,
        "x-default": SITE_URL,
      },
    },
    title: titel,
    description: beskrivning,
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
      title: titel,
      description: beskrivning,
      url,
      siteName: "AK1A Research Lab",
      type: "website",
      locale: lang === "en" ? "en_US" : "ar_AR",
      alternateLocale: ["sv_SE"],
      images: [
        {
          url: "/og/start.png",
          width: 1200,
          height: 630,
          alt: "AK1A Research Lab — institutional-grade stock-analysis education",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "AK1A Research Lab",
      description: beskrivning,
      images: [
        {
          url: "/og/start.png",
          alt: "AK1A Research Lab — institutional-grade stock-analysis education",
        },
      ],
    },
  };
}

/** Sidvisnings-beacon: en fire-and-forget per sidladdning (kopia ur layout.tsx). */
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

/** Amber markering på allt utom produktion (kopia ur layout.tsx). */
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

/**
 * Det gemensamma dokument skalet — ropas av alla tre framtida rot-layouterna.
 *
 * lang="sv" ⇒ exakt dagens rot-layout-DOM (SprakLeverantor, svensk JSON-LD,
 *   inget dir-attribut — byte-kompatibel med dagens SSR-html).
 * lang="en" ⇒ <html lang="en" suppressHydrationWarning> + SpegelSprakLeverantor
 *   (SSR-en via prop) + spegel-JSON-LD. Inline-skriptet som dagens en/layout
 *   skriver blir onödigt — SSR bär lang — men är ofarligt kvar tills radering.
 * lang="ar" ⇒ <html lang="ar" dir="rtl" suppressHydrationWarning> + samma
 *   spegelmönster (SPEGLAR-P2 §2 skiss; VAG84-PLAN steg 2).
 */
export function GlobaltSkal({
  lang,
  children,
}: Readonly<{
  lang: SprakId;
  children: React.ReactNode;
}>) {
  const spegel: SpegelSprak | null = lang === "sv" ? null : lang;

  return (
    <html
      lang={lang}
      {...(lang === "ar" ? { dir: "rtl" as const } : {})}
      suppressHydrationWarning
    >
      <body
        className={`${typografiKlasser} antialiased bg-background text-foreground paper-texture`}
      >
        <StagingBanner />
        <PageViewBeacon />
        {spegel === null ? (
          <>
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
          </>
        ) : (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(spegelWebsiteJsonLd(spegel)).replace(
                  /</g,
                  "\\u003c",
                ),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                  spegelUtbildningsOrganisationJsonLd(
                    spegel,
                    spegel === "en"
                      ? "Institutional stock-analysis methodology for private individuals"
                      : "منهجية مؤسسية في تحليل الأسهم للأفراد",
                  ),
                ).replace(/</g, "\\u003c"),
              }}
            />
          </>
        )}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {spegel === null ? (
            /* Originalsidorna: MGTM-beteendet består oförändrat. */
            <SprakLeverantor>
              <Ak1aStoreProvider>
                {children}
                <Toaster />
                {/* VÅG 68 PRESTANDA B (o1 #5): idle/lazy-montering — se
                    src/components/ak1a/lasy-global.tsx. */}
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
          ) : (
            /* Speglarna: SSR-rätt språk från första bytet (våg 81-mönstret,
               fast på rot-layout-nivå — inget inline-skript behövs). */
            <SpegelSprakLeverantor lang={spegel}>
              <Ak1aStoreProvider>
                {children}
                <Toaster />
                <LasyChatWidget />
                <LasyShortSeller />
                <PwaRegistrerare />
                <TracerMount />
                <TrafikRapportor />
                <PalettVakt />
                <LasyNotisCenter />
                <CookieConsent />
              </Ak1aStoreProvider>
            </SpegelSprakLeverantor>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
