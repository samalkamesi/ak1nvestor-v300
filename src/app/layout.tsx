import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ak1a/theme-provider";
import { Ak1aStoreProvider } from "@/components/ak1a/store-provider";

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

export const metadata: Metadata = {
  title: "AK1A Research Lab — Från utbildning till inkomst | Ak1 Apex Nexus",
  description:
    "Sveriges enda institutionella metodik, byggd för privatpersoner. Djupare än en blogg. Ärligare än en bank. Snabbare än en utbildning. Pedagogisk finansanalys — inte investeringsråd.",
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
  },
  openGraph: {
    title: "AK1A Research Lab — Sveriges enda institutionella metodik för privatpersoner",
    description:
      "Djupare än en blogg. Ärligare än en bank. Snabbare än en utbildning. Håll know-how — redovisa generöst.",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Ak1aStoreProvider>
            {children}
            <Toaster />
          </Ak1aStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
