import "@/app/globals.css";
import {
  GlobaltSkal,
  spegelRotMetadata,
  globaltViewport,
} from "@/components/ak1a/globalt-skal";

/**
 * (en)-ROTLAYOUT (VÅG 85 — html-lang-massflyttet) — de 13 engelska
 * spegelrutternas dokumentägare.
 *
 * <html lang="en"> direkt i SSR-HTML (Google-språksignalen — VÅG 85:s mål;
 * tidigare sattes lang klientpost av f.d. src/app/en/layout.tsx inline-skript,
 * som nu är raderat). GlobaltSkal ger SpegelSprakLeverantor("en"),
 * spegel-JSON-LD, fonts, lazy-globaler. spegelRotMetadata("en") = gruppens
 * default-canonical mot /en (säkerhetsnät mot (huvud)-ärvning — KARTA §0).
 * URL:er oförändrade: sidorna ligger under (en)/en/** ⇒ /en/**.
 */
export const metadata = spegelRotMetadata("en");
export const viewport = globaltViewport;

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GlobaltSkal lang="en">{children}</GlobaltSkal>;
}
