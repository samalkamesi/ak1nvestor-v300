import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://lab.ak1nvestor.com"),
  title: {
    default: "AK1A Research Lab — Institutionell metodik för privatpersoner",
    template: "%s | AK1A Research Lab",
  },
  description:
    "Vi ger dig metoden institutionerna använder. Institutionell metodik, öppet redovisad. 99-sidiga analyser där varje siffra är spårbar — 20 variabler, 25 våg-celler, slutsatser verifierbara.",
  keywords: [
    "AK1A Research Lab",
    "AKM1",
    "AK1TS",
    "institutionell analys",
    "aktieanalys",
    "pedagogisk finansanalys",
    "svenska aktier",
    "retail investerare",
    "Precise Biometrics",
    "Volvo Cars",
    "Elliott Wave",
    "Fibonacci",
    "aktieutbildning",
    "investeringsanalys",
  ],
  authors: [{ name: "Ak1 Apex Nexus" }],
  creator: "Ak1 Apex Nexus",
  publisher: "AK1A Research Lab",
  openGraph: {
    title: "AK1A Research Lab — Sveriges enda institutionella metodik för privatpersoner",
    description:
      "Vi ger dig metoden institutionerna använder. Du verifierar själv. Du behåller kognitiv suveränitet.",
    url: "https://lab.ak1nvestor.com",
    siteName: "AK1A Research Lab",
    type: "website",
    locale: "sv_SE",
  },
  twitter: {
    card: "summary_large_image",
    title: "AK1A Research Lab",
    description:
      "Sveriges enda institutionella metodik, byggd för privatpersoner.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://lab.ak1nvestor.com",
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
